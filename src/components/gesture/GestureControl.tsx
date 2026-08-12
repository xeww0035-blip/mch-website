'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './GestureControl.module.css';

type Status = 'idle' | 'requesting' | 'loading' | 'active' | 'error';
type Landmark = { x: number; y: number; z: number };
type RecognitionResult = {
  landmarks: Landmark[][];
  gestures: ({ categoryName: string; score: number } | null)[];
  handedness: string[];
};
type WorkerMessage =
  | { type: 'READY' }
  | { type: 'MODEL_PROGRESS'; loaded: number; total: number }
  | { type: 'RESULT'; result: RecognitionResult; inferenceTime: number }
  | { type: 'ERROR'; error: string };

type GestureCopy = { title: string; action: string };

const PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const WASM_BASE_URL = `${PUBLIC_BASE_PATH}/mediapipe/wasm`;
// Same-origin hosting avoids the Google model endpoint, which can stall on
// mainland networks even when the GitHub Pages application itself loads.
const MODEL_URL = `${PUBLIC_BASE_PATH}/mediapipe/gesture_recognizer.task`;
const GESTURE_WORKER_URL = `${PUBLIC_BASE_PATH}/workers/gesture-recognizer.worker.js`;
const PINCH_DOWN = 0.055;
const PINCH_UP = 0.082;
const FRAME_INTERVAL = 66;
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
] as const;
const FINGER_TIPS = new Set([4, 8, 12, 16, 20]);
const GESTURE_COPY: Record<string, GestureCopy> = {
  No_Hand: { title: '未检测到手', action: '请让一只完整的手进入画面' },
  Pointing: { title: '食指移动', action: '食指尖正在控制虚拟光标' },
  Pointing_Up: { title: '食指指向', action: '移动食指控制虚拟光标' },
  Pinch: { title: '捏合', action: '指向目标后捏合，漫游角色朝对应方向前进' },
  Drag: { title: '正在拖拽', action: '保持捏合移动；漫游时控制视角' },
  Swipe_Up: { title: '向上挥手', action: '页面下滑；漫游时向前移动' },
  Swipe_Down: { title: '向下挥手', action: '页面上滑；漫游时向后移动' },
  Page_Down_Pose: { title: '向下翻页', action: '动作已匹配，正在进入下一屏' },
  Open_Palm: { title: '张开手掌', action: '保持 0.75 秒释放、返回或退出漫游' },
  Closed_Fist: { title: '握拳前进', action: '漫游时保持握拳，沿当前视角持续前进' },
  Thumb_Up: { title: '竖起拇指', action: '动作已识别，当前未绑定操作' },
  Thumb_Down: { title: '拇指向下', action: '动作已识别，当前未绑定操作' },
  Victory: { title: '胜利手势', action: '动作已识别，当前未绑定操作' },
  ILoveYou: { title: 'I Love You', action: '动作已识别，当前未绑定操作' },
};

function gestureCopy(name: string): GestureCopy {
  return GESTURE_COPY[name] ?? { title: name.replaceAll('_', ' '), action: '动作已识别，当前未绑定操作' };
}

function drawHandSkeleton(canvas: HTMLCanvasElement | null, hands: Landmark[][], handedness: string[]) {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rect.width * ratio));
  const height = Math.max(1, Math.round(rect.height * ratio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const context = canvas.getContext('2d');
  if (!context) return;
  context.clearRect(0, 0, width, height);
  context.lineCap = 'round';
  context.lineJoin = 'round';

  hands.forEach((hand, handIndex) => {
    if (hand.length < 21) return;
    const point = (index: number) => ({ x: (1 - hand[index].x) * width, y: hand[index].y * height });

    context.fillStyle = 'rgba(182, 75, 69, 0.12)';
    context.beginPath();
    [0, 5, 9, 13, 17].forEach((index, order) => {
      const current = point(index);
      if (order === 0) context.moveTo(current.x, current.y);
      else context.lineTo(current.x, current.y);
    });
    context.closePath();
    context.fill();

    context.strokeStyle = 'rgba(241, 240, 235, 0.9)';
    context.lineWidth = 1.6 * ratio;
    HAND_CONNECTIONS.forEach(([from, to]) => {
      const start = point(from);
      const end = point(to);
      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
      context.stroke();
    });

    hand.forEach((_, index) => {
      const current = point(index);
      const isTip = FINGER_TIPS.has(index);
      context.beginPath();
      context.arc(current.x, current.y, (isTip ? 3.8 : 2.2) * ratio, 0, Math.PI * 2);
      context.fillStyle = isTip ? '#d45b52' : '#f1f0eb';
      context.fill();
      context.strokeStyle = 'rgba(17, 17, 17, 0.78)';
      context.lineWidth = ratio;
      context.stroke();
    });

    const wrist = point(0);
    context.fillStyle = 'rgba(17, 17, 17, 0.76)';
    context.fillRect(wrist.x + 9 * ratio, wrist.y + 8 * ratio, 54 * ratio, 15 * ratio);
    context.fillStyle = '#f1f0eb';
    context.font = `${7 * ratio}px monospace`;
    context.fillText((handedness[handIndex] || 'HAND').toUpperCase(), wrist.x + 14 * ratio, wrist.y + 18.5 * ratio);
  });
}

function distance(a: Landmark, b: Landmark) {
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z - b.z) * 0.35);
}

function fingerIsExtended(hand: Landmark[], tip: number, pip: number, mcp: number, palmScale: number) {
  const verticalRise = (hand[pip].y - hand[tip].y) / palmScale;
  const reach = distance(hand[tip], hand[mcp]) / Math.max(distance(hand[pip], hand[mcp]), 0.001);
  return verticalRise > 0.16 && reach > 1.45;
}

function isPageDownPose(hand: Landmark[]) {
  if (hand.length < 21) return false;
  const palmScale = Math.max(distance(hand[5], hand[17]), 0.05);
  const indexUp = fingerIsExtended(hand, 8, 6, 5, palmScale);
  const middleUp = fingerIsExtended(hand, 12, 10, 9, palmScale);
  const ringUp = fingerIsExtended(hand, 16, 14, 13, palmScale);
  const pinkyUp = fingerIsExtended(hand, 20, 18, 17, palmScale);
  const fingersSeparated = distance(hand[8], hand[12]) > palmScale * 0.12;
  return indexUp && middleUp && !ringUp && !pinkyUp && fingersSeparated;
}

function dispatchPointer(target: Element | null, type: string, x: number, y: number) {
  target?.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 88, pointerType: 'pen', isPrimary: true, button: 0, buttons: type === 'pointerup' ? 0 : 1 }));
}

export function GestureControl() {
  const [status, setStatus] = useState<Status>('idle');
  const [gestureLabel, setGestureLabel] = useState('No_Hand');
  const [gestureConfidence, setGestureConfidence] = useState(0);
  const [inference, setInference] = useState(0);
  const [modelProgress, setModelProgress] = useState(0);
  const [error, setError] = useState('');
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const skeletonRef = useRef<HTMLCanvasElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const workerRetryRef = useRef(0);
  const workerInitTimerRef = useRef<number | null>(null);
  const rafRef = useRef(0);
  const workerReadyRef = useRef(false);
  const framePendingRef = useRef(false);
  const lastFrameRef = useRef(0);
  const pointRef = useRef({ x: 0, y: 0 });
  const pinchRef = useRef({ active: false, startedAt: 0, startX: 0, startY: 0, target: null as Element | null, dragged: false });
  const swipeRef = useRef<{ y: number; time: number }[]>([]);
  const lastSwipeAtRef = useRef(0);
  const pageDownPoseRef = useRef({ startedAt: 0, fired: false });
  const openPalmRef = useRef({ startedAt: 0, startX: 0, startY: 0, fired: false });
  const stoppedRef = useRef(false);

  const releasePointer = useCallback(() => {
    const pinch = pinchRef.current;
    if (!pinch.active) return;
    dispatchPointer(pinch.target, 'pointerup', pointRef.current.x, pointRef.current.y);
    pinch.active = false;
    pinch.dragged = false;
    pinch.target = null;
    cursorRef.current?.classList.remove(styles.pinching);
    window.dispatchEvent(new CustomEvent('mch:gesture-pinch-end'));
  }, []);

  const scrollPage = useCallback((direction: 'up' | 'down') => {
    if (window.location.pathname.endsWith('/world-test') && !document.body.classList.contains('world-test-exploring')) {
      router.push('/#works');
      return;
    }
    if (window.location.pathname === '/' && direction === 'up' && window.scrollY < window.innerHeight * 0.3) {
      document.querySelector('#works')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      return;
    }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const distance = window.innerHeight * 0.78 * (direction === 'up' ? 1 : -1);
    window.scrollBy({ top: distance, behavior: reducedMotion ? 'auto' : 'smooth' });
    window.dispatchEvent(new CustomEvent('mch:gesture-swipe', { detail: { direction } }));
    setGestureLabel(direction === 'up' ? 'Swipe_Up' : 'Swipe_Down');
  }, [router]);

  const stop = useCallback((nextStatus: Status = 'idle') => {
    stoppedRef.current = true;
    cancelAnimationFrame(rafRef.current);
    releasePointer();
    workerReadyRef.current = false;
    framePendingRef.current = false;
    if (workerInitTimerRef.current !== null) window.clearTimeout(workerInitTimerRef.current);
    workerInitTimerRef.current = null;
    workerRef.current?.postMessage({ type: 'CLOSE' });
    workerRef.current?.terminate();
    workerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    document.body.classList.remove('gesture-control-active');
    cursorRef.current?.classList.remove(styles.visible, styles.pinching);
    window.dispatchEvent(new CustomEvent('mch:gesture-leave'));
    drawHandSkeleton(skeletonRef.current, [], []);
    setGestureLabel('No_Hand');
    setGestureConfidence(0);
    pageDownPoseRef.current = { startedAt: 0, fired: false };
    setStatus(nextStatus);
  }, [releasePointer]);

  const handleResult = useCallback((result: RecognitionResult, inferenceTime: number) => {
    framePendingRef.current = false;
    setInference(Math.round(inferenceTime));
    const hand = result.landmarks[0];
    const topGesture = result.gestures[0];
    drawHandSkeleton(skeletonRef.current, result.landmarks, result.handedness);
    if (!hand || hand.length < 9) {
      cursorRef.current?.classList.remove(styles.visible);
      window.dispatchEvent(new CustomEvent('mch:gesture-leave'));
      swipeRef.current = [];
      setGestureLabel('No_Hand');
      setGestureConfidence(0);
      pageDownPoseRef.current = { startedAt: 0, fired: false };
      releasePointer();
      return;
    }

    const indexTip = hand[8];
    const thumbTip = hand[4];
    const targetX = (1 - indexTip.x) * window.innerWidth;
    const targetY = indexTip.y * window.innerHeight;
    const point = pointRef.current;
    point.x += (targetX - point.x) * 0.36;
    point.y += (targetY - point.y) * 0.36;
    const cursor = cursorRef.current;
    if (cursor) {
      cursor.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
      cursor.classList.add(styles.visible);
    }

    const pinchDistance = distance(indexTip, thumbTip);
    const pinch = pinchRef.current;
    const now = performance.now();
    const isPinching = pinch.active ? pinchDistance < PINCH_UP : pinchDistance < PINCH_DOWN;
    const gestureName = topGesture && topGesture.score > 0.5 ? topGesture.categoryName : 'Pointing';
    setGestureLabel(isPinching ? (pinch.dragged ? 'Drag' : 'Pinch') : gestureName);
    setGestureConfidence(Math.round((topGesture?.score ?? 0) * 100));
    window.dispatchEvent(new CustomEvent('mch:gesture-pointer', { detail: { x: point.x / window.innerWidth, y: point.y / window.innerHeight, pinching: isPinching, gesture: gestureName } }));

    if (isPinching && !pinch.active) {
      const target = document.elementFromPoint(point.x, point.y);
      pinch.active = true;
      pinch.startedAt = now;
      pinch.startX = point.x;
      pinch.startY = point.y;
      pinch.target = target;
      pinch.dragged = false;
      dispatchPointer(target, 'pointerdown', point.x, point.y);
      cursor?.classList.add(styles.pinching);
      window.dispatchEvent(new CustomEvent('mch:gesture-pinch-start', { detail: { x: point.x, y: point.y } }));
    } else if (isPinching && pinch.active) {
      if (Math.hypot(point.x - pinch.startX, point.y - pinch.startY) > 20 || now - pinch.startedAt > 320) pinch.dragged = true;
      dispatchPointer(pinch.target, 'pointermove', point.x, point.y);
    } else if (!isPinching && pinch.active) {
      const target = pinch.target;
      const shouldClick = !pinch.dragged && now - pinch.startedAt < 650;
      releasePointer();
      if (shouldClick && target instanceof HTMLElement && !target.closest('[data-mouse-only]')) target.click();
    }

    const palm = hand[0];
    const palmX = 1 - palm.x;
    const palmY = palm.y;
    const canSwipe = gestureName === 'Open_Palm' && Boolean(topGesture && topGesture.score > 0.55);
    if (!isPinching && canSwipe) {
      const samples = swipeRef.current;
      samples.push({ y: palmY, time: now });
      while (samples.length && now - samples[0].time > 460) samples.shift();
      const first = samples[0];
      if (first && now - first.time > 120 && now - lastSwipeAtRef.current > 760) {
        const dy = palmY - first.y;
        if (Math.abs(dy) > 0.18) {
          lastSwipeAtRef.current = now;
          scrollPage(dy < 0 ? 'up' : 'down');
          swipeRef.current = [];
        }
      }
    } else {
      swipeRef.current = [];
    }

    const pageDownPose = !isPinching && isPageDownPose(hand);
    if (pageDownPose) {
      setGestureLabel('Page_Down_Pose');
      if (!pageDownPoseRef.current.fired) {
        pageDownPoseRef.current.fired = true;
        lastSwipeAtRef.current = now;
        setGestureLabel('Page_Down_Pose');
        window.dispatchEvent(new CustomEvent('mch:gesture-page-down'));
        // The Alpine world is a focused landing scene. The first page-down
        // pose leaves it for the selected-work index; subsequent poses on the
        // home page continue the normal editorial scroll sequence.
        if (window.location.pathname.endsWith('/world-test') && !document.body.classList.contains('world-test-exploring')) {
          router.push('/#works');
        } else if (!window.location.pathname.endsWith('/world-test')) {
          scrollPage('up');
        }
      }
    } else {
      pageDownPoseRef.current = { startedAt: 0, fired: false };
    }

    if (gestureName === 'Open_Palm' && topGesture && topGesture.score > 0.58 && now - lastSwipeAtRef.current > 1400) {
      const openPalm = openPalmRef.current;
      if (!openPalm.startedAt) openPalmRef.current = { startedAt: now, startX: palmX, startY: palmY, fired: false };
      else if (Math.hypot(palmX - openPalm.startX, palmY - openPalm.startY) > 0.065) {
        openPalmRef.current = { startedAt: now, startX: palmX, startY: palmY, fired: false };
      }
      if (!openPalmRef.current.fired && now - openPalmRef.current.startedAt > 750) {
        openPalmRef.current.fired = true;
        releasePointer();
        window.dispatchEvent(new CustomEvent('mch:gesture-open-palm'));
        if (window.location.pathname.includes('/knowledge')) router.back();
        else if (window.location.pathname.endsWith('/world-test') && !document.body.classList.contains('world-test-exploring')) router.push('/');
        else if (!document.body.classList.contains('world-test-exploring')) window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
    } else {
      openPalmRef.current = { startedAt: 0, startX: 0, startY: 0, fired: false };
    }
  }, [releasePointer, router, scrollPage]);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
      setError('Hand Control 需要 HTTPS 或 localhost，并要求浏览器支持 webcam。');
      setStatus('error');
      return;
    }
    setError('');
    setModelProgress(0);
    setStatus('requesting');
    stoppedRef.current = false;
    workerRetryRef.current = 0;
    try {
      const mobileCapture = navigator.maxTouchPoints > 0 || window.innerWidth <= 768;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: mobileCapture ? 480 : 640 },
          height: { ideal: mobileCapture ? 360 : 480 },
          frameRate: { ideal: mobileCapture ? 24 : 30, max: 30 },
        },
      });
      if (stoppedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      let video = videoRef.current;
      for (let frame = 0; !video && frame < 3; frame += 1) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        video = videoRef.current;
      }
      if (!video) throw new Error('Camera preview is unavailable');
      video.srcObject = stream;
      await video.play();
      setStatus('loading');
      document.body.classList.add('gesture-control-active');

      const bootWorker = () => {
        if (stoppedRef.current) return;
        workerReadyRef.current = false;
        framePendingRef.current = false;
        setStatus('loading');

        const worker = new Worker(GESTURE_WORKER_URL, { name: 'mch-gesture-recognizer' });
        workerRef.current = worker;

        const failWorker = (reason: string) => {
          if (workerRef.current !== worker || stoppedRef.current) return;
          if (workerInitTimerRef.current !== null) window.clearTimeout(workerInitTimerRef.current);
          workerInitTimerRef.current = null;
          worker.terminate();
          workerRef.current = null;
          workerReadyRef.current = false;
          framePendingRef.current = false;
          console.error('[GestureControl] worker failed', reason);

          if (workerRetryRef.current < 1) {
            workerRetryRef.current += 1;
            setError('手势识别线程启动失败，正在自动重试…');
            window.setTimeout(bootWorker, 350);
            return;
          }

          setError(`手势识别启动失败：${reason}。请刷新页面后重试。`);
          stop('error');
        };

        worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
          if (workerRef.current !== worker) return;
          const message = event.data;
          if (message.type === 'READY') {
            if (workerInitTimerRef.current !== null) window.clearTimeout(workerInitTimerRef.current);
            workerInitTimerRef.current = null;
            workerRetryRef.current = 0;
            workerReadyRef.current = true;
            setError('');
            setModelProgress(100);
            setStatus('active');
          } else if (message.type === 'MODEL_PROGRESS') {
            if (message.total > 0) setModelProgress(Math.min(99, Math.round((message.loaded / message.total) * 100)));
          } else if (message.type === 'RESULT') {
            handleResult(message.result, message.inferenceTime);
          } else if (message.type === 'ERROR') {
            failWorker(message.error);
          }
        };
        worker.onerror = (event) => {
          event.preventDefault();
          const location = event.filename ? ` (${event.filename}:${event.lineno || 0})` : '';
          failWorker(`${event.message || 'Worker 脚本加载异常'}${location}`);
        };
        worker.onmessageerror = () => failWorker('Worker 返回了无法读取的数据');
        worker.postMessage({ type: 'INIT', wasmBaseUrl: WASM_BASE_URL, modelUrl: MODEL_URL, numHands: 1 });
        workerInitTimerRef.current = window.setTimeout(() => failWorker('识别模型加载超过 60 秒，请检查当前网络后重试'), 60_000);
      };

      bootWorker();

      const detect = async (time: number) => {
        if (stoppedRef.current) return;
        rafRef.current = requestAnimationFrame(detect);
        const frameInterval = mobileCapture ? 100 : FRAME_INTERVAL;
        if (!workerReadyRef.current || framePendingRef.current || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || time - lastFrameRef.current < frameInterval) return;
        lastFrameRef.current = time;
        framePendingRef.current = true;
        try {
          let bitmap: ImageBitmap;
          try {
            bitmap = await createImageBitmap(video);
          } catch {
            // Some iOS/WKWebView builds expose createImageBitmap but reject a
            // video source. Drawing to a canvas first keeps worker inference.
            const canvas = captureCanvasRef.current ?? document.createElement('canvas');
            captureCanvasRef.current = canvas;
            canvas.width = video.videoWidth || (mobileCapture ? 480 : 640);
            canvas.height = video.videoHeight || (mobileCapture ? 360 : 480);
            const context = canvas.getContext('2d', { alpha: false });
            if (!context) throw new Error('Camera frame capture is unavailable');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            bitmap = await createImageBitmap(canvas);
          }
          if (stoppedRef.current || !workerRef.current) {
            bitmap.close();
            framePendingRef.current = false;
            return;
          }
          workerRef.current.postMessage({ type: 'DETECT_VIDEO', bitmap, timestampMs: performance.now() }, [bitmap]);
        } catch {
          framePendingRef.current = false;
        }
      };
      rafRef.current = requestAnimationFrame(detect);
    } catch (caught) {
      setError(caught instanceof DOMException && caught.name === 'NotAllowedError' ? '摄像头权限被拒绝。请在浏览器设置中允许后重试。' : caught instanceof Error ? caught.message : '无法启动摄像头');
      stop('error');
    }
  }, [handleResult, stop]);

  useEffect(() => () => stop('idle'), [stop]);

  const currentGesture = gestureCopy(gestureLabel);

  return (
    <div className={styles.root} data-gesture-ui>
      <button className={`${styles.toggle} ${status === 'active' ? styles.toggleActive : ''}`} type="button" onClick={status === 'idle' || status === 'error' ? start : () => stop('idle')} aria-pressed={status === 'active'}>
        <span className={styles.signal} />
        {status === 'idle' || status === 'error' ? 'Hand Control' : status === 'requesting' ? 'Camera permission…' : status === 'loading' ? `Loading model ${modelProgress || 0}%` : 'Stop Hand Control'}
      </button>

      {(status === 'requesting' || status === 'loading' || status === 'active') && (
        <div className={styles.panel}>
          <div className={styles.preview}>
            <video ref={videoRef} muted playsInline aria-hidden="true" />
            <canvas ref={skeletonRef} className={styles.skeleton} aria-hidden="true" />
            <span>CAM / FRONT</span>
            <i className={styles.trackingState}>{status === 'active' ? '● TRACKING' : '○ INITIALIZING'}</i>
          </div>
          <div className={styles.readout}>
            <div>
              <small>当前动作 / GESTURE</small>
              <strong aria-live="polite">{status === 'active' ? currentGesture.title : '正在加载识别模型'}</strong>
              <p>{status === 'active' ? currentGesture.action : `模型正在从本站加载，不连接 Google；当前 ${modelProgress || 0}%`}</p>
            </div>
            <span>{status === 'active' ? `${gestureConfidence}% · ${inference} MS` : status.toUpperCase()}</span>
          </div>
          <div className={styles.legend} aria-label="手势操作说明">
            <div><b>01</b><strong>食指移动</strong><span>控制光标</span></div>
            <div><b>02</b><strong>双指捏合</strong><span>指向 / 前进</span></div>
            <div><b>03</b><strong>捏合移动</strong><span>拖拽 / 转向</span></div>
            <div><b>04</b><strong>保持握拳</strong><span>漫游前进</span></div>
            <div><b>05</b><strong>双指展开</strong><span>向下翻页</span></div>
            <div><b>06</b><strong>张掌停留</strong><span>释放 / 返回</span></div>
          </div>
        </div>
      )}

      {error && <div className={styles.error} role="alert">{error}</div>}
      <div ref={cursorRef} className={styles.cursor} aria-hidden="true"><span /></div>
    </div>
  );
}
