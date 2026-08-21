/* ============================================================
 🧠 Page Level Detector v22.15 — FULL ENTITY DETECTION FIX
    ✅ FIX v22.15: Entity Type detection improved (JASA, PRODUK, MATERIAL, SEWA)
    ✅ FIX v22.15: Variant detection dibatasi untuk PRODUK/MATERIAL saja
    ✅ FIX v22.15: JASA tidak terdeteksi sebagai variant (kecuali ada kata spesifik)
    ✅ FIX v22.15: Mini/Midi/Maxi tidak dianggap variant untuk JASA
    ✅ FIX v22.15: JASA detection kembali ke pola word count
    ✅ FIX v22.15: Money level priority: Price > Location > Word Count
    ✅ FIX v22.14: Threshold diturunkan dari 3 → 2
    ✅ FIX v22.14: Pola "per meter", "per titik" skor ditingkatkan
    ✅ FIX v22.14: Kata spesifikasi ditambahkan ke cluster
    ✅ FIX v22.14: Pola "spesifikasi + produk" ditambahkan
    ✅ FIX v22.14: Pola "jenis" dikembalikan ke SP2 (bukan variant)
    ✅ FIX v22.14: isSubVariant improved untuk deteksi sub-variant
    ✅ FIX v22.14: Terpasang detection improved
    ✅ FIX v22.13: Hanya tambahkan keyword untuk VARIANT (level 7)
    ✅ FIX v22.13: Tidak mengganggu deteksi MC, SP2, atau level lainnya
    ✅ FIX v22.10: VARIANT DETEKSI SEPENUHNYA BERBASIS POLA
    ✅ UNIVERSAL: Untuk semua entity (JASA, SEWA, PRODUK, MATERIAL, DESAIN)
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
  // 📌 ENTITY TRIGGERS (IMPROVED v22.15)
  // ============================================================

  const ENTITY_TRIGGERS = {
    jasa: [
      "jasa", "kontraktor", "tukang", "borongan", "renovasi", "pasang", 
      "bangun", "perbaikan", "instalasi", "service", "servis",
      "pemasangan", "pengerjaan", "perawatan", "perbaikan"
    ],
    desain: ["desain", "interior", "arsitektur", "konsep", "rencana", "gambar", "denah"],
    sewa: ["sewa", "rental"],
    material: ["material", "bahan", "material bangunan"],
    produk: ["produk", "jual", "beli", "supplier", "distributor"],
    artikel: ["artikel", "blog", "tips", "panduan"]
  };

  // ============================================================
  // 📌 PRIORITY: ENTITY DETECTION ORDER
  // ============================================================

  const ENTITY_PRIORITY = ["jasa", "sewa", "desain", "produk", "material", "artikel"];

  // ============================================================
  // 📌 KEYWORDS
  // ============================================================

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
    "pengukuran", "pengujian", "kalibrasi", "survey"
  ];

  // ============================================================
  // 📌 VARIANT PATTERN DETECTION (v22.15 - ONLY FOR PRODUK/MATERIAL)
  // ============================================================

  function detectVariantByPattern(text, entityType) {
    if (!text) return { isVariant: false, score: 0, reasons: [] };
    
    // 🔧 FIX v22.15: JASA, SEWA, DESAIN tidak boleh jadi variant
    if (entityType === "jasa" || entityType === "sewa" || entityType === "desain") {
      log(`"${text}" → BUKAN variant (entity: ${entityType})`, "VARIANT");
      return { isVariant: false, score: 0, reasons: [`Entity ${entityType} → bukan variant`] };
    }
    
    let score = 0;
    let reasons = [];
    const lower = text.toLowerCase();
    
    // 🔧 FIX v22.15: Mini/Midi/Maxi tanpa spesifikasi → BUKAN variant
    const sizeWords = /\b(mini|midi|maxi|jumbo|ekstra)\b/i;
    const hasSizeWord = sizeWords.test(lower);
    const hasSpecWord = /\b(spesifikasi|ukuran|dimensi|detail|jenis|macam|tipe|model|varian|standar|mutu|kualitas|grade|kelas)\b/i.test(lower);
    
    if (hasSizeWord && !hasSpecWord) {
      log(`"${text}" → BUKAN variant (size word tanpa spesifikasi lain)`, "VARIANT");
      return { isVariant: false, score: 0, reasons: ["Size word without spec → bukan variant"] };
    }
    
    // ============================================================
    // LAYER 1: STRUKTURAL PATTERN
    // ============================================================
    
    // 1a. Pola: [kata benda] + [kata sifat] → variant
    const nounPattern = /\b(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer|bata|hebel|genteng|parket|vinil|gypsum|cat|epoxy|coating|mata|bor|coring|molen|vibrator|profil|lis|plint|skirting|trap|tangga|railing|handle|engsel)\s+(?!mini|midi|maxi)(tinggi|rendah|besar|kecil|panjang|pendek|lebar|sempit|tebal|tipis|polos|bermotif|custom|standar|premium|ekonomis|modern|klasik|minimalis|tradisional|elegan|mewah|halus|kasar|matte|glossy|natural|ekspos|doff|gloss|satin|tekstur|serat|anyaman|lis|plint|skirting)\b/i;
    if (nounPattern.test(lower)) {
      score += 4;
      reasons.push("Struct: noun + adjective (variant)");
    }
    
    // 1b. Pola: [benda] + [aplikasi spesifik] → variant
    const appPattern = /\b(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer)\s+(untuk|di|area|kawasan|proyek|bangunan|rumah|gedung|jalan|jembatan|terowongan)\s+(perumahan|pabrik|gudang|sekolah|rumah sakit|pertambangan|kandang|ternak|industri|komersial|residensial)\b/i;
    if (appPattern.test(lower)) {
      score += 4;
      reasons.push("Struct: noun + specific application");
    }
    
    // 1c. Pola: [spesifikasi/dimensi] + [benda] → variant
    const dimPattern = /\b(\d+(?:\.\d+)?\s*(?:m|mm|cm|meter|kg|ton|inch|inci|km|milimeter|sentimeter|kilogram))\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer)\b/i;
    if (dimPattern.test(lower)) {
      score += 5;
      reasons.push("Struct: dimension + object (variant)");
    }
    
    // 1d. Pola "Per [Satuan]" → variant
    const perUnitPattern = /\bper\s+(meter|titik|m|kg|hari|jam|minggu|bulan|unit|buah|item|lembar|bagian|paket|sesi|kali|kubik|m2|m3|liter|ton|meter lari|m')\b/i;
    if (perUnitPattern.test(lower)) {
      score += 4;
      reasons.push("Struct: per unit pattern (variant)");
    }
    
    // 1e. Pola "Beton + [spesifikasi]" → variant
    const betonPattern = /\bbeton\s+(readymix|ready\s*mix|cor|coring|precast|bertulang|polos|instan|kering|basah|struktural|non-struktural|pracetak|cast\s*in\s*situ)\b/i;
    if (betonPattern.test(lower)) {
      score += 4;
      reasons.push("Struct: beton + specification (variant)");
    }
    
    // 1f. Pola "Terpasang / Terinstal" → variant
    const terpasangPattern = /\b(terpasang|terinstal|tertanam|terbenam|tercetak|terbentuk|terbuat|terpancang|tertimbun|tersusun|terikat|terkunci|tertutup|terlihat|terasa)\b/i;
    if (terpasangPattern.test(lower)) {
      score += 4;
      reasons.push("Struct: condition/specification (terpasang)");
    }
    
    // 1g. Pola "Kualitas + [produk]" → variant
    const kualitasPattern = /\b(kualitas|mutu|grade|kelas|standar|spesifikasi|detail|dimensi|ukuran|varian|tipe|model|seri)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer)\b/i;
    if (kualitasPattern.test(lower)) {
      score += 5;
      reasons.push("Struct: quality + product (variant)");
    }
    
    // 1h. Pola "Jenis + [produk]" → BUKAN variant (kembalikan null)
    const jenisPattern = /\b(jenis|macam|ragam|kategori|tipe|model|varian)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer)\b/i;
    if (jenisPattern.test(lower)) {
      log(`"${text}" → BUKAN variant (jenis pattern → SP2)`, "VARIANT");
      return { isVariant: false, score: 0, reasons: ["Jenis pattern → SP2"] };
    }
    
    // 1i. Pola "Spesifikasi + [produk]" → variant
    const specPattern = /\b(spesifikasi|dimensi|ukuran|detail|parameter|standar|mutu|kualitas|grade|kelas)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer|bata|hebel|genteng|parket|vinil|gypsum|cat|epoxy|coating|mata|bor|coring|molen|vibrator|profil|lis|plint|skirting|trap|tangga|railing|handle|engsel)\b/i;
    if (specPattern.test(lower)) {
      score += 5;
      reasons.push("Struct: specification + product (variant)");
    }
    
    // ============================================================
    // LAYER 2: SEMANTIC CLUSTER
    // ============================================================
    
    const dimensionWords = [
      "tinggi", "rendah", "besar", "kecil", "panjang", "pendek", "lebar", "sempit", 
      "tebal", "tipis", "dalam", "dangkal", "diameter", "radius", "ukuran", "dimensi", 
      "luas", "volume", "kedalaman", "ketebalan", "spesifikasi", "detail", "parameter"
    ];
    const dimCount = dimensionWords.filter(w => lower.includes(w)).length;
    if (dimCount >= 1) {
      score += dimCount * 2;
      reasons.push(`Semantic: dimension words (${dimCount})`);
    }
    
    const finishWords = [
      "polos", "motif", "corak", "pola", "tekstur", "serat", "kayu", "halus", "kasar", 
      "matte", "glossy", "doff", "cat", "coating", "lapisan", "pelapis", "natural", 
      "ekspos", "finishing", "coring", "bor", "potong", "lubang", "titik", "meter", 
      "kedalaman", "diameter", "gloss", "satin", "anyaman", "lis", "plint", "skirting",
      "custom", "standar", "premium", "ekonomis", "modern", "klasik", "minimalis", 
      "tradisional", "elegan", "mewah", "polosan", "bermotif"
    ];
    const finishCount = finishWords.filter(w => lower.includes(w)).length;
    if (finishCount >= 1) {
      score += finishCount * 2;
      reasons.push(`Semantic: finishing/spec words (${finishCount})`);
    }
    
    const conditionWords = [
      "terpasang", "terinstal", "tertanam", "terbenam", "tercetak", "terbentuk", 
      "terbuat", "terpancang", "tertimbun", "tersusun", "terikat", "terkunci", 
      "tertutup", "terlihat", "terasa", "hasil", "akhir", "jadi", "selesai", 
      "finished", "installed", "ready", "complete", "final"
    ];
    const condCount = conditionWords.filter(w => lower.includes(w)).length;
    if (condCount >= 1) {
      score += condCount * 2;
      reasons.push(`Semantic: condition/result words (${condCount})`);
    }
    
    // ============================================================
    // LAYER 3: CATEGORY INDICATOR
    // ============================================================
    
    const variantIndicator = ["tipe", "model", "varian", "seri", "grade", "kelas", "kategori", "macam", "ragam", "spesifikasi", "detail", "dimensi", "ukuran", "mutu", "kualitas", "standar", "alternatif", "pilihan"];
    const varCount = variantIndicator.filter(w => lower.includes(w)).length;
    if (varCount >= 1) {
      score += varCount * 2;
      reasons.push(`Category: variation indicator (${varCount})`);
    }
    
    // ============================================================
    // LAYER 4: NUMERIC + UNIT
    // ============================================================
    
    const numUnitPattern = /\b\d+(?:\.\d+)?\s*(?:m|mm|cm|meter|kg|ton|inch|inci|liter|m³|m2|m²|m3|cm2|cm²|cm3|cm³|km|milimeter|sentimeter|kilogram|satuan|titik)\b/i;
    if (numUnitPattern.test(lower)) {
      const matches = lower.match(/\d+(?:\.\d+)?\s*(?:m|mm|cm|meter|kg|ton|inch|inci|liter|m³|m2|m²|m3|cm2|cm²|cm3|cm³|km|milimeter|sentimeter|kilogram|satuan|titik)/gi);
      const count = matches ? matches.length : 0;
      if (count >= 1) {
        score += count * 2;
        reasons.push(`Numeric: ${count} dimension(s) with unit`);
      }
    }
    
    // ============================================================
    // LAYER 5: NEGATIVE FILTERS
    // ============================================================
    
    if (TECHNICAL_SPECS.some(spec => lower.includes(spec))) {
      log(`"${text}" mengandung technical spec → BUKAN variant`, "VARIANT");
      return { isVariant: false, score: 0, reasons: ["Technical spec detected"] };
    }
    
    if (NON_VARIANT_WORDS.some(word => lower.includes(word))) {
      log(`SKIP VARIANT: "${text}" mengandung kata non-variant`, "WARN");
      return { isVariant: false, score: 0, reasons: ["Non-variant word detected"] };
    }
    
    if (PRICE_WORDS.some(w => lower.includes(w))) {
      return { isVariant: false, score: 0, reasons: ["Price word detected"] };
    }
    
    if (LOCATION_WORDS.some(w => lower.includes(w))) {
      return { isVariant: false, score: 0, reasons: ["Location word detected"] };
    }
    
    if (/perbandingan|vs|versus|kelebihan|kekurangan|perbedaan/.test(lower)) {
      return { isVariant: false, score: 0, reasons: ["Sub-pillar indicator (comparison)"] };
    }
    
    // ============================================================
    // LAYER 6: SCORE EVALUATION
    // ============================================================
    
    const threshold = 2;
    const isVariant = score >= threshold;
    
    if (isVariant) {
      log(`"${text}" → VARIANT (score: ${score})`, "VARIANT");
    } else {
      log(`"${text}" → BUKAN VARIANT (score: ${score}, threshold: ${threshold})`, "VARIANT");
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
            log(`Ditemukan kecamatan: ${kec} di ${regency.nama}`, "LOCATION");
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
          log(`Ditemukan kabupaten/kota: ${regency.nama}`, "LOCATION");
          return result;
        }
      }
    }
    
    for (const city of getAllCities()) {
      if (lowerText.includes(city.toLowerCase())) {
        result.kota_utama = city;
        result.provinsi = getProvince(city);
        log(`Ditemukan kota utama: ${city}`, "LOCATION");
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
  // 📌 DETEKSI ENTITY (IMPROVED v22.15)
  // ============================================================

  function detectEntityType(userEntityType = null) {
    if (userEntityType && VALID_ENTITY_TYPES.includes(userEntityType)) return userEntityType;
    
    const text = getPageText();
    const lower = text.toLowerCase();
    
    // 🔧 FIX v22.15: Deteksi ENTITY berdasarkan prioritas
    for (const entity of ENTITY_PRIORITY) {
      const triggers = ENTITY_TRIGGERS[entity] || [];
      if (triggers.some(t => lower.includes(t))) {
        log(`ENTITY terdeteksi: ${entity} dari "${text}"`, "SUCCESS");
        return entity;
      }
    }
    
    // Default: cek berdasarkan kata kunci
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
  // 📌 DETEKSI VARIANT (v22.15 - ONLY FOR PRODUK/MATERIAL)
  // ============================================================

  function detectVariantLevel(text, entityType) {
    // 🔧 FIX v22.15: JASA, SEWA, DESAIN tidak bisa jadi variant
    if (entityType === "jasa" || entityType === "sewa" || entityType === "desain") {
      log(`"${text}" → SKIP VARIANT (entity: ${entityType})`, "VARIANT");
      return null;
    }
    
    if (isSubVariant(text)) return "sub-variant";
    
    if (hasTechnicalSpec(text)) {
      log(`"${text}" mengandung technical spec → BUKAN variant`, "VARIANT");
      return null;
    }
    
    const result = detectVariantByPattern(text, entityType);
    
    if (result.isVariant) {
      log(`"${text}" → VARIANT (score: ${result.score})`, "VARIANT");
      return "variant";
    }
    
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
  // 📌 DETEKSI MONEY LEVEL (IMPROVED v22.15)
  // ============================================================

  function detectMoneyLevel(text, entityType) {
    const hasPriceWord = hasPrice(text);
    const hasLocationWord = isLocation(text);
    
    // 🔧 PRIORITAS: Price > Location > Word Count
    if (hasPriceWord) return "money-page";
    if (hasLocationWord) return "money-child";
    
    // ============================================================
    // ENTITY: SEWA
    // ============================================================
    if (entityType === "sewa") {
      let core = text.replace(/\bsewa\b/g, "").replace(/\brental\b/g, "").trim();
      let words = core.split(/\s+/).filter(w => w.length > 2);
      words = words.filter(w => !STOPWORDS.has(w));
      words = words.filter(w => !LOCATION_WORDS.some(loc => w.includes(loc)));
      
      const wordCount = words.length;
      const specific = /\d/.test(core) || /(mini|hidrolik|diesel|breaker)/i.test(core);
      
      log(`SEWA: core="${core}", count=${wordCount}, specific=${specific}`);
      
      if (wordCount <= 2 && !specific) {
        return "money-master";
      }
      return "money-page";
    }
    
    // ============================================================
    // ENTITY: JASA (IMPROVED v22.15)
    // ============================================================
    if (entityType === "jasa" || entityType === "desain") {
      const core = cleanJasaText(text);
      
      const remainingWords = core.split(/\s+/).filter(w => w.length >= 2);
      const wordCount = remainingWords.length;
      
      const hasNumber = /\d/.test(core);
      const hasLocation = isLocation(core);
      const hasModifier = MODIFIER_WORDS.some(m => core.includes(m));
      
      log(`${entityType.toUpperCase()}: "${text}" → core: "${core}", words: ${wordCount}`);
      
      // 🔧 FIX v22.15: JASA dengan ≤2 kata → MONEY-MASTER
      // 🔧 FIX v22.15: JASA dengan ≥3 kata → MONEY-PAGE
      if (wordCount <= 1 && !hasNumber && !hasLocation && !hasModifier) {
        log(`${entityType.toUpperCase()} → MONEY-MASTER`, "SUCCESS");
        return "money-master";
      }
      
      // 🔧 FIX v22.15: Kata "mini" tidak membuat JASA jadi MP
      // Selama masih ≤2 kata → tetap MM
      if (wordCount <= 2 && !hasNumber && !hasLocation) {
        log(`${entityType.toUpperCase()} → MONEY-MASTER (≤2 kata)`, "SUCCESS");
        return "money-master";
      }
      
      log(`${entityType.toUpperCase()} → MONEY-PAGE`, "INFO");
      return "money-page";
    }
    
    // ============================================================
    // ENTITY: PRODUK / MATERIAL
    // ============================================================
    if (entityType === "produk" || entityType === "material") {
      let words = text.split(/\s+/).filter(w => w.length > 2);
      words = words.filter(w => !STOPWORDS.has(w));
      words = words.filter(w => !LOCATION_WORDS.some(loc => w.includes(loc)));
      
      const wordCount = words.length;
      const specific = /\d/.test(text) || hasTechnicalSpec(text);
      
      log(`PRODUK/MATERIAL: count=${wordCount}, specific=${specific}`);
      
      if (wordCount <= 2 && !specific) {
        return "money-master";
      }
      return "money-page";
    }
    
    return null;
  }

  // ============================================================
  // 📌 MAIN DETECTOR (v22.15)
  // ============================================================

  function detectPageLevel(userOptions = {}) {
    if (isHomePage()) return "home";
    
    const text = getPageText();
    const entityType = detectEntityType(userOptions.userEntityType);
    
    log(`TEXT: "${text}"`);
    log(`ENTITY: ${entityType}`);
    
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
    
    // 3. VARIANT (v22.15 - ONLY FOR PRODUK/MATERIAL)
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
    
    if (entityType === "sewa") {
      const core = text.replace(/\bsewa\b/g, "").trim();
      const words = core.split(/\s+/).filter(w => w.length > 2);
      if (words.length <= 2) {
        strategies.push("Word Count (≤2 words → MM)");
      } else {
        strategies.push("Word Count (≥3 words → MP)");
      }
    } else if (entityType === "jasa" || entityType === "desain") {
      const core = cleanJasaText(text);
      const words = core.split(/\s+/).filter(w => w.length >= 2);
      const hasNumber = /\d/.test(core);
      const hasLocation = isLocation(core);
      const hasModifier = MODIFIER_WORDS.some(m => core.includes(m));
      
      if (words.length <= 2 && !hasNumber && !hasLocation) {
        strategies.push("JASA: ≤2 kata, no number, no location → MM");
      } else {
        strategies.push("JASA: ≥3 kata or has number/location → MP");
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
    version: "22.15"
  };
  
  window.pageLevelDetectorv22Ready = true;
  window.dispatchEvent(new Event("pageLevelDetectorv22Ready"));
  
  console.log("✅ Page Level Detector v22.15 Ready (FULL ENTITY DETECTION FIX)");
  console.log("📍 Tersedia " + getAllKecamatan().length + " kecamatan");
  console.log("🏗️  ENTITY: JASA, SEWA, PRODUK, MATERIAL, DESAIN, ARTIKEL");
  console.log("🔬 VARIANT: Hanya untuk PRODUK/MATERIAL (JASA tidak bisa variant)");
  console.log("📝 JASA: ≤2 kata → MM, ≥3 kata → MP");
  console.log("📝 Mini/Midi/Maxi: Tidak dianggap variant untuk JASA");
  console.log("📝 Priority: Price > Location > Word Count");
  
})();
