/* ⚡ AutoSchema Hybrid v5.5-LITE COMPLETE — PRODUCT SCHEMA
   ✅ SINKRON dengan v7.34-LITE (@id) & v8.4-LITE (@id)
   ✅ SINKRON dengan AED v17.4.3-LITE

   🔥 v5.5-LITE CHANGELOG:
   ✅ ADD-1: Anti-spoofing dateModified (fallback = null)
   ✅ ADD-2: @id sync (#localbusiness tanpa slash)
   ✅ ADD-3: knowsAbout LENGKAP (110 item)
   ✅ ADD-4: areaServed Indonesia + 11 kota
   ✅ ADD-5: contactPoint

   ✅ PRESERVED dari v5.4-LITE:
   ✅ Variant spec extraction (size/weight/sku)
   ✅ Extended properties (productType, material, manufacturer)
   ✅ 4-layer price detection
   ✅ ErrorBoundary + AbortController
   ✅ insertFigureAfterH1() — gambar di bawah H1
   ✅ Early return breadcrumb (P13)
   ✅ Cache getPageLevelFromPLD (P14)
   ✅ Minified production JSON (P16)
*/

(function() {
  "use strict";

  // ═══ GUARD GLOBAL ═══
  if (window.__AUTOSCHEMA_HYBRID_VERSION === "5.5-lite") {
    console.log("[AutoSchema Hybrid v5.5-LITE] ⏭️ Already loaded — skip");
    return;
  }
  window.__AUTOSCHEMA_HYBRID_VERSION = "5.5-lite";

  // ============================================================
  // AUTO-DETECT DEBUG
  // ============================================================
  const IS_MOBILE = /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(navigator.userAgent);
  const IS_SLOW_DEVICE = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
                         (navigator.deviceMemory && navigator.deviceMemory <= 4);
  const URL_DEBUG = window.location.search.indexOf('schema-debug=1') !== -1;
  const DEBUG_MODE = URL_DEBUG || (!IS_MOBILE && !IS_SLOW_DEVICE);

  // ============================================================
  // CORB PREVENTION
  // ============================================================
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && (
      url.includes('raw.githack.com') ||
      url.includes('github.com') ||
      url.includes('gist.github.com')
    )) {
      if (DEBUG_MODE) console.warn('[Hybrid v5.5-LITE] 🚫 Blocked external fetch:', url);
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
      if (DEBUG_MODE) console.warn('[Hybrid v5.5-LITE] 🚫 Blocked external XHR:', url);
      throw new Error('Blocked by CORB prevention');
    }
    return originalXHROpen.call(this, method, url, ...rest);
  };

  // ============================================================
  // 🔥 KONFIGURASI
  // ============================================================
  const CONFIG = {
    DEBUG: DEBUG_MODE,
    DELAY_MS: 200,
    MAX_OFFERS: 8,
    MIN_PRICE: 10000,
    MAX_PRICE: 100000000,
    PLD_TIMEOUT: 1000,
    AED_TIMEOUT: 2000,
    BREADCRUMB_TIMEOUT: 1000,
    BREADCRUMB_READY_TIMEOUT: 1500,
    BREADCRUMB_GENERATED_TIMEOUT: 2000,
    MIN_YEAR_TO_UPDATE: 2026,
    CACHE_DOM_ELEMENTS: true,
    MAX_ELEMENTS_TO_SCAN: 100,
    
    // 🔥 ADD-2: @id SINKRON dengan v7.34 & v8.4 (TANPA SLASH)
    LOCALBUSINESS_ID: "https://www.betonjayareadymix.com#localbusiness",
    
    // 🔥 ADD-4: areaServed — Indonesia + 11 kota prioritas
    AREA_SERVED: [
      { "@type": "Country", "name": "Indonesia" },
      { "@type": "AdministrativeArea", "name": "DKI Jakarta" },
      { "@type": "AdministrativeArea", "name": "Kota Bogor" },
      { "@type": "AdministrativeArea", "name": "Kabupaten Bogor" },
      { "@type": "AdministrativeArea", "name": "Kota Depok" },
      { "@type": "AdministrativeArea", "name": "Kota Tangerang" },
      { "@type": "AdministrativeArea", "name": "Kabupaten Tangerang" },
      { "@type": "AdministrativeArea", "name": "Kota Tangerang Selatan" },
      { "@type": "AdministrativeArea", "name": "Kota Bekasi" },
      { "@type": "AdministrativeArea", "name": "Kabupaten Bekasi" },
      { "@type": "AdministrativeArea", "name": "Kabupaten Karawang" },
      { "@type": "AdministrativeArea", "name": "Kota Surabaya" }
    ],
    
    // 🔥 ADD-5: contactPoint
    CONTACT_POINT: {
      "@type": "ContactPoint",
      "telephone": "+6281299842508",
      "contactType": "customer service",
      "areaServed": "ID",
      "availableLanguage": ["id"]
    },
    
    // 🔥 ADD-3: KNOWS_ABOUT — 110 item LENGKAP (sama dengan v7.34)
    KNOWS_ABOUT: [
      // JASA — PENGEOBORAN
      "Jasa Bor Sumur", "Jasa Bor Horizontal", "Jasa Bor Manual",
      "Jasa Bor Hidrolik", "Jasa Bor Rotary", "Jasa Bor Auger",
      "Jasa Bor Sumur Dalam", "Jasa Bor Sumur Dangkal",
      "Jasa Pengeboran Tanah", "Jasa Pengeboran Air Tanah",
      // JASA — PONDASI
      "Jasa Bore Pile", "Jasa Strauss Pile", "Jasa Borongan Bore Pile",
      "Jasa Borongan Strauss Pile", "Jasa Tiang Pancang", "Jasa Pondasi Dalam",
      "Jasa Pondasi Bore Pile", "Jasa Pondasi Strauss Pile",
      // JASA — CORING & BETON
      "Jasa Coring Beton", "Jasa Coring Dinding", "Jasa Coring Lantai",
      "Jasa Coring Plat", "Jasa Coring Kolom", "Jasa Coring Pondasi",
      "Jasa Coring Balok", "Jasa Core Drill", "Jasa Cutting Beton",
      "Jasa Bongkar Beton", "Jasa Injeksi Beton", "Jasa Grouting",
      "Jasa Waterproofing", "Jasa Perbaikan Beton", "Jasa Cor Beton",
      // JASA — PASANG KONSTRUKSI
      "Jasa Pasang Pagar Panel", "Jasa Pasang Pagar BRC", "Jasa Pasang Pagar Beton",
      "Jasa Pasang Kanopi", "Jasa Pasang Plafon", "Jasa Pasang Plafon Gypsum",
      "Jasa Pasang Plafon PVC", "Jasa Pasang Kusen", "Jasa Pasang Kusen Aluminium",
      "Jasa Pasang Pintu", "Jasa Pasang Jendela", "Jasa Pasang Baja Ringan",
      "Jasa Pasang Rangka Atap", "Jasa Pasang Atap", "Jasa Pasang Paving Block",
      "Jasa Pasang Saluran Precast", "Jasa Pasang U-Ditch", "Jasa Pasang Box Culvert",
      "Jasa Pasang Kansteen", "Jasa Pasang Keramik", "Jasa Pasang Granit",
      "Jasa Pasang Marmer", "Jasa Pasang Kaca", "Jasa Pasang Teralis",
      "Jasa Pasang Railing",
      // JASA — RENOVASI
      "Jasa Renovasi Rumah", "Jasa Renovasi Bangunan", "Jasa Bangun Rumah",
      "Jasa Bangun Ruko", "Jasa Bangun Gudang", "Jasa Bangun Pagar",
      "Jasa Plester Dinding", "Jasa Acian", "Jasa Pengecatan",
      // PRODUK — BETON READYMIX
      "Beton Readymix", "Beton Cor", "Beton K-175", "Beton K-200",
      "Beton K-225", "Beton K-250", "Beton K-300", "Beton K-350",
      "Beton K-400", "Beton K-500", "Beton Mutu Tinggi", "Beton Struktural",
      // PRODUK — PRECAST
      "Pagar Panel Beton", "Pagar Panel Precast", "Pagar Beton Precast",
      "Saluran Precast", "Saluran U-Ditch", "Saluran Box Culvert",
      "Saluran Drainase Precast", "Kansteen Beton", "Kansteen Precast",
      "Paving Block", "Panel Beton Precast", "Road Barrier Beton",
      // MATERIAL
      "Material Konstruksi", "Material Bangunan", "Besi Beton",
      "Besi Ulir", "Besi Polos", "Besi Wiremesh", "Semen",
      "Pasir Beton", "Pasir Cor", "Agregat", "Split", "Batu Belah",
      "Batu Kali", "Mortar", "Bata Ringan", "Bata Merah", "Batako", "Hebel",
      // SEWA
      "Sewa Alat Bor", "Sewa Mesin Coring", "Sewa Alat Berat",
      "Sewa Concrete Pump", "Sewa Vibrator Beton", "Sewa Pompa Beton",
      "Sewa Excavator", "Sewa Crane", "Sewa Scaffolding",
      // BIDANG UMUM
      "Konstruksi", "Jasa Konstruksi", "Kontraktor", "Pondasi",
      "Geoteknik", "Infrastruktur", "Drainase", "Struktur Beton",
      "Teknik Sipil", "Bangunan", "Renovasi", "Pembangunan"
    ]
  };

  // ============================================================
  // CLOUDINARY CONFIG (KEEP dari v5.4)
  // ============================================================
  const CLOUDINARY_CONFIG = {
    ENABLED: true,
    CLOUD_NAME: 'vagzz5sa',
    VERSION: 'v1789109159',
    FORMAT: 'webp',
    FALLBACK_FORMAT: 'png',
    WIDTH: 1200,
    HEIGHT: 630,
    FONT: 'Arial',
    FONT_SIZE: 55,
    BOLD: true,
    GRAVITY: 'g_center',
    MAX_TEXT_LENGTH: 70,
    MAX_CHARS_PER_LINE: 18,
    MAX_LINES: 2,
    QUALITY: 'q_auto:good',
    FORMAT_AUTO: 'f_auto',
    DPR_AUTO: 'dpr_auto',
    LEVEL_FILES: {
      'pillar': 'pillar', 'sub-pillar-tipe-2': 'sp2', 'sub-pillar-tipe-1': 'sp1',
      'money-master': 'mm', 'money-page': 'mp', 'money-child': 'mc',
      'variant': 'variant', 'sub-variant': 'subvariant'
    },
    LEVEL_COLORS: {
      'pillar': 'FFD700', 'sub-pillar-tipe-2': 'FFD700', 'sub-pillar-tipe-1': 'FFD700',
      'money-master': 'FFFFFF', 'money-page': 'FFFFFF', 'money-child': 'FFFFFF',
      'variant': 'FFD700', 'sub-variant': 'FFD700'
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
             `${this.QUALITY},${this.FORMAT_AUTO},${this.DPR_AUTO}/` +
             `${this.VERSION}/${fileName}.${this.FORMAT}`;
    },
    buildFallbackUrl(level, text) {
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
             `${this.VERSION}/${fileName}.${this.FALLBACK_FORMAT}`;
    }
  };

  const LOGO_IMAGE = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";

  // ============================================================
  // ERROR BOUNDARY (KEEP dari v5.4)
  // ============================================================
  class ErrorBoundary {
    constructor() {
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
        if (CONFIG.DEBUG) {
          console.error(`❌ [Hybrid v5.5] Error in ${fnName}:`, error);
        }
        if (fallback) return typeof fallback === 'function'
          ? fallback(...args) : fallback;
        return null;
      }
    }
    safeWrap(fn, fnName) {
      return (...args) => this.execute(fnName, fn, ...args);
    }
  }

  const errorBoundary = new ErrorBoundary();

  // ============================================================
  // PERF MONITORING
  // ============================================================
  const perf = {
    marks: {},
    start(label) {
      if (!CONFIG.DEBUG) return;
      this.marks[label] = performance.now();
    },
    end(label) {
      if (!CONFIG.DEBUG || !this.marks[label]) return 0;
      const duration = performance.now() - this.marks[label];
      console.log(`⏱️ [PERF v5.5-LITE] ${label}: ${duration.toFixed(2)}ms`);
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
    }
    get(selector, context = document) {
      const key = `${context === document ? 'document' : 'ctx'}:${selector}`;
      if (!this.cache.has(key)) {
        this.cache.set(key, context.querySelector(selector));
      }
      return this.cache.get(key);
    }
    getAll(selector, context = document) {
      const key = `${context === document ? 'document' : 'ctx'}:${selector}:all`;
      if (!this.cache.has(key)) {
        this.cache.set(key, Array.from(context.querySelectorAll(selector)));
      }
      return this.cache.get(key) || [];
    }
    invalidate(selector, context = document) {
      const key = `${context === document ? 'document' : 'ctx'}:${selector}`;
      this.cache.delete(key);
      this.cache.delete(`${key}:all`);
    }
    clear() {
      this.cache.clear();
    }
  }

  const domCache = CONFIG.CACHE_DOM_ELEMENTS ? new DOMCache() : null;

  function log(msg, type = "INFO") {
    if (!CONFIG.DEBUG) return;
    const icons = {
      INFO: "📘", WARN: "⚠️", ERROR: "❌", SUCCESS: "✅", SKIP: "⏭️",
      PRODUCT: "🏗️", IMAGE: "📸", YEAR: "📅", FOCUS: "🎯", TABLE: "📊",
      PLD: "🔷", KATEGORI: "🏷️", SCHEMA: "🔗", PARENT: "👪", PERF: "⏱️",
      CACHE: "💾", CORB: "🚫", PRICE: "💰", FLAG: "🚩", EVENT: "📡",
      FIX: "🔧", MATERIAL: "🧱", CTA: "🔘", VERSION: "🔖", WEBP: "🎨",
      KNOWS: "🎓", SYNC: "🔗"
    };
    console.log(`${icons[type] || "📘"} [AutoSchema Hybrid v5.5-LITE] ${msg}`);
  }

  // ============================================================
  // PLD VERSION HELPER
  // ============================================================
  function getPLDVersion() {
    if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.version) {
      const v = String(window.pageLevelDetectorv22.version);
      if (v.indexOf("23.9.7") === 0) return { version: v, family: "v23-lite", label: "v23.9.7-lite" };
      if (v.indexOf("23.") === 0) return { version: v, family: "v23", label: "v23.0.0" };
      if (v.indexOf("22.") === 0) return { version: v, family: "v22", label: "v22.x" };
      return { version: v, family: "unknown", label: "v" + v };
    }
    if (window.pageLevelDetectorv20) return { version: "20.x", family: "v20", label: "v20.x" };
    if (window.pageLevelDetectorv19) return { version: "19.x", family: "v19", label: "v19.x" };
    if (window.pageLevelDetectorV18) return { version: "18.x", family: "v18", label: "v18" };
    if (window.pageLevelDetectorV17) return { version: "17.x", family: "v17", label: "v17" };
    if (window.pageLevelDetector) return { version: "legacy", family: "legacy", label: "legacy" };
    return { version: "none", family: "none", label: "none" };
  }

  // ============================================================
  // EARLY EXIT
  // ============================================================
  (function earlyExitCheck() {
    const pageLevel = document.body && document.body.getAttribute('data-page-level');
    const contentFocus = document.body && document.body.getAttribute('data-content-focus');

    if (!pageLevel) {
      window.__AUTOSCHEMA_HYBRID_SKIP_REASON = null;
      return;
    }

    const MONEY_LEVELS = ['money-master', 'money-page', 'money-child', 'variant', 'sub-variant'];
    const isMoneyLevel = MONEY_LEVELS.indexOf(pageLevel) !== -1;

    if (!isMoneyLevel) {
      window.__AUTOSCHEMA_HYBRID_SKIP_REASON = 'not-money-level';
      console.log(`⏸️ [AutoSchema Hybrid v5.5-LITE] SKIP: level "${pageLevel}" bukan money level`);
      return;
    }

    if (contentFocus === 'INFORMASI') {
      window.__AUTOSCHEMA_HYBRID_SKIP_REASON = 'money-informasi';
      console.log(`⏸️ [AutoSchema Hybrid v5.5-LITE] SKIP: money level + INFORMASI`);
      return;
    }

    window.__AUTOSCHEMA_HYBRID_SKIP_REASON = null;
    if (CONFIG.DEBUG) {
      console.log(`✅ [AutoSchema Hybrid v5.5-LITE] LAYAK: level=${pageLevel}, focus=${contentFocus}`);
    }
  })();

  if (window.__AUTOSCHEMA_HYBRID_SKIP_REASON) {
    return;
  }

  // ============================================================
  // CLEAN URL
  // ============================================================
  function getCleanUrl() {
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const baseUrl = ogUrl || canonical || location.href;
    return baseUrl.replace(/[?&]m=1/, "").replace(/\/$/, "");
  }

  // ============================================================
  // BREADCRUMB HELPERS
  // ============================================================
  function cleanBreadcrumbText(text) {
    if (!text) return '';
    return String(text).replace(/[›»>→←«‹|/]/g, '').replace(/\s+/g, ' ').trim();
  }

  function findMainBreadcrumb() {
    const selectors = [
      '.breadcrumbs', '.breadcrumb', '.nav-trail',
      '[aria-label="breadcrumb"]', '[itemtype*="BreadcrumbList"]',
      '.post-breadcrumb', '.breadcrumb-nav', '.nav-breadcrumb'
    ];
    const candidates = [];
    for (const selector of selectors) {
      try {
        document.querySelectorAll(selector).forEach(el => {
          if (!candidates.includes(el)) candidates.push(el);
        });
      } catch(e) {}
    }
    if (candidates.length === 0) return null;
    for (const el of candidates) {
      const text = (el.innerText || '').toLowerCase();
      if (text.includes('beranda') || text.includes('home')) return el;
    }
    let best = candidates[0];
    let maxLinks = 0;
    for (const el of candidates) {
      const links = el.querySelectorAll('a[href]').length;
      if (links > maxLinks) { maxLinks = links; best = el; }
    }
    return best;
  }

  function waitForBreadcrumbGenerated(timeout = CONFIG.BREADCRUMB_GENERATED_TIMEOUT) {
    const flagReady = document.body.getAttribute('data-breadcrumb-ready');
    if (flagReady === 'true') {
      const parentName = document.body.getAttribute('data-breadcrumb-parent');
      const parentUrl = document.body.getAttribute('data-breadcrumb-parent-url');
      log(`🚩 Breadcrumb READY (flag, instant): parent="${parentName}"`, "FLAG");
      return Promise.resolve({
        parentName: cleanBreadcrumbText(parentName) || 'Home',
        parentUrl: parentUrl || location.origin,
        source: 'breadcrumb-flag-instant',
        allParents: []
      });
    }

    return new Promise((resolve) => {
      const controller = new AbortController();
      let resolved = false;
      let interval = null;

      const cleanup = () => {
        if (interval) { clearInterval(interval); interval = null; }
        controller.abort();
      };

      const onReady = (e) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        const parentName = document.body.getAttribute('data-breadcrumb-parent');
        const parentUrl = document.body.getAttribute('data-breadcrumb-parent-url');
        log(`📡 Breadcrumb GENERATED: parent="${parentName}"`, "EVENT");
        resolve({
          parentName: cleanBreadcrumbText(parentName) || 'Home',
          parentUrl: parentUrl || location.origin,
          source: 'breadcrumb-event',
          allParents: [],
          detail: e?.detail
        });
      };

      window.addEventListener('breadcrumbGenerated', onReady,
        { once: true, signal: controller.signal });

      const startTime = Date.now();
      interval = setInterval(() => {
        if (controller.signal.aborted) return;
        const flag = document.body.getAttribute('data-breadcrumb-ready');
        if (flag === 'true') {
          onReady({ detail: null });
          return;
        }
        if (Date.now() - startTime > timeout) {
          cleanup();
          if (!resolved) {
            resolved = true;
            log(`⏰ Breadcrumb timeout (${timeout}ms)`, "WARN");
            resolve(null);
          }
        }
      }, 200);
    });
  }

  function getParentFromBreadcrumbReady(breadcrumbData, currentUrl) {
    const parentFromFlag = document.body.getAttribute('data-breadcrumb-parent');
    const parentUrlFromFlag = document.body.getAttribute('data-breadcrumb-parent-url');

    if (parentFromFlag && parentUrlFromFlag) {
      const cleanParent = cleanBreadcrumbText(parentFromFlag);
      log(`👪 Parent dari FLAG: "${cleanParent}"`, "PARENT");
      return {
        parentUrl: parentUrlFromFlag,
        parentName: cleanParent || 'Home',
        source: 'breadcrumb-flag',
        allParents: []
      };
    }

    return {
      parentUrl: location.origin,
      parentName: 'Home',
      source: 'fallback-origin',
      allParents: []
    };
  }

  // ============================================================
  // PLD DATA READERS (dengan CACHE)
  // ============================================================
  let _cachedPageLevel = null;
  let _cachedPageLevelResolved = false;

  function getPageLevelFromPLD() {
    if (_cachedPageLevelResolved) return _cachedPageLevel;

    const bodyLevel = document.body.getAttribute('data-page-level');
    if (bodyLevel) {
      _cachedPageLevel = bodyLevel;
      _cachedPageLevelResolved = true;
      log(`📌 Page Level dari body: ${bodyLevel}`, "PLD");
      return bodyLevel;
    }
    if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
      try {
        const result = window.pageLevelDetectorv22.detect();
        if (result) {
          _cachedPageLevel = result;
          _cachedPageLevelResolved = true;
          return result;
        }
      } catch(e) {}
    }
    return null;
  }

  let _cachedEntityType = null;
  let _cachedEntityTypeResolved = false;

  function getEntityTypeFromPLD() {
    if (_cachedEntityTypeResolved) return _cachedEntityType;

    const bodyEntity = document.body.getAttribute('data-entity-type');
    if (bodyEntity) {
      _cachedEntityType = bodyEntity;
      _cachedEntityTypeResolved = true;
      return bodyEntity;
    }
    if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detectEntityType === 'function') {
      try {
        const result = window.pageLevelDetectorv22.detectEntityType();
        if (result) {
          _cachedEntityType = result;
          _cachedEntityTypeResolved = true;
          return result;
        }
      } catch(e) {}
    }
    return null;
  }

  function detectContentFocus() {
    if (window.AEDMetaDates && window.AEDMetaDates.contentFocus) {
      return String(window.AEDMetaDates.contentFocus).toUpperCase();
    }
    const bodyFocus = document.body.getAttribute('data-content-focus');
    if (bodyFocus) return bodyFocus.toUpperCase();
    return null;
  }

  function getKategori() {
    if (window.AEDMetaDates && window.AEDMetaDates.pldKategori) {
      return String(window.AEDMetaDates.pldKategori).toUpperCase();
    }
    const bodyKategori = document.body.getAttribute('data-kategori');
    if (bodyKategori) return bodyKategori.toUpperCase();
    return null;
  }

  function shouldSkipProductSchema(pageLevel, entityType) {
    const bodySkip = document.body.getAttribute('data-product-schema-skip');
    if (bodySkip !== null) return bodySkip === 'true';
    const bodySchemaType = document.body.getAttribute('data-product-schema-type');
    if (bodySchemaType !== null) {
      return bodySchemaType === 'skip' || bodySchemaType === 'none';
    }
    if (entityType) {
      const skipEntities = ['jasa', 'sewa', 'desain', 'artikel'];
      return skipEntities.includes(entityType.toLowerCase());
    }
    return false;
  }

  function isImageEligible(pageLevel) {
    const bodyImageEligible = document.body.getAttribute('data-image-eligible');
    if (bodyImageEligible !== null) return bodyImageEligible === 'true';
    const mandatoryLevels = [
      'money-master', 'money-page', 'money-child',
      'variant', 'sub-variant',
      'pillar', 'sub-pillar-tipe-1', 'sub-pillar-tipe-2'
    ];
    return mandatoryLevels.includes(pageLevel);
  }

  function needYear(level) {
    const bodyNeedYear = document.body.getAttribute('data-need-year');
    if (bodyNeedYear !== null) return bodyNeedYear === 'true';
    const h1Pattern = document.body.getAttribute('data-h1-pattern');
    if (h1Pattern) return h1Pattern === 'with-year';
    const kategori = getKategori();
    return kategori === 'NON-EVERGREEN';
  }

  function getCurrentYear() {
    return new Date().getFullYear();
  }

  // ============================================================
  // 🔥 ADD-3: KNOWS_ABOUT dari config (110 item)
  // ============================================================
  function detectKnowsAbout(entityType) {
    // Prioritas 1: body attribute (kalau ada)
    const bodyKnowsAbout = document.body.getAttribute('data-knows-about');
    if (bodyKnowsAbout) {
      return bodyKnowsAbout.split(',').map(s => s.trim())
        .filter(s => s.length > 0).slice(0, 20);
    }
    // 🔥 ADD-3: Prioritas 2: dari CONFIG.KNOWS_ABOUT (110 item)
    return CONFIG.KNOWS_ABOUT;
  }

  // ============================================================
  // PRICE PARSER
  // ============================================================
  function parsePriceFromText(text) {
    if (!text) return null;
    let clean = String(text).trim();
    let multiplier = 1;
    if (/\d\s*(rb|ribu|k)\b/i.test(clean)) {
      multiplier = 1000;
      clean = clean.replace(/\s*(rb|ribu|k)\b/gi, '');
    }
    if (/\d\s*(jt|juta|m)\b/i.test(clean)) {
      multiplier = 1000000;
      clean = clean.replace(/\s*(jt|juta|m)\b/gi, '');
    }
    clean = clean.replace(/(Rp\.?|IDR|\$|€|¥|£)/gi, '').trim();
    clean = clean.replace(/\s+/g, '');
    if (clean.includes('.') && clean.includes(',')) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else if (clean.includes('.')) {
      const parts = clean.split('.');
      if (parts[parts.length - 1].length === 3) clean = clean.replace(/\./g, '');
    } else if (clean.includes(',')) {
      const parts = clean.split(',');
      if (parts[parts.length - 1].length === 3) clean = clean.replace(/,/g, '');
      else clean = clean.replace(',', '.');
    }
    const match = clean.match(/[\d.]+/);
    if (!match) return null;
    let value = parseFloat(match[0]);
    if (isNaN(value)) return null;
    value *= multiplier;
    if (value < CONFIG.MIN_PRICE || value > CONFIG.MAX_PRICE) return null;
    return Math.round(value);
  }

  function isNotPrice(text, value) {
    if (value < CONFIG.MIN_PRICE || value > CONFIG.MAX_PRICE) return true;

    if (value >= 1900 && value <= 2099) {
      if (!/(harga|biaya|tarif|price|cost)/i.test(text)) return true;
    }

    const cleanText = text.replace(/[\s\-\.]/g, '');
    if (/^(\+?62|0)\d{8,12}$/.test(cleanText)) return true;
    if (/^\d{5}$/.test(text.trim())) return true;
    if (/^\d{16}$/.test(text.trim())) return true;

    if (/^\d{10,16}$/.test(text.trim()) &&
        !/(harga|biaya|tarif|price)/i.test(text)) return true;

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
  // 4-LAYER PRICE DETECTION
  // ============================================================
  const MONEY_LEVELS = ['money-master', 'money-page', 'money-child', 'variant', 'sub-variant'];

  function detectPriceLayered(pageLevel) {
    perf.start('detectPriceLayered');
    if (!MONEY_LEVELS.includes(pageLevel)) {
      perf.end('detectPriceLayered');
      return { hasPrice: false, source: null, value: null, offers: [], reason: 'not-money-level' };
    }
    log(`💰 DETEKSI HARGA BERLAPIS untuk level: ${pageLevel}`, "PRICE");
    const container = document.querySelector('article, main, .post-body, .entry-content') || document.body;

    const l1 = detectPriceFromTableHeader(container);
    if (l1.hasPrice) { perf.end('detectPriceLayered'); return { ...l1, layer: 1 }; }

    const l2 = detectPriceFromElements(container);
    if (l2.hasPrice) { perf.end('detectPriceLayered'); return { ...l2, layer: 2 }; }

    const l3 = detectPriceFromKeywordElements(container);
    if (l3.hasPrice) { perf.end('detectPriceLayered'); return { ...l3, layer: 3 }; }

    const l4 = detectPriceFromLooseRegex(container);
    if (l4.hasPrice) { perf.end('detectPriceLayered'); return { ...l4, layer: 4 }; }

    perf.end('detectPriceLayered');
    return { hasPrice: false, source: null, value: null, offers: [], reason: 'no-price-found' };
  }

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
        hasPrice: true, source: 'element', value: price,
        offers: [{ name: productName, price: price, description: productName }]
      };
    }
    return { hasPrice: false, source: null, value: null, offers: [] };
  }

  function detectPriceFromKeywordElements(container) {
    const candidates = container.querySelectorAll(
      'table td, table th, [class*="price"], [class*="harga"], [class*="biaya"], ' +
      '.price, .harga, .biaya, strong, b, .post-body p'
    );
    const containerText = container.innerText || '';
    if (!/(harga|biaya|tarif|price|cost)/i.test(containerText)) {
      return { hasPrice: false, source: null, value: null, offers: [], reason: 'no-price-keyword' };
    }
    const keywordRegex = /(harga|biaya|tarif|price|cost|rate|mulai dari|per\s+(m|m²|m2|unit|buah|lembar|meter))/i;
    let processed = 0;
    for (const el of candidates) {
      if (processed++ > CONFIG.MAX_ELEMENTS_TO_SCAN) break;
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
        hasPrice: true, source: 'keyword', value: price,
        offers: [{ name: productName, price: price, description: productName }]
      };
    }
    return { hasPrice: false, source: null, value: null, offers: [] };
  }

  function detectPriceFromLooseRegex(container) {
    const containerText = container.innerText || '';
    if (!/(harga|biaya|tarif|price|cost)/i.test(containerText)) {
      return { hasPrice: false, source: null, value: null, offers: [], reason: 'no-price-keyword' };
    }

    const keywordRegex = /(harga|biaya|tarif|price|cost|rate|mulai dari|per\s+(m|m²|m2|unit|buah|lembar|meter))/i;
    const contextEls = [];
    const allEls = container.querySelectorAll(
      'table td, table th, [class*="price"], [class*="harga"], [class*="biaya"], ' +
      '.price, .harga, .biaya, strong, b, .post-body p'
    );
    let processed = 0;
    for (const el of allEls) {
      if (processed++ > CONFIG.MAX_ELEMENTS_TO_SCAN) break;
      const text = el.innerText || '';
      if (!text || text.length > 500) continue;
      if (keywordRegex.test(text)) contextEls.push(el);
    }
    if (contextEls.length === 0) {
      return { hasPrice: false, source: null, value: null, offers: [], reason: 'no-context' };
    }
    for (const el of contextEls) {
      const text = el.innerText;
      const patterns = [
        /Rp\.?\s*([\d.,]+)/gi,
        /([\d.,]+)\s*(rb|ribu|k|jt|juta)\b/gi,
        /\b\d{1,3}(?:[.,]\d{3})+\b/g
      ];
      for (const pat of patterns) {
        const matches = text.match(pat);
        if (!matches) continue;
        for (const m of matches) {
          const price = parsePriceFromText(m);
          if (price && !isNotPrice(text, price)) {
            let name = text.replace(/Rp\.?\s*[\d.,]+\s*(rb|ribu|k|jt|juta)?/gi, '').replace(/^(harga|biaya|tarif)\s*:?\s*/i, '').trim();
            if (name.length > 100) name = name.substring(0, 100);
            if (name.length < 3) name = 'Produk';
            return { hasPrice: true, source: 'regex', value: price, offers: [{ name, price, description: name }] };
          }
        }
      }
    }
    return { hasPrice: false, source: null, value: null, offers: [] };
  }

  // ============================================================
  // IMAGE HELPERS
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
    cleanName = cleanName.replace(/\b\w/g, l => l.toUpperCase());
    cleanName = cleanName.replace(/\s\d+$/, '');
    if (cleanName.length > 55) cleanName = cleanName.substring(0, 52) + '...';
    return cleanName;
  }

  function createImageWithText(pageName, level, year) {
    if (CLOUDINARY_CONFIG.ENABLED && CLOUDINARY_CONFIG.CLOUD_NAME) {
      try {
        const needYearFlag = needYear(level);
        const displayText = needYearFlag ? `${pageName} ${year}` : pageName;
        const imageUrl = CLOUDINARY_CONFIG.buildUrl(level, displayText);
        if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
      } catch(e) {}
    }
    return LOGO_IMAGE;
  }

  function getFallbackImage(pageName, level, year) {
    if (CLOUDINARY_CONFIG.ENABLED && CLOUDINARY_CONFIG.CLOUD_NAME) {
      try {
        const needYearFlag = needYear(level);
        const displayText = needYearFlag ? `${pageName} ${year}` : pageName;
        return CLOUDINARY_CONFIG.buildFallbackUrl(level, displayText);
      } catch(e) {
        return LOGO_IMAGE;
      }
    }
    return LOGO_IMAGE;
  }

  // ============================================================
  // INSERT FIGURE AFTER H1 (KEEP dari v5.4)
  // ============================================================
  function insertFigureAfterH1(container, figure) {
    const isPostBody = container.classList && (
      container.classList.contains('post-body') ||
      container.classList.contains('entry-content')
    );

    if (isPostBody) {
      if (container.firstChild) {
        container.insertBefore(figure, container.firstChild);
      } else {
        container.appendChild(figure);
      }
      log("📸 Figure di AWAL .post-body (DIBAWAH H1 visual) ✅", "FIX");
      return figure;
    }

    const h1Inside = container.querySelector('h1');
    if (h1Inside && h1Inside.parentNode === container) {
      h1Inside.parentNode.insertBefore(figure, h1Inside.nextSibling);
      log("📸 Figure SETELAH H1 (dalam container)", "FIX");
      return figure;
    }

    const h1Global = document.querySelector('h1');
    if (h1Global) {
      const commonParent = h1Global.closest('.post-outer, article, main');
      if (commonParent && commonParent.contains(container)) {
        if (container.firstChild) {
          container.insertBefore(figure, container.firstChild);
        } else {
          container.appendChild(figure);
        }
        log("📸 Figure di firstChild container (H1 di luar, fallback)", "FIX");
        return figure;
      }
    }

    if (container.firstChild) {
      container.insertBefore(figure, container.firstChild);
    } else {
      container.appendChild(figure);
    }
    log("⚠️ Figure di-insert (fallback)", "WARN");
    return figure;
  }

  function fixImagesToFormat1() {
    perf.start('fixImagesToFormat1');
    const pageLevel = getPageLevelFromPLD();
    const currentYear = getCurrentYear();
    const needYearFlag = needYear(pageLevel);
    const pageName = getCleanPageName(pageLevel);
    const displayName = needYearFlag ? pageName + ' ' + currentYear : pageName;

    function applyResponsiveStyles(figure, img) {
      figure.style.padding = '1em 0px';
      figure.style.margin = '20px 0';
      figure.style.textAlign = 'center';
      figure.style.background = '#f8fafc';
      figure.style.borderRadius = '12px';
      figure.style.width = '100%';
      img.style.width = '100%';
      img.style.maxWidth = '1200px';
      img.style.height = 'auto';
      img.style.aspectRatio = '1200/630';
      img.style.objectFit = 'contain';
      img.style.borderRadius = '8px';
      img.style.display = 'block';
      img.style.margin = '0 auto';
      figure.setAttribute('data-auto-figure', 'true');
    }

    let targetImage = null;
    let targetFigure = null;

    const postBodyEl = document.querySelector('.post-body.entry-content, .post-body, .entry-content');
    if (postBodyEl) {
      const existingImg = postBodyEl.querySelector(
        'img:not([src*="logo"]):not([src*="icon"]):not([src*="avatar"])'
      );
      if (existingImg) {
        targetImage = existingImg;
        targetFigure = existingImg.closest('figure');
        log("📸 Reuse image existing di .post-body", "IMAGE");
      }
    }

    if (!targetImage) {
      const h1Element = document.querySelector('h1');
      if (h1Element) {
        const article = h1Element.closest('.post-outer, article, main, section');
        if (article) {
          const siblings = article.children;
          let foundH1 = false;
          let scannedAfterH1 = 0;
          for (let i = 0; i < siblings.length; i++) {
            if (siblings[i] === h1Element) { foundH1 = true; continue; }
            if (foundH1) {
              scannedAfterH1++;
              if (scannedAfterH1 > 5) break;
              const img = siblings[i].querySelector('img:not([src*="logo"]):not([src*="icon"]):not([src*="avatar"])');
              if (img) {
                targetImage = img;
                targetFigure = siblings[i].tagName === 'FIGURE' ? siblings[i] : siblings[i].closest('figure');
                break;
              }
            }
          }
        }
      }
    }
    if (!targetImage) {
      const contentAreas = ['article', 'section', '.post-body', 'main', '.content', '.entry-content'];
      for (const areaSelector of contentAreas) {
        const area = document.querySelector(areaSelector);
        if (area) {
          const img = area.querySelector('img:not([src*="logo"]):not([src*="icon"]):not([src*="avatar"])');
          if (img) { targetImage = img; targetFigure = img.closest('figure'); break; }
        }
      }
    }

    const autoImageUrl = createImageWithText(pageName, pageLevel, currentYear);
    const fallbackImageUrl = getFallbackImage(pageName, pageLevel, currentYear);
    const captionText = '📊 ' + displayName;

    if (targetImage) {
      const img = targetImage;
      const figure = targetFigure || img.closest('figure');
      const currentSrc = img.src || '';
      if (currentSrc.includes('No_Image') || currentSrc.includes('placeholder') || !currentSrc) {
        img.src = autoImageUrl;
        img.setAttribute('onerror',
          `this.onerror=null;this.src='${fallbackImageUrl}';`);
      }
      img.alt = displayName;
      img.title = displayName;
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
      img.setAttribute('data-auto-generated', 'true');
      if (figure && figure.tagName === 'FIGURE') {
        applyResponsiveStyles(figure, img);
      }
      perf.end('fixImagesToFormat1');
      return figure || img;
    }

    const container = 
      document.querySelector('.post-body.entry-content') ||
      document.querySelector('.post-body') ||
      document.querySelector('.entry-content') ||
      document.querySelector('article') ||
      document.querySelector('main') ||
      document.body;

    log(`📦 Container: ${container.className || container.tagName}`, "IMAGE");

    const figure = document.createElement('figure');
    const img = document.createElement('img');
    img.src = autoImageUrl;
    img.setAttribute('onerror',
      `this.onerror=null;this.src='${fallbackImageUrl}';`);
    img.alt = displayName;
    img.title = displayName;
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
    const figcaption = document.createElement('figcaption');
    figcaption.style.color = '#555';
    figcaption.style.fontSize = '14px';
    figcaption.style.marginTop = '10px';
    figcaption.style.textAlign = 'center';
    figcaption.textContent = captionText;
    figure.appendChild(img);
    figure.appendChild(figcaption);
    applyResponsiveStyles(figure, img);
    insertFigureAfterH1(container, figure);
    perf.end('fixImagesToFormat1');
    return figure;
  }

  function sanitizeText(text) {
    if (!text) return "";
    return text.replace(/[\t\n\r]+/g, ' ').replace(/\s{2,}/g, ' ').trim().substring(0, 100);
  }

  // ============================================================
  // 🔥 ADD-4: getAreaServed dari CONFIG
  // ============================================================
  function getAreaServed() {
    return CONFIG.AREA_SERVED;
  }

  function detectProductName() {
    const h1El = document.querySelector('h1');
    const h1 = h1El?.innerText?.trim();
    if (h1 && h1.length < 120 && h1.length > 3) {
      return h1.replace(/\b(20[2-9][0-9])\b/g, '').replace(/\s{2,}/g, ' ').trim();
    }
    const metaTitle = document.querySelector('meta[property="og:title"]')?.content;
    if (metaTitle) return metaTitle.substring(0, 120);
    const docTitle = document.title.replace(/\b(20[2-9][0-9])\b/g, '').trim();
    if (docTitle.length > 3) return docTitle.substring(0, 120);
    return 'Produk Konstruksi';
  }

  function detectProductCategory() {
    const bodyCategory = document.body.getAttribute('data-product-category');
    if (bodyCategory) return bodyCategory;
    const entityType = getEntityTypeFromPLD();
    if (entityType === 'material') return 'BuildingMaterial';
    if (entityType === 'produk') return 'PrecastProduct';
    return 'BuildingMaterial';
  }

  function detectProductMaterial() {
    const bodyMaterial = document.body.getAttribute('data-product-material');
    if (bodyMaterial) return bodyMaterial;
    const category = detectProductCategory();
    const categoryToMaterial = {
      'PrecastProduct': 'Beton Precast',
      'SteelProduct': 'Besi Beton',
      'PavingProduct': 'Paving Beton',
      'BuildingMaterial': 'Material Bangunan'
    };
    return categoryToMaterial[category] || 'Material Bangunan';
  }

  function extractVariantSpec() {
    const content = document.querySelector(".post-body.entry-content, .post-body, article");
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
  // 🔥 ADD-1: getAEDPriceValidUntil — Anti-spoofing
  // ============================================================
  function getAEDPriceValidUntil() {
    const aed = window.AEDMetaDates;
    if (aed && aed.nextUpdate) return aed.nextUpdate;
    // 🔥 ADD-1: JANGAN spoof — return null
    return null;
  }

  // ============================================================
  // 🔥 ADD-1: waitForAEDMetaDates — Anti-spoofing
  // ============================================================
  function waitForAEDMetaDates(timeout = CONFIG.AED_TIMEOUT) {
    return new Promise((resolve) => {
      const controller = new AbortController();
      let intervalId = null;
      let resolved = false;

      const cleanup = () => {
        if (intervalId) { clearInterval(intervalId); intervalId = null; }
        controller.abort();
      };

      if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
        resolve(window.AEDMetaDates);
        return;
      }

      const onReady = () => {
        if (resolved) return;
        resolved = true;
        cleanup();
        if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
          resolve(window.AEDMetaDates);
        } else {
          resolve(null);
        }
      };

      window.addEventListener("detectEvergreenReady", onReady,
        { once: true, signal: controller.signal });

      const startTime = Date.now();
      intervalId = setInterval(() => {
        if (controller.signal.aborted) return;
        if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
          onReady();
          return;
        }
        if (Date.now() - startTime > timeout) {
          if (resolved) return;
          resolved = true;
          cleanup();
          // 🔥 ADD-1: JANGAN spoof — return null
          log("⚠️ AED timeout — dateModified di-skip (anti-spoofing)", "WARN");
          resolve({
            dateModified: null,
            nextUpdate: null,
            type: 'non-evergreen'
          });
        }
      }, 100);
    });
  }

  function waitForPLD() {
    return new Promise((resolve) => {
      if (window.pageLevelDetectorv22 || window.pageLevelDetectorv20 || window.pageLevelDetector) {
        resolve(true);
        return;
      }
      const controller = new AbortController();
      const onReady = () => {
        controller.abort();
        resolve(true);
      };
      window.addEventListener("pageLevelDetectorv22Ready", onReady,
        { once: true, signal: controller.signal });
      setTimeout(() => {
        controller.abort();
        resolve(!!window.pageLevelDetectorv22);
      }, CONFIG.PLD_TIMEOUT);
    });
  }

  // ============================================================
  // 🚀 MAIN INIT v5.5-LITE
  // ============================================================
  async function init() {
    perf.start('init');
    log("═══════════════════════════════════════════════════");
    log("AutoSchema Hybrid v5.5-LITE — PRODUCT SCHEMA (SYNC v7.34 & v8.4)");
    log(`DEBUG Mode: ${CONFIG.DEBUG ? 'VERBOSE' : 'SILENT (HP)'}`);
    log("═══════════════════════════════════════════════════");

    try {
      // Wait PLD
      await waitForPLD();

      // Wait breadcrumb
      let parentData = await waitForBreadcrumbGenerated(CONFIG.BREADCRUMB_GENERATED_TIMEOUT);
      if (!parentData || parentData.parentName === 'Home') {
        const currentUrl = getCleanUrl();
        parentData = getParentFromBreadcrumbReady(null, currentUrl);
      }

      // Wait AED
      const aed = await waitForAEDMetaDates(CONFIG.AED_TIMEOUT);

      // Get data
      const pldVer = getPLDVersion();
      const pageLevel = getPageLevelFromPLD();
      const entityType = getEntityTypeFromPLD();
      const contentFocus = detectContentFocus();
      const kategori = getKategori();

      log(`🔷 PLD Version: ${pldVer.label}`, "VERSION");
      log(`📌 Page Level: ${pageLevel}`, "PLD");
      log(`📌 Entity Type: ${entityType}`, "PLD");
      log(`📌 Content Focus: ${contentFocus || 'NULL'}`, "FOCUS");

      if (shouldSkipProductSchema(pageLevel, entityType)) {
        log(`⏭️ Product schema SKIPPED untuk halaman ini`, "SKIP");
        perf.end('init');
        return;
      }

      const priceResult = detectPriceLayered(pageLevel);
      const detectedOffers = priceResult.offers || [];
      const hasPrice = priceResult.hasPrice;

      if (hasPrice) {
        log(`✅ Harga TERDETEKSI via Layer ${priceResult.layer} (${detectedOffers.length} offers)`, "PRICE");
      } else {
        log(`⏭️ Tidak ada harga terdeteksi`, "PRICE");
      }

      let imageUrl = LOGO_IMAGE;
      const isEligible = isImageEligible(pageLevel);
      if (isEligible) {
        try {
          const fixedFigure = fixImagesToFormat1();
          if (fixedFigure) {
            const img = fixedFigure.querySelector ? fixedFigure.querySelector('img') : fixedFigure;
            if (img) {
              const candidateSrc = img.src || '';
              if (/^https?:\/\//i.test(candidateSrc)) imageUrl = candidateSrc;
            }
          }
        } catch(e) {
          log(`Error processing images: ${e.message}`, "ERROR");
        }
      }

      const currentUrl = getCleanUrl();
      const productName = detectProductName();
      const desc = document.querySelector('meta[name="description"]')?.content?.trim() ||
                   document.querySelector("article p, main p, section p")?.innerText?.trim()?.substring(0, 300) ||
                   `Produk ${productName} berkualitas dari Beton Jaya Readymix`;

      const areaServed = getAreaServed();
      const productCategory = detectProductCategory();
      const priceValidUntil = getAEDPriceValidUntil();

      const offers = detectedOffers.map(o => ({
        "@type": "Offer",
        name: sanitizeText(o.name),
        url: currentUrl,
        priceCurrency: "IDR",
        price: o.price,
        // 🔥 ADD-1: priceValidUntil hanya kalau ada
        ...(priceValidUntil && { priceValidUntil: priceValidUntil }),
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        // 🔥 ADD-2: @id sync
        seller: { "@id": CONFIG.LOCALBUSINESS_ID }
      }));

      // 🔥 ADD-1, ADD-2, ADD-3, ADD-4, ADD-5: Business object LENGKAP
      const business = {
        "@type": ["LocalBusiness", "GeneralContractor"],
        "@id": CONFIG.LOCALBUSINESS_ID,
        name: "Beton Jaya Readymix",
        url: "https://www.betonjayareadymix.com",
        logo: LOGO_IMAGE,
        telephone: "+6281299842508",
        description: "Beton Jaya Readymix melayani jasa konstruksi terpadu: pengeboran, coring beton, pondasi, beton readymix, pagar panel, saluran precast, material, sewa alat, dan jasa pasang konstruksi di seluruh Indonesia.",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Bogor",
          addressRegion: "Jawa Barat",
          addressCountry: "ID"
        },
        openingHours: "Mo-Sa 08:00-17:00",
        sameAs: [
          "https://www.facebook.com/betonjayareadymix",
          "https://www.instagram.com/betonjayareadymix"
        ],
        // 🔥 ADD-4: areaServed Indonesia + kota
        areaServed: areaServed,
        // 🔥 ADD-3: knowsAbout LENGKAP (110 item)
        knowsAbout: detectKnowsAbout(entityType),
        // 🔥 ADD-5: contactPoint
        contactPoint: CONFIG.CONTACT_POINT
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
        const prices = offers.map(o => o.price);
        const lowPrice = Math.min(...prices);
        const highPrice = Math.max(...prices);
        product.offers = {
          "@type": "AggregateOffer",
          lowPrice: lowPrice,
          highPrice: highPrice,
          offerCount: offers.length,
          priceCurrency: "IDR",
          // 🔥 ADD-1: hanya kalau ada
          ...(priceValidUntil && { priceValidUntil: priceValidUntil }),
          availability: "https://schema.org/InStock",
          offers: offers
        };
      }

      if (pageLevel === 'variant' || pageLevel === 'sub-variant') {
        product.productType = pageLevel === 'variant' ? "Variant" : "Sub-Variant";
        product.material = detectProductMaterial();
        product.manufacturer = { "@type": "Organization", name: "Beton Jaya Readymix" };

        const sizeEl = document.querySelector('[data-product-size]');
        if (sizeEl) product.size = sizeEl.getAttribute('data-product-size');

        const weightEl = document.querySelector('[data-product-weight]');
        if (weightEl) {
          product.weight = {
            "@type": "QuantitativeValue",
            value: weightEl.getAttribute('data-product-weight'),
            unitCode: "KGM"
          };
        }

        const skuMatch = window.location.pathname.match(/-([a-z0-9]+)\.html$/);
        if (skuMatch) product.sku = skuMatch[1].toUpperCase();

        const variantSpec = extractVariantSpec();
        if (variantSpec) product.variant = variantSpec;
      }

      const parentUrls = [{
        "@type": "WebPage",
        "@id": parentData.parentUrl,
        name: parentData.parentName
      }];

      const webpage = {
        "@type": "WebPage",
        "@id": currentUrl + "#webpage",
        url: currentUrl,
        name: productName,
        description: desc,
        image: imageUrl,
        mainEntity: { "@id": product["@id"] },
        isPartOf: parentUrls,
        // 🔥 ADD-2: publisher sync
        publisher: { "@id": CONFIG.LOCALBUSINESS_ID }
      };

      const graph = [webpage, business, product];

      let existingScript = document.querySelector("#auto-schema-product");
      if (!existingScript) {
        existingScript = document.createElement("script");
        existingScript.type = "application/ld+json";
        existingScript.id = "auto-schema-product";
        document.head.appendChild(existingScript);
      }

      const indent = CONFIG.DEBUG ? 2 : 0;
      existingScript.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@graph": graph
      }, null, indent);

      log("✅ PRODUCT SCHEMA INJECTED (v5.5-LITE)", "SUCCESS");
      log(`   Product: ${productName}`, "SUCCESS");
      log(`   Offers: ${offers.length}`, "PRICE");
      log(`   knowsAbout: ${business.knowsAbout.length} item`, "KNOWS");
      log(`   areaServed: ${areaServed.length} area`, "SYNC");
      log(`   Parent: ${parentData.parentName}`, "PARENT");
      log("═══════════════════════════════════════════════════");
    } catch (error) {
      console.error('❌ [Hybrid v5.5] Fatal error in init:', error);
      log(`Fatal error: ${error.message}`, "ERROR");
    } finally {
      perf.end('init');
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(init, CONFIG.DELAY_MS);
    }, { once: true });
  } else {
    setTimeout(init, CONFIG.DELAY_MS);
  }

  function cleanup() {
    if (domCache) domCache.clear();
  }

  window.addEventListener('beforeunload', cleanup);

  console.log(`✅ [AutoSchema Hybrid v5.5-LITE] Ready (mode: ${CONFIG.DEBUG ? 'VERBOSE' : 'SILENT'})`);

})();
