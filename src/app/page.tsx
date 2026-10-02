import type { Metadata } from "next";
import Link from "next/link";
import { gameConfig } from "@/game/core/GameConfig";

export const metadata: Metadata = {
  title: "CHRONO — Break the rules of time",
  description:
    "A desktop browser 3D puzzle game. Rewind the recent past, restore what broke, and walk out through a timeline that no longer exists.",
};

export default function HomePage() {
  return (
    <main className="landing">
      <p className="eyebrow">Meridian Temporal Research Facility</p>
      <h1 className="wordmark">{gameConfig.title}</h1>
      <p className="tagline">{gameConfig.subtitle} Cause something. Rewind it. Use the past.</p>
      <div className="landing-actions">
        <Link className="button" href="/game">
          Play
        </Link>
        <Link className="button" href="/levels">
          Levels
        </Link>
        <Link className="button" href="/settings">
          Settings
        </Link>
      </div>
    </main>
  );
}
