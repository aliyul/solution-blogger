/**
 * AUTO-SCHEMA GENERATOR v6.8 FINAL STABLE
 * INTEGRATED WITH Page Level Detector v22.x
 * 
 * ✅ FIX: Article schema hanya untuk Pillar, SP2, SP1
 * ✅ FIX: Variant & Sub-Variant pakai Product schema
 * ✅ FIX: Money pages pakai Service/Product schema
 * ✅ FIX: Hapus WebPage schema fallback
 * ✅ FIX: Article type = Article / BlogPosting (bukan HowTo/Product)
 *
 * @version 6.8 FINAL STABLE
 * @date 2026-08-11
 */

(function () {

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
    PLD_TIMEOUT: 10000
  };

  // =========================================================
  // TYPE LEVEL MAP
  // =========================================================

  const TYPE_LEVEL_MAP = {
    home: 0,
    pillar: 1,
    "sub-pillar-tipe-2": 2,
    "sub-pillar-tipe-1": 3,
    "money-master": 4,
    "money-page": 5,
    "money-child": 6,
    variant: 7,
    "sub-variant": 8
  };

  // =========================================================
  // YANG PAKAI ARTICLE SCHEMA (HANYA INI)
  // =========================================================
  // Article schema HANYA untuk konten edukasi:
  // - pillar
  // - sub-pillar-tipe-2
  // - sub-pillar-tipe-1
  //
  // Variant, Sub-Variant, dan semua Money pages
  // TIDAK menggunakan Article schema

  const ARTICLE_SCHEMA_LEVELS = [
    'pillar',
    'sub-pillar-tipe-2',
    'sub-pillar-tipe-1'
  ];

  // =========================================================
  // LOGGER
  // =========================================================

  function log(msg, type = "INFO") {
    if (!CONFIG.DEBUG && type === "INFO") return;
    const icons = { INFO: "📘", WARN: "⚠️", ERROR: "❌", SUCCESS: "✅", CONFIDENCE: "🎯" };
    console.log(`${icons[type] || "📘"} [Schema v6.8] ${msg}`);
  }

  // =========================================================
  // TUNGGU PAGE LEVEL DETECTOR READY
  // =========================================================

  function waitForPageLevelDetector() {
    return new Promise((resolve) => {
      // ✅ SUPPORT v22.x
      if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
        log("Page Level Detector v22.x already ready", "SUCCESS");
        resolve(true);
        return;
      }
      
      // ✅ SUPPORT v20.x
      if (window.pageLevelDetectorv20 && typeof window.pageLevelDetectorv20.detect === 'function') {
        log("Page Level Detector v20.x already ready", "SUCCESS");
        resolve(true);
        return;
      }
      
      // ✅ SUPPORT v19.0
      if (window.pageLevelDetectorv19 && typeof window.pageLevelDetectorv19.detect === 'function') {
        log("Page Level Detector v19.0 already ready", "SUCCESS");
        resolve(true);
        return;
      }
      
      // ✅ SUPPORT v18
      if (window.pageLevelDetectorV18 && typeof window.pageLevelDetectorV18.detect === 'function') {
        log("Page Level Detector v18 already ready", "SUCCESS");
        resolve(true);
        return;
      }
      
      // ✅ SUPPORT v17
      if (window.pageLevelDetectorV17 && typeof window.pageLevelDetectorV17.detect === 'function') {
        log("Page Level Detector v17 already ready", "SUCCESS");
        resolve(true);
        return;
      }
      
      // ✅ SUPPORT legacy
      if (window.pageLevelDetector && typeof window.pageLevelDetector.detect === 'function') {
        log("Page Level Detector legacy already ready", "SUCCESS");
        resolve(true);
        return;
      }
      
      // ✅ Event listener untuk semua versi
      const onReady = () => {
        log("Page Level Detector ready (event)", "SUCCESS");
        resolve(true);
      };
      
      window.addEventListener("pageLevelDetectorv22Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorv20Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorv19Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorReady", onReady, { once: true });
      
      // Fallback timeout
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
  // GET PAGE LEVEL & ENTITY TYPE
  // =========================================================

  async function getPageLevelAndEntityType() {
    const pldReady = await waitForPageLevelDetector();
    
    // ✅ PRIORITAS v22.x
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
      } catch(e) {
        log(`Error calling PLD v22.x: ${e.message}`, "ERROR");
      }
    }
    
    // ✅ FALLBACK v20.x
    if (pldReady && window.pageLevelDetectorv20 && typeof window.pageLevelDetectorv20.detect === 'function') {
      try {
        const pageLevel = window.pageLevelDetectorv20.detect();
        const entityType = window.pageLevelDetectorv20.detectEntityType();
        log(`Using PLD v20.x: pageLevel=${pageLevel}, entityType=${entityType}`, "SUCCESS");
        return { pageLevel, entityType, source: 'PLD v20.x' };
      } catch(e) {
        log(`Error calling PLD v20.x: ${e.message}`, "ERROR");
      }
    }
    
    // ✅ FALLBACK v19.0
    if (pldReady && window.pageLevelDetectorv19 && typeof window.pageLevelDetectorv19.detect === 'function') {
      try {
        const pageLevel = window.pageLevelDetectorv19.detect();
        const entityType = window.pageLevelDetectorv19.detectEntityType();
        log(`Using PLD v19.0: pageLevel=${pageLevel}, entityType=${entityType}`, "SUCCESS");
        return { pageLevel, entityType, source: 'PLD v19.0' };
      } catch(e) {
        log(`Error calling PLD v19.0: ${e.message}`, "ERROR");
      }
    }
    
    // ✅ FALLBACK standalone
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
    
    // Deteksi variant
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
  // CEK APAKAH PERLU ARTICLE SCHEMA
  // =========================================================

  function shouldGenerateArticleSchema(pageLevel, entityType) {
    // Hanya generate Article schema untuk level EDUKASI (Pillar, SP2, SP1)
    if (!ARTICLE_SCHEMA_LEVELS.includes(pageLevel)) {
      log(`Skip Article schema for ${pageLevel} - use Service/Product schema instead`, "INFO");
      return false;
    }
    
    // Variant dan Sub-Variant TIDAK pakai Article schema
    const variantLevels = ['variant', 'sub-variant'];
    if (variantLevels.includes(pageLevel)) {
      log(`Skip Article schema for ${pageLevel} - Product schema handled by other script`, "INFO");
      return false;
    }
    
    // SEMUA money pages TIDAK pakai Article schema
    const moneyLevels = ['money-master', 'money-page', 'money-child'];
    if (moneyLevels.includes(pageLevel)) {
      log(`Skip Article schema for ${pageLevel} - Service/Product schema handled by other script`, "INFO");
      return false;
    }
    
    // Hanya Pillar, SP2, SP1 yang pakai Article schema
    log(`Generate Article schema for ${pageLevel} (${entityType})`, "SUCCESS");
    return true;
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
  // ARTICLE SCHEMA (KHUSUS UNTUK KONTEN EDUKASI)
  // =========================================================

  function generateArticleSchema(data, dates, pageLevel, entityType) {
    // Article schema HANYA untuk konten edukasi
    // Gunakan Article atau BlogPosting
    const articleType = pageLevel === 'pillar' ? "BlogPosting" : "Article";
    
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
      "about": {
        "@type": "Thing",
        "name": entityType === "jasa" ? "Jasa Konstruksi" : 
                entityType === "sewa" ? "Sewa Alat Konstruksi" :
                entityType === "produk" ? "Produk Konstruksi" : "Material Konstruksi"
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
  // MAIN INIT (ASYNC)
  // =========================================================

  async function init() {
    log("================================");
    log("AUTO SCHEMA GENERATOR v6.8");
    log("================================");
    
    // Gunakan PLD untuk deteksi
    const { pageLevel, entityType, source, confidence, strategies, strategyCount } = await getPageLevelAndEntityType();
    
    log(`ENTITY TYPE: ${entityType} (source: ${source})`, "SUCCESS");
    log(`PAGE LEVEL: ${pageLevel} (L${TYPE_LEVEL_MAP[pageLevel]})`, "SUCCESS");
    if (confidence) {
      log(`   🎯 Detection Confidence: ${confidence}% (${strategyCount} strategies: ${strategies?.join(", ")})`, "CONFIDENCE");
    }
    
    const pageData = extractPageData();
    
    // Tambahkan atribut ke body
    document.body.setAttribute("data-schema-page-level", pageLevel);
    document.body.setAttribute("data-schema-entity-type", entityType);
    document.body.setAttribute("data-schema-source", source);
    if (confidence) {
      document.body.setAttribute("data-schema-confidence", confidence);
    }
    
    // =============================================
    // HOMEPAGE SCHEMA
    // =============================================
    const homeElem = document.getElementById("auto-schema-home");
    if (homeElem && pageLevel === "home") {
      homeElem.textContent = JSON.stringify(generateHomePageSchema(pageData), null, 2);
      log("HOMEPAGE SCHEMA GENERATED", "SUCCESS");
    }
    
    // =============================================
    // ARTICLE SCHEMA (KHUSUS EDUKASI: PILLAR, SP2, SP1)
    // =============================================
    const articleElem = document.getElementById("auto-schema");
    if (articleElem && shouldGenerateArticleSchema(pageLevel, entityType)) {
      waitForAEDMetaDates((dates) => {
        articleElem.textContent = JSON.stringify(
          generateArticleSchema(pageData, dates, pageLevel, entityType),
          null,
          2
        );
        log("ARTICLE SCHEMA GENERATED", "SUCCESS");
      });
    } else if (articleElem) {
      // Kosongkan jika tidak generate Article schema
      articleElem.textContent = "";
      log("Article schema skipped - using Service/Product schema instead", "INFO");
    }
    
    // =============================================
    // CATATAN: Service & Product schema ditangani oleh script lain
    // =============================================
    // - JASA → Service schema (auto-schema-service)
    // - PRODUK/SEWA/MATERIAL → Product schema (auto-schema-product)
    // - FAQ → FAQ schema (auto-schema-faq) - WAJIB SEMUA PAGE
    // =============================================
    
    log("================================");
    log("FINISHED");
    log("================================");
  }

  // =========================================================
  // START
  // =========================================================

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
