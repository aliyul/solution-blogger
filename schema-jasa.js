/* ⚡ AUTO SCHEMA UNIVERSAL v7.36e-LITE COMPLETE — FINAL
   ✅ SINKRON dengan PLD v23.9.9 (entity-aware detectSchemaType)
   ✅ SINKRON dengan AED v17.4.8 (TIERED + CONTENT-AWARE)
   ✅ SINKRON dengan Breadcrumb v12.3.6
   ✅ SINKRON dengan Auto Schema Article v8.6b
   ✅ SINKRON dengan Hybrid Product v5.7a

   🔥🔥🔥 v7.36e-LITE CHANGELOG 🔥🔥🔥
   ✅ FIX-21: Hapus author + dateModified di Answer (konsisten AED v17.4.8)
              - AED v17.4.8 selalu hapus author/dateModified di Answer
              - Sebelumnya: Universal tambah → AED hapus (sia-sia)
              - Sesudah: Universal tidak tambah → AED tidak perlu hapus
              - Efek: Log AED bersih, tidak ada "illegal properties" warning
   ✅ FIX-22: ItemList Title Case (nama internal links)
              - Sebelumnya: "daftar jasa pengeboran" (lowercase)
              - Sesudah: "Daftar Jasa Pengeboran" (Title Case)
              - Efek: Lebih rapi di Google & AI Search
   ✅ Version bump resmi v7.36d → v7.36e (6 tempat)

   ✅ PRESERVED dari v7.36d-LITE:
   ✅ FIX-20: Detect static FAQPage — anti-duplikasi
   ✅ FIX-17: TechArticle node (secondary untuk variant/sub-variant)
   ✅ FIX-18: Log verifikasi TechArticle
   ✅ FIX-16: Scope .faq-item ke konten utama
   ✅ FIX-15: author per FAQPage (bukan per Answer)
   ✅ FIX-14: FAQ content-driven
   ✅ FIX-13: KEEP Service + Product + LocalBusiness + WebPage + ItemList
   ✅ FIX-12: KEEP CreativeWork
   ✅ FIX-11: KEEP FAQPage
   ✅ FIX-10: REMOVE Article node (ditangani v8.6b)
   ✅ FIX-9: CreativeWork node
   ✅ FIX-8: FAQPage extraction dari DOM
   ✅ FIX-6: Respect data-schema-type-note
   ✅ FIX-5: PLD-DRIVEN schema decision
   ✅ FIX-4: Support AED v17.4.7+
   ✅ FIX-3: Guard anti-race-condition AED
   ✅ FIX-2: ItemList max 8
   ✅ FIX-1: extractServiceType() — support – — - | : &
   ✅ Anti-spoofing dateModified
   ✅ KNOWS_ABOUT — 110 item
   ✅ areaServed — Indonesia + 11 kota
   ✅ contactPoint di LocalBusiness
   ✅ 4-layer price detection
   ✅ Breadcrumb DOM fallback
   ✅ ErrorBoundary + DOMCache
   ✅ Responsive image styles + Cloudinary WebP

   📌 PEMBAGIAN TANGGUNG JAWAB:
   - v7.36e: LocalBusiness + WebPage + Service + Product + FAQPage + TechArticle + CreativeWork + ItemList
   - v8.6b : Article (PLD primary = Article)
   - v5.7a : Product fallback (halaman product yang PLD tidak tandai)

   Status: FINAL v7.36e — PLD-DRIVEN, SEO 2026, NO-DUPLICATE, AI-READY
*/

(function() {
  "use strict";

  // ═══ GUARD GLOBAL ═══
  if (window.__AUTO_SCHEMA_VERSION === "7.36e-lite") {
    console.log("[AutoSchema v7.36e-LITE] ⏭️ Already loaded — skip");
    return;
  }
  window.__AUTO_SCHEMA_VERSION = "7.36e-lite";

  // ============================================================
  // 🔥 AUTO-DETECT DEBUG MODE
  // ============================================================
  const IS_MOBILE = /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(navigator.userAgent);
  const IS_SLOW_DEVICE = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
                         (navigator.deviceMemory && navigator.deviceMemory <= 4);
  const URL_DEBUG = window.location.search.indexOf('schema-debug=1') !== -1;
  const DEBUG_MODE = URL_DEBUG || (!IS_MOBILE && !IS_SLOW_DEVICE);

  // ============================================================
  // 🔥 KONFIGURASI
  // ============================================================
  const CONFIG = {
    DEBUG: DEBUG_MODE,
    DELAY_MS: 200,
    MAX_OFFERS: 8,
    MIN_PRICE: 10000,
    MAX_PRICE: 100000000,
    SKIP_WORD_COUNT: 300,
    PLD_TIMEOUT: 1000,
    AED_TIMEOUT: 2000,
    BREADCRUMB_TIMEOUT: 1000,
    BREADCRUMB_READY_TIMEOUT: 1500,
    BREADCRUMB_GENERATED_TIMEOUT: 2000,
    MIN_YEAR_TO_UPDATE: 2026,
    CACHE_DOM_ELEMENTS: true,
    BATCH_DOM_UPDATES: true,
    MAX_ELEMENTS_TO_SCAN: 100,
    MAX_INTERNAL_LINKS: 8,

    // 🔥 SYNC: @id reference
    LOCALBUSINESS_ID: "https://www.betonjayareadymix.com#localbusiness",

    // 🔥 areaServed
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

    // 🔥 KNOWS_ABOUT — 110 item
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
    ],

    CONTACT_POINT: {
      "@type": "ContactPoint",
      "telephone": "+6281299842508",
      "contactType": "customer service",
      "areaServed": "ID",
      "availableLanguage": ["id"]
    }
  };

  // ============================================================
  // LOGGING
  // ============================================================
  function log(msg, type = "INFO") {
    if (!CONFIG.DEBUG) return;
    const icons = {
      INFO: "📘", WARN: "⚠️", ERROR: "❌", SUCCESS: "✅", SKIP: "⏭️",
      PRODUCT: "🏗️", IMAGE: "📸", YEAR: "📅", FOCUS: "🎯", TABLE: "📊",
      H1: "📝", PRIORITY: "🔴", STOP: "🛑", BREADCRUMB: "🍞", AED: "⚡",
      PERF: "⏱️", CACHE: "💾", CORB: "🚫", COMMERCIAL: "🛒",
      PLD: "🔷", KATEGORI: "🏷️", SCHEMA: "🔗", PARENT: "👪", PRICE: "💰",
      FLAG: "🚩", EVENT: "📡", FIX: "🔧", MATERIAL: "🧱", PHASE46: "🆕",
      WEBP: "🎨", KNOWS: "🎓", SYNC: "🔗", RACE: "⚡", FAQ: "❓",
      ARTICLE: "📄", TECH: "🔬", STATIC: "🗿"
    };
    console.log(`${icons[type] || "📘"} [Schema v7.36e-LITE] ${msg}`);
  }

  log(`🚀 Auto Schema v7.36e-LITE loaded (mode: ${CONFIG.DEBUG ? 'VERBOSE' : 'SILENT'})`, "INFO");
  log(`🎓 KNOWS_ABOUT: ${CONFIG.KNOWS_ABOUT.length} item`, "KNOWS");
  log(`🔗 MAX_INTERNAL_LINKS: ${CONFIG.MAX_INTERNAL_LINKS}`, "SYNC");

  // ============================================================
  // EARLY EXIT
  // ============================================================
  (function earlyExitCheck() {
    const currentPath = window.location.pathname;
    const isHomepage = currentPath === '/' || currentPath === '/index.html' || currentPath === '';
    const isStaticPage = /^\/(p|pages)\/(hubungi-kami|portofolio|disclaimer|privacy-policy|terms-of-service|useful-links|about|sitemap)/i.test(currentPath);

    if (isHomepage) {
      log('⏭️ Homepage — skip', 'SKIP');
      window.__SCHEMA_SKIP_REASON = 'homepage';
      return;
    }
    if (isStaticPage) {
      log('⏭️ Static page — skip', 'SKIP');
      window.__SCHEMA_SKIP_REASON = 'static-page';
      return;
    }
    window.__SCHEMA_SKIP_REASON = null;
  })();

  if (window.__SCHEMA_SKIP_REASON) {
    console.log(`⏸️ [AutoSchema v7.36e-LITE] Skip (${window.__SCHEMA_SKIP_REASON})`);
    return;
  }

  // ============================================================
  // CORB PREVENTION
  // ============================================================
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && (url.includes('raw.githack.com') || url.includes('github.com') || url.includes('gist.github.com'))) {
      log(`🚫 Blocked external fetch: ${url}`, "CORB");
      return Promise.reject(new Error('Blocked by CORB prevention'));
    }
    return originalFetch.apply(this, args);
  };

  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    if (typeof url === 'string' && (url.includes('raw.githack.com') || url.includes('github.com') || url.includes('gist.github.com'))) {
      log(`🚫 Blocked external XHR: ${url}`, "CORB");
      throw new Error('Blocked by CORB prevention');
    }
    return originalXHROpen.call(this, method, url, ...rest);
  };

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

  // ============================================================
  // ERROR BOUNDARY
  // ============================================================
  class ErrorBoundary {
    constructor() { this.errors = []; this.fallbacks = new Map(); }
    register(fnName, fallback) { this.fallbacks.set(fnName, fallback); }
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

  // ============================================================
  // CLOUDINARY CONFIG
  // ============================================================
  const CLOUDINARY_CONFIG = {
    ENABLED: true,
    CLOUD_NAME: 'vagzz5sa',
    VERSION: 'v1789109159',
    FORMAT: 'webp',
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
    FALLBACK_FORMAT: 'png',
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
    get baseUrl() { return `https://res.cloudinary.com/${this.CLOUD_NAME}/image/upload/`; },
    calculateFontSize(textLength) {
      if (textLength <= 10) return 55; if (textLength <= 12) return 50;
      if (textLength <= 15) return 45; if (textLength <= 18) return 40;
      if (textLength <= 22) return 35; if (textLength <= 26) return 30;
      if (textLength <= 30) return 28; if (textLength <= 35) return 26;
      if (textLength <= 40) return 24; if (textLength <= 50) return 22;
      return 20;
    },
    wrapText(text, maxCharsPerLine = this.MAX_CHARS_PER_LINE) {
      if (text.length <= maxCharsPerLine) return text;
      const words = text.split(' ');
      const lines = []; let currentLine = '';
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
      return `${this.baseUrl}e_colorize:100,co_rgb:${textColor},` +
             `l_text:${this.FONT}_${fontSize}${weight}:${encodedText},${this.GRAVITY},` +
             `c_fit,w_${this.WIDTH},h_${this.HEIGHT}/${this.QUALITY},${this.FORMAT_AUTO},${this.DPR_AUTO}/` +
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
      return `${this.baseUrl}e_colorize:100,co_rgb:${textColor},` +
             `l_text:${this.FONT}_${fontSize}${weight}:${encodedText},${this.GRAVITY},` +
             `c_fit,w_${this.WIDTH},h_${this.HEIGHT}/` +
             `${this.VERSION}/${fileName}.${this.FALLBACK_FORMAT}`;
    }
  };

  // ============================================================
  // IMAGE CONFIG
  // ============================================================
  const IMAGE_CONFIG = {
    FALLBACK_IMAGE: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiWWAP6ezcmzgbGtHmmJqBjYkbsdQBrwCeC9pl9ocjL-VSQYftirdvXAF1T-eg_QMSqu1WiFidDc9fnChi0yaOqi0Dd6EVMy4ZX3P7vccY4XJMu-7k2TGVd5TS1wIG5jgIm_6beYVb2zuNQGS7eBuODJqd20c4ckvd0-HaEqGf4W-B_750I91wi9IhqqnI/s320/No_Image_Available.jpg",
    LOGO_IMAGE: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png"
  };

  // ============================================================
  // HELPER: PLD Version
  // ============================================================
  function getPLDVersion() {
    if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.version) {
      var v = String(window.pageLevelDetectorv22.version);
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

  // ============================================================
  // BREADCRUMB HELPERS
  // ============================================================
  function cleanBreadcrumbText(text) {
    if (!text) return '';
    return String(text).replace(/[›»>→←«‹|/]/g, '').replace(/\s+/g, ' ').trim();
  }

  function findMainBreadcrumb() {
    const breadcrumbSelectors = [
      '.breadcrumbs', '.breadcrumb', '.nav-trail',
      '[aria-label="breadcrumb"]', '[itemtype*="BreadcrumbList"]',
      '.post-breadcrumb', '.breadcrumb-nav', '.nav-breadcrumb'
    ];
    const candidates = [];
    for (const selector of breadcrumbSelectors) {
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
    return new Promise((resolve) => {
      const flagReady = document.body.getAttribute('data-breadcrumb-ready');
      if (flagReady === 'true') {
        const parentName = document.body.getAttribute('data-breadcrumb-parent');
        const parentUrl = document.body.getAttribute('data-breadcrumb-parent-url');
        log(`🚩 Breadcrumb READY (flag): "${parentName}"`, "FLAG");
        resolve({
          parentName: cleanBreadcrumbText(parentName) || 'Home',
          parentUrl: parentUrl || location.origin,
          source: 'breadcrumb-shared-flag'
        });
        return;
      }
      let resolved = false;
      const onReady = (e) => {
        if (resolved) return;
        resolved = true;
        const parentName = document.body.getAttribute('data-breadcrumb-parent');
        const parentUrl = document.body.getAttribute('data-breadcrumb-parent-url');
        log(`📡 Breadcrumb GENERATED (event): "${parentName}"`, "EVENT");
        resolve({
          parentName: cleanBreadcrumbText(parentName) || 'Home',
          parentUrl: parentUrl || location.origin,
          source: 'breadcrumb-shared-event'
        });
      };
      window.addEventListener('breadcrumbGenerated', onReady, { once: true });
      const startTime = Date.now();
      const interval = setInterval(() => {
        const flag = document.body.getAttribute('data-breadcrumb-ready');
        if (flag === 'true') {
          clearInterval(interval);
          onReady({ detail: null });
          return;
        }
        if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          window.removeEventListener('breadcrumbGenerated', onReady);
          if (!resolved) {
            resolved = true;
            log(`⏰ Breadcrumb GENERATED timeout (${timeout}ms)`, "WARN");
            resolve(null);
          }
        }
      }, 200);
    });
  }

  function waitForBreadcrumbReady(timeout = CONFIG.BREADCRUMB_READY_TIMEOUT) {
    return new Promise((resolve) => {
      perf.start('waitForBreadcrumbReady');
      const startTime = Date.now();
      const currentUrlClean = location.href.replace(/[?&]m=1/, '').replace(/\/$/, '');

      function checkBreadcrumbReady() {
        const breadcrumbEl = findMainBreadcrumb();
        if (!breadcrumbEl) {
          if (Date.now() - startTime > timeout) {
            log(`⏰ Breadcrumb timeout — tidak ditemukan`, "WARN");
            perf.end('waitForBreadcrumbReady');
            resolve(null);
            return;
          }
          setTimeout(checkBreadcrumbReady, 200);
          return;
        }
        const links = breadcrumbEl.querySelectorAll('a[href]');
        const items = breadcrumbEl.querySelectorAll('[itemprop="itemListElement"]');
        const hasSchema = breadcrumbEl.querySelector('[itemtype*="BreadcrumbList"]') || breadcrumbEl.hasAttribute('itemtype');
        const fullText = (breadcrumbEl.innerText || '').toLowerCase();
        const hasHome = /(beranda|home)/i.test(fullText);
        if (!hasHome) {
          if (Date.now() - startTime > timeout) {
            perf.end('waitForBreadcrumbReady');
            resolve(null);
            return;
          }
          setTimeout(checkBreadcrumbReady, 200);
          return;
        }
        let isFinal = false;
        if (links.length > 0) {
          const lastLink = links[links.length - 1];
          const lastHref = (lastLink.href || '').replace(/[?&]m=1/, '').replace(/\/$/, '');
          if (lastHref === currentUrlClean) isFinal = true;
        }
        if (!isFinal) {
          const h1Text = (document.querySelector('h1')?.innerText || '').toLowerCase().trim();
          const parts = fullText.split(/[›»>]/).map(p => p.trim()).filter(Boolean);
          const lastPart = parts[parts.length - 1] || '';
          if (h1Text && lastPart && (h1Text.includes(lastPart.substring(0, 20)) || lastPart.includes(h1Text.substring(0, 20)))) {
            isFinal = true;
          }
        }
        const isReady = ((links.length >= 2) || (items.length >= 2 && hasSchema)) && isFinal;
        if (isReady) {
          log(`✅ Breadcrumb SIAP & FINAL: ${links.length} links`, "BREADCRUMB");
          perf.end('waitForBreadcrumbReady');
          resolve({
            element: breadcrumbEl,
            links: Array.from(links),
            items: Array.from(items),
            linkCount: links.length,
            itemCount: items.length,
            hasSchema: hasSchema,
            isFinal: true
          });
          return;
        }
        if (Date.now() - startTime > timeout) {
          perf.end('waitForBreadcrumbReady');
          resolve(null);
          return;
        }
        setTimeout(checkBreadcrumbReady, 200);
      }
      checkBreadcrumbReady();
    });
  }

  function getParentFromBreadcrumbReady(breadcrumbData, currentUrl) {
    perf.start('getParentFromBreadcrumbReady');
    const parentFromFlag = document.body.getAttribute('data-breadcrumb-parent');
    const parentUrlFromFlag = document.body.getAttribute('data-breadcrumb-parent-url');
    if (parentFromFlag && parentUrlFromFlag) {
      const cleanParent = cleanBreadcrumbText(parentFromFlag);
      log(`👪 Parent dari FLAG: "${cleanParent}"`, "PARENT");
      perf.end('getParentFromBreadcrumbReady');
      return {
        parentUrl: parentUrlFromFlag,
        parentName: cleanParent || 'Home',
        source: 'breadcrumb-shared-flag',
        allParents: []
      };
    }
    if (!breadcrumbData || !breadcrumbData.links || breadcrumbData.links.length === 0) {
      log('⚠️ Breadcrumb tidak valid — fallback ke origin', "WARN");
      perf.end('getParentFromBreadcrumbReady');
      return { parentUrl: location.origin, parentName: 'Home', source: 'fallback-origin', allParents: [] };
    }
    const links = breadcrumbData.links;
    const currentUrlClean = currentUrl.replace(/[?&]m=1/, '').replace(/\/$/, '');
    const validParents = links.filter(link => {
      const href = (link.href || '').replace(/\/$/, '');
      const text = cleanBreadcrumbText(link.innerText || '');
      if (href === currentUrlClean) return false;
      if (href.includes(currentUrlClean)) return false;
      if (currentUrlClean.includes(href)) return false;
      if (!href || !text) return false;
      if (text.length < 2) return false;
      if (/^(beranda|home)$/i.test(text)) return false;
      return true;
    });
    if (validParents.length === 0) {
      perf.end('getParentFromBreadcrumbReady');
      return { parentUrl: location.origin, parentName: 'Home', source: 'fallback-origin', allParents: [] };
    }
    const parentLink = validParents[validParents.length - 1];
    const parentUrl = parentLink.href || '';
    const parentName = cleanBreadcrumbText(parentLink.innerText || '') || 'Parent Page';
    log(`👪 Parent terdekat: "${parentName}" → ${parentUrl}`, "PARENT");
    perf.end('getParentFromBreadcrumbReady');
    return {
      parentUrl: parentUrl,
      parentName: parentName,
      source: 'breadcrumb-dom',
      allParents: validParents.map(l => ({ url: l.href, name: cleanBreadcrumbText(l.innerText || '') }))
    };
  }

  // ============================================================
  // PLD DATA READERS
  // ============================================================
  function getPageLevelFromPLD() {
    perf.start('getPageLevelFromPLD');
    const bodyLevel = document.body.getAttribute('data-page-level');
    if (bodyLevel) { perf.end('getPageLevelFromPLD'); return bodyLevel; }
    if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.detect) {
      try {
        const level = window.pageLevelDetectorv22.detect();
        if (level) { perf.end('getPageLevelFromPLD'); return level; }
      } catch(e) {}
    }
    perf.end('getPageLevelFromPLD');
    return null;
  }

  function getEntityTypeFromPLD() {
    perf.start('getEntityTypeFromPLD');
    const bodyEntity = document.body.getAttribute('data-entity-type');
    if (bodyEntity) { perf.end('getEntityTypeFromPLD'); return bodyEntity; }
    if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.detectEntityType) {
      try {
        const entityType = window.pageLevelDetectorv22.detectEntityType();
        if (entityType) { perf.end('getEntityTypeFromPLD'); return entityType; }
      } catch(e) {}
    }
    perf.end('getEntityTypeFromPLD');
    return null;
  }

  function detectContentFocus() {
    perf.start('detectContentFocus');
    if (window.AEDMetaDates && window.AEDMetaDates.contentFocus) {
      perf.end('detectContentFocus');
      return String(window.AEDMetaDates.contentFocus).toUpperCase();
    }
    const bodyFocus = document.body.getAttribute('data-content-focus');
    if (bodyFocus) { perf.end('detectContentFocus'); return bodyFocus.toUpperCase(); }
    perf.end('detectContentFocus');
    return null;
  }

  function getKategori() {
    perf.start('getKategori');
    if (window.AEDMetaDates && window.AEDMetaDates.pldKategori) {
      perf.end('getKategori');
      return String(window.AEDMetaDates.pldKategori).toUpperCase();
    }
    const bodyKategori = document.body.getAttribute('data-kategori');
    if (bodyKategori) { perf.end('getKategori'); return bodyKategori.toUpperCase(); }
    perf.end('getKategori');
    return null;
  }

  function getCtaType() {
    perf.start('getCtaType');
    const bodyCtaType = document.body.getAttribute('data-cta-type');
    const bodyCtaText = document.body.getAttribute('data-cta-text');
    if (bodyCtaType) {
      const result = { type: bodyCtaType, text: bodyCtaText || bodyCtaType };
      log(`🔘 CTA: ${result.type} — "${result.text}"`, "PLD");
      perf.end('getCtaType');
      return result;
    }
    perf.end('getCtaType');
    return null;
  }

  function getH1Pattern() {
    perf.start('getH1Pattern');
    const bodyH1Pattern = document.body.getAttribute('data-h1-pattern');
    if (bodyH1Pattern) { perf.end('getH1Pattern'); return bodyH1Pattern; }
    const kategori = getKategori();
    const pattern = kategori === 'NON-EVERGREEN' ? 'with-year' : 'no-year';
    perf.end('getH1Pattern');
    return pattern;
  }

  function needYear(level) {
    const bodyNeedYear = document.body.getAttribute('data-need-year');
    if (bodyNeedYear !== null) return bodyNeedYear === 'true';
    const h1Pattern = getH1Pattern();
    return h1Pattern === 'with-year';
  }

  function isImageEligible(pageLevel) {
    const bodyImageEligible = document.body.getAttribute('data-image-eligible');
    if (bodyImageEligible !== null) return bodyImageEligible === 'true';
    const mandatoryImageLevels = ['money-master', 'money-page', 'money-child', 'variant', 
                                   'sub-variant', 'pillar', 'sub-pillar-tipe-1', 'sub-pillar-tipe-2'];
    return mandatoryImageLevels.includes(pageLevel);
  }

  // ============================================================
  // 🔥 FIX-3: waitForAEDMetaDates — Anti-race-condition
  // ============================================================
  function waitForAEDMetaDates(timeout = CONFIG.AED_TIMEOUT) {
    return new Promise((resolve) => {
      perf.start('waitForAEDMetaDates');
      const controller = new AbortController();
      let timeoutId = null, intervalId = null, resolved = false;

      function safeEnd() {
        if (!resolved) { resolved = true; perf.end('waitForAEDMetaDates'); }
      }

      if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
        log(`⚡ AED ready: ${window.AEDMetaDates.dateModified}`, "AED");
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
        if (controller.signal.aborted) { clearInterval(intervalId); intervalId = null; return; }
        if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
          cleanup();
          safeEnd();
          resolve(window.AEDMetaDates);
          return;
        }
        if (Date.now() - startTime > timeout) {
          cleanup();
          log(`⏰ AED timeout — dateModified di-skip (anti-spoofing)`, "WARN");
          safeEnd();
          resolve({
            dateModified: null,
            nextUpdate: null,
            validityDays: 365,
            usePriceValidUntil: false
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
      const onReady = () => { perf.end('waitForPLD'); resolve(true); };
      window.addEventListener("pageLevelDetectorv22Ready", onReady, { once: true, signal: controller.signal });
      setTimeout(() => {
        controller.abort();
        perf.end('waitForPLD');
        resolve(!!window.pageLevelDetectorv22);
      }, CONFIG.PLD_TIMEOUT);
    });
  }

  // ============================================================
  // Color helpers
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

  function getCurrentYear() { return new Date().getFullYear(); }

  function getCleanPageName(level) {
    perf.start('getCleanPageName');
    let cleanName = '';
    let path = window.location.pathname;
    path = path.replace(/^\/p\//, '').replace(/\/\d{4}\/\d{2}\//g, '/').replace(/\.html$/, '');
    let segments = path.split('/').filter(s => s.length > 0);
    let lastSegment = segments.length > 0 ? segments[segments.length - 1] : '';
    cleanName = lastSegment.replace(/[-_]+/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/\s\d+$/, '');
    if (level === 'pillar' || level === 'sub-pillar-tipe-1' || level === 'sub-pillar-tipe-2') {
      cleanName = cleanName.replace(/^(Harga|Jasa|Biaya|Tarif)\s*/i, '').trim();
    }
    if (cleanName.length < 3) {
      const h1Text = document.querySelector('h1')?.innerText?.trim();
      if (h1Text && h1Text.length > 3) {
        cleanName = h1Text.replace(/\b(20[2-9][0-9])\b/g, '').replace(/\s*[–—\-|]\s*/g, ' ')
          .replace(/^(Harga|Jasa|Biaya|Tarif|Estimasi)\s*/i, '').trim();
      }
    }
    if (cleanName.length < 3) cleanName = 'Halaman Utama';
    if (cleanName.length > 55) cleanName = cleanName.substring(0, 52) + '...';
    perf.end('getCleanPageName');
    return cleanName;
  }

  function createImageWithText(pageName, level, year) {
    if (CLOUDINARY_CONFIG.ENABLED && CLOUDINARY_CONFIG.CLOUD_NAME) {
      try {
        const needYearFlag = needYear(level);
        const displayText = needYearFlag ? `${pageName} ${year}` : pageName;
        const imageUrl = CLOUDINARY_CONFIG.buildUrl(level, displayText);
        if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
      } catch(e) {
        log(`⚠️ Cloudinary error: ${e.message}`, "WARN");
      }
    }
    return IMAGE_CONFIG.LOGO_IMAGE;
  }

  function getFallbackImage(pageName, level, year) {
    if (CLOUDINARY_CONFIG.ENABLED && CLOUDINARY_CONFIG.CLOUD_NAME) {
      try {
        const needYearFlag = needYear(level);
        const displayText = needYearFlag ? `${pageName} ${year}` : pageName;
        return CLOUDINARY_CONFIG.buildFallbackUrl(level, displayText);
      } catch(e) {
        return IMAGE_CONFIG.LOGO_IMAGE;
      }
    }
    return IMAGE_CONFIG.LOGO_IMAGE;
  }

  // ============================================================
  // Fix Images
  // ============================================================
  function fixImagesToFormat1(pageLevel) {
    perf.start('fixImagesToFormat1');
    const currentYear = getCurrentYear();
    const needYearFlag = needYear(pageLevel);
    const pageName = getCleanPageName(pageLevel);
    const displayName = needYearFlag ? pageName + ' ' + currentYear : pageName;

    function getImageInsertionPoint() {
      let article = domCache ? domCache.get('article') : document.querySelector('article');
      if (!article) {
        const candidates = ['.post-body', 'main', '.content', '.entry-content', '.post-content'];
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
      const badgeSelectors = ['.update-badge', '[class*="update-badge"]'];
      let badge = null;
      for (const selector of badgeSelectors) {
        const el = domCache ? domCache.get(selector, article) : article.querySelector(selector);
        if (el && el.parentElement === article) { badge = el; break; }
      }
      if (badge) return { container: article, referenceNode: badge, position: 'after' };
      const firstChild = article.firstElementChild;
      if (firstChild && firstChild.tagName === 'H1') return { container: article, referenceNode: firstChild, position: 'after' };
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
      const styleId = 'responsive-image-style-v736e';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          @media (max-width: 1200px) {
            figure[data-auto-figure="true"] img { max-width: 100% !important; height: auto !important; aspect-ratio: auto !important; }
            figure[data-auto-figure="true"] { padding: 0.5em 0px !important; margin: 10px 0 !important; }
          }
          @media (max-width: 480px) {
            figure[data-auto-figure="true"] figcaption { font-size: 12px !important; padding: 0 10px !important; }
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
            if (img) { targetImage = img; targetFigure = siblings[i].tagName === 'FIGURE' ? siblings[i] : siblings[i].closest('figure'); break; }
          }
        }
      }
    }

    if (!targetImage) {
      const contentAreas = ['article', 'section', '.post-body', 'main', '.content'];
      for (const areaSelector of contentAreas) {
        const area = domCache ? domCache.get(areaSelector) : document.querySelector(areaSelector);
        if (area) {
          const img = area.querySelector('img:not([src*="logo"]):not([src*="icon"]):not([src*="avatar"])');
          if (img) { targetImage = img; targetFigure = img.closest('figure'); break; }
        }
      }
    }

    const autoImageUrl = createImageWithText(pageName, pageLevel, currentYear);
    const fallbackImageUrl = getFallbackImage(pageName, pageLevel, currentYear);
    const captionText = '📊 ' + displayName;
    let result = null;

    if (targetImage) {
      const img = targetImage;
      const figure = targetFigure || img.closest('figure');
      const currentSrc = img.src || '';
      if (currentSrc.includes('No_Image') || currentSrc.includes('placeholder') || !currentSrc) {
        if (/^https?:\/\//i.test(autoImageUrl)) {
          img.src = autoImageUrl;
          img.setAttribute('onerror', `this.onerror=null;this.src='${fallbackImageUrl}';`);
        } else {
          img.src = IMAGE_CONFIG.LOGO_IMAGE;
        }
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
          figcaption.style.cssText = 'color:#555;font-size:14px;margin-top:10px;padding:0 20px;text-align:center;';
          figure.appendChild(figcaption);
        }
        figcaption.textContent = captionText;
        result = figure;
      } else {
        const newFigure = document.createElement('figure');
        const parent = img.parentElement;
        parent.insertBefore(newFigure, img);
        newFigure.appendChild(img);
        const figcaption = document.createElement('figcaption');
        figcaption.style.cssText = 'color:#555;font-size:14px;margin-top:10px;padding:0 20px;text-align:center;';
        figcaption.textContent = captionText;
        newFigure.appendChild(figcaption);
        applyResponsiveStyles(newFigure, img);
        result = newFigure;
      }
      perf.end('fixImagesToFormat1');
      return result;
    }

    const insertPoint = getImageInsertionPoint();
    const figure = document.createElement('figure');
    const img = document.createElement('img');
    img.src = autoImageUrl;
    img.setAttribute('onerror', `this.onerror=null;this.src='${fallbackImageUrl}';`);
    img.alt = displayName;
    img.title = displayName;
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
    img.setAttribute('data-auto-generated', 'true');
    img.setAttribute('data-page-level', pageLevel);
    img.setAttribute('data-year', currentYear);
    const figcaption = document.createElement('figcaption');
    figcaption.style.cssText = 'color:#555;font-size:14px;margin-top:10px;padding:0 20px;text-align:center;';
    figcaption.textContent = captionText;
    figure.appendChild(img);
    figure.appendChild(figcaption);
    applyResponsiveStyles(figure, img);
    if (insertPoint.referenceNode && insertPoint.position === 'after') {
      insertPoint.container.insertBefore(figure, insertPoint.referenceNode.nextSibling);
    } else {
      insertPoint.container.insertBefore(figure, insertPoint.container.firstChild);
    }
    perf.end('fixImagesToFormat1');
    return figure;
  }

  // ============================================================
  // 🔥 FIX-1: SERVICE TYPE EXTRACTOR
  // ============================================================
  function extractServiceType(title, entityType) {
    let serviceType = title
      .replace(/^(harga|biaya|tarif|estimasi|daftar|perbandingan|jual|beli)\s*/i, '')
      .replace(/\b(19|20)\d{2}\b/g, '')
      .replace(/\s*terbaru|\s*update|\s*terkini|\s*lengkap|\s*terpercaya/gi, '')
      .replace(/\s*[–—\-|:&•·].*$/, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (entityType === 'jasa' && !/^(jasa|layanan|service|borongan|kontraktor|pemasangan|instalasi)/i.test(serviceType)) {
      serviceType = 'Jasa ' + serviceType;
    } else if (entityType === 'sewa' && !/^(sewa|rental)/i.test(serviceType)) {
      serviceType = 'Sewa ' + serviceType;
    } else if (entityType === 'produk' && !/^(produk|jual|beli)/i.test(serviceType)) {
      serviceType = 'Produk ' + serviceType;
    }
    
    if (serviceType.length > 60) serviceType = serviceType.substring(0, 60).trim();
    
    log(`🔧 extractServiceType: "${title}" → "${serviceType}"`, "FIX");
    return serviceType;
  }

  function detectProductMaterial(entityType) {
    const bodyMaterial = document.body.getAttribute('data-product-material');
    if (bodyMaterial) return bodyMaterial;
    if (entityType === 'jasa') return 'Jasa Konstruksi';
    if (entityType === 'sewa') return 'Alat Konstruksi';
    if (entityType === 'material') return document.body.getAttribute('data-product-category') || 'Material Bangunan';
    if (entityType === 'produk') return document.body.getAttribute('data-product-category') || 'Produk Konstruksi';
    return null;
  }

  // ============================================================
  // 🔥 FIX-20: DETECT STATIC FAQPage SCHEMA
  // ============================================================
  function hasStaticFAQPageSchema() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const OWN_IDS = ['auto-schema-service', 'auto-schema-product', 'auto-schema'];

    for (const s of scripts) {
      if (s.id && OWN_IDS.includes(s.id)) continue;

      let json;
      try {
        json = JSON.parse(s.textContent || '{}');
      } catch (e) {
        continue;
      }

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

  // ============================================================
  // 🔥 FIX-14 + FIX-16: FAQ EXTRACTION (content-driven + scoped)
  // ============================================================
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

  // ============================================================
  // PRICE PARSING
  // ============================================================
  function parsePriceFromText(text) {
    if (!text) return null;
    let clean = String(text).trim();
    let multiplier = 1;
    if (/\d\s*(rb|ribu|k)\b/i.test(clean)) { multiplier = 1000; clean = clean.replace(/\s*(rb|ribu|k)\b/gi, ''); }
    if (/\d\s*(jt|juta|m)\b/i.test(clean)) { multiplier = 1000000; clean = clean.replace(/\s*(jt|juta|m)\b/gi, ''); }
    clean = clean.replace(/(Rp\.?|IDR|\$|€|¥|£)/gi, '').trim().replace(/\s+/g, '');
    if (clean.includes('.') && clean.includes(',')) clean = clean.replace(/\./g, '').replace(',', '.');
    else if (clean.includes('.')) {
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
    if (value >= 1900 && value <= 2099 && !/(harga|biaya|tarif|price|cost)/i.test(text)) return true;
    const cleanText = text.replace(/[\s\-\.]/g, '');
    if (/^(\+?62|0)\d{8,12}$/.test(cleanText)) return true;
    if (/^\d{5}$/.test(text.trim())) return true;
    if (/^\d{16}$/.test(text.trim())) return true;
    if (/\d+\s*(cm|mm|m|kg|ton|%|unit|buah|lembar|pcs|box)\b/i.test(text) && !/(harga|biaya|tarif|price|cost|rp)/i.test(text)) return true;
    if (/\d+\s*[x×]\s*\d+/.test(text) && !/(harga|biaya|tarif|price)/i.test(text)) return true;
    if (/\d[\d.,]*\s*%/i.test(text)) return true;
    if (/20\d{2}\s*[-–]\s*20\d{2}/.test(text)) return true;
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
    const container = document.querySelector('article, main, .post-body, .entry-content') || document.body;

    const layer1 = detectPriceFromTableHeader(container);
    if (layer1.hasPrice) { perf.end('detectPriceLayered'); return { ...layer1, layer: 1 }; }

    const layer2 = detectPriceFromElements(container);
    if (layer2.hasPrice) { perf.end('detectPriceLayered'); return { ...layer2, layer: 2 }; }

    const layer3 = detectPriceFromKeywordElements(container);
    if (layer3.hasPrice) { perf.end('detectPriceLayered'); return { ...layer3, layer: 3 }; }

    const layer4 = detectPriceFromLooseRegex(container);
    if (layer4.hasPrice) { perf.end('detectPriceLayered'); return { ...layer4, layer: 4 }; }

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
      for (const row of table.querySelectorAll('tbody tr, tr')) {
        const cells = row.querySelectorAll('td');
        if (cells.length <= priceColIndex) continue;
        const priceText = cells[priceColIndex].innerText.trim();
        const productText = productColIndex !== -1 && cells[productColIndex] ? cells[productColIndex].innerText.trim() : cells[0].innerText.trim();
        const price = parsePriceFromText(priceText);
        if (!price || isNotPrice(priceText, price)) continue;
        if (!productText || productText.length < 3 || productText.length > 100) continue;
        offers.push({ name: productText, price: price, description: productText });
        if (offers.length >= CONFIG.MAX_OFFERS) break;
      }
      if (offers.length > 0) break;
    }
    return { hasPrice: offers.length > 0, source: 'table-header', value: offers[0]?.price, offers };
  }

  function detectPriceFromElements(container) {
    const selectors = ['[itemprop="price"]', '.price', '.harga', '.biaya', '.tarif', '[data-price]', '.price-item', '.price-value', '.amount', '.cost'];
    const priceEls = container.querySelectorAll(selectors.join(', '));
    for (const el of priceEls) {
      const text = el.innerText.trim();
      const price = parsePriceFromText(text);
      if (!price || isNotPrice(text, price)) continue;
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
      return { hasPrice: true, source: 'element', value: price, offers: [{ name: productName, price, description: productName }] };
    }
    return { hasPrice: false, source: null, value: null, offers: [] };
  }

  function detectPriceFromKeywordElements(container) {
    const candidates = container.querySelectorAll(
      'table td, table th, [class*="price"], [class*="harga"], [class*="biaya"], .price, .harga, .biaya, strong, b, .post-body p'
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
      if (!price || isNotPrice(text, price)) continue;
      let productName = text.replace(/Rp\.?\s*[\d.,]+\s*(rb|ribu|k|jt|juta)?/gi, '').trim();
      productName = productName.replace(/^(harga|biaya|tarif)\s*:?\s*/i, '').trim();
      if (productName.length > 100) productName = productName.substring(0, 100);
      if (productName.length < 3) productName = 'Produk';
      return { hasPrice: true, source: 'keyword', value: price, offers: [{ name: productName, price, description: productName }] };
    }
    return { hasPrice: false, source: null, value: null, offers: [] };
  }

  function detectPriceFromLooseRegex(container) {
    const keywordRegex = /(harga|biaya|tarif|price|cost|rate|mulai dari|per\s+(m|m²|m2|unit|buah|lembar|meter))/i;
    const contextEls = [];
    const allEls = container.querySelectorAll(
      'table td, table th, [class*="price"], [class*="harga"], [class*="biaya"], .price, .harga, .biaya, strong, b, .post-body p'
    );
    let processed = 0;
    for (const el of allEls) {
      if (processed++ > CONFIG.MAX_ELEMENTS_TO_SCAN) break;
      const text = el.innerText || '';
      if (!text || text.length > 500) continue;
      if (keywordRegex.test(text)) contextEls.push(el);
    }
    if (contextEls.length === 0) return { hasPrice: false, source: null, value: null, offers: [], reason: 'no-context' };
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
    }
    return { hasPrice: false, source: null, value: null, offers: [], reason: 'no-valid-price' };
  }

  // ============================================================
  // 🔥 FIX-2 + FIX-22: INTERNAL LINKS — Max 8 + Title Case
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
      if (href.includes('{{') || href.includes('%7B') || href.includes('LINK_')) continue;
      links.push(href);
      if (links.length >= CONFIG.MAX_INTERNAL_LINKS) break;
    }
    const unique = [...new Set(links)];
    const limited = unique.slice(0, CONFIG.MAX_INTERNAL_LINKS);

    // 🔥 FIX-22 (v7.36e): Title Case names
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

  // ============================================================
  // 🚀 MAIN FUNCTION v7.36e-LITE
  // ============================================================
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(async () => {
      perf.start('init');
      log("═══════════════════════════════════════════════════", "INFO");
      log("AUTO SCHEMA UNIVERSAL v7.36e-LITE COMPLETE", "INFO");
      log("═══════════════════════════════════════════════════", "INFO");

      try {
        // ===== STEP 1: BREADCRUMB =====
        let parentData = await waitForBreadcrumbGenerated(CONFIG.BREADCRUMB_GENERATED_TIMEOUT);
        let breadcrumbData = null;
        if (!parentData || !parentData.parentName || parentData.parentName === 'Home') {
          breadcrumbData = await waitForBreadcrumbReady(CONFIG.BREADCRUMB_READY_TIMEOUT);
          const currentUrl = location.href.replace(/[?&]m=1/, "");
          parentData = getParentFromBreadcrumbReady(breadcrumbData, currentUrl);
        }

        // ===== STEP 2: PLD =====
        await waitForPLD();
        const pldVer = getPLDVersion();

        // ===== STEP 3: AED =====
        const aed = await waitForAEDMetaDates(CONFIG.AED_TIMEOUT);

        // ===== STEP 4: DATA PLD =====
        const pageLevel    = getPageLevelFromPLD();
        const entityType   = getEntityTypeFromPLD();
        const contentFocus = detectContentFocus();
        const kategori     = getKategori();
        const ctaType      = getCtaType();
        const h1Pattern    = getH1Pattern();

        // 🔥 Baca schema hint dari PLD (SEO 2026)
        const schemaPrimary   = (document.body.getAttribute('data-schema-type-primary')   || '').trim();
        const schemaSecondary = (document.body.getAttribute('data-schema-type-secondary') || '').trim();
        const schemaNote      = (document.body.getAttribute('data-schema-type-note')      || '').trim();

        // 🔥 Parse note flags
        const wantOffers      = /(^|,)with-offers($|,)/.test(schemaNote) && !/without-offers/.test(schemaNote);
        const wantAreaServed  = /with-areaServed/.test(schemaNote);
        const isEvergreenSvc  = /evergreen-service/.test(schemaNote);

        // 🔥 Tentukan node dari PLD (Article = TIDAK dibuat di sini — v8.6b yang bikin)
        const wantService  = (schemaPrimary === 'Service')  || (schemaSecondary === 'Service');
        const wantProduct  = (schemaPrimary === 'Product')  || (schemaSecondary === 'Product');
        const wantCreative = (schemaSecondary === 'CreativeWork');

        // 🔥 FIX-20 (v7.36d): Cek FAQPage static dulu
        const hasStaticFAQ = hasStaticFAQPageSchema();

        // 🔥 FIX-14 (v7.36c): FAQ = content-driven
        const faqsFromDOM = extractFaqFromDOM();
        const wantFAQ = !hasStaticFAQ && faqsFromDOM.length >= 2;

        // 🔥 FIX-17 (v7.36c): TechArticle
        const wantTechArticle = (schemaSecondary === 'TechArticle') &&
                                (schemaPrimary === 'Service' || schemaPrimary === 'Product');

        log(`📌 Level: ${pageLevel} | Entity: ${entityType} | Focus: ${contentFocus}`, "SUCCESS");
        log(`🔗 PLD hint → primary=${schemaPrimary} | secondary=${schemaSecondary} | note=${schemaNote}`, "SCHEMA");
        log(`🔗 Build plan → Service=${wantService} Product=${wantProduct} FAQ=${wantFAQ} Creative=${wantCreative} TechArticle=${wantTechArticle}`, "SCHEMA");

        if (hasStaticFAQ) {
          log(`⏭️ FAQPage static sudah ada di HTML — SKIP FAQPage dinamis (hindari duplikasi)`, "STATIC");
        } else {
          log(`❓ FAQ tersedia: ${faqsFromDOM.length} pertanyaan → wantFAQ=${wantFAQ}`, "FAQ");
        }

        if (wantTechArticle) {
          log(`📄 TechArticle LAYAK — level=${pageLevel}, entity=${entityType}, primary=${schemaPrimary}`, "TECH");
        } else if (schemaSecondary === 'TechArticle') {
          log(`⏭️ TechArticle SKIP — primary=${schemaPrimary} (bukan Service/Product)`, "SKIP");
        } else if (pageLevel === 'variant' || pageLevel === 'sub-variant') {
          log(`⏭️ TechArticle SKIP — PLD tidak set secondary=TechArticle`, "SKIP");
        }

        log(`📄 Article node → HANDLED BY v8.6b (skip di Universal)`, "ARTICLE");

        // ===== STEP 5: PRICE (4 LAYERS) =====
        const priceResult = detectPriceLayered(pageLevel);
        const tableOffers = priceResult.offers || [];
        const hasPrice = priceResult.hasPrice;

        // ===== STEP 6: IMAGES =====
        const isEligible = isImageEligible(pageLevel);
        let pageImage = IMAGE_CONFIG.LOGO_IMAGE;
        if (isEligible) {
          try {
            const fixedFigure = fixImagesToFormat1(pageLevel);
            if (fixedFigure) {
              const img = fixedFigure.querySelector('img');
              if (img && /^https?:\/\//i.test(img.src || '')) pageImage = img.src;
            }
          } catch(e) { log(`Error images: ${e.message}`, "ERROR"); }
        }

        // ===== STEP 7: INJECT SCHEMA =====
        const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
        const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
        const baseUrl = ogUrl || canonical || location.href;
        const cleanUrl = baseUrl.replace(/[?&]m=1/, "");
        const h1Text = document.querySelector("h1")?.innerText?.trim() || document.title;
        const title = h1Text.replace(/\s{2,}/g, " ").trim().substring(0, 120);
        const description = document.querySelector('meta[name="description"]')?.content?.trim() ||
          document.querySelector("article p, main p")?.innerText?.substring(0, 200) || title;

        const knowsAbout = CONFIG.KNOWS_ABOUT;

        const dateModified = (aed && aed.dateModified) ? aed.dateModified : undefined;
        const priceValidUntil = (aed && aed.nextUpdate) ? aed.nextUpdate : undefined;

        // BUILD GRAPH
        const graph = [
          {
            "@type": ["LocalBusiness", "GeneralContractor"],
            "@id": CONFIG.LOCALBUSINESS_ID,
            "name": "Beton Jaya Readymix",
            "url": "https://www.betonjayareadymix.com",
            "telephone": "+6281299842508",
            "description": "Beton Jaya Readymix melayani jasa konstruksi terpadu: pengeboran, coring beton, pondasi, beton readymix, pagar panel, saluran precast, material, sewa alat, dan jasa pasang konstruksi di seluruh Indonesia.",
            "address": { "@type": "PostalAddress", "addressLocality": "Bogor", "addressRegion": "Jawa Barat", "addressCountry": "ID" },
            "openingHours": "Mo-Sa 08:00-17:00",
            "logo": IMAGE_CONFIG.LOGO_IMAGE,
            "sameAs": ["https://www.facebook.com/betonjayareadymix", "https://www.instagram.com/betonjayareadymix"],
            "areaServed": CONFIG.AREA_SERVED,
            "knowsAbout": knowsAbout,
            "contactPoint": CONFIG.CONTACT_POINT
          },
          {
            "@type": "WebPage",
            "@id": cleanUrl + "#webpage",
            "url": cleanUrl,
            "name": title,
            "description": description,
            "image": pageImage,
            "isPartOf": { "@type": "WebPage", "@id": parentData.parentUrl, "name": parentData.parentName },
            "publisher": { "@id": CONFIG.LOCALBUSINESS_ID },
            ...(dateModified && { "dateModified": dateModified }),
            "inLanguage": "id"
          }
        ];

        // ═══════════════════════════════════════════════════════
        // SERVICE NODE
        // ═══════════════════════════════════════════════════════
        if (wantService) {
          const serviceType = extractServiceType(title, entityType);
          const serviceNode = {
            "@type": "Service",
            "@id": cleanUrl + "#service",
            "name": title,
            "description": description,
            "image": pageImage,
            "serviceType": serviceType,
            "provider": { "@id": CONFIG.LOCALBUSINESS_ID },
            "brand": { "@type": "Brand", "name": "Beton Jaya Readymix" },
            "mainEntityOfPage": { "@id": cleanUrl + "#webpage" }
          };

          if (wantAreaServed || isEvergreenSvc || pageLevel === 'money-child') {
            serviceNode.areaServed = CONFIG.AREA_SERVED;
          }

          if (wantOffers && hasPrice && tableOffers.length > 0) {
            const prices = tableOffers.map(o => o.price);
            serviceNode.offers = {
              "@type": "AggregateOffer",
              "lowPrice": Math.min(...prices),
              "highPrice": Math.max(...prices),
              "offerCount": tableOffers.length,
              "priceCurrency": "IDR",
              ...(priceValidUntil && { "priceValidUntil": priceValidUntil })
            };
          }

          graph.push(serviceNode);
          log(`✅ Service node: ${serviceType} (offers=${!!serviceNode.offers}, areaServed=${!!serviceNode.areaServed})`, "SCHEMA");
        }

        // ═══════════════════════════════════════════════════════
        // PRODUCT NODE
        // ═══════════════════════════════════════════════════════
        if (wantProduct) {
          const category = document.body.getAttribute('data-product-category')
                        || (entityType === 'material' ? 'BuildingMaterial' : 'PrecastProduct');

          const productNode = {
            "@type": "Product",
            "@id": cleanUrl + "#product",
            "name": title,
            "description": description,
            "image": [pageImage],
            "brand": { "@type": "Brand", "name": "Beton Jaya Readymix" },
            "category": category
          };

          if (wantAreaServed || pageLevel === 'money-child') {
            productNode.areaServed = CONFIG.AREA_SERVED;
          }

          if (pageLevel === 'variant' || pageLevel === 'sub-variant') {
            productNode.productType = pageLevel === 'variant' ? "Variant" : "Sub-Variant";
            const material = detectProductMaterial(entityType);
            if (material) productNode.material = material;
            productNode.manufacturer = { "@type": "Organization", name: "Beton Jaya Readymix" };
          }

          if (wantOffers && hasPrice && tableOffers.length > 0) {
            const prices = tableOffers.map(o => o.price);
            productNode.offers = {
              "@type": "AggregateOffer",
              "lowPrice": Math.min(...prices),
              "highPrice": Math.max(...prices),
              "offerCount": tableOffers.length,
              "priceCurrency": "IDR",
              ...(priceValidUntil && { "priceValidUntil": priceValidUntil }),
              "offers": tableOffers.map(o => ({
                "@type": "Offer",
                "name": o.name,
                "url": cleanUrl,
                "priceCurrency": "IDR",
                "price": o.price,
                "itemCondition": "https://schema.org/NewCondition",
                "availability": "https://schema.org/InStock",
                ...(priceValidUntil && { "priceValidUntil": priceValidUntil }),
                "seller": { "@id": CONFIG.LOCALBUSINESS_ID },
                "description": o.description || o.name
              }))
            };
          }

          graph.push(productNode);
          log(`✅ Product node: ${category} (offers=${!!productNode.offers})`, "SCHEMA");
        }

        // ═══════════════════════════════════════════════════════
        // ⚠️ ARTICLE NODE — DIHAPUS (FIX-10)
        // ═══════════════════════════════════════════════════════

        // ═══════════════════════════════════════════════════════
        // 🔥 FIX-17: TECHARTICLE NODE
        // ═══════════════════════════════════════════════════════
        if (wantTechArticle) {
          const techArticleNode = {
            "@type": "TechArticle",
            "@id": cleanUrl + "#tech-article",
            "headline": title,
            "description": description,
            "image": [pageImage],
            "articleSection": "Spesifikasi Teknis",
            "about": {
              "@id": cleanUrl + (wantService ? "#service" : "#product")
            },
            "mainEntityOfPage": { "@id": cleanUrl + "#webpage" },
            "author": { "@id": CONFIG.LOCALBUSINESS_ID },
            "publisher": { "@id": CONFIG.LOCALBUSINESS_ID },
            "inLanguage": "id",
            ...(dateModified && { "dateModified": dateModified })
          };
          graph.push(techArticleNode);
          log(`✅ TechArticle node — spesifikasi teknis untuk ${schemaPrimary}`, "TECH");
        }

        // ═══════════════════════════════════════════════════════
        // CREATIVE WORK (untuk desain portfolio)
        // ═══════════════════════════════════════════════════════
        if (wantCreative) {
          graph.push({
            "@type": "CreativeWork",
            "@id": cleanUrl + "#creativework",
            "name": title,
            "description": description,
            "image": [pageImage],
            "creator": { "@id": CONFIG.LOCALBUSINESS_ID },
            "inLanguage": "id"
          });
          log(`✅ CreativeWork node`, "SCHEMA");
        }

        // ═══════════════════════════════════════════════════════
        // FAQ PAGE (min 2 Q&A) — FIX-11 + FIX-14 + FIX-15 + FIX-20 + FIX-21
        // HANYA dibuat kalau TIDAK ADA FAQPage static di HTML
        // 🔥 FIX-21 (v7.36e): Hapus author + dateModified di Answer
        // ═══════════════════════════════════════════════════════
        if (wantFAQ) {
          const faqPage = {
            "@type": "FAQPage",
            "@id": cleanUrl + "#faq",
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
          log(`✅ FAQPage node: ${faqsFromDOM.length} pertanyaan (author=Organization, answer clean)`, "FAQ");
        }

        // Internal Links (max 8)
        const internalLinks = generateInternalLinks();
        if (internalLinks.length > 0) {
          graph.push({
            "@type": "ItemList",
            "@id": cleanUrl + "#related-links",
            "name": "Halaman Terkait",
            "itemListOrder": "Ascending",
            "numberOfItems": internalLinks.length,
            "itemListElement": internalLinks
          });
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

        log("═══════════════════════════════════════════════════", "SUCCESS");
        log("✅ Schema COMPLETE generated", "SUCCESS");
        log(`   Schema nodes: ${graph.map(n => n["@type"]).join(' + ')}`, "SCHEMA");
        log(`   knowsAbout: ${knowsAbout.length} item | areaServed: ${CONFIG.AREA_SERVED.length} area`, "KNOWS");
        log(`   Price layers: ${hasPrice ? 'Layer ' + priceResult.layer : 'None'}`, "PRICE");
        log(`   Internal links: ${internalLinks.length} (max ${CONFIG.MAX_INTERNAL_LINKS})`, "SYNC");
        log(`   Breadcrumb source: ${parentData.source}`, "BREADCRUMB");
        log(`   PLD version: ${pldVer.label}`, "PLD");
        log(`   FAQ: ${hasStaticFAQ ? 'static (skip dynamic)' : (wantFAQ ? faqsFromDOM.length + ' pertanyaan (dynamic)' : 'skip')}`, "FAQ");
        log(`   TechArticle: ${wantTechArticle ? 'CREATED ✅' : 'skip ⏭️'}`, "TECH");
        log(`   Article node: HANDLED BY v8.6b ⏭️`, "ARTICLE");
        log("═══════════════════════════════════════════════════", "SUCCESS");

        perf.end('init');

      } catch (error) {
        console.error('❌ Fatal error:', error);
        log(`Fatal error: ${error.message}`, "ERROR");
        perf.end('init');
      }
    }, CONFIG.DELAY_MS);
  });

  // CLEANUP
  function cleanup() { if (domCache) domCache.clear(); }
  window.addEventListener('beforeunload', cleanup);

  console.log("═══════════════════════════════════════════════════════════");
  console.log("✅ Auto Schema v7.36e-LITE — READY (PLD-DRIVEN, SEO 2026, AI-READY)");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🔥 FIX-21: Hapus author/dateModified di Answer (konsisten AED v17.4.8)");
  console.log("🔥 FIX-22: ItemList Title Case");
  console.log("🔥 FIX-20: Detect static FAQPage — anti-duplikasi");
  console.log("🔥 FIX-17: TechArticle node (secondary untuk variant/sub-variant)");
  console.log("🔥 FIX-14: FAQ content-driven (semua level)");
  console.log("🔥 FIX-15: author per FAQPage (bukan per Answer)");
  console.log("🔥 FIX-16: scope .faq-item ke konten utama");
  console.log("🔥 FIX-10: REMOVE Article node — ditangani Auto Schema Article v8.6b");
  console.log("✅ PRESERVED: FIX-5 s/d FIX-13 (PLD-driven, notes, FAQ, CreativeWork)");
  console.log("✅ PRESERVED: FIX-1 s/d FIX-4 (ServiceType, ItemList, AED, anti-race)");
  console.log("✅ KNOWS_ABOUT: 110 item | areaServed: Indonesia + 11 kota");
  console.log("✅ 4-layer price detection | Breadcrumb DOM fallback");
  console.log("✅ Konsisten dengan PLD v23.9.9 (entity-aware detectSchemaType)");
  console.log("═══════════════════════════════════════════════════════════");

})();
