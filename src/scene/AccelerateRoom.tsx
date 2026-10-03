"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { CanvasTexture, SRGBColorSpace, type DirectionalLight } from "three";
import { theme } from "@/game/core/GameConfig";
import { ride06 } from "@/game/levels/definitions/level-06";
import { useSettingsStore } from "@/store/settingsStore";
import { collisionGroups } from "@/scene/runtime/physicsGroups";

const back = -11.2;
const front = 8.6;
const side = 5.5;
const wallT = 0.4;
const wallH = 3.6;
const lipSouth = -1.15;
const lipNorth = 4.55;

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
  context.strokeStyle = "#9b8cff";
  context.lineWidth = 4;
  context.strokeRect(12, 12, 488, 232);
  context.fillStyle = "#9b8cff";
  context.font = "600 26px ui-monospace, monospace";
  context.fillText("CHAMBER 06", 36, 78);
  context.fillStyle = "#e8eef6";
  context.font = "600 40px ui-monospace, monospace";
  context.fillText("ACCELERATE", 36, 136);
  context.fillStyle = "#8ea0b4";
  context.font = "400 22px ui-monospace, monospace";
  context.fillText("HASTE THE FERRY", 36, 188);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function AccelerateRoom() {
  const sign = useMemo(() => createSign(), []);
  const light = useRef<DirectionalLight>(null);
  const south = span(back, lipSouth);
  const north = span(lipNorth, front);
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
        position={[5, 10, -1]}
        intensity={7.2}
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
      <pointLight position={[0, 2.5, ride06.doorZ]} color={theme.cyan} intensity={32} distance={11} />
      <pointLight position={[0, 2.2, ride06.south]} color={theme.temporal} intensity={18} distance={8} />

      <Slab position={[0, -0.2, south.center]} size={[side * 2, 0.4, south.size]} />
      <Slab position={[0, -0.2, north.center]} size={[side * 2, 0.4, north.size]} />
      <Slab
        position={[0, -3.4, (lipSouth + lipNorth) / 2]}
        size={[side * 2, 0.3, lipNorth - lipSouth]}
        color={"#10151c"}
      />

      <Wall position={[0, wallH / 2, back - wallT / 2]} size={[side * 2 + wallT, wallH, wallT]} />
      <Wall position={[0, wallH / 2, front + wallT / 2]} size={[side * 2 + wallT, wallH, wallT]} />
      <Wall position={[-(side + wallT / 2), wallH / 2, depth.center]} size={[wallT, wallH, depth.size + wallT]} />
      <Wall position={[side + wallT / 2, wallH / 2, depth.center]} size={[wallT, wallH, depth.size + wallT]} />
      <Wall position={[-3.35, wallH / 2, ride06.doorZ]} size={[4.3, wallH, 0.32]} />
      <Wall position={[3.35, wallH / 2, ride06.doorZ]} size={[4.3, wallH, 0.32]} />
      <Wall position={[0, 3.15, ride06.doorZ]} size={[2.4, 0.9, 0.32]} />

      <mesh position={[0, 3.55, depth.center]} userData={{ occludeCamera: true }}>
        <boxGeometry args={[side * 2 + wallT, 0.08, depth.size + wallT]} />
        <meshStandardMaterial color={"#0c1016"} roughness={1} />
      </mesh>
      <mesh position={[0, 0.03, ride06.south - 1.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.72, 28]} />
        <meshStandardMaterial color={theme.amber} emissive={theme.amber} emissiveIntensity={0.85} />
      </mesh>
      <mesh position={[-5.2, 1.7, -3.4]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.9, 0.95]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
    </group>
  );
}
