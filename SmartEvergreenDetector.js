/* ============================================================
 🧠 Smart Evergreen Detector v13.0 — UNTUK betonjayareadymix.com
    Dengan aturan SEO untuk semua entity type
============================================================ */

(function () {
  if (window.detectEvergreen) return;

  // ============================================================
  // 📌 ATURAN SEO PER PAGE LEVEL
  // ============================================================
  const PAGE_LEVEL_RULES = {
    'pillar': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft' },
    'sub-pillar-tipe-2': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft-medium' },
    'sub-pillar-tipe-1': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'variant': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'sub-variant': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'money-master': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: false, allowPriceRange: true, ctaIntensity: 'hard' },
    'money-page': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: true, allowPriceRange: false, ctaIntensity: 'hard' },
    'money-child': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: true, allowPriceRange: false, ctaIntensity: 'very-hard' }
  };

  const JASA_RULES = {
    'money-master': { type: 'flexible', validityDays: 90, usePriceValidUntil: false, allowPriceRange: true, ctaIntensity: 'medium-hard' },
    'money-page': { type: 'flexible', validityDays: 90, usePriceValidUntil: false, allowPriceRange: true, ctaIntensity: 'medium-hard' },
    'money-child': { type: 'flexible', validityDays: 90, usePriceValidUntil: false, allowPriceRange: true, ctaIntensity: 'medium-hard' }
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
      if (window.__pageLevelDetectorReady && window.pageLevelDetector) {
        resolve();
      } else {
        window.addEventListener("pageLevelDetectorReady", () => resolve(), { once: true });
      }
    });
  }

  // ============================================================
  // 📌 FUNGSI UTAMA DETECT EVERGREEN
  // ============================================================
  async function detectEvergreen({ customDateModified = null } = {}) {
    console.log("🧩 detectEvergreen() v13.0 — Loading...");
    
    await waitForPageLevelDetector();
    
    let pageLevel = window.pageLevelDetector.detect();
    const entityType = window.pageLevelDetector.detectEntityType();
    
    console.log(`📌 Raw detection: pageLevel=${pageLevel}, entityType=${entityType}`);
    
    // Koreksi untuk JASA
    let ruleKey = pageLevel;
    let finalEntityType = entityType;
    
    if (entityType === 'jasa' && (pageLevel === 'money-master' || pageLevel === 'money-page' || pageLevel === 'money-child')) {
      if (pageLevel === 'money-master') {
        pageLevel = 'money-page';
        console.log(`📌 Converted money-master to money-page for JASA`);
      }
      ruleKey = pageLevel;
      const rule = JASA_RULES[ruleKey] || DEFAULT_RULE;
      finalEntityType = 'jasa';
      
      const finalType = rule.type;
      const validityDays = rule.validityDays;
      const validityMs = validityDays * 86400000;
      const usePriceValidUntil = rule.usePriceValidUntil;
      
      console.log(`📌 JASA Rule: pageLevel=${pageLevel}, type=${finalType}, validityDays=${validityDays}`);
      
      await processMetaDates(customDateModified, finalType, validityMs, usePriceValidUntil, pageLevel, finalEntityType);
      return;
    }
    
    // Aturan untuk PRODUK, MATERIAL, SEWA
    const rule = PAGE_LEVEL_RULES[ruleKey] || DEFAULT_RULE;
    const finalType = rule.type;
    const validityDays = rule.validityDays;
    const validityMs = validityDays * 86400000;
    const usePriceValidUntil = rule.usePriceValidUntil;
    
    console.log(`📌 Rule: pageLevel=${pageLevel}, entityType=${entityType}, type=${finalType}, validityDays=${validityDays}`);
    
    await processMetaDates(customDateModified, finalType, validityMs, usePriceValidUntil, pageLevel, entityType);
  }
  
  // ============================================================
  // 📌 FUNGSI PROSES META DATES
  // ============================================================
  async function processMetaDates(customDateModified, finalType, validityMs, usePriceValidUntil, pageLevel, entityType) {
    
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

    // Schema Offer - priceValidUntil
    if (usePriceValidUntil) {
      document.querySelectorAll('[itemtype="http://schema.org/Offer"]').forEach(el => {
        el.setAttribute("priceValidUntil", nextUpdate);
      });
      console.log(`✅ priceValidUntil added to Offers → ${nextUpdate}`);
    } else {
      document.querySelectorAll('[itemtype="http://schema.org/Offer"]').forEach(el => {
        el.removeAttribute("priceValidUntil");
      });
      console.log(`✅ priceValidUntil removed (${finalType} content)`);
    }
    
    // Tambahkan class ke body
    document.body.classList.add(`page-level-${pageLevel}`);
    document.body.classList.add(`entity-type-${entityType}`);
    document.body.classList.add(`content-type-${finalType}`);

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
      ctaIntensity: (PAGE_LEVEL_RULES[pageLevel] || DEFAULT_RULE).ctaIntensity
    };

    window.EvergreenDetectorResults = window.AEDMetaDates;

    console.log(`✅ ${finalType.toUpperCase()} ACTIVE:`, window.AEDMetaDates);
    console.log(`📋 SEO Rules Applied for ${window.location.hostname}:`);
    console.log(`   - Page Level: ${pageLevel}`);
    console.log(`   - Entity Type: ${entityType}`);
    console.log(`   - Content Type: ${finalType === 'evergreen' ? 'EVERGREEN (3 tahun)' : finalType === 'non-evergreen' ? 'NON-EVERGREEN (30 hari)' : 'FLEXIBLE (90 hari)'}`);
    console.log(`   - Next Update: ${nextUpdate}`);
  }

  window.detectEvergreen = detectEvergreen;
  window.__detectEvergreenReady = true;
  window.dispatchEvent(new Event("detectEvergreenReady"));
  
  console.log("✅ Smart Evergreen Detector v13.0 ready");
  
})();
