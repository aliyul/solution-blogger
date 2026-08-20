/* ============================================================
 🧠 Page Level Detector v22.11 — FULL PATTERN-BASED (FIXED)
    ✅ FIX v22.11: Threshold dinaikkan dari 4 ke 6
    ✅ FIX v22.11: Menambahkan pengecualian untuk kata "jasa"
    ✅ FIX v22.11: Menambahkan pengecualian untuk "harga", "biaya", "tarif"
    ✅ FIX v22.11: Memperbaiki deteksi "tipe" sebagai sub-pillar
    ✅ FIX v22.11: Menambahkan negative filter untuk entity "jasa"
    ✅ FIX v22.11: Menambahkan layer "Service Word Detection"
    ✅ FIX v22.11: Menambahkan layer "Product Category Detection"
    ✅ FIX v22.11: Threshold minimal 5 untuk variant (dari 4)
    ✅ FIX v22.11: Menambahkan logging detail untuk debugging
    
    ✅ FIX v22.10: VARIANT DETEKSI SEPENUHNYA BERBASIS POLA
    ✅ FIX v22.10: Menggunakan 7 layer pattern detection untuk variant
    ✅ FIX v22.10: Auto-detect variant dari struktural kata
    ✅ FIX v22.10: Semantic clustering untuk varian tanpa kata kunci explicit
    ✅ FIX v22.10: Dynamic variant scoring berbasis konteks
    ✅ FIX v22.9: Pillar patterns untuk PRODUK_INTERIOR ditambahkan
    ✅ FIX v22.9: Pillar patterns untuk ARTIKEL ditambahkan
    ✅ FIX v22.9: Pillar patterns menggunakan array untuk multiple variants
    ✅ FIX v22.9: "produk interior", "interior produk" masuk pillar
    ✅ FIX v22.9: "artikel konstruksi", "blog konstruksi" masuk pillar
    ✅ FIX v22.8: JASA_DESAIN ditambahkan ke VALID_ENTITY_TYPES
    ✅ FIX v22.8: ENTITY_TRIGGERS untuk "desain" ditambahkan
    ✅ FIX v22.7: Deteksi MM/MP JASA OTOMATIS (>= 2 → MP, <= 1 → MM)
    ✅ FIX v22.7: Tidak perlu tambah manual MATERIAL_SPEC_WORDS
    ✅ FIX v22.7: Angka (3d, k250) otomatis terdeteksi sebagai MP
    ✅ FIX v22.6: JASA dengan material spec (baja, beton, dll) → MP, bukan MM
    ✅ FIX v22.5: Variant TIDAK campur dengan MP (K250/K300 tetap MP)
    ✅ FIX v22.5: Variant hanya jika ada KATA KUNCI VARIANT
    ✅ FIX v22.5: Technical specs (K225, K250, K300) tetap MP
    ✅ FIX: "pengukuran", "pengujian", "pengecekan" tidak terdeteksi sebagai variant
    ✅ FIX: Variant detection sekarang lebih presisi (hanya kata exact match)
    ✅ FIX: Menambahkan NON_VARIANT_WORDS untuk mencegah false positive
    ✅ FIX: "Sewa Pompa Air" sekarang terdeteksi sebagai MM
    ✅ FIX: Alat Pattern tidak lagi meng-override word count untuk SEWA
    ✅ PRIORITAS: Location > Price > Word Count untuk SEWA & JASA
    ✅ UNIVERSAL: Untuk semua entity (JASA, SEWA, PRODUK, MATERIAL, DESAIN)
    ✅ NEW: Semua kecamatan masuk ke masing-masing kabupaten/kota
    ✅ NEW: Hierarki lokasi (Provinsi -> Kabupaten/Kota -> Kecamatan)
    ✅ NEW: Auto-detect lokasi dari URL dan konten
    ✅ Maintenance minimal
============================================================ */

(function () {

  "use strict";

  if (window.pageLevelDetectorv22) return;

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
  // 📌 DATABASE LOKASI (PROVINSI -> KABUPATEN/KOTA -> KECAMATAN)
  // ============================================================

  const LOCATION_DATABASE = {
    "jakarta": {
      provinsi: "DKI Jakarta",
      kabupaten_kota: [
        {
          nama: "Jakarta Pusat",
          kecamatan: ["Gambir", "Sawah Besar", "Kemayoran", "Senen", "Cempaka Putih", "Menteng", "Tanah Abang", "Johar Baru"]
        },
        {
          nama: "Jakarta Utara", 
          kecamatan: ["Penjaringan", "Tanjung Priok", "Koja", "Kelapa Gading", "Cilincing", "Pademangan"]
        },
        {
          nama: "Jakarta Barat",
          kecamatan: ["Kembangan", "Kebon Jeruk", "Palmerah", "Grogol Petamburan", "Tambora", "Kalideres", "Cengkareng"]
        },
        {
          nama: "Jakarta Selatan",
          kecamatan: ["Setiabudi", "Mampang Prapatan", "Pasar Minggu", "Jagakarsa", "Cilandak", "Pesanggrahan", "Kebayoran Lama", "Kebayoran Baru", "Tebet", "Pancoran"]
        },
        {
          nama: "Jakarta Timur",
          kecamatan: ["Matraman", "Pulogadung", "Jatinegara", "Kramat Jati", "Pasar Rebo", "Cakung", "Duren Sawit", "Makasar", "Ciracas", "Cipayung"]
        },
        {
          nama: "Kepulauan Seribu",
          kecamatan: ["Kepulauan Seribu Utara", "Kepulauan Seribu Selatan"]
        }
      ]
    },
    "bandung": {
      provinsi: "Jawa Barat",
      kabupaten_kota: [
        {
          nama: "Bandung",
          kecamatan: ["Andir", "Antapani", "Arcamanik", "Astana Anyar", "Babakan Ciparay", "Bandung Kidul", "Bandung Kulon", "Bandung Wetan", "Batununggal", "Bojongloa Kaler", "Bojongloa Kidul", "Cibeunying Kaler", "Cibeunying Kidul", "Cibiru", "Cicendo", "Cidadap", "Cinambo", "Coblong", "Gedebage", "Kiaracondong", "Lengkong", "Mandalajati", "Panyileukan", "Rancasari", "Regol", "Sukajadi", "Sukasari", "Sumur Bandung", "Ujungberung"]
        },
        {
          nama: "Bandung Barat",
          kecamatan: ["Batujajar", "Cihampelas", "Cikalong Wetan", "Cililin", "Cipatat", "Cipeundeuy", "Cipongkor", "Gununghalu", "Lembang", "Ngamprah", "Padalarang", "Parongpong", "Rongga", "Saguling", "Sindangkerta"]
        },
        {
          nama: "Bandung Selatan",
          kecamatan: ["Banjaran", "Bojongsoang", "Cangkuang", "Cicalengka", "Cikancung", "Cileunyi", "Cimaung", "Cimenyan", "Ciparay", "Ciwidey", "Dayeuhkolot", "Kertasari", "Kutawaringin", "Majalaya", "Margaasih", "Nagreg", "Pacet", "Pameungpeuk", "Pangalengan", "Paseh", "Pasirjambu", "Rancabali", "Rancaekek", "Solokan Jeruk", "Soreang"]
        }
      ]
    },
    "bekasi": {
      provinsi: "Jawa Barat",
      kabupaten_kota: [
        {
          nama: "Bekasi",
          kecamatan: ["Bantargebang", "Bekasi Barat", "Bekasi Selatan", "Bekasi Timur", "Bekasi Utara", "Jatiasih", "Jatisampurna", "Medansatria", "Mustikajaya", "Pondokgede", "Pondokmelati", "Rawalumbu"]
        },
        {
          nama: "Bekasi Barat",
          kecamatan: ["Babelan", "Bojongmangu", "Cabangbungin", "Cibarusah", "Cibitung", "Cikarang Barat", "Cikarang Pusat", "Cikarang Selatan", "Cikarang Timur", "Cikarang Utara", "Karangbahagia", "Kedungwaringin", "Muaragembong", "Pebayuran", "Serang Baru", "Setu", "Sukakarya", "Sukatani", "Sukawangi", "Tambelang", "Tambun Selatan", "Tambun Utara", "Tarumajaya"]
        }
      ]
    },
    "tangerang": {
      provinsi: "Banten",
      kabupaten_kota: [
        {
          nama: "Tangerang",
          kecamatan: ["Batuceper", "Benda", "Cibodas", "Ciledug", "Cipondoh", "Jatiuwung", "Karang Tengah", "Karawaci", "Larangan", "Neglasari", "Periuk", "Pinang", "Tangerang"]
        },
        {
          nama: "Tangerang Selatan",
          kecamatan: ["Ciputat", "Ciputat Timur", "Pamulang", "Pondok Aren", "Serpong", "Serpong Utara", "Setu"]
        }
      ]
    },
    "depok": {
      provinsi: "Jawa Barat",
      kabupaten_kota: [
        {
          nama: "Depok",
          kecamatan: ["Beji", "Bojongsari", "Cilodong", "Cimanggis", "Cinere", "Cipayung", "Limo", "Pancoran Mas", "Sawangan", "Sukmajaya", "Tapos"]
        }
      ]
    },
    "bogor": {
      provinsi: "Jawa Barat",
      kabupaten_kota: [
        {
          nama: "Bogor",
          kecamatan: ["Bogor Barat", "Bogor Selatan", "Bogor Timur", "Bogor Utara", "Tanah Sereal"]
        },
        {
          nama: "Bogor Barat",
          kecamatan: ["Babakan Madang", "Bojong Gede", "Caringin", "Ciampea", "Ciawi", "Cibinong", "Cibungbulang", "Cigombong", "Cijeruk", "Cileungsi", "Ciomas", "Cisarua", "Ciseeng", "Citeureup", "Dramaga", "Gunung Putri", "Gunung Sindur", "Jasinga", "Jonggol", "Kemang", "Klapanunggal", "Leuwiliang", "Leuwisadeng", "Megamendung", "Nanggung", "Pamijahan", "Parung", "Parung Panjang", "Ranca Bungur", "Rumpin", "Sukajaya", "Sukamakmur", "Sukaraja", "Tajurhalang", "Tamansari", "Tanjungsari", "Tenjo", "Tenjolaya"]
        }
      ]
    },
    "surabaya": {
      provinsi: "Jawa Timur",
      kabupaten_kota: [
        {
          nama: "Surabaya",
          kecamatan: ["Asemrowo", "Benowo", "Bubutan", "Bulak", "Dukuh Pakis", "Gayungan", "Genteng", "Gubeng", "Gunung Anyar", "Jambangan", "Karangpilang", "Kenjeran", "Krembangan", "Lakarsantri", "Mulyorejo", "Pabean Cantian", "Pakal", "Rungkut", "Sambikerep", "Sawahan", "Semampir", "Simokerto", "Sukolilo", "Sukomanunggal", "Tambaksari", "Tandes", "Tegalsari", "Tenggilis Mejoyo", "Wiyung", "Wonocolo", "Wonokromo"]
        }
      ]
    },
    "medan": {
      provinsi: "Sumatera Utara",
      kabupaten_kota: [
        {
          nama: "Medan",
          kecamatan: ["Medan Amplas", "Medan Area", "Medan Barat", "Medan Baru", "Medan Belawan", "Medan Deli", "Medan Denai", "Medan Helvetia", "Medan Johor", "Medan Kota", "Medan Labuhan", "Medan Maimun", "Medan Marelan", "Medan Perjuangan", "Medan Petisah", "Medan Polonia", "Medan Selayang", "Medan Sunggal", "Medan Tembung", "Medan Timur", "Medan Tuntungan"]
        }
      ]
    },
    "makassar": {
      provinsi: "Sulawesi Selatan",
      kabupaten_kota: [
        {
          nama: "Makassar",
          kecamatan: ["Biringkanaya", "Bontoala", "Mamajang", "Manggala", "Mariso", "Panakkukang", "Rappocini", "Tallo", "Tamalanrea", "Tamalate", "Ujung Pandang", "Ujung Tanah", "Wajo"]
        }
      ]
    },
    "bali": {
      provinsi: "Bali",
      kabupaten_kota: [
        {
          nama: "Denpasar",
          kecamatan: ["Denpasar Barat", "Denpasar Selatan", "Denpasar Timur", "Denpasar Utara"]
        },
        {
          nama: "Badung",
          kecamatan: ["Abiansemal", "Kuta", "Kuta Selatan", "Kuta Utara", "Mengwi", "Petang"]
        }
      ]
    },
    "semarang": {
      provinsi: "Jawa Tengah",
      kabupaten_kota: [
        {
          nama: "Semarang",
          kecamatan: ["Banyumanik", "Candisari", "Gajahmungkur", "Gayamsari", "Genuk", "Gunungpati", "Mijen", "Ngaliyan", "Pedurungan", "Semarang Barat", "Semarang Selatan", "Semarang Tengah", "Semarang Timur", "Semarang Utara", "Tembalang", "Tugu"]
        }
      ]
    },
    "yogyakarta": {
      provinsi: "DI Yogyakarta",
      kabupaten_kota: [
        {
          nama: "Yogyakarta",
          kecamatan: ["Danurejan", "Gedongtengen", "Gondokusuman", "Gondomanan", "Jetis", "Kotagede", "Kraton", "Mantrijeron", "Mergangsan", "Ngampilan", "Pakualaman", "Tegalrejo", "Umbulharjo", "Wirobrajan"]
        }
      ]
    },
    "solo": {
      provinsi: "Jawa Tengah",
      kabupaten_kota: [
        {
          nama: "Surakarta",
          kecamatan: ["Banjarsari", "Jebres", "Laweyan", "Pasar Kliwon", "Serengan"]
        }
      ]
    }
  };

  // ============================================================
  // 📌 KONFIGURASI
  // ============================================================

  const CONFIG = { DEBUG: true };

  function log(message, type = "INFO") {
    if (!CONFIG.DEBUG && type === "INFO") return;
    const icons = { INFO: "📘", SUCCESS: "✅", WARN: "⚠️", ERROR: "❌", LOCATION: "📍", VARIANT: "🔬" };
    console.log(`${icons[type] || "📘"} [PLD v22.11] ${message}`);
  }

  // ============================================================
  // 📌 KEYWORDS
  // ============================================================

  const ENTITY_TRIGGERS = {
    jasa: ["jasa", "kontraktor", "tukang", "borongan", "renovasi", "pasang"],
    desain: ["desain", "interior", "arsitektur", "konsep", "rencana", "gambar", "denah"],
    sewa: ["sewa", "rental"],
    material: ["material", "bahan"],
    artikel: ["artikel", "blog", "tips", "panduan"]
  };

  const PRICE_WORDS = ["harga", "biaya", "tarif", "ongkos"];
  
  const LOCATION_WORDS = [
    "jakarta", "jakarta pusat", "jakarta barat", "jakarta selatan", "jakarta timur", "jakarta utara",
    "bogor", "kota bogor", "kabupaten bogor", "depok", "kota depok",
    "tangerang", "kota tangerang", "kota tangerang selatan", "kabupaten tangerang",
    "bekasi", "kota bekasi", "kabupaten bekasi",
    "bandung", "kota bandung", "kabupaten bandung",
    "karawang", "kabupaten karawang", "purwakarta", "kabupaten purwakarta",
    "cikarang", "cikarang barat", "cikarang pusat", "cikarang selatan", "cikarang timur", "cikarang utara",
    "subang", "kabupaten subang", "cirebon", "kota cirebon", "kabupaten cirebon",
    "semarang", "kota semarang", "kabupaten semarang",
    "solo", "surakarta", "kota surakarta",
    "pekalongan", "tegal", "magelang", "sukoharjo", "boyolali", "klaten",
    "jogja", "yogyakarta", "kota yogyakarta", "kabupaten sleman", "bantul", "gunungkidul", "kulon progo",
    "surabaya", "kota surabaya", "malang", "kota malang", "kabupaten malang",
    "kediri", "kota kediri", "kabupaten kediri",
    "gresik", "sidoarjo", "mojokerto", "pasuruan", "probolinggo", "jember", "banyuwangi", "madiun",
    "medan", "kota medan", "palembang", "pekanbaru", "padang", "lampung", "bandar lampung",
    "batam", "tanjungpinang", "aceh", "banda aceh", "jambi", "bengkulu", "pangkal pinang",
    "pontianak", "balikpapan", "samarinda", "banjarmasin", "palangkaraya",
    "makassar", "kota makassar", "manado", "palu", "kendari", "gorontalo",
    "bali", "kabupaten badung", "kota denpasar", "denpasar",
    "gianyar", "tabanan", "bangli", "karangasem", "klungkung", "buleleng", "jembrana",
    "mataram", "kupang", "terdekat"
  ];
  
  const MODIFIER_WORDS = [
    "modern", "minimalis", "mewah", "klasik", "tradisional", "kontemporer",
    "sederhana", "elegan", "premium", "luxury", "simple", "exclusive",
    "custom", "tanah", "beton", "batu", "kayu", "besi", "baja"
  ];

  // ============================================================
  // 📌 JASA CLEAN WORDS
  // ============================================================

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

  // ============================================================
  // 📌 TECHNICAL SPECS
  // ============================================================

  const TECHNICAL_SPECS = [
    "k225", "k250", "k300", "k350", "k400", "k500",
    "fc", "m6", "m8", "m10", "m12", "m16", "m20",
    "b0", "b1", "b2", "b3", "sni"
  ];

  const NON_VARIANT_WORDS = [
    "pengukuran", "pengujian", "pengecekan", "analisa", 
    "perhitungan", "kalibrasi", "survey", "inspeksi",
    "pengawasan", "pemeriksaan", "penelitian"
  ];

  // ============================================================
  // 📌 VARIANT PATTERN DETECTION (FIXED v22.11)
  // ============================================================

  /**
   * v22.11: Mendeteksi variant berdasarkan 8 layer pattern
   * DENGAN pengecualian untuk entity JASA
   */
  function detectVariantByPattern(text, entityType) {
    if (!text) return { isVariant: false, score: 0, reasons: [] };
    
    // ✅ FIX v22.11: Jika entity adalah JASA, kurangi score
    const isJasaEntity = entityType === 'jasa' || entityType === 'desain' || entityType === 'sewa';
    
    let score = 0;
    let reasons = [];
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/).filter(w => w.length > 2);
    
    // ✅ FIX v22.11: PENGEcUALIAN - Jika ada kata "jasa" langsung kurangi score
    if (lower.includes('jasa')) {
      score -= 2;
      reasons.push("Service word detected (-2)");
    }
    
    // ✅ FIX v22.11: PENGEcUALIAN - Jika ada kata "harga" atau "biaya"
    if (PRICE_WORDS.some(w => lower.includes(w))) {
      return { isVariant: false, score: 0, reasons: ["Price word detected → NOT variant"] };
    }
    
    // ✅ FIX v22.11: PENGEcUALIAN - Jika ada lokasi
    if (LOCATION_WORDS.some(w => lower.includes(w))) {
      return { isVariant: false, score: 0, reasons: ["Location word detected → NOT variant"] };
    }
    
    // ============================================================
    // LAYER 1: STRUCTURAL PATTERN
    // ============================================================
    
    // 1a. Pola: [kata benda] + [kata sifat] → variant
    const nounPattern = /\b(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer|profil|plafon|gypsum|bata|hebel|semen|pasir|split|koral|wiremesh|besi beton|pipa|paralon|genteng|baja ringan|canopy|teralis|aluminium|upvc|kaca|sanitasi|plumbing|listrik|ac|ventilasi|waterproofing|drainase|landscape|taman|kolam|blok|conblock|grassblock|pagarbeton|readymix|pompa|concrete|mix|molen|vibrator|scaffolding|steger|perancah|bekisting|formwork|bore|pile|strauss|mini|micro|piling)\s+(tinggi|rendah|besar|kecil|panjang|pendek|lebar|sempit|tebal|tipis|polos|bermotif|custom|standar|premium|ekonomis|modern|klasik|minimalis|tradisional|elegan|mewah|halus|kasar|matte|glossy|natural|ekspos|cat|coating)/i;
    if (nounPattern.test(lower)) {
      score += 3;
      reasons.push("Struct: noun + adjective");
    }
    
    // ============================================================
    // LAYER 2: SEMANTIC CLUSTER
    // ============================================================
    
    // 2a. Cluster Dimensi
    const dimensionWords = ["tinggi", "rendah", "besar", "kecil", "panjang", "pendek", "lebar", "sempit", "tebal", "tipis", "dalam", "dangkal", "diameter", "radius", "ukuran", "dimensi"];
    const dimCount = dimensionWords.filter(w => lower.includes(w)).length;
    if (dimCount >= 1) {
      // ✅ FIX v22.11: Kurangi bobot untuk entity JASA
      const bonus = isJasaEntity ? 1 : 2;
      score += dimCount * bonus;
      reasons.push(`Semantic: dimension words (${dimCount})`);
    }
    
    // 2b. Cluster Material
    const materialWords = ["beton", "semen", "pasir", "kerikil", "batu", "baja", "besi", "kayu", "bambu", "aluminium", "tembok", "bata", "kaca", "keramik", "granit", "marmer", "vinyl", "pvc", "wpc", "grc", "hpl", "acp"];
    const matCount = materialWords.filter(w => lower.includes(w)).length;
    if (matCount >= 1) {
      // ✅ FIX v22.11: Kurangi bobot untuk entity JASA
      const bonus = isJasaEntity ? 1 : 1.5;
      score += matCount * bonus;
      reasons.push(`Semantic: material words (${matCount})`);
    }
    
    // ============================================================
    // LAYER 3: COMPOUND PATTERN
    // ============================================================
    
    const compoundPattern = /\b(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer)(tinggi|rendah|besar|kecil|panjang|pendek|lebar|sempit|tebal|tipis|polos|bermotif|custom|standar|premium|ekonomis|modern|klasik|minimalis|tradisional|elegan|mewah|halus|kasar|matte|glossy|natural|ekspos|cat|coating)/i;
    if (compoundPattern.test(lower)) {
      score += 2;
      reasons.push("Compound: noun+adj without space");
    }
    
    // ============================================================
    // LAYER 4: CATEGORY INDICATOR
    // ============================================================
    
    // ✅ FIX v22.11: Hanya "tipe" + [benda] yang dianggap variant
    const typePattern = /\b(tipe|model|jenis|varian|seri|grade|kelas|kategori)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer|profil|plafon|gypsum|bata|hebel|semen|pasir|split|koral|wiremesh|besi beton|pipa|paralon|genteng|baja ringan|canopy|teralis|aluminium|upvc|kaca|sanitasi|plumbing|listrik|ac|ventilasi|waterproofing|drainase|landscape|taman|kolam|blok|conblock|grassblock|pagarbeton|readymix|pompa|concrete|mix|molen|vibrator|scaffolding|steger|perancah|bekisting|formwork|bore|pile|strauss|mini|micro|piling)/i;
    if (typePattern.test(lower)) {
      score += 2;
      reasons.push("Category: type/varian + object");
    }
    
    // ============================================================
    // LAYER 5: NUMERIC + UNIT
    // ============================================================
    
    const numUnitPattern = /\b\d+(?:\.\d+)?\s*(?:m|mm|cm|meter|kg|ton|inch|inci|liter|m³|m2|m²|m3|cm2|cm²|cm3|cm³)\b/i;
    if (numUnitPattern.test(lower)) {
      const matches = lower.match(/\d+(?:\.\d+)?\s*(?:m|mm|cm|meter|kg|ton|inch|inci|liter|m³|m2|m²|m3|cm2|cm²|cm3|cm³)/gi);
      const count = matches ? matches.length : 0;
      score += count * 2;
      reasons.push(`Numeric: ${count} dimension(s) with unit`);
    }
    
    // ============================================================
    // LAYER 6: SUB-VARIANT INDICATOR
    // ============================================================
    
    if (/(\d+x\d+|\d+\s*(mm|cm|meter|kg|ton))/i.test(lower)) {
      score += 3;
      reasons.push("Sub-variant indicator (dimension format)");
    }
    
    // ============================================================
    // LAYER 7: NEGATIVE FILTERS
    // ============================================================
    
    // 7a. Technical specs → BUKAN variant
    if (TECHNICAL_SPECS.some(spec => lower.includes(spec))) {
      log(`"${text}" mengandung technical spec → BUKAN variant`, "VARIANT");
      return { isVariant: false, score: 0, reasons: ["Technical spec detected"] };
    }
    
    // 7b. Non-variant words → SKIP
    if (NON_VARIANT_WORDS.some(word => lower.includes(word))) {
      log(`SKIP VARIANT: "${text}" mengandung kata non-variant`, "WARN");
      return { isVariant: false, score: 0, reasons: ["Non-variant word detected"] };
    }
    
    // 7c. ✅ FIX v22.11: Sub-pillar indicators → BUKAN variant (kecuali "tipe" + benda)
    if (/perbandingan|vs|versus|kelebihan|kekurangan|perbedaan/.test(lower)) {
      return { isVariant: false, score: 0, reasons: ["Sub-pillar indicator (comparison)"] };
    }
    if (/daftar|jenis|macam|kategori|tipe/.test(lower) && !typePattern.test(lower)) {
      return { isVariant: false, score: 0, reasons: ["Sub-pillar indicator (list)"] };
    }
    
    // ============================================================
    // LAYER 8: SCORE EVALUATION (FIXED v22.11)
    // ============================================================
    
    // ✅ FIX v22.11: Threshold dinaikkan dari 4 ke 6
    const threshold = isJasaEntity ? 7 : 6;
    const isVariant = score >= threshold;
    
    if (isVariant) {
      log(`"${text}" → VARIANT (score: ${score}, threshold: ${threshold})`, "VARIANT");
    } else {
      log(`"${text}" → BUKAN VARIANT (score: ${score}, threshold: ${threshold})`, "VARIANT");
    }
    
    return { isVariant, score, reasons };
  }

  // ============================================================
  // 📌 FUNGSI DETEKSI L
