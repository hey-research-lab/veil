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

1. Proof cycle 0.001 → prove → withdraw on 4663.
2. `verify-pool-invariant --mainnet` re-run + Blockscout source verification.
3. UI ZK execution wiring for mainnet + v4 liquidity check/seed.
4. ASP auto-sync: `POST /api/asp/sync {"chainId":4663}` (route ready, policy v2).
5. Pons token: `setVeilToken` + 70% buyback when launched.
