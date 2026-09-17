# 🍕 Pizza Lab

An interactive 3D pizza builder. Pick a base, sauce, cheese level, and up to
six toppings, watch it assemble live in 3D, bake it, and get a shareable
card of what you built — complete with an auto-generated name and a
tongue-in-cheek "chef's verdict" on how conventional (or chaotic) your
combination is.

No backend, no accounts, no real ordering — this is a fun, self-contained
build tool, not a storefront.

## Features

- **Live 3D pizza** (React Three Fiber) — crust, sauce, melted-cheese blobs,
  and toppings all render as actual procedural geometry, not flat textures
- **12 toppings**, each with its own shape (discs, rings, chunks, spheres,
  strips, a flattened leaf for basil) and a seeded scatter pattern, so a
  given topping always lands in the same spots instead of jumping around
  on re-render
- **Bake sequence** — a GSAP-driven progress bar while the crust browns,
  the cheese turns golden, and steam particles drift up; fully reversible
  if you go back to editing
- **Auto-generated pizza name** — built from what's actually on the pizza
  (spice level, meat count, sweet/savory mix, topping count), not picked
  from a fixed list
- **Chef's verdict** — a lighthearted 0–100 "chaos score" reacting to your
  combination (pineapple, six toppings, sweet+meat mixes, etc. all nudge
  it up). Never blocks a combination, just comments on it
- **🎲 Surprise me** — generates a random valid pizza
- **Downloadable share card** — a 1080×1350 PNG generated on-canvas,
  redrawing the *same* pizza (same toppings, same seeded layout) as a flat
  illustration, with the name, price, ingredient list, and chef's verdict
- **Live pricing** in ₹, veg/non-veg auto-detection

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + Three.js — the 3D pizza
- [GSAP](https://gsap.com/) — bake sequence, UI entrance animations
- Canvas 2D API — the downloadable share card (no server, no image library)

Everything runs client-side. No API routes, no database, no environment
variables required.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run start   # serve the production build
```

## Project structure
