'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

type Props = {
  reducedMotion: boolean;
};

type GesturePointerDetail = {
  x: number;
  y: number;
  pinching: boolean;
  gesture: string;
};

// Keep the eye only 0.7m above the authored snow plane. The low, slightly
// downward view makes cabins, trees, and snow banks feel full-scale without
// adding a character model or changing the Blender assets.
const WALK_EYE_HEIGHT = 3.76;
const EYE_CLEARANCE = 0.71;
const WALK_START = new THREE.Vector3(0, WALK_EYE_HEIGHT, 28.5);
const WALK_LOOK_AT = new THREE.Vector3(0, 3.3, 20.5);
const WORLD_UP = new THREE.Vector3(0, 1, 0);
const DOWN = new THREE.Vector3(0, -1, 0);
const GROUND_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), -3.05);
const WALK_OBSTACLES = [
  { x: -3.92, z: 19.06, radius: 1.9 }, { x: 3.49, z: 22.57, radius: 1.9 },
  { x: 2.93, z: 21.41, radius: 1.75 }, { x: 5.22, z: 20.99, radius: 1.8 },
  { x: -5.23, z: 18.01, radius: 1.85 }, { x: -3.96, z: 16.72, radius: 1.7 },
  { x: 2.78, z: 14.8, radius: 1.65 }, { x: 2.45, z: 14.05, radius: 1.6 },
  { x: -6.26, z: 17.71, radius: 1.75 }, { x: -6.02, z: 16.85, radius: 1.7 },
  { x: 5.82, z: 16.14, radius: 1.85 }, { x: 5, z: 16.91, radius: 1.75 },
  { x: 4.12, z: 18.15, radius: 1.7 }, { x: 3.42, z: 17.78, radius: 1.65 },
  { x: -5.95, z: 18.95, radius: 1.75 }, { x: -7.35, z: 16.09, radius: 1.7 },
  { x: -7.11, z: 14.44, radius: 1.7 },
  { x: -2.3, z: 23.2, radius: 2.7 },
] as const;

function isWalkableTerrain(object: THREE.Object3D): object is THREE.Mesh {
  if (!(object instanceof THREE.Mesh)) return false;
  const name = object.name.replace(/[^a-zA-Z0-9_]/g, '');
  return name === 'Landscape' || name === 'Landscape003' || name === 'Landscape004' || name === 'Landscape_plane';
}

function constrainToWorld(position: THREE.Vector3) {
  // Bounds come from the original Blender Landscape.003 / Landscape.004
  // surfaces after the Z-up to Y-up conversion. This opens the whole authored
  // foreground instead of limiting the walk to the near side of the lake.
  position.x = THREE.MathUtils.clamp(position.x, -10.9, 14.1);
  position.z = THREE.MathUtils.clamp(position.z, 0.4, 28.8);

  // Block only the actual trunks and cabin walls. The previous canopy-sized
  // circles overlapped into an invisible wall between the start and the lake.
  for (let pass = 0; pass < 2; pass += 1) {
    WALK_OBSTACLES.forEach((obstacle) => {
      const deltaX = position.x - obstacle.x;
      const deltaZ = position.z - obstacle.z;
      const distance = Math.hypot(deltaX, deltaZ);
      const safeRadius = obstacle.radius >= 2.5 ? 2.15 : Math.max(0.46, obstacle.radius * 0.28);
      if (distance >= safeRadius) return;
      const safeDistance = Math.max(distance, 0.001);
      position.x = obstacle.x + (deltaX / safeDistance) * safeRadius;
      position.z = obstacle.z + (deltaZ / safeDistance) * safeRadius;
    });
  }

  position.x = THREE.MathUtils.clamp(position.x, -10.9, 14.1);
  position.z = THREE.MathUtils.clamp(position.z, 0.4, 28.8);
}

export function WorldWalkControls({ reducedMotion }: Props) {
  const { camera, gl, scene } = useThree();
  const keys = useRef(new Set<string>());
  const velocity = useRef(new THREE.Vector3());
  const destination = useRef<THREE.Vector3 | null>(null);
  const yaw = useRef(0);
  const pitch = useRef(-0.057);
  const step = useRef(0);
  const transition = useRef({
    elapsed: reducedMotion ? 1 : 0,
    fromPosition: camera.position.clone(),
    fromQuaternion: camera.quaternion.clone(),
  });
  const drag = useRef({ active: false, moved: false, pointerId: -1, x: 0, y: 0 });
  const gestureDrag = useRef({ active: false, moved: false, startX: 0.5, startY: 0.5, x: 0.5, y: 0.5 });
  const fistForward = useRef(false);
  const raycaster = useRef(new THREE.Raycaster());
  const groundRaycaster = useRef(new THREE.Raycaster());
  const terrainMeshes = useRef<THREE.Mesh[]>([]);
  const pointer = useRef(new THREE.Vector2());
  const planeHit = useRef(new THREE.Vector3());
  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const input = useRef(new THREE.Vector3());
  const desiredVelocity = useRef(new THREE.Vector3());
  const targetQuaternion = useRef(new THREE.Quaternion());
  const groundProbe = useRef(new THREE.Vector3());
  const lastGroundProbe = useRef(new THREE.Vector2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY));
  const targetEyeHeight = useRef(WALK_EYE_HEIGHT);

  useEffect(() => {
    const lookMatrix = new THREE.Matrix4().lookAt(WALK_START, WALK_LOOK_AT, WORLD_UP);
    targetQuaternion.current.setFromRotationMatrix(lookMatrix);
    const canvas = gl.domElement;
    canvas.style.cursor = 'crosshair';

    const collectTerrainMeshes = () => {
      const meshes: THREE.Mesh[] = [];
      scene.traverse((object) => {
        if (isWalkableTerrain(object)) meshes.push(object);
      });
      terrainMeshes.current = meshes;
    };
    collectTerrainMeshes();

    const setWalkDestination = (normalizedX: number, normalizedY: number) => {
      pointer.current.set(normalizedX * 2 - 1, -(normalizedY * 2 - 1));
      raycaster.current.setFromCamera(pointer.current, camera);
      const terrainHit = raycaster.current.intersectObjects(terrainMeshes.current, false)[0];
      const point = terrainHit?.point ?? raycaster.current.ray.intersectPlane(GROUND_PLANE, planeHit.current);
      if (!point) return;
      const next = point.clone();
      const travel = next.clone().sub(camera.position).setY(0);
      if (travel.length() > 2.2) travel.setLength(2.2);
      next.copy(camera.position).add(travel);
      constrainToWorld(next);
      destination.current = next;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(key)) {
        event.preventDefault();
        keys.current.add(key);
        destination.current = null;
      }
    };
    const onKeyUp = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase());
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerId === 88 && event.pointerType === 'pen') return;
      if (event.button !== 0) return;
      drag.current = { active: true, moved: false, pointerId: event.pointerId, x: event.clientX, y: event.clientY };
      try { canvas.setPointerCapture(event.pointerId); } catch { /* Pointer capture is optional. */ }
      canvas.style.cursor = 'grabbing';
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId === 88 && event.pointerType === 'pen') return;
      if (!drag.current.active) return;
      const deltaX = event.clientX - drag.current.x;
      const deltaY = event.clientY - drag.current.y;
      if (Math.abs(deltaX) + Math.abs(deltaY) > 2) drag.current.moved = true;
      drag.current.x = event.clientX;
      drag.current.y = event.clientY;
      yaw.current = THREE.MathUtils.clamp(yaw.current - deltaX * 0.0032, -Math.PI, Math.PI);
      pitch.current = THREE.MathUtils.clamp(pitch.current - deltaY * 0.0023, -0.28, 0.16);
    };
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId === 88 && event.pointerType === 'pen') return;
      if (!drag.current.active) return;
      const wasMoved = drag.current.moved;
      drag.current.active = false;
      try { canvas.releasePointerCapture(drag.current.pointerId); } catch { /* Pointer capture is optional. */ }
      canvas.style.cursor = 'crosshair';
      if (wasMoved) return;
      const bounds = canvas.getBoundingClientRect();
      setWalkDestination(
        (event.clientX - bounds.left) / bounds.width,
        (event.clientY - bounds.top) / bounds.height,
      );
    };
    const onGesturePointer = (event: Event) => {
      const detail = (event as CustomEvent<GesturePointerDetail>).detail;
      if (!detail) return;
      fistForward.current = !detail.pinching && detail.gesture === 'Closed_Fist';
      const gesture = gestureDrag.current;
      if (!detail.pinching) {
        if (!gesture.active) { gesture.x = detail.x; gesture.y = detail.y; }
        return;
      }
      if (!gesture.active) {
        gesture.active = true;
        gesture.moved = false;
        gesture.startX = detail.x;
        gesture.startY = detail.y;
        gesture.x = detail.x;
        gesture.y = detail.y;
        return;
      }
      const deltaX = detail.x - gesture.x;
      const deltaY = detail.y - gesture.y;
      if (Math.hypot(detail.x - gesture.startX, detail.y - gesture.startY) > 0.035) gesture.moved = true;
      gesture.x = detail.x;
      gesture.y = detail.y;
      yaw.current = THREE.MathUtils.clamp(yaw.current - deltaX * 2.35, -Math.PI, Math.PI);
      pitch.current = THREE.MathUtils.clamp(pitch.current - deltaY * 1.7, -0.28, 0.16);
    };
    const onGesturePinchEnd = () => {
      const gesture = gestureDrag.current;
      const target = document.elementFromPoint(gesture.x * window.innerWidth, gesture.y * window.innerHeight);
      if (gesture.active && !gesture.moved && !target?.closest('button, a, [data-gesture-ui]')) {
        setWalkDestination(gesture.x, gesture.y);
      }
      gesture.active = false;
      gesture.moved = false;
    };
    const onGestureLeave = () => {
      fistForward.current = false;
      gestureDrag.current.active = false;
      gestureDrag.current.moved = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mch:gesture-pointer', onGesturePointer);
    window.addEventListener('mch:gesture-pinch-end', onGesturePinchEnd);
    window.addEventListener('mch:gesture-leave', onGestureLeave);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);

    return () => {
      canvas.style.cursor = 'grab';
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mch:gesture-pointer', onGesturePointer);
      window.removeEventListener('mch:gesture-pinch-end', onGesturePinchEnd);
      window.removeEventListener('mch:gesture-leave', onGestureLeave);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
    };
  }, [camera, gl, scene]);

  useFrame((_state, delta) => {
    const safeDelta = Math.min(delta, 0.05);
    if (transition.current.elapsed < 1) {
      transition.current.elapsed = Math.min(1, transition.current.elapsed + safeDelta / 0.9);
      const progress = 1 - Math.pow(1 - transition.current.elapsed, 3);
      camera.position.lerpVectors(transition.current.fromPosition, WALK_START, progress);
      camera.quaternion.slerpQuaternions(transition.current.fromQuaternion, targetQuaternion.current, progress);
      return;
    }

    forward.current.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    right.current.set(Math.cos(yaw.current), 0, -Math.sin(yaw.current));
    input.current.set(0, 0, 0);
    if (keys.current.has('w') || keys.current.has('arrowup')) input.current.add(forward.current);
    if (keys.current.has('s') || keys.current.has('arrowdown')) input.current.sub(forward.current);
    if (keys.current.has('d') || keys.current.has('arrowright')) input.current.add(right.current);
    if (keys.current.has('a') || keys.current.has('arrowleft')) input.current.sub(right.current);
    if (fistForward.current) input.current.add(forward.current);

    const speed = keys.current.has('shift') ? 2 : 1.15;
    if (input.current.lengthSq() > 0) {
      input.current.normalize();
      desiredVelocity.current.copy(input.current).multiplyScalar(speed);
      destination.current = null;
    } else if (destination.current) {
      desiredVelocity.current.copy(destination.current).sub(camera.position).setY(0);
      if (desiredVelocity.current.length() < 0.22) {
        destination.current = null;
        desiredVelocity.current.set(0, 0, 0);
      } else {
        desiredVelocity.current.normalize().multiplyScalar(1.05);
      }
    } else {
      desiredVelocity.current.set(0, 0, 0);
    }

    velocity.current.lerp(desiredVelocity.current, 1 - Math.exp(-8 * safeDelta));
    camera.position.addScaledVector(velocity.current, safeDelta);
    constrainToWorld(camera.position);

    if (!terrainMeshes.current.length) {
      scene.traverse((object) => {
        if (isWalkableTerrain(object)) terrainMeshes.current.push(object);
      });
    }
    if (Math.hypot(camera.position.x - lastGroundProbe.current.x, camera.position.z - lastGroundProbe.current.y) > 0.035) {
      groundProbe.current.set(camera.position.x, 30, camera.position.z);
      groundRaycaster.current.set(groundProbe.current, DOWN);
      const groundHit = groundRaycaster.current.intersectObjects(terrainMeshes.current, false)[0];
      targetEyeHeight.current = (groundHit?.point.y ?? 3.05) + EYE_CLEARANCE;
      lastGroundProbe.current.set(camera.position.x, camera.position.z);
    }

    if (velocity.current.lengthSq() > 0.02) step.current += safeDelta * 5.5;
    const bob = reducedMotion ? 0 : Math.sin(step.current) * Math.min(0.022, velocity.current.length() * 0.012);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetEyeHeight.current + bob, 12, safeDelta);
    camera.rotation.order = 'YXZ';
    camera.rotation.set(pitch.current, yaw.current, 0);
  });

  return null;
}
