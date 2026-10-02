"use client";

import { interactionGroups } from "@react-three/rapier";
import { physicsLayers } from "@/game/physics/layers";

const { player, world, dynamic, sensor } = physicsLayers;

export const collisionGroups = {
  player: interactionGroups([player], [world, dynamic, sensor]),
  world: interactionGroups([world], [player, dynamic]),
  dynamic: interactionGroups([dynamic], [world, dynamic, player, sensor]),
  sensor: interactionGroups([sensor], [player, dynamic]),
};
