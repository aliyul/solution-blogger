/**
 * AUTO-SCHEMA GENERATOR v6.4 FINAL STABLE
 * HIERARCHY FINAL + JASA MONEY-MASTER FIX + SEO CLASSIFICATION ENGINE
 *
 * FINAL RULE v6.4:
 * - JASA BISA JADI MONEY-MASTER (kata <= 2, tanpa harga, tidak spesifik)
 *
 * PILLAR (L1)
 * - jasa konstruksi
 * - sewa alat konstruksi
 * - produk konstruksi
 * - produk interior
 * - material konstruksi
 *
 * SUB PILLAR TIPE 2 (L2)
 * - daftar alat berat
 * - jenis scaffolding
 * - kategori pompa air
 *
 * SUB PILLAR TIPE 1 (L3)
 * - perbandingan alat berat
 * - perbandingan pompa diesel
 *
 * MONEY MASTER (L4)
 * - sewa excavator
 * - jasa borongan
 * - jasa renovasi
 * - sewa alat pancang hidrolik
 * - sewa pompa air
 * - harga ready mix
 *
 * MONEY PAGE (L5)
 * - harga sewa excavator
 * - harga ready mix k300
 * - sewa pompa air diesel
 * - sewa bekisting kolom
 *
 * MONEY CHILD (L6)
 * - sewa excavator bandung
 * - harga sewa alat berat subang
 * - sewa pompa air jakarta
 *
 * VARIANT (L7)
 * - spesifikasi pompa diesel
 * - mutu beton k300
 *
 * SUB VARIANT (L8)
 * - wiremesh m8 2100x5400
 *
 * IMPORTANT FIX v6.4
 * ✅ JASA MONEY-MASTER DETECTION (FIXED)
 * ✅ PRIORITAS MONEY di atas variant
 * ✅ PRIORITAS LOCATION di atas money-page
 * ✅ PRIORITAS EXACT ENTITY PILLAR
 * ✅ "Jasa Borongan" = money-master
 * ✅ "Jasa Renovasi" = money-master
 * ✅ "Sewa Alat Pancang Hidrolik" = money-master
 * ✅ "Harga Sewa Pile Driver" = money-page
 * ✅ "Sewa Pile Driver Bandung" = money-child
 * ✅ "Daftar Harga ..." = SP2, bukan variant
 * ✅ "Standar Harga ..." = SP2
 * ✅ cleaner URL lebih stabil
 * ✅ keyword cleaner lebih aman
 * ✅ stop false positive variant
 * ✅ support slug blog /p/ dan dated url
 * ✅ support geo detection lebih akurat
 * ✅ support commercial-intent normalization
 *
 * @version 6.4 FINAL STABLE
 * @date 2026-05-19
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
  // ENTITY PILLAR EXACT MATCH
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
    "edukasi",
    "belajar",
    "penjelasan",
    "informasi",
    "rekomendasi"
  ];

  const SP1_KEYWORDS = [
    "vs",
    "versus",
    "perbandingan",
    "bandingkan",
    "perbedaan",
    "kelebihan",
    "kekurangan",
    "mana yang lebih baik"
  ];

  const SP2_KEYWORDS = [
    "jenis",
    "macam",
    "daftar",
    "kategori",
    "tipe",
    "varian",
    "list",
    "pilihan"
  ];

  const VARIANT_KEYWORDS = [
    "spesifikasi",
    "spec",
    "ukuran",
    "dimensi",
    "kapasitas",
    "mutu",
    "grade",
    "model",
    "type",
    "tipe",
    "standar",
    "kualitas"
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

  const JASA_KEYWORDS = [
    "jasa",
    "kontraktor",
    "renovasi",
    "pasang",
    "borongan",
    "waterproofing",
    "epoxy"
  ];

  // =========================================================
  // NON COMMERCIAL KEYWORDS
  // =========================================================

  const NON_COMMERCIAL_PREFIX = [
    "daftar harga",
    "standar harga",
    "perbandingan harga",
    "tips harga",
    "panduan harga"
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
    "subang",
    "karawang",
    "purwakarta",
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
  // SPECIFIC MODIFIERS
  // =========================================================

  const SPECIFIC_MODIFIERS = [

    // Beton
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

    // Wiremesh
    "m4",
    "m5",
    "m6",
    "m7",
    "m8",
    "m9",
    "m10",
    "m12",

    // Alat berat
    "long arm",
    "breaker",
    "vibro",
    "vibrator",
    "hydraulic",
    "hidrolik",
    "diesel hammer",
    "drop hammer",
    "sheet pile",
    "mini pile",

    // Produk
    "panel",
    "pagar",
    "u ditch",
    "box culvert",
    "kanstin",

    // Unit
    "per m2",
    "per meter",
    "per lembar",
    "per kubik",

    // Commercial modifier
    "murah",
    "terdekat",
    "kapasitas besar"
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

    if (!CONFIG.DEBUG && type === "INFO") {
      return;
    }

    const icons = {
      INFO: "📘",
      WARN: "⚠️",
      ERROR: "❌",
      SUCCESS: "✅"
    };

    console.log(
      `${icons[type] || "📘"} [Schema v6.4] ${msg}`
    );
  }

  // =========================================================
  // CLEAN TEXT
  // =========================================================

  function cleanText(str) {

    if (!str) return "";

    return str
      .replace(/[–—]/g, "-")
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
  // NORMALIZE TEXT
  // =========================================================

  function normalizeText(text) {

    return cleanText(text)
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
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

    return normalizeText(path);
  }

  // =========================================================
  // HOMEPAGE
  // =========================================================

  function isHomePage() {

    const path =
      location.pathname.toLowerCase();

    return (
      path === "/" ||
      path === "/index.html" ||
      path === "/home"
    );
  }

  // =========================================================
  // ENTITY TYPE DETECTION
  // =========================================================

  function detectEntityType() {

    const text = normalizeText(
      location.href +
      " " +
      document.title +
      " " +
      (
        document.querySelector("h1")
        ?.innerText || ""
      )
    );

    // PRIORITAS JASA

    if (
      text.includes("jasa") ||
      text.includes("kontraktor") ||
      text.includes("waterproofing") ||
      text.includes("renovasi") ||
      text.includes("epoxy") ||
      text.includes("borongan")
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
      text.includes("scaffolding") ||
      text.includes("bekisting") ||
      text.includes("pompa") ||
      text.includes("pile driver") ||
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
  // LOCATION DETECTION
  // =========================================================

  function isLocation(text) {

    if (!text) return false;

    const lower =
      normalizeText(text);

    for (const city of LOCATION_WHITELIST) {

      const regex =
        new RegExp(`\\b${city}\\b`, "i");

      if (regex.test(lower)) {
        return true;
      }
    }

    return false;
  }

  // =========================================================
  // NON COMMERCIAL DETECTION
  // =========================================================

  function isNonCommercialPrice(text) {

    const lower =
      normalizeText(text);

    return NON_COMMERCIAL_PREFIX.some(prefix =>
      lower.startsWith(prefix)
    );
  }

  // =========================================================
  // SPECIFIC PRODUCT DETECTION
  // =========================================================

  function isSpecificProduct(text) {

    if (!text) return false;

    const lower =
      normalizeText(text);

    for (const modifier of SPECIFIC_MODIFIERS) {

      if (lower.includes(modifier)) {
        return true;
      }
    }

    // angka

    if (/\d/.test(lower)) {
      return true;
    }

    // ukuran

    if (
      /\d+\s?(mm|cm|m|kg|ton)/i
      .test(lower)
    ) {
      return true;
    }

    return false;
  }

  // =========================================================
  // SUB VARIANT DETECTION
  // =========================================================

  function isSubVariant(text) {

    if (!text) return false;

    const numberCount =
      (text.match(/\d+/g) || []).length;

    const xCount =
      (text.match(/x/g) || []).length;

    const hasDimension =
      /\d+\s?(mm|cm|m)\s?x\s?\d+/i
      .test(text);

    return (
      numberCount >= 3 ||
      xCount >= 2 ||
      hasDimension
    );
  }

  // =========================================================
  // ENTITY PILLAR
  // EXACT MATCH ONLY
  // =========================================================

  function detectEntityPillar(
    text,
    entityType
  ) {

    const lower =
      normalizeText(text);

    const keywords =
      ENTITY_PILLAR_KEYWORDS[entityType] || [];

    for (const kw of keywords) {

      if (lower === kw) {

        log(
          `ENTITY PILLAR → ${kw}`,
          "SUCCESS"
        );

        return "pillar";
      }
    }

    return null;
  }

  // =========================================================
  // PAGE LEVEL DETECTION (FIXED v6.4 - JASA MM)
  // =========================================================

  function detectPageLevel(entityType) {

    // =============================================
    // HOME
    // =============================================

    if (isHomePage()) {

      log(
        "HOME DETECTED",
        "SUCCESS"
      );

      return "home";
    }

    // =============================================
    // PRIMARY TEXT
    // =============================================

    const urlName =
      getCleanPageNameFromUrl();

    const h1 = normalizeText(
      document.querySelector("h1")
      ?.innerText || ""
    );

    const title = normalizeText(
      document.title || ""
    );

    const primaryText =
      cleanText(urlName || h1 || title)
      .toLowerCase();

    log(
      `PRIMARY TEXT: ${primaryText}`
    );

    const isJasa =
      entityType === "jasa";

    const isSewa =
      entityType === "sewa";

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
    // NON COMMERCIAL PRICE
    // HARUS DI ATAS MONEY SYSTEM
    // =============================================

    if (
      isNonCommercialPrice(primaryText)
    ) {

      log(
        "NON COMMERCIAL PRICE CONTENT",
        "SUCCESS"
      );

      return "sub-pillar-tipe-2";
    }

    // =============================================
    // MONEY SYSTEM
    // PRIORITAS TERTINGGI
    // =============================================

    const HAS_PRICE_WORD =
      PRICE_KEYWORDS.some(kw =>
        new RegExp(`\\b${kw}\\b`, "i")
        .test(primaryText)
      );

    const HAS_SEWA_WORD =
      RENT_KEYWORDS.some(kw =>
        new RegExp(`\\b${kw}\\b`, "i")
        .test(primaryText)
      );

    const HAS_JASA_WORD =
      JASA_KEYWORDS.some(kw =>
        new RegExp(`\\b${kw}\\b`, "i")
        .test(primaryText)
      );

    if (
      HAS_PRICE_WORD ||
      HAS_SEWA_WORD ||
      HAS_JASA_WORD
    ) {

      log(
        "MONEY INTENT DETECTED",
        "INFO"
      );

      // =========================================
      // LOCATION PRIORITAS
      // =========================================

      if (
        isLocation(primaryText)
      ) {

        log(
          "MONEY CHILD",
          "SUCCESS"
        );

        return "money-child";
      }

      // =========================================
      // JASA (FIXED v6.4 - BISA JADI MM)
      // =========================================

      if (isJasa && HAS_JASA_WORD) {

        // Jika ada kata harga → money-page
        if (HAS_PRICE_WORD) {
          log(
            "JASA + HARGA = MONEY PAGE",
            "SUCCESS"
          );
          return "money-page";
        }

        // Clean dari kata jasa
        const cleaned =
          primaryText
            .replace(/\b(jasa|kontraktor|renovasi|pasang|borongan|waterproofing|epoxy)\b/gi, "")
            .trim();

        const words =
          cleaned
            .split(/\s+/)
            .filter(Boolean)
            .filter(word => !STOPWORDS.has(word));

        const wordCount =
          words.length;

        const specific =
          isSpecificProduct(cleaned);

        log(
          `JASA WORD COUNT: ${wordCount}`
        );

        log(
          `JASA SPECIFIC: ${specific}`
        );

        // MONEY-MASTER untuk JASA
        // Contoh: "jasa borongan", "jasa renovasi"
        if (wordCount <= 2 && !specific) {
          log(
            "JASA MONEY MASTER",
            "SUCCESS"
          );
          return "money-master";
        }

        log(
          "JASA MONEY PAGE",
          "SUCCESS"
        );

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
        // sewa pompa air
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
      // PRODUK / MATERIAL dengan HARGA
      // =========================================

      if (HAS_PRICE_WORD && !isJasa && !isSewa) {

        const cleaned =
          primaryText
            .replace(
              /\b(harga|biaya|tarif)\b/gi,
              ""
            )
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

        // harga wiremesh
        // harga ready mix

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
    // JASA DEFAULT (FIXED v6.4)
    // =============================================

    if (isJasa) {

      if (isLocation(primaryText)) {
        return "money-child";
      }

      // Default JASA → money-master jika kata <= 2
      const wordCount =
        primaryText
          .split(/\s+/)
          .filter(Boolean)
          .length;

      if (wordCount <= 2) {
        log(
          "JASA DEFAULT MONEY MASTER",
          "SUCCESS"
        );
        return "money-master";
      }

      return "money-page";
    }

    // =============================================
    // SEWA DEFAULT
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

  function getCleanArticleBody(
    contentElement
  ) {

    if (!contentElement) {
      return "";
    }

    const clone =
      contentElement.cloneNode(true);

    clone.querySelectorAll(
      "script,style,noscript,iframe,svg"
    ).forEach(el => el.remove());

    let text =
      cleanText(
        clone.innerText || ""
      );

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

  function getAccurateWordCount(
    contentElement
  ) {

    if (!contentElement) {
      return 0;
    }

    const text =
      cleanText(
        contentElement.innerText || ""
      );

    return text
      .split(/\s+/)
      .filter(Boolean)
      .length;
  }

  // =========================================================
  // CLEAN KEYWORDS
  // =========================================================

  function getCleanKeywords(title) {

    const keywords =
      new Set();

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

      "@context":
        "https://schema.org",

      "@type":
        "Article",

      "headline":
        escapeJSON(data.title),

      "description":
        escapeJSON(data.descMeta),

      "image": [
        data.firstImg
      ],

      "author": {
        "@type":
          "Organization",

        "name":
          CONFIG.SITE_NAME
      },

      "publisher": {
        "@type":
          "Organization",

        "name":
          CONFIG.SITE_NAME,

        "logo": {
          "@type":
            "ImageObject",

          "url":
            data.firstImg
        }
      },

      "datePublished":
        dates.datePublished,

      "dateModified":
        dates.dateModified,

      "mainEntityOfPage": {
        "@type":
          "WebPage",

        "@id":
          data.url
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

      "@context":
        "https://schema.org",

      "@type":
        "WebPage",

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

      "@context":
        "https://schema.org",

      "@type":
        "WebPage",

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
  // MAIN INIT
  // =========================================================

  function init() {

    log("================================");
    log("AUTO SCHEMA GENERATOR v6.4");
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
