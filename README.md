# Boxful API

REST API for the Boxful platform, built as part of the technical test.

## Tech Stack

- **Framework**: NestJS
- **Database**: MongoDB (Atlas)
- **ORM**: Prisma
- **Auth**: JWT (Access + Refresh tokens)
- **Docs**: Swagger

## Features

- JWT authentication (signup, login, refresh, logout)
- Order management with filtering and pagination
- Webhook endpoint for delivery status updates (COD support)
- Automatic settlement calculation for total orders per user
- Configurable shipping cost per day of the week

---

## Prerequisites

- Node.js 18+
- pnpm
- A MongoDB Atlas account (free tier is enough)

---

## Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/martin-tercero1/boxful-api.git
cd boxful-api
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env` file in the root of the project:
```env
DATABASE_URL="mongodb+srv://<user>:<password>@cluster.mongodb.net/boxful"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRES_IN="7d"
WEBHOOK_SECRET="your-webhook-secret"
PORT=3001
```

> **MongoDB Atlas**: Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas), create a database user, allow network access, and paste the connection string above.

### 4. Push the schema to the database
```bash
npx prisma generate
npx prisma db push
```

### 5. Seed shipping costs
```bash
pnpm run prisma:seed
```

This seeds the shipping cost configuration for each day of the week:

| Day | Cost |
|-----|------|
| Monday | $3.0 |
| Tuesday | $3.50 |
| Wednesday | $3.50 |
| Thursday | $3.50 |
| Friday | $4.00 |
| Saturday | $4.50 |
| Sunday | $5.00 |

> These values can be updated directly in MongoDB Atlas if needed.

### 6. Start the development server
```bash
pnpm start:dev
```

The API will be running at `http://localhost:3001`

---

## API Documentation

Once the server is running, full Swagger documentation is available at:

```
http://localhost:3001/docs
```

> For protected endpoints, click **Authorize** and paste your `accessToken` received from `/auth/login`.

For the webhook endpoint, use the `X-Webhook-Secret` header with the value set in your `.env`.

---

## API Overview

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/signup` | ❌ | Register new user |
| POST | `/api/v1/auth/login` | ❌ | Login, returns tokens |
| POST | `/api/v1/auth/refresh` | Refresh Token | Get new access token |
| POST | `/api/v1/auth/logout` | ✅ | Invalidate refresh token |
| GET | `/api/v1/auth/me` | ✅ | Get current user |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/orders` | ✅ | Create order |
| GET | `/api/v1/orders` | ✅ | List orders (filterable) |
| GET | `/api/v1/orders/settlement` | ✅ | Total settlement for logged-in user |
| POST | `/api/v1/orders/:id/delivery` | Webhook Secret | Delivery status update |

### Order Filters (`GET /orders`)
```
?status=DELIVERED
?cashOnDelivery=true
?from=2025-01-01&to=2025-12-31
?reference=ORD-202505
?page=1&limit=10
```

---

## Settlement Logic

For each order the settlement is calculated as follows:

**COD Order:**
```
Commission     = amountCollected × 0.0001 (max $25)
Settlement     = amountCollected - shippingCost - commission
```

**Standard Order (no COD):**
```
Settlement     = -shippingCost
```

Shipping cost is determined by the day of the week of the delivery (or scheduled date if not yet delivered).

---

## Live Demo

API: `https://boxful-api.vercel.app`
Docs: `https://boxful-api.vercel.app/docs`