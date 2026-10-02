import { describe, expect, it } from "vitest";
import { level01 } from "./definitions/level-01";
import { level02 } from "./definitions/level-02";
import { level03 } from "./definitions/level-03";
import { level04 } from "./definitions/level-04";
import { getLevel, levelCatalog } from "./LevelRegistry";

describe("level catalog", () => {
  it("unlocks a playable falling-key chamber after the first loop", () => {
    expect(level01.nextLevelId).toBe("level-02");
    const level = getLevel("level-02");
    expect(level?.playable).toBe(true);
    expect(level?.name).toBe("The Falling Key");
  });

  it("opens a playable broken bridge after the falling key", () => {
    expect(level02.nextLevelId).toBe("level-03");
    const level = getLevel("level-03");
    expect(level?.playable).toBe(true);
    expect(level?.rewindPlayer).toBe(false);
    expect(level?.name).toBe("Broken Bridge");
    expect(levelCatalog.filter((entry) => entry.playable).map((entry) => entry.id)).toEqual([
      "level-01",
      "level-02",
      "level-03",
      "level-04",
      "level-05",
    ]);
  });

  it("opens Two Timelines with a switch that survives the branch", () => {
    expect(level04.nextLevelId).toBe("level-05");
    const level = getLevel("level-05");
    expect(level?.playable).toBe(true);
    expect(level?.rewindPlayer).toBe(true);
    expect(level?.name).toBe("Two Timelines");
    const sw = level?.entities.find((entity) => entity.type === "switch");
    expect(sw?.type).toBe("switch");
    if (sw?.type === "switch") expect(sw.rewindable).toBe(false);
  });

  it("opens Frozen Moment with a local pause after the bridge", () => {
    expect(level03.nextLevelId).toBe("level-04");
    const level = getLevel("level-04");
    expect(level?.playable).toBe(true);
    expect(level?.requiredAbilities).toContain("local-pause");
    expect(level?.name).toBe("Frozen Moment");
  });
});
