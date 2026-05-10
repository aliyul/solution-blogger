/**
 * AUTO-SCHEMA GENERATOR v5.0
 * SESUAI PHASE SYSTEM LENGKAP (8 LEVEL HIERARCHY)
 * 
 * UPDATE v5.0:
 * - Deteksi 8 level lengkap (Pillar → SP2 → SP1 → MONEY_MASTER → MONEY_PAGE → MONEY_CHILD → Variant → Sub-Variant)
 * - Membedakan ENTITY TYPE (Produk, Material, Jasa, Sewa, Artikel)
 * - Validasi wajib tahun untuk MONEY_MASTER/PAGE/CHILD (Produk/Material)
 * - JASA & SEWA menggunakan Service Schema (bukan Article)
 * - SUB-PILLAR TIPE 1 tetap menggunakan Article (bukan dipaksa HowTo)
 * - ArticleBody cleaning lebih preservatif (tidak menghapus konten penting)
 * 
 * @version 5.0.0
 * @date 2026-01-15
 * @evergreen YES - sesuai PHASE SYSTEM
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

  // Valid Entity Types
  const VALID_ENTITY_TYPES = ['produk', 'material', 'jasa', 'sewa', 'artikel'];
  
  // Valid Page Levels (8 Level Hierarchy)
  const VALID_PAGE_LEVELS = [
    'pillar', 'sub-pillar-tipe-2', 'sub-pillar-tipe-1',
    'money-master', 'money-page', 'money-child',
    'variant', 'sub-variant'
  ];

  // Intent per Page Level (PHASE 1.5)
  const REQUIRED_INTENT = {
    'pillar': { primary: 'informasional', dominance: 90 },
    'sub-pillar-tipe-2': { primary: 'informasional', secondary: 'komersial', dominance: 60 },
    'sub-pillar-tipe-1': { primary: 'komersial', secondary: 'informasional', dominance: 70 },
    'money-master': { primary: 'transaksional', dominance: 80 },
    'money-page': { primary: 'transaksional', dominance: 85 },
    'money-child': { primary: 'transaksional', dominance: 90 },
    'variant': { primary: 'komersial', dominance: 80 },
    'sub-variant': { primary: 'komersial', dominance: 70 }
  };
  
  // Intent untuk JASA (override)
  const JASA_INTENT = {
    'money-page': { primary: 'komersial', secondary: 'transaksional', dominance: 60 },
    'money-child': { primary: 'komersial', secondary: 'transaksional', dominance: 60 }
  };

  // Wajib Tahun di H1 (STEP 6.2)
  const REQUIRES_YEAR = {
    'money-master': true,
    'money-page': 'produk-only',
    'money-child': 'produk-only'
  };

  // Stopwords
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
    console.log(`${prefix} [Schema v5.0] ${msg}`);
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

  // ===================== DETEKSI ENTITY TYPE (PRIORITAS 1) =====================
  function detectEntityType() {
    const url = location.href.toLowerCase();
    const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
    const title = document.title.toLowerCase();
    const combined = url + " " + h1 + " " + title;
    
    // JASA
    if (combined.includes('/jasa/') || combined.includes('jasa ') || 
        combined.includes('kontraktor') || combined.includes('pasang ')) {
      return 'jasa';
    }
    
    // SEWA
    if (combined.includes('/sewa/') || combined.includes('/rental/') || 
        combined.includes('sewa ') || combined.includes('rental ')) {
      return 'sewa';
    }
    
    // MATERIAL
    if (combined.includes('/material/') || combined.includes('material ') || 
        combined.includes('bahan bangunan')) {
      return 'material';
    }
    
    // ARTIKEL
    if (combined.includes('/artikel/') || combined.includes('/blog/')) {
      return 'artikel';
    }
    
    // Default PRODUK
    return 'produk';
  }

  // ===================== DETEKSI INTENT (PRIORITAS 2) =====================
  function detectIntentFromText(text) {
    const lowerText = text.toLowerCase();
    
    // Transaksional (prioritas tertinggi)
    const transactionalKeywords = ['harga', 'biaya', 'tarif', 'beli', 'jual', 'pesan', 'order'];
    for (const kw of transactionalKeywords) {
      if (lowerText.includes(kw)) return 'transaksional';
    }
    
    // Komersial
    const commercialKeywords = ['perbandingan', 'vs', 'terbaik', 'spesifikasi', 'ukuran', 'tipe', 'merk'];
    for (const kw of commercialKeywords) {
      if (lowerText.includes(kw)) return 'komersial';
    }
    
    return 'informasional';
  }

  // ===================== DETEKSI LOKASI UNTUK MONEY_CHILD =====================
  const LOCATION_WHITELIST = new Set([
    'jakarta', 'bogor', 'depok', 'tangerang', 'bekasi', 'bandung', 'surabaya',
    'medan', 'semarang', 'yogyakarta', 'jogja', 'solo', 'malang', 'makassar'
  ]);
  
  const PRODUCT_BLACKLIST = new Set([
    'baja', 'ringan', 'galvalum', 'spandek', 'bondek', 'hebel', 'bata',
    'pasang', 'service', 'kontraktor', 'renovasi'
  ]);
  
  function isLocation(text) {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/[\s,-]+/);
    
    for (const word of words) {
      if (LOCATION_WHITELIST.has(word)) return true;
      if (PRODUCT_BLACKLIST.has(word)) return false;
    }
    
    const hasIndicator = /di |ke |kota |wilayah/.test(lowerText);
    if (!hasIndicator) return false;
    
    for (const word of words) {
      if (word.length >= 4 && word.length <= 12 && /[aiueo]{2,}/.test(word)) {
        return true;
      }
    }
    return false;
  }

  // ===================== DETEKSI PAGE LEVEL (PRIORITAS 4) =====================
  function detectPageLevel(entityType) {
    const url = location.href.toLowerCase();
    const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
    const title = document.title.toLowerCase();
    const combinedText = h1 + " " + title;
    
    log(`Menganalisis halaman: H1="${h1.substring(0, 60)}..."`, "INFO");
    
    const isJasa = entityType === 'jasa';
    const isSewa = entityType === 'sewa';
    
    // ===== PRIORITAS 3: CEK KEYWORD HARGA =====
    const hasPrice = /harga|biaya|tarif|sewa|rental/.test(combinedText);
    
    if (hasPrice) {
      log(`Keyword harga/sewa terdeteksi`, "INFO");
      
      // JASA tidak boleh MONEY_MASTER
      if (isJasa) {
        log(`JASA → money-page (forced)`, "INFO");
        return 'money-page';
      }
      
      // Ekstrak setelah keyword
      let afterKeyword = '';
      if (combinedText.includes('harga')) {
        afterKeyword = combinedText.substring(combinedText.indexOf('harga') + 5);
      } else if (combinedText.includes('biaya')) {
        afterKeyword = combinedText.substring(combinedText.indexOf('biaya') + 5);
      } else if (combinedText.includes('sewa')) {
        afterKeyword = combinedText.substring(combinedText.indexOf('sewa') + 4);
      }
      afterKeyword = afterKeyword.trim();
      const wordCount = afterKeyword.split(/\s+/).filter(w => w.length > 0).length;
      
      // CEK LOKASI → MONEY_CHILD
      if (isLocation(afterKeyword)) {
        log(`Lokasi terdeteksi → money-child`, "INFO");
        return 'money-child';
      }
      
      // CEK SPESIFISITAS PRODUK
      const isSpecific = /galvalum|spandek|hebel|excavator|hpl|mdf/.test(afterKeyword) ||
                         /\d+(\.\d+)?\s*(mm|cm|m)/.test(afterKeyword);
      
      // MONEY_MASTER: 1-2 kata ATAU 3 kata tapi masih umum
      if (wordCount <= 2 || (wordCount === 3 && !isSpecific)) {
        log(`money-master (${wordCount} kata)`, "INFO");
        return 'money-master';
      }
      
      // MONEY_PAGE: 3+ kata dan spesifik
      log(`money-page (${wordCount} kata, spesifik=${isSpecific})`, "INFO");
      return 'money-page';
    }
    
    // ===== SUB-VARIANT (Level 8) - 2+ parameter =====
    let subVariantScore = 0;
    if (/(\d+\.?\d*\s*mm\s*x\s*\d+\.?\d*\s*mm\s*x\s*\d+\.?\d*\s*mm)/i.test(combinedText)) subVariantScore++;
    if (combinedText.includes('tebal') && combinedText.includes('panjang') && combinedText.includes('lebar')) subVariantScore++;
    const dimMatches = combinedText.match(/\d+\.?\d*\s*(mm|cm|m|ton|kg)/gi) || [];
    if (dimMatches.length >= 3) subVariantScore++;
    if (subVariantScore >= 2) {
      log(`sub-variant terdeteksi (score: ${subVariantScore})`, "INFO");
      return 'sub-variant';
    }
    
    // ===== VARIANT (Level 7) =====
    const variantKeywords = ['spesifikasi', 'ukuran', 'tipe', 'varian', 'warna', 'merk', 'kapasitas'];
    for (const kw of variantKeywords) {
      if (combinedText.includes(kw)) {
        log(`variant terdeteksi (${kw})`, "INFO");
        return 'variant';
      }
    }
    if (/\d+\.?\d*\s*(mm|cm|m|kg|ton)/.test(combinedText) && !combinedText.includes('x')) {
      log(`variant terdeteksi (single dimension)`, "INFO");
      return 'variant';
    }
    
    // ===== SUB-PILLAR TIPE 1 (Level 3 - Komersial) =====
    const comparisonKeywords = [' vs ', 'perbandingan', 'lebih baik', 'mana yang', 'perbedaan'];
    for (const kw of comparisonKeywords) {
      if (combinedText.includes(kw)) {
        log(`sub-pillar-tipe-1 terdeteksi (perbandingan)`, "INFO");
        return 'sub-pillar-tipe-1';
      }
    }
    
    // ===== SUB-PILLAR TIPE 2 (Level 2 - Informasional) =====
    if (combinedText.startsWith('jenis ') || combinedText.startsWith('macam ') || 
        combinedText.includes('jenis-jenis') || combinedText.includes('macam-macam')) {
      log(`sub-pillar-tipe-2 terdeteksi (jenis/macam)`, "INFO");
      return 'sub-pillar-tipe-2';
    }
    
    // ===== JASA/SEWA tanpa keyword harga =====
    if (isJasa) {
      const jasaKeywords = ['jasa', 'kontraktor', 'borongan', 'renovasi'];
      for (const kw of jasaKeywords) {
        if (combinedText.includes(kw)) {
          log(`JASA → money-page`, "INFO");
          return 'money-page';
        }
      }
    }
    
    if (isSewa) {
      const sewaKeywords = ['sewa', 'rental', 'alat berat'];
      for (const kw of sewaKeywords) {
        if (combinedText.includes(kw)) {
          log(`SEWA → money-page`, "INFO");
          return 'money-page';
        }
      }
    }
    
    // ===== PILLAR (Level 1) - DEFAULT =====
    log(`pillar (default)`, "INFO");
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
        return { required: true, valid: false, message: `H1 harus mengandung tahun ${CONFIG.CURRENT_YEAR}` };
      }
      return { required: true, valid: true };
    }
    
    if (rule === 'produk-only' && entityType !== 'jasa' && entityType !== 'sewa') {
      const h1 = document.querySelector("h1")?.innerText || "";
      const hasYear = new RegExp(`\\b${CONFIG.CURRENT_YEAR}\\b`).test(h1);
      if (!hasYear) {
        log(`⚠️ PERINGATAN: H1 HARUS mengandung tahun ${CONFIG.CURRENT_YEAR} untuk ${pageLevel} (Produk/Material)`, "WARN");
        return { required: true, valid: false, message: `H1 harus mengandung tahun ${CONFIG.CURRENT_YEAR}` };
      }
      return { required: true, valid: true };
    }
    
    return { required: false, valid: true };
  }

  // ===================== TENTUKAN SCHEMA YANG TEPAT =====================
  function getRecommendedSchema(pageLevel, entityType) {
    const isJasaSewa = entityType === 'jasa' || entityType === 'sewa';
    
    // JASA & SEWA → Service Schema (bukan Article)
    if (isJasaSewa && (pageLevel === 'money-page' || pageLevel === 'money-child')) {
      return { 
        primary: 'Service', 
        eligible: false,
        message: `JASA/SEWA ${pageLevel} → menggunakan Service Schema (serahkan ke script lain)`
      };
    }
    
    // MONEY_MASTER/PAGE/CHILD untuk PRODUK/MATERIAL → Article + harga
    if (['money-master', 'money-page', 'money-child'].includes(pageLevel)) {
      return { 
        primary: 'Article', 
        eligible: true,
        message: `${pageLevel} (Produk/Material) → Article Schema dengan harga`
      };
    }
    
    // SUB-PILLAR TIPE 1 → Article (bukan HowTo, tetap edukasi komersial)
    if (pageLevel === 'sub-pillar-tipe-1') {
      return { 
        primary: 'Article', 
        eligible: true,
        message: `SUB-PILLAR TIPE 1 → Article Schema (konten perbandingan)`
      };
    }
    
    // PILLAR, SP2, VARIANT, SUB-VARIANT → Article
    if (['pillar', 'sub-pillar-tipe-2', 'variant', 'sub-variant'].includes(pageLevel)) {
      return { 
        primary: 'Article', 
        eligible: true,
        message: `${pageLevel} → Article Schema (edukasi)`
      };
    }
    
    return { 
      primary: 'WebPage', 
      eligible: false,
      message: `Fallback ke WebPage Schema`
    };
  }

  // ===================== CLEAN ARTICLE BODY (PRESERVATIVE) =====================
  function getCleanArticleBody(contentElement, pageLevel) {
    if (!contentElement) return "";
    
    log("Membersihkan articleBody...", "INFO");
    
    const clone = contentElement.cloneNode(true);
    
    // Hanya hapus element yang benar-benar bukan konten
    const elementsToRemove = [
      "script", "style", "noscript", "iframe", "svg",
      ".breadcrumbs", ".breadcrumb", ".share-buttons",
      ".comments", ".comment-section", ".sidebar",
      ".cta-banner", ".btn", ".button", "nav", "header", "footer"
    ];
    
    // Jangan hapus comparison-table, price, harga untuk Money Page
    if (!['money-master', 'money-page', 'money-child'].includes(pageLevel)) {
      elementsToRemove.push(".price", ".price-list", ".harga", ".comparison-table");
    }
    
    elementsToRemove.forEach(selector => {
      try {
        clone.querySelectorAll(selector).forEach(el => el.remove());
      } catch(e) { /* ignore */ }
    });
    
    // Ambil teks dari konten utama
    const contentElements = clone.querySelectorAll("h1, h2, h3, h4, p, li, blockquote, td, th");
    let textContent = "";
    
    contentElements.forEach(el => {
      let text = el.innerText || "";
      text = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim();
      if (text.length > 10) {
        textContent += text + " ";
      }
    });
    
    if (textContent.length < 200) {
      textContent = clone.innerText || "";
    }
    
    if (textContent.length > CONFIG.MAX_ARTICLE_BODY_LENGTH) {
      textContent = textContent.substring(0, CONFIG.MAX_ARTICLE_BODY_LENGTH) + "...";
    }
    
    log(`articleBody length: ${textContent.length} karakter`, "SUCCESS");
    return cleanText(textContent);
  }

  // ===================== WORDCOUNT AKURAT =====================
  function getAccurateWordCount(contentElement, pageLevel) {
    if (!contentElement) return 0;
    
    const clone = contentElement.cloneNode(true);
    const elementsToRemove = ["script", "style", "noscript", "iframe", "svg", ".breadcrumbs"];
    
    elementsToRemove.forEach(selector => {
      try {
        clone.querySelectorAll(selector).forEach(el => el.remove());
      } catch(e) { /* ignore */ }
    });
    
    const text = clone.innerText || "";
    const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, "");
    const words = cleanText.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    
    log(`WordCount akurat: ${wordCount} kata`, "SUCCESS");
    return wordCount;
  }

  // ===================== EKSTRAKSI KEYWORDS =====================
  function getCleanKeywords(contentElement, pageLevel, title, entityType) {
    if (!contentElement) return "";
    
    const keywords = new Set();
    const h1 = document.querySelector("h1")?.innerText || "";
    
    // Tambah dari title dan H1
    [title, h1].forEach(text => {
      text.toLowerCase().split(/\s+/).forEach(word => {
        if (word.length > 4 && !STOPWORDS.has(word)) {
          keywords.add(word);
        }
      });
    });
    
    // Tambah berdasarkan level
    if (pageLevel === 'pillar') keywords.add("panduan konstruksi");
    if (pageLevel === 'money-master') keywords.add("harga terbaru");
    if (pageLevel === 'money-child') keywords.add("harga lokal");
    if (entityType === 'material') keywords.add("material bangunan");
    if (entityType === 'jasa') keywords.add("jasa profesional");
    
    const result = Array.from(keywords).slice(0, 8).join(", ");
    log(`Keywords: ${result}`, "SUCCESS");
    return result;
  }

  // ===================== GENERATE SCHEMA =====================
  function generateArticleSchema(data, dates, pageLevel, entityType) {
    const { url, title, descMeta, firstImg, content } = data;
    const { datePublished, dateModified } = dates;
    const yearValidation = validateYearInH1(pageLevel, entityType);
    
    const cleanBody = getCleanArticleBody(content, pageLevel);
    const wordCount = getAccurateWordCount(content, pageLevel);
    const keywords = getCleanKeywords(content, pageLevel, title, entityType);
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "isAccessibleForFree": true,
      "mainEntityOfPage": { "@type": "WebPage", "@id": url + "#webpage" },
      "headline": escapeJSON(title),
      "description": escapeJSON(descMeta),
      "image": [firstImg],
      "author": { "@type": "Organization", "name": CONFIG.SITE_NAME },
      "publisher": {
        "@type": "Organization",
        "name": CONFIG.SITE_NAME,
        "logo": { "@type": "ImageObject", "url": firstImg }
      },
      "datePublished": datePublished,
      "dateModified": dateModified,
      "articleSection": cleanText(title).substring(0, 60),
      "keywords": keywords,
      "wordCount": wordCount,
      "articleBody": cleanBody,
      "inLanguage": "id-ID"
    };
    
    // Tambah peringatan jika year missing (sebagai properti custom untuk debugging)
    if (!yearValidation.valid) {
      schema.seoWarning = yearValidation.message;
    }
    
    return schema;
  }

  function generateWebPageSchema(data) {
    const { url, title, descMeta, firstImg } = data;
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": title,
      "url": url,
      "description": descMeta,
      "publisher": {
        "@type": "Organization",
        "name": CONFIG.SITE_NAME,
        "logo": { "@type": "ImageObject", "url": firstImg }
      },
      "inLanguage": "id-ID"
    };
  }

  // ===================== WAIT FOR AED META DATES =====================
  function waitForAEDMetaDates(callback) {
    let elapsed = 0;
    const checkInterval = setInterval(() => {
      if (window.AEDMetaDates) {
        clearInterval(checkInterval);
        log("AEDMetaDates ditemukan", "SUCCESS");
        callback(window.AEDMetaDates);
      } else if (elapsed >= CONFIG.AED_TIMEOUT) {
        clearInterval(checkInterval);
        log("Timeout, menggunakan fallback date", "WARN");
        callback({
          datePublished: new Date().toISOString().replace("Z", "+07:00"),
          dateModified: new Date().toISOString().replace("Z", "+07:00")
        });
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
    const firstImg = document.querySelector(".post-body img, article img, main img")?.src || 
                     `${CONFIG.SITE_URL}/favicon.ico`;
    const content = document.querySelector(".post-body.entry-content") ||
                    document.querySelector("[id^='post-body-']") ||
                    document.querySelector(".post-body") ||
                    document.querySelector("article") ||
                    document.querySelector("main");
    
    return { url, title, descMeta, firstImg, content };
  }

  // ===================== MAIN EXECUTION =====================
  function init() {
    log("═══════════════════════════════════════════════════", "INFO");
    log("AUTO-SCHEMA GENERATOR v5.0 DIMULAI", "INFO");
    log("═══════════════════════════════════════════════════", "INFO");
    
    const pageData = extractPageData();
    const entityType = detectEntityType();
    const pageLevel = detectPageLevel(entityType);
    const yearValidation = validateYearInH1(pageLevel, entityType);
    const schemaConfig = getRecommendedSchema(pageLevel, entityType);
    
    log("───────────────────────────────────────────────────", "INFO");
    log(`HASIL DETEKSI (PHASE SYSTEM):`, "INFO");
    log(`  Entity Type    : ${entityType.toUpperCase()}`, "SUCCESS");
    log(`  Page Level     : ${pageLevel.toUpperCase()}`, "SUCCESS");
    log(`  Wajib Tahun    : ${yearValidation.required ? 'YES' : 'NO'}`, yearValidation.valid ? "SUCCESS" : "WARN");
    log(`  Tahun di H1    : ${yearValidation.valid ? '✅ ADA' : '❌ TIDAK ADA'}`, yearValidation.valid ? "SUCCESS" : "WARN");
    log(`  Schema Utama   : ${schemaConfig.primary}`, "SUCCESS");
    log(`  ${schemaConfig.message}`, "INFO");
    log("───────────────────────────────────────────────────", "INFO");
    
    // ===== SCHEMA ARTICLE (#auto-schema) =====
    const articleSchemaElem = document.getElementById("auto-schema");
    if (articleSchemaElem) {
      if (schemaConfig.eligible && schemaConfig.primary === "Article") {
        waitForAEDMetaDates((dates) => {
          const articleSchema = generateArticleSchema(pageData, dates, pageLevel, entityType);
          articleSchemaElem.textContent = JSON.stringify(articleSchema, null, 2);
          log("✅ Article Schema berhasil dipasang", "SUCCESS");
        });
      } else {
        articleSchemaElem.remove();
        log("🗑️ Article Schema dihapus (tidak sesuai)", "WARN");
      }
    }
    
    // ===== SCHEMA WEBPAGE (#auto-schema-webpage) =====
    const webElem = document.getElementById("auto-schema-webpage");
    if (webElem) {
      const webSchema = generateWebPageSchema(pageData);
      webElem.textContent = JSON.stringify(webSchema, null, 2);
      log("✅ WebPage Schema berhasil dipasang", "SUCCESS");
    }
    
    // ===== CATATAN: JASA/SEWA diserahkan ke script lain =====
    if (entityType === 'jasa' || entityType === 'sewa') {
      log("📌 JASA/SEWA: Service Schema diserahkan ke script terpisah", "INFO");
    }
    
    // ===== SUMMARY =====
    log("═══════════════════════════════════════════════════", "INFO");
    log("EXECUTION SUMMARY:", "INFO");
    log(`  Entity Type    : ${entityType.toUpperCase()}`, "INFO");
    log(`  Page Level     : ${pageLevel.toUpperCase()}`, "INFO");
    log(`  Primary Schema : ${schemaConfig.primary}`, "SUCCESS");
    log(`  Year Required  : ${yearValidation.required ? 'YES' : 'NO'}`, yearValidation.required ? "WARN" : "INFO");
    log(`  Year Valid     : ${yearValidation.valid ? 'YES' : 'NO'}`, yearValidation.valid ? "SUCCESS" : "ERROR");
    log("═══════════════════════════════════════════════════", "INFO");
    log("AUTO-SCHEMA GENERATOR v5.0 SELESAI", "SUCCESS");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
