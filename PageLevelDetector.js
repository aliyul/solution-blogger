/* ============================================================
 🧠 Page Level Detector v18.0 — COMPLETE PHASE SYSTEM WITH HOMEPAGE
    ✅ Berdasarkan PHASE 1, PHASE 1.5, STEP 6.2 dari sistem
    ✅ Prioritas: HOMEPAGE → ENTITY TYPE → INTENT → PERBANDINGAN → HARGA → SPESIFISITAS
    ✅ 9-Level Hierarchy: Home → Pillar → SP2 → SP1 → MONEY_MASTER → MONEY_PAGE → MONEY_CHILD → Variant → Sub-Variant
    ✅ Intent detection (Informasional/Komersial/Transaksional)
    ✅ Evergreen vs Non-Evergreen (tahun wajib/tidak)
    ✅ JASA: TIDAK BOLEH MONEY_MASTER
    ✅ Sub-Variant: deteksi spesifikasi SANGAT detail (2+ parameter)
    ✅ Keyword Ciri lengkap untuk setiap level
============================================================ */

(function() {
  if (window.pageLevelDetectorV18) return;
  
  // ============================================================
  // 📌 KONSTANTA VALIDASI (9 LEVEL + HOMEPAGE)
  // ============================================================
  const VALID_LEVELS = [
    'home',                  // Level 0 - HOMEPAGE
    'pillar',                // Level 1 - terluas, EVERGREEN
    'sub-pillar-tipe-2',     // Level 2, EVERGREEN
    'sub-pillar-tipe-1',     // Level 3, FLEXIBLE
    'money-master',          // Level 4 - NON-EVERGREEN (khusus produk/material/sewa)
    'money-page',            // Level 5 - NON-EVERGREEN (produk) / FLEXIBLE (jasa)
    'money-child',           // Level 6 - NON-EVERGREEN (produk) / FLEXIBLE (jasa)
    'variant',               // Level 7, EVERGREEN
    'sub-variant'            // Level 8 - terdalam, EVERGREEN
  ];
  
  const TYPE_LEVEL_MAP = {
    'home': 0,
    'pillar': 1,
    'sub-pillar-tipe-2': 2,
    'sub-pillar-tipe-1': 3,
    'money-master': 4,
    'money-page': 5,
    'money-child': 6,
    'variant': 7,
    'sub-variant': 8
  };
  
  const VALID_ENTITY_TYPES = ['produk', 'jasa', 'sewa', 'material', 'artikel'];
  const VALID_INTENTS = ['informasional', 'komersial', 'transaksional', 'navigasional'];
  
  // ============================================================
  // 📌 KEYWORD CIRI PER LEVEL (LENGKAP)
  // ============================================================
  
  // LEVEL 0: HOMEPAGE
  const HOME_KEYWORDS = ['beranda', 'home', 'halaman utama', 'homepage', 'index'];
  
  // LEVEL 1: PILLAR (Informasional 90%)
  const PILLAR_KEYWORDS = [
    'panduan', 'panduan lengkap', 'cara ', 'tips ', 'tips dan trik',
    'apa itu', 'pengertian', 'definisi', 'edukasi', 'belajar', 
    'tutorial', 'materi', 'penjelasan', 'kenapa', 'mengapa',
    'bagaimana', 'contoh', 'rekomendasi', 'lengkap', 'komprehensif',
    'ultimate guide', 'complete guide', 'semua tentang', 'overview'
  ];
  
  // LEVEL 2: SUB-PILLAR TIPE 2 (Jenis/Macam)
  const SP2_KEYWORDS = [
    'jenis', 'jenis-jenis', 'macam', 'macam-macam', 'tipe ', 
    'kategori', 'ragam', 'berbagai', 'klasifikasi', 'golongan',
    'daftar ', 'list ', 'koleksi', 'varian '
  ];
  
  // LEVEL 3: SUB-PILLAR TIPE 1 (Perbandingan) 🔥 PRIORITAS TERTINGGI
  const SP1_KEYWORDS = [
    ' vs ', 'versus', 'perbandingan', 'bandingkan', 'dibanding',
    'lebih baik', 'mana yang', 'kelebihan', 'kekurangan',
    'perbedaan', 'beda', 'persamaan', 'sama', 'unggul',
    'lebih unggul', 'lebih bagus', 'lebih tahan', 'lebih awet',
    'lebih murah', 'lebih mahal', 'lebih hemat', 'lebih efisien'
  ];
  
  // LEVEL 4-6: MONEY KEYWORDS (Harga/Sewa)
  const MONEY_KEYWORDS = ['harga', 'biaya', 'tarif', 'sewa', 'rental'];
  
  // LEVEL 7: VARIANT (Spesifikasi umum - 1 parameter)
  const VARIANT_KEYWORDS = [
    'spesifikasi', 'ukuran', 'tipe ', 'type ', 'model', 
    'varian', 'warna', 'merk', 'brand', 'kapasitas', 
    'dimensi', 'bahan', 'material', 'finishing', 'grade',
    'seri', 'serie', 'versi', 'generasi', 'detail teknis'
  ];
  
  // ============================================================
  // 📌 INTENT MAP PER PAGE LEVEL (WAJIB DARI PHASE 1.5)
  // ============================================================
  const REQUIRED_INTENT = {
    'home': { intent: 'navigasional', dominance: '70%', secondaryIntent: 'transaksional', secondaryDominance: '30%' },
    'pillar': { intent: 'informasional', dominance: '90%' },
    'sub-pillar-tipe-2': { intent: 'informasional', dominance: '60%', secondaryIntent: 'komersial', secondaryDominance: '40%' },
    'sub-pillar-tipe-1': { intent: 'komersial', dominance: '70%', secondaryIntent: 'informasional', secondaryDominance: '30%' },
    'money-master': { intent: 'transaksional', dominance: '80%', secondaryIntent: 'komersial', secondaryDominance: '20%' },
    'money-page': { intent: 'transaksional', dominance: '85%', secondaryIntent: 'komersial', secondaryDominance: '15%' },
    'money-child': { intent: 'transaksional', dominance: '90%', secondaryIntent: 'komersial', secondaryDominance: '10%' },
    'variant': { intent: 'komersial', dominance: '80%', secondaryIntent: 'informasional', secondaryDominance: '20%' },
    'sub-variant': { intent: 'komersial', dominance: '70%', secondaryIntent: 'informasional', secondaryDominance: '30%' }
  };
  
  // Intent untuk JASA (override)
  const JASA_INTENT = {
    'money-page': { intent: 'komersial', dominance: '60%', secondaryIntent: 'transaksional', secondaryDominance: '40%' },
    'money-child': { intent: 'komersial', dominance: '60%', secondaryIntent: 'transaksional', secondaryDominance: '40%' }
  };
  
  // ============================================================
  // 📌 EVERGREEN vs NON-EVERGREEN (WAJIB DARI STEP 6.2)
  // ============================================================
  const REQUIRES_YEAR = {
    'home': false,
    'money-master': true,           // WAJIB tahun
    'money-page': 'produk-only',    // hanya untuk produk (bukan jasa)
    'money-child': 'produk-only',   // hanya untuk produk (bukan jasa)
    'pillar': false,
    'sub-pillar-tipe-2': false,
    'sub-pillar-tipe-1': false,
    'variant': false,
    'sub-variant': false
  };
  
  // ============================================================
  // 📌 WHITELIST LOKASI KABUPATEN/KOTA INDONESIA (300+ core)
  // ============================================================
  const LOCATION_WHITELIST = new Set([
    // Jabodetabek
    'jakarta', 'jakpus', 'jakbar', 'jaksel', 'jakut', 'jaktim',
    'kepulauan seribu', 'bogor', 'depok', 'tangerang', 'bekasi',
    'tangerang selatan', 'tangsel', 'bintaro', 'alam sutera',
    'gading serpong', 'serpong', 'ciputat', 'pamulang',
    
    // Jawa Barat
    'bandung', 'cimahi', 'cirebon', 'tasikmalaya', 'sukabumi',
    'garut', 'sumedang', 'purwakarta', 'karawang', 'subang',
    'indramayu', 'majalengka', 'kuningan', 'ciamis', 'banjar',
    'pangandaran', 'bekasi kota', 'bogor kota', 'depok kota',
    
    // Jawa Tengah
    'semarang', 'solo', 'surakarta', 'yogyakarta', 'jogja',
    'magelang', 'salatiga', 'pekalongan', 'tegal', 'brebes',
    'cilacap', 'purwokerto', 'banyumas', 'kebumen', 'banjarnegara',
    'purbalingga', 'wonosobo', 'temanggung', 'kendal', 'demak',
    'kudus', 'pati', 'jepara', 'rembang', 'blora', 'grobogan',
    'sragen', 'karanganyar', 'wonogiri', 'sukoharjo', 'klaten',
    'boyolali', 'semarang kota', 'tegal kota', 'pekalongan kota',
    
    // Jawa Timur
    'surabaya', 'malang', 'kediri', 'blitar', 'madiun', 'gresik',
    'sidoarjo', 'pasuruan', 'probolinggo', 'banyuwangi', 'jember',
    'bondowoso', 'situbondo', 'lumajang', 'ngawi', 'ponorogo',
    'pacitan', 'trenggalek', 'tulungagung', 'kediri kota',
    'blitar kota', 'malang kota', 'probolinggo kota', 'pasuruan kota',
    'mojokerto', 'mojokerto kota', 'jombang', 'nganjuk',
    
    // Sumatera
    'medan', 'binjai', 'deli serdang', 'padang', 'pekanbaru',
    'batam', 'tanjung pinang', 'palembang', 'lampung', 'bandar lampung',
    'metro', 'bengkulu', 'jambi', 'tebing tinggi', 'pematang siantar',
    'kisaran', 'rantau prapat', 'sibolga', 'padang sidempuan',
    'bukittinggi', 'payakumbuh', 'solok', 'sawahlunto', 'padang panjang',
    'dumai', 'bengkalis', 'riau', 'kepulauan riau',
    
    // Kalimantan
    'pontianak', 'ketapang', 'singkawang', 'palangkaraya',
    'balikpapan', 'samarinda', 'bontang', 'tarakan', 'banjarmasin',
    'banjarbaru', 'martapura', 'tanjung', 'barabai',
    
    // Sulawesi
    'makassar', 'manado', 'palu', 'kendari', 'gorontalo', 'bitung',
    'tomohon', 'kotamobagu', 'palopo', 'parepare', 'luwuk',
    
    // Bali & Nusa Tenggara
    'denpasar', 'bali', 'badung', 'gianyar', 'tabanan', 'bangli',
    'klungkung', 'karangasem', 'buleleng', 'jembrana', 'mataram',
    'ntb', 'kupang', 'ntt',
    
    // Maluku & Papua
    'ambon', 'ternate', 'tidore', 'jayapura', 'sorong', 'merauke',
    'timika', 'nabire', 'manokwari'
  ]);
  
  // Blacklist kata yang MIRIP lokasi tapi sebenarnya SPESIFIKASI PRODUK
  const NOT_LOCATION_WORDS = new Set([
    'mini', 'maxi', 'super', 'extra', 'plus', 'pro', 'max', 'ultra', 'deluxe',
    'baru', 'lama', 'bekas', 'second', 'original', 'kw', 'grade', 'kwalitas',
    'murah', 'mahal', 'hemat', 'premium', 'standar', 'ekonomis', 
    'kecil', 'besar', 'sedang', 'panjang', 'pendek', 'tebal', 'tipis', 'lebar',
    'putih', 'hitam', 'merah', 'biru', 'hijau', 'kuning', 'ungu', 'abu', 'coklat',
    'minimalis', 'modern', 'klasik', 'industrial', 'skandinavia', 'jepang',
    'hpl', 'mdf', 'jati', 'kayu', 'besi', 'baja', 'aluminium', 'kaca',
    'galvalum', 'spandek', 'bondek', 'hebel', 'bata ringan', 'conblock',
    'excavator', 'bulldozer', 'crane', 'dump truck', 'vibro', 'stamper',
    'roofing', 'insulation', 'waterproof', 'paint', 'cat', 'tembok'
  ]);
  
  // ============================================================
  // 📌 POLA SPESIFIKASI UNTUK VARIANT vs SUB-VARIANT
  // ============================================================
  
  // SUB-VARIANT: minimal 2 parameter spesifikasi yang sangat detail
  const SUB_VARIANT_PATTERNS = [
    /[0-9]+(\s*\.\s*[0-9]+)?\s*mm\s*x\s*[0-9]+(\s*\.\s*[0-9]+)?\s*(mm|cm|m)/i,
    /[0-9]+(\s*\.\s*[0-9]+)?\s*cm\s*x\s*[0-9]+(\s*\.\s*[0-9]+)?\s*cm\s*x\s*[0-9]+(\s*\.\s*[0-9]+)?\s*cm/i,
    /tebal\s+[0-9]+(\s*\.\s*[0-9]+)?\s*mm\s+panjang\s+[0-9]+(\s*\.\s*[0-9]+)?\s*m/i,
    /ukuran:\s*[0-9]+(\s*\.\s*[0-9]+)?\s*x\s*[0-9]+(\s*\.\s*[0-9]+)?\s*x\s*[0-9]+(\s*\.\s*[0-9]+)?/i,
    /dimensi\s*[0-9]+(\s*\.\s*[0-9]+)?\s*x\s*[0-9]+(\s*\.\s*[0-9]+)?/i,
    /kapasitas\s*[0-9]+(\s*\.\s*[0-9]+)?\s*(ton|kg|liter)/i,
    /[0-9]+(\s*\.\s*[0-9]+)?\s*ton\s*-\s*[0-9]+(\s*\.\s*[0-9]+)?\s*ton/i
  ];
  
  // VARIANT: 1-2 parameter spesifikasi (masih umum)
  const VARIANT_PATTERNS = [
    /spesifikasi/i, /ukuran/i, /tipe/i, /merk/i, /warna/i,
    /kapasitas/i, /dimensi/i, /model/i, /seri/i,
    /[0-9]+(\s*\.\s*[0-9]+)?\s*mm(?!\s*x)/i,
    /[0-9]+(\s*\.\s*[0-9]+)?\s*cm(?!\s*x)/i,
    /mini|maxi|super|pro|max|ultra/i
  ];
  
  // ============================================================
  // 📌 FUNGSI UTILITY
  // ============================================================
  
  function isHomePage() {
    const url = window.location.href.toLowerCase();
    const path = url.replace(/https?:\/\/[^\/]+/, '');
    const isRoot = path === '' || path === '/' || path === '/index.html' || path === '/home';
    
    if (isRoot) return true;
    
    const h1 = (document.querySelector("h1")?.innerText || "").toLowerCase();
    const title = document.title.toLowerCase();
    
    return HOME_KEYWORDS.some(kw => h1 === kw || title === kw);
  }
  
  function isLocation(word) {
    const lowerWord = word.toLowerCase().replace(/[^a-z]/g, '');
    if (NOT_LOCATION_WORDS.has(lowerWord)) return false;
    if (LOCATION_WHITELIST.has(lowerWord)) return true;
    return false;
  }
  
  function isSpecificProduct(text, wordCountAfterPrice = null) {
    if (wordCountAfterPrice !== null && wordCountAfterPrice <= 2) return false;
    
    const specificIndicators = [
      'galvalum', 'spandek', 'bondek', 'hebel', 'bata ringan', 'conblock',
      'excavator', 'bulldozer', 'crane', 'dump truck', 'vibro', 'stamper',
      'hpl', 'mdf', 'jati', 'mahoni', 'multiplek', 'triplek',
      'roofing', 'insulation', 'waterproof'
    ];
    
    for (const indicator of specificIndicators) {
      if (text.includes(indicator)) return true;
    }
    
    if (/\d+(\.\d+)?\s*(mm|cm|m|inch)/.test(text)) return true;
    
    return false;
  }
  
  // ============================================================
  // 📌 PRIORITAS 1: DETEKSI ENTITY TYPE
  // ============================================================
  function detectEntityType(userInputEntity = null) {
    if (userInputEntity && VALID_ENTITY_TYPES.includes(userInputEntity.toLowerCase())) {
      const entity = userInputEntity.toLowerCase();
      console.log(`📌 PRIORITAS 1: Entity type from user input = ${entity}`);
      return entity;
    }
    
    const url = window.location.pathname.toLowerCase();
    const h1 = (document.querySelector("h1")?.innerText || "").toLowerCase();
    const title = (document.title || "").toLowerCase();
    const combined = url + ' ' + h1 + ' ' + title;
    
    if (combined.includes('/jasa/') || combined.includes('jasa ') || 
        combined.includes('kontraktor') || combined.includes('pasang ')) return 'jasa';
    if (combined.includes('/sewa/') || combined.includes('/rental/') || 
        combined.includes('sewa ') || combined.includes('alat berat')) return 'sewa';
    if (combined.includes('/material/') || combined.includes('material ') || 
        combined.includes('bahan bangunan')) return 'material';
    if (combined.includes('/artikel/') || combined.includes('/blog/')) return 'artikel';
    
    return 'produk';
  }
  
  // ============================================================
  // 📌 PRIORITAS 2: DETEKSI INTENT DARI H1
  // ============================================================
  function detectIntentFromText(text) {
    const lowerText = text.toLowerCase();
    
    // Cek transaksional
    for (const keyword of MONEY_KEYWORDS) {
      if (lowerText.includes(keyword)) {
        console.log(`📌 Intent detected = transaksional (keyword: ${keyword})`);
        return 'transaksional';
      }
    }
    
    // Cek komersial
    for (const keyword of SP1_KEYWORDS) {
      if (lowerText.includes(keyword)) {
        console.log(`📌 Intent detected = komersial (keyword: ${keyword})`);
        return 'komersial';
      }
    }
    for (const keyword of VARIANT_KEYWORDS) {
      if (lowerText.includes(keyword)) {
        console.log(`📌 Intent detected = komersial (keyword: ${keyword})`);
        return 'komersial';
      }
    }
    
    // Default informasional
    console.log(`📌 Intent detected = informasional (default)`);
    return 'informasional';
  }
  
  // ============================================================
  // 📌 DETEKSI MONEY LEVEL (PRIORITAS 4 SETELAH PERBANDINGAN)
  // ============================================================
  function detectMoneyLevel(text, entityType) {
    const lowerText = text.toLowerCase();
    
    const hasPrice = lowerText.includes('harga') || lowerText.includes('biaya') || lowerText.includes('tarif');
    const hasRent = lowerText.includes('sewa') || lowerText.includes('rental');
    
    if (!hasPrice && !hasRent) return null;
    
    let afterKeyword = '';
    if (hasPrice) {
      const idx = Math.max(
        lowerText.indexOf('harga'),
        lowerText.indexOf('biaya'),
        lowerText.indexOf('tarif')
      );
      afterKeyword = lowerText.substring(idx + 5);
    } else if (hasRent) {
      afterKeyword = lowerText.substring(lowerText.indexOf('sewa') + 4);
    }
    afterKeyword = afterKeyword.slice(0, 80).trim();
    
    // CEK LOKASI (MONEY_CHILD)
    const words = afterKeyword.split(/[\s,-]+/);
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const nextWord = words[i+1] || '';
      if (isLocation(word) || (word === 'di' && isLocation(nextWord))) {
        console.log(`📌 Location detected → money-child`);
        if (entityType === 'jasa') return 'money-child';
        return 'money-child';
      }
    }
    
    // CEK SPESIFIKASI PRODUK
    if (isSpecificProduct(afterKeyword)) {
      console.log(`📌 Specific product detected → money-page`);
      return 'money-page';
    }
    
    // CEK JUMLAH KATA
    const wordCount = afterKeyword.split(/\s+/).filter(w => w.length > 0 && !NOT_LOCATION_WORDS.has(w)).length;
    
    if (wordCount <= 2) {
      if (entityType === 'jasa') {
        console.log(`📌 JASA with general price → forced to money-page`);
        return 'money-page';
      }
      console.log(`📌 General category (${wordCount} words) → money-master`);
      return 'money-master';
    }
    
    console.log(`📌 Specific product (${wordCount} words) → money-page`);
    return 'money-page';
  }
  
  // ============================================================
  // 📌 DETEKSI VARIANT vs SUB-VARIANT
  // ============================================================
  function detectVariantLevel(text) {
    const lowerText = text.toLowerCase();
    
    // CEK SUB-VARIANT (2+ parameter)
    let subVariantScore = 0;
    for (const pattern of SUB_VARIANT_PATTERNS) {
      if (pattern.test(lowerText)) {
        subVariantScore++;
        console.log(`📌 Sub-variant pattern matched`);
      }
    }
    
    const hasFullDimension = /[0-9]+(\s*\.\s*[0-9]+)?\s*mm\s*x\s*[0-9]+(\s*\.\s*[0-9]+)?\s*(mm|cm|m)/i.test(lowerText);
    if (hasFullDimension) subVariantScore++;
    
    const dimensionCount = (lowerText.match(/[0-9]+(\s*\.\s*[0-9]+)?\s*(mm|cm|m|inch|ton|kg|liter)/gi) || []).length;
    if (dimensionCount >= 3) subVariantScore++;
    
    if (subVariantScore >= 2) {
      console.log(`📌 SUB-VARIANT detected (score: ${subVariantScore})`);
      return 'sub-variant';
    }
    
    // CEK VARIANT
    for (const pattern of VARIANT_PATTERNS) {
      if (typeof pattern === 'string' && lowerText.includes(pattern)) {
        console.log(`📌 VARIANT detected (pattern: ${pattern})`);
        return 'variant';
      }
      if (pattern instanceof RegExp && pattern.test(lowerText)) {
        console.log(`📌 VARIANT detected (regex)`);
        return 'variant';
      }
    }
    
    return null;
  }
  
  // ============================================================
  // 📌 DETEKSI SUB-PILLAR LEVEL
  // ============================================================
  function detectSubPillarLevel(text) {
    const lowerText = text.toLowerCase();
    
    // SUB-PILLAR TIPE 1 (Perbandingan) 🔥 PRIORITAS LEBIH TINGGI
    for (const kw of SP1_KEYWORDS) {
      if (lowerText.includes(kw)) {
        console.log(`📌 SUB-PILLAR TIPE 1 detected (perbandingan: ${kw})`);
        return 'sub-pillar-tipe-1';
      }
    }
    
    // SUB-PILLAR TIPE 2 (Jenis, macam, tipe)
    for (const kw of SP2_KEYWORDS) {
      if (lowerText.includes(kw)) {
        console.log(`📌 SUB-PILLAR TIPE 2 detected (jenis/macam: ${kw})`);
        return 'sub-pillar-tipe-2';
      }
    }
    
    return null;
  }
  
  // ============================================================
  // 📌 DETEKSI JASA (tanpa keyword harga)
  // ============================================================
  function detectJasaLevel(text, entityType) {
    if (entityType !== 'jasa') return null;
    
    const lowerText = text.toLowerCase();
    const jasaKeywords = ['jasa', 'pasang', 'service', 'kontraktor', 'borongan', 
                           'renovasi', 'bangun', 'konsultasi', 'survey', 'estimasi'];
    
    for (const kw of jasaKeywords) {
      if (lowerText.includes(kw)) {
        // Double-check perbandingan
        for (const cmp of SP1_KEYWORDS) {
          if (lowerText.includes(cmp)) {
            console.log(`📌 JASA + perbandingan → sub-pillar-tipe-1`);
            return 'sub-pillar-tipe-1';
          }
        }
        
        if (isLocation(lowerText)) {
          console.log(`📌 JASA + location → money-child`);
          return 'money-child';
        }
        console.log(`📌 JASA detected → money-page`);
        return 'money-page';
      }
    }
    
    return null;
  }
  
  // ============================================================
  // 📌 DETEKSI SEWA (tanpa keyword harga)
  // ============================================================
  function detectSewaLevel(text, entityType) {
    if (entityType !== 'sewa') return null;
    
    const lowerText = text.toLowerCase();
    const sewaKeywords = ['sewa', 'rental', 'alat berat', 'excavator', 'bulldozer', 'crane'];
    
    for (const kw of sewaKeywords) {
      if (lowerText.includes(kw)) {
        for (const cmp of SP1_KEYWORDS) {
          if (lowerText.includes(cmp)) {
            console.log(`📌 SEWA + perbandingan → sub-pillar-tipe-1`);
            return 'sub-pillar-tipe-1';
          }
        }
        
        if (isLocation(lowerText)) {
          console.log(`📌 SEWA + location → money-child`);
          return 'money-child';
        }
        console.log(`📌 SEWA detected → money-page`);
        return 'money-page';
      }
    }
    
    return null;
  }
  
  // ============================================================
  // 📌 FUNGSI DETEKSI UTAMA (PRIORITAS LENGKAP)
  // ============================================================
  function detectPageLevel(userOptions = {}) {
    const { userEntityType = null } = userOptions;
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔍 Page Level Detector v18.0 — PHASE SYSTEM");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // PRIORITAS 0: HOMEPAGE
    if (isHomePage()) {
      console.log(`🏠 PRIORITAS 0: HOMEPAGE detected → home (L0)`);
      return 'home';
    }
    
    // PRIORITAS 1: ENTITY TYPE
    const entityType = detectEntityType(userEntityType);
    console.log(`✅ PRIORITAS 1: Entity Type = ${entityType.toUpperCase()}`);
    
    const h1 = (document.querySelector("h1")?.innerText || "").trim();
    const title = (document.title || "").trim();
    const combinedText = h1 + ' ' + title;
    
    console.log(`📄 H1: "${h1.substring(0, 60)}..."`);
    
    // PRIORITAS 2: INTENT
    const detectedIntent = detectIntentFromText(combinedText);
    console.log(`✅ PRIORITAS 2: Intent = ${detectedIntent.toUpperCase()}`);
    
    // PRIORITAS 3: PERBANDINGAN (SUB-PILLAR TIPE 1) 🔥 SEBELUM HARGA
    const subPillarLevel = detectSubPillarLevel(combinedText);
    if (subPillarLevel) {
      console.log(`✅ PRIORITAS 3: Sub-Pillar Level = ${subPillarLevel.toUpperCase()}`);
      console.log(`✅ FINAL Page Level = ${subPillarLevel.toUpperCase()}`);
      return subPillarLevel;
    }
    
    // PRIORITAS 4: MONEY LEVEL (HARGA/SEWA)
    const hasPrice = combinedText.includes('harga') || combinedText.includes('biaya') || 
                     combinedText.includes('tarif') || combinedText.includes('sewa');
    
    if (hasPrice) {
      const moneyLevel = detectMoneyLevel(combinedText, entityType);
      if (moneyLevel) {
        if (entityType === 'jasa' && moneyLevel === 'money-master') {
          console.log(`⚠️ JASA cannot be money-master → redirecting to money-page`);
          console.log(`✅ FINAL Page Level = MONEY_PAGE`);
          return 'money-page';
        }
        console.log(`✅ PRIORITAS 4: Money Level = ${moneyLevel.toUpperCase()}`);
        console.log(`✅ FINAL Page Level = ${moneyLevel.toUpperCase()}`);
        return moneyLevel;
      }
    }
    
    // PRIORITAS 5: JASA (tanpa harga)
    const jasaLevel = detectJasaLevel(combinedText, entityType);
    if (jasaLevel) {
      console.log(`✅ PRIORITAS 5: JASA Level = ${jasaLevel.toUpperCase()}`);
      console.log(`✅ FINAL Page Level = ${jasaLevel.toUpperCase()}`);
      return jasaLevel;
    }
    
    // PRIORITAS 6: SEWA (tanpa harga)
    const sewaLevel = detectSewaLevel(combinedText, entityType);
    if (sewaLevel) {
      console.log(`✅ PRIORITAS 6: SEWA Level = ${sewaLevel.toUpperCase()}`);
      console.log(`✅ FINAL Page Level = ${sewaLevel.toUpperCase()}`);
      return sewaLevel;
    }
    
    // PRIORITAS 7: VARIANT / SUB-VARIANT
    const variantLevel = detectVariantLevel(combinedText);
    if (variantLevel) {
      console.log(`✅ PRIORITAS 7: Variant Level = ${variantLevel.toUpperCase()}`);
      console.log(`✅ FINAL Page Level = ${variantLevel.toUpperCase()}`);
      return variantLevel;
    }
    
    // DEFAULT: PILLAR
    console.log(`✅ FINAL Page Level = PILLAR (default)`);
    return 'pillar';
  }
  
  // ============================================================
  // 📌 VALIDASI INTENT (WAJIB SESUAI PHASE 1.5)
  // ============================================================
  function validateIntent(pageLevel, detectedIntent, entityType) {
    let required, dominance, secondary, secondaryDom;
    
    if (entityType === 'jasa' && JASA_INTENT[pageLevel]) {
      required = JASA_INTENT[pageLevel].intent;
      dominance = JASA_INTENT[pageLevel].dominance;
      secondary = JASA_INTENT[pageLevel].secondaryIntent;
      secondaryDom = JASA_INTENT[pageLevel].secondaryDominance;
      console.log(`📋 JASA Intent Check: ${pageLevel} should be ${required} (${dominance}) or ${secondary} (${secondaryDom})`);
      
      if (detectedIntent === required || detectedIntent === secondary) {
        console.log(`✅ Intent valid for JASA ${pageLevel}`);
        return true;
      }
      console.warn(`⚠️ Intent mismatch: ${pageLevel} for JASA should be ${required} or ${secondary}, but got ${detectedIntent}`);
      return false;
    }
    
    if (REQUIRED_INTENT[pageLevel]) {
      required = REQUIRED_INTENT[pageLevel].intent;
      dominance = REQUIRED_INTENT[pageLevel].dominance;
      secondary = REQUIRED_INTENT[pageLevel].secondaryIntent;
      console.log(`📋 Intent Check: ${pageLevel} should be ${required} (${dominance})`);
      
      if (detectedIntent === required) {
        console.log(`✅ Intent valid: ${detectedIntent} matches ${pageLevel}`);
        return true;
      }
      
      if (secondary && detectedIntent === secondary) {
        console.log(`✅ Intent valid (secondary): ${detectedIntent} matches ${pageLevel}`);
        return true;
      }
      
      console.warn(`⚠️ Intent mismatch: ${pageLevel} should be ${required}, but got ${detectedIntent}`);
      return false;
    }
    
    return true;
  }
  
  // ============================================================
  // 📌 CEK APAKAH H1 PERLU TAHUN (EVERGREEN vs NON-EVERGREEN)
  // ============================================================
  function requiresYearInH1(pageLevel, entityType) {
    const rule = REQUIRES_YEAR[pageLevel];
    
    if (rule === true) return true;
    if (rule === 'produk-only' && entityType !== 'jasa' && entityType !== 'sewa') return true;
    return false;
  }
  
  // ============================================================
  // 📌 GET REQUIRED INTENT
  // ============================================================
  function getRequiredIntent(pageLevel, entityType) {
    if (entityType === 'jasa' && JASA_INTENT[pageLevel]) {
      return JASA_INTENT[pageLevel];
    }
    return REQUIRED_INTENT[pageLevel] || { intent: 'informasional', dominance: '50%' };
  }
  
  // ============================================================
  // 📌 FUNGSI UPDATE BODY ATTRIBUTES
  // ============================================================
  function updateBodyAttributes(userOptions = {}) {
    const pageLevel = detectPageLevel(userOptions);
    const entityType = detectEntityType(userOptions.userEntityType);
    const h1 = (document.querySelector("h1")?.innerText || "").trim();
    const detectedIntent = detectIntentFromText(h1);
    const intentValid = validateIntent(pageLevel, detectedIntent, entityType);
    const needsYear = requiresYearInH1(pageLevel, entityType);
    const requiredIntent = getRequiredIntent(pageLevel, entityType);
    
    document.body.setAttribute('data-page-level', pageLevel);
    document.body.setAttribute('data-page-level-num', TYPE_LEVEL_MAP[pageLevel]?.toString() || '?');
    document.body.setAttribute('data-entity-type', entityType);
    document.body.setAttribute('data-intent', detectedIntent);
    document.body.setAttribute('data-intent-valid', intentValid ? 'true' : 'false');
    document.body.setAttribute('data-requires-year', needsYear ? 'true' : 'false');
    document.body.setAttribute('data-required-intent', requiredIntent.intent);
    document.body.setAttribute('data-intent-dominance', requiredIntent.dominance);
    if (requiredIntent.secondaryIntent) {
      document.body.setAttribute('data-secondary-intent', requiredIntent.secondaryIntent);
      document.body.setAttribute('data-secondary-dominance', requiredIntent.secondaryDominance);
    }
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 FINAL DETECTION RESULT");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📌 Page Level     : ${pageLevel.toUpperCase()} (L${TYPE_LEVEL_MAP[pageLevel] || '?'})`);
    console.log(`📌 Entity Type    : ${entityType.toUpperCase()}`);
    console.log(`📌 Intent         : ${detectedIntent.toUpperCase()}`);
    console.log(`📌 Intent Valid   : ${intentValid ? '✅ YES' : '❌ NO'}`);
    console.log(`📌 Requires Year  : ${needsYear ? '✅ YES (NON-EVERGREEN)' : '❌ NO (EVERGREEN)'}`);
    console.log(`📌 Required Intent: ${requiredIntent.intent.toUpperCase()} (${requiredIntent.dominance})`);
    if (requiredIntent.secondaryIntent) {
      console.log(`📌 Secondary Intent: ${requiredIntent.secondaryIntent.toUpperCase()} (${requiredIntent.secondaryDominance})`);
    }
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    return {
      pageLevel: pageLevel,
      pageLevelNum: TYPE_LEVEL_MAP[pageLevel] || null,
      entityType: entityType,
      intent: detectedIntent,
      intentValid: intentValid,
      requiresYear: needsYear,
      requiredIntent: requiredIntent.intent,
      intentDominance: requiredIntent.dominance,
      secondaryIntent: requiredIntent.secondaryIntent,
      secondaryDominance: requiredIntent.secondaryDominance
    };
  }
  
  // ============================================================
  // 📌 SET MANUAL PAGE LEVEL (OVERRIDE)
  // ============================================================
  function setManualPageLevel(level, entityType = null) {
    const currentEntityType = entityType || detectEntityType();
    
    if (!VALID_LEVELS.includes(level)) {
      console.error(`❌ Invalid page level: ${level}. Valid: ${VALID_LEVELS.join(', ')}`);
      return false;
    }
    
    if (currentEntityType === 'jasa' && level === 'money-master') {
      console.error(`❌ JASA cannot use money-master! Override rejected.`);
      return false;
    }
    
    window.__manualPageLevel = level;
    document.body.setAttribute('data-page-level', level);
    document.body.setAttribute('data-page-level-num', TYPE_LEVEL_MAP[level]?.toString() || '?');
    console.log(`✅ Manual page level set to: ${level} (L${TYPE_LEVEL_MAP[level]})`);
    return true;
  }
  
  // ============================================================
  // 📌 EXPOSE FUNGSI
  // ============================================================
  window.pageLevelDetectorV18 = {
    detect: detectPageLevel,
    setManual: setManualPageLevel,
    detectEntityType: detectEntityType,
    detectIntent: detectIntentFromText,
    validateIntent: validateIntent,
    requiresYear: requiresYearInH1,
    getRequiredIntent: getRequiredIntent,
    updateAttributes: updateBodyAttributes,
    isHomePage: isHomePage,
    isValidLevel: (level) => VALID_LEVELS.includes(level),
    isValidEntityType: (type) => VALID_ENTITY_TYPES.includes(type),
    getLocationWhitelist: () => Array.from(LOCATION_WHITELIST),
    getLevelNumber: (level) => TYPE_LEVEL_MAP[level] || null,
    VALID_LEVELS: VALID_LEVELS,
    VALID_ENTITY_TYPES: VALID_ENTITY_TYPES,
    VALID_INTENTS: VALID_INTENTS,
    TYPE_LEVEL_MAP: TYPE_LEVEL_MAP,
    version: '18.0'
  };
  
  window.__pageLevelDetectorV18Ready = true;
  window.dispatchEvent(new Event("pageLevelDetectorV18Ready"));
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Page Level Detector v18.0 ready");
  console.log("📋 Complete 9-Level Hierarchy: HOME(L0) → " + VALID_LEVELS.filter(l => l !== 'home').join(' → '));
  console.log("📋 Intent detection: YES");
  console.log("📋 Evergreen validation: YES");
  console.log("📋 JASA special rules: YES");
  console.log("📋 PRIORITAS: Home(0) → Entity → Intent → PERBANDINGAN(3) → HARGA(4) → JASA(5) → Variant(7) → SP2(2) → Pillar(1)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
})();
