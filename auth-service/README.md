# Auth Service (API Gateway)

Go service that handles **authentication** and acts as the **API gateway** for the booking platform. Exposes signup, login, email verification, JWT-protected profile, and reverse-proxies requests to hotel-service and booking-service with path rewriting and user context (e.g. `X-User-ID`, `X-User-Role`).

## Tech stack

- **Go 1.24**, **Chi** router
- **MySQL**
- **JWT**, **bcrypt**
- **godotenv**, **validator**

## Responsibilities

- User **signup** / **login**; issue JWT
- **Email verification** (token in link)
- **Profile** (JWT) and **become-host** (role upgrade)
- **Gateway:** `/hotel-api/*` → hotel-service, `/booking-api/*` → booking-service; injects user headers; GET `/hotel-api/hotels` (list/search) is **public** (no JWT)

## Run

```bash
go mod download
# Set env (see below), ensure MySQL is up and DB exists
go run .
```

Default: `PORT=:8080`. Health: `GET /ping`.

## Environment

| Variable                                       | Default                 | Description                          |
| ---------------------------------------------- | ----------------------- | ------------------------------------ |
| `PORT`                                         | `:8080`                 | Server address                       |
| `JWT_SECRET`                                   | —                       | Signing key for access tokens        |
| `DB_USER`, `DB_PASSWORD`, `DB_ADDR`, `DB_NAME` | —                       | MySQL connection                     |
| `HOTEL_SERVICE_URL`                            | `http://localhost:8000` | Hotel service base URL               |
| `BOOKING_SERVICE_URL`                          | `http://localhost:3001` | Booking service base URL             |
| `NOTIFICATION_SERVICE_URL`                     | —                       | Used for sending verification emails |
| `VERIFICATION_LINK_BASE_URL`                   | —                       | Base URL for verify-email links      |

## Routes (direct)

- `GET /ping` — health
- `POST /signup` — register
- `POST /login` — login, returns JWT
- `GET /verify-email?token=...` — confirm email
- `GET /profile` — current user (JWT)
- `POST /profile/become-host` — set role to host (JWT)
- `GET/POST /hotel-api/*` — proxied to hotel-service
- `GET/POST /booking-api/*` — proxied to booking-service
