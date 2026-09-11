/* ⚡ AUTO SCHEMA UNIVERSAL v7.28.7 — PLD-ONLY + isPartOf WebPage Only + Cloudinary + Deteksi Harga Berlapis (Money Level Only) */
// ============================================================
// 🔥🔥🔥 v7.28.7 CHANGELOG 🔥🔥🔥
// ============================================================
// ✅ P1  — Casing konsisten di detectContentFocus()
// ✅ P2  — Casing konsisten di getKategori()
// ✅ P3  — updateH1YearByAED() pakai AED, syarat < yearAED AND > 2025
// ✅ P4  — updateContentDateReferences() pakai AED (bukan new Date())
// ✅ P5  — extractServiceType() hapus tahun hardcoded
// ✅ P6  — Product schema untuk entity produk/material
// ✅ P7  — CONFIG & log() dipindah ke atas
// ✅ P8  — Bungkus dengan IIFE
// ✅ P9  — needYear() return boolean murni
// ✅ P10 — knowsAbout dari PLD + fallback
// ✅ P11 — Guard perf.end() agar tidak dobel
// ✅ P12 — extractOffersFromTable() batasi ke container
// ✅ P13 — generateInternalLinks() optimasi
// ✅ P14 — Refactor :contains → queryByKeyword()
// ✅ P15 — extractYear() cover 1900-2099
// ✅ P16 — parsePriceFromText() cover 150.000, 150rb, 1.5jt, 150000
// ✅ P17 — isNotPrice() filter ketat (12 aturan)
// ✅ P18 — Layer 1: Tabel header "Harga"
// ✅ P19 — Layer 2: Elemen .price / [itemprop="price"]
// ✅ P20 — Layer 3: Elemen dengan kata kunci harga
// ✅ P21 — Layer 4: Regex longgar HANYA dengan konteks
// ✅ P22 — Deteksi harga HANYA untuk money-master, money-page, money-child
// ✅ PERTAHANKAN: Semua kode valid dari v7.28.4
// ============================================================

(function() {
  "use strict";

  // ============================================================
  // 🔥🔥🔥 P7: KONFIGURASI (DIPINDAH KE ATAS) 🔥🔥🔥
  // ============================================================
  const CONFIG = {
    DEBUG: true,
    DELAY_MS: 700,
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
  // 🔥🔥🔥 P7: LOGGING (DIPINDAH KE ATAS) 🔥🔥🔥
  // ============================================================
  function log(msg, type = "INFO") {
    if (!CONFIG.DEBUG && type === "INFO") return;
    const icons = { 
      INFO: "📘", WARN: "⚠️", ERROR: "❌", SUCCESS: "✅", SKIP: "⏭️", 
      PRODUCT: "🏗️", IMAGE: "📸", YEAR: "📅", FOCUS: "🎯", TABLE: "📊", 
      H1: "📝", PRIORITY: "🔴", STOP: "🛑", BREADCRUMB: "🍞", AED: "⚡",
      PERF: "⏱️", CACHE: "💾", CORB: "🚫", COMMERCIAL: "🛒",
      PLD: "🔷", KATEGORI: "🏷️", SCHEMA: "🔗", PARENT: "👪", PRICE: "💰"
    };
    const prefix = icons[type] || "📘";
    console.log(`${prefix} [Schema v7.28.7] ${msg}`);
  }

  // ============================================================
  // 🔥🔥🔥 BLOKIR EXTERNAL REQUEST 🔥🔥🔥
  // ============================================================
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && (url.includes('raw.githack.com') || url.includes('github.com') || url.includes('gist.github.com'))) {
      console.warn('[Schema v7.28.7] 🚫 Blocked external fetch (CORB prevention):', url);
      return Promise.reject(new Error('Blocked by CORB prevention'));
    }
    return originalFetch.apply(this, args);
  };

  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    if (typeof url === 'string' && (url.includes('raw.githack.com') || url.includes('github.com') || url.includes('gist.github.com'))) {
      console.warn('[Schema v7.28.7] 🚫 Blocked external XHR (CORB prevention):', url);
      throw new Error('Blocked by CORB prevention');
    }
    return originalXHROpen.call(this, method, url, ...rest);
  };

  // ============================================================
  // 🔥🔥🔥 PERFORMANCE MONITORING (P11: Guard end) 🔥🔥🔥
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
    },
    measure(label, fn) {
      this.start(label);
      const result = fn();
      this.end(label);
      return result;
    },
    async measureAsync(label, fn) {
      this.start(label);
      const result = await fn();
      this.end(label);
      return result;
    }
  };

  // ============================================================
  // 🔥🔥🔥 DOM CACHE 🔥🔥🔥
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
          const observer = new MutationObserver(() => {
            this.invalidate(selector, context);
          });
          observer.observe(context, { 
            childList: true, 
            subtree: true,
            characterData: true 
          });
          this.observers.set(key, observer);
        }
      }
      
      return this.cache.get(key);
    }

    getAll(selector, context = document) {
      const key = `${context === document ? 'document' : context.id || 'context'}:${selector}:all`;
      
      if (!this.cache.has(key)) {
        const elements = Array.from(context.querySelectorAll(selector));
        this.cache.set(key, elements);
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
      this.observers.forEach(observer => observer.disconnect());
      this.observers.clear();
    }
  }

  // ============================================================
  // 🔥🔥🔥 ERROR BOUNDARY 🔥🔥🔥
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
        
        if (fallback) {
          return typeof fallback === 'function' ? fallback(...args) : fallback;
        }
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

  // ============================================================
  // 🆕 KONFIGURASI CLOUDINARY (c_fit + RESPONSIVE TEXT) 🔥
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

  // ============================================================
  // 🔥🔥🔥 KONFIGURASI IMAGE 🔥🔥🔥
  // ============================================================
  const IMAGE_CONFIG = {
    FALLBACK_IMAGE: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiWWAP6ezcmzgbGtHmmJqBjYkbsdQBrwCeC9pl9ocjL-VSQYftirdvXAF1T-eg_QMSqu1WiFidDc9fnChi0yaOqi0Dd6EVMy4ZX3P7vccY4XJMu-7k2TGVd5TS1wIG5jgIm_6beYVb2zuNQGS7eBuODJqd20c4ckvd0-HaEqGf4W-B_750I91wi9IhqqnI/s320/No_Image_Available.jpg",
    LOGO_IMAGE: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png"
  };

  // ============================================================
  // 🍞 WAIT FOR BREADCRUMB READY
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
          log(`✅ Breadcrumb SIAP: ${links.length} links, ${items.length} items, schema: ${hasSchema}`, "BREADCRUMB");
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
  // 👪 GET PARENT FROM BREADCRUMB READY
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
  // 🔥🔥🔥 PLD-ONLY DATA READERS 🔥🔥🔥
  // ============================================================

  function getPageLevelFromPLD() {
    perf.start('getPageLevelFromPLD');
    
    const bodyLevel = document.body.getAttribute('data-page-level');
    if (bodyLevel) {
      log(`📌 Page Level dari body: ${bodyLevel}`, "PLD");
      perf.end('getPageLevelFromPLD');
      return bodyLevel;
    }
    
    if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.detect) {
      try {
        const level = window.pageLevelDetectorv22.detect();
        if (level) {
          log(`📌 Page Level dari PLD v22.62: ${level}`, "PLD");
          perf.end('getPageLevelFromPLD');
          return level;
        }
      } catch(e) {
        log(`⚠️ Error PLD v22.62: ${e.message}`, "WARN");
      }
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
            perf.end('getPageLevelFromPLD');
            return level;
          }
        } catch(e) {}
      }
    }
    
    log('⚠️ Page Level TIDAK TERSEDIA dari PLD', "WARN");
    perf.end('getPageLevelFromPLD');
    return null;
  }

  function getEntityTypeFromPLD() {
    perf.start('getEntityTypeFromPLD');
    
    const bodyEntity = document.body.getAttribute('data-entity-type');
    if (bodyEntity) {
      log(`🏷️ Entity Type dari body: ${bodyEntity}`, "PLD");
      perf.end('getEntityTypeFromPLD');
      return bodyEntity;
    }
    
    if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.detectEntityType) {
      try {
        const entityType = window.pageLevelDetectorv22.detectEntityType();
        if (entityType) {
          log(`🏷️ Entity Type dari PLD v22.62: ${entityType}`, "PLD");
          perf.end('getEntityTypeFromPLD');
          return entityType;
        }
      } catch(e) {
        log(`⚠️ Error PLD v22.62: ${e.message}`, "WARN");
      }
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
            perf.end('getEntityTypeFromPLD');
            return entityType;
          }
        } catch(e) {}
      }
    }
    
    log('⚠️ Entity Type TIDAK TERSEDIA dari PLD', "WARN");
    perf.end('getEntityTypeFromPLD');
    return null;
  }

  // ============================================================
  // 🔥🔥🔥 P1: FIX CASING KONSISTEN di detectContentFocus() 🔥🔥🔥
  // ============================================================
  function detectContentFocus() {
    perf.start('detectContentFocus');
    
    const bodyFocus = document.body.getAttribute('data-content-focus');
    if (bodyFocus) {
      const normalized = bodyFocus.toUpperCase();
      log(`🎯 Content Focus dari body: ${normalized}`, "FOCUS");
      perf.end('detectContentFocus');
      return normalized;
    }
    
    if (window.V379A && window.V379A.focusKonten) {
      const normalized = String(window.V379A.focusKonten).toUpperCase();
      log(`🎯 Content Focus dari V37.9-A: ${normalized}`, "FOCUS");
      perf.end('detectContentFocus');
      return normalized;
    }
    
    const h1El = domCache ? domCache.get('h1') : document.querySelector('h1');
    const h1Text = h1El ? h1El.innerText.toLowerCase() : '';
    
    if (/\b(20[2-9][0-9])\b/.test(h1Text)) {
      log('🎯 Content Focus: HARGA (H1 ada tahun)', "FOCUS");
      perf.end('detectContentFocus');
      return 'HARGA';
    }
    
    log('🎯 Content Focus: INFORMASI (default)', "FOCUS");
    perf.end('detectContentFocus');
    return 'INFORMASI';
  }

  // ============================================================
  // 🔥🔥🔥 P2: FIX CASING KONSISTEN di getKategori() 🔥🔥🔥
  // ============================================================
  function getKategori() {
    perf.start('getKategori');
    
    const bodyKategori = document.body.getAttribute('data-kategori');
    if (bodyKategori) {
      const normalized = bodyKategori.toUpperCase();
      log(`🏷️ Kategori dari body: ${normalized}`, "KATEGORI");
      perf.end('getKategori');
      return normalized;
    }
    
    if (window.V379A && window.V379A.kategori) {
      const normalized = String(window.V379A.kategori).toUpperCase();
      log(`🏷️ Kategori dari V37.9-A: ${normalized}`, "KATEGORI");
      perf.end('getKategori');
      return normalized;
    }
    
    const contentFocus = detectContentFocus();
    if (contentFocus === 'INFORMASI') {
      log('🏷️ Kategori: EVERGREEN (dari INFORMASI)', "KATEGORI");
      perf.end('getKategori');
      return 'EVERGREEN';
    }
    if (['HARGA', 'COMMERCIAL', 'GABUNG'].includes(contentFocus)) {
      log('🏷️ Kategori: NON-EVERGREEN (dari HARGA/COMMERCIAL/GABUNG)', "KATEGORI");
      perf.end('getKategori');
      return 'NON-EVERGREEN';
    }
    
    log('🏷️ Kategori: EVERGREEN (default)', "KATEGORI");
    perf.end('getKategori');
    return 'EVERGREEN';
  }

  function getEntitySubType() {
    perf.start('getEntitySubType');
    
    const bodySubType = document.body.getAttribute('data-entity-sub-type');
    if (bodySubType) {
      log(`🔷 Entity Sub-Type dari body: ${bodySubType}`, "PLD");
      perf.end('getEntitySubType');
      return bodySubType;
    }
    
    if (window.V379A && window.V379A.entitySubType) {
      log(`🔷 Entity Sub-Type dari V37.9-A: ${window.V379A.entitySubType}`, "PLD");
      perf.end('getEntitySubType');
      return window.V379A.entitySubType;
    }
    
    log('⚠️ Entity Sub-Type TIDAK TERSEDIA', "WARN");
    perf.end('getEntitySubType');
    return null;
  }

  function getWordCountTarget() {
    perf.start('getWordCountTarget');
    
    const bodyMin = document.body.getAttribute('data-word-count-min');
    const bodyMax = document.body.getAttribute('data-word-count-max');
    if (bodyMin && bodyMax) {
      const result = { min: parseInt(bodyMin), max: parseInt(bodyMax) };
      log(`📊 Word Count Target dari body: ${result.min}-${result.max}`, "PLD");
      perf.end('getWordCountTarget');
      return result;
    }
    
    if (window.V379A && window.V379A.wordCountTarget) {
      log(`📊 Word Count Target dari V37.9-A`, "PLD");
      perf.end('getWordCountTarget');
      return window.V379A.wordCountTarget;
    }
    
    log('⚠️ Word Count Target TIDAK TERSEDIA', "WARN");
    perf.end('getWordCountTarget');
    return null;
  }

  function getSchemaType() {
    perf.start('getSchemaType');
    
    const bodyPrimary = document.body.getAttribute('data-schema-type-primary');
    const bodySecondary = document.body.getAttribute('data-schema-type-secondary');
    if (bodyPrimary) {
      const result = { 
        primary: bodyPrimary, 
        secondary: bodySecondary || 'FAQPage' 
      };
      log(`🔗 Schema Type dari body: ${result.primary} + ${result.secondary}`, "SCHEMA");
      perf.end('getSchemaType');
      return result;
    }
    
    if (window.V379A && window.V379A.schemaType) {
      log(`🔗 Schema Type dari V37.9-A`, "SCHEMA");
      perf.end('getSchemaType');
      return window.V379A.schemaType;
    }
    
    log('⚠️ Schema Type TIDAK TERSEDIA', "WARN");
    perf.end('getSchemaType');
    return null;
  }

  function getCtaType() {
    perf.start('getCtaType');
    
    const bodyCtaType = document.body.getAttribute('data-cta-type');
    const bodyCtaText = document.body.getAttribute('data-cta-text');
    if (bodyCtaType) {
      const result = { 
        type: bodyCtaType, 
        text: bodyCtaText || bodyCtaType 
      };
      log(`🔘 CTA Type dari body: ${result.type} — "${result.text}"`, "PLD");
      perf.end('getCtaType');
      return result;
    }
    
    if (window.V379A && window.V379A.ctaType) {
      log(`🔘 CTA Type dari V37.9-A`, "PLD");
      perf.end('getCtaType');
      return window.V379A.ctaType;
    }
    
    log('⚠️ CTA Type TIDAK TERSEDIA', "WARN");
    perf.end('getCtaType');
    return null;
  }

  function getH1Pattern() {
    perf.start('getH1Pattern');
    
    const bodyH1Pattern = document.body.getAttribute('data-h1-pattern');
    if (bodyH1Pattern) {
      log(`📝 H1 Pattern dari body: ${bodyH1Pattern}`, "PLD");
      perf.end('getH1Pattern');
      return bodyH1Pattern;
    }
    
    if (window.V379A && window.V379A.h1Pattern) {
      log(`📝 H1 Pattern dari V37.9-A`, "PLD");
      perf.end('getH1Pattern');
      return window.V379A.h1Pattern;
    }
    
    const kategori = getKategori();
    const pattern = kategori === 'NON-EVERGREEN' ? 'with-year' : 'no-year';
    log(`📝 H1 Pattern: ${pattern} (dari kategori)`, "PLD");
    perf.end('getH1Pattern');
    return pattern;
  }

  // ============================================================
  // 🔥🔥🔥 P9: FIX needYear() RETURN BOOLEAN MURNI 🔥🔥🔥
  // ============================================================
  function needYear(level) {
    perf.start('needYear');
    
    const bodyNeedYear = document.body.getAttribute('data-need-year');
    if (bodyNeedYear !== null) {
      const result = bodyNeedYear === 'true';
      log(`📅 Need Year dari body: ${result}`, "YEAR");
      perf.end('needYear');
      return result;
    }
    
    if (window.V379A && window.V379A.needYear !== undefined) {
      const result = Boolean(window.V379A.needYear);
      log(`📅 Need Year dari V37.9-A: ${result}`, "YEAR");
      perf.end('needYear');
      return result;
    }
    
    const h1Pattern = getH1Pattern();
    const result = h1Pattern === 'with-year';
    log(`📅 Need Year: ${result} (dari H1 Pattern)`, "YEAR");
    perf.end('needYear');
    return result;
  }

  function isImageEligible(pageLevel) {
    perf.start('isImageEligible');
    
    const bodyImageEligible = document.body.getAttribute('data-image-eligible');
    if (bodyImageEligible !== null) {
      const result = bodyImageEligible === 'true';
      log(`📸 Image Eligible dari body: ${result}`, "IMAGE");
      perf.end('isImageEligible');
      return result;
    }
    
    if (window.V379A && window.V379A.imageEligible !== undefined) {
      log(`📸 Image Eligible dari V37.9-A: ${window.V379A.imageEligible}`, "IMAGE");
      perf.end('isImageEligible');
      return window.V379A.imageEligible;
    }
    
    const mandatoryImageLevels = [
      'money-master', 'money-page', 'money-child',
      'variant', 'sub-variant',
      'pillar', 'sub-pillar-tipe-1', 'sub-pillar-tipe-2'
    ];
    
    const result = mandatoryImageLevels.includes(pageLevel);
    log(`📸 Image Eligible: ${result} (dari level: ${pageLevel})`, "IMAGE");
    perf.end('isImageEligible');
    return result;
  }

  // ============================================================
  // 🔥🔥🔥 WAIT FUNCTIONS (P11: Guard end) 🔥🔥🔥
  // ============================================================

  function waitForAEDMetaDates(timeout = CONFIG.AED_TIMEOUT) {
    return new Promise((resolve) => {
      perf.start('waitForAEDMetaDates');
      
      const controller = new AbortController();
      let timeoutId = null;
      let intervalId = null;
      let resolved = false;

      function safeEnd() {
        if (!resolved) {
          resolved = true;
          perf.end('waitForAEDMetaDates');
        }
      }

      if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
        log(`⚡ AEDMetaDates ready: ${window.AEDMetaDates.dateModified}`, "AED");
        safeEnd();
        resolve(window.AEDMetaDates);
        return;
      }

      function cleanup() {
        if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
        if (intervalId) { clearInterval(intervalId); intervalId = null; }
        controller.abort();
      }

      const onReady = () => {
        cleanup();
        if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
          log(`⚡ AEDMetaDates ready (event): ${window.AEDMetaDates.dateModified}`, "AED");
          safeEnd();
          resolve(window.AEDMetaDates);
        } else {
          safeEnd();
          resolve(null);
        }
      };

      window.addEventListener("detectEvergreenReady", onReady, { once: true, signal: controller.signal });

      const startTime = Date.now();
      intervalId = setInterval(() => {
        if (controller.signal.aborted) {
          clearInterval(intervalId);
          intervalId = null;
          return;
        }

        if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
          cleanup();
          log(`⚡ AEDMetaDates ready (interval): ${window.AEDMetaDates.dateModified}`, "AED");
          safeEnd();
          resolve(window.AEDMetaDates);
          return;
        }

        if (Date.now() - startTime > timeout) {
          cleanup();
          log(`⏰ AEDMetaDates timeout (${timeout}ms), using fallback`, "WARN");
          safeEnd();
          resolve({
            dateModified: new Date().toISOString(),
            nextUpdate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            validityDays: 30,
            usePriceValidUntil: true,
            pageLevel: 'money-page',
            entityType: 'jasa',
            type: 'non-evergreen'
          });
        }
      }, 100);

      timeoutId = setTimeout(() => {
        cleanup();
        safeEnd();
        resolve(null);
      }, timeout + 100);
    });
  }

  function waitForPLD() {
    return new Promise((resolve) => {
      perf.start('waitForPLD');
      
      if (window.pageLevelDetectorv22 || window.pageLevelDetectorv20 || 
          window.pageLevelDetectorv19 || window.pageLevelDetectorV18 || 
          window.pageLevelDetectorV17 || window.pageLevelDetector) {
        perf.end('waitForPLD');
        resolve(true);
        return;
      }

      const controller = new AbortController();
      const onReady = () => {
        perf.end('waitForPLD');
        resolve(true);
      };
      
      window.addEventListener("pageLevelDetectorv22Ready", onReady, { once: true, signal: controller.signal });
      window.addEventListener("pageLevelDetectorv20Ready", onReady, { once: true, signal: controller.signal });
      window.addEventListener("pageLevelDetectorv19Ready", onReady, { once: true, signal: controller.signal });
      window.addEventListener("pageLevelDetectorReady", onReady, { once: true, signal: controller.signal });

      setTimeout(() => {
        controller.abort();
        if (window.pageLevelDetectorv22 || window.pageLevelDetectorv20 || 
            window.pageLevelDetectorv19 || window.pageLevelDetectorV18 || 
            window.pageLevelDetectorV17 || window.pageLevelDetector) {
          perf.end('waitForPLD');
          resolve(true);
        } else {
          perf.end('waitForPLD');
          resolve(false);
        }
      }, CONFIG.PLD_TIMEOUT);
    });
  }

  // ============================================================
  // 🔥🔥🔥 FUNGSI PENDUKUNG 🔥🔥🔥
  // ============================================================
  function getColorConfig(level) {
    const colors = {
      'pillar': { bg: '#0a2a44', text: '#ffffff', accent: '#25d366' },
      'sub-pillar-tipe-2': { bg: '#1a237e', text: '#ffffff', accent: '#25d366' },
      'sub-pillar-tipe-1': { bg: '#004d40', text: '#ffffff', accent: '#25d366' },
      'money-master': { bg: '#0a2a44', text: '#ffffff', accent: '#ffd700' },
      'money-page': { bg: '#1a5a8c', text: '#ffffff', accent: '#ffd700' },
      'money-child': { bg: '#bf360c', text: '#ffffff', accent: '#ffd700' },
      'variant': { bg: '#4a148c', text: '#ffffff', accent: '#25d366' },
      'sub-variant': { bg: '#4e342e', text: '#ffffff', accent: '#25d366' }
    };
    return colors[level] || colors['pillar'];
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

  // ============================================================
  // 🔥🔥🔥 P15: FIX extractYear() COVER 1900-2099 🔥🔥🔥
  // ============================================================
  function extractYear(text) {
    const match = text.match(/\b(19|20)\d{2}\b/);
    return match ? parseInt(match[0]) : null;
  }

  // ============================================================
  // 🔥🔥🔥 AMBIL NAMA DARI URL BERSIH 🔥🔥🔥
  // ============================================================
  function getCleanPageName(level) {
    perf.start('getCleanPageName');
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
      const h1Element = domCache ? domCache.get('h1') : document.querySelector('h1');
      let h1Text = h1Element?.innerText?.trim();
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
    perf.end('getCleanPageName');
    return cleanName;
  }

  // ============================================================
  // 🆕 CREATE IMAGE — CLOUDINARY DYNAMIC 🔥
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
    
    log('📸 Image: fallback ke LOGO', "IMAGE");
    perf.end('createImageWithText');
    return IMAGE_CONFIG.LOGO_IMAGE;
  }

  // ============================================================
  // 🔥🔥🔥 CEK & PERBAIKI GAMBAR 🔥🔥🔥
  // ============================================================
  function fixImagesToFormat1(pageLevel) {
    perf.start('fixImagesToFormat1');
    log('Checking images in content...', "IMAGE");

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
        const h1Element = domCache ? domCache.get('h1') : document.querySelector('h1');
        if (h1Element) article = h1Element.closest('section, div, main');
      }
      if (!article) article = document.body;

      const badgeSelectors = ['.update-badge', '.update-badge-class', '[class*="update-badge"]'];
      let badge = null;
      for (const selector of badgeSelectors) {
        const el = domCache ? domCache.get(selector, article) : article.querySelector(selector);
        if (el && el.parentElement === article) {
          badge = el;
          break;
        }
      }
      
      if (badge) {
        return { container: article, referenceNode: badge, position: 'after' };
      }

      const firstChild = article.firstElementChild;
      if (firstChild && firstChild.tagName === 'H1') {
        return { container: article, referenceNode: firstChild, position: 'after' };
      }

      return { container: article, referenceNode: null, position: 'first' };
    }

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

      const styleId = 'responsive-image-style-v7287';
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
      const contentAreas = ['article', 'section', '.post-body', 'main', '.content', '.entry-content'];
      for (const areaSelector of contentAreas) {
        const area = domCache ? domCache.get(areaSelector) : document.querySelector(areaSelector);
        if (area) {
          const img = area.querySelector('img:not([src*="logo"]):not([src*="icon"]):not([src*="avatar"])');
          if (img) {
            targetImage = img;
            targetFigure = img.closest('figure');
            break;
          }
        }
      }
    }

    const autoImageUrl = createImageWithText(pageName, pageLevel, currentYear);
    const captionText = '📊 ' + displayName;

    let result = null;

    if (targetImage) {
      log('Image found in content, fixing for SEO...', "IMAGE");

      const img = targetImage;
      const figure = targetFigure || img.closest('figure');

      const currentSrc = img.src || '';
      if (currentSrc.includes('No_Image') || currentSrc.includes('placeholder') || !currentSrc) {
        if (/^https?:\/\//i.test(autoImageUrl)) {
          img.src = autoImageUrl;
          log('Image src replaced with Cloudinary URL', "IMAGE");
        } else {
          img.src = IMAGE_CONFIG.LOGO_IMAGE;
          log('Image src fallback to LOGO', "IMAGE");
        }
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
        result = figure;
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
        result = newFigure;
      }

      log('✅ Image fixed with SEO FIGURE', "SUCCESS");
      perf.end('fixImagesToFormat1');
      return result;
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
  // 🔥🔥🔥 P3: UPDATE H1 BERBASIS AED 🔥🔥🔥
  // 🔥 SYARAT: yearTerdeteksi < yearAED AND yearTerdeteksi > 2025
  // 🔥 JIKA TIDAK ADA TAHUN: JANGAN TAMBAH
  // ============================================================
  function getYearMonthFromAED(aed) {
    if (!aed || !aed.dateModified) {
      log(`⚠️ AED tidak tersedia untuk ekstrak tahun/bulan`, "WARN");
      return null;
    }
    
    try {
      const date = new Date(aed.dateModified);
      if (isNaN(date.getTime())) {
        log(`⚠️ AED dateModified tidak valid: ${aed.dateModified}`, "WARN");
        return null;
      }
      
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      
      const result = {
        year: date.getFullYear(),
        month: date.getMonth(),
        monthName: monthNames[date.getMonth()],
        dateText: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
        isoDate: aed.dateModified
      };
      
      log(`📅 AED Date Parsed: ${result.dateText} (year: ${result.year})`, "AED");
      return result;
    } catch(e) {
      log(`❌ Error parsing AED date: ${e.message}`, "ERROR");
      return null;
    }
  }

  function updateH1YearByAED(pageLevel, aed) {
    perf.start('updateH1YearByAED');
    
    if (!needYear(pageLevel)) {
      log(`⏭️ Level "${pageLevel}" TIDAK butuh tahun di H1`, "YEAR");
      perf.end('updateH1YearByAED');
      return { updated: false, reason: 'level-no-year' };
    }
    
    const h1 = domCache ? domCache.get('h1') : document.querySelector('h1');
    if (!h1) {
      log(`⚠️ Tidak ada H1 ditemukan`, "WARN");
      perf.end('updateH1YearByAED');
      return { updated: false, reason: 'no-h1' };
    }
    
    const aedData = getYearMonthFromAED(aed);
    if (!aedData) {
      log(`⚠️ AED date tidak valid, skip update H1`, "WARN");
      perf.end('updateH1YearByAED');
      return { updated: false, reason: 'no-aed' };
    }
    
    const originalText = h1.innerText;
    const detectedYear = extractYear(originalText);
    
    if (!detectedYear) {
      log(`⏭️ H1 tidak ada tahun — JANGAN TAMBAH`, "YEAR");
      perf.end('updateH1YearByAED');
      return { updated: false, reason: 'no-year-in-h1' };
    }
    
    if (detectedYear <= 2025) {
      log(`🛑 STOP: H1 tahun ${detectedYear} ≤ 2025`, "STOP");
      perf.end('updateH1YearByAED');
      return { updated: false, reason: 'year-too-old' };
    }
    
    if (detectedYear >= aedData.year) {
      log(`✅ H1 tahun ${detectedYear} >= AED year ${aedData.year}`, "YEAR");
      perf.end('updateH1YearByAED');
      return { updated: false, reason: 'year-already-current' };
    }
    
    const newText = originalText.replace(/\b(19|20)\d{2}\b/, aedData.year);
    
    if (newText !== originalText) {
      h1.innerText = newText;
      if (domCache) domCache.invalidate('h1');
      log(`✅ H1: Tahun diupdate ${detectedYear} → ${aedData.year}`, "YEAR");
      log(`   📝 "${originalText}" → "${newText}"`, "H1");
      perf.end('updateH1YearByAED');
      return { updated: true, from: detectedYear, to: aedData.year };
    }
    
    perf.end('updateH1YearByAED');
    return { updated: false, reason: 'no-change' };
  }

  // ============================================================
  // 🔥🔥🔥 P14: FILTER MANUAL UNTUK :contains 🔥🔥🔥
  // ============================================================
  function queryByKeyword(container, keywords, requireYear = true) {
    const results = [];
    const elements = container.querySelectorAll('p, span, div, time');
    elements.forEach(el => {
      const text = el.innerText?.toLowerCase() || '';
      const hasKeyword = keywords.some(kw => text.includes(kw.toLowerCase()));
      const hasYear = /\b(19|20)\d{2}\b/.test(text);
      if (hasKeyword && (!requireYear || hasYear)) {
        results.push(el);
      }
    });
    return results;
  }

  // ============================================================
  // 🔥🔥🔥 P4: UPDATE BULAN & TAHUN DI KONTEN (AED BASED) 🔥🔥🔥
  // ============================================================
  function updateContentDateReferences(aed, pageLevel) {
    perf.start('updateContentDateReferences');
    
    const moneyLevels = ['money-master', 'money-page', 'money-child'];
    if (!moneyLevels.includes(pageLevel)) {
      log(`⏭️ Skip update konten: Level ${pageLevel} tidak butuh update`, "YEAR");
      perf.end('updateContentDateReferences');
      return false;
    }

    const aedData = getYearMonthFromAED(aed);
    if (!aedData) {
      log(`⚠️ AED tidak valid, skip update konten`, "WARN");
      perf.end('updateContentDateReferences');
      return false;
    }

    const currentYear = aedData.year;
    const newDateText = aedData.dateText;
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    if (currentYear < 2026) {
      log(`🛑 STOP: Tahun AED ${currentYear} < 2026, tidak update`, "STOP");
      perf.end('updateContentDateReferences');
      return false;
    }

    log(`📅 Update konten target: ${newDateText}`, "YEAR");

    let updated = false;
    const selectors = [
      '.update-badge', '.update-badge-class', '[class*="update-badge"]',
      '.last-updated', '.updated-date', '.date-modified',
      '.post-date', '.article-date', '.publish-date',
      'time[datetime]', 'time',
      '.post-meta', '.entry-meta', '.article-meta',
      '.breadcrumb + p', '.toc + p', 'h1 + p'
    ];

    const containers = selectors.map(sel => domCache ? domCache.get(sel) : document.querySelector(sel)).filter(Boolean);
    const keywordEls = queryByKeyword(
      document.body,
      ['diperbarui', 'update', 'terakhir', 'last updated', 'updated', 'perbarui'],
      true
    );
    const allEls = [...containers, ...keywordEls];

    for (const el of allEls) {
      if (!el || el.tagName === 'H1') continue;

      const originalText = el.innerText || '';
      const hasDate = /\b(19|20)\d{2}\b/.test(originalText);
      const hasMonth = /(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)/i.test(originalText);

      if (!(hasDate || hasMonth)) continue;

      const textNodes = [];
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
      let node;
      while (node = walker.nextNode()) {
        textNodes.push(node);
      }
      
      for (const textNode of textNodes) {
        const oldText = textNode.textContent || '';
        const yearMatches = oldText.match(/\b(19|20)\d{2}\b/g);
        if (!yearMatches || yearMatches.length === 0) continue;

        let shouldUpdate = false;
        for (const yStr of yearMatches) {
          const y = parseInt(yStr);
          if (y <= 2025) continue;
          if (y < currentYear) {
            shouldUpdate = true;
            break;
          }
        }
        
        if (!shouldUpdate) continue;

        let newText = oldText;
        newText = newText.replace(
          /(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+(\d{4})/gi,
          (match, month, year) => {
            const y = parseInt(year);
            if (y > 2025 && y < currentYear) return newDateText;
            return match;
          }
        );

        newText = newText.replace(/(\d{4})-(\d{2})-(\d{2})/g, (match, y, m, d) => {
          const yearNum = parseInt(y);
          if (yearNum > 2025 && yearNum < currentYear) {
            const monthName = monthNames[parseInt(m) - 1] || m;
            return `${parseInt(d)} ${monthName} ${currentYear}`;
          }
          return match;
        });

        newText = newText.replace(/(\d{2})\/(\d{2})\/(\d{4})/g, (match, d, m, y) => {
          const yearNum = parseInt(y);
          if (yearNum > 2025 && yearNum < currentYear) {
            const monthName = monthNames[parseInt(m) - 1] || m;
            return `${parseInt(d)} ${monthName} ${currentYear}`;
          }
          return match;
        });

        if (newText === oldText) {
          newText = oldText.replace(/\b(19|20)\d{2}\b/g, (match) => {
            const y = parseInt(match);
            if (y > 2025 && y < currentYear) return String(currentYear);
            return match;
          });
        }

        if (newText !== oldText) {
          textNode.textContent = newText;
          updated = true;
          log(`✅ Update teks: "${oldText.substring(0, 50)}..." → "${newText.substring(0, 50)}..."`, "YEAR");
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
            updated = true;
            log(`✅ H1 tahun diupdate: "${h1Text}" → "${newH1}"`, "YEAR");
          }
        }
      }
    }

    if (!updated) {
      log(`⚠️ Tidak ditemukan teks tanggal untuk diupdate`, "WARN");
    }

    perf.end('updateContentDateReferences');
    return updated;
  }

  // ============================================================
  // 🔥🔥🔥 P5: extractServiceType() TANPA TAHUN HARDCODED 🔥🔥🔥
  // ============================================================
  function extractServiceType(title, entityType) {
    let serviceType = title
      .replace(/^(harga|biaya|tarif|estimasi)\s*/i, '')
      .replace(/\b(19|20)\d{2}\b/g, '')
      .replace(/\s*terbaru|\s*update|\s*terkini/g, '')
      .replace(/[-,|:].*$/, '')
      .trim();

    if (entityType === 'jasa') {
      if (!/^(jasa|layanan|service|borongan|kontraktor|renovasi|pemasangan|instalasi)/i.test(serviceType)) {
        serviceType = 'Jasa ' + serviceType;
      }
    } else if (entityType === 'sewa') {
      if (!/^(sewa|rental|sewa alat|rental alat)/i.test(serviceType)) {
        serviceType = 'Sewa ' + serviceType;
      }
    }

    if (serviceType.length > 50) serviceType = serviceType.substring(0, 50);
    return serviceType;
  }

  // ============================================================
  // 🔥🔥🔥 SCHEMA FUNCTIONS 🔥🔥🔥
  // ============================================================
  function hasPriceOnPage() {
    const text = document.body.innerText;
    return /Rp\s*[\d.,]+/.test(text);
  }

  // ============================================================
  // 🔥🔥🔥 P10: knowsAbout DARI PLD + FALLBACK 🔥🔥🔥
  // ============================================================
  function detectKnowsAbout(entityType) {
    const bodyKnowsAbout = document.body.getAttribute('data-knows-about');
    if (bodyKnowsAbout) {
      const result = bodyKnowsAbout.split(',').map(s => s.trim()).filter(s => s.length > 0).slice(0, 10);
      log(`📚 knowsAbout dari PLD: ${result.length} items`, "PLD");
      return result;
    }
    
    if (window.V379A && Array.isArray(window.V379A.knowsAbout)) {
      log(`📚 knowsAbout dari V37.9-A: ${window.V379A.knowsAbout.length} items`, "PLD");
      return window.V379A.knowsAbout.slice(0, 10);
    }
    
    const knowsAbout = [];
    
    if (entityType === 'jasa') {
      knowsAbout.push('Jasa Konstruksi', 'Jasa Bangunan', 'Kontraktor', 'Renovasi', 'Pemasangan', 'Perbaikan');
    } else if (entityType === 'sewa') {
      knowsAbout.push('Sewa Alat Berat', 'Rental Excavator', 'Rental Bulldozer', 'Rental Crane', 'Alat Konstruksi');
    } else if (entityType === 'material') {
      knowsAbout.push('Material Bangunan', 'Bahan Konstruksi', 'Beton Ready Mix', 'Precast', 'Agregat');
    } else {
      knowsAbout.push('Produk Konstruksi', 'Beton Precast', 'Material Bangunan');
    }

    document.querySelectorAll('.breadcrumbs a, .breadcrumb a, .nav-trail a').forEach(link => {
      const name = link.innerText?.trim();
      if (name && name.length > 2 && name.length < 50) {
        const skipLabels = ['home', 'beranda', 'blog', 'homepage'];
        if (!skipLabels.includes(name.toLowerCase())) knowsAbout.push(name);
      }
    });

    return [...new Set(knowsAbout)].slice(0, 10);
  }

  // ============================================================
  // 🔥🔥🔥 P16: parsePriceFromText() — COVER 150.000, 150rb, 1.5jt, 150000 🔥🔥🔥
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
  // 🔥🔥🔥 P17: isNotPrice() — FILTER KETAT 🔥🔥🔥
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
  // 🔥🔥🔥 P18-P22: DETEKSI HARGA BERLAPIS (MONEY LEVEL ONLY) 🔥🔥🔥
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
      '[itemprop="price"]',
      '.price',
      '.harga',
      '.biaya',
      '.tarif',
      '[data-price]',
      '.price-item',
      '.price-value',
      '.amount',
      '.cost'
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
  // 🔥🔥🔥 P12: extractOffersFromTable() — LEGACY (DIPERTAHANKAN) 🔥🔥🔥
  // ============================================================
  function extractOffersFromTable() {
    perf.start('extractOffersFromTable');
    const offers = [];
    const seenItems = new Set();
    
    const container = document.querySelector('article, main, .post-body, .entry-content') || document.body;
    const tables = domCache ? domCache.getAll('table', container) : container.querySelectorAll('table');

    tables.forEach(table => {
      const rows = table.querySelectorAll('tr');
      rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 0) {
          let name = '';
          let price = null;
          cells.forEach(cell => {
            const text = cell.innerText.trim();
            const priceMatch = text.match(/Rp\s*([\d.,]+)/);
            if (priceMatch) {
              const priceValue = parseInt(priceMatch[1].replace(/[^\d]/g, ''));
              if (priceValue > CONFIG.MIN_PRICE && priceValue < CONFIG.MAX_PRICE) price = priceValue;
            }
            if (!priceMatch && text.length > 2 && text.length < 100) {
              const priceLabels = ['harga', 'biaya', 'tarif', 'price', 'cost', 'rp', 'rp.'];
              if (!priceLabels.some(label => text.toLowerCase().includes(label))) {
                if (!name || text.length > name.length) name = text;
              }
            }
          });
          if (!name && cells.length > 0) {
            const firstCell = cells[0].innerText.trim();
            if (firstCell.length > 2 && firstCell.length < 100) {
              const priceLabels = ['harga', 'biaya', 'tarif', 'price', 'cost', 'rp', 'rp.'];
              if (!priceLabels.some(label => firstCell.toLowerCase().includes(label))) {
                name = firstCell;
              }
            }
          }
          if (name) {
            name = name.replace(/^(harga|biaya|tarif|paket|jasa|layanan|sewa)\s*/i, '').replace(/\s{2,}/g, ' ').trim();
          }
          if (name && price && name.length > 2 && name.length < 80) {
            const idKey = `${name}|${price}`;
            if (!seenItems.has(idKey)) {
              seenItems.add(idKey);
              offers.push({ name: name, price: price, description: name });
            }
          }
        }
      });
    });

    if (offers.length === 0) {
      container.querySelectorAll('li, p').forEach(el => {
        const text = el.innerText.trim();
        const priceMatch = text.match(/Rp\s*([\d.,]+)/);
        if (priceMatch) {
          const price = parseInt(priceMatch[1].replace(/[^\d]/g, ''));
          if (price > CONFIG.MIN_PRICE && price < CONFIG.MAX_PRICE) {
            let name = text.split('Rp')[0].trim();
            name = name.replace(/^(harga|biaya|tarif|paket|jasa|layanan|sewa)\s*/i, '').replace(/\s{2,}/g, ' ').trim();
            if (name && name.length > 2 && name.length < 80) {
              const idKey = `${name}|${price}`;
              if (!seenItems.has(idKey)) {
                seenItems.add(idKey);
                offers.push({ name: name, price: price, description: name });
              }
            }
          }
        }
      });
    }

    perf.end('extractOffersFromTable');
    return offers;
  }

  // ============================================================
  // 🔥🔥🔥 P13: generateInternalLinks() OPTIMASI 🔥🔥🔥
  // ============================================================
  function generateInternalLinks() {
    perf.start('generateInternalLinks');
    
    const container = document.querySelector('article, main, .post-body') || document.body;
    const anchors = container.querySelectorAll('a');
    
    const links = [];
    for (const a of anchors) {
      const href = a.href;
      if (!href) continue;
      if (!href.includes(location.hostname)) continue;
      if (href.includes('#')) continue;
      if (href.match(/(\/search|\/feed|\/label)/i)) continue;
      links.push(href);
      if (links.length >= 40) break;
    }
    
    const unique = [...new Set(links)];
    const result = unique.map((u, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: u,
      name: decodeURIComponent(u.split("/").pop().replace(".html", "").replace(/-/g, " "))
    }));
    perf.end('generateInternalLinks');
    return result;
  }

  // ============================================================
  // 🚀 MAIN FUNCTION v7.28.7
  // ============================================================
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(async () => {
      perf.start('init');
      log("═══════════════════════════════════════════════════", "INFO");
      log("AUTO SCHEMA UNIVERSAL v7.28.7 — PLD-ONLY MODE", "INFO");
      log("Deteksi Harga Berlapis (Money Level Only)", "INFO");
      log("═══════════════════════════════════════════════════", "INFO");
      
      try {
        // ===== STEP 1: TUNGGU BREADCRUMB SIAP =====
        log('🍞 Menunggu breadcrumb SIAP (bukan loading)...', "BREADCRUMB");
        const breadcrumbData = await waitForBreadcrumbReady(CONFIG.BREADCRUMB_READY_TIMEOUT);
        
        if (breadcrumbData) {
          log(`✅ Breadcrumb SIAP: ${breadcrumbData.linkCount} links, ${breadcrumbData.itemCount} items`, "SUCCESS");
        } else {
          log(`⚠️ Breadcrumb timeout — akan fallback ke origin`, "WARN");
        }
        
        // ===== STEP 2: TUNGGU PLD =====
        log('⏳ Menunggu PLD...', "PLD");
        await waitForPLD();
        
        // ===== STEP 3: TUNGGU AEDMetaDates =====
        log('⏳ Menunggu AEDMetaDates...', "AED");
        const aed = await waitForAEDMetaDates(CONFIG.AED_TIMEOUT);
        
        if (aed) {
          log(`✅ AED ready: ${aed.dateModified}`, "AED");
          log(`   📅 nextUpdate: ${aed.nextUpdate}`, "AED");
          log(`   📅 validityDays: ${aed.validityDays}`, "AED");
        } else {
          log(`⚠️ AED tidak tersedia, gunakan fallback`, "WARN");
        }

        // ===== STEP 4: TERIMA DATA DARI PLD =====
        log('🔷 TERIMA DATA DARI PLD/V37.9-A:', "PLD");
        
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

        // ===== STEP 5: UPDATE H1 BERBASIS AED =====
        log('📅 UPDATE H1 BERBASIS AED:', "YEAR");
        const h1UpdateResult = updateH1YearByAED(pageLevel, aed);

        // ===== STEP 5.5: UPDATE BULAN & TAHUN DI KONTEN (AED BASED) =====
        log('📅 UPDATE BULAN & TAHUN DI KONTEN (AED BASED):', "YEAR");
        const contentDateUpdated = updateContentDateReferences(aed, pageLevel);

        // ===== STEP 6: DETEKSI HARGA BERLAPIS (MONEY LEVEL ONLY) =====
        log('💰 DETEKSI HARGA BERLAPIS (Money Level Only):', "PRICE");
        const priceResult = detectPriceLayered(pageLevel);
        const tableOffers = priceResult.offers || [];
        const hasPrice = priceResult.hasPrice;
        
        if (hasPrice) {
          log(`✅ Harga TERDETEKSI via Layer ${priceResult.layer}`, "PRICE");
          log(`   📍 Source: ${priceResult.source}`, "PRICE");
          log(`   💰 Value: ${priceResult.value}`, "PRICE");
          log(`   📊 Offers: ${tableOffers.length}`, "PRICE");
        } else {
          log(`⏭️ Tidak ada harga terdeteksi (${priceResult.reason})`, "PRICE");
        }

        // ===== STEP 7: CEK & PERBAIKI GAMBAR =====
        const isEligible = isImageEligible(pageLevel);
        let pageImage = IMAGE_CONFIG.LOGO_IMAGE;

        if (isEligible) {
          log(`✅ Halaman LAYAK mendapat gambar, memproses...`, "IMAGE");
          try {
            const fixedFigure = fixImagesToFormat1(pageLevel);
            if (fixedFigure) {
              const img = fixedFigure.querySelector('img');
              if (img) {
                const candidateSrc = img.src || '';
                if (/^https?:\/\//i.test(candidateSrc)) {
                  pageImage = candidateSrc;
                  log(`📸 Schema image: ${candidateSrc}`, "IMAGE");
                } else {
                  pageImage = IMAGE_CONFIG.LOGO_IMAGE;
                  log(`⚠️ Image src bukan URL absolut — fallback ke LOGO_IMAGE`, "WARN");
                }
              }
            }
          } catch(e) {
            log(`Error processing images: ${e.message}`, "ERROR");
            pageImage = IMAGE_CONFIG.LOGO_IMAGE;
          }
        } else {
          log(`⏭️ Halaman TIDAK LAYAK mendapat gambar, skip`, "SKIP");
          const existingImage = document.querySelector('img:not([src*="logo"]):not([src*="icon"]):not([src*="avatar"])');
          if (existingImage) {
            const candidateSrc = existingImage.src || '';
            if (/^https?:\/\//i.test(candidateSrc)) {
              pageImage = candidateSrc;
            } else {
              pageImage = IMAGE_CONFIG.LOGO_IMAGE;
            }
          }
        }

        // ===== STEP 8: INJECT SCHEMA =====
        const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
        const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
        const baseUrl = ogUrl || canonical || location.href;
        const cleanUrl = baseUrl.replace(/[?&]m=1/, "");

        const h1Text = domCache?.get('h1')?.innerText?.trim() || document.querySelector("h1")?.innerText?.trim() || document.title;
        const title = h1Text.replace(/\s{2,}/g, " ").trim().substring(0, 120);

        const description = document.querySelector('meta[name="description"]')?.content?.trim() ||
          document.querySelector("article p, main p, .post-body p")?.innerText?.substring(0, 200) || title;

        const LOGO_IMAGE = IMAGE_CONFIG.LOGO_IMAGE;
        const FALLBACK_IMAGE = IMAGE_CONFIG.FALLBACK_IMAGE;

        const PAGE = {
          url: cleanUrl,
          title,
          description,
          image: pageImage,
          business: {
            name: "Beton Jaya Readymix",
            url: "https://www.betonjayareadymix.com",
            telephone: "+6283839000968",
            openingHours: "Mo-Sa 08:00-17:00",
            description: "Beton Jaya Readymix melayani jasa konstruksi, beton cor, precast, dan sewa alat berat di seluruh Indonesia.",
            address: { "@type": "PostalAddress", addressLocality: "Bogor", addressRegion: "Jawa Barat", addressCountry: "ID" },
            sameAs: ["https://www.facebook.com/betonjayareadymix", "https://www.instagram.com/betonjayareadymix"],
            logo: LOGO_IMAGE
          }
        };

        // ===== STEP 8.5: PARENT DARI BREADCRUMB SIAP =====
        log("👪 MENCARI PARENT TERDEKAT DARI BREADCRUMB SIAP...", "PARENT");
        const parentData = getParentFromBreadcrumbReady(breadcrumbData, cleanUrl);
        
        log(`👪 Parent Final: "${parentData.parentName}"`, "PARENT");
        log(`   📍 URL: ${parentData.parentUrl}`, "PARENT");
        log(`   📍 Source: ${parentData.source}`, "PARENT");

        const parentUrls = [{ 
          "@type": "WebPage", 
          "@id": parentData.parentUrl, 
          name: parentData.parentName || "Parent Page" 
        }];

        const areaProv = {
          "DKI Jakarta": "DKI Jakarta",
          "Kabupaten Bogor": "Jawa Barat",
          "Kota Bogor": "Jawa Barat",
          "Kota Depok": "Jawa Barat",
          "Kabupaten Tangerang": "Banten",
          "Kota Tangerang": "Banten",
          "Kota Tangerang Selatan": "Banten",
          "Kabupaten Bekasi": "Jawa Barat",
          "Kota Bekasi": "Jawa Barat",
          "Kabupaten Karawang": "Jawa Barat"
        };
        const defaultAreaServed = Object.keys(areaProv).map(a => ({ "@type": "Place", name: a }));

        const knowsAbout = detectKnowsAbout(entityType);

        const priceValidUntil = (aed && aed.nextUpdate) 
          ? aed.nextUpdate 
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        log(`📅 priceValidUntil: ${priceValidUntil}`, "AED");

        const graph = [
          {
            "@type": ["LocalBusiness", "GeneralContractor"],
            "@id": PAGE.business.url + "#localbusiness",
            name: PAGE.business.name,
            url: PAGE.business.url,
            telephone: PAGE.business.telephone,
            description: PAGE.business.description,
            address: PAGE.business.address,
            openingHours: PAGE.business.openingHours,
            logo: LOGO_IMAGE,
            sameAs: PAGE.business.sameAs,
            areaServed: defaultAreaServed,
            knowsAbout: knowsAbout
          },
          {
            "@type": "WebPage",
            "@id": cleanUrl + "#webpage",
            url: cleanUrl,
            name: PAGE.title,
            description: PAGE.description,
            image: PAGE.image,
            isPartOf: parentUrls,
            publisher: { "@id": PAGE.business.url + "#localbusiness" },
            dateModified: aed && aed.dateModified ? aed.dateModified : new Date().toISOString(),
            inLanguage: "id"
          }
        ];

        const isJasa = entityType === 'jasa';
        const isSewa = entityType === 'sewa';
        const isService = isJasa || isSewa;
        const isProduct = entityType === 'produk' || entityType === 'material';

        // ===== SERVICE SCHEMA (jasa/sewa) =====
        if (isService) {
          const serviceType = extractServiceType(PAGE.title, entityType);
          const serviceNode = {
            "@type": "Service",
            "@id": cleanUrl + "#service",
            name: PAGE.title,
            description: PAGE.description,
            image: PAGE.image,
            serviceType: serviceType,
            areaServed: defaultAreaServed,
            provider: { "@id": PAGE.business.url + "#localbusiness" },
            brand: { "@type": "Brand", name: PAGE.business.name },
            mainEntityOfPage: { "@id": cleanUrl + "#webpage" }
          };

          if (hasPrice && tableOffers.length > 0) {
            const lowPrice = Math.min(...tableOffers.map(o => o.price));
            const highPrice = Math.max(...tableOffers.map(o => o.price));
            serviceNode.offers = {
              "@type": "AggregateOffer",
              lowPrice: lowPrice,
              highPrice: highPrice,
              offerCount: tableOffers.length,
              priceCurrency: "IDR",
              priceValidUntil: priceValidUntil
            };
          }
          graph.push(serviceNode);
          log(`✅ Service schema (${entityType}) — isPartOf di WebPage`, "SUCCESS");

          if (hasPrice && tableOffers.length > 0) {
            const lowPrice = Math.min(...tableOffers.map(o => o.price));
            const highPrice = Math.max(...tableOffers.map(o => o.price));

            const productNode = {
              "@type": "Product",
              "@id": cleanUrl + "#product",
              name: PAGE.title,
              description: PAGE.description,
              image: [PAGE.image],
              brand: { "@type": "Brand", name: PAGE.business.name },
              category: entityType === 'jasa' ? "ConstructionService" : "RentalService",
              offers: {
                "@type": "AggregateOffer",
                lowPrice: lowPrice,
                highPrice: highPrice,
                offerCount: tableOffers.length,
                priceCurrency: "IDR",
                priceValidUntil: priceValidUntil,
                offers: tableOffers.map(offer => ({
                  "@type": "Offer",
                  "name": offer.name,
                  "url": cleanUrl,
                  "priceCurrency": "IDR",
                  "price": offer.price,
                  "itemCondition": "https://schema.org/NewCondition",
                  "availability": "https://schema.org/InStock",
                  "priceValidUntil": priceValidUntil,
                  "seller": { "@id": PAGE.business.url + "#localbusiness" },
                  "description": offer.description || offer.name
                }))
              }
            };
            graph.push(productNode);
            log(`✅ Product schema pelengkap (${tableOffers.length} offers)`, "SUCCESS");
          } else {
            log(`⏭️ Skip Product schema (tidak ada harga)`, "SKIP");
          }
        }
        // =========================================================
        // 🔥 P6: PRODUCT SCHEMA UNTUK ENTITY produk/material 🔥
        // =========================================================
        else if (isProduct) {
          const category = document.body.getAttribute('data-product-category') || 
                           (entityType === 'material' ? 'BuildingMaterial' : 'PrecastProduct');
          
          const productNode = {
            "@type": "Product",
            "@id": cleanUrl + "#product",
            name: PAGE.title,
            description: PAGE.description,
            image: [PAGE.image],
            brand: { "@type": "Brand", name: PAGE.business.name },
            category: category,
            areaServed: defaultAreaServed
          };

          if (pageLevel === 'variant' || pageLevel === 'sub-variant') {
            productNode.productType = pageLevel === 'variant' ? "Variant" : "Sub-Variant";
            productNode.material = "Beton Precast";
            productNode.manufacturer = { "@type": "Organization", name: PAGE.business.name };
          }

          if (hasPrice && tableOffers.length > 0) {
            const lowPrice = Math.min(...tableOffers.map(o => o.price));
            const highPrice = Math.max(...tableOffers.map(o => o.price));
            productNode.offers = {
              "@type": "AggregateOffer",
              lowPrice: lowPrice,
              highPrice: highPrice,
              offerCount: tableOffers.length,
              priceCurrency: "IDR",
              priceValidUntil: priceValidUntil,
              offers: tableOffers.map(offer => ({
                "@type": "Offer",
                "name": offer.name,
                "url": cleanUrl,
                "priceCurrency": "IDR",
                "price": offer.price,
                "itemCondition": "https://schema.org/NewCondition",
                "availability": "https://schema.org/InStock",
                "priceValidUntil": priceValidUntil,
                "seller": { "@id": PAGE.business.url + "#localbusiness" },
                "description": offer.description || offer.name
              }))
            };
          }
          
          graph.push(productNode);
          log(`✅ Product schema (${entityType}) — ${hasPrice ? tableOffers.length + ' offers' : 'tanpa harga'}`, "SUCCESS");
        }
        else {
          log(`⏭️ Skip Service/Product schema (entity: ${entityType})`, "SKIP");
        }

        // ===== INTERNAL LINKS =====
        const internalLinks = generateInternalLinks();
        if (internalLinks.length > 0) {
          graph.push({
            "@type": "ItemList",
            "@id": cleanUrl + "#related-links",
            name: "Halaman Terkait",
            itemListOrder: "Ascending",
            numberOfItems: internalLinks.length,
            itemListElement: internalLinks
          });
          log(`✅ ${internalLinks.length} internal links added`, "SUCCESS");
        }

        const schema = { "@context": "https://schema.org", "@graph": graph };

        let el = document.querySelector("#auto-schema-service");
        if (!el) {
          el = document.createElement("script");
          el.id = "auto-schema-service";
          el.type = "application/ld+json";
          document.head.appendChild(el);
        }
        el.textContent = JSON.stringify(schema, null, 2);

        // ===== EXECUTION SUMMARY =====
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
        log(`  Breadcrumb Ready : ${breadcrumbData ? '✅ SIAP' : '⏰ TIMEOUT'}`, "BREADCRUMB");
        log(`  Parent Source    : ${parentData.source}`, "PARENT");
        log(`  Parent Name      : ${parentData.parentName}`, "PARENT");
        log(`  AED              : ${aed ? '✅ READY' : '❌ FALLBACK'}`, "AED");
        log(`  ─── DETEKSI HARGA ──────────────────────────────`, "PRICE");
        log(`  Is Money Level   : ${MONEY_LEVELS.includes(pageLevel) ? '✅ Ya' : '❌ Tidak'}`, "PRICE");
        log(`  Has Price        : ${hasPrice ? '✅ Ya' : '❌ Tidak'}`, "PRICE");
        log(`  Price Layer      : ${priceResult.layer || 'N/A'}`, "PRICE");
        log(`  Price Source     : ${priceResult.source || 'N/A'}`, "PRICE");
        log(`  Offers Count     : ${tableOffers.length}`, "PRICE");
        log(`  priceValidUntil  : ${priceValidUntil}`, "AED");
        log(`  ─── SCHEMA ─────────────────────────────────────`, "SUCCESS");
        log(`  WebPage Schema   : ✅ (+ isPartOf)`, "SUCCESS");
        log(`  Service Schema   : ${isService ? '✅' : '❌'}`, "SUCCESS");
        log(`  Product Schema   : ${(isService && hasPrice && tableOffers.length > 0) || isProduct ? '✅' : '❌'}`, "SUCCESS");
        log(`  isPartOf SOURCE  : ✅ BREADCRUMB TERDEKAT (SIAP)`, "PARENT");
        log(`  Internal Links   : ${internalLinks.length}`, "SUCCESS");
        log(`  Image Eligible   : ${isEligible ? '✅' : '❌'}`, "IMAGE");
        log(`  Image Source     : ${/^https?:\/\//i.test(pageImage) ? '✅ URL ABSOLUT' : '⚠️ ' + pageImage.substring(0, 40)}`, "IMAGE");
        log(`  Image Size       : 1200×630 (SEO-optimal)`, "IMAGE");
        log(`  Cloudinary       : ${CLOUDINARY_CONFIG.ENABLED ? '✅ ENABLED' : '❌ DISABLED'}`, "IMAGE");
        log(`  Auto Year H1     : ${h1UpdateResult.updated ? `✅ ${h1UpdateResult.from} → ${h1UpdateResult.to}` : `⏭️ ${h1UpdateResult.reason}`}`, "YEAR");
        log(`  Auto Update Konten: ${contentDateUpdated ? '✅ UPDATE' : '⏭️ SKIP'}`, "YEAR");
        log(`  DOM CACHE        : ${CONFIG.CACHE_DOM_ELEMENTS ? '✅ ACTIVE' : '❌ INACTIVE'}`, "CACHE");
        log(`  CORB PREVENTION  : ✅ ACTIVE`, "CORB");
        log(`  PLD-ONLY MODE    : ✅ ACTIVE`, "PLD");
        log("═══════════════════════════════════════════════════", "INFO");
        log("AUTO SCHEMA UNIVERSAL v7.28.7 SELESAI", "SUCCESS");
        
        perf.end('init');

      } catch (error) {
        console.error('❌ Fatal error in init:', error);
        log(`Fatal error: ${error.message}`, "ERROR");
        perf.end('init');
      }
    }, CONFIG.DELAY_MS);
  });

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
