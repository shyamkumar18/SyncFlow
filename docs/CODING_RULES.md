# $yncFlow — Coding Rules

## 1. General Rules

- All code in English
- No hardcoded secrets, URLs, or credentials
- No TODOs or placeholder code ever
- No console.log in production code
- No commented-out code
- All new features require documentation
- Fail fast: validate inputs at boundaries

## 2. Backend (Node.js/Express)

### 2.1 Project Structure
```
backend/
├── src/
│   ├── config/         # Configuration modules
│   ├── middleware/      # Express middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # Route definitions
│   ├── controllers/    # Request handlers
│   ├── services/       # Business logic
│   ├── validators/     # Request validation
│   ├── utils/          # Utility functions
│   └── app.js          # App entry
├── tests/
├── server.js
└── package.json
```

### 2.2 Naming Conventions
- Files: camelCase (e.g., `authController.js`)
- Classes: PascalCase (e.g., `GmailService`)
- Functions: camelCase (e.g., `getTransactions`)
- Variables: camelCase (e.g., `userEmail`)
- Constants: UPPER_SNAKE_CASE (e.g., `JWT_EXPIRY`)
- MongoDB models: PascalCase, singular (e.g., `User`, `Transaction`)

### 2.3 Route Structure
```
GET    /api/resource       → getAll
GET    /api/resource/:id   → getById
POST   /api/resource       → create
PUT    /api/resource/:id   → update
PATCH  /api/resource/:id   → partialUpdate
DELETE /api/resource/:id   → remove
```

### 2.4 Controller Pattern
```javascript
// controllers/resourceController.js
export const getAll = async (req, res, next) => {
  try {
    // validate query params
    // build filter from req.query
    // query database with userId scope
    // return paginated response
  } catch (error) {
    next(error);
  }
};
```

### 2.5 Service Layer
- Controllers handle request/response only
- Services contain business logic
- Services are testable independently

### 2.6 Error Handling
- Use custom AppError class
- Centralized error handler middleware
- Operational errors: expected, handled gracefully
- Programming errors: crash, restart

### 2.7 Async Handling
- Use async/await
- Wrap controllers in asyncHandler utility
- No floating promises — always await or handle errors

## 3. Frontend (React/Vite/TypeScript)

### 3.1 Project Structure
```
web/
├── src/
│   ├── components/     # Reusable components
│   │   ├── ui/         # Basic UI components
│   │   └── ...         # Feature components
│   ├── pages/          # Route pages
│   ├── hooks/          # Custom hooks
│   ├── services/       # API client
│   ├── store/          # State management
│   ├── utils/          # Helpers
│   ├── types/          # TypeScript types
│   └── assets/         # Static assets
├── public/
└── package.json
```

### 3.2 Naming Conventions
- Files: PascalCase for components (e.g., `DashboardPage.tsx`)
- Components: PascalCase (e.g., `TransactionCard`)
- Hooks: camelCase with `use` prefix (e.g., `useTransactions`)
- Functions: camelCase
- Types: PascalCase with `I` prefix for interfaces (e.g., `IUser`)

### 3.3 Component Rules
- One component per file (default export)
- Named exports for utilities
- Functional components with hooks
- Props typed with TypeScript
- No class components

### 3.4 State Management
- Zustand for global state (auth, settings)
- React Query for server state (transactions, emails)
- Local state for UI concerns

### 3.5 API Client
- Axios instance with base URL and interceptors
- Automatic JWT attachment
- Refresh token rotation in interceptor
- Typed responses

### 3.6 Styling
- TailwindCSS for all styling
- No CSS modules or styled-components
- Consistent use of theme values
- Responsive design with Tailwind breakpoints

## 4. Mobile (Flutter)

### 4.1 Project Structure
```
mobile/lib/
├── models/          # Data classes
├── screens/         # Screen widgets
├── widgets/         # Reusable widgets
├── services/        # API and auth services
├── providers/       # State management (Riverpod)
├── utils/           # Helpers
└── theme/           # Material 3 theme
```

### 4.2 Naming Conventions
- Files: snake_case (e.g., `transaction_card.dart`)
- Classes: PascalCase (e.g., `TransactionCard`)
- Functions/variables: camelCase (e.g., `getTransactions`)
- Constants: camelCase in const class

### 4.3 State Management
- Riverpod for state management
- Provider for dependency injection

## 5. Database (MongoDB)

### 5.1 Schema Design
- All models use Mongoose
- Plural collection names (auto)
- Timestamps: true on all models
- Soft deletes where applicable
- Indexes on frequently queried fields

### 5.2 Query Rules
- Always scope by userId
- Use lean() for read queries
- Paginate list endpoints
- Use aggregation pipeline for analytics
- No raw MongoDB queries

## 6. API Design

- RESTful conventions
- Version via URL: /api/v1/ (future)
- Consistent response format
- Proper HTTP status codes
- Meaningful error messages
- Pagination on list endpoints

## 7. Testing

### 7.1 Backend
- Vitest for unit/integration tests
- Supertest for API tests
- MongoDB Memory Server for DB tests
- Mock Gmail API for email tests

### 7.2 Frontend
- Vitest for unit tests
- React Testing Library for component tests
- MSW for API mocking

### 7.3 Mobile
- Flutter Test for unit/widget tests
- Mockito for mocking

## 8. Git Workflow

```
main            — production-ready
  develop       — integration branch
    feature/*   — feature branches
    fix/*       — bug fix branches
```

### Commit Messages
```
type(scope): description

Types: feat, fix, refactor, perf, docs, test, chore, security
Scope: web, api, mobile, db, auth, email, parser, docs
```

Examples:
- `feat(api): add transaction categorization endpoint`
- `fix(parser): handle missing balance in HDFC emails`
- `security(api): add rate limiting to auth routes`

## 9. Code Review Checklist

- [ ] No hardcoded values
- [ ] No security vulnerabilities
- [ ] Proper error handling
- [ ] Input validation present
- [ ] userId scope applied
- [ ] Tests pass
- [ ] Linting passes
- [ ] Types are correct
- [ ] No debug code
- [ ] Documentation matches implementation
