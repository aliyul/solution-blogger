/**
 * AUTO-SCHEMA GENERATOR v7.5 FINAL STABLE
 * INTEGRATED WITH Page Level Detector v22.x & Smart Evergreen Detector v15.2
 * 
 * ✅ FIX v7.5: Deteksi angka harga tanpa simbol Rp (H1 + tabel)
 * ✅ FIX v7.5: Jika ada kata "harga" di header tabel → PASTI HARGA
 * ✅ FIX v7.5: Deteksi harga dengan angka + satuan (per meter, per buah, dll)
 * ✅ FIX v7.4: Deteksi tabel harga lebih akurat (bedakan tabel spesifikasi/perbandingan)
 * ✅ FIX v7.3: MM Informasi → WAJIB Article schema (EVERGREEN — V37)
 * ✅ FIX v7.3: MC Informasi → WAJIB Article schema (EVERGREEN — V37)
 * ✅ FIX v7.3: waitForAEDMetaDates() untuk sinkronisasi dengan AED
 * ✅ FIX v7.2: WAIT BREADCRUMB sebelum eksekusi schema
 * ✅ FIX v7.1: SKIP LOGIC untuk Homepage & Halaman Statis
 * ✅ FIX v7.1: DOMContentLoaded waiter sebelum eksekusi
 * ✅ FIX: Deteksi fokus konten berdasarkan H1 (prioritas utama)
 * ✅ FIX: H1 mengandung tahun → PRIORITAS HARGA (non-evergreen)
 * ✅ FIX: H1 mengandung Rp → PRIORITAS HARGA
 * ✅ FIX: Sinkron dengan v15.2 (Smart Evergreen Detector)
 * ✅ FIX: Money Page Harga → PAKAI Product schema
 * ✅ FIX: Money Page Informasi → PAKAI Article schema
 *
 * @version 7.5 FINAL STABLE
 * @date 2026-09-04
 */

(function() {

  "use strict";

  // =========================================================
  // DOMContentLoaded WAITER
  // =========================================================

  function waitForDOM() {
    return new Promise((resolve) => {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function() {
          console.log("[Schema v7.5] ✅ DOM siap");
          resolve();
        });
      } else {
        console.log("[Schema v7.5] ✅ DOM sudah siap");
        resolve();
      }
    });
  }

  // =========================================================
  // WAIT FOR BREADCRUMB — TUNGGU BREADCRUMB TERBENTUK
  // =========================================================

  function waitForBreadcrumb(timeout = 3000) {
    return new Promise((resolve) => {
      const startTime = Date.now();

      function checkBreadcrumb() {
        const breadcrumbSelectors = [
          '.breadcrumbs',
          '.breadcrumb',
          '.nav-trail',
          '.breadcrumb-item',
          '.crumbs',
          '.breadcrumb-link',
          '[aria-label="breadcrumb"]',
          '.post-breadcrumb',
          '.breadcrumb-nav',
          '.nav-breadcrumb'
        ];

        for (const selector of breadcrumbSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            const links = element.querySelectorAll('a');
            if (links.length > 0) {
              console.log(`[Schema v7.5] ✅ Breadcrumb ditemukan (${selector}) — ${links.length} link`);
              resolve(true);
              return;
            }
            if (element.innerText.trim().length > 0) {
              console.log(`[Schema v7.5] ✅ Breadcrumb ditemukan (${selector}) — ada teks`);
              resolve(true);
              return;
            }
          }
        }

        if (Date.now() - startTime > timeout) {
          console.log(`[Schema v7.5] ⏰ Breadcrumb timeout (${timeout}ms), lanjutkan tanpa breadcrumb`);
          resolve(false);
          return;
        }

        setTimeout(checkBreadcrumb, 100);
      }

      checkBreadcrumb();
    });
  }

  // =========================================================
  // WAIT FOR AEDMetaDates — TUNGGU DATA DARI SMART EVERGREEN DETECTOR
  // =========================================================

  function waitForAEDMetaDates(timeout = 5000) {
    return new Promise((resolve) => {
      if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
        console.log(`[Schema v7.5] ✅ AEDMetaDates ready: ${window.AEDMetaDates.dateModified}`);
        resolve(window.AEDMetaDates);
        return;
      }

      const onReady = () => {
        if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
          console.log(`[Schema v7.5] ✅ AEDMetaDates ready (event): ${window.AEDMetaDates.dateModified}`);
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
          console.log(`[Schema v7.5] ✅ AEDMetaDates ready (interval): ${window.AEDMetaDates.dateModified}`);
          resolve(window.AEDMetaDates);
          return;
        }

        if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          console.warn(`[Schema v7.5] ⏰ AEDMetaDates timeout (${timeout}ms), using fallback`);
          resolve({
            datePublished: new Date().toISOString(),
            dateModified: new Date().toISOString()
          });
        }
      }, 100);
    });
  }

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
      INFO: "📘",
      WARN: "⚠️",
      ERROR: "❌",
      SUCCESS: "✅",
      CONFIDENCE: "🎯",
      FOCUS: "🎯",
      SKIP: "⏭️",
      TABLE: "📊",
      H1: "📝",
      PRIORITY: "🔴",
      BREADCRUMB: "🍞",
      AED: "⚡"
    };
    console.log(`${icons[type] || "📘"} [Schema v7.5] ${msg}`);
  }

  // =========================================================
  // SKIP LOGIC — CEK APAKAH HALAMAN PERLU DIPROSES
  // =========================================================

  function shouldSkipPage() {
    const currentPath = window.location.pathname;
    const currentUrl = window.location.href;

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
  // TUNGGU PAGE LEVEL DETECTOR READY
  // =========================================================

  function waitForPageLevelDetector() {
    return new Promise((resolve) => {
      if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
        log("Page Level Detector v22.x already ready", "SUCCESS");
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
          log("Page Level Detector not available, using standalone detection", "WARN");
          resolve(false);
        }
      }, CONFIG.PLD_TIMEOUT);
    });
  }

  // =========================================================
  // DETEKSI FOKUS KONTEN (PRIORITAS H1 + TABEL HARGA AKURAT)
  // 🔥 FIX v7.5: Deteksi angka harga tanpa simbol Rp
  // =========================================================

  function detectContentFocus() {
    const h1 = document.querySelector('h1')?.innerText?.toLowerCase() || '';
    const h1Text = h1;
    const title = document.title?.toLowerCase() || '';
    const content = document.querySelector('.post-body.entry-content, .post-body, article, main, section')?.innerText?.toLowerCase() || '';
    const url = location.href.toLowerCase();
    const combined = h1Text + ' ' + title + ' ' + content + ' ' + url;

    log(`🎯 Detecting content focus...`, "FOCUS");

    // =========================================================
    // PRIORITAS 1: CEK H1 (PATOKAN UTAMA)
    // =========================================================

    // 1A. CEK TAHUN
    const yearPattern = /\b(19|20)\d{2}\b/;
    const hasYear = yearPattern.test(h1Text);
    if (hasYear) {
      log(`🔴 PRIORITAS: H1 mengandung tahun → HARGA (non-evergreen)`, "PRIORITY");
      log(`   📝 H1: "${h1Text}"`, "H1");
      return 'harga';
    }

    // 1B. CEK Rp
    const hasRpFormat = /Rp\s*[\d.,]+/.test(h1Text);
    if (hasRpFormat) {
      log(`🔴 PRIORITAS: H1 mengandung Rp → HARGA`, "PRIORITY");
      log(`   📝 H1: "${h1Text}"`, "H1");
      return 'harga';
    }

    // 1C. CEK KATA HARGA
    const priceKeywordsInH1 = ['harga', 'biaya', 'tarif', 'estimasi', 'penawaran', 'promo', 'diskon'];
    const hasPriceInH1 = priceKeywordsInH1.some(k => h1Text.includes(k));
    if (hasPriceInH1) {
      log(`🔴 PRIORITAS: H1 mengandung kata harga → HARGA`, "PRIORITY");
      log(`   📝 H1: "${h1Text}"`, "H1");
      return 'harga';
    }

    // 1D. CEK SATUAN HARGA
    const unitPattern = /per\s*(meter|lembar|batang|kubik|m|m2|m²|lbr|buah|unit)/;
    const hasUnitInH1 = unitPattern.test(h1Text);
    if (hasUnitInH1) {
      log(`🔴 PRIORITAS: H1 mengandung satuan harga → HARGA`, "PRIORITY");
      log(`   📝 H1: "${h1Text}"`, "H1");
      return 'harga';
    }

    // 🔥 FIX v7.5: 1E. CEK ANGKA HARGA TANPA Rp
    // Pola: angka + satuan (per meter, per buah, dll)
    const priceNumberWithUnitPattern = /[\d.,]+\s*(per\s*(meter|m|lembar|buah|unit|kg|ton|kubik|m³|m2|m²|cm|mm|liter))/i;
    const hasPriceNumberWithUnit = priceNumberWithUnitPattern.test(h1Text);

    // Pola: frasa harga + angka (mulai dari, estimasi, biaya, dll)
    const pricePhrasePattern = /(mulai\s*dari|estimasi|biaya|harga|tarif|ongkos|mulai|sekitar)\s*[\d.,]+/i;
    const hasPricePhrase = pricePhrasePattern.test(h1Text);

    // Pola: angka dengan pemisah ribuan (tanpa Rp) + kata terkait harga
    const hasNumberWithSeparator = /[\d.,]+/.test(h1Text);
    const hasPriceContext = /\b(harga|biaya|estimasi|tarif|mulai|sekitar|per\s*meter|per\s*buah|per\s*unit|per\s*lembar)\b/i.test(h1Text);

    if (hasPriceNumberWithUnit || hasPricePhrase || (hasNumberWithSeparator && hasPriceContext)) {
      log(`🔴 PRIORITAS: H1 mengandung angka harga tanpa Rp → HARGA`, "PRIORITY");
      log(`   📝 H1: "${h1Text}"`, "H1");
      if (hasPriceNumberWithUnit) log(`   📊 Detected: angka + satuan harga`, "TABLE");
      if (hasPricePhrase) log(`   📊 Detected: frasa harga + angka`, "TABLE");
      return 'harga';
    }

    // 1F. CEK KATA INFORMATIF
    const infoKeywordsInH1 = ['panduan', 'spesifikasi', 'keunggulan', 'cara memilih', 'tips', 'perbedaan', 'jenis', 'apa itu', 'pengertian', 'standar', 'mutu'];
    const hasInfoInH1 = infoKeywordsInH1.some(k => h1Text.includes(k));
    if (hasInfoInH1 && !hasPriceInH1 && !hasRpFormat && !hasYear && !hasPriceNumberWithUnit && !hasPricePhrase) {
      log(`🔴 PRIORITAS: H1 mengandung kata informatif tanpa harga → INFORMASI`, "PRIORITY");
      log(`   📝 H1: "${h1Text}"`, "H1");
      return 'informasi';
    }

    // =========================================================
    // PRIORITAS 2: CEK TABEL HARGA (DENGAN DETEKSI YANG LEBIH AKURAT)
    // 🔥 FIX v7.5: Jika ada kata "harga" di header → PASTI HARGA
    // =========================================================

    function isPriceTable(table) {
      const tableText = table.innerText.toLowerCase();
      const headerCells = table.querySelectorAll('th');
      const headerText = Array.from(headerCells).map(th => th.innerText.toLowerCase()).join(' ');

      // 🔥 PRIORITAS TERTINGGI: Jika header mengandung kata "harga" → PASTI TABEL HARGA
      const exactPriceHeader = /\b(harga|biaya|estimasi|tarif|rp|rupiah)\b/i.test(headerText);
      if (exactPriceHeader) {
        log(`   🔴 TABEL HARGA (header mengandung kata "harga/biaya/estimasi")`, "PRIORITY");
        return true;
      }

      // CEK 1: Ada Rp di sel
      const hasRpInCells = /Rp\s*[\d.,]+/.test(tableText);

      // CEK 2: Ada angka tanpa Rp + satuan harga (FIX v7.5)
      const hasNumberWithUnit = /[\d.,]+\s*(per\s*(meter|m|lembar|buah|unit|kg|ton|kubik|m³|m2|m²|cm|mm|liter))/i.test(tableText);

      // CEK 3: Ada angka dengan frasa harga
      const hasPricePhraseInTable = /(mulai\s*dari|estimasi|biaya|harga|tarif|sekitar)\s*[\d.,]+/i.test(tableText);

      // CEK 4: Rasio angka
      const allCells = table.querySelectorAll('td');
      let numberCount = 0;
      allCells.forEach(cell => {
        if (/[\d.,]+/.test(cell.innerText.trim())) {
          numberCount++;
        }
      });
      const totalCells = allCells.length || 1;
      const numberRatio = numberCount / totalCells;

      // CEK 5: BUKAN tabel spesifikasi
      const specKeywords = ['spesifikasi', 'ukuran', 'dimensi', 'mutu', 'k225', 'k250', 'k300', 'k350', 'k400', 'k500', 'fc', 'm6', 'm8', 'm10', 'm12', 'm16', 'm20', 'b0', 'b1', 'b2', 'b3', 'sni', 'standar', 'grade', 'kelas', 'tipe', 'model', 'varian', 'berat', 'tebal', 'panjang', 'lebar', 'tinggi', 'diameter', 'ketahanan', 'daya', 'kapasitas'];
      const hasSpecKeyword = specKeywords.some(kw => headerText.includes(kw) || tableText.includes(kw));

      // CEK 6: BUKAN tabel perbandingan
      const compareKeywords = ['perbandingan', 'vs', 'versus', 'kelebihan', 'kekurangan', 'perbedaan', 'keunggulan', 'kelemahan'];
      const hasCompareKeyword = compareKeywords.some(kw => headerText.includes(kw) || tableText.includes(kw));

      // KESIMPULAN: TABEL HARGA jika:
      // - Ada Rp di sel ATAU ada angka + satuan ATAU ada frasa harga + angka
      // - Rasio angka cukup tinggi
      // - BUKAN tabel spesifikasi
      // - BUKAN tabel perbandingan
      const isPrice = (hasRpInCells || hasNumberWithUnit || hasPricePhraseInTable) && numberRatio > 0.15 && !hasSpecKeyword && !hasCompareKeyword;

      if (isPrice) {
        log(`   📊 Tabel HARGA terdeteksi: header="${headerText.substring(0, 50)}", ratio=${Math.round(numberRatio * 100)}%`, "TABLE");
      } else if (hasSpecKeyword) {
        log(`   📋 Tabel SPESIFIKASI terdeteksi (bukan harga): header="${headerText.substring(0, 50)}"`, "INFO");
      } else if (hasCompareKeyword) {
        log(`   📋 Tabel PERBANDINGAN terdeteksi (bukan harga): header="${headerText.substring(0, 50)}"`, "INFO");
      }

      return isPrice;
    }

    const tables = document.querySelectorAll('table');
    let hasPriceTable = false;
    let priceTableDetails = '';

    tables.forEach((table, index) => {
      if (isPriceTable(table)) {
        hasPriceTable = true;
        priceTableDetails = `Tabel ${index + 1}: terdeteksi sebagai tabel harga`;
      }
    });

    if (hasPriceTable) {
      log(`🔴 PRIORITAS: Ada tabel HARGA → HARGA`, "PRIORITY");
      log(`   📊 ${priceTableDetails}`, "TABLE");
      return 'harga';
    }

    // =========================================================
    // PRIORITAS 3: CEK KONTEN (SKOR)
    // =========================================================

    const eduKeywords = [
      'panduan', 'spesifikasi', 'keunggulan', 'ukuran', 'dimensi', 'cara memilih',
      'tips', 'informasi', 'pengertian', 'definisi', 'jenis', 'macam', 'tipe',
      'perbedaan', 'kelebihan', 'kekurangan', 'material', 'bahan', 'standar',
      'mutu', 'k225', 'k250', 'k300', 'komposisi', 'struktur', 'aplikasi',
      'penggunaan', 'manfaat', 'keuntungan', 'solusi', 'rekomendasi'
    ];

    const priceKeywords = [
      'harga', 'biaya', 'estimasi', 'tarif', 'mulai dari', 'per meter',
      'per lembar', 'per kubik', 'per unit', 'promo', 'diskon', 'penawaran',
      'daftar harga', 'tabel harga', 'rincian biaya', 'simulasi biaya',
      'total biaya', 'anggaran', 'budget', 'cost', 'price'
    ];

    let eduScore = 0;
    let priceScore = 0;

    for (const kw of eduKeywords) {
      if (combined.includes(kw)) eduScore++;
    }
    for (const kw of priceKeywords) {
      if (combined.includes(kw)) priceScore++;
    }

    const hasPriceCTA = document.querySelector('.cta-box, .cta-button, .btn-wa, [href*="wa.me"]')?.innerText?.toLowerCase()?.includes('harga') || false;
    if (hasPriceCTA) priceScore += 2;

    log(`📊 Edu Score: ${eduScore}, Price Score: ${priceScore}`, "FOCUS");

    // =========================================================
    // PRIORITAS 4: LOGIKA FINAL
    // =========================================================

    if (priceScore > eduScore * 1.5) {
      log(`🎯 Fokus: HARGA (price: ${priceScore}, edu: ${eduScore})`, "FOCUS");
      return 'harga';
    }

    if (eduScore > priceScore * 1.5) {
      log(`🎯 Fokus: INFORMASI/EDUKASI (edu: ${eduScore}, price: ${priceScore})`, "FOCUS");
      return 'informasi';
    }

    if (eduScore < 2 && priceScore < 2) {
      const urlHasHarga = url.includes('harga') || url.includes('biaya') || url.includes('tarif');
      const urlHasEdu = url.includes('spesifikasi') || url.includes('panduan') || url.includes('jenis');

      if (urlHasHarga) {
        log(`🎯 Fokus: HARGA (from URL)`, "FOCUS");
        return 'harga';
      }
      if (urlHasEdu) {
        log(`🎯 Fokus: INFORMASI/EDUKASI (from URL)`, "FOCUS");
        return 'informasi';
      }
    }

    if (eduScore >= priceScore) {
      log(`🎯 Fokus: INFORMASI/EDUKASI (default: edu >= price)`, "FOCUS");
      return 'informasi';
    }

    log(`🎯 Fokus: HARGA (default)`, "FOCUS");
    return 'harga';
  }

  // =========================================================
  // GET PAGE LEVEL & ENTITY TYPE
  // =========================================================

  async function getPageLevelAndEntityType() {
    const pldReady = await waitForPageLevelDetector();

    if (pldReady && window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
      try {
        const pageLevel = window.pageLevelDetectorv22.detect();
        const entityType = window.pageLevelDetectorv22.detectEntityType();
        let confidence = null;
        let strategies = null;
        let strategyCount = null;

        if (typeof window.pageLevelDetectorv22.getConfidenceScore === 'function') {
          const confidenceScore = window.pageLevelDetectorv22.getConfidenceScore();
          confidence = confidenceScore.confidence;
          strategies = confidenceScore.strategies;
          strategyCount = confidenceScore.strategyCount;
        }

        log(`Using PLD v22.x: pageLevel=${pageLevel}, entityType=${entityType}`, "SUCCESS");
        if (confidence) {
          log(`   🎯 Confidence: ${confidence}% (${strategyCount} strategies: ${strategies?.join(", ")})`, "CONFIDENCE");
        }
        return { pageLevel, entityType, source: 'PLD v22.x', confidence, strategies, strategyCount };
      } catch (e) {
        log(`Error calling PLD v22.x: ${e.message}`, "ERROR");
      }
    }

    if (pldReady && window.pageLevelDetectorv20 && typeof window.pageLevelDetectorv20.detect === 'function') {
      try {
        const pageLevel = window.pageLevelDetectorv20.detect();
        const entityType = window.pageLevelDetectorv20.detectEntityType();
        log(`Using PLD v20.x: pageLevel=${pageLevel}, entityType=${entityType}`, "SUCCESS");
        return { pageLevel, entityType, source: 'PLD v20.x' };
      } catch (e) {
        log(`Error calling PLD v20.x: ${e.message}`, "ERROR");
      }
    }

    if (pldReady && window.pageLevelDetectorv19 && typeof window.pageLevelDetectorv19.detect === 'function') {
      try {
        const pageLevel = window.pageLevelDetectorv19.detect();
        const entityType = window.pageLevelDetectorv19.detectEntityType();
        log(`Using PLD v19.0: pageLevel=${pageLevel}, entityType=${entityType}`, "SUCCESS");
        return { pageLevel, entityType, source: 'PLD v19.0' };
      } catch (e) {
        log(`Error calling PLD v19.0: ${e.message}`, "ERROR");
      }
    }

    log("Using fallback standalone detection", "WARN");
    const entityType = detectEntityTypeStandalone();
    const pageLevel = detectPageLevelStandalone(entityType);
    return { pageLevel, entityType, source: 'standalone' };
  }

  // =========================================================
  // STANDALONE DETECTION (FALLBACK)
  // =========================================================

  function cleanTextStandalone(str) {
    if (!str) return "";
    return str.toLowerCase().replace(/[^a-z0-9\s]/gi, " ").replace(/\s+/g, " ").trim();
  }

  function normalizeTextStandalone(text) {
    return cleanTextStandalone(text).replace(/[^\w\s-]/g, "").trim();
  }

  function getCleanPageNameFromUrlStandalone() {
    let path = window.location.pathname;
    path = path.replace(/\.(html|php|htm)$/i, "").replace(/^\/p\//, "").replace(/^\/blog\//, "").replace(/^\/artikel\//, "");
    const parts = path.split("/").filter(Boolean);
    let slug = parts.pop() || "";
    slug = slug.replace(/-/g, " ");
    return normalizeTextStandalone(slug);
  }

  function isHomePageStandalone() {
    const path = location.pathname.toLowerCase();
    return path === "/" || path === "/index.html" || path === "/home";
  }

  function detectEntityTypeStandalone() {
    const text = normalizeTextStandalone(
      location.href + " " + document.title + " " + (document.querySelector("h1")?.innerText || "")
    );
    if (text.includes("jasa") || text.includes("kontraktor") || text.includes("renovasi") || text.includes("borongan")) return "jasa";
    if (text.includes("sewa") || text.includes("rental") || text.includes("excavator")) return "sewa";
    if (text.includes("material") || text.includes("bahan bangunan")) return "material";
    return "produk";
  }

  function detectPageLevelStandalone(entityType) {
    if (isHomePageStandalone()) return "home";

    const urlName = getCleanPageNameFromUrlStandalone();
    const h1 = normalizeTextStandalone(document.querySelector("h1")?.innerText || "");
    const title = normalizeTextStandalone(document.title || "");
    const primaryText = cleanTextStandalone(urlName || h1 || title).toLowerCase();

    const HAS_PRICE = /\b(harga|biaya|tarif)\b/i.test(primaryText);
    const HAS_JASA = /\b(jasa|kontraktor|renovasi|pasang|borongan)\b/i.test(primaryText);
    const HAS_SEWA = /\b(sewa|rental)\b/i.test(primaryText);

    const LOCATIONS = ["jakarta", "bandung", "bekasi", "tangerang", "depok", "bogor", "surabaya", "semarang"];
    const HAS_LOCATION = LOCATIONS.some(loc => primaryText.includes(loc));

    if (primaryText.includes("spesifikasi") || primaryText.includes("ukuran") ||
      primaryText.includes("dimensi") || primaryText.includes("varian") ||
      primaryText.includes("polosan") || primaryText.includes("motif")) {
      return "variant";
    }

    if (HAS_LOCATION) return "money-child";

    if (HAS_JASA || HAS_SEWA) {
      if (HAS_PRICE) return "money-page";
      return "money-master";
    }

    if (HAS_PRICE) return "money-page";

    if (primaryText.includes("daftar") || primaryText.includes("jenis") || primaryText.includes("kategori")) {
      return "sub-pillar-tipe-2";
    }
    if (primaryText.includes("perbandingan") || primaryText.includes("vs") || primaryText.includes("versus")) {
      return "sub-pillar-tipe-1";
    }

    return "pillar";
  }

  // =========================================================
  // CEK APAKAH PERLU ARTICLE SCHEMA (BERDASARKAN V37)
  // =========================================================

  function shouldGenerateArticleSchema(pageLevel, entityType, contentFocus) {
    log(`📌 Evaluating: pageLevel=${pageLevel}, entityType=${entityType}, focus=${contentFocus}`, "INFO");

    const mandatoryArticleLevels = [
      'pillar',
      'sub-pillar-tipe-2',
      'sub-pillar-tipe-1'
    ];

    const techArticleLevels = [
      'variant',
      'sub-variant'
    ];

    if (mandatoryArticleLevels.includes(pageLevel)) {
      log(`✅ WAJIB Article schema untuk ${pageLevel} (${entityType})`, "SUCCESS");
      return true;
    }

    if (techArticleLevels.includes(pageLevel)) {
      log(`✅ WAJIB TechArticle schema untuk ${pageLevel} (${entityType})`, "SUCCESS");
      return true;
    }

    // Money Master & Money Child → Tergantung fokus konten
    if (pageLevel === 'money-master' || pageLevel === 'money-child') {
      if (contentFocus === 'informasi') {
        log(`✅ WAJIB Article schema untuk ${pageLevel.toUpperCase()} INFORMASI (EVERGREEN — V37)`, "SUCCESS");
        return true;
      } else {
        log(`⏭️ Skip Article schema untuk ${pageLevel.toUpperCase()} HARGA - pakai Product/Service schema`, "SKIP");
        return false;
      }
    }

    if (pageLevel === 'money-page') {
      if (contentFocus === 'informasi') {
        log(`✅ WAJIB Article schema untuk MONEY_PAGE INFORMASI (${entityType})`, "SUCCESS");
        return true;
      } else {
        log(`⏭️ Skip Article schema untuk MONEY_PAGE HARGA - pakai Product/Service schema`, "SKIP");
        return false;
      }
    }

    log(`⏭️ Skip Article schema untuk ${pageLevel} - tidak masuk kriteria`, "SKIP");
    return false;
  }

  // =========================================================
  // GET ARTICLE TYPE (Article / TechArticle / BlogPosting)
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
  // ARTICLE SCHEMA (DENGAN DETEKSI FOKUS KONTEN)
  // =========================================================

  function generateArticleSchema(data, dates, pageLevel, entityType) {
    const articleType = getArticleType(pageLevel);
    const focus = detectContentFocus();

    let aboutName = "Konstruksi";
    if (entityType === "jasa") aboutName = "Jasa Konstruksi";
    else if (entityType === "sewa") aboutName = "Sewa Alat Konstruksi";
    else if (entityType === "produk") aboutName = "Produk Konstruksi";
    else if (entityType === "material") aboutName = "Material Konstruksi";

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
  // EXTRACT PAGE DATA
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
  // MAIN INIT (ASYNC) — DENGAN SKIP LOGIC + WAIT BREADCRUMB + WAIT AED
  // =========================================================

  async function init() {
    log("================================");
    log("AUTO SCHEMA GENERATOR v7.5");
    log("V37 COMPLIANT + WAIT BREADCRUMB + WAIT AED");
    log("================================");

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

    const { pageLevel, entityType, source, confidence, strategies, strategyCount } = await getPageLevelAndEntityType();

    log(`ENTITY TYPE: ${entityType} (source: ${source})`, "SUCCESS");
    log(`PAGE LEVEL: ${pageLevel}`, "SUCCESS");
    if (confidence) {
      log(`   🎯 Confidence: ${confidence}% (${strategyCount} strategies: ${strategies?.join(", ")})`, "CONFIDENCE");
    }

    const pageData = extractPageData();

    const contentFocus = detectContentFocus();
    log(`📌 Content Focus: ${contentFocus.toUpperCase()}`, "FOCUS");

    document.body.setAttribute("data-schema-page-level", pageLevel);
    document.body.setAttribute("data-schema-entity-type", entityType);
    document.body.setAttribute("data-schema-source", source);
    document.body.setAttribute("data-schema-content-focus", contentFocus);
    if (confidence) {
      document.body.setAttribute("data-schema-confidence", confidence);
    }

    const homeElem = document.getElementById("auto-schema-home");
    if (homeElem && pageLevel === "home") {
      homeElem.textContent = JSON.stringify(generateHomePageSchema(pageData), null, 2);
      log("HOMEPAGE SCHEMA GENERATED", "SUCCESS");
    }

    log("⚡ Menunggu AEDMetaDates...", "AED");
    const aedData = await waitForAEDMetaDates(CONFIG.AED_TIMEOUT);
    if (aedData) {
      log(`✅ AED ready: ${aedData.dateModified}`, "AED");
    } else {
      log(`⚠️ AED tidak tersedia, gunakan fallback`, "WARN");
    }

    const articleElem = document.getElementById("auto-schema");
    if (articleElem && shouldGenerateArticleSchema(pageLevel, entityType, contentFocus)) {
      const dates = aedData || {
        datePublished: new Date().toISOString(),
        dateModified: new Date().toISOString()
      };
      articleElem.textContent = JSON.stringify(
        generateArticleSchema(pageData, dates, pageLevel, entityType),
        null,
        2
      );
      log(`ARTICLE SCHEMA GENERATED (${getArticleType(pageLevel)})`, "SUCCESS");
      if (pageLevel === 'money-master' || pageLevel === 'money-child') {
        log(`   ✅ ${pageLevel.toUpperCase()} INFORMASI → Article schema (EVERGREEN — V37)`, "SUCCESS");
      }
    } else if (articleElem) {
      articleElem.textContent = "";
      log("Article schema skipped - using Service/Product schema instead", "INFO");
    }

    log("================================");
    log("FINISHED");
    log(`   ✅ Page Level: ${pageLevel}`);
    log(`   ✅ Entity Type: ${entityType}`);
    log(`   ✅ Content Focus: ${contentFocus}`);
    log(`   ✅ Breadcrumb: ${breadcrumbReady ? 'READY ✅' : 'NOT FOUND ⚠️'}`);
    log(`   ✅ AED: ${aedData ? 'READY ✅' : 'FALLBACK ⚠️'}`);
    log(`   ✅ Article Schema: ${articleElem && shouldGenerateArticleSchema(pageLevel, entityType, contentFocus) ? 'GENERATED' : 'SKIPPED'}`);
    if (pageLevel === 'money-master' || pageLevel === 'money-child') {
      log(`   ✅ ${pageLevel.toUpperCase()} ${contentFocus.toUpperCase()}: ${contentFocus === 'informasi' ? 'Article (EVERGREEN)' : 'Product/Service (NON-EVERGREEN)'} — V37`);
    }
    log("================================");
  }

  // =========================================================
  // START — WAIT DOM READY
  // =========================================================

  waitForDOM().then(() => {
    init();
  });

})();
