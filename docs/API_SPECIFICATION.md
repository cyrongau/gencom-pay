# Gencom Pay API Specification

**Base URL**: `http://localhost:4000`
**Auth**: Bearer Token (JWT)

---

## 🔐 Authentication

### `POST /auth/register`
Create a new user account.
- **Body**: `{ email, password, fullName }`

### `POST /auth/login`
Authenticate and receive a JWT.
- **Body**: `{ email, password }`
- **Response**: `{ access_token, user }`

### `GET /auth/me`
Get current user profile.

---

## 💳 Wallets

### `GET /wallets`
List all wallets for the authenticated user.

### `POST /wallets`
Create a new wallet.
- **Body**: `{ currency: 'USD' | 'SLS' }`

### `GET /wallets/:id/balance`
Get the recomputed balance of a specific wallet.

### `POST /wallets/transfer`
Perform a p2p transfer.
- **Body**: `{ fromWalletId, toWalletId, amount, description, idempotencyKey? }`

---

## 🤝 Escrow

### `POST /escrows`
Initiate an escrow bridge.
- **Body**: `{ buyerWalletId, sellerWalletId, amount, currency, description }`

### `POST /escrows/:id/release`
Release funds from escrow to the seller.

### `POST /escrows/:id/refund`
Refund funds from escrow back to the buyer.

---

## 🆔 KYC & Identity

### `POST /kyc/analyze`
Extract data from an ID document using AI OCR.
- **Body**: `{ base64Image }`
- **Response**: `{ full_name, id_number, id_type, searchable_text }`

### `POST /kyc/submit`
Submit KYC details for verification.
- **Body**: `{ idNumber, idType, fullName, extractedData?, searchableText? }`

### `GET /kyc/status`
Check the status of the user's KYC verification.

---

## 💱 Exchange

### `GET /exchange/rates`
Get all active exchange rates.

### `GET /exchange/convert`
Convert an amount between currencies.
- **Query**: `amount, from, to`

---

## ⚙️ System Settings (Admin Only)

### `GET /kyc/settings`
Retrieve AI configuration (API Key, Model).

### `POST /kyc/settings`
Update AI configuration.
- **Body**: `{ apiKey, model }`
