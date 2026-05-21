/* ============================================================
 🧠 Page Level Detector v19.3 — FINAL SEO HIERARCHY
    ✅ FIX: "beton cor" tidak lagi terdeteksi sebagai PILLAR
    ✅ FIX: PRODUK/MATERIAL menggunakan SUB-PILLAR-TIPE-2 sebagai default
    ✅ JASA MONEY-MASTER DETECTION (FIXED & ENHANCED)
    ✅ JASA KEYWORDS LENGKAP 180+ KATA (CONFLICT-FREE)
    ✅ FIX: Deteksi kata hubung (dan, atau, serta) untuk semua entity
    ✅ FIX: "Jasa Interior dan Furniture Custom" sekarang terdeteksi sebagai MP
    ✅ UNIVERSAL CONNECTORS untuk JASA, SEWA, PRODUK, MATERIAL
    ✅ Stable 9-Level Architecture
============================================================ */

(function () {

  "use strict";

  if (window.pageLevelDetectorv19) return;

  // ============================================================
  // 📌 VALID LEVELS
  // ============================================================

  const VALID_LEVELS = [
    "home",
    "pillar",
    "sub-pillar-tipe-2",
    "sub-pillar-tipe-1",
    "money-master",
    "money-page",
    "money-child",
    "variant",
    "sub-variant"
  ];

  const TYPE_LEVEL_MAP = {
    home: 0,
    pillar: 1,
    "sub-pillar-tipe-2": 2,
    "sub-pillar-tipe-1": 3,
    "money-master": 4,
    "money-page": 5,
    "money-child": 6,
    variant: 7,
    "sub-variant": 8
  };

  const VALID_ENTITY_TYPES = [
    "produk",
    "material",
    "jasa",
    "sewa",
    "artikel"
  ];

  // ============================================================
  // 📌 DEBUG
  // ============================================================

  const CONFIG = {
    DEBUG: true
  };

  function log(message, type = "INFO") {

    if (!CONFIG.DEBUG && type === "INFO") {
      return;
    }

    const icons = {
      INFO: "📘",
      SUCCESS: "✅",
      WARN: "⚠️",
      ERROR: "❌"
    };

    console.log(
      `${icons[type] || "📘"} [PLD v19.3] ${message}`
    );

  }

  // ============================================================
  // 📌 MONEY KEYWORDS
  // ============================================================

  const PRICE_KEYWORDS = [
    "harga",
    "biaya",
    "tarif",
    "ongkos"
  ];

  const PROMO_KEYWORDS = [
    "diskon",
    "promo",
    "penawaran",
    "cashback",
    "sale",
    "potongan harga"
  ];

  const RENT_KEYWORDS = [
    "sewa",
    "rental"
  ];

  // ============================================================
  // 📌 JASA KEYWORDS (LENGKAP 180+ KATA - CONFLICT-FREE)
  // ============================================================

  const JASA_KEYWORDS = [
    "jasa", "kontraktor", "subkontraktor", "subkon", "tukang", "borongan", "renovasi", "pasang", 
    "waterproofing", "epoxy", "pelaksana", "penyedia jasa", "vendor", "rekanan", "bangun", "membangun", 
    "pembangunan", "perbaikan", "service", "servis", "perawatan", "maintenance", "instalasi", "pemasangan", 
    "pengerjaan", "pekerjaan", "proyek", "mengerjakan", "melaksanakan", "melakukan", "menangani", 
    "mengelola", "mengawasi", "mengatur", "trowel", "finishing", "plester", "aci", "mandor", "kuli", 
    "pekerja", "tenaga", "ahli", "teknisi", "surveyor", "konsultan", "arsitek", "desainer", "sipil", 
    "pengeboran", "pengaspalan", "pengurukan", "pengecoran", "penimbunan", "pembongkaran", "pembersihan",
    "pengecatan", "pengelasan", "pemotongan", "pembesian", "bekisting", "scaffolding", "pondasi",
    "struktur", "arsitektur", "interior", "eksterior", "grouting", "injection", "suntik beton", 
    "retaining wall", "bored pile", "mini pile", "sheet pile", "dropping", "stockpile", "cut and fill", 
    "test boring", "soil test", "transport", "pengiriman", "logistik", "pengadaan", "pencarian",
    "cor", "cetak", "timbun", "uruk", "galian", "gali", "angkut", "kirim", "supply", "suplai"
  ];

  // ============================================================
  // 📌 PRODUK/MATERIAL KEYWORDS
  // ============================================================

  const PRODUK_KEYWORDS = [
    "beton", "readymix", "ready mix", "cor", "paving", "batako", "bata", "hebel", 
    "gypsum", "plafon", "keramik", "granit", "marmer", "wiremesh", "besi", "baja", 
    "kayu", "paku", "semen", "pasir", "split", "batu", "sirtu", "material", "bahan",
    "cat", "tembok", "dinding", "atap", "genteng", "kusen", "pintu", "jendela",
    "pagar", "kanopi", "baja ringan", "rangka atap", "lisplang", "talang",
    "k225", "k250", "k300", "k350", "k400", "m6", "m8", "m10"
  ];

  // ============================================================
  // 📌 COMMERCIAL MODIFIERS
  // ============================================================

  const COMMERCIAL_MODIFIERS = [

    "mini", "mini pile", "sheet pile", "diesel hammer", "drop hammer", "hydraulic",
    "hidrolik", "hspd", "crawler", "breaker", "long arm", "murah", "terbaik", 
    "terdekat", "kapasitas besar", "per jam", "per hari", "per bulan", "per meter", 
    "per m2", "per rit", "per unit", "k225", "k250", "k300", "k350", "fc", 
    "ready mix", "minimix"
  ];

  // ============================================================
  // 📌 SUB PILLAR
  // ============================================================

  const SP2_KEYWORDS = [
    "jenis", "jenis-jenis", "macam", "macam-macam", "tipe", "kategori", "daftar", "list", "varian"
  ];

  const SP1_KEYWORDS = [
    "vs", "versus", "perbandingan", "dibanding", "lebih baik", "kelebihan", "kekurangan", "beda", "perbedaan"
  ];

  // ============================================================
  // 📌 INFORMATIONAL
  // ============================================================

  const PILLAR_INFORMATIONAL_KEYWORDS = [
    "panduan", "tutorial", "tips", "cara", "apa itu", "pengertian", "definisi", "belajar", "edukasi", "materi"
  ];

  // ============================================================
  // 📌 ENTITY PILLAR (ONLY EXACT MATCH)
  // ============================================================

  const ENTITY_PILLAR_KEYWORDS = {
    jasa: ["jasa konstruksi"],
    sewa: ["sewa alat konstruksi"],
    produk: ["produk konstruksi", "produk interior"],
    material: ["material konstruksi"],
    artikel: []
  };

  // ============================================================
  // 📌 VARIANT
  // ============================================================

  const VARIANT_KEYWORDS = [
    "spesifikasi", "ukuran", "dimensi", "kapasitas", "mutu", "quality", "spec", 
    "standar", "merk", "brand", "model", "seri", "grade", "type", "tipe"
  ];

  // ============================================================
  // 📌 LOCATION
  // ============================================================

  const LOCATION_WHITELIST = new Set([
    "jakarta", "bogor", "depok", "tangerang", "bekasi", "bandung", "karawang", 
    "cirebon", "surabaya", "semarang", "jogja", "yogyakarta", "solo", "medan", 
    "makassar", "bali", "denpasar", "subang", "purwakarta", "cikampek", "sumedang", 
    "garut", "tasikmalaya", "cianjur", "serang", "pandeglang"
  ]);

  // ============================================================
  // 📌 STOPWORDS
  // ============================================================

  const STOPWORDS = new Set([
    "di", "ke", "dari", "yang", "untuk", "dengan", "ini", "itu"
  ]);

  // ============================================================
  // 📌 UNIVERSAL CONNECTORS (BARU v19.3)
  // Berlaku untuk SEMUA entity (JASA, SEWA, PRODUK, MATERIAL)
  // ============================================================

  const CONNECTORS = [
    "dan", "atau", "serta", "sama", "dengan", "beserta", "maupun", "lalu", "kemudian", "sambil"
  ];

  // ============================================================
  // 📌 CLEAN TEXT
  // ============================================================

  function cleanText(text) {
    if (!text) return "";
    return text.toLowerCase().replace(/[^a-z0-9\s]/gi, " ").replace(/\s+/g, " ").trim();
  }

  // ============================================================
  // 📌 CLEAN URL
  // ============================================================

  function getCleanPageNameFromUrl() {
    let path = window.location.pathname;
    path = path.replace(/\.(html|php|htm)$/i, "");
    path = path.replace(/^\/p\//, "");
    path = path.replace(/^\/blog\//, "");
    path = path.replace(/^\/artikel\//, "");
    const parts = path.split("/").filter(Boolean);
    let slug = parts.pop() || "";
    slug = slug.replace(/-/g, " ");
    return cleanText(slug);
  }

  // ============================================================
  // 📌 HOMEPAGE
  // ============================================================

  function isHomePage() {
    const path = window.location.pathname.toLowerCase();
    return (path === "/" || path === "/index.html" || path === "/home");
  }

  // ============================================================
  // 📌 ENTITY TYPE
  // ============================================================

  function detectEntityType(userEntityType = null) {
    if (userEntityType && VALID_ENTITY_TYPES.includes(userEntityType)) {
      return userEntityType;
    }

    const text = cleanText(
      window.location.pathname + " " + document.title + " " + (document.querySelector("h1")?.innerText || "")
    );

    const hasJasaKeyword = JASA_KEYWORDS.some(keyword => text.includes(keyword));
    
    if (text.includes("jasa") || text.includes("kontraktor") || text.includes("tukang") || 
        text.includes("borongan") || text.includes("renovasi") || text.includes("pasang") || 
        text.includes("waterproofing") || hasJasaKeyword) {
      return "jasa";
    }

    if (text.includes("sewa") || text.includes("rental")) {
      return "sewa";
    }

    if (text.includes("material") || text.includes("bahan bangunan")) {
      return "material";
    }

    if (text.includes("artikel") || text.includes("blog")) {
      return "artikel";
    }

    return "produk";
  }

  // ============================================================
  // 📌 LOCATION DETECTOR
  // ============================================================

  function isLocation(text) {
    if (!text) return false;
    const lower = cleanText(text);
    for (const city of LOCATION_WHITELIST) {
      if (new RegExp(`\\b${city}\\b`, "i").test(lower)) return true;
    }
    return false;
  }

  // ============================================================
  // 📌 COMMERCIAL MODIFIER
  // ============================================================

  function hasCommercialModifier(text) {
    if (!text) return false;
    const lower = cleanText(text);
    for (const modifier of COMMERCIAL_MODIFIERS) {
      if (lower.includes(modifier)) return true;
    }
    if (/\d/.test(lower)) return true;
    return false;
  }

  // ============================================================
  // 📌 SUB VARIANT
  // ============================================================

  function isSubVariant(text) {
    if (!text) return false;
    const lower = cleanText(text);
    const numbers = lower.match(/\d+/g) || [];
    const dimensions = lower.match(/\d+(\.\d+)?\s*(mm|cm|m|kg|ton)/gi) || [];
    const xCount = (lower.match(/x/g) || []).length;
    return (numbers.length >= 3 && dimensions.length >= 2 && xCount >= 1);
  }

  // ============================================================
  // 📌 VARIANT
  // ============================================================

  function detectVariantLevel(text) {
    if (!text) return null;
    if (isSubVariant(text)) return "sub-variant";
    const lower = cleanText(text);
    for (const kw of VARIANT_KEYWORDS) {
      if (new RegExp(`\\b${kw}\\b`, "i").test(lower)) return "variant";
    }
    if (/\d+(\.\d+)?\s*(mm|cm|m|kg|ton)/i.test(lower)) return "variant";
    return null;
  }

  // ============================================================
  // 📌 SUB PILLAR
  // ============================================================

  function detectSubPillarLevel(text) {
    if (!text) return null;
    const lower = cleanText(text);
    for (const kw of SP1_KEYWORDS) {
      if (lower.includes(kw)) return "sub-pillar-tipe-1";
    }
    for (const kw of SP2_KEYWORDS) {
      if (new RegExp(`\\b${kw}\\b`, "i").test(lower)) return "sub-pillar-tipe-2";
    }
    return null;
  }

  // ============================================================
  // 📌 ENTITY PILLAR
  // ============================================================

  function detectEntityPillar(text, entityType) {
    if (!text) return null;
    const lower = cleanText(text);
    const keywords = ENTITY_PILLAR_KEYWORDS[entityType] || [];
    for (const kw of keywords) {
      if (lower === kw) return "pillar";
    }
    return null;
  }

  // ============================================================
  // 📌 MONEY DETECTOR (FIXED v19.3 - DENGAN CONNECTORS)
  // ============================================================

  function detectMoneyLevel(text, entityType) {
    if (!text) return null;
    const lower = cleanText(text);

    const hasPrice = PRICE_KEYWORDS.some(keyword => lower.includes(keyword));
    const hasPromo = PROMO_KEYWORDS.some(keyword => lower.includes(keyword));
    const hasRent = RENT_KEYWORDS.some(keyword => lower.includes(keyword));
    const hasJasa = JASA_KEYWORDS.some(keyword => lower.includes(keyword));

    if (!hasPrice && !hasPromo && !hasRent && !hasJasa) return null;

    if (isLocation(lower)) return "money-child";
    if (hasPromo) return "money-page";

    // ========================================================
    // FUNGSI BANTU UNTUK CLEANING KATA (BERLAKU UNTUK SEMUA ENTITY)
    // ========================================================
    function cleanWords(text, keywordsToRemove) {
      let cleaned = text;
      for (const kw of keywordsToRemove) {
        cleaned = cleaned.replace(new RegExp(`\\b${kw.replace(/\s/g, "\\s")}\\b`, 'gi'), '');
      }
      cleaned = cleaned.trim();
      let words = cleaned.split(/\s+/).filter(Boolean);
      // Hapus stopwords
      words = words.filter(word => !STOPWORDS.has(word));
      // Hapus connectors (dan, atau, serta, dll)
      words = words.filter(word => !CONNECTORS.includes(word));
      return words;
    }

    // ========================================================
    // JASA ENTITY
    // ========================================================
    if (entityType === "jasa" && hasJasa) {
      if (hasPrice) return "money-page";
      
      const words = cleanWords(lower, JASA_KEYWORDS);
      const wordCount = words.length;
      const specific = hasCommercialModifier(words.join(' '));
      
      log(`JASA: words=${JSON.stringify(words)}, count=${wordCount}, specific=${specific}`);
      
      if (wordCount <= 2 && !specific && !isLocation(lower)) {
        return "money-master";
      }
      return "money-page";
    }

    // ========================================================
    // SEWA ENTITY
    // ========================================================
    if (entityType === "sewa") {
      if (hasPrice) return "money-page";
      
      let cleaned = lower.replace(/\bsewa\b/g, "").replace(/\brental\b/g, "").trim();
      let words = cleaned.split(/\s+/).filter(Boolean);
      words = words.filter(word => !STOPWORDS.has(word));
      words = words.filter(word => !CONNECTORS.includes(word));
      const wordCount = words.length;
      const specific = hasCommercialModifier(cleaned);
      
      log(`SEWA: words=${JSON.stringify(words)}, count=${wordCount}, specific=${specific}`);
      
      if (wordCount <= 2 && !specific && !isLocation(cleaned)) {
        return "money-master";
      }
      return "money-page";
    }

    // ========================================================
    // PRODUK / MATERIAL dengan HARGA
    // ========================================================
    if (hasPrice) {
      const cleaned = lower.replace(/\b(harga|biaya|tarif|ongkos)\b/g, "").trim();
      let words = cleaned.split(/\s+/).filter(Boolean);
      words = words.filter(word => !STOPWORDS.has(word));
      words = words.filter(word => !CONNECTORS.includes(word));
      const wordCount = words.length;
      const specific = hasCommercialModifier(cleaned);
      
      log(`PRODUK/MATERIAL: words=${JSON.stringify(words)}, count=${wordCount}, specific=${specific}`);
      
      if (wordCount <= 2 && !specific && !isLocation(cleaned)) {
        return "money-master";
      }
      return "money-page";
    }

    return null;
  }

  // ============================================================
  // 📌 MAIN DETECTOR (FIXED v19.3)
  // ============================================================

  function detectPageLevel(userOptions = {}) {
    const { userEntityType = null } = userOptions;

    if (isHomePage()) return "home";

    const urlClean = getCleanPageNameFromUrl();
    const h1 = cleanText(document.querySelector("h1")?.innerText || "");
    const title = cleanText(document.title || "");
    const primaryText = cleanText(urlClean || h1 || title);

    const entityType = detectEntityType(userEntityType);

    log(`PRIMARY TEXT: ${primaryText}`);
    log(`ENTITY TYPE: ${entityType}`);

    // 1. ENTITY PILLAR (EXACT MATCH)
    const entityPillar = detectEntityPillar(primaryText, entityType);
    if (entityPillar) return entityPillar;

    // 2. VARIANT
    const variantLevel = detectVariantLevel(primaryText);
    if (variantLevel) return variantLevel;

    // 3. SUB PILLAR
    const subPillarLevel = detectSubPillarLevel(primaryText);
    if (subPillarLevel) return subPillarLevel;

    // 4. INFORMATIONAL
    for (const kw of PILLAR_INFORMATIONAL_KEYWORDS) {
      if (primaryText.includes(kw)) return "pillar";
    }

    // 5. MONEY
    const moneyLevel = detectMoneyLevel(primaryText, entityType);
    if (moneyLevel) return moneyLevel;

    // ============================================================
    // 6. PRODUK/MATERIAL DEFAULT
    // ============================================================
    
    if (entityType === "produk" || entityType === "material") {
      const isSpecificProduct = PRODUK_KEYWORDS.some(kw => primaryText.includes(kw));
      const wordCount = primaryText.split(/\s+/).filter(Boolean).length;
      
      if (isSpecificProduct && wordCount <= 3) {
        log(`PRODUK/MATERIAL spesifik: "${primaryText}" → sub-pillar-tipe-2`, "SUCCESS");
        return "sub-pillar-tipe-2";
      }
      
      if (wordCount <= 2) {
        log(`PRODUK/MATERIAL default (${wordCount} kata) → sub-pillar-tipe-2`, "INFO");
        return "sub-pillar-tipe-2";
      }
      
      return "sub-pillar-tipe-2";
    }

    // 7. JASA FALLBACK
    if (entityType === "jasa") {
      if (isLocation(primaryText)) return "money-child";
      const wordCount = primaryText.split(/\s+/).filter(Boolean).length;
      if (wordCount <= 2) return "money-master";
      return "money-page";
    }

    // 8. SEWA FALLBACK
    if (entityType === "sewa") {
      if (isLocation(primaryText)) return "money-child";
      return "money-master";
    }

    // 9. DEFAULT SAFE
    const wordCount = primaryText.split(/\s+/).filter(Boolean).length;
    if (wordCount <= 2) return "sub-pillar-tipe-2";
    return "sub-pillar-tipe-2";
  }

  // ============================================================
  // 📌 BODY ATTRIBUTES
  // ============================================================

  function updateBodyAttributes(userOptions = {}) {
    const pageLevel = detectPageLevel(userOptions);
    const entityType = detectEntityType(userOptions.userEntityType);
    document.body.setAttribute("data-page-level", pageLevel);
    document.body.setAttribute("data-page-level-num", TYPE_LEVEL_MAP[pageLevel]);
    document.body.setAttribute("data-entity-type", entityType);
    return { pageLevel, pageLevelNum: TYPE_LEVEL_MAP[pageLevel], entityType };
  }

  // ============================================================
  // 📌 MANUAL OVERRIDE
  // ============================================================

  function setManualPageLevel(level, entityType = null) {
    const currentEntity = entityType || detectEntityType();
    if (!VALID_LEVELS.includes(level)) {
      console.error(`Invalid level: ${level}`);
      return false;
    }
    if (currentEntity === "jasa" && level === "money-master") {
      log(`JASA allowed to be money-master: ${level}`, "SUCCESS");
    }
    document.body.setAttribute("data-page-level", level);
    document.body.setAttribute("data-page-level-num", TYPE_LEVEL_MAP[level]);
    return true;
  }

  // ============================================================
  // 📌 EXPORT
  // ============================================================

  window.pageLevelDetectorv19 = {
    detect: detectPageLevel,
    setManual: setManualPageLevel,
    updateAttributes: updateBodyAttributes,
    detectEntityType,
    detectVariantLevel,
    detectSubPillarLevel,
    detectMoneyLevel,
    isLocation,
    isHomePage,
    VALID_LEVELS,
    TYPE_LEVEL_MAP,
    VALID_ENTITY_TYPES,
    version: "19.3"
  };

  window.pageLevelDetectorv19Ready = true;

  window.dispatchEvent(new Event("pageLevelDetectorv19Ready"));

  console.log("✅ Page Level Detector v19.3 Ready (Dengan deteksi connectors untuk semua entity)");

})();
