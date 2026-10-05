# CHRONO implementation progress

The master plan remains the design authority. This file only tracks build status.

## Current milestone

Level 8, The Meridian Core, is playable. Arm the west conduit, rewind the fallen span, freeze the beam, and haste the ferry into the core. The core then settles and the run ends.

## Completed

- Next.js App Router shell, strict TypeScript, client-only game route
- Futuristic test chamber, third-person player, Rapier physics, pushable crate
- Switch, pressure plate, and authored sliding door
- Snapshot ring buffer, interpolation, rewind hold, energy, and timeline branching
- Level 1 win condition, restart, pause, hints, settings, and local save of completion
- Level select routes each playable chamber to `/game?level=`, and completing a chamber unlocks the next id
- Level 2: a shelf releases an amber key into a shaft. The exit stays open only while the key weighs the plate. Rewind puts the key back on the shelf
- Level 3: walking toward the span collapses it. Rewind restores it and does not move the player, so they rebuild it from the lip and walk across
- Level 4: a sweeping beam covers the ferry. F freezes only the beam. The player rides across while it is held aside, then weighs the plate to open the gate
- Level 5: arming the west switch opens the gate and that switch is not rewound. The shutter drops before a there-and-back route can finish, so the player rewinds to the center path and sprints through
- Level 6: the ferry is the only hasted mechanism. Hold C while riding so it arrives while the lamp is lit. The lamp and the gate stay at normal speed
- Level 7: the alcove switch survives a rewind. The lamp, beam, and ferry do not, so the player rewinds after arming it, freezes the beam aside, and hastes only the ferry through the restored lamp
- Level 8: the west span collapses behind the conduit switch. Rewind rebuilds it and leaves the switch armed. The player then freezes the beam and hastes the ferry into the core, which settles before the ending card
- Procedural audio and rewind ghosts / vignette

## Architectural notes

- Game state (`PLAYING`, `PAUSED`, `LEVEL_COMPLETE`) and time mode (`NORMAL`, `REWINDING`) are separate. Rewind is not a second application state.
- Physics is paused at the Rapier frame stepper and stepped manually only while time mode is normal, so rewind restoration is not integrated by the solver.
- The gate opens only when the switch is armed and the plate is weighed. That makes both the interaction system and the crate puzzle required in the first room.
- Camera yaw is live input and is not rewound. Player body position and velocity are.
- The third-person camera starts inside the chamber, aimed at the player, and snaps there if it is ever left outside the room. A fallen player is returned to the spawn. The scene background is attached to the scene itself so the opening view is the laboratory, not an empty clear color.

## Tests

- Snapshot ring buffer, interpolation, truncation, and wrap
- Rewind energy, entity restore, branch discard, non-rewindable opt-out
- Door signals, interaction pick, movement, delta clamp
- Save sanitizing and event bus

## Verified in the browser

- The chamber, player, crate, plate, and door render and the player stands on the floor.
- Reset returns the player to the spawn.
- Walking forward is recorded, and holding Q restores an earlier player position while energy drains.
- Arming the switch and placing the crate on the plate opens the door. Rewind restores the door to closed, the switch to off, and the crate to its shelf position.
- Releasing Q returns time mode to normal and truncates the future snapshots.

## Known limits

- There is no chapter after the Meridian Core
- Player animation is procedural, structured so a GLTF mixer can replace it
- Audio is synthesized, not final assets

## Next

Visual and audio polish from the master plan, now that all eight chambers are playable.
