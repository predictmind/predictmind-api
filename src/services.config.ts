/**
 * Downstream service registry for the gateway.
 *
 * Each domain path under /api/v1 is proxied to the corresponding microservice.
 * Targets are resolved from environment variables (set per environment / via
 * the infra repo), falling back to localhost ports for local development.
 */
export interface ServiceRoute {
  /** Path prefix mounted on the gateway (under the global /api/v1 prefix). */
  path: string;
  /** Upstream base URL of the microservice. */
  target: string;
}

export const services: ServiceRoute[] = [
  { path: "/api/v1/auth", target: process.env.AUTH_SERVICE_URL ?? "http://localhost:3002" },
  { path: "/api/v1/users", target: process.env.AUTH_SERVICE_URL ?? "http://localhost:3002" },
  { path: "/api/v1/market", target: process.env.MARKET_SERVICE_URL ?? "http://localhost:3003" },
  { path: "/api/v1/coins", target: process.env.MARKET_SERVICE_URL ?? "http://localhost:3003" },
  { path: "/api/v1/news", target: process.env.NEWS_SERVICE_URL ?? "http://localhost:3004" },
  { path: "/api/v1/sentiment", target: process.env.NEWS_SERVICE_URL ?? "http://localhost:3004" },
  { path: "/api/v1/strategies", target: process.env.STRATEGY_SERVICE_URL ?? "http://localhost:3005" },
  { path: "/api/v1/backtests", target: process.env.BACKTEST_SERVICE_URL ?? "http://localhost:3006" },
  { path: "/api/v1/paper", target: process.env.PAPER_SERVICE_URL ?? "http://localhost:3007" },
  { path: "/api/v1/reports", target: process.env.REPORTING_SERVICE_URL ?? "http://localhost:3008" },
];
