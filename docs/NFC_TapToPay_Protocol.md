# Gencom Pay: Tap to Pay Protocol (Merchant Guide)

This document explains how to program physical NFC cards (Tags) to enable "Tap to Pay" functionality for your business.

## 1. Technical Requirements
- **Hardware**: NTAG213, NTAG215, or NTAG216 (ISO 14443A) blank NFC tags/cards.
- **Software**: Any standard NFC Writer app (e.g., "NFC Tools" on iOS/Android).

## 2. Programming the Card
To ensure your card works for both users who have the Gencom Pay app and those who don't, we use **Universal Links**.

### The NDEF Record
Program your card with a single **URI Record** using the following structure:

| Field | Value |
|-------|-------|
| Protocol | `https://` |
| URL | `pay.gencom.com/m/[YOUR_MERCHANT_ID]` |

> [!IMPORTANT]
> Replace `[YOUR_MERCHANT_ID]` with your unique Merchant Identifier found in your Merchant Dashboard.

## 3. How it Works
1. **The Tap**: A customer taps their smartphone against your physical card.
2. **The Handshake**:
   - **If they have Gencom Pay installed**: The app intercepts the link and instantly opens the "Pay [Business Name]" screen with your details pre-loaded.
   - **If they DON'T have the app**: The link opens their mobile browser to a secure Gencom Web Payment portal where they can complete the transaction.
3. **Completion**: Once the payment is confirmed, you receive an instant notification on your Merchant Dashboard.

## 4. Security Benefits
- **No Private Data**: The card only contains your public Merchant ID. No private keys or wallet balances are stored on the physical tag.
- **Tamper Proof**: You can "Lock" the NFC tag after programming to prevent others from changing the URL.

---
**Protocol Version**: 1.0.0 (Institutional Vault Standard)
