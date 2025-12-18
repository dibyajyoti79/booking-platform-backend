# Booking Service - gRPC Microservice

A gRPC-based microservice for hotel booking management, built with TypeScript, Node.js, and Prisma.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Buf** (for proto code generation)
- **MariaDB/MySQL** database
- **Prisma** (included as dev dependency)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd booking-service
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Install Buf** (if not already installed)

   ```bash
   npm install -g @bufbuild/buf
   ```

   Or use the local version:

   ```bash
   npx buf --version
   ```

4. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # Database Configuration
   DATABASE_HOST=localhost
   DATABASE_USER=your_username
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=booking_db
   ```

5. **Set up the database**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations (if you have migrations)
   npx prisma migrate dev

   # Or push schema to database
   npx prisma db push
   ```

6. **Generate proto types**
   ```bash
   npm run proto:generate
   ```

### Running the Project

**Development mode** (with auto-reload):

```bash
npm run dev
```

**Production mode**:

```bash
# Build the project
npm run build

# Start the server
npm start
```

The gRPC server will start on `0.0.0.0:3001` (or the port specified in `.env`).

## 📋 Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript and generate proto types
- `npm start` - Start production server
- `npm run proto:generate` - Generate TypeScript types from proto files
- `npm run proto:lint` - Lint proto files
- `npm run proto:format` - Format proto files

## 🧪 Testing the API

### Using gRPC Client Tools

**Using BloomRPC** (GUI client):

1. Import `src/proto/booking.proto`
2. Connect to `localhost:3001`
3. Call `CreateBooking` with required fields

**Using grpcurl** (CLI):

```bash
# Install grpcurl
# Windows: choco install grpcurl
# Mac: brew install grpcurl
# Linux: See https://github.com/fullstorydev/grpcurl

# List services
grpcurl -plaintext localhost:3001 list

# Call CreateBooking
grpcurl -plaintext -d '{
  "userId": 1,
  "hotelId": 1,
  "bookingAmount": "100.50",
  "checkIn": 1735689600,
  "checkOut": 1735862400,
  "totalGuests": 2
}' localhost:3001 booking.v1.BookingService/CreateBooking
```

**Using Postman** (with gRPC support):

1. Create a new gRPC request
2. Import `src/proto/booking.proto`
3. Server URL: `localhost:3001`
4. Select method: `CreateBooking`
5. Fill in request body and send

## 📁 Project Structure

```
booking-service/
├── src/
│   ├── config/          # Configuration files
│   ├── handlers/         # gRPC request handlers
│   ├── services/         # Business logic layer
│   ├── repositories/     # Data access layer
│   ├── mappers/          # DTO ↔ Domain mapping
│   ├── types/            # Domain types
│   ├── interceptors/     # gRPC interceptors
│   ├── proto/            # Proto definitions
│   │   ├── booking.proto
│   │   └── generated/    # Auto-generated types
│   └── server.ts         # Server entry point
├── buf.yaml              # Buf configuration
├── buf.gen.yaml          # Proto generation config
└── package.json
```

## 🔧 Configuration

### Environment Variables

| Variable            | Description                          | Default       |
| ------------------- | ------------------------------------ | ------------- |
| `PORT`              | gRPC server port                     | `3001`        |
| `NODE_ENV`          | Environment (development/production) | `development` |
| `DATABASE_HOST`     | Database host                        | Required      |
| `DATABASE_USER`     | Database username                    | Required      |
| `DATABASE_PASSWORD` | Database password                    | Required      |
| `DATABASE_NAME`     | Database name                        | Required      |

## 📚 API Methods

- `CreateBooking` - Create a new booking
- `GetBooking` - Get booking by ID
- `UpdateBookingStatus` - Update booking status
- `CancelBooking` - Cancel a booking
- `ListUserBookings` - List bookings for a user

## 🛠️ Development

### Adding a New Service

1. Create proto file in `src/proto/`
2. Run `npm run proto:generate`
3. Create handler in `src/handlers/`
4. Create service in `src/services/`
5. Add to `src/config/service-registry.ts`

### Proto Code Generation

The project uses **Buf** with **ts-proto** for code generation:

- Proto files: `src/proto/*.proto`
- Generated types: `src/proto/generated/*.ts`
- Config: `buf.yaml`, `buf.gen.yaml`

**Important:** Always run `npm run proto:generate` after modifying proto files.

## 📝 Notes

- The server uses **insecure credentials** for development. Use TLS in production.
- Proto types are auto-generated - do not edit `src/proto/generated/` manually.
- Logs are written to `logs/` directory (daily rotation).

## 🐛 Troubleshooting

**"The server does not implement the method"**

- Ensure handler keys match generated service definition (camelCase)
- Restart the server after code changes

**Proto generation errors**

- Verify Buf is installed: `buf --version`
- Check `buf.yaml` and `buf.gen.yaml` configuration

**Database connection errors**

- Verify database credentials in `.env`
- Ensure database is running and accessible
- Run `npx prisma generate` to regenerate Prisma client

## 📄 License

ISC
