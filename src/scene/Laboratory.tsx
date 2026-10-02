"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { CanvasTexture, SRGBColorSpace, type DirectionalLight, type Group } from "three";
import { useSettingsStore } from "@/store/settingsStore";
import { useSimulation } from "@/scene/SimulationContext";
import { theme } from "@/game/core/GameConfig";
import { chamber01 } from "@/game/levels/definitions/level-01";
import { collisionGroups } from "@/scene/runtime/physicsGroups";

function Solid({
  position,
  size,
}: {
  position: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <CuboidCollider
        args={[size[0] / 2, size[1] / 2, size[2] / 2]}
        collisionGroups={collisionGroups.world}
      />
      <mesh castShadow receiveShadow userData={{ occludeCamera: true }}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={theme.wall} roughness={0.88} metalness={0.14} />
      </mesh>
    </RigidBody>
  );
}

function createSign(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return new CanvasTexture(canvas);
  context.fillStyle = "#10151d";
  context.fillRect(0, 0, 512, 256);
  context.strokeStyle = "#3ce0ff";
  context.lineWidth = 4;
  context.strokeRect(12, 12, 488, 232);
  context.fillStyle = "#9b8cff";
  context.font = "600 26px ui-monospace, monospace";
  context.fillText("MERIDIAN FACILITY", 36, 68);
  context.fillStyle = "#e8eef6";
  context.font = "600 44px ui-monospace, monospace";
  context.fillText("CHAMBER 01", 36, 128);
  context.fillStyle = "#8ea0b4";
  context.font = "400 22px ui-monospace, monospace";
  context.fillText("TEMPORAL LOOP TEST", 36, 174);
  context.fillText("HOLD Q TO REWIND", 36, 210);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function CoreBeacon() {
  const sim = useSimulation();
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    const group = ref.current;
    if (!group) return;
    const direction = sim.time.mode === "REWINDING" ? -1 : 1;
    group.rotation.y += dt * 0.7 * direction;
  });
  return (
    <group ref={ref} position={[0, 1.35, 0]}>
      <mesh>
        <octahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial
          color={theme.temporal}
          emissive={theme.temporal}
          emissiveIntensity={1.4}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

export function Laboratory() {
  const sign = useMemo(() => createSign(), []);
  const light = useRef<DirectionalLight>(null);
  const { doorZ } = chamber01;

  useFrame(() => {
    if (light.current) light.current.castShadow = useSettingsStore.getState().shadows;
  });

  return (
    <group>
      <hemisphereLight args={["#d5e4f2", "#3a2a22", 0.9]} />
      <ambientLight intensity={0.45} />
      <directionalLight
        ref={light}
        position={[7, 11, 3]}
        intensity={8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={28}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[0, 2.6, doorZ]} color={theme.cyan} intensity={80} distance={16} />
      <pointLight position={[-3.1, 2.2, -1]} color={theme.amber} intensity={46} distance={12} />
      <pointLight position={[0, 2.8, 0.4]} color={"#d7e6f4"} intensity={36} distance={14} />

      <RigidBody type="fixed" colliders={false} position={[0, -0.2, 1]}>
        <CuboidCollider args={[6.6, 0.2, 7.6]} collisionGroups={collisionGroups.world} />
      </RigidBody>
      <mesh position={[0, 0, 1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12.4, 14.2]} />
        <meshStandardMaterial color={theme.floor} roughness={0.92} metalness={0.18} />
      </mesh>
      <gridHelper args={[14, 14, "#1c4d58", "#171d28"]} position={[0, 0.015, 1]} />

      <Solid position={[0, 1.75, -6]} size={[12.8, 3.5, 0.4]} />
      <Solid position={[0, 1.75, 8]} size={[12.8, 3.5, 0.4]} />
      <Solid position={[-6, 1.75, 1]} size={[0.4, 3.5, 14.4]} />
      <Solid position={[6, 1.75, 1]} size={[0.4, 3.5, 14.4]} />
      <Solid position={[-3.62, 1.75, doorZ]} size={[5.16, 3.5, 0.32]} />
      <Solid position={[3.62, 1.75, doorZ]} size={[5.16, 3.5, 0.32]} />
      <Solid position={[0, 3.02, doorZ]} size={[2.3, 1.16, 0.32]} />

      <mesh position={[0, 3.48, 1]} userData={{ occludeCamera: true }}>
        <boxGeometry args={[12.8, 0.08, 14.8]} />
        <meshStandardMaterial color={"#0c1016"} roughness={1} />
      </mesh>

      <mesh position={[-5.7, 0.08, 1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.08, 13.4]} />
        <meshStandardMaterial color={theme.cyan} emissive={theme.cyan} emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[5.7, 0.08, 1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.08, 13.4]} />
        <meshStandardMaterial color={theme.cyan} emissive={theme.cyan} emissiveIntensity={0.7} />
      </mesh>

      <mesh position={[-2.2, 1.7, -5.78]}>
        <planeGeometry args={[1.7, 0.85]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>

      <group position={[0, 0, 6.7]}>
        <CoreBeacon />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[0.55, 0.72, 28]} />
          <meshStandardMaterial color={theme.temporal} emissive={theme.temporal} emissiveIntensity={0.8} />
        </mesh>
      </group>
    </group>
  );
}
