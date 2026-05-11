/* ============================================================
 🧠 Page Level Detector v18.1 — SYNCHRONIZED WITH BREADCRUMB v5.4
    ✅ SINKRONISASI DENGAN generateBreadcrumbForMapping v5.4
    ✅ Prioritas deteksi SAMA PERSIS:
       0. HOMEPAGE (root domain, /, /index.html)
       1. INFORMASIONAL (panduan, cara, tips, apa itu) → PILLAR
       2. PERBANDINGAN (vs, versus, perbandingan) → SP1
       3. JENIS/MACAM/DAFTAR (jenis, macam, tipe, kategori, daftar, list) → SP2
       4. KEYWORD HARGA/SEWA (harga, biaya, tarif, sewa, rental) → MONEY
       5. JASA/SEWA (tanpa keyword harga) → MONEY_PAGE/CHILD
       6. SUB-VARIANT (2+ parameter: Xmm x Ymm x Zmm, tebal+panjang+lebar)
       7. VARIANT (spesifikasi, ukuran, tipe, model, varian, warna, merk)
       8. DEFAULT → PILLAR
    ✅ 9-Level Hierarchy: Home(0) → Pillar(1) → SP2(2) → SP1(3) → MONEY_MASTER(4) → MONEY_PAGE(5) → MONEY_CHILD(6) → Variant(7) → SubVariant(8)
    ✅ Intent detection (Informasional/Komersial/Transaksional/Navigasional)
    ✅ Evergreen vs Non-Evergreen (tahun wajib/tidak)
    ✅ JASA: TIDAK BOLEH MONEY_MASTER
============================================================ */

(function() {
  if (window.pageLevelDetectorV181) return;
  
  // ============================================================
  // 📌 KONSTANTA VALIDASI (9 LEVEL + HOMEPAGE)
  // ============================================================
  const VALID_LEVELS = [
    'home',                  // Level 0 - HOMEPAGE
    'pillar',                // Level 1 - terluas, EVERGREEN
    'sub-pillar-tipe-2',     // Level 2 - JENIS/MACAM/DAFTAR, EVERGREEN
    'sub-pillar-tipe-1',     // Level 3 - PERBANDINGAN, FLEXIBLE
    'money-master',          // Level 4 - NON-EVERGREEN (khusus produk/material/sewa)
    'money-page',            // Level 5 - NON-EVERGREEN (produk) / FLEXIBLE (jasa)
    'money-child',           // Level 6 - NON-EVERGREEN (produk) / FLEXIBLE (jasa)
    'variant',               // Level 7 - SPESIFIKASI, EVERGREEN
    'sub-variant'            // Level 8 - DETAIL TEKNIS, EVERGREEN
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
  // 📌 KEYWORD CIRI PER LEVEL (SINKRON DENGAN BREADCRUMB v5.4)
  // ============================================================
  
  // LEVEL 0: HOMEPAGE
  const HOME_KEYWORDS = ['beranda', 'home', 'halaman utama', 'homepage', 'index'];
  
  // LEVEL 1: PILLAR (Informasional 90%)
  const PILLAR_KEYWORDS = [
    'panduan', 'panduan lengkap', 'cara ', 'tips ', 'tips dan trik',
    'apa itu', 'pengertian', 'definisi', 'edukasi', 'belajar', 
    'tutorial', 'materi', 'penjelasan', 'kenapa', 'mengapa',
    'bagaimana', 'contoh', 'rekomendasi', 'lengkap', 'komprehensif'
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
  // 📌 INTENT MAP PER PAGE LEVEL (PHASE 1.5)
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
  // 📌 EVERGREEN vs NON-EVERGREEN (STEP 6.2)
  // ============================================================
  const REQUIRES_YEAR = {
    'home': false,
    'money-master': true,
    'money-page': 'produk-only',
    'money-child': 'produk-only',
    'pillar': false,
    'sub-pillar-tipe-2': false,
    'sub-pillar-tipe-1': false,
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
  
  // Blacklist kata yang mirip lokasi tapi sebenarnya spesifikasi produk
  const NOT_LOCATION_WORDS = new Set([
    'mini', 'maxi', 'super', 'extra', 'plus', 'pro', 'max', 'ultra', 'deluxe',
    'baru', 'lama', 'bekas', 'second', 'original', 'kw', 'grade',
    'murah', 'mahal', 'hemat', 'premium', 'standar', 'ekonomis',
    'kecil', 'besar', 'sedang', 'panjang', 'pendek', 'tebal', 'tipis', 'lebar'
  ]);
  
  // ============================================================
  // 📌 FUNGSI UTILITY
  // ============================================================
  
  function log(msg, type = "INFO") {
    const icons = { 
      INFO: "📘", WARN: "⚠️", ERROR: "❌", SUCCESS: "✅", 
      HOME: "🏠", PILLAR: "🏛️", SP1: "⚖️", SP2: "📚", 
      MONEY: "💰", VARIANT: "🔧", SUBVARIANT: "🔬" 
    };
    const prefix = icons[type] || "📘";
    console.log(`${prefix} [Detector v18.1] ${msg}`);
  }
  
  function isHomePage() {
    const url = window.location.href.toLowerCase();
    const path = url.replace(/https?:\/\/[^\/]+/, '');
    const isRoot = path === '' || path === '/' || path === '/index.html' || path === '/home';
    
    if (isRoot) return true;
    
    const h1 = (document.querySelector("h1")?.innerText || "").toLowerCase();
    const title = document.title.toLowerCase();
    
    return HOME_KEYWORDS.some(kw => h1 === kw || title === kw);
  }
  
  function isLocation(text) {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/[\s,-]+/);
    
    for (const word of words) {
      if (LOCATION_WHITELIST.has(word)) return true;
      if (PRODUCT_BLACKLIST.has(word)) return false;
    }
    
    const hasIndicator = /di |ke |kota |wilayah |daerah /.test(lowerText);
    if (!hasIndicator) return false;
    
    for (const word of words) {
      if (word.length >= 4 && word.length <= 12 && /[aiueo]{2,}/.test(word)) {
        if (!PRODUCT_BLACKLIST.has(word)) return true;
      }
    }
    return false;
  }
  
  function isSpecificProduct(text, wordCountAfterPrice = null) {
    const lowerText = text.toLowerCase();
    if (wordCountAfterPrice !== null && wordCountAfterPrice <= 2) return false;
    
    const specificIndicators = [
      'galvalum', 'spandek', 'bondek', 'hebel', 'bata ringan', 'conblock',
      'excavator', 'bulldozer', 'crane', 'dump truck', 'vibro', 'stamper',
      'hpl', 'mdf', 'jati', 'mahoni', 'multiplek', 'triplek'
    ];
    
    for (const indicator of specificIndicators) {
      if (lowerText.includes(indicator)) return true;
    }
    
    if (/\d+(\.\d+)?\s*(mm|cm|m|inch)/.test(lowerText)) return true;
    
    return false;
  }
  
  function isSubVariant(text) {
    const lowerText = text.toLowerCase();
    let score = 0;
    
    if (/(\d+(\.\d+)?\s*mm\s*x\s*\d+(\.\d+)?\s*mm\s*x\s*\d+(\.\d+)?\s*mm)/i.test(lowerText)) score++;
    if (/(\d+(\.\d+)?\s*cm\s*x\s*\d+(\.\d+)?\s*cm\s*x\s*\d+(\.\d+)?\s*cm)/i.test(lowerText)) score++;
    if (lowerText.includes('tebal') && lowerText.includes('panjang') && lowerText.includes('lebar')) score++;
    
    const dimensions = lowerText.match(/\d+(\.\d+)?\s*(mm|cm|m|ton|kg|liter)/gi) || [];
    if (dimensions.length >= 3) score++;
    if (lowerText.includes('kapasitas') && dimensions.length >= 2) score++;
    
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
      log(`Entity type from user input = ${entity}`, "INFO");
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
  // 📌 PRIORITAS 2: DETEKSI INTENT DARI TEXT
  // ============================================================
  function detectIntentFromText(text) {
    const lowerText = text.toLowerCase();
    
    for (const kw of MONEY_KEYWORDS) {
      if (lowerText.includes(kw)) {
        log(`Intent detected = transaksional (keyword: ${kw})`, "INFO");
        return 'transaksional';
      }
    }
    
    for (const kw of SP1_KEYWORDS) {
      if (lowerText.includes(kw)) {
        log(`Intent detected = komersial (keyword: ${kw})`, "INFO");
        return 'komersial';
      }
    }
    
    for (const kw of VARIANT_KEYWORDS) {
      if (lowerText.includes(kw)) {
        log(`Intent detected = komersial (keyword: ${kw})`, "INFO");
        return 'komersial';
      }
    }
    
    log(`Intent detected = informasional (default)`, "INFO");
    return 'informasional';
  }
  
  // ============================================================
  // 📌 DETEKSI MONEY LEVEL (PRIORITAS 4)
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
        log(`Location detected → money-child`, "MONEY");
        if (entityType === 'jasa') return 'money-child';
        return 'money-child';
      }
    }
    
    // CEK SPESIFIKASI PRODUK
    if (isSpecificProduct(afterKeyword)) {
      log(`Specific product detected → money-page`, "MONEY");
      return 'money-page';
    }
    
    // CEK JUMLAH KATA
    const wordCount = afterKeyword.split(/\s+/).filter(w => w.length > 0 && !NOT_LOCATION_WORDS.has(w)).length;
    
    if (wordCount <= 2) {
      if (entityType === 'jasa') {
        log(`JASA with general price → forced to money-page`, "MONEY");
        return 'money-page';
      }
      log(`General category (${wordCount} words) → money-master`, "MONEY");
      return 'money-master';
    }
    
    log(`Specific product (${wordCount} words) → money-page`, "MONEY");
    return 'money-page';
  }
  
  // ============================================================
  // 📌 DETEKSI JASA LEVEL (PRIORITAS 5 - TANPA HARGA)
  // ============================================================
  function detectJasaLevel(text, entityType) {
    if (entityType !== 'jasa') return null;
    
    const lowerText = text.toLowerCase();
    const jasaKeywords = ['jasa', 'pasang', 'service', 'kontraktor', 'borongan', 
                           'renovasi', 'bangun', 'konsultasi', 'survey', 'estimasi'];
    
    for (const kw of jasaKeywords) {
      if (lowerText.includes(kw)) {
        // Double-check SP2 (Jenis/Macam/Daftar) - PRIORITAS LEBIH TINGGI
        for (const sp2kw of SP2_KEYWORDS) {
          if (lowerText.includes(sp2kw)) {
            log(`JASA + SP2 (${sp2kw}) → sub-pillar-tipe-2`, "SP2");
            return 'sub-pillar-tipe-2';
          }
        }
        
        // Double-check perbandingan
        for (const cmp of SP1_KEYWORDS) {
          if (lowerText.includes(cmp)) {
            log(`JASA + perbandingan → sub-pillar-tipe-1`, "SP1");
            return 'sub-pillar-tipe-1';
          }
        }
        
        if (isLocation(lowerText)) {
          log(`JASA + location → money-child`, "MONEY");
          return 'money-child';
        }
        log(`JASA detected → money-page`, "MONEY");
        return 'money-page';
      }
    }
    
    return null;
  }
  
  // ============================================================
  // 📌 DETEKSI SEWA LEVEL (PRIORITAS 5 - TANPA HARGA)
  // ============================================================
  function detectSewaLevel(text, entityType) {
    if (entityType !== 'sewa') return null;
    
    const lowerText = text.toLowerCase();
    const sewaKeywords = ['sewa', 'rental', 'alat berat', 'excavator', 'bulldozer', 'crane'];
    
    for (const kw of sewaKeywords) {
      if (lowerText.includes(kw)) {
        for (const sp2kw of SP2_KEYWORDS) {
          if (lowerText.includes(sp2kw)) {
            log(`SEWA + SP2 (${sp2kw}) → sub-pillar-tipe-2`, "SP2");
            return 'sub-pillar-tipe-2';
          }
        }
        
        for (const cmp of SP1_KEYWORDS) {
          if (lowerText.includes(cmp)) {
            log(`SEWA + perbandingan → sub-pillar-tipe-1`, "SP1");
            return 'sub-pillar-tipe-1';
          }
        }
        
        if (isLocation(lowerText)) {
          log(`SEWA + location → money-child`, "MONEY");
          return 'money-child';
        }
        log(`SEWA detected → money-page`, "MONEY");
        return 'money-page';
      }
    }
    
    return null;
  }
  
  // ============================================================
  // 📌 DETEKSI SUB-PILLAR LEVEL (PRIORITAS 1,2,3)
  // ============================================================
  function detectSubPillarLevel(text) {
    const lowerText = text.toLowerCase();
    
    // PRIORITAS 1: PILLAR / SP2 (Informasional)
    for (const kw of PILLAR_KEYWORDS) {
      if (lowerText.includes(kw)) {
        for (const sp2kw of SP2_KEYWORDS) {
          if (lowerText.includes(sp2kw)) {
            log(`SUB-PILLAR TIPE 2 detected (${kw} + ${sp2kw})`, "SP2");
            return 'sub-pillar-tipe-2';
          }
        }
        log(`PILLAR detected (${kw})`, "PILLAR");
        return 'pillar';
      }
    }
    
    // PRIORITAS 2: PERBANDINGAN (SP1)
    for (const kw of SP1_KEYWORDS) {
      if (lowerText.includes(kw)) {
        log(`SUB-PILLAR TIPE 1 detected (${kw})`, "SP1");
        return 'sub-pillar-tipe-1';
      }
    }
    
    // PRIORITAS 3: JENIS/MACAM/DAFTAR (SP2)
    for (const kw of SP2_KEYWORDS) {
      if (lowerText.startsWith(kw) || lowerText.includes(kw + ' ') || lowerText.includes(kw + '-')) {
        log(`SUB-PILLAR TIPE 2 detected (${kw})`, "SP2");
        return 'sub-pillar-tipe-2';
      }
    }
    
    return null;
  }
  
  // ============================================================
  // 📌 FUNGSI DETEKSI UTAMA (PRIORITAS LENGKAP - SINKRON DENGAN BREADCRUMB)
  // ============================================================
  function detectPageLevel(userOptions = {}) {
    const { userEntityType = null } = userOptions;
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔍 Page Level Detector v18.1 — SYNCHRONIZED");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // PRIORITAS 0: HOMEPAGE
    if (isHomePage()) {
      log("HOMEPAGE detected → home (L0)", "HOME");
      return 'home';
    }
    
    // PRIORITAS 1: ENTITY TYPE
    const entityType = detectEntityType(userEntityType);
    log(`Entity Type = ${entityType.toUpperCase()}`, "SUCCESS");
    
    const h1 = (document.querySelector("h1")?.innerText || "").trim();
    const title = (document.title || "").trim();
    const combinedText = h1 + ' ' + title;
    
    log(`H1: "${h1.substring(0, 60)}..."`, "INFO");
    
    // PRIORITAS 2: INTENT
    const detectedIntent = detectIntentFromText(combinedText);
    log(`Intent = ${detectedIntent.toUpperCase()}`, "SUCCESS");
    
    // PRIORITAS 3: SUB-PILLAR LEVEL (PILLAR, SP1, SP2)
    const subPillarLevel = detectSubPillarLevel(combinedText);
    if (subPillarLevel) {
      log(`Sub-Pillar Level = ${subPillarLevel.toUpperCase()}`, "SUCCESS");
      log(`FINAL Page Level = ${subPillarLevel.toUpperCase()}`, "SUCCESS");
      return subPillarLevel;
    }
    
    // PRIORITAS 4: MONEY LEVEL (HARGA/SEWA)
    const hasMoney = combinedText.includes('harga') || combinedText.includes('biaya') || 
                     combinedText.includes('tarif') || combinedText.includes('sewa');
    
    if (hasMoney) {
      const moneyLevel = detectMoneyLevel(combinedText, entityType);
      if (moneyLevel) {
        if (entityType === 'jasa' && moneyLevel === 'money-master') {
          log(`JASA cannot be money-master → redirecting to money-page`, "WARN");
          log(`FINAL Page Level = MONEY_PAGE`, "SUCCESS");
          return 'money-page';
        }
        log(`Money Level = ${moneyLevel.toUpperCase()}`, "MONEY");
        log(`FINAL Page Level = ${moneyLevel.toUpperCase()}`, "SUCCESS");
        return moneyLevel;
      }
    }
    
    // PRIORITAS 5: JASA (tanpa harga)
    const jasaLevel = detectJasaLevel(combinedText, entityType);
    if (jasaLevel) {
      log(`JASA Level = ${jasaLevel.toUpperCase()}`, "MONEY");
      log(`FINAL Page Level = ${jasaLevel.toUpperCase()}`, "SUCCESS");
      return jasaLevel;
    }
    
    // PRIORITAS 6: SEWA (tanpa harga)
    const sewaLevel = detectSewaLevel(combinedText, entityType);
    if (sewaLevel) {
      log(`SEWA Level = ${sewaLevel.toUpperCase()}`, "MONEY");
      log(`FINAL Page Level = ${sewaLevel.toUpperCase()}`, "SUCCESS");
      return sewaLevel;
    }
    
    // PRIORITAS 7: SUB-VARIANT (Level 8)
    if (isSubVariant(combinedText)) {
      log(`SUB-VARIANT detected (2+ parameters) → sub-variant (L8)`, "SUBVARIANT");
      return 'sub-variant';
    }
    
    // PRIORITAS 8: VARIANT (Level 7)
    for (const kw of VARIANT_KEYWORDS) {
      if (combinedText.includes(kw)) {
        log(`VARIANT detected (${kw}) → variant (L7)`, "VARIANT");
        return 'variant';
      }
    }
    
    if (/\d+(\.\d+)?\s*(mm|cm|m|kg|ton)/.test(combinedText) && !combinedText.includes('x')) {
      log(`VARIANT detected (single dimension) → variant (L7)`, "VARIANT");
      return 'variant';
    }
    
    // DEFAULT: PILLAR
    log(`PILLAR (default) → pillar (L1)`, "PILLAR");
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
      log(`JASA Intent Check: ${pageLevel} should be ${required} (${dominance}) or ${secondary} (${secondaryDom})`, "INFO");
      
      if (detectedIntent === required || detectedIntent === secondary) {
        log(`Intent valid for JASA ${pageLevel}`, "SUCCESS");
        return true;
      }
      log(`Intent mismatch: ${pageLevel} for JASA should be ${required} or ${secondary}, but got ${detectedIntent}`, "WARN");
      return false;
    }
    
    if (REQUIRED_INTENT[pageLevel]) {
      required = REQUIRED_INTENT[pageLevel].intent;
      dominance = REQUIRED_INTENT[pageLevel].dominance;
      secondary = REQUIRED_INTENT[pageLevel].secondaryIntent;
      log(`Intent Check: ${pageLevel} should be ${required} (${dominance})`, "INFO");
      
      if (detectedIntent === required) {
        log(`Intent valid: ${detectedIntent} matches ${pageLevel}`, "SUCCESS");
        return true;
      }
      
      if (secondary && detectedIntent === secondary) {
        log(`Intent valid (secondary): ${detectedIntent} matches ${pageLevel}`, "SUCCESS");
        return true;
      }
      
      log(`Intent mismatch: ${pageLevel} should be ${required}, but got ${detectedIntent}`, "WARN");
      return false;
    }
    
    return true;
  }
  
  // ============================================================
  // 📌 EVERGREEN VALIDATION
  // ============================================================
  function requiresYearInH1(pageLevel, entityType) {
    const rule = REQUIRES_YEAR[pageLevel];
    const CURRENT_YEAR = new Date().getFullYear();
    
    if (rule === true) {
      const h1 = document.querySelector("h1")?.innerText || "";
      const hasYear = new RegExp(`\\b${CURRENT_YEAR}\\b`).test(h1);
      if (!hasYear) {
        log(`⚠️ WARNING: H1 must contain year ${CURRENT_YEAR} for ${pageLevel}`, "WARN");
      }
      return true;
    }
    
    if (rule === 'produk-only' && entityType !== 'jasa' && entityType !== 'sewa') {
      const h1 = document.querySelector("h1")?.innerText || "";
      const hasYear = new RegExp(`\\b${CURRENT_YEAR}\\b`).test(h1);
      if (!hasYear) {
        log(`⚠️ WARNING: H1 must contain year ${CURRENT_YEAR} for ${pageLevel} (Produk/Material)`, "WARN");
      }
      return true;
    }
    
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
  // 📌 UPDATE BODY ATTRIBUTES
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
  // 📌 SET MANUAL PAGE LEVEL
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
    log(`Manual page level set to: ${level} (L${TYPE_LEVEL_MAP[level]})`, "SUCCESS");
    return true;
  }
  
  // ============================================================
  // 📌 EXPOSE FUNGSI
  // ============================================================
  window.pageLevelDetectorV181 = {
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
  
  window.__pageLevelDetectorV181Ready = true;
  window.dispatchEvent(new Event("pageLevelDetectorV181Ready"));
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Page Level Detector v18.1 ready");
  console.log("📋 SYNCHRONIZED with Breadcrumb v5.4");
  console.log("📋 Complete 9-Level Hierarchy: HOME(L0) → " + VALID_LEVELS.filter(l => l !== 'home').join(' → '));
  console.log("📋 PRIORITAS: Home → Entity → Intent → PILLAR/SP2 → SP1 → SP2 → MONEY → JASA/SEWA → SubVariant → Variant → Pillar");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
})();
