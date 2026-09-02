/* ============================================================
 🧠 Smart Evergreen Detector v15.0 — UNTUK betonjayareadymix.com
    ✅ SINKRON dengan V37 FULL SITE AUTO ARCHITECTURE
    ✅ COMPLETE RULES untuk SEMUA ENTITY (V37 Standard)
    ✅ SUPPORT PLD v22.x, v20.x, v19.0, v18, v17, legacy
    ✅ FIXED: JASA rules (money-master=30, money-page=30, money-child=30) — NON-EVERGREEN
    ✅ FIXED: PRODUK rules (variant 730 hari, sub-variant 730 hari)
    ✅ FIXED: MATERIAL rules (sama dengan PRODUK)
    ✅ ADD: Deteksi JENIS KONTEN (Informasi vs Harga)
    ✅ ADD: Override otomatis untuk konten informatif
    ✅ ADD: Deteksi tabel harga vs tabel spesifikasi
    ✅ ADD: Logika gabungan untuk halaman Jasa + Harga
    ✅ ENHANCED: Hierarki berdasarkan V37
============================================================ */

(function () {
  if (window.detectEvergreen) return;

  // ============================================================
  // 📌 ATURAN V37 — BASE RULES (UNTUK SEMUA ENTITY)
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
  // 📌 ATURAN V37 — JASA (NON-EVERGREEN)
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
  // 📌 FUNGSI DETEKSI JENIS KONTEN (BARU — V15.0)
  // ============================================================
  function detectContentType() {
    const bodyText = document.body.innerText.toLowerCase();
    const h1 = document.querySelector('h1');
    const h1Text = h1 ? h1.innerText.toLowerCase() : '';
    const allText = bodyText + ' ' + h1Text;
    
    // ============================================================
    // 1. CEK TABEL HARGA vs TABEL SPESIFIKASI
    // ============================================================
    const tables = document.querySelectorAll('table');
    let hasPriceTable = false;
    let hasSpecTable = false;
    let tableCount = 0;
    
    tables.forEach(table => {
      const tableText = table.innerText.toLowerCase();
      tableCount++;
      
      // Tabel HARGA: ada kolom "harga", "biaya", "estimasi", "rp" + angka
      if (tableText.match(/harga|biaya|estimasi|rp|rupiah/i) && tableText.match(/[\d.,]+/)) {
        hasPriceTable = true;
      }
      
      // Tabel SPESIFIKASI: ada kolom "spesifikasi", "ukuran", "mutu", "komponen", "keterangan"
      if (tableText.match(/spesifikasi|ukuran|mutu|komponen|keterangan|standar|dimensi/i)) {
        hasSpecTable = true;
      }
    });
    
    // ============================================================
    // 2. CEK HEADING: apakah ada "Harga" di H1/H2?
    // ============================================================
    const headings = document.querySelectorAll('h1, h2, h3');
    let hasPriceHeading = false;
    let hasEduHeading = false;
    
    headings.forEach(h => {
      const text = h.innerText.toLowerCase();
      if (text.includes('harga') || text.includes('biaya') || text.includes('estimasi') || text.includes('rp')) {
        hasPriceHeading = true;
      }
      if (text.includes('panduan') || text.includes('spesifikasi') || text.includes('keunggulan') || 
          text.includes('cara memilih') || text.includes('tips') || text.includes('perbedaan') || 
          text.includes('jenis') || text.includes('apa itu')) {
        hasEduHeading = true;
      }
    });
    
    // ============================================================
    // 3. CEK KONTEN EDUKASI (kata kunci informatif)
    // ============================================================
    const eduKeywords = ['panduan', 'spesifikasi', 'keunggulan', 'cara memilih', 'tips', 
                         'perbedaan', 'jenis', 'apa itu', 'pengertian', 'informasi', 
                         'standar', 'mutu', 'ukuran', 'komponen', 'bahan', 'material'];
    let eduScore = 0;
    eduKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = allText.match(regex);
      if (matches) eduScore += matches.length;
    });
    
    // ============================================================
    // 4. CEK FORMAT RUPIAH (angka harga)
    // ============================================================
    const rupiahPattern = /Rp\s*[\d.,]+/gi;
    const rupiahMatches = allText.match(rupiahPattern);
    const hasRupiahFormat = rupiahMatches && rupiahMatches.length > 0;
    
    // ============================================================
    // 5. CEK SATUAN HARGA (per meter, per lembar)
    // ============================================================
    const unitPattern = /[\d.,]+\s*(per\s*(meter|m|lembar|lbr|batang|buah|unit|kg|ton|kubik|m³|m2|m²))/gi;
    const unitMatches = allText.match(unitPattern);
    const hasUnitPrice = unitMatches && unitMatches.length > 0;
    
    // ============================================================
    // 6. CEK APAKAH KONTEN JASA + HARGA (GABUNGAN)
    // ============================================================
    const jasaKeywords = ['jasa', 'layanan', 'kontraktor', 'pemasangan', 'borongan', 'renovasi'];
    let jasaScore = 0;
    jasaKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = allText.match(regex);
      if (matches) jasaScore += matches.length;
    });
    
    const isJasaContent = jasaScore >= 2;
    
    // ============================================================
    // 7. KESIMPULAN JENIS KONTEN
    // ============================================================
    // Konten INFORMATIF jika:
    // - Edu score >= 3
    // - TIDAK ada heading harga
    // - TIDAK ada tabel harga
    // - TIDAK ada format Rupiah
    const isInformational = eduScore >= 3 && !hasPriceHeading && !hasPriceTable && !hasRupiahFormat;
    
    // Konten HARGA jika:
    // - Ada tabel harga ATAU
    // - Ada heading harga ATAU
    // - Ada format Rupiah ATAU
    // - Ada satuan harga
    const isPriceContent = hasPriceTable || hasPriceHeading || hasRupiahFormat || hasUnitPrice;
    
    // Konten JASA + HARGA (gabungan) jika:
    // - Ada jasa keywords DAN ada indikasi harga
    const isJasaPriceContent = isJasaContent && isPriceContent;
    
    console.log('📊 Content Type Detection:', {
      isInformational,
      isPriceContent,
      isJasaContent,
      isJasaPriceContent,
      eduScore,
      hasPriceHeading,
      hasPriceTable,
      hasSpecTable,
      hasRupiahFormat,
      hasUnitPrice,
      tableCount,
      rupiahMatches: rupiahMatches ? rupiahMatches.length : 0,
      unitMatches: unitMatches ? unitMatches.length : 0
    });
    
    return {
      isInformational,
      isPriceContent,
      isJasaContent,
      isJasaPriceContent,
      eduScore,
      hasPriceHeading,
      hasPriceTable,
      hasSpecTable,
      hasRupiahFormat,
      hasUnitPrice,
      tableCount
    };
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
  function getRulesByEntityType(entityType, pageLevel, contentType) {
    console.log(`📌 Getting rules for entityType=${entityType}, pageLevel=${pageLevel}`);
    console.log(`   📊 Content Type: informational=${contentType.isInformational}, price=${contentType.isPriceContent}`);
    
    const isMoneyLevel = ['money-master', 'money-page', 'money-child'].includes(pageLevel);
    
    // ============================================================
    // ATURAN 1: JIKA KONTEN INFORMATIF (panduan, spesifikasi) → EVERGREEN
    // ============================================================
    if (isMoneyLevel && contentType.isInformational) {
      console.warn(`⚠️ PERINGATAN: Halaman ${pageLevel} terdeteksi sebagai Money Level tapi KONTEN INFORMATIF!`);
      console.warn(`   → Edu score: ${contentType.eduScore}`);
      console.warn(`   → Tidak ada heading harga, tidak ada tabel harga`);
      console.warn(`   → Meng-override ke EVERGREEN (3 tahun)`);
      console.warn(`   → H1 TIDAK WAJIB tahun, TIDAK perlu update berkala`);
      console.warn(`   → Rekomendasi: Ubah page level ke Pillar/Sub-Pillar/Variant`);
      
      document.body.classList.add('warning-informational-content');
      
      return { 
        type: 'evergreen', 
        validityDays: 1095, 
        usePriceValidUntil: false, 
        allowPriceRange: false, 
        ctaIntensity: 'soft-medium',
        overridden: true,
        overrideReason: 'Informational content detected (panduan/spesifikasi) — should be Pillar/Sub-Pillar'
      };
    }
    
    // ============================================================
    // ATURAN 2: JIKA KONTEN HARGA (tabel harga, Rp, satuan) → NON-EVERGREEN
    // ============================================================
    if (isMoneyLevel && contentType.isPriceContent) {
      console.log(`✅ Konten HARGA terdeteksi → NON-EVERGREEN (30 hari)`);
      console.log(`   → Has price table: ${contentType.hasPriceTable}`);
      console.log(`   → Has price heading: ${contentType.hasPriceHeading}`);
      console.log(`   → Has Rupiah format: ${contentType.hasRupiahFormat}`);
      console.log(`   → Has unit price: ${contentType.hasUnitPrice}`);
      // Gunakan aturan normal
    }
    
    // ============================================================
    // ATURAN 3: JIKA KONTEN JASA + HARGA (gabungan) → SESUAI ENTITY
    // ============================================================
    if (entityType === 'jasa' && contentType.isJasaPriceContent) {
      console.log(`📌 Konten JASA + HARGA (gabungan) terdeteksi`);
      console.log(`   → Menggunakan JASA_RULES dengan catatan: bisa digabung atau dipisah`);
      // Gunakan aturan JASA
    }
    
    // ============================================================
    // ATURAN 4: DEFAULT — gunakan aturan berdasarkan entity
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
    console.log("🧩 detectEvergreen() v15.0 — Loading...");
    
    await waitForPageLevelDetector();
    
    const { pageLevel: rawPageLevel, entityType, detectorVersion, confidence, strategies, strategyCount } = getPageLevelAndEntityType();
    let pageLevel = rawPageLevel;
    
    console.log(`📌 Raw detection: pageLevel=${pageLevel}, entityType=${entityType}, detector=${detectorVersion}`);
    if (confidence) {
      console.log(`   🎯 Detection Confidence: ${confidence}% (${strategyCount} strategies)`);
    }
    
    // DETEKSI JENIS KONTEN (BARU — V15.0)
    const contentType = detectContentType();
    console.log(`📊 Content Type: informational=${contentType.isInformational}, price=${contentType.isPriceContent}`);
    
    // Get appropriate rules with content type
    const rule = getRulesByEntityType(entityType, pageLevel, contentType);
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
    
    await processMetaDates(customDateModified, finalType, validityMs, usePriceValidUntil, pageLevel, entityType, ctaIntensity, allowPriceRange, detectorVersion, confidence, strategies, strategyCount, isOverridden, overrideReason, contentType);
  }
  
  // ============================================================
  // 📌 FUNGSI PROSES META DATES
  // ============================================================
  async function processMetaDates(customDateModified, finalType, validityMs, usePriceValidUntil, pageLevel, entityType, ctaIntensity, allowPriceRange, detectorVersion, confidence, strategies, strategyCount, isOverridden, overrideReason, contentType) {
    
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
    if (usePriceValidUntil && contentType && contentType.isPriceContent) {
      document.querySelectorAll('[itemtype="http://schema.org/Offer"]').forEach(el => {
        el.setAttribute("priceValidUntil", nextUpdate);
      });
      console.log(`✅ priceValidUntil added to Offers → ${nextUpdate}`);
    } else {
      document.querySelectorAll('[itemtype="http://schema.org/Offer"]').forEach(el => {
        el.removeAttribute("priceValidUntil");
      });
      console.log(`✅ priceValidUntil removed (${finalType} content - no price data)`);
    }
    
    // Tambahkan class ke body
    document.body.classList.add(`page-level-${pageLevel}`);
    document.body.classList.add(`entity-type-${entityType}`);
    document.body.classList.add(`content-type-${finalType}`);
    document.body.classList.add(`cta-intensity-${ctaIntensity}`);
    
    if (allowPriceRange) {
      document.body.classList.add(`allow-price-range`);
    }
    
    // Tambahkan class untuk jenis konten
    if (contentType) {
      if (contentType.isInformational) {
        document.body.classList.add('content-informational');
      }
      if (contentType.isPriceContent) {
        document.body.classList.add('content-price');
      }
      if (contentType.isJasaContent) {
        document.body.classList.add('content-jasa');
      }
      if (contentType.isJasaPriceContent) {
        document.body.classList.add('content-jasa-price');
      }
    }
    
    if (isOverridden) {
      document.body.classList.add('overridden-evergreen');
    }

    // Dapatkan label validity (V37)
    let validityLabel = '';
    const validityDays = validityMs / 86400000;

    if (isOverridden) {
      validityLabel = `EVERGREEN (OVERRIDE) — ${validityDays} hari — ${entityType} / ${pageLevel} (konten informatif)`;
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
        
        validityLabel += ' — ⚠️ H1 WAJIB mengandung tahun berjalan';
        
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
      detectorVersion: detectorVersion || 'v15.0',
      detectionConfidence: confidence || null,
      detectionStrategies: strategies || null,
      detectionStrategyCount: strategyCount || null,
      isOverridden: isOverridden || false,
      overrideReason: overrideReason || null,
      contentType: contentType || null
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
    console.log(`   - Content Info: informational=${contentType?.isInformational || false}, price=${contentType?.isPriceContent || false}`);
    if (isOverridden) {
      console.warn(`   ⚠️ OVERRIDDEN: ${overrideReason}`);
    }
    if (confidence) {
      console.log(`   - Detection Confidence: ${confidence}%`);
    }
    console.log(`🧩 detectEvergreen() v15.0 — FINISHED ✅`);
  }

  window.detectEvergreen = detectEvergreen;
  window.__detectEvergreenReady = true;
  window.dispatchEvent(new Event("detectEvergreenReady"));
  
  console.log("✅ Smart Evergreen Detector v15.0 ready (V37 rules + content type detection)");
  
})();
