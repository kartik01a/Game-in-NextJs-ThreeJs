"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { levelCatalog } from "@/game/levels/LevelRegistry";
import { defaultSave } from "@/game/save/SaveSchema";
import { readSaveSnapshot, subscribeSave } from "@/lib/storage";
import { formatDuration } from "@/lib/math";

const emptySave = defaultSave();

export default function LevelsPage() {
  const save = useSyncExternalStore(subscribeSave, readSaveSnapshot, () => emptySave);

  return (
    <main className="page">
      <p className="eyebrow">Chambers</p>
      <h1>Level select</h1>
      <div className="level-grid">
        {levelCatalog.map((level) => {
          const unlocked = save.unlockedLevels.includes(level.id);
          const completed = save.completedLevels.includes(level.id);
          const best = save.bestTimes[level.id];
          const available = unlocked && level.playable;
          return (
            <article key={level.id} className={`level-card ${available ? "" : "locked"}`}>
              <p className="eyebrow">
                {String(level.number).padStart(2, "0")}
                {completed ? " · complete" : ""}
              </p>
              <h2>{level.name}</h2>
              <p>{level.description}</p>
              {best !== undefined ? <p>Best {formatDuration(best)}</p> : null}
              {available ? (
                <Link href={`/game?level=${level.id}`}>Enter</Link>
              ) : (
                <p>{unlocked ? "Not built yet" : "Locked"}</p>
              )}
            </article>
          );
        })}
      </div>
      <div className="page-actions">
        <Link className="button" href="/">
          Menu
        </Link>
      </div>
    </main>
  );
}
