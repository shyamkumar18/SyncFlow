# $yncFlow — Database Design

## 1. MongoDB Database: syncflow

## 2. Collections

### 2.1 Users

```json
{
  "_id": "ObjectId",
  "email": "string (unique, indexed)",
  "password": "string (bcrypt hash, nullable for OAuth users)",
  "displayName": "string",
  "avatar": "string (URL)",
  "provider": "enum: ['local', 'google']",
  "googleId": "string (unique, sparse)",
  "googleAccessToken": "string (encrypted)",
  "googleRefreshToken": "string (encrypted)",
  "gmailSyncEnabled": "boolean (default: true)",
  "lastSyncAt": "Date",
  "monthlyIncome": "number (default: 0)",
  "currency": "string (default: 'INR')",
  "timezone": "string (default: 'Asia/Kolkata')",
  "emailVerified": "boolean (default: false)",
  "refreshTokens": [{
    "token": "string (hashed)",
    "deviceInfo": "string",
    "expiresAt": "Date",
    "createdAt": "Date"
  }],
  "role": "enum: ['user', 'admin'] (default: 'user')",
  "isActive": "boolean (default: true)",
  "createdAt": "Date",
  "updatedAt": "Date"
}

Indexes:
- { email: 1 } (unique)
- { googleId: 1 } (unique, sparse)
- { role: 1 }
```

### 2.2 Emails

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users, indexed)",
  "gmailMessageId": "string (unique per user)",
  "threadId": "string",
  "from": "string (encrypted)",
  "to": "string (encrypted)",
  "subject": "string (encrypted)",
  "body": "string (encrypted)",
  "bodyText": "string (encrypted, plain text version)",
  "snippet": "string (encrypted)",
  "receivedAt": "Date",
  "category": "enum: ['transaction', 'credit_card', 'debit_card', 'upi', 'emi', 'loan', 'refund', 'failed', 'statement', 'unknown']",
  "bank": "string (detected bank name)",
  "isProcessed": "boolean (default: false)",
  "hasTransaction": "boolean (default: false)",
  "transactionId": "ObjectId (ref: Transactions, nullable)",
  "labels": ["string"],
  "attachments": [{
    "filename": "string",
    "mimeType": "string",
    "size": "number"
  }],
  "createdAt": "Date",
  "updatedAt": "Date"
}

Indexes:
- { userId: 1, gmailMessageId: 1 } (unique)
- { userId: 1, receivedAt: -1 }
- { userId: 1, category: 1 }
- { userId: 1, bank: 1 }
- { userId: 1, isProcessed: 1 }
- { userId: 1, 'labels': 1 }
```

### 2.3 Transactions

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users, indexed)",
  "emailId": "ObjectId (ref: Emails, indexed)",
  "amount": "number",
  "currency": "string (default: 'INR')",
  "type": "enum: ['debit', 'credit']",
  "date": "Date",
  "time": "string",
  "description": "string (encrypted)",
  "merchant": "string (encrypted)",
  "sender": "string (encrypted)",
  "receiver": "string (encrypted)",
  "balance": "number (nullable)",
  "upiId": "string (encrypted, nullable)",
  "referenceNumber": "string (encrypted, nullable)",
  "bank": "string",
  "cardType": "enum: ['credit', 'debit', 'unknown']",
  "cardNumber": "string (encrypted, masked for display: 'XXXX1234')",
  "status": "enum: ['success', 'failed', 'pending', 'refunded']",
  "category": "ObjectId (ref: Categories, nullable)",
  "tags": ["string"],
  "notes": "string (encrypted, nullable)",
  "isRecurring": "boolean (default: false)",
  "isManual": "boolean (default: false)",
  "createdAt": "Date",
  "updatedAt": "Date"
}

Indexes:
- { userId: 1, date: -1 }
- { userId: 1, type: 1 }
- { userId: 1, bank: 1 }
- { userId: 1, category: 1 }
- { userId: 1, status: 1 }
- { userId: 1, merchant: 1 }
- { userId: 1, date: -1, type: 1 }
- { amount: 1 } (for aggregation queries)
```

### 2.4 Categories

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users, indexed, nullable for defaults)",
  "name": "string",
  "type": "enum: ['income', 'expense']",
  "icon": "string",
  "color": "string (hex code)",
  "isDefault": "boolean (default: false)",
  "parent": "ObjectId (ref: Categories, nullable, for subcategories)",
  "sortOrder": "number (default: 0)",
  "isActive": "boolean (default: true)",
  "createdAt": "Date",
  "updatedAt": "Date"
}

Default Categories (Expense):
- Food & Dining
- Transport
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Education
- Housing
- Travel
- Investment
- Insurance
- Others

Default Categories (Income):
- Salary
- Freelance
- Investment
- Refund
- Gift
- Others

Indexes:
- { userId: 1, name: 1 } (unique)
- { userId: 1, type: 1 }
- { userId: 1, isDefault: 1 }
```

### 2.5 Wallets

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users, indexed)",
  "name": "string",
  "type": "enum: ['savings', 'current', 'cash', 'wallet', 'investment']",
  "bank": "string",
  "accountNumber": "string (encrypted, masked: 'XXXX1234')",
  "balance": "number",
  "currency": "string (default: 'INR')",
  "color": "string (hex code)",
  "icon": "string",
  "isActive": "boolean (default: true)",
  "createdAt": "Date",
  "updatedAt": "Date"
}

Indexes:
- { userId: 1 }
- { userId: 1, type: 1 }
```

### 2.6 Cards

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users, indexed)",
  "type": "enum: ['credit', 'debit']",
  "bank": "string",
  "cardNetwork": "enum: ['visa', 'mastercard', 'rupay', 'amex']",
  "cardNumber": "string (encrypted, stored masked for display)",
  "cardHolderName": "string (encrypted)",
  "expiryMonth": "number",
  "expiryYear": "number",
  "creditLimit": "number (nullable, credit cards only)",
  "availableBalance": "number (nullable)",
  "billingDate": "number (day of month)",
  "isActive": "boolean (default: true)",
  "createdAt": "Date",
  "updatedAt": "Date"
}

Indexes:
- { userId: 1 }
- { userId: 1, type: 1 }
```

### 2.7 Banks

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users, indexed)",
  "name": "string",
  "emailPatterns": ["string (email domain/address patterns)"],
  "logo": "string (URL)",
  "color": "string (hex code)",
  "connected": "boolean (default: true)",
  "lastActivity": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}

Indexes:
- { userId: 1, name: 1 } (unique)
- { userId: 1 }
```

### 2.8 Budgets

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users, indexed)",
  "category": "ObjectId (ref: Categories)",
  "amount": "number",
  "period": "enum: ['monthly', 'yearly']",
  "month": "number (1-12)",
  "year": "number",
  "spent": "number (default: 0)",
  "rollover": "boolean (default: false)",
  "notifyAt": "number (percentage, default: 80)",
  "isActive": "boolean (default: true)",
  "createdAt": "Date",
  "updatedAt": "Date"
}

Indexes:
- { userId: 1, category: 1, period: 1, month: 1, year: 1 } (unique)
- { userId: 1, isActive: 1 }
```

### 2.9 Goals

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users, indexed)",
  "name": "string",
  "targetAmount": "number",
  "currentAmount": "number (default: 0)",
  "targetDate": "Date (nullable)",
  "icon": "string",
  "color": "string (hex code)",
  "category": "enum: ['savings', 'investment', 'debt', 'emergency', 'travel', 'education', 'purchase', 'other']",
  "priority": "enum: ['low', 'medium', 'high']",
  "notes": "string (nullable)",
  "isCompleted": "boolean (default: false)",
  "completedAt": "Date (nullable)",
  "isActive": "boolean (default: true)",
  "createdAt": "Date",
  "updatedAt": "Date"
}

Indexes:
- { userId: 1, isActive: 1 }
- { userId: 1, isCompleted: 1 }
- { userId: 1, priority: 1 }
```

### 2.10 Settings

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users, unique, indexed)",
  "theme": "enum: ['light', 'dark', 'system'] (default: 'system')",
  "language": "string (default: 'en')",
  "currency": "string (default: 'INR')",
  "timezone": "string (default: 'Asia/Kolkata')",
  "notificationPreferences": {
    "emailSync": "boolean (default: true)",
    "budgetAlerts": "boolean (default: true)",
    "goalReminders": "boolean (default: true)",
    "monthlyReport": "boolean (default: true)",
    "pushNotifications": "boolean (default: true)"
  },
  "privacy": {
    "showAmountsInDashboard": "boolean (default: true)",
    "showRecentTransactions": "boolean (default: true)"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}

Indexes:
- { userId: 1 } (unique)
```

### 2.11 Notifications

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users, indexed)",
  "type": "enum: ['budget_alert', 'goal_milestone', 'sync_complete', 'monthly_report', 'system']",
  "title": "string",
  "message": "string",
  "data": "object (nullable, additional payload)",
  "isRead": "boolean (default: false)",
  "createdAt": "Date"
}

Indexes:
- { userId: 1, isRead: 1, createdAt: -1 }
- { userId: 1, type: 1 }
```

## 3. Encryption Strategy

| Field                      | Encryption | Algorithm  |
|----------------------------|-----------|------------|
| Email subject              | Yes       | AES-256-GCM|
| Email body                 | Yes       | AES-256-GCM|
| Transaction description    | Yes       | AES-256-GCM|
| Merchant name              | Yes       | AES-256-GCM|
| Sender/Receiver            | Yes       | AES-256-GCM|
| UPI ID                     | Yes       | AES-256-GCM|
| Reference number           | Yes       | AES-256-GCM|
| Card number                | Yes       | AES-256-GCM|
| Account number             | Yes       | AES-256-GCM|
| Google tokens              | Yes       | AES-256-GCM|
| Password                   | bcrypt    | —          |
| Refresh tokens             | bcrypt    | —          |

## 4. Relationships

- User 1──N Emails
- User 1──N Transactions
- User 1──N Categories
- User 1──N Wallets
- User 1──N Cards
- User 1──N Banks
- User 1──N Budgets
- User 1──N Goals
- User 1──1 Settings
- User 1──N Notifications
- Email 1──1 Transaction (optional)
- Transaction N──1 Category (optional)
