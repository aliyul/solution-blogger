/**
 * AUTO-SCHEMA GENERATOR v7.9 FINAL — ARTICLE ONLY + isPartOf
 * INTEGRATED WITH Page Level Detector v22.62 & Smart Evergreen Detector v15.2
 * 
 * ✅ v7.9 CHANGELOG:
 * ✅ FIX: waitForBreadcrumbGenerated() — tunggu event dari generateBreadcrumb
 * ✅ FIX: Cek flag data-breadcrumb-ready di body
 * ✅ FIX: Fallback tunggu breadcrumb FINAL (link terakhir = current)
 * ✅ FIX: Prioritaskan breadcrumb mengandung "Beranda"/"Home"
 * ✅ FIX: Strip separator dari parent name (›, », >, dll)
 * ✅ FIX: Publisher logo pakai LOGO_IMAGE (bukan firstImg)
 * ✅ FIX: escapeJSON() escape <, >, &
 * ✅ FIX: Tambah @id di Article schema
 * ✅ PERTAHANKAN: waitForBreadcrumbReady() — sebagai fallback
 * ✅ PERTAHANKAN: getParentFromBreadcrumbReady() — dengan prioritas flag
 * ✅ PERTAHANKAN: isPartOf di generateArticleSchema()
 * ✅ PERTAHANKAN: Format Article schema (valid)
 * ✅ PERTAHANKAN: Prioritas SP1/SP2/Pillar
 * ✅ PERTAHANKAN: Deteksi tabel harga
 * ✅ PERTAHANKAN: PLD-ONLY MODE
 * ✅ PERTAHANKAN: 6 Parameter
 * ✅ PERTAHANKAN: Semua fitur v7.8
 * 
 * @version 7.9 FINAL
 * @date 2026-09-11
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
    BREADCRUMB_READY_TIMEOUT: 5000,
    BREADCRUMB_GENERATED_TIMEOUT: 10000
  };

  // =========================================================
  // LOGO IMAGE (untuk Publisher Logo)
  // =========================================================

  const LOGO_IMAGE = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";

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
      PARENT: "👪", FIX: "🔧"
    };
    console.log(`${icons[type] || "📘"} [Schema v7.9] ${msg}`);
  }

  // =========================================================
  // DOMContentLoaded WAITER
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
  // 🆕 v7.9: CLEAN BREADCRUMB TEXT (STRIP SEPARATOR)
  // =========================================================

  function cleanBreadcrumbText(text) {
    if (!text) return '';
    return String(text)
      .replace(/[›»>→←«‹|/]/g, '')  // strip separator
      .replace(/\s+/g, ' ')          // normalize whitespace
      .trim();
  }

  // =========================================================
  // 🆕 v7.9: FIND MAIN BREADCRUMB (PRIORITAS "BERANDA")
  // =========================================================

  function findMainBreadcrumb() {
    const breadcrumbSelectors = [
      '.breadcrumbs', '.breadcrumb', '.nav-trail',
      '[aria-label="breadcrumb"]', '[itemtype*="BreadcrumbList"]',
      '.post-breadcrumb', '.breadcrumb-nav', '.nav-breadcrumb'
    ];

    const candidates = [];
    for (const selector of breadcrumbSelectors) {
      try {
        document.querySelectorAll(selector).forEach(el => {
          if (!candidates.includes(el)) candidates.push(el);
        });
      } catch(e) {}
    }

    if (candidates.length === 0) return null;

    // ✅ Prioritas 1: breadcrumb mengandung "beranda"/"home"
    for (const el of candidates) {
      const text = (el.innerText || '').toLowerCase();
      if (text.includes('beranda') || text.includes('home')) {
        return el;
      }
    }

    // ✅ Prioritas 2: breadcrumb dengan link terbanyak
    let best = candidates[0];
    let maxLinks = 0;
    for (const el of candidates) {
      const links = el.querySelectorAll('a[href]').length;
      if (links > maxLinks) {
        maxLinks = links;
        best = el;
      }
    }
    return best;
  }

  // =========================================================
  // 🆕 v7.9: WAIT FOR BREADCRUMB GENERATED (EVENT + FLAG)
  // 🔥 Prioritas: event dari generateBreadcrumbJasaKonstruksi
  // =========================================================

  function waitForBreadcrumbGenerated(timeout = CONFIG.BREADCRUMB_GENERATED_TIMEOUT) {
    return new Promise((resolve) => {
      // ✅ CEK FLAG DULU: sudah ready?
      const flagReady = document.body.getAttribute('data-breadcrumb-ready');
      if (flagReady === 'true') {
        const parentName = document.body.getAttribute('data-breadcrumb-parent');
        const parentUrl = document.body.getAttribute('data-breadcrumb-parent-url');
        log(`✅ Breadcrumb READY (flag): parent="${parentName}"`, "SUCCESS");
        resolve({
          parentName: cleanBreadcrumbText(parentName) || 'Parent Page',
          parentUrl: parentUrl || location.origin,
          source: 'generateBreadcrumb-flag',
          allParents: []
        });
        return;
      }

      // ✅ TUNGGU EVENT
      let resolved = false;
      const onReady = (e) => {
        if (resolved) return;
        resolved = true;
        
        const parentName = document.body.getAttribute('data-breadcrumb-parent');
        const parentUrl = document.body.getAttribute('data-breadcrumb-parent-url');
        
        log(`✅ Breadcrumb GENERATED (event): parent="${parentName}"`, "SUCCESS");
        resolve({
          parentName: cleanBreadcrumbText(parentName) || 'Parent Page',
          parentUrl: parentUrl || location.origin,
          source: 'generateBreadcrumb-event',
          allParents: [],
          detail: e?.detail
        });
      };

      window.addEventListener('breadcrumbGenerated', onReady, { once: true });

      // ✅ POLLING FLAG (jika event tidak fire)
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
            log(`⏰ Breadcrumb GENERATED timeout (${timeout}ms)`, "WARN");
            resolve(null);
          }
        }
      }, 200);
    });
  }

  // =========================================================
  // 🆕 v7.9: WAIT FOR BREADCRUMB READY (FALLBACK)
  // 🔥 Cek FINAL: link terakhir = current page, ada "Beranda"
  // =========================================================

  function waitForBreadcrumbReady(timeout = CONFIG.BREADCRUMB_READY_TIMEOUT) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const currentUrlClean = location.href.replace(/[?&]m=1/, '').replace(/\/$/, '');

      function checkBreadcrumbReady() {
        const breadcrumbEl = findMainBreadcrumb();

        if (!breadcrumbEl) {
          if (Date.now() - startTime > timeout) {
            log(`⏰ Breadcrumb timeout — tidak ditemukan (${timeout}ms)`, "WARN");
            resolve(null);
            return;
          }
          setTimeout(checkBreadcrumbReady, 200);
          return;
        }

        const links = breadcrumbEl.querySelectorAll('a[href]');
        const items = breadcrumbEl.querySelectorAll('[itemprop="itemListElement"]');
        const hasSchema = breadcrumbEl.querySelector('[itemtype*="BreadcrumbList"]') ||
                          breadcrumbEl.hasAttribute('itemtype');
        const fullText = (breadcrumbEl.innerText || '').toLowerCase();

        // ✅ Cek: breadcrumb mengandung "beranda"/"home"
        const hasHome = /(beranda|home)/i.test(fullText);
        if (!hasHome) {
          if (Date.now() - startTime > timeout) {
            log(`⏰ Breadcrumb timeout — tidak ada "Beranda"`, "WARN");
            resolve(null);
            return;
          }
          setTimeout(checkBreadcrumbReady, 200);
          return;
        }

        // ✅ Cek: link terakhir = current page?
        let isFinal = false;
        if (links.length > 0) {
          const lastLink = links[links.length - 1];
          const lastHref = (lastLink.href || '').replace(/[?&]m=1/, '').replace(/\/$/, '');
          if (lastHref === currentUrlClean) {
            isFinal = true;
          }
        }

        // ✅ Alternatif: cek text terakhir = current title
        if (!isFinal) {
          const h1Text = (document.querySelector('h1')?.innerText || '').toLowerCase().trim();
          const parts = fullText.split(/[›»>]/).map(p => p.trim()).filter(Boolean);
          const lastPart = parts[parts.length - 1] || '';
          if (h1Text && lastPart && (
            h1Text.includes(lastPart.substring(0, 20)) ||
            lastPart.includes(h1Text.substring(0, 20))
          )) {
            isFinal = true;
          }
        }

        const isReady = ((links.length >= 2) || (items.length >= 2 && hasSchema)) && isFinal;

        if (isReady) {
          log(`✅ Breadcrumb SIAP & FINAL: ${links.length} links`, "BREADCRUMB");
          resolve({
            element: breadcrumbEl,
            links: Array.from(links),
            items: Array.from(items),
            linkCount: links.length,
            itemCount: items.length,
            hasSchema: hasSchema,
            isFinal: true
          });
          return;
        }

        if (Date.now() - startTime > timeout) {
          log(`⏰ Breadcrumb timeout — belum FINAL (${links.length} links)`, "WARN");
          resolve(null);
          return;
        }

        setTimeout(checkBreadcrumbReady, 200);
      }

      checkBreadcrumbReady();
    });
  }

  // =========================================================
  // 🆕 v7.9: GET PARENT FROM BREADCRUMB
  // 🔥 Prioritas: flag → event → DOM (fallback)
  // =========================================================

  function getParentFromBreadcrumbReady(breadcrumbData, currentUrl) {
    // ✅ PRIORITAS 1: Cek flag dari generateBreadcrumb
    const parentFromFlag = document.body.getAttribute('data-breadcrumb-parent');
    const parentUrlFromFlag = document.body.getAttribute('data-breadcrumb-parent-url');

    if (parentFromFlag && parentUrlFromFlag) {
      log(`👪 Parent dari generateBreadcrumb flag: "${parentFromFlag}"`, "PARENT");
      return {
        parentUrl: parentUrlFromFlag,
        parentName: cleanBreadcrumbText(parentFromFlag),
        source: 'generateBreadcrumb-flag',
        allParents: []
      };
    }

    // ✅ PRIORITAS 2: Baca dari DOM (fallback)
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

    // ✅ Filter link = bukan current page, bukan "beranda"/"home", bukan separator-only
    const validParents = links.filter(link => {
      const href = (link.href || '').replace(/\/$/, '');
      const text = cleanBreadcrumbText(link.innerText || '');

      if (href === currentUrlClean) return false;
      if (href.includes(currentUrlClean)) return false;
      if (currentUrlClean.includes(href)) return false;
      if (!href || !text) return false;
      if (text.length < 2) return false;
      if (/^(beranda|home)$/i.test(text)) return false;  // skip beranda

      return true;
    });

    if (validParents.length === 0) {
      log('⚠️ Tidak ada parent valid — fallback ke origin', "WARN");
      return {
        parentUrl: location.origin,
        parentName: 'Home',
        source: 'fallback-origin',
        allParents: []
      };
    }

    // ✅ AMBIL PARENT TERDEKAT = POSISI TERAKHIR
    const parentLink = validParents[validParents.length - 1];
    const parentUrl = parentLink.href || '';
    const parentName = cleanBreadcrumbText(parentLink.innerText || '') || 'Parent Page';

    log(`👪 Parent terdekat dari breadcrumb: "${parentName}" → ${parentUrl}`, "PARENT");

    return {
      parentUrl: parentUrl,
      parentName: parentName,
      source: 'breadcrumb-ready',
      allParents: validParents.map(l => ({
        url: l.href,
        name: cleanBreadcrumbText(l.innerText || '')
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
  // PLD-ONLY DATA READERS
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
  // SKIP LOGIC
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
  // GET PAGE LEVEL & ENTITY TYPE
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
    return {
      pageLevel: null,
      entityType: null,
      source: 'unavailable'
    };
  }

  // =========================================================
  // WAIT PAGE LEVEL DETECTOR
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
  // CEK APAKAH PERLU ARTICLE SCHEMA
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
  // GET ARTICLE TYPE
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
  // CLEAN ARTICLE BODY
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

  // =========================================================
  // 🆕 v7.9: ESCAPE JSON (LENGKAP: <, >, &)
  // =========================================================

  function escapeJSON(str) {
    if (!str) return "";
    return String(str)
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/</g, "\\u003c")
      .replace(/>/g, "\\u003e")
      .replace(/&/g, "\\u0026")
      .replace(/\n/g, " ")
      .replace(/\r/g, " ")
      .trim();
  }

  // =========================================================
  // HOMEPAGE SCHEMA
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
  // 🆕 v7.9: ARTICLE SCHEMA DENGAN @id, LOGO, isPartOf
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

    // ✅ BUILD isPartOf (dari parent terdekat)
    let isPartOf = null;
    if (parentData && parentData.parentUrl) {
      isPartOf = {
        "@type": "WebPage",
        "@id": parentData.parentUrl,
        "name": cleanBreadcrumbText(parentData.parentName)
      };
      log(`📌 isPartOf: "${parentData.parentName}" → ${parentData.parentUrl} (source: ${parentData.source})`, "SCHEMA");
    }

    // ✅ v7.9: Tambah @id di Article schema
    const schema = {
      "@context": "https://schema.org",
      "@type": articleType,
      "@id": data.url + "#article",
      "headline": escapeJSON(data.title),
      "description": escapeJSON(data.descMeta),
      "image": [data.firstImg],
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
          "url": LOGO_IMAGE,          // ✅ v7.9: pakai LOGO_IMAGE
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

    // ✅ TAMBAH isPartOf (jika ada)
    if (isPartOf) {
      schema.isPartOf = isPartOf;
    }

    return schema;
  }

  // =========================================================
  // EXTRACT PAGE DATA
  // =========================================================

  function extractPageData() {
    const url = location.href.split("?")[0];
    const title = document.title || "";
    const descMeta = document.querySelector("meta[name='description']")?.content || "";
    const firstImg = document.querySelector(".post-body img, article img, main img")?.src || LOGO_IMAGE;
    const content = document.querySelector(".post-body.entry-content") || document.querySelector("article") || document.querySelector("main");
    return { url, title, descMeta, firstImg, content };
  }

  // =========================================================
  // 🚀 MAIN INIT v7.9
  // =========================================================

  async function init() {
    log("════════════════════════════════════");
    log("AUTO SCHEMA GENERATOR v7.9 — ARTICLE ONLY");
    log("PLD-ONLY + BREADCRUMB GENERATED + isPartOf");
    log("════════════════════════════════════");

    if (shouldSkipPage()) {
      log("⏭️ Script dihentikan untuk halaman ini", "SKIP");
      return;
    }

    // =========================================================
    // 🆕 v7.9 STEP 1: TUNGGU BREADCRUMB GENERATED (EVENT + FLAG)
    // =========================================================
    log("🍞 Menunggu breadcrumb GENERATED dari generateBreadcrumb...", "BREADCRUMB");
    let parentData = await waitForBreadcrumbGenerated(CONFIG.BREADCRUMB_GENERATED_TIMEOUT);

    if (parentData && parentData.parentName && parentData.parentName !== 'Parent Page') {
      log(`✅ Breadcrumb GENERATED: parent="${parentData.parentName}" (source: ${parentData.source})`, "SUCCESS");
    } else {
      log(`⚠️ Breadcrumb GENERATED timeout — fallback ke DOM`, "WARN");
      
      // ✅ FALLBACK: tunggu breadcrumb FINAL dari DOM
      const breadcrumbData = await waitForBreadcrumbReady(CONFIG.BREADCRUMB_READY_TIMEOUT);
      
      if (breadcrumbData) {
        log(`✅ Breadcrumb FALLBACK SIAP: ${breadcrumbData.linkCount} links`, "SUCCESS");
      } else {
        log(`⚠️ Breadcrumb FALLBACK timeout`, "WARN");
      }
      
      // ✅ Ambil parent dari DOM (dengan prioritas flag)
      const currentUrl = location.href.replace(/[?&]m=1/, "");
      parentData = getParentFromBreadcrumbReady(breadcrumbData, currentUrl);
    }

    // Wait untuk PLD
    await waitForPageLevelDetector();

    // Terima Page Level & Entity Type
    const { pageLevel, entityType, source, confidence, strategies, strategyCount } = await getPageLevelAndEntityType();

    if (!pageLevel || !entityType) {
      log("❌ Page Level & Entity Type TIDAK TERSEDIA", "ERROR");
      return;
    }

    log(`ENTITY TYPE: ${entityType} (source: ${source})`, "SUCCESS");
    log(`PAGE LEVEL: ${pageLevel}`, "SUCCESS");
    if (confidence) {
      log(`   🎯 Confidence: ${confidence}% (${strategyCount} strategies)`, "CONFIDENCE");
    }

    // Content Focus
    const contentFocus = detectContentFocus();
    log(`📌 Content Focus: ${contentFocus.toUpperCase()}`, "FOCUS");

    // 6 Parameter
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

    // Set body attribute
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

      articleElem.textContent = JSON.stringify(
        generateArticleSchema(pageData, dates, pageLevel, entityType, parentData),
        null,
        2
      );
      log(`📄 ARTICLE SCHEMA GENERATED (${getArticleType(pageLevel)})`, "ARTICLE");
      log(`   📌 isPartOf: ${parentData.parentName} ✅`, "SCHEMA");
      log(`   📌 @id: ${pageData.url}#article ✅`, "SCHEMA");
      log(`   📌 Publisher logo: LOGO_IMAGE ✅`, "SCHEMA");

      if (pageLevel === 'pillar' || pageLevel === 'sub-pillar-tipe-1' || pageLevel === 'sub-pillar-tipe-2') {
        log(`   ✅ ${pageLevel.toUpperCase()} → Article schema (EVERGREEN — V37)`, "SUCCESS");
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
    log(`   ✅ Parent Source: ${parentData.source}`);
    log(`   ✅ Parent Name: ${parentData.parentName}`);
    log(`   ✅ AED: ${aedData ? 'READY ✅' : 'FALLBACK ⚠️'}`);
    log(`   ✅ Article Schema: ${shouldGenerate ? 'GENERATED ✅' : 'SKIPPED ⏭️'}`);
    log(`   ✅ isPartOf: ${parentData.parentName} ✅`);
    log(`   ✅ PLD-ONLY MODE: ✅ ACTIVE`);
    log("════════════════════════════════════");
  }

  // =========================================================
  // START — WAIT DOM READY
  // =========================================================

  waitForDOM().then(() => {
    init();
  });

})();
