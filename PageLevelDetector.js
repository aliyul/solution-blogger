/* ============================================================
 🧠 Page Level Detector v22.6 — SMART PATTERN-BASED (JASA FIXED)
    ✅ FIX v22.6: JASA dengan material spec (baja, beton, dll) → MP, bukan MM
    ✅ FIX v22.6: "jasa baja", "jasa beton" sekarang terdeteksi sebagai MP
    ✅ FIX v22.6: Menambahkan MATERIAL_SPEC_WORDS untuk mencegah false MM
    ✅ FIX v22.5: Variant TIDAK campur dengan MP (K250/K300 tetap MP)
    ✅ FIX v22.5: Variant hanya jika ada KATA KUNCI VARIANT
    ✅ FIX v22.5: Technical specs (K225, K250, K300) tetap MP
    ✅ FIX: "pengukuran", "pengujian", "pengecekan" tidak terdeteksi sebagai variant
    ✅ FIX: Variant detection sekarang lebih presisi (hanya kata exact match)
    ✅ FIX: Menambahkan NON_VARIANT_WORDS untuk mencegah false positive
    ✅ FIX: "Sewa Pompa Air" sekarang terdeteksi sebagai MM
    ✅ FIX: Alat Pattern tidak lagi meng-override word count untuk SEWA
    ✅ PRIORITAS: Location > Price > Word Count untuk SEWA & JASA
    ✅ UNIVERSAL: Untuk semua entity (JASA, SEWA, PRODUK, MATERIAL)
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

  const VALID_ENTITY_TYPES = ["produk", "material", "jasa", "sewa", "artikel"];

  // ============================================================
  // 📌 DATABASE LOKASI (PROVINSI -> KABUPATEN/KOTA -> KECAMATAN)
  // ============================================================

  const LOCATION_DATABASE = {
    // DKI JAKARTA
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
    // JAWA BARAT
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
    }
  };

  // ============================================================
  // 📌 KONFIGURASI
  // ============================================================

  const CONFIG = { DEBUG: true };

  function log(message, type = "INFO") {
    if (!CONFIG.DEBUG && type === "INFO") return;
    const icons = { INFO: "📘", SUCCESS: "✅", WARN: "⚠️", ERROR: "❌", LOCATION: "📍", VARIANT: "🔬" };
    console.log(`${icons[type] || "📘"} [PLD v22.6] ${message}`);
  }

  // ============================================================
  // 📌 KEYWORDS (MINIMAL, hanya untuk deteksi awal)
  // ============================================================

  const ENTITY_TRIGGERS = {
    jasa: ["jasa", "kontraktor", "tukang", "borongan", "renovasi", "pasang"],
    sewa: ["sewa", "rental"],
    material: ["material", "bahan"],
    artikel: ["artikel", "blog", "tips", "panduan"]
  };

  const PRICE_WORDS = ["harga", "biaya", "tarif", "ongkos"];
  const LOCATION_WORDS = [
    "jakarta", "bandung", "surabaya", "bekasi", "tangerang", "depok", "bogor",
    "medan", "semarang", "solo", "yogyakarta", "jogja", "bali", "denpasar",
    "makassar", "palembang", "batam", "cirebon", "karawang", "purwakarta",
    "terdekat"
  ];
  
  // Kata sifat/modifier yang mengindikasikan turunan (MP)
  const MODIFIER_WORDS = [
    "modern", "minimalis", "mewah", "klasik", "tradisional", "kontemporer",
    "sederhana", "elegan", "premium", "luxury", "simple", "exclusive",
    "custom", "tanah", "beton", "batu", "kayu", "besi", "baja"
  ];

  // ============================================================
  // 📌 JASA MATERIAL SPEC WORDS (FIXED v22.6)
  // ============================================================

  // Daftar kata yang menunjukkan spesifikasi material (harus MP, bukan MM)
  const MATERIAL_SPEC_WORDS = [
    // Material konstruksi
    "baja", "ringan", "baja ringan", "beton", "readymix", "ready mix",
    "kanstin", "pembatas", "pengaman", "struktur", "dinding",
    "pondasi", "atap", "genteng", "keramik", "marmer", "granit",
    "plafon", "gypsum", "partisi", "dak", "cor", "pile", "sheet",
    "tiang", "balok", "kolom", "sloof", "ring", "balk", "kuda-kuda",
    "drainase", "irigasi", "box culvert", "u ditch", "paving",
    "split", "batu", "pasir", "semen", "besi", "kayu", "bambu",
    "genteng", "bata", "batako", "hebel", "gypsum", "plafon",
    
    // Pekerjaan spesifik
    "pasang", "bangun", "renovasi", "perbaikan", "instalasi",
    "pemasangan", "pembuatan", "perbaikan", "perawatan",
    
    // Jenis pekerjaan
    "finishing", "cat", "epoxy", "lampu", "wallpaper",
    "eksterior", "interior", "lantai", "dinding",
    
    // Spesifikasi teknis
    "k225", "k250", "k300", "k350", "k400", "k500",
    "fc", "m6", "m8", "m10", "m12", "m16", "m20",
    "sni", "standar", "mutu", "kualitas"
  ];

  // Stopwords yang dihapus
  const STOPWORDS = new Set([
    "dan", "atau", "serta", "yang", "dari", "ke", "di", "untuk", "dengan", "ini", "itu"
  ]);

  // ============================================================
  // 📌 VARIANT KEYWORDS & TECHNICAL SPECS (FIXED v22.5)
  // ============================================================

  // ✅ FIX v22.5: VARIANT hanya jika ada KATA KUNCI INI
  const VARIANT_KEYWORDS = [
    "spesifikasi", "spec", "detail spesifikasi",
    "mutu", "kualitas", "quality",
    "ukuran", "dimensi",
    "grade", "type", "tipe", "model",
    "standar", "merk", "brand", "seri"
  ];

  // ❌ BUKAN VARIANT: Technical specs (K250, K300, dll) tetap MP
  const TECHNICAL_SPECS = [
    "k225", "k250", "k300", "k350", "k400", "k500",
    "fc", "m6", "m8", "m10", "m12", "m16", "m20",
    "b0", "b1", "b2", "b3", "sni"
  ];

  // Kata yang HARUS DIHINDARI (bukan variant meskipun mirip)
  const NON_VARIANT_WORDS = [
    "pengukuran", "pengujian", "pengecekan", "analisa", 
    "perhitungan", "kalibrasi", "survey", "inspeksi",
    "pengawasan", "pemeriksaan", "penelitian"
  ];

  // ============================================================
  // 📌 FUNGSI DETEKSI LOKASI (HIERARKI KECAMATAN)
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
    
    // Deteksi kecamatan terlebih dahulu (lebih spesifik)
    for (const [city, data] of Object.entries(LOCATION_DATABASE)) {
      for (const regency of data.kabupaten_kota) {
        for (const kec of regency.kecamatan) {
          if (lowerText.includes(kec.toLowerCase())) {
            result.kecamatan = kec;
            result.kabupaten_kota = regency.nama;
            result.provinsi = data.provinsi;
            result.kota_utama = city;
            log(`Ditemukan kecamatan: ${kec} di ${regency.nama}, ${data.provinsi}`, "LOCATION");
            return result;
          }
        }
      }
    }
    
    // Deteksi kabupaten/kota
    for (const [city, data] of Object.entries(LOCATION_DATABASE)) {
      for (const regency of data.kabupaten_kota) {
        if (lowerText.includes(regency.nama.toLowerCase())) {
          result.kabupaten_kota = regency.nama;
          result.provinsi = data.provinsi;
          result.kota_utama = city;
          log(`Ditemukan kabupaten/kota: ${regency.nama} di ${data.provinsi}`, "LOCATION");
          return result;
        }
      }
    }
    
    // Deteksi kota utama
    for (const city of getAllCities()) {
      if (lowerText.includes(city.toLowerCase())) {
        result.kota_utama = city;
        result.provinsi = getProvince(city);
        log(`Ditemukan kota utama: ${city} di ${result.provinsi}`, "LOCATION");
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
    // PRIORITAS: URL slug (paling akurat untuk deteksi level)
    let slug = window.location.pathname.replace(/\.html$/, "").replace(/-/g, " ").split("/").pop() || "";
    if (!slug || slug.length < 2) {
      slug = window.location.pathname.replace(/\.html$/, "").replace(/-/g, " ").split("/").filter(Boolean).pop() || "";
    }
    
    // Batasi maksimal 100 karakter
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
  // 📌 DETEKSI ENTITY (BERDASARKAN TRIGGER)
  // ============================================================

  function detectEntityType(userEntityType = null) {
    if (userEntityType && VALID_ENTITY_TYPES.includes(userEntityType)) return userEntityType;
    
    const text = getPageText();
    
    for (const [entity, triggers] of Object.entries(ENTITY_TRIGGERS)) {
      if (triggers.some(t => text.includes(t))) return entity;
    }
    return "produk";
  }

  // ============================================================
  // 📌 DETEKSI SUB PILLAR (BERDASARKAN POLA)
  // ============================================================

  function detectSubPillarLevel(text) {
    if (/perbandingan|vs|versus|kelebihan|kekurangan|perbedaan/.test(text)) return "sub-pillar-tipe-1";
    if (/daftar|jenis|macam|kategori|tipe/.test(text)) return "sub-pillar-tipe-2";
    return null;
  }

  // ============================================================
  // 📌 DETEKSI TECHNICAL SPEC (K250, K300, dll) - BUKAN VARIANT
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
  // 📌 DETEKSI VARIANT (FIXED v22.5 - LEBIH PRESISI)
  // ============================================================

  function isSubVariant(text) {
    if (!text) return false;
    let score = 0;
    // Pola dimensi: 60x60, 40x40x120
    if ((text.match(/\d+x\d+/gi) || []).length >= 1) score += 2;
    // Angka dengan satuan: 10mm, 5cm, 2m, 100kg
    if (/\d+\s*(mm|cm|m|meter|kg|ton)/i.test(text)) score++;
    // Minimal 2 angka berbeda
    const uniqueNumbers = (text.match(/\d+/g) || []).filter((v, i, a) => a.indexOf(v) === i);
    if (uniqueNumbers.length >= 2) score++;
    return score >= 2;
  }

  function detectVariantLevel(text, entityType) {
    // Sub-variant: format khusus (60x60, 10mm, 5kg)
    if (isSubVariant(text)) return "sub-variant";
    
    // ✅ FIX v22.5: Technical specs (K250, K300) BUKAN variant
    if (hasTechnicalSpec(text)) {
      log(`"${text}" mengandung technical spec (K250/K300/dll) → BUKAN variant, tetap MP`, "VARIANT");
      return null;
    }
    
    // Cek apakah termasuk NON_VARIANT_WORDS terlebih dahulu
    if (NON_VARIANT_WORDS.some(word => text.includes(word))) {
      log(`SKIP VARIANT: "${text}" mengandung kata non-variant`, "WARN");
      return null;
    }
    
    // ✅ FIX v22.5: Deteksi variant hanya jika ada KATA KUNCI VARIANT
    for (const kw of VARIANT_KEYWORDS) {
      if (new RegExp(`\\b${kw}\\b`, "i").test(text)) {
        log(`"${text}" → VARIANT (keyword: ${kw})`, "VARIANT");
        return "variant";
      }
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
      if (new RegExp(`\\b${city}\\b`, "i").test(lower)) return true;
    }
    return false;
  }

  function hasPrice(text) {
    return PRICE_WORDS.some(w => text.includes(w));
  }

  // ============================================================
  // 📌 DETEKSI MONEY LEVEL (FIXED v22.6)
  // ============================================================

  function detectMoneyLevel(text, entityType) {
    const hasPriceWord = hasPrice(text);
    const hasLocationWord = isLocation(text);
    
    // PRIORITAS TERTINGGI (100% confidence)
    if (hasLocationWord) return "money-child";
    if (hasPriceWord) return "money-page";
    
    // ========================================================
    // SEWA ENTITY
    // ========================================================
    if (entityType === "sewa") {
      // Hapus kata "sewa" dan "rental"
      let core = text.replace(/\bsewa\b/g, "").replace(/\brental\b/g, "").trim();
      let words = core.split(/\s+/).filter(w => w.length > 2);
      words = words.filter(w => !STOPWORDS.has(w));
      words = words.filter(w => !LOCATION_WORDS.includes(w));
      
      const wordCount = words.length;
      const specific = /\d/.test(core) || /(mini|hidrolik|diesel|breaker)/i.test(core);
      
      log(`SEWA: core="${core}", words=${JSON.stringify(words)}, count=${wordCount}, specific=${specific}`);
      
      // MM jika wordCount <= 2 (tanpa peduli ada kata "alat" atau tidak)
      if (wordCount <= 2 && !specific) {
        return "money-master";
      }
      
      // MP jika wordCount >= 3
      return "money-page";
    }
    
    // ========================================================
    // JASA ENTITY (FIXED v22.6)
    // ========================================================
    if (entityType === "jasa") {
      // Hapus kata "jasa"
      let core = text.replace(/\bjasa\b/g, "").trim();
      let words = core.split(/\s+/).filter(w => w.length > 2);
      words = words.filter(w => !ENTITY_TRIGGERS.jasa.includes(w));
      words = words.filter(w => !LOCATION_WORDS.includes(w));
      words = words.filter(w => !STOPWORDS.has(w));
      
      const modifierCount = words.filter(w => MODIFIER_WORDS.includes(w)).length;
      const baseWordCount = words.filter(w => !MODIFIER_WORDS.includes(w)).length;
      
      // ✅ FIX v22.6: Cek apakah ada MATERIAL_SPEC_WORDS
      const hasMaterialSpec = words.some(w => MATERIAL_SPEC_WORDS.includes(w));
      
      log(`JASA: core="${core.substring(0, 60)}...", base=${baseWordCount}, modifier=${modifierCount}, materialSpec=${hasMaterialSpec}`);
      
      // ✅ FIX v22.6: MM hanya jika baseWordCount <= 2, tidak ada modifier, DAN tidak ada material spec
      if (baseWordCount <= 2 && modifierCount === 0 && !hasMaterialSpec) {
        log(`JASA → MONEY-MASTER: "${text}" (base=${baseWordCount}, no modifier, no material spec)`, "SUCCESS");
        return "money-master";
      }
      
      log(`JASA → MONEY-PAGE: "${text}" (base=${baseWordCount}, modifier=${modifierCount}, materialSpec=${hasMaterialSpec})`, "INFO");
      return "money-page";
    }
    
    // ========================================================
    // PRODUK / MATERIAL
    // ========================================================
    if (entityType === "produk" || entityType === "material") {
      let words = text.split(/\s+/).filter(w => w.length > 2);
      words = words.filter(w => !STOPWORDS.has(w));
      words = words.filter(w => !LOCATION_WORDS.includes(w));
      
      const wordCount = words.length;
      // Technical spec (K250, K300) dianggap specific → tetap MP
      const specific = /\d/.test(text) || hasTechnicalSpec(text);
      
      log(`PRODUK/MATERIAL: words=${JSON.stringify(words)}, count=${wordCount}, specific=${specific}`);
      
      if (wordCount <= 2 && !specific) {
        return "money-master";
      }
      return "money-page";
    }
    
    return null;
  }

  // ============================================================
  // 📌 MAIN DETECTOR (SMART & PATTERN-BASED)
  // ============================================================

  function detectPageLevel(userOptions = {}) {
    if (isHomePage()) return "home";
    
    const text = getPageText();
    const entityType = detectEntityType(userOptions.userEntityType);
    
    log(`TEXT: "${text}"`);
    log(`ENTITY: ${entityType}`);
    
    // 1. ENTITY PILLAR (exact match untuk root)
    const pillarPatterns = {
      jasa: "jasa konstruksi",
      sewa: "sewa alat konstruksi",
      produk: "produk konstruksi",
      material: "material konstruksi"
    };
    if (text === pillarPatterns[entityType]) return "pillar";
    
    // 2. SUB PILLAR
    const subPillar = detectSubPillarLevel(text);
    if (subPillar) return subPillar;
    
    // 3. VARIANT (FIXED v22.5 - dengan entityType)
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
    } else if (entityType === "jasa") {
      const core = text.replace(/\bjasa\b/g, "").trim();
      const words = core.split(/\s+/).filter(w => w.length > 2);
      const hasModifier = MODIFIER_WORDS.some(m => words.includes(m));
      const hasMaterialSpec = words.some(w => MATERIAL_SPEC_WORDS.includes(w));
      if (words.length <= 2 && !hasModifier && !hasMaterialSpec) {
        strategies.push("Word Count (≤2 words, no modifier, no material spec → MM)");
      } else {
        strategies.push("Word Count (≥3 words or has modifier or material spec → MP)");
      }
    }
    
    return { level, confidence, strategies, strategyCount: strategies.length };
  }

  // ============================================================
  // 📌 BODY ATTRIBUTES (DENGAN LOKASI LENGKAP)
  // ============================================================

  function updateBodyAttributes() {
    const level = detectPageLevel();
    const entity = detectEntityType();
    const text = getPageText();
    const location = detectLocationHierarchy(text);
    
    document.body.setAttribute("data-page-level", level);
    document.body.setAttribute("data-page-level-num", TYPE_LEVEL_MAP[level]);
    document.body.setAttribute("data-entity-type", entity);
    
    // Set location attributes
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
  // 📌 HELPER FUNCTIONS UNTUK AKSES DATA LOKASI
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
    // Location functions
    getLocationDatabase,
    getAllCities,
    getProvince,
    getRegencies,
    getAllRegencies,
    getKecamatanByKabupatenKota,
    getKecamatanByCity,
    getAllKecamatan,
    detectLocationHierarchy,
    // Utility functions
    hasTechnicalSpec,
    isSubVariant,
    // New v22.6
    MATERIAL_SPEC_WORDS,
    version: "22.6"
  };
  
  window.pageLevelDetectorv22Ready = true;
  window.dispatchEvent(new Event("pageLevelDetectorv22Ready"));
  
  console.log("✅ Page Level Detector v22.6 Ready (JASA dengan material spec → MP)");
  console.log("📍 Tersedia " + getAllKecamatan().length + " kecamatan dari berbagai kabupaten/kota");
  console.log("🔬 Technical specs (K225, K250, K300, dll) tetap MP, bukan Variant");
  console.log("🏗️  JASA dengan material spec (baja, beton, kanstin, dll) → MP, bukan MM");
  
})();
