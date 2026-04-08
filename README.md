# Your Company Name

A small Next.js company site with a hidden ULTRAKILL bind trainer under `/trainer`.

## Features

- Lean company landing page
- Static contact details for a one-person contract development business
- Hidden `Fun stuff` disclosure linking to ULTRABINDS
- Client-side ULTRAKILL weapon + variant bind trainer
- Custom key and mouse button binding capture
- Cue audio and image prompts

## Tech Stack

- Next.js
- React
- TypeScript
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
npm run start
npm run test
npm run lint
```

## Project Structure

- `app/` Next.js routes and global app shell
- `src/` feature code and shared utilities
- `src/features/site/` landing page components
- `src/features/trainer/` trainer logic and state
- `src/data/` static catalog/config data
- `src/content/` editable site copy and contact content
- `src/utils/` shared pure helpers
- `public/trainer-images/` cue images
- `public/trainer-audio/` cue audio
