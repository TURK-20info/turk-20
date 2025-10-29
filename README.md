# TURK-20 Blockchain Ağı 🩸

TURK-20 ağı; EVM uyumlu, şeffaf, güvenli ve gas-sponsor (lisans) modeline sahip
yerli blokzincir ağıdır.

## Ana Modüller
- **StakeManager.sol** — 10 / 100 / 1000 TURK stake = Free / Pro / Node lisans
- **FeeManager.sol** — Günlük ücretsiz işlem kotası
- **GasSponsor.sol** — FeePool (sponsor gas sistemi)
- **NameRegistry.sol** — TC alias kayıt sistemi
- **BridgeGate.sol** — eTURK ↔ TURK köprü
- **Relayer & BridgeListener** — zincirler arası köprü ve sponsor işlemler
- **DEX** — tam şeffaflık, likidite yönetimi, FeePool beslemesi

Her işlem zincir üstünde izlenebilir; 
FeePool ve likidite hareketleri blok explorer’da herkes tarafından görülebilir.
