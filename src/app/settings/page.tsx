"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSettingsStore } from "@/store/settingsStore";

export default function SettingsPage() {
  const settings = useSettingsStore();

  useEffect(() => {
    useSettingsStore.getState().hydrate();
  }, []);

  return (
    <main className="page">
      <p className="eyebrow">Calibration</p>
      <h1>Settings</h1>
      <form className="settings-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          Mouse sensitivity {settings.mouseSensitivity.toFixed(2)}
          <input
            type="range"
            min={0.4}
            max={2.2}
            step={0.05}
            value={settings.mouseSensitivity}
            onChange={(event) => settings.update({ mouseSensitivity: Number(event.target.value) })}
          />
        </label>
        <label>
          <span>
            <input
              type="checkbox"
              checked={settings.invertY}
              onChange={(event) => settings.update({ invertY: event.target.checked })}
            />{" "}
            Invert Y
          </span>
        </label>
        <label>
          Master volume {Math.round(settings.masterVolume * 100)}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={settings.masterVolume}
            onChange={(event) => settings.update({ masterVolume: Number(event.target.value) })}
          />
        </label>
        <label>
          Music {Math.round(settings.musicVolume * 100)}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={settings.musicVolume}
            onChange={(event) => settings.update({ musicVolume: Number(event.target.value) })}
          />
        </label>
        <label>
          Effects {Math.round(settings.sfxVolume * 100)}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={settings.sfxVolume}
            onChange={(event) => settings.update({ sfxVolume: Number(event.target.value) })}
          />
        </label>
        <label>
          Quality
          <select
            value={settings.quality}
            onChange={(event) =>
              settings.update({ quality: event.target.value as "low" | "medium" | "high" })
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label>
          <span>
            <input
              type="checkbox"
              checked={settings.shadows}
              onChange={(event) => settings.update({ shadows: event.target.checked })}
            />{" "}
            Shadows
          </span>
        </label>
        <label>
          <span>
            <input
              type="checkbox"
              checked={settings.reduceMotion}
              onChange={(event) => settings.update({ reduceMotion: event.target.checked })}
            />{" "}
            Reduce motion
          </span>
        </label>
        <label>
          <span>
            <input
              type="checkbox"
              checked={settings.reduceTemporalDistortion}
              onChange={(event) => settings.update({ reduceTemporalDistortion: event.target.checked })}
            />{" "}
            Reduce temporal distortion
          </span>
        </label>
      </form>
      <div className="page-actions">
        <Link className="button" href="/">
          Menu
        </Link>
      </div>
    </main>
  );
}
