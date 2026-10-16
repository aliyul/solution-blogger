/**
 * 📄 Auto-Schema Generator v8.6b — ARTICLE SCHEMA (CLOUDINARY + H1 TITLE)
 * 
 * 🔥 v8.6b CHANGELOG:
 * ✅ FIX-A: Cloudinary image fallback (konsisten Universal v7.36e)
 *           - buildCloudinaryArticleImage() helper baru
 *           - Tidak insert figure ke DOM (hanya URL untuk schema)
 *           - Bebas dari konflik dengan Universal/Hybrid
 * ✅ FIX-B: Title source dari H1 (bukan document.title)
 *           - Sinkron dengan Universal v7.36e
 *           - URL Cloudinary identik → image WebPage == image Article
 * 
 * ✅ PRESERVED dari v8.6:
 * ✅ FIX-5: shouldGenerateArticleSchema() — PLD-driven
 * ✅ FIX-6: getArticleType() — prioritas PLD secondary
 * ✅ FIX-7: Anti-tabrakan dengan Service/Product
 * ✅ FIX-8: Sync PLD v23.9.9 (entity-aware detectSchemaType)
 * ✅ FIX-9: Fallback legacy tetap ada untuk PLD lama
 * 
 * 🎯 SYARAT ARTICLE SCHEMA (v8.6b):
 * Layer 1: shouldGenerateArticleSchema() — PLD-DRIVEN
 * Layer 2: isEditorialContent() — cek KUALITAS konten
 * 
 * Status: FINAL v8.6b — SEO 2026 Ready + Blogger-Aware + PLD-Driven
 */

(function() {
  "use strict";

  // ═══ GUARD GLOBAL ═══
  if (window.__AUTOSCHEMA_ARTICLE_VERSION === "8.6b") {
    console.log("[AutoSchema Article v8.6b] ⏭️ Already loaded — skip");
    return;
  }
  window.__AUTOSCHEMA_ARTICLE_VERSION = "8.6b";

  // ============================================================
  // 🔥 AUTO-DETECT DEBUG
  // ============================================================
  const IS_MOBILE = /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(navigator.userAgent);
  const IS_SLOW_DEVICE = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
                         (navigator.deviceMemory && navigator.deviceMemory <= 4);
  const URL_DEBUG = window.location.search.indexOf('schema-debug=1') !== -1;
  const DEBUG_MODE = URL_DEBUG || (!IS_MOBILE && !IS_SLOW_DEVICE);

  // ============================================================
  // 🔥 KONFIGURASI
  // ============================================================
  const CONFIG = {
    DEBUG: DEBUG_MODE,
    AED_TIMEOUT: 2000,
    PLD_TIMEOUT: 1000,
    BREADCRUMB_TIMEOUT: 1000,
    BREADCRUMB_GENERATED_TIMEOUT: 2000,

    // Site info
    SITE_NAME: "Beton Jaya Readymix",
    SITE_URL: "https://www.betonjayareadymix.com",
    CURRENT_YEAR: new Date().getFullYear(),

    // 🔥 SYNC-FIX: @id reference (TANPA SLASH)
    LOCALBUSINESS_ID: "https://www.betonjayareadymix.com#localbusiness",
    WEBPAGE_ID_SUFFIX: "#webpage",

    // 🔥 K2-FIX: Author = Organization
    AUTHOR: {
      type: "Organization",
      name: "Beton Jaya Readymix",
      url: "https://www.betonjayareadymix.com"
    },

    // 🔥 FIX-A (v8.6b): Default image = LOGO (bukan placeholder yang mungkin 404)
    DEFAULT_ARTICLE_IMAGE: {
      url: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png",
      width: 1200,
      height: 630
    },

    // 🔥 M1-FIX: Syarat editorial content
    MIN_EDITORIAL_WORDS: 300,
    MIN_EDITORIAL_PARAGRAPHS: 3,
    MIN_EDITORIAL_HEADINGS: 2,

    // Image
    MIN_IMAGE_WIDTH: 400,
    ARTICLE_IMG_WIDTH: 1200,
    ARTICLE_IMG_HEIGHT: 675,

    // Skip
    SKIP_WORD_COUNT: 300,

    VERSION: "8.6b"
  };

  const LOGO_IMAGE = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";

  const STATIC_PAGES = [
    '/p/hubungi-kami.html', '/p/portofolio.html', '/p/disclaimer.html',
    '/p/privacy-policy.html', '/p/terms-of-service.html', '/p/useful-links.html',
    '/p/about.html', '/p/sitemap.html'
  ];

  // ============================================================
  // 🔧 LOGGER
  // ============================================================
  function log(msg, type = "INFO") {
    if (!CONFIG.DEBUG) return;
    const icons = {
      INFO: "📘", WARN: "⚠️", ERROR: "❌", SUCCESS: "✅",
      FOCUS: "🎯", SKIP: "⏭️", BREADCRUMB: "🍞", AED: "⚡",
      PLD: "🔷", KATEGORI: "🏷️", SCHEMA: "🔗", ARTICLE: "📄",
      IMG: "🖼️", EDITORIAL: "✍️", SYNC: "🔗", URL: "🌐",
      CONFLICT: "🚨", CLOUD: "☁️"
    };
    console.log(`${icons[type] || "📘"} [AutoSchema v8.6b] ${msg}`);
  }

  // ============================================================
  // 🔧 HELPER: PLD VERSION
  // ============================================================
  function getPLDVersion() {
    if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.version) {
      var v = String(window.pageLevelDetectorv22.version);
      if (v.indexOf("23.9.9") === 0) return { version: v, family: "v23-lite", label: "v23.9.9-lite" };
      if (v.indexOf("23.9.8") === 0) return { version: v, family: "v23-lite", label: "v23.9.8-lite" };
      if (v.indexOf("23.9.7") === 0) return { version: v, family: "v23-lite", label: "v23.9.7-lite" };
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

  // ============================================================
  // 🔧 HELPER: BREADCRUMB
  // ============================================================
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
          detail: e?.detail
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

  // ============================================================
  // 🔧 HELPER: AED & PLD WAITERS
  // ============================================================

  // 🔥 K3-FIX: Anti-spoofing dateModified
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

          // 🔥 K3-FIX: Fallback AMAN — jangan spoof
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

  // ============================================================
  // 🔧 HELPER: PHASE 4.6
  // ============================================================
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

  // ============================================================
  // 🔥 FIX-5 (v8.6): GET PLD SCHEMA HINT
  // ============================================================
  function getPLDSchemaHint() {
    const primary   = (document.body.getAttribute('data-schema-type-primary')   || '').trim();
    const secondary = (document.body.getAttribute('data-schema-type-secondary') || '').trim();
    const note      = (document.body.getAttribute('data-schema-type-note')      || '').trim();
    const hint = { primary, secondary, note };
    log(`🔗 PLD hint → primary=${primary || '(none)'} | secondary=${secondary || '(none)'} | note=${note || '(none)'}`, "SCHEMA");
    return hint;
  }

  // ============================================================
  // 🔧 HELPER: SKIP PAGE
  // ============================================================
  function shouldSkipPage() {
    const currentPath = window.location.pathname;

    // Homepage
    const isHomepage = currentPath === '/' || currentPath === '/index.html' || currentPath === '';
    if (isHomepage) {
      log(`⏭️ SKIP: HOMEPAGE`, "SKIP");
      return true;
    }

    // Static pages
    const isStaticPage = STATIC_PAGES.some(page => currentPath.includes(page));
    if (isStaticPage) {
      log(`⏭️ SKIP: STATIC PAGE`, "SKIP");
      return true;
    }

    // Main content check
    const hasMainContent = document.querySelector('.post-body.entry-content, .post-body, article, main, section');
    const hasH1 = document.querySelector('h1');
    const contentLength = document.body.innerText?.trim()?.length || 0;
    const isContentPage = hasMainContent && hasH1 && contentLength > CONFIG.SKIP_WORD_COUNT;

    if (!isContentPage) {
      log(`⏭️ SKIP: TANPA KONTEN UTAMA (${contentLength} kar)`, "SKIP");
      return true;
    }

    log(`✅ Halaman LAYAK: ${currentPath}`, "SUCCESS");
    return false;
  }

  // ============================================================
  // 🔧 HELPER: GET PAGE LEVEL & ENTITY TYPE
  // ============================================================
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

  // ============================================================
  // 🔥 FIX-5 (v8.6): SHOULD GENERATE ARTICLE SCHEMA — PLD-DRIVEN
  // ============================================================
  function shouldGenerateArticleSchema(pageLevel, entityType, contentFocus) {
    const hint = getPLDSchemaHint();

    // 🔥 PRIORITAS 1: PLD bilang Article sebagai primary → LAYAK
    if (hint.primary === 'Article') {
      log(`✅ Article WAJIB — PLD primary=Article`, "ARTICLE");
      return true;
    }

    // 🔥 PRIORITAS 2: PLD bilang TechArticle sebagai secondary
    //    TAPI hanya kalau primary BUKAN Service/Product
    if (hint.secondary === 'TechArticle' &&
        hint.primary !== 'Service' &&
        hint.primary !== 'Product') {
      log(`✅ Article WAJIB — PLD secondary=TechArticle (primary=${hint.primary})`, "ARTICLE");
      return true;
    }

    // 🔥 PRIORITAS 3: PLD bilang Service/Product → JANGAN bikin Article
    if (hint.primary === 'Service' || hint.primary === 'Product') {
      log(`🚨 Article SKIP — PLD primary=${hint.primary} (sudah ditangani script lain)`, "CONFLICT");
      return false;
    }

    // 🔥 PRIORITAS 4: PLD bilang Service sebagai secondary
    if (hint.secondary === 'Service' && hint.primary === 'Product') {
      log(`🚨 Article SKIP — PLD primary=Product + secondary=Service`, "CONFLICT");
      return false;
    }

    // 🔥 PRIORITAS 5: Fallback legacy (untuk PLD lama tanpa hint)
    if (hint.primary || hint.secondary) {
      log(`⏭️ Article SKIP — PLD hint tidak menunjuk Article`, "SKIP");
      return false;
    }

    // Fallback: hardcode level (PLD lama)
    const mandatoryArticleLevels = ['pillar', 'sub-pillar-tipe-2', 'sub-pillar-tipe-1'];
    if (mandatoryArticleLevels.includes(pageLevel)) {
      log(`✅ Article LAYAK (fallback legacy) untuk level: ${pageLevel}`, "ARTICLE");
      return true;
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

  // ============================================================
  // 🔥 M1-FIX: VALIDASI EDITORIAL CONTENT
  // ============================================================
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

  // ============================================================
  // 🔥 FIX-6 (v8.6): ARTICLE TYPE — PLD-DRIVEN + URL Pattern
  // ============================================================
  function getArticleType(pageLevel) {
    const hint = getPLDSchemaHint();
    const path = window.location.pathname;

    // 🔥 PRIORITAS 1: PLD hint secondary
    if (hint.secondary === 'TechArticle') {
      log(`📄 Article type: TechArticle (dari PLD)`, "ARTICLE");
      return 'TechArticle';
    }
    if (hint.secondary === 'BlogPosting') {
      log(`📄 Article type: BlogPosting (dari PLD)`, "ARTICLE");
      return 'BlogPosting';
    }

    // 🔥 PRIORITAS 2: URL pattern Blogger
    const isBloggerPage = path.indexOf('/p/') === 0;
    const isBloggerPost = /\/\d{4}\/\d{2}\//.test(path);

    log(`🌐 URL Pattern: ${isBloggerPage ? 'PAGE (/p/)' : isBloggerPost ? 'POST (/YYYY/MM/)' : 'UNKNOWN'}`, "URL");

    // Variant/Sub-Variant → TechArticle (fallback kalau PLD tidak set)
    if (pageLevel === 'variant' || pageLevel === 'sub-variant') {
      return 'TechArticle';
    }

    // Halaman PAGE Blogger (/p/) → selalu Article
    if (isBloggerPage) {
      log(`📄 Article type: Article (halaman /p/)`, "ARTICLE");
      return 'Article';
    }

    // Halaman POST Blogger (/2019/08/) → boleh BlogPosting untuk pillar
    if (isBloggerPost) {
      if (pageLevel === 'pillar') {
        log(`📄 Article type: BlogPosting (post /YYYY/MM/)`, "ARTICLE");
        return 'BlogPosting';
      }
      return 'Article';
    }

    return 'Article';
  }

  // ============================================================
  // 🔧 HELPER: TEXT UTILS
  // ============================================================
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

  function escapeJSON(str) {
    if (!str) return "";
    return String(str)
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\//g, "\\/")
      .replace(/</g, "\\u003c")
      .replace(/>/g, "\\u003e")
      .replace(/&/g, "\\u0026")
      .replace(/\n/g, " ")
      .replace(/\r/g, " ")
      .trim();
  }

  // ============================================================
  // 🔥 IMAGE FINDER (cache per halaman)
  // ============================================================
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

  // ============================================================
  // 🔥 FIX-A (v8.6b): CLOUDINARY IMAGE GENERATOR
  // Konsisten dengan Universal v7.36e (sp1/sp2/pillar.webp)
  // HANYA return URL string — TIDAK insert figure ke DOM
  // ============================================================
  const CLOUDINARY_ARTICLE_CONFIG = {
    CLOUD_NAME: 'vagzz5sa',
    VERSION: 'v1789109159',
    FONT: 'Arial',
    WIDTH: 1200,
    HEIGHT: 630,
    QUALITY: 'q_auto:good',
    FORMAT: 'f_auto',
    DPR: 'dpr_auto',
    COLOR: 'FFD700',
    LEVEL_FILES: {
      'pillar': 'pillar',
      'sub-pillar-tipe-2': 'sp2',
      'sub-pillar-tipe-1': 'sp1',
      'money-master': 'mm',
      'money-page': 'mp',
      'money-child': 'mc',
      'variant': 'variant',
      'sub-variant': 'subvariant'
    }
  };

  function buildCloudinaryArticleImage(title, pageLevel) {
    try {
      const cfg = CLOUDINARY_ARTICLE_CONFIG;
      const fileName = cfg.LEVEL_FILES[pageLevel] || 'sp1';
      const cleanTitle = String(title || 'Artikel')
        .substring(0, 40)
        .replace(/[^\w\s-]/g, '')
        .trim();
      const encodedText = encodeURIComponent(cleanTitle);

      return `https://res.cloudinary.com/${cfg.CLOUD_NAME}/image/upload/` +
             `e_colorize:100,co_rgb:${cfg.COLOR},` +
             `l_text:${cfg.FONT}_40_bold:${encodedText},g_center,` +
             `c_fit,w_${cfg.WIDTH},h_${cfg.HEIGHT}/` +
             `${cfg.QUALITY},${cfg.FORMAT},${cfg.DPR}/` +
             `${cfg.VERSION}/${fileName}.webp`;
    } catch (e) {
      log(`⚠️ buildCloudinaryArticleImage error: ${e.message}`, "WARN");
      return null;
    }
  }

  // ============================================================
  // 🔥 GENERATE ARTICLE SCHEMA (v8.6b)
  // ============================================================
  function generateArticleSchema(data, dates, pageLevel, entityType, parentData, contentFocus, kategori) {
    const articleType = getArticleType(pageLevel);
    const focus = contentFocus || detectContentFocus(pageLevel, entityType);
    const kat = kategori || getKategori(focus);
    const entitySubType = getEntitySubType();

    // Mapping entity type → about
    let aboutName = "Konstruksi";
    if (entityType === "jasa") aboutName = "Jasa Konstruksi";
    else if (entityType === "sewa") aboutName = "Sewa Alat Konstruksi";
    else if (entityType === "produk") aboutName = "Produk Konstruksi";
    else if (entityType === "material") aboutName = "Material Konstruksi";
    else if (entityType === "desain") aboutName = "Desain Interior";

    // Mapping page level → articleSection
    let articleSection = "Informasi";
    if (pageLevel === 'pillar') articleSection = "Panduan Lengkap";
    else if (pageLevel === 'sub-pillar-tipe-2') articleSection = "Jenis & Kategori";
    else if (pageLevel === 'sub-pillar-tipe-1') articleSection = "Perbandingan & Analisis";
    else if (pageLevel === 'variant' || pageLevel === 'sub-variant') articleSection = "Spesifikasi Teknis";
    else if (pageLevel === 'money-master') articleSection = "Panduan Umum";
    else if (pageLevel === 'money-page') articleSection = "Panduan Spesifik";
    else if (pageLevel === 'money-child') articleSection = "Panduan Lokal";

    // isPartOf
    let isPartOf = null;
    if (parentData && parentData.parentUrl) {
      isPartOf = {
        "@type": "WebPage",
        "@id": parentData.parentUrl,
        "name": cleanBreadcrumbText(parentData.parentName)
      };
    }

    // 🔥 FIX-A (v8.6b): Image logic — Cloudinary fallback kalau tidak ada image dari page
    let articleImage = data.articleImage;
    let imageSource = 'none';

    if (!articleImage) {
      // 🔥 FIX-B (v8.6b): pakai H1 yang sama dengan Universal → URL identik
      const titleForImage = data.h1Title || data.title || 'Artikel';
      const cloudUrl = buildCloudinaryArticleImage(titleForImage, pageLevel);

      if (cloudUrl) {
        articleImage = { url: cloudUrl, width: 1200, height: 630 };
        imageSource = 'cloudinary';
        log(`☁️ Image: Cloudinary fallback (${pageLevel})`, "CLOUD");
      } else {
        articleImage = CONFIG.DEFAULT_ARTICLE_IMAGE;
        imageSource = 'default-logo';
        log(`📸 Image: DEFAULT LOGO fallback`, "IMG");
      }
    } else {
      imageSource = 'from-page';
      log(`📸 Image: FROM PAGE`, "IMG");
    }

    // 🔥 SYNC-FIX: Author & Publisher pakai @id reference ke #localbusiness
    const authorObj = {
      "@id": CONFIG.LOCALBUSINESS_ID
    };

    const publisherObj = {
      "@id": CONFIG.LOCALBUSINESS_ID
    };

    // 🔥 SUSUN SCHEMA
    const schema = {
      "@context": "https://schema.org",
      "@type": articleType,
      "@id": data.url + "#article",

      // Headline & description
      "headline": escapeJSON(data.title),
      "description": escapeJSON(data.descMeta),

      // 🔥 SYNC-FIX: Author refer ke LocalBusiness
      "author": authorObj,

      // 🔥 SYNC-FIX: Publisher refer ke LocalBusiness
      "publisher": publisherObj,

      // 🔥 K3-FIX: Tanggal (anti-spoofing dari caller)
      "datePublished": dates.datePublished,
      "dateModified": dates.dateModified,

      // 🔥 SYNC-FIX: mainEntityOfPage pakai #webpage
      "mainEntityOfPage": {
        "@id": data.url + CONFIG.WEBPAGE_ID_SUFFIX
      },

      // Content info
      "wordCount": getAccurateWordCount(data.content),
      "keywords": getCleanKeywords(data.title),
      "inLanguage": "id-ID",
      "articleSection": articleSection,

      // About (entity)
      "about": {
        "@type": "Thing",
        "name": aboutName
      },

      // 🔥 FIX-A (v8.6b): Image SELALU ada (dengan Cloudinary fallback)
      "image": [{
        "@type": "ImageObject",
        "url": articleImage.url,
        "width": articleImage.width || CONFIG.ARTICLE_IMG_WIDTH,
        "height": articleImage.height || CONFIG.ARTICLE_IMG_HEIGHT
      }]
    };

    // Optional: isPartOf
    if (isPartOf) schema.isPartOf = isPartOf;

    // Optional: entity sub-type
    if (entitySubType) {
      schema.about.additionalType = entitySubType;
    }

    // Return with debug info
    schema.__debug = { imageSource, entityType, pageLevel };

    return schema;
  }

  // ============================================================
  // 🔧 EXTRACT PAGE DATA
  // 🔥 FIX-B (v8.6b): title dari H1 (bukan document.title)
  // ============================================================
  function extractPageData() {
    const url = location.href.split("?")[0];

    // 🔥 FIX-B: H1 sebagai primary source (sinkron dengan Universal)
    const h1El = document.querySelector('h1');
    const h1Title = (h1El?.innerText || h1El?.textContent || '').trim();
    const title = h1Title || document.title || "";

    const descMeta = document.querySelector("meta[name='description']")?.content || "";
    const articleImage = findBestArticleImage();
    const content = document.querySelector(".post-body.entry-content")
                 || document.querySelector("article")
                 || document.querySelector("main");

    return {
      url,
      title,
      h1Title,        // ← FIX-B: ekspos h1Title untuk Cloudinary
      descMeta,
      articleImage,
      content
    };
  }

  // ============================================================
  // 🚀 MAIN INIT v8.6b
  // ============================================================
  async function init() {
    log("════════════════════════════════════");
    log("Auto-Schema Generator v8.6b — ARTICLE (Cloudinary + H1 Title)");
    log(`DEBUG: ${CONFIG.DEBUG ? 'VERBOSE' : 'SILENT (HP)'}`);
    log("════════════════════════════════════");

    // ⏭️ Skip homepage & static pages
    if (shouldSkipPage()) {
      log("⏭️ Dihentikan untuk halaman ini", "SKIP");
      return;
    }

    // 🍞 Wait breadcrumb
    let parentData = await waitForBreadcrumbGenerated(CONFIG.BREADCRUMB_GENERATED_TIMEOUT);
    if (!parentData || parentData.parentName === 'Home') {
      const currentUrl = location.href.replace(/[?&]m=1/, "");
      parentData = getParentFromBreadcrumbReady(null, currentUrl);
    }

    // 🔷 Wait PLD
    await waitForPageLevelDetector();

    // 📌 Get page level & entity type
    const { pageLevel, entityType, source } = await getPageLevelAndEntityType();
    if (!pageLevel || !entityType) {
      log("❌ Page Level & Entity Type TIDAK TERSEDIA", "ERROR");
      return;
    }

    const pldVer = getPLDVersion();
    log(`🔷 PLD Version: ${pldVer.label}`, "PLD");
    log(`📌 Page Level: ${pageLevel}`, "PLD");
    log(`📌 Entity Type: ${entityType}`, "PLD");

    // 🎯 Detect content focus & kategori
    const contentFocus = detectContentFocus(pageLevel, entityType);
    const kategori = getKategori(contentFocus);

    log(`📌 Content Focus: ${contentFocus ? contentFocus.toUpperCase() : 'NULL'}`, "FOCUS");
    log(`📌 Kategori: ${kategori || 'NULL'}`, "KATEGORI");

    // Set body attributes
    document.body.setAttribute("data-schema-page-level", pageLevel);
    document.body.setAttribute("data-schema-entity-type", entityType);
    document.body.setAttribute("data-schema-source", source);
    if (contentFocus) document.body.setAttribute("data-schema-content-focus", contentFocus);
    if (kategori) document.body.setAttribute("data-schema-kategori", kategori);
    document.body.setAttribute("data-schema-pld-version", pldVer.label);

    // ⚡ Wait AED
    const aedData = await waitForAEDMetaDates(CONFIG.AED_TIMEOUT);
    if (aedData) log(`✅ AED ready: ${aedData.dateModified}`, "AED");

    // 🔥 LAYER 1 (v8.6b): Cek PLD hint — PLD-DRIVEN
    const articleElem = document.getElementById("auto-schema");
    const shouldGenerate = shouldGenerateArticleSchema(pageLevel, entityType, contentFocus);

    // 🔥 LAYER 2: Cek kualitas konten (isEditorialContent)
    if (shouldGenerate) {
      const articleContent = document.querySelector(".post-body.entry-content")
                          || document.querySelector("article")
                          || document.querySelector("main");

      const isEditorial = isEditorialContent(articleContent);

      if (!isEditorial) {
        log("⏸️ SKIP Article: bukan editorial content", "SKIP");
        if (articleElem) articleElem.textContent = "";
        return;
      }
    }

    // 📄 Generate Article Schema
    if (articleElem && shouldGenerate) {
      const dates = aedData || {
        datePublished: new Date().toISOString(),
        dateModified: new Date().toISOString()
      };

      const pageData = extractPageData();
      const articleType = getArticleType(pageLevel);

      const schemaObj = generateArticleSchema(pageData, dates, pageLevel, entityType, parentData, contentFocus, kategori);

      // Remove debug before stringify
      const debugInfo = schemaObj.__debug || {};
      delete schemaObj.__debug;

      articleElem.textContent = JSON.stringify(schemaObj, null, 2);

      log(`📄 ARTICLE SCHEMA GENERATED (${articleType})`, "ARTICLE");
      log(`   Publisher: ${CONFIG.LOCALBUSINESS_ID} 🔗`, "SYNC");
      log(`   Author: ${CONFIG.LOCALBUSINESS_ID} 🔗`, "SYNC");
      log(`   mainEntityOfPage: ${pageData.url}${CONFIG.WEBPAGE_ID_SUFFIX} 🔗`, "SYNC");
      log(`   isPartOf: ${parentData.parentName} ✅`, "SCHEMA");
      log(`   Image source: ${debugInfo.imageSource || 'unknown'}`, "IMG");
      log(`   Title (H1): "${pageData.h1Title?.substring(0, 50) || '(empty)'}"`, "URL");
    } else if (articleElem) {
      articleElem.textContent = "";
      log("Article schema skipped (PLD tidak menunjuk Article)", "SKIP");
    }

    log("════════════════════════════════════");
    log("FINISHED (v8.6b)", "SUCCESS");
    log(`   Page Level: ${pageLevel}`, "SUCCESS");
    log(`   Entity Type: ${entityType}`, "SUCCESS");
    log(`   Content Focus: ${contentFocus || 'NULL'}`, "FOCUS");
    log(`   Kategori: ${kategori || 'NULL'}`, "KATEGORI");
    log(`   Article Schema: ${shouldGenerate ? 'GENERATED ✅' : 'SKIPPED ⏭️'}`, "ARTICLE");
    log("════════════════════════════════════");
  }

  // ============================================================
  // 🚀 START
  // ============================================================
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  console.log(`✅ [AutoSchema v8.6b] Ready — PLD-DRIVEN (mode: ${CONFIG.DEBUG ? 'VERBOSE' : 'SILENT'})`);
  console.log(`🔥 FIX-A: Cloudinary image fallback (konsisten Universal v7.36e)`);
  console.log(`🔥 FIX-B: Title source dari H1 (sinkron dengan Universal)`);
  console.log(`🔥 FIX-5: shouldGenerateArticleSchema() — PLD-driven`);
  console.log(`🔥 FIX-6: getArticleType() — prioritas PLD secondary`);
  console.log(`🔥 FIX-7: Anti-tabrakan dengan Service/Product (v7.36e & v5.7)`);
  console.log(`🔥 FIX-8: Sync PLD v23.9.9`);
  console.log(`🔥 FIX-9: Fallback legacy tetap ada untuk PLD lama`);

})();
