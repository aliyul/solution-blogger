/**
 * AUTO-SCHEMA GENERATOR v5.8
 * SINKRON DENGAN Page Level Detector v18.6
 * 
 * UPDATE v5.8:
 * - ENTITY PILLAR: WAJIB EXACT MATCH berdasarkan clean URL
 * - FIX: "produk konstruksi" → PILLAR (L1)
 * - FIX: "standar mutu produk konstruksi" → VARIANT (L7) BUKAN pillar
 * - VARIANT_KEYWORDS ditambah: standar, mutu, kualitas, quality, spec
 * - PRIORITAS MONEY_KEYWORDS (harga, sewa) LEBIH TINGGI dari PILLAR_KEYWORDS
 * - Deteksi utama berdasarkan URL clean (tanpa domain, /p/, tahun/bulan)
 * - 9-Level Hierarchy lengkap
 * 
 * @version 5.8.0
 * @date 2026-01-15
 */

(function() {
  "use strict";

  // ===================== KONFIGURASI =====================
  const CONFIG = {
    DEBUG: true,
    AED_TIMEOUT: 5000,
    MAX_ARTICLE_BODY_LENGTH: 8000,
    SITE_NAME: "Beton Jaya Readymix",
    SITE_URL: "https://www.betonjayareadymix.com",
    CURRENT_YEAR: new Date().getFullYear()
  };

  const VALID_ENTITY_TYPES = ['produk', 'material', 'jasa', 'sewa', 'artikel'];
  
  const VALID_PAGE_LEVELS = [
    'home', 'pillar', 'sub-pillar-tipe-2', 'sub-pillar-tipe-1',
    'money-master', 'money-page', 'money-child',
    'variant', 'sub-variant'
  ];

  const TYPE_LEVEL_MAP = {
    'home': 0, 'pillar': 1, 'sub-pillar-tipe-2': 2, 'sub-pillar-tipe-1': 3,
    'money-master': 4, 'money-page': 5, 'money-child': 6,
    'variant': 7, 'sub-variant': 8
  };

  // ============================================================
  // 📌 KEYWORD CIRI (SINKRON DENGAN v18.6)
  // ============================================================
  
  const HOME_KEYWORDS = ['beranda', 'home', 'halaman utama', 'homepage', 'index'];
  
  // 🔥 ENTITY PILLAR KEYWORDS (EXACT MATCH ONLY - WAJIB)
  // Hanya keyword ini yang dianggap PILLAR (Level 1)
  const ENTITY_PILLAR_KEYWORDS = {
    'jasa': [
      'jasa konstruksi', 'jasa bangunan', 'layanan konstruksi', 
      'jasa kontraktor', 'jasa pemborong', 'jasa renovasi'
    ],
    'sewa': [
      'sewa alat konstruksi', 'sewa alat berat', 'rental alat berat',
      'sewa alat bangunan', 'rental konstruksi', 'sewa excavator'
    ],
    'produk': [
      'produk konstruksi', 'produk bangunan', 'produk interior'
    ],
    'material': [
      'material konstruksi', 'bahan bangunan', 'material bangunan',
      'supplier material', 'toko material'
    ],
    'artikel': [
      'artikel konstruksi', 'blog konstruksi', 'tips konstruksi'
    ]
  };
  
  const PILLAR_KEYWORDS = [
    'panduan', 'panduan lengkap', 'cara', 'tips', 'tips dan trik',
    'apa itu', 'pengertian', 'definisi', 'edukasi', 'belajar', 
    'tutorial', 'materi', 'penjelasan', 'kenapa', 'mengapa',
    'bagaimana', 'contoh', 'rekomendasi', 'lengkap', 'komprehensif'
  ];
  
  const MONEY_KEYWORDS = ['harga', 'biaya', 'tarif', 'sewa', 'rental'];
  
  const SP2_KEYWORDS = ['jenis', 'jenis-jenis', 'macam', 'macam-macam', 'tipe', 'kategori', 'daftar', 'list'];
  const SP1_KEYWORDS = ['vs', 'versus', 'perbandingan', 'bandingkan', 'lebih baik', 'mana yang', 'kelebihan', 'kekurangan', 'perbedaan'];
  
  // 🔥 VARIANT_KEYWORDS (ditambah standar, mutu, kualitas)
  const VARIANT_KEYWORDS = [
    'spesifikasi', 'ukuran', 'tipe', 'type', 'model', 
    'varian', 'warna', 'merk', 'brand', 'kapasitas', 
    'dimensi', 'bahan', 'material', 'finishing', 'grade',
    'seri', 'serie', 'versi', 'generasi', 'detail teknis',
    'standar', 'mutu', 'kualitas', 'quality', 'spec'
  ];

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
    'money-master': true,
    'money-page': 'produk-only',
    'money-child': 'produk-only'
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
    const icons = { INFO: "📘", WARN: "⚠️", ERROR: "❌", SUCCESS: "✅" };
    const prefix = icons[type] || "📘";
    console.log(`${prefix} [Schema v5.8] ${msg}`);
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

  // ===================== FUNGSI GET CLEAN PAGE NAME FROM URL =====================
  function getCleanPageNameFromUrl() {
    let path = window.location.pathname;
    
    path = path.replace(/\.(html|php|asp|jsp|htm)$/i, '');
    path = path.replace(/^\/p\//, '');
    path = path.replace(/^\/blog\//, '');
    path = path.replace(/^\/artikel\//, '');
    path = path.replace(/\/\d{4}\/\d{2}\/\d{2}\//g, '/');
    path = path.replace(/\/\d{4}\/\d{2}\//g, '/');
    path = path.replace(/\/\d{4}\//g, '/');
    path = path.replace(/\/\d{2}\//g, '/');
    
    const pathParts = path.split('/');
    const cleanedParts = pathParts.filter(part => {
      if (/^\d{4}$/.test(part)) return false;
      if (/^\d{2}$/.test(part)) return false;
      if (part === '' || part === 'index' || part === 'home') return false;
      if (part.includes('?')) return false;
      return true;
    });
    
    let pageName = cleanedParts.pop() || '';
    pageName = pageName.replace(/-/g, ' ');
    pageName = pageName.replace(/[^a-z0-9\s]/gi, '');
    pageName = pageName.replace(/\s+/g, ' ').trim();
    
    return pageName;
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
        combined.includes('kontraktor') || combined.includes('pasang ') ||
        combined.includes('layanan ')) {
      return 'jasa';
    }
    if (combined.includes('/sewa/') || combined.includes('/rental/') || 
        combined.includes('sewa ') || combined.includes('rental ') ||
        combined.includes('alat berat')) {
      return 'sewa';
    }
    if (combined.includes('/material/') || combined.includes('material ') || 
        combined.includes('bahan bangunan')) {
      return 'material';
    }
    if (combined.includes('/artikel/') || combined.includes('/blog/')) {
      return 'artikel';
    }
    return 'produk';
  }

  // ===================== DETEKSI INTENT =====================
  function detectIntentFromText(text) {
    const lowerText = text.toLowerCase();
    for (const kw of MONEY_KEYWORDS) {
      if (lowerText.includes(kw)) return 'transaksional';
    }
    for (const kw of SP1_KEYWORDS) {
      if (lowerText.includes(kw)) return 'komersial';
    }
    for (const kw of VARIANT_KEYWORDS) {
      if (lowerText.includes(kw)) return 'komersial';
    }
    return 'informasional';
  }

  // ===================== DETEKSI LOKASI =====================
  const LOCATION_WHITELIST = new Set([
    'jakarta', 'bogor', 'depok', 'tangerang', 'bekasi', 'jabodetabek',
    'jakpus', 'jakbar', 'jaksel', 'jakut', 'jaktim', 'tangsel',
    'bandung', 'cimahi', 'cirebon', 'tasikmalaya', 'sukabumi', 'garut',
    'semarang', 'solo', 'surakarta', 'yogyakarta', 'jogja', 'magelang',
    'surabaya', 'malang', 'kediri', 'blitar', 'madiun', 'gresik', 'sidoarjo',
    'medan', 'binjai', 'deli serdang', 'padang', 'pekanbaru', 'batam',
    'palembang', 'bandar lampung', 'pontianak', 'balikpapan', 'samarinda',
    'banjarmasin', 'makassar', 'manado', 'palu', 'denpasar', 'bali', 'mataram'
  ]);
  
  const PRODUCT_BLACKLIST = new Set([
    'baja', 'ringan', 'galvalum', 'spandek', 'bondek', 'hebel', 'bata',
    'excavator', 'bulldozer', 'crane', 'dump truck'
  ]);
  
  function isLocation(text) {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/[\s,-]+/);
    
    for (const word of words) {
      if (LOCATION_WHITELIST.has(word)) return true;
      if (PRODUCT_BLACKLIST.has(word)) return false;
    }
    
    const hasIndicator = /di |ke |kota |wilayah |daerah /.test(lowerText);
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
    'mini excavator', 'long arm excavator'
  ]);
  
  function isSpecificProduct(text, wordCountAfterPrice = null) {
    const lowerText = text.toLowerCase();
    if (wordCountAfterPrice !== null && wordCountAfterPrice <= 2) return false;
    for (const product of SPECIFIC_PRODUCTS) {
      if (lowerText.includes(product)) return true;
    }
    if (/\d+(\.\d+)?\s*(ton|mm|cm|m)/.test(lowerText)) return true;
    return false;
  }

  // ===================== DETEKSI NILAI DEFAULT UNTUK MONEY =====================
  function getDefaultMoneyLevel(wordCount, isSpecific, entityType) {
    if (wordCount <= 2 || (wordCount === 3 && !isSpecific)) {
      return 'money-master';
    }
    return 'money-page';
  }

  // ===================== DETEKSI ENTITY PILLAR (EXACT MATCH ONLY) 🔥 =====================
  function detectEntityPillar(text, entityType) {
    if (!text || text.length === 0) return null;
    
    const lowerText = text.toLowerCase().trim();
    const pillarKeywords = ENTITY_PILLAR_KEYWORDS[entityType] || [];
    
    for (const kw of pillarKeywords) {
      // 🔥 EXACT MATCH (tanpa tambahan kata apapun)
      // Contoh: "produk konstruksi" → match
      //         "standar mutu produk konstruksi" → tidak match
      if (lowerText === kw) {
        log(`ENTITY PILLAR detected (exact match): "${kw}" → pillar (L1)`, "SUCCESS");
        return 'pillar';
      }
    }
    
    return null;
  }

  // ===================== DETEKSI PAGE LEVEL (PRIORITAS LENGKAP) 🔥 =====================
  function detectPageLevel(entityType) {
    // PRIORITAS 0: HOMEPAGE
    if (isHomePage()) {
      log("HOMEPAGE terdeteksi → home (L0)", "INFO");
      return 'home';
    }
    
    // PRIORITAS UTAMA: URL Clean
    const urlPageName = getCleanPageNameFromUrl();
    const h1 = (document.querySelector("h1")?.innerText || "").toLowerCase();
    const title = document.title.toLowerCase();
    
    let primaryText = urlPageName || h1 || title;
    let isFromUrl = !!urlPageName;
    
    log(`🔍 URL Clean: "${urlPageName}"`, "INFO");
    log(`📄 H1: "${h1.substring(0, 60)}..."`, "INFO");
    
    const isJasa = entityType === 'jasa';
    const isSewa = entityType === 'sewa';
    
    // ============================================================
    // PRIORITAS 1: ENTITY PILLAR (EXACT MATCH ONLY) 🔥
    // ============================================================
    const entityPillar = detectEntityPillar(primaryText, entityType);
    if (entityPillar) {
      return entityPillar;
    }
    
    // ============================================================
    // PRIORITAS 2: MONEY LEVEL (HARGA/SEWA) 🔥
    // ============================================================
    for (const kw of MONEY_KEYWORDS) {
      if (primaryText.includes(kw)) {
        log(`💰 Money keyword detected: ${kw} (from ${isFromUrl ? 'URL' : 'title/H1'})`, "INFO");
        
        // Ekstrak setelah keyword (maksimal 5 kata pertama)
        let afterKw = '';
        const kwIndex = primaryText.indexOf(kw);
        afterKw = primaryText.substring(kwIndex + kw.length).trim();
        
        // Bersihkan dari tahun dan karakter khusus
        afterKw = afterKw.replace(/\b\d{4}\b/g, '').replace(/[-–—]/g, ' ').replace(/\s+/g, ' ').trim();
        const words = afterKw.split(/\s+/).filter(w => w.length > 0);
        const first5Words = words.slice(0, 5);
        afterKw = first5Words.join(' ');
        const wordCount = first5Words.length;
        
        log(`After keyword (first 5 words): "${afterKw}" | Words: ${wordCount}`, "INFO");
        
        // 🔥 PRIORITAS: CEK LOKASI DULU (UNTUK SEMUA ENTITY TYPE)
        if (isLocation(afterKw)) {
          log(`📍 Location detected in "${afterKw}" → money-child (L6)`, "SUCCESS");
          return 'money-child';
        }
        
        // 🔥 KHUSUS JASA: jika ada harga tapi tidak ada lokasi → money-page
        if (isJasa) {
          log(`JASA + harga (no location) → money-page (L5)`, "INFO");
          return 'money-page';
        }
        
        // 🔥 KHUSUS SEWA: jika ada harga/sewa tapi tidak ada lokasi
        if (isSewa) {
          const isSpecific = isSpecificProduct(afterKw, wordCount);
          const defaultLevel = getDefaultMoneyLevel(wordCount, isSpecific, entityType);
          log(`SEWA ${defaultLevel} (${wordCount} kata) → ${defaultLevel} (L${TYPE_LEVEL_MAP[defaultLevel]})`, "SUCCESS");
          return defaultLevel;
        }
        
        // 🔥 UNTUK PRODUK/MATERIAL
        const isSpecific = isSpecificProduct(afterKw, wordCount);
        const defaultLevel = getDefaultMoneyLevel(wordCount, isSpecific, entityType);
        log(`${defaultLevel.toUpperCase()} (${wordCount} kata, specific=${isSpecific}) → ${defaultLevel} (L${TYPE_LEVEL_MAP[defaultLevel]})`, "SUCCESS");
        return defaultLevel;
      }
    }
    
    // ============================================================
    // PRIORITAS 3: INFORMASIONAL KEYWORDS (PILLAR / SP2)
    // ============================================================
    for (const kw of PILLAR_KEYWORDS) {
      if (primaryText.includes(kw)) {
        for (const sp2kw of SP2_KEYWORDS) {
          if (primaryText.includes(sp2kw)) {
            log(`SUB-PILLAR TIPE 2 (${kw} + ${sp2kw}) → sub-pillar-tipe-2 (L2)`, "INFO");
            return 'sub-pillar-tipe-2';
          }
        }
        log(`PILLAR (${kw}) → pillar (L1)`, "INFO");
        return 'pillar';
      }
    }
    
    // ============================================================
    // PRIORITAS 4: PERBANDINGAN (SP1)
    // ============================================================
    for (const kw of SP1_KEYWORDS) {
      if (primaryText.includes(kw)) {
        log(`SUB-PILLAR TIPE 1 (${kw}) → sub-pillar-tipe-1 (L3)`, "INFO");
        return 'sub-pillar-tipe-1';
      }
    }
    
    // ============================================================
    // PRIORITAS 5: JENIS/MACAM/DAFTAR (SP2)
    // ============================================================
    for (const kw of SP2_KEYWORDS) {
      if (primaryText.startsWith(kw) || primaryText.includes(kw + ' ') || primaryText.includes(kw + '-')) {
        log(`SUB-PILLAR TIPE 2 (${kw}) → sub-pillar-tipe-2 (L2)`, "INFO");
        return 'sub-pillar-tipe-2';
      }
    }
    
    // ============================================================
    // PRIORITAS 6: JASA/SEWA (tanpa harga & bukan entity pillar)
    // ============================================================
    if (isJasa) {
      const jasaKeywords = ['jasa', 'pasang', 'service', 'kontraktor', 'borongan', 'renovasi'];
      for (const kw of jasaKeywords) {
        if (primaryText.includes(kw)) {
          if (isLocation(primaryText)) {
            log(`JASA + location → money-child (L6)`, "INFO");
            return 'money-child';
          }
          log(`JASA detected → money-page (L5)`, "INFO");
          return 'money-page';
        }
      }
    }
    
    if (isSewa) {
      const sewaKeywords = ['sewa', 'rental', 'alat berat'];
      for (const kw of sewaKeywords) {
        if (primaryText.includes(kw)) {
          if (isLocation(primaryText)) {
            log(`SEWA + location → money-child (L6)`, "INFO");
            return 'money-child';
          }
          log(`SEWA detected → money-page (L5)`, "INFO");
          return 'money-page';
        }
      }
    }
    
    // ============================================================
    // PRIORITAS 7: VARIANT (Level 7) 🔥 termasuk standar, mutu, kualitas
    // ============================================================
    for (const kw of VARIANT_KEYWORDS) {
      if (primaryText.includes(kw)) {
        log(`VARIANT (${kw}) → variant (L7)`, "INFO");
        return 'variant';
      }
    }
    
    // ============================================================
    // DEFAULT: PILLAR
    // ============================================================
    log(`PILLAR (default) → pillar (L1)`, "INFO");
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
        log(`⚠️ PERINGATAN: H1 HARUS mengandung tahun ${CONFIG.CURRENT_YEAR} untuk ${pageLevel}`, "WARN");
        return { required: true, valid: false };
      }
      return { required: true, valid: true };
    }
    
    if (rule === 'produk-only' && entityType !== 'jasa' && entityType !== 'sewa') {
      const h1 = document.querySelector("h1")?.innerText || "";
      const hasYear = new RegExp(`\\b${CONFIG.CURRENT_YEAR}\\b`).test(h1);
      if (!hasYear) {
        log(`⚠️ PERINGATAN: H1 HARUS mengandung tahun ${CONFIG.CURRENT_YEAR} untuk ${pageLevel} (Produk/Material)`, "WARN");
        return { required: true, valid: false };
      }
      return { required: true, valid: true };
    }
    
    return { required: false, valid: true };
  }

  // ===================== TENTUKAN SCHEMA =====================
  function getRecommendedSchema(pageLevel, entityType) {
    const isJasaSewa = entityType === 'jasa' || entityType === 'sewa';
    
    if (pageLevel === 'home') {
      return { primary: 'WebPage', eligible: true };
    }
    
    if (isJasaSewa && (pageLevel === 'money-page' || pageLevel === 'money-child')) {
      return { primary: 'Service', eligible: false, message: 'JASA/SEWA → Service Schema' };
    }
    
    if (['money-master', 'money-page', 'money-child'].includes(pageLevel)) {
      return { primary: 'Article', eligible: true, message: `${pageLevel} → Article Schema` };
    }
    
    if (['pillar', 'sub-pillar-tipe-2', 'sub-pillar-tipe-1', 'variant', 'sub-variant'].includes(pageLevel)) {
      return { primary: 'Article', eligible: true, message: `${pageLevel} → Article Schema` };
    }
    
    return { primary: 'WebPage', eligible: false };
  }

  // ===================== CLEAN ARTICLE BODY =====================
  function getCleanArticleBody(contentElement, pageLevel) {
    if (!contentElement) return "";
    const clone = contentElement.cloneNode(true);
    const elementsToRemove = ["script", "style", "noscript", "iframe", "svg", ".breadcrumbs", ".sidebar", ".cta-banner", ".btn", "nav", "header", "footer"];
    if (!['money-master', 'money-page', 'money-child'].includes(pageLevel)) {
      elementsToRemove.push(".price", ".price-list", ".harga");
    }
    elementsToRemove.forEach(selector => {
      try { clone.querySelectorAll(selector).forEach(el => el.remove()); } catch(e) {}
    });
    const contentElements = clone.querySelectorAll("h1, h2, h3, h4, p, li, blockquote");
    let textContent = "";
    contentElements.forEach(el => {
      let text = el.innerText?.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim() || "";
      if (text.length > 10) textContent += text + " ";
    });
    if (textContent.length < 200) textContent = clone.innerText || "";
    if (textContent.length > CONFIG.MAX_ARTICLE_BODY_LENGTH) textContent = textContent.substring(0, CONFIG.MAX_ARTICLE_BODY_LENGTH) + "...";
    return cleanText(textContent);
  }

  function getAccurateWordCount(contentElement) {
    if (!contentElement) return 0;
    const clone = contentElement.cloneNode(true);
    clone.querySelectorAll("script, style, .breadcrumbs").forEach(el => el.remove());
    const words = (clone.innerText || "").replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim().split(/\s+/).filter(w => w.length > 0);
    return words.length;
  }

  function getCleanKeywords(contentElement, pageLevel, title, entityType) {
    const keywords = new Set();
    const h1 = document.querySelector("h1")?.innerText || "";
    [title, h1].forEach(text => {
      text.toLowerCase().split(/\s+/).forEach(word => {
        if (word.length > 4 && !STOPWORDS.has(word)) keywords.add(word);
      });
    });
    if (pageLevel === 'money-master') keywords.add("harga terbaru");
    if (pageLevel === 'money-child') keywords.add("harga lokal");
    if (entityType === 'sewa') keywords.add("sewa alat berat");
    if (pageLevel === 'variant') keywords.add("spesifikasi teknis");
    return Array.from(keywords).slice(0, 8).join(", ");
  }

  // ===================== GENERATE SCHEMA =====================
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
      "articleBody": getCleanArticleBody(content, pageLevel),
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
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Beranda - " + CONFIG.SITE_NAME,
      "url": data.url,
      "description": data.descMeta || "Solusi konstruksi dan material bangunan terpercaya",
      "publisher": { "@type": "Organization", "name": CONFIG.SITE_NAME },
      "inLanguage": "id-ID"
    };
  }

  // ===================== WAIT FOR AED META DATES =====================
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

  // ===================== EKSTRAKSI DATA HALAMAN =====================
  function extractPageData() {
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonicalLink = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const baseUrl = ogUrl || canonicalLink || location.href;
    const url = baseUrl.replace(/[?&]m=1/, "");
    const title = document.title || "";
    const descMeta = document.querySelector("meta[name='description']")?.content || "";
    const firstImg = document.querySelector(".post-body img, article img, main img")?.src || `${CONFIG.SITE_URL}/favicon.ico`;
    const content = document.querySelector(".post-body.entry-content") || document.querySelector("article") || document.querySelector("main");
    return { url, title, descMeta, firstImg, content };
  }

  // ===================== MAIN EXECUTION =====================
  function init() {
    log("═══════════════════════════════════════════════════", "INFO");
    log("AUTO-SCHEMA GENERATOR v5.8 DIMULAI", "INFO");
    log("═══════════════════════════════════════════════════", "INFO");
    
    const pageData = extractPageData();
    const entityType = detectEntityType();
    const pageLevel = detectPageLevel(entityType);
    const yearValidation = validateYearInH1(pageLevel, entityType);
    const schemaConfig = getRecommendedSchema(pageLevel, entityType);
    
    log("───────────────────────────────────────────────────", "INFO");
    log("HASIL DETEKSI:", "INFO");
    log(`  Entity Type: ${entityType.toUpperCase()}`, "SUCCESS");
    log(`  Page Level : ${pageLevel.toUpperCase()} (L${TYPE_LEVEL_MAP[pageLevel] || '?'})`, "SUCCESS");
    log(`  Wajib Tahun: ${yearValidation.required ? 'YES' : 'NO'}`, yearValidation.required ? "WARN" : "INFO");
    log(`  Tahun di H1: ${yearValidation.valid ? '✅ ADA' : '❌ TIDAK ADA'}`, yearValidation.valid ? "SUCCESS" : "WARN");
    log(`  Schema     : ${schemaConfig.primary}`, "SUCCESS");
    log(`  ${schemaConfig.message || ''}`, "INFO");
    log("───────────────────────────────────────────────────", "INFO");
    
    // SCHEMA HOMEPAGE
    const homeElem = document.getElementById("auto-schema-home");
    if (homeElem && pageLevel === 'home') {
      homeElem.textContent = JSON.stringify(generateHomePageSchema(pageData), null, 2);
      log("✅ HomePage Schema berhasil dipasang", "SUCCESS");
    } else if (homeElem) {
      homeElem.remove();
    }
    
    // SCHEMA ARTICLE
    const articleElem = document.getElementById("auto-schema");
    if (articleElem && schemaConfig.eligible && schemaConfig.primary === "Article") {
      waitForAEDMetaDates((dates) => {
        articleElem.textContent = JSON.stringify(generateArticleSchema(pageData, dates, pageLevel, entityType), null, 2);
        log("✅ Article Schema berhasil dipasang", "SUCCESS");
      });
    } else if (articleElem) {
      articleElem.remove();
      log("🗑️ Article Schema dihapus (tidak sesuai)", "WARN");
    }
    
    // SCHEMA WEBPAGE
    const webElem = document.getElementById("auto-schema-webpage");
    if (webElem) {
      webElem.textContent = JSON.stringify(generateWebPageSchema(pageData), null, 2);
      log("✅ WebPage Schema berhasil dipasang", "SUCCESS");
    }
    
    log("═══════════════════════════════════════════════════", "INFO");
    log("AUTO-SCHEMA GENERATOR v5.8 SELESAI", "SUCCESS");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
