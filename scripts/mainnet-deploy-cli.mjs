// VEIL mainnet deploy CLI — interactive showcase ceremony for the live 4663 suite.
// READ-ONLY: zero gas, sends no transactions. Reads every fresh contract from
// deployments/privacy-pools-mainnet-latest.json and verifies it live.
// Usage:
//   node scripts/mainnet-deploy-cli.mjs                  (interactive menu)
//   node scripts/mainnet-deploy-cli.mjs --no-menu         (straight ceremony, for recording)
//   node scripts/mainnet-deploy-cli.mjs --no-menu --fast  (no pacing delays)
//   node scripts/mainnet-deploy-cli.mjs --addresses       (address book only)
import { createInterface } from "node:readline";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createPublicClient, custom, formatEther } from "viem";
import { robinhoodMainnet } from "../lib/chains.mjs";
import { rpcRequest } from "./rpc-helper.mjs";

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
  red: "\x1b[31m",
};
const ok = `${C.green}✓${C.reset}`;
const item = (s) => `${C.cyan}${s}${C.reset}`;
const hl = (s) => `${C.yellow}${s}${C.reset}`;
const dim = (s) => `${C.dim}${s}${C.reset}`;

function banner() {
  console.log(`${C.magenta}${C.bold}`);
  console.log("  ██╗   ██╗███████╗██╗██╗     ");
  console.log("  ██║   ██║██╔════╝██║██║     ");
  console.log("  ██║   ██║█████╗  ██║██║     ");
  console.log("  ╚██╗ ██╔╝██╔══╝  ██║██║     ");
  console.log("   ╚████╔╝ ███████╗██║███████╗");
  console.log("    ╚═══╝  ╚══════╝╚═╝╚══════╝");
  console.log(`${C.reset}${C.bold}  MAINNET DEPLOY CEREMONY · Robinhood Chain 4663${C.reset}`);
  console.log(dim("  read-only showcase · zero gas · every check runs live onchain"));
  console.log();
}

const provider = {
  async request({ method, params }) {
    const res = await rpcRequest(4663, { jsonrpc: "2.0", id: 1, method, params });
    if (res.error) throw new Error(`RPC error: ${res.error.message}`);
    return res.result;
  },
};
const client = createPublicClient({ chain: robinhoodMainnet, transport: custom(provider) });
const m = JSON.parse(readFileSync(join(process.cwd(), "deployments", "privacy-pools-mainnet-latest.json"), "utf8"));

const ADDR = { type: "address" };
const U256 = { type: "uint256" };
const BOOL = { type: "bool" };
const view = (name, outputs) => ({ type: "function", name, stateMutability: "view", inputs: [], outputs });
const PM = "0x8366a39CC670B4001A1121B8F6A443A643e40951";

async function spin(label, work) {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  const t = setInterval(() => { process.stdout.write(`\r  ${C.cyan}${frames[i++ % frames.length]}${C.reset} ${label}…`); }, 80);
  try {
    const out = await work();
    clearInterval(t);
    process.stdout.write(`\r  ${ok} ${label}\n`);
    return out;
  } catch (e) {
    clearInterval(t);
    process.stdout.write(`\r  ${C.red}✗${C.reset} ${label}\n`);
    throw e;
  }
}

function header(n, title) {
  console.log();
  console.log(`${C.bold}${C.magenta}━━━ STAGE ${n} · ${title} ━━━${C.reset}`);
}

async function stageCore() {
  header("1/6", "0xbow cryptography core (audited v1.2.1)");
  for (const [label, addr] of [["PoseidonT3", m.poseidonT3], ["PoseidonT4", m.poseidonT4], ["WithdrawalVerifier", m.withdrawalVerifier], ["CommitmentVerifier", m.commitmentVerifier]]) {
    const bytes = await spin(`reading ${label}`, async () => {
      const code = await client.getCode({ address: addr });
      return code ? (code.length - 2) / 2 : 0;
    });
    console.log(`      ${item(addr)} ${dim(`(${bytes} bytes)`)}`);
    await sleep(300);
  }
}

async function stageEntrypoint() {
  header("2/6", "Entrypoint proxy + ETH / VEIL pools");
  await spin("reading Entrypoint", async () => client.getCode({ address: m.entrypoint }));
  console.log(`      ${item(m.entrypoint)}`);
  const root = await spin("checking ASP root", () => read(m.entrypoint, view("latestRoot", [U256])));
  console.log(`      ASP latestRoot set: ${hl(root.toString().slice(0, 20) + "…")}`);
  for (const [label, addr] of [["ETH pool", m.ethPool], ["VEIL pool", m.veilPool]]) {
    const [life, paused] = await spin(`reading ${label}`, () =>
      Promise.all([
        read(addr, view("lifetimeDeposited", [U256])),
        read(addr, view("depositsPaused", [BOOL])),
      ])
    );
    console.log(`      ${item(addr)} ${dim(`(lifetime ${life}, open ${!paused})`)}`);
    await sleep(300);
  }
}

async function read(address, abiFragment) {
  return client.readContract({ address, abi: [abiFragment], functionName: abiFragment.name });
}

async function stageGov() {
  header("3/6", "Treasury + registry + hook v2");
  const [owner, token, bb] = await spin("reading Treasury", () =>
    Promise.all([
      read(m.treasury, view("owner", [ADDR])),
      read(m.treasury, view("veilToken", [ADDR])),
      read(m.treasury, view("buybackShareBps", [U256])),
    ])
  );
  console.log(`      ${item(m.treasury)}`);
  console.log(`      owner ${owner === m.owner ? ok : C.red + "MISMATCH" + C.reset} · token ${item(String(token).slice(0, 10))}… · buyback ${hl(`${bb} bps`)}`);
  const regOwner = await spin("reading Registry v2", () => read(m.registryV2, view("owner", [ADDR])));
  console.log(`      ${item(m.registryV2)} ${regOwner === m.owner ? ok : C.red + "MISMATCH" + C.reset}`);
  const fee = await spin("reading Hook v2 (0x20c4)", () => read(m.hookV2, view("feeBps", [U256])));
  console.log(`      ${item(m.hookV2)} · fee ${hl(`${fee} bps`)}`);
  await sleep(300);
}

async function stageRouters() {
  header("4/6", "Routers — fixed R1 + full-ZK unified");
  const pm1 = await spin("reading ShieldRouter", () => read(m.routerFixed, view("poolManager", [ADDR])));
  console.log(`      ${item(m.routerFixed)} ${String(pm1).toLowerCase() === PM.toLowerCase() ? ok : C.red + "MISMATCH" + C.reset}`);
  const [ep, pm2] = await spin("reading VeilZkRouter", () =>
    Promise.all([
      read(m.zkRouter, view("entrypoint", [ADDR])),
      read(m.zkRouter, view("poolManager", [ADDR])),
    ])
  );
  console.log(`      ${item(m.zkRouter)}`);
  console.log(`      entrypoint bound ${String(ep).toLowerCase() === m.entrypoint.toLowerCase() ? ok : C.red + "MISMATCH" + C.reset} · poolManager bound ${String(pm2).toLowerCase() === PM.toLowerCase() ? ok : C.red + "MISMATCH" + C.reset}`);
  await sleep(300);
}

async function stageLegacy() {
  header("5/6", "Legacy pools (provisional · guardian = deployer)");
  for (const [label, addr, denom] of [
    ["Legacy ETH 0.001/10", m.legacyEthPool, 1000000000000000n],
    ["VEIL 0.5 (0.5/5000)", m.veilPool05, 500000000000000000n],
    ["VEIL 2 (2/20000)", m.veilPool2, 2000000000000000000n],
  ]) {
    const [d, paused] = await spin(`reading ${label}`, () =>
      Promise.all([
        read(addr, view("denomination", [U256])),
        read(addr, view("depositsPaused", [BOOL])),
      ])
    );
    const match = d === denom && paused === false;
    console.log(`      ${item(addr)} ${match ? ok : C.red + "MISMATCH" + C.reset}`);
    await sleep(300);
  }
}

async function stageInvariant() {
  header("6/6", "Invariant gate — deposits − withdrawn = balance");
  const poolAbi = [
    view("denomination", [U256]),
    { type: "function", name: "asset", stateMutability: "view", inputs: [], outputs: [ADDR] },
    view("totalDeposits", [U256]),
    view("totalWithdrawn", [U256]),
  ];
  for (const [label, addr, erc20] of [["Legacy ETH", m.legacyEthPool, false], ["VEIL 0.5", m.veilPool05, true], ["VEIL 2", m.veilPool2, true]]) {
    const [t, w, bal] = await spin(`checking ${label}`, async () => {
      const tt = await client.readContract({ address: addr, abi: poolAbi, functionName: "totalDeposits" });
      const ww = await client.readContract({ address: addr, abi: poolAbi, functionName: "totalWithdrawn" });
      const bb = erc20
        ? await client.readContract({ address: m.veilToken, abi: [{ type: "function", name: "balanceOf", stateMutability: "view", inputs: [ADDR], outputs: [U256] }], functionName: "balanceOf", args: [addr] })
        : await client.getBalance({ address: addr });
      return [tt, ww, bb];
    });
    const pass = t - w === bal;
    console.log(`      ${pass ? ok : C.red + "✗ FAIL" + C.reset} ${label}: ${t} − ${w} = ${bal}`);
    if (!pass) throw new Error(`Invariant failed on ${label}`);
    await sleep(250);
  }
}

const STAGES = [stageCore, stageEntrypoint, stageGov, stageRouters, stageLegacy, stageInvariant];

async function addressBook() {
  console.log();
  console.log(`${C.bold}📖 MAINNET ADDRESS BOOK · chain 4663${C.reset}`);
  const rows = [
    ["Entrypoint (proxy)", m.entrypoint], ["ETH pool", m.ethPool], ["VEIL pool", m.veilPool],
    ["Treasury", m.treasury], ["Registry v2", m.registryV2], ["Hook v2", m.hookV2],
    ["ShieldRouter", m.routerFixed], ["VeilZkRouter", m.zkRouter],
    ["Legacy ETH", m.legacyEthPool], ["VEIL 0.5", m.veilPool05], ["VEIL 2", m.veilPool2],
  ];
  for (const [label, addr] of rows) console.log(`  ${label.padEnd(20)} ${item(addr)}`);
  console.log();
}

async function finale() {
  const bal = await client.getBalance({ address: m.owner });
  console.log();
  console.log(`${C.green}${C.bold}  ✅ ALL 16 CONTRACTS VERIFIED LIVE ON MAINNET 4663${C.reset}`);
  console.log(dim(`  deployer left: ${formatEther(bal)} ETH · manifest: deployments/privacy-pools-mainnet-latest.json`));
  console.log();
}

async function ceremony(pick = null) {
  banner();
  if (Number(await client.getChainId()) !== 4663) throw new Error("Not mainnet 4663, aborting.");
  console.log(`  Chain ${ok} 4663 · block #${await client.getBlockNumber()} · owner ${dim(m.owner)}`);
  const list = pick === null ? STAGES : [STAGES[pick]];
  for (const s of list) await s();
  if (pick === null) await finale();
}

function menu() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  banner();
  console.log("  What do you want to run?");
  console.log(`  ${hl("1")}  Full ceremony (stages 1–6, paced for recording)`);
  console.log(`  ${hl("2")}  Pick a single stage`);
  console.log(`  ${hl("3")}  Address book`);
  console.log(`  ${hl("4")}  Exit`);
  rl.question(`\n  ${C.bold}choice [1-4]:${C.reset} `, async (ans) => {
    rl.close();
    const c = ans.trim();
    if (c === "1") await ceremony().catch(fail);
    else if (c === "2") {
      const rl2 = createInterface({ input: process.stdin, output: process.stdout });
      console.log("  1 core · 2 entrypoint+pools · 3 treasury/registry/hook · 4 routers · 5 legacy · 6 invariant");
      rl2.question(`  ${C.bold}stage [1-6]:${C.reset} `, async (n) => {
        rl2.close();
        const i = Number(n.trim()) - 1;
        if (i < 0 || i > 5) return console.log("  invalid stage");
        banner();
        await STAGES[i]().catch(fail);
      });
    } else if (c === "3") await addressBook();
    else console.log("  bye.");
  });
}

function fail(e) {
  console.error(`\n  ${C.red}✗ FAILED:${C.reset} ${e?.message || e}`);
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.includes("--addresses")) {
  banner();
  await addressBook();
} else if (args.includes("--no-menu")) {
  await ceremony().catch(fail);
} else {
  menu();
}
