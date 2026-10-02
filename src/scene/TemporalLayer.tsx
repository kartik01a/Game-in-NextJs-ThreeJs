"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useRapier } from "@react-three/rapier";
import { BufferAttribute, type LineSegments, type Mesh } from "three";
import { theme } from "@/game/core/GameConfig";
import { useSimulation } from "@/scene/SimulationContext";

export function TemporalGhosts() {
  const sim = useSimulation();
  const boxRefs = useRef<Array<Mesh | null>>([]);
  const playerRefs = useRef<Array<Mesh | null>>([]);

  useFrame(() => {
    const frames = sim.ghostFrames();
    const rewinding = sim.time.mode === "REWINDING";
    for (let index = 0; index < 3; index += 1) {
      const frame = frames[index];
      const box = boxRefs.current[index];
      const player = playerRefs.current[index];
      const boxState = frame?.entities["box-01"];
      const playerState = frame?.entities.player;
      if (box) {
        box.visible = rewinding && Boolean(boxState);
        if (boxState) box.position.set(boxState.position[0], boxState.position[1], boxState.position[2]);
      }
      if (player) {
        player.visible = rewinding && Boolean(playerState);
        if (playerState) {
          player.position.set(playerState.position[0], playerState.position[1], playerState.position[2]);
        }
      }
    }
  });

  return (
    <group>
      {[0, 1, 2].map((index) => (
        <mesh
          key={`box-ghost-${index}`}
          ref={(node) => {
            boxRefs.current[index] = node;
          }}
          visible={false}
        >
          <boxGeometry args={[0.9, 0.9, 0.9]} />
          <meshBasicMaterial color={theme.temporal} transparent opacity={0.16 - index * 0.04} depthWrite={false} />
        </mesh>
      ))}
      {[0, 1, 2].map((index) => (
        <mesh
          key={`player-ghost-${index}`}
          ref={(node) => {
            playerRefs.current[index] = node;
          }}
          visible={false}
        >
          <capsuleGeometry args={[0.28, 0.7, 4, 8]} />
          <meshBasicMaterial color={theme.cyan} transparent opacity={0.14 - index * 0.03} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

export function ColliderDebug() {
  const sim = useSimulation();
  const { world } = useRapier();
  const ref = useRef<LineSegments>(null);

  useFrame(() => {
    const lines = ref.current;
    if (!lines) return;
    lines.visible = sim.devTools && sim.stats.colliders;
    if (!lines.visible) return;
    const buffers = world.debugRender();
    lines.geometry.setAttribute("position", new BufferAttribute(new Float32Array(buffers.vertices), 3));
  });

  return (
    <lineSegments ref={ref} visible={false}>
      <bufferGeometry />
      <lineBasicMaterial color={theme.cyan} />
    </lineSegments>
  );
}
