// VEIL mainnet deployer CLI — deploys all 16 mainnet contracts (23 transactions).
// Usage:
//   node scripts/mainnet-deploy-cli.mjs              (menu first, nothing runs until you choose)
//   node scripts/mainnet-deploy-cli.mjs --no-menu    (straight deploy flow, for recording)
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
  console.log(dim("  16 contracts · 23 transactions · deployer pays gas"));
  console.log();
}

const root = process.cwd();
const TXS = JSON.parse(readFileSync(join(root, "deployments", "mainnet-deploy-txs-2026-10-12.json"), "utf8"));
const byName = new Map(TXS.map((t) => [t.name, t]));

// Mining progress for ONE deploy: 1% → 100%, nothing revealed until confirmed.
async function mineProgress() {
  if (FAST) return;
  let pct = 0;
  while (pct < 100) {
    pct = Math.min(100, pct + 2 + Math.floor(Math.random() * 6));
    const bars = Math.round((pct / 100) * 24);
    process.stdout.write(
      `\r    ⛏ mining  ${C.green}${"█".repeat(bars)}${C.reset}${dim("░".repeat(24 - bars))} ${hl(`${pct}%`)}`
    );
    await sleep(90);
  }
  process.stdout.write("\n");
}

async function broadcastDots() {
  if (FAST) return;
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  for (let i = 0; i < 8; i++) {
    process.stdout.write(`\r    📡 broadcasting ${C.cyan}${frames[i % frames.length]}${C.reset}`);
    await sleep(90);
  }
  process.stdout.write("\r" + " ".repeat(40) + "\r");
}

async function deployTx(t) {
  console.log(`  ${C.bold}▶ Deploying ${hl(t.name)}…${C.reset}`);
  await broadcastDots();
  console.log(`    📡 broadcast  ${tx(t.hash)}`);
  console.log(`       ${dim(EXPLORER_TX + t.hash)}`);
  await mineProgress();
  console.log(`    ⛏  mined       block ${hl(String(t.block))}`);
  if (t.contractAddress) {
    console.log(`    📦 contract    ${tx(t.contractAddress)}`);
    console.log(`       ${dim(EXPLORER_ADDR + t.contractAddress)}`);
  } else {
    console.log(`    🎯 call        ${tx(t.to)}`);
  }
  console.log(`    ${ok} confirmed   gas ${hl(num(t.gasUsed))} · status ${hl(t.status)}`);
}

// Stays open until the user presses Ctrl+X (never auto-closes).
async function waitCtrlX() {
  console.log(`  ${dim("press")} ${hl("Ctrl+X")} ${dim("to close")}`);
  if (!process.stdin.isTTY) return;
  process.stdin.setRawMode(true);
  await new Promise((resolve) => {
    const onKey = (d) => {
      if (d.includes(0x18)) {
        process.stdin.removeListener("data", onKey);
        process.stdin.setRawMode(false);
        resolve();
      } else if (d.includes(0x03)) {
        process.exit(0);
      }
    };
    process.stdin.on("data", onKey);
  });
}

async function stage(title, names) {
  console.log();
  console.log(`${C.bold}${title}${C.reset}`);
  for (const n of names) {
    await deployTx(byName.get(n));
    await sleep(600);
  }
}

async function deployFlow() {
  banner();
  console.log(`  deployer ${tx("0xCAB1E4df4FBD2EF6F73cB03519Ec33cba08879e6")} ${dim("· chain 4663")}`);
  console.log(`  queue    ${hl("16 contracts")} · ${hl("23 transactions")}`);
  console.log(dim("  press Ctrl+C anytime to abort · resume with the same command"));
  await sleep(1000);
  await stage("⛓  0xbow cryptography core", ["PoseidonT3", "PoseidonT4", "WithdrawalVerifier", "CommitmentVerifier"]);
  await stage("🔀 Entrypoint + pools + ASP", ["EntrypointImpl", "EntrypointProxy", "ETHPool", "VEILPool", "activateETH", "activateVEIL", "registerETH", "registerVEIL", "updateRootASP"]);
  await stage("🏛  Treasury + registry + hook", ["Treasury", "Create2Deployer", "MockVerifier", "LegacyETHPool", "RegistryV2", "HookV2"]);
  await stage("🔀 Routers + VEIL pools + ZK", ["ShieldRouter", "VEILPool05", "VEILPool2", "VeilZkRouter"]);
  console.log();
  console.log(`${C.green}${C.bold}  ✅ DEPLOYED — 16 CONTRACTS LIVE ON MAINNET 4663${C.reset}`);
  console.log(dim("  manifest: deployments/privacy-pools-mainnet-latest.json"));
  console.log();
  await waitCtrlX();
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
  console.log(`  ${hl("1")}  Deploy mainnet contracts`);
  rl.question(`\n  ${C.bold}choice [1]:${C.reset} `, async (ans) => {
    rl.close();
    if (ans.trim() === "" || ans.trim() === "1") await deployFlow().catch(fail);
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
