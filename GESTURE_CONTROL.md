# Gesture Control Module

## Architecture

- `src/components/gesture/GestureControl.tsx`
  - Requests and owns the webcam `MediaStream`.
  - Captures `ImageBitmap` frames at roughly 15 FPS.
  - Transfers frames to the worker instead of running recognition beside Three.js.
  - Converts landmarks and gestures into pointer, click, drag, swipe and open-palm actions.
  - Draws the 21 MediaPipe hand landmarks and their connections on a lightweight Canvas overlay.
  - Shows the current gesture, confidence, inference time and a Chinese explanation of the action it triggers.
- `public/workers/gesture-recognizer.worker.js`
  - Initializes `@mediapipe/tasks-vision` and the official Gesture Recognizer model.
  - Uses the package's classic browser bundle with `importScripts`, which is required by the MediaPipe 1.0.1 WASM loader.
  - Has a stable public URL and is not coupled to Next.js/Webpack development chunk IDs.
  - Loads the MediaPipe bundle and SIMD/non-SIMD WASM glue from `public/mediapipe`, avoiding cross-origin `importScripts` restrictions in embedded browsers.
  - Runs `recognizeForVideo()` in `VIDEO` mode.
  - Closes every transferred `ImageBitmap` after inference.
  - Returns a small serializable result instead of the entire MediaPipe object graph.

## Controls

- Index finger: virtual cursor.
- Thumb + index pinch: pointer down / click.
- Pinch hold + movement: pointer drag.
- Open-palm swipe up/down: scroll roughly one viewport down/up.
- Custom page-down pose (index + middle extended, ring + pinky folded): move to the next screen on the first matching frame. The pose remains latched until the hand changes, preventing repeated page turns while it is held. This is derived directly from landmarks because the stock model may return `None` for the pose.
- Open Palm hold: release active pointer; return from Knowledge or scroll to the world on Home.

The preview includes a persistent six-action legend. Vertical swipe detection follows the wrist instead of the index fingertip and requires an open palm, so cursor movement does not accidentally scroll the page. Horizontal swipe navigation is intentionally disabled. Recognized but currently unbound MediaPipe gestures are identified explicitly instead of implying that they trigger a site action.

## Three.js integration events

The module emits browser events so the world can add camera/building controls without importing MediaPipe:

- `mch:gesture-pointer` — `{ x, y, pinching, gesture }`, normalized viewport coordinates.
- `mch:gesture-pinch-start` — `{ x, y }`, viewport coordinates.
- `mch:gesture-pinch-end`.
- `mch:gesture-swipe` — `{ direction }`, vertical page movement only.
- `mch:gesture-leave` — clears any active world hover when the hand exits the camera.
- `mch:gesture-open-palm`.
- `mch:gesture-page-down`.

The world consumes the normalized pointer event with a Three.js raycaster. Pointing at a building applies a high-contrast material state and synchronizes its HTML label; pinching the building opens its linked section. The synthetic pointer events also preserve interaction with the HTML landmark buttons.

## Lifecycle and privacy

- No camera permission is requested before the user clicks `Hand Control`.
- Video frames stay inside the browser and are not uploaded.
- Stop closes the animation frame loop, worker, video element and every MediaStream track.
- A transient worker script/runtime failure is retried once without asking for camera permission again. Initialization has a 20-second timeout and surfaces the actual worker error location instead of a generic crash message.
- If permission resolves after the user has already cancelled, the returned stream is immediately stopped.
- The front-facing camera is requested on mobile using `facingMode: user`.
- Webcam access requires HTTPS or localhost.

## MediaPipe resources

- Runtime JS/WASM: same-origin assets copied from `@mediapipe/tasks-vision@1.0.1`; loaded lazily after opt-in.
- Model: official float16 `gesture_recognizer.task`, stored at `public/mediapipe/gesture_recognizer.task` and loaded from the same origin. Runtime recognition no longer depends on `storage.googleapis.com`, which avoids model-startup stalls on mainland networks.
- Recognition delegate: CPU inside the worker to avoid competing with the Three.js WebGL context.
