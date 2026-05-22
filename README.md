---
title: QuickTune Pro
emoji: 🏎️
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
app_port: 7860
---

# QuickTune Pro — Forza Horizon 6 Tune Calculator

A full-stack web app that calculates recommended car tunes for Forza Horizon 6 based on your car's stats and installed parts.

## Features

- **Auto-calculated tunes** from weight, power, drivetrain, PI class, track type, and driving style
- **Part-aware**: tire compound, springs, dampers, ARB, aero (with downforce sliders), and differential all affect results
- **All four tuning categories**: Tires & Alignment, Suspension & ARB, Differential, Brakes
- **Save & load tunes** via SQLite (note: resets on container restart on free Spaces)

## Running locally

```bash
npm install
npx prisma migrate dev
npm run dev
```
