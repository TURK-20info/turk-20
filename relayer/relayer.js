/**
 * TURK-20 Gas Sponsor Relayer (örnek yapı)
 * Kullanıcıdan gelen imzalı isteği zincire gönderir ve gas'ı FeePool'dan karşılar.
 */

import ethers from "ethers";
import express from "express";

const app = express();
app.use(express.json());

// --- Ortam değişkenleri ---
const RPC_URL = process.env.RPC_URL || "http://geth:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const GASSPONSOR_ADDR = process.env.GASSPONSOR_ADDR || "";
const PORT = process.env.PORT || 8080;

// --- Blockchain bağlantısı ---
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// --- GasSponsor arayüzü (özet ABI) ---
const gasSponsorAbi = [
  "function sponsorCall(bytes calldata forwardRequest, bytes calldata signature) external payable",
];
const gasSponsor = new ethers.Contract(GASSPONSOR_ADDR, gasSponsorAbi, wallet);

// --- Health kontrol ---
app.get("/", (_, res) => {
  res.send("TURK-20 Relayer aktif ✅");
});

// --- Sponsor çağrısı endpoint'i ---
app.post("/relay", async (req, res) => {
  try {
    const { forwardRequest, signature } = req.body;
    if (!forwardRequest || !signature)
      return res.status(400).json({ error: "Eksik parametre" });

    console.log("Yeni sponsor işlem:", wallet.address);

    const tx = await gasSponsor.sponsorCall(forwardRequest, signature, {
      gasLimit: 3_000_000,
    });

    await tx.wait();
    res.json({ ok: true, txHash: tx.hash });
  } catch (err) {
    console.error("Relayer hatası:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- Sunucu başlat ---
app.listen(PORT, () => {
  console.log(`TURK-20 Relayer çalışıyor → http://localhost:${PORT}`);
});
