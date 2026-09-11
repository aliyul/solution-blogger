/**
 * ⚡ AutoSchema Hybrid v4.78 — PLD-ONLY MODE + isPartOf HANYA WEBPAGE
 * 
 * UPDATE v4.78 (dari v4.77):
 * ❌ HAPUS: Canvas Fallback (tidak SEO-friendly)
 * ❌ HAPUS: createImageWithTextCanvas() + roundRect polyfill
 * ✅ PERTAHANKAN: Cloudinary Image per LEVEL (URL sesuai PLD)
 * ✅ PERTAHANKAN: Auto-Scale Font Size (tabel dari v7.28.4)
 * ✅ PERTAHANKAN: Auto-Wrap + Split Long Words (dari v7.28.4)
 * ✅ PERTAHANKAN: DOM Cache (dari v7.28.4)
 * ✅ PERTAHANKAN: Error Boundary (dari v7.28.4)
 * ✅ PERTAHANKAN: Performance Monitoring (dari v7.28.4)
 * ✅ PERTAHANKAN: CORB Prevention (block external fetch/XHR)
 * ✅ PERTAHANKAN: isPartOf HANYA di WebPage
 * ✅ PERTAHANKAN: waitForBreadcrumbReady() + getParentFromBreadcrumbReady()
 * ✅ PERTAHANKAN: Semua kode valid dari v4.76
 * 
 * @version 4.78
 * @date 2026-09-11
 */

(function() {
  "use strict";

  // ============================================================
  // 🔥🔥🔥 BLOKIR SEMUA EXTERNAL REQUEST (CORB PREVENTION) 🔥🔥🔥
  // ============================================================
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && (
      url.includes('raw.githack.com') || 
      url.includes('github.com') || 
      url.includes('gist.github.com')
    )) {
      console.warn('[Schema v4.78] 🚫 Blocked external fetch (CORB prevention):', url);
      return Promise.reject(new Error('Blocked by CORB prevention'));
    }
    return originalFetch.apply(this, args);
  };

  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    if (typeof url === 'string' && (
      url.includes('raw.githack.com') || 
      url.includes('github.com') || 
      url.includes('gist.github.com')
    )) {
      console.warn('[Schema v4.78] 🚫 Blocked external XHR (CORB prevention):', url);
      throw new Error('Blocked by CORB prevention');
    }
    return originalXHROpen.call(this, method, url, ...rest);
  };

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
    BREADCRUMB_READY_TIMEOUT: 5000,
    MIN_YEAR_TO_UPDATE: 2026,
    CACHE_DOM_ELEMENTS: true,
    BATCH_DOM_UPDATES: true
  };

  // ============================================================
  // 🆕 v4.78: CLOUDINARY CONFIG — URL PER LEVEL (dari PLD)
  // ============================================================
  const CLOUDINARY_CONFIG = {
    ENABLED: true,
    CLOUD_NAME: 'vagzz5sa',
    VERSION: 'v1789109159',
    FORMAT: 'png',

    // 🎨 Ukuran SEO-optimal
    WIDTH: 1200,
    HEIGHT: 630,

    // 🎨 Text overlay config
    FONT: 'Arial',
    FONT_SIZE: 55,
    BOLD: true,
    GRAVITY: 'g_center',

    // 🎯 Batas text
    MAX_TEXT_LENGTH: 70,
    MAX_CHARS_PER_LINE: 18,
    MAX_LINES: 2,

    // 🎨 File per level (sesuai upload Cloudinary)
    LEVEL_FILES: {
      'pillar': 'pillar',
      'sub-pillar-tipe-2': 'sp2',
      'sub-pillar-tipe-1': 'sp1',
      'money-master': 'mm',
      'money-page': 'mp',
      'money-child': 'mc',
      'variant': 'variant',
      'sub-variant': 'subvariant'
    },

    // 🎨 Warna text per level (sesuai SEO & kontras)
    LEVEL_COLORS: {
      'pillar': 'FFD700',
      'sub-pillar-tipe-2': 'FFD700',
      'sub-pillar-tipe-1': 'FFD700',
      'money-master': 'FFFFFF',
      'money-page': 'FFFFFF',
      'money-child': 'FFFFFF',
      'variant': 'FFD700',
      'sub-variant': 'FFD700'
    },

    get baseUrl() {
      return `https://res.cloudinary.com/${this.CLOUD_NAME}/image/upload/`;
    },

    // 🔥 Auto-scale font size (tabel dari v7.28.4)
    calculateFontSize(textLength) {
      if (textLength <= 10) return 55;
      if (textLength <= 12) return 50;
      if (textLength <= 15) return 45;
      if (textLength <= 18) return 40;
      if (textLength <= 22) return 35;
      if (textLength <= 26) return 30;
      if (textLength <= 30) return 28;
      if (textLength <= 35) return 26;
      if (textLength <= 40) return 24;
      if (textLength <= 50) return 22;
      return 20;
    },

    // 🔥 Auto-wrap text + split long words (dari v7.28.4)
    wrapText(text, maxCharsPerLine = this.MAX_CHARS_PER_LINE) {
      if (text.length <= maxCharsPerLine) return text;

      const words = text.split(' ');
      const lines = [];
      let currentLine = '';

      for (const word of words) {
        if (word.length > maxCharsPerLine) {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = '';
          }
          let remaining = word;
          while (remaining.length > maxCharsPerLine) {
            lines.push(remaining.substring(0, maxCharsPerLine));
            remaining = remaining.substring(maxCharsPerLine);
          }
          if (remaining) currentLine = remaining;
        } else if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
          currentLine = (currentLine + ' ' + word).trim();
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);

      if (lines.length > this.MAX_LINES) {
        const merged = lines.slice(0, this.MAX_LINES - 1);
        merged.push(lines.slice(this.MAX_LINES - 1).join(' '));
        return merged.join('\n');
      }

      return lines.join('\n');
    },

    // 🔥 Build URL dengan auto-scale + auto-wrap + c_fit
    buildUrl(level, text) {
      const fileName = this.LEVEL_FILES[level] || 'pillar';
      const textColor = this.LEVEL_COLORS[level] || 'FFD700';
      const weight = this.BOLD ? '_bold' : '';

      let displayText = text;
      if (displayText.length > this.MAX_TEXT_LENGTH) {
        displayText = displayText.substring(0, this.MAX_TEXT_LENGTH - 3) + '...';
      }

      displayText = this.wrapText(displayText);

      const longestLine = displayText.split('\n').reduce((a, b) => a.length > b.length ? a : b, '');
      const fontSize = this.calculateFontSize(longestLine.length);

      const encodedText = encodeURIComponent(displayText);

      return `${this.baseUrl}` +
             `e_colorize:100,co_rgb:${textColor},` +
             `l_text:${this.FONT}_${fontSize}${weight}:${encodedText},` +
             `${this.GRAVITY},` +
             `c_fit,w_${this.WIDTH},h_${this.HEIGHT}/` +
             `${this.VERSION}/${fileName}.${this.FORMAT}`;
    }
  };

  // ✅ FALLBACK IMAGE (logo)
  const LOGO_IMAGE = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";
  const FALLBACK_IMAGE = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiWWAP6ezcmzgbGtHmmJqBjYkbsdQBrwCeC9pl9ocjL-VSQYftirdvXAF1T-eg_QMSqu1WiFidDc9fnChi0yaOqi0Dd6EVMy4ZX3P7vccY4XJMu-7k2TGVd5TS1wIG5jgIm_6beYVb2zuNQGS7eBuODJqd20c4ckvd0-HaEqGf4W-B_750I91wi9IhqqnI/s320/No_Image_Available.jpg";

  // ============================================================
  // 🔥🔥🔥 PERFORMANCE MONITORING (dari v7.28.4) 🔥🔥🔥
  // ============================================================
  const perf = {
    marks: {},
    start(label) {
      this.marks[label] = performance.now();
      if (CONFIG.DEBUG) console.log(`⏱️ [PERF] Start: ${label}`);
    },
    end(label) {
      if (!this.marks[label]) return 0;
      const duration = performance.now() - this.marks[label];
      if (CONFIG.DEBUG) console.log(`⏱️ [PERF] ${label}: ${duration.toFixed(2)}ms`);
      delete this.marks[label];
      return duration;
    }
  };

  // ============================================================
  // 🔥🔥🔥 DOM CACHE (dari v7.28.4) 🔥🔥🔥
  // ============================================================
  class DOMCache {
    constructor() {
      this.cache = new Map();
      this.observers = new Map();
    }
    get(selector, context = document) {
      const key = `${context === document ? 'document' : context.id || 'context'}:${selector}`;
      if (!this.cache.has(key)) {
        const element = context.querySelector(selector);
        this.cache.set(key, element);
        if (!this.observers.has(key)) {
          const observer = new MutationObserver(() => this.invalidate(selector, context));
          observer.observe(context, { childList: true, subtree: true, characterData: true });
          this.observers.set(key, observer);
        }
      }
      return this.cache.get(key);
    }
    getAll(selector, context = document) {
      const key = `${context === document ? 'document' : context.id || 'context'}:${selector}:all`;
      if (!this.cache.has(key)) {
        this.cache.set(key, Array.from(context.querySelectorAll(selector)));
      }
      return this.cache.get(key) || [];
    }
    invalidate(selector, context = document) {
      const key = `${context === document ? 'document' : context.id || 'context'}:${selector}`;
      this.cache.delete(key);
      this.cache.delete(`${key}:all`);
    }
    clear() {
      this.cache.clear();
      this.observers.forEach(o => o.disconnect());
      this.observers.clear();
    }
  }

  // ============================================================
  // 🔥🔥🔥 ERROR BOUNDARY (dari v7.28.4) 🔥🔥🔥
  // ============================================================
  class ErrorBoundary {
    constructor() {
      this.errors = [];
      this.fallbacks = new Map();
    }
    register(fnName, fallback) {
      this.fallbacks.set(fnName, fallback);
    }
    async execute(fnName, fn, ...args) {
      try {
        return await fn(...args);
      } catch (error) {
        const fallback = this.fallbacks.get(fnName);
        console.error(`❌ Error in ${fnName}:`, error);
        log(`Error in ${fnName}: ${error.message}`, "ERROR");
        if (fallback) return typeof fallback === 'function' ? fallback(...args) : fallback;
        return null;
      }
    }
    safeWrap(fn, fnName) {
      return (...args) => this.execute(fnName, fn, ...args);
    }
  }

  // ============================================================
  // 🔥🔥🔥 INSTANCES 🔥🔥🔥
  // ============================================================
  const domCache = CONFIG.CACHE_DOM_ELEMENTS ? new DOMCache() : null;
  const errorBoundary = new ErrorBoundary();

  function log(msg, type = "INFO") {
    if (!CONFIG.DEBUG && type === "INFO") return;
    const icons = { 
      INFO: "📘", WARN: "⚠️", ERROR: "❌", SUCCESS: "✅", SKIP: "⏭️", 
      PRODUCT: "🏗️", IMAGE: "📸", YEAR: "📅", FOCUS: "🎯", TABLE: "📊", 
      H1: "📝", PRIORITY: "🔴", STOP: "🛑", BREADCRUMB: "🍞", AED: "⚡", 
      COMMERCIAL: "🛒", GABUNG: "📚", PLD: "🔷", KATEGORI: "🏷️", SCHEMA: "🔗",
      PARENT: "👪", PERF: "⏱️", CACHE: "💾", CORB: "🚫"
    };
    const prefix = icons[type] || "📘";
    console.log(`${prefix} [AutoSchema v4.78] ${msg}`);
  }

  // ============================================================
  // 🆕 WAIT FOR BREADCRUMB READY (TUNGGU SIAP)
  // ============================================================
  function waitForBreadcrumbReady(timeout = CONFIG.BREADCRUMB_READY_TIMEOUT) {
    return new Promise((resolve) => {
      perf.start('waitForBreadcrumbReady');
      const startTime = Date.now();
      
      function checkBreadcrumbReady() {
        const breadcrumbSelectors = [
          '.breadcrumbs', '.breadcrumb', '.nav-trail',
          '[aria-label="breadcrumb"]', '[itemtype*="BreadcrumbList"]',
          '.post-breadcrumb', '.breadcrumb-nav', '.nav-breadcrumb'
        ];
        
        let breadcrumbEl = null;
        for (const selector of breadcrumbSelectors) {
          const el = domCache ? domCache.get(selector) : document.querySelector(selector);
          if (el) { breadcrumbEl = el; break; }
        }
        
        if (!breadcrumbEl) {
          if (Date.now() - startTime > timeout) {
            log(`⏰ Breadcrumb timeout — tidak ditemukan (${timeout}ms)`, "WARN");
            perf.end('waitForBreadcrumbReady');
            resolve(null);
            return;
          }
          setTimeout(checkBreadcrumbReady, 200);
          return;
        }
        
        const links = breadcrumbEl.querySelectorAll('a[href]');
        const items = breadcrumbEl.querySelectorAll('[itemprop="itemListElement"]');
        const hasSchema = breadcrumbEl.querySelector('[itemtype*="BreadcrumbList"]') || 
                          breadcrumbEl.hasAttribute('itemtype');
        
        const isReady = (links.length >= 2) || (items.length >= 2 && hasSchema);
        const isLoading = links.length === 0 || 
                          (links.length === 1 && !links[0].href.includes('beranda') && !links[0].href.includes('home'));
        
        if (isReady && !isLoading) {
          log(`✅ Breadcrumb SIAP: ${links.length} links, ${items.length} items`, "BREADCRUMB");
          perf.end('waitForBreadcrumbReady');
          resolve({
            element: breadcrumbEl,
            links: Array.from(links),
            items: Array.from(items),
            linkCount: links.length,
            itemCount: items.length,
            hasSchema: hasSchema
          });
          return;
        }
        
        if (Date.now() - startTime > timeout) {
          log(`⏰ Breadcrumb timeout — belum SIAP (${links.length} links, ${items.length} items)`, "WARN");
          perf.end('waitForBreadcrumbReady');
          resolve(null);
          return;
        }
        
        setTimeout(checkBreadcrumbReady, 200);
      }
      
      checkBreadcrumbReady();
    });
  }

  // ============================================================
  // 🆕 GET PARENT FROM BREADCRUMB READY (PARENT TERDEKAT)
  // ============================================================
  function getParentFromBreadcrumbReady(breadcrumbData, currentUrl) {
    perf.start('getParentFromBreadcrumbReady');

    if (!breadcrumbData || !breadcrumbData.links || breadcrumbData.links.length === 0) {
      log('⚠️ Breadcrumb tidak valid — fallback ke origin', "WARN");
      perf.end('getParentFromBreadcrumbReady');
      return { 
        parentUrl: location.origin, 
        parentName: 'Home',
        source: 'fallback-origin',
        allParents: []
      };
    }
    
    const links = breadcrumbData.links;
    const currentUrlClean = currentUrl.replace(/[?&]m=1/, '').replace(/\/$/, '');
    
    const validParents = links.filter(link => {
      const href = link.href || '';
      const hrefClean = href.replace(/\/$/, '');
      const text = link.innerText?.trim() || '';
      
      if (hrefClean === currentUrlClean) return false;
      if (hrefClean.includes(currentUrlClean)) return false;
      if (currentUrlClean.includes(hrefClean)) return false;
      if (!href || !text) return false;
      
      return true;
    });
    
    if (validParents.length === 0) {
      log('⚠️ Tidak ada parent valid — fallback ke origin', "WARN");
      perf.end('getParentFromBreadcrumbReady');
      return { 
        parentUrl: location.origin, 
        parentName: 'Home',
        source: 'fallback-origin',
        allParents: []
      };
    }
    
    const parentLink = validParents[validParents.length - 1];
    const parentUrl = parentLink.href || '';
    const parentName = parentLink.innerText?.trim() || 'Parent Page';
    
    log(`👪 Parent terdekat dari breadcrumb: "${parentName}" → ${parentUrl}`, "PARENT");
    perf.end('getParentFromBreadcrumbReady');
    
    return {
      parentUrl: parentUrl,
      parentName: parentName,
      source: 'breadcrumb-ready',
      allParents: validParents.map(l => ({
        url: l.href,
        name: l.innerText?.trim() || ''
      }))
    };
  }

  // ============================================================
  // 🔥 PLD-ONLY DATA READERS
  // ============================================================

  function getPageLevelFromPLD() {
    const bodyLevel = document.body.getAttribute('data-page-level');
    if (bodyLevel) {
      log(`📌 Page Level dari body: ${bodyLevel}`, "PLD");
      return bodyLevel;
    }
    
    if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
      try {
        const level = window.pageLevelDetectorv22.detect();
        if (level) {
          log(`📌 Page Level dari PLD v22.62: ${level}`, "PLD");
          return level;
        }
      } catch(e) {}
    }
    
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
    
    log('⚠️ Page Level TIDAK TERSEDIA dari PLD', "WARN");
    return null;
  }

  function getEntityTypeFromPLD() {
    const bodyEntity = document.body.getAttribute('data-entity-type');
    if (bodyEntity) {
      log(`🏷️ Entity Type dari body: ${bodyEntity}`, "PLD");
      return bodyEntity;
    }
    
    if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detectEntityType === 'function') {
      try {
        const entityType = window.pageLevelDetectorv22.detectEntityType();
        if (entityType) {
          log(`🏷️ Entity Type dari PLD v22.62: ${entityType}`, "PLD");
          return entityType;
        }
      } catch(e) {}
    }
    
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
    
    log('⚠️ Entity Type TIDAK TERSEDIA dari PLD', "WARN");
    return null;
  }

  function detectContentFocus() {
    const bodyFocus = document.body.getAttribute('data-content-focus');
    if (bodyFocus) {
      log(`🎯 Content Focus dari body: ${bodyFocus}`, "FOCUS");
      return bodyFocus.toUpperCase();
    }
    
    if (window.V379A && window.V379A.focusKonten) {
      log(`🎯 Content Focus dari V37.9-A: ${window.V379A.focusKonten}`, "FOCUS");
      return window.V379A.focusKonten.toUpperCase();
    }
    
    const h1El = domCache ? domCache.get('h1') : document.querySelector('h1');
    const h1Text = h1El ? h1El.innerText.toLowerCase() : '';
    
    if (/\b(20[2-9][0-9])\b/.test(h1Text)) {
      log('🎯 Content Focus: HARGA (H1 ada tahun)', "FOCUS");
      return 'HARGA';
    }
    
    log('🎯 Content Focus: INFORMASI (default)', "FOCUS");
    return 'INFORMASI';
  }

  function getKategori() {
    const bodyKategori = document.body.getAttribute('data-kategori');
    if (bodyKategori) {
      log(`🏷️ Kategori dari body: ${bodyKategori}`, "KATEGORI");
      return bodyKategori.toUpperCase();
    }
    
    if (window.V379A && window.V379A.kategori) {
      log(`🏷️ Kategori dari V37.9-A: ${window.V379A.kategori}`, "KATEGORI");
      return window.V379A.kategori.toUpperCase();
    }
    
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

  function getEntitySubType() {
    const bodySubType = document.body.getAttribute('data-entity-sub-type');
    if (bodySubType) {
      log(`🔷 Entity Sub-Type dari body: ${bodySubType}`, "PLD");
      return bodySubType;
    }
    
    if (window.V379A && window.V379A.entitySubType) {
      log(`🔷 Entity Sub-Type dari V37.9-A: ${window.V379A.entitySubType}`, "PLD");
      return window.V379A.entitySubType;
    }
    
    log('⚠️ Entity Sub-Type TIDAK TERSEDIA', "WARN");
    return null;
  }

  function getWordCountTarget() {
    const bodyMin = document.body.getAttribute('data-word-count-min');
    const bodyMax = document.body.getAttribute('data-word-count-max');
    if (bodyMin && bodyMax) {
      const result = { min: parseInt(bodyMin), max: parseInt(bodyMax) };
      log(`📊 Word Count Target dari body: ${result.min}-${result.max}`, "PLD");
      return result;
    }
    
    if (window.V379A && window.V379A.wordCountTarget) {
      log(`📊 Word Count Target dari V37.9-A`, "PLD");
      return window.V379A.wordCountTarget;
    }
    
    log('⚠️ Word Count Target TIDAK TERSEDIA', "WARN");
    return null;
  }

  function getSchemaType() {
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
    
    if (window.V379A && window.V379A.schemaType) {
      log(`🔗 Schema Type dari V37.9-A`, "SCHEMA");
      return window.V379A.schemaType;
    }
    
    log('⚠️ Schema Type TIDAK TERSEDIA', "WARN");
    return null;
  }

  function getCtaType() {
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
    
    if (window.V379A && window.V379A.ctaType) {
      log(`🔘 CTA Type dari V37.9-A`, "PLD");
      return window.V379A.ctaType;
    }
    
    log('⚠️ CTA Type TIDAK TERSEDIA', "WARN");
    return null;
  }

  function getH1Pattern() {
    const bodyH1Pattern = document.body.getAttribute('data-h1-pattern');
    if (bodyH1Pattern) {
      log(`📝 H1 Pattern dari body: ${bodyH1Pattern}`, "PLD");
      return bodyH1Pattern;
    }
    
    if (window.V379A && window.V379A.h1Pattern) {
      log(`📝 H1 Pattern dari V37.9-A`, "PLD");
      return window.V379A.h1Pattern;
    }
    
    const kategori = getKategori();
    const pattern = kategori === 'NON-EVERGREEN' ? 'with-year' : 'no-year';
    log(`📝 H1 Pattern: ${pattern} (dari kategori)`, "PLD");
    return pattern;
  }

  function needYear(level) {
    const bodyNeedYear = document.body.getAttribute('data-need-year');
    if (bodyNeedYear !== null) {
      const result = bodyNeedYear === 'true';
      log(`📅 Need Year dari body: ${result}`, "YEAR");
      return result;
    }
    
    if (window.V379A && window.V379A.needYear !== undefined) {
      log(`📅 Need Year dari V37.9-A: ${window.V379A.needYear}`, "YEAR");
      return window.V379A.needYear;
    }
    
    const h1Pattern = getH1Pattern();
    const result = h1Pattern === 'with-year';
    log(`📅 Need Year: ${result} (dari H1 Pattern)`, "YEAR");
    return result;
  }

  function isImageEligible(pageLevel) {
    const bodyImageEligible = document.body.getAttribute('data-image-eligible');
    if (bodyImageEligible !== null) {
      const result = bodyImageEligible === 'true';
      log(`📸 Image Eligible dari body: ${result}`, "IMAGE");
      return result;
    }
    
    if (window.V379A && window.V379A.imageEligible !== undefined) {
      log(`📸 Image Eligible dari V37.9-A: ${window.V379A.imageEligible}`, "IMAGE");
      return window.V379A.imageEligible;
    }
    
    const mandatoryImageLevels = [
      'money-master', 'money-page', 'money-child',
      'variant', 'sub-variant',
      'pillar', 'sub-pillar-tipe-1', 'sub-pillar-tipe-2'
    ];
    
    const result = mandatoryImageLevels.includes(pageLevel);
    log(`📸 Image Eligible: ${result} (dari level: ${pageLevel})`, "IMAGE");
    return result;
  }

  function shouldSkipProductSchema(pageLevel) {
    const entityType = document.body.getAttribute('data-entity-type') || getEntityTypeFromPLD();
    if (entityType) {
      if (['produk', 'material'].includes(entityType)) {
        log(`✅ Product Schema: entity "${entityType}" → LANJUT`, "PRODUCT");
        return false;
      }
      if (['jasa', 'sewa'].includes(entityType)) {
        log(`⏭️ Product Schema SKIP: entity "${entityType}" → bukan produk/material`, "SKIP");
        return true;
      }
      if (['desain', 'artikel'].includes(entityType)) {
        log(`⏭️ Product Schema SKIP: entity "${entityType}"`, "SKIP");
        return true;
      }
    }
    
    if (['variant', 'sub-variant'].includes(pageLevel)) {
      log(`✅ Product Schema: level "${pageLevel}" → LANJUT`, "PRODUCT");
      return false;
    }
    if (['money-master', 'money-page', 'money-child'].includes(pageLevel)) {
      log(`✅ Product Schema: level "${pageLevel}" → LANJUT`, "PRODUCT");
      return false;
    }
    
    if (['pillar', 'sub-pillar-tipe-1', 'sub-pillar-tipe-2'].includes(pageLevel)) {
      log(`⏭️ Product Schema SKIP: level "${pageLevel}" → halaman informasi`, "SKIP");
      return true;
    }
    
    log(`⏭️ Product Schema SKIP: tidak memenuhi kriteria`, "SKIP");
    return true;
  }

  // ============================================================
  // 🔥 WAIT FUNCTIONS
  // ============================================================

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
  // 🔥 FUNGSI PENDUKUNG
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
  // 🔥 UPDATE TAHUN H1
  // ============================================================
  function updateH1Year(pageLevel) {
    if (!needYear(pageLevel)) {
      log(`⏭️ Level ini TIDAK butuh tahun di H1 (${pageLevel})`, "YEAR");
      return false;
    }

    const currentYear = getCurrentYear();
    const h1 = domCache ? domCache.get('h1') : document.querySelector('h1');
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
        if (domCache) domCache.invalidate('h1');
        log(`✅ H1: Tahun diupdate ${detectedYear} → ${currentYear}`, "YEAR");
        log(`   📝 H1 baru: "${newText}"`, "H1");
        return true;
      }
    }

    if (!detectedYear) {
      const newText = originalText + ' ' + currentYear;
      h1.innerText = newText;
      if (domCache) domCache.invalidate('h1');
      log(`✅ H1: Tahun ditambahkan → "${newText}"`, "YEAR");
      return true;
    }

    log(`✅ H1: Tahun sudah sesuai (${detectedYear})`, "YEAR");
    return true;
  }

  // ============================================================
  // 🔥 UPDATE TAHUN DI KONTEN
  // ============================================================
  function updateContentYears() {
    const currentYear = getCurrentYear();
    let updated = 0;

    const bodyElements = domCache 
      ? domCache.getAll('p, h2, h3, h4, li, td, th, figcaption, .post-body, .entry-content')
      : document.querySelectorAll('p, h2, h3, h4, li, td, th, figcaption, .post-body, .entry-content');
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
  // 🔥 UPDATE BULAN & TAHUN KONTEN (AED BASED)
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
            elements = domCache ? domCache.getAll(selector) : document.querySelectorAll(selector);
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

    const h1 = domCache ? domCache.get('h1') : document.querySelector('h1');
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
                    if (domCache) domCache.invalidate('h1');
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
  // 🔥 AMBIL NAMA DARI URL BERSIH
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
      const h1El = domCache ? domCache.get('h1') : document.querySelector('h1');
      let h1Text = h1El?.innerText?.trim();
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
  // 🆕 v4.78: GENERATE GAMBAR DARI CLOUDINARY (PER LEVEL)
  // 🔥 TANPA CANVAS FALLBACK — LANGSUNG LOGO JIKA GAGAL
  // ============================================================
  function createImageWithText(pageName, level, year) {
    perf.start('createImageWithText');
    
    if (CLOUDINARY_CONFIG.ENABLED && CLOUDINARY_CONFIG.CLOUD_NAME) {
      try {
        const needYearFlag = needYear(level);
        const displayText = needYearFlag ? `${pageName} ${year}` : pageName;
        
        const imageUrl = CLOUDINARY_CONFIG.buildUrl(level, displayText);
        
        if (/^https?:\/\//i.test(imageUrl)) {
          log(`📸 Cloudinary [${level}]: ${imageUrl}`, "IMAGE");
          perf.end('createImageWithText');
          return imageUrl;
        }
      } catch(e) {
        log(`⚠️ Cloudinary error: ${e.message} — fallback ke LOGO`, "WARN");
      }
    }
    
    log('📸 Cloudinary gagal/tidak aktif, fallback ke LOGO_IMAGE', "IMAGE");
    perf.end('createImageWithText');
    return LOGO_IMAGE;
  }

  // ============================================================
  // 🔥 STYLE RESPONSIF
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
    img.style.maxWidth = '1200px';
    img.style.height = 'auto';
    img.style.aspectRatio = '1200/630';
    img.style.objectFit = 'contain';
    img.style.borderRadius = '8px';
    img.style.display = 'block';
    img.style.margin = '0 auto';
    img.style.padding = '0 10px';
    img.style.boxSizing = 'border-box';

    const styleId = 'responsive-image-style-v478';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @media (max-width: 1200px) {
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
  // 🔥 CEK GAMBAR & PERBAIKI
  // ============================================================
  function fixImagesToFormat1() {
    perf.start('fixImagesToFormat1');
    log('Checking images in content...', "IMAGE");
    
    const pageLevel = getPageLevelFromPLD();
    const currentYear = getCurrentYear();
    const needYearFlag = needYear(pageLevel);
    const pageName = getCleanPageName(pageLevel);
    const displayName = needYearFlag ? pageName + ' ' + currentYear : pageName;

    function getImageInsertionPoint() {
      let article = domCache ? domCache.get('article') : document.querySelector('article');
      if (!article) {
        const candidates = ['.post-body', 'main', '.content', '.entry-content', '.post-content', '.article-content', '.blog-post'];
        for (let selector of candidates) {
          const el = domCache ? domCache.get(selector) : document.querySelector(selector);
          if (el) { article = el; break; }
        }
      }
      if (!article) {
        const h1 = domCache ? domCache.get('h1') : document.querySelector('h1');
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

    const h1Element = domCache ? domCache.get('h1') : document.querySelector('h1');
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
      const contentAreas = domCache 
        ? ['article', 'section', '.post-body', 'main', '.content', '.entry-content'].map(s => domCache.get(s)).filter(Boolean)
        : document.querySelectorAll('article, section, .post-body, main, .content, .entry-content');
      for (const area of contentAreas) {
        const img = area.querySelector('img:not([src*="logo"]):not([src*="icon"]):not([src*="avatar"])');
        if (img) {
          targetImage = img;
          targetFigure = img.closest('figure');
          break;
        }
      }
    }

    // 🔥 v4.78: Gunakan Cloudinary URL (tanpa Canvas fallback)
    const autoImageUrl = createImageWithText(pageName, pageLevel, currentYear);
    const captionText = '📊 ' + displayName;

    if (targetImage) {
      log('Image found in content, fixing for SEO...', "IMAGE");

      const img = targetImage;
      const figure = targetFigure || img.closest('figure');

      const currentSrc = img.src || '';
      if (currentSrc.includes('No_Image') || currentSrc.includes('placeholder') || !currentSrc) {
        img.src = autoImageUrl;
        log('Image src replaced with Cloudinary URL', "IMAGE");
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
      img.setAttribute('data-image-source', /^https?:\/\//i.test(autoImageUrl) && autoImageUrl.includes('cloudinary') ? 'cloudinary' : 'logo-fallback');

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
      perf.end('fixImagesToFormat1');
      return figure;
    }

    log('No image found, creating new responsive FIGURE...', "IMAGE");

    const insertPoint = getImageInsertionPoint();
    const figure = document.createElement('figure');
    const img = document.createElement('img');

    img.src = autoImageUrl;
    img.alt = displayName;
    img.title = displayName;
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
    img.setAttribute('data-auto-generated', 'true');
    img.setAttribute('data-page-level', pageLevel);
    img.setAttribute('data-year', currentYear);
    img.setAttribute('data-image-source', /^https?:\/\//i.test(autoImageUrl) && autoImageUrl.includes('cloudinary') ? 'cloudinary' : 'logo-fallback');

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
    perf.end('fixImagesToFormat1');
    return figure;
  }

  // ============================================================
  // 🔥 PRODUK SCHEMA FUNCTIONS
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

  function detectProductName() {
    const h1 = domCache ? domCache.get('h1')?.innerText?.trim() : document.querySelector('h1')?.innerText?.trim();
    if (h1 && h1.length < 120 && h1.length > 3) {
      return h1.replace(/\b(20[2-9][0-9])\b/g, '').replace(/\s{2,}/g, ' ').trim();
    }
    
    const metaTitle = document.querySelector('meta[property="og:title"]')?.content;
    if (metaTitle) return metaTitle.substring(0, 120);
    
    const bodyProductName = document.body.getAttribute('data-product-name');
    if (bodyProductName) return bodyProductName;
    
    const docTitle = document.title.replace(/\b(20[2-9][0-9])\b/g, '').trim();
    if (docTitle.length > 3) return docTitle.substring(0, 120);
    
    return 'Produk Konstruksi';
  }

  function detectProductCategory() {
    const bodyCategory = document.body.getAttribute('data-product-category');
    if (bodyCategory) return bodyCategory;
    
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
    
    const entityType = document.body.getAttribute('data-entity-type') || getEntityTypeFromPLD();
    if (entityType === 'material') return 'BuildingMaterial';
    if (entityType === 'produk') return 'PrecastProduct';
    
    return 'BuildingMaterial';
  }

  function extractVariantSpec() {
    const content = domCache 
      ? domCache.get(".post-body.entry-content") || domCache.get(".post-body") || domCache.get("article") || domCache.get("main")
      : document.querySelector(".post-body.entry-content, .post-body, article, main");
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
  // 🔥 OFFER PARSING
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
      const tables = domCache ? domCache.getAll(selector) : document.querySelectorAll(selector);
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
    const content = domCache 
      ? domCache.get(".post-body.entry-content") || domCache.get(".post-body") || domCache.get("article") || domCache.get("main")
      : document.querySelector(".post-body.entry-content, .post-body, article, main");
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
    const elements = domCache ? domCache.getAll("li, p, .price-item, .product-item") : document.querySelectorAll("li, p, .price-item, .product-item");
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

  // ============================================================
  // 🚀 MAIN FUNCTION v4.78
  // ============================================================
  async function init() {
    perf.start('init');
    log("═══════════════════════════════════════════════════", "INFO");
    log("AutoSchema Hybrid v4.78 — SCHEMA PRODUK/MATERIAL + PLD-ONLY", "INFO");
    log("Cloudinary Image (per Level) — TANPA Canvas Fallback", "INFO");
    log("isPartOf HANYA DI WEBPAGE (Best Practice SEO)", "INFO");
    log("═══════════════════════════════════════════════════", "INFO");
    
    // STEP 1: TUNGGU BREADCRUMB SIAP
    log("🍞 Menunggu breadcrumb SIAP (bukan loading)...", "BREADCRUMB");
    const breadcrumbData = await waitForBreadcrumbReady(CONFIG.BREADCRUMB_READY_TIMEOUT);
    
    if (breadcrumbData) {
      log(`✅ Breadcrumb SIAP: ${breadcrumbData.linkCount} links, ${breadcrumbData.itemCount} items, schema: ${breadcrumbData.hasSchema}`, "SUCCESS");
    } else {
      log(`⚠️ Breadcrumb timeout — akan fallback ke origin`, "WARN");
    }
    
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
    let imageSource = 'logo-fallback';
    const isEligible = isImageEligible(pageLevel);
    
    if (isEligible) {
      log(`✅ Halaman LAYAK mendapat gambar, memproses...`, "IMAGE");
      try {
        const fixedFigure = fixImagesToFormat1();
        if (fixedFigure) {
          const img = fixedFigure.querySelector('img');
          if (img) {
            const candidateSrc = img.src || '';
            if (/^https?:\/\//i.test(candidateSrc)) {
              imageUrl = candidateSrc;
              imageSource = img.getAttribute('data-image-source') || 'unknown';
            }
          }
        }
      } catch(e) {
        log(`Error processing images: ${e.message}`, "ERROR");
        imageUrl = LOGO_IMAGE;
      }
    } else {
      log(`⏭️ Halaman TIDAK LAYAK mendapat gambar`, "SKIP");
      const existingImage = document.querySelector('img:not([src*="logo"]):not([src*="icon"]):not([src*="avatar"])');
      if (existingImage) {
        const candidateSrc = existingImage.src || '';
        if (/^https?:\/\//i.test(candidateSrc)) {
          imageUrl = candidateSrc;
        }
      }
    }

    // STEP 9: CEK SKIP PRODUCT SCHEMA
    if (shouldSkipProductSchema(pageLevel)) {
      log("Product schema SKIPPED untuk halaman ini", "SKIP");
      perf.end('init');
      return;
    }
    
    // STEP 10: AMBIL PARENT TERDEKAT DARI BREADCRUMB SIAP
    const currentUrl = location.href.replace(/[?&]m=1/, "");
    
    log("👪 MENCARI PARENT TERDEKAT DARI BREADCRUMB SIAP...", "PARENT");
    const parentData = getParentFromBreadcrumbReady(breadcrumbData, currentUrl);
    
    log(`👪 Parent Final: "${parentData.parentName}"`, "PARENT");
    log(`   📍 URL: ${parentData.parentUrl}`, "PARENT");
    log(`   📍 Source: ${parentData.source}`, "PARENT");
    
    // STEP 11: BUILD isPartOf DARI PARENT TERDEKAT (HANYA UNTUK WEBPAGE)
    const parentUrls = [{
        "@type": "WebPage",
        "@id": parentData.parentUrl,
        name: parentData.parentName
    }];
    
    // STEP 12: PRODUCT SCHEMA
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
    
    // ✅ PRODUCT SCHEMA — TANPA isPartOf (HANYA DI WEBPAGE)
    const product = {
      "@type": "Product",
      "@id": currentUrl + "#product",
      name: productName,
      image: [imageUrl || LOGO_IMAGE],
      description: desc,
      brand: { "@type": "Brand", name: "Beton Jaya Readymix" },
      category: productCategory,
      areaServed: areaServed
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
    
    // ✅ WEBPAGE SCHEMA — DENGAN isPartOf (SATU-SATUNYA)
    const webpage = {
      "@type": "WebPage",
      "@id": currentUrl + "#webpage",
      url: currentUrl,
      name: productName,
      description: desc,
      image: imageUrl,
      mainEntity: { "@id": product["@id"] },
      isPartOf: parentUrls
    };
    
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
    
    // EXECUTION SUMMARY
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
    log(`  Image Source     : ${imageSource}`, "IMAGE");
    log(`  Image Size       : 1200×630 (SEO-optimal)`, "IMAGE");
    log(`  Cloudinary       : ${CLOUDINARY_CONFIG.ENABLED ? '✅ ENABLED (per level)' : '❌ DISABLED'}`, "IMAGE");
    log(`  Text Auto-Scale  : ✅ ACTIVE (font responsive)`, "IMAGE");
    log(`  Text Auto-Wrap   : ✅ ACTIVE (2 baris responsive)`, "IMAGE");
    log(`  Text Split Long  : ✅ ACTIVE (kata panjang dipotong)`, "IMAGE");
    log(`  Canvas Fallback  : ❌ REMOVED (tidak SEO)`, "IMAGE");
    log(`  Auto Year H1     : ${h1Updated ? '✅ UPDATE' : '⏭️ SKIP/STOP'}`, "YEAR");
    log(`  Content Year     : ${contentUpdated > 0 ? `✅ ${contentUpdated} elemen diupdate` : '⏭️ TIDAK ADA'}`, "YEAR");
    log(`  Auto Update Bulan: ${dateUpdated ? '✅ UPDATE' : '⏭️ SKIP'}`, "YEAR");
    log(`  Breadcrumb Ready : ${breadcrumbData ? '✅ SIAP' : '⏰ TIMEOUT'}`, "BREADCRUMB");
    log(`  Parent Source    : ${parentData.source}`, "PARENT");
    log(`  Parent Name      : ${parentData.parentName}`, "PARENT");
    log(`  AED              : ${aed ? '✅ READY' : '❌ FALLBACK'}`, "AED");
    log(`  DOM CACHE        : ${CONFIG.CACHE_DOM_ELEMENTS ? '✅ ACTIVE' : '❌ INACTIVE'}`, "CACHE");
    log(`  CORB PREVENTION  : ✅ ACTIVE`, "CORB");
    log(`  PLD-ONLY MODE    : ✅ ACTIVE`, "PLD");
    log(`  isPartOf SOURCE  : ✅ BREADCRUMB TERDEKAT (SIAP)`, "PARENT");
    log(`  isPartOf Lokasi  : ✅ HANYA DI WEBPAGE (Best Practice)`, "SCHEMA");
    log(`  SCHEMA FORMAT    : ✅ TETAP SAMA (VALID)`, "SCHEMA");
    log(`  OFFER STRUCTURE  : ✅ TETAP SAMA (VALID)`, "PRODUCT");
    log("═══════════════════════════════════════════════════", "INFO");
    log("AutoSchema Hybrid v4.78 SELESAI", "SUCCESS");
    
    perf.end('init');
  }
  
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(init, CONFIG.DELAY_MS);
    });
  } else {
    setTimeout(init, CONFIG.DELAY_MS);
  }

  // ============================================================
  // 🔥🔥🔥 CLEANUP 🔥🔥🔥
  // ============================================================
  function cleanup() {
    log("🧹 Cleaning up resources...", "INFO");
    if (domCache) {
      domCache.clear();
      log("✅ DOM Cache cleared", "CACHE");
    }
    log("✅ Resources cleaned up", "SUCCESS");
  }

  window.addEventListener('beforeunload', cleanup);
  
})();
