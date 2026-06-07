# Observable Memory Game

An advanced, modular memory game built with **TypeScript**, **RxJS**, **Handlebars**, and **SCSS/SASS**. This project demonstrates high software engineering standards, including strict separation of concerns, functional and reactive programming, and testable architecture.

---
## Game Description
The Observable Memory Game challenges players to remember and repeat sequences of highlighted squares. Each round, the game displays a pattern for the player to observe, then prompts them to reproduce it by clicking the correct squares in order. With each successful round, the sequence grows longer, testing the player’s memory and attention. The game features clear feedback, level progression, and a modern, interactive UI.

## Architecture & Major Strengths

### 1. **Separation of Concerns**

- UI components (Board, MessageDisplayer) are decoupled from business logic and state management.
- Game logic (rules, state transitions) is centralized in the `domain/rules.ts` file.
- State management is handled via a store, not directly in components.

### 2. **Functional & Reactive Patterns**

- Uses RxJS for sequence emission and state reactivity, enabling a clear, event-driven flow.
- State transitions are pure and composable (e.g., `getNextGameState`, `appliedUSerInputGameState`).
- Immutability is respected throughout (spread operator for state updates).

### 3. **Testability**

- Components are “dumb” and can be tested in isolation.
- Game logic is pure and easily unit-testable.
- State changes are explicit and predictable.

### 4. **Maintainability & Readability**

- Clear naming conventions and modular file structure.
- Use of callbacks for parent-child communication is clean and idiomatic.
- Use of `Partial<GameState>` for reducers is modern and flexible.

### 5. **User Experience**

- Board interactivity is managed based on game phase.
- Flicker and highlight effects are handled cleanly for visual feedback.
- Game phases and messages are explicit and easy to extend.

### 6. **Type Safety**

- All logic is strongly typed with TypeScript, including custom types for game phases, messages, and state.

### 7. **Extensibility**

- The architecture allows for easy addition of new features, game phases, or UI components without breaking existing logic.

---

## Project Structure (Key Files)

- `src/app/memory-game.ts` — Main entry point, orchestrates state and component communication.
- `src/app/components/board/board.ts` — Board UI, emits user actions via callback.
- `src/app/components/message/message-displayer.ts` — Displays game messages.
- `src/app/domain/rules.ts` — Pure functions for all game rules and state transitions.
- `src/app/services/emit-pattern-counter-by-interval.ts` — RxJS logic for emitting pattern sequences.
- `src/app/types/types.ts` — Strongly-typed game state, phases, and messages.

---

## Design Principles

- **Single Source of Truth:** All game state is managed centrally and updated immutably.
- **Unidirectional Data Flow:** UI components emit actions, parent/game logic updates state, and state changes flow back to the UI.
- **Pure Functions:** All game rules and state transitions are pure, making them easy to test and reason about.
- **Reactive UI:** The UI reacts to state changes, notifies on user actions, and never manages business logic directly.

---

## How to Test & Extend

- **Unit Test Pure Functions:** Test `domain/rules.ts` functions with various scenarios.
- **Component Test:** Render Board and MessageDisplayer with mock state for UI tests.
- **Add Features:** Add new phases, messages, or board logic by extending the rules and state types.

---

## Why This Project Stands Out

- Strict separation of concerns and modularity.
- Functional, reactive, and immutable state management.
- Clean, idiomatic TypeScript and RxJS usage.
- Easily testable and extensible architecture.

---

## Features

- TypeScript support with full type safety
- Handlebars templates precompiled and ready to use
- SCSS/SASS modular styles
- Webpack development server with hot-reload
- Production-ready bundling and optimization
- Easy-to-extend project structure

## Getting Started

### Install Dependencies

`npm install`

### Run Development Server

`npm install`

**Run the dev server**

`npm start`

This will start:

* Webpack Dev Server
* TypeScript type checking

# Demo


https://github.com/user-attachments/assets/a97dddd8-8c5c-4b85-b4c8-eca74c3a23fc


