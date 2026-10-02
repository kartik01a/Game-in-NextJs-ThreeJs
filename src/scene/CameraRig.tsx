"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Raycaster, Vector3, type PerspectiveCamera } from "three";
import { playerConfig } from "@/game/core/GameConfig";
import { cameraOffset } from "@/lib/math";
import { useSimulation } from "@/scene/SimulationContext";

export function CameraRig() {
  const sim = useSimulation();
  const raycaster = useRef(new Raycaster());
  const desired = useRef(new Vector3());
  const look = useRef(new Vector3());
  const direction = useRef(new Vector3());

  useFrame((state, dt) => {
    const position = sim.registry.get("player")?.getPosition?.();
    if (!position) return;
    const offset = cameraOffset(sim.camera.yaw, sim.camera.pitch, sim.camera.distance);
    look.current.set(position[0], playerConfig.lookHeight, position[2]);
    desired.current.set(position[0] + offset.x, position[1] + offset.y + 0.35, position[2] + offset.z);
    direction.current.copy(desired.current).sub(look.current);
    const distance = direction.current.length();
    if (distance > 0.001) {
      direction.current.multiplyScalar(1 / distance);
      raycaster.current.set(look.current, direction.current);
      raycaster.current.far = distance;
      const hits = raycaster.current.intersectObjects(state.scene.children, true);
      const blocked = hits.find((hit) => hit.object.userData.occludeCamera === true);
      if (blocked) {
        const pulled = Math.max(0.7, blocked.distance - 0.45);
        desired.current.copy(look.current).addScaledVector(direction.current, pulled);
      }
    }
    const lag = sim.time.mode === "REWINDING" ? 18 : playerConfig.cameraLag;
    const farFromTarget = state.camera.position.distanceTo(desired.current) > 1.6;
    const blend = farFromTarget ? 1 : 1 - Math.exp(-lag * Math.max(dt, 0.001));
    state.camera.position.lerp(desired.current, blend);
    state.camera.lookAt(look.current);
    const camera = state.camera as PerspectiveCamera;
    const distort = sim.time.mode === "REWINDING" && !sim.settings.reduceMotion;
    const targetFov = distort ? 43 : 48;
    if (Math.abs(camera.fov - targetFov) > 0.04) {
      camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 5);
      camera.updateProjectionMatrix();
    }
    // Priority must stay at or below 0. A positive priority disables R3F's
    // own gl.render, which leaves the canvas cleared and the room invisible.
  });

  return null;
}
