# 3. JWT Verification & Identity Forwarding

This is the gateway's security job: before forwarding a request to a **private**
room, check the visitor's pass (the JWT access token). If it's missing or fake,
stop them right here — they never even reach the service.

> Reminder from the auth notes: an **access token (JWT)** is a signed pass you get
> after logging in. "Signed" means it was stamped with a secret, so we can tell if
> someone faked or changed it.

## Public vs protected doors (`src/auth.middleware.ts`)

Some doors must be open to everyone (you can't require a token to *log in* — you
don't have one yet!). So we keep a list of **public** paths; everything else is
protected.

```ts
const PUBLIC_PATHS = new Set<string>([
  "/health",
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/refresh",
  "/api/v1/auth/logout",
  "/api/v1/auth/forgot-password",
  "/api/v1/auth/reset-password",
]);
```

A `Set` is a collection with fast "is this in the list?" checks. If the request's
path is in here, we wave it through. Otherwise, we demand a valid token.

## The check itself

```ts
export function createGatewayAuth(secret: string) {
  return (req, res, next) => {
    if (PUBLIC_PATHS.has(req.path)) { next(); return; }   // open door

    const header = req.headers.authorization;
    const token = header && header.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) { unauthorized(res, "AUTH_REQUIRED", "Missing bearer token"); return; }

    try {
      const payload = jwt.verify(token, secret);           // checks the signature + expiry
      req.headers["x-user-id"] = payload.sub;
      req.headers["x-user-email"] = payload.email;
      req.headers["x-user-role"] = payload.role;
      next();                                              // allowed → continue to the proxy
    } catch {
      unauthorized(res, "AUTH_INVALID", "Invalid or expired token");
    }
  };
}
```

Line by line:
- It's a **middleware** — a function that runs *before* the proxy, with `next()`
  meaning "all good, carry on."
- Public path → `next()` immediately.
- Read the `Authorization: Bearer <token>` header; pull out the token. No token →
  `401`.
- `jwt.verify(token, secret)` — the heart of it. It checks the token was signed
  with **our** secret and hasn't expired. If it was faked or is old, it **throws**,
  and we answer `401`.
- **Identity forwarding:** on success we copy the user's id, email, and role into
  `X-User-*` headers. The proxy then forwards these to the service. Now a service
  can simply *trust* `X-User-Id` instead of decoding the token itself.

### Why is `createGatewayAuth(secret)` a function that returns a function?

This pattern is a **factory**. We call it once at startup with the secret, and it
hands back the actual middleware (which "remembers" the secret). That keeps the
secret out of the middleware's guts and makes it easy to test.

## The secret must match the auth service

The gateway verifies tokens with `JWT_ACCESS_SECRET`. That value **must be the
same** secret the auth service used to *sign* the token — otherwise the signatures
won't match and every token looks fake. Both read it from their environment
(`.env` locally). In `main.ts` we even refuse to start without it:

```ts
const secret = process.env.JWT_ACCESS_SECRET;
if (!secret) throw new Error("JWT_ACCESS_SECRET is required");
```

> **Why crash on a missing secret instead of using a default?** A default secret
> would be a huge security hole (anyone could forge tokens). Failing loudly is far
> safer than running insecurely.

## Defense in depth

The auth service *also* checks the token on its own protected routes. So we verify
**twice** (gateway + service). That's on purpose: the gateway stops bad traffic
early and adds identity headers, while the service stays safe even if something
ever bypassed the gateway. Two locks are better than one.

## What we verified live

Through the gateway (`localhost:3001`): register and login (public) worked and
returned tokens · `/auth/me` **without** a token → `401` straight from the gateway
· `/auth/me` **with** a valid token → forwarded to auth and returned the user ·
a **fake** token → `401`. The single front door works. ✅

## Recap

- The gateway guards **protected** paths with `jwt.verify`, using the **same
  secret** the auth service signs with.
- **Public** auth paths (login, register, ...) and `/health` skip the check.
- On success it forwards identity as **`X-User-*` headers** so services can trust
  the gateway.
- It refuses to start without the secret, and the auth service still verifies too
  (defense in depth).

Back to the [index](README.md).
