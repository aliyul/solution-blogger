/* ============================================================
 🧠 Page Level Detector v20.2 — SMART PATTERN-BASED
    ✅ FIX: Batasi teks dari URL slug (hindari duplikasi)
    ✅ FIX: "jasa-finishing-interior" sekarang terdeteksi MM
    ✅ FIX: Hapus "interior" dan "eksterior" dari MODIFIER_WORDS
    ✅ TANPA keyword manual (kecuali minimal)
    ✅ Berbasis STRUKTUR dan POLA kalimat
    ✅ Maintenance minimal
============================================================ */

(function () {

  "use strict";

  if (window.pageLevelDetectorv20) return;

  // ============================================================
  // 📌 VALID LEVELS
  // ============================================================

  const VALID_LEVELS = [
    "home", "pillar", "sub-pillar-tipe-2", "sub-pillar-tipe-1",
    "money-master", "money-page", "money-child", "variant", "sub-variant"
  ];

  const TYPE_LEVEL_MAP = {
    home: 0, pillar: 1, "sub-pillar-tipe-2": 2, "sub-pillar-tipe-1": 3,
    "money-master": 4, "money-page": 5, "money-child": 6, variant: 7, "sub-variant": 8
  };

  const VALID_ENTITY_TYPES = ["produk", "material", "jasa", "sewa", "artikel"];

  // ============================================================
  // 📌 KONFIGURASI
  // ============================================================

  const CONFIG = { DEBUG: true };

  function log(message, type = "INFO") {
    if (!CONFIG.DEBUG && type === "INFO") return;
    const icons = { INFO: "📘", SUCCESS: "✅", WARN: "⚠️", ERROR: "❌" };
    console.log(`${icons[type] || "📘"} [PLD v20.2] ${message}`);
  }

  // ============================================================
  // 📌 KEYWORDS (MINIMAL, hanya untuk deteksi awal)
  // ============================================================

  const ENTITY_TRIGGERS = {
    jasa: ["jasa", "kontraktor", "tukang", "borongan", "renovasi", "pasang"],
    sewa: ["sewa", "rental"],
    material: ["material", "bahan"],
    artikel: ["artikel", "blog", "tips", "panduan"]
  };

  const PRICE_WORDS = ["harga", "biaya", "tarif", "ongkos"];
  const LOCATION_WORDS = ["jakarta", "bandung", "surabaya", "bekasi", "tangerang", "depok", "bogor"];
  
  // Hapus "interior" dan "eksterior" dari MODIFIER_WORDS
  const MODIFIER_WORDS = [
    "modern", "minimalis", "mewah", "klasik", "tradisional", "kontemporer",
    "sederhana", "elegan", "premium", "luxury", "simple", "exclusive",
    "custom", "tanah", "beton", "batu", "kayu", "besi", "baja"
  ];

  // ============================================================
  // 📌 FUNGSI DASAR (DIPERBAIKI v20.2)
  // ============================================================

  function cleanText(text) {
    if (!text) return "";
    return text.toLowerCase().replace(/[^a-z0-9\s]/gi, " ").replace(/\s+/g, " ").trim();
  }

  function getPageText() {
    // ✅ PRIORITAS: URL slug (paling akurat untuk deteksi level)
    let url = window.location.pathname.replace(/\.html$/, "").replace(/-/g, " ").split("/").pop() || "";
    
    // Jika URL slug kosong, ambil dari path
    if (!url || url.length < 2) {
      const path = window.location.pathname.replace(/\.html$/, "").replace(/-/g, " ").split("/").filter(Boolean);
      url = path.pop() || "";
    }
    
    // ✅ Batasi teks hanya dari URL (hindari duplikasi konten panjang)
    let text = cleanText(url);
    
    // ✅ Jika URL terlalu pendek (kurang dari 3 karakter), baru gunakan H1/Title
    if (text.length < 3) {
      const h1 = document.querySelector("h1")?.innerText || "";
      const title = document.title || "";
      text = cleanText(url + " " + h1 + " " + title);
    }
    
    // ✅ Batasi maksimal 100 karakter untuk deteksi
    if (text.length > 100) {
      text = text.substring(0, 100);
      log(`Text truncated to 100 chars: "${text}"`, "WARN");
    }
    
    return text;
  }

  function isHomePage() {
    const path = window.location.pathname.toLowerCase();
    return path === "/" || path === "/index.html" || path === "/home";
  }

  // ============================================================
  // 📌 DETEKSI ENTITY (BERDASARKAN TRIGGER)
  // ============================================================

  function detectEntityType(userEntityType = null) {
    if (userEntityType && VALID_ENTITY_TYPES.includes(userEntityType)) return userEntityType;
    
    const text = getPageText();
    
    for (const [entity, triggers] of Object.entries(ENTITY_TRIGGERS)) {
      if (triggers.some(t => text.includes(t))) return entity;
    }
    return "produk";
  }

  // ============================================================
  // 📌 DETEKSI SUB PILLAR (BERDASARKAN POLA)
  // ============================================================

  function detectSubPillarLevel(text) {
    if (/perbandingan|vs|versus|kelebihan|kekurangan|perbedaan/.test(text)) return "sub-pillar-tipe-1";
    if (/daftar|jenis|macam|kategori|tipe/.test(text)) return "sub-pillar-tipe-2";
    return null;
  }

  function detectVariantLevel(text) {
    if (/(\d+x\d+|\d+\s*(mm|cm|m|kg|ton))/i.test(text)) return "sub-variant";
    if (/spesifikasi|ukuran|dimensi|kapasitas|mutu|grade/.test(text)) return "variant";
    return null;
  }

  // ============================================================
  // 📌 DETEKSI MONEY LEVEL (CERDAS, TANPA KEYWORD MANUAL)
  // ============================================================

  function detectMoneyLevel(text, entityType) {
    const hasPrice = PRICE_WORDS.some(w => text.includes(w));
    const hasLocation = LOCATION_WORDS.some(w => text.includes(w));
    
    // Location priority
    if (hasLocation) return "money-child";
    if (hasPrice) return "money-page";
    
    // Untuk SEWA: tanpa harga
    if (entityType === "sewa") {
      let core = text.replace(/\bsewa\b/g, "").trim();
      let words = core.split(/\s+/).filter(w => w.length > 2 && !/[0-9]/.test(w));
      words = words.filter(w => !LOCATION_WORDS.includes(w));
      
      if (words.length <= 2) return "money-master";
      return "money-page";
    }
    
    // Untuk JASA: tanpa harga
    if (entityType === "jasa") {
      let core = text.replace(/\bjasa\b/g, "").trim();
      let words = core.split(/\s+/).filter(w => w.length > 2);
      words = words.filter(w => !ENTITY_TRIGGERS.jasa.includes(w));
      words = words.filter(w => !LOCATION_WORDS.includes(w));
      
      const modifierCount = words.filter(w => MODIFIER_WORDS.includes(w)).length;
      const baseWordCount = words.filter(w => !MODIFIER_WORDS.includes(w)).length;
      
      log(`JASA: core="${core.substring(0, 80)}...", words=${JSON.stringify(words.slice(0, 10))}..., base=${baseWordCount}, modifier=${modifierCount}`);
      
      if (baseWordCount <= 2 && modifierCount === 0) return "money-master";
      return "money-page";
    }
    
    // Untuk PRODUK/MATERIAL: tanpa harga
    if (entityType === "produk" || entityType === "material") {
      let words = text.split(/\s+/).filter(w => w.length > 2);
      if (words.length <= 2) return "money-master";
      return "money-page";
    }
    
    return null;
  }

  // ============================================================
  // 📌 MAIN DETECTOR
  // ============================================================

  function detectPageLevel(userOptions = {}) {
    if (isHomePage()) return "home";
    
    const text = getPageText();
    const entityType = detectEntityType(userOptions.userEntityType);
    
    log(`TEXT: ${text}`);
    log(`ENTITY: ${entityType}`);
    
    // 1. ENTITY PILLAR
    const pillarPatterns = {
      jasa: "jasa konstruksi",
      sewa: "sewa alat konstruksi",
      produk: "produk konstruksi",
      material: "material konstruksi"
    };
    if (text === pillarPatterns[entityType]) return "pillar";
    
    // 2. SUB PILLAR
    const subPillar = detectSubPillarLevel(text);
    if (subPillar) return subPillar;
    
    // 3. VARIANT
    const variant = detectVariantLevel(text);
    if (variant) return variant;
    
    // 4. MONEY
    const money = detectMoneyLevel(text, entityType);
    if (money) return money;
    
    // 5. DEFAULT
    return "sub-pillar-tipe-2";
  }

  // ============================================================
  // 📌 EXPORT
  // ============================================================

  function updateBodyAttributes() {
    const level = detectPageLevel();
    const entity = detectEntityType();
    document.body.setAttribute("data-page-level", level);
    document.body.setAttribute("data-page-level-num", TYPE_LEVEL_MAP[level]);
    document.body.setAttribute("data-entity-type", entity);
    return { pageLevel: level, pageLevelNum: TYPE_LEVEL_MAP[level], entityType: entity };
  }

  window.pageLevelDetectorv20 = {
    detect: detectPageLevel,
    updateAttributes: updateBodyAttributes,
    detectEntityType,
    VALID_LEVELS,
    TYPE_LEVEL_MAP,
    VALID_ENTITY_TYPES,
    version: "20.2"
  };
  
  window.pageLevelDetectorv20Ready = true;
  window.dispatchEvent(new Event("pageLevelDetectorv20Ready"));
  
  console.log("✅ Page Level Detector v20.2 Ready (Fixed text source: only URL slug, max 100 chars)");
  
})();
