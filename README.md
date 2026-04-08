# ULTRAKILL Bind Trainer

A small browser-based trainer for practicing ULTRAKILL weapon and variant binds.

It gives you randomized prompts, lets you customize keyboard and mouse bindings, and tracks reaction-time stats while you drill your inputs.

## Features

- Randomized weapon + variant prompts
- Custom key and mouse button binding capture
- Cue audio and image prompts
- Mute toggle for audio cues
- Session stats for hits, misses, and reaction time
- Per-action enable/disable controls for focused practice

## Tech Stack

- React
- TypeScript
- Vite
- Vitest

## Getting Started

### Requirements

- Node.js
- npm

### Install

```bash
npm install
```

### Run in development

```bash
npm run dev
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run test
npm run lint
```

## Project Structure

- `src/` application code
- `src/features/trainer/` trainer logic and state
- `src/data/` static catalog/config data
- `src/utils/` shared pure helpers
- `public/trainer-images/` cue images
- `public/trainer-audio/` cue audio

