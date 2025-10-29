/**
 * TURK-20 BridgeListener
 * eTURK (Ethereum) <-> TURK (TURK-20 Chain) köprüsü
 * 
 * Görev:
 * - L1'de eTURK "Locked" eventini dinler -> L2'de TURK mint eder + lisans stake.
 * - L1'de eTURK "Unlocked" eventini dinler -> L2'de TURK burn eder.
 * - Fiyat farkı belirli eşiği aşarsa DEX üzerinden otomatik rebalance yapar.
 */

import { ethers } from "ethers";
import axios from "axios";

// ---- Ortam değişkenleri ----
const L1_RPC = process.env.L1_RPC || "https://mainnet.infura.io/v3/YOUR_KEY";
const L2_RPC = process.env.L2_RPC || "http://geth:8545";
const BRIDGE_GATE_ADDR = process.env.BRIDGE_GATE_ADDR || "";
const STAKE_MANAGER_ADDR = process.env.STAKE_MANAGER_ADDR || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

// ---- Provider ve signer ----
const l1 = new ethers.JsonRpcProvider(L1_RPC);
const l2 = new ethers.JsonRpcProvider(L2_RPC);
const walletL2 = new ethers.Wallet(PRIVATE_KEY, l2);

// ---- Contract arayüzleri (özet) ----
const bridgeAbi = [
  "event Locked(address indexed user,uint256 amount)",
  "event Unlocked(address indexed user,uint256 amount)"
];
const stakeAbi = [
  "function stakeFor(address user,uint256 amount) external"
];
const bridgeGateAbi = [
  "function mintTURK(address to,uint256 amount) external",
  "function burnTURK(address from,uint256 amount) external"
];

const bridgeL1 = new ethers.Contract(BRIDGE_GATE_ADDR, bridgeAbi, l1);
const stakeMgr = new ethers.Contract(STAKE_MANAGER_ADDR, stakeAbi, walletL2);
const bridgeL2 = new ethers.Contract(BRIDGE_GATE_ADDR, bridgeGateAbi, walletL2);

// ---- Fiyat izleme parametreleri ----
const PRICE_API = "https://api.coingecko.com/api/v3/simple/price?ids=turk,ethereum&vs_currencies=usd";
const REBALANCE_THRESHOLD = 0.05; // %5 fark toleransı

// ---- Event dinleyiciler ----
bridgeL1.on("Locked", async (user, amount) => {
  try {
    console.log(`[Bridge] ${user} eTURK kilitledi → ${amount}`);
    // L2'de mint ve stake lisansı
    const tx1 = await bridgeL2.mintTURK(user, amount);
    await tx1.wait();
    console.log("TURK mint edildi.");

    // 10 TURK lisans eşiğini geçtiyse stake işlemi
    const minLicense = ethers.parseEther("10");
    if (amount >= minLicense) {
      const tx2 = await stakeMgr.stakeFor(user, minLicense);
      await tx2.wait();
      console.log(`Kullanıcıya lisans stake edildi (${user}).`);
    }
  } catch (err) {
    console.error("Bridge mint hatası:", err);
  }
});

bridgeL1.on("Unlocked", async (user, amount) => {
  try {
    console.log(`[Bridge] ${user} eTURK çözdü → ${amount}`);
    const tx = await bridgeL2.burnTURK(user, amount);
    await tx.wait();
    console.log("TURK burn edildi.");
  } catch (err) {
    console.error("Bridge burn hatası:", err);
  }
});

// ---- Fiyat farkı izleme (rebalance) ----
async function monitorPrices() {
  try {
    const res = await axios.get(PRICE_API);
    const turkUSD = res.data.turk.usd;
    const ethUSD = res.data.ethereum.usd;
    const diff = Math.abs(turkUSD - ethUSD) / ethUSD;
    if (diff > REBALANCE_THRESHOLD) {
      console.log(`⚠️ Fiyat farkı ${Math.round(diff * 100)}% → Rebalance başlat`);
      // burada DEX API veya on-chain otomatik swap çağrısı yapılır
      // örnek: await rebalanceOnDex();
    }
  } catch (err) {
    console.error("Fiyat kontrol hatası:", err.message);
  }
}

setInterval(monitorPrices, 60_000); // her 1 dakikada fiyat farkı kontrol et
console.log("TURK-20 BridgeListener aktif ✅");
