import type { Metadata } from "next";
import { GameLoader } from "@/components/game/GameLoader";

export const metadata: Metadata = {
  title: "Play",
  description: "Rewind the recent past inside a CHRONO chamber.",
};

export default async function GamePage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const { level } = await searchParams;
  return <GameLoader levelId={level ?? "level-01"} />;
}
