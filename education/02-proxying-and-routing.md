# 2. Proxying & Routing

**Proxying** means "passing a request along on someone's behalf." The gateway
receives your request and **re-sends** it to the right service, then passes the
service's answer back to you. The gateway is a **reverse proxy**.

## The routing table (`src/services.config.ts`)

We keep a simple list that maps a **path prefix** to a **service address**:

```ts
export const services: ServiceRoute[] = [
  { path: "/api/v1/auth",  target: process.env.AUTH_SERVICE_URL  ?? "http://localhost:3002" },
  { path: "/api/v1/users", target: process.env.AUTH_SERVICE_URL  ?? "http://localhost:3002" },
  { path: "/api/v1/market",target: process.env.MARKET_SERVICE_URL?? "http://localhost:3003" },
  ...
];
```

- `path` — the start of the URL the client used.
- `target` — where to forward it.
- `process.env.X ?? "http://localhost:..."` — read the real address from an
  **environment variable** if set; otherwise fall back to localhost (handy for
  running on your laptop). This is the "portable, no hard-coded addresses" rule —
  in production these point to the real service hosts.

So a request to `GET /api/v1/auth/me` matches the `/api/v1/auth` prefix and gets
forwarded to `http://localhost:3002/api/v1/auth/me`.

## Wiring it up (`src/main.ts`)

```ts
const app = await NestFactory.create(AppModule, { bodyParser: false });
const instance = app.getHttpAdapter().getInstance();
...
for (const route of services) {
  instance.use(
    createProxyMiddleware({
      target: route.target,
      changeOrigin: true,
      pathFilter: `${route.path}/**`,
    }),
  );
}
```

- `createProxyMiddleware(...)` is the tool (from `http-proxy-middleware`) that does
  the actual forwarding.
- `changeOrigin: true` — rewrite the request's "Host" header to the target.
- `pathFilter: "${route.path}/**"` — only forward requests whose path starts with
  this prefix (e.g. everything under `/api/v1/auth`). The `/**` is a glob meaning
  "and anything below."

### 🐛 A real bug we hit (and the lesson)

Our **first** version mounted each proxy *on* its path, like
`instance.use("/api/v1/auth", proxy)`. It seemed right, but logging in through the
gateway returned **404 "Cannot POST /register"** from the auth service!

**Why?** When you mount Express middleware on a path, Express **strips that path**
before the middleware sees the request. So the proxy only saw `/register` and
forwarded *that* — but auth expects the full `/api/v1/auth/register`. The prefix
was lost.

**The fix:** mount the proxy at the **root** (no path argument) and use
`pathFilter` to decide which requests it handles. Now the proxy sees the **full,
original** path and forwards it unchanged. After this, login/register/me all
worked through the gateway. ✅

> **Lesson:** know how your tools treat the URL. "Mounting on a path" quietly
> rewrites the path — great for normal routes, wrong for a transparent proxy.

### Why `bodyParser: false`? (a subtle but important choice)

Normally a NestJS app **reads** (parses) the request body so your code can use it.
But the gateway doesn't *use* the body — it just forwards it. If Nest read the
body first, the proxy would have to carefully re-send it, which is fiddly and
error-prone.

So we tell Nest **don't parse bodies** (`bodyParser: false`). The raw body then
**streams** straight through the proxy to the service untouched. Simpler and more
reliable.

> **Was there another way?** Yes — keep body parsing and use a helper
> (`fixRequestBody`) to re-send it. But for a pure proxy that never needs the body
> itself, turning the parser off is the cleaner choice.

## What the gateway itself answers

The only route the gateway handles on its own is `GET /health` (a tiny "I'm
alive" check). Everything under `/api/v1/...` is forwarded. The gateway stays
thin, exactly as a gateway should.

Next: checking the visitor's pass →
[03-jwt-verification-and-identity.md](03-jwt-verification-and-identity.md)
