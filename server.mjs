import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const firstPort = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';
const youtubeKey = process.env.YOUTUBE_API_KEY || '';
const mimeTypes = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.md': 'text/markdown; charset=utf-8' };
const channelCache = new Map();
const videoCache = new Map();

function sendJson(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
}

async function wikipediaCar(query) {
  const searchUrl = new URL('https://en.wikipedia.org/w/rest.php/v1/search/page');
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('limit', '1');
  const searchResponse = await fetch(searchUrl, { headers: { Accept: 'application/json' } });
  if (!searchResponse.ok) throw new Error('Wikipedia search is temporarily unavailable.');
  const searchData = await searchResponse.json();
  const title = searchData.pages?.[0]?.title;
  if (!title) return null;
  const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replaceAll(' ', '_'))}`;
  const summaryResponse = await fetch(summaryUrl, { headers: { Accept: 'application/json' } });
  if (!summaryResponse.ok) throw new Error('Wikipedia article could not be loaded.');
  const article = await summaryResponse.json();
  return {
    title: article.title || title,
    extract: article.extract || 'Open the article for more information.',
    url: article.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replaceAll(' ', '_'))}`
  };
}

async function getChannelId(handle) {
  const existing = channelCache.get(handle);
  if (existing && existing.expires > Date.now()) return existing.id;
  const url = new URL('https://www.googleapis.com/youtube/v3/channels');
  url.searchParams.set('part', 'id');
  url.searchParams.set('forHandle', handle);
  url.searchParams.set('key', youtubeKey);
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok || !data.items?.[0]?.id) throw new Error(data.error?.message || `Could not find the ${handle} YouTube channel.`);
  const id = data.items[0].id;
  channelCache.set(handle, { id, expires: Date.now() + 24 * 60 * 60 * 1000 });
  return id;
}

async function videosForChannel(query, handle, displayName) {
  const channelId = await getChannelId(handle);
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'video');
  url.searchParams.set('channelId', channelId);
  url.searchParams.set('q', `${query} car review`);
  url.searchParams.set('videoCaption', 'closedCaption');
  url.searchParams.set('maxResults', '3');
  url.searchParams.set('regionCode', 'IN');
  url.searchParams.set('safeSearch', 'moderate');
  url.searchParams.set('key', youtubeKey);
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || `Could not search ${displayName}.`);
  return (data.items || []).filter(item => item.id?.videoId).map(item => ({
    id: item.id.videoId,
    title: item.snippet?.title || `${query} review`,
    channel: item.snippet?.channelTitle || displayName,
    publishedAt: item.snippet?.publishedAt || '',
    thumbnail: item.snippet?.thumbnails?.maxres?.url || item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || `https://i.ytimg.com/vi/${encodeURIComponent(item.id.videoId)}/hqdefault.jpg`,
    watchUrl: `https://www.youtube.com/watch?v=${encodeURIComponent(item.id.videoId)}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(item.id.videoId)}?cc_load_policy=1`
  }));
}

async function youtubeVideos(query) {
  if (!youtubeKey) return { configured: false, videos: [] };
  const key = query.toLowerCase();
  const cached = videoCache.get(key);
  if (cached && cached.expires > Date.now()) return cached.data;
  const channels = [
    { handle: 'FasBeam', name: 'Faisal Khan' },
    { handle: 'motoroctane', name: 'MotorOctane' }
  ];
  const results = await Promise.all(channels.map(async channel => ({
    creator: channel.name,
    videos: await videosForChannel(query, channel.handle, channel.name)
  })));
  const data = { configured: true, videos: results.flatMap(group => group.videos.map(video => ({ ...video, creator: group.creator }))) };
  videoCache.set(key, { data, expires: Date.now() + 10 * 60 * 1000 });
  return data;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Only GET requests are supported.' });

  if (url.pathname === '/api/car') {
    const query = (url.searchParams.get('q') || '').trim().slice(0, 100);
    if (!query) return sendJson(res, 400, { error: 'Enter a car make or model to search.' });
    try {
      const car = await wikipediaCar(query);
      return sendJson(res, 200, { car });
    } catch (error) {
      return sendJson(res, 502, { error: error.message || 'Could not fetch the car overview.' });
    }
  }

  if (url.pathname === '/api/videos') {
    const query = (url.searchParams.get('q') || '').trim().slice(0, 100);
    if (!query) return sendJson(res, 400, { error: 'Enter a car make or model to search for videos.' });
    try {
      return sendJson(res, 200, await youtubeVideos(query));
    } catch (error) {
      return sendJson(res, 502, { configured: Boolean(youtubeKey), videos: [], error: error.message || 'Video search failed.' });
    }
  }

  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { return sendJson(res, 400, { error: 'Invalid file path.' }); }
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.resolve(root, relative);
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) return sendJson(res, 403, { error: 'Forbidden.' });
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('File not found.');
  }
});

function listenOnAvailablePort(port, attemptsLeft = 25) {
  const onError = error => {
    server.removeListener('listening', onListening);
    if (error.code === 'EADDRINUSE' && attemptsLeft > 0) {
      console.warn(`Port ${port} is already in use. Trying ${port + 1}…`);
      listenOnAvailablePort(port + 1, attemptsLeft - 1);
      return;
    }
    console.error(`Could not start Chassis on ${host}:${port}: ${error.message}`);
    console.error('Close the other server window or try again.');
    process.exitCode = 1;
  };
  const onListening = () => {
    server.removeListener('error', onError);
    console.log(`Chassis is ready at http://127.0.0.1:${port}`);
    console.log(youtubeKey ? 'YouTube captioned-video search is enabled.' : 'YouTube search is in link-only mode.');
    console.log('Leave this window open while you use the website. Press Ctrl+C here to stop it.');
  };
  server.once('error', onError);
  server.once('listening', onListening);
  server.listen(port, host);
}

listenOnAvailablePort(firstPort);
