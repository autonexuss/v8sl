let textGenerator = null;
let textStreamer = null;
let loadingPromise = null;
let generationActive = false;

const MODEL_ID = 'onnx-community/SmolLM2-360M-Instruct-ONNX';
const MODEL_REVISION = 'fe7c7db';
function send(type, detail = {}) {
  self.postMessage({ type, ...detail });
}

async function loadModel() {
  if (textGenerator) return textGenerator;
  if (loadingPromise) return loadingPromise;
  loadingPromise = (async () => {
    send('status', { message: 'Loading the free on-device AI…' });
    const { pipeline, TextStreamer, env } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1');
    env.allowLocalModels = false;
    textGenerator = await pipeline('text-generation', MODEL_ID, {
      dtype: 'q4',
      revision: MODEL_REVISION,
      progress_callback: event => {
        const progress = Number(event?.progress);
        send('progress', {
          status: event?.status || 'download',
          file: event?.file || '',
          progress: Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : null,
          loaded: Number(event?.loaded) || 0,
          total: Number(event?.total) || 0
        });
      }
    });
    textStreamer = TextStreamer;
    send('ready');
    return textGenerator;
  })();
  try {
    return await loadingPromise;
  } catch (error) {
    loadingPromise = null;
    textGenerator = null;
    throw error;
  }
}

const SYSTEM_CONTEXT = `You are Autonexus AI, a free on-device assistant for the Autonexus car website. Answer directly in clear, helpful language. You can explain site features and answer Indian-market car questions when the supplied vehicle context contains the needed facts. Treat that context as the only trusted source for exact specs: never fill gaps with guesses, and say when a detail is unavailable. Include the official source URL provided in the context when giving vehicle facts. Do not claim live browsing, live market prices, live vehicle identification, government challan or insurance checks, service-history searches, real payments, notifications, or cross-device sync. Simulator readings and sample costs are illustrative. The EV map opens a map provider; availability is not confirmed by this site. If a question is unrelated to cars or the site, say you are a focused Autonexus helper.`;

async function generate(messages, requestId, vehicleContext = '') {
  if (generationActive) throw new Error('A response is already being generated.');
  generationActive = true;
  try {
    const generator = await loadModel();
    const history = Array.isArray(messages) ? messages.slice(-8).filter(item => item && ['user', 'assistant'].includes(item.role)) : [];
    const context = String(vehicleContext || '').slice(0, 7000);
    const system = context ? `${SYSTEM_CONTEXT}\n\nRETRIEVED SITE DATA (use only when relevant):\n${context}` : SYSTEM_CONTEXT;
    const chat = [{ role: 'system', content: system }, ...history];
    const streamer = new textStreamer(generator.tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: token => send('token', { requestId, token })
    });
    await generator(chat, {
      max_new_tokens: 220,
      do_sample: true,
      temperature: 0.22,
      repetition_penalty: 1.08,
      streamer
    });
    send('complete', { requestId });
  } finally {
    generationActive = false;
  }
}

self.addEventListener('message', async event => {
  const message = event.data || {};
  if (message.type === 'load') {
    try { await loadModel(); }
    catch (error) { send('error', { message: error?.message || 'The model could not be loaded.' }); }
    return;
  }
  if (message.type === 'generate') {
    try { await generate(message.messages, message.requestId, message.vehicleContext); }
    catch (error) { send('error', { requestId: message.requestId, message: error?.message || 'The response could not be generated.' }); }
  }
});
