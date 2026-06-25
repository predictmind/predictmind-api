# 📚 PredictMind Gateway — Learn It Like You're 10

This is the **front door** of the whole PredictMind system. Every request from a
phone or website comes here first, and the gateway decides where to send it — and
whether the visitor is allowed in.

These notes explain the gateway in very simple words. Read them in order.

| # | File | What you'll learn |
| --- | --- | --- |
| 1 | [01-what-is-a-gateway.md](01-what-is-a-gateway.md) | Why we have one front door for many services |
| 2 | [02-proxying-and-routing.md](02-proxying-and-routing.md) | How the gateway forwards requests to the right service |
| 3 | [03-jwt-verification-and-identity.md](03-jwt-verification-and-identity.md) | How it checks your pass and tells services who you are |

> New to the words "server", "API", "token", "JWT"? The auth service's notes
> explain those from scratch — see `predictmind-auth-service/education/`. This
> folder assumes you've met those ideas.

## The one-sentence summary

The gateway is a **receptionist**: it greets every visitor at one desk, checks
their badge if the room they want is private, and walks them to the correct
office (service) — so the offices can focus on their work and not on the front
door.
