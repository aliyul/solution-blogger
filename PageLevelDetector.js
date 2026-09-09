/* ============================================================
 🧠 Page Level Detector v22.59 — FIX extractSlugFromInput()
    ✅ FIX: extractSlugFromInput() SAMA dengan getPageText()
    ✅ FIX: Cleaning slug (hapus tahun, tanggal, angka di awal)
    ✅ FIX: "2024/09/jasa-pasang-pagar" → "jasa pasang pagar" → MONEY_MASTER
    ✅ FIX: "2026-jasa-pasang-pagar" → "jasa pasang pagar" → MONEY_MASTER
    ✅ FIX: detectForPrompt() menggunakan logika SAMA dengan browser
    ✅ FIX: getFactors() menggunakan checkHasSpecification() yang SAMA
    ✅ NEW: detectForPromptFull() dengan upward/breadcrumbs otomatis
    ✅ NEW: detectUpwardFromSlug() untuk deteksi parent dari slug
============================================================ */

(function () {
  "use strict";

  if (window.pageLevelDetectorv22) {
    console.warn("⚠️ [PLD v22.59] Page Level Detector already loaded!");
    return;
  }

  var CONFIG = {
    DEBUG: true,
    BREADCRUMBS_TIMEOUT: 5000,
    BREADCRUMBS_SELECTORS: [
      '.breadcrumb', '.breadcrumbs', '.bread-crumb',
      '[class*="breadcrumb"]', '[class*="bread-crumb"]',
      '.woocommerce-breadcrumb', '.yoast-breadcrumbs',
      '.rank-math-breadcrumb', '.aioseo-breadcrumbs',
      '[itemprop="breadcrumb"]', '[typeof="BreadcrumbList"]',
      'nav[aria-label="breadcrumb"]', 'ol.breadcrumb', 'ul.breadcrumb'
    ]
  };

  function log(message, type) {
    if (!CONFIG.DEBUG && type === "INFO") return;
    if (!type) type = "INFO";
    var icons = {
      INFO: "📘", SUCCESS: "✅", WARN: "⚠️", ERROR: "❌",
      LOCATION: "📍", VARIANT: "🔬", PRICE: "💰",
      MM: "🏛️", CORE: "🧠", DETECT: "🎯", INTENT: "🎯",
      EEAT: "🔐", STRUCTURE: "📐", SNIPPET: "⭐", QUALITY: "📊",
      DOM: "🌐", BREAD: "🍞", TIMER: "⏱️", EXTERNAL: "📦",
      COMMERCIAL: "🛒"
    };
    console.log((icons[type] || "📘") + " [PLD v22.59] " + message);
  }

  log('📦 External JS loaded', 'EXTERNAL');

  var VALID_LEVELS = [
    "home", "pillar", "sub-pillar-tipe-2", "sub-pillar-tipe-1",
    "money-master", "money-page", "money-child", "variant", "sub-variant"
  ];

  var TYPE_LEVEL_MAP = {
    home: 0, pillar: 1, "sub-pillar-tipe-2": 2, "sub-pillar-tipe-1": 3,
    "money-master": 4, "money-page": 5, "money-child": 6, variant: 7, "sub-variant": 8
  };

  var VALID_ENTITY_TYPES = ["produk", "material", "jasa", "desain", "sewa", "artikel"];

  // ============================================================
  // 🔥 ENTITY PILLAR NAMES — HANYA PILLAR UTAMA
  // ============================================================

  var ENTITY_PILLAR_NAMES = {
    jasa: ["jasa konstruksi"],
    desain: ["jasa desain interior"],
    sewa: ["sewa alat konstruksi"],
    produk: ["produk konstruksi"],
    "produk interior": ["produk interior"],
    material: ["material konstruksi"],
    artikel: ["artikel konstruksi"]
  };

  var ENTITY_TRIGGERS = {
    jasa: ["jasa", "kontraktor", "tukang", "borongan", "renovasi", "pasang", "bangun", "perbaikan", "instalasi", "service", "servis", "layanan"],
    desain: ["desain", "interior", "arsitektur", "konsep", "rencana", "gambar", "denah"],
    sewa: ["sewa", "rental", "rent"],
    material: ["material", "bahan", "material bangunan"],
    produk: ["produk", "jual", "beli", "supplier", "distributor", "toko"],
    artikel: ["artikel", "blog", "tips", "panduan", "cara", "tutorial"]
  };

  var ENTITY_PRIORITY = ["jasa", "sewa", "desain", "produk", "material", "artikel"];
  var ENTITY_WORDS = ['jasa', 'sewa', 'material', 'produk', 'desain', 'artikel'];

  // ============================================================
  // 🔥 ENTITY-SPECIFIC WORDS — TIDAK DIANGGAP SPESIFIKASI
  // ============================================================

  // JASA WORDS
  var JASA_WORDS = [
    'jasa', 'kontraktor', 'tukang', 'borongan', 'renovasi',
    'pasang', 'bangun', 'perbaikan', 'instalasi', 'proyek',
    'cor', 'gali', 'urug', 'angkut', 'service', 'servis',
    'desain', 'interior', 'eksterior', 'arsitektur',
    'coring', 'cutting', 'drilling', 'pengeboran',
    'pemancangan', 'pemasangan', 'bongkar', 'potong', 'las', 'sambung',
    'grinding', 'welding', 'bending', 'forming',
    'pondasi', 'tiang', 'pancang', 'bore', 'pile', 'strauss',
    'konstruksi', 'bangunan', 'rumah', 'gedung', 'ruko', 'gudang', 'pabrik',
    'jalan', 'jembatan', 'infrastruktur'
  ];

  // SEWA/RENTAL WORDS
  var SEWA_WORDS = [
    'sewa', 'rental', 'rent', 'alat', 'mesin', 'heavy equipment',
    'excavator', 'bulldozer', 'crane', 'backhoe', 'dozer',
    'vibro', 'roller', 'compactor', 'diesel', 'hydraulic',
    'mini', 'besar', 'kecil', 'sedang', 'medium', 'extra'
  ];

  // MATERIAL WORDS
  var MATERIAL_WORDS = [
    'material', 'bahan', 'semen', 'pasir', 'batu split', 'kerikil',
    'besi', 'baja', 'kayu', 'keramik', 'granit', 'marmer',
    'gypsum', 'plafon', 'paving', 'bata', 'batako', 'hebel',
    'genteng', 'asbes', 'atap', 'baja ringan', 'galvalum',
    'precast', 'pracetak', 'readymix', 'ready mix'
  ];

  // PRODUK WORDS
  var PRODUK_WORDS = [
    'produk', 'jual', 'beli', 'supplier', 'distributor', 'toko', 'shop',
    'pagar panel', 'panel beton', 'pagar beton', 'pagar panel beton',
    'kanopi', 'paving block', 'u ditch', 'box culvert',
    'bata ringan', 'atap baja ringan', 'besi beton'
  ];

  // DESAIN WORDS
  var DESAIN_WORDS = [
    'desain', 'interior', 'eksterior', 'arsitektur', 'layout',
    'denah', 'gambar', 'konsep', 'rencana', 'modern', 'minimalis',
    'klasik', 'tradisional', 'kontemporer', 'elegan', 'luxury',
    'industrial', 'scandinavian', 'jepang', 'rustic', 'vintage'
  ];

  // GABUNGAN SEMUA ENTITY WORDS
  var ALL_ENTITY_WORDS = [];
  ALL_ENTITY_WORDS.push.apply(ALL_ENTITY_WORDS, JASA_WORDS);
  ALL_ENTITY_WORDS.push.apply(ALL_ENTITY_WORDS, SEWA_WORDS);
  ALL_ENTITY_WORDS.push.apply(ALL_ENTITY_WORDS, MATERIAL_WORDS);
  ALL_ENTITY_WORDS.push.apply(ALL_ENTITY_WORDS, PRODUK_WORDS);
  ALL_ENTITY_WORDS.push.apply(ALL_ENTITY_WORDS, DESAIN_WORDS);

  // ============================================================
  // 🔥 PRICE WORDS + BUDGET WORDS
  // ============================================================

  var PRICE_WORDS = [
    'harga', 'biaya', 'tarif', 'estimasi', 'ongkos',
    'murah', 'hemat', 'ekonomis', 'terjangkau',
    'budget', 'mahal', 'mewah', 'premium', 'promo', 'diskon'
  ];

  // ============================================================
  // 🔥 COMMERCIAL INTENT — LENGKAP
  // ============================================================

  var COMMERCIAL_WORDS = [
    'jual', 'beli', 'order', 'pesan', 'booking',
    'sewa', 'rental', 'rent', 'supplier', 'distributor',
    'toko', 'shop', 'butuh', 'cari', 'mau', 'ingin',
    'dapatkan', 'pesan sekarang', 'order sekarang'
  ];

  // ============================================================
  // 🔥 LOCATION WORDS (LENGKAP)
  // ============================================================

  var LOCATION_WORDS = [
    "jakarta", "jakarta pusat", "jakarta barat", "jakarta selatan", "jakarta timur", "jakarta utara",
    "bogor", "depok", "tangerang", "bekasi", "bandung", "karawang", "purwakarta", "cikarang",
    "subang", "cirebon", "semarang", "solo", "surakarta", "pekalongan", "tegal", "magelang",
    "sukoharjo", "boyolali", "klaten", "jogja", "yogyakarta", "surabaya", "malang", "kediri",
    "gresik", "sidoarjo", "mojokerto", "pasuruan", "probolinggo", "jember", "banyuwangi", "madiun",
    "medan", "palembang", "pekanbaru", "padang", "lampung", "batam", "aceh", "jambi", "bengkulu",
    "pontianak", "balikpapan", "samarinda", "banjarmasin", "makassar", "manado", "palu", "kendari",
    "bali", "denpasar", "gianyar", "tabanan", "bangli", "karangasem", "klungkung", "buleleng",
    "mataram", "kupang", "terdekat", "sekitar", "dekat", "near"
  ];

  // ============================================================
  // 🔥 SPECIFICATION WORDS (TEKNIS MURNI) — FALLBACK
  // ============================================================

  var SPECIFICATION_WORDS = {
    mutu: ["k225", "k250", "k300", "k350", "k400", "k500", "fc", "m6", "m8", "m10", "m12", "m16", "m20", "b0", "b1", "b2", "b3", "sni"],
    satuan: ["per meter", "per lembar", "per batang", "per kubik", "per unit", "per m", "per lbr", "per kg", "per ton", "per jam", "per hari", "per minggu", "per bulan"],
    finishing: ["polos", "motif", "bermotif", "bercorak", "tekstur", "serat", "halus", "kasar", "matte", "glossy", "doff", "gloss", "satin", "anyaman", "natural", "ekspos", "custom", "polosan"],
    dimensi: ["ukuran", "dimensi", "spesifikasi", "tipe", "model", "varian", "seri", "tinggi", "rendah", "panjang", "pendek", "lebar", "sempit", "tebal", "tipis", "dalam", "dangkal", "diameter", "radius"],
    metode: ["hidrolik", "manual", "auger", "rotary", "percussive", "dry", "wet", "basah", "kering"]
  };

  // HANYA TEKNIS MURNI
  var ALL_SPEC_WORDS = [];
  for (var category in SPECIFICATION_WORDS) {
    if (SPECIFICATION_WORDS.hasOwnProperty(category)) {
      ALL_SPEC_WORDS.push.apply(ALL_SPEC_WORDS, SPECIFICATION_WORDS[category]);
    }
  }

  // ============================================================
  // 🔥 SPESIFIKASI PER ENTITY UNTUK VARIANT DETECTION (PLD v22.59)
  // ============================================================

  // PRODUK SPECIFICATIONS
  var PRODUK_SPECS = {
    mutu: ["k225", "k250", "k300", "k350", "k400", "k500", "fc", "sni", "standar", "premium", "ekonomis"],
    finishing: ["polos", "motif", "bermotif", "bercorak", "tekstur", "serat", "halus", "kasar", "matte", "glossy", "doff", "gloss", "satin", "anyaman", "natural", "ekspos", "custom", "polosan", "cat", "coating", "lapisan", "vernis", "anti gores", "anti air", "anti jamur"],
    dimensi: ["ukuran", "dimensi", "spesifikasi", "tipe", "model", "varian", "seri", "tinggi", "rendah", "panjang", "pendek", "lebar", "sempit", "tebal", "tipis", "dalam", "dangkal", "diameter", "radius", "besar", "kecil", "sedang", "mini", "jumbo"],
    material: ["beton", "baja", "besi", "kayu", "keramik", "granit", "marmer", "plafon", "gypsum", "kanopi", "paving", "readymix", "precast", "pracetak", "aluminium", "kaca", "batu", "bata", "hebel", "batako", "semen", "pasir"],
    warna: ["putih", "hitam", "abu-abu", "merah", "biru", "kuning", "hijau", "coklat", "netral", "warm", "cool", "pastel", "dark", "light", "krem", "maroon", "navy", "forest", "gold", "silver", "bronze", "copper", "rose gold", "teal", "turquoise", "lavender", "magenta", "coral", "salmon", "peach", "mint"]
  };

  // MATERIAL SPECIFICATIONS
  var MATERIAL_SPECS = {
    grade: ["grade a", "grade b", "grade c", "sni", "standar", "premium", "ekonomis", "kualitas 1", "kualitas 2", "kualitas 3", "kelas 1", "kelas 2", "kelas 3"],
    finishing: ["ulir", "polos", "galvanis", "berlapis", "cat", "coating", "anyaman", "anti karat", "anti korosi", "anti air", "diamon", "rough", "smooth", "textured"],
    dimensi: ["tebal", "panjang", "lebar", "diameter", "radius", "ukuran", "dimensi", "ketebalan", "kedalaman", "tinggi"],
    berat: ["kg", "ton", "m3", "liter", "gram", "ons"],
    jenis: ["semen", "pasir", "batu split", "kerikil", "besi", "baja", "kayu", "keramik", "granit", "marmer", "gypsum", "plafon", "paving", "bata", "batako", "hebel", "genteng", "asbes", "atap", "baja ringan", "galvalum", "precast", "pracetak", "readymix"]
  };

  // SEWA SPECIFICATIONS
  var SEWA_SPECS = {
    tipe: ["mini", "besar", "kecil", "sedang", "medium", "heavy", "standar", "extra", "ekstra", "jumbo", "compact", "full size", "large"],
    merek: ["pc75", "pc200", "pc300", "pc350", "pc400", "komatsu", "hitachi", "caterpillar", "cat", "volvo", "hyundai", "doosan", "kobelco", "sumitomo", "case", "jcb", "liebherr", "kubota", "yanmar", "perkins", "cummin"],
    kapasitas: ["ton", "m3", "kg", "liter", "galon"],
    kondisi: ["baru", "bekas", "servis", "recondition", "rebuilt", "ready", "siap pakai", "prima", "baik", "layak", "standar"],
    durasi: ["harian", "mingguan", "bulanan", "tahunan", "per jam", "per hari", "per minggu", "per bulan", "short term", "long term"],
    fungsi: ["excavator", "bulldozer", "crane", "backhoe", "dozer", "vibro", "roller", "compactor", "diesel", "hydraulic", "forklift", "loader", "grader", "scraper", "tractor", "dump truck"]
  };

  // JASA SPECIFICATIONS
  var JASA_SPECS = {
    teknik: ["coring", "cutting", "drilling", "pengeboran", "pemancangan", "pemasangan", "bongkar", "potong", "las", "sambung", "grinding", "welding", "bending", "forming", "gali", "urug", "angkut", "cor", "pasang", "bangun", "renovasi", "perbaikan", "instalasi", "service", "servis", "konstruksi", "pembangunan", "proyek"],
    metode: ["manual", "hidrolik", "auger", "rotary", "percussive", "dry", "wet", "basah", "kering", "modern", "tradisional", "konvensional"],
    skala: ["rumahan", "komersial", "industri", "residential", "commercial", "industrial", "kecil", "sedang", "besar", "menengah"],
    finishing: ["polos", "motif", "bermotif", "bercorak", "tekstur", "serat", "halus", "kasar", "matte", "glossy", "doff", "gloss", "satin", "anyaman", "natural", "ekspos", "custom", "polosan", "cat", "coating", "lapisan", "vernis"],
    kedalaman: ["m", "meter", "cm", "centimeter", "feet", "ft"]
  };

  // DESAIN SPECIFICATIONS
  var DESAIN_SPECS = {
    gaya: ["modern", "minimalis", "klasik", "tradisional", "kontemporer", "elegan", "luxury", "industrial", "scandinavian", "jepang", "rustic", "vintage", "bohemian", "art deco", "mid century", "victorian", "gothic", "renaissance", "baroque", "rococo", "neoklasik", "art nouveau", "bauhaus", "postmodern", "dekonstruksi", "high tech", "eklektik", "transisi", "tropis", "mediterania", "kolonial", "peranakan", "balinese", "javanese"],
    warna: ["putih", "hitam", "abu-abu", "merah", "biru", "kuning", "hijau", "coklat", "netral", "warm", "cool", "pastel", "dark", "light", "krem", "maroon", "navy", "forest", "gold", "silver", "bronze", "copper", "rose gold", "teal", "turquoise", "lavender", "magenta", "coral", "salmon", "peach", "mint"],
    material: ["kayu", "besi", "kaca", "marmer", "granit", "keramik", "plafon", "gypsum", "pvc", "acp", "vinyl", "wpc", "grc", "hpl", "bambu", "rotan", "anyaman", "kain", "kulit", "karpet", "parket", "ubin", "batu alam", "batu bata", "beton ekspos"],
    fungsi: ["ruang tamu", "kamar tidur", "dapur", "kamar mandi", "ruang kerja", "ruang keluarga", "teras", "taman", "ruang makan", "ruang tv", "ruang santai", "ruang hobi", "kamar anak", "kamar utama", "kamar pembantu", "garasi", "gudang", "ruang cuci", "ruang jemur"],
    konsep: ["open space", "split level", "loft", "studio", "apartment", "villa", "tiny house", "smart home", "eco home", "sustainable", "green building", "biophilic", "zen", "feng shui", "vastu", "wabi sabi"],
    furniture: ["minimalis", "skandinavia", "jepang", "klasik", "modern", "retro", "vintage", "industrial", "rustic", "bohemian", "mid century", "art deco", "contemporary"]
  };

  // ============================================================
  // 🔥 SUB-PILLAR KEYWORDS
  // ============================================================

  var SUB_PILLAR_2_KEYWORDS = ['daftar', 'jenis', 'macam', 'kategori', 'tipe', 'list', 'katalog', 'rekomendasi', 'pilihan', 'variasi', 'model', 'gaya', 'varian'];
  var SUB_PILLAR_1_KEYWORDS = ['perbandingan', 'vs', 'versus', 'kelebihan', 'kekurangan', 'perbedaan', 'lebih baik', 'unggul', 'terbaik', 'mana yang', 'antara', 'atau'];

  var HIGH_VOLUME_WORDS = ["murah", "hemat", "ekonomis", "terjangkau", "budget", "premium", "luxury", "mewah", "mahal"];
  var SIZE_WORDS = ["mini", "besar", "kecil", "sedang", "medium", "extra", "ekstra", "standar"];

  var STOPWORDS = new Set(["dan", "atau", "serta", "yang", "dari", "ke", "di", "untuk", "dengan", "ini", "itu", "akan", "telah", "sudah", "masih", "pada", "oleh", "karena", "sehingga", "setelah", "sebelum"]);

  var INTENT_TRIGGERS = {
    transactional: ["beli", "order", "pesan", "booking", "sewa sekarang", "harga", "biaya", "tarif", "estimasi", "promo", "diskon", "bayar", "cicilan", "kredit", "dapatkan", "pesan sekarang", "murah", "hemat", "ekonomis"],
    informational: ["cara", "tutorial", "panduan", "tips", "langkah", "bagaimana", "apa itu", "pengertian", "definisi", "contoh", "jenis", "perbedaan", "kelebihan", "kekurangan", "manfaat", "fungsi"],
    commercial: ["review", "testimoni", "rekomendasi", "terbaik", "paling", "vs", "versus", "perbandingan", "alternatif", "pilihan", "populer", "favorit", "unggulan"],
    navigational: ["login", "daftar", "kontak", "tentang", "hubungi", "alamat", "lokasi", "maps", "direksi"]
  };

  var SEMANTIC_CLUSTERS = {
    "konstruksi": ["bangunan", "proyek", "infrastruktur", "pembangunan", "developer", "kontraktor"],
    "desain": ["interior", "arsitektur", "estetika", "fungsional", "layout", "denah"],
    "material": ["semen", "besi", "baja", "kayu", "keramik", "granit", "marmer", "hebel"],
    "jasa": ["kontraktor", "tukang", "borongan", "renovasi", "instalasi", "service"],
    "sewa": ["rental", "excavator", "bulldozer", "crane", "alat berat", "diesel"],
    "produk": ["precast", "readymix", "pracetak", "siap pakai", "custom"]
  };

  // ============================================================
  // 📌 FUNGSI DASAR
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
  // 🔥 FUNGSI DETEKSI DASAR
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

  function checkHasPrice(text) {
    var lower = text.toLowerCase();
    for (var i = 0; i < PRICE_WORDS.length; i++) {
      if (lower.indexOf(PRICE_WORDS[i]) !== -1) return true;
    }
    return false;
  }

  function checkHasCommercial(text) {
    var lower = text.toLowerCase();
    for (var i = 0; i < COMMERCIAL_WORDS.length; i++) {
      if (lower.indexOf(COMMERCIAL_WORDS[i]) !== -1) return true;
    }
    return false;
  }

  // ============================================================
  // 🔥 checkHasSpecification — PER ENTITY LENGKAP (PLD v22.59)
  // ============================================================

  function checkHasSpecification(text, entityType) {
    if (!text) return false;
    var lower = text.toLowerCase();

    // ============================================================
    // STEP 1: CEK SPESIFIKASI PER ENTITY
    // ============================================================

    // ---------- PRODUK ----------
    if (entityType === "produk") {
      var mutuList = PRODUK_SPECS.mutu || [];
      for (var i = 0; i < mutuList.length; i++) {
        if (new RegExp("\\b" + mutuList[i] + "\\b", "i").test(lower)) {
          log('🔬 PRODUK SPEC: mutu ' + mutuList[i] + ' ditemukan', 'VARIANT');
          return true;
        }
      }

      var finishingList = PRODUK_SPECS.finishing || [];
      for (var i = 0; i < finishingList.length; i++) {
        if (new RegExp("\\b" + finishingList[i] + "\\b", "i").test(lower)) {
          var isEntityWord = PRODUK_WORDS.some(function(w) { return finishingList[i] === w; });
          if (!isEntityWord) {
            log('🔬 PRODUK SPEC: finishing ' + finishingList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      if (/\d+\s*(m|mm|cm|meter|kg|ton|inch|inci|ft|feet)/gi.test(lower)) {
        log('🔬 PRODUK SPEC: dimensi ditemukan', 'VARIANT');
        return true;
      }

      if (/\d+\s*[x×]\s*\d+\s*(cm|m|meter|mm)/gi.test(lower)) {
        log('🔬 PRODUK SPEC: ukuran ditemukan', 'VARIANT');
        return true;
      }

      var warnaList = PRODUK_SPECS.warna || [];
      for (var i = 0; i < warnaList.length; i++) {
        if (new RegExp("\\b" + warnaList[i] + "\\b", "i").test(lower)) {
          var isEntityWord = PRODUK_WORDS.some(function(w) { return warnaList[i] === w; });
          if (!isEntityWord) {
            log('🔬 PRODUK SPEC: warna ' + warnaList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }
    }

    // ---------- MATERIAL ----------
    if (entityType === "material") {
      var gradeList = MATERIAL_SPECS.grade || [];
      for (var i = 0; i < gradeList.length; i++) {
        if (new RegExp("\\b" + gradeList[i] + "\\b", "i").test(lower)) {
          log('🔬 MATERIAL SPEC: grade ' + gradeList[i] + ' ditemukan', 'VARIANT');
          return true;
        }
      }

      var finishingList = MATERIAL_SPECS.finishing || [];
      for (var i = 0; i < finishingList.length; i++) {
        if (new RegExp("\\b" + finishingList[i] + "\\b", "i").test(lower)) {
          var isEntityWord = MATERIAL_WORDS.some(function(w) { return finishingList[i] === w; });
          if (!isEntityWord) {
            log('🔬 MATERIAL SPEC: finishing ' + finishingList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      if (/\d+\s*(mm|cm|m|meter|kg|ton|m3|liter)/gi.test(lower)) {
        log('🔬 MATERIAL SPEC: dimensi ditemukan', 'VARIANT');
        return true;
      }

      var jenisList = MATERIAL_SPECS.jenis || [];
      for (var i = 0; i < jenisList.length; i++) {
        if (new RegExp("\\b" + jenisList[i] + "\\b", "i").test(lower)) {
          var isEntityWord = MATERIAL_WORDS.some(function(w) { return jenisList[i] === w; });
          if (!isEntityWord) {
            log('🔬 MATERIAL SPEC: jenis ' + jenisList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      var beratList = MATERIAL_SPECS.berat || [];
      for (var i = 0; i < beratList.length; i++) {
        if (new RegExp("\\b" + beratList[i] + "\\b", "i").test(lower)) {
          log('🔬 MATERIAL SPEC: berat ' + beratList[i] + ' ditemukan', 'VARIANT');
          return true;
        }
      }
    }

    // ---------- SEWA ----------
    if (entityType === "sewa") {
      var merekList = SEWA_SPECS.merek || [];
      for (var i = 0; i < merekList.length; i++) {
        if (new RegExp("\\b" + merekList[i] + "\\b", "i").test(lower)) {
          log('🔬 SEWA SPEC: merek ' + merekList[i] + ' ditemukan', 'VARIANT');
          return true;
        }
      }

      var tipeList = SEWA_SPECS.tipe || [];
      for (var i = 0; i < tipeList.length; i++) {
        if (new RegExp("\\b" + tipeList[i] + "\\b", "i").test(lower)) {
          var isEntityWord = SEWA_WORDS.some(function(w) { return tipeList[i] === w; });
          if (!isEntityWord) {
            log('🔬 SEWA SPEC: tipe ' + tipeList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      if (/\d+\s*(ton|m3|kg|liter)/gi.test(lower)) {
        log('🔬 SEWA SPEC: kapasitas ditemukan', 'VARIANT');
        return true;
      }

      var fungsiList = SEWA_SPECS.fungsi || [];
      for (var i = 0; i < fungsiList.length; i++) {
        if (new RegExp("\\b" + fungsiList[i] + "\\b", "i").test(lower)) {
          var isEntityWord = SEWA_WORDS.some(function(w) { return fungsiList[i] === w; });
          if (!isEntityWord) {
            log('🔬 SEWA SPEC: fungsi ' + fungsiList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      var kondisiList = SEWA_SPECS.kondisi || [];
      for (var i = 0; i < kondisiList.length; i++) {
        if (new RegExp("\\b" + kondisiList[i] + "\\b", "i").test(lower)) {
          var isEntityWord = SEWA_WORDS.some(function(w) { return kondisiList[i] === w; });
          if (!isEntityWord) {
            log('🔬 SEWA SPEC: kondisi ' + kondisiList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      var durasiList = SEWA_SPECS.durasi || [];
      for (var i = 0; i < durasiList.length; i++) {
        if (new RegExp("\\b" + durasiList[i] + "\\b", "i").test(lower)) {
          log('🔬 SEWA SPEC: durasi ' + durasiList[i] + ' ditemukan', 'VARIANT');
          return true;
        }
      }
    }

    // ---------- JASA ----------
    if (entityType === "jasa") {
      var teknikList = JASA_SPECS.teknik || [];
      for (var i = 0; i < teknikList.length; i++) {
        if (new RegExp("\\b" + teknikList[i] + "\\b", "i").test(lower)) {
          var isEntityWord = JASA_WORDS.some(function(w) { return teknikList[i] === w; });
          if (!isEntityWord) {
            log('🔬 JASA SPEC: teknik ' + teknikList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      var metodeList = JASA_SPECS.metode || [];
      for (var i = 0; i < metodeList.length; i++) {
        if (new RegExp("\\b" + metodeList[i] + "\\b", "i").test(lower)) {
          var isEntityWord = JASA_WORDS.some(function(w) { return metodeList[i] === w; });
          if (!isEntityWord) {
            log('🔬 JASA SPEC: metode ' + metodeList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      var skalaList = JASA_SPECS.skala || [];
      for (var i = 0; i < skalaList.length; i++) {
        if (new RegExp("\\b" + skalaList[i] + "\\b", "i").test(lower)) {
          var isEntityWord = JASA_WORDS.some(function(w) { return skalaList[i] === w; });
          if (!isEntityWord) {
            log('🔬 JASA SPEC: skala ' + skalaList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      var finishingList = JASA_SPECS.finishing || [];
      for (var i = 0; i < finishingList.length; i++) {
        if (new RegExp("\\b" + finishingList[i] + "\\b", "i").test(lower)) {
          var isEntityWord = JASA_WORDS.some(function(w) { return finishingList[i] === w; });
          if (!isEntityWord) {
            log('🔬 JASA SPEC: finishing ' + finishingList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      if (/\d+\s*(m|meter|cm|centimeter|feet|ft)/gi.test(lower)) {
        var hasEntityWord = JASA_WORDS.some(function(w) { return lower.indexOf(w) !== -1; });
        if (hasEntityWord) {
          log('🔬 JASA SPEC: kedalaman ditemukan', 'VARIANT');
          return true;
        }
      }
    }

    // ---------- DESAIN ----------
    if (entityType === "desain") {
      var gayaList = DESAIN_SPECS.gaya || [];
      for (var i = 0; i < gayaList.length; i++) {
        if (new RegExp("\\b" + gayaList[i] + "\\b", "i").test(lower)) {
          var isEntityWord = DESAIN_WORDS.some(function(w) { return gayaList[i] === w; });
          if (!isEntityWord) {
            log('🔬 DESAIN SPEC: gaya ' + gayaList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      var warnaList = DESAIN_SPECS.warna || [];
      for (var i = 0; i < warnaList.length; i++) {
        if (new RegExp("\\b" + warnaList[i] + "\\b", "i").test(lower)) {
          var isEntityWord = DESAIN_WORDS.some(function(w) { return warnaList[i] === w; });
          if (!isEntityWord) {
            log('🔬 DESAIN SPEC: warna ' + warnaList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      var fungsiList = DESAIN_SPECS.fungsi || [];
      for (var i = 0; i < fungsiList.length; i++) {
        if (new RegExp("\\b" + fungsiList[i] + "\\b", "i").test(lower)) {
          var isEntityWord = DESAIN_WORDS.some(function(w) { return fungsiList[i] === w; });
          if (!isEntityWord) {
            log('🔬 DESAIN SPEC: fungsi ' + fungsiList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      var konsepList = DESAIN_SPECS.konsep || [];
      for (var i = 0; i < konsepList.length; i++) {
        if (new RegExp("\\b" + konsepList[i] + "\\b", "i").test(lower)) {
          var isEntityWord = DESAIN_WORDS.some(function(w) { return konsepList[i] === w; });
          if (!isEntityWord) {
            log('🔬 DESAIN SPEC: konsep ' + konsepList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      var materialList = DESAIN_SPECS.material || [];
      for (var i = 0; i < materialList.length; i++) {
        if (new RegExp("\\b" + materialList[i] + "\\b", "i").test(lower)) {
          var isEntityWord = DESAIN_WORDS.some(function(w) { return materialList[i] === w; });
          if (!isEntityWord) {
            log('🔬 DESAIN SPEC: material ' + materialList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      var furnitureList = DESAIN_SPECS.furniture || [];
      for (var i = 0; i < furnitureList.length; i++) {
        if (new RegExp("\\b" + furnitureList[i] + "\\b", "i").test(lower)) {
          var isEntityWord = DESAIN_WORDS.some(function(w) { return furnitureList[i] === w; });
          if (!isEntityWord) {
            log('🔬 DESAIN SPEC: furniture ' + furnitureList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }
    }

    // ============================================================
    // STEP 2: EXCLUSION — ENTITY WORDS BUKAN SPESIFIKASI
    // ============================================================

    // JASA → JASA_WORDS bukan spesifikasi
    if (entityType === "jasa") {
      var words = lower.split(/\s+/);
      var allAreJasaWords = true;
      for (var i = 0; i < words.length; i++) {
        var isJasaWord = false;
        for (var j = 0; j < JASA_WORDS.length; j++) {
          if (words[i] === JASA_WORDS[j] || lower.indexOf(JASA_WORDS[j]) !== -1) {
            isJasaWord = true;
            break;
          }
        }
        if (!isJasaWord && words[i].length > 2) {
          allAreJasaWords = false;
          break;
        }
      }
      if (allAreJasaWords) return false;
    }

    // SEWA → SEWA_WORDS bukan spesifikasi
    if (entityType === "sewa") {
      var words = lower.split(/\s+/);
      var allAreSewaWords = true;
      for (var i = 0; i < words.length; i++) {
        var isSewaWord = false;
        for (var j = 0; j < SEWA_WORDS.length; j++) {
          if (words[i] === SEWA_WORDS[j] || lower.indexOf(SEWA_WORDS[j]) !== -1) {
            isSewaWord = true;
            break;
          }
        }
        if (!isSewaWord && words[i].length > 2) {
          allAreSewaWords = false;
          break;
        }
      }
      if (allAreSewaWords) return false;
    }

    // MATERIAL → MATERIAL_WORDS bukan spesifikasi
    if (entityType === "material") {
      var words = lower.split(/\s+/);
      var allAreMaterialWords = true;
      for (var i = 0; i < words.length; i++) {
        var isMaterialWord = false;
        for (var j = 0; j < MATERIAL_WORDS.length; j++) {
          if (words[i] === MATERIAL_WORDS[j] || lower.indexOf(MATERIAL_WORDS[j]) !== -1) {
            isMaterialWord = true;
            break;
          }
        }
        if (!isMaterialWord && words[i].length > 2) {
          allAreMaterialWords = false;
          break;
        }
      }
      if (allAreMaterialWords) return false;
    }

    // PRODUK → PRODUK_WORDS bukan spesifikasi
    if (entityType === "produk") {
      var words = lower.split(/\s+/);
      var allAreProdukWords = true;
      for (var i = 0; i < words.length; i++) {
        var isProdukWord = false;
        for (var j = 0; j < PRODUK_WORDS.length; j++) {
          if (words[i] === PRODUK_WORDS[j] || lower.indexOf(PRODUK_WORDS[j]) !== -1) {
            isProdukWord = true;
            break;
          }
        }
        if (!isProdukWord && words[i].length > 2) {
          allAreProdukWords = false;
          break;
        }
      }
      if (allAreProdukWords) return false;
    }

    // DESAIN → DESAIN_WORDS bukan spesifikasi
    if (entityType === "desain") {
      var words = lower.split(/\s+/);
      var allAreDesainWords = true;
      for (var i = 0; i < words.length; i++) {
        var isDesainWord = false;
        for (var j = 0; j < DESAIN_WORDS.length; j++) {
          if (words[i] === DESAIN_WORDS[j] || lower.indexOf(DESAIN_WORDS[j]) !== -1) {
            isDesainWord = true;
            break;
          }
        }
        if (!isDesainWord && words[i].length > 2) {
          allAreDesainWords = false;
          break;
        }
      }
      if (allAreDesainWords) return false;
    }

    // ============================================================
    // STEP 3: FALLBACK — Cek ALL_SPEC_WORDS
    // ============================================================
    for (var i = 0; i < ALL_SPEC_WORDS.length; i++) {
      if (lower.indexOf(ALL_SPEC_WORDS[i]) !== -1) {
        return true;
      }
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

  function detectSubPillar(text) {
    var lower = text.toLowerCase();
    for (var i = 0; i < SUB_PILLAR_2_KEYWORDS.length; i++) {
      if (lower.indexOf(SUB_PILLAR_2_KEYWORDS[i]) !== -1) return "sub-pillar-tipe-2";
    }
    for (var i = 0; i < SUB_PILLAR_1_KEYWORDS.length; i++) {
      if (lower.indexOf(SUB_PILLAR_1_KEYWORDS[i]) !== -1) return "sub-pillar-tipe-1";
    }
    return null;
  }

  function detectPillar(text, entityType) {
    var cleanLower = text.toLowerCase().trim();

    for (var entity in ENTITY_PILLAR_NAMES) {
      if (!ENTITY_PILLAR_NAMES.hasOwnProperty(entity)) continue;
      var patterns = ENTITY_PILLAR_NAMES[entity];
      for (var i = 0; i < patterns.length; i++) {
        if (cleanLower === patterns[i]) {
          var isEntityMatch = entity === entityType ||
                             (entity === "produk interior" && entityType === "produk");
          if (isEntityMatch) return true;
        }
      }
    }
    return false;
  }

  function hasTechnicalSpec(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    var TECHNICAL_SPECS = ["k225", "k250", "k300", "k350", "k400", "k500", "fc", "m6", "m8", "m10", "m12", "m16", "m20", "b0", "b1", "b2", "b3", "sni"];
    for (var i = 0; i < TECHNICAL_SPECS.length; i++) {
      if (new RegExp("\\b" + TECHNICAL_SPECS[i] + "\\b", "i").test(lower)) return true;
    }
    return false;
  }

  function isSubVariant(text) {
    if (!text) return false;
    var score = 0;
    var lower = text.toLowerCase();
    if ((lower.match(/\d+\s*(m|mm|cm|meter|kg|ton|inch|inci)/gi) || []).length >= 1) score += 2;
    if ((lower.match(/\d+x\d+/gi) || []).length >= 1) score += 2;
    if ((lower.match(/\d+(?:\.\d+)?\s*(?:cm|mm|m|meter)\s*(?:x|×)\s*\d+(?:\.\d+)?\s*(?:cm|mm|m|meter)/gi) || []).length >= 1) score += 3;
    var uniqueNumbers = (text.match(/\d+/g) || []).filter(function(v, i, a) { return a.indexOf(v) === i; });
    if (uniqueNumbers.length >= 2) score += 1;
    if (/\bukuran\s+\d+/.test(lower)) score += 2;
    if (/\bdimensi\s+\d+/.test(lower)) score += 2;
    if (/\b(tebal|panjang|lebar|tinggi|dalam|diameter)\s+\d+/.test(lower)) score += 2;
    return score >= 2;
  }

  // ============================================================
  // 🔥 FUNGSI getCoreWords — HANYA HAPUS 1 KATA AWAL ENTITY
  // ============================================================

  function getCoreWords(text, entityType) {
    if (!text) return [];

    var coreText = text.toLowerCase();

    // 1. Hapus price words
    var moneyWords = ['harga', 'biaya', 'tarif', 'estimasi', 'ongkos'];
    for (var i = 0; i < moneyWords.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + moneyWords[i] + "\\b", 'g'), '');
    }

    // 2. HAPUS HANYA 1 KATA AWAL ENTITY (bukan semua kata entity!)
    var entityFirstWords = {
      'jasa': 'jasa',
      'sewa': 'sewa',
      'produk': 'produk',
      'material': 'material',
      'desain': 'desain',
      'artikel': 'artikel'
    };

    var firstWord = entityFirstWords[entityType] || '';
    if (firstWord) {
      coreText = coreText.replace(new RegExp("\\b" + firstWord + "\\b", 'g'), '');
    }

    // 3. Hapus stopwords
    var stopwords = ["dan", "atau", "serta", "yang", "dari", "ke", "di", "untuk", "dengan", "ini", "itu", "akan", "telah", "sudah", "masih", "pada", "oleh", "karena", "sehingga", "setelah", "sebelum"];
    for (var i = 0; i < stopwords.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + stopwords[i] + "\\b", 'g'), ' ');
    }

    // 4. Hapus lokasi
    for (var i = 0; i < LOCATION_WORDS.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + LOCATION_WORDS[i] + "\\b", 'g'), ' ');
    }

    // 5. Hapus sub-pillar keywords
    var subPillarWords = ['daftar', 'jenis', 'macam', 'kategori', 'tipe', 'list', 'katalog', 'rekomendasi', 'pilihan', 'variasi', 'model', 'gaya', 'varian', 'perbandingan', 'vs', 'versus', 'kelebihan', 'kekurangan', 'perbedaan', 'lebih baik', 'unggul', 'terbaik'];
    for (var i = 0; i < subPillarWords.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + subPillarWords[i] + "\\b", 'g'), ' ');
    }

    // 6. Hapus commercial words
    for (var i = 0; i < COMMERCIAL_WORDS.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + COMMERCIAL_WORDS[i] + "\\b", 'g'), ' ');
    }

    var coreWords = coreText.split(/\s+/).filter(function(w) { return w.length > 2; });
    return coreWords;
  }

  // ============================================================
  // 🔥 VARIANT DETECTION
  // ============================================================

  function detectVariantByPattern(text, entityType) {
    if (!text) return { isVariant: false, score: 0, reasons: [] };
    
    var score = 0;
    var reasons = [];
    var lower = text.toLowerCase();
    var words = lower.split(/\s+/);

    // STEP 1: CEK APAKAH SEMUA KATA ADALAH ENTITY WORDS
    if (entityType === "jasa") {
      var allAreEntityWords = true;
      for (var i = 0; i < words.length; i++) {
        var isEntityWord = false;
        for (var j = 0; j < JASA_WORDS.length; j++) {
          if (words[i] === JASA_WORDS[j] || lower.indexOf(JASA_WORDS[j]) !== -1) {
            isEntityWord = true;
            break;
          }
        }
        if (!isEntityWord && words[i].length > 2) {
          allAreEntityWords = false;
          break;
        }
      }
      if (allAreEntityWords) {
        return { isVariant: false, score: 0, reasons: ["All words are jasa words → MONEY_MASTER"] };
      }
    }

    if (entityType === "sewa") {
      var allAreEntityWords = true;
      for (var i = 0; i < words.length; i++) {
        var isEntityWord = false;
        for (var j = 0; j < SEWA_WORDS.length; j++) {
          if (words[i] === SEWA_WORDS[j] || lower.indexOf(SEWA_WORDS[j]) !== -1) {
            isEntityWord = true;
            break;
          }
        }
        if (!isEntityWord && words[i].length > 2) {
          allAreEntityWords = false;
          break;
        }
      }
      if (allAreEntityWords) {
        return { isVariant: false, score: 0, reasons: ["All words are sewa words → MONEY_MASTER"] };
      }
    }

    if (entityType === "material") {
      var allAreEntityWords = true;
      for (var i = 0; i < words.length; i++) {
        var isEntityWord = false;
        for (var j = 0; j < MATERIAL_WORDS.length; j++) {
          if (words[i] === MATERIAL_WORDS[j] || lower.indexOf(MATERIAL_WORDS[j]) !== -1) {
            isEntityWord = true;
            break;
          }
        }
        if (!isEntityWord && words[i].length > 2) {
          allAreEntityWords = false;
          break;
        }
      }
      if (allAreEntityWords) {
        return { isVariant: false, score: 0, reasons: ["All words are material words → MONEY_MASTER"] };
      }
    }

    if (entityType === "produk") {
      var allAreEntityWords = true;
      for (var i = 0; i < words.length; i++) {
        var isEntityWord = false;
        for (var j = 0; j < PRODUK_WORDS.length; j++) {
          if (words[i] === PRODUK_WORDS[j] || lower.indexOf(PRODUK_WORDS[j]) !== -1) {
            isEntityWord = true;
            break;
          }
        }
        if (!isEntityWord && words[i].length > 2) {
          allAreEntityWords = false;
          break;
        }
      }
      if (allAreEntityWords) {
        return { isVariant: false, score: 0, reasons: ["All words are produk words → MONEY_MASTER"] };
      }
    }

    if (entityType === "desain") {
      var allAreEntityWords = true;
      for (var i = 0; i < words.length; i++) {
        var isEntityWord = false;
        for (var j = 0; j < DESAIN_WORDS.length; j++) {
          if (words[i] === DESAIN_WORDS[j] || lower.indexOf(DESAIN_WORDS[j]) !== -1) {
            isEntityWord = true;
            break;
          }
        }
        if (!isEntityWord && words[i].length > 2) {
          allAreEntityWords = false;
          break;
        }
      }
      if (allAreEntityWords) {
        return { isVariant: false, score: 0, reasons: ["All words are desain words → MONEY_MASTER"] };
      }
    }

    // STEP 2: EXCLUSION
    if (PRICE_WORDS.some(function(w) { return lower.indexOf(w) !== -1; })) {
      return { isVariant: false, score: 0, reasons: ["Price word → MONEY_PAGE"] };
    }

    if (COMMERCIAL_WORDS.some(function(w) { return lower.indexOf(w) !== -1; })) {
      return { isVariant: false, score: 0, reasons: ["Commercial word → MONEY_PAGE"] };
    }

    if (LOCATION_WORDS.some(function(w) { return lower.indexOf(w) !== -1; })) {
      var hasService = /\b(jasa|layanan|sewa|produk|material|kontraktor|tukang|borongan|pasang|bangun|renovasi|perbaikan|instalasi|service|servis|pemasangan|pemancangan|pengeboran|pondasi|tiang|pancang|pagar|panel|beton|baja|besi|kayu|batu|keramik|granit|marmer|plafon|gypsum|kanopi|paving|readymix|cor|desain|interior|eksterior|arsitektur|konstruksi|rumah|gedung|ruko|gudang|pabrik|jalan|jembatan|infrastruktur|mini|pile|bore|strauss)\b/i.test(lower);
      if (hasService) {
        return { isVariant: false, score: 0, reasons: ["Location word → MONEY_CHILD"] };
      }
    }

    if (/\bper\s+(meter|titik|m|kg|hari|jam|minggu|bulan|unit|buah|item|lembar|bagian|paket|sesi|kali|kubik|m2|m3|liter|ton|meter lari|m')\b/i.test(lower)) {
      return { isVariant: false, score: 0, reasons: ["Per unit → MONEY_PAGE"] };
    }

    var hasHighVolume = HIGH_VOLUME_WORDS.some(function(w) { return lower.indexOf(w) !== -1; });
    if (hasHighVolume) {
      var hasNoun = /\b(jasa|layanan|produk|material|pondasi|tiang|pancang|pagar|panel|beton|baja|besi|kayu|batu|keramik|granit|marmer|plafon|gypsum|kanopi|paving|readymix|cor|sewa|rental|alat|mesin|bangunan|konstruksi)\b/i.test(lower);
      if (hasNoun) {
        return { isVariant: false, score: 0, reasons: ["High volume keyword → MONEY_PAGE"] };
      }
    }

    // STEP 3: CEK SPESIFIKASI PER ENTITY (VARIANT)
    var specResult = checkHasSpecification(text, entityType);
    
    if (specResult) {
      var specDetails = [];
      var specType = "";
      
      if (entityType === "produk") {
        for (var key in PRODUK_SPECS) {
          if (PRODUK_SPECS.hasOwnProperty(key)) {
            var list = PRODUK_SPECS[key];
            for (var i = 0; i < list.length; i++) {
              if (new RegExp("\\b" + list[i] + "\\b", "i").test(lower)) {
                specDetails.push(list[i]);
                specType = key;
                break;
              }
            }
          }
        }
      }
      
      if (entityType === "jasa") {
        for (var key in JASA_SPECS) {
          if (JASA_SPECS.hasOwnProperty(key)) {
            var list = JASA_SPECS[key];
            for (var i = 0; i < list.length; i++) {
              if (new RegExp("\\b" + list[i] + "\\b", "i").test(lower)) {
                specDetails.push(list[i]);
                specType = key;
                break;
              }
            }
          }
        }
      }
      
      if (entityType === "sewa") {
        for (var key in SEWA_SPECS) {
          if (SEWA_SPECS.hasOwnProperty(key)) {
            var list = SEWA_SPECS[key];
            for (var i = 0; i < list.length; i++) {
              if (new RegExp("\\b" + list[i] + "\\b", "i").test(lower)) {
                specDetails.push(list[i]);
                specType = key;
                break;
              }
            }
          }
        }
      }
      
      if (entityType === "material") {
        for (var key in MATERIAL_SPECS) {
          if (MATERIAL_SPECS.hasOwnProperty(key)) {
            var list = MATERIAL_SPECS[key];
            for (var i = 0; i < list.length; i++) {
              if (new RegExp("\\b" + list[i] + "\\b", "i").test(lower)) {
                specDetails.push(list[i]);
                specType = key;
                break;
              }
            }
          }
        }
      }
      
      if (entityType === "desain") {
        for (var key in DESAIN_SPECS) {
          if (DESAIN_SPECS.hasOwnProperty(key)) {
            var list = DESAIN_SPECS[key];
            for (var i = 0; i < list.length; i++) {
              if (new RegExp("\\b" + list[i] + "\\b", "i").test(lower)) {
                specDetails.push(list[i]);
                specType = key;
                break;
              }
            }
          }
        }
      }
      
      score += 5;
      reasons.push(specType + ": " + specDetails.join(", "));
      
      if (/\d+\s*(m|mm|cm|meter|kg|ton|inch|inci|k|m3|liter)/gi.test(lower)) {
        return { 
          isVariant: true, 
          score: score + 3, 
          reasons: reasons.concat(["Has dimension → SUB-VARIANT"]) 
        };
      }
      
      return { isVariant: true, score: score, reasons: reasons };
    }

    // STEP 4: CEK PATTERN SPESIFIKASI (FALLBACK)
    var specFirstPatterns = [
      { pattern: /^(tinggi|rendah|panjang|pendek|lebar|sempit|tebal|tipis|dalam|dangkal|diameter|radius|ukuran|dimensi)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer|jasa|layanan|produk|material)/i, score: 4, reason: "Dimension + noun" },
      { pattern: /^(polos|motif|bermotif|bercorak|tekstur|serat|halus|kasar|matte|glossy|doff|gloss|satin|anyaman|natural|ekspos|custom|standar|premium|ekonomis|modern|klasik|minimalis|tradisional|elegan|mewah|polosan)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer|jasa|layanan|produk|material)/i, score: 4, reason: "Finishing + noun" },
      { pattern: /^(hidrolik|manual|auger|rotary|percussive|dry|wet|basah|kering)\s+(jasa|layanan|produk|material|sewa|tiang|pancang|bore|pile|pondasi|beton|baja|besi|kayu|batu|keramik|granit|marmer|plafon|gypsum|kanopi|paving|readymix|cor)/i, score: 4, reason: "Method + noun" }
    ];

    for (var i = 0; i < specFirstPatterns.length; i++) {
      var pattern = specFirstPatterns[i];
      if (pattern.pattern.test(lower)) {
        if (!PRICE_WORDS.some(function(w) { return lower.indexOf(w) !== -1; }) && 
            !LOCATION_WORDS.some(function(w) { return lower.indexOf(w) !== -1; })) {
          if (!HIGH_VOLUME_WORDS.some(function(w) { return lower.indexOf(w) !== -1; }) && 
              !SIZE_WORDS.some(function(w) { return lower.indexOf(w) !== -1; })) {
            score += pattern.score;
            reasons.push(pattern.reason);
          }
        }
      }
    }

    var threshold = 3;
    var isVariant = score >= threshold;
    return { isVariant: isVariant, score: score, reasons: reasons };
  }

  function detectVariantLevel(text, entityType) {
    if (isSubVariant(text)) return "sub-variant";
    if (hasTechnicalSpec(text)) return "variant";
    var result = detectVariantByPattern(text, entityType);
    if (result.isVariant) return "variant";
    return null;
  }

  // ============================================================
  // 🔥 MONEY LEVEL DETECTION — SAMA UNTUK BROWSER DAN INPUT
  // ============================================================

  function getFactors(text, entityType) {
    return {
      hasLocation: isLocation(text),
      hasSpec: checkHasSpecification(text, entityType),
      hasPrice: checkHasPrice(text),
      hasCommercial: checkHasCommercial(text)
    };
  }

  function detectMoneyLevelInternal(text, entityType) {
    var lowerText = text.toLowerCase();
    var factors = getFactors(text, entityType);
    var hasPriceWord = factors.hasPrice;
    var hasLocationWord = factors.hasLocation;
    var hasCommercialWord = factors.hasCommercial;
    var hasSpecWord = factors.hasSpec;
    var subPillar = detectSubPillar(text);

    // PRIORITAS 1: SUB-PILLAR
    if (subPillar) return subPillar;

    // PRIORITAS 2: LOCATION → MONEY_CHILD
    if (hasLocationWord) {
      var hasService = /\b(jasa|layanan|sewa|produk|material|kontraktor|tukang|borongan|pasang|bangun|renovasi|perbaikan|instalasi|service|servis|pemasangan|pemancangan|pengeboran|pondasi|tiang|pancang|pagar|panel|beton|baja|besi|kayu|batu|keramik|granit|marmer|plafon|gypsum|kanopi|paving|readymix|cor|desain|interior|eksterior|arsitektur|konstruksi|rumah|gedung|ruko|gudang|pabrik|jalan|jembatan|infrastruktur|mini|pile|bore|strauss)\b/i.test(lowerText);
      if (hasService) {
        log('📍 MONEY_CHILD: "' + text + '" → MONEY_CHILD (location found)', 'LOCATION');
        return "money-child";
      }
    }

    // PRIORITAS 3: VARIANT / SUB-VARIANT
    if (hasSpecWord && !hasPriceWord && !hasCommercialWord && !hasLocationWord) {
      if (/\d+\s*(m|mm|cm|meter|kg|ton|inch|inci|k|m3|liter)/gi.test(lowerText)) {
        log('🔬 SUB-VARIANT: "' + text + '" → SUB-VARIANT (spec + dimension)', 'VARIANT');
        return "sub-variant";
      }
      log('🔬 VARIANT: "' + text + '" → VARIANT (specification found)', 'VARIANT');
      return "variant";
    }

    // PRIORITAS 4: COMMERCIAL + SPEC → MONEY_PAGE
    if (hasCommercialWord && hasSpecWord && !hasLocationWord) {
      log('💰 MONEY_PAGE: "' + text + '" → MONEY_PAGE (commercial + spec)', 'PRICE');
      return "money-page";
    }

    // PRIORITAS 5: HARGA + SPESIFIKASI → MONEY_PAGE
    if (hasPriceWord && hasSpecWord && !hasLocationWord && !hasCommercialWord) {
      log('💰 MONEY_PAGE: "' + text + '" → MONEY_PAGE (price + spec)', 'PRICE');
      return "money-page";
    }

    // PRIORITAS 6: COMMERCIAL → MONEY_PAGE
    if (hasCommercialWord && !hasLocationWord) {
      log('💰 MONEY_PAGE: "' + text + '" → MONEY_PAGE (commercial)', 'PRICE');
      return "money-page";
    }

    // PRIORITAS 7: HIGH VOLUME → MONEY_PAGE
    var highVolumeWords = ['murah', 'hemat', 'ekonomis', 'terjangkau', 'budget', 'promo', 'diskon'];
    var hasHighVolume = false;
    for (var i = 0; i < highVolumeWords.length; i++) {
      if (lowerText.indexOf(highVolumeWords[i]) !== -1) {
        hasHighVolume = true;
        break;
      }
    }
    if (hasHighVolume && !hasLocationWord && !hasSpecWord) {
      var hasNoun = /\b(jasa|layanan|produk|material|pondasi|tiang|pancang|pagar|panel|beton|baja|besi|kayu|batu|keramik|granit|marmer|plafon|gypsum|kanopi|paving|readymix|cor|sewa|rental|alat|mesin|bangunan|konstruksi)\b/i.test(lowerText);
      if (hasNoun) {
        log('💰 MONEY_PAGE: "' + text + '" → MONEY_PAGE (high volume)', 'PRICE');
        return "money-page";
      }
    }

    // PRIORITAS 8: CORE LOGIC
    var coreWords = getCoreWords(text, entityType);
    log('🧠 CORE WORDS: "' + text + '" → [' + coreWords.join(', ') + ']', 'CORE');

    if (coreWords.length <= 2) {
      log('🏛️ MONEY_MASTER: "' + text + '" → MONEY_MASTER (core: ' + coreWords.length + ' kata)', 'MM');
      return "money-master";
    } else {
      log('💰 MONEY_PAGE: "' + text + '" → MONEY_PAGE (core: ' + coreWords.length + ' kata)', 'PRICE');
      return "money-page";
    }
  }

  // ============================================================
  // 📌 MAIN DETECTOR — UNTUK BROWSER
  // ============================================================

  function detectPageLevel(userOptions) {
    if (isHomePage()) return "home";
    var text = getPageText();
    var entityType = detectEntityType(userOptions && userOptions.userEntityType);
    log('📝 TEXT: "' + text + '"', "INFO");
    log('🏷️ ENTITY: ' + entityType, "INFO");

    if (detectPillar(text, entityType)) {
      log('🏛️ PILLAR: "' + text + '" → PILLAR', "SUCCESS");
      return "pillar";
    }

    var level = detectMoneyLevelInternal(text, entityType);
    log('🎯 FINAL: "' + text + '" → ' + level, 'SUCCESS');
    return level;
  }

  // ============================================================
  // 🔥 DETEKSI DARI TEXT INPUT — ⭐ FIX v22.59 ⭐
  // ============================================================

  function extractSlugFromInput(input) {
    if (!input) return "";
    
    var slug = "";
    
    try {
      // Coba parse sebagai URL
      var url = new URL(input);
      var pathname = url.pathname
        .replace(/\.html$/, "")
        .replace(/\.htm$/, "")
        .replace(/\/$/, "");
      
      var segments = pathname.split("/").filter(Boolean);
      slug = segments[segments.length - 1] || "";
    } catch (e) {
      // Fallback: anggap input sebagai slug langsung
      slug = input;
    }
    
    // ⭐ CLEANING — SAMA PERSIS DENGAN getPageText()!
    slug = slug.replace(/^\d{4}-\d{2}-/, "");   // Hapus 2026-09-
    slug = slug.replace(/^\d{4}-/, "");         // Hapus 2026-
    slug = slug.replace(/^\d{2}-/, "");         // Hapus 09-
    slug = slug.replace(/^\d{4}/, "");          // Hapus 2026
    slug = slug.replace(/^\d+-/, "");           // Hapus 123-
    slug = slug.replace(/^\d+/, "");            // Hapus 123
    
    // Ubah - ke spasi
    slug = slug.replace(/-/g, " ");
    slug = slug.trim();
    
    // Hapus spasi berlebih
    slug = slug.replace(/\s+/g, " ");
    
    return slug;
  }

  function detectEntityTypeFromText(text) {
    var lower = text.toLowerCase();
    for (var i = 0; i < ENTITY_PRIORITY.length; i++) {
      var entity = ENTITY_PRIORITY[i];
      var triggers = ENTITY_TRIGGERS[entity] || [];
      for (var j = 0; j < triggers.length; j++) {
        if (lower.indexOf(triggers[j]) !== -1) return entity;
      }
    }
    return "produk";
  }

  function detectPageLevelForPrompt(text, entityType) {
    var cleanLower = text.toLowerCase().trim();

    // CEK PILLAR
    for (var entity in ENTITY_PILLAR_NAMES) {
      if (!ENTITY_PILLAR_NAMES.hasOwnProperty(entity)) continue;
      var patterns = ENTITY_PILLAR_NAMES[entity];
      for (var i = 0; i < patterns.length; i++) {
        if (cleanLower === patterns[i]) {
          var isEntityMatch = entity === entityType ||
                             (entity === "produk interior" && entityType === "produk");
          if (isEntityMatch) return "pillar";
        }
      }
    }

    // GUNAKAN LOGIKA YANG SAMA DENGAN BROWSER
    var level = detectMoneyLevelInternal(text, entityType);
    return level || "money-master";
  }

  // ============================================================
  // 🔥 FUNGSI DETEKSI UPAWARD DARI SLUG — UNTUK MODE INPUT
  // ============================================================

  function detectUpwardFromSlug(slug, domain) {
    if (!slug) return { upward: [], breadcrumbs: [] };
    
    var words = slug.split(" ");
    var upward = [];
    var breadcrumbs = [];
    var currentSlug = slug.replace(/ /g, "-");
    var baseDomain = domain || "https://" + window.location.hostname;
    
    // Bersihkan domain (hapus trailing slash)
    if (baseDomain.endsWith("/")) {
      baseDomain = baseDomain.slice(0, -1);
    }
    
    // 1. Parent 1 (terdekat) — hapus 1 kata terakhir
    if (words.length >= 2) {
      var parent1Words = words.slice(0, -1);
      var parent1Label = parent1Words.join(" ");
      var parent1Slug = parent1Words.join("-");
      
      breadcrumbs.push({
        position: 1,
        label: parent1Label,
        slug: parent1Slug,
        url: baseDomain + "/" + parent1Slug + ".html",
        isParent: true,
        isCurrent: false
      });
      
      upward.push({
        position: 1,
        label: parent1Label,
        slug: parent1Slug,
        url: baseDomain + "/" + parent1Slug + ".html",
        isParent: true,
        isCurrent: false
      });
    }
    
    // 2. Parent 2 — hapus 2 kata terakhir
    if (words.length >= 3) {
      var parent2Words = words.slice(0, -2);
      var parent2Label = parent2Words.join(" ");
      var parent2Slug = parent2Words.join("-");
      
      breadcrumbs.push({
        position: 2,
        label: parent2Label,
        slug: parent2Slug,
        url: baseDomain + "/" + parent2Slug + ".html",
        isParent: true,
        isCurrent: false
      });
      
      upward.push({
        position: 2,
        label: parent2Label,
        slug: parent2Slug,
        url: baseDomain + "/" + parent2Slug + ".html",
        isParent: true,
        isCurrent: false
      });
    }
    
    // 3. Current page (terakhir)
    breadcrumbs.push({
      position: breadcrumbs.length + 1,
      label: slug,
      slug: currentSlug,
      url: baseDomain + "/" + currentSlug + ".html",
      isParent: false,
      isCurrent: true
    });
    
    return {
      upward: upward,
      breadcrumbs: breadcrumbs
    };
  }

  // ============================================================
  // 🔥 FUNGSI DETEKSI PARENT DENGAN PLD LEVEL
  // ============================================================

  function detectParentLevelFromSlug(slug, entityType, domain) {
    if (!slug) return [];
    
    var words = slug.split(" ");
    var parents = [];
    var entity = entityType || detectEntityTypeFromText(slug);
    var baseDomain = domain || "https://" + window.location.hostname;
    
    if (baseDomain.endsWith("/")) {
      baseDomain = baseDomain.slice(0, -1);
    }
    
    // Parent 1 (terdekat)
    if (words.length >= 2) {
      var parent1Words = words.slice(0, -1);
      var parent1Label = parent1Words.join(" ");
      var parent1Slug = parent1Words.join("-");
      var parent1Level = detectPageLevelForPrompt(parent1Label, entity);
      
      parents.push({
        position: 1,
        label: parent1Label,
        slug: parent1Slug,
        url: baseDomain + "/" + parent1Slug + ".html",
        level: parent1Level,
        levelNum: TYPE_LEVEL_MAP[parent1Level] || -1,
        isParent: true
      });
    }
    
    // Parent 2
    if (words.length >= 3) {
      var parent2Words = words.slice(0, -2);
      var parent2Label = parent2Words.join(" ");
      var parent2Slug = parent2Words.join("-");
      var parent2Level = detectPageLevelForPrompt(parent2Label, entity);
      
      parents.push({
        position: 2,
        label: parent2Label,
        slug: parent2Slug,
        url: baseDomain + "/" + parent2Slug + ".html",
        level: parent2Level,
        levelNum: TYPE_LEVEL_MAP[parent2Level] || -1,
        isParent: true
      });
    }
    
    return parents;
  }

  // ============================================================
  // 🔥 FUNGSI DETEKSI LENGKAP UNTUK MODE INPUT
  // ============================================================

  function detectForPromptFull(input, entityType, domain) {
    if (!input) {
      return { 
        pageLevel: 'unknown', 
        isValid: false, 
        error: 'Input kosong',
        upward: [],
        breadcrumbs: []
      };
    }

    var slug = extractSlugFromInput(input);
    if (!slug) {
      return { 
        pageLevel: 'unknown', 
        isValid: false, 
        error: 'Slug kosong',
        upward: [],
        breadcrumbs: []
      };
    }

    var entity = entityType || detectEntityTypeFromText(slug);
    var level = detectPageLevelForPrompt(slug, entity);
    var factors = getFactors(slug, entity);
    
    // TAMBAHAN: DETEKSI UPAWARD DARI SLUG
    var upwardData = detectUpwardFromSlug(slug, domain);

    return {
      // Hasil deteksi utama (SAMA dengan browser)
      pageLevel: level,
      entityType: entity,
      factors: factors,
      text: slug,
      levelNum: TYPE_LEVEL_MAP[level] || -1,
      isValid: VALID_LEVELS.indexOf(level) !== -1,
      
      // TAMBAHAN: UPAWARD (Parent) — OTOMATIS DARI SLUG
      upward: upwardData.upward,
      breadcrumbs: upwardData.breadcrumbs,
      
      // TAMBAHAN: Parent dengan PLD Level
      parents: detectParentLevelFromSlug(slug, entity, domain)
    };
  }

  // ============================================================
  // ⭐ FUNGSI LAMA TETAP ADA — TIDAK DIUBAH
  // ============================================================

  function detectForPrompt(input, entityType) {
    if (!input) {
      return { pageLevel: 'unknown', isValid: false, error: 'Input kosong' };
    }

    var slug = extractSlugFromInput(input);
    if (!slug) {
      return { pageLevel: 'unknown', isValid: false, error: 'Slug kosong' };
    }

    var entity = entityType || detectEntityTypeFromText(slug);
    var level = detectPageLevelForPrompt(slug, entity);
    var factors = getFactors(slug, entity);

    return {
      pageLevel: level,
      entityType: entity,
      factors: factors,
      text: slug,
      levelNum: TYPE_LEVEL_MAP[level] || -1,
      isValid: VALID_LEVELS.indexOf(level) !== -1
    };
  }

  // ⭐ FUNGSI BARU — DENGAN UPAWARD/BREADCRUMBS
  function detectForPromptWithUpward(input, entityType, domain) {
    return detectForPromptFull(input, entityType, domain);
  }

  // ⭐ ALIAS UNTUK UPAWARD
  function detectBreadcrumbsFromSlug(slug, domain) {
    var result = detectUpwardFromSlug(slug, domain);
    return result.breadcrumbs;
  }

  function detectParentFromSlug(slug, domain) {
    var result = detectUpwardFromSlug(slug, domain);
    return result.upward;
  }

  // ============================================================
  // 📌 FUNGSI LAINNYA — TETAP SAMA
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
      if (!INTENT_TRIGGERS.hasOwnProperty(intent)) continue;
      var triggers = INTENT_TRIGGERS[intent];
      for (var i = 0; i < triggers.length; i++) {
        if (lower.indexOf(triggers[i]) !== -1) scores[intent] += 1;
      }
    }
    var maxScore = 0;
    var dominantIntent = "informational";
    for (var intent in scores) {
      if (!scores.hasOwnProperty(intent)) continue;
      if (scores[intent] > maxScore) {
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
      if (!SEMANTIC_CLUSTERS.hasOwnProperty(cluster)) continue;
      var words = SEMANTIC_CLUSTERS[cluster];
      for (var i = 0; i < words.length; i++) {
        if (lower.indexOf(words[i]) !== -1) found.push({ cluster: cluster, word: words[i] });
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
      if (!eeat.hasOwnProperty(signal)) continue;
      if (eeat[signal]) eeatScore += 3;
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
      if (!snippet.hasOwnProperty(type)) continue;
      if (snippet[type]) snippetScore += 2;
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
    var coreWords = text.split(/\s+/).filter(function(w) { return w.length > 2; });
    if (level === 'pillar') strategies.push("PILLAR: exact match \"" + text + "\"");
    else if (level === 'sub-pillar-tipe-2') strategies.push("SP2: daftar/jenis/kategori");
    else if (level === 'sub-pillar-tipe-1') strategies.push("SP1: perbandingan/vs");
    else if (level === 'money-child') strategies.push("MC: lokasi + produk (tanpa spesifikasi)");
    else if (level === 'variant') strategies.push("VARIANT: spesifikasi teknis per entity (tanpa harga/commercial)");
    else if (level === 'sub-variant') strategies.push("SUB-VARIANT: spesifikasi + dimensi");
    else if (level === 'money-page') strategies.push("MP: " + coreWords.length + " core words");
    else if (level === 'money-master') strategies.push("MM: " + coreWords.length + " core words (tanpa tambahan)");
    return { level: level, confidence: 100, strategies: strategies, strategyCount: strategies.length };
  }

  // ============================================================
  // 🔥 BREADCRUMBS DETECTION — MODE BROWSER
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
      version: "22.59",
      CONFIG: CONFIG,

      // ⭐ FUNGSI LAMA — TETAP ADA (SAMA DENGAN BROWSER)
      detect: detectPageLevel,
      detectForPrompt: detectForPrompt,
      
      // ⭐ FUNGSI BARU — DENGAN UPAWARD/BREADCRUMBS
      detectForPromptFull: detectForPromptFull,
      detectForPromptWithUpward: detectForPromptWithUpward,
      
      // ⭐ FUNGSI BARU — DETEKSI UPAWARD DARI SLUG
      detectUpwardFromSlug: detectUpwardFromSlug,
      detectBreadcrumbsFromSlug: detectBreadcrumbsFromSlug,
      detectParentFromSlug: detectParentFromSlug,
      detectParentLevelFromSlug: detectParentLevelFromSlug,
      
      // FUNGSI LAINNYA — TETAP ADA
      getConfidenceScore: getConfidenceScore,
      detectEntityType: detectEntityType,
      VALID_LEVELS: VALID_LEVELS,
      TYPE_LEVEL_MAP: TYPE_LEVEL_MAP,
      VALID_ENTITY_TYPES: VALID_ENTITY_TYPES,
      ENTITY_PILLAR_NAMES: ENTITY_PILLAR_NAMES,

      updateAttributes: function(options) {
        options = options || {};
        var waitForBreadcrumb = options.waitForBreadcrumb !== false;
        var levelResult = detectPageLevel();
        var level = typeof levelResult === 'string' ? levelResult : (levelResult.level || 'unknown');
        var seoScore = calculateSEOScore();
        try {
          document.body.setAttribute("data-page-level", level);
          document.body.setAttribute("data-page-level-num", String(TYPE_LEVEL_MAP[level] || '0'));
          document.body.setAttribute("data-seo-score", String(seoScore.score || '0'));
          document.body.setAttribute("data-seo-quality", String(seoScore.quality || 'low'));
          document.body.setAttribute("data-intent", String(seoScore.intent || 'informational'));
          var className = 'page-level-' + level.replace(/\s+/g, '-');
          document.body.classList.remove('page-level-unknown', className);
          document.body.classList.add(className);
        } catch (e) {
          log("Error setting attributes: " + e.message, "ERROR");
        }
        var result = {
          pageLevel: level,
          pageLevelNum: TYPE_LEVEL_MAP[level] || 0,
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
      waitForBreadcrumbs: waitForBreadcrumbs,

      // ENTITY WORDS
      JASA_WORDS: JASA_WORDS,
      SEWA_WORDS: SEWA_WORDS,
      MATERIAL_WORDS: MATERIAL_WORDS,
      PRODUK_WORDS: PRODUK_WORDS,
      DESAIN_WORDS: DESAIN_WORDS,
      ALL_ENTITY_WORDS: ALL_ENTITY_WORDS,

      // ENTITY SPECS (PLD v22.59) — LENGKAP
      PRODUK_SPECS: PRODUK_SPECS,
      MATERIAL_SPECS: MATERIAL_SPECS,
      SEWA_SPECS: SEWA_SPECS,
      JASA_SPECS: JASA_SPECS,
      DESAIN_SPECS: DESAIN_SPECS,

      // OTHER
      COMMERCIAL_WORDS: COMMERCIAL_WORDS,
      HIGH_VOLUME_WORDS: HIGH_VOLUME_WORDS,
      SIZE_WORDS: SIZE_WORDS,
      LOCATION_WORDS: LOCATION_WORDS,
      isLocation: isLocation,
      checkHasSpecification: checkHasSpecification,
      getCoreWords: getCoreWords,
      getFactors: getFactors
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

    console.log("✅ Page Level Detector v22.59 Ready — FIX extractSlugFromInput()!");
    console.log("🔧 FIX: extractSlugFromInput() SAMA dengan getPageText()");
    console.log("🔧 FIX: Cleaning slug (hapus tahun, tanggal, angka di awal)");
    console.log("📌 '2024/09/jasa-pasang-pagar' → 'jasa pasang pagar' → MONEY_MASTER");
    console.log("📌 '2026-jasa-pasang-pagar' → 'jasa pasang pagar' → MONEY_MASTER");
    console.log("📌 'jasa pasang pagar' → MONEY_MASTER (sama dengan browser)");
    console.log("📌 'pagar panel beton k300' → VARIANT (sama dengan browser)");
    console.log("⭐ NEW: detectForPromptFull() dengan upward/breadcrumbs otomatis");

    try {
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
    } catch (e) {
      log("Auto-update failed: " + e.message, "ERROR");
    }
  }

  // ============================================================
  // 📌 START — WAIT DOM READY
  // ============================================================

  log('🚀 Starting Page Level Detector v22.59...', 'INFO');

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
