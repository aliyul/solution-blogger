/* ============================================================
 🧠 Page Level Detector v22.16 — FULL ENTITY DETECTION FIX
    ✅ FIX v22.16: JASA & SEWA bisa menjadi VARIANT (dengan syarat)
    ✅ FIX v22.16: Syarat variant untuk JASA: ada spesifikasi teknis/metode
    ✅ FIX v22.16: Syarat variant untuk SEWA: ada spesifikasi alat/durasi
    ✅ FIX v22.16: Mini/Midi/Maxi BUKAN variant untuk JASA/SEWA (kecuali ada spesifikasi lain)
    ✅ FIX v22.16: Location & Price tetap prioritas utama
    ✅ FIX v22.15: Entity Type detection improved (JASA, PRODUK, MATERIAL, SEWA)
    ✅ FIX v22.15: Variant detection dibatasi untuk PRODUK/MATERIAL saja
    ✅ FIX v22.15: JASA tidak terdeteksi sebagai variant (kecuali ada kata spesifik)
    ✅ FIX v22.15: Mini/Midi/Maxi tidak dianggap variant untuk JASA
    ✅ FIX v22.15: JASA detection kembali ke pola word count
    ✅ FIX v22.15: Money level priority: Price > Location > Word Count
    ✅ FIX: LOCATION_DATABASE disertakan lengkap
    ✅ FIX: log() didefinisikan sebelum digunakan
    ✅ FIX v22.14: Threshold diturunkan dari 3 → 2
    ✅ FIX v22.14: Pola "per meter", "per titik" skor ditingkatkan
    ✅ FIX v22.14: Kata spesifikasi ditambahkan ke cluster
    ✅ FIX v22.14: Pola "spesifikasi + produk" ditambahkan
    ✅ FIX v22.14: Pola "jenis" dikembalikan ke SP2 (bukan variant)
    ✅ FIX v22.14: isSubVariant improved untuk deteksi sub-variant
    ✅ FIX v22.14: Terpasang detection improved
    ✅ FIX v22.13: Hanya tambahkan keyword untuk VARIANT (level 7)
    ✅ FIX v22.13: Tidak mengganggu deteksi MC, SP2, atau level lainnya
    ✅ FIX v22.13: Keyword difokuskan untuk deteksi variant saja
    ✅ FIX v22.12: Tambahan pola "terpasang", "terinstal", "tertanam" untuk variant
    ✅ FIX v22.12: Tambahan cluster kondisi/hasil (condition words)
    ✅ FIX v22.11: Perbaikan deteksi variant untuk "Harga Coring Beton Per Titik"
    ✅ FIX v22.11: Perbaikan scoring untuk kata dengan akhiran "-an" (ukuran, dimensi)
    ✅ FIX v22.11: Perbaikan deteksi "per meter", "per titik" sebagai indikator variant
    ✅ FIX v22.10: VARIANT DETEKSI SEPENUHNYA BERBASIS POLA, BUKAN DAFTAR KATA
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
  // 📌 KONFIGURASI (HARUS DI ATAS SEMUA)
  // ============================================================

  const CONFIG = { DEBUG: true };

  function log(message, type = "INFO") {
    if (!CONFIG.DEBUG && type === "INFO") return;
    const icons = { INFO: "📘", SUCCESS: "✅", WARN: "⚠️", ERROR: "❌", LOCATION: "📍", VARIANT: "🔬" };
    console.log(`${icons[type] || "📘"} [PLD v22.16] ${message}`);
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
  // 📌 VARIANT PATTERN DETECTION (v22.16 - FIXED)
  // ============================================================

  function detectVariantByPattern(text, entityType) {
    if (!text) return { isVariant: false, score: 0, reasons: [] };
    
    let score = 0;
    let reasons = [];
    const lower = text.toLowerCase();
    
    // ============================================================
    // 🔧 FIX v22.16: JASA & SEWA BISA variant (dengan syarat)
    // ============================================================
    
    if (entityType === "jasa" || entityType === "sewa") {
      log(`DETEKSI VARIANT UNTUK ${entityType.toUpperCase()}: "${text}"`, "VARIANT");
      
      // SYARAT 1: BUKAN lokasi atau harga (prioritas lebih tinggi)
      if (PRICE_WORDS.some(w => lower.includes(w))) {
        return { isVariant: false, score: 0, reasons: ["Price word detected → MONEY_PAGE"] };
      }
      
      if (LOCATION_WORDS.some(w => lower.includes(w))) {
        return { isVariant: false, score: 0, reasons: ["Location word detected → MONEY_CHILD"] };
      }
      
      // SYARAT 2: BUKAN ukuran layanan umum (mini, midi, maxi) tanpa spesifikasi
      const sizeWords = /\b(mini|midi|maxi|standar|premium|ekonomis|reguler)\b/i;
      const hasSizeWord = sizeWords.test(lower);
      
      // SYARAT 3: Cek spesifikasi teknis
      let hasSpec = false;
      
      // 🔧 FIX: Deteksi "mutu" sebagai quality word
      const hasQualityWord = /\b(mutu|kualitas|grade|kelas|standar|spesifikasi)\b/i.test(lower);
      
      // Untuk JASA: spesifikasi teknis/metode pengerjaan
      if (entityType === "jasa") {
        const jasaSpecs = [
          /\b(hidrolik|manual|auger|rotary|percussive|dry|wet|basah|kering)\b/i,
          /\b(dalam|dangkal|kedalaman|diameter)\s+\d+/i,
          /\b(terpasang|terinstal|tertanam|terbenam|tercetak|terbentuk|terbuat)\b/i,
          /\b(beton|baja|kayu|batu|keramik|granit|marmer)\s+(coring|potong|bor|pasang|bongkar|cutting|drilling)\b/i,
          /\b(spesifikasi|ukuran|dimensi|detail|parameter)\s+(jasa|layanan)\b/i,
          /\b(metode|cara|teknik)\s+(pengeboran|pemasangan|pengerjaan|pemancangan)\b/i,
          // 🔧 FIX: Tambahan untuk "mutu"
          /\b(mutu|kualitas|grade|kelas|standar)\s+(jasa|layanan|bore|pile|pondasi|pengeboran|pemasangan|beton|tiang)\b/i,
          /\b(jasa|layanan|bore|pile|pondasi|pengeboran|pemasangan)\s+(mutu|kualitas|grade|kelas|standar)\b/i
        ];
        
        for (const pattern of jasaSpecs) {
          if (pattern.test(lower)) {
            hasSpec = true;
            score += 3;
            reasons.push("JASA tech spec found");
          }
        }
      }
      
      // Untuk SEWA: spesifikasi alat atau durasi sewa
      if (entityType === "sewa") {
        const sewaSpecs = [
          /\b(mini|mikro|kecil|besar|medium|jumbo|ekstra)\b/i,
          /\b(hidrolik|manual|diesel|bensin|listrik|pneumatik)\b/i,
          /\b(ringan|berat|sedang)\b/i,
          /\b(track|wheel|roda|ban|rantai)\b/i,
          /\b(kapasitas|tonase|daya|cc|hp|kw)\s+\d+/i,
          /\b(harian|mingguan|bulanan|tahunan|per jam|per hari|per minggu|per bulan|per tahun)\b/i,
          /\b(jam|hari|minggu|bulan|tahun)\s+(sewa|rental)\b/i
        ];
        
        for (const pattern of sewaSpecs) {
          if (pattern.test(lower)) {
            hasSpec = true;
            score += 3;
            reasons.push("SEWA spec found");
          }
        }
      }
      
      // 🔧 FIX: Jika ada quality word (mutu/kualitas) tanpa spec → tetap dianggap spec
      if (hasQualityWord && !hasSpec) {
        hasSpec = true;
        score += 3;
        reasons.push("Quality word detected (mutu/kualitas)");
        log(`"${text}" → QUALITY WORD DETECTED, added 3 points`, "VARIANT");
      }
      
      // SYARAT 4: Jika ada size word tanpa spesifikasi → BUKAN variant
      if (hasSizeWord && !hasSpec) {
        log(`"${text}" → BUKAN variant (size word tanpa spesifikasi)`, "VARIANT");
        return { isVariant: false, score: 0, reasons: ["Size word without spec → bukan variant"] };
      }
      
      // SYARAT 5: Minimal ada spesifikasi ATAU quality word
      if ((hasSpec || hasQualityWord) && score >= 3) {
        log(`"${text}" → VARIANT (score: ${score})`, "VARIANT");
        return { isVariant: true, score, reasons };
      }
      
      // SYARAT 6: Jika tidak ada spesifikasi → BUKAN variant
      log(`"${text}" → BUKAN variant (no spec found, score: ${score})`, "VARIANT");
      return { isVariant: false, score: 0, reasons: ["No tech spec found for service"] };
    }
    
    // ============================================================
    // 📌 VARIANT UNTUK PRODUK / MATERIAL (v22.14)
    // ============================================================
    
    if (entityType === "produk" || entityType === "material") {
      // Mini/Midi/Maxi tanpa spesifikasi → BUKAN variant
      const sizeWords = /\b(mini|midi|maxi|jumbo|ekstra)\b/i;
      const hasSizeWord = sizeWords.test(lower);
      const hasSpecWord = /\b(spesifikasi|ukuran|dimensi|detail|jenis|macam|tipe|model|varian|standar|mutu|kualitas|grade|kelas)\b/i.test(lower);
      
      if (hasSizeWord && !hasSpecWord) {
        return { isVariant: false, score: 0, reasons: ["Size word without spec → bukan variant"] };
      }
      
      // Pola: [kata benda] + [kata sifat] → variant
      const nounPattern = /\b(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer|bata|hebel|genteng|parket|vinil|gypsum|cat|epoxy|coating|mata|bor|coring|molen|vibrator|profil|lis|plint|skirting|trap|tangga|railing|handle|engsel)\s+(?!mini|midi|maxi)(tinggi|rendah|besar|kecil|panjang|pendek|lebar|sempit|tebal|tipis|polos|bermotif|custom|standar|premium|ekonomis|modern|klasik|minimalis|tradisional|elegan|mewah|halus|kasar|matte|glossy|natural|ekspos|doff|gloss|satin|tekstur|serat|anyaman|lis|plint|skirting)\b/i;
      if (nounPattern.test(lower)) { score += 4; reasons.push("Struct: noun + adjective"); }
      
      // Pola: [benda] + [aplikasi spesifik] → variant
      const appPattern = /\b(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer)\s+(untuk|di|area|kawasan|proyek|bangunan|rumah|gedung|jalan|jembatan|terowongan)\s+(perumahan|pabrik|gudang|sekolah|rumah sakit|pertambangan|kandang|ternak|industri|komersial|residensial)\b/i;
      if (appPattern.test(lower)) { score += 4; reasons.push("Struct: noun + specific application"); }
      
      // Pola: [spesifikasi/dimensi] + [benda] → variant
      const dimPattern = /\b(\d+(?:\.\d+)?\s*(?:m|mm|cm|meter|kg|ton|inch|inci|km|milimeter|sentimeter|kilogram))\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer)\b/i;
      if (dimPattern.test(lower)) { score += 5; reasons.push("Struct: dimension + object"); }
      
      // Pola "Per [Satuan]" → variant
      const perUnitPattern = /\bper\s+(meter|titik|m|kg|hari|jam|minggu|bulan|unit|buah|item|lembar|bagian|paket|sesi|kali|kubik|m2|m3|liter|ton|meter lari|m')\b/i;
      if (perUnitPattern.test(lower)) { score += 4; reasons.push("Struct: per unit pattern"); }
      
      // Pola "Beton + [spesifikasi]" → variant
      const betonPattern = /\bbeton\s+(readymix|ready\s*mix|cor|coring|precast|bertulang|polos|instan|kering|basah|struktural|non-struktural|pracetak|cast\s*in\s*situ)\b/i;
      if (betonPattern.test(lower)) { score += 4; reasons.push("Struct: beton + specification"); }
      
      // Pola "Terpasang" → variant
      const terpasangPattern = /\b(terpasang|terinstal|tertanam|terbenam|tercetak|terbentuk|terbuat|terpancang|tertimbun|tersusun)\b/i;
      if (terpasangPattern.test(lower)) { score += 4; reasons.push("Struct: condition/specification"); }
      
      // Pola "Kualitas + [produk]" → variant
      const kualitasPattern = /\b(kualitas|mutu|grade|kelas|standar|spesifikasi|detail|dimensi|ukuran|varian|tipe|model|seri)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer)\b/i;
      if (kualitasPattern.test(lower)) { score += 5; reasons.push("Struct: quality + product"); }
      
      // Pola "Jenis + [produk]" → BUKAN variant
      const jenisPattern = /\b(jenis|macam|ragam|kategori|tipe|model|varian)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer)\b/i;
      if (jenisPattern.test(lower)) {
        return { isVariant: false, score: 0, reasons: ["Jenis pattern → SP2"] };
      }
      
      // Pola "Spesifikasi + [produk]" → variant
      const specPattern = /\b(spesifikasi|dimensi|ukuran|detail|parameter|standar|mutu|kualitas|grade|kelas)\s+(pagar|panel|tiang|pondasi|beton|dinding|atap|lantai|baja|besi|kayu|batu|keramik|plafon|partisi|kusen|pintu|jendela|kanopi|decking|paving|wpc|grc|hpl|pvc|acp|vinyl|granit|marmer|bata|hebel|genteng|parket|vinil|gypsum|cat|epoxy|coating|mata|bor|coring|molen|vibrator|profil|lis|plint|skirting|trap|tangga|railing|handle|engsel)\b/i;
      if (specPattern.test(lower)) { score += 5; reasons.push("Struct: specification + product"); }
      
      // Semantic Cluster
      const dimensionWords = ["tinggi", "rendah", "besar", "kecil", "panjang", "pendek", "lebar", "sempit", "tebal", "tipis", "dalam", "dangkal", "diameter", "radius", "ukuran", "dimensi", "luas", "volume", "kedalaman", "ketebalan", "spesifikasi", "detail", "parameter"];
      const dimCount = dimensionWords.filter(w => lower.includes(w)).length;
      if (dimCount >= 1) { score += dimCount * 2; reasons.push(`Semantic: dimension words (${dimCount})`); }
      
      const finishWords = ["polos", "motif", "corak", "pola", "tekstur", "serat", "kayu", "halus", "kasar", "matte", "glossy", "doff", "cat", "coating", "lapisan", "pelapis", "natural", "ekspos", "finishing", "coring", "bor", "potong", "lubang", "titik", "meter", "kedalaman", "diameter", "gloss", "satin", "anyaman", "lis", "plint", "skirting", "custom", "standar", "premium", "ekonomis", "modern", "klasik", "minimalis", "tradisional", "elegan", "mewah", "polosan", "bermotif"];
      const finishCount = finishWords.filter(w => lower.includes(w)).length;
      if (finishCount >= 1) { score += finishCount * 2; reasons.push(`Semantic: finishing/spec words (${finishCount})`); }
      
      const conditionWords = ["terpasang", "terinstal", "tertanam", "terbenam", "tercetak", "terbentuk", "terbuat", "terpancang", "tertimbun", "tersusun", "hasil", "akhir", "jadi", "selesai", "finished", "installed", "ready", "complete", "final"];
      const condCount = conditionWords.filter(w => lower.includes(w)).length;
      if (condCount >= 1) { score += condCount * 2; reasons.push(`Semantic: condition/result words (${condCount})`); }
      
      // Category Indicator
      const variantIndicator = ["tipe", "model", "varian", "seri", "grade", "kelas", "kategori", "macam", "ragam", "spesifikasi", "detail", "dimensi", "ukuran", "mutu", "kualitas", "standar", "alternatif", "pilihan"];
      const varCount = variantIndicator.filter(w => lower.includes(w)).length;
      if (varCount >= 1) { score += varCount * 2; reasons.push(`Category: variation indicator (${varCount})`); }
      
      // Numeric + Unit
      const numUnitPattern = /\b\d+(?:\.\d+)?\s*(?:m|mm|cm|meter|kg|ton|inch|inci|liter|m³|m2|m²|m3|cm2|cm²|cm3|cm³|km|milimeter|sentimeter|kilogram|satuan|titik)\b/i;
      if (numUnitPattern.test(lower)) {
        const matches = lower.match(/\d+(?:\.\d+)?\s*(?:m|mm|cm|meter|kg|ton|inch|inci|liter|m³|m2|m²|m3|cm2|cm²|cm3|cm³|km|milimeter|sentimeter|kilogram|satuan|titik)/gi);
        const count = matches ? matches.length : 0;
        if (count >= 1) { score += count * 2; reasons.push(`Numeric: ${count} dimension(s) with unit`); }
      }
      
      // Negative Filters
      if (TECHNICAL_SPECS.some(spec => lower.includes(spec))) {
        return { isVariant: false, score: 0, reasons: ["Technical spec detected"] };
      }
      if (NON_VARIANT_WORDS.some(word => lower.includes(word))) {
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
      
      const threshold = 2;
      const isVariant = score >= threshold;
      
      return { isVariant, score, reasons };
    }
    
    return { isVariant: false, score: 0, reasons: [`Entity ${entityType} tidak support variant`] };
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
  // 📌 DETEKSI VARIANT (v22.16 - FULL)
  // ============================================================

  function detectVariantLevel(text, entityType) {
    // 🔧 FIX v22.16: JASA & SEWA bisa variant dengan syarat
    // Cek di dalam detectVariantByPattern
    
    if (isSubVariant(text)) return "sub-variant";
    if (hasTechnicalSpec(text)) return null;
    
    // 🔧 Cek price & location dulu (prioritas lebih tinggi)
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
  // 📌 DETEKSI MONEY LEVEL (v22.16)
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
  // 📌 MAIN DETECTOR (v22.16)
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
    
    // 3. VARIANT (v22.16)
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
    version: "22.16"
  };
  
  window.pageLevelDetectorv22Ready = true;
  window.dispatchEvent(new Event("pageLevelDetectorv22Ready"));
  
  console.log("✅ Page Level Detector v22.16 Ready (FULL ENTITY DETECTION FIX)");
  console.log("📍 Tersedia " + getAllKecamatan().length + " kecamatan");
  console.log("🏗️  ENTITY: JASA, SEWA, PRODUK, MATERIAL, DESAIN, ARTIKEL");
  console.log("🔬 VARIANT: JASA & SEWA BISA variant (dengan syarat spesifikasi teknis)");
  console.log("📝 JASA: ≤2 kata → MM, ≥3 kata → MP");
  console.log("📝 Mini/Midi/Maxi: BUKAN variant untuk JASA/SEWA (kecuali ada spesifikasi)");
  console.log("📝 Priority: Price > Location > Word Count");
  
})();
