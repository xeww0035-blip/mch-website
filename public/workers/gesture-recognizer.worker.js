self.importScripts(new URL('../mediapipe/vision_bundle.js', self.location.href).href);

const { FilesetResolver, GestureRecognizer } = self.Vision;

let recognizer = null;
const MODEL_CACHE_NAME = 'mch-gesture-model-v2';
const RUNTIME_CACHE_NAME = 'mch-gesture-runtime-v2';

function errorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

function postStage(stage, label) {
  self.postMessage({ type: 'LOAD_STAGE', stage, label });
}

async function readBinaryResponse(response, expectedSize, progressType) {
  const headerSize = Number(response.headers.get('content-length')) || 0;
  // Some mainland gateways remove Content-Length; GitHub Pages may also report
  // the compressed size while the stream exposes decompressed bytes. The
  // deployed task's known byte size keeps progress useful in both cases.
  const total = Math.max(expectedSize || 0, headerSize);
  if (!response.body) {
    const model = new Uint8Array(await response.arrayBuffer());
    self.postMessage({ type: progressType, loaded: model.byteLength, total: total || model.byteLength });
    return model;
  }

  const reader = response.body.getReader();
  const chunks = [];
  let loaded = 0;
  let lastPercent = -1;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.byteLength;
    const progressTotal = total || Math.max(loaded, 1);
    const percent = Math.min(100, Math.floor((loaded / progressTotal) * 100));
    // Avoid hundreds of React state updates from tiny proxy/network chunks.
    if (percent !== lastPercent) {
      lastPercent = percent;
      self.postMessage({ type: progressType, loaded, total: progressTotal });
    }
  }
  const model = new Uint8Array(loaded);
  let offset = 0;
  chunks.forEach((chunk) => {
    model.set(chunk, offset);
    offset += chunk.byteLength;
  });
  return model;
}

async function fetchModel(url, expectedSize) {
  let cache = null;
  try {
    if ('caches' in self) {
      cache = await caches.open(MODEL_CACHE_NAME);
      const cached = await cache.match(url);
      if (cached) {
        postStage('cache', '正在读取本机缓存');
        return await readBinaryResponse(cached, expectedSize, 'MODEL_PROGRESS');
      }
    }
  } catch {
    // Private browsing and some embedded WebViews disable CacheStorage. The
    // network path still works, so cache failure must never block recognition.
  }

  postStage('model', '正在并行下载模型与引擎');
  const response = await fetch(url, { cache: 'force-cache' });
  if (!response.ok) throw new Error(`Gesture model request failed: HTTP ${response.status}`);
  const cacheCopy = response.clone();
  const model = await readBinaryResponse(response, expectedSize, 'MODEL_PROGRESS');
  try {
    await cache?.put(url, cacheCopy);
  } catch {
    // Caching is an optimization only.
  }
  return model;
}

async function fetchRuntime(url) {
  const expectedSize = url.includes('_nosimd_') ? 10_960_242 : 11_756_954;
  let cache = null;
  try {
    if ('caches' in self) {
      cache = await caches.open(RUNTIME_CACHE_NAME);
      const cached = await cache.match(url);
      if (cached) return await readBinaryResponse(cached, expectedSize, 'RUNTIME_PROGRESS');
    }
  } catch {
    // Continue without persistent cache in restricted WebViews.
  }

  const response = await fetch(url, { cache: 'force-cache' });
  if (!response.ok) throw new Error(`Gesture runtime request failed: HTTP ${response.status}`);
  const cacheCopy = response.clone();
  const runtime = await readBinaryResponse(response, expectedSize, 'RUNTIME_PROGRESS');
  try {
    await cache?.put(url, cacheCopy);
  } catch {
    // Caching is an optimization only.
  }
  return runtime;
}

self.onmessage = async (event) => {
  const data = event.data;

  if (data.type === 'INIT') {
    try {
      postStage('prepare', '正在准备本地识别引擎');
      const vision = await FilesetResolver.forVisionTasks(data.wasmBaseUrl);
      // MediaPipe normally downloads its WASM only after the model. Fetch both
      // in parallel and pass the runtime through a local blob URL instead.
      const [modelAssetBuffer, runtimeBuffer] = await Promise.all([
        fetchModel(data.modelUrl, data.modelSize),
        fetchRuntime(vision.wasmBinaryPath),
      ]);
      postStage('runtime', '正在编译识别引擎');
      const runtimeUrl = URL.createObjectURL(new Blob([runtimeBuffer], { type: 'application/wasm' }));
      vision.wasmBinaryPath = runtimeUrl;
      try {
        recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetBuffer,
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numHands: data.numHands ?? 1,
          minHandDetectionConfidence: 0.55,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      } finally {
        URL.revokeObjectURL(runtimeUrl);
      }
      postStage('ready', '识别引擎已就绪');
      self.postMessage({ type: 'READY' });
    } catch (error) {
      self.postMessage({ type: 'ERROR', error: errorMessage(error, 'MediaPipe initialization failed') });
    }
    return;
  }

  if (data.type === 'CLOSE') {
    recognizer?.close();
    recognizer = null;
    self.close();
    return;
  }

  if (data.type !== 'DETECT_VIDEO') return;

  if (!recognizer) {
    data.bitmap.close();
    self.postMessage({ type: 'ERROR', error: 'Gesture Recognizer is not initialized' });
    return;
  }

  const startedAt = performance.now();
  try {
    const result = recognizer.recognizeForVideo(data.bitmap, data.timestampMs);
    self.postMessage({
      type: 'RESULT',
      inferenceTime: performance.now() - startedAt,
      result: {
        landmarks: result.landmarks.map((hand) => hand.map(({ x, y, z }) => ({ x, y, z }))),
        gestures: result.gestures.map((categories) => {
          const top = categories[0];
          return top ? { categoryName: top.categoryName, score: top.score } : null;
        }),
        handedness: result.handedness.map((categories) => categories[0]?.displayName ?? 'Unknown'),
      },
    });
  } catch (error) {
    self.postMessage({ type: 'ERROR', error: errorMessage(error, 'Recognition failed') });
  } finally {
    data.bitmap.close();
  }
};
