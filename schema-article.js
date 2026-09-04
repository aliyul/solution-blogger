/**
 * AUTO-SCHEMA GENERATOR v7.1 FINAL STABLE
 * INTEGRATED WITH Page Level Detector v22.x & Smart Evergreen Detector v15.2
 * 
 * ✅ FIX v7.1: SKIP LOGIC untuk Homepage & Halaman Statis
 * ✅ FIX v7.1: DOMContentLoaded waiter sebelum eksekusi
 * ✅ FIX: Deteksi fokus konten berdasarkan H1 (prioritas utama)
 * ✅ FIX: Tabel harga → PRIORITAS HARGA
 * ✅ FIX: H1 mengandung tahun → PRIORITAS HARGA (non-evergreen)
 * ✅ FIX: H1 mengandung Rp → PRIORITAS HARGA
 * ✅ FIX: Sinkron dengan v15.2 (Smart Evergreen Detector)
 * ✅ FIX: Money Page Harga → PAKAI Product schema
 * ✅ FIX: Money Page Informasi → PAKAI Article schema
 * ✅ FIX: Hapus WebPage schema fallback untuk artikel
 *
 * @version 7.1 FINAL STABLE
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
          console.log("[Schema v7.1] ✅ DOM siap");
          resolve();
        });
      } else {
        console.log("[Schema v7.1] ✅ DOM sudah siap");
        resolve();
      }
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
    SKIP_WORD_COUNT: 300
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
      PRIORITY: "🔴"
    };
    console.log(`${icons[type] || "📘"} [Schema v7.1] ${msg}`);
  }

  // =========================================================
  // SKIP LOGIC — CEK APAKAH HALAMAN PERLU DIPROSES
  // =========================================================

  function shouldSkipPage() {
    const currentPath = window.location.pathname;
    const currentUrl = window.location.href;

    // 1. CEK HOMEPAGE
    const isHomepage = currentPath === '/' || currentPath === '/index.html' || currentPath === '';
    if (isHomepage) {
      log(`⏭️ SKIP: HOMEPAGE (${currentPath})`, "SKIP");
      return true;
    }

    // 2. CEK HALAMAN STATIS
    const isStaticPage = STATIC_PAGES.some(page => currentPath.includes(page));
    if (isStaticPage) {
      log(`⏭️ SKIP: HALAMAN STATIS (${currentPath})`, "SKIP");
      return true;
    }

    // 3. CEK HALAMAN TANPA KONTEN UTAMA
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
  // DETEKSI FOKUS KONTEN (PRIORITAS H1 + TABEL HARGA)
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

    // CEK TAHUN DI H1
    const yearPattern = /\b(19|20)\d{2}\b/;
    const hasYear = yearPattern.test(h1Text);

    if (hasYear) {
      log(`🔴 PRIORITAS: H1 mengandung tahun → HARGA (non-evergreen)`, "PRIORITY");
      log(`   📝 H1: "${h1Text}"`, "H1");
      return 'harga';
    }

    // CEK Rp DI H1
    const hasRpFormat = /Rp\s*[\d.,]+/.test(h1Text);
    if (hasRpFormat) {
      log(`🔴 PRIORITAS: H1 mengandung Rp → HARGA`, "PRIORITY");
      log(`   📝 H1: "${h1Text}"`, "H1");
      return 'harga';
    }

    // CEK KATA HARGA DI H1
    const priceKeywordsInH1 = ['harga', 'biaya', 'tarif', 'estimasi', 'penawaran', 'promo', 'diskon'];
    const hasPriceInH1 = priceKeywordsInH1.some(k => h1Text.includes(k));
    if (hasPriceInH1) {
      log(`🔴 PRIORITAS: H1 mengandung kata harga → HARGA`, "PRIORITY");
      log(`   📝 H1: "${h1Text}"`, "H1");
      return 'harga';
    }

    // CEK SATUAN HARGA DI H1
    const unitPattern = /per\s*(meter|lembar|batang|kubik|m|m2|m²|lbr|buah|unit)/;
    const hasUnitInH1 = unitPattern.test(h1Text);
    if (hasUnitInH1) {
      log(`🔴 PRIORITAS: H1 mengandung satuan harga → HARGA`, "PRIORITY");
      log(`   📝 H1: "${h1Text}"`, "H1");
      return 'harga';
    }

    // =========================================================
    // PRIORITAS 2: CEK TABEL HARGA
    // =========================================================

    const tables = document.querySelectorAll('table');
    let hasPriceTable = false;
    let priceTableDetails = '';

    tables.forEach((table, index) => {
      const tableText = table.innerText.toLowerCase();
      const hasPriceColumn = /harga|biaya|estimasi|rp|rupiah|total|subtotal/i.test(tableText);
      const hasNumbers = (tableText.match(/[\d.,]+/g) || []).length >= 3;
      const hasUnit = /per\s*(meter|lembar|batang|kubik|m|m2|m²|lbr|buah|unit)/i.test(tableText);

      if (hasPriceColumn && hasNumbers) {
        hasPriceTable = true;
        priceTableDetails = `Tabel ${index + 1}: price column + ${(tableText.match(/[\d.,]+/g) || []).length} angka`;
      }
    });

    if (hasPriceTable) {
      log(`🔴 PRIORITAS: Ada tabel harga → HARGA`, "PRIORITY");
      log(`   📊 ${priceTableDetails}`, "TABLE");
      return 'harga';
    }

    // =========================================================
    // PRIORITAS 3: CEK KONTEN (SKOR)
    // =========================================================

    // KATA KUNCI INFORMASI/EDUKASI
    const eduKeywords = [
      'panduan', 'spesifikasi', 'keunggulan', 'ukuran', 'dimensi', 'cara memilih',
      'tips', 'informasi', 'pengertian', 'definisi', 'jenis', 'macam', 'tipe',
      'perbedaan', 'kelebihan', 'kekurangan', 'material', 'bahan', 'standar',
      'mutu', 'k225', 'k250', 'k300', 'komposisi', 'struktur', 'aplikasi',
      'penggunaan', 'manfaat', 'keuntungan', 'solusi', 'rekomendasi',
      'panduan lengkap', 'langkah', 'tutorial', 'pedoman', 'petunjuk',
      'kenali', 'mengenal', 'memahami', 'belajar'
    ];

    // KATA KUNCI HARGA
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

    // Bonus: CTA harga
    const hasPriceCTA = document.querySelector('.cta-box, .cta-button, .btn-wa, [href*="wa.me"]')?.innerText?.toLowerCase()?.includes('harga') || false;
    if (hasPriceCTA) priceScore += 2;

    log(`📊 Edu Score: ${eduScore}, Price Score: ${priceScore}`, "FOCUS");

    // =========================================================
    // PRIORITAS 4: LOGIKA FINAL BERDASARKAN SKOR
    // =========================================================

    // Jika skor harga jauh lebih tinggi
    if (priceScore > eduScore * 1.5) {
      log(`🎯 Fokus: HARGA (price: ${priceScore}, edu: ${eduScore})`, "FOCUS");
      return 'harga';
    }

    // Jika skor edukasi jauh lebih tinggi
    if (eduScore > priceScore * 1.5) {
      log(`🎯 Fokus: INFORMASI/EDUKASI (edu: ${eduScore}, price: ${priceScore})`, "FOCUS");
      return 'informasi';
    }

    // Jika keduanya rendah, cek H1 dan URL
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

    // Default: jika skor edukasi >= skor harga
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

    // =========================================================
    // LEVEL YANG WAJIB ARTICLE SCHEMA
    // =========================================================
    const mandatoryArticleLevels = [
      'pillar',
      'sub-pillar-tipe-2',
      'sub-pillar-tipe-1'
    ];

    // =========================================================
    // LEVEL YANG WAJIB TechArticle (untuk konten teknis)
    // =========================================================
    const techArticleLevels = [
      'variant',
      'sub-variant'
    ];

    // =========================================================
    // LEVEL YANG TIDAK PAKAI ARTICLE (pakai Service/Product)
    // =========================================================
    const nonArticleLevels = [
      'money-master',
      'money-child'
    ];

    // 1. CEK: Pillar, SP2, SP1 → WAJIB Article
    if (mandatoryArticleLevels.includes(pageLevel)) {
      log(`✅ WAJIB Article schema untuk ${pageLevel} (${entityType})`, "SUCCESS");
      return true;
    }

    // 2. CEK: Variant, Sub-Variant → WAJIB TechArticle
    if (techArticleLevels.includes(pageLevel)) {
      log(`✅ WAJIB TechArticle schema untuk ${pageLevel} (${entityType})`, "SUCCESS");
      return true;
    }

    // 3. CEK: Money Master, Money Child → TIDAK PAKAI Article
    if (nonArticleLevels.includes(pageLevel)) {
      log(`⏭️ Skip Article schema untuk ${pageLevel} - pakai Service/Product schema`, "SKIP");
      return false;
    }

    // 4. CEK: Money Page → Tergantung fokus konten
    if (pageLevel === 'money-page') {
      if (contentFocus === 'informasi') {
        log(`✅ WAJIB Article schema untuk MONEY_PAGE INFORMASI (${entityType})`, "SUCCESS");
        return true;
      } else {
        log(`⏭️ Skip Article schema untuk MONEY_PAGE HARGA - pakai Product schema`, "SKIP");
        return false;
      }
    }

    // 5. FALLBACK: Jika tidak masuk kriteria di atas
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
    else if (pageLevel === 'money-page' && focus === 'informasi') articleSection = "Informasi Produk";

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
  // WAIT AED META DATES
  // =========================================================

  function waitForAEDMetaDates(callback) {
    let elapsed = 0;
    const interval = setInterval(() => {
      if (window.AEDMetaDates) {
        clearInterval(interval);
        callback(window.AEDMetaDates);
      } else if (elapsed >= CONFIG.AED_TIMEOUT) {
        clearInterval(interval);
        callback({
          datePublished: new Date().toISOString(),
          dateModified: new Date().toISOString()
        });
      }
      elapsed += 100;
    }, 100);
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
  // MAIN INIT (ASYNC) — DENGAN SKIP LOGIC
  // =========================================================

  async function init() {
    log("================================");
    log("AUTO SCHEMA GENERATOR v7.1");
    log("V37 COMPLIANT");
    log("================================");

    // ============================================================
    // 🔥 STEP 1: SKIP LOGIC — CEK APAKAH HALAMAN PERLU DIPROSES
    // ============================================================

    if (shouldSkipPage()) {
      log("⏭️ Script dihentikan untuk halaman ini", "SKIP");
      return;
    }

    // ============================================================
    // 🔥 STEP 2: DAPATKAN PAGE LEVEL & ENTITY TYPE
    // ============================================================

    const { pageLevel, entityType, source, confidence, strategies, strategyCount } = await getPageLevelAndEntityType();

    log(`ENTITY TYPE: ${entityType} (source: ${source})`, "SUCCESS");
    log(`PAGE LEVEL: ${pageLevel}`, "SUCCESS");
    if (confidence) {
      log(`   🎯 Confidence: ${confidence}% (${strategyCount} strategies: ${strategies?.join(", ")})`, "CONFIDENCE");
    }

    // ============================================================
    // 🔥 STEP 3: EKSTRAK DATA PAGE
    // ============================================================

    const pageData = extractPageData();

    // ============================================================
    // 🔥 STEP 4: DETEKSI FOKUS KONTEN
    // ============================================================

    const contentFocus = detectContentFocus();
    log(`📌 Content Focus: ${contentFocus.toUpperCase()}`, "FOCUS");

    // ============================================================
    // 🔥 STEP 5: TAMBAHKAN ATRIBUT KE BODY
    // ============================================================

    document.body.setAttribute("data-schema-page-level", pageLevel);
    document.body.setAttribute("data-schema-entity-type", entityType);
    document.body.setAttribute("data-schema-source", source);
    document.body.setAttribute("data-schema-content-focus", contentFocus);
    if (confidence) {
      document.body.setAttribute("data-schema-confidence", confidence);
    }

    // ============================================================
    // 🔥 STEP 6: HOMEPAGE SCHEMA
    // ============================================================

    const homeElem = document.getElementById("auto-schema-home");
    if (homeElem && pageLevel === "home") {
      homeElem.textContent = JSON.stringify(generateHomePageSchema(pageData), null, 2);
      log("HOMEPAGE SCHEMA GENERATED", "SUCCESS");
    }

    // ============================================================
    // 🔥 STEP 7: ARTICLE SCHEMA (BERDASARKAN ATURAN V37)
    // ============================================================

    const articleElem = document.getElementById("auto-schema");
    if (articleElem && shouldGenerateArticleSchema(pageLevel, entityType, contentFocus)) {
      waitForAEDMetaDates((dates) => {
        articleElem.textContent = JSON.stringify(
          generateArticleSchema(pageData, dates, pageLevel, entityType),
          null,
          2
        );
        log(`ARTICLE SCHEMA GENERATED (${getArticleType(pageLevel)})`, "SUCCESS");
      });
    } else if (articleElem) {
      articleElem.textContent = "";
      log("Article schema skipped - using Service/Product schema instead", "INFO");
    }

    // ============================================================
    // 🔥 STEP 8: CATATAN
    // ============================================================

    log("================================");
    log("FINISHED");
    log(`   ✅ Page Level: ${pageLevel}`);
    log(`   ✅ Entity Type: ${entityType}`);
    log(`   ✅ Content Focus: ${contentFocus}`);
    log(`   ✅ Article Schema: ${articleElem && shouldGenerateArticleSchema(pageLevel, entityType, contentFocus) ? 'GENERATED' : 'SKIPPED'}`);
    log("================================");
  }

  // =========================================================
  // START — WAIT DOM READY
  // =========================================================

  waitForDOM().then(() => {
    init();
  });

})();
