# $yncFlow — Security Document

## 1. Overview

Security is the top priority for $yncFlow as it handles sensitive financial data and Gmail access. This document outlines all security measures implemented in the system.

## 2. Authentication

### 2.1 Password-Based Authentication
- Passwords hashed with bcrypt (salt rounds: 12)
- Minimum password length: 8 characters
- Password complexity: uppercase, lowercase, number, special character
- Account lockout after 5 failed attempts (15-minute cooldown)
- Password reset via email with expiring token (15 minutes)

### 2.2 Google OAuth 2.0
- Uses Google Identity Platform
- Scopes requested: `https://www.googleapis.com/auth/gmail.readonly`, `profile`, `email`
- Never requests Gmail passwords
- OAuth credentials stored securely (encrypted)
- Token refresh handled automatically

### 2.3 JWT Strategy
- Access token: 15-minute expiry
- Refresh token: 7-day expiry, rotating
- Refresh tokens stored hashed (bcrypt) in database
- JWT signed with HS256 using a strong secret
- JWT contains: userId, role, iat, exp

### 2.4 Session Management
- Single device? Multiple sessions allowed, configurable
- Force logout all devices (invalidates all refresh tokens)
- Logout invalidates current refresh token

## 3. Data Encryption

### 3.1 Encryption at Rest
- Algorithm: AES-256-GCM (Authenticated Encryption)
- Key derivation: PBKDF2 with 100,000 iterations
- Each user gets a unique encryption key derived from their ID + master key
- Initialization Vector (IV): 12 bytes, random per encryption
- Auth tag: 16 bytes
- Encrypted fields are stored as: `iv:ciphertext:authTag` (base64)

### 3.2 Fields Encrypted
- Email subject, body, snippet, from, to
- Transaction description, merchant, sender, receiver
- UPI IDs, reference numbers
- Card numbers, account numbers
- Google OAuth tokens (access + refresh)

### 3.3 Encryption Flow
```
Encryption:
plaintext → AES-256-GCM(key, iv) → iv:ciphertext:authTag → base64 → DB

Decryption:
DB → base64 decode → iv:ciphertext:authTag → AES-256-GCM-decrypt(key, iv, authTag) → plaintext
```

### 3.4 Key Management
- Master encryption key stored in environment variable (ENCRYPTION_KEY)
- Key rotated via re-encryption script
- Development: single master key
- Production: key per deployment environment, stored in secret manager

## 4. API Security

### 4.1 HTTP Headers (Helmet.js)
- Content-Security-Policy
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000; includeSubDomains
- Referrer-Policy: strict-origin-when-cross-origin

### 4.2 Rate Limiting
- Global: 200 requests/minute/IP
- Auth endpoints: 10 requests/minute/IP
- Gmail sync: 5 requests/minute/user
- Standard API: 100 requests/minute/user
- Response header: `Retry-After`

### 4.3 CORS
- Allowed origins: configured via environment variable
- Methods: GET, POST, PUT, PATCH, DELETE
- Allowed headers: Content-Type, Authorization
- Credentials: true (for httpOnly cookies)
- Max age: 86400 seconds

### 4.4 Input Validation
- All inputs validated using Joi/Zod schemas
- String sanitization (strip HTML tags)
- MongoDB injection prevention (mongoose sanitize, mongo-sanitize)
- Parameter pollution prevention
- Request body size limit: 10MB

### 4.5 CSRF Protection
- Double-submit cookie pattern
- CSRF token in custom header: X-CSRF-Token
- Token generated per session
- Validated on state-changing requests (POST, PUT, PATCH, DELETE)

## 5. Database Security

### 5.1 MongoDB
- Authentication enabled (username/password)
- Connection string with parameters: `retryWrites=true&w=majority`
- No raw queries — Mongoose ODM with parameterized queries
- Sanitize queries: strip `$where`, `$regex` abuse, `$ne` abuse
- Least-privilege database user (readWrite on syncflow database only)

### 5.2 Data Isolation
- All queries scoped by userId
- Users cannot access other users' data even with valid JWTs
- userId filter applied in controller layer

## 6. Gmail API Security

### 6.1 Scope Compliance
- Read-only scope only: `gmail.readonly`
- Never requests `gmail.modify`, `gmail.send`, `gmail.compose`
- OAuth verification required for production (Google API verification)

### 6.2 Token Management
- Access tokens encrypted at rest
- Tokens refreshed automatically before expiry
- Revoked tokens detected and handled gracefully

## 7. Infrastructure Security

### 7.1 Backend (Node.js/Express)
- Run as non-root user
- Process manager: PM2 with cluster mode
- Graceful shutdown on SIGTERM
- Health check endpoint (no auth): GET /api/health

### 7.2 Environment Variables
- `NODE_ENV` — environment
- `PORT` — server port
- `MONGODB_URI` — database connection
- `JWT_SECRET` — JWT signing secret
- `JWT_REFRESH_SECRET` — refresh token secret
- `ENCRYPTION_KEY` — master encryption key
- `GOOGLE_CLIENT_ID` — OAuth client ID
- `GOOGLE_CLIENT_SECRET` — OAuth client secret
- `GOOGLE_REDIRECT_URI` — OAuth redirect URI
- `CORS_ORIGIN` — allowed CORS origin
- `REDIS_URL` — (optional) for rate limiting

Never commit .env files. Use .env.example with placeholder values.

### 7.3 Secrets Management
- Development: .env file (gitignored)
- Production: Cloudflare Secrets / Render environment variables

## 8. Monitoring & Auditing

### 8.1 Logging
- Structured JSON logging (pino/winston)
- Log levels: error, warn, info, debug
- Never log sensitive data (passwords, tokens, decrypted PII)
- Request ID for tracing

### 8.2 Audit Trail
- Login attempts (success/failure)
- Password changes
- Profile updates
- Account deletion
- Email sync events
- Token refresh events

### 8.3 Alerts
- Rate limit threshold exceeded
- Failed login spike (>10 in 5 minutes)
- Gmail API errors
- Database connection failures

## 9. Compliance

- Google API Services User Data Policy compliance
- GDPR-compliant data deletion
- Data encryption at rest and in transit
- User data export available
- 90-day data retention for emails (configurable)

## 10. Security Checklist

- [x] HTTPS enforced
- [x] Helmet.js headers
- [x] Rate limiting
- [x] Input validation
- [x] Output sanitization (XSS prevention)
- [x] CSRF protection
- [x] MongoDB injection prevention
- [x] Parameter pollution prevention
- [x] bcrypt password hashing
- [x] JWT with short expiry
- [x] Refresh token rotation
- [x] Field-level encryption (AES-256-GCM)
- [x] CORS configuration
- [x] Request size limiting
- [x] No sensitive data in logs
- [x] Graceful error handling (no stack traces)
- [x] Environment variable validation
