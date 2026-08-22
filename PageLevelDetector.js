/* ============================================================
 🧠 Page Level Detector v22.20 — UNIVERSAL UNTUK SEMUA ENTITY
    ✅ FIX v22.20: POSISI KATA untuk deteksi variant yang akurat
    ✅ FIX v22.20: Mencegah false positive (kata mirip variant)
    ✅ FIX v22.20: Pola [Spesifikasi + Benda] → VARIANT
    ✅ FIX v22.20: Pola [Benda + Spesifikasi di akhir] → VARIANT (hanya jika singkat)
    ✅ FIX v22.20: Pola [Angka + Satuan + Benda] → VARIANT
    ✅ FIX v22.20: Universal Quality Words disaring (hanya kata spesifik)
    ✅ FIX v22.20: Negative filters untuk mencegah false positive
    ✅ FIX v22.19: "per meter", "per titik" → MONEY_PAGE (BUKAN variant)
    ✅ FIX v22.19: "terpasang" → VARIANT (kecuali ada harga/lokasi)
    ✅ FIX v22.18: UNIVERSAL QUALITY WORDS berlaku untuk SEMUA ENTITY
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
    console.log(`${icons[type] || "📘"} [PLD v22.20] ${message}`);
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
  // 📌 KEYWORDS & UNIVERSAL QUALITY WORDS (v22.20 - DISARING)
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
  
  const MODIFIER_WORDS = [
    "modern", "minimalis", "mewah", "klasik", "tradisional", "kontemporer",
    "sederhana", "elegan", "premium", "luxury", "simple", "exclusive",
    "custom", "tanah", "beton", "batu", "kayu", "besi", "baja"
  ];

  // 🔧 v22.20: UNIVERSAL QUALITY WORDS - DISARING (hanya kata spesifik)
  const UNIVERSAL_QUALITY_WORDS = {
    // Kualitas & Standar (hanya kata yang benar-benar menunjukkan spesifikasi)
    quality: [
      "mutu", "kualitas", "grade", "kelas", "standar"
    ],
    // Metode Pengerjaan
    method: [
      "hidrolik", "manual", "auger", "rotary", "percussive", "dry", "wet"
    ],
    // Kondisi / Hasil (hanya 2 kata yang jelas)
    condition: [
      "terpasang", "terinstal"
    ],
    // Teknik Pengerjaan
    technique: [
      "coring", "cutting", "drilling", "pengeboran"
    ],
    // Spesifikasi Teknis
    technical: [
      "dalam", "dangkal", "kedalaman", "diameter", "ketebalan"
    ],
    // Finishing (kata yang jelas menunjukkan varian)
    finishing: [
      "polos", "motif", "tekstur", "serat", "halus", "kasar",
      "matte", "glossy", "doff", "gloss", "satin", "natural", "ekspos",
      "custom", "standar", "premium", "ekonomis", "modern", "klasik",
      "minimalis", "tradisional", "elegan", "mewah"
    ]
  };

  const JASA_ULTRA_COMMON_WORDS = [
    "jasa", "kontraktor", "tukang", "borongan", "renovasi",
    "pasang", "bangun", "perbaikan", "instalasi", "proyek",
    "cor", "gali", "urug", "angkut", "service", "servis",
    "desain", "interior", "eksterior"
  ];

  const STOPWORDS = new Set([
    "dan", "atau", "serta", "yang", "dari", "ke", "di", "untuk", 
    "dengan", "ini", "itu", "akan", "telah", "sudah", "masih",
    "pada", "oleh", "karena", "sehingga", "setelah", "sebelum"
  ]);

  const TECHNICAL_SPECS = [
    "k225", "k250", "k300", "k350", "k400", "k500",
    "fc", "m6", "m8", "m10", "m12", "m16", "m20",
    "b0", "b1", "b2", "b3", "sni"
  ];

  const NON_VARIANT_WORDS = ["pengukuran", "pengujian", "kalibrasi", "survey"];

  // ============================================================
  // 📌 FUNGSI DETEKSI UNIVERSAL QUALITY WORDS (v22.20)
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
    } else {
      relevantCategories = Object.keys(UNIVERSAL_QUALITY_WORDS);
    }
    
    for (const category of relevantCategories) {
      const words = UNIVERSAL_QUALITY_WORDS[category] || [];
      for (const word of words) {
        if (lower.includes(word)) {
          // 🔧 v22.20: Cek posisi kata
          const wordPos = lower.indexOf(word);
          const totalLen = lower.length;
          const positionRatio = wordPos / totalLen;
          
          // Jika kata di akhir (ratio > 0.7) dan tanpa konteks, kurangi skor
          let addScore = 3;
          if (positionRatio > 0.7 && words.length <= 3) {
            addScore = 1; // Kurangi skor jika di akhir
          }
          
          hasSpec = true;
          score += addScore;
          reasons.push(`Quality word [${category}]: "${word}" (pos: ${Math.round(positionRatio * 100)}%)`);
          break;
        }
      }
    }
    
    // 🔧 v22.20: Deteksi angka + satuan (hanya jika ada kata benda di dekatnya)
    const numUnitPattern = /\b(\d+(?:\.\d+)?)\s*(m|mm|cm|meter|kg|ton|inch|inci|liter|m³|m2|m²|m3|cm2|cm²|cm3|cm³|km|milimeter|sentimeter|kilogram|satuan|titik)\b/i;
    const numMatch = numUnitPattern.exec(lower);
    if (numMatch) {
      // Cek apakah ada kata benda di sekitar angka
      const beforeText = lower.substring(0, numMatch.index);
      const afterText = lower.substring(numMatch.index + numMatch[0].length);
      const nounNearby = /\b(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer|jasa|layanan|pekerjaan|pemasangan|pengeboran)\b/i.test(beforeText + afterText);
      
      if (nounNearby) {
        hasSpec = true;
        score += 2;
        reasons.push(`Quality word [technical]: "numeric + unit" with nearby noun`);
      }
    }
    
    return { hasSpec, score, reasons };
  }

  // ============================================================
  // 📌 VARIANT PATTERN DETECTION (v22.20 - DENGAN POSISI KATA)
  // ============================================================

  function detectVariantByPattern(text, entityType) {
    if (!text) return { isVariant: false, score: 0, reasons: [] };
    
    let score = 0;
    let reasons = [];
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/);
    
    // ============================================================
    // 🔥 PRIORITAS 1: BUKAN VARIANT (EXCLUSION)
    // ============================================================
    
    // 1A. Price word → MONEY_PAGE
    if (PRICE_WORDS.some(w => lower.includes(w))) {
      log(`"${text}" → BUKAN variant (price word → MONEY_PAGE)`, "VARIANT");
      return { isVariant: false, score: 0, reasons: ["Price word → MONEY_PAGE"] };
    }
    
    // 1B. Location word → MONEY_CHILD
    if (LOCATION_WORDS.some(w => lower.includes(w))) {
      log(`"${text}" → BUKAN variant (location word → MONEY_CHILD)`, "VARIANT");
      return { isVariant: false, score: 0, reasons: ["Location word → MONEY_CHILD"] };
    }
    
    // 1C. Per unit pattern → MONEY_PAGE
    if (/\bper\s+(meter|titik|m|kg|hari|jam|minggu|bulan|unit|buah|item|lembar|bagian|paket|sesi|kali|kubik|m2|m3|liter|ton|meter lari|m')\b/i.test(lower)) {
      log(`"${text}" → BUKAN variant (per unit → MONEY_PAGE)`, "VARIANT");
      return { isVariant: false, score: 0, reasons: ["Per unit → MONEY_PAGE"] };
    }
    
    // 1D. Comparison pattern → SUB-PILLAR-1
    if (/perbandingan|vs|versus|kelebihan|kekurangan|perbedaan/.test(lower)) {
      return { isVariant: false, score: 0, reasons: ["Comparison → SP1"] };
    }
    
    // 1E. List/type pattern → SUB-PILLAR-2
    if (/(^|\s)(daftar|jenis|macam|kategori|tipe|ragam|variasi)(\s|$)/i.test(lower)) {
      return { isVariant: false, score: 0, reasons: ["List/type → SP2"] };
    }
    
    // 1F. Guide/tutorial pattern → PILLAR
    if (/(^|\s)(panduan|cara|tips|tutorial|langkah|pedoman|petunjuk)(\s|$)/i.test(lower)) {
      return { isVariant: false, score: 0, reasons: ["Guide → PILLAR"] };
    }
    
    // ============================================================
    // 🔥 PRIORITAS 2: DETEKSI VARIANT BERDASARKAN POSISI
    // ============================================================
    
    // 2A. Pola: [Spesifikasi di Awal] + [Benda] → VARIANT
    const specFirstPatterns = [
      // Ukuran/Dimensi di awal
      { pattern: /^(tinggi|rendah|besar|kecil|panjang|pendek|lebar|sempit|tebal|tipis|dalam|dangkal)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer)/i,
        score: 4, 
        reason: "Specification + noun (spec first)" },
      // Finishing di awal
      { pattern: /^(polos|motif|bermotif|bercorak|tekstur|serat|halus|kasar|matte|glossy|doff|gloss|satin|anyaman|natural|ekspos|custom|standar|premium|ekonomis|modern|klasik|minimalis|tradisional|elegan|mewah)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer)/i,
        score: 4,
        reason: "Finishing + noun (spec first)" },
      // Aplikasi spesifik di awal
      { pattern: /^(perumahan|pabrik|gudang|sekolah|rumah sakit|pertambangan|kandang|ternak|industri|komersial|residensial|kavling|lahan|kosong|pembatas|keamanan|kedap|suara|banjir|tahan|lama|cepat|dipasang)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer)/i,
        score: 3,
        reason: "Application + noun (spec first)" },
    ];
    
    for (const pattern of specFirstPatterns) {
      if (pattern.pattern.test(lower)) {
        score += pattern.score;
        reasons.push(pattern.reason);
      }
    }
    
    // 2B. Pola: [Benda di Awal] + [Spesifikasi di Akhir] → VARIANT (hanya jika singkat)
    // Contoh: "Pagar Tinggi" → ✅ VARIANT
    //         "Pagar Panel Beton Tinggi" → ❌ BUKAN VARIANT (terlalu panjang)
    const nounFirstPatterns = [
      { pattern: /^(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer)\s+(tinggi|rendah|besar|kecil|panjang|pendek|lebar|sempit|tebal|tipis|dalam|dangkal|polos|motif|bermotif|tekstur|serat|halus|kasar|matte|glossy|doff|gloss|satin|anyaman|natural|ekspos|custom|standar|premium|ekonomis|modern|klasik|minimalis|tradisional|elegan|mewah|perumahan|pabrik|gudang|sekolah|rumah sakit|pertambangan|kandang|ternak|industri|komersial|residensial|kavling|lahan|kosong|pembatas|keamanan|kedap|suara|banjir|tahan|lama|cepat|dipasang)$/i,
        score: 3,
        reason: "Noun + specification (noun first, single spec)" },
    ];
    
    for (const pattern of nounFirstPatterns) {
      if (pattern.pattern.test(lower)) {
        // Cek jumlah kata total
        if (words.length <= 4) {
          score += pattern.score;
          reasons.push(pattern.reason + " (short phrase)");
        } else {
          reasons.push("Noun + spec (too long → not variant)");
        }
      }
    }
    
    // 2C. Pola: [Angka + Satuan] di Awal + [Benda] → VARIANT
    // Contoh: "30 cm Pagar" → ✅ VARIANT
    if (/(\d+(?:\.\d+)?)\s*(m|mm|cm|meter|kg|ton|inch|inci|liter|m³|m2|m²|m3|cm2|cm²|cm3|cm³|km|milimeter|sentimeter|kilogram)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer)/i.test(lower)) {
      score += 5;
      reasons.push("Dimension + noun (number first)");
    }
    
    // 2D. Pola: [Benda] + [Angka + Satuan] di Akhir → VARIANT (hanya jika singkat)
    // Contoh: "Pagar 2 Meter" → ✅ VARIANT
    //         "Jasa Pasang Pagar 2 Meter" → ❌ BUKAN VARIANT (terlalu panjang)
    if (/^(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer)\s+\d+\s*(m|mm|cm|meter|kg|ton|inch|inci|liter|m³|m2|m²|m3|cm2|cm²|cm3|cm³|km|milimeter|sentimeter|kilogram)/i.test(lower)) {
      // Cek jumlah kata total
      if (words.length <= 4) {
        score += 4;
        reasons.push("Noun + dimension (short phrase)");
      } else {
        reasons.push("Noun + dimension (too long → not variant)");
      }
    }
    
    // 2E. Kata "terpasang" di AKHIR → VARIANT (kecuali ada harga/lokasi)
    if (/\b(terpasang|terinstal|tertanam|terbenam|tercetak|terbentuk|terbuat|terpancang|tertimbun|tersusun|terikat|terkunci|tertutup)$/i.test(lower)) {
      // Cek apakah ada price/location di awal
      if (!PRICE_WORDS.some(w => lower.includes(w)) && !LOCATION_WORDS.some(w => lower.includes(w))) {
        score += 3;
        reasons.push("Condition word at end → variant");
      }
    }
    
    // ============================================================
    // 🔥 PRIORITAS 3: NEGATIVE FILTERS (MENCEGAH FALSE POSITIVE)
    // ============================================================
    
    // 3A. Kata "jasa" di awal → BUKAN VARIANT (ini adalah layanan utama)
    if (/^jasa\s/.test(lower) && words.length <= 3) {
      return { isVariant: false, score: 0, reasons: ["Jasa + short phrase → MONEY_MASTER"] };
    }
    
    // 3B. Kata "harga" di awal → BUKAN VARIANT
    if (/^harga\s/.test(lower)) {
      return { isVariant: false, score: 0, reasons: ["Harga at start → MONEY_PAGE"] };
    }
    
    // 3C. Kata "biaya" di awal → BUKAN VARIANT
    if (/^biaya\s/.test(lower)) {
      return { isVariant: false, score: 0, reasons: ["Biaya at start → MONEY_PAGE"] };
    }
    
    // 3D. Kata "panduan" di awal → BUKAN VARIANT
    if (/^panduan\s/.test(lower)) {
      return { isVariant: false, score: 0, reasons: ["Panduan at start → PILLAR"] };
    }
    
    // 3E. Kata "spesifikasi" di awal → VARIANT (halaman spesifikasi)
    if (/^spesifikasi\s/.test(lower)) {
      // Ini adalah halaman spesifikasi itu sendiri, jadi biarkan sebagai variant
      score += 3;
      reasons.push("Spesifikasi at start → variant page");
      // Tapi jangan return false, biarkan proses lanjut
    }
    
    // 3F. Kata "metode" di awal → VARIANT (halaman metode)
    if (/^metode\s/.test(lower)) {
      score += 3;
      reasons.push("Metode at start → variant page");
    }
    
    // 3G. Kata "mutu" di awal → VARIANT (halaman mutu)
    if (/^mutu\s/.test(lower)) {
      score += 3;
      reasons.push("Mutu at start → variant page");
    }
    
    // 3H. Kata "ukuran" di awal → VARIANT (halaman ukuran)
    if (/^ukuran\s/.test(lower)) {
      score += 3;
      reasons.push("Ukuran at start → variant page");
    }
    
    // ============================================================
    // 🔥 PRIORITAS 4: UNIVERSAL QUALITY DETECTION (v22.20)
    // ============================================================
    
    const supportedEntities = ["jasa", "sewa", "produk", "material"];
    
    if (supportedEntities.includes(entityType) && !reasons.some(r => r.includes("BUKAN variant"))) {
      const qualityResult = detectUniversalQualityWords(text, entityType);
      
      if (qualityResult.hasSpec) {
        // 🔧 v22.20: Quality words hanya ditambahkan jika sudah ada indikasi variant lain
        // atau jika skor quality cukup tinggi (>= 3)
        if (score >= 1 || qualityResult.score >= 3) {
          score += qualityResult.score;
          reasons = reasons.concat(qualityResult.reasons);
          log(`UNIVERSAL QUALITY [${entityType}]: "${text}" → +${qualityResult.score} points`, "VARIANT");
        }
      }
    }
    
    // ============================================================
    // 🔥 PRIORITAS 5: THRESHOLD & FINAL DECISION
    // ============================================================
    
    // 🔧 v22.20: Threshold dinaikkan menjadi 4 untuk mengurangi false positive
    const threshold = 4;
    const isVariant = score >= threshold;
    
    if (isVariant) {
      log(`✅ VARIANT DETECTED: "${text}" [${entityType}] | Score: ${score} | Reasons: ${reasons.join(', ')}`, "SUCCESS");
    } else {
      log(`❌ NOT VARIANT: "${text}" [${entityType}] | Score: ${score} | Reasons: ${reasons.join(', ')}`, "INFO");
    }
    
    return { isVariant, score, reasons };
  }

  // ============================================================
  // 📌 FUNGSI DETEKSI LOKASI
  // ============================================================

  function getAllCities() {
    return Object.keys(LOCATION_DATABASE);
  }

  function getProvince(cityKey) {
    return LOCATION_DATABASE[cityKey]?.provinsi || null;
  }

  function getRegencies(cityKey) {
    return LOCATION_DATABASE[cityKey]?.kabupaten_kota || [];
  }

  function getAllRegencies() {
    const allRegencies = [];
    for (const [city, data] of Object.entries(LOCATION_DATABASE)) {
      data.kabupaten_kota.forEach(regency => {
        allRegencies.push({
          kota_utama: city,
          provinsi: data.provinsi,
          kabupaten_kota: regency.nama,
          kecamatan: regency.kecamatan
        });
      });
    }
    return allRegencies;
  }

  function getKecamatanByKabupatenKota(kabupatenKotaName) {
    for (const [city, data] of Object.entries(LOCATION_DATABASE)) {
      for (const regency of data.kabupaten_kota) {
        if (regency.nama.toLowerCase() === kabupatenKotaName.toLowerCase()) {
          return regency.kecamatan;
        }
      }
    }
    return [];
  }

  function getKecamatanByCity(cityKey) {
    const allKecamatan = [];
    const regencies = getRegencies(cityKey);
    regencies.forEach(regency => {
      allKecamatan.push(...regency.kecamatan);
    });
    return allKecamatan;
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
    
    for (const city of getAllCities()) {
      if (lowerText.includes(city.toLowerCase())) {
        result.kota_utama = city;
        result.provinsi = getProvince(city);
        return result;
      }
    }
    
    return result;
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
    if (text.length > 100) {
      text = text.substring(0, 100);
    }
    return text;
  }

  function isHomePage() {
    const path = window.location.pathname.toLowerCase();
    return path === "/" || path === "/index.html" || path === "/home";
  }

  // ============================================================
  // 📌 DETEKSI ENTITY
  // ============================================================

  function detectEntityType(userEntityType = null) {
    if (userEntityType && VALID_ENTITY_TYPES.includes(userEntityType)) return userEntityType;
    
    const text = getPageText();
    const lower = text.toLowerCase();
    
    for (const entity of ENTITY_PRIORITY) {
      const triggers = ENTITY_TRIGGERS[entity] || [];
      if (triggers.some(t => lower.includes(t))) {
        return entity;
      }
    }
    
    if (lower.includes("jasa") || lower.includes("kontraktor") || lower.includes("tukang")) return "jasa";
    if (lower.includes("sewa") || lower.includes("rental")) return "sewa";
    if (lower.includes("desain") || lower.includes("interior")) return "desain";
    if (lower.includes("material") || lower.includes("bahan")) return "material";
    if (lower.includes("produk") || lower.includes("jual")) return "produk";
    
    return "produk";
  }

  // ============================================================
  // 📌 DETEKSI SUB PILLAR
  // ============================================================

  function detectSubPillarLevel(text) {
    if (/perbandingan|vs|versus|kelebihan|kekurangan|perbedaan/.test(text)) return "sub-pillar-tipe-1";
    if (/daftar|jenis|macam|kategori|tipe/.test(text)) return "sub-pillar-tipe-2";
    return null;
  }

  // ============================================================
  // 📌 DETEKSI TECHNICAL SPEC
  // ============================================================

  function hasTechnicalSpec(text) {
    if (!text) return false;
    const lower = text.toLowerCase();
    for (const spec of TECHNICAL_SPECS) {
      if (new RegExp(`\\b${spec}\\b`, "i").test(lower)) {
        return true;
      }
    }
    return false;
  }

  // ============================================================
  // 📌 DETEKSI SUB-VARIANT
  // ============================================================

  function isSubVariant(text) {
    if (!text) return false;
    let score = 0;
    const lower = text.toLowerCase();
    
    if ((lower.match(/\d+\s*(m|mm|cm|meter|kg|ton|inch|inci)/gi) || []).length >= 1) score += 2;
    if ((lower.match(/\d+x\d+/gi) || []).length >= 1) score += 2;
    if ((lower.match(/\d+(?:\.\d+)?\s*(?:x|×)\s*\d+(?:\.\d+)?/gi) || []).length >= 1) score += 2;
    if ((lower.match(/\d+(?:\.\d+)?\s*(?:cm|mm|m|meter)\s*(?:x|×)\s*\d+(?:\.\d+)?\s*(?:cm|mm|m|meter)/gi) || []).length >= 1) score += 3;
    const uniqueNumbers = (text.match(/\d+/g) || []).filter((v, i, a) => a.indexOf(v) === i);
    if (uniqueNumbers.length >= 2) score += 1;
    
    if (/\bukuran\s+\d+/.test(lower)) score += 2;
    if (/\bdimensi\s+\d+/.test(lower)) score += 2;
    if (/\b(tebal|panjang|lebar|tinggi|dalam|diameter)\s+\d+/.test(lower)) score += 2;
    
    return score >= 2;
  }

  // ============================================================
  // 📌 DETEKSI VARIANT (v22.20)
  // ============================================================

  function detectVariantLevel(text, entityType) {
    if (isSubVariant(text)) return "sub-variant";
    if (hasTechnicalSpec(text)) return null;
    
    // Cek price & location dulu (prioritas lebih tinggi)
    if (PRICE_WORDS.some(w => text.includes(w))) {
      return null; // Ini MONEY_PAGE
    }
    
    if (LOCATION_WORDS.some(w => text.includes(w))) {
      return null; // Ini MONEY_CHILD
    }
    
    const result = detectVariantByPattern(text, entityType);
    if (result.isVariant) return "variant";
    
    return null;
  }

  // ============================================================
  // 📌 DETEKSI LOKASI & HARGA
  // ============================================================

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

  // ============================================================
  // 📌 CLEAN JASA TEXT
  // ============================================================

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
  // 📌 DETEKSI MONEY LEVEL
  // ============================================================

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
      
      if (wordCount <= 2 && !specific) {
        return "money-master";
      }
      return "money-page";
    }
    
    if (entityType === "jasa" || entityType === "desain") {
      const core = cleanJasaText(text);
      
      const remainingWords = core.split(/\s+/).filter(w => w.length >= 2);
      const wordCount = remainingWords.length;
      
      const hasNumber = /\d/.test(core);
      const hasLocation = isLocation(core);
      const hasModifier = MODIFIER_WORDS.some(m => core.includes(m));
      
      if (wordCount <= 2 && !hasNumber && !hasLocation) {
        return "money-master";
      }
      return "money-page";
    }
    
    if (entityType === "produk" || entityType === "material") {
      let words = text.split(/\s+/).filter(w => w.length > 2);
      words = words.filter(w => !STOPWORDS.has(w));
      words = words.filter(w => !LOCATION_WORDS.some(loc => w.includes(loc)));
      
      const wordCount = words.length;
      const specific = /\d/.test(text) || hasTechnicalSpec(text);
      
      if (wordCount <= 2 && !specific) {
        return "money-master";
      }
      return "money-page";
    }
    
    return null;
  }

  // ============================================================
  // 📌 MAIN DETECTOR (v22.20)
  // ============================================================

  function detectPageLevel(userOptions = {}) {
    if (isHomePage()) return "home";
    
    const text = getPageText();
    const entityType = detectEntityType(userOptions.userEntityType);
    
    log(`TEXT: "${text}"`, "INFO");
    log(`ENTITY: ${entityType}`, "INFO");
    
    // 1. ENTITY PILLAR
    const pillarPatterns = {
      jasa: ["jasa konstruksi"],
      desain: ["jasa desain"],
      sewa: ["sewa alat konstruksi", "rental alat konstruksi"],
      produk: ["produk konstruksi"],
      "produk interior": ["produk interior", "interior produk"],
      material: ["material konstruksi", "bahan konstruksi"],
      artikel: ["artikel konstruksi", "blog konstruksi", "tips konstruksi"]
    };
    
    let matchedEntity = null;
    for (const [entity, patterns] of Object.entries(pillarPatterns)) {
      if (patterns.some(pattern => text === pattern)) {
        matchedEntity = entity;
        break;
      }
    }
    
    if (matchedEntity === entityType || matchedEntity === "produk interior" && entityType === "produk") {
      log(`"${text}" → PILLAR (${entityType})`, "SUCCESS");
      return "pillar";
    }
    
    // 2. SUB PILLAR
    const subPillar = detectSubPillarLevel(text);
    if (subPillar) return subPillar;
    
    // 3. VARIANT (v22.20)
    const variant = detectVariantLevel(text, entityType);
    if (variant) return variant;
    
    // 4. MONEY
    const money = detectMoneyLevel(text, entityType);
    if (money) return money;
    
    // 5. DEFAULT
    return "sub-pillar-tipe-2";
  }

  // ============================================================
  // 📌 GET CONFIDENCE SCORE
  // ============================================================

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
      
      if (words.length <= 2 && !hasNumber && !hasLocation) {
        strategies.push("JASA: ≤2 kata → MM");
      } else {
        strategies.push("JASA: ≥3 kata → MP");
      }
    }
    
    return { level, confidence, strategies, strategyCount: strategies.length };
  }

  // ============================================================
  // 📌 BODY ATTRIBUTES
  // ============================================================

  function updateBodyAttributes() {
    const level = detectPageLevel();
    const entity = detectEntityType();
    const text = getPageText();
    const location = detectLocationHierarchy(text);
    
    document.body.setAttribute("data-page-level", level);
    document.body.setAttribute("data-page-level-num", TYPE_LEVEL_MAP[level]);
    document.body.setAttribute("data-entity-type", entity);
    
    if (location.provinsi) {
      document.body.setAttribute("data-location-provinsi", location.provinsi);
    }
    if (location.kabupaten_kota) {
      document.body.setAttribute("data-location-kabupaten-kota", location.kabupaten_kota);
    }
    if (location.kecamatan) {
      document.body.setAttribute("data-location-kecamatan", location.kecamatan);
    }
    if (location.kota_utama) {
      document.body.setAttribute("data-location-kota-utama", location.kota_utama);
    }
    
    log(`Location detected: Provinsi=${location.provinsi}, Kab/Kota=${location.kabupaten_kota}, Kecamatan=${location.kecamatan}`, "SUCCESS");
    
    return { 
      pageLevel: level, 
      pageLevelNum: TYPE_LEVEL_MAP[level], 
      entityType: entity,
      location: location
    };
  }

  // ============================================================
  // 📌 HELPER FUNCTIONS
  // ============================================================

  function getLocationDatabase() {
    return LOCATION_DATABASE;
  }

  function getAllKecamatan() {
    const allKec = [];
    for (const [city, data] of Object.entries(LOCATION_DATABASE)) {
      for (const regency of data.kabupaten_kota) {
        allKec.push(...regency.kecamatan.map(k => ({
          kecamatan: k,
          kabupaten_kota: regency.nama,
          kota_utama: city,
          provinsi: data.provinsi
        })));
      }
    }
    return allKec;
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
    getLocationDatabase,
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
    version: "22.20"
  };
  
  window.pageLevelDetectorv22Ready = true;
  window.dispatchEvent(new Event("pageLevelDetectorv22Ready"));
  
  console.log("✅ Page Level Detector v22.20 Ready (UNIVERSAL UNTUK SEMUA ENTITY)");
  console.log("📍 Tersedia " + getAllKecamatan().length + " kecamatan");
  console.log("🏗️  ENTITY: JASA, SEWA, PRODUK, MATERIAL, DESAIN, ARTIKEL");
  console.log("🔬 UNIVERSAL QUALITY: Berlaku untuk SEMUA ENTITY (disaring)");
  console.log("📝 FIX v22.20: POSISI KATA untuk deteksi variant yang akurat");
  console.log("📝 FIX v22.20: Mencegah false positive (kata mirip variant)");
  console.log("📝 FIX v22.20: Pola [Spesifikasi + Benda] → VARIANT");
  console.log("📝 FIX v22.20: Pola [Benda + Spesifikasi di akhir] → VARIANT (hanya jika singkat)");
  console.log("📝 FIX v22.20: Negative filters untuk mencegah false positive");
  console.log("📝 FIX v22.19: 'per meter', 'per titik' → MONEY_PAGE (BUKAN variant)");
  console.log("📝 FIX v22.19: 'terpasang' → VARIANT (kecuali ada harga/lokasi)");
  console.log("📝 JASA: ≤2 kata → MM, ≥3 kata → MP");
  console.log("📝 Mini/Midi/Maxi: BUKAN variant (kecuali ada spesifikasi)");
  console.log("📝 Priority: Price > Location > Word Count");
  
})();
