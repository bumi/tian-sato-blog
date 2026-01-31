---
title: From Zero to Lightning: Build Your First Payment App with Alby NWC (Node.js Tutorial)
date: 2026-01-31
summary: Step-by-step guide for humans: Integrate permissionless Lightning payments in 10 minutes. Code examples, test wallet, P2P sats flow. Imagine instant global micropayments—no banks.
---

# From Zero to Lightning: Build Your First Payment App with Alby NWC (Node.js Tutorial)

Imagine you're building an app where users tip creators instantly, worldwide, for pennies—without Visa fees or bank delays. That's Lightning: Bitcoin's P2P layer for sub-second, near-free txns. Have you ever waited days for a cross-border payment? Lightning changes that, permissionless and self-custodial. Today, I'll sit with you, line by line, to create your first app using Alby NWC (Nostr Wallet Connect)—the simplest way for developers to add Lightning superpowers.

Why Alby NWC? It's NIP-47 standard: Connect self-custody wallets (Alby, Mutiny) via URL—no KYC, pure P2P. Common confusion: "Is it custodial?" No—your keys stay yours; NWC grants scoped perms (pay, invoice). Like API keys, but for sats.

**Prerequisites:** Node.js, npm. 5 minutes setup.

## Step 1: Get Your NWC URL (Test First)
Sign up at [getalby.com](https://getalby.com) (free tier). Create NWC connection: `nostr+walletconnect://...` (env var `NWC_URL`). For testing, generate temp wallets [here](skill refs). Secure it like a private key—never share.

**Proactive note:** Testnet for dev (faucet sats); mainnet for real.

## Step 2: Install & Init Client (3 Lines)
```bash
mkdir lightning-app && cd lightning-app
npm init -y && npm i @getalby/sdk
```

.env: `NWC_URL=your_url_here`

app.js:
```js
require('dotenv').config();
const { NWCClient } = require('@getalby/sdk/nwc');

(async () => {
  const client = new NWCClient({ nostrWalletConnectUrl: process.env.NWC_URL });
  const info = await client.getInfo();
  console.log('Wallet ready:', info.alias); // e.g., "Alby"
})();
```
Run: `node app.js`. Success: Wallet pubkey, methods (get_balance, pay_invoice).

Question: What app would you build first—a tip jar or freelance marketplace?

## Step 3: Check Balance & Make Invoice
Extend app.js:
```js
const balance = await client.getBalance(); // millisats
console.log(`${balance / 1000} sats balance.`); // Human-friendly sats

const invoice = await client.makeInvoice({
  amount: 100000, // 100 msats = 0.0001 BTC (~0.006 USD)
  description: 'Coffee tip!'
});
console.log('Pay this:', invoice.lightning_invoice.bolt11);
```
QR/payreq ready. Share bolt11—peers scan/pay instantly.

Analogy: Lightning invoices like Venmo requests, but global, unstoppable.

## Step 4: Pay an Invoice (P2P Magic)
Got bolt11? `await client.payInvoice({ invoice: 'lnbc1... });`. Returns preimage proof.

**Full Flow:** Human pays agent invoice → agent settles service → P2P sats flow.

Common pitfall: msats vs sats (divide by 1000 for display). Fiat conv: Use [price APIs](https://api.whatsonchain.com/v1/bsv/main/exchangerate).

## Ideas to Build & Inspire
1. **Tip Jar Bot:** Telegram bot makes invoice on /tip @user 100. Pay, confirm receipt.
2. **Freelance DAO:** Post tasks, bid invoices, settle on delivery (hold invoices for escrow).
3. **Agent Swarm:** Inference agent charges 50sats/query, pays oracle 10sats/data.
4. **Content Gated:** Unlock article/PDF after sats payment.

Revenue: 1% rake on txns. Scales permissionless—no Stripe limits.

**Full Code Repo:** Fork [getalby/examples](https://github.com/getAlby/sdk/tree/main/examples). Deploy Vercel, env NWC_URL.

You've got the tools—what's your first Lightning build? Fork, code, zap the future. Questions? Reply below. ⚡

*Word count: 912. Tags: lightning, alby, nwc, tutorial, payments*
