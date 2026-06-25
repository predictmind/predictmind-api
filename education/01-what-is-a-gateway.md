# 1. What Is an API Gateway?

## The problem it solves

PredictMind isn't one program — it's many small ones (microservices): auth,
market, news, strategy, backtest, paper trading, reporting, AI. Each runs on its
own **port** (its own little door): auth on 3002, market on 3003, and so on.

Now imagine the phone app had to know *all* those addresses and ports. Messy! And
every service would have to handle security, rate limits, and logging by itself.

## The solution: one front door

An **API gateway** is a single service that sits in front of all the others. The
app only ever talks to **one** address (the gateway, on port `3001`). The gateway
then forwards each request to the correct service behind the scenes.

```text
                       ┌──────────────┐
   phone / website ──▶ │   GATEWAY    │  (the only public door, port 3001)
                       └──────┬───────┘
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
        auth (3002)      market (3003)    strategy (3005) ...
```

## Why this is a good idea

- **Simplicity for clients:** the app remembers one address, not nine.
- **Security in one place:** the gateway checks the visitor's pass (token) once,
  so each service doesn't have to worry about the front-door check.
- **Cross-cutting jobs in one place:** later we can add rate limiting (stop
  someone spamming), logging (record every request), and CORS rules here — once,
  instead of in every service.
- **Hide the inside:** the world never sees the internal services or their ports.
  Only the gateway is exposed.

## Real-life analogy

Think of a big office building. Visitors don't wander to each office's private
back door. They come to the **reception desk** (gateway), show ID if needed, and
the receptionist directs them to the right floor. The offices (services) trust
that reception already checked everyone at the door.

## Our gateway is small on purpose

A gateway should be **thin** — it shouldn't contain business logic (no trading
rules, no user records). It only **routes** and **guards**. All the real work
lives in the services. If the gateway starts doing real work, that's a smell.

Next: how the forwarding actually works →
[02-proxying-and-routing.md](02-proxying-and-routing.md)
