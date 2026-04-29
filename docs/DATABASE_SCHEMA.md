# Gencom Pay Database Schema

## 🏗️ Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ WALLETS : owns
    USERS ||--o| KYC_RECORDS : identifies
    WALLETS ||--o{ LEDGER_ENTRIES : referenced_in
    TRANSACTIONS ||--o{ LEDGER_ENTRIES : contains
    TRANSACTIONS ||--o| ESCROWS : secures
    
    USERS {
        uuid id PK
        string email UK
        string password
        string full_name
        enum status "PENDING_KYC, ACTIVE, SUSPENDED"
    }

    WALLETS {
        uuid id PK
        uuid user_id FK
        string currency "USD, SLS"
        enum status "ACTIVE, INACTIVE"
    }

    LEDGER_ENTRIES {
        uuid id PK
        uuid transaction_id FK
        uuid account_id FK "Wallet ID or System ID"
        enum entry_type "DEBIT, CREDIT"
        decimal amount
        string currency
        string reference
    }

    TRANSACTIONS {
        uuid id PK
        string idempotency_key UK
        string description
        enum status "INITIATED, COMPLETED, FAILED"
    }

    KYC_RECORDS {
        uuid id PK
        uuid user_id FK
        string id_number
        enum status "PENDING, APPROVED, REJECTED"
        jsonb extracted_data
        text searchable_text
    }

    ESCROWS {
        uuid id PK
        uuid buyer_wallet_id FK
        uuid seller_wallet_id FK
        decimal amount
        enum status "LOCKED, RELEASED, REFUNDED"
    }
```

## 💰 Ledger Integrity
The system implements **Double-Entry Accounting**. 
- Every financial event creates at least two `LEDGER_ENTRIES` sharing the same `TRANSACTION_ID`.
- The sum of `DEBIT` and `CREDIT` for any given `TRANSACTION_ID` must result in a net balance of zero.
- **Account Balances** are recomputed on-the-fly:
  `Balance = SUM(Credits) - SUM(Debits)`

## 🔐 System Accounts
Standardized UUIDs for system-level accounting:
- `00000000-0000-0000-0000-000000000001`: System Escrow Account
- `00000000-0000-0000-0000-000000000002`: System Cash Account (Liquidity)
