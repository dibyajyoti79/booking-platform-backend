# Booking Platform — Backend

Backend for a hotel booking platform: API gateway (auth), hotel catalog with search, reservations with idempotency, and email notifications via queues.

## Architecture

| Service                  | Role                                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| **auth-service**         | API gateway, JWT auth, user signup/login, email verification, reverse proxy to hotel & booking     |
| **hotel-service**        | Hotels CRUD, room types, inventory, rates, availability check, **Elasticsearch** text search       |
| **booking-service**      | Reservations (create + confirm), idempotency, distributed lock (Redis), calls hotel + notification |
| **notification-service** | Redis/BullMQ worker: sends emails (e.g. reservation confirmation)                                  |

**Stack:** Go (Chi) · Node.js + TypeScript (Express) · MySQL (Prisma) · Redis · Elasticsearch · BullMQ · Nodemailer

## Prerequisites

- **Go**
- **Node.js**
- **MySQL**
- **Redis**
- **Elasticsearch**

## Quick start

1. **Clone and install**
   - `cd auth-service && go mod download`
   - `cd hotel-service && npm install && npx prisma generate`
   - `cd booking-service && npm install && npx prisma generate`
   - `cd notification-service && npm install`

2. **Databases**
   - Create DBs: `auth_dev`, `hotel-dev`, booking DB (see each service’s README).
   - Run migrations: `hotel-service`: `npx prisma migrate dev`; `booking-service`: same; auth uses raw SQL / migrations if any.

3. **Env**
   - Copy `.env.example` to `.env` in each service (or set in shell). Key vars:
   - **auth-service:** `PORT=8080`, `JWT_SECRET`, `DB_*`, `HOTEL_SERVICE_URL`, `BOOKING_SERVICE_URL`, `NOTIFICATION_SERVICE_URL`
   - **hotel-service:** `PORT`, `DB_*` / `DATABASE_*`, `ELASTICSEARCH_NODE` (optional)
   - **booking-service:** `PORT`, `REDIS_SERVER_URL`, `HOTEL_SERVICE_URL`, `NOTIFICATION_SERVICE_URL`, DB
   - **notification-service:** `PORT`, `REDIS_HOST`, `REDIS_PORT`, `MAIL_ID`, `MAIL_PASSWORD`

4. **Run (different terminals, different PORT per app)**

   ```bash
   # Terminal 1 – Redis
   redis-server

   # Terminal 2 – Gateway (entry point)
   cd auth-service && go run .

   # Terminal 3 – Hotel API
   cd hotel-service && npm run dev   # e.g. PORT=8000

   # Terminal 4 – Booking API
   cd booking-service && npm run dev   # e.g. PORT=3001

   # Terminal 5 – Notifications (worker + HTTP)
   cd notification-service && npm run dev   # e.g. PORT=3002
   ```

5. **Optional – Elasticsearch (hotel search)**  
   From repo root: `docker-compose up -d elasticsearch`. Set `ELASTICSEARCH_NODE=http://localhost:9200` for hotel-service.

## API entry point

All client traffic goes through **auth-service** (e.g. `http://localhost:8080`):

- **Auth:** `POST /signup`, `POST /login`, `GET /verify-email?token=...`, `GET /profile` (JWT), `POST /profile/become-host` (JWT)
- **Hotels:** `/hotel-api/hotels` (GET list/search **no auth**, GET by id, POST/PUT/DELETE with JWT, host role for write)
- **Bookings:** `/booking-api/reservation` (JWT required)

## Highlights

- **Microservices:** 4 services, clear boundaries, gateway pattern.
- **Auth:** JWT (access), email verification, role-based (host vs user), gateway forwards identity.
- **Search:** Elasticsearch full-text on hotels (name, address, location); index sync on write.
- **Resilience:** Idempotent reservation creation, Redis lock for overbooking prevention, best-effort ES sync.
- **Async:** BullMQ + Redis for email jobs; booking-service enqueues, notification-service processes.
