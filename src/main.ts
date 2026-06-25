import { NestFactory } from "@nestjs/core";
import { createProxyMiddleware } from "http-proxy-middleware";
import { AppModule } from "./app.module";
import { createGatewayAuth } from "./auth.middleware";
import { services } from "./services.config";

async function bootstrap() {
  // bodyParser is disabled so request bodies stream straight through the proxy
  // to the downstream services untouched.
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const instance = app.getHttpAdapter().getInstance();

  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is required");
  }

  // 1. Verify the token (and inject identity headers) for protected routes.
  instance.use(createGatewayAuth(secret));

  // 2. Proxy each domain path to its microservice. We mount at the root and use
  // `pathFilter` (instead of mounting on the path) so the FULL original path is
  // preserved and forwarded — e.g. /api/v1/auth/login reaches the auth service
  // as /api/v1/auth/login, not /login.
  for (const route of services) {
    instance.use(
      createProxyMiddleware({
        target: route.target,
        changeOrigin: true,
        pathFilter: `${route.path}/**`,
      }),
    );
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}

void bootstrap();
