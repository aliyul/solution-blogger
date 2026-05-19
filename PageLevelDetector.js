/* ============================================================
 🧠 Page Level Detector v19.0 — FINAL SEO HIERARCHY
    ✅ FINAL ENTITY PILLAR FIX
    ✅ FIX: PILLAR hanya EXACT MATCH tertentu
    ✅ FIX: produk interior masuk pillar
    ✅ FIX: artikel TIDAK otomatis pillar
    ✅ FIX: MONEY priority di bawah variant/subpillar
    ✅ FIX: RENT dipisah dari PRICE
    ✅ FIX: PROMO → money-page
    ✅ FIX: LOCATION regex stabil
    ✅ FIX: DEFAULT fallback lebih aman
    ✅ FIX: SEWA DETAIL ENTITY → money-page
    ✅ FIX: COMMERCIAL MODIFIER DETECTION
    ✅ FIX: GEO + RENT → money-child
    ✅ FIX: SHORT COMMERCIAL KEYWORD
    ✅ FINAL: Stable 9-Level Architecture
============================================================ */

(function () {

  "use strict";

  if (window.pageLevelDetectorv19) return;

  // ============================================================
  // 📌 VALID LEVELS
  // ============================================================

  const VALID_LEVELS = [
    "home",
    "pillar",
    "sub-pillar-tipe-2",
    "sub-pillar-tipe-1",
    "money-master",
    "money-page",
    "money-child",
    "variant",
    "sub-variant"
  ];

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

  const VALID_ENTITY_TYPES = [
    "produk",
    "material",
    "jasa",
    "sewa",
    "artikel"
  ];

  // ============================================================
  // 📌 DEBUG
  // ============================================================

  const CONFIG = {
    DEBUG: true
  };

  function log(message, type = "INFO") {

    if (!CONFIG.DEBUG && type === "INFO") {
      return;
    }

    const icons = {
      INFO: "📘",
      SUCCESS: "✅",
      WARN: "⚠️",
      ERROR: "❌"
    };

    console.log(
      `${icons[type] || "📘"} [PLD v19.0] ${message}`
    );

  }

  // ============================================================
  // 📌 MONEY KEYWORDS
  // ============================================================

  const PRICE_KEYWORDS = [
    "harga",
    "biaya",
    "tarif",
    "ongkos"
  ];

  const PROMO_KEYWORDS = [
    "diskon",
    "promo",
    "penawaran",
    "cashback",
    "sale",
    "potongan harga"
  ];

  const RENT_KEYWORDS = [
    "sewa",
    "rental"
  ];

  // ============================================================
  // 📌 COMMERCIAL MODIFIERS
  // ============================================================

  const COMMERCIAL_MODIFIERS = [

    // product / model
    "mini",
    "mini pile",
    "sheet pile",
    "diesel hammer",
    "drop hammer",
    "hydraulic",
    "hidrolik",
    "hspd",
    "crawler",
    "breaker",
    "long arm",

    // commercial
    "murah",
    "terbaik",
    "terdekat",
    "kapasitas besar",

    // measurement
    "per jam",
    "per hari",
    "per bulan",
    "per meter",
    "per m2",
    "per rit",
    "per unit",

    // variant
    "k225",
    "k250",
    "k300",
    "k350",
    "fc",
    "ready mix",
    "minimix"
  ];

  // ============================================================
  // 📌 SUB PILLAR
  // ============================================================

  const SP2_KEYWORDS = [
    "jenis",
    "jenis-jenis",
    "macam",
    "macam-macam",
    "tipe",
    "kategori",
    "daftar",
    "list",
    "varian"
  ];

  const SP1_KEYWORDS = [
    "vs",
    "versus",
    "perbandingan",
    "dibanding",
    "lebih baik",
    "kelebihan",
    "kekurangan",
    "beda",
    "perbedaan"
  ];

  // ============================================================
  // 📌 INFORMATIONAL
  // ============================================================

  const PILLAR_INFORMATIONAL_KEYWORDS = [
    "panduan",
    "tutorial",
    "tips",
    "cara",
    "apa itu",
    "pengertian",
    "definisi",
    "belajar",
    "edukasi",
    "materi"
  ];

  // ============================================================
  // 📌 ENTITY PILLAR
  // ONLY EXACT MATCH
  // ============================================================

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
    ],

    artikel: []

  };

  // ============================================================
  // 📌 VARIANT
  // ============================================================

  const VARIANT_KEYWORDS = [
    "spesifikasi",
    "ukuran",
    "dimensi",
    "kapasitas",
    "mutu",
    "quality",
    "spec",
    "standar",
    "merk",
    "brand",
    "model",
    "seri",
    "grade",
    "type",
    "tipe"
  ];

  // ============================================================
  // 📌 LOCATION
  // ============================================================

  const LOCATION_WHITELIST = new Set([
    "jakarta",
    "bogor",
    "depok",
    "tangerang",
    "bekasi",
    "bandung",
    "karawang",
    "cirebon",
    "surabaya",
    "semarang",
    "jogja",
    "yogyakarta",
    "solo",
    "medan",
    "makassar",
    "bali",
    "denpasar",
    "subang",
    "purwakarta",
    "cikampek",
    "sumedang",
    "garut",
    "tasikmalaya",
    "cianjur",
    "serang",
    "pandeglang"
  ]);

  // ============================================================
  // 📌 STOPWORDS
  // ============================================================

  const STOPWORDS = new Set([
    "dan",
    "di",
    "ke",
    "dari",
    "yang",
    "untuk",
    "dengan",
    "atau",
    "ini",
    "itu"
  ]);

  // ============================================================
  // 📌 CLEAN TEXT
  // ============================================================

  function cleanText(text) {

    if (!text) return "";

    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

  }

  // ============================================================
  // 📌 CLEAN URL
  // ============================================================

  function getCleanPageNameFromUrl() {

    let path = window.location.pathname;

    path = path.replace(/\.(html|php|htm)$/i, "");
    path = path.replace(/^\/p\//, "");
    path = path.replace(/^\/blog\//, "");
    path = path.replace(/^\/artikel\//, "");

    const parts = path
      .split("/")
      .filter(Boolean);

    let slug = parts.pop() || "";

    slug = slug.replace(/-/g, " ");

    return cleanText(slug);

  }

  // ============================================================
  // 📌 HOMEPAGE
  // ============================================================

  function isHomePage() {

    const path =
      window.location.pathname.toLowerCase();

    return (
      path === "/" ||
      path === "/index.html" ||
      path === "/home"
    );

  }

  // ============================================================
  // 📌 ENTITY TYPE
  // ============================================================

  function detectEntityType(
    userEntityType = null
  ) {

    if (
      userEntityType &&
      VALID_ENTITY_TYPES.includes(
        userEntityType
      )
    ) {

      return userEntityType;

    }

    const text = cleanText(
      window.location.pathname +
      " " +
      document.title +
      " " +
      (
        document.querySelector("h1")
          ?.innerText || ""
      )
    );

    if (
      text.includes("jasa") ||
      text.includes("kontraktor") ||
      text.includes("pasang") ||
      text.includes("waterproofing")
    ) {

      return "jasa";

    }

    if (
      text.includes("sewa") ||
      text.includes("rental")
    ) {

      return "sewa";

    }

    if (
      text.includes("material") ||
      text.includes("bahan bangunan")
    ) {

      return "material";

    }

    if (
      text.includes("artikel") ||
      text.includes("blog")
    ) {

      return "artikel";

    }

    return "produk";

  }

  // ============================================================
  // 📌 LOCATION DETECTOR
  // ============================================================

  function isLocation(text) {

    if (!text) return false;

    const lower = cleanText(text);

    for (const city of LOCATION_WHITELIST) {

      const regex =
        new RegExp(`\\b${city}\\b`, "i");

      if (regex.test(lower)) {
        return true;
      }

    }

    const diRegex =
      /\bdi\s+([a-z\s]+)/gi;

    const matches =
      lower.match(diRegex);

    if (matches) {

      for (const match of matches) {

        const city =
          match
            .replace(/\bdi\s+/i, "")
            .trim();

        if (
          LOCATION_WHITELIST.has(city)
        ) {
          return true;
        }

      }

    }

    return false;

  }

  // ============================================================
  // 📌 COMMERCIAL MODIFIER
  // ============================================================

  function hasCommercialModifier(
    text
  ) {

    if (!text) return false;

    const lower = cleanText(text);

    for (const modifier of COMMERCIAL_MODIFIERS) {

      if (
        lower.includes(modifier)
      ) {
        return true;
      }

    }

    // numeric signal
    if (/\d/.test(lower)) {
      return true;
    }

    return false;

  }

  // ============================================================
  // 📌 SUB VARIANT
  // ============================================================

  function isSubVariant(text) {

    if (!text) return false;

    const lower =
      cleanText(text);

    const numbers =
      lower.match(/\d+/g) || [];

    const dimensions =
      lower.match(
        /\d+(\.\d+)?\s*(mm|cm|m|kg|ton)/gi
      ) || [];

    const xCount =
      (lower.match(/x/g) || []).length;

    return (
      numbers.length >= 3 &&
      dimensions.length >= 2 &&
      xCount >= 1
    );

  }

  // ============================================================
  // 📌 VARIANT
  // ============================================================

  function detectVariantLevel(
    text
  ) {

    if (!text) return null;

    if (
      isSubVariant(text)
    ) {

      return "sub-variant";

    }

    const lower =
      cleanText(text);

    for (const kw of VARIANT_KEYWORDS) {

      const regex =
        new RegExp(`\\b${kw}\\b`, "i");

      if (
        regex.test(lower)
      ) {

        return "variant";

      }

    }

    if (
      /\d+(\.\d+)?\s*(mm|cm|m|kg|ton)/i
        .test(lower)
    ) {

      return "variant";

    }

    return null;

  }

  // ============================================================
  // 📌 SUB PILLAR
  // ============================================================

  function detectSubPillarLevel(
    text
  ) {

    if (!text) return null;

    const lower =
      cleanText(text);

    for (const kw of SP1_KEYWORDS) {

      if (
        lower.includes(kw)
      ) {

        return "sub-pillar-tipe-1";

      }

    }

    for (const kw of SP2_KEYWORDS) {

      const regex =
        new RegExp(`\\b${kw}\\b`, "i");

      if (
        regex.test(lower)
      ) {

        return "sub-pillar-tipe-2";

      }

    }

    return null;

  }

  // ============================================================
  // 📌 ENTITY PILLAR
  // ============================================================

  function detectEntityPillar(
    text,
    entityType
  ) {

    if (!text) return null;

    const lower =
      cleanText(text);

    const keywords =
      ENTITY_PILLAR_KEYWORDS[
        entityType
      ] || [];

    for (const kw of keywords) {

      if (
        lower === kw
      ) {

        return "pillar";

      }

    }

    return null;

  }

  // ============================================================
  // 📌 MONEY DETECTOR
  // ============================================================

  function detectMoneyLevel(
    text,
    entityType
  ) {

    if (!text) return null;

    const lower =
      cleanText(text);

    const hasPrice =
      PRICE_KEYWORDS.some(
        keyword =>
          lower.includes(keyword)
      );

    const hasPromo =
      PROMO_KEYWORDS.some(
        keyword =>
          lower.includes(keyword)
      );

    const hasRent =
      RENT_KEYWORDS.some(
        keyword =>
          lower.includes(keyword)
      );

    if (
      !hasPrice &&
      !hasPromo &&
      !hasRent
    ) {

      return null;

    }

    // ============================================================
    // 📌 LOCATION PRIORITY
    // ============================================================

    if (
      isLocation(lower)
    ) {

      return "money-child";

    }

    // ============================================================
    // 📌 PROMO
    // ============================================================

    if (
      hasPromo
    ) {

      return "money-page";

    }

    // ============================================================
    // 📌 JASA
    // ============================================================

    if (
      entityType === "jasa"
    ) {

      return "money-page";

    }

    // ============================================================
    // 📌 SEWA
    // ============================================================

    if (
      entityType === "sewa"
    ) {

      // harga sewa excavator
      if (
        hasPrice
      ) {

        return "money-page";

      }

      const cleaned =
        lower
          .replace(/\bsewa\b/g, "")
          .replace(/\brental\b/g, "")
          .trim();

      const words =
        cleaned
          .split(/\s+/)
          .filter(Boolean)
          .filter(
            word =>
              !STOPWORDS.has(word)
          );

      const wordCount =
        words.length;

      const specific =
        hasCommercialModifier(
          cleaned
        );

      log(
        `SEWA WORD COUNT: ${wordCount}`
      );

      log(
        `SEWA SPECIFIC: ${specific}`
      );

      // ROOT ENTITY
      // sewa excavator
      // sewa pompa air
      // sewa alat pancang

      if (
        wordCount <= 2 &&
        !specific
      ) {

        return "money-master";

      }

      // DETAIL ENTITY
      // sewa excavator mini
      // sewa alat pancang hidrolik
      // sewa diesel hammer

      return "money-page";

    }

    // ============================================================
    // 📌 PRODUK / MATERIAL
    // ============================================================

    if (
      hasPrice
    ) {

      const cleaned =
        lower
          .replace(/\bharga\b/g, "")
          .replace(/\bbiaya\b/g, "")
          .replace(/\btarif\b/g, "")
          .replace(/\bongkos\b/g, "")
          .trim();

      const words =
        cleaned
          .split(/\s+/)
          .filter(Boolean);

      const wordCount =
        words.length;

      const specific =
        hasCommercialModifier(
          cleaned
        );

      if (
        wordCount <= 2 &&
        !specific
      ) {

        return "money-master";

      }

      return "money-page";

    }

    return null;

  }

  // ============================================================
  // 📌 MAIN DETECTOR
  // ============================================================

  function detectPageLevel(
    userOptions = {}
  ) {

    const {
      userEntityType = null
    } = userOptions;

    // ============================================================
    // 📌 HOME
    // ============================================================

    if (
      isHomePage()
    ) {

      return "home";

    }

    // ============================================================
    // 📌 TEXT
    // ============================================================

    const urlClean =
      getCleanPageNameFromUrl();

    const h1 =
      cleanText(
        document.querySelector("h1")
          ?.innerText || ""
      );

    const title =
      cleanText(
        document.title || ""
      );

    const primaryText =
      cleanText(
        urlClean ||
        h1 ||
        title
      );

    // ============================================================
    // 📌 ENTITY TYPE
    // ============================================================

    const entityType =
      detectEntityType(
        userEntityType
      );

    log(
      `PRIMARY TEXT: ${primaryText}`
    );

    log(
      `ENTITY TYPE: ${entityType}`
    );

    // ============================================================
    // 📌 1. ENTITY PILLAR
    // ============================================================

    const entityPillar =
      detectEntityPillar(
        primaryText,
        entityType
      );

    if (
      entityPillar
    ) {

      return entityPillar;

    }

    // ============================================================
    // 📌 2. VARIANT
    // ============================================================

    const variantLevel =
      detectVariantLevel(
        primaryText
      );

    if (
      variantLevel
    ) {

      return variantLevel;

    }

    // ============================================================
    // 📌 3. SUB PILLAR
    // ============================================================

    const subPillarLevel =
      detectSubPillarLevel(
        primaryText
      );

    if (
      subPillarLevel
    ) {

      return subPillarLevel;

    }

    // ============================================================
    // 📌 4. INFORMATIONAL
    // ============================================================

    for (const kw of PILLAR_INFORMATIONAL_KEYWORDS) {

      if (
        primaryText.includes(kw)
      ) {

        return "pillar";

      }

    }

    // ============================================================
    // 📌 5. MONEY
    // ============================================================

    const moneyLevel =
      detectMoneyLevel(
        primaryText,
        entityType
      );

    if (
      moneyLevel
    ) {

      return moneyLevel;

    }

    // ============================================================
    // 📌 6. FALLBACK JASA
    // ============================================================

    if (
      entityType === "jasa"
    ) {

      if (
        isLocation(primaryText)
      ) {

        return "money-child";

      }

      return "money-page";

    }

    // ============================================================
    // 📌 7. FALLBACK SEWA
    // ============================================================

    if (
      entityType === "sewa"
    ) {

      if (
        isLocation(primaryText)
      ) {

        return "money-child";

      }

      return "money-master";

    }

    // ============================================================
    // 📌 8. DEFAULT SAFE
    // ============================================================

    const wordCount =
      primaryText
        .split(/\s+/)
        .filter(Boolean)
        .length;

    // short generic keyword
    if (
      wordCount <= 2
    ) {

      return "pillar";

    }

    return "sub-pillar-tipe-2";

  }

  // ============================================================
  // 📌 BODY ATTRIBUTES
  // ============================================================

  function updateBodyAttributes(
    userOptions = {}
  ) {

    const pageLevel =
      detectPageLevel(
        userOptions
      );

    const entityType =
      detectEntityType(
        userOptions.userEntityType
      );

    document.body.setAttribute(
      "data-page-level",
      pageLevel
    );

    document.body.setAttribute(
      "data-page-level-num",
      TYPE_LEVEL_MAP[
        pageLevel
      ]
    );

    document.body.setAttribute(
      "data-entity-type",
      entityType
    );

    return {
      pageLevel,
      pageLevelNum:
        TYPE_LEVEL_MAP[
          pageLevel
        ],
      entityType
    };

  }

  // ============================================================
  // 📌 MANUAL OVERRIDE
  // ============================================================

  function setManualPageLevel(
    level,
    entityType = null
  ) {

    const currentEntity =
      entityType ||
      detectEntityType();

    if (
      !VALID_LEVELS.includes(level)
    ) {

      console.error(
        `Invalid level: ${level}`
      );

      return false;

    }

    // jasa tidak boleh money-master
    if (
      currentEntity === "jasa" &&
      level === "money-master"
    ) {

      console.error(
        "JASA cannot use money-master"
      );

      return false;

    }

    document.body.setAttribute(
      "data-page-level",
      level
    );

    document.body.setAttribute(
      "data-page-level-num",
      TYPE_LEVEL_MAP[level]
    );

    return true;

  }

  // ============================================================
  // 📌 EXPORT
  // ============================================================

  window.pageLevelDetectorv19 = {

    detect:
      detectPageLevel,

    setManual:
      setManualPageLevel,

    updateAttributes:
      updateBodyAttributes,

    detectEntityType,
    detectVariantLevel,
    detectSubPillarLevel,
    detectMoneyLevel,

    isLocation,
    isHomePage,

    VALID_LEVELS,
    TYPE_LEVEL_MAP,
    VALID_ENTITY_TYPES,

    version: "19.0"

  };

  window.pageLevelDetectorv19Ready = true;

  window.dispatchEvent(
    new Event(
      "pageLevelDetectorv19Ready"
    )
  );

  console.log(
    "✅ Page Level Detector v19.0 Ready"
  );

})();
