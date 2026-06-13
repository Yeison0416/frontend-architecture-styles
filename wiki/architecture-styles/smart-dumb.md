# Smart / Dumb (Container–Presentational)

## Summary

A **component split**, not a full app architecture: **Smart** (container) components **orchestrate** — load data, dispatch actions, wire services. **Dumb** (presentational) components **render** — receive data via inputs, emit events via outputs, no store or domain imports.

**One-sentence summary:** Smart components **decide**; dumb components **display and forward events**.

## Roles

| Role | Job |
|------|-----|
| **Smart (container)** | Talks to store/service/ViewModel; maps state; handles side effects |
| **Dumb (presentational)** | `@Input` for display data; `@Output` / callbacks for user events; templates + CSS only |

## Flow

```text
Store / service  →  Smart component  →  @Input  →  Dumb component  →  @Output  →  Smart  →  dispatch / command
```

## vs MVC / MVP / MVVM

This pattern **layers on top** of any of them:

| Base style | Smart component ≈ | Dumb component ≈ |
|------------|-------------------|------------------|
| MVC | Controller + smart View wiring | Pure template fragment |
| MVP | Presenter-facing container | Passive View |
| MVVM | ViewModel consumer | View that only binds |

It answers **“how do I split components?”** — not **“who owns app state?”**

## Angular note

Default Angular team structure: **container** components inject services; **presentational** components use `input()` / `output()` (or `@Input` / `@Output`) and stay free of business logic. Often paired with OnPush change detection on dumb components.

---

> **Implementation:** No vanilla app in this repo. This pattern will be covered in a **framework project** (Angular components) after the MVC, MVP, and MVVM vanilla track.
