"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { CanvasTexture, SRGBColorSpace, type DirectionalLight } from "three";
import { theme } from "@/game/core/GameConfig";
import { shaft02 } from "@/game/levels/definitions/level-02";
import { useSettingsStore } from "@/store/settingsStore";
import { collisionGroups } from "@/scene/runtime/physicsGroups";

const doorZ = 4.7;
const back = -8.4;
const front = 7.4;
const side = 5.5;
const wallT = 0.4;
const wallH = 3.6;

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
  context.fillText("CHAMBER 02", 36, 78);
  context.fillStyle = "#e8eef6";
  context.font = "600 40px ui-monospace, monospace";
  context.fillText("FALLING KEY", 36, 136);
  context.fillStyle = "#8ea0b4";
  context.font = "400 22px ui-monospace, monospace";
  context.fillText("STEP CLEAR OF THE SHAFT", 36, 188);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function FallingKeyRoom() {
  const sign = useMemo(() => createSign(), []);
  const light = useRef<DirectionalLight>(null);
  const { x, z, half, floorY } = shaft02;
  const south = z - half;
  const north = z + half;
  const west = x - half;
  const east = x + half;

  useFrame(() => {
    if (light.current) light.current.castShadow = useSettingsStore.getState().shadows;
  });

  const southFloor = span(back, south + 0.08);
  const northFloor = span(north - 0.08, front);
  const westFloor = span(-side, west + 0.08);
  const eastFloor = span(east - 0.08, side);
  const across = span(south - 0.08, north + 0.08);
  const depth = span(back, front);

  return (
    <group>
      <hemisphereLight args={["#d5e4f2", "#3a2a22", 0.85]} />
      <ambientLight intensity={0.42} />
      <directionalLight
        ref={light}
        position={[6, 10, 2]}
        intensity={7.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={28}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <pointLight position={[x, 2.4, z]} color={theme.amber} intensity={28} distance={8} />
      <pointLight position={[0, 2.6, doorZ]} color={theme.cyan} intensity={46} distance={12} />

      <Slab position={[0, -0.2, southFloor.center]} size={[side * 2, 0.4, southFloor.size]} />
      <Slab position={[0, -0.2, northFloor.center]} size={[side * 2, 0.4, northFloor.size]} />
      <Slab position={[westFloor.center, -0.2, across.center]} size={[westFloor.size, 0.4, across.size]} />
      <Slab position={[eastFloor.center, -0.2, across.center]} size={[eastFloor.size, 0.4, across.size]} />
      <Slab position={[x, floorY - 0.2, z]} size={[half * 2, 0.4, half * 2]} color={"#121820"} />

      <Wall position={[west - 0.08, floorY / 2, z]} size={[0.16, -floorY, half * 2]} />
      <Wall position={[east + 0.08, floorY / 2, z]} size={[0.16, -floorY, half * 2]} />
      <Wall position={[x, floorY / 2, south - 0.08]} size={[half * 2, -floorY, 0.16]} />
      <Wall position={[x, floorY / 2, north + 0.08]} size={[half * 2, -floorY, 0.16]} />

      <Wall position={[0, wallH / 2, back - wallT / 2]} size={[side * 2 + wallT, wallH, wallT]} />
      <Wall position={[0, wallH / 2, front + wallT / 2]} size={[side * 2 + wallT, wallH, wallT]} />
      <Wall position={[-(side + wallT / 2), wallH / 2, depth.center]} size={[wallT, wallH, depth.size + wallT]} />
      <Wall position={[side + wallT / 2, wallH / 2, depth.center]} size={[wallT, wallH, depth.size + wallT]} />
      <Wall position={[-3.35, wallH / 2, doorZ]} size={[4.3, wallH, 0.32]} />
      <Wall position={[3.35, wallH / 2, doorZ]} size={[4.3, wallH, 0.32]} />
      <Wall position={[0, 3.15, doorZ]} size={[2.4, 0.9, 0.32]} />

      <mesh position={[0, 3.55, depth.center]} userData={{ occludeCamera: true }}>
        <boxGeometry args={[side * 2 + wallT, 0.08, depth.size + wallT]} />
        <meshStandardMaterial color={"#0c1016"} roughness={1} />
      </mesh>
      <gridHelper args={[11, 11, "#1c4d58", "#171d28"]} position={[0, 0.02, 0.2]} />

      <mesh position={[x, 0.04, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[half + 0.08, half + 0.28, 32]} />
        <meshStandardMaterial color={theme.cyan} emissive={theme.cyan} emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[2.35, 0.03, -3.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.78, 28]} />
        <meshStandardMaterial color={theme.amber} emissive={theme.amber} emissiveIntensity={0.85} />
      </mesh>
      <mesh position={[-2.4, 1.8, doorZ - 0.2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.8, 0.9]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
    </group>
  );
}
