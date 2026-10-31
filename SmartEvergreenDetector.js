/* ============================================================
 🧠 Smart Evergreen Detector v18.0.0-SAFE+CONSISTENCY
 🩹 SAFE-MODE PATCH: Admin Reminder Tool (ZERO SEO RISK)
 🔍 + Cross-Page Consistency Checker (Blogger Feed API)
============================================================
 🎯 PERUBAHAN DARI v17.9.0-SAFE:
    ✅ ADD: Blogger Feed API consistency checker
    ✅ ADD: Harga lintas halaman (product-overlap detection)
    ✅ ADD: NAP (telepon/email) consistency
    ✅ ADD: Brand name consistency (canonical vs alias)
    ✅ ADD: Wilayah layanan (judul vs body)
    ✅ ADD: Spesifikasi produk (mutu K-xxx, slump)
    ✅ ADD: Cannibalization detection (judul mirip)
    ✅ ADD: Cache index 6 jam + pagination (up to 750 post)

 🎯 PERUBAHAN DARI v17.9.0 (SAFE-MODE — tidak berubah):
    ❌ DISABLE: updateContentByLevelAndFocus
    ❌ DISABLE: updateH1WithRules
    ❌ DISABLE: autoUpdateDates
    ❌ DISABLE: updateJsonLdDates / cleanupFaqSchema / updateJsonLdFaqYears
    ❌ DISABLE: priceValidUntil write ke Offer schema
    ⚠️  WARNING: aedEmergencyVerify (localStorage only)
    ✅ KEEP: banner, guide modal, nextUpdate, content hash, admin shortcut

 📌 PRINSIP: Blogger raw HTML = SOURCE OF TRUTH. Googlebot lihat nilai asli.
 📌 TUJUAN: Admin reminder & workflow tool. Zero mutation, zero risk.
============================================================ */

(function () {
  if (window.detectEvergreen && window.__AED_VERSION === "18.0.0-safe-consistency") return;

  var _AED_INITIALIZED = false;
  var _AED_PLD_CACHE = {};

  window.__AED_VERSION = "18.0.0-safe-consistency";

  var DEFAULT_BRAND_NAME = "Beton Jaya Readymix";

  const SAFE_MODE = {
    DISABLE_DATE_MODIFIED_BUMP: true,
    DISABLE_JSONLD_MUTATION: true,
    DISABLE_OFFER_PRICE_VALID: true,
    WARN_EMERGENCY_VERIFY: true
  };

  const GUIDE_CONFIG = {
    ENABLED: true, ADMIN_ONLY: true, CLICKS_TO_OPEN: 3, CLICK_RESET_MS: 3000,
    BUTTON_TEXT: '📖 Panduan Halaman', BUTTON_HINT_1: '🖱️ Klik 2x lagi...', BUTTON_HINT_2: '🖱️ Klik 1x lagi...', MODAL_TITLE: '📖 Panduan Update Halaman'
  };

  const AUTHOR_BYLINE_CONFIG = {
    ENABLED: true, NAME: 'Beton Jaya Readymix', URL: '/p/about.html', ALWAYS_REPLACE: false, SHOW_AVATAR: true, AVATAR_INITIAL: 'B',
    BROKEN_PATTERNS: [/^by\s*$/i, /^oleh\s*$/i, /^by\s+admin\s*$/i, /^oleh\s+admin\s*$/i, /^by\s+unknown\s*$/i, /^by\s*[|]\s*$/i],
    SELECTORS: ['.post-author', '.byline', '.post-byline', '.author-byline', '.post-header-line-1', '.post-meta', '.entry-meta', '.post-info', '.postinfo', '.post-header', '.post-timestamp', '.post-footer-line-1', 'address', '[class*="author"]', '[class*="byline"]', '[itemprop="author"]', '[rel="author"]'],
    EXCLUDE_SELECTORS: ['footer', 'script', '.no-author', '.comment-author', '.comment-meta', '#comments', '.comments', '.post-footer', '.blog-pager']
  };

  const WARNING_CONFIG = {
    ENABLED: true, SHOW_AFTER_EXPIRED: true, USE_TIERED: true,
    TIERED_RULES: [{ maxValidity: 180, showDays: 21, label: '≤180 hari → warning 21 hari' }, { maxValidity: 999, showDays: 30, label: '≤365 hari → warning 30 hari' }],
    SHOW_DAYS_BEFORE: 30, INSERT_AFTER_SELECTOR: '.last-updated, .updated-date, .date-modified, [class*="last-updated"]',
    USE_NOSNIPPET: true, STUCK_THRESHOLD_DAYS: 30, MINI_BADGE_ENABLED: true, LOCALE: 'id',
    MESSAGES: {
      id: { expired: 'ℹ️ Review berkala diperlukan', critical: 'ℹ️ Review berkala: hari ini', warning: 'ℹ️ Review berkala: {days} hari', stale: '⚠️ Segera review', miniBadge: '📅 Update: {date}', editBtn: 'Edit →', needsVerify: '🔍 Verify', editHint: '💡 Edit 1 kata/kalimat/FAQ → Save' },
      en: { expired: 'ℹ️ Review required', critical: 'ℹ️ Due today', warning: 'ℹ️ In {days} days', stale: '⚠️ Review immediately', miniBadge: '📅 Updated: {date}', editBtn: 'Edit →', needsVerify: '🔍 Verify', editHint: '💡 Edit 1 word/sentence/FAQ → Save' }
    },
    PRIORITY_MAP: { 'money-child|HARGA': 'critical', 'money-child|GABUNG': 'critical', 'money-page|HARGA': 'high', 'money-page|GABUNG': 'high', 'money-master|HARGA': 'medium', 'money-master|GABUNG': 'medium', 'variant|HARGA': 'medium', 'sub-variant|HARGA': 'medium' },
    STYLE: {
      expired: { display: 'block', color: '#c2410c', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '8px', marginBottom: '12px', padding: '8px 12px', background: '#fff7ed', borderLeft: '4px solid #f97316', borderRadius: '4px', position: 'relative' },
      critical: { display: 'block', color: '#c2410c', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '8px', marginBottom: '12px', padding: '8px 12px', background: '#fff7ed', borderLeft: '4px solid #f97316', borderRadius: '4px', position: 'relative' },
      warning: { display: 'block', color: '#b45309', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '8px', marginBottom: '12px', padding: '8px 12px', background: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: '4px', position: 'relative' }
    }
  };

  const BASE_PAGE_LEVEL_RULES = {
    'pillar':            { type: 'evergreen',     validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft' },
    'sub-pillar-tipe-2': { type: 'evergreen',     validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft-medium' },
    'sub-pillar-tipe-1': { type: 'evergreen',     validityDays: 730,  usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'variant':           { type: 'non-evergreen', validityDays: 180,  usePriceValidUntil: true,  allowPriceRange: false, ctaIntensity: 'hard' },
    'sub-variant':       { type: 'non-evergreen', validityDays: 180,  usePriceValidUntil: true,  allowPriceRange: false, ctaIntensity: 'hard' },
    'money-master':      { type: 'non-evergreen', validityDays: 180,  usePriceValidUntil: false, allowPriceRange: true,  ctaIntensity: 'hard' },
    'money-page':        { type: 'non-evergreen', validityDays: 180,  usePriceValidUntil: true,  allowPriceRange: false, ctaIntensity: 'hard' },
    'money-child':       { type: 'non-evergreen', validityDays: 180,  usePriceValidUntil: true,  allowPriceRange: false, ctaIntensity: 'very-hard' }
  };

  const PRODUK_MATERIAL_RULES = Object.assign({}, BASE_PAGE_LEVEL_RULES);
  const SEWA_RULES            = Object.assign({}, BASE_PAGE_LEVEL_RULES);
  const JASA_RULES            = Object.assign({}, BASE_PAGE_LEVEL_RULES);
  const DEFAULT_RULE = { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft' };
  const MONEY_LEVELS = ['money-master', 'money-page', 'money-child', 'variant', 'sub-variant'];
  const EVERGREEN_LEVELS = ['sub-pillar-tipe-1', 'sub-pillar-tipe-2', 'pillar'];

  /* ============================================================
   🔍 CONSISTENCY MODULE — Config
  ============================================================ */

  const CONSISTENCY_CONFIG = {
    ENABLED: true,
    FEED_URL_BASE: 'https://www.betonjayareadymix.com/feeds/posts/default',
    PAGE_SIZE: 150,
    MAX_PAGES: 5,
    FETCH_TIMEOUT_MS: 10000,
    CACHE_KEY: 'aed-content-index-v2',
    CACHE_TTL_MS: 6 * 3600 * 1000,
    PRICE_RANGE_TOLERANCE: 0.30,
    CANNIBALIZATION_THRESHOLD: 0.60
  };

  const PRODUCT_KEYWORDS = [
    'beton','cor','readymix','ready mix','ready-mix','minimix','mini mix','jayamix','beton jayamix',
    'pasir','batu split','split','batu','semen','bata','batako','besi','baja','wiremesh',
    'pompa','molen','gali','urug','sirtu','tanah','aspal','paving','kanstin',
    'hebel','bata ringan','bata merah','precast','kanal','cakar ayam'
  ];

  const TRANSACTIONAL_KEYWORDS = ['harga','biaya','tarif','jual','sewa','jasa','order','pesan','beli','supplier','distributor'];

  const NAP_CONFIG = {
    ENABLED: true,
    BRAND_CANONICAL: 'Beton Jaya Readymix',
    BRAND_ALIASES: [
      'beton jaya readymix','beton jaya','betonjaya','beton jaya ready mix','beton jaya ready-mix',
      'cv beton jaya','cv. beton jaya','cv beton jaya readymix','cv. beton jaya readymix',
      'pt beton jaya','pt. beton jaya'
    ],
    PHONE_REGEXES: [
      /(?:\+?62|0)\s*8\d{1,3}[\s.\-]?\d{3,4}[\s.\-]?\d{3,5}/g
    ],
    EMAIL_REGEX: /[\w.+-]+@[\w-]+\.[\w.-]+/g,
    AREA_KEYWORDS: [
      'jabodetabek','jakarta','jakarta selatan','jakarta utara','jakarta barat','jakarta timur','jakarta pusat',
      'bogor','depok','tangerang','tangerang selatan','bekasi','cibubur','cikarang',
      'bandung','cimahi','soreang','banjaran','padalarang','lembang',
      'surabaya','sidoarjo','gresik','mojokerto',
      'semarang','kendal','demak','ungaran',
      'yogyakarta','sleman','bantul','solo','surakarta',
      'banten','jawa barat','jawa tengah','jawa timur',
      'karawang','purwakarta','subang','sumedang','garut','tasikmalaya','cianjur','sukabumi'
    ],
    SPEC_MUTU: /\bK[\s-]?(\d{3})\b/gi,
    SPEC_SLUMP: /slump\s*(?:[±+\-]\s*)?(\d{1,2})(?:\s*[±+\-]\s*(\d{1,2}))?\s*cm/gi
  };

  /* ============================================================
   🔍 CONSISTENCY MODULE — Helpers
  ============================================================ */

  var _aedDecoder = null;
  function decodeEntities(str) {
    if (!str) return '';
    if (!_aedDecoder) _aedDecoder = document.createElement('textarea');
    _aedDecoder.innerHTML = str;
    return _aedDecoder.value;
  }
  function stripHtml(html) {
    if (!html) return '';
    return decodeEntities(String(html).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
  }
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function(c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }
  function normalizePagePath(p) {
    var x = String(p || '').split('?')[0].split('#')[0];
    x = x.replace(/\.html$/i, '');
    if (x.length > 1 && x.charAt(x.length - 1) === '/') x = x.slice(0, -1);
    return x.toLowerCase();
  }
  function extractPrices(text) {
    var matches = (text || '').match(/Rp\.?\s*[\d.,]+/gi) || [];
    var seen = {}, out = [];
    for (var i = 0; i < matches.length; i++) {
      var raw = matches[i];
      var num = parseInt(raw.replace(/Rp\.?\s*/i, '').replace(/[.,]/g, ''), 10);
      if (num > 0 && num < 1e12 && !seen[num]) { seen[num] = 1; out.push({ raw: raw, num: num }); }
    }
    return out;
  }
  function extractProducts(text) {
    var lower = ' ' + String(text || '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ') + ' ';
    var found = [];
    for (var i = 0; i < PRODUCT_KEYWORDS.length; i++) {
      if (lower.indexOf(' ' + PRODUCT_KEYWORDS[i] + ' ') !== -1) found.push(PRODUCT_KEYWORDS[i]);
    }
    return found;
  }
  function hasTransactionalKeywords(text) {
    var lower = ' ' + String(text || '').toLowerCase() + ' ';
    for (var i = 0; i < TRANSACTIONAL_KEYWORDS.length; i++) {
      if (lower.indexOf(' ' + TRANSACTIONAL_KEYWORDS[i] + ' ') !== -1) return true;
    }
    return false;
  }
  function tokenizeTitle(title) {
    var stop = { yang:1, dan:1, atau:1, di:1, ke:1, dari:1, untuk:1, dengan:1, pada:1, adalah:1, ini:1, itu:1, akan:1, telah:1, sudah:1, bisa:1, dapat:1, juga:1, saja:1, oleh:1, per:1, terbaru:1, update:1, murah:1, termurah:1, terbaik:1, 2023:1, 2024:1, 2025:1, 2026:1 };
    var words = String(title || '').toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    return words.filter(function(w) { return !stop[w]; });
  }
  function jaccardSimilarity(a, b) {
    if (!a.length || !b.length) return 0;
    var setA = new Set(a), setB = new Set(b), inter = 0;
    setA.forEach(function(x) { if (setB.has(x)) inter++; });
    var union = setA.size + setB.size - inter;
    return union > 0 ? inter / union : 0;
  }
  function formatRp(n) {
    if (!n || n < 0) return 'Rp 0';
    if (n >= 1e9) return 'Rp ' + (n/1e9).toFixed(1).replace('.0','') + ' M';
    if (n >= 1e6) return 'Rp ' + (n/1e6).toFixed(1).replace('.0','') + ' jt';
    if (n >= 1e3) return 'Rp ' + (n/1e3).toFixed(0) + ' rb';
    return 'Rp ' + n;
  }
  function summarizePrices(prices) {
    if (!prices || prices.length === 0) return { min:0, max:0, avg:0, count:0, samples:[] };
    var nums = prices.map(function(p){ return p.num; });
    var sum = nums.reduce(function(a,b){ return a+b; }, 0);
    return {
      min: Math.min.apply(null, nums),
      max: Math.max.apply(null, nums),
      avg: sum / nums.length,
      count: nums.length,
      samples: prices.slice(0, 3).map(function(p){ return p.raw; })
    };
  }
  function formatPriceRange(s) {
    if (!s || s.count === 0) return '—';
    if (s.count === 1) return formatRp(s.min) + ' (1)';
    if (s.min === s.max) return formatRp(s.min) + ' (' + s.count + ')';
    return formatRp(s.min) + ' – ' + formatRp(s.max) + ' (' + s.count + ')';
  }
  function normalizePhone(raw) {
    if (!raw) return '';
    var d = String(raw).replace(/[^\d]/g, '');
    if (d.indexOf('62') === 0) return d;
    if (d.indexOf('0') === 0) return '62' + d.substring(1);
    if (d.indexOf('8') === 0) return '62' + d;
    return d;
  }
  function _extractPhonesFromText(text) {
    var out = [], seen = {};
    if (!text) return out;
    for (var i = 0; i < NAP_CONFIG.PHONE_REGEXES.length; i++) {
      NAP_CONFIG.PHONE_REGEXES[i].lastIndex = 0;
      var matches = String(text).match(NAP_CONFIG.PHONE_REGEXES[i]) || [];
      for (var j = 0; j < matches.length; j++) {
        var norm = normalizePhone(matches[j]);
        if (norm.length < 10 || norm.length > 15) continue;
        if (!seen[norm]) { seen[norm] = 1; out.push({ raw: matches[j].trim(), normalized: norm, source: 'text' }); }
      }
    }
    return out;
  }
  function extractPhonesFromHtml(html) {
    var out = [], seen = {};
    if (!html) return out;
    var fromText = _extractPhonesFromText(stripHtml(html));
    for (var i = 0; i < fromText.length; i++) {
      if (!seen[fromText[i].normalized]) { seen[fromText[i].normalized] = 1; out.push(fromText[i]); }
    }
    var waRegex = /(?:wa\.me\/|api\.whatsapp\.com\/send\?phone=|whatsapp\.com\/send\?phone=)\/?(\d{8,15})/gi;
    var m;
    while ((m = waRegex.exec(html)) !== null) {
      var n = normalizePhone(m[1]);
      if (n.length >= 10 && n.length <= 15 && !seen[n]) { seen[n] = 1; out.push({ raw: 'wa.me/' + m[1], normalized: n, source: 'wa-link' }); }
    }
    var telRegex = /tel:\+?(\d{8,15})/gi;
    while ((m = telRegex.exec(html)) !== null) {
      var n2 = normalizePhone(m[1]);
      if (n2.length >= 10 && n2.length <= 15 && !seen[n2]) { seen[n2] = 1; out.push({ raw: 'tel:' + m[1], normalized: n2, source: 'tel-link' }); }
    }
    return out;
  }
  function extractPhonesFromDOM(container) {
    var out = [], seen = {};
    if (!container) return out;
    var fromText = _extractPhonesFromText(container.innerText || '');
    for (var i = 0; i < fromText.length; i++) {
      if (!seen[fromText[i].normalized]) { seen[fromText[i].normalized] = 1; out.push(fromText[i]); }
    }
    var links = container.querySelectorAll('a[href]');
    for (var j = 0; j < links.length; j++) {
      var href = links[j].getAttribute('href') || '';
      var wm = href.match(/(?:wa\.me\/|api\.whatsapp\.com\/send\?phone=|whatsapp\.com\/send\?phone=)\/?(\d{8,15})/i);
      if (wm) {
        var nw = normalizePhone(wm[1]);
        if (nw.length >= 10 && nw.length <= 15 && !seen[nw]) { seen[nw] = 1; out.push({ raw: 'wa.me/' + wm[1], normalized: nw, source: 'wa-link' }); }
      }
      var tm = href.match(/^tel:\+?(\d{8,15})/i);
      if (tm) {
        var nt = normalizePhone(tm[1]);
        if (nt.length >= 10 && nt.length <= 15 && !seen[nt]) { seen[nt] = 1; out.push({ raw: 'tel:' + tm[1], normalized: nt, source: 'tel-link' }); }
      }
    }
    return out;
  }
  function extractEmails(text) {
    if (!text) return [];
    var matches = String(text).match(NAP_CONFIG.EMAIL_REGEX) || [];
    var seen = {}, out = [];
    for (var i = 0; i < matches.length; i++) {
      var e = matches[i].toLowerCase();
      if (/\.(png|jpg|jpeg|gif|svg|webp|css|js)$/i.test(e)) continue;
      if (e.indexOf('@sentry') !== -1 || e.indexOf('@example') !== -1) continue;
      if (!seen[e]) { seen[e] = 1; out.push(e); }
    }
    return out;
  }
  function detectBrandAlias(title, text) {
    var haystack = ' ' + String(title || '').toLowerCase() + ' ' + String(text || '').toLowerCase() + ' ';
    haystack = haystack.replace(/\s+/g, ' ');
    var canonical = NAP_CONFIG.BRAND_CANONICAL.toLowerCase();
    var canonFound = haystack.indexOf(' ' + canonical + ' ') !== -1 || haystack.indexOf(' ' + canonical + ',') !== -1;
    var aliasesFound = [];
    for (var i = 0; i < NAP_CONFIG.BRAND_ALIASES.length; i++) {
      var a = NAP_CONFIG.BRAND_ALIASES[i];
      if (a === canonical) continue;
      if (haystack.indexOf(' ' + a + ' ') !== -1) aliasesFound.push(a);
    }
    return { canonical: canonFound, aliases: aliasesFound };
  }
  function extractAreas(title, text) {
    var haystack = ' ' + String(title || '').toLowerCase() + ' ' + String(text || '').toLowerCase() + ' ';
    haystack = haystack.replace(/\s+/g, ' ');
    var found = [];
    for (var i = 0; i < NAP_CONFIG.AREA_KEYWORDS.length; i++) {
      var kw = NAP_CONFIG.AREA_KEYWORDS[i];
      if (haystack.indexOf(' ' + kw + ' ') !== -1) found.push(kw);
    }
    return found;
  }
  function extractSpecs(text) {
    var out = { mutu: [], slump: [] };
    if (!text) return out;
    var m, seen = {};
    NAP_CONFIG.SPEC_MUTU.lastIndex = 0;
    while ((m = NAP_CONFIG.SPEC_MUTU.exec(text)) !== null) {
      var k = 'K-' + m[1];
      if (!seen[k]) { seen[k] = 1; out.mutu.push(k); }
    }
    seen = {};
    NAP_CONFIG.SPEC_SLUMP.lastIndex = 0;
    while ((m = NAP_CONFIG.SPEC_SLUMP.exec(text)) !== null) {
      var s = m[2] ? m[1] + '±' + m[2] + ' cm' : m[1] + ' cm';
      if (!seen[s]) { seen[s] = 1; out.slump.push(s); }
    }
    return out;
  }

  function parseFeedEntry(entry) {
    try {
      var title = decodeEntities((entry.title && entry.title.$t) || '');
      var url = '';
      for (var i = 0; i < (entry.link || []).length; i++) {
        if (entry.link[i].rel === 'alternate') { url = entry.link[i].href; break; }
      }
      if (!url) return null;
      var html = (entry.content && entry.content.$t) || (entry.summary && entry.summary.$t) || '';
      var text = stripHtml(html).substring(0, 6000);
      var prices = extractPrices(text);
      var products = extractProducts(title);
      var transactional = hasTransactionalKeywords(title);
      var path = '';
      try { path = new URL(url, location.origin).pathname; } catch(e) {}
      var phones = extractPhonesFromHtml(html);
      var emails = extractEmails(text);
      var brand = detectBrandAlias(title, text.substring(0, 3000));
      var areas = extractAreas(title, text.substring(0, 3000));
      var specs = extractSpecs(text);
      return {
        title: title, url: url, path: path,
        prices: prices, products: products, transactional: transactional,
        _text: text, _phones: phones, _emails: emails,
        _brand: brand, _areas: areas, _specs: specs, _enriched: true
      };
    } catch(e) { return null; }
  }

  function getCachedIndex() {
    try {
      var raw = localStorage.getItem(CONSISTENCY_CONFIG.CACHE_KEY);
      if (!raw) return null;
      var c = JSON.parse(raw);
      if (!c || !c.ts || !c.data) return null;
      if (Date.now() - c.ts > CONSISTENCY_CONFIG.CACHE_TTL_MS) return null;
      return c.data;
    } catch(e) { return null; }
  }
  function cacheIndex(data) {
    try { localStorage.setItem(CONSISTENCY_CONFIG.CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data })); } catch(e) {}
  }
  function fetchWithTimeout(url, ms) {
    return new Promise(function(resolve, reject) {
      var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var tid = setTimeout(function() { if (controller) controller.abort(); reject(new Error('timeout')); }, ms);
      fetch(url, controller ? { signal: controller.signal, credentials: 'omit' } : { credentials: 'omit' })
        .then(function(r) { clearTimeout(tid); resolve(r); })
        .catch(function(e) { clearTimeout(tid); reject(e); });
    });
  }
  async function fetchContentIndex(force) {
    if (!CONSISTENCY_CONFIG.ENABLED) return [];
    if (!force) {
      var cached = getCachedIndex();
      if (cached) return cached;
    }
    var all = [];
    var startIndex = 1;
    var page = 0;
    while (page < CONSISTENCY_CONFIG.MAX_PAGES) {
      var url = CONSISTENCY_CONFIG.FEED_URL_BASE + '?alt=json&max-results=' + CONSISTENCY_CONFIG.PAGE_SIZE + '&start-index=' + startIndex;
      try {
        var res = await fetchWithTimeout(url, CONSISTENCY_CONFIG.FETCH_TIMEOUT_MS);
        if (!res.ok) break;
        var json = await res.json();
        var entries = (json.feed && json.feed.entry) || [];
        if (entries.length === 0) break;
        for (var i = 0; i < entries.length; i++) {
          var parsed = parseFeedEntry(entries[i]);
          if (parsed) all.push(parsed);
        }
        if (entries.length < CONSISTENCY_CONFIG.PAGE_SIZE) break;
        startIndex += CONSISTENCY_CONFIG.PAGE_SIZE;
        page++;
      } catch(e) {
        console.warn('[AED] feed fetch error:', e.message || e);
        break;
      }
    }
    if (all.length > 0) cacheIndex(all);
    return all;
  }
  function enrichIndexItem(p) {
    if (!p._enriched) {
      if (!p._text) p._text = '';
      if (!p._phones) p._phones = extractPhonesFromHtml(p._text);
      if (!p._emails) p._emails = extractEmails(p._text);
      if (!p._brand) p._brand = detectBrandAlias(p.title, p._text.substring(0, 3000));
      if (!p._areas) p._areas = extractAreas(p.title, p._text.substring(0, 3000));
      if (!p._specs) p._specs = extractSpecs(p._text);
      p._enriched = true;
    }
    return p;
  }

  async function checkNAPConsistency(index) {
    var currentPath = normalizePagePath(location.pathname);
    var currentBody = document.querySelector('.post-body.entry-content, .post-body, article, main') || document.body;
    var currentPhones = extractPhonesFromDOM(currentBody);
    var currentEmails = extractEmails(currentBody.innerText || '');

    var phoneGroups = {}, emailGroups = {};
    for (var i = 0; i < index.length; i++) {
      var p = index[i];
      if (normalizePagePath(p.path) === currentPath) continue;
      enrichIndexItem(p);
      for (var j = 0; j < p._phones.length; j++) {
        var k = p._phones[j].normalized;
        if (!phoneGroups[k]) phoneGroups[k] = [];
        phoneGroups[k].push({ title: p.title, url: p.url });
      }
      for (var ek = 0; ek < p._emails.length; ek++) {
        var ee = p._emails[ek];
        if (!emailGroups[ee]) emailGroups[ee] = [];
        emailGroups[ee].push({ title: p.title, url: p.url });
      }
    }

    var issues = [], phoneRows = [], emailRows = [];
    for (var ci = 0; ci < currentPhones.length; ci++) {
      var cp = currentPhones[ci];
      var matches = phoneGroups[cp.normalized] || [];
      var status = 'ok';
      if (matches.length === 0) {
        var otherKeys = Object.keys(phoneGroups);
        if (otherKeys.length > 0) status = 'warning';
      }
      phoneRows.push({ phone: cp.raw, normalized: cp.normalized, source: cp.source || 'text', otherPagesCount: matches.length, status: status });
    }

    if (currentPhones.length === 0 && Object.keys(phoneGroups).length > 0) {
      issues.push({ level: 'warning', text: 'Nomor WA/telepon TIDAK terdeteksi di halaman ini, padahal ' + Object.keys(phoneGroups).length + ' nomor ditemukan di halaman lain.' });
    }
    var unikPhones = phoneRows.filter(function(r) { return r.status === 'warning'; });
    if (unikPhones.length > 0) {
      issues.push({ level: 'warning', text: 'Nomor ' + unikPhones.map(function(r) { return r.phone; }).join(', ') + ' hanya ada di halaman ini (tidak ditemukan di halaman lain). Cek apakah nomor resmi.' });
    }

    for (var ei = 0; ei < currentEmails.length; ei++) {
      var em = currentEmails[ei];
      var emMatches = emailGroups[em] || [];
      emailRows.push({ email: em, otherPagesCount: emMatches.length, status: emMatches.length > 0 ? 'ok' : 'warning' });
    }

    var phoneSummary = [];
    var keys = Object.keys(phoneGroups);
    keys.sort(function(a, b) { return phoneGroups[b].length - phoneGroups[a].length; });
    for (var pk = 0; pk < Math.min(keys.length, 5); pk++) {
      phoneSummary.push({ normalized: keys[pk], count: phoneGroups[keys[pk]].length });
    }

    return {
      available: true,
      currentPhones: phoneRows,
      currentEmails: emailRows,
      phoneGroups: phoneSummary,
      totalUniquePhones: keys.length,
      totalUniqueEmails: Object.keys(emailGroups).length,
      issues: issues
    };
  }

  async function checkBrandConsistency(index) {
    var currentBody = document.querySelector('.post-body.entry-content, .post-body, article, main') || document.body;
    var h1 = document.querySelector('h1');
    var currentTitle = (h1 ? (h1.innerText || '') : '') + ' ' + document.title;
    var currentText = (currentBody.innerText || '').substring(0, 3000);

    var current = detectBrandAlias(currentTitle, currentText);
    var issues = [];

    if (!current.canonical && current.aliases.length === 0) {
      issues.push({ level: 'critical', text: 'Nama brand "' + NAP_CONFIG.BRAND_CANONICAL + '" tidak ditemukan di halaman ini. Tambahkan untuk E-E-A-T.' });
    } else if (!current.canonical && current.aliases.length > 0) {
      issues.push({ level: 'warning', text: 'Hanya alias ditemukan: ' + current.aliases.join(', ') + '. Sebaiknya gunakan nama resmi "' + NAP_CONFIG.BRAND_CANONICAL + '".' });
    }

    var dist = { canonical: 0, aliases: {} };
    for (var i = 0; i < index.length; i++) {
      enrichIndexItem(index[i]);
      var b = index[i]._brand;
      if (b.canonical) dist.canonical++;
      for (var j = 0; j < b.aliases.length; j++) {
        dist.aliases[b.aliases[j]] = (dist.aliases[b.aliases[j]] || 0) + 1;
      }
    }
    var topAliases = Object.keys(dist.aliases).sort(function(a, b) {
      return dist.aliases[b] - dist.aliases[a];
    }).slice(0, 5).map(function(a) { return { alias: a, count: dist.aliases[a] }; });

    return {
      available: true,
      currentBrand: current,
      brandDistribution: { canonicalCount: dist.canonical, aliases: topAliases },
      issues: issues
    };
  }

  async function checkServiceAreaConsistency(index) {
    var currentBody = document.querySelector('.post-body.entry-content, .post-body, article, main') || document.body;
    var h1 = document.querySelector('h1');
    var currentTitle = h1 ? (h1.innerText || '') : document.title;
    var currentText = (currentBody.innerText || '').substring(0, 3000);

    var areasInTitle = extractAreas(currentTitle, '');
    var areasInBody = extractAreas('', currentText);
    var issues = [], areaRows = [];

    for (var i = 0; i < areasInTitle.length; i++) {
      var a = areasInTitle[i];
      var inBody = areasInBody.indexOf(a) !== -1;
      if (!inBody) {
        issues.push({ level: 'warning', text: 'Wilayah "' + a + '" ada di judul tapi tidak disebut di body. Untuk local SEO, sebutkan 2-3x di body.' });
      }
      areaRows.push({ area: a, inTitle: true, inBody: inBody, status: inBody ? 'ok' : 'warning' });
    }
    for (var j = 0; j < areasInBody.length; j++) {
      var b = areasInBody[j];
      if (areasInTitle.indexOf(b) === -1) areaRows.push({ area: b, inTitle: false, inBody: true, status: 'ok' });
    }

    var pl = document.body.getAttribute('data-page-level') || '';
    if (areasInTitle.length === 0 && areasInBody.length === 0 && MONEY_LEVELS.indexOf(pl) !== -1) {
      issues.push({ level: 'warning', text: 'Halaman money-level tidak menyebut wilayah layanan. Untuk local SEO, tambahkan wilayah eksplisit.' });
    }

    var dist = {};
    for (var k = 0; k < index.length; k++) {
      enrichIndexItem(index[k]);
      for (var m = 0; m < index[k]._areas.length; m++) {
        var ar = index[k]._areas[m];
        if (!dist[ar]) dist[ar] = 0;
        dist[ar]++;
      }
    }
    var topAreas = Object.keys(dist).sort(function(a, b) { return dist[b] - dist[a]; }).slice(0, 8).map(function(a) { return { area: a, count: dist[a] }; });

    return {
      available: true,
      areasInTitle: areasInTitle,
      areasInBody: areasInBody,
      areaRows: areaRows,
      areaDistribution: topAreas,
      issues: issues
    };
  }

  async function checkSpecConsistency(index) {
    var currentBody = document.querySelector('.post-body.entry-content, .post-body, article, main') || document.body;
    var currentText = (currentBody.innerText || '').substring(0, 4000);
    var currentSpecs = extractSpecs(currentText);

    var mutuGroups = {};
    for (var i = 0; i < index.length; i++) {
      enrichIndexItem(index[i]);
      var specs = index[i]._specs || { mutu: [], slump: [] };
      for (var j = 0; j < specs.mutu.length; j++) {
        var k = specs.mutu[j];
        if (!mutuGroups[k]) mutuGroups[k] = [];
        mutuGroups[k].push({ title: index[i].title, url: index[i].url, slumps: specs.slump });
      }
    }

    var issues = [];
    for (var mi = 0; mi < currentSpecs.mutu.length; mi++) {
      var mutu = currentSpecs.mutu[mi];
      var peers = mutuGroups[mutu] || [];
      var slumpSet = {};
      for (var pi = 0; pi < peers.length; pi++) {
        for (var si = 0; si < peers[pi].slumps.length; si++) slumpSet[peers[pi].slumps[si]] = 1;
      }
      var otherSlumps = Object.keys(slumpSet);
      if (otherSlumps.length > 0 && currentSpecs.slump.length > 0) {
        var conflict = otherSlumps.filter(function(s) { return currentSpecs.slump.indexOf(s) === -1; });
        if (conflict.length > 0 && conflict.length === otherSlumps.length) {
          issues.push({ level: 'warning', text: 'Mutu ' + mutu + ' di halaman ini punya slump (' + currentSpecs.slump.join(', ') + ') berbeda dari halaman lain (' + conflict.slice(0, 2).join(', ') + ').' });
        }
      }
    }

    return { available: true, currentMutu: currentSpecs.mutu, currentSlump: currentSpecs.slump, issues: issues };
  }

  async function checkConsistency() {
    if (!CONSISTENCY_CONFIG.ENABLED) {
      return { available: false, totalIndexed: 0, productOverlap: [], potentialCannibalization: [], issues: [] };
    }
    var index = await fetchContentIndex(false);
    if (!index || index.length === 0) {
      return { available: false, totalIndexed: 0, productOverlap: [], potentialCannibalization: [], issues: [] };
    }
    for (var ei = 0; ei < index.length; ei++) enrichIndexItem(index[ei]);

    var currentPath = normalizePagePath(location.pathname);
    var h1El = document.querySelector('h1');
    var currentTitle = (h1El && (h1El.innerText || h1El.textContent)) || document.title;
    var currentBody = document.querySelector('.post-body.entry-content, .post-body, article, main') || document.body;
    var currentText = (currentBody.innerText || '').substring(0, 2000);

    var myPrices = extractPrices(currentText);
    var myProducts = extractProducts(currentTitle);
    var currentData = { path: currentPath, title: currentTitle, prices: summarizePrices(myPrices), products: myProducts };

    var productOverlap = [], potentialCannibalization = [];
    var myTitleTokens = tokenizeTitle(currentTitle);

    for (var i = 0; i < index.length; i++) {
      var p = index[i];
      if (normalizePagePath(p.path) === currentPath) continue;
      var shared = [];
      for (var j = 0; j < myProducts.length; j++) {
        if (p.products.indexOf(myProducts[j]) !== -1) shared.push(myProducts[j]);
      }
      if (shared.length > 0) {
        var hasBoth = myPrices.length > 0 && p.prices.length > 0;
        var curSum = summarizePrices(myPrices), othSum = summarizePrices(p.prices);
        var item = { page: { title: p.title, url: p.url, path: p.path }, sharedProducts: shared, hasBothPrices: hasBoth, currentPrices: curSum, otherPrices: othSum, deltaPct: null, status: 'ok' };
        if (hasBoth) {
          var ratio = Math.abs(curSum.avg - othSum.avg) / Math.max(curSum.avg, othSum.avg);
          item.deltaPct = Math.round(ratio * 100);
          var overlapRange = !(curSum.max < othSum.min || othSum.max < curSum.min);
          if (!overlapRange && ratio > CONSISTENCY_CONFIG.PRICE_RANGE_TOLERANCE) item.status = 'check';
          else if (ratio > CONSISTENCY_CONFIG.PRICE_RANGE_TOLERANCE * 0.5) item.status = 'warning';
        }
        productOverlap.push(item);
      }
      var sim = jaccardSimilarity(myTitleTokens, tokenizeTitle(p.title));
      if (sim >= CONSISTENCY_CONFIG.CANNIBALIZATION_THRESHOLD) {
        potentialCannibalization.push({ page: { title: p.title, url: p.url, path: p.path }, similarity: sim });
      }
    }

    productOverlap.sort(function(a, b) { var o = { check: 0, warning: 1, ok: 2 }; return o[a.status] - o[b.status]; });
    potentialCannibalization.sort(function(a, b) { return b.similarity - a.similarity; });

    var issues = [];
    var checkCount = productOverlap.filter(function(x) { return x.status === 'check'; }).length;
    var warnCount = productOverlap.filter(function(x) { return x.status === 'warning'; }).length;
    if (checkCount > 0) issues.push({ level: 'critical', text: '⚠️ ' + checkCount + ' halaman dengan harga berpotensi TIDAK konsisten.' });
    if (warnCount > 0) issues.push({ level: 'warning', text: 'ℹ️ ' + warnCount + ' halaman dengan selisih harga sedang — review manual.' });
    if (potentialCannibalization.length > 0) issues.push({ level: 'warning', text: '⚠️ ' + potentialCannibalization.length + ' halaman berpotensi keyword cannibalization.' });

    var nap = await checkNAPConsistency(index);
    var brand = await checkBrandConsistency(index);
    var area = await checkServiceAreaConsistency(index);
    var spec = await checkSpecConsistency(index);

    issues = issues.concat(nap.issues, brand.issues, area.issues, spec.issues);

    return {
      available: true,
      totalIndexed: index.length,
      productOverlap: productOverlap,
      potentialCannibalization: potentialCannibalization,
      nap: nap, brand: brand, area: area, spec: spec,
      issues: issues,
      currentData: currentData
    };
  }

  function buildConsistencySection(consistency) {
    if (!consistency) return '<p style="color:#9ca3af;">⏳ Memuat index konten dari Blogger Feed...</p>';
    if (!consistency.available) {
      return '<p style="color:#9ca3af;">ℹ️ Index belum tersedia. Jalankan <code>aedWarmContentIndex()</code> di console.</p>';
    }

    var html = '<p style="margin-bottom:10px;color:#6b7280;font-size:0.85rem;">📊 Terindeks: <strong>' + consistency.totalIndexed + '</strong> halaman · ' + consistency.issues.length + ' issue total</p>';

    if (consistency.issues.length > 0) {
      html += '<div style="margin-bottom:12px;">';
      for (var ii = 0; ii < consistency.issues.length; ii++) {
        var iss = consistency.issues[ii];
        html += '<div class="aed-guide-issue-' + iss.level + '" style="margin-bottom:6px;">' + iss.text + '</div>';
      }
      html += '</div>';
    } else {
      html += '<p style="color:#16a34a;font-weight:600;">✅ Tidak ada issue terdeteksi.</p>';
    }

    if (consistency.nap && consistency.nap.available) {
      html += '<h4 style="margin-top:16px;color:#1f2937;">📞 NAP / Kontak</h4>';
      if (consistency.nap.currentPhones.length === 0) {
        html += '<p style="color:#dc2626;font-size:0.85rem;">⚠️ Tidak ada nomor telepon/WA terdeteksi di halaman ini.</p>';
      } else {
        html += '<table class="aed-guide-section-table"><thead><tr><th>Nomor</th><th>Sumber</th><th>Konsistensi</th></tr></thead><tbody>';
        for (var ni = 0; ni < consistency.nap.currentPhones.length; ni++) {
          var ph = consistency.nap.currentPhones[ni];
          var nbadge = ph.status === 'ok'
            ? '<span style="color:#16a34a;">✅ Ada di ' + ph.otherPagesCount + ' halaman lain</span>'
            : '<span style="color:#f59e0b;">⚠️ Hanya di halaman ini</span>';
          html += '<tr><td><code style="font-size:0.82rem;">' + escapeHtml(ph.phone) + '</code></td><td style="font-size:0.78rem;color:#6b7280;">' + escapeHtml(ph.source) + '</td><td style="font-size:0.82rem;">' + nbadge + '</td></tr>';
        }
        html += '</tbody></table>';
      }
      if (consistency.nap.phoneGroups.length > 0) {
        html += '<p style="font-size:0.82rem;margin-top:8px;color:#6b7280;">Nomor paling sering muncul:</p><ul class="aed-guide-list">';
        for (var nk = 0; nk < Math.min(3, consistency.nap.phoneGroups.length); nk++) {
          var pg = consistency.nap.phoneGroups[nk];
          html += '<li><code style="font-size:0.82rem;">' + escapeHtml(pg.normalized) + '</code> — ' + pg.count + ' halaman</li>';
        }
        html += '</ul>';
      }
    }

    if (consistency.brand && consistency.brand.available) {
      html += '<h4 style="margin-top:16px;color:#1f2937;">🏢 Brand Name</h4>';
      if (consistency.brand.currentBrand.canonical) {
        html += '<p style="color:#16a34a;font-size:0.85rem;">✅ "' + escapeHtml(NAP_CONFIG.BRAND_CANONICAL) + '" ditemukan di halaman ini.</p>';
      } else if (consistency.brand.currentBrand.aliases.length > 0) {
        html += '<p style="color:#f59e0b;font-size:0.85rem;">⚠️ Hanya alias ditemukan: ' + escapeHtml(consistency.brand.currentBrand.aliases.join(', ')) + '</p>';
      } else {
        html += '<p style="color:#dc2626;font-size:0.85rem;">⚠️ Nama brand tidak ditemukan.</p>';
      }
      var bd = consistency.brand.brandDistribution;
      if (bd.canonicalCount > 0 || bd.aliases.length > 0) {
        html += '<p style="font-size:0.8rem;margin-top:6px;color:#6b7280;">Nama resmi dipakai di ' + bd.canonicalCount + ' halaman.</p>';
        if (bd.aliases.length > 0) {
          html += '<p style="font-size:0.8rem;color:#6b7280;">Alias ditemukan:</p><ul class="aed-guide-list">';
          for (var bi = 0; bi < bd.aliases.length; bi++) {
            html += '<li><span style="color:#f59e0b;">"' + escapeHtml(bd.aliases[bi].alias) + '"</span> — ' + bd.aliases[bi].count + ' halaman</li>';
          }
          html += '</ul>';
        }
      }
    }

    if (consistency.area && consistency.area.available) {
      html += '<h4 style="margin-top:16px;color:#1f2937;">📍 Wilayah Layanan</h4>';
      if (consistency.area.areaRows.length > 0) {
        html += '<table class="aed-guide-section-table"><thead><tr><th>Wilayah</th><th>Judul</th><th>Body</th><th>Status</th></tr></thead><tbody>';
        for (var ai = 0; ai < consistency.area.areaRows.length; ai++) {
          var ar = consistency.area.areaRows[ai];
          var abadge = ar.status === 'ok' ? '<span style="color:#16a34a;">✅</span>' : '<span style="color:#f59e0b;">⚠️ Cek</span>';
          html += '<tr><td>' + escapeHtml(ar.area) + '</td><td>' + (ar.inTitle ? '✅' : '—') + '</td><td>' + (ar.inBody ? '✅' : '—') + '</td><td>' + abadge + '</td></tr>';
        }
        html += '</tbody></table>';
      } else {
        html += '<p style="font-size:0.85rem;color:#9ca3af;">Tidak ada wilayah terdeteksi di halaman ini.</p>';
      }
      if (consistency.area.areaDistribution.length > 0) {
        html += '<p style="font-size:0.82rem;margin-top:8px;color:#6b7280;">Wilayah terpopuler di site:</p><ul class="aed-guide-list">';
        for (var ak = 0; ak < Math.min(4, consistency.area.areaDistribution.length); ak++) {
          var ad = consistency.area.areaDistribution[ak];
          html += '<li>' + escapeHtml(ad.area) + ' — ' + ad.count + ' halaman</li>';
        }
        html += '</ul>';
      }
    }

    if (consistency.spec && consistency.spec.available) {
      html += '<h4 style="margin-top:16px;color:#1f2937;">🔧 Spesifikasi Produk</h4>';
      var hasSpecs = consistency.spec.currentMutu.length > 0 || consistency.spec.currentSlump.length > 0;
      if (hasSpecs) {
        if (consistency.spec.currentMutu.length > 0) html += '<p style="font-size:0.85rem;">Mutu: <strong>' + escapeHtml(consistency.spec.currentMutu.join(', ')) + '</strong></p>';
        if (consistency.spec.currentSlump.length > 0) html += '<p style="font-size:0.85rem;">Slump: <strong>' + escapeHtml(consistency.spec.currentSlump.join(', ')) + '</strong></p>';
      } else {
        html += '<p style="font-size:0.85rem;color:#9ca3af;">Tidak ada spesifikasi mutu/slump terdeteksi.</p>';
      }
    }

    if (consistency.currentData && consistency.currentData.prices && consistency.currentData.prices.count > 0) {
      html += '<h4 style="margin-top:16px;color:#1f2937;">💰 Harga</h4>';
      html += '<p style="font-size:0.85rem;">Halaman ini: <strong>' + formatPriceRange(consistency.currentData.prices) + '</strong></p>';
    }
    var withPrices = (consistency.productOverlap || []).filter(function(x) { return x.hasBothPrices; });
    if (withPrices.length > 0) {
      html += '<table class="aed-guide-section-table" style="margin-top:8px;"><thead><tr><th>Halaman</th><th>Produk</th><th>Ini</th><th>Itu</th><th>Status</th></tr></thead><tbody>';
      for (var wi = 0; wi < withPrices.length; wi++) {
        var it = withPrices[wi];
        var wbadge = it.status === 'check' ? '<span style="color:#dc2626;font-weight:700;">⚠️ Cek</span>'
                   : it.status === 'warning' ? '<span style="color:#f59e0b;">ℹ️ Beda ' + it.deltaPct + '%</span>'
                   : '<span style="color:#16a34a;">✅</span>';
        html += '<tr><td><a href="' + escapeHtml(it.page.url) + '" target="_blank" rel="noopener" style="color:#2563eb;">' + escapeHtml(it.page.title) + '</a></td><td style="font-size:0.78rem;">' + escapeHtml(it.sharedProducts.join(',')) + '</td><td style="font-size:0.8rem;">' + formatPriceRange(it.currentPrices) + '</td><td style="font-size:0.8rem;">' + formatPriceRange(it.otherPrices) + '</td><td>' + wbadge + '</td></tr>';
      }
      html += '</tbody></table>';
    }

    if (consistency.potentialCannibalization && consistency.potentialCannibalization.length > 0) {
      html += '<h4 style="margin-top:16px;color:#1f2937;">⚔️ Cannibalization</h4>';
      html += '<ul class="aed-guide-list">';
      for (var cc = 0; cc < Math.min(5, consistency.potentialCannibalization.length); cc++) {
        var cn = consistency.potentialCannibalization[cc];
        html += '<li><a href="' + escapeHtml(cn.page.url) + '" target="_blank" rel="noopener">' + escapeHtml(cn.page.title) + '</a> <span style="color:#9ca3af;">(' + Math.round(cn.similarity * 100) + '% mirip)</span></li>';
      }
      html += '</ul>';
    }

    html += '<p style="margin-top:12px;font-size:0.75rem;color:#9ca3af;">ℹ️ Index cached 6 jam. Refresh: <code>aedClearContentIndex()</code> → reload.</p>';
    return html;
  }

  /* ============================================================
   🎯 CORE AED — Helper functions (unchanged dari v17.9.0-SAFE)
  ============================================================ */

  function getPriority(pl, cf) { return WARNING_CONFIG.PRIORITY_MAP[pl + '|' + String(cf || '').toUpperCase()] || 'low'; }
  function detectLocale() { try { var h = document.documentElement.getAttribute('lang') || ''; if (h.toLowerCase().indexOf('en') === 0) return 'en'; var b = document.body.getAttribute('lang') || ''; if (b.toLowerCase().indexOf('en') === 0) return 'en'; } catch (e) {} return 'id'; }
  function getMessage(key, replacements) { var locale = detectLocale(); var msgs = WARNING_CONFIG.MESSAGES[locale] || WARNING_CONFIG.MESSAGES.id; var msg = msgs[key] || WARNING_CONFIG.MESSAGES.id[key] || ''; if (replacements) { for (var k in replacements) { if (replacements.hasOwnProperty(k)) msg = msg.replace('{' + k + '}', String(replacements[k])); } } return msg; }
  function isAdmin() { try { if (document.body.getAttribute('data-is-admin') === 'true') return true; if (localStorage.getItem('aed-is-admin') === 'true') return true; if (document.cookie.indexOf('aed_admin=1') !== -1) return true; } catch (e) {} return false; }
  function buildEditLink() { return '/admin/edit?url=' + encodeURIComponent(window.location.href.split('?')[0]); }

  function injectWarningStyles() {
    if (document.getElementById('aed-warning-styles')) return;
    var style = document.createElement('style'); style.id = 'aed-warning-styles';
    style.textContent = `
      @media (max-width: 640px) { #aed-update-warning { font-size: 0.82rem !important; padding: 6px 10px !important; } #aed-update-warning .aed-warning-full { display: none !important; } #aed-update-warning .aed-warning-compact { display: inline !important; } }
      @media (min-width: 641px) { #aed-update-warning .aed-warning-compact { display: none !important; } }
      @media (prefers-color-scheme: dark) { #aed-update-warning[data-severity="warning"] { background: #1c1917 !important; color: #fbbf24 !important; border-left-color: #f59e0b !important; } #aed-update-warning[data-severity="expired"], #aed-update-warning[data-severity="critical"] { background: #1c1917 !important; color: #fb923c !important; border-left-color: #f97316 !important; } #aed-update-warning .aed-edit-link { background: #292524 !important; color: #fbbf24 !important; border-color: #f59e0b !important; } #aed-update-warning .aed-mini-badge { color: #9ca3af !important; border-top-color: rgba(255,255,255,0.1) !important; } }
      #aed-update-warning .aed-edit-link { display: inline-block; margin-left: 10px; padding: 4px 10px; background: #fff; color: #c2410c; border: 1px solid #f97316; border-radius: 4px; text-decoration: none; font-size: 0.8rem; font-weight: 600; }
      #aed-update-warning .aed-mini-badge { display: block; font-weight: normal; font-size: 0.78rem; opacity: 0.85; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(0,0,0,0.08); }
      #aed-update-warning .aed-edit-hint { display: block; margin-top: 8px; padding: 6px 10px; background: #fef3c7; border: 1px solid #fbbf24; border-radius: 4px; color: #78350f !important; font-size: 0.82rem; font-weight: 500; }
      #aed-guide-btn-wrap { display: block; margin: 12px 0 16px 0; }
      #aed-guide-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: #eff6ff; color: #1e40af !important; border: 1px solid #93c5fd; border-radius: 6px; font-size: 0.82rem; font-weight: 600; cursor: pointer; font-family: system-ui, sans-serif; user-select: none; }
      #aed-guide-btn:hover { background: #dbeafe; }
      #aed-guide-hint { display: inline-block; margin-left: 10px; color: #16a34a; font-size: 0.78rem; font-weight: 600; }
      #aed-guide-modal { position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 20px; }
      .aed-guide-backdrop { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.7); }
      .aed-guide-content { position: relative; background: #fff; border-radius: 12px; max-width: 900px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); font-family: system-ui, sans-serif; }
      .aed-guide-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; border-bottom: 2px solid #e5e7eb; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px 12px 0 0; }
      .aed-guide-header h2 { margin: 0; color: #1e40af; font-size: 1.15rem; }
      .aed-guide-close { background: #ef4444; color: #fff; border: none; border-radius: 6px; width: 32px; height: 32px; font-size: 1.2rem; cursor: pointer; }
      .aed-guide-body { padding: 20px 24px; overflow-y: auto; flex: 1; color: #374151; font-size: 0.9rem; line-height: 1.6; }
      .aed-guide-section { margin-bottom: 24px; }
      .aed-guide-section h3 { margin: 0 0 10px 0; padding-bottom: 6px; color: #1f2937; font-size: 1rem; border-bottom: 2px solid #e5e7eb; }
      .aed-guide-meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 16px; }
      .aed-guide-meta-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 12px; }
      .aed-guide-meta-label { color: #6b7280; font-size: 0.75rem; text-transform: uppercase; }
      .aed-guide-meta-value { color: #111827; font-weight: 700; font-size: 0.9rem; margin-top: 2px; }
      .status-fresh { color: #16a34a; } .status-warning { color: #f59e0b; } .status-expired { color: #dc2626; }
      .aed-guide-list { margin: 0; padding-left: 20px; } .aed-guide-list li { margin-bottom: 6px; }
      .aed-guide-issue-critical { background: #fef2f2; border-left: 4px solid #dc2626; padding: 10px 14px; border-radius: 4px; margin-bottom: 8px; color: #991b1b; }
      .aed-guide-issue-warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 10px 14px; border-radius: 4px; margin-bottom: 8px; color: #78350f; }
      .aed-guide-section-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
      .aed-guide-section-table th, .aed-guide-section-table td { border: 1px solid #e5e7eb; padding: 10px 12px; text-align: left; vertical-align: top; }
      .aed-guide-section-table th { background: #f3f4f6; font-weight: 700; color: #374151; }
      .aed-guide-section-table tr:nth-child(even) { background: #f9fafb; }
      .aed-guide-footer { padding: 14px 24px; border-top: 1px solid #e5e7eb; background: #f9fafb; border-radius: 0 0 12px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: #6b7280; }
      .aed-guide-footer-btn { padding: 8px 16px; background: #6b7280; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
      .aed-patch-box { background: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #3b82f6; padding: 10px 14px; border-radius: 4px; font-family: monospace; font-size: 0.85rem; color: #1e293b; margin-top: 4px; white-space: pre-wrap; }
      .aed-patch-old { color: #dc2626; text-decoration: line-through; background: #fef2f2; padding: 2px 4px; border-radius: 2px; }
      .aed-patch-new { color: #16a34a; font-weight: bold; background: #f0fdf4; padding: 2px 4px; border-radius: 2px; }
      .aed-copy-box { width: 100%; min-height: 100px; padding: 10px; font-family: monospace; font-size: 0.85rem; background: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #3b82f6; border-radius: 4px; margin-top: 6px; resize: vertical; }
      @media (prefers-color-scheme: dark) {
        .aed-guide-content { background: #1f2937; color: #e5e7eb; } .aed-guide-header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); } .aed-guide-header h2 { color: #93c5fd; }
        .aed-guide-body { color: #d1d5db; } .aed-guide-section h3 { color: #f3f4f6; border-bottom-color: #374151; } .aed-guide-meta-item { background: #111827; border-color: #374151; } .aed-guide-meta-label { color: #9ca3af; } .aed-guide-meta-value { color: #f3f4f6; }
        .aed-guide-section-table th { background: #111827; color: #e5e7eb; } .aed-guide-section-table td { border-color: #374151; } .aed-guide-section-table tr:nth-child(even) { background: #111827; }
        .aed-guide-issue-critical { background: #450a0a; color: #fca5a5; } .aed-guide-issue-warning { background: #451a03; color: #fcd34d; } .aed-guide-footer { background: #111827; border-top-color: #374151; }
        .aed-patch-box { background: #0f172a; border-color: #334155; border-left-color: #3b82f6; color: #e2e8f0; } .aed-patch-old { background: #450a0a; color: #fca5a5; } .aed-patch-new { background: #052e16; color: #86efac; }
        .aed-copy-box { background: #0f172a; border-color: #334155; color: #e2e8f0; }
      }
      @media (max-width: 640px) { .aed-guide-content { max-height: 95vh; } .aed-guide-body { padding: 16px; font-size: 0.85rem; } .aed-guide-section-table th, .aed-guide-section-table td { padding: 6px 8px; } }
      .aed-author-byline { display: inline-flex !important; align-items: center !important; gap: 8px; font-size: 0.9rem; color: #4b5563; margin: 8px 0 !important; font-family: system-ui, sans-serif; }
      .aed-author-byline .aed-author-avatar { width: 22px; height: 22px; border-radius: 50%; background: #ea580c; color: #fff; font-size: 0.72rem; font-weight: 700; text-align: center; line-height: 22px; margin-right: 6px !important; }
      .aed-author-byline a.aed-author-name { color: #ea580c; text-decoration: none; font-weight: 600; }
      [data-aed-hidden="true"], [data-aed-hidden="partial"], [data-aed-hidden="full"] { display: none !important; }
    `;
    document.head.appendChild(style);
  }

  function getValidityByContext(pl, cf) { var f = String(cf || '').toUpperCase(); if (MONEY_LEVELS.indexOf(pl) !== -1) { if (f === 'HARGA' || f === 'GABUNG' || f === 'COMMERCIAL') return 180; if (f === 'INFORMASI') return 365; return 180; } var r = BASE_PAGE_LEVEL_RULES[pl]; return r ? r.validityDays : 180; }
  function getWarningDays(vd) { if (!WARNING_CONFIG.USE_TIERED) return WARNING_CONFIG.SHOW_DAYS_BEFORE; var r = WARNING_CONFIG.TIERED_RULES || []; for (var i = 0; i < r.length; i++) if (vd <= r[i].maxValidity) return r[i].showDays; return WARNING_CONFIG.SHOW_DAYS_BEFORE; }
  function toISOWithTimezoneLocal(date, offset) { offset = offset || "+07:00"; if (!date) return null; const d = new Date(date); if (isNaN(d.getTime())) return null; const pad = (n) => (n < 10 ? '0' : '') + n; return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${offset}`; }
  function formatTanggalIndo(dateStr) { if (!dateStr) return ''; var b = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']; var d = new Date(dateStr); if (isNaN(d.getTime())) return ''; return d.getDate() + ' ' + b[d.getMonth()] + ' ' + d.getFullYear(); }

  function checkAndShowInlineWarning(pl, cf) {
    if (!WARNING_CONFIG.ENABLED) return; pl = pl || document.body.getAttribute('data-page-level') || ''; cf = cf || document.body.getAttribute('data-content-focus') || '';
    const mn = document.querySelector('meta[name="nextUpdate"]'); const mm = document.querySelector('meta[itemprop="dateModified"]'); if (!mn || !mn.getAttribute('content')) return;
    const nus = mn.getAttribute('content'); const ms = mm ? mm.getAttribute('content') : 'unknown'; let vd = 365;
    if (ms && ms !== 'unknown') { const md = new Date(ms); const nd = new Date(nus); if (!isNaN(md.getTime()) && !isNaN(nd.getTime())) vd = Math.round((nd - md) / 86400000); }
    const wt = getWarningDays(vd); const nd = new Date(nus); const now = new Date(); const dd = Math.ceil((nd - now) / 86400000);
    let sev = null, mk = null, mr = null;
    if (dd < 0) { if (!WARNING_CONFIG.SHOW_AFTER_EXPIRED) return; sev = 'expired'; mk = (Math.abs(dd) > WARNING_CONFIG.STUCK_THRESHOLD_DAYS) ? 'stale' : 'expired'; }
    else if (dd === 0) { sev = 'critical'; mk = 'critical'; }
    else if (dd <= wt) { sev = 'warning'; mk = 'warning'; mr = { days: dd }; }
    else return;
    var pr = getPriority(pl, cf);
    if (sev === 'expired' && Math.abs(dd) > WARNING_CONFIG.STUCK_THRESHOLD_DAYS) { document.body.setAttribute('data-aed-warning-stuck', 'true'); document.body.setAttribute('data-aed-warning-stuck-days', String(Math.abs(dd))); }
    document.body.setAttribute('data-aed-warning-severity', sev); document.body.setAttribute('data-aed-warning-days', String(dd)); document.body.setAttribute('data-aed-warning-priority', pr);
    createWarningElement(getMessage(mk, mr), sev, pr, dd, ms, pl, cf);
  }

  function createWarningElement(message, severity, priority, daysDiff, modifiedStr, pageLevel, contentFocus) {
    if (document.getElementById('aed-update-warning')) return; injectWarningStyles();
    var w = document.createElement('div'); w.id = 'aed-update-warning'; w.setAttribute('data-nosnippet', ''); w.setAttribute('data-severity', severity); w.setAttribute('data-priority', priority || 'low'); w.setAttribute('role', 'alert');
    var cm = ''; if (severity === 'expired' || severity === 'critical') cm = 'ℹ️ ' + (detectLocale() === 'en' ? 'Review due' : 'Review berkala'); else if (severity === 'warning') cm = 'ℹ️ ' + (detectLocale() === 'en' ? 'Review in ' + daysDiff + 'd' : 'Review ' + daysDiff + ' hari');
    var mm = document.createElement('span'); mm.className = 'aed-warning-full'; mm.textContent = message; w.appendChild(mm);
    var cs = document.createElement('span'); cs.className = 'aed-warning-compact'; cs.textContent = cm; w.appendChild(cs);
    if (isAdmin()) { var eh = document.createElement('span'); eh.className = 'aed-edit-hint'; eh.setAttribute('data-nosnippet', ''); eh.textContent = getMessage('editHint'); w.appendChild(eh); }
    if (WARNING_CONFIG.MINI_BADGE_ENABLED && modifiedStr && modifiedStr !== 'unknown') { var mt = formatTanggalIndo(modifiedStr); if (mt) { var mb = document.createElement('span'); mb.className = 'aed-mini-badge'; mb.setAttribute('data-nosnippet', ''); mb.textContent = getMessage('miniBadge', { date: mt }); w.appendChild(mb); } }
    if (isAdmin()) { var el = document.createElement('a'); el.href = buildEditLink(); el.className = 'aed-edit-link'; el.textContent = getMessage('editBtn'); el.setAttribute('rel', 'nofollow'); el.setAttribute('target', '_blank'); w.appendChild(el); }
    var s = WARNING_CONFIG.STYLE[severity] || WARNING_CONFIG.STYLE.warning; for (var k in s) if (s.hasOwnProperty(k)) w.style[k] = s[k];
    var a = null; var sl = WARNING_CONFIG.INSERT_AFTER_SELECTOR.split(',').map(x => x.trim());
    for (var i = 0; i < sl.length; i++) { try { var e = document.querySelector(sl[i]); if (e) { a = e; break; } } catch(e) {} }
    if (a) a.parentNode.insertBefore(w, a.nextSibling); else { var h = document.querySelector('h1'); if (h) h.parentNode.insertBefore(w, h.nextSibling); else document.body.insertBefore(w, document.body.firstChild); }
  }

  function normalizeBylineText(t) { return String(t || '').replace(/\s+/g, ' ').trim(); }
  function isBrokenByline(t) { var c = normalizeBylineText(t).toLowerCase(); if (!c) return true; if (c.length <= 5 && /^(by|oleh|\s|[-–—|])+$/i.test(c)) return true; for (var i = 0; i < AUTHOR_BYLINE_CONFIG.BROKEN_PATTERNS.length; i++) if (AUTHOR_BYLINE_CONFIG.BROKEN_PATTERNS[i].test(c)) return true; return false; }
  function isInsideExclude(el) { for (var i = 0; i < AUTHOR_BYLINE_CONFIG.EXCLUDE_SELECTORS.length; i++) { try { if (el.closest(AUTHOR_BYLINE_CONFIG.EXCLUDE_SELECTORS[i])) return true; } catch(e) {} } return false; }
  function buildAuthorByline() {
    var w = document.createElement('div'); w.className = 'aed-author-byline'; w.setAttribute('data-nosnippet', ''); w.setAttribute('itemprop', 'author'); w.setAttribute('itemscope', ''); w.setAttribute('itemtype', 'https://schema.org/Organization');
    if (AUTHOR_BYLINE_CONFIG.SHOW_AVATAR) { var a = document.createElement('span'); a.className = 'aed-author-avatar'; a.setAttribute('aria-hidden', 'true'); a.textContent = AUTHOR_BYLINE_CONFIG.AVATAR_INITIAL; w.appendChild(a); }
    var l = document.createElement('span'); l.className = 'aed-author-label'; l.textContent = 'By:'; w.appendChild(l);
    var k = document.createElement('a'); k.className = 'aed-author-name'; k.href = AUTHOR_BYLINE_CONFIG.URL; k.textContent = AUTHOR_BYLINE_CONFIG.NAME; k.setAttribute('itemprop', 'name'); k.setAttribute('rel', 'author'); w.appendChild(k);
    return w;
  }
  function findExistingByline() { for (var i = 0; i < AUTHOR_BYLINE_CONFIG.SELECTORS.length; i++) { try { var c = document.querySelectorAll(AUTHOR_BYLINE_CONFIG.SELECTORS[i]); for (var j = 0; j < c.length; j++) { var e = c[j]; if (isInsideExclude(e) || e.querySelector('.aed-author-byline')) continue; var t = normalizeBylineText(e.innerText); if (t.length > 200) continue; return e; } } catch(e) {} } return null; }
  function hideExistingBylineNearH1() {
    var h = document.querySelector('h1'); if (!h) return 0; var r = h.getBoundingClientRect(); var hd = 0;
    var s = ['.title-secondary','.post-header-line-1','.post-header','.post-meta','.entry-meta','.post-info','.byline','address'];
    for (var i = 0; i < s.length; i++) {
      var c = document.querySelectorAll(s[i]);
      for (var j = 0; j < c.length; j++) {
        var p = c[j]; if (isInsideExclude(p) || p.getAttribute('data-aed-hidden') || p.querySelector('.aed-author-byline')) continue;
        var pr = p.getBoundingClientRect(); if (pr.top < r.top - 50 || pr.top > r.bottom + 400) continue;
        var ha = p.querySelector('.post-author, .vcard, [itemprop="author"], .g-profile'); var hb = /\b(by|oleh)\b/i.test(p.innerText || '');
        if (!ha && !hb) continue;
        var ht = p.querySelector('.post-timestamp, [itemprop="datePublished"], time, .timestamp-link'); var hc = p.querySelector('.post-comment-link, .comment-link'); var hl = p.querySelector('.post-labels, .entry-labels');
        if (!ht && !hc && !hl) { p.style.display = 'none'; p.setAttribute('data-aed-hidden', 'full'); hd++; break; }
        p.setAttribute('data-aed-hidden', 'partial'); hd++; break;
      }
      if (hd > 0) break;
    }
    return hd;
  }
  function injectAuthorByline() {
    if (!AUTHOR_BYLINE_CONFIG.ENABLED) return; if (document.querySelector('.aed-author-byline')) return;
    var b = findExistingByline();
    if (b) { var t = normalizeBylineText(b.innerText); if (!isBrokenByline(t) && !AUTHOR_BYLINE_CONFIG.ALWAYS_REPLACE) return; var nb = buildAuthorByline(); b.innerHTML = ''; b.appendChild(nb); b.setAttribute('data-aed-author-enhanced', 'true'); return; }
    hideExistingBylineNearH1(); var h = document.querySelector('h1'); if (h) { var nb2 = buildAuthorByline(); h.parentNode.insertBefore(nb2, h.nextSibling); }
  }

  function getPLDVersion() { if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.version) { var v = window.pageLevelDetectorv22.version; return { version: v, family: "v23-lite", label: "v23.9.9-lite" }; } return { version: "none", family: "none", label: "none" }; }
  function _cachePLD(k, f) { if (_AED_PLD_CACHE[k] !== undefined) return _AED_PLD_CACHE[k]; var r = f(); _AED_PLD_CACHE[k] = r; return r; }
  function getPLDContentFocus(pl, et) { return window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detectContentFocus === "function" ? _cachePLD("cf|" + pl + "|" + et, function() { try { return window.pageLevelDetectorv22.detectContentFocus(pl, et); } catch(e) { return null; } }) : null; }
  function getPLDKategori(cf) { return window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detectKategori === "function" ? _cachePLD("kat|" + (cf || "INFORMASI"), function() { try { return window.pageLevelDetectorv22.detectKategori((cf || "INFORMASI").toUpperCase()); } catch(e) { return null; } }) : null; }
  function getPLDH1Pattern(k) { return window.pageLevelDetectorv22 && k && typeof window.pageLevelDetectorv22.detectH1Pattern === "function" ? _cachePLD("h1|" + k, function() { try { return window.pageLevelDetectorv22.detectH1Pattern(k); } catch(e) { return null; } }) : null; }
  function getPLDSchemaType(pl, et, cf) { return window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detectSchemaType === "function" ? _cachePLD("sch|" + pl + "|" + et + "|" + (cf || "INFORMASI"), function() { try { return window.pageLevelDetectorv22.detectSchemaType(pl, et, (cf || "INFORMASI").toUpperCase()); } catch(e) { return null; } }) : null; }
  function getPLDCtaType(pl, cf, et) { return window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detectCtaType === "function" ? _cachePLD("cta|" + pl + "|" + (cf || "INFORMASI") + "|" + (et || "none"), function() { try { return window.pageLevelDetectorv22.detectCtaType(pl, (cf || "INFORMASI").toUpperCase(), et || null); } catch(e) { return null; } }) : null; }
  function getKategori(pl, cf, ft) { if (ft) return (ft === 'evergreen') ? 'EVERGREEN' : 'NON-EVERGREEN'; if (EVERGREEN_LEVELS.indexOf(pl) !== -1) return 'EVERGREEN'; if (MONEY_LEVELS.indexOf(pl) !== -1) return (String(cf || '').toUpperCase() === 'INFORMASI') ? 'EVERGREEN' : 'NON-EVERGREEN'; return getPLDKategori(cf) || 'EVERGREEN'; }
  function detectContentTypeByH1() {
    var h = document.querySelector('h1'); var t = h ? (h.innerText || h.textContent || '') : ''; var tl = t.toLowerCase(); var hy = /\b(19|20)\d{2}\b/.test(tl);
    if (!h) return { isInformational: true, isPrice: false, hasYear: false, h1Text: '', source: 'safe' };
    var pv = getPLDVersion();
    if (pv.family === "v23-lite") { try { var pl = window.pageLevelDetectorv22.detect(); var et = window.pageLevelDetectorv22.detectEntityType(); var pf = getPLDContentFocus(pl, et); if (pf) { var n = String(pf).toUpperCase(); return { isInformational: n === 'INFORMASI', isPrice: ['HARGA','COMMERCIAL','GABUNG'].includes(n), hasYear: hy, h1Text: tl, source: 'pld' }; } } catch(e) {} }
    var bf = document.body.getAttribute('data-content-focus'); if (bf) { var n2 = bf.toUpperCase(); return { isInformational: n2 === 'INFORMASI', isPrice: ['HARGA','COMMERCIAL','GABUNG'].includes(n2), hasYear: hy, h1Text: tl, source: 'body' }; }
    return { isInformational: true, isPrice: false, hasYear: hy, h1Text: tl, source: 'safe' };
  }
  function getContentFocus(hd, pl, et) { if (pl && et) { var pf = getPLDContentFocus(pl, et); if (pf) return String(pf).toUpperCase(); } var bf = document.body.getAttribute('data-content-focus'); if (bf) return bf.toUpperCase(); if (hd) { if (hd.isInformational) return 'INFORMASI'; if (hd.isPrice) return 'HARGA'; } return 'INFORMASI'; }
  function queryByKeyword(c, kws, ry) { if (ry === undefined) ry = true; var r = []; if (!c) return r; c.querySelectorAll('p, span, time, li, td, .update-badge, .last-updated, .date-modified').forEach(function(el) { var tag = el.tagName; if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return; var t = (el.innerText || '').toLowerCase(); if (!t || t.length > 500) return; if (!kws.some(function(kw) { return t.includes(kw.toLowerCase()); })) return; if (!ry) { r.push(el); return; } if (/\b(19|20)\d{2}\b/.test(t)) r.push(el); }); return r; }
  function hasLastUpdatedAnchor() { var sels = ['.update-badge', '[class*="update-badge"]', '.last-updated', '.updated-date', '.date-modified', '.post-date', '.article-date', '.publish-date', '.post-meta', '.entry-meta', '.article-meta', '.breadcrumb + p', '.toc + p', 'h1 + p', '[class*="last-updated"]']; for (var i = 0; i < sels.length; i++) { try { var e = document.querySelectorAll(sels[i]); if (e && e.length > 0) return true; } catch(er) {} } var ke = queryByKeyword(document.body, ['diperbarui','update','terakhir','last updated','updated','perbarui'], true); return ke && ke.length > 0; }
  function detectContentChangeSinceLastVisit() { var c = document.querySelector('.post-body.entry-content, .post-body, article, main'); if (!c) return { changed: false, reason: 'no-container' }; var t = (c.innerText || '').replace(/\s+/g, ' ').trim(); if (t.length < 100) return { changed: false, reason: 'too-short' }; var h = 0; for (var i = 0; i < t.length; i++) { h = ((h << 5) - h) + t.charCodeAt(i); h = h | 0; } var ch = String(Math.abs(h)); var sk = 'aed-content-hash-' + location.pathname; var sh = null; try { sh = localStorage.getItem(sk); } catch(e) {} var changed = false; if (sh && sh !== ch) { changed = true; } try { localStorage.setItem(sk, ch); } catch(e) {} return { changed: changed, reason: changed ? 'content-changed' : 'same', hash: ch }; }

  function updateJsonLdDates(dm, pv) { /* 🩹 SAFE-MODE: DISABLED */ return { updated: 0 }; }
  function cleanupFaqSchema(bn) { /* 🩹 SAFE-MODE: DISABLED */ return { cleaned: 0, injected: 0, normalized: 0, entitiesDecoded: 0 }; }
  function updateJsonLdFaqYears(ny) { /* 🩹 SAFE-MODE: DISABLED */ return { updated: 0, replaced: 0 }; }
  function updateContentByLevelAndFocus(pl, cf, now) { /* 🩹 SAFE-MODE: DISABLED */ return { updated: false, skipped: true }; }
  function updateH1WithRules(pl, now) { /* 🩹 SAFE-MODE: DISABLED */ return { updated: false }; }
  function autoUpdateDates(pl, cf, opts) {
    console.log('🩹 [AED SAFE-MODE] autoUpdateDates() called but DISABLED. dateModified stays as Blogger value.');
    return false;
  }

  async function processMetaDates(cdm, ft, vm, upvu, pl, et, ci, apr, dv, conf, strat, sc, io, oreason, hd, cf, au) {
    var mp = document.querySelector('meta[itemprop="datePublished"]');
    var mm = document.querySelector('meta[itemprop="dateModified"]');
    var mn = document.querySelector('meta[name="nextUpdate"]');
    var nowISO = new Date().toISOString();

    var dp = (mp && mp.getAttribute('content')) ? mp.getAttribute('content').trim() : nowISO;
    var dm = (mm && mm.getAttribute('content')) ? mm.getAttribute('content').trim() : dp;
    if (new Date(dm).getTime() < new Date(dp).getTime()) dm = dp;
    if (!mn) { mn = document.createElement("meta"); mn.setAttribute("name","nextUpdate"); document.head.appendChild(mn); }
    var nu = toISOWithTimezoneLocal(new Date(new Date(dm).getTime() + vm));
    mn.setAttribute("content", nu);

    document.body.classList.add('page-level-' + pl);
    document.body.classList.add('entity-type-' + et);
    document.body.classList.add('content-type-' + ft);
    document.body.classList.add('cta-intensity-' + ci);
    if (apr) document.body.classList.add('allow-price-range');
    if (io) document.body.classList.add('overridden-evergreen');

    var kat = getKategori(pl, cf, ft);
    window.AEDMetaDates = {
      type: ft, entityType: et, pageLevel: pl,
      datePublished: dp,
      dateModified: dm,
      nextUpdate: nu,
      priceValidUntil: nu,
      validityDays: vm / 86400000,
      usePriceValidUntil: upvu,
      ctaIntensity: ci, allowPriceRange: apr,
      detectorVersion: dv || 'v18.0.0-safe-consistency',
      detectionConfidence: conf || null,
      isOverridden: io || false,
      overrideReason: oreason || null,
      h1Detection: hd || null,
      contentFocus: cf || null,
      pldKategori: kat,
      pldH1Pattern: getPLDH1Pattern(kat),
      pldSchemaType: getPLDSchemaType(pl, et, cf),
      pldCtaType: getPLDCtaType(pl, cf, et),
      brandName: resolveBrandName(),
      needsManualVerify: false,
      lastAutoUpdate: null,
      updateCount: 0,
      safeMode: true,
      consistencyEnabled: CONSISTENCY_CONFIG.ENABLED
    };
    window.EvergreenDetectorResults = window.AEDMetaDates;
  }

  function resolveBrandName() {
    if (window.AEDMetaDates && window.AEDMetaDates.brandName) return window.AEDMetaDates.brandName;
    var m = document.querySelector('meta[name="brand"]'); if (m && m.getAttribute('content')) return m.getAttribute('content').trim();
    var o = document.querySelector('meta[property="og:site_name"]'); if (o && o.getAttribute('content')) return o.getAttribute('content').trim();
    return DEFAULT_BRAND_NAME;
  }

  function getPageLevelAndEntityType() { var pl = 'pillar', et = 'produk', dv = 'unknown', conf = null, strat = null, sc = null; var bl = document.body.getAttribute('data-page-level'); var be = document.body.getAttribute('data-entity-type'); if (bl && be) return { pageLevel: bl, entityType: be, detectorVersion: getPLDVersion().label, confidence: conf, strategies: strat, strategyCount: sc }; if (window.pageLevelDetectorv22) { try { if (typeof window.pageLevelDetectorv22.detectFromDOM === 'function') { var dr = window.pageLevelDetectorv22.detectFromDOM(); if (dr) pl = dr; } if ((!pl || pl === 'pillar') && typeof window.pageLevelDetectorv22.detect === 'function') { var ur = window.pageLevelDetectorv22.detect(); if (ur) pl = ur; } if (typeof window.pageLevelDetectorv22.detectEntityType === 'function') et = window.pageLevelDetectorv22.detectEntityType(); return { pageLevel: pl, entityType: et, detectorVersion: getPLDVersion().label, confidence: conf, strategies: strat, strategyCount: sc }; } catch(e) {} } return { pageLevel: pl, entityType: et, detectorVersion: 'none' }; }
  function waitForPageLevelDetector() { return new Promise(function(resolve) { if (document.body && document.body.getAttribute('data-page-level')) { resolve(); return; } if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') { resolve(); return; } var onR = function() { resolve(); }; window.addEventListener("pageLevelDetectorv22Ready", onR, { once: true }); setTimeout(function() { if (!window.pageLevelDetector && !document.body.getAttribute('data-page-level')) { window.pageLevelDetector = { detect: function() { return 'pillar'; }, detectEntityType: function() { return 'produk'; } }; } resolve(); }, 3000); }); }
  function getRulesByEntityType(et, pl, hd, cf) { var im = MONEY_LEVELS.indexOf(pl) !== -1; if (im) { var nf = String(cf || '').toUpperCase(); if (nf === 'INFORMASI' && !(hd && hd.hasYear)) return { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft-medium', overridden: true, overrideReason: 'Money level + INFORMASI' }; var v = getValidityByContext(pl, nf); return { type: 'non-evergreen', validityDays: v, usePriceValidUntil: (nf === 'HARGA' || nf === 'GABUNG'), allowPriceRange: pl === 'money-master', ctaIntensity: pl === 'money-child' ? 'very-hard' : 'hard' }; } if (et === 'jasa') return JASA_RULES[pl] || DEFAULT_RULE; if (et === 'sewa') return SEWA_RULES[pl] || BASE_PAGE_LEVEL_RULES[pl] || DEFAULT_RULE; if (et === 'produk' || et === 'material') return PRODUK_MATERIAL_RULES[pl] || BASE_PAGE_LEVEL_RULES[pl] || DEFAULT_RULE; return BASE_PAGE_LEVEL_RULES[pl] || DEFAULT_RULE; }

  function analyzePageContent() {
    var container = document.querySelector('.post-body.entry-content, .post-body, article, main') || document.body;
    var text = container.innerText || ''; var h1 = document.querySelector('h1'); var h1Text = h1 ? (h1.innerText || '').trim() : '';
    var h1YearMatch = h1Text.match(/\b(19|20)\d{2}\b/); var h1Year = h1YearMatch ? parseInt(h1YearMatch[0], 10) : null; var currentYear = new Date().getFullYear(); var h1YearOutdated = h1Year && h1Year < currentYear;
    var allYears = text.match(/\b(19|20)\d{2}\b/g) || []; var uniqueYears = Array.from(new Set(allYears.map(Number))); var outdatedYears = uniqueYears.filter(function(y) { return y >= 2020 && y < currentYear; });
    var hasFaq = false; var faqSelectors = ['[itemtype*="FAQ"]', '[itemprop="mainEntity"]', '.faq', '[class*="faq"]', '[id*="faq"]'];
    for (var i = 0; i < faqSelectors.length; i++) { try { if (document.querySelector(faqSelectors[i])) { hasFaq = true; break; } } catch (e) {} }
    var faqCount = 0; var faqQRegex = /\b(?:T\s*[:.]|\bQ\s*:)/g; var faqMatches = text.match(faqQRegex) || []; faqCount = faqMatches.length;
    if (faqCount === 0 && hasFaq) { var qmarks = text.match(/\?/g) || []; faqCount = Math.min(qmarks.length, 20); }
    var priceMatches = text.match(/Rp\s*[\d.,]+/gi) || []; var hasPrice = priceMatches.length > 0; var priceCount = priceMatches.length; var priceSnippet = priceMatches.length > 0 ? priceMatches[0] : 'Tidak ada';
    var dateTextMatch = text.match(/(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+(20\d{2})/i); var dateSnippet = dateTextMatch ? dateTextMatch[0] : 'Tidak terdeteksi';
    var hasWA = false; try { if (document.querySelector('a[href*="wa.me"], a[href*="whatsapp"], a[href*="wa.link"]')) hasWA = true; } catch (e) {} if (!hasWA && /628\d{8,}|62\s*8\d{2}[\s-]?\d{4}/.test(text)) hasWA = true;
    var tableCount = 0; try { tableCount = document.querySelectorAll('.post-body table, article table').length; } catch (e) {} var hasTable = tableCount > 0;
    var wordCount = text.trim().split(/\s+/).length; var h2Count = 0, h3Count = 0; try { h2Count = document.querySelectorAll('.post-body h2, article h2').length; h3Count = document.querySelectorAll('.post-body h3, article h3').length; } catch (e) {}
    var pElements = document.querySelectorAll('.post-body.entry-content p, .post-body p, article p');
    var validPs = [];
    for (var j = 0; j < pElements.length; j++) { var txt = (pElements[j].innerText || '').trim(); if (txt.length > 30 && !pElements[j].closest('.faq-item')) { validPs.push(txt); } }
    var firstPText = validPs.length > 0 ? validPs[0] : '';
    var secondPText = validPs.length > 1 ? validPs[1] : '';
    var lastPText = validPs.length > 1 ? validPs[validPs.length - 1] : '';
    var firstH2 = document.querySelector('.post-body h2, article h2');
    var h2Text = firstH2 ? (firstH2.innerText || '').trim() : '';
    var firstList = document.querySelector('.post-body ul, .post-body ol, article ul, article ol');
    var listCount = 0; if (firstList) { listCount = firstList.querySelectorAll('li').length; }
    return { h1Text: h1Text, h1Year: h1Year, h1YearOutdated: h1YearOutdated, currentYear: currentYear, uniqueYears: uniqueYears, outdatedYears: outdatedYears, hasFaq: hasFaq, faqCount: faqCount, hasPrice: hasPrice, priceCount: priceCount, priceSnippet: priceSnippet, dateSnippet: dateSnippet, hasWA: hasWA, hasTable: hasTable, tableCount: tableCount, wordCount: wordCount, h2Count: h2Count, h3Count: h3Count, hasFirstP: firstPText !== '', firstPText: firstPText, hasSecondP: secondPText !== '', secondPText: secondPText, hasLastP: lastPText !== '', lastPText: lastPText, hasH2: h2Text !== '', h2Text: h2Text, hasList: listCount > 0, listCount: listCount };
  }

  function generatePageGuide(pageLevel, contentFocus, finalType, validityDays, daysUntilReview) {
    var a = analyzePageContent();
    var currentMonthYear = (new Date().toLocaleString('id-ID', { month: 'long' })) + ' ' + a.currentYear;
    var isMoney = pageLevel.indexOf('money') === 0 || pageLevel === 'variant' || pageLevel === 'sub-variant';
    var isEvergreen = EVERGREEN_LEVELS.indexOf(pageLevel) !== -1;
    var guide = { meta: { pageLevel: pageLevel, contentFocus: contentFocus, finalType: finalType, validityDays: validityDays, daysUntilReview: daysUntilReview, status: daysUntilReview > 21 ? 'FRESH' : (daysUntilReview > 0 ? 'WARNING' : 'EXPIRED') }, issues: [], priorityActions: [], sectionGuide: [], minimalChanges: [], checklist: [], patchH1: '', patchH2: '', patchList: '', patchParagraph: '', patchBody: '', patchOutro: '', patchFaq: '' };
    var pickRandom = function(arr) { return arr[Math.floor(Math.random() * arr.length)]; };

    if (a.h1YearOutdated) { var newH1 = a.h1Text.replace(/\b(19|20)\d{2}\b/, a.currentYear); guide.patchH1 = `[⚠️ REVISI H1 (JUDUL UTAMA)]\n` + `Teks lama: "${a.h1Text}"\n\n` + `GANTI DENGAN:\n` + `"${newH1}"\n\n` + `💡 *Catatan Admin:* Copy judul baru di atas, lalu timpa H1 di Blogger.`; } else { guide.patchH1 = `[✅ H1 (JUDUL) AMAN]\nTahun di H1 sudah ${a.currentYear}. Tidak perlu diubah.`; }

    if (a.hasH2) { var suggestedH2 = a.h2Text; if (!/\b(19|20)\d{2}\b/.test(suggestedH2)) { suggestedH2 = suggestedH2 + ` (Update ${a.currentYear})`; } guide.patchH2 = `[💡 SARAN UPDATE H2 (SUB-JUDUL)]\n` + `Teks lama: "${a.h2Text}"\n\n` + `SARAN PENAMBAHAN:\n` + `"${suggestedH2}"\n\n` + `💡 *Catatan Admin:* Anda bisa menambahkan teks "${a.currentYear}" atau kata "Terbaru" di sub-judul pertama agar terlihat lebih fresh.`; } else { guide.patchH2 = `[ℹ️ H2 (SUB-JUDUL)]\nTidak ditemukan tag H2 di halaman ini.`; }

    if (a.hasList) { var listSignals = ""; if (isMoney) { listSignals = `- Update ketersediaan stok per ${currentMonthYear}\n- Tambahkan opsi pengiriman terbaru`; } else { listSignals = `- Tambahkan referensi standar terbaru (SNI/Regulasi)\n- Tambahkan 1 tips praktis dari pengalaman lapangan`; } guide.patchList = `[💡 SARAN UPDATE LIST (POIN-POIN)]\n` + `Terdeteksi ${a.listCount} poin di halaman ini.\n\n` + `TAMBAHKAN 1 POIN BARU INI KE DALAM LIST:\n` + `${listSignals}\n\n` + `💡 *Catatan Admin:* Tambahkan satu poin baru di urutan paling bawah list agar konten terlihat di-update.`; } else { guide.patchList = `[ℹ️ LIST (POIN-POIN)]\nTidak ditemukan tag list (ul/ol) di halaman ini.`; }

    if (a.hasFirstP) {
      var fullContext1 = a.firstPText.replace(/\b(2020|2021|2022|2023|2024|2025)\b/g, '').trim();
      var sig1 = "";
      if (isMoney) { sig1 = pickRandom([` Seluruh data dan penawaran terkait hal tersebut telah kami tinjau ulang dan perbarui pada ${currentMonthYear} untuk memastikan akurasi harga dan ketersediaan stok.`, ` Kami telah memperbarui rincian harga dan ketersediaan stok pada ${currentMonthYear} agar sesuai dengan kondisi pasar saat ini.`]); }
      else if (isEvergreen) { sig1 = pickRandom([` Panduan teknis, standar industri, dan referensi edukasi pada artikel ini telah kami tinjau ulang pada ${currentMonthYear} agar tetap relevan.`, ` Materi panduan komprehensif ini telah disegarkan pada ${currentMonthYear} untuk memastikan akurasi informasi dan praktik terbaiknya.`]); }
      else { sig1 = ` Pembahasan lengkap mengenai topik ini telah kami perbarui pada ${currentMonthYear} agar sesuai dengan standar terkini.`; }
      guide.patchParagraph = `[⚠️ REVISI PARAGRAF PEMBUKA]\n` + `Teks lama saat ini: "${a.firstPText}"\n\n` + `GANTI DENGAN DRAF BARU INI (Anti-Duplikat):\n` + `"${fullContext1}${sig1}"\n\n` + `💡 *Catatan Admin:* Copy seluruh teks di atas, lalu timpa paragraf pertama di Blogger.`;
    } else {
      guide.patchParagraph = `[➕ TAMBAH PARAGRAF PEMBUKA BARU]\n` + `Belum ada paragraf teks pembuka.\n\n` + `TAMBAHKAN PARAGRAF INI:\n` + `"Informasi terbaru dan panduan mengenai ${a.h1Text} telah kami perbarui pada ${currentMonthYear}."\n\n` + `💡 *Catatan Admin:* Paste di bawah H1 atau gambar pertama.`;
    }

    if (a.hasSecondP) {
      var fullContext2 = a.secondPText.replace(/\b(2020|2021|2022|2023|2024|2025)\b/g, '').trim();
      var sig2 = "";
      if (isMoney) { sig2 = pickRandom([` Spesifikasi teknis dan detail material pada bagian ini telah divalidasi ulang pada ${currentMonthYear} untuk menjaga standar kualitas proyek.`, ` Rincian ketersediaan dan standar material telah kami sesuaikan pada ${currentMonthYear} guna memenuhi kebutuhan lapangan.`]); }
      else if (isEvergreen) { sig2 = pickRandom([` Ulasan teknis pada bagian ini telah diperbarui pada ${currentMonthYear} sesuai dengan regulasi dan praktik konstruksi terbaru.`, ` Pembahasan metode pelaksanaan ini telah disesuaikan dengan standar industri terkini pada ${currentMonthYear}.`]); }
      else { sig2 = ` Bagian ini telah ditinjau ulang pada ${currentMonthYear}.`; }
      guide.patchBody = `[⚠️ REVISI PARAGRAF ISI (TENGAH)]\n` + `Teks lama saat ini: "${a.secondPText.substring(0, 100)}..."\n\n` + `TAMBAHKAN KALIMAT INI DI AKHIR PARAGRAF:\n` + `"${sig2}"\n\n` + `💡 *Catatan Admin:* Copy kalimat di atas, lalu paste di ujung paragraf kedua (atau paragraf tengah).`;
    } else { guide.patchBody = `[ℹ️ PARAGRAF ISI]\nTidak ditemukan paragraf kedua yang cukup panjang (mungkin hanya ada 1 paragraf).`; }

    if (a.hasLastP && a.lastPText !== a.secondPText) {
      var fullContext3 = a.lastPText.replace(/\b(2020|2021|2022|2023|2024|2025)\b/g, '').trim();
      var sig3 = "";
      if (isMoney) { sig3 = pickRandom([` Untuk mendapatkan penawaran harga terbaik dan jadwal pengiriman terbaru per ${currentMonthYear}, silakan hubungi tim marketing kami.`, ` Segera konsultasikan kebutuhan proyek Anda kepada tim kami untuk mendapatkan update penawaran terbaru di ${currentMonthYear}.`]); }
      else if (isEvergreen) { sig3 = pickRandom([` Kami berkomitmen menyajikan informasi yang akurat. Pastikan Anda selalu merujuk pada panduan terbaru ini untuk hasil proyek yang maksimal.`, ` Demikian ulasan terbaru pada ${currentMonthYear}. Gunakan informasi ini sebagai acuan terbaik untuk kelancaran proyek Anda.`]); }
      else { sig3 = ` Demikian informasi terbaru ini kami sajikan pada ${currentMonthYear}.`; }
      guide.patchOutro = `[⚠️ REVISI PARAGRAF PENUTUP (CTA)]\n` + `Teks lama saat ini: "${a.lastPText.substring(0, 100)}..."\n\n` + `TAMBAHKAN KALIMAT CTA INI DI AKHIR:\n` + `"${sig3}"\n\n` + `💡 *Catatan Admin:* Copy kalimat di atas, lalu paste di ujung paragraf paling terakhir.`;
    } else if (a.hasLastP) { guide.patchOutro = `[ℹ️ PARAGRAF PENUTUP]\nHalaman ini hanya memiliki 1-2 paragraf. Gunakan saran Paragraf Isi di atas.`; } else { guide.patchOutro = `[ℹ️ PARAGRAF PENUTUP]\nTidak ditemukan paragraf penutup.`; }

    var faqTopic = a.h1Text.replace(/\b(19|20)\d{2}\b/g, '').replace(/harga|terbaru|termurah|terbaik|update|revisi|jasa|di|untuk|profesional|melayani|ready|mix/gi, '').replace(/\s+/g, ' ').trim();
    if (faqTopic.length < 5) faqTopic = "Produk & Layanan Konstruksi";
    var detectedLocation = 'Jabodetabek';
    if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detectLocation === 'function') { try { detectedLocation = window.pageLevelDetectorv22.detectLocation(); } catch(e){} } else { var urlSlug = window.location.pathname.split('/').pop().replace('.html', ''); var slugParts = urlSlug.split('-'); var lastWord = slugParts[slugParts.length - 1]; if (lastWord && lastWord.length > 3) { detectedLocation = lastWord.charAt(0).toUpperCase() + lastWord.slice(1); } }
    var faqLocation = detectedLocation;
    var lockedQuestion = `T: Berapa biaya dan lama pengerjaan untuk ${faqTopic} di area ${faqLocation}?`;
    var draftAnswer = `J: Biaya untuk ${faqTopic} di area ${faqLocation} sangat bergantung pada volume pekerjaan dan kondisi lapangan. Secara umum, estimasi waktu pengerjaan berkisar antara [3-7] hari kerja. Untuk mendapatkan penawaran harga pasti, silakan hubungi tim marketing kami.`;
    guide.patchFaq = `[✅ FAQ SIAP COPY-PASTE (Dijamin Unik)]\n` + `Kode di bawah ini sudah dalam format HTML. Anda cukup mengubah teks di dalam kurung [3-7] sesuai fakta lapangan, lalu paste ke Blogger (mode HTML).\n\n` + `<div class="faq-item">\n` + `  <button class="faq-question">${lockedQuestion}</button>\n` + `  <div class="faq-answer"><p>${draftAnswer}</p></div>\n` + `</div>\n\n` + `⚠️ PERINGATAN DUPLIKASI:\n` + `Pertanyaan di atas sudah otomatis unik karena menyisipkan nama halaman (${faqTopic}) dan lokasi (${faqLocation}). JANGAN mengubah nama topik/lokasi agar tidak bentrok dengan halaman lain.`;

    guide.patches = [
      { section: 'H1 (Judul)', detected: a.h1YearOutdated ? 'Tahun ' + a.h1Year + ' (Usang)' : 'Tahun ' + a.currentYear, action: a.h1YearOutdated ? 'Update tahun' : 'Cek relevansi', patch: a.h1YearOutdated ? 'Ubah <span class="aed-patch-old">' + a.h1Year + '</span> menjadi <span class="aed-patch-new">' + a.currentYear + '</span>' : '<span style="color:#16a34a">✅ Tidak perlu diubah</span>' },
      { section: 'Harga', detected: a.hasPrice ? 'Terdeteksi ' + a.priceCount + ' harga (cth: ' + a.priceSnippet + ')' : 'Tidak ada harga', action: a.hasPrice ? 'Verifikasi fakta' : 'Tambahkan harga', patch: a.hasPrice ? 'Pastikan <span class="aed-patch-old">' + a.priceSnippet + '</span> masih sama dengan supplier. Jika berubah: Ubah ke <span class="aed-patch-new">Rp [Harga Baru]</span>' : 'Tambahkan teks harga' },
      { section: 'Teks Bulan/Tahun', detected: a.dateSnippet !== 'Tidak terdeteksi' ? '"' + a.dateSnippet + '"' : 'Tidak terdeteksi', action: 'Update bulan/tahun', patch: a.dateSnippet !== 'Tidak terdeteksi' ? 'Ubah <span class="aed-patch-old">' + a.dateSnippet + '</span> menjadi <span class="aed-patch-new">' + currentMonthYear + '</span>' : 'Tambah kalimat: <span class="aed-patch-new">Berlaku per ' + currentMonthYear + '</span>' },
      { section: 'FAQ', detected: a.faqCount + ' item terdeteksi', action: a.faqCount < 3 ? 'Tambah FAQ' : 'Cek relevansi', patch: a.faqCount < 3 ? 'Lihat Template FAQ di bawah' : 'Tambahkan 1 pertanyaan terbaru.' }
    ];

    if (a.h1YearOutdated) guide.issues.push({ level: 'critical', text: 'Tahun di H1 (' + a.h1Year + ') usang. Current: ' + a.currentYear + '.' });
    if (a.outdatedYears.length > 0) guide.issues.push({ level: 'warning', text: 'Tahun usang di konten: ' + a.outdatedYears.join(', ') });
    if ((contentFocus === 'HARGA' || contentFocus === 'GABUNG') && !a.hasPrice) guide.issues.push({ level: 'critical', text: 'Tidak  ada harga (Rp...) padahal content focus = HARGA.' });
    if (!a.hasWA && pageLevel.indexOf('money') === 0) guide.issues.push({ level: 'warning', text: 'Nomor WA/telepon tidak terdeteksi.' });
    if (a.faqCount < 3) guide.issues.push({ level: 'warning', text: 'FAQ terdeteksi hanya ' + a.faqCount + ' (ideal ≥ 3).' });
    if (!a.hasTable && pageLevel.indexOf('money') === 0) guide.issues.push({ level: 'warning', text: 'Tidak ada tabel — idealnya ada tabel harga/spesifikasi.' });
    if (a.wordCount < 500) guide.issues.push({ level: 'warning', text: 'Konten tipis: ' + a.wordCount + ' kata (ideal ≥ 500).' });
    if (daysUntilReview < 0) guide.issues.push({ level: 'critical', text: '🚨 EXPIRED ' + Math.abs(daysUntilReview) + ' hari. Action required.' });

    if (pageLevel === 'pillar' || pageLevel === 'sub-pillar-tipe-1' || pageLevel === 'sub-pillar-tipe-2') { guide.priorityActions = ['✅ Verify topik masih relevan dengan trend ' + a.currentYear + '.', '✅ Cek standar/regulasi (SNI, PUPR) masih update.', '💡 Tambah 1 FAQ dari pertanyaan pembaca terbaru.', '💡 Update contoh kasus dengan data ' + a.currentYear + '.']; }
    else if (isMoney) { var levelLabel = { 'money-master': 'Range harga per mutu + wilayah', 'money-page': 'Harga fixed 1 produk', 'money-child': 'Harga fixed + wilayah (PALING KRITIS)', 'variant': 'Spesifikasi + harga varian', 'sub-variant': 'Spesifikasi + harga sub-varian' }; guide.priorityActions = ['🚨 Verify harga dengan supplier real-time.', '🚨 Cek stok/varian masih tersedia.', '🚨 Cek nomor WA/telepon masih aktif.', '✅ Cek syarat order (min order, ongkir, PPN) masih sama.', '📌 Level: ' + (levelLabel[pageLevel] || pageLevel)]; }
    else { guide.priorityActions = ['✅ Verify panduan masih akurat.', '💡 Tambah 1 FAQ baru.']; }

    guide.sectionGuide = [
      { section: 'H1', action: a.h1YearOutdated ? '🚨 UPDATE — tahun ' + a.h1Year + ' usang' : '✅ Cek masih relevan' },
      { section: 'Intro paragraf', action: '✅ Cek akurat, tambah 1 kalimat konteks ' + a.currentYear },
      { section: 'Harga', action: a.hasPrice ? '✅ ' + a.priceCount + ' harga terdeteksi — verify real-time' : '⚠️ Tidak ada harga — tambahkan' },
      { section: 'Spesifikasi', action: '✅ Cek standar (SNI) masih berlaku' },
      { section: 'FAQ', action: a.faqCount < 3 ? '💡 Tambah (' + a.faqCount + ' → 3+)' : '✅ Cukup (' + a.faqCount + ' item)' },
      { section: 'Tabel', action: a.hasTable ? '✅ ' + a.tableCount + ' tabel terdeteksi' : '💡 Tambahkan tabel harga/spesifikasi' },
      { section: 'Kontak WA', action: a.hasWA ? '✅ WA terdeteksi' : '⚠️ Tidak ada WA — tambahkan' },
      { section: 'Schema JSON-LD', action: '✅ Auto-handled by Blogger (AED Safe Mode)' },
      { section: 'Internal link', action: '✅ Cek tidak broken, tambah 1 link ke halaman baru' },
      { section: 'Konsistensi Lintas Halaman', action: '🔍 Cek NAP, Brand, Area, Spec, Harga di section bawah' }
    ];

    if (contentFocus === 'HARGA' || contentFocus === 'GABUNG') { guide.minimalChanges = ['1. Update "Berlaku per [bulan] ' + a.currentYear + '" di paragraf pembuka.', '2. Tambah 1 FAQ dari pertanyaan CS bulan ini.', '3. Update tanggal "Terakhir diperbarui: [bulan] ' + a.currentYear + '" di body (kalau ada).', '4. Tambah 1 testimoni pelanggan terbaru (nama + wilayah + proyek).', '5. Reorder FAQ: taruh yang paling sering ditanya di atas.']; }
    else if (pageLevel === 'pillar' || pageLevel.indexOf('sub-pillar') === 0) { guide.minimalChanges = ['1. Tambah 1 FAQ baru (paling ringan & aman).', '2. Update statistik/contoh kasus dengan data ' + a.currentYear + '.', '3. Update screenshot/gambar ke versi terbaru.', '4. Cek internal link — tambah 1 link ke halaman baru.']; }
    else { guide.minimalChanges = ['1. Tambah 1 FAQ baru.', '2. Update contoh/kasus dengan data ' + a.currentYear + '.']; }

    guide.checklist = ['□ Buka halaman di browser — verify tampilan normal', '□ Cek harga dengan supplier (WA/telp) — sama atau berubah?', '□ Cek nomor WA/telepon masih aktif', '□ Cek stok/varian masih tersedia', '□ Cek wilayah layanan masih sama', '□ Cek syarat order (min order, ongkir, PPN)', '□ Cek konsistensi NAP/Brand/Area di section Konsistensi Lintas Halaman', '□ Buka Blogger editor — edit minimal 1 elemen', '□ Save & Publish', '□ Reload halaman → banner hilang ✅'];
    return guide;
  }

  function showGuideModal(guide) {
    var existing = document.getElementById('aed-guide-modal'); if (existing) existing.remove();
    var statusClass = guide.meta.status === 'FRESH' ? 'status-fresh' : (guide.meta.status === 'WARNING' ? 'status-warning' : 'status-expired');
    var issuesHtml = guide.issues.length > 0 ? guide.issues.map(function(i) { return '<div class="aed-guide-issue-' + i.level + '">' + i.text + '</div>'; }).join('') : '<p style="color:#16a34a;font-weight:600;">✅ Tidak ada issue signifikan terdeteksi. Halaman dalam kondisi baik.</p>';
    var priorityHtml = '<ul class="aed-guide-list">' + guide.priorityActions.map(function(p) { return '<li>' + p + '</li>'; }).join('') + '</ul>';
    var patchHtml = '<table class="aed-guide-section-table"><thead><tr><th>Bagian</th><th>Terdeteksi</th><th>Action</th><th>Saran Revisi (Patch)</th></tr></thead><tbody>' + guide.patches.map(function(p) { return '<tr><td><strong>' + p.section + '</strong></td><td style="font-size:0.8rem">' + p.detected + '</td><td style="font-size:0.8rem">' + p.action + '</td><td><div class="aed-patch-box">' + p.patch + '</div></td></tr>'; }).join('') + '</tbody></table>';
    var sectionTableHtml = '<table class="aed-guide-section-table"><thead><tr><th>Section</th><th>Action</th></tr></thead><tbody>' + guide.sectionGuide.map(function(s) { return '<tr><td><strong>' + s.section + '</strong></td><td>' + s.action + '</td></tr>'; }).join('') + '</tbody></table>';
    var minimalHtml = '<ul class="aed-guide-list">' + guide.minimalChanges.map(function(c) { return '<li>' + c + '</li>'; }).join('') + '</ul>';
    var checklistHtml = '<div style="font-family:monospace;font-size:0.85rem;line-height:1.8;">' + guide.checklist.map(function(c) { return c.replace('□', '<span style="color:#9ca3af;">□</span>'); }).join('<br>') + '</div>';
    var modal = document.createElement('div');
    modal.id = 'aed-guide-modal'; modal.setAttribute('data-nosnippet', ''); modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
    modal.innerHTML =
      '<div class="aed-guide-backdrop" data-aed-close="1"></div>' +
      '<div class="aed-guide-content">' +
        '<div class="aed-guide-header"><h2>' + GUIDE_CONFIG.MODAL_TITLE + '</h2><button class="aed-guide-close" data-aed-close="1" aria-label="Close">✕</button></div>' +
        '<div class="aed-guide-body">' +
          '<div class="aed-guide-section"><h3>📊 Summary</h3><div class="aed-guide-meta"><div class="aed-guide-meta-item"><div class="aed-guide-meta-label">Page Level</div><div class="aed-guide-meta-value">' + guide.meta.pageLevel + '</div></div><div class="aed-guide-meta-item"><div class="aed-guide-meta-label">Content Focus</div><div class="aed-guide-meta-value">' + guide.meta.contentFocus + '</div></div><div class="aed-guide-meta-item"><div class="aed-guide-meta-label">Type</div><div class="aed-guide-meta-value">' + guide.meta.finalType + '</div></div><div class="aed-guide-meta-item"><div class="aed-guide-meta-label">Validity</div><div class="aed-guide-meta-value">' + guide.meta.validityDays + ' hari</div></div><div class="aed-guide-meta-item"><div class="aed-guide-meta-label">Status</div><div class="aed-guide-meta-value ' + statusClass + '">' + guide.meta.status + '</div></div><div class="aed-guide-meta-item"><div class="aed-guide-meta-label">Next Review</div><div class="aed-guide-meta-value">' + (guide.meta.daysUntilReview > 0 ? guide.meta.daysUntilReview + ' hari lagi' : 'Expired ' + Math.abs(guide.meta.daysUntilReview) + ' hari') + '</div></div></div></div>' +
          '<div class="aed-guide-section"><h3>🚨 Issues Terdeteksi</h3>' + issuesHtml + '</div>' +
          '<div class="aed-guide-section"><h3>📝 Saran Revisi (Content Patch)</h3>' + patchHtml + '</div>' +
          '<div class="aed-guide-section"><h3>🏷️ Revisi H1 (Judul)</h3><textarea class="aed-copy-box" style="border-left-color:#ef4444; min-height:80px;" readonly>' + guide.patchH1 + '</textarea></div>' +
          '<div class="aed-guide-section"><h3>🏷️ Revisi H2 (Sub-Judul)</h3><textarea class="aed-copy-box" style="border-left-color:#f59e0b; min-height:80px;" readonly>' + guide.patchH2 + '</textarea></div>' +
          '<div class="aed-guide-section"><h3>📋 Saran List (Poin-poin)</h3><textarea class="aed-copy-box" style="border-left-color:#14b8a6; min-height:80px;" readonly>' + guide.patchList + '</textarea></div>' +
          '<div class="aed-guide-section"><h3>✍️ Draf Paragraf Pembuka</h3><textarea class="aed-copy-box" style="border-left-color:#3b82f6;" readonly>' + guide.patchParagraph + '</textarea></div>' +
          '<div class="aed-guide-section"><h3>✍️ Saran Paragraf Isi (Tengah)</h3><textarea class="aed-copy-box" style="border-left-color:#10b981;" readonly>' + guide.patchBody + '</textarea></div>' +
          '<div class="aed-guide-section"><h3>✍️ Saran Paragraf Penutup (CTA)</h3><textarea class="aed-copy-box" style="border-left-color:#8b5cf6;" readonly>' + guide.patchOutro + '</textarea></div>' +
          '<div class="aed-guide-section"><h3>❓ Template FAQ Baru (Siap Copy-Paste)</h3><textarea class="aed-copy-box" style="border-left-color: #f59e0b;" readonly>' + guide.patchFaq + '</textarea></div>' +
          '<div class="aed-guide-section"><h3>📋 Panduan per Section</h3>' + sectionTableHtml + '</div>' +
          '<div class="aed-guide-section"><h3>🎯 Priority Actions</h3>' + priorityHtml + '</div>' +
          '<div class="aed-guide-section"><h3>💡 Minimal Changes (kalau fakta masih sama)</h3>' + minimalHtml + '</div>' +
          '<div class="aed-guide-section"><h3>✅ Checklist Eksekusi</h3>' + checklistHtml + '</div>' +
          '<div class="aed-guide-section"><h3>🔍 Konsistensi Lintas Halaman</h3><div id="aed-consistency-section">' +
            (guide.consistency ? buildConsistencySection(guide.consistency) : '<p style="color:#9ca3af;">⏳ Memuat index konten dari Blogger Feed...</p>') +
          '</div></div>' +
          '<div class="aed-guide-section">' +
            '<h3>🚨 Emergency Option (Tombol Darurat)</h3>' +
            '<div class="aed-guide-issue-critical" style="font-size:0.85rem; margin-bottom:12px;">' +
              '<strong>🩹 SAFE-MODE ACTIVE:</strong> Emergency verify HANYA mengubah tanggal di browser Anda (localStorage). <strong>TIDAK</strong> mengubah Blogger raw HTML, <strong>TIDAK</strong> mempengaruhi Googlebot, <strong>TIDAK</strong> menyelesaikan masalah SEO.<br><br>' +
              '<strong>Fungsi:</strong> Menyembunyikan banner di layar Anda untuk demo internal.<br>' +
              '<strong>Batas:</strong> Tidak persist antar browser/device.<br><br>' +
              '<strong>Cara Pakai (tidak direkomendasikan untuk production):</strong><br>' +
              'Buka Console (F12) &rarr; Ketik:<br>' +
              '<div style="display:flex; align-items:center; gap:8px; margin-top:6px;">' +
                '<input type="text" id="aed-emergency-cmd" value="aedEmergencyVerify(null, { confirm: true })" readonly onclick="this.select();" style="flex:1; padding:8px; font-family:monospace; font-size:0.85rem; background:#000; color:#0f0; border:1px solid #333; border-radius:4px; outline:none; width:100%;">' +
                '<button id="aed-copy-cmd-btn" style="padding:8px 12px; background:#3b82f6; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.8rem; white-space:nowrap;">📋 Copy</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
     '</div>' +
        '<div class="aed-guide-footer"><span>Dibuat: ' + new Date().toLocaleString('id-ID') + '</span><button class="aed-guide-footer-btn" data-aed-close="1">Tutup</button></div>' +
      '</div>';
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    modal.querySelectorAll('[data-aed-close]').forEach(function(el) { el.addEventListener('click', closeGuideModal); });
    var copyBtn = document.getElementById('aed-copy-cmd-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function() {
        var input = document.getElementById('aed-emergency-cmd'); input.select(); input.setSelectionRange(0, 99999);
        try { document.execCommand('copy'); if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(input.value); } var btn = this; var originalText = btn.innerHTML; btn.innerHTML = '✅ Copied!'; btn.style.background = '#16a34a'; setTimeout(function() { btn.innerHTML = originalText; btn.style.background = '#3b82f6'; }, 2000); } catch (err) { console.error('Failed to copy', err); }
      });
    }
    if (!window._aedGuideEscHandler) { window._aedGuideEscHandler = function(e) { if (e.key === 'Escape') closeGuideModal(); }; document.addEventListener('keydown', window._aedGuideEscHandler); }
  }

  function closeGuideModal() { var m = document.getElementById('aed-guide-modal'); if (m) m.remove(); document.body.style.overflow = ''; if (window._aedGuideEscHandler) { document.removeEventListener('keydown', window._aedGuideEscHandler); window._aedGuideEscHandler = null; } }
  var _guideClickCount = 0; var _guideClickTimer = null;
  function handleGuideButtonClick() { _guideClickCount++; var hint = document.getElementById('aed-guide-hint'); if (_guideClickTimer) clearTimeout(_guideClickTimer); if (_guideClickCount === 1) { if (hint) hint.textContent = GUIDE_CONFIG.BUTTON_HINT_1; _guideClickTimer = setTimeout(function() { _guideClickCount = 0; if (hint) hint.textContent = ''; }, GUIDE_CONFIG.CLICK_RESET_MS); } else if (_guideClickCount === 2) { if (hint) hint.textContent = GUIDE_CONFIG.BUTTON_HINT_2; _guideClickTimer = setTimeout(function() { _guideClickCount = 0; if (hint) hint.textContent = ''; }, GUIDE_CONFIG.CLICK_RESET_MS); } else if (_guideClickCount >= GUIDE_CONFIG.CLICKS_TO_OPEN) { _guideClickCount = 0; if (hint) hint.textContent = ''; openGuideFromCurrentPage(); } }

  async function openGuideFromCurrentPage() {
    var pl = document.body.getAttribute('data-page-level') || 'pillar';
    var cf = document.body.getAttribute('data-content-focus') || 'INFORMASI';
    var ft = (document.body.getAttribute('data-content-type') || (EVERGREEN_LEVELS.indexOf(pl) !== -1 ? 'evergreen' : 'non-evergreen'));
    var vd = getValidityByContext(pl, cf);
    var mn = document.querySelector('meta[name="nextUpdate"]');
    var dur = mn ? Math.ceil((new Date(mn.content) - new Date()) / 86400000) : 0;

    var guide = generatePageGuide(pl, cf, ft, vd, dur);
    guide.consistency = null;
    showGuideModal(guide);

    try {
      var consistency = await checkConsistency();
      var sec = document.getElementById('aed-consistency-section');
      if (sec) sec.innerHTML = buildConsistencySection(consistency);
    } catch(e) {
      var sec2 = document.getElementById('aed-consistency-section');
      if (sec2) sec2.innerHTML = '<p style="color:#dc2626;">⚠️ Gagal memuat index: ' + escapeHtml(e.message || 'unknown') + '</p>';
    }
  }

  function injectGuideButton() { if (!GUIDE_CONFIG.ENABLED) return; if (GUIDE_CONFIG.ADMIN_ONLY && !isAdmin()) return; if (document.getElementById('aed-guide-btn')) return; var h1 = document.querySelector('h1'); if (!h1) return; var wrap = document.createElement('div'); wrap.id = 'aed-guide-btn-wrap'; wrap.setAttribute('data-nosnippet', ''); var btn = document.createElement('button'); btn.id = 'aed-guide-btn'; btn.type = 'button'; btn.setAttribute('data-nosnippet', ''); btn.setAttribute('aria-label', 'Buka panduan update halaman'); btn.textContent = GUIDE_CONFIG.BUTTON_TEXT; btn.addEventListener('click', handleGuideButtonClick); var hint = document.createElement('span'); hint.id = 'aed-guide-hint'; hint.setAttribute('data-nosnippet', ''); wrap.appendChild(btn); wrap.appendChild(hint); h1.parentNode.insertBefore(wrap, h1.nextSibling); }

  function initAdminKeyboardShortcut() { var count = 0; var timer = null; document.addEventListener('keydown', function(e) { if (!document.hasFocus()) return; var activeEl = document.activeElement; if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) return; if (e.key === 'Enter') { count++; if (timer) clearTimeout(timer); showToast('Tekan ENTER ' + (3 - count) + 'x lagi untuk Admin Mode...'); if (count >= 3) { count = 0; localStorage.setItem('aed-is-admin', 'true'); showToast('✅ Admin Mode Aktif! Reloading...'); setTimeout(function() { location.reload(); }, 1000); } else { timer = setTimeout(function() { count = 0; hideToast(); }, 3000); } } }); }
  function showToast(msg) { var t = document.getElementById('aed-admin-toast'); if (!t) { t = document.createElement('div'); t.id = 'aed-admin-toast'; t.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#1e293b; color:#fff; padding:10px 20px; border-radius:8px; font-family:sans-serif; font-size:14px; z-index:999999; transition:opacity 0.3s; box-shadow:0 4px 12px rgba(0,0,0,0.15); pointer-events:none;'; document.body.appendChild(t); } t.textContent = msg; t.style.opacity = '1'; }
  function hideToast() { var t = document.getElementById('aed-admin-toast'); if (t) t.style.opacity = '0'; }

  async function detectEvergreen(opts) {
    opts = opts || {};
    var cdm = opts.customDateModified || null;
    if (_AED_INITIALIZED) return;
    _AED_INITIALIZED = true;
    injectWarningStyles();
    await waitForPageLevelDetector();
    var r = getPageLevelAndEntityType();
    var hd = detectContentTypeByH1();
    var cf = getContentFocus(hd, r.pageLevel, r.entityType);
    var rule = getRulesByEntityType(r.entityType, r.pageLevel, hd, cf);
    var ft = rule.type;
    var vd = rule.validityDays;
    var vm = vd * 86400000;
    var cc = detectContentChangeSinceLastVisit();
    var au = false;

    await processMetaDates(cdm, ft, vm, rule.usePriceValidUntil, r.pageLevel, r.entityType, rule.ctaIntensity, rule.allowPriceRange, r.detectorVersion, null, null, null, rule.overridden || false, rule.overrideReason || null, hd, cf, au);
    checkAndShowInlineWarning(r.pageLevel, cf);
    injectAuthorByline();
    injectGuideButton();
    window.dispatchEvent(new Event("detectEvergreenReady"));
  }

  window.aedEmergencyVerify = function(customDate, opts) {
    opts = opts || {};
    if (!opts.confirm) return null;
    console.warn('🩹 [AED SAFE-MODE] aedEmergencyVerify() called.');
    console.warn('   ⚠️ This ONLY affects your browser localStorage.');
    console.warn('   ⚠️ Blogger raw HTML unchanged → Googlebot sees original date.');
    console.warn('   ⚠️ Does NOT solve SEO. Use for demo/testing only.');
    customDate = customDate || toISOWithTimezoneLocal(new Date());
    var pl = document.body.getAttribute('data-page-level') || 'money-page';
    var cf = document.body.getAttribute('data-content-focus') || 'HARGA';
    var vd = getValidityByContext(pl, cf);
    var nu = toISOWithTimezoneLocal(new Date(new Date(customDate).getTime() + vd * 86400000));
    document.body.removeAttribute('data-aed-warning-severity');
    document.body.removeAttribute('data-aed-warning-days');
    document.body.removeAttribute('data-aed-warning-stuck');
    document.body.removeAttribute('data-aed-warning-stuck-days');
    var b = document.getElementById('aed-update-warning');
    if (b) b.remove();
    if (window.AEDMetaDates) {
      window.AEDMetaDates.lastEmergencyVerify = customDate;
      window.AEDMetaDates.updateCount = (window.AEDMetaDates.updateCount || 0) + 1;
      window.AEDMetaDates.safeMode = true;
    }
    try {
      var ad = { date: customDate, nextUpdate: nu, validityDays: vd, pageLevel: pl, contentFocus: cf, verifiedAt: new Date().toISOString(), method: 'emergency-safe-mode', note: 'BROWSER ONLY - does not affect Blogger/Googlebot' };
      localStorage.setItem('aed-emergency-verified-' + location.pathname, JSON.stringify(ad));
      localStorage.setItem('aed-verified-' + location.pathname, JSON.stringify(ad));
    } catch(e) {}
    try { window.dispatchEvent(new CustomEvent('aedVerified', { detail: { dateModified: customDate, nextUpdate: nu, validityDays: vd, pageLevel: pl, contentFocus: cf, method: 'emergency-safe-mode' } })); } catch(e) {}
    return { dateModified: customDate, nextUpdate: nu, validityDays: vd, pageLevel: pl, contentFocus: cf, safeMode: true, note: 'Browser only - no SEO effect' };
  };
  window.aedVerifyNow = function(customDate) { return window.aedEmergencyVerify(customDate, { confirm: true }); };

  window.aedShowEditGuide = async function() {
    var pl = document.body.getAttribute('data-page-level') || 'pillar';
    var cf = document.body.getAttribute('data-content-focus') || 'INFORMASI';
    var ft = (EVERGREEN_LEVELS.indexOf(pl) !== -1) ? 'evergreen' : 'non-evergreen';
    var vd = getValidityByContext(pl, cf);
    var mn = document.querySelector('meta[name="nextUpdate"]');
    var dur = mn ? Math.ceil((new Date(mn.content) - new Date()) / 86400000) : 0;
    var g = generatePageGuide(pl, cf, ft, vd, dur);
    g.consistency = await checkConsistency();
    console.log('📖 PAGE GUIDE (SAFE MODE):', g.meta);
    if (g.issues.length > 0) console.log('Issues:', g.issues);
    if (g.consistency.issues && g.consistency.issues.length > 0) console.log('Consistency issues:', g.consistency.issues);
    if (g.consistency.productOverlap && g.consistency.productOverlap.length > 0) {
      console.table(g.consistency.productOverlap.map(function(x){ return { page: x.page.title, products: x.sharedProducts.join(','), status: x.status, deltaPct: x.deltaPct }; }));
    }
    console.log('Priority:', g.priorityActions);
    console.log('Minimal Changes:', g.minimalChanges);
  };

  window.aedCheckStatus = function() { if (!window.AEDMetaDates) return null; var mm = document.querySelector('meta[itemprop="dateModified"]'); var mn = document.querySelector('meta[name="nextUpdate"]'); var mp = document.querySelector('meta[itemprop="datePublished"]'); var ad = null; try { var rn = localStorage.getItem('aed-emergency-verified-' + location.pathname); if (rn) ad = JSON.parse(rn); else { var rl = localStorage.getItem('aed-verified-' + location.pathname); if (rl) { ad = JSON.parse(rl); ad._source = 'legacy-key'; } } } catch (e) {} var dur = mn ? Math.ceil((new Date(mn.content) - new Date()) / 86400000) : null; var s = { datePublished: mp ? mp.content : null, dateModified: mm ? mm.content : null, nextUpdate: mn ? mn.content : null, daysUntilReview: dur, needsManualVerify: document.body.getAttribute('data-aed-needs-review') === 'true', warningSeverity: document.body.getAttribute('data-aed-warning-severity'), lastEmergencyVerify: ad, safeMode: true, consistencyEnabled: CONSISTENCY_CONFIG.ENABLED, aedData: window.AEDMetaDates }; console.table(s); return s; };

  /* ============================================================
   🔍 Consistency — Public API
  ============================================================ */

  window.aedWarmContentIndex = async function() {
    console.log('[AED] Fetching content index...');
    var idx = await fetchContentIndex(true);
    console.log('[AED] ✅ Indexed ' + idx.length + ' posts');
    return idx;
  };
  window.aedClearContentIndex = function() {
    try { localStorage.removeItem(CONSISTENCY_CONFIG.CACHE_KEY); console.log('[AED] ✅ Index cache cleared'); } catch(e) {}
  };
  window.aedCheckConsistency = async function() {
    var c = await checkConsistency();
    console.log('[AED] Consistency report:', c);
    if (c.productOverlap && c.productOverlap.length > 0) {
      console.table(c.productOverlap.map(function(x){ return { page: x.page.title, products: x.sharedProducts.join(','), status: x.status, deltaPct: x.deltaPct }; }));
    }
    if (c.nap && c.nap.phoneGroups && c.nap.phoneGroups.length > 0) {
      console.log('[AED] NAP — nomor paling sering:', c.nap.phoneGroups);
    }
    if (c.brand && c.brand.brandDistribution) {
      console.log('[AED] Brand distribution:', c.brand.brandDistribution);
    }
    if (c.area && c.area.areaDistribution) {
      console.log('[AED] Area distribution:', c.area.areaDistribution);
    }
    return c;
  };

  window.detectEvergreen = detectEvergreen;
  window.__detectEvergreenReady = true;
  initAdminKeyboardShortcut();

  console.log('═══════════════════════════════════════════════════════════');
  console.log('🩹 AED v18.0.0-SAFE+CONSISTENCY — Admin Reminder + Cross-Page Checker');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ PRESERVED: Banner warning, guide modal, nextUpdate, content hash');
  console.log('✅ PRESERVED: Author byline, admin shortcut, aedCheckStatus()');
  console.log('✅ ADDED: Blogger Feed API consistency checker');
  console.log('   • Harga lintas halaman (product-overlap)');
  console.log('   • NAP (telepon/email) konsistensi');
  console.log('   • Brand name konsistensi (canonical vs alias)');
  console.log('   • Wilayah layanan (judul vs body)');
  console.log('   • Spesifikasi produk (mutu K-xxx, slump)');
  console.log('   • Keyword cannibalization detection');
  console.log('   • Cache 6 jam + pagination (up to 750 post)');
  console.log('❌ DISABLED:  autoUpdateDates (dateModified bump)');
  console.log('❌ DISABLED:  updateJsonLdDates (JSON-LD mutation)');
  console.log('❌ DISABLED:  cleanupFaqSchema (FAQ schema mutation)');
  console.log('❌ DISABLED:  updateJsonLdFaqYears (FAQ text mutation)');
  console.log('❌ DISABLED:  updateContentByLevelAndFocus (visible text mutation)');
  console.log('❌ DISABLED:  updateH1WithRules (H1 mutation)');
  console.log('❌ DISABLED:  priceValidUntil write to Offer schema');
  console.log('📌 Blogger raw HTML = SOURCE OF TRUTH');
  console.log('📌 Googlebot sees ORIGINAL dateModified. Zero risk.');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔍 Consistency Console Commands:');
  console.log('   await aedWarmContentIndex()   — fetch & cache index');
  console.log('   await aedCheckConsistency()   — run full check');
  console.log('   aedClearContentIndex()        — clear cache (force refetch)');
  console.log('   await aedShowEditGuide()      — log guide + consistency');
  console.log('═══════════════════════════════════════════════════════════');

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", function () { setTimeout(function () { detectEvergreen(); }, 100); }, { once: true }); } else { setTimeout(function () { detectEvergreen(); }, 100); }
})();
