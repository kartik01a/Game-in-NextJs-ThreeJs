# CHRONO — Complete Game Development Master Plan

## 0. Document Purpose

This document is the single source of truth for building **CHRONO**, a browser-based 3D time-manipulation puzzle game built with **Next.js, React Three Fiber, Three.js, TypeScript, and Rapier 3D physics**.

The intended workflow is:

1. Create the project according to the architecture in this document.
2. Give this entire file to Cursor/Claude/Opus/Codex as the project specification.
3. Implement the project in small phases.
4. Do not invent major mechanics, architecture, or folder structures that conflict with this document.
5. Preserve the separation between game simulation, rendering, UI, persistence, and Next.js application infrastructure.
6. Every milestone must leave the project runnable.
7. Prefer a smaller polished game over an unfinished large game.

This is intentionally designed as a **solo-developer-sized game** with strong visual payoff for a YouTube build video.

---

# 1. Game Overview

## 1.1 Working Title

**CHRONO**

Possible subtitle:

> Break the rules of time.

The title should remain configurable so it can later be changed without touching game logic.

## 1.2 Genre

3D puzzle / physics / time-manipulation adventure.

## 1.3 Platform

Primary:

- Desktop browser.
- Chrome, Edge, Firefox, Safari where WebGL/WebGPU-compatible rendering is available.
- Keyboard + mouse.

Initial version does **not** target mobile touch controls.

## 1.4 Core Fantasy

The player enters a mysterious laboratory where an experimental temporal machine has damaged local reality.

The player's unique ability is to manipulate time in a controlled area.

The player can:

- rewind the recent state of the environment;
- briefly pause local time;
- later unlock limited forward acceleration;
- use the temporal states of objects to solve physical puzzles;
- intentionally trigger events and then rewind them;
- manipulate cause and effect instead of simply moving objects manually.

The game should make the player think:

> "What if I let this happen first, then rewind and use the previous state to solve the next part?"

The most important experience is not combat. It is **watching a complicated chain of physical events run forward, then rewinding it and exploiting what happened**.

---

# 2. What The Player Actually Does

The core gameplay loop is:

```text
Explore room
    ↓
Observe puzzle
    ↓
Identify temporal relationship
    ↓
Interact with objects
    ↓
Trigger event
    ↓
Use rewind / pause
    ↓
Change the timing/order of events
    ↓
Reach exit
    ↓
Unlock next room
```

A good puzzle should normally be understandable from the environment rather than from a wall of instructions.

Example:

```text
Player sees:

A bridge is broken.
A movable energy battery is behind the player.
A machine opens a gate for 8 seconds.
A heavy box falls and blocks the only route.

Possible solution:

1. Move battery near machine.
2. Activate machine.
3. Let gate open.
4. Trigger box fall.
5. Rewind.
6. While the world returns toward the earlier state, move through the now-open path.
```

Not every puzzle has to be this complex. Complexity increases gradually.

---

# 3. Design Pillars

Every feature must support at least one of these pillars.

## Pillar A — Time is the mechanic

The game should not feel like a normal 3D puzzle game with a rewind button attached.

Time manipulation must fundamentally affect puzzle solutions.

## Pillar B — Physics should be visible

When possible, let the player see objects physically react:

- fall;
- roll;
- bounce;
- break;
- move on rails;
- get pushed;
- activate mechanisms.

## Pillar C — The player should understand cause and effect

When something is rewound, the player should be able to visually understand what happened.

## Pillar D — Every interaction needs feedback

Actions should have:

- sound;
- particles;
- subtle animation;
- camera response;
- UI feedback where useful.

## Pillar E — Scope must stay controlled

No open world.
No multiplayer.
No procedural infinite world.
No huge character roster.
No online backend for the core game.
No complicated AI.
No inventory system unless a later puzzle truly needs it.

---

# 4. Target Game Scope

The initial complete game should contain:

- Main menu.
- Settings.
- Level select.
- 8 handcrafted puzzle rooms.
- 3 progressively unlocked time abilities.
- 10–15 reusable interactive object types.
- 1 player character.
- 1 visual environment theme.
- 1 lightweight story.
- local save/progress.
- restart level.
- pause menu.
- accessibility options for motion/visual effects.
- desktop keyboard/mouse controls.
- polished VFX and audio.
- responsive HUD.
- final completion sequence.

The first playable prototype only needs:

- 1 room.
- Player movement.
- One box.
- One switch.
- One door.
- Rewind.
- Snapshot system.
- Win condition.

Do not begin with all 8 levels.

---

# 5. Story And World

## 5.1 Setting

The game takes place inside **The Meridian Temporal Research Facility**.

The facility was researching a machine that could locally manipulate temporal states.

An experiment failed.

The building is still functioning, but parts of reality are now temporally unstable.

The player is the only remaining operator capable of entering the test chambers.

## 5.2 Story Delivery

Keep the story minimal.

Use:

- environmental storytelling;
- short terminal messages;
- short voice/text transmissions;
- level-start messages;
- occasional visual anomalies.

Do not build a complex dialogue system.

## 5.3 Story Tone

Mystery + science fiction + slightly unsettling atmosphere.

No gore is required.

## 5.4 Story Progression

### Intro

The facility's temporal core fails.

The player gains access to the first chamber.

### Midpoint

The player learns that the temporal machine did not simply malfunction. It is preserving fragments of previous states.

### Late game

Some objects can exist in inconsistent temporal states.

### Finale

The player must use the time system against the failing temporal core.

The final sequence is primarily a spectacle/puzzle rather than a combat boss.

---

# 6. Camera Design

Use a **third-person orbiting camera**.

Reason:

- the player character remains visible;
- the environment and objects remain visible during rewind;
- physics reactions are easier to appreciate;
- better for YouTube footage;
- avoids first-person camera complexity;
- gives the game a readable puzzle-room presentation.

## Camera behavior

Default:

- distance: approximately 5–7 world units;
- height: 2.5–4 units depending on player position;
- smooth follow;
- collision avoidance;
- mild camera lag;
- adjustable sensitivity.

During important time effects:

- slight camera shake;
- mild FOV change;
- vignette;
- chromatic aberration/glitch effect;
- temporal particles.

Camera effects must be short and configurable.

---

# 7. Player

## 7.1 Player Capabilities

Initial movement:

- walk;
- sprint;
- jump;
- rotate camera;
- interact.

No combat in the first version.

## 7.2 Movement Feel

Movement should feel responsive rather than realistic.

Target:

- low input latency;
- acceleration around 0.05–0.15 seconds;
- deceleration around 0.10–0.20 seconds;
- jump height approximately 1.2–1.8 world units;
- sprint 1.4–1.7x normal speed.

All values must live in a central config file.

## 7.3 Player Physics

Use Rapier for collision/physics.

For the player, use a kinematic character-controller style approach rather than a completely free dynamic rigid body.

The player needs predictable movement for puzzles.

The environment can be physically simulated where useful.

## 7.4 Player Animation

Minimum animation set:

- idle;
- walk;
- run;
- jump;
- fall;
- interact.

The animation implementation should be compatible with GLTF/GLB clips and Three.js AnimationMixer.

Do not build a custom skeletal animation system.

---

# 8. Input Controls

Desktop defaults:

```text
W / A / S / D       Move
Shift               Sprint
Space               Jump
E                   Interact
R                   Restart level
Q                   Hold to rewind
F                   Pause/unpause local time
Mouse               Camera
Esc                 Pause menu
1 / 2 / 3            Optional ability quick-select
```

Important: rewind is a **hold** action in the first version.

While Q is held:

- world simulation enters rewind mode;
- snapshots move backward;
- rewind meter decreases;
- visual temporal effect is active.

When Q is released:

- simulation returns to the restored moment;
- the player may continue from that point.

The system must support remappable keys later, but controls may be hardcoded initially through a central input map.

---

# 9. Time System — Core Architecture

This is the most important system in the project.

Do not implement time reversal by asking Rapier to simulate backward.

Instead use **state snapshots**.

## 9.1 Modes

The game simulation has these temporal modes:

```text
NORMAL
PAUSED
REWINDING
FAST_FORWARDING (optional/unlocked later)
RESETTING
```

## 9.2 Normal mode

Game simulation progresses normally.

At a fixed sampling frequency, rewindable entities save their state.

## 9.3 Rewind mode

The game does not advance physics normally.

Instead:

1. determine the previous snapshot;
2. apply that snapshot to every rewindable entity;
3. interpolate between snapshots for smooth visuals when appropriate;
4. decrease available rewind energy;
5. continue until the player releases rewind or the buffer reaches its oldest point.

## 9.4 Snapshot concept

Every rewindable object gets an ID.

Example:

```ts
interface TransformSnapshot {
  position: [number, number, number];
  rotation: [number, number, number, number];
}

interface PhysicsSnapshot {
  linearVelocity: [number, number, number];
  angularVelocity: [number, number, number];
}

interface ObjectSnapshot {
  id: string;
  time: number;
  transform: TransformSnapshot;
  physics?: PhysicsSnapshot;
  animationTime?: number;
  customState?: Record<string, unknown>;
}
```

The actual implementation may be optimized later.

## 9.5 Ring buffer

Do not append snapshots forever.

Use a fixed-length circular/ring buffer.

Configuration:

```ts
snapshotRate = 20;       // snapshots per second initially
rewindDuration = 12;     // seconds initially
maxSnapshots = 240;
```

These values must be configurable.

Potential later optimization:

- sample player at 30 Hz;
- physics objects at 20 Hz;
- static objects not sampled at all;
- only store changed custom state.

## 9.6 Why snapshots instead of cloning the entire world

Do not serialize the entire Three.js scene.

Only registered gameplay entities are reversible.

The registry owns the authoritative game-state representation.

---

# 10. Rewindable Entity System

Create a dedicated interface/protocol.

Every reversible object must implement something conceptually equivalent to:

```ts
interface RewindableEntity {
  id: string;
  captureState(): EntityState;
  restoreState(state: EntityState): void;
  onRewindStart?(): void;
  onRewindTick?(state: EntityState): void;
  onRewindEnd?(): void;
}
```

Do not couple this interface to React.

It belongs in the simulation/domain layer.

## 10.1 Entity categories

### Rewindable

Examples:

- player;
- boxes;
- doors;
- moving platforms;
- switches;
- pressure plates;
- breakable props;
- energy orbs;
- elevators;
- timed bridges.

### Non-rewindable

Examples:

- UI;
- static environment geometry;
- decorative particles that are intentionally regenerated;
- background music playback state;
- developer debug tools.

## 10.2 Custom state

Some objects need more than transform/velocity.

Example:

```ts
interface DoorState {
  isOpen: boolean;
  progress: number;
}
```

Example switch:

```ts
interface SwitchState {
  activated: boolean;
}
```

Example breakable object:

```ts
interface BreakableState {
  health: number;
  broken: boolean;
}
```

The system must be generic enough to support these states.

---

# 11. Physics During Rewind

This is a critical implementation rule.

When rewinding:

- regular physics stepping must stop;
- dynamic bodies should be prevented from continuing to simulate normally;
- transforms/velocities are explicitly restored from recorded states;
- the visual scene follows restored states.

Depending on the final R3F/Rapier integration, use kinematic/manual transform control during rewind.

Do not allow Rapier to fight the restored positions.

At rewind end:

1. restore the selected state;
2. restore relevant velocities;
3. switch the object back into its correct normal simulation mode;
4. continue forward from that state.

The system must avoid tunneling/violent impulses when physics resumes.

If necessary, clear or clamp velocities for objects that become invalid after rewind.

---

# 12. Branching Timeline Rule

This is an important design choice.

When the player rewinds from time T back to time T-5 and then continues forward, the future after T-5 is considered replaced.

In other words:

```text
Original timeline:
0 --- 1 --- 2 --- 3 --- 4 --- 5 --- 6 --- 7
                      ↑
                    rewind
                  to time 3

Continue:
0 --- 1 --- 2 --- 3 --- NEW 4 --- NEW 5 --- NEW 6
```

The old future is discarded.

Implementation:

- truncate snapshots newer than the current restored time;
- begin recording the new branch from that point.

This makes the mechanic intuitive and keeps memory bounded.

---

# 13. Rewind Energy / Resource System

To prevent unlimited trial-and-error from making the game visually dull, introduce a temporal energy resource.

Start with a simple model.

Example:

```text
Maximum rewind energy: 100 units
Consumption: 8 units / second
Recharge: level restart or designated recharge stations
```

Do not implement complex regeneration until the base system works.

Later levels can have:

- temporal crystals that add energy;
- machines that recharge rewind;
- limited-energy challenge rooms.

The HUD shows:

```text
TEMPORAL ENERGY
██████████████░░ 78%
```

During rewind, the meter animates smoothly.

---

# 14. Time Abilities

## Ability 1 — Rewind

Available from Level 1.

The player holds Q to travel backward through recorded states.

Core rules:

- maximum rewind window 12 seconds initially;
- rewind consumes energy;
- rewind cannot go beyond level start unless explicitly allowed;
- no gameplay input should accidentally trigger normal actions while rewinding.

## Ability 2 — Local Pause

Unlock around Level 4.

Press F to pause selected temporal objects for a short duration.

Important distinction:

The whole game UI should continue responding.

Only tagged temporal entities stop advancing.

Example:

- a moving laser pauses;
- player can reposition;
- door remains open;
- time resumes;
- laser continues.

## Ability 3 — Fast Forward

Unlock around Level 6.

Hold a key to temporarily accelerate tagged mechanisms.

Possible effect:

```text
normal = 1x
fast = 3x
```

This can allow:

- accelerated moving platforms;
- rapid door cycles;
- quickly growing bridges;
- sped-up machines.

Fast-forward should initially affect only tagged entities, not the entire simulation, to avoid destabilizing physics.

---

# 15. Temporal Interaction Rules

Every interactive object must declare:

```ts
interface TemporalBehavior {
  rewindable: boolean;
  pausable: boolean;
  fastForwardable: boolean;
}
```

Example:

```text
Wooden box:
rewindable = true
pausable = true
fastForwardable = false

Laser:
rewindable = true
pausable = true
fastForwardable = true

Decorative plant:
rewindable = false
pausable = false
fastForwardable = false
```

This prevents accidental complexity.

---

# 16. Interactive Object Library

Build reusable objects instead of coding every puzzle from scratch.

## 16.1 Pushable Box

Properties:

- dynamic rigid body;
- box collider;
- rewindable;
- optionally breakable.

## 16.2 Switch

States:

```text
OFF
ON
```

Can trigger:

- doors;
- lights;
- platforms;
- lasers;
- machines.

## 16.3 Pressure Plate

Activated when weighted.

Can be triggered by:

- player;
- box;
- special object.

## 16.4 Door

Animated door with:

- closed;
- opening;
- open;
- closing.

Its animation state must be recorded in rewind snapshots.

## 16.5 Moving Platform

Movement path:

```text
A → B → A
```

Must support:

- speed;
- pause;
- rewind;
- one-way/two-way behavior.

## 16.6 Timed Laser

Laser beam cycles:

```text
OFF → CHARGING → ON → OFF
```

Add visual glow and particles.

## 16.7 Breakable Barrier

Can be destroyed by:

- impact;
- energy projectile;
- scripted trigger.

Rewind reconstructs it.

This is an important visual demonstration of time reversal.

## 16.8 Energy Orb

A floating collectible or power source.

Can be moved through the environment.

## 16.9 Temporal Anchor

Special object that defines a permitted rewind checkpoint.

Optional later mechanic.

## 16.10 Temporal Gate

Portal/door that only becomes active when a certain temporal state is satisfied.

---

# 17. Trigger System

Create a generic event/trigger layer.

Objects should communicate through events rather than deeply nested component references.

Example events:

```text
SWITCH_ACTIVATED
SWITCH_DEACTIVATED
PRESSURE_PLATE_PRESSED
PRESSURE_PLATE_RELEASED
DOOR_OPENED
DOOR_CLOSED
OBJECT_BROKEN
OBJECT_RESTORED
LASER_ENABLED
LASER_DISABLED
PLAYER_ENTERED_ZONE
PLAYER_LEFT_ZONE
LEVEL_COMPLETED
REWIND_STARTED
REWIND_ENDED
```

The event system may use a lightweight typed event bus.

Avoid global state for everything.

Use explicit dependencies where possible.

---

# 18. Puzzle Architecture

Every puzzle should be data-driven.

Example conceptual configuration:

```ts
interface PuzzleDefinition {
  id: string;
  entities: EntityDefinition[];
  completionCondition: CompletionCondition;
  hintSteps?: HintStep[];
}
```

The exact schema can evolve, but levels should not be giant monolithic React components.

Recommended:

```text
Level config
   ↓
Entity registry
   ↓
Simulation
   ↓
Events
   ↓
Completion condition
```

---

# 19. Level Design

Create 8 levels with explicit teaching objectives.

## Level 1 — First Loop

Purpose:

Teach rewind.

Objects:

- player;
- box;
- pressure plate;
- door.

Puzzle:

Push box onto plate to open door.

Player intentionally moves box away.

Door closes.

Player learns:

> Cause something → rewind → restore previous state.

The room should finish within 3–5 minutes.

## Level 2 — The Falling Key

Teach:

- physical objects;
- timing;
- chain reactions.

A key falls into a lower area.

The player must allow it to fall, then rewind to reposition themselves before the key drops again.

## Level 3 — Broken Bridge

Teach:

- destructible objects;
- restore behavior.

A barrier blocks the shortest path.

Player triggers an event causing it to collapse.

Rewind restores the bridge.

The player must use the timing of its states to cross.

## Level 4 — Frozen Moment

Unlock local pause.

Puzzle uses:

- laser;
- moving platform;
- door.

The player pauses a laser while crossing a dangerous section.

## Level 5 — Two Timelines

Introduce branching timeline thinking.

Player performs an action, rewinds, then deliberately continues from an earlier state with altered positioning.

The puzzle should feel fundamentally different from Level 1.

## Level 6 — Accelerate

Unlock fast-forward.

Use:

- machine;
- moving platform;
- timed door;
- energy system.

Player accelerates one mechanism while another remains normal.

## Level 7 — Temporal Failure

Combine all three abilities.

Introduce environmental instability:

- flickering lights;
- objects briefly appearing/disappearing;
- temporal particles;
- abnormal sound.

Puzzle chain should require deliberate ordering.

## Level 8 — The Meridian Core

Finale.

Large room.

Multiple interconnected mechanisms.

The player must manipulate:

- power conduits;
- rotating machinery;
- temporal gates;
- moving platforms;
- destruction/reconstruction events.

Final sequence should feel like a miniature physics/time spectacle.

After completion:

- core stabilizes;
- room returns to normal;
- short ending sequence;
- completion screen.

---

# 20. Puzzle Difficulty Curve

Target progression:

```text
Level 1  One idea
Level 2  One idea + timing
Level 3  Rewind + physical restoration
Level 4  Rewind + pause
Level 5  Branching timeline
Level 6  Rewind + pause + speed
Level 7  Multi-step temporal reasoning
Level 8  Full system mastery
```

Avoid sudden difficulty spikes.

Each level should teach at least one thing before requiring the player to exploit it.

---

# 21. Hints

Do not add a complex hint engine initially.

Use predefined hint steps.

Example:

```text
Hint 1:
"Something here can be moved."

Hint 2:
"Try letting the machine complete its cycle."

Hint 3:
"Now try rewinding."
```

Hints unlock progressively after time or repeated failed attempts.

Do not automatically solve the puzzle.

---

# 22. Win Conditions

Each level needs a clear completion condition.

Examples:

```text
PLAYER_REACHED_EXIT
ALL_SWITCHES_ACTIVE
POWER_CORE_CHARGED
OBJECT_RESTORED
TEMPORAL_SEQUENCE_COMPLETE
```

Completion must be represented in the simulation layer, not only inferred by a UI component.

On completion:

1. disable player input;
2. play completion animation;
3. play audio cue;
4. show success UI;
5. save progress;
6. allow continue/replay.

---

# 23. Fail Conditions

Avoid traditional lives.

A level is primarily about experimentation.

Possible failure:

- player falls off map;
- player dies from laser/temporal hazard;
- puzzle enters impossible state.

On failure:

```text
slow-motion effect
→ fade
→ restart from level checkpoint
```

Restart should be fast.

---

# 24. Level Reset

Level reset must restore the entire authoritative simulation state.

Do not reload the browser page.

The reset pipeline should:

1. stop rewind;
2. clear transient effects;
3. destroy active dynamic bodies if necessary;
4. restore initial level state;
5. rebuild/refresh entity registry;
6. reset timer;
7. reset rewind energy;
8. reset puzzle triggers;
9. reset player transform;
10. resume simulation.

---

# 25. Rendering Architecture

Use React Three Fiber as the declarative renderer for Three.js.

Recommended conceptual tree:

```text
GameCanvas
 ├── Environment
 ├── Lighting
 ├── PostProcessing
 ├── Player
 ├── LevelEntities
 │    ├── Box
 │    ├── Door
 │    ├── Switch
 │    ├── Platform
 │    ├── Laser
 │    └── etc.
 ├── VFX
 └── CameraController
```

Keep game simulation logic outside individual mesh components as much as practical.

React should describe/render the world.

The simulation system should own state transitions.

---

# 26. Suggested Folder Structure

Use a clear separation.

```text
src/
├── app/
│   ├── page.tsx
│   ├── game/
│   │   └── page.tsx
│   ├── levels/
│   │   └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/
│   ├── menus/
│   └── game-ui/
│
├── game/
│   ├── core/
│   │   ├── GameLoop.ts
│   │   ├── GameState.ts
│   │   ├── GameMode.ts
│   │   └── GameConfig.ts
│   │
│   ├── time/
│   │   ├── TimeController.ts
│   │   ├── TimelineBuffer.ts
│   │   ├── SnapshotStore.ts
│   │   ├── RewindSystem.ts
│   │   ├── TimeMode.ts
│   │   └── types.ts
│   │
│   ├── physics/
│   │   ├── PhysicsWorld.ts
│   │   ├── PhysicsRegistry.ts
│   │   └── CharacterController.ts
│   │
│   ├── entities/
│   │   ├── EntityRegistry.ts
│   │   ├── EntityFactory.ts
│   │   ├── RewindableEntity.ts
│   │   └── components/
│   │       ├── BoxEntity.ts
│   │       ├── DoorEntity.ts
│   │       ├── SwitchEntity.ts
│   │       ├── PressurePlateEntity.ts
│   │       ├── PlatformEntity.ts
│   │       ├── LaserEntity.ts
│   │       ├── BreakableEntity.ts
│   │       ├── EnergyOrbEntity.ts
│   │       └── TemporalGateEntity.ts
│   │
│   ├── player/
│   │   ├── PlayerController.ts
│   │   ├── PlayerState.ts
│   │   └── PlayerInput.ts
│   │
│   ├── levels/
│   │   ├── LevelManager.ts
│   │   ├── LevelRegistry.ts
│   │   ├── types.ts
│   │   └── definitions/
│   │       ├── level-01.ts
│   │       ├── level-02.ts
│   │       ├── level-03.ts
│   │       ├── level-04.ts
│   │       ├── level-05.ts
│   │       ├── level-06.ts
│   │       ├── level-07.ts
│   │       └── level-08.ts
│   │
│   ├── events/
│   │   ├── EventBus.ts
│   │   └── events.ts
│   │
│   ├── save/
│   │   ├── SaveManager.ts
│   │   └── SaveSchema.ts
│   │
│   ├── audio/
│   │   ├── AudioManager.ts
│   │   └── SoundBank.ts
│   │
│   └── effects/
│       ├── TemporalEffects.ts
│       ├── CameraEffects.ts
│       └── ParticleEffects.ts
│
├── scene/
│   ├── GameScene.tsx
│   ├── WorldEnvironment.tsx
│   ├── Lighting.tsx
│   ├── PostProcessing.tsx
│   ├── CameraRig.tsx
│   └── assets/
│
├── hooks/
│   ├── useGame.ts
│   ├── useTimeSystem.ts
│   ├── useInput.ts
│   └── useGameAudio.ts
│
├── store/
│   ├── gameStore.ts
│   └── settingsStore.ts
│
├── data/
│   ├── levels.ts
│   ├── settings.ts
│   └── content.ts
│
├── lib/
│   ├── math.ts
│   ├── easing.ts
│   └── storage.ts
│
└── types/
    ├── game.ts
    ├── entities.ts
    └── levels.ts

public/
├── models/
├── textures/
├── audio/
├── icons/
└── fonts/
```

The exact folder names can change only if there is a strong reason. Do not collapse the time system, entity system, and rendering into one file.

---

# 27. Next.js Responsibilities

Next.js is the application shell, not the game engine.

Use Next.js for:

- routing;
- landing/menu screens;
- settings screen;
- level-select UI;
- metadata/SEO for the game page;
- loading screen;
- static asset delivery;
- optional analytics.

The actual 3D game runs in client components.

The game route must be a client-side interactive area.

Avoid putting Three.js objects in Server Components.

Use dynamic loading/client boundaries where appropriate to avoid SSR issues with browser-only WebGL APIs.

---

# 28. React Three Fiber Responsibilities

R3F owns:

- scene graph composition;
- mesh rendering;
- camera;
- lights;
- materials;
- animation frame hooks;
- interactions where convenient.

Do not store rapidly changing physics transforms in large React state objects.

Prefer refs and the simulation loop for high-frequency data.

React state should primarily drive UI and low-frequency state transitions.

---

# 29. Rapier Responsibilities

Use Rapier 3D for:

- rigid bodies;
- colliders;
- gravity;
- collisions;
- physical boxes;
- moving dynamic props;
- trigger sensors;
- raycasts if needed;
- character collision support where appropriate.

Rapier is not responsible for timeline history.

The rewind layer sits above physics.

---

# 30. Time Simulation Separation

Create a dedicated simulation clock.

Conceptually:

```ts
interface SimulationClock {
  currentTime: number;
  deltaTime: number;
  timeScale: number;
  mode: TimeMode;
}
```

Rendering time and simulation time must not be blindly conflated.

For example:

- UI animations may continue while the game is paused;
- rewind effects can animate while simulation time goes backward;
- menu animations can continue independently.

This separation is critical.

---

# 31. Game Loop

Conceptual order:

```text
Input
 ↓
Game mode / time mode
 ↓
Simulation clock
 ↓
Gameplay systems
 ↓
Physics step
 ↓
Snapshot capture / restore
 ↓
Entity state updates
 ↓
VFX state
 ↓
Render
```

Normal mode:

```text
input
→ simulation delta
→ gameplay
→ physics
→ capture snapshot
→ render
```

Rewind:

```text
input
→ choose previous snapshot
→ restore entities
→ update VFX
→ render
```

Do not call normal physics step while restoring rewind states unless there is a carefully defined reason.

---

# 32. Snapshot Storage Strategy

Start with a simple implementation.

For each snapshot:

```ts
interface WorldSnapshot {
  simulationTime: number;
  entities: Record<string, EntityState>;
}
```

For the first prototype, this is acceptable.

Once gameplay works, optimize.

Possible optimization:

```text
Snapshot header
Entity A state
Entity B state
Entity C state
...
```

Avoid JSON.stringify/parse every frame.

Use typed arrays or compact arrays later if profiling shows a problem.

Do not prematurely optimize.

---

# 33. Snapshot Capture Frequency

Initial target:

20 snapshots per second.

12 seconds = 240 snapshots.

If each snapshot becomes too heavy, optimize by:

- storing only rewindable entities;
- excluding static properties;
- using Float32Array-backed storage;
- storing custom state only when changed;
- reducing frequency for low-importance objects.

The first acceptance criterion is correct behavior, not maximum memory efficiency.

---

# 34. Rewind Interpolation

Do not make rewinding visually jump between 20 snapshots per second.

During rewind:

- retrieve adjacent states;
- interpolate transforms;
- use quaternion slerp for rotations;
- smoothly animate custom properties.

For properties that represent discrete state:

```text
switch ON/OFF
broken/not broken
```

use explicit temporal state transitions rather than naive numeric interpolation.

---

# 35. Animation System

Use Three.js AnimationMixer for model animation.

Example:

```text
Player
 ├── idle
 ├── walk
 ├── run
 ├── jump
 └── interact
```

Animation time needs special handling during rewind.

Option A for initial version:

- record normalized animation time;
- restore animation time on rewind.

For a model's animation mixer:

```text
mixer.setTime(recordedTime)
```

Do not attempt to infer historical animation state from only the current animation.

---

# 36. Environment Design

Use one cohesive art style.

Recommended style:

**stylized futuristic laboratory / low-poly sci-fi**.

Why:

- easier to source assets;
- easier to create procedural geometry;
- fewer photorealistic asset requirements;
- strong contrast for VFX;
- allows simple materials to look intentional.

Environment components:

- concrete/metal floors;
- dark walls;
- glowing strips;
- panels;
- cables;
- vents;
- machinery;
- glass chambers;
- temporal core components.

Avoid enormous environments.

The player should be inside compact puzzle spaces.

---

# 37. Asset Strategy

Use GLB/GLTF for 3D assets.

Prioritize:

- modular environment pieces;
- one good player model;
- box/crate;
- doors;
- switches;
- machines;
- platforms;
- lights;
- sci-fi props.

Some environment components should be procedural Three.js meshes to reduce asset requirements.

Examples:

- floors;
- walls;
- rails;
- simple doors;
- energy beams;
- platforms;
- basic containers.

---

# 38. Material Style

Use a restrained material palette.

General visual language:

- dark neutral environment;
- bright emissive cyan/blue for technology;
- warm warning/orange for hazards;
- temporal effect color that can be visually distinctive.

Do not hardcode color values throughout components.

Create a theme/config object.

---

# 39. Lighting

Use:

- ambient/fill lighting;
- directional or area-style key lighting where appropriate;
- emissive materials;
- local lights sparingly.

Avoid hundreds of dynamic lights.

Prefer emissive meshes and carefully chosen lights.

Important lighting moments:

- rewind;
- level completion;
- level failure;
- temporal instability;
- final core activation.

---

# 40. Temporal Visual Effects

This is one of the most important visual systems because it sells the concept.

During rewind:

### Screen effects

- subtle chromatic aberration;
- vignette;
- slight radial distortion;
- film grain;
- color desaturation/saturation shift;
- scan-line or temporal streak effect.

### World effects

- particles travel backward;
- dust reverses direction;
- glowing trails move toward sources;
- broken pieces reconstruct;
- lights flicker backward through states.

### UI effects

- rewind meter pulses;
- temporal indicator changes state;
- subtle distortion on HUD edges.

Do not overdo effects because readability is more important.

---

# 41. Post-Processing

Start with the simplest stable post-processing pipeline that gives a strong look.

Potential effects:

- bloom;
- vignette;
- film grain;
- chromatic aberration;
- color correction;
- subtle depth of field for menus/cinematic moments.

Keep post-processing modular.

Provide a low-effects mode in settings.

Note: if using Three.js's post-processing APIs directly, keep imports aligned with the current version and avoid relying on deprecated wrappers. Three.js currently documents EffectComposer for WebGL post-processing while also evolving newer rendering APIs. citeturn736415search1turn736415search2

---

# 42. Particles

Create reusable particle effects:

```text
TemporalSpark
TemporalBurst
Dust
Impact
DoorActivation
ObjectRestore
CheckpointActivation
LevelComplete
```

Do not create a heavy particle system for every small effect.

Prefer instancing or lightweight points where useful.

---

# 43. Sound Design

Audio is essential for making the game feel premium.

Required categories:

## UI

- menu hover;
- button click;
- level select;
- error.

## Player

- footsteps;
- jump;
- landing;
- interaction.

## Puzzle

- switch click;
- door motor;
- platform movement;
- pressure plate;
- laser hum;
- machine activation.

## Time

- rewind start;
- rewind loop;
- rewind stop;
- local pause;
- fast-forward.

## Feedback

- success;
- failure;
- checkpoint.

## Music

Use an ambient electronic loop.

During rewind:

- pitch/volume/filter effects may be applied;
- original audio should not literally be played backward unless easy to achieve.

Audio must have master/music/SFX volume controls.

---

# 44. UI / HUD

Minimal HUD.

Top-left:

```text
LEVEL 03
BROKEN BRIDGE
```

Bottom-center or bottom-right:

```text
[Q] REWIND
██████████░░ 72%
```

When abilities unlock:

```text
[F] LOCAL PAUSE
[G] FAST FORWARD
```

Near interactable objects:

```text
[E] INTERACT
```

Avoid permanent clutter.

---

# 45. Main Menu

Menu options:

```text
CHRONO

PLAY
LEVELS
SETTINGS
CREDITS
```

Visual:

- slow-moving temporal particles;
- rotating core object;
- cinematic camera;
- subtle sound.

Do not load the full game level just to render the menu.

Create a lightweight menu scene.

---

# 46. Level Select

Show 8 level cards.

Locked levels are visually subdued.

Each completed level displays:

- completion check;
- best completion time;
- optional rewind efficiency metric later.

Do not add leaderboards in initial version.

---

# 47. Settings

Settings should include:

### Gameplay

- mouse sensitivity;
- invert Y;
- camera distance;
- hold/toggle rewind option.

### Graphics

- quality preset;
- shadows on/off;
- post-processing on/off;
- particles quality;
- render scale where practical.

### Audio

- master;
- music;
- SFX.

### Accessibility

- reduce camera shake;
- reduce temporal distortion;
- reduce flashing;
- color assistance if needed;
- subtitle/text display for key sound cues.

Persist settings in localStorage.

---

# 48. Save System

No backend required.

Use localStorage initially.

Save schema should include:

```ts
interface SaveData {
  version: number;
  unlockedLevels: string[];
  completedLevels: string[];
  bestTimes: Record<string, number>;
  settings: SettingsData;
}
```

Every save must include a schema version.

If the schema changes:

- migrate old saves;
- if migration is impossible, safely reset only invalid data.

Never crash because localStorage contains an older save.

---

# 49. Analytics

Analytics should be optional and non-essential.

Possible events:

```text
level_started
level_completed
level_failed
level_restarted
rewind_used
rewind_seconds_used
ability_unlocked
settings_changed
```

Do not make game progression depend on analytics.

---

# 50. Performance Budget

Target:

- 60 FPS on a reasonable modern laptop/desktop;
- acceptable 30+ FPS on weaker devices.

Initial constraints per level:

- compact environment;
- controlled draw calls;
- limited real-time lights;
- limited transparent particles;
- reused materials/geometries;
- avoid unnecessary React rerenders.

Use instancing for repeated decorative objects where useful.

Profile before optimizing.

---

# 51. Memory Management

Dispose resources properly when levels change.

Must clean:

- geometries;
- materials;
- textures;
- render targets;
- post-processing resources;
- Rapier bodies/colliders;
- event listeners;
- timers/subscriptions.

A previous level must not continue consuming CPU/GPU resources after unload.

---

# 52. Asset Loading

Use progressive loading.

Flow:

```text
Game page
 ↓
Loading screen
 ↓
Load core game assets
 ↓
Load current level assets
 ↓
Start level
```

Do not load every level's assets before the first level begins.

Implement a simple loading progress indicator.

Potential loading states:

```text
Initializing temporal core...
Loading environment...
Loading simulation...
Preparing timeline...
```

---

# 53. Game State Machine

Use an explicit high-level game state.

Example:

```ts
type GameState =
  | 'BOOT'
  | 'MENU'
  | 'LOADING_LEVEL'
  | 'PLAYING'
  | 'PAUSED'
  | 'REWINDING'
  | 'LEVEL_COMPLETE'
  | 'LEVEL_FAILED';
```

Do not allow arbitrary UI booleans to represent major game states.

Bad:

```text
isPlaying
isPaused
isRewinding
isLoading
isComplete
```

all potentially true simultaneously.

Prefer one authoritative state machine plus smaller substates where appropriate.

---

# 54. Time State Machine

Separate from overall game state.

```ts
type TimeMode =
  | 'NORMAL'
  | 'REWINDING'
  | 'PAUSED'
  | 'FAST_FORWARDING';
```

Rules:

- REWINDING and FAST_FORWARDING are mutually exclusive.
- Global PAUSED should stop gameplay simulation.
- Local pause ability should not necessarily change global TimeMode; it should tag selected entities as paused.

---

# 55. Local Pause Mechanic

This needs a distinction between:

### Global pause

Menu pause.

Stops the game simulation.

### Temporal local pause

Gameplay ability.

Stops selected eligible entities while the player continues.

Implement the second through per-entity temporal state rather than freezing the entire game clock.

Example:

```text
Global simulation time continues.

Laser temporal multiplier = 0
Player temporal multiplier = 1
Door temporal multiplier = 1
```

This is conceptually cleaner than stopping the whole physics world.

---

# 56. Fast-Forward Mechanic

Use per-entity time scaling.

Example:

```ts
entity.timeScale = 1;
laser.timeScale = 3;
platform.timeScale = 3;
```

Avoid stepping Rapier three times faster for the first implementation.

Instead, use the mechanism primarily for authored, deterministic moving systems.

Dynamic rigid-body fast-forwarding is optional and should be added only if it remains stable.

---

# 57. Deterministic Authored Motion

Moving platforms, doors, lasers, rotating machines, and similar puzzle mechanisms should use deterministic timelines.

Example:

```ts
position = lerp(A, B, progress)
progress += delta * speed
```

This makes them easy to:

- rewind;
- pause;
- fast-forward;
- reset.

Use physics only when physical interaction is the point of the object.

---

# 58. Level Definition Example

Conceptually:

```ts
export const level01: LevelDefinition = {
  id: 'level-01',
  name: 'First Loop',
  description: 'Learn to manipulate the recent past.',
  environment: 'laboratory-basic',
  spawn: [0, 1, 0],
  requiredAbilities: ['rewind'],
  entities: [
    {
      id: 'box-01',
      type: 'pushable-box',
      position: [2, 0.5, 0],
      rewindable: true,
    },
    {
      id: 'plate-01',
      type: 'pressure-plate',
      position: [4, 0.05, 0],
    },
    {
      id: 'door-01',
      type: 'door',
      position: [7, 0, 0],
      linkedTo: 'plate-01',
    },
  ],
  completion: {
    type: 'player-zone',
    zoneId: 'exit-01',
  },
};
```

Do not copy this schema literally if the implementation needs improvement; preserve the architectural intent.

---

# 59. Collision Layers

Define collision groups early.

Potential categories:

```text
PLAYER
WORLD
DYNAMIC
TRIGGER
PROJECTILE
HAZARD
INTERACTION
```

Do not allow every object to collide with every other object unnecessarily.

---

# 60. Interaction System

The player should not directly inspect every object in the scene.

Use:

- short-range raycast;
- interaction layers;
- max interaction distance;
- priority rule when multiple interactables overlap.

Example:

```text
Camera center
     ↓
Raycast
     ↓
Nearest eligible IInteractable
     ↓
[E] prompt
```

Interaction interface:

```ts
interface Interactable {
  canInteract(context: InteractionContext): boolean;
  interact(context: InteractionContext): void;
  getPrompt(context: InteractionContext): string;
}
```

---

# 61. Temporal Interaction With Player

Player should itself be rewindable.

This creates interesting gameplay:

The player can:

1. walk somewhere;
2. trigger an event;
3. rewind;
4. return to the previous player position;
5. try a different movement route.

However, for some puzzles the player position should optionally remain unchanged when rewinding.

Therefore implement a config setting per level:

```ts
rewindPlayer: true | false
```

Default: true.

This lets designers create more varied puzzles later.

---

# 62. Checkpoints

Some later levels may be split into sections.

A checkpoint stores:

- player spawn;
- entity initial state;
- available rewind energy;
- current ability unlock state.

The checkpoint should reset instantly.

Do not persist every physics state to localStorage.

Checkpoints exist only in memory during gameplay.

---

# 63. Temporal Anchor Mechanic

Optional for late game.

A glowing object can mark a timeline origin.

Example:

```text
Player activates anchor at T=10

Rewind limit becomes:

T=10 ← cannot rewind beyond this point
```

This creates advanced puzzle possibilities.

Do not implement until the main rewind system is stable.

---

# 64. Temporal Glitch Objects

Late-game objects can briefly exist in multiple states.

Example visual:

```text
current object
+
ghost of previous state
```

The ghost should be visual only initially.

Do not create true multi-timeline physics unless there is a strong reason.

---

# 65. Ghost Trail

During rewind, show subtle ghost silhouettes of objects.

Possible design:

- 2–4 translucent previous positions;
- decreasing opacity;
- slight emission;
- fade quickly.

This helps the player understand movement history.

---

# 66. Temporal Breadcrumbs

When an object moves significantly, optionally show a subtle dotted trajectory.

This should only be visible during rewind/debug/high-feedback modes.

Do not keep permanent lines across the level.

---

# 67. Failure Feedback

When the player dies or creates an impossible state:

- freeze gameplay momentarily;
- lower audio;
- small screen effect;
- show "TEMPORAL FAILURE";
- restart button.

Avoid frustrating long reloads.

---

# 68. Level Completion Presentation

When the level is solved:

1. freeze or slow simulation;
2. highlight the exit/core;
3. play particles;
4. play sound;
5. show completion UI.

UI example:

```text
TEMPORAL STABILITY RESTORED

LEVEL COMPLETE

Time: 02:41
Rewind used: 7.8s

[NEXT LEVEL]
[REPLAY]
```

Stats should be informative, not competitive.

---

# 69. Performance Instrumentation

Add a hidden developer panel.

Toggle with:

```text
F3
```

Show:

```text
FPS
Frame time
Draw calls
Triangles
Active entities
Dynamic bodies
Snapshot count
Snapshot memory estimate
Current time
Rewind mode
Current level
```

This is extremely useful during development.

Developer panel should be disabled in production builds unless explicitly enabled.

---

# 70. Debug Commands

Development-only shortcuts:

```text
F1  Restart level
F2  Next level
F3  Debug overlay
F4  Toggle collision visualization
F5  Toggle temporal visualization
F6  Refill rewind energy
```

Never enable cheats by default in production.

---

# 71. Testing Strategy

Testing must happen at three levels.

## Unit tests

Test pure systems:

- snapshot buffer;
- timeline indexing;
- state restore;
- event bus;
- level completion conditions;
- save migrations.

## Integration tests

Test:

- switch → door;
- pressure plate → door;
- rewind → object restore;
- rewind → physics resume;
- level reset;
- checkpoint reset.

## Manual game tests

Test every level on:

- normal play;
- repeated rewind;
- rapidly pressing inputs;
- dying during rewind;
- resetting while rewinding;
- completing while an effect is active;
- changing browser tab/focus;
- window resizing.

---

# 72. Important Edge Cases

The implementation must explicitly handle:

### Rewind while jumping

Player position/velocity should restore correctly.

### Rewind while holding an object

The object and player must restore consistently.

### Rewind when a door is halfway open

Door animation progress must restore.

### Rewind after object destruction

Broken object must reconstruct correctly.

### Rewind after trigger fired

Trigger states must be included in the relevant state model.

### Rewind to before an object existed

Object visibility/active state must restore.

### Reset during rewind

Reset wins; timeline must be cleared.

### Level change during rewind

All rewind systems must be disposed.

### Browser tab suspension

Do not create enormous deltaTime when the tab returns.

Clamp frame delta.

### Low FPS

Snapshot timing should use accumulated simulation time rather than blindly saving every render frame.

---

# 73. Delta Time Rules

Never assume:

```ts
1 frame = 1/60 second
```

Use measured/clamped delta time.

Example policy:

```text
minDelta = 0
maxDelta = 0.05 seconds
```

If a browser tab wakes up after a long pause, do not simulate a 10-second physics jump.

---

# 74. Browser Resize

Handle:

- viewport changes;
- fullscreen;
- device pixel ratio;
- browser zoom where possible.

Cap device pixel ratio to a configurable maximum, e.g.:

```text
1.5 or 2.0
```

to prevent excessive GPU cost.

---

# 75. Quality Presets

Create:

```text
LOW
MEDIUM
HIGH
```

Example differences:

LOW:
- shadows off;
- fewer particles;
- lower render scale;
- post-processing reduced.

MEDIUM:
- moderate shadows;
- normal particles;
- basic post-processing.

HIGH:
- full temporal VFX;
- stronger shadows;
- higher render quality.

Do not create separate assets for each quality level.

---

# 76. Loading / Error Handling

If WebGL/WebGPU initialization fails:

Show a clear message:

```text
3D rendering could not be initialized.
Please update your browser or enable hardware acceleration.
```

If an asset fails:

- log developer error;
- show fallback geometry where practical;
- do not crash the whole application.

---

# 77. Accessibility

Implement:

- reduced motion;
- reduced camera shake;
- reduced temporal distortion;
- volume controls;
- readable text;
- keyboard controls;
- clear interaction prompts.

Never make essential puzzle state depend only on color.

---

# 78. Security / Next.js Boundaries

This is primarily a client game.

Do not expose secrets in the browser.

Any optional analytics API key or public ID must use appropriate public environment variables.

Do not create a fake backend merely because Next.js supports server routes.

Use server-side APIs only if a later feature genuinely requires them.

---

# 79. Recommended Dependencies

Keep dependencies focused.

Core:

- next
- react
- react-dom
- three
- @react-three/fiber
- @react-three/drei
- @react-three/rapier
- typescript

Potential:

- zustand for UI/game-state orchestration if needed;
- a post-processing package or direct Three.js post-processing utilities;
- lucide-react for standard UI icons;
- howler or Web Audio APIs for audio if needed.

Do not add libraries simply because they are popular.

Use the smallest dependency set that solves the problem.

React Three Fiber's current stable documentation says v9 pairs with React 19; its v10 documentation is currently marked alpha, so this project should stay on the stable v9 line unless there is a deliberate migration later. citeturn736415search4turn736415search5

Rapier's JavaScript bindings provide 3D rigid bodies/colliders and load through WebAssembly, which means initialization should be treated as an asynchronous part of the game bootstrap. citeturn401331search5turn401331search1

---

# 80. TypeScript Rules

Use strict TypeScript.

Avoid:

```ts
any
```

unless there is a documented unavoidable third-party boundary.

Prefer:

- discriminated unions;
- branded IDs where useful;
- explicit interfaces;
- typed event maps;
- readonly configuration objects.

Example:

```ts
type EntityId = string & { readonly __brand: 'EntityId' };
```

Use normal strings initially if branding adds excessive complexity.

---

# 81. State Management Rules

Separate state into:

### Simulation state

High-frequency.

Lives in simulation systems/refs.

### UI state

Menus, HUD, settings.

Can use Zustand or React state.

### Persistent state

Save manager/localStorage.

Do not put the whole physics world into Zustand.

Do not subscribe the entire canvas to a store that changes every frame.

---

# 82. Suggested Global Store Shape

Only if Zustand is used:

```ts
interface GameStore {
  gameState: GameState;
  currentLevelId: string | null;
  unlockedAbilities: AbilityId[];
  rewindEnergy: number;
  setGameState: (state: GameState) => void;
  setCurrentLevel: (id: string) => void;
}
```

High-frequency object transforms should not be stored here.

---

# 83. Game Bootstrap Sequence

When `/game` loads:

```text
Next.js route
 ↓
Client boundary
 ↓
Game bootstrap
 ↓
Load config
 ↓
Initialize audio
 ↓
Initialize physics
 ↓
Load core assets
 ↓
Load level
 ↓
Build entity registry
 ↓
Create initial snapshot
 ↓
Start simulation
```

Do not start gameplay before essential dependencies are initialized.

---

# 84. Level Loading Sequence

```text
select level
 ↓
stop current simulation
 ↓
dispose previous level
 ↓
load level asset bundle
 ↓
create level entities
 ↓
register rewindable entities
 ↓
create physics bodies
 ↓
set player spawn
 ↓
create initial snapshot
 ↓
start gameplay
```

---

# 85. Level Disposal

When leaving a level:

- remove physics bodies;
- remove entity registrations;
- clear timeline;
- detach event listeners;
- stop level audio;
- dispose temporary effects;
- unload references to models/materials not shared globally.

Shared assets may remain cached where useful.

---

# 86. Initial Prototype Milestone

Before creating menus, story, advanced VFX, or multiple levels, build this exact prototype:

### Scene

A room with:

- floor;
- four walls;
- one door;
- one pressure plate;
- one box;
- player.

### Mechanics

- move;
- jump;
- push box;
- pressure plate opens door;
- player can press Q to rewind;
- box state rewinds;
- player state rewinds;
- door state rewinds;
- timeline truncates after rewinding;
- level completes when player enters exit zone.

### Visual

- basic lighting;
- simple materials;
- simple rewind shader/effect.

Nothing else.

This prototype proves the difficult part.

---

# 87. Milestone 1 — Project Setup

Tasks:

1. Create Next.js project using App Router and TypeScript.
2. Configure React 19-compatible R3F stable version.
3. Install Three.js.
4. Install Rapier 3D integration.
5. Configure client-only game boundary.
6. Create folder structure.
7. Create base game route.
8. Render an empty R3F Canvas.
9. Render a cube.
10. Add camera and lighting.
11. Verify production build.

Acceptance criteria:

- dev server starts;
- production build succeeds;
- `/game` renders a 3D scene;
- no SSR/hydration errors.

Next.js remains responsible for the surrounding application shell, while the interactive game belongs in the client-side rendering boundary. Current Next.js documentation describes the App Router as the newer router for React features, and current Next.js releases in 2026 include the 16.x line. citeturn736415search7turn736415search9

---

# 88. Milestone 2 — Player Controller

Build:

- player entity;
- collision capsule;
- keyboard input;
- camera;
- walk;
- sprint;
- jump;
- gravity;
- ground detection.

Acceptance:

The player can comfortably navigate a test room for 5 minutes without bugs.

---

# 89. Milestone 3 — Physics Objects

Build:

- box;
- dynamic rigid body;
- collider;
- player pushes box;
- collision handling.

Acceptance:

Box behaves predictably across repeated resets.

---

# 90. Milestone 4 — Interaction System

Build:

- raycast interaction;
- E prompt;
- switch;
- door.

Acceptance:

Switch can open/close door.

---

# 91. Milestone 5 — Rewind Prototype

Build:

- TimeController;
- SnapshotStore;
- rewindable interface;
- box snapshots;
- door snapshots;
- switch snapshots;
- player snapshots;
- timeline truncation.

Acceptance:

Player can:

```text
move
→ interact
→ change environment
→ hold Q
→ return to earlier state
→ release Q
→ continue from restored state
```

This is the **critical milestone**.

Do not proceed until this is reliable.

---

# 92. Milestone 6 — Temporal UX

Add:

- rewind meter;
- temporal effect;
- sound;
- ghost trail;
- rewind indicator;
- camera effect.

Acceptance:

The rewind mechanic should visually and audibly feel like a game-defining ability.

---

# 93. Milestone 7 — Level 1

Build the complete first puzzle.

Add:

- start state;
- objective;
- hint;
- completion;
- restart;
- completion screen.

Acceptance:

A new player can discover the mechanic with minimal explanation.

---

# 94. Milestone 8 — Level Framework

Build:

- LevelDefinition;
- LevelManager;
- dynamic level loading;
- disposal;
- save progress.

Acceptance:

Level 1 and Level 2 can be loaded without refreshing the browser.

---

# 95. Milestone 9 — Levels 2–3

Implement:

- falling key;
- breakable barrier.

Do not add new time abilities yet.

Goal:

Prove that rewind alone can support multiple puzzle patterns.

---

# 96. Milestone 10 — Local Pause

Build:

- entity time-scale/control;
- local pause ability;
- visual feedback;
- Level 4.

Acceptance:

Player can pause eligible moving hazards while continuing to move.

---

# 97. Milestone 11 — Timeline Branching

Build explicit future truncation.

Test:

```text
T0 → T1 → T2 → T3 → T4
          ↑ rewind
          T2
          ↓ new actions
          T3' → T4'
```

Old snapshots after T2 must no longer affect the new future.

---

# 98. Milestone 12 — Fast Forward

Implement only after local pause is stable.

Build:

- per-entity time scale;
- authored mechanism acceleration;
- visual effect;
- Level 6.

Avoid accelerating chaotic physics initially.

---

# 99. Milestone 13 — Remaining Levels

Build:

- Level 5 two-timeline puzzle;
- Level 6 acceleration puzzle;
- Level 7 multi-system temporal puzzle;
- Level 8 finale.

Every level should reuse existing object systems whenever possible.

---

# 100. Milestone 14 — Visual Polish

Add:

- environment polish;
- model replacements;
- lighting;
- materials;
- particles;
- post-processing;
- temporal reconstruction effects;
- better camera transitions.

Do not start this phase before all gameplay systems work.

---

# 101. Milestone 15 — Audio Polish

Add:

- complete SFX set;
- ambient music;
- temporal audio;
- UI sounds;
- level transitions.

---

# 102. Milestone 16 — Menus / Settings / Save

Build:

- main menu;
- level select;
- settings;
- credits;
- save system;
- local progress.

---

# 103. Milestone 17 — Optimization

Profile actual levels.

Measure:

- FPS;
- CPU;
- GPU;
- memory;
- snapshot cost;
- asset loading.

Then optimize the biggest bottlenecks.

Do not optimize based on assumptions.

---

# 104. Milestone 18 — QA / Release Candidate

Test:

- all levels;
- reset;
- rewind edge cases;
- browser reload;
- settings persistence;
- level progression;
- asset loading;
- mobile browser fallback message;
- low-quality mode;
- production build.

---

# 105. Milestone 19 — Public Demo / YouTube Build

Create a polished landing page.

Include:

- game title;
- short description;
- playable demo button;
- technology stack;
- GitHub link if desired;
- video link.

The game page should be separate from the marketing page so the game does not load unnecessarily for visitors.

---

# 106. YouTube Content Strategy

The technical build itself is content.

Potential title:

> I Built a Time-Travel Game in Three.js

Alternative:

> Can Next.js Actually Make a 3D Game?

Alternative:

> I Built a Game Where You Can Rewind Time

Potential video structure:

```text
0:00  Show final gameplay
0:15  "I wanted to build a game where time is the weapon"
0:40  Explain concept
1:20  Set up Three.js/R3F
2:30  Build player
4:00  Add physics
5:30  The difficult part: recording time
8:00  Rewind prototype
10:00 Add visual effects
12:00 Build first puzzle
14:00 Build more mechanics
16:00 Final game
18:00 Gameplay montage
```

Do not make the video a long code tutorial.

Make it a **build story**.

---

# 107. YouTube Demo Moments To Intentionally Build

The game should contain scenes that look good in a video.

## Moment 1 — Object Reconstruction

A wall/object explodes.

Player rewinds.

Pieces fly backward and reconstruct the object.

## Moment 2 — Rewind Cascade

Multiple objects rewind together:

```text
box rolls back
→ door closes backward
→ particles reverse
→ lights revert
→ bridge reconstructs
```

## Moment 3 — Local Pause

A laser freezes while the player walks through it.

## Moment 4 — Fast Forward

A massive mechanism suddenly accelerates.

## Moment 5 — Final Core

The entire room undergoes a controlled temporal collapse/recovery.

These are deliberate "showcase moments," not accidental effects.

---

# 108. Trailer Moment

Create a 20–30 second in-game showcase sequence.

Concept:

```text
Player enters room.

Machine activates.

Platform moves.

Box falls.

Door closes.

Player gets trapped.

Player smiles/looks toward camera.

Hold Q.

Everything reverses.

Box flies upward.

Door opens backward.

Platform returns.

Screen glitches.

Player runs through.

CUT TO TITLE:

CHRONO
BREAK THE RULES OF TIME.
```

This sequence can also become the YouTube intro.

---

# 109. Art Direction Rules

Use a limited number of materials.

Prefer:

- geometry with clean silhouettes;
- strong emissive accents;
- fog/atmosphere;
- contrast;
- readable interactive objects.

Do not make every object glow.

Interactive puzzle objects should be visually distinguishable.

---

# 110. UI Art Direction

The UI should feel like a futuristic research device.

Use:

- thin borders;
- compact labels;
- monospace/technical secondary text;
- restrained animation;
- subtle glow.

Avoid overly complicated glassmorphism.

The 3D world should remain the visual focus.

---

# 111. Code Quality Rules For Cursor

Cursor must follow these rules while implementing:

1. Do not rewrite unrelated files.
2. Do not introduce a new architecture without documenting why.
3. Do not create giant files when a system naturally belongs in multiple modules.
4. Do not put gameplay logic directly inside JSX when it belongs in the simulation layer.
5. Do not put high-frequency simulation state into React state unnecessarily.
6. Do not duplicate entity logic between levels.
7. Do not hardcode level-specific behavior inside generic entities.
8. Prefer configuration over branching logic.
9. Keep types strict.
10. Add comments for complex temporal logic.
11. Build one milestone at a time.
12. Keep the application runnable after every milestone.
13. When changing a core temporal system, add or update tests.
14. Never silently remove a mechanic to make a bug disappear.
15. If an implementation tradeoff is required, preserve the gameplay contract described here.

---

# 112. Cursor Execution Protocol

The coding agent should work in this order for every milestone:

```text
1. Read this document.
2. Identify current milestone.
3. Inspect existing implementation.
4. Determine what already works.
5. Implement only the next milestone's scope.
6. Run typecheck/lint/tests.
7. Run production build when practical.
8. Manually verify the acceptance criteria.
9. Fix regressions.
10. Summarize completed work.
11. Move to the next milestone only after acceptance criteria pass.
```

Do not implement all 19 milestones in one giant edit.

The agent should preserve working functionality and make incremental commits where possible.

---

# 113. Suggested NPM Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Adjust the exact lint command according to the current Next.js tooling generated by the installed version.

---

# 114. Development Environment

Recommended:

```text
Node.js LTS
npm/pnpm
Next.js 16.x
React 19
TypeScript
Three.js
React Three Fiber v9
Drei
Rapier 3D
```

Use a lockfile.

Do not update every package mid-development unless necessary.

---

# 115. Git Workflow

Recommended commits:

```text
feat: bootstrap 3d game scene
feat: add player controller
feat: add physics box
feat: add interaction system
feat: add temporal snapshots
feat: add rewind mechanic
feat: add temporal effects
feat: add level one
feat: add level manager
...
```

Avoid commits such as:

```text
stuff
changes
fix
update
```

---

# 116. Branch Strategy

Suggested:

```text
main
 └── develop
      ├── feature/player-controller
      ├── feature/rewind-system
      ├── feature/level-framework
      └── feature/temporal-vfx
```

For a solo project, this can be simplified, but milestone commits should still be clean.

---

# 117. Definition of Done For The Core Engine

The core engine is considered done only when all are true:

- player can move;
- player collides correctly;
- interactive entities work;
- entities can register/unregister;
- snapshots are captured;
- snapshots restore correctly;
- rewind is smooth;
- timeline branches correctly;
- physics resumes correctly;
- level reset is reliable;
- levels can load/unload without memory/resource leaks;
- no major console errors;
- production build succeeds.

---

# 118. Definition of Done For Each Level

A level is done when:

- objective is clear;
- all required mechanics work;
- the puzzle is solvable from a fresh start;
- the puzzle cannot easily soft-lock;
- reset works;
- rewind works at every intended point;
- visual feedback is clear;
- completion is saved;
- hints are available if appropriate;
- level takes roughly 3–10 minutes for a first playthrough;
- performance remains acceptable.

---

# 119. Soft-Lock Prevention

Every level must be evaluated for states where the player could make the puzzle impossible.

Examples:

- box falls permanently outside the playable area;
- door closes with no way to reopen;
- required item becomes inaccessible;
- player gets trapped behind geometry;
- physics object launches into the sky.

Potential safeguards:

- reset zone;
- auto-respawn for critical objects;
- rewindable reset;
- level restart;
- boundary detection.

Prefer preventing these states by level design.

---

# 120. Physics Stability Rules

Do not use physics for purely cosmetic animation.

Do not create enormous mass differences without reason.

Avoid extreme velocities.

Use sensible collider sizes.

For boxes:

- controlled mass;
- moderate friction;
- moderate restitution.

For static environment:

- fixed colliders;
- preferably simple box/capsule/convex geometry instead of giant expensive triangle meshes where possible.

Rapier distinguishes dynamic, fixed, and kinematic rigid-body behaviors; use the simplest appropriate type for each puzzle object rather than making everything dynamic. citeturn401331search1turn401331search10

---

# 121. Sensors / Triggers

Use sensor colliders for:

- exit zones;
- checkpoints;
- hazard detection;
- interaction zones;
- puzzle trigger zones.

Sensors should not physically block the player.

Rapier supports sensor colliders that report intersections without generating ordinary solid contact behavior. citeturn401331search0turn401331search8

---

# 122. Rendering Error Prevention

Avoid accessing browser-only objects during server rendering.

Avoid creating WebGL renderer instances outside the client boundary.

Avoid referencing `window`, `document`, audio contexts, or physics WASM initialization in Server Components.

---

# 123. Mobile Strategy

Initial game:

**Desktop only.**

For mobile users:

Show:

```text
CHRONO is currently optimized for desktop keyboard + mouse.
Mobile support is planned for a future version.
```

Do not build touch controls during the first version.

---

# 124. SEO / Landing Page

Because Next.js is also the website framework, build a real landing page at `/`.

Potential sections:

1. Hero.
2. Short gameplay video.
3. "Control time" explanation.
4. Screenshot/gameplay cards.
5. Technology used.
6. Play now.
7. GitHub/video links.

Do not make the game route itself carry all marketing UI.

---

# 125. Game URL Structure

Recommended:

```text
/
/game
/levels
/settings
```

Optional:

```text
/about
/credits
```

Potential future level links:

```text
/game?level=level-03
```

Keep routing simple initially.

---

# 126. Error Recovery

The game should recover from transient problems where possible.

Example:

If an asset fails:

```text
show fallback mesh
log error
allow restart
```

If localStorage fails:

```text
continue in temporary session mode
```

Do not block gameplay unnecessarily.

---

# 127. Build / Deployment Strategy

Deployment target:

Vercel or any Node-compatible hosting platform capable of serving the Next.js app.

No backend required for the first release.

Important deployment checks:

- static assets correctly served;
- WASM/physics assets load correctly;
- GLB paths work;
- environment variables are configured;
- production build succeeds;
- no dev-only debug overlay appears.

---

# 128. Browser Compatibility Testing

Minimum manual check:

- Chrome desktop;
- Edge desktop;
- Firefox desktop;
- Safari desktop.

The game can gracefully degrade where advanced graphics are unsupported.

---

# 129. Final Polish Checklist

## Gameplay

- [ ] Movement feels good.
- [ ] Rewind feels immediate.
- [ ] Rewind restores state correctly.
- [ ] Branching timeline behaves correctly.
- [ ] Local pause behaves correctly.
- [ ] Fast-forward behaves correctly.
- [ ] Levels are understandable.

## Visuals

- [ ] Lighting polished.
- [ ] Materials consistent.
- [ ] Player readable.
- [ ] Interactive objects readable.
- [ ] Rewind effect looks impressive.
- [ ] Object reconstruction looks impressive.
- [ ] Final sequence looks impressive.

## Audio

- [ ] UI sounds.
- [ ] footsteps.
- [ ] puzzle sounds.
- [ ] temporal sounds.
- [ ] music.
- [ ] success/failure cues.

## Technical

- [ ] production build.
- [ ] no memory leaks from level transitions.
- [ ] no unbounded snapshot memory.
- [ ] no major console warnings/errors.
- [ ] acceptable FPS.
- [ ] settings persist.
- [ ] progress persists.

---

# 130. What NOT To Build

Do not let the scope expand into:

- multiplayer;
- online leaderboards;
- user accounts;
- procedural infinite worlds;
- open-world exploration;
- crafting;
- skill trees;
- complex enemies;
- multiplayer physics;
- online save syncing;
- procedural storytelling;
- VR;
- mobile controls;
- dozens of levels;
- cinematic cutscenes requiring custom animation pipelines.

Those can become future projects.

---

# 131. What Makes This Project Technically Interesting

The project should demonstrate that a modern web stack can handle more than ordinary dashboards and CRUD apps.

The strongest engineering showcase is the temporal simulation architecture:

```text
React / Next.js
      ↓
React Three Fiber
      ↓
Three.js renderer
      ↓
Game simulation
      ↓
Rapier physics
      ↓
Snapshot system
      ↓
Timeline branching
      ↓
Temporal VFX
```

This architecture is also exactly what makes the project useful as a developer portfolio piece.

---

# 132. Recommended Build Order Summary

The complete dependency graph is:

```text
PROJECT BOOTSTRAP
        ↓
3D CANVAS
        ↓
PLAYER
        ↓
PHYSICS
        ↓
INTERACTION
        ↓
ENTITY REGISTRY
        ↓
SNAPSHOT SYSTEM
        ↓
REWIND
        ↓
TIMELINE BRANCHING
        ↓
LEVEL 1
        ↓
LEVEL FRAMEWORK
        ↓
LEVELS 2–3
        ↓
LOCAL PAUSE
        ↓
LEVEL 4
        ↓
ADVANCED TIMELINE PUZZLES
        ↓
FAST FORWARD
        ↓
LEVELS 5–8
        ↓
VFX / AUDIO / UI
        ↓
OPTIMIZATION
        ↓
QA
        ↓
DEPLOY
```

This order is intentional.

Do not invert it by polishing visuals before validating the rewind architecture.

---

# 133. Critical Technical Decision Summary

The following decisions are locked unless there is a compelling implementation reason to change them:

| Area | Decision |
|---|---|
| Framework | Next.js App Router |
| Language | TypeScript |
| UI | React |
| 3D renderer | Three.js |
| React 3D layer | React Three Fiber stable v9 |
| Utilities | Drei where useful |
| Physics | Rapier 3D |
| Camera | Third-person orbit camera |
| Core mechanic | State-snapshot time rewind |
| Timeline | Branching after rewind |
| Rewind input | Hold Q by default |
| Level count | 8 |
| Time abilities | Rewind, local pause, fast-forward |
| Save | localStorage |
| Backend | none initially |
| Art style | stylized futuristic laboratory |
| Controls | keyboard + mouse |
| Deployment | Vercel/Node-compatible hosting |
| First prototype | one room + one rewind puzzle |

---

# 134. Final Agent Instruction

When an AI coding agent receives this document, it must treat this file as the **game design document + technical architecture contract**.

The agent should not attempt to generate the entire project in one response or one code change.

It should implement the project incrementally.

For each milestone:

1. inspect the repository;
2. read the relevant section of this document;
3. implement the smallest complete increment;
4. run checks;
5. fix regressions;
6. verify acceptance criteria;
7. preserve the architecture;
8. update this document only when an actual design decision changes;
9. continue to the next milestone.

Most importantly:

> **Do not build a normal 3D puzzle game and then add rewind as a cosmetic feature. Build the simulation architecture around reversible state from the beginning.**

The rewind system, deterministic authored mechanisms, snapshot registry, and branching timeline are the technical heart of CHRONO.

---

# 135. Reference Notes

Current technical assumptions were checked against the official documentation available in October 2026:

- Next.js documentation and current 2026 release information. citeturn736415search7turn736415search9
- React Three Fiber documentation indicating stable v9 compatibility with React 19 and v10 currently being alpha. citeturn736415search4turn736415search5
- Rapier JavaScript documentation for rigid bodies, colliders, sensors, and asynchronous WASM initialization. citeturn401331search0turn401331search1turn401331search5
- Three.js animation and post-processing documentation. citeturn736415search0turn736415search8turn736415search1

These references are included to anchor the architecture in the currently documented APIs; package versions should still be checked against the lockfile and official release notes at implementation time.

---

# END OF MASTER PLAN
