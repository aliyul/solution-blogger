/* ============================================================
 🧠 Page Level Detector v22.67 FINAL — FULL SYNC + BROWSER MODE FIX
    ============================================================
    VERSI: FINAL (Verbose + All Fix + Cleanup + Test Suite)
    - Gaya penulisan: VERBOSE (sama seperti v22.65)
    - Log detail: LENGKAP
    - Komentar: DETAIL
    - Fix: SEMUA (FIX 1-34)
    - Cleanup: Service names dari SPECS
    - Test Suite: 33 test case
    ============================================================
    
    ✅ FIX 1: extractSlugFromInput() — Gunakan cleanText() (SAMA browser)
    ✅ FIX 2: detectEntityTypeFromText() — Identik dengan detectEntityType()
    ✅ FIX 3: detectPageLevelForPrompt() — Default SAMA dengan browser
    ✅ FIX 4: detectPageLevel() — Default SAMA dengan mode input
    ✅ FIX 5: getCoreWords() — Hapus kata umum jasa (pasang, bangun, dll)
    ✅ FIX 6: checkHasSpecification() — Exclude HANYA kata entity murni
    ✅ FIX 7: detectPageLevelFromDOM() — Deteksi dari DOM untuk validasi silang
    ✅ FIX 8: validateForPrompt() — Re-validasi PHASE 4 (Input vs Browser)
    🔥 FIX 9 (v22.63): Mode Browser — Set 3 attribute + fallback H1
    🔥 FIX 10 (v22.64): Mode Browser — checkPriceTable() + 5 attribute tambahan
    🔥 FIX 11 (v22.65): Mode Browser — Set data-product-category + data-product-material
    🔥 FIX 12 (v22.66): BUG#1 — Hapus entity words dari COMMERCIAL_WORDS
    🔥 FIX 13 (v22.66): BUG#2 — checkHasCommercial(text, entityType)
    🔥 FIX 14 (v22.66): BUG#3 — INFORMATIONAL_WORDS dipisah
    🔥 FIX 15 (v22.66): BUG#4 — Priority 6 cek hasPrice && !hasSpec
    🔥 FIX 16 (v22.66): BUG#5 — Bersihkan overlap PRICE vs HIGH_VOLUME
    🔥 FIX 17 (v22.66): BUG#6 — Sync PRODUK_SPECS ↔ PURE_PRODUK_SPECS
    🔥 FIX 18 (v22.66): BUG#7 — isLocation() 3-TIER context-aware
    🔥 FIX 19 (v22.66): BUG#8 — Default entity null (bukan "produk")
    🔥 FIX 20 (v22.66): Browser — Null-safety setSchemaAttributes()
    🔥 FIX 21 (v22.66): Browser — Null-safety detectProductCategoryFromPLD()
    🔥 FIX 22 (v22.66): Browser — Null-safety detectProductMaterialFromPLD()
    🔥 FIX 23 (v22.66): Browser — Null-safety detectContentFocus()
    🔥 FIX 24 (v22.66): Browser — Null-safety detectEntitySubType()
    🔥 FIX 25 (v22.66): Browser — checkHasCommercial backward compatible
    🔥 FIX 26 (v22.66): Browser — Auto-refresh entity attribute
    🔥 FIX 27 (v22.66): Browser — Consistent entityType
    🔥 FIX 28 (v22.66): Browser — updateAttributes() handle null
    🔥 FIX 29 (v22.67): PURE_JASA_TECHNIQUES dikosongkan (service names)
    🔥 FIX 30 (v22.67): Hapus MATERIAL_SPECS.jenis (material names)
    🔥 FIX 31 (v22.67): Hapus SEWA_SPECS.fungsi (alat names)
    🔥 FIX 32 (v22.67): Hapus DESAIN_SPECS.fungsi (ruangan names)
    🔥 FIX 33 (v22.67): Cleanup dead code checkHasSpecification()
    🔥 FIX 34 (v22.67): Update versi 22.66 → 22.67 + Test Suite
    ============================================================ */

(function () {
  "use strict";

  // ═══════════════════════════════════════════════════════════
  // CEK VERSI — JIKA SUDAH LOADED, SKIP
  // ═══════════════════════════════════════════════════════════
  if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.version === "22.67") {
    console.warn("⚠️ [PLD v22.67] Page Level Detector already loaded!");
    return;
  }

  // ═══════════════════════════════════════════════════════════
  // KONFIGURASI UTAMA
  // ═══════════════════════════════════════════════════════════
  var CONFIG = {
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

  // ═══════════════════════════════════════════════════════════
  // FUNGSI LOG — DENGAN ICON UNTUK SETIAP TYPE
  // ═══════════════════════════════════════════════════════════
  function log(message, type) {
    if (!CONFIG.DEBUG && type === "INFO") return;
    if (!type) type = "INFO";

    var icons = {
      INFO: "📘",
      SUCCESS: "✅",
      WARN: "⚠️",
      ERROR: "❌",
      LOCATION: "📍",
      VARIANT: "🔬",
      PRICE: "💰",
      MM: "🏛️",
      CORE: "🧠",
      DETECT: "🎯",
      INTENT: "🎯",
      EEAT: "🔐",
      STRUCTURE: "📐",
      SNIPPET: "⭐",
      QUALITY: "📊",
      DOM: "🌐",
      BREAD: "🍞",
      TIMER: "⏱️",
      EXTERNAL: "📦",
      COMMERCIAL: "🛒",
      HARGA: "💵",
      VALIDATE: "🔍",
      CROSS: "🔀",
      ATTR: "🏷️",
      H1: "📝",
      TABLE: "📊",
      PRODUCT: "📂",
      MATERIAL: "🧱",
      BROWSER: "🌐",
      FIX: "🔥",
      TEST: "🧪"
    };

    console.log((icons[type] || "📘") + " [PLD v22.67] " + message);
  }

  log('📦 External JS v22.67 FINAL loaded — FULL VERBOSE + ALL FIX', 'EXTERNAL');

  // ═══════════════════════════════════════════════════════════
  // VALID LEVELS + MAPPING
  // ═══════════════════════════════════════════════════════════
  var VALID_LEVELS = [
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

  var TYPE_LEVEL_MAP = {
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

  // ═══════════════════════════════════════════════════════════
  // VALID ENTITY TYPES
  // ═══════════════════════════════════════════════════════════
  var VALID_ENTITY_TYPES = [
    "produk",
    "material",
    "jasa",
    "desain",
    "sewa",
    "artikel"
  ];

  // ═══════════════════════════════════════════════════════════
  // ENTITY PILLAR NAMES
  // ═══════════════════════════════════════════════════════════
  var ENTITY_PILLAR_NAMES = {
    jasa: ["jasa konstruksi"],
    desain: ["jasa desain interior"],
    sewa: ["sewa alat konstruksi"],
    produk: ["produk konstruksi"],
    "produk interior": ["produk interior"],
    material: ["material konstruksi"],
    artikel: ["artikel konstruksi"]
  };

  // ═══════════════════════════════════════════════════════════
  // ENTITY TRIGGERS — KATA PEMICU ENTITY TYPE
  // ═══════════════════════════════════════════════════════════
  var ENTITY_TRIGGERS = {
    jasa: [
      "jasa",
      "kontraktor",
      "tukang",
      "borongan",
      "renovasi",
      "pasang",
      "bangun",
      "perbaikan",
      "instalasi",
      "service",
      "servis",
      "layanan"
    ],
    desain: [
      "desain",
      "interior",
      "arsitektur",
      "konsep",
      "rencana",
      "gambar",
      "denah"
    ],
    sewa: [
      "sewa",
      "rental",
      "rent"
    ],
    material: [
      "material",
      "bahan",
      "material bangunan"
    ],
    produk: [
      "produk",
      "jual",
      "beli",
      "supplier",
      "distributor",
      "toko"
    ],
    artikel: [
      "artikel",
      "blog",
      "tips",
      "panduan",
      "cara",
      "tutorial"
    ]
  };

  // ═══════════════════════════════════════════════════════════
  // ENTITY PRIORITY — URUTAN DETEKSI (PRIORITAS 1 TERATAS)
  // ═══════════════════════════════════════════════════════════
  var ENTITY_PRIORITY = [
    "jasa",
    "sewa",
    "desain",
    "produk",
    "material",
    "artikel"
  ];

  // ═══════════════════════════════════════════════════════════
  // ENTITY WORDS — KATA ENTITY MURNI
  // ═══════════════════════════════════════════════════════════
  var ENTITY_WORDS = [
    'jasa',
    'sewa',
    'material',
    'produk',
    'desain',
    'artikel'
  ];

  // ═══════════════════════════════════════════════════════════
  // JASA WORDS — KATA-KATA TERKAIT JASA
  // ═══════════════════════════════════════════════════════════
  var JASA_WORDS = [
    'jasa',
    'kontraktor',
    'tukang',
    'borongan',
    'renovasi',
    'pasang',
    'bangun',
    'perbaikan',
    'instalasi',
    'proyek',
    'cor',
    'gali',
    'urug',
    'angkut',
    'service',
    'servis',
    'desain',
    'interior',
    'eksterior',
    'arsitektur',
    'coring',
    'cutting',
    'drilling',
    'pengeboran',
    'pemancangan',
    'pemasangan',
    'bongkar',
    'potong',
    'las',
    'sambung',
    'grinding',
    'welding',
    'bending',
    'forming',
    'pondasi',
    'tiang',
    'pancang',
    'bore',
    'pile',
    'strauss',
    'konstruksi',
    'bangunan',
    'rumah',
    'gedung',
    'ruko',
    'gudang',
    'pabrik',
    'jalan',
    'jembatan',
    'infrastruktur'
  ];

  // ═══════════════════════════════════════════════════════════
  // COMMON JASA WORDS — DIHAPUS DARI CORE WORDS (FIX 5)
  // ═══════════════════════════════════════════════════════════
  var COMMON_JASA_WORDS = [
    'tukang',       // ✅ BARU
    'kontraktor',   // ✅ BARU
    'borongan',     // ✅ BARU
    'mandor',       // ✅ BARU
    'vendor',       // ✅ BARU
    'supplier',     // ✅ BARU
    'layanan',       // 🔥 FIX A
    'penyedia',      // 🔥 FIX D
    'pengrajin',     // 🔥 FIX D
    'spesialis',     // 🔥 FIX D
    'biro',          // 🔥 FIX D
    'firma',         // 🔥 FIX D
    'perusahaan',    // 🔥 FIX D
    'penjual jasa',  // 🔥 FIX D
    'pasang',
    'pemasangan',
    'bangun',
    'renovasi',
    'perbaikan',
    'instalasi',
    'service',
    'servis',
    'proyek',
    'konstruksi',
    'pembangunan',
    'cor',
    'gali',
    'urug',
    'angkut'
  ];

  // ═══════════════════════════════════════════════════════════
  // SEWA WORDS
  // ═══════════════════════════════════════════════════════════
  var SEWA_WORDS = [
    'sewa',
    'rental',
    'rent',
    'alat',
    'mesin',
    'heavy equipment',
    'excavator',
    'bulldozer',
    'crane',
    'backhoe',
    'dozer',
    'vibro',
    'roller',
    'compactor',
    'diesel',
    'hydraulic',
    'mini',
    'besar',
    'kecil',
    'sedang',
    'medium',
    'extra'
  ];

  // ═══════════════════════════════════════════════════════════
  // MATERIAL WORDS
  // ═══════════════════════════════════════════════════════════
  var MATERIAL_WORDS = [
    'material',
    'bahan',
    'semen',
    'pasir',
    'batu split',
    'kerikil',
    'besi',
    'baja',
    'kayu',
    'keramik',
    'granit',
    'marmer',
    'gypsum',
    'plafon',
    'paving',
    'bata',
    'batako',
    'hebel',
    'genteng',
    'asbes',
    'atap',
    'baja ringan',
    'galvalum',
    'precast',
    'pracetak',
    'readymix',
    'ready mix'
  ];

  // ═══════════════════════════════════════════════════════════
  // PRODUK WORDS
  // ═══════════════════════════════════════════════════════════
  var PRODUK_WORDS = [
    'produk',
    'jual',
    'beli',
    'supplier',
    'distributor',
    'toko',
    'shop',
    'pagar panel',
    'panel beton',
    'pagar beton',
    'pagar panel beton',
    'kanopi',
    'paving block',
    'u ditch',
    'box culvert',
    'bata ringan',
    'atap baja ringan',
    'besi beton'
  ];

  // ═══════════════════════════════════════════════════════════
  // DESAIN WORDS
  // ═══════════════════════════════════════════════════════════
  var DESAIN_WORDS = [
    'desain',
    'interior',
    'eksterior',
    'arsitektur',
    'layout',
    'denah',
    'gambar',
    'konsep',
    'rencana',
    'modern',
    'minimalis',
    'klasik',
    'tradisional',
    'kontemporer',
    'elegan',
    'luxury',
    'industrial',
    'scandinavian',
    'jepang',
    'rustic',
    'vintage'
  ];

  // ═══════════════════════════════════════════════════════════
  // ENTITY ONLY WORDS — UNTUK EXCLUDE DARI SPEC (FIX 6)
  // ═══════════════════════════════════════════════════════════
  var ENTITY_ONLY_WORDS = {
    jasa: ["jasa"],
    sewa: ["sewa", "rental"],
    produk: ["produk", "jual", "beli"],
    material: ["material", "bahan"],
    desain: ["desain", "interior", "eksterior"],
    artikel: ["artikel"]
  };

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX 29 (v22.67): PURE_JASA_TECHNIQUES DIKOSONGKAN
  // ═══════════════════════════════════════════════════════════
  // SEMUA item sebelumnya (coring, las, gali, dll) adalah SERVICE NAMES,
  // bukan pure technical spec. Untuk pure tech JASA, gunakan:
  //   PURE_METHODS + PURE_SCALES + PURE_FINISHING
  // ============================================================
  var PURE_JASA_TECHNIQUES = [];

  var PURE_METHODS = [
    "manual",
    "hidrolik",
    "auger",
    "rotary",
    "percussive",
    "dry",
    "wet",
    "basah",
    "kering"
  ];

  var PURE_SCALES = [
    "rumahan",
    "komersial",
    "industri",
    "residential",
    "commercial",
    "industrial"
  ];

  var PURE_FINISHING = [
    "polos",
    "motif",
    "bermotif",
    "bercorak",
    "tekstur",
    "serat",
    "halus",
    "kasar",
    "matte",
    "glossy",
    "doff",
    "gloss",
    "satin",
    "anyaman",
    "natural",
    "ekspos",
    "custom",
    "polosan"
  ];

  // ═══════════════════════════════════════════════════════════
  // PRODUK SPECS
  // ═══════════════════════════════════════════════════════════
  var PRODUK_SPECS = {
    mutu: [
      "k225",
      "k250",
      "k300",
      "k350",
      "k400",
      "k500",
      "fc",
      "sni",
      "standar",
      "premium",
      "ekonomis"
    ],
    finishing: [
      "polos",
      "motif",
      "bermotif",
      "bercorak",
      "tekstur",
      "serat",
      "halus",
      "kasar",
      "matte",
      "glossy",
      "doff",
      "gloss",
      "satin",
      "anyaman",
      "natural",
      "ekspos",
      "custom",
      "polosan",
      "cat",
      "coating",
      "lapisan",
      "vernis",
      "anti gores",
      "anti air",
      "anti jamur"
    ],
    dimensi: [
      "ukuran",
      "dimensi",
      "spesifikasi",
      "tipe",
      "model",
      "varian",
      "seri",
      "tinggi",
      "rendah",
      "panjang",
      "pendek",
      "lebar",
      "sempit",
      "tebal",
      "tipis",
      "dalam",
      "dangkal",
      "diameter",
      "radius",
      "besar",
      "kecil",
      "sedang",
      "mini",
      "jumbo"
    ],
    material: [
      "beton",
      "baja",
      "besi",
      "kayu",
      "keramik",
      "granit",
      "marmer",
      "plafon",
      "gypsum",
      "kanopi",
      "paving",
      "readymix",
      "precast",
      "pracetak",
      "aluminium",
      "kaca",
      "batu",
      "bata",
      "hebel",
      "batako",
      "semen",
      "pasir"
    ],
    warna: [
      "putih",
      "hitam",
      "abu-abu",
      "merah",
      "biru",
      "kuning",
      "hijau",
      "coklat",
      "netral",
      "warm",
      "cool",
      "pastel",
      "dark",
      "light",
      "krem",
      "maroon",
      "navy",
      "forest",
      "gold",
      "silver",
      "bronze",
      "copper",
      "rose gold",
      "teal",
      "turquoise",
      "lavender",
      "magenta",
      "coral",
      "salmon",
      "peach",
      "mint"
    ]
  };

  // 🔥 FIX 17: PURE_PRODUK_SPECS derive dari PRODUK_SPECS (single source of truth)
  var PURE_PRODUK_SPECS = PRODUK_SPECS.mutu.concat(PRODUK_SPECS.warna);

  // ═══════════════════════════════════════════════════════════
  // PURE_MATERIAL_SPECS (PATCH dari v22.66)
  // ═══════════════════════════════════════════════════════════
  var PURE_MATERIAL_SPECS = [
    "grade a",
    "grade b",
    "grade c",
    "sni",
    "ulir",
    "galvanis",
    "berlapis",
    "anti karat",
    "anti korosi",
    "anti air"
  ];

  // ═══════════════════════════════════════════════════════════
  // PURE_SEWA_SPECS (PATCH dari v22.66)
  // ═══════════════════════════════════════════════════════════
  var PURE_SEWA_SPECS = [
    "pc75",
    "pc200",
    "pc300",
    "pc350",
    "pc400",
    "komatsu",
    "hitachi",
    "caterpillar",
    "cat",
    "volvo",
    "hyundai",
    "doosan",
    "kobelco",
    "sumitomo",
    "case",
    "jcb"
  ];

  // ═══════════════════════════════════════════════════════════
  // PURE_DESAIN_SPECS (PATCH dari v22.66)
  // ═══════════════════════════════════════════════════════════
  var PURE_DESAIN_SPECS = [
    "modern",
    "minimalis",
    "klasik",
    "tradisional",
    "kontemporer",
    "elegan",
    "luxury",
    "industrial",
    "scandinavian",
    "jepang",
    "rustic",
    "vintage",
    "bohemian",
    "art deco",
    "mid century"
  ];

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX 30 (v22.67): MATERIAL_SPECS — HAPUS `jenis`
  // ═══════════════════════════════════════════════════════════
  // `jenis` isinya MATERIAL NAMES (base entity), bukan spec.
  // ============================================================
  var MATERIAL_SPECS = {
    grade: [
      "grade a",
      "grade b",
      "grade c",
      "sni",
      "standar",
      "premium",
      "ekonomis",
      "kualitas 1",
      "kualitas 2",
      "kualitas 3",
      "kelas 1",
      "kelas 2",
      "kelas 3"
    ],
    finishing: [
      "ulir",
      "polos",
      "galvanis",
      "berlapis",
      "cat",
      "coating",
      "anyaman",
      "anti karat",
      "anti korosi",
      "anti air",
      "diamon",
      "rough",
      "smooth",
      "textured"
    ],
    dimensi: [
      "tebal",
      "panjang",
      "lebar",
      "diameter",
      "radius",
      "ukuran",
      "dimensi",
      "ketebalan",
      "kedalaman",
      "tinggi"
    ],
    berat: [
      "kg",
      "ton",
      "m3",
      "liter",
      "gram",
      "ons"
    ]
    // 🔥 FIX 30 (v22.67): `jenis` DIHAPUS
  };

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX 31 (v22.67): SEWA_SPECS — HAPUS `fungsi`
  // ═══════════════════════════════════════════════════════════
  // `fungsi` isinya JENIS ALAT (base entity), bukan spec.
  // ============================================================
  var SEWA_SPECS = {
    tipe: [
      "mini",
      "besar",
      "kecil",
      "sedang",
      "medium",
      "heavy",
      "standar",
      "extra",
      "ekstra",
      "jumbo",
      "compact",
      "full size",
      "large"
    ],
    merek: [
      "pc75",
      "pc200",
      "pc300",
      "pc350",
      "pc400",
      "komatsu",
      "hitachi",
      "caterpillar",
      "cat",
      "volvo",
      "hyundai",
      "doosan",
      "kobelco",
      "sumitomo",
      "case",
      "jcb",
      "liebherr",
      "kubota",
      "yanmar",
      "perkins",
      "cummin"
    ],
    kapasitas: [
      "ton",
      "m3",
      "kg",
      "liter",
      "galon"
    ],
    kondisi: [
      "baru",
      "bekas",
      "servis",
      "recondition",
      "rebuilt",
      "ready",
      "siap pakai",
      "prima",
      "baik",
      "layak",
      "standar"
    ],
    durasi: [
      "harian",
      "mingguan",
      "bulanan",
      "tahunan",
      "per jam",
      "per hari",
      "per minggu",
      "per bulan",
      "short term",
      "long term"
    ]
    // 🔥 FIX 31 (v22.67): `fungsi` DIHAPUS
  };

  // ═══════════════════════════════════════════════════════════
  // JASA SPECS — `teknik` DIKOMENTARI (v22.66)
  // ═══════════════════════════════════════════════════════════
  var JASA_SPECS = {
    /* teknik: [...] — DIKOMENTARI karena isinya SERVICE NAMES */
    metode: [
      "manual",
      "hidrolik",
      "auger",
      "rotary",
      "percussive",
      "dry",
      "wet",
      "basah",
      "kering",
      "modern",
      "tradisional",
      "konvensional"
    ],
    skala: [
      "rumahan",
      "komersial",
      "industri",
      "residential",
      "commercial",
      "industrial",
      "kecil",
      "sedang",
      "besar",
      "menengah"
    ],
    finishing: [
      "polos",
      "motif",
      "bermotif",
      "bercorak",
      "tekstur",
      "serat",
      "halus",
      "kasar",
      "matte",
      "glossy",
      "doff",
      "gloss",
      "satin",
      "anyaman",
      "natural",
      "ekspos",
      "custom",
      "polosan",
      "cat",
      "coating",
      "lapisan",
      "vernis"
    ],
    kedalaman: [
      "m",
      "meter",
      "cm",
      "centimeter",
      "feet",
      "ft"
    ]
  };

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX 32 (v22.67): DESAIN_SPECS — HAPUS `fungsi`
  // ═══════════════════════════════════════════════════════════
  // `fungsi` isinya RUANGAN (base entity), bukan spec.
  // ============================================================
  var DESAIN_SPECS = {
    gaya: [
      "modern",
      "minimalis",
      "klasik",
      "tradisional",
      "kontemporer",
      "elegan",
      "luxury",
      "industrial",
      "scandinavian",
      "jepang",
      "rustic",
      "vintage",
      "bohemian",
      "art deco",
      "mid century",
      "victorian",
      "gothic",
      "renaissance",
      "baroque",
      "rococo",
      "neoklasik",
      "art nouveau",
      "bauhaus",
      "postmodern",
      "dekonstruksi",
      "high tech",
      "eklektik",
      "transisi",
      "tropis",
      "mediterania",
      "kolonial",
      "peranakan",
      "balinese",
      "javanese"
    ],
    warna: [
      "putih",
      "hitam",
      "abu-abu",
      "merah",
      "biru",
      "kuning",
      "hijau",
      "coklat",
      "netral",
      "warm",
      "cool",
      "pastel",
      "dark",
      "light",
      "krem",
      "maroon",
      "navy",
      "forest",
      "gold",
      "silver",
      "bronze",
      "copper",
      "rose gold",
      "teal",
      "turquoise",
      "lavender",
      "magenta",
      "coral",
      "salmon",
      "peach",
      "mint"
    ],
    material: [
      "kayu",
      "besi",
      "kaca",
      "marmer",
      "granit",
      "keramik",
      "plafon",
      "gypsum",
      "pvc",
      "acp",
      "vinyl",
      "wpc",
      "grc",
      "hpl",
      "bambu",
      "rotan",
      "anyaman",
      "kain",
      "kulit",
      "karpet",
      "parket",
      "ubin",
      "batu alam",
      "batu bata",
      "beton ekspos"
    ]
    // 🔥 FIX 32 (v22.67): `fungsi` DIHAPUS
    ,
    konsep: [
      "open space",
      "split level",
      "loft",
      "studio",
      "apartment",
      "villa",
      "tiny house",
      "smart home",
      "eco home",
      "sustainable",
      "green building",
      "biophilic",
      "zen",
      "feng shui",
      "vastu",
      "wabi sabi"
    ],
    furniture: [
      "minimalis",
      "skandinavia",
      "jepang",
      "klasik",
      "modern",
      "retro",
      "vintage",
      "industrial",
      "rustic",
      "bohemian",
      "mid century",
      "art deco",
      "contemporary"
    ]
  };

  // ═══════════════════════════════════════════════════════════
  // SUB PILLAR KEYWORDS
  // ═══════════════════════════════════════════════════════════
  var SUB_PILLAR_2_KEYWORDS = [
    'daftar',
    'jenis',
    'macam',
    'kategori',
    'tipe',
    'list',
    'katalog',
    'rekomendasi',
    'pilihan',
    'variasi',
    'model',
    'gaya',
    'varian'
  ];

  var SUB_PILLAR_1_KEYWORDS = [
    'perbandingan',
    'vs',
    'versus',
    'kelebihan',
    'kekurangan',
    'perbedaan',
    'lebih baik',
    'unggul',
    'terbaik',
    'mana yang',
    'antara',
    'atau'
  ];

  // 🔥 FIX 16: HIGH_VOLUME_WORDS BERSIH (hapus overlap dengan PRICE_WORDS)
  var HIGH_VOLUME_WORDS = [
    "promo",
    "diskon",
    "obral",
    "cuci gudang",
    "flash sale"
  ];

  var SIZE_WORDS = [
    "mini",
    "besar",
    "kecil",
    "sedang",
    "medium",
    "extra",
    "ekstra",
    "standar"
  ];

  var STOPWORDS = new Set([
    "dan",
    "atau",
    "serta",
    "yang",
    "dari",
    "ke",
    "di",
    "untuk",
    "dengan",
    "ini",
    "itu",
    "akan",
    "telah",
    "sudah",
    "masih",
    "pada",
    "oleh",
    "karena",
    "sehingga",
    "setelah",
    "sebelum"
  ]);

  // ═══════════════════════════════════════════════════════════
  // INTENT TRIGGERS
  // ═══════════════════════════════════════════════════════════
  var INTENT_TRIGGERS = {
    transactional: [
      "beli",
      "order",
      "pesan",
      "booking",
      "sewa sekarang",
      "harga",
      "biaya",
      "tarif",
      "estimasi",
      "promo",
      "diskon",
      "bayar",
      "cicilan",
      "kredit",
      "dapatkan",
      "pesan sekarang",
      "murah",
      "hemat",
      "ekonomis"
    ],
    informational: [
      "cara",
      "tutorial",
      "panduan",
      "tips",
      "langkah",
      "bagaimana",
      "apa itu",
      "pengertian",
      "definisi",
      "contoh",
      "jenis",
      "perbedaan",
      "kelebihan",
      "kekurangan",
      "manfaat",
      "fungsi"
    ],
    commercial: [
      "review",
      "testimoni",
      "rekomendasi",
      "terbaik",
      "paling",
      "vs",
      "versus",
      "perbandingan",
      "alternatif",
      "pilihan",
      "populer",
      "favorit",
      "unggulan"
    ],
    navigational: [
      "login",
      "daftar",
      "kontak",
      "tentang",
      "hubungi",
      "alamat",
      "lokasi",
      "maps",
      "direksi"
    ]
  };

  // ═══════════════════════════════════════════════════════════
  // SEMANTIC CLUSTERS
  // ═══════════════════════════════════════════════════════════
  var SEMANTIC_CLUSTERS = {
    "konstruksi": [
      "bangunan",
      "proyek",
      "infrastruktur",
      "pembangunan",
      "developer",
      "kontraktor"
    ],
    "desain": [
      "interior",
      "arsitektur",
      "estetika",
      "fungsional",
      "layout",
      "denah"
    ],
    "material": [
      "semen",
      "besi",
      "baja",
      "kayu",
      "keramik",
      "granit",
      "marmer",
      "hebel"
    ],
    "jasa": [
      "kontraktor",
      "tukang",
      "borongan",
      "renovasi",
      "instalasi",
      "service"
    ],
    "sewa": [
      "rental",
      "excavator",
      "bulldozer",
      "crane",
      "alat berat",
      "diesel"
    ],
    "produk": [
      "precast",
      "readymix",
      "pracetak",
      "siap pakai",
      "custom"
    ]
  };

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX 12 + FIX 14: COMMERCIAL_WORDS BERSIH
  // ═══════════════════════════════════════════════════════════
  var COMMERCIAL_WORDS = [
    'jual',
    'beli',
    'order',
    'pesan',
    'booking',
    'supplier',
    'distributor',
    'toko',
    'shop',
    'dapatkan',
    'pesan sekarang',
    'order sekarang',
    'beli sekarang',
    'checkout'
  ];

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX 14: INFORMATIONAL_WORDS BARU
  // ═══════════════════════════════════════════════════════════
  var INFORMATIONAL_WORDS = [
    'butuh',
    'cari',
    'mau',
    'ingin',
    'panduan',
    'cara',
    'tips',
    'tutorial',
    'pengertian',
    'definisi',
    'penjelasan',
    'kenapa',
    'mengapa',
    'bagaimana'
  ];

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX 18: TIER 1 LOCATION (hanya nama kota)
  // ═══════════════════════════════════════════════════════════
  var TIER_1_LOCATION = [
    "jakarta",
    "jakarta pusat",
    "jakarta barat",
    "jakarta selatan",
    "jakarta timur",
    "jakarta utara",
    "bogor",
    "depok",
    "tangerang",
    "bekasi",
    "bandung",
    "karawang",
    "purwakarta",
    "cikarang",
    "subang",
    "cirebon",
    "semarang",
    "solo",
    "surakarta",
    "pekalongan",
    "tegal",
    "magelang",
    "sukoharjo",
    "boyolali",
    "klaten",
    "jogja",
    "yogyakarta",
    "surabaya",
    "malang",
    "kediri",
    "gresik",
    "sidoarjo",
    "mojokerto",
    "pasuruan",
    "probolinggo",
    "jember",
    "banyuwangi",
    "madiun",
    "medan",
    "palembang",
    "pekanbaru",
    "padang",
    "lampung",
    "batam",
    "aceh",
    "jambi",
    "bengkulu",
    "pontianak",
    "balikpapan",
    "samarinda",
    "banjarmasin",
    "makassar",
    "manado",
    "palu",
    "kendari",
    "bali",
    "denpasar",
    "gianyar",
    "tabanan",
    "bangli",
    "karangasem",
    "klungkung",
    "buleleng",
    "mataram",
    "kupang"
  ];

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX 18: FISIK_WORDS untuk exclusion
  // ═══════════════════════════════════════════════════════════
  var FISIK_WORDS = [
    "pantai",
    "taman",
    "sungai",
    "gunung",
    "jalan",
    "pasar",
    "sekolah",
    "masjid",
    "gereja",
    "mall",
    "terminal",
    "stasiun",
    "bandara",
    "pelabuhan",
    "sawah",
    "hutan",
    "danau",
    "lembah",
    "bukit",
    "kali",
    "dermaga",
    "lapangan",
    "kantor",
    "pabrik",
    "gudang",
    "warung",
    "restoran",
    "cafe",
    "hotel",
    "villa",
    "klinik",
    "puskesmas",
    "apotek",
    "bank",
    "atm",
    "pos"
  ];

  // Alias untuk backward compatibility
  var LOCATION_WORDS = TIER_1_LOCATION;

  // ═══════════════════════════════════════════════════════════
  // PRICE WORDS
  // ═══════════════════════════════════════════════════════════
var PRICE_WORDS = [
  // ═══ HARGA MURNI ═══
  'harga',
  'biaya',
  'tarif',
  'estimasi',
  'ongkos',
  'budget',
  
  // ═══ MODIFIER HARGA (bukan spec) ═══
  'murah',
  'hemat',
  'terjangkau',
  'promo',
  'diskon'
  
  // 🔥 FIX 36 (v22.67.1): HAPUS berikut karena ini SPEC, bukan price:
  // 'ekonomis',  ← spec mutu (PRODUK_SPECS.mutu)
  // 'mewah',     ← spec mutu/kualitas
  // 'premium',   ← spec mutu (PRODUK_SPECS.mutu)
  // 'mahal'      ← spec/deskriptif
];

  // ═══════════════════════════════════════════════════════════
  // END OF BAGIAN 1
  // ═══════════════════════════════════════════════════════════
  // LANJUT KE BAGIAN 2: Semua Fungsi (cleanText → detectPageLevelFromDOM)
  // ═══════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════
  // 📌 FUNGSI DASAR — PEMBERSIHAN & PENGAMBILAN TEKS
  // ═══════════════════════════════════════════════════════════

  function cleanText(text) {
    if (!text) return "";
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getPageText() {
    var slug = window.location.pathname
      .replace(/\.html$/, "")
      .replace(/-/g, " ")
      .split("/")
      .pop() || "";

    if (!slug || slug.length < 2) {
      slug = window.location.pathname
        .replace(/\.html$/, "")
        .replace(/-/g, " ")
        .split("/")
        .filter(Boolean)
        .pop() || "";
    }

    var text = cleanText(slug);
    if (text.length > 100) text = text.substring(0, 100);
    return text;
  }

  function getH1Text() {
    try {
      var h1 = document.querySelector('h1');
      if (!h1) return '';

      var text = h1.innerText || h1.textContent || '';

      // Hapus tahun 2020-2099
      text = text.replace(/\b(20[2-9][0-9])\b/g, '');

      text = cleanText(text);
      if (text.length > 150) text = text.substring(0, 150);

      return text;
    } catch (e) {
      return '';
    }
  }

  function isHomePage() {
    var path = window.location.pathname.toLowerCase();
    return path === "/" || path === "/index.html" || path === "/home";
  }

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX 10: CEK TABEL HARGA DI DOM
  // ═══════════════════════════════════════════════════════════

  function checkPriceTable() {
    if (typeof document === 'undefined') return false;

    try {
      var tables = document.querySelectorAll('table');
      if (!tables || tables.length === 0) return false;

      for (var i = 0; i < tables.length; i++) {
        var table = tables[i];

        // Cek header <th>
        var headers = table.querySelectorAll('th');
        for (var j = 0; j < headers.length; j++) {
          var headerText = (headers[j].innerText || headers[j].textContent || '').toLowerCase();
          if (/harga|biaya|tarif|price|cost|rate/i.test(headerText)) {
            log('📊 TABEL HARGA ditemukan (header)', 'TABLE');
            return true;
          }
        }

        // Fallback: cek isi tabel
        if (headers.length === 0) {
          var tableText = (table.innerText || table.textContent || '').toLowerCase();
          if (/harga|biaya|tarif|price|cost|rate/i.test(tableText)) {
            if (/\d+/.test(tableText)) {
              log('📊 TABEL HARGA ditemukan (fallback text)', 'TABLE');
              return true;
            }
          }
        }
      }
    } catch (e) {
      log('⚠️ Error checkPriceTable: ' + e.message, 'WARN');
    }

    return false;
  }

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX 18: isLocation() 3-TIER CONTEXT-AWARE
  // ═══════════════════════════════════════════════════════════

  function isLocation(text) {
    if (!text) return false;
    var lower = cleanText(text);

    // ═══════════════════════════════════════════════════════
    // TIER 1: NAMED LOCATION — Selalu TRUE
    // ═══════════════════════════════════════════════════════
    for (var i = 0; i < TIER_1_LOCATION.length; i++) {
      var city = TIER_1_LOCATION[i];
      var cityRegex = new RegExp("\\b" + city.replace(/\s+/g, '\\s+') + "\\b", "i");
      if (cityRegex.test(lower)) {
        log('📍 LOCATION TIER 1: kota "' + city + '" ditemukan', 'LOCATION');
        return true;
      }
    }

    // ═══════════════════════════════════════════════════════
    // TIER 2A: "terdekat" standalone (TIDAK diikuti fisik)
    // ═══════════════════════════════════════════════════════
    if (/\bterdekat\b/i.test(lower)) {
      var fisikSetelah = new RegExp("\\bterdekat\\s+(" + FISIK_WORDS.join("|") + ")\\b", "i");
      if (!fisikSetelah.test(lower)) {
        log('📍 LOCATION TIER 2A: "terdekat" standalone', 'LOCATION');
        return true;
      }
    }

    // ═══════════════════════════════════════════════════════
    // TIER 2B: "sekitar/area/wilayah/daerah/kawasan + saya"
    // ═══════════════════════════════════════════════════════
    if (/\b(sekitar|area|wilayah|daerah|kawasan)\s+saya\b/i.test(lower)) {
      log('📍 LOCATION TIER 2B: "sekitar/area saya"', 'LOCATION');
      return true;
    }

    // ═══════════════════════════════════════════════════════
    // TIER 2C: "di sekitar/area/wilayah/daerah/kawasan"
    // ═══════════════════════════════════════════════════════
    if (/\bdi\s+(sekitar|area|wilayah|daerah|kawasan)\b/i.test(lower)) {
      log('📍 LOCATION TIER 2C: "di sekitar/area"', 'LOCATION');
      return true;
    }

    // ═══════════════════════════════════════════════════════
    // TIER 3A: "dekat/sekitar/di/area/wilayah/daerah [KOTA]"
    // ═══════════════════════════════════════════════════════
    for (var i = 0; i < TIER_1_LOCATION.length; i++) {
      var city = TIER_1_LOCATION[i];
      var cityNearRegex = new RegExp(
        "\\b(dekat|sekitar|di|area|wilayah|daerah)\\s+" +
        city.replace(/\s+/g, '\\s+') +
        "\\b",
        "i"
      );
      if (cityNearRegex.test(lower)) {
        log('📍 LOCATION TIER 3A: "dekat/sekitar [kota]" → ' + city, 'LOCATION');
        return true;
      }
    }

    // ═══════════════════════════════════════════════════════
    // TIER 3B: "dekat/sekitar [FISIK]" → BUKAN LOKASI
    // ═══════════════════════════════════════════════════════
    var fisikRegex = new RegExp(
      "\\b(dekat|sekitar|berdekatan|di dekat|di sekitar)\\s+(" +
      FISIK_WORDS.join("|") +
      ")\\b",
      "i"
    );
    if (fisikRegex.test(lower)) {
      log('📍 LOCATION TIER 3B: "dekat [fisik]" — BUKAN lokasi', 'LOCATION');
      return false;
    }

    // ═══════════════════════════════════════════════════════
    // TIER 3C: "dekat/sekitar/berdekatan [ANGKA]" → BUKAN LOKASI
    // ═══════════════════════════════════════════════════════
    if (/\b(dekat|sekitar|berdekatan)\s+\d+/i.test(lower)) {
      log('📍 LOCATION TIER 3C: "dekat [angka]" — BUKAN lokasi', 'LOCATION');
      return false;
    }

    // ═══════════════════════════════════════════════════════
    // DEFAULT: BUKAN LOKASI
    // ═══════════════════════════════════════════════════════
    return false;
  }

  // ═══════════════════════════════════════════════════════════
  // CEK HARGA
  // ═══════════════════════════════════════════════════════════

  function checkHasPrice(text) {
    if (!text) return false;
    var lower = text.toLowerCase();

    for (var i = 0; i < PRICE_WORDS.length; i++) {
      if (lower.indexOf(PRICE_WORDS[i]) !== -1) {
        return true;
      }
    }
    return false;
  }

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX 13 + FIX 25: checkHasCommercial
  // ═══════════════════════════════════════════════════════════

  function checkHasCommercial(text, entityType) {
    if (!text) return false;
    var lower = text.toLowerCase();

    // 🔥 FIX 25: Backward compatible
    if (entityType && ENTITY_ONLY_WORDS[entityType]) {
      var entityWords = ENTITY_ONLY_WORDS[entityType] || [];
      for (var i = 0; i < entityWords.length; i++) {
        lower = lower.replace(
          new RegExp("\\b" + entityWords[i] + "\\b", "gi"),
          " "
        );
      }

      var entityTriggers = ENTITY_TRIGGERS[entityType] || [];
      for (var i = 0; i < entityTriggers.length; i++) {
        if (COMMERCIAL_WORDS.indexOf(entityTriggers[i]) === -1) {
          lower = lower.replace(
            new RegExp("\\b" + entityTriggers[i] + "\\b", "gi"),
            " "
          );
        }
      }
    }

    for (var i = 0; i < COMMERCIAL_WORDS.length; i++) {
      if (lower.indexOf(COMMERCIAL_WORDS[i]) !== -1) {
        log('🛒 COMMERCIAL: "' + COMMERCIAL_WORDS[i] + '" ditemukan di "' + text + '"', 'COMMERCIAL');
        return true;
      }
    }
    return false;
  }

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX 33 (v22.67): CHECK SPECIFICATION — CLEANUP DEAD CODE
  // ═══════════════════════════════════════════════════════════

  function checkHasSpecification(text, entityType) {
    if (!text) return false;
    var lower = text.toLowerCase();
    var entityOnly = ENTITY_ONLY_WORDS[entityType] || [];

    // ═══════════════════════════════════════════════════════
    // ENTITY: PRODUK
    // ═══════════════════════════════════════════════════════
    if (entityType === "produk") {
      // Cek mutu
      var mutuList = PRODUK_SPECS.mutu || [];
      for (var i = 0; i < mutuList.length; i++) {
        if (new RegExp("\\b" + mutuList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) {
            return mutuList[i] === w;
          });
          if (!isEntityOnly) {
            log('🔬 PRODUK SPEC: mutu ' + mutuList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      // Cek finishing
      var finishingList = PRODUK_SPECS.finishing || [];
      for (var i = 0; i < finishingList.length; i++) {
        if (new RegExp("\\b" + finishingList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) {
            return finishingList[i] === w;
          });
          if (!isEntityOnly) {
            log('🔬 PRODUK SPEC: finishing ' + finishingList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      // Cek dimensi
      if (/\d+\s*(m|mm|cm|meter|kg|ton|inch|inci|ft|feet)/gi.test(lower)) {
        log('🔬 PRODUK SPEC: dimensi ditemukan', 'VARIANT');
        return true;
      }

      // Cek ukuran (angka x angka)
      if (/\d+\s*[x×]\s*\d+\s*(cm|m|meter|mm)/gi.test(lower)) {
        log('🔬 PRODUK SPEC: ukuran ditemukan', 'VARIANT');
        return true;
      }

      // Cek warna
      var warnaList = PRODUK_SPECS.warna || [];
      for (var i = 0; i < warnaList.length; i++) {
        if (new RegExp("\\b" + warnaList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) {
            return warnaList[i] === w;
          });
          if (!isEntityOnly) {
            log('🔬 PRODUK SPEC: warna ' + warnaList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }
    }

    // ═══════════════════════════════════════════════════════
    // ENTITY: MATERIAL
    // ═══════════════════════════════════════════════════════
    if (entityType === "material") {
      // Cek grade
      var gradeList = MATERIAL_SPECS.grade || [];
      for (var i = 0; i < gradeList.length; i++) {
        if (new RegExp("\\b" + gradeList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) {
            return gradeList[i] === w;
          });
          if (!isEntityOnly) {
            log('🔬 MATERIAL SPEC: grade ' + gradeList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      // Cek finishing
      var finishingList = MATERIAL_SPECS.finishing || [];
      for (var i = 0; i < finishingList.length; i++) {
        if (new RegExp("\\b" + finishingList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) {
            return finishingList[i] === w;
          });
          if (!isEntityOnly) {
            log('🔬 MATERIAL SPEC: finishing ' + finishingList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      // Cek dimensi
      if (/\d+\s*(mm|cm|m|meter|kg|ton|m3|liter)/gi.test(lower)) {
        log('🔬 MATERIAL SPEC: dimensi ditemukan', 'VARIANT');
        return true;
      }

      // 🔥 FIX 33 (v22.67): HAPUS blok "Cek jenis" — MATERIAL_SPECS.jenis sudah dihapus

      // Cek berat
      var beratList = MATERIAL_SPECS.berat || [];
      for (var i = 0; i < beratList.length; i++) {
        if (new RegExp("\\b" + beratList[i] + "\\b", "i").test(lower)) {
          log('🔬 MATERIAL SPEC: berat ' + beratList[i] + ' ditemukan', 'VARIANT');
          return true;
        }
      }
    }

    // ═══════════════════════════════════════════════════════
    // ENTITY: SEWA
    // ═══════════════════════════════════════════════════════
    if (entityType === "sewa") {
      // Cek merek
      var merekList = SEWA_SPECS.merek || [];
      for (var i = 0; i < merekList.length; i++) {
        if (new RegExp("\\b" + merekList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) {
            return merekList[i] === w;
          });
          if (!isEntityOnly) {
            log('🔬 SEWA SPEC: merek ' + merekList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      // Cek tipe
      var tipeList = SEWA_SPECS.tipe || [];
      for (var i = 0; i < tipeList.length; i++) {
        if (new RegExp("\\b" + tipeList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) {
            return tipeList[i] === w;
          });
          if (!isEntityOnly) {
            log('🔬 SEWA SPEC: tipe ' + tipeList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      // Cek kapasitas
      if (/\d+\s*(ton|m3|kg|liter)/gi.test(lower)) {
        log('🔬 SEWA SPEC: kapasitas ditemukan', 'VARIANT');
        return true;
      }

      // 🔥 FIX 33 (v22.67): HAPUS blok "Cek fungsi" — SEWA_SPECS.fungsi sudah dihapus

      // Cek kondisi
      var kondisiList = SEWA_SPECS.kondisi || [];
      for (var i = 0; i < kondisiList.length; i++) {
        if (new RegExp("\\b" + kondisiList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) {
            return kondisiList[i] === w;
          });
          if (!isEntityOnly) {
            log('🔬 SEWA SPEC: kondisi ' + kondisiList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      // Cek durasi
      var durasiList = SEWA_SPECS.durasi || [];
      for (var i = 0; i < durasiList.length; i++) {
        if (new RegExp("\\b" + durasiList[i] + "\\b", "i").test(lower)) {
          log('🔬 SEWA SPEC: durasi ' + durasiList[i] + ' ditemukan', 'VARIANT');
          return true;
        }
      }
    }

    // ═══════════════════════════════════════════════════════
    // ENTITY: JASA
    // ═══════════════════════════════════════════════════════
    if (entityType === "jasa") {
      // 🔥 FIX 33 (v22.67): HAPUS blok "Cek teknik" — JASA_SPECS.teknik sudah dikomentari

      // Cek metode
      var metodeList = JASA_SPECS.metode || [];
      for (var i = 0; i < metodeList.length; i++) {
        if (new RegExp("\\b" + metodeList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) {
            return metodeList[i] === w;
          });
          if (!isEntityOnly) {
            log('🔬 JASA SPEC: metode ' + metodeList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      // Cek skala
      var skalaList = JASA_SPECS.skala || [];
      for (var i = 0; i < skalaList.length; i++) {
        if (new RegExp("\\b" + skalaList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) {
            return skalaList[i] === w;
          });
          if (!isEntityOnly) {
            log('🔬 JASA SPEC: skala ' + skalaList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      // Cek finishing
      var finishingList = JASA_SPECS.finishing || [];
      for (var i = 0; i < finishingList.length; i++) {
        if (new RegExp("\\b" + finishingList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) {
            return finishingList[i] === w;
          });
          if (!isEntityOnly) {
            log('🔬 JASA SPEC: finishing ' + finishingList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      // Cek kedalaman (angka + satuan) + harus ada entity word
      if (/\d+\s*(m|meter|cm|centimeter|feet|ft)/gi.test(lower)) {
        var hasEntityWord = JASA_WORDS.some(function(w) {
          return lower.indexOf(w) !== -1;
        });
        if (hasEntityWord) {
          log('🔬 JASA SPEC: kedalaman ditemukan', 'VARIANT');
          return true;
        }
      }
    }

    // ═══════════════════════════════════════════════════════
    // ENTITY: DESAIN
    // ═══════════════════════════════════════════════════════
    if (entityType === "desain") {
      // Cek gaya
      var gayaList = DESAIN_SPECS.gaya || [];
      for (var i = 0; i < gayaList.length; i++) {
        if (new RegExp("\\b" + gayaList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) {
            return gayaList[i] === w;
          });
          if (!isEntityOnly) {
            log('🔬 DESAIN SPEC: gaya ' + gayaList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      // Cek warna
      var warnaList = DESAIN_SPECS.warna || [];
      for (var i = 0; i < warnaList.length; i++) {
        if (new RegExp("\\b" + warnaList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) {
            return warnaList[i] === w;
          });
          if (!isEntityOnly) {
            log('🔬 DESAIN SPEC: warna ' + warnaList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      // 🔥 FIX 33 (v22.67): HAPUS blok "Cek fungsi" — DESAIN_SPECS.fungsi sudah dihapus

      // Cek konsep
      var konsepList = DESAIN_SPECS.konsep || [];
      for (var i = 0; i < konsepList.length; i++) {
        if (new RegExp("\\b" + konsepList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) {
            return konsepList[i] === w;
          });
          if (!isEntityOnly) {
            log('🔬 DESAIN SPEC: konsep ' + konsepList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      // Cek material
      var materialList = DESAIN_SPECS.material || [];
      for (var i = 0; i < materialList.length; i++) {
        if (new RegExp("\\b" + materialList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) {
            return materialList[i] === w;
          });
          if (!isEntityOnly) {
            log('🔬 DESAIN SPEC: material ' + materialList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }

      // Cek furniture
      var furnitureList = DESAIN_SPECS.furniture || [];
      for (var i = 0; i < furnitureList.length; i++) {
        if (new RegExp("\\b" + furnitureList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) {
            return furnitureList[i] === w;
          });
          if (!isEntityOnly) {
            log('🔬 DESAIN SPEC: furniture ' + furnitureList[i] + ' ditemukan', 'VARIANT');
            return true;
          }
        }
      }
    }

    return false;
  }

  // ═══════════════════════════════════════════════════════════
  // CHECK PURE TECHNICAL SPEC
  // ═══════════════════════════════════════════════════════════

  function checkPureTechnicalSpec(text, entityType) {
    if (!text) return false;
    var lower = text.toLowerCase();

    var pureSpecs = [];

    if (entityType === "jasa") {
      pureSpecs = PURE_JASA_TECHNIQUES.concat(
        PURE_METHODS,
        PURE_SCALES,
        PURE_FINISHING
      );
    } else if (entityType === "produk") {
      pureSpecs = PURE_PRODUK_SPECS.concat(PURE_FINISHING);
    } else if (entityType === "material") {
      pureSpecs = PURE_MATERIAL_SPECS.concat(PURE_FINISHING);
    } else if (entityType === "sewa") {
      pureSpecs = PURE_SEWA_SPECS;
    } else if (entityType === "desain") {
      pureSpecs = PURE_DESAIN_SPECS;
    }

    for (var i = 0; i < pureSpecs.length; i++) {
      if (new RegExp("\\b" + pureSpecs[i].replace(/\s+/g, '\\s+') + "\\b", "i").test(lower)) {
        return true;
      }
    }

    if (/\d+\s*(m|mm|cm|meter|kg|ton|inch|inci|ft|feet)/gi.test(lower)) {
      return true;
    }

    if (/\d+\s*[x×]\s*\d+\s*(cm|m|meter|mm)/gi.test(lower)) {
      return true;
    }

    return false;
  }

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX 19: DETEKSI ENTITY TYPE — DEFAULT NULL
  // ═══════════════════════════════════════════════════════════

  function detectEntityTypeFromText(text) {
    if (!text) return null;

    var lower = text.toLowerCase();

    for (var i = 0; i < ENTITY_PRIORITY.length; i++) {
      var entity = ENTITY_PRIORITY[i];
      var triggers = ENTITY_TRIGGERS[entity] || [];
      for (var j = 0; j < triggers.length; j++) {
        if (lower.indexOf(triggers[j]) !== -1) {
          return entity;
        }
      }
    }

    if (lower.indexOf("jasa") !== -1 ||
        lower.indexOf("kontraktor") !== -1 ||
        lower.indexOf("tukang") !== -1) return "jasa";
    if (lower.indexOf("sewa") !== -1 ||
        lower.indexOf("rental") !== -1) return "sewa";
    if (lower.indexOf("desain") !== -1 ||
        lower.indexOf("interior") !== -1) return "desain";
    if (lower.indexOf("material") !== -1 ||
        lower.indexOf("bahan") !== -1) return "material";
    if (lower.indexOf("produk") !== -1 ||
        lower.indexOf("jual") !== -1) return "produk";

    return null;
  }

  function detectEntityType(userEntityType) {
    if (userEntityType && VALID_ENTITY_TYPES.indexOf(userEntityType) !== -1) {
      return userEntityType;
    }

    var text = getPageText();
    var lower = text.toLowerCase();

    for (var i = 0; i < ENTITY_PRIORITY.length; i++) {
      var entity = ENTITY_PRIORITY[i];
      var triggers = ENTITY_TRIGGERS[entity] || [];
      for (var j = 0; j < triggers.length; j++) {
        if (lower.indexOf(triggers[j]) !== -1) {
          return entity;
        }
      }
    }

    if (lower.indexOf("jasa") !== -1 ||
        lower.indexOf("kontraktor") !== -1 ||
        lower.indexOf("tukang") !== -1) return "jasa";
    if (lower.indexOf("sewa") !== -1 ||
        lower.indexOf("rental") !== -1) return "sewa";
    if (lower.indexOf("desain") !== -1 ||
        lower.indexOf("interior") !== -1) return "desain";
    if (lower.indexOf("material") !== -1 ||
        lower.indexOf("bahan") !== -1) return "material";
    if (lower.indexOf("produk") !== -1 ||
        lower.indexOf("jual") !== -1) return "produk";

    return null;
  }

  // ═══════════════════════════════════════════════════════════
  // DETEKSI SUB PILLAR & PILLAR
  // ═══════════════════════════════════════════════════════════

  function detectSubPillar(text) {
    var lower = text.toLowerCase();

    for (var i = 0; i < SUB_PILLAR_2_KEYWORDS.length; i++) {
      if (lower.indexOf(SUB_PILLAR_2_KEYWORDS[i]) !== -1) {
        return "sub-pillar-tipe-2";
      }
    }

    for (var i = 0; i < SUB_PILLAR_1_KEYWORDS.length; i++) {
      if (lower.indexOf(SUB_PILLAR_1_KEYWORDS[i]) !== -1) {
        return "sub-pillar-tipe-1";
      }
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

  // ═══════════════════════════════════════════════════════════
  // DETEKSI TECHNICAL SPEC & SUB-VARIANT
  // ═══════════════════════════════════════════════════════════

  function hasTechnicalSpec(text) {
    if (!text) return false;
    var lower = text.toLowerCase();

    var TECHNICAL_SPECS = [
      "k225", "k250", "k300", "k350", "k400", "k500",
      "fc", "m6", "m8", "m10", "m12", "m16", "m20",
      "b0", "b1", "b2", "b3", "sni"
    ];

    for (var i = 0; i < TECHNICAL_SPECS.length; i++) {
      if (new RegExp("\\b" + TECHNICAL_SPECS[i] + "\\b", "i").test(lower)) {
        return true;
      }
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

    var uniqueNumbers = (text.match(/\d+/g) || []).filter(function(v, i, a) {
      return a.indexOf(v) === i;
    });
    if (uniqueNumbers.length >= 2) score += 1;

    if (/\bukuran\s+\d+/.test(lower)) score += 2;
    if (/\bdimensi\s+\d+/.test(lower)) score += 2;
    if (/\b(tebal|panjang|lebar|tinggi|dalam|diameter)\s+\d+/.test(lower)) score += 2;

    return score >= 2;
  }

  // ═══════════════════════════════════════════════════════════
  // GET CORE WORDS — FIX 5 + FIX 18
  // ═══════════════════════════════════════════════════════════

  function getCoreWords(text, entityType) {
    if (!text) return [];

    var coreText = text.toLowerCase();

    // Hapus money words
    var moneyWords = ['harga', 'biaya', 'tarif', 'estimasi', 'ongkos'];
    for (var i = 0; i < moneyWords.length; i++) {
      coreText = coreText.replace(
        new RegExp("\\b" + moneyWords[i] + "\\b", 'g'),
        ''
      );
    }

    // Hapus entity first word
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
      coreText = coreText.replace(
        new RegExp("\\b" + firstWord + "\\b", 'g'),
        ''
      );
    }

    // 🔥 FIX 5: Hapus COMMON_JASA_WORDS untuk entity jasa
    if (entityType === "jasa") {
      for (var i = 0; i < COMMON_JASA_WORDS.length; i++) {
        coreText = coreText.replace(
          new RegExp("\\b" + COMMON_JASA_WORDS[i] + "\\b", 'g'),
          ' '
        );
      }
    }

    // Hapus stopwords
    var stopwords = [
      "dan", "atau", "serta", "yang", "dari", "ke", "di", "untuk",
      "dengan", "ini", "itu", "akan", "telah", "sudah", "masih",
      "pada", "oleh", "karena", "sehingga", "setelah", "sebelum"
    ];
    for (var i = 0; i < stopwords.length; i++) {
      coreText = coreText.replace(
        new RegExp("\\b" + stopwords[i] + "\\b", 'g'),
        ' '
      );
    }

    // 🔥 FIX 18: Hanya hapus TIER_1_LOCATION (nama kota), bukan dekat/sekitar
    for (var i = 0; i < TIER_1_LOCATION.length; i++) {
      coreText = coreText.replace(
        new RegExp("\\b" + TIER_1_LOCATION[i] + "\\b", 'g'),
        ' '
      );
    }

    // Hapus sub-pillar words
    var subPillarWords = [
      'daftar', 'jenis', 'macam', 'kategori', 'tipe', 'list',
      'katalog', 'rekomendasi', 'pilihan', 'variasi', 'model',
      'gaya', 'varian', 'perbandingan', 'vs', 'versus', 'kelebihan',
      'kekurangan', 'perbedaan', 'lebih baik', 'unggul', 'terbaik'
    ];
    for (var i = 0; i < subPillarWords.length; i++) {
      coreText = coreText.replace(
        new RegExp("\\b" + subPillarWords[i] + "\\b", 'g'),
        ' '
      );
    }

  // 🔥 FIX 35 (v22.67.1): Hapus INFORMATIONAL_WORDS
 for (var i = 0; i < INFORMATIONAL_WORDS.length; i++) {
   coreText = coreText.replace(
     new RegExp("\\b" + INFORMATIONAL_WORDS[i] + "\\b", 'g'),
     ' '
   );
 }

// Hapus commercial words
for (var i = 0; i < COMMERCIAL_WORDS.length; i++) {
  coreText = coreText.replace(
    new RegExp("\\b" + COMMERCIAL_WORDS[i] + "\\b", 'g'),
    ' '
  );
}
   
    var coreWords = coreText.split(/\s+/).filter(function(w) {
      return w.length > 2;
    });

    return coreWords;
  }

  // ═══════════════════════════════════════════════════════════
  // DETEKSI VARIANT BY PATTERN
  // ═══════════════════════════════════════════════════════════

  function detectVariantByPattern(text, entityType) {
    if (!text) return { isVariant: false, score: 0, reasons: [] };

    var score = 0;
    var reasons = [];
    var lower = text.toLowerCase();

    var specResult = checkHasSpecification(text, entityType);

    if (specResult) {
      var isPureTech = checkPureTechnicalSpec(text, entityType);
      if (isPureTech) {
        score += 5;
        reasons.push("Pure technical specification found");

        if (isSubVariant(text)) {
          return {
            isVariant: true,
            score: score + 3,
            reasons: reasons.concat(["Has dimension → SUB-VARIANT"])
          };
        }

        return {
          isVariant: true,
          score: score,
          reasons: reasons
        };
      } else {
        return {
          isVariant: false,
          score: 0,
          reasons: ["Spec found but not pure technical → not variant"]
        };
      }
    }

    var specFirstPatterns = [
      {
        pattern: /^(tinggi|rendah|panjang|pendek|lebar|sempit|tebal|tipis|dalam|dangkal|diameter|radius|ukuran|dimensi)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer|jasa|layanan|produk|material)/i,
        score: 4,
        reason: "Dimension + noun"
      },
      {
        pattern: /^(polos|motif|bermotif|bercorak|tekstur|serat|halus|kasar|matte|glossy|doff|gloss|satin|anyaman|natural|ekspos|custom|standar|premium|ekonomis|modern|klasik|minimalis|tradisional|elegan|mewah|polosan)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer|jasa|layanan|produk|material)/i,
        score: 4,
        reason: "Finishing + noun"
      },
      {
        pattern: /^(hidrolik|manual|auger|rotary|percussive|dry|wet|basah|kering)\s+(jasa|layanan|produk|material|sewa|tiang|pancang|bore|pile|pondasi|beton|baja|besi|kayu|batu|keramik|granit|marmer|plafon|gypsum|kanopi|paving|readymix|cor)/i,
        score: 4,
        reason: "Method + noun"
      }
    ];

    for (var i = 0; i < specFirstPatterns.length; i++) {
      var pattern = specFirstPatterns[i];
      if (pattern.pattern.test(lower)) {
        if (!PRICE_WORDS.some(function(w) { return lower.indexOf(w) !== -1; }) &&
            !TIER_1_LOCATION.some(function(w) { return lower.indexOf(w) !== -1; })) {
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

    return {
      isVariant: isVariant,
      score: score,
      reasons: reasons
    };
  }

  function detectVariantLevel(text, entityType) {
    if (isSubVariant(text)) return "sub-variant";
    if (hasTechnicalSpec(text)) return "variant";

    var result = detectVariantByPattern(text, entityType);
    if (result.isVariant) return "variant";

    return null;
  }

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX 13: getFactors konsisten — semua pakai entityType
  // ═══════════════════════════════════════════════════════════

  function getFactors(text, entityType) {
    return {
      hasLocation: isLocation(text),
      hasSpec: checkHasSpecification(text, entityType),
      hasPrice: checkHasPrice(text),
      hasCommercial: checkHasCommercial(text, entityType)
    };
  }

  // ═══════════════════════════════════════════════════════════
  // DETEKSI MONEY LEVEL — INTI LOGIKA
  // ═══════════════════════════════════════════════════════════

  function detectMoneyLevelInternal(text, entityType) {
    var lowerText = text.toLowerCase();
    var factors = getFactors(text, entityType);

    var hasPriceWord = factors.hasPrice;
    var hasLocationWord = factors.hasLocation;
    var hasCommercialWord = factors.hasCommercial;
    var hasSpecWord = factors.hasSpec;

    var subPillar = detectSubPillar(text);

    log('🔍 FACTORS: hasLocation=' + hasLocationWord +
        ', hasSpec=' + hasSpecWord +
        ', hasPrice=' + hasPriceWord +
        ', hasCommercial=' + hasCommercialWord, 'INFO');

    // ═══════════════════════════════════════════════════════
    // PRIORITAS 1: SUB-PILLAR
    // ═══════════════════════════════════════════════════════
    if (subPillar) {
      return subPillar;
    }

    // ═══════════════════════════════════════════════════════
    // PRIORITAS 2: LOCATION → MONEY_CHILD
    // ═══════════════════════════════════════════════════════
    if (hasLocationWord) {
      var hasService = /\b(jasa|layanan|sewa|produk|material|kontraktor|tukang|borongan|pasang|bangun|renovasi|perbaikan|instalasi|service|servis|pemasangan|pemancangan|pengeboran|pondasi|tiang|pancang|pagar|panel|beton|baja|besi|kayu|batu|keramik|granit|marmer|plafon|gypsum|kanopi|paving|readymix|cor|desain|interior|eksterior|arsitektur|konstruksi|rumah|gedung|ruko|gudang|pabrik|jalan|jembatan|infrastruktur|mini|pile|bore|strauss)\b/i.test(lowerText);

      if (hasService) {
        log('📍 MONEY_CHILD: "' + text + '" → MONEY_CHILD (location found)', 'LOCATION');
        return "money-child";
      }
    }

    // ═══════════════════════════════════════════════════════
    // PRIORITAS 3: VARIANT / SUB-VARIANT
    // ═══════════════════════════════════════════════════════
    if (hasSpecWord && !hasPriceWord && !hasCommercialWord && !hasLocationWord) {
      var isPureTech = checkPureTechnicalSpec(text, entityType);

      if (isPureTech) {
        if (/\d+\s*(m|mm|cm|meter|kg|ton|inch|inci|k|m3|liter)/gi.test(lowerText)) {
          log('🔬 SUB-VARIANT: "' + text + '" → SUB-VARIANT', 'VARIANT');
          return "sub-variant";
        }
        log('🔬 VARIANT: "' + text + '" → VARIANT', 'VARIANT');
        return "variant";
      } else {
        log('⚠️ Spec found but NOT pure technical → skip to Priority 8', 'VARIANT');
      }
    }

    // ═══════════════════════════════════════════════════════
    // PRIORITAS 4: COMMERCIAL + SPEC → MONEY_PAGE
    // ═══════════════════════════════════════════════════════
    if (hasCommercialWord && hasSpecWord && !hasLocationWord) {
      log('💰 MONEY_PAGE: "' + text + '" → MONEY_PAGE (commercial + spec)', 'PRICE');
      return "money-page";
    }

    // ═══════════════════════════════════════════════════════
    // PRIORITAS 5: HARGA + SPEC TEKNIS → MONEY_PAGE
    // ═══════════════════════════════════════════════════════
    if (hasPriceWord && hasSpecWord && !hasLocationWord && !hasCommercialWord) {
      var isPureTechForPrice = checkPureTechnicalSpec(text, entityType);

      if (isPureTechForPrice) {
        log('💵 MONEY_PAGE: "' + text + '" → MONEY_PAGE (harga + spec teknis)', 'HARGA');
        return "money-page";
      } else {
        log('🏛️ MONEY_MASTER: "' + text + '" → MONEY_MASTER (harga + kata umum jasa)', 'HARGA');
        return "money-master";
      }
    }

    // ═══════════════════════════════════════════════════════
    // 🔥 FIX 15: PRIORITAS 6 — COMMERCIAL
    // ═══════════════════════════════════════════════════════
    if (hasCommercialWord && !hasLocationWord) {
      if (hasPriceWord && !hasSpecWord) {
        log('🏛️ MONEY_MASTER: "' + text + '" → MONEY_MASTER (commercial + harga tanpa spec)', 'HARGA');
        return "money-master";
      }
      log('💰 MONEY_PAGE: "' + text + '" → MONEY_PAGE (commercial)', 'PRICE');
      return "money-page";
    }

    // ═══════════════════════════════════════════════════════
    // 🔥 FIX 16: PRIORITAS 7 — HIGH VOLUME
    // ═══════════════════════════════════════════════════════
    var hasHighVolume = false;
    for (var i = 0; i < HIGH_VOLUME_WORDS.length; i++) {
      if (lowerText.indexOf(HIGH_VOLUME_WORDS[i]) !== -1) {
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

    // ═══════════════════════════════════════════════════════
    // PRIORITAS 8: CORE LOGIC
    // ═══════════════════════════════════════════════════════
    var coreWords = getCoreWords(text, entityType);
    log('🧠 CORE WORDS: "' + text + '" → [' + coreWords.join(', ') + ']', 'CORE');

    if (coreWords.length <= 2) {
      if (hasPriceWord) {
        log('💵 MONEY_MASTER HARGA: "' + text + '" → MONEY_MASTER (fokus HARGA)', 'HARGA');
      } else {
        log('🏛️ MONEY_MASTER: "' + text + '" → MONEY_MASTER', 'MM');
      }
      return "money-master";
    } else {
      log('💰 MONEY_PAGE: "' + text + '" → MONEY_PAGE (core: ' + coreWords.length + ' kata)', 'PRICE');
      return "money-page";
    }
  }

  // ═══════════════════════════════════════════════════════════
  // DETEKSI PAGE LEVEL — ENTRY POINT BROWSER
  // ═══════════════════════════════════════════════════════════

  function detectPageLevel(userOptions) {
    if (isHomePage()) return "home";

    var text = getPageText();
    var entityType = detectEntityType(userOptions && userOptions.userEntityType);

    log('📝 TEXT: "' + text + '"', "INFO");
    log('🏷️ ENTITY: ' + (entityType || '(null)'), "INFO");

    if (detectPillar(text, entityType)) {
      log('🏛️ PILLAR: "' + text + '" → PILLAR', "SUCCESS");
      return "pillar";
    }

    var level = detectMoneyLevelInternal(text, entityType);

    if (!level) {
      log('⚠️ Level null, fallback to "money-page"', 'WARN');
      level = "money-page";
    }

    log('🎯 FINAL: "' + text + '" → ' + level, 'SUCCESS');
    return level;
  }

  // ═══════════════════════════════════════════════════════════
  // EXTRACT SLUG DARI INPUT — FIX 1
  // ═══════════════════════════════════════════════════════════

  function extractSlugFromInput(input) {
    if (!input) return "";

    var slug = "";

    try {
      var url = new URL(input);
      var pathname = url.pathname
        .replace(/\.html$/, "")
        .replace(/\.htm$/, "")
        .replace(/\/$/, "");

      var segments = pathname.split("/").filter(Boolean);
      slug = segments[segments.length - 1] || "";
    } catch (e) {
      slug = input;
    }

    slug = slug.replace(/^\d{4}-\d{2}-/, "");
    slug = slug.replace(/^\d{4}-/, "");
    slug = slug.replace(/^\d{2}-/, "");
    slug = slug.replace(/^\d{4}/, "");
    slug = slug.replace(/^\d+-/, "");
    slug = slug.replace(/^\d+/, "");

    slug = slug.replace(/-/g, " ");
    slug = cleanText(slug);

    return slug;
  }

  // ═══════════════════════════════════════════════════════════
  // DETEKSI LEVEL UNTUK PROMPT
  // ═══════════════════════════════════════════════════════════

  function detectPageLevelForPrompt(text, entityType) {
    var cleanLower = text.toLowerCase().trim();

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

    var level = detectMoneyLevelInternal(text, entityType);

    if (!level) {
      log('⚠️ Level null di prompt, fallback to "money-page"', 'WARN');
      level = "money-page";
    }

    return level;
  }

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX 27: DETEKSI LEVEL DARI DOM
  // ═══════════════════════════════════════════════════════════

  function detectPageLevelFromDOM(entityType) {
    if (typeof window === 'undefined' || !window.location) {
      log('⚠️ Tidak ada window.location — bukan browser', 'WARN');
      return null;
    }

    if (isHomePage()) {
      log('🏠 HOME terdeteksi dari DOM', 'DOM');
      return "home";
    }

    var urlText = getPageText();
    var h1Text = getH1Text();

    var text = urlText;
    if (!text || text.length < 3) {
      text = h1Text;
      log('🌐 DOM DETECT: URL kosong, pakai H1="' + h1Text + '"', 'DOM');
    } else if (h1Text && h1Text.length > 3) {
      log('🌐 DOM DETECT: URL="' + urlText + '", H1="' + h1Text + '"', 'DOM');
    } else {
      log('🌐 DOM DETECT: URL="' + urlText + '" (no H1)', 'DOM');
    }

    // 🔥 FIX 27: Deteksi entity kalau null
    var entity = entityType;
    if (!entity) {
      entity = detectEntityType();
      log('🌐 DOM DETECT: entity dari deteksi = ' + (entity || '(null)'), 'BROWSER');
    }

    if (detectPillar(text, entity)) {
      log('🏛️ PILLAR terdeteksi dari DOM', 'DOM');
      return "pillar";
    }

    var level = detectMoneyLevelInternal(text, entity);

    if (!level) {
      level = "money-page";
    }

    log('🌐 DOM LEVEL: "' + text + '" → ' + level, 'DOM');
    return level;
  }

  // ═══════════════════════════════════════════════════════════
  // END OF BAGIAN 2
  // ═══════════════════════════════════════════════════════════
  // LANJUT KE BAGIAN 3: Validation + Schema + Init + Test Suite
  // ═══════════════════════════════════════════════════════════

   // ═══════════════════════════════════════════════════════════
  // 🔥 FIX 8 + FIX 25: VALIDATE FOR PROMPT (PHASE 4)
  // ═══════════════════════════════════════════════════════════

  function validateForPrompt(input, entityType, options) {
    options = options || {};
    var strictMode = options.strict !== false;

    log('════════════════════════════════════════', 'VALIDATE');
    log('🔍 PHASE 4 — VALIDASI SILANG ULANG', 'VALIDATE');
    log('════════════════════════════════════════', 'VALIDATE');

    var inputSlug = extractSlugFromInput(input);
    if (!inputSlug) {
      return {
        status: "DITOLAK",
        error: "Input tidak valid",
        valid: false
      };
    }

    var inputEntity = entityType || detectEntityTypeFromText(inputSlug);
    var inputLevel = detectPageLevelForPrompt(inputSlug, inputEntity);
    var inputFactors = getFactors(inputSlug, inputEntity);

    log('📊 MODE INPUT:', 'VALIDATE');
    log('   Page Level: ' + inputLevel, 'VALIDATE');
    log('   Entity: ' + (inputEntity || '(null)'), 'VALIDATE');
    log('   Factors: hasLocation=' + inputFactors.hasLocation +
        ', hasSpec=' + inputFactors.hasSpec +
        ', hasPrice=' + inputFactors.hasPrice +
        ', hasCommercial=' + inputFactors.hasCommercial, 'VALIDATE');

    var browserLevel = null;
    var browserEntity = null;
    var browserFactors = null;
    var browserAvailable = false;

    try {
      if (typeof window !== 'undefined' && window.location) {
        browserLevel = detectPageLevelFromDOM(inputEntity);
        browserEntity = detectEntityType();

        var browserText = getPageText();
        browserFactors = getFactors(browserText, browserEntity);
        browserAvailable = true;

        log('📊 MODE BROWSER:', 'VALIDATE');
        log('   Page Level: ' + browserLevel, 'VALIDATE');
        log('   Entity: ' + (browserEntity || '(null)'), 'VALIDATE');
        log('   Factors: hasLocation=' + browserFactors.hasLocation +
            ', hasSpec=' + browserFactors.hasSpec +
            ', hasPrice=' + browserFactors.hasPrice +
            ', hasCommercial=' + browserFactors.hasCommercial, 'VALIDATE');
      }
    } catch (e) {
      log('⚠️ Browser tidak tersedia: ' + e.message, 'WARN');
    }

    var crossValidation = {
      pageLevel: {
        input: inputLevel,
        browser: browserLevel,
        status: (browserAvailable && inputLevel === browserLevel) ? "SAMA" :
                (!browserAvailable ? "BROWSER_UNAVAILABLE" : "BERBEDA")
      },
      entityType: {
        input: inputEntity,
        browser: browserEntity,
        status: (browserAvailable && inputEntity === browserEntity) ? "SAMA" :
                (!browserAvailable ? "BROWSER_UNAVAILABLE" : "BERBEDA")
      },
      factors: {
        input: inputFactors,
        browser: browserFactors,
        status: (browserAvailable &&
                 inputFactors.hasLocation === browserFactors.hasLocation &&
                 inputFactors.hasSpec === browserFactors.hasSpec &&
                 inputFactors.hasPrice === browserFactors.hasPrice &&
                 inputFactors.hasCommercial === browserFactors.hasCommercial) ? "SAMA" :
                (!browserAvailable ? "BROWSER_UNAVAILABLE" : "BERBEDA")
      }
    };

    log('🔀 VALIDASI SILANG:', 'CROSS');
    log('   Page Level: ' + crossValidation.pageLevel.status, 'CROSS');
    log('   Entity Type: ' + crossValidation.entityType.status, 'CROSS');
    log('   Factors: ' + crossValidation.factors.status, 'CROSS');

    var finalStatus = "LOLOS";
    var errors = [];
    var warnings = [];
    var finalLevel = inputLevel;
    var finalEntity = inputEntity;

    if (crossValidation.pageLevel.status === "BERBEDA") {
      if (strictMode) {
        finalStatus = "PERBAIKI";
        errors.push("Page Level berbeda: Input=" + inputLevel + ", Browser=" + browserLevel);
      } else {
        warnings.push("Page Level berbeda");
      }
      finalLevel = browserLevel;
      log('⚠️ GUNAKAN HASIL BROWSER: ' + browserLevel, 'WARN');
    }

    if (crossValidation.entityType.status === "BERBEDA") {
      if (strictMode) {
        finalStatus = "PERBAIKI";
        errors.push("Entity Type berbeda");
      } else {
        warnings.push("Entity Type berbeda");
      }
      finalEntity = browserEntity;
    }

    if (crossValidation.factors.status === "BERBEDA") {
      warnings.push("Factors berbeda — cek manual");
    }

    var seoScore = null;
    var intent = null;
    var eeat = null;
    var structure = null;

    try {
      if (browserAvailable && typeof document !== 'undefined') {
        seoScore = calculateSEOScore();
        intent = detectIntent(inputSlug);
        eeat = detectEEATSignals();
        structure = detectContentStructure();
      } else {
        intent = detectIntent(inputSlug);
      }
    } catch (e) {
      log('⚠️ SEO Score error: ' + e.message, 'WARN');
    }

    var result = {
      phase: 4,
      status: finalStatus,
      valid: finalStatus === "LOLOS",
      error: errors.length > 0 ? errors.join("; ") : null,
      warnings: warnings,

      pld: {
        input: {
          pageLevel: inputLevel,
          entityType: inputEntity,
          factors: inputFactors,
          text: inputSlug,
          levelNum: TYPE_LEVEL_MAP[inputLevel] || -1
        },
        browser: browserAvailable ? {
          pageLevel: browserLevel,
          entityType: browserEntity,
          factors: browserFactors,
          text: getPageText(),
          levelNum: TYPE_LEVEL_MAP[browserLevel] || -1
        } : null,
        browserAvailable: browserAvailable
      },

      crossValidation: crossValidation,

      final: {
        pageLevel: finalLevel,
        entityType: finalEntity,
        levelNum: TYPE_LEVEL_MAP[finalLevel] || -1,
        source: crossValidation.pageLevel.status === "SAMA" ? "INPUT_AND_BROWSER" :
                crossValidation.pageLevel.status === "BERBEDA" ? "BROWSER" :
                "INPUT_ONLY"
      },

      seo: seoScore ? {
        score: seoScore.score,
        quality: seoScore.quality,
        details: seoScore.details
      } : null,

      intent: intent,
      eeat: eeat,
      structure: structure
    };

    log('════════════════════════════════════════', 'VALIDATE');
    log('📋 HASIL PHASE 4: ' + finalStatus, finalStatus === "LOLOS" ? 'SUCCESS' : 'WARN');
    log('   Final Page Level: ' + finalLevel, 'VALIDATE');
    log('   Final Entity: ' + (finalEntity || '(null)'), 'VALIDATE');
    log('   Source: ' + result.final.source, 'VALIDATE');
    log('════════════════════════════════════════', 'VALIDATE');

    return result;
  }

  // ═══════════════════════════════════════════════════════════
  // UPAWARD & BREADCRUMBS
  // ═══════════════════════════════════════════════════════════

  function detectUpwardFromSlug(slug, domain) {
    if (!slug) return { upward: [], breadcrumbs: [] };

    var words = slug.split(" ");
    var upward = [];
    var breadcrumbs = [];
    var currentSlug = slug.replace(/ /g, "-");
    var baseDomain = domain || "https://" + (typeof window !== 'undefined' ? window.location.hostname : "");

    if (baseDomain.endsWith("/")) {
      baseDomain = baseDomain.slice(0, -1);
    }

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

  function detectParentLevelFromSlug(slug, entityType, domain) {
    if (!slug) return [];

    var words = slug.split(" ");
    var parents = [];
    var entity = entityType || detectEntityTypeFromText(slug);
    var baseDomain = domain || "https://" + (typeof window !== 'undefined' ? window.location.hostname : "");

    if (baseDomain.endsWith("/")) {
      baseDomain = baseDomain.slice(0, -1);
    }

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

    var upwardData = detectUpwardFromSlug(slug, domain);

    return {
      pageLevel: level,
      entityType: entity,
      factors: factors,
      text: slug,
      levelNum: TYPE_LEVEL_MAP[level] || -1,
      isValid: VALID_LEVELS.indexOf(level) !== -1,

      upward: upwardData.upward,
      breadcrumbs: upwardData.breadcrumbs,

      parents: detectParentLevelFromSlug(slug, entity, domain)
    };
  }

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

  function detectForPromptWithUpward(input, entityType, domain) {
    return detectForPromptFull(input, entityType, domain);
  }

  function detectBreadcrumbsFromSlug(slug, domain) {
    var result = detectUpwardFromSlug(slug, domain);
    return result.breadcrumbs;
  }

  function detectParentFromSlug(slug, domain) {
    var result = detectUpwardFromSlug(slug, domain);
    return result.upward;
  }

  // ═══════════════════════════════════════════════════════════
  // EEAT SIGNALS DETECTION
  // ═══════════════════════════════════════════════════════════

  function detectEEATSignals() {
    var signals = {
      author: false,
      date: false,
      source: false,
      expertise: false,
      experience: false,
      trust: false
    };

    if (typeof document === 'undefined' || !document.body) return signals;

    var bodyText = (document.body && document.body.innerText)
      ? document.body.innerText.toLowerCase()
      : "";

    if (/oleh|author|written by|posted by|by\s+[a-z]/.test(bodyText)) signals.author = true;
    if (/\d{1,2}\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s+\d{4}/i.test(bodyText)) signals.date = true;
    if (/sumber|referensi|refrensi|menurut|berdasarkan|dikutip|dari/.test(bodyText)) signals.source = true;
    if (/ahli|expert|profesional|berpengalaman|spesialis|expertise/.test(bodyText)) signals.expertise = true;
    if (/pengalaman|studi kasus|portofolio|proyek sebelumnya/.test(bodyText)) signals.experience = true;
    if (/terpercaya|jaminan|garansi|sertifikat|sertifikasi|resmi|legal/.test(bodyText)) signals.trust = true;

    return signals;
  }

  // ═══════════════════════════════════════════════════════════
  // CONTENT STRUCTURE DETECTION
  // ═══════════════════════════════════════════════════════════

  function detectContentStructure() {
    var structure = {
      headings: { h1: 0, h2: 0, h3: 0, h4: 0 },
      hasList: false,
      hasTable: false,
      hasImages: false,
      hasVideo: false,
      wordCount: 0,
      readability: "medium"
    };

    if (typeof document === 'undefined') return structure;

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
      structure.wordCount = bodyText.split(/\s+/).filter(function(w) {
        return w.length > 0;
      }).length;

      if (structure.wordCount > 2000) structure.readability = "high";
      else if (structure.wordCount > 800) structure.readability = "medium";
      else structure.readability = "low";
    } catch (e) {}

    return structure;
  }

  // ═══════════════════════════════════════════════════════════
  // FEATURED SNIPPET OPPORTUNITY
  // ═══════════════════════════════════════════════════════════

  function detectFeaturedSnippetOpportunity() {
    var opportunities = {
      definition: false,
      faq: false,
      table: false,
      list: false,
      stepByStep: false,
      comparison: false
    };

    if (typeof document === 'undefined' || !document.body) return opportunities;

    var bodyText = (document.body && document.body.innerText)
      ? document.body.innerText.toLowerCase()
      : "";

    if (/adalah|merupakan|ialah|yaitu|definisi|pengertian/.test(bodyText)) opportunities.definition = true;
    if (/faq|tanya jawab|pertanyaan|q&a/.test(bodyText)) opportunities.faq = true;

    try {
      opportunities.table = document.querySelectorAll('table').length > 0;
    } catch (e) {}

    try {
      opportunities.list = document.querySelectorAll('ul, ol').length > 2;
    } catch (e) {}

    if (/langkah|step|cara|tahap|pertama|kedua|ketiga/.test(bodyText)) opportunities.stepByStep = true;
    if (/perbandingan|vs|versus|kelebihan|kekurangan/.test(bodyText)) opportunities.comparison = true;

    return opportunities;
  }

  // ═══════════════════════════════════════════════════════════
  // INTENT DETECTION
  // ═══════════════════════════════════════════════════════════

  function detectIntent(text) {
    if (!text) return { dominant: "informational", scores: {}, confidence: "low" };

    var lower = text.toLowerCase();
    var scores = {
      transactional: 0,
      informational: 0,
      commercial: 0,
      navigational: 0
    };

    for (var intent in INTENT_TRIGGERS) {
      if (!INTENT_TRIGGERS.hasOwnProperty(intent)) continue;

      var triggers = INTENT_TRIGGERS[intent];
      for (var i = 0; i < triggers.length; i++) {
        if (lower.indexOf(triggers[i]) !== -1) {
          scores[intent] += 1;
        }
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

    return {
      dominant: dominantIntent,
      scores: scores,
      confidence: maxScore > 0 ? "high" : "low"
    };
  }

  // ═══════════════════════════════════════════════════════════
  // SEMANTIC CLUSTERS
  // ═══════════════════════════════════════════════════════════

  function detectSemanticClusters(text) {
    if (!text) return [];

    var lower = text.toLowerCase();
    var found = [];

    for (var cluster in SEMANTIC_CLUSTERS) {
      if (!SEMANTIC_CLUSTERS.hasOwnProperty(cluster)) continue;

      var words = SEMANTIC_CLUSTERS[cluster];
      for (var i = 0; i < words.length; i++) {
        if (lower.indexOf(words[i]) !== -1) {
          found.push({ cluster: cluster, word: words[i] });
        }
      }
    }

    return found;
  }

  // ═══════════════════════════════════════════════════════════
  // GENERATE RECOMMENDATIONS
  // ═══════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════
  // CALCULATE SEO SCORE
  // ═══════════════════════════════════════════════════════════

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
      "home": 5,
      "pillar": 30,
      "sub-pillar-tipe-1": 25,
      "sub-pillar-tipe-2": 25,
      "money-master": 20,
      "money-page": 25,
      "money-child": 28,
      "variant": 20,
      "sub-variant": 22
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

  // ═══════════════════════════════════════════════════════════
  // GET CONFIDENCE SCORE
  // ═══════════════════════════════════════════════════════════

  function getConfidenceScore() {
    var text = getPageText();
    var level = detectPageLevel();
    var strategies = [];
    var coreWords = text.split(/\s+/).filter(function(w) {
      return w.length > 2;
    });

    if (level === 'pillar') {
      strategies.push("PILLAR: exact match \"" + text + "\"");
    } else if (level === 'sub-pillar-tipe-2') {
      strategies.push("SP2: daftar/jenis/kategori");
    } else if (level === 'sub-pillar-tipe-1') {
      strategies.push("SP1: perbandingan/vs");
    } else if (level === 'money-child') {
      strategies.push("MC: lokasi + produk (tanpa spesifikasi)");
    } else if (level === 'variant') {
      strategies.push("VARIANT: spesifikasi teknis per entity");
    } else if (level === 'sub-variant') {
      strategies.push("SUB-VARIANT: spesifikasi + dimensi");
    } else if (level === 'money-page') {
      strategies.push("MP: " + coreWords.length + " core words");
    } else if (level === 'money-master') {
      strategies.push("MM: " + coreWords.length + " core words");
    }

    return {
      level: level,
      confidence: 100,
      strategies: strategies,
      strategyCount: strategies.length
    };
  }

  // ═══════════════════════════════════════════════════════════
  // BREADCRUMBS FINDER
  // ═══════════════════════════════════════════════════════════

  function findBreadcrumbs() {
    if (typeof document === 'undefined') return null;

    for (var s = 0; s < CONFIG.BREADCRUMBS_SELECTORS.length; s++) {
      var selector = CONFIG.BREADCRUMBS_SELECTORS[s];

      try {
        var elements = document.querySelectorAll(selector);
        for (var i = 0; i < elements.length; i++) {
          var el = elements[i];
          if (el.offsetParent !== null || el.getBoundingClientRect().height > 0) {
            var text = (el.textContent || "").trim() || "";
            if (text.length > 0) {
              return {
                element: el,
                text: text,
                selector: selector
              };
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
    if (typeof document === 'undefined') {
      callback();
      return;
    }

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

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX 21: NULL-SAFETY detectProductCategoryFromPLD
  // ═══════════════════════════════════════════════════════════

  function detectProductCategoryFromPLD(entityType, entitySubType) {
    if (!entityType) return '';

    var isProduct = ['produk', 'material'].indexOf(entityType) !== -1;
    if (!isProduct) return '';

    var categoryMap = {
      'pagar-panel-beton': 'PrecastProduct',
      'besi-beton': 'SteelProduct',
      'baja-ringan': 'SteelProduct',
      'paving': 'PavingProduct',
      'paving-block': 'PavingProduct',
      'kanopi': 'PrecastProduct',
      'batako': 'BuildingMaterial',
      'genteng': 'BuildingMaterial',
      'semen': 'BuildingMaterial',
      'pasir': 'BuildingMaterial',
      'kayu': 'BuildingMaterial',
      'wpc': 'BuildingMaterial',
      'grc': 'BuildingMaterial',
      'hpl': 'BuildingMaterial',
      'pvc': 'BuildingMaterial',
      'acp': 'BuildingMaterial'
    };

    if (entitySubType && categoryMap[entitySubType]) {
      return categoryMap[entitySubType];
    }

    if (entityType === 'material') return 'BuildingMaterial';
    if (entityType === 'produk') return 'PrecastProduct';

    return '';
  }

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX 22: NULL-SAFETY detectProductMaterialFromPLD
  // ═══════════════════════════════════════════════════════════

  function detectProductMaterialFromPLD(entityType, entitySubType) {
    if (!entityType) return '';

    var isProduct = ['produk', 'material'].indexOf(entityType) !== -1;
    if (!isProduct) return '';

    var materialMap = {
      'pagar-panel-beton': 'Beton Precast',
      'besi-beton': 'Besi Beton',
      'baja-ringan': 'Baja Ringan',
      'paving': 'Paving Block',
      'paving-block': 'Paving Block',
      'kanopi': 'Baja Ringan',
      'batako': 'Batako',
      'genteng': 'Genteng',
      'semen': 'Semen',
      'pasir': 'Pasir',
      'kayu': 'Kayu',
      'wpc': 'WPC',
      'grc': 'GRC',
      'hpl': 'HPL',
      'pvc': 'PVC',
      'acp': 'ACP'
    };

    if (entitySubType && materialMap[entitySubType]) {
      return materialMap[entitySubType];
    }

    if (entityType === 'material') return 'Material Konstruksi';
    if (entityType === 'produk') return 'Beton Precast';

    return '';
  }

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX 20 + FIX 26: SET SCHEMA ATTRIBUTES
  // ═══════════════════════════════════════════════════════════

  function setSchemaAttributes(level) {
    try {
      // 1. data-page-level
      document.body.setAttribute("data-page-level", level);
      document.body.setAttribute("data-page-level-num", String(TYPE_LEVEL_MAP[level] || '0'));

      // 2. data-entity-type
      var entityType = detectEntityType();
      if (!entityType) {
        var h1Text = getH1Text();
        entityType = detectEntityTypeFromText(h1Text);
        if (entityType) log('🔄 Entity dari H1: ' + entityType, 'BROWSER');
      }

      document.body.setAttribute("data-entity-type", entityType || '');
      log('🏷️ ATTR SET: data-entity-type="' + (entityType || '(null)') + '"', 'ATTR');

      // 3. data-content-focus
      var contentFocus = detectContentFocus(level, entityType);
      document.body.setAttribute("data-content-focus", contentFocus);
      log('🎯 ATTR SET: data-content-focus="' + contentFocus + '"', 'ATTR');

      // 4. data-kategori
      var kategori = detectKategori(contentFocus);
      document.body.setAttribute("data-kategori", kategori);
      log('🏷️ ATTR SET: data-kategori="' + kategori + '"', 'ATTR');

      // 5. data-h1-pattern
      var h1Pattern = detectH1Pattern(kategori);
      document.body.setAttribute("data-h1-pattern", h1Pattern);
      log('📝 ATTR SET: data-h1-pattern="' + h1Pattern + '"', 'ATTR');

      // 6. data-entity-sub-type
      var entitySubType = detectEntitySubType(level, entityType);
      document.body.setAttribute("data-entity-sub-type", entitySubType || '');
      log('🔷 ATTR SET: data-entity-sub-type="' + (entitySubType || '(none)') + '"', 'ATTR');

      // 7. data-schema-type-primary + secondary
      var schemaType = detectSchemaType(level, entityType, contentFocus);
      document.body.setAttribute("data-schema-type-primary", schemaType.primary);
      document.body.setAttribute("data-schema-type-secondary", schemaType.secondary);
      log('🔗 ATTR SET: data-schema-type-primary="' + schemaType.primary + '"', 'ATTR');
      log('🔗 ATTR SET: data-schema-type-secondary="' + schemaType.secondary + '"', 'ATTR');

      // 8. data-cta-type + data-cta-text
      var ctaType = detectCtaType(level, contentFocus);
      document.body.setAttribute("data-cta-type", ctaType.type);
      document.body.setAttribute("data-cta-text", ctaType.text);
      log('🔘 ATTR SET: data-cta-type="' + ctaType.type + '"', 'ATTR');
      log('🔘 ATTR SET: data-cta-text="' + ctaType.text + '"', 'ATTR');

      // Null-safety product category/material
      var productCategory = detectProductCategoryFromPLD(entityType, entitySubType);
      if (productCategory) {
        document.body.setAttribute("data-product-category", productCategory);
        log('📂 ATTR SET: data-product-category="' + productCategory + '"', 'PRODUCT');
      }

      var productMaterial = detectProductMaterialFromPLD(entityType, entitySubType);
      if (productMaterial) {
        document.body.setAttribute("data-product-material", productMaterial);
        log('🧱 ATTR SET: data-product-material="' + productMaterial + '"', 'MATERIAL');
      }

      log('✅ Semua attribute schema ter-set!', 'ATTR');

    } catch (e) {
      log('❌ Error set schema attributes: ' + e.message, 'ERROR');
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX 23: DETECT CONTENT FOCUS + NULL-SAFETY
  // ═══════════════════════════════════════════════════════════  
 function detectContentFocus(level, entityType) {
    var h1Text = getH1Text();
    var urlText = getPageText();

    // 🔥 FIX 37 (v22.67.1): Ambil H1 RAW untuk cek tahun
    // Karena getH1Text() sudah menghapus tahun dari H1
    var h1Raw = '';
    try {
      var h1El = document.querySelector('h1');
      h1Raw = h1El ? (h1El.innerText || h1El.textContent || '') : '';
    } catch (e) {}

    // Cek tahun di H1 RAW (belum di-clean) & di URL
    var hasYearInH1 = /\b(20[2-9][0-9])\b/.test(h1Raw);
    var hasYearInUrl = /\b(20[2-9][0-9])\b/.test(urlText);

    var hasPriceInText = checkHasPrice(h1Text) || checkHasPrice(urlText);

    var hasCommercial = checkHasCommercial(h1Text, entityType) ||
                        checkHasCommercial(urlText, entityType);

    var hasPriceTableInDOM = checkPriceTable();

    var isMoneyLevel = ['money-master', 'money-page', 'money-child'].indexOf(level) !== -1;
    var isVariantLevel = ['variant', 'sub-variant'].indexOf(level) !== -1;

    if (isMoneyLevel || isVariantLevel) {
      if (hasPriceTableInDOM) {
        log('🎯 CONTENT FOCUS: HARGA (tabel harga di DOM)', 'TABLE');
        return 'HARGA';
      }

      if (hasPriceInText || hasYearInH1 || hasYearInUrl) {
        return 'HARGA';
      }

      if (hasCommercial) {
        return 'COMMERCIAL';
      }

      return 'INFORMASI';
    }

    return 'INFORMASI';
  }
 
  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX 24: DETECT ENTITY SUB-TYPE + NULL-SAFETY
  // ═══════════════════════════════════════════════════════════

  function detectEntitySubType(level, entityType) {
    if (typeof document === 'undefined' || !document.body) return null;

    var bodySubType = document.body.getAttribute('data-entity-sub-type');
    if (bodySubType) return bodySubType;

    return null;
  }

  // ═══════════════════════════════════════════════════════════
  // DETECT SCHEMA TYPE
  // ═══════════════════════════════════════════════════════════

  function detectSchemaType(level, entityType, contentFocus) {
    var primary = 'WebPage';
    var secondary = '';

    var isMoneyLevel = ['money-master', 'money-page', 'money-child'].indexOf(level) !== -1;
    var isEvergreen = ['pillar', 'sub-pillar-tipe-1', 'sub-pillar-tipe-2'].indexOf(level) !== -1;
    var isVariant = ['variant', 'sub-variant'].indexOf(level) !== -1;

    if (isEvergreen) {
      primary = 'Article';
      secondary = 'FAQPage';
    } else if (isVariant) {
      primary = 'Product';
      secondary = 'TechArticle';
    } else if (isMoneyLevel) {
      if (contentFocus === 'HARGA' || contentFocus === 'COMMERCIAL') {
        primary = 'Product';
        secondary = 'Service';
      } else if (contentFocus === 'INFORMASI') {
        primary = 'Article';
        secondary = 'FAQPage';
      }
    }

    return {
      primary: primary,
      secondary: secondary
    };
  }

  // ═══════════════════════════════════════════════════════════
  // DETECT CTA TYPE
  // ═══════════════════════════════════════════════════════════

  function detectCtaType(level, contentFocus) {
    var isMoneyLevel = ['money-master', 'money-page', 'money-child'].indexOf(level) !== -1;

    if (!isMoneyLevel) {
      return { type: 'soft', text: 'Baca Selengkapnya' };
    }

    if (contentFocus === 'HARGA' || contentFocus === 'COMMERCIAL') {
      return { type: 'hard', text: 'Pesan Sekarang' };
    }

    return { type: 'medium', text: 'Hubungi Kami' };
  }

  // ═══════════════════════════════════════════════════════════
  // DETECT KATEGORI
  // ═══════════════════════════════════════════════════════════

  function detectKategori(contentFocus) {
    if (contentFocus === 'INFORMASI') return 'EVERGREEN';
    if (['HARGA', 'COMMERCIAL', 'GABUNG'].indexOf(contentFocus) !== -1) return 'NON-EVERGREEN';
    return 'EVERGREEN';
  }

  // ═══════════════════════════════════════════════════════════
  // DETECT H1 PATTERN
  // ═══════════════════════════════════════════════════════════

  function detectH1Pattern(kategori) {
    return kategori === 'NON-EVERGREEN' ? 'with-year' : 'no-year';
  }

  // ═══════════════════════════════════════════════════════════
  // 🧪 FIX 34 (v22.67): TEST SUITE
  // ═══════════════════════════════════════════════════════════

  function runTestSuite() {

    var TEST_CASES = [
      // ═══ JASA ═══
      { slug: "jasa pasang pagar", entity: "jasa", expect: "money-master", note: "base service" },
      { slug: "jasa coring beton", entity: "jasa", expect: "money-master", note: "coring = service name" },
      { slug: "harga jasa coring beton", entity: "jasa", expect: "money-master", note: "price + base service" },
      { slug: "jasa las besi", entity: "jasa", expect: "money-master", note: "las = service name" },
      { slug: "jasa gali tanah", entity: "jasa", expect: "money-master", note: "gali = service name" },
      { slug: "jasa bongkar bangunan", entity: "jasa", expect: "money-master", note: "bongkar = service name" },
      { slug: "jasa coring hidrolik", entity: "jasa", expect: "variant", note: "hidrolik = PURE_METHOD" },
      { slug: "jasa coring 30cm", entity: "jasa", expect: "sub-variant", note: "30cm = dimension" },
      { slug: "jasa pasang pagar jakarta", entity: "jasa", expect: "money-child", note: "location" },
      { slug: "jasa pasang pagar terdekat", entity: "jasa", expect: "money-child", note: "terdekat standalone" },
      { slug: "panduan pasang pagar dekat pantai", entity: "jasa", expect: "money-master", note: "dekat [FISIK] bukan lokasi" },

      // ═══ MATERIAL ═══
      { slug: "semen portland", entity: "material", expect: "money-master", note: "portland bukan spec" },
      { slug: "semen sni", entity: "material", expect: "variant", note: "sni = spec" },
      { slug: "semen 50kg", entity: "material", expect: "sub-variant", note: "50kg = dimension" },
      { slug: "pasir beton grade a", entity: "material", expect: "variant", note: "grade a = spec" },
      { slug: "besi beton ulir", entity: "material", expect: "variant", note: "ulir = spec" },
      { slug: "harga besi beton ulir", entity: "material", expect: "money-page", note: "price + spec" },

      // ═══ SEWA ═══
      { slug: "sewa excavator", entity: "sewa", expect: "money-master", note: "excavator = base entity" },
      { slug: "sewa excavator mini", entity: "sewa", expect: "money-master", note: "mini = tidak pure" },
      { slug: "sewa excavator pc75", entity: "sewa", expect: "variant", note: "pc75 = spec (merek)" },
      { slug: "sewa crane 25 ton", entity: "sewa", expect: "sub-variant", note: "25 ton = dimension" },
      { slug: "harga sewa excavator", entity: "sewa", expect: "money-master", note: "price + base entity" },
      { slug: "harga sewa pencahayaan proyek", entity: "sewa", expect: "money-master", note: "price + no spec" },

      // ═══ DESAIN ═══
      { slug: "desain interior minimalis", entity: "desain", expect: "variant", note: "minimalis = spec gaya" },
      { slug: "desain interior modern", entity: "desain", expect: "variant", note: "modern = spec gaya" },
      { slug: "desain interior kayu", entity: "desain", expect: "money-master", note: "kayu = base material" },

      // ═══ PRODUK ═══
      { slug: "pagar panel beton k300", entity: "produk", expect: "variant", note: "k300 = mutu" },
      { slug: "harga pagar panel beton k300", entity: "produk", expect: "money-page", note: "price + spec" },
      { slug: "pagar panel beton putih", entity: "produk", expect: "variant", note: "putih = warna" },
     
      // ═══ EDGE CASE ═══
      { slug: "cari jasa pasang pagar", entity: "jasa", expect: "money-master", note: "cari = informational" },
      { slug: "mau pasang pagar", entity: "jasa", expect: "money-master", note: "mau = informational" },
      { slug: "butuh kontraktor", entity: "jasa", expect: "money-master", note: "butuh = informational" },
      { slug: "jual sewa excavator", entity: "sewa", expect: "money-page", note: "jual = TRUE commercial" },

      // ═══ FIX 35-37 (v22.67.1) — TAMBAHAN ═══
      { slug: "layanan bor sumur", entity: "jasa", expect: "money-master", note: "layanan = provider label" },
      { slug: "penyedia bor sumur", entity: "jasa", expect: "money-master", note: "penyedia = provider label" },
      { slug: "pengrajin pagar besi", entity: "jasa", expect: "money-master", note: "pengrajin = provider label" },
      { slug: "spesialis bor sumur", entity: "jasa", expect: "money-master", note: "spesialis = provider label" },
      { slug: "cari tukang bor sumur", entity: "jasa", expect: "money-master", note: "cari + tukang" },
      { slug: "cari jasa coring beton", entity: "jasa", expect: "money-master", note: "cari + base" },
      { slug: "pagar panel beton premium", entity: "produk", expect: "variant", note: "premium = spec mutu" },
      { slug: "pagar panel beton ekonomis", entity: "produk", expect: "variant", note: "ekonomis = spec mutu" },
      { slug: "besi beton premium", entity: "material", expect: "money-master", note: "premium tidak ada di PURE_MATERIAL" }
    ];

    console.log("═══════════════════════════════════════════════════════════");
    console.log("🧪 PLD v22.67 — TEST SUITE");
    console.log("═══════════════════════════════════════════════════════════");

    var passed = 0;
    var failed = 0;
    var failures = [];

    for (var i = 0; i < TEST_CASES.length; i++) {
      var test = TEST_CASES[i];
      var result;
      try {
        result = pageLevelDetectorv22.detectForPrompt(test.slug, test.entity);
      } catch (e) {
        result = { pageLevel: "ERROR: " + e.message };
      }

      var actual = result.pageLevel;
      var isPass = (actual === test.expect);

      if (isPass) {
        passed++;
        console.log(
          "✅ [" + test.entity + "] \"" + test.slug + "\" → " + actual +
          " (" + test.note + ")"
        );
      } else {
        failed++;
        failures.push(test);
        console.log(
          "❌ [" + test.entity + "] \"" + test.slug + "\" → " + actual +
          " (expected: " + test.expect + ") — " + test.note
        );
      }
    }

    console.log("═══════════════════════════════════════════════════════════");
    console.log("📊 HASIL: " + passed + " PASSED / " + failed + " FAILED");
    console.log("═══════════════════════════════════════════════════════════");

    if (failed > 0) {
      console.log("🚨 FAILURES:");
      failures.forEach(function(f) {
        console.log("   • " + f.slug + " → " + f.expect);
      });
    }

    return {
      total: TEST_CASES.length,
      passed: passed,
      failed: failed,
      failures: failures
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 📌 INITIALIZATION
  // ═══════════════════════════════════════════════════════════

  function initializeCore() {
    log('🧠 Core functions ready', 'CORE');

    window.pageLevelDetectorv22 = {
      version: "22.67",
      CONFIG: CONFIG,

      // ─── DETEKSI ───
      detect: detectPageLevel,
      detectFromDOM: detectPageLevelFromDOM,
      detectForPrompt: detectForPrompt,
      detectForPromptFull: detectForPromptFull,
      detectForPromptWithUpward: detectForPromptWithUpward,

      // ─── PHASE 4 RE-VALIDASI ───
      validateForPrompt: validateForPrompt,

      // ─── UPAWARD / BREADCRUMBS ───
      detectUpwardFromSlug: detectUpwardFromSlug,
      detectBreadcrumbsFromSlug: detectBreadcrumbsFromSlug,
      detectParentFromSlug: detectParentFromSlug,
      detectParentLevelFromSlug: detectParentLevelFromSlug,

      // ─── UTILITY ───
      getConfidenceScore: getConfidenceScore,
      detectEntityType: detectEntityType,
      VALID_LEVELS: VALID_LEVELS,
      TYPE_LEVEL_MAP: TYPE_LEVEL_MAP,
      VALID_ENTITY_TYPES: VALID_ENTITY_TYPES,
      ENTITY_PILLAR_NAMES: ENTITY_PILLAR_NAMES,

      // ─── FIX 9-11 + 20-28 ───
      getH1Text: getH1Text,
      checkPriceTable: checkPriceTable,
      setSchemaAttributes: setSchemaAttributes,
      detectContentFocus: detectContentFocus,
      detectKategori: detectKategori,
      detectH1Pattern: detectH1Pattern,
      detectEntitySubType: detectEntitySubType,
      detectSchemaType: detectSchemaType,
      detectCtaType: detectCtaType,
      detectProductCategoryFromPLD: detectProductCategoryFromPLD,
      detectProductMaterialFromPLD: detectProductMaterialFromPLD,

      // 🔥 FIX 28: updateAttributes() handle null
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

          setSchemaAttributes(level);

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
          log('🍞 Menunggu breadcrumbs...', 'BREAD');
          return new Promise(function(resolve) {
            waitForBreadcrumbs(function(err, breadcrumb) {
              if (err || !breadcrumb) {
                log('⚠️ Breadcrumbs tidak ditemukan', 'WARN');
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

      // 🧪 FIX 34: Test Suite
      runTestSuite: runTestSuite,

      // ─── DATA EXPORT ───
      JASA_WORDS: JASA_WORDS,
      COMMON_JASA_WORDS: COMMON_JASA_WORDS,
      SEWA_WORDS: SEWA_WORDS,
      MATERIAL_WORDS: MATERIAL_WORDS,
      PRODUK_WORDS: PRODUK_WORDS,
      DESAIN_WORDS: DESAIN_WORDS,

      ENTITY_ONLY_WORDS: ENTITY_ONLY_WORDS,
      PURE_JASA_TECHNIQUES: PURE_JASA_TECHNIQUES,
      PURE_METHODS: PURE_METHODS,
      PURE_SCALES: PURE_SCALES,
      PURE_FINISHING: PURE_FINISHING,
      PURE_PRODUK_SPECS: PURE_PRODUK_SPECS,
      PURE_MATERIAL_SPECS: PURE_MATERIAL_SPECS,
      PURE_SEWA_SPECS: PURE_SEWA_SPECS,
      PURE_DESAIN_SPECS: PURE_DESAIN_SPECS,

      PRODUK_SPECS: PRODUK_SPECS,
      MATERIAL_SPECS: MATERIAL_SPECS,
      SEWA_SPECS: SEWA_SPECS,
      JASA_SPECS: JASA_SPECS,
      DESAIN_SPECS: DESAIN_SPECS,

      COMMERCIAL_WORDS: COMMERCIAL_WORDS,
      INFORMATIONAL_WORDS: INFORMATIONAL_WORDS,
      HIGH_VOLUME_WORDS: HIGH_VOLUME_WORDS,
      SIZE_WORDS: SIZE_WORDS,
      TIER_1_LOCATION: TIER_1_LOCATION,
      FISIK_WORDS: FISIK_WORDS,
      LOCATION_WORDS: LOCATION_WORDS,
      PRICE_WORDS: PRICE_WORDS,

      isLocation: isLocation,
      checkHasSpecification: checkHasSpecification,
      checkPureTechnicalSpec: checkPureTechnicalSpec,
      checkHasCommercial: checkHasCommercial,
      checkHasPrice: checkHasPrice,
      getCoreWords: getCoreWords,
      getFactors: getFactors,
      cleanText: cleanText,
      extractSlugFromInput: extractSlugFromInput
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

    console.log("═══════════════════════════════════════════════════════════");
    console.log("✅ Page Level Detector v22.67 FINAL Ready");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🔧 FIX 1-8: Core detection (v22.62)");
    console.log("🔥 FIX 9-11: Browser mode attribute (v22.63-22.65)");
    console.log("🔥 FIX 12-19: Bug fixes logic (v22.66)");
    console.log("🔥 FIX 20-28: Browser null-safety (v22.66)");
    console.log("🔥 FIX 29-33: Cleanup service names (v22.67)");
    console.log("🔥 FIX 34: Update versi + Test Suite (v22.67)");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🧪 Cara test: runPLDTestSuite()");
    console.log("═══════════════════════════════════════════════════════════");

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

  // ═══════════════════════════════════════════════════════════
  // BOOTSTRAP
  // ═══════════════════════════════════════════════════════════

  log('🚀 Starting Page Level Detector v22.67 FINAL...', 'INFO');

  waitForDOM(function() {
    initializeCore();
  });

  if (typeof document !== 'undefined' && document.readyState === 'complete') {
    if (!window.pageLevelDetectorv22) {
      log('⚠️ Safety net: DOM sudah complete, init now', 'WARN');
      initializeCore();
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 🧪 GLOBAL TEST HELPER — FIX 34
  // ═══════════════════════════════════════════════════════════

  if (typeof window !== "undefined") {
    window.runPLDTestSuite = function() {
      if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.runTestSuite) {
        return window.pageLevelDetectorv22.runTestSuite();
      } else {
        console.error("❌ PLD belum ready. Tunggu 1-2 detik, lalu coba lagi.");
        return null;
      }
    };
  }

})();

 
