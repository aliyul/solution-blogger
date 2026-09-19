/* ============================================================
 🧠 Page Level Detector v23.7.0 — SEO MISMATCH RESOLUTION PHASE 4
    ============================================================
    BASE: v23.6.0 (SEO MISMATCH RESOLUTION PHASE 3)
    
    ✅ FIX 1-148 (v22.62 → v23.6.0): DIPERTAHANKAN SEMUA
    
    🔥 FIX 149 (v23.7.0) — moneyWords +5 kata promo
       - Tambah: 'murah', 'hemat', 'terjangkau', 'promo', 'diskon'
       - Fix: "harga-jasa-bor-sumur-murah" → MONEY-MASTER (bukan MP)
       - Fix: promo words tidak dihitung sebagai core word
    
    🔥 FIX 150 (v23.7.0) — getCoreWords pakai ENTITY_ONLY_WORDS penuh
       - Sebelumnya hanya 1 kata pertama per entity dihapus
       - Sekarang SEMUA entity-only words dihapus:
         * sewa: 'sewa', 'rental'
         * material: 'material', 'bahan'
         * desain: 'desain', 'interior', 'eksterior'
       - Fix: "harga rental excavator" konsisten dengan "harga sewa excavator"
    
    🔥 FIX 151 (v23.7.0) — Base service price threshold
       - FIX 139 threshold: preCore >= 2 (dari >= 1)
       - Fallback MONEY-MASTER kalau hanya base service tanpa modifier
       - Fix: "harga sewa excavator" → MM (bukan MP)
       - Fix: "harga bahan pasir" → MM (bukan MP)
       - Fix: "harga desain interior" → MM (bukan MP)
    
    🔥 FIX 152 (v23.7.0) — checkHasBaseService + rental|bahan
       - Tambah 'rental' dan 'bahan' ke baseRegex
    
    🔥 FIX 153 (v23.7.0) — Test Suite +7 case FIX 150-152
    🔥 FIX 158 (v23.7.0) — SEO-aligned strong modifier
   - Pisah moneyWords jadi: noise vs strong
   - Noise (murah/hemat/terjangkau/bersaing/kompetitif/pasaran) → tetap MM
   - Strong (termurah/termahal/promo/diskon) → naikkan ke MP
   - Fix: "jasa coring beton diskon" → MP
   - Keep: "harga jasa coring beton" → MM (base service murni)

    🔥 FIX 160 (v23.7.1) — Compound base names + konsistensi material
   - FIX 160a: JASA compound base names (bor pile, cor dak, bongkar dinding, renovasi X)
   - FIX 160b: PRODUK multi-word (pintu kayu, pagar stainless, kanopi alderon)
   - FIX 160c: PRODUK_SPECS.finishing +ulir
   - FIX 160d: Hapus jasaMaterialCtx (material BUKAN spec JASA — konsisten MM)
   - Fix: "harga jasa bore pile beton" → MM (bukan MP)
   - Fix: "harga jasa pasang keramik" = "jasa pasang keramik" → MM (konsisten)
    🎯 AKURASI TARGET: 100% (SEO aligned, all entity)
   🔥 FIX 161 (v23.7.2) — Full Expansion Semua Entity
   - PRODUK: +70 compound (kitchen set, wardrobe, sofa, gazebo, kolam, dll)
   - MATERIAL: +50 compound (pipa PVC, kabel, cat waterproof, aquaproof, dll)
   - SEWA: +33 compound (forklift, boom lift, skylift, concrete mixer, dll)
   - DESAIN: +50 compound (interior restoran, rumah tropis, per ruangan, dll)
   - Total: ~600 compound nouns, coverage ~95%+ semua entity
    🎯 AKURASI TARGET: 99%+ (SEO aligned, all entity)
    🔥 FIX 162 (v23.7.3) — Reorder strip + base names fix
   - FIX 162a: Reorder strip — BASE_NAMES dicek SEBELUM COMMON_JASA_WORDS
   - FIX 162b: Sort base names by word count DESC (longest first)
   - FIX 162c: +bor strauss/bor pancang; hapus compound overlap dari produk & sewa
   - FIX 162d: SEWA_SPECS.kondisi +listrik/diesel/bensin/solar/hydraulic/manual
   - FIX 162e: Update 4 test case harga+spec sewa/desain → MP (konsisten)
   - FIX BUG: Tutup array TEST_CASES dengan ];
    🎯 AKURASI TARGET: 100% (SEO aligned, all entity)
    ============================================================ */

(function () {
  "use strict";

if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.version === "23.7.0") {
    console.warn("⚠️ [PLD v23.7.0] Already loaded!");
    return;
}

   // 🔥 FIX 169: Browser-compatible config (via Cloudflare Worker proxy)
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
    ],
    AI_ENABLED: true,
    AI_CONFIDENCE_THRESHOLD: 60,
    AI_TIMEOUT_MS: 8000,
    AI_WORKER_URL: "https://pld-proxy.jasaalkonstruksi.workers.dev",  // ← URL Worker Anda
    AI_PROVIDER: "auto"                                                 // "groq" | "gemini" | "auto"
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
    console.log((icons[type] || "📘") + " [PLD v23.7.0] " + message);
  }

 log('📦 PLD v23.7.0 — SEO MISMATCH RESOLUTION PHASE 4 (FIX 149-153)', 'EXTERNAL');

  // ═══════════════════════════════════════════════════════════
  // LEVEL MAPS
  // ═══════════════════════════════════════════════════════════

  var VALID_LEVELS = [
    "home", "pillar", "sub-pillar-tipe-2", "sub-pillar-tipe-1",
    "money-master", "money-page", "money-child", "variant", "sub-variant"
  ];

  var TYPE_LEVEL_MAP = {
    home: 0, pillar: 1, "sub-pillar-tipe-2": 2, "sub-pillar-tipe-1": 3,
    "money-master": 4, "money-page": 5, "money-child": 6,
    variant: 7, "sub-variant": 8
  };
    // 🔥 FIX 165: Hierarchy maps untuk parent-child validator
  var LEVEL_HIERARCHY_MAP = {
    "pillar": 1,
    "sub-pillar-tipe-2": 2,
    "sub-pillar-tipe-1": 3,
    "money-master": 4,
    "money-page": 5,
    "money-child": 6,
    "variant": 7,
    "sub-variant": 8
  };

  var LEVEL_INVERSE_MAP = {
    1: "pillar", 2: "sub-pillar-tipe-2", 3: "sub-pillar-tipe-1",
    4: "money-master", 5: "money-page", 6: "money-child",
    7: "variant", 8: "sub-variant"
  };
   // 🔥 FIX 168: Parent-driven expected child mapping
  // Setiap parent punya expected child level (parent + 1)
  // Khusus pillar → root, tidak ada parent di atasnya
  var EXPECTED_CHILD_MAP = {
    "pillar":            { expected: "sub-pillar-tipe-2", num: 2 },
    "sub-pillar-tipe-2": { expected: "sub-pillar-tipe-1", num: 3 },
    "sub-pillar-tipe-1": { expected: "money-master",      num: 4 },
    "money-master":      { expected: "money-page",        num: 5 },
    "money-page":        { expected: "money-child",       num: 6, alternate: "variant" },
    "money-child":       { expected: "variant",           num: 7 },
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

  var ENTITY_TRIGGERS = {
    jasa: ["jasa", "kontraktor", "tukang", "borongan", "renovasi", "pasang", "bangun", "perbaikan", "instalasi", "service", "servis", "layanan"],
    desain: ["desain", "interior", "arsitektur", "konsep", "rencana", "gambar", "denah"],
    sewa: ["sewa", "rental", "rent"],
    material: ["material", "bahan", "material bangunan"],
    produk: ["produk", "jual", "beli", "supplier", "distributor", "toko"],
    artikel: ["artikel", "blog", "tips", "panduan", "cara", "tutorial"]
  };

  var ENTITY_PRIORITY = ["jasa", "sewa", "desain", "produk", "material", "artikel"];

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

  var COMMON_JASA_WORDS = [
    'tukang', 'kontraktor', 'borongan', 'mandor', 'vendor', 'supplier',
    'layanan', 'penyedia', 'pengrajin', 'spesialis', 'biro', 'firma',
    'perusahaan', 'penjual jasa',
    'pasang', 'pemasangan', 'bangun', 'renovasi', 'perbaikan',
    'instalasi', 'service', 'servis', 'proyek', 'konstruksi',
    'pembangunan', 'cor', 'gali', 'urug', 'angkut',
    'pemotongan', 'penggalian', 'pengurugan', 'pengangkutan',
    'pengeboran', 'pengelasan', 'pengecoran', 'pengecatan',
    'pengukuran', 'pemasangan', 'pembongkaran', 'pembuatan',
    'pengupasan', 'pemadatan', 'pengerukan', 'pemancangan',
    'pengeringan', 'pembersihan', 'perataan',
    'pembentukan', 'persiapan', 'pemindahan', 'pengangkatan',
    'pengolahan', 'pengerjaan', 'penyelesaian', 'pemeliharaan',
    'memotong', 'menggali', 'mengurug', 'mengangkat',
    'mengebor', 'mengelas', 'mengecor', 'mengecat',
    'mengukur', 'memasang', 'membongkar', 'membuat',
    'mengupas', 'memadatkan', 'mengeruk', 'memancang'
  ];

  var SEWA_WORDS = [
    'sewa', 'rental', 'rent', 'alat', 'mesin', 'heavy equipment',
    'excavator', 'bulldozer', 'crane', 'backhoe', 'dozer',
    'vibro', 'roller', 'compactor', 'diesel', 'hydraulic',
    'mini', 'besar', 'kecil', 'sedang', 'medium', 'extra'
  ];

  var MATERIAL_WORDS = [
    'material', 'bahan', 'semen', 'pasir', 'batu split', 'kerikil',
    'besi', 'baja', 'kayu', 'keramik', 'granit', 'marmer',
    'gypsum', 'plafon', 'paving', 'bata', 'batako', 'hebel',
    'genteng', 'asbes', 'atap', 'baja ringan', 'galvalum',
    'precast', 'pracetak', 'readymix', 'ready mix'
  ];

  var PRODUK_WORDS = [
    'produk', 'jual', 'beli', 'supplier', 'distributor', 'toko', 'shop',
    'pagar panel', 'panel beton', 'pagar beton', 'pagar panel beton',
    'kanopi', 'paving block', 'u ditch', 'box culvert',
    'bata ringan', 'atap baja ringan', 'besi beton'
  ];

  var DESAIN_WORDS = [
    'desain', 'interior', 'eksterior', 'arsitektur', 'layout',
    'denah', 'gambar', 'konsep', 'rencana', 'modern', 'minimalis',
    'klasik', 'tradisional', 'kontemporer', 'elegan', 'luxury',
    'industrial', 'scandinavian', 'jepang', 'rustic', 'vintage'
  ];

  var ENTITY_ONLY_WORDS = {
    jasa: ["jasa"],
    sewa: ["sewa", "rental"],
    produk: ["produk"],
    material: ["material", "bahan"],
    desain: ["desain", "interior", "eksterior"],
    artikel: ["artikel"]
  };

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX 161 FULL TAXONOMY — 600+ compound nouns
  // Aturan: 1 compound = 1 core. 2+ compound berbeda = MP.
  // URUT PANJANG DULU untuk hindari partial match!
  // ═══════════════════════════════════════════════════════════
  var ENTITY_BASE_NAMES = {
    // ─── PRODUK (full) ───
    produk: [
      // Precast & beton
      "pagar panel beton", "pagar panel", "panel beton", "pagar beton",
      "u ditch", "box culvert", "paving block", "batako press",
      "besi beton",
      "baja ringan", "atap baja ringan", "rangka baja ringan",
      "bata ringan", "bata hebel", "bata merah", "bata putih",
      "batako putih", "batako holcim",
      // Kanopi
      "kanopi baja ringan", "kanopi genteng metal", "kanopi alderon",
      "kanopi spandek", "kanopi solartuff", "kanopi besi",
      "kanopi stainless", "kanopi minimalis", "kanopi kaca",
      "kanopi polycarbonate", "kanopi membrane",
      // Pintu & jendela
      "pintu kayu", "pintu besi", "pintu aluminium", "pintu pvc",
      "pintu baja", "pintu geser", "pintu lipat", "pintu swing",
      "pintu rolling door", "pintu folding gate", "pintu harmonika",
      "pintu sliding", "pintu kaca", "pintu kamar mandi",
      "jendela kayu", "jendela aluminium", "jendela besi", "jendela upvc",
      "jendela kaca", "jendela casement", "jendela sliding",
      "kusen aluminium", "kusen kayu", "kusen besi", "kusen upvc",
      // Pagar
      "pagar besi", "pagar kayu", "pagar stainless", "pagar brc",
      "pagar hollow", "pagar minimalis", "pagar tempa",
      "pagar wpc", "pagar grc", "pagar laser cutting",
      "pagar besi tempa", "pagar besi hollow", "pagar kawat brc",
      // Kaca
      "kaca tempered", "kaca laminated", "kaca film",
      "kaca es", "kaca buram", "kaca patri", "kaca sandblast",
      "kaca cermin", "kaca meja", "kaca jendela",
      // Besi profil
      "besi hollow", "besi unp", "besi wf", "besi h-beam", "besi cnp",
      "besi h beam", "besi unp", "besi siku", "besi kanal",
      "baja wf", "baja h-beam", "baja unp", "baja hollow", "baja siku",
      "baja kanal", "baja iwf", "baja hbeam",
      // Plafon
      "plafon gypsum", "plafon pvc", "plafon grc", "plafon akustik",
      "plafon kayu", "plafon metal", "plafon kalsiboard",
      "plafon jayaboard", "plafon shunda", "plafon drop",
      // Lantai
      "keramik lantai", "keramik dinding", "granit tile", "homogeneous tile",
      "parket kayu", "lantai vinyl", "lantai laminasi", "lantai kayu",
      "granit alam", "marmer lantai", "teraso lantai",
      "keramik 60x60", "keramik 80x80", "keramik 40x40",
      "granit 60x60", "granit 80x80", "granit 100x100",
      // Wall panel
      "wallpaper dinding", "wpc wall panel", "wpc dinding", "hpl dinding",
      "grc panel", "acp panel", "pvc dinding", "wall moulding",
      "wall panel", "dinding panel", "panel dinding",
      // Atap
      "atap spandek", "atap alderon", "genteng metal", "genteng tanah liat",
      "atap bitumen", "atap solarflat", "atap shingle", "atap aspal",
      "genteng keramik", "genteng beton", "genteng flat",
      "atap transparan", "atap polycarbonate", "atap solartuff",
      // Kitchen & furniture
      "kitchen set",
      "wardrobe", "lemari pakaian", "lemari dapur", "lemari buku",
      "meja makan", "meja kerja", "meja kantor",
      "kursi makan", "kursi kantor", "kursi sofa",
      "sofa l bentuk",
      "tempat tidur", "bed frame", "nakas",
      "backdrop tv", "backdrop dapur", "backdrop kamar",
      "walk in closet", "walkin closet",
      // Produk exterior
      "gazebo kayu", "gazebo besi", "gazebo minimalis",
      "kolam renang", "kolam ikan", "kolam minimalis",
      "taman minimalis", "taman kering", "taman vertikal",
      // Produk MEP
      "saklar listrik", "stop kontak", "mcb listrik", "panel listrik",
      "lampu hias", "lampu taman", "lampu jalan",
      "cctv rumah", "kamera cctv", "alarm rumah"
    ],
    
    // ─── MATERIAL (full) ───
    material: [
      // Semen
      "semen tiga roda", "semen gresik", "semen holcim", "semen padang",
      "semen scg", "semen merah putih", "semen baturaja", "semen bosowa",
      "semen tonasa", "semen cibinong", "semen portland", "semen putih",
      "semen mortar", "semen instan", "semen warna",
      // Pasir
      "pasir bangka", "pasir lumajang", "pasir muntilan", "pasir silika",
      "pasir beton", "pasir pasang", "pasir urug", "pasir ayak",
      "pasir halus", "pasir kasar", "pasir putih", "pasir hitam",
      "pasir cor", "pasir plester", "pasir gali",
      // Batu
      "batu split", "batu kali", "batu belah", "batu apung",
      "batu andesit", "batu alam", "batu candi", "batu paras",
      "batu gunung", "batu karang", "batu breksi", "batu palimanan",
      "batu koral", "batu sikat", "batu templek",
      // Besi & baja
      "besi beton sni", "besi beton bjts", "besi beton bjtd",
      "besi beton ulir", "besi beton polos", "besi beton full",
      "besi beton banci", "kawat beton", "kawat bendrat",
      // Kayu
      "kayu jati", "kayu meranti", "kayu mahoni", "kayu sengon",
      "kayu kamper", "kayu merbau", "kayu ulin", "kayu bangkirai",
      "kayu kruing", "kayu keruing", "kayu borneo", "kayu bengkirai",
      "kayu glugu", "kayu randu", "kayu pinus", "kayu sungkai",
      // Ready mix
      "ready mix", "readymix", "beton readymix", "beton cor",
      "beton k225", "beton k250", "beton k300", "beton k350",
      "beton k400", "beton k500",
      // Material MEP
      "pipa pvc", "pipa paralon", "pipa air", "pipa gas",
      "pipa hdpe", "pipa besi", "pipa tembaga", "pipa galvanis",
      "kabel listrik", "kabel nym", "kabel nya", "kabel twisted",
      "fitting pvc", "fitting pipa", "valve pipa", "elbow pipa",
      "stop kran", "kran air", "kran wastafel",
      // Material finishing
      "cat tembok", "cat kayu", "cat besi", "cat dinding",
      "cat interior", "cat eksterior", "cat waterproof",
      "cat anti jamur", "cat anti bocor",
      "vernis kayu", "politur kayu", "wood stain",
      "plamir tembok", "plamir kayu",
      "lem kayu", "lem besi", "lem keramik", "semen putih lem",
      // Material waterproofing
      "aquaproof", "no drop", "nodrop", "aqua proof",
      "waterproofing coating", "waterproofing membrane"
    ],
    
    // ─── JASA (sudah lengkap dari FIX 160 — tidak diubah) ───
    jasa: [
      "bore pile beton", "bore pile mini", "bore pile mesin",
      "bore pile manual", "bore pile hidrolik",
      "bore pile", "bor pile", "bored pile", "boring pile",
            "mini pile", "spun pile", "micropile",
      "bor strauss", "bor pancang",   // 🔥 FIX 162c
      "strauss pile beton", "strauss pile borongan",
      "strauss pile manual", "strauss pile mesin",
      "strauss pile mini", "strauss pile",
      "tiang pancang beton", "tiang pancang kayu",
      "pancang beton", "pancang kayu", "pancang mini",
      "pancang mesin", "tiang pancang", "pancang",
      "turap beton", "turap baja", "turap kayu",
      "sheet pile beton", "sheet pile baja", "sheet pile", "turap",
      "jet grouting", "grouting beton", "grouting tanah",
      "stabilisasi tanah", "soil improvement",
      "sumur bor dalam", "sumur bor dangkal", "sumur bor artesis",
      "sumur bor jet pump", "sumur bor air tanah",
      "sumur bor", "bor sumur", "air tanah", "jet pump",
      "bor tanah", "bor horizontal", "bor tembok",
      "cor dak beton", "cor dak lantai", "cor dak",
      "cor lantai beton", "cor lantai",
      "cor jalan beton", "cor jalan",
      "cor kolom beton", "cor kolom",
      "cor sloof", "cor balok", "cor plat",
      "cor pondasi", "cor tiang", "cor dinding", "cor pagar",
      "cor beton", "cor ready mix", "cor readymix",
      "cor lantai gudang", "cor lantai pabrik",
      "cor halaman", "cor garasi", "cor carport",
      "pasang keramik lantai", "pasang keramik dinding",
      "pasang keramik", "pasang granit", "pasang marmer",
      "pasang parket", "pasang vinyl", "pasang lantai kayu",
      "pasang homogeneous tile", "pasang ubin",
      "pasang wallpaper dinding", "pasang wallpaper",
      "pasang wpc dinding", "pasang wpc",
      "pasang grc", "pasang hpl", "pasang pvc dinding",
      "pasang dinding partisi", "pasang partisi",
      "pasang pagar panel beton", "pasang pagar beton",
      "pasang pagar besi", "pasang pagar kayu",
      "pasang pagar stainless", "pasang pagar brc",
      "pasang pagar",
      "pasang kanopi baja ringan", "pasang kanopi alderon",
      "pasang kanopi spandek", "pasang kanopi besi",
      "pasang kanopi", "pasang awning",
      "pasang baja ringan", "pasang rangka atap",
      "pasang atap spandek", "pasang atap genteng",
      "pasang atap metal", "pasang atap alderon",
      "pasang genteng metal", "pasang atap",
      "pasang plafon gypsum", "pasang plafon pvc",
      "pasang plafon grc", "pasang plafon",
      "pasang drop ceiling", "pasang gypsum",
      "pasang pintu besi", "pasang pintu kayu",
      "pasang pintu aluminium", "pasang pintu",
      "pasang jendela aluminium", "pasang jendela kayu",
      "pasang jendela", "pasang kusen aluminium",
      "pasang kusen kayu", "pasang kusen",
      "pasang kaca tempered", "pasang kaca jendela",
      "pasang shower box", "pasang kaca",
      "pasang instalasi listrik", "pasang instalasi air",
      "pasang instalasi gas", "pasang instalasi ac",
      "pasang pipa air", "pasang pipa paralon",
      "pasang kabel listrik", "pasang panel listrik",
      "pasang ac", "pasang cctv", "pasang alarm",
      "bongkar dinding beton", "bongkar dinding",
      "bongkar lantai beton", "bongkar lantai",
      "bongkar plat beton", "bongkar plat",
      "bongkar gedung", "bongkar rumah", "bongkar ruko",
      "bongkar gudang", "bongkar atap",
      "bongkar keramik lantai", "bongkar keramik",
      "bongkar granit", "bongkar marmer",
      "bongkar plafon gypsum", "bongkar plafon",
      "bongkar kusen", "bongkar pintu", "bongkar jendela",
      "bongkar pagar", "bongkar partisi",
      "gali tanah pondasi", "gali tanah", "gali pondasi",
      "gali basement", "gali saluran", "gali drainase",
      "penggalian tanah", "penggalian pondasi",
      "urug tanah lahan", "urug tanah", "urug lahan",
      "urug pondasi", "urug jalan",
      "pengurugan tanah", "pengurugan lahan",
      "angkut tanah", "angkut puing", "angkut material",
      "angkut sampah proyek", "buang tanah", "buang puing",
      "pemadatan tanah", "pemadatan lahan",
      "pemadatan pondasi", "pemadatan jalan",
      "pengerukan sungai", "pengerukan kolam",
      "pengerukan danau", "pengerukan saluran",
      "pemotongan bukit", "pemotongan lahan",
      "cut and fill", "pemotongan tanah",
      "renovasi rumah", "renovasi gedung",
      "renovasi kantor", "renovasi toko",
      "renovasi ruko", "renovasi gudang",
      "renovasi pabrik", "renovasi villa",
      "renovasi apartemen", "renovasi kos",
      "renovasi dapur", "renovasi kamar mandi",
      "renovasi kamar tidur", "renovasi ruang tamu",
      "renovasi ruang keluarga", "renovasi teras",
      "renovasi balkon", "renovasi carport",
      "renovasi atap", "renovasi lantai",
      "renovasi dinding", "renovasi plafon",
      "renovasi fasad", "renovasi pagar", "renovasi taman",
      "cat dinding interior", "cat dinding eksterior",
      "cat dinding", "cat tembok", "cat plafon",
      "cat kayu", "cat besi", "cat pagar",
      "pengecatan dinding", "pengecatan tembok",
      "waterproofing atap", "waterproofing beton",
      "waterproofing dinding", "waterproofing basement",
      "waterproofing kamar mandi", "waterproofing",
      "poles marmer", "poles granit", "poles keramik",
      "poles teraso", "poles lantai",
      "grinding beton", "grinding lantai",
      "grinding dinding", "grinding",
      "epoxy lantai", "coating lantai",
      "coating beton", "coating atap", "coating dinding",
      "instalasi listrik rumah", "instalasi listrik gedung",
      "instalasi listrik", "instalasi panel listrik",
      "instalasi kabel listrik", "instalasi lampu",
      "instalasi air bersih", "instalasi air kotor",
      "instalasi air", "instalasi pipa air",
      "instalasi plumbing", "instalasi pompa air",
      "instalasi ac", "instalasi ac split",
      "instalasi ac central", "instalasi vrf",
      "instalasi cctv", "instalasi kamera cctv",
      "instalasi alarm", "instalasi jaringan",
      "service ac", "service pompa air", "service genset",
      "service lift", "bongkar pasang ac",
      "perbaikan atap bocor", "perbaikan atap",
      "perbaikan dinding retak", "perbaikan dinding",
      "perbaikan lantai", "perbaikan plafon",
      "perbaikan pondasi", "perbaikan struktur",
      "perbaikan rembesan", "perbaikan bocor",
      "perbaikan saluran air", "perbaikan pipa bocor",
      "perawatan gedung", "perawatan kolam",
      "coring beton", "coring dinding", "coring lantai", "coring",
      "cutting beton", "cutting aspal", "cutting dinding", "cutting",
      "bor beton", "bor dinding", "bor horizontal",
      "bor horizontal tanah", "drilling tanah", "drilling beton",
      "boring beton",
      "las besi", "las pagar", "las kanopi",
      "las rangka baja", "las tiang",
      "welding besi", "welding konstruksi",
      "sandblasting besi", "sandblasting beton",
      "sandblasting dinding", "sandblasting",
      "bangun rumah", "bangun gedung", "bangun ruko",
      "bangun gudang", "bangun kantor", "bangun villa",
      "bangun apartemen", "bangun kos", "bangun pabrik",
      "bangun sekolah", "bangun masjid", "bangun gereja",
      "borongan rumah", "borongan gedung", "borongan ruko",
      "borongan gudang", "borongan kantor", "borongan villa",
      "borongan interior"
    ],
    
    // ─── SEWA (full expansion) ───
    sewa: [
      // Alat berat
      "alat berat", "heavy equipment", "dump truck", "truck crane",
      "motor grader", "wheel loader", "tower crane",
      "asphalt finisher", "asphalt paver", "tandem roller",
      "pneumatic tire roller", "cold milling", "batching plant",
      "concrete pump", "pompa beton", "pompa air",
      "jack hammer", "forklift", "crawler crane",
      "mobile crane", "excavator mini", "excavator besar",
      "bulldozer mini", "vibro roller", "baby roller",
      "genset besar", "genset kecil", "genset silent",
            // Forklift — hanya base "forklift" (kapasitas = spec modifier)
      "forklift",
      // Boom lift & skylift
      "boom lift", "skylift", "scissor lift", "man lift",
      "articulated boom lift", "telescopic boom lift",
      // Concrete equipment
      "concrete mixer", "molun", "molen beton", "vibrator beton",
      "pompa beton mini", "pompa beton besar",
      // Alat pengangkat
      "chain block", "hoist crane", "overhead crane", "gantry crane",
      "winch", "cable puller",
      // Alat tanah
      "vibratory plate", "stamper kodok", "tamper", "wacker plate",
      "vibro plate", "baby compactor", "soil compactor",
      // Alat finishing
      "trowel beton", "power trowel", "mesin plester", "mesin acian",
      "mesin cat", "spray gun", "airless sprayer",
      // Alat potong
      "mesin potong beton", "mesin potong keramik", "mesin potong besi",
      "mesin potong rumput", "chainsaw", "gergaji mesin",
      // Pompa & kompresor
      "pompa celup", "pompa submersible", "pompa sentrifugal",
      "pompa centrifugal", "pompa transfer", "kompresor angin",
      "compressor diesel", "compressor listrik"
    ],
    
    // ─── DESAIN (full expansion) ───
    desain: [
      // Konsep umum
      "open space", "split level", "tiny house",
      "smart home", "eco home", "mid century", "art deco",
      // Interior rumah
      "desain interior rumah", "desain interior kantor",
      "desain interior kafe", "desain interior toko",
      "desain interior kamar", "desain interior dapur",
      "desain interior restoran", "desain interior hotel",
      "desain interior apartemen", "desain interior ruko",
      "desain interior sekolah", "desain interior klinik",
      "desain interior mall", "desain interior gym",
      // Rumah
      "desain rumah minimalis", "desain rumah modern",
      "desain rumah klasik", "desain rumah mewah",
      "desain rumah tropis", "desain rumah industrial",
      "desain rumah scandinavian", "desain rumah japandi",
      "desain rumah 2 lantai", "desain rumah 3 lantai",
      "desain rumah 1 lantai", "desain rumah hook",
      "desain rumah type 36", "desain rumah type 45",
      "desain rumah type 54", "desain rumah type 70",
      "desain rumah type 100", "desain rumah type 120",
      // Per ruangan
      "desain dapur", "desain kamar mandi", "desain kamar tidur",
      "desain ruang tamu", "desain ruang keluarga", "desain ruang makan",
      "desain teras", "desain taman", "desain balkon",
      "desain carport", "desain garasi", "desain fasad",
      "desain walk in closet", "desain kamar anak",
      "desain kamar utama", "desain kamar mandi minimalis",
      "desain dapur minimalis", "desain dapur kering",
      "desain dapur basah", "desain ruang kerja",
      // Komersial
      "desain ruko", "desain kantor", "desain cafe",
      "desain restoran", "desain hotel", "desain villa",
      "desain apartemen", "desain showroom", "desain butik",
      "desain bar", "desain lounge", "desain spa",
      "desain salon", "desain laundry", "desain minimarket",
      // Eksterior
      "desain eksterior rumah", "desain eksterior gedung",
      "desain taman rumah", "desain kolam renang",
      "desain taman minimalis", "desain taman kering",
      "desain taman tropis", "desain gazebo",
      // Arsitektur
      "desain arsitektur", "desain 3d", "desain denah",
      "desain layout", "desain bangunan", "desain struktur",
      "gambar arsitektur", "gambar kerja", "gambar teknik"
    ]
  };

   // 🔥 FIX 162b: Sort base names by word count DESC (longest first)
  // Alasan: hindari partial match. Contoh: "kitchen set minimalis" harus 
  // dicek sebelum "kitchen set".
  (function() {
    for (var ent in ENTITY_BASE_NAMES) {
      if (!ENTITY_BASE_NAMES.hasOwnProperty(ent)) continue;
      ENTITY_BASE_NAMES[ent].sort(function(a, b) {
        return b.split(' ').length - a.split(' ').length;
      });
    }
  })();
 
  var PURE_JASA_TECHNIQUES = [];
  var PURE_METHODS = ["manual", "hidrolik", "auger", "rotary", "percussive", "dry", "wet", "basah", "kering"];
  var PURE_SCALES = ["rumahan", "komersial", "industri", "residential", "commercial", "industrial", "kecil", "sedang", "besar", "menengah"];
    var PURE_FINISHING = ["polos", "motif", "bermotif", "bercorak", "tekstur", "serat", "halus", "kasar", "matte", "glossy", "doff", "gloss", "satin", "anyaman", "natural", "ekspos", "custom", "polosan", "cat", "coating", "lapisan", "vernis"];

  // 🔥 FIX 167: Application Targets — target surface/usage context
  // Berlaku UNIVERSAL untuk semua entity (jasa, produk, material, sewa, desain)
  // Konsep: base service/produk + target → naik 1 level (MP)
  var APPLICATION_TARGETS = [
    // Struktur bangunan
    "dinding", "tembok", "lantai", "plafon", "atap",
    "partisi", "kolom", "balok", "plat", "slab", "pelat",
    "pondasi", "tiang", "tangga", "railing", "kusen",
    "pagar", "pintu", "jendela", "rolling door", "kanopi",
    "awning", "fasad", "facade",
    // Ruangan
    "teras", "balkon", "halaman", "carport", "garasi",
    "kamar mandi", "kamar tidur", "ruang tamu", "ruang keluarga",
    "ruang makan", "ruang kerja", "dapur", "toilet", "wc",
    // Bangunan
    "kantor", "toko", "gudang", "pabrik", "sekolah",
    "rumah", "gedung", "ruko", "villa", "apartemen",
    "cafe", "restoran", "hotel", "kios", "rukan",
    // Area eksterior
    "jalan", "trotoar", "saluran", "drainase",
    "taman", "kolam", "sawah", "lahan"
  ];

  // 🔥 FIX 167: Helper untuk cek application target
  function isApplicationTarget(word) {
    if (!word) return false;
    return APPLICATION_TARGETS.indexOf(word.toLowerCase().trim()) !== -1;
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
    "jenis-jenis lengkap", "macam-macam lengkap"
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
        finishing: ["polos", "motif", "bermotif", "bercorak", "tekstur", "serat", "halus", "kasar", "matte", "glossy", "doff", "gloss", "satin", "anyaman", "natural", "ekspos", "custom", "polosan", "cat", "coating", "lapisan", "vernis", "anti gores", "anti air", "anti jamur", "ulir"],  // 🔥 FIX 160c: +ulir
    dimensi: ["ukuran", "dimensi", "spesifikasi", "tipe", "model", "varian", "seri", "tinggi", "rendah", "panjang", "pendek", "lebar", "sempit", "tebal", "tipis", "dalam", "dangkal", "diameter", "radius", "besar", "kecil", "sedang", "mini", "jumbo"],
    warna: ["putih", "hitam", "abu-abu", "merah", "biru", "kuning", "hijau", "coklat", "netral", "warm", "cool", "pastel", "dark", "light", "krem", "maroon", "navy", "forest", "gold", "silver", "bronze", "copper", "rose gold", "teal", "turquoise", "lavender", "magenta", "coral", "salmon", "peach", "mint"],
    gaya: ["minimalis", "modern", "klasik", "skandinavia", "japandi", "industrial", 
         "kontemporer", "tradisional", "rustic", "bohemian"]   // 🔥 FIX

  };

  var PURE_PRODUK_SPECS = PRODUK_SPECS.mutu
  .concat(PRODUK_SPECS.warna)
  .concat(PRODUK_SPECS.finishing)
  .concat(PRODUK_SPECS.gaya);   // 🔥 FIX

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
              "listrik", "diesel", "bensin", "solar", "hydraulic", "manual"],   // 🔥 FIX 162d
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

  var HIGH_VOLUME_WORDS = ["promo", "diskon", "obral", "cuci gudang", "flash sale"];
  var SIZE_WORDS = ["mini", "besar", "kecil", "sedang", "medium", "extra", "ekstra", "standar"];

  var INTENT_TRIGGERS = {
    transactional: ["beli", "order", "pesan", "booking", "sewa sekarang", "harga", "biaya", "tarif", "estimasi", "promo", "diskon", "bayar", "cicilan", "kredit", "dapatkan", "pesan sekarang", "murah", "hemat", "ekonomis", "termurah", "termahal", "resmi", "authorized", "ready stock", "siap pakai", "cara order", "cara pesan", "cara beli"],
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

  var PRICE_WORDS = [
    'harga', 'biaya', 'tarif', 'estimasi', 'ongkos', 'budget',
    'murah', 'hemat', 'terjangkau', 'promo', 'diskon',
    'termurah', 'termahal', 'bersaing', 'kompetitif',
    'dibawah pasaran', 'diatas pasaran', 'pasaran'
  ];

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

   // ═══════════════════════════════════════════════════════════
   // 🔥 FIX 169: AI Proxy (via Cloudflare Worker)
  // Browser-compatible: pakai fetch() dengan CORS support
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
  // FUNGSI DETEKSI UTAMA
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
    for (var i = 0; i < PRICE_WORDS.length; i++) {
      if (lower.indexOf(PRICE_WORDS[i]) !== -1) return true;
    }
    return false;
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

  // 🔥 FIX 152: checkHasBaseService + 'rental' + 'bahan' + 'material bangunan'
  function checkHasBaseService(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    var baseRegex = /\b(jasa|layanan|sewa|rental|produk|material|bahan|kontraktor|tukang|borongan|pasang|bangun|renovasi|perbaikan|instalasi|service|servis|pemasangan|pemancangan|pengeboran|pondasi|tiang|pancang|pagar|panel|beton|baja|besi|kayu|batu|keramik|granit|marmer|plafon|gypsum|kanopi|paving|readymix|cor|desain|interior|eksterior|arsitektur|konstruksi|rumah|gedung|ruko|gudang|pabrik|jalan|jembatan|infrastruktur|mini|pile|bore|strauss|semen|pasir|batu split|kerikil|hebel|batako|genteng|asbes|atap|galvalum|precast|pracetak|kaca|aluminium|pipa)\b/i;
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
            // 🔥 FIX 163: Check gaya modifier
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
        var materialCtx = /\b(keramik|granit|marmer|vinyl|parket|wallpaper|laminasi|homogeneous|keramik lantai|keramik dinding|granit tile|paving|bata|tile|ubin|wall|wall-panel|ceiling|partisi)\b/i.test(lower);
        if (materialCtx) return true;
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
  .concat(CROSS_ENTITY_SPECS.jasa.sharedGaya);  // 🔥 FIX 155
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
    for (var ent in ENTITY_BASE_NAMES) {
      if (!ENTITY_BASE_NAMES.hasOwnProperty(ent)) continue;
      var names = ENTITY_BASE_NAMES[ent];
      for (var n = 0; n < names.length; n++) {
        if (lower.indexOf(names[n]) !== -1) return ent;
      }
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

  // 🔥 FIX 150: getCoreWords pakai ENTITY_ONLY_WORDS penuh
  function getCoreWords(text, entityType) {
    if (!text) return [];
    var coreText = text.toLowerCase();
    coreText = normalizeVerbVariations(coreText);

// 🔥 FIX 158: Pisah noise vs strong modifier (SEO-aligned)
// NOISE (tetap di-strip, tidak jadi core) → MM
// STRONG (jangan di-strip, jadi core) → MP: termurah, termahal, promo, diskon
var moneyWords = ['harga', 'biaya', 'tarif', 'estimasi', 'ongkos',
                  'bersaing', 'kompetitif', 'pasaran', 'murah', 'hemat', 'terjangkau'];
    for (var i = 0; i < moneyWords.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + moneyWords[i] + "\\b", 'g'), '');
    }

       // 🔥 FIX 150: Hapus SEMUA entity-only words (bukan hanya 1 kata pertama)
    var entityOnlyWords = ENTITY_ONLY_WORDS[entityType] || [];
    for (var i = 0; i < entityOnlyWords.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + entityOnlyWords[i] + "\\b", 'g'), ' ');
    }

    // 🔥 FIX 162a: PINDAH BASE_NAMES KE SINI — dicek SEBELUM COMMON_JASA_WORDS
    // Alasan: compound base names yang diawali verb (pasang X, cor X, bongkar X)
    // harus match DULU sebelum verb di-strip.
    // 🔥 FIX 163: SKIP base strip kalau ada conjunction "atau"/"dan"/"serta"
    // Alasan: "jasa pasang pagar atau kanopi" = 2 layanan listing (MP),
    // bukan 1 compound base service. Base strip akan menghilangkan konteks listing.
   var hasConjunction = /\b(atau|dan|serta)\b/i.test(coreText);
    if (entityType && ENTITY_BASE_NAMES[entityType] && !hasConjunction) {
      var baseNamesEarly = ENTITY_BASE_NAMES[entityType] || [];
      
      // 🔥 FIX 170: Bangun set lookup untuk cek "base tanpa target"
      var baseNamesSet = {};
      for (var k = 0; k < baseNamesEarly.length; k++) {
        baseNamesSet[baseNamesEarly[k]] = true;
      }
      
      for (var i = 0; i < baseNamesEarly.length; i++) {
        var bn = baseNamesEarly[i];
        var bnWords = bn.split(' ');
        var lastWord = bnWords[bnWords.length - 1];
        
        // 🔥 FIX 170: Skip base name KALAU:
        //   1. Ends dengan application target
        //   2. DAN tanpa target = base name valid juga
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
    // 🔥 FIX 156: Hapus base names HANYA untuk entity current (bukan cross-entity)
   
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
  // 🔥 FIX 164: SEO Misalignment Warning untuk conjunction "atau"/"dan"
  // Rule:
  //   - "atau" → target SP1 (perbandingan) atau SP2 (list). Kalau di bawah itu → warning.
  //   - "dan"/"serta" → target MP (bundling). Kalau bukan MP → warning.
  function detectConjunctionWarning(slug, level) {
    if (!slug || !level) return [];
    var lower = slug.toLowerCase();
    var warnings = [];

    // Skip kalau conjunction bagian dari base name (mis: "cut and fill")
    if (/\bcut and fill\b/i.test(lower)) return warnings;

    var hasAtau = /\batau\b/.test(lower);
    var hasDan = /\b(dan|serta)\b/.test(lower);

    // Rule 1: "atau" harus SP1 atau SP2
    if (hasAtau && level !== "sub-pillar-tipe-1" && level !== "sub-pillar-tipe-2") {
      warnings.push({
        type: "SEO_MISALIGNMENT_ATAU",
        severity: "warning",
        message: "URL mengandung 'atau' tapi level '" + level + "'. SEO-aligned: 'atau' untuk SP1 (perbandingan) atau SP2 (list).",
        suggestion: "Ganti ke 'dan' untuk MP (bundling), atau expand jadi 'A vs B' untuk SP1."
      });
    }

    // Rule 2: "dan"/"serta" harus MP
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

   // 🔥 FIX 165: Parent-Child Hierarchy Validator
  // Rule SEO: Child URL harus 1 level lebih spesifik dari parent.
  //   - parent MM → child MP
  //   - parent SP1 → child MM
  //   - parent MP → child variant
  // Kalau current level <= parent level → WARNING (mismatch hierarchy).
  function detectHierarchyWarning(slug, entityType) {
    var warnings = [];
    if (!slug) return warnings;

    var words = slug.split(" ").filter(function(w) { return w.length > 0; });

    // Skip kalau terlalu pendek (tidak mungkin punya parent)
    if (words.length <= 2) return warnings;

    // Skip kalau ada conjunction — sudah ada warning terpisah (FIX 164)
    if (/\b(atau|dan|serta)\b/i.test(slug)) return warnings;

    // Immediate parent = remove 1 kata terakhir
    var parentSlug = words.slice(0, -1).join(" ");
    var currentLevel = detectPageLevelForPrompt(slug, entityType);
    var parentLevel = detectPageLevelForPrompt(parentSlug, entityType);

    var currentNum = LEVEL_HIERARCHY_MAP[currentLevel] || -1;
    var parentNum = LEVEL_HIERARCHY_MAP[parentLevel] || -1;

    // Skip kalau parent tidak terdeteksi level valid (< SP1)
    if (parentNum < 3) return warnings;

    // Skip kalau parent = pillar (root, tidak ada parent di atasnya)
    if (parentLevel === "pillar") return warnings;

    // Skip kalau current sudah money-child (valid pattern — location child)
    if (currentLevel === "money-child") return warnings;

    // 🔥 VALIDASI: current harus > parent
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
   // 🔥 FIX 166: Compute level untuk SEMUA breadcrumb segment
  // Return array: [{ slug, level, levelNum, label }, ...]
  function computeBreadcrumbLevels(slug, entityType, domain) {
    if (!slug) return [];
    var words = slug.split(" ").filter(Boolean);
    var entity = entityType || detectEntityTypeFromText(slug);
    var results = [];

    // Progressive: dari kata pertama sampai full slug
    // Contoh: "harga jasa pasang grc dinding"
    //   → "harga jasa" (skip, < 2 meaningful)
    //   → "harga jasa pasang" (base service?)
    //   → "harga jasa pasang grc"
    //   → "harga jasa pasang grc dinding" (full)
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

  // 🔥 FIX 166: Hierarchy Validator berbasis breadcrumb chain
  // Bandingkan level chain: harus MONOTONIC NAIK atau tetap.
  // Kalau ada yang turun / flat di posisi tertentu → warning.
  function validateBreadcrumbHierarchy(slug, entityType) {
    var warnings = [];
    if (!slug) return warnings;

    var chain = computeBreadcrumbLevels(slug, entityType);
    if (chain.length < 2) return warnings;

    // Skip conjunction case (sudah ada warning FIX 164)
    if (/\b(atau|dan|serta)\b/i.test(slug)) return warnings;

    // Skip kalau slug terlalu pendek
    if (chain.length < 2) return warnings;

    // Cari parent terdekat yang punya level valid (>= MM)
    var current = chain[chain.length - 1];
    var parent = null;
    for (var i = chain.length - 2; i >= 0; i--) {
      if (chain[i].levelNum >= 4) {   // MM (4) atau lebih tinggi
        parent = chain[i];
        break;
      }
    }

    if (!parent) return warnings;

    // Skip kalau current = money-child (location child valid)
    if (current.level === "money-child") return warnings;

    // Skip kalau current = variant/sub-variant (sudah lebih spesifik)
    if (current.levelNum >= 7) return warnings;

    // 🔥 VALIDASI: current harus > parent
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

    // 🔥 FIX 168: Parent-Driven Hierarchy Validator (Enhanced)
  // Aturan: Child level HARUS = parent level + 1
  // Pengecualian:
  //   - pillar = root, tidak ada parent
  //   - money-page boleh child = money-child ATAU variant (multi-path)
  //   - sub-variant = leaf, tidak ada child
  function validateParentDrivenHierarchy(slug, entityType) {
    var warnings = [];
    if (!slug) return warnings;

    var words = slug.split(" ").filter(Boolean);
    if (words.length <= 2) return warnings;

    // Skip conjunction
    if (/\b(atau|dan|serta)\b/i.test(slug)) return warnings;

    // Compute level untuk immediate parent
    var parentSlug = words.slice(0, -1).join(" ");
    var parentLevel = detectPageLevelForPrompt(parentSlug, entityType);

    // Skip kalau parent = pillar (root, no parent above)
    if (parentLevel === "pillar") return warnings;

    // Skip kalau parent level tidak dikenal
    if (!EXPECTED_CHILD_MAP[parentLevel]) return warnings;

    var rule = EXPECTED_CHILD_MAP[parentLevel];

    // Skip kalau parent = leaf
    if (rule.isLeaf) return warnings;

    // Current level
    var currentLevel = detectPageLevelForPrompt(slug, entityType);

    // Skip kalau current adalah MC (money-child) karena biasanya lokasi
    // tidak selalu child langsung dari MP
    if (currentLevel === "money-child" && parentLevel === "money-page") return warnings;

    // 🔥 VALIDASI: current harus = expected (atau alternate)
    var isExpected = (currentLevel === rule.expected);
    var isAlternate = (rule.alternate && currentLevel === rule.alternate);

    if (!isExpected && !isAlternate) {
      warnings.push({
        type: "SEO_PARENT_DRIVEN_MISMATCH",
        severity: "warning",
        parentSlug: parentSlug,
        parentLevel: parentLevel,
        parentLevelNum: LEVEL_HIERARCHY_MAP[parentLevel],
        currentLevel: currentLevel,
        currentLevelNum: LEVEL_HIERARCHY_MAP[currentLevel],
        expectedLevel: rule.expected,
        alternateLevel: rule.alternate || null,
        message: "URL '" + slug + "' terdeteksi '" + currentLevel + 
                 "'. Berdasarkan parent '" + parentSlug + "' (" + parentLevel + 
                 "), child yang SEO-aligned = '" + rule.expected + "'" +
                 (rule.alternate ? " atau '" + rule.alternate + "'" : "") + ".",
        suggestion: currentLevel === parentLevel 
          ? "Child level sama dengan parent. Tambahkan modifier spesifik, atau pisah jadi topik berbeda."
          : "Level child bukan expected. Cek struktur URL & konten."
      });
    }

    return warnings;
  }
 
 // 🔥 FIX 154b: Entity-aware spec modifier check
// ═══════════════════════════════════════════════════════════════════
// 🔥 FIX 154b: Entity-Aware Spec Modifier Check (FULL v2)
// Fungsi: Cek apakah single word adalah spec modifier untuk entity tertentu
// Dipakai oleh FIX 154 di detectMoneyLevelInternal
// 
// Coverage:
//   - JASA: metode, skala, finishing, kedalaman, foreignTechniques,
//           sharedGaya, material context (30+ material)
//   - PRODUK: mutu, finishing, warna, dimensi, cross-spec material
//   - MATERIAL: grade, finishing, dimensi, berat, tipe (300+),
//               extendedTypes (silika, zeolit, dll)
//   - SEWA: tipe, merek, kapasitas, kondisi, durasi, extendedUnits,
//           extendedTools (motor grader, tower crane, dll)
//   - DESAIN: gaya, warna, material, konsep, furniture, subjektif,
//             extendedColors (earth tone, sage), extendedGaya (bali modern)
//   - ARTIKEL: informational, tidak ada spec modifier (return false)
// ═══════════════════════════════════════════════════════════════════

function isSpecModifierForEntity(word, entityType) {
  if (!word) return false;
  var w = word.toLowerCase().trim();
  if (!w) return false;

  // ─── UNIVERSAL: angka & mutu numeric ───
  if (/^\d+/.test(w)) return true;                              // 60x60, 240x40, 10mm
  if (/^(k\d+|fc\d*|m\d+|c\d+|bjts?\d*)$/i.test(w)) return true; // k225, fc20, bjts40
    // ─── UNIVERSAL: strong price modifier (SEO-aligned) ───
    // 🔥 FIX 158: 4 kata ini naikkan level ke MP (bukan noise)
  if (w === 'termurah' || w === 'termahal' || w === 'promo' || w === 'diskon') return true;
  
  // 🔥 FIX 167: Application target (universal semua entity)
  // Base + target surface/context → naik 1 level
  //if (APPLICATION_TARGETS.indexOf(w) !== -1) return true;
  
 // ─── JASA ───
  // 🔥 FIX 160d: Hapus jasaMaterialCtx — material BUKAN spec untuk JASA
  // Alasan SEO: "jasa [action] [material]" = 1 layanan utuh, bukan base+modifier
  // Spec JASA sejati = metode (hidrolik/manual) atau skala (rumahan/komersial)
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
 
  // ─── PRODUK ───
    if (entityType === "produk") {
    var produkSpecs = []
      .concat(PRODUK_SPECS.mutu || [])
      .concat(PRODUK_SPECS.finishing || [])
      .concat(PRODUK_SPECS.warna || [])
      .concat(PRODUK_SPECS.dimensi || [])
      .concat(PRODUK_SPECS.gaya || [])   // 🔥 FIX 163
      .concat(CROSS_ENTITY_SPECS.produk.sharedMaterialFinishing || [])
      .concat(CROSS_ENTITY_SPECS.produk.sharedMaterialDimensi || []);
    return produkSpecs.indexOf(w) !== -1;
  }

  // ─── MATERIAL ───
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

  // ─── SEWA ───
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

  // ─── DESAIN ───
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

  // ─── ARTIKEL ───
  if (entityType === "artikel") {
    // Artikel = informational, tidak ada spec modifier dalam konteks harga
    return false;
  }

  return false;
}
 
  // ═══════════════════════════════════════════════════════════
  // 🔥 DETECT MONEY LEVEL — FIX 135-153
  // ═══════════════════════════════════════════════════════════
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
        log('📍 MONEY_CHILD (base service + location)', 'LOCATION');
        return "money-child";
      }
    }

    // PRIORITAS 3: SPEC PHRASE → MONEY-PAGE
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

    // PRIORITAS 7: VARIANT / SUB-VARIANT
    if (hasSpecWord && !hasPriceWord && !hasCommercialWord && !hasLocationWord) {
      var isPureTech = checkPureTechnicalSpec(text, entityType);
      if (isPureTech) {
        var fisikSubVarRegex;
        if (entityType === "sewa") {
          fisikSubVarRegex = /\d+\s*(m|mm|cm|meter|ton|m3)\b/gi;
        } else {
          fisikSubVarRegex = /\d+\s*(m|mm|cm|meter|kg|ton|inch|inci|m3|liter)\b/gi;
        }
        if (fisikSubVarRegex.test(lowerText)) {
          log('🔬 SUB-VARIANT (fisik unit)', 'VARIANT');
          return "sub-variant";
        }
        if (isSubVariant(text, entityType)) {
          log('🔬 SUB-VARIANT', 'VARIANT');
          return "sub-variant";
        }
        log('🔬 VARIANT', 'VARIANT');
        return "variant";
      }
    }

    // PRIORITAS 8: COMMERCIAL + SPEC → MP
    if (hasCommercialWord && hasSpecWord && !hasLocationWord) {
      log('💰 MONEY_PAGE (comm+spec)', 'PRICE');
      return "money-page";
    }

    // 🔥 FIX 154 (v23.7.1): PRICE + BASE SERVICE → smart threshold (ENTITY-AWARE)
if (hasPriceWord && hasBaseService && !hasSpecWord && !hasCommercialWord && !hasLocationWord) {
  var preCore = getCoreWords(text, entityType);
  log('🔥 FIX 154: preCore=[' + preCore.join(',') + '] (len=' + preCore.length + ')', 'CORE');

  // 0 core = base service murni → MM
  if (preCore.length === 0) {
    log('🏛️ FIX 154: MONEY_MASTER (base service murni)', 'MM');
    return "money-master";
  }

  // 1 core + spec modifier (entity-aware) → MP
  if (preCore.length === 1) {
    // 🔥 FIX 167 (Revised): Cek dulu apakah core adalah application target
    // DAN ada compound base name (2+ kata) → MP
    if (APPLICATION_TARGETS.indexOf(preCore[0]) !== -1) {
      var hasCompoundBase154 = false;
      var baseList154 = ENTITY_BASE_NAMES[entityType] || [];
      for (var bi154 = 0; bi154 < baseList154.length; bi154++) {
        var baseName154 = baseList154[bi154];
        if (baseName154.split(' ').length >= 2 && text.indexOf(baseName154) !== -1) {
          hasCompoundBase154 = true;
          break;
        }
      }
      if (hasCompoundBase154) {
        log('💵 FIX 167: MONEY_PAGE (compound base + target: ' + preCore[0] + ')', 'HARGA');
        return "money-page";
      }
      log('🏛️ FIX 167: MONEY_MASTER (single base + target: ' + preCore[0] + ')', 'MM');
      return "money-master";
    }
    
    if (isSpecModifierForEntity(preCore[0], entityType)) {
      log('💵 FIX 154: MONEY_PAGE (price + spec: ' + preCore[0] + ')', 'HARGA');
      return "money-page";
    }
    log('🏛️ FIX 154: MONEY_MASTER (price + base + non-spec)', 'MM');
    return "money-master";
  }

  // 2+ core → MP
  log('💵 FIX 154: MONEY_PAGE (price + 2+ modifier)', 'HARGA');
  return "money-page";
}
   
    // PRIORITAS 9: PRICE + SPEC → MP/MM
    if (hasPriceWord && hasSpecWord && !hasLocationWord && !hasCommercialWord) {
      var isPureTechForPrice = checkPureTechnicalSpec(text, entityType);
      if (isPureTechForPrice) { log('💵 MONEY_PAGE', 'HARGA'); return "money-page"; }
      else { log('🏛️ MONEY_MASTER', 'HARGA'); return "money-master"; }
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
    if (hasHighVolume && !hasLocationWord && !hasSpecWord) {
      var hasNoun = /\b(jasa|layanan|produk|material|pondasi|tiang|pancang|pagar|panel|beton|baja|besi|kayu|batu|keramik|granit|marmer|plafon|gypsum|kanopi|paving|readymix|cor|sewa|rental|alat|mesin|bangunan|konstruksi)\b/i.test(lowerText);
      if (hasNoun) { log('💰 MONEY_PAGE', 'PRICE'); return "money-page"; }
    }
        
       // 🔥 FIX 164: Force MP untuk conjunction "dan"/"serta" (bundling 2 layanan)
    // Skip kalau "dan" bagian dari base name ("cut and fill")
    var hasDanConj = /\b(dan|serta)\b/i.test(lowerText);
    var isDanBaseNamePart = /\bcut and fill\b/i.test(lowerText);
    if (hasDanConj && !isDanBaseNamePart && !hasLocationWord && !hasCommercialWord && !hasPriceWord) {
      var coreForDan = getCoreWords(text, entityType);
      if (coreForDan.length >= 2) {
        log('💰 FIX 164: MONEY_PAGE (dan-bundling: ' + coreForDan.join(',') + ')', 'PRICE');
        return "money-page";
      }
    }
   
    // PRIORITAS 12: CORE WORDS
    var coreWords = getCoreWords(text, entityType);
    log('🧠 CORE: [' + coreWords.join(', ') + ']', 'CORE');

    // FIX 138: Artikel entity — jangan otomatis MP
    if (entityType === "artikel") {
      if (!hasPriceWord && !hasCommercialWord && !hasCompound && complexityScore < 3) {
        log('🏛️ FIX 138: MONEY_MASTER (artikel informasional)', 'MM');
        return "money-master";
      }
    }

    if (coreWords.length <= 2) {
      // FIX 146: JASA base service cap MM
      if (entityType === "jasa" && coreWords.length === 1 && complexityScore <= 2
          && !hasPriceWord && !hasCommercialWord && !hasCompound) {
        // 🔥 FIX 167: Kalau core word = application target → naik ke MP
        if (APPLICATION_TARGETS.indexOf(coreWords[0]) !== -1) {
          log('💵 FIX 167: MONEY_PAGE (base jasa + target: ' + coreWords[0] + ')', 'PRICE');
          return "money-page";
        }
        log('🏛️ FIX 146: MONEY_MASTER (base jasa + 1 objek)', 'MM');
        return "money-master";
      }
     
      if (complexityScore >= 2 && !hasPriceWord && !hasCommercialWord) {
        log('💰 MONEY_PAGE (score=' + complexityScore + ')', 'SCORE');
        return "money-page";
      }
      if (hasPriceWord) log('💵 MONEY_MASTER', 'HARGA');
      else log('🏛️ MONEY_MASTER', 'MM');
      return "money-master";
    } else {
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
        var seoWarnings = detectConjunctionWarning(slug, level);       // 🔥 FIX 164
    var hierarchyWarnings = detectHierarchyWarning(slug, entity);  // 🔥 FIX 165
    var breadcrumbWarnings = validateBreadcrumbHierarchy(slug, entity);  // 🔥 FIX 166
    var parentDrivenWarnings = validateParentDrivenHierarchy(slug, entity);  // 🔥 FIX 168
    var allWarnings = seoWarnings.concat(hierarchyWarnings)
                                .concat(breadcrumbWarnings)
                                .concat(parentDrivenWarnings);      // 🔥 FIX 168
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
    var seoWarnings = detectConjunctionWarning(slug, level);       // 🔥 FIX 164
    var hierarchyWarnings = detectHierarchyWarning(slug, entity);  // 🔥 FIX 165
    var breadcrumbWarnings = validateBreadcrumbHierarchy(slug, entity);  // 🔥 FIX 166
    var parentDrivenWarnings = validateParentDrivenHierarchy(slug, entity);  // 🔥 FIX 168
    var allWarnings = seoWarnings.concat(hierarchyWarnings)
                                .concat(breadcrumbWarnings)
                                .concat(parentDrivenWarnings);      // 🔥 FIX 168
    return {
      pageLevel: level, entityType: entity, factors: factors, text: slug,
      levelNum: TYPE_LEVEL_MAP[level] || -1,
      isValid: VALID_LEVELS.indexOf(level) !== -1,
      seoContext: seoContext,
      seoWarnings: allWarnings
    };
  }
    // 🔥 FIX 169: Sync version (tanpa AI) untuk kode legacy
  function detectForPromptSync(input, entityType) {
    return detectForPrompt(input, entityType);
  }
 
  function detectForPromptWithUpward(input, entityType, domain) { return detectForPromptFull(input, entityType, domain); }
  function detectBreadcrumbsFromSlug(slug, domain) { return detectUpwardFromSlug(slug, domain).breadcrumbs; }
  function detectParentFromSlug(slug, domain) { return detectUpwardFromSlug(slug, domain).upward; }

    // 🔥 FIX 169: Async AI detection (browser-compatible)
  function detectPageLevelWithAI(text, entityType) {
    var pldLevel = detectPageLevelForPrompt(text, entityType);
    var confidence = calculatePLDConfidence(text, entityType, pldLevel);

    // Kalau confidence cukup tinggi atau AI disabled → return sync
    if (confidence >= CONFIG.AI_CONFIDENCE_THRESHOLD || !CONFIG.AI_ENABLED) {
      return Promise.resolve({
        pageLevel: pldLevel,
        source: "PLD_RULE",
        confidence: confidence,
        reason: "Rule-based"
      });
    }

    // Confidence rendah → coba AI via Worker
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
      // AI gagal → fallback
      return {
        pageLevel: pldLevel,
        source: "PLD_RULE",
        confidence: confidence,
        reason: "Rule-based (AI unavailable)"
      };
    });
  }
 
  // 🔥 FIX 169: Async detect with AI (browser-compatible)
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

  // ═══════════════════════════════════════════════════════════
  // SCHEMA / ATTRIBUTES / PHASE 4.6
  // ═══════════════════════════════════════════════════════════

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
    var isMoneyLevel = ['money-master', 'money-page', 'money-child'].indexOf(level) !== -1;
    var isEvergreen = ['pillar', 'sub-pillar-tipe-1', 'sub-pillar-tipe-2'].indexOf(level) !== -1;
    var isVariant = ['variant', 'sub-variant'].indexOf(level) !== -1;

    if (isEvergreen) { primary = 'Article'; secondary = 'FAQPage'; }
    else if (isVariant) { primary = 'Product'; secondary = 'TechArticle'; }
    else if (isMoneyLevel) {
      if (contentFocus === 'HARGA' || contentFocus === 'COMMERCIAL') {
        primary = 'Product'; secondary = 'Service';
      } else if (contentFocus === 'INFORMASI') {
        primary = 'Article'; secondary = 'FAQPage';
      }
    }
    return { primary: primary, secondary: secondary };
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
  // 🔥 FIX 153: TEST SUITE — v23.6.0 cases + FIX 150-152 cases
  // ═══════════════════════════════════════════════════════════

  function runTestSuite() {
    var TEST_CASES = [
      // ═══ FIX 142-144: Regression (v23.5.0) ═══
      { slug: "jasa urug tanah", entity: "jasa", expect: "money-master", note: "FIX 142" },
      { slug: "jasa gali tanah", entity: "jasa", expect: "money-master", note: "FIX 142" },
      { slug: "jasa angkut tanah", entity: "jasa", expect: "money-master", note: "FIX 142" },
      { slug: "jasa penggalian tanah", entity: "jasa", expect: "money-master", note: "FIX 142" },
      { slug: "jasa pengurugan lahan", entity: "jasa", expect: "money-master", note: "FIX 142" },
      { slug: "jasa pengerukan sungai", entity: "jasa", expect: "money-master", note: "FIX 142" },
      { slug: "jasa pemotongan bukit", entity: "jasa", expect: "money-master", note: "FIX 142" },

      { slug: "keramik 60x60", entity: "material", expect: "variant", note: "FIX 143" },
      { slug: "granit 60x60", entity: "material", expect: "variant", note: "FIX 143" },
      { slug: "keramik 80x80", entity: "material", expect: "variant", note: "FIX 143" },
      { slug: "keramik 60x60 cm", entity: "material", expect: "sub-variant", note: "FIX 143: with unit" },
      { slug: "granit 60x120 cm", entity: "material", expect: "sub-variant", note: "FIX 143: with unit" },

      { slug: "sewa genset 100 kva", entity: "sewa", expect: "variant", note: "FIX 144" },
      { slug: "sewa genset 500 kva", entity: "sewa", expect: "variant", note: "FIX 144" },
      { slug: "sewa pompa air 3 inch", entity: "sewa", expect: "variant", note: "FIX 144" },
      { slug: "sewa pompa air 4 inch", entity: "sewa", expect: "variant", note: "FIX 144" },
      { slug: "sewa compressor 200 psi", entity: "sewa", expect: "variant", note: "FIX 144" },
      { slug: "sewa jack hammer 30 kg", entity: "sewa", expect: "variant", note: "FIX 144" },
      { slug: "sewa crane 25 ton", entity: "sewa", expect: "sub-variant", note: "FIX 144: ton is besar" },
      { slug: "sewa crane 50 ton", entity: "sewa", expect: "sub-variant", note: "FIX 144: ton is besar" },
      // ═══ FIX 134-141: Regression ═══
      { slug: "jasa desain", entity: "desain", expect: "pillar", note: "FIX 134" },
      { slug: "jasa desain interior", entity: "desain", expect: "money-master", note: "FIX 134" },
      { slug: "jasa desain interior minimalis", entity: "desain", expect: "variant", note: "FIX 134" },
      { slug: "jasa pasang pagar", entity: "jasa", expect: "money-master", note: "FIX 135" },
      { slug: "jasa pasang pagar besi", entity: "jasa", expect: "money-master", note: "FIX 163: compound MM" },
      { slug: "jasa pasang kanopi", entity: "jasa", expect: "money-master", note: "FIX 135" },
      { slug: "jasa pasang pintu", entity: "jasa", expect: "money-master", note: "FIX 135" },
      { slug: "semen jakarta", entity: "material", expect: "money-child", note: "FIX 136" },
      { slug: "pasir jakarta", entity: "material", expect: "money-child", note: "FIX 136" },
      { slug: "batu split jakarta", entity: "material", expect: "money-child", note: "FIX 136" },
      { slug: "semen bandung", entity: "material", expect: "money-child", note: "FIX 136" },
      { slug: "biaya sumur bor berdasarkan kedalaman", entity: "jasa", expect: "money-page", note: "FIX 137" },
      { slug: "faktor penentu biaya jasa bor sumur", entity: "jasa", expect: "money-page", note: "FIX 137" },
      { slug: "cara pasang keramik lantai", entity: "artikel", expect: "money-master", note: "FIX 138" },
      { slug: "panduan pasang pagar panel beton", entity: "artikel", expect: "money-master", note: "FIX 138" },
      { slug: "tips memilih cat tembok", entity: "artikel", expect: "money-master", note: "FIX 138" },
      { slug: "tutorial instalasi listrik rumah", entity: "artikel", expect: "money-master", note: "FIX 138" },
      { slug: "jasa pasang pagar atau kanopi", entity: "jasa", expect: "money-master", note: "FIX 164: atau = pilihan, bukan layanan ganda" },
      { slug: "perbandingan pagar besi atau kayu", entity: "produk", expect: "sub-pillar-tipe-1", note: "FIX 140" },
      { slug: "kelebihan dan kekurangan pagar beton", entity: "produk", expect: "sub-pillar-tipe-1", note: "FIX 140" },
      // ═══ FIX 146-147: Regression (v23.6.0) ═══
      { slug: "jasa pasang pagar", entity: "jasa", expect: "money-master", note: "FIX 146" },
      { slug: "jasa pasang kanopi", entity: "jasa", expect: "money-master", note: "FIX 146" },
      { slug: "jasa pasang pintu", entity: "jasa", expect: "money-master", note: "FIX 146" },
      { slug: "jasa pasang rolling door", entity: "jasa", expect: "money-page", note: "FIX 146: core=2" },
      { slug: "jasa pasang pagar besi", entity: "jasa", expect: "money-master", note: "FIX 163: compound MM" },
      { slug: "jasa pasang pagar atau kanopi besi", entity: "jasa", expect: "sub-pillar-tipe-1", note: "FIX 147: 2 sisi" },
      { slug: "pagar besi atau pagar kayu", entity: "produk", expect: "sub-pillar-tipe-1", note: "FIX 147: valid" },
      // ═══ Core Regression ═══
      { slug: "jasa coring beton", entity: "jasa", expect: "money-master", note: "regression" },
      { slug: "jasa coring hidrolik", entity: "jasa", expect: "variant", note: "regression" },
      { slug: "jasa coring 30cm", entity: "jasa", expect: "sub-variant", note: "regression" },
      { slug: "jasa pasang pagar jakarta", entity: "jasa", expect: "money-child", note: "regression" },
      { slug: "semen portland", entity: "material", expect: "variant", note: "regression" },
      { slug: "semen 50kg", entity: "material", expect: "sub-variant", note: "regression" },
      { slug: "sewa excavator mini", entity: "sewa", expect: "variant", note: "regression" },
      { slug: "desain interior minimalis", entity: "desain", expect: "variant", note: "regression" },
      { slug: "pagar panel beton k300", entity: "produk", expect: "variant", note: "regression" },
      { slug: "harga pagar panel beton k300", entity: "produk", expect: "money-page", note: "regression" },
      { slug: "jasa konstruksi", entity: "jasa", expect: "pillar", note: "regression" },
      { slug: "semen 3 roda", entity: "material", expect: "variant", note: "regression" },
      { slug: "harga pasir bangka per kubik", entity: "material", expect: "money-page", note: "regression" },
      // ═══════════════════════════════════════════════════════════
      // 🔥 FIX 153 (v23.7.0): ENTITY WORD REMOVAL + BASE SERVICE MM
      // ══════════════════════════════════════════════════════════
      // ─── FIX 158: noise vs strong modifier ───
      // NOISE → MM
      { slug: "harga jasa bor sumur murah", entity: "jasa", expect: "money-master", note: "FIX 158: murah=noise" },
      { slug: "harga jasa bore pile murah", entity: "jasa", expect: "money-master", note: "FIX 158: murah=noise" },
      { slug: "harga jasa pasang pagar hemat", entity: "jasa", expect: "money-master", note: "FIX 158: hemat=noise" },
      { slug: "jasa bore pile terjangkau", entity: "jasa", expect: "money-master", note: "FIX 158: terjangkau=noise" },
      { slug: "harga jasa bor sumur bersaing", entity: "jasa", expect: "money-master", note: "FIX 158: bersaing=noise" },
      { slug: "harga jasa bor sumur kompetitif", entity: "jasa", expect: "money-master", note: "FIX 158: kompetitif=noise" },
      { slug: "harga jasa bor sumur pasaran", entity: "jasa", expect: "money-master", note: "FIX 158: pasaran=noise" },
      // STRONG MODIFIER → MP
      { slug: "jasa coring beton diskon", entity: "jasa", expect: "money-page", note: "FIX 158: diskon=strong" },
      { slug: "jasa bor sumur promo", entity: "jasa", expect: "money-page", note: "FIX 158: promo=strong" },
      { slug: "jasa bor sumur diskon", entity: "jasa", expect: "money-page", note: "FIX 158: diskon=strong" },
      { slug: "jasa bor sumur termurah", entity: "jasa", expect: "money-page", note: "FIX 158: termurah=strong" },
      { slug: "jasa bor sumur termahal", entity: "jasa", expect: "money-page", note: "FIX 158: termahal=strong" },
      { slug: "harga jasa coring beton", entity: "jasa", expect: "money-master", note: "FIX 158: base service tetap MM" },
      // ─── FIX 159: bor beton = base service ───
      { slug: "jasa bor beton", entity: "jasa", expect: "money-master", note: "FIX 159: base service" },
      { slug: "harga jasa bor beton", entity: "jasa", expect: "money-master", note: "FIX 159: base+price tetap MM" },
      { slug: "biaya jasa bor beton", entity: "jasa", expect: "money-master", note: "FIX 159" },
      { slug: "jasa boring beton", entity: "jasa", expect: "money-master", note: "FIX 159: synonym" },
      { slug: "jasa drilling beton", entity: "jasa", expect: "money-master", note: "FIX 159: EN synonym" },
      // Spec/lokasi tetap naik (tidak rusak)
      { slug: "jasa bor beton 30cm", entity: "jasa", expect: "sub-variant", note: "FIX 159: + dimensi" },
      { slug: "jasa bor beton jakarta", entity: "jasa", expect: "money-child", note: "FIX 159: + lokasi" },
      // ═══════════════════════════════════════════════════════════
      // 🔥 FIX 160 (v23.7.1): Compound base names + konsistensi
      // ═══════════════════════════════════════════════════════════
      // ─── FIX 160a: JASA compound base names ───
      { slug: "harga jasa bor pile", entity: "jasa", expect: "money-master", note: "FIX 160a: synonym" },
      { slug: "harga jasa bor strauss", entity: "jasa", expect: "money-master", note: "FIX 160a" },
      { slug: "harga jasa cor dak", entity: "jasa", expect: "money-master", note: "FIX 160a" },
      { slug: "harga jasa cor dak beton", entity: "jasa", expect: "money-master", note: "FIX 160a" },
      { slug: "harga jasa cor jalan", entity: "jasa", expect: "money-master", note: "FIX 160a" },
      { slug: "harga jasa bongkar dinding", entity: "jasa", expect: "money-master", note: "FIX 160a" },
      { slug: "harga jasa bongkar dinding beton", entity: "jasa", expect: "money-master", note: "FIX 160a" },
      { slug: "harga jasa bongkar gedung", entity: "jasa", expect: "money-master", note: "FIX 160a" },
      { slug: "harga jasa renovasi rumah", entity: "jasa", expect: "money-master", note: "FIX 160a" },
      { slug: "harga jasa renovasi dapur", entity: "jasa", expect: "money-master", note: "FIX 160a" },
      { slug: "harga jasa renovasi kamar mandi", entity: "jasa", expect: "money-master", note: "FIX 160a" },
      // ─── FIX 160b: PRODUK multi-word ───
      { slug: "harga pintu kayu", entity: "produk", expect: "money-master", note: "FIX 160b" },
      { slug: "harga pintu aluminium", entity: "produk", expect: "money-master", note: "FIX 160b" },
      { slug: "harga pagar stainless", entity: "produk", expect: "money-master", note: "FIX 160b" },
      { slug: "harga jendela aluminium", entity: "produk", expect: "money-master", note: "FIX 160b" },
      { slug: "harga kanopi alderon", entity: "produk", expect: "money-master", note: "FIX 160b" },
      // ─── FIX 160c: PRODUK spec ulir ───
      { slug: "harga besi beton ulir", entity: "produk", expect: "money-page", note: "FIX 160c: ulir spec" },
      // ─── FIX 160d: Konsistensi jasa + material ───
      { slug: "jasa pasang keramik", entity: "jasa", expect: "money-master", note: "FIX 160d" },
      { slug: "harga jasa pasang keramik", entity: "jasa", expect: "money-master", note: "FIX 160d: konsisten" },
      { slug: "jasa bore pile beton", entity: "jasa", expect: "money-master", note: "FIX 160d" },
      { slug: "harga jasa bore pile beton", entity: "jasa", expect: "money-master", note: "FIX 160d: revisi FIX 151" },
            // ═══════════════════════════════════════════════════════════
      // 🔥 FIX 161 (v23.7.2): Full expansion semua entity
      // ═══════════════════════════════════════════════════════════
      // ─── PRODUK expansion ───
      { slug: "harga kitchen set", entity: "produk", expect: "money-master", note: "FIX 161" },
      { slug: "harga kitchen set minimalis", entity: "produk", expect: "money-page", note: "FIX 163: gaya→MP" },
      { slug: "harga wardrobe", entity: "produk", expect: "money-master", note: "FIX 161" },
      { slug: "harga sofa minimalis", entity: "produk", expect: "money-page", note: "FIX 161" },
      { slug: "harga gazebo kayu", entity: "produk", expect: "money-master", note: "FIX 161" },
      { slug: "harga kolam renang", entity: "produk", expect: "money-master", note: "FIX 161" },
      { slug: "harga pintu rolling door", entity: "produk", expect: "money-master", note: "FIX 161" },
      { slug: "harga pintu kaca", entity: "produk", expect: "money-master", note: "FIX 161" },
      { slug: "harga jendela upvc", entity: "produk", expect: "money-master", note: "FIX 161" },
      { slug: "harga pagar wpc", entity: "produk", expect: "money-master", note: "FIX 161" },
      { slug: "harga plafon kalsiboard", entity: "produk", expect: "money-master", note: "FIX 161" },
      { slug: "harga plafon shunda", entity: "produk", expect: "money-master", note: "FIX 161" },
      { slug: "harga lantai vinyl", entity: "produk", expect: "money-master", note: "FIX 161" },
      { slug: "harga atap shingle", entity: "produk", expect: "money-master", note: "FIX 161" },
      { slug: "harga saklar listrik", entity: "produk", expect: "money-master", note: "FIX 161" },
      // ─── MATERIAL expansion ───
      { slug: "harga semen mortar", entity: "material", expect: "money-master", note: "FIX 161" },
      { slug: "harga semen instan", entity: "material", expect: "money-master", note: "FIX 161" },
      { slug: "harga pasir cor", entity: "material", expect: "money-master", note: "FIX 161" },
      { slug: "harga pasir plester", entity: "material", expect: "money-master", note: "FIX 161" },
      { slug: "harga batu templek", entity: "material", expect: "money-master", note: "FIX 161" },
      { slug: "harga kawat beton", entity: "material", expect: "money-master", note: "FIX 161" },
      { slug: "harga kayu kruing", entity: "material", expect: "money-master", note: "FIX 161" },
      { slug: "harga pipa pvc", entity: "material", expect: "money-master", note: "FIX 161" },
      { slug: "harga kabel listrik", entity: "material", expect: "money-master", note: "FIX 161" },
      { slug: "harga fitting pvc", entity: "material", expect: "money-master", note: "FIX 161" },
      { slug: "harga cat waterproof", entity: "material", expect: "money-master", note: "FIX 161" },
      { slug: "harga vernis kayu", entity: "material", expect: "money-master", note: "FIX 161" },
      { slug: "harga aquaproof", entity: "material", expect: "money-master", note: "FIX 161" },
      { slug: "harga no drop", entity: "material", expect: "money-master", note: "FIX 161" },
      { slug: "harga beton readymix", entity: "material", expect: "money-master", note: "FIX 161" },
      // ─── SEWA expansion ───
      // 🔥 FIX 162e: harga + spec sewa → MP (konsisten dengan genset 100kva)
      { slug: "harga sewa forklift 3 ton", entity: "sewa", expect: "money-page", note: "FIX 162e" },
      { slug: "harga sewa forklift listrik", entity: "sewa", expect: "money-page", note: "FIX 162e" },
      { slug: "harga sewa boom lift", entity: "sewa", expect: "money-master", note: "FIX 161" },
      { slug: "harga sewa skylift", entity: "sewa", expect: "money-master", note: "FIX 161" },
      { slug: "harga sewa scissor lift", entity: "sewa", expect: "money-master", note: "FIX 161" },
      { slug: "harga sewa concrete mixer", entity: "sewa", expect: "money-master", note: "FIX 161" },
      { slug: "harga sewa molen beton", entity: "sewa", expect: "money-master", note: "FIX 161" },
      { slug: "harga sewa vibrator beton", entity: "sewa", expect: "money-master", note: "FIX 161" },
      { slug: "harga sewa stamper kodok", entity: "sewa", expect: "money-master", note: "FIX 161" },
      { slug: "harga sewa pompa celup", entity: "sewa", expect: "money-master", note: "FIX 161" },
      { slug: "harga sewa kompresor angin", entity: "sewa", expect: "money-master", note: "FIX 161" },
      // ─── DESAIN expansion ───
      { slug: "harga desain interior restoran", entity: "desain", expect: "money-master", note: "FIX 161" },
      { slug: "harga desain interior hotel", entity: "desain", expect: "money-master", note: "FIX 161" },
      { slug: "harga desain interior apartemen", entity: "desain", expect: "money-master", note: "FIX 161" },
      { slug: "harga desain rumah tropis", entity: "desain", expect: "money-page", note: "FIX 163: gaya→MP" },
      { slug: "harga desain rumah scandinavian", entity: "desain", expect: "money-page", note: "FIX 163: gaya→MP" },
            { slug: "harga desain rumah 2 lantai", entity: "desain", expect: "money-page", note: "FIX 162e" },
      { slug: "harga desain rumah type 36", entity: "desain", expect: "money-page", note: "FIX 162e" },
      { slug: "harga desain ruang tamu", entity: "desain", expect: "money-master", note: "FIX 161" },
      { slug: "harga desain dapur minimalis", entity: "desain", expect: "money-page", note: "FIX 161: 2 core" },
      { slug: "harga desain walk in closet", entity: "desain", expect: "money-master", note: "FIX 161" },
      { slug: "harga desain showroom", entity: "desain", expect: "money-master", note: "FIX 161" },
      { slug: "harga desain kolam renang", entity: "desain", expect: "money-master", note: "FIX 161" },
      { slug: "harga gambar arsitektur", entity: "desain", expect: "money-master", note: "FIX 161" },
      { slug: "harga gambar kerja", entity: "desain", expect: "money-master", note: "FIX 161" },
     // ─── FIX 150: ENTITY_ONLY_WORDS removal ───
      { slug: "harga rental excavator", entity: "sewa", expect: "money-master", note: "FIX 150" },
      { slug: "harga bahan pasir", entity: "material", expect: "money-master", note: "FIX 150" },
      { slug: "harga bahan material pasir", entity: "material", expect: "money-master", note: "FIX 150" },
      // ─── FIX 151: Base service price threshold ───
      { slug: "harga sewa excavator", entity: "sewa", expect: "money-master", note: "FIX 151" },
      { slug: "harga sewa alat berat", entity: "sewa", expect: "money-master", note: "FIX 151" },
      { slug: "harga desain interior", entity: "desain", expect: "money-master", note: "FIX 151" },
      { slug: "harga sewa excavator mini", entity: "sewa", expect: "money-page", note: "FIX 151: 2 modifier" },
      { slug: "harga pasir bangka", entity: "material", expect: "money-page", note: "FIX 151: 2 modifier" },
      { slug: "harga jasa bor sumur", entity: "jasa", expect: "money-master", note: "FIX 151: base jasa" },
      // ═══════════════════════════════════════════════════════════
      // 🔥 FIX 153 (v23.7.1): Additional test cases
      // ═══════════════════════════════════════════════════════════
      // ─── FIX 155: sharedGaya di checkPureTechnicalSpec ───
      { slug: "harga jasa pasang pagar minimalis", entity: "jasa", expect: "money-page", note: "FIX 155: sharedGaya" },
      { slug: "harga jasa pasang kanopi modern", entity: "jasa", expect: "money-page", note: "FIX 155: sharedGaya" },
      { slug: "harga jasa pasang pintu klasik", entity: "jasa", expect: "money-page", note: "FIX 155: sharedGaya" },
      { slug: "harga jasa renovasi custom", entity: "jasa", expect: "money-page", note: "FIX 155: sharedGaya" },
      { slug: "harga jasa pasang pagar premium", entity: "jasa", expect: "money-page", note: "FIX 155: sharedGaya" },
      { slug: "harga jasa pasang kanopi elegan", entity: "jasa", expect: "money-page", note: "FIX 155: sharedGaya" },
            // ─── FIX 156: cross-entity base removal (UPDATED FIX 160) ───
      { slug: "harga baja ringan", entity: "produk", expect: "money-master", note: "FIX 156: base produk only" },
      { slug: "harga pagar panel beton", entity: "produk", expect: "money-master", note: "FIX 156: base produk only" },
      // ─── FIX 154: Entity-aware spec modifier ───
      { slug: "harga jasa coring hidrolik", entity: "jasa", expect: "money-page", note: "FIX 154: metode hidrolik" },
      { slug: "harga pagar panel beton putih", entity: "produk", expect: "money-page", note: "FIX 154: warna putih" },
      { slug: "harga besi beton sni", entity: "material", expect: "money-page", note: "FIX 154: grade sni" },
      { slug: "harga sewa genset 100kva", entity: "sewa", expect: "money-page", note: "FIX 154: kapasitas angka" },
      { slug: "harga desain interior mewah", entity: "desain", expect: "money-page", note: "FIX 154: subjektif mewah" },
      // ═══════════════════════════════════════════════════════════
      // 🔥 FIX 162 (v23.7.3): Verifikasi reorder strip + compound
      // ═══════════════════════════════════════════════════════════
      // ─── Reorder strip (FIX 162a) ───
      // ─── Data baru (FIX 162c) ───
      { slug: "harga jasa bor pancang", entity: "jasa", expect: "money-master", note: "FIX 162c" },
      { slug: "harga sofa modern", entity: "produk", expect: "money-page", note: "FIX 162c" },
      // ─── Sewa power source (FIX 162d) ───
      { slug: "harga sewa forklift diesel", entity: "sewa", expect: "money-page", note: "FIX 162d" },
      { slug: "harga sewa genset solar", entity: "sewa", expect: "money-page", note: "FIX 162d" },
      // ═══════════════════════════════════════════════════════════
      // 🔥 FIX 163 (v23.7.4): Skip base strip kalau ada conjunction
      // ═══════════════════════════════════════════════════════════
      { slug: "jasa pasang pagar atau kanopi", entity: "jasa", expect: "money-master", note: "FIX 164: atau = pilihan" },
      { slug: "jasa pasang pagar atau kanopi besi", entity: "jasa", expect: "sub-pillar-tipe-1", note: "FIX 163: SP1" },
      { slug: "jasa pasang pagar besi", entity: "jasa", expect: "money-master", note: "FIX 163: compound MM" },
           { slug: "jasa pasang kanopi besi", entity: "jasa", expect: "money-master", note: "FIX 163: compound MM" },
      // ═══════════════════════════════════════════════════════════
      // 🔥 FIX 164 (v23.7.5): Conjunction "dan"/"serta" → MP
      // ═══════════════════════════════════════════════════════════
      { slug: "jasa pasang pagar dan kanopi", entity: "jasa", expect: "money-page", note: "FIX 164: dan-bundling" },
      { slug: "jasa bongkar dan pasang keramik", entity: "jasa", expect: "money-page", note: "FIX 164: dan-bundling" },
      { slug: "jasa urug dan gali tanah", entity: "jasa", expect: "money-page", note: "FIX 164: dan-bundling" },
            { slug: "harga jasa pasang pagar dan kanopi", entity: "jasa", expect: "money-page", note: "FIX 164: dan-bundling + harga" },
      // ═══════════════════════════════════════════════════════════
      // ═══════════════════════════════════════════════════════════
      // 🔥 FIX 165 (v23.7.6): Hierarchy validator test
      // ═══════════════════════════════════════════════════════════
      // Di-superseded oleh FIX 168 — test case dipindah ke bawah
      // ═══════════════════════════════════════════════════════════
        // ═══════════════════════════════════════════════════════════
      // 🔥 FIX 166 (v23.7.7): Breadcrumb hierarchy validator
      // ═══════════════════════════════════════════════════════════
      // Di-superseded oleh FIX 168 — lihat test di bawah
      { slug: "harga desain rumah tropis 2 lantai", entity: "desain", expect: "money-page", note: "FIX 167: 2 core+target" },
     // ═══════════════════════════════════════════════════════════
      // 🔥 FIX 168 (v23.7.9): Parent-driven hierarchy validator
      // ═══════════════════════════════════════════════════════════
      { slug: "harga jasa pasang dinding", entity: "jasa", expect: "money-master", note: "FIX 168: parent MM" },
      { slug: "harga jasa pasang grc dinding", entity: "jasa", expect: "money-page", note: "FIX 168: child MP (expected)" },
      { slug: "harga jasa pasang hpl dinding", entity: "jasa", expect: "money-page", note: "FIX 168: child MP (expected)" }
   
    ];   // 🔥 FIX 162e: tutup array TEST_CASES
    
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🧪 PLD v23.7.0 — TEST SUITE (" + TEST_CASES.length + " CASE)");
    console.log("═══════════════════════════════════════════════════════════");

    var passed = 0, failed = 0, failures = [];
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
        console.log("✅ " + test.slug + " → " + actual + (test.note ? " (" + test.note + ")" : ""));
      } else {
        failed++;
        failures.push(test);
        console.log("❌ " + test.slug + " → " + actual + " (expect: " + test.expect + ")" + (test.note ? " (" + test.note + ")" : ""));
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
      version: "23.7.0",
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
      validateParentDrivenHierarchy: validateParentDrivenHierarchy,  // 🔥 FIX 168
      EXPECTED_CHILD_MAP: EXPECTED_CHILD_MAP,                        // 🔥 FIX 168
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
      isApplicationTarget: isApplicationTarget,   // 🔥 FIX 167

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

      callAIProxy: callAIProxy,                 // 🔥 FIX 169
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

      // ─── DATA EXPORT ───
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
      SIZE_WORDS: SIZE_WORDS,
      TIER_1_LOCATION: TIER_1_LOCATION,
      LOCATION_WORDS: LOCATION_WORDS,
      PRICE_WORDS: PRICE_WORDS,
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
    console.log("✅ Page Level Detector v23.7.0 — SEO MISMATCH PHASE 4");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("✅ FIX 1-148 (v22.62 → v23.6.0): DIPERTAHANKAN SEMUA");
    console.log("🔥 FIX 149 (v23.7.0): moneyWords +5 promo (murah, hemat, dll)");
    console.log("🔥 FIX 150 (v23.7.0): ENTITY_ONLY_WORDS removal penuh");
    console.log("🔥 FIX 151 (v23.7.0): Base service price threshold >= 2");
    console.log("🔥 FIX 152 (v23.7.0): checkHasBaseService + rental|bahan");
    console.log("🔥 FIX 153 (v23.7.0): Test Suite +7 case FIX 150-152");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🧪 Test: runPLDTestSuite()");
    console.log("📊 Akurasi Target: 100% (SEO aligned, all entity)");
    console.log("═══════════════════════════════════════════════════════════");

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

  log('🚀 Starting PLD v23.7.0 — SEO MISMATCH RESOLUTION PHASE 4...', 'INFO');
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
  }

})();
