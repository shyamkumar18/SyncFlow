# $yncFlow — Software Requirements Specification

## 1. Introduction

### 1.1 Purpose
This document defines the functional and non-functional requirements for $yncFlow, a personal finance platform that extracts transactions from Gmail and provides analytics.

### 1.2 Scope
The system consists of:
- Node.js/Express backend with MongoDB
- React/Vite/TypeScript web application
- Flutter mobile applications (Android + iOS)
- Google OAuth 2.0 integration
- Gmail API read-only integration

### 1.3 Definitions
- **Transaction**: A parsed financial event extracted from an email
- **Mail Center**: Module for viewing and filtering banking emails
- **Bank Detection**: Automatic identification of the sender bank
- **Normalization**: Converting extracted data into a standard schema

## 2. Functional Requirements

### FR-01: User Authentication
- FR-01.1: Users shall register with email and password
- FR-01.2: Users shall authenticate via Google OAuth 2.0
- FR-01.3: JWT tokens shall be issued upon successful authentication
- FR-01.4: Refresh tokens shall be supported
- FR-01.5: Passwords shall be hashed using bcrypt
- FR-01.6: Rate limiting shall apply to login attempts

### FR-02: Gmail Integration
- FR-02.1: Users shall grant read-only Gmail access via Google OAuth
- FR-02.2: System shall discover banking emails automatically
- FR-02.3: System shall support manual email refresh
- FR-02.4: System shall respect Gmail API quotas
- FR-02.5: OAuth tokens shall be refreshed automatically

### FR-03: Transaction Extraction
- FR-03.1: System shall extract amount, date, time, merchant/payee
- FR-03.2: System shall detect debit/credit type
- FR-03.3: System shall extract UPI reference numbers
- FR-03.4: System shall extract running balance when available
- FR-03.5: System shall detect card type (Credit/Debit)
- FR-03.6: System shall identify transaction status (Success/Failed/Pending)

### FR-04: Bank Detection
- FR-04.1: System shall detect bank from sender email address
- FR-04.2: System shall detect bank from email content patterns
- FR-04.3: System shall support at least 10 major Indian banks
- FR-04.4: Bank detection shall be extensible via configuration

### FR-05: Mail Center
- FR-05.1: Users shall view all banking emails
- FR-05.2: Users shall filter by bank, type, date, status
- FR-05.3: Users shall search emails by keyword
- FR-05.4: Users shall categorize emails manually
- FR-05.5: Email categories: All, Transaction, Credit Card, Debit Card, UPI, EMI, Loan, Refund, Failed, Statements

### FR-06: Dashboard
- FR-06.1: Display total income (current month)
- FR-06.2: Display total expense (current month)
- FR-06.3: Display net savings
- FR-06.4: Display cash flow chart (income vs expense over time)
- FR-06.5: Display recent transactions (last 10)
- FR-06.6: Display notification summary
- FR-06.7: All figures shall be real-time

### FR-07: Analytics
- FR-07.1: Spending by category (pie chart)
- FR-07.2: Spending by merchant (bar chart)
- FR-07.3: Monthly trend (line chart)
- FR-07.4: Bank-wise distribution
- FR-07.5: Card-wise spending breakdown
- FR-07.6: Export to CSV/PDF

### FR-08: Budgets
- FR-08.1: Users shall create monthly budgets by category
- FR-08.2: Users shall track budget utilization
- FR-08.3: System shall send alerts when exceeding budget
- FR-08.4: Rollover to next month (optional)

### FR-09: Goals
- FR-09.1: Users shall create financial goals with target amount
- FR-09.2: Users shall set target date
- FR-09.3: System shall track progress
- FR-09.4: System shall suggest monthly savings needed

### FR-10: Settings
- FR-10.1: Users shall manage profile information
- FR-10.2: Users shall manage notification preferences
- FR-10.3: Users shall manage bank connections
- FR-10.4: Users shall set currency preferences
- FR-10.5: Users shall set monthly income
- FR-10.6: Users shall delete account with data purging

## 3. Non-Functional Requirements

### NFR-01: Security
- NFR-01.1: All API endpoints shall use HTTPS
- NFR-01.2: Sensitive data shall be encrypted at rest (AES-256-GCM)
- NFR-01.3: JWT tokens shall expire in 15 minutes
- NFR-01.4: Refresh tokens shall expire in 7 days
- NFR-01.5: Rate limiting: 100 requests/minute per user
- NFR-01.6: Helmet.js for HTTP headers
- NFR-01.7: Input validation on all endpoints
- NFR-01.8: CSRF protection enabled
- NFR-01.9: MongoDB injection prevention

### NFR-02: Performance
- NFR-02.1: API response time < 200ms for 95% of requests
- NFR-02.2: Email sync time < 30 seconds for initial sync
- NFR-02.3: Dashboard load < 1 second
- NFR-02.4: Support 1000 concurrent users

### NFR-03: Availability
- NFR-03.1: 99.9% uptime (excluding planned maintenance)
- NFR-03.2: Graceful degradation if Gmail API is unavailable

### NFR-04: Scalability
- NFR-04.1: Horizontal scaling for backend
- NFR-04.2: MongoDB indexing for query performance
- NFR-04.3: Pagination for all list endpoints

### NFR-05: Compatibility
- NFR-05.1: Web: Chrome, Firefox, Safari, Edge (last 2 versions)
- NFR-05.2: Mobile: Android 8+, iOS 14+

## 4. Constraints

- C-01: Must use Gmail API (not IMAP) as primary email source
- C-02: Must never request Gmail passwords
- C-03: Must comply with Google API Services User Data Policy
- C-04: Must be deployable on Cloudflare Workers (web) and Render/Railway (backend)

## 5. Assumptions

- A-01: Users have a Gmail account
- A-02: Users receive banking emails in their Gmail inbox
- A-03: Banking emails follow consistent formats per bank
- A-04: Users have reliable internet connectivity
