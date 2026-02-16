# Notification Service

Node.js + TypeScript service that **consumes Redis/BullMQ queues** and sends **emails** (e.g. reservation confirmation). Also exposes a small HTTP API to enqueue notification jobs. Used by booking-service and auth-service.

## Tech stack

- **Node.js**, **Express**, **TypeScript**
- **Redis** + **BullMQ** (queues)
- **Nodemailer** (SMTP)
- **Winston** logging

## Responsibilities

- **Worker:** Process jobs from mailer queue (e.g. reservation confirmation template).
- **HTTP:** Endpoints to enqueue notifications (e.g. `POST /api/v1/notifications/...`) for other services to call.
- Handles correlation IDs for tracing.

## Run

```bash
npm install
npm run dev
```

Default: `PORT=3001`. **Redis must be running** (default `localhost:6379`). Use a different `PORT` when running alongside other Node services.

## Environment

| Variable                | Default     | Description   |
| ----------------------- | ----------- | ------------- |
| `PORT`                  | `3001`      | Server port   |
| `REDIS_HOST`            | `localhost` | Redis host    |
| `REDIS_PORT`            | `6379`      | Redis port    |
| `MAIL_ID` / `MAIL_USER` | —           | SMTP user     |
| `MAIL_PASSWORD`         | —           | SMTP password |

## API (under `/api/v1`)

- **Health:** `GET /ping`, `GET /ping/health`
- **Enqueue:** e.g. `POST /notifications/send`

Workers start with the app and listen to the configured Redis queue(s).
