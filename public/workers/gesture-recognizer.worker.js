self.importScripts(new URL('../mediapipe/vision_bundle.js', self.location.href).href);

const { FilesetResolver, GestureRecognizer } = self.Vision;

let recognizer = null;

function errorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

async function fetchModel(url) {
  const response = await fetch(url, { cache: 'force-cache' });
  if (!response.ok) throw new Error(`Gesture model request failed: HTTP ${response.status}`);
  const total = Number(response.headers.get('content-length')) || 0;
  if (!response.body) return new Uint8Array(await response.arrayBuffer());

  const reader = response.body.getReader();
  const chunks = [];
  let loaded = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.byteLength;
    self.postMessage({ type: 'MODEL_PROGRESS', loaded, total });
  }
  const model = new Uint8Array(loaded);
  let offset = 0;
  chunks.forEach((chunk) => {
    model.set(chunk, offset);
    offset += chunk.byteLength;
  });
  return model;
}

self.onmessage = async (event) => {
  const data = event.data;

  if (data.type === 'INIT') {
    try {
      const vision = await FilesetResolver.forVisionTasks(data.wasmBaseUrl);
      const modelAssetBuffer = await fetchModel(data.modelUrl);
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
