# Booking Service

Node.js + TypeScript service for **reservations**: create (with idempotency key) and confirm. Uses **Redis** for distributed locking to avoid overbooking and calls hotel-service for availability and notification-service to enqueue confirmation emails.

## Tech stack

- **Node.js**, **Express**, **TypeScript**
- **Prisma** + **MySQL**
- **Redis**
- **Zod** validation, **Winston** logging

## Responsibilities

- **Create reservation** (idempotency key): validate dates, lock, check availability (hotel-service), create booking, enqueue confirmation email (notification-service), release lock.
- **Confirm reservation** by idempotency key
- **Get reservation** by ID (for authenticated user).

Expects **JWT** from gateway; user id/role taken from `X-User-ID` / `X-User-Role` headers set by auth-service.

## Run

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Default: `PORT=3001`. Ensure Redis is running. Base path: `/api/v1`.

## Environment

| Variable                    | Default                  | Description                          |
| --------------------------- | ------------------------ | ------------------------------------ |
| `PORT`                      | `3001`                   | Server port                          |
| `REDIS_SERVER_URL`          | `redis://localhost:6379` | Redis for BullMQ (and locks if used) |
| `HOTEL_SERVICE_URL`         | `http://localhost:3000`  | Hotel service base URL               |
| `NOTIFICATION_SERVICE_URL`  | `http://localhost:3002`  | Notification service base URL        |
| `LOCK_TTL`                  | `60000`                  | Lock TTL (ms)                        |
| DB (`DATABASE_*` or Prisma) | —                        | MySQL connection                     |

## Main endpoints (under `/api/v1`)

- `POST /reservation` — create (body: idempotency key, hotel/room/dates, etc.; JWT via gateway)
- `POST /reservation/confirm/:idempotencyKey` — confirm
- `GET /reservation/:id` — reservation details

All booking traffi goes via gateway: `/booking-api/reservation`, etc.
