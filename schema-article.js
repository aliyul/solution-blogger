/**
 * AUTO-SCHEMA GENERATOR v6.2 FINAL REFINED
 * HIERARCHY FINAL + MONEY SYSTEM FIX + ENTITY PILLAR EXACT MATCH
 *
 * FINAL RULE:
 *
 * PILLAR (L1):
 * - jasa konstruksi
 * - sewa alat konstruksi
 * - produk konstruksi
 * - produk interior
 * - material konstruksi
 *
 * MONEY MASTER (L4):
 * - root commercial entity
 * - sewa excavator
 * - sewa alat pancang hidrolik
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
 * IMPORTANT FIX:
 * ✅ "Sewa Alat Pancang Hidrolik" = money-master (L4)
 * ✅ ENTITY PILLAR hanya EXACT MATCH
 * ✅ PRIORITAS MONEY di atas variant
 * ✅ PRIORITAS LOCATION di atas money-page
 * ✅ URL CLEANER lebih stabil
 * ✅ DEFAULT PRODUK → SP2
 * ✅ SEWA tanpa harga → money-master
 * ✅ SEWA + harga → money-page
 * ✅ SEWA + lokasi → money-child
 * ✅ Produk/material generic price → money-master
 * ✅ Produk/material specific price → money-page
 *
 * @version 6.2 FINAL REFINED
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
  // EXACT MATCH ONLY
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
    "edukasi",
    "informasi",
    "rekomendasi"
  ];

  const SP1_KEYWORDS = [
    "vs",
    "versus",
    "perbandingan",
    "bandingkan",
    "kelebihan",
    "kekurangan",
    "mana yang lebih baik",
    "perbedaan"
  ];

  const SP2_KEYWORDS = [
    "jenis",
    "macam",
    "daftar",
    "kategori",
    "tipe",
    "varian"
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
    "tipe",
    "standar",
    "kualitas",
    "spec"
  ];

  // =========================================================
  // MONEY KEYWORDS
  // =========================================================

  const PRICE_KEYWORDS = [
    "harga",
    "biaya",
    "tarif"
  ];

  const RENT_KEYWORDS = [
    "sewa",
    "rental"
  ];

  // =========================================================
  // LOCATION
  // =========================================================

  const LOCATION_WHITELIST = new Set([

    // Jabodetabek
    "jakarta",
    "bogor",
    "depok",
    "tangerang",
    "bekasi",
    "cikarang",
    "cibubur",

    // Jawa Barat
    "bandung",
    "karawang",
    "purwakarta",
    "subang",
    "cirebon",
    "tasikmalaya",
    "garut",
    "sukabumi",
    "cimahi",

    // Jawa Tengah
    "semarang",
    "solo",
    "surakarta",
    "yogyakarta",
    "jogja",
    "magelang",

    // Jawa Timur
    "surabaya",
    "malang",
    "gresik",
    "sidoarjo",

    // Sumatera
    "medan",
    "batam",
    "palembang",
    "lampung",

    // Kalimantan
    "pontianak",
    "balikpapan",
    "banjarmasin",

    // Sulawesi
    "makassar",

    // Bali
    "bali",
    "denpasar"
  ]);

  // =========================================================
  // SPECIFIC MODIFIER
  // =========================================================

  const SPECIFIC_MODIFIERS = [

    // Ready Mix
    "k100",
    "k125",
    "k175",
    "k200",
    "k225",
    "k250",
    "k275",
    "k300",
    "k350",
    "k400",
    "k450",
    "minimix",

    // Wiremesh
    "m4",
    "m5",
    "m6",
    "m7",
    "m8",
    "m9",
    "m10",
    "m12",

    // Sewa
    "long arm",
    "breaker",
    "vibro",
    "vibrator",
    "hydraulic",
    "hidrolik",

    // Produk
    "pagar",
    "panel",
    "u ditch",
    "box culvert",
    "kanstin",
    "full cor",

    // Unit
    "per m2",
    "per meter",
    "per lembar",
    "per kubik",
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

    console.log(`${icons[type] || "📘"} [Schema v6.2] ${msg}`);
  }

  // =========================================================
  // CLEAN TEXT
  // =========================================================

  function cleanText(str) {

    if (!str) return "";

    return str
      .replace(/\s+/g, " ")
      .replace(/[–—]/g, "-")
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
      .replace(/^\/\d{4}\/\d{2}\//, "")
      .replace(/^\/\d{4}\//, "")
      .replace(/^\//, "")
      .replace(/-/g, " ");

    path = path
      .replace(/\b\d{4}\b/g, "")
      .replace(/\s+/g, " ")
      .trim();

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

    // PRIORITAS JASA

    if (
      text.includes("jasa") ||
      text.includes("kontraktor") ||
      text.includes("waterproofing") ||
      text.includes("renovasi") ||
      text.includes("epoxy")
    ) {
      return "jasa";
    }

    // PRIORITAS SEWA

    if (
      text.includes("sewa") ||
      text.includes("rental") ||
      text.includes("alat berat") ||
      text.includes("excavator") ||
      text.includes("crane") ||
      text.includes("vibro") ||
      text.includes("pancang")
    ) {
      return "sewa";
    }

    // PRIORITAS MATERIAL

    if (
      text.includes("material") ||
      text.includes("bahan bangunan") ||
      text.includes("semen") ||
      text.includes("pasir") ||
      text.includes("split")
    ) {
      return "material";
    }

    // DEFAULT

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

    if (!text) return false;

    const lower = text.toLowerCase();

    for (const modifier of SPECIFIC_MODIFIERS) {

      if (lower.includes(modifier)) {
        return true;
      }
    }

    // ukuran / angka

    if (
      /\d/.test(lower)
    ) {
      return true;
    }

    // dimensi

    if (
      /\d+\s?(mm|cm|m|kg|ton)/i.test(lower)
    ) {
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

    const dimensionPattern =
      /\d+\s?(mm|cm|m)\s?x\s?\d+/i.test(text);

    return (
      numberCount >= 3 ||
      xCount >= 2 ||
      dimensionPattern
    );
  }

  // =========================================================
  // ENTITY PILLAR
  // EXACT MATCH ONLY
  // =========================================================

  function detectEntityPillar(text, entityType) {

    const lower =
      text.toLowerCase().trim();

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

    const urlName =
      getCleanPageNameFromUrl();

    const h1 =
      cleanText(
        document.querySelector("h1")?.innerText || ""
      ).toLowerCase();

    const title =
      cleanText(document.title || "")
      .toLowerCase();

    const primaryText =
      cleanText(urlName || h1 || title)
      .toLowerCase();

    const isJasa =
      entityType === "jasa";

    const isSewa =
      entityType === "sewa";

    log(`PRIMARY TEXT: ${primaryText}`);

    // =============================================
    // ENTITY PILLAR
    // =============================================

    const entityPillar =
      detectEntityPillar(
        primaryText,
        entityType
      );

    if (entityPillar) {
      return entityPillar;
    }

    // =============================================
    // MONEY SYSTEM
    // PRIORITAS TERTINGGI
    // =============================================

    const HAS_PRICE_WORD =
      /\b(harga|biaya|tarif)\b/i
      .test(primaryText);

    const HAS_SEWA_WORD =
      /\b(sewa|rental)\b/i
      .test(primaryText);

    if (
      HAS_PRICE_WORD ||
      HAS_SEWA_WORD
    ) {

      log("MONEY INTENT DETECTED", "INFO");

      // =========================================
      // LOCATION PRIORITAS
      // =========================================

      if (
        isLocation(primaryText)
      ) {

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

          log(
            "SEWA + HARGA = MONEY PAGE",
            "SUCCESS"
          );

          return "money-page";
        }

        // sewa excavator
        // sewa alat pancang hidrolik

        if (
          !HAS_PRICE_WORD &&
          HAS_SEWA_WORD
        ) {

          log(
            "PURE SEWA = MONEY MASTER",
            "SUCCESS"
          );

          return "money-master";
        }
      }

      // =========================================
      // PRODUK / MATERIAL
      // =========================================

      if (HAS_PRICE_WORD) {

        const cleaned =
          primaryText
            .replace(/\b(harga|biaya|tarif)\b/gi, "")
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

        log(
          `PRODUCT WORD COUNT: ${wordCount}`
        );

        log(
          `SPECIFIC PRODUCT: ${specific}`
        );

        // harga ready mix
        // harga wiremesh

        if (
          wordCount <= 2 &&
          !specific
        ) {

          log(
            "ROOT COMMERCIAL",
            "SUCCESS"
          );

          return "money-master";
        }

        // harga ready mix k300
        // harga panel beton pagar

        log(
          "DETAIL COMMERCIAL",
          "SUCCESS"
        );

        return "money-page";
      }
    }

    // =============================================
    // SUB VARIANT
    // =============================================

    if (
      isSubVariant(primaryText)
    ) {

      log(
        "SUB VARIANT",
        "SUCCESS"
      );

      return "sub-variant";
    }

    // =============================================
    // PILLAR INFO
    // =============================================

    for (const kw of PILLAR_KEYWORDS) {

      if (
        primaryText.includes(kw)
      ) {

        log(
          `PILLAR INFO → ${kw}`,
          "SUCCESS"
        );

        return "pillar";
      }
    }

    // =============================================
    // SP1
    // =============================================

    for (const kw of SP1_KEYWORDS) {

      if (
        primaryText.includes(kw)
      ) {

        log(
          `SP1 → ${kw}`,
          "SUCCESS"
        );

        return "sub-pillar-tipe-1";
      }
    }

    // =============================================
    // SP2
    // =============================================

    for (const kw of SP2_KEYWORDS) {

      if (
        primaryText.includes(kw)
      ) {

        log(
          `SP2 → ${kw}`,
          "SUCCESS"
        );

        return "sub-pillar-tipe-2";
      }
    }

    // =============================================
    // JASA NON MONEY
    // =============================================

    if (isJasa) {

      if (
        isLocation(primaryText)
      ) {

        return "money-child";
      }

      return "money-page";
    }

    // =============================================
    // SEWA NON MONEY
    // =============================================

    if (isSewa) {

      if (
        isLocation(primaryText)
      ) {

        return "money-child";
      }

      return "money-master";
    }

    // =============================================
    // VARIANT
    // =============================================

    for (const kw of VARIANT_KEYWORDS) {

      if (
        primaryText.includes(kw)
      ) {

        log(
          `VARIANT → ${kw}`,
          "SUCCESS"
        );

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

        word = word
          .replace(/[^\w]/g, "")
          .trim();

        if (
          word.length > 3 &&
          !STOPWORDS.has(word)
        ) {
          keywords.add(word);
        }
      });

    return Array.from(keywords)
      .slice(0, 12)
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
        getAccurateWordCount(
          data.content
        ),

      "keywords":
        getCleanKeywords(
          data.title
        ),

      "articleBody":
        getCleanArticleBody(
          data.content
        ),

      "inLanguage":
        "id-ID"
    };
  }

  // =========================================================
  // WEBPAGE SCHEMA
  // =========================================================

  function generateWebPageSchema(
    data,
    pageLevel
  ) {

    return {

      "@context": "https://schema.org",

      "@type": "WebPage",

      "name":
        data.title,

      "url":
        data.url,

      "description":
        data.descMeta,

      "inLanguage":
        "id-ID",

      "additionalType":
        pageLevel
    };
  }

  // =========================================================
  // HOMEPAGE SCHEMA
  // =========================================================

  function generateHomePageSchema(
    data
  ) {

    return {

      "@context": "https://schema.org",

      "@type": "WebPage",

      "name":
        "Beranda - " +
        CONFIG.SITE_NAME,

      "url":
        data.url,

      "description":
        data.descMeta,

      "inLanguage":
        "id-ID"
    };
  }

  // =========================================================
  // WAIT AED
  // =========================================================

  function waitForAEDMetaDates(
    callback
  ) {

    let elapsed = 0;

    const interval =
      setInterval(() => {

        if (
          window.AEDMetaDates
        ) {

          clearInterval(interval);

          callback(
            window.AEDMetaDates
          );

        } else if (
          elapsed >=
          CONFIG.AED_TIMEOUT
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
    log("AUTO SCHEMA GENERATOR v6.2");
    log("================================");

    const pageData =
      extractPageData();

    const entityType =
      detectEntityType();

    const pageLevel =
      detectPageLevel(
        entityType
      );

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
          generateHomePageSchema(
            pageData
          ),
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
          generateWebPageSchema(
            pageData,
            pageLevel
          ),
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

      waitForAEDMetaDates(
        (dates) => {

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
        }
      );
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
