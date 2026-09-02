/* ============================================================
 🧠 Smart Evergreen Detector v14.0 — UNTUK betonjayareadymix.com
    ✅ SINKRON dengan V37 FULL SITE AUTO ARCHITECTURE
    ✅ COMPLETE RULES untuk SEMUA ENTITY (V37 Standard)
    ✅ SUPPORT PLD v22.x, v20.x, v19.0, v18, v17, legacy
    ✅ FIXED: JASA rules (money-master=30, money-page=30, money-child=30) — NON-EVERGREEN
    ✅ FIXED: PRODUK rules (variant 730 hari, sub-variant 730 hari)
    ✅ FIXED: MATERIAL rules (sama dengan PRODUK)
    ✅ ADD: Deteksi konten tanpa harga → override ke evergreen
    ✅ ADD: Peringatan untuk Money Page tanpa harga
    ✅ ENHANCED: Mendapatkan confidence score dari PLD v22.x
============================================================ */

(function () {
  if (window.detectEvergreen) return;

  // ============================================================
  // 📌 ATURAN V37 — BASE RULES (UNTUK SEMUA ENTITY)
  // ============================================================
  const BASE_PAGE_LEVEL_RULES = {
    // EVERGREEN LEVELS (V37)
    'pillar': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft' },
    'sub-pillar-tipe-2': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft-medium' },
    'sub-pillar-tipe-1': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'sub-variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    
    // MONEY LEVELS (V37 — NON-EVERGREEN)
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
    // V37: Variant = 730 hari (2 tahun)
    'variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    // V37: Sub-Variant = 730 hari (2 tahun)
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
  // 📌 ATURAN V37 — JASA (NON-EVERGREEN, BUKAN FLEXIBLE)
  // ============================================================
  // V37: JASA Money Level = NON-EVERGREEN (30 hari)
  // - Money-Master: Komersial (50%) + Transaksional (50%)
  // - Money-Page: Komersial (50%) + Transaksional (50%)
  // - Money-Child: Komersial (50%) + Transaksional (50%)
  const JASA_RULES = {
    'pillar': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft' },
    'sub-pillar-tipe-2': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft-medium' },
    'sub-pillar-tipe-1': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'sub-variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    // V37: JASA Money Level = NON-EVERGREEN (30 hari)
    'money-master': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: false, allowPriceRange: true, ctaIntensity: 'hard' },
    'money-page': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: true, allowPriceRange: false, ctaIntensity: 'hard' },
    'money-child': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: true, allowPriceRange: false, ctaIntensity: 'very-hard' }
  };

  const DEFAULT_RULE = { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft' };

  // ============================================================
  // 📌 FUNGSI DETEKSI KEYWORD HARGA (BARU)
  // ============================================================
  function detectPriceInContent() {
    const priceKeywords = ['harga', 'biaya', 'tarif', 'estimasi', 'rp', 'rupiah', 
                           'per meter', 'per lembar', 'per batang', 'per kubik', 
                           'per m', 'per lbr', 'per buah', 'per unit'];
    const bodyText = document.body.innerText.toLowerCase();
    const h1 = document.querySelector('h1');
    const h1Text = h1 ? h1.innerText.toLowerCase() : '';
    const metaDesc = document.querySelector('meta[name="description"]');
    const descText = metaDesc ? metaDesc.getAttribute('content').toLowerCase() : '';
    
    const allText = bodyText + ' ' + h1Text + ' ' + descText;
    const hasPrice = priceKeywords.some(keyword => allText.includes(keyword));
    
    // Hitung jumlah kemunculan keyword harga
    let count = 0;
    priceKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = allText.match(regex);
      if (matches) count += matches.length;
    });
    
    // Cek apakah ada angka dengan format Rupiah (Rp X.XXX.XXX)
    const hasRupiahFormat = /rp\s*[\d.,]+/gi.test(allText);
    
    return { 
      hasPrice, 
      count, 
      h1HasPrice: priceKeywords.some(k => h1Text.includes(k)),
      hasRupiahFormat
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
  // 📌 GET RULES BERDASARKAN ENTITY TYPE DAN PAGE LEVEL (V37)
  // ============================================================
  function getRulesByEntityType(entityType, pageLevel, hasPrice) {
    console.log(`📌 Getting rules for entityType=${entityType}, pageLevel=${pageLevel}, hasPrice=${hasPrice}`);
    
    // CEK: Jika Money Level tapi tidak ada harga → override ke evergreen
    const isMoneyLevel = ['money-master', 'money-page', 'money-child'].includes(pageLevel);
    
    if (isMoneyLevel && !hasPrice) {
      console.warn(`⚠️ PERINGATAN: Halaman ${pageLevel} terdeteksi sebagai Money Level tapi TIDAK ADA keyword harga!`);
      console.warn(`   → Meng-override ke EVERGREEN (konten informatif tanpa harga)`);
      console.warn(`   → H1 TIDAK WAJIB tahun, TIDAK perlu update berkala`);
      console.warn(`   → Rekomendasi: Ubah page level ke Pillar/Sub-Pillar/Variant jika konten informatif`);
      
      // Body class untuk peringatan
      document.body.classList.add('warning-money-no-price');
      
      return { 
        type: 'evergreen', 
        validityDays: 1095, 
        usePriceValidUntil: false, 
        allowPriceRange: false, 
        ctaIntensity: 'soft-medium',
        overridden: true,
        overrideReason: 'Money level detected but no price keywords found'
      };
    }
    
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
    
    // Default
    console.log(`📌 Using BASE_PAGE_LEVEL_RULES for ${pageLevel}`);
    return BASE_PAGE_LEVEL_RULES[pageLevel] || DEFAULT_RULE;
  }

  // ============================================================
  // 📌 FUNGSI UTAMA DETECT EVERGREEN
  // ============================================================
  async function detectEvergreen({ customDateModified = null } = {}) {
    console.log("🧩 detectEvergreen() v14.0 — Loading...");
    
    await waitForPageLevelDetector();
    
    // Get page level and entity type
    const { pageLevel: rawPageLevel, entityType, detectorVersion, confidence, strategies, strategyCount } = getPageLevelAndEntityType();
    let pageLevel = rawPageLevel;
    
    console.log(`📌 Raw detection: pageLevel=${pageLevel}, entityType=${entityType}, detector=${detectorVersion}`);
    if (confidence) {
      console.log(`   🎯 Detection Confidence: ${confidence}% (${strategyCount} strategies)`);
    }
    
    // DETEKSI KEYWORD HARGA (BARU)
    const priceDetection = detectPriceInContent();
    console.log(`💰 Price Detection: hasPrice=${priceDetection.hasPrice}, count=${priceDetection.count}, hasRupiahFormat=${priceDetection.hasRupiahFormat}`);
    
    // Get appropriate rules with price detection
    const rule = getRulesByEntityType(entityType, pageLevel, priceDetection.hasPrice);
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
    
    await processMetaDates(customDateModified, finalType, validityMs, usePriceValidUntil, pageLevel, entityType, ctaIntensity, allowPriceRange, detectorVersion, confidence, strategies, strategyCount, isOverridden, overrideReason, priceDetection);
  }
  
  // ============================================================
  // 📌 FUNGSI PROSES META DATES (DIPERBAIKI)
  // ============================================================
  async function processMetaDates(customDateModified, finalType, validityMs, usePriceValidUntil, pageLevel, entityType, ctaIntensity, allowPriceRange, detectorVersion, confidence, strategies, strategyCount, isOverridden, overrideReason, priceDetection) {
    
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

    // Schema Offer - priceValidUntil (hanya jika usePriceValidUntil = true)
    if (usePriceValidUntil) {
      document.querySelectorAll('[itemtype="http://schema.org/Offer"]').forEach(el => {
        el.setAttribute("priceValidUntil", nextUpdate);
      });
      console.log(`✅ priceValidUntil added to Offers → ${nextUpdate}`);
    } else {
      document.querySelectorAll('[itemtype="http://schema.org/Offer"]').forEach(el => {
        el.removeAttribute("priceValidUntil");
      });
      console.log(`✅ priceValidUntil removed (${finalType} content - no fixed pricing)`);
    }
    
    // Tambahkan class ke body
    document.body.classList.add(`page-level-${pageLevel}`);
    document.body.classList.add(`entity-type-${entityType}`);
    document.body.classList.add(`content-type-${finalType}`);
    document.body.classList.add(`cta-intensity-${ctaIntensity}`);
    
    if (allowPriceRange) {
      document.body.classList.add(`allow-price-range`);
    }
    
    // Tambahkan class untuk price detection
    if (priceDetection && priceDetection.hasPrice) {
      document.body.classList.add('has-price');
    } else {
      document.body.classList.add('no-price');
    }
    
    if (isOverridden) {
      document.body.classList.add('overridden-evergreen');
    }

    // Dapatkan label validity (V37)
    let validityLabel = '';
    const validityDays = validityMs / 86400000;

    // CEK OVERRIDE
    if (isOverridden) {
      validityLabel = `EVERGREEN (OVERRIDE) — ${validityDays} hari — ${entityType} / ${pageLevel} (tidak ada harga)`;
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
        // V37: NON-EVERGREEN untuk semua Money Level
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
        
        // Tambahkan catatan H1 wajib tahun
        validityLabel += ' — ⚠️ H1 WAJIB mengandung tahun berjalan';
        
    } else {
        // Fallback
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
      detectorVersion: detectorVersion || 'v14.0',
      detectionConfidence: confidence || null,
      detectionStrategies: strategies || null,
      detectionStrategyCount: strategyCount || null,
      isOverridden: isOverridden || false,
      overrideReason: overrideReason || null,
      priceDetection: priceDetection || null
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
    console.log(`   - Has Price: ${priceDetection?.hasPrice || false} (count: ${priceDetection?.count || 0})`);
    if (isOverridden) {
      console.warn(`   ⚠️ OVERRIDDEN: ${overrideReason}`);
    }
    if (confidence) {
      console.log(`   - Detection Confidence: ${confidence}%`);
    }
    console.log(`🧩 detectEvergreen() v14.0 — FINISHED ✅`);
  }

  window.detectEvergreen = detectEvergreen;
  window.__detectEvergreenReady = true;
  window.dispatchEvent(new Event("detectEvergreenReady"));
  
  console.log("✅ Smart Evergreen Detector v14.0 ready (V37 rules + price detection)");
  
})();
