# Front-end architecture styles

One page per style. Each page uses the **same example app** so you can compare how roles and flow change—not the domain.

## Shared example: Memory Game

Same game, different architecture styles. Each style has its **own app folder** so you can diff implementations.

| Style | App folder | Documentation |
|-------|------------|---------------|
| MVC | [`observable-memory-game`](../../observable-memory-game/) | [mvc.md](./mvc.md) |
| MVP | [`observable-memory-game-mvp`](../../observable-memory-game-mvp/) | [mvp.md](./mvp.md) |
| MVVM | [`observable-memory-game-mvvm`](../../observable-memory-game-mvvm/) | [mvvm.md](./mvvm.md) |

Reference projects live at the repo root. See [README](../../README.md) for layout and how to run each app.

| Piece | Responsibility in every style |
|-------|-------------------------------|
| State | Level, pattern, player input, game phase, messages |
| Rules | Validate clicks, advance levels, generate patterns, phase transitions |
| UI | Grid board, cell highlights, status messages |
| User actions | Click cells during the player’s turn; game starts automatically |

When comparing architecture styles, keep this domain fixed and ask: **who holds state, who applies rules, who handles input, and who updates the screen?**

## Index

| Style | Doc |
|-------|-----|
| MVC (Model–View–Controller) | [mvc.md](./mvc.md) |
| MVP (Model–View–Presenter) | [mvp.md](./mvp.md) |
| MVVM (Model–View–ViewModel) | [mvvm.md](./mvvm.md) |

<!-- Add links here as new styles are documented. -->
