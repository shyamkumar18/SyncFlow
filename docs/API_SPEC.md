# $yncFlow — API Specification

## Base URL

Development: `http://localhost:5000/api`
Production: `https://syncflow-api-mem4.onrender.com/api`

## Authentication

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

## Response Format

```json
{
  "success": true|false,
  "data": {},
  "message": "string",
  "errors": [] // validation errors if any
}
```

Pagination:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

## Auth Endpoints

### POST /api/auth/register
Create account with email + password.

Body: `{ "email", "password", "displayName" }`
Response: `{ user, accessToken, refreshToken }`

### POST /api/auth/login
Login with email + password.

Body: `{ "email", "password" }`
Response: `{ user, accessToken, refreshToken }`

### POST /api/auth/google
Login/register with Google OAuth.

Body: `{ "code" }` (authorization code from Google)
Response: `{ user, accessToken, refreshToken }`

### POST /api/auth/refresh
Refresh access token.

Body: `{ "refreshToken" }`
Response: `{ accessToken, refreshToken }`

### POST /api/auth/logout
Invalidate refresh token.

Body: `{ "refreshToken" }`
Response: `{ "message": "Logged out" }`

### POST /api/auth/forgot-password
Send password reset email.

Body: `{ "email" }`
Response: `{ "message": "Reset link sent" }`

### POST /api/auth/reset-password
Reset password with token.

Body: `{ "token", "password" }`
Response: `{ "message": "Password reset successful" }`

### GET /api/auth/me
Get current user profile.

Response: `{ user }`

---

## Email Endpoints (Protected)

### GET /api/emails
Get paginated emails.

Query: `?page=1&limit=20&category=transaction&bank=HDFC&search=keyword&startDate=2024-01-01&endDate=2024-12-31&sort=-receivedAt`
Response: `{ emails[], pagination }`

### GET /api/emails/:id
Get single email with decrypted content.

### GET /api/emails/stats
Email statistics.

Response: `{ total, unprocessed, categories:{}, banks:{} }`

### POST /api/emails/sync
Trigger Gmail sync.

Body: `{ "maxResults": 50 }` (optional, default: 50)
Response: `{ synced: number, newTransactions: number, failed: number }`

### GET /api/emails/banks
Get detected banks.

Response: `{ banks: [{ name, count, lastEmail }] }`

---

## Transaction Endpoints (Protected)

### GET /api/transactions
Get paginated transactions.

Query: `?page=1&limit=20&type=debit&bank=HDFC&category=...&status=success&startDate=...&endDate=...&search=...&sort=-date&minAmount=...&maxAmount=...`
Response: `{ transactions[], pagination }`

### GET /api/transactions/:id
Get single transaction.

### PATCH /api/transactions/:id
Update transaction (categorize, add notes).

Body: `{ "category", "notes", "tags" }`

### DELETE /api/transactions/:id
Delete transaction.

### POST /api/transactions/manual
Create manual transaction.

Body: `{ "amount", "type", "date", "description", "category", "bank", "notes" }`

### GET /api/transactions/summary
Transaction summary.

Query: `?startDate=...&endDate=...`
Response: `{ totalIncome, totalExpense, netSavings, count }`

### GET /api/transactions/grouped
Grouped by category/date/bank.

Query: `?groupBy=category|date|bank|merchant&startDate=...&endDate=...`
Response: `{ groups: [{ key, total, count, transactions[] }] }`

---

## Category Endpoints (Protected)

### GET /api/categories
Get all user categories (includes defaults).

### POST /api/categories
Create category.

Body: `{ "name", "type", "icon", "color", "parent" }`

### PUT /api/categories/:id
Update category.

### DELETE /api/categories/:id
Delete category (reassigns transactions to "Others").

### POST /api/categories/reset
Reset to default categories.

---

## Wallet Endpoints (Protected)

### GET /api/wallets
Get all wallets.

### POST /api/wallets
Create wallet.

Body: `{ "name", "type", "bank", "balance", "color", "icon" }`

### PUT /api/wallets/:id
Update wallet.

### DELETE /api/wallets/:id
Delete wallet.

### PATCH /api/wallets/:id/balance
Update balance.

Body: `{ "balance" }`

---

## Card Endpoints (Protected)

### GET /api/cards
Get all cards.

### POST /api/cards
Create card.

Body: `{ "type", "bank", "cardNetwork", "cardNumber", "expiryMonth", "expiryYear", "creditLimit", "billingDate" }`

### PUT /api/cards/:id
Update card.

### DELETE /api/cards/:id
Delete card.

---

## Bank Endpoints (Protected)

### GET /api/banks
Get all banks.

### PATCH /api/banks/:id
Update bank.

Body: `{ "connected", "emailPatterns" }`

---

## Budget Endpoints (Protected)

### GET /api/budgets
Get all active budgets (with spending).

### POST /api/budgets
Create budget.

Body: `{ "category", "amount", "period", "month", "year", "rollover", "notifyAt" }`

### PUT /api/budgets/:id
Update budget.

### DELETE /api/budgets/:id
Delete budget.

### GET /api/budgets/summary
Budget utilization summary.

Response: `{ budgets: [{ category, allocated, spent, remaining, percentage }] }`

---

## Goal Endpoints (Protected)

### GET /api/goals
Get all goals.

### POST /api/goals
Create goal.

Body: `{ "name", "targetAmount", "targetDate", "icon", "color", "category", "priority", "notes" }`

### PUT /api/goals/:id
Update goal.

### DELETE /api/goals/:id
Delete goal.

### PATCH /api/goals/:id/progress
Update goal progress.

Body: `{ "currentAmount" }`

---

## Notification Endpoints (Protected)

### GET /api/notifications
Get notifications.

Query: `?page=1&limit=20&unreadOnly=true`

### PATCH /api/notifications/:id/read
Mark as read.

### PATCH /api/notifications/read-all
Mark all as read.

---

## Settings Endpoints (Protected)

### GET /api/settings
Get user settings.

### PUT /api/settings
Update settings.

Body: `{ "theme", "language", "currency", "timezone", "notificationPreferences", "privacy" }`

### PUT /api/settings/profile
Update profile.

Body: `{ "displayName", "avatar", "monthlyIncome" }`

### DELETE /api/settings/account
Delete account.

---

## Analytics Endpoints (Protected)

### GET /api/analytics/overview
Dashboard overview data.

Response: `{ totalIncome, totalExpense, savings, cashflow[], recentTransactions[], notifications[] }`

### GET /api/analytics/spending-by-category
Query: `?startDate=...&endDate=...`
Response: `{ categories: [{ name, total, percentage, color }] }`

### GET /api/analytics/spending-by-merchant
Query: `?startDate=...&endDate=...&limit=10`
Response: `{ merchants: [{ name, total, count }] }`

### GET /api/analytics/monthly-trend
Query: `?months=12`
Response: `{ months: [{ month, year, income, expense, net }] }`

### GET /api/analytics/bank-distribution
Response: `{ banks: [{ name, total, count, percentage }] }`

### GET /api/analytics/card-spending
Query: `?startDate=...&endDate=...`
Response: `{ cards: [{ bank, type, total, count }] }`

### GET /api/analytics/cash-flow
Query: `?months=6`
Response: `{ flow: [{ month, year, income, expense, net }] }`

### GET /api/analytics/export
Query: `?type=csv|pdf&startDate=...&endDate=...`
Response: File download.

---

## Error Codes

| Code | Message                  | HTTP Status |
|------|--------------------------|-------------|
| VALIDATION_ERROR | Invalid input       | 400         |
| UNAUTHORIZED     | Invalid token       | 401         |
| TOKEN_EXPIRED    | Token expired       | 401         |
| FORBIDDEN        | No permission       | 403         |
| NOT_FOUND        | Resource not found  | 404         |
| RATE_LIMITED     | Too many requests   | 429         |
| INTERNAL_ERROR   | Server error        | 500         |
| GMAIL_ERROR      | Gmail API error     | 502         |
| SYNC_IN_PROGRESS | Sync already active | 409         |
