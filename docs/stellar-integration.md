# Stellar integration

This guide explains how the frontend talks to the SorobanLard Soroban contract, which environment variables control that, and how to run it against a contract you deployed yourself.

The integration lives in two files:

- `src/lib/stellar/contract.ts` builds, simulates, signs, submits, and polls contract calls (`enrollInCourse`, `registerCourseOnChain`).
- `src/lib/stellar/freighter.ts` wraps the [Freighter](https://freighter.app) wallet for connecting, reading the account and network, and signing.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values. `.env.local` is git-ignored, so keep real values out of commits. Next.js inlines `NEXT_PUBLIC_` variables at build time, so restart `npm run dev` after you change them.

| Variable | Required | What it controls |
|---|---|---|
| `NEXT_PUBLIC_STELLAR_NETWORK` | No (default `testnet`) | Picks the network passphrase. Only the exact value `mainnet` selects the public network. Any other value, including `Mainnet` or `public`, silently uses testnet. |
| `NEXT_PUBLIC_CONTRACT_ID` | Yes, for on-chain actions | The Soroban contract that `invokeContract` calls. It is a contract address: a 56-character strkey that starts with `C`. Without it, contract calls fail before they reach the network. |
| `NEXT_PUBLIC_STELLAR_RPC_URL` | Yes, for on-chain actions | The Soroban RPC endpoint used to simulate, submit, and poll transactions. It has no default in code. The client is created with `allowHttp: true`, so a plain `http://` URL works, for example a local RPC. |
| `NEXT_PUBLIC_USDC_ADDRESS` | Yes, to create priced courses | The token contract passed as `tokenAddress` to `register_course` (see `src/app/dashboard/courses/create/page.tsx`). It must be a token contract on the same network as the contract. |
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the backend API (`src/lib/api/client.ts`). Not used by the Stellar code. Defaults to `http://localhost:3000/api/v1`. |
| `NEXT_PUBLIC_SITE_URL` | No | Canonical URL for SEO metadata (`src/lib/seo.ts`). Defaults to `https://sorobanlard.com`. Not used by the Stellar code. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key (`src/lib/stripe/client.ts`). When unset, card payments are disabled. Not used by the Stellar code. |
| `NEXT_PUBLIC_PLATFORM_NAME` | No | Listed in `.env.example`, but no code in `src/` reads it at this commit. |
| `NEXT_PUBLIC_TWITTER_HANDLE` | No | Read by `src/lib/seo.ts` but missing from `.env.example`. It sets the Twitter handle in SEO metadata. |

## Network configuration

The network setting must agree in three places:

1. `NEXT_PUBLIC_STELLAR_NETWORK` chooses the passphrase that transactions are built and signed with.
2. The wallet. Freighter must be on the same network, or its signature will not match the transaction.
3. The contract and RPC. `NEXT_PUBLIC_CONTRACT_ID` and `NEXT_PUBLIC_STELLAR_RPC_URL` must point at the same network. A testnet contract ID does not exist on mainnet.

The code only knows two passphrases: `Networks.TESTNET` and `Networks.PUBLIC`. A standalone local network, such as the default Stellar Quickstart standalone network (`Standalone Network ; February 2017`), uses a different passphrase, so its transactions cannot be signed correctly by this code. Local development therefore means a contract deployed to testnet, as described below.

## Local development against a deployed `sorobanlard-contract`

The contract lives in the separate `sorobanlard-contract` repository. This repo does not contain its deployment steps, so follow that repository's README to deploy it to testnet.

1. Deploy `sorobanlard-contract` to testnet and note the contract ID it prints.
2. Create `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

   Then set these values:

   ```bash
   NEXT_PUBLIC_STELLAR_NETWORK=testnet
   NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
   NEXT_PUBLIC_CONTRACT_ID=<your deployed contract ID>
   NEXT_PUBLIC_USDC_ADDRESS=<token contract ID on testnet>
   ```

3. In Freighter, switch to Testnet and fund the account with [Friendbot](https://friendbot.stellar.org) (for example `https://friendbot.stellar.org?addr=<your G... address>`).
4. Start the app with `npm run dev` and open http://localhost:3001.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `Simulation: <reason>` | The contract rejected the call. Check that `NEXT_PUBLIC_CONTRACT_ID` is deployed on the network in `NEXT_PUBLIC_STELLAR_NETWORK`. |
| `Transaction not confirmed` | The transaction was still pending after about 40 seconds. Look it up by hash before retrying, because it may have succeeded. |
| `Transaction failed: <hash>` | The transaction was included but failed on-chain. Look up the hash on a Stellar block explorer for the failure reason. |
| The wallet rejects or fails to sign | Freighter is on a different network from `NEXT_PUBLIC_STELLAR_NETWORK`. |
| Contract calls fail immediately | `NEXT_PUBLIC_CONTRACT_ID` or `NEXT_PUBLIC_STELLAR_RPC_URL` is unset or malformed. |
