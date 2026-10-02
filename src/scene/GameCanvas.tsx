"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { playerConfig, theme } from "@/game/core/GameConfig";
import { cameraOffset } from "@/lib/math";
import { useSimulation } from "@/scene/SimulationContext";
import { CameraRig } from "@/scene/CameraRig";
import { GameLoop } from "@/scene/GameLoop";
import { LevelWorld } from "@/scene/LevelWorld";
import { ColliderDebug, TemporalGhosts } from "@/scene/TemporalLayer";

export function GameCanvas() {
  const sim = useSimulation();
  const spawn = sim.level.spawn;
  const offset = cameraOffset(sim.level.spawnYaw, playerConfig.cameraPitch, playerConfig.cameraDistance);
  const cameraPosition: [number, number, number] = [
    spawn[0] + offset.x,
    spawn[1] + offset.y + 0.2,
    spawn[2] + offset.z,
  ];

  return (
    <Canvas
      shadows
      style={{ position: "absolute", inset: 0 }}
      dpr={[1, 1.75]}
      camera={{ fov: 48, near: 0.08, far: 80, position: cameraPosition }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        toneMappingExposure: 1.15,
        preserveDrawingBuffer: true,
      }}
      onCreated={({ camera }) => {
        camera.lookAt(spawn[0], playerConfig.lookHeight, spawn[2]);
      }}
      onPointerDown={(event) => {
        sim.audio.resume();
        if (sim.gameState !== "PLAYING") return;
        const target = event.target;
        if (target instanceof HTMLCanvasElement) target.requestPointerLock();
      }}
    >
      <color attach="background" args={[theme.background]} />
      <fog attach="fog" args={[theme.background, 18, 42]} />
      <Suspense fallback={null}>
        <Physics
          paused
          gravity={[0, playerConfig.gravity, 0]}
          timeStep="vary"
          numSolverIterations={8}
        >
          <LevelWorld />
          <TemporalGhosts />
          <ColliderDebug />
          <GameLoop />
          <CameraRig />
        </Physics>
      </Suspense>
    </Canvas>
  );
}
