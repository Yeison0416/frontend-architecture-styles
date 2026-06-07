# Personal software development mind map

## What this document is

This document is a **personal map of how I think and work while building software**. It is not meant to be a universal curriculum or a fixed checklist that every developer must follow. It exists so that when I sit down to design, implement, or ship something, I have a **clear sense of where I am in my own process**—instead of feeling scattered, guilty for not "knowing everything," or stuck switching between unrelated concerns with no direction.

The ideas here grew out of a concrete frustration: early on, writing code often felt uncomfortable because I did not know **what phase** I was in. I worried about clean code, solid JavaScript fundamentals, architecture, and countless other topics **all at once**. That overlap made the work feel overwhelming and made it hard to focus on the task in front of me.

So I started breaking the work into **areas**—concepts, patterns, setup, frameworks, layout, and everything else that shows up when building a real application—not because each area must be mastered before the next, but so I can **name what I am doing** and study or practice **one layer at a time** when it matters.

This map is **incremental**. I am building it **step by step**: for each topic or stage, I refine the wording, tighten the structure, and add detail where it helps. When the sequence feels solid, I will distill it into a **simple algorithm**—a short description of how one phase leads to the next **in my head**. Until then, the priority is a mind map that reflects **how I actually organize ideas**, not how a textbook says development ought to look.

If someone else reads this, they may find overlaps with common practice—and that is fine. The source of truth remains **my experience and mental model**, kept honest and updated as I learn.

---

## 1. Tech stack

When I started building software, I felt a strong need to understand **each part of the front-end stack** at a conceptual level—not only how to use it, but **what problem it solves** and **how it fits next to the other pieces**. I spent considerable time studying those topics on purpose, so that later I could focus on product and architecture without constantly doubting the fundamentals.

For front-end work, **a solid grasp of the stack** is, for me, **non-negotiable**. The areas I deliberately studied include:

- **Languages & markup:** JavaScript, TypeScript, HTML, CSS
- **Asynchronous & reactive patterns:** Promises, Observables
- **Templating:** Handlebars
- **Testing:** unit testing, Jest
- **Tooling & delivery:** Webpack, Git
- **Application frameworks / meta-frameworks:** Angular, Astro
- **How I work:** AI-assisted workflow (how I use AI in day-to-day development)

### Notes (for later revision)

- Promises/Observables can live under JS/TS async, or stay top-level if "async mental model" is its own pillar.
- Fold "unit tests" + Jest into one line if preferred.
- Optional additions if they match my path: browser/DOM, HTTP, accessibility.

---

## 2. Application structure & state

After the tech stack felt less mysterious, the next step that felt natural for me was learning **how a front-end application is shaped in the editor**—not only what the tools are, but how people usually **structure**, **organize**, and **connect** them in a real codebase.

I studied this **on purpose**, early, the same way I studied the stack: I wanted a mental map for **where things go**, **where boundaries are**, and **where truth lives** before I got lost inside a project. For me this is the “attach the application in the editor” phase—first the materials (section 1), then how applications are commonly assembled.

In this layer I focused on the most common **architecture** and **state management** ideas I saw in front-end development, for example:

- **Structure & boundaries:** how code is grouped (features, layers, modules, folders), what belongs together vs. what should stay separate, how responsibilities are split (UI, services, data access, shared vs. feature-specific).
- **State & truth:** local vs. global state, UI state vs. server state, how data flows through the app, and when to reach for patterns like stores, services, or framework-specific state APIs.

This section is not about picking the “perfect” architecture for one ticket. It is about **recognizing the patterns** I studied so that when I open a repo or start a feature, I can name what kind of problem I am looking at—organization and state—instead of mixing that up with “learning JavaScript again” or “choosing a library at random.”

### Notes (for later revision)

- Add the specific patterns, tools, and examples I actually studied (Angular services, NgRx, signals, smart/dumb components, feature folders, etc.).
- Add how it *felt* when this clicked vs. when I was still confusing stack learning with app shape.
- Optional: one short example from a real project where boundaries or state felt unclear.

---

## 3. (next topic)

<!-- Post your next section draft here when ready. -->

---

## Algorithm (later)

<!-- Build this after the mind map sections feel solid. -->
