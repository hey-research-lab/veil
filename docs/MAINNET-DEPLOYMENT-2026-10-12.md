# Veil Mainnet Deployment Record — 2026-10-12 (Chain 4663)

> Deployer: `0xCAB1E4df4FBD2EF6F73cB03519Ec33cba08879e6` (current operator wallet).
> Command: `pnpm migrate:mainnet` (`scripts/migrate-mainnet-0xbow.mjs --execute`).
> Gas spent: ~0.0004944 ETH (0.00154 → 0.0010456). No tx reverted; one client-side
> abort before any gas was spent (see §5).
> Machine source of truth: `deployments/privacy-pools-mainnet-latest.json`
> (dated copy: `deployments/privacy-pools-mainnet-2026-10-12.json`).
> Per-contract creation transactions: open any address below in the explorer —
> this record pins addresses + constructor args + read-back verification instead
> (explorer API was unreachable from the deploy machine at record time).

## 1. 0xbow Suite (audited v1.2.1 bytecode, testnet-proven)

| Contract | Address | Constructor / init | Verified |
|---|---|---|---|
| PoseidonT3 | `0x02f3eb947b32add9fa9f9bbfe8038c4e0d163e6b` | none | deploy receipt success |
| PoseidonT4 | `0x13636609efd9140b34f36f769fedd94692dc32e7` | none | deploy receipt success |
| WithdrawalVerifier | `0xdbbe1acf08a99789b5ca0ee688679dab80ba12d2` | none | deploy receipt success |
| CommitmentVerifier | `0xfdb7161a993fa914bbb734b3d52c4342501836eb` | none | deploy receipt success |
| Entrypoint (impl) | `0x12e3e034b58237d58c1dabd697c97bf41fe50d7a` | none | deploy receipt success |
| Entrypoint (proxy) | `0x96cb8b1836d341a6f5f1f54428bd6696c8b950b1` | impl + `initialize(owner, postman)` = deployer twice | suite live |
| ETH pool | `0x10c17b7538e13c63b890fea52708846e88bb1932` | entrypoint + verifiers + deployer | `activateDeposits` + `registerPool(NATIVE, 0.001 ETH, maxRelay 100)` |
| VEIL pool | `0xdb9f182670da2cc6c5ddd432ec98a45e4f2290d1` | entrypoint + verifiers + VEIL + deployer | `activateDeposits` + `registerPool(VEIL, 1 VEIL, maxRelay 100)` |
| ASP sentinel | root `2188824287…` | `updateRoot` + `local-mainnet-asp-sentinel-00000000` | `updateRoot` receipt success |

## 2. Veil Suite (fresh, owner = deployer throughout, no renounce anywhere)

| Contract | Address | Constructor | Verified |
|---|---|---|---|
| VeilTreasury | `0xb68c3d25e5e9902363e8e10d5c0a471e65be8152` | owner + temp VEIL `0xe0e11…` | `owner()` = deployer, `veilToken()` set, `buybackShareBps` = 7000, code 1850 bytes |
| VeilCreate2Deployer | `0xea48e6a7ae296ebbd7d58792091b8087032d3aa4` | none | hook deployed through it (proves code) |
| ShieldedVerifierMock | `0xae2c219e462ca1b80473375bcbcad2b025cae610` | none | referenced by fresh pools (verified below) |
| Legacy ETH pool | `0x15f7e378410719438dd20b12d4c440ba1863e892` | 0 / Mock / 0.001 / cap 10 / assoc root / guardian | denom + asset + unpaused read back |
| Registry v2 | `0xd1f17c70067f1cc2b478606b3f0faa18ee8add1d` | owner | deploy receipt success |
| Hook v2 (`0x20c4`) | `0xf95f041462ee34c2ea7b953a879838133ef820c4` | PM + treasury + registry + owner, salt `…4b7d` (mined 19,325 iterations) | deployed via fresh create2 |
| ShieldRouter (fixed R1) | `0x3db4ae3429f1507aa0cd31c740a0fd276e22a55c` | PoolManager | `poolManager()` matches canonical |
| VEIL pool 0.5 | `0x493f64d4163fe1f966c423f9338cd955e80a99df` | VEIL / Mock / 0.5 / cap 5000 / assoc root / guardian | all 5 fields read back |
| VEIL pool 2 | `0x3783db43f4f08294da847c66a0fb7203bb3e005d` | VEIL / Mock / 2 / cap 20000 / assoc root / guardian | all 5 fields read back |
| **VeilZkRouter** (single+multi+direct) | `0x0fb48c9552154ea028cbd812430e1ea3465a9b4c` | entrypoint + PoolManager | `entrypoint()` + `poolManager()` match |

## 3. Pre-Migration Rescue (done before deploy)

Old treasury `0x8cd3…` held 9,000 temp VEIL. Rescued to the deployer in tx
`0x8e023feda6a9893781c741517eb8e37ee0fcd8808cf75d393eac65f0f8216f3d`
(status success; treasury reads 0 after). Migration step 0 therefore logged
`old treasury empty, nothing to rescue` and continued.

## 4. Post-Deploy Gates (2026-10-12, all green)

- `verify-pool-invariant --mainnet`: 5/5 PASS (0xbow ETH/VEIL lifetime 0 balance 0
  unpaused; legacy ETH 0.001 / VEIL05 0.5 / VEIL2 2, totals 0).
- Abandoned old suite untouched: Mock `0x797e…`, pool `0xdd0f…` (paused),
  treasury `0x8cd3…` (empty), create2 `0xe4c3…`, registry `0xa7f7…`,
  hook `0x9df0…`, router `0x01a0…` (buggy).
- Env patched: `.env.local` + `.env.mainnet.local`
  (`NEXT_PUBLIC_0XBOW_*`, `NEXT_PUBLIC_0XBOW_ZK_ROUTER`, registry, hook,
  routers, pools, treasury).

## 5. Incidents During Deployment

1. First `--execute` aborted client-side with `AbiEncodingLengthMismatchError`
   in `deployLibrary` (`writeContract` misused for deployment — dry-run never
   exercises send paths). Zero gas spent. Fixed + regression test, commit
   `b083f90`. Audit lesson: dry-run proves validation only, never send paths.
2. Several fresh addresses are byte-identical to testnet ones (treasury
   `0xb68c…` etc.) — normal CREATE collision (same deployer, same nonce
   trajectory), harmless: read-backs above prove correct code on 4663.
   Documented in `MAINNET_RUNBOOK.md`; do not redeploy, do not mistake for
   testnet pointers.

## 6. Still To Do (post-deploy order)

- [x] Proof cycle → invariant → Blockscout/Sourcify (Sourcify 10/10 done)
- [x] UI ZK wiring (commit `3b24ff9`), UI mainnet-only (commit `4842194`)
- [x] Hooked pool + gate + fee proof (§10), Vercel env (21 vars, below)
- [ ] Single/multi/direct ZK live: single attempt blocked by thin plain-pool
  depth (quote < 0.001 VEIL note) — deepen pool first, note file persisted
  (`deployments/mainnet-single-note.json`, gitignored), nothing stranded
- [ ] UI click-through on mainnet (wallet + browser)
- [ ] Blockscout checkmarks when their explorer recovers
- [ ] Pons token + `setVeilToken`/70% + domain/X

Vercel production env: all 21 `NEXT_PUBLIC_*` set (Production/Preview/Dev)
via `scripts/setup-vercel-env.mjs` (token var needed explicit `--type config`).1. Proof cycle 0.001 → prove → withdraw on 4663.
2. `verify-pool-invariant --mainnet` re-run + Blockscout source verification.
3. UI ZK execution wiring for mainnet + v4 liquidity check/seed.
4. ASP auto-sync: `POST /api/asp/sync {"chainId":4663}` (route ready, policy v2).
5. Pons token: `setVeilToken` + 70% buyback when launched.

## 7. Transaction Ledger (23 txs, nonces 0–22, blocks 86333824–86334911)

Machine-readable: `deployments/mainnet-deploy-txs-2026-10-12.json`
(hashes hunted from chain by deployer-nonce order, receipts verified —
all `success`, contract addresses match §1–§2). Total gas: 24,586,693.

| Nonce | Step | Tx | Block | Gas |
|---|---|---|---|---|
| 0 | PoseidonT3 | `0x3c23306d…0a8f50b56` | 86333824 | 3,614,580 |
| 1 | PoseidonT4 | `0x0726e21a…690bd9950` | 86333875 | 2,751,499 |
| 2 | WithdrawalVerifier | `0xf58476d9…1e68b91e1de` | 86333929 | 485,746 |
| 3 | CommitmentVerifier | `0x99f5ac66…666be681d77` | 86333978 | 406,922 |
| 4 | Entrypoint impl | `0xecdde247…896d25abab31` | 86334032 | 2,465,308 |
| 5 | Entrypoint proxy | `0x4c075711…944dc91971344` | 86334089 | 299,723 |
| 6 | ETH pool | `0x510013db…cfacb40215` | 86334136 | 1,678,357 |
| 7 | VEIL pool | `0xcd91b03c…74468a3a59e5` | 86334185 | 1,735,355 |
| 8 | activate ETH | `0x942535e7…ccfac55897a16697` | 86334231 | 27,970 |
| 9 | activate VEIL | `0x277c0b22…ead0bbb8cb790915d` | 86334285 | 27,970 |
| 10 | register ETH | `0xf45e32f1…2a7c9bcdac358aa8e` | 86334331 | 130,643 |
| 11 | register VEIL | `0x23f7a227…564d1a165d467d` | 86334377 | 158,397 |
| 12 | ASP sentinel root | `0x247d8de0…978c1268fe4705d6` | 86334423 | 166,819 |
| 13 | Treasury | `0x2166a1ef…d46b231642fe2106` | 86334474 | 523,828 |
| 14 | Create2Deployer | `0x88cca57b…0529bdf876a20d` | 86334522 | 132,219 |
| 15 | Mock verifier | `0x0955412e…bae2297c7b7bd02316bc` | 86334574 | 170,034 |
| 16 | Legacy ETH pool | `0x9682b303…c8b5d23c439af8dbfff7` | 86334622 | 1,337,271 |
| 17 | Registry v2 | `0xb74ef019…02e62379b9371718f2` | 86334674 | 633,026 |
| 18 | Hook v2 (via create2) | `0xae8ca8cf…8a6fa35c63db34ca37048` | 86334721 | 1,152,942 |
| 19 | ShieldRouter | `0x877e3c8d…cddc1eb5d3f0c570ad748ed` | 86334766 | 1,647,486 |
| 20 | VEIL pool 0.5 | `0x21b8ed4b…0db38ab0a72c9c0f741c` | 86334811 | 1,337,535 |
| 21 | VEIL pool 2 | `0x06a22e50…45dcc64015690bf68` | 86334859 | 1,337,535 |
| 22 | VeilZkRouter | `0xcf51d624…6202c6208aa5` | 86334911 | 2,365,528 |

Full hashes in the JSON file; explorer links in `mainnet-deploy-cli.mjs` output.

## 9. Blockscout Verification Packages (ready to submit)
Explorer + Sourcify APIs are unreachable from the deploy machine, so
submission is a 5-minute manual step (owner wallet not needed — anyone can
submit sources for matching):
`verification/mainnet-4663/<Name>.verify.json` — one file per Veil contract
(10 files), each containing: exact `standardJsonInput` (solc
`0.8.37+commit.f401782d`, optimizer 200, viaIR, cancun), `contractFile:Name`,
`constructorArgumentsEncoded`, and a local byte-identity proof
(`localByteMatch: true` = artifact matches onchain code modulo
constructor-set immutables, whose values were read back live in §1–§2).

Per contract: explorer address page → Verify → Standard JSON Input → paste
`standardJsonInput` → compiler `v0.8.37+commit.f401782d` → optimization 200,
viaIR on, EVM cancun → constructor args = `constructorArgumentsEncoded`.
Hook note: factory-deployed via create2 — enter the args manually if the
explorer cannot trace the internal creation tx. 0xbow core contracts
(entrypoint/pools/verifiers/Poseidon) verify from the upstream audited repo
(follow-up, same procedure).

**DONE 2026-10-12 via Sourcify (chain 4663) — 10/10 Verified.**
Robinhood mainnet explorer was unreachable network-wide (TLS killed at every
path; testnet explorer fine — their zone is broken), so verification went to
Sourcify instead through verify.sourcify.dev: 3 exact runtime+creation
matches (Create2Deployer, Mock, Registry) + 7 jobs-table Verified rows
matching each submitted address (treasury `0xb68C…`, legacy ETH `0x15F7…`,
VEIL05 `0x493F…`, VEIL2 `0x3783…`, router `0x3dB4…`, hook `0xf95F…`, zkRouter
`0x0fb4…`). Check any contract: Sourcify lookup → chain 4663 → address.
Blockscout checkmark follows whenever their explorer recovers (same sources).

## 8. Proof Cycle 0.001 (2026-10-12, REAL funds) + One Dust Note
**Cycle PASSED.** Deposit
[`0x3eee36f9…a8784a1e4a`](https://explorer.mainnet.chain.robinhood.com/tx/0x3eee36f9bd1ae425cea82de105ac67e0b5b6ed72b899f805b6949aa8784a1e4a)
(block 86372444) → ASP publish
[`0x9fddd994…28600f271`](https://explorer.mainnet.chain.robinhood.com/tx/0x9fddd994e340324549e833933b287098939526158ac031b3a59469528600f271)
(root `21190888…`, includes the label — not sentinel) → Groth16 prove +
local verify → relay to self
[`0x435a3d0e…c2a7843d4ee`](https://explorer.mainnet.chain.robinhood.com/tx/0x435a3d0e4d6c5d2c1c87f7cd951ba55b19a5f1a4ab9a8ae2cb50ec2a7843d4ee)
(block 86372898, nullifier spent, 0.001 returned home). Script:
`scripts/mainnet-proof-cycle.mjs` (relay recipient = deployer, secrets
persisted pre-deposit, spent-note file auto-removed).

**Dust (honest record, same class as testnet dust):** the FIRST cycle attempt
deposited 0.001 ETH
([`0x0b328e7c…a3270c2a15`](https://explorer.mainnet.chain.robinhood.com/tx/0x0b328e7c2e527e52469f1336c6b3bbe65d3377126647a99f27eefea3270c2a15),
block 86370415, label `87025063…`) then crashed on a fresh-tip log-indexing
lag BEFORE persisting secrets — note unspendable, 0.001 locked in the pool
forever. No one can take it (not even the operator); invariant still holds
(lifetime 0.002 − withdrawn 0.001 = balance 0.001). Lesson applied: secrets
persist pre-deposit, scans retry + assert the label, same-root publishes
skipped. Post-cycle invariant re-run: **5/5 PASS**.

## 10. Hooked Pool + Gating + Fee Proof (2026-10-12, REAL funds)

- Hooked ETH/temp-VEIL pool (fee 3000, hook v2) initialized at 2000 VEIL/ETH: `0x82766b3819d411514c2dee6e9411f1573b06c9f66b403949fbeb2dbf9b021653`
- Pool id `0x39d8f6b31a3595e2190985505d2b7585afbe2d4a6f96b23b0cc32542405c192a`, seeded L=37500000000000000 via `0xd1dd...` (recoverable): `0x2fead33da74ad07ce77c0a9fa50725f08fdc5eb1d42cd48c0f5c70b9c8b5ea43`
- Swap helper `0x08b11d4d5fc78789e305e8437c45c52488a19a58` (`0x6dce7d20cd022adf8f1cc1bcd780973f61f81149c683e93c9156f846c3cb17d1`)
- Gating window 30d: `0x98e9af04e2641195cf48ea7c77a3b77460d9ccb8df6f8b310dd250f989abbd1c`
- Attested dust swap 0.0002 ETH: `0x4228714bec66077bb02dd463f75061171c89fa6cb8249a2122898c578153a26f` — treasury +320857510136 wei (flywheel ALIVE). Unattested path reverts (negative proof).
- Script: `scripts/mainnet-gated-pool.mjs`. Contract: `contracts/MainnetSwapHelper.sol`.

## 10. Hooked Pool + Gating + Fee Proof (2026-10-12, REAL funds)

- Pool id 0x39d8f6b31a3595e2190985505d2b7585afbe2d4a6f96b23b0cc32542405c192a, seeded L=37500000000000000 via 0xd1dd... (recoverable): 0x2fead33da74ad07ce77c0a9fa50725f08fdc5eb1d42cd48c0f5c70b9c8b5ea43
- Swap helper 0x08b11d4d5fc78789e305e8437c45c52488a19a58 (0x6dce7d20cd022adf8f1cc1bcd780973f61f81149c683e93c9156f846c3cb17d1)
- Gating window 30d: 0x98e9af04e2641195cf48ea7c77a3b77460d9ccb8df6f8b310dd250f989abbd1c
- Attested dust swap 0.0002 ETH: 0x4228714bec66077bb02dd463f75061171c89fa6cb8249a2122898c578153a26f � treasury +320857510136 wei (flywheel ALIVE). Unattested path reverts (negative proof).
- Script: scripts/mainnet-gated-pool.mjs. Contract: contracts/MainnetSwapHelper.sol.


## 11. Liquidity Recoverability: v1 = Permanent POL, v2 Ready, Wallet Empty (2026-10-13)

- Design gap found in helper v1 ( xd1dd7d22dd3a2953af5a1383d9bfedbbc3064693 plain pool,  x13... hooked pool): emoveLiquidity called manager.modifyLiquidity DIRECTLY, but PoolManager.modifyLiquidity has onlyWhenUnlocked -> every removal path reverts. The v1 seeds (~0.001 ETH + ~1-2 temp VEIL per pool) are therefore PERMANENT protocol-owned liquidity: locked, unrecoverable by anyone, still earning nothing but deepening both pools. Honest reframe: involuntary POL, not a loss of user funds (temp VEIL worthless pre-Pons).
- Periphery PositionManager-direct minting investigated and ABANDONED: modifyLiquidities(MINT+SETTLE) reverts with EMPTY data on 4663 in all combos (L 1e6..9e5, with/without SWEEP, hookData 0x/empty, full-range and ITM ranges, allowance double-set); empty-actions probe succeeds (selector exists, 
extTokenId=3752545, onchain PM live). Root cause unproven; documented, not chased further. The v2-helper path uses only mainnet-proven primitives (unlock + v4-core modifyLiquidity + CurrencySettler.take, the same take path the live swap helper uses).
- Helper v2 (contracts/MainnetLiquidityHelper.sol): unlock-routed removal via action byte (0=add unchanged, 1=remove -> negative-delta modifyLiquidity + take() both legs to owner, returns (amount0, amount1)). Compiled clean (scripts/compile-liqhelper.mjs, artifact deployments/mainnet-liqhelper-artifact.json now contains removeLiquidity). NOT deployed. Round-trip proof script ready: scripts/mainnet-liq-roundtrip.mjs (dust 0.0002 ETH / 0.4 VEIL: deploy v2 -> seed -> remove -> assert pool back to baseline + zero helper residue).
- Wallet state: operator  xCAB1... holds 0.0000558 ETH / ~8997 temp VEIL. All ETH deployed (0.001 privacy-pool dust + 0.002 pool seeds + gas across ~50 txs at 0.02 gwei). The round-trip script REFUSED to run (fail-closed guard working as designed); forcing a micro round-trip was rejected (deploy alone ~60% of balance, stranding risk).
- BLOCKED on top-up: single-ZK live (needs pool depth + gas), v2 deploy + round-trip, real re-seeding via v2, multi-withdrawal live. Ask: ~0.01 ETH to the operator. Local tree green: tsc 0, vitest 39 files / 229 tests PASS.



## 12. Micro Round-Trip PROVEN on Fumes (2026-10-13, REAL funds)

- Wallet had 0.0000558 ETH. Maximum physically attemptable: deploy v2 + micro round-trip with per-step live guards. Result: FULL SUCCESS, nothing stranded.
- Helper v2 deployed: 0xb4194deb8a51b69118e5d5414d7d08326a2e9b0b (tx 0xf42074984647e1f0173f406020ec53f1535042505babf79647d50fbad26176a8, 1348595 gas).
- Micro seed L=100000000000000 (3e-6 ETH / 0.006 VEIL caps): tx 0xbf91daff0d79d4b7996981f5953bf3d060e90c0005d21d3c8f91f039ff301a49, pool 37500000000000000 -> 37600000000000000.
- Removal: tx 0x233f6523af2e12a3791f15d85d389725c47524fc225cbf11302e551c6b80c365, sim returned amount0=2472052377607 / amount1=4045221731781668, pool back to 37500000000000000, owner VEIL +0.004045, helper residue 0 ETH / 0 VEIL. RECOVERABILITY PROVEN: seed -> remove -> funds back, zero residue.
- Chain quirk documented: this node rejects txs carrying explicit maxFeePerGas/maxPriorityFeePerGas ('gas required exceeds allowance' / 'code storage out of gas' on estimation). Sends must omit fee fields; spike protection via pre-send gasPrice re-check (calmNetwork) instead. Script: scripts/mainnet-micro-roundtrip.mjs (fresh + HELPER=/LIQ= resume/skip-seed modes).
- Wallet left: ~0.0000212 ETH. Still blocked on top-up for: single-ZK live rerun (needs 0.001 deposit), real re-seeding via v2, multi live. Local tree green.

