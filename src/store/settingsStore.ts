"use client";

import { create } from "zustand";
import {
  defaultSettings,
  sanitizeSettings,
  type SettingsData,
} from "@/game/save/SaveSchema";
import { readSave, writeSave } from "@/lib/storage";

interface SettingsStore extends SettingsData {
  hydrated: boolean;
  hydrate: () => void;
  update: (partial: Partial<SettingsData>) => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...defaultSettings(),
  hydrated: false,
  hydrate: () => {
    const save = readSave();
    set({ ...save.settings, hydrated: true });
  },
  update: (partial) => {
    set(partial);
    const save = readSave();
    save.settings = sanitizeSettings({ ...get() });
    writeSave(save);
  },
}));
