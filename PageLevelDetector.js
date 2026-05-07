/* ============================================================
 🧠 Page Level Detector v16.0 — COMPLETE 8-LEVEL HIERARCHY
    ✅ Pillar → SP2 → SP1 → MONEY_MASTER → MONEY_PAGE → MONEY_CHILD → Variant → Sub-Variant
    ✅ MONEY_MASTER: hanya "harga [kategori]" (tanpa spesifikasi/lokasi)
    ✅ MONEY_PAGE: "harga [produk spesifik]" (dengan spesifikasi/merk/ukuran)
    ✅ MONEY_CHILD: mengandung lokasi (kota)
    ✅ JASA: TIDAK BOLEH MONEY_MASTER → auto redirect ke MONEY_PAGE
    ✅ SUB-VARIANT: deteksi spesifikasi sangat detail (ukuran lengkap)
============================================================ */

(function() {
  if (window.pageLevelDetectorV16) return;
  
  // ============================================================
  // 📌 HIERARKI VALID (8 LEVEL)
  // ============================================================
  const VALID_LEVELS = [
    'pillar',                // Level 1 - terluas
    'sub-pillar-tipe-2',     // Level 2
    'sub-pillar-tipe-1',     // Level 3
    'money-master',          // Level 4 - khusus produk/material/sewa (JASA DILARANG)
    'money-page',            // Level 5
    'money-child',           // Level 6
    'variant',               // Level 7
    'sub-variant'            // Level 8 - terdalam
  ];
  
  // ============================================================
  // 📌 ENTITY TYPE VALID
  // ============================================================
  const VALID_ENTITY_TYPES = ['produk', 'jasa', 'sewa', 'material', 'artikel'];
  
  // ============================================================
  // 📌 WHITELIST KOTA/KABUPATEN INDONESIA (200+)
  // ============================================================
  const LOCATION_WHITELIST = [
    'jakarta', 'bogor', 'depok', 'tangerang', 'bekasi', 'jabodetabek',
    'jakpus', 'jakbar', 'jaksel', 'jakut', 'jaktim',
    'tangerang selatan', 'tangsel', 'bintaro', 'alam sutera', 'gading serpong',
    'bandung', 'cimahi', 'cirebon', 'tasikmalaya', 'sukabumi', 'garut', 
    'sumedang', 'purwakarta', 'karawang', 'subang', 'indramayu',
    'semarang', 'solo', 'surakarta', 'yogyakarta', 'jogja', 'magelang', 
    'salatiga', 'pekalongan', 'tegal', 'brebes', 'cilacap', 'purwokerto', 
    'surabaya', 'malang', 'kediri', 'blitar', 'madiun', 'gresik', 'sidoarjo',
    'medan', 'binjai', 'deli serdang', 'padang', 'pekanbaru', 'batam',
    'palembang', 'bandar lampung', 'pontianak', 'balikpapan', 'samarinda',
    'banjarmasin', 'makassar', 'manado', 'palu', 'denpasar', 'bali', 'mataram',
    'kupang', 'ambon', 'jayapura', 'sorong'
  ];
  
  // Blacklist kata yang mirip lokasi tapi sebenarnya spesifikasi produk
  const NOT_LOCATION_WORDS = [
    'mini', 'maxi', 'super', 'extra', 'plus', 'pro', 'max', 'ultra', 'deluxe',
    'baru', 'lama', 'bekas', 'second', 'original', 'kw', 'grade', 
    'murah', 'mahal', 'hemat', 'premium', 'standar', 'ekonomis', 
    'kecil', 'besar', 'sedang', 'panjang', 'pendek', 'tebal', 'tipis', 'lebar',
    'putih', 'hitam', 'merah', 'biru', 'hijau', 'kuning', 'ungu', 'abu', 'coklat',
    'minimalis', 'modern', 'klasik', 'industrial', 'skandinavia', 'jepang',
    'hpl', 'mdf', 'jati', 'kayu', 'besi', 'baja', 'aluminium', 'kaca',
    '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0', '1.2', '1.5', '2.0'
  ];
  
  // ============================================================
  // 📌 POLA URL UNTUK MASING-MASING PAGE LEVEL
  // ============================================================
  const URL_PATTERNS = {
    'pillar': [
      '/panduan/', '/guide/', '/edukasi/', '/apa-itu/', '/cara-memilih/',
      '/tips-', '/tutorial/', '/belajar/', '/materi/'
    ],
    'sub-pillar-tipe-2': [
      '/jenis/', '/macam/', '/tipe/', '/kategori/', '/varian/',
      '/daftar-', '/list-', '/koleksi/'
    ],
    'sub-pillar-tipe-1': [
      '/perbandingan/', '/vs/', '/bandingkan/', '/mana-yang-lebih-baik/',
      '/perbedaan/', '/beda/', '/pilih-', '/rekomendasi-'
    ],
    'money-master': [
      '/harga-', '/harga/', '/price/', '/biaya-', '/biaya/', '/tarif-', '/estimasi-harga-'
    ],
    'money-page': [
      '/beli-', '/jual-', '/pesan-', '/order-', '/produk/'
    ],
    'money-child': [
      '/jakarta/', '/bandung/', '/surabaya/', '/medan/', '/makassar/'
    ],
    'variant': [
      '/spesifikasi/', '/detail-', '/ukuran-', '/tipe-', '/merk-', '/warna-'
    ],
    'sub-variant': [
      '/spesifikasi-lengkap/', '/detail-teknis/', '/ukuran-panjang/'
    ]
  };
  
  // ============================================================
  // 📌 FUNGSI CEK APAKAH SUATU KATA ADALAH LOKASI
  // ============================================================
  function isLocation(word) {
    const lowerWord = word.toLowerCase();
    if (LOCATION_WHITELIST.includes(lowerWord)) return true;
    if (NOT_LOCATION_WORDS.includes(lowerWord)) return false;
    if (lowerWord.length >= 5 && lowerWord.length <= 12) {
      const vowelCount = (lowerWord.match(/[aiueo]/g) || []).length;
      if (vowelCount >= 2 && !lowerWord.match(/[0-9]/)) return true;
    }
    return false;
  }
  
  // ============================================================
  // 📌 FUNGSI CEK APAKAH PRODUK SPESIFIK (BUKAN KATEGORI UMUM)
  // ============================================================
  function isSpecificProduct(text) {
    const specificIndicators = [
      // Merk/brand
      'hpl', 'mdf', 'jati', 'mahoni', 'kamar', 'minimalis', 'modern', 'klasik',
      // Ukuran/dimensi
      /0\.[0-9]/, /[0-9]mm/, /[0-9]x[0-9]/, /[0-9]cm/, /[0-9]meter/,
      // Tipe spesifik
      'galvalum', 'spandek', 'bondek', 'genteng metal', 'bata ringan', 'hebel',
      'excavator', 'bulldozer', 'crane', 'dump truck', 'vibro', 'stamper'
    ];
    
    for (const indicator of specificIndicators) {
      if (typeof indicator === 'string' && text.includes(indicator)) return true;
      if (indicator instanceof RegExp && indicator.test(text)) return true;
    }
    return false;
  }
  
  // ============================================================
  // 📌 FUNGSI DETEKSI ENTITY TYPE (DARI INPUT ATAU HALAMAN)
  // ============================================================
  function detectEntityType(userInputEntity = null) {
    // PRIORITAS 1: User input (dari PHASE 0.0)
    if (userInputEntity && VALID_ENTITY_TYPES.includes(userInputEntity)) {
      console.log(`📌 Entity type from user input: ${userInputEntity}`);
      return userInputEntity;
    }
    
    const url = window.location.pathname.toLowerCase();
    const h1 = (document.querySelector("h1")?.innerText || "").toLowerCase();
    const title = (document.title || "").toLowerCase();
    
    // PRIORITAS 2: Deteksi dari URL
    if (url.includes('/jasa/') || url.includes('/layanan/')) return 'jasa';
    if (url.includes('/sewa/') || url.includes('/rental/')) return 'sewa';
    if (url.includes('/material/') || url.includes('/bahan/')) return 'material';
    if (url.includes('/produk/') || url.includes('/barang/')) return 'produk';
    
    // PRIORITAS 3: Deteksi dari H1
    if (h1.includes('jasa') || h1.includes('kontraktor')) return 'jasa';
    if (h1.includes('sewa') || h1.includes('rental')) return 'sewa';
    if (h1.includes('material') || h1.includes('bahan bangunan')) return 'material';
    
    return 'produk'; // default
  }
  
  // ============================================================
  // 📌 FUNGSI DETEKSI MONEY LEVEL (CORE LOGIC YANG DIPERBAIKI)
  // ============================================================
  function detectMoneyLevel(text, entityType) {
    const lowerText = text.toLowerCase();
    
    // 🔥 RULE 1: Harus mengandung keyword harga/biaya/sewa
    const hasPrice = lowerText.includes('harga') || lowerText.includes('biaya') || lowerText.includes('sewa');
    if (!hasPrice) return null;
    
    // 🔥 RULE 2: Ekstrak teks setelah kata "harga"
    let afterPrice = '';
    if (lowerText.includes('harga')) {
      afterPrice = lowerText.substring(lowerText.indexOf('harga') + 5).trim();
    } else if (lowerText.includes('biaya')) {
      afterPrice = lowerText.substring(lowerText.indexOf('biaya') + 5).trim();
    } else if (lowerText.includes('sewa')) {
      afterPrice = lowerText.substring(lowerText.indexOf('sewa') + 4).trim();
    }
    
    // Ambil maksimal 60 karakter untuk analisis
    afterPrice = afterPrice.slice(0, 60);
    
    // 🔥 RULE 3: CEK LOKASI (MONEY_CHILD)
    const words = afterPrice.split(/[\s,-]+/);
    for (const word of words) {
      if (word.length > 3 && isLocation(word)) {
        console.log(`📌 Location detected: ${word} → money-child`);
        return 'money-child';
      }
    }
    
    // 🔥 RULE 4: CEK SPESIFIKASI PRODUK (MONEY_PAGE)
    if (isSpecificProduct(afterPrice)) {
      console.log(`📌 Specific product detected → money-page`);
      return 'money-page';
    }
    
    // 🔥 RULE 5: CEK JUMLAH KATA setelah "harga"
    const wordCount = afterPrice.split(/\s+/).filter(w => w.length > 0).length;
    
    // Jika 1-2 kata ("harga atap", "harga baja ringan") → MONEY_MASTER
    if (wordCount <= 2) {
      // 🔥 KHUSUS: JASA TIDAK BOLEH MONEY_MASTER
      if (entityType === 'jasa') {
        console.log(`📌 Jasa with general price → forced to money-page (not master)`);
        return 'money-page';
      }
      console.log(`📌 General category (${wordCount} words) → money-master`);
      return 'money-master';
    }
    
    // Jika 3+ kata ("harga atap baja ringan galvalum") → MONEY_PAGE
    console.log(`📌 Specific product (${wordCount} words) → money-page`);
    return 'money-page';
  }
  
  // ============================================================
  // 📌 FUNGSI DETEKSI DARI URL
  // ============================================================
  function detectFromURL(url, entityType) {
    const urlLower = url.toLowerCase();
    
    // Cek pattern dari tabel
    for (const [level, patterns] of Object.entries(URL_PATTERNS)) {
      for (const pattern of patterns) {
        if (urlLower.includes(pattern)) {
          // Validasi khusus: JASA tidak boleh MONEY_MASTER
          if (level === 'money-master' && entityType === 'jasa') {
            console.log(`⚠️ JASA cannot be money-master, redirecting to money-page`);
            return 'money-page';
          }
          return level;
        }
      }
    }
    
    return null;
  }
  
  // ============================================================
  // 📌 FUNGSI DETEKSI DARI KONTEN (H1 + TITLE)
  // ============================================================
  function detectFromContent(entityType) {
    const h1 = (document.querySelector("h1")?.innerText || "").toLowerCase();
    const title = (document.title || "").toLowerCase();
    const combinedText = h1 + ' ' + title;
    
    // 🔥 PRIORITAS 1: Deteksi SUB-VARIANT (spesifikasi SANGAT detail)
    // Contoh: "Atap Baja Ringan Galvalum 0.3mm x 1m x 6m"
    const veryDetailPatterns = [
      /[0-9]+(\s*mm|\s*cm|\s*m|\s*inch)/i,  // ada ukuran
      /[0-9]+(\s*x\s*)[0-9]+(\s*mm|\s*cm|\s*m)/i,  // ukuran panjang x lebar
      /tebal\s+[0-9]+(\s*mm)/i,
      /ukuran\s+panjang\s+[0-9]+/i
    ];
    
    let detailScore = 0;
    for (const pattern of veryDetailPatterns) {
      if (pattern.test(combinedText)) detailScore++;
    }
    
    if (detailScore >= 2 || (combinedText.includes('x') && combinedText.includes('mm'))) {
      console.log(`📌 Very detailed specification detected → sub-variant`);
      return 'sub-variant';
    }
    
    // 🔥 PRIORITAS 2: Deteksi VARIANT
    if (combinedText.includes('spesifikasi') || 
        combinedText.includes('ukuran') || 
        combinedText.includes('tipe') ||
        combinedText.includes('merk') ||
        combinedText.includes('warna') ||
        combinedText.includes('kapasitas')) {
      return 'variant';
    }
    
    // 🔥 PRIORITAS 3: Deteksi MONEY LEVEL
    const moneyLevel = detectMoneyLevel(combinedText, entityType);
    if (moneyLevel) return moneyLevel;
    
    // 🔥 PRIORITAS 4: Deteksi SUB-PILLAR TIPE 2
    if (combinedText.includes('jenis') || 
        combinedText.includes('macam') || 
        combinedText.includes('tipe ') ||
        combinedText.includes('kategori')) {
      return 'sub-pillar-tipe-2';
    }
    
    // 🔥 PRIORITAS 5: Deteksi SUB-PILLAR TIPE 1
    if (combinedText.includes(' vs ') || 
        combinedText.includes('perbandingan') || 
        combinedText.includes('lebih baik') ||
        combinedText.includes('mana yang')) {
      return 'sub-pillar-tipe-1';
    }
    
    return 'pillar';
  }
  
  // ============================================================
  // 📌 FUNGSI DETEKSI UTAMA (DENGAN USER INPUT)
  // ============================================================
  function detectPageLevel(userOptions = {}) {
    const { userEntityType = null, userKeyword = null, userLocation = null } = userOptions;
    
    console.log("🔍 Page Level Detector v16.0 — Complete 8-Level Hierarchy");
    console.log(`📥 User input: entity=${userEntityType}, keyword=${userKeyword}, location=${userLocation}`);
    
    // STEP 1: Tentukan Entity Type (dari user input atau auto-detect)
    const entityType = detectEntityType(userEntityType);
    console.log(`📌 Entity Type: ${entityType}`);
    
    // STEP 2: Override dari manual
    if (window.__manualPageLevel && VALID_LEVELS.includes(window.__manualPageLevel)) {
      // Validasi JASA + MONEY_MASTER
      if (entityType === 'jasa' && window.__manualPageLevel === 'money-master') {
        console.error(`❌ JASA cannot use money-master! Override rejected.`);
        const fallback = 'money-page';
        console.log(`📌 Fallback to: ${fallback}`);
        return fallback;
      }
      console.log(`📌 Manual override: ${window.__manualPageLevel}`);
      return window.__manualPageLevel;
    }
    
    // STEP 3: Deteksi dari URL
    const url = window.location.pathname;
    const urlLevel = detectFromURL(url, entityType);
    if (urlLevel) {
      console.log(`📌 Detected from URL: ${urlLevel}`);
      return urlLevel;
    }
    
    // STEP 4: Deteksi dari konten (H1 + Title)
    const contentLevel = detectFromContent(entityType);
    console.log(`📌 Detected from content: ${contentLevel}`);
    
    // STEP 5: Validasi final untuk JASA
    if (entityType === 'jasa' && contentLevel === 'money-master') {
      console.log(`⚠️ JASA detected as money-master → correcting to money-page`);
      return 'money-page';
    }
    
    return contentLevel;
  }
  
  // ============================================================
  // 📌 FUNGSI SET MANUAL PAGE LEVEL
  // ============================================================
  function setManualPageLevel(level, entityType = null) {
    const currentEntityType = entityType || detectEntityType();
    
    if (!VALID_LEVELS.includes(level)) {
      console.error(`❌ Invalid page level: ${level}. Valid: ${VALID_LEVELS.join(', ')}`);
      return false;
    }
    
    if (currentEntityType === 'jasa' && level === 'money-master') {
      console.error(`❌ JASA cannot use money-master!`);
      return false;
    }
    
    window.__manualPageLevel = level;
    document.body.setAttribute('data-page-level', level);
    console.log(`✅ Manual page level set to: ${level}`);
    return true;
  }
  
  // ============================================================
  // 📌 FUNGSI UPDATE BODY ATTRIBUTES
  // ============================================================
  function updateBodyAttributes(userOptions = {}) {
    const level = detectPageLevel(userOptions);
    const entityType = detectEntityType(userOptions.userEntityType);
    
    document.body.setAttribute('data-page-level', level);
    document.body.setAttribute('data-entity-type', entityType);
    
    console.log(`✅ Body attributes: page-level=${level}, entity-type=${entityType}`);
    return { pageLevel: level, entityType: entityType };
  }
  
  // ============================================================
  // 📌 EXPOSE FUNGSI
  // ============================================================
  window.pageLevelDetectorV16 = {
    detect: detectPageLevel,
    setManual: setManualPageLevel,
    detectEntityType: detectEntityType,
    updateAttributes: updateBodyAttributes,
    isValidLevel: (level) => VALID_LEVELS.includes(level),
    isValidEntityType: (type) => VALID_ENTITY_TYPES.includes(type),
    getLocationWhitelist: () => [...LOCATION_WHITELIST],
    VALID_LEVELS: VALID_LEVELS,
    VALID_ENTITY_TYPES: VALID_ENTITY_TYPES,
    version: '16.0'
  };
  
  window.__pageLevelDetectorV16Ready = true;
  window.dispatchEvent(new Event("pageLevelDetectorV16Ready"));
  
  console.log("✅ Page Level Detector v16.0 ready");
  console.log("📋 Complete 8-Level Hierarchy:", VALID_LEVELS.join(' → '));
  
})();
