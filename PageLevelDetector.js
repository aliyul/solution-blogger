/* ============================================================
 🧠 Page Level Detector v17.0 — COMPLETE PHASE SYSTEM
    ✅ Berdasarkan PHASE 1, PHASE 1.5, STEP 6.2 dari sistem
    ✅ Prioritas: ENTITY TYPE → INTENT → HARGA → SPESIFISITAS
    ✅ 8-Level Hierarchy: Pillar → SP2 → SP1 → MONEY_MASTER → MONEY_PAGE → MONEY_CHILD → Variant → Sub-Variant
    ✅ Intent detection (Informasional/Komersial/Transaksional)
    ✅ Evergreen vs Non-Evergreen (tahun wajib/tidak)
    ✅ JASA: TIDAK BOLEH MONEY_MASTER
    ✅ Sub-Variant: deteksi spesifikasi SANGAT detail (3+ parameter)
============================================================ */

(function() {
  if (window.pageLevelDetectorV17) return;
  
  // ============================================================
  // 📌 KONSTANTA VALIDASI
  // ============================================================
  const VALID_LEVELS = [
    'pillar',                // Level 1 - terluas, EVERGREEN
    'sub-pillar-tipe-2',     // Level 2, EVERGREEN
    'sub-pillar-tipe-1',     // Level 3, FLEXIBLE
    'money-master',          // Level 4 - NON-EVERGREEN (khusus produk/material/sewa)
    'money-page',            // Level 5 - NON-EVERGREEN (produk) / FLEXIBLE (jasa)
    'money-child',           // Level 6 - NON-EVERGREEN (produk) / FLEXIBLE (jasa)
    'variant',               // Level 7, EVERGREEN
    'sub-variant'            // Level 8 - terdalam, EVERGREEN
  ];
  
  const VALID_ENTITY_TYPES = ['produk', 'jasa', 'sewa', 'material', 'artikel'];
  
  const VALID_INTENTS = ['informasional', 'komersial', 'transaksional'];
  
  // ============================================================
  // 📌 INTENT MAP PER PAGE LEVEL (WAJIB DARI PHASE 1.5)
  // ============================================================
  const REQUIRED_INTENT = {
    'pillar': { intent: 'informasional', dominance: '90%' },
    'sub-pillar-tipe-2': { intent: 'informasional', dominance: '60%' },
    'sub-pillar-tipe-1': { intent: 'komersial', dominance: '70%' },
    'money-master': { intent: 'transaksional', dominance: '80%' },
    'money-page': { intent: 'transaksional', dominance: '85%' }, // default untuk produk
    'money-child': { intent: 'transaksional', dominance: '90%' }, // default untuk produk
    'variant': { intent: 'komersial', dominance: '80%' },
    'sub-variant': { intent: 'komersial', dominance: '70%' }
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
  // 📌 KEYWORD INTENT DETECTION (PRIORITAS 2 dari PHASE 1)
  // ============================================================
  const INTENT_KEYWORDS = {
    'informasional': [
      'panduan', 'cara', 'tips', 'apa itu', 'pengertian', 'definisi',
      'tutorial', 'belajar', 'materi', 'edukasi', 'penjelasan',
      'kenapa', 'mengapa', 'bagaimana', 'contoh', 'rekomendasi'
    ],
    'komersial': [
      'perbandingan', 'vs', 'bandingkan', 'mana yang lebih baik',
      'terbaik', 'rekomendasi', 'spesifikasi', 'ukuran', 'tipe',
      'merk', 'warna', 'model', 'review', 'ulasan', 'testimoni'
    ],
    'transaksional': [
      'harga', 'biaya', 'tarif', 'beli', 'jual', 'sewa', 'rental',
      'booking', 'pesan', 'order', 'checkout', 'keranjang',
      'promo', 'diskon', 'murah', 'termurah', 'estimasi biaya'
    ]
  };
  
  // ============================================================
  // 📌 WHITELIST LOKASI KABUPATEN/KOTA INDONESIA (150+ core)
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
  
  // SUB-VARIANT: minimal 3 parameter spesifikasi yang sangat detail
  // Contoh: "Galvalum 0.3mm x 1m x 6m", "Bata Ringan 10x20x60cm AAC", "Excavator Mini 1.5 Ton"
  const SUB_VARIANT_PATTERNS = [
    /[0-9]+(\s*\.\s*[0-9]+)?\s*mm\s*x\s*[0-9]+(\s*\.\s*[0-9]+)?\s*(mm|cm|m)/i,  // mm x mm
    /[0-9]+(\s*\.\s*[0-9]+)?\s*cm\s*x\s*[0-9]+(\s*\.\s*[0-9]+)?\s*cm\s*x\s*[0-9]+(\s*\.\s*[0-9]+)?\s*cm/i, // cm x cm x cm
    /tebal\s+[0-9]+(\s*\.\s*[0-9]+)?\s*mm\s+panjang\s+[0-9]+(\s*\.\s*[0-9]+)?\s*m/i,
    /ukuran:\s*[0-9]+(\s*\.\s*[0-9]+)?\s*x\s*[0-9]+(\s*\.\s*[0-9]+)?\s*x\s*[0-9]+(\s*\.\s*[0-9]+)?/i,
    /dimensi\s*[0-9]+(\s*\.\s*[0-9]+)?\s*x\s*[0-9]+(\s*\.\s*[0-9]+)?/i,
    /kapasitas\s*[0-9]+(\s*\.\s*[0-9]+)?\s*(ton|kg|liter)/i,
    /[0-9]+(\s*\.\s*[0-9]+)?\s*ton\s*-\s*[0-9]+(\s*\.\s*[0-9]+)?\s*ton/i
  ];
  
  // VARIANT: 1-2 parameter spesifikasi (masih umum)
  // Contoh: "Galvalum 0.3mm", "Bata Ringan 10cm", "Excavator Mini"
  const VARIANT_PATTERNS = [
    /spesifikasi/i, /ukuran/i, /tipe/i, /merk/i, /warna/i,
    /kapasitas/i, /dimensi/i, /model/i, /seri/i,
    /[0-9]+(\s*\.\s*[0-9]+)?\s*mm(?!\s*x)/i,  // hanya mm, tanpa x
    /[0-9]+(\s*\.\s*[0-9]+)?\s*cm(?!\s*x)/i,
    /mini|maxi|super|pro|max|ultra/i
  ];
  
  // ============================================================
  // 📌 FUNGSI UTILITY
  // ============================================================
  
  function isLocation(word) {
    const lowerWord = word.toLowerCase().replace(/[^a-z]/g, '');
    if (NOT_LOCATION_WORDS.has(lowerWord)) return false;
    if (LOCATION_WHITELIST.has(lowerWord)) return true;
    // Deteksi pola "di [kota]" 
    return false;
  }
  
  function isSpecificProduct(text) {
    const specificIndicators = [
      'galvalum', 'spandek', 'bondek', 'hebel', 'bata ringan', 'conblock',
      'excavator', 'bulldozer', 'crane', 'dump truck', 'vibro', 'stamper',
      'roofing', 'insulation', 'waterproof'
    ];
    for (const indicator of specificIndicators) {
      if (text.includes(indicator)) return true;
    }
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
    
    if (combined.includes('/jasa/') || combined.includes('jasa ') || combined.includes('kontraktor')) return 'jasa';
    if (combined.includes('/sewa/') || combined.includes('/rental/') || combined.includes('sewa ')) return 'sewa';
    if (combined.includes('/material/') || combined.includes('material ') || combined.includes('bahan bangunan')) return 'material';
    if (combined.includes('/artikel/') || combined.includes('/blog/')) return 'artikel';
    
    return 'produk';
  }
  
  // ============================================================
  // 📌 PRIORITAS 2: DETEKSI INTENT DARI H1
  // ============================================================
  function detectIntentFromText(text) {
    const lowerText = text.toLowerCase();
    
    // Cek transaksional dulu (prioritas tertinggi untuk Money Page)
    for (const keyword of INTENT_KEYWORDS.transaksional) {
      if (lowerText.includes(keyword)) {
        console.log(`📌 PRIORITAS 2: Intent detected = transaksional (keyword: ${keyword})`);
        return 'transaksional';
      }
    }
    
    // Cek komersial
    for (const keyword of INTENT_KEYWORDS.komersial) {
      if (lowerText.includes(keyword)) {
        console.log(`📌 PRIORITAS 2: Intent detected = komersial (keyword: ${keyword})`);
        return 'komersial';
      }
    }
    
    // Default informasional
    console.log(`📌 PRIORITAS 2: Intent detected = informasional (default)`);
    return 'informasional';
  }
  
  // ============================================================
  // 📌 PRIORITAS 3 & 4: DETEKSI MONEY LEVEL + SPESIFISITAS
  // ============================================================
  function detectMoneyLevel(text, entityType) {
    const lowerText = text.toLowerCase();
    
    // Harus mengandung keyword harga/biaya/sewa
    const hasPrice = lowerText.includes('harga') || lowerText.includes('biaya') || lowerText.includes('tarif');
    const hasRent = lowerText.includes('sewa') || lowerText.includes('rental') || lowerText.includes('booking');
    
    if (!hasPrice && !hasRent) return null;
    
    // Ekstrak setelah keyword
    let afterKeyword = '';
    if (hasPrice) {
      afterKeyword = lowerText.substring(Math.max(lowerText.indexOf('harga'), lowerText.indexOf('biaya'), lowerText.indexOf('tarif')) + 5);
    } else if (hasRent) {
      afterKeyword = lowerText.substring(lowerText.indexOf('sewa') + 4);
    }
    afterKeyword = afterKeyword.slice(0, 80).trim();
    
    // PRIORITAS 4a: CEK LOKASI (MONEY_CHILD)
    const words = afterKeyword.split(/[\s,-]+/);
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const nextWord = words[i+1] || '';
      if (isLocation(word) || (word === 'di' && isLocation(nextWord))) {
        console.log(`📌 PRIORITAS 4a: Location detected → money-child`);
        // JASA tidak boleh money-master, bisa money-child
        if (entityType === 'jasa') return 'money-child';
        return 'money-child';
      }
    }
    
    // PRIORITAS 4b: CEK SPESIFIKASI PRODUK (MONEY_PAGE)
    if (isSpecificProduct(afterKeyword)) {
      console.log(`📌 PRIORITAS 4b: Specific product detected → money-page`);
      return 'money-page';
    }
    
    // PRIORITAS 4c: CEK JUMLAH KATA setelah keyword
    const wordCount = afterKeyword.split(/\s+/).filter(w => w.length > 0 && !NOT_LOCATION_WORDS.has(w)).length;
    
    // 1-2 kata: kategori umum → MONEY_MASTER (kecuali JASA)
    if (wordCount <= 2) {
      if (entityType === 'jasa') {
        console.log(`📌 JASA with general price → forced to money-page`);
        return 'money-page';
      }
      console.log(`📌 PRIORITAS 4c: General category (${wordCount} words) → money-master`);
      return 'money-master';
    }
    
    // 3+ kata: produk spesifik → MONEY_PAGE
    console.log(`📌 PRIORITAS 4c: Specific product (${wordCount} words) → money-page`);
    return 'money-page';
  }
  
  // ============================================================
  // 📌 DETEKSI VARIANT vs SUB-VARIANT (SPESIFISITAS TINGKAT DALAM)
  // ============================================================
  function detectVariantLevel(text) {
    const lowerText = text.toLowerCase();
    
    // CEK SUB-VARIANT (3+ parameter atau pola sangat detail)
    let subVariantScore = 0;
    for (const pattern of SUB_VARIANT_PATTERNS) {
      if (pattern.test(lowerText)) {
        subVariantScore++;
        console.log(`📌 Sub-variant pattern matched: ${pattern}`);
      }
    }
    
    // Jika ada pola dengan x dan mm/cm/m (ukuran lengkap)
    const hasFullDimension = /[0-9]+(\s*\.\s*[0-9]+)?\s*mm\s*x\s*[0-9]+(\s*\.\s*[0-9]+)?\s*(mm|cm|m)/i.test(lowerText);
    if (hasFullDimension) subVariantScore++;
    
    // Jika ada 2+ ukuran/parameter
    const dimensionCount = (lowerText.match(/[0-9]+(\s*\.\s*[0-9]+)?\s*(mm|cm|m|inch|ton|kg|liter)/gi) || []).length;
    if (dimensionCount >= 2) subVariantScore++;
    
    if (subVariantScore >= 2) {
      console.log(`📌 SUB-VARIANT detected (score: ${subVariantScore})`);
      return 'sub-variant';
    }
    
    // CEK VARIANT (1-2 parameter)
    for (const pattern of VARIANT_PATTERNS) {
      if (typeof pattern === 'string' && lowerText.includes(pattern)) {
        console.log(`📌 VARIANT detected (pattern: ${pattern})`);
        return 'variant';
      }
      if (pattern instanceof RegExp && pattern.test(lowerText)) {
        console.log(`📌 VARIANT detected (regex: ${pattern})`);
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
    
    // SUB-PILLAR TIPE 2 (jenis, macam, tipe)
    if (lowerText.includes('jenis ') || lowerText.includes(' macam ') || 
        lowerText.includes(' tipe ') || lowerText.includes(' kategori ') ||
        lowerText.match(/^jenis\s+/i) || lowerText.match(/^macam\s+/i)) {
      console.log(`📌 SUB-PILLAR TIPE 2 detected (jenis/macam/tipe)`);
      return 'sub-pillar-tipe-2';
    }
    
    // SUB-PILLAR TIPE 1 (perbandingan)
    if (lowerText.includes(' vs ') || lowerText.includes(' perbandingan ') || 
        lowerText.includes(' lebih baik ') || lowerText.includes(' mana yang ') ||
        lowerText.includes(' perbedaan ') || lowerText.includes(' dibanding ')) {
      console.log(`📌 SUB-PILLAR TIPE 1 detected (perbandingan)`);
      return 'sub-pillar-tipe-1';
    }
    
    return null;
  }
  
  // ============================================================
  // 📌 FUNGSI DETEKSI UTAMA (DENGAN PRIORITAS YANG BENAR)
  // ============================================================
  function detectPageLevel(userOptions = {}) {
    const { userEntityType = null, userKeyword = null, userLocation = null } = userOptions;
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔍 Page Level Detector v17.0 — PHASE SYSTEM");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // STEP 1: PRIORITAS 1 — CEK ENTITY TYPE
    const entityType = detectEntityType(userEntityType);
    console.log(`✅ PRIORITAS 1: Entity Type = ${entityType.toUpperCase()}`);
    
    // STEP 2: Ambil H1 (sumber utama deteksi)
    const h1 = (document.querySelector("h1")?.innerText || "").trim();
    const title = (document.title || "").trim();
    const combinedText = h1 + ' ' + title;
    
    console.log(`📄 H1: "${h1}"`);
    console.log(`📄 Title: "${title}"`);
    
    // STEP 3: PRIORITAS 2 — CEK INTENT KEYWORD
    const detectedIntent = detectIntentFromText(combinedText);
    console.log(`✅ PRIORITAS 2: Intent = ${detectedIntent.toUpperCase()}`);
    
    // STEP 4: PRIORITAS 3 — CEK ADA/TIDAKNYA KEYWORD HARGA
    const hasPrice = combinedText.includes('harga') || combinedText.includes('biaya') || 
                     combinedText.includes('tarif') || combinedText.includes('sewa');
    
    // STEP 5: PRIORITAS 4 — CEK TINGKAT SPESIFISITAS
    
    // PRIORITAS 4a: CEK MONEY LEVEL (jika ada harga)
    if (hasPrice) {
      const moneyLevel = detectMoneyLevel(combinedText, entityType);
      if (moneyLevel) {
        // Validasi khusus JASA
        if (entityType === 'jasa' && moneyLevel === 'money-master') {
          console.log(`⚠️ JASA cannot be money-master → redirecting to money-page`);
          const result = 'money-page';
          console.log(`✅ FINAL Page Level = ${result.toUpperCase()}`);
          return result;
        }
        console.log(`✅ PRIORITAS 4a: Money Level = ${moneyLevel.toUpperCase()}`);
        console.log(`✅ FINAL Page Level = ${moneyLevel.toUpperCase()}`);
        return moneyLevel;
      }
    }
    
    // PRIORITAS 4b: CEK VARIANT / SUB-VARIANT
    const variantLevel = detectVariantLevel(combinedText);
    if (variantLevel) {
      console.log(`✅ PRIORITAS 4b: Variant Level = ${variantLevel.toUpperCase()}`);
      console.log(`✅ FINAL Page Level = ${variantLevel.toUpperCase()}`);
      return variantLevel;
    }
    
    // PRIORITAS 4c: CEK SUB-PILLAR
    const subPillarLevel = detectSubPillarLevel(combinedText);
    if (subPillarLevel) {
      console.log(`✅ PRIORITAS 4c: Sub-Pillar Level = ${subPillarLevel.toUpperCase()}`);
      console.log(`✅ FINAL Page Level = ${subPillarLevel.toUpperCase()}`);
      return subPillarLevel;
    }
    
    // DEFAULT: PILLAR
    console.log(`✅ FINAL Page Level = PILLAR (default)`);
    return 'pillar';
  }
  
  // ============================================================
  // 📌 VALIDASI INTENT (WAJIB SESUAI PHASE 1.5)
  // ============================================================
  function validateIntent(pageLevel, detectedIntent, entityType) {
    let required, dominance;
    
    // Intent untuk JASA (override)
    if (entityType === 'jasa' && JASA_INTENT[pageLevel]) {
      required = JASA_INTENT[pageLevel].intent;
      dominance = JASA_INTENT[pageLevel].dominance;
      console.log(`📋 JASA Intent Check: ${pageLevel} should be ${required} (${dominance}) + ${JASA_INTENT[pageLevel].secondaryIntent} (${JASA_INTENT[pageLevel].secondaryDominance})`);
      
      if (detectedIntent === required || detectedIntent === JASA_INTENT[pageLevel].secondaryIntent) {
        console.log(`✅ Intent valid: ${detectedIntent} matches allowed intent for JASA ${pageLevel}`);
        return true;
      }
      console.warn(`⚠️ Intent mismatch: ${pageLevel} for JASA should be ${required} or ${JASA_INTENT[pageLevel].secondaryIntent}, but got ${detectedIntent}`);
      return false;
    }
    
    // Intent untuk entity lainnya
    if (REQUIRED_INTENT[pageLevel]) {
      required = REQUIRED_INTENT[pageLevel].intent;
      dominance = REQUIRED_INTENT[pageLevel].dominance;
      console.log(`📋 Intent Check: ${pageLevel} should be ${required} (${dominance})`);
      
      if (detectedIntent === required) {
        console.log(`✅ Intent valid: ${detectedIntent} matches ${pageLevel}`);
        return true;
      }
      
      // Komersial bisa diterima untuk SP1 jika tidak strict (toleransi)
      if (pageLevel === 'sub-pillar-tipe-1' && detectedIntent === 'komersial') {
        console.log(`✅ Intent valid (tolerated): ${detectedIntent} for ${pageLevel}`);
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
    if (rule === 'produk-only' && entityType !== 'jasa') return true;
    if (rule === 'produk-only' && entityType === 'jasa') {
      console.log(`📋 JASA ${pageLevel} does not require year in H1`);
      return false;
    }
    return false;
  }
  
  // ============================================================
  // 📌 GET REQUIRED INTENT DOMINANCE
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
    console.log(`📌 Page Level     : ${pageLevel.toUpperCase()}`);
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
    
    // Validasi JASA + MONEY_MASTER
    if (currentEntityType === 'jasa' && level === 'money-master') {
      console.error(`❌ JASA cannot use money-master! Override rejected.`);
      return false;
    }
    
    window.__manualPageLevel = level;
    document.body.setAttribute('data-page-level', level);
    console.log(`✅ Manual page level set to: ${level}`);
    return true;
  }
  
  // ============================================================
  // 📌 EXPOSE FUNGSI
  // ============================================================
  window.pageLevelDetectorV17 = {
    detect: detectPageLevel,
    setManual: setManualPageLevel,
    detectEntityType: detectEntityType,
    detectIntent: detectIntentFromText,
    validateIntent: validateIntent,
    requiresYear: requiresYearInH1,
    getRequiredIntent: getRequiredIntent,
    updateAttributes: updateBodyAttributes,
    isValidLevel: (level) => VALID_LEVELS.includes(level),
    isValidEntityType: (type) => VALID_ENTITY_TYPES.includes(type),
    getLocationWhitelist: () => Array.from(LOCATION_WHITELIST),
    VALID_LEVELS: VALID_LEVELS,
    VALID_ENTITY_TYPES: VALID_ENTITY_TYPES,
    VALID_INTENTS: VALID_INTENTS,
    version: '17.0'
  };
  
  window.__pageLevelDetectorV17Ready = true;
  window.dispatchEvent(new Event("pageLevelDetectorV17Ready"));
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Page Level Detector v17.0 ready");
  console.log("📋 Complete 8-Level Hierarchy:", VALID_LEVELS.join(' → '));
  console.log("📋 Intent detection: YES");
  console.log("📋 Evergreen validation: YES");
  console.log("📋 JASA special rules: YES");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
})();
