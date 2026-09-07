/* ⚡ AUTO SCHEMA UNIVERSAL v7.22 — V37 COMPLIANT + WAIT AED & BREADCRUMB + PLD v22.55 + FAQ + BREADCRUMB SCHEMA */
// ============================================================
// 🔥🔥🔥 BLOKIR SEMUA EXTERNAL REQUEST 🔥🔥🔥
// ============================================================
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  if (typeof url === 'string' && (url.includes('raw.githack.com') || url.includes('github.com') || url.includes('gist.github.com'))) {
    console.warn('[Schema v7.22] 🚫 Blocked external fetch (CORB prevention):', url);
    return Promise.reject(new Error('Blocked by CORB prevention'));
  }
  return originalFetch.apply(this, args);
};

const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  if (typeof url === 'string' && (url.includes('raw.githack.com') || url.includes('github.com') || url.includes('gist.github.com'))) {
    console.warn('[Schema v7.22] 🚫 Blocked external XHR (CORB prevention):', url);
    throw new Error('Blocked by CORB prevention');
  }
  return originalXHROpen.call(this, method, url, ...rest);
};

// ============================================================
// 🔥🔥🔥 KONFIGURASI 🔥🔥🔥
// ============================================================
const IMAGE_CONFIG = {
  FALLBACK_IMAGE: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiWWAP6ezcmzgbGtHmmJqBjYkbsdQBrwCeC9pl9ocjL-VSQYftirdvXAF1T-eg_QMSqu1WiFidDc9fnChi0yaOqi0Dd6EVMy4ZX3P7vccY4XJMu-7k2TGVd5TS1wIG5jgIm_6beYVb2zuNQGS7eBuODJqd20c4ckvd0-HaEqGf4W-B_750I91wi9IhqqnI/s320/No_Image_Available.jpg",
  LOGO_IMAGE: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png"
};

// ============================================================
// 🔥🔥🔥 SPESIFIKASI PER ENTITY (PLD v22.55 COMPLIANT)
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
// 🔥🔥🔥 WAIT FUNCTIONS 🔥🔥🔥
// ============================================================

// ✅ TUNGGU BREADCRUMB TERBENTUK
function waitForBreadcrumb(timeout = 3000) {
  return new Promise((resolve) => {
    const startTime = Date.now();

    function checkBreadcrumb() {
      const breadcrumbSelectors = [
        '.breadcrumbs',
        '.breadcrumb',
        '.nav-trail',
        '.breadcrumb-item',
        '.crumbs',
        '.breadcrumb-link',
        '[aria-label="breadcrumb"]',
        '.post-breadcrumb',
        '.breadcrumb-nav',
        '.nav-breadcrumb'
      ];

      for (const selector of breadcrumbSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          const links = element.querySelectorAll('a');
          if (links.length > 0) {
            console.log(`[Schema v7.22] 🍞 Breadcrumb ditemukan (${selector}) — ${links.length} link`);
            resolve(true);
            return;
          }
          if (element.innerText.trim().length > 0) {
            console.log(`[Schema v7.22] 🍞 Breadcrumb ditemukan (${selector}) — ada teks`);
            resolve(true);
            return;
          }
        }
      }

      if (Date.now() - startTime > timeout) {
        console.log(`[Schema v7.22] ⏰ Breadcrumb timeout (${timeout}ms), lanjutkan`);
        resolve(false);
        return;
      }

      setTimeout(checkBreadcrumb, 100);
    }

    checkBreadcrumb();
  });
}

// ✅ TUNGGU AEDMetaDates DARI SMART EVERGREEN DETECTOR
function waitForAEDMetaDates(timeout = 10000) {
  return new Promise((resolve) => {
    // CEK APAKAH SUDAH ADA
    if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
      console.log('[Schema v7.22] ✅ AEDMetaDates ready:', window.AEDMetaDates.dateModified);
      resolve(window.AEDMetaDates);
      return;
    }

    // TUNGGU EVENT DARI AED
    const onReady = () => {
      if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
        console.log('[Schema v7.22] ✅ AEDMetaDates ready (event)');
        resolve(window.AEDMetaDates);
      } else {
        resolve(null);
      }
    };

    window.addEventListener("detectEvergreenReady", onReady, { once: true });

    // CEK BERKALA (100ms interval) SAMPAI TIMEOUT
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
        clearInterval(interval);
        console.log('[Schema v7.22] ✅ AEDMetaDates ready (interval)');
        resolve(window.AEDMetaDates);
        return;
      }

      if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        console.warn('[Schema v7.22] ⏰ AEDMetaDates timeout, using fallback');
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
// 🔥🔥🔥 AMBIL NAMA DARI URL BERSIH 🔥🔥🔥
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
    
    console.log('[Schema v7.22] 📝 Clean page name from URL:', cleanName);
    return cleanName;
}

// ============================================================
// 🔥🔥🔥 CHECK ENTITY SPECIFICATION (PLD v22.55 COMPLIANT)
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
// 🔥🔥🔥 GET CORE WORDS (PLD v22.55 COMPLIANT)
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
// 🔥🔥🔥 AUTO GENERATE GAMBAR DARI CANVAS 🔥🔥🔥
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
    const colors = getColorConfig(level);
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
// 🔥🔥🔥 CEK & PERBAIKI GAMBAR 🔥🔥🔥
// ============================================================
function fixImagesToFormat1(pageLevel) {
    console.log('[Schema v7.22 📸] Checking images in content...');

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

        const styleId = 'responsive-image-style-v722';
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
        console.log('[Schema v7.22 📸] Image found in content, fixing for SEO...');

        const img = targetImage;
        const figure = targetFigure || img.closest('figure');

        const currentSrc = img.src || '';
        if (currentSrc.includes('No_Image') || currentSrc.includes('placeholder') || !currentSrc) {
            img.src = autoImageDataUrl;
        } else {
            console.log('[Schema v7.22 📸] Existing image preserved, only updating attributes');
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
            console.log('[Schema v7.22 📸] Wrapping image with FIGURE...');
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

        console.log('[Schema v7.22 📸] ✅ Image fixed with SEO FIGURE');
        return figure;
    }

    console.log('[Schema v7.22 📸] No image found, creating new responsive FIGURE...');

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

    console.log('[Schema v7.22 📸] ✅ New responsive FIGURE created');
    return figure;
}

// ============================================================
// 🔥🔥🔥 UPDATE H1 BERDASARKAN FOKUS KONTEN 🔥🔥🔥
// ============================================================
function updateH1ByFocus(pageLevel, contentFocus) {
    // 🔥 FOKUS INFORMASI → HAPUS TAHUN
    if (contentFocus === 'informasi') {
        const h1 = document.querySelector('h1');
        if (h1) {
            const originalText = h1.innerText;
            const cleanedText = originalText
                .replace(/\b(19|20)\d{2}\b/g, '')
                .replace(/\s{2,}/g, ' ')
                .trim();
            if (cleanedText !== originalText) {
                h1.innerText = cleanedText;
                console.log('[Schema v7.22] ✅ H1: Tahun dihapus (INFORMASI) → "' + cleanedText + '"');
                return true;
            }
        }
        return false;
    }

    // 🔥 FOKUS HARGA/COMMERCIAL/GABUNG → WAJIB TAHUN
    if (!needYear(pageLevel)) {
        console.log('[Schema v7.22] ⏭️ Level ini TIDAK butuh tahun di H1');
        return false;
    }

    const currentYear = getCurrentYear();
    const h1 = document.querySelector('h1');
    if (!h1) {
        console.log('[Schema v7.22] ⚠️ Tidak ada H1 ditemukan');
        return false;
    }

    const originalText = h1.innerText;
    const detectedYear = extractYear(originalText);

    if (!detectedYear) {
        const newText = originalText + ' ' + currentYear;
        h1.innerText = newText;
        console.log('[Schema v7.22] ✅ H1: Tahun ditambahkan → "' + newText + '"');
        return true;
    }

    if (detectedYear < currentYear) {
        const newText = originalText.replace(/\b(19|20)\d{2}\b/, currentYear);
        h1.innerText = newText;
        console.log('[Schema v7.22] ✅ H1: Tahun diupdate ' + detectedYear + ' → ' + currentYear);
        return true;
    }

    console.log('[Schema v7.22] ✅ H1: Tahun sudah sesuai (' + detectedYear + ')');
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
                    console.log(`[Schema v7.22] Entity Type dari PLD ${pld.name}: ${entityType}`);
                    return entityType;
                }
            } catch(e) {
                console.warn(`[Schema v7.22] Error calling PLD ${pld.name}:`, e.message);
            }
        }
    }

    const bodyEntity = document.body.getAttribute('data-entity-type') || document.body.getAttribute('data-schema-entity-type');
    if (bodyEntity) {
        console.log(`[Schema v7.22] Entity Type dari body attribute: ${bodyEntity}`);
        return bodyEntity;
    }

    console.log('[Schema v7.22] Entity Type tidak tersedia, menggunakan fallback detection');
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
                    console.log(`[Schema v7.22] Page Level dari PLD ${pld.name}: ${level}`);
                    return level;
                }
            } catch(e) {
                console.warn(`[Schema v7.22] Error calling PLD ${pld.name}:`, e.message);
            }
        }
    }

    const bodyLevel = document.body.getAttribute('data-page-level') || document.body.getAttribute('data-schema-page-level');
    if (bodyLevel) {
        console.log(`[Schema v7.22] Page Level dari body attribute: ${bodyLevel}`);
        return bodyLevel;
    }

    console.log('[Schema v7.22] PLD tidak tersedia, menggunakan fallback detection');
    return detectPageLevelFallback();
}

function detectPageLevelFallback() {
    const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
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
                console.log(`[Schema v7.22] 🔥 Page Level from PLD v22.55: ${result.pageLevel}`);
                return result.pageLevel;
            }
        } catch(e) {
            console.warn('[Schema v7.22] Error calling PLD v22.55:', e);
        }
    }

    // 🔥 CEK SPESIFIKASI PER ENTITY (VARIANT)
    const entityType = getEntityTypeFromPLD();
    const specResult = checkEntitySpecification(combined, entityType);
    if (specResult.isSpec) {
        if (/\d+\s*(m|mm|cm|meter|kg|ton|inch|inci|k|m3|liter)/gi.test(combined)) {
            console.log('[Schema v7.22] 🔬 SUB-VARIANT terdeteksi');
            return "sub-variant";
        }
        console.log('[Schema v7.22] 🔬 VARIANT terdeteksi');
        return "variant";
    }

    // 🔥 CEK LOCATION → MONEY_CHILD
    const locations = ["jakarta", "bekasi", "bogor", "depok", "tangerang", "karawang", "surabaya", "bandung"];
    for (let loc of locations) {
        if (combined.includes(loc)) {
            console.log('[Schema v7.22] 📍 MONEY_CHILD terdeteksi');
            return "money-child";
        }
    }

    // 🔥 CEK PRICE + SPEC → MONEY_PAGE
    const hasPrice = /\b(harga|biaya|tarif|estimasi)\b/i.test(combined);
    const hasSpec = specResult.isSpec;
    if (hasPrice && hasSpec) {
        console.log('[Schema v7.22] 💰 MONEY_PAGE (price+spec) terdeteksi');
        return "money-page";
    }

    // 🔥 CEK PRICE → MONEY_MASTER atau MONEY_PAGE (CORE LOGIC)
    if (hasPrice) {
        const coreWords = getCoreWords(combined, entityType);
        if (coreWords.length <= 2) {
            console.log('[Schema v7.22] 🏛️ MONEY_MASTER terdeteksi (core: ' + coreWords.length + ' kata)');
            return "money-master";
        }
        console.log('[Schema v7.22] 💰 MONEY_PAGE terdeteksi (core: ' + coreWords.length + ' kata)');
        return "money-page";
    }

    // 🔥 CEK SUB-PILLAR
    if (/\b(daftar|jenis|kategori)\b/i.test(combined)) return "sub-pillar-tipe-2";
    if (/\b(perbandingan|vs|versus)\b/i.test(combined)) return "sub-pillar-tipe-1";

    return "pillar";
}

// ============================================================
// 🔥🔥🔥 DETEKSI FOKUS KONTEN 🔥🔥🔥
// ============================================================
function detectContentFocus() {
    const h1 = document.querySelector('h1');
    const h1Text = h1 ? h1.innerText.toLowerCase() : '';
    const title = document.title?.toLowerCase() || '';
    const content = document.querySelector('.post-body.entry-content, .post-body, article, main, section')?.innerText?.toLowerCase() || '';
    const url = location.href.toLowerCase();
    const combined = h1Text + ' ' + title + ' ' + content + ' ' + url;

    // 🔥 CEK COMMERCIAL (jual/beli/order)
    const commercialKeywords = ['jual', 'beli', 'order', 'pesan', 'booking', 'dapatkan', 'pesan sekarang', 'order sekarang', 'beli sekarang'];
    for (let keyword of commercialKeywords) {
        if (combined.includes(keyword)) {
            console.log('[Schema v7.22] 🛒 FOKUS: COMMERCIAL');
            return 'commercial';
        }
    }

    // 🔥 CEK HARGA
    const hasYearInH1 = /\b(19|20)\d{2}\b/.test(h1Text);
    if (hasYearInH1) {
        console.log('[Schema v7.22] 📅 H1 mengandung tahun → FOKUS: HARGA');
        return 'harga';
    }

    const hasRpInH1 = /Rp\s*[\d.,]+/.test(h1Text);
    if (hasRpInH1) {
        console.log('[Schema v7.22] 💰 H1 mengandung Rp → FOKUS: HARGA');
        return 'harga';
    }

    const hasHargaInH1 = /harga|biaya|tarif|estimasi/.test(h1Text);
    if (hasHargaInH1) {
        console.log('[Schema v7.22] 💰 H1 mengandung kata harga → FOKUS: HARGA');
        return 'harga';
    }

    // 🔥 CEK GABUNG (ada harga + informasi + commercial)
    const hasHargaInContent = /harga|biaya|tarif|estimasi|Rp/.test(content);
    const hasCommercialInContent = commercialKeywords.some(k => content.includes(k));
    const hasInformasiInContent = /panduan|spesifikasi|keunggulan|cara memilih|tips|perbedaan|jenis|apa itu/.test(content);

    if (hasHargaInContent && hasCommercialInContent && hasInformasiInContent) {
        console.log('[Schema v7.22] 📚 GABUNG: Informasi + Harga + Commercial');
        return 'gabung';
    }

    // 🔥 CEK INFORMASI
    const informatifKeywords = ['panduan', 'spesifikasi', 'keunggulan', 'cara memilih', 'tips', 'perbedaan', 'jenis', 'apa itu', 'pengertian', 'definisi'];
    for (let keyword of informatifKeywords) {
        if (h1Text.includes(keyword) || title.includes(keyword)) {
            console.log('[Schema v7.22] 📚 FOKUS: INFORMASI');
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

    console.log(`[Schema v7.22] 📊 Edu: ${eduScore}, Price: ${priceScore}, Commercial: ${commercialScore}`);

    if (priceScore > eduScore * 1.5 && commercialScore > 0) {
        console.log('[Schema v7.22] 🎯 FOKUS: COMMERCIAL');
        return 'commercial';
    }

    if (priceScore > eduScore * 1.3) {
        console.log('[Schema v7.22] 🎯 FOKUS: HARGA');
        return 'harga';
    }

    if (eduScore > priceScore * 1.3) {
        console.log('[Schema v7.22] 🎯 FOKUS: INFORMASI');
        return 'informasi';
    }

    console.log('[Schema v7.22] 🎯 FOKUS: INFORMASI (default)');
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
    const offers = [];
    const seenItems = new Set();
    const tables = document.querySelectorAll('table');

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
                        if (priceValue > 10000 && priceValue < 1000000000) price = priceValue;
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
                if (price > 10000 && price < 1000000000) {
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

    return offers;
}

function generateInternalLinks() {
    const containers = ["article", "main", ".post-body"].map(sel => document.querySelector(sel)).filter(Boolean);
    const links = containers.flatMap(c => Array.from(c.querySelectorAll("a")))
        .map(a => a.href)
        .filter(href => href && href.includes(location.hostname) && !href.includes("#") && !href.match(/(\/search|\/feed|\/label)/i));
    const unique = [...new Set(links)].slice(0, 40);
    return unique.map((u, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: u,
        name: decodeURIComponent(u.split("/").pop().replace(".html", "").replace(/-/g, " "))
    }));
}

// ============================================================
// 🔥🔥🔥 GENERATE FAQ SCHEMA (NEW!) 🔥🔥🔥
// ============================================================
function generateFAQSchema(cleanUrl) {
    const faqItems = [];
    const faqElements = document.querySelectorAll('.faq-item, .faq-question, .faq-answer, [class*="faq"]');
    
    faqElements.forEach(el => {
        const question = el.querySelector('.faq-question, .question, [class*="question"]')?.innerText?.trim();
        const answer = el.querySelector('.faq-answer, .answer, [class*="answer"]')?.innerText?.trim();
        if (question && answer && question.length > 5 && answer.length > 10) {
            faqItems.push({
                "@type": "Question",
                "name": question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": answer
                }
            });
        }
    });

    if (faqItems.length >= 3) {
        console.log(`[Schema v7.22] ✅ FAQ Schema: ${faqItems.length} questions`);
        return {
            "@type": "FAQPage",
            "@id": cleanUrl + "#faq",
            "mainEntity": faqItems
        };
    }
    return null;
}

// ============================================================
// 🔥🔥🔥 GENERATE BREADCRUMB SCHEMA (NEW!) 🔥🔥🔥
// ============================================================
function generateBreadcrumbSchema(cleanUrl) {
    const breadcrumbLinks = document.querySelectorAll('.breadcrumbs a, .breadcrumb a, .nav-trail a, .breadcrumb-item a, .crumbs a, [aria-label="breadcrumb"] a');
    if (breadcrumbLinks.length > 1) {
        const itemListElement = [];
        breadcrumbLinks.forEach((link) => {
            const name = link.innerText?.trim() || '';
            if (name && name.toLowerCase() !== 'home' && name.toLowerCase() !== 'beranda' && name.length > 1) {
                itemListElement.push({
                    "@type": "ListItem",
                    "position": itemListElement.length + 1,
                    "name": name,
                    "item": link.href
                });
            }
        });
        if (itemListElement.length > 0) {
            console.log(`[Schema v7.22] 🍞 Breadcrumb Schema: ${itemListElement.length} items`);
            return {
                "@type": "BreadcrumbList",
                "@id": cleanUrl + "#breadcrumb",
                "itemListElement": itemListElement
            };
        }
    }
    return null;
}

// ============================================================
// 🔥🔥🔥 DETEKSI HALAMAN LAYAK GAMBAR 🔥🔥🔥
// ============================================================
function isImageEligible(pageLevel) {
    console.log('[Schema v7.22 📸] Checking image eligibility for page level:', pageLevel);

    const mandatoryImageLevels = [
        'money-master', 
        'money-page', 
        'money-child',
        'variant',
        'sub-variant'
    ];
    
    if (mandatoryImageLevels.includes(pageLevel)) {
        console.log(`[Schema v7.22] ✅ WAJIB GAMBAR (level: ${pageLevel})`);
        return true;
    }

    if (pageLevel === 'pillar') {
        const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
        const title = document.title.toLowerCase();
        const combined = h1 + " " + title;

        const pillarEdukasi = ["panduan", "tips", "cara", "apa itu", "pengertian", "definisi", "overview", "komprehensif", "langkah", "tutorial", "pedoman", "petunjuk", "kenali", "mengenal", "memahami", "belajar"];
        for (let keyword of pillarEdukasi) {
            if (combined.includes(keyword)) {
                console.log(`[Schema v7.22] ⏭️ Skip gambar: Pillar edukasi murni (keyword: "${keyword}")`);
                return false;
            }
        }
        return true;
    }

    if (pageLevel === 'sub-pillar-tipe-1' || pageLevel === 'sub-pillar-tipe-2') {
        console.log(`[Schema v7.22] ✅ LAYAK GAMBAR (level: ${pageLevel})`);
        return true;
    }

    const content = document.querySelector(".post-body, article, main")?.innerText || "";
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 300) {
        console.log(`[Schema v7.22] ⏭️ Skip gambar: Konten terlalu pendek (${wordCount} kata < 300)`);
        return false;
    }

    const hasImage = document.querySelector('img:not([src*="logo"]):not([src*="icon"]):not([src*="avatar"])');
    if (hasImage) {
        console.log(`[Schema v7.22] ✅ Halaman sudah memiliki gambar, tetap layak`);
        return true;
    }

    console.log(`[Schema v7.22] ⏭️ Skip gambar: Halaman tidak masuk kriteria layak`);
    return false;
}

// ============================================================
// 🔥🔥🔥 WAIT PLD 🔥🔥🔥
// ============================================================
function waitForPLD() {
    return new Promise((resolve) => {
        if (window.pageLevelDetectorv22 || window.pageLevelDetectorv20 || 
            window.pageLevelDetectorv19 || window.pageLevelDetectorV18 || 
            window.pageLevelDetectorV17 || window.pageLevelDetector) {
            resolve(true);
            return;
        }

        const onReady = () => { console.log('[Schema v7.22] PLD ready (event)'); resolve(true); };
        window.addEventListener("pageLevelDetectorv22Ready", onReady, { once: true });
        window.addEventListener("pageLevelDetectorv20Ready", onReady, { once: true });
        window.addEventListener("pageLevelDetectorv19Ready", onReady, { once: true });
        window.addEventListener("pageLevelDetectorReady", onReady, { once: true });

        setTimeout(() => {
            if (window.pageLevelDetectorv22 || window.pageLevelDetectorv20 || 
                window.pageLevelDetectorv19 || window.pageLevelDetectorV18 || 
                window.pageLevelDetectorV17 || window.pageLevelDetector) {
                console.log('[Schema v7.22] PLD ready (timeout)');
                resolve(true);
            } else {
                console.log('[Schema v7.22] PLD timeout, using fallback');
                resolve(false);
            }
        }, 5000);
    });
}

// ============================================================
// 🚀 MAIN FUNCTION — DENGAN WAIT BREADCRUMB + AED + PLD v22.55
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(async () => {
        console.log('[Schema v7.22] 🔥 Starting...');
        
        // ===== STEP 1: TUNGGU BREADCRUMB TERBENTUK =====
        console.log('[Schema v7.22] 🍞 Menunggu breadcrumb...');
        const breadcrumbReady = await waitForBreadcrumb(3000);
        console.log(`[Schema v7.22] 🍞 Breadcrumb: ${breadcrumbReady ? '✅ READY' : '⏰ TIMEOUT'}`);
        
        // ===== STEP 2: TUNGGU PLD =====
        console.log('[Schema v7.22] ⏳ Menunggu PLD...');
        await waitForPLD();
        
        // ===== STEP 3: TUNGGU AEDMetaDates =====
        console.log('[Schema v7.22] ⏳ Menunggu AEDMetaDates...');
        const aed = await waitForAEDMetaDates(10000);
        
        if (aed) {
            console.log('[Schema v7.22] ✅ AED data:', {
                dateModified: aed.dateModified,
                nextUpdate: aed.nextUpdate,
                validityDays: aed.validityDays,
                usePriceValidUntil: aed.usePriceValidUntil,
                pageLevel: aed.pageLevel,
                entityType: aed.entityType
            });
        } else {
            console.warn('[Schema v7.22] ⚠️ AED tidak tersedia, gunakan fallback');
        }

        // ===== STEP 4: DAPATKAN PAGE LEVEL & ENTITY TYPE =====
        const pageLevel = getPageLevelFromPLD();
        const entityType = getEntityTypeFromPLD();
        const contentFocus = detectContentFocus();
        
        console.log(`[Schema v7.22] 📌 Page Level: ${pageLevel}`);
        console.log(`[Schema v7.22] 📌 Entity Type: ${entityType}`);
        console.log(`[Schema v7.22] 📌 Content Focus: ${contentFocus}`);

        // ===== STEP 5: UPDATE H1 BERDASARKAN FOKUS KONTEN =====
        console.log('[Schema v7.22] 📅 UPDATE H1 BERDASARKAN FOKUS KONTEN:');
        updateH1ByFocus(pageLevel, contentFocus);

        // ===== STEP 6: CEK & PERBAIKI GAMBAR =====
        const isEligible = isImageEligible(pageLevel);

        if (isEligible) {
            console.log(`[Schema v7.22] ✅ Halaman LAYAK mendapat gambar, memproses...`);
            try {
                fixImagesToFormat1(pageLevel);
            } catch(e) {
                console.warn('[Schema v7.22 📸] Error processing images:', e);
            }
        } else {
            console.log(`[Schema v7.22] ⏭️ Halaman TIDAK LAYAK mendapat gambar, skip`);
        }

        // ===== STEP 7: INJECT SCHEMA =====
        const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
        const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
        const baseUrl = ogUrl || canonical || location.href;
        const cleanUrl = baseUrl.replace(/[?&]m=1/, "");

        const h1Text = document.querySelector("h1")?.innerText?.trim() || document.title;
        const title = h1Text.replace(/\s{2,}/g, " ").trim().substring(0, 120);

        const LOGO_IMAGE = IMAGE_CONFIG.LOGO_IMAGE;
        const FALLBACK_IMAGE = IMAGE_CONFIG.FALLBACK_IMAGE;

        const existingImage = document.querySelector('img[data-auto-generated="true"]');
        const pageImage = existingImage ? existingImage.src : 
                          document.querySelector('meta[property="og:image"]')?.content || 
                          document.querySelector("article img, main img, .post-body img")?.getAttribute("src") ||
                          (isEligible ? FALLBACK_IMAGE : LOGO_IMAGE);

        const PAGE = {
            url: cleanUrl,
            title,
            description: document.querySelector('meta[name="description"]')?.content?.trim() ||
                document.querySelector("article p, main p, .post-body p")?.innerText?.substring(0, 200) || title,
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
        // 🔥🔥🔥 priceValidUntil DARI AED — V7.22 🔥🔥🔥
        // ============================================================
        const priceValidUntil = (aed && aed.nextUpdate) 
            ? aed.nextUpdate 
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        console.log(`[Schema v7.22] 📅 priceValidUntil: ${priceValidUntil}`);

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
            console.log(`[Schema v7.22] ✅ Service schema (${entityType})`);

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
                console.log(`[Schema v7.22] ✅ Product schema (${tableOffers.length} offers) — ${entityType}`);
            } else {
                console.log(`[Schema v7.22] ⏭️ Skip Product schema (tidak ada harga/offers)`);
            }
        } else {
            console.log(`[Schema v7.22] ⏭️ Skip Service schema (entity: ${entityType})`);
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
            console.log(`[Schema v7.22] ✅ ${internalLinks.length} internal links added`);
        }

        // ===== FAQ SCHEMA (NEW!) =====
        const faqSchema = generateFAQSchema(cleanUrl);
        if (faqSchema) {
            graph.push(faqSchema);
        }

        // ===== BREADCRUMB SCHEMA (NEW!) =====
        const breadcrumbSchema = generateBreadcrumbSchema(cleanUrl);
        if (breadcrumbSchema) {
            graph.push(breadcrumbSchema);
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
        console.log(`[Schema v7.22 ✅] V37 COMPLIANT + WAIT AED & BREADCRUMB + PLD v22.55 + FAQ + BREADCRUMB SCHEMA`);
        console.log(`   - Page Level     : ${pageLevel}`);
        console.log(`   - Entity Type    : ${entityType}`);
        console.log(`   - Content Focus  : ${contentFocus}`);
        console.log(`   - Breadcrumb     : ${breadcrumbReady ? '✅ READY' : '⏰ TIMEOUT'}`);
        console.log(`   - AED            : ${aed ? '✅ READY' : '❌ FALLBACK'}`);
        console.log(`   - Offers         : ${tableOffers.length}`);
        console.log(`   - priceValidUntil: ${priceValidUntil}`);
        console.log(`   - Service Schema : ${isService ? '✅' : '❌'}`);
        console.log(`   - Product Schema : ${(isService && hasPrice && tableOffers.length > 0) ? '✅' : '❌'}`);
        console.log(`   - Internal Links : ${internalLinks.length}`);
        console.log(`   - FAQ Schema     : ${faqSchema ? '✅' : '❌'}`);
        console.log(`   - Breadcrumb Sch : ${breadcrumbSchema ? '✅' : '❌'}`);
        console.log(`   - Image Eligible : ${isEligible ? '✅' : '❌'}`);
        console.log(`[Schema v7.22 ✅] FINISHED`);

    }, 700);
});
