/* ⚡ AUTO SCHEMA UNIVERSAL v7.23 — V37 COMPLIANT + PLD v22.55 + OPTIMIZED */
// ============================================================
// 🔥🔥🔥 BLOKIR SEMUA EXTERNAL REQUEST 🔥🔥🔥
// ============================================================
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  if (typeof url === 'string' && (url.includes('raw.githack.com') || url.includes('github.com') || url.includes('gist.github.com'))) {
    console.warn('[Schema v7.23] 🚫 Blocked external fetch (CORB prevention):', url);
    return Promise.reject(new Error('Blocked by CORB prevention'));
  }
  return originalFetch.apply(this, args);
};

const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  if (typeof url === 'string' && (url.includes('raw.githack.com') || url.includes('github.com') || url.includes('gist.github.com'))) {
    console.warn('[Schema v7.23] 🚫 Blocked external XHR (CORB prevention):', url);
    throw new Error('Blocked by CORB prevention');
  }
  return originalXHROpen.call(this, method, url, ...rest);
};

// ============================================================
// 🔥🔥🔥 PERFORMANCE MONITORING (dari v4.73) 🔥🔥🔥
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
// 🔥🔥🔥 DOM CACHE (dari v4.73) 🔥🔥🔥
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
// 🔥🔥🔥 ERROR BOUNDARY (dari v4.73) 🔥🔥🔥
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
    PERF: "⏱️", CACHE: "💾", CORB: "🚫", COMMERCIAL: "🛒"
  };
  const prefix = icons[type] || "📘";
  console.log(`${prefix} [Schema v7.23] ${msg}`);
}

// ============================================================
// 🔥🔥🔥 SPESIFIKASI PER ENTITY (PLD v22.55 COMPLIANT) 🔥🔥🔥
// ============================================================

// PRODUK SPECIFICATIONS
var PRODUK_SPECS = {
    mutu: ["k225", "k250", "k300", "k350", "k400", "k500", "fc", "sni"],
    finishing: ["polos", "motif", "bermotif", "bercorak", "tekstur", "serat", "halus", "kasar", "matte", "glossy", "doff", "gloss", "satin", "anyaman", "natural", "ekspos", "custom", "polosan"],
    dimensi: ["ukuran", "dimensi", "tinggi", "rendah", "panjang", "pendek", "lebar", "sempit", "tebal", "tipis", "dalam", "dangkal", "diameter", "radius"],
    material: ["beton", "baja", "besi", "kayu", "keramik", "granit", "marmer", "plafon", "gypsum", "kanopi", "paving", "readymix", "precast", "pracetak"]
};

// MATERIAL SPECIFICATIONS
var MATERIAL_SPECS = {
    grade: ["grade a", "grade b", "sni", "standar", "premium", "ekonomis"],
    finishing: ["ulir", "polos", "galvanis", "berlapis", "cat", "coating", "anyaman"],
    dimensi: ["tebal", "panjang", "lebar", "diameter", "radius", "ukuran"],
    berat: ["kg", "ton", "m3", "liter", "gram"]
};

// SEWA SPECIFICATIONS
var SEWA_SPECS = {
    tipe: ["mini", "besar", "kecil", "sedang", "medium", "heavy", "standar", "extra", "ekstra"],
    merek: ["pc75", "pc200", "pc300", "komatsu", "hitachi", "caterpillar", "volvo", "hyundai", "doosan", "kobelco", "sumitomo"],
    kapasitas: ["ton", "m3", "kg", "liter"],
    kondisi: ["baru", "bekas", "servis", "recondition", "rebuilt"]
};

// JASA SPECIFICATIONS
var JASA_SPECS = {
    metode: ["manual", "hidrolik", "auger", "rotary", "percussive", "dry", "wet", "basah", "kering"],
    teknik: ["coring", "cutting", "drilling", "pengeboran", "pemancangan", "pemasangan", "bongkar", "potong", "las", "sambung", "grinding", "welding", "bending", "forming", "gali", "urug", "angkut", "cor", "pasang", "bangun"],
    skala: ["rumahan", "komersial", "industri", "residential", "commercial", "industrial"],
    kedalaman: ["m", "meter", "cm", "centimeter"]
};

// DESAIN SPECIFICATIONS
var DESAIN_SPECS = {
    gaya: ["modern", "minimalis", "klasik", "tradisional", "kontemporer", "elegan", "luxury", "industrial", "scandinavian", "jepang", "rustic", "vintage", "bohemian", "art deco", "mid century"],
    warna: ["putih", "hitam", "abu-abu", "merah", "biru", "kuning", "hijau", "coklat", "netral", "warm", "cool", "pastel", "dark", "light"],
    material: ["kayu", "besi", "kaca", "marmer", "granit", "keramik", "plafon", "gypsum", "pvc", "acp", "vinyl", "wpc", "grc", "hpl"],
    fungsi: ["ruang tamu", "kamar tidur", "dapur", "kamar mandi", "ruang kerja", "ruang keluarga", "teras", "taman", "ruang makan", "ruang tv"],
    konsep: ["open space", "split level", "loft", "studio", "apartment", "villa"]
};

// ============================================================
// 🔥🔥🔥 WAIT FUNCTIONS (OPTIMIZED - dari v4.73) 🔥🔥🔥
// ============================================================

// ✅ TUNGGU BREADCRUMB TERBENTUK (OPTIMIZED)
function waitForBreadcrumb(timeout = CONFIG.BREADCRUMB_TIMEOUT) {
  return new Promise((resolve) => {
    perf.start('waitForBreadcrumb');
    const startTime = Date.now();

    const breadcrumbSelectors = [
      '.breadcrumbs', '.breadcrumb', '.nav-trail', '.breadcrumb-item',
      '.crumbs', '.breadcrumb-link', '[aria-label="breadcrumb"]',
      '.post-breadcrumb', '.breadcrumb-nav', '.nav-breadcrumb'
    ];

    let intervalId = null;
    let timeoutId = null;

    function checkBreadcrumb() {
      for (const selector of breadcrumbSelectors) {
        const element = domCache ? domCache.get(selector) : document.querySelector(selector);
        if (element) {
          const links = element.querySelectorAll('a');
          if (links.length > 0) {
            log(`🍞 Breadcrumb ditemukan (${selector}) — ${links.length} link`, "BREADCRUMB");
            cleanup();
            perf.end('waitForBreadcrumb');
            resolve(true);
            return;
          }
          if (element.innerText.trim().length > 0) {
            log(`🍞 Breadcrumb ditemukan (${selector}) — ada teks`, "BREADCRUMB");
            cleanup();
            perf.end('waitForBreadcrumb');
            resolve(true);
            return;
          }
        }
      }

      if (Date.now() - startTime > timeout) {
        log(`⏰ Breadcrumb timeout (${timeout}ms), lanjutkan`, "WARN");
        cleanup();
        perf.end('waitForBreadcrumb');
        resolve(false);
      }
    }

    function cleanup() {
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
      if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
    }

    intervalId = setInterval(checkBreadcrumb, 100);
    timeoutId = setTimeout(() => {
      cleanup();
      perf.end('waitForBreadcrumb');
      resolve(false);
    }, timeout + 100);
  });
}

// ✅ TUNGGU AEDMetaDates (OPTIMIZED - NO MEMORY LEAK)
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

function needYear(level) {
    const moneyLevels = ['money-master', 'money-page', 'money-child'];
    return moneyLevels.includes(level);
}

function getCurrentYear() {
    return new Date().getFullYear();
}

function extractYear(text) {
    const match = text.match(/\b(20[2-9][0-9])\b/);
    return match ? parseInt(match[1]) : null;
}

// ============================================================
// 🔥🔥🔥 CHECK ENTITY SPECIFICATION (PLD v22.55 COMPLIANT) 🔥🔥🔥
// ============================================================
function checkEntitySpecification(text, entityType) {
    if (!text) return { isSpec: false, specType: null, specDetails: [], confidence: 0 };
    
    var lower = text.toLowerCase();
    var result = {
        isSpec: false,
        specType: null,
        specDetails: [],
        confidence: 0
    };

    // ============================================================
    // 1. PRODUK
    // ============================================================
    if (entityType === "produk") {
        var mutuList = PRODUK_SPECS.mutu || [];
        for (var i = 0; i < mutuList.length; i++) {
            if (new RegExp("\\b" + mutuList[i] + "\\b", "i").test(lower)) {
                result.isSpec = true;
                result.specType = "mutu";
                result.specDetails.push(mutuList[i]);
                result.confidence = 5;
                return result;
            }
        }

        var finishingList = PRODUK_SPECS.finishing || [];
        for (var i = 0; i < finishingList.length; i++) {
            if (new RegExp("\\b" + finishingList[i] + "\\b", "i").test(lower)) {
                result.isSpec = true;
                result.specType = "finishing";
                result.specDetails.push(finishingList[i]);
                result.confidence = 4;
                return result;
            }
        }

        if (/\d+\s*(m|mm|cm|meter|kg|ton|inch|inci|ft|feet)/gi.test(lower)) {
            result.isSpec = true;
            result.specType = "dimensi";
            result.specDetails.push("dimensi");
            result.confidence = 3;
            return result;
        }

        if (/\d+\s*[x×]\s*\d+\s*(cm|m|meter|mm)/gi.test(lower)) {
            result.isSpec = true;
            result.specType = "ukuran";
            result.specDetails.push("ukuran");
            result.confidence = 4;
            return result;
        }
    }

    // ============================================================
    // 2. MATERIAL
    // ============================================================
    if (entityType === "material") {
        var gradeList = MATERIAL_SPECS.grade || [];
        for (var i = 0; i < gradeList.length; i++) {
            if (new RegExp("\\b" + gradeList[i] + "\\b", "i").test(lower)) {
                result.isSpec = true;
                result.specType = "grade";
                result.specDetails.push(gradeList[i]);
                result.confidence = 5;
                return result;
            }
        }

        var finishingList = MATERIAL_SPECS.finishing || [];
        for (var i = 0; i < finishingList.length; i++) {
            if (new RegExp("\\b" + finishingList[i] + "\\b", "i").test(lower)) {
                result.isSpec = true;
                result.specType = "finishing";
                result.specDetails.push(finishingList[i]);
                result.confidence = 4;
                return result;
            }
        }

        if (/\d+\s*(mm|cm|m|meter|kg|ton|m3|liter)/gi.test(lower)) {
            result.isSpec = true;
            result.specType = "dimensi";
            result.specDetails.push("dimensi");
            result.confidence = 3;
            return result;
        }
    }

    // ============================================================
    // 3. SEWA
    // ============================================================
    if (entityType === "sewa") {
        var merekList = SEWA_SPECS.merek || [];
        for (var i = 0; i < merekList.length; i++) {
            if (new RegExp("\\b" + merekList[i] + "\\b", "i").test(lower)) {
                result.isSpec = true;
                result.specType = "merek";
                result.specDetails.push(merekList[i]);
                result.confidence = 5;
                return result;
            }
        }

        var tipeList = SEWA_SPECS.tipe || [];
        for (var i = 0; i < tipeList.length; i++) {
            if (new RegExp("\\b" + tipeList[i] + "\\b", "i").test(lower)) {
                result.isSpec = true;
                result.specType = "tipe";
                result.specDetails.push(tipeList[i]);
                result.confidence = 4;
                return result;
            }
        }

        if (/\d+\s*(ton|m3|kg|liter)/gi.test(lower)) {
            result.isSpec = true;
            result.specType = "kapasitas";
            result.specDetails.push("kapasitas");
            result.confidence = 3;
            return result;
        }
    }

    // ============================================================
    // 4. JASA
    // ============================================================
    if (entityType === "jasa") {
        var metodeList = JASA_SPECS.metode || [];
        for (var i = 0; i < metodeList.length; i++) {
            if (new RegExp("\\b" + metodeList[i] + "\\b", "i").test(lower)) {
                result.isSpec = true;
                result.specType = "metode";
                result.specDetails.push(metodeList[i]);
                result.confidence = 5;
                return result;
            }
        }

        var teknikList = JASA_SPECS.teknik || [];
        for (var i = 0; i < teknikList.length; i++) {
            if (new RegExp("\\b" + teknikList[i] + "\\b", "i").test(lower)) {
                result.isSpec = true;
                result.specType = "teknik";
                result.specDetails.push(teknikList[i]);
                result.confidence = 4;
                return result;
            }
        }

        var skalaList = JASA_SPECS.skala || [];
        for (var i = 0; i < skalaList.length; i++) {
            if (new RegExp("\\b" + skalaList[i] + "\\b", "i").test(lower)) {
                result.isSpec = true;
                result.specType = "skala";
                result.specDetails.push(skalaList[i]);
                result.confidence = 3;
                return result;
            }
        }

        if (/\d+\s*(m|meter|cm)/gi.test(lower)) {
            result.isSpec = true;
            result.specType = "kedalaman";
            result.specDetails.push("kedalaman");
            result.confidence = 3;
            return result;
        }
    }

    // ============================================================
    // 5. DESAIN
    // ============================================================
    if (entityType === "desain") {
        var gayaList = DESAIN_SPECS.gaya || [];
        for (var i = 0; i < gayaList.length; i++) {
            if (new RegExp("\\b" + gayaList[i] + "\\b", "i").test(lower)) {
                result.isSpec = true;
                result.specType = "gaya";
                result.specDetails.push(gayaList[i]);
                result.confidence = 5;
                return result;
            }
        }

        var fungsiList = DESAIN_SPECS.fungsi || [];
        for (var i = 0; i < fungsiList.length; i++) {
            if (new RegExp("\\b" + fungsiList[i] + "\\b", "i").test(lower)) {
                result.isSpec = true;
                result.specType = "fungsi";
                result.specDetails.push(fungsiList[i]);
                result.confidence = 4;
                return result;
            }
        }

        var konsepList = DESAIN_SPECS.konsep || [];
        for (var i = 0; i < konsepList.length; i++) {
            if (new RegExp("\\b" + konsepList[i] + "\\b", "i").test(lower)) {
                result.isSpec = true;
                result.specType = "konsep";
                result.specDetails.push(konsepList[i]);
                result.confidence = 4;
                return result;
            }
        }

        var warnaList = DESAIN_SPECS.warna || [];
        for (var i = 0; i < warnaList.length; i++) {
            if (new RegExp("\\b" + warnaList[i] + "\\b", "i").test(lower)) {
                result.isSpec = true;
                result.specType = "warna";
                result.specDetails.push(warnaList[i]);
                result.confidence = 3;
                return result;
            }
        }
    }

    return result;
}

// ============================================================
// 🔥🔥🔥 GET CORE WORDS (PLD v22.55 COMPLIANT) 🔥🔥🔥
// ============================================================
function getCoreWords(text, entityType) {
    if (!text) return [];

    var coreText = text.toLowerCase();

    // 1. Hapus price words
    var moneyWords = ['harga', 'biaya', 'tarif', 'estimasi', 'ongkos'];
    for (var i = 0; i < moneyWords.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + moneyWords[i] + "\\b", 'g'), '');
    }

    // 2. HAPUS HANYA 1 KATA AWAL ENTITY
    var entityFirstWords = {
      'jasa': 'jasa',
      'sewa': 'sewa',
      'produk': 'produk',
      'material': 'material',
      'desain': 'desain',
      'artikel': 'artikel'
    };

    var firstWord = entityFirstWords[entityType] || '';
    if (firstWord) {
      coreText = coreText.replace(new RegExp("\\b" + firstWord + "\\b", 'g'), '');
    }

    // 3. Hapus stopwords
    var stopwords = ["dan", "atau", "serta", "yang", "dari", "ke", "di", "untuk", "dengan", "ini", "itu", "akan", "telah", "sudah", "masih", "pada", "oleh", "karena", "sehingga", "setelah", "sebelum"];
    for (var i = 0; i < stopwords.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + stopwords[i] + "\\b", 'g'), ' ');
    }

    // 4. Hapus lokasi
    var LOCATION_WORDS = ["jakarta", "jakarta pusat", "jakarta barat", "jakarta selatan", "jakarta timur", "jakarta utara", "bogor", "depok", "tangerang", "bekasi", "bandung", "karawang", "purwakarta", "cikarang", "subang", "cirebon", "semarang", "solo", "surakarta", "pekalongan", "tegal", "magelang", "sukoharjo", "boyolali", "klaten", "jogja", "yogyakarta", "surabaya", "malang", "kediri", "gresik", "sidoarjo", "mojokerto", "pasuruan", "probolinggo", "jember", "banyuwangi", "madiun", "medan", "palembang", "pekanbaru", "padang", "lampung", "batam", "aceh", "jambi", "bengkulu", "pontianak", "balikpapan", "samarinda", "banjarmasin", "makassar", "manado", "palu", "kendari", "bali", "denpasar", "gianyar", "tabanan", "bangli", "karangasem", "klungkung", "buleleng", "mataram", "kupang", "terdekat", "sekitar", "dekat", "near"];
    for (var i = 0; i < LOCATION_WORDS.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + LOCATION_WORDS[i] + "\\b", 'g'), ' ');
    }

    // 5. Hapus sub-pillar keywords
    var subPillarWords = ['daftar', 'jenis', 'macam', 'kategori', 'tipe', 'list', 'katalog', 'rekomendasi', 'pilihan', 'variasi', 'model', 'gaya', 'varian', 'perbandingan', 'vs', 'versus', 'kelebihan', 'kekurangan', 'perbedaan', 'lebih baik', 'unggul', 'terbaik'];
    for (var i = 0; i < subPillarWords.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + subPillarWords[i] + "\\b", 'g'), ' ');
    }

    // 6. Hapus commercial words
    var COMMERCIAL_WORDS = ['jual', 'beli', 'order', 'pesan', 'booking', 'sewa', 'rental', 'rent', 'supplier', 'distributor', 'toko', 'shop', 'butuh', 'cari', 'mau', 'ingin', 'dapatkan', 'pesan sekarang', 'order sekarang'];
    for (var i = 0; i < COMMERCIAL_WORDS.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + COMMERCIAL_WORDS[i] + "\\b", 'g'), ' ');
    }

    var coreWords = coreText.split(/\s+/).filter(function(w) { return w.length > 2; });
    return coreWords;
}

// ============================================================
// 🔥🔥🔥 AMBIL NAMA DARI URL BERSIH (OPTIMIZED) 🔥🔥🔥
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
// 🔥🔥🔥 AUTO GENERATE GAMBAR DARI CANVAS (OPTIMIZED) 🔥🔥🔥
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

let canvasCache = null;

function createImageWithText(pageName, level, year) {
    perf.start('createImageWithText');
    const colors = getColorConfig(level);
    const needYearFlag = needYear(level);
    const displayYear = needYearFlag ? ' ' + year : '';
    const fullText = pageName + displayYear;

    const width = 820;
    const height = 360;
    const padding = 40;

    let canvas = canvasCache;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvasCache = canvas;
    }
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

    const result = canvas.toDataURL('image/png');
    perf.end('createImageWithText');
    return result;
}

// ============================================================
// 🔥🔥🔥 CEK & PERBAIKI GAMBAR (OPTIMIZED) 🔥🔥🔥
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
        img.style.maxWidth = '820px';
        img.style.height = 'auto';
        img.style.aspectRatio = '820/360';
        img.style.objectFit = 'contain';
        img.style.borderRadius = '8px';
        img.style.display = 'block';
        img.style.margin = '0 auto';
        img.style.padding = '0 10px';
        img.style.boxSizing = 'border-box';

        const styleId = 'responsive-image-style-v723';
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

    const autoImageDataUrl = createImageWithText(pageName, pageLevel, currentYear);
    const captionText = '📊 ' + displayName;

    let result = null;

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
    perf.end('fixImagesToFormat1');
    return figure;
}

// ============================================================
// 🔥🔥🔥 UPDATE H1 BERDASARKAN FOKUS KONTEN 🔥🔥🔥
// ============================================================
function updateH1ByFocus(pageLevel, contentFocus) {
    perf.start('updateH1ByFocus');
    
    // 🔥 FOKUS INFORMASI → HAPUS TAHUN
    if (contentFocus === 'informasi') {
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

    // 🔥 FOKUS HARGA/COMMERCIAL/GABUNG → WAJIB TAHUN
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
// 🔥🔥🔥 DETEKSI ENTITY TYPE — V37 COMPLIANT 🔥🔥🔥
// ============================================================
function getEntityTypeFromPLD() {
    const pldVersions = [
        { obj: window.pageLevelDetectorv22, name: 'v22.x' },
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
                    log(`Entity Type dari PLD ${pld.name}: ${entityType}`, "INFO");
                    return entityType;
                }
            } catch(e) {
                log(`Error calling PLD ${pld.name}: ${e.message}`, "WARN");
            }
        }
    }

    const bodyEntity = document.body.getAttribute('data-entity-type') || document.body.getAttribute('data-schema-entity-type');
    if (bodyEntity) {
        log(`Entity Type dari body attribute: ${bodyEntity}`, "INFO");
        return bodyEntity;
    }

    log('Entity Type tidak tersedia, menggunakan fallback detection', "INFO");
    return detectEntityTypeFallback();
}

function detectEntityTypeFallback() {
    const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
    const title = document.title.toLowerCase();
    const url = location.href.toLowerCase();
    const combined = h1 + " " + title + " " + url;

    // CEK DENGAN PLD v22.55
    if (window.pageLevelDetectorv22) {
        try {
            const slug = getCleanPageName();
            const result = window.pageLevelDetectorv22.detectForPrompt(slug);
            if (result && result.entityType) {
                return result.entityType;
            }
        } catch(e) {}
    }

    // CEK JASA
    const jasaKeywords = ['jasa', 'layanan', 'service', 'borongan', 'kontraktor', 'renovasi', 'pemasangan', 'instalasi', 'pengerjaan', 'perbaikan', 'pasang', 'bangun', 'coring', 'drilling', 'pengeboran'];
    for (let keyword of jasaKeywords) {
        if (combined.includes(keyword)) {
            const productExceptions = /(beton|readymix|precast|paving|panel|baja|besi|kayu)\s+(harga|spesifikasi|ukuran)/i.test(combined);
            if (!productExceptions) return 'jasa';
        }
    }

    // CEK SEWA
    const sewaKeywords = ['sewa', 'rental', 'sewa alat', 'rental alat', 'excavator', 'bulldozer', 'crane', 'alat berat', 'dozer', 'vibro', 'roller'];
    for (let keyword of sewaKeywords) {
        if (combined.includes(keyword)) {
            const productExceptions = /(sewa\s+beton|sewa\s+readymix|sewa\s+panel)/i.test(combined);
            if (!productExceptions) return 'sewa';
        }
    }

    // CEK DESAIN
    const desainKeywords = ['desain', 'interior', 'eksterior', 'arsitektur', 'layout', 'denah', 'gambar', 'konsep', 'rencana', 'modern', 'minimalis', 'klasik', 'tradisional', 'kontemporer'];
    for (let keyword of desainKeywords) {
        if (combined.includes(keyword)) {
            return 'desain';
        }
    }

    // CEK MATERIAL
    const materialKeywords = ['material', 'bahan bangunan', 'bahan konstruksi', 'agregat', 'pasir', 'batu split', 'semen', 'besi', 'baja', 'kayu', 'keramik', 'granit', 'marmer', 'gypsum', 'plafon', 'paving', 'bata', 'batako', 'hebel'];
    for (let keyword of materialKeywords) {
        if (combined.includes(keyword)) {
            return 'material';
        }
    }

    return 'produk';
}

// ============================================================
// 🔥🔥🔥 DETEKSI PAGE LEVEL — PLD v22.55 COMPLIANT 🔥🔥🔥
// ============================================================
function getPageLevelFromPLD() {
    perf.start('getPageLevelFromPLD');
    
    const pldVersions = [
        { obj: window.pageLevelDetectorv22, name: 'v22.x' },
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
                    log(`Page Level dari PLD ${pld.name}: ${level}`, "INFO");
                    perf.end('getPageLevelFromPLD');
                    return level;
                }
            } catch(e) {
                log(`Error calling PLD ${pld.name}: ${e.message}`, "WARN");
            }
        }
    }

    const bodyLevel = document.body.getAttribute('data-page-level') || document.body.getAttribute('data-schema-page-level');
    if (bodyLevel) {
        log(`Page Level dari body attribute: ${bodyLevel}`, "INFO");
        perf.end('getPageLevelFromPLD');
        return bodyLevel;
    }

    log('PLD tidak tersedia, menggunakan fallback detection', "INFO");
    const result = detectPageLevelFallback();
    perf.end('getPageLevelFromPLD');
    return result;
}

function detectPageLevelFallback() {
    perf.start('detectPageLevelFallback');
    const h1Element = domCache ? domCache.get('h1') : document.querySelector('h1');
    const h1 = h1Element?.innerText?.toLowerCase() || "";
    const title = document.title.toLowerCase();
    const url = location.href.toLowerCase();
    const combined = h1 + " " + title + " " + url;
    
    // 🔥 CEK DENGAN PLD v22.55 detectForPrompt
    if (window.pageLevelDetectorv22) {
        try {
            const slug = getCleanPageName();
            const entityType = getEntityTypeFromPLD();
            const result = window.pageLevelDetectorv22.detectForPrompt(slug, entityType);
            if (result && result.isValid) {
                log(`🔥 Page Level from PLD v22.55: ${result.pageLevel}`, "SUCCESS");
                perf.end('detectPageLevelFallback');
                return result.pageLevel;
            }
        } catch(e) {
            log(`Error calling PLD v22.55: ${e.message}`, "WARN");
        }
    }

    // 🔥 CEK SPESIFIKASI PER ENTITY (VARIANT)
    const entityType = getEntityTypeFromPLD();
    const specResult = checkEntitySpecification(combined, entityType);
    if (specResult.isSpec) {
        if (/\d+\s*(m|mm|cm|meter|kg|ton|inch|inci|k|m3|liter)/gi.test(combined)) {
            log('🔬 SUB-VARIANT terdeteksi', "SUCCESS");
            perf.end('detectPageLevelFallback');
            return "sub-variant";
        }
        log('🔬 VARIANT terdeteksi', "SUCCESS");
        perf.end('detectPageLevelFallback');
        return "variant";
    }

    // 🔥 CEK LOCATION → MONEY_CHILD
    const locations = ["jakarta", "bekasi", "bogor", "depok", "tangerang", "karawang", "surabaya", "bandung"];
    for (let loc of locations) {
        if (combined.includes(loc)) {
            log('📍 MONEY_CHILD terdeteksi', "SUCCESS");
            perf.end('detectPageLevelFallback');
            return "money-child";
        }
    }

    // 🔥 CEK PRICE + SPEC → MONEY_PAGE
    const hasPrice = /\b(harga|biaya|tarif|estimasi)\b/i.test(combined);
    const hasSpec = specResult.isSpec;
    if (hasPrice && hasSpec) {
        log('💰 MONEY_PAGE (price+spec) terdeteksi', "SUCCESS");
        perf.end('detectPageLevelFallback');
        return "money-page";
    }

    // 🔥 CEK PRICE → MONEY_MASTER atau MONEY_PAGE (CORE LOGIC)
    if (hasPrice) {
        const coreWords = getCoreWords(combined, entityType);
        if (coreWords.length <= 2) {
            log('🏛️ MONEY_MASTER terdeteksi (core: ' + coreWords.length + ' kata)', "SUCCESS");
            perf.end('detectPageLevelFallback');
            return "money-master";
        }
        log('💰 MONEY_PAGE terdeteksi (core: ' + coreWords.length + ' kata)', "SUCCESS");
        perf.end('detectPageLevelFallback');
        return "money-page";
    }

    // 🔥 CEK SUB-PILLAR
    if (/\b(daftar|jenis|kategori)\b/i.test(combined)) {
        perf.end('detectPageLevelFallback');
        return "sub-pillar-tipe-2";
    }
    if (/\b(perbandingan|vs|versus)\b/i.test(combined)) {
        perf.end('detectPageLevelFallback');
        return "sub-pillar-tipe-1";
    }

    perf.end('detectPageLevelFallback');
    return "pillar";
}

// ============================================================
// 🔥🔥🔥 DETEKSI FOKUS KONTEN 🔥🔥🔥
// ============================================================
function detectContentFocus() {
    perf.start('detectContentFocus');
    
    const h1Element = domCache ? domCache.get('h1') : document.querySelector('h1');
    const h1Text = h1Element ? h1Element.innerText.toLowerCase() : '';
    const title = document.title?.toLowerCase() || '';
    const contentSelectors = ['.post-body.entry-content', '.post-body', 'article', 'main', 'section'];
    let content = '';
    for (const selector of contentSelectors) {
        const el = domCache ? domCache.get(selector) : document.querySelector(selector);
        if (el) {
            content = el.innerText?.toLowerCase() || '';
            break;
        }
    }
    const url = location.href.toLowerCase();
    const combined = h1Text + ' ' + title + ' ' + content + ' ' + url;

    // 🔥 CEK COMMERCIAL
    const commercialKeywords = ['jual', 'beli', 'order', 'pesan', 'booking', 'dapatkan', 'pesan sekarang', 'order sekarang', 'beli sekarang'];
    for (let keyword of commercialKeywords) {
        if (combined.includes(keyword)) {
            log('🛒 FOKUS: COMMERCIAL', "COMMERCIAL");
            perf.end('detectContentFocus');
            return 'commercial';
        }
    }

    // 🔥 CEK HARGA
    const hasYearInH1 = /\b(19|20)\d{2}\b/.test(h1Text);
    if (hasYearInH1) {
        log('📅 H1 mengandung tahun → FOKUS: HARGA', "FOCUS");
        perf.end('detectContentFocus');
        return 'harga';
    }

    const hasRpInH1 = /Rp\s*[\d.,]+/.test(h1Text);
    if (hasRpInH1) {
        log('💰 H1 mengandung Rp → FOKUS: HARGA', "FOCUS");
        perf.end('detectContentFocus');
        return 'harga';
    }

    const hasHargaInH1 = /harga|biaya|tarif|estimasi/.test(h1Text);
    if (hasHargaInH1) {
        log('💰 H1 mengandung kata harga → FOKUS: HARGA', "FOCUS");
        perf.end('detectContentFocus');
        return 'harga';
    }

    // 🔥 CEK GABUNG (ada harga + informasi + commercial)
    const hasHargaInContent = /harga|biaya|tarif|estimasi|Rp/.test(content);
    const hasCommercialInContent = commercialKeywords.some(k => content.includes(k));
    const hasInformasiInContent = /panduan|spesifikasi|keunggulan|cara memilih|tips|perbedaan|jenis|apa itu/.test(content);

    if (hasHargaInContent && hasCommercialInContent && hasInformasiInContent) {
        log('📚 GABUNG: Informasi + Harga + Commercial', "FOCUS");
        perf.end('detectContentFocus');
        return 'gabung';
    }

    // 🔥 CEK INFORMASI
    const informatifKeywords = ['panduan', 'spesifikasi', 'keunggulan', 'cara memilih', 'tips', 'perbedaan', 'jenis', 'apa itu', 'pengertian', 'definisi'];
    for (let keyword of informatifKeywords) {
        if (h1Text.includes(keyword) || title.includes(keyword)) {
            log('📚 FOKUS: INFORMASI', "FOCUS");
            perf.end('detectContentFocus');
            return 'informasi';
        }
    }

    // 🔥 SCORING SYSTEM
    const eduKeywords = ['panduan', 'spesifikasi', 'keunggulan', 'ukuran', 'dimensi', 'cara memilih', 'tips', 'informasi', 'pengertian', 'definisi', 'jenis', 'macam', 'tipe', 'perbedaan', 'kelebihan', 'kekurangan', 'material', 'bahan', 'standar', 'mutu'];
    const priceKeywords = ['harga', 'biaya', 'estimasi', 'tarif', 'mulai dari', 'per meter', 'per lembar', 'per kubik', 'per unit', 'promo', 'diskon', 'penawaran', 'daftar harga', 'tabel harga', 'rincian biaya', 'simulasi biaya', 'total biaya', 'anggaran', 'budget'];
    const commercialScore = commercialKeywords.filter(k => combined.includes(k)).length;

    let eduScore = 0, priceScore = 0;
    eduKeywords.forEach(k => { if (combined.includes(k)) eduScore++; });
    priceKeywords.forEach(k => { if (combined.includes(k)) priceScore++; });

    priceScore += commercialScore * 2;

    log(`📊 Edu: ${eduScore}, Price: ${priceScore}, Commercial: ${commercialScore}`, "FOCUS");

    if (priceScore > eduScore * 1.5 && commercialScore > 0) {
        log('🎯 FOKUS: COMMERCIAL', "COMMERCIAL");
        perf.end('detectContentFocus');
        return 'commercial';
    }

    if (priceScore > eduScore * 1.3) {
        log('🎯 FOKUS: HARGA', "FOCUS");
        perf.end('detectContentFocus');
        return 'harga';
    }

    if (eduScore > priceScore * 1.3) {
        log('🎯 FOKUS: INFORMASI', "FOCUS");
        perf.end('detectContentFocus');
        return 'informasi';
    }

    log('🎯 FOKUS: INFORMASI (default)', "FOCUS");
    perf.end('detectContentFocus');
    return 'informasi';
}

// ============================================================
// 🔥🔥🔥 IS JASA OR SEWA — V37 COMPLIANT 🔥🔥🔥
// ============================================================
function isJasaOrSewa(entityType) {
    return entityType === 'jasa' || entityType === 'sewa';
}

function isServicePage(entityType) {
    return isJasaOrSewa(entityType);
}

// ============================================================
// 🔥🔥🔥 SCHEMA FUNCTIONS 🔥🔥🔥
// ============================================================
function hasPriceOnPage() {
    const text = document.body.innerText;
    return /Rp\s*[\d.,]+/.test(text);
}

function getParentFromBreadcrumb(currentUrl) {
    const breadcrumbSelectors = [
        '.breadcrumbs a', '.breadcrumb a', '.nav-trail a',
        '.breadcrumb-item a', '.crumbs a', '.breadcrumb-link',
        '[aria-label="breadcrumb"] a', '.post-breadcrumb a',
        '.breadcrumb-nav a', '.nav-breadcrumb a'
    ];

    let breadcrumbLinks = [];
    for (let selector of breadcrumbSelectors) {
        const links = domCache ? domCache.getAll(selector) : document.querySelectorAll(selector);
        if (links.length > 0) { breadcrumbLinks = Array.from(links); break; }
    }

    if (breadcrumbLinks.length === 0) {
        const nav = domCache ? domCache.get('nav') : document.querySelector('nav');
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
// 🔥🔥🔥 DETEKSI HALAMAN LAYAK GAMBAR 🔥🔥🔥
// ============================================================
function isImageEligible(pageLevel) {
    perf.start('isImageEligible');
    log(`Checking image eligibility for page level: ${pageLevel}`, "IMAGE");

    const mandatoryImageLevels = [
        'money-master', 
        'money-page', 
        'money-child',
        'variant',
        'sub-variant'
    ];
    
    if (mandatoryImageLevels.includes(pageLevel)) {
        log(`✅ WAJIB GAMBAR (level: ${pageLevel})`, "SUCCESS");
        perf.end('isImageEligible');
        return true;
    }

    if (pageLevel === 'pillar') {
        const h1Element = domCache ? domCache.get('h1') : document.querySelector('h1');
        const h1 = h1Element?.innerText?.toLowerCase() || "";
        const title = document.title.toLowerCase();
        const combined = h1 + " " + title;

        const pillarEdukasi = ["panduan", "tips", "cara", "apa itu", "pengertian", "definisi", "overview", "komprehensif", "langkah", "tutorial", "pedoman", "petunjuk", "kenali", "mengenal", "memahami", "belajar"];
        for (let keyword of pillarEdukasi) {
            if (combined.includes(keyword)) {
                log(`⏭️ Skip gambar: Pillar edukasi murni (keyword: "${keyword}")`, "SKIP");
                perf.end('isImageEligible');
                return false;
            }
        }
        perf.end('isImageEligible');
        return true;
    }

    if (pageLevel === 'sub-pillar-tipe-1' || pageLevel === 'sub-pillar-tipe-2') {
        log(`✅ LAYAK GAMBAR (level: ${pageLevel})`, "SUCCESS");
        perf.end('isImageEligible');
        return true;
    }

    const contentSelectors = ['.post-body.entry-content', '.post-body', 'article', 'main'];
    let content = '';
    for (const selector of contentSelectors) {
        const el = domCache ? domCache.get(selector) : document.querySelector(selector);
        if (el) {
            content = el.innerText || '';
            break;
        }
    }
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < CONFIG.SKIP_WORD_COUNT) {
        log(`⏭️ Skip gambar: Konten terlalu pendek (${wordCount} kata < ${CONFIG.SKIP_WORD_COUNT})`, "SKIP");
        perf.end('isImageEligible');
        return false;
    }

    const hasImage = document.querySelector('img:not([src*="logo"]):not([src*="icon"]):not([src*="avatar"])');
    if (hasImage) {
        log(`✅ Halaman sudah memiliki gambar, tetap layak`, "SUCCESS");
        perf.end('isImageEligible');
        return true;
    }

    log(`⏭️ Skip gambar: Halaman tidak masuk kriteria layak`, "SKIP");
    perf.end('isImageEligible');
    return false;
}

// ============================================================
// 🔥🔥🔥 WAIT PLD 🔥🔥🔥
// ============================================================
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
// 🚀 MAIN FUNCTION 🔥🔥🔥
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(async () => {
        perf.start('init');
        log("═══════════════════════════════════════════════════", "INFO");
        log("AUTO SCHEMA UNIVERSAL v7.23 — V37 COMPLIANT + PLD v22.55 + OPTIMIZED", "INFO");
        log("═══════════════════════════════════════════════════", "INFO");
        
        try {
            // ===== STEP 1: TUNGGU BREADCRUMB =====
            log('🍞 Menunggu breadcrumb...', "BREADCRUMB");
            const breadcrumbReady = await waitForBreadcrumb(CONFIG.BREADCRUMB_TIMEOUT);
            log(`🍞 Breadcrumb: ${breadcrumbReady ? '✅ READY' : '⏰ TIMEOUT'}`, "BREADCRUMB");
            
            // ===== STEP 2: TUNGGU PLD =====
            log('⏳ Menunggu PLD...', "INFO");
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

            // ===== STEP 4: DAPATKAN PAGE LEVEL & ENTITY TYPE =====
            const pageLevel = getPageLevelFromPLD();
            const entityType = getEntityTypeFromPLD();
            const contentFocus = detectContentFocus();
            
            log(`📌 Page Level: ${pageLevel}`, "SUCCESS");
            log(`📌 Entity Type: ${entityType}`, "SUCCESS");
            log(`📌 Content Focus: ${contentFocus}`, "FOCUS");

            // ===== STEP 5: UPDATE H1 BERDASARKAN FOKUS KONTEN =====
            log('📅 UPDATE H1 BERDASARKAN FOKUS KONTEN:', "YEAR");
            const h1Updated = updateH1ByFocus(pageLevel, contentFocus);

            // ===== STEP 6: CEK & PERBAIKI GAMBAR =====
            const isEligible = isImageEligible(pageLevel);
            let pageImage = IMAGE_CONFIG.LOGO_IMAGE;

            if (isEligible) {
                log(`✅ Halaman LAYAK mendapat gambar, memproses...`, "IMAGE");
                try {
                    const fixedFigure = fixImagesToFormat1(pageLevel);
                    if (fixedFigure) {
                        const img = fixedFigure.querySelector('img');
                        if (img) pageImage = img.src || IMAGE_CONFIG.LOGO_IMAGE;
                    }
                } catch(e) {
                    log(`Error processing images: ${e.message}`, "ERROR");
                    pageImage = IMAGE_CONFIG.LOGO_IMAGE;
                }
            } else {
                log(`⏭️ Halaman TIDAK LAYAK mendapat gambar, skip`, "SKIP");
                const existingImage = document.querySelector('img:not([src*="logo"]):not([src*="icon"]):not([src*="avatar"])');
                if (existingImage) {
                    pageImage = existingImage.src || IMAGE_CONFIG.LOGO_IMAGE;
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

            const parentData = getParentFromBreadcrumb(cleanUrl);
            const parentUrls = [{ "@type": "WebPage", "@id": parentData.parentUrl, name: parentData.parentName || "Parent Page" }];

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

            // ============================================================
            // 🔥🔥🔥 priceValidUntil DARI AED 🔥🔥🔥
            // ============================================================
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

            // ✅ V37: CEK JASA atau SEWA/RENTAL
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
                log(`✅ Service schema (${entityType})`, "SUCCESS");

                // ✅ V37: Product schema untuk JASA & SEWA jika ada harga
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
                    log(`✅ Product schema (${tableOffers.length} offers) — ${entityType}`, "SUCCESS");
                } else {
                    log(`⏭️ Skip Product schema (tidak ada harga/offers)`, "SKIP");
                }
            } else {
                log(`⏭️ Skip Service schema (entity: ${entityType})`, "SKIP");
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
            log(`  Page Level     : ${pageLevel}`, "SUCCESS");
            log(`  Entity Type    : ${entityType}`, "SUCCESS");
            log(`  Content Focus  : ${contentFocus}`, "FOCUS");
            log(`  Breadcrumb     : ${breadcrumbReady ? '✅ READY' : '⏰ TIMEOUT'}`, "BREADCRUMB");
            log(`  AED            : ${aed ? '✅ READY' : '❌ FALLBACK'}`, "AED");
            log(`  Offers         : ${tableOffers.length}`, "TABLE");
            log(`  priceValidUntil: ${priceValidUntil}`, "AED");
            log(`  Service Schema : ${isService ? '✅' : '❌'}`, "SUCCESS");
            log(`  Product Schema : ${(isService && hasPrice && tableOffers.length > 0) ? '✅' : '❌'}`, "SUCCESS");
            log(`  Internal Links : ${internalLinks.length}`, "SUCCESS");
            log(`  Image Eligible : ${isEligible ? '✅' : '❌'}`, "IMAGE");
            log(`  Auto Year H1   : ${h1Updated ? '✅ UPDATE' : '⏭️ SKIP/STOP'}`, "YEAR");
            log(`  DOM CACHE      : ${CONFIG.CACHE_DOM_ELEMENTS ? '✅ ACTIVE' : '❌ INACTIVE'}`, "CACHE");
            log(`  CORB PREVENTION: ✅ ACTIVE`, "CORB");
            log(`  V37 COMPLIANT  : ✅`, "SUCCESS");
            log(`  PLD v22.55     : ✅`, "SUCCESS");
            log("═══════════════════════════════════════════════════", "INFO");
            log("AUTO SCHEMA UNIVERSAL v7.23 SELESAI", "SUCCESS");
            
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
    if (canvasCache) {
        canvasCache = null;
        log("✅ Canvas cache cleared", "CACHE");
    }
    log("✅ Resources cleaned up", "SUCCESS");
}

window.addEventListener('beforeunload', cleanup);
