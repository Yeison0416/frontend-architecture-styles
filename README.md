# dev-mind-map

Personal knowledge base for how I learn, structure, and build front-end software—plus runnable example apps that implement the same **Memory Game** under different architecture styles.

## What lives here

| Path | Purpose |
|------|---------|
| [mind-map.md](./mind-map.md) | Personal map of learning phases (stack → structure & state → …) |
| [studying-foundations-in-the-ai-era.md](./studying-foundations-in-the-ai-era.md) | Notes on foundations vs AI-assisted development |
| [wiki/architecture-styles/](./wiki/architecture-styles/) | One doc per architecture style, same example domain |
| [observable-memory-game/](./observable-memory-game/) | **MVC** reference implementation (reactive Views subscribe to store) |
| [observable-memory-game-mvp/](./observable-memory-game-mvp/) | **MVP** reference implementation *(copy created; MVP refactor in progress)* |

## Architecture styles wiki

Start at [wiki/architecture-styles/README.md](./wiki/architecture-styles/README.md).

| Style | Documentation | Example app |
|-------|---------------|-------------|
| MVC | [mvc.md](./wiki/architecture-styles/mvc.md) | [observable-memory-game](./observable-memory-game/) |
| MVP | [mvp.md](./wiki/architecture-styles/mvp.md) | [observable-memory-game-mvp](./observable-memory-game-mvp/) |

Both games share the same domain: pattern memory on a 3×3 grid, TypeScript, Handlebars, RxJS, Webpack.

## Running an example app

Each app is independent (own `package.json`):

```bash
cd observable-memory-game      # or observable-memory-game-mvp
npm install
npm start
```

## Repo layout

```text
dev-mind-map/
├── README.md
├── mind-map.md
├── studying-foundations-in-the-ai-era.md
├── wiki/architecture-styles/
│   ├── README.md
│   ├── mvc.md
│   └── mvp.md
├── observable-memory-game/       ← MVC
└── observable-memory-game-mvp/   ← MVP (same codebase until refactor)
```
