/**
 * AUTO-SCHEMA GENERATOR v7.7 FINAL — ARTICLE ONLY + PLD-ONLY MODE
 * INTEGRATED WITH Page Level Detector v22.62 & Smart Evergreen Detector v15.2
 * 
 * ✅ v7.7 CHANGELOG:
 * ✅ HAPUS: detectPageLevelStandalone() — tidak deteksi ulang
 * ✅ HAPUS: detectEntityTypeStandalone() — tidak deteksi ulang
 * ✅ SEDERHANAKAN: detectContentFocus() — terima dari body/V37.9-A
 * ✅ TAMBAH: getKategori() — EVERGREEN/NON-EVERGREEN dari body/V37.9-A
 * ✅ TAMBAH: getEntitySubType() — dari body/V37.9-A
 * ✅ TAMBAH: getSchemaType() — dari body/V37.9-A
 * ✅ TAMBAH: getCtaType() — dari body/V37.9-A
 * ✅ TAMBAH: getH1Pattern() — dari body/V37.9-A
 * ✅ PERTAHANKAN: Format Article schema (valid)
 * ✅ PERTAHANKAN: Prioritas SP1/SP2/Pillar (v7.6)
 * ✅ PERTAHANKAN: Deteksi tabel harga (v7.5)
 * ✅ PERTAHANKAN: Wait functions (Breadcrumb, AED, PLD)
 * ✅ PERTAHANKAN: Skip logic
 * ✅ PERTAHANKAN: Article type detection
 * ✅ PERTAHANKAN: Article body cleanup
 * ✅ PERTAHANKAN: Homepage schema
 * 
 * @version 7.7 FINAL
 * @date 2026-09-10
 */

(function() {
  "use strict";

  // =========================================================
  // CONFIG
  // =========================================================

  const CONFIG = {
    DEBUG: true,
    AED_TIMEOUT: 5000,
    MAX_ARTICLE_BODY_LENGTH: 8000,
    SITE_NAME: "Beton Jaya Readymix",
    SITE_URL: "https://www.betonjayareadymix.com",
    CURRENT_YEAR: new Date().getFullYear(),
    PLD_TIMEOUT: 10000,
    SKIP_WORD_COUNT: 300,
    BREADCRUMB_TIMEOUT: 3000
  };

  // =========================================================
  // DAFTAR HALAMAN STATIS
  // =========================================================

  const STATIC_PAGES = [
    '/p/hubungi-kami.html',
    '/p/portofolio.html',
    '/p/disclaimer.html',
    '/p/privacy-policy.html',
    '/p/terms-of-service.html',
    '/p/useful-links.html',
    '/p/about.html',
    '/p/sitemap.html'
  ];

  // =========================================================
  // LOGGER
  // =========================================================

  function log(msg, type = "INFO") {
    if (!CONFIG.DEBUG && type === "INFO") return;
    const icons = {
      INFO: "📘", WARN: "⚠️", ERROR: "❌", SUCCESS: "✅",
      CONFIDENCE: "🎯", FOCUS: "🎯", SKIP: "⏭️", TABLE: "📊",
      H1: "📝", PRIORITY: "🔴", BREADCRUMB: "🍞", AED: "⚡",
      PLD: "🔷", KATEGORI: "🏷️", SCHEMA: "🔗", ARTICLE: "📄"
    };
    console.log(`${icons[type] || "📘"} [Schema v7.7] ${msg}`);
  }

  // =========================================================
  // DOMContentLoaded WAITER (DIPERTAHANKAN)
  // =========================================================

  function waitForDOM() {
    return new Promise((resolve) => {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function() {
          log("✅ DOM siap", "SUCCESS");
          resolve();
        });
      } else {
        log("✅ DOM sudah siap", "SUCCESS");
        resolve();
      }
    });
  }

  // =========================================================
  // WAIT FOR BREADCRUMB (DIPERTAHANKAN)
  // =========================================================

  function waitForBreadcrumb(timeout = CONFIG.BREADCRUMB_TIMEOUT) {
    return new Promise((resolve) => {
      const startTime = Date.now();

      function checkBreadcrumb() {
        const breadcrumbSelectors = [
          '.breadcrumbs', '.breadcrumb', '.nav-trail', '.breadcrumb-item',
          '.crumbs', '.breadcrumb-link', '[aria-label="breadcrumb"]',
          '.post-breadcrumb', '.breadcrumb-nav', '.nav-breadcrumb'
        ];

        for (const selector of breadcrumbSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            const links = element.querySelectorAll('a');
            if (links.length > 0) {
              log(`✅ Breadcrumb ditemukan (${selector}) — ${links.length} link`, "BREADCRUMB");
              resolve(true);
              return;
            }
            if (element.innerText.trim().length > 0) {
              log(`✅ Breadcrumb ditemukan (${selector}) — ada teks`, "BREADCRUMB");
              resolve(true);
              return;
            }
          }
        }

        if (Date.now() - startTime > timeout) {
          log(`⏰ Breadcrumb timeout (${timeout}ms), lanjutkan tanpa breadcrumb`, "WARN");
          resolve(false);
          return;
        }

        setTimeout(checkBreadcrumb, 100);
      }

      checkBreadcrumb();
    });
  }

  // =========================================================
  // WAIT FOR AEDMetaDates (DIPERTAHANKAN)
  // =========================================================

  function waitForAEDMetaDates(timeout = CONFIG.AED_TIMEOUT) {
    return new Promise((resolve) => {
      if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
        log(`✅ AEDMetaDates ready: ${window.AEDMetaDates.dateModified}`, "AED");
        resolve(window.AEDMetaDates);
        return;
      }

      const onReady = () => {
        if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
          log(`✅ AEDMetaDates ready (event): ${window.AEDMetaDates.dateModified}`, "AED");
          resolve(window.AEDMetaDates);
        } else {
          resolve(null);
        }
      };

      window.addEventListener("detectEvergreenReady", onReady, { once: true });

      const startTime = Date.now();
      const interval = setInterval(() => {
        if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
          clearInterval(interval);
          log(`✅ AEDMetaDates ready (interval): ${window.AEDMetaDates.dateModified}`, "AED");
          resolve(window.AEDMetaDates);
          return;
        }

        if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          log(`⏰ AEDMetaDates timeout (${timeout}ms), using fallback`, "WARN");
          resolve({
            datePublished: new Date().toISOString(),
            dateModified: new Date().toISOString()
          });
        }
      }, 100);
    });
  }

  // =========================================================
  // 🆕 PLD-ONLY DATA READERS (BARU v7.7)
  // 🔥 TIDAK ADA DETEKSI ULANG — HANYA TERIMA DARI PLD/V37.9-A 🔥
  // =========================================================

  /**
   * 🔥 TERIMA CONTENT FOCUS DARI BODY/V37.9-A (TIDAK DETEKSI ULANG)
   */
  function detectContentFocus() {
    // 1. Body attribute (dari V37.9-A)
    const bodyFocus = document.body.getAttribute('data-content-focus');
    if (bodyFocus) {
      log(`🎯 Content Focus dari body: ${bodyFocus}`, "FOCUS");
      return bodyFocus.toLowerCase();
    }

    // 2. V37.9-A
    if (window.V379A && window.V379A.focusKonten) {
      log(`🎯 Content Focus dari V37.9-A: ${window.V379A.focusKonten}`, "FOCUS");
      return window.V379A.focusKonten.toLowerCase();
    }

    // 3. Fallback SEDERHANA (bukan daftar kata — hanya cek H1 tahun)
    const h1 = document.querySelector('h1')?.innerText?.toLowerCase() || '';

    // Cek tahun → HARGA
    if (/\b(20[2-9][0-9])\b/.test(h1)) {
      log(`🎯 Content Focus: HARGA (H1 ada tahun)`, "FOCUS");
      return 'harga';
    }

    // Cek kata harga di H1 → HARGA
    if (/\b(harga|biaya|tarif|estimasi)\b/i.test(h1)) {
      log(`🎯 Content Focus: HARGA (H1 ada kata harga)`, "FOCUS");
      return 'harga';
    }

    // Cek kata commercial di H1 → COMMERCIAL
    if (/\b(jual|order|beli|pesan)\b/i.test(h1)) {
      log(`🎯 Content Focus: COMMERCIAL (H1 ada kata commercial)`, "FOCUS");
      return 'commercial';
    }

    // 4. Default: INFORMASI
    log(`🎯 Content Focus: INFORMASI (default)`, "FOCUS");
    return 'informasi';
  }

  /**
   * 🔥 TERIMA KATEGORI EVERGREEN DARI BODY/V37.9-A (BARU v7.7)
   */
  function getKategori() {
    // 1. Body attribute (dari V37.9-A)
    const bodyKategori = document.body.getAttribute('data-kategori');
    if (bodyKategori) {
      log(`🏷️ Kategori dari body: ${bodyKategori}`, "KATEGORI");
      return bodyKategori.toUpperCase();
    }

    // 2. V37.9-A
    if (window.V379A && window.V379A.kategori) {
      log(`🏷️ Kategori dari V37.9-A: ${window.V379A.kategori}`, "KATEGORI");
      return window.V379A.kategori.toUpperCase();
    }

    // 3. Fallback dari content focus
    const focus = detectContentFocus();
    if (focus === 'informasi') {
      log(`🏷️ Kategori: EVERGREEN (dari INFORMASI)`, "KATEGORI");
      return 'EVERGREEN';
    }
    if (['harga', 'commercial', 'gabung'].includes(focus)) {
      log(`🏷️ Kategori: NON-EVERGREEN (dari ${focus.toUpperCase()})`, "KATEGORI");
      return 'NON-EVERGREEN';
    }

    log(`🏷️ Kategori: EVERGREEN (default)`, "KATEGORI");
    return 'EVERGREEN';
  }

  /**
   * 🔥 TERIMA ENTITY SUB-TYPE DARI BODY/V37.9-A (BARU v7.7)
   */
  function getEntitySubType() {
    // 1. Body attribute (dari V37.9-A PHASE 4.6)
    const bodySubType = document.body.getAttribute('data-entity-sub-type');
    if (bodySubType) {
      log(`🔷 Entity Sub-Type dari body: ${bodySubType}`, "PLD");
      return bodySubType;
    }

    // 2. V37.9-A
    if (window.V379A && window.V379A.entitySubType) {
      log(`🔷 Entity Sub-Type dari V37.9-A: ${window.V379A.entitySubType}`, "PLD");
      return window.V379A.entitySubType;
    }

    log(`⚠️ Entity Sub-Type TIDAK TERSEDIA`, "WARN");
    return null;
  }

  /**
   * 🔥 TERIMA SCHEMA TYPE DARI BODY/V37.9-A (BARU v7.7)
   */
  function getSchemaType() {
    // 1. Body attribute
    const bodyPrimary = document.body.getAttribute('data-schema-type-primary');
    const bodySecondary = document.body.getAttribute('data-schema-type-secondary');
    if (bodyPrimary) {
      const result = {
        primary: bodyPrimary,
        secondary: bodySecondary || 'FAQPage'
      };
      log(`🔗 Schema Type dari body: ${result.primary} + ${result.secondary}`, "SCHEMA");
      return result;
    }

    // 2. V37.9-A
    if (window.V379A && window.V379A.schemaType) {
      log(`🔗 Schema Type dari V37.9-A`, "SCHEMA");
      return window.V379A.schemaType;
    }

    log(`⚠️ Schema Type TIDAK TERSEDIA`, "WARN");
    return null;
  }

  /**
   * 🔥 TERIMA CTA TYPE DARI BODY/V37.9-A (BARU v7.7)
   */
  function getCtaType() {
    // 1. Body attribute
    const bodyCtaType = document.body.getAttribute('data-cta-type');
    const bodyCtaText = document.body.getAttribute('data-cta-text');
    if (bodyCtaType) {
      const result = {
        type: bodyCtaType,
        text: bodyCtaText || bodyCtaType
      };
      log(`🔘 CTA Type dari body: ${result.type} — "${result.text}"`, "PLD");
      return result;
    }

    // 2. V37.9-A
    if (window.V379A && window.V379A.ctaType) {
      log(`🔘 CTA Type dari V37.9-A`, "PLD");
      return window.V379A.ctaType;
    }

    log(`⚠️ CTA Type TIDAK TERSEDIA`, "WARN");
    return null;
  }

  /**
   * 🔥 TERIMA H1 PATTERN DARI BODY/V37.9-A (BARU v7.7)
   */
  function getH1Pattern() {
    // 1. Body attribute
    const bodyH1Pattern = document.body.getAttribute('data-h1-pattern');
    if (bodyH1Pattern) {
      log(`📝 H1 Pattern dari body: ${bodyH1Pattern}`, "PLD");
      return bodyH1Pattern;
    }

    // 2. V37.9-A
    if (window.V379A && window.V379A.h1Pattern) {
      log(`📝 H1 Pattern dari V37.9-A`, "PLD");
      return window.V379A.h1Pattern;
    }

    // 3. Fallback dari kategori
    const kategori = getKategori();
    const pattern = kategori === 'NON-EVERGREEN' ? 'with-year' : 'no-year';
    log(`📝 H1 Pattern: ${pattern} (dari kategori)`, "PLD");
    return pattern;
  }

  // =========================================================
  // SKIP LOGIC (DIPERTAHANKAN)
  // =========================================================

  function shouldSkipPage() {
    const currentPath = window.location.pathname;

    const isHomepage = currentPath === '/' || currentPath === '/index.html' || currentPath === '';
    if (isHomepage) {
      log(`⏭️ SKIP: HOMEPAGE (${currentPath})`, "SKIP");
      return true;
    }

    const isStaticPage = STATIC_PAGES.some(page => currentPath.includes(page));
    if (isStaticPage) {
      log(`⏭️ SKIP: HALAMAN STATIS (${currentPath})`, "SKIP");
      return true;
    }

    const hasMainContent = document.querySelector('.post-body.entry-content, .post-body, article, main, section');
    const hasH1 = document.querySelector('h1');
    const contentLength = document.body.innerText?.trim()?.length || 0;
    const isContentPage = hasMainContent && hasH1 && contentLength > CONFIG.SKIP_WORD_COUNT;

    if (!isContentPage) {
      log(`⏭️ SKIP: TANPA KONTEN UTAMA (${currentPath}) — ${contentLength} karakter`, "SKIP");
      return true;
    }

    log(`✅ Halaman LAYAK diproses: ${currentPath}`, "SUCCESS");
    return false;
  }

  // =========================================================
  // 🆕 GET PAGE LEVEL & ENTITY TYPE — PLD-ONLY (BARU v7.7)
  // 🔥 TIDAK ADA DETEKSI ULANG — HANYA DARI PLD/BODY 🔥
  // =========================================================

  async function getPageLevelAndEntityType() {
    log("🔷 TERIMA DATA DARI PLD/BODY:", "PLD");

    // ═══════════════════════════════════════════════════════
    // PRIORITAS 1: BODY ATTRIBUTE (dari V37.9-A)
    // ═══════════════════════════════════════════════════════
    const bodyLevel = document.body.getAttribute('data-page-level');
    const bodyEntity = document.body.getAttribute('data-entity-type');

    if (bodyLevel && bodyEntity) {
      log(`📌 Page Level dari body: ${bodyLevel}`, "PLD");
      log(`📌 Entity Type dari body: ${bodyEntity}`, "PLD");
      return {
        pageLevel: bodyLevel,
        entityType: bodyEntity,
        source: 'body-attribute'
      };
    }

    // ═══════════════════════════════════════════════════════
    // PRIORITAS 2: PLD v22.62
    // ═══════════════════════════════════════════════════════
    if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
      try {
        const pageLevel = window.pageLevelDetectorv22.detect();
        const entityType = window.pageLevelDetectorv22.detectEntityType();

        if (pageLevel && entityType) {
          log(`📌 Page Level dari PLD v22.62: ${pageLevel}`, "PLD");
          log(`📌 Entity Type dari PLD v22.62: ${entityType}`, "PLD");

          let confidence = null;
          let strategies = null;
          let strategyCount = null;

          if (typeof window.pageLevelDetectorv22.getConfidenceScore === 'function') {
            const confidenceScore = window.pageLevelDetectorv22.getConfidenceScore();
            confidence = confidenceScore.confidence;
            strategies = confidenceScore.strategies;
            strategyCount = confidenceScore.strategyCount;
          }

          return {
            pageLevel: pageLevel,
            entityType: entityType,
            source: 'PLD v22.62',
            confidence: confidence,
            strategies: strategies,
            strategyCount: strategyCount
          };
        }
      } catch (e) {
        log(`⚠️ Error PLD v22.62: ${e.message}`, "WARN");
      }
    }

    // ═══════════════════════════════════════════════════════
    // PRIORITAS 3: PLD VERSI LAIN
    // ═══════════════════════════════════════════════════════
    const pldVersions = [
      { obj: window.pageLevelDetectorv20, name: 'v20.x' },
      { obj: window.pageLevelDetectorv19, name: 'v19.0' },
      { obj: window.pageLevelDetectorV18, name: 'v18.7' },
      { obj: window.pageLevelDetectorV17, name: 'v17.0' },
      { obj: window.pageLevelDetector, name: 'legacy' }
    ];

    for (let pld of pldVersions) {
      if (pld.obj && typeof pld.obj.detect === 'function') {
        try {
          const pageLevel = pld.obj.detect();
          const entityType = typeof pld.obj.detectEntityType === 'function' ? pld.obj.detectEntityType() : null;

          if (pageLevel) {
            log(`📌 Page Level dari PLD ${pld.name}: ${pageLevel}`, "PLD");
            log(`📌 Entity Type dari PLD ${pld.name}: ${entityType}`, "PLD");
            return {
              pageLevel: pageLevel,
              entityType: entityType,
              source: `PLD ${pld.name}`
            };
          }
        } catch (e) {
          log(`⚠️ Error PLD ${pld.name}: ${e.message}`, "WARN");
        }
      }
    }

    // ═══════════════════════════════════════════════════════
    // JANGAN DETEKSI ULANG — Return null
    // ═══════════════════════════════════════════════════════
    log(`❌ Page Level & Entity Type TIDAK TERSEDIA`, "ERROR");
    log(`   ⚠️ Pastikan PLD v22.62 sudah loaded ATAU body attribute tersedia`, "WARN");
    return {
      pageLevel: null,
      entityType: null,
      source: 'unavailable'
    };
  }

  // =========================================================
  // WAIT PAGE LEVEL DETECTOR (DIPERTAHANKAN)
  // =========================================================

  function waitForPageLevelDetector() {
    return new Promise((resolve) => {
      if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
        log("Page Level Detector v22.62 already ready", "SUCCESS");
        resolve(true);
        return;
      }
      if (window.pageLevelDetectorv20 && typeof window.pageLevelDetectorv20.detect === 'function') {
        log("Page Level Detector v20.x already ready", "SUCCESS");
        resolve(true);
        return;
      }
      if (window.pageLevelDetectorv19 && typeof window.pageLevelDetectorv19.detect === 'function') {
        log("Page Level Detector v19.0 already ready", "SUCCESS");
        resolve(true);
        return;
      }
      if (window.pageLevelDetectorV18 && typeof window.pageLevelDetectorV18.detect === 'function') {
        log("Page Level Detector v18 already ready", "SUCCESS");
        resolve(true);
        return;
      }
      if (window.pageLevelDetectorV17 && typeof window.pageLevelDetectorV17.detect === 'function') {
        log("Page Level Detector v17 already ready", "SUCCESS");
        resolve(true);
        return;
      }
      if (window.pageLevelDetector && typeof window.pageLevelDetector.detect === 'function') {
        log("Page Level Detector legacy already ready", "SUCCESS");
        resolve(true);
        return;
      }

      const onReady = () => {
        log("Page Level Detector ready (event)", "SUCCESS");
        resolve(true);
      };

      window.addEventListener("pageLevelDetectorv22Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorv20Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorv19Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorReady", onReady, { once: true });

      setTimeout(() => {
        if (window.pageLevelDetectorv22 || window.pageLevelDetectorv20 ||
          window.pageLevelDetectorv19 || window.pageLevelDetectorV18 ||
          window.pageLevelDetectorV17 || window.pageLevelDetector) {
          log("Page Level Detector ready (timeout)", "SUCCESS");
          resolve(true);
        } else {
          log("Page Level Detector not available", "WARN");
          resolve(false);
        }
      }, CONFIG.PLD_TIMEOUT);
    });
  }

  // =========================================================
  // CEK APAKAH PERLU ARTICLE SCHEMA (DIPERTAHANKAN v7.6)
  // 🔥 PRIORITAS TERTINGGI: SP1/SP2/Pillar
  // =========================================================

  function shouldGenerateArticleSchema(pageLevel, entityType, contentFocus) {
    log(`📌 Evaluating: pageLevel=${pageLevel}, entityType=${entityType}, focus=${contentFocus}`, "INFO");

    // =========================================================
    // 🔥 PRIORITAS 1: LEVEL YANG WAJIB ARTICLE (TANPA PEDULI FOKUS)
    // =========================================================
    const mandatoryArticleLevels = [
      'pillar',
      'sub-pillar-tipe-2',
      'sub-pillar-tipe-1'
    ];

    if (mandatoryArticleLevels.includes(pageLevel)) {
      log(`✅ WAJIB Article schema untuk ${pageLevel} (${entityType}) — V37 (EVERGREEN)`, "SUCCESS");
      log(`   🔥 Content Focus "${contentFocus}" TIDAK mempengaruhi ${pageLevel}`, "PRIORITY");
      return true;
    }

    // =========================================================
    // 🔥 PRIORITAS 2: VARIANT & SUB-VARIANT → TechArticle
    // =========================================================
    if (pageLevel === 'variant' || pageLevel === 'sub-variant') {
      log(`✅ WAJIB TechArticle schema untuk ${pageLevel} (${entityType})`, "SUCCESS");
      return true;
    }

    // =========================================================
    // 🔥 PRIORITAS 3: MONEY_MASTER & MONEY_CHILD → TERGANTUNG FOKUS
    // =========================================================
    if (pageLevel === 'money-master' || pageLevel === 'money-child') {
      if (contentFocus === 'informasi') {
        log(`✅ Article schema untuk ${pageLevel.toUpperCase()} INFORMASI (EVERGREEN — V37)`, "SUCCESS");
        return true;
      } else {
        log(`⏭️ Skip Article untuk ${pageLevel.toUpperCase()} ${contentFocus.toUpperCase()} - pakai Product/Service`, "SKIP");
        return false;
      }
    }

    // =========================================================
    // 🔥 PRIORITAS 4: MONEY_PAGE → TERGANTUNG FOKUS
    // =========================================================
    if (pageLevel === 'money-page') {
      if (contentFocus === 'informasi') {
        log(`✅ Article schema untuk MONEY_PAGE INFORMASI`, "SUCCESS");
        return true;
      } else {
        log(`⏭️ Skip Article untuk MONEY_PAGE ${contentFocus.toUpperCase()} - pakai Product/Service`, "SKIP");
        return false;
      }
    }

    log(`⏭️ Skip Article schema untuk ${pageLevel} - tidak masuk kriteria`, "SKIP");
    return false;
  }

  // =========================================================
  // GET ARTICLE TYPE (DIPERTAHANKAN)
  // =========================================================

  function getArticleType(pageLevel) {
    if (pageLevel === 'variant' || pageLevel === 'sub-variant') {
      return 'TechArticle';
    }
    if (pageLevel === 'pillar') {
      return 'BlogPosting';
    }
    return 'Article';
  }

  // =========================================================
  // CLEAN ARTICLE BODY (DIPERTAHANKAN)
  // =========================================================

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
      if (word.length > 3 && !stopwords.includes(word)) {
        keywords.add(word);
      }
    });
    return Array.from(keywords).slice(0, 12).join(", ");
  }

  function escapeJSON(str) {
    if (!str) return "";
    return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ").replace(/\r/g, " ").trim();
  }

  // =========================================================
  // HOMEPAGE SCHEMA (DIPERTAHANKAN)
  // =========================================================

  function generateHomePageSchema(data) {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Beranda - " + CONFIG.SITE_NAME,
      "url": data.url,
      "description": data.descMeta,
      "inLanguage": "id-ID"
    };
  }

  // =========================================================
  // ARTICLE SCHEMA (DIPERTAHANKAN — DENGAN FOKUS KONTEN)
  // =========================================================

  function generateArticleSchema(data, dates, pageLevel, entityType) {
    const articleType = getArticleType(pageLevel);
    const focus = detectContentFocus();
    const kategori = getKategori();
    const entitySubType = getEntitySubType();

    // aboutName berdasarkan entityType
    let aboutName = "Konstruksi";
    if (entityType === "jasa") aboutName = "Jasa Konstruksi";
    else if (entityType === "sewa") aboutName = "Sewa Alat Konstruksi";
    else if (entityType === "produk") aboutName = "Produk Konstruksi";
    else if (entityType === "material") aboutName = "Material Konstruksi";
    else if (entityType === "desain") aboutName = "Desain Interior";

    // articleSection berdasarkan level + fokus
    let articleSection = "Informasi";
    if (pageLevel === 'pillar') articleSection = "Panduan Lengkap";
    else if (pageLevel === 'sub-pillar-tipe-2') articleSection = "Jenis & Kategori";
    else if (pageLevel === 'sub-pillar-tipe-1') articleSection = "Perbandingan & Analisis";
    else if (pageLevel === 'variant' || pageLevel === 'sub-variant') articleSection = "Spesifikasi Teknis";
    else if ((pageLevel === 'money-master' || pageLevel === 'money-child' || pageLevel === 'money-page') && focus === 'informasi') {
      articleSection = "Informasi & Edukasi";
    }

    return {
      "@context": "https://schema.org",
      "@type": articleType,
      "headline": escapeJSON(data.title),
      "description": escapeJSON(data.descMeta),
      "image": [data.firstImg],
      "author": {
        "@type": "Organization",
        "name": CONFIG.SITE_NAME
      },
      "publisher": {
        "@type": "Organization",
        "name": CONFIG.SITE_NAME,
        "logo": {
          "@type": "ImageObject",
          "url": data.firstImg
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
  }

  // =========================================================
  // EXTRACT PAGE DATA (DIPERTAHANKAN)
  // =========================================================

  function extractPageData() {
    const url = location.href.split("?")[0];
    const title = document.title || "";
    const descMeta = document.querySelector("meta[name='description']")?.content || "";
    const firstImg = document.querySelector(".post-body img, article img, main img")?.src || `${CONFIG.SITE_URL}/favicon.ico`;
    const content = document.querySelector(".post-body.entry-content") || document.querySelector("article") || document.querySelector("main");
    return { url, title, descMeta, firstImg, content };
  }

  // =========================================================
  // 🚀 MAIN INIT (DENGAN PLD-ONLY MODE)
  // =========================================================

  async function init() {
    log("════════════════════════════════════");
    log("AUTO SCHEMA GENERATOR v7.7 — ARTICLE ONLY");
    log("PLD-ONLY MODE + WAIT BREADCRUMB + WAIT AED");
    log("════════════════════════════════════");

    if (shouldSkipPage()) {
      log("⏭️ Script dihentikan untuk halaman ini", "SKIP");
      return;
    }

    log("🍞 Menunggu breadcrumb terbentuk...", "BREADCRUMB");
    const breadcrumbReady = await waitForBreadcrumb(CONFIG.BREADCRUMB_TIMEOUT);
    if (breadcrumbReady) {
      log("✅ Breadcrumb siap", "BREADCRUMB");
    } else {
      log("⚠️ Breadcrumb tidak ditemukan, lanjutkan tanpa breadcrumb", "WARN");
    }

    // Wait untuk PLD (tidak deteksi ulang)
    await waitForPageLevelDetector();

    // Terima Page Level & Entity Type dari PLD/Body
    const { pageLevel, entityType, source, confidence, strategies, strategyCount } = await getPageLevelAndEntityType();

    // Jika PLD tidak tersedia → STOP
    if (!pageLevel || !entityType) {
      log("❌ Page Level & Entity Type TIDAK TERSEDIA", "ERROR");
      log("   Pastikan PLD v22.62 sudah loaded ATAU body attribute tersedia", "ERROR");
      return;
    }

    log(`ENTITY TYPE: ${entityType} (source: ${source})`, "SUCCESS");
    log(`PAGE LEVEL: ${pageLevel}`, "SUCCESS");
    if (confidence) {
      log(`   🎯 Confidence: ${confidence}% (${strategyCount} strategies: ${strategies?.join(", ")})`, "CONFIDENCE");
    }

    // Terima Content Focus dari Body/V37.9-A
    const contentFocus = detectContentFocus();
    log(`📌 Content Focus: ${contentFocus.toUpperCase()}`, "FOCUS");

    // Terima 6 Parameter dari V37.9-A PHASE 4.6
    const kategori = getKategori();
    const entitySubType = getEntitySubType();
    const schemaType = getSchemaType();
    const ctaType = getCtaType();
    const h1Pattern = getH1Pattern();

    log(`📌 Kategori: ${kategori}`, "KATEGORI");
    log(`📌 Entity Sub-Type: ${entitySubType || 'N/A'}`, "PLD");
    log(`📌 Schema Type: ${schemaType ? schemaType.primary + ' + ' + schemaType.secondary : 'N/A'}`, "SCHEMA");
    log(`📌 CTA Type: ${ctaType ? ctaType.type : 'N/A'}`, "PLD");
    log(`📌 H1 Pattern: ${h1Pattern}`, "PLD");

    // Set body attribute (untuk interop)
    document.body.setAttribute("data-schema-page-level", pageLevel);
    document.body.setAttribute("data-schema-entity-type", entityType);
    document.body.setAttribute("data-schema-source", source);
    document.body.setAttribute("data-schema-content-focus", contentFocus);
    document.body.setAttribute("data-schema-kategori", kategori);
    if (confidence) {
      document.body.setAttribute("data-schema-confidence", confidence);
    }

    const pageData = extractPageData();

    // Homepage schema
    const homeElem = document.getElementById("auto-schema-home");
    if (homeElem && pageLevel === "home") {
      homeElem.textContent = JSON.stringify(generateHomePageSchema(pageData), null, 2);
      log("HOMEPAGE SCHEMA GENERATED", "SUCCESS");
    }

    // Wait untuk AED
    log("⚡ Menunggu AEDMetaDates...", "AED");
    const aedData = await waitForAEDMetaDates(CONFIG.AED_TIMEOUT);
    if (aedData) {
      log(`✅ AED ready: ${aedData.dateModified}`, "AED");
    } else {
      log(`⚠️ AED tidak tersedia, gunakan fallback`, "WARN");
    }

    // Cek apakah perlu generate Article schema
    const articleElem = document.getElementById("auto-schema");
    const shouldGenerate = shouldGenerateArticleSchema(pageLevel, entityType, contentFocus);

    if (articleElem && shouldGenerate) {
      const dates = aedData || {
        datePublished: new Date().toISOString(),
        dateModified: new Date().toISOString()
      };
      articleElem.textContent = JSON.stringify(
        generateArticleSchema(pageData, dates, pageLevel, entityType),
        null,
        2
      );
      log(`📄 ARTICLE SCHEMA GENERATED (${getArticleType(pageLevel)})`, "ARTICLE");

      // Log khusus untuk SP1/SP2/Pillar
      if (pageLevel === 'pillar' || pageLevel === 'sub-pillar-tipe-1' || pageLevel === 'sub-pillar-tipe-2') {
        log(`   ✅ ${pageLevel.toUpperCase()} → Article schema (EVERGREEN — V37)`, "SUCCESS");
        log(`   🔥 Content Focus "${contentFocus}" TIDAK mempengaruhi ${pageLevel}`, "PRIORITY");
      }
      if (pageLevel === 'money-master' || pageLevel === 'money-child') {
        log(`   ✅ ${pageLevel.toUpperCase()} INFORMASI → Article schema (EVERGREEN — V37)`, "SUCCESS");
      }
    } else if (articleElem) {
      articleElem.textContent = "";
      log("Article schema skipped - using Service/Product schema instead", "INFO");
    }

    // =========================================================
    // EXECUTION SUMMARY
    // =========================================================
    log("════════════════════════════════════");
    log("FINISHED");
    log(`   ✅ Page Level: ${pageLevel}`);
    log(`   ✅ Entity Type: ${entityType}`);
    log(`   ✅ Entity Sub-Type: ${entitySubType || 'N/A'}`);
    log(`   ✅ Content Focus: ${contentFocus}`);
    log(`   ✅ Kategori: ${kategori}`);
    log(`   ✅ H1 Pattern: ${h1Pattern}`);
    log(`   ✅ Schema Type: ${schemaType ? schemaType.primary : 'N/A'}`);
    log(`   ✅ CTA Type: ${ctaType ? ctaType.type : 'N/A'}`);
    log(`   ✅ Breadcrumb: ${breadcrumbReady ? 'READY ✅' : 'NOT FOUND ⚠️'}`);
    log(`   ✅ AED: ${aedData ? 'READY ✅' : 'FALLBACK ⚠️'}`);
    log(`   ✅ Article Schema: ${shouldGenerate ? 'GENERATED ✅' : 'SKIPPED ⏭️'}`);
    log(`   ✅ PLD-ONLY MODE: ✅ ACTIVE`);

    // Detail log per level
    if (pageLevel === 'pillar' || pageLevel === 'sub-pillar-tipe-1' || pageLevel === 'sub-pillar-tipe-2') {
      log(`   ✅ ${pageLevel.toUpperCase()} → WAJIB Article (EVERGREEN) — V37`, "SUCCESS");
      log(`   🔥 Content Focus "${contentFocus}" TIDAK mempengaruhi ${pageLevel}`, "PRIORITY");
    }
    if (pageLevel === 'money-master' || pageLevel === 'money-child') {
      log(`   ✅ ${pageLevel.toUpperCase()} ${contentFocus.toUpperCase()}: ${contentFocus === 'informasi' ? 'Article (EVERGREEN)' : 'Product/Service (NON-EVERGREEN)'} — V37`);
    }
    if (pageLevel === 'money-page') {
      log(`   ✅ MONEY_PAGE ${contentFocus.toUpperCase()}: ${contentFocus === 'informasi' ? 'Article' : 'Product/Service'}`);
    }
    log("════════════════════════════════════");
  }

  // =========================================================
  // START — WAIT DOM READY
  // =========================================================

  waitForDOM().then(() => {
    init();
  });

})();
