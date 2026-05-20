/* ============================================================
 🧠 Smart Evergreen Detector v13.3 — UNTUK betonjayareadymix.com
    ✅ COMPLETE RULES untuk SEMUA ENTITY
    ✅ FIXED: JASA rules (money-master=90, money-page=60, money-child=45)
    ✅ FIXED: SEWA rules lengkap dengan sub-pillar & variant
    ✅ FIXED: PRODUK rules (variant 365 hari, bukan 1095)
    ✅ FIXED: MATERIAL rules (sama dengan PRODUK)
    ✅ ADD: sub-pillar-tipe-1 & sub-pillar-tipe-2 untuk semua entity
    ✅ Support multiple detector versions (v19, v18, v17, legacy)
============================================================ */

(function () {
  if (window.detectEvergreen) return;

  // ============================================================
  // 📌 ATURAN SEO DASAR (UNTUK PRODUK, MATERIAL, SEWA)
  // ============================================================
  const BASE_PAGE_LEVEL_RULES = {
    // EVERGREEN LEVELS
    'pillar': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft' },
    'sub-pillar-tipe-2': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft-medium' },
    'sub-pillar-tipe-1': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'sub-variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    
    // MONEY LEVELS
    'money-master': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: false, allowPriceRange: true, ctaIntensity: 'hard' },
    'money-page': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: true, allowPriceRange: false, ctaIntensity: 'hard' },
    'money-child': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: true, allowPriceRange: false, ctaIntensity: 'very-hard' }
  };

  // ============================================================
  // 📌 ATURAN KHUSUS PRODUK & MATERIAL
  // ============================================================
  const PRODUK_MATERIAL_RULES = {
    'variant': { type: 'evergreen', validityDays: 365, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'sub-variant': { type: 'evergreen', validityDays: 365, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'pillar': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft' },
    'sub-pillar-tipe-2': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft-medium' },
    'sub-pillar-tipe-1': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'money-master': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: false, allowPriceRange: true, ctaIntensity: 'hard' },
    'money-page': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: true, allowPriceRange: false, ctaIntensity: 'hard' },
    'money-child': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: true, allowPriceRange: false, ctaIntensity: 'very-hard' }
  };

  // ============================================================
  // 📌 ATURAN KHUSUS SEWA
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
  // 📌 ATURAN KHUSUS JASA (FIXED v13.3)
  // ============================================================
  // Konsep JASA:
  // 1. Money-Master: Layanan jasa umum (tanpa harga spesifik) → 90 hari
  // 2. Money-Page: Halaman dengan informasi harga jasa → 60 hari
  // 3. Money-Child: Halaman jasa + lokasi → 45 hari
  // 4. Pillar: Halaman utama jasa → 3 tahun (evergreen)
  const JASA_RULES = {
    'pillar': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft' },
    'sub-pillar-tipe-2': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft-medium' },
    'sub-pillar-tipe-1': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'sub-variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'money-master': { type: 'flexible', validityDays: 90, usePriceValidUntil: false, allowPriceRange: true, ctaIntensity: 'medium-hard' },
    'money-page': { type: 'flexible', validityDays: 60, usePriceValidUntil: false, allowPriceRange: true, ctaIntensity: 'hard' },
    'money-child': { type: 'flexible', validityDays: 45, usePriceValidUntil: false, allowPriceRange: true, ctaIntensity: 'very-hard' }
  };

  const DEFAULT_RULE = { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft' };

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
      // Cek semua versi detector
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
      
      // Listen ke multiple events
      const onReady = () => {
        console.log("✅ Page Level Detector ready (event)");
        resolve();
      };
      
      window.addEventListener("pageLevelDetectorv19Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorv19Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorv18Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorReady", onReady, { once: true });
      
      // Fallback timeout 10 detik
      setTimeout(() => {
        if (window.pageLevelDetectorv19 || window.pageLevelDetectorV18 || window.pageLevelDetector) {
          console.log("✅ Page Level Detector found on timeout fallback");
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
  // 📌 GET PAGE LEVEL DARI DETECTOR (SUPPORT MULTI VERSION)
  // ============================================================
  function getPageLevelAndEntityType() {
    let pageLevel = 'pillar';
    let entityType = 'produk';
    let detectorVersion = 'unknown';
    
    // PRIORITAS v19
    if (window.pageLevelDetectorv19 && typeof window.pageLevelDetectorv19.detect === 'function') {
      try {
        pageLevel = window.pageLevelDetectorv19.detect();
        entityType = window.pageLevelDetectorv19.detectEntityType();
        detectorVersion = 'v19';
        console.log(`📌 [${detectorVersion}] Detected: pageLevel=${pageLevel}, entityType=${entityType}`);
        return { pageLevel, entityType, detectorVersion };
      } catch(e) { console.warn("v19 error:", e); }
    }
    
    // v18
    if (window.pageLevelDetectorV18 && typeof window.pageLevelDetectorV18.detect === 'function') {
      try {
        pageLevel = window.pageLevelDetectorV18.detect();
        entityType = window.pageLevelDetectorV18.detectEntityType();
        detectorVersion = 'v18';
        console.log(`📌 [${detectorVersion}] Detected: pageLevel=${pageLevel}, entityType=${entityType}`);
        return { pageLevel, entityType, detectorVersion };
      } catch(e) { console.warn("v18 error:", e); }
    }
    
    // v17
    if (window.pageLevelDetectorV17 && typeof window.pageLevelDetectorV17.detect === 'function') {
      try {
        pageLevel = window.pageLevelDetectorV17.detect();
        entityType = window.pageLevelDetectorV17.detectEntityType();
        detectorVersion = 'v17';
        console.log(`📌 [${detectorVersion}] Detected: pageLevel=${pageLevel}, entityType=${entityType}`);
        return { pageLevel, entityType, detectorVersion };
      } catch(e) { console.warn("v17 error:", e); }
    }
    
    // legacy
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
  // 📌 GET RULES BERDASARKAN ENTITY TYPE DAN PAGE LEVEL
  // ============================================================
  function getRulesByEntityType(entityType, pageLevel) {
    console.log(`📌 Getting rules for entityType=${entityType}, pageLevel=${pageLevel}`);
    
    // JASA
    if (entityType === 'jasa') {
      const rule = JASA_RULES[pageLevel];
      if (rule) {
        console.log(`📌 Using JASA_RULES for ${pageLevel}`);
        return rule;
      }
      console.log(`📌 JASA pageLevel ${pageLevel} not found in JASA_RULES, using default`);
      return DEFAULT_RULE;
    }
    
    // SEWA
    if (entityType === 'sewa') {
      const rule = SEWA_RULES[pageLevel];
      if (rule) {
        console.log(`📌 Using SEWA_RULES for ${pageLevel}`);
        return rule;
      }
      console.log(`📌 SEWA pageLevel ${pageLevel} not found in SEWA_RULES, using BASE_RULES`);
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
      console.log(`📌 PRODUK pageLevel ${pageLevel} not found in PRODUK_RULES, using BASE_RULES`);
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
      console.log(`📌 MATERIAL pageLevel ${pageLevel} not found in MATERIAL_RULES, using BASE_RULES`);
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
    console.log("🧩 detectEvergreen() v13.3 — Loading...");
    
    await waitForPageLevelDetector();
    
    // Get page level and entity type from available detector
    const { pageLevel: rawPageLevel, entityType, detectorVersion } = getPageLevelAndEntityType();
    let pageLevel = rawPageLevel;
    
    console.log(`📌 Raw detection: pageLevel=${pageLevel}, entityType=${entityType}, detector=${detectorVersion}`);
    
    // Get appropriate rules
    const rule = getRulesByEntityType(entityType, pageLevel);
    const finalType = rule.type;
    const validityDays = rule.validityDays;
    const validityMs = validityDays * 86400000;
    const usePriceValidUntil = rule.usePriceValidUntil;
    const allowPriceRange = rule.allowPriceRange;
    const ctaIntensity = rule.ctaIntensity;
    
    console.log(`📌 Final Rule: pageLevel=${pageLevel}, type=${finalType}, validityDays=${validityDays}, ctaIntensity=${ctaIntensity}`);
    
    await processMetaDates(customDateModified, finalType, validityMs, usePriceValidUntil, pageLevel, entityType, ctaIntensity, allowPriceRange, detectorVersion);
  }
  
  // ============================================================
  // 📌 FUNGSI PROSES META DATES
  // ============================================================
  async function processMetaDates(customDateModified, finalType, validityMs, usePriceValidUntil, pageLevel, entityType, ctaIntensity, allowPriceRange, detectorVersion) {
    
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

    // Schema Offer - priceValidUntil (khusus untuk konten yang mencantumkan harga)
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

    // Dapatkan label validity untuk logging
    let validityLabel = '';
    if (finalType === 'evergreen') {
      if (validityDays === 1095) validityLabel = 'EVERGREEN (3 tahun)';
      else if (validityDays === 730) validityLabel = 'EVERGREEN (2 tahun)';
      else if (validityDays === 365) validityLabel = 'EVERGREEN (1 tahun)';
      else validityLabel = `EVERGREEN (${validityDays} hari)`;
    } else if (finalType === 'non-evergreen') {
      validityLabel = `NON-EVERGREEN (${validityDays} hari)`;
    } else if (finalType === 'flexible') {
      if (validityDays === 90) validityLabel = 'FLEXIBLE (90 hari - JASA Master)';
      else if (validityDays === 60) validityLabel = 'FLEXIBLE (60 hari - JASA Page)';
      else if (validityDays === 45) validityLabel = 'FLEXIBLE (45 hari - JASA Child)';
      else validityLabel = `FLEXIBLE (${validityDays} hari)`;
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
      detectorVersion: detectorVersion || 'v13.3'
    };

    window.EvergreenDetectorResults = window.AEDMetaDates;

    console.log(`✅ ${finalType.toUpperCase()} ACTIVE:`, window.AEDMetaDates);
    console.log(`📋 SEO Rules Applied for ${window.location.hostname}:`);
    console.log(`   - Page Level: ${pageLevel}`);
    console.log(`   - Entity Type: ${entityType}`);
    console.log(`   - Content Type: ${validityLabel}`);
    console.log(`   - CTA Intensity: ${ctaIntensity}`);
    console.log(`   - Allow Price Range: ${allowPriceRange}`);
    console.log(`   - Use Price Valid Until: ${usePriceValidUntil}`);
    console.log(`   - Next Update: ${nextUpdate}`);
    console.log(`🧩 detectEvergreen() v13.3 — FINISHED ✅`);
  }

  window.detectEvergreen = detectEvergreen;
  window.__detectEvergreenReady = true;
  window.dispatchEvent(new Event("detectEvergreenReady"));
  
  console.log("✅ Smart Evergreen Detector v13.3 ready (Complete rules for all entities)");
  
})();
