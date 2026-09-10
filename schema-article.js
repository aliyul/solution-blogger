/**
 * AUTO-SCHEMA GENERATOR v7.8 FINAL — ARTICLE ONLY + isPartOf
 * INTEGRATED WITH Page Level Detector v22.62 & Smart Evergreen Detector v15.2
 * 
 * ✅ v7.8 CHANGELOG:
 * ✅ TAMBAH: waitForBreadcrumbReady() — tunggu breadcrumb SIAP (bukan loading)
 * ✅ TAMBAH: getParentFromBreadcrumbReady() — ambil parent TERDEKAT
 * ✅ TAMBAH: isPartOf di generateArticleSchema() — dari parent terdekat
 * ✅ HAPUS: waitForBreadcrumb() — tidak valid (bisa loading/berantakan)
 * ✅ UBAH: init() — gunakan fungsi baru untuk isPartOf
 * ✅ PERTAHANKAN: Format Article schema (valid)
 * ✅ PERTAHANKAN: Prioritas SP1/SP2/Pillar (v7.6)
 * ✅ PERTAHANKAN: Deteksi tabel harga (v7.5)
 * ✅ PERTAHANKAN: PLD-ONLY MODE (v7.7)
 * ✅ PERTAHANKAN: 6 Parameter (v7.7)
 * ✅ PERTAHANKAN: Wait functions (AED, PLD)
 * ✅ PERTAHANKAN: Skip logic
 * ✅ PERTAHANKAN: Article type detection
 * ✅ PERTAHANKAN: Article body cleanup
 * ✅ PERTAHANKAN: Homepage schema
 * 
 * @version 7.8 FINAL
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
    BREADCRUMB_TIMEOUT: 3000,
    BREADCRUMB_READY_TIMEOUT: 5000
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
      PLD: "🔷", KATEGORI: "🏷️", SCHEMA: "🔗", ARTICLE: "📄",
      PARENT: "👪"
    };
    console.log(`${icons[type] || "📘"} [Schema v7.8] ${msg}`);
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
  // 🆕 v7.8: WAIT FOR BREADCRUMB READY (TUNGGU SIAP)
  // 🔥 SYARAT: Breadcrumb SUDAH TERBENTUK, BUKAN loading/berantakan
  // =========================================================

  /**
   * 🔥 TUNGGU BREADCRUMB SIAP (BUKAN LOADING/BERANTAKAN)
   * Syarat:
   * - Ada elemen breadcrumb
   * - Minimal 2 link (Beranda + minimal 1 parent)
   * - Struktur valid (BreadcrumbList schema ATAU minimal 2 link)
   * - BUKAN loading (bukan hanya 1 link tanpa href beranda)
   */
  function waitForBreadcrumbReady(timeout = CONFIG.BREADCRUMB_READY_TIMEOUT) {
    return new Promise((resolve) => {
      const startTime = Date.now();

      function checkBreadcrumbReady() {
        // ─────────────────────────────────────────
        // 1. Cari elemen breadcrumb
        // ─────────────────────────────────────────
        const breadcrumbSelectors = [
          '.breadcrumbs', '.breadcrumb', '.nav-trail',
          '[aria-label="breadcrumb"]', '[itemtype*="BreadcrumbList"]',
          '.post-breadcrumb', '.breadcrumb-nav', '.nav-breadcrumb'
        ];

        let breadcrumbEl = null;
        for (const selector of breadcrumbSelectors) {
          const el = document.querySelector(selector);
          if (el) { breadcrumbEl = el; break; }
        }

        if (!breadcrumbEl) {
          // Belum ada breadcrumb — tunggu
          if (Date.now() - startTime > timeout) {
            log(`⏰ Breadcrumb timeout — tidak ditemukan (${timeout}ms)`, "WARN");
            resolve(null);
            return;
          }
          setTimeout(checkBreadcrumbReady, 200);
          return;
        }

        // ─────────────────────────────────────────
        // 2. Validasi breadcrumb SIAP
        // ─────────────────────────────────────────
        const links = breadcrumbEl.querySelectorAll('a[href]');
        const items = breadcrumbEl.querySelectorAll('[itemprop="itemListElement"]');
        const hasSchema = breadcrumbEl.querySelector('[itemtype*="BreadcrumbList"]') ||
                          breadcrumbEl.hasAttribute('itemtype');

        const isReady = (links.length >= 2) || (items.length >= 2 && hasSchema);
        const isLoading = links.length === 0 ||
                          (links.length === 1 && !links[0].href.includes('beranda') && !links[0].href.includes('home'));

        if (isReady && !isLoading) {
          log(`✅ Breadcrumb SIAP: ${links.length} links, ${items.length} items, schema: ${hasSchema}`, "BREADCRUMB");
          resolve({
            element: breadcrumbEl,
            links: Array.from(links),
            items: Array.from(items),
            linkCount: links.length,
            itemCount: items.length,
            hasSchema: hasSchema
          });
          return;
        }

        // ─────────────────────────────────────────
        // 3. Belum siap — tunggu
        // ─────────────────────────────────────────
        if (Date.now() - startTime > timeout) {
          log(`⏰ Breadcrumb timeout — belum SIAP (${links.length} links, ${items.length} items)`, "WARN");
          resolve(null);
          return;
        }

        setTimeout(checkBreadcrumbReady, 200);
      }

      checkBreadcrumbReady();
    });
  }

  // =========================================================
  // 🆕 v7.8: GET PARENT FROM BREADCRUMB READY (PARENT TERDEKAT)
  // 🔥 AMBIL parent TERDEKAT (posisi terakhir sebelum current)
  // =========================================================

  /**
   * 🔥 AMBIL PARENT TERDEKAT DARI BREADCRUMB YANG SUDAH SIAP
   * Syarat:
   * - Breadcrumb sudah SIAP (bukan loading)
   * - Ambil parent TERDEKAT (posisi terakhir sebelum current)
   */
  function getParentFromBreadcrumbReady(breadcrumbData, currentUrl) {
    // ─────────────────────────────────────────
    // 1. Validasi breadcrumbData
    // ─────────────────────────────────────────
    if (!breadcrumbData || !breadcrumbData.links || breadcrumbData.links.length === 0) {
      log('⚠️ Breadcrumb tidak valid — fallback ke origin', "WARN");
      return {
        parentUrl: location.origin,
        parentName: 'Home',
        source: 'fallback-origin',
        allParents: []
      };
    }

    const links = breadcrumbData.links;
    const currentUrlClean = currentUrl.replace(/[?&]m=1/, '').replace(/\/$/, '');

    // ─────────────────────────────────────────
    // 2. Filter link = bukan current page
    // ─────────────────────────────────────────
    const validParents = links.filter(link => {
      const href = link.href || '';
      const hrefClean = href.replace(/\/$/, '');
      const text = link.innerText?.trim() || '';

      if (hrefClean === currentUrlClean) return false;
      if (hrefClean.includes(currentUrlClean)) return false;
      if (currentUrlClean.includes(hrefClean)) return false;
      if (!href || !text) return false;

      return true;
    });

    // ─────────────────────────────────────────
    // 3. Jika kosong → fallback ke origin
    // ─────────────────────────────────────────
    if (validParents.length === 0) {
      log('⚠️ Tidak ada parent valid — fallback ke origin', "WARN");
      return {
        parentUrl: location.origin,
        parentName: 'Home',
        source: 'fallback-origin',
        allParents: []
      };
    }

    // ─────────────────────────────────────────
    // 4. AMBIL PARENT TERDEKAT = POSISI TERAKHIR
    // ─────────────────────────────────────────
    const parentLink = validParents[validParents.length - 1];

    const parentUrl = parentLink.href || '';
    const parentName = parentLink.innerText?.trim() || 'Parent Page';

    log(`👪 Parent terdekat dari breadcrumb: "${parentName}" → ${parentUrl}`, "PARENT");

    return {
      parentUrl: parentUrl,
      parentName: parentName,
      source: 'breadcrumb-ready',
      allParents: validParents.map(l => ({
        url: l.href,
        name: l.innerText?.trim() || ''
      }))
    };
  }

  // =========================================================
  // 🔥 WAIT FOR AEDMetaDates (DIPERTAHANKAN)
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
  // PLD-ONLY DATA READERS (DARI v7.7)
  // 🔥 TIDAK ADA DETEKSI ULANG — HANYA TERIMA DARI PLD/V37.9-A 🔥
  // =========================================================

  function detectContentFocus() {
    const bodyFocus = document.body.getAttribute('data-content-focus');
    if (bodyFocus) {
      log(`🎯 Content Focus dari body: ${bodyFocus}`, "FOCUS");
      return bodyFocus.toLowerCase();
    }

    if (window.V379A && window.V379A.focusKonten) {
      log(`🎯 Content Focus dari V37.9-A: ${window.V379A.focusKonten}`, "FOCUS");
      return window.V379A.focusKonten.toLowerCase();
    }

    const h1 = document.querySelector('h1')?.innerText?.toLowerCase() || '';

    if (/\b(20[2-9][0-9])\b/.test(h1)) {
      log(`🎯 Content Focus: HARGA (H1 ada tahun)`, "FOCUS");
      return 'harga';
    }

    if (/\b(harga|biaya|tarif|estimasi)\b/i.test(h1)) {
      log(`🎯 Content Focus: HARGA (H1 ada kata harga)`, "FOCUS");
      return 'harga';
    }

    if (/\b(jual|order|beli|pesan)\b/i.test(h1)) {
      log(`🎯 Content Focus: COMMERCIAL (H1 ada kata commercial)`, "FOCUS");
      return 'commercial';
    }

    log(`🎯 Content Focus: INFORMASI (default)`, "FOCUS");
    return 'informasi';
  }

  function getKategori() {
    const bodyKategori = document.body.getAttribute('data-kategori');
    if (bodyKategori) {
      log(`🏷️ Kategori dari body: ${bodyKategori}`, "KATEGORI");
      return bodyKategori.toUpperCase();
    }

    if (window.V379A && window.V379A.kategori) {
      log(`🏷️ Kategori dari V37.9-A: ${window.V379A.kategori}`, "KATEGORI");
      return window.V379A.kategori.toUpperCase();
    }

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

  function getEntitySubType() {
    const bodySubType = document.body.getAttribute('data-entity-sub-type');
    if (bodySubType) {
      log(`🔷 Entity Sub-Type dari body: ${bodySubType}`, "PLD");
      return bodySubType;
    }

    if (window.V379A && window.V379A.entitySubType) {
      log(`🔷 Entity Sub-Type dari V37.9-A: ${window.V379A.entitySubType}`, "PLD");
      return window.V379A.entitySubType;
    }

    log(`⚠️ Entity Sub-Type TIDAK TERSEDIA`, "WARN");
    return null;
  }

  function getSchemaType() {
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

    if (window.V379A && window.V379A.schemaType) {
      log(`🔗 Schema Type dari V37.9-A`, "SCHEMA");
      return window.V379A.schemaType;
    }

    log(`⚠️ Schema Type TIDAK TERSEDIA`, "WARN");
    return null;
  }

  function getCtaType() {
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

    if (window.V379A && window.V379A.ctaType) {
      log(`🔘 CTA Type dari V37.9-A`, "PLD");
      return window.V379A.ctaType;
    }

    log(`⚠️ CTA Type TIDAK TERSEDIA`, "WARN");
    return null;
  }

  function getH1Pattern() {
    const bodyH1Pattern = document.body.getAttribute('data-h1-pattern');
    if (bodyH1Pattern) {
      log(`📝 H1 Pattern dari body: ${bodyH1Pattern}`, "PLD");
      return bodyH1Pattern;
    }

    if (window.V379A && window.V379A.h1Pattern) {
      log(`📝 H1 Pattern dari V37.9-A`, "PLD");
      return window.V379A.h1Pattern;
    }

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
  // GET PAGE LEVEL & ENTITY TYPE — PLD-ONLY (DARI v7.7)
  // =========================================================

  async function getPageLevelAndEntityType() {
    log("🔷 TERIMA DATA DARI PLD/BODY:", "PLD");

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

    if (pageLevel === 'variant' || pageLevel === 'sub-variant') {
      log(`✅ WAJIB TechArticle schema untuk ${pageLevel} (${entityType})`, "SUCCESS");
      return true;
    }

    if (pageLevel === 'money-master' || pageLevel === 'money-child') {
      if (contentFocus === 'informasi') {
        log(`✅ Article schema untuk ${pageLevel.toUpperCase()} INFORMASI (EVERGREEN — V37)`, "SUCCESS");
        return true;
      } else {
        log(`⏭️ Skip Article untuk ${pageLevel.toUpperCase()} ${contentFocus.toUpperCase()} - pakai Product/Service`, "SKIP");
        return false;
      }
    }

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
  // 🆕 ARTICLE SCHEMA v7.8 — DENGAN isPartOf
  // =========================================================

  function generateArticleSchema(data, dates, pageLevel, entityType, parentData) {
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

    // 🆕 BUILD isPartOf (dari parent terdekat)
    let isPartOf = null;
    if (parentData && parentData.parentUrl) {
      isPartOf = {
        "@type": "WebPage",
        "@id": parentData.parentUrl,
        "name": parentData.parentName
      };
      log(`📌 isPartOf: "${parentData.parentName}" → ${parentData.parentUrl} (source: ${parentData.source})`, "SCHEMA");
    }

    const schema = {
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

    // 🆕 TAMBAH isPartOf (jika ada)
    if (isPartOf) {
      schema.isPartOf = isPartOf;
    }

    return schema;
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
  // 🚀 MAIN INIT v7.8 — DENGAN isPartOf
  // =========================================================

  async function init() {
    log("════════════════════════════════════");
    log("AUTO SCHEMA GENERATOR v7.8 — ARTICLE ONLY");
    log("PLD-ONLY MODE + BREADCRUMB READY + isPartOf");
    log("════════════════════════════════════");

    if (shouldSkipPage()) {
      log("⏭️ Script dihentikan untuk halaman ini", "SKIP");
      return;
    }

    // =========================================================
    // 🆕 STEP 1: TUNGGU BREADCRUMB SIAP (BUKAN LOADING)
    // =========================================================
    log("🍞 Menunggu breadcrumb SIAP (bukan loading)...", "BREADCRUMB");
    const breadcrumbData = await waitForBreadcrumbReady(CONFIG.BREADCRUMB_READY_TIMEOUT);

    if (breadcrumbData) {
      log(`✅ Breadcrumb SIAP: ${breadcrumbData.linkCount} links, ${breadcrumbData.itemCount} items`, "SUCCESS");
    } else {
      log(`⚠️ Breadcrumb timeout — akan fallback ke origin`, "WARN");
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

    // =========================================================
    // 🆕 STEP: AMBIL PARENT TERDEKAT DARI BREADCRUMB SIAP
    // =========================================================
    const currentUrl = location.href.replace(/[?&]m=1/, "");

    log("👪 MENCARI PARENT TERDEKAT DARI BREADCRUMB SIAP...", "PARENT");
    const parentData = getParentFromBreadcrumbReady(breadcrumbData, currentUrl);

    log(`👪 Parent Final: "${parentData.parentName}"`, "PARENT");
    log(`   📍 URL: ${parentData.parentUrl}`, "PARENT");
    log(`   📍 Source: ${parentData.source}`, "PARENT");

    // Cek apakah perlu generate Article schema
    const articleElem = document.getElementById("auto-schema");
    const shouldGenerate = shouldGenerateArticleSchema(pageLevel, entityType, contentFocus);

    if (articleElem && shouldGenerate) {
      const dates = aedData || {
        datePublished: new Date().toISOString(),
        dateModified: new Date().toISOString()
      };

      // 🆕 PASS parentData ke generateArticleSchema()
      articleElem.textContent = JSON.stringify(
        generateArticleSchema(pageData, dates, pageLevel, entityType, parentData),
        null,
        2
      );
      log(`📄 ARTICLE SCHEMA GENERATED (${getArticleType(pageLevel)})`, "ARTICLE");
      log(`   📌 isPartOf: ${parentData.parentName} ✅`, "SCHEMA");

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
    log(`   ✅ Breadcrumb Ready: ${breadcrumbData ? 'SIAP ✅' : 'TIMEOUT ⚠️'}`);
    log(`   ✅ Parent Source: ${parentData.source}`);
    log(`   ✅ Parent Name: ${parentData.parentName}`);
    log(`   ✅ AED: ${aedData ? 'READY ✅' : 'FALLBACK ⚠️'}`);
    log(`   ✅ Article Schema: ${shouldGenerate ? 'GENERATED ✅' : 'SKIPPED ⏭️'}`);
    log(`   ✅ isPartOf: ${parentData.parentName} ✅`);
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
