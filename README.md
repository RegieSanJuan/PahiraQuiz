# PahiraQuiz

PahiraQuiz is a quiz-generation web app for teachers and reviewers.

The app lets you:

- validate a Google AI Studio API key for Gemini 2.5 Flash
- upload lesson content from a `.pdf` or `.txt` file, or paste text directly
- choose quiz formats and question counts
- generate a quiz draft with Gemini
- edit the generated questions before finalizing
- review an answer key
- export the quiz to PDF
- save drafts locally in the browser

The product line used in the UI is:

> Gusto mo ba pahirapan (matuto) students mo?

## Features

- One-page quiz generator flow for faster classroom prep
- Supports 4 quiz types:
  - Multiple Statement Quiz ( Sir dong inspired )
  - Multiple Choice
  - Identification
  - Fill in the Blank
- Gemini API key validation before quiz generation
- Server-side Gemini request proxy via Next.js API route
- Local draft storage with multiple saved drafts
- PDF text extraction for lesson uploads
- PDF export with optional answer key
- Recent drafts view on the homepage
- Vercel Analytics integration

## Tech Stack

### Core

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

### UI

- Radix UI primitives
- Lucide React icons
- Sonner for toasts
- `next/image` for branding assets

### AI and Content Processing

- Google Gemini 2.5 Flash via Google AI Studio API key
- Custom Next.js API route at `/api/gemini`
- `pdfjs-dist` for PDF text extraction
- `jspdf` for PDF export

### Tooling

- pnpm lockfile included
- npm scripts also available
- Vercel Analytics

## How It Works

### Generator flow

1. The user enters a Gemini API key.
2. The app validates the key against the configured Gemini model.
3. The user uploads lesson content or pastes text.
4. The user chooses question types and item counts.
5. The app sends the request to `/api/gemini`.
6. The API route forwards the request to Gemini 2.5 Flash.
7. The generated quiz is normalized and stored as a local draft.
8. The user is redirected to the editor for cleanup and export.

### Draft storage

Drafts are stored in `localStorage`, not in a database.

Stored locally:

- quiz drafts
- current draft pointer
- saved Gemini API key

This means:

- drafts are browser-specific
- drafts do not sync across devices
- clearing browser storage removes drafts and the saved key

## Quiz Types

### 1. Multiple Statement Quiz ( Sir dong inspired )

Two statements plus four choices about the relationship between them.

### 2. Multiple Choice

Standard 4-choice question format.

### 3. Identification

Short-answer style questions.

### 4. Fill in the Blank

Sentence-based questions with a missing word or phrase.

## Project Structure

```text
app/
  api/gemini/route.ts          # Gemini validation and generation proxy
  editor/                      # Quiz editor page and editing components
  generator/                   # Quiz generation flow and form components
  layout.tsx                   # Metadata, fonts, shared app layout
  page.tsx                     # Homepage

components/
  site-brand.tsx               # Shared PahiraQuiz logo + brand block
  ui/                          # Reusable UI primitives

lib/
  gemini.ts                    # Prompt building, response parsing, client helpers
  localStorage.ts              # Draft and API key persistence
  pdfExtraction.ts             # PDF/TXT lesson parsing
  pdfExport.ts                 # Quiz PDF export
  types.ts                     # Shared TypeScript data types

public/
  c6ed42b8-8a65-49d8-b93a-7e8daef81e3f.png   # Active site logo
```

## Local Development

### Requirements

- Node.js 20+ recommended
- pnpm recommended

### Install

```bash
corepack pnpm install
```

### Run the dev server

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

### Production build

```bash
npm run build
npm run start
```

## Deployment to Vercel

This project is ready to deploy to Vercel as a normal Next.js app.

### Important deployment note

No server-side environment variable is currently required for Gemini.

The app asks the user for their Gemini API key inside the UI, stores it in the browser, and sends it to the Next.js API route during validation and generation.

That means:

- you can deploy without adding a Gemini API key to Vercel environment variables
- each user supplies their own Gemini key
- the server route only uses the key from the request

### Recommended Vercel settings

- Framework Preset: Next.js
- Install Command: `corepack pnpm install`
- Build Command: `npm run build`
- Output Directory: default Next.js output

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

### Note about linting

The `lint` script exists in `package.json`, but ESLint is not currently installed in the project. If you want linting in CI or local development, add ESLint and its Next.js config before relying on `npm run lint`.

## API Route

### `POST /api/gemini`

Supported actions:

- `validate`
- `generate`

The route:

- validates the user-supplied API key
- builds a structured prompt for quiz generation
- requests JSON output from Gemini
- parses and normalizes the model response
- returns clean quiz items to the client

## Branding

- Product name: `PahiraQuiz`
- Main logo: `public/c6ed42b8-8a65-49d8-b93a-7e8daef81e3f.png`

## Current Status

The app currently:

- builds successfully with `npm run build`
- passes a direct TypeScript check with `pnpm exec tsc --noEmit`
- is prepared for deployment to Vercel

## Possible Next Improvements

- Add proper ESLint setup
- Add automated tests
- Add quiz import/export formats beyond PDF
- Add optional server-side draft persistence
- Add user authentication if multi-device sync is needed
