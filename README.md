# predictmind-gateway

API gateway for **PredictMind** — the single public entry point that routes requests to the domain microservices.

Part of the PredictMind platform (microservices architecture). Product and architecture documentation lives in the private [`predictmind/app`](https://github.com/predictmind/app) repository (see the API Specification and System Architecture documents).

> This repository was formerly `predictmind-api` (the modular-monolith API). It has been repurposed as the gateway as part of the move to microservices.

## Responsibilities

- Single entry point under `/api/v1/*`
- Routing / reverse-proxy to the domain services
- (Planned) JWT verification, rate limiting, request logging, and CORS

## Routing table

| Path prefix | Service | Default local target |
| --- | --- | --- |
| `/api/v1/auth`, `/api/v1/users` | auth | `http://localhost:3002` |
| `/api/v1/market`, `/api/v1/coins` | market | `http://localhost:3003` |
| `/api/v1/news`, `/api/v1/sentiment` | news | `http://localhost:3004` |
| `/api/v1/strategies` | strategy | `http://localhost:3005` |
| `/api/v1/backtests` | backtest | `http://localhost:3006` |
| `/api/v1/paper` | paper | `http://localhost:3007` |
| `/api/v1/reports` | reporting | `http://localhost:3008` |

Targets are overridden per environment via `*_SERVICE_URL` environment variables (see `src/services.config.ts`).

## Getting started

```bash
npm install
npm run start:dev
```

Gateway health check: `GET /health`. Default port `3001`.

## Docker

```bash
docker build -t predictmind-gateway .
docker run -p 3001:3001 predictmind-gateway
```

## Quality & security

CI (lint + test + build), CodeQL code scanning, and Dependabot run on every push and PR.

## License

Proprietary — © PredictMind. All rights reserved.
