# Contributing Guide

Thanks for your interest in contributing! This document explains how to set up
the project, the conventions we follow, and how to submit changes.

## Prerequisites

- **Node.js** 24.x (pinned via `engines.node`; local, CI, and Vercel all use Node 24 LTS. Node 20 is EOL)
- **pnpm** 10 (`corepack enable` is the easiest way to get the pinned version)

## Getting started

```bash
# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

## Project structure

```
src/
├── components/      # Reusable components
│   └── ui/          # shadcn/ui primitives
├── hooks/           # Reusable React hooks (unit-tested)
├── lib/             # Framework-agnostic utilities
├── styles/          # Global Tailwind CSS + design tokens
├── App.tsx          # Root component
└── main.tsx         # Application entry point
```

Learning resources live outside `src/`:

```text
resources/<id>/
├── meta.json
├── <slug>.md
├── artifacts/data.json
├── studies/<slug>.html
└── slides/<slug>.html
```

## Available scripts

| Command               | Description                                  |
| --------------------- | -------------------------------------------- |
| `pnpm dev`            | Start the Vite dev server                    |
| `pnpm build`          | Type-check and build for production          |
| `pnpm preview`        | Preview the production build locally         |
| `pnpm lint`           | Run Biome checks (lint + format)             |
| `pnpm lint:fix`       | Auto-fix lint/format issues                  |
| `pnpm typecheck`      | Run the TypeScript compiler (no emit)        |
| `pnpm test`           | Run unit tests once                          |
| `pnpm test:coverage`  | Run unit tests with a coverage report        |
| `pnpm verify:studies` | Assert study HTML is byte-identical to generator output (offline) |

## Coding conventions

- **Language**: TypeScript everywhere.
- **File names**: lowercase, hyphen-separated (e.g. `resource-card.tsx`).
- **Function names**: lowerCamelCase (e.g. `searchResources`, `cn`).
- **Styling**: Prefer Tailwind utilities and shadcn/ui components. Use Emotion
  (`@emotion/styled`) only for dynamic, one-off styles that are awkward in Tailwind.
- **Formatting & linting**: Biome is the single source of truth. Run
  `pnpm lint:fix` before committing — CI enforces zero warnings/errors.

## Adding Knowledge

Use the `ai-doc-creator` skill when adding knowledge from a URL, image, pasted
document content, or local file:

```text
ai-doc-creator <url / img / document content / file>
```

The skill should confirm whether to create a new `resources/<id>/` directory or
reuse an existing one, then prepare `meta.json`, `<slug>.md`,
`artifacts/data.json`, `studies/<slug>.html`, and `slides/<slug>.html`.
`meta.json` must be a top-level resource object. Put study entries in `studies`
with `path` slugs, and slide entries in `slides` with `id` and `path` fields.
Do not create `source.md`; Markdown handoff files should be named by article
slug.

## Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add resource search filters
fix: keep active learn item visible
docs: update deployment steps
chore: bump dependencies
```

## Submitting a pull request

1. Fork the repo and create your branch from `main`.
2. Make your changes and add tests where appropriate.
3. Ensure all checks pass locally:
   ```bash
   pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm verify:studies && pnpm build
   ```
4. Open a pull request and fill out the PR template.

CI will run lint, type-check, tests, the study-artifact drift check, and build on every pull request.

If you change `.skills/bilingual-reader` rendering or any `resources/<id>/studies/*.html`, do not
hand-edit study HTML. Change the generator, then re-render; `pnpm verify:studies` enforces that the
published pages stay byte-identical to generator output. Source image bytes are pinned in
`resources/<id>/artifacts/<stem>-images/` because remote image endpoints renegotiate their format
per request.

## Reporting bugs & requesting features

Please use the [issue templates](.github/ISSUE_TEMPLATE) when opening a new issue.
