/* ============================================================
 🧠 Page Level Detector v22.48 — STABLE EDITION
    ✅ FIX 2: SUB-PILLAR DETECTION LENGKAP
    ✅ FIX 3: COMMERCIAL INTENT LENGKAP
    ✅ FIX 4: MONEY_CHILD PRIORITAS (location → MC)
    ✅ FIX 5: VARIANT + HARGA → MONEY_PAGE
    ✅ FIX 6: FALLBACK CERDAS
    ✅ MANUAL: ENTITY_PILLAR_NAMES (tanpa auto-add)
    ✅ CORE v22.31: LOGIKA CORE (hapus harga & entity words)
    ✅ NEW v22.46: COMMERCIAL + BUDGET WORDS
============================================================ */

(function () {
  "use strict";

  if (window.pageLevelDetectorv22) {
    console.warn("⚠️ [PLD v22.48] Page Level Detector already loaded!");
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
    console.log((icons[type] || "📘") + " [PLD v22.48] " + message);
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
  // 🔥 ENTITY PILLAR NAMES — MANUAL (tanpa auto-add)
  // ============================================================

  var ENTITY_PILLAR_NAMES = {
    jasa: ["jasa konstruksi", "jasa bangunan", "jasa renovasi", "jasa perbaikan"],
    desain: ["jasa desain interior", "desain interior", "jasa arsitektur"],
    sewa: ["sewa alat konstruksi", "rental alat konstruksi", "sewa alat berat"],
    produk: ["produk konstruksi", "produk bangunan"],
    "produk interior": ["produk interior", "interior produk"],
    material: ["material konstruksi", "bahan konstruksi", "material bangunan"],
    artikel: ["artikel konstruksi", "blog konstruksi", "tips konstruksi"],
    
    // ✅ TAMBAHKAN MANUAL SESUAI NICHE ANDA
    "pagar panel": [
        "pagar panel",
        "pagar panel beton",
        "harga pagar panel",
        "harga pagar panel beton"
    ],
    "atap baja ringan": [
        "atap baja ringan",
        "harga atap baja ringan"
    ],
    "bata ringan": [
        "bata ringan",
        "harga bata ringan"
    ],
    "readymix": [
        "readymix",
        "ready mix",
        "harga readymix",
        "harga ready mix"
    ]
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
  // 🔥 PRICE WORDS + BUDGET WORDS (v22.46)
  // ============================================================

  var PRICE_WORDS = [
    'harga', 'biaya', 'tarif', 'estimasi', 'ongkos',
    'murah', 'hemat', 'ekonomis', 'terjangkau',
    'budget', 'mahal', 'mewah', 'premium', 'promo', 'diskon'
  ];

  // ============================================================
  // 🔥 COMMERCIAL INTENT — LENGKAP (FIX 3)
  // ============================================================

  var COMMERCIAL_WORDS = [
    'jual', 'beli', 'order', 'pesan', 'booking',
    'sewa', 'rental', 'rent', 'supplier', 'distributor',
    'toko', 'shop', 'butuh', 'cari', 'mau', 'ingin',
    'dapatkan', 'pesan sekarang', 'order sekarang'
  ];

  // ============================================================
  // 🔥 LOCATION DATABASE (v22.31 — LENGKAP)
  // ============================================================

  var LOCATION_DATABASE = {
    "jakarta": { provinsi: "DKI Jakarta", kabupaten_kota: [{ nama: "Jakarta Pusat", kecamatan: ["Gambir", "Sawah Besar", "Kemayoran", "Senen", "Cempaka Putih", "Menteng", "Tanah Abang", "Johar Baru"] }, { nama: "Jakarta Utara", kecamatan: ["Penjaringan", "Tanjung Priok", "Koja", "Kelapa Gading", "Cilincing", "Pademangan"] }, { nama: "Jakarta Barat", kecamatan: ["Kembangan", "Kebon Jeruk", "Palmerah", "Grogol Petamburan", "Tambora", "Kalideres", "Cengkareng"] }, { nama: "Jakarta Selatan", kecamatan: ["Setiabudi", "Mampang Prapatan", "Pasar Minggu", "Jagakarsa", "Cilandak", "Pesanggrahan", "Kebayoran Lama", "Kebayoran Baru", "Tebet", "Pancoran"] }, { nama: "Jakarta Timur", kecamatan: ["Matraman", "Pulogadung", "Jatinegara", "Kramat Jati", "Pasar Rebo", "Cakung", "Duren Sawit", "Makasar", "Ciracas", "Cipayung"] }, { nama: "Kepulauan Seribu", kecamatan: ["Kepulauan Seribu Utara", "Kepulauan Seribu Selatan"] }] },
    "bandung": { provinsi: "Jawa Barat", kabupaten_kota: [{ nama: "Bandung", kecamatan: ["Andir", "Antapani", "Arcamanik", "Astana Anyar", "Babakan Ciparay", "Bandung Kidul", "Bandung Kulon", "Bandung Wetan", "Batununggal", "Bojongloa Kaler", "Bojongloa Kidul", "Cibeunying Kaler", "Cibeunying Kidul", "Cibiru", "Cicendo", "Cidadap", "Cinambo", "Coblong", "Gedebage", "Kiaracondong", "Lengkong", "Mandalajati", "Panyileukan", "Rancasari", "Regol", "Sukajadi", "Sukasari", "Sumur Bandung", "Ujungberung"] }, { nama: "Bandung Barat", kecamatan: ["Batujajar", "Cihampelas", "Cikalong Wetan", "Cililin", "Cipatat", "Cipeundeuy", "Cipongkor", "Gununghalu", "Lembang", "Ngamprah", "Padalarang", "Parongpong", "Rongga", "Saguling", "Sindangkerta"] }] },
    "bekasi": { provinsi: "Jawa Barat", kabupaten_kota: [{ nama: "Bekasi", kecamatan: ["Bantargebang", "Bekasi Barat", "Bekasi Selatan", "Bekasi Timur", "Bekasi Utara", "Jatiasih", "Jatisampurna", "Medansatria", "Mustikajaya", "Pondokgede", "Pondokmelati", "Rawalumbu"] }, { nama: "Bekasi Barat", kecamatan: ["Babelan", "Bojongmangu", "Cabangbungin", "Cibarusah", "Cibitung", "Cikarang Barat", "Cikarang Pusat", "Cikarang Selatan", "Cikarang Timur", "Cikarang Utara", "Karangbahagia", "Kedungwaringin", "Muaragembong", "Pebayuran", "Serang Baru", "Setu", "Sukakarya", "Sukatani", "Sukawangi", "Tambelang", "Tambun Selatan", "Tambun Utara", "Tarumajaya"] }] },
    "tangerang": { provinsi: "Banten", kabupaten_kota: [{ nama: "Tangerang", kecamatan: ["Batuceper", "Benda", "Cibodas", "Ciledug", "Cipondoh", "Jatiuwung", "Karang Tengah", "Karawaci", "Larangan", "Neglasari", "Periuk", "Pinang", "Tangerang"] }, { nama: "Tangerang Selatan", kecamatan: ["Ciputat", "Ciputat Timur", "Pamulang", "Pondok Aren", "Serpong", "Serpong Utara", "Setu"] }] },
    "depok": { provinsi: "Jawa Barat", kabupaten_kota: [{ nama: "Depok", kecamatan: ["Beji", "Bojongsari", "Cilodong", "Cimanggis", "Cinere", "Cipayung", "Limo", "Pancoran Mas", "Sawangan", "Sukmajaya", "Tapos"] }] },
    "bogor": { provinsi: "Jawa Barat", kabupaten_kota: [{ nama: "Bogor", kecamatan: ["Bogor Barat", "Bogor Selatan", "Bogor Timur", "Bogor Utara", "Tanah Sereal"] }, { nama: "Bogor Barat", kecamatan: ["Babakan Madang", "Bojong Gede", "Caringin", "Ciampea", "Ciawi", "Cibinong", "Cibungbulang", "Cigombong", "Cijeruk", "Cileungsi", "Ciomas", "Cisarua", "Ciseeng", "Citeureup", "Dramaga", "Gunung Putri", "Gunung Sindur", "Jasinga", "Jonggol", "Kemang", "Klapanunggal", "Leuwiliang", "Leuwisadeng", "Megamendung", "Nanggung", "Pamijahan", "Parung", "Parung Panjang", "Ranca Bungur", "Rumpin", "Sukajaya", "Sukamakmur", "Sukaraja", "Tajurhalang", "Tamansari", "Tanjungsari", "Tenjo", "Tenjolaya"] }] },
    "surabaya": { provinsi: "Jawa Timur", kabupaten_kota: [{ nama: "Surabaya", kecamatan: ["Asemrowo", "Benowo", "Bubutan", "Bulak", "Dukuh Pakis", "Gayungan", "Genteng", "Gubeng", "Gunung Anyar", "Jambangan", "Karangpilang", "Kenjeran", "Krembangan", "Lakarsantri", "Mulyorejo", "Pabean Cantian", "Pakal", "Rungkut", "Sambikerep", "Sawahan", "Semampir", "Simokerto", "Sukolilo", "Sukomanunggal", "Tambaksari", "Tandes", "Tegalsari", "Tenggilis Mejoyo", "Wiyung", "Wonocolo", "Wonokromo"] }] },
    "medan": { provinsi: "Sumatera Utara", kabupaten_kota: [{ nama: "Medan", kecamatan: ["Medan Amplas", "Medan Area", "Medan Barat", "Medan Baru", "Medan Belawan", "Medan Deli", "Medan Denai", "Medan Helvetia", "Medan Johor", "Medan Kota", "Medan Labuhan", "Medan Maimun", "Medan Marelan", "Medan Perjuangan", "Medan Petisah", "Medan Polonia", "Medan Selayang", "Medan Sunggal", "Medan Tembung", "Medan Timur", "Medan Tuntungan"] }] },
    "makassar": { provinsi: "Sulawesi Selatan", kabupaten_kota: [{ nama: "Makassar", kecamatan: ["Biringkanaya", "Bontoala", "Mamajang", "Manggala", "Mariso", "Panakkukang", "Rappocini", "Tallo", "Tamalanrea", "Tamalate", "Ujung Pandang", "Ujung Tanah", "Wajo"] }] },
    "bali": { provinsi: "Bali", kabupaten_kota: [{ nama: "Denpasar", kecamatan: ["Denpasar Barat", "Denpasar Selatan", "Denpasar Timur", "Denpasar Utara"] }, { nama: "Badung", kecamatan: ["Abiansemal", "Kuta", "Kuta Selatan", "Kuta Utara", "Mengwi", "Petang"] }] },
    "semarang": { provinsi: "Jawa Tengah", kabupaten_kota: [{ nama: "Semarang", kecamatan: ["Banyumanik", "Candisari", "Gajahmungkur", "Gayamsari", "Genuk", "Gunungpati", "Mijen", "Ngaliyan", "Pedurungan", "Semarang Barat", "Semarang Selatan", "Semarang Tengah", "Semarang Timur", "Semarang Utara", "Tembalang", "Tugu"] }] },
    "yogyakarta": { provinsi: "DI Yogyakarta", kabupaten_kota: [{ nama: "Yogyakarta", kecamatan: ["Danurejan", "Gedongtengen", "Gondokusuman", "Gondomanan", "Jetis", "Kotagede", "Kraton", "Mantrijeron", "Mergangsan", "Ngampilan", "Pakualaman", "Tegalrejo", "Umbulharjo", "Wirobrajan"] }] },
    "solo": { provinsi: "Jawa Tengah", kabupaten_kota: [{ nama: "Surakarta", kecamatan: ["Banjarsari", "Jebres", "Laweyan", "Pasar Kliwon", "Serengan"] }] }
  };

  var LOCATION_WORDS = [
    "jakarta", "jakarta pusat", "jakarta barat", "jakarta selatan", "jakarta timur", "jakarta utara",
    "bogor", "depok", "tangerang", "bekasi", "bandung", "karawang", "purwakarta", "cikarang", "subang", "cirebon",
    "semarang", "solo", "surakarta", "pekalongan", "tegal", "magelang", "sukoharjo", "boyolali", "klaten",
    "jogja", "yogyakarta", "surabaya", "malang", "kediri", "gresik", "sidoarjo", "mojokerto", "pasuruan", "probolinggo", "jember", "banyuwangi", "madiun",
    "medan", "palembang", "pekanbaru", "padang", "lampung", "batam", "aceh", "jambi", "bengkulu",
    "pontianak", "balikpapan", "samarinda", "banjarmasin", "makassar", "manado", "palu", "kendari",
    "bali", "denpasar", "gianyar", "tabanan", "bangli", "karangasem", "klungkung", "buleleng",
    "mataram", "kupang", "terdekat", "sekitar", "dekat", "near"
  ];

  // ============================================================
  // 🔥 SPECIFICATION WORDS (v22.31 — LENGKAP)
  // ============================================================

  var SPECIFICATION_WORDS = {
    primary: ["ukuran", "spesifikasi", "dimensi", "detail", "parameter", "standar", "mutu", "kualitas", "grade", "kelas", "tipe", "model", "varian", "seri"],
    dimension: ["tinggi", "rendah", "panjang", "pendek", "lebar", "sempit", "tebal", "tipis", "dalam", "dangkal", "diameter", "radius", "luas", "volume", "kedalaman", "ketebalan"],
    finishing: ["polos", "motif", "bermotif", "bercorak", "tekstur", "serat", "halus", "kasar", "matte", "glossy", "doff", "gloss", "satin", "anyaman", "natural", "ekspos", "custom", "polosan"],
    application: ["perumahan", "pabrik", "gudang", "sekolah", "rumah sakit", "pertambangan", "kandang", "ternak", "industri", "komersial", "residensial", "kavling", "lahan", "kosong", "pembatas", "keamanan", "kedap", "suara", "banjir", "tahan", "lama", "cepat", "dipasang", "terpasang", "terinstal"],
    method: ["hidrolik", "manual", "auger", "rotary", "percussive", "dry", "wet", "basah", "kering", "coring", "cutting", "drilling", "pengeboran", "pemancangan", "pemasangan", "metode", "teknik", "cara"],
    technique: ["coring", "cutting", "drilling", "pengeboran", "pemancangan", "pengerjaan", "bongkar", "pasang", "potong", "las", "sambung", "grinding", "welding", "bending", "forming"]
  };

  var ALL_SPEC_WORDS = [];
  for (var category in SPECIFICATION_WORDS) {
    if (SPECIFICATION_WORDS.hasOwnProperty(category)) {
      ALL_SPEC_WORDS.push.apply(ALL_SPEC_WORDS, SPECIFICATION_WORDS[category]);
    }
  }

  var SPEC_PHRASES_AT_END = [
    "kedap suara", "tahan banjir", "tahan lama", "cepat dipasang",
    "rumah sakit", "pembatas lahan", "perumahan", "pertambangan",
    "keamanan", "kedap", "suara", "banjir", "tahan", "lama",
    "cepat", "dipasang", "terpasang", "terinstal"
  ];

  var HIGH_VOLUME_WORDS = ["murah", "hemat", "ekonomis", "terjangkau", "budget", "premium", "luxury", "mewah", "mahal"];
  var SIZE_WORDS = ["mini", "besar", "kecil", "sedang", "medium", "extra", "ekstra", "standar"];
  var JASA_ULTRA_COMMON_WORDS = ["jasa", "kontraktor", "tukang", "borongan", "renovasi", "pasang", "bangun", "perbaikan", "instalasi", "proyek", "cor", "gali", "urug", "angkut", "service", "servis", "desain", "interior", "eksterior"];
  var STOPWORDS = new Set(["dan", "atau", "serta", "yang", "dari", "ke", "di", "untuk", "dengan", "ini", "itu", "akan", "telah", "sudah", "masih", "pada", "oleh", "karena", "sehingga", "setelah", "sebelum"]);

  // ============================================================
  // 🔥 UNIVERSAL QUALITY WORDS (v22.31)
  // ============================================================

  var UNIVERSAL_QUALITY_WORDS = {
    quality: ["mutu", "kualitas", "grade", "kelas", "standar"],
    method: ["hidrolik", "manual", "auger", "rotary", "percussive", "dry", "wet", "basah", "kering"],
    condition: ["terpasang", "terinstal", "tertanam", "terbenam", "tercetak", "terbentuk", "terbuat"],
    technique: ["coring", "cutting", "drilling", "pengeboran", "pemancangan", "pemasangan"],
    technical: ["dalam", "dangkal", "kedalaman", "diameter", "ketebalan"],
    finishing: ["polos", "motif", "tekstur", "serat", "halus", "kasar", "matte", "glossy", "doff", "gloss", "satin", "natural", "ekspos", "custom", "standar", "premium", "ekonomis", "modern", "klasik", "minimalis", "tradisional", "elegan", "mewah"]
  };

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
    for (var i = 0; i < PRICE_WORDS.length; i++) {
      if (text.indexOf(PRICE_WORDS[i]) !== -1) return true;
    }
    return false;
  }

  function checkHasSpecification(text) {
    var lower = text.toLowerCase();
    for (var i = 0; i < ALL_SPEC_WORDS.length; i++) {
      if (lower.indexOf(ALL_SPEC_WORDS[i]) !== -1) return true;
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

  // ============================================================
  // 🔥 SUB-PILLAR KEYWORDS — LENGKAP (FIX 2)
  // ============================================================

  var SUB_PILLAR_2_KEYWORDS = ['daftar', 'jenis', 'macam', 'kategori', 'tipe', 'list', 'katalog', 'rekomendasi', 'pilihan', 'variasi', 'model', 'gaya', 'varian'];
  var SUB_PILLAR_1_KEYWORDS = ['perbandingan', 'vs', 'versus', 'kelebihan', 'kekurangan', 'perbedaan', 'lebih baik', 'unggul', 'terbaik', 'mana yang', 'antara', 'atau'];

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

  function cleanJasaText(text) {
    if (!text) return "";
    var cleaned = text.toLowerCase();
    for (var i = 0; i < JASA_ULTRA_COMMON_WORDS.length; i++) {
      var kw = JASA_ULTRA_COMMON_WORDS[i];
      cleaned = cleaned.replace(new RegExp("\\b" + kw + "\\b", "g"), " ");
    }
    for (var sw of STOPWORDS) {
      cleaned = cleaned.replace(new RegExp("\\b" + sw + "\\b", "g"), " ");
    }
    cleaned = cleaned.replace(/\s+/g, " ").trim();
    return cleaned;
  }

  function detectLocationHierarchy(text) {
    if (!text) return { provinsi: null, kabupaten_kota: null, kecamatan: null, kota_utama: null };
    var lowerText = text.toLowerCase();
    var result = { provinsi: null, kabupaten_kota: null, kecamatan: null, kota_utama: null };
    for (var city in LOCATION_DATABASE) {
      if (!LOCATION_DATABASE.hasOwnProperty(city)) continue;
      var data = LOCATION_DATABASE[city];
      for (var r = 0; r < data.kabupaten_kota.length; r++) {
        var regency = data.kabupaten_kota[r];
        for (var k = 0; k < regency.kecamatan.length; k++) {
          var kec = regency.kecamatan[k];
          if (lowerText.indexOf(kec.toLowerCase()) !== -1) {
            result.kecamatan = kec;
            result.kabupaten_kota = regency.nama;
            result.provinsi = data.provinsi;
            result.kota_utama = city;
            return result;
          }
        }
      }
    }
    for (var city in LOCATION_DATABASE) {
      if (!LOCATION_DATABASE.hasOwnProperty(city)) continue;
      var data = LOCATION_DATABASE[city];
      for (var r = 0; r < data.kabupaten_kota.length; r++) {
        var regency = data.kabupaten_kota[r];
        if (lowerText.indexOf(regency.nama.toLowerCase()) !== -1) {
          result.kabupaten_kota = regency.nama;
          result.provinsi = data.provinsi;
          result.kota_utama = city;
          return result;
        }
      }
    }
    for (var city in LOCATION_DATABASE) {
      if (!LOCATION_DATABASE.hasOwnProperty(city)) continue;
      if (lowerText.indexOf(city.toLowerCase()) !== -1) {
        result.kota_utama = city;
        result.provinsi = LOCATION_DATABASE[city]?.provinsi || null;
        return result;
      }
    }
    if (/\b(terdekat|sekitar|dekat|near)\b/i.test(lowerText)) {
      result.kota_utama = "terdekat";
      result.provinsi = null;
    }
    return result;
  }

  function getAllCities() { return Object.keys(LOCATION_DATABASE); }
  function getProvince(cityKey) { return LOCATION_DATABASE[cityKey]?.provinsi || null; }
  function getRegencies(cityKey) { return LOCATION_DATABASE[cityKey]?.kabupaten_kota || []; }
  function getAllRegencies() {
    var allRegencies = [];
    for (var city in LOCATION_DATABASE) {
      if (!LOCATION_DATABASE.hasOwnProperty(city)) continue;
      var data = LOCATION_DATABASE[city];
      for (var r = 0; r < data.kabupaten_kota.length; r++) {
        var regency = data.kabupaten_kota[r];
        allRegencies.push({ kota_utama: city, provinsi: data.provinsi, kabupaten_kota: regency.nama, kecamatan: regency.kecamatan });
      }
    }
    return allRegencies;
  }
  function getKecamatanByKabupatenKota(kabupatenKotaName) {
    for (var city in LOCATION_DATABASE) {
      if (!LOCATION_DATABASE.hasOwnProperty(city)) continue;
      var data = LOCATION_DATABASE[city];
      for (var r = 0; r < data.kabupaten_kota.length; r++) {
        var regency = data.kabupaten_kota[r];
        if (regency.nama.toLowerCase() === kabupatenKotaName.toLowerCase()) return regency.kecamatan;
      }
    }
    return [];
  }
  function getKecamatanByCity(cityKey) {
    var allKecamatan = [];
    var regencies = getRegencies(cityKey);
    for (var r = 0; r < regencies.length; r++) {
      allKecamatan.push.apply(allKecamatan, regencies[r].kecamatan);
    }
    return allKecamatan;
  }
  function getAllKecamatan() {
    var allKec = [];
    for (var city in LOCATION_DATABASE) {
      if (!LOCATION_DATABASE.hasOwnProperty(city)) continue;
      var data = LOCATION_DATABASE[city];
      for (var r = 0; r < data.kabupaten_kota.length; r++) {
        var regency = data.kabupaten_kota[r];
        for (var k = 0; k < regency.kecamatan.length; k++) {
          allKec.push({ kecamatan: regency.kecamatan[k], kabupaten_kota: regency.nama, kota_utama: city, provinsi: data.provinsi });
        }
      }
    }
    return allKec;
  }

  // ============================================================
  // 🔥 VARIANT DETECTION (v22.31 — DETAIL)
  // ============================================================

  function detectVariantByPattern(text, entityType) {
    if (!text) return { isVariant: false, score: 0, reasons: [] };
    var score = 0;
    var reasons = [];
    var lower = text.toLowerCase();
    var words = lower.split(/\s+/);

    // EXCLUSION: Price word → MONEY_PAGE
    if (PRICE_WORDS.some(function(w) { return lower.indexOf(w) !== -1; })) {
      log('"' + text + '" → BUKAN variant (price word) → MONEY_PAGE', "PRICE");
      return { isVariant: false, score: 0, reasons: ["Price word → MONEY_PAGE"] };
    }

    // High volume → MONEY_PAGE
    var hasHighVolume = HIGH_VOLUME_WORDS.some(function(w) { return lower.indexOf(w) !== -1; });
    if (hasHighVolume) {
      var hasNoun = /\b(jasa|layanan|produk|material|pondasi|tiang|pancang|pagar|panel|beton|baja|besi|kayu|batu|keramik|granit|marmer|plafon|gypsum|kanopi|paving|readymix|cor|sewa|rental|alat|mesin|bangunan|konstruksi)\b/i.test(lower);
      if (hasNoun) {
        log('"' + text + '" → BUKAN variant (high volume) → MONEY_PAGE', "PRICE");
        return { isVariant: false, score: 0, reasons: ["High volume keyword → MONEY_PAGE"] };
      }
    }

    // Commercial word → MONEY_PAGE
    if (COMMERCIAL_WORDS.some(function(w) { return lower.indexOf(w) !== -1; })) {
      log('"' + text + '" → BUKAN variant (commercial word) → MONEY_PAGE', "COMMERCIAL");
      return { isVariant: false, score: 0, reasons: ["Commercial word → MONEY_PAGE"] };
    }

    // Location + service → MONEY_CHILD
    if (LOCATION_WORDS.some(function(w) { return lower.indexOf(w) !== -1; })) {
      var hasService = /\b(jasa|layanan|sewa|produk|material|kontraktor|tukang|borongan|pasang|bangun|renovasi|perbaikan|instalasi|service|servis|pemasangan|pemancangan|pengeboran|pondasi|tiang|pancang|pagar|panel|beton|baja|besi|kayu|batu|keramik|granit|marmer|plafon|gypsum|kanopi|paving|readymix|cor|desain|interior|eksterior|arsitektur|konstruksi|rumah|gedung|ruko|gudang|pabrik|jalan|jembatan|infrastruktur|mini|pile|bore|strauss)\b/i.test(lower);
      if (hasService) {
        log('"' + text + '" → BUKAN variant (location + service) → MONEY_CHILD', "LOCATION");
        return { isVariant: false, score: 0, reasons: ["Location word → MONEY_CHILD"] };
      }
    }

    // Per unit pattern → MONEY_PAGE
    if (/\bper\s+(meter|titik|m|kg|hari|jam|minggu|bulan|unit|buah|item|lembar|bagian|paket|sesi|kali|kubik|m2|m3|liter|ton|meter lari|m')\b/i.test(lower)) {
      log('"' + text + '" → BUKAN variant (per unit pattern) → MONEY_PAGE', "PRICE");
      return { isVariant: false, score: 0, reasons: ["Per unit → MONEY_PAGE"] };
    }

    // SPEC FIRST PATTERNS
    var firstWord = words[0] || "";
    var isSpecWord = ALL_SPEC_WORDS.some(function(spec) { return firstWord === spec; });
    if (isSpecWord) {
      if (!PRICE_WORDS.some(function(w) { return lower.indexOf(w) !== -1; }) && !LOCATION_WORDS.some(function(w) { return lower.indexOf(w) !== -1; })) {
        if (!HIGH_VOLUME_WORDS.some(function(w) { return lower.indexOf(w) !== -1; }) && !SIZE_WORDS.some(function(w) { return lower.indexOf(w) !== -1; })) {
          log('✅ VARIANT: specification at start: "' + firstWord + '" → "' + text + '"', "VARIANT");
          return { isVariant: true, score: 5, reasons: ["Specification word \"" + firstWord + "\" at start → VARIANT"] };
        }
      }
    }

    var specFirstPatterns = [
      { pattern: /^(tinggi|rendah|panjang|pendek|lebar|sempit|tebal|tipis|dalam|dangkal|diameter|radius|ukuran|dimensi)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer|jasa|layanan|produk|material)/i, score: 4, reason: "Dimension + noun (spec first)" },
      { pattern: /^(polos|motif|bermotif|bercorak|tekstur|serat|halus|kasar|matte|glossy|doff|gloss|satin|anyaman|natural|ekspos|custom|standar|premium|ekonomis|modern|klasik|minimalis|tradisional|elegan|mewah|polosan)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer|jasa|layanan|produk|material)/i, score: 4, reason: "Finishing + noun (spec first)" },
      { pattern: /^(perumahan|pabrik|gudang|sekolah|rumah sakit|pertambangan|kandang|ternak|industri|komersial|residensial|kavling|lahan|kosong|pembatas|keamanan|kedap|suara|banjir|tahan|lama|cepat|dipasang|terpasang|terinstal)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer|jasa|layanan|produk|material)/i, score: 3, reason: "Application + noun (spec first)" },
      { pattern: /^(hidrolik|manual|auger|rotary|percussive|dry|wet|basah|kering|coring|cutting|drilling|pengeboran|pemancangan|pemasangan|bongkar|pasang|potong|las|sambung|metode|teknik|cara)\s+(jasa|layanan|produk|material|sewa|tiang|pancang|bore|pile|pondasi|beton|baja|besi|kayu|batu|keramik|granit|marmer|plafon|gypsum|kanopi|paving|readymix|cor)/i, score: 4, reason: "Method/technique + noun (spec first)" }
    ];

    for (var i = 0; i < specFirstPatterns.length; i++) {
      var pattern = specFirstPatterns[i];
      if (pattern.pattern.test(lower)) {
        if (!PRICE_WORDS.some(function(w) { return lower.indexOf(w) !== -1; }) && !LOCATION_WORDS.some(function(w) { return lower.indexOf(w) !== -1; })) {
          if (!HIGH_VOLUME_WORDS.some(function(w) { return lower.indexOf(w) !== -1; }) && !SIZE_WORDS.some(function(w) { return lower.indexOf(w) !== -1; })) {
            score += pattern.score;
            reasons.push(pattern.reason);
            log('VARIANT pattern: ' + pattern.reason, "VARIANT");
          }
        }
      }
    }

    // SPEC AT END
    var lastWord = words[words.length - 1] || "";
    var isSpecAtEnd = ALL_SPEC_WORDS.some(function(spec) { return lastWord === spec; });
    var lastTwoWords = words.slice(-2).join(" ");
    var isSpecPhraseAtEnd = SPEC_PHRASES_AT_END.some(function(phrase) { return lastTwoWords === phrase; });
    if (isSpecAtEnd || isSpecPhraseAtEnd) {
      if (!PRICE_WORDS.some(function(w) { return lower.indexOf(w) !== -1; }) && !LOCATION_WORDS.some(function(w) { return lower.indexOf(w) !== -1; })) {
        if (!HIGH_VOLUME_WORDS.some(function(w) { return lower.indexOf(w) !== -1; }) && !SIZE_WORDS.some(function(w) { return lower.indexOf(w) !== -1; })) {
          var hasNoun = /^(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer|jasa|layanan|produk|material|sewa|alat|mesin)/i.test(lower);
          if (hasNoun || words.length >= 3) {
            log('✅ VARIANT: specification at end: "' + (lastWord || lastTwoWords) + '" → "' + text + '"', "VARIANT");
            return { isVariant: true, score: 5, reasons: ["Specification \"" + (lastWord || lastTwoWords) + "\" at end → VARIANT"] };
          }
        }
      }
    }

    // UNIVERSAL QUALITY WORDS
    var supportedEntities = ["jasa", "sewa", "produk", "material", "desain"];
    if (supportedEntities.indexOf(entityType) !== -1) {
      var qualityResult = detectUniversalQualityWords(text, entityType);
      if (qualityResult.hasSpec) {
        if (!PRICE_WORDS.some(function(w) { return lower.indexOf(w) !== -1; }) && !LOCATION_WORDS.some(function(w) { return lower.indexOf(w) !== -1; })) {
          if (!HIGH_VOLUME_WORDS.some(function(w) { return lower.indexOf(w) !== -1; }) && !SIZE_WORDS.some(function(w) { return lower.indexOf(w) !== -1; })) {
            score += qualityResult.score;
            reasons = reasons.concat(qualityResult.reasons);
            log('UNIVERSAL QUALITY [' + entityType + ']: +' + qualityResult.score + ' points', "VARIANT");
          }
        }
      }
    }

    var threshold = 3;
    var isVariant = score >= threshold;
    if (isVariant) {
      log('✅ VARIANT DETECTED: "' + text + '" [' + entityType + '] | Score: ' + score, "SUCCESS");
    } else {
      log('❌ NOT VARIANT: "' + text + '" [' + entityType + '] | Score: ' + score, "INFO");
    }
    return { isVariant: isVariant, score: score, reasons: reasons };
  }

  function detectUniversalQualityWords(text, entityType) {
    if (!text) return { hasSpec: false, score: 0, reasons: [] };
    var lower = text.toLowerCase();
    var hasSpec = false;
    var score = 0;
    var reasons = [];
    var relevantCategories = [];
    if (entityType === "jasa") {
      relevantCategories = ["quality", "method", "condition", "technique", "technical"];
    } else if (entityType === "sewa") {
      relevantCategories = ["quality", "method", "condition", "technical"];
    } else if (entityType === "produk" || entityType === "material") {
      relevantCategories = ["quality", "technical", "finishing", "condition"];
    } else if (entityType === "desain") {
      relevantCategories = ["quality", "finishing"];
    } else {
      relevantCategories = Object.keys(UNIVERSAL_QUALITY_WORDS);
    }
    for (var ci = 0; ci < relevantCategories.length; ci++) {
      var category = relevantCategories[ci];
      var words = UNIVERSAL_QUALITY_WORDS[category] || [];
      for (var wi = 0; wi < words.length; wi++) {
        var word = words[wi];
        if (lower.indexOf(word) !== -1) {
          hasSpec = true;
          score += 3;
          reasons.push("Quality word [" + category + "]: \"" + word + "\"");
          break;
        }
      }
    }
    var numUnitPattern = /\b(\d+(?:\.\d+)?)\s*(m|mm|cm|meter|kg|ton|inch|inci|liter|m³|m2|m²|m3|cm2|cm²|cm3|cm³|km|milimeter|sentimeter|kilogram)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer)/i;
    if (numUnitPattern.test(lower)) {
      hasSpec = true;
      score += 3;
      reasons.push("Quality word [technical]: \"numeric + unit + noun\"");
    }
    return { hasSpec: hasSpec, score: score, reasons: reasons };
  }

  function detectVariantLevel(text, entityType) {
    if (isSubVariant(text)) return "sub-variant";
    if (hasTechnicalSpec(text)) return "variant";
    var result = detectVariantByPattern(text, entityType);
    if (result.isVariant) return "variant";
    return null;
  }

  // ============================================================
  // 🔥 CORE MONEY LEVEL DETECTION (FIX 2-6)
  // ============================================================

  function detectMoneyLevel(text, entityType) {
    var lowerText = text.toLowerCase();
    var hasPriceWord = checkHasPrice(text);
    var hasLocationWord = isLocation(text);
    var hasCommercialWord = checkHasCommercial(text);
    var hasSpecWord = checkHasSpecification(text);
    var subPillar = detectSubPillar(text);

    // ============================================================
    // 🔥 PRIORITAS 0: SUB-PILLAR → langsung return
    // ============================================================
    if (subPillar) {
      log('📋 SUB-PILLAR: "' + text + '" → ' + subPillar, 'DETECT');
      return subPillar;
    }

    // ============================================================
    // 🔥 PRIORITAS 1: LOCATION → MONEY_CHILD (FIX 4)
    //    Lokasi + apapun → MONEY_CHILD (kecuali Sub-Pillar)
    // ============================================================
    if (hasLocationWord) {
      var hasService = /\b(jasa|layanan|sewa|produk|material|kontraktor|tukang|borongan|pasang|bangun|renovasi|perbaikan|instalasi|service|servis|pemasangan|pemancangan|pengeboran|pondasi|tiang|pancang|pagar|panel|beton|baja|besi|kayu|batu|keramik|granit|marmer|plafon|gypsum|kanopi|paving|readymix|cor|desain|interior|eksterior|arsitektur|konstruksi|rumah|gedung|ruko|gudang|pabrik|jalan|jembatan|infrastruktur|mini|pile|bore|strauss)\b/i.test(lowerText);
      if (hasService) {
        log('📍 MONEY_CHILD: "' + text + '" → MONEY_CHILD (location)', 'LOCATION');
        return "money-child";
      }
    }

    // ============================================================
    // 🔥 PRIORITAS 2: VARIANT (tanpa harga, tanpa commercial)
    // ============================================================
    if (hasSpecWord && !hasPriceWord && !hasCommercialWord && !hasLocationWord) {
      if (/\d+\s*(m|mm|cm|meter|kg|ton|inch|inci|k|m3|liter)/gi.test(lowerText)) {
        log('🔬 SUB-VARIANT: "' + text + '" → SUB-VARIANT', 'VARIANT');
        return "sub-variant";
      }
      log('🔬 VARIANT: "' + text + '" → VARIANT', 'VARIANT');
      return "variant";
    }

    // ============================================================
    // 🔥 PRIORITAS 3: COMMERCIAL + SPEC → MONEY_PAGE
    // ============================================================
    if (hasCommercialWord && hasSpecWord && !hasLocationWord) {
      log('🛒 MONEY_PAGE: "' + text + '" → MONEY_PAGE (commercial + spec)', 'COMMERCIAL');
      return "money-page";
    }

    // ============================================================
    // 🔥 PRIORITAS 4: HARGA + SPESIFIKASI → MONEY_PAGE (FIX 5)
    //    Jika ada harga + spec → MP (bukan Variant)
    // ============================================================
    if (hasPriceWord && hasSpecWord && !hasLocationWord && !hasCommercialWord) {
      log('💰 MONEY_PAGE: "' + text + '" → MONEY_PAGE (harga + spec)', 'PRICE');
      return "money-page";
    }

    // ============================================================
    // 🔥 PRIORITAS 5: COMMERCIAL → MONEY_PAGE
    // ============================================================
    if (hasCommercialWord && !hasLocationWord) {
      log('🛒 MONEY_PAGE: "' + text + '" → MONEY_PAGE (commercial)', 'COMMERCIAL');
      return "money-page";
    }

    // ============================================================
    // 🔥 PRIORITAS 6: HIGH VOLUME → MONEY_PAGE
    // ============================================================
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

    // ============================================================
    // 🔥 PRIORITAS 7: CORE LOGIC — MM vs MP (FIX 6)
    //    Jika ada harga + core ≤2 kata → MM, core ≥3 kata → MP
    // ============================================================
    if (hasPriceWord) {
      var coreText = lowerText;
      var moneyWords = ['harga', 'biaya', 'tarif', 'estimasi', 'ongkos'];
      for (var mi = 0; mi < moneyWords.length; mi++) {
        coreText = coreText.replace(new RegExp("\\b" + moneyWords[mi] + "\\b", 'g'), '');
      }

      // Hapus entity words berdasarkan entityType
      var entityWords = [];
      if (entityType === "jasa") {
        entityWords = JASA_ULTRA_COMMON_WORDS;
      } else if (entityType === "sewa") {
        entityWords = ['sewa', 'rental'];
      } else if (entityType === "produk" || entityType === "material") {
        entityWords = ['produk', 'material', 'jual', 'beli', 'supplier', 'distributor'];
      } else if (entityType === "desain") {
        entityWords = ['desain', 'interior', 'eksterior', 'arsitektur'];
      }
      for (var ei = 0; ei < entityWords.length; ei++) {
        coreText = coreText.replace(new RegExp("\\b" + entityWords[ei] + "\\b", 'g'), '');
      }

      // Hapus stopwords
      for (var sw of STOPWORDS) {
        coreText = coreText.replace(new RegExp("\\b" + sw + "\\b", 'g'), ' ');
      }

      // Hapus lokasi
      for (var li = 0; li < LOCATION_WORDS.length; li++) {
        coreText = coreText.replace(new RegExp("\\b" + LOCATION_WORDS[li] + "\\b", 'g'), ' ');
      }

      var coreWords = coreText.split(/\s+/).filter(function(w) { return w.length > 2; });

      if (coreWords.length <= 2) {
        log('🏛️ MONEY_MASTER: "' + text + '" → MONEY_MASTER (core: ' + coreWords.join(' ') + ')', 'MM');
        return "money-master";
      } else {
        log('💰 MONEY_PAGE: "' + text + '" → MONEY_PAGE (core: ' + coreWords.join(' ') + ')', 'PRICE');
        return "money-page";
      }
    }

    // ============================================================
    // 🔥 PRIORITAS 8: FALLBACK CERDAS (FIX 6)
    //    Tanpa price → cek apakah PILLAR atau MM
    // ============================================================
    var words = lowerText.split(/\s+/).filter(function(w) { return w.length > 2; });
    var stopwords = ["dan", "atau", "serta", "yang", "dari", "ke", "di", "untuk", "dengan", "ini", "itu"];
    var filteredWords = words.filter(function(w) { return stopwords.indexOf(w) === -1; });

    // Jika ada kata panduan/cara/tips → PILLAR
    if (/panduan|cara|tips|tutorial|langkah|pedoman|guide/.test(lowerText)) {
      log('📚 PILLAR: "' + text + '" → PILLAR (panduan)', 'DETECT');
      return "pillar";
    }

    // Jika filteredWords ≤2 → MM
    if (filteredWords.length <= 2) {
      log('🏛️ MONEY_MASTER: "' + text + '" → MONEY_MASTER (fallback: ' + filteredWords.length + ' kata)', 'MM');
      return "money-master";
    }

    // Jika filteredWords ≥3 → MP
    log('💰 MONEY_PAGE: "' + text + '" → MONEY_PAGE (fallback: ' + filteredWords.length + ' kata)', 'PRICE');
    return "money-page";
  }

  // ============================================================
  // 📌 MAIN DETECTOR (FIX 1 — MANUAL PILLAR)
  // ============================================================

  function detectPillar(text, entityType) {
    var cleanLower = text.toLowerCase().trim();
    
    // Cek exact match di ENTITY_PILLAR_NAMES (MANUAL)
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

  function detectPageLevel(userOptions) {
    if (isHomePage()) return "home";
    var text = getPageText();
    var entityType = detectEntityType(userOptions && userOptions.userEntityType);
    log('📝 TEXT: "' + text + '"', "INFO");
    log('🏷️ ENTITY: ' + entityType, "INFO");

    // ============================================================
    // STEP 1: PILLAR DETECTION (MANUAL — FIX 1)
    // ============================================================
    if (detectPillar(text, entityType)) {
      log('🏛️ PILLAR: "' + text + '" → PILLAR', "SUCCESS");
      return "pillar";
    }

    // ============================================================
    // STEP 2: DETECT LEVEL (FIX 2-6)
    // ============================================================
    var level = detectMoneyLevel(text, entityType);
    log('🎯 FINAL: "' + text + '" → ' + level, 'SUCCESS');
    return level;
  }

  // ============================================================
  // 📌 FUNGSI LAINNYA (EEAT, STRUCTURE, SNIPPET, INTENT, dll)
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
    else if (level === 'variant') strategies.push("VARIANT: spesifikasi teknis (tanpa harga/commercial)");
    else if (level === 'sub-variant') strategies.push("SUB-VARIANT: spesifikasi + dimensi");
    else if (level === 'money-page') strategies.push("MP: " + coreWords.length + " core words");
    else if (level === 'money-master') strategies.push("MM: " + coreWords.length + " core words (tanpa tambahan)");
    return { level: level, confidence: 100, strategies: strategies, strategyCount: strategies.length };
  }

  // ============================================================
  // 🔥 BREADCRUMBS DETECTION (v22.46)
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
  // 🔥 WAIT FOR DOM READY (v22.46)
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
      version: "22.48",
      CONFIG: CONFIG,

      detect: detectPageLevel,
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

      // LOCATION UTILITIES (v22.31)
      getLocationDatabase: function() { return LOCATION_DATABASE; },
      getAllCities: getAllCities,
      getProvince: getProvince,
      getRegencies: getRegencies,
      getAllRegencies: getAllRegencies,
      getKecamatanByKabupatenKota: getKecamatanByKabupatenKota,
      getKecamatanByCity: getKecamatanByCity,
      getAllKecamatan: getAllKecamatan,
      detectLocationHierarchy: detectLocationHierarchy,

      // VARIANT UTILITIES (v22.31)
      hasTechnicalSpec: hasTechnicalSpec,
      isSubVariant: isSubVariant,
      cleanJasaText: cleanJasaText,
      detectVariantByPattern: detectVariantByPattern,
      detectUniversalQualityWords: detectUniversalQualityWords,
      UNIVERSAL_QUALITY_WORDS: UNIVERSAL_QUALITY_WORDS,
      SPECIFICATION_WORDS: SPECIFICATION_WORDS,
      ALL_SPEC_WORDS: ALL_SPEC_WORDS,
      SPEC_PHRASES_AT_END: SPEC_PHRASES_AT_END,

      // OTHER
      COMMERCIAL_WORDS: COMMERCIAL_WORDS,
      HIGH_VOLUME_WORDS: HIGH_VOLUME_WORDS,
      SIZE_WORDS: SIZE_WORDS,
      LOCATION_WORDS: LOCATION_WORDS,
      isLocation: isLocation
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

    console.log("✅ Page Level Detector v22.48 Ready — STABLE EDITION!");
    console.log("🔧 FIX 2: SUB-PILLAR DETECTION LENGKAP");
    console.log("🔧 FIX 3: COMMERCIAL INTENT LENGKAP");
    console.log("🔧 FIX 4: MONEY_CHILD PRIORITAS (location → MC)");
    console.log("🔧 FIX 5: VARIANT + HARGA → MONEY_PAGE");
    console.log("🔧 FIX 6: FALLBACK CERDAS");
    console.log("📌 MANUAL: ENTITY_PILLAR_NAMES (tanpa auto-add)");
    console.log("");
    console.log("📊 CONTOH HASIL (100% AKURASI):");
    console.log("  ✅ 'harga pagar panel' → MONEY_MASTER");
    console.log("  ✅ 'harga pagar panel beton' → MONEY_PAGE");
    console.log("  ✅ 'harga pagar panel jakarta' → MONEY_CHILD");
    console.log("  ✅ 'pagar panel beton motif' → VARIANT");
    console.log("  ✅ 'harga pagar panel beton motif' → MONEY_PAGE");
    console.log("  ✅ 'panduan pagar panel' → PILLAR");
    console.log("  ✅ 'rekomendasi pagar panel' → SUB-PILLAR TIPE 2");
    console.log("  ✅ 'perbandingan pagar panel' → SUB-PILLAR TIPE 1");

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

  log('🚀 Starting Page Level Detector v22.48...', 'INFO');

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
