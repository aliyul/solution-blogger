/**
 * AUTO-SCHEMA GENERATOR v5.2
 * SESUAI PHASE SYSTEM LENGKAP (9 LEVEL HIERARCHY + HOMEPAGE)
 * 
 * UPDATE v5.2:
 * - Menambahkan HOMEPAGE sebagai level 0 (BUKAN Pillar)
 * - Keyword Ciri LENGKAP untuk setiap level (Home, Pillar, SP2, SP1, MoneyMaster, MoneyPage, MoneyChild, Variant, SubVariant)
 * - PRIORITAS DETEKSI YANG BENAR:
 *   0. HOMEPAGE (root domain, /, /index.html)
 *   1. ENTITY TYPE (produk, jasa, sewa, material, artikel)
 *   2. INTENT KEYWORD (transaksional → komersial → informasional)
 *   3. PERBANDINGAN (vs, versus, perbandingan) 🔥 SEBELUM HARGA
 *   4. KEYWORD HARGA/SEWA (harga, biaya, tarif, sewa, rental) + wordCount & lokasi
 *   5. JASA/SEWA (tanpa keyword harga)
 *   6. SUB-VARIANT (2+ parameter: Xmm x Ymm x Zmm, tebal+panjang+lebar, kapasitas+dimensi)
 *   7. VARIANT (spesifikasi, ukuran, tipe, model, varian, warna, merk, kapasitas, dimensi)
 *   8. JENIS/MACAM (jenis, macam, tipe, kategori, varian, daftar) → SUB-PILLAR TIPE 2
 *   9. DEFAULT → PILLAR
 * - Validasi wajib tahun untuk MONEY_MASTER/PAGE/CHILD (Produk/Material)
 * - JASA & SEWA menggunakan Service Schema (bukan Article)
 * - SUB-PILLAR TIPE 1 tetap menggunakan Article (bukan dipaksa HowTo)
 * - ArticleBody cleaning lebih preservatif (tidak menghapus konten penting untuk Money Page)
 * 
 * @version 5.2.0
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
  
  // Valid Page Levels (9 level termasuk Home)
  const VALID_PAGE_LEVELS = [
    'home',                      // Level 0 - HOMEPAGE
    'pillar',                    // Level 1 - PILLAR
    'sub-pillar-tipe-2',         // Level 2 - JENIS/MACAM
    'sub-pillar-tipe-1',         // Level 3 - PERBANDINGAN
    'money-master',              // Level 4 - HARGA NASIONAL
    'money-page',                // Level 5 - HARGA PRODUK SPESIFIK / JASA
    'money-child',               // Level 6 - HARGA + LOKASI
    'variant',                   // Level 7 - SPESIFIKASI
    'sub-variant'                // Level 8 - DETAIL TEKNIS
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

  // ============================================================
  // 📌 KEYWORD CIRI PER LEVEL (LENGKAP)
  // ============================================================
  
  // LEVEL 0: HOMEPAGE
  const HOME_KEYWORDS = ['beranda', 'home', 'halaman utama', 'homepage', 'index'];
  
  // LEVEL 1: PILLAR (Informasional 90%)
  const PILLAR_KEYWORDS = [
    'panduan', 'panduan lengkap', 'cara ', 'tips ', 'tips dan trik',
    'apa itu', 'pengertian', 'definisi', 'edukasi', 'belajar', 
    'tutorial', 'materi', 'penjelasan', 'kenapa', 'mengapa',
    'bagaimana', 'contoh', 'rekomendasi', 'lengkap', 'komprehensif',
    'ultimate guide', 'complete guide', 'semua tentang', 'overview'
  ];
  
  // LEVEL 2: SUB-PILLAR TIPE 2 (Jenis/Macam)
  const SP2_KEYWORDS = [
    'jenis', 'jenis-jenis', 'macam', 'macam-macam', 'tipe ', 
    'kategori', 'ragam', 'berbagai', 'klasifikasi', 'golongan',
    'daftar ', 'list ', 'koleksi', 'varian '
  ];
  
  // LEVEL 3: SUB-PILLAR TIPE 1 (Perbandingan) 🔥 PRIORITAS TERTINGGI
  const SP1_KEYWORDS = [
    ' vs ', 'versus', 'perbandingan', 'bandingkan', 'dibanding',
    'lebih baik', 'mana yang', 'kelebihan', 'kekurangan',
    'perbedaan', 'beda', 'persamaan', 'sama', 'unggul',
    'lebih unggul', 'lebih bagus', 'lebih tahan', 'lebih awet',
    'lebih murah', 'lebih mahal', 'lebih hemat', 'lebih efisien'
  ];
  
  // LEVEL 4-6: MONEY KEYWORDS (Harga/Sewa)
  const MONEY_KEYWORDS = ['harga', 'biaya', 'tarif', 'sewa', 'rental'];
  
  // LEVEL 7: VARIANT (Spesifikasi umum - 1 parameter)
  const VARIANT_KEYWORDS = [
    'spesifikasi', 'ukuran', 'tipe ', 'type ', 'model', 
    'varian', 'warna', 'merk', 'brand', 'kapasitas', 
    'dimensi', 'bahan', 'material', 'finishing', 'grade',
    'seri', 'serie', 'versi', 'generasi', 'detail teknis'
  ];

  // Intent per Page Level (PHASE 1.5)
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
  
  // Intent untuk JASA (override)
  const JASA_INTENT = {
    'money-page': { primary: 'komersial', secondary: 'transaksional', dominance: 60 },
    'money-child': { primary: 'komersial', secondary: 'transaksional', dominance: 60 }
  };

  // Wajib Tahun di H1 (STEP 6.2)
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
    const icons = { 
      INFO: "📘", WARN: "⚠️", ERROR: "❌", SUCCESS: "✅", 
      HOME: "🏠", PILLAR: "🏛️", SP1: "⚖️", SP2: "📚", 
      MONEY: "💰", VARIANT: "🔧", SUBVARIANT: "🔬" 
    };
    const prefix = icons[type] || "📘";
    console.log(`${prefix} [Schema v5.2] ${msg}`);
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

  // ===================== DETEKSI ENTITY TYPE (PRIORITAS 1) =====================
  function detectEntityType() {
    const url = location.href.toLowerCase();
    const h1 = (document.querySelector("h1")?.innerText || "").toLowerCase();
    const title = document.title.toLowerCase();
    const combined = url + " " + h1 + " " + title;
    
    // JASA
    if (combined.includes('/jasa/') || combined.includes('jasa ') || 
        combined.includes('kontraktor') || combined.includes('pasang ') ||
        combined.includes('service ') || combined.includes('borongan')) {
      return 'jasa';
    }
    
    // SEWA
    if (combined.includes('/sewa/') || combined.includes('/rental/') || 
        combined.includes('sewa ') || combined.includes('rental ') ||
        combined.includes('alat berat')) {
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
    
    // Transaksional (prioritas tertinggi untuk Money Page)
    for (const kw of MONEY_KEYWORDS) {
      if (lowerText.includes(kw)) return 'transaksional';
    }
    
    // Komersial (untuk SP1, Variant, SubVariant)
    for (const kw of SP1_KEYWORDS) {
      if (lowerText.includes(kw)) return 'komersial';
    }
    for (const kw of VARIANT_KEYWORDS) {
      if (lowerText.includes(kw)) return 'komersial';
    }
    
    // Default Informasional
    return 'informasional';
  }

  // ===================== DETEKSI LOKASI UNTUK MONEY_CHILD =====================
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
    'pasang', 'service', 'kontraktor', 'renovasi', 'borongan',
    'kayu', 'besi', 'aluminium', 'kaca', 'semen', 'pasir', 'batu',
    'hpl', 'mdf', 'jati', 'mahoni', 'multiplek', 'triplek'
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
    'hpl', 'mdf', 'jati', 'mahoni', 'multiplek', 'triplek',
    'minimix', 'jayamix', 'readymix', 'beton cor'
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

  // ===================== DETEKSI SUB-VARIANT (2+ PARAMETER) =====================
  function isSubVariant(text) {
    const lowerText = text.toLowerCase();
    let score = 0;
    
    // Pola dimensi lengkap (Xmm x Ymm x Zmm)
    if (/(\d+(\.\d+)?\s*mm\s*x\s*\d+(\.\d+)?\s*mm\s*x\s*\d+(\.\d+)?\s*mm)/i.test(lowerText)) score++;
    if (/(\d+(\.\d+)?\s*cm\s*x\s*\d+(\.\d+)?\s*cm\s*x\s*\d+(\.\d+)?\s*cm)/i.test(lowerText)) score++;
    
    // Tebal + panjang + lebar
    if (lowerText.includes('tebal') && lowerText.includes('panjang') && lowerText.includes('lebar')) score++;
    
    // 3+ ukuran berbeda
    const dimensions = lowerText.match(/\d+(\.\d+)?\s*(mm|cm|m|ton|kg|liter)/gi) || [];
    if (dimensions.length >= 3) score++;
    
    // Kapasitas + dimensi
    if (lowerText.includes('kapasitas') && dimensions.length >= 2) score++;
    
    // Multiple 'x' dan 3+ angka
    const hasMultipleX = (lowerText.match(/x/g) || []).length >= 2;
    const hasManyNumbers = (lowerText.match(/\d+/g) || []).length >= 3;
    if (hasMultipleX && hasManyNumbers) score++;
    
    return score >= 2;
  }

  // ===================== DETEKSI PAGE LEVEL (PRIORITAS LENGKAP) =====================
  function detectPageLevel(entityType) {
    // PRIORITAS 0: HOMEPAGE
    if (isHomePage()) {
      log("HOMEPAGE terdeteksi → home (L0)", "HOME");
      return 'home';
    }
    
    const h1 = (document.querySelector("h1")?.innerText || "").toLowerCase();
    const title = document.title.toLowerCase();
    const combinedText = h1 + " " + title;
    
    log(`Menganalisis halaman: H1="${h1.substring(0, 60)}..."`, "INFO");
    
    const isJasa = entityType === 'jasa';
    const isSewa = entityType === 'sewa';
    
    // ============================================================
    // PRIORITAS 1: PILLAR / SUB-PILLAR TIPE 2 (Informasional)
    // ============================================================
    for (const kw of PILLAR_KEYWORDS) {
      if (combinedText.includes(kw)) {
        // Cek apakah ini JENIS/MACAM (SP2)
        for (const sp2kw of SP2_KEYWORDS) {
          if (combinedText.includes(sp2kw)) {
            log(`SUB-PILLAR TIPE 2 detected (${kw} + ${sp2kw}) → sub-pillar-tipe-2 (L2)`, "SP2");
            return 'sub-pillar-tipe-2';
          }
        }
        log(`PILLAR detected (${kw}) → pillar (L1)`, "PILLAR");
        return 'pillar';
      }
    }
    
    // ============================================================
    // PRIORITAS 2: SUB-PILLAR TIPE 1 (Perbandingan) 🔥 SEBELUM HARGA
    // ============================================================
    for (const kw of SP1_KEYWORDS) {
      if (combinedText.includes(kw)) {
        log(`SUB-PILLAR TIPE 1 detected (${kw}) → sub-pillar-tipe-1 (L3)`, "SP1");
        return 'sub-pillar-tipe-1';
      }
    }
    
    // ============================================================
    // PRIORITAS 3: MONEY LEVEL (Harga/Sewa)
    // ============================================================
    for (const kw of MONEY_KEYWORDS) {
      if (combinedText.includes(kw)) {
        log(`Money keyword detected: ${kw}`, "MONEY");
        
        // JASA tidak boleh MONEY_MASTER
        if (isJasa) {
          log(`JASA + harga → money-page (L5)`, "MONEY");
          return 'money-page';
        }
        
        // Ekstrak setelah keyword
        let afterKw = '';
        const kwIndex = combinedText.indexOf(kw);
        afterKw = combinedText.substring(kwIndex + kw.length).trim();
        const words = afterKw.split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;
        
        log(`After keyword: "${afterKw.substring(0, 50)}" | Words: ${wordCount}`, "INFO");
        
        // CEK LOKASI (MONEY_CHILD)
        if (isLocation(afterKw)) {
          log(`Location detected → money-child (L6)`, "MONEY");
          return 'money-child';
        }
        
        // CEK SPESIFISITAS PRODUK
        const isSpecific = isSpecificProduct(afterKw, wordCount);
        
        // MONEY_MASTER: 1-2 kata ATAU 3 kata tapi masih umum
        if (wordCount <= 2 || (wordCount === 3 && !isSpecific)) {
          log(`money-master (${wordCount} kata) → money-master (L4)`, "MONEY");
          return 'money-master';
        }
        
        // MONEY_PAGE: 3+ kata dan spesifik
        log(`money-page (${wordCount} kata, specific=${isSpecific}) → money-page (L5)`, "MONEY");
        return 'money-page';
      }
    }
    
    // ============================================================
    // PRIORITAS 4: JASA/SEWA (tanpa keyword harga)
    // ============================================================
    if (isJasa) {
      const jasaKeywords = ['jasa', 'pasang', 'service', 'kontraktor', 'borongan', 
                             'renovasi', 'bangun', 'konsultasi', 'survey', 'estimasi'];
      for (const kw of jasaKeywords) {
        if (combinedText.includes(kw)) {
          // Double-check perbandingan
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
      const sewaKeywords = ['sewa', 'rental', 'alat berat', 'excavator', 'bulldozer', 'crane'];
      for (const kw of sewaKeywords) {
        if (combinedText.includes(kw)) {
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
    // PRIORITAS 5: SUB-VARIANT (Level 8 - 2+ parameter)
    // ============================================================
    if (isSubVariant(combinedText)) {
      log(`SUB-VARIANT detected (2+ parameters) → sub-variant (L8)`, "SUBVARIANT");
      return 'sub-variant';
    }
    
    // ============================================================
    // PRIORITAS 6: VARIANT (Level 7 - Spesifikasi umum)
    // ============================================================
    for (const kw of VARIANT_KEYWORDS) {
      if (combinedText.includes(kw)) {
        log(`VARIANT detected (${kw}) → variant (L7)`, "VARIANT");
        return 'variant';
      }
    }
    
    // Single dimension (tanpa 'x')
    if (/\d+(\.\d+)?\s*(mm|cm|m|kg|ton)/.test(combinedText) && !combinedText.includes('x')) {
      log(`VARIANT detected (single dimension) → variant (L7)`, "VARIANT");
      return 'variant';
    }
    
    // ============================================================
    // PRIORITAS 7: SUB-PILLAR TIPE 2 (Jenis/Macam)
    // ============================================================
    for (const kw of SP2_KEYWORDS) {
      if (combinedText.startsWith(kw) || combinedText.includes(kw + ' ') || combinedText.includes(kw + '-')) {
        log(`SUB-PILLAR TIPE 2 detected (${kw}) → sub-pillar-tipe-2 (L2)`, "SP2");
        return 'sub-pillar-tipe-2';
      }
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
        log(`⚠️ PERINGATAN: H1 HARUS mengandung tahun ${CONFIG.CURRENT_YEAR} untuk ${pageLevel}`, "WARN");
        return { required: true, valid: false, message: `H1 harus mengandung tahun ${CONFIG.CURRENT_YEAR}` };
      }
      log(`✅ Tahun ${CONFIG.CURRENT_YEAR} ditemukan di H1 untuk ${pageLevel}`, "SUCCESS");
      return { required: true, valid: true };
    }
    
    if (rule === 'produk-only' && entityType !== 'jasa' && entityType !== 'sewa') {
      const h1 = document.querySelector("h1")?.innerText || "";
      const hasYear = new RegExp(`\\b${CONFIG.CURRENT_YEAR}\\b`).test(h1);
      if (!hasYear) {
        log(`⚠️ PERINGATAN: H1 HARUS mengandung tahun ${CONFIG.CURRENT_YEAR} untuk ${pageLevel} (Produk/Material)`, "WARN");
        return { required: true, valid: false, message: `H1 harus mengandung tahun ${CONFIG.CURRENT_YEAR}` };
      }
      log(`✅ Tahun ${CONFIG.CURRENT_YEAR} ditemukan di H1 untuk ${pageLevel} (Produk/Material)`, "SUCCESS");
      return { required: true, valid: true };
    }
    
    return { required: false, valid: true };
  }

  // ===================== TENTUKAN SCHEMA YANG TEPAT =====================
  function getRecommendedSchema(pageLevel, entityType) {
    const isJasaSewa = entityType === 'jasa' || entityType === 'sewa';
    
    // HOMEPAGE → WebPage
    if (pageLevel === 'home') {
      return { 
        primary: 'WebPage', 
        eligible: true,
        message: `HOMEPAGE → WebPage Schema`
      };
    }
    
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
    const cleanTextContent = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, "");
    const words = cleanTextContent.trim().split(/\s+/).filter(w => w.length > 0);
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
    if (pageLevel === 'sub-pillar-tipe-1') keywords.add("perbandingan");
    if (pageLevel === 'sub-pillar-tipe-2') keywords.add("jenis material");
    if (pageLevel === 'money-master') keywords.add("harga terbaru");
    if (pageLevel === 'money-child') keywords.add("harga lokal");
    if (pageLevel === 'variant') keywords.add("spesifikasi teknis");
    if (pageLevel === 'sub-variant') keywords.add("detail dimensi");
    if (entityType === 'material') keywords.add("material bangunan");
    if (entityType === 'jasa') keywords.add("jasa profesional");
    if (entityType === 'sewa') keywords.add("sewa alat berat");
    
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
      "headline": escapeJSON(title.substring(0, 110)),
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
      "articleBody": cleanBody.substring(0, 5000),
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
      "name": title.substring(0, 110),
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

  function generateHomePageSchema(data) {
    const { url, title, descMeta } = data;
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Beranda - " + CONFIG.SITE_NAME,
      "url": url,
      "description": descMeta || "Solusi konstruksi dan material bangunan terpercaya",
      "publisher": {
        "@type": "Organization",
        "name": CONFIG.SITE_NAME,
        "logo": { "@type": "ImageObject", "url": `${CONFIG.SITE_URL}/favicon.ico` }
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
    log("AUTO-SCHEMA GENERATOR v5.2 DIMULAI", "INFO");
    log("═══════════════════════════════════════════════════", "INFO");
    
    const pageData = extractPageData();
    const entityType = detectEntityType();
    const pageLevel = detectPageLevel(entityType);
    const yearValidation = validateYearInH1(pageLevel, entityType);
    const schemaConfig = getRecommendedSchema(pageLevel, entityType);
    
    log("───────────────────────────────────────────────────", "INFO");
    log(`HASIL DETEKSI (PHASE SYSTEM):`, "INFO");
    log(`  Entity Type    : ${entityType.toUpperCase()}`, "SUCCESS");
    log(`  Page Level     : ${pageLevel.toUpperCase()} (L${TYPE_LEVEL_MAP[pageLevel] || '?'})`, "SUCCESS");
    log(`  Wajib Tahun    : ${yearValidation.required ? 'YES' : 'NO'}`, yearValidation.required ? "WARN" : "INFO");
    log(`  Tahun di H1    : ${yearValidation.valid ? '✅ ADA' : '❌ TIDAK ADA'}`, yearValidation.valid ? "SUCCESS" : "WARN");
    log(`  Schema Utama   : ${schemaConfig.primary}`, "SUCCESS");
    log(`  ${schemaConfig.message}`, "INFO");
    log("───────────────────────────────────────────────────", "INFO");
    
    // ===== SCHEMA HOMEPAGE (#auto-schema-home) =====
    const homeSchemaElem = document.getElementById("auto-schema-home");
    if (homeSchemaElem && pageLevel === 'home') {
      const homeSchema = generateHomePageSchema(pageData);
      homeSchemaElem.textContent = JSON.stringify(homeSchema, null, 2);
      log("✅ HomePage Schema berhasil dipasang", "SUCCESS");
    } else if (homeSchemaElem && pageLevel !== 'home') {
      homeSchemaElem.remove();
      log("🗑️ HomePage Schema dihapus (bukan homepage)", "INFO");
    }
    
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
    
    // ===== SCHEMA STATIC PAGE (#auto-schema-static-page) =====
    const staticElem = document.getElementById("auto-schema-static-page");
    if (staticElem) {
      if (schemaConfig.eligible && schemaConfig.primary === "Article") {
        waitForAEDMetaDates((dates) => {
          const staticSchema = generateArticleSchema(pageData, dates, pageLevel, entityType);
          staticElem.textContent = JSON.stringify(staticSchema, null, 2);
          log("✅ Static Article Schema berhasil dipasang", "SUCCESS");
        });
      } else {
        staticElem.remove();
        log("🗑️ Static Article Schema dihapus", "INFO");
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
    if ((entityType === 'jasa' || entityType === 'sewa') && 
        (pageLevel === 'money-page' || pageLevel === 'money-child')) {
      log("📌 JASA/SEWA: Service Schema diserahkan ke script terpisah", "INFO");
    }
    
    // ===== SUMMARY =====
    log("═══════════════════════════════════════════════════", "INFO");
    log("EXECUTION SUMMARY:", "INFO");
    log(`  Entity Type    : ${entityType.toUpperCase()}`, "INFO");
    log(`  Page Level     : ${pageLevel.toUpperCase()} (L${TYPE_LEVEL_MAP[pageLevel] || '?'})`, "INFO");
    log(`  Primary Schema : ${schemaConfig.primary}`, "SUCCESS");
    log(`  Year Required  : ${yearValidation.required ? 'YES' : 'NO'}`, yearValidation.required ? "WARN" : "INFO");
    log(`  Year Valid     : ${yearValidation.valid ? 'YES' : 'NO'}`, yearValidation.valid ? "SUCCESS" : "ERROR");
    log("═══════════════════════════════════════════════════", "INFO");
    log("AUTO-SCHEMA GENERATOR v5.2 SELESAI", "SUCCESS");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
