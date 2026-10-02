"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { CanvasTexture, SRGBColorSpace, type DirectionalLight } from "three";
import { theme } from "@/game/core/GameConfig";
import { bridge03 } from "@/game/levels/definitions/level-03";
import { useSettingsStore } from "@/store/settingsStore";
import { collisionGroups } from "@/scene/runtime/physicsGroups";

const back = -11.2;
const front = 8.4;
const side = 5.5;
const wallT = 0.4;
const wallH = 3.6;
const deckSouth = bridge03.position[2] - bridge03.size[2] / 2;
const deckNorth = bridge03.position[2] + bridge03.size[2] / 2;

function Wall({
  position,
  size,
}: {
  position: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <CuboidCollider args={[size[0] / 2, size[1] / 2, size[2] / 2]} collisionGroups={collisionGroups.world} />
      <mesh castShadow receiveShadow userData={{ occludeCamera: true }}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={theme.wall} roughness={0.86} metalness={0.16} />
      </mesh>
    </RigidBody>
  );
}

function Slab({
  position,
  size,
  color = theme.floor,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
}) {
  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <CuboidCollider args={[size[0] / 2, size[1] / 2, size[2] / 2]} collisionGroups={collisionGroups.world} />
      <mesh receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.9} metalness={0.12} />
      </mesh>
    </RigidBody>
  );
}

function span(start: number, end: number): { center: number; size: number } {
  return { center: (start + end) / 2, size: end - start };
}

function createSign(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return new CanvasTexture(canvas);
  context.fillStyle = "#10151d";
  context.fillRect(0, 0, 512, 256);
  context.strokeStyle = "#ff9b3d";
  context.lineWidth = 4;
  context.strokeRect(12, 12, 488, 232);
  context.fillStyle = "#ff9b3d";
  context.font = "600 26px ui-monospace, monospace";
  context.fillText("CHAMBER 03", 36, 78);
  context.fillStyle = "#e8eef6";
  context.font = "600 36px ui-monospace, monospace";
  context.fillText("BROKEN BRIDGE", 36, 136);
  context.fillStyle = "#8ea0b4";
  context.font = "400 22px ui-monospace, monospace";
  context.fillText("RESTORE THE SPAN", 36, 188);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function BrokenBridgeRoom() {
  const sign = useMemo(() => createSign(), []);
  const light = useRef<DirectionalLight>(null);
  const south = span(back, deckSouth + 0.12);
  const north = span(deckNorth - 0.12, front);
  const depth = span(back, front);

  useFrame(() => {
    if (light.current) light.current.castShadow = useSettingsStore.getState().shadows;
  });

  return (
    <group>
      <hemisphereLight args={["#d5e4f2", "#3a2a22", 0.85]} />
      <ambientLight intensity={0.42} />
      <directionalLight
        ref={light}
        position={[5, 10, 1]}
        intensity={7.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={32}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
      />
      <pointLight position={[0, 2.4, 1.8]} color={theme.amber} intensity={24} distance={10} />
      <pointLight position={[0, 2.5, 6.6]} color={theme.cyan} intensity={40} distance={10} />

      <Slab position={[0, -0.2, south.center]} size={[side * 2, 0.4, south.size]} />
      <Slab position={[0, -0.2, north.center]} size={[side * 2, 0.4, north.size]} />
      <Slab position={[0, -3.6, (deckSouth + deckNorth) / 2]} size={[side * 2, 0.3, deckNorth - deckSouth]} color={"#10151c"} />

      <Wall position={[0, wallH / 2, back - wallT / 2]} size={[side * 2 + wallT, wallH, wallT]} />
      <Wall position={[0, wallH / 2, front + wallT / 2]} size={[side * 2 + wallT, wallH, wallT]} />
      <Wall position={[-(side + wallT / 2), wallH / 2, depth.center]} size={[wallT, wallH, depth.size + wallT]} />
      <Wall position={[side + wallT / 2, wallH / 2, depth.center]} size={[wallT, wallH, depth.size + wallT]} />

      <mesh position={[0, 3.55, depth.center]} userData={{ occludeCamera: true }}>
        <boxGeometry args={[side * 2 + wallT, 0.08, depth.size + wallT]} />
        <meshStandardMaterial color={"#0c1016"} roughness={1} />
      </mesh>

      <mesh position={[0, 0.03, -2.35]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.72, 28]} />
        <meshStandardMaterial color={theme.amber} emissive={theme.amber} emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[0, 0.03, 6.7]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.78, 28]} />
        <meshStandardMaterial color={theme.cyan} emissive={theme.cyan} emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-5.25, 1.75, -4.2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.9, 0.95]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
    </group>
  );
}
