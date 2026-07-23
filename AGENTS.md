# Repository Guidelines

## Project Structure & Module Organization

The React/Vite frontend lives in `client/`. Place reusable views in `client/src/Components`, route-level pages in `client/src/Pages`, shared helpers in `client/src/utils`, and tests in `client/tests`. Zoho Catalyst services live in `functions/<service>/`; cross-service helpers belong in `functions/shared`. Product notes and implementation plans are stored in `docs/` and `plans/`. Synthetic datasets and model utilities live in `synthetic_data/`, `appsail/`, and the root Python scripts.

Landing-page artwork belongs in `client/public/assets/landing/` and is served as `/assets/landing/<filename>`. Follow `client/public/assets/landing/README.md`: use descriptive kebab-case names, optimized WebP output, meaningful alt text, and no text embedded in images.

## Build, Test, and Development Commands

Run frontend commands from `client/`:

- `npm install` installs locked dependencies.
- `npm run dev` starts the local Vite server.
- `npm test` runs the Node test suite in `client/tests`.
- `npm run lint` checks all JavaScript and JSX with zero warnings allowed.
- `npm run build` creates the production bundle in `client/dist`.
- `npm run preview` serves that bundle locally.

Install service-specific dependencies inside a `functions/<service>/` directory when its `package.json` requires them.

## Coding Style & Naming Conventions

Use ES modules and React functional components. Follow existing names: PascalCase components (`CaseWorkspace.jsx`), camelCase helpers (`apiFetch.js`), and kebab-case assets (`crime-network.webp`). Use two-space indentation unless the surrounding file establishes another style. Keep styles near their owning component. Follow `DESIGN.md` for typography, spacing, color, motion, and accessibility. Use Phosphor icons through `react-icons/pi`.

## Testing & Browser Verification

Name tests after the behavior under test, such as `chat-context.test.mjs`. Before submitting, run tests, lint, and a production build. For UI changes, verify every affected route in a real browser at desktop and mobile widths. Exercise loading, empty, error, keyboard, and permission states; inspect the console; confirm images and canvases render; and check for clipping or horizontal overflow. Include screenshots for visual changes.

## Commit & Pull Request Guidelines

Use focused Conventional Commits such as `fix(chat): preserve case context`. Pull requests must summarize behavior, list verification steps, link relevant tasks, and include screenshots or recordings for UI work. Call out Catalyst, schema, data, or environment changes.

## Security & Data Safety

Never commit real police records, secrets, or credentials. Keep demos synthetic, preserve PII masking and access-purpose logging, and label analytical outputs with source, limitations, and required human review.
