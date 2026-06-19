import { NestFactory } from "@nestjs/core";
import { createProxyMiddleware } from "http-proxy-middleware";
import { AppModule } from "./app.module";
import { services } from "./services.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Proxy each registered domain path to its microservice. The gateway owns
  // cross-cutting concerns (routing, and later: auth verification, rate
  // limiting, request logging) so the services stay focused on their domain.
  const instance = app.getHttpAdapter().getInstance();
  for (const route of services) {
    instance.use(
      route.path,
      createProxyMiddleware({
        target: route.target,
        changeOrigin: true,
      }),
    );
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}

void bootstrap();
