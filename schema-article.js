/**
 * AUTO-SCHEMA GENERATOR v6.1 FINAL
 * HIERARCHY FINAL + MONEY SYSTEM FIX
 *
 * FINAL RULE:
 *
 * PILLAR:
 * - jasa konstruksi
 * - sewa alat konstruksi
 * - produk konstruksi
 * - produk interior
 * - material konstruksi
 *
 * MONEY MASTER (L4):
 * - root commercial entity
 * - sewa excavator
 * - harga ready mix
 * - harga wiremesh
 *
 * MONEY PAGE (L5):
 * - detail commercial entity
 * - harga sewa excavator
 * - harga ready mix k300
 * - harga panel beton pagar
 *
 * MONEY CHILD (L6):
 * - geo commercial entity
 * - harga sewa excavator jakarta
 * - sewa excavator bandung
 *
 * @version 6.1 FINAL
 * @date 2026-05-17
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
    CURRENT_YEAR: new Date().getFullYear()
  };

  // =========================================================
  // LEVEL MAP
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
  // ENTITY PILLAR FINAL
  // =========================================================

  const ENTITY_PILLAR_KEYWORDS = {
    jasa: [
      "jasa konstruksi"
    ],

    sewa: [
      "sewa alat konstruksi"
    ],

    produk: [
      "produk konstruksi",
      "produk interior"
    ],

    material: [
      "material konstruksi"
    ]
  };

  // =========================================================
  // KEYWORDS
  // =========================================================

  const HOME_KEYWORDS = [
    "beranda",
    "home",
    "homepage",
    "halaman utama"
  ];

  const PILLAR_KEYWORDS = [
    "panduan",
    "tutorial",
    "cara",
    "tips",
    "apa itu",
    "pengertian",
    "definisi",
    "belajar",
    "penjelasan",
    "edukasi"
  ];

  const SP1_KEYWORDS = [
    "vs",
    "versus",
    "perbandingan",
    "bandingkan",
    "kelebihan",
    "kekurangan",
    "mana yang lebih baik"
  ];

  const SP2_KEYWORDS = [
    "jenis",
    "macam",
    "daftar",
    "kategori",
    "tipe"
  ];

  const VARIANT_KEYWORDS = [
    "spesifikasi",
    "ukuran",
    "dimensi",
    "kapasitas",
    "mutu",
    "grade",
    "model",
    "type",
    "tipe"
  ];

  // =========================================================
  // LOCATION
  // =========================================================

  const LOCATION_WHITELIST = new Set([
    "jakarta",
    "bogor",
    "depok",
    "tangerang",
    "bekasi",
    "bandung",
    "karawang",
    "cirebon",
    "semarang",
    "surabaya",
    "yogyakarta",
    "jogja",
    "solo",
    "medan",
    "makassar",
    "bali",
    "denpasar",
    "batam",
    "palembang",
    "lampung",
    "pontianak",
    "balikpapan",
    "banjarmasin"
  ]);

  // =========================================================
  // SPECIFIC MODIFIER
  // =========================================================

  const SPECIFIC_MODIFIERS = [
    "k300",
    "k225",
    "k250",
    "m8",
    "m6",
    "m10",
    "minimix",
    "long arm",
    "breaker",
    "vibrator",
    "pagar",
    "full cor",
    "per m2",
    "per meter",
    "per lembar",
    "murah"
  ];

  // =========================================================
  // STOPWORDS
  // =========================================================

  const STOPWORDS = new Set([
    "dan",
    "di",
    "ke",
    "dari",
    "yang",
    "untuk",
    "dengan",
    "adalah",
    "atau",
    "ini",
    "itu",
    "kami",
    "anda"
  ]);

  // =========================================================
  // LOGGER
  // =========================================================

  function log(msg, type = "INFO") {

    if (!CONFIG.DEBUG && type === "INFO") return;

    const icons = {
      INFO: "📘",
      WARN: "⚠️",
      ERROR: "❌",
      SUCCESS: "✅"
    };

    console.log(`${icons[type] || "📘"} [Schema v6.1] ${msg}`);
  }

  // =========================================================
  // CLEAN TEXT
  // =========================================================

  function cleanText(str) {

    if (!str) return "";

    return str
      .replace(/\s+/g, " ")
      .trim();
  }

  // =========================================================
  // ESCAPE JSON
  // =========================================================

  function escapeJSON(str) {

    if (!str) return "";

    return str
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, " ")
      .replace(/\r/g, " ")
      .trim();
  }

  // =========================================================
  // CLEAN URL NAME
  // =========================================================

  function getCleanPageNameFromUrl() {

    let path = window.location.pathname;

    path = path
      .replace(/\.(html|php|htm)$/i, "")
      .replace(/^\/p\//, "")
      .replace(/^\//, "")
      .replace(/-/g, " ");

    return cleanText(path);
  }

  // =========================================================
  // HOMEPAGE
  // =========================================================

  function isHomePage() {

    const path = location.pathname.toLowerCase();

    return (
      path === "/" ||
      path === "/index.html" ||
      path === "/home"
    );
  }

  // =========================================================
  // ENTITY TYPE
  // =========================================================

  function detectEntityType() {

    const text = (
      location.href +
      " " +
      document.title +
      " " +
      (document.querySelector("h1")?.innerText || "")
    ).toLowerCase();

    if (
      text.includes("jasa") ||
      text.includes("kontraktor") ||
      text.includes("waterproofing")
    ) {
      return "jasa";
    }

    if (
      text.includes("sewa") ||
      text.includes("rental") ||
      text.includes("alat berat")
    ) {
      return "sewa";
    }

    if (
      text.includes("material") ||
      text.includes("bahan bangunan")
    ) {
      return "material";
    }

    return "produk";
  }

  // =========================================================
  // LOCATION DETECTION FINAL
  // =========================================================

  function isLocation(text) {

    if (!text) return false;

    const lower = text.toLowerCase();

    for (const city of LOCATION_WHITELIST) {

      const regex = new RegExp(`\\b${city}\\b`, "i");

      if (regex.test(lower)) {
        return true;
      }
    }

    return false;
  }

  // =========================================================
  // SPECIFIC PRODUCT
  // =========================================================

  function isSpecificProduct(text) {

    const lower = text.toLowerCase();

    for (const modifier of SPECIFIC_MODIFIERS) {

      if (lower.includes(modifier)) {
        return true;
      }
    }

    if (/\d/.test(lower)) {
      return true;
    }

    return false;
  }

  // =========================================================
  // SUB VARIANT
  // =========================================================

  function isSubVariant(text) {

    if (!text) return false;

    const numberCount =
      (text.match(/\d+/g) || []).length;

    const xCount =
      (text.match(/x/g) || []).length;

    return numberCount >= 3 || xCount >= 2;
  }

  // =========================================================
  // ENTITY PILLAR
  // =========================================================

  function detectEntityPillar(text, entityType) {

    const lower = text.toLowerCase().trim();

    const keywords =
      ENTITY_PILLAR_KEYWORDS[entityType] || [];

    for (const kw of keywords) {

      if (lower === kw) {

        log(`ENTITY PILLAR → ${kw}`, "SUCCESS");

        return "pillar";
      }
    }

    return null;
  }

  // =========================================================
  // PAGE LEVEL DETECTION FINAL
  // =========================================================

  function detectPageLevel(entityType) {

    // =============================================
    // HOME
    // =============================================

    if (isHomePage()) {

      log("HOME DETECTED", "SUCCESS");

      return "home";
    }

    const urlName = getCleanPageNameFromUrl();

    const h1 =
      (document.querySelector("h1")?.innerText || "")
      .toLowerCase();

    const title =
      document.title.toLowerCase();

    const primaryText =
      cleanText(urlName || h1 || title);

    const isJasa = entityType === "jasa";
    const isSewa = entityType === "sewa";

    log(`PRIMARY TEXT: ${primaryText}`);

    // =============================================
    // ENTITY PILLAR
    // =============================================

    const entityPillar =
      detectEntityPillar(primaryText, entityType);

    if (entityPillar) {
      return entityPillar;
    }

    // =============================================
    // SUB VARIANT
    // =============================================

    if (isSubVariant(primaryText)) {

      log("SUB VARIANT", "SUCCESS");

      return "sub-variant";
    }

    // =============================================
    // PILLAR INFO
    // =============================================

    for (const kw of PILLAR_KEYWORDS) {

      if (primaryText.includes(kw)) {

        return "pillar";
      }
    }

    // =============================================
    // SP1
    // =============================================

    for (const kw of SP1_KEYWORDS) {

      if (primaryText.includes(kw)) {

        return "sub-pillar-tipe-1";
      }
    }

    // =============================================
    // SP2
    // =============================================

    for (const kw of SP2_KEYWORDS) {

      if (primaryText.includes(kw)) {

        return "sub-pillar-tipe-2";
      }
    }

    // =============================================
    // MONEY SYSTEM FINAL
    // =============================================

    const HAS_PRICE_WORD =
      /\b(harga|biaya|tarif)\b/i.test(primaryText);

    const HAS_SEWA_WORD =
      /\b(sewa|rental)\b/i.test(primaryText);

    if (HAS_PRICE_WORD || HAS_SEWA_WORD) {

      log("MONEY INTENT DETECTED", "INFO");

      // =========================================
      // LOCATION
      // =========================================

      if (isLocation(primaryText)) {

        log("MONEY CHILD", "SUCCESS");

        return "money-child";
      }

      // =========================================
      // JASA
      // =========================================

      if (isJasa) {

        log("JASA MONEY PAGE", "SUCCESS");

        return "money-page";
      }

      // =========================================
      // SEWA
      // =========================================

      if (isSewa) {

        // harga sewa excavator

        if (
          HAS_PRICE_WORD &&
          HAS_SEWA_WORD
        ) {

          log("SEWA + HARGA", "SUCCESS");

          return "money-page";
        }

        // sewa excavator

        if (
          !HAS_PRICE_WORD &&
          HAS_SEWA_WORD
        ) {

          log("PURE SEWA", "SUCCESS");

          return "money-master";
        }
      }

      // =========================================
      // PRODUK / MATERIAL
      // =========================================

      if (HAS_PRICE_WORD) {

        const cleaned =
          primaryText
            .replace(/harga|biaya|tarif/gi, "")
            .replace(/\b\d{4}\b/g, "")
            .trim();

        const words =
          cleaned
            .split(/\s+/)
            .filter(Boolean);

        const wordCount =
          words.length;

        const specific =
          isSpecificProduct(cleaned);

        log(`PRODUCT WORD COUNT: ${wordCount}`);

        // ROOT COMMERCIAL

        if (
          wordCount <= 2 &&
          !specific
        ) {

          return "money-master";
        }

        // DETAIL COMMERCIAL

        return "money-page";
      }
    }

    // =============================================
    // JASA
    // =============================================

    if (isJasa) {

      if (isLocation(primaryText)) {

        return "money-child";
      }

      return "money-page";
    }

    // =============================================
    // SEWA
    // =============================================

    if (isSewa) {

      if (isLocation(primaryText)) {

        return "money-child";
      }

      return "money-master";
    }

    // =============================================
    // VARIANT
    // =============================================

    for (const kw of VARIANT_KEYWORDS) {

      if (primaryText.includes(kw)) {

        return "variant";
      }
    }

    // =============================================
    // DEFAULT
    // =============================================

    return "sub-pillar-tipe-2";
  }

  // =========================================================
  // CLEAN ARTICLE BODY
  // =========================================================

  function getCleanArticleBody(contentElement) {

    if (!contentElement) return "";

    const clone =
      contentElement.cloneNode(true);

    clone.querySelectorAll(
      "script,style,noscript,iframe,svg"
    ).forEach(el => el.remove());

    let text =
      cleanText(clone.innerText || "");

    if (
      text.length >
      CONFIG.MAX_ARTICLE_BODY_LENGTH
    ) {

      text =
        text.substring(
          0,
          CONFIG.MAX_ARTICLE_BODY_LENGTH
        ) + "...";
    }

    return text;
  }

  // =========================================================
  // WORD COUNT
  // =========================================================

  function getAccurateWordCount(contentElement) {

    if (!contentElement) return 0;

    const text =
      cleanText(contentElement.innerText || "");

    return text
      .split(/\s+/)
      .filter(Boolean)
      .length;
  }

  // =========================================================
  // KEYWORDS
  // =========================================================

  function getCleanKeywords(title) {

    const keywords = new Set();

    title
      .toLowerCase()
      .split(/\s+/)
      .forEach(word => {

        if (
          word.length > 3 &&
          !STOPWORDS.has(word)
        ) {
          keywords.add(word);
        }
      });

    return Array.from(keywords)
      .slice(0, 10)
      .join(", ");
  }

  // =========================================================
  // ARTICLE SCHEMA
  // =========================================================

  function generateArticleSchema(
    data,
    dates
  ) {

    return {
      "@context": "https://schema.org",
      "@type": "Article",

      "headline":
        escapeJSON(data.title),

      "description":
        escapeJSON(data.descMeta),

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

      "datePublished":
        dates.datePublished,

      "dateModified":
        dates.dateModified,

      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": data.url
      },

      "wordCount":
        getAccurateWordCount(data.content),

      "keywords":
        getCleanKeywords(data.title),

      "articleBody":
        getCleanArticleBody(data.content),

      "inLanguage":
        "id-ID"
    };
  }

  // =========================================================
  // WEBPAGE SCHEMA
  // =========================================================

  function generateWebPageSchema(data) {

    return {
      "@context": "https://schema.org",

      "@type": "WebPage",

      "name": data.title,

      "url": data.url,

      "description":
        data.descMeta,

      "inLanguage":
        "id-ID"
    };
  }

  // =========================================================
  // HOMEPAGE SCHEMA
  // =========================================================

  function generateHomePageSchema(data) {

    return {
      "@context": "https://schema.org",

      "@type": "WebPage",

      "name":
        "Beranda - " +
        CONFIG.SITE_NAME,

      "url": data.url,

      "description":
        data.descMeta,

      "inLanguage":
        "id-ID"
    };
  }

  // =========================================================
  // WAIT AED
  // =========================================================

  function waitForAEDMetaDates(callback) {

    let elapsed = 0;

    const interval =
      setInterval(() => {

        if (window.AEDMetaDates) {

          clearInterval(interval);

          callback(window.AEDMetaDates);

        } else if (
          elapsed >= CONFIG.AED_TIMEOUT
        ) {

          clearInterval(interval);

          callback({
            datePublished:
              new Date().toISOString(),

            dateModified:
              new Date().toISOString()
          });
        }

        elapsed += 100;

      }, 100);
  }

  // =========================================================
  // EXTRACT PAGE DATA
  // =========================================================

  function extractPageData() {

    const url =
      location.href.split("?")[0];

    const title =
      document.title || "";

    const descMeta =
      document.querySelector(
        "meta[name='description']"
      )?.content || "";

    const firstImg =
      document.querySelector(
        ".post-body img, article img, main img"
      )?.src ||
      `${CONFIG.SITE_URL}/favicon.ico`;

    const content =
      document.querySelector(
        ".post-body.entry-content"
      ) ||
      document.querySelector("article") ||
      document.querySelector("main");

    return {
      url,
      title,
      descMeta,
      firstImg,
      content
    };
  }

  // =========================================================
  // MAIN
  // =========================================================

  function init() {

    log("================================");
    log("AUTO SCHEMA GENERATOR v6.1");
    log("================================");

    const pageData =
      extractPageData();

    const entityType =
      detectEntityType();

    const pageLevel =
      detectPageLevel(entityType);

    log(
      `ENTITY TYPE: ${entityType}`,
      "SUCCESS"
    );

    log(
      `PAGE LEVEL: ${pageLevel} (L${TYPE_LEVEL_MAP[pageLevel]})`,
      "SUCCESS"
    );

    // =============================================
    // HOMEPAGE
    // =============================================

    const homeElem =
      document.getElementById(
        "auto-schema-home"
      );

    if (
      homeElem &&
      pageLevel === "home"
    ) {

      homeElem.textContent =
        JSON.stringify(
          generateHomePageSchema(pageData),
          null,
          2
        );
    }

    // =============================================
    // WEBPAGE
    // =============================================

    const webElem =
      document.getElementById(
        "auto-schema-webpage"
      );

    if (webElem) {

      webElem.textContent =
        JSON.stringify(
          generateWebPageSchema(pageData),
          null,
          2
        );
    }

    // =============================================
    // ARTICLE
    // =============================================

    const articleElem =
      document.getElementById(
        "auto-schema"
      );

    if (articleElem) {

      waitForAEDMetaDates((dates) => {

        articleElem.textContent =
          JSON.stringify(
            generateArticleSchema(
              pageData,
              dates
            ),
            null,
            2
          );

        log(
          "ARTICLE SCHEMA GENERATED",
          "SUCCESS"
        );
      });
    }

    log("================================");
    log("FINISHED");
    log("================================");
  }

  // =========================================================
  // START
  // =========================================================

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  } else {

    init();
  }

})();
