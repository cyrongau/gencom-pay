Project Title: Generex Exchange
Project Description: Generex Communications Unified Escrow Wallet & Exchange System
1. 🎯 Core Engineering Mandate

You are building a financial infrastructure system, not a standard application.

All engineering decisions MUST prioritize:

Accuracy over speed
Consistency over convenience
Auditability over simplicity

Zero tolerance for:

Floating balances
Untracked transactions
Silent failures
2. 🏗️ System Architecture Standard
2.1 Architecture Style
Start as Modular Monolith
Strict module boundaries
Each module must be independently testable
2.2 Core Modules (MANDATORY)
Auth Module
User/KYC Module
Wallet Module
Ledger Module (CRITICAL)
Transaction Module
Escrow Module
Exchange Module
Integration Module (Telco/Bank/Crypto APIs)
Notification Module
Admin/Monitoring Module
3. 💰 Ledger System (NON-NEGOTIABLE)

This is the heart of the system.

3.1 Ledger Rules
Implement double-entry accounting
Every transaction must have:
Debit entry
Credit entry
Total debits MUST equal total credits
3.2 Ledger Structure

Each entry must include:

transaction_id
account_id
entry_type (DEBIT / CREDIT)
amount
currency (USD, SLS, BTC)
reference (escrow, transfer, exchange)
timestamp
status (pending, completed, reversed)
3.3 Balance Calculation
DO NOT store final balances as source of truth
Balance = SUM(credits - debits)
Cached balances allowed via Redis but must be recomputable
4. 🔄 Transaction Processing Protocol
4.1 Atomicity

All financial operations MUST:

Run inside database transactions (ACID via PostgreSQL)
Either fully complete or fully rollback
4.2 Idempotency

Every transaction endpoint must:

Accept idempotency keys
Prevent duplicate processing
4.3 State Machine

Each transaction must follow strict states:

INITIATED
PENDING
PROCESSING
COMPLETED
FAILED
REVERSED
5. 💱 Exchange Engine Protocol
5.1 Rate Handling
Fetch external rates via Integration Module
Cache short-term in Redis
Always timestamp rates
5.2 Conversion Logic

For every exchange:

Input amount
Exchange rate
Platform fee
Final receivable

Must be:

Transparent to user
Logged immutably
5.3 Internal Accounting

Exchange must:

Debit source wallet
Credit destination wallet
Record platform fee separately
6. 🔐 Escrow System Protocol
6.1 Escrow Flow
Buyer funds escrow → funds moved to escrow account
Funds locked (not spendable)
Release triggers transfer to seller
Dispute triggers hold + admin intervention
6.2 Escrow Ledger Handling
Escrow is NOT metadata
It is a real ledger account
7. 🔌 Integration Protocol
7.1 External APIs (Telco, Banks, Crypto)
Wrap all external APIs inside Integration Module
NEVER call external APIs directly from business logic
7.2 Retry Logic
Implement exponential backoff
Handle:
Timeouts
Partial failures
Duplicate callbacks
7.3 Webhooks
All inbound events must:
Be verified (signature validation)
Be idempotent
8. 📡 Backend Stack Enforcement
Backend Framework
NestJS
Use:
Controllers
Services
Repositories
DTO validation
Database
PostgreSQL
Use:
Strong constraints
Foreign keys
Transactions
Cache Layer
Redis
9. 📱 Frontend Engineering Protocol
Mobile App
Built using Flutter
Enforce:
Clean architecture (data/domain/presentation)
Offline-safe UI states
Secure storage for tokens
Web App
Built using Next.js
Focus:
Admin dashboards
Merchant tools
API management
10. 🔐 Security Protocol
Authentication
JWT (short-lived)
Refresh tokens
Device/session tracking
Authorization
Role-Based Access Control (RBAC)
Sensitive Data
Encrypt at rest
Mask sensitive fields (cards, IDs)
Transactions
Require:
PIN or biometric confirmation
Step-up authentication for large amounts
11. 🧾 Compliance & Auditability
Required Logs
All financial actions
All login attempts
All admin actions
KYC
Store:
Identity data
Verification status
Must be extendable
Audit Trail
Immutable logs
No deletions—only reversals
12. ⚙️ DevOps & Deployment Protocol
Infrastructure
Use Amazon Web Services or Google Cloud Platform
Containerization
Docker required
CI/CD
Automated:
Testing
Linting
Deployment
Environments
Dev
Staging
Production

Strict separation required

13. 📊 Monitoring & Reliability
Use Prometheus + Grafana

Track:

Transaction success rate
API latency
Error rates
14. 🧪 Testing Protocol
Mandatory Tests
Unit tests (services, logic)
Integration tests (API + DB)
Financial reconciliation tests
Critical Rule

Every financial function must have:

At least 2 test scenarios:
Success case
Failure/rollback case
15. 🚫 Anti-Patterns (STRICTLY FORBIDDEN)
❌ Storing balances without ledger backing
❌ Skipping transaction wrapping
❌ Direct external API calls from controllers
❌ Silent error handling
❌ Mixing currencies without explicit conversion
16. 🚀 MVP Scope Control (IMPORTANT)

The AI agent MUST prioritize:

Phase 1 (MVP)
Wallet system (USD + SLS)
Cross-platform transfer abstraction
Escrow system
Basic exchange (SLS ↔ USD)
Phase 2
Crypto integration
Virtual cards
Merchant APIs
17. 🧠 Final Engineering Principle

If something goes wrong, the system must be able to answer:

What happened?
When did it happen?
Who initiated it?
Where did the money go?

If you can’t answer those 4 questions instantly, the system is not ready.

Closing Direction

Don’t rush to “see it working.”

In fintech, a system that looks like it works but has weak accounting is worse than no system at all.