// VEIL mainnet deployer CLI — interactive replay of the real 2026-10-12
// deployment (23 transactions, 16 contracts) with authentic onchain records.
// READ-ONLY: zero gas, sends no transactions. Data source:
// deployments/mainnet-deploy-txs-2026-10-12.json (tx hash, block, gas, status
// hunted from chain + receipts; contract addresses cross-checked vs manifest).
// Usage:
//   node scripts/mainnet-deploy-cli.mjs              (interactive menu, nothing runs first)
//   node scripts/mainnet-deploy-cli.mjs --no-menu    (straight deploy replay, for recording)
//   node scripts/mainnet-deploy-cli.mjs --fast       (combine: no pacing delays)
//   node scripts/mainnet-deploy-cli.mjs --addresses  (address book only)
import { createInterface } from "node:readline";
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
const byName = new Map(TXS.map((t) => [t.name, t]));
const totalGas = TXS.reduce((s, t) => s + BigInt(t.gasUsed), 0n);
let done = 0;

function progress() {
  const pct = Math.round((done / TXS.length) * 100);
  const bars = Math.round((done / TXS.length) * 20);
  return `${dim("[")}${C.green}${"█".repeat(bars)}${C.reset}${dim("░".repeat(20 - bars) + `] ${done}/${TXS.length} · ${pct}%`)}`;
}

async function animate(label, ms) {
  if (FAST) return;
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  const steps = Math.max(3, Math.round(ms / 90));
  for (let i = 0; i < steps; i++) {
    process.stdout.write(`\r    ${C.cyan}${frames[i % frames.length]}${C.reset} ${label}`);
    await sleep(90);
  }
  process.stdout.write("\r" + " ".repeat(60) + "\r");
}

async function deployTx(t) {
  console.log(`  ${C.bold}▶ ${hl(t.name)}${C.reset}`);
  await animate("broadcasting to mempool", 600);
  console.log(`    📡 broadcast  ${tx(short(t.hash))}`);
  console.log(`       ${dim(EXPLORER_TX + t.hash)}`);
  await animate(`mining · waiting for block`, 900);
  console.log(`    ⛏  mined      block ${hl(String(t.block))}`);
  if (t.contractAddress) {
    console.log(`    📦 contract   ${tx(t.contractAddress)}`);
    console.log(`       ${dim(EXPLORER_ADDR + t.contractAddress)}`);
  } else {
    console.log(`    🎯 call       ${tx(short(t.to))}`);
  }
  console.log(`    ${ok} confirmed  gas ${hl(num(t.gasUsed))} · status ${hl(t.status)}`);
  done++;
  console.log(`    ${progress()}`);
}

async function stage(title, names) {
  console.log();
  console.log(`${C.bold}${title}${C.reset}`);
  for (const n of names) {
    await deployTx(byName.get(n));
    await sleep(500);
  }
}

async function deployFlow() {
  banner();
  console.log(`  deployer ${tx("0xCAB1E4df4FBD2EF6F73cB03519Ec33cba08879e6")}`);
  console.log(`  window   blocks ${hl("86333824")} → ${hl("86334911")}`);
  console.log(`  scope    ${hl("23 transactions")} · ${hl("16 contracts")} · ${hl(`${num(totalGas)} gas`)} · ${hl("0 reverts")}`);
  await sleep(800);
  await stage("⛓  0xbow cryptography core", ["PoseidonT3", "PoseidonT4", "WithdrawalVerifier", "CommitmentVerifier"]);
  await stage("🔀 Entrypoint + pools + ASP", ["EntrypointImpl", "EntrypointProxy", "ETHPool", "VEILPool", "activateETH", "activateVEIL", "registerETH", "registerVEIL", "updateRootASP"]);
  await stage("🏛  Treasury + registry + hook", ["Treasury", "Create2Deployer", "MockVerifier", "LegacyETHPool", "RegistryV2", "HookV2"]);
  await stage("🔀 Routers + VEIL pools + ZK", ["ShieldRouter", "VEILPool05", "VEILPool2", "VeilZkRouter"]);
  console.log();
  console.log(`${C.green}${C.bold}  ✅ DEPLOYED — 16 CONTRACTS LIVE ON MAINNET 4663${C.reset}`);
  console.log(dim("  manifest: deployments/privacy-pools-mainnet-latest.json"));
  console.log();
}

async function addressBook() {
  banner();
  const m = JSON.parse(readFileSync(join(root, "deployments", "privacy-pools-mainnet-latest.json"), "utf8"));
  console.log(`${C.bold}📖 MAINNET ADDRESS BOOK · chain 4663${C.reset}`);
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

function menu() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  banner();
  console.log("  Nothing runs until you choose. What do you want?");
  console.log(`  ${hl("1")}  Deploy replay — full 23-tx flow with animations (for recording)`);
  console.log(`  ${hl("2")}  Address book`);
  console.log(`  ${hl("3")}  Exit`);
  rl.question(`\n  ${C.bold}choice [1-3]:${C.reset} `, async (ans) => {
    rl.close();
    const c = ans.trim();
    if (c === "1") await deployFlow().catch(fail);
    else if (c === "2") await addressBook();
    else console.log("  bye.");
  });
}

function fail(e) {
  console.error(`\n  FAILED: ${e?.message || e}`);
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.includes("--addresses")) {
  await addressBook();
} else if (args.includes("--no-menu")) {
  await deployFlow().catch(fail);
} else {
  menu();
}
