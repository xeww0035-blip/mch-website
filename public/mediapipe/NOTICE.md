# MediaPipe browser assets

These files are copied from `@mediapipe/tasks-vision@1.0.1` so the gesture worker can load its JavaScript and WebAssembly from the same origin as the site.

MediaPipe is provided by Google under the Apache License 2.0. Package source: <https://www.npmjs.com/package/@mediapipe/tasks-vision>.

Only the classic SIMD and non-SIMD runtime variants used by `FilesetResolver.forVisionTasks()` are included. They are loaded lazily after the user enables Hand Control.
