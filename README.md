<div align="center">

<img src="./public/veil-logo.svg" width="120" alt="Veil Protocol" />

# VEIL PROTOCOL

**Zero-Knowledge Privacy Layer for Uniswap v4 on Robinhood Chain**

*Trade in the open. Hold in the veil.*

🔄 **Trade:** [`/trade`](app/trade/page.tsx) · 📜 **Contracts:** [`/contracts`](app/contracts/page.tsx) · 🔥 **Burn:** [`/burn`](app/burn/page.tsx) · 📊 **Status:** [`/status`](app/status/page.tsx) · 📖 **Brief:** [`DevBrief-Veil.md`](DevBrief-Veil.md) · 🗳️ **Decisions:** [`docs/DECISIONS.md`](docs/DECISIONS.md)

*Private swaps on Uniswap v4. Zero-knowledge hooks + shielded pools on Robinhood Chain. Every value movement goes through audited Groth16 proofs — no Mock, no dummies.*

[![Chains](https://img.shields.io/badge/Chains-Robinhood%204663%20·%20Testnet%2046630-CCFF00?style=flat-square&labelColor=0A081E&logoColor=black)](#-live-robinhood-mainnet-deployments-chain-id-4663)
[![Runtime](https://img.shields.io/badge/Runtime-Next.js%2016%20·%20React%2019%20·%20TypeScript-7C3AED?style=flat-square&labelColor=0A081E)](#-tech-stack)
[![Privacy](https://img.shields.io/badge/Privacy-Groth16%20·%200xbow%20v1.2.1%20·%20Poseidon-D4AF37?style=flat-square&labelColor=0A081E)](#-core-value-proposition)
[![AMM Engine](https://img.shields.io/badge/AMM%20Engine-Uniswap%20V4%20Hook%20·%2030bps%20(70%25%20Burn)-10B981?style=flat-square&labelColor=0A081E)](#-protocol--settlement-architecture)
[![Tests](https://img.shields.io/badge/Tests-Vitest%20·%20Passing-10B981?style=flat-square&labelColor=0A081E)](#-testing--verification)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square&labelColor=0A081E)](#-license)

</div>

---

## ⚡ Overview

**Veil** brings zero-knowledge privacy directly to Uniswap v4 swaps on Robinhood Chain (Testnet 46630 → Mainnet 4663):

1. **Swap-to-Shield (Priority 1):** Buy any token on Uniswap v4 and enter the shielded pool in a single atomic transaction. Router maintains a strict invariant of 0 held balance.
2. **Shielded Swap (Priority 3):** Exchange between shielded token pools without leaving any public wallet trace on-chain — single, multi-note, or direct-payout mode.
3. **ZK-Gated Pools (Priority 2):** Uniswap v4 `beforeSwap` hook restricts swaps to addresses with valid ZK attestations (anti-bot launch windows, clean funds verification).
4. **Protocol Fee Hook (Priority 2):** Collects 30 bps per swap routed to `VeilTreasury` — 70% funds autonomous on-chain buyback & burns of the Veil token (reducing `totalSupply` via `burn()`).

---

## 🏛️ Core Value Proposition

* **Fixed-Denomination Privacy Chips:** Every shielded note is exactly `0.001` (the audited 0xbow `DEPOSIT_DENOMINATION`) — like identical casino chips. Uniform notes cannot be fingerprinted by amount; that rigidity is the source of the privacy.
* **B1 Atomicity, Not Proof Re-Checks:** `VeilZkRouter` delegates proof verification to the audited 0xbow `Entrypoint` and enforces relay → swap → deposit in **one atomic transaction** (transient stage guard + invariant-0 + events). `minOut`/slippage applies to the post-swap leg only.
* **Open Attestation & Open Association Set:** `selfAttest` is permissionless (no eligibility); every label ever deposited plus a genesis sentinel joins the ASP automatically via open tooling. No human allow/deny, no sunset, owner keeps control (binding decisions 1–4).
* **Autonomous 30/70 Flywheel:** 30 bps hook fee → treasury → 70% buyback & burn, 30% operations. Burns call `burn()` (supply shrinks), never dead-address theater.
* **Self-Relay Is The Path:** No hosted relayer through F5; the UI self-relay flow is the official route (proven live). Relayers cannot alter recipients, fees, or `minOut` — everything is proof-bound or caller-side.
* **Honest Dust Handling:** Below-denomination outputs settle visibly to the wallet (`direct-payout`, labeled "visible onchain") instead of stranding funds. Unlinking still comes from the shielded source note.

---

## 🔬 Protocol & Settlement Architecture

```mermaid
flowchart LR
    subgraph Shield["🛡️ Shield (deposit)"]
        User([User Wallet]) -->|0.001 ETH / VEIL| EP[0xbow Entrypoint<br/>deposit]
        EP --> PoolB[(0xbow Pool<br/>commitment in tree)]
        PoolB --> Note[📝 Shielded Note<br/>secret + nullifier<br/>client-side only]
    end

    subgraph ZKFlow["⚡ Full-ZK Flow (VeilZkRouter, 1 atomic tx)"]
        Note -->|Groth16 proof| Relay[1. Relay exit<br/>to router]
        Relay --> Swap[2. v4 Swap<br/>exact-input]
        Swap -->|≥ 0.001| Dep[3a. Shielded note<br/>single / multi]
        Swap -->|< 0.001| Direct[3b. Direct payout<br/>visible onchain]
    end

    subgraph Gate["🚪 ZK-Gated Pools"]
        User -->|selfAttest| Reg[VeilAttestationRegistry<br/>permissionless]
        Reg --> Hook[VeilHook 0x20C4<br/>beforeSwap gate + 30bps fee]
        Hook -->|fee| Treasury[VeilTreasury<br/>70% burn]
    end

    subgraph Tele[📊 Transparency]
        Treasury --> BurnPage[/burn live ledger]
        PoolB --> ContractsPage[/contracts reads chain]
    end
```

### End-to-End Pipeline Stages

1. **Stage 1 — Shield:** Deposit exactly `0.001` ETH/VEIL via the 0xbow `Entrypoint`. The commitment enters the Merkle tree; the note (secret + nullifier) lives only in the browser vault (encrypted backup mandatory).
2. **Stage 2 — Full-ZK Swap (`VeilZkRouter`, one atomic tx):** Prove note ownership (Groth16, minutes in-browser) → relay exit lands in the router → exact-input v4 swap → output ≥ `0.001` becomes a new shielded note (**single**), N notes batch into one swap + one note (**multi**, cap 8), dust pays out visibly (**direct**). Any leg failing reverts everything; dust above the note value refunds instantly.
3. **Stage 3 — Withdraw:** Prove + relay to any clean address. Withdrawals can never be paused or blocked by anyone, by code.
4. **Stage 4 — Attest & Gated Execution:** `selfAttest` (EIP-191, nonce + deadline, no owner involved) unlocks gated-window swaps; drift guard re-validates wallet before every send.
5. **Stage 5 — Fee Flywheel:** Hook takes 30 bps → treasury → 70% `burn()` + 30% ops, all readable live on `/burn` and `/contracts`.

---

## 🔀 Flow Modes

| Feature | Single-Note | Multi-Note (cap 8) | Direct-Payout |
|---|---|---|---|
| **When** | Swap output clears `0.001` | One note can't, N notes can (fixed-denom market) | Output below any denomination (dust) |
| **On-chain shape** | 1 relay + 1 swap + 1 note | N relays + 1 swap + 1 note + dust refund | 1 relay + 1 swap + wallet payout |
| **Privacy grade** | Fully shielded both ends | Fully shielded both ends | Shielded source, visible destination (labeled honestly) |
| **Proven live** | `0x118e…` (UI, testnet) | `0xe14f…` (0.003 → 0.9287, testnet) | `0xfac7…` + `0x9a8a…` (testnet) |

---

## 🖥️ Platform Interfaces

### 1. Shielded Trading Desk (`/trade`)
- **Shield Tab** (`BuyAndShieldPanel.tsx`) — Deposit `0.001` ETH/VEIL → Groth16 note → encrypted vault backup.
- **Shielded Swap Tab** (`ZkShieldedSwapPanel.tsx`) — Live quote (free simulations, 25-probe bracketing) → single/multi/direct auto-select → one-approval execute → receipt + event asserts.
- **Withdraw Tab** (`WithdrawPanel.tsx`) — Prove & relay any note; pre-send spent-check and ASP-freshness gate fail closed without burning gas.
- **Vault Tab** (`VaultPanel.tsx`) — Backup/restore (PBKDF2 + AES-256-GCM), per-note remove with confirm modal.
- **Attest Panel** (`AttestPanel.tsx`) — One-tx `selfAttest` for gated windows.

### 2. Transparency Pages
- **`/contracts`** — Reads live chain state (no hardcoded claims). **`/burn`** — Treasury + burn ledger from chain. **`/status`** — Suite health. **`/terms` & `/privacy`** — Live legal pages (external audit + legal review permanently waived per decisions 6/11; terminology guardrails enforced).

---

## 📁 Repository Structure

```text
veil/
├── app/                           # Next.js 16 App Router pages & API routes
│   ├── api/
│   │   ├── asp/sync/              # ASP auto-sync (testnet + mainnet 4663, policy v2)
│   │   └── rpc/                   # Anti-censorship high-availability RPC proxy
│   ├── burn/ contracts/ status/   # Chain-reading transparency pages
│   ├── terms/ privacy/            # Live legal pages
│   ├── trade/                     # Shielded trading desk (4283-line page + hooks)
│   └── layout.tsx page.tsx globals.css
├── components/
│   ├── trade/                     # BuyAndShield, ZkShieldedSwap, Withdraw, Vault, Attest panels
│   ├── landing/                   # Marketing site (sanitized claims, authentic 0xbow brand)
│   └── ui/                        # Reusable atom components
├── contracts/                     # Solidity 0.8.37 (Cancun, viaIR)
│   ├── VeilZkRouter.sol           # Atomic relay→swap→deposit/direct (single+multi+direct)
│   ├── VeilShieldRouter.sol       # Legacy 1-tx Swap-to-Shield (R1 native-settle fix)
│   ├── ShieldedPool.sol           # Fixed-denomination pool, withdrawals never pausable
│   ├── VeilHook.sol               # Gating (0x20C4) + 30 bps fee hook
│   ├── VeilAttestationRegistry.sol# Permissionless selfAttest registry
│   ├── VeilTreasury.sol           # Fee accumulator + burn engine (70% default)
│   ├── VeilToken.sol              # Temporary fixed-supply token (Pons launches canonical)
│   └── VeilCreate2Deployer.sol    # Deterministic hook mining
├── lib/                           # Domain libraries (23 files)
│   ├── zk-router.ts               # Full-ZK builders, bracketing quotes, pre-send sequence
│   ├── 0xbow-client.ts            # SDK wrapper: state tree, ASP set, proving
│   ├── privacy-pools.ts           # Testnet + mainnet suite address books
│   ├── router-swap.ts             # Legacy router quotes, pool keys, price limits
│   ├── note.ts wallets.ts         # Vault notes, drift-guard revalidation
│   └── veil-artifact.ts/.mjs      # Compiled ABI + bytecode (incl. VeilZkRouter)
├── scripts/                       # Operational tooling (60+ scripts)
│   ├── migrate-mainnet-0xbow.mjs  # Full-fresh mainnet migration (dry-run + checkpoint resume)
│   ├── publish-asp.mjs            # Mechanical ASP publisher (CHAIN=46630|4663)
│   ├── verify-pool-invariant.mjs  # Live gate: deposits − withdrawn = balance
│   ├── preflight-mainnet.mjs      # Chain, deps, balance, hook-mining checks
│   ├── multi-exec-zk.mjs          # Script-path multi-note executor (proven live)
│   └── compile.mjs                # solc build + artifact regen
├── tests/                         # Vitest suite (34 files, all green)
├── docs/                          # Binding docs (see Docs Index below)
│   ├── DECISIONS.md               # 19 binding owner decisions + B1 ruling
│   ├── ASP-POLICY.md              # Association-set policy (v2: testnet + mainnet)
│   ├── MAINNET_RUNBOOK.md         # F5 runbook: migrate → proof → gates → rollback
│   ├── MAINNET-DEPLOYMENT-2026-10-12.md # Deployment record (addresses + evidence)
│   ├── INTERNAL-AUDIT-2026-10-07.md     # PASS WITH CONDITIONS + FINAL declaration
│   ├── TESTNET-CLICKTHROUGH.md    # Manual browser test script
│   └── superpowers/               # Specs & plans (real-onchain, full-ZK router)
├── deployments/                   # Manifests (machine truth, incl. mainnet-latest)
├── vendor/                        # 0xbow-privacy-pools-core-v1.2.1 (AUDITED — OFF-LIMITS)
└── public/shield-artifacts/       # Pinned Groth16 wasm/zkey/vkey (hash-checked)
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16.3.4 (App Router) + React 19.2.8 + TypeScript 5.x
- **Styling:** Tailwind CSS v4 + Three.js + GSAP
- **Web3 EVM Client:** Viem 2.x (engineered for Robinhood Chain 4663/46630 + Groth16 flows)
- **AMM Infrastructure:** Uniswap V4 Core (`@uniswap/v4-core` 1.0.2) + Periphery (`@uniswap/v4-periphery` 1.0.3)
- **ZK Stack:** 0xbow Privacy Pools core v1.2.1 (audited) — Groth16 + Poseidon + LeanIMT, snarkjs WASM proving in-browser
- **Smart Contracts:** Solidity `0.8.37` (Cancun, viaIR) compiled via native `solc`
- **Testing:** Vitest 4.1.x (34 files, 204 tests, all green)

---

## 🚀 Quickstart & Local Development

### Prerequisites

- **Node.js**: `v20.x` or later · **Package Manager**: `pnpm`

### 0. Try it on testnet (no real funds)

```bash
pnpm dev:testnet
```

Runs the whole app against Robinhood Testnet 46630 (`NEXT_PUBLIC_CHAIN_ID=46630`). Fund your wallet at `https://faucet.testnet.chain.robinhood.com/` (0.01 testnet ETH, free). Default `pnpm dev` targets mainnet 4663.

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Compile Smart Contracts

Compiles Solidity 0.8.37 contracts with the Cancun EVM version, verifies EIP-170 code size, and outputs TypeScript / ESM artifacts:

```bash
pnpm compile
```

### 3. Mine Uniswap v4 Hook Address (CREATE2)

Mines salt matching `0x20C4` permission flags:

```bash
pnpm mine:hook
```

### 4. Deploy Mainnet (fresh suite, checkpoint resume)

```bash
pnpm migrate:mainnet:dry   # validation only, zero gas
pnpm migrate:mainnet       # executes once deployer holds >= 0.0015 ETH
```

Deploys on 4663: PoseidonT3/T4 → verifiers → entrypoint proxy → ETH + VEIL pools → ASP sentinel → treasury/create2/Mock/legacy pool → registry + hook v2 → shield router + VEIL pools → **VeilZkRouter**. Writes `deployments/privacy-pools-mainnet-latest.json` + env. See [`docs/MAINNET_RUNBOOK.md`](docs/MAINNET_RUNBOOK.md).

### 5. Run Test Suite

```bash
pnpm test
```

### 6. Typecheck & Build

```bash
npx tsc --noEmit
pnpm build
```

---

## 📜 Smart Contracts & Verification

Veil contracts are built for auditability: peripheral routers (never custody), invariant-0 on every exit, `nonReentrant` throughout, withdrawals unblockable by code.

* **`VeilZkRouter.sol`:** Atomic relay → swap → deposit/direct executor. Proof verification delegated to the 0xbow `Entrypoint`; router enforces atomicity (transient stage machine), `minOut` on the post-swap leg only, dust refunds, `MAX_MULTI_WITHDRAWALS=8`.
* **`VeilShieldRouter.sol`:** Legacy 1-tx Swap-to-Shield + ShieldedSwap (R1 `PoolManager.settle{value}` fix). Provisional paths are exit-only.
* **`ShieldedPool.sol`:** Fixed-denomination pool (`TREE_DEPTH=20`, `ROOT_HISTORY=100`). Guardian pauses deposits only — withdrawals can never be blocked.
* **`VeilHook.sol`:** Permission-encoded hook (`0x20C4`: beforeInitialize/beforeSwap/afterSwap/afterSwapReturnDelta). ZK-gated launch windows + 30 bps fee via `poolManager.take()`.
* **`VeilAttestationRegistry.sol`:** Permissionless `selfAttest` (EIP-191, nonce + deadline). No owner, no attester involved.
* **`VeilTreasury.sol`:** Fee accumulator; `executeBurn` is permissionless, `rescue` is owner-only, buyback default 70%.
* **0xbow core (vendored, audited):** `Entrypoint` (UUPS proxy, owner + postman), ETH/VEIL pools (`0.001` fixed both sides), Groth16 verifiers, Poseidon, LeanIMT. Never modified.

## 🌐 Live Robinhood Mainnet Deployments (Chain ID: 4663)

**LIVE since 2026-10-12** via `pnpm migrate:mainnet` (exit 0, ~0.0005 ETH gas, zero reverts). Full record: [`docs/MAINNET-DEPLOYMENT-2026-10-12.md`](docs/MAINNET-DEPLOYMENT-2026-10-12.md). Invariant 5/5 PASS post-deploy.

| Contract | Address | Blockscout Explorer |
|---|---|---|
| **0xbow Entrypoint (proxy)** | `0x96cb8b1836d341a6f5f1f54428bd6696c8b950b1` | [View on Explorer](https://explorer.mainnet.chain.robinhood.com/address/0x96cb8b1836d341a6f5f1f54428bd6696c8b950b1) |
| **0xbow ETH Pool** | `0x10c17b7538e13c63b890fea52708846e88bb1932` | [View on Explorer](https://explorer.mainnet.chain.robinhood.com/address/0x10c17b7538e13c63b890fea52708846e88bb1932) |
| **0xbow VEIL Pool** | `0xdb9f182670da2cc6c5ddd432ec98a45e4f2290d1` | [View on Explorer](https://explorer.mainnet.chain.robinhood.com/address/0xdb9f182670da2cc6c5ddd432ec98a45e4f2290d1) |
| **VeilTreasury** (owner + temp VEIL, 70% burn) | `0xb68c3d25e5e9902363e8e10d5c0a471e65be8152` | [View on Explorer](https://explorer.mainnet.chain.robinhood.com/address/0xb68c3d25e5e9902363e8e10d5c0a471e65be8152) |
| **VeilAttestationRegistry v2** | `0xd1f17c70067f1cc2b478606b3f0faa18ee8add1d` | [View on Explorer](https://explorer.mainnet.chain.robinhood.com/address/0xd1f17c70067f1cc2b478606b3f0faa18ee8add1d) |
| **VeilHook v2 (0x20c4)** | `0xf95f041462ee34c2ea7b953a879838133ef820c4` | [View on Explorer](https://explorer.mainnet.chain.robinhood.com/address/0xf95f041462ee34c2ea7b953a879838133ef820c4) |
| **VeilShieldRouter (fixed R1)** | `0x3db4ae3429f1507aa0cd31c740a0fd276e22a55c` | [View on Explorer](https://explorer.mainnet.chain.robinhood.com/address/0x3db4ae3429f1507aa0cd31c740a0fd276e22a55c) |
| **ShieldedPool VEIL 0.5** | `0x493f64d4163fe1f966c423f9338cd955e80a99df` | [View on Explorer](https://explorer.mainnet.chain.robinhood.com/address/0x493f64d4163fe1f966c423f9338cd955e80a99df) |
| **ShieldedPool VEIL 2** | `0x3783db43f4f08294da847c66a0fb7203bb3e005d` | [View on Explorer](https://explorer.mainnet.chain.robinhood.com/address/0x3783db43f4f08294da847c66a0fb7203bb3e005d) |
| **VeilZkRouter (single+multi+direct)** | `0x0fb48c9552154ea028cbd812430e1ea3465a9b4c` | [View on Explorer](https://explorer.mainnet.chain.robinhood.com/address/0x0fb48c9552154ea028cbd812430e1ea3465a9b4c) |
| **Legacy ETH Pool (0.001/10, open)** | `0x15f7e378410719438dd20b12d4c440ba1863e892` | [View on Explorer](https://explorer.mainnet.chain.robinhood.com/address/0x15f7e378410719438dd20b12d4c440ba1863e892) |

> Note: some addresses are byte-identical to testnet ones (CREATE collision — same deployer, same nonces). Harmless: read-backs prove correct code on 4663. Abandoned old suite (Mock `0x797e…`, pool `0xdd0f…` paused, buggy router `0x01a0…`) stays untouched. Post-deploy order: proof cycle → invariant re-run → Blockscout verification → UI ZK wiring.

### 🔥 Mainnet Burn Loop Proven (2026-10-06, deployer-owned suite)

- **VeilToken deploy:** [`0x39bce42f32f8424bad6438428c7bbecfd5e7c7e81a432f8bc70dd85a608f022d`](https://explorer.mainnet.chain.robinhood.com/tx/0x39bce42f32f8424bad6438428c7bbecfd5e7c7e81a432f8bc70dd85a608f022d)
- **setVeilToken:** [`0x56666c722a150a644648c569d9799b6ad63b244a4ff7b03e905af9bba0b291a2`](https://explorer.mainnet.chain.robinhood.com/tx/0x56666c722a150a644648c569d9799b6ad63b244a4ff7b03e905af9bba0b291a2)
- **Treasury fund (10,000 VEIL):** [`0x5bffe13c453a557779b4dca7465c5883cf50f4f35c43b460c064a5975ffb219c`](https://explorer.mainnet.chain.robinhood.com/tx/0x5bffe13c453a557779b4dca7465c5883cf50f4f35c43b460c064a5975ffb219c)
- **executeBurn (1,000 VEIL):** [`0xf52bdda4f6d17ac7ce5915a3846535f595dd0bdd02aaced7f2841ada5af994dc`](https://explorer.mainnet.chain.robinhood.com/tx/0xf52bdda4f6d17ac7ce5915a3846535f595dd0bdd02aaced7f2841ada5af994dc)
- Supply 1,000,000,000 → 999,999,000, `totalBurned` = 1,000, `buybackShareBps` = 7000.

## 🧪 Live Robinhood Testnet Deployments (Chain ID: 46630)

Fresh suite under the new wallet (old pools retired — exit-only, withdrawals stay open by code; no new deposits there):

| Contract | Address | Blockscout Explorer |
|---|---|---|
| **VeilCreate2Deployer** | `0x25ed04b42071086c3a8647954422c9c958e35f3e` | [View on Explorer](https://explorer.testnet.chain.robinhood.com/address/0x25ed04b42071086c3a8647954422c9c958e35f3e) |
| **ShieldedVerifierMock** | `0xab9dd89a3b16db81140d6a5842a439de6f4969b6` | [View on Explorer](https://explorer.testnet.chain.robinhood.com/address/0xab9dd89a3b16db81140d6a5842a439de6f4969b6) |
| **ShieldedPool_ETH (fresh)** | `0x3783db43f4f08294da847c66a0fb7203bb3e005d` | [View on Explorer](https://explorer.testnet.chain.robinhood.com/address/0x3783db43f4f08294da847c66a0fb7203bb3e005d) |
| **ShieldedPool_VEIL05 (fresh)** | `0x0fb48c9552154ea028cbd812430e1ea3465a9b4c` | [View on Explorer](https://explorer.testnet.chain.robinhood.com/address/0x0fb48c9552154ea028cbd812430e1ea3465a9b4c) |
| **ShieldedPool_VEIL2 (fresh)** | `0xc144f744f887ebf5746a9974673d626f22431f3b` | [View on Explorer](https://explorer.testnet.chain.robinhood.com/address/0xc144f744f887ebf5746a9974673d626f22431f3b) |
| **0xbow Entrypoint v3 (fresh)** | `0xb68c3d25e5e9902363e8e10d5c0a471e65be8152` | [View on Explorer](https://explorer.testnet.chain.robinhood.com/address/0xb68c3d25e5e9902363e8e10d5c0a471e65be8152) |
| **0xbow ETH Pool v3 (fresh)** | `0xea48e6a7ae296ebbd7d58792091b8087032d3aa4` | [View on Explorer](https://explorer.testnet.chain.robinhood.com/address/0xea48e6a7ae296ebbd7d58792091b8087032d3aa4) |
| **0xbow VEIL Pool v3 (fresh)** | `0xae2c219e462ca1b80473375bcbcad2b025cae610` | [View on Explorer](https://explorer.testnet.chain.robinhood.com/address/0xae2c219e462ca1b80473375bcbcad2b025cae610) |
| **VeilTreasury** | `0x491413119a4adb0ea23b902c7fc7cee3845542b2` | [View on Explorer](https://explorer.testnet.chain.robinhood.com/address/0x491413119a4adb0ea23b902c7fc7cee3845542b2) |
| **VeilAttestationRegistry** | `0x4d66540c3cd12ee8de89ad8013c51838b572dce3` | [View on Explorer](https://explorer.testnet.chain.robinhood.com/address/0x4d66540c3cd12ee8de89ad8013c51838b572dce3) |
| **VeilHook (0x20c4)** | `0xc0bd5e335651394b57a9277411f65e149e73e0c4` | [View on Explorer](https://explorer.testnet.chain.robinhood.com/address/0xc0bd5e335651394b57a9277411f65e149e73e0c4) |
| **VeilShieldRouter (fixed R1)** | `0x7c73e4b7f9c9cac1f1574c46fd17952be2853e27` | [View on Explorer](https://explorer.testnet.chain.robinhood.com/address/0x7c73e4b7f9c9cac1f1574c46fd17952be2853e27) |
| **VeilZkRouter (unified)** | `0x9ccf3800cb6aa5754ec9ec5815e06f432df10635` | [View on Explorer](https://explorer.testnet.chain.robinhood.com/address/0x9ccf3800cb6aa5754ec9ec5815e06f432df10635) |

> Retired pools (paused + guardian renounced, exit-only — old notes withdraw here, no new deposits): legacy ETH `0x1b1d39e4da649747ecc0e93e7a06452a3061de17`, VEIL05 `0xd73920a3cbfdf3f6be530cab73fc9c876619517a`, VEIL2 `0x172e9cc542cf9349813f74548eec6e0a1df65e17`; 0xbow v1 pool `0x2bea7094f77e3f9a21397c688de8ef105d4848bc`.

### 🚀 Verified On-Chain Transactions (Live Testnet E2E)

- **Live Deposit (0.001 ETH):** [`0x5b230bdbbc99cbd9c3fdb7ef5a8284d724fbc92e72f07ccaf38736cfa93ad467`](https://explorer.testnet.chain.robinhood.com/tx/0x5b230bdbbc99cbd9c3fdb7ef5a8284d724fbc92e72f07ccaf38736cfa93ad467)
- **Live ZK Withdrawal:** [`0xe2fc81edc64eeab55c8837e93637b8cc36334ad1a885534e2ba4d658b0b26f4e`](https://explorer.testnet.chain.robinhood.com/tx/0xe2fc81edc64eeab55c8837e93637b8cc36334ad1a885534e2ba4d658b0b26f4e)
- **Attestation Registry Proof:** [`0xefb9475ce25739dfbb4270424ef4605fec30bc95676bbe96d3a0726facd18ccc`](https://explorer.testnet.chain.robinhood.com/tx/0xefb9475ce25739dfbb4270424ef4605fec30bc95676bbe96d3a0726facd18ccc)
- **Multi-note full-ZK (0.003 → 0.9287 VEIL):** [`0xe14f90b0de62c04e7577bd6bbd0dcba49a03af014bda5782362ea99a2bcafcb2`](https://explorer.testnet.chain.robinhood.com/tx/0xe14f90b0de62c04e7577bd6bbd0dcba49a03af014bda5782362ea99a2bcafcb2)
- **Single-note full-ZK (UI):** [`0x118ec934853460276ef5a8ab0a32864fa3a2f057dad4fe8b475b27baf0fdfd5c`](https://explorer.testnet.chain.robinhood.com/tx/0x118ec934853460276ef5a8ab0a32864fa3a2f057dad4fe8b475b27baf0fdfd5c)
- **Browser withdraw (first):** [`0x5e95188e…`](https://explorer.testnet.chain.robinhood.com/) (block 132021568)
- **Direct-payout ETH→VEIL (1.12 VEIL):** `0xfac73f43b2bd918a6d20ca3bf997a4ce52866bd1f980f0f719b14c9b4e880236`
- **Direct-payout VEIL dust → ETH:** `0x9a8ac2e40648eb98377f14b0a76446efd99c3ad29bb8d84ec30fd95da8e51879`

### 🪙 Temporary VeilToken (Testnet, End-to-End Burn Proven 2026-10-06)

Temporary protocol token for end-to-end testing (1B fixed supply, self-burn). The canonical token launches on Pons.

| Item | Value |
|---|---|
| **VeilToken** | [`0x6f79e2af86e316beb999efacf3bab91c66d913fe`](https://explorer.testnet.chain.robinhood.com/address/0x6f79e2af86e316beb999efacf3bab91c66d913fe) |
| **Deploy Tx** | [`0x365b905a6cd4390d326dd0182def223e3f04bb98acdb40ee828a38c632f68c7e`](https://explorer.testnet.chain.robinhood.com/tx/0x365b905a6cd4390d326dd0182def223e3f04bb98acdb40ee828a38c632f68c7e) |
| **setVeilToken** | [`0xf773ae17ce0e4563dcf95abf8e2644ce23c3a3737520e5a6ce2271b9d90c6e63`](https://explorer.testnet.chain.robinhood.com/tx/0xf773ae17ce0e4563dcf95abf8e2644ce23c3a3737520e5a6ce2271b9d90c6e63) |
| **Treasury Fund (10,000 VEIL)** | [`0x699e8417e432dfb95a93817eacdb28bf8b5a07adda1f6426ba851081af53d667`](https://explorer.testnet.chain.robinhood.com/tx/0x699e8417e432dfb95a93817eacdb28bf8b5a07adda1f6426ba851081af53d667) |
| **executeBurn (1,000 VEIL)** | [`0x3df1259e80af32936cbc086688c150e8aef437c9f835dd249d055705709d64af`](https://explorer.testnet.chain.robinhood.com/tx/0x3df1259e80af32936cbc086688c150e8aef437c9f835dd249d055705709d64af) |
| **Supply** | 1,000,000,000 → 999,999,000 (`totalBurned` = 1,000, `buybackShareBps` = 7000) |

### 🔒 Real Groth16 Privacy Loop (Testnet, 0xbow v1.2.1, proven 2026-10-07)

Audited 0xbow stack (WithdrawalVerifier, PrivacyPool, Poseidon, LeanIMT), approved setup artifacts (`withdraw/commitment` wasm+zkey), SDK proving in Node:

| Item | Value |
|---|---|
| **Pool** | [`0x2bea7094f77e3f9a21397c688de8ef105d4848bc`](https://explorer.testnet.chain.robinhood.com/address/0x2bea7094f77e3f9a21397c688de8ef105d4848bc) |
| **Deposit (0.001 ETH)** | [`0x22d3ddb5476f2880b82727a3fd0072875633bd375d6e98cbc30850d0c349e6c0`](https://explorer.testnet.chain.robinhood.com/tx/0x22d3ddb5476f2880b82727a3fd0072875633bd375d6e98cbc30850d0c349e6c0) |
| **Withdraw relay** | [`0x93b55deb8183e0057ba800962664542c379928bc308a00ebc3075c6e93a7a27a`](https://explorer.testnet.chain.robinhood.com/tx/0x93b55deb8183e0057ba800962664542c379928bc308a00ebc3075c6e93a7a27a) |
| **Recipient +0.001 ETH, nullifier spent** | verified onchain |
| **Honesty test (garbage proof)** | rejected onchain — the verifier genuinely checks Groth16 |
| **Hook gating (fresh 0x20c4 hook)** | [`0x65d99bb9eb99c008ef4b738cdd652800796d60c4`](https://explorer.testnet.chain.robinhood.com/address/0x65d99bb9eb99c008ef4b738cdd652800796d60c4), attestation verified `true` |
| **Third-party relay** | [`0xef17b1c04014f4e74af2a2f0438f22bccee2d5214eeb0bd7a268aa1484e23cb1d`](https://explorer.testnet.chain.robinhood.com/tx/0xef17b1c04014f4e74af2a2f0438f22bccee2d5214eeb0bd7a268aa1484e23cb1d) submitted by an ephemeral relayer key, not the depositor |

### 🪝 Hook Gating + Protocol Fee From Real Usage (Testnet, proven 2026-10-07)

- **Hooked pool** ETH/VEIL fee 3000 with `VeilHook` [`0x65d9...60c4`](https://explorer.testnet.chain.robinhood.com/address/0x65d99bb9eb99c008ef4b738cdd652800796d60c4), gated 600s launch window
- **Ungated swap reverts** (`GatingActiveUserNotAttested` enforced onchain)
- **Attested swap:** [`0x2a076f288e8ea8f5554593410b3839d0c5ae026cb7e00aeb7bbf68fd48cdd04b`](https://explorer.testnet.chain.robinhood.com/tx/0x2a076f288e8ea8f5554593410b3839d0c5ae026cb7e00aeb7bbf68fd48cdd04b) with attested `hookData`
- **Treasury fee from usage:** 0 → 2706559470897 wei collected by the hook on a real swap

### ✍️ Self-Attestation Without Owner (Testnet, proven 2026-10-07)

`VeilAttestationRegistry.selfAttest` (EIP-191 signature, nonce + deadline, no owner/attester involved) and `VeilHook` signature-bound `hookData` (user, deadline, signature over hook + chain + user + pool + deadline):

- **Self-attest, no owner:** [`0xaa9b89921095859339fef741de1d48d83c0c117a4ef2b23e7fc398b98f`](https://explorer.testnet.chain.robinhood.com/tx/0xaa9b89921095859339fef741de1d48d83c0c117a4ef2b23e7fc398b98f), `verifyAttestation == true`
- **Spoofed hookData reverts** (fake user/signature rejected onchain)
- **Self-attested swap passes, fee accrues:** [`0x74770b993ce5fe46c115395dfd029e2aa3faf171628e10aad5d1c6f9f5d78fde`](https://explorer.testnet.chain.robinhood.com/tx/0x74770b993ce5fe46c115395dfd029e2aa3faf171628e10aad5d1c6f9f5d78fde), treasury ETH 17457976132009682 → 17929662035599539

### 🔀 Full Shielded Swap ETH → VEIL (Testnet, proven 2026-10-07)

Fresh 0xbow suite v2 (operator-owned entrypoint, ETH + VEIL pools, `maxRelayFeeBPS=100`):

- **ETH shielded** → **withdrawn (ZK)** → **v4 swap ETH→VEIL** ([0x45c66d17e4a248a70d77ef2a945a216bdd6adc80a3f08605f0d9487e5a69dd99](https://explorer.testnet.chain.robinhood.com/tx/0x45c66d17e4a248a70d77ef2a945a216bdd6adc80a3f08605f0d9487e5a69dd99)) → **VEIL shielded** ([0xed7e12fc77dc61c32732791679a861a9d13131343ab70c383a7d3491e5e691bc](https://explorer.testnet.chain.robinhood.com/tx/0xed7e12fc77dc61c32732791679a861a9d13131343ab70c383a7d3491e5e691bc), 0.001 VEIL note) → **VEIL relayed with enforced 50 BPS fee by a third-party key** ([0x33408fc3b3f9ca4d4de07432a1e57ecd76f37937c6011ed1404d0c36b4dcdb20](https://explorer.testnet.chain.robinhood.com/tx/0x33408fc3b3f9ca4d4de07432a1e57ecd76f37937c6011ed1404d0c36b4dcdb20): recipient 0.995, relayer 0.005)

### 🔀 Router Swap-to-Shield (Testnet, proven 2026-10-07)

- **v4 pool ETH/VEIL** `0x3524d46204a0438a67c94e9795818b3b0c5d59869d28865754c4254eb05442e1` (fee 3000, tickSpacing 60)
- **Liquidity** via `TestnetLiquidityHelper` (direct PoolManager path — the pre-deployed testnet PositionManager is a different version whose mint encoding reverts)
- **swapToShield (2 VEIL → ETH → shielded note):** [`0xe18140fc61f77620235efc6990d0c050d1faa7b5411f9b7409161d38032aea72`](https://explorer.testnet.chain.robinhood.com/tx/0xe18140fc61f77620235efc6990d0c050d1faa7b5411f9b7409161d38032aea72) — pool `nextIndex` incremented, router held zero balance

---

## 🔐 Client-Side Security & Note Privacy

* **Zero Server-Side Custody:** All notes (secret + nullifier) are generated in the browser using cryptographically secure random bytes. Note data is never transmitted to servers or relayers.
* **Encrypted Backups:** Browser vault stores notes protected by `PBKDF2-SHA256` (310,000 iterations) and `AES-256-GCM` encryption.
* **Non-Blocking Withdrawals:** Contracts enforce that withdrawals can **never** be paused or frozen by the team or guardian under any circumstances. Guardian can only pause new deposits.

---

## 🧪 Testing & Verification

Veil enforces evidence-before-claims across unit tests, type safety, and live on-chain gates:

```bash
# Run Vitest automated test suite (34 files, 204 tests)
pnpm test

# Verify TypeScript types strictly
npx tsc --noEmit

# Compile production build
pnpm build

# Live invariant gate (deposits − withdrawn = balance, per pool)
node scripts/verify-pool-invariant.mjs            # testnet 46630
node scripts/verify-pool-invariant.mjs --mainnet  # mainnet 4663
```

---

## 🛡️ Non-Custodial Security & Risk Disclosures

* **Non-Custodial Architecture:** Neither the operator nor the protocol contracts ever hold user private keys. All transactions are signed directly in the user's Web3 wallet.
* **Audited-Circuit Reuse Only:** Full-ZK flows build exclusively on the audited 0xbow v1.2.1 circuits — no novel cryptography, no new ceremony. External audit permanently waived by owner decision (residual risk explicitly accepted).
* **Fixed-Denomination Trade-Off:** `0.001` notes are unlinkable but rigid — dust settles visibly (direct-payout), batches cap at 8 notes. Arithmetic, not a bug.
* **Stranded Dust Is Permanent:** Notes with lost secrets are unspendable by design (pools expose no rescue path) and recorded as such in the audit.
* **Key Rotation History:** Two old operator wallets retired after a git-history leak (one sweep incident, nonce 187). Current operator `0xCAB1E4df4FBD2EF6F73cB03519Ec33cba08879e6`. Old keys must never sign again.
* **Disclaimer:** Digital assets and privacy tooling involve significant financial, technical, and regulatory risk. Nothing in this repository constitutes financial, legal, or investment advice. Always conduct independent due diligence.

---

## 📚 Docs Index

| Doc | What |
|---|---|
| [`DevBrief-Veil.md`](DevBrief-Veil.md) | Product brief v1.0: mechanisms, phases F0–F6, security rules, Go/No-Go tests |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | 19 binding owner decisions + B1 atomicity ruling — code follows this file |
| [`docs/superpowers/plans/2026-10-09-full-zk-router.md`](docs/superpowers/plans/2026-10-09-full-zk-router.md) | Full-ZK build plan (6 tasks, all executed) |
| [`docs/INTERNAL-AUDIT-2026-10-07.md`](docs/INTERNAL-AUDIT-2026-10-07.md) | Internal audit PASS WITH CONDITIONS + testnet FINAL + live drill log |
| [`docs/ASP-POLICY.md`](docs/ASP-POLICY.md) | Association-set policy v2 (testnet + mainnet auto-sync) |
| [`docs/MAINNET_RUNBOOK.md`](docs/MAINNET_RUNBOOK.md) | F5 runbook: migrate → proof → gates → pause-first rollback |
| [`docs/MAINNET-DEPLOYMENT-2026-10-12.md`](docs/MAINNET-DEPLOYMENT-2026-10-12.md) | Mainnet deployment record (addresses + evidence) |
| [`docs/TESTNET-CLICKTHROUGH.md`](docs/TESTNET-CLICKTHROUGH.md) | Manual browser test script (Fase 0–7) |

---

## 🧪 Protocol Invariant & Security Acceptance Matrix

| # | Scenario | Expected Outcome | Status |
|---|---|---|---|
| 1 | Normal Buy & Shield | Commitment inserted into Merkle tree, router balance = 0 | ✅ Pass (live: testnet + mainnet invariant 5/5) |
| 2 | Slippage exceeded | Transaction reverts, 100% of user funds refunded | ✅ Pass (`SlippageExceeded`, dust refund) |
| 3 | Double-spend same note | Automatically rejected (nullifier spent) | ✅ Pass (+ pre-send spent check, no gas burn) |
| 4 | Relayer tampers minOut / recipient / fee | Groth16 binds recipient+fee; atomic self-relay | ✅ Pass (0xbow paths; legacy buried) |
| 5 | Shielded swap Token A ➔ Token B | Shielded balance B increases; single/multi/direct | ✅ Pass (live `0xe14f…`, `0x118e…`, direct ×3) |
| 6 | Relayer offline / unavailable | Self-relay operates normally (the supported path) | ✅ Pass |
| 7 | Unregistered address on gated pool | Swap rejected by hook | ✅ Pass (`GatingActiveUserNotAttested`) |
| 8 | Deposit exceeds pool cap | Transaction rejected by contract (`PoolCapExceeded`) | ✅ Pass (code + unit test; live drill impractical, accepted residual) |
| 9 | Guardian pauses pool | Deposits paused, withdrawals remain 100% unblocked | ✅ Pass |
| 10 | Tree rebuild in new browser | Balances independently verified against Merkle root | Manual (see `docs/TESTNET-CLICKTHROUGH.md` §5) |

---

## ⚖️ Legal & Compliance Pillars (§8)

* **Association Sets Mandatory:** Every withdrawal proves membership in a published association set (ASP).
* **Terminology Guardrails:** Explicitly avoid terms such as *mixer*, *tumbler*, *untraceable*, *anonymous*, or *launder*.
* **Open Transparency:** Full contract verification on Blockscout and live on-chain `/burn` ledger.

---

## 📄 License

This repository is licensed under the MIT License. All Solidity sources carry SPDX identifiers; the vendored 0xbow core keeps its upstream Apache-2.0 license.
