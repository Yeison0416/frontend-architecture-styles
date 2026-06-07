# MVC (Model–View–Controller)

## Summary

MVC splits an application into three roles: **Model** (truth), **View** (display), and **Controller** (user-driven flow). The goal is separation of concerns—each part has one main job.

**One-sentence summary (this project):** This app is **MVC where the Model is split into a state store + domain rules, Views subscribe reactively to state changes, and the Controller orchestrates user events and side effects**—a solid, production-shaped reading of MVC, not a minimal textbook Counter.

The **MVC** reference implementation is [`observable-memory-game`](../../observable-memory-game/)—a memory pattern game built with vanilla TypeScript, Handlebars, and RxJS. See [ARCHITECTURE.md](../../observable-memory-game/ARCHITECTURE.md) in that folder.

The same game domain is reused under other styles (e.g. [`observable-memory-game-mvp`](../../observable-memory-game-mvp/) for MVP) so you can compare **who** listens to events, **who** owns rules, and **who** updates the screen.

---

## The three roles

### Model

- Holds **application state** (data).
- Enforces **rules** on that data (what is valid, what changes after an action).
- Does **not** render the UI or decide how cells are highlighted on screen.

**In the Memory Game example**

The Model is implemented as **two cooperating pieces** (a layered Model, not one class):

| Piece | Location | Job |
|-------|----------|-----|
| **State store (“model manager”)** | `state/game-state-store.ts` | Holds `GameState`, exposes `getState`, `setState`, `subscribe` |
| **Domain rules** | `domain/rules.ts`, `domain/pattern.ts` | Pure functions: initial state, validation, level transitions, pattern generation |

- **State:** `level`, `pattern`, `playerInput`, `gamePhase`, `gameMessage`, etc.
- **Rules (domain):** “Did the player click the correct cell?”, “Is the level complete?”, “What is the next phase?”, “What random pattern should we generate?”
- **Answers:** “What is the game state right now?” — not “which cell is highlighted in the DOM?”

The state store **does not** apply business rules by itself. It only stores truth and **notifies subscribers** when truth changes (via RxJS `BehaviorSubject`). The Controller calls domain functions first, then writes the result into the store with `setState`.

#### Boundary note: Model — state store (`state/`)

Use this when you are about to edit `game-state-store.ts` or add a new store.

| | |
|---|---|
| **Must have** | A single place that **holds** the current `GameState`; methods to **read** it (`getState`), **write** it (`setState`), and **notify** listeners (`subscribe`); merge/publish logic only (e.g. `{ ...current, ...partial }`). |
| **Must not have** | Business rules (“is this click correct?”, “advance level?”); DOM code; event handlers; calls to domain functions inside the store; duplicated state outside the store. |
| **Common confusions** | ❌ Validating input inside `setState` → belongs in **domain**. ❌ Storing UI-only data (highlighted cell index, animation flags) when it can be **derived from `gamePhase` + `pattern` in the View** → keep store for app truth only. ❌ Putting RxJS stream logic beyond holding/emitting state → belongs in **services** or **Controller**. ✅ Wrapping state in `BehaviorSubject` and exposing subscribe → correct for this layer. |

#### Boundary note: Model — domain (`domain/`)

Use this when you are about to edit `rules.ts`, `pattern.ts`, or add a new rule/transition.

| | |
|---|---|
| **Must have** | **Pure** functions: given a `GameState` (and inputs like `cellIndex`), return the **next state** or a **partial update**; game rules, validation, transitions, initial state; testable logic with **no side effects** (inject `Math.random` when randomness is needed, as in `pattern.ts`). |
| **Must not have** | DOM (`document`, `innerHTML`, CSS classes); RxJS (`subscribe`, `interval`); direct store access (`setState`); HTML/templates; knowledge of how the board is drawn. |
| **Common confusions** | ❌ `setTimeout` / flicker delay for cell highlight → **View** (presentation). ❌ Emitting pattern cells every 1s → **service** (timing). ❌ `if (gamePhase === 'USER_TURN') enable clicks` → **View** reads phase; **domain** does not touch the DOM. ❌ Deciding message **wording for display** vs **message type for logic** — type/phase belongs here; purely visual formatting belongs in **View**. ✅ `appliedUSerInputGameState` returning `{ gamePhase: 'GAME_OVER', ... }` → correct. |

### View

- **Renders** what the Model says (updates the DOM when state changes).
- **Does not** own business rules or decide whether a click was correct.
- May wire user interaction once (e.g. forward a click to a callback) but does **not** update game state on its own.

**In the Memory Game example**

Views are **components** that together form the layout:

| Component | Location | Job |
|-----------|----------|-----|
| **Board** | `components/board/board.ts` | Grid of cells; highlights cells; enables/disables clicks by phase |
| **MessageDisplayer** | `components/message/message-displayer.ts` | Shows level info, “YOUR TURN”, game over text |

- **Board** subscribes to `gameStateStore` and updates highlights when `gamePhase` is `SHOW_SEQUENCE` or `USER_TURN`.
- **MessageDisplayer** subscribes and writes `gameMessage.message` to the DOM.
- **Presentation logic** (flicker delay, CSS classes, `pointer-events`) lives in the View— that is display behavior, not game rules.

Unlike a minimal Counter example, the View does **not** wait for the Controller to call `render()`. Both components **subscribe** to the store and refresh automatically when state changes (reactive MVC).

#### Boundary note: View (`components/`, `*.hbs`)

Use this when you are about to edit a component or template.

| | |
|---|---|
| **Must have** | DOM structure (templates); **display** of model data (text, highlights, visibility); **presentation** behavior (CSS classes, flicker timing, `pointer-events`); **subscribe** to the store and update the screen when state changes; optional **one-time wiring** that forwards raw input to a Controller callback (`onCellClick`). |
| **Must not have** | Business rules (correct/wrong cell, level complete, score logic); **`setState`** or any write to the store; owning game truth in local variables that bypass the store; orchestration (“if next level, start pattern sequence”). |
| **Common confusions** | ❌ `if (cellIndex !== expected) game over` inside `Board` → **domain**. ❌ Calling `gameStateStore.setState` from a component → **Controller** (+ domain) owns writes. ✅ `fromEvent` + `onCellClick(cellIndex)` → acceptable: View detects click, **Controller** decides meaning. ✅ Highlight cell when `gamePhase === 'SHOW_SEQUENCE'` → presentation driven by model **read-only**. ❌ Duplicating `pattern` or `level` in component state “for performance” without syncing from store → breaks single source of truth. |

### Controller

- **Handles user-driven flow** (what to do when the user clicks a cell, when to start a level, when to advance).
- **Orchestrates**: on input → apply domain rules → update Model (store) → (Views react via subscription).
- **Starts side flows** such as the timed pattern sequence (via a service).
- Does **not** replace the Model as the source of truth (game state lives in the store, not in closure variables inside the Controller).

**In the Memory Game example**

The Controller lives in **`memory-game.ts`** (`MemoryGame` function):

- Renders the root template and creates the `gameStateStore`.
- Defines `onCellClick` — the handler the Board calls when a cell is clicked.
- Calls **domain** functions (`appliedUSerInputGameState`, `getNextLevelGameState`, `getNextGameState`) then **`setState`** on the store.
- Instantiates View components (`Board`, `MessageDisplayer`).
- Starts the pattern sequence (`patternSequence` → `getPatternSequence` service → store updates).

#### Boundary note: Controller (`memory-game.ts`)

Use this when you are about to edit handlers, bootstrap, or orchestration.

| | |
|---|---|
| **Must have** | App **bootstrap** (root template, create store, create components); **thin handlers** for user events; **orchestration**: call **domain** → **`setState`** → optionally start **services**; wiring View callbacks to handler functions; coordinating side flows (start pattern sequence after level up). |
| **Must not have** | Business rules inline (validation, phase rules, “what is the next level?”); DOM updates beyond initial root render; long-lived duplicate of `GameState` in closures; presentation logic (CSS, highlight animation); low-level RxJS pipe details (belong in **services**). |
| **Common confusions** | ❌ `if (cellIndex !== expectedCellIndex) { ... }` inside `onCellClick` → move to **domain**. ❌ `boardCells[i].classList.add(...)` in the handler → **View**. ❌ Building the interval/pattern stream inside `memory-game.ts` → extract to **service**, Controller only subscribes. ✅ `setState(appliedUSerInputGameState(...))` → correct orchestration. ❌ Growing `memory-game.ts` with every new rule → new rule functions in **domain**, Controller stays thin. |

---

## Supporting layers

These are **not** a fourth or fifth MVC role. They support the three roles by sharing contracts (**types**) and technical plumbing (**services**).

### Services (`services/`)

**Responsibility:** Wrap **how** something is done technically—timings, streams, third-party APIs, reusable infrastructure—without owning app truth or UI.

**In the Memory Game example**

| File | Job |
|------|-----|
| `emit-pattern-counter-by-interval.ts` | Uses RxJS to emit `{ cellIndex, count }` one cell at a time on an interval; calls **domain** `pattern()` for *what* to show, not *whether* the game is valid |

The **Controller** calls `getPatternSequence(gameState)` and, on each emission, runs **domain** `getNextGameState` and **store** `setState`. The service never writes to the store by itself.

#### Boundary note: Services

Use this when you are about to add or edit a file under `services/`.

| | |
|---|---|
| **Must have** | Technical capabilities: intervals, observables, HTTP clients, localStorage adapters, etc.; inputs/outputs as **types**; delegation to **domain** for game/business data when needed (e.g. `pattern()` for cell indices). |
| **Must not have** | Business rules (validation, win/lose, level rules); **`setState`** or owning `GameState`; DOM updates; deciding **what the UI should show** beyond returning data/events to the Controller. |
| **Common confusions** | ❌ “If count === pattern length, set USER_TURN” inside the service → **domain** + **Controller**. ❌ Subscribing to the service **inside** the service and updating the store → **Controller** owns that subscription. ✅ `interval(1000).pipe(...)` to pace emissions → correct. ✅ Calling `pattern(length, random, gridSize)` from domain → correct reuse. ❌ Putting `getPatternSequence` logic in **View** because it “feels like animation” → timing/stream is **service**; visual highlight is **View**. |

### Types (`types/`)

**Responsibility:** Define **shared shapes and contracts** used across layers—what `GameState` contains, what a store exposes, what phases and messages exist—so Model, View, Controller, and services agree on the same vocabulary without circular imports or hidden assumptions.

**In the Memory Game example**

| Type | Purpose |
|------|---------|
| `GameState` | Full shape of app truth (level, pattern, playerInput, gamePhase, …) |
| `GamePhase` | Allowed phase values (`INIT`, `SHOW_SEQUENCE`, `USER_TURN`, …) |
| `GameStateStore` | Contract for store: `getState`, `setState`, `subscribe` |
| `PatternCounter`, `CellIndex`, … | Shared payloads between service, domain, and Controller |

Types describe **what data looks like**; they do not **change** data or **render** it.

#### Boundary note: Types

Use this when you are about to add or edit a file under `types/`.

| | |
|---|---|
| **Must have** | `type` / `interface` definitions; unions/enums for fixed sets (e.g. `GamePhase`); readonly arrays where immutability matters; contracts between layers (`GameStateStore`). |
| **Must not have** | Business logic (validation, transitions); DOM code; RxJS pipelines; **`setState`** or store implementation; functions that implement game rules (those belong in **domain**). |
| **Common confusions** | ❌ `function appliedUSerInputGameState` in `types.ts` → **domain**. ❌ `GRID_SIZE` / `INIT_LENGTH_PATTERN` as “just constants” in types when they encode **game rules** → **domain** (as in this project’s `rules.ts`). ✅ `GameState` interface → correct. ✅ `GameStateStore` interface describing store API → correct. ❌ Helper that mutates or computes next state “for convenience” in types → **domain**. |

---

## Typical sequence

### User clicks a cell (user turn)

1. User clicks a cell on the **Board** (View).
2. **Board** forwards `cellIndex` to `onCellClick` (Controller handler).
3. **Controller** updates the store (append input, set phase) and calls **domain** validation.
4. **Domain** returns the next partial state (still valid, game over, or next level).
5. **Controller** writes that result to the **Model** (store) with `setState`.
6. **Views** (Board, MessageDisplayer) receive the new state via **subscription** and update the DOM.

```text
User click  →  View (forward)  →  Controller  →  Domain (rules)  →  Model/store (setState)  →  View (subscribe → DOM)
```

### Pattern sequence (computer turn)

1. **Controller** calls `getPatternSequence(gameState)` (service).
2. **Service** emits `{ cellIndex, count }` over time (RxJS).
3. **Controller** subscribes; on each emission calls `getNextGameState` (domain) and `setState` (store).
4. **Board** and **MessageDisplayer** react to each state change and show the sequence / messages.

```text
Controller  →  Service (timing/stream)  →  Domain (rules)  →  Model/store  →  View (subscribe → DOM)
```

### Classic Counter vs this project

| Step | Minimal Counter (manual MVC) | Memory Game (reactive MVC) |
|------|------------------------------|----------------------------|
| User acts | Click **+** on View | Click cell on Board |
| Controller | `model.increment()` | `onCellClick` → domain → `setState` |
| Model | Updates `count` | Store merges new `GameState` |
| View refresh | Controller calls `view.render(model)` | Views already subscribed; update automatically |

Same roles. Different **wiring**: subscriptions replace explicit `render()` calls.

---

## User interaction and event handlers

In MVC, **user interaction always enters through the View** (the user clicks something visible), but **handler logic belongs to the Controller**.

| Concern | Owner | Memory Game |
|---------|--------|-------------|
| What the user sees and clicks | View | Board cells, layout template |
| Listening to clicks / input | View wires once → Controller owns handler | `fromEvent` in Board → calls `onCellClick` in `memory-game.ts` |
| What changes when they click | Model (domain + store) | `appliedUSerInputGameState`, then `setState` |
| Updating the screen after a change | View | `gameStateStore.subscribe` in Board and MessageDisplayer |

### Recommended flow

1. **View** builds the interactive UI (board grid, message area).
2. **View** attaches input wiring **once** (Board listens for clicks, calls `onCellClick`).
3. On event (cell click):
   - **Controller** runs the handler.
   - **Controller** calls **domain** functions (rules).
   - **Controller** updates the **Model** (store) with `setState`.
4. **View** subscribers read state **only for display**—not to decide if the click was valid.

### Rules of thumb

- **Do not** put business rules in the click handler (e.g. “if cell !== expected then game over” belongs in **domain**, not inline in `onCellClick`).
- **Do not** update highlights or messages by mutating DOM in the handler without going through the store (that bypasses the Model as truth).
- **Do** keep handlers thin: gather input → call domain → `setState` → optionally trigger a service (pattern sequence).
- **Do** keep domain functions **pure** (same input → same output; no DOM, no RxJS)—easier to test.

### Memory Game: who does what on a cell click

| Step | Role | What happens |
|------|------|----------------|
| 1 | View (`Board`) | User clicks a cell; `fromEvent` fires |
| 2 | View → Controller | Board calls `onCellClick(cellIndex)` |
| 3 | Controller | `setState` with new `playerInput` and phase `USER_INPUT_VALIDATION` |
| 4 | Domain | `appliedUSerInputGameState(state, cellIndex)` — correct, wrong, or level complete |
| 5 | Controller | `setState` with domain result |
| 6 | Controller | If phase is `NEXT_LEVEL`: `getNextLevelGameState`, `setState`, start `patternSequence` |
| 7 | Model (store) | Emits new `GameState` to subscribers |
| 8 | View | Board updates highlights / interactivity; MessageDisplayer updates text |

The Board does not decide if the click was correct. The Controller does not permanently own `pattern` or `level`—the store does.

---

## Shared example walkthrough (Memory Game)

### Project layout → MVC roles

```text
observable-memory-game/src/app/
├── memory-game.ts              → Controller (orchestration, handlers, bootstrap)
├── memory-game.hbs             → View (root layout template)
├── state/
│   └── game-state-store.ts     → Model (state holder + notify)
├── domain/
│   ├── rules.ts                → Model (business rules / transitions)
│   └── pattern.ts              → Model (pattern generation)
├── components/
│   ├── board/                  → View
│   └── message/                → View
├── services/
│   └── emit-pattern-counter-by-interval.ts  → Infrastructure (not a 4th MVC role)
└── types/
    └── types.ts                → Shared types (GameState, GamePhase, …)
```

### Role responsibilities (concrete)

| Role | Files | Concrete responsibility |
|------|-------|-------------------------|
| **Model (store)** | `game-state-store.ts` | `BehaviorSubject<GameState>`; `getState`, `setState`, `subscribe` |
| **Model (domain)** | `rules.ts`, `pattern.ts` | `initialGameState`, `appliedUSerInputGameState`, `getNextLevelGameState`, `getNextGameState`, `pattern()` |
| **View** | `board.ts`, `message-displayer.ts`, `*.hbs` | Subscribe to store; update DOM; forward clicks to Controller |
| **Controller** | `memory-game.ts` | Create store and components; `onCellClick`; `patternSequence`; `startGame` |
| **Services** | `emit-pattern-counter-by-interval.ts` | RxJS timing: emit pattern cells one-by-one; used **by** Controller |
| **Types** | `types.ts` | `GameState`, `GamePhase`, `GameStateStore`, shared payloads—contracts only |

### How domain maps to game behavior

| Domain function | Rule it encodes |
|-----------------|-----------------|
| `initialGameState()` | Starting level, empty pattern/input, initial phase |
| `getNextGameState(...)` | Append to pattern during show sequence; set message and phase (`SHOW_SEQUENCE` / `USER_TURN`) |
| `appliedUSerInputGameState(...)` | Wrong cell → `GAME_OVER`; full match → `NEXT_LEVEL` |
| `getNextLevelGameState(...)` | Increment level and pattern length; reset for next round |
| `pattern(...)` | Generate random cell indices for the grid |

For **must have / must not / common confusions** per layer, see the **Boundary note** under each role and under [Supporting layers](#supporting-layers).

Same Memory Game app is used for other architecture styles in this wiki—compare **who** listens to events, **who** applies rules, and **who** updates the screen.

---

## Reactive MVC (why RxJS here)

Strict vanilla MVC often looks verbose: every state change needs an explicit call to refresh the View (`view.render(model)`).

This project uses **reactive binding**:

- The store wraps state in a `BehaviorSubject`.
- Views **subscribe** once at setup.
- When the Controller calls `setState`, subscribers run and update the DOM.

That is still MVC:

- **Model** still owns truth (store + domain).
- **View** still only displays (and wires input to the Controller).
- **Controller** still orchestrates events and updates—the difference is it does **not** call `render()` manually; notification is built into the Model (Observer pattern on the store).

RxJS is used in three places:

1. **Store** — `BehaviorSubject` for state + notification (`game-state-store.ts`).
2. **Board click** — `fromEvent` to listen for clicks (`board.ts`).
3. **Pattern service** — `interval`, `concat`, etc. for timed sequence emission (`emit-pattern-counter-by-interval.ts`).

Libraries implement the **glue**; they do not replace the three roles.

Because this project uses **subscriptions** (store, `fromEvent`, pattern service), applying MVC here includes **error handling**, **lifecycle cleanup**, **accessibility**, and **testing** as part of the development flow—not as an afterthought.

---

## MVC development flow (roadmap)

Build order for this style (same Memory Game domain):

1. **types/** → contracts (`GameState`, `GamePhase`, …)
2. **domain/** → pure rules (+ unit tests)
3. **state/** → store with `getState` / `setState` / `subscribe`
4. **services/** → streams/timing *(if needed)*
5. **memory-game.ts** → Controller: handlers, domain → `setState`
6. **components/** → View: subscribe to store, render, forward clicks
7. **Integrate & harden** → lifecycle, a11y, errors, tests

Cross-cutting details by layer:

- [Error handling](#error-handling)
- [Lifecycle (subscribe & unsubscribe)](#lifecycle-subscribe--unsubscribe)
- [Accessibility](#accessibility)
- [Testing](#testing)

Compare with the MVP phased roadmap in [mvp.md](./mvp.md#mvp-development-flow-roadmap).

---

## Error handling

Errors still respect MVC boundaries: **domain** decides what went wrong in app terms; **Controller** decides what to do about it; **Model (store)** holds error/phase state if the UI must reflect it; **View** shows a safe message; **services** surface technical failures without owning user messaging.

### By layer

| Layer | Owns | Must not |
|-------|------|----------|
| **Domain** | Invalid inputs, impossible transitions, rule violations expressed as **return values** (e.g. partial state with `gamePhase: 'GAME_OVER'`) or explicit result types (`{ ok: true, state } \| { ok: false, reason }`). Pure functions: no `try/catch` around DOM or fetch unless you later add a dedicated domain boundary. | Catching errors and writing to the DOM; showing toast messages; logging with user PII. |
| **Controller** | Orchestration failures: wrap risky calls if needed; map domain/service results to **`setState`**; start/stop side flows safely; **never** let raw exceptions become the UI. | Inline user-facing error strings scattered in handlers; swallowing errors silently; exposing stack traces or internal paths to the View. |
| **Model (store)** | Optionally hold **error-related state** already modeled in `GameState` (e.g. `gamePhase: 'GAME_OVER'`, `gameMessage`). | Business validation inside `setState`; try/catch as a substitute for domain rules. |
| **View** | **Display** error/terminal states from the store (`gameMessage`, disabled board). Generic fallback copy if state is unexpected. | Decide *whether* the user lost—that is **domain**; call APIs to “handle” errors. |
| **Services** | Technical failures: failed timers, broken streams, HTTP/network errors via RxJS `error` callback or `catchError` **at the service boundary**, then return/emit a typed failure the **Controller** handles. | Set game phase to `GAME_OVER`; update DOM; hide errors from the Controller. |
| **Types** | Error/phase unions (`GamePhase`, `GameMessage` variants) so layers agree on allowed outcomes. | Throw/catch logic. |

### Rules of thumb

- **Prefer model-shaped errors** — In this game, “wrong cell” is not a thrown exception; it is a **state transition** to `GAME_OVER`. That keeps flow predictable and easy to test.
- **Throw only for truly exceptional cases** — Programmer bugs, corrupted state, service completely unavailable. Controller (or a thin app shell) catches and maps to a **safe store state** + generic user message.
- **One path to the user** — User-visible text comes from **state the View already reads** (e.g. `gameMessage`), not from `alert()` in the Controller.
- **Log server-side (or dev console) in Controller/service** — full detail for debugging; generic message in the View. Do not log sensitive data.

### Memory Game today

| Area | Current behavior | MVC-aligned note |
|------|------------------|------------------|
| Wrong cell | Domain returns `GAME_OVER` + message; View shows it | ✅ Error as **state**, not exception |
| Invalid click / missing DOM node | `Board` uses `!` on `querySelector`; no guard | ⚠️ **View** should fail safe (early return) or **Controller** should not mount until layout exists |
| Pattern service / RxJS | No `error` handler on `patternSequence` subscribe | ⚠️ **Controller** should handle stream errors and set a safe phase/message |
| `onCellClick` | No guard if click arrives during `SHOW_SEQUENCE` | ⚠️ **Domain** or **Controller** should ignore or reject input by phase |

When adding features, ask: *Is this an expected outcome (domain state) or an exceptional failure (catch + map to state)?*

---

## Lifecycle (subscribe & unsubscribe)

Reactive MVC introduces **long-lived listeners**. Part of applying this architecture is deciding **who subscribes**, **how long subscriptions live**, and **who tears them down**—otherwise you get memory leaks, duplicate handlers, or stale updates after navigation/unmount.

### Principles

| Question | Answer in this project |
|----------|-------------------------|
| Who subscribes to the **store**? | **Views** (`Board`, `MessageDisplayer`) — display updates |
| Who subscribes to **services**? | **Controller** (`patternSequence` in `memory-game.ts`) — orchestration |
| Who subscribes to **DOM events**? | **View** (`fromEvent` in `Board`) — forward to Controller |
| Who must **unsubscribe**? | Whoever created the subscription, **or** a parent **Controller** that owns app lifetime |
| When to tear down? | When the app/feature is destroyed (remove root, navigate away, restart game), or before replacing a side flow (new pattern sequence) |

### By layer

| Layer | Lifecycle responsibility |
|-------|---------------------------|
| **Controller** | Own **app/session lifetime**; keep references to service subscriptions; **unsubscribe** before starting a new `patternSequence`; expose `destroy()` / `stop()` if the app can be torn down; avoid creating duplicate subscriptions on level up. |
| **View** | Subscribe to store once at mount; return a **teardown** function (unsubscribe store + DOM listeners) when the component is destroyed; cancel in-flight **presentation** work (timeouts, async highlight) if state changes mid-animation. |
| **Model (store)** | Usually lives as long as the app; complete `BehaviorSubject` only on full shutdown if you need to release observers. |
| **Services** | Return **cold** observables when possible (`getPatternSequence` per call); let the **Controller** subscribe and unsubscribe; use operators like `takeUntil(destroy$)` when streams must end with the feature. |
| **Domain** | No subscriptions; no lifecycle (pure functions). |

### Known gaps in Memory Game (honest audit)

The reference app prioritizes learning MVC structure; it **does not yet** implement full lifecycle cleanup. When extending it—or any reactive MVC app—address these:

| Location | What happens today | Risk | MVC-aligned fix |
|----------|-------------------|------|-----------------|
| `memory-game.ts` → `patternSequence` | Each call `.subscribe(...)` with **no** stored `Subscription` / unsubscribe | New level starts a **new** stream while the old one may still run → duplicate `setState`, leaks | Controller keeps one subscription; **unsubscribe** before subscribing again, or use `switchMap` / `takeUntil` |
| `board.ts` → `fromEvent(...).subscribe` | Never unsubscribed | Leak if Board is ever remounted | View returns `{ destroy() { sub.unsubscribe() } }` |
| `board.ts` → `gameStateStore.subscribe(async ...)` | Async handler + no unsubscribe | Overlapping delays if state changes quickly; leak on unmount | Use teardown flag, `AbortController`, or cancel previous animation; unsubscribe on destroy |
| `message-displayer.ts` → `subscribe` | Never unsubscribed | Same as Board | Return teardown from component |
| Full app teardown | `MemoryGame` returns only `{ startGame }` | No way to stop all listeners when removing `#app-root` | Controller returns `{ startGame, destroy }` that unsubscribes all owned subscriptions |

These gaps do **not** invalidate the architecture doc; they define the **next hardening step** when treating this as production-shaped MVC.

### Recommended pattern (development flow)

When you add a subscription, complete this checklist in the same PR:

1. **Who owns it?** (Controller vs View)
2. **What ends it?** (navigation, game over, new level, explicit stop)
3. **Store the `Subscription`** (or use `takeUntil(destroy$)`)
4. **Call unsubscribe in teardown** — symmetric to setup
5. **Async View work** — if subscriber uses `await delay(...)`, guard against stale state (e.g. compare phase/token after await)

```text
Setup (mount / startGame)
  → subscribe(store | service | DOM)
  → keep Subscription reference on owner (Controller or View)

Teardown (destroy / game over / before restart)
  → subscription.unsubscribe()
  → cancel pending timers/animations in View
  → optional: complete store subject if app fully disposes
```

### Async subscriber caution (`Board`)

`Board` uses `async` inside `gameStateStore.subscribe`. If two state updates arrive before `delay` finishes, highlights can run **out of order**. Lifecycle and error handling meet here:

- **Lifecycle fix:** unsubscribe or use a generation counter / `AbortSignal` so stale async work is ignored.
- **Not an error exception** — usually a **presentation** bug; still fixed in the **View**, not by throwing in the Controller.

---

## Accessibility

Accessibility (a11y) is primarily a **View** responsibility: the UI must be perceivable and operable for keyboard, screen reader, and other assistive technology users. MVC still applies—**domain** and **Controller** support accessibility by putting **meaning** in state; the **View** exposes that meaning in the DOM with correct semantics.

### By layer

| Layer | Owns | Must not |
|-------|------|----------|
| **View** | Semantic HTML; **ARIA** when HTML alone is not enough; **keyboard** focus and activation (`button` / `role="button"` + `tabindex="0"` + Enter/Space); visible **focus indicators**; **`aria-live`** / status regions for changing messages; **`aria-disabled`** or remove from tab order when board is not interactive; sufficient **color contrast** (CSS); don’t rely on color/highlight alone (pair with text in `MessageDisplayer`). | Encode game rules in ARIA; hide all state from assistive tech; use `div`-only clickable cells with no label, role, or keyboard path. |
| **Controller** | Ensure phase changes that affect interactivity reach the store so the **View** can update `pointer-events`, `tabindex`, and `aria-disabled` together; optional **focus management** after major transitions (e.g. focus message area on `GAME_OVER`)—orchestration only. | Build the whole accessible tree inline in handlers; skip updating state and manipulate ARIA only in Controller. |
| **Model (domain + store)** | State that carries **accessible meaning**: `gameMessage.message`, `gamePhase` (computer turn vs user turn vs game over). Messages should be human-readable; phases drive what the View announces and whether input is allowed. | DOM attributes; knowledge of screen readers. |
| **Services** | Generally none for this app. If a service drove UI directly, it would bypass accessible View updates—avoid. | Announcements or focus changes inside services. |
| **Types** | Optional: document message/phase variants that Views must announce (already partly modeled by `GameMessage`, `GamePhase`). | — |

### Rules of thumb

- **Perceivable** — Sequence shown only by highlight must also be reflected in **text** (`MessageDisplayer` / live region): e.g. “Showing pattern”, “Your turn”, “Game over”.
- **Operable** — If the user can click a cell with a mouse, they must be able to activate it with **keyboard** (native `<button>` per cell is simplest).
- **Understandable** — Cell labels for assistive tech: e.g. `aria-label="Cell 1 of 9"` or visible text; don’t expose only `data-index` with no accessible name.
- **Robust** — Prefer native elements; use ARIA to **fill gaps**, not replace good HTML.
- **Single source for “can user act?”** — `gamePhase` + domain rules define truth; View maps that to disabled state **and** keyboard/ARIA (same as `pointer-events` today).

### Memory Game today

| Area | Current behavior | MVC-aligned note |
|------|------------------|------------------|
| Board cells | Plain `<div>` with click only | ⚠️ **View**: use `<button type="button">` or add role, tabindex, keyboard handler, accessible name |
| Status text | `MessageDisplayer` sets `innerText` | ⚠️ **View**: wrap in `aria-live="polite"` (or `assertive` for game over) so updates are announced |
| Interactivity | `pointer-events: none` during sequence | ⚠️ **View**: also `aria-disabled="true"` / `tabindex="-1"` on cells so keyboard matches mouse |
| Game meaning | `gameMessage` + `gamePhase` in store | ✅ **Model** already holds text/phases the View can expose to AT |
| Color / highlight | CSS class `--highlighted` | ⚠️ **View**: pair with message text; don’t rely on color alone |

When adding UI, ask: *Can someone play this without seeing the highlight? Without a mouse? Will screen readers hear phase changes?*

---

## Testing

MVC boundaries map directly to **test types**: pure **domain** → fast unit tests; **store** → behavior tests; **Controller** → orchestration tests with mocks; **View** → DOM/component tests; **services** → marble/time-based tests; full app → few integration/e2e tests.

### By layer

| Layer | What to test | Typical approach | Avoid |
|-------|----------------|------------------|--------|
| **Domain** | Rules and transitions: wrong cell, level up, pattern length, invalid phase | **Unit tests** (Jest/Vitest): given `GameState` + input → expect partial/full next state. No DOM, no RxJS. | Testing through the DOM; real `Math.random` without injection |
| **Model (store)** | `getState`, `setState` merge, subscribers notified | Unit test: mock subscriber; `setState` → callback received expected `GameState` | Business rules inside store tests (belong in domain tests) |
| **Controller** | Handlers call domain + `setState` in order; start/stop pattern on level up; phase guards | **Integration-style** with **mock store** and **mock service**; assert `setState` calls and subscriptions | Full browser unless testing bootstrap; duplicating domain rule assertions |
| **View** | Renders message for phase; disables board when not `USER_TURN`; forwards click to callback | **DOM tests** (Testing Library / jsdom): render with mock store or emit state; query by role/label | Asserting game rules in View tests; testing domain logic here |
| **Services** | Emission timing and shape `{ cellIndex, count }`; uses domain `pattern()` | RxJS **marble tests** or fake timers; inject deterministic `random` | Game-over rules; DOM |
| **Types** | Usually no runtime tests; TypeScript compiler validates shapes | `tsc --noEmit` | — |
| **End-to-end** | Critical user journeys: watch sequence → repeat → level up / game over | Playwright/Cypress (sparingly) | Replacing domain unit coverage |

### Recommended test layout (development flow)

```text
domain/*.test.ts          → unit (highest ROI for this project)
state/*.test.ts           → store notify/merge
services/*.test.ts        → streams + timers (fake async)
memory-game.test.ts       → controller orchestration (mock store + service)
components/*.test.ts      → view + a11y (roles, labels, live regions)
e2e/                      → optional smoke path
```

When you add a feature, pair it with tests at the **lowest layer that owns the behavior**:

1. New rule → **domain** test first.
2. New orchestration branch → **Controller** test with mocks.
3. New UI feedback → **View** test (including a11y queries: `getByRole`, `getByLabelText`).

### Rules of thumb

- **Test behavior, not implementation** — Assert resulting state or DOM, not “was private function X called”.
- **Domain is the safety net** — Most regressions in this game are wrong transitions; domain tests give the best coverage per line.
- **Mock across boundaries** — Controller tests mock store/service; View tests mock store or push state into a test double.
- **Inject non-determinism** — `pattern(length, randomFn, gridSize)` already accepts `random`; use fixed RNG in tests (as the service can pass a stub when testing).
- **Accessibility in View tests** — Prefer queries that reflect user/AT experience (`getByRole('button', { name: /cell 1/i })`) over `data-index` alone.

### Memory Game today

| Area | Current behavior | Note |
|------|------------------|------|
| Test script | `package.json`: `"test": "echo \"Error: no test specified\" && exit 1"` | ⚠️ No automated tests wired yet |
| Domain | Pure functions in `rules.ts`, `pattern.ts` | ✅ Ready for unit tests **without** refactoring |
| Store | Thin `BehaviorSubject` wrapper | ✅ Easy to test subscribe/merge in isolation |
| Controller / View / services | No test files in repo | ⚠️ Document and architecture support testing; implementation is next step |

The README describes testability as a goal; this wiki section defines **where** tests live in MVC. Adding `domain/rules.test.ts` is the natural first milestone.

---

## Pros

- Clear **separation of concerns**: state, rules, display, and orchestration have named homes.
- **Domain purity** makes rules testable without DOM or RxJS.
- **Reactive Views** avoid repetitive manual `render()` after every `setState`.
- Easier to change UI (components) without rewriting rules (domain)—and vice versa—when boundaries stay strict.
- Model (store + domain) can be reasoned about without the DOM.

## Cons

- **Layered Model** (store + domain) is more files than a single `CounterModel` class—discipline is needed to know which file owns what.
- If the Controller grows without boundaries, `memory-game.ts` can become a “god” orchestrator (many `setState` calls, branching on `gamePhase`).
- View wiring clicks inside `Board` while handler logic lives in `memory-game.ts` is valid but requires a clear convention so roles do not blur over time.
- Multiple `setState` calls per user action (append input, then validate) can be tightened into one domain transition later.
- **Lifecycle cleanup is not fully implemented** in the reference app yet (see [Lifecycle](#lifecycle-subscribe--unsubscribe)); reactive MVC needs explicit teardown to be production-safe.
- **Error handling** relies mostly on domain state (`GAME_OVER`); stream and mount failures are not yet handled end-to-end.
- **Accessibility** is not implemented yet (div-only cells, no live regions, keyboard path)—ownership is documented under [Accessibility](#accessibility).
- **Automated tests** are not set up yet despite test-friendly boundaries—see [Testing](#testing).

---

## Quick check

For any line of code, ask:

1. Is it defining **truth or rules**? → **Model** (`state/` or `domain/`)
2. Is it **showing** truth or presentation (CSS, highlights, text)? → **View** (`components/`, templates)
3. Is it **reacting to the user** or connecting Model and side flows? → **Controller** (`memory-game.ts`)
4. Is it **timing, streams, or third-party plumbing** with no business rule? → **Service** (`services/`)
5. Is it only describing **shape or contracts** with no runtime behavior? → **Types** (`types/`)

If two roles feel equally valid for one line, open the **Boundary note** for both layers and check **Common confusions**—that is usually where MVC gets fuzzy in real apps.

### Where does this code go? (cheat sheet)

| You are writing… | Layer |
|------------------|--------|
| “Wrong cell → game over” | domain |
| `BehaviorSubject` + `setState` | state store |
| Highlight cell / flicker / message text on screen | View |
| `onCellClick` → domain → `setState` | Controller |
| `interval(1000)` / pattern emission stream | services |
| `type GamePhase = 'INIT' \| ...` | types |
| Wrong cell → `gamePhase: 'GAME_OVER'` (expected outcome) | domain |
| RxJS stream failed → map to safe state in handler | Controller |
| `subscription.unsubscribe()` on destroy / before new pattern run | Controller or View (who subscribed) |
| Show game over message on screen | View (reads `gameMessage` from store) |
| `aria-live` region / keyboard cell buttons | View |
| “Your turn” text for screen readers | View (from `gameMessage` in store) |
| Unit test for `appliedUSerInputGameState` | domain (`*.test.ts`) |
| Test that `setState` notifies subscribers | state store test |
| Mock store + assert `onCellClick` calls domain | Controller test |
| Marble test for `getPatternSequence` emissions | services test |
