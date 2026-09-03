/* ============================================================
 🧠 Page Level Detector v22.34 — PILLAR EXACT + TANPA DAFTAR
    ✅ FIX v22.34: PILLAR EXACT MATCH (hanya daftar PILLAR)
    ✅ FIX v22.34: SP2 (daftar/jenis/macam/kategori/tipe)
    ✅ FIX v22.34: SP1 (perbandingan/vs/kelebihan/kekurangan)
    ✅ FIX v22.34: Entity Lain (Jasa, Sewa, Material) - logika sama
    ✅ FIX v22.33: HAPUS SEMUA DAFTAR KATA (MONEY_MASTER_OVERRIDES)
    ✅ FIX v22.33: Deteksi base keyword otomatis (2 kata pertama)
    ✅ FIX v22.33: Deteksi tambahan kata → MP/MC
    ✅ FIX v22.33: Deteksi lokasi otomatis → MC
    ✅ FIX v22.33: Deteksi spesifikasi otomatis → MC
============================================================ */

(function () {

  "use strict";

  if (window.pageLevelDetectorv22) return;

  // ============================================================
  // 📌 KONFIGURASI
  // ============================================================

  const CONFIG = { DEBUG: true };

  function log(message, type = "INFO") {
    if (!CONFIG.DEBUG && type === "INFO") return;
    const icons = { INFO: "📘", SUCCESS: "✅", WARN: "⚠️", ERROR: "❌", LOCATION: "📍", VARIANT: "🔬", COMMERCIAL: "🛒", PRICE: "💰", MM: "🏛️", CORE: "🧠", DETECT: "🎯" };
    console.log(`${icons[type] || "📘"} [PLD v22.34] ${message}`);
  }

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

  // ============================================================
  // 📌 VALID ENTITY TYPES
  // ============================================================

  const VALID_ENTITY_TYPES = ["produk", "material", "jasa", "desain", "sewa", "artikel"];

  // ============================================================
  // 🔥 PILLAR NAMES (EXACT MATCH) — TIDAK BISA DIPAKAI LEVEL LAIN
  // ============================================================

  const PILLAR_NAMES = {
    jasa: ["jasa konstruksi"],
    desain: ["jasa desain interior"],
    sewa: ["sewa alat konstruksi", "rental alat konstruksi"],
    produk: ["produk konstruksi"],
    "produk interior": ["produk interior", "interior produk"],
    material: ["material konstruksi", "bahan konstruksi"],
    artikel: ["artikel konstruksi", "blog konstruksi", "tips konstruksi"]
  };

  // ============================================================
  // 📌 ENTITY TRIGGERS
  // ============================================================

  const ENTITY_TRIGGERS = {
    jasa: ["jasa", "kontraktor", "tukang", "borongan", "renovasi", "pasang", "bangun", "perbaikan", "instalasi", "service", "servis"],
    desain: ["desain", "interior", "arsitektur", "konsep", "rencana", "gambar", "denah"],
    sewa: ["sewa", "rental"],
    material: ["material", "bahan", "material bangunan"],
    produk: ["produk", "jual", "beli", "supplier", "distributor"],
    artikel: ["artikel", "blog", "tips", "panduan"]
  };

  const ENTITY_PRIORITY = ["jasa", "sewa", "desain", "produk", "material", "artikel"];

  // ============================================================
  // 🔥 LOCATION WORDS (OTOMATIS)
  // ============================================================
  const LOCATION_WORDS = [
    "jakarta", "jakarta pusat", "jakarta barat", "jakarta selatan", "jakarta timur", "jakarta utara",
    "bogor", "depok", "tangerang", "bekasi", "bandung", "karawang", "purwakarta", "cikarang",
    "subang", "cirebon", "semarang", "solo", "surakarta", "pekalongan", "tegal", "magelang",
    "sukoharjo", "boyolali", "klaten", "jogja", "yogyakarta", "surabaya", "malang", "kediri",
    "gresik", "sidoarjo", "mojokerto", "pasuruan", "probolinggo", "jember", "banyuwangi", "madiun",
    "medan", "palembang", "pekanbaru", "padang", "lampung", "batam", "aceh", "jambi", "bengkulu",
    "pontianak", "balikpapan", "samarinda", "banjarmasin", "makassar", "manado", "palu", "kendari",
    "bali", "denpasar", "gianyar", "tabanan", "bangli", "karangasem", "klungkung", "buleleng",
    "mataram", "kupang",
    "terdekat", "sekitar", "dekat", "near"
  ];

  // ============================================================
  // 🔥 SPECIFICATION WORDS (OTOMATIS)
  // ============================================================

  const SPECIFICATION_WORDS = {
    mutu: ["k225", "k250", "k300", "k350", "k400", "k500", "fc", "m6", "m8", "m10", "m12", "m16", "m20", "b0", "b1", "b2", "b3", "sni"],
    satuan: ["per meter", "per lembar", "per batang", "per kubik", "per unit", "per m", "per lbr", "per kg", "per ton", "per jam", "per hari", "per minggu", "per bulan"],
    finishing: ["polos", "motif", "bermotif", "bercorak", "tekstur", "serat", "halus", "kasar", "matte", "glossy", "doff", "gloss", "satin", "anyaman", "natural", "ekspos", "custom", "polosan"],
    dimensi: ["ukuran", "dimensi", "spesifikasi", "tipe", "model", "varian", "seri", "tinggi", "rendah", "panjang", "pendek", "lebar", "sempit", "tebal", "tipis", "dalam", "dangkal", "diameter", "radius"],
    metode: ["hidrolik", "manual", "auger", "rotary", "percussive", "dry", "wet", "basah", "kering", "coring", "cutting", "drilling", "pengeboran", "pemancangan", "pemasangan", "bongkar", "pasang", "potong", "las", "sambung", "metode", "teknik", "cara"],
    jasa: ["borongan", "harian", "mingguan", "bulanan", "kontrak", "proyek", "renovasi", "perbaikan", "pemasangan", "instalasi"],
    sewa: ["mini", "besar", "kecil", "sedang", "medium", "extra", "ekstra", "standar", "premium", "ekonomis"]
  };

  // Gabungkan semua spesifikasi
  const ALL_SPEC_WORDS = [];
  for (let category in SPECIFICATION_WORDS) {
    ALL_SPEC_WORDS.push(...SPECIFICATION_WORDS[category]);
  }

  // ============================================================
  // 🔥 PRICE WORDS
  // ============================================================
  const PRICE_WORDS = ["harga", "biaya", "tarif", "ongkos", "estimasi"];

  // ============================================================
  // 🔥 STOPWORDS
  // ============================================================
  const STOPWORDS = new Set(["dan", "atau", "serta", "yang", "dari", "ke", "di", "untuk", "dengan", "ini", "itu", "akan", "telah", "sudah", "masih", "pada", "oleh", "karena", "sehingga", "setelah", "sebelum"]);

  // ============================================================
  // 📌 FUNGSI DASAR
  // ============================================================

  function cleanText(text) {
    if (!text) return "";
    return text.toLowerCase().replace(/[^a-z0-9\s]/gi, " ").replace(/\s+/g, " ").trim();
  }

  function getPageText() {
    let slug = window.location.pathname.replace(/\.html$/, "").replace(/-/g, " ").split("/").pop() || "";
    if (!slug || slug.length < 2) {
      slug = window.location.pathname.replace(/\.html$/, "").replace(/-/g, " ").split("/").filter(Boolean).pop() || "";
    }
    let text = cleanText(slug);
    if (text.length > 100) text = text.substring(0, 100);
    return text;
  }

  function isHomePage() {
    const path = window.location.pathname.toLowerCase();
    return path === "/" || path === "/index.html" || path === "/home";
  }

  function detectEntityType(userEntityType = null) {
    if (userEntityType && VALID_ENTITY_TYPES.includes(userEntityType)) return userEntityType;
    const text = getPageText();
    const lower = text.toLowerCase();
    for (const entity of ENTITY_PRIORITY) {
      const triggers = ENTITY_TRIGGERS[entity] || [];
      if (triggers.some(t => lower.includes(t))) return entity;
    }
    if (lower.includes("jasa") || lower.includes("kontraktor") || lower.includes("tukang")) return "jasa";
    if (lower.includes("sewa") || lower.includes("rental")) return "sewa";
    if (lower.includes("desain") || lower.includes("interior")) return "desain";
    if (lower.includes("material") || lower.includes("bahan")) return "material";
    if (lower.includes("produk") || lower.includes("jual")) return "produk";
    return "produk";
  }

  function isLocation(text) {
    if (!text) return false;
    const lower = cleanText(text);
    for (const word of LOCATION_WORDS) {
      if (new RegExp(`\\b${word.replace(/\s+/g, '\\s+')}\\b`, "i").test(lower)) return true;
    }
    return false;
  }

  function hasPrice(text) {
    return PRICE_WORDS.some(w => text.includes(w));
  }

  function hasSpecification(text) {
    const lower = text.toLowerCase();
    for (const spec of ALL_SPEC_WORDS) {
      if (lower.includes(spec)) return true;
    }
    return false;
  }

  function isExactPillar(text, entityType) {
    const lowerText = text.toLowerCase().trim();
    const pillarList = PILLAR_NAMES[entityType] || [];
    for (let pillar of pillarList) {
      if (lowerText === pillar) {
        return true;
      }
    }
    return false;
  }

  // ============================================================
  // 🔥 FUNGSI GET BASE KEYWORD (TANPA DAFTAR)
  // ============================================================

  function getBaseKeyword(text) {
    const words = text.toLowerCase().split(/\s+/);
    
    // Skip kata "harga", "biaya", "tarif", "estimasi"
    const skipWords = ['harga', 'biaya', 'tarif', 'estimasi'];
    let filteredWords = words.filter(w => !skipWords.includes(w) && w.length > 1);
    
    // Ambil 2 kata pertama sebagai base
    let baseWords = filteredWords.slice(0, 2);
    let baseKeyword = baseWords.join(' ');
    
    // Jika baseKeyword terlalu pendek (<3 karakter), ambil 3 kata
    if (baseKeyword.length < 3 && filteredWords.length >= 3) {
      baseKeyword = filteredWords.slice(0, 3).join(' ');
    }
    
    return baseKeyword;
  }

  // ============================================================
  // 🔥 DETEKSI LEVEL UTAMA (TANPA DAFTAR) — v22.34
  // ============================================================

  function detectLevelWithoutList(text, entityType) {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    
    // ============================================================
    // STEP 1: DAPATKAN BASE KEYWORD
    // ============================================================
    const baseKeyword = getBaseKeyword(text);
    const baseWords = baseKeyword.split(' ');
    
    // ============================================================
    // STEP 2: CEK APAKAH ADA TAMBAHAN KATA
    // ============================================================
    let hasAdditional = false;
    let additionalWords = [];
    
    // Skip kata "harga", "biaya", "tarif", "estimasi"
    const skipWords = ['harga', 'biaya', 'tarif', 'estimasi'];
    
    for (let word of words) {
      if (word.length < 2) continue;
      if (skipWords.includes(word)) continue;
      if (!baseWords.includes(word)) {
        hasAdditional = true;
        additionalWords.push(word);
      }
    }
    
    // ============================================================
    // STEP 3: CEK LOKASI
    // ============================================================
    const hasLocation = isLocation(lowerText);
    
    // ============================================================
    // STEP 4: CEK SPESIFIKASI
    // ============================================================
    const hasSpec = hasSpecification(lowerText);
    
    // ============================================================
    // STEP 5: LOGIKA FINAL (TANPA DAFTAR)
    // ============================================================
    
    // 🔥 Jika tidak ada tambahan kata → MONEY_MASTER
    if (!hasAdditional) {
      log(`🏛️ TANPA TAMBAHAN: "${text}" → MONEY_MASTER (base: ${baseKeyword})`, 'MM');
      return "money-master";
    }
    
    // 🔥 Jika ada lokasi → MONEY_CHILD
    if (hasLocation) {
      log(`📍 LOKASI: "${text}" → MONEY_CHILD`, 'LOCATION');
      return "money-child";
    }
    
    // 🔥 Jika ada spesifikasi → MONEY_CHILD
    if (hasSpec) {
      log(`🔧 SPESIFIKASI: "${text}" → MONEY_CHILD`, 'VARIANT');
      return "money-child";
    }
    
    // 🔥 Jika ada tambahan tapi tidak spesifik/lokasi → MONEY_PAGE
    log(`📄 TAMBAHAN: "${text}" → MONEY_PAGE (tambahan: ${additionalWords.join(', ')})`, 'PRICE');
    return "money-page";
  }

  // ============================================================
  // 🔥 DETEKSI VARIANT (OTOMATIS)
  // ============================================================

  function detectVariantLevel(text, entityType) {
    const lowerText = text.toLowerCase();
    
    // Jika ada "harga" → BUKAN VARIANT
    if (hasPrice(lowerText)) {
      return null;
    }
    
    // Jika ada spesifikasi → VARIANT
    if (hasSpecification(lowerText)) {
      // Cek apakah sub-variant (angka spesifik)
      if (/\d+\s*(m|mm|cm|meter|kg|ton|inch|inci)/gi.test(lowerText)) {
        return "sub-variant";
      }
      return "variant";
    }
    
    return null;
  }

  // ============================================================
  // 📌 FUNGSI MAIN DETECTOR
  // ============================================================

  function detectPageLevel(userOptions = {}) {
    if (isHomePage()) return "home";
    const text = getPageText();
    const entityType = detectEntityType(userOptions.userEntityType);
    log(`TEXT: "${text}"`, "INFO");
    log(`ENTITY: ${entityType}`, "INFO");
    
    // ============================================================
    // STEP 1: CEK PILLAR (EXACT MATCH)
    // ============================================================
    if (isExactPillar(text, entityType)) {
      log(`"${text}" → PILLAR (EXACT MATCH)`, "SUCCESS");
      return "pillar";
    }
    
    // ============================================================
    // STEP 2: CEK SUB-PILLAR TIPE 2 (Daftar/Jenis/Kategori)
    // ============================================================
    const lowerText = text.toLowerCase();
    if (/daftar|jenis|macam|kategori|tipe/.test(lowerText)) {
      log(`"${text}" → SUB-PILLAR TIPE 2`, "SUCCESS");
      return "sub-pillar-tipe-2";
    }
    
    // ============================================================
    // STEP 3: CEK SUB-PILLAR TIPE 1 (Perbandingan/VS)
    // ============================================================
    if (/perbandingan|vs|versus|kelebihan|kekurangan|perbedaan/.test(lowerText)) {
      log(`"${text}" → SUB-PILLAR TIPE 1`, "SUCCESS");
      return "sub-pillar-tipe-1";
    }
    
    // ============================================================
    // STEP 4: CEK VARIANT (jika TANPA harga)
    // ============================================================
    const variant = detectVariantLevel(text, entityType);
    if (variant) {
      log(`✅ VARIANT: "${text}" → ${variant}`, 'VARIANT');
      return variant;
    }
    
    // ============================================================
    // STEP 5: DETEKSI LEVEL UTAMA (TANPA DAFTAR)
    // ============================================================
    const level = detectLevelWithoutList(text, entityType);
    log(`🎯 LEVEL: "${text}" → ${level}`, 'DETECT');
    
    return level;
  }

  // ============================================================
  // 📌 CONFIDENCE SCORE
  // ============================================================

  function getConfidenceScore() {
    const text = getPageText();
    const entityType = detectEntityType();
    const level = detectPageLevel();
    let confidence = 100;
    let strategies = [];
    
    const words = text.split(/\s+/).filter(w => w.length > 2);
    const hasLocation = isLocation(text);
    const hasSpec = hasSpecification(text);
    const hasPriceWord = hasPrice(text);
    
    if (level === 'pillar') {
      strategies.push(`PILLAR: exact match "${text}"`);
    } else if (level === 'sub-pillar-tipe-2') {
      strategies.push(`SP2: daftar/jenis/kategori`);
    } else if (level === 'sub-pillar-tipe-1') {
      strategies.push(`SP1: perbandingan/vs`);
    } else if (hasLocation && level === 'money-child') {
      strategies.push("MC: lokasi terdeteksi");
    } else if (hasSpec && level === 'money-child') {
      strategies.push("MC: spesifikasi terdeteksi");
    } else if (hasPriceWord && level === 'money-page') {
      strategies.push("MP: harga + tambahan kata");
    } else if (!hasPriceWord && !hasLocation && !hasSpec && level === 'money-master') {
      strategies.push("MM: tanpa tambahan kata");
    }
    
    return { level, confidence, strategies, strategyCount: strategies.length };
  }

  // ============================================================
  // 📌 EXPORT
  // ============================================================

  window.pageLevelDetectorv22 = {
    detect: detectPageLevel,
    updateAttributes: function() {
      const level = detectPageLevel();
      document.body.setAttribute("data-page-level", level);
      document.body.setAttribute("data-page-level-num", TYPE_LEVEL_MAP[level]);
      return { pageLevel: level, pageLevelNum: TYPE_LEVEL_MAP[level] };
    },
    getConfidenceScore: getConfidenceScore,
    detectEntityType,
    VALID_LEVELS,
    TYPE_LEVEL_MAP,
    VALID_ENTITY_TYPES,
    PILLAR_NAMES,
    version: "22.34"
  };

  window.pageLevelDetectorv22Ready = true;
  window.dispatchEvent(new Event("pageLevelDetectorv22Ready"));

  console.log("✅ Page Level Detector v22.34 Ready");
  console.log("📌 PILLAR EXACT MATCH (hanya daftar PILLAR)");
  console.log("📌 SP2: daftar/jenis/macam/kategori/tipe");
  console.log("📌 SP1: perbandingan/vs/kelebihan/kekurangan");
  console.log("🧠 TANPA DAFTAR KATA UNTUK MM/MP/MC (logika murni)");
  console.log("   - Base keyword: 2 kata pertama");
  console.log("   - Deteksi tambahan kata → MP/MC");
  console.log("   - Deteksi lokasi otomatis → MC");
  console.log("   - Deteksi spesifikasi otomatis → MC");
  console.log("🏗️  ENTITY: JASA, SEWA, PRODUK, MATERIAL, DESAIN, ARTIKEL");

})();
