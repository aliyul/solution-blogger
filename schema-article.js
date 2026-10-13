/**
 * 📄 Auto-Schema Generator v8.3-LITE — ARTICLE SCHEMA (EVERGREEN)
 * 
 * 🔥 v8.3-LITE CHANGELOG (SYNC AED v17.4.3):
 * ✅ FIX-SYNC-AED-1: EVERGREEN_LEVELS — buang variant/sub-variant
 * ✅ FIX-SYNC-AED-2: MONEY_LEVELS — tambah variant/sub-variant
 * ✅ FIX-SYNC-AED-3: detectContentFocus() — AED-only, no H1 guessing
 * ✅ FIX-SYNC-AED-4: getKategori() — AED-only, no compute
 * ✅ FIX-SYNC-AED-5: shouldGenerateArticleSchema() — sederhana + sync
 * 
 * 🔥 v8.2-LITE CHANGELOG (PERFORMANCE PATCH):
 * ✅ FIX-S1: DEBUG auto-detect (HP = silent)
 * ✅ FIX-S2: Timeout turun drastis (10s → 1-3s)
 * ✅ FIX-S3: SKIP kalau BUKAN evergreen level (early exit)
 * ✅ FIX-S4: Guard _AUTOSCHEMA_ARTICLE_INITIALIZED
 * ✅ FIX-S5: Hapus unused helper (getAccurateWordCount, dll)
 * ✅ FIX-S6: Cache image search per halaman
 * 
 * ✅ PRESERVED:
 * ✅ Article schema lengkap
 * ✅ isPartOf di Article schema
 * ✅ Image filter (naturalWidth >= 400)
 * ✅ ImageObject format
 * ✅ Publisher logo statis
 * ✅ @id di Article schema
 */

(function() {
  "use strict";

  // ═══ FIX-S4: Guard global ═══
  if (window.__AUTOSCHEMA_ARTICLE_VERSION === "8.3-lite") {
    console.log("[AutoSchema Article v8.3-LITE] ⏭️ Already loaded — skip");
    return;
  }
  window.__AUTOSCHEMA_ARTICLE_VERSION = "8.3-lite";

  // ============================================================
  // 🔥 FIX-S1: AUTO-DETECT DEBUG 🔥
  // ============================================================
  const IS_MOBILE = /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(navigator.userAgent);
  const IS_SLOW_DEVICE = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
                         (navigator.deviceMemory && navigator.deviceMemory <= 4);
  const URL_DEBUG = window.location.search.indexOf('schema-debug=1') !== -1;
  const DEBUG_MODE = URL_DEBUG || (!IS_MOBILE && !IS_SLOW_DEVICE);

  // ============================================================
  // 🔥 FIX-S2: KONFIGURASI DENGAN TIMEOUT TURUN 🔥
  // ============================================================
  const CONFIG = {
    DEBUG: DEBUG_MODE,
    AED_TIMEOUT: 2000,
    MAX_ARTICLE_BODY_LENGTH: 8000,
    SITE_NAME: "Beton Jaya Readymix",
    SITE_URL: "https://www.betonjayareadymix.com",
    CURRENT_YEAR: new Date().getFullYear(),
    PLD_TIMEOUT: 1000,
    SKIP_WORD_COUNT: 300,
    BREADCRUMB_TIMEOUT: 1000,
    BREADCRUMB_READY_TIMEOUT: 1500,
    BREADCRUMB_GENERATED_TIMEOUT: 2000,
    MIN_IMAGE_WIDTH: 400,
    ARTICLE_IMG_WIDTH: 1200,
    ARTICLE_IMG_HEIGHT: 675,
    VERSION: "8.3-lite"
  };

  const LOGO_IMAGE = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";

  const STATIC_PAGES = [
    '/p/hubungi-kami.html', '/p/portofolio.html', '/p/disclaimer.html',
    '/p/privacy-policy.html', '/p/terms-of-service.html', '/p/useful-links.html',
    '/p/about.html', '/p/sitemap.html'
  ];

  function log(msg, type = "INFO") {
    if (!CONFIG.DEBUG) return;
    const icons = {
      INFO: "📘", WARN: "⚠️", ERROR: "❌", SUCCESS: "✅",
      CONFIDENCE: "🎯", FOCUS: "🎯", SKIP: "⏭️", TABLE: "📊",
      H1: "📝", PRIORITY: "🔴", BREADCRUMB: "🍞", AED: "⚡",
      PLD: "🔷", KATEGORI: "🏷️", SCHEMA: "🔗", ARTICLE: "📄",
      PARENT: "👪", FIX: "🔧", NEW: "🆕", IMG: "🖼️"
    };
    console.log(`${icons[type] || "📘"} [AutoSchema Article v8.3-LITE] ${msg}`);
  }

  function getPLDVersion() {
    if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.version) {
      var v = String(window.pageLevelDetectorv22.version);
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
  // 🔥 FIX-SYNC-AED-1 + 2: EARLY EXIT — CEK PAGE LEVEL
  // ============================================================
  // File ini HANYA untuk:
  //   - EVERGREEN level (pillar, sub-pillar-1, sub-pillar-2)
  //   - Money level (money-*, variant, sub-variant) + INFORMASI
  // ============================================================
  (function earlyExitCheck() {
    const pageLevel = document.body && document.body.getAttribute('data-page-level');
    const contentFocus = document.body && document.body.getAttribute('data-content-focus');

    // Kalau body attribute BELUM ada, tunggu — tidak skip
    if (!pageLevel) {
      window.__AUTOSCHEMA_ARTICLE_SKIP_REASON = null;
      return;
    }

    // 🔥 FIX-SYNC-AED-1: EVERGREEN_LEVELS — buang variant/sub-variant
    const EVERGREEN_LEVELS = ['pillar', 'sub-pillar-tipe-1', 'sub-pillar-tipe-2'];

    // 🔥 FIX-SYNC-AED-2: MONEY_LEVELS — tambah variant/sub-variant
    const MONEY_LEVELS = ['money-master', 'money-page', 'money-child', 'variant', 'sub-variant'];

    const isEvergreen = EVERGREEN_LEVELS.indexOf(pageLevel) !== -1;
    const isMoney = MONEY_LEVELS.indexOf(pageLevel) !== -1;
    const isInformasi = contentFocus === 'INFORMASI';

    // Skip kalau BUKAN evergreen DAN BUKAN (money + INFORMASI)
    if (!isEvergreen && !(isMoney && isInformasi)) {
      window.__AUTOSCHEMA_ARTICLE_SKIP_REASON = 'not-article-target';
      console.log(`⏸️ [AutoSchema Article v8.3-LITE] SKIP: level="${pageLevel}", focus="${contentFocus}" (Product schema handle)`);
      return;
    }

    window.__AUTOSCHEMA_ARTICLE_SKIP_REASON = null;
    if (CONFIG.DEBUG) {
      console.log(`✅ [AutoSchema Article v8.3-LITE] LAYAK: level=${pageLevel}, focus=${contentFocus}`);
    }
  })();

  // Kalau skip, STOP — hemat ~15-25 detik
  if (window.__AUTOSCHEMA_ARTICLE_SKIP_REASON) {
    return;
  }

  // ============================================================
  // BREADCRUMB HELPERS
  // ============================================================
  function cleanBreadcrumbText(text) {
    if (!text) return '';
    return String(text).replace(/[›»>→←«‹|/]/g, '').replace(/\s+/g, ' ').trim();
  }

  function findMainBreadcrumb() {
    const selectors = [
      '.breadcrumbs', '.breadcrumb', '.nav-trail',
      '[aria-label="breadcrumb"]', '[itemtype*="BreadcrumbList"]',
      '.post-breadcrumb', '.breadcrumb-nav', '.nav-breadcrumb'
    ];
    const candidates = [];
    for (const selector of selectors) {
      try {
        document.querySelectorAll(selector).forEach(el => {
          if (!candidates.includes(el)) candidates.push(el);
        });
      } catch(e) {}
    }
    if (candidates.length === 0) return null;
    for (const el of candidates) {
      const text = (el.innerText || '').toLowerCase();
      if (text.includes('beranda') || text.includes('home')) return el;
    }
    let best = candidates[0];
    let maxLinks = 0;
    for (const el of candidates) {
      const links = el.querySelectorAll('a[href]').length;
      if (links > maxLinks) { maxLinks = links; best = el; }
    }
    return best;
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
  // AED & PLD WAITERS
  // ============================================================
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
          resolve({
            datePublished: new Date().toISOString(),
            dateModified: new Date().toISOString()
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
  // PHASE 4.6 HELPERS
  // ============================================================

  // 🔥 FIX-SYNC-AED-3: detectContentFocus() — AED-only, no H1 guessing
  // Prioritas:
  //   1. AEDMetaDates.contentFocus (paling akurat)
  //   2. body[data-content-focus] (di-set PLD)
  //   3. PLD.detectContentFocus() (fallback terakhir)
  //   ❌ JANGAN tebak dari H1
  function detectContentFocus(pageLevel, entityType) {
    // Prioritas 1: AEDMetaDates
    if (window.AEDMetaDates && window.AEDMetaDates.contentFocus) {
      return String(window.AEDMetaDates.contentFocus).toLowerCase();
    }

    // Prioritas 2: body attribute
    const bodyFocus = document.body.getAttribute('data-content-focus');
    if (bodyFocus) return bodyFocus.toLowerCase();

    // Prioritas 3: PLD langsung
    if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detectContentFocus === 'function') {
      try {
        const pldFocus = window.pageLevelDetectorv22.detectContentFocus(pageLevel, entityType);
        if (pldFocus) return String(pldFocus).toLowerCase();
      } catch(e) {}
    }

    // ❌ JANGAN tebak dari H1
    return null;
  }

  // 🔥 FIX-SYNC-AED-4: getKategori() — AED-only, no compute
  function getKategori(contentFocus) {
    // Prioritas 1: AEDMetaDates
    if (window.AEDMetaDates && window.AEDMetaDates.pldKategori) {
      return String(window.AEDMetaDates.pldKategori).toUpperCase();
    }

    // Prioritas 2: body attribute
    const bodyKategori = document.body.getAttribute('data-kategori');
    if (bodyKategori) return bodyKategori.toUpperCase();

    // ❌ JANGAN hitung sendiri dari contentFocus
    return null;
  }

  function getEntitySubType() {
    return document.body.getAttribute('data-entity-sub-type') || null;
  }

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
    const contentLength = document.body.innerText?.trim()?.length || 0;
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

  // 🔥 FIX-SYNC-AED-5: shouldGenerateArticleSchema() — sederhana + sync
  function shouldGenerateArticleSchema(pageLevel, entityType, contentFocus) {
    // Pillar & sub-pillar → SELALU Article
    const mandatoryArticleLevels = ['pillar', 'sub-pillar-tipe-2', 'sub-pillar-tipe-1'];
    if (mandatoryArticleLevels.includes(pageLevel)) return true;

    // Money level (termasuk variant/sub-variant) + INFORMASI → Article
    const MONEY_LEVELS = ['money-master', 'money-page', 'money-child', 'variant', 'sub-variant'];
    if (MONEY_LEVELS.includes(pageLevel)) {
      return contentFocus === 'informasi';
    }

    return false;
  }

  function getArticleType(pageLevel) {
    if (pageLevel === 'variant' || pageLevel === 'sub-variant') return 'TechArticle';
    if (pageLevel === 'pillar') return 'BlogPosting';
    return 'Article';
  }

  function cleanTextStandalone(str) {
    if (!str) return "";
    return str.toLowerCase().replace(/[^a-z0-9\s]/gi, " ").replace(/\s+/g, " ").trim();
  }

  function getCleanArticleBody(contentElement) {
    if (!contentElement) return "";
    const clone = contentElement.cloneNode(true);
    clone.querySelectorAll("script,style,noscript,iframe,svg, .breadcrumbs, .related-posts").forEach(el => el.remove());
    let text = cleanTextStandalone(clone.innerText || "");
    if (text.length > CONFIG.MAX_ARTICLE_BODY_LENGTH) {
      text = text.substring(0, CONFIG.MAX_ARTICLE_BODY_LENGTH) + "...";
    }
    return text;
  }

  function getAccurateWordCount(contentElement) {
    if (!contentElement) return 0;
    const text = cleanTextStandalone(contentElement.innerText || "");
    return text.split(/\s+/).filter(Boolean).length;
  }

  function getCleanKeywords(title) {
    const keywords = new Set();
    const stopwords = ["dan", "di", "ke", "dari", "yang", "untuk", "dengan", "adalah", "atau", "ini", "itu", "kami", "anda"];
    title.toLowerCase().split(/\s+/).forEach(word => {
      word = word.replace(/[^\w]/g, "").trim();
      if (word.length > 3 && !stopwords.includes(word)) keywords.add(word);
    });
    return Array.from(keywords).slice(0, 12).join(", ");
  }

  function escapeJSON(str) {
    if (!str) return "";
    return String(str)
      .replace(/\\/g, "\\\\").replace(/"/g, '\\"')
      .replace(/</g, "\\u003c").replace(/>/g, "\\u003e")
      .replace(/&/g, "\\u0026").replace(/\n/g, " ").replace(/\r/g, " ").trim();
  }

  // 🔥 FIX-S6: Cache image search per halaman 🔥
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

    let isPartOf = null;
    if (parentData && parentData.parentUrl) {
      isPartOf = {
        "@type": "WebPage",
        "@id": parentData.parentUrl,
        "name": cleanBreadcrumbText(parentData.parentName)
      };
    }

    const schema = {
      "@context": "https://schema.org",
      "@type": articleType,
      "@id": data.url + "#article",
      "headline": escapeJSON(data.title),
      "description": escapeJSON(data.descMeta),
      "author": {
        "@type": "Organization",
        "name": CONFIG.SITE_NAME,
        "url": CONFIG.SITE_URL
      },
      "publisher": {
        "@type": "Organization",
        "name": CONFIG.SITE_NAME,
        "url": CONFIG.SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "url": LOGO_IMAGE,
          "width": 300,
          "height": 300
        }
      },
      "datePublished": dates.datePublished,
      "dateModified": dates.dateModified,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": data.url
      },
      "wordCount": getAccurateWordCount(data.content),
      "keywords": getCleanKeywords(data.title),
      "articleBody": getCleanArticleBody(data.content),
      "inLanguage": "id-ID",
      "articleSection": articleSection,
      "about": {
        "@type": "Thing",
        "name": aboutName
      }
    };

    if (data.articleImage && data.articleImage.url) {
      schema.image = [{
        "@type": "ImageObject",
        "url": data.articleImage.url,
        "width": data.articleImage.width || CONFIG.ARTICLE_IMG_WIDTH,
        "height": data.articleImage.height || CONFIG.ARTICLE_IMG_HEIGHT
      }];
    }

    if (isPartOf) schema.isPartOf = isPartOf;

    return schema;
  }

  function extractPageData() {
    const url = location.href.split("?")[0];
    const title = document.title || "";
    const descMeta = document.querySelector("meta[name='description']")?.content || "";
    const articleImage = findBestArticleImage();
    const content = document.querySelector(".post-body.entry-content")
                 || document.querySelector("article")
                 || document.querySelector("main");
    return { url, title, descMeta, articleImage, content };
  }

  // ============================================================
  // 🚀 MAIN INIT v8.3-LITE
  // ============================================================
  async function init() {
    log("════════════════════════════════════");
    log("Auto-Schema Generator v8.3-LITE — ARTICLE");
    log(`DEBUG: ${CONFIG.DEBUG ? 'VERBOSE' : 'SILENT (HP)'}`);
    log("════════════════════════════════════");

    if (shouldSkipPage()) {
      log("⏭️ Dihentikan untuk halaman ini", "SKIP");
      return;
    }

    // Wait breadcrumb
    let parentData = await waitForBreadcrumbGenerated(CONFIG.BREADCRUMB_GENERATED_TIMEOUT);
    if (!parentData || parentData.parentName === 'Home') {
      const currentUrl = location.href.replace(/[?&]m=1/, "");
      parentData = getParentFromBreadcrumbReady(null, currentUrl);
    }

    // Wait PLD
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

    // Set body attribute
    document.body.setAttribute("data-schema-page-level", pageLevel);
    document.body.setAttribute("data-schema-entity-type", entityType);
    document.body.setAttribute("data-schema-source", source);
    if (contentFocus) document.body.setAttribute("data-schema-content-focus", contentFocus);
    if (kategori) document.body.setAttribute("data-schema-kategori", kategori);
    document.body.setAttribute("data-schema-pld-version", pldVer.label);

    // Wait AED
    const aedData = await waitForAEDMetaDates(CONFIG.AED_TIMEOUT);
    if (aedData) log(`✅ AED ready: ${aedData.dateModified}`, "AED");

    // Cek apakah generate Article schema
    const articleElem = document.getElementById("auto-schema");
    const shouldGenerate = shouldGenerateArticleSchema(pageLevel, entityType, contentFocus);

    if (articleElem && shouldGenerate) {
      const dates = aedData || {
        datePublished: new Date().toISOString(),
        dateModified: new Date().toISOString()
      };

      const pageData = extractPageData();

      articleElem.textContent = JSON.stringify(
        generateArticleSchema(pageData, dates, pageLevel, entityType, parentData, contentFocus, kategori),
        null, 2
      );

      log(`📄 ARTICLE SCHEMA GENERATED (${getArticleType(pageLevel)})`, "ARTICLE");
      log(`   isPartOf: ${parentData.parentName} ✅`, "SCHEMA");
      log(`   Image: ${pageData.articleImage ? 'FROM PAGE ✅' : 'OMITTED ⏭️'}`, "IMG");
    } else if (articleElem) {
      articleElem.textContent = "";
      log("Article schema skipped (Service/Product handle)", "INFO");
    }

    log("════════════════════════════════════");
    log("FINISHED (v8.3-LITE)", "SUCCESS");
    log(`   Page Level: ${pageLevel}`, "SUCCESS");
    log(`   Entity Type: ${entityType}`, "SUCCESS");
    log(`   Content Focus: ${contentFocus || 'NULL'}`, "FOCUS");
    log(`   Kategori: ${kategori || 'NULL'}`, "KATEGORI");
    log(`   Article Schema: ${shouldGenerate ? 'GENERATED ✅' : 'SKIPPED ⏭️'}`, "ARTICLE");
    log("════════════════════════════════════");
  }

  // Start
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  console.log(`✅ [AutoSchema Article v8.3-LITE] Ready (mode: ${CONFIG.DEBUG ? 'VERBOSE' : 'SILENT'})`);

})();
