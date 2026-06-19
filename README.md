# predictmind-api

Backend API for **PredictMind** — AI-Powered Market Intelligence & Strategy Research Platform.

Part of the PredictMind platform. Product and architecture documentation lives in the private [`predictmind/app`](https://github.com/predictmind/app) repository (see the API Specification and System Architecture documents).

## Tech stack

- [NestJS](https://nestjs.com/) (modular monolith) + TypeScript
- ESLint + Prettier + Jest

## Getting started

```bash
npm install
npm run start:dev
```

The API is served under the `/api/v1` prefix. Health check: `GET /api/v1/health`.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run start:dev` | Start in watch mode |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run the compiled server |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |
| `npm test` | Run unit tests |

## Quality & security

- **CI** runs lint, tests, and build on every push and PR.
- **CodeQL** code scanning (security + code-quality queries).
- **Dependabot** keeps dependencies and Actions up to date.

## License

Proprietary — © PredictMind. All rights reserved.
