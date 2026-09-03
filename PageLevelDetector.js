/* ============================================================
 🧠 Page Level Detector v22.38 — TAMBAH SPESIFIKASI ENTITY LAIN
    ✅ FIX v22.38: Tambah kategori "desain" (modern, minimalis, klasik, dll)
    ✅ FIX v22.38: Tambah kategori "material" (semen, pasir, besi, dll)
    ✅ FIX v22.38: Tambah spesifikasi JASA (rumah tinggal, gedung, pabrik, dll)
    ✅ FIX v22.38: Tambah spesifikasi SEWA (excavator, bulldozer, crane, dll)
    ✅ FIX v22.37: Tambah kategori "produk" (precast, pracetak, ready mix)
    ✅ FIX v22.36: Tambah kategori "harga" (murah, hemat, ekonomis)
    ✅ FIX v22.35: Hapus kata entity & harga
    ✅ FIX v22.34: PILLAR EXACT MATCH
    ✅ FIX v22.34: SP2 (daftar/jenis/macam/kategori/tipe)
    ✅ FIX v22.34: SP1 (perbandingan/vs/kelebihan/kekurangan)
    ✅ FIX v22.33: TANPA DAFTAR KATA (logika murni)
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
    console.log(`${icons[type] || "📘"} [PLD v22.38] ${message}`);
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
  // 🔥 PILLAR NAMES (EXACT MATCH)
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
  // 🔥 KATA YANG DIHAPUS SAAT DETEKSI
  // ============================================================

  const ENTITY_WORDS = ['jasa', 'sewa', 'material', 'produk', 'desain', 'artikel'];
  const PRICE_WORDS = ['harga', 'biaya', 'tarif', 'estimasi'];
  const SKIP_WORDS = [...ENTITY_WORDS, ...PRICE_WORDS];

  // ============================================================
  // 🔥 LOCATION WORDS
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
  // 🔥 SPECIFICATION WORDS (LENGKAP SEMUA ENTITY) — v22.38
  // ============================================================

  const SPECIFICATION_WORDS = {
    // MUTU BETON
    mutu: ["k225", "k250", "k300", "k350", "k400", "k500", "fc", "m6", "m8", "m10", "m12", "m16", "m20", "b0", "b1", "b2", "b3", "sni"],
    
    // SATUAN / UKURAN
    satuan: ["per meter", "per lembar", "per batang", "per kubik", "per unit", "per m", "per lbr", "per kg", "per ton", "per jam", "per hari", "per minggu", "per bulan"],
    
    // FINISHING
    finishing: ["polos", "motif", "bermotif", "bercorak", "tekstur", "serat", "halus", "kasar", "matte", "glossy", "doff", "gloss", "satin", "anyaman", "natural", "ekspos", "custom", "polosan"],
    
    // DIMENSI
    dimensi: ["ukuran", "dimensi", "spesifikasi", "tipe", "model", "varian", "seri", "tinggi", "rendah", "panjang", "pendek", "lebar", "sempit", "tebal", "tipis", "dalam", "dangkal", "diameter", "radius"],
    
    // METODE / TEKNIK
    metode: ["hidrolik", "manual", "auger", "rotary", "percussive", "dry", "wet", "basah", "kering", "coring", "cutting", "drilling", "pengeboran", "pemancangan", "pemasangan", "bongkar", "pasang", "potong", "las", "sambung", "metode", "teknik", "cara"],
    
    // ✅ JASA (LENGKAP — v22.38)
    jasa: [
      "borongan", "harian", "mingguan", "bulanan", "kontrak", 
      "proyek", "renovasi", "perbaikan", "pemasangan", "instalasi",
      "rumah tinggal", "gedung", "pabrik", "gudang", "ruko", 
      "sekolah", "rumah sakit", "jalan", "jembatan", "infrastruktur"
    ],
    
    // ✅ SEWA (LENGKAP — v22.38)
    sewa: [
      "mini", "besar", "kecil", "sedang", "medium", "extra", 
      "standar", "premium", "ekonomis",
      "long arm", "breaker", "diesel", "hydraulic", 
      "crawler", "wheel", "vibro", "roller", "compactor",
      "bulldozer", "excavator", "crane", "backhoe", "dozer"
    ],
    
    // ✅ MATERIAL (LENGKAP — v22.38)
    material: [
      "semen", "pasir", "batu split", "kerikil", 
      "besi", "baja", "kayu", "keramik", "granit", 
      "marmer", "gypsum", "plafon", "paving",
      "bata", "batako", "hebel", "genteng", "asbes"
    ],
    
    // ✅ DESAIN (LENGKAP — v22.38)
    desain: [
      "modern", "minimalis", "klasik", "tradisional", 
      "kontemporer", "elegan", "luxury", "industrial", 
      "scandinavian", "jepang", "rustic", "vintage"
    ],
    
    // HARGA (BUDGET)
    harga: ["murah", "hemat", "ekonomis", "terjangkau", "budget", "premium", "mahal", "mewah"],
    
    // PRODUK
    produk: ["precast", "pracetak", "ready mix", "readymix", "siap pakai", "custom", "standar"]
  };

  // Gabungkan semua spesifikasi
  const ALL_SPEC_WORDS = [];
  for (let category in SPECIFICATION_WORDS) {
    ALL_SPEC_WORDS.push(...SPECIFICATION_WORDS[category]);
  }

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
  // 🔥 FUNGSI GET CORE WORDS
  // ============================================================

  function getCoreWords(text) {
    const words = text.toLowerCase().split(/\s+/);
    let filteredWords = words.filter(w => !ENTITY_WORDS.includes(w) && w.length > 1);
    filteredWords = filteredWords.filter(w => !PRICE_WORDS.includes(w));
    filteredWords = filteredWords.filter(w => !STOPWORDS.has(w));
    return filteredWords;
  }

  // ============================================================
  // 🔥 FUNGSI GET BASE KEYWORD
  // ============================================================

  function getBaseKeyword(text) {
    const coreWords = getCoreWords(text);
    let baseWords = coreWords.slice(0, 2);
    let baseKeyword = baseWords.join(' ');
    if (baseKeyword.length < 3 && coreWords.length >= 3) {
      baseKeyword = coreWords.slice(0, 3).join(' ');
    }
    return baseKeyword;
  }

  // ============================================================
  // 🔥 DETEKSI LEVEL UTAMA — v22.38
  // ============================================================

  function detectLevelWithoutList(text, entityType) {
    const lowerText = text.toLowerCase();
    
    const coreWords = getCoreWords(text);
    const baseKeyword = getBaseKeyword(text);
    const baseWords = baseKeyword.split(' ');
    
    let hasAdditional = false;
    let additionalWords = [];
    
    for (let word of coreWords) {
      if (!baseWords.includes(word)) {
        hasAdditional = true;
        additionalWords.push(word);
      }
    }
    
    const hasLocation = isLocation(lowerText);
    const hasSpec = hasSpecification(lowerText);
    
    if (!hasAdditional) {
      log(`🏛️ TANPA TAMBAHAN: "${text}" → MONEY_MASTER (core: ${coreWords.join(' ')})`, 'MM');
      return "money-master";
    }
    
    if (hasLocation) {
      log(`📍 LOKASI: "${text}" → MONEY_CHILD`, 'LOCATION');
      return "money-child";
    }
    
    if (hasSpec) {
      log(`🔧 SPESIFIKASI: "${text}" → MONEY_CHILD (spesifikasi ditemukan)`, 'VARIANT');
      return "money-child";
    }
    
    log(`📄 TAMBAHAN: "${text}" → MONEY_PAGE (tambahan: ${additionalWords.join(', ')})`, 'PRICE');
    return "money-page";
  }

  // ============================================================
  // 🔥 DETEKSI VARIANT
  // ============================================================

  function detectVariantLevel(text, entityType) {
    const lowerText = text.toLowerCase();
    
    if (hasPrice(lowerText)) {
      return null;
    }
    
    if (hasSpecification(lowerText)) {
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
    
    // STEP 1: PILLAR (EXACT MATCH)
    if (isExactPillar(text, entityType)) {
      log(`"${text}" → PILLAR (EXACT MATCH)`, "SUCCESS");
      return "pillar";
    }
    
    // STEP 2: SUB-PILLAR TIPE 2
    const lowerText = text.toLowerCase();
    if (/daftar|jenis|macam|kategori|tipe/.test(lowerText)) {
      log(`"${text}" → SUB-PILLAR TIPE 2`, "SUCCESS");
      return "sub-pillar-tipe-2";
    }
    
    // STEP 3: SUB-PILLAR TIPE 1
    if (/perbandingan|vs|versus|kelebihan|kekurangan|perbedaan/.test(lowerText)) {
      log(`"${text}" → SUB-PILLAR TIPE 1`, "SUCCESS");
      return "sub-pillar-tipe-1";
    }
    
    // STEP 4: VARIANT
    const variant = detectVariantLevel(text, entityType);
    if (variant) {
      log(`✅ VARIANT: "${text}" → ${variant}`, 'VARIANT');
      return variant;
    }
    
    // STEP 5: LEVEL UTAMA
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
    
    const coreWords = getCoreWords(text);
    const hasLocation = isLocation(text);
    const hasSpec = hasSpecification(text);
    
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
    } else if (level === 'money-page' && coreWords.length > 2) {
      strategies.push(`MP: ${coreWords.length} core words (ada tambahan)`);
    } else if (level === 'money-master' && coreWords.length <= 2) {
      strategies.push(`MM: ${coreWords.length} core words (tanpa tambahan)`);
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
    version: "22.38"
  };

  window.pageLevelDetectorv22Ready = true;
  window.dispatchEvent(new Event("pageLevelDetectorv22Ready"));

  console.log("✅ Page Level Detector v22.38 Ready");
  console.log("🧠 FIX v22.38: TAMBAH SPESIFIKASI ENTITY LAIN");
  console.log("   - JASA: rumah tinggal, gedung, pabrik, gudang, ruko, sekolah, rumah sakit, jalan, jembatan, infrastruktur");
  console.log("   - SEWA: long arm, breaker, diesel, hydraulic, crawler, wheel, vibro, roller, compactor, bulldozer, excavator, crane");
  console.log("   - MATERIAL: semen, pasir, batu split, kerikil, besi, baja, kayu, keramik, granit, marmer, gypsum, plafon, paving");
  console.log("   - DESAIN: modern, minimalis, klasik, tradisional, kontemporer, elegan, luxury, industrial, scandinavian, jepang");
  console.log("🧠 FIX v22.37: TAMBAH KATEGORI 'PRODUK'");
  console.log("   - precast, pracetak, ready mix → MC");
  console.log("🧠 FIX v22.36: TAMBAH KATEGORI 'HARGA'");
  console.log("   - murah, hemat, ekonomis, terjangkau → MC");
  console.log("🧠 FIX v22.35: HAPUS KATA ENTITY & HARGA");
  console.log("📌 PILLAR EXACT MATCH");
  console.log("📌 SP2: daftar/jenis/macam/kategori/tipe");
  console.log("📌 SP1: perbandingan/vs/kelebihan/kekurangan");
  console.log("🏗️  ENTITY: JASA, SEWA, PRODUK, MATERIAL, DESAIN, ARTIKEL");

})();
