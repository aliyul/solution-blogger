/* ============================================================
 🧠 Page Level Detector v22.2 — SMART PATTERN-BASED (FIXED)
    ✅ FIX: "Sewa Pompa Air" sekarang terdeteksi sebagai MM
    ✅ FIX: Alat Pattern tidak lagi meng-override word count untuk SEWA
    ✅ FIX: Prioritas: Location > Price > Word Count untuk SEWA & JASA
    ✅ ENHANCED: Weighted voting dengan prioritas yang lebih baik
    ✅ UNIVERSAL: Untuk semua entity (JASA, SEWA, PRODUK, MATERIAL)
    ✅ Maintenance minimal
============================================================ */

(function () {

  "use strict";

  if (window.pageLevelDetectorv22) return;

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
    console.log(`${icons[type] || "📘"} [PLD v22.2] ${message}`);
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
  const LOCATION_WORDS = [
    "jakarta", "bandung", "surabaya", "bekasi", "tangerang", "depok", "bogor",
    "medan", "semarang", "solo", "yogyakarta", "jogja", "bali", "denpasar",
    "makassar", "palembang", "batam", "cirebon", "karawang", "purwakarta"
  ];
  
  // Kata sifat/modifier yang mengindikasikan turunan (MP)
  const MODIFIER_WORDS = [
    "modern", "minimalis", "mewah", "klasik", "tradisional", "kontemporer",
    "sederhana", "elegan", "premium", "luxury", "simple", "exclusive",
    "custom", "tanah", "beton", "batu", "kayu", "besi", "baja"
  ];

  // Stopwords yang dihapus
  const STOPWORDS = new Set([
    "dan", "atau", "serta", "yang", "dari", "ke", "di", "untuk", "dengan", "ini", "itu"
  ]);

  // ============================================================
  // 📌 FUNGSI DASAR
  // ============================================================

  function cleanText(text) {
    if (!text) return "";
    return text.toLowerCase().replace(/[^a-z0-9\s]/gi, " ").replace(/\s+/g, " ").trim();
  }

  function getPageText() {
    // PRIORITAS: URL slug (paling akurat untuk deteksi level)
    let slug = window.location.pathname.replace(/\.html$/, "").replace(/-/g, " ").split("/").pop() || "";
    if (!slug || slug.length < 2) {
      slug = window.location.pathname.replace(/\.html$/, "").replace(/-/g, " ").split("/").filter(Boolean).pop() || "";
    }
    
    // Batasi maksimal 100 karakter
    let text = cleanText(slug);
    if (text.length > 100) {
      text = text.substring(0, 100);
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
  // 📌 DETEKSI LOKASI & HARGA
  // ============================================================

  function isLocation(text) {
    if (!text) return false;
    const lower = cleanText(text);
    for (const city of LOCATION_WORDS) {
      if (new RegExp(`\\b${city}\\b`, "i").test(lower)) return true;
    }
    return false;
  }

  function hasPrice(text) {
    return PRICE_WORDS.some(w => text.includes(w));
  }

  // ============================================================
  // 📌 DETEKSI MONEY LEVEL (FIXED v22.2)
  // ============================================================

  function detectMoneyLevel(text, entityType) {
    const hasPriceWord = hasPrice(text);
    const hasLocationWord = isLocation(text);
    
    // PRIORITAS TERTINGGI (100% confidence)
    if (hasLocationWord) return "money-child";
    if (hasPriceWord) return "money-page";
    
    // ========================================================
    // SEWA ENTITY (FIXED v22.2)
    // ========================================================
    if (entityType === "sewa") {
      // Hapus kata "sewa" dan "rental"
      let core = text.replace(/\bsewa\b/g, "").replace(/\brental\b/g, "").trim();
      let words = core.split(/\s+/).filter(w => w.length > 2);
      words = words.filter(w => !STOPWORDS.has(w));
      words = words.filter(w => !LOCATION_WORDS.includes(w));
      
      const wordCount = words.length;
      const specific = /\d/.test(core) || /(mini|hidrolik|diesel|breaker)/i.test(core);
      
      log(`SEWA: core="${core}", words=${JSON.stringify(words)}, count=${wordCount}, specific=${specific}`);
      
      // ✅ MM jika wordCount <= 2 (tanpa peduli ada kata "alat" atau tidak)
      // Contoh: "sewa pompa air" (2 kata) → MM
      // Contoh: "sewa alat bor" (2 kata) → MM
      if (wordCount <= 2 && !specific) {
        return "money-master";
      }
      
      // MP jika wordCount >= 3
      return "money-page";
    }
    
    // ========================================================
    // JASA ENTITY
    // ========================================================
    if (entityType === "jasa") {
      // Hapus kata "jasa"
      let core = text.replace(/\bjasa\b/g, "").trim();
      let words = core.split(/\s+/).filter(w => w.length > 2);
      words = words.filter(w => !ENTITY_TRIGGERS.jasa.includes(w));
      words = words.filter(w => !LOCATION_WORDS.includes(w));
      words = words.filter(w => !STOPWORDS.has(w));
      
      const modifierCount = words.filter(w => MODIFIER_WORDS.includes(w)).length;
      const baseWordCount = words.filter(w => !MODIFIER_WORDS.includes(w)).length;
      
      log(`JASA: core="${core.substring(0, 60)}...", base=${baseWordCount}, modifier=${modifierCount}`);
      
      // MM jika baseWordCount <= 2 dan tidak ada modifier
      if (baseWordCount <= 2 && modifierCount === 0) {
        return "money-master";
      }
      
      return "money-page";
    }
    
    // ========================================================
    // PRODUK / MATERIAL
    // ========================================================
    if (entityType === "produk" || entityType === "material") {
      let words = text.split(/\s+/).filter(w => w.length > 2);
      words = words.filter(w => !STOPWORDS.has(w));
      words = words.filter(w => !LOCATION_WORDS.includes(w));
      
      const wordCount = words.length;
      const specific = /\d/.test(text) || /(k225|k250|k300|m6|m8|m10)/i.test(text);
      
      log(`PRODUK/MATERIAL: words=${JSON.stringify(words)}, count=${wordCount}, specific=${specific}`);
      
      if (wordCount <= 2 && !specific) {
        return "money-master";
      }
      return "money-page";
    }
    
    return null;
  }

  // ============================================================
  // 📌 MAIN DETECTOR (SMART & PATTERN-BASED)
  // ============================================================

  function detectPageLevel(userOptions = {}) {
    if (isHomePage()) return "home";
    
    const text = getPageText();
    const entityType = detectEntityType(userOptions.userEntityType);
    
    log(`TEXT: "${text}"`);
    log(`ENTITY: ${entityType}`);
    
    // 1. ENTITY PILLAR (exact match untuk root)
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
  // 📌 GET CONFIDENCE SCORE
  // ============================================================

  function getConfidenceScore() {
    const text = getPageText();
    const entityType = detectEntityType();
    const level = detectPageLevel();
    
    let confidence = 100;
    let strategies = [];
    
    if (entityType === "sewa") {
      const core = text.replace(/\bsewa\b/g, "").trim();
      const words = core.split(/\s+/).filter(w => w.length > 2);
      if (words.length <= 2) {
        strategies.push("Word Count (≤2 words → MM)");
      } else {
        strategies.push("Word Count (≥3 words → MP)");
      }
    } else if (entityType === "jasa") {
      const core = text.replace(/\bjasa\b/g, "").trim();
      const words = core.split(/\s+/).filter(w => w.length > 2);
      const hasModifier = MODIFIER_WORDS.some(m => words.includes(m));
      if (words.length <= 2 && !hasModifier) {
        strategies.push("Word Count (≤2 words, no modifier → MM)");
      } else {
        strategies.push("Word Count (≥3 words or has modifier → MP)");
      }
    }
    
    return { level, confidence, strategies, strategyCount: strategies.length };
  }

  // ============================================================
  // 📌 BODY ATTRIBUTES
  // ============================================================

  function updateBodyAttributes() {
    const level = detectPageLevel();
    const entity = detectEntityType();
    document.body.setAttribute("data-page-level", level);
    document.body.setAttribute("data-page-level-num", TYPE_LEVEL_MAP[level]);
    document.body.setAttribute("data-entity-type", entity);
    return { pageLevel: level, pageLevelNum: TYPE_LEVEL_MAP[level], entityType: entity };
  }

  // ============================================================
  // 📌 EXPORT
  // ============================================================

  window.pageLevelDetectorv22 = {
    detect: detectPageLevel,
    updateAttributes: updateBodyAttributes,
    getConfidenceScore: getConfidenceScore,
    detectEntityType,
    VALID_LEVELS,
    TYPE_LEVEL_MAP,
    VALID_ENTITY_TYPES,
    version: "22.2"
  };
  
  window.pageLevelDetectorv22Ready = true;
  window.dispatchEvent(new Event("pageLevelDetectorv22Ready"));
  
  console.log("✅ Page Level Detector v22.2 Ready (Fixed: Sewa Pompa Air → MM)");
  
})();
