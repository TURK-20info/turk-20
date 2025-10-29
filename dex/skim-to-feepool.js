/**
 * TURK-20 DEX → FeePool gelir aktarım scripti
 * 
 * Amaç:
 * - DEX'teki swap, trade veya pool fee gelirlerinin %1'ini
 *   otomatik olarak FeePool (GasSponsor kontratı) bakiyesine aktarmak.
 * - Sistem sürdürülebilir, şeffaf ve kendini besleyen bir ekonomi yaratır.
 */

import { ethers } from "ethers";

// ---- Ortam değişkenleri ----
const RPC_URL = process.env.RPC_URL || "http://geth:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const DEX_ROUTER_ADDR = process.env.DEX_ROUTER_ADDR || "";
const FEEPOOL_ADDR = process.env.FEEPOOL_ADDR || "";
const INTERVAL_MIN = process.env.INTERVAL_MIN || 10; // dakikada bir kontrol

// ---- Blockchain bağlantısı ----
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// ---- DEX ve FeePool arayüzleri ----
const dexRouterAbi = [
  "function skim(address to) external",       // UniswapV2 tarzı gelir temizleme
  "function feeBalance() view returns (uint256)"
];
const feePoolAbi = [
  "function deposit() external payable"
];

const dex = new ethers.Contract(DEX_ROUTER_ADDR, dexRouterAbi, wallet);
const feePool = new ethers.Contract(FEEPOOL_ADDR, feePoolAbi, wallet);

async function skimAndDeposit() {
  try {
    // 1️⃣ DEX’ten mevcut fee bakiyesini oku
    const balance = await dex.feeBalance();
    const onePercent = balance / 100n;
    if (onePercent === 0n) {
      console.log("Fee bakiyesi düşük, bekleniyor...");
      return;
    }

    console.log(`DEX Fee Bakiyesi: ${ethers.formatEther(balance)} TURK → %1 = ${ethers.formatEther(onePercent)} TURK`);

    // 2️⃣ DEX’ten FeePool’a %1 aktar
    const tx1 = await dex.skim(wallet.address);
    await tx1.wait();

    // 3️⃣ Alınan tutarı FeePool’a yatır
    const tx2 = await feePool.deposit({ value: onePercent });
    await tx2.wait();

    console.log(`✅ ${ethers.formatEther(onePercent)} TURK FeePool'a aktarıldı.`);
  } catch (err) {
    console.error("Gelir aktarımı hatası:", err.message);
  }
}

// ---- Periyodik çalıştırma ----
console.log(`TURK-20 DEX gelir aktarımı başladı (her ${INTERVAL_MIN} dk'da bir)`);
setInterval(skimAndDeposit, INTERVAL_MIN * 60 * 1000);
