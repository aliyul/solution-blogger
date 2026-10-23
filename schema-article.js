/**
 * 📄 Auto-Schema Generator v8.8-PATCH — ARTICLE SCHEMA + FAQ + BASE LAYER
 *
 * 🩹 PATCH-L (v8.8-PATCH):
 * ✅ Remove ALL optional chaining (?.) — 13 operator
 *    - Compatible Chrome 55+ (async/await requires Chrome 55)
 *    - Fix for Chrome 55-79 (where ?. causes SyntaxError)
 *    - Behavior IDENTICAL on Chrome 80+ (no regression)
 *
 * ✅ PRESERVED dari v8.8:
 * ✅ FIX-H10: Anti-duplikat base layer untuk halaman GABUNG
 * ✅ PRESERVED dari v8.7:
 * ✅ FIX-H5: TechArticle untuk VARIANT
 * ✅ FIX-H6: GABUNG support (tertiary/contentFocus/note)
 * ✅ FIX-H7: hasStaticArticleSchema() anti-duplikat
 * ✅ FIX-H8: Baca data-schema-type-tertiary
 * ✅ FIX-H9: Cross-script FAQ detection
 * ✅ PRESERVED dari v8.6g:
 * ✅ FIX-F2: Re-read AEDMetaDates setelah hybridDateFinalReady
 * ✅ FIX-H1: Hapus escapeJSON() pre-stringify
 * ✅ FIX-H2: safeStringify()
 * ✅ FIX-H3: HYBRID_FINAL_TIMEOUT 1500 ms
 * ✅ FIX-H4: Canonical / og:url order
 * ✅ PRESERVED dari v8.6f:
 * ✅ FIX-F: Sync dateModifiedFinal
 * ✅ FIX-E: Entity Base Layer
 * ✅ FIX-D: LocalBusiness + WebPage node
 * ✅ FIX-C: FAQPage dari PLD
 * ✅ FIX-A: Cloudinary fallback
 * ✅ FIX-B: Title source H1
 * ✅ FIX-G1: OWN_IDS lengkap
 * ✅ FIX-G2: Create-if-not-exists #auto-schema
 * ✅ FIX-G3: URL cleaning
 * ✅ FIX-G4: LEVEL_COLORS
 *
 * 🔥 SINKRON dengan:
 * - PLD v23.9.10 / v23.9.11+ (tertiary support)
 * - AED v17.5.6
 * - HybridDateModified v10.3a-fix6
 * - Hybrid v5.7e-LITE
 * - Universal v7.36i-LITE
 */

(function() {
  "use strict";

  if (window.__AUTOSCHEMA_ARTICLE_VERSION === "8.8") {
    console.log("[AutoSchema Article v8.8] ⏭️ Already loaded — skip");
    return;
  }
  window.__AUTOSCHEMA_ARTICLE_VERSION = "8.8";

  const IS_MOBILE = /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(navigator.userAgent);
  const IS_SLOW_DEVICE = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
                         (navigator.deviceMemory && navigator.deviceMemory <= 4);
  const URL_DEBUG = window.location.search.indexOf('schema-debug=1') !== -1;
  const DEBUG_MODE = URL_DEBUG || (!IS_MOBILE && !IS_SLOW_DEVICE);

  const CONFIG = {
    DEBUG: DEBUG_MODE,
    AED_TIMEOUT: 2000,
    HYBRID_FINAL_TIMEOUT: 1500,
    PLD_TIMEOUT: 1000,
    BREADCRUMB_TIMEOUT: 1000,
    BREADCRUMB_GENERATED_TIMEOUT: 2000,

    SITE_NAME: "Beton Jaya Readymix",
    SITE_URL: "https://www.betonjayareadymix.com",
    CURRENT_YEAR: new Date().getFullYear(),

    LOCALBUSINESS_ID: "https://www.betonjayareadymix.com#localbusiness",
    WEBPAGE_ID_SUFFIX: "#webpage",

    AUTHOR: {
      type: "Organization",
      name: "Beton Jaya Readymix",
      url: "https://www.betonjayareadymix.com"
    },

    DEFAULT_ARTICLE_IMAGE: {
      url: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png",
      width: 1200,
      height: 630
    },

    MIN_EDITORIAL_WORDS: 300,
    MIN_EDITORIAL_PARAGRAPHS: 2,
    MIN_EDITORIAL_HEADINGS: 2,

    MAX_FAQ_ITEMS: 8,
    MIN_FAQ_FOR_SCHEMA: 2,

    MIN_IMAGE_WIDTH: 400,
    ARTICLE_IMG_WIDTH: 1200,
    ARTICLE_IMG_HEIGHT: 675,
    SKIP_WORD_COUNT: 300,
    VERSION: "8.8"
  };

  const AREA_SERVED = [
    { "@type": "Country", "name": "Indonesia" },
    { "@type": "AdministrativeArea", "name": "DKI Jakarta" },
    { "@type": "AdministrativeArea", "name": "Kota Bogor" },
    { "@type": "AdministrativeArea", "name": "Kabupaten Bogor" },
    { "@type": "AdministrativeArea", "name": "Kota Depok" },
    { "@type": "AdministrativeArea", "name": "Kota Tangerang" },
    { "@type": "AdministrativeArea", "name": "Kabupaten Tangerang" },
    { "@type": "AdministrativeArea", "name": "Kota Tangerang Selatan" },
    { "@type": "AdministrativeArea", "name": "Kota Bekasi" },
    { "@type": "AdministrativeArea", "name": "Kabupaten Bekasi" },
    { "@type": "AdministrativeArea", "name": "Kabupaten Karawang" },
    { "@type": "AdministrativeArea", "name": "Kota Surabaya" }
  ];

  const CONTACT_POINT = {
    "@type": "ContactPoint",
    "telephone": "+6281299842508",
    "contactType": "customer service",
    "areaServed": "ID",
    "availableLanguage": ["id"]
  };

  const KNOWS_ABOUT = [
    "Jasa Bor Sumur", "Jasa Bor Horizontal", "Jasa Bor Manual",
    "Jasa Bor Hidrolik", "Jasa Bor Rotary", "Jasa Bor Auger",
    "Jasa Bor Sumur Dalam", "Jasa Bor Sumur Dangkal",
    "Jasa Pengeboran Tanah", "Jasa Pengeboran Air Tanah",
    "Jasa Bore Pile", "Jasa Strauss Pile", "Jasa Borongan Bore Pile",
    "Jasa Borongan Strauss Pile", "Jasa Tiang Pancang", "Jasa Pondasi Dalam",
    "Jasa Pondasi Bore Pile", "Jasa Pondasi Strauss Pile",
    "Jasa Coring Beton", "Jasa Coring Dinding", "Jasa Coring Lantai",
    "Jasa Coring Plat", "Jasa Coring Kolom", "Jasa Coring Pondasi",
    "Jasa Coring Balok", "Jasa Core Drill", "Jasa Cutting Beton",
    "Jasa Bongkar Beton", "Jasa Injeksi Beton", "Jasa Grouting",
    "Jasa Waterproofing", "Jasa Perbaikan Beton", "Jasa Cor Beton",
    "Jasa Pasang Pagar Panel", "Jasa Pasang Pagar BRC", "Jasa Pasang Pagar Beton",
    "Jasa Pasang Kanopi", "Jasa Pasang Plafon", "Jasa Pasang Plafon Gypsum",
    "Jasa Pasang Plafon PVC", "Jasa Pasang Kusen", "Jasa Pasang Kusen Aluminium",
    "Jasa Pasang Pintu", "Jasa Pasang Jendela", "Jasa Pasang Baja Ringan",
    "Jasa Pasang Rangka Atap", "Jasa Pasang Atap", "Jasa Pasang Paving Block",
    "Jasa Pasang Saluran Precast", "Jasa Pasang U-Ditch", "Jasa Pasang Box Culvert",
    "Jasa Pasang Kansteen", "Jasa Pasang Keramik", "Jasa Pasang Granit",
    "Jasa Pasang Marmer", "Jasa Pasang Kaca", "Jasa Pasang Teralis",
    "Jasa Pasang Railing",
    "Jasa Renovasi Rumah", "Jasa Renovasi Bangunan", "Jasa Bangun Rumah",
    "Jasa Bangun Ruko", "Jasa Bangun Gudang", "Jasa Bangun Pagar",
    "Jasa Plester Dinding", "Jasa Acian", "Jasa Pengecatan",
    "Beton Readymix", "Beton Cor", "Beton K-175", "Beton K-200",
    "Beton K-225", "Beton K-250", "Beton K-300", "Beton K-350",
    "Beton K-400", "Beton K-500", "Beton Mutu Tinggi", "Beton Struktural",
    "Pagar Panel Beton", "Pagar Panel Precast", "Pagar Beton Precast",
    "Saluran Precast", "Saluran U-Ditch", "Saluran Box Culvert",
    "Saluran Drainase Precast", "Kansteen Beton", "Kansteen Precast",
    "Paving Block", "Panel Beton Precast", "Road Barrier Beton",
    "Material Konstruksi", "Material Bangunan", "Besi Beton",
    "Besi Ulir", "Besi Polos", "Besi Wiremesh", "Semen",
    "Pasir Beton", "Pasir Cor", "Agregat", "Split", "Batu Belah",
    "Batu Kali", "Mortar", "Bata Ringan", "Bata Merah", "Batako", "Hebel",
    "Sewa Alat Bor", "Sewa Mesin Coring", "Sewa Alat Berat",
    "Sewa Concrete Pump", "Sewa Vibrator Beton", "Sewa Pompa Beton",
    "Sewa Excavator", "Sewa Crane", "Sewa Scaffolding",
    "Konstruksi", "Jasa Konstruksi", "Kontraktor", "Pondasi",
    "Geoteknik", "Infrastruktur", "Drainase", "Struktur Beton",
    "Teknik Sipil", "Bangunan", "Renovasi", "Pembangunan"
  ];

  const STATIC_PAGES = [
    '/p/hubungi-kami.html', '/p/portofolio.html', '/p/disclaimer.html',
    '/p/privacy-policy.html', '/p/terms-of-service.html', '/p/useful-links.html',
    '/p/about.html', '/p/sitemap.html'
  ];

  function log(msg, type = "INFO") {
    if (!CONFIG.DEBUG) return;
    const icons = {
      INFO: "📘", WARN: "⚠️", ERROR: "❌", SUCCESS: "✅",
      FOCUS: "🎯", SKIP: "⏭️", BREADCRUMB: "🍞", AED: "⚡",
      PLD: "🔷", KATEGORI: "🏷️", SCHEMA: "🔗", ARTICLE: "📄",
      IMG: "🖼️", EDITORIAL: "✍️", SYNC: "🔗", URL: "🌐",
      CONFLICT: "🚨", CLOUD: "☁️", FAQ: "❓", STATIC: "🗿", KNOWS: "🎓",
      HYBRID: "🕐", JSON: "🧩", FIX: "🔧", GABUNG: "🔀", GATE: "🚦"
    };
    console.log(`${icons[type] || "📘"} [AutoSchema v8.8] ${msg}`);
  }

  function getPLDVersion() {
    if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.version) {
      var v = String(window.pageLevelDetectorv22.version);
      if (v.indexOf("23.9.11") === 0) return { version: v, family: "v23-lite", label: "v23.9.11-lite" };
      if (v.indexOf("23.9.10") === 0) return { version: v, family: "v23-lite", label: "v23.9.10-lite" };
      if (v.indexOf("23.9.9a") === 0) return { version: v, family: "v23-lite", label: "v23.9.9a-lite" };
      if (v.indexOf("23.9.9") === 0) return { version: v, family: "v23-lite", label: "v23.9.9-lite" };
      if (v.indexOf("23.9.8") === 0) return { version: v, family: "v23-lite", label: "v23.9.8-lite" };
      if (v.indexOf("23.") === 0) return { version: v, family: "v23", label: "v23.0.0" };
      if (v.indexOf("22.") === 0) return { version: v, family: "v22", label: "v22.x" };
      return { version: v, family: "unknown", label: "v" + v };
    }
    if (window.pageLevelDetectorv20) return { version: "20.x", family: "v20", label: "v20.x" };
    if (window.pageLevelDetectorv19) return { version: "19.x", family: "v19", label: "v19.x" };
    if (window.pageLevelDetectorV18) return { version: "18.x", family: "v18", label: "v18" };
    if (window.pageLevelDetectorV17) return { version: "17.x", family: "v17", label: "v17" };
    if (window.pageLevelDetector) return { version: "legacy", family: "legacy", label: "legacy" };
    return { version: "none", family: "none", label: "none" };
  }

  function cleanBreadcrumbText(text) {
    if (!text) return '';
    return String(text).replace(/[›»>→←«‹|/]/g, '').replace(/\s+/g, ' ').trim();
  }

  function waitForBreadcrumbGenerated(timeout = CONFIG.BREADCRUMB_GENERATED_TIMEOUT) {
    return new Promise((resolve) => {
      const flagReady = document.body.getAttribute('data-breadcrumb-ready');
      if (flagReady === 'true') {
        const parentName = document.body.getAttribute('data-breadcrumb-parent');
        const parentUrl = document.body.getAttribute('data-breadcrumb-parent-url');
        log(`✅ Breadcrumb READY (flag): parent="${parentName}"`, "SUCCESS");
        resolve({
          parentName: cleanBreadcrumbText(parentName) || 'Parent Page',
          parentUrl: parentUrl || location.origin,
          source: 'breadcrumb-flag',
          allParents: []
        });
        return;
      }

      let resolved = false;
      const onReady = (e) => {
        if (resolved) return;
        resolved = true;
        const parentName = document.body.getAttribute('data-breadcrumb-parent');
        const parentUrl = document.body.getAttribute('data-breadcrumb-parent-url');
        log(`✅ Breadcrumb GENERATED: parent="${parentName}"`, "SUCCESS");
        resolve({
          parentName: cleanBreadcrumbText(parentName) || 'Parent Page',
          parentUrl: parentUrl || location.origin,
          source: 'breadcrumb-event',
          allParents: [],
          // 🔥 PATCH-L: e?.detail → e && e.detail
          detail: e && e.detail ? e.detail : null
        });
      };

      window.addEventListener('breadcrumbGenerated', onReady, { once: true });

      const startTime = Date.now();
      const interval = setInterval(() => {
        const flag = document.body.getAttribute('data-breadcrumb-ready');
        if (flag === 'true') {
          clearInterval(interval);
          onReady({ detail: null });
          return;
        }
        if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          window.removeEventListener('breadcrumbGenerated', onReady);
          if (!resolved) {
            resolved = true;
            log(`⏰ Breadcrumb timeout (${timeout}ms)`, "WARN");
            resolve(null);
          }
        }
      }, 200);
    });
  }

  function getParentFromBreadcrumbReady(breadcrumbData, currentUrl) {
    const parentFromFlag = document.body.getAttribute('data-breadcrumb-parent');
    const parentUrlFromFlag = document.body.getAttribute('data-breadcrumb-parent-url');

    if (parentFromFlag && parentUrlFromFlag) {
      return {
        parentUrl: parentUrlFromFlag,
        parentName: cleanBreadcrumbText(parentFromFlag),
        source: 'breadcrumb-flag',
        allParents: []
      };
    }

    return {
      parentUrl: location.origin,
      parentName: 'Home',
      source: 'fallback-origin',
      allParents: []
    };
  }

  function waitForAEDMetaDates(timeout = CONFIG.AED_TIMEOUT) {
    return new Promise((resolve) => {
      if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
        resolve(window.AEDMetaDates);
        return;
      }

      const onReady = () => {
        resolve(window.AEDMetaDates && window.AEDMetaDates.dateModified ? window.AEDMetaDates : null);
      };
      window.addEventListener("detectEvergreenReady", onReady, { once: true });

      const startTime = Date.now();
      const interval = setInterval(() => {
        if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
          clearInterval(interval);
          resolve(window.AEDMetaDates);
          return;
        }
        if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          window.removeEventListener("detectEvergreenReady", onReady);

          const fallbackDate = (window.AEDMetaDates && window.AEDMetaDates.datePublished)
                            || new Date().toISOString();

          log("⚠️ AED timeout — fallback aman (anti-spoofing)", "WARN");

          resolve({
            datePublished: fallbackDate,
            dateModified: fallbackDate
          });
        }
      }, 100);
    });
  }

  // ═══════════════════════════════════════════════════════════
  // FIX-F / FIX-F2: WAIT FOR HYBRID dateModifiedFinal
  // 🔥 PATCH-L: remove ?. (2 instances)
  // ═══════════════════════════════════════════════════════════
  function waitForHybridDateFinal(timeout = CONFIG.HYBRID_FINAL_TIMEOUT) {
    return new Promise((resolve) => {
      if (window.__HYBRID_DATE_FINAL_READY && window.AEDMetaDates && window.AEDMetaDates.dateModifiedFinal) {
        log(`✅ Hybrid dateModifiedFinal READY (instant): ${window.AEDMetaDates.dateModifiedFinal}`, "HYBRID");
        resolve(true);
        return;
      }

      let resolved = false;
      const finish = (ok) => {
        if (resolved) return;
        resolved = true;
        resolve(ok);
      };

      const onReady = () => {
        log(`✅ Hybrid dateModifiedFinal READY (event)`, "HYBRID");
        finish(true);
      };
      window.addEventListener('hybridDateFinalReady', onReady, { once: true });

      const startTime = Date.now();
      const interval = setInterval(() => {
        if (window.__HYBRID_DATE_FINAL_READY && window.AEDMetaDates && window.AEDMetaDates.dateModifiedFinal) {
          clearInterval(interval);
          window.removeEventListener('hybridDateFinalReady', onReady);
          log(`✅ Hybrid dateModifiedFinal READY (polling)`, "HYBRID");
          finish(true);
          return;
        }
        if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          window.removeEventListener('hybridDateFinalReady', onReady);
          log(`⏰ Hybrid dateModifiedFinal timeout (${timeout}ms) — fallback ke AED dateModified`, "WARN");
          finish(false);
        }
      }, 100);
    });
  }

  function waitForPageLevelDetector() {
    return new Promise((resolve) => {
      if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
        resolve(true);
        return;
      }
      const onReady = () => resolve(true);
      window.addEventListener("pageLevelDetectorv22Ready", onReady, { once: true });
      setTimeout(() => {
        resolve(!!window.pageLevelDetectorv22);
      }, CONFIG.PLD_TIMEOUT);
    });
  }

  function detectContentFocus(pageLevel, entityType) {
    if (window.AEDMetaDates && window.AEDMetaDates.contentFocus) {
      return String(window.AEDMetaDates.contentFocus).toLowerCase();
    }
    const bodyFocus = document.body.getAttribute('data-content-focus');
    if (bodyFocus) return bodyFocus.toLowerCase();
    if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detectContentFocus === 'function') {
      try {
        const pldFocus = window.pageLevelDetectorv22.detectContentFocus(pageLevel, entityType);
        if (pldFocus) return String(pldFocus).toLowerCase();
      } catch(e) {}
    }
    return null;
  }

  function getKategori(contentFocus) {
    if (window.AEDMetaDates && window.AEDMetaDates.pldKategori) {
      return String(window.AEDMetaDates.pldKategori).toUpperCase();
    }
    const bodyKategori = document.body.getAttribute('data-kategori');
    if (bodyKategori) return bodyKategori.toUpperCase();
    if (contentFocus) {
      const map = {
        'informasi': 'EVERGREEN',
        'harga': 'NON-EVERGREEN',
        'commercial': 'NON-EVERGREEN',
        'gabung': 'NON-EVERGREEN'
      };
      return map[String(contentFocus).toLowerCase()] || null;
    }
    return null;
  }

  function getEntitySubType() {
    return document.body.getAttribute('data-entity-sub-type') || null;
  }

  function getPLDSchemaHint() {
    const primary   = (document.body.getAttribute('data-schema-type-primary')   || '').trim();
    const secondary = (document.body.getAttribute('data-schema-type-secondary') || '').trim();
    const tertiary  = (document.body.getAttribute('data-schema-type-tertiary')  || '').trim();
    const note      = (document.body.getAttribute('data-schema-type-note')      || '').trim();
    const hint = { primary, secondary, tertiary, note };
    log(`🔗 PLD hint → primary=${primary || '(none)'} | secondary=${secondary || '(none)'} | tertiary=${tertiary || '(none)'} | note=${note || '(none)'}`, "SCHEMA");
    return hint;
  }

  function shouldSkipBaseLayer() {
  const hint = getPLDSchemaHint();

  if (hint.primary !== 'Service' && hint.primary !== 'Product') {
    return false;
  }

  // 🔥 FIX-H10-EXT: Skip base layer SELALU ketika primary = Service/Product,
  // karena Universal/Hybrid sudah generate LocalBusiness + WebPage
  const bodyFocus = (document.body.getAttribute('data-content-focus') || '').toUpperCase();
  const tertiaryArticle = (hint.tertiary === 'Article');
  const isGabungFocus = (bodyFocus === 'GABUNG');

  log(`🛡️ Base layer SKIP — primary=${hint.primary} (base layer di-handle Universal/Hybrid) | tertiary=${hint.tertiary || '-'} | focus=${bodyFocus} | GABUNG=${isGabungFocus || tertiaryArticle}`, "GABUNG");
  return true;
}
  
  // 🔥 PATCH-L: remove ?. in contentLength
  function shouldSkipPage() {
    const currentPath = window.location.pathname;

    const isHomepage = currentPath === '/' || currentPath === '/index.html' || currentPath === '';
    if (isHomepage) {
      log(`⏭️ SKIP: HOMEPAGE`, "SKIP");
      return true;
    }

    const isStaticPage = STATIC_PAGES.some(page => currentPath.includes(page));
    if (isStaticPage) {
      log(`⏭️ SKIP: STATIC PAGE`, "SKIP");
      return true;
    }

    const hasMainContent = document.querySelector('.post-body.entry-content, .post-body, article, main, section');
    const hasH1 = document.querySelector('h1');
    // 🔥 PATCH-L: document.body.innerText?.trim()?.length || 0 → (document.body.innerText || '').trim().length
    const contentLength = (document.body.innerText || '').trim().length;
    const isContentPage = hasMainContent && hasH1 && contentLength > CONFIG.SKIP_WORD_COUNT;

    if (!isContentPage) {
      log(`⏭️ SKIP: TANPA KONTEN UTAMA (${contentLength} kar)`, "SKIP");
      return true;
    }

    log(`✅ Halaman LAYAK: ${currentPath}`, "SUCCESS");
    return false;
  }

  async function getPageLevelAndEntityType() {
    const bodyLevel = document.body.getAttribute('data-page-level');
    const bodyEntity = document.body.getAttribute('data-entity-type');

    if (bodyLevel && bodyEntity) {
      return { pageLevel: bodyLevel, entityType: bodyEntity, source: 'body-attribute' };
    }

    if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
      try {
        return {
          pageLevel: window.pageLevelDetectorv22.detect(),
          entityType: window.pageLevelDetectorv22.detectEntityType(),
          source: `PLD ${getPLDVersion().label}`
        };
      } catch(e) {}
    }

    return { pageLevel: null, entityType: null, source: 'unavailable' };
  }

  function shouldGenerateArticleSchema(pageLevel, entityType, contentFocus) {
    const hint = getPLDSchemaHint();
    const bodyFocus = (document.body.getAttribute('data-content-focus') || contentFocus || '').toUpperCase();

    if (hasStaticArticleSchema()) {
      log(`⏭️ Article SKIP — static Article/TechArticle sudah ada di HTML`, "STATIC");
      return false;
    }

    if (hint.primary === 'Article') {
      log(`✅ Article WAJIB — PLD primary=Article`, "ARTICLE");
      return true;
    }

    if (hint.secondary === 'TechArticle') {
      const ENTITIES_HANDLED_BY_OTHER = ['jasa', 'sewa', 'desain', 'produk', 'material'];
      if (ENTITIES_HANDLED_BY_OTHER.includes(entityType)) {
        log(`⏭️ TechArticle di-handle Universal/Hybrid (entity=${entityType}) — SKIP`, "SKIP");
        return false;
      }
      log(`✅ TechArticle — entity "${entityType}" tidak di-handle script lain`, "ARTICLE");
      return true;
    }

    const tertiaryArticle = (hint.tertiary === 'Article');
    const noteWithOffers = /(^|,)with-offers($|,)/.test(hint.note) && !/without-offers/.test(hint.note);
    const isGabungFocus = (bodyFocus === 'GABUNG');

    if (tertiaryArticle) {
      log(`✅ Article WAJIB — PLD tertiary=Article (GABUNG explicit)`, "GABUNG");
      return true;
    }
    if (isGabungFocus && noteWithOffers) {
      log(`✅ Article WAJIB — GABUNG + with-offers hint (fallback)`, "GABUNG");
      return true;
    }
    if (isGabungFocus) {
      log(`✅ Article WAJIB — contentFocus=GABUNG (fallback)`, "GABUNG");
      return true;
    }

    const mandatoryArticleLevels = ['pillar', 'sub-pillar-tipe-2', 'sub-pillar-tipe-1'];
    if (mandatoryArticleLevels.includes(pageLevel)) {
      log(`✅ Article LAYAK (fallback legacy) untuk level: ${pageLevel}`, "ARTICLE");
      return true;
    }

    if (hint.primary === 'Service' || hint.primary === 'Product') {
      log(`⏭️ Article SKIP — primary=${hint.primary}, focus=${bodyFocus} (bukan GABUNG)`, "SKIP");
      return false;
    }

    if (hint.primary || hint.secondary) {
      log(`⏭️ Article SKIP — PLD hint tidak menunjuk Article`, "SKIP");
      return false;
    }

    const MONEY_LEVELS = ['money-master', 'money-page', 'money-child',
                          'variant', 'sub-variant'];
    if (MONEY_LEVELS.includes(pageLevel)) {
      log(`✅ Article LAYAK (fallback legacy) untuk level: ${pageLevel}`, "ARTICLE");
      return true;
    }

    log(`⏭️ Article TIDAK LAYAK: level="${pageLevel}"`, "SKIP");
    return false;
  }

  function isEditorialContent(contentElement) {
    if (!contentElement) {
      log("❌ Editorial check: contentElement NULL", "EDITORIAL");
      return false;
    }

    const text = contentElement.innerText || "";
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    if (wordCount < CONFIG.MIN_EDITORIAL_WORDS) {
      log(`❌ Editorial check: word count ${wordCount} < ${CONFIG.MIN_EDITORIAL_WORDS}`, "EDITORIAL");
      return false;
    }

    const paragraphs = contentElement.querySelectorAll("p").length;
    if (paragraphs < CONFIG.MIN_EDITORIAL_PARAGRAPHS) {
      log(`❌ Editorial check: paragraf ${paragraphs} < ${CONFIG.MIN_EDITORIAL_PARAGRAPHS}`, "EDITORIAL");
      return false;
    }

    const headings = contentElement.querySelectorAll("h2, h3").length;
    if (headings < CONFIG.MIN_EDITORIAL_HEADINGS) {
      log(`❌ Editorial check: headings ${headings} < ${CONFIG.MIN_EDITORIAL_HEADINGS}`, "EDITORIAL");
      return false;
    }

    log(`✅ Editorial check LOLOS: ${wordCount} kata, ${paragraphs} paragraf, ${headings} headings`, "EDITORIAL");
    return true;
  }

  function getArticleType(pageLevel) {
    const hint = getPLDSchemaHint();
    const path = window.location.pathname;

    if (hint.secondary === 'TechArticle') {
      log(`📄 Article type: TechArticle (dari PLD)`, "ARTICLE");
      return 'TechArticle';
    }
    if (hint.secondary === 'BlogPosting') {
      log(`📄 Article type: BlogPosting (dari PLD)`, "ARTICLE");
      return 'BlogPosting';
    }

    const isBloggerPage = path.indexOf('/p/') === 0;
    const isBloggerPost = /\/\d{4}\/\d{2}\//.test(path);

    log(`🌐 URL Pattern: ${isBloggerPage ? 'PAGE (/p/)' : isBloggerPost ? 'POST (/YYYY/MM/)' : 'UNKNOWN'}`, "URL");

    if (pageLevel === 'variant' || pageLevel === 'sub-variant') {
      return 'TechArticle';
    }

    if (isBloggerPage) {
      log(`📄 Article type: Article (halaman /p/)`, "ARTICLE");
      return 'Article';
    }

    if (isBloggerPost) {
      if (pageLevel === 'pillar') {
        log(`📄 Article type: BlogPosting (post /YYYY/MM/)`, "ARTICLE");
        return 'BlogPosting';
      }
      return 'Article';
    }

    return 'Article';
  }

  function cleanTextStandalone(str) {
    if (!str) return "";
    return str.toLowerCase().replace(/[^a-z0-9\s]/gi, " ").replace(/\s+/g, " ").trim();
  }

  function getAccurateWordCount(contentElement) {
    if (!contentElement) return 0;
    const text = cleanTextStandalone(contentElement.innerText || "");
    return text.split(/\s+/).filter(Boolean).length;
  }

  function getCleanKeywords(title) {
    const keywords = new Set();
    const stopwords = ["dan", "di", "ke", "dari", "yang", "untuk", "dengan",
                       "adalah", "atau", "ini", "itu", "kami", "anda", "pada",
                       "akan", "juga", "bisa", "dapat", "tidak", "oleh"];
    title.toLowerCase().split(/\s+/).forEach(word => {
      word = word.replace(/[^\w]/g, "").trim();
      if (word.length > 3 && !stopwords.includes(word)) keywords.add(word);
    });
    return Array.from(keywords).slice(0, 12).join(", ");
  }

  function safeStringify(obj, indent) {
    const json = JSON.stringify(obj, null, indent);
    return json
      .replace(/</g, "\\u003c")
      .replace(/\u2028/g, "\\u2028")
      .replace(/\u2029/g, "\\u2029");
  }

  var __articleImageCache = undefined;

  function findBestArticleImage() {
    if (__articleImageCache !== undefined) return __articleImageCache;

    const selectors = [".post-body.entry-content img", ".post-body img", "article img", "main img"];
    const seen = new Set();
    const candidates = [];

    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach(img => {
        if (seen.has(img)) return;
        seen.add(img);
        candidates.push(img);
      });
    }

    let processed = 0;
    for (const img of candidates) {
      if (processed++ > 30) break;
      const src = img.currentSrc || img.src || "";
      if (!src || src.startsWith("data:")) continue;
      const w = img.naturalWidth || img.width || 0;
      const h = img.naturalHeight || img.height || 0;
      if (w >= CONFIG.MIN_IMAGE_WIDTH && h > 0) {
        __articleImageCache = { url: src, width: w, height: h };
        return __articleImageCache;
      }
    }

    __articleImageCache = null;
    return null;
  }

  const CLOUDINARY_ARTICLE_CONFIG = {
    CLOUD_NAME: 'vagzz5sa',
    VERSION: 'v1789109159',
    FONT: 'Arial',
    WIDTH: 1200,
    HEIGHT: 630,
    QUALITY: 'q_auto:good',
    FORMAT: 'f_auto',
    DPR: 'dpr_auto',
    LEVEL_FILES: {
      'pillar': 'pillar',
      'sub-pillar-tipe-2': 'sp2',
      'sub-pillar-tipe-1': 'sp1',
      'money-master': 'mm',
      'money-page': 'mp',
      'money-child': 'mc',
      'variant': 'variant',
      'sub-variant': 'subvariant'
    },
    LEVEL_COLORS: {
      'pillar': 'FFD700', 'sub-pillar-tipe-2': 'FFD700', 'sub-pillar-tipe-1': 'FFD700',
      'money-master': 'FFFFFF', 'money-page': 'FFFFFF', 'money-child': 'FFFFFF',
      'variant': 'FFD700', 'sub-variant': 'FFD700'
    }
  };

  function buildCloudinaryArticleImage(title, pageLevel) {
    try {
      const cfg = CLOUDINARY_ARTICLE_CONFIG;
      const fileName = cfg.LEVEL_FILES[pageLevel] || 'sp1';
      const textColor = cfg.LEVEL_COLORS[pageLevel] || 'FFD700';
      const cleanTitle = String(title || 'Artikel')
        .substring(0, 40)
        .replace(/[^\w\s-]/g, '')
        .trim();
      const encodedText = encodeURIComponent(cleanTitle);

      return `https://res.cloudinary.com/${cfg.CLOUD_NAME}/image/upload/` +
             `e_colorize:100,co_rgb:${textColor},` +
             `l_text:${cfg.FONT}_40_bold:${encodedText},g_center,` +
             `c_fit,w_${cfg.WIDTH},h_${cfg.HEIGHT}/` +
             `${cfg.QUALITY},${cfg.FORMAT},${cfg.DPR}/` +
             `${cfg.VERSION}/${fileName}.webp`;
    } catch (e) {
      log(`⚠️ buildCloudinaryArticleImage error: ${e.message}`, "WARN");
      return null;
    }
  }

  function hasStaticFAQPageSchema() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const OWN_IDS = ['auto-schema-service', 'auto-schema-product', 'auto-schema'];

    for (const s of scripts) {
      if (s.id && OWN_IDS.includes(s.id)) continue;

      let json;
      try {
        json = JSON.parse(s.textContent || '{}');
      } catch (e) {
        continue;
      }

      if (json['@type'] === 'FAQPage') return true;
      if (Array.isArray(json['@type']) && json['@type'].includes('FAQPage')) return true;

      if (Array.isArray(json['@graph'])) {
        for (const node of json['@graph']) {
          if (!node) continue;
          if (node['@type'] === 'FAQPage') return true;
          if (Array.isArray(node['@type']) && node['@type'].includes('FAQPage')) return true;
        }
      }

      if (Array.isArray(json)) {
        for (const node of json) {
          if (!node) continue;
          if (node['@type'] === 'FAQPage') return true;
          if (Array.isArray(node['@type']) && node['@type'].includes('FAQPage')) return true;
        }
      }
    }
    return false;
  }

  function hasStaticArticleSchema() {
    const ARTICLE_TYPES = ['Article', 'TechArticle', 'BlogPosting', 'NewsArticle',
                           'ScholarlyArticle', 'Report', 'Review'];
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const OWN_IDS = ['auto-schema-service', 'auto-schema-product'];

    for (const s of scripts) {
      if (s.id && OWN_IDS.includes(s.id)) continue;
      if (s.id === 'auto-schema') continue;

      let json;
      try {
        json = JSON.parse(s.textContent || '{}');
      } catch (e) {
        continue;
      }

      if (typeof json['@type'] === 'string' && ARTICLE_TYPES.includes(json['@type'])) return true;
      if (Array.isArray(json['@type'])) {
        for (const t of json['@type']) {
          if (ARTICLE_TYPES.includes(t)) return true;
        }
      }

      if (Array.isArray(json['@graph'])) {
        for (const node of json['@graph']) {
          if (!node) continue;
          if (typeof node['@type'] === 'string' && ARTICLE_TYPES.includes(node['@type'])) return true;
          if (Array.isArray(node['@type'])) {
            for (const t of node['@type']) {
              if (ARTICLE_TYPES.includes(t)) return true;
            }
          }
        }
      }

      if (Array.isArray(json)) {
        for (const node of json) {
          if (!node) continue;
          if (typeof node['@type'] === 'string' && ARTICLE_TYPES.includes(node['@type'])) return true;
          if (Array.isArray(node['@type'])) {
            for (const t of node['@type']) {
              if (ARTICLE_TYPES.includes(t)) return true;
            }
          }
        }
      }
    }
    return false;
  }

  function extractFaqFromDOM() {
    const faqs = [];

    const mainContainer = document.querySelector('article, main, .post-body, .entry-content') || document.body;
    const faqItems = mainContainer.querySelectorAll('.faq-item');

    if (faqItems.length > 0) {
      log(`📋 Ditemukan ${faqItems.length} .faq-item`, 'FAQ');
      for (const item of faqItems) {
        const h = item.querySelector('h2, h3, h4');
        if (!h) continue;
        const qText = (h.innerText || '').trim().replace(/\s+/g, ' ');
        if (!qText || qText.length < 8 || qText.length > 200) continue;

        const p = item.querySelector('p');
        if (!p) continue;
        const aText = (p.innerText || '').trim().replace(/\s+/g, ' ').substring(0, 500);
        if (!aText || aText.length < 20) continue;

        faqs.push({
          "@type": "Question",
          "name": qText,
          "acceptedAnswer": { "@type": "Answer", "text": aText }
        });
        if (faqs.length >= CONFIG.MAX_FAQ_ITEMS) break;
      }
      log(`✅ FAQ dari .faq-item: ${faqs.length} pertanyaan`, 'FAQ');
      return faqs;
    }

    const container = document.querySelector('article, main, .post-body') || document.body;
    const headings = container.querySelectorAll('h3, h4');

    for (const h of headings) {
      const qText = (h.innerText || '').trim().replace(/\s+/g, ' ');
      if (!qText || qText.length < 8 || qText.length > 200) continue;

      if (/^\d+\.\s/.test(qText)) continue;
      if (/^section\s+\d/i.test(qText)) continue;

      const isQuestion = /\?$/.test(qText)
        || /^(apa|apakah|bagaimana|gimana|kenapa|mengapa|kapan|dimana|di mana|siapa|berapa|yang mana)\b/i.test(qText);

      if (!isQuestion) continue;

      let answerEl = h.nextElementSibling;
      while (answerEl && !/^(P|UL|OL|DIV|BLOCKQUOTE)$/.test(answerEl.tagName)) {
        answerEl = answerEl.nextElementSibling;
      }
      if (!answerEl) continue;

      const aText = (answerEl.innerText || '').trim().replace(/\s+/g, ' ').substring(0, 500);
      if (!aText || aText.length < 20) continue;

      faqs.push({
        "@type": "Question",
        "name": qText,
        "acceptedAnswer": { "@type": "Answer", "text": aText }
      });
      if (faqs.length >= CONFIG.MAX_FAQ_ITEMS) break;
    }

    log(`❓ FAQ extracted (fallback H3/H4): ${faqs.length} pertanyaan`, "FAQ");
    return faqs;
  }

  function getPageKeywordsForSchema() {
    var h1 = document.querySelector('h1') ? (document.querySelector('h1').innerText || '').toLowerCase() : '';
    var slug = window.location.pathname.replace(/\.html$/, '').replace(/-/g, ' ').split('/').pop().toLowerCase();
    var text = (h1 + ' ' + slug);

    text = text.replace(/\b(jasa|harga|biaya|terbaru|update|di|ke|dari|dan|yang|untuk|dengan|adalah|atau|ini|itu|kami|anda|pada|akan|juga|bisa|dapat|tidak|oleh|terbaik|murah|berkualitas|profesional|indonesia|jakarta|bogor|depok|tangerang|bekasi|jabodetabek)\b/g, ' ');

    return text.split(/\s+/).filter(function(w) { return w.length > 3; });
  }

  function getDynamicKnowsAbout(fullList, pageLevel, entityType) {
    if (['pillar', 'sub-pillar-tipe-1', 'sub-pillar-tipe-2'].indexOf(pageLevel) !== -1) {
      return fullList;
    }

    var keywords = getPageKeywordsForSchema();
    if (keywords.length === 0) return fullList.slice(0, 12);

    var matched = fullList.filter(function(item) {
      var itemLower = item.toLowerCase();
      return keywords.some(function(kw) {
        return itemLower.indexOf(kw) !== -1;
      });
    });

    if (matched.length < 3) {
      var specific = fullList.filter(function(i) {
        return i.toLowerCase().indexOf(entityType) !== -1;
      });
      if (specific.length >= 3) return specific.slice(0, 10);
      return fullList.slice(0, 10);
    }
    return matched.slice(0, 15);
  }

  function generateArticleSchema(data, dates, pageLevel, entityType, parentData, contentFocus, kategori) {
    const articleType = getArticleType(pageLevel);
    const focus = contentFocus || detectContentFocus(pageLevel, entityType);
    const kat = kategori || getKategori(focus);
    const entitySubType = getEntitySubType();

    let aboutName = "Konstruksi";
    if (entityType === "jasa") aboutName = "Jasa Konstruksi";
    else if (entityType === "sewa") aboutName = "Sewa Alat Konstruksi";
    else if (entityType === "produk") aboutName = "Produk Konstruksi";
    else if (entityType === "material") aboutName = "Material Konstruksi";
    else if (entityType === "desain") aboutName = "Desain Interior";

    let articleSection = "Informasi";
    if (pageLevel === 'pillar') articleSection = "Panduan Lengkap";
    else if (pageLevel === 'sub-pillar-tipe-2') articleSection = "Jenis & Kategori";
    else if (pageLevel === 'sub-pillar-tipe-1') articleSection = "Perbandingan & Analisis";
    else if (pageLevel === 'variant' || pageLevel === 'sub-variant') articleSection = "Spesifikasi Teknis";
    else if (pageLevel === 'money-master') articleSection = "Panduan Umum";
    else if (pageLevel === 'money-page') articleSection = "Panduan Spesifik";
    else if (pageLevel === 'money-child') articleSection = "Panduan Lokal";

    let isPartOf = null;
    if (parentData && parentData.parentUrl) {
      isPartOf = {
        "@type": "WebPage",
        "@id": parentData.parentUrl,
        "name": cleanBreadcrumbText(parentData.parentName)
      };
    }

    let articleImage = data.articleImage;
    let imageSource = 'none';

    if (!articleImage) {
      const titleForImage = data.h1Title || data.title || 'Artikel';
      const cloudUrl = buildCloudinaryArticleImage(titleForImage, pageLevel);

      if (cloudUrl) {
        articleImage = { url: cloudUrl, width: 1200, height: 630 };
        imageSource = 'cloudinary';
        log(`☁️ Image: Cloudinary fallback (${pageLevel})`, "CLOUD");
      } else {
        articleImage = CONFIG.DEFAULT_ARTICLE_IMAGE;
        imageSource = 'default-logo';
        log(`🖼️ Image: DEFAULT LOGO fallback`, "IMG");
      }
    } else {
      imageSource = 'from-page';
      log(`🖼️ Image: FROM PAGE`, "IMG");
    }

    const authorObj = { "@id": CONFIG.LOCALBUSINESS_ID };
    const publisherObj = { "@id": CONFIG.LOCALBUSINESS_ID };

    const schema = {
      "@type": articleType,
      "@id": data.url + "#article",

      "headline": data.title,
      "description": data.descMeta,

      "author": authorObj,
      "publisher": publisherObj,

      "datePublished": dates.datePublished,
      "dateModified": dates.dateModified,

      "mainEntityOfPage": {
        "@id": data.url + CONFIG.WEBPAGE_ID_SUFFIX
      },

      "wordCount": getAccurateWordCount(data.content),
      "keywords": getCleanKeywords(data.title),
      "inLanguage": "id-ID",
      "articleSection": articleSection,

      "about": {
        "@type": "Thing",
        "name": aboutName
      },

      "image": [{
        "@type": "ImageObject",
        "url": articleImage.url,
        "width": articleImage.width || CONFIG.ARTICLE_IMG_WIDTH,
        "height": articleImage.height || CONFIG.ARTICLE_IMG_HEIGHT
      }]
    };

    if (isPartOf) schema.isPartOf = isPartOf;
    if (entitySubType) schema.about.additionalType = entitySubType;

    schema.__debug = { imageSource, entityType, pageLevel };

    return schema;
  }

  function generateFaqSchema(faqs, data, dates) {
      return {
        "@type": "FAQPage",
        "@id": data.url + "#faq",
        "isPartOf": { "@id": data.url + CONFIG.WEBPAGE_ID_SUFFIX },
        "author": { "@id": CONFIG.LOCALBUSINESS_ID },
        "publisher": { "@id": CONFIG.LOCALBUSINESS_ID },
        "mainEntity": faqs.map(f => ({
        "@type": "Question",
        "name": f.name,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.acceptedAnswer.text
        }
      }))
    };
  }

  function generateLocalBusinessNode(pageLevel, entityType) {
    const dynamicKnowsAbout = getDynamicKnowsAbout(KNOWS_ABOUT, pageLevel, entityType);
    log(`🎓 Dynamic knowsAbout: ${dynamicKnowsAbout.length} item (dari total ${KNOWS_ABOUT.length})`, "KNOWS");

    return {
      "@type": ["LocalBusiness", "GeneralContractor"],
      "@id": CONFIG.LOCALBUSINESS_ID,
      "name": "Beton Jaya Readymix",
      "url": "https://www.betonjayareadymix.com",
        "telephone": "+6281299842508",
        "description": "Beton Jaya Readymix — penyedia layanan beton dan konstruksi di Jabodetabek, Karawang, Serang, Cilegon, dan Surabaya.",
        "priceRange": "Rp",
        "address": {
        "@type": "PostalAddress",
        "addressLocality": "Bogor",
        "addressRegion": "Jawa Barat",
        "addressCountry": "ID"
      },
      "openingHours": "Mo-Sa 08:00-17:00",
      "logo": CONFIG.DEFAULT_ARTICLE_IMAGE.url,
      "sameAs": [
        "https://www.facebook.com/betonjayareadymix",
        "https://www.instagram.com/betonjayareadymix"
      ],
      "areaServed": AREA_SERVED,
      "knowsAbout": dynamicKnowsAbout,
      "contactPoint": CONTACT_POINT
    };
  }

  function generateWebPageNode(pageData, parentData, dates) {
  return {
    "@type": "WebPage",
    "@id": pageData.url + CONFIG.WEBPAGE_ID_SUFFIX,
    "url": pageData.url,
    "name": pageData.title,
    "description": pageData.descMeta,
    "inLanguage": "id",
    "publisher": { "@id": CONFIG.LOCALBUSINESS_ID },
    "isPartOf": parentData && parentData.parentUrl
      ? (parentData.parentUrl === location.origin
          ? { "@id": "https://www.betonjayareadymix.com#website" }
          : { "@type": "WebPage", "@id": parentData.parentUrl, "name": cleanBreadcrumbText(parentData.parentName) })
      : undefined,
    "datePublished": dates.datePublished,
    "dateModified": dates.dateModified
  };
}
  // ═══════════════════════════════════════════════════════════════
  // FIX-G3 + FIX-H4 + PATCH-L: URL cleaning + urutan ogUrl → canonical
  // 🔥 PATCH-L: remove ?. in extractPageData (7 operators)
  // ═══════════════════════════════════════════════════════════════
  function extractPageData() {
    const _ogMetaEl = document.querySelector('meta[property="og:url"]');
    const ogUrl = _ogMetaEl && _ogMetaEl.content ? _ogMetaEl.content.trim() : null;
    const _canonicalEl = document.querySelector('link[rel="canonical"]');
    const canonical = _canonicalEl && _canonicalEl.href ? _canonicalEl.href.trim() : null;
    const rawUrl = ogUrl || canonical || location.href;
    const url = rawUrl.replace(/[?&]m=1/, '').replace(/\/$/, '');

    const h1El = document.querySelector('h1');
    const h1Title = (h1El && (h1El.innerText || h1El.textContent) || '').trim();
    const title = h1Title || document.title || "";

        const _descMetaEl = document.querySelector("meta[name='description']");
    const _descContent = _descMetaEl && _descMetaEl.content ? _descMetaEl.content.trim() : "";
    const descMeta = _descContent || (h1Title ? h1Title.substring(0, 155) : "Beton Jaya Readymix — penyedia layanan beton dan konstruksi.");

    const articleImage = findBestArticleImage();
    const content = document.querySelector(".post-body.entry-content")
                 || document.querySelector("article")
                 || document.querySelector("main");

    return {
      url,
      title,
      h1Title,
      descMeta,
      articleImage,
      content
    };
  }

  async function init() {
    log("══════════════════════════════════════════════════");
    log("Auto-Schema Generator v8.8 — ARTICLE + FAQ + BASE LAYER");
    log(`DEBUG: ${CONFIG.DEBUG ? 'VERBOSE' : 'SILENT (HP)'}`);
    log("══════════════════════════════════════════════════");

    if (shouldSkipPage()) {
      log("⏭️ Dihentikan untuk halaman ini", "SKIP");
      return;
    }

    let parentData = await waitForBreadcrumbGenerated(CONFIG.BREADCRUMB_GENERATED_TIMEOUT);
    if (!parentData || parentData.parentName === 'Home') {
      const currentUrl = location.href.replace(/[?&]m=1/, "");
      parentData = getParentFromBreadcrumbReady(null, currentUrl);
    }

    await waitForPageLevelDetector();

    const { pageLevel, entityType, source } = await getPageLevelAndEntityType();
    if (!pageLevel || !entityType) {
      log("❌ Page Level & Entity Type TIDAK TERSEDIA", "ERROR");
      return;
    }

    const pldVer = getPLDVersion();
    log(`🔷 PLD Version: ${pldVer.label}`, "PLD");
    log(`📌 Page Level: ${pageLevel}`, "PLD");
    log(`📌 Entity Type: ${entityType}`, "PLD");

    const contentFocus = detectContentFocus(pageLevel, entityType);
    const kategori = getKategori(contentFocus);

    log(`📌 Content Focus: ${contentFocus ? contentFocus.toUpperCase() : 'NULL'}`, "FOCUS");
    log(`📌 Kategori: ${kategori || 'NULL'}`, "KATEGORI");

    document.body.setAttribute("data-schema-page-level", pageLevel);
    document.body.setAttribute("data-schema-entity-type", entityType);
    document.body.setAttribute("data-schema-source", source);
    if (contentFocus) document.body.setAttribute("data-schema-content-focus", contentFocus);
    if (kategori) document.body.setAttribute("data-schema-kategori", kategori);
    document.body.setAttribute("data-schema-pld-version", pldVer.label);

    const aedData = await waitForAEDMetaDates(CONFIG.AED_TIMEOUT);
    if (aedData) log(`✅ AED ready: ${aedData.dateModified}`, "AED");

        const hybridReady = await waitForHybridDateFinal(CONFIG.HYBRID_FINAL_TIMEOUT);
    if (hybridReady) {
      log(`✅ Hybrid offset READY`, "HYBRID");
    } else {
      log(`⏰ Hybrid offset timeout — pakai AED dateModified`, "HYBRID");
    }

    // ═══════════════════════════════════════════════════════════════
    // 🩹 SAFE-MODE PATCH: Baca datePublished/dateModified dari
    //    meta tag Blogger (raw HTML) — JANGAN pakai `now`.
    //
    //    Rationale: SAFE mode → AED tidak bump. Fallback harus dari
    //    sumber yang sama dengan yang dilihat Googlebot Wave 1
    //    (Blogger raw HTML). `new Date().toISOString()` = inconsistency.
    //
    //    🩹 FIX: `finalAed` sebelumnya UNDEFINED di Article v8.8
    //    (variabel yang ada hanya `aedData`). Deklarasikan dari
    //    `window.AEDMetaDates || aedData` — kalau tidak, ReferenceError
    //    di baris `_dpFinal` → seluruh init() crash → schema kosong.
    // ═══════════════════════════════════════════════════════════════
    const finalAed = window.AEDMetaDates || aedData;   // 🩹 FIX: deklarasikan!

    function _aedReadMetaDate(prop) {
      var el = document.querySelector('meta[itemprop="' + prop + '"]');
      var v = el ? el.getAttribute('content') : null;
      return v ? v.trim() : null;
    }
    var _dpFallback = _aedReadMetaDate('datePublished');
    var _dmFallback = _aedReadMetaDate('dateModified') || _dpFallback;
    var _dpFinal = (finalAed && finalAed.datePublished) || _dpFallback;
    var _dmFinal = (finalAed && (finalAed.dateModifiedFinal || finalAed.dateModified)) || _dmFallback;

    if (!_dpFinal || !_dmFinal) {
      log('❌ SAFE-MODE: datePublished/dateModified tidak tersedia (meta tag Blogger tidak ter-render)', "ERROR");
      log('   → Schema generation dibatalkan untuk mencegah inconsistency', "ERROR");
      return;   // Skip entire schema — lebih baik tidak ada schema daripada schema invalid
    }
    if (_dmFinal < _dpFinal) {
      log(`⚠️ SAFE-MODE: dateModified < datePublished — koreksi ke datePublished`, "WARN");
      _dmFinal = _dpFinal;
    }

const effectiveDates = {
  datePublished: _dpFinal,
  dateModified: _dmFinal
};

if (finalAed && finalAed.dateModifiedFinal) {
  log(`📅 Schema dateModified = dateModifiedFinal (SAFE identity): ${effectiveDates.dateModified}`, "HYBRID");
} else {
  log(`📅 Schema dateModified = AED/meta: ${effectiveDates.dateModified}`, "AED");
}
    let articleElem = document.getElementById("auto-schema");
    if (!articleElem) {
      articleElem = document.createElement("script");
      articleElem.type = "application/ld+json";
      articleElem.id = "auto-schema";
      document.head.appendChild(articleElem);
      log(`🆕 Created #auto-schema element (was missing)`, "SCHEMA");
    }

    const shouldGenerate = shouldGenerateArticleSchema(pageLevel, entityType, contentFocus);
    log(`🚦 Article decision: ${shouldGenerate ? 'GENERATE' : 'SKIP'}`, "GATE");

    if (shouldGenerate) {
      const articleContent = document.querySelector(".post-body.entry-content")
                          || document.querySelector("article")
                          || document.querySelector("main");

      const isEditorial = isEditorialContent(articleContent);

      if (!isEditorial) {
        log("⏸️ SKIP Article: bukan editorial content", "SKIP");
        articleElem.textContent = "";
        return;
      }
    }

    const hasStaticFAQ = hasStaticFAQPageSchema();
    const faqAlreadyGenerated = document.body.getAttribute('data-faq-schema-generated') === 'true';
    const _hintForFAQ = getPLDSchemaHint();
    const isServiceOrProductPrimary = (_hintForFAQ.primary === 'Service' || _hintForFAQ.primary === 'Product');
    let faqsFromDOM = [];
    let wantFAQ = false;

    if (shouldGenerate) {
      if (hasStaticFAQ) {
        log(`⏭️ FAQPage static sudah ada di script lain — SKIP FAQ dinamis`, "STATIC");
      } else if (faqAlreadyGenerated) {
        log(`⏭️ FAQPage sudah di-generate script lain (flag) — SKIP FAQ dinamis`, "STATIC");
      } else if (isServiceOrProductPrimary) {
        log(`⏭️ primary=${_hintForFAQ.primary} — FAQ di-handle Universal/Hybrid → SKIP`, "SKIP");
      } else {
        faqsFromDOM = extractFaqFromDOM();
        wantFAQ = faqsFromDOM.length >= CONFIG.MIN_FAQ_FOR_SCHEMA;

        if (wantFAQ) {
          log(`❓ FAQ tersedia: ${faqsFromDOM.length} pertanyaan → wantFAQ=true (Article primary)`, "FAQ");
        } else {
          log(`❓ FAQ tidak cukup: ${faqsFromDOM.length} pertanyaan (min ${CONFIG.MIN_FAQ_FOR_SCHEMA}) → skip`, "FAQ");
        }
      }
    }

    if (articleElem && shouldGenerate) {
      const dates = effectiveDates;

      const pageData = extractPageData();
      const articleType = getArticleType(pageLevel);

      const schemaObj = generateArticleSchema(pageData, dates, pageLevel, entityType, parentData, contentFocus, kategori);

      const debugInfo = schemaObj.__debug || {};
      delete schemaObj.__debug;

      const skipBase = shouldSkipBaseLayer();

      let graph;
      if (skipBase) {
        graph = [schemaObj];
      } else {
        const localBusinessNode = generateLocalBusinessNode(pageLevel, entityType);
        const webpageNode = generateWebPageNode(pageData, parentData, dates);
        graph = [localBusinessNode, webpageNode, schemaObj];
      }

      if (wantFAQ && faqsFromDOM.length >= CONFIG.MIN_FAQ_FOR_SCHEMA) {
        const faqSchema = generateFaqSchema(faqsFromDOM, pageData, dates);
        graph.push(faqSchema);
        log(`✅ FAQPage node ditambah ke @graph: ${faqsFromDOM.length} pertanyaan`, "FAQ");
        document.body.setAttribute('data-faq-schema-generated', 'true');
      }

      articleElem.textContent = safeStringify({
        "@context": "https://schema.org",
        "@graph": graph
      }, 2);

      log(`📄 SCHEMA GENERATED (${articleType}${wantFAQ ? ' + FAQPage' : ''})`, "ARTICLE");
      log(`   Graph nodes: ${graph.map(n => n["@type"]).join(' + ')}`, "SCHEMA");
      if (skipBase) {
        log(`   Base layer: SKIPPED (GABUNG) — referensi via @id ✅`, "GABUNG");
      } else {
        log(`   Base layer: LocalBusiness + WebPage ✅`, "SCHEMA");
      }
      log(`   Publisher: ${CONFIG.LOCALBUSINESS_ID} 🔗`, "SYNC");
      log(`   Author: ${CONFIG.LOCALBUSINESS_ID} 🔗`, "SYNC");
      log(`   mainEntityOfPage: ${pageData.url}${CONFIG.WEBPAGE_ID_SUFFIX} 🔗`, "SYNC");
      log(`   isPartOf: ${parentData.parentName} ✅`, "SCHEMA");
      log(`   Image source: ${debugInfo.imageSource || 'unknown'}`, "IMG");
      // 🔥 PATCH-L: pageData.h1Title?.substring → ternary
      log(`   Title (H1): "${pageData.h1Title ? pageData.h1Title.substring(0, 50) : '(empty)'}"`, "URL");
      log(`   datePublished: ${dates.datePublished}`, "HYBRID");
      log(`   dateModified: ${dates.dateModified}`, "HYBRID");
      if (wantFAQ) {
        log(`   FAQ: ${faqsFromDOM.length} pertanyaan`, "FAQ");
      }
    } else if (articleElem) {
      articleElem.textContent = "";
      log("Article schema skipped (PLD tidak menunjuk Article)", "SKIP");
    }

    log("══════════════════════════════════════════════════");
    log("FINISHED (v8.8)", "SUCCESS");
    log(`   Page Level: ${pageLevel}`, "SUCCESS");
    log(`   Entity Type: ${entityType}`, "SUCCESS");
    log(`   Content Focus: ${contentFocus || 'NULL'}`, "FOCUS");
    log(`   Kategori: ${kategori || 'NULL'}`, "KATEGORI");
    log(`   Article Schema: ${shouldGenerate ? 'GENERATED ✅' : 'SKIPPED ⏭️'}`, "ARTICLE");
    log(`   FAQ Schema: ${wantFAQ ? 'GENERATED ✅' : (hasStaticFAQ ? 'STATIC ⏭️' : (faqAlreadyGenerated ? 'FLAG ⏭️' : 'SKIPPED ⏭️'))}`, "FAQ");
    log("══════════════════════════════════════════════════");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  console.log(`✅ [AutoSchema v8.8-PATCH] Ready — PLD-DRIVEN + FAQ + GABUNG + BASE LAYER SYNC`);
  console.log(`🩹 PATCH-L: Remove ALL optional chaining (?.) — 13 operators removed — Chrome 55+ compatible`);
  console.log(`🩹 FIX-H10: Anti-duplikat base layer GABUNG — SKIP LocalBusiness+WebPage saat GABUNG`);
  console.log(`✅ PRESERVED: FIX-H5, FIX-H6, FIX-H7, FIX-H8, FIX-H9`);
  console.log(`✅ PRESERVED: FIX-F2, FIX-H1, FIX-H2, FIX-H3, FIX-H4`);
  console.log(`✅ PRESERVED: FIX-A s/d FIX-G4 dari v8.6f`);

})();
