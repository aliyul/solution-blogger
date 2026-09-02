/* ============================================================
 🧠 Page Level Detector v22.30 — DENGAN FOKUS KONTEN & STRUKTUR
    ✅ FIX v22.30: MM tetap MM meskipun ada kata "harga"
    ✅ ADD v22.30: Deteksi FOKUS KONTEN (INFORMASI / HARGA / GABUNG)
    ✅ ADD v22.30: Deteksi STRUKTUR (PISAH / GABUNG)
    ✅ ADD v22.30: Keterangan level dengan fokus konten
    ✅ FIX v22.29: VARIANT detection lebih dulu dari MONEY
    ✅ FIX v22.28: PRIORITAS LOCATION > SIZE (MC lebih prioritas)
    ✅ FIX v22.27: "murah/hemat/ekonomis/terjangkau" → MONEY_PAGE
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
    const icons = { 
      INFO: "📘", SUCCESS: "✅", WARN: "⚠️", ERROR: "❌", 
      LOCATION: "📍", VARIANT: "🔬", COMMERCIAL: "🛒", PRICE: "💰",
      FOCUS: "🎯", STRUCTURE: "🏗️", LEVEL: "📊"
    };
    console.log(`${icons[type] || "📘"} [PLD v22.30] ${message}`);
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
  // 📌 ENTITY PILLAR NAMES
  // ============================================================

  const ENTITY_PILLAR_NAMES = {
    jasa: ["jasa konstruksi"],
    desain: ["jasa desain interior"],
    sewa: ["sewa alat konstruksi", "rental alat konstruksi"],
    produk: ["produk konstruksi"],
    "produk interior": ["produk interior", "interior produk"],
    material: ["material konstruksi", "bahan konstruksi"],
    artikel: ["artikel konstruksi", "blog konstruksi", "tips konstruksi"]
  };

  // ============================================================
  // 📌 DATABASE LOKASI (LENGKAP)
  // ============================================================

  const LOCATION_DATABASE = {
    "jakarta": {
      provinsi: "DKI Jakarta",
      kabupaten_kota: [
        { nama: "Jakarta Pusat", kecamatan: ["Gambir", "Sawah Besar", "Kemayoran", "Senen", "Cempaka Putih", "Menteng", "Tanah Abang", "Johar Baru"] },
        { nama: "Jakarta Utara", kecamatan: ["Penjaringan", "Tanjung Priok", "Koja", "Kelapa Gading", "Cilincing", "Pademangan"] },
        { nama: "Jakarta Barat", kecamatan: ["Kembangan", "Kebon Jeruk", "Palmerah", "Grogol Petamburan", "Tambora", "Kalideres", "Cengkareng"] },
        { nama: "Jakarta Selatan", kecamatan: ["Setiabudi", "Mampang Prapatan", "Pasar Minggu", "Jagakarsa", "Cilandak", "Pesanggrahan", "Kebayoran Lama", "Kebayoran Baru", "Tebet", "Pancoran"] },
        { nama: "Jakarta Timur", kecamatan: ["Matraman", "Pulogadung", "Jatinegara", "Kramat Jati", "Pasar Rebo", "Cakung", "Duren Sawit", "Makasar", "Ciracas", "Cipayung"] },
        { nama: "Kepulauan Seribu", kecamatan: ["Kepulauan Seribu Utara", "Kepulauan Seribu Selatan"] }
      ]
    },
    "bandung": {
      provinsi: "Jawa Barat",
      kabupaten_kota: [
        { nama: "Bandung", kecamatan: ["Andir", "Antapani", "Arcamanik", "Astana Anyar", "Babakan Ciparay", "Bandung Kidul", "Bandung Kulon", "Bandung Wetan", "Batununggal", "Bojongloa Kaler", "Bojongloa Kidul", "Cibeunying Kaler", "Cibeunying Kidul", "Cibiru", "Cicendo", "Cidadap", "Cinambo", "Coblong", "Gedebage", "Kiaracondong", "Lengkong", "Mandalajati", "Panyileukan", "Rancasari", "Regol", "Sukajadi", "Sukasari", "Sumur Bandung", "Ujungberung"] },
        { nama: "Bandung Barat", kecamatan: ["Batujajar", "Cihampelas", "Cikalong Wetan", "Cililin", "Cipatat", "Cipeundeuy", "Cipongkor", "Gununghalu", "Lembang", "Ngamprah", "Padalarang", "Parongpong", "Rongga", "Saguling", "Sindangkerta"] }
      ]
    },
    "bekasi": {
      provinsi: "Jawa Barat",
      kabupaten_kota: [
        { nama: "Bekasi", kecamatan: ["Bantargebang", "Bekasi Barat", "Bekasi Selatan", "Bekasi Timur", "Bekasi Utara", "Jatiasih", "Jatisampurna", "Medansatria", "Mustikajaya", "Pondokgede", "Pondokmelati", "Rawalumbu"] },
        { nama: "Bekasi Barat", kecamatan: ["Babelan", "Bojongmangu", "Cabangbungin", "Cibarusah", "Cibitung", "Cikarang Barat", "Cikarang Pusat", "Cikarang Selatan", "Cikarang Timur", "Cikarang Utara", "Karangbahagia", "Kedungwaringin", "Muaragembong", "Pebayuran", "Serang Baru", "Setu", "Sukakarya", "Sukatani", "Sukawangi", "Tambelang", "Tambun Selatan", "Tambun Utara", "Tarumajaya"] }
      ]
    },
    "tangerang": {
      provinsi: "Banten",
      kabupaten_kota: [
        { nama: "Tangerang", kecamatan: ["Batuceper", "Benda", "Cibodas", "Ciledug", "Cipondoh", "Jatiuwung", "Karang Tengah", "Karawaci", "Larangan", "Neglasari", "Periuk", "Pinang", "Tangerang"] },
        { nama: "Tangerang Selatan", kecamatan: ["Ciputat", "Ciputat Timur", "Pamulang", "Pondok Aren", "Serpong", "Serpong Utara", "Setu"] }
      ]
    },
    "depok": {
      provinsi: "Jawa Barat",
      kabupaten_kota: [
        { nama: "Depok", kecamatan: ["Beji", "Bojongsari", "Cilodong", "Cimanggis", "Cinere", "Cipayung", "Limo", "Pancoran Mas", "Sawangan", "Sukmajaya", "Tapos"] }
      ]
    },
    "bogor": {
      provinsi: "Jawa Barat",
      kabupaten_kota: [
        { nama: "Bogor", kecamatan: ["Bogor Barat", "Bogor Selatan", "Bogor Timur", "Bogor Utara", "Tanah Sereal"] },
        { nama: "Bogor Barat", kecamatan: ["Babakan Madang", "Bojong Gede", "Caringin", "Ciampea", "Ciawi", "Cibinong", "Cibungbulang", "Cigombong", "Cijeruk", "Cileungsi", "Ciomas", "Cisarua", "Ciseeng", "Citeureup", "Dramaga", "Gunung Putri", "Gunung Sindur", "Jasinga", "Jonggol", "Kemang", "Klapanunggal", "Leuwiliang", "Leuwisadeng", "Megamendung", "Nanggung", "Pamijahan", "Parung", "Parung Panjang", "Ranca Bungur", "Rumpin", "Sukajaya", "Sukamakmur", "Sukaraja", "Tajurhalang", "Tamansari", "Tanjungsari", "Tenjo", "Tenjolaya"] }
      ]
    },
    "surabaya": {
      provinsi: "Jawa Timur",
      kabupaten_kota: [
        { nama: "Surabaya", kecamatan: ["Asemrowo", "Benowo", "Bubutan", "Bulak", "Dukuh Pakis", "Gayungan", "Genteng", "Gubeng", "Gunung Anyar", "Jambangan", "Karangpilang", "Kenjeran", "Krembangan", "Lakarsantri", "Mulyorejo", "Pabean Cantian", "Pakal", "Rungkut", "Sambikerep", "Sawahan", "Semampir", "Simokerto", "Sukolilo", "Sukomanunggal", "Tambaksari", "Tandes", "Tegalsari", "Tenggilis Mejoyo", "Wiyung", "Wonocolo", "Wonokromo"] }
      ]
    },
    "medan": {
      provinsi: "Sumatera Utara",
      kabupaten_kota: [
        { nama: "Medan", kecamatan: ["Medan Amplas", "Medan Area", "Medan Barat", "Medan Baru", "Medan Belawan", "Medan Deli", "Medan Denai", "Medan Helvetia", "Medan Johor", "Medan Kota", "Medan Labuhan", "Medan Maimun", "Medan Marelan", "Medan Perjuangan", "Medan Petisah", "Medan Polonia", "Medan Selayang", "Medan Sunggal", "Medan Tembung", "Medan Timur", "Medan Tuntungan"] }
      ]
    },
    "makassar": {
      provinsi: "Sulawesi Selatan",
      kabupaten_kota: [
        { nama: "Makassar", kecamatan: ["Biringkanaya", "Bontoala", "Mamajang", "Manggala", "Mariso", "Panakkukang", "Rappocini", "Tallo", "Tamalanrea", "Tamalate", "Ujung Pandang", "Ujung Tanah", "Wajo"] }
      ]
    },
    "bali": {
      provinsi: "Bali",
      kabupaten_kota: [
        { nama: "Denpasar", kecamatan: ["Denpasar Barat", "Denpasar Selatan", "Denpasar Timur", "Denpasar Utara"] },
        { nama: "Badung", kecamatan: ["Abiansemal", "Kuta", "Kuta Selatan", "Kuta Utara", "Mengwi", "Petang"] }
      ]
    },
    "semarang": {
      provinsi: "Jawa Tengah",
      kabupaten_kota: [
        { nama: "Semarang", kecamatan: ["Banyumanik", "Candisari", "Gajahmungkur", "Gayamsari", "Genuk", "Gunungpati", "Mijen", "Ngaliyan", "Pedurungan", "Semarang Barat", "Semarang Selatan", "Semarang Tengah", "Semarang Timur", "Semarang Utara", "Tembalang", "Tugu"] }
      ]
    },
    "yogyakarta": {
      provinsi: "DI Yogyakarta",
      kabupaten_kota: [
        { nama: "Yogyakarta", kecamatan: ["Danurejan", "Gedongtengen", "Gondokusuman", "Gondomanan", "Jetis", "Kotagede", "Kraton", "Mantrijeron", "Mergangsan", "Ngampilan", "Pakualaman", "Tegalrejo", "Umbulharjo", "Wirobrajan"] }
      ]
    },
    "solo": {
      provinsi: "Jawa Tengah",
      kabupaten_kota: [
        { nama: "Surakarta", kecamatan: ["Banjarsari", "Jebres", "Laweyan", "Pasar Kliwon", "Serengan"] }
      ]
    }
  };

  // ============================================================
  // 📌 KEYWORDS
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
  // 🔥 PRICE WORDS
  // ============================================================
  const PRICE_WORDS = ["harga", "biaya", "tarif", "ongkos"];
  
  // ============================================================
  // 🔥 HIGH VOLUME COMMERCIAL WORDS
  // ============================================================
  const HIGH_VOLUME_WORDS = [
    "murah", "hemat", "ekonomis", "terjangkau", "budget", 
    "premium", "luxury", "mewah", "mahal"
  ];
  
  const SIZE_WORDS = ["mini", "besar", "kecil", "sedang", "medium", "extra", "ekstra", "standar"];
  
  // ============================================================
  // 🔥 COMMERCIAL WORDS
  // ============================================================
  const COMMERCIAL_WORDS = ['jual', 'beli', 'sewa', 'rental', 'order', 'pesan', 'pemesanan', 'butuh', 'cari'];

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
  // 📌 SPECIFICATION WORDS
  // ============================================================

  const SPECIFICATION_WORDS = {
    primary: [
      "ukuran", "spesifikasi", "dimensi", "detail", "parameter", 
      "standar", "mutu", "kualitas", "grade", "kelas", "tipe", "model", "varian", "seri"
    ],
    dimension: [
      "tinggi", "rendah", "panjang", "pendek", "lebar", "sempit", 
      "tebal", "tipis", "dalam", "dangkal", "diameter", "radius", 
      "luas", "volume", "kedalaman", "ketebalan"
    ],
    finishing: [
      "polos", "motif", "bermotif", "bercorak", "tekstur", "serat", 
      "halus", "kasar", "matte", "glossy", "doff", "gloss", "satin", 
      "anyaman", "natural", "ekspos", "custom", "polosan"
    ],
    application: [
      "perumahan", "pabrik", "gudang", "sekolah", "rumah sakit", 
      "pertambangan", "kandang", "ternak", "industri", "komersial", 
      "residensial", "kavling", "lahan", "kosong", "pembatas", 
      "keamanan", "kedap", "suara", "banjir", "tahan", "lama", 
      "cepat", "dipasang", "terpasang", "terinstal"
    ],
    method: [
      "hidrolik", "manual", "auger", "rotary", "percussive", 
      "dry", "wet", "basah", "kering", "coring", "cutting", 
      "drilling", "pengeboran", "pemancangan", "pemasangan",
      "metode", "teknik", "cara"
    ],
    technique: [
      "coring", "cutting", "drilling", "pengeboran", "pemancangan",
      "pengerjaan", "bongkar", "pasang", "potong", "las", "sambung",
      "grinding", "welding", "bending", "forming"
    ]
  };

  const ALL_SPEC_WORDS = [
    ...SPECIFICATION_WORDS.primary,
    ...SPECIFICATION_WORDS.dimension,
    ...SPECIFICATION_WORDS.finishing,
    ...SPECIFICATION_WORDS.application,
    ...SPECIFICATION_WORDS.method,
    ...SPECIFICATION_WORDS.technique
  ];

  const SPEC_PHRASES_AT_END = [
    "kedap suara", "tahan banjir", "tahan lama", "cepat dipasang",
    "rumah sakit", "pembatas lahan", "perumahan", "pertambangan",
    "keamanan", "kedap", "suara", "banjir", "tahan", "lama",
    "cepat", "dipasang", "terpasang", "terinstal"
  ];

  // ============================================================
  // 📌 UNIVERSAL QUALITY WORDS
  // ============================================================

  const UNIVERSAL_QUALITY_WORDS = {
    quality: ["mutu", "kualitas", "grade", "kelas", "standar"],
    method: ["hidrolik", "manual", "auger", "rotary", "percussive", "dry", "wet", "basah", "kering"],
    condition: ["terpasang", "terinstal", "tertanam", "terbenam", "tercetak", "terbentuk", "terbuat"],
    technique: ["coring", "cutting", "drilling", "pengeboran", "pemancangan", "pemasangan"],
    technical: ["dalam", "dangkal", "kedalaman", "diameter", "ketebalan"],
    finishing: ["polos", "motif", "tekstur", "serat", "halus", "kasar", "matte", "glossy", "doff", "gloss", "satin", "natural", "ekspos", "custom", "standar", "premium", "ekonomis", "modern", "klasik", "minimalis", "tradisional", "elegan", "mewah"]
  };

  // ============================================================
  // 📌 MONEY MASTER OVERRIDES
  // ============================================================

  const MONEY_MASTER_OVERRIDES = [
    'pagar panel', 'pagar beton', 'panel beton',
    'tiang pancang', 'bore pile', 'strauss pile',
    'pondasi', 'cor beton', 'readymix', 'ready mix',
    'jasa konstruksi', 'jasa bangunan',
    'jasa pasang', 'jasa pemasangan', 'jasa perbaikan',
    'jasa renovasi', 'jasa pembongkaran', 'jasa pengaspalan',
    'baja ringan', 'besi beton', 'semen', 'pasir', 'batu split',
    'keramik', 'granit', 'marmer', 'plafon', 'gypsum',
    'kanopi', 'paving block', 'u ditch', 'box culvert',
    'jasa cor', 'jasa pondasi', 'jasa tiang pancang',
    'jasa bore pile', 'jasa strauss pile', 'jasa pengaspalan jalan'
  ];

  // ============================================================
  // 📌 FUNGSI DETEKSI FOKUS KONTEN (BARU v22.30)
  // ============================================================

  function detectContentFocus(text, pageLevel) {
    if (!text) return { focus: 'harga', structure: 'gabung', reason: 'default' };
    
    const lower = text.toLowerCase();
    
    // ============================================================
    // 🔥 CEK FOKUS KONTEN
    // ============================================================
    
    // KATA KUNCI INFORMASI/EDUKASI
    const infoKeywords = [
      'panduan', 'spesifikasi', 'keunggulan', 'cara memilih', 'tips',
      'perbedaan', 'jenis', 'apa itu', 'pengertian', 'informasi',
      'standar', 'mutu', 'ukuran', 'komponen', 'bahan', 'material',
      'panduan lengkap', 'lengkap', 'solusi', 'rekomendasi', 'penjelasan',
      'karakteristik', 'kelebihan', 'kekurangan', 'fungsi', 'manfaat'
    ];
    
    // KATA KUNCI HARGA
    const priceKeywords = [
      'harga', 'biaya', 'tarif', 'estimasi', 'rp', 'rupiah',
      'per meter', 'per lembar', 'per batang', 'per kubik',
      'promo', 'diskon', 'penawaran', 'cost', 'budget',
      'uang', 'pembayaran', 'cicilan', 'kredit'
    ];
    
    let infoScore = 0;
    let priceScore = 0;
    
    infoKeywords.forEach(k => { if (lower.includes(k)) infoScore++; });
    priceKeywords.forEach(k => { if (lower.includes(k)) priceScore++; });
    
    // CEK TABEL HARGA
    const tables = document.querySelectorAll('table');
    let hasPriceTable = false;
    tables.forEach(table => {
      const tableText = table.innerText.toLowerCase();
      if (tableText.includes('harga') || tableText.includes('biaya') || tableText.includes('estimasi')) {
        const numbers = tableText.match(/[\d.,]+/g);
        if (numbers && numbers.length >= 2) hasPriceTable = true;
      }
    });
    
    // CEK FORMAT RUPIAH
    const hasRpFormat = /Rp\s*[\d.,]+/.test(lower);
    
    // CEK TAHUN DI H1
    const h1 = document.querySelector('h1')?.innerText?.toLowerCase() || '';
    const hasYear = /\b(20[2-9][0-9])\b/.test(h1);
    
    // ============================================================
    // 🔥 TENTUKAN FOKUS KONTEN
    // ============================================================
    
    let focus = 'harga';
    let focusReason = '';
    
    // PRIORITAS 1: Tahun di H1 → HARGA (wajib non-evergreen)
    if (hasYear) {
      focus = 'harga';
      focusReason = 'H1 mengandung tahun (wajib non-evergreen)';
    }
    // PRIORITAS 2: Tabel harga → HARGA
    else if (hasPriceTable) {
      focus = 'harga';
      focusReason = 'Ada tabel harga';
    }
    // PRIORITAS 3: Format Rp → HARGA
    else if (hasRpFormat) {
      focus = 'harga';
      focusReason = 'Ada format Rp';
    }
    // PRIORITAS 4: Price Score > Info Score → HARGA
    else if (priceScore > infoScore) {
      focus = 'harga';
      focusReason = `Price Score (${priceScore}) > Info Score (${infoScore})`;
    }
    // PRIORITAS 5: Info Score >= Price Score → INFORMASI
    else if (infoScore >= priceScore) {
      focus = 'informasi';
      focusReason = `Info Score (${infoScore}) >= Price Score (${priceScore})`;
    }
    // DEFAULT
    else {
      focus = 'harga';
      focusReason = 'Default (harga)';
    }
    
    // ============================================================
    // 🔥 TENTUKAN STRUKTUR (PISAH / GABUNG)
    // ============================================================
    
    let structure = 'gabung';
    let structureReason = '';
    
    // CEK APAKAH ADA INDIKASI PISAH
    const hasSeparateUrls = document.querySelectorAll('a[href*="harga-"], a[href*="panduan-"], a[href*="spesifikasi-"]').length > 3;
    const hasBothInfoAndPrice = infoScore >= 2 && priceScore >= 2;
    
    if (hasBothInfoAndPrice && hasSeparateUrls) {
      structure = 'pisah';
      structureReason = 'Ada konten informasi dan harga terpisah';
    } else if (hasBothInfoAndPrice) {
      structure = 'gabung';
      structureReason = 'Informasi dan harga dalam 1 halaman';
    } else if (focus === 'informasi') {
      structure = 'pisah';
      structureReason = 'Fokus informasi (harga terpisah)';
    } else {
      structure = 'pisah';
      structureReason = 'Fokus harga (informasi terpisah)';
    }
    
    log(`📊 Focus: ${focus} (${focusReason})`, "FOCUS");
    log(`🏗️ Structure: ${structure} (${structureReason})`, "STRUCTURE");
    
    return { focus, focusReason, structure, structureReason, infoScore, priceScore, hasYear, hasPriceTable, hasRpFormat };
  }

  // ============================================================
  // 📌 FUNGSI DETEKSI VARIANT
  // ============================================================

  function detectVariantByPattern(text, entityType) {
    if (!text) return { isVariant: false, score: 0, reasons: [] };
    
    let score = 0;
    let reasons = [];
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/);
    
    // ============================================================
    // 🔥 EXCLUSION: BUKAN VARIANT (PRIORITAS TERTINGGI)
    // ============================================================
    
    // Price word → MONEY_PAGE (BUKAN VARIANT)
    if (PRICE_WORDS.some(w => lower.includes(w))) {
      log(`"${text}" → BUKAN variant (price word) → MONEY_PAGE`, "PRICE");
      return { isVariant: false, score: 0, reasons: ["Price word → MONEY_PAGE"] };
    }
    
    // High volume → MONEY_PAGE (BUKAN VARIANT)
    const hasHighVolume = HIGH_VOLUME_WORDS.some(w => lower.includes(w));
    if (hasHighVolume) {
      const hasNoun = /\b(jasa|layanan|produk|material|barang|pondasi|tiang|pancang|pagar|panel|beton|baja|besi|kayu|batu|keramik|granit|marmer|plafon|gypsum|kanopi|paving|readymix|cor|sewa|rental|alat|mesin|peralatan|bangunan|konstruksi|rumah|gedung|ruko|gudang|pabrik|jalan|jembatan|infrastruktur)\b/i.test(lower);
      if (hasNoun) {
        log(`"${text}" → BUKAN variant (high volume) → MONEY_PAGE`, "PRICE");
        return { isVariant: false, score: 0, reasons: ["High volume keyword → MONEY_PAGE"] };
      }
    }
    
    // Size + service → MONEY_PAGE (BUKAN VARIANT)
    const hasSizeWord = SIZE_WORDS.some(w => lower.includes(w));
    if (hasSizeWord) {
      const hasServiceWord = /\b(jasa|harga|biaya|sewa|layanan|produk|material)\b/i.test(lower);
      if (hasServiceWord) {
        log(`"${text}" → BUKAN variant (size + service) → MONEY_PAGE`, "PRICE");
        return { isVariant: false, score: 0, reasons: ["Size word + service → MONEY_PAGE"] };
      }
    }
    
    // Commercial word → MONEY_PAGE (BUKAN VARIANT)
    if (COMMERCIAL_WORDS.some(w => lower.includes(w))) {
      log(`"${text}" → BUKAN variant (commercial word) → MONEY_PAGE`, "COMMERCIAL");
      return { isVariant: false, score: 0, reasons: ["Commercial word → MONEY_PAGE"] };
    }
    
    // Location + service → MONEY_CHILD (BUKAN VARIANT)
    if (LOCATION_WORDS.some(w => lower.includes(w))) {
      const hasService = /\b(jasa|layanan|sewa|produk|material|kontraktor|tukang|borongan|pasang|bangun|renovasi|perbaikan|instalasi|service|servis|pemasangan|pemancangan|pengeboran|pondasi|tiang|pancang|pagar|panel|beton|baja|besi|kayu|batu|keramik|granit|marmer|plafon|gypsum|kanopi|paving|readymix|cor|desain|interior|eksterior|arsitektur|konstruksi|rumah|gedung|ruko|gudang|pabrik|jalan|jembatan|infrastruktur)\b/i.test(lower);
      if (hasService) {
        log(`"${text}" → BUKAN variant (location + service) → MONEY_CHILD`, "LOCATION");
        return { isVariant: false, score: 0, reasons: ["Location word → MONEY_CHILD"] };
      }
    }
    
    // Per unit pattern → MONEY_PAGE (BUKAN VARIANT)
    if (/\bper\s+(meter|titik|m|kg|hari|jam|minggu|bulan|unit|buah|item|lembar|bagian|paket|sesi|kali|kubik|m2|m3|liter|ton|meter lari|m')\b/i.test(lower)) {
      log(`"${text}" → BUKAN variant (per unit pattern) → MONEY_PAGE`, "PRICE");
      return { isVariant: false, score: 0, reasons: ["Per unit → MONEY_PAGE"] };
    }
    
    // ============================================================
    // 🔥 VARIANT DETECTION (SISA YANG TIDAK TERCOVER)
    // ============================================================
    
    const firstWord = words[0] || "";
    const isSpecWord = ALL_SPEC_WORDS.some(spec => firstWord === spec);
    
    if (isSpecWord) {
      if (!PRICE_WORDS.some(w => lower.includes(w)) && !LOCATION_WORDS.some(w => lower.includes(w))) {
        if (!HIGH_VOLUME_WORDS.some(w => lower.includes(w)) && !SIZE_WORDS.some(w => lower.includes(w))) {
          log(`✅ VARIANT: specification at start: "${firstWord}" → "${text}"`, "VARIANT");
          return { isVariant: true, score: 5, reasons: [`Specification word "${firstWord}" at start → VARIANT`] };
        }
      }
    }
    
    const specFirstPatterns = [
      { pattern: /^(tinggi|rendah|panjang|pendek|lebar|sempit|tebal|tipis|dalam|dangkal|diameter|radius|ukuran|dimensi)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer|jasa|layanan|produk|material)/i, score: 4, reason: "Dimension + noun (spec first)" },
      { pattern: /^(polos|motif|bermotif|bercorak|tekstur|serat|halus|kasar|matte|glossy|doff|gloss|satin|anyaman|natural|ekspos|custom|standar|premium|ekonomis|modern|klasik|minimalis|tradisional|elegan|mewah|polosan)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer|jasa|layanan|produk|material)/i, score: 4, reason: "Finishing + noun (spec first)" },
      { pattern: /^(perumahan|pabrik|gudang|sekolah|rumah sakit|pertambangan|kandang|ternak|industri|komersial|residensial|kavling|lahan|kosong|pembatas|keamanan|kedap|suara|banjir|tahan|lama|cepat|dipasang|terpasang|terinstal)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer|jasa|layanan|produk|material)/i, score: 3, reason: "Application + noun (spec first)" },
      { pattern: /^(hidrolik|manual|auger|rotary|percussive|dry|wet|basah|kering|coring|cutting|drilling|pengeboran|pemancangan|pemasangan|bongkar|pasang|potong|las|sambung|metode|teknik|cara)\s+(jasa|layanan|produk|material|sewa|tiang|pancang|bore|pile|pondasi|beton|baja|besi|kayu|batu|keramik|granit|marmer|plafon|gypsum|kanopi|paving|readymix|cor)/i, score: 4, reason: "Method/technique + noun (spec first)" },
    ];
    
    for (const pattern of specFirstPatterns) {
      if (pattern.pattern.test(lower)) {
        if (!PRICE_WORDS.some(w => lower.includes(w)) && !LOCATION_WORDS.some(w => lower.includes(w))) {
          if (!HIGH_VOLUME_WORDS.some(w => lower.includes(w)) && !SIZE_WORDS.some(w => lower.includes(w))) {
            score += pattern.score;
            reasons.push(pattern.reason);
            log(`VARIANT pattern: ${pattern.reason}`, "VARIANT");
          }
        }
      }
    }
    
    const lastWord = words[words.length - 1] || "";
    const isSpecAtEnd = ALL_SPEC_WORDS.some(spec => lastWord === spec);
    const lastTwoWords = words.slice(-2).join(" ");
    const isSpecPhraseAtEnd = SPEC_PHRASES_AT_END.some(phrase => lastTwoWords === phrase);
    
    if (isSpecAtEnd || isSpecPhraseAtEnd) {
      if (!PRICE_WORDS.some(w => lower.includes(w)) && !LOCATION_WORDS.some(w => lower.includes(w))) {
        if (!HIGH_VOLUME_WORDS.some(w => lower.includes(w)) && !SIZE_WORDS.some(w => lower.includes(w))) {
          const hasNoun = /^(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer|jasa|layanan|produk|material|sewa|alat|mesin)/i.test(lower);
          if (hasNoun || words.length >= 3) {
            log(`✅ VARIANT: specification at end: "${lastWord || lastTwoWords}" → "${text}"`, "VARIANT");
            return { isVariant: true, score: 5, reasons: [`Specification "${lastWord || lastTwoWords}" at end → VARIANT`] };
          }
        }
      }
    }
    
    const supportedEntities = ["jasa", "sewa", "produk", "material", "desain"];
    if (supportedEntities.includes(entityType)) {
      const qualityResult = detectUniversalQualityWords(text, entityType);
      if (qualityResult.hasSpec) {
        if (!PRICE_WORDS.some(w => lower.includes(w)) && !LOCATION_WORDS.some(w => lower.includes(w))) {
          if (!HIGH_VOLUME_WORDS.some(w => lower.includes(w)) && !SIZE_WORDS.some(w => lower.includes(w))) {
            score += qualityResult.score;
            reasons = reasons.concat(qualityResult.reasons);
            log(`UNIVERSAL QUALITY [${entityType}]: +${qualityResult.score} points`, "VARIANT");
          }
        }
      }
    }
    
    const threshold = 3;
    const isVariant = score >= threshold;
    
    if (isVariant) {
      log(`✅ VARIANT DETECTED: "${text}" [${entityType}] | Score: ${score}`, "SUCCESS");
    } else {
      log(`❌ NOT VARIANT: "${text}" [${entityType}] | Score: ${score}`, "INFO");
    }
    
    return { isVariant, score, reasons };
  }

  // ============================================================
  // 📌 FUNGSI DETEKSI UNIVERSAL QUALITY WORDS
  // ============================================================

  function detectUniversalQualityWords(text, entityType) {
    if (!text) return { hasSpec: false, score: 0, reasons: [] };
    
    const lower = text.toLowerCase();
    let hasSpec = false;
    let score = 0;
    let reasons = [];
    
    let relevantCategories = [];
    
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
    
    for (const category of relevantCategories) {
      const words = UNIVERSAL_QUALITY_WORDS[category] || [];
      for (const word of words) {
        if (lower.includes(word)) {
          hasSpec = true;
          score += 3;
          reasons.push(`Quality word [${category}]: "${word}"`);
          break;
        }
      }
    }
    
    const numUnitPattern = /\b(\d+(?:\.\d+)?)\s*(m|mm|cm|meter|kg|ton|inch|inci|liter|m³|m2|m²|m3|cm2|cm²|cm3|cm³|km|milimeter|sentimeter|kilogram)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer)/i;
    if (numUnitPattern.test(lower)) {
      hasSpec = true;
      score += 3;
      reasons.push(`Quality word [technical]: "numeric + unit + noun"`);
    }
    
    return { hasSpec, score, reasons };
  }

  // ============================================================
  // 📌 FUNGSI OVERRIDE PILLAR → MONEY_MASTER
  // ============================================================

  function overridePillarToMoneyMaster(pageName, detectedLevel, parentLevel) {
    if (parentLevel === 'sub-pillar-tipe-1') {
      log(`OVERRIDE: "${pageName}" → PILLAR → MONEY_MASTER (parent is SP1)`, 'SUCCESS');
      return 'money-master';
    }
    
    if (detectedLevel === 'pillar') {
      const lower = pageName.toLowerCase();
      for (const kw of MONEY_MASTER_OVERRIDES) {
        if (lower.includes(kw)) {
          const isGuide = /panduan|cara|tips|tutorial|langkah|pedoman/.test(lower);
          const isList = /daftar|jenis|macam|kategori|tipe/.test(lower);
          const isComparison = /perbandingan|vs|versus|kelebihan|kekurangan|perbedaan/.test(lower);
          
          if (!isGuide && !isList && !isComparison) {
            log(`OVERRIDE: "${pageName}" → PILLAR → MONEY_MASTER (keyword: ${kw})`, 'SUCCESS');
            return 'money-master';
          }
        }
      }
    }
    
    return detectedLevel;
  }

  // ============================================================
  // 📌 FUNGSI DETEKSI VARIANT LEVEL
  // ============================================================

  function detectVariantLevel(text, entityType) {
    if (isSubVariant(text)) return "sub-variant";
    if (hasTechnicalSpec(text)) return "variant";
    
    const result = detectVariantByPattern(text, entityType);
    if (result.isVariant) return "variant";
    
    return null;
  }

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

  function detectSubPillarLevel(text) {
    if (/perbandingan|vs|versus|kelebihan|kekurangan|perbedaan/.test(text)) return "sub-pillar-tipe-1";
    if (/daftar|jenis|macam|kategori|tipe/.test(text)) return "sub-pillar-tipe-2";
    return null;
  }

  function hasTechnicalSpec(text) {
    if (!text) return false;
    const lower = text.toLowerCase();
    const TECHNICAL_SPECS = ["k225", "k250", "k300", "k350", "k400", "k500", "fc", "m6", "m8", "m10", "m12", "m16", "m20", "b0", "b1", "b2", "b3", "sni"];
    for (const spec of TECHNICAL_SPECS) {
      if (new RegExp(`\\b${spec}\\b`, "i").test(lower)) return true;
    }
    return false;
  }

  function isSubVariant(text) {
    if (!text) return false;
    let score = 0;
    const lower = text.toLowerCase();
    if ((lower.match(/\d+\s*(m|mm|cm|meter|kg|ton|inch|inci)/gi) || []).length >= 1) score += 2;
    if ((lower.match(/\d+x\d+/gi) || []).length >= 1) score += 2;
    if ((lower.match(/\d+(?:\.\d+)?\s*(?:cm|mm|m|meter)\s*(?:x|×)\s*\d+(?:\.\d+)?\s*(?:cm|mm|m|meter)/gi) || []).length >= 1) score += 3;
    const uniqueNumbers = (text.match(/\d+/g) || []).filter((v, i, a) => a.indexOf(v) === i);
    if (uniqueNumbers.length >= 2) score += 1;
    if (/\bukuran\s+\d+/.test(lower)) score += 2;
    if (/\bdimensi\s+\d+/.test(lower)) score += 2;
    if (/\b(tebal|panjang|lebar|tinggi|dalam|diameter)\s+\d+/.test(lower)) score += 2;
    return score >= 2;
  }

  // ============================================================
  // 🔥 FUNGSI isLocation
  // ============================================================

  function isLocation(text) {
    if (!text) return false;
    const lower = cleanText(text);
    const allLocationWords = [...LOCATION_WORDS, "terdekat", "sekitar", "dekat", "near"];
    for (const word of allLocationWords) {
      if (new RegExp(`\\b${word.replace(/\s+/g, '\\s+')}\\b`, "i").test(lower)) return true;
    }
    return false;
  }

  function hasPrice(text) {
    return PRICE_WORDS.some(w => text.includes(w));
  }

  const JASA_ULTRA_COMMON_WORDS = ["jasa", "kontraktor", "tukang", "borongan", "renovasi", "pasang", "bangun", "perbaikan", "instalasi", "proyek", "cor", "gali", "urug", "angkut", "service", "servis", "desain", "interior", "eksterior"];
  const STOPWORDS = new Set(["dan", "atau", "serta", "yang", "dari", "ke", "di", "untuk", "dengan", "ini", "itu", "akan", "telah", "sudah", "masih", "pada", "oleh", "karena", "sehingga", "setelah", "sebelum"]);
  const MODIFIER_WORDS = ["modern", "minimalis", "mewah", "klasik", "tradisional", "kontemporer", "sederhana", "elegan", "premium", "luxury", "simple", "exclusive", "custom", "tanah", "beton", "batu", "kayu", "besi", "baja"];

  function cleanJasaText(text) {
    if (!text) return "";
    let cleaned = text.toLowerCase();
    for (const kw of JASA_ULTRA_COMMON_WORDS) {
      cleaned = cleaned.replace(new RegExp(`\\b${kw}\\b`, "g"), " ");
    }
    for (const sw of STOPWORDS) {
      cleaned = cleaned.replace(new RegExp(`\\b${sw}\\b`, "g"), " ");
    }
    cleaned = cleaned.replace(/\s+/g, " ").trim();
    return cleaned;
  }

  // ============================================================
  // 🔥 MONEY LEVEL DETECTION (v22.30 — MM tetap MM meskipun ada "harga")
  // ============================================================

  function detectMoneyLevel(text, entityType) {
    const hasPriceWord = hasPrice(text);
    const hasLocationWord = isLocation(text);
    const lowerText = text.toLowerCase();
    
    // ============================================================
    // 🔥 PRIORITAS 1: MM OVERRIDE — tetap MM meskipun ada "harga"
    // ============================================================
    
    // CEK APAKAH INI MERUPAKAN MM YANG SAH
    const mmOverrideList = [
      'pagar panel', 'pagar beton', 'panel beton',
      'tiang pancang', 'bore pile', 'strauss pile',
      'pondasi', 'cor beton', 'readymix', 'ready mix',
      'jasa konstruksi', 'jasa bangunan',
      'baja ringan', 'besi beton', 'semen', 'pasir', 'batu split'
    ];
    
    for (const mmKeyword of mmOverrideList) {
      if (lowerText.includes(mmKeyword) && !/[a-z]+/.test(lowerText.replace(mmKeyword, '').trim())) {
        // Jika teks = mmKeyword atau hanya + lokasi
        const hasOnlyLocation = LOCATION_WORDS.some(loc => lowerText.includes(loc));
        const hasOnlySize = SIZE_WORDS.some(s => lowerText.includes(s));
        const hasOnlyCommercial = COMMERCIAL_WORDS.some(c => lowerText.includes(c));
        const hasOnlyHighVolume = HIGH_VOLUME_WORDS.some(h => lowerText.includes(h));
        
        // Jika hanya ada lokasi atau size atau commercial, tetap MM
        const extraWords = lowerText.replace(mmKeyword, '').trim();
        const extraWordsCount = extraWords.split(/\s+/).filter(w => w.length > 2 && !STOPWORDS.has(w) && !LOCATION_WORDS.some(loc => w.includes(loc))).length;
        
        if (extraWordsCount <= 2) {
          log(`🎯 MM OVERRIDE: "${text}" → MONEY_MASTER (keyword: ${mmKeyword})`, 'LEVEL');
          return "money-master";
        }
      }
    }
    
    // ============================================================
    // 🔥 PRIORITAS 2: LOCATION + "terdekat" → MONEY_CHILD
    // ============================================================
    
    const hasNearWord = /\b(terdekat|sekitar|dekat|near)\b/i.test(lowerText);
    if (hasNearWord) {
      const hasService = /\b(jasa|layanan|sewa|produk|material|kontraktor|tukang|borongan|pasang|bangun|renovasi|perbaikan|instalasi|service|servis|pemasangan|pemancangan|pengeboran|pondasi|tiang|pancang|pagar|panel|beton|baja|besi|kayu|batu|keramik|granit|marmer|plafon|gypsum|kanopi|paving|readymix|cor|desain|interior|eksterior|arsitektur|konstruksi|rumah|gedung|ruko|gudang|pabrik|jalan|jembatan|infrastruktur|mini|pile|bore|strauss)\b/i.test(lowerText);
      if (hasService) {
        log(`📍 "terdekat" OVERRIDE: "${text}" → MONEY_CHILD`, 'LOCATION');
        return "money-child";
      }
    }
    
    // ============================================================
    // 🔥 PRIORITAS 3: Location city + service → MONEY_CHILD
    // ============================================================
    
    if (hasLocationWord) {
      const hasService = /\b(jasa|layanan|sewa|produk|material|kontraktor|tukang|borongan|pasang|bangun|renovasi|perbaikan|instalasi|service|servis|pemasangan|pemancangan|pengeboran|pondasi|tiang|pancang|pagar|panel|beton|baja|besi|kayu|batu|keramik|granit|marmer|plafon|gypsum|kanopi|paving|readymix|cor|desain|interior|eksterior|arsitektur|konstruksi|rumah|gedung|ruko|gudang|pabrik|jalan|jembatan|infrastruktur|mini|pile|bore|strauss)\b/i.test(lowerText);
      if (hasService) {
        log(`📍 LOCATION OVERRIDE: "${text}" → MONEY_CHILD`, 'LOCATION');
        return "money-child";
      }
    }
    
    // ============================================================
    // 🔥 PRIORITAS 4: Commercial → cek untuk MM atau MP
    // ============================================================
    
    if (COMMERCIAL_WORDS.some(w => lowerText.startsWith(w))) {
      let coreText = lowerText;
      for (const cw of COMMERCIAL_WORDS) {
        coreText = coreText.replace(new RegExp(`^${cw}\\s+`), '');
      }
      const coreWords = coreText.split(/\s+/).filter(w => w.length > 2);
      const filteredCore = coreWords.filter(w => 
        !STOPWORDS.has(w) && !LOCATION_WORDS.some(loc => w.includes(loc))
      );
      
      // CEK APAKAH CORE ADALAH MM
      let isMM = false;
      for (const mmKeyword of mmOverrideList) {
        if (coreText.includes(mmKeyword)) {
          isMM = true;
          break;
        }
      }
      
      if (isMM || filteredCore.length <= 2) {
        log(`🎯 COMMERCIAL OVERRIDE: "${text}" → MM`, 'COMMERCIAL');
        return "money-master";
      } else {
        log(`🛒 COMMERCIAL: "${text}" → MONEY_PAGE`, 'COMMERCIAL');
        return "money-page";
      }
    }
    
    // ============================================================
    // 🔥 PRIORITAS 5: HIGH VOLUME → MONEY_PAGE
    // ============================================================
    
    const hasHighVolume = HIGH_VOLUME_WORDS.some(w => lowerText.includes(w));
    if (hasHighVolume) {
      const hasNoun = /\b(jasa|layanan|produk|material|pondasi|tiang|pancang|pagar|panel|beton|baja|besi|kayu|batu|keramik|granit|marmer|plafon|gypsum|kanopi|paving|readymix|cor|sewa|rental|alat|mesin|peralatan|bangunan|konstruksi|rumah|gedung|ruko|gudang|pabrik|jalan|jembatan|infrastruktur|mini|pile|bore|strauss|spesifikasi|ukuran|dimensi)\b/i.test(lowerText);
      if (hasNoun) {
        log(`🎯 HIGH VOLUME OVERRIDE: "${text}" → MONEY_PAGE`, 'PRICE');
        return "money-page";
      }
    }
    
    // ============================================================
    // 🔥 PRIORITAS 6: SIZE + SERVICE → MONEY_PAGE
    // ============================================================
    
    const hasSizeWord = SIZE_WORDS.some(w => lowerText.includes(w));
    if (hasSizeWord) {
      const hasService = /\b(jasa|harga|biaya|sewa|layanan|produk|material)\b/i.test(lowerText);
      if (hasService) {
        log(`🎯 SIZE + SERVICE OVERRIDE: "${text}" → MONEY_PAGE`, 'PRICE');
        return "money-page";
      }
    }
    
    // ============================================================
    // 🔥 PRIORITAS 7: Cek jumlah kata untuk MONEY_MASTER / MONEY_PAGE
    // ============================================================
    
    if (entityType === "sewa") {
      let core = text.replace(/\bsewa\b/g, "").replace(/\brental\b/g, "").trim();
      let words = core.split(/\s+/).filter(w => w.length > 2);
      words = words.filter(w => !STOPWORDS.has(w));
      words = words.filter(w => !LOCATION_WORDS.some(loc => w.includes(loc)));
      const wordCount = words.length;
      const specific = /\d/.test(core) || /(mini|hidrolik|diesel|breaker)/i.test(core);
      if (wordCount <= 2 && !specific) return "money-master";
      return "money-page";
    }
    
    if (entityType === "jasa" || entityType === "desain") {
      const core = cleanJasaText(text);
      const remainingWords = core.split(/\s+/).filter(w => w.length >= 2);
      const wordCount = remainingWords.length;
      const hasNumber = /\d/.test(core);
      const hasLocation = isLocation(core);
      const hasModifier = MODIFIER_WORDS.some(m => core.includes(m));
      if (wordCount <= 2 && !hasNumber && !hasLocation) return "money-master";
      return "money-page";
    }
    
    if (entityType === "produk" || entityType === "material") {
      let words = text.split(/\s+/).filter(w => w.length > 2);
      words = words.filter(w => !STOPWORDS.has(w));
      words = words.filter(w => !LOCATION_WORDS.some(loc => w.includes(loc)));
      const wordCount = words.length;
      const specific = /\d/.test(text) || hasTechnicalSpec(text);
      
      // CEK APAKAH INI MM
      let isMM = false;
      for (const mmKeyword of mmOverrideList) {
        if (lowerText.includes(mmKeyword)) {
          isMM = true;
          break;
        }
      }
      
      if (isMM || wordCount <= 2 && !specific) {
        return "money-master";
      }
      return "money-page";
    }
    
    return null;
  }

  // ============================================================
  // 📌 LOCATION HIERARCHY
  // ============================================================

  function detectLocationHierarchy(text) {
    if (!text) return { provinsi: null, kabupaten_kota: null, kecamatan: null, kota_utama: null };
    const lowerText = text.toLowerCase();
    let result = { provinsi: null, kabupaten_kota: null, kecamatan: null, kota_utama: null };
    for (const [city, data] of Object.entries(LOCATION_DATABASE)) {
      for (const regency of data.kabupaten_kota) {
        for (const kec of regency.kecamatan) {
          if (lowerText.includes(kec.toLowerCase())) {
            result.kecamatan = kec;
            result.kabupaten_kota = regency.nama;
            result.provinsi = data.provinsi;
            result.kota_utama = city;
            return result;
          }
        }
      }
    }
    for (const [city, data] of Object.entries(LOCATION_DATABASE)) {
      for (const regency of data.kabupaten_kota) {
        if (lowerText.includes(regency.nama.toLowerCase())) {
          result.kabupaten_kota = regency.nama;
          result.provinsi = data.provinsi;
          result.kota_utama = city;
          return result;
        }
      }
    }
    for (const city of Object.keys(LOCATION_DATABASE)) {
      if (lowerText.includes(city.toLowerCase())) {
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
    const allRegencies = [];
    for (const [city, data] of Object.entries(LOCATION_DATABASE)) {
      data.kabupaten_kota.forEach(regency => {
        allRegencies.push({ kota_utama: city, provinsi: data.provinsi, kabupaten_kota: regency.nama, kecamatan: regency.kecamatan });
      });
    }
    return allRegencies;
  }
  function getKecamatanByKabupatenKota(kabupatenKotaName) {
    for (const [city, data] of Object.entries(LOCATION_DATABASE)) {
      for (const regency of data.kabupaten_kota) {
        if (regency.nama.toLowerCase() === kabupatenKotaName.toLowerCase()) return regency.kecamatan;
      }
    }
    return [];
  }
  function getKecamatanByCity(cityKey) {
    const allKecamatan = [];
    const regencies = getRegencies(cityKey);
    regencies.forEach(regency => { allKecamatan.push(...regency.kecamatan); });
    return allKecamatan;
  }
  function getAllKecamatan() {
    const allKec = [];
    for (const [city, data] of Object.entries(LOCATION_DATABASE)) {
      for (const regency of data.kabupaten_kota) {
        allKec.push(...regency.kecamatan.map(k => ({ kecamatan: k, kabupaten_kota: regency.nama, kota_utama: city, provinsi: data.provinsi })));
      }
    }
    return allKec;
  }

  // ============================================================
  // 📌 GET CONFIDENCE SCORE & LEVEL INFO (v22.30 — DENGAN FOKUS KONTEN)
  // ============================================================

  function getConfidenceScore() {
    const text = getPageText();
    const entityType = detectEntityType();
    const level = detectPageLevel();
    const contentFocus = detectContentFocus(text, level);
    
    let confidence = 100;
    let strategies = [];
    
    if (entityType === "jasa" || entityType === "desain") {
      const core = cleanJasaText(text);
      const words = core.split(/\s+/).filter(w => w.length >= 2);
      const hasNumber = /\d/.test(core);
      const hasLocation = isLocation(core);
      if (words.length <= 2 && !hasNumber && !hasLocation) strategies.push("JASA: ≤2 kata → MM");
      else strategies.push("JASA: ≥3 kata → MP");
    }
    if (entityType === "produk" || entityType === "material") {
      const hasCommercial = COMMERCIAL_WORDS.some(w => text.toLowerCase().startsWith(w));
      if (hasCommercial) {
        let coreText = text.toLowerCase();
        for (const cw of COMMERCIAL_WORDS) {
          coreText = coreText.replace(new RegExp(`^${cw}\\s+`), '');
        }
        const coreWords = coreText.split(/\s+/).filter(w => w.length > 2);
        const filteredCore = coreWords.filter(w => 
          !STOPWORDS.has(w) && !LOCATION_WORDS.some(loc => w.includes(loc))
        );
        if (filteredCore.length <= 2) strategies.push("PRODUK: commercial override → MM");
        else strategies.push("PRODUK: commercial → MP");
      } else {
        const words = text.split(/\s+/).filter(w => w.length > 2);
        const filtered = words.filter(w => !STOPWORDS.has(w) && !LOCATION_WORDS.some(loc => w.includes(loc)));
        if (filtered.length <= 2) strategies.push("PRODUK: ≤2 kata → MM");
        else strategies.push("PRODUK: ≥3 kata → MP");
      }
    }
    
    return { 
      level, 
      confidence, 
      strategies, 
      strategyCount: strategies.length,
      contentFocus: contentFocus.focus,
      contentFocusReason: contentFocus.focusReason,
      structure: contentFocus.structure,
      structureReason: contentFocus.structureReason,
      infoScore: contentFocus.infoScore,
      priceScore: contentFocus.priceScore,
      hasYear: contentFocus.hasYear,
      hasPriceTable: contentFocus.hasPriceTable
    };
  }

  // ============================================================
  // 📌 UPDATE BODY ATTRIBUTES (v22.30 — DENGAN FOKUS KONTEN)
  // ============================================================

  function updateBodyAttributes() {
    const level = detectPageLevel();
    const entity = detectEntityType();
    const text = getPageText();
    const location = detectLocationHierarchy(text);
    const contentFocus = detectContentFocus(text, level);
    
    document.body.setAttribute("data-page-level", level);
    document.body.setAttribute("data-page-level-num", TYPE_LEVEL_MAP[level]);
    document.body.setAttribute("data-entity-type", entity);
    document.body.setAttribute("data-content-focus", contentFocus.focus);
    document.body.setAttribute("data-content-structure", contentFocus.structure);
    document.body.setAttribute("data-has-year", contentFocus.hasYear ? "true" : "false");
    
    if (location.provinsi) document.body.setAttribute("data-location-provinsi", location.provinsi);
    if (location.kabupaten_kota) document.body.setAttribute("data-location-kabupaten-kota", location.kabupaten_kota);
    if (location.kecamatan) document.body.setAttribute("data-location-kecamatan", location.kecamatan);
    if (location.kota_utama) document.body.setAttribute("data-location-kota-utama", location.kota_utama);
    
    return { 
      pageLevel: level, 
      pageLevelNum: TYPE_LEVEL_MAP[level], 
      entityType: entity, 
      location: location,
      contentFocus: contentFocus.focus,
      structure: contentFocus.structure,
      hasYear: contentFocus.hasYear
    };
  }

  // ============================================================
  // 📌 GET LEVEL WITH FOCUS (v22.30 — BARU)
  // ============================================================

  function getLevelWithFocus() {
    const level = detectPageLevel();
    const text = getPageText();
    const contentFocus = detectContentFocus(text, level);
    
    let levelDescription = '';
    
    switch(level) {
      case 'home': levelDescription = 'Homepage';
        break;
      case 'pillar': levelDescription = 'Pillar (Informasi)';
        break;
      case 'sub-pillar-tipe-2': levelDescription = 'Sub-Pillar Tipe 2 (Daftar/Kategori)';
        break;
      case 'sub-pillar-tipe-1': levelDescription = 'Sub-Pillar Tipe 1 (Perbandingan)';
        break;
      case 'money-master': 
        if (contentFocus.focus === 'informasi') {
          levelDescription = 'Money Master (Informasi - EVERGREEN)';
        } else if (contentFocus.focus === 'harga') {
          levelDescription = 'Money Master (Harga - NON-EVERGREEN)';
        } else {
          levelDescription = 'Money Master (Gabung - NON-EVERGREEN)';
        }
        break;
      case 'money-page':
        if (contentFocus.focus === 'informasi') {
          levelDescription = 'Money Page (Informasi - EVERGREEN)';
        } else if (contentFocus.focus === 'harga') {
          levelDescription = 'Money Page (Harga - NON-EVERGREEN)';
        } else {
          levelDescription = 'Money Page (Gabung - NON-EVERGREEN)';
        }
        break;
      case 'money-child':
        if (contentFocus.focus === 'informasi') {
          levelDescription = 'Money Child (Informasi - EVERGREEN)';
        } else if (contentFocus.focus === 'harga') {
          levelDescription = 'Money Child (Harga - NON-EVERGREEN)';
        } else {
          levelDescription = 'Money Child (Gabung - NON-EVERGREEN)';
        }
        break;
      case 'variant': levelDescription = 'Variant (Spesifikasi - EVERGREEN)';
        break;
      case 'sub-variant': levelDescription = 'Sub-Variant (Detail Teknis - EVERGREEN)';
        break;
      default: levelDescription = level;
    }
    
    return {
      level: level,
      levelDescription: levelDescription,
      focus: contentFocus.focus,
      structure: contentFocus.structure,
      hasYear: contentFocus.hasYear,
      isEvergreen: contentFocus.focus === 'informasi' || ['pillar', 'sub-pillar-tipe-2', 'sub-pillar-tipe-1', 'variant', 'sub-variant'].includes(level),
      infoScore: contentFocus.infoScore,
      priceScore: contentFocus.priceScore
    };
  }

  // ============================================================
  // 📌 MAIN DETECTOR (v22.30) — PRIORITAS VARIANT > MONEY
  // ============================================================

  function detectPageLevel(userOptions = {}) {
    if (isHomePage()) return "home";
    const text = getPageText();
    const entityType = detectEntityType(userOptions.userEntityType);
    log(`TEXT: "${text}"`, "INFO");
    log(`ENTITY: ${entityType}`, "INFO");
    
    // ============================================================
    // 🔥 STEP 1: PILLAR DETECTION
    // ============================================================
    
    const cleanTextLower = text.toLowerCase();
    let isPillar = false;
    let matchedPillarEntity = null;
    
    for (const [entity, patterns] of Object.entries(ENTITY_PILLAR_NAMES)) {
      if (patterns.some(pattern => cleanTextLower === pattern)) {
        isPillar = true;
        matchedPillarEntity = entity;
        break;
      }
    }
    
    if (isPillar) {
      const isEntityMatch = matchedPillarEntity === entityType || 
                           (matchedPillarEntity === "produk interior" && entityType === "produk");
      if (isEntityMatch) {
        log(`"${text}" → PILLAR (${entityType})`, "SUCCESS");
        window._lastSubPillarLevel = null;
        return "pillar";
      }
    }
    
    // ============================================================
    // 🔥 STEP 2: SUB-PILLAR DETECTION
    // ============================================================
    
    const subPillar = detectSubPillarLevel(text);
    if (subPillar) {
      window._lastSubPillarLevel = subPillar;
      log(`"${text}" → ${subPillar}`, "SUCCESS");
      return subPillar;
    }
    
    // ============================================================
    // 🔥 STEP 3: GET PARENT LEVEL
    // ============================================================
    
    const parentLevel = window._lastSubPillarLevel || null;
    log(`Parent level: ${parentLevel || 'none'}`, "INFO");
    
    // ============================================================
    // 🔥 STEP 4: DETECT LEVEL — PRIORITAS VARIANT > MONEY
    // ============================================================
    
    let detectedLevel = null;
    
    // 4A. PRIORITAS TERTINGGI: VARIANT DETECTION
    const variant = detectVariantLevel(text, entityType);
    if (variant) {
      detectedLevel = variant;
      log(`✅ VARIANT DETECTED: "${text}" → ${variant}`, 'VARIANT');
    }
    
    // 4B. Jika bukan VARIANT, baru MONEY LEVEL DETECTION
    if (!detectedLevel) {
      const money = detectMoneyLevel(text, entityType);
      if (money) {
        detectedLevel = money;
        log(`💰 MONEY DETECTED: "${text}" → ${money}`, 'PRICE');
      }
    }
    
    // 4C. Jika masih null, tentukan default
    if (!detectedLevel) {
      if (/panduan|cara|tips|tutorial|langkah|pedoman/.test(text)) {
        detectedLevel = "pillar";
      } else if (/daftar|jenis|macam|kategori|tipe/.test(text)) {
        detectedLevel = "sub-pillar-tipe-2";
      } else if (/perbandingan|vs|versus|kelebihan|kekurangan|perbedaan/.test(text)) {
        detectedLevel = "sub-pillar-tipe-1";
      } else {
        detectedLevel = "money-master";
      }
      log(`⚠️ DEFAULT: "${text}" → ${detectedLevel}`, 'WARN');
    }
    
    log(`Initial detected: "${text}" → ${detectedLevel}`, "INFO");
    
    // ============================================================
    // 🔥 STEP 5: OVERRIDE PILLAR → MONEY_MASTER
    // ============================================================
    
    if (parentLevel === 'sub-pillar-tipe-1') {
      const isRealPillar = Object.values(ENTITY_PILLAR_NAMES).some(patterns => 
        patterns.some(pattern => cleanTextLower === pattern)
      );
      
      if (!isRealPillar) {
        log(`FORCE: parent is SP1, "${text}" → MONEY_MASTER`, 'SUCCESS');
        detectedLevel = 'money-master';
        window._lastSubPillarLevel = null;
        return detectedLevel;
      }
    }
    
    if (detectedLevel === 'pillar') {
      const isRealPillar = Object.values(ENTITY_PILLAR_NAMES).some(patterns => 
        patterns.some(pattern => cleanTextLower === pattern)
      );
      
      if (!isRealPillar) {
        const overridden = overridePillarToMoneyMaster(text, detectedLevel, parentLevel);
        if (overridden !== detectedLevel) {
          detectedLevel = overridden;
          log(`OVERRIDE RESULT: "${text}" → ${detectedLevel}`, 'SUCCESS');
        }
      }
    }
    
    if (detectedLevel === 'sub-pillar-tipe-1') {
      window._lastSubPillarLevel = 'sub-pillar-tipe-1';
    }
    
    if (detectedLevel === 'money-master' || detectedLevel === 'money-page' || detectedLevel === 'money-child') {
      window._lastSubPillarLevel = null;
    }
    
    // ============================================================
    // 🔥 STEP 6: DAPATKAN FOKUS KONTEN & STRUKTUR
    // ============================================================
    
    const contentFocus = detectContentFocus(text, detectedLevel);
    const levelWithFocus = getLevelWithFocus();
    
    log(`📊 FINAL LEVEL: "${text}" → ${detectedLevel}`, 'LEVEL');
    log(`🎯 FOCUS: ${contentFocus.focus} (${contentFocus.focusReason})`, 'FOCUS');
    log(`🏗️ STRUCTURE: ${contentFocus.structure} (${contentFocus.structureReason})`, 'STRUCTURE');
    log(`📋 DESCRIPTION: ${levelWithFocus.levelDescription}`, 'LEVEL');
    
    return detectedLevel || "sub-pillar-tipe-2";
  }

  // ============================================================
  // 📌 EXPORT
  // ============================================================

  window.pageLevelDetectorv22 = {
    detect: detectPageLevel,
    updateAttributes: updateBodyAttributes,
    getConfidenceScore: getConfidenceScore,
    getLevelWithFocus: getLevelWithFocus,
    detectContentFocus: detectContentFocus,
    detectEntityType,
    VALID_LEVELS,
    TYPE_LEVEL_MAP,
    VALID_ENTITY_TYPES,
    getLocationDatabase: () => LOCATION_DATABASE,
    getAllCities,
    getProvince,
    getRegencies,
    getAllRegencies,
    getKecamatanByKabupatenKota,
    getKecamatanByCity,
    getAllKecamatan,
    detectLocationHierarchy,
    hasTechnicalSpec,
    isSubVariant,
    cleanJasaText,
    detectVariantByPattern,
    detectUniversalQualityWords,
    UNIVERSAL_QUALITY_WORDS,
    SPECIFICATION_WORDS,
    ALL_SPEC_WORDS,
    SPEC_PHRASES_AT_END,
    MONEY_MASTER_OVERRIDES,
    ENTITY_PILLAR_NAMES,
    COMMERCIAL_WORDS,
    HIGH_VOLUME_WORDS,
    SIZE_WORDS,
    LOCATION_WORDS,
    isLocation,
    version: "22.30"
  };
  
  window.pageLevelDetectorv22Ready = true;
  window.dispatchEvent(new Event("pageLevelDetectorv22Ready"));
  
  console.log("✅ Page Level Detector v22.30 Ready");
  console.log("🔬 FIX v22.29: PRIORITAS VARIANT > MONEY (spesifikasi teknis lebih dulu)");
  console.log("💰 FIX v22.30: MM tetap MM meskipun ada kata 'harga'");
  console.log("🎯 ADD v22.30: Deteksi FOKUS KONTEN (INFORMASI / HARGA / GABUNG)");
  console.log("🏗️ ADD v22.30: Deteksi STRUKTUR (PISAH / GABUNG)");
  console.log("📊 ADD v22.30: Keterangan level dengan fokus konten");
  console.log("📍 FIX v22.28: PRIORITAS LOCATION > SIZE (MC lebih prioritas)");
  console.log("📍 'terdekat/sekitar/dekat/near' + service → MONEY_CHILD");
  console.log("📍 Tersedia " + getAllKecamatan().length + " kecamatan");
  console.log("🏗️  ENTITY: JASA, SEWA, PRODUK, MATERIAL, DESAIN, ARTIKEL");
  console.log("🛒 COMMERCIAL INTENT OVERRIDE");
  
})();
