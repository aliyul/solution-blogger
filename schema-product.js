/* ⚡ AutoSchema Hybrid v5.7d-LITE COMPLETE — PRODUCT SCHEMA (DYNAMIC KNOWS ABOUT + HYBRID DATE SYNC)
   ✅ SINKRON dengan PLD v23.9.9a
   ✅ SINKRON dengan AED v17.5.x
   ✅ SINKRON dengan HybridDateModified v10.3a
   ✅ SINKRON dengan Article v8.6f
   ✅ SINKRON dengan Universal v7.36g

   🔥🔥🔥 v5.7d-LITE CHANGELOG 🔥🔥🔥
   ✅ FIX-15: HYBRID DATE SYNC (v10.3a compatible)
              - Wait event `hybridDateFinalReady` max 500ms
              - Baca `AEDMetaDates.dateModifiedFinal` (bukan dateModified)
              - Fallback ke dateModified kalau event tidak fire
              - Effect: TechArticle dateModified = meta tag dateModified

   ✅ PRESERVED dari v5.7c-LITE:
   ✅ FIX-14: Dynamic knowsAbout (SEO 2026)
   ✅ FIX-13: Entity guard — HANYA produk/material
   ✅ FIX-11: Hapus author + dateModified di Answer
   ✅ FIX-12: ItemList Title Case
   ✅ FIX-6: FAQPage content-driven + anti-duplikasi static
   ✅ FIX-7: TechArticle node
   ✅ FIX-8: ItemList internal links (max 8)
   ✅ FIX-9: Author per FAQPage
   ✅ FIX-1 s/d FIX-5: PLD-driven, notes, offers, areaServed
   ✅ Anti-spoofing, @id sync, areaServed 12
   ✅ Variant spec, 4-layer price, insertFigureAfterH1
*/

(function() {
  "use strict";

  if (window.__AUTOSCHEMA_HYBRID_VERSION === "5.7d-lite") {
    console.log("[AutoSchema Hybrid v5.7d-LITE] ⏭️ Already loaded — skip");
    return;
  }
  window.__AUTOSCHEMA_HYBRID_VERSION = "5.7d-lite";

  const IS_MOBILE = /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(navigator.userAgent);
  const IS_SLOW_DEVICE = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
                         (navigator.deviceMemory && navigator.deviceMemory <= 4);
  const URL_DEBUG = window.location.search.indexOf('schema-debug=1') !== -1;
  const DEBUG_MODE = URL_DEBUG || (!IS_MOBILE && !IS_SLOW_DEVICE);

  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && (
      url.includes('raw.githack.com') ||
      url.includes('github.com') ||
      url.includes('gist.github.com')
    )) {
      if (DEBUG_MODE) console.warn('[Hybrid v5.7d-LITE] 🚫 Blocked external fetch:', url);
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
      if (DEBUG_MODE) console.warn('[Hybrid v5.7d-LITE] 🚫 Blocked external XHR:', url);
      throw new Error('Blocked by CORB prevention');
    }
    return originalXHROpen.call(this, method, url, ...rest);
  };

  const CONFIG = {
    DEBUG: DEBUG_MODE,
    DELAY_MS: 200,
    MAX_OFFERS: 8,
    MIN_PRICE: 10000,
    MAX_PRICE: 100000000,
    PLD_TIMEOUT: 1000,
    AED_TIMEOUT: 2000,
    HYBRID_FINAL_TIMEOUT: 500,
    BREADCRUMB_TIMEOUT: 1000,
    BREADCRUMB_READY_TIMEOUT: 1500,
    BREADCRUMB_GENERATED_TIMEOUT: 2000,
    MIN_YEAR_TO_UPDATE: 2026,
    CACHE_DOM_ELEMENTS: true,
    MAX_ELEMENTS_TO_SCAN: 100,
    MAX_INTERNAL_LINKS: 8,

    LOCALBUSINESS_ID: "https://www.betonjayareadymix.com#localbusiness",

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

    CONTACT_POINT: {
      "@type": "ContactPoint",
      "telephone": "+6281299842508",
      "contactType": "customer service",
      "areaServed": "ID",
      "availableLanguage": ["id"]
    },

    KNOWS_ABOUT: [
      "Jasa Bor Sumur", "Jasa Bor Horizontal", "Jasa Bor Manual",
      "Jasa Bor Hidrolik", "Jasa Bor Rotary", "Jasa Bor Auger",
      "Jasa Bor Sumur Dalam", "Jasa Bor Sumur Dangkal",
      "Jasa Pengeboran Tanah", "Jasa Pengeboran Air Tanah",
      "Jasa Bore Pile", "Jasa Strauss Pile", "Jasa Borongan Bore Pile",
      "Jasa Borongan Strauss Pile", "Jasa Tiang Pancang", "Jasa Pondasi Dalam",
      "Jasa Pondasi Bore Pile", "Jasa Pondasi Strauss Pile",
      "Jasa Coring Beton", "Jasa Coring Dinding", "Jasa Coring Lantai",
      "Jasa Coring Plat", "Jasa Coring Kolom", "Jasa Coring Pondasi",
      "Jasa Coring Balok", "Jasa Core Drill", "Jasa Cutting Beton",
      "Jasa Bongkar Beton", "Jasa Injeksi Beton", "Jasa Grouting",
      "Jasa Waterproofing", "Jasa Perbaikan Beton", "Jasa Cor Beton",
      "Jasa Pasang Pagar Panel", "Jasa Pasang Pagar BRC", "Jasa Pasang Pagar Beton",
      "Jasa Pasang Kanopi", "Jasa Pasang Plafon", "Jasa Pasang Plafon Gypsum",
      "Jasa Pasang Plafon PVC", "Jasa Pasang Kusen", "Jasa Pasang Kusen Aluminium",
      "Jasa Pasang Pintu", "Jasa Pasang Jendela", "Jasa Pasang Baja Ringan",
      "Jasa Pasang Rangka Atap", "Jasa Pasang Atap", "Jasa Pasang Paving Block",
      "Jasa Pasang Saluran Precast", "Jasa Pasang U-Ditch", "Jasa Pasang Box Culvert",
      "Jasa Pasang Kansteen", "Jasa Pasang Keramik", "Jasa Pasang Granit",
      "Jasa Pasang Marmer", "Jasa Pasang Kaca", "Jasa Pasang Teralis",
      "Jasa Pasang Railing",
      "Jasa Renovasi Rumah", "Jasa Renovasi Bangunan", "Jasa Bangun Rumah",
      "Jasa Bangun Ruko", "Jasa Bangun Gudang", "Jasa Bangun Pagar",
      "Jasa Plester Dinding", "Jasa Acian", "Jasa Pengecatan",
      "Beton Readymix", "Beton Cor", "Beton K-175", "Beton K-200",
      "Beton K-225", "Beton K-250", "Beton K-300", "Beton K-350",
      "Beton K-400", "Beton K-500", "Beton Mutu Tinggi", "Beton Struktural",
      "Pagar Panel Beton", "Pagar Panel Precast", "Pagar Beton Precast",
      "Saluran Precast", "Saluran U-Ditch", "Saluran Box Culvert",
      "Saluran Drainase Precast", "Kansteen Beton", "Kansteen Precast",
      "Paving Block", "Panel Beton Precast", "Road Barrier Beton",
      "Material Konstruksi", "Material Bangunan", "Besi Beton",
      "Besi Ulir", "Besi Polos", "Besi Wiremesh", "Semen",
      "Pasir Beton", "Pasir Cor", "Agregat", "Split", "Batu Belah",
      "Batu Kali", "Mortar", "Bata Ringan", "Bata Merah", "Batako", "Hebel",
      "Sewa Alat Bor", "Sewa Mesin Coring", "Sewa Alat Berat",
      "Sewa Concrete Pump", "Sewa Vibrator Beton", "Sewa Pompa Beton",
      "Sewa Excavator", "Sewa Crane", "Sewa Scaffolding",
      "Konstruksi", "Jasa Konstruksi", "Kontraktor", "Pondasi",
      "Geoteknik", "Infrastruktur", "Drainase", "Struktur Beton",
      "Teknik Sipil", "Bangunan", "Renovasi", "Pembangunan"
    ]
  };

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

  class ErrorBoundary {
    constructor() { this.fallbacks = new Map(); }
    register(fnName, fallback) { this.fallbacks.set(fnName, fallback); }
    async execute(fnName, fn, ...args) {
      try {
        return await fn(...args);
      } catch (error) {
        const fallback = this.fallbacks.get(fnName);
        if (CONFIG.DEBUG) console.error(`❌ [Hybrid v5.7d] Error in ${fnName}:`, error);
        if (fallback) return typeof fallback === 'function' ? fallback(...args) : fallback;
        return null;
      }
    }
    safeWrap(fn, fnName) {
      return (...args) => this.execute(fnName, fn, ...args);
    }
  }

  const errorBoundary = new ErrorBoundary();

  const perf = {
    marks: {},
    start(label) { if (!CONFIG.DEBUG) return; this.marks[label] = performance.now(); },
    end(label) {
      if (!CONFIG.DEBUG || !this.marks[label]) return 0;
      const duration = performance.now() - this.marks[label];
      console.log(`⏱️ [PERF v5.7d-LITE] ${label}: ${duration.toFixed(2)}ms`);
      delete this.marks[label];
      return duration;
    }
  };

  class DOMCache {
    constructor() { this.cache = new Map(); }
    get(selector, context = document) {
      const key = `${context === document ? 'document' : 'ctx'}:${selector}`;
      if (!this.cache.has(key)) this.cache.set(key, context.querySelector(selector));
      return this.cache.get(key);
    }
    getAll(selector, context = document) {
      const key = `${context === document ? 'document' : 'ctx'}:${selector}:all`;
      if (!this.cache.has(key)) this.cache.set(key, Array.from(context.querySelectorAll(selector)));
      return this.cache.get(key) || [];
    }
    invalidate(selector, context = document) {
      const key = `${context === document ? 'document' : 'ctx'}:${selector}`;
      this.cache.delete(key);
      this.cache.delete(`${key}:all`);
    }
    clear() { this.cache.clear(); }
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
      KNOWS: "🎓", SYNC: "🔗", FAQ: "❓", TECH: "🔬", STATIC: "🗿",
      ARTICLE: "📄", HYBRID: "🕐"
    };
    console.log(`${icons[type] || "📘"} [AutoSchema Hybrid v5.7d-LITE] ${msg}`);
  }

  function getPLDVersion() {
    if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.version) {
      const v = String(window.pageLevelDetectorv22.version);
      if (v.indexOf("23.9.9a") === 0) return { version: v, family: "v23-lite", label: "v23.9.9a-lite" };
      if (v.indexOf("23.9.9") === 0) return { version: v, family: "v23-lite", label: "v23.9.9-lite" };
      if (v.indexOf("23.9.8") === 0) return { version: v, family: "v23-lite", label: "v23.9.8-lite" };
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

  function getPLDSchemaHint() {
    const primary   = (document.body.getAttribute('data-schema-type-primary')   || '').trim();
    const secondary = (document.body.getAttribute('data-schema-type-secondary') || '').trim();
    const note      = (document.body.getAttribute('data-schema-type-note')      || '').trim();
    const hint = { primary, secondary, note };
    log(`🔗 PLD hint → primary=${primary || '(none)'} | secondary=${secondary || '(none)'} | note=${note || '(none)'}`, "SCHEMA");
    return hint;
  }

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
      if (DEBUG_MODE) console.log(`⏸️ [AutoSchema Hybrid v5.7d-LITE] SKIP: level "${pageLevel}" bukan money level`);
      return;
    }

    if (contentFocus === 'INFORMASI') {
      window.__AUTOSCHEMA_HYBRID_SKIP_REASON = 'money-informasi';
      if (DEBUG_MODE) console.log(`⏸️ [AutoSchema Hybrid v5.7d-LITE] SKIP: money level + INFORMASI`);
      return;
    }

    window.__AUTOSCHEMA_HYBRID_SKIP_REASON = null;
    if (CONFIG.DEBUG) {
      console.log(`✅ [AutoSchema Hybrid v5.7d-LITE] LAYAK: level=${pageLevel}, focus=${contentFocus}`);
    }
  })();

  if (window.__AUTOSCHEMA_HYBRID_SKIP_REASON) {
    return;
  }

  function getCleanUrl() {
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const baseUrl = ogUrl || canonical || location.href;
    return baseUrl.replace(/[?&]m=1/, "").replace(/\/$/, "");
  }

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
    if (entityType && entityType !== 'produk' && entityType !== 'material') {
      log(`⏭️ Product SKIP — entity="${entityType}" bukan produk/material`, "SKIP");
      return true;
    }

    const hint = getPLDSchemaHint();

    if (hint.primary || hint.secondary) {
      const wantProduct = (hint.primary === 'Product') || (hint.secondary === 'Product');
      if (!wantProduct) {
        log(`⏭️ Product SKIP — PLD primary=${hint.primary || '(none)'}, secondary=${hint.secondary || '(none)'}`, "SKIP");
        return true;
      }
      log(`✅ Product LAYAK — PLD primary=${hint.primary}, entity=${entityType}`, "PRODUCT");
      return false;
    }

    const bodySkip = document.body.getAttribute('data-product-schema-skip');
    if (bodySkip !== null) {
      return bodySkip === 'true';
    }
    const bodySchemaType = document.body.getAttribute('data-product-schema-type');
    if (bodySchemaType !== null) {
      return bodySchemaType === 'skip' || bodySchemaType === 'none';
    }

    if (entityType) {
      const skipEntities = ['jasa', 'sewa', 'desain', 'artikel'];
      const skip = skipEntities.includes(entityType.toLowerCase());
      if (skip) log(`⏭️ Product SKIP (fallback entity) — entity=${entityType}`, "SKIP");
      return skip;
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

  function getCurrentYear() { return new Date().getFullYear(); }

  function getPageKeywordsForSchema() {
    var h1 = document.querySelector('h1') ? (document.querySelector('h1').innerText || '').toLowerCase() : '';
    var slug = window.location.pathname.replace(/\.html$/, '').replace(/-/g, ' ').split('/').pop().toLowerCase();
    var text = (h1 + ' ' + slug);

    text = text.replace(/\b(jasa|harga|biaya|terbaru|update|di|ke|dari|dan|yang|untuk|dengan|adalah|atau|ini|itu|kami|anda|pada|akan|juga|bisa|dapat|tidak|oleh|terbaik|murah|berkualitas|profesional|indonesia|jakarta|bogor|depok|tangerang|bekasi|jabodetabek)\b/g, ' ');

    return text.split(/\s+/).filter(function(w) { return w.length > 3; });
  }

  function getDynamicKnowsAbout(fullList, pageLevel, entityType) {
    if (['pillar', 'sub-pillar-tipe-1', 'sub-pillar-tipe-2'].indexOf(pageLevel) !== -1) {
      return fullList;
    }

    var keywords = getPageKeywordsForSchema();

    if (keywords.length === 0) {
      return fullList.slice(0, 12);
    }

    var matched = fullList.filter(function(item) {
      var itemLower = item.toLowerCase();
      return keywords.some(function(kw) {
        return itemLower.indexOf(kw) !== -1;
      });
    });

    if (matched.length < 3) {
      var specific = fullList.filter(function(i) {
        return i.toLowerCase().indexOf(entityType) !== -1;
      });
      if (specific.length >= 3) return specific.slice(0, 10);
      return fullList.slice(0, 10);
    }

    return matched.slice(0, 15);
  }

  function hasStaticFAQPageSchema() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const OWN_IDS = ['auto-schema-service', 'auto-schema-product', 'auto-schema'];

    for (const s of scripts) {
      if (s.id && OWN_IDS.includes(s.id)) continue;

      let json;
      try { json = JSON.parse(s.textContent || '{}'); } catch (e) { continue; }

      if (json['@type'] === 'FAQPage') return true;
      if (Array.isArray(json['@type']) && json['@type'].includes('FAQPage')) return true;

      if (Array.isArray(json['@graph'])) {
        for (const node of json['@graph']) {
          if (!node) continue;
          if (node['@type'] === 'FAQPage') return true;
          if (Array.isArray(node['@type']) && node['@type'].includes('FAQPage')) return true;
        }
      }

      if (Array.isArray(json)) {
        for (const node of json) {
          if (!node) continue;
          if (node['@type'] === 'FAQPage') return true;
          if (Array.isArray(node['@type']) && node['@type'].includes('FAQPage')) return true;
        }
      }
    }
    return false;
  }

  function extractFaqFromDOM() {
    perf.start('extractFaqFromDOM');
    const faqs = [];

    const mainContainer = document.querySelector('article, main, .post-body, .entry-content') || document.body;
    const faqItems = mainContainer.querySelectorAll('.faq-item');

    if (faqItems.length > 0) {
      log(`📋 Ditemukan ${faqItems.length} .faq-item`, 'FAQ');
      for (const item of faqItems) {
        const h = item.querySelector('h2, h3, h4');
        if (!h) continue;
        const qText = (h.innerText || '').trim().replace(/\s+/g, ' ');
        if (!qText || qText.length < 8 || qText.length > 200) continue;

        const p = item.querySelector('p');
        if (!p) continue;
        const aText = (p.innerText || '').trim().replace(/\s+/g, ' ').substring(0, 500);
        if (!aText || aText.length < 20) continue;

        faqs.push({
          "@type": "Question",
          "name": qText,
          "acceptedAnswer": { "@type": "Answer", "text": aText }
        });
        if (faqs.length >= 8) break;
      }
      log(`✅ FAQ dari .faq-item: ${faqs.length} pertanyaan`, 'FAQ');
      perf.end('extractFaqFromDOM');
      return faqs;
    }

    const container = document.querySelector('article, main, .post-body') || document.body;
    const headings = container.querySelectorAll('h3, h4');

    for (const h of headings) {
      const qText = (h.innerText || '').trim().replace(/\s+/g, ' ');
      if (!qText || qText.length < 8 || qText.length > 200) continue;

      if (/^\d+\.\s/.test(qText)) continue;
      if (/^section\s+\d/i.test(qText)) continue;

      const isQuestion = /\?$/.test(qText)
        || /^(apa|apakah|bagaimana|gimana|kenapa|mengapa|kapan|dimana|di mana|siapa|berapa|yang mana)\b/i.test(qText);

      if (!isQuestion) continue;

      let answerEl = h.nextElementSibling;
      while (answerEl && !/^(P|UL|OL|DIV|BLOCKQUOTE)$/.test(answerEl.tagName)) {
        answerEl = answerEl.nextElementSibling;
      }
      if (!answerEl) continue;

      const aText = (answerEl.innerText || '').trim().replace(/\s+/g, ' ').substring(0, 500);
      if (!aText || aText.length < 20) continue;

      faqs.push({
        "@type": "Question",
        "name": qText,
        "acceptedAnswer": { "@type": "Answer", "text": aText }
      });
      if (faqs.length >= 8) break;
    }

    log(`❓ FAQ extracted (fallback H3/H4): ${faqs.length} pertanyaan`, "FAQ");
    perf.end('extractFaqFromDOM');
    return faqs;
  }

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
      if (href.includes('{{') || href.includes('%7B') || href.includes('LINK_')) continue;
      links.push(href);
      if (links.length >= CONFIG.MAX_INTERNAL_LINKS) break;
    }
    const unique = [...new Set(links)];
    const limited = unique.slice(0, CONFIG.MAX_INTERNAL_LINKS);

    const result = limited.map((u, i) => {
      const rawName = decodeURIComponent(u.split("/").pop().replace(".html", "").replace(/-/g, " "));
      const titleCase = rawName.replace(/\b\w/g, l => l.toUpperCase());
      return {
        "@type": "ListItem",
        position: i + 1,
        url: u,
        name: titleCase
      };
    });

    log(`🔗 Internal links: ${result.length} (max ${CONFIG.MAX_INTERNAL_LINKS})`, "SYNC");
    perf.end('generateInternalLinks');
    return result;
  }

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

  function getAreaServed() { return CONFIG.AREA_SERVED; }

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

  function getAEDPriceValidUntil() {
    const aed = window.AEDMetaDates;
    if (aed && aed.nextUpdate) return aed.nextUpdate;
    return null;
  }

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

  // 🔥 FIX-15: Wait for Hybrid dateModifiedFinal
  function waitForHybridDateFinal(timeout = CONFIG.HYBRID_FINAL_TIMEOUT) {
    return new Promise((resolve) => {
      if (window.__HYBRID_DATE_FINAL_READY && window.AEDMetaDates?.dateModifiedFinal) {
        log(`✅ Hybrid dateModifiedFinal READY (instant)`, "HYBRID");
        resolve(true);
        return;
      }

      let resolved = false;
      const finish = (ok) => {
        if (resolved) return;
        resolved = true;
        resolve(ok);
      };

      const onReady = () => {
        log(`✅ Hybrid dateModifiedFinal READY (event)`, "HYBRID");
        finish(true);
      };
      window.addEventListener('hybridDateFinalReady', onReady, { once: true });

      const startTime = Date.now();
      const interval = setInterval(() => {
        if (window.__HYBRID_DATE_FINAL_READY && window.AEDMetaDates?.dateModifiedFinal) {
          clearInterval(interval);
          window.removeEventListener('hybridDateFinalReady', onReady);
          log(`✅ Hybrid dateModifiedFinal READY (polling)`, "HYBRID");
          finish(true);
          return;
        }
        if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          window.removeEventListener('hybridDateFinalReady', onReady);
          log(`⏰ Hybrid dateModifiedFinal timeout (${timeout}ms) — fallback`, "WARN");
          finish(false);
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

  async function init() {
    perf.start('init');
    log("═══════════════════════════════════════════════════");
    log("AutoSchema Hybrid v5.7d-LITE — PRODUCT SCHEMA (DYNAMIC KNOWS ABOUT + HYBRID DATE SYNC)");
    log(`DEBUG Mode: ${CONFIG.DEBUG ? 'VERBOSE' : 'SILENT (HP)'}`);
    log("═══════════════════════════════════════════════════");

    try {
      await waitForPLD();

      let parentData = await waitForBreadcrumbGenerated(CONFIG.BREADCRUMB_GENERATED_TIMEOUT);
      if (!parentData || parentData.parentName === 'Home') {
        const currentUrl = getCleanUrl();
        parentData = getParentFromBreadcrumbReady(null, currentUrl);
      }

      const aed = await waitForAEDMetaDates(CONFIG.AED_TIMEOUT);

      // 🔥 FIX-15: Wait for Hybrid offset
      const hybridReady = await waitForHybridDateFinal(CONFIG.HYBRID_FINAL_TIMEOUT);
      if (hybridReady) {
        log(`✅ Hybrid offset READY — pakai dateModifiedFinal`, "HYBRID");
      } else {
        log(`⏰ Hybrid offset timeout — pakai AED dateModified`, "HYBRID");
      }

      // 🔥 FIX-15: Prefer dateModifiedFinal
      const effectiveDateModified = (aed && (aed.dateModifiedFinal || aed.dateModified)) || null;

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
        log(`⏭️ Product schema SKIPPED untuk halaman ini (entity-guarded)`, "SKIP");
        perf.end('init');
        return;
      }

      const hint = getPLDSchemaHint();
      const wantOffers = /(^|,)with-offers($|,)/.test(hint.note) && !/without-offers/.test(hint.note);
      const wantAreaServed = /with-areaServed/.test(hint.note);
      const isProductVariant = /without-offers/.test(hint.note);

      const wantTechArticle = (hint.secondary === 'TechArticle') &&
                              (hint.primary === 'Product' || hint.secondary === 'Product');

      const hasStaticFAQ = hasStaticFAQPageSchema();
      const faqsFromDOM = extractFaqFromDOM();
      const wantFAQ = !hasStaticFAQ && faqsFromDOM.length >= 2;

      log(`🔗 Build config → offers=${wantOffers} | areaServed=${wantAreaServed} | TechArticle=${wantTechArticle} | FAQ=${wantFAQ}`, "SCHEMA");

      if (hasStaticFAQ) {
        log(`⏭️ FAQPage static sudah ada — SKIP FAQPage dinamis`, "STATIC");
      } else {
        log(`❓ FAQ tersedia: ${faqsFromDOM.length} pertanyaan → wantFAQ=${wantFAQ}`, "FAQ");
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
              if (/^https?:\/\//.test(candidateSrc)) imageUrl = candidateSrc;
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

      const offers = (wantOffers && detectedOffers.length > 0)
        ? detectedOffers.map(o => ({
            "@type": "Offer",
            name: sanitizeText(o.name),
            url: currentUrl,
            priceCurrency: "IDR",
            price: o.price,
            ...(priceValidUntil && { priceValidUntil: priceValidUntil }),
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@id": CONFIG.LOCALBUSINESS_ID }
          }))
        : [];

      const dynamicKnows = getDynamicKnowsAbout(CONFIG.KNOWS_ABOUT, pageLevel, entityType);
      log(`🎓 Dynamic knowsAbout: ${dynamicKnows.length} item (dari total ${CONFIG.KNOWS_ABOUT.length})`, "KNOWS");

      const business = {
        "@type": ["LocalBusiness", "GeneralContractor"],
        "@id": CONFIG.LOCALBUSINESS_ID,
        name: "Beton Jaya Readymix",
        url: "https://www.betonjayareadymix.com",
        logo: LOGO_IMAGE,
        telephone: "+6281299842508",
        description: "Beton Jaya Readymix melayani jasa konstruksi terpadu.",
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
        areaServed: areaServed,
        knowsAbout: dynamicKnows,
        contactPoint: CONFIG.CONTACT_POINT
      };

      const product = {
        "@type": "Product",
        "@id": currentUrl + "#product",
        name: productName,
        image: [imageUrl || LOGO_IMAGE],
        description: desc,
        brand: { "@type": "Brand", name: "Beton Jaya Readymix" },
        category: productCategory
      };

      if (wantAreaServed || pageLevel === 'money-child') {
        product.areaServed = areaServed;
      }

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
        publisher: { "@id": CONFIG.LOCALBUSINESS_ID }
      };

      const graph = [webpage, business, product];

      if (wantTechArticle) {
        graph.push({
          "@type": "TechArticle",
          "@id": currentUrl + "#tech-article",
          "headline": productName,
          "description": desc,
          "image": [imageUrl],
          "articleSection": "Spesifikasi Teknis",
          "about": { "@id": currentUrl + "#product" },
          "mainEntityOfPage": { "@id": currentUrl + "#webpage" },
          "author": { "@id": CONFIG.LOCALBUSINESS_ID },
          "publisher": { "@id": CONFIG.LOCALBUSINESS_ID },
          "inLanguage": "id",
          ...(effectiveDateModified && { "dateModified": effectiveDateModified })
        });
        log(`✅ TechArticle node — dateModified=${effectiveDateModified || 'skip'}`, "TECH");
      }

      if (wantFAQ) {
        const faqPage = {
          "@type": "FAQPage",
          "@id": currentUrl + "#faq",
          "author": {
            "@type": "Organization",
            "@id": CONFIG.LOCALBUSINESS_ID,
            "name": "Beton Jaya Readymix"
          },
          "mainEntity": faqsFromDOM.map(f => ({
            "@type": "Question",
            "name": f.name,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": f.acceptedAnswer.text
            }
          }))
        };
        graph.push(faqPage);
        log(`✅ FAQPage node: ${faqsFromDOM.length} pertanyaan`, "FAQ");
      }

      const internalLinks = generateInternalLinks();
      if (internalLinks.length > 0) {
        graph.push({
          "@type": "ItemList",
          "@id": currentUrl + "#related-links",
          "name": "Halaman Terkait",
          "itemListOrder": "Ascending",
          "numberOfItems": internalLinks.length,
          "itemListElement": internalLinks
        });
      }

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

      log("✅ PRODUCT SCHEMA INJECTED (v5.7d-LITE HYBRID DATE SYNC)", "SUCCESS");
      log(`   Schema nodes: ${graph.map(n => n["@type"]).join(' + ')}`, "SCHEMA");
      log(`   Product: ${productName}`, "SUCCESS");
      log(`   Entity guard: entity="${entityType}" ✅`, "FIX");
      log(`   Offers: ${offers.length}`, "PRICE");
      log(`   FAQ: ${hasStaticFAQ ? 'static' : (wantFAQ ? faqsFromDOM.length : 'skip')}`, "FAQ");
      log(`   TechArticle: ${wantTechArticle ? 'CREATED ✅' : 'skip ⏭️'}`, "TECH");
      log(`   TechArticle dateModified: ${effectiveDateModified || '(skip)'}`, "HYBRID");
      log(`   Internal links: ${internalLinks.length}`, "SYNC");
      log("═══════════════════════════════════════════════════");
    } catch (error) {
      console.error('❌ [Hybrid v5.7d] Fatal error in init:', error);
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

  console.log(`✅ [AutoSchema Hybrid v5.7d-LITE] Ready — HYBRID DATE SYNC (mode: ${CONFIG.DEBUG ? 'VERBOSE' : 'SILENT'})`);
  console.log(`🔥 FIX-15: Hybrid dateModifiedFinal sync — wait event 500ms`);
  console.log(`🔥 FIX-14: Dynamic knowsAbout — filter 110 item jadi 5-15 relevan`);
  console.log(`🔥 FIX-13: Entity guard — hanya produk/material`);
  console.log(`🔥 FIX-11: Hapus author/dateModified di Answer`);
  console.log(`🔥 FIX-12: ItemList Title Case`);
  console.log(`🔥 FIX-6 s/d FIX-10: FAQPage, TechArticle, ItemList, author, version`);
  console.log(`✅ PRESERVED: FIX-1 s/d FIX-5 (PLD-driven, notes, offers, areaServed)`);

})();
