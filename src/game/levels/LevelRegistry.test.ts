import { describe, expect, it } from "vitest";
import { level01 } from "./definitions/level-01";
import { getLevel, levelCatalog } from "./LevelRegistry";

describe("level catalog", () => {
  it("unlocks a playable falling-key chamber after the first loop", () => {
    expect(level01.nextLevelId).toBe("level-02");
    const level = getLevel("level-02");
    expect(level?.playable).toBe(true);
    expect(level?.name).toBe("The Falling Key");
    expect(levelCatalog.filter((entry) => entry.playable).map((entry) => entry.id)).toEqual([
      "level-01",
      "level-02",
    ]);
  });
});
