# Layered / Clean frontend (light)

## Summary

**Layered (Clean) frontend** organizes code by **dependency direction**: inner layers know nothing about outer ones. **Domain** (rules, entities) sits at the center; **use cases** orchestrate application actions; **adapters** (UI, HTTP, storage) talk to the outside world.

**One-sentence summary:** Dependencies point **inward** — UI and API depend on use cases; use cases depend on domain; domain depends on nothing.

## Layers (light)

| Layer | Job | Memory Game analogue (already in vanilla apps) |
|-------|-----|-----------------------------------------------|
| **Domain** | Pure rules, no framework | `domain/rules.ts`, `domain/pattern.ts` |
| **Application / use cases** | Orchestrate one user goal | Cell click flow, start level, pattern sequence |
| **Infrastructure** | Technical plumbing | `services/`, RxJS streams, store |
| **UI** | Render + input | `components/`, templates |

```text
UI  →  use cases  →  domain
         ↑
   infrastructure (store, HTTP, timers)
```

## vs presentation styles (MVC, MVP, MVVM)

Presentation styles answer **who updates the screen**. Layered/Clean answers **where files live and what may import what**.

They compose: an MVVM ViewModel can *be* a use-case + mapper layer; domain stays shared across all styles.

## Angular note

Maps to **feature folders**, `data/` / `domain/` / `ui/` slices, injectable use cases, and keeping components thin. Scales when the app grows beyond a single screen.

---

> **Implementation:** Vanilla apps here already use a **light split** (`domain/`, `state/`, `services/`, `components/`). Full layered structure will be applied in a **framework project** (Angular feature layout) after the MVC, MVP, and MVVM vanilla track.
