// VEIL mainnet deployer CLI — replays the real 2026-10-12 deployment of all
// 16 mainnet contracts (23 transactions) with authentic onchain records.
// READ-ONLY: zero gas, sends no transactions. Data source:
// deployments/mainnet-deploy-txs-2026-10-12.json (tx hash, block, gas, status
// hunted from chain + receipts; contract addresses cross-checked vs manifest).
// Usage:
//   node scripts/mainnet-deploy-cli.mjs              (paced replay, for recording)
//   node scripts/mainnet-deploy-cli.mjs --fast       (no pacing delays)
//   node scripts/mainnet-deploy-cli.mjs --addresses  (address book only)
import { readFileSync } from "node:fs";
import { join } from "node:path";

const FAST = process.argv.includes("--fast");
const sleep = (ms) => (FAST ? Promise.resolve() : new Promise((r) => setTimeout(r, ms)));

// ---- ANSI styling (no dependencies) ----
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m",
};
const ok = `${C.green}✓${C.reset}`;
const tx = (s) => `${C.cyan}${s}${C.reset}`;
const hl = (s) => `${C.yellow}${s}${C.reset}`;
const dim = (s) => `${C.dim}${s}${C.reset}`;
const short = (h) => `${h.slice(0, 10)}…${h.slice(-6)}`;
const num = (n) => Number(n).toLocaleString("en-US");

const EXPLORER_TX = "https://explorer.mainnet.chain.robinhood.com/tx/";
const EXPLORER_ADDR = "https://explorer.mainnet.chain.robinhood.com/address/";

function banner() {
  console.log(`${C.magenta}${C.bold}`);
  console.log("  ██╗   ██╗███████╗██╗██╗     ");
  console.log("  ██║   ██║██╔════╝██║██║     ");
  console.log("  ██║   ██║█████╗  ██║██║     ");
  console.log("  ╚██╗ ██╔╝██╔══╝  ██║██║     ");
  console.log("   ╚████╔╝ ███████╗██║███████╗");
  console.log("    ╚═══╝  ╚══════╝╚═╝╚══════╝");
  console.log(`${C.reset}${C.bold}  MAINNET DEPLOYER · Robinhood Chain 4663${C.reset}`);
  console.log(dim("  replay of the 2026-10-12 deployment · 23 transactions · onchain records"));
  console.log();
}

const root = process.cwd();
const TXS = JSON.parse(readFileSync(join(root, "deployments", "mainnet-deploy-txs-2026-10-12.json"), "utf8"));
const byNonce = new Map(TXS.map((t) => [t.nonce, t]));
const byName = new Map(TXS.map((t) => [t.name, t]));

function deployLine(t, note = "") {
  console.log(`  ${ok} ${hl(t.name)}`);
  console.log(`    tx      ${tx(short(t.hash))}  ${dim(EXPLORER_TX + t.hash)}`);
  console.log(`    block   ${hl(String(t.block))} · gas ${hl(num(t.gasUsed))} · status ${t.status}`);
  if (t.contractAddress) console.log(`    address ${tx(t.contractAddress)}  ${dim(EXPLORER_ADDR + t.contractAddress)}`);
  else console.log(`    target  ${tx(short(t.to))}`);
  if (note) console.log(`    ${dim(note)}`);
}

async function pause(ms = 700) {
  await sleep(ms);
}

async function stage(title, names, note = "") {
  console.log();
  console.log(`${C.bold}${title}${C.reset}`);
  if (note) console.log(`  ${dim(note)}`);
  for (const n of names) {
    deployLine(byName.get(n));
    await pause();
  }
}

async function addressBook() {
  banner();
  console.log(`${C.bold}📖 MAINNET ADDRESS BOOK · chain 4663${C.reset}`);
  const m = JSON.parse(readFileSync(join(root, "deployments", "privacy-pools-mainnet-latest.json"), "utf8"));
  for (const [label, addr] of [
    ["Entrypoint (proxy)", m.entrypoint], ["ETH pool", m.ethPool], ["VEIL pool", m.veilPool],
    ["Treasury", m.treasury], ["Registry v2", m.registryV2], ["Hook v2", m.hookV2],
    ["ShieldRouter", m.routerFixed], ["VeilZkRouter", m.zkRouter],
    ["Legacy ETH", m.legacyEthPool], ["VEIL 0.5", m.veilPool05], ["VEIL 2", m.veilPool2],
  ]) {
    console.log(`  ${label.padEnd(20)} ${tx(addr)}`);
  }
  console.log();
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--addresses")) return addressBook();
  banner();
  const first = byNonce.get(0);
  const last = byNonce.get(TXS.length - 1);
  console.log(`  deployer ${tx("0xCAB1E4df4FBD2EF6F73cB03519Ec33cba08879e6")}`);
  console.log(`  window   blocks ${hl(String(first.block))} → ${hl(String(last.block))}`);
  const totalGas = TXS.reduce((s, t) => s + BigInt(t.gasUsed), 0n);
  console.log(`  scope    ${hl(`${TXS.length} transactions`)} · ${hl("16 contracts")} · ${hl(`${num(totalGas)} gas`)} · ${hl("0 reverts")}`);

  await stage("⛓  0xbow cryptography core", ["PoseidonT3", "PoseidonT4", "WithdrawalVerifier", "CommitmentVerifier"]);
  await stage("🔀 Entrypoint + pools + ASP", ["EntrypointImpl", "EntrypointProxy", "ETHPool", "VEILPool", "activateETH", "activateVEIL", "registerETH", "registerVEIL", "updateRootASP"]);
  await stage("🏛  Treasury + registry + hook", ["Treasury", "Create2Deployer", "MockVerifier", "LegacyETHPool", "RegistryV2", "HookV2"]);
  await stage("🔀 Routers + VEIL pools + ZK", ["ShieldRouter", "VEILPool05", "VEILPool2", "VeilZkRouter"]);

  console.log();
  console.log(`${C.green}${C.bold}  ✅ DEPLOYED — 16 CONTRACTS LIVE ON MAINNET 4663${C.reset}`);
  console.log(dim("  manifest: deployments/privacy-pools-mainnet-latest.json"));
  console.log();
}

await main().catch((e) => {
  console.error(`\n  FAILED: ${e?.message || e}`);
  process.exit(1);
});
