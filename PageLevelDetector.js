/* ============================================================
🧠 Page Level Detector v23.9.2 — HIERARCHY + PRUNE + CONSISTENCY
============================================================
BASE: v23.9.1

🔥 FIX 181-219 — DIPERTAHANKAN SEMUA
🔥 FIX v14-A — ENTITY_BASE_NAMES STRICT MODE (head term murni)
🔥 FIX v14-B — checkHasSpecification(produk) + material category
🔥 FIX v14-C — Priority 7 gate pakai earlyLayers
🔥 FIX v14-D — Priority 12 cek modifier nyata
🔥 FIX v14-E — Update test cases konsisten STRICT MODE
🔥 FIX v14-F — Self-audit: countModifierLayers(base) HARUS 0

🎯 PRINSIP: Base name = head term MURNI → MM (0 layer)
   Material/target/merek/tipe/ukuran WAJIB jadi modifier → MP/Variant
============================================================ */

(function () {
  "use strict";

if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.version === "23.9.2") {
    console.warn("⚠️ [PLD v23.9.2] Already loaded!");
    return;
}

  var CONFIG = {
    DEBUG: false,
    BREADCRUMBS_TIMEOUT: 5000,
    BREADCRUMBS_SELECTORS: [
      '.breadcrumb', '.breadcrumbs', '.bread-crumb',
      '[class*="breadcrumb"]', '[class*="bread-crumb"]',
      '.woocommerce-breadcrumb', '.yoast-breadcrumbs',
      '.rank-math-breadcrumb', '.aioseo-breadcrumbs',
      '[itemprop="breadcrumb"]', '[typeof="BreadcrumbList"]',
      'nav[aria-label="breadcrumb"]', 'ol.breadcrumb', 'ul.breadcrumb'
    ],
    AI_ENABLED: true,
    AI_CONFIDENCE_THRESHOLD: 60,
    AI_TIMEOUT_MS: 8000,
    AI_WORKER_URL: "https://pld-proxy.jasaalkonstruksi.workers.dev",
    AI_PROVIDER: "auto"
  };

  function log(message, type) {
    if (!CONFIG.DEBUG && type === "INFO") return;
    if (!type) type = "INFO";
    var icons = {
      INFO: "📘", SUCCESS: "✅", WARN: "⚠️", ERROR: "❌",
      LOCATION: "📍", VARIANT: "🔬", PRICE: "💰", MM: "🏛️",
      CORE: "🧠", DETECT: "🎯", INTENT: "🎯", BREAD: "🍞",
      EXTERNAL: "📦", COMMERCIAL: "🛒", HARGA: "💵",
      VALIDATE: "🔍", CROSS: "🔀", ATTR: "🏷️", TABLE: "📊",
      BROWSER: "🌐", FIX: "🔥", TEST: "🧪", SEO: "🎯",
      QUESTION: "❓", COMMINV: "🔍", PERSATUAN: "📏",
      SPECPHRASE: "📋", PILLAR: "🏛️", MATTYPE: "🧱",
      FISIKCTX: "🎭", VERBEXP: "⚡", COMPOUND: "🔗",
      AI: "🤖", GROQ: "⚡", GEMINI: "💎",
      OBJECT: "🧊", SCORE: "🎚️", BASE: "🏗️", CROSSSPEC: "🎯",
      DOM: "🌐", EEAT: "🔐", STRUCTURE: "📐", SNIPPET: "⭐"
    };
    console.log((icons[type] || "📘") + " [PLD v23.9.2] " + message);
  }

log('📦 PLD v23.9.2 — HIERARCHY + PRUNE + CONSISTENCY (FIX v14-A..F)', 'EXTERNAL');

  var VALID_LEVELS = [
    "home", "pillar", "sub-pillar-tipe-2", "sub-pillar-tipe-1",
    "money-master", "money-page", "money-child", "variant", "sub-variant"
  ];

  var TYPE_LEVEL_MAP = {
    home: 0, pillar: 1, "sub-pillar-tipe-2": 2, "sub-pillar-tipe-1": 3,
    "money-master": 4, "money-page": 5, "money-child": 6,
    variant: 7, "sub-variant": 8
  };

  var LEVEL_HIERARCHY_MAP = {
    "pillar": 1, "sub-pillar-tipe-2": 2, "sub-pillar-tipe-1": 3,
    "money-master": 4, "money-page": 5, "money-child": 6,
    "variant": 7, "sub-variant": 8
  };

  var LEVEL_INVERSE_MAP = {
    1: "pillar", 2: "sub-pillar-tipe-2", 3: "sub-pillar-tipe-1",
    4: "money-master", 5: "money-page", 6: "money-child",
    7: "variant", 8: "sub-variant"
  };

  var EXPECTED_CHILD_MAP = {
    "pillar":            { expected: "sub-pillar-tipe-2", num: 2,
                           alternates: ["sub-pillar-tipe-1", "money-master"] },
    "sub-pillar-tipe-2": { expected: null,                num: 2, isLeaf: true },
    "sub-pillar-tipe-1": { expected: null,                num: 3, isLeaf: true },
    "money-master":      { expected: "money-page",        num: 5,
                           alternates: ["money-child"] },
    "money-page":        { expected: "money-child",       num: 6,
                           alternates: ["variant"] },
    "money-child":       { expected: null,                num: 6, isLeaf: true },
    "variant":           { expected: "sub-variant",       num: 8 },
    "sub-variant":       { expected: null,                num: 9, isLeaf: true }
  };
  var VALID_ENTITY_TYPES = ["produk", "material", "jasa", "desain", "sewa", "artikel"];

  var ENTITY_PILLAR_NAMES = {
    jasa: ["jasa konstruksi"],
    produk: ["produk konstruksi"],
    material: ["material konstruksi"],
    desain: ["jasa desain"],
    "produk interior": ["produk interior"],
    sewa: ["sewa alat konstruksi"],
    artikel: ["artikel konstruksi"]
  };

    // 🔥 FIX v14-M: entity triggers extended
  var ENTITY_TRIGGERS = {
    jasa: [
      "jasa", "kontraktor", "tukang", "borongan",
      "renovasi", "bangun", "perbaikan", "perawatan",
      "instalasi", "pemasangan", "pembongkaran", "pembersihan",
      "coring", "cutting", "grouting", "sandblasting",
      "pengeboran", "pemancangan", "pengecoran", "pengelasan",
      "pondasi", "bored pile", "bor pile", "strauss", "pancang",
      "waterproofing", "epoxy", "coating", "poles",
      "service", "servis", "layanan"
    ],
    desain: [
      "desain", "interior", "eksterior", "arsitektur",
      "konsep", "rencana", "gambar kerja", "denah",
      "render", "visualisasi", "3d design", "shop drawing"
    ],
    sewa: ["sewa", "rental", "rent"],
    material: [
      "material", "bahan", "semen", "pasir", "besi", "baja", "kayu",
      "keramik", "granit", "marmer", "bata", "batako", "hebel",
      "genteng", "pipa", "cat", "kabel", "paku", "baut"
    ],
    produk: [
      "produk", "jual", "beli", "supplier", "distributor", "toko",
      "pintu", "jendela", "pagar", "kanopi", "railing", "gerbang",
      "wastafel", "closet", "kitchen set", "wardrobe"
    ],
    artikel: [
      "artikel", "blog", "tips", "panduan", "cara", "tutorial",
      "review", "ulasan", "berita", "informasi", "update"
    ]
  };
   
  var ENTITY_PRIORITY = ["jasa", "sewa", "desain", "produk", "material", "artikel"];

  var JASA_WORDS = [
    'jasa','kontraktor','tukang','borongan','renovasi','pasang','bangun','perbaikan','instalasi','proyek',
    'cor','gali','urug','angkut','service','servis','desain','interior','eksterior','arsitektur',
    'coring','cutting','drilling','pengeboran','pemancangan','pemasangan','bongkar','potong','las','sambung',
    'grinding','welding','bending','forming','pondasi','tiang','pancang','bore','pile','strauss',
    'konstruksi','bangunan','rumah','gedung','ruko','gudang','pabrik','jalan','jembatan','infrastruktur'
  ];

  var COMMON_JASA_WORDS = [
    'tukang','kontraktor','mandor','vendor','supplier','layanan','penyedia','pengrajin','spesialis',
    'biro','firma','perusahaan','penjual jasa','pasang','pemasangan','bangun','renovasi','perbaikan',
    'instalasi','service','servis','konstruksi','pembangunan','cor','gali','urug','angkut',
    'pemotongan','penggalian','pengurugan','pengangkutan','pengeboran','pengelasan','pengecoran','pengecatan',
    'pengukuran','pemasangan','pembongkaran','pembuatan','pengupasan','pemadatan','pengerukan','pemancangan',
    'pengeringan','pembersihan','perataan','pembentukan','persiapan','pemindahan','pengangkatan','pengolahan',
    'pengerjaan','penyelesaian','pemeliharaan','memotong','menggali','mengurug','mengangkat','mengebor',
    'mengelas','mengecor','mengecat','mengukur','memasang','membongkar','membuat','mengupas','memadatkan',
    'mengeruk','memancang'
  ];

  // 🔥 FIX v14-N: sewa words extended
  var SEWA_WORDS = [
    'sewa','rental','rent','alat','mesin','heavy equipment','excavator','bulldozer','crane','backhoe',
    'dozer','vibro','roller','compactor','diesel','hydraulic','mini','besar','kecil','sedang','medium','extra',
    'scaffolding','steger','tenda','terpal',
    'portacamp','toilet portable','tower lamp'
  ];

    // 🔥 FIX v14-N: material words extended
  var MATERIAL_WORDS = [
    'material','bahan','semen','pasir','batu split','kerikil','besi','baja','kayu','keramik','granit',
    'marmer','gypsum','plafon','paving','bata','batako','hebel','genteng','asbes','atap','baja ringan',
    'galvalum','precast','pracetak','readymix','ready mix',
    'paku','baut','mur','sekrup','kawat','wiremesh',
    'cat','vernis','politur','plamir','lem',
    'pipa','kabel','fitting','kran'
  ];
  // 🔥 FIX v14-N: produk words extended
  var PRODUK_WORDS = [
    'produk','jual','beli','supplier','distributor','toko','shop',
    'pagar panel','panel beton','pagar beton','pagar panel beton',
    'kanopi','paving block','u ditch','box culvert','bata ringan',
    'atap baja ringan','besi beton',
    'pintu','jendela','kusen','pagar','railing','gerbang',
    'wastafel','closet','kitchen set','wardrobe','lemari'
  ];

  // 🔥 FIX v14-N: desain words extended
  var DESAIN_WORDS = [
    'desain','interior','eksterior','arsitektur','layout','denah','gambar','konsep','rencana','modern',
    'minimalis','klasik','tradisional','kontemporer','elegan','luxury','industrial','scandinavian','jepang',
    'rustic','vintage',
    'render','visualisasi','3d','shop drawing','tata ruang'
  ];

    // 🔥 FIX v14-Q: entity only words extended
  var ENTITY_ONLY_WORDS = {
    jasa: ["jasa", "layanan", "service", "servis"],
    sewa: ["sewa", "rental"],
    produk: ["produk", "barang", "item"],
    material: ["material", "bahan"],
    desain: ["desain", "interior", "eksterior"],
    artikel: ["artikel", "blog", "post", "berita"]
  };

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX v14-A: ENTITY_BASE_NAMES — STRICT MODE
  // Prinsip: base name = head term MURNI (K1-K4)
  // Verifikasi: countModifierLayers(base) === 0 HARUS lulus 100%
  // ═══════════════════════════════════════════════════════════
  var ENTITY_BASE_NAMES = {

    // ─── PRODUK (barang jadi) ───
       produk: [
      // K1: Single word head term
      "pintu", "jendela", "kusen", "pagar", "kanopi", "kaca",
      "pipa", "plafon", "keramik", "granit", "marmer",
      "wallpaper", "atap", "paving",
      "kitchen set", "wardrobe", "sofa", "meja", "kursi",
      "lemari", "nakas", "tempat tidur", "bed frame",
      "gazebo", "kolam", "taman",
      "lampu", "cctv", "saklar listrik", "stop kontak", "panel listrik",
      // 🔥 FIX v14-L: produk head term baru
      "railing", "tangga", "gerbang", "wastafel", "closet",
      "tandon air", "tangki air", "water heater",
      "gorden", "blind", "kasa nyamuk", "tralis",
      "rak dinding", "rak tv", "rak buku", "gantungan baju",

      // K2: Compound noun sejati (idiom industri)
      // 🔥 FIX A-7: "pagar brc" sebagai kategori produk tersendiri
      "pagar panel", "pagar beton", "pagar brc",
      "u ditch", "u ditch cover", "tutup u ditch",
      "box culvert", "buis beton",
      "gorong gorong",
      "sumuran", "sumur resapan",
      "kanstin beton", "kanstin", "curb stone",
      "grass block", "paving block",
      "rooster beton", "roster beton",
      "spun pile", "mini pile", "micropile", "sheet pile",
      "tiang pancang", "half slab", "sloof beton", "kolom praktis",

      // K2 extended (idiom yang sudah menyatu)
      "kolam renang", "taman kering", "taman vertikal",
      "walk in closet"
    ],
     
    // ─── MATERIAL (bahan mentah / kategori umum) ───
        material: [
      "semen", "pasir", "batu", "besi", "baja", "kayu",
      "beton", "pipa", "kabel", "fitting",
      "valve", "kran", "cat", "vernis", "politur", "plamir", "lem",
      "waterproofing",
      "keramik", "granit", "marmer", "gypsum", "plafon", "paving",
      "bata", "batako", "hebel", "genteng", "asbes", "atap",
      "galvalum", "precast", "pracetak", "kaca", "aluminium",
      "kerikil",

      // K2
      "ready mix", "readymix",
      "baja ringan", "besi beton", "bata ringan",
      "batu split", "batu kali", "batu belah",
      "paku", "baut", "sekrup", "mur", "kawat",
      "wiremesh", "besi wiremesh",
      "kabel twisted", "kabel nyy", "kabel nym"
    ],
     
    // ─── JASA (verb + object = 1 pekerjaan utuh) ───
    jasa: [
      // Pondasi & tiang
      "bore pile", "bor pile", "bored pile", "boring pile",
      "mini pile", "spun pile", "micropile",
      "bor strauss", "bor pancang", "strauss pile",
      "tiang pancang", "pancang",
      "turap", "sheet pile",
      "jet grouting", "stabilisasi tanah", "soil improvement",
      "sumur bor", "bor sumur",

      // Cor
      // 🔥 FIX v14-L: hapus "cor beton" (beton=material → MP)
      "cor", "cor dak", "cor lantai", "cor jalan", "cor kolom",
      "cor sloof", "cor balok", "cor plat", "cor pondasi",
      "cor tiang", "cor dinding", "cor pagar",

      // Pasang
      "pasang dinding", "pasang keramik", "pasang granit", "pasang marmer",
      "pasang parket", "pasang vinyl", "pasang ubin",
      "pasang wallpaper", "pasang wpc", "pasang grc", "pasang hpl",
      "pasang partisi", "pasang pagar", "pasang kanopi", "pasang awning",
      // 🔥 FIX R-2: base baru
      "pasang railing", "pasang tangga", "pasang gerbang",
      "pasang baja ringan", "pasang rangka atap", "pasang atap",
      "pasang genteng", "pasang plafon", "pasang gypsum",
      "pasang pintu", "pasang jendela", "pasang kusen", "pasang kaca",
      "pasang shower box",
      "pasang instalasi listrik", "pasang instalasi air",
      "pasang instalasi gas", "pasang instalasi ac",
      "pasang pipa", "pasang kabel listrik", "pasang panel listrik",
      "pasang ac", "pasang cctv", "pasang alarm",

      // Bongkar
      "bongkar dinding", "bongkar lantai", "bongkar plat",
      "bongkar gedung", "bongkar rumah", "bongkar ruko",
      "bongkar gudang", "bongkar atap",
      "bongkar keramik", "bongkar granit", "bongkar marmer",
      "bongkar plafon", "bongkar kusen", "bongkar pintu", "bongkar jendela",
      "bongkar pagar", "bongkar partisi",

      // Tanah
      "gali tanah", "gali pondasi", "gali basement", "gali saluran",
      "penggalian tanah", "penggalian pondasi",
      "urug tanah", "urug lahan", "urug pondasi", "urug jalan",
      "pengurugan tanah", "pengurugan lahan",
      "angkut tanah", "angkut puing", "angkut material",
      "pemadatan tanah", "pemadatan lahan",
      "pengerukan sungai", "pengerukan kolam", "pengerukan saluran",
      "pemotongan bukit", "cut and fill",

      // Renovasi
      "renovasi rumah", "renovasi gedung", "renovasi kantor",
      "renovasi toko", "renovasi ruko", "renovasi gudang",
      "renovasi pabrik", "renovasi apartemen",
      "renovasi dapur", "renovasi kamar mandi", "renovasi kamar tidur",
      "renovasi ruang tamu", "renovasi teras", "renovasi balkon",
      "renovasi atap", "renovasi lantai", "renovasi dinding",
      "renovasi plafon", "renovasi pagar", "renovasi taman",

      // Cat & finishing
      "cat dinding", "cat tembok", "cat plafon", "cat kayu",
      "cat besi", "cat pagar",
      "pengecatan dinding", "pengecatan tembok",
      "waterproofing",
      "poles marmer", "poles granit", "poles keramik", "poles lantai",
      "grinding", "grinding beton", "grinding lantai",
      "epoxy lantai", "coating", "coating lantai", "coating beton",

      // Instalasi & service
      "instalasi listrik", "instalasi air", "instalasi plumbing",
      "instalasi ac", "instalasi cctv", "instalasi alarm",
      "service ac", "service pompa air", "service genset", "service lift",
      "perbaikan atap", "perbaikan dinding", "perbaikan lantai",
      "perbaikan plafon", "perbaikan pondasi", "perbaikan struktur",
      "perbaikan pipa", "perbaikan saluran air",
      "perawatan gedung", "perawatan kolam",

      // Base verb tunggal
      "coring", "cutting", "bor", "drilling", "boring", "grouting",
      "las", "welding", "sandblasting",

      // Las + object
      "las besi", "las pagar", "las kanopi", "las rangka baja", "las tiang",
      "welding besi", "welding konstruksi",

      // Sandblasting + object
      "sandblasting besi", "sandblasting beton", "sandblasting dinding",

            // Bangun & borongan
      // 🔥 FIX v14-L: JASA teknik baru
      "bangun rumah", "bangun gedung", "bangun ruko", "bangun gudang",
      "bangun kantor", "bangun pabrik", "bangun sekolah",
      "borongan rumah", "borongan gedung", "borongan interior",
      // JASA teknik baru
      "pembersihan lahan", "land clearing",
      "pengaspalan", "aspal jalan",
      "pemasangan wifi", "instalasi internet", "instalasi antena",
      "pemasangan parabola",
      "pembuatan kanopi", "pembuatan pagar", "pembuatan railing"   
    ],

    // ─── SEWA (nama alat / equipment) ───
    sewa: [
      "alat berat", "heavy equipment",
      "excavator", "bulldozer", "backhoe", "dozer", "vibro",
      "crane", "truck crane", "mobile crane", "crawler crane", "tower crane",
      "dump truck", "motor grader", "wheel loader",
      "asphalt finisher", "asphalt paver", "tandem roller",
      "pneumatic tire roller", "cold milling", "batching plant",
      "concrete pump", "pompa beton", "pompa air",
      "jack hammer", "forklift", "genset",
      "boom lift", "skylift", "scissor lift", "man lift",
      "articulated boom lift", "telescopic boom lift",
      "concrete mixer", "molen beton", "vibrator beton",
      "chain block", "hoist crane", "overhead crane", "gantry crane",
      "winch", "cable puller",
      "vibratory plate", "stamper kodok", "tamper", "wacker plate",
      "vibro plate", "soil compactor",
      "trowel beton", "power trowel", "mesin plester", "mesin acian",
      "mesin cat", "spray gun", "airless sprayer",
      "mesin potong", "chainsaw", "gergaji mesin",
      "pompa celup", "pompa submersible", "pompa sentrifugal",
      "pompa transfer", "kompresor angin", "compressor",
      // 🔥 FIX v14-L: sewa baru
      "scaffolding", "steger", "tenda", "terpal",
      "toilet portable", "portacamp",
      "tower lamp", "lampu sorot"
    ],

    // ─── DESAIN (desain + scope = 1 layanan) ───
    desain: [
      // Head term
      "desain interior", "desain eksterior", "desain rumah",
      "desain arsitektur", "desain 3d", "desain denah", "desain layout",
      "desain bangunan", "desain struktur",

           // Scope bangunan
      // 🔥 FIX v14-L: scope baru
      "desain kantor", "desain toko", "desain ruko", "desain villa",
      "desain apartemen", "desain showroom",
      "desain kos", "desain guest house", "desain pujasera",
      "desain warung", "desain bengkel", "desain gudang",
      "desain foodcourt", "desain kedai",
      "desain kafe", "desain cafe", "desain restoran", "desain hotel",
      "desain bar", "desain lounge", "desain spa", "desain salon",
      "desain minimarket", "desain butik",
      "desain sekolah", "desain klinik",

      // Scope ruangan
      "desain dapur", "desain kamar mandi", "desain kamar tidur",
      "desain ruang tamu", "desain ruang keluarga", "desain ruang makan",
      "desain ruang kerja", "desain teras", "desain balkon",
      "desain carport", "desain fasad",
      "desain taman", "desain kolam renang", "desain gazebo",
      "desain walk in closet", "desain kamar anak",

      // Teknik
      "gambar arsitektur", "gambar kerja", "gambar teknik"
    ]
  };

  // 🔥 FIX 162b: Sort base names DESC by word count (longest first)
  (function() {
    for (var ent in ENTITY_BASE_NAMES) {
      if (!ENTITY_BASE_NAMES.hasOwnProperty(ent)) continue;
      ENTITY_BASE_NAMES[ent].sort(function(a, b) {
        return b.split(' ').length - a.split(' ').length;
      });
    }
})();   // ← ✅ TAMBAHKAN BARIS INI
  // ═══════════════════════════════════════════════════════════
  // ✅ PART 1/3 SELESAI

  var PURE_JASA_TECHNIQUES = [];

  var PURE_METHODS = [
    "manual", "hidrolik", "auger", "rotary", "percussive",
    "dry", "wet", "basah", "kering",
    "mesin", "dalam", "dangkal", "artesis", "jet pump",
    "borongan", "perumahan", "proyek"
  ];

  var PURE_SCALES = ["rumahan", "komersial", "industri", "residential", "commercial", "industrial", "kecil", "sedang", "besar", "menengah"];

  var PURE_FINISHING = ["polos", "motif", "bermotif", "bercorak", "tekstur", "serat", "halus", "kasar", "matte", "glossy", "doff", "gloss", "satin", "anyaman", "natural", "ekspos", "custom", "polosan", "cat", "coating", "lapisan", "vernis"];

  var APPLICATION_TARGETS = [
    "dinding", "tembok", "lantai", "plafon", "atap",
    "partisi", "kolom", "balok", "plat", "slab", "pelat",
    "pondasi", "tiang", "tangga", "railing", "kusen",
    "pagar", "pintu", "jendela", "rolling door", "kanopi",
    "awning", "fasad", "facade",
    "teras", "balkon", "halaman", "carport", "garasi",
    "kamar mandi", "kamar tidur", "ruang tamu", "ruang keluarga",
    "ruang makan", "ruang kerja", "dapur", "toilet", "wc",
    "kantor", "toko", "gudang", "pabrik", "sekolah",
    "rumah", "gedung", "ruko", "villa", "apartemen",
    "cafe", "restoran", "hotel", "kios", "rukan",
    "jalan", "trotoar", "saluran", "drainase",
    "taman", "kolam", "sawah", "lahan"
  ];

  var APPLICATION_TARGETS_FULL = [
    "dinding","tembok","lantai","plafon","atap","partisi",
    "kolom","balok","plat","slab","pelat","pondasi","tiang",
    "tangga","railing","kusen","pagar","pintu","jendela",
    "kanopi","awning","fasad","facade",
    "teras","balkon","halaman","carport","garasi","kamar mandi",
    "kamar tidur","ruang tamu","ruang keluarga","ruang makan",
    "ruang kerja","dapur","toilet","wc",
    "kantor","toko","gudang","pabrik","sekolah","rumah","gedung",
    "ruko","villa","apartemen","cafe","restoran","hotel",
    "kios","rukan",
    "jalan","trotoar","saluran","drainase","taman","kolam",
    "sawah","lahan",
    "tambang","proyek","site","area kerja","basement",
    "custom","modern","minimalis","klasik"
  ];

  function isApplicationTarget(word) {
    if (!word) return false;
    var w = word.toLowerCase().trim();
    return APPLICATION_TARGETS.indexOf(w) !== -1 ||
           APPLICATION_TARGETS_FULL.indexOf(w) !== -1;
  }

  var SATUAN_UNITS = [
    "meter", "m", "cm", "mm", "km", "mtr", "mtrs", "inchi", "inch", "ft", "feet",
    "kg", "ton", "gram", "ons", "kuintal", "lbs", "pound",
    "liter", "ml", "galon", "m3", "cc", "dm3",
    "m2", "hektar", "ha", "are",
    "detik", "menit", "jam", "hari", "minggu", "bulan", "tahun",
    "harian", "mingguan", "bulanan", "tahunan",
    "unit", "buah", "lembar", "batang", "keping", "papan",
    "roll", "set", "paket", "titik", "boks", "dus", "karung",
    "sak", "kodi", "lusin", "gross",
    "ampere", "watt", "volt", "kva", "kw", "hp", "ps", "rpm", "psi", "bar", "pascal",
    "orang", "kali",
    "kubik", "pk", "truk", "colt", "pickup", "angkutan",
    "rim", "lot", "batch", "container", "kontainer"
  ];

  var QUESTION_WORDS = [
    "berapa", "apa itu", "apa yang", "apa beda", "apa perbedaan",
    "apa fungsi", "apa manfaat", "bagaimana", "gimana cara",
    "bagaimana cara", "mengapa", "kenapa", "kapan", "dimana",
    "di mana", "siapa", "yang mana", "apakah", "adakah"
  ];

  var COMMERCIAL_INVESTIGATION_WORDS = [
    "review", "ulasan", "testimoni", "pengalaman", "rating", "penilaian",
    "rekomendasi", "saran", "anjuran", "suggest", "terbaik", "terburuk",
    "terpopuler", "terfavorit", "top", "pilihan", "alternatif",
    "vs", "versus", "perbandingan", "bandingkan",
    "kelebihan", "kekurangan", "plus minus", "pro kontra", "untung rugi"
  ];

  var FREE_INFO_WORDS = ["panduan gratis", "ebook gratis", "template gratis", "download gratis", "pdf gratis"];
  var FREE_COMM_WORDS = ["konsultasi gratis", "survey gratis", "sample gratis", "demo gratis", "trial gratis", "estimasi gratis", "penawaran gratis"];
  var AUTHORITY_WORDS = ["resmi", "authorized", "official", "distributor resmi", "dealer resmi", "agen resmi", "mitra resmi", "sertifikat resmi"];
  var READY_STOCK_WORDS = ["ready stock", "ready stok", "siap pakai", "siap kirim", "stok tersedia", "fast respon", "same day", "instan", "ready"];

  var SPEC_PHRASE_WORDS = [
    "berdasarkan", "berdasar",
    "faktor penentu", "faktor yang mempengaruhi", "faktor utama",
    "penyebab", "sebab", "dampak", "pengaruh", "efek",
    "per kedalaman", "per ukuran", "per tipe", "per jenis",
    "langkah-langkah", "langkah demi langkah",
    "tahapan lengkap", "tahap demi tahap",
    "panduan lengkap", "tutorial lengkap",
    "analisis lengkap", "review lengkap",
    "perbandingan lengkap", "perbedaan lengkap",
    "jenis-jenis lengkap", "macam-macam lengkap",
    // 🔥 FIX v14-I: Prefix fungsional — 1 layer = MP (deterministik)
    "spesifikasi", "mutu", "metode", "cara kerja", "panduan", "fungsi"
  ];

  var SPEC_PHRASE_INFORMATIONAL = [
    "berdasarkan", "berdasar",
    "faktor penentu", "faktor yang mempengaruhi", "faktor utama",
    "penyebab", "sebab", "dampak", "pengaruh", "efek"
  ];

  var MARKETING_TERMS = [
    "premium", "ekonomis", "terbaik", "terlaris",
    "murah", "berkualitas", "unggul", "terkenal",
    "favorit", "recommended", "terpercaya"
  ];

  var MATERIAL_TYPE_WORDS = [
    "portland", "opc", "ppc", "pcc",
    "semen putih", "semen abu", "semen warna",
    "type 1", "type 2", "type 3", "type 4", "type 5",
    "tipe 1", "tipe 2", "tipe 3", "tipe 4", "tipe 5",
    "wiry", "bjku", "bjtd", "bjp", "bjts",
    "plywood", "multiplek", "blockboard", "mdf", "hdf", "particle board", "solid wood",
    "jati", "meranti", "mahoni", "sengon", "pinus", "randu",
    "sungkai", "bangkirai", "ulin", "kamper", "kruing", "keruing",
    "merbau", "sonokeling", "trembesi", "glugu", "bambu",
    "andesit", "kali", "apung", "split", "koral", "candi",
    "palimanan", "paras", "breksi", "granit", "marmer",
    "batu alam", "batu belah", "batu gunung", "batu karang",
    "silika", "zeolit", "cor",
    "homogeneous", "homogen", "roman", "platinum", "mulia", "essence",
    "granito", "granit tile", "keramik lantai", "keramik dinding",
    "marmer italy", "marmer lokal", "marmer import",
    "granit hitam", "granit putih", "granit coklat",
    "granit import", "granit lokal",
    "dulux", "jotun", "nippon", "mowilex", "avian", "decolith",
    "propan", "falcon", "vinilex", "dulux catylac",
    "cat tembok", "cat kayu", "cat besi", "cat dinding",
    "pasir beton", "pasir pasang", "pasir urug", "pasir halus",
    "pasir kasar", "pasir putih", "pasir hitam", "pasir ayak",
    "pasir silika", "pasir bangka", "pasir lumajang",
    "h-beam", "hbeam", "wf", "hollow", "kanal", "siku",
    "unesp", "unp", "cnp", "inp", "besi hollow", "besi kanal",
    "eterna", "supreme", "kabelindo", "tranka",
    "rucika", "wavin", "vinilon", "pralon", "maspion",
    "tembaga", "aluminium", "kuningan", "perunggu", "titanium",
    "besi cor", "aluminium foil",
    "bangka", "lumajang", "tulungagung", "pangkep", "muntilan",
    "borneo", "kalimantan", "jepara", "kudus", "cilacap",
    "tiga roda", "3 roda", "tiga-roda", "3-roda",
    "gresik", "semen gresik", "semen-gresik",
    "holcim", "semen holcim", "semen-holcim",
    "scg", "semen scg", "semen-scg",
    "padang", "semen padang", "semen-padang",
    "merah putih", "semen merah putih",
    "cibinong", "semen cibinong",
    "baturaja", "semen baturaja",
    "bosowa", "semen bosowa",
    "tonasa", "semen tonasa",
    "master", "besi master",
    "intan", "besi intan",
    "handuk", "besi handuk",
    "krakatau steel", "krakatau-steel", "ks",
    "gunung garuda", "gunung-garuda",
    "hanil", "jeka",
    "danagri", "magic", "aquaproof", "no drop", "no-drop",
    "nodrop", "aqua proof",
    "icera", "ardena", "milano", "asia tile", "asia-tile",
    "indograha", "kian", "eleganza", "elegan"
  ];

  var OBJECT_WORDS = [
    "tanah", "lahan", "badan", "permukaan", "dasar", "area",
    "bidang", "tapak", "kavling", "petak",
    "drainase", "geotekstil", "pondasi", "saluran", "gorong",
    "aspal", "pipa", "kabel", "tiang", "dinding", "gorong-gorong",
    "jembatan", "tanggul", "embung", "waduk", "bendungan",
    "beton", "cor", "besi", "baja", "kayu", "batu", "bata",
    "keramik", "granit", "marmer", "paving", "genteng",
    "rumah", "gedung", "ruko", "gudang", "pabrik",
    "jalan", "trotoar", "selokan",
    "bukit", "gunung", "sungai", "rawa", "gambut",
    "lereng", "tebing", "jurang", "lembah",
    "pile", "pancang", "strauss", "bore",
    "kolom", "balok", "plat", "slab", "pelat",
    "lantai", "plafon", "atap", "kusen",
    "septic", "septic tank", "resapan", "sumur",
    "tangga",
    "kamar", "kamar mandi", "kamar tidur",
    "dapur", "toilet", "wc",
    "ruang", "ruang tamu", "ruang makan", "ruang keluarga", "ruang kerja", "ruang tidur",
    "teras", "balkon", "fasad", "halaman", "carport", "garasi",
    "taman", "halaman depan", "halaman belakang",
    "kantor", "toko", "cafe", "restoran", "hotel",
    "apartemen", "showroom", "klinik", "mall", "sekolah",
    "rukan", "kios", "warung", "pujasera",
    "wallpaper", "parket", "laminasi", "vinyl",
    "wpc", "hpl", "grc", "acp",
    "pagar", "pintu", "jendela", "railing", "rolling door",
    "shower box", "tralis", "jeruji", "kanopi", "awning",
    "spandek", "alderon", "genteng metal",
    "wall", "wallpanel", "wall-panel", "moulding", "wall-moulding",
    "cornice", "plinth", "skirting", "wainscoting", "backdrop",
    "feature-wall", "feature wall", "ceiling", "drop-ceiling",
    "partisi", "sekat", "cladding", "facade", "facade-panel",
    "panel-dinding", "dinding-panel",
    "ac", "air conditioner", "cctv", "listrik", "instalasi listrik",
    "air", "pipa air", "plumbing", "gas", "panel-listrik",
    "travo", "trafo", "internet", "jaringan", "alarm",
    "kamera", "sensor", "detector", "detektor",
    "antena", "parabola", "wifi", "router", "cctv-kamera",
    "signage", "logo", "spanduk", "banner", "billboard",
    "neonbox", "neon box", "letter timbul", "huruf timbul",
    "papan nama", "plang", "reklame", "papan reklame",
    "kaca tempered", "kaca-polos", "kaca-bermotif", "kaca-buram",
    "kaca-es", "kaca-panasap", "aluminium-composite",
    "aluminium foil", "kaca-film", "kaca-jendela"
  ];

  var BASE_ENTITY_OBJECTS = [
    "beton", "batu", "kayu", "besi", "baja",
    "rumah", "gedung", "jalan",
    "keramik", "granit", "marmer", "vinyl", "wallpaper",
    "parket", "laminasi", "wpc", "hpl", "grc", "acp",
    "bata", "paving", "genteng", "kaca"
  ];

  var GENERIC_OBJECTS = [
    "tanah", "lahan", "bukit", "gunung", "sungai", "rawa",
    "gambut", "lereng", "tebing", "jurang", "lembah"
  ];

  var BASE_ENTITY_OBJECTS_SET = {};
  (function() {
    for (var i = 0; i < BASE_ENTITY_OBJECTS.length; i++) {
      BASE_ENTITY_OBJECTS_SET[BASE_ENTITY_OBJECTS[i]] = true;
    }
  })();

  var GENERIC_OBJECTS_SET = {};
  (function() {
    for (var i = 0; i < GENERIC_OBJECTS.length; i++) {
      GENERIC_OBJECTS_SET[GENERIC_OBJECTS[i]] = true;
    }
  })();

  var MATERIAL_SERVICE_NAMES = [
    "semen", "pasir", "batu split", "kerikil", "besi", "baja", "kayu",
    "keramik", "granit", "marmer", "gypsum", "plafon", "paving",
    "bata", "batako", "hebel", "genteng", "asbes", "atap",
    "baja ringan", "galvalum", "precast", "pracetak", "readymix",
    "beton", "cor", "kaca", "aluminium", "pipa"
  ];

  var CROSS_ENTITY_SPECS = {
    jasa: {
      sharedFinishing: PURE_FINISHING,
      sharedGaya: ["minimalis", "modern", "klasik", "custom", "elegan", "mewah", "eksklusif", "premium"],
      foreignTechniques: [
        "waterproofing", "grouting", "shotcrete", "guniting", "dewatering",
        "scaffolding", "bekisting", "formwork", "curing",
        "boring", "welding", "coating", "plating", "anodizing",
        "polishing", "sandblasting", "painting", "lining",
        "topping off", "lean concrete", "soil test",
        "sondir test", "cross hole", "bore pile test",
        "building maintenance", "home renovation", "waterproofing solution"
      ]
    },
    produk: {
      sharedMaterialFinishing: ["galvanis", "zincalume", "coating", "berlapis", "cat"],
      sharedMaterialDimensi: ["tebal", "panjang", "lebar", "diameter"]
    },
    material: {
      extendedTypes: [
        "silika", "zeolit", "cor", "tembaga", "aluminium", "foil",
        "kuningan", "perunggu", "titanium", "grafit", "karbon"
      ]
    },
    sewa: {
      extendedUnits: ["hp", "ps", "kva", "psi", "rpm", "inch", "inchi", "kw"],
      extendedTools: [
        "motor grader", "wheel loader", "tower crane", "asphalt finisher",
        "asphalt paver", "tandem roller", "pneumatic tire roller",
        "cold milling", "batching plant", "concrete pump",
        "genset", "pompa air", "pompa-beton", "compressor", "jack hammer"
      ]
    },
    desain: {
      extendedColors: [
        "earth tone", "sage green", "sage", "dusty pink", "dusty",
        "terracotta", "navy blue", "mustard", "olive", "mauve",
        "charcoal", "cream", "ivory", "beige", "taupe", "greige"
      ],
      extendedGaya: [
        "bali modern", "java etnik", "minimalis tropis", "kolonial modern",
        "industrial rustic", "scandinavian japandi", "modern klasik",
        "minimalis skandinavia", "japandi minimalis", "tropical modern",
        "classic modern", "modern farmhouse", "boho industrial",
        "javanese modern", "balinese contemporary", "traditional modern",
        "ethnic modern", "modern etnik", "tribal modern"
      ],
      subjektif: ["mewah", "eksklusif", "premium", "luxury", "high end", "artistik", "estetik"]
    }
  };

  var PRODUK_SPECS = {
    mutu: ["k225", "k250", "k300", "k350", "k400", "k500", "fc", "sni", "standar", "premium", "ekonomis"],
    finishing: ["polos", "motif", "bermotif", "bercorak", "tekstur", "serat", "halus", "kasar", "matte", "glossy", "doff", "gloss", "satin", "anyaman", "natural", "ekspos", "custom", "polosan", "cat", "coating", "lapisan", "vernis", "anti gores", "anti air", "anti jamur", "ulir"],
    dimensi: ["ukuran", "dimensi", "spesifikasi", "tipe", "model", "varian", "seri", "tinggi", "rendah", "panjang", "pendek", "lebar", "sempit", "tebal", "tipis", "dalam", "dangkal", "diameter", "radius", "besar", "kecil", "sedang", "mini", "jumbo"],
    warna: ["putih", "hitam", "abu-abu", "merah", "biru", "kuning", "hijau", "coklat", "netral", "warm", "cool", "pastel", "dark", "light", "krem", "maroon", "navy", "forest", "gold", "silver", "bronze", "copper", "rose gold", "teal", "turquoise", "lavender", "magenta", "coral", "salmon", "peach", "mint"],
    gaya: ["minimalis", "modern", "klasik", "skandinavia", "japandi", "industrial",
         "kontemporer", "tradisional", "rustic", "bohemian"]
  };

  var PURE_PRODUK_SPECS = PRODUK_SPECS.mutu
  .concat(PRODUK_SPECS.warna)
  .concat(PRODUK_SPECS.finishing)
  .concat(PRODUK_SPECS.gaya);

  var MATERIAL_SPECS = {
    grade: ["grade a", "grade b", "grade c", "sni", "standar", "kualitas 1", "kualitas 2", "kualitas 3", "kelas 1", "kelas 2", "kelas 3"],
    finishing: ["ulir", "polos", "galvanis", "berlapis", "cat", "coating", "anyaman", "anti karat", "anti korosi", "anti air", "diamon", "rough", "smooth", "textured", "zincalume"],
    dimensi: ["tebal", "panjang", "lebar", "diameter", "radius", "ukuran", "dimensi", "ketebalan", "kedalaman", "tinggi"],
    berat: ["kg", "ton", "m3", "liter", "gram", "ons"],
    tipe: MATERIAL_TYPE_WORDS
  };

  var PURE_MATERIAL_SPECS = MATERIAL_SPECS.grade
    .concat(MATERIAL_SPECS.finishing)
    .concat(MATERIAL_SPECS.tipe);

  var SEWA_SPECS = {
    tipe: ["mini", "besar", "kecil", "sedang", "medium", "heavy", "standar", "extra", "ekstra", "jumbo", "compact", "full size", "large"],
    merek: ["pc75", "pc200", "pc300", "pc350", "pc400", "komatsu", "hitachi", "caterpillar", "cat", "volvo", "hyundai", "doosan", "kobelco", "sumitomo", "case", "jcb", "liebherr", "kubota", "yanmar", "perkins", "cummin"],
    kapasitas: ["ton", "m3", "kg", "liter", "galon", "hp", "ps", "kva", "psi", "rpm", "kw", "inch", "inchi"],
    kondisi: ["baru", "bekas", "servis", "recondition", "rebuilt", "ready", "siap pakai", "prima", "baik", "layak", "standar",
              "listrik", "diesel", "bensin", "solar", "hydraulic", "manual"],
    durasi: ["harian", "mingguan", "bulanan", "tahunan", "per jam", "per hari", "per minggu", "per bulan", "short term", "long term"]
  };

  var PURE_SEWA_SPECS = SEWA_SPECS.merek
    .concat(SEWA_SPECS.tipe)
    .concat(SEWA_SPECS.kondisi)
    .concat(SEWA_SPECS.durasi)
    .concat(SEWA_SPECS.kapasitas)
    .concat(CROSS_ENTITY_SPECS.sewa.extendedTools)
    .concat(CROSS_ENTITY_SPECS.sewa.extendedUnits);

  var JASA_SPECS = {
    metode: ["manual", "hidrolik", "auger", "rotary", "percussive", "dry", "wet", "basah", "kering"],
    skala: ["rumahan", "komersial", "industri", "residential", "commercial", "industrial", "kecil", "sedang", "besar", "menengah"],
    finishing: ["polos", "motif", "bermotif", "bercorak", "tekstur", "serat", "halus", "kasar", "matte", "glossy", "doff", "gloss", "satin", "anyaman", "natural", "ekspos", "custom", "polosan", "cat", "coating", "lapisan", "vernis"],
    kedalaman: ["m", "meter", "cm", "centimeter", "feet", "ft"],
    foreign: CROSS_ENTITY_SPECS.jasa.foreignTechniques
  };

  var DESAIN_SPECS = {
    gaya: [
      "modern", "minimalis", "klasik", "tradisional", "kontemporer", "elegan", "luxury", "industrial", "scandinavian", "jepang", "rustic", "vintage", "bohemian", "art deco", "mid century", "victorian", "gothic", "renaissance", "baroque", "rococo", "neoklasik", "art nouveau", "bauhaus", "postmodern", "dekonstruksi", "high tech", "eklektik", "transisi", "tropis", "mediterania", "kolonial", "peranakan", "balinese", "javanese",
      "japandi", "coastal", "new york", "hampton", "farmhouse",
      "shabby chic", "parisian", "moroccan", "brutalist", "cottage core",
      "grand millennial", "tropical modern", "contemporary", "industrial chic",
      "minimalism", "classic", "modern classic", "streamline",
      "boho chic", "mid-century", "memphis", "cyberpunk", "steampunk",
      "neofuturism", "biophilic", "wabi sabi", "zen", "feng shui"
    ].concat(CROSS_ENTITY_SPECS.desain.extendedGaya),
    warna: [
      "putih", "hitam", "abu-abu", "merah", "biru", "kuning", "hijau", "coklat", "netral", "warm", "cool", "pastel", "dark", "light", "krem", "maroon", "navy", "forest", "gold", "silver", "bronze", "copper", "rose gold", "teal", "turquoise", "lavender", "magenta", "coral", "salmon", "peach", "mint"
    ].concat(CROSS_ENTITY_SPECS.desain.extendedColors),
    material: ["kayu", "besi", "kaca", "marmer", "granit", "keramik", "plafon", "gypsum", "pvc", "acp", "vinyl", "wpc", "grc", "hpl", "bambu", "rotan", "anyaman", "kain", "kulit", "karpet", "parket", "ubin", "batu alam", "batu bata", "beton ekspos"],
    konsep: ["open space", "split level", "loft", "studio", "apartment", "villa", "tiny house", "smart home", "eco home", "sustainable", "green building", "biophilic", "zen", "feng shui", "vastu", "wabi sabi"],
    furniture: ["minimalis", "skandinavia", "jepang", "klasik", "modern", "retro", "vintage", "industrial", "rustic", "bohemian", "mid century", "art deco", "contemporary"],
    subjektif: CROSS_ENTITY_SPECS.desain.subjektif
  };

  var PURE_DESAIN_SPECS = DESAIN_SPECS.gaya
    .concat(DESAIN_SPECS.warna)
    .concat(DESAIN_SPECS.material)
    .concat(DESAIN_SPECS.konsep)
    .concat(DESAIN_SPECS.furniture)
    .concat(DESAIN_SPECS.subjektif);

  var SUB_PILLAR_2_KEYWORDS = ['daftar', 'jenis', 'macam', 'kategori', 'tipe', 'list', 'katalog', 'variasi', 'model', 'gaya', 'varian'];
  var SUB_PILLAR_1_KEYWORDS = ['perbandingan', 'vs', 'versus', 'kelebihan', 'kekurangan', 'perbedaan', 'lebih baik', 'unggul', 'mana yang', 'antara', 'atau'];
  var SUB_PILLAR_1_STRONG = ['perbandingan', 'vs', 'versus', 'kelebihan', 'kekurangan', 'perbedaan', 'lebih baik', 'unggul', 'mana yang'];
  var SUB_PILLAR_1_WEAK = ['antara', 'atau'];

  var HIGH_VOLUME_WORDS = ["promo", "diskon", "obral", "cuci gudang", "flash sale",
                           "termurah", "termahal"];
    // 🔥 FIX R-7: SIZE_WORDS dihapus (tidak dipakai). Ukuran sudah ditangani via PURE_SCALES & SEWA_SPECS.tipe

  var INTENT_TRIGGERS = {
    transactional: ["beli", "order", "pesan", "booking", "sewa sekarang", "harga", "biaya", "tarif", "estimasi", "promo", "diskon", "bayar", "cicilan", "kredit", "dapatkan", "pesan sekarang", "resmi", "authorized", "ready stock", "siap pakai", "cara order", "cara pesan", "cara beli"],
    informational: ["cara", "tutorial", "panduan", "tips", "langkah", "bagaimana", "apa itu", "pengertian", "definisi", "contoh", "jenis", "perbedaan", "kelebihan", "kekurangan", "manfaat", "fungsi", "berapa", "apa yang", "mengapa", "kenapa", "kapan", "dimana", "siapa", "yang mana", "apakah", "update terbaru", "informasi terbaru", "kabar terbaru"],
    commercial: ["review", "testimoni", "rekomendasi", "terbaik", "paling", "vs", "versus", "perbandingan", "alternatif", "pilihan", "populer", "favorit", "unggulan", "ulasan", "pengalaman", "rating", "penilaian", "terburuk", "terpopuler", "terfavorit"],
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

  var COMMERCIAL_WORDS = [
    'jual', 'beli', 'order', 'pesan', 'booking',
    'supplier', 'distributor', 'toko', 'shop',
    'dapatkan', 'pesan sekarang', 'order sekarang',
    'beli sekarang', 'checkout',
    'cara order', 'cara pesan', 'cara beli', 'cara booking',
    'resmi', 'authorized', 'official', 'distributor resmi', 'dealer resmi',
    'agen resmi', 'mitra resmi', 'sertifikat resmi',
    'ready stock', 'ready stok', 'siap pakai', 'siap kirim',
    'stok tersedia', 'fast respon', 'same day', 'instan'
  ];

  var INFORMATIONAL_WORDS = [
    'butuh', 'cari', 'mau', 'ingin',
    'panduan', 'cara', 'tips', 'tutorial',
    'pengertian', 'definisi', 'penjelasan',
    'kenapa', 'mengapa', 'bagaimana',
    'berapa', 'apa itu', 'apa yang', 'kapan', 'dimana', 'siapa',
    'yang mana', 'apakah', 'adakah', 'apa beda', 'apa perbedaan',
    'update terbaru', 'informasi terbaru', 'kabar terbaru', 'update'
  ];

  var TIER_1_LOCATION = [
    "jakarta", "jakarta pusat", "jakarta barat", "jakarta selatan", "jakarta timur", "jakarta utara",
    "bogor", "depok", "tangerang", "bekasi", "bandung", "karawang", "purwakarta", "cikarang",
    "subang", "cirebon", "semarang", "solo", "surakarta", "pekalongan", "tegal", "magelang",
    "sukoharjo", "boyolali", "klaten", "jogja", "yogyakarta", "surabaya", "malang", "kediri",
    "gresik", "sidoarjo", "mojokerto", "pasuruan", "probolinggo", "jember", "banyuwangi", "madiun",
    "medan", "palembang", "pekanbaru", "padang", "lampung", "batam", "aceh", "jambi", "bengkulu",
    "pontianak", "balikpapan", "samarinda", "banjarmasin", "makassar", "manado", "palu", "kendari",
    "bali", "denpasar", "gianyar", "tabanan", "bangli", "karangasem", "klungkung", "buleleng",
    "mataram", "kupang"
  ];

  var FISIK_WORDS = [
    "pantai", "taman", "sungai", "gunung", "jalan", "pasar",
    "sekolah", "masjid", "gereja", "mall", "terminal", "stasiun",
    "bandara", "pelabuhan", "sawah", "hutan", "danau", "lembah",
    "bukit", "kali", "dermaga", "lapangan", "kantor", "pabrik",
    "gudang", "warung", "restoran", "cafe", "hotel", "villa",
    "klinik", "puskesmas", "apotek", "bank", "atm", "pos"
  ];

  var LOCATION_WORDS = TIER_1_LOCATION;

  var PRICE_HEAD_WORDS = [
    'harga', 'biaya', 'tarif', 'estimasi', 'ongkos', 'budget',
    'fee', 'rate', 'price', 'cost', 'pricelist', 'price-list'
  ];

  var PROMO_MODIFIER_WORDS = [
    'murah', 'hemat', 'terjangkau', 'promo', 'diskon', 'obral',
    'sale', 'termurah', 'termahal', 'bersaing', 'kompetitif',
    'dibawah pasaran', 'diatas pasaran', 'pasaran', 'ekonomis'
  ];

  var PRICE_WORDS = PRICE_HEAD_WORDS;

  var ACTION_VERBS = [
    "pemotongan", "pemotong", "memotong", "potong", "potongan",
    "penggalian", "penggali", "menggali", "gali", "galian",
    "pengurugan", "pengurug", "mengurug", "urug", "urugan",
    "pengangkutan", "pengangkut", "mengangkut", "angkut", "angkutan",
    "pengeboran", "pengebor", "mengebor", "bor", "boran",
    "pengelasan", "pengelas", "mengelas", "las", "lasan",
    "pengecoran", "pengecor", "mengecor", "cor", "coran",
    "pengecatan", "pengecat", "mengecat", "cat", "catan",
    "pengukuran", "pengukur", "mengukur", "ukur", "ukuran",
    "pemasangan", "pemasang", "memasang", "pasang", "pasangan",
    "pembongkaran", "pembongkar", "membongkar", "bongkar", "bongkaran",
    "pembuatan", "pembuat", "membuat", "buat", "buatan",
    "pengupasan", "pengupas", "mengupas", "upas", "upasan",
    "pemadatan", "pemadat", "memadatkan", "padat", "padatan",
    "pengerukan", "pengeruk", "mengeruk", "keruk", "kerukan",
    "pemancangan", "pemancang", "memancang", "pancang", "pancangan",
    "pembersihan", "pembersih", "membersihkan", "bersih", "bersihan",
    "perataan", "perata", "meratakan", "rata", "rataan",
    "pembentukan", "pembentuk", "membentuk", "bentuk", "bentukan",
    "persiapan", "persiap", "mempersiapkan", "siap", "siapan",
    "stabilisasi", "stabilis", "menstabilkan", "stabil",
    "cut", "fill", "grading", "elevasi", "pemetaan",
    "tebang", "menebang", "penebangan",
    "pindah", "pemindahan", "timbun", "penimbunan",
    "renovasi", "merenovasi",
    "perbaikan", "memperbaiki",
    "instalasi", "menginstal", "install",
    "service", "servis", "menyervis",
    "penggantian", "mengganti", "ganti",
    "pemeliharaan", "memelihara", "rawat", "perawatan",
    "pengadaan", "menyediakan"
  ];

  var SYNTAX_CONJUNCTIONS = ["dan", "serta", "juga", "dengan", "tanpa"];
  var SYNTAX_PREPOSITIONS = ["di", "ke", "dari", "untuk", "pada", "dalam", "atas", "bawah"];

  // ═══════════════════════════════════════════════════════════
  // FUNGSI DASAR
  // ═══════════════════════════════════════════════════════════

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
    if (text.length > 200) text = text.substring(0, 200);
    return text;
  }

  function getH1Text() {
    try {
      var h1 = document.querySelector('h1');
      if (!h1) return '';
      var text = h1.innerText || h1.textContent || '';
      text = text.replace(/\b(20[2-9][0-9])\b/g, '');
      text = cleanText(text);
      if (text.length > 250) text = text.substring(0, 250);
      return text;
    } catch (e) { return ''; }
  }

  function isHomePage() {
    var path = window.location.pathname.toLowerCase();
    return path === "/" || path === "/index.html" || path === "/home";
  }

  function checkPriceTable() {
    if (typeof document === 'undefined') return false;
    try {
      var tables = document.querySelectorAll('table');
      if (!tables || tables.length === 0) return false;
      for (var i = 0; i < tables.length; i++) {
        var table = tables[i];
        var isInFooterNav = false;
        try {
          isInFooterNav = !!(table.closest('footer, nav, aside, .footer, .nav, .sidebar, .widget, #footer, #nav, #sidebar'));
        } catch (e) {}
        if (isInFooterNav) continue;
        var rows = table.querySelectorAll('tbody tr');
        if (rows.length < 2) continue;
        var headers = table.querySelectorAll('th');
        var priceHeaderCount = 0;
        for (var j = 0; j < headers.length; j++) {
          var headerText = (headers[j].innerText || headers[j].textContent || '').toLowerCase();
          if (/harga|biaya|tarif|price|cost|rate/i.test(headerText)) priceHeaderCount++;
        }
        if (priceHeaderCount >= 1) {
          log('📊 TABEL HARGA', 'TABLE');
          return true;
        }
      }
    } catch (e) {}
    return false;
  }

  function checkFisikRole(text) {
    if (!text) return "none";
    var lower = text.toLowerCase();
    for (var i = 0; i < ACTION_VERBS.length; i++) {
      var verb = ACTION_VERBS[i];
      for (var j = 0; j < OBJECT_WORDS.length; j++) {
        var obj = OBJECT_WORDS[j];
        var pattern = new RegExp("\\b" + verb + "\\s+(\\w+\\s+)?" + obj + "\\b", "i");
        if (pattern.test(lower)) {
          log('🎭 OBJECT role: "' + obj + '"', 'OBJECT');
          return "object";
        }
      }
      for (var j = 0; j < FISIK_WORDS.length; j++) {
        var fisik = FISIK_WORDS[j];
        var pattern2 = new RegExp("\\b" + verb + "\\s+(\\w+\\s+)?" + fisik + "\\b", "i");
        if (pattern2.test(lower)) {
          log('🎭 OBJECT role: "' + fisik + '"', 'FISIKCTX');
          return "object";
        }
      }
    }
    var locMarkers = ["dekat", "sekitar", "di", "ke", "dari"];
    for (var i = 0; i < locMarkers.length; i++) {
      for (var j = 0; j < FISIK_WORDS.length; j++) {
        var fisik = FISIK_WORDS[j];
        var pattern = new RegExp("\\b" + locMarkers[i] + "\\s+" + fisik + "\\b", "i");
        if (pattern.test(lower)) {
          log('🎭 LOCATION role: "' + fisik + '"', 'FISIKCTX');
          return "location";
        }
      }
    }
    return "none";
  }

  function isBaseName(word, entityType) {
    if (!word) return false;
    var lower = word.toLowerCase();
    if (BASE_ENTITY_OBJECTS_SET[lower]) return true;
    if (entityType && ENTITY_BASE_NAMES[entityType]) {
      var baseNames = ENTITY_BASE_NAMES[entityType];
      for (var i = 0; i < baseNames.length; i++) {
        if (baseNames[i].indexOf(lower) !== -1) return true;
      }
    }
    return false;
  }

  function calculateComplexityScore(text, entityType) {
    if (!text) return 0;
    var lower = text.toLowerCase();
    var score = 0;
    var detail = [];

    var actionCount = 0;
    for (var i = 0; i < ACTION_VERBS.length; i++) {
      if (new RegExp("\\b" + ACTION_VERBS[i] + "\\b", "i").test(lower)) actionCount++;
    }
    if (actionCount > 0) {
      score += Math.min(actionCount, 2);
      detail.push('act=' + actionCount);
    }

    var objCount = 0;
    for (var i = 0; i < OBJECT_WORDS.length; i++) {
      var objWord = OBJECT_WORDS[i];
      if (new RegExp("\\b" + objWord.replace(/\s+/g, '\\s+') + "\\b", "i").test(lower)) {
        if (BASE_ENTITY_OBJECTS_SET[objWord]) {
          log('🧊 SKIP base object: ' + objWord, 'BASE');
          continue;
        }
        if (GENERIC_OBJECTS_SET[objWord]) {
          log('🧊 FIX 142: SKIP generic object: ' + objWord, 'BASE');
          continue;
        }
        if (!isBaseName(objWord, entityType)) objCount++;
      }
    }
    if (objCount > 0) {
      score += Math.min(objCount, 3);
      detail.push('obj=' + objCount);
    }

    if (hasTechnicalSpec(lower)) { score += 2; detail.push('techSpec'); }
    if (checkHasPerUnit(lower)) { score += 2; detail.push('perUnit'); }
    if (checkHasSpecPhrase(lower)) { score += 2; detail.push('specPhrase'); }
    if (/\d+\s*(m|cm|mm)/i.test(lower)) { score += 1; detail.push('dim'); }
    if (checkCompoundAction(lower)) { score += 1; detail.push('compound'); }

    log('🎚️ SCORE: ' + score + ' (' + detail.join(', ') + ')', 'SCORE');
    return score;
  }

  function expandVerbVariations(text) {
    if (!text) return text;
    var result = text.toLowerCase();
    var verbMap = {
      "potong": ["pemotongan", "memotong", "terpotong", "potongan"],
      "gali": ["penggalian", "menggali", "tergali", "galian"],
      "urug": ["pengurugan", "mengurug", "terurug", "urugan"],
      "angkat": ["pengangkatan", "mengangkat", "terangkat", "angkatan"],
      "bor": ["pengeboran", "mengebor", "terbor", "boran"],
      "las": ["pengelasan", "mengelas", "terlas", "lasan"],
      "cor": ["pengecoran", "mengecor", "tercor", "coran"],
      "cat": ["pengecatan", "mengecat", "tercat", "catan"],
      "ukur": ["pengukuran", "mengukur", "terukur", "ukuran"],
      "pasang": ["pemasangan", "memasang", "terpasang", "pasangan"],
      "bongkar": ["pembongkaran", "membongkar", "terbongkar", "bongkaran"],
      "buat": ["pembuatan", "membuat", "terbuat", "buatan"],
      "upas": ["pengupasan", "mengupas", "terupas", "upasan"],
      "padat": ["pemadatan", "memadatkan", "terpadat", "padatan"],
      "keruk": ["pengerukan", "mengeruk", "terkeruk", "kerukan"],
      "pancang": ["pemancangan", "memancang", "terpancang", "pancangan"],
      "renovasi": ["merenovasi", "terrenovasi", "renovasian"],
      "service": ["servis", "menyervis", "terservice"],
      "perbaikan": ["memperbaiki", "terperbaiki", "perbaikkan"]
    };
    for (var base in verbMap) {
      if (!verbMap.hasOwnProperty(base)) continue;
      var variations = verbMap[base];
      for (var i = 0; i < variations.length; i++) {
        var pattern = new RegExp("\\b" + variations[i] + "\\b", "gi");
        if (pattern.test(result)) result = result.replace(pattern, base);
      }
    }
    return result;
  }

  function normalizeVerbVariations(text) { return expandVerbVariations(text); }

  function checkCompoundAction(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    var conjPatterns = [/dan/, /serta/, /&/, /\+/];
    var actionCount = 0;
    for (var i = 0; i < ACTION_VERBS.length; i++) {
      if (new RegExp("\\b" + ACTION_VERBS[i] + "\\b", "i").test(lower)) actionCount++;
    }
    for (var i = 0; i < conjPatterns.length; i++) {
      if (conjPatterns[i].test(lower) && actionCount >= 2) {
        log('🔗 COMPOUND', 'COMPOUND');
        return true;
      }
    }
    return false;
  }

  function calculatePLDConfidence(text, entityType, level) {
    if (!text || !level) return 0;
    var confidence = 50;
    if (level === "pillar") confidence += 40;
    if (level === "sub-pillar-tipe-1" || level === "sub-pillar-tipe-2") confidence += 30;
    if (level === "variant" || level === "sub-variant") confidence += 25;
    if (level === "money-child") confidence += 25;
    if (level === "money-page") confidence += 15;
    if (level === "money-master") confidence += 10;
    if (checkHasSpecification(text, entityType)) confidence += 10;
    if (checkHasPrice(text)) confidence += 5;
    if (isLocation(text)) confidence += 10;
    if (checkHasSpecPhrase(text)) confidence += 10;
    var ambiguousCount = 0;
    var lower = text.toLowerCase();
    for (var i = 0; i < FISIK_WORDS.length; i++) {
      if (new RegExp("\\b" + FISIK_WORDS[i] + "\\b", "i").test(lower)) ambiguousCount++;
    }
    if (ambiguousCount > 0) confidence -= ambiguousCount * 5;
    if (confidence < 0) confidence = 0;
    if (confidence > 100) confidence = 100;
    return confidence;
  }

  function callAIProxy(text, entityType) {
    if (!CONFIG.AI_ENABLED || !CONFIG.AI_WORKER_URL) {
      return Promise.resolve(null);
    }

    var controller = new AbortController();
    var timeoutId = setTimeout(function() {
      controller.abort();
    }, CONFIG.AI_TIMEOUT_MS || 8000);

    return fetch(CONFIG.AI_WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: CONFIG.AI_PROVIDER || 'auto',
        text: text,
        entityType: entityType
      }),
      signal: controller.signal
    })
    .then(function(res) {
      clearTimeout(timeoutId);
      if (!res.ok) return null;
      return res.json();
    })
    .then(function(data) {
      if (!data || data.error) return null;
      return data;
    })
    .catch(function(e) {
      clearTimeout(timeoutId);
      log('AI proxy error: ' + e.message, 'WARN');
      return null;
    });
  }

  // ═══════════════════════════════════════════════════════════
  // FUNGSI DETEKSI — PART A
  // ═══════════════════════════════════════════════════════════

  function isLocation(text) {
    if (!text) return false;
    var lower = cleanText(text);
    for (var i = 0; i < TIER_1_LOCATION.length; i++) {
      var city = TIER_1_LOCATION[i];
      var cityRegex = new RegExp("\\b" + city.replace(/\s+/g, '\\s+') + "\\b", "i");
      if (cityRegex.test(lower)) { log('📍 ' + city, 'LOCATION'); return true; }
    }
    if (/\bterdekat\b/i.test(lower)) {
      var fisikSetelah = new RegExp("\\bterdekat\\s+(" + FISIK_WORDS.join("|") + ")\\b", "i");
      if (!fisikSetelah.test(lower)) return true;
    }
    if (/\b(sekitar|area|wilayah|daerah|kawasan)\s+saya\b/i.test(lower)) return true;
    if (/\bdi\s+(sekitar|area|wilayah|daerah|kawasan)\b/i.test(lower)) return true;
    for (var i = 0; i < TIER_1_LOCATION.length; i++) {
      var city = TIER_1_LOCATION[i];
      var cityNearRegex = new RegExp("\\b(dekat|sekitar|di|area|wilayah|daerah)\\s+" + city.replace(/\s+/g, '\\s+') + "\\b", "i");
      if (cityNearRegex.test(lower)) return true;
    }
    var fisikRole = checkFisikRole(lower);
    if (fisikRole === "location") return true;
    return false;
  }

  function checkHasPrice(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    for (var i = 0; i < PRICE_HEAD_WORDS.length; i++) {
      if (lower.indexOf(PRICE_HEAD_WORDS[i]) !== -1) return true;
    }
    return false;
  }

  function checkHasPromoModifier(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    for (var i = 0; i < PROMO_MODIFIER_WORDS.length; i++) {
      if (lower.indexOf(PROMO_MODIFIER_WORDS[i]) !== -1) return true;
    }
    return false;
  }

  function detectContentSignalsFromSlug(slug) {
    var lower = String(slug || "").toLowerCase().trim();

    var priceMatch = null;
    var pricePos = -1;
    for (var i = 0; i < PRICE_HEAD_WORDS.length; i++) {
      var idx = lower.indexOf(PRICE_HEAD_WORDS[i]);
      if (idx !== -1 && (pricePos === -1 || idx < pricePos)) {
        priceMatch = PRICE_HEAD_WORDS[i];
        pricePos = idx;
      }
    }

    var commercialMatch = null;
    var commercialPos = -1;
    for (var j = 0; j < COMMERCIAL_WORDS.length; j++) {
      var cidx = lower.indexOf(COMMERCIAL_WORDS[j]);
      if (cidx !== -1 && (commercialPos === -1 || cidx < commercialPos)) {
        commercialMatch = COMMERCIAL_WORDS[j];
        commercialPos = cidx;
      }
    }

    var promoMatch = null;
    for (var k = 0; k < PROMO_MODIFIER_WORDS.length; k++) {
      if (lower.indexOf(PROMO_MODIFIER_WORDS[k]) !== -1) {
        promoMatch = PROMO_MODIFIER_WORDS[k];
        break;
      }
    }

    var infoMatch = null;
    var infoWords = [
      'spesifikasi', 'panduan', 'cara', 'tips', 'trik',
      'faktor', 'penentu', 'berdasarkan', 'penyebab', 'dampak',
      'pengaruh', 'efek', 'metode', 'tahapan', 'proses',
      'pengertian', 'definisi', 'manfaat', 'kelebihan', 'kekurangan',
      'jenis', 'macam', 'perbandingan', 'review', 'analisis',
      'fungsi', 'contoh', 'standar', 'sni', 'sertifikasi',
      'perawatan', 'maintenance', 'troubleshooting', 'solusi',
      'mutu', 'kualitas', 'ukuran', 'dimensi', 'komponen'
    ];
    for (var m = 0; m < infoWords.length; m++) {
      if (lower.indexOf(infoWords[m]) !== -1) {
        infoMatch = infoWords[m];
        break;
      }
    }

    var specPhrases = [
      'berdasarkan', 'berdasar',
      'faktor penentu', 'faktor yang mempengaruhi', 'faktor utama',
      'penyebab', 'sebab', 'dampak', 'pengaruh', 'efek'
    ];
    var hasInfoSpecPhrase = false;
    for (var n = 0; n < specPhrases.length; n++) {
      if (lower.indexOf(specPhrases[n]) !== -1) {
        hasInfoSpecPhrase = true;
        break;
      }
    }

    return {
      hasPriceWord: !!priceMatch,
      priceWord: priceMatch,
      pricePosition: pricePos,
      isPriceAtStart: pricePos >= 0 && pricePos < 10,
      hasCommercialWord: !!commercialMatch,
      commercialWord: commercialMatch,
      commercialPosition: commercialPos,
      isCommercialAtStart: commercialPos >= 0 && commercialPos < 10,
      hasPromoModifier: !!promoMatch,
      promoModifier: promoMatch,
      hasInfoWord: !!infoMatch,
      infoWord: infoMatch,
      hasInfoSpecPhrase: hasInfoSpecPhrase,
      slugLength: lower.length
    };
  }

  function checkHasPerUnit(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    var perUnitRegex = new RegExp("\\bper\\s+(" + SATUAN_UNITS.join("|") + ")\\b", "i");
    if (perUnitRegex.test(lower)) { log('📏 PER-UNIT', 'PERSATUAN'); return true; }
    return false;
  }

  function checkHasQuestionWord(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    for (var i = 0; i < QUESTION_WORDS.length; i++) {
      if (lower.indexOf(QUESTION_WORDS[i]) !== -1) return true;
    }
    return false;
  }

  function checkHasCommercialInvestigation(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    for (var i = 0; i < COMMERCIAL_INVESTIGATION_WORDS.length; i++) {
      if (lower.indexOf(COMMERCIAL_INVESTIGATION_WORDS[i]) !== -1) return true;
    }
    return false;
  }

  function checkFreeContext(text) {
    if (!text) return { isInfo: false, isComm: false };
    var lower = text.toLowerCase();
    var isInfo = false, isComm = false;
    for (var i = 0; i < FREE_INFO_WORDS.length; i++) {
      if (lower.indexOf(FREE_INFO_WORDS[i]) !== -1) { isInfo = true; break; }
    }
    for (var i = 0; i < FREE_COMM_WORDS.length; i++) {
      if (lower.indexOf(FREE_COMM_WORDS[i]) !== -1) { isComm = true; break; }
    }
    return { isInfo: isInfo, isComm: isComm };
  }

  function checkHasAuthority(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    for (var i = 0; i < AUTHORITY_WORDS.length; i++) {
      if (lower.indexOf(AUTHORITY_WORDS[i]) !== -1) return true;
    }
    return false;
  }

  function checkHasReadyStock(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    for (var i = 0; i < READY_STOCK_WORDS.length; i++) {
      if (lower.indexOf(READY_STOCK_WORDS[i]) !== -1) return true;
    }
    return false;
  }

  function checkHasSpecPhrase(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    for (var i = 0; i < SPEC_PHRASE_WORDS.length; i++) {
      if (lower.indexOf(SPEC_PHRASE_WORDS[i]) !== -1) {
        log('📋 SPEC_PHRASE: ' + SPEC_PHRASE_WORDS[i], 'SPECPHRASE');
        return true;
      }
    }
    return false;
  }

  function checkHasInformationalSpecPhrase(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    for (var i = 0; i < SPEC_PHRASE_INFORMATIONAL.length; i++) {
      if (lower.indexOf(SPEC_PHRASE_INFORMATIONAL[i]) !== -1) {
        log('📋 INFO_SPEC_PHRASE: ' + SPEC_PHRASE_INFORMATIONAL[i], 'SPECPHRASE');
        return true;
      }
    }
    return false;
  }

  function checkHasMarketingTerm(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    for (var i = 0; i < MARKETING_TERMS.length; i++) {
      if (lower.indexOf(MARKETING_TERMS[i]) !== -1) return true;
    }
    return false;
  }

  function checkHasBaseService(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    // 🔥 FIX v14-P: regex extended
    var baseWords = [
      // Entity
      "jasa","layanan","sewa","rental","produk","material","bahan",
      // Prefix umum
      "kontraktor","tukang","borongan","mandor","vendor","supplier",
      // Aksi JASA
      "pasang","bangun","renovasi","perbaikan","perawatan",
      "instalasi","pemasangan","pembongkaran","pembersihan",
      "coring","cutting","drilling","grouting","sandblasting",
      "pengeboran","pemancangan","pengecoran","pengelasan",
      "bongkar","gali","urug","angkut","pemadatan",
      "pelapisan","coating","poles","grinding",
      "waterproofing","epoxy",
      // Struktur & elemen
      "pondasi","tiang","pancang","pagar","panel","railing","tangga",
      "gerbang","wastafel","closet","shower",
      // Material umum
      "beton","baja","besi","kayu","batu","keramik","granit","marmer",
      "semen","pasir","pipa","kaca","aluminium","bata","batako","hebel",
      "genteng","asbes","atap","plafon","gypsum","paving","readymix",
      "kanopi","precast","pracetak","galvalum",
      // Teknik & konsep
      "desain","interior","eksterior","arsitektur","konstruksi",
      // Bangunan
      "rumah","gedung","ruko","gudang","pabrik","jalan","jembatan",
      "masjid","gereja","sekolah","hotel","villa","apartemen",
      // Pile
      "mini","pile","bore","strauss"
    ];
    var baseRegex = new RegExp("\\b(" + baseWords.join("|") + ")\\b", "i");
    return baseRegex.test(lower);
  }

  function checkHasCommercial(text, entityType) {
    if (!text) return false;
    var lower = text.toLowerCase();
    if (entityType && ENTITY_ONLY_WORDS[entityType]) {
      var entityWords = ENTITY_ONLY_WORDS[entityType] || [];
      for (var i = 0; i < entityWords.length; i++) {
        lower = lower.replace(new RegExp("\\b" + entityWords[i] + "\\b", "gi"), " ");
      }
      var entityTriggers = ENTITY_TRIGGERS[entityType] || [];
      for (var i = 0; i < entityTriggers.length; i++) {
        if (COMMERCIAL_WORDS.indexOf(entityTriggers[i]) === -1) {
          lower = lower.replace(new RegExp("\\b" + entityTriggers[i] + "\\b", "gi"), " ");
        }
      }
    }
    for (var i = 0; i < COMMERCIAL_WORDS.length; i++) {
      if (lower.indexOf(COMMERCIAL_WORDS[i]) !== -1) {
        log('🛒 COMMERCIAL: ' + COMMERCIAL_WORDS[i], 'COMMERCIAL');
        return true;
      }
    }
    return false;
  }

  // 🔥 FIX v14-B: checkHasSpecification — tambah material & target untuk PRODUK
  function checkHasSpecification(text, entityType) {
    if (!text) return false;
    var lower = text.toLowerCase();
    var entityOnly = ENTITY_ONLY_WORDS[entityType] || [];

    if (checkHasPerUnit(text)) { log('🔬 SPEC: per unit', 'VARIANT'); return true; }

    if (entityType === "produk") {
      var mutuList = PRODUK_SPECS.mutu || [];
      for (var i = 0; i < mutuList.length; i++) {
        if (new RegExp("\\b" + mutuList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return mutuList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var finishingList = PRODUK_SPECS.finishing || [];
      for (var i = 0; i < finishingList.length; i++) {
        if (new RegExp("\\b" + finishingList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return finishingList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      if (/\d+\s*(m|mm|cm|meter|kg|ton|inch|inci|ft|feet)/gi.test(lower)) return true;
      if (/\d+\s*[x×]\s*\d+\s*(cm|m|meter|mm)/gi.test(lower)) return true;
      var warnaList = PRODUK_SPECS.warna || [];
      for (var i = 0; i < warnaList.length; i++) {
        if (new RegExp("\\b" + warnaList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return warnaList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var gayaList = PRODUK_SPECS.gaya || [];
      for (var i = 0; i < gayaList.length; i++) {
        if (new RegExp("\\b" + gayaList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return gayaList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var sharedMatFin = CROSS_ENTITY_SPECS.produk.sharedMaterialFinishing || [];
      for (var i = 0; i < sharedMatFin.length; i++) {
        if (new RegExp("\\b" + sharedMatFin[i] + "\\b", "i").test(lower)) {
          log('🎯 CROSS-SPEC: produk + ' + sharedMatFin[i], 'CROSSSPEC');
          return true;
        }
      }

      // 🔥 FIX v14-B: Material modifier untuk PRODUK (beton, besi, kayu, dll)
      var materialModifiers = ["beton", "besi", "kayu", "aluminium", "kaca", "stainless",
                               "baja", "pvc", "wpc", "grc", "hpl", "acp", "vinyl", "upvc",
                               "galvanis", "tembaga", "kuningan", "perunggu"];
      for (var i = 0; i < materialModifiers.length; i++) {
        if (new RegExp("\\b" + materialModifiers[i] + "\\b", "i").test(lower)) {
          log('🔥 FIX v14-B: produk + material=' + materialModifiers[i], 'CROSSSPEC');
          return true;
        }
      }

      // 🔥 FIX v14-B: Application target untuk PRODUK
      var textNoBaseB = lower;
      var baseListB = ENTITY_BASE_NAMES.produk || [];
      for (var biB = 0; biB < baseListB.length; biB++) {
        textNoBaseB = textNoBaseB.replace(
          new RegExp("\\b" + baseListB[biB].replace(/\s+/g, '\\s+') + "\\b", 'g'),
          ' '
        );
      }
      for (var atB = 0; atB < APPLICATION_TARGETS_FULL.length; atB++) {
        if (new RegExp("\\b" + APPLICATION_TARGETS_FULL[atB] + "\\b", "i").test(textNoBaseB)) {
          log('🔥 FIX v14-B: produk + target=' + APPLICATION_TARGETS_FULL[atB], 'CROSSSPEC');
          return true;
        }
      }

      if (/\d+\s*[x×]\s*\d+(?:\s*[x×]\s*\d+)?/i.test(lower)) {
        log('🔬 PRODUK dimension multi-layer', 'VARIANT');
        return true;
      }
    }

    if (entityType === "material") {
      var gradeList = MATERIAL_SPECS.grade || [];
      for (var i = 0; i < gradeList.length; i++) {
        if (new RegExp("\\b" + gradeList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return gradeList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var finishingList = MATERIAL_SPECS.finishing || [];
      for (var i = 0; i < finishingList.length; i++) {
        if (new RegExp("\\b" + finishingList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return finishingList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      if (/\d+\s*(mm|cm|m|meter|kg|ton|m3|liter)/gi.test(lower)) return true;
      var beratList = MATERIAL_SPECS.berat || [];
      for (var i = 0; i < beratList.length; i++) {
        if (new RegExp("\\b" + beratList[i] + "\\b", "i").test(lower)) return true;
      }
      var tipeList = MATERIAL_SPECS.tipe || [];
      for (var i = 0; i < tipeList.length; i++) {
        if (new RegExp("\\b" + tipeList[i].replace(/\s+/g, '\\s+') + "\\b", "i").test(lower)) {
          log('🧱 MATERIAL tipe: ' + tipeList[i], 'MATTYPE');
          return true;
        }
      }
      var extTypes = CROSS_ENTITY_SPECS.material.extendedTypes || [];
      for (var i = 0; i < extTypes.length; i++) {
        if (new RegExp("\\b" + extTypes[i] + "\\b", "i").test(lower)) {
          return true;
        }
      }
      if (/\d+\s*[x×]\s*\d+(?:\s*[x×]\s*\d+)?/i.test(lower)) {
        return true;
      }
    }

    if (entityType === "sewa") {
      var merekList = SEWA_SPECS.merek || [];
      for (var i = 0; i < merekList.length; i++) {
        if (new RegExp("\\b" + merekList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return merekList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var tipeList = SEWA_SPECS.tipe || [];
      for (var i = 0; i < tipeList.length; i++) {
        if (new RegExp("\\b" + tipeList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return tipeList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      if (/\d+\s*(ton|m3|kg|liter)/gi.test(lower)) return true;
      var kondisiList = SEWA_SPECS.kondisi || [];
      for (var i = 0; i < kondisiList.length; i++) {
        if (new RegExp("\\b" + kondisiList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return kondisiList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var durasiList = SEWA_SPECS.durasi || [];
      for (var i = 0; i < durasiList.length; i++) {
        if (new RegExp("\\b" + durasiList[i] + "\\b", "i").test(lower)) return true;
      }
      var extUnits = CROSS_ENTITY_SPECS.sewa.extendedUnits || [];
      for (var i = 0; i < extUnits.length; i++) {
        if (new RegExp("\\d+\\s*" + extUnits[i] + "\\b", "i").test(lower)) return true;
      }
      var extTools = CROSS_ENTITY_SPECS.sewa.extendedTools || [];
      for (var i = 0; i < extTools.length; i++) {
        if (new RegExp("\\b" + extTools[i].replace(/\s+/g, '\\s+') + "\\b", "i").test(lower)) return true;
      }
      var kapasitasList = SEWA_SPECS.kapasitas || [];
      for (var i = 0; i < kapasitasList.length; i++) {
        if (new RegExp("\\d+\\s*" + kapasitasList[i] + "\\b", "i").test(lower)) return true;
      }
    }

    if (entityType === "jasa") {
      var metodeList = JASA_SPECS.metode || [];
      for (var i = 0; i < metodeList.length; i++) {
        if (new RegExp("\\b" + metodeList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return metodeList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var skalaList = JASA_SPECS.skala || [];
      for (var i = 0; i < skalaList.length; i++) {
        if (new RegExp("\\b" + skalaList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return skalaList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var finishingList = JASA_SPECS.finishing || [];
      for (var i = 0; i < finishingList.length; i++) {
        if (new RegExp("\\b" + finishingList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return finishingList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      if (/\d+\s*(m|meter|cm|centimeter|feet|ft)/gi.test(lower)) {
        var hasEntityWord = JASA_WORDS.some(function(w) { return lower.indexOf(w) !== -1; });
        if (hasEntityWord) return true;
      }
      var foreignList = CROSS_ENTITY_SPECS.jasa.foreignTechniques || [];
      for (var i = 0; i < foreignList.length; i++) {
        if (new RegExp("\\b" + foreignList[i].replace(/\s+/g, '\\s+') + "\\b", "i").test(lower)) return true;
      }
      var sharedGaya = CROSS_ENTITY_SPECS.jasa.sharedGaya || [];
      for (var i = 0; i < sharedGaya.length; i++) {
        if (new RegExp("\\b" + sharedGaya[i] + "\\b", "i").test(lower)) return true;
      }
      if (/\d+\s*[x×]\s*\d+(?:\s*[x×]\s*\d+)?/i.test(lower)) {
        var hasJasaAction180 = ACTION_VERBS.some(function(w) {
          return lower.indexOf(w) !== -1;
        });
        if (hasJasaAction180) {
          log('🔬 FIX 180: JASA dimensi multi-layer tanpa unit', 'VARIANT');
          return true;
        }
      }
    }

    if (entityType === "desain") {
      var gayaList = DESAIN_SPECS.gaya || [];
      for (var i = 0; i < gayaList.length; i++) {
        if (new RegExp("\\b" + gayaList[i].replace(/\s+/g, '\\s+') + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return gayaList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var warnaList = DESAIN_SPECS.warna || [];
      for (var i = 0; i < warnaList.length; i++) {
        if (new RegExp("\\b" + warnaList[i].replace(/\s+/g, '\\s+') + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return warnaList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var konsepList = DESAIN_SPECS.konsep || [];
      for (var i = 0; i < konsepList.length; i++) {
        if (new RegExp("\\b" + konsepList[i].replace(/\s+/g, '\\s+') + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return konsepList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var materialList = DESAIN_SPECS.material || [];
      for (var i = 0; i < materialList.length; i++) {
        if (new RegExp("\\b" + materialList[i].replace(/\s+/g, '\\s+') + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return materialList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var furnitureList = DESAIN_SPECS.furniture || [];
      for (var i = 0; i < furnitureList.length; i++) {
        if (new RegExp("\\b" + furnitureList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return furnitureList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var subjektifList = DESAIN_SPECS.subjektif || [];
      for (var i = 0; i < subjektifList.length; i++) {
        if (new RegExp("\\b" + subjektifList[i] + "\\b", "i").test(lower)) return true;
      }
    }

    // 🔥 FIX 212: Application target = spec (universal)
    var textNoBase = lower;
    var baseList212 = ENTITY_BASE_NAMES[entityType] || [];
    for (var bi212 = 0; bi212 < baseList212.length; bi212++) {
      textNoBase = textNoBase.replace(
        new RegExp("\\b" + baseList212[bi212].replace(/\s+/g, '\\s+') + "\\b", 'g'),
        ' '
      );
    }
    for (var at212 = 0; at212 < APPLICATION_TARGETS_FULL.length; at212++) {
      if (new RegExp("\\b" + APPLICATION_TARGETS_FULL[at212] + "\\b", "i").test(textNoBase)) {
        log('🎯 FIX 212: application target = spec: ' + APPLICATION_TARGETS_FULL[at212], 'CROSSSPEC');
        return true;
      }
    }

    return false;
  }

  // ═══════════════════════════════════════════════════════════
  // ✅ PART 2/3 SELESAI
  // Part 3/3 berisi:
  //   - checkHasJasaMetode
  //   - getCategoryDefs
  //   - countModifierLayers (FIX v14-C/D)
  //   - flagAmbiguous, decideLevelByLayers, hasJasaMaterialCtx
  //   - checkPureTechnicalSpec, detectEntityTypeFromText, detectEntityType
  //   - detectSubPillar, detectPillar
  //   - hasTechnicalSpec, isSubVariant, getCoreWords
  //   - detectVariantByPattern, detectVariantLevel
  //   - getFactors, getSEOContext
  //   - detectConjunctionWarning, detectHierarchyWarning
  //   - computeBreadcrumbLevels, validateBreadcrumbHierarchy
  //   - validateParentDrivenHierarchy, isSpecModifierForEntity
  //   - detectMoneyLevelInternal (FIX v14-C/D)
  //   - detectPageLevel & turunannya
  //   - Schema/Attributes functions
  //   - TEST_CASES (FIX v14-E)
  //   - runTestSuite + self-audit (FIX v14-F)
  //   - INITIALIZATION
  // ═══════════════════════════════════════════════════════════

     // ═══════════════════════════════════════════════════════════
  // PART 3/3 — CORE ENGINE + TEST + INIT
  // ═══════════════════════════════════════════════════════════

  function checkHasJasaMetode(text) {
    if (!text) return null;
    var lower = text.toLowerCase();
    var metodeWords = PURE_METHODS.concat(PURE_SCALES);
    for (var i = 0; i < metodeWords.length; i++) {
      if (new RegExp("\\b" + metodeWords[i] + "\\b", "i").test(lower)) {
        return metodeWords[i];
      }
    }
    return null;
  }

    function getCategoryDefs(entityType) {
    switch (entityType) {
      case "jasa":
        return {
          // 🔥 FIX v14-O: skala dipisah dari metode
          skala: PURE_SCALES,
          metode: PURE_METHODS,
          material: [
            "beton","baja","besi","kayu","batu","tanah","aspal",
            "keramik","granit","marmer","kaca","aluminium",
            "pipa","semen","pasir","pvc","wpc","grc","hpl","acp",
            "vinyl","upvc","stainless","titanium","tembaga","kuningan",
            "perunggu","karbon","grafit","bambu","rotan"
          ],
          target: APPLICATION_TARGETS_FULL,
          finishing: PURE_FINISHING,
          // 🔥 FIX R-3: kategori hotmix
          tipe_aspal: ["hotmix", "coldmix", "aspal cair", "aspal buton"]
        };
      case "produk":
        return {
          mutu: PRODUK_SPECS.mutu,
          warna: PRODUK_SPECS.warna,
          finishing: PRODUK_SPECS.finishing,
          gaya: PRODUK_SPECS.gaya,
          // 🔥 FIX v14-O: kategori tipe baru
          tipe: ["geser","lipat","swing","sliding","casement","rolling door",
                 "folding gate","harmonika","ayun","kupu-kupu","revolving","otomatis","manual"],
          material: [
            "beton","besi","kayu","aluminium","kaca","stainless",
            "baja","pvc","wpc","grc","hpl","acp","vinyl","upvc",
            "tembaga","kuningan","perunggu"
          ],
          target: APPLICATION_TARGETS_FULL
        };
      case "material":
        return {
          grade: MATERIAL_SPECS.grade,
          tipe: MATERIAL_SPECS.tipe,
          finishing: MATERIAL_SPECS.finishing,
          // 🔥 FIX v14-O: warna untuk material
          warna: ["putih","hitam","abu-abu","merah","kuning","hijau","coklat","krem","natural"],
          target: APPLICATION_TARGETS_FULL
        };
      case "sewa":
        return {
          tipe: SEWA_SPECS.tipe,
          merek: SEWA_SPECS.merek,
          kondisi: SEWA_SPECS.kondisi,
          durasi: SEWA_SPECS.durasi,
          // 🔥 FIX v14-O: kapasitas masuk kategori
          kapasitas: SEWA_SPECS.kapasitas,
          target: APPLICATION_TARGETS_FULL
        };
     case "desain":
        var ROOM_CTX_218 = ["rumah", "kantor", "toko", "hotel", "restoran",
          "cafe", "villa", "apartemen", "ruko", "kios", "gudang", "klinik",
          "sekolah", "mall", "spa", "salon", "bar", "lounge", "butik",
          "showroom", "minimarket",
          "dapur", "kamar mandi", "kamar tidur", "ruang tamu",
          "ruang keluarga", "ruang makan", "ruang kerja",
          "teras", "balkon", "toilet", "wc"];
        var targetDesain218 = APPLICATION_TARGETS_FULL.filter(function(t) {
          return ROOM_CTX_218.indexOf(t) === -1;
        });
        return {
          gaya: DESAIN_SPECS.gaya,
          warna: DESAIN_SPECS.warna,
          material: DESAIN_SPECS.material,
          konsep: DESAIN_SPECS.konsep,
          furniture: DESAIN_SPECS.furniture,
          subjektif: DESAIN_SPECS.subjektif,
          // 🔥 FIX v14-O: kategori baru
          scope_ruangan: ROOM_CTX_218,
          luas: ["2 lantai","3 lantai","1 lantai","studio","loft","duplex","townhouse"],
          target: targetDesain218
        };
      default:
        return {};
    }
  }

  function countModifierLayers(text, entityType) {
    if (!text) return 0;
    var working = text.toLowerCase();

    var entityOnly = ENTITY_ONLY_WORDS[entityType] || [];
    for (var e = 0; e < entityOnly.length; e++) {
      working = working.replace(new RegExp("\\b" + entityOnly[e] + "\\b", 'g'), ' ');
    }

    var baseNames = ENTITY_BASE_NAMES[entityType] || [];
    for (var b = 0; b < baseNames.length; b++) {
      working = working.replace(
        new RegExp("\\b" + baseNames[b].replace(/\s+/g, '\\s+') + "\\b", 'g'),
        ' '
      );
    }

    if (entityType === "jasa") {
      for (var c = 0; c < COMMON_JASA_WORDS.length; c++) {
        working = working.replace(new RegExp("\\b" + COMMON_JASA_WORDS[c] + "\\b", 'g'), ' ');
      }
    }

    var UNIVERSAL_PREFIX_9 = ["jasa", "layanan", "tukang",
      "kontraktor", "toko", "supplier", "distributor", "jual", "beli",
      "rental", "sewa", "service", "servis"];
    for (var up9 = 0; up9 < UNIVERSAL_PREFIX_9.length; up9++) {
      working = working.replace(new RegExp("\\b" + UNIVERSAL_PREFIX_9[up9] + "\\b", 'g'), ' ');
    }

    for (var ph = 0; ph < PRICE_HEAD_WORDS.length; ph++) {
      working = working.replace(new RegExp("\\b" + PRICE_HEAD_WORDS[ph] + "\\b", 'g'), ' ');
    }
    working = working.replace(new RegExp("\\bper\\s+(" + SATUAN_UNITS.join("|") + ")\\b", 'g'), ' ');
    for (var su = 0; su < SATUAN_UNITS.length; su++) {
      working = working.replace(new RegExp("\\b" + SATUAN_UNITS[su] + "\\b", 'g'), ' ');
    }

    var PROMO_STRIP_216 = PROMO_MODIFIER_WORDS.concat(HIGH_VOLUME_WORDS);
    var seen216 = {};
    for (var ps216 = 0; ps216 < PROMO_STRIP_216.length; ps216++) {
      var pword216 = PROMO_STRIP_216[ps216];
      if (seen216[pword216]) continue;
      seen216[pword216] = true;
      working = working.replace(new RegExp("\\b" + pword216 + "\\b", 'g'), ' ');
    }
    working = working.replace(/\s+/g, ' ').trim();

    var count = 0;
    var seen = {};
    var seenWords = {};

    if (entityType === "desain") {
      var lantaiMatch = working.match(/\b\d+\s*lantai\b/gi) || [];
      count += lantaiMatch.length;
      for (var lm = 0; lm < lantaiMatch.length; lm++) {
        working = working.replace(lantaiMatch[lm], ' ');
      }
      var typeMatch = working.match(/\btype\s+\d+\b/gi) || [];
      count += typeMatch.length;
      for (var tm = 0; tm < typeMatch.length; tm++) {
        working = working.replace(typeMatch[tm], ' ');
      }
      if (/\bhook\b/i.test(working)) {
        count += 1;
        working = working.replace(/\bhook\b/gi, ' ');
      }
      working = working.replace(/\s+/g, ' ').trim();
    }

    var CATEGORY_PRIORITY = {
      "material": 5, "target": 4, "metode": 3, "mutu": 3,
      "grade": 3, "tipe": 3, "merek": 3, "kapasitas": 3,
      "gaya": 2, "warna": 2, "finishing": 2, "kondisi": 2,
      "durasi": 2, "konsep": 2, "furniture": 2, "subjektif": 1
    };

    var categories = getCategoryDefs(entityType);
    for (var cat in categories) {
      if (!categories.hasOwnProperty(cat)) continue;
      var words = categories[cat];
      for (var i = 0; i < words.length; i++) {
        var word = words[i];
        var rx = new RegExp("\\b" + word.replace(/\s+/g, '\\s+') + "\\b", "i");
        if (rx.test(working)) {
          if (seenWords[word]) continue;
          seenWords[word] = true;
          count++;
        }
      }
    }

    var dimUnit = working.match(
      /\d+\s*(?:x|×)\s*\d+\s*(?:cm|m|mm|meter|inch|inci)\b/gi
    ) || [];
    if (dimUnit.length > 0) {
      count += dimUnit.length;
      for (var k = 0; k < dimUnit.length; k++) {
        working = working.replace(dimUnit[k], ' ');
      }
    }

    var dimMulti = working.match(/\d+\s*(?:x|×)\s*\d+/gi) || [];
    if (dimMulti.length > 0) {
      count += dimMulti.length;
      for (var k2 = 0; k2 < dimMulti.length; k2++) {
        working = working.replace(dimMulti[k2], ' ');
      }
    }

    var dimSimple = working.match(
      /\d+\s*(?:cm|m|mm|meter|kg|ton|inch|inci|kva|psi|hp)\b/gi
    ) || [];
    count += dimSimple.length;
    for (var k3 = 0; k3 < dimSimple.length; k3++) {
      working = working.replace(dimSimple[k3], ' ');
    }

    var cleaned = working;
    for (var cat2 in categories) {
      if (!categories.hasOwnProperty(cat2)) continue;
      var words2 = categories[cat2];
      for (var j = 0; j < words2.length; j++) {
        cleaned = cleaned.replace(
          new RegExp("\\b" + words2[j].replace(/\s+/g, '\\s+') + "\\b", 'gi'),
          ' '
        );
      }
    }
    var stopwords197 = ["dan","atau","serta","yang","dari","ke","di","untuk",
                        "dengan","ini","itu","akan","pada","oleh","per"];
    for (var s = 0; s < stopwords197.length; s++) {
      cleaned = cleaned.replace(new RegExp("\\b" + stopwords197[s] + "\\b", 'g'), ' ');
    }

    if (entityType === "desain") {
      var ROOM_CTX_218b = ["rumah", "kantor", "toko", "hotel", "restoran",
        "cafe", "villa", "apartemen", "ruko", "kios", "gudang", "klinik",
        "sekolah", "mall", "spa", "salon", "bar", "lounge", "butik",
        "showroom", "minimarket",
        "dapur", "kamar mandi", "kamar tidur", "ruang tamu",
        "ruang keluarga", "ruang makan", "ruang kerja",
        "teras", "balkon", "toilet", "wc"];
      for (var rc218 = 0; rc218 < ROOM_CTX_218b.length; rc218++) {
        cleaned = cleaned.replace(new RegExp("\\b" + ROOM_CTX_218b[rc218] + "\\b", 'g'), ' ');
      }
    }
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    var unknownWords = cleaned.split(/\s+/).filter(function(w) {
      return w.length > 3;
    });
    if (unknownWords.length > 0) {
      count += unknownWords.length;
      log('🔥 FIX 197: unknown=[' + unknownWords.join(',') + '] +' +
          unknownWords.length, 'VARIANT');
    }

    log('🔥 FIX v14: layers=' + count + ' entity=' + entityType +
        ' working="' + working.trim() + '"', 'VARIANT');
    return count;
  }

  function flagAmbiguous(text, entityType, level, layers) {
    if (!CONFIG.DEBUG) return;
    var residues = countModifierLayers(text, entityType);
    if (residues > 0 && layers === 0) {
      log('⚠️ FIX 199: AMBIGUOUS — text="' + text +
          '" layers=' + layers + ' residues=' + residues, 'WARN');
    }
    var wordCount = text.split(/\s+/).filter(function(w) { return w.length > 2; }).length;
    if (wordCount >= 3 && level === "money-master") {
      log('⚠️ FIX 199: SUSPICIOUS MM — wordCount=' + wordCount +
          ' text="' + text + '"', 'WARN');
    }
  }

  function decideLevelByLayers(layers) {
    if (layers === 0) return "money-master";
    if (layers === 1) return "money-page";
    if (layers === 2) return "variant";
    return "sub-variant";
  }

  function hasJasaMaterialCtx(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    var narrow = ["beton","baja","besi","kayu","batu","tanah","aspal",
                  "keramik","granit","marmer","kaca","aluminium",
                  "pipa","semen","pasir"];
    for (var i = 0; i < narrow.length; i++) {
      if (new RegExp("\\b" + narrow[i] + "\\b", "i").test(lower)) return true;
    }
    return false;
  }

  function checkPureTechnicalSpec(text, entityType) {
    if (!text) return false;
    var lower = text.toLowerCase();
    var pureSpecs = [];
    if (entityType === "jasa") pureSpecs = PURE_JASA_TECHNIQUES
  .concat(PURE_METHODS)
  .concat(PURE_SCALES)
  .concat(PURE_FINISHING)
  .concat(CROSS_ENTITY_SPECS.jasa.foreignTechniques)
  .concat(CROSS_ENTITY_SPECS.jasa.sharedGaya);
    else if (entityType === "produk") pureSpecs = PURE_PRODUK_SPECS.concat(PURE_FINISHING, CROSS_ENTITY_SPECS.produk.sharedMaterialFinishing);
    else if (entityType === "material") pureSpecs = PURE_MATERIAL_SPECS.concat(PURE_FINISHING);
    else if (entityType === "sewa") pureSpecs = PURE_SEWA_SPECS;
    else if (entityType === "desain") pureSpecs = PURE_DESAIN_SPECS;
    for (var i = 0; i < pureSpecs.length; i++) {
      if (new RegExp("\\b" + pureSpecs[i].replace(/\s+/g, '\\s+') + "\\b", "i").test(lower)) return true;
    }
    if (/\d+\s*(m|mm|cm|meter|kg|ton|inch|inci|ft|feet)/gi.test(lower)) return true;
    if (/\d+\s*[x×]\s*\d+\s*(cm|m|meter|mm)/gi.test(lower)) return true;
    if (checkHasPerUnit(text)) return true;
    if (entityType === "jasa" || entityType === "produk" || entityType === "material") {
      if (/\d+\s*[x×]\s*\d+(?:\s*[x×]\s*\d+)?/i.test(lower)) {
        var materialCtx = /\b(keramik|granit|marmer|vinyl|parket|wallpaper|laminasi|homogeneous|keramik lantai|keramik dinding|granit tile|paving|bata|tile|ubin|wall|wall-panel|ceiling|partisi|pagar|panel)\b/i.test(lower);
        if (materialCtx) return true;
      }
    }
    return false;
  }

  function detectEntityTypeFromText(text) {
    if (!text) return null;
    var lower = text.toLowerCase();

    if (/\bjasa\s+(desain|interior|arsitektur|eksterior)\b/i.test(lower)) {
      log('🎯 FIX 134: "jasa desain" → entity=desain', 'DETECT');
      return "desain";
    }

    if (/^(cara|panduan|tips|tutorial|langkah|apa itu|pengertian|definisi|perbedaan|perbandingan|review)/i.test(lower.trim())) {
      log('🎯 FIX 132: Artikel priority (how-to prefix)', 'DETECT');
      return "artikel";
    }

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

    for (var m = 0; m < MATERIAL_WORDS.length; m++) {
      if (new RegExp("\\b" + MATERIAL_WORDS[m] + "\\b", "i").test(lower)) {
        log('🎯 FIX 202: entity=material via word: ' + MATERIAL_WORDS[m], 'DETECT');
        return "material";
      }
    }
    for (var s = 0; s < SEWA_WORDS.length; s++) {
      if (new RegExp("\\b" + SEWA_WORDS[s] + "\\b", "i").test(lower)) {
        log('🎯 FIX 202: entity=sewa via word: ' + SEWA_WORDS[s], 'DETECT');
        return "sewa";
      }
    }
    for (var p = 0; p < PRODUK_WORDS.length; p++) {
      if (new RegExp("\\b" + PRODUK_WORDS[p] + "\\b", "i").test(lower)) {
        log('🎯 FIX 202: entity=produk via word: ' + PRODUK_WORDS[p], 'DETECT');
        return "produk";
      }
    }
    for (var d = 0; d < DESAIN_WORDS.length; d++) {
      if (new RegExp("\\b" + DESAIN_WORDS[d] + "\\b", "i").test(lower)) {
        log('🎯 FIX 202: entity=desain via word: ' + DESAIN_WORDS[d], 'DETECT');
        return "desain";
      }
    }

    var hasJasaVerbSignal = /\b(jasa|pasang|borongan|tukang|bongkar|gali|urug|cor|bor|coring|renovasi|perbaikan|instalasi|service|servis|bangun|las|grouting|cutting|drilling|sandblasting|pancang|pemancangan|pengecoran|pengeboran)\b/i.test(lower);
    var hasProdukTxSignal = /\b(harga|jual|beli|supplier|distributor|ready|stok|stock|unit|batang|lembar|keping)\b/i.test(lower);

    if (hasJasaVerbSignal && !hasProdukTxSignal) {
      var jasaNamesRL = ENTITY_BASE_NAMES.jasa || [];
      for (var jnRL = 0; jnRL < jasaNamesRL.length; jnRL++) {
        if (lower.indexOf(jasaNamesRL[jnRL]) !== -1) {
          log('🎯 FIX SEO v6: priority resolver → jasa (verb signal via "' +
              jasaNamesRL[jnRL] + '")', 'DETECT');
          return "jasa";
        }
      }
    }

    var bestMatchRL = { entity: null, length: 0, name: null, priority: 99 };
    for (var epRL = 0; epRL < ENTITY_PRIORITY.length; epRL++) {
      var entRL = ENTITY_PRIORITY[epRL];
      if (!ENTITY_BASE_NAMES[entRL]) continue;
      var namesRL = ENTITY_BASE_NAMES[entRL];
      for (var nRL = 0; nRL < namesRL.length; nRL++) {
        var nameRL = namesRL[nRL];
        if (lower.indexOf(nameRL) === -1) continue;
        var isBetterRL = false;
        if (nameRL.length > bestMatchRL.length) {
          isBetterRL = true;
        } else if (nameRL.length === bestMatchRL.length && epRL < bestMatchRL.priority) {
          isBetterRL = true;
        }
        if (isBetterRL) {
          bestMatchRL = {
            entity: entRL,
            length: nameRL.length,
            name: nameRL,
            priority: epRL
          };
        }
      }
    }

    if (bestMatchRL.entity) {
      // 🔥 FIX R-8: tie-breaker untuk base name yang ada di >1 entity
      var AMBIGUOUS_PAIRS = ["mini pile", "spun pile", "sheet pile", "tiang pancang", "pancang"];
      var matchName = bestMatchRL.name;
      if (AMBIGUOUS_PAIRS.indexOf(matchName) !== -1) {
        // Cek sinyal transaksi produk
        var hasProdukCtx = /\b(harga|jual|beli|supplier|distributor|ready|stok|stock|unit|batang|lembar|keping|ukuran|dimensi|spesifikasi|mutu)\b/i.test(lower);
        // Cek sinyal jasa
        var hasJasaCtx = /\b(jasa|pasang|borongan|tukang|pemancangan|pancang|bor|pile)\b/i.test(lower);
        if (hasProdukCtx && !hasJasaCtx) {
          log('🎯 FIX R-8: ambiguous "' + matchName + '" → produk (context: tx)', 'DETECT');
          return "produk";
        }
        if (hasJasaCtx && !hasProdukCtx) {
          log('🎯 FIX R-8: ambiguous "' + matchName + '" → jasa (context: verb)', 'DETECT');
          return "jasa";
        }
      }
      log('🎯 FIX SEO v6: longest match → ' + bestMatchRL.entity +
          ' (via "' + bestMatchRL.name + '", ' + bestMatchRL.length + ' char)',
          'DETECT');
      return bestMatchRL.entity;
    }

    return null;
  }

  function detectEntityType(userEntityType) {
    if (userEntityType && VALID_ENTITY_TYPES.indexOf(userEntityType) !== -1) return userEntityType;
    return detectEntityTypeFromText(getPageText() + " " + getH1Text());
  }

  function detectSubPillar(text) {
    var lower = text.toLowerCase();

    for (var i = 0; i < SUB_PILLAR_2_KEYWORDS.length; i++) {
      if (lower.indexOf(SUB_PILLAR_2_KEYWORDS[i]) !== -1) return "sub-pillar-tipe-2";
    }

    for (var i = 0; i < SUB_PILLAR_1_STRONG.length; i++) {
      if (lower.indexOf(SUB_PILLAR_1_STRONG[i]) !== -1) return "sub-pillar-tipe-1";
    }

    for (var i = 0; i < SUB_PILLAR_1_WEAK.length; i++) {
      var weakWord = SUB_PILLAR_1_WEAK[i];
      if (lower.indexOf(weakWord) !== -1) {
        var parts = lower.split(new RegExp("\\b" + weakWord + "\\b"));
        if (parts.length >= 2) {
          var left = parts[0].trim();
          var right = parts[1].trim();
          if (left.split(/\s+/).length >= 2 && right.split(/\s+/).length >= 2) {
            log('📋 FIX 147: SP1 weak context OK: "' + weakWord + '"', 'SPECPHRASE');
            return "sub-pillar-tipe-1";
          } else {
            log('📋 FIX 147: SP1 weak context DITOLAK (sisi < 2 kata)', 'SPECPHRASE');
          }
        }
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
          var isEntityMatch = entity === entityType || (entity === "produk interior" && entityType === "produk");
          if (isEntityMatch) { log('🏛️ PILLAR', 'PILLAR'); return true; }
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

  function isSubVariant(text, entityType) {
    if (!text) return false;
    var score = 0;
    var lower = text.toLowerCase();

    var fisikRegex;
    if (entityType === "sewa") {
      fisikRegex = /\d+\s*(m|mm|cm|meter|ton|m3)\b/gi;
    } else {
      fisikRegex = /\d+\s*(m|mm|cm|meter|kg|ton|inch|inci)\b/gi;
    }
    if ((lower.match(fisikRegex) || []).length >= 1) score += 2;

    if ((lower.match(/\d+(?:\.\d+)?\s*(?:cm|mm|m|meter)\s*(?:x|×)\s*\d+(?:\.\d+)?\s*(?:cm|mm|m|meter)/gi) || []).length >= 1) score += 3;
    if (/\d+\s*[x×]\s*\d+\s*[x×]\s*\d+/gi.test(lower)) score += 3;

    var uniqueNumbers = (text.match(/\d+/g) || []).filter(function(v, i, a) { return a.indexOf(v) === i; });
    if (uniqueNumbers.length >= 2) score += 1;
    if (/\bukuran\s+\d+/.test(lower)) score += 2;
    if (/\bdimensi\s+\d+/.test(lower)) score += 2;
    if (/\b(tebal|panjang|lebar|tinggi|dalam|diameter)\s+\d+/.test(lower)) score += 2;
    return score >= 2;
  }

  function getCoreWords(text, entityType) {
    if (!text) return [];
    var coreText = text.toLowerCase();
    coreText = normalizeVerbVariations(coreText);

    var moneyWords = ['harga', 'biaya', 'tarif', 'estimasi', 'ongkos',
                      'bersaing', 'kompetitif', 'pasaran', 'murah', 'hemat', 'terjangkau'];
    for (var i = 0; i < moneyWords.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + moneyWords[i] + "\\b", 'g'), '');
    }

    var entityOnlyWords = ENTITY_ONLY_WORDS[entityType] || [];
    for (var i = 0; i < entityOnlyWords.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + entityOnlyWords[i] + "\\b", 'g'), ' ');
    }

    var hasConjunction = /\b(atau|dan|serta)\b/i.test(coreText);
    if (entityType && ENTITY_BASE_NAMES[entityType] && !hasConjunction) {
      var baseNamesEarly = ENTITY_BASE_NAMES[entityType] || [];

      var baseNamesSet = {};
      for (var k = 0; k < baseNamesEarly.length; k++) {
        baseNamesSet[baseNamesEarly[k]] = true;
      }

      for (var i = 0; i < baseNamesEarly.length; i++) {
        var bn = baseNamesEarly[i];
        var bnWords = bn.split(' ');
        var lastWord = bnWords[bnWords.length - 1];

        if (bnWords.length >= 2 && APPLICATION_TARGETS.indexOf(lastWord) !== -1) {
          var baseWithoutTarget = bnWords.slice(0, -1).join(' ');
          if (baseNamesSet[baseWithoutTarget]) {
            log('🔥 FIX 170: SKIP "' + bn + '" (sub-base "' + baseWithoutTarget + '" covers it)', 'CORE');
            continue;
          }
        }

        coreText = coreText.replace(new RegExp("\\b" + bn.replace(/\s+/g, '\\s+') + "\\b", 'g'), ' ');
      }
    }

    if (entityType === "jasa") {
      for (var i = 0; i < COMMON_JASA_WORDS.length; i++) {
        coreText = coreText.replace(new RegExp("\\b" + COMMON_JASA_WORDS[i] + "\\b", 'g'), ' ');
      }
    }
    var stopwords = ["dan", "atau", "serta", "yang", "dari", "ke", "di", "untuk", "dengan", "ini", "itu", "akan", "telah", "sudah", "masih", "pada", "oleh", "karena", "sehingga", "setelah", "sebelum"];
    for (var i = 0; i < stopwords.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + stopwords[i] + "\\b", 'g'), ' ');
    }
    for (var i = 0; i < TIER_1_LOCATION.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + TIER_1_LOCATION[i] + "\\b", 'g'), ' ');
    }
    var subPillarWords = ['daftar', 'jenis', 'macam', 'kategori', 'tipe', 'list', 'katalog', 'rekomendasi', 'pilihan', 'variasi', 'model', 'gaya', 'varian', 'perbandingan', 'vs', 'versus', 'kelebihan', 'kekurangan', 'perbedaan', 'lebih baik', 'unggul', 'terbaik'];
    for (var i = 0; i < subPillarWords.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + subPillarWords[i] + "\\b", 'g'), ' ');
    }
    for (var i = 0; i < INFORMATIONAL_WORDS.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + INFORMATIONAL_WORDS[i] + "\\b", 'g'), ' ');
    }
    for (var i = 0; i < COMMERCIAL_WORDS.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + COMMERCIAL_WORDS[i] + "\\b", 'g'), ' ');
    }
    for (var i = 0; i < QUESTION_WORDS.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + QUESTION_WORDS[i] + "\\b", 'g'), ' ');
    }
    for (var i = 0; i < COMMERCIAL_INVESTIGATION_WORDS.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + COMMERCIAL_INVESTIGATION_WORDS[i] + "\\b", 'g'), ' ');
    }
    for (var i = 0; i < SPEC_PHRASE_WORDS.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + SPEC_PHRASE_WORDS[i].replace(/\s+/g, '\\s+') + "\\b", 'g'), ' ');
    }

    var fisikRole = checkFisikRole(coreText);
    if (fisikRole !== "object") {
      for (var i = 0; i < FISIK_WORDS.length; i++) {
        coreText = coreText.replace(new RegExp("\\b" + FISIK_WORDS[i] + "\\b", 'g'), ' ');
      }
    }
    coreText = coreText.replace(/\b(dekat|sekitar|berdekatan|terdekat|near|around|disekitar|didekat)\b/g, ' ');
    coreText = coreText.replace(new RegExp("\\bper\\s+(" + SATUAN_UNITS.join("|") + ")\\b", 'g'), ' ');
    var coreWords = coreText.split(/\s+/).filter(function(w) { return w.length > 2; });
    var uniqueWords = [];
    var seen = {};
    for (var i = 0; i < coreWords.length; i++) {
      var w = coreWords[i];
      if (!seen[w]) { seen[w] = true; uniqueWords.push(w); }
    }
    return uniqueWords;
  }

  function detectVariantByPattern(text, entityType) {
    if (!text) return { isVariant: false, score: 0, reasons: [] };
    var score = 0;
    var reasons = [];
    var specResult = checkHasSpecification(text, entityType);
    if (specResult) {
      var isPureTech = checkPureTechnicalSpec(text, entityType);
      if (isPureTech) {
        score += 5;
        reasons.push("Pure tech spec");
        if (isSubVariant(text, entityType)) return { isVariant: true, score: score + 3, reasons: reasons };
        return { isVariant: true, score: score, reasons: reasons };
      }
    }
    return { isVariant: score >= 3, score: score, reasons: reasons };
  }

  function detectVariantLevel(text, entityType) {
    if (isSubVariant(text, entityType)) return "sub-variant";
    if (hasTechnicalSpec(text)) return "variant";
    var result = detectVariantByPattern(text, entityType);
    if (result.isVariant) return "variant";
    return null;
  }

  function getFactors(text, entityType) {
    return {
      hasLocation: isLocation(text),
      hasSpec: checkHasSpecification(text, entityType),
      hasPrice: checkHasPrice(text),
      hasCommercial: checkHasCommercial(text, entityType),
      hasSpecPhrase: checkHasSpecPhrase(text),
      hasInfoSpecPhrase: checkHasInformationalSpecPhrase(text),
      hasPerUnit: checkHasPerUnit(text),
      fisikRole: checkFisikRole(text),
      hasCompoundAction: checkCompoundAction(text),
      complexityScore: calculateComplexityScore(text, entityType),
      hasBaseService: checkHasBaseService(text)
    };
  }

  function getSEOContext(text, entityType) {
    if (!text) {
      return {
        hasQuestion: false, hasCommercialInvestigation: false,
        hasPerUnit: false, hasAuthority: false, hasReadyStock: false,
        hasSpecPhrase: false, hasCompoundAction: false,
        fisikRole: "none", complexityScore: 0,
        freeContext: { isInfo: false, isComm: false },
        intent: 'informational',
        intentDetail: { dominant: 'informational', confidence: 'low' }
      };
    }
    var hasQuestion = checkHasQuestionWord(text);
    var hasCommInvest = checkHasCommercialInvestigation(text);
    var hasPerUnit = checkHasPerUnit(text);
    var hasAuthority = checkHasAuthority(text);
    var hasReadyStock = checkHasReadyStock(text);
    var hasSpecPhrase = checkHasSpecPhrase(text);
    var hasCompound = checkCompoundAction(text);
    var fisikRole = checkFisikRole(text);
    var complexityScore = calculateComplexityScore(text, entityType);
    var freeContext = checkFreeContext(text);
    var intent = 'informational';
    var intentDetail = detectIntent(text);
    if (intentDetail.dominant === 'transactional') intent = 'transactional';
    else if (intentDetail.dominant === 'commercial' || hasCommInvest) intent = 'commercial-investigation';
    else if (hasQuestion && !hasReadyStock && !hasAuthority) intent = 'informational';
    else if (intentDetail.dominant === 'informational') intent = 'informational';
    return {
      hasQuestion: hasQuestion, hasCommercialInvestigation: hasCommInvest,
      hasPerUnit: hasPerUnit, hasAuthority: hasAuthority, hasReadyStock: hasReadyStock,
      hasSpecPhrase: hasSpecPhrase, hasCompoundAction: hasCompound,
      fisikRole: fisikRole, complexityScore: complexityScore,
      freeContext: freeContext, intent: intent, intentDetail: intentDetail
    };
  }

  function detectConjunctionWarning(slug, level) {
    if (!slug || !level) return [];
    var lower = slug.toLowerCase();
    var warnings = [];

    if (/\bcut and fill\b/i.test(lower)) return warnings;

    var hasAtau = /\batau\b/.test(lower);
    var hasDan = /\b(dan|serta)\b/.test(lower);

    if (hasAtau && level !== "sub-pillar-tipe-1" && level !== "sub-pillar-tipe-2") {
      var parts184 = lower.split(/\batau\b/);
      var leftW184 = (parts184[0] || "").trim().split(/\s+/).filter(Boolean);
      var rightW184 = (parts184[1] || "").trim().split(/\s+/).filter(Boolean);
      if (leftW184.length >= 2 && rightW184.length >= 2) {
        warnings.push({
          type: "SEO_MISALIGNMENT_ATAU",
          severity: "warning",
          message: "URL mengandung 'atau' dengan 2 sisi substantif tapi level '" +
                   level + "'. SEO-aligned: 'atau' untuk SP1 (perbandingan) atau SP2 (list).",
          suggestion: "Ganti ke 'dan' untuk MP (bundling), atau expand jadi 'A vs B' untuk SP1."
        });
      } else {
        log('🎯 FIX 184: SKIP "atau" warning (sisi < 2 kata = pilihan biasa)', 'SEO');
      }
    }

    if (hasDan && level !== "money-page") {
      warnings.push({
        type: "SEO_MISALIGNMENT_DAN",
        severity: "warning",
        message: "URL mengandung 'dan'/'serta' tapi level '" + level + "'. SEO-aligned: 'dan'/'serta' untuk MP (bundling 2 layanan).",
        suggestion: "Pecah jadi 2 halaman, atau ganti konjungsi."
      });
    }

    return warnings;
  }

  function detectHierarchyWarning(slug, entityType) {
    var warnings = [];
    if (!slug) return warnings;

    var words = slug.split(" ").filter(function(w) { return w.length > 0; });

    if (words.length <= 2) return warnings;

    if (/\b(atau|dan|serta)\b/i.test(slug)) return warnings;

    var parentSlug = words.slice(0, -1).join(" ");
    var currentLevel = detectPageLevelForPrompt(slug, entityType);
    var parentLevel = detectPageLevelForPrompt(parentSlug, entityType);

    var currentNum = LEVEL_HIERARCHY_MAP[currentLevel] || -1;
    var parentNum = LEVEL_HIERARCHY_MAP[parentLevel] || -1;

    if (parentNum < 3) return warnings;

    if (parentLevel === "pillar") return warnings;

    if (currentLevel === "money-child") return warnings;

    if (currentNum <= parentNum) {
      var expectedNum = parentNum + 1;
      var expectedLevel = LEVEL_INVERSE_MAP[expectedNum];

      warnings.push({
        type: "SEO_HIERARCHY_MISMATCH",
        severity: "warning",
        parentSlug: parentSlug,
        parentLevel: parentLevel,
        currentLevel: currentLevel,
        expectedLevel: expectedLevel,
        message: "URL '" + slug + "' terdeteksi '" + currentLevel +
                 "', tapi parent '" + parentSlug + "' = '" + parentLevel +
                 "'. Child seharusnya lebih spesifik (mis: " + expectedLevel + ").",
        suggestion: "Pisah jadi halaman terpisah (topik unik), atau " +
                    "tambahkan modifier spesifik (ukuran/tipe/spesifikasi) " +
                    "untuk naikkan ke " + expectedLevel + "."
      });
    }

    return warnings;
  }

  function computeBreadcrumbLevels(slug, entityType, domain) {
    if (!slug) return [];
    var words = slug.split(" ").filter(Boolean);
    var entity = entityType || detectEntityTypeFromText(slug);
    var results = [];

    for (var i = 2; i <= words.length; i++) {
      var segSlug = words.slice(0, i).join(" ");
      var segLevel = detectPageLevelForPrompt(segSlug, entity);
      var segLevelNum = LEVEL_HIERARCHY_MAP[segLevel] || -1;
      results.push({
        position: i,
        slug: segSlug,
        level: segLevel,
        levelNum: segLevelNum,
        isCurrent: (i === words.length)
      });
    }

    return results;
  }

  function validateBreadcrumbHierarchy(slug, entityType) {
    var warnings = [];
    if (!slug) return warnings;

    var chain = computeBreadcrumbLevels(slug, entityType);
    if (chain.length < 2) return warnings;

    if (/\b(atau|dan|serta)\b/i.test(slug)) return warnings;

    if (chain.length < 2) return warnings;

    var current = chain[chain.length - 1];
    var parent = null;
    for (var i = chain.length - 2; i >= 0; i--) {
      if (chain[i].levelNum >= 4) {
        parent = chain[i];
        break;
      }
    }

    if (!parent) return warnings;

    if (current.level === "money-child") return warnings;

    if (current.levelNum >= 7) return warnings;

    if (current.levelNum <= parent.levelNum) {
      var expectedNum = parent.levelNum + 1;
      var expectedLevel = LEVEL_INVERSE_MAP[expectedNum] || "money-page";

      warnings.push({
        type: "SEO_HIERARCHY_MISMATCH",
        severity: "warning",
        parentSlug: parent.slug,
        parentLevel: parent.level,
        currentSlug: current.slug,
        currentLevel: current.level,
        expectedLevel: expectedLevel,
        message: "URL '" + current.slug + "' terdeteksi '" + current.level +
                 "', tapi parent '" + parent.slug + "' juga '" + parent.level +
                 "'. Child seharusnya 1+ level lebih spesifik (" + expectedLevel + ").",
        suggestion: "Tambahkan modifier spesifik (material, tipe, ukuran) untuk naikkan ke '" +
                    expectedLevel + "', atau pisah jadi halaman topik berbeda."
      });
    }

    return warnings;
  }

  function validateParentDrivenHierarchy(slug, entityType) {
    var warnings = [];
    if (!slug) return warnings;

    var words = slug.split(" ").filter(Boolean);
    if (words.length <= 2) return warnings;

    if (/\b(atau|dan|serta)\b/i.test(slug)) return warnings;

    var parentSlug = words.slice(0, -1).join(" ");
    var parentLevel = detectPageLevelForPrompt(parentSlug, entityType);

    if (parentLevel === "pillar") return warnings;
    if (!EXPECTED_CHILD_MAP[parentLevel]) return warnings;

    var rule = EXPECTED_CHILD_MAP[parentLevel];
    if (rule.isLeaf) return warnings;

    var currentLevel = detectPageLevelForPrompt(slug, entityType);

    if (currentLevel === "money-child") {
      if (parentLevel === "money-page" || parentLevel === "money-master") {
        return warnings;
      }
    }

    if (currentLevel === "variant" && parentLevel === "money-child") {
      warnings.push({
        type: "SEO_HIERARCHY_MISMATCH",
        severity: "warning",
        parentSlug: parentSlug,
        parentLevel: parentLevel,
        currentLevel: currentLevel,
        expectedLevel: "money-page",
        message: "URL '" + slug + "' = Variant, tapi parent '" + parentSlug +
                 "' = MC (money-child). Variant harus dari MP, bukan MC.",
        suggestion: "Pindah lokasi ke akhir URL (attribute), atau buat MP tanpa lokasi dulu."
      });
      return warnings;
    }

    var isExpected = (currentLevel === rule.expected);
    var isAlternate = false;
    if (rule.alternates && rule.alternates.indexOf(currentLevel) !== -1) isAlternate = true;
    if (rule.alternate && currentLevel === rule.alternate) isAlternate = true;

    if (!isExpected && !isAlternate) {
      var expectedList = [rule.expected];
      if (rule.alternates) expectedList = expectedList.concat(rule.alternates);
      if (rule.alternate) expectedList.push(rule.alternate);

      warnings.push({
        type: "SEO_PARENT_DRIVEN_MISMATCH",
        severity: "warning",
        parentSlug: parentSlug,
        parentLevel: parentLevel,
        parentLevelNum: LEVEL_HIERARCHY_MAP[parentLevel],
        currentLevel: currentLevel,
        currentLevelNum: LEVEL_HIERARCHY_MAP[currentLevel],
        expectedLevel: rule.expected,
        alternates: rule.alternates || (rule.alternate ? [rule.alternate] : []),
        message: "URL '" + slug + "' terdeteksi '" + currentLevel +
                 "'. Berdasarkan parent '" + parentSlug + "' (" + parentLevel +
                 "), child SEO-aligned = " + expectedList.join(" atau ") + ".",
        suggestion: currentLevel === parentLevel
          ? "Child level sama dengan parent. Tambahkan modifier spesifik, atau pisah topik."
          : "Level child bukan expected. Cek struktur URL & konten."
      });
    }

    return warnings;
  }

  function isSpecModifierForEntity(word, entityType) {
    if (!word) return false;
    var w = word.toLowerCase().trim();
    if (!w) return false;

    if (/^\d+/.test(w)) return true;
    if (/^(k\d+|fc\d*|m\d+|c\d+|bjts?\d*)$/i.test(w)) return true;

    if (w === 'termurah' || w === 'termahal' || w === 'promo' || w === 'diskon') return true;

    if (entityType === "jasa") {
      var jasaSpecs = []
        .concat(JASA_SPECS.metode || [])
        .concat(JASA_SPECS.skala || [])
        .concat(JASA_SPECS.finishing || [])
        .concat(JASA_SPECS.kedalaman || [])
        .concat(CROSS_ENTITY_SPECS.jasa.sharedFinishing || [])
        .concat(CROSS_ENTITY_SPECS.jasa.sharedGaya || [])
        .concat(CROSS_ENTITY_SPECS.jasa.foreignTechniques || []);
      return jasaSpecs.indexOf(w) !== -1;
    }

    if (entityType === "produk") {
      var produkSpecs = []
        .concat(PRODUK_SPECS.mutu || [])
        .concat(PRODUK_SPECS.finishing || [])
        .concat(PRODUK_SPECS.warna || [])
        .concat(PRODUK_SPECS.dimensi || [])
        .concat(PRODUK_SPECS.gaya || [])
        .concat(CROSS_ENTITY_SPECS.produk.sharedMaterialFinishing || [])
        .concat(CROSS_ENTITY_SPECS.produk.sharedMaterialDimensi || [])
        .concat(["beton", "besi", "kayu", "aluminium", "kaca", "stainless",
                 "baja", "pvc", "wpc", "grc", "hpl", "acp", "vinyl", "upvc",
                 "galvanis", "tembaga", "kuningan", "perunggu"]);
      return produkSpecs.indexOf(w) !== -1;
    }

    if (entityType === "material") {
      var materialSpecs = []
        .concat(MATERIAL_SPECS.grade || [])
        .concat(MATERIAL_SPECS.finishing || [])
        .concat(MATERIAL_SPECS.dimensi || [])
        .concat(MATERIAL_SPECS.berat || [])
        .concat(MATERIAL_SPECS.tipe || [])
        .concat(CROSS_ENTITY_SPECS.material.extendedTypes || []);
      return materialSpecs.indexOf(w) !== -1;
    }

    if (entityType === "sewa") {
      var sewaSpecs = []
        .concat(SEWA_SPECS.tipe || [])
        .concat(SEWA_SPECS.merek || [])
        .concat(SEWA_SPECS.kapasitas || [])
        .concat(SEWA_SPECS.kondisi || [])
        .concat(SEWA_SPECS.durasi || [])
        .concat(CROSS_ENTITY_SPECS.sewa.extendedUnits || [])
        .concat(CROSS_ENTITY_SPECS.sewa.extendedTools || []);
      return sewaSpecs.indexOf(w) !== -1;
    }

    if (entityType === "desain") {
      var desainSpecs = []
        .concat(DESAIN_SPECS.gaya || [])
        .concat(DESAIN_SPECS.warna || [])
        .concat(DESAIN_SPECS.material || [])
        .concat(DESAIN_SPECS.konsep || [])
        .concat(DESAIN_SPECS.furniture || [])
        .concat(DESAIN_SPECS.subjektif || [])
        .concat(CROSS_ENTITY_SPECS.desain.extendedColors || [])
        .concat(CROSS_ENTITY_SPECS.desain.extendedGaya || []);
      return desainSpecs.indexOf(w) !== -1;
    }

    if (entityType === "artikel") {
      return false;
    }

    return false;
  }

  function detectMoneyLevelInternal(text, entityType) {
    var lowerText = text.toLowerCase();
    var factors = getFactors(text, entityType);
    var hasPriceWord = factors.hasPrice;
    var hasLocationWord = factors.hasLocation;
    var hasCommercialWord = factors.hasCommercial;
    var hasSpecWord = factors.hasSpec;
    var hasSpecPhrase = factors.hasSpecPhrase;
    var hasPerUnit = factors.hasPerUnit;
    var hasCompound = factors.hasCompoundAction;
    var fisikRole = factors.fisikRole;
    var complexityScore = factors.complexityScore;
    var hasBaseService = factors.hasBaseService;
    var subPillar = detectSubPillar(text);

    log('🔍 FACTORS: loc=' + hasLocationWord + ' spec=' + hasSpecWord +
        ' price=' + hasPriceWord + ' comm=' + hasCommercialWord +
        ' score=' + complexityScore + ' baseSvc=' + hasBaseService, 'INFO');

    // PRIORITAS 1: SUB-PILLAR
    if (subPillar) return subPillar;

    // PRIORITAS 2: LOCATION → MONEY_CHILD
    if (hasLocationWord) {
      if (hasBaseService) {
        log('📍 FIX 193: MONEY_CHILD (base service + location)', 'LOCATION');
        return "money-child";
      }
    }

    // PRIORITAS 3: SPEC PHRASE
    if (hasSpecPhrase && !hasLocationWord && !hasCommercialWord) {
      log('💰 MONEY_PAGE (spec phrase)', 'PRICE');
      return "money-page";
    }

    // PRIORITAS 4: PER-UNIT
    if (hasPerUnit && !hasPriceWord && !hasCommercialWord && !hasLocationWord && !hasSpecPhrase) {
      log('💰 MONEY_PAGE (per-unit)', 'PRICE');
      return "money-page";
    }

    // PRIORITAS 5: COMPOUND ACTION
    if (hasCompound && !hasLocationWord && !hasCommercialWord) {
      log('💰 MONEY_PAGE (compound)', 'PRICE');
      return "money-page";
    }

    // PRIORITAS 6: HIGH COMPLEXITY
    if (complexityScore >= 3 && !hasLocationWord && !hasCommercialWord && !hasPriceWord) {
      log('💰 MONEY_PAGE (score=' + complexityScore + ')', 'SCORE');
      return "money-page";
    }

    // ═══════════════════════════════════════════════════════════
    // 🔥 FIX v14-C: PRIORITAS 7 — gate pakai earlyLayers
    // ═══════════════════════════════════════════════════════════
    var jasaMaterialCtx186 = false;
    if (entityType === "jasa" && hasJasaMaterialCtx(text)) {
      var isMaterialInBase = false;
      var jasaBaseList = ENTITY_BASE_NAMES.jasa || [];
      var materialWords186 = ["beton","baja","besi","kayu","batu","tanah","aspal",
                              "keramik","granit","marmer","kaca","aluminium",
                              "pipa","semen","pasir"];
      for (var mbi = 0; mbi < jasaBaseList.length; mbi++) {
        var baseName186 = jasaBaseList[mbi];
        for (var mwi = 0; mwi < materialWords186.length; mwi++) {
          if (baseName186.indexOf(materialWords186[mwi]) !== -1) {
            if (text.indexOf(baseName186) !== -1) {
              isMaterialInBase = true;
              break;
            }
          }
        }
        if (isMaterialInBase) break;
      }
      if (!isMaterialInBase) jasaMaterialCtx186 = true;
      else log('🔥 FIX 203: material part of compound base → tidak naik level', 'VARIANT');
    }

    var hasStrongPromo211 = false;
    for (var hp = 0; hp < HIGH_VOLUME_WORDS.length; hp++) {
      if (lowerText.indexOf(HIGH_VOLUME_WORDS[hp]) !== -1) { hasStrongPromo211 = true; break; }
    }

    var skipP7Atau = false;
    if (/\batau\b/i.test(lowerText)) {
      var partsAtau = lowerText.split(/\batau\b/);
      var leftAtau = (partsAtau[0] || "").trim().split(/\s+/).filter(Boolean);
      var rightAtau = (partsAtau[1] || "").trim().split(/\s+/).filter(Boolean);
      if (leftAtau.length <= 1 || rightAtau.length <= 1) {
        skipP7Atau = true;
        log('🔥 FIX SEO v7: skip P7 (pilihan "atau" dgn sisi pendek)', 'PRICE');
      }
    }

    // 🔥 FIX v14-C: hitung earlyLayers sebagai gate tambahan
    var earlyLayers = 0;
    if (!hasPriceWord && !hasCommercialWord && !hasLocationWord
        && !hasStrongPromo211 && !skipP7Atau) {
      earlyLayers = countModifierLayers(text, entityType);
    }

    if ((hasSpecWord || jasaMaterialCtx186 || earlyLayers > 0)
        && !hasPriceWord && !hasCommercialWord && !hasLocationWord
        && !hasStrongPromo211
        && !skipP7Atau) {

      var layers186 = earlyLayers;
      if (layers186 === 0 && jasaMaterialCtx186) layers186 = 1;
      if (layers186 > 0) {
        var decision186 = decideLevelByLayers(layers186);
        log('🔥 FIX v14-C: ' + decision186 + ' (' + layers186 + ' layer)', 'VARIANT');
        return decision186;
      }
    }

    // PRIORITAS 8: COMMERCIAL + SPEC
    if (hasCommercialWord && hasSpecWord && !hasLocationWord) {
      var layersP8 = countModifierLayers(text, entityType);
      if (layersP8 >= 1) {
        var decisionP8 = decideLevelByLayers(layersP8);
        log('🔥 FIX 206: comm+spec → ' + decisionP8 + ' (' + layersP8 + ' layer)', 'PRICE');
        return decisionP8;
      }
      log('💰 FIX 206: MONEY_PAGE (comm+spec fallback)', 'PRICE');
      return "money-page";
    }

    // 🔥 FIX SEO v8: desain + multi-word target
    if (hasPriceWord && entityType === "desain"
        && !hasLocationWord && !hasCommercialWord && !hasSpecWord) {
      for (var mwt8 = 0; mwt8 < APPLICATION_TARGETS_FULL.length; mwt8++) {
        var mwt8w = APPLICATION_TARGETS_FULL[mwt8];
        if (mwt8w.indexOf(' ') !== -1 && new RegExp("\\b" + mwt8w + "\\b", "i").test(lowerText)) {
          log('🔥 FIX SEO v8: desain masked multi-word target "' + mwt8w + '" → MP', 'HARGA');
          return "money-page";
        }
      }
    }

    // PRIORITAS 7.5: PRICE + BASE SERVICE
    if (hasPriceWord && hasBaseService && !hasSpecWord && !hasCommercialWord && !hasLocationWord) {
      var preCore = getCoreWords(text, entityType);
      log('🔥 FIX 204: preCore=[' + preCore.join(',') + '] (len=' + preCore.length + ')', 'CORE');

      if (preCore.length === 0) {
        log('🏛️ FIX 204: MONEY_MASTER (base service murni)', 'MM');
        return "money-master";
      }

      if (preCore.length === 1) {
        var coreWord = preCore[0];

        if (APPLICATION_TARGETS.indexOf(coreWord) !== -1) {
          var hasCompoundBase154 = false;
          var baseList154 = ENTITY_BASE_NAMES[entityType] || [];
          for (var bi154 = 0; bi154 < baseList154.length; bi154++) {
            var baseName154 = baseList154[bi154];
            if (baseName154.split(' ').length >= 2 && text.indexOf(baseName154) !== -1) {
              hasCompoundBase154 = true;
              break;
            }
          }
          if (hasCompoundBase154) return "money-page";
          return "money-master";
        }

        if (isSpecModifierForEntity(coreWord, entityType)) {
          log('💵 FIX 204: MONEY_PAGE (price + spec: ' + coreWord + ')', 'HARGA');
          return "money-page";
        }

        if (entityType === "jasa") {
          var narrow182 = ["beton","baja","besi","kayu","batu","tanah","aspal",
                           "keramik","granit","marmer","kaca","aluminium",
                           "pipa","semen","pasir"];
          if (narrow182.indexOf(coreWord) !== -1) {
            var isMatInBase204 = false;
            var jasaBase204 = ENTITY_BASE_NAMES.jasa || [];
            for (var jbi = 0; jbi < jasaBase204.length; jbi++) {
              if (jasaBase204[jbi].indexOf(coreWord) !== -1 && text.indexOf(jasaBase204[jbi]) !== -1) {
                isMatInBase204 = true;
                break;
              }
            }
            if (isMatInBase204) {
              log('🏛️ FIX 204: MONEY_MASTER (compound base + material)', 'MM');
              return "money-master";
            }
            log('💵 FIX 204: MONEY_PAGE (jasa + material: ' + coreWord + ')', 'HARGA');
            return "money-page";
          }
        }

        log('🏛️ FIX 204: MONEY_MASTER (price + base + non-spec)', 'MM');
        return "money-master";
      }

      log('💵 FIX 204: MONEY_PAGE (price + 2+ modifier)', 'HARGA');
      return "money-page";
    }

    // PRIORITAS 9: PRICE + SPEC
    if (hasPriceWord && hasSpecWord && !hasLocationWord && !hasCommercialWord) {
      var layersP9 = countModifierLayers(text, entityType);
      if (layersP9 >= 1) {
        var decisionP9 = decideLevelByLayers(layersP9);
        log('🔥 FIX 186: price+spec → ' + decisionP9 + ' (' + layersP9 + ' layer)', 'HARGA');
        return decisionP9;
      }
      for (var at9 = 0; at9 < APPLICATION_TARGETS_FULL.length; at9++) {
        var at9w = APPLICATION_TARGETS_FULL[at9];
        if (new RegExp("\\b" + at9w + "\\b", "i").test(lowerText)) {
          var isRoomCtx9 = false;
          if (entityType === "desain") {
            var ROOM_CTX_9 = ["rumah", "kantor", "toko", "hotel", "restoran",
              "cafe", "villa", "apartemen", "ruko", "kios", "gudang", "klinik",
              "sekolah", "mall", "spa", "salon", "bar", "lounge", "butik",
              "showroom", "minimarket"];
            isRoomCtx9 = ROOM_CTX_9.indexOf(at9w) !== -1;
          }
          if (!isRoomCtx9) {
            log('🔥 FIX SEO v9: price+spec+target "' + at9w + '" (layers=0) → MP', 'HARGA');
            return "money-page";
          }
        }
      }
      var isPureTechForPrice = checkPureTechnicalSpec(text, entityType);
      if (isPureTechForPrice) return "money-page";
      return "money-master";
    }

    // PRIORITAS 10: COMMERCIAL
    if (hasCommercialWord && !hasLocationWord) {
      if (hasPriceWord && !hasSpecWord) { log('🏛️ MONEY_MASTER', 'HARGA'); return "money-master"; }
      log('💰 MONEY_PAGE (comm)', 'PRICE');
      return "money-page";
    }

    // PRIORITAS 11: HIGH VOLUME
    var hasHighVolume = false;
    for (var i = 0; i < HIGH_VOLUME_WORDS.length; i++) {
      if (lowerText.indexOf(HIGH_VOLUME_WORDS[i]) !== -1) { hasHighVolume = true; break; }
    }

    if (hasHighVolume && !hasLocationWord) {
      var layers215 = countModifierLayers(text, entityType);
      if (layers215 > 0) {
        var decision215 = decideLevelByLayers(layers215);
        log('💰 FIX 215: ' + decision215 + ' (' + layers215 + ' layer + promo)', 'PRICE');
        return decision215;
      }
      var hasNoun215 = /\b(jasa|layanan|produk|material|pondasi|tiang|pancang|pagar|panel|beton|baja|besi|kayu|batu|keramik|granit|marmer|plafon|gypsum|kanopi|paving|readymix|cor|sewa|rental|alat|mesin|bangunan|konstruksi)\b/i.test(lowerText);
      if (hasNoun215 || hasSpecWord) {
        log('💰 FIX 215: MONEY_PAGE (strong promo, 0 layer)', 'PRICE');
        return "money-page";
      }
    }

    // FIX 164: DAN-bundling
    var hasDanConj = /\b(dan|serta)\b/i.test(lowerText);
    var isDanBaseNamePart = /\bcut and fill\b/i.test(lowerText);
    if (hasDanConj && !isDanBaseNamePart && !hasLocationWord && !hasCommercialWord && !hasPriceWord) {
      var coreForDan = getCoreWords(text, entityType);
      if (coreForDan.length >= 2) {
        log('💰 FIX 164: MONEY_PAGE (dan-bundling: ' + coreForDan.join(',') + ')', 'PRICE');
        return "money-page";
      }
    }

    // ═══════════════════════════════════════════════════════════
    // 🔥 FIX v14-D: PRIORITAS 12 — cek modifier nyata sebelum MM
    // ═══════════════════════════════════════════════════════════
    var coreWords = getCoreWords(text, entityType);
    log('🧠 CORE: [' + coreWords.join(', ') + ']', 'CORE');

    if (entityType === "artikel") {
      if (!hasPriceWord && !hasCommercialWord && !hasCompound && complexityScore < 3) {
        log('🏛️ FIX 138: MONEY_MASTER (artikel informasional)', 'MM');
        return "money-master";
      }
    }

    // 🔥 FIX v14-D: sebelum jatuh ke MM, cek layer residual
    var residualLayers = countModifierLayers(text, entityType);

        // 🔥 FIX v14-T: kalau coreWords = 0, artinya semua sudah di-strip (base + entity + modifier known).
    // Kalau tidak ada residual layer, return MM langsung — jangan biarkan complexityScore override.
    if (coreWords.length === 0
        && residualLayers === 0
        && !hasPriceWord && !hasCommercialWord && !hasLocationWord
        && !hasCompound) {
      log('🏛️ FIX v14-T: MONEY_MASTER (0 core, 0 residual)', 'MM');
      return "money-master";
    }

    if (coreWords.length <= 2) {
      // FIX 146: JASA base service cap MM
      if (entityType === "jasa" && coreWords.length === 1 && complexityScore <= 2
          && !hasPriceWord && !hasCommercialWord && !hasCompound) {
        if (APPLICATION_TARGETS.indexOf(coreWords[0]) !== -1) {
          log('💵 FIX 167: MONEY_PAGE (base jasa + target: ' + coreWords[0] + ')', 'PRICE');
          return "money-page";
        }
        // 🔥 FIX v14-J: cek spec modifier JASA sebelum MM
        if (isSpecModifierForEntity(coreWords[0], "jasa")) {
          log('💵 FIX v14-J: MONEY_PAGE (base jasa + spec: ' + coreWords[0] + ')', 'PRICE');
          return "money-page";
        }
        log('🏛️ FIX 146: MONEY_MASTER (base jasa + 1 objek)', 'MM');
        return "money-master";
      }
       
      // 🔥 FIX v14-D: kalau ada residual layer > 0, naikkan ke layer-based level
      if (residualLayers > 0 && !hasLocationWord && !hasCommercialWord) {
        var decision14D = decideLevelByLayers(residualLayers);
        log('🔥 FIX v14-D: ' + decision14D + ' (' + residualLayers + ' residual layer)', 'PRICE');
        return decision14D;
      }

      if (complexityScore >= 2 && !hasPriceWord && !hasCommercialWord) {
        log('💰 MONEY_PAGE (score=' + complexityScore + ')', 'SCORE');
        return "money-page";
      }
      if (hasPriceWord) log('💵 MONEY_MASTER', 'HARGA');
      else log('🏛️ MONEY_MASTER', 'MM');
      return "money-master";
    } else {
      // 🔥 FIX v14-D: core > 2 → cek layer, jangan langsung MP
      if (residualLayers > 0) {
        var decision14Db = decideLevelByLayers(residualLayers);
        log('🔥 FIX v14-D: ' + decision14Db + ' (' + residualLayers + ' layer, core=' + coreWords.length + ')', 'PRICE');
        return decision14Db;
      }
      log('💰 MONEY_PAGE (core:' + coreWords.length + ')', 'PRICE');
      return "money-page";
    }
  }

  function detectPageLevel(userOptions) {
    if (isHomePage()) return "home";
    var text = getPageText();
    var entityType = detectEntityType(userOptions && userOptions.userEntityType);
    log('📝 TEXT: "' + text + '"', "INFO");
    log('🏷️ ENTITY: ' + (entityType || '(null)'), "INFO");
    if (detectPillar(text, entityType)) { log('🏛️ PILLAR', "SUCCESS"); return "pillar"; }
    var level = detectMoneyLevelInternal(text, entityType);
    if (!level) { log('⚠️ Level null', 'WARN'); level = "money-page"; }
    log('🎯 FINAL: ' + level, 'SUCCESS');
    return level;
  }

  function extractSlugFromInput(input) {
    if (!input) return "";
    var slug = "";
    try {
      var url = new URL(input);
      var pathname = url.pathname.replace(/\.html$/, "").replace(/\.htm$/, "").replace(/\/$/, "");
      var segments = pathname.split("/").filter(Boolean);
      slug = segments[segments.length - 1] || "";
    } catch (e) { slug = input; }
    slug = slug.replace(/^\d{4}-\d{2}-/, "").replace(/^\d{4}-/, "").replace(/^\d{2}-/, "").replace(/^\d{4}/, "").replace(/^\d+-/, "").replace(/^\d+/, "");
    slug = slug.replace(/-/g, " ");
    return cleanText(slug);
  }

  function detectPageLevelForPrompt(text, entityType) {
    var cleanLower = text.toLowerCase().trim();
    for (var entity in ENTITY_PILLAR_NAMES) {
      if (!ENTITY_PILLAR_NAMES.hasOwnProperty(entity)) continue;
      var patterns = ENTITY_PILLAR_NAMES[entity];
      for (var i = 0; i < patterns.length; i++) {
        if (cleanLower === patterns[i]) {
          var isEntityMatch = entity === entityType || (entity === "produk interior" && entityType === "produk");
          if (isEntityMatch) return "pillar";
        }
      }
    }
    var level = detectMoneyLevelInternal(text, entityType);
    if (!level) { log('⚠️ Level null', 'WARN'); level = "money-page"; }
    return level;
  }

  function detectPageLevelFromDOM(entityType) {
    if (typeof window === 'undefined' || !window.location) return null;
    if (isHomePage()) return "home";
    var urlText = getPageText();
    var h1Text = getH1Text();
    var urlIsGeneric = /^(blog|post|artikel|produk|layanan|service|item|page|p|home|index|\d+)(\s+\d+)?\s*$/i.test(urlText.trim());
    var text;
    if (urlIsGeneric && h1Text && h1Text.length > 3) text = h1Text;
    else if (!urlText || urlText.length < 3) text = h1Text;
    else if (h1Text && h1Text.length > 3) text = urlText + " " + h1Text;
    else text = urlText;
    var entity = entityType || detectEntityType();
    if (detectPillar(text, entity)) return "pillar";
    var level = detectMoneyLevelInternal(text, entity);
    if (!level) level = "money-page";
    return level;
  }

  function validateForPrompt(input, entityType, options) {
    options = options || {};
    var strictMode = options.strict !== false;
    var inputSlug = extractSlugFromInput(input);
    if (!inputSlug) return { status: "DITOLAK", error: "Input tidak valid", valid: false };
    var inputEntity = entityType || detectEntityTypeFromText(inputSlug);
    var inputLevel = detectPageLevelForPrompt(inputSlug, inputEntity);
    var inputFactors = getFactors(inputSlug, inputEntity);
    var browserLevel = null, browserEntity = null, browserFactors = null, browserAvailable = false;
    try {
      if (typeof window !== 'undefined' && window.location) {
        browserLevel = detectPageLevelFromDOM(inputEntity);
        browserEntity = detectEntityType();
        if (browserLevel !== null && browserLevel !== undefined) {
          browserFactors = getFactors(getPageText(), browserEntity);
          browserAvailable = true;
        }
      }
    } catch (e) {}
    var crossValidation = {
      pageLevel: {
        input: inputLevel, browser: browserLevel,
        status: (browserAvailable && inputLevel === browserLevel) ? "SAMA" : (!browserAvailable ? "BROWSER_UNAVAILABLE" : "BERBEDA")
      }
    };
    var finalStatus = "LOLOS";
    var errors = [], warnings = [];
    var finalLevel = inputLevel;
    var finalEntity = inputEntity;
    if (crossValidation.pageLevel.status === "BERBEDA") {
      if (strictMode) { finalStatus = "PERBAIKI"; errors.push("Level beda"); }
      else warnings.push("Level beda");
      finalLevel = browserLevel;
    }
    return {
      phase: 4, status: finalStatus, valid: finalStatus === "LOLOS",
      error: errors.length > 0 ? errors.join("; ") : null, warnings: warnings,
      pld: { input: { pageLevel: inputLevel, entityType: inputEntity, factors: inputFactors, text: inputSlug } },
      crossValidation: crossValidation,
      final: {
        pageLevel: finalLevel, entityType: finalEntity,
        levelNum: TYPE_LEVEL_MAP[finalLevel] || -1,
        source: crossValidation.pageLevel.status === "SAMA" ? "INPUT_AND_BROWSER" : "INPUT_ONLY"
      }
    };
  }

  function detectUpwardFromSlug(slug, domain) {
    if (!slug) return { upward: [], breadcrumbs: [] };
    var words = slug.split(" ");
    var upward = [], breadcrumbs = [];
    var currentSlug = slug.replace(/ /g, "-");
    var baseDomain = domain || "https://" + (typeof window !== 'undefined' ? window.location.hostname : "");
    if (baseDomain.endsWith("/")) baseDomain = baseDomain.slice(0, -1);
    if (words.length >= 2) {
      var p1Words = words.slice(0, -1);
      var p1Label = p1Words.join(" ");
      var p1Slug = p1Words.join("-");
      breadcrumbs.push({ position: 1, label: p1Label, slug: p1Slug, url: baseDomain + "/" + p1Slug + ".html", isParent: true });
      upward.push({ position: 1, label: p1Label, slug: p1Slug, url: baseDomain + "/" + p1Slug + ".html", isParent: true });
    }
    if (words.length >= 3) {
      var p2Words = words.slice(0, -2);
      var p2Label = p2Words.join(" ");
      var p2Slug = p2Words.join("-");
      breadcrumbs.push({ position: 2, label: p2Label, slug: p2Slug, url: baseDomain + "/" + p2Slug + ".html", isParent: true });
      upward.push({ position: 2, label: p2Label, slug: p2Slug, url: baseDomain + "/" + p2Slug + ".html", isParent: true });
    }
    breadcrumbs.push({ position: breadcrumbs.length + 1, label: slug, slug: currentSlug, url: baseDomain + "/" + currentSlug + ".html", isCurrent: true });
    return { upward: upward, breadcrumbs: breadcrumbs };
  }

  function detectParentLevelFromSlug(slug, entityType, domain) {
    if (!slug) return [];
    var words = slug.split(" ");
    var parents = [];
    var entity = entityType || detectEntityTypeFromText(slug);
    var baseDomain = domain || "https://" + (typeof window !== 'undefined' ? window.location.hostname : "");
    if (baseDomain.endsWith("/")) baseDomain = baseDomain.slice(0, -1);
    if (words.length >= 2) {
      var p1Words = words.slice(0, -1);
      var p1Label = p1Words.join(" ");
      var p1Slug = p1Words.join("-");
      parents.push({ position: 1, label: p1Label, slug: p1Slug, url: baseDomain + "/" + p1Slug + ".html", level: detectPageLevelForPrompt(p1Label, entity) });
    }
    if (words.length >= 3) {
      var p2Words = words.slice(0, -2);
      var p2Label = p2Words.join(" ");
      var p2Slug = p2Words.join("-");
      parents.push({ position: 2, label: p2Label, slug: p2Slug, url: baseDomain + "/" + p2Slug + ".html", level: detectPageLevelForPrompt(p2Label, entity) });
    }
    return parents;
  }

  function detectForPromptFull(input, entityType, domain) {
    if (!input) return { pageLevel: 'unknown', isValid: false, error: 'Input kosong', upward: [], breadcrumbs: [] };
    var slug = extractSlugFromInput(input);
    if (!slug) return { pageLevel: 'unknown', isValid: false, error: 'Slug kosong', upward: [], breadcrumbs: [] };
    var entity = entityType || detectEntityTypeFromText(slug);
    var level = detectPageLevelForPrompt(slug, entity);
    var factors = getFactors(slug, entity);
    var upwardData = detectUpwardFromSlug(slug, domain);
    var seoWarnings = detectConjunctionWarning(slug, level);
    var hierarchyWarnings = detectHierarchyWarning(slug, entity);
    var breadcrumbWarnings = validateBreadcrumbHierarchy(slug, entity);
    var parentDrivenWarnings = validateParentDrivenHierarchy(slug, entity);
    var allWarnings = seoWarnings.concat(hierarchyWarnings)
                                .concat(breadcrumbWarnings)
                                .concat(parentDrivenWarnings);
    return {
      pageLevel: level, entityType: entity, factors: factors, text: slug,
      levelNum: TYPE_LEVEL_MAP[level] || -1,
      isValid: VALID_LEVELS.indexOf(level) !== -1,
      upward: upwardData.upward, breadcrumbs: upwardData.breadcrumbs,
      parents: detectParentLevelFromSlug(slug, entity, domain),
      seoWarnings: allWarnings
    };
  }

  function detectForPrompt(input, entityType) {
    if (!input) return { pageLevel: 'unknown', isValid: false, error: 'Input kosong' };
    var slug = extractSlugFromInput(input);
    if (!slug) return { pageLevel: 'unknown', isValid: false, error: 'Slug kosong' };
    var entity = entityType || detectEntityTypeFromText(slug);
    var level = detectPageLevelForPrompt(slug, entity);
    var factors = getFactors(slug, entity);
    var seoContext = getSEOContext(slug, entity);
    var seoWarnings = detectConjunctionWarning(slug, level);
    var hierarchyWarnings = detectHierarchyWarning(slug, entity);
    var breadcrumbWarnings = validateBreadcrumbHierarchy(slug, entity);
    var parentDrivenWarnings = validateParentDrivenHierarchy(slug, entity);
    var allWarnings = seoWarnings.concat(hierarchyWarnings)
                                .concat(breadcrumbWarnings)
                                .concat(parentDrivenWarnings);
    return {
      pageLevel: level, entityType: entity, factors: factors, text: slug,
      levelNum: TYPE_LEVEL_MAP[level] || -1,
      isValid: VALID_LEVELS.indexOf(level) !== -1,
      seoContext: seoContext,
      seoWarnings: allWarnings
    };
  }

  function detectForPromptSync(input, entityType) {
    return detectForPrompt(input, entityType);
  }

  function detectForPromptWithUpward(input, entityType, domain) { return detectForPromptFull(input, entityType, domain); }
  function detectBreadcrumbsFromSlug(slug, domain) { return detectUpwardFromSlug(slug, domain).breadcrumbs; }
  function detectParentFromSlug(slug, domain) { return detectUpwardFromSlug(slug, domain).upward; }

  function detectPageLevelWithAI(text, entityType) {
    var pldLevel = detectPageLevelForPrompt(text, entityType);
    var confidence = calculatePLDConfidence(text, entityType, pldLevel);

    if (confidence >= CONFIG.AI_CONFIDENCE_THRESHOLD || !CONFIG.AI_ENABLED) {
      return Promise.resolve({
        pageLevel: pldLevel,
        source: "PLD_RULE",
        confidence: confidence,
        reason: "Rule-based"
      });
    }

    return callAIProxy(text, entityType).then(function(aiResult) {
      if (aiResult && aiResult.pageLevel) {
        return {
          pageLevel: aiResult.pageLevel,
          source: aiResult.source || "AI_PROXY",
          confidence: aiResult.confidence || 85,
          reason: aiResult.reason || "AI classification",
          pldFallback: pldLevel,
          pldConfidence: confidence
        };
      }
      return {
        pageLevel: pldLevel,
        source: "PLD_RULE",
        confidence: confidence,
        reason: "Rule-based (AI unavailable)"
      };
    });
  }

  function detectForPromptWithAI(input, entityType) {
    var pldResult = detectForPrompt(input, entityType);
    return detectPageLevelWithAI(pldResult.text, entityType).then(function(aiResult) {
      if (aiResult.source !== "PLD_RULE") {
        pldResult.pageLevel = aiResult.pageLevel;
        pldResult.aiEnhanced = true;
        pldResult.aiSource = aiResult.source;
        pldResult.aiConfidence = aiResult.confidence;
        pldResult.aiReason = aiResult.reason;
        pldResult.pldFallback = aiResult.pldFallback;
      } else {
        pldResult.aiEnhanced = false;
        pldResult.aiConfidence = aiResult.confidence;
      }
      return pldResult;
    });
  }

  function detectIntent(text) {
    if (!text) return { dominant: "informational", scores: {}, confidence: "low" };
    var lower = text.toLowerCase();
    var scores = { transactional: 0, informational: 0, commercial: 0, "commercial-investigation": 0, navigational: 0 };
    for (var intent in INTENT_TRIGGERS) {
      if (!INTENT_TRIGGERS.hasOwnProperty(intent)) continue;
      var triggers = INTENT_TRIGGERS[intent];
      for (var i = 0; i < triggers.length; i++) {
        if (lower.indexOf(triggers[i]) !== -1) scores[intent] += 1;
      }
    }
    var ciWords = COMMERCIAL_INVESTIGATION_WORDS;
    for (var i = 0; i < ciWords.length; i++) {
      if (lower.indexOf(ciWords[i]) !== -1) scores["commercial-investigation"] += 1;
    }
    var maxScore = 0, dominantIntent = "informational";
    for (var intent in scores) {
      if (!scores.hasOwnProperty(intent)) continue;
      if (scores[intent] > maxScore) { maxScore = scores[intent]; dominantIntent = intent; }
    }
    var confidence = "low";
    if (maxScore >= 3) confidence = "high";
    else if (maxScore >= 2) confidence = "medium";
    return { dominant: dominantIntent, scores: scores, confidence: confidence, maxScore: maxScore };
  }

  function detectContentFocus(level, entityType) {
    var h1Text = getH1Text();
    var urlText = getPageText();

    var h1Raw = '';
    try {
      var h1El = document.querySelector('h1');
      h1Raw = h1El ? (h1El.innerText || h1El.textContent || '') : '';
    } catch (e) {}

    var pathnameRaw = '';
    try { pathnameRaw = window.location.pathname; } catch (e) {}

    var hasYearInH1 = /\b(20[2-9][0-9])\b/.test(h1Raw);
    var hasYearInUrl = /\b(20[2-9][0-9])\b/.test(pathnameRaw);

    var hasPriceInText = checkHasPrice(h1Text) || checkHasPrice(urlText);
    var hasCommercial = checkHasCommercial(h1Text, entityType) ||
                        checkHasCommercial(urlText, entityType);
    var hasInfoSpecPhrase = checkHasInformationalSpecPhrase(h1Text) ||
                             checkHasInformationalSpecPhrase(urlText);

    var hasPriceTableInDOM = checkPriceTable();

    var isMoneyLevel = ['money-master', 'money-page', 'money-child'].indexOf(level) !== -1;
    var isVariantLevel = ['variant', 'sub-variant'].indexOf(level) !== -1;

    if (isMoneyLevel || isVariantLevel) {
      if (hasInfoSpecPhrase && !hasPriceTableInDOM && !hasCommercial) {
        log('🎯 FIX 137: CONTENT FOCUS = INFORMASI (info spec phrase)', 'SEO');
        return 'INFORMASI';
      }
      if (hasPriceTableInDOM) { log('🎯 FOCUS: HARGA (tabel)', 'TABLE'); return 'HARGA'; }
      if (hasPriceInText || hasYearInH1 || hasYearInUrl) return 'HARGA';
      if (hasCommercial) return 'COMMERCIAL';
      return 'INFORMASI';
    }
    return 'INFORMASI';
  }

  function detectKategori(contentFocus) {
    if (contentFocus === 'INFORMASI') return 'EVERGREEN';
    if (['HARGA', 'COMMERCIAL', 'GABUNG'].indexOf(contentFocus) !== -1) return 'NON-EVERGREEN';
    return 'EVERGREEN';
  }

  function detectH1Pattern(kategori) {
    return kategori === 'NON-EVERGREEN' ? 'with-year' : 'no-year';
  }

  function detectEntitySubType(level, entityType) {
    if (typeof document === 'undefined' || !document.body) return null;
    var bodySubType = document.body.getAttribute('data-entity-sub-type');
    if (bodySubType) return bodySubType;
    return null;
  }

  function detectSchemaType(level, entityType, contentFocus) {
    var primary = 'WebPage';
    var secondary = '';
    var note = '';
    var isMoneyLevel = ['money-master', 'money-page', 'money-child'].indexOf(level) !== -1;
    var isEvergreen = ['pillar', 'sub-pillar-tipe-1', 'sub-pillar-tipe-2'].indexOf(level) !== -1;
    var isVariant = ['variant', 'sub-variant'].indexOf(level) !== -1;

    if (isEvergreen) {
      primary = 'Article'; secondary = 'FAQPage';
    }
    else if (isVariant) {
      primary = 'Product'; secondary = 'TechArticle';
      note = 'without-offers';
    }
    else if (isMoneyLevel) {
      if (contentFocus === 'HARGA' || contentFocus === 'COMMERCIAL') {
        primary = 'Product'; secondary = 'Service';
        if (level === 'money-child') {
          note = 'with-areaServed';
        }
      } else if (contentFocus === 'INFORMASI') {
        primary = 'Article'; secondary = 'FAQPage';
      }
    }
    return { primary: primary, secondary: secondary, note: note };
  }

  function detectCtaType(level, contentFocus) {
    var isMoneyLevel = ['money-master', 'money-page', 'money-child'].indexOf(level) !== -1;
    if (!isMoneyLevel) return { type: 'soft', text: 'Baca Selengkapnya' };
    if (contentFocus === 'HARGA' || contentFocus === 'COMMERCIAL') {
      return { type: 'hard', text: 'Pesan Sekarang' };
    }
    return { type: 'medium', text: 'Hubungi Kami' };
  }

  function detectProductCategoryFromPLD(entityType, entitySubType) {
    if (!entityType) return '';
    var isProduct = ['produk', 'material'].indexOf(entityType) !== -1;
    if (!isProduct) return '';
    var categoryMap = {
      'pagar-panel-beton': 'PrecastProduct', 'besi-beton': 'SteelProduct',
      'baja-ringan': 'SteelProduct', 'paving': 'PavingProduct',
      'paving-block': 'PavingProduct', 'kanopi': 'PrecastProduct',
      'batako': 'BuildingMaterial', 'genteng': 'BuildingMaterial',
      'semen': 'BuildingMaterial', 'pasir': 'BuildingMaterial',
      'kayu': 'BuildingMaterial', 'wpc': 'BuildingMaterial',
      'grc': 'BuildingMaterial', 'hpl': 'BuildingMaterial',
      'pvc': 'BuildingMaterial', 'acp': 'BuildingMaterial'
    };
    if (entitySubType && categoryMap[entitySubType]) return categoryMap[entitySubType];
    if (entityType === 'material') return 'BuildingMaterial';
    if (entityType === 'produk') return 'PrecastProduct';
    return '';
  }

  function detectProductMaterialFromPLD(entityType, entitySubType) {
    if (!entityType) return '';
    var isProduct = ['produk', 'material'].indexOf(entityType) !== -1;
    if (!isProduct) return '';
    var materialMap = {
      'pagar-panel-beton': 'Beton Precast', 'besi-beton': 'Besi Beton',
      'baja-ringan': 'Baja Ringan', 'paving': 'Paving Block',
      'paving-block': 'Paving Block', 'kanopi': 'Baja Ringan',
      'batako': 'Batako', 'genteng': 'Genteng', 'semen': 'Semen',
      'pasir': 'Pasir', 'kayu': 'Kayu', 'wpc': 'WPC',
      'grc': 'GRC', 'hpl': 'HPL', 'pvc': 'PVC', 'acp': 'ACP'
    };
    if (entitySubType && materialMap[entitySubType]) return materialMap[entitySubType];
    if (entityType === 'material') return 'Material Konstruksi';
    if (entityType === 'produk') return 'Beton Precast';
    return '';
  }

  function setSchemaAttributes(level) {
    try {
      document.body.setAttribute("data-page-level", level);
      document.body.setAttribute("data-page-level-num", String(TYPE_LEVEL_MAP[level] || '0'));

      var entityType = detectEntityType();
      if (!entityType) {
        var h1Text = getH1Text();
        entityType = detectEntityTypeFromText(h1Text);
      }
      document.body.setAttribute("data-entity-type", entityType || '');

      var contentFocus = detectContentFocus(level, entityType);
      document.body.setAttribute("data-content-focus", contentFocus);

      var kategori = detectKategori(contentFocus);
      document.body.setAttribute("data-kategori", kategori);

      var h1Pattern = detectH1Pattern(kategori);
      document.body.setAttribute("data-h1-pattern", h1Pattern);

      var entitySubType = detectEntitySubType(level, entityType);
      document.body.setAttribute("data-entity-sub-type", entitySubType || '');

      var schemaType = detectSchemaType(level, entityType, contentFocus);
      document.body.setAttribute("data-schema-type-primary", schemaType.primary);
      document.body.setAttribute("data-schema-type-secondary", schemaType.secondary);

      var ctaType = detectCtaType(level, contentFocus);
      document.body.setAttribute("data-cta-type", ctaType.type);
      document.body.setAttribute("data-cta-text", ctaType.text);

      var productCategory = detectProductCategoryFromPLD(entityType, entitySubType);
      if (productCategory) document.body.setAttribute("data-product-category", productCategory);

      var productMaterial = detectProductMaterialFromPLD(entityType, entitySubType);
      if (productMaterial) document.body.setAttribute("data-product-material", productMaterial);

      log('✅ Schema attributes ter-set!', 'ATTR');
    } catch (e) {
      log('❌ Error set schema attributes: ' + e.message, 'ERROR');
    }
  }

  function detectEEATSignals() {
    var signals = { author: false, date: false, source: false, expertise: false, experience: false, trust: false };
    if (typeof document === 'undefined' || !document.body) return signals;
    var bodyText = (document.body && document.body.innerText) ? document.body.innerText.toLowerCase() : "";
    if (/oleh|author|written by|posted by|by\s+[a-z]/.test(bodyText)) signals.author = true;
    if (/\d{1,2}\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s+\d{4}/i.test(bodyText)) signals.date = true;
    if (/sumber|referensi|refrensi|menurut|berdasarkan|dikutip|dari/.test(bodyText)) signals.source = true;
    if (/ahli|expert|profesional|berpengalaman|spesialis|expertise/.test(bodyText)) signals.expertise = true;
    if (/pengalaman|studi kasus|portofolio|proyek sebelumnya/.test(bodyText)) signals.experience = true;
    if (/terpercaya|jaminan|garansi|sertifikat|sertifikasi|resmi|legal/.test(bodyText)) signals.trust = true;
    return signals;
  }

  function detectContentStructure() {
    var structure = {
      headings: { h1: 0, h2: 0, h3: 0, h4: 0 },
      hasList: false, hasTable: false, hasImages: false, hasVideo: false,
      wordCount: 0, readability: "medium"
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
      var mainEl = null;
      try {
        mainEl = document.querySelector('main, article, .post-content, .entry-content, .article-content, .post-body, #content, #main');
      } catch (e) {}
      var contentEl = mainEl || document.body;
      var bodyText = (contentEl && contentEl.innerText) ? contentEl.innerText : "";
      structure.wordCount = bodyText.split(/\s+/).filter(function(w) { return w.length > 0; }).length;
      if (structure.wordCount > 2000) structure.readability = "high";
      else if (structure.wordCount > 800) structure.readability = "medium";
      else structure.readability = "low";
    } catch (e) {}
    return structure;
  }

  function detectFeaturedSnippetOpportunity() {
    var opportunities = { definition: false, faq: false, table: false, list: false, stepByStep: false, comparison: false };
    if (typeof document === 'undefined' || !document.body) return opportunities;
    var bodyText = (document.body && document.body.innerText) ? document.body.innerText.toLowerCase() : "";
    if (/adalah|merupakan|ialah|yaitu|definisi|pengertian/.test(bodyText)) opportunities.definition = true;
    if (/faq|tanya jawab|pertanyaan|q&a/.test(bodyText)) opportunities.faq = true;
    try { opportunities.table = document.querySelectorAll('table').length > 0; } catch (e) {}
    try { opportunities.list = document.querySelectorAll('ul, ol').length > 2; } catch (e) {}
    if (/langkah|step|cara|tahap|pertama|kedua|ketiga/.test(bodyText)) opportunities.stepByStep = true;
    if (/perbandingan|vs|versus|kelebihan|kekurangan/.test(bodyText)) opportunities.comparison = true;
    return opportunities;
  }

  function detectSemanticClusters(text) {
    if (!text) return [];
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
    if (!eeat.author) recommendations.push("🟡 Tambahkan nama author atau byline");
    if (!eeat.date) recommendations.push("🟡 Tambahkan tanggal publish/update");
    if (!eeat.source) recommendations.push("🟡 Tambahkan sumber referensi");
    if (!eeat.expertise) recommendations.push("🟡 Tampilkan kredensial penulis");
    if (structure.wordCount < 800) recommendations.push("🟡 Tingkatkan kedalaman konten");
    if (structure.headings.h2 < 2) recommendations.push("🟡 Tambahkan sub-heading (H2)");
    if (!structure.hasList) recommendations.push("🟡 Gunakan bullet points");
    if (!structure.hasTable) recommendations.push("🟡 Pertimbangkan tabel");
    if (!structure.hasImages) recommendations.push("🟡 Tambahkan gambar");
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
      "money-master": 20, "money-page": 25, "money-child": 28,
      "variant": 20, "sub-variant": 22
    };
    score += levelScores[level] || 10;
    details.push("Level: " + level);

    if (entityType && VALID_ENTITY_TYPES.indexOf(entityType) !== -1) score += 15;
    else score += 5;

    if (intent.confidence === "high") score += 15;
    else if (intent.confidence === "medium") score += 10;
    else score += 5;

    var eeatScore = 0;
    for (var signal in eeat) {
      if (!eeat.hasOwnProperty(signal)) continue;
      if (eeat[signal]) eeatScore += 3;
    }
    score += Math.min(eeatScore, 15);

    var structureScore = 0;
    if (structure.headings.h1 > 0) structureScore += 3;
    if (structure.headings.h2 > 0) structureScore += 3;
    if (structure.headings.h3 > 0) structureScore += 2;
    if (structure.hasList) structureScore += 2;
    if (structure.hasTable) structureScore += 2;
    if (structure.hasImages) structureScore += 2;
    if (structure.hasVideo) structureScore += 1;
    score += Math.min(structureScore, 15);

    var snippetScore = 0;
    for (var type in snippet) {
      if (!snippet.hasOwnProperty(type)) continue;
      if (snippet[type]) snippetScore += 2;
    }
    score += Math.min(snippetScore, 10);

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
    if (level === 'pillar') strategies.push("PILLAR: exact match");
    else if (level === 'sub-pillar-tipe-2') strategies.push("SP2: daftar/jenis");
    else if (level === 'sub-pillar-tipe-1') strategies.push("SP1: perbandingan/vs");
    else if (level === 'money-child') strategies.push("MC: lokasi + produk");
    else if (level === 'variant') strategies.push("VARIANT: spec teknis");
    else if (level === 'sub-variant') strategies.push("SUB-VARIANT: spec + dimensi");
    else if (level === 'money-page') strategies.push("MP: " + coreWords.length + " core words");
    else if (level === 'money-master') strategies.push("MM: " + coreWords.length + " core words");
    return { level: level, confidence: 100, strategies: strategies, strategyCount: strategies.length };
  }

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
            if (text.length > 0) return { element: el, text: text, selector: selector };
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
        callback(new Error('Breadcrumbs timeout'), null);
        return;
      }
      setTimeout(checkBreadcrumbs, 100);
    }
    setTimeout(checkBreadcrumbs, 0);
  }

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX v14-F: SELF-AUDIT — Base name HARUS 0 layer
  // ═══════════════════════════════════════════════════════════
  function auditBaseNames() {
    var bad = [];
    var totalBase = 0;
    Object.keys(ENTITY_BASE_NAMES).forEach(function(ent) {
      ENTITY_BASE_NAMES[ent].forEach(function(bn) {
        totalBase++;
        var layers = countModifierLayers(bn, ent);
        if (layers > 0) {
          bad.push({ ent: ent, base: bn, layers: layers });
        }
      });
    });
    if (bad.length === 0) {
      console.log('✅ FIX v14-F AUDIT PASS: Semua ' + totalBase + ' base name = 0 layer');
    } else {
      console.warn('⚠️ FIX v14-F AUDIT: ' + bad.length + ' / ' + totalBase + ' base name masih punya layer:');
      bad.forEach(function(b) {
        console.warn('  • [' + b.ent + '] "' + b.base + '" → ' + b.layers + ' layer');
      });
    }
    return { total: totalBase, bad: bad.length, details: bad };
  }

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX v14-E: TEST SUITE (dengan update konsisten strict base)
  // ═══════════════════════════════════════════════════════════
  function runTestSuite() {
            var TEST_CASES = [
      // ═══ Regression dasar ═══
      { slug: "jasa urug tanah", entity: "jasa", expect: "money-master" },
      { slug: "jasa gali tanah", entity: "jasa", expect: "money-master" },
      { slug: "jasa angkut tanah", entity: "jasa", expect: "money-master" },
      { slug: "jasa penggalian tanah", entity: "jasa", expect: "money-master" },
      { slug: "jasa pengurugan lahan", entity: "jasa", expect: "money-master" },
      { slug: "jasa pengerukan sungai", entity: "jasa", expect: "money-master" },
      { slug: "jasa pemotongan bukit", entity: "jasa", expect: "money-master" },
      { slug: "jasa desain", entity: "desain", expect: "pillar" },
      { slug: "jasa desain interior", entity: "desain", expect: "money-master" },
      { slug: "jasa pasang pagar", entity: "jasa", expect: "money-master" },
      { slug: "jasa pasang pagar besi", entity: "jasa", expect: "money-page" },
      { slug: "jasa pasang kanopi", entity: "jasa", expect: "money-master" },
      { slug: "jasa pasang pintu", entity: "jasa", expect: "money-master" },
      { slug: "semen jakarta", entity: "material", expect: "money-child" },
      { slug: "pasir jakarta", entity: "material", expect: "money-child" },
      { slug: "batu split jakarta", entity: "material", expect: "money-child" },
      { slug: "semen bandung", entity: "material", expect: "money-child" },
      { slug: "biaya sumur bor berdasarkan kedalaman", entity: "jasa", expect: "money-page" },
      { slug: "faktor penentu biaya jasa bor sumur", entity: "jasa", expect: "money-page" },
      { slug: "cara pasang keramik lantai", entity: "artikel", expect: "money-master" },
      { slug: "panduan pasang pagar panel beton", entity: "artikel", expect: "money-master" },
      { slug: "tips memilih cat tembok", entity: "artikel", expect: "money-master" },
      { slug: "tutorial instalasi listrik rumah", entity: "artikel", expect: "money-master" },
      { slug: "jasa pasang pagar atau kanopi", entity: "jasa", expect: "money-master" },
      { slug: "perbandingan pagar besi atau kayu", entity: "produk", expect: "sub-pillar-tipe-1" },
      { slug: "kelebihan dan kekurangan pagar beton", entity: "produk", expect: "sub-pillar-tipe-1" },
      { slug: "jasa pasang rolling door", entity: "jasa", expect: "money-page" },
      { slug: "jasa coring beton", entity: "jasa", expect: "money-page" },
      { slug: "jasa coring hidrolik", entity: "jasa", expect: "money-page" },
      { slug: "jasa pasang pagar jakarta", entity: "jasa", expect: "money-child" },
      { slug: "semen portland", entity: "material", expect: "money-page" },
      { slug: "sewa excavator mini", entity: "sewa", expect: "money-page" },
      { slug: "desain interior minimalis", entity: "desain", expect: "money-page" },
      { slug: "pagar panel beton k300", entity: "produk", expect: "variant" },
      { slug: "harga pagar panel beton k300", entity: "produk", expect: "variant" },
      { slug: "jasa konstruksi", entity: "jasa", expect: "pillar" },
      { slug: "semen 3 roda", entity: "material", expect: "money-page" },
      { slug: "harga pasir bangka per kubik", entity: "material", expect: "money-page" },
      // FIX 158
      { slug: "harga jasa bor sumur murah", entity: "jasa", expect: "money-master" },
      { slug: "harga jasa bore pile murah", entity: "jasa", expect: "money-master" },
      { slug: "harga jasa pasang pagar hemat", entity: "jasa", expect: "money-master" },
      { slug: "jasa bore pile terjangkau", entity: "jasa", expect: "money-master" },
      { slug: "harga jasa bor sumur bersaing", entity: "jasa", expect: "money-master" },
      { slug: "harga jasa bor sumur kompetitif", entity: "jasa", expect: "money-master" },
      { slug: "harga jasa bor sumur pasaran", entity: "jasa", expect: "money-master" },
      { slug: "jasa coring beton diskon", entity: "jasa", expect: "money-page" },
      { slug: "jasa bor sumur promo", entity: "jasa", expect: "money-page" },
      { slug: "jasa bor sumur diskon", entity: "jasa", expect: "money-page" },
      { slug: "jasa bor sumur termurah", entity: "jasa", expect: "money-page" },
      { slug: "jasa bor sumur termahal", entity: "jasa", expect: "money-page" },
      { slug: "jasa bor beton jakarta", entity: "jasa", expect: "money-child" },
      // FIX 160a
      { slug: "harga jasa bor pile", entity: "jasa", expect: "money-master" },
      { slug: "harga jasa bor strauss", entity: "jasa", expect: "money-master" },
      { slug: "harga jasa cor dak", entity: "jasa", expect: "money-master" },
      { slug: "harga jasa bongkar dinding", entity: "jasa", expect: "money-master" },
      { slug: "harga jasa renovasi rumah", entity: "jasa", expect: "money-master" },
      { slug: "harga jasa renovasi dapur", entity: "jasa", expect: "money-master" },
      { slug: "harga pintu kayu", entity: "produk", expect: "money-page" },
      { slug: "harga pintu aluminium", entity: "produk", expect: "money-page" },
      { slug: "harga pagar stainless", entity: "produk", expect: "money-page" },
      { slug: "harga jendela aluminium", entity: "produk", expect: "money-page" },
      { slug: "harga kanopi alderon", entity: "produk", expect: "money-page" },
      { slug: "harga besi beton ulir", entity: "material", expect: "money-page" },
      { slug: "jasa bore pile beton", entity: "jasa", expect: "money-page" },
      { slug: "harga jasa bore pile beton", entity: "jasa", expect: "money-page" },
      // FIX 161
      { slug: "harga kitchen set", entity: "produk", expect: "money-master" },
      { slug: "harga kitchen set minimalis", entity: "produk", expect: "money-page" },
      { slug: "harga wardrobe", entity: "produk", expect: "money-master" },
      { slug: "harga sofa minimalis", entity: "produk", expect: "money-page" },
      { slug: "harga gazebo kayu", entity: "produk", expect: "money-page" },
      { slug: "harga kolam renang", entity: "produk", expect: "money-master" },
      { slug: "harga pintu rolling door", entity: "produk", expect: "money-page" },
      { slug: "harga pintu kaca", entity: "produk", expect: "money-page" },
      { slug: "harga jendela upvc", entity: "produk", expect: "money-page" },
      { slug: "harga pagar wpc", entity: "produk", expect: "money-page" },
      { slug: "harga plafon kalsiboard", entity: "produk", expect: "money-page" },
      { slug: "harga plafon shunda", entity: "produk", expect: "money-page" },
      { slug: "harga lantai vinyl", entity: "produk", expect: "money-page" },
      { slug: "harga atap shingle", entity: "produk", expect: "money-page" },
      { slug: "harga saklar listrik", entity: "produk", expect: "money-master" },
      // MATERIAL
      { slug: "harga semen mortar", entity: "material", expect: "money-page" },
      { slug: "harga semen instan", entity: "material", expect: "money-page" },
      { slug: "harga pasir cor", entity: "material", expect: "money-page" },
      { slug: "harga pasir plester", entity: "material", expect: "money-page" },
      { slug: "harga batu templek", entity: "material", expect: "money-page" },
      { slug: "harga kawat beton", entity: "material", expect: "money-page" },
      { slug: "harga kayu kruing", entity: "material", expect: "money-page" },
      { slug: "harga pipa pvc", entity: "material", expect: "money-page" },
      { slug: "harga kabel listrik", entity: "material", expect: "money-page" },
      { slug: "harga fitting pvc", entity: "material", expect: "money-page" },
      { slug: "harga cat waterproof", entity: "material", expect: "money-page" },
      { slug: "harga vernis kayu", entity: "material", expect: "money-page" },
      { slug: "harga aquaproof", entity: "material", expect: "money-master" },
      { slug: "harga no drop", entity: "material", expect: "money-master" },
      { slug: "harga beton readymix", entity: "material", expect: "money-page" },
      // SEWA
      { slug: "harga sewa forklift 3 ton", entity: "sewa", expect: "money-page" },
      { slug: "harga sewa forklift listrik", entity: "sewa", expect: "money-page" },
      { slug: "harga sewa boom lift", entity: "sewa", expect: "money-master" },
      { slug: "harga sewa skylift", entity: "sewa", expect: "money-master" },
      { slug: "harga sewa scissor lift", entity: "sewa", expect: "money-master" },
      { slug: "harga sewa concrete mixer", entity: "sewa", expect: "money-master" },
      { slug: "harga sewa molen beton", entity: "sewa", expect: "money-master" },
      { slug: "harga sewa vibrator beton", entity: "sewa", expect: "money-master" },
      { slug: "harga sewa stamper kodok", entity: "sewa", expect: "money-master" },
      { slug: "harga sewa pompa celup", entity: "sewa", expect: "money-master" },
      { slug: "harga sewa kompresor angin", entity: "sewa", expect: "money-master" },
      // DESAIN
      { slug: "harga desain interior restoran", entity: "desain", expect: "money-page" },
      { slug: "harga desain interior hotel", entity: "desain", expect: "money-page" },
      { slug: "harga desain interior apartemen", entity: "desain", expect: "money-page" },
      { slug: "harga desain rumah tropis", entity: "desain", expect: "money-page" },
      { slug: "harga desain rumah scandinavian", entity: "desain", expect: "money-page" },
      { slug: "harga desain rumah 2 lantai", entity: "desain", expect: "money-page" },
      { slug: "harga desain rumah type 36", entity: "desain", expect: "money-page" },
      { slug: "harga desain ruang tamu", entity: "desain", expect: "money-master" },
      { slug: "harga desain dapur minimalis", entity: "desain", expect: "money-page" },
      { slug: "harga desain walk in closet", entity: "desain", expect: "money-master" },
      { slug: "harga desain showroom", entity: "desain", expect: "money-master" },
      { slug: "harga desain kolam renang", entity: "desain", expect: "money-master" },
      { slug: "harga gambar arsitektur", entity: "desain", expect: "money-master" },
      { slug: "harga gambar kerja", entity: "desain", expect: "money-master" },
      // FIX 150
      { slug: "harga rental excavator", entity: "sewa", expect: "money-master" },
      { slug: "harga bahan pasir", entity: "material", expect: "money-master" },
      { slug: "harga bahan material pasir", entity: "material", expect: "money-master" },
      // FIX 151
      { slug: "harga sewa excavator", entity: "sewa", expect: "money-master" },
      { slug: "harga sewa alat berat", entity: "sewa", expect: "money-master" },
      { slug: "harga desain interior", entity: "desain", expect: "money-master" },
      { slug: "harga sewa excavator mini", entity: "sewa", expect: "money-page" },
      { slug: "harga pasir bangka", entity: "material", expect: "money-page" },
      { slug: "harga jasa bor sumur", entity: "jasa", expect: "money-master" },
      // FIX 155
      { slug: "harga jasa pasang pagar minimalis", entity: "jasa", expect: "money-page" },
      { slug: "harga jasa pasang kanopi modern", entity: "jasa", expect: "money-page" },
      { slug: "harga jasa pasang pintu klasik", entity: "jasa", expect: "money-page" },
      { slug: "harga jasa renovasi custom", entity: "jasa", expect: "money-page" },
      { slug: "harga jasa pasang pagar premium", entity: "jasa", expect: "money-page" },
      { slug: "harga jasa pasang kanopi elegan", entity: "jasa", expect: "money-page" },
      // FIX 156
      { slug: "harga baja ringan", entity: "material", expect: "money-master" },
      { slug: "harga pagar panel beton", entity: "produk", expect: "money-page" },
      // FIX 154
      { slug: "harga jasa coring hidrolik", entity: "jasa", expect: "money-page" },
      { slug: "harga pagar panel beton putih", entity: "produk", expect: "money-page" },
      { slug: "harga besi beton sni", entity: "material", expect: "money-page" },
      { slug: "harga sewa genset 100kva", entity: "sewa", expect: "money-page" },
      { slug: "harga desain interior mewah", entity: "desain", expect: "money-page" },
      // FIX 162c-d
      { slug: "harga jasa bor pancang", entity: "jasa", expect: "money-master" },
      { slug: "harga sofa modern", entity: "produk", expect: "money-page" },
      { slug: "harga sewa forklift diesel", entity: "sewa", expect: "money-page" },
      { slug: "harga sewa genset solar", entity: "sewa", expect: "money-page" },
      // FIX 163-164
      { slug: "jasa pasang pagar atau kanopi", entity: "jasa", expect: "money-master" },
      { slug: "jasa pasang pagar atau kanopi besi", entity: "jasa", expect: "sub-pillar-tipe-1" },
      { slug: "jasa pasang pagar besi", entity: "jasa", expect: "money-page" },
      { slug: "jasa pasang kanopi besi", entity: "jasa", expect: "money-page" },
      { slug: "jasa pasang pagar dan kanopi", entity: "jasa", expect: "money-page" },
      { slug: "jasa bongkar dan pasang keramik", entity: "jasa", expect: "money-page" },
      { slug: "jasa urug dan gali tanah", entity: "jasa", expect: "money-page" },
      { slug: "harga jasa pasang pagar dan kanopi", entity: "jasa", expect: "money-page" },
      // FIX 166
      { slug: "harga desain rumah tropis 2 lantai", entity: "desain", expect: "variant" },
      // FIX 168
      { slug: "harga jasa pasang dinding", entity: "jasa", expect: "money-master" },
      { slug: "harga jasa pasang grc dinding", entity: "jasa", expect: "money-page" },
      { slug: "harga jasa pasang hpl dinding", entity: "jasa", expect: "money-page" },
      // FIX 177
      { slug: "jasa bor promo", entity: "jasa", expect: "money-page" },
      { slug: "jasa bor diskon", entity: "jasa", expect: "money-page" },
      { slug: "jasa bor termurah", entity: "jasa", expect: "money-page" },
      { slug: "jasa bor termahal", entity: "jasa", expect: "money-page" },
      { slug: "jasa bor murah", entity: "jasa", expect: "money-master" },
      { slug: "jasa bor hemat", entity: "jasa", expect: "money-master" },
      { slug: "jasa bor terjangkau", entity: "jasa", expect: "money-master" },
      { slug: "harga jasa bor promo", entity: "jasa", expect: "money-page" },
      { slug: "harga jasa bor murah", entity: "jasa", expect: "money-master" },
      { slug: "biaya jasa coring hidrolik", entity: "jasa", expect: "money-page" },
      { slug: "harga jasa bor jakarta", entity: "jasa", expect: "money-child" },
      { slug: "jasa pasang keramik 80x80", entity: "jasa", expect: "money-page" },
      { slug: "jasa pasang marmer 60x120", entity: "jasa", expect: "money-page" },
      { slug: "jasa bor murah dan terjangkau", entity: "jasa", expect: "money-master" },
      { slug: "jasa bor promo dan diskon", entity: "jasa", expect: "money-page" },
      // FIX 178
      { slug: "jasa coring hidrolik", entity: "jasa", expect: "money-page" },
      { slug: "jasa pengeboran hidrolik", entity: "jasa", expect: "money-page" },
      { slug: "jasa bor manual", entity: "jasa", expect: "money-page" },
      { slug: "jasa coring manual", entity: "jasa", expect: "money-page" },
      { slug: "jasa pengeboran rotary", entity: "jasa", expect: "money-page" },
      { slug: "jasa pengeboran auger", entity: "jasa", expect: "money-page" },
      { slug: "jasa coring basah", entity: "jasa", expect: "money-page" },
      { slug: "jasa coring kering", entity: "jasa", expect: "money-page" },
      { slug: "jasa coring komersial", entity: "jasa", expect: "money-page" },
      { slug: "jasa bor sumur industri", entity: "jasa", expect: "money-page" },
      { slug: "biaya jasa coring hidrolik", entity: "jasa", expect: "money-page" },
      { slug: "harga jasa bor manual", entity: "jasa", expect: "money-page" },
      { slug: "jasa coring polos", entity: "jasa", expect: "money-page" },
      // FIX 179r
      { slug: "jasa coring hidrolik 30cm", entity: "jasa", expect: "variant" },
      { slug: "jasa bor manual 50cm", entity: "jasa", expect: "variant" },
      { slug: "jasa coring komersial 30cm", entity: "jasa", expect: "variant" },
      { slug: "jasa pengeboran rotary 40cm", entity: "jasa", expect: "variant" },
      { slug: "jasa coring hidrolik 30cm 50cm", entity: "jasa", expect: "sub-variant" },
      { slug: "jasa coring hidrolik 60x60 cm", entity: "jasa", expect: "sub-variant" },
      // FIX 181
      { slug: "jasa bor termurah", entity: "jasa", expect: "money-page" },
      { slug: "jasa bor termahal", entity: "jasa", expect: "money-page" },
      { slug: "jasa coring termurah", entity: "jasa", expect: "money-page" },
      // FIX 182
      { slug: "jasa coring beton", entity: "jasa", expect: "money-page" },
      { slug: "jasa bor kayu", entity: "jasa", expect: "money-page" },
      { slug: "jasa grouting beton", entity: "jasa", expect: "money-page" },
      { slug: "jasa pemancangan beton", entity: "jasa", expect: "money-page" },
      { slug: "harga jasa coring beton", entity: "jasa", expect: "money-page" },
      // FIX 183/186
      { slug: "jasa coring", entity: "jasa", expect: "money-master" },
      { slug: "jasa bor", entity: "jasa", expect: "money-master" },
      { slug: "jasa pasang keramik", entity: "jasa", expect: "money-master" },
      { slug: "jasa coring hidrolik", entity: "jasa", expect: "money-page" },
      { slug: "jasa coring 30cm", entity: "jasa", expect: "money-page" },
      { slug: "jasa pasang keramik 60x60", entity: "jasa", expect: "money-page" },
      { slug: "jasa coring hidrolik 30cm", entity: "jasa", expect: "variant" },
      { slug: "jasa coring hidrolik beton", entity: "jasa", expect: "variant" },
      { slug: "jasa coring 30cm 50cm", entity: "jasa", expect: "variant" },
      { slug: "jasa pasang keramik 60x60 cm", entity: "jasa", expect: "variant" },
      { slug: "jasa coring hidrolik 30cm beton", entity: "jasa", expect: "sub-variant" },
      { slug: "jasa coring hidrolik 60x60 cm", entity: "jasa", expect: "sub-variant" },
      // PRODUK material modifier
      { slug: "pagar panel", entity: "produk", expect: "money-master" },
      { slug: "pagar panel beton", entity: "produk", expect: "money-page" },
      { slug: "pagar panel beton k300", entity: "produk", expect: "variant" },
      { slug: "pagar panel beton putih", entity: "produk", expect: "variant" },
      { slug: "pagar panel beton ulir", entity: "produk", expect: "variant" },
      { slug: "pagar panel beton k300 putih", entity: "produk", expect: "sub-variant" },
      { slug: "pagar panel beton k300 putih ulir", entity: "produk", expect: "sub-variant" },
      { slug: "kitchen set", entity: "produk", expect: "money-master" },
      { slug: "kitchen set minimalis", entity: "produk", expect: "money-page" },
      { slug: "kitchen set minimalis modern", entity: "produk", expect: "variant" },
      // MATERIAL
      { slug: "semen", entity: "material", expect: "money-master" },
      { slug: "semen portland", entity: "material", expect: "money-page" },
      { slug: "semen 50kg", entity: "material", expect: "money-page" },
      { slug: "semen sni", entity: "material", expect: "money-page" },
      { slug: "semen portland 50kg", entity: "material", expect: "variant" },
      { slug: "semen portland 50kg sni", entity: "material", expect: "sub-variant" },
      { slug: "keramik", entity: "material", expect: "money-master" },
      { slug: "keramik 60x60", entity: "material", expect: "money-page" },
      { slug: "keramik 60x60 cm", entity: "material", expect: "variant" },
      // SEWA
      { slug: "sewa excavator", entity: "sewa", expect: "money-master" },
      { slug: "sewa excavator mini", entity: "sewa", expect: "money-page" },
      { slug: "sewa excavator pc75", entity: "sewa", expect: "money-page" },
      { slug: "sewa excavator mini pc75", entity: "sewa", expect: "variant" },
      { slug: "sewa excavator mini pc75 harian", entity: "sewa", expect: "sub-variant" },
      { slug: "sewa crane 25 ton", entity: "sewa", expect: "money-page" },
      { slug: "sewa genset 100kva", entity: "sewa", expect: "money-page" },
      { slug: "sewa genset 100kva diesel", entity: "sewa", expect: "variant" },
      // DESAIN
      { slug: "desain interior", entity: "desain", expect: "money-master" },
      { slug: "desain interior minimalis", entity: "desain", expect: "money-page" },
      { slug: "desain interior kayu", entity: "desain", expect: "money-page" },
      { slug: "desain interior minimalis modern", entity: "desain", expect: "variant" },
      { slug: "desain interior minimalis kayu", entity: "desain", expect: "variant" },
      { slug: "desain interior minimalis modern kayu", entity: "desain", expect: "sub-variant" },
      // FIX 185
      { slug: "jasa bor promo", entity: "jasa", expect: "money-page" },
      { slug: "jasa coring diskon", entity: "jasa", expect: "money-page" },
      { slug: "jasa coring obral", entity: "jasa", expect: "money-page" },
      // FIX 190-193
      { slug: "jasa coring jakarta", entity: "jasa", expect: "money-child" },
      { slug: "jasa coring hidrolik jakarta", entity: "jasa", expect: "money-child" },
      { slug: "jasa coring 30cm jakarta", entity: "jasa", expect: "money-child" },
      { slug: "jasa coring hidrolik 30cm jakarta", entity: "jasa", expect: "money-child" },
      // FIX 195
      { slug: "jasa cutting dinding", entity: "jasa", expect: "money-page" },
      { slug: "jasa cutting lantai", entity: "jasa", expect: "money-page" },
      { slug: "jasa cutting plat", entity: "jasa", expect: "money-page" },
      { slug: "jasa cutting kolom", entity: "jasa", expect: "money-page" },
      { slug: "jasa coring dinding", entity: "jasa", expect: "money-page" },
      { slug: "jasa bor lantai", entity: "jasa", expect: "money-page" },
      { slug: "jasa bongkar dinding", entity: "jasa", expect: "money-master" },
      { slug: "jasa coring lantai beton", entity: "jasa", expect: "variant" },
      { slug: "jasa cutting beton dinding", entity: "jasa", expect: "variant" },
      { slug: "jasa cutting aspal jalan", entity: "jasa", expect: "variant" },
      // FIX 196
      { slug: "jasa cutting beton beton", entity: "jasa", expect: "money-page" },
      { slug: "pagar panel beton putih putih", entity: "produk", expect: "variant" },
      // FIX 197
      { slug: "jasa cutting alderon", entity: "jasa", expect: "money-page" },
      { slug: "jasa cutting xyz", entity: "jasa", expect: "money-page" },
      { slug: "jasa coring material baru", entity: "jasa", expect: "variant" },
      // FIX 198
      { slug: "jasa cutting beton dinding", entity: "jasa", expect: "variant" },
      // Hierarki
      { slug: "jasa cutting dinding jakarta", entity: "jasa", expect: "money-child" },
      { slug: "jasa cutting beton dinding jakarta", entity: "jasa", expect: "money-child" },
      { slug: "jasa coring hidrolik 30cm beton dinding", entity: "jasa", expect: "sub-variant" },
      // FIX 200-206
      { slug: "semen", entity: "material", expect: "money-master" },
      { slug: "semen portland", entity: "material", expect: "money-page" },
      { slug: "harga semen portland", entity: "material", expect: "money-page" },
      { slug: "semen portland 50kg", entity: "material", expect: "variant" },
      { slug: "pasir", entity: "material", expect: "money-master" },
      { slug: "pasir bangka", entity: "material", expect: "money-page" },
      { slug: "batu", entity: "material", expect: "money-master" },
      { slug: "batu split", entity: "material", expect: "money-page" },
      { slug: "sewa excavator", entity: "sewa", expect: "money-master" },
      { slug: "sewa genset", entity: "sewa", expect: "money-master" },
      { slug: "semen", entity: null, expect: "money-master" },
      { slug: "keramik", entity: null, expect: "money-master" },
      { slug: "jasa pasang keramik", entity: "jasa", expect: "money-master" },
      { slug: "harga jasa pasang keramik", entity: "jasa", expect: "money-master" },
      { slug: "jasa pasang granit", entity: "jasa", expect: "money-master" },
      { slug: "jasa pasang marmer", entity: "jasa", expect: "money-master" },
      { slug: "harga jasa coring", entity: "jasa", expect: "money-master" },
      { slug: "jasa coring", entity: "jasa", expect: "money-master" },
      { slug: "jasa coring beton jakarta", entity: "jasa", expect: "money-child" },
      // FIX 208-213
      { slug: "harga semen portland", entity: "material", expect: "money-page" },
      { slug: "harga pasir bangka", entity: "material", expect: "money-page" },
      { slug: "biaya jasa coring hidrolik", entity: "jasa", expect: "money-page" },
      { slug: "harga sewa genset 100kva", entity: "sewa", expect: "money-page" },
      { slug: "harga pasir bangka per kubik", entity: "material", expect: "money-page" },
      { slug: "keramik", entity: "material", expect: "money-master" },
      { slug: "keramik 60x60", entity: "material", expect: "money-page" },
      { slug: "keramik 60x60 cm", entity: "material", expect: "variant" },
      { slug: "granit 60x60", entity: "material", expect: "money-page" },
      // FIX 215-219
      { slug: "jasa coring hidrolik promo", entity: "jasa", expect: "money-page" },
      { slug: "jasa coring hidrolik diskon", entity: "jasa", expect: "money-page" },
      { slug: "jasa coring hidrolik termurah", entity: "jasa", expect: "money-page" },
      { slug: "jasa bor tanah murah", entity: "jasa", expect: "money-page" },
      { slug: "jasa bor beton hemat", entity: "jasa", expect: "money-page" },
      { slug: "jasa coring beton terjangkau", entity: "jasa", expect: "money-page" },
      { slug: "jasa bor horizontal tanah", entity: "jasa", expect: "money-page" },
      { slug: "jasa bor horizontal", entity: "jasa", expect: "money-master" },
      { slug: "desain interior rumah minimalis", entity: "desain", expect: "money-page" },
      { slug: "desain interior rumah minimalis modern", entity: "desain", expect: "variant" },
      // FIX SEO v6/v13
      { slug: "spun pile", entity: "produk", expect: "money-master" },
      { slug: "spun pile beton", entity: "produk", expect: "money-page" },
      { slug: "harga spun pile beton", entity: "produk", expect: "money-page" },
      { slug: "harga spun pile 30x30", entity: "produk", expect: "money-page" },
      { slug: "jasa spun pile", entity: "jasa", expect: "money-master" },
      { slug: "jasa spun pile beton", entity: "jasa", expect: "money-page" },
      { slug: "jasa pancang spun pile", entity: "jasa", expect: "money-master" },
      { slug: "sheet pile", entity: "produk", expect: "money-master" },
      { slug: "sheet pile beton", entity: "produk", expect: "money-page" },
      { slug: "jasa sheet pile", entity: "jasa", expect: "money-master" },
      { slug: "jasa pasang sheet pile", entity: "jasa", expect: "money-master" },
      { slug: "mini pile", entity: "produk", expect: "money-master" },
      { slug: "mini pile beton", entity: "produk", expect: "money-page" },
      { slug: "jasa mini pile", entity: "jasa", expect: "money-master" },
      { slug: "tiang pancang", entity: "produk", expect: "money-master" },
      { slug: "tiang pancang beton", entity: "produk", expect: "money-page" },
      { slug: "jasa tiang pancang", entity: "jasa", expect: "money-master" },
      { slug: "jasa pancang beton", entity: "jasa", expect: "money-master" },
      { slug: "spun pile beton", entity: null, expect: "money-page" },
      { slug: "jasa spun pile beton", entity: null, expect: "money-page" },
      // FIX SEO v13 cleanup
      { slug: "buis beton", entity: "produk", expect: "money-master" },
      { slug: "buis beton bertulang", entity: "produk", expect: "money-page" },
      { slug: "buis beton biasa 30cm", entity: "produk", expect: "variant" },
      { slug: "spun pile beton 30x30", entity: "produk", expect: "variant" },
      { slug: "half slab", entity: "produk", expect: "money-master" },
      { slug: "half slab beton", entity: "produk", expect: "money-page" },
      // FIX SEO v9
      { slug: "jasa desain interior minimalis", entity: "desain", expect: "money-page" },
      { slug: "jasa desain rumah tropis", entity: "desain", expect: "money-page" },
      { slug: "jasa desain rumah minimalis", entity: "desain", expect: "money-page" },
      { slug: "jasa desain interior kamar mandi minimalis", entity: "desain", expect: "money-page" },
      { slug: "layanan desain interior minimalis", entity: "desain", expect: "money-page" },
      { slug: "toko desain interior minimalis", entity: "desain", expect: "money-page" },
      { slug: "harga desain interior kamar mandi", entity: "desain", expect: "money-page" },
      { slug: "harga desain interior taman", entity: "desain", expect: "money-page" },
      { slug: "harga desain interior rumah minimalis", entity: "desain", expect: "money-page" },
      { slug: "desain interior kamar mandi", entity: "desain", expect: "money-master" },
      { slug: "desain interior kamar mandi minimalis", entity: "desain", expect: "money-page" },
      { slug: "desain interior kamar tidur", entity: "desain", expect: "money-master" },
      { slug: "desain interior ruang tamu", entity: "desain", expect: "money-master" },
      // FIX SEO v12
      { slug: "pagar panel", entity: "produk", expect: "money-master" },
      { slug: "pagar panel beton", entity: "produk", expect: "money-page" },
      { slug: "pagar panel besi", entity: "produk", expect: "money-page" },
      { slug: "pagar panel stainless", entity: "produk", expect: "money-page" },
      { slug: "pagar panel beton minimalis", entity: "produk", expect: "variant" },
      { slug: "u ditch", entity: "produk", expect: "money-master" },
      { slug: "u ditch 30x30", entity: "produk", expect: "money-page" },
      { slug: "u ditch beton", entity: "produk", expect: "money-page" },
      { slug: "box culvert", entity: "produk", expect: "money-master" },
      { slug: "box culvert 100x100", entity: "produk", expect: "money-page" },
      { slug: "pagar panel", entity: null, expect: "money-master" },
      { slug: "pagar panel beton", entity: null, expect: "money-page" },
      // ═══ FIX v14-G/H/J: REGRESI tukang-sumur-bor ═══
      { slug: "tukang sumur bor", entity: "jasa", expect: "money-master" },
      { slug: "tukang sumur bor borongan", entity: "jasa", expect: "money-page" },
      { slug: "tukang sumur bor proyek", entity: "jasa", expect: "money-page" },
      { slug: "tukang sumur bor dalam", entity: "jasa", expect: "money-page" },
      { slug: "tukang sumur bor dangkal", entity: "jasa", expect: "money-page" },
      { slug: "tukang sumur bor jet pump", entity: "jasa", expect: "money-page" },
      { slug: "tukang sumur bor artesis", entity: "jasa", expect: "money-page" },
      { slug: "tukang sumur bor manual", entity: "jasa", expect: "money-page" },
      { slug: "tukang sumur bor hidrolik", entity: "jasa", expect: "money-page" },
      { slug: "tukang sumur bor rotary", entity: "jasa", expect: "money-page" },
      { slug: "tukang sumur bor rumahan", entity: "jasa", expect: "money-page" },
      { slug: "tukang sumur bor industri", entity: "jasa", expect: "money-page" },
      { slug: "tukang sumur bor perumahan", entity: "jasa", expect: "money-page" },
      // FIX v14-I: prefix fungsional
      { slug: "spesifikasi jasa sumur bor", entity: "jasa", expect: "money-page" },
      { slug: "mutu jasa sumur bor", entity: "jasa", expect: "money-page" },
      { slug: "metode jasa bore pile", entity: "jasa", expect: "money-page" },
      { slug: "mutu jasa bore pile", entity: "jasa", expect: "money-page" },
      { slug: "spesifikasi jasa bore pile", entity: "jasa", expect: "money-page" },
      // ═══ FIX v14-L/M/N/O/P/Q: REGRESI PATCH v23.9.3 ═══
      // Produk head term baru
      { slug: "railing tangga", entity: "produk", expect: "money-master" },
      { slug: "railing tangga stainless", entity: "produk", expect: "money-page" },
      { slug: "wastafel", entity: "produk", expect: "money-master" },
      { slug: "gerbang besi", entity: "produk", expect: "money-page" },
      { slug: "gorden", entity: "produk", expect: "money-master" },
      { slug: "rak dinding", entity: "produk", expect: "money-master" },
      // Produk dengan tipe modifier (FIX v14-O)
      { slug: "pintu geser", entity: "produk", expect: "money-page" },
      { slug: "pintu lipat", entity: "produk", expect: "money-page" },
      { slug: "jendela casement", entity: "produk", expect: "money-page" },
      { slug: "jendela sliding", entity: "produk", expect: "money-page" },
      // Material fastener
      { slug: "harga paku beton", entity: "material", expect: "money-page" },
      { slug: "harga wiremesh", entity: "material", expect: "money-master" },
      { slug: "harga kawat beton", entity: "material", expect: "money-page" },
      { slug: "harga baut", entity: "material", expect: "money-master" },
      // Sewa baru
      { slug: "sewa scaffolding", entity: "sewa", expect: "money-master" },
      { slug: "sewa scaffolding 3 bulan", entity: "sewa", expect: "money-page" },
      { slug: "sewa steger", entity: "sewa", expect: "money-master" },
      { slug: "sewa tower lamp", entity: "sewa", expect: "money-master" },
      // Desain scope baru
      { slug: "desain kos", entity: "desain", expect: "money-master" },
      { slug: "desain kos minimalis", entity: "desain", expect: "money-page" },
      { slug: "desain guest house", entity: "desain", expect: "money-master" },
      { slug: "desain pujasera", entity: "desain", expect: "money-master" },
      // JASA teknik baru
      { slug: "jasa pembersihan lahan", entity: "jasa", expect: "money-master" },
      { slug: "jasa pengaspalan", entity: "jasa", expect: "money-master" },
      { slug: "jasa aspal hotmix", entity: "jasa", expect: "money-page" },
      // FIX v14-P: checkHasBaseService regex extended
      { slug: "cutting dinding jakarta", entity: "jasa", expect: "money-child" },
      { slug: "coring dinding jakarta", entity: "jasa", expect: "money-child" },
      { slug: "jasa coring dinding jakarta", entity: "jasa", expect: "money-child" },
      // FIX v14-Q: ENTITY_ONLY_WORDS
      { slug: "layanan bor sumur", entity: "jasa", expect: "money-master" },
      { slug: "service ac", entity: "jasa", expect: "money-master" },
      // FIX A-1 rev + A-7: regresi pagar
      { slug: "pagar", entity: "produk", expect: "money-master" },
      { slug: "pagar panel", entity: "produk", expect: "money-master" },
      { slug: "pagar beton", entity: "produk", expect: "money-master" },
      { slug: "pagar brc", entity: "produk", expect: "money-master" },
      { slug: "pagar besi", entity: "produk", expect: "money-page" },
      { slug: "pagar kayu", entity: "produk", expect: "money-page" },
      { slug: "pagar stainless", entity: "produk", expect: "money-page" },
      { slug: "pagar panel beton", entity: "produk", expect: "money-page" },
      // ═══ FIX v14-T: REGRESI 0-CORE BASE NAME ═══
      // Base jasa yang core=0 (semua sudah di-strip) → harus MM
      { slug: "las besi", entity: "jasa", expect: "money-master" },
      { slug: "las pagar", entity: "jasa", expect: "money-master" },
      { slug: "las kanopi", entity: "jasa", expect: "money-master" },
      { slug: "cor dak", entity: "jasa", expect: "money-master" },
      { slug: "cor jalan", entity: "jasa", expect: "money-master" },
      { slug: "cor lantai", entity: "jasa", expect: "money-master" },
      { slug: "pasang railing", entity: "jasa", expect: "money-master" },
      { slug: "pasang tangga", entity: "jasa", expect: "money-master" },
      { slug: "pasang gerbang", entity: "jasa", expect: "money-master" },
      { slug: "aspal jalan", entity: "jasa", expect: "money-master" },
      { slug: "instalasi internet", entity: "jasa", expect: "money-master" },
      { slug: "pemasangan wifi", entity: "jasa", expect: "money-master" },
      { slug: "pembuatan kanopi", entity: "jasa", expect: "money-master" },
      { slug: "pembuatan pagar", entity: "jasa", expect: "money-master" },
      { slug: "pembuatan railing", entity: "jasa", expect: "money-master" }
    ];
     
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🧪 PLD v23.9.2 — TEST SUITE (" + TEST_CASES.length + " CASE)");
    console.log("═══════════════════════════════════════════════════════════");

    var passed = 0, failed = 0, failures = [];
    for (var i = 0; i < TEST_CASES.length; i++) {
      var test = TEST_CASES[i];
      if (!test || !test.slug) continue;
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
        console.log("✅ " + test.slug + " → " + actual);
      } else {
        failed++;
        failures.push(test);
        console.log("❌ " + test.slug + " → " + actual + " (expect: " + test.expect + ")");
      }
    }
    console.log("═══════════════════════════════════════════════════════════");
    console.log("📊 HASIL: " + passed + " PASSED / " + failed + " FAILED");
    console.log("═══════════════════════════════════════════════════════════");
    if (failed > 0) {
      console.log("🚨 FAILURES:");
      failures.forEach(function(f) {
        console.log("   • " + f.slug + " → expect: " + f.expect);
      });
    }
    return { total: TEST_CASES.length, passed: passed, failed: failed, failures: failures };
  }

  // ═══════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════

  function initializeCore() {
    log('🧠 Core functions ready', 'CORE');

    window.pageLevelDetectorv22 = {
      version: "23.9.2",
      CONFIG: CONFIG,

      detect: detectPageLevel,
      detectFromDOM: detectPageLevelFromDOM,
      detectForPrompt: detectForPrompt,
      detectForPromptFull: detectForPromptFull,
      detectForPromptWithUpward: detectForPromptWithUpward,
      detectForPromptWithAI: detectForPromptWithAI,
      validateForPrompt: validateForPrompt,
      detectPageLevelForPrompt: detectPageLevelForPrompt,

      detectUpwardFromSlug: detectUpwardFromSlug,
      detectBreadcrumbsFromSlug: detectBreadcrumbsFromSlug,
      detectParentFromSlug: detectParentFromSlug,
      detectParentLevelFromSlug: detectParentLevelFromSlug,
      computeBreadcrumbLevels: computeBreadcrumbLevels,
      validateBreadcrumbHierarchy: validateBreadcrumbHierarchy,
      validateParentDrivenHierarchy: validateParentDrivenHierarchy,
      EXPECTED_CHILD_MAP: EXPECTED_CHILD_MAP,
      findBreadcrumbs: findBreadcrumbs,
      waitForBreadcrumbs: waitForBreadcrumbs,

      VALID_LEVELS: VALID_LEVELS,
      TYPE_LEVEL_MAP: TYPE_LEVEL_MAP,
      VALID_ENTITY_TYPES: VALID_ENTITY_TYPES,
      ENTITY_PILLAR_NAMES: ENTITY_PILLAR_NAMES,

      detectEntityType: detectEntityType,

      getFactors: getFactors,
      getSEOContext: getSEOContext,
      isLocation: isLocation,
      checkHasSpecification: checkHasSpecification,
      checkPureTechnicalSpec: checkPureTechnicalSpec,
      checkHasCommercial: checkHasCommercial,
      checkHasPrice: checkHasPrice,
      checkHasPromoModifier: checkHasPromoModifier,
      detectContentSignalsFromSlug: detectContentSignalsFromSlug,
      checkHasJasaMetode: checkHasJasaMetode,
      checkHasPerUnit: checkHasPerUnit,
      checkHasQuestionWord: checkHasQuestionWord,
      checkHasCommercialInvestigation: checkHasCommercialInvestigation,
      checkFreeContext: checkFreeContext,
      checkHasAuthority: checkHasAuthority,
      checkHasReadyStock: checkHasReadyStock,
      checkHasSpecPhrase: checkHasSpecPhrase,
      checkHasInformationalSpecPhrase: checkHasInformationalSpecPhrase,
      checkHasBaseService: checkHasBaseService,
      checkHasMarketingTerm: checkHasMarketingTerm,
      checkFisikRole: checkFisikRole,
      checkCompoundAction: checkCompoundAction,
      calculateComplexityScore: calculateComplexityScore,
      isBaseName: isBaseName,
      isSubVariant: isSubVariant,
      getCoreWords: getCoreWords,
      normalizeVerbVariations: normalizeVerbVariations,
      isApplicationTarget: isApplicationTarget,

      countModifierLayers: countModifierLayers,
      getCategoryDefs: getCategoryDefs,
      decideLevelByLayers: decideLevelByLayers,
      hasJasaMaterialCtx: hasJasaMaterialCtx,
      flagAmbiguous: flagAmbiguous,
      APPLICATION_TARGETS_FULL: APPLICATION_TARGETS_FULL,
      auditBaseNames: auditBaseNames,   // 🔥 FIX v14-F

      detectIntent: detectIntent,
      detectEEATSignals: detectEEATSignals,
      detectContentStructure: detectContentStructure,
      detectFeaturedSnippetOpportunity: detectFeaturedSnippetOpportunity,
      detectSemanticClusters: detectSemanticClusters,
      generateRecommendations: generateRecommendations,
      calculateSEOScore: calculateSEOScore,
      getConfidenceScore: getConfidenceScore,

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

      callAIProxy: callAIProxy,
      calculatePLDConfidence: calculatePLDConfidence,
      detectPageLevelWithAI: detectPageLevelWithAI,

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

        var result = { pageLevel: level, pageLevelNum: TYPE_LEVEL_MAP[level] || 0, seoScore: seoScore, breadcrumb: null };

        if (waitForBreadcrumb) {
          return new Promise(function(resolve) {
            waitForBreadcrumbs(function(err, breadcrumb) {
              if (err || !breadcrumb) { resolve(result); return; }
              result.breadcrumb = breadcrumb;
              try {
                document.body.setAttribute("data-has-breadcrumb", "true");
                document.body.setAttribute("data-breadcrumb-selector", breadcrumb.selector);
              } catch (e) {}
              resolve(result);
            });
          });
        }
        return result;
      },

      runTestSuite: runTestSuite,

      // DATA EXPORT
      JASA_WORDS: JASA_WORDS,
      COMMON_JASA_WORDS: COMMON_JASA_WORDS,
      SEWA_WORDS: SEWA_WORDS,
      MATERIAL_WORDS: MATERIAL_WORDS,
      PRODUK_WORDS: PRODUK_WORDS,
      DESAIN_WORDS: DESAIN_WORDS,
      ENTITY_BASE_NAMES: ENTITY_BASE_NAMES,
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
      MATERIAL_TYPE_WORDS: MATERIAL_TYPE_WORDS,
      ACTION_VERBS: ACTION_VERBS,
      FISIK_WORDS: FISIK_WORDS,
      OBJECT_WORDS: OBJECT_WORDS,
      BASE_ENTITY_OBJECTS: BASE_ENTITY_OBJECTS,
      GENERIC_OBJECTS: GENERIC_OBJECTS,
      MATERIAL_SERVICE_NAMES: MATERIAL_SERVICE_NAMES,
      CROSS_ENTITY_SPECS: CROSS_ENTITY_SPECS,
      SATUAN_UNITS: SATUAN_UNITS,
      COMMERCIAL_WORDS: COMMERCIAL_WORDS,
      INFORMATIONAL_WORDS: INFORMATIONAL_WORDS,
      HIGH_VOLUME_WORDS: HIGH_VOLUME_WORDS,
      //SIZE_WORDS: SIZE_WORDS,
      TIER_1_LOCATION: TIER_1_LOCATION,
      LOCATION_WORDS: LOCATION_WORDS,
      PRICE_WORDS: PRICE_WORDS,
      PRICE_HEAD_WORDS: PRICE_HEAD_WORDS,
      PROMO_MODIFIER_WORDS: PROMO_MODIFIER_WORDS,
      SEMANTIC_CLUSTERS: SEMANTIC_CLUSTERS,
      SPEC_PHRASE_INFORMATIONAL: SPEC_PHRASE_INFORMATIONAL,
      cleanText: cleanText,
      extractSlugFromInput: extractSlugFromInput
    };

    window.pageLevelDetectorv22Ready = true;
    try { window.dispatchEvent(new Event("pageLevelDetectorv22Ready")); }
    catch (e) {
      try {
        var event = document.createEvent('Event');
        event.initEvent('pageLevelDetectorv22Ready', true, true);
        window.dispatchEvent(event);
      } catch (e2) {}
    }

    console.log("═══════════════════════════════════════════════════════════");
    console.log("✅ Page Level Detector v23.9.2 — PRUNE + CONSISTENCY");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🔥 FIX v14-A: ENTITY_BASE_NAMES STRICT MODE");
    console.log("🔥 FIX v14-B: checkHasSpecification(produk) + material");
    console.log("🔥 FIX v14-C: Priority 7 gate pakai earlyLayers");
    console.log("🔥 FIX v14-D: Priority 12 cek residual layer");
    console.log("🔥 FIX v14-E: Test case konsisten strict mode");
    console.log("🔥 FIX v14-F: Self-audit base name");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🧪 Test: runPLDTestSuite()");
    console.log("🔍 Audit base: pageLevelDetectorv22.auditBaseNames()");
    console.log("═══════════════════════════════════════════════════════════");

    // Auto-run audit di console (membantu verifikasi)
    try { auditBaseNames(); } catch (e) {}

    try {
      window.pageLevelDetectorv22.updateAttributes()
        .then(function(result) {
          log("✅ Auto-update selesai! Level: " + result.pageLevel, 'SUCCESS');
        })
        .catch(function(err) { log("Auto-update error: " + err, "ERROR"); });
    } catch (e) {
      log("Auto-update failed: " + e.message, "ERROR");
    }
  }

  function waitForDOM(callback) {
    if (typeof document === 'undefined') { callback(); return; }
    if (document.readyState === 'complete' || document.readyState === 'interactive') { callback(); return; }
    document.addEventListener('DOMContentLoaded', function() { callback(); });
    setTimeout(function() { if (document.readyState === 'loading') callback(); }, 3000);
  }

  log('🚀 Starting PLD v23.9.2...', 'INFO');

  waitForDOM(function() { initializeCore(); });
  if (typeof document !== 'undefined' && document.readyState === 'complete') {
    if (!window.pageLevelDetectorv22) initializeCore();
  }

  if (typeof window !== "undefined") {
    window.runPLDTestSuite = function() {
      if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.runTestSuite) {
        return window.pageLevelDetectorv22.runTestSuite();
      }
      console.error("❌ PLD belum ready.");
      return null;
    };
    window.auditPLDBase = function() {
      if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.auditBaseNames) {
        return window.pageLevelDetectorv22.auditBaseNames();
      }
      console.error("❌ PLD belum ready.");
      return null;
    };
  }

})();  // 🔥 CLOSING IIFE UTAMA — SATU-SATUNYA di akhir file
