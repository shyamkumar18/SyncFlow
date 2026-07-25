# $yncFlow — Development Roadmap

## Milestone 1: Documentation ✅
- [x] PROJECT_SPEC.md
- [x] SRS.md
- [x] ARCHITECTURE.md
- [x] DATABASE_DESIGN.md
- [x] API_SPEC.md
- [x] SECURITY.md
- [x] UI_GUIDELINES.md
- [x] CODING_RULES.md
- [x] ROADMAP.md

## Milestone 2: Folder Structure
- Initialize backend (Node.js/Express)
- Initialize web (React/Vite/TypeScript)
- Initialize mobile (Flutter)
- Create .gitignore, .env.example
- Setup ESLint, Prettier
- Setup TailwindCSS
- Configure Vite

## Milestone 3: Database
- Setup MongoDB connection
- Create Mongoose models
- Create indexes
- Setup field-level encryption utility
- Seed default categories
- Test database connection

## Milestone 4: Backend
- Setup Express server
- Configure middleware (Helmet, CORS, rate-limit, error handler)
- Create auth routes
- Create transaction routes
- Create category routes
- Create wallet routes
- Create card routes
- Create bank routes
- Create budget routes
- Create goal routes
- Create notification routes
- Create settings routes
- Create analytics routes
- Setup health check endpoint
- Create CRUD controllers

## Milestone 5: Authentication
- Implement local registration/login
- Implement Google OAuth 2.0
- Implement JWT generation
- Implement refresh token rotation
- Implement password reset
- Auth middleware
- Login/Register pages (web)
- Auth state management

## Milestone 6: Email Sync
- Gmail API integration
- OAuth token management
- Email fetching service
- Email filtering (banking emails only)
- Bank detection engine
- Email categorization
- Mail Center UI (web)
- Sync progress indicator

## Milestone 7: Transaction Parser
- Parser engine architecture
- Bank-specific parsers (HDFC, ICICI, SBI, Axis, etc.)
- Amount/date/merchant extraction
- UPI/reference extraction
- Balance extraction
- Status detection
- Card type detection
- Normalization and storage
- Manual transaction entry

## Milestone 8: Dashboard
- Dashboard layout
- Income/Expense cards
- Cash flow chart
- Recent transactions list
- Notification feed
- Quick stats
- Dashboard API endpoint

## Milestone 9: Analytics
- Spending by category chart
- Spending by merchant chart
- Monthly trend chart
- Bank distribution
- Card spending analysis
- Budget tracking UI
- Goal tracking UI
- Reports module
- CSV/PDF export

## Milestone 10: Flutter
- Flutter project setup
- Material 3 theming
- Auth screens (Login, Register)
- Dashboard screen
- Transactions screen
- Mail Center screen
- Analytics screens
- Budgets screen
- Goals screen
- Settings screen
- Dark/Light mode
- Navigation setup

## Milestone 11: Testing
- Backend unit tests
- Backend integration tests
- Parser unit tests
- Gmail sync tests
- Auth tests
- Web component tests
- Flutter widget tests
- E2E tests (Cypress)
- Load testing

## Milestone 12: Deployment
- Cloudflare Workers configuration (web)
- Render/Railway configuration (backend)
- MongoDB Atlas setup
- Environment configuration
- Domain setup
- SSL certification
- CI/CD pipeline
- Monitoring setup
- Backup strategy

---

## Current Status

**Milestone 1: Documentation** — IN PROGRESS

Once approved, proceed to Milestone 2 (Folder Structure).

## Estimated Timeline

| Milestone | Effort | Dependencies |
|-----------|--------|-------------|
| M1: Documentation | 1 day | None |
| M2: Folder Structure | 1 day | M1 |
| M3: Database | 2 days | M2 |
| M4: Backend | 5 days | M3 |
| M5: Authentication | 3 days | M4 |
| M6: Email Sync | 5 days | M5 |
| M7: Transaction Parser | 5 days | M6 |
| M8: Dashboard | 3 days | M7 |
| M9: Analytics | 4 days | M8 |
| M10: Flutter | 7 days | M9 |
| M11: Testing | 4 days | M10 |
| M12: Deployment | 2 days | M11 |

**Total:** ~42 days
