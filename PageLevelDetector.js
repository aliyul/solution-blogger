/* ============================================================
 🧠 Page Level Detector v22.21 — UNIVERSAL UNTUK SEMUA ENTITY
    ✅ FIX v22.21: VARIANT DETECTION UNTUK SEMUA ENTITY
    ✅ FIX v22.21: "ukuran/spesifikasi/dimensi + jasa + benda" → VARIANT
    ✅ FIX v22.21: Prioritas: SPEC > PRICE > LOCATION
    ✅ FIX v22.21: SEMUA entity support variant (JASA, PRODUK, MATERIAL, SEWA, DESAIN)
    ✅ FIX v22.21: False positive prevention dengan konteks
    ✅ FIX v22.21: Pola berdasarkan POSISI (awal/tengah/akhir) untuk SEMUA entity
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
    const icons = { INFO: "📘", SUCCESS: "✅", WARN: "⚠️", ERROR: "❌", LOCATION: "📍", VARIANT: "🔬" };
    console.log(`${icons[type] || "📘"} [PLD v22.21] ${message}`);
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
  // 📌 KEYWORDS & UNIVERSAL QUALITY WORDS (v22.21)
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
  const PRICE_WORDS = ["harga", "biaya", "tarif", "ongkos"];
  
  const LOCATION_WORDS = [
    "jakarta", "jakarta pusat", "jakarta barat", "jakarta selatan", "jakarta timur", "jakarta utara",
    "bogor", "depok", "tangerang", "bekasi", "bandung", "karawang", "purwakarta", "cikarang",
    "subang", "cirebon", "semarang", "solo", "surakarta", "pekalongan", "tegal", "magelang",
    "sukoharjo", "boyolali", "klaten", "jogja", "yogyakarta", "surabaya", "malang", "kediri",
    "gresik", "sidoarjo", "mojokerto", "pasuruan", "probolinggo", "jember", "banyuwangi", "madiun",
    "medan", "palembang", "pekanbaru", "padang", "lampung", "batam", "aceh", "jambi", "bengkulu",
    "pontianak", "balikpapan", "samarinda", "banjarmasin", "makassar", "manado", "palu", "kendari",
    "bali", "denpasar", "gianyar", "tabanan", "bangli", "karangasem", "klungkung", "buleleng",
    "mataram", "kupang", "terdekat"
  ];
  
  // ============================================================
  // 📌 SPECIFICATION WORDS (UNTUK SEMUA ENTITY)
  // ============================================================

  const SPECIFICATION_WORDS = {
    // Kata spesifikasi utama (untuk semua entity)
    primary: [
      "ukuran", "spesifikasi", "dimensi", "detail", "parameter", 
      "standar", "mutu", "kualitas", "grade", "kelas", "tipe", "model", "varian", "seri"
    ],
    // Ukuran/Dimensi (untuk produk, material, jasa)
    dimension: [
      "tinggi", "rendah", "besar", "kecil", "panjang", "pendek", 
      "lebar", "sempit", "tebal", "tipis", "dalam", "dangkal",
      "diameter", "radius", "luas", "volume", "kedalaman", "ketebalan"
    ],
    // Finishing (untuk produk, material)
    finishing: [
      "polos", "motif", "bermotif", "bercorak", "tekstur", "serat", 
      "halus", "kasar", "matte", "glossy", "doff", "gloss", "satin", 
      "anyaman", "natural", "ekspos", "custom", "standar", "premium", 
      "ekonomis", "modern", "klasik", "minimalis", "tradisional", 
      "elegan", "mewah", "polosan"
    ],
    // Aplikasi (untuk semua entity)
    application: [
      "perumahan", "pabrik", "gudang", "sekolah", "rumah sakit", 
      "pertambangan", "kandang", "ternak", "industri", "komersial", 
      "residensial", "kavling", "lahan", "kosong", "pembatas", 
      "keamanan", "kedap", "suara", "banjir", "tahan", "lama", 
      "cepat", "dipasang", "terpasang", "terinstal"
    ],
    // Metode (untuk jasa, sewa)
    method: [
      "hidrolik", "manual", "auger", "rotary", "percussive", 
      "dry", "wet", "basah", "kering", "coring", "cutting", 
      "drilling", "pengeboran", "pemancangan", "pemasangan"
    ],
    // Teknik (untuk jasa)
    technique: [
      "coring", "cutting", "drilling", "pengeboran", "pemancangan",
      "pengerjaan", "bongkar", "pasang", "potong", "las", "sambung",
      "grinding", "welding", "bending", "forming"
    ]
  };

  // Semua kata spesifikasi (gabungan)
  const ALL_SPEC_WORDS = [
    ...SPECIFICATION_WORDS.primary,
    ...SPECIFICATION_WORDS.dimension,
    ...SPECIFICATION_WORDS.finishing,
    ...SPECIFICATION_WORDS.application,
    ...SPECIFICATION_WORDS.method,
    ...SPECIFICATION_WORDS.technique
  ];

  // ============================================================
  // 📌 FUNGSI DETEKSI VARIANT (v22.21 - FINAL)
  // ============================================================

  function detectVariantByPattern(text, entityType) {
    if (!text) return { isVariant: false, score: 0, reasons: [] };
    
    let score = 0;
    let reasons = [];
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/);
    
    // ============================================================
    // 🔥 PRIORITAS 1: BUKAN VARIANT (EXCLUSION - PALING TINGGI)
    // ============================================================
    
    // 1A. Price word → MONEY_PAGE
    if (PRICE_WORDS.some(w => lower.includes(w))) {
      log(`"${text}" → BUKAN variant (price word)`, "VARIANT");
      return { isVariant: false, score: 0, reasons: ["Price word → MONEY_PAGE"] };
    }
    
    // 1B. Location word → MONEY_CHILD
    if (LOCATION_WORDS.some(w => lower.includes(w))) {
      log(`"${text}" → BUKAN variant (location word)`, "VARIANT");
      return { isVariant: false, score: 0, reasons: ["Location word → MONEY_CHILD"] };
    }
    
    // 1C. Per unit pattern → MONEY_PAGE
    if (/\bper\s+(meter|titik|m|kg|hari|jam|minggu|bulan|unit|buah|item|lembar|bagian|paket|sesi|kali|kubik|m2|m3|liter|ton|meter lari|m')\b/i.test(lower)) {
      log(`"${text}" → BUKAN variant (per unit pattern)`, "VARIANT");
      return { isVariant: false, score: 0, reasons: ["Per unit → MONEY_PAGE"] };
    }
    
    // 1D. Comparison pattern → SUB-PILLAR-1
    if (/perbandingan|vs|versus|kelebihan|kekurangan|perbedaan/.test(lower)) {
      log(`"${text}" → BUKAN variant (comparison)`, "VARIANT");
      return { isVariant: false, score: 0, reasons: ["Comparison → SP1"] };
    }
    
    // 1E. List/type pattern → SUB-PILLAR-2
    if (/(^|\s)(daftar|jenis|macam|kategori|tipe|ragam|variasi)(\s|$)/i.test(lower)) {
      log(`"${text}" → BUKAN variant (list/type)`, "VARIANT");
      return { isVariant: false, score: 0, reasons: ["List/type → SP2"] };
    }
    
    // 1F. Guide/tutorial pattern → PILLAR
    if (/(^|\s)(panduan|cara|tips|tutorial|langkah|pedoman|petunjuk)(\s|$)/i.test(lower)) {
      log(`"${text}" → BUKAN variant (guide)`, "VARIANT");
      return { isVariant: false, score: 0, reasons: ["Guide → PILLAR"] };
    }
    
    // ============================================================
    // 🔥 PRIORITAS 2: DETEKSI VARIANT - SPEC DI AWAL (UNTUK SEMUA ENTITY)
    // ============================================================
    
    // 2A. Kata spesifikasi di AWAL → VARIANT (terlepas dari entity)
    // Contoh: "ukuran jasa pasang pagar" → VARIANT
    //         "spesifikasi produk beton" → VARIANT
    //         "dimensi material baja" → VARIANT
    
    const firstWord = words[0] || "";
    const isSpecWord = ALL_SPEC_WORDS.some(spec => firstWord === spec);
    
    if (isSpecWord) {
      // Cek apakah ada price/location
      if (!PRICE_WORDS.some(w => lower.includes(w)) && !LOCATION_WORDS.some(w => lower.includes(w))) {
        log(`✅ VARIANT: specification at start: "${firstWord}" → "${text}"`, "SUCCESS");
        return { 
          isVariant: true, 
          score: 5, 
          reasons: [`Specification word "${firstWord}" at start → VARIANT`] 
        };
      }
    }
    
    // 2B. Pola: [Spesifikasi] + [Benda] di AWAL → VARIANT
    const specFirstPatterns = [
      // Ukuran/Dimensi + benda
      { pattern: /^(tinggi|rendah|besar|kecil|panjang|pendek|lebar|sempit|tebal|tipis|dalam|dangkal|diameter|radius|ukuran|dimensi)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer|jasa|layanan|produk|material)/i,
        score: 4, 
        reason: "Dimension + noun (spec first)" },
      // Finishing + benda
      { pattern: /^(polos|motif|bermotif|bercorak|tekstur|serat|halus|kasar|matte|glossy|doff|gloss|satin|anyaman|natural|ekspos|custom|standar|premium|ekonomis|modern|klasik|minimalis|tradisional|elegan|mewah|polosan)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer|jasa|layanan|produk|material)/i,
        score: 4,
        reason: "Finishing + noun (spec first)" },
      // Aplikasi + benda
      { pattern: /^(perumahan|pabrik|gudang|sekolah|rumah sakit|pertambangan|kandang|ternak|industri|komersial|residensial|kavling|lahan|kosong|pembatas|keamanan|kedap|suara|banjir|tahan|lama|cepat|dipasang|terpasang|terinstal)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer|jasa|layanan|produk|material)/i,
        score: 3,
        reason: "Application + noun (spec first)" },
      // Metode/Teknik + jasa
      { pattern: /^(hidrolik|manual|auger|rotary|percussive|dry|wet|basah|kering|coring|cutting|drilling|pengeboran|pemancangan|pemasangan|bongkar|pasang|potong|las|sambung)\s+(jasa|layanan|produk|material|sewa)/i,
        score: 4,
        reason: "Method/technique + service (spec first)" },
    ];
    
    for (const pattern of specFirstPatterns) {
      if (pattern.pattern.test(lower)) {
        // Cek apakah ada price/location
        if (!PRICE_WORDS.some(w => lower.includes(w)) && !LOCATION_WORDS.some(w => lower.includes(w))) {
          score += pattern.score;
          reasons.push(pattern.reason);
          log(`VARIANT pattern: ${pattern.reason}`, "VARIANT");
        }
      }
    }
    
    // ============================================================
    // 🔥 PRIORITAS 3: DETEKSI VARIANT - SPESIFIK PER ENTITY
    // ============================================================
    
    // 3A. JASA: spesifikasi teknik + kata kunci jasa
    if (entityType === "jasa") {
      const jasaSpecPatterns = [
        /^(spesifikasi|metode|mutu|kualitas|standar|ukuran|dimensi)\s+(jasa|layanan|bore|pile|pondasi|pengeboran|pemasangan|pancang|strauss|tiang)/i,
        /^(hidrolik|manual|auger|rotary|percussive|coring|cutting|drilling)\s+(jasa|layanan|bore|pile|pondasi|pengeboran)/i,
        /^(dalam|dangkal|kedalaman|diameter)\s+(jasa|layanan|bore|pile|pondasi|pengeboran)/i,
        /^(terpasang|terinstal|tertanam)\s+(jasa|layanan|bore|pile|pondasi|pagar|panel)/i
      ];
      
      for (const pattern of jasaSpecPatterns) {
        if (pattern.test(lower)) {
          if (!PRICE_WORDS.some(w => lower.includes(w)) && !LOCATION_WORDS.some(w => lower.includes(w))) {
            score += 4;
            reasons.push("JASA: specification pattern");
            log(`VARIANT: JASA specification pattern`, "VARIANT");
          }
        }
      }
    }
    
    // 3B. PRODUK: spesifikasi produk
    if (entityType === "produk" || entityType === "material") {
      const prodSpecPatterns = [
        /^(ukuran|spesifikasi|dimensi|detail|standar|mutu|kualitas|grade|kelas|tipe|model|varian|seri)\s+(produk|material|barang|bahan|pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer)/i,
        /^(polos|motif|bermotif|tekstur|serat|halus|kasar|matte|glossy|doff|gloss|satin|anyaman|natural|ekspos|custom|premium|ekonomis)\s+(produk|material|barang|bahan|pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer)/i,
        /^(tinggi|rendah|besar|kecil|panjang|pendek|lebar|sempit|tebal|tipis|dalam|dangkal|diameter|radius)\s+(produk|material|barang|bahan|pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer)/i
      ];
      
      for (const pattern of prodSpecPatterns) {
        if (pattern.test(lower)) {
          if (!PRICE_WORDS.some(w => lower.includes(w)) && !LOCATION_WORDS.some(w => lower.includes(w))) {
            score += 4;
            reasons.push("PRODUK/MATERIAL: specification pattern");
            log(`VARIANT: PRODUK/MATERIAL specification pattern`, "VARIANT");
          }
        }
      }
    }
    
    // 3C. SEWA: spesifikasi sewa
    if (entityType === "sewa") {
      const sewaSpecPatterns = [
        /^(mini|mikro|kecil|besar|medium|jumbo|ekstra|ringan|berat|sedang)\s+(sewa|rental|alat|mesin|kendaraan)/i,
        /^(hidrolik|manual|diesel|bensin|listrik|pneumatik|track|wheel|roda|ban|rantai)\s+(sewa|rental|alat|mesin)/i,
        /^(harian|mingguan|bulanan|tahunan)\s+(sewa|rental|alat|mesin)/i
      ];
      
      for (const pattern of sewaSpecPatterns) {
        if (pattern.test(lower)) {
          if (!PRICE_WORDS.some(w => lower.includes(w)) && !LOCATION_WORDS.some(w => lower.includes(w))) {
            score += 4;
            reasons.push("SEWA: specification pattern");
            log(`VARIANT: SEWA specification pattern`, "VARIANT");
          }
        }
      }
    }
    
    // 3D. DESAIN: spesifikasi desain
    if (entityType === "desain") {
      const desainSpecPatterns = [
        /^(minimalis|modern|klasik|tradisional|kontemporer|elegan|mewah|sederhana|premium|luxury|simple|exclusive)\s+(desain|interior|eksterior|arsitektur|konsep|rencana)/i,
        /^(ruang|kamar|tamu|tidur|makan|dapur|kantor|toko|restoran|hotel)\s+(desain|interior|eksterior|arsitektur)/i
      ];
      
      for (const pattern of desainSpecPatterns) {
        if (pattern.test(lower)) {
          if (!PRICE_WORDS.some(w => lower.includes(w)) && !LOCATION_WORDS.some(w => lower.includes(w))) {
            score += 4;
            reasons.push("DESAIN: specification pattern");
            log(`VARIANT: DESAIN specification pattern`, "VARIANT");
          }
        }
      }
    }
    
    // ============================================================
    // 🔥 PRIORITAS 4: ENTITY-SPECIFIC UNIVERSAL QUALITY
    // ============================================================
    
    const supportedEntities = ["jasa", "sewa", "produk", "material", "desain"];
    
    if (supportedEntities.includes(entityType)) {
      const qualityResult = detectUniversalQualityWords(text, entityType);
      
      if (qualityResult.hasSpec) {
        if (!PRICE_WORDS.some(w => lower.includes(w)) && !LOCATION_WORDS.some(w => lower.includes(w))) {
          score += qualityResult.score;
          reasons = reasons.concat(qualityResult.reasons);
          log(`UNIVERSAL QUALITY [${entityType}]: +${qualityResult.score} points`, "VARIANT");
        }
      }
    }
    
    // ============================================================
    // 🔥 PRIORITAS 5: THRESHOLD
    // ============================================================
    
    const threshold = 3;
    const isVariant = score >= threshold;
    
    if (isVariant) {
      log(`✅ VARIANT DETECTED: "${text}" [${entityType}] | Score: ${score} | Reasons: ${reasons.join(', ')}`, "SUCCESS");
    } else {
      log(`❌ NOT VARIANT: "${text}" [${entityType}] | Score: ${score} | Reasons: ${reasons.join(', ')}`, "INFO");
    }
    
    return { isVariant, score, reasons };
  }

  // ============================================================
  // 📌 FUNGSI DETEKSI UNIVERSAL QUALITY WORDS (v22.21)
  // ============================================================

  function detectUniversalQualityWords(text, entityType) {
    if (!text) return { hasSpec: false, score: 0, reasons: [] };
    
    const lower = text.toLowerCase();
    let hasSpec = false;
    let score = 0;
    let reasons = [];
    
    // 🔧 v22.21: Pilih kategori yang relevan dengan entity
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
    
    // Deteksi angka + satuan + benda
    const numUnitPattern = /\b(\d+(?:\.\d+)?)\s*(m|mm|cm|meter|kg|ton|inch|inci|liter|m³|m2|m²|m3|cm2|cm²|cm3|cm³|km|milimeter|sentimeter|kilogram)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer)/i;
    if (numUnitPattern.test(lower)) {
      hasSpec = true;
      score += 3;
      reasons.push(`Quality word [technical]: "numeric + unit + noun"`);
    }
    
    return { hasSpec, score, reasons };
  }

  // ============================================================
  // 📌 UNIVERSAL QUALITY WORDS (v22.21)
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
  // 📌 FUNGSI DETEKSI VARIANT LEVEL (v22.21)
  // ============================================================

  function detectVariantLevel(text, entityType) {
    // Cek sub-variant dulu
    if (isSubVariant(text)) return "sub-variant";
    if (hasTechnicalSpec(text)) return null;
    
    // Cek price & location dulu (prioritas lebih tinggi)
    if (PRICE_WORDS.some(w => text.includes(w))) {
      return null; // MONEY_PAGE
    }
    
    if (LOCATION_WORDS.some(w => text.includes(w))) {
      return null; // MONEY_CHILD
    }
    
    const result = detectVariantByPattern(text, entityType);
    if (result.isVariant) return "variant";
    
    return null;
  }

  // ============================================================
  // 📌 FUNGSI DASAR LAINNYA (tetap sama)
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

  function isLocation(text) {
    if (!text) return false;
    const lower = cleanText(text);
    for (const city of LOCATION_WORDS) {
      if (new RegExp(`\\b${city.replace(/\s+/g, '\\s+')}\\b`, "i").test(lower)) return true;
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

  function detectMoneyLevel(text, entityType) {
    const hasPriceWord = hasPrice(text);
    const hasLocationWord = isLocation(text);
    if (hasPriceWord) return "money-page";
    if (hasLocationWord) return "money-child";
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
      if (wordCount <= 2 && !specific) return "money-master";
      return "money-page";
    }
    return null;
  }

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

  function getConfidenceScore() {
    const text = getPageText();
    const entityType = detectEntityType();
    const level = detectPageLevel();
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
    return { level, confidence, strategies, strategyCount: strategies.length };
  }

  function updateBodyAttributes() {
    const level = detectPageLevel();
    const entity = detectEntityType();
    const text = getPageText();
    const location = detectLocationHierarchy(text);
    document.body.setAttribute("data-page-level", level);
    document.body.setAttribute("data-page-level-num", TYPE_LEVEL_MAP[level]);
    document.body.setAttribute("data-entity-type", entity);
    if (location.provinsi) document.body.setAttribute("data-location-provinsi", location.provinsi);
    if (location.kabupaten_kota) document.body.setAttribute("data-location-kabupaten-kota", location.kabupaten_kota);
    if (location.kecamatan) document.body.setAttribute("data-location-kecamatan", location.kecamatan);
    if (location.kota_utama) document.body.setAttribute("data-location-kota-utama", location.kota_utama);
    return { pageLevel: level, pageLevelNum: TYPE_LEVEL_MAP[level], entityType: entity, location: location };
  }

  function detectPageLevel(userOptions = {}) {
    if (isHomePage()) return "home";
    const text = getPageText();
    const entityType = detectEntityType(userOptions.userEntityType);
    log(`TEXT: "${text}"`, "INFO");
    log(`ENTITY: ${entityType}`, "INFO");
    const pillarPatterns = { jasa: ["jasa konstruksi"], desain: ["jasa desain"], sewa: ["sewa alat konstruksi", "rental alat konstruksi"], produk: ["produk konstruksi"], "produk interior": ["produk interior", "interior produk"], material: ["material konstruksi", "bahan konstruksi"], artikel: ["artikel konstruksi", "blog konstruksi", "tips konstruksi"] };
    let matchedEntity = null;
    for (const [entity, patterns] of Object.entries(pillarPatterns)) {
      if (patterns.some(pattern => text === pattern)) { matchedEntity = entity; break; }
    }
    if (matchedEntity === entityType || matchedEntity === "produk interior" && entityType === "produk") { log(`"${text}" → PILLAR (${entityType})`, "SUCCESS"); return "pillar"; }
    const subPillar = detectSubPillarLevel(text);
    if (subPillar) return subPillar;
    const variant = detectVariantLevel(text, entityType);
    if (variant) return variant;
    const money = detectMoneyLevel(text, entityType);
    if (money) return money;
    return "sub-pillar-tipe-2";
  }

  // ============================================================
  // 📌 EXPORT
  // ============================================================

  window.pageLevelDetectorv22 = {
    detect: detectPageLevel,
    updateAttributes: updateBodyAttributes,
    getConfidenceScore: getConfidenceScore,
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
    version: "22.21"
  };
  
  window.pageLevelDetectorv22Ready = true;
  window.dispatchEvent(new Event("pageLevelDetectorv22Ready"));
  
  console.log("✅ Page Level Detector v22.21 Ready (UNIVERSAL UNTUK SEMUA ENTITY)");
  console.log("📍 Tersedia " + getAllKecamatan().length + " kecamatan");
  console.log("🏗️  ENTITY: JASA, SEWA, PRODUK, MATERIAL, DESAIN, ARTIKEL");
  console.log("🔬 FIX v22.21: VARIANT DETECTION UNTUK SEMUA ENTITY");
  console.log("📝 'ukuran/spesifikasi/dimensi + jasa + benda' → VARIANT");
  console.log("📝 Prioritas: SPEC > PRICE > LOCATION");
  console.log("📝 Pola berdasarkan POSISI (awal/tengah/akhir) untuk SEMUA entity");
  console.log("📝 False positive prevention dengan konteks");
  
})();
