# Repository Guidelines

## Project Structure & Module Organization

This repository contains the KSP Crime Analytics Dashboard. The React/Vite app lives in `client/`; source files are under `client/src`, static assets under `client/public`, and production output under `client/dist`. Reusable UI is in `client/src/Components`, shared helpers in `client/src/utils`, and page views in `client/src/Pages`. Zoho Catalyst serverless functions live in `functions/<function_name>/`, with shared utilities in `functions/shared`. Python models, pipelines, and synthetic CCTNS CSVs live in `appsail/`, `quickml_pipeline.py`, `generate_ksp_data.py`, and `synthetic_data/`. Product and design notes are in `docs/` and `plans/`.

Generated landing artwork belongs in `client/public/assets/landing/` and is served from `/assets/landing/<name>`. Follow the [landing asset manifest](client/public/assets/landing/README.md): use descriptive kebab-case filenames, WebP for final delivery, meaningful alt text, and no text baked into images. Record the prompt and intended placement when adding or replacing an asset.

## Build, Test, and Development Commands

Run frontend commands from `client/`:

- `npm install` installs dependencies from `package-lock.json`.
- `npm run dev` starts the Vite development server on the local network.
- `npm run build` creates the production bundle in `client/dist`.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint for `.js` and `.jsx` files with zero warnings allowed.

Serverless functions are maintained per folder under `functions/`; install dependencies inside the relevant folder when a `package.json` is present.

## Coding Style & Naming Conventions

Use modern JavaScript modules and React functional components. Match existing naming: PascalCase for components (`CaseWorkspace.jsx`), camelCase for utilities (`apiFetch.js`), and scoped styles beside related components when established. Keep indentation consistent with nearby code, typically two spaces. Before UI changes, read `DESIGN.md`; follow its fonts, colors, spacing, motion rules, and accessibility expectations unless the user approves a deviation.

## Testing Guidelines

There is no dedicated automated test script in `client/package.json` yet. Treat `npm run lint` and `npm run build` as required checks before submitting changes. For UI work, run the app in a browser and verify the affected route, responsive behavior, keyboard access, console errors, and loading/error states. Name future tests after the unit or workflow, for example `CaseWorkspace.test.jsx`.

## Commit & Pull Request Guidelines

The Git history uses Conventional Commit style, such as `fix(responsive): ...`, `refactor(theming): ...`, and `perf(memo): ...`. Keep commits focused and use a clear scope. Pull requests should include a summary, verification steps, linked issue or task context, and screenshots or recordings for UI changes. Mention data, Catalyst function, or environment changes explicitly.

## Security & Configuration Tips

Do not commit real police data, credentials, API keys, or generated secrets. Keep demo data synthetic, and preserve PII masking behavior in `client/src/utils/piiMask.js` and `functions/shared/pii-mask.js` when touching case, person, or FIR flows.
