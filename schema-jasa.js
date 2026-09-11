/* ⚡ AUTO SCHEMA UNIVERSAL v7.28.3 — PLD-ONLY MODE + isPartOf WebPage Only + Cloudinary Image (Responsive Text: Auto-Scale + Auto-Wrap + Split Long Words) */
// ============================================================
// 🔥🔥🔥 v7.28.3 CHANGELOG 🔥🔥🔥
// ============================================================
// ✅ PATCH: wrapText() — handle kata panjang (>22 karakter tanpa spasi)
// ✅ PATCH: Split kata panjang otomatis → text 100% tidak keluar image
// ✅ PERTAHANKAN: fig dan img responsive tetap 1200×630
// ✅ PERTAHANKAN: Semua kode lain yang sudah valid dari v7.28.2
// ============================================================

// ============================================================
// 🔥🔥🔥 BLOKIR SEMUA EXTERNAL REQUEST 🔥🔥🔥
// ============================================================
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  if (typeof url === 'string' && (url.includes('raw.githack.com') || url.includes('github.com') || url.includes('gist.github.com'))) {
    console.warn('[Schema v7.28.3] 🚫 Blocked external fetch (CORB prevention):', url);
    return Promise.reject(new Error('Blocked by CORB prevention'));
  }
  return originalFetch.apply(this, args);
};

const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  if (typeof url === 'string' && (url.includes('raw.githack.com') || url.includes('github.com') || url.includes('gist.github.com'))) {
    console.warn('[Schema v7.28.3] 🚫 Blocked external XHR (CORB prevention):', url);
    throw new Error('Blocked by CORB prevention');
  }
  return originalXHROpen.call(this, method, url, ...rest);
};

// ============================================================
// 🔥🔥🔥 PERFORMANCE MONITORING 🔥🔥🔥
// ============================================================
const perf = {
  marks: {},
  start(label) {
    this.marks[label] = performance.now();
    if (CONFIG.DEBUG) {
      console.log(`⏱️ [PERF] Start: ${label}`);
    }
  },
  end(label) {
    if (!this.marks[label]) return 0;
    const duration = performance.now() - this.marks[label];
    if (CONFIG.DEBUG) {
      console.log(`⏱️ [PERF] ${label}: ${duration.toFixed(2)}ms`);
    }
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
// 🔥🔥🔥 KONFIGURASI 🔥🔥🔥
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
// 🔥🔥🔥 INSTANCES 🔥🔥🔥
// ============================================================
const domCache = CONFIG.CACHE_DOM_ELEMENTS ? new DOMCache() : null;
const errorBoundary = new ErrorBoundary();

// ============================================================
// 🆕 v7.28.3: KONFIGURASI CLOUDINARY (AUTO-SCALE + AUTO-WRAP + SPLIT LONG WORDS) 🔥
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
  FONT_SIZE: 60,
  BOLD: true,
  GRAVITY: 'g_center',

  // 🎯 Batas text
  MAX_TEXT_LENGTH: 70,     // ← potong text kalau > 70 karakter
  MAX_CHARS_PER_LINE: 22,  // ← max karakter per baris (untuk auto-wrap)
  MAX_LINES: 2,            // ← max 2 baris

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
    'pillar': 'FFD700',            // Kuning emas (bg navy)
    'sub-pillar-tipe-2': 'FFD700', // Kuning emas (bg indigo)
    'sub-pillar-tipe-1': 'FFD700', // Kuning emas (bg teal)
    'money-master': 'FFFFFF',      // Putih (bg biru langit)
    'money-page': 'FFFFFF',        // Putih (bg biru muda)
    'money-child': 'FFFFFF',       // Putih (bg oranye)
    'variant': 'FFD700',           // Kuning emas (bg ungu)
    'sub-variant': 'FFD700'        // Kuning emas (bg coklat)
  },

  get baseUrl() {
    return `https://res.cloudinary.com/${this.CLOUD_NAME}/image/upload/`;
  },

  // 🔥 v7.28.3: AUTO-SCALE FONT SIZE berdasarkan panjang text
  calculateFontSize(textLength) {
    if (textLength <= 15) return 60;
    if (textLength <= 25) return 55;
    if (textLength <= 35) return 48;
    if (textLength <= 45) return 40;
    if (textLength <= 55) return 34;
    if (textLength <= 65) return 28;
    return 24;
  },

  // 🔥 v7.28.3: AUTO-WRAP TEXT + SPLIT LONG WORDS
  wrapText(text, maxCharsPerLine = this.MAX_CHARS_PER_LINE) {
    // Kalau text pendek, tidak perlu wrap
    if (text.length <= maxCharsPerLine) return text;

    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      // 🆕 v7.28.3: Handle kata panjang (> maxCharsPerLine)
      if (word.length > maxCharsPerLine) {
        // Simpan current line dulu
        if (currentLine) {
          lines.push(currentLine);
          currentLine = '';
        }
        // Split kata panjang jadi beberapa baris
        let remaining = word;
        while (remaining.length > maxCharsPerLine) {
          lines.push(remaining.substring(0, maxCharsPerLine));
          remaining = remaining.substring(maxCharsPerLine);
        }
        if (remaining) currentLine = remaining;
      }
      // Kata normal
      else if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
        currentLine = (currentLine + ' ' + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);

    // Batasi max MAX_LINES baris
    if (lines.length > this.MAX_LINES) {
      const merged = lines.slice(0, this.MAX_LINES - 1);
      merged.push(lines.slice(this.MAX_LINES - 1).join(' '));
      return merged.join('\n');
    }

    return lines.join('\n');
  },

  // 🔥 v7.28.3: BUILD URL dengan AUTO-SCALE + AUTO-WRAP
  buildUrl(level, text) {
    const fileName = this.LEVEL_FILES[level] || 'pillar';
    const textColor = this.LEVEL_COLORS[level] || 'FFD700';
    const weight = this.BOLD ? '_bold' : '';

    // Step 1: Potong text kalau terlalu panjang
    let displayText = text;
    if (displayText.length > this.MAX_TEXT_LENGTH) {
      displayText = displayText.substring(0, this.MAX_TEXT_LENGTH - 3) + '...';
    }

    // Step 2: Auto-wrap text jadi 2 baris (+ split kata panjang)
    displayText = this.wrapText(displayText);

    // Step 3: Hitung font size berdasarkan baris terpanjang
    const longestLine = displayText.split('\n').reduce((a, b) => a.length > b.length ? a : b, '');
    const fontSize = this.calculateFontSize(longestLine.length);

    // Step 4: Encode text (encodeURIComponent otomatis %0A untuk \n)
    const encodedText = encodeURIComponent(displayText);

    return `${this.baseUrl}` +
           `e_colorize:100,co_rgb:${textColor},` +
           `l_text:${this.FONT}_${fontSize}${weight}:${encodedText},` +
           `${this.GRAVITY},` +
           `c_pad,w_${this.WIDTH},h_${this.HEIGHT}/` +
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
// 🔥🔥🔥 LOGGING 🔥🔥🔥
// ============================================================
function log(msg, type = "INFO") {
  if (!CONFIG.DEBUG && type === "INFO") return;
  const icons = { 
    INFO: "📘", WARN: "⚠️", ERROR: "❌", SUCCESS: "✅", SKIP: "⏭️", 
    PRODUCT: "🏗️", IMAGE: "📸", YEAR: "📅", FOCUS: "🎯", TABLE: "📊", 
    H1: "📝", PRIORITY: "🔴", STOP: "🛑", BREADCRUMB: "🍞", AED: "⚡",
    PERF: "⏱️", CACHE: "💾", CORB: "🚫", COMMERCIAL: "🛒",
    PLD: "🔷", KATEGORI: "🏷️", SCHEMA: "🔗", PARENT: "👪"
  };
  const prefix = icons[type] || "📘";
  console.log(`${prefix} [Schema v7.28.3] ${msg}`);
}

// ============================================================
// 🍞 WAIT FOR BREADCRUMB READY (TUNGGU SIAP)
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
// 👪 GET PARENT FROM BREADCRUMB READY (PARENT TERDEKAT)
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

function detectContentFocus() {
    perf.start('detectContentFocus');
    
    const bodyFocus = document.body.getAttribute('data-content-focus');
    if (bodyFocus) {
        log(`🎯 Content Focus dari body: ${bodyFocus}`, "FOCUS");
        perf.end('detectContentFocus');
        return bodyFocus.toUpperCase();
    }
    
    if (window.V379A && window.V379A.focusKonten) {
        log(`🎯 Content Focus dari V37.9-A: ${window.V379A.focusKonten}`, "FOCUS");
        perf.end('detectContentFocus');
        return window.V379A.focusKonten;
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

function getKategori() {
    perf.start('getKategori');
    
    const bodyKategori = document.body.getAttribute('data-kategori');
    if (bodyKategori) {
        log(`🏷️ Kategori dari body: ${bodyKategori}`, "KATEGORI");
        perf.end('getKategori');
        return bodyKategori.toUpperCase();
    }
    
    if (window.V379A && window.V379A.kategori) {
        log(`🏷️ Kategori dari V37.9-A: ${window.V379A.kategori}`, "KATEGORI");
        perf.end('getKategori');
        return window.V379A.kategori;
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
        log(`📅 Need Year dari V37.9-A: ${window.V379A.needYear}`, "YEAR");
        perf.end('needYear');
        return window.V379A.needYear;
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
// 🔥🔥🔥 WAIT FUNCTIONS 🔥🔥🔥
// ============================================================

function waitForAEDMetaDates(timeout = CONFIG.AED_TIMEOUT) {
  return new Promise((resolve) => {
    perf.start('waitForAEDMetaDates');
    
    const controller = new AbortController();
    let timeoutId = null;
    let intervalId = null;

    if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
      log(`⚡ AEDMetaDates ready: ${window.AEDMetaDates.dateModified}`, "AED");
      perf.end('waitForAEDMetaDates');
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
        perf.end('waitForAEDMetaDates');
        resolve(window.AEDMetaDates);
      } else {
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
        perf.end('waitForAEDMetaDates');
        resolve(window.AEDMetaDates);
        return;
      }

      if (Date.now() - startTime > timeout) {
        cleanup();
        log(`⏰ AEDMetaDates timeout (${timeout}ms), using fallback`, "WARN");
        perf.end('waitForAEDMetaDates');
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
      perf.end('waitForAEDMetaDates');
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

function extractYear(text) {
    const match = text.match(/\b(20[2-9][0-9])\b/);
    return match ? parseInt(match[1]) : null;
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
// 🆕 v7.28.3: CREATE IMAGE — CLOUDINARY DYNAMIC 🔥
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

        const styleId = 'responsive-image-style-v7283';
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

    // 🔥 v7.28.3: Gunakan Cloudinary URL (bukan base64) dengan text responsive
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
// 🔥🔥🔥 UPDATE H1 BERDASARKAN FOKUS KONTEN 🔥🔥🔥
// ============================================================
function updateH1ByFocus(pageLevel, contentFocus) {
    perf.start('updateH1ByFocus');
    
    if (contentFocus === 'INFORMASI' || contentFocus === 'informasi') {
        const h1 = domCache ? domCache.get('h1') : document.querySelector('h1');
        if (h1) {
            const originalText = h1.innerText;
            const cleanedText = originalText
                .replace(/\b(19|20)\d{2}\b/g, '')
                .replace(/\s{2,}/g, ' ')
                .trim();
            if (cleanedText !== originalText) {
                h1.innerText = cleanedText;
                if (domCache) domCache.invalidate('h1');
                log(`✅ H1: Tahun dihapus (INFORMASI) → "${cleanedText}"`, "YEAR");
                perf.end('updateH1ByFocus');
                return true;
            }
        }
        perf.end('updateH1ByFocus');
        return false;
    }

    if (!needYear(pageLevel)) {
        log(`⏭️ Level ini TIDAK butuh tahun di H1`, "YEAR");
        perf.end('updateH1ByFocus');
        return false;
    }

    const currentYear = getCurrentYear();
    const h1 = domCache ? domCache.get('h1') : document.querySelector('h1');
    if (!h1) {
        log(`⚠️ Tidak ada H1 ditemukan`, "WARN");
        perf.end('updateH1ByFocus');
        return false;
    }

    const originalText = h1.innerText;
    const detectedYear = extractYear(originalText);

    if (detectedYear) {
        if (detectedYear < CONFIG.MIN_YEAR_TO_UPDATE) {
            log(`🛑 STOP: H1 mengandung tahun ${detectedYear} (< ${CONFIG.MIN_YEAR_TO_UPDATE})`, "STOP");
            perf.end('updateH1ByFocus');
            return false;
        }

        if (detectedYear === 2025) {
            log(`🛑 STOP: H1 mengandung tahun ${detectedYear} (masih valid)`, "STOP");
            perf.end('updateH1ByFocus');
            return false;
        }

        if (detectedYear > 2025) {
            const newText = originalText.replace(/\b(19|20)\d{2}\b/, currentYear);
            h1.innerText = newText;
            if (domCache) domCache.invalidate('h1');
            log(`✅ H1: Tahun diupdate ${detectedYear} → ${currentYear}`, "YEAR");
            log(`   📝 H1 baru: "${newText}"`, "H1");
            perf.end('updateH1ByFocus');
            return true;
        }
    }

    if (!detectedYear) {
        const newText = originalText + ' ' + currentYear;
        h1.innerText = newText;
        if (domCache) domCache.invalidate('h1');
        log(`✅ H1: Tahun ditambahkan → "${newText}"`, "YEAR");
        perf.end('updateH1ByFocus');
        return true;
    }

    log(`✅ H1: Tahun sudah sesuai (${detectedYear})`, "YEAR");
    perf.end('updateH1ByFocus');
    return true;
}

// ============================================================
// 🔥🔥🔥 UPDATE BULAN & TAHUN DI KONTEN (AED BASED) 🔥🔥🔥
// ============================================================
function updateContentDateReferences(aed, pageLevel) {
    perf.start('updateContentDateReferences');
    
    const moneyLevels = ['money-master', 'money-page', 'money-child'];
    if (!moneyLevels.includes(pageLevel)) {
        log(`⏭️ Skip update konten: Level ${pageLevel} tidak butuh update`, "YEAR");
        perf.end('updateContentDateReferences');
        return false;
    }

    if (!aed || !aed.nextUpdate) {
        log(`⚠️ AED tidak tersedia, skip update konten`, "WARN");
        perf.end('updateContentDateReferences');
        return false;
    }

    const currentDate = new Date();
    const nextUpdateDate = new Date(aed.nextUpdate);
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    if (currentDate < nextUpdateDate) {
        log(`⏭️ Skip update konten: Belum lewat nextUpdate (${aed.nextUpdate})`, "YEAR");
        perf.end('updateContentDateReferences');
        return false;
    }

    const currentMonth = monthNames[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();
    const newDateText = `${currentMonth} ${currentYear}`;

    if (currentYear < 2026) {
        log(`🛑 STOP: Tahun ${currentYear} < 2026, tidak update`, "STOP");
        perf.end('updateContentDateReferences');
        return false;
    }

    log(`📅 Update konten: ${newDateText} (nextUpdate lewat: ${aed.nextUpdate})`, "YEAR");

    let updated = false;
    const selectors = [
        '.update-badge', '.update-badge-class', '[class*="update-badge"]',
        '.last-updated', '.updated-date', '.date-modified',
        '.post-date', '.article-date', '.publish-date',
        'time[datetime]', 'time',
        '.post-meta', '.entry-meta', '.article-meta',
        '.breadcrumb + p', '.toc + p', 'h1 + p',
        'p:contains("diperbarui")', 'p:contains("update")',
        'p:contains("Terakhir")', 'p:contains("Last updated")',
        'p:contains("Updated")', 'p:contains("Perbarui")'
    ];

    for (const selector of selectors) {
        let elements = [];
        try {
            if (selector.includes(':contains')) {
                const keyword = selector.match(/:contains\("([^"]+)"\)/)?.[1];
                if (keyword) {
                    elements = Array.from(document.querySelectorAll('p, span, div, time'))
                        .filter(el => {
                            const text = el.innerText?.toLowerCase() || '';
                            return text.includes(keyword.toLowerCase()) && text.match(/\b(19|20)\d{2}\b/);
                        });
                }
            } else {
                elements = domCache ? domCache.getAll(selector) : document.querySelectorAll(selector);
            }
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
                                updated = true;
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
// 🔥🔥🔥 SCHEMA FUNCTIONS 🔥🔥🔥
// ============================================================
function hasPriceOnPage() {
    const text = document.body.innerText;
    return /Rp\s*[\d.,]+/.test(text);
}

function detectKnowsAbout(entityType) {
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

    const result = [...new Set(knowsAbout)].slice(0, 10);
    return result;
}

function extractServiceType(title, entityType) {
    let serviceType = title
        .replace(/^(harga|biaya|tarif|estimasi)\s*/i, '')
        .replace(/\s*2026|\s*2025|\s*2024/g, '')
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

function extractOffersFromTable() {
    perf.start('extractOffersFromTable');
    const offers = [];
    const seenItems = new Set();
    const tables = domCache ? domCache.getAll('table') : document.querySelectorAll('table');

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
        document.querySelectorAll('li, p').forEach(el => {
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

function generateInternalLinks() {
    perf.start('generateInternalLinks');
    const containers = ["article", "main", ".post-body"].map(sel => domCache ? domCache.get(sel) : document.querySelector(sel)).filter(Boolean);
    const links = containers.flatMap(c => Array.from(c.querySelectorAll("a")))
        .map(a => a.href)
        .filter(href => href && href.includes(location.hostname) && !href.includes("#") && !href.match(/(\/search|\/feed|\/label)/i));
    const unique = [...new Set(links)].slice(0, 40);
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
// 🚀 MAIN FUNCTION v7.28.3 🔥🔥🔥
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(async () => {
        perf.start('init');
        log("═══════════════════════════════════════════════════", "INFO");
        log("AUTO SCHEMA UNIVERSAL v7.28.3 — PLD-ONLY MODE", "INFO");
        log("isPartOf HANYA DI WEBPAGE + CLOUDINARY IMAGE", "INFO");
        log("RESPONSIVE TEXT: AUTO-SCALE + AUTO-WRAP + SPLIT LONG WORDS", "INFO");
        log("═══════════════════════════════════════════════════", "INFO");
        
        try {
            // =========================================================
            // STEP 1: TUNGGU BREADCRUMB SIAP (BUKAN LOADING)
            // =========================================================
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

            // ===== STEP 4: TERIMA SEMUA DATA DARI PLD/V37.9-A =====
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

            // ===== STEP 5: UPDATE H1 BERDASARKAN FOKUS KONTEN =====
            log('📅 UPDATE H1 BERDASARKAN FOKUS KONTEN:', "YEAR");
            const h1Updated = updateH1ByFocus(pageLevel, contentFocus);

            // ===== STEP 5.5: UPDATE BULAN & TAHUN DI KONTEN (AED BASED) =====
            log('📅 UPDATE BULAN & TAHUN DI KONTEN (AED BASED):', "YEAR");
            const contentDateUpdated = updateContentDateReferences(aed, pageLevel);

            // ===== STEP 6: CEK & PERBAIKI GAMBAR =====
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

            // ===== STEP 7: INJECT SCHEMA =====
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

            // =========================================================
            // STEP 7.5: AMBIL PARENT TERDEKAT DARI BREADCRUMB SIAP
            // =========================================================
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
            const tableOffers = [];
            const isMoneyPage = ['money-master', 'money-page', 'money-child'].includes(pageLevel);

            if (isMoneyPage) {
                const extractedOffers = extractOffersFromTable();
                extractedOffers.forEach(offer => {
                    tableOffers.push({ name: offer.name, price: offer.price, description: offer.description || offer.name });
                });
            }

            const hasPrice = hasPriceOnPage() || tableOffers.length > 0;

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

                if (tableOffers.length > 0) {
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
                    log(`✅ Product schema (${tableOffers.length} offers) — isPartOf di WebPage`, "SUCCESS");
                } else {
                    log(`⏭️ Skip Product schema (tidak ada harga/offers)`, "SKIP");
                }
            } else {
                log(`⏭️ Skip Service schema (entity: ${entityType})`, "SKIP");
            }

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
            log(`  Offers           : ${tableOffers.length}`, "TABLE");
            log(`  priceValidUntil  : ${priceValidUntil}`, "AED");
            log(`  WebPage Schema   : ✅ (+ isPartOf) ← BEST PRACTICE SEO`, "SUCCESS");
            log(`  Service Schema   : ${isService ? '✅ (tanpa isPartOf)' : '❌'}`, "SUCCESS");
            log(`  Product Schema   : ${(isService && hasPrice && tableOffers.length > 0) ? '✅ (tanpa isPartOf)' : '❌'}`, "SUCCESS");
            log(`  isPartOf SOURCE  : ✅ BREADCRUMB TERDEKAT (SIAP)`, "PARENT");
            log(`  Internal Links   : ${internalLinks.length}`, "SUCCESS");
            log(`  Image Eligible   : ${isEligible ? '✅' : '❌'}`, "IMAGE");
            log(`  Image Source     : ${/^https?:\/\//i.test(pageImage) ? '✅ URL ABSOLUT' : '⚠️ ' + pageImage.substring(0, 40)}`, "IMAGE");
            log(`  Image Size       : 1200×630 (SEO-optimal)`, "IMAGE");
            log(`  Text Auto-Scale  : ✅ ACTIVE (font responsive)`, "IMAGE");
            log(`  Text Auto-Wrap   : ✅ ACTIVE (2 baris responsive)`, "IMAGE");
            log(`  Text Split Long  : ✅ ACTIVE (kata panjang dipotong)`, "IMAGE");
            log(`  Cloudinary       : ${CLOUDINARY_CONFIG.ENABLED ? '✅ ENABLED' : '❌ DISABLED'}`, "IMAGE");
            log(`  Auto Year H1     : ${h1Updated ? '✅ UPDATE' : '⏭️ SKIP/STOP'}`, "YEAR");
            log(`  Auto Update Konten: ${contentDateUpdated ? '✅ UPDATE' : '⏭️ SKIP'}`, "YEAR");
            log(`  DOM CACHE        : ${CONFIG.CACHE_DOM_ELEMENTS ? '✅ ACTIVE' : '❌ INACTIVE'}`, "CACHE");
            log(`  CORB PREVENTION  : ✅ ACTIVE`, "CORB");
            log(`  PLD-ONLY MODE    : ✅ ACTIVE`, "PLD");
            log("═══════════════════════════════════════════════════", "INFO");
            log("AUTO SCHEMA UNIVERSAL v7.28.3 SELESAI", "SUCCESS");
            
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
