/**
 * 📄 Auto-Schema Generator v8.5 — ARTICLE SCHEMA (FINAL)
 * 
 * 🔥 v8.5 CHANGELOG:
 * ✅ FIX-1: getArticleType() — deteksi URL pattern Blogger
 *           /p/ → Article (bukan BlogPosting)
 *           /YYYY/MM/ → BlogPosting (boleh)
 * ✅ FIX-2: Semua fitur v8.4 dipertahankan
 * ✅ FIX-3: Sync @id dengan v7.34 & v5.5 (#localbusiness tanpa slash)
 * ✅ FIX-4: Log lebih informatif
 * 
 * 🎯 SYARAT ARTICLE SCHEMA (v8.5):
 * Layer 1: shouldGenerateArticleSchema() — cek LEVEL halaman
 * Layer 2: isEditorialContent() — cek KUALITAS konten
 * 
 * Status: FINAL v8.5 — SEO 2026 Ready + Blogger-Aware
 */

(function() {
  "use strict";

  // ═══ GUARD GLOBAL ═══
  if (window.__AUTOSCHEMA_ARTICLE_VERSION === "8.5") {
    console.log("[AutoSchema Article v8.5] ⏭️ Already loaded — skip");
    return;
  }
  window.__AUTOSCHEMA_ARTICLE_VERSION = "8.5";

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
    
    // 🔥 SYNC-FIX: @id reference (TANPA SLASH) — sync v7.34 & v5.5
    LOCALBUSINESS_ID: "https://www.betonjayareadymix.com#localbusiness",
    WEBPAGE_ID_SUFFIX: "#webpage",
    
    // 🔥 K2-FIX: Author = Organization
    AUTHOR: {
      type: "Organization",
      name: "Beton Jaya Readymix",
      url: "https://www.betonjayareadymix.com"
    },
    
    // 🔥 M2-FIX: Default image fallback
    DEFAULT_ARTICLE_IMAGE: {
      url: "https://www.betonjayareadymix.com/default-og-image.jpg",
      width: 1200,
      height: 675
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
    
    VERSION: "8.5"
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
      IMG: "🖼️", EDITORIAL: "✍️", SYNC: "🔗", URL: "🌐"
    };
    console.log(`${icons[type] || "📘"} [AutoSchema v8.5] ${msg}`);
  }

  // ============================================================
  // 🔧 HELPER: PLD VERSION
  // ============================================================
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
  // 🔥 K1-FIX: SHOULD GENERATE ARTICLE SCHEMA
  // ============================================================
  function shouldGenerateArticleSchema(pageLevel, entityType, contentFocus) {
    // Pillar & Sub-Pillar → SELALU Article
    const mandatoryArticleLevels = ['pillar', 'sub-pillar-tipe-2', 'sub-pillar-tipe-1'];
    if (mandatoryArticleLevels.includes(pageLevel)) {
      log(`✅ Article WAJIB untuk level: ${pageLevel}`, "ARTICLE");
      return true;
    }

    // 🔥 K1-FIX: Semua Money level → SELALU Article
    const MONEY_LEVELS = ['money-master', 'money-page', 'money-child', 
                          'variant', 'sub-variant'];
    if (MONEY_LEVELS.includes(pageLevel)) {
      log(`✅ Article LAYAK untuk level: ${pageLevel} (fokus: ${contentFocus || 'N/A'})`, "ARTICLE");
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
  // 🔥 FIX-1: ARTICLE TYPE — Deteksi URL Pattern Blogger
  // ============================================================
  function getArticleType(pageLevel) {
    const path = window.location.pathname;
    
    // 🔥 FIX-1: Deteksi URL pattern Blogger
    const isBloggerPage = path.indexOf('/p/') === 0;         // /p/judul.html = PAGE
    const isBloggerPost = /\/\d{4}\/\d{2}\//.test(path);     // /2019/08/judul.html = POST
    
    // Log untuk debug
    log(`🌐 URL Pattern: ${isBloggerPage ? 'PAGE (/p/)' : isBloggerPost ? 'POST (/YYYY/MM/)' : 'UNKNOWN'}`, "URL");
    
    // Variant/Sub-Variant → TechArticle (semua pattern)
    if (pageLevel === 'variant' || pageLevel === 'sub-variant') {
      return 'TechArticle';
    }
    
    // Halaman PAGE Blogger (/p/) → selalu Article (bukan BlogPosting)
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
    
    // Fallback: default Article
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
  // 🔥 GENERATE ARTICLE SCHEMA (v8.5)
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

    // 🔥 M2-FIX: Image selalu ada (dengan fallback)
    const articleImage = data.articleImage || CONFIG.DEFAULT_ARTICLE_IMAGE;

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
      
      // 🔥 M2-FIX: Image SELALU ada (dengan fallback)
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

    return schema;
  }

  // ============================================================
  // 🔧 EXTRACT PAGE DATA
  // ============================================================
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
  // 🚀 MAIN INIT v8.5
  // ============================================================
  async function init() {
    log("════════════════════════════════════");
    log("Auto-Schema Generator v8.5 — ARTICLE (Blogger-Aware)");
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

    // 🔥 LAYER 1: Cek level (shouldGenerateArticleSchema)
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

      articleElem.textContent = JSON.stringify(
        generateArticleSchema(pageData, dates, pageLevel, entityType, parentData, contentFocus, kategori),
        null, 2
      );

      log(`📄 ARTICLE SCHEMA GENERATED (${articleType})`, "ARTICLE");
      log(`   Publisher: ${CONFIG.LOCALBUSINESS_ID} 🔗`, "SYNC");
      log(`   Author: ${CONFIG.LOCALBUSINESS_ID} 🔗`, "SYNC");
      log(`   mainEntityOfPage: ${pageData.url}${CONFIG.WEBPAGE_ID_SUFFIX} 🔗`, "SYNC");
      log(`   isPartOf: ${parentData.parentName} ✅`, "SCHEMA");
      log(`   Image: ${pageData.articleImage ? 'FROM PAGE ✅' : 'FALLBACK ⏭️'}`, "IMG");
    } else if (articleElem) {
      articleElem.textContent = "";
      log("Article schema skipped (bukan target)", "INFO");
    }

    log("════════════════════════════════════");
    log("FINISHED (v8.5)", "SUCCESS");
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

  console.log(`✅ [AutoSchema v8.5] Ready (mode: ${CONFIG.DEBUG ? 'VERBOSE' : 'SILENT'})`);

})();
