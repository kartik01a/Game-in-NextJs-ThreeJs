"use client";

import { create } from "zustand";
import type { HudModel } from "@/game/core/hud";
import { level01 } from "@/game/levels/definitions/level-01";

const initialHud = (): HudModel => ({
  gameState: "BOOT",
  timeMode: "NORMAL",
  rewindEnergy: 100,
  localPause: 0,
  prompt: null,
  hint: null,
  objective: level01.objective,
  showObjective: true,
  levelId: level01.id,
  levelName: level01.name,
  levelNumber: level01.number,
  completion: null,
  debugOpen: false,
});

interface HudStore extends HudModel {
  ready: boolean;
  setHud: (hud: HudModel) => void;
  setReady: (ready: boolean) => void;
}

export const useHudStore = create<HudStore>((set) => ({
  ...initialHud(),
  ready: false,
  setHud: (hud) => set(hud),
  setReady: (ready) => set({ ready }),
}));
