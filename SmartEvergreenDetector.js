/* ============================================================
 🧠 Smart Evergreen Detector v15.2 — UNTUK betonjayareadymix.com
    ✅ SINKRON dengan V37 FULL SITE AUTO ARCHITECTURE
    ✅ PATOKAN UTAMA: H1 (Informasi → Evergreen, Harga → Cek Tabel)
    ✅ ATURAN TAHUN: H1 mengandung tahun → NON-EVERGREEN
    ✅ ATURAN HARGA: H1 harga + tabel harga → NON-EVERGREEN
    ✅ ATURAN INFORMASI: H1 informatif tanpa harga → EVERGREEN
    ✅ SUPPORT PLD v22.x, v20.x, v19.0, v18, v17, legacy
    ✅ FIXED: JASA rules (money-master=30, money-page=30, money-child=30)
    ✅ FIXED: PRODUK rules (variant 730 hari, sub-variant 730 hari)
============================================================ */

(function () {
  if (window.detectEvergreen) return;

  // ============================================================
  // 📌 ATURAN V37 — BASE RULES
  // ============================================================
  const BASE_PAGE_LEVEL_RULES = {
    'pillar': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft' },
    'sub-pillar-tipe-2': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft-medium' },
    'sub-pillar-tipe-1': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'sub-variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'money-master': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: false, allowPriceRange: true, ctaIntensity: 'hard' },
    'money-page': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: true, allowPriceRange: false, ctaIntensity: 'hard' },
    'money-child': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: true, allowPriceRange: false, ctaIntensity: 'very-hard' }
  };

  // ============================================================
  // 📌 ATURAN V37 — PRODUK & MATERIAL
  // ============================================================
  const PRODUK_MATERIAL_RULES = {
    'pillar': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft' },
    'sub-pillar-tipe-2': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft-medium' },
    'sub-pillar-tipe-1': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'sub-variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'money-master': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: false, allowPriceRange: true, ctaIntensity: 'hard' },
    'money-page': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: true, allowPriceRange: false, ctaIntensity: 'hard' },
    'money-child': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: true, allowPriceRange: false, ctaIntensity: 'very-hard' }
  };

  // ============================================================
  // 📌 ATURAN V37 — SEWA
  // ============================================================
  const SEWA_RULES = {
    'pillar': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft' },
    'sub-pillar-tipe-2': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft-medium' },
    'sub-pillar-tipe-1': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'sub-variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'money-master': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: false, allowPriceRange: true, ctaIntensity: 'hard' },
    'money-page': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: true, allowPriceRange: false, ctaIntensity: 'hard' },
    'money-child': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: true, allowPriceRange: false, ctaIntensity: 'very-hard' }
  };

  // ============================================================
  // 📌 ATURAN V37 — JASA
  // ============================================================
  const JASA_RULES = {
    'pillar': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft' },
    'sub-pillar-tipe-2': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft-medium' },
    'sub-pillar-tipe-1': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'sub-variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'money-master': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: false, allowPriceRange: true, ctaIntensity: 'hard' },
    'money-page': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: true, allowPriceRange: false, ctaIntensity: 'hard' },
    'money-child': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: true, allowPriceRange: false, ctaIntensity: 'very-hard' }
  };

  const DEFAULT_RULE = { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft' };

  // ============================================================
  // 📌 FUNGSI DETEKSI KONTEN BERDASARKAN H1 (PATOKAN UTAMA)
  // ============================================================
  function detectContentTypeByH1() {
    const h1 = document.querySelector('h1');
    if (!h1) {
      console.warn('⚠️ H1 tidak ditemukan, menggunakan fallback konten');
      return { 
        isInformational: false, 
        isPrice: false, 
        hasYear: false,
        h1Text: '', 
        confidence: 'low',
        reason: 'H1 tidak ditemukan'
      };
    }
    
    const h1Text = h1.innerText.toLowerCase();
    
    // ============================================================
    // 1. CEK TAHUN DI H1 (WAJIB NON-EVERGREEN)
    // ============================================================
    const yearPattern = /\b(19|20)\d{2}\b/;
    const hasYear = yearPattern.test(h1Text);
    
    if (hasYear) {
      console.log(`📅 H1 mengandung tahun → NON-EVERGREEN (wajib)`);
      return {
        isInformational: false,
        isPrice: true, // Dianggap price karena ada tahun
        hasYear: true,
        h1Text: h1Text,
        infoScore: 0,
        priceScore: 0,
        hasRpFormat: false,
        hasNumberWithUnit: false,
        hasPriceNumber: false,
        reason: 'H1 mengandung tahun (wajib non-evergreen)',
        confidence: 'high'
      };
    }
    
    // ============================================================
    // 2. KATA KUNCI INFORMATIF (EVERGREEN)
    // ============================================================
    const informationalKeywords = [
      'panduan', 'spesifikasi', 'keunggulan', 'cara memilih', 'tips', 
      'perbedaan', 'jenis', 'apa itu', 'pengertian', 'informasi',
      'standar', 'mutu', 'ukuran', 'komponen', 'bahan', 'material',
      'panduan lengkap', 'lengkap', 'solusi', 'rekomendasi', 'penjelasan',
      'karakteristik', 'kelebihan', 'kekurangan', 'fungsi', 'manfaat'
    ];
    
    // ============================================================
    // 3. KATA KUNCI HARGA (NON-EVERGREEN)
    // ============================================================
    const priceKeywords = [
      'harga', 'biaya', 'tarif', 'estimasi', 'rp', 'rupiah',
      'per meter', 'per lembar', 'per batang', 'per kubik',
      'promo', 'diskon', 'penawaran', 'cost', 'budget',
      'uang', 'pembayaran', 'cicilan', 'kredit'
    ];
    
    // ============================================================
    // 4. CEK KATA KUNCI
    // ============================================================
    let infoScore = 0;
    let priceScore = 0;
    
    informationalKeywords.forEach(keyword => {
      if (h1Text.includes(keyword)) infoScore++;
    });
    
    priceKeywords.forEach(keyword => {
      if (h1Text.includes(keyword)) priceScore++;
    });
    
    // ============================================================
    // 5. CEK FORMAT HARGA DI H1
    // ============================================================
    const hasRpFormat = /Rp\s*[\d.,]+/.test(h1Text);
    const hasNumberWithUnit = /[\d.,]+\s*(per|meter|lembar|batang|kubik|m2|m²|cm|mm|kg|ton)/.test(h1Text);
    const hasPriceNumber = /[\d.,]+\s*(juta|ribu|rb|jt|k|juta-an|jutaan)/.test(h1Text);
    
    // ============================================================
    // 6. KESIMPULAN
    // ============================================================
    let isInformational = false;
    let isPrice = false;
    let reason = '';
    
    // ATURAN 1: Jika H1 mengandung "panduan", "spesifikasi", "keunggulan" → INFORMASI (tanpa harga)
    if (infoScore >= 2 && priceScore === 0 && !hasRpFormat && !hasNumberWithUnit) {
      isInformational = true;
      reason = `H1 mengandung kata informatif tanpa harga (score: ${infoScore})`;
    }
    // ATURAN 2: Jika H1 mengandung harga → HARGA (perlu cek tabel)
    else if (priceScore >= 2 || hasRpFormat || hasNumberWithUnit || hasPriceNumber) {
      isPrice = true;
      reason = `H1 mengandung kata harga (score: ${priceScore})`;
    }
    // ATURAN 3: Jika H1 mengandung "panduan" atau "spesifikasi" → INFORMASI
    else if (h1Text.includes('panduan') || h1Text.includes('spesifikasi') || h1Text.includes('keunggulan')) {
      isInformational = true;
      reason = `H1 mengandung kata 'panduan/spesifikasi/keunggulan'`;
    }
    // ATURAN 4: Default → cek konten
    else {
      const bodyText = document.body.innerText.toLowerCase();
      const eduKeywords = ['panduan', 'spesifikasi', 'keunggulan', 'cara memilih', 'tips', 'perbedaan', 'jenis', 'apa itu'];
      let eduScore = 0;
      eduKeywords.forEach(k => {
        if (bodyText.includes(k)) eduScore++;
      });
      if (eduScore >= 3 && !bodyText.includes('harga') && !bodyText.includes('biaya')) {
        isInformational = true;
        reason = `Fallback: konten edukatif (score: ${eduScore})`;
      } else if (bodyText.includes('harga') || bodyText.includes('biaya')) {
        isPrice = true;
        reason = 'Fallback: konten mengandung kata harga/biaya';
      } else {
        isInformational = true;
        reason = 'Fallback: default ke evergreen (tidak terdeteksi harga)';
      }
    }
    
    console.log('📊 H1 Content Detection:', {
      h1Text: h1Text,
      hasYear: hasYear,
      isInformational,
      isPrice,
      infoScore,
      priceScore,
      hasRpFormat,
      hasNumberWithUnit,
      hasPriceNumber,
      reason
    });
    
    return {
      isInformational,
      isPrice,
      hasYear,
      h1Text: h1Text,
      infoScore,
      priceScore,
      hasRpFormat,
      hasNumberWithUnit,
      hasPriceNumber,
      reason,
      confidence: infoScore >= 2 || priceScore >= 2 || hasYear ? 'high' : 'medium'
    };
  }

  // ============================================================
  // 📌 FUNGSI CEK TABEL HARGA (VALIDASI)
  // ============================================================
  function hasPriceTable() {
    const tables = document.querySelectorAll('table');
    let priceTableFound = false;
    let tableDetails = [];
    
    tables.forEach((table, index) => {
      const tableText = table.innerText.toLowerCase();
      
      // Cek apakah tabel mengandung kolom harga
      const hasPriceColumn = /harga|biaya|estimasi|rp|rupiah|per meter|per lembar|total|subtotal/i.test(tableText);
      
      // Cek apakah tabel mengandung angka (minimal 3)
      const numbers = tableText.match(/[\d.,]+/g);
      const hasNumbers = numbers && numbers.length >= 3;
      
      // Cek apakah tabel mengandung satuan harga
      const hasUnit = /per\s*(meter|m|lembar|lbr|batang|buah|unit|kg|ton|kubik|m³|m2|m²)/i.test(tableText);
      
      if (hasPriceColumn && hasNumbers) {
        priceTableFound = true;
        tableDetails.push({
          index: index,
          hasPriceColumn,
          hasNumbers,
          hasUnit,
          numberCount: numbers ? numbers.length : 0,
          preview: tableText.substring(0, 100)
        });
      }
    });
    
    if (priceTableFound) {
      console.log('💰 Tabel HARGA ditemukan:', tableDetails);
    } else {
      console.log('📋 Tidak ada tabel harga (hanya tabel spesifikasi/informasi)');
    }
    
    return { found: priceTableFound, details: tableDetails };
  }

  // ============================================================
  // 📌 FUNGSI TO ISO WITH TIMEZONE LOCAL
  // ============================================================
  function toISOWithTimezoneLocal(date, offset = "+07:00") {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const pad = (n) => n.toString().padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}${offset}`;
  }

  // ============================================================
  // 📌 TUNGGU PAGE LEVEL DETECTOR READY
  // ============================================================
  function waitForPageLevelDetector() {
    return new Promise((resolve) => {
      if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
        console.log("✅ Page Level Detector v22.x already ready");
        resolve();
        return;
      }
      if (window.pageLevelDetectorv20 && typeof window.pageLevelDetectorv20.detect === 'function') {
        console.log("✅ Page Level Detector v20.x already ready");
        resolve();
        return;
      }
      if (window.pageLevelDetectorv19 && typeof window.pageLevelDetectorv19.detect === 'function') {
        console.log("✅ Page Level Detector v19 already ready");
        resolve();
        return;
      }
      if (window.pageLevelDetectorV18 && typeof window.pageLevelDetectorV18.detect === 'function') {
        console.log("✅ Page Level Detector v18 already ready");
        resolve();
        return;
      }
      if (window.pageLevelDetectorV17 && typeof window.pageLevelDetectorV17.detect === 'function') {
        console.log("✅ Page Level Detector v17 already ready");
        resolve();
        return;
      }
      if (window.pageLevelDetector && typeof window.pageLevelDetector.detect === 'function') {
        console.log("✅ Page Level Detector legacy already ready");
        resolve();
        return;
      }
      
      const onReadyV22 = () => { console.log("✅ PLD v22.x ready (event)"); resolve(); };
      const onReadyV20 = () => { console.log("✅ PLD v20.x ready (event)"); resolve(); };
      const onReadyV19 = () => { console.log("✅ PLD v19 ready (event)"); resolve(); };
      const onReadyV18 = () => { console.log("✅ PLD v18 ready (event fallback)"); resolve(); };
      const onReadyLegacy = () => { console.log("✅ PLD legacy ready (event fallback)"); resolve(); };
      
      window.addEventListener("pageLevelDetectorv22Ready", onReadyV22, { once: true });
      window.addEventListener("pageLevelDetectorv20Ready", onReadyV20, { once: true });
      window.addEventListener("pageLevelDetectorv19Ready", onReadyV19, { once: true });
      window.addEventListener("pageLevelDetectorV19Ready", onReadyV19, { once: true });
      window.addEventListener("pageLevelDetectorv18Ready", onReadyV18, { once: true });
      window.addEventListener("pageLevelDetectorReady", onReadyLegacy, { once: true });
      
      setTimeout(() => {
        if (window.pageLevelDetectorv22 || window.pageLevelDetectorv20 || 
            window.pageLevelDetectorv19 || window.pageLevelDetectorV18 || 
            window.pageLevelDetector) {
          console.log("✅ PLD found on timeout fallback");
          resolve();
        } else {
          console.error("❌ Page Level Detector not available, using fallback defaults");
          window.pageLevelDetector = {
            detect: () => 'pillar',
            detectEntityType: () => 'produk'
          };
          resolve();
        }
      }, 10000);
    });
  }

  // ============================================================
  // 📌 GET PAGE LEVEL DARI DETECTOR
  // ============================================================
  function getPageLevelAndEntityType() {
    let pageLevel = 'pillar';
    let entityType = 'produk';
    let detectorVersion = 'unknown';
    let confidence = null;
    let strategies = null;
    let strategyCount = null;
    
    if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
      try {
        pageLevel = window.pageLevelDetectorv22.detect();
        entityType = window.pageLevelDetectorv22.detectEntityType();
        detectorVersion = 'v22.x';
        if (typeof window.pageLevelDetectorv22.getConfidenceScore === 'function') {
          const confidenceScore = window.pageLevelDetectorv22.getConfidenceScore();
          confidence = confidenceScore.confidence;
          strategies = confidenceScore.strategies;
          strategyCount = confidenceScore.strategyCount;
        }
        console.log(`📌 [${detectorVersion}] Detected: pageLevel=${pageLevel}, entityType=${entityType}`);
        if (confidence) {
          console.log(`   🎯 Confidence: ${confidence}% (${strategyCount} strategies: ${strategies?.join(", ")})`);
        }
        return { pageLevel, entityType, detectorVersion, confidence, strategies, strategyCount };
      } catch(e) { console.warn("v22.x error:", e); }
    }
    
    if (window.pageLevelDetectorv20 && typeof window.pageLevelDetectorv20.detect === 'function') {
      try {
        pageLevel = window.pageLevelDetectorv20.detect();
        entityType = window.pageLevelDetectorv20.detectEntityType();
        detectorVersion = 'v20.x';
        console.log(`📌 [${detectorVersion}] Detected: pageLevel=${pageLevel}, entityType=${entityType}`);
        return { pageLevel, entityType, detectorVersion };
      } catch(e) { console.warn("v20.x error:", e); }
    }
    
    if (window.pageLevelDetectorv19 && typeof window.pageLevelDetectorv19.detect === 'function') {
      try {
        pageLevel = window.pageLevelDetectorv19.detect();
        entityType = window.pageLevelDetectorv19.detectEntityType();
        detectorVersion = 'v19';
        console.log(`📌 [${detectorVersion}] Detected: pageLevel=${pageLevel}, entityType=${entityType}`);
        return { pageLevel, entityType, detectorVersion };
      } catch(e) { console.warn("v19 error:", e); }
    }
    
    if (window.pageLevelDetectorV18 && typeof window.pageLevelDetectorV18.detect === 'function') {
      try {
        pageLevel = window.pageLevelDetectorV18.detect();
        entityType = window.pageLevelDetectorV18.detectEntityType();
        detectorVersion = 'v18';
        console.log(`📌 [${detectorVersion}] Detected: pageLevel=${pageLevel}, entityType=${entityType}`);
        return { pageLevel, entityType, detectorVersion };
      } catch(e) { console.warn("v18 error:", e); }
    }
    
    if (window.pageLevelDetectorV17 && typeof window.pageLevelDetectorV17.detect === 'function') {
      try {
        pageLevel = window.pageLevelDetectorV17.detect();
        entityType = window.pageLevelDetectorV17.detectEntityType();
        detectorVersion = 'v17';
        console.log(`📌 [${detectorVersion}] Detected: pageLevel=${pageLevel}, entityType=${entityType}`);
        return { pageLevel, entityType, detectorVersion };
      } catch(e) { console.warn("v17 error:", e); }
    }
    
    if (window.pageLevelDetector && typeof window.pageLevelDetector.detect === 'function') {
      try {
        pageLevel = window.pageLevelDetector.detect();
        entityType = window.pageLevelDetector.detectEntityType();
        detectorVersion = 'legacy';
        console.log(`📌 [${detectorVersion}] Detected: pageLevel=${pageLevel}, entityType=${entityType}`);
        return { pageLevel, entityType, detectorVersion };
      } catch(e) { console.warn("legacy error:", e); }
    }
    
    console.warn("⚠️ No detector found, using defaults");
    return { pageLevel, entityType, detectorVersion: 'none' };
  }

  // ============================================================
  // 📌 GET RULES BERDASARKAN ENTITY TYPE, PAGE LEVEL, DAN JENIS KONTEN
  // ============================================================
  function getRulesByEntityType(entityType, pageLevel, h1Detection) {
    console.log(`📌 Getting rules for entityType=${entityType}, pageLevel=${pageLevel}`);
    console.log(`   📊 H1 Detection: informational=${h1Detection.isInformational}, price=${h1Detection.isPrice}, hasYear=${h1Detection.hasYear}`);
    
    const isMoneyLevel = ['money-master', 'money-page', 'money-child'].includes(pageLevel);
    
    // ============================================================
    // ATURAN 1: H1 mengandung TAHUN → WAJIB NON-EVERGREEN
    // ============================================================
    if (isMoneyLevel && h1Detection.hasYear) {
      console.warn(`⚠️ H1 mengandung TAHUN → WAJIB NON-EVERGREEN`);
      console.warn(`   → H1: "${h1Detection.h1Text}"`);
      console.warn(`   → Tahun terdeteksi, halaman ini harus non-evergreen`);
      // Gunakan aturan normal (non-evergreen)
    }
    
    // ============================================================
    // ATURAN 2: H1 INFORMATIF tanpa harga → EVERGREEN
    // ============================================================
    if (isMoneyLevel && h1Detection.isInformational && !h1Detection.isPrice && !h1Detection.hasYear) {
      console.warn(`⚠️ PERINGATAN: Halaman ${pageLevel} terdeteksi sebagai Money Level tapi H1 INFORMATIF TANPA HARGA!`);
      console.warn(`   → H1: "${h1Detection.h1Text}"`);
      console.warn(`   → Alasan: ${h1Detection.reason}`);
      console.warn(`   → Meng-override ke EVERGREEN (3 tahun)`);
      console.warn(`   → H1 TIDAK WAJIB tahun, TIDAK perlu update berkala`);
      
      document.body.classList.add('warning-h1-informational');
      
      return { 
        type: 'evergreen', 
        validityDays: 1095, 
        usePriceValidUntil: false, 
        allowPriceRange: false, 
        ctaIntensity: 'soft-medium',
        overridden: true,
        overrideReason: `H1 informatif tanpa harga: "${h1Detection.h1Text}" — ${h1Detection.reason}`
      };
    }
    
    // ============================================================
    // ATURAN 3: H1 mengandung HARGA → CEK TABEL HARGA
    // ============================================================
    if (isMoneyLevel && h1Detection.isPrice) {
      // Cek tabel harga
      const priceTableResult = hasPriceTable();
      
      if (priceTableResult.found) {
        console.log(`✅ H1 mengandung harga DAN ada tabel harga → NON-EVERGREEN`);
        console.log(`   → H1: "${h1Detection.h1Text}"`);
        console.log(`   → Alasan: ${h1Detection.reason} + tabel harga ditemukan`);
        // Gunakan aturan normal (non-evergreen)
      } else {
        console.warn(`⚠️ H1 mengandung harga TAPI TIDAK ADA TABEL HARGA!`);
        console.warn(`   → H1: "${h1Detection.h1Text}"`);
        console.warn(`   → Alasan: ${h1Detection.reason} tapi tidak ada tabel harga`);
        console.warn(`   → Meng-override ke EVERGREEN (konten informatif)`);
        
        document.body.classList.add('warning-h1-price-no-table');
        
        return { 
          type: 'evergreen', 
          validityDays: 1095, 
          usePriceValidUntil: false, 
          allowPriceRange: false, 
          ctaIntensity: 'soft-medium',
          overridden: true,
          overrideReason: `H1 mengandung harga tapi tidak ada tabel harga: "${h1Detection.h1Text}"`
        };
      }
    }
    
    // ============================================================
    // ATURAN 4: Default berdasarkan entity
    // ============================================================
    
    // JASA
    if (entityType === 'jasa') {
      const rule = JASA_RULES[pageLevel];
      if (rule) {
        console.log(`📌 Using JASA_RULES for ${pageLevel}`);
        return rule;
      }
      console.log(`📌 JASA pageLevel ${pageLevel} not found, using default`);
      return DEFAULT_RULE;
    }
    
    // SEWA
    if (entityType === 'sewa') {
      const rule = SEWA_RULES[pageLevel];
      if (rule) {
        console.log(`📌 Using SEWA_RULES for ${pageLevel}`);
        return rule;
      }
      console.log(`📌 SEWA pageLevel ${pageLevel} not found, using BASE_RULES`);
      const baseRule = BASE_PAGE_LEVEL_RULES[pageLevel];
      return baseRule || DEFAULT_RULE;
    }
    
    // PRODUK
    if (entityType === 'produk') {
      const rule = PRODUK_MATERIAL_RULES[pageLevel];
      if (rule) {
        console.log(`📌 Using PRODUK_RULES for ${pageLevel}`);
        return rule;
      }
      console.log(`📌 PRODUK pageLevel ${pageLevel} not found, using BASE_RULES`);
      const baseRule = BASE_PAGE_LEVEL_RULES[pageLevel];
      return baseRule || DEFAULT_RULE;
    }
    
    // MATERIAL
    if (entityType === 'material') {
      const rule = PRODUK_MATERIAL_RULES[pageLevel];
      if (rule) {
        console.log(`📌 Using MATERIAL_RULES for ${pageLevel}`);
        return rule;
      }
      console.log(`📌 MATERIAL pageLevel ${pageLevel} not found, using BASE_RULES`);
      const baseRule = BASE_PAGE_LEVEL_RULES[pageLevel];
      return baseRule || DEFAULT_RULE;
    }
    
    console.log(`📌 Using BASE_PAGE_LEVEL_RULES for ${pageLevel}`);
    return BASE_PAGE_LEVEL_RULES[pageLevel] || DEFAULT_RULE;
  }

  // ============================================================
  // 📌 FUNGSI UTAMA DETECT EVERGREEN
  // ============================================================
  async function detectEvergreen({ customDateModified = null } = {}) {
    console.log("🧩 detectEvergreen() v15.2 — Loading...");
    
    await waitForPageLevelDetector();
    
    const { pageLevel: rawPageLevel, entityType, detectorVersion, confidence, strategies, strategyCount } = getPageLevelAndEntityType();
    let pageLevel = rawPageLevel;
    
    console.log(`📌 Raw detection: pageLevel=${pageLevel}, entityType=${entityType}, detector=${detectorVersion}`);
    if (confidence) {
      console.log(`   🎯 Detection Confidence: ${confidence}% (${strategyCount} strategies)`);
    }
    
    // DETEKSI JENIS KONTEN BERDASARKAN H1 (PATOKAN UTAMA)
    const h1Detection = detectContentTypeByH1();
    console.log(`📊 H1 Detection Result: informational=${h1Detection.isInformational}, price=${h1Detection.isPrice}, hasYear=${h1Detection.hasYear}`);
    console.log(`   📝 H1: "${h1Detection.h1Text}"`);
    console.log(`   📌 Reason: ${h1Detection.reason}`);
    
    // Get appropriate rules with H1 detection
    const rule = getRulesByEntityType(entityType, pageLevel, h1Detection);
    const finalType = rule.type;
    const validityDays = rule.validityDays;
    const validityMs = validityDays * 86400000;
    const usePriceValidUntil = rule.usePriceValidUntil;
    const allowPriceRange = rule.allowPriceRange;
    const ctaIntensity = rule.ctaIntensity;
    const isOverridden = rule.overridden || false;
    const overrideReason = rule.overrideReason || null;
    
    console.log(`📌 Final Rule: pageLevel=${pageLevel}, type=${finalType}, validityDays=${validityDays}, ctaIntensity=${ctaIntensity}`);
    if (isOverridden) {
      console.warn(`   ⚠️ OVERRIDDEN: ${overrideReason}`);
    }
    
    await processMetaDates(customDateModified, finalType, validityMs, usePriceValidUntil, pageLevel, entityType, ctaIntensity, allowPriceRange, detectorVersion, confidence, strategies, strategyCount, isOverridden, overrideReason, h1Detection);
  }
  
  // ============================================================
  // 📌 FUNGSI PROSES META DATES
  // ============================================================
  async function processMetaDates(customDateModified, finalType, validityMs, usePriceValidUntil, pageLevel, entityType, ctaIntensity, allowPriceRange, detectorVersion, confidence, strategies, strategyCount, isOverridden, overrideReason, h1Detection) {
    
    let metaPublished = document.querySelector('meta[itemprop="datePublished"]');
    let metaModified = document.querySelector('meta[itemprop="dateModified"]');
    let metaNext = document.querySelector('meta[name="nextUpdate"]');

    const nowISO = new Date().toISOString();

    let datePublished = toISOWithTimezoneLocal(metaPublished?.content) || toISOWithTimezoneLocal(nowISO);
    let dateModified = toISOWithTimezoneLocal(customDateModified) || toISOWithTimezoneLocal(metaModified?.content) || datePublished;

    const publishedObj = new Date(datePublished);
    const modifiedObj = new Date(dateModified);
    if (modifiedObj < publishedObj) {
      dateModified = datePublished;
    }

    if (!metaPublished) {
      metaPublished = document.createElement("meta");
      metaPublished.setAttribute("itemprop", "datePublished");
      document.head.appendChild(metaPublished);
    }
    metaPublished.setAttribute("content", datePublished);

    if (!metaModified) {
      metaModified = document.createElement("meta");
      metaModified.setAttribute("itemprop", "dateModified");
      document.head.appendChild(metaModified);
    }
    metaModified.setAttribute("content", dateModified);

    let nextUpdate = toISOWithTimezoneLocal(new Date(new Date(dateModified).getTime() + validityMs));

    if (!metaNext) {
      metaNext = document.createElement("meta");
      metaNext.setAttribute("name", "nextUpdate");
      document.head.appendChild(metaNext);
    }
    metaNext.setAttribute("content", nextUpdate);

    // Schema Offer - priceValidUntil (hanya jika usePriceValidUntil = true DAN ada harga)
    if (usePriceValidUntil && h1Detection && h1Detection.isPrice) {
      document.querySelectorAll('[itemtype="http://schema.org/Offer"]').forEach(el => {
        el.setAttribute("priceValidUntil", nextUpdate);
      });
      console.log(`✅ priceValidUntil added to Offers → ${nextUpdate}`);
    } else {
      document.querySelectorAll('[itemtype="http://schema.org/Offer"]').forEach(el => {
        el.removeAttribute("priceValidUntil");
      });
      console.log(`✅ priceValidUntil removed (${finalType} content - no price in H1)`);
    }
    
    // Tambahkan class ke body
    document.body.classList.add(`page-level-${pageLevel}`);
    document.body.classList.add(`entity-type-${entityType}`);
    document.body.classList.add(`content-type-${finalType}`);
    document.body.classList.add(`cta-intensity-${ctaIntensity}`);
    
    if (allowPriceRange) {
      document.body.classList.add(`allow-price-range`);
    }
    
    // Tambahkan class untuk H1 detection
    if (h1Detection) {
      if (h1Detection.isInformational) {
        document.body.classList.add('h1-informational');
      }
      if (h1Detection.isPrice) {
        document.body.classList.add('h1-price');
      }
      if (h1Detection.hasYear) {
        document.body.classList.add('h1-has-year');
      }
    }
    
    if (isOverridden) {
      document.body.classList.add('overridden-evergreen');
    }

    // Dapatkan label validity (V37)
    let validityLabel = '';
    const validityDays = validityMs / 86400000;

    if (isOverridden) {
      validityLabel = `EVERGREEN (OVERRIDE) — ${validityDays} hari — ${entityType} / ${pageLevel} (H1 informatif tanpa harga)`;
      console.warn(`   ⚠️ OVERRIDE ACTIVE: ${validityLabel}`);
    } else if (finalType === 'evergreen') {
        if (validityDays >= 1095) validityLabel = 'EVERGREEN (3 tahun) — V37';
        else if (validityDays >= 730) validityLabel = 'EVERGREEN (2 tahun) — V37';
        else if (validityDays >= 365) validityLabel = 'EVERGREEN (1 tahun) — V37';
        else validityLabel = `EVERGREEN (${validityDays} hari) — V37`;
        
        if (entityType === 'jasa' && pageLevel === 'pillar') {
            validityLabel += ' - Jasa Konstruksi';
        } else if (entityType === 'sewa' && pageLevel === 'pillar') {
            validityLabel += ' - Sewa Alat Konstruksi';
        } else if (entityType === 'produk' && pageLevel === 'pillar') {
            validityLabel += ' - Produk Konstruksi';
        } else if (entityType === 'material' && pageLevel === 'pillar') {
            validityLabel += ' - Material Konstruksi';
        } else if (pageLevel === 'variant') {
            if (entityType === 'produk') validityLabel += ' - Spesifikasi Produk';
            else if (entityType === 'sewa') validityLabel += ' - Spesifikasi Alat';
            else validityLabel += ' - Varian Teknis';
        } else if (pageLevel === 'sub-pillar-tipe-2') {
            validityLabel += ' - Daftar/Kategori';
        } else if (pageLevel === 'sub-pillar-tipe-1') {
            validityLabel += ' - Perbandingan';
        }
        
    } else if (finalType === 'non-evergreen') {
        if (pageLevel === 'money-master') {
            if (entityType === 'jasa') validityLabel = `NON-EVERGREEN (${validityDays} hari) — V37 — JASA Master (Komersial 50% + Transaksional 50%)`;
            else if (entityType === 'sewa') validityLabel = `NON-EVERGREEN (${validityDays} hari) — V37 — Sewa Master (Transaksional 80%)`;
            else if (entityType === 'produk') validityLabel = `NON-EVERGREEN (${validityDays} hari) — V37 — Harga Master (Transaksional 80%)`;
            else if (entityType === 'material') validityLabel = `NON-EVERGREEN (${validityDays} hari) — V37 — Harga Material (Transaksional 80%)`;
            else validityLabel = `NON-EVERGREEN (${validityDays} hari) — V37 — Money Master`;
        } else if (pageLevel === 'money-page') {
            if (entityType === 'jasa') validityLabel = `NON-EVERGREEN (${validityDays} hari) — V37 — JASA Page (Komersial 50% + Transaksional 50%)`;
            else if (entityType === 'sewa') validityLabel = `NON-EVERGREEN (${validityDays} hari) — V37 — Sewa Detail (Transaksional 85%)`;
            else if (entityType === 'produk') validityLabel = `NON-EVERGREEN (${validityDays} hari) — V37 — Harga Detail (Transaksional 85%)`;
            else if (entityType === 'material') validityLabel = `NON-EVERGREEN (${validityDays} hari) — V37 — Harga Detail (Transaksional 85%)`;
            else validityLabel = `NON-EVERGREEN (${validityDays} hari) — V37 — Money Page`;
        } else if (pageLevel === 'money-child') {
            if (entityType === 'jasa') validityLabel = `NON-EVERGREEN (${validityDays} hari) — V37 — JASA Child (Komersial 50% + Transaksional 50%)`;
            else if (entityType === 'sewa') validityLabel = `NON-EVERGREEN (${validityDays} hari) — V37 — Sewa + Lokasi (Transaksional 90%)`;
            else if (entityType === 'produk') validityLabel = `NON-EVERGREEN (${validityDays} hari) — V37 — Harga + Lokasi (Transaksional 90%)`;
            else if (entityType === 'material') validityLabel = `NON-EVERGREEN (${validityDays} hari) — V37 — Harga + Lokasi (Transaksional 90%)`;
            else validityLabel = `NON-EVERGREEN (${validityDays} hari) — V37 — Money Child`;
        } else {
            validityLabel = `NON-EVERGREEN (${validityDays} hari) — V37 — ${entityType}/${pageLevel}`;
        }
        
        // Tambahan untuk tahun
        if (h1Detection && h1Detection.hasYear) {
          validityLabel += ' — ⚠️ H1 mengandung TAHUN (wajib non-evergreen)';
        } else {
          validityLabel += ' — ⚠️ H1 WAJIB mengandung tahun berjalan';
        }
        
    } else {
        validityLabel = `${finalType.toUpperCase()} (${validityDays} hari) — ${entityType} / ${pageLevel}`;
    }
    
    // Global exposure
    window.AEDMetaDates = {
      type: finalType,
      entityType: entityType,
      pageLevel: pageLevel,
      datePublished,
      dateModified,
      nextUpdate,
      validityDays: validityMs / 86400000,
      usePriceValidUntil,
      ctaIntensity,
      allowPriceRange,
      detectorVersion: detectorVersion || 'v15.2',
      detectionConfidence: confidence || null,
      detectionStrategies: strategies || null,
      detectionStrategyCount: strategyCount || null,
      isOverridden: isOverridden || false,
      overrideReason: overrideReason || null,
      h1Detection: h1Detection || null
    };

    window.EvergreenDetectorResults = window.AEDMetaDates;

    console.log(`✅ ${finalType.toUpperCase()} ACTIVE:`, window.AEDMetaDates);
    console.log(`📋 SEO Rules Applied (V37) for ${window.location.hostname}:`);
    console.log(`   - Page Level: ${pageLevel}`);
    console.log(`   - Entity Type: ${entityType}`);
    console.log(`   - Content Type: ${validityLabel}`);
    console.log(`   - CTA Intensity: ${ctaIntensity}`);
    console.log(`   - Allow Price Range: ${allowPriceRange}`);
    console.log(`   - Use Price Valid Until: ${usePriceValidUntil}`);
    console.log(`   - Next Update: ${nextUpdate}`);
    console.log(`   - H1: "${h1Detection?.h1Text || '(no h1)'}"`);
    console.log(`   - H1 Type: ${h1Detection?.hasYear ? 'HAS_YEAR' : h1Detection?.isInformational ? 'INFORMATIONAL' : h1Detection?.isPrice ? 'PRICE' : 'UNKNOWN'}`);
    console.log(`   - H1 Reason: ${h1Detection?.reason || 'N/A'}`);
    if (isOverridden) {
      console.warn(`   ⚠️ OVERRIDDEN: ${overrideReason}`);
    }
    if (confidence) {
      console.log(`   - Detection Confidence: ${confidence}%`);
    }
    console.log(`🧩 detectEvergreen() v15.2 — FINISHED ✅`);
  }

  window.detectEvergreen = detectEvergreen;
  window.__detectEvergreenReady = true;
  window.dispatchEvent(new Event("detectEvergreenReady"));
  
  console.log("✅ Smart Evergreen Detector v15.2 ready (V37 rules + H1-based with year & table validation)");
  
})();
