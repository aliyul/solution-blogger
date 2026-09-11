/**
 * ⚡ AutoSchema Hybrid v4.82 — PLD-ONLY MODE + isPartOf HANYA WEBPAGE
 * 
 * UPDATE v4.82 (dari v4.81) — CLEANUP FINAL:
 * ✅ FIX: needYear() — paksa boolean murni (Boolean())
 * ✅ HAPUS: getColorConfig() — dead code (Canvas sudah dihapus)
 * ✅ HAPUS: FALLBACK_IMAGE — dead code
 * ✅ HAPUS: SKIP_WORD_COUNT — dead code di CONFIG
 * ✅ HAPUS: BATCH_DOM_UPDATES — dead code di CONFIG
 * ✅ PERTAHANKAN: Semua fitur v4.81 yang sudah baik
 * 
 * @version 4.82
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
      console.warn('[Schema v4.82] 🚫 Blocked external fetch (CORB prevention):', url);
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
      console.warn('[Schema v4.82] 🚫 Blocked external XHR (CORB prevention):', url);
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
    PLD_TIMEOUT: 5000,
    AED_TIMEOUT: 10000,
    BREADCRUMB_TIMEOUT: 3000,
    BREADCRUMB_READY_TIMEOUT: 5000,
    MIN_YEAR_TO_UPDATE: 2026,
    CACHE_DOM_ELEMENTS: true
  };

  // ============================================================
  // CLOUDINARY CONFIG — URL PER LEVEL
  // ============================================================
  const CLOUDINARY_CONFIG = {
    ENABLED: true,
    CLOUD_NAME: 'vagzz5sa',
    VERSION: 'v1789109159',
    FORMAT: 'png',
    WIDTH: 1200,
    HEIGHT: 630,
    FONT: 'Arial',
    FONT_SIZE: 55,
    BOLD: true,
    GRAVITY: 'g_center',
    MAX_TEXT_LENGTH: 70,
    MAX_CHARS_PER_LINE: 18,
    MAX_LINES: 2,

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

    wrapText(text, maxCharsPerLine = this.MAX_CHARS_PER_LINE) {
      if (text.length <= maxCharsPerLine) return text;
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
      for (const word of words) {
        if (word.length > maxCharsPerLine) {
          if (currentLine) { lines.push(currentLine); currentLine = ''; }
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

  // ✅ v4.82: LOGO_IMAGE saja (FALLBACK_IMAGE dihapus — dead code)
  const LOGO_IMAGE = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";

  // ============================================================
  // PERFORMANCE MONITORING
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
  // DOM CACHE
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
  // ERROR BOUNDARY
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

  const domCache = CONFIG.CACHE_DOM_ELEMENTS ? new DOMCache() : null;
  const errorBoundary = new ErrorBoundary();

  function log(msg, type = "INFO") {
    if (!CONFIG.DEBUG && type === "INFO") return;
    const icons = { 
      INFO: "📘", WARN: "⚠️", ERROR: "❌", SUCCESS: "✅", SKIP: "⏭️", 
      PRODUCT: "🏗️", IMAGE: "📸", YEAR: "📅", FOCUS: "🎯", TABLE: "📊", 
      H1: "📝", PRIORITY: "🔴", STOP: "🛑", BREADCRUMB: "🍞", AED: "⚡", 
      COMMERCIAL: "🛒", GABUNG: "📚", PLD: "🔷", KATEGORI: "🏷️", SCHEMA: "🔗",
      PARENT: "👪", PERF: "⏱️", CACHE: "💾", CORB: "🚫", PRICE: "💰"
    };
    const prefix = icons[type] || "📘";
    console.log(`${prefix} [AutoSchema v4.82] ${msg}`);
  }

  // ============================================================
  // WAIT FOR BREADCRUMB READY
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
  // GET PARENT FROM BREADCRUMB READY
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
  // PLD-ONLY DATA READERS
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

  // ============================================================
  // ✅ v4.82: needYear() — PAKSA BOOLEAN MURNI
  // ============================================================
  function needYear(level) {
    const bodyNeedYear = document.body.getAttribute('data-need-year');
    if (bodyNeedYear !== null) {
      const result = bodyNeedYear === 'true';
      log(`📅 Need Year dari body: ${result}`, "YEAR");
      return result;
    }
    
    if (window.V379A && window.V379A.needYear !== undefined) {
      const result = Boolean(window.V379A.needYear);  // ✅ v4.82: paksa boolean
      log(`📅 Need Year dari V37.9-A: ${result}`, "YEAR");
      return result;
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

  // ============================================================
  // shouldSkipProductSchema() — PLD-ONLY
  // ============================================================
  function shouldSkipProductSchema(pageLevel, entityType) {
    // Prioritas 1: PLD body attribute
    const bodySkip = document.body.getAttribute('data-product-schema-skip');
    if (bodySkip !== null) {
      const result = bodySkip === 'true';
      log(`🏗️ Product Schema skip dari PLD: ${result}`, "PRODUCT");
      return result;
    }
    
    // Prioritas 2: V379A
    if (window.V379A && window.V379A.productSchemaSkip !== undefined) {
      const result = Boolean(window.V379A.productSchemaSkip);
      log(`🏗️ Product Schema skip dari V37.9-A: ${result}`, "PRODUCT");
      return result;
    }
    
    // Prioritas 3: PLD data-product-schema-type
    const bodySchemaType = document.body.getAttribute('data-product-schema-type');
    if (bodySchemaType !== null) {
      const result = bodySchemaType === 'skip' || bodySchemaType === 'none';
      log(`🏗️ Product Schema type dari PLD: ${bodySchemaType} → skip=${result}`, "PRODUCT");
      return result;
    }
    
    // Fallback minimal: berdasarkan entityType saja
    if (entityType) {
      const skipEntities = ['jasa', 'sewa', 'desain', 'artikel'];
      const result = skipEntities.includes(entityType.toLowerCase());
      log(`🏗️ Product Schema skip (fallback entity): ${result} (entity=${entityType})`, "PRODUCT");
      return result;
    }
    
    log(`🏗️ Product Schema skip: false (default)`, "PRODUCT");
    return false;
  }

  // ============================================================
  // WAIT FUNCTIONS
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
  // FUNGSI PENDUKUNG
  // ============================================================

  function getCurrentYear() {
    return new Date().getFullYear();
  }

  // ============================================================
  // parsePriceFromText() — cover 150.000, 150rb, 1.5jt, 150000
  // ============================================================
  function parsePriceFromText(text) {
    if (!text) return null;
    
    let clean = String(text).trim();
    
    // Handle format singkatan
    let multiplier = 1;
    if (/\d\s*(rb|ribu|k)\b/i.test(clean)) {
      multiplier = 1000;
      clean = clean.replace(/\s*(rb|ribu|k)\b/gi, '');
    }
    if (/\d\s*(jt|juta|m)\b/i.test(clean)) {
      multiplier = 1000000;
      clean = clean.replace(/\s*(jt|juta|m)\b/gi, '');
    }
    
    // Hapus "Rp", "IDR", simbol mata uang, spasi
    clean = clean.replace(/(Rp\.?|IDR|\$|€|¥|£)/gi, '').trim();
    clean = clean.replace(/\s+/g, '');
    
    // Handle format Indonesia
    if (clean.includes('.') && clean.includes(',')) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else if (clean.includes('.')) {
      const parts = clean.split('.');
      if (parts[parts.length - 1].length === 3) {
        clean = clean.replace(/\./g, '');
      }
    } else if (clean.includes(',')) {
      const parts = clean.split(',');
      if (parts[parts.length - 1].length === 3) {
        clean = clean.replace(/,/g, '');
      } else {
        clean = clean.replace(',', '.');
      }
    }
    
    const match = clean.match(/[\d.]+/);
    if (!match) return null;
    
    let value = parseFloat(match[0]);
    if (isNaN(value)) return null;
    
    value *= multiplier;
    if (value < CONFIG.MIN_PRICE || value > CONFIG.MAX_PRICE) return null;
    
    return Math.round(value);
  }

  // ============================================================
  // isNotPrice() — filter ketat 12 aturan
  // ============================================================
  function isNotPrice(text, value) {
    if (value < CONFIG.MIN_PRICE || value > CONFIG.MAX_PRICE) return true;
    
    if (value >= 1900 && value <= 2099) {
      if (!/(harga|biaya|tarif|price|cost)/i.test(text)) return true;
    }
    
    const cleanText = text.replace(/[\s\-\.]/g, '');
    if (/^(\+?62|0)\d{8,12}$/.test(cleanText)) return true;
    if (/^\d{5}$/.test(text.trim())) return true;
    if (/^\d{16}$/.test(text.trim())) return true;
    if (/^\d{10,16}$/.test(text.trim()) && !/(harga|biaya|tarif|price)/i.test(text)) return true;
    
    if (/\d+\s*(cm|mm|m|kg|ton|gr|gram|liter|ml|%|unit|buah|lembar|pcs|box|dus|rim)\b/i.test(text)) {
      if (!/(harga|biaya|tarif|price|cost|rp)/i.test(text)) return true;
    }
    
    if (/\d+\s*[x×]\s*\d+/.test(text)) {
      if (!/(harga|biaya|tarif|price)/i.test(text)) return true;
    }
    
    if (/\d[\d.,]*\s*(proyek|klien|pelanggan|orang|karyawan|tahun|bulan|hari)\b/i.test(text)) {
      if (!/(harga|biaya|tarif|price|cost|rp)/i.test(text)) return true;
    }
    
    if (/\d[\d.,]*\s*%/i.test(text)) return true;
    if (/20\d{2}\s*[-–]\s*20\d{2}/.test(text)) return true;
    if (/\d{1,4}[\/\-]\d{1,2}[\/\-]\d{1,4}/.test(text)) return true;
    
    return false;
  }

  // ============================================================
  // DETEKSI HARGA BERLAPIS (4 LAYER)
  // ============================================================
  const MONEY_LEVELS = ['money-master', 'money-page', 'money-child'];

  function detectPriceLayered(pageLevel) {
    perf.start('detectPriceLayered');
    
    if (!MONEY_LEVELS.includes(pageLevel)) {
      log(`⏭️ Deteksi harga SKIP: level "${pageLevel}" bukan money level`, "PRICE");
      perf.end('detectPriceLayered');
      return { hasPrice: false, source: null, value: null, offers: [], reason: 'not-money-level' };
    }
    
    log(`💰 DETEKSI HARGA BERLAPIS untuk level: ${pageLevel}`, "PRICE");
    
    const container = document.querySelector('article, main, .post-body, .entry-content') || document.body;
    
    // LAYER 1: Tabel dengan Header "Harga"
    log(`  🔍 Layer 1: Tabel header "Harga"...`, "PRICE");
    const layer1Result = detectPriceFromTableHeader(container);
    if (layer1Result.hasPrice) {
      log(`  ✅ Layer 1 BERHASIL: ${layer1Result.offers.length} offers`, "PRICE");
      perf.end('detectPriceLayered');
      return { ...layer1Result, layer: 1 };
    }
    log(`  ⏭️ Layer 1: tidak ketemu`, "PRICE");
    
    // LAYER 2: Elemen .price / [itemprop="price"]
    log(`  🔍 Layer 2: Elemen .price / [itemprop="price"]...`, "PRICE");
    const layer2Result = detectPriceFromElements(container);
    if (layer2Result.hasPrice) {
      log(`  ✅ Layer 2 BERHASIL`, "PRICE");
      perf.end('detectPriceLayered');
      return { ...layer2Result, layer: 2 };
    }
    log(`  ⏭️ Layer 2: tidak ketemu`, "PRICE");
    
    // LAYER 3: Elemen dengan kata kunci "harga"
    log(`  🔍 Layer 3: Elemen dengan kata kunci harga...`, "PRICE");
    const layer3Result = detectPriceFromKeywordElements(container);
    if (layer3Result.hasPrice) {
      log(`  ✅ Layer 3 BERHASIL`, "PRICE");
      perf.end('detectPriceLayered');
      return { ...layer3Result, layer: 3 };
    }
    log(`  ⏭️ Layer 3: tidak ketemu`, "PRICE");
    
    // LAYER 4: Regex longgar HANYA dengan konteks
    log(`  🔍 Layer 4: Regex longgar dengan konteks...`, "PRICE");
    const layer4Result = detectPriceFromLooseRegex(container);
    if (layer4Result.hasPrice) {
      log(`  ✅ Layer 4 BERHASIL`, "PRICE");
      perf.end('detectPriceLayered');
      return { ...layer4Result, layer: 4 };
    }
    log(`  ⏭️ Layer 4: tidak ketemu`, "PRICE");
    
    log(`  ❌ Semua layer gagal — tidak ada harga`, "PRICE");
    perf.end('detectPriceLayered');
    return { hasPrice: false, source: null, value: null, offers: [], reason: 'no-price-found' };
  }

  // ── Layer 1: Tabel Header "Harga" ─────────────────────────
  function detectPriceFromTableHeader(container) {
    const offers = [];
    const tables = container.querySelectorAll('table');
    
    for (const table of tables) {
      const headers = Array.from(table.querySelectorAll('th')).map(th => th.innerText.toLowerCase().trim());
      const priceColIndex = headers.findIndex(h => /harga|biaya|tarif|price|cost|rate/i.test(h));
      const productColIndex = headers.findIndex(h => /produk|item|jenis|nama|layanan|jasa|barang|material|tipe|varian/i.test(h));
      
      if (priceColIndex === -1) continue;
      
      const rows = table.querySelectorAll('tbody tr, tr');
      for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length <= priceColIndex) continue;
        
        const priceText = cells[priceColIndex].innerText.trim();
        const productText = productColIndex !== -1 && cells[productColIndex] 
          ? cells[productColIndex].innerText.trim() 
          : cells[0].innerText.trim();
        
        const price = parsePriceFromText(priceText);
        if (!price) continue;
        if (isNotPrice(priceText, price)) continue;
        if (!productText || productText.length < 3 || productText.length > 100) continue;
        
        offers.push({ name: productText, price: price, description: productText });
        if (offers.length >= CONFIG.MAX_OFFERS) break;
      }
      
      if (offers.length > 0) break;
    }
    
    if (offers.length > 0) {
      return { hasPrice: true, source: 'table-header', value: offers[0].price, offers: offers };
    }
    return { hasPrice: false, source: null, value: null, offers: [] };
  }

  // ── Layer 2: Elemen .price / [itemprop="price"] ───────────
  function detectPriceFromElements(container) {
    const selectors = [
      '[itemprop="price"]', '.price', '.harga', '.biaya', '.tarif',
      '[data-price]', '.price-item', '.price-value', '.amount', '.cost'
    ];
    
    const priceEls = container.querySelectorAll(selectors.join(', '));
    for (const el of priceEls) {
      const text = el.innerText.trim();
      const price = parsePriceFromText(text);
      if (!price) continue;
      if (isNotPrice(text, price)) continue;
      
      let productName = '';
      const parent = el.closest('li, tr, .product, .item, article, section');
      if (parent) {
        const h = parent.querySelector('h2, h3, h4, .title, .name, .product-name');
        if (h) productName = h.innerText.trim();
      }
      if (!productName) {
        const prev = el.previousElementSibling;
        if (prev) productName = prev.innerText.trim().substring(0, 100);
      }
      if (!productName) productName = 'Produk';
      
      return {
        hasPrice: true,
        source: 'element',
        value: price,
        offers: [{ name: productName, price: price, description: productName }]
      };
    }
    return { hasPrice: false, source: null, value: null, offers: [] };
  }

  // ── Layer 3: Elemen dengan kata kunci "harga" ─────────────
  function detectPriceFromKeywordElements(container) {
    const keywordRegex = /(harga|biaya|tarif|price|cost|rate|mulai dari|per\s+(m|m²|m2|unit|buah|lembar|meter))/i;
    const candidates = container.querySelectorAll('p, div, span, li, td, strong, b, em');
    
    for (const el of candidates) {
      const text = el.innerText || '';
      if (!text || text.length > 500) continue;
      if (!keywordRegex.test(text)) continue;
      
      const price = parsePriceFromText(text);
      if (!price) continue;
      if (isNotPrice(text, price)) continue;
      
      let productName = text.replace(/Rp\.?\s*[\d.,]+\s*(rb|ribu|k|jt|juta)?/gi, '').trim();
      productName = productName.replace(/^(harga|biaya|tarif)\s*:?\s*/i, '').trim();
      if (productName.length > 100) productName = productName.substring(0, 100);
      if (productName.length < 3) productName = 'Produk';
      
      return {
        hasPrice: true,
        source: 'keyword',
        value: price,
        offers: [{ name: productName, price: price, description: productName }]
      };
    }
    return { hasPrice: false, source: null, value: null, offers: [] };
  }

  // ── Layer 4: Regex Longgar HANYA dengan Konteks ───────────
  function detectPriceFromLooseRegex(container) {
    const keywordRegex = /(harga|biaya|tarif|price|cost|rate|mulai dari|per\s+(m|m²|m2|unit|buah|lembar|meter))/i;
    
    const contextEls = [];
    const allEls = container.querySelectorAll('p, div, span, li, td, th, strong, b, em');
    for (const el of allEls) {
      const text = el.innerText || '';
      if (!text || text.length > 500) continue;
      if (keywordRegex.test(text)) contextEls.push(el);
    }
    
    if (contextEls.length === 0) {
      return { hasPrice: false, source: null, value: null, offers: [], reason: 'no-context' };
    }
    
    for (const el of contextEls) {
      const text = el.innerText;
      
      const rpMatches = text.match(/Rp\.?\s*([\d.,]+)/gi);
      if (rpMatches) {
        for (const m of rpMatches) {
          const price = parsePriceFromText(m);
          if (price && !isNotPrice(text, price)) {
            let name = text.replace(/Rp\.?\s*[\d.,]+\s*(rb|ribu|k|jt|juta)?/gi, '').replace(/^(harga|biaya|tarif)\s*:?\s*/i, '').trim();
            if (name.length > 100) name = name.substring(0, 100);
            if (name.length < 3) name = 'Produk';
            return { hasPrice: true, source: 'regex-rp', value: price, offers: [{ name, price, description: name }] };
          }
        }
      }
      
      const unitMatches = text.match(/([\d.,]+)\s*(rb|ribu|k|jt|juta)\b/gi);
      if (unitMatches) {
        for (const m of unitMatches) {
          const price = parsePriceFromText(m);
          if (price && !isNotPrice(text, price)) {
            let name = text.replace(/([\d.,]+)\s*(rb|ribu|k|jt|juta)/gi, '').replace(/^(harga|biaya|tarif)\s*:?\s*/i, '').trim();
            if (name.length > 100) name = name.substring(0, 100);
            if (name.length < 3) name = 'Produk';
            return { hasPrice: true, source: 'regex-unit', value: price, offers: [{ name, price, description: name }] };
          }
        }
      }
      
      const thousandMatches = text.match(/\b\d{1,3}(?:[.,]\d{3})+\b/g);
      if (thousandMatches) {
        for (const m of thousandMatches) {
          const price = parsePriceFromText(m);
          if (price && !isNotPrice(text, price)) {
            let name = text.replace(/\b\d{1,3}(?:[.,]\d{3})+\b/g, '').replace(/^(harga|biaya|tarif)\s*:?\s*/i, '').trim();
            if (name.length > 100) name = name.substring(0, 100);
            if (name.length < 3) name = 'Produk';
            return { hasPrice: true, source: 'regex-thousand', value: price, offers: [{ name, price, description: name }] };
          }
        }
      }
      
      if (/per\s+(m|m²|m2|unit|buah|lembar|meter)/i.test(text)) {
        const plainMatches = text.match(/\b(\d{4,8})\b/g);
        if (plainMatches) {
          for (const m of plainMatches) {
            const price = parsePriceFromText(m);
            if (price && !isNotPrice(text, price)) {
              let name = text.replace(/\b\d{4,8}\b/g, '').replace(/^(harga|biaya|tarif)\s*:?\s*/i, '').trim();
              if (name.length > 100) name = name.substring(0, 100);
              if (name.length < 3) name = 'Produk';
              return { hasPrice: true, source: 'regex-plain', value: price, offers: [{ name, price, description: name }] };
            }
          }
        }
      }
    }
    
    return { hasPrice: false, source: null, value: null, offers: [], reason: 'no-valid-price' };
  }

  // ============================================================
  // AMBIL NAMA DARI URL BERSIH
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
  // CREATE IMAGE — CLOUDINARY
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
  // STYLE RESPONSIF
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

    const styleId = 'responsive-image-style-v482';
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
  // CEK GAMBAR & PERBAIKI
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
  // PRODUK SCHEMA FUNCTIONS
  // ============================================================
  function sanitizeText(text) {
    if (!text) return "";
    return text.replace(/[\t\n\r]+/g, ' ').replace(/\s{2,}/g, ' ').trim().substring(0, 100);
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
    // Prioritas 1: PLD
    const bodyCategory = document.body.getAttribute('data-product-category');
    if (bodyCategory) return bodyCategory;
    
    // Prioritas 2: V379A
    if (window.V379A && window.V379A.productCategory) {
      return window.V379A.productCategory;
    }
    
    // Prioritas 3: Default berdasarkan entity type
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

  function getAEDPriceValidUntil() {
    const aed = window.AEDMetaDates;
    if (aed && aed.nextUpdate) {
      return aed.nextUpdate;
    }
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  }

  // ============================================================
  // 🚀 MAIN FUNCTION v4.82
  // ============================================================
  async function init() {
    perf.start('init');
    log("═══════════════════════════════════════════════════", "INFO");
    log("AutoSchema Hybrid v4.82 — CLEANUP FINAL", "INFO");
    log("Tanpa Duplikasi Update H1 & Konten (di-handle Smart Evergreen)", "INFO");
    log("Deteksi Harga Berlapis (4 Layer) untuk Money Level", "INFO");
    log("Dead Code Cleanup + needYear() Boolean Fix", "INFO");
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
    
    // STEP 3: TUNGGU AEDMetaDates (dari Smart Evergreen)
    log("⏳ Menunggu AEDMetaDates...", "AED");
    const aed = await waitForAEDMetaDates(CONFIG.AED_TIMEOUT);
    
    if (aed) {
      log(`✅ AED ready: ${aed.dateModified}`, "AED");
      log(`   📅 nextUpdate: ${aed.nextUpdate}`, "AED");
      log(`   📅 type: ${aed.type}`, "AED");
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
    log(`📌 Schema Type: ${schemaType ? schemaType.primary + ' + ' + schemaType.secondary : 'N/A'}`, "SCHEMA");
    log(`📌 H1 Pattern: ${h1Pattern}`, "PLD");

    // ═══════════════════════════════════════════════════════════
    // ✅ STEP 5: UPDATE H1 & KONTEN — DIHAPUS (DUPLIKASI)
    // Sudah di-handle oleh Smart Evergreen v16.1
    // ═══════════════════════════════════════════════════════════
    log("📅 Update H1 & Konten: DIHANDLE Smart Evergreen (skip)", "YEAR");

    // =========================================================
    // STEP 6: DETEKSI HARGA BERLAPIS (4 LAYER)
    // =========================================================
    log("💰 DETEKSI HARGA BERLAPIS (Money Level Only):", "PRICE");
    const priceResult = detectPriceLayered(pageLevel);
    const detectedOffers = priceResult.offers || [];
    const hasPrice = priceResult.hasPrice;
    
    if (hasPrice) {
      log(`✅ Harga TERDETEKSI via Layer ${priceResult.layer}`, "PRICE");
      log(`   📍 Source: ${priceResult.source}`, "PRICE");
      log(`   💰 Value: ${priceResult.value}`, "PRICE");
      log(`   📊 Offers: ${detectedOffers.length}`, "PRICE");
    } else {
      log(`⏭️ Tidak ada harga terdeteksi (${priceResult.reason})`, "PRICE");
    }

    // STEP 7: CEK GAMBAR & FIX GAMBAR
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

    // STEP 8: CEK SKIP PRODUCT SCHEMA (PLD-ONLY)
    if (shouldSkipProductSchema(pageLevel, entityType)) {
      log("Product schema SKIPPED untuk halaman ini", "SKIP");
      perf.end('init');
      return;
    }
    
    // STEP 9: AMBIL PARENT TERDEKAT DARI BREADCRUMB SIAP
    const currentUrl = location.href.replace(/[?&]m=1/, "");
    
    log("👪 MENCARI PARENT TERDEKAT DARI BREADCRUMB SIAP...", "PARENT");
    const parentData = getParentFromBreadcrumbReady(breadcrumbData, currentUrl);
    
    log(`👪 Parent Final: "${parentData.parentName}"`, "PARENT");
    log(`   📍 URL: ${parentData.parentUrl}`, "PARENT");
    log(`   📍 Source: ${parentData.source}`, "PARENT");
    
    // STEP 10: BUILD isPartOf
    const parentUrls = [{
        "@type": "WebPage",
        "@id": parentData.parentUrl,
        name: parentData.parentName
    }];
    
    // STEP 11: PRODUCT SCHEMA
    const productName = detectProductName();
    const desc = document.querySelector('meta[name="description"]')?.content?.trim() || 
                 document.querySelector("article p, main p, section p")?.innerText?.trim()?.substring(0, 300) ||
                 `Produk ${productName} berkualitas dari Beton Jaya Readymix`;
    
    const areaServed = getAreaServed();
    const productCategory = detectProductCategory();
    
    // Gunakan detectedOffers dari deteksi berlapis
    const offers = detectedOffers.map(o => ({
      "@type": "Offer",
      name: sanitizeText(o.name),
      url: currentUrl,
      priceCurrency: "IDR",
      price: o.price,
      priceValidUntil: getAEDPriceValidUntil(),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": "https://www.betonjayareadymix.com/#localbusiness" }
    }));
    
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
    log(`  Content Focus    : ${contentFocus}`, "FOCUS");
    log(`  Kategori         : ${kategori}`, "KATEGORI");
    log(`  Product Category : ${productCategory}`, "SUCCESS");
    log(`  ─── DETEKSI HARGA ──────────────────────────────`, "PRICE");
    log(`  Is Money Level   : ${MONEY_LEVELS.includes(pageLevel) ? '✅ Ya' : '❌ Tidak'}`, "PRICE");
    log(`  Has Price        : ${hasPrice ? '✅ Ya' : '❌ Tidak'}`, "PRICE");
    log(`  Price Layer      : ${priceResult.layer || 'N/A'}`, "PRICE");
    log(`  Price Source     : ${priceResult.source || 'N/A'}`, "PRICE");
    log(`  Offers Count     : ${offers.length}`, "PRICE");
    log(`  ─── SCHEMA ─────────────────────────────────────`, "SUCCESS");
    log(`  WebPage Schema   : ✅ (+ isPartOf)`, "SUCCESS");
    log(`  Product Schema   : ✅ (dengan ${offers.length} offers)`, "SUCCESS");
    log(`  isPartOf Lokasi  : ✅ HANYA DI WEBPAGE`, "SCHEMA");
    log(`  ─── UPDATE (DIHANDLE SMART EVERGREEN) ──────────`, "YEAR");
    log(`  Update H1        : ⏭️ SKIP (Smart Evergreen)`, "YEAR");
    log(`  Update Konten    : ⏭️ SKIP (Smart Evergreen)`, "YEAR");
    log(`  Update Meta      : ⏭️ SKIP (Smart Evergreen)`, "YEAR");
    log(`  ─── SYSTEM ─────────────────────────────────────`, "INFO");
    log(`  Image Source     : ${imageSource}`, "IMAGE");
    log(`  Breadcrumb Ready : ${breadcrumbData ? '✅ SIAP' : '⏰ TIMEOUT'}`, "BREADCRUMB");
    log(`  Parent Name      : ${parentData.parentName}`, "PARENT");
    log(`  AED              : ${aed ? '✅ READY' : '❌ FALLBACK'}`, "AED");
    log(`  DOM CACHE        : ${CONFIG.CACHE_DOM_ELEMENTS ? '✅ ACTIVE' : '❌ INACTIVE'}`, "CACHE");
    log(`  CORB PREVENTION  : ✅ ACTIVE`, "CORB");
    log(`  PLD-ONLY MODE    : ✅ ACTIVE`, "PLD");
    log("═══════════════════════════════════════════════════", "INFO");
    log("AutoSchema Hybrid v4.82 SELESAI", "SUCCESS");
    
    perf.end('init');
  }
  
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(init, CONFIG.DELAY_MS);
    });
  } else {
    setTimeout(init, CONFIG.DELAY_MS);
  }

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
