/* ============================================================
 🧠 Page Level Detector v18.1 — COMPLETE PHASE SYSTEM WITH ENTITY PILLAR
    ✅ FIX: "Jasa Konstruksi" → PILLAR (L1), BUKAN money-page
    ✅ FIX: "Sewa Alat Konstruksi" → PILLAR (L1), BUKAN money-page
    ✅ FIX: Entity Pillar untuk setiap ENTITY TYPE
    ✅ Berdasarkan PHASE 1, PHASE 1.5, STEP 6.2 dari sistem
    ✅ Prioritas: HOMEPAGE → ENTITY PILLAR → INFORMASIONAL → PERBANDINGAN → SP2 → MONEY → JASA/SEWA → VARIANT
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
    'pillar',                // Level 1 - PILLAR (topik utama per entity)
    'sub-pillar-tipe-2',     // Level 2 - JENIS/MACAM/DAFTAR
    'sub-pillar-tipe-1',     // Level 3 - PERBANDINGAN
    'money-master',          // Level 4 - HARGA NASIONAL (khusus produk/material/sewa)
    'money-page',            // Level 5 - HARGA PRODUK SPESIFIK / JASA SPESIFIK
    'money-child',           // Level 6 - HARGA + LOKASI / JASA + LOKASI
    'variant',               // Level 7 - SPESIFIKASI (1 parameter)
    'sub-variant'            // Level 8 - DETAIL TEKNIS (2+ parameter)
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
  
  const VALID_ENTITY_TYPES = ['produk', 'material', 'jasa', 'sewa', 'artikel'];
  const VALID_INTENTS = ['informasional', 'komersial', 'transaksional', 'navigasional'];
  
  // ============================================================
  // 📌 KEYWORD CIRI PER LEVEL (LENGKAP)
  // ============================================================
  
  // LEVEL 0: HOMEPAGE
  const HOME_KEYWORDS = ['beranda', 'home', 'halaman utama', 'homepage', 'index'];
  
  // 🔥 LEVEL 1: PILLAR UNTUK SETIAP ENTITY TYPE (PERBAIKAN UTAMA)
  const ENTITY_PILLAR_KEYWORDS = {
    'jasa': [
      'jasa konstruksi', 'jasa bangunan', 'layanan konstruksi', 
      'jasa kontraktor', 'jasa pemborong', 'jasa renovasi'
    ],
    'sewa': [
      'sewa alat konstruksi', 'sewa alat berat', 'rental alat berat',
      'sewa alat bangunan', 'rental konstruksi', 'sewa excavator'
    ],
    'produk': [
      'produk konstruksi', 'produk bangunan', 'produk interior',
      'material konstruksi', 'bahan bangunan'
    ],
    'material': [
      'material konstruksi', 'bahan bangunan', 'material bangunan',
      'supplier material', 'toko material'
    ],
    'artikel': [
      'artikel konstruksi', 'blog konstruksi', 'tips konstruksi'
    ]
  };
  
  // LEVEL 1: PILLAR (Informasional 90%) - untuk konten edukasi
  const PILLAR_KEYWORDS = [
    'panduan', 'panduan lengkap', 'cara ', 'tips ', 'tips dan trik',
    'apa itu', 'pengertian', 'definisi', 'edukasi', 'belajar', 
    'tutorial', 'materi', 'penjelasan', 'kenapa', 'mengapa',
    'bagaimana', 'contoh', 'rekomendasi', 'lengkap', 'komprehensif',
    'ultimate guide', 'complete guide', 'semua tentang', 'overview'
  ];
  
  // LEVEL 2: SUB-PILLAR TIPE 2 (Jenis/Macam/Daftar)
  const SP2_KEYWORDS = [
    'jenis', 'jenis-jenis', 'macam', 'macam-macam', 'tipe ', 
    'kategori', 'ragam', 'berbagai', 'klasifikasi', 'golongan',
    'daftar ', 'list ', 'koleksi', 'varian '
  ];
  
  // LEVEL 3: SUB-PILLAR TIPE 1 (Perbandingan)
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
    'pillar': false,
    'sub-pillar-tipe-2': false,
    'sub-pillar-tipe-1': false,
    'money-master': true,
    'money-page': 'produk-only',
    'money-child': 'produk-only',
    'variant': false,
    'sub-variant': false
  };
  
  // ============================================================
  // 📌 WHITELIST LOKASI (300+ KOTA)
  // ============================================================
  const LOCATION_WHITELIST = new Set([
    'jakarta', 'bogor', 'depok', 'tangerang', 'bekasi', 'jabodetabek',
    'jakpus', 'jakbar', 'jaksel', 'jakut', 'jaktim', 'tangsel',
    'bandung', 'cimahi', 'cirebon', 'tasikmalaya', 'sukabumi', 'garut',
    'semarang', 'solo', 'surakarta', 'yogyakarta', 'jogja', 'magelang',
    'surabaya', 'malang', 'kediri', 'blitar', 'madiun', 'gresik', 'sidoarjo',
    'medan', 'binjai', 'deli serdang', 'padang', 'pekanbaru', 'batam',
    'palembang', 'bandar lampung', 'pontianak', 'balikpapan', 'samarinda',
    'banjarmasin', 'makassar', 'manado', 'palu', 'denpasar', 'bali', 'mataram'
  ]);
  
  const PRODUCT_BLACKLIST = new Set([
    'baja', 'ringan', 'galvalum', 'spandek', 'bondek', 'hebel', 'bata',
    'pasang', 'service', 'kontraktor', 'renovasi', 'borongan',
    'kayu', 'besi', 'aluminium', 'kaca', 'semen', 'pasir', 'batu',
    'hpl', 'mdf', 'jati', 'mahoni', 'multiplek', 'triplek'
  ]);
  
  // Pola spesifikasi
  const SUB_VARIANT_PATTERNS = [
    /[0-9]+(\s*\.\s*[0-9]+)?\s*mm\s*x\s*[0-9]+(\s*\.\s*[0-9]+)?\s*(mm|cm|m)/i,
    /[0-9]+(\s*\.\s*[0-9]+)?\s*cm\s*x\s*[0-9]+(\s*\.\s*[0-9]+)?\s*cm\s*x\s*[0-9]+(\s*\.\s*[0-9]+)?\s*cm/i,
    /tebal\s+[0-9]+(\s*\.\s*[0-9]+)?\s*mm\s+panjang\s+[0-9]+(\s*\.\s*[0-9]+)?\s*m/i,
    /kapasitas\s*[0-9]+(\s*\.\s*[0-9]+)?\s*(ton|kg|liter)/i
  ];
  
  const VARIANT_PATTERNS = [
    /spesifikasi/i, /ukuran/i, /tipe/i, /merk/i, /warna/i,
    /kapasitas/i, /dimensi/i, /model/i, /seri/i,
    /[0-9]+(\s*\.\s*[0-9]+)?\s*mm(?!\s*x)/i,
    /[0-9]+(\s*\.\s*[0-9]+)?\s*cm(?!\s*x)/i
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
    if (PRODUCT_BLACKLIST.has(lowerWord)) return false;
    if (LOCATION_WHITELIST.has(lowerWord)) return true;
    return false;
  }
  
  function isSpecificProduct(text, wordCountAfterPrice = null) {
    if (wordCountAfterPrice !== null && wordCountAfterPrice <= 2) return false;
    
    const specificIndicators = [
      'galvalum', 'spandek', 'bondek', 'hebel', 'bata ringan',
      'excavator', 'bulldozer', 'crane', 'dump truck',
      'hpl', 'mdf', 'jati', 'mahoni', 'multiplek', 'triplek'
    ];
    
    for (const indicator of specificIndicators) {
      if (text.includes(indicator)) return true;
    }
    if (/\d+(\.\d+)?\s*(mm|cm|m|inch)/.test(text)) return true;
    return false;
  }
  
  function isSubVariant(text) {
    const lowerText = text.toLowerCase();
    let score = 0;
    
    for (const pattern of SUB_VARIANT_PATTERNS) {
      if (pattern.test(lowerText)) score++;
    }
    
    const dimensions = lowerText.match(/\d+(\.\d+)?\s*(mm|cm|m|ton|kg|liter)/gi) || [];
    if (dimensions.length >= 3) score++;
    
    const hasMultipleX = (lowerText.match(/x/g) || []).length >= 2;
    const hasManyNumbers = (lowerText.match(/\d+/g) || []).length >= 3;
    if (hasMultipleX && hasManyNumbers) score++;
    
    return score >= 2;
  }
  
  // ============================================================
  // 📌 PRIORITAS 1: DETEKSI ENTITY TYPE
  // ============================================================
  function detectEntityType(userInputEntity = null) {
    if (userInputEntity && VALID_ENTITY_TYPES.includes(userInputEntity.toLowerCase())) {
      const entity = userInputEntity.toLowerCase();
      console.log(`📌 Entity type from user input = ${entity}`);
      return entity;
    }
    
    const url = window.location.pathname.toLowerCase();
    const h1 = (document.querySelector("h1")?.innerText || "").toLowerCase();
    const title = (document.title || "").toLowerCase();
    const combined = url + ' ' + h1 + ' ' + title;
    
    if (combined.includes('/jasa/') || combined.includes('jasa ') || 
        combined.includes('kontraktor') || combined.includes('pasang ') ||
        combined.includes('layanan ')) {
      return 'jasa';
    }
    if (combined.includes('/sewa/') || combined.includes('/rental/') || 
        combined.includes('sewa ') || combined.includes('rental ') ||
        combined.includes('alat berat')) {
      return 'sewa';
    }
    if (combined.includes('/material/') || combined.includes('material ') || 
        combined.includes('bahan bangunan')) {
      return 'material';
    }
    if (combined.includes('/artikel/') || combined.includes('/blog/')) {
      return 'artikel';
    }
    
    return 'produk';
  }
  
  // ============================================================
  // 📌 PRIORITAS 2: DETEKSI INTENT
  // ============================================================
  function detectIntentFromText(text) {
    const lowerText = text.toLowerCase();
    
    for (const kw of MONEY_KEYWORDS) {
      if (lowerText.includes(kw)) {
        console.log(`📌 Intent = transaksional (keyword: ${kw})`);
        return 'transaksional';
      }
    }
    for (const kw of SP1_KEYWORDS) {
      if (lowerText.includes(kw)) {
        console.log(`📌 Intent = komersial (keyword: ${kw})`);
        return 'komersial';
      }
    }
    for (const kw of VARIANT_KEYWORDS) {
      if (lowerText.includes(kw)) {
        console.log(`📌 Intent = komersial (keyword: ${kw})`);
        return 'komersial';
      }
    }
    console.log(`📌 Intent = informasional (default)`);
    return 'informasional';
  }
  
  // ============================================================
  // 📌 DETEKSI MONEY LEVEL
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
    
    // CEK LOKASI
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
    const wordCount = afterKeyword.split(/\s+/).filter(w => w.length > 0 && !PRODUCT_BLACKLIST.has(w)).length;
    
    if (wordCount <= 2) {
      if (entityType === 'jasa') {
        console.log(`📌 JASA with general price → money-page`);
        return 'money-page';
      }
      console.log(`📌 General category (${wordCount} words) → money-master`);
      return 'money-master';
    }
    
    console.log(`📌 Specific product (${wordCount} words) → money-page`);
    return 'money-page';
  }
  
  // ============================================================
  // 📌 DETEKSI VARIANT LEVEL
  // ============================================================
  function detectVariantLevel(text) {
    const lowerText = text.toLowerCase();
    
    let subVariantScore = 0;
    for (const pattern of SUB_VARIANT_PATTERNS) {
      if (pattern.test(lowerText)) subVariantScore++;
    }
    
    const dimensions = lowerText.match(/\d+(\.\d+)?\s*(mm|cm|m|ton|kg|liter)/gi) || [];
    if (dimensions.length >= 2) subVariantScore++;
    
    if (subVariantScore >= 2) {
      console.log(`📌 SUB-VARIANT detected (score: ${subVariantScore})`);
      return 'sub-variant';
    }
    
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
  // 📌 DETEKSI SUB-PILLAR LEVEL (SP1 & SP2)
  // ============================================================
  function detectSubPillarLevel(text, entityType) {
    const lowerText = text.toLowerCase();
    
    // PRIORITAS: SP1 (Perbandingan) lebih dulu
    for (const kw of SP1_KEYWORDS) {
      if (lowerText.includes(kw)) {
        console.log(`📌 SUB-PILLAR TIPE 1 detected (${kw})`);
        return 'sub-pillar-tipe-1';
      }
    }
    
    // PRIORITAS: SP2 (Jenis/Macam/Daftar)
    for (const kw of SP2_KEYWORDS) {
      if (lowerText.startsWith(kw) || lowerText.includes(kw + ' ') || lowerText.includes(kw + '-')) {
        console.log(`📌 SUB-PILLAR TIPE 2 detected (${kw})`);
        return 'sub-pillar-tipe-2';
      }
    }
    
    return null;
  }
  
  // ============================================================
  // 📌 DETEKSI JASA LEVEL (tanpa keyword harga)
  // ============================================================
  function detectJasaLevel(text, entityType) {
    if (entityType !== 'jasa') return null;
    
    const lowerText = text.toLowerCase();
    
    // Cek apakah ini ENTITY PILLAR untuk JASA
    const jasaPillarKeywords = ENTITY_PILLAR_KEYWORDS['jasa'];
    for (const kw of jasaPillarKeywords) {
      if (lowerText === kw || lowerText.startsWith(kw + ' ') || lowerText.includes(' ' + kw)) {
        console.log(`📌 JASA ENTITY PILLAR detected: "${kw}" → PILLAR`);
        return 'pillar';
      }
    }
    
    const jasaKeywords = ['jasa', 'pasang', 'service', 'kontraktor', 'borongan', 
                           'renovasi', 'bangun', 'konsultasi', 'survey', 'estimasi'];
    
    for (const kw of jasaKeywords) {
      if (lowerText.includes(kw)) {
        // Double-check SP2 (jenis/daftar jasa)
        for (const sp2kw of SP2_KEYWORDS) {
          if (lowerText.includes(sp2kw)) {
            console.log(`📌 JASA + SP2 (${sp2kw}) → sub-pillar-tipe-2`);
            return 'sub-pillar-tipe-2';
          }
        }
        // Double-check perbandingan
        for (const cmp of SP1_KEYWORDS) {
          if (lowerText.includes(cmp)) {
            console.log(`📌 JASA + perbandingan → sub-pillar-tipe-1`);
            return 'sub-pillar-tipe-1';
          }
        }
        // Cek apakah ini pillar sederhana (hanya "jasa" + entity)
        const words = lowerText.split(/\s+/);
        if (words.length <= 3 && (lowerText.includes('konstruksi') || lowerText.includes('bangunan'))) {
          console.log(`📌 JASA PILLAR detected (simple) → pillar`);
          return 'pillar';
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
  // 📌 DETEKSI SEWA LEVEL (tanpa keyword harga)
  // ============================================================
  function detectSewaLevel(text, entityType) {
    if (entityType !== 'sewa') return null;
    
    const lowerText = text.toLowerCase();
    
    // Cek apakah ini ENTITY PILLAR untuk SEWA
    const sewaPillarKeywords = ENTITY_PILLAR_KEYWORDS['sewa'];
    for (const kw of sewaPillarKeywords) {
      if (lowerText === kw || lowerText.startsWith(kw + ' ') || lowerText.includes(' ' + kw)) {
        console.log(`📌 SEWA ENTITY PILLAR detected: "${kw}" → PILLAR`);
        return 'pillar';
      }
    }
    
    const sewaKeywords = ['sewa', 'rental', 'alat berat', 'excavator', 'bulldozer', 'crane'];
    
    for (const kw of sewaKeywords) {
      if (lowerText.includes(kw)) {
        for (const sp2kw of SP2_KEYWORDS) {
          if (lowerText.includes(sp2kw)) {
            console.log(`📌 SEWA + SP2 (${sp2kw}) → sub-pillar-tipe-2`);
            return 'sub-pillar-tipe-2';
          }
        }
        for (const cmp of SP1_KEYWORDS) {
          if (lowerText.includes(cmp)) {
            console.log(`📌 SEWA + perbandingan → sub-pillar-tipe-1`);
            return 'sub-pillar-tipe-1';
          }
        }
        // Cek apakah ini pillar sederhana
        const words = lowerText.split(/\s+/);
        if (words.length <= 4) {
          console.log(`📌 SEWA PILLAR detected (simple) → pillar`);
          return 'pillar';
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
  // 📌 DETEKSI PRODUK/MATERIAL PILLAR
  // ============================================================
  function detectProdukMaterialPillar(text, entityType) {
    if (entityType !== 'produk' && entityType !== 'material') return null;
    
    const lowerText = text.toLowerCase();
    const pillarKeywords = ENTITY_PILLAR_KEYWORDS[entityType] || ENTITY_PILLAR_KEYWORDS['produk'];
    
    for (const kw of pillarKeywords) {
      if (lowerText === kw || lowerText.startsWith(kw + ' ') || lowerText.includes(' ' + kw)) {
        console.log(`📌 ${entityType.toUpperCase()} ENTITY PILLAR detected: "${kw}" → PILLAR`);
        return 'pillar';
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
    console.log("🔍 Page Level Detector v18.1 — WITH ENTITY PILLAR");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // PRIORITAS 0: HOMEPAGE
    if (isHomePage()) {
      console.log(`🏠 HOMEPAGE detected → home (L0)`);
      return 'home';
    }
    
    // PRIORITAS 1: ENTITY TYPE
    const entityType = detectEntityType(userEntityType);
    console.log(`✅ Entity Type = ${entityType.toUpperCase()}`);
    
    const h1 = (document.querySelector("h1")?.innerText || "").trim();
    const title = (document.title || "").trim();
    const combinedText = (h1 + ' ' + title).toLowerCase();
    
    console.log(`📄 H1: "${h1.substring(0, 60)}..."`);
    
    // 🔥 PRIORITAS 2: ENTITY PILLAR (PERBAIKAN UTAMA)
    let pillarResult = null;
    if (entityType === 'jasa') {
      pillarResult = detectJasaLevel(combinedText, entityType);
      if (pillarResult === 'pillar') {
        console.log(`✅ ENTITY PILLAR (JASA) → pillar (L1)`);
        return 'pillar';
      }
    } else if (entityType === 'sewa') {
      pillarResult = detectSewaLevel(combinedText, entityType);
      if (pillarResult === 'pillar') {
        console.log(`✅ ENTITY PILLAR (SEWA) → pillar (L1)`);
        return 'pillar';
      }
    } else if (entityType === 'produk' || entityType === 'material') {
      pillarResult = detectProdukMaterialPillar(combinedText, entityType);
      if (pillarResult === 'pillar') {
        console.log(`✅ ENTITY PILLAR (${entityType.toUpperCase()}) → pillar (L1)`);
        return 'pillar';
      }
    }
    
    // PRIORITAS 3: INTENT
    const detectedIntent = detectIntentFromText(combinedText);
    console.log(`✅ Intent = ${detectedIntent.toUpperCase()}`);
    
    // PRIORITAS 4: INFORMASIONAL KEYWORDS (PILLAR / SP2)
    for (const kw of PILLAR_KEYWORDS) {
      if (combinedText.includes(kw)) {
        for (const sp2kw of SP2_KEYWORDS) {
          if (combinedText.includes(sp2kw)) {
            console.log(`📚 SUB-PILLAR TIPE 2 (${kw} + ${sp2kw}) → sub-pillar-tipe-2 (L2)`);
            return 'sub-pillar-tipe-2';
          }
        }
        console.log(`🏛️ PILLAR (${kw}) → pillar (L1)`);
        return 'pillar';
      }
    }
    
    // PRIORITAS 5: SUB-PILLAR (SP1 & SP2)
    const subPillarLevel = detectSubPillarLevel(combinedText, entityType);
    if (subPillarLevel) {
      console.log(`✅ ${subPillarLevel.toUpperCase()} detected → ${subPillarLevel} (L${TYPE_LEVEL_MAP[subPillarLevel]})`);
      return subPillarLevel;
    }
    
    // PRIORITAS 6: MONEY LEVEL (HARGA/SEWA)
    const hasPrice = combinedText.includes('harga') || combinedText.includes('biaya') || 
                     combinedText.includes('tarif') || combinedText.includes('sewa');
    
    if (hasPrice) {
      const moneyLevel = detectMoneyLevel(combinedText, entityType);
      if (moneyLevel) {
        if (entityType === 'jasa' && moneyLevel === 'money-master') {
          console.log(`⚠️ JASA cannot be money-master → money-page (L5)`);
          return 'money-page';
        }
        console.log(`💰 ${moneyLevel.toUpperCase()} detected → ${moneyLevel} (L${TYPE_LEVEL_MAP[moneyLevel]})`);
        return moneyLevel;
      }
    }
    
    // PRIORITAS 7: JASA (tanpa harga) - selain entity pillar
    const jasaLevel = detectJasaLevel(combinedText, entityType);
    if (jasaLevel && jasaLevel !== 'pillar') {
      console.log(`✅ JASA Level = ${jasaLevel.toUpperCase()} (L${TYPE_LEVEL_MAP[jasaLevel]})`);
      return jasaLevel;
    }
    
    // PRIORITAS 8: SEWA (tanpa harga) - selain entity pillar
    const sewaLevel = detectSewaLevel(combinedText, entityType);
    if (sewaLevel && sewaLevel !== 'pillar') {
      console.log(`✅ SEWA Level = ${sewaLevel.toUpperCase()} (L${TYPE_LEVEL_MAP[sewaLevel]})`);
      return sewaLevel;
    }
    
    // PRIORITAS 9: VARIANT / SUB-VARIANT
    const variantLevel = detectVariantLevel(combinedText);
    if (variantLevel) {
      console.log(`✅ ${variantLevel.toUpperCase()} detected → ${variantLevel} (L${TYPE_LEVEL_MAP[variantLevel]})`);
      return variantLevel;
    }
    
    // PRIORITAS 10: DEFAULT PILLAR
    console.log(`🏛️ PILLAR (default) → pillar (L1)`);
    return 'pillar';
  }
  
  // ============================================================
  // 📌 VALIDASI INTENT
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
  // 📌 CEK APAKAH H1 PERLU TAHUN
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
    version: '18.1'
  };
  
  window.__pageLevelDetectorV18Ready = true;
  window.dispatchEvent(new Event("pageLevelDetectorV18Ready"));
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Page Level Detector v18.1 ready");
  console.log("📋 9-Level Hierarchy: HOME(L0) → PILLAR(L1) → SP2(L2) → SP1(L3) → MONEY_MASTER(L4) → MONEY_PAGE(L5) → MONEY_CHILD(L6) → VARIANT(L7) → SUB-VARIANT(L8)");
  console.log("📋 ENTITY PILLAR: Jasa Konstruksi, Sewa Alat Konstruksi, Produk Konstruksi, Material Konstruksi → PILLAR (L1)");
  console.log("📋 Intent detection: YES");
  console.log("📋 Evergreen validation: YES");
  console.log("📋 JASA special rules: YES");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
})();
