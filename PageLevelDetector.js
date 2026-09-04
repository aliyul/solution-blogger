/* ============================================================
 🧠 Page Level Detector v22.41 — FIX REFERENCE ERROR
    ✅ FIX v22.41: Perbaiki urutan deklarasi fungsi (hoisting)
    ✅ FIX v22.40: MENUNGGU DOM READY SEBELUM EKSEKUSI
    ✅ FIX v22.40: FITUR SEO MODERN WAIT BREADCRUMBS (max 5 detik)
    ✅ FIX v22.40: SELF-INITIALIZING — cukup panggil URL
    ✅ FIX v22.39: MONEY_CHILD = LOKASI MURNI (tanpa spec/harga)
    ✅ FIX v22.39: VARIANT = SPESIFIKASI (tanpa lokasi)
    ✅ FIX v22.39: SUB-VARIANT = SPESIFIKASI DETAIL (angka/dimensi)
    ✅ FIX v22.39: MONEY_PAGE = LOKASI + SPEC/PRICE
    ✅ NEW v22.39: INTENT DETECTION, EEAT, STRUCTURE, SNIPPET
============================================================ */

(function () {
  "use strict";

  // ============================================================
  // 🔥 CEK APAKAH SUDAH TERLOAD
  // ============================================================

  if (window.pageLevelDetectorv22) {
    console.warn("⚠️ [PLD v22.41] Page Level Detector already loaded!");
    return;
  }

  // ============================================================
  // 📌 KONFIGURASI
  // ============================================================

  const CONFIG = {
    DEBUG: true,
    BREADCRUMBS_TIMEOUT: 5000,
    BREADCRUMBS_SELECTORS: [
      '.breadcrumb',
      '.breadcrumbs',
      '.bread-crumb',
      '[class*="breadcrumb"]',
      '[class*="bread-crumb"]',
      '.woocommerce-breadcrumb',
      '.yoast-breadcrumbs',
      '.rank-math-breadcrumb',
      '.aioseo-breadcrumbs',
      '[itemprop="breadcrumb"]',
      '[typeof="BreadcrumbList"]',
      'nav[aria-label="breadcrumb"]',
      'ol.breadcrumb',
      'ul.breadcrumb'
    ]
  };

  // ============================================================
  // 📌 LOGGING
  // ============================================================

  function log(message, type) {
    if (!CONFIG.DEBUG && type === "INFO") return;
    if (!type) type = "INFO";
    var icons = {
      INFO: "📘", SUCCESS: "✅", WARN: "⚠️", ERROR: "❌",
      LOCATION: "📍", VARIANT: "🔬", PRICE: "💰",
      MM: "🏛️", CORE: "🧠", DETECT: "🎯", INTENT: "🎯",
      EEAT: "🔐", STRUCTURE: "📐", SNIPPET: "⭐", QUALITY: "📊",
      DOM: "🌐", BREAD: "🍞", TIMER: "⏱️", EXTERNAL: "📦"
    };
    console.log((icons[type] || "📘") + " [PLD v22.41] " + message);
  }

  log('📦 External JS loaded', 'EXTERNAL');

  // ============================================================
  // 📌 VALID LEVELS
  // ============================================================

  var VALID_LEVELS = [
    "home", "pillar", "sub-pillar-tipe-2", "sub-pillar-tipe-1",
    "money-master", "money-page", "money-child", "variant", "sub-variant"
  ];

  var TYPE_LEVEL_MAP = {
    home: 0, pillar: 1, "sub-pillar-tipe-2": 2, "sub-pillar-tipe-1": 3,
    "money-master": 4, "money-page": 5, "money-child": 6, variant: 7, "sub-variant": 8
  };

  // ============================================================
  // 📌 VALID ENTITY TYPES
  // ============================================================

  var VALID_ENTITY_TYPES = ["produk", "material", "jasa", "desain", "sewa", "artikel"];

  // ============================================================
  // 🔥 PILLAR NAMES (EXACT MATCH)
  // ============================================================

  var PILLAR_NAMES = {
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

  var ENTITY_TRIGGERS = {
    jasa: ["jasa", "kontraktor", "tukang", "borongan", "renovasi", "pasang", "bangun", "perbaikan", "instalasi", "service", "servis"],
    desain: ["desain", "interior", "arsitektur", "konsep", "rencana", "gambar", "denah"],
    sewa: ["sewa", "rental"],
    material: ["material", "bahan", "material bangunan"],
    produk: ["produk", "jual", "beli", "supplier", "distributor"],
    artikel: ["artikel", "blog", "tips", "panduan"]
  };

  var ENTITY_PRIORITY = ["jasa", "sewa", "desain", "produk", "material", "artikel"];

  // ============================================================
  // 🔥 KATA YANG DIHAPUS SAAT DETEKSI
  // ============================================================

  var ENTITY_WORDS = ['jasa', 'sewa', 'material', 'produk', 'desain', 'artikel'];
  var PRICE_WORDS = ['harga', 'biaya', 'tarif', 'estimasi'];

  // ============================================================
  // 🔥 LOCATION WORDS (LENGKAP)
  // ============================================================

  var LOCATION_WORDS = [
    "jakarta", "jakarta pusat", "jakarta barat", "jakarta selatan", "jakarta timur", "jakarta utara",
    "bogor", "depok", "tangerang", "bekasi", "bandung", "karawang", "purwakarta", "cikarang", "subang", "cirebon",
    "semarang", "solo", "surakarta", "pekalongan", "tegal", "magelang", "sukoharjo", "boyolali", "klaten",
    "jogja", "yogyakarta", "surabaya", "malang", "kediri", "gresik", "sidoarjo", "mojokerto",
    "pasuruan", "probolinggo", "jember", "banyuwangi", "madiun",
    "medan", "palembang", "pekanbaru", "padang", "lampung", "batam", "aceh", "jambi", "bengkulu",
    "pontianak", "balikpapan", "samarinda", "banjarmasin", "makassar", "manado", "palu", "kendari",
    "bali", "denpasar", "gianyar", "tabanan", "bangli", "karangasem", "klungkung", "buleleng",
    "mataram", "kupang", "terdekat", "sekitar", "dekat", "near"
  ];

  // ============================================================
  // 🔥 SPECIFICATION WORDS (LENGKAP)
  // ============================================================

  var SPECIFICATION_WORDS = {
    mutu: ["k225", "k250", "k300", "k350", "k400", "k500", "fc", "m6", "m8", "m10", "m12", "m16", "m20", "b0", "b1", "b2", "b3", "sni"],
    satuan: ["per meter", "per lembar", "per batang", "per kubik", "per unit", "per m", "per lbr", "per kg", "per ton", "per jam", "per hari", "per minggu", "per bulan"],
    finishing: ["polos", "motif", "bermotif", "bercorak", "tekstur", "serat", "halus", "kasar", "matte", "glossy", "doff", "gloss", "satin", "anyaman", "natural", "ekspos", "custom", "polosan"],
    dimensi: ["ukuran", "dimensi", "spesifikasi", "tipe", "model", "varian", "seri", "tinggi", "rendah", "panjang", "pendek", "lebar", "sempit", "tebal", "tipis", "dalam", "dangkal", "diameter", "radius"],
    metode: ["hidrolik", "manual", "auger", "rotary", "percussive", "dry", "wet", "basah", "kering", "coring", "cutting", "drilling", "pengeboran", "pemancangan", "pemasangan", "bongkar", "pasang", "potong", "las", "sambung", "metode", "teknik", "cara"],
    jasa: ["borongan", "harian", "mingguan", "bulanan", "kontrak", "proyek", "renovasi", "perbaikan", "pemasangan", "instalasi", "rumah tinggal", "gedung", "pabrik", "gudang", "ruko", "sekolah", "rumah sakit", "jalan", "jembatan", "infrastruktur"],
    sewa: ["mini", "besar", "kecil", "sedang", "medium", "extra", "standar", "premium", "ekonomis", "long arm", "breaker", "diesel", "hydraulic", "crawler", "wheel", "vibro", "roller", "compactor", "bulldozer", "excavator", "crane", "backhoe", "dozer"],
    material: ["semen", "pasir", "batu split", "kerikil", "besi", "baja", "kayu", "keramik", "granit", "marmer", "gypsum", "plafon", "paving", "bata", "batako", "hebel", "genteng", "asbes"],
    desain: ["modern", "minimalis", "klasik", "tradisional", "kontemporer", "elegan", "luxury", "industrial", "scandinavian", "jepang", "rustic", "vintage"],
    harga: ["murah", "hemat", "ekonomis", "terjangkau", "budget", "premium", "mahal", "mewah"],
    produk: ["precast", "pracetak", "ready mix", "readymix", "siap pakai", "custom", "standar"]
  };

  var ALL_SPEC_WORDS = [];
  for (var category in SPECIFICATION_WORDS) {
    if (SPECIFICATION_WORDS.hasOwnProperty(category)) {
      ALL_SPEC_WORDS.push.apply(ALL_SPEC_WORDS, SPECIFICATION_WORDS[category]);
    }
  }

  // ============================================================
  // 🔥 INTENT TRIGGERS
  // ============================================================

  var INTENT_TRIGGERS = {
    transactional: ["beli", "order", "pesan", "booking", "sewa sekarang", "harga", "biaya", "tarif", "estimasi", "promo", "diskon", "bayar", "cicilan", "kredit", "dapatkan", "pesan sekarang"],
    informational: ["cara", "tutorial", "panduan", "tips", "langkah", "bagaimana", "apa itu", "pengertian", "definisi", "contoh", "jenis", "perbedaan", "kelebihan", "kekurangan", "manfaat", "fungsi"],
    commercial: ["review", "testimoni", "rekomendasi", "terbaik", "paling", "vs", "versus", "perbandingan", "alternatif", "pilihan", "populer", "favorit", "unggulan"],
    navigational: ["login", "daftar", "kontak", "tentang", "hubungi", "alamat", "lokasi", "maps", "direksi"]
  };

  // ============================================================
  // 🔥 SEMANTIC CLUSTERS (LSI)
  // ============================================================

  var SEMANTIC_CLUSTERS = {
    "konstruksi": ["bangunan", "proyek", "infrastruktur", "pembangunan", "developer", "kontraktor"],
    "desain": ["interior", "arsitektur", "estetika", "fungsional", "layout", "denah"],
    "material": ["semen", "besi", "baja", "kayu", "keramik", "granit", "marmer", "hebel"],
    "jasa": ["kontraktor", "tukang", "borongan", "renovasi", "instalasi", "service"],
    "sewa": ["rental", "excavator", "bulldozer", "crane", "alat berat", "diesel"],
    "produk": ["precast", "readymix", "pracetak", "siap pakai", "custom"]
  };

  // ============================================================
  // 🔥 STOPWORDS
  // ============================================================

  var STOPWORDS = new Set(["dan", "atau", "serta", "yang", "dari", "ke", "di", "untuk", "dengan", "ini", "itu", "akan", "telah", "sudah", "masih", "pada", "oleh", "karena", "sehingga", "setelah", "sebelum"]);

  // ============================================================
  // 📌 FUNGSI DASAR — DIDEKLARASIKAN SEBELUM DIGUNAKAN
  // ============================================================

  function cleanText(text) {
    if (!text) return "";
    return text.toLowerCase().replace(/[^a-z0-9\s]/gi, " ").replace(/\s+/g, " ").trim();
  }

  function getPageText() {
    var slug = window.location.pathname.replace(/\.html$/, "").replace(/-/g, " ").split("/").pop() || "";
    if (!slug || slug.length < 2) {
      slug = window.location.pathname.replace(/\.html$/, "").replace(/-/g, " ").split("/").filter(Boolean).pop() || "";
    }
    var text = cleanText(slug);
    if (text.length > 100) text = text.substring(0, 100);
    return text;
  }

  function isHomePage() {
    var path = window.location.pathname.toLowerCase();
    return path === "/" || path === "/index.html" || path === "/home";
  }

  // ============================================================
  // 🔥 FUNGSI DETEKSI — DIDEKLARASIKAN SEBELUM DIGUNAKAN
  // ============================================================

  function isLocation(text) {
    if (!text) return false;
    var lower = cleanText(text);
    for (var i = 0; i < LOCATION_WORDS.length; i++) {
      var word = LOCATION_WORDS[i];
      if (new RegExp("\\b" + word.replace(/\s+/g, '\\s+') + "\\b", "i").test(lower)) return true;
    }
    return false;
  }

  function hasPrice(text) {
    for (var i = 0; i < PRICE_WORDS.length; i++) {
      if (text.indexOf(PRICE_WORDS[i]) !== -1) return true;
    }
    return false;
  }

  function hasSpecification(text) {
    var lower = text.toLowerCase();
    for (var i = 0; i < ALL_SPEC_WORDS.length; i++) {
      if (lower.indexOf(ALL_SPEC_WORDS[i]) !== -1) return true;
    }
    return false;
  }

  function detectEntityType(userEntityType) {
    if (userEntityType && VALID_ENTITY_TYPES.indexOf(userEntityType) !== -1) return userEntityType;
    var text = getPageText();
    var lower = text.toLowerCase();
    for (var i = 0; i < ENTITY_PRIORITY.length; i++) {
      var entity = ENTITY_PRIORITY[i];
      var triggers = ENTITY_TRIGGERS[entity] || [];
      for (var j = 0; j < triggers.length; j++) {
        if (lower.indexOf(triggers[j]) !== -1) return entity;
      }
    }
    if (lower.indexOf("jasa") !== -1 || lower.indexOf("kontraktor") !== -1 || lower.indexOf("tukang") !== -1) return "jasa";
    if (lower.indexOf("sewa") !== -1 || lower.indexOf("rental") !== -1) return "sewa";
    if (lower.indexOf("desain") !== -1 || lower.indexOf("interior") !== -1) return "desain";
    if (lower.indexOf("material") !== -1 || lower.indexOf("bahan") !== -1) return "material";
    if (lower.indexOf("produk") !== -1 || lower.indexOf("jual") !== -1) return "produk";
    return "produk";
  }

  function isExactPillar(text, entityType) {
    var lowerText = text.toLowerCase().trim();
    var pillarList = PILLAR_NAMES[entityType] || [];
    for (var i = 0; i < pillarList.length; i++) {
      if (lowerText === pillarList[i]) return true;
    }
    return false;
  }

  function getCoreWords(text) {
    var words = text.toLowerCase().split(/\s+/);
    var filteredWords = [];
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (ENTITY_WORDS.indexOf(w) === -1 && w.length > 1 && PRICE_WORDS.indexOf(w) === -1 && !STOPWORDS.has(w)) {
        filteredWords.push(w);
      }
    }
    return filteredWords;
  }

  function getBaseKeyword(text) {
    var coreWords = getCoreWords(text);
    var baseWords = coreWords.slice(0, 2);
    var baseKeyword = baseWords.join(' ');
    if (baseKeyword.length < 3 && coreWords.length >= 3) {
      baseKeyword = coreWords.slice(0, 3).join(' ');
    }
    return baseKeyword;
  }

  function detectSubPillar(text) {
    var lower = text.toLowerCase();
    if (/daftar|jenis|macam|kategori|tipe|list|katalog/.test(lower)) {
      return "sub-pillar-tipe-2";
    }
    if (/perbandingan|vs|versus|kelebihan|kekurangan|perbedaan|lebih baik|unggul/.test(lower)) {
      return "sub-pillar-tipe-1";
    }
    return null;
  }

  // ============================================================
  // 🔥 DETEKSI LEVEL UTAMA — SEKARANG AMAN KARENA FUNGSI SUDAH DIDEKLARASIKAN
  // ============================================================

  function detectLevelWithoutList(text, entityType) {
    var lowerText = text.toLowerCase();
    var coreWords = getCoreWords(text);
    var baseKeyword = getBaseKeyword(text);
    var baseWords = baseKeyword.split(' ');
    
    var hasLocation = isLocation(lowerText);
    var hasSpec = hasSpecification(lowerText);
    var hasPrice = hasPrice(lowerText);
    
    var hasAdditional = false;
    var additionalWords = [];
    for (var i = 0; i < coreWords.length; i++) {
      var word = coreWords[i];
      if (baseWords.indexOf(word) === -1) {
        hasAdditional = true;
        additionalWords.push(word);
      }
    }
    
    // PRIORITAS 1: MONEY_CHILD = LOKASI MURNI
    if (hasLocation && !hasSpec && !hasPrice) {
      log('📍 MONEY_CHILD (LOKASI MURNI): "' + text + '"', 'LOCATION');
      return "money-child";
    }
    
    // PRIORITAS 2: VARIANT / SUB-VARIANT
    if (hasSpec && !hasLocation && !hasPrice) {
      if (/\d+\s*(m|mm|cm|meter|kg|ton|inch|inci|k|m3|liter)/gi.test(lowerText)) {
        log('🔬 SUB-VARIANT (SPESIFIKASI + DIMENSI): "' + text + '"', 'VARIANT');
        return "sub-variant";
      }
      log('🔬 VARIANT (SPESIFIKASI MURNI): "' + text + '"', 'VARIANT');
      return "variant";
    }
    
    // PRIORITAS 3: MONEY_PAGE
    if (hasAdditional || hasSpec || hasPrice || (hasLocation && (hasSpec || hasPrice))) {
      log('📄 MONEY_PAGE: "' + text + '"', 'PRICE');
      return "money-page";
    }
    
    // PRIORITAS 4: MONEY_MASTER
    if (!hasAdditional && !hasLocation && !hasSpec && !hasPrice) {
      log('🏛️ MONEY_MASTER: "' + text + '"', 'MM');
      return "money-master";
    }
    
    return "money-page";
  }

  // ============================================================
  // 📌 FUNGSI MAIN DETECTOR
  // ============================================================

  function detectPageLevel(userOptions) {
    if (isHomePage()) return "home";
    var text = getPageText();
    var entityType = detectEntityType(userOptions && userOptions.userEntityType);
    
    if (isExactPillar(text, entityType)) {
      log('"' + text + '" → PILLAR (EXACT MATCH)', "SUCCESS");
      return "pillar";
    }
    
    var subPillar = detectSubPillar(text);
    if (subPillar) {
      log('"' + text + '" → ' + subPillar, "SUCCESS");
      return subPillar;
    }
    
    var level = detectLevelWithoutList(text, entityType);
    log('🎯 LEVEL: "' + text + '" → ' + level, 'DETECT');
    return level;
  }

  // ============================================================
  // 🔥 FUNGSI LAINNYA (EEAT, STRUCTURE, SNIPPET, INTENT, dll)
  // ============================================================

  function detectEEATSignals() {
    var signals = { author: false, date: false, source: false, expertise: false, experience: false, trust: false };
    var bodyText = (document.body && document.body.innerText) ? document.body.innerText.toLowerCase() : "";
    
    if (/oleh|author|written by|posted by|by\s+[a-z]/.test(bodyText)) signals.author = true;
    if (/\d{1,2}\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s+\d{4}/i.test(bodyText)) signals.date = true;
    if (/sumber|referensi|refrensi|menurut|berdasarkan|dikutip|dari/.test(bodyText)) signals.source = true;
    if (/ahli|expert|profesional|berpengalaman|spesialis|expertise/.test(bodyText)) signals.expertise = true;
    if (/pengalaman|pengalaman saya|studi kasus|portofolio|proyek sebelumnya/.test(bodyText)) signals.experience = true;
    if (/terpercaya|jaminan|garansi|sertifikat|sertifikasi|resmi|legal/.test(bodyText)) signals.trust = true;
    
    return signals;
  }

  function detectContentStructure() {
    var structure = { headings: { h1: 0, h2: 0, h3: 0, h4: 0 }, hasList: false, hasTable: false, hasImages: false, hasVideo: false, wordCount: 0, readability: "medium" };
    
    try {
      structure.headings.h1 = document.querySelectorAll('h1').length;
      structure.headings.h2 = document.querySelectorAll('h2').length;
      structure.headings.h3 = document.querySelectorAll('h3').length;
      structure.headings.h4 = document.querySelectorAll('h4').length;
      structure.hasList = document.querySelectorAll('ul, ol').length > 0;
      structure.hasTable = document.querySelectorAll('table').length > 0;
      structure.hasImages = document.querySelectorAll('img').length > 0;
      structure.hasVideo = document.querySelectorAll('iframe[src*="youtube"], iframe[src*="vimeo"], video').length > 0;
      
      var bodyText = (document.body && document.body.innerText) ? document.body.innerText : "";
      structure.wordCount = bodyText.split(/\s+/).filter(function(w) { return w.length > 0; }).length;
      
      if (structure.wordCount > 2000) structure.readability = "high";
      else if (structure.wordCount > 800) structure.readability = "medium";
      else structure.readability = "low";
    } catch (e) {}
    
    return structure;
  }

  function detectFeaturedSnippetOpportunity() {
    var bodyText = (document.body && document.body.innerText) ? document.body.innerText.toLowerCase() : "";
    var opportunities = { definition: false, faq: false, table: false, list: false, stepByStep: false, comparison: false };
    
    if (/adalah|merupakan|ialah|yaitu|definisi|pengertian/.test(bodyText)) opportunities.definition = true;
    if (/faq|tanya jawab|pertanyaan|q&a/.test(bodyText)) opportunities.faq = true;
    try { opportunities.table = document.querySelectorAll('table').length > 0; } catch (e) {}
    try { opportunities.list = document.querySelectorAll('ul, ol').length > 2; } catch (e) {}
    if (/langkah|step|cara|tahap|pertama|kedua|ketiga/.test(bodyText)) opportunities.stepByStep = true;
    if (/perbandingan|vs|versus|kelebihan|kekurangan/.test(bodyText)) opportunities.comparison = true;
    
    return opportunities;
  }

  function detectIntent(text) {
    var lower = text.toLowerCase();
    var scores = { transactional: 0, informational: 0, commercial: 0, navigational: 0 };
    
    for (var intent in INTENT_TRIGGERS) {
      if (INTENT_TRIGGERS.hasOwnProperty(intent)) {
        var triggers = INTENT_TRIGGERS[intent];
        for (var i = 0; i < triggers.length; i++) {
          if (lower.indexOf(triggers[i]) !== -1) scores[intent] += 1;
        }
      }
    }
    
    var maxScore = 0;
    var dominantIntent = "informational";
    for (var intent in scores) {
      if (scores.hasOwnProperty(intent) && scores[intent] > maxScore) {
        maxScore = scores[intent];
        dominantIntent = intent;
      }
    }
    
    return { dominant: dominantIntent, scores: scores, confidence: maxScore > 0 ? "high" : "low" };
  }

  function detectSemanticClusters(text) {
    var lower = text.toLowerCase();
    var found = [];
    for (var cluster in SEMANTIC_CLUSTERS) {
      if (SEMANTIC_CLUSTERS.hasOwnProperty(cluster)) {
        var words = SEMANTIC_CLUSTERS[cluster];
        for (var i = 0; i < words.length; i++) {
          if (lower.indexOf(words[i]) !== -1) found.push({ cluster: cluster, word: words[i] });
        }
      }
    }
    return found;
  }

  function generateRecommendations(score, level, eeat, structure) {
    var recommendations = [];
    if (score < 50) {
      recommendations.push("🔴 Perbaiki struktur konten dengan H1, H2, H3 yang jelas");
      recommendations.push("🔴 Tambahkan EEAT signals: author, tanggal, sumber referensi");
      recommendations.push("🔴 Tingkatkan word count minimal 800 kata");
    }
    if (!eeat.author) recommendations.push("🟡 Tambahkan nama author atau byline di artikel");
    if (!eeat.date) recommendations.push("🟡 Tambahkan tanggal publish/update");
    if (!eeat.source) recommendations.push("🟡 Tambahkan sumber referensi atau kutipan");
    if (!eeat.expertise) recommendations.push("🟡 Tampilkan kredensial atau keahlian penulis");
    if (structure.wordCount < 800) recommendations.push("🟡 Tingkatkan kedalaman konten (minimal 800 kata)");
    if (structure.headings.h2 < 2) recommendations.push("🟡 Tambahkan sub-heading (H2) untuk struktur yang lebih baik");
    if (!structure.hasList) recommendations.push("🟡 Gunakan bullet points atau numbered list untuk readability");
    if (!structure.hasTable) recommendations.push("🟡 Pertimbangkan tabel untuk data perbandingan");
    if (!structure.hasImages) recommendations.push("🟡 Tambahkan gambar untuk engagement");
    return recommendations;
  }

  function calculateSEOScore() {
    var text = getPageText();
    var level = detectPageLevel();
    var entityType = detectEntityType();
    var intent = detectIntent(text);
    var eeat = detectEEATSignals();
    var structure = detectContentStructure();
    var snippet = detectFeaturedSnippetOpportunity();
    
    var score = 0;
    var details = [];
    
    var levelScores = {
      "home": 5, "pillar": 30, "sub-pillar-tipe-1": 25, "sub-pillar-tipe-2": 25,
      "money-master": 20, "money-page": 25, "money-child": 28, "variant": 20, "sub-variant": 22
    };
    score += levelScores[level] || 10;
    details.push("Level: " + level + " (" + (levelScores[level] || 10) + "/30)");
    
    if (entityType && VALID_ENTITY_TYPES.indexOf(entityType) !== -1) {
      score += 15;
      details.push("Entity: " + entityType + " (15/15)");
    } else {
      score += 5;
      details.push("Entity: weak (5/15)");
    }
    
    if (intent.confidence === "high") {
      score += 15;
      details.push("Intent: " + intent.dominant + " (15/15)");
    } else if (intent.confidence === "medium") {
      score += 10;
      details.push("Intent: " + intent.dominant + " (10/15)");
    } else {
      score += 5;
      details.push("Intent: unclear (5/15)");
    }
    
    var eeatScore = 0;
    for (var signal in eeat) {
      if (eeat.hasOwnProperty(signal) && eeat[signal]) eeatScore += 3;
    }
    score += Math.min(eeatScore, 15);
    details.push("EEAT: " + eeatScore + "/15 signals");
    
    var structureScore = 0;
    if (structure.headings.h1 > 0) structureScore += 3;
    if (structure.headings.h2 > 0) structureScore += 3;
    if (structure.headings.h3 > 0) structureScore += 2;
    if (structure.hasList) structureScore += 2;
    if (structure.hasTable) structureScore += 2;
    if (structure.hasImages) structureScore += 2;
    if (structure.hasVideo) structureScore += 1;
    score += Math.min(structureScore, 15);
    details.push("Structure: " + structureScore + "/15");
    
    var snippetScore = 0;
    for (var type in snippet) {
      if (snippet.hasOwnProperty(type) && snippet[type]) snippetScore += 2;
    }
    score += Math.min(snippetScore, 10);
    details.push("Snippet: " + snippetScore + "/10");
    
    var quality = "low";
    if (score >= 80) quality = "excellent";
    else if (score >= 65) quality = "good";
    else if (score >= 50) quality = "medium";
    
    return {
      score: Math.min(score, 100),
      quality: quality,
      details: details,
      level: level,
      entityType: entityType,
      intent: intent.dominant,
      eeat: eeat,
      structure: structure,
      snippet: snippet,
      recommendations: generateRecommendations(score, level, eeat, structure)
    };
  }

  function getConfidenceScore() {
    var text = getPageText();
    var level = detectPageLevel();
    var strategies = [];
    var coreWords = getCoreWords(text);
    
    if (level === 'pillar') strategies.push("PILLAR: exact match \"" + text + "\"");
    else if (level === 'sub-pillar-tipe-2') strategies.push("SP2: daftar/jenis/kategori");
    else if (level === 'sub-pillar-tipe-1') strategies.push("SP1: perbandingan/vs");
    else if (level === 'money-child') strategies.push("MC: lokasi murni \"" + text + "\"");
    else if (level === 'variant') strategies.push("VARIANT: spesifikasi \"" + text + "\"");
    else if (level === 'sub-variant') strategies.push("SUB-VARIANT: spesifikasi detail dengan dimensi");
    else if (level === 'money-page') strategies.push("MP: " + coreWords.length + " core words (ada tambahan)");
    else if (level === 'money-master') strategies.push("MM: " + coreWords.length + " core words (tanpa tambahan)");
    
    return { level: level, confidence: 100, strategies: strategies, strategyCount: strategies.length };
  }

  // ============================================================
  // 🔥 BREADCRUMBS DETECTION
  // ============================================================

  function findBreadcrumbs() {
    for (var s = 0; s < CONFIG.BREADCRUMBS_SELECTORS.length; s++) {
      var selector = CONFIG.BREADCRUMBS_SELECTORS[s];
      try {
        var elements = document.querySelectorAll(selector);
        for (var i = 0; i < elements.length; i++) {
          var el = elements[i];
          if (el.offsetParent !== null || el.getBoundingClientRect().height > 0) {
            var text = (el.textContent || "").trim() || "";
            if (text.length > 0) {
              return { element: el, text: text, selector: selector };
            }
          }
        }
      } catch (e) {}
    }
    return null;
  }

  function waitForBreadcrumbs(callback) {
    var startTime = Date.now();
    var timeout = CONFIG.BREADCRUMBS_TIMEOUT;

    function checkBreadcrumbs() {
      var breadcrumb = findBreadcrumbs();
      if (breadcrumb) {
        log("✅ Breadcrumbs ditemukan! (" + breadcrumb.selector + ")", 'BREAD');
        callback(null, breadcrumb);
        return;
      }
      if (Date.now() - startTime >= timeout) {
        log("⏱️ Timeout: Breadcrumbs tidak ditemukan", 'WARN');
        callback(new Error('Breadcrumbs timeout'), null);
        return;
      }
      setTimeout(checkBreadcrumbs, 100);
    }
    setTimeout(checkBreadcrumbs, 0);
  }

  // ============================================================
  // 🔥 WAIT FOR DOM READY
  // ============================================================

  function waitForDOM(callback) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      log('🌐 DOM sudah siap', 'DOM');
      callback();
      return;
    }
    log('🌐 Menunggu DOM ready...', 'DOM');
    
    var onDOMReady = function() {
      document.removeEventListener('DOMContentLoaded', onDOMReady);
      document.removeEventListener('readystatechange', onReadyStateChange);
      log('🌐 DOM ready!', 'DOM');
      callback();
    };
    var onReadyStateChange = function() {
      if (document.readyState === 'interactive' || document.readyState === 'complete') {
        document.removeEventListener('readystatechange', onReadyStateChange);
        log('🌐 DOM ready via readystatechange!', 'DOM');
        callback();
      }
    };
    document.addEventListener('DOMContentLoaded', onDOMReady);
    document.addEventListener('readystatechange', onReadyStateChange);
    
    setTimeout(function() {
      if (document.readyState === 'loading') {
        log('⚠️ DOM load timeout, forcing execution', 'WARN');
        callback();
      }
    }, 3000);
  }

  // ============================================================
  // 📌 INITIALIZATION
  // ============================================================

  function initializeCore() {
    log('🧠 Core functions ready', 'CORE');

    window.pageLevelDetectorv22 = {
      version: "22.41",
      CONFIG: CONFIG,
      
      detect: detectPageLevel,
      getConfidenceScore: getConfidenceScore,
      detectEntityType: detectEntityType,
      VALID_LEVELS: VALID_LEVELS,
      TYPE_LEVEL_MAP: TYPE_LEVEL_MAP,
      VALID_ENTITY_TYPES: VALID_ENTITY_TYPES,
      PILLAR_NAMES: PILLAR_NAMES,
      
      updateAttributes: function(options) {
        options = options || {};
        var waitForBreadcrumb = options.waitForBreadcrumb !== false;
        
        var level = detectPageLevel();
        var seoScore = calculateSEOScore();
        
        try {
          document.body.setAttribute("data-page-level", level);
          document.body.setAttribute("data-page-level-num", TYPE_LEVEL_MAP[level]);
          document.body.setAttribute("data-seo-score", seoScore.score);
          document.body.setAttribute("data-seo-quality", seoScore.quality);
          document.body.setAttribute("data-intent", seoScore.intent);
        } catch (e) {
          log("Error setting attributes: " + e.message, "ERROR");
        }
        
        var result = {
          pageLevel: level,
          pageLevelNum: TYPE_LEVEL_MAP[level],
          seoScore: seoScore,
          breadcrumb: null
        };
        
        if (waitForBreadcrumb) {
          log('🍞 Menunggu breadcrumbs untuk SEO Modern features...', 'BREAD');
          return new Promise(function(resolve) {
            waitForBreadcrumbs(function(err, breadcrumb) {
              if (err || !breadcrumb) {
                log('⚠️ Breadcrumbs tidak ditemukan, lanjut tanpa breadcrumb', 'WARN');
                resolve(result);
                return;
              }
              result.breadcrumb = breadcrumb;
              try {
                document.body.setAttribute("data-has-breadcrumb", "true");
                document.body.setAttribute("data-breadcrumb-selector", breadcrumb.selector);
              } catch (e) {}
              resolve(result);
            });
          });
        } else {
          log('⏭️ Skip breadcrumbs wait', 'INFO');
          return result;
        }
      },
      
      calculateSEOScore: function(options) {
        options = options || {};
        var needBreadcrumb = options.requireBreadcrumb !== false;
        
        if (needBreadcrumb) {
          return new Promise(function(resolve) {
            waitForBreadcrumbs(function(err, breadcrumb) {
              var score = calculateSEOScore();
              if (breadcrumb) {
                score.breadcrumb = breadcrumb;
                score.score = Math.min(score.score + 5, 100);
                score.details.push('Breadcrumb: +5 points');
                log('🍞 Breadcrumb bonus applied (+5 points)', 'BREAD');
              }
              resolve(score);
            });
          });
        } else {
          return calculateSEOScore();
        }
      },
      
      detectIntent: detectIntent,
      detectEEATSignals: detectEEATSignals,
      detectContentStructure: detectContentStructure,
      detectFeaturedSnippetOpportunity: detectFeaturedSnippetOpportunity,
      detectSemanticClusters: detectSemanticClusters,
      generateRecommendations: generateRecommendations,
      findBreadcrumbs: findBreadcrumbs,
      waitForBreadcrumbs: waitForBreadcrumbs
    };

    window.pageLevelDetectorv22Ready = true;
    
    try {
      window.dispatchEvent(new Event("pageLevelDetectorv22Ready"));
    } catch (e) {
      try {
        var event = document.createEvent('Event');
        event.initEvent('pageLevelDetectorv22Ready', true, true);
        window.dispatchEvent(event);
      } catch (e2) {}
    }

    console.log("✅ Page Level Detector v22.41 Ready");
    console.log("📦 External JS Mode: YES");
    console.log("🌐 DOM Ready: YES");
    console.log("🍞 Breadcrumbs Wait: ENABLED (max " + CONFIG.BREADCRUMBS_TIMEOUT + "ms)");
    console.log("📍 MONEY_CHILD = LOKASI MURNI");
    console.log("📊 SEO Modern: INTENT + EEAT + STRUCTURE + SNIPPET");

    window.pageLevelDetectorv22.updateAttributes()
      .then(function(result) {
        log("✅ Auto-update selesai! Level: " + result.pageLevel, 'SUCCESS');
        if (result.breadcrumb) {
          console.log("🍞 Breadcrumb:", result.breadcrumb.text.substring(0, 100) + "...");
        }
      })
      .catch(function(err) {
        log("Auto-update error: " + err, "ERROR");
      });
  }

  // ============================================================
  // 📌 START — WAIT DOM READY
  // ============================================================

  log('🚀 Starting Page Level Detector v22.41...', 'INFO');

  waitForDOM(function() {
    initializeCore();
  });

  if (document.readyState === 'complete') {
    if (!window.pageLevelDetectorv22) {
      log('⚠️ Safety net: DOM sudah complete, init now', 'WARN');
      initializeCore();
    }
  }

})();
