let textGenerator = null;
let textStreamer = null;
let loadingPromise = null;
let generationActive = false;

const MODEL_ID = 'onnx-community/SmolLM2-135M-Instruct-ONNX';
const MODEL_REVISION = 'b8a5c0f183b78c55955a5364f610c36668b5e681';
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

const SYSTEM_CONTEXT = `You are Autonexus AI, a small on-device helper for the Autonexus car website. Answer clearly and briefly. Explain how to use the site's car search, loan and mileage planners, resale guide, EV map links, environment simulator and guides, and local browser-only Pro tools. Do not claim the site performs live vehicle identification, government challan or insurance checks, service-history searches, payments, notifications, or cross-device sync. Simulated environment readings and sample costs are illustrative only. If asked for vehicle-specific facts or exact figures not present in the conversation, say you cannot verify them and direct the visitor to the official source links shown in the car profile. Do not invent current availability, prices, specs, policies, or citations. If a question is outside car discovery, ownership, the environment tools, or site navigation, say you are a limited Autonexus helper.`;

async function generate(messages, requestId) {
  if (generationActive) throw new Error('A response is already being generated.');
  generationActive = true;
  try {
    const generator = await loadModel();
    const history = Array.isArray(messages) ? messages.slice(-8).filter(item => item && ['user', 'assistant'].includes(item.role)) : [];
    const chat = [{ role: 'system', content: SYSTEM_CONTEXT }, ...history];
    const streamer = new textStreamer(generator.tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: token => send('token', { requestId, token })
    });
    await generator(chat, {
      max_new_tokens: 128,
      do_sample: true,
      temperature: 0.35,
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
    try { await generate(message.messages, message.requestId); }
    catch (error) { send('error', { requestId: message.requestId, message: error?.message || 'The response could not be generated.' }); }
  }
});
