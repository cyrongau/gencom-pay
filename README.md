# Gencom Pay - Unified Escrow Wallet & Exchange System

Gencom Pay is a high-integrity financial infrastructure platform built for Generex Communications. It enables secure cross-platform transfers, automated escrow management, and AI-powered identity verification.

## 🎯 Project Vision
The system acts as a "Financial Bridge" between different regional platforms (ZAAD, eDahab, Banks) and internal wallets, ensuring perfect accounting integrity through a double-entry ledger.

## 🏗️ Architecture
- **Modular Monolith**: Built with NestJS for a scalable and maintainable backend.
- **Double-Entry Ledger**: The source of truth for all balances. No floating balances.
- **ACID Transactions**: Every financial operation is atomic and consistent.
- **AI-Powered KYC**: Uses Open Router for OCR-based document analysis.

## 🛠️ Technology Stack
- **Backend**: NestJS, TypeORM, PostgreSQL, Redis.
- **Frontend**: Next.js 15+, Tailwind CSS 4, Axios.
- **Infrastructure**: Docker, Docker Compose.
- **AI**: Open Router (Gemini 2.0 / GPT-4o).

## 🚀 Getting Started

### Prerequisites
- Docker Desktop
- Node.js 20+

### 1. Setup Infrastructure
Clone the repository and run the containers:
```bash
docker compose up -d
```

### 2. Backend Setup
```bash
cd api
npm install
cp .env.example .env # Ensure DB credentials match docker-compose
npm run start:dev
```

### 3. Frontend Setup
```bash
cd web
npm install
npm run dev
```

## ✅ Phase 1 MVP Completion
- [x] **Core Ledger**: Double-entry system with balance recomputation.
- [x] **Wallet System**: USD and SLS support.
- [x] **Transaction State Machine**: Idempotency and atomicity.
- [x] **Escrow Bridge**: Secure funds locking/release for cross-platform transfers.
- [x] **AI KYC**: Automated document extraction via Open Router.
- [x] **Exchange Engine**: Basic SLS ↔ USD conversion.

## ⚖️ Financial Integrity
Run the integrity test suite to verify the ledger:
```bash
cd api
npx ts-node scripts/test-integrity.ts
```

## 🔒 Security
- JWT-based authentication with refresh tokens.
- Role-Based Access Control (RBAC) placeholders.
- Encrypted identity data storage.

---
© 2026 Generex Communications. All rights reserved.
