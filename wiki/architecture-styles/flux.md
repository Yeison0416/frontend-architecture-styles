# Flux (unidirectional data flow)

## Summary

**Flux** describes a **one-way loop**: user events become **actions**, a **reducer** (pure function) computes the next state, the **store** holds truth, and the **View** reads from the store and dispatches new actions. Data never flows backward into the reducer from the View.

**One-sentence summary:** State changes in one direction only — **action → reducer → store → View** — and the View never mutates state directly.

## Roles

| Role | Job |
|------|-----|
| **Action** | Plain object describing *what happened* (`{ type: 'CELL_CLICK', cellIndex: 3 }`) |
| **Reducer** | Pure `(state, action) => nextState` — all transition logic in one place |
| **Store** | Holds state, runs reducers on dispatch, notifies subscribers |
| **View** | Renders store state; dispatches actions on user input |

## Flow

```text
User click  →  View dispatches action  →  reducer  →  store  →  View (subscribe)
```

## vs MVC / MVP / MVVM

| | Flux | MVVM (vanilla repo) |
|---|------|---------------------|
| State change | **dispatch(action)** | ViewModel command or `setState` |
| Transition logic | **Reducer** | **domain** functions + ViewModel |
| Display mapping | **Selectors** (optional) | **ViewModel mappers** |

Same domain rules can live inside reducers or be called by reducers — the difference is the **action/reducer/dispatch** contract.

## Angular note

Flux is the pattern behind **NgRx** (actions, reducers, effects, selectors). Same Memory Game, same idea — implemented with Angular + NgRx in a framework project.

---

> **Implementation:** No vanilla app in this repo. This pattern will be covered in a **framework project** (Angular / NgRx) after the MVC, MVP, and MVVM vanilla track.
