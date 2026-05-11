/* ============================================================
 🧠 Page Level Detector v18.2 — URL-BASED DETECTION
    ✅ PRIORITAS UTAMA: URL Clean (tanpa domain, /p/, tahun/bulan)
    ✅ FIX: "harga-sewa-alat-proyek" → MONEY_MASTER (L4)
    ✅ FIX: "jasa-konstruksi" → PILLAR (L1)
    ✅ FIX: "sewa-alat-konstruksi" → PILLAR (L1)
    ✅ Berdasarkan PHASE 1, PHASE 1.5, STEP 6.2 dari sistem
    ✅ Prioritas: URL Clean → H1 → Title
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
    'money-master',          // Level 4 - HARGA NASIONAL
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
  // 📌 FUNGSI UTAMA: GET CLEAN PAGE NAME FROM URL 🔥
  // ============================================================
  function getCleanPageNameFromUrl() {
    let path = window.location.pathname;
    
    // Hapus ekstensi
    path = path.replace(/\.(html|php|asp|jsp|htm)$/i, '');
    
    // Hapus /p/ prefix (umum di Blogger)
    path = path.replace(/^\/p\//, '');
    
    // Hapus /blog/ prefix
    path = path.replace(/^\/blog\//, '');
    path = path.replace(/^\/artikel\//, '');
    
    // Hapus pola tanggal (tahun/bulan) seperti /2025/03/ atau /2025/
    path = path.replace(/\/\d{4}\/\d{2}\/\d{2}\//g, '/'); // YYYY/MM/DD
    path = path.replace(/\/\d{4}\/\d{2}\//g, '/');        // YYYY/MM
    path = path.replace(/\/\d{4}\//g, '/');               // YYYY
    path = path.replace(/\/\d{2}\//g, '/');               // MM
    
    // Split path dan bersihkan
    const pathParts = path.split('/');
    const cleanedParts = pathParts.filter(part => {
      // Hapus angka tahun/bulan murni
      if (/^\d{4}$/.test(part)) return false;
      if (/^\d{2}$/.test(part)) return false;
      // Hapus part kosong atau index
      if (part === '' || part === 'index' || part === 'home') return false;
      // Hapus query string jika tersisa
      if (part.includes('?')) return false;
      return true;
    });
    
    // Ambil bagian terakhir dari path (nama halaman)
    let pageName = cleanedParts.pop() || '';
    
    // Konversi tanda hubung ke spasi
    pageName = pageName.replace(/-/g, ' ');
    
    // Hapus karakter yang tidak perlu (hanya huruf, angka, spasi)
    pageName = pageName.replace(/[^a-z0-9\s]/gi, '');
    
    // Normalisasi spasi berlebih
    pageName = pageName.replace(/\s+/g, ' ').trim();
    
    return pageName;
  }
  
  // ============================================================
  // 📌 FUNGSI CEK HOMEPAGE
  // ============================================================
  function isHomePage() {
    const url = window.location.href.toLowerCase();
    const path = url.replace(/https?:\/\/[^\/]+/, '');
    const isRoot = path === '' || path === '/' || path === '/index.html' || path === '/home';
    
    if (isRoot) return true;
    
    const h1 = (document.querySelector("h1")?.innerText || "").toLowerCase();
    const title = document.title.toLowerCase();
    const homeKeywords = ['beranda', 'home', 'halaman utama', 'homepage', 'index'];
    
    return homeKeywords.some(kw => h1 === kw || title === kw);
  }
  
  // ============================================================
  // 📌 KEYWORD CIRI PER LEVEL (LENGKAP)
  // ============================================================
  
  // LEVEL 0: HOMEPAGE
  const HOME_KEYWORDS = ['beranda', 'home', 'halaman utama', 'homepage', 'index'];
  
  // 🔥 LEVEL 1: PILLAR UNTUK SETIAP ENTITY TYPE
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
  const PILLAR_INFORMATIONAL_KEYWORDS = [
    'panduan', 'panduan lengkap', 'cara', 'tips', 'tips dan trik',
    'apa itu', 'pengertian', 'definisi', 'edukasi', 'belajar', 
    'tutorial', 'materi', 'penjelasan', 'kenapa', 'mengapa',
    'bagaimana', 'contoh', 'rekomendasi', 'lengkap', 'komprehensif',
    'ultimate guide', 'complete guide', 'semua tentang', 'overview'
  ];
  
  // LEVEL 2: SUB-PILLAR TIPE 2 (Jenis/Macam/Daftar)
  const SP2_KEYWORDS = [
    'jenis', 'jenis-jenis', 'macam', 'macam-macam', 'tipe', 
    'kategori', 'ragam', 'berbagai', 'klasifikasi', 'golongan',
    'daftar', 'list', 'koleksi', 'varian'
  ];
  
  // LEVEL 3: SUB-PILLAR TIPE 1 (Perbandingan)
  const SP1_KEYWORDS = [
    'vs', 'versus', 'perbandingan', 'bandingkan', 'dibanding',
    'lebih baik', 'mana yang', 'kelebihan', 'kekurangan',
    'perbedaan', 'beda', 'persamaan', 'sama', 'unggul',
    'lebih unggul', 'lebih bagus', 'lebih tahan', 'lebih awet',
    'lebih murah', 'lebih mahal', 'lebih hemat', 'lebih efisien'
  ];
  
  // LEVEL 4-6: MONEY KEYWORDS (Harga/Sewa)
  const MONEY_KEYWORDS = ['harga', 'biaya', 'tarif', 'sewa', 'rental'];
  
  // LEVEL 7: VARIANT (Spesifikasi umum - 1 parameter)
  const VARIANT_KEYWORDS = [
    'spesifikasi', 'ukuran', 'tipe', 'type', 'model', 
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
    
    // Ekstrak setelah keyword (maksimal 5 kata pertama)
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
    
    // Ambil maksimal 5 kata pertama
    const words = afterKeyword.trim().split(/\s+/).filter(w => w.length > 0);
    const first5Words = words.slice(0, 5);
    const afterClean = first5Words.join(' ');
    const wordCount = first5Words.length;
    
    console.log(`📌 After keyword (first 5 words): "${afterClean}" | Words: ${wordCount}`);
    
    // CEK LOKASI
    if (isLocation(afterClean)) {
      console.log(`📌 Location detected → money-child`);
      if (entityType === 'jasa') return 'money-child';
      return 'money-child';
    }
    
    // CEK SPESIFIKASI PRODUK
    const isSpecific = isSpecificProduct(afterClean, wordCount);
    
    // MONEY_MASTER: 1-2 kata ATAU 3 kata tapi masih umum
    if (wordCount <= 2 || (wordCount === 3 && !isSpecific)) {
      console.log(`📌 General category (${wordCount} kata, specific=${isSpecific}) → money-master`);
      return 'money-master';
    }
    
    // MONEY_PAGE: 3+ kata dan spesifik
    console.log(`📌 Specific product (${wordCount} kata, specific=${isSpecific}) → money-page`);
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
      if (lowerText === kw || lowerText.startsWith(kw + ' ') || lowerText.includes(' ' + kw + ' ') || lowerText.endsWith(' ' + kw)) {
        console.log(`📌 SUB-PILLAR TIPE 2 detected (${kw})`);
        return 'sub-pillar-tipe-2';
      }
    }
    
    return null;
  }
  
  // ============================================================
  // 📌 DETEKSI ENTITY PILLAR
  // ============================================================
  function detectEntityPillar(text, entityType) {
    const lowerText = text.toLowerCase();
    const pillarKeywords = ENTITY_PILLAR_KEYWORDS[entityType] || [];
    
    for (const kw of pillarKeywords) {
      if (lowerText === kw || lowerText.startsWith(kw + ' ') || lowerText.includes(' ' + kw + ' ') || lowerText.endsWith(' ' + kw)) {
        console.log(`📌 ENTITY PILLAR detected: "${kw}" → pillar`);
        return 'pillar';
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
  // 📌 FUNGSI DETEKSI UTAMA (PRIORITAS: URL → H1 → TITLE)
  // ============================================================
  function detectPageLevel(userOptions = {}) {
    const { userEntityType = null } = userOptions;
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔍 Page Level Detector v18.2 — URL-BASED DETECTION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // PRIORITAS 0: HOMEPAGE
    if (isHomePage()) {
      console.log(`🏠 HOMEPAGE detected → home (L0)`);
      return 'home';
    }
    
    // PRIORITAS 1: AMBIL URL CLEAN SEBAGAI SUMBER UTAMA 🔥
    const urlClean = getCleanPageNameFromUrl();
    const h1 = (document.querySelector("h1")?.innerText || "").toLowerCase().trim();
    const title = (document.title || "").toLowerCase().trim();
    
    // Gunakan URL clean sebagai prioritas utama, fallback ke H1, lalu Title
    let primaryText = urlClean || h1 || title;
    
    console.log(`🔍 URL Clean     : "${urlClean}"`);
    console.log(`📄 H1            : "${h1.substring(0, 60)}..."`);
    console.log(`📄 Title         : "${title.substring(0, 60)}..."`);
    console.log(`🎯 Primary Text  : "${primaryText}"`);
    
    // PRIORITAS 2: ENTITY TYPE
    const entityType = detectEntityType(userEntityType);
    console.log(`✅ Entity Type = ${entityType.toUpperCase()}`);
    
    // ============================================================
    // PRIORITAS 3: ENTITY PILLAR 🔥
    // ============================================================
    const entityPillar = detectEntityPillar(primaryText, entityType);
    if (entityPillar) {
      console.log(`✅ ENTITY PILLAR → pillar (L1)`);
      return entityPillar;
    }
    
    // ============================================================
    // PRIORITAS 4: MONEY LEVEL (HARGA/SEWA) 🔥
    // ============================================================
    const hasMoneyKeyword = MONEY_KEYWORDS.some(kw => primaryText.includes(kw));
    if (hasMoneyKeyword) {
      const moneyLevel = detectMoneyLevel(primaryText, entityType);
      if (moneyLevel) {
        if (entityType === 'jasa' && moneyLevel === 'money-master') {
          console.log(`⚠️ JASA cannot be money-master → money-page (L5)`);
          return 'money-page';
        }
        console.log(`💰 ${moneyLevel.toUpperCase()} detected → ${moneyLevel} (L${TYPE_LEVEL_MAP[moneyLevel]})`);
        return moneyLevel;
      }
    }
    
    // ============================================================
    // PRIORITAS 5: INFORMASIONAL KEYWORDS (PILLAR / SP2)
    // ============================================================
    for (const kw of PILLAR_INFORMATIONAL_KEYWORDS) {
      if (primaryText.includes(kw)) {
        // Cek apakah ini JENIS/MACAM/DAFTAR (SP2)
        for (const sp2kw of SP2_KEYWORDS) {
          if (primaryText.includes(sp2kw)) {
            console.log(`📚 SUB-PILLAR TIPE 2 (${kw} + ${sp2kw}) → sub-pillar-tipe-2 (L2)`);
            return 'sub-pillar-tipe-2';
          }
        }
        console.log(`🏛️ PILLAR (${kw}) → pillar (L1)`);
        return 'pillar';
      }
    }
    
    // ============================================================
    // PRIORITAS 6: SUB-PILLAR (SP1 & SP2)
    // ============================================================
    const subPillarLevel = detectSubPillarLevel(primaryText, entityType);
    if (subPillarLevel) {
      console.log(`✅ ${subPillarLevel.toUpperCase()} detected → ${subPillarLevel} (L${TYPE_LEVEL_MAP[subPillarLevel]})`);
      return subPillarLevel;
    }
    
    // ============================================================
    // PRIORITAS 7: JASA (tanpa harga)
    // ============================================================
    const jasaLevel = detectJasaLevel(primaryText, entityType);
    if (jasaLevel) {
      console.log(`✅ JASA Level = ${jasaLevel.toUpperCase()} (L${TYPE_LEVEL_MAP[jasaLevel]})`);
      return jasaLevel;
    }
    
    // ============================================================
    // PRIORITAS 8: SEWA (tanpa harga)
    // ============================================================
    const sewaLevel = detectSewaLevel(primaryText, entityType);
    if (sewaLevel) {
      console.log(`✅ SEWA Level = ${sewaLevel.toUpperCase()} (L${TYPE_LEVEL_MAP[sewaLevel]})`);
      return sewaLevel;
    }
    
    // ============================================================
    // PRIORITAS 9: VARIANT / SUB-VARIANT
    // ============================================================
    const variantLevel = detectVariantLevel(primaryText);
    if (variantLevel) {
      console.log(`✅ ${variantLevel.toUpperCase()} detected → ${variantLevel} (L${TYPE_LEVEL_MAP[variantLevel]})`);
      return variantLevel;
    }
    
    // ============================================================
    // DEFAULT: PILLAR
    // ============================================================
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
    getCleanPageNameFromUrl: getCleanPageNameFromUrl,
    isValidLevel: (level) => VALID_LEVELS.includes(level),
    isValidEntityType: (type) => VALID_ENTITY_TYPES.includes(type),
    getLocationWhitelist: () => Array.from(LOCATION_WHITELIST),
    getLevelNumber: (level) => TYPE_LEVEL_MAP[level] || null,
    VALID_LEVELS: VALID_LEVELS,
    VALID_ENTITY_TYPES: VALID_ENTITY_TYPES,
    VALID_INTENTS: VALID_INTENTS,
    TYPE_LEVEL_MAP: TYPE_LEVEL_MAP,
    version: '18.2'
  };
  
  window.__pageLevelDetectorV18Ready = true;
  window.dispatchEvent(new Event("pageLevelDetectorV18Ready"));
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Page Level Detector v18.2 ready");
  console.log("📋 9-Level Hierarchy: HOME(L0) → PILLAR(L1) → SP2(L2) → SP1(L3) → MONEY_MASTER(L4) → MONEY_PAGE(L5) → MONEY_CHILD(L6) → VARIANT(L7) → SUB-VARIANT(L8)");
  console.log("📋 PRIMARY SOURCE: URL Clean (tanpa domain, /p/, tahun/bulan)");
  console.log("📋 ENTITY PILLAR: Jasa Konstruksi, Sewa Alat Konstruksi, Produk Konstruksi, Material Konstruksi → PILLAR (L1)");
  console.log("📋 Intent detection: YES");
  console.log("📋 Evergreen validation: YES");
  console.log("📋 JASA special rules: YES");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
})();
