# Repository Guidelines

## Project Structure & Module Organization
This is a Vite + React + TypeScript single-page app. Core code lives in `src/`: page-level routes in `src/pages`, shared UI in `src/components`, static learning data in `src/data`, browser helpers in `src/utils`, and global styles in `src/index.css`. Entry points are `src/main.tsx` and `src/App.tsx`. Public assets such as icons live in `public/`, while imported images live in `src/assets/`.

## Build, Test, and Development Commands
- `npm run dev` — starts the Vite dev server on `0.0.0.0` for local testing.
- `npm run build` — runs TypeScript project checks, then creates a production build.
- `npm run lint` — runs ESLint across the repository.
- `npm run preview` — serves the built app locally for a final smoke test.

## Coding Style & Naming Conventions
Use TypeScript and React function components throughout. Follow the existing style: 2-space indentation, single quotes, no semicolons, and small focused modules. Name page components with `Page` suffix (`HomePage.tsx`), reusable components in PascalCase (`StarRating.tsx`), and utilities/data files in camelCase (`storage.ts`, `words.ts`). Prefer descriptive variable names and keep route definitions centralized in `src/App.tsx`. Use Tailwind utility classes inline in JSX; avoid adding separate CSS files unless the pattern already exists.

## Testing Guidelines
There is currently no automated test suite configured. At minimum, run `npm run lint` and manually verify affected flows in `npm run dev` before opening a PR. For UI changes, check route navigation, local storage behavior, and responsive layout. If you add tests, keep them close to the feature using `*.test.ts` or `*.test.tsx` naming and prefer Vitest-compatible patterns.

## Commit & Pull Request Guidelines
Git history is not available in this workspace, so use short, imperative commit messages; Conventional Commit style is preferred, for example `feat: add wrong-book progress tracking` or `fix: guard localStorage parsing`. Keep each commit focused on one change. PRs should include a clear summary, testing notes, linked issues, and screenshots or short recordings for visible UI updates.

## Configuration Tips
Do not commit secrets or environment-specific settings. Persisted study data is stored in browser `localStorage`, so changes to `src/utils/storage.ts` should preserve backward compatibility where practical.
