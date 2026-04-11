# Local CI

## Commands

```bash
# Backend lint + typecheck + build + focused test
npm run ci:backend

# Frontend lint + typecheck
npm run ci:frontend

# Recommended daily local CI
npm run ci:local

# Full local CI, closer to GitHub Actions
npm run ci:local:full
```

## Modes

`npm run ci:local`

- Recommended default for daily work
- Runs backend lint, typecheck, build, focused backend tests
- Runs frontend lint and typecheck
- Avoids the Vite/Vitest build-worker path that is less stable in restricted environments

`npm run ci:local:full`

- Closer to GitHub Actions
- Adds frontend unit tests and frontend build
- Best used before pushing when your local environment supports Vite and Vitest normally
