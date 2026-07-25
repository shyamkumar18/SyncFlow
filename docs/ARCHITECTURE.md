# $yncFlow — Architecture Document

## 1. System Overview

$yncFlow follows a **microservices-oriented monolith** architecture with three main layers:
- **Frontend**: React (Web) + Flutter (Mobile)
- **Backend**: Node.js/Express API server
- **Database**: MongoDB with Mongoose ODM

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Web     │     │  Flutter Mobile  │     │   External      │
│   (Vite/TS)     │     │  (Android/iOS)  │     │   Gmail API     │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────┬───────────┘                       │
                     │ HTTPS/REST                        │ OAuth 2.0
                     ▼                                   │
         ┌──────────────────────┐                        │
         │   Express API        │◄───────────────────────┘
         │   (Node.js)          │
         │   - Auth Middleware   │
         │   - Rate Limiter      │
         │   - Validator         │
         │   - Gmail Sync        │
         │   - Transaction Parse │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │     MongoDB          │
         │  - Users             │
         │  - Transactions      │
         │  - Emails            │
         │  - Categories        │
         │  - Budgets           │
         │  - Goals             │
         │  - Settings          │
         └──────────────────────┘
```

## 2. Component Architecture

### 2.1 Backend (Node.js/Express)

```
backend/
├── src/
│   ├── config/           # Environment, DB, OAuth config
│   ├── middleware/        # Auth, rate-limit, validation, error
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express route definitions
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   │   ├── gmail/        # Gmail API integration
│   │   ├── parser/       # Transaction parsing engine
│   │   └── encryption/   # Field-level encryption
│   ├── utils/            # Helpers, constants
│   ├── validators/       # Request validation schemas
│   └── app.js            # Express app setup
├── tests/
└── server.js             # Entry point
```

### 2.2 Web Frontend (React/Vite/TypeScript)

```
web/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route pages
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API client, auth
│   ├── store/            # State management (Zustand)
│   ├── utils/            # Helpers
│   ├── types/            # TypeScript types
│   ├── assets/           # SVGs, images
│   └── styles/           # TailwindCSS config
├── public/
└── index.html
```

### 2.3 Mobile (Flutter)

```
mobile/
├── lib/
│   ├── models/           # Data models
│   ├── screens/          # Screen widgets
│   ├── widgets/          # Reusable widgets
│   ├── services/         # API client, auth
│   ├── providers/        # State management
│   ├── utils/            # Helpers
│   ├── theme/            # Material 3 theming
│   └── main.dart         # Entry point
├── android/
├── ios/
└── pubspec.yaml
```

## 3. Data Flow

### 3.1 Email Sync Flow
```
User clicks "Sync"
  → Frontend calls POST /api/emails/sync
  → Backend verifies Google OAuth token is valid
  → Backend calls Gmail API (users.messages.list)
  → Filters by banking email patterns
  → Fetches full message content for matching emails
  → Passes to Parser Service
  → Parser extracts structured transaction data
  → Encrypts sensitive fields
  → Stores in MongoDB (Emails + Transactions collections)
  → Returns sync summary to frontend
```

### 3.2 Authentication Flow
```
User clicks "Login with Google"
  → Redirected to Google OAuth consent screen
  → User grants Gmail readonly + profile + email scopes
  → Google returns authorization code
  → Backend exchanges code for access + refresh tokens
  → Backend creates/updates user record
  → Backend issues JWT + Refresh token
  → Frontend stores JWT in memory, refresh token in httpOnly cookie
  → JWT attached to subsequent API requests
```

### 3.3 Transaction Viewing Flow
```
User opens Dashboard
  → Frontend calls GET /api/transactions?limit=10&sort=-date
  → Backend authenticates via JWT middleware
  → Backend queries MongoDB (filtered by userId)
  → Backend decrypts sensitive fields
  → Returns paginated, sorted transactions
  → Frontend renders charts and transaction list
```

## 4. Security Architecture

- **Transport**: HTTPS (TLS 1.3)
- **Authentication**: JWT (access) + Refresh token rotation
- **Authorization**: Owner-based access (userId filter on all queries)
- **Encryption at rest**: AES-256-GCM for PII fields
- **Request protection**: Helmet, CORS, Rate limiting, Input validation
- **Database safety**: Parameterized queries, Mongoose sanitization

## 5. Rate Limiting Strategy

| Endpoint Group     | Rate Limit              |
|-------------------|------------------------|
| Auth endpoints    | 10 requests/minute/IP  |
| Gmail sync        | 5 requests/minute/user |
| Transaction APIs  | 100 requests/minute/user|
| Analytics APIs    | 60 requests/minute/user|
| Public pages      | 200 requests/minute/IP |

## 6. Error Handling Strategy

- **Validation errors**: 400 with field-level messages
- **Authentication errors**: 401 with clear message
- **Authorization errors**: 403
- **Not found**: 404
- **Rate limit exceeded**: 429 with Retry-After header
- **Server errors**: 500 (no stack traces in production)
- **Gmail API errors**: Graceful degradation, cached data fallback

## 7. Scalability Considerations

- MongoDB indexes on userId, date, category, bank
- Pagination (cursor-based for large collections)
- Email processing queue for async sync
- Read replicas for analytics queries (future)
- CDN for static assets (Cloudflare)
