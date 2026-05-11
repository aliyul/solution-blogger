/**
 * AUTO-SCHEMA GENERATOR v5.4
 * SINKRON DENGAN generateBreadcrumbForMapping v5.5
 * 
 * UPDATE v5.4:
 * - ENTITY PILLAR KEYWORDS untuk setiap entity type
 * - "Jasa Konstruksi", "Sewa Alat Konstruksi", dll → PILLAR (L1)
 * - PRIORITAS DETEKSI SAMA DENGAN V5.5
 * 
 * @version 5.4.0
 * @date 2026-01-15
 * @synchronized-with generateBreadcrumbForMapping v5.5
 */

(function() {
  "use strict";

  // ===================== KONFIGURASI =====================
  const CONFIG = {
    DEBUG: true,
    MIN_WORD_PILLAR: 1500,
    MIN_WORD_SP2: 800,
    MIN_WORD_SP1: 600,
    MIN_WORD_VARIANT: 400,
    AED_TIMEOUT: 5000,
    MAX_ARTICLE_BODY_LENGTH: 8000,
    SITE_NAME: "Beton Jaya Readymix",
    SITE_URL: "https://www.betonjayareadymix.com",
    CURRENT_YEAR: new Date().getFullYear()
  };

  const VALID_ENTITY_TYPES = ['produk', 'material', 'jasa', 'sewa', 'artikel'];
  
  const VALID_PAGE_LEVELS = [
    'home', 'pillar', 'sub-pillar-tipe-2', 'sub-pillar-tipe-1',
    'money-master', 'money-page', 'money-child', 'variant', 'sub-variant'
  ];

  const TYPE_LEVEL_MAP = {
    'home': 0, 'pillar': 1, 'sub-pillar-tipe-2': 2, 'sub-pillar-tipe-1': 3,
    'money-master': 4, 'money-page': 5, 'money-child': 6, 'variant': 7, 'sub-variant': 8
  };

  // ============================================================
  // ENTITY PILLAR KEYWORDS 🔥 BARU
  // ============================================================
  const ENTITY_PILLAR_KEYWORDS = {
    'jasa': ['jasa konstruksi', 'layanan konstruksi', 'jasa bangunan', 'kontraktor konstruksi'],
    'sewa': ['sewa alat konstruksi', 'rental alat berat', 'sewa alat bangunan', 'sewa alat berat'],
    'produk': ['produk konstruksi', 'produk bangunan', 'produk interior'],
    'material': ['material konstruksi', 'bahan bangunan', 'material bangunan'],
    'artikel': ['artikel konstruksi', 'tips konstruksi', 'info bangunan']
  };

  // ============================================================
  // KEYWORD CIRI PER LEVEL
  // ============================================================
  const HOME_KEYWORDS = ['beranda', 'home', 'halaman utama', 'homepage', 'index'];
  
  const PILLAR_INFORMATIONAL_KEYWORDS = [
    'panduan', 'panduan lengkap', 'cara ', 'tips ', 'tips dan trik',
    'apa itu', 'pengertian', 'definisi', 'edukasi', 'belajar', 
    'tutorial', 'materi', 'penjelasan', 'kenapa', 'mengapa',
    'bagaimana', 'contoh', 'rekomendasi', 'lengkap', 'komprehensif'
  ];
  
  const SP2_KEYWORDS = [
    'jenis', 'jenis-jenis', 'macam', 'macam-macam', 'tipe ', 
    'kategori', 'ragam', 'berbagai', 'klasifikasi', 'golongan',
    'daftar ', 'list ', 'koleksi', 'varian '
  ];
  
  const SP1_KEYWORDS = [
    ' vs ', 'versus', 'perbandingan', 'bandingkan', 'dibanding',
    'lebih baik', 'mana yang', 'kelebihan', 'kekurangan',
    'perbedaan', 'beda', 'persamaan', 'sama', 'unggul',
    'lebih unggul', 'lebih bagus', 'lebih tahan', 'lebih awet',
    'lebih murah', 'lebih mahal', 'lebih hemat', 'lebih efisien'
  ];
  
  const MONEY_KEYWORDS = ['harga', 'biaya', 'tarif', 'sewa', 'rental'];
  
  const VARIANT_KEYWORDS = [
    'spesifikasi', 'ukuran', 'tipe ', 'type ', 'model', 
    'varian', 'warna', 'merk', 'brand', 'kapasitas', 
    'dimensi', 'bahan', 'material', 'finishing', 'grade',
    'seri', 'serie', 'versi', 'generasi', 'detail teknis'
  ];

  // Intent per Page Level
  const REQUIRED_INTENT = {
    'home': { primary: 'navigasional', secondary: 'transaksional', dominance: 70 },
    'pillar': { primary: 'informasional', secondary: null, dominance: 90 },
    'sub-pillar-tipe-2': { primary: 'informasional', secondary: 'komersial', dominance: 60 },
    'sub-pillar-tipe-1': { primary: 'komersial', secondary: 'informasional', dominance: 70 },
    'money-master': { primary: 'transaksional', secondary: 'komersial', dominance: 80 },
    'money-page': { primary: 'transaksional', secondary: 'komersial', dominance: 85 },
    'money-child': { primary: 'transaksional', secondary: 'komersial', dominance: 90 },
    'variant': { primary: 'komersial', secondary: 'informasional', dominance: 80 },
    'sub-variant': { primary: 'komersial', secondary: 'informasional', dominance: 70 }
  };
  
  const JASA_INTENT = {
    'money-page': { primary: 'komersial', secondary: 'transaksional', dominance: 60 },
    'money-child': { primary: 'komersial', secondary: 'transaksional', dominance: 60 }
  };

  const REQUIRES_YEAR = {
    'home': false,
    'money-master': true,
    'money-page': 'produk-only',
    'money-child': 'produk-only',
    'pillar': false,
    'sub-pillar-tipe-2': false,
    'sub-pillar-tipe-1': false,
    'variant': false,
    'sub-variant': false
  };

  const STOPWORDS = new Set([
    "dan", "di", "ke", "dari", "yang", "untuk", "pada", "dengan", 
    "ini", "itu", "adalah", "juga", "atau", "sebagai", "dalam", 
    "oleh", "karena", "akan", "sampai", "tidak", "dapat", "lebih", 
    "kami", "mereka", "anda", "kita", "saya", "dia"
  ]);

  // ===================== UTILS =====================
  function log(msg, type = "INFO") {
    if (!CONFIG.DEBUG && type === "INFO") return;
    const icons = { 
      INFO: "📘", WARN: "⚠️", ERROR: "❌", SUCCESS: "✅", 
      HOME: "🏠", PILLAR: "🏛️", SP1: "⚖️", SP2: "📚", 
      MONEY: "💰", VARIANT: "🔧", SUBVARIANT: "🔬" 
    };
    const prefix = icons[type] || "📘";
    console.log(`${prefix} [Schema v5.4] ${msg}`);
  }

  function cleanText(str) {
    if (!str) return "";
    return str.replace(/\s+/g, " ").trim();
  }

  function escapeJSON(str) {
    if (!str) return "";
    return str.replace(/\\/g, '\\\\')
              .replace(/"/g, '\\"')
              .replace(/\n/g, ' ')
              .replace(/\r/g, ' ')
              .replace(/</g, '\\u003c')
              .replace(/>/g, '\\u003e')
              .trim();
  }

  // ===================== DETEKSI HOMEPAGE =====================
  function isHomePage() {
    const url = location.href.toLowerCase();
    const path = url.replace(/https?:\/\/[^\/]+/, '');
    const isRoot = path === '' || path === '/' || path === '/index.html' || path === '/home';
    if (isRoot) return true;
    const h1 = (document.querySelector("h1")?.innerText || "").toLowerCase();
    const title = document.title.toLowerCase();
    return HOME_KEYWORDS.some(kw => h1 === kw || title === kw);
  }

  // ===================== DETEKSI ENTITY TYPE =====================
  function detectEntityType() {
    const url = location.href.toLowerCase();
    const h1 = (document.querySelector("h1")?.innerText || "").toLowerCase();
    const title = document.title.toLowerCase();
    const combined = url + " " + h1 + " " + title;
    
    if (combined.includes('/jasa/') || combined.includes('jasa ') || 
        combined.includes('kontraktor') || combined.includes('pasang ')) return 'jasa';
    if (combined.includes('/sewa/') || combined.includes('/rental/') || 
        combined.includes('sewa ') || combined.includes('rental ')) return 'sewa';
    if (combined.includes('/material/') || combined.includes('material ')) return 'material';
    if (combined.includes('/artikel/') || combined.includes('/blog/')) return 'artikel';
    return 'produk';
  }

  // ===================== DETEKSI INTENT =====================
  function detectIntentFromText(text) {
    const lowerText = text.toLowerCase();
    for (const kw of MONEY_KEYWORDS) if (lowerText.includes(kw)) return 'transaksional';
    for (const kw of SP1_KEYWORDS) if (lowerText.includes(kw)) return 'komersial';
    for (const kw of VARIANT_KEYWORDS) if (lowerText.includes(kw)) return 'komersial';
    return 'informasional';
  }

  // ===================== DETEKSI LOKASI =====================
  const LOCATION_WHITELIST = new Set([
    'jakarta', 'bogor', 'depok', 'tangerang', 'bekasi', 'bandung', 'surabaya',
    'medan', 'semarang', 'yogyakarta', 'jogja', 'solo', 'malang', 'makassar'
  ]);
  
  const PRODUCT_BLACKLIST = new Set([
    'baja', 'ringan', 'galvalum', 'spandek', 'bondek', 'hebel', 'bata',
    'pasang', 'service', 'kontraktor', 'renovasi', 'borongan'
  ]);
  
  function isLocation(text) {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/[\s,-]+/);
    for (const word of words) {
      if (LOCATION_WHITELIST.has(word)) return true;
      if (PRODUCT_BLACKLIST.has(word)) return false;
    }
    const hasIndicator = /di |ke |kota |wilayah /.test(lowerText);
    if (!hasIndicator) return false;
    for (const word of words) {
      if (word.length >= 4 && word.length <= 12 && /[aiueo]{2,}/.test(word)) {
        if (!PRODUCT_BLACKLIST.has(word)) return true;
      }
    }
    return false;
  }

  // ===================== DETEKSI PRODUK SPESIFIK =====================
  const SPECIFIC_PRODUCTS = new Set([
    'galvalum', 'spandek', 'bondek', 'hebel', 'bata ringan',
    'excavator', 'bulldozer', 'crane', 'dump truck',
    'hpl', 'mdf', 'jati', 'mahoni', 'multiplek', 'triplek'
  ]);
  
  function isSpecificProduct(text, wordCountAfterPrice = null) {
    const lowerText = text.toLowerCase();
    if (wordCountAfterPrice !== null && wordCountAfterPrice <= 2) return false;
    for (const product of SPECIFIC_PRODUCTS) {
      if (lowerText.includes(product)) return true;
    }
    if (/\d+(\.\d+)?\s*(mm|cm|m|inch)/.test(lowerText)) return true;
    return false;
  }

  // ===================== DETEKSI SUB-VARIANT =====================
  function isSubVariant(text) {
    const lowerText = text.toLowerCase();
    let score = 0;
    if (/(\d+(\.\d+)?\s*mm\s*x\s*\d+(\.\d+)?\s*mm\s*x\s*\d+(\.\d+)?\s*mm)/i.test(lowerText)) score++;
    if (/(\d+(\.\d+)?\s*cm\s*x\s*\d+(\.\d+)?\s*cm\s*x\s*\d+(\.\d+)?\s*cm)/i.test(lowerText)) score++;
    if (lowerText.includes('tebal') && lowerText.includes('panjang') && lowerText.includes('lebar')) score++;
    const dimensions = lowerText.match(/\d+(\.\d+)?\s*(mm|cm|m|ton|kg|liter)/gi) || [];
    if (dimensions.length >= 3) score++;
    if (lowerText.includes('kapasitas') && dimensions.length >= 2) score++;
    const hasMultipleX = (lowerText.match(/x/g) || []).length >= 2;
    const hasManyNumbers = (lowerText.match(/\d+/g) || []).length >= 3;
    if (hasMultipleX && hasManyNumbers) score++;
    return score >= 2;
  }

  // ===================== DETEKSI PAGE LEVEL (PRIORITAS LENGKAP) =====================
  function detectPageLevel(entityType) {
    if (isHomePage()) {
      log("HOMEPAGE → home (L0)", "HOME");
      return 'home';
    }
    
    const h1 = (document.querySelector("h1")?.innerText || "").toLowerCase();
    const title = document.title.toLowerCase();
    const combinedText = h1 + " " + title;
    
    log(`Menganalisis: H1="${h1.substring(0, 60)}..."`, "INFO");
    
    const isJasa = entityType === 'jasa';
    const isSewa = entityType === 'sewa';
    
    // ============================================================
    // PRIORITAS 1: ENTITY PILLAR 🔥
    // ============================================================
    const pillarKeywords = ENTITY_PILLAR_KEYWORDS[entityType] || [];
    for (const kw of pillarKeywords) {
      if (combinedText === kw || combinedText.startsWith(kw + ' ') || 
          combinedText.includes(' ' + kw + ' ') || combinedText.endsWith(' ' + kw)) {
        log(`ENTITY PILLAR detected: "${kw}" → pillar (L1)`, "PILLAR");
        return 'pillar';
      }
    }
    
    // ============================================================
    // PRIORITAS 2: INFORMASIONAL KEYWORDS → PILLAR atau SP2
    // ============================================================
    for (const kw of PILLAR_INFORMATIONAL_KEYWORDS) {
      if (combinedText.includes(kw)) {
        for (const sp2kw of SP2_KEYWORDS) {
          if (combinedText.includes(sp2kw)) {
            log(`SP2 detected (${kw} + ${sp2kw}) → sub-pillar-tipe-2 (L2)`, "SP2");
            return 'sub-pillar-tipe-2';
          }
        }
        log(`PILLAR detected (${kw}) → pillar (L1)`, "PILLAR");
        return 'pillar';
      }
    }
    
    // ============================================================
    // PRIORITAS 3: PERBANDINGAN → SP1
    // ============================================================
    for (const kw of SP1_KEYWORDS) {
      if (combinedText.includes(kw)) {
        log(`SP1 detected (${kw}) → sub-pillar-tipe-1 (L3)`, "SP1");
        return 'sub-pillar-tipe-1';
      }
    }
    
    // ============================================================
    // PRIORITAS 4: JENIS/MACAM/DAFTAR → SP2
    // ============================================================
    for (const kw of SP2_KEYWORDS) {
      if (combinedText.startsWith(kw) || combinedText.includes(kw + ' ') || combinedText.includes(kw + '-')) {
        log(`SP2 detected (${kw}) → sub-pillar-tipe-2 (L2)`, "SP2");
        return 'sub-pillar-tipe-2';
      }
    }
    
    // ============================================================
    // PRIORITAS 5: MONEY LEVEL
    // ============================================================
    for (const kw of MONEY_KEYWORDS) {
      if (combinedText.includes(kw)) {
        log(`Money keyword: ${kw}`, "MONEY");
        if (isJasa) {
          log(`JASA + harga → money-page (L5)`, "MONEY");
          return 'money-page';
        }
        let afterKw = '';
        const kwIndex = combinedText.indexOf(kw);
        afterKw = combinedText.substring(kwIndex + kw.length).trim();
        const wordCount = afterKw.split(/\s+/).filter(w => w.length > 0).length;
        if (isLocation(afterKw)) {
          log(`Location → money-child (L6)`, "MONEY");
          return 'money-child';
        }
        const isSpecific = isSpecificProduct(afterKw, wordCount);
        if (wordCount <= 2 || (wordCount === 3 && !isSpecific)) {
          log(`money-master (${wordCount} kata) → money-master (L4)`, "MONEY");
          return 'money-master';
        }
        log(`money-page (${wordCount} kata) → money-page (L5)`, "MONEY");
        return 'money-page';
      }
    }
    
    // ============================================================
    // PRIORITAS 6: JASA/SEWA (tanpa harga & bukan entity pillar)
    // ============================================================
    if (isJasa) {
      const jasaKeywords = ['jasa', 'pasang', 'service', 'kontraktor', 'borongan', 'renovasi'];
      for (const kw of jasaKeywords) {
        if (combinedText.includes(kw)) {
          for (const sp2kw of SP2_KEYWORDS) {
            if (combinedText.includes(sp2kw)) {
              log(`JASA + SP2 → sub-pillar-tipe-2 (L2)`, "SP2");
              return 'sub-pillar-tipe-2';
            }
          }
          for (const cmp of SP1_KEYWORDS) {
            if (combinedText.includes(cmp)) {
              log(`JASA + perbandingan → sub-pillar-tipe-1 (L3)`, "SP1");
              return 'sub-pillar-tipe-1';
            }
          }
          if (isLocation(combinedText)) {
            log(`JASA + location → money-child (L6)`, "MONEY");
            return 'money-child';
          }
          log(`JASA detected → money-page (L5)`, "MONEY");
          return 'money-page';
        }
      }
    }
    
    if (isSewa) {
      const sewaKeywords = ['sewa', 'rental', 'alat berat', 'excavator'];
      for (const kw of sewaKeywords) {
        if (combinedText.includes(kw)) {
          for (const sp2kw of SP2_KEYWORDS) {
            if (combinedText.includes(sp2kw)) {
              log(`SEWA + SP2 → sub-pillar-tipe-2 (L2)`, "SP2");
              return 'sub-pillar-tipe-2';
            }
          }
          for (const cmp of SP1_KEYWORDS) {
            if (combinedText.includes(cmp)) {
              log(`SEWA + perbandingan → sub-pillar-tipe-1 (L3)`, "SP1");
              return 'sub-pillar-tipe-1';
            }
          }
          if (isLocation(combinedText)) {
            log(`SEWA + location → money-child (L6)`, "MONEY");
            return 'money-child';
          }
          log(`SEWA detected → money-page (L5)`, "MONEY");
          return 'money-page';
        }
      }
    }
    
    // ============================================================
    // PRIORITAS 7: SUB-VARIANT
    // ============================================================
    if (isSubVariant(combinedText)) {
      log(`SUB-VARIANT → sub-variant (L8)`, "SUBVARIANT");
      return 'sub-variant';
    }
    
    // ============================================================
    // PRIORITAS 8: VARIANT
    // ============================================================
    for (const kw of VARIANT_KEYWORDS) {
      if (combinedText.includes(kw)) {
        log(`VARIANT (${kw}) → variant (L7)`, "VARIANT");
        return 'variant';
      }
    }
    
    if (/\d+(\.\d+)?\s*(mm|cm|m|kg|ton)/.test(combinedText) && !combinedText.includes('x')) {
      log(`VARIANT (single dimension) → variant (L7)`, "VARIANT");
      return 'variant';
    }
    
    // ============================================================
    // DEFAULT: PILLAR
    // ============================================================
    log(`PILLAR (default) → pillar (L1)`, "PILLAR");
    return 'pillar';
  }

  // ===================== VALIDASI WAJIB TAHUN =====================
  function validateYearInH1(pageLevel, entityType) {
    const rule = REQUIRES_YEAR[pageLevel];
    if (!rule) return { required: false, valid: true };
    if (rule === true) {
      const h1 = document.querySelector("h1")?.innerText || "";
      const hasYear = new RegExp(`\\b${CONFIG.CURRENT_YEAR}\\b`).test(h1);
      if (!hasYear) {
        log(`⚠️ H1 HARUS mengandung tahun ${CONFIG.CURRENT_YEAR} untuk ${pageLevel}`, "WARN");
        return { required: true, valid: false, message: `H1 harus mengandung tahun ${CONFIG.CURRENT_YEAR}` };
      }
      return { required: true, valid: true };
    }
    if (rule === 'produk-only' && entityType !== 'jasa' && entityType !== 'sewa') {
      const h1 = document.querySelector("h1")?.innerText || "";
      const hasYear = new RegExp(`\\b${CONFIG.CURRENT_YEAR}\\b`).test(h1);
      if (!hasYear) {
        log(`⚠️ H1 HARUS mengandung tahun ${CONFIG.CURRENT_YEAR} untuk ${pageLevel} (Produk/Material)`, "WARN");
        return { required: true, valid: false, message: `H1 harus mengandung tahun ${CONFIG.CURRENT_YEAR}` };
      }
      return { required: true, valid: true };
    }
    return { required: false, valid: true };
  }

  // ===================== TENTUKAN SCHEMA =====================
  function getRecommendedSchema(pageLevel, entityType) {
    const isJasaSewa = entityType === 'jasa' || entityType === 'sewa';
    if (pageLevel === 'home') {
      return { primary: 'WebPage', eligible: true, message: `HOMEPAGE → WebPage Schema` };
    }
    if (isJasaSewa && (pageLevel === 'money-page' || pageLevel === 'money-child')) {
      return { primary: 'Service', eligible: false, message: `JASA/SEWA → Service Schema` };
    }
    if (['money-master', 'money-page', 'money-child'].includes(pageLevel)) {
      return { primary: 'Article', eligible: true, message: `${pageLevel} → Article Schema dengan harga` };
    }
    if (pageLevel === 'sub-pillar-tipe-1') {
      return { primary: 'Article', eligible: true, message: `SP1 → Article Schema (perbandingan)` };
    }
    if (['pillar', 'sub-pillar-tipe-2', 'variant', 'sub-variant'].includes(pageLevel)) {
      return { primary: 'Article', eligible: true, message: `${pageLevel} → Article Schema (edukasi)` };
    }
    return { primary: 'WebPage', eligible: false, message: `Fallback ke WebPage Schema` };
  }

  // ===================== CLEAN ARTICLE BODY =====================
  function getCleanArticleBody(contentElement, pageLevel) {
    if (!contentElement) return "";
    log("Membersihkan articleBody...", "INFO");
    const clone = contentElement.cloneNode(true);
    const elementsToRemove = [
      "script", "style", "noscript", "iframe", "svg",
      ".breadcrumbs", ".breadcrumb", ".share-buttons",
      ".comments", ".comment-section", ".sidebar",
      ".cta-banner", ".btn", ".button", "nav", "header", "footer"
    ];
    if (!['money-master', 'money-page', 'money-child'].includes(pageLevel)) {
      elementsToRemove.push(".price", ".price-list", ".harga", ".comparison-table");
    }
    elementsToRemove.forEach(selector => {
      try { clone.querySelectorAll(selector).forEach(el => el.remove()); } catch(e) {}
    });
    const contentElements = clone.querySelectorAll("h1, h2, h3, h4, p, li, blockquote, td, th");
    let textContent = "";
    contentElements.forEach(el => {
      let text = el.innerText || "";
      text = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim();
      if (text.length > 10) textContent += text + " ";
    });
    if (textContent.length < 200) textContent = clone.innerText || "";
    if (textContent.length > CONFIG.MAX_ARTICLE_BODY_LENGTH) textContent = textContent.substring(0, CONFIG.MAX_ARTICLE_BODY_LENGTH) + "...";
    log(`articleBody: ${textContent.length} karakter`, "SUCCESS");
    return cleanText(textContent);
  }

  function getAccurateWordCount(contentElement) {
    if (!contentElement) return 0;
    const clone = contentElement.cloneNode(true);
    ["script", "style", "noscript", "iframe", "svg", ".breadcrumbs"].forEach(selector => {
      try { clone.querySelectorAll(selector).forEach(el => el.remove()); } catch(e) {}
    });
    const text = clone.innerText || "";
    const clean = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, "");
    return clean.trim().split(/\s+/).filter(w => w.length > 0).length;
  }

  function getCleanKeywords(contentElement, pageLevel, title, entityType) {
    if (!contentElement) return "";
    const keywords = new Set();
    const h1 = document.querySelector("h1")?.innerText || "";
    [title, h1].forEach(text => {
      text.toLowerCase().split(/\s+/).forEach(word => {
        if (word.length > 4 && !STOPWORDS.has(word)) keywords.add(word);
      });
    });
    if (pageLevel === 'pillar') keywords.add("panduan konstruksi");
    if (pageLevel === 'sub-pillar-tipe-1') keywords.add("perbandingan");
    if (pageLevel === 'sub-pillar-tipe-2') keywords.add("jenis material");
    if (pageLevel === 'money-master') keywords.add("harga terbaru");
    if (pageLevel === 'variant') keywords.add("spesifikasi teknis");
    if (entityType === 'material') keywords.add("material bangunan");
    if (entityType === 'jasa') keywords.add("jasa profesional");
    return Array.from(keywords).slice(0, 8).join(", ");
  }

  function generateArticleSchema(data, dates, pageLevel, entityType) {
    const { url, title, descMeta, firstImg, content } = data;
    const { datePublished, dateModified } = dates;
    const yearValidation = validateYearInH1(pageLevel, entityType);
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "isAccessibleForFree": true,
      "mainEntityOfPage": { "@type": "WebPage", "@id": url + "#webpage" },
      "headline": escapeJSON(title.substring(0, 110)),
      "description": escapeJSON(descMeta),
      "image": [firstImg],
      "author": { "@type": "Organization", "name": CONFIG.SITE_NAME },
      "publisher": { "@type": "Organization", "name": CONFIG.SITE_NAME, "logo": { "@type": "ImageObject", "url": firstImg } },
      "datePublished": datePublished,
      "dateModified": dateModified,
      "articleSection": cleanText(title).substring(0, 60),
      "keywords": getCleanKeywords(content, pageLevel, title, entityType),
      "wordCount": getAccurateWordCount(content),
      "articleBody": getCleanArticleBody(content, pageLevel).substring(0, 5000),
      "inLanguage": "id-ID"
    };
  }

  function generateWebPageSchema(data) {
    const { url, title, descMeta, firstImg } = data;
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": title.substring(0, 110),
      "url": url,
      "description": descMeta,
      "publisher": { "@type": "Organization", "name": CONFIG.SITE_NAME, "logo": { "@type": "ImageObject", "url": firstImg } },
      "inLanguage": "id-ID"
    };
  }

  function generateHomePageSchema(data) {
    const { url, descMeta } = data;
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Beranda - " + CONFIG.SITE_NAME,
      "url": url,
      "description": descMeta || "Solusi konstruksi dan material bangunan terpercaya",
      "publisher": { "@type": "Organization", "name": CONFIG.SITE_NAME, "logo": { "@type": "ImageObject", "url": `${CONFIG.SITE_URL}/favicon.ico` } },
      "inLanguage": "id-ID"
    };
  }

  function waitForAEDMetaDates(callback) {
    let elapsed = 0;
    const checkInterval = setInterval(() => {
      if (window.AEDMetaDates) {
        clearInterval(checkInterval);
        callback(window.AEDMetaDates);
      } else if (elapsed >= CONFIG.AED_TIMEOUT) {
        clearInterval(checkInterval);
        callback({ datePublished: new Date().toISOString().replace("Z", "+07:00"), dateModified: new Date().toISOString().replace("Z", "+07:00") });
      }
      elapsed += 100;
    }, 100);
  }

  function extractPageData() {
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonicalLink = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const baseUrl = ogUrl || canonicalLink || location.href;
    const url = baseUrl.replace(/[?&]m=1/, "");
    const title = document.title || "";
    const descMeta = document.querySelector("meta[name='description']")?.content || "";
    const firstImg = document.querySelector(".post-body img, article img, main img")?.src || `${CONFIG.SITE_URL}/favicon.ico`;
    const content = document.querySelector(".post-body.entry-content") || document.querySelector("[id^='post-body-']") || document.querySelector(".post-body") || document.querySelector("article") || document.querySelector("main");
    return { url, title, descMeta, firstImg, content };
  }

  function init() {
    log("═══════════════════════════════════════════════════", "INFO");
    log("AUTO-SCHEMA GENERATOR v5.4 DIMULAI", "INFO");
    log("═══════════════════════════════════════════════════", "INFO");
    
    const pageData = extractPageData();
    const entityType = detectEntityType();
    const pageLevel = detectPageLevel(entityType);
    const yearValidation = validateYearInH1(pageLevel, entityType);
    const schemaConfig = getRecommendedSchema(pageLevel, entityType);
    
    log("───────────────────────────────────────────────────", "INFO");
    log(`HASIL DETEKSI:`, "INFO");
    log(`  Entity Type: ${entityType.toUpperCase()}`, "SUCCESS");
    log(`  Page Level : ${pageLevel.toUpperCase()} (L${TYPE_LEVEL_MAP[pageLevel] || '?'})`, "SUCCESS");
    log(`  Wajib Tahun: ${yearValidation.required ? 'YES' : 'NO'}`, yearValidation.required ? "WARN" : "INFO");
    log(`  Tahun di H1: ${yearValidation.valid ? '✅ ADA' : '❌ TIDAK ADA'}`, yearValidation.valid ? "SUCCESS" : "WARN");
    log(`  Schema     : ${schemaConfig.primary}`, "SUCCESS");
    log(`  ${schemaConfig.message}`, "INFO");
    log("───────────────────────────────────────────────────", "INFO");
    
    const homeElem = document.getElementById("auto-schema-home");
    if (homeElem && pageLevel === 'home') {
      homeElem.textContent = JSON.stringify(generateHomePageSchema(pageData), null, 2);
      log("✅ HomePage Schema", "SUCCESS");
    } else if (homeElem) { homeElem.remove(); }
    
    const articleElem = document.getElementById("auto-schema");
    if (articleElem && schemaConfig.eligible && schemaConfig.primary === "Article") {
      waitForAEDMetaDates(dates => {
        articleElem.textContent = JSON.stringify(generateArticleSchema(pageData, dates, pageLevel, entityType), null, 2);
        log("✅ Article Schema", "SUCCESS");
      });
    } else if (articleElem) { articleElem.remove(); }
    
    const staticElem = document.getElementById("auto-schema-static-page");
    if (staticElem && schemaConfig.eligible && schemaConfig.primary === "Article") {
      waitForAEDMetaDates(dates => {
        staticElem.textContent = JSON.stringify(generateArticleSchema(pageData, dates, pageLevel, entityType), null, 2);
        log("✅ Static Article Schema", "SUCCESS");
      });
    } else if (staticElem) { staticElem.remove(); }
    
    const webElem = document.getElementById("auto-schema-webpage");
    if (webElem) {
      webElem.textContent = JSON.stringify(generateWebPageSchema(pageData), null, 2);
      log("✅ WebPage Schema", "SUCCESS");
    }
    
    if ((entityType === 'jasa' || entityType === 'sewa') && (pageLevel === 'money-page' || pageLevel === 'money-child')) {
      log("📌 JASA/SEWA: Service Schema diserahkan ke script lain", "INFO");
    }
    
    log("═══════════════════════════════════════════════════", "INFO");
    log("AUTO-SCHEMA GENERATOR v5.4 SELESAI", "SUCCESS");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
