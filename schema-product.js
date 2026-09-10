/**
 * ⚡ AutoSchema Hybrid v4.74 — PLD-ONLY MODE + SCHEMA PRODUK/MATERIAL ONLY
 * 
 * UPDATE v4.74:
 * - HAPUS: detectPageLevelFallback() — tidak deteksi ulang
 * - HAPUS: PRODUK_SPECS, JASA_SPECS, MATERIAL_SPECS, SEWA_SPECS, DESAIN_SPECS
 * - SEDERHANAKAN: detectContentFocus() — terima dari body/V37.9-A
 * - SEDERHANAKAN: isImageEligible() — terima dari body/V37.9-A
 * - SEDERHANAKAN: needYear() — terima dari body/V37.9-A
 * - SEDERHANAKAN: shouldSkipProductSchema() — terima dari entity type
 * - SEDERHANAKAN: detectProductName() — dari H1/meta
 * - SEDERHANAKAN: detectProductCategory() — dari sub-type
 * - TAMBAH: getKategori() — EVERGREEN/NON-EVERGREEN dari body/V37.9-A
 * - TAMBAH: getEntitySubType() — dari body/V37.9-A
 * - TAMBAH: getWordCountTarget() — dari body/V37.9-A
 * - TAMBAH: getSchemaType() — dari body/V37.9-A
 * - TAMBAH: getCtaType() — dari body/V37.9-A
 * - TAMBAH: getH1Pattern() — dari body/V37.9-A
 * - PERTAHANKAN: Update H1 Tahun (valid)
 * - PERTAHANKAN: Update Bulan & Tahun Konten (AED Based)
 * - PERTAHANKAN: Update Tahun di Konten Lainnya
 * - PERTAHANKAN: Image Generation (Canvas)
 * - PERTAHANKAN: Image Fix (FIGURE)
 * - PERTAHANKAN: Schema Product
 * - PERTAHANKAN: Offer Schema
 * - PERTAHANKAN: priceValidUntil dari AED
 * - PERTAHANKAN: Wait Functions
 * - PERTAHANKAN: Color Config
 * - PERTAHANKAN: Semua fungsi valid lainnya
 * 
 * @version 4.74
 * @date 2026-09-10
 */

(function() {
  "use strict";

  // ===================== KONFIGURASI =====================
  const CONFIG = {
    DEBUG: true,
    DELAY_MS: 500,
    MAX_OFFERS: 8,
    MIN_PRICE: 10000,
    MAX_PRICE: 100000000,
    SKIP_WORD_COUNT: 300,
    PLD_TIMEOUT: 5000,
    AED_TIMEOUT: 10000,
    BREADCRUMB_TIMEOUT: 3000,
    MIN_YEAR_TO_UPDATE: 2026
  };

  // ✅ FALLBACK IMAGE (logo)
  const LOGO_IMAGE = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";
  const FALLBACK_IMAGE = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiWWAP6ezcmzgbGtHmmJqBjYkbsdQBrwCeC9pl9ocjL-VSQYftirdvXAF1T-eg_QMSqu1WiFidDc9fnChi0yaOqi0Dd6EVMy4ZX3P7vccY4XJMu-7k2TGVd5TS1wIG5jgIm_6beYVb2zuNQGS7eBuODJqd20c4ckvd0-HaEqGf4W-B_750I91wi9IhqqnI/s320/No_Image_Available.jpg";

  function log(msg, type = "INFO") {
    if (!CONFIG.DEBUG && type === "INFO") return;
    const icons = { 
      INFO: "📘", WARN: "⚠️", ERROR: "❌", SUCCESS: "✅", SKIP: "⏭️", 
      PRODUCT: "🏗️", IMAGE: "📸", YEAR: "📅", FOCUS: "🎯", TABLE: "📊", 
      H1: "📝", PRIORITY: "🔴", STOP: "🛑", BREADCRUMB: "🍞", AED: "⚡", 
      COMMERCIAL: "🛒", GABUNG: "📚", PLD: "🔷", KATEGORI: "🏷️", SCHEMA: "🔗"
    };
    const prefix = icons[type] || "📘";
    console.log(`${prefix} [AutoSchema v4.74] ${msg}`);
  }

  // ============================================================
  // 🔥🔥🔥 PLD-ONLY DATA READERS (BARU v4.74) 🔥🔥🔥
  // 🔥 TIDAK ADA DETEKSI ULANG — HANYA TERIMA DARI PLD/V37.9-A 🔥
  // ============================================================

  /**
   * 🔥 TERIMA PAGE LEVEL DARI PLD (TIDAK DETEKSI ULANG)
   */
  function getPageLevelFromPLD() {
    // 1. Cek body attribute (dari V37.9-A)
    const bodyLevel = document.body.getAttribute('data-page-level');
    if (bodyLevel) {
      log(`📌 Page Level dari body: ${bodyLevel}`, "PLD");
      return bodyLevel;
    }
    
    // 2. Cek PLD v22.62
    if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
      try {
        const level = window.pageLevelDetectorv22.detect();
        if (level) {
          log(`📌 Page Level dari PLD v22.62: ${level}`, "PLD");
          return level;
        }
      } catch(e) {}
    }
    
    // 3. Cek PLD versi lain
    const pldVersions = [
      { obj: window.pageLevelDetectorv20, name: 'v20.x' },
      { obj: window.pageLevelDetectorv19, name: 'v19.0' },
      { obj: window.pageLevelDetectorV18, name: 'v18.7' },
      { obj: window.pageLevelDetectorV17, name: 'v17.0' },
      { obj: window.pageLevelDetector, name: 'legacy' }
    ];
    
    for (let pld of pldVersions) {
      if (pld.obj && typeof pld.obj.detect === 'function') {
        try {
          const level = pld.obj.detect();
          if (level) {
            log(`📌 Page Level dari PLD ${pld.name}: ${level}`, "PLD");
            return level;
          }
        } catch(e) {}
      }
    }
    
    // 4. JANGAN DETEKSI ULANG — return null
    log('⚠️ Page Level TIDAK TERSEDIA dari PLD', "WARN");
    return null;
  }

  /**
   * 🔥 TERIMA ENTITY TYPE DARI PLD (TIDAK DETEKSI ULANG)
   */
  function getEntityTypeFromPLD() {
    // 1. Cek body attribute (dari V37.9-A)
    const bodyEntity = document.body.getAttribute('data-entity-type');
    if (bodyEntity) {
      log(`🏷️ Entity Type dari body: ${bodyEntity}`, "PLD");
      return bodyEntity;
    }
    
    // 2. Cek PLD v22.62
    if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detectEntityType === 'function') {
      try {
        const entityType = window.pageLevelDetectorv22.detectEntityType();
        if (entityType) {
          log(`🏷️ Entity Type dari PLD v22.62: ${entityType}`, "PLD");
          return entityType;
        }
      } catch(e) {}
    }
    
    // 3. Cek PLD versi lain
    const pldVersions = [
      { obj: window.pageLevelDetectorv20, name: 'v20.x' },
      { obj: window.pageLevelDetectorv19, name: 'v19.0' },
      { obj: window.pageLevelDetectorV18, name: 'v18.7' },
      { obj: window.pageLevelDetectorV17, name: 'v17.0' },
      { obj: window.pageLevelDetector, name: 'legacy' }
    ];
    
    for (let pld of pldVersions) {
      if (pld.obj && typeof pld.obj.detectEntityType === 'function') {
        try {
          const entityType = pld.obj.detectEntityType();
          if (entityType) {
            log(`🏷️ Entity Type dari PLD ${pld.name}: ${entityType}`, "PLD");
            return entityType;
          }
        } catch(e) {}
      }
    }
    
    // 4. JANGAN DETEKSI ULANG — return null
    log('⚠️ Entity Type TIDAK TERSEDIA dari PLD', "WARN");
    return null;
  }

  /**
   * 🔥 TERIMA CONTENT FOCUS DARI BODY/V37.9-A (TIDAK DETEKSI ULANG)
   */
  function detectContentFocus() {
    // 1. Body attribute (dari V37.9-A)
    const bodyFocus = document.body.getAttribute('data-content-focus');
    if (bodyFocus) {
      log(`🎯 Content Focus dari body: ${bodyFocus}`, "FOCUS");
      return bodyFocus.toUpperCase();
    }
    
    // 2. V37.9-A
    if (window.V379A && window.V379A.focusKonten) {
      log(`🎯 Content Focus dari V37.9-A: ${window.V379A.focusKonten}`, "FOCUS");
      return window.V379A.focusKonten.toUpperCase();
    }
    
    // 3. Fallback SEDERHANA (bukan daftar kata — hanya cek H1 tahun)
    const h1El = document.querySelector('h1');
    const h1Text = h1El ? h1El.innerText.toLowerCase() : '';
    
    if (/\b(20[2-9][0-9])\b/.test(h1Text)) {
      log('🎯 Content Focus: HARGA (H1 ada tahun)', "FOCUS");
      return 'HARGA';
    }
    
    // 4. Default: INFORMASI
    log('🎯 Content Focus: INFORMASI (default)', "FOCUS");
    return 'INFORMASI';
  }

  /**
   * 🔥 TERIMA KATEGORI EVERGREEN DARI BODY/V37.9-A (BARU v4.74)
   */
  function getKategori() {
    // 1. Body attribute (dari V37.9-A)
    const bodyKategori = document.body.getAttribute('data-kategori');
    if (bodyKategori) {
      log(`🏷️ Kategori dari body: ${bodyKategori}`, "KATEGORI");
      return bodyKategori.toUpperCase();
    }
    
    // 2. V37.9-A
    if (window.V379A && window.V379A.kategori) {
      log(`🏷️ Kategori dari V37.9-A: ${window.V379A.kategori}`, "KATEGORI");
      return window.V379A.kategori.toUpperCase();
    }
    
    // 3. Fallback dari content focus
    const focus = detectContentFocus();
    if (focus === 'INFORMASI') {
      log('🏷️ Kategori: EVERGREEN (dari INFORMASI)', "KATEGORI");
      return 'EVERGREEN';
    }
    if (['HARGA', 'COMMERCIAL', 'GABUNG'].includes(focus)) {
      log('🏷️ Kategori: NON-EVERGREEN (dari HARGA/COMMERCIAL/GABUNG)', "KATEGORI");
      return 'NON-EVERGREEN';
    }
    
    log('🏷️ Kategori: EVERGREEN (default)', "KATEGORI");
    return 'EVERGREEN';
  }

  /**
   * 🔥 TERIMA ENTITY SUB-TYPE DARI BODY/V37.9-A (BARU v4.74)
   */
  function getEntitySubType() {
    // 1. Body attribute (dari V37.9-A PHASE 4.6)
    const bodySubType = document.body.getAttribute('data-entity-sub-type');
    if (bodySubType) {
      log(`🔷 Entity Sub-Type dari body: ${bodySubType}`, "PLD");
      return bodySubType;
    }
    
    // 2. V37.9-A
    if (window.V379A && window.V379A.entitySubType) {
      log(`🔷 Entity Sub-Type dari V37.9-A: ${window.V379A.entitySubType}`, "PLD");
      return window.V379A.entitySubType;
    }
    
    log('⚠️ Entity Sub-Type TIDAK TERSEDIA', "WARN");
    return null;
  }

  /**
   * 🔥 TERIMA WORD COUNT TARGET DARI BODY/V37.9-A (BARU v4.74)
   */
  function getWordCountTarget() {
    // 1. Body attribute
    const bodyMin = document.body.getAttribute('data-word-count-min');
    const bodyMax = document.body.getAttribute('data-word-count-max');
    if (bodyMin && bodyMax) {
      const result = { min: parseInt(bodyMin), max: parseInt(bodyMax) };
      log(`📊 Word Count Target dari body: ${result.min}-${result.max}`, "PLD");
      return result;
    }
    
    // 2. V37.9-A
    if (window.V379A && window.V379A.wordCountTarget) {
      log(`📊 Word Count Target dari V37.9-A`, "PLD");
      return window.V379A.wordCountTarget;
    }
    
    log('⚠️ Word Count Target TIDAK TERSEDIA', "WARN");
    return null;
  }

  /**
   * 🔥 TERIMA SCHEMA TYPE DARI BODY/V37.9-A (BARU v4.74)
   */
  function getSchemaType() {
    // 1. Body attribute
    const bodyPrimary = document.body.getAttribute('data-schema-type-primary');
    const bodySecondary = document.body.getAttribute('data-schema-type-secondary');
    if (bodyPrimary) {
      const result = { 
        primary: bodyPrimary, 
        secondary: bodySecondary || 'FAQPage' 
      };
      log(`🔗 Schema Type dari body: ${result.primary} + ${result.secondary}`, "SCHEMA");
      return result;
    }
    
    // 2. V37.9-A
    if (window.V379A && window.V379A.schemaType) {
      log(`🔗 Schema Type dari V37.9-A`, "SCHEMA");
      return window.V379A.schemaType;
    }
    
    log('⚠️ Schema Type TIDAK TERSEDIA', "WARN");
    return null;
  }

  /**
   * 🔥 TERIMA CTA TYPE DARI BODY/V37.9-A (BARU v4.74)
   */
  function getCtaType() {
    // 1. Body attribute
    const bodyCtaType = document.body.getAttribute('data-cta-type');
    const bodyCtaText = document.body.getAttribute('data-cta-text');
    if (bodyCtaType) {
      const result = { 
        type: bodyCtaType, 
        text: bodyCtaText || bodyCtaType 
      };
      log(`🔘 CTA Type dari body: ${result.type} — "${result.text}"`, "PLD");
      return result;
    }
    
    // 2. V37.9-A
    if (window.V379A && window.V379A.ctaType) {
      log(`🔘 CTA Type dari V37.9-A`, "PLD");
      return window.V379A.ctaType;
    }
    
    log('⚠️ CTA Type TIDAK TERSEDIA', "WARN");
    return null;
  }

  /**
   * 🔥 TERIMA H1 PATTERN DARI BODY/V37.9-A (BARU v4.74)
   */
  function getH1Pattern() {
    // 1. Body attribute
    const bodyH1Pattern = document.body.getAttribute('data-h1-pattern');
    if (bodyH1Pattern) {
      log(`📝 H1 Pattern dari body: ${bodyH1Pattern}`, "PLD");
      return bodyH1Pattern;
    }
    
    // 2. V37.9-A
    if (window.V379A && window.V379A.h1Pattern) {
      log(`📝 H1 Pattern dari V37.9-A`, "PLD");
      return window.V379A.h1Pattern;
    }
    
    // 3. Fallback dari kategori
    const kategori = getKategori();
    const pattern = kategori === 'NON-EVERGREEN' ? 'with-year' : 'no-year';
    log(`📝 H1 Pattern: ${pattern} (dari kategori)`, "PLD");
    return pattern;
  }

  /**
   * 🔥 CEK LAYAK PAKAI TAHUN (TIDAK HARDCODED)
   */
  function needYear(level) {
    // 1. Body attribute (dari V37.9-A)
    const bodyNeedYear = document.body.getAttribute('data-need-year');
    if (bodyNeedYear !== null) {
      const result = bodyNeedYear === 'true';
      log(`📅 Need Year dari body: ${result}`, "YEAR");
      return result;
    }
    
    // 2. V37.9-A
    if (window.V379A && window.V379A.needYear !== undefined) {
      log(`📅 Need Year dari V37.9-A: ${window.V379A.needYear}`, "YEAR");
      return window.V379A.needYear;
    }
    
    // 3. Fallback dari H1 Pattern
    const h1Pattern = getH1Pattern();
    const result = h1Pattern === 'with-year';
    log(`📅 Need Year: ${result} (dari H1 Pattern)`, "YEAR");
    return result;
  }

  /**
   * 🔥 CEK KELAYAKAN GAMBAR (TIDAK SCAN KEYWORD)
   */
  function isImageEligible(pageLevel) {
    // 1. Body attribute (dari V37.9-A)
    const bodyImageEligible = document.body.getAttribute('data-image-eligible');
    if (bodyImageEligible !== null) {
      const result = bodyImageEligible === 'true';
      log(`📸 Image Eligible dari body: ${result}`, "IMAGE");
      return result;
    }
    
    // 2. V37.9-A
    if (window.V379A && window.V379A.imageEligible !== undefined) {
      log(`📸 Image Eligible dari V37.9-A: ${window.V379A.imageEligible}`, "IMAGE");
      return window.V379A.imageEligible;
    }
    
    // 3. Fallback SEDERHANA (berdasarkan level)
    const mandatoryImageLevels = [
      'money-master', 'money-page', 'money-child',
      'variant', 'sub-variant',
      'pillar', 'sub-pillar-tipe-1', 'sub-pillar-tipe-2'
    ];
    
    const result = mandatoryImageLevels.includes(pageLevel);
    log(`📸 Image Eligible: ${result} (dari level: ${pageLevel})`, "IMAGE");
    return result;
  }

  /**
   * 🔥 CEK SKIP PRODUCT SCHEMA (TIDAK SCAN KEYWORD PRODUK)
   */
  function shouldSkipProductSchema(pageLevel) {
    // 1. Cek entity type dari body (dari PLD)
    const entityType = document.body.getAttribute('data-entity-type') || getEntityTypeFromPLD();
    if (entityType) {
      // PRODUK & MATERIAL → Product schema
      if (['produk', 'material'].includes(entityType)) {
        log(`✅ Product Schema: entity "${entityType}" → LANJUT`, "PRODUCT");
        return false;
      }
      // JASA & SEWA → skip di script ini (ditangani script Service)
      if (['jasa', 'sewa'].includes(entityType)) {
        log(`⏭️ Product Schema SKIP: entity "${entityType}" → bukan produk/material`, "SKIP");
        return true;
      }
      // DESAIN & ARTIKEL → skip
      if (['desain', 'artikel'].includes(entityType)) {
        log(`⏭️ Product Schema SKIP: entity "${entityType}"`, "SKIP");
        return true;
      }
    }
    
    // 2. Fallback SEDERHANA (berdasarkan level)
    if (['variant', 'sub-variant'].includes(pageLevel)) {
      log(`✅ Product Schema: level "${pageLevel}" → LANJUT`, "PRODUCT");
      return false;
    }
    if (['money-master', 'money-page', 'money-child'].includes(pageLevel)) {
      log(`✅ Product Schema: level "${pageLevel}" → LANJUT`, "PRODUCT");
      return false;
    }
    
    // 3. Pillar/SP → skip (bukan halaman produk)
    if (['pillar', 'sub-pillar-tipe-1', 'sub-pillar-tipe-2'].includes(pageLevel)) {
      log(`⏭️ Product Schema SKIP: level "${pageLevel}" → halaman informasi`, "SKIP");
      return true;
    }
    
    // 4. Default: skip jika tidak yakin
    log(`⏭️ Product Schema SKIP: tidak memenuhi kriteria`, "SKIP");
    return true;
  }

  // ============================================================
  // 🔥🔥🔥 WAIT FUNCTIONS 🔥🔥🔥
  // ============================================================

  function waitForBreadcrumb(timeout = CONFIG.BREADCRUMB_TIMEOUT) {
    return new Promise((resolve) => {
      const startTime = Date.now();

      function checkBreadcrumb() {
        const breadcrumbSelectors = [
          '.breadcrumbs', '.breadcrumb', '.nav-trail', '.breadcrumb-item',
          '.crumbs', '.breadcrumb-link', '[aria-label="breadcrumb"]',
          '.post-breadcrumb', '.breadcrumb-nav', '.nav-breadcrumb'
        ];

        for (const selector of breadcrumbSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            const links = element.querySelectorAll('a');
            if (links.length > 0) {
              log(`🍞 Breadcrumb ditemukan (${selector}) — ${links.length} link`, "BREADCRUMB");
              resolve(true);
              return;
            }
            if (element.innerText.trim().length > 0) {
              log(`🍞 Breadcrumb ditemukan (${selector}) — ada teks`, "BREADCRUMB");
              resolve(true);
              return;
            }
          }
        }

        if (Date.now() - startTime > timeout) {
          log(`⏰ Breadcrumb timeout (${timeout}ms), lanjutkan`, "WARN");
          resolve(false);
          return;
        }

        setTimeout(checkBreadcrumb, 100);
      }

      checkBreadcrumb();
    });
  }

  function waitForAEDMetaDates(timeout = CONFIG.AED_TIMEOUT) {
    return new Promise((resolve) => {
      if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
        log(`⚡ AEDMetaDates ready: ${window.AEDMetaDates.dateModified}`, "AED");
        resolve(window.AEDMetaDates);
        return;
      }

      const onReady = () => {
        if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
          log(`⚡ AEDMetaDates ready (event): ${window.AEDMetaDates.dateModified}`, "AED");
          resolve(window.AEDMetaDates);
        } else {
          resolve(null);
        }
      };

      window.addEventListener("detectEvergreenReady", onReady, { once: true });

      const startTime = Date.now();
      const interval = setInterval(() => {
        if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
          clearInterval(interval);
          log(`⚡ AEDMetaDates ready (interval): ${window.AEDMetaDates.dateModified}`, "AED");
          resolve(window.AEDMetaDates);
          return;
        }

        if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          log(`⏰ AEDMetaDates timeout (${timeout}ms), using fallback`, "WARN");
          resolve({
            dateModified: new Date().toISOString(),
            nextUpdate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            validityDays: 30,
            usePriceValidUntil: true,
            pageLevel: 'money-page',
            entityType: 'produk',
            type: 'non-evergreen'
          });
        }
      }, 100);
    });
  }

  // ============================================================
  // 🔥🔥🔥 FUNGSI PENDUKUNG 🔥🔥🔥
  // ============================================================

  function getColorConfig(level, focus) {
    const isMoneyLevel = ['money-master', 'money-page', 'money-child'].includes(level);
    const isMoneyInfo = isMoneyLevel && focus === 'INFORMASI';
    const isMoneyHarga = isMoneyLevel && focus === 'HARGA';
    const isMoneyCommercial = isMoneyLevel && focus === 'COMMERCIAL';
    const isMoneyGabung = isMoneyLevel && focus === 'GABUNG';
    
    const colors = {
      'pillar': { bg: '#0a2a44', text: '#ffffff', accent: '#25d366' },
      'sub-pillar-tipe-2': { bg: '#1a237e', text: '#ffffff', accent: '#25d366' },
      'sub-pillar-tipe-1': { bg: '#004d40', text: '#ffffff', accent: '#25d366' },
      
      'money-master-informasi': { bg: '#1a5a8c', text: '#ffffff', accent: '#25d366' },
      'money-page-informasi': { bg: '#2a6a9c', text: '#ffffff', accent: '#25d366' },
      'money-child-informasi': { bg: '#3a7aac', text: '#ffffff', accent: '#25d366' },
      
      'money-master-harga': { bg: '#0a2a44', text: '#ffffff', accent: '#ffd700' },
      'money-page-harga': { bg: '#1a5a8c', text: '#ffffff', accent: '#ffd700' },
      'money-child-harga': { bg: '#bf360c', text: '#ffffff', accent: '#ffd700' },
      
      'money-master-commercial': { bg: '#8b0000', text: '#ffffff', accent: '#ffd700' },
      'money-page-commercial': { bg: '#8b0000', text: '#ffffff', accent: '#ffd700' },
      'money-child-commercial': { bg: '#8b0000', text: '#ffffff', accent: '#ffd700' },
      
      'money-master-gabung': { bg: '#4a148c', text: '#ffffff', accent: '#ffd700' },
      'money-page-gabung': { bg: '#4a148c', text: '#ffffff', accent: '#ffd700' },
      'money-child-gabung': { bg: '#4a148c', text: '#ffffff', accent: '#ffd700' },
      
      'variant': { bg: '#4a148c', text: '#ffffff', accent: '#25d366' },
      'sub-variant': { bg: '#4e342e', text: '#ffffff', accent: '#25d366' }
    };
    
    let key = level;
    if (isMoneyInfo) key = level + '-informasi';
    else if (isMoneyHarga) key = level + '-harga';
    else if (isMoneyCommercial) key = level + '-commercial';
    else if (isMoneyGabung) key = level + '-gabung';
    
    return colors[key] || colors['pillar'];
  }

  function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
  }

  function getCurrentYear() {
    return new Date().getFullYear();
  }

  function extractAllYears(text) {
    const matches = text.match(/\b(19|20)\d{2}\b/g);
    if (!matches) return [];
    return matches.map(Number).filter(y => y >= 1900 && y <= 2099);
  }

  function extractYear(text) {
    const years = extractAllYears(text);
    return years.length > 0 ? years[0] : null;
  }

  // ============================================================
  // 🔥🔥🔥 UPDATE TAHUN H1 (DIPERTAHANKAN — TIDAK DIUBAH)
  // ============================================================
  function updateH1Year(pageLevel) {
    if (!needYear(pageLevel)) {
      log(`⏭️ Level ini TIDAK butuh tahun di H1 (${pageLevel})`, "YEAR");
      return false;
    }

    const currentYear = getCurrentYear();
    const h1 = document.querySelector('h1');
    if (!h1) {
      log(`⚠️ Tidak ada H1 ditemukan`, "WARN");
      return false;
    }

    const originalText = h1.innerText;
    const detectedYear = extractYear(originalText);

    if (detectedYear) {
      if (detectedYear < CONFIG.MIN_YEAR_TO_UPDATE) {
        log(`🛑 STOP: H1 mengandung tahun ${detectedYear} (< ${CONFIG.MIN_YEAR_TO_UPDATE})`, "STOP");
        log(`   📝 H1: "${originalText}"`, "H1");
        return false;
      }

      if (detectedYear === 2025) {
        log(`🛑 STOP: H1 mengandung tahun ${detectedYear} (masih valid)`, "STOP");
        log(`   📝 H1: "${originalText}"`, "H1");
        return false;
      }

      if (detectedYear > 2025) {
        const newText = originalText.replace(/\b(19|20)\d{2}\b/, currentYear);
        h1.innerText = newText;
        log(`✅ H1: Tahun diupdate ${detectedYear} → ${currentYear}`, "YEAR");
        log(`   📝 H1 baru: "${newText}"`, "H1");
        return true;
      }
    }

    if (!detectedYear) {
      const newText = originalText + ' ' + currentYear;
      h1.innerText = newText;
      log(`✅ H1: Tahun ditambahkan → "${newText}"`, "YEAR");
      return true;
    }

    log(`✅ H1: Tahun sudah sesuai (${detectedYear})`, "YEAR");
    return true;
  }

  // ============================================================
  // 🔥🔥🔥 UPDATE TAHUN DI KONTEN (DIPERTAHANKAN — TIDAK DIUBAH)
  // ============================================================
  function updateContentYears() {
    const currentYear = getCurrentYear();
    let updated = 0;

    const bodyElements = document.querySelectorAll('p, h2, h3, h4, li, td, th, figcaption, .post-body, .entry-content');
    const yearPattern = /\b(202[6-9]|2030)\b/g;

    bodyElements.forEach(el => {
      const text = el.innerText;
      if (text && yearPattern.test(text)) {
        const newText = text.replace(/\b(202[6-9]|2030)\b/g, currentYear);
        if (newText !== text) {
          el.innerText = newText;
          updated++;
        }
      }
    });

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      const content = metaDesc.getAttribute('content');
      if (content && yearPattern.test(content)) {
        const newContent = content.replace(/\b(202[6-9]|2030)\b/g, currentYear);
        if (newContent !== content) {
          metaDesc.setAttribute('content', newContent);
          updated++;
        }
      }
    }

    const schemaScripts = document.querySelectorAll('script[type="application/ld+json"]');
    schemaScripts.forEach(script => {
      try {
        let content = script.textContent;
        if (content && yearPattern.test(content)) {
          const newContent = content.replace(/\b(202[6-9]|2030)\b/g, currentYear);
          if (newContent !== content) {
            script.textContent = newContent;
            updated++;
          }
        }
      } catch(e) {}
    });

    if (updated > 0) {
      log(`✅ ${updated} elemen konten diupdate ke tahun ${currentYear}`, "YEAR");
    }

    return updated;
  }

  // ============================================================
  // 🔥🔥🔥 UPDATE BULAN & TAHUN KONTEN (AED BASED) — TIDAK DIUBAH
  // ============================================================
  function updateContentDateReferences(aed, pageLevel) {
    log(`📅 UPDATE BULAN & TAHUN DI KONTEN (AED BASED)`, "YEAR");
    
    const moneyLevels = ['money-master', 'money-page', 'money-child'];
    if (!moneyLevels.includes(pageLevel)) {
        log(`⏭️ Skip update konten: Level ${pageLevel} tidak butuh update`, "YEAR");
        return false;
    }

    if (!aed || !aed.nextUpdate) {
        log(`⚠️ AED tidak tersedia, skip update konten`, "WARN");
        return false;
    }

    const currentDate = new Date();
    const nextUpdateDate = new Date(aed.nextUpdate);
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    if (currentDate < nextUpdateDate) {
        log(`⏭️ Skip update konten: Belum lewat nextUpdate (${aed.nextUpdate})`, "YEAR");
        return false;
    }

    const currentMonth = monthNames[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();
    const newDateText = `${currentMonth} ${currentYear}`;

    if (currentYear < 2026) {
        log(`🛑 STOP: Tahun ${currentYear} < 2026, tidak update`, "STOP");
        return false;
    }

    log(`📅 Update konten: ${newDateText} (nextUpdate lewat: ${aed.nextUpdate})`, "YEAR");

    let updated = 0;
    const selectors = [
        '.update-badge', '.update-badge-class', '[class*="update-badge"]',
        '.last-updated', '.updated-date', '.date-modified',
        '.post-date', '.article-date', '.publish-date',
        'time[datetime]', 'time',
        '.post-meta', '.entry-meta', '.article-meta',
        '.breadcrumb + p', '.toc + p', 'h1 + p'
    ];

    for (const selector of selectors) {
        let elements = [];
        try {
            elements = document.querySelectorAll(selector);
        } catch(e) { continue; }

        for (const el of elements) {
            const originalText = el.innerText || '';
            const hasDate = /\b(19|20)\d{2}\b/.test(originalText);
            const hasMonth = /(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)/i.test(originalText);

            if (hasDate || hasMonth) {
                const yearMatch = originalText.match(/\b(19|20)(\d{2})\b/);
                let contentYear = null;
                if (yearMatch) {
                    contentYear = parseInt(yearMatch[1] + yearMatch[2]);
                }

                if (contentYear && contentYear < 2026) {
                    log(`⏭️ Skip update: Tahun konten ${contentYear} < 2026`, "STOP");
                    continue;
                }

                let newText = originalText
                    .replace(/(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+(\d{4})/gi, newDateText)
                    .replace(/(\d{2})\/(\d{2})\/(\d{4})/g, (match, d, m, y) => {
                        const month = monthNames[parseInt(m) - 1] || m;
                        return `${d} ${month} ${y}`;
                    })
                    .replace(/(\d{4})-(\d{2})-(\d{2})/g, (match, y, m, d) => {
                        const month = monthNames[parseInt(m) - 1] || m;
                        return `${d} ${month} ${y}`;
                    });

                if (newText !== originalText) {
                    const textNodes = [];
                    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
                    let node;
                    while (node = walker.nextNode()) {
                        textNodes.push(node);
                    }
                    for (const textNode of textNodes) {
                        const oldText = textNode.textContent || '';
                        if (oldText.match(/\b(19|20)\d{2}\b/)) {
                            const yearMatchNode = oldText.match(/\b(19|20)(\d{2})\b/);
                            let contentYearNode = null;
                            if (yearMatchNode) {
                                contentYearNode = parseInt(yearMatchNode[1] + yearMatchNode[2]);
                            }
                            if (contentYearNode && contentYearNode < 2026) {
                                continue;
                            }

                            const newTextNode = oldText
                                .replace(/(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+(\d{4})/gi, newDateText)
                                .replace(/(\d{2})\/(\d{2})\/(\d{4})/g, (match, d, m, y) => {
                                    const month = monthNames[parseInt(m) - 1] || m;
                                    return `${d} ${month} ${y}`;
                                })
                                .replace(/(\d{4})-(\d{2})-(\d{2})/g, (match, y, m, d) => {
                                    const month = monthNames[parseInt(m) - 1] || m;
                                    return `${d} ${month} ${y}`;
                                });
                            if (newTextNode !== oldText) {
                                textNode.textContent = newTextNode;
                                updated++;
                                log(`✅ Update teks: "${oldText}" → "${newTextNode}"`, "YEAR");
                            }
                        }
                    }
                }
            }
        }
    }

    const h1 = document.querySelector('h1');
    if (h1) {
        const h1Text = h1.innerText;
        const yearPattern = /\b(19|20)\d{2}\b/;
        const yearMatch = h1Text.match(yearPattern);
        if (yearMatch) {
            const yearInH1 = parseInt(yearMatch[0]);
            if (yearInH1 < 2026) {
                log(`🛑 STOP: H1 tahun ${yearInH1} < 2026, tidak update`, "STOP");
            } else if (yearInH1 < currentYear) {
                const newH1 = h1Text.replace(yearPattern, currentYear);
                if (newH1 !== h1Text) {
                    h1.innerText = newH1;
                    updated++;
                    log(`✅ H1 tahun diupdate: "${h1Text}" → "${newH1}"`, "YEAR");
                }
            }
        }
    }

    if (updated === 0) {
        log(`⚠️ Tidak ditemukan teks tanggal untuk diupdate`, "WARN");
    } else {
        log(`✅ ${updated} elemen konten diupdate ke: ${newDateText}`, "YEAR");
    }

    return updated > 0;
  }

  // ============================================================
  // 🔥🔥🔥 AMBIL NAMA DARI URL BERSIH (DIPERTAHANKAN)
  // ============================================================
  function getCleanPageName(level) {
    let cleanName = '';
    let path = window.location.pathname;
    path = path.replace(/^\/p\//, '');
    path = path.replace(/\/\d{4}\/\d{2}\//g, '/');
    path = path.replace(/\.html$/, '');
    let segments = path.split('/').filter(s => s.length > 0);
    let lastSegment = segments.length > 0 ? segments[segments.length - 1] : '';
    cleanName = lastSegment.replace(/[-_]+/g, ' ');
    cleanName = cleanName.replace(/\b\w/g, function(l) { return l.toUpperCase(); });
    cleanName = cleanName.replace(/\s\d+$/, '');
    if (level === 'pillar' || level === 'sub-pillar-tipe-1' || level === 'sub-pillar-tipe-2') {
      cleanName = cleanName.replace(/^(Harga|Jasa|Biaya|Tarif)\s*/i, '').trim();
    }
    if (cleanName.length < 3) {
      let h1Text = document.querySelector('h1')?.innerText?.trim();
      if (h1Text && h1Text.length > 3) {
        cleanName = h1Text
          .replace(/\b(20[2-9][0-9])\b/g, '')
          .replace(/\s*[–—\-|]\s*/g, ' ')
          .replace(/^(Harga|Jasa|Biaya|Tarif|Estimasi)\s*/i, '')
          .trim();
      }
    }
    if (cleanName.length < 3) {
      let title = document.title
        .replace(/\b(20[2-9][0-9])\b/g, '')
        .replace(/\s*[–—\-|]\s*/g, ' ')
        .trim();
      if (title.length > 3) cleanName = title;
    }
    if (cleanName.length < 3) cleanName = 'Halaman Utama';
    if (cleanName.length > 55) cleanName = cleanName.substring(0, 52) + '...';
    log(`📝 Clean page name from URL: "${cleanName}"`, "IMAGE");
    return cleanName;
  }

  // ============================================================
  // 🔥🔥🔥 GENERATE GAMBAR DARI CANVAS (DIPERTAHANKAN)
  // ============================================================

  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
      if (r > w/2) r = w/2;
      if (r > h/2) r = h/2;
      this.moveTo(x + r, y);
      this.lineTo(x + w - r, y);
      this.quadraticCurveTo(x + w, y, x + w, y + r);
      this.lineTo(x + w, y + h - r);
      this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      this.lineTo(x + r, y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - r);
      this.lineTo(x, y + r);
      this.quadraticCurveTo(x, y, x + r, y);
      return this;
    };
  }

  function createImageWithText(pageName, level, year) {
    const isMoneyLevel = ['money-master', 'money-page', 'money-child'].includes(level);
    const focus = isMoneyLevel ? detectContentFocus() : null;
    const colors = getColorConfig(level, focus);
    
    const needYearFlag = needYear(level);
    const displayYear = needYearFlag ? ' ' + year : '';
    const fullText = pageName + displayYear;

    const width = 820;
    const height = 360;
    const padding = 40;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, colors.bg);
    gradient.addColorStop(0.5, colors.bg);
    gradient.addColorStop(1, lightenColor(colors.bg, 25));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 3;
    const bPad = 15;
    ctx.strokeRect(bPad, bPad, width - (bPad * 2), height - (bPad * 2));

    const logoText = '🏗️ Beton Jaya Readymix';
    ctx.font = 'bold 18px Arial, sans-serif';
    const logoMetrics = ctx.measureText(logoText);
    const logoWidth = logoMetrics.width + 40;
    const logoHeight = 36;
    const logoX = (width - logoWidth) / 2;
    const logoY = padding - 10;

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.roundRect(logoX, logoY, logoWidth, logoHeight, 18);
    ctx.fill();

    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(logoText, width / 2, padding + 8);

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding, 72);
    ctx.lineTo(width - padding, 72);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let fontSize = 42;
    const textLength = fullText.length;
    if (textLength > 30) fontSize = 36;
    if (textLength > 40) fontSize = 32;
    if (textLength > 50) fontSize = 28;
    if (textLength > 60) fontSize = 24;

    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;

    const maxCharsPerLine = 24;
    const words = fullText.split(' ');
    let lines = [];
    let currentLine = '';

    for (let word of words) {
      if (currentLine.length + word.length + 1 <= maxCharsPerLine) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);

    if (lines.length > 3) {
      const combined = fullText;
      lines = [];
      let idx = 0;
      while (idx < combined.length) {
        let end = Math.min(idx + maxCharsPerLine, combined.length);
        let lastSpace = combined.lastIndexOf(' ', end);
        if (lastSpace > idx && end < combined.length) end = lastSpace;
        lines.push(combined.substring(idx, end).trim());
        idx = end + 1;
        if (lines.length >= 3) {
          if (idx < combined.length) {
            lines[2] = lines[2] + '...';
          }
          break;
        }
      }
    }

    const centerY = height / 2 + 8;

    if (lines.length === 1) {
      ctx.font = `bold ${fontSize + 8}px Arial, sans-serif`;
      ctx.fillStyle = colors.text;
      ctx.fillText(lines[0], width / 2, centerY);
    } else if (lines.length === 2) {
      const lineHeight = fontSize + 14;
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.fillStyle = colors.text;
      ctx.fillText(lines[0], width / 2, centerY - (lineHeight / 2));
      ctx.fillText(lines[1], width / 2, centerY + (lineHeight / 2));
    } else {
      const lineHeight = fontSize + 12;
      const startY = centerY - ((lines.length - 1) * lineHeight / 2);
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.fillStyle = colors.text;
      lines.forEach((line, i) => {
        ctx.fillText(line, width / 2, startY + (i * lineHeight));
      });
    }

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const watermarkText = '© Beton Jaya Readymix';
    ctx.font = '13px Arial, sans-serif';
    const wmMetrics = ctx.measureText(watermarkText);
    const wmWidth = wmMetrics.width + 30;
    const wmHeight = 28;
    const wmX = (width - wmWidth) / 2;
    const wmY = height - padding + 2;

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.roundRect(wmX, wmY, wmWidth, wmHeight, 14);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '13px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(watermarkText, width / 2, height - padding + 16);

    return canvas.toDataURL('image/png');
  }

  // ============================================================
  // 🔥🔥🔥 STYLE RESPONSIF (DIPERTAHANKAN)
  // ============================================================
  function applyResponsiveStyles(figure, img) {
    figure.style.padding = '1em 0px';
    figure.style.margin = '20px 0';
    figure.style.textAlign = 'center';
    figure.style.background = '#f8fafc';
    figure.style.borderRadius = '12px';
    figure.style.width = '100%';
    figure.style.maxWidth = '100%';
    figure.style.display = 'block';
    figure.style.overflow = 'hidden';

    img.style.width = '100%';
    img.style.maxWidth = '820px';
    img.style.height = 'auto';
    img.style.aspectRatio = '820/360';
    img.style.objectFit = 'contain';
    img.style.borderRadius = '8px';
    img.style.display = 'block';
    img.style.margin = '0 auto';
    img.style.padding = '0 10px';
    img.style.boxSizing = 'border-box';

    const styleId = 'responsive-image-style-v474';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @media (max-width: 820px) {
          figure[data-auto-figure="true"] img {
            max-width: 100% !important;
            height: auto !important;
            aspect-ratio: auto !important;
          }
          figure[data-auto-figure="true"] {
            padding: 0.5em 0px !important;
            margin: 10px 0 !important;
          }
        }
        @media (max-width: 480px) {
          figure[data-auto-figure="true"] figcaption {
            font-size: 12px !important;
            padding: 0 10px !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
    figure.setAttribute('data-auto-figure', 'true');
  }

  // ============================================================
  // 🔥🔥🔥 CEK GAMBAR & PERBAIKI (DIPERTAHANKAN)
  // ============================================================
  function fixImagesToFormat1() {
    log('Checking images in content...', "IMAGE");
    
    const pageLevel = getPageLevelFromPLD();
    const currentYear = getCurrentYear();
    const needYearFlag = needYear(pageLevel);
    const pageName = getCleanPageName(pageLevel);
    const displayName = needYearFlag ? pageName + ' ' + currentYear : pageName;

    function getImageInsertionPoint() {
      let article = document.querySelector('article');
      if (!article) {
        const candidates = ['.post-body', 'main', '.content', '.entry-content', '.post-content', '.article-content', '.blog-post'];
        for (let selector of candidates) {
          const el = document.querySelector(selector);
          if (el) { article = el; break; }
        }
      }
      if (!article) {
        const h1 = document.querySelector('h1');
        if (h1) article = h1.closest('section, div, main');
      }
      if (!article) article = document.body;

      const badge = article.querySelector('.update-badge, .update-badge-class, [class*="update-badge"]');
      if (badge && badge.parentElement === article) {
        return { container: article, referenceNode: badge, position: 'after' };
      }

      const firstChild = article.firstElementChild;
      if (firstChild && firstChild.tagName === 'H1') {
        return { container: article, referenceNode: firstChild, position: 'after' };
      }

      return { container: article, referenceNode: null, position: 'first' };
    }

    let targetImage = null;
    let targetFigure = null;

    const h1Element = document.querySelector('h1');
    if (h1Element) {
      const article = h1Element.closest('article, .post-body, main, section, div');
      if (article) {
        const siblings = article.children;
        let foundH1 = false;
        for (let i = 0; i < siblings.length; i++) {
          if (siblings[i] === h1Element) { foundH1 = true; continue; }
          if (foundH1) {
            const img = siblings[i].querySelector('img');
            if (img) {
              targetImage = img;
              targetFigure = siblings[i].tagName === 'FIGURE' ? siblings[i] : siblings[i].closest('figure');
              break;
            }
            if (siblings[i].tagName === 'FIGURE' && siblings[i].querySelector('img')) {
              targetImage = siblings[i].querySelector('img');
              targetFigure = siblings[i];
              break;
            }
          }
        }
      }
    }

    if (!targetImage) {
      const contentAreas = document.querySelectorAll('article, section, .post-body, main, .content, .entry-content');
      for (const area of contentAreas) {
        const img = area.querySelector('img:not([src*="logo"]):not([src*="icon"]):not([src*="avatar"])');
        if (img) {
          targetImage = img;
          targetFigure = img.closest('figure');
          break;
        }
      }
    }

    const autoImageDataUrl = createImageWithText(pageName, pageLevel, currentYear);
    const captionText = '📊 ' + displayName;

    if (targetImage) {
      log('Image found in content, fixing for SEO...', "IMAGE");

      const img = targetImage;
      const figure = targetFigure || img.closest('figure');

      const currentSrc = img.src || '';
      if (currentSrc.includes('No_Image') || currentSrc.includes('placeholder') || !currentSrc) {
        img.src = autoImageDataUrl;
        log('Image src replaced with auto-generated', "IMAGE");
      } else {
        log('Existing image preserved, only updating attributes', "IMAGE");
      }

      img.alt = displayName;
      img.title = displayName;
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
      img.setAttribute('data-auto-generated', 'true');
      img.setAttribute('data-page-level', pageLevel);
      img.setAttribute('data-year', currentYear);

      if (figure && figure.tagName === 'FIGURE') {
        applyResponsiveStyles(figure, img);

        let figcaption = figure.querySelector('figcaption');
        if (!figcaption) {
          figcaption = document.createElement('figcaption');
          figcaption.style.color = '#555';
          figcaption.style.fontSize = '14px';
          figcaption.style.marginTop = '10px';
          figcaption.style.padding = '0 20px';
          figcaption.style.textAlign = 'center';
          figcaption.textContent = captionText;
          figure.appendChild(figcaption);
        } else {
          figcaption.textContent = captionText;
          figcaption.style.color = '#555';
          figcaption.style.fontSize = '14px';
          figcaption.style.marginTop = '10px';
          figcaption.style.padding = '0 20px';
          figcaption.style.textAlign = 'center';
        }
      } else {
        log('Wrapping image with FIGURE...', "IMAGE");
        const newFigure = document.createElement('figure');
        const parent = img.parentElement;
        parent.insertBefore(newFigure, img);
        newFigure.appendChild(img);

        const figcaption = document.createElement('figcaption');
        figcaption.style.color = '#555';
        figcaption.style.fontSize = '14px';
        figcaption.style.marginTop = '10px';
        figcaption.style.padding = '0 20px';
        figcaption.style.textAlign = 'center';
        figcaption.textContent = captionText;
        newFigure.appendChild(figcaption);
        applyResponsiveStyles(newFigure, img);
      }

      log('✅ Image fixed with SEO FIGURE', "SUCCESS");
      return figure;
    }

    log('No image found, creating new responsive FIGURE...', "IMAGE");

    const insertPoint = getImageInsertionPoint();
    const figure = document.createElement('figure');
    const img = document.createElement('img');

    img.src = autoImageDataUrl;
    img.alt = displayName;
    img.title = displayName;
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
    img.setAttribute('data-auto-generated', 'true');
    img.setAttribute('data-page-level', pageLevel);
    img.setAttribute('data-year', currentYear);

    const figcaption = document.createElement('figcaption');
    figcaption.style.color = '#555';
    figcaption.style.fontSize = '14px';
    figcaption.style.marginTop = '10px';
    figcaption.style.padding = '0 20px';
    figcaption.style.textAlign = 'center';
    figcaption.textContent = captionText;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    applyResponsiveStyles(figure, img);

    if (insertPoint.referenceNode && insertPoint.position === 'after') {
      insertPoint.container.insertBefore(figure, insertPoint.referenceNode.nextSibling);
    } else {
      insertPoint.container.insertBefore(figure, insertPoint.container.firstChild);
    }

    log('✅ New responsive FIGURE created', "SUCCESS");
    return figure;
  }

  // ============================================================
  // 🔥🔥🔥 PRODUK SCHEMA FUNCTIONS (DIPERTAHANKAN)
  // ============================================================
  function sanitizeText(text) {
    if (!text) return "";
    return text.replace(/[\t\n\r]+/g, ' ').replace(/\s{2,}/g, ' ').trim().substring(0, 100);
  }

  function extractPrice(text) {
    if (!text) return null;
    const match = text.match(/Rp\s*([\d.,]+)/);
    if (!match) return null;
    const price = parseInt(match[1].replace(/[^\d]/g, ''));
    if (isNaN(price)) return null;
    return price;
  }

  function getAreaServed() {
    const areaProv = {
      "DKI Jakarta": "DKI Jakarta",
      "Kabupaten Bogor": "Jawa Barat",
      "Kota Bogor": "Jawa Barat",
      "Kota Depok": "Jawa Barat",
      "Kabupaten Tangerang": "Banten",
      "Kota Tangerang": "Banten",
      "Kota Tangerang Selatan": "Banten",
      "Kota Serang": "Banten",
      "Kabupaten Bekasi": "Jawa Barat",
      "Kota Bekasi": "Jawa Barat",
      "Kabupaten Karawang": "Jawa Barat"
    };
    return Object.keys(areaProv).map(a => ({ "@type": "Place", name: a }));
  }

  /**
   * 🔥 DIPERBAIKI v4.74: detectProductName dari H1/meta (bukan URL mapping)
   */
  function detectProductName() {
    // 1. H1 (paling akurat)
    const h1 = document.querySelector('h1')?.innerText?.trim();
    if (h1 && h1.length < 120 && h1.length > 3) {
      return h1.replace(/\b(20[2-9][0-9])\b/g, '').replace(/\s{2,}/g, ' ').trim();
    }
    
    // 2. Meta title
    const metaTitle = document.querySelector('meta[property="og:title"]')?.content;
    if (metaTitle) return metaTitle.substring(0, 120);
    
    // 3. Body attribute (dari V37.9-A)
    const bodyProductName = document.body.getAttribute('data-product-name');
    if (bodyProductName) return bodyProductName;
    
    // 4. Fallback dari document.title
    const docTitle = document.title.replace(/\b(20[2-9][0-9])\b/g, '').trim();
    if (docTitle.length > 3) return docTitle.substring(0, 120);
    
    return 'Produk Konstruksi';
  }

  /**
   * 🔥 DIPERBAIKI v4.74: detectProductCategory dari sub-type (bukan scan keyword)
   */
  function detectProductCategory() {
    // 1. Body attribute (dari V37.9-A PHASE 4.6)
    const bodyCategory = document.body.getAttribute('data-product-category');
    if (bodyCategory) return bodyCategory;
    
    // 2. Dari entity sub-type (dari V37.9-A)
    const subType = document.body.getAttribute('data-entity-sub-type') || getEntitySubType();
    if (subType) {
      const mapping = {
        'pagar-panel-beton': 'PrecastProduct',
        'besi-beton': 'SteelProduct',
        'baja-ringan': 'SteelProduct',
        'paving': 'PavingProduct',
        'paving-block': 'PavingProduct',
        'kanopi': 'PrecastProduct',
        'batako': 'BuildingMaterial',
        'genteng': 'BuildingMaterial',
        'semen': 'BuildingMaterial',
        'pasir': 'BuildingMaterial',
        'kayu': 'BuildingMaterial',
        'wpc': 'BuildingMaterial',
        'grc': 'BuildingMaterial',
        'hpl': 'BuildingMaterial',
        'pvc': 'BuildingMaterial',
        'acp': 'BuildingMaterial'
      };
      if (mapping[subType]) {
        log(`📂 Product Category dari sub-type "${subType}": ${mapping[subType]}`, "PRODUCT");
        return mapping[subType];
      }
    }
    
    // 3. Fallback: dari entity type
    const entityType = document.body.getAttribute('data-entity-type') || getEntityTypeFromPLD();
    if (entityType === 'material') return 'BuildingMaterial';
    if (entityType === 'produk') return 'PrecastProduct';
    
    return 'BuildingMaterial';
  }

  function extractVariantSpec() {
    const content = document.querySelector(".post-body.entry-content, .post-body, article, main");
    if (!content) return null;
    const text = content.innerText;
    const spec = {};
    const sizeMatch = text.match(/(\d{1,3}\s*x\s*\d{1,3})\s*(cm|meter|m)/i);
    if (sizeMatch) spec.size = sizeMatch[1] + " " + sizeMatch[2];
    const heightMatch = text.match(/tinggi\s*([\d.]+)\s*(meter|m|cm)/i);
    if (heightMatch) spec.height = heightMatch[1] + " " + heightMatch[2];
    const thickMatch = text.match(/tebal\s*([\d.]+)\s*(cm|mm)/i);
    if (thickMatch) spec.thickness = thickMatch[1] + " " + thickMatch[2];
    if (Object.keys(spec).length === 0) return null;
    return { "@type": "ProductVariant", ...spec };
  }

  // ============================================================
  // 🔥🔥🔥 OFFER PARSING (DIPERTAHANKAN)
  // ============================================================
  const seenItems = new Set();
  const offers = [];

  function getAEDPriceValidUntil() {
    const aed = window.AEDMetaDates;
    if (aed && aed.nextUpdate) {
      return aed.nextUpdate;
    }
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  }

  function addOffer(name, price) {
    if (!price || price <= 0) return;
    if (price < CONFIG.MIN_PRICE || price > CONFIG.MAX_PRICE) return;
    if (offers.length >= CONFIG.MAX_OFFERS) return;
    let cleanName = sanitizeText(name);
    if (!cleanName || cleanName.length < 3) return;
    const skipKeywords = ["estimasi", "per meter", "hubungi", "call", "whatsapp", "konsultasi", "mulai dari"];
    if (skipKeywords.some(kw => cleanName.toLowerCase().includes(kw))) return;
    const key = cleanName + "|" + price;
    if (seenItems.has(key)) return;
    seenItems.add(key);
    
    const priceValidUntil = getAEDPriceValidUntil();
    
    offers.push({
      "@type": "Offer",
      name: cleanName,
      url: location.href,
      priceCurrency: "IDR",
      price: price,
      priceValidUntil: priceValidUntil,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": "https://www.betonjayareadymix.com/#localbusiness" }
    });
  }

  function parseTableOffers() {
    const tableSelectors = ['section table', '.product-table', '.price-table', '.harga-table', 'table'];
    let found = false;
    for (const selector of tableSelectors) {
      const tables = document.querySelectorAll(selector);
      if (tables.length === 0) continue;
      for (const table of tables) {
        const rows = table.querySelectorAll('tr');
        for (const row of rows) {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 2) {
            const productCell = cells[0].innerText.trim();
            const priceCell = cells[1].innerText;
            if (productCell.toLowerCase().includes('produk') || productCell.toLowerCase().includes('jenis') || priceCell.toLowerCase().includes('harga')) continue;
            const price = extractPrice(priceCell);
            if (price && productCell && productCell.length > 0 && productCell.length < 150) {
              const isEstimasi = productCell.toLowerCase().includes('estimasi') || priceCell.toLowerCase().includes('estimasi');
              if (!isEstimasi) { addOffer(productCell, price); found = true; }
            }
          }
        }
      }
      if (found) break;
    }
    return found;
  }

  function parseVariantOffers() {
    const content = document.querySelector(".post-body.entry-content, .post-body, article, main");
    if (!content) return false;
    const text = content.innerText;
    
    const variantPatterns = [
      /(tinggi|ukuran|dimensi)\s*([\d.]+)\s*(meter|m|cm)\s*(?:Rp\s*([\d.,]+))/gi,
      /(panel|pagar)\s*(polosan|motif|custom)\s*(?:Rp\s*([\d.,]+))/gi,
      /(tipe|varian)\s*([a-zA-Z0-9\s]+?)\s*(?:Rp\s*([\d.,]+))/gi,
      /(harga|biaya)\s*([a-zA-Z0-9\s]+?)\s*(?:Rp\s*([\d.,]+))/gi,
      /Rp\s*([\d.,]+)\s*(?:per\s*(meter|lembar|buah|unit))/gi
    ];
    
    let found = false;
    for (const pattern of variantPatterns) {
      try {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
          const name = match[0].split("Rp")[0]?.trim() || match[0].substring(0, 50);
          const price = extractPrice(match[0]);
          if (price && price > CONFIG.MIN_PRICE && price < CONFIG.MAX_PRICE) {
            addOffer(name, price);
            found = true;
          }
        }
      } catch(e) {
        const matches = text.match(pattern);
        if (matches) {
          for (const match of matches) {
            const name = match.split("Rp")[0]?.trim() || match.substring(0, 50);
            const price = extractPrice(match);
            if (price && price > CONFIG.MIN_PRICE && price < CONFIG.MAX_PRICE) {
              addOffer(name, price);
              found = true;
            }
          }
        }
      }
    }
    return found;
  }

  function parseListOffers() {
    const elements = document.querySelectorAll("li, p, .price-item, .product-item");
    const tempOffers = [];
    for (const el of elements) {
      const text = el.innerText;
      const price = extractPrice(text);
      if (price && price > CONFIG.MIN_PRICE && price < CONFIG.MAX_PRICE) {
        let productText = text.replace(/Rp\s*[\d.,]+/g, '').trim();
        if (productText.length > 0 && productText.length < 150) tempOffers.push({ name: productText, price: price });
      }
    }
    const seen = new Set();
    for (const offer of tempOffers) {
      const key = offer.name + "|" + offer.price;
      if (!seen.has(key) && offers.length < 5) { seen.add(key); addOffer(offer.name, offer.price); }
    }
  }

  function getParentFromBreadcrumbs(currentUrl) {
    const breadcrumbSelectors = [
      '.breadcrumbs a', '.breadcrumb a', '.nav-trail a',
      '.breadcrumb-item a', '.crumbs a', '.breadcrumb-link',
      '[aria-label="breadcrumb"] a', '.post-breadcrumb a',
      '.breadcrumb-nav a', '.nav-breadcrumb a'
    ];

    let breadcrumbLinks = [];
    for (let selector of breadcrumbSelectors) {
      const links = document.querySelectorAll(selector);
      if (links.length > 0) { breadcrumbLinks = Array.from(links); break; }
    }

    if (breadcrumbLinks.length === 0) {
      const nav = document.querySelector('nav');
      if (nav) {
        const links = nav.querySelectorAll('a');
        if (links.length > 1) breadcrumbLinks = Array.from(links);
      }
    }

    if (breadcrumbLinks.length > 0) {
      const validLinks = breadcrumbLinks.filter(a => {
        const href = a.href || '';
        const text = a.innerText?.trim() || '';
        if (!href || !text) return false;
        if (href === currentUrl || href.includes(currentUrl)) return false;
        if (text.toLowerCase() === 'home' || text.toLowerCase() === 'beranda') {
          if (breadcrumbLinks.length === 1) return true;
          return false;
        }
        return true;
      });

      if (validLinks.length > 0) {
        const parentLink = validLinks[validLinks.length - 1];
        return { parentUrl: parentLink.href, parentName: parentLink.innerText?.trim() || 'Parent Page' };
      }
    }

    return { parentUrl: location.origin, parentName: 'Home' };
  }

  function waitForPLD() {
    return new Promise((resolve) => {
      if (window.pageLevelDetectorv22 || window.pageLevelDetectorv20 || 
          window.pageLevelDetectorv19 || window.pageLevelDetectorV18 || 
          window.pageLevelDetectorV17 || window.pageLevelDetector) {
        resolve(true);
        return;
      }
      
      const onReady = () => resolve(true);
      window.addEventListener("pageLevelDetectorv22Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorv20Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorv19Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorReady", onReady, { once: true });
      
      setTimeout(() => {
        if (window.pageLevelDetectorv22 || window.pageLevelDetectorv20 || 
            window.pageLevelDetectorv19 || window.pageLevelDetectorV18 || 
            window.pageLevelDetectorV17 || window.pageLevelDetector) {
          resolve(true);
        } else {
          resolve(false);
        }
      }, CONFIG.PLD_TIMEOUT);
    });
  }

  // ============================================================
  // 🚀 MAIN FUNCTION — DENGAN WAIT BREADCRUMB + AED
  // ============================================================
  async function init() {
    log("═══════════════════════════════════════════════════", "INFO");
    log("AutoSchema Hybrid v4.74 — SCHEMA PRODUK/MATERIAL + PLD-ONLY", "INFO");
    log("═══════════════════════════════════════════════════", "INFO");
    
    // STEP 1: TUNGGU BREADCRUMB
    log("🍞 Menunggu breadcrumb...", "BREADCRUMB");
    const breadcrumbReady = await waitForBreadcrumb(CONFIG.BREADCRUMB_TIMEOUT);
    log(`🍞 Breadcrumb: ${breadcrumbReady ? '✅ READY' : '⏰ TIMEOUT'}`, "BREADCRUMB");
    
    // STEP 2: TUNGGU PLD
    log("⏳ Menunggu PLD...", "PLD");
    await waitForPLD();
    
    // STEP 3: TUNGGU AEDMetaDates
    log("⏳ Menunggu AEDMetaDates...", "AED");
    const aed = await waitForAEDMetaDates(CONFIG.AED_TIMEOUT);
    
    if (aed) {
      log(`✅ AED ready: ${aed.dateModified}`, "AED");
      log(`   📅 nextUpdate: ${aed.nextUpdate}`, "AED");
      log(`   📅 validityDays: ${aed.validityDays}`, "AED");
    } else {
      log(`⚠️ AED tidak tersedia, gunakan fallback`, "WARN");
    }
    
    // STEP 4: TERIMA SEMUA DATA DARI PLD/V37.9-A
    log("🔷 TERIMA DATA DARI PLD/V37.9-A:", "PLD");
    
    const pageLevel = getPageLevelFromPLD();
    const entityType = getEntityTypeFromPLD();
    const contentFocus = detectContentFocus();
    const kategori = getKategori();
    const entitySubType = getEntitySubType();
    const wordCountTarget = getWordCountTarget();
    const schemaType = getSchemaType();
    const ctaType = getCtaType();
    const h1Pattern = getH1Pattern();
    
    log(`📌 Page Level: ${pageLevel}`, "SUCCESS");
    log(`📌 Entity Type: ${entityType}`, "SUCCESS");
    log(`📌 Content Focus: ${contentFocus}`, "FOCUS");
    log(`📌 Kategori: ${kategori}`, "KATEGORI");
    log(`📌 Entity Sub-Type: ${entitySubType || 'N/A'}`, "PLD");
    log(`📌 Word Count Target: ${wordCountTarget ? wordCountTarget.min + '-' + wordCountTarget.max : 'N/A'}`, "PLD");
    log(`📌 Schema Type: ${schemaType ? schemaType.primary + ' + ' + schemaType.secondary : 'N/A'}`, "SCHEMA");
    log(`📌 CTA Type: ${ctaType ? ctaType.type : 'N/A'}`, "PLD");
    log(`📌 H1 Pattern: ${h1Pattern}`, "PLD");

    // STEP 5: UPDATE TAHUN DI H1
    log("📅 UPDATE TAHUN DI H1:", "YEAR");
    const h1Updated = updateH1Year(pageLevel);
    
    // STEP 6: UPDATE TAHUN DI KONTEN LAINNYA
    const contentUpdated = updateContentYears();
    
    // STEP 7: UPDATE BULAN & TAHUN DI KONTEN (AED BASED)
    const dateUpdated = updateContentDateReferences(aed, pageLevel);
    
    if (!h1Updated && contentUpdated === 0 && !dateUpdated) {
      log(`📅 Tidak ada perubahan tahun yang dilakukan`, "YEAR");
    }

    // STEP 8: CEK GAMBAR & FIX GAMBAR
    let imageUrl = LOGO_IMAGE;
    const isEligible = isImageEligible(pageLevel);
    
    if (isEligible) {
      log(`✅ Halaman LAYAK mendapat gambar, memproses...`, "IMAGE");
      try {
        const fixedFigure = fixImagesToFormat1();
        if (fixedFigure) {
          const img = fixedFigure.querySelector('img');
          if (img) imageUrl = img.src || LOGO_IMAGE;
        }
      } catch(e) {
        log(`Error processing images: ${e.message}`, "ERROR");
        imageUrl = LOGO_IMAGE;
      }
    } else {
      log(`⏭️ Halaman TIDAK LAYAK mendapat gambar`, "SKIP");
      const existingImage = document.querySelector('img:not([src*="logo"]):not([src*="icon"]):not([src*="avatar"])');
      if (existingImage) {
        imageUrl = existingImage.src || LOGO_IMAGE;
      }
    }

    // STEP 9: CEK SKIP PRODUCT SCHEMA
    if (shouldSkipProductSchema(pageLevel)) {
      log("Product schema SKIPPED untuk halaman ini", "SKIP");
      return;
    }
    
    // STEP 10: PRODUCT SCHEMA
    const currentUrl = location.href.replace(/[?&]m=1/, "");
    const parentData = getParentFromBreadcrumbs(currentUrl);
    const parentUrls = [{
      "@type": "WebPage",
      "@id": parentData.parentUrl,
      name: parentData.parentName
    }];
    
    const productName = detectProductName();
    const desc = document.querySelector('meta[name="description"]')?.content?.trim() || 
                 document.querySelector("article p, main p, section p")?.innerText?.trim()?.substring(0, 300) ||
                 `Produk ${productName} berkualitas dari Beton Jaya Readymix`;
    
    const areaServed = getAreaServed();
    const productCategory = detectProductCategory();
    
    log("Parsing offers...", "INFO");
    let hasTableOffers = parseTableOffers();
    if (!hasTableOffers || offers.length === 0) {
      const hasVariantOffers = parseVariantOffers();
      if (!hasVariantOffers || offers.length === 0) parseListOffers();
    }
    
    if (offers.length === 0) {
      log("Tidak ada harga ditemukan", "WARN");
    }
    
    const business = {
      "@type": "LocalBusiness",
      "@id": "https://www.betonjayareadymix.com/#localbusiness",
      name: "Beton Jaya Readymix",
      url: "https://www.betonjayareadymix.com",
      logo: LOGO_IMAGE
    };
    
    const product = {
      "@type": "Product",
      "@id": currentUrl + "#product",
      name: productName,
      image: [imageUrl || LOGO_IMAGE],
      description: desc,
      brand: { "@type": "Brand", name: "Beton Jaya Readymix" },
      category: productCategory,
      areaServed: areaServed,
      isPartOf: parentUrls
    };
    
    if (offers.length > 0) {
      product.offers = offers;
    }
    
    if (pageLevel === 'variant' || pageLevel === 'sub-variant') {
      product.productType = pageLevel === 'variant' ? "Variant" : "Sub-Variant";
      product.material = "Beton Precast";
      product.manufacturer = { "@type": "Organization", name: "Beton Jaya Readymix" };
      const variantSpec = extractVariantSpec();
      if (variantSpec) product.variant = variantSpec;
    }
    
    const webpage = {
      "@type": "WebPage",
      "@id": currentUrl + "#webpage",
      url: currentUrl,
      name: productName,
      description: desc,
      mainEntity: { "@id": product["@id"] },
      isPartOf: parentUrls
    };
    
    // ═══════════════════════════════════════════════════════════
    // ✅ FORMAT SCHEMA TETAP SAMA — TIDAK DIUBAH
    // ═══════════════════════════════════════════════════════════
    const graph = [webpage, business, product];
    
    let existingScript = document.querySelector("#auto-schema-product");
    if (!existingScript) {
      existingScript = document.createElement("script");
      existingScript.type = "application/ld+json";
      existingScript.id = "auto-schema-product";
      document.head.appendChild(existingScript);
    }
    
    existingScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": graph
    }, null, 2);
    
    // ============================================================
    // EXECUTION SUMMARY
    // ============================================================
    log("═══════════════════════════════════════════════════", "INFO");
    log("EXECUTION SUMMARY:", "INFO");
    log(`  Page Level       : ${pageLevel}`, "SUCCESS");
    log(`  Entity Type      : ${entityType}`, "SUCCESS");
    log(`  Entity Sub-Type  : ${entitySubType || 'N/A'}`, "PLD");
    log(`  Content Focus    : ${contentFocus}`, "FOCUS");
    log(`  Kategori         : ${kategori}`, "KATEGORI");
    log(`  H1 Pattern       : ${h1Pattern}`, "PLD");
    log(`  Schema Type      : ${schemaType ? schemaType.primary : 'N/A'}`, "SCHEMA");
    log(`  CTA Type         : ${ctaType ? ctaType.type : 'N/A'}`, "PLD");
    log(`  Word Count Target: ${wordCountTarget ? wordCountTarget.min + '-' + wordCountTarget.max : 'N/A'}`, "PLD");
    log(`  Product Name     : ${productName}`, "SUCCESS");
    log(`  Product Category : ${productCategory}`, "SUCCESS");
    log(`  Offers Count     : ${offers.length}`, "SUCCESS");
    log(`  Image Eligible   : ${isEligible ? '✅' : '❌'}`, "IMAGE");
    log(`  Auto Year H1     : ${h1Updated ? '✅ UPDATE' : '⏭️ SKIP/STOP'}`, "YEAR");
    log(`  Content Year     : ${contentUpdated > 0 ? `✅ ${contentUpdated} elemen diupdate` : '⏭️ TIDAK ADA'}`, "YEAR");
    log(`  Auto Update Bulan: ${dateUpdated ? '✅ UPDATE' : '⏭️ SKIP'}`, "YEAR");
    log(`  Breadcrumb       : ${breadcrumbReady ? '✅ READY' : '⏰ TIMEOUT'}`, "BREADCRUMB");
    log(`  AED              : ${aed ? '✅ READY' : '❌ FALLBACK'}`, "AED");
    log(`  PLD-ONLY MODE    : ✅ ACTIVE`, "PLD");
    log(`  SCHEMA FORMAT    : ✅ TETAP SAMA (VALID)`, "SCHEMA");
    log(`  OFFER STRUCTURE  : ✅ TETAP SAMA (VALID)`, "PRODUCT");
    log("═══════════════════════════════════════════════════", "INFO");
    log("AutoSchema Hybrid v4.74 SELESAI", "SUCCESS");
  }
  
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(init, CONFIG.DELAY_MS);
    });
  } else {
    setTimeout(init, CONFIG.DELAY_MS);
  }
  
})();
