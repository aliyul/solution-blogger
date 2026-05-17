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
    ✅ FINAL: Stable 9-Level Architecture
============================================================ */

(function() {

  if (window.pageLevelDetectorV19) return;

  // ============================================================
  // 📌 VALID LEVELS
  // ============================================================

  const VALID_LEVELS = [
    'home',
    'pillar',
    'sub-pillar-tipe-2',
    'sub-pillar-tipe-1',
    'money-master',
    'money-page',
    'money-child',
    'variant',
    'sub-variant'
  ];

  const TYPE_LEVEL_MAP = {
    'home': 0,
    'pillar': 1,
    'sub-pillar-tipe-2': 2,
    'sub-pillar-tipe-1': 3,
    'money-master': 4,
    'money-page': 5,
    'money-child': 6,
    'variant': 7,
    'sub-variant': 8
  };

  const VALID_ENTITY_TYPES = [
    'produk',
    'material',
    'jasa',
    'sewa',
    'artikel'
  ];

  // ============================================================
  // 📌 MONEY KEYWORDS
  // ============================================================

  const PRICE_KEYWORDS = [
    'harga',
    'biaya',
    'tarif'
  ];

  const PROMO_KEYWORDS = [
    'diskon',
    'promo',
    'penawaran',
    'cashback',
    'sale',
    'potongan harga'
  ];

  const RENT_KEYWORDS = [
    'sewa',
    'rental'
  ];

  // ============================================================
  // 📌 SUB PILLAR
  // ============================================================

  const SP2_KEYWORDS = [
    'jenis',
    'jenis-jenis',
    'macam',
    'macam-macam',
    'tipe',
    'kategori',
    'daftar',
    'list',
    'varian'
  ];

  const SP1_KEYWORDS = [
    'vs',
    'versus',
    'perbandingan',
    'dibanding',
    'lebih baik',
    'kelebihan',
    'kekurangan',
    'beda',
    'perbedaan'
  ];

  // ============================================================
  // 📌 INFORMATIONAL
  // ============================================================

  const PILLAR_INFORMATIONAL_KEYWORDS = [
    'panduan',
    'tutorial',
    'tips',
    'cara',
    'apa itu',
    'pengertian',
    'definisi',
    'belajar',
    'edukasi',
    'materi'
  ];

  // ============================================================
  // 📌 FINAL ENTITY PILLAR
  // ONLY EXACT MATCH
  // ============================================================

  const ENTITY_PILLAR_KEYWORDS = {

    jasa: [
      'jasa konstruksi'
    ],

    sewa: [
      'sewa alat konstruksi'
    ],

    produk: [
      'produk konstruksi',
      'produk interior'
    ],

    material: [
      'material konstruksi'
    ],

    artikel: []

  };

  // ============================================================
  // 📌 VARIANT
  // ============================================================

  const VARIANT_KEYWORDS = [
    'spesifikasi',
    'ukuran',
    'dimensi',
    'kapasitas',
    'mutu',
    'quality',
    'spec',
    'standar',
    'merk',
    'brand',
    'model',
    'seri',
    'grade'
  ];

  // ============================================================
  // 📌 LOCATION
  // ============================================================

  const LOCATION_WHITELIST = new Set([
    'jakarta',
    'bogor',
    'depok',
    'tangerang',
    'bekasi',
    'bandung',
    'karawang',
    'cirebon',
    'surabaya',
    'semarang',
    'jogja',
    'yogyakarta',
    'solo',
    'medan',
    'makassar',
    'bali',
    'denpasar'
  ]);

  // ============================================================
  // 📌 CLEAN URL
  // ============================================================

  function getCleanPageNameFromUrl() {

    let path = window.location.pathname;

    path = path.replace(/\.(html|php|htm)$/i, '');
    path = path.replace(/^\/p\//, '');
    path = path.replace(/^\/blog\//, '');
    path = path.replace(/^\/artikel\//, '');

    const parts = path
      .split('/')
      .filter(Boolean);

    let slug = parts.pop() || '';

    slug = slug.replace(/-/g, ' ');
    slug = slug.replace(/[^a-z0-9\s]/gi, '');
    slug = slug.replace(/\s+/g, ' ').trim();

    return slug.toLowerCase();

  }

  // ============================================================
  // 📌 HOMEPAGE
  // ============================================================

  function isHomePage() {

    const path = window.location.pathname;

    return (
      path === '/' ||
      path === '/index.html' ||
      path === '/home'
    );

  }

  // ============================================================
  // 📌 ENTITY TYPE
  // ============================================================

  function detectEntityType(userEntityType = null) {

    if (
      userEntityType &&
      VALID_ENTITY_TYPES.includes(userEntityType)
    ) {
      return userEntityType;
    }

    const text = (
      window.location.pathname +
      ' ' +
      document.title
    ).toLowerCase();

    if (
      text.includes('jasa') ||
      text.includes('kontraktor') ||
      text.includes('pasang')
    ) {
      return 'jasa';
    }

    if (
      text.includes('sewa') ||
      text.includes('rental')
    ) {
      return 'sewa';
    }

    if (
      text.includes('material') ||
      text.includes('bahan bangunan')
    ) {
      return 'material';
    }

    if (
      text.includes('artikel') ||
      text.includes('blog')
    ) {
      return 'artikel';
    }

    return 'produk';

  }

  // ============================================================
  // 📌 LOCATION DETECTOR
  // ============================================================

  function isLocation(text) {

    if (!text) return false;

    const lower = text.toLowerCase();

    for (const city of LOCATION_WHITELIST) {

      const regex =
        new RegExp(`\\b${city}\\b`, 'i');

      if (regex.test(lower)) {
        return true;
      }

    }

    const diRegex =
      /\bdi\s+([a-z]+)/gi;

    const matches =
      lower.match(diRegex);

    if (matches) {

      for (const match of matches) {

        const city = match
          .replace(/\bdi\s+/i, '')
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
  // 📌 SUB VARIANT
  // ============================================================

  function isSubVariant(text) {

    if (!text) return false;

    const lower = text.toLowerCase();

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

  function detectVariantLevel(text) {

    if (!text) return null;

    if (isSubVariant(text)) {
      return 'sub-variant';
    }

    const lower = text.toLowerCase();

    for (const kw of VARIANT_KEYWORDS) {

      if (lower.includes(kw)) {
        return 'variant';
      }

    }

    if (
      /\d+(\.\d+)?\s*(mm|cm|m|kg|ton)/i.test(lower)
    ) {
      return 'variant';
    }

    return null;

  }

  // ============================================================
  // 📌 SUB PILLAR
  // ============================================================

  function detectSubPillarLevel(text) {

    if (!text) return null;

    const lower = text.toLowerCase();

    for (const kw of SP1_KEYWORDS) {

      if (lower.includes(kw)) {
        return 'sub-pillar-tipe-1';
      }

    }

    for (const kw of SP2_KEYWORDS) {

      const regex =
        new RegExp(`\\b${kw}\\b`, 'i');

      if (regex.test(lower)) {
        return 'sub-pillar-tipe-2';
      }

    }

    return null;

  }

  // ============================================================
  // 📌 ENTITY PILLAR
  // ONLY EXACT MATCH
  // ============================================================

  function detectEntityPillar(
    text,
    entityType
  ) {

    if (!text) return null;

    const lower =
      text.toLowerCase().trim();

    const keywords =
      ENTITY_PILLAR_KEYWORDS[
        entityType
      ] || [];

    for (const kw of keywords) {

      if (lower === kw) {
        return 'pillar';
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
      text.toLowerCase();

    const hasPrice =
      PRICE_KEYWORDS.some(
        k => lower.includes(k)
      );

    const hasPromo =
      PROMO_KEYWORDS.some(
        k => lower.includes(k)
      );

    const hasRent =
      RENT_KEYWORDS.some(
        k => lower.includes(k)
      );

    if (
      !hasPrice &&
      !hasPromo &&
      !hasRent
    ) {
      return null;
    }

    // ============================================================
    // 📌 LOCATION
    // ============================================================

    if (isLocation(lower)) {
      return 'money-child';
    }

    // ============================================================
    // 📌 PROMO
    // ============================================================

    if (hasPromo) {
      return 'money-page';
    }

    // ============================================================
    // 📌 JASA
    // ============================================================

    if (entityType === 'jasa') {
      return 'money-page';
    }

    // ============================================================
    // 📌 SEWA
    // ============================================================

    if (entityType === 'sewa') {

      // harga sewa excavator
      if (hasPrice) {
        return 'money-page';
      }

      const cleaned =
        lower
          .replace(/\bsewa\b/g, '')
          .replace(/\brental\b/g, '')
          .trim();

      const wordCount =
        cleaned
          .split(/\s+/)
          .filter(Boolean)
          .length;

      // sewa excavator
      if (wordCount <= 2) {
        return 'money-master';
      }

      // sewa excavator mini
      return 'money-page';

    }

    // ============================================================
    // 📌 PRODUK / MATERIAL
    // ============================================================

    if (hasPrice) {

      const cleaned =
        lower
          .replace(/\bharga\b/g, '')
          .replace(/\bbiaya\b/g, '')
          .replace(/\btarif\b/g, '')
          .trim();

      const wordCount =
        cleaned
          .split(/\s+/)
          .filter(Boolean)
          .length;

      if (wordCount <= 2) {
        return 'money-master';
      }

      return 'money-page';

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

    if (isHomePage()) {
      return 'home';
    }

    // ============================================================
    // 📌 TEXT
    // ============================================================

    const urlClean =
      getCleanPageNameFromUrl();

    const h1 =
      (
        document.querySelector('h1')
          ?.innerText || ''
      )
        .toLowerCase()
        .trim();

    const title =
      (document.title || '')
        .toLowerCase()
        .trim();

    const primaryText =
      urlClean || h1 || title;

    // ============================================================
    // 📌 ENTITY TYPE
    // ============================================================

    const entityType =
      detectEntityType(
        userEntityType
      );

    // ============================================================
    // 📌 1. ENTITY PILLAR
    // ============================================================

    const entityPillar =
      detectEntityPillar(
        primaryText,
        entityType
      );

    if (entityPillar) {
      return entityPillar;
    }

    // ============================================================
    // 📌 2. SUB VARIANT / VARIANT
    // ============================================================

    const variantLevel =
      detectVariantLevel(
        primaryText
      );

    if (variantLevel) {
      return variantLevel;
    }

    // ============================================================
    // 📌 3. SUB PILLAR
    // ============================================================

    const subPillarLevel =
      detectSubPillarLevel(
        primaryText
      );

    if (subPillarLevel) {
      return subPillarLevel;
    }

    // ============================================================
    // 📌 4. INFORMATIONAL
    // ============================================================

    for (const kw of PILLAR_INFORMATIONAL_KEYWORDS) {

      if (
        primaryText.includes(kw)
      ) {
        return 'pillar';
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

    if (moneyLevel) {
      return moneyLevel;
    }

    // ============================================================
    // 📌 6. FALLBACK JASA
    // ============================================================

    if (entityType === 'jasa') {

      if (
        isLocation(primaryText)
      ) {
        return 'money-child';
      }

      return 'money-page';

    }

    // ============================================================
    // 📌 7. FALLBACK SEWA
    // ============================================================

    if (entityType === 'sewa') {

      if (
        isLocation(primaryText)
      ) {
        return 'money-child';
      }

      return 'money-master';

    }

    // ============================================================
    // 📌 8. DEFAULT SAFE
    // ============================================================

    const wordCount =
      primaryText
        .split(/\s+/)
        .filter(Boolean)
        .length;

    // keyword pendek → pillar
    if (wordCount <= 2) {
      return 'pillar';
    }

    // keyword panjang → SP2
    return 'sub-pillar-tipe-2';

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
      'data-page-level',
      pageLevel
    );

    document.body.setAttribute(
      'data-page-level-num',
      TYPE_LEVEL_MAP[
        pageLevel
      ]
    );

    document.body.setAttribute(
      'data-entity-type',
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
      currentEntity === 'jasa' &&
      level === 'money-master'
    ) {

      console.error(
        'JASA cannot use money-master'
      );

      return false;

    }

    document.body.setAttribute(
      'data-page-level',
      level
    );

    document.body.setAttribute(
      'data-page-level-num',
      TYPE_LEVEL_MAP[level]
    );

    return true;

  }

  // ============================================================
  // 📌 EXPORT
  // ============================================================

  window.pageLevelDetectorV19 = {

    detect: detectPageLevel,

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

    version: '21.0'

  };

  window.pageLevelDetectorV19Ready = true;

  window.dispatchEvent(
    new Event(
      'pageLevelDetectorV19Ready'
    )
  );

  console.log(
    '✅ Page Level Detector v19.0 Ready'
  );

})();
