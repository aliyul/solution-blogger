/* ============================================================
 🧠 Page Level Detector v22.9 — SMART PATTERN-BASED (PILLAR LENGKAP)
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
    console.log(`${icons[type] || "📘"} [PLD v22.9] ${message}`);
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
  // 📌 VARIANT KEYWORDS & TECHNICAL SPECS
  // ============================================================

  const VARIANT_KEYWORDS = [
    "spesifikasi", "spec", "detail spesifikasi",
    "mutu", "kualitas", "quality",
    "ukuran", "dimensi",
    "grade", "type", "tipe", "model",
    "standar", "merk", "brand", "seri"
  ];

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
  // 📌 DETEKSI ENTITY
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
  // 📌 DETEKSI VARIANT
  // ============================================================

  function isSubVariant(text) {
    if (!text) return false;
    let score = 0;
    if ((text.match(/\d+x\d+/gi) || []).length >= 1) score += 2;
    if (/\d+\s*(mm|cm|m|meter|kg|ton)/i.test(text)) score++;
    const uniqueNumbers = (text.match(/\d+/g) || []).filter((v, i, a) => a.indexOf(v) === i);
    if (uniqueNumbers.length >= 2) score++;
    return score >= 2;
  }

  function detectVariantLevel(text, entityType) {
    if (isSubVariant(text)) return "sub-variant";
    
    if (hasTechnicalSpec(text)) {
      log(`"${text}" mengandung technical spec → BUKAN variant`, "VARIANT");
      return null;
    }
    
    if (NON_VARIANT_WORDS.some(word => text.includes(word))) {
      log(`SKIP VARIANT: "${text}" mengandung kata non-variant`, "WARN");
      return null;
    }
    
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
    
    if (hasLocationWord) return "money-child";
    if (hasPriceWord) return "money-page";
    
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
    
    if (entityType === "jasa" || entityType === "desain") {
      const core = cleanJasaText(text);
      
      const remainingWords = core.split(/\s+/).filter(w => w.length >= 2);
      const wordCount = remainingWords.length;
      
      const hasNumber = /\d/.test(core);
      const hasLocation = isLocation(core);
      const hasModifier = MODIFIER_WORDS.some(m => core.includes(m));
      
      log(`${entityType.toUpperCase()}: "${text}" → core: "${core}", words: ${wordCount}`);
      
      if (wordCount <= 1 && !hasNumber && !hasLocation && !hasModifier) {
        log(`${entityType.toUpperCase()} → MONEY-MASTER`, "SUCCESS");
        return "money-master";
      }
      
      log(`${entityType.toUpperCase()} → MONEY-PAGE`, "INFO");
      return "money-page";
    }
    
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
  // 📌 MAIN DETECTOR (FIXED v22.9 - PILLAR PATTERNS LENGKAP)
  // ============================================================

  function detectPageLevel(userOptions = {}) {
    if (isHomePage()) return "home";
    
    const text = getPageText();
    const entityType = detectEntityType(userOptions.userEntityType);
    
    log(`TEXT: "${text}"`);
    log(`ENTITY: ${entityType}`);
    
    // 1. ENTITY PILLAR (exact match untuk root) - FIXED v22.9
    const pillarPatterns = {
      // JASA
      jasa: ["jasa konstruksi"],
      desain: ["jasa desain"],
      
      // SEWA
      sewa: ["sewa alat konstruksi", "rental alat konstruksi"],
      
      // PRODUK
      produk: ["produk konstruksi"],
      "produk interior": ["produk interior", "interior produk"],  // ✅ FIX v22.9
      
      // MATERIAL
      material: ["material konstruksi", "bahan konstruksi"],
      
      // ARTIKEL
      artikel: ["artikel konstruksi", "blog konstruksi", "tips konstruksi"]  // ✅ FIX v22.9
    };
    
    // Cek apakah text match dengan pillar pattern
    let matchedEntity = null;
    for (const [entity, patterns] of Object.entries(pillarPatterns)) {
      if (patterns.some(pattern => text === pattern)) {
        matchedEntity = entity;
        break;
      }
    }
    
    // Jika match dengan entityType yang terdeteksi → pillar
    if (matchedEntity === entityType || matchedEntity === "produk interior" && entityType === "produk") {
      log(`"${text}" → PILLAR (${entityType})`, "SUCCESS");
      return "pillar";
    }
    
    // 2. SUB PILLAR
    const subPillar = detectSubPillarLevel(text);
    if (subPillar) return subPillar;
    
    // 3. VARIANT
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
      
      if (words.length <= 1 && !hasNumber && !hasLocation && !hasModifier) {
        strategies.push("Auto: remaining words ≤ 1, no number, no location, no modifier → MM");
      } else {
        strategies.push("Auto: remaining words ≥ 2 or has number/location/modifier → MP");
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
    version: "22.9"
  };
  
  window.pageLevelDetectorv22Ready = true;
  window.dispatchEvent(new Event("pageLevelDetectorv22Ready"));
  
  console.log("✅ Page Level Detector v22.9 Ready (Pillar Patterns Lengkap)");
  console.log("📍 Tersedia " + getAllKecamatan().length + " kecamatan");
  console.log("🏗️  Pillar: Jasa Konstruksi, Jasa Desain, Sewa Alat, Produk Konstruksi, Produk Interior, Material, Artikel");
  console.log("🔬 Technical specs (K225, K250, K300) tetap MP, bukan Variant");
  console.log("📝 Tidak perlu tambah manual MATERIAL_SPEC_WORDS untuk kata baru!");
  
})();
