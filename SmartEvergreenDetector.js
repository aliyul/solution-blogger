/* ============================================================
 🧠 Smart Evergreen Detector v17.4.8 — COMPLETE FIX
    ✅ SINKRON dengan PLD v23.9.9 (entity-aware detectCtaType)
    ✅ PATOKAN UTAMA: PLD = SOURCE OF TRUTH
    ✅ CONTENT-AWARE VALIDITY
    ✅ TIERED WARNING
    ✅ INLINE WARNING TEXT MERAH
    ✅ FULL PATTERN SUPPORT (ISO + DD/MM/YYYY)

    🔥🔥🔥 v17.4.8 CHANGELOG 🔥🔥🔥
    ✅ FIX-MINOR-2: getPLDCtaType() — tambah entityType
              - Sebelumnya: detectCtaType(level, focus) — 2 arg
              - Sesudah: detectCtaType(level, focus, entityType) — 3 arg
              - Efek: CTA type akurat untuk jasa (Konsultasi)
              - Dampak: window.AEDMetaDates.pldCtaType lebih akurat
    ✅ FIX-MINOR-1: Komentar header v23.9.8 → v23.9.9 (dokumentasi)

    ✅ PRESERVED dari v17.4.7:
    ✅ FIX-KRITIS: ISO + DD/MM/YYYY pattern
    ✅ FIX-MINOR: Guard updateJsonLdFaqYears
    ✅ Content-aware validity (HARGA=90, COM=180, INFO=365)
    ✅ Tiered warning (14/21/30 hari)
    ✅ Inline warning TEXT MERAH + data-nosnippet

    ✅ PRESERVED dari v17.4.3-LITE:
    ✅ FIX-SYNC-v4: hasPriceTable() DIHAPUS
    ✅ FIX-EE-6: Money + INFORMASI = EVERGREEN
    ✅ FIX-EE-2 s/d EE-5
    ✅ FIX-SYNC-v3: getKategori dari finalType
    ✅ FIX-B1 s/d B10: AKTIF
    ✅ FIX-A1 s/d A21: AKTIF

    📌 BRAND DEFAULT: "Beton Jaya Readymix"
============================================================ */

(function () {
  if (window.detectEvergreen && window.__AED_VERSION === "17.4.8") return;

  var _AED_INITIALIZED = false;
  var _AED_PLD_CACHE = {};

  window.__AED_VERSION = "17.4.8";

  // ============================================================
  // 📌 BRAND CONFIG
  // ============================================================
  var DEFAULT_BRAND_NAME = "Beton Jaya Readymix";

  // ============================================================
  // 🔔 INLINE WARNING CONFIG — TIERED
  // ============================================================
  const WARNING_CONFIG = {
    ENABLED: true,
    SHOW_AFTER_EXPIRED: true,
    USE_TIERED: true,
    TIERED_RULES: [
      { maxValidity: 90,  showDays: 14, label: 'HARGA (90 hari) → warning 14 hari' },
      { maxValidity: 180, showDays: 21, label: 'COMMERCIAL (180 hari) → warning 21 hari' },
      { maxValidity: 999, showDays: 30, label: 'INFORMASI (365 hari) → warning 30 hari' }
    ],
    SHOW_DAYS_BEFORE: 30,
    INSERT_AFTER_SELECTOR: '.last-updated, .updated-date, .date-modified, [class*="last-updated"]',
    USE_NOSNIPPET: true,
    STYLE: {
      display: 'block',
      color: '#dc2626',
      fontWeight: 'bold',
      fontSize: '0.9rem',
      marginTop: '8px',
      marginBottom: '12px',
      padding: '8px 12px',
      background: '#fef2f2',
      borderLeft: '4px solid #dc2626',
      borderRadius: '4px'
    }
  };

  // ============================================================
  // 📌 ATURAN V37 — BASE RULES
  // ============================================================
  const BASE_PAGE_LEVEL_RULES = {
    'pillar':            { type: 'evergreen',     validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft' },
    'sub-pillar-tipe-2': { type: 'evergreen',     validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft-medium' },
    'sub-pillar-tipe-1': { type: 'evergreen',     validityDays: 730,  usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'variant':           { type: 'non-evergreen', validityDays: 365,  usePriceValidUntil: true,  allowPriceRange: false, ctaIntensity: 'hard' },
    'sub-variant':       { type: 'non-evergreen', validityDays: 365,  usePriceValidUntil: true,  allowPriceRange: false, ctaIntensity: 'hard' },
    'money-master':      { type: 'non-evergreen', validityDays: 365,  usePriceValidUntil: false, allowPriceRange: true,  ctaIntensity: 'hard' },
    'money-page':        { type: 'non-evergreen', validityDays: 365,  usePriceValidUntil: true,  allowPriceRange: false, ctaIntensity: 'hard' },
    'money-child':       { type: 'non-evergreen', validityDays: 365,  usePriceValidUntil: true,  allowPriceRange: false, ctaIntensity: 'very-hard' }
  };

  const PRODUK_MATERIAL_RULES = Object.assign({}, BASE_PAGE_LEVEL_RULES);
  const SEWA_RULES            = Object.assign({}, BASE_PAGE_LEVEL_RULES);
  const JASA_RULES            = Object.assign({}, BASE_PAGE_LEVEL_RULES);

  const DEFAULT_RULE = { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft' };

  const MONEY_LEVELS = ['money-master', 'money-page', 'money-child', 'variant', 'sub-variant'];
  const EVERGREEN_LEVELS = ['pillar', 'sub-pillar-tipe-1', 'sub-pillar-tipe-2'];

  // ============================================================
  // 🎯 CONTENT-AWARE VALIDITY
  // ============================================================
  function getValidityByContext(pageLevel, contentFocus) {
    var focus = String(contentFocus || '').toUpperCase();
    var isMoney = MONEY_LEVELS.indexOf(pageLevel) !== -1;
    
    if (isMoney) {
      if (focus === 'HARGA' || focus === 'GABUNG') {
        console.log(`📅 [Validity] ${pageLevel} + ${focus} → 90 hari`);
        return 90;
      }
      if (focus === 'COMMERCIAL') {
        console.log(`📅 [Validity] ${pageLevel} + ${focus} → 180 hari`);
        return 180;
      }
      if (focus === 'INFORMASI') {
        console.log(`📅 [Validity] ${pageLevel} + ${focus} → 365 hari`);
        return 365;
      }
      if (pageLevel === 'variant' || pageLevel === 'sub-variant') {
        console.log(`📅 [Validity] ${pageLevel} → 365 hari`);
        return 365;
      }
      console.log(`📅 [Validity] ${pageLevel} → 365 hari (default)`);
      return 365;
    }
    
    var rule = BASE_PAGE_LEVEL_RULES[pageLevel];
    return rule ? rule.validityDays : 365;
  }

  // ============================================================
  // 🔔 TIERED WARNING
  // ============================================================
  function getWarningDays(validityDays) {
    if (!WARNING_CONFIG.USE_TIERED) return WARNING_CONFIG.SHOW_DAYS_BEFORE;
    
    var rules = WARNING_CONFIG.TIERED_RULES || [];
    for (var i = 0; i < rules.length; i++) {
      if (validityDays <= rules[i].maxValidity) {
        console.log(`📅 [Warning Tier] validity ${validityDays} hari → warning ${rules[i].showDays} hari (${rules[i].label})`);
        return rules[i].showDays;
      }
    }
    return WARNING_CONFIG.SHOW_DAYS_BEFORE;
  }

  // ============================================================
  // 📌 TO ISO
  // ============================================================
  function toISOWithTimezoneLocal(date, offset = "+07:00") {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const pad = (n) => n.toString().padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}${offset}`;
  }

  // ============================================================
  // 🔔 INLINE WARNING
  // ============================================================
  function formatTanggalIndo(dateStr) {
    if (!dateStr) return '';
    var bulan = ['Januari','Februari','Maret','April','Mei','Juni',
                 'Juli','Agustus','September','Oktober','November','Desember'];
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.getDate() + ' ' + bulan[d.getMonth()] + ' ' + d.getFullYear();
  }

  function checkAndShowInlineWarning() {
    if (!WARNING_CONFIG.ENABLED) return;

    const metaNext = document.querySelector('meta[name="nextUpdate"]');
    const metaModified = document.querySelector('meta[itemprop="dateModified"]');

    if (!metaNext || !metaNext.getAttribute('content')) {
      console.log('ℹ️ [AED Warning] Belum ada nextUpdate — skip');
      return;
    }

    const nextUpdateStr = metaNext.getAttribute('content');
    const modifiedStr = metaModified ? metaModified.getAttribute('content') : 'unknown';

    let validityDays = 365;
    if (modifiedStr && modifiedStr !== 'unknown') {
      const modDate = new Date(modifiedStr);
      const nextDate = new Date(nextUpdateStr);
      if (!isNaN(modDate.getTime()) && !isNaN(nextDate.getTime())) {
        validityDays = Math.round((nextDate - modDate) / 86400000);
      }
    }

    const warningThreshold = getWarningDays(validityDays);
    const nextDate = new Date(nextUpdateStr);
    const now = new Date();
    const daysDiff = Math.ceil((nextDate - now) / 86400000);

    let severity = null;
    let message = '';

    if (daysDiff < 0) {
      if (!WARNING_CONFIG.SHOW_AFTER_EXPIRED) return;
      severity = 'expired';
      message = `🔴 KEDALUWARSA: Halaman ini sudah melewati batas update ${Math.abs(daysDiff)} hari (batas: ${formatTanggalIndo(nextUpdateStr)})`;
    } else if (daysDiff === 0) {
      severity = 'critical';
      message = `🔴 HARI INI: Batas update halaman ini adalah hari ini (${formatTanggalIndo(nextUpdateStr)})`;
    } else if (daysDiff <= warningThreshold) {
      severity = 'warning';
      message = `⚠️ PERLU UPDATE: Halaman ini akan kedaluwarsa dalam ${daysDiff} hari (batas: ${formatTanggalIndo(nextUpdateStr)})`;
    } else {
      console.log(`✅ [AED Warning] Halaman fresh — ${daysDiff} hari lagi (threshold: ${warningThreshold} hari)`);
      return;
    }

    console.warn('═══════════════════════════════════════════');
    console.warn('[AED Warning]', message);
    console.warn('  Validity   :', validityDays, 'hari');
    console.warn('  Threshold  :', warningThreshold, 'hari');
    console.warn('  Days diff  :', daysDiff);
    console.warn('  dateModified:', modifiedStr);
    console.warn('  nextUpdate :', nextUpdateStr);
    console.warn('═══════════════════════════════════════════');

    createWarningElement(message, severity);
  }

  function createWarningElement(message, severity) {
    if (document.getElementById('aed-update-warning')) {
      console.log('⏭️ [AED Warning] Warning sudah ada — skip');
      return;
    }

    var warning = document.createElement('div');
    warning.id = 'aed-update-warning';
    warning.setAttribute('data-nosnippet', '');
    warning.setAttribute('data-severity', severity);
    warning.textContent = message;

    var style = WARNING_CONFIG.STYLE;
    for (var key in style) {
      if (style.hasOwnProperty(key)) {
        warning.style[key] = style[key];
      }
    }

    var anchor = null;
    var selectors = WARNING_CONFIG.INSERT_AFTER_SELECTOR.split(',').map(s => s.trim());
    
    for (var i = 0; i < selectors.length; i++) {
      try {
        var el = document.querySelector(selectors[i]);
        if (el) { anchor = el; break; }
      } catch(e) {}
    }

    if (anchor) {
      anchor.parentNode.insertBefore(warning, anchor.nextSibling);
      console.log('✅ [AED Warning] Ditambahkan setelah:', anchor.className || anchor.tagName);
    } else {
      var h1 = document.querySelector('h1');
      if (h1) {
        h1.parentNode.insertBefore(warning, h1.nextSibling);
        console.log('✅ [AED Warning] Ditambahkan setelah H1');
      } else {
        document.body.insertBefore(warning, document.body.firstChild);
        console.log('⚠️ [AED Warning] Di awal body (fallback)');
      }
    }
  }

  // ============================================================
  // FIX-B10: Decode HTML Entities
  // ============================================================
  function decodeHtmlEntities(str) {
    if (typeof str !== 'string') return str;
    if (str.indexOf('&') === -1) return str;
    var textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    var decoded = textarea.value;
    if (decoded !== str) {
      var preview = str.substring(0, 60).replace(/\n/g, ' ');
      console.log('🔧 [FIX-B10] Decode: "' + preview + '..."');
    }
    return decoded;
  }

  function deepDecodeHtmlEntities(obj) {
    if (typeof obj === 'string') return decodeHtmlEntities(obj);
    if (Array.isArray(obj)) {
      for (var i = 0; i < obj.length; i++) obj[i] = deepDecodeHtmlEntities(obj[i]);
      return obj;
    }
    if (obj && typeof obj === 'object') {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          obj[key] = deepDecodeHtmlEntities(obj[key]);
        }
      }
      return obj;
    }
    return obj;
  }

  function hasHtmlEntities(obj) {
    var found = [];
    function scan(node) {
      if (typeof node === 'string') {
        var matches = node.match(/&#\d+;|&[a-zA-Z]+;/g);
        if (matches) found = found.concat(matches);
      } else if (Array.isArray(node)) {
        node.forEach(scan);
      } else if (node && typeof node === 'object') {
        for (var k in node) {
          if (Object.prototype.hasOwnProperty.call(node, k)) scan(node[k]);
        }
      }
    }
    scan(obj);
    return found;
  }

  // ============================================================
  // FIX-B9 + B10: Deteksi properti ilegal
  // ============================================================
  function detectIllegalFaqProps() {
    var hasIllegal = false;
    var details = [];
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');

    scripts.forEach(function (script) {
      var raw = script.textContent;
      if (!raw) return;
      if (raw.indexOf('"FAQPage"') === -1 && raw.indexOf('"QAPage"') === -1) return;

      var json;
      try { json = JSON.parse(raw); } catch (e) { return; }

      var nodes = [];
      if (Array.isArray(json)) nodes = json;
      else if (json['@graph'] && Array.isArray(json['@graph'])) nodes = json['@graph'];
      else nodes = [json];

      nodes.forEach(function (node) {
        if (!node || typeof node !== 'object') return;
        var typeStr = (node['@type'] || '').toString();
        var isFaqPage = (typeStr.indexOf('FAQPage') !== -1);
        var isQaPage = (typeStr.indexOf('QAPage') !== -1);
        if (!isFaqPage && !isQaPage) return;

        if (isFaqPage) {
          if (node.datePublished !== undefined) { hasIllegal = true; details.push('datePublished di FAQPage'); }
          if (node.dateModified !== undefined) { hasIllegal = true; details.push('dateModified di FAQPage'); }
        }

        if (Array.isArray(node.mainEntity)) {
          node.mainEntity.forEach(function (q, idx) {
            if (!q || typeof q !== 'object') return;
            if (q.author !== undefined)       { hasIllegal = true; details.push('author di Q' + (idx+1)); }
            if (q.datePublished !== undefined){ hasIllegal = true; details.push('datePublished di Q' + (idx+1)); }
            if (q.dateModified !== undefined) { hasIllegal = true; details.push('dateModified di Q' + (idx+1)); }
            if (q.upvoteCount !== undefined)  { hasIllegal = true; details.push('upvoteCount di Q' + (idx+1)); }

            if (q.acceptedAnswer && typeof q.acceptedAnswer === 'object') {
              var a = q.acceptedAnswer;
              if (a.author !== undefined)       { hasIllegal = true; details.push('author di A' + (idx+1)); }
              if (a.datePublished !== undefined){ hasIllegal = true; details.push('datePublished di A' + (idx+1)); }
              if (a.dateModified !== undefined) { hasIllegal = true; details.push('dateModified di A' + (idx+1)); }
              if (a.upvoteCount !== undefined)  { hasIllegal = true; details.push('upvoteCount di A' + (idx+1)); }
            }

            if (Array.isArray(q.suggestedAnswer)) {
              q.suggestedAnswer.forEach(function (s, sIdx) {
                if (!s || typeof s !== 'object') return;
                if (s.author !== undefined || s.datePublished !== undefined ||
                    s.dateModified !== undefined || s.upvoteCount !== undefined) {
                  hasIllegal = true;
                  details.push('properti ilegal di suggestedAnswer Q' + (idx+1) + '[' + sIdx + ']');
                }
              });
            }
          });
        }

        var entitiesFound = hasHtmlEntities(node);
        if (entitiesFound.length > 0) {
          hasIllegal = true;
          var uniqueEntities = entitiesFound.filter(function (v, i, arr) { return arr.indexOf(v) === i; }).slice(0, 5);
          details.push('entities: ' + uniqueEntities.join(', '));
        }
      });
    });

    if (hasIllegal) console.log('🔍 [FIX-B9+B10] Properti ilegal / entities terdeteksi:', details.join(', '));
    else console.log('✅ [FIX-B9+B10] FAQ schema bersih');
    return hasIllegal;
  }

  // ============================================================
  // FIX-B8: Normalize Brand Case
  // ============================================================
  function normalizeBrandCase(str) {
    if (!str || typeof str !== 'string') return str;
    var trimmed = str.trim();
    if (trimmed.length < 3) return str;
    if (trimmed !== trimmed.toUpperCase()) return str;
    if (/[\d]/.test(trimmed)) return str;

    var words = trimmed.split(/\s+/);
    var validAcronyms = ['PT','CV','UD','TBK','LTD','INC','LLC','CORP','GMBH','NASA','BMW','IBM','AMD','HP','LG','3M','KFC','BBC','SNI','ASTM','JIS','DIN','ISO','PUPR','K3','SMK3','MEP','AC','WC','TV','IT','HR','GA','QC','QA'];

    var allAcronyms = words.every(function (w) { return validAcronyms.indexOf(w) !== -1; });
    if (allAcronyms) return str;

    var normalized = words.map(function (w) {
      if (validAcronyms.indexOf(w) !== -1) return w;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    }).join(' ');

    if (normalized !== trimmed) console.log('🔧 [Normalize] "' + trimmed + '" → "' + normalized + '"');
    return normalized;
  }

  // ============================================================
  // FIX-B2: Resolve brand name
  // ============================================================
  function resolveBrandName() {
    if (window.AEDMetaDates && window.AEDMetaDates.brandName) return window.AEDMetaDates.brandName;

    var metaBrand = document.querySelector('meta[name="brand"]');
    if (metaBrand && metaBrand.getAttribute('content')) {
      var b2 = metaBrand.getAttribute('content').trim();
      if (b2) { console.log('🏢 [Brand] meta[name="brand"]: ' + b2); return b2; }
    }

    var ogSite = document.querySelector('meta[property="og:site_name"]');
    if (ogSite && ogSite.getAttribute('content')) {
      var b3 = ogSite.getAttribute('content').trim();
      if (b3) { console.log('🏢 [Brand] og:site_name: ' + b3); return b3; }
    }

    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      try {
        var json = JSON.parse(scripts[i].textContent || '{}');
        var nodes = Array.isArray(json) ? json : (json['@graph'] && Array.isArray(json['@graph']) ? json['@graph'] : [json]);
        for (var j = 0; j < nodes.length; j++) {
          var n = nodes[j];
          if (n && n.publisher && n.publisher.name) return n.publisher.name;
          if (n && n['@type'] === 'Organization' && n.name) return n.name;
        }
      } catch (e) {}
    }

    var title = document.title || '';
    if (title.indexOf(' - ') !== -1) {
      var parts = title.split(' - ');
      var last = parts[parts.length - 1].trim();
      if (last && last.length < 60) { console.log('🏢 [Brand] title: ' + last); return last; }
    }

    console.log('🏢 [Brand] Fallback: ' + DEFAULT_BRAND_NAME);
    return DEFAULT_BRAND_NAME;
  }

  // ============================================================
  // FIX-B1 + B8 + B10: Cleanup FAQ schema
  // ============================================================
  function cleanupFaqSchema(brandName) {
    var cleaned = 0, injected = 0, normalized = 0, entitiesDecoded = 0;
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');

    scripts.forEach(function (script) {
      var raw = script.textContent;
      if (!raw) return;
      if (raw.indexOf('"FAQPage"') === -1 && raw.indexOf('"QAPage"') === -1) return;

      var json;
      try { json = JSON.parse(raw); } catch (e) { return; }

      var nodes = [];
      if (Array.isArray(json)) nodes = json;
      else if (json['@graph'] && Array.isArray(json['@graph'])) nodes = json['@graph'];
      else nodes = [json];

      var changed = false;

      nodes.forEach(function (node) {
        if (!node || typeof node !== 'object') return;
        var typeStr = (node['@type'] || '').toString();
        var isFaqPage = (typeStr.indexOf('FAQPage') !== -1);
        var isQaPage = (typeStr.indexOf('QAPage') !== -1);
        if (!isFaqPage && !isQaPage) return;

        if (isFaqPage) {
          if (node.datePublished !== undefined) { delete node.datePublished; changed = true; cleaned++; }
          if (node.dateModified !== undefined)  { delete node.dateModified; changed = true; cleaned++; }
          if (node.author === undefined || node.author === null) {
            if (brandName) {
              node.author = { "@type": "Organization", "name": brandName };
              changed = true; injected++;
              console.log('✅ [FAQ] Inject author: ' + brandName);
            }
          } else if (node.author.name) {
            var originalName = node.author.name;
            var normalizedName = normalizeBrandCase(originalName);
            if (normalizedName !== originalName) {
              node.author.name = normalizedName;
              changed = true; normalized++;
            }
          }
        }

        if (Array.isArray(node.mainEntity)) {
          node.mainEntity.forEach(function (q) {
            if (!q || typeof q !== 'object') return;
            if (q.author !== undefined)       { delete q.author;       changed = true; cleaned++; }
            if (q.datePublished !== undefined){ delete q.datePublished; changed = true; cleaned++; }
            if (q.dateModified !== undefined) { delete q.dateModified;  changed = true; cleaned++; }
            if (q.upvoteCount !== undefined)  { delete q.upvoteCount;   changed = true; cleaned++; }

            if (q.acceptedAnswer && typeof q.acceptedAnswer === 'object') {
              var a = q.acceptedAnswer;
              if (a.author !== undefined)       { delete a.author;       changed = true; cleaned++; }
              if (a.datePublished !== undefined){ delete a.datePublished; changed = true; cleaned++; }
              if (a.dateModified !== undefined) { delete a.dateModified;  changed = true; cleaned++; }
              if (a.upvoteCount !== undefined)  { delete a.upvoteCount;   changed = true; cleaned++; }
            }

            if (Array.isArray(q.suggestedAnswer)) {
              q.suggestedAnswer.forEach(function (s) {
                if (!s || typeof s !== 'object') return;
                if (s.author !== undefined)       { delete s.author;       changed = true; cleaned++; }
                if (s.datePublished !== undefined){ delete s.datePublished; changed = true; cleaned++; }
                if (s.dateModified !== undefined) { delete s.dateModified;  changed = true; cleaned++; }
                if (s.upvoteCount !== undefined)  { delete s.upvoteCount;   changed = true; cleaned++; }
              });
            }
          });
        }
      });

      var entitiesBefore = hasHtmlEntities(json);
      json = deepDecodeHtmlEntities(json);
      var entitiesAfter = hasHtmlEntities(json);
      var decodedCount = entitiesBefore.length - entitiesAfter.length;
      if (decodedCount > 0) {
        entitiesDecoded += decodedCount;
        cleaned += decodedCount;
        changed = true;
      }

      if (changed) script.textContent = JSON.stringify(json, null, 2);
    });

    console.log('✅ [FAQ Cleanup] ' + cleaned + ' dibersihkan, ' + injected + ' inject, ' + normalized + ' normalize, ' + entitiesDecoded + ' decode');
    return { cleaned: cleaned, injected: injected, normalized: normalized, entitiesDecoded: entitiesDecoded };
  }

  // ============================================================
  // Helper deteksi versi PLD
  // ============================================================
  function getPLDVersion() {
    if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.version) {
      var v = window.pageLevelDetectorv22.version;
      if (v.indexOf("23.9.9") === 0) return { version: v, family: "v23-lite", label: "v23.9.9-lite" };
      if (v.indexOf("23.9.8") === 0) return { version: v, family: "v23-lite", label: "v23.9.8-lite" };
      if (v.indexOf("23.9.7") === 0) return { version: v, family: "v23-lite", label: "v23.9.7-lite" };
      if (v.indexOf("23.") === 0)    return { version: v, family: "v23", label: "v23.0.0" };
      if (v.indexOf("22.") === 0)    return { version: v, family: "v22", label: "v22.x" };
      return { version: v, family: "unknown", label: "v" + v };
    }
    if (window.pageLevelDetectorv20) return { version: "20.x", family: "v20", label: "v20.x" };
    if (window.pageLevelDetectorv19) return { version: "19.x", family: "v19", label: "v19.x" };
    if (window.pageLevelDetectorV18) return { version: "18.x", family: "v18", label: "v18" };
    if (window.pageLevelDetectorV17) return { version: "17.x", family: "v17", label: "v17" };
    if (window.pageLevelDetector)    return { version: "legacy", family: "legacy", label: "legacy" };
    return { version: "none", family: "none", label: "none" };
  }

  function _cachePLD(key, fn) {
    if (_AED_PLD_CACHE[key] !== undefined) return _AED_PLD_CACHE[key];
    var result = fn();
    _AED_PLD_CACHE[key] = result;
    return result;
  }

  // ============================================================
  // PLD HELPER
  // ============================================================
  function getPLDContentFocus(pageLevel, entityType) {
    if (!window.pageLevelDetectorv22) return null;
    if (typeof window.pageLevelDetectorv22.detectContentFocus !== "function") return null;

    var cacheKey = "contentfocus|" + pageLevel + "|" + entityType;
    return _cachePLD(cacheKey, function () {
      try {
        var focus = window.pageLevelDetectorv22.detectContentFocus(pageLevel, entityType);
        if (focus) { console.log(`🎯 [PLD] Content Focus: ${focus}`); return focus; }
      } catch (e) { console.warn("⚠️ PLD detectContentFocus error: " + e.message); }
      return null;
    });
  }

  function getPLDKategori(contentFocus) {
    if (!window.pageLevelDetectorv22) return null;
    if (typeof window.pageLevelDetectorv22.detectKategori !== "function") return null;

    var cacheKey = "kategori|" + (contentFocus || "INFORMASI");
    return _cachePLD(cacheKey, function () {
      try {
        var kategori = window.pageLevelDetectorv22.detectKategori((contentFocus || "INFORMASI").toUpperCase());
        if (kategori) { console.log(`🏷️ [PLD] Kategori: ${kategori}`); return kategori; }
      } catch (e) {}
      return null;
    });
  }

  function getPLDH1Pattern(kategori) {
    if (!window.pageLevelDetectorv22 || !kategori) return null;
    if (typeof window.pageLevelDetectorv22.detectH1Pattern !== "function") return null;

    var cacheKey = "h1pattern|" + kategori;
    return _cachePLD(cacheKey, function () {
      try {
        var pattern = window.pageLevelDetectorv22.detectH1Pattern(kategori);
        if (pattern) { console.log(`📝 [PLD] H1 Pattern: ${pattern}`); return pattern; }
      } catch (e) {}
      return null;
    });
  }

  function getPLDSchemaType(pageLevel, entityType, contentFocus) {
    if (!window.pageLevelDetectorv22) return null;
    if (typeof window.pageLevelDetectorv22.detectSchemaType !== "function") return null;

    var cacheKey = "schema|" + pageLevel + "|" + entityType + "|" + (contentFocus || "INFORMASI");
    return _cachePLD(cacheKey, function () {
      try {
        var schemaType = window.pageLevelDetectorv22.detectSchemaType(pageLevel, entityType, (contentFocus || "INFORMASI").toUpperCase());
        if (schemaType) { console.log(`📋 [PLD] Schema: ${schemaType.primary} + ${schemaType.secondary}`); return schemaType; }
      } catch (e) {}
      return null;
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX-MINOR-2 (v17.4.8): getPLDCtaType — tambah entityType
  // SEBELUM: detectCtaType(level, focus) — 2 arg → CTA tidak entity-aware
  // SESUDAH: detectCtaType(level, focus, entityType) — 3 arg → akurat
  // ═══════════════════════════════════════════════════════════
  function getPLDCtaType(pageLevel, contentFocus, entityType) {
    if (!window.pageLevelDetectorv22) return null;
    if (typeof window.pageLevelDetectorv22.detectCtaType !== "function") return null;

    var cacheKey = "cta|" + pageLevel + "|" + (contentFocus || "INFORMASI") + "|" + (entityType || "none");
    return _cachePLD(cacheKey, function () {
      try {
        var ctaType = window.pageLevelDetectorv22.detectCtaType(
          pageLevel,
          (contentFocus || "INFORMASI").toUpperCase(),
          entityType || null
        );
        if (ctaType) { console.log(`🎯 [PLD] CTA: ${ctaType.type} → ${ctaType.text} (entity=${entityType || 'none'})`); return ctaType; }
      } catch (e) {}
      return null;
    });
  }

  // ============================================================
  // FIX-SYNC-v3: getKategori
  // ============================================================
  function getKategori(pageLevel, contentFocus, finalType) {
    if (finalType) {
      var kategoriFromType = (finalType === 'evergreen') ? 'EVERGREEN' : 'NON-EVERGREEN';
      console.log(`🏷️ [FIX-SYNC-v3] Kategori: ${kategoriFromType} (dari finalType="${finalType}")`);
      return kategoriFromType;
    }

    var normalizedFocus = String(contentFocus || '').toUpperCase();

    if (EVERGREEN_LEVELS.indexOf(pageLevel) !== -1) {
      console.log(`🏷️ [Fallback] Kategori: EVERGREEN (level "${pageLevel}")`);
      return 'EVERGREEN';
    }

    if (MONEY_LEVELS.indexOf(pageLevel) !== -1) {
      if (normalizedFocus === 'INFORMASI') {
        console.log(`🏷️ [Fallback] Kategori: EVERGREEN (money "${pageLevel}" + INFORMASI)`);
        return 'EVERGREEN';
      }
      console.log(`🏷️ [Fallback] Kategori: NON-EVERGREEN (money "${pageLevel}" + ${normalizedFocus})`);
      return 'NON-EVERGREEN';
    }

    var pldKategori = getPLDKategori(contentFocus);
    if (pldKategori) return pldKategori;

    return 'EVERGREEN';
  }

  // ============================================================
  // FIX-EE-4: detectContentTypeByH1
  // ============================================================
  function detectContentTypeByH1() {
    const h1 = document.querySelector('h1');
    const h1Raw = h1 ? (h1.innerText || h1.textContent || '') : '';
    const h1Text = h1Raw.toLowerCase();
    const hasYear = /\b(19|20)\d{2}\b/.test(h1Text);

    if (!h1) {
      console.warn('⚠️ H1 tidak ditemukan — safe default INFORMASI');
      return {
        isInformational: true, isPrice: false, hasYear: false, h1Text: '',
        reason: 'H1 tidak ditemukan — safe default',
        confidence: 'low', source: 'safe-default'
      };
    }

    const pldVersion = getPLDVersion();
    if (pldVersion.family === "v23-lite" || pldVersion.family === "v23" || pldVersion.family === "v22") {
      try {
        const pldLevel  = window.pageLevelDetectorv22.detect();
        const pldEntity = window.pageLevelDetectorv22.detectEntityType();
        const pldFocus  = getPLDContentFocus(pldLevel, pldEntity);

        if (pldFocus) {
          const normalized = String(pldFocus).toUpperCase();
          const isInfo = (normalized === 'INFORMASI');
          const isPrice = ['HARGA', 'COMMERCIAL', 'GABUNG'].includes(normalized);
          console.log(`🎯 [FIX-EE-4] PLD contentFocus: ${normalized} (level=${pldLevel}, entity=${pldEntity})`);
          return {
            isInformational: isInfo, isPrice: isPrice, hasYear: hasYear, h1Text: h1Text,
            reason: `PLD ${pldVersion.label} detectContentFocus = ${normalized}`,
            confidence: 'high', source: 'pld-only'
          };
        }
      } catch (e) {
        console.warn("⚠️ PLD contentFocus error: " + e.message);
      }
    }

    const bodyFocus = document.body.getAttribute('data-content-focus');
    if (bodyFocus) {
      const normalized = bodyFocus.toUpperCase();
      const isInfo = (normalized === 'INFORMASI');
      const isPrice = ['HARGA', 'COMMERCIAL', 'GABUNG'].includes(normalized);
      console.log(`🎯 [FIX-EE-4] body[data-content-focus]: ${normalized}`);
      return {
        isInformational: isInfo, isPrice: isPrice, hasYear: hasYear, h1Text: h1Text,
        reason: `body[data-content-focus] = ${normalized}`,
        confidence: 'high', source: 'body-attr'
      };
    }

    if (window.V379A && window.V379A.focusKonten) {
      const normalized = String(window.V379A.focusKonten).toUpperCase();
      const isInfo = (normalized === 'INFORMASI');
      const isPrice = ['HARGA', 'COMMERCIAL', 'GABUNG'].includes(normalized);
      console.log(`🎯 [FIX-EE-4] V379A.focusKonten: ${normalized}`);
      return {
        isInformational: isInfo, isPrice: isPrice, hasYear: hasYear, h1Text: h1Text,
        reason: `V379A.focusKonten = ${normalized}`,
        confidence: 'high', source: 'v379a'
      };
    }

    console.warn('⚠️ [FIX-EE-4] PLD/V379A tidak tersedia — safe default INFORMASI');
    return {
      isInformational: true, isPrice: false, hasYear: hasYear, h1Text: h1Text,
      reason: 'PLD unavailable — safe default INFORMASI',
      confidence: 'low', source: 'safe-default'
    };
  }

  function getContentFocus(h1Detection, pageLevel, entityType) {
    if (pageLevel && entityType) {
      const pldFocus = getPLDContentFocus(pageLevel, entityType);
      if (pldFocus) return String(pldFocus).toUpperCase();
    }
    const bodyFocus = document.body.getAttribute('data-content-focus');
    if (bodyFocus) return bodyFocus.toUpperCase();
    if (window.V379A && window.V379A.focusKonten) return String(window.V379A.focusKonten).toUpperCase();
    if (h1Detection) {
      if (h1Detection.isInformational) return 'INFORMASI';
      if (h1Detection.isPrice) return 'HARGA';
    }
    return 'INFORMASI';
  }

  // ============================================================
  // FIX-A5: queryByKeyword
  // ============================================================
  function queryByKeyword(container, keywords, requireYear = true) {
    const results = [];
    if (!container) return results;
    const elements = container.querySelectorAll('p, span, time, li, td, .update-badge, .last-updated, .date-modified');
    elements.forEach(el => {
      const tag = el.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return;
      const text = el.innerText?.toLowerCase() || '';
      if (!text || text.length > 500) return;
      const hasKeyword = keywords.some(kw => text.includes(kw.toLowerCase()));
      if (!hasKeyword) return;
      if (!requireYear) { results.push(el); return; }
      if (/\b(19|20)\d{2}\b/.test(text)) results.push(el);
    });
    return results;
  }

  // ============================================================
  // FIX-B4: hasLastUpdatedAnchor
  // ============================================================
  function hasLastUpdatedAnchor() {
    var selectors = ['.update-badge', '[class*="update-badge"]', '.last-updated', '.updated-date', '.date-modified', '.post-date', '.article-date', '.publish-date', '.post-meta', '.entry-meta', '.article-meta', '.breadcrumb + p', '.toc + p', 'h1 + p', '[class*="last-updated"]'];
    for (var i = 0; i < selectors.length; i++) {
      try {
        var els = document.querySelectorAll(selectors[i]);
        if (els && els.length > 0) { console.log('✅ [Guard] Anchor: ' + selectors[i]); return true; }
      } catch (e) {}
    }
    var keywordEls = queryByKeyword(document.body, ['diperbarui', 'update', 'terakhir', 'last updated', 'updated', 'perbarui'], true);
    if (keywordEls && keywordEls.length > 0) { console.log('✅ [Guard] Anchor via keyword'); return true; }
    console.warn('⚠️ [Guard] Tidak ada anchor .last-updated');
    return false;
  }

  // ============================================================
  // FIX-B3: updateJsonLdDates
  // ============================================================
  function updateJsonLdDates(dateModified, nextUpdate) {
    var updated = 0;
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(function (script) {
      var raw = script.textContent;
      if (!raw) return;
      if (raw.indexOf('"date') === -1 && raw.indexOf('priceValidUntil') === -1) return;
      var json;
      try { json = JSON.parse(raw); } catch (e) { return; }
      var nodes = Array.isArray(json) ? json : (json['@graph'] && Array.isArray(json['@graph']) ? json['@graph'] : [json]);
      var changed = false;
      nodes.forEach(function (node) {
        if (!node || typeof node !== 'object') return;
        var typeStr = (node['@type'] || '').toString();
        var isFaqRelated = (typeStr.indexOf('FAQPage') !== -1 || typeStr.indexOf('Question') !== -1 || typeStr.indexOf('Answer') !== -1 || typeStr.indexOf('QAPage') !== -1);
        if (isFaqRelated) return;
        if (node.dateModified !== undefined && node.dateModified !== dateModified) {
          node.dateModified = dateModified; changed = true;
        }
        if (node.offers) {
          var offers = Array.isArray(node.offers) ? node.offers : [node.offers];
          offers.forEach(function (offer) {
            if (offer && offer.priceValidUntil !== undefined) { offer.priceValidUntil = nextUpdate; changed = true; }
          });
        }
      });
      if (changed) { script.textContent = JSON.stringify(json, null, 2); updated++; }
    });
    if (updated > 0) console.log('✅ [JSON-LD Dates] ' + updated + ' blok diupdate');
    return { updated: updated };
  }

  // ============================================================
  // FIX-A14+A18+A20: isHistoricalContext
  // ============================================================
  function isHistoricalContext(fullText, yearPos, yearLength) {
    var before = fullText.substring(Math.max(0, yearPos - 80), yearPos).toLowerCase();
    var after = fullText.substring(yearPos + yearLength, Math.min(fullText.length, yearPos + yearLength + 80)).toLowerCase();

    var historicalWords = ['lalu','yang lalu','sebelumnya','silam','dahulu','lampau','terdahulu','saat itu','ketika itu','waktu itu','dulu','masa lalu','tahun lalu','bulan lalu','yang telah lewat','sejak','sepanjang','periode','era','zaman'];
    var futureWords = ['mendatang','yang akan datang','akan datang','yang akan','masa depan','berikutnya','nanti','tahun depan','bulan depan','di masa depan','proyeksi','prediksi','target','rencana'];

    for (var i = 0; i < historicalWords.length; i++) if (after.indexOf(historicalWords[i]) !== -1) return { skip: true, reason: 'historical-after', word: historicalWords[i] };
    for (var j = 0; j < futureWords.length; j++)     if (after.indexOf(futureWords[j]) !== -1)      return { skip: true, reason: 'future-after', word: futureWords[j] };

    var strongHistoricalBefore = ['tahun lalu','sebelumnya','silam','dahulu','masa lalu','saat itu','ketika itu','waktu itu','yang lalu','sejak','periode','era','zaman','sepanjang','sejarah','awal mula','berdiri sejak','didirikan','pertama kali','mulai dari'];
    for (var k = 0; k < strongHistoricalBefore.length; k++) if (before.indexOf(strongHistoricalBefore[k]) !== -1) return { skip: true, reason: 'historical-before', word: strongHistoricalBefore[k] };
    return { skip: false };
  }

  function replaceYearWithContext(text, oldYears, newYear) {
    if (!text) return text;
    var protectedRefs = [];
    text = text.replace(/\b(SNI|ISO|UU|PP|Permen|Kepmen|ASTM|JIS|EN|DIN|IEC|BS|GB)\s*[\d.:\-\/]+\b/gi, function (m) { protectedRefs.push(m); return '\x00PROT' + (protectedRefs.length - 1) + '\x00'; });

    var oldYearMap = {};
    oldYears.forEach(function (y) { oldYearMap[y] = true; });

    var monthYearRefs = [];
    text = text.replace(/\b(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+(\d{4})\b/gi, function (m) { monthYearRefs.push(m); return '\x00MONTH' + (monthYearRefs.length - 1) + '\x00'; });

    var rangeRefs = [];
    text = text.replace(/\b(\d{4})\s*(?:\-|–|—|s\/d|sd|sampai|hingga|to)\s*(\d{4})\b/gi, function (m) { rangeRefs.push(m); return '\x00RANGE' + (rangeRefs.length - 1) + '\x00'; });

    text = text.replace(/\b(\d{4})\b/g, function (match, yearStr, offset, fullText) {
      var y = parseInt(yearStr, 10);
      if (!oldYearMap[y]) return match;
      var ctxCheck = isHistoricalContext(fullText, offset, 4);
      if (ctxCheck.skip) return match;
      return String(newYear);
    });

    text = text.replace(/\x00RANGE(\d+)\x00/g, function (m, idx) { return rangeRefs[parseInt(idx, 10)]; });
    text = text.replace(/\x00MONTH(\d+)\x00/g, function (m, idx) { return monthYearRefs[parseInt(idx, 10)]; });
    text = text.replace(/\x00PROT(\d+)\x00/g, function (m, idx) { return protectedRefs[parseInt(idx, 10)]; });
    return text;
  }

  // ============================================================
  // FIX-B6: updateJsonLdFaqYears
  // ============================================================
  function updateJsonLdFaqYears(newYear) {
    var updated = 0, replacedCount = 0, skippedCount = 0;
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    var currentYear = new Date().getFullYear();
    var oldYears = [];
    for (var y = Math.max(currentYear - 3, 2024); y < currentYear; y++) oldYears.push(y);
    if (oldYears.length === 0) return { updated: 0, replaced: 0, skipped: 0 };

    var oldYearsPattern = oldYears.join('|');
    var oldYearRegex = new RegExp('\\b(?:' + oldYearsPattern + ')\\b');

    scripts.forEach(function (script) {
      var raw = script.textContent;
      if (!raw) { skippedCount++; return; }
      if (raw.indexOf('"FAQPage"') === -1 && raw.indexOf('"QAPage"') === -1) { skippedCount++; return; }
      if (!oldYearRegex.test(raw)) { skippedCount++; return; }
      if (!/\b20\d{2}\b/.test(raw)) { skippedCount++; return; }

      var json;
      try { json = JSON.parse(raw); } catch (e) { skippedCount++; return; }

      var nodes = Array.isArray(json) ? json : (json['@graph'] && Array.isArray(json['@graph']) ? json['@graph'] : [json]);
      var changed = false;

      nodes.forEach(function (node) {
        if (!node || typeof node !== 'object') return;
        if (!Array.isArray(node.mainEntity)) return;
        node.mainEntity.forEach(function (q) {
          if (!q || typeof q !== 'object') return;
          if (typeof q.name === 'string') {
            var newName = replaceYearWithContext(q.name, oldYears, newYear);
            if (newName !== q.name) { q.name = newName; changed = true; replacedCount++; }
          }
          if (q.acceptedAnswer && typeof q.acceptedAnswer.text === 'string') {
            var newText = replaceYearWithContext(q.acceptedAnswer.text, oldYears, newYear);
            if (newText !== q.acceptedAnswer.text) { q.acceptedAnswer.text = newText; changed = true; replacedCount++; }
          }
        });
      });

      if (changed) { script.textContent = JSON.stringify(json, null, 2); updated++; }
    });

    if (updated > 0) console.log('✅ [FAQ Years] ' + updated + ' blok diupdate, ' + replacedCount + ' field');
    else console.log('⏭️ [FAQ Years] Tidak ada perubahan');
    return { updated: updated, replaced: replacedCount, skipped: skippedCount };
  }

  // ============================================================
  // FIX-EE-6: updateContentByLevelAndFocus
  // ============================================================
  function updateContentByLevelAndFocus(pageLevel, contentFocus, now) {
    const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const newMonth = monthNames[now.getMonth()];
    const newYear = now.getFullYear();
    const newDateText = `${newMonth} ${newYear}`;

    const isMoneyLevel = MONEY_LEVELS.includes(pageLevel);
    const isEvergreenLevel = EVERGREEN_LEVELS.includes(pageLevel);
    const normalizedFocus = String(contentFocus || '').toUpperCase();

    let updateMode = 'year-only';
    let modeReason = '';

    if (isEvergreenLevel) {
      updateMode = 'year-only';
      modeReason = `Evergreen level "${pageLevel}" → update tahun saja`;
    } else if (isMoneyLevel) {
      if (normalizedFocus === 'INFORMASI') {
        updateMode = 'year-only';
        modeReason = `Level "${pageLevel}" + INFORMASI → update tahun saja`;
      } else {
        updateMode = 'month-year';
        modeReason = `Level "${pageLevel}" + ${normalizedFocus} → update bulan + tahun`;
      }
    } else {
      updateMode = 'year-only';
      modeReason = `Default → update tahun saja`;
    }

    console.log(`📅 UPDATE KONTEN MODE: ${updateMode} — ${modeReason}`);

    var bodyInnerText = document.body.innerText || '';
    var allYearsInBody = bodyInnerText.match(/\b(19|20)\d{2}\b/g) || [];
    var hasOldYear = false;
    for (var yi = 0; yi < allYearsInBody.length; yi++) {
      var yNum = parseInt(allYearsInBody[yi], 10);
      if (yNum > 2025 && yNum < newYear) { hasOldYear = true; break; }
    }
    if (!hasOldYear) {
      console.log(`⏭️ FIX-A5: Tidak ada tahun "lama" di body — skip`);
      return { updated: false, mode: updateMode, target: updateMode === 'month-year' ? newDateText : newYear, skipped: true };
    }

    const selectors = ['.update-badge', '[class*="update-badge"]', '.last-updated', '.updated-date', '.date-modified', '.post-date', '.article-date', '.publish-date', '.post-meta', '.entry-meta', '.article-meta', '.breadcrumb + p', '.toc + p', 'h1 + p'];
    let contentUpdated = false;
    const elementsSet = new Set();
    selectors.forEach(sel => { try { document.querySelectorAll(sel).forEach(el => elementsSet.add(el)); } catch(e) {} });
    queryByKeyword(document.body, ['diperbarui', 'update', 'terakhir', 'last updated', 'updated', 'perbarui'], true).forEach(el => elementsSet.add(el));

    let elements = Array.from(elementsSet);
    if (elements.length > 50) elements = elements.slice(0, 50);

    for (const el of elements) {
      if (!el || el.tagName === 'H1') continue;
      const originalText = el.innerText || '';
      if (!originalText.match(/\b(19|20)\d{2}\b/)) continue;
      const yearMatches = originalText.match(/\b(19|20)\d{2}\b/g);
      if (!yearMatches) continue;
      let shouldUpdate = false;
      for (const yStr of yearMatches) {
        const y = parseInt(yStr);
        if (y <= 2025) continue;
        if (y < newYear) { shouldUpdate = true; break; }
      }
      if (!shouldUpdate) continue;

      const textNodes = [];
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
      let node;
      while (node = walker.nextNode()) textNodes.push(node);

      for (const textNode of textNodes) {
        const oldText = textNode.textContent || '';
        if (!oldText.match(/\b(19|20)\d{2}\b/)) continue;

        let newTextNode = oldText;
        if (updateMode === 'month-year') {
          newTextNode = newTextNode
            .replace(/(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+(\d{4})/gi, (match, month, year) => {
              const y = parseInt(year);
              if (y > 2025 && y < newYear) return newDateText;
              return match;
            })
            .replace(/(\d{4})-(\d{2})-(\d{2})/g, (match, y, m, d) => {
              const yearNum = parseInt(y);
              if (yearNum > 2025 && yearNum < newYear) {
                const monthName = monthNames[parseInt(m) - 1] || m;
                return `${parseInt(d)} ${monthName} ${newYear}`;
              }
              return match;
            })
            .replace(/(\d{2})\/(\d{2})\/(\d{4})/g, (match, d, m, y) => {
              const yearNum = parseInt(y);
              if (yearNum > 2025 && yearNum < newYear) {
                const monthName = monthNames[parseInt(m) - 1] || m;
                return `${parseInt(d)} ${monthName} ${newYear}`;
              }
              return match;
            });
        } else {
          newTextNode = newTextNode.replace(/\b(19|20)\d{2}\b/g, (match) => {
            const y = parseInt(match);
            if (y > 2025 && y < newYear) return String(newYear);
            return match;
          });
        }

        if (newTextNode !== oldText) {
          textNode.textContent = newTextNode;
          contentUpdated = true;
          console.log(`   ✅ Update: "${oldText.substring(0,40)}..." → "${newTextNode.substring(0,40)}..."`);
        }
      }
    }

    return { updated: contentUpdated, mode: updateMode, target: updateMode === 'month-year' ? newDateText : newYear };
  }

  // ============================================================
  // P2: updateH1WithRules
  // ============================================================
  function updateH1WithRules(pageLevel, now) {
    const isMoneyLevel = MONEY_LEVELS.includes(pageLevel);
    const isEvergreenLevel = EVERGREEN_LEVELS.includes(pageLevel);
    const levelNeedsYear = isMoneyLevel || isEvergreenLevel;
    if (!levelNeedsYear) return { updated: false, reason: 'level-no-year' };

    const h1 = document.querySelector('h1');
    if (!h1) return { updated: false, reason: 'no-h1' };

    const newYear = now.getFullYear();
    const h1Text = h1.innerText;
    const yearMatch = h1Text.match(/\b(19|20)\d{2}\b/);
    const detectedYear = yearMatch ? parseInt(yearMatch[0]) : null;

    if (!detectedYear) return { updated: false, reason: 'no-year-in-h1' };
    if (detectedYear <= 2025) return { updated: false, reason: 'year-too-old' };
    if (detectedYear >= newYear) return { updated: false, reason: 'year-already-current' };

    const newH1 = h1Text.replace(/\b(19|20)\d{2}\b/, newYear);
    if (newH1 !== h1Text) {
      h1.innerText = newH1;
      console.log(`✅ H1: ${detectedYear} → ${newYear}`);
      return { updated: true, from: detectedYear, to: newYear };
    }
    return { updated: false, reason: 'no-change' };
  }

  // ============================================================
  // autoUpdateDates
  // ============================================================
  function autoUpdateDates(pageLevel, contentFocus) {
    console.log("🔄 AUTO-UPDATE: Memeriksa tanggal...");
    let metaModified = document.querySelector('meta[itemprop="dateModified"]');
    let metaNext = document.querySelector('meta[name="nextUpdate"]');
    let metaPublished = document.querySelector('meta[itemprop="datePublished"]');

    let currentModified = metaModified ? metaModified.getAttribute('content') : null;
    let currentNext = metaNext ? metaNext.getAttribute('content') : null;

    if (!currentNext) { console.log("⚠️ Tidak ada nextUpdate, skip"); return false; }

    const now = new Date();
    const nextDate = new Date(currentNext);
    const currentModifiedDate = currentModified ? new Date(currentModified) : now;

    if (now < nextDate) { console.log(`⏭️ Belum lewat nextUpdate`); return false; }

    console.log(`🔄 NEXTUPDATE LEWAT! ${currentNext} → ${now.toISOString()}`);

    let validityDays = getValidityByContext(pageLevel, contentFocus);

    const newModified = now;
    const newNext = new Date(now.getTime() + (validityDays * 86400000));
    const newModifiedStr = toISOWithTimezoneLocal(newModified);
    const newNextStr = toISOWithTimezoneLocal(newNext);

    if (metaModified) metaModified.setAttribute('content', newModifiedStr);
    else { metaModified = document.createElement("meta"); metaModified.setAttribute("itemprop", "dateModified"); metaModified.setAttribute("content", newModifiedStr); document.head.appendChild(metaModified); }

    if (metaNext) metaNext.setAttribute('content', newNextStr);
    else { metaNext = document.createElement("meta"); metaNext.setAttribute("name", "nextUpdate"); metaNext.setAttribute("content", newNextStr); document.head.appendChild(metaNext); }

    if (!metaPublished) {
      metaPublished = document.createElement("meta");
      metaPublished.setAttribute("itemprop", "datePublished");
      metaPublished.setAttribute("content", newModifiedStr);
      document.head.appendChild(metaPublished);
    }

    document.querySelectorAll('[itemtype="http://schema.org/Offer"]').forEach(el => el.setAttribute('priceValidUntil', newNextStr));

    var hasAnchor = hasLastUpdatedAnchor();

    if (!hasAnchor) {
      console.warn('⚠️ [FIX-B4] Anchor tidak ada — SKIP body + FAQ years');
      if (window.AEDMetaDates) {
        window.AEDMetaDates.dateModified = newModifiedStr;
        window.AEDMetaDates.nextUpdate = newNextStr;
        window.AEDMetaDates.lastAutoUpdate = now.toISOString();
        window.AEDMetaDates.updateCount = (window.AEDMetaDates.updateCount || 0) + 1;
      }
      document.body.classList.add('auto-updated');
      document.body.setAttribute('data-last-auto-update', now.toISOString());
      document.body.setAttribute('data-update-count', (parseInt(document.body.getAttribute('data-update-count') || '0') + 1).toString());
      return true;
    }

    var jsonLdResult = updateJsonLdDates(newModifiedStr, newNextStr);
    if (jsonLdResult.updated > 0) console.log(`✅ JSON-LD Dates: ${jsonLdResult.updated} blok`);

    const contentResult = updateContentByLevelAndFocus(pageLevel, contentFocus, now);
    if (contentResult.updated) console.log(`✅ Konten body diupdate: ${contentResult.mode}`);
    else if (contentResult.skipped) console.log(`⏭️ Konten body di-skip (FIX-A5)`);

    const h1Result = updateH1WithRules(pageLevel, now);
    if (h1Result.updated) console.log(`✅ H1: ${h1Result.from} → ${h1Result.to}`);

    var brandName = resolveBrandName();
    var cleanupResult = cleanupFaqSchema(brandName);
    if (cleanupResult.cleaned > 0 || cleanupResult.injected > 0 || cleanupResult.normalized > 0 || cleanupResult.entitiesDecoded > 0) {
      console.log(`✅ FAQ Cleanup: ${cleanupResult.cleaned} dihapus, ${cleanupResult.injected} inject, ${cleanupResult.normalized} normalize, ${cleanupResult.entitiesDecoded} decode`);
    }

    var faqYearsResult = updateJsonLdFaqYears(now.getFullYear());
    if (faqYearsResult.replaced > 0) console.log(`✅ FAQ Years: ${faqYearsResult.replaced} field`);

    if (window.AEDMetaDates) {
      window.AEDMetaDates.dateModified = newModifiedStr;
      window.AEDMetaDates.nextUpdate = newNextStr;
      window.AEDMetaDates.lastAutoUpdate = now.toISOString();
      window.AEDMetaDates.updateCount = (window.AEDMetaDates.updateCount || 0) + 1;
      window.AEDMetaDates.brandName = brandName;
    }

    document.body.classList.add('auto-updated');
    document.body.setAttribute('data-last-auto-update', now.toISOString());
    document.body.setAttribute('data-update-count', (parseInt(document.body.getAttribute('data-update-count') || '0') + 1).toString());

    console.log(`✅ AUTO-UPDATE SELESAI! nextUpdate baru: ${newNextStr} (${validityDays} hari)`);
    return true;
  }

  // ============================================================
  // processMetaDates
  // ============================================================
  async function processMetaDates(customDateModified, finalType, validityMs, usePriceValidUntil, pageLevel, entityType, ctaIntensity, allowPriceRange, detectorVersion, confidence, strategies, strategyCount, isOverridden, overrideReason, h1Detection, contentFocus, autoUpdated) {
    let metaPublished = document.querySelector('meta[itemprop="datePublished"]');
    let metaModified = document.querySelector('meta[itemprop="dateModified"]');
    let metaNext = document.querySelector('meta[name="nextUpdate"]');

    const hadDateModifiedBefore = !!(metaModified && metaModified.getAttribute('content'));
    const isFirstInit = !hadDateModifiedBefore;
    const hasCustomDate = customDateModified !== null && customDateModified !== undefined;

    const hasIllegalFaqProps = detectIllegalFaqProps();
    const shouldRefreshJsonLd = autoUpdated === true || isFirstInit || hasCustomDate || hasIllegalFaqProps;

    console.log(`🔍 Refresh: autoUpdated=${autoUpdated}, isFirstInit=${isFirstInit}, hasCustomDate=${hasCustomDate}, hasIllegal=${hasIllegalFaqProps} → shouldRefresh=${shouldRefreshJsonLd}`);

    const nowISO = new Date().toISOString();
    let datePublished = toISOWithTimezoneLocal(metaPublished?.content) || toISOWithTimezoneLocal(nowISO);
    let dateModified = toISOWithTimezoneLocal(customDateModified) || toISOWithTimezoneLocal(metaModified?.content) || datePublished;

    const publishedObj = new Date(datePublished);
    const modifiedObj = new Date(dateModified);
    if (modifiedObj < publishedObj) dateModified = datePublished;

    if (!metaPublished) { metaPublished = document.createElement("meta"); metaPublished.setAttribute("itemprop", "datePublished"); document.head.appendChild(metaPublished); }
    metaPublished.setAttribute("content", datePublished);
    if (!metaModified) { metaModified = document.createElement("meta"); metaModified.setAttribute("itemprop", "dateModified"); document.head.appendChild(metaModified); }
    metaModified.setAttribute("content", dateModified);

    let nextUpdate = toISOWithTimezoneLocal(new Date(new Date(dateModified).getTime() + validityMs));
    if (!metaNext) { metaNext = document.createElement("meta"); metaNext.setAttribute("name", "nextUpdate"); document.head.appendChild(metaNext); }
    metaNext.setAttribute("content", nextUpdate);

    if (shouldRefreshJsonLd) {
      var jsonLdResultA = updateJsonLdDates(dateModified, nextUpdate);
      if (jsonLdResultA.updated > 0) console.log(`✅ JSON-LD Dates: ${jsonLdResultA.updated} blok`);
    }

    if (shouldRefreshJsonLd) {
      var brandName = resolveBrandName();
      var cleanupResult = cleanupFaqSchema(brandName);
      console.log(`✅ FAQ Cleanup: ${cleanupResult.cleaned} dihapus, ${cleanupResult.injected} inject, ${cleanupResult.normalized} normalize, ${cleanupResult.entitiesDecoded} decode`);
    }

    if (shouldRefreshJsonLd) {
      var faqYearsResultA = updateJsonLdFaqYears(new Date().getFullYear());
      if (faqYearsResultA.replaced > 0) console.log(`✅ FAQ Years: ${faqYearsResultA.replaced} field`);
    }

    if (usePriceValidUntil && h1Detection && h1Detection.isPrice) {
      document.querySelectorAll('[itemtype="http://schema.org/Offer"]').forEach(el => el.setAttribute("priceValidUntil", nextUpdate));
      console.log(`✅ priceValidUntil → ${nextUpdate}`);
    } else {
      document.querySelectorAll('[itemtype="http://schema.org/Offer"]').forEach(el => el.removeAttribute("priceValidUntil"));
      console.log(`✅ priceValidUntil removed`);
    }

    document.body.classList.add(`page-level-${pageLevel}`);
    document.body.classList.add(`entity-type-${entityType}`);
    document.body.classList.add(`content-type-${finalType}`);
    document.body.classList.add(`cta-intensity-${ctaIntensity}`);
    if (allowPriceRange) document.body.classList.add(`allow-price-range`);
    if (h1Detection) {
      if (h1Detection.isInformational) document.body.classList.add('h1-informational');
      if (h1Detection.isPrice) document.body.classList.add('h1-price');
      if (h1Detection.hasYear) document.body.classList.add('h1-has-year');
    }
    if (isOverridden) document.body.classList.add('overridden-evergreen');

    let validityLabel = '';
    const validityDays = validityMs / 86400000;
    if (isOverridden) validityLabel = `EVERGREEN (OVERRIDE) — ${validityDays} hari`;
    else if (finalType === 'evergreen') {
      if (validityDays >= 1095) validityLabel = 'EVERGREEN (3 tahun) — V37';
      else if (validityDays >= 730) validityLabel = 'EVERGREEN (2 tahun) — V37';
      else validityLabel = `EVERGREEN (${validityDays} hari)`;
    } else validityLabel = `NON-EVERGREEN (${validityDays} hari) — ${entityType}/${pageLevel}`;

    const kategori = getKategori(pageLevel, contentFocus, finalType);
    const h1Pattern = getPLDH1Pattern(kategori);
    const schemaType = getPLDSchemaType(pageLevel, entityType, contentFocus);

    // 🔥 FIX-MINOR-2 (v17.4.8): pass entityType
    const pldCtaType = getPLDCtaType(pageLevel, contentFocus, entityType);

    window.AEDMetaDates = {
      type: finalType, entityType, pageLevel,
      datePublished, dateModified, nextUpdate,
      validityDays: validityMs / 86400000,
      usePriceValidUntil, ctaIntensity, allowPriceRange,
      detectorVersion: detectorVersion || 'v17.4.8',
      detectionConfidence: confidence || null,
      detectionStrategies: strategies || null,
      detectionStrategyCount: strategyCount || null,
      isOverridden: isOverridden || false,
      overrideReason: overrideReason || null,
      h1Detection: h1Detection || null,
      contentFocus: contentFocus || null,
      pldKategori: kategori,
      pldH1Pattern: h1Pattern,
      pldSchemaType: schemaType,
      pldCtaType: pldCtaType,
      brandName: resolveBrandName(),
      lastAutoUpdate: null,
      updateCount: 0
    };

    window.EvergreenDetectorResults = window.AEDMetaDates;

    console.log(`✅ ${finalType.toUpperCase()} ACTIVE`);
    console.log(`   - Page Level: ${pageLevel}`);
    console.log(`   - Entity: ${entityType}`);
    console.log(`   - Content Type: ${validityLabel}`);
    console.log(`   - Content Focus: ${contentFocus}`);
    console.log(`   - Kategori: ${kategori}`);
    console.log(`   - Next Update: ${nextUpdate}`);
    if (pldCtaType) console.log(`   - CTA: ${pldCtaType.type} → ${pldCtaType.text}`);
    if (isOverridden) console.warn(`   ⚠️ OVERRIDDEN: ${overrideReason}`);
  }

  // ============================================================
  // FIX-EE-3: getPageLevelAndEntityType
  // ============================================================
  function getPageLevelAndEntityType() {
    let pageLevel = 'pillar';
    let entityType = 'produk';
    let detectorVersion = 'unknown';
    let confidence = null, strategies = null, strategyCount = null;

    if (window.pageLevelDetectorv22) {
      try {
        if (typeof window.pageLevelDetectorv22.detectFromDOM === 'function') {
          var domResult = window.pageLevelDetectorv22.detectFromDOM();
          if (domResult) {
            pageLevel = domResult;
            console.log(`📌 [FIX-EE-3] detectFromDOM() → ${pageLevel}`);
          }
        }
        if ((!pageLevel || pageLevel === 'pillar') && typeof window.pageLevelDetectorv22.detect === 'function') {
          var urlResult = window.pageLevelDetectorv22.detect();
          if (urlResult) { pageLevel = urlResult; console.log(`📌 detect() → ${pageLevel}`); }
        }
        if (typeof window.pageLevelDetectorv22.detectEntityType === 'function') {
          entityType = window.pageLevelDetectorv22.detectEntityType();
        }
        const pldVer = getPLDVersion();
        detectorVersion = pldVer.label;
        if (typeof window.pageLevelDetectorv22.getConfidenceScore === 'function') {
          const cs = window.pageLevelDetectorv22.getConfidenceScore();
          confidence = cs.confidence;
          strategies = cs.strategies;
          strategyCount = cs.strategyCount;
        }
        console.log(`📌 [${detectorVersion}] pageLevel=${pageLevel}, entityType=${entityType}`);
        return { pageLevel, entityType, detectorVersion, confidence, strategies, strategyCount };
      } catch (e) { console.warn("PLD v22/23 error:", e); }
    }

    if (window.pageLevelDetectorv20 && typeof window.pageLevelDetectorv20.detect === 'function') {
      try { pageLevel = window.pageLevelDetectorv20.detect(); entityType = window.pageLevelDetectorv20.detectEntityType(); detectorVersion = 'v20.x'; return { pageLevel, entityType, detectorVersion }; } catch(e) {}
    }
    if (window.pageLevelDetectorv19 && typeof window.pageLevelDetectorv19.detect === 'function') {
      try { pageLevel = window.pageLevelDetectorv19.detect(); entityType = window.pageLevelDetectorv19.detectEntityType(); detectorVersion = 'v19'; return { pageLevel, entityType, detectorVersion }; } catch(e) {}
    }
    if (window.pageLevelDetectorV18 && typeof window.pageLevelDetectorV18.detect === 'function') {
      try { pageLevel = window.pageLevelDetectorV18.detect(); entityType = window.pageLevelDetectorV18.detectEntityType(); detectorVersion = 'v18'; return { pageLevel, entityType, detectorVersion }; } catch(e) {}
    }
    if (window.pageLevelDetectorV17 && typeof window.pageLevelDetectorV17.detect === 'function') {
      try { pageLevel = window.pageLevelDetectorV17.detect(); entityType = window.pageLevelDetectorV17.detectEntityType(); detectorVersion = 'v17'; return { pageLevel, entityType, detectorVersion }; } catch(e) {}
    }
    if (window.pageLevelDetector && typeof window.pageLevelDetector.detect === 'function') {
      try { pageLevel = window.pageLevelDetector.detect(); entityType = window.pageLevelDetector.detectEntityType(); detectorVersion = 'legacy'; return { pageLevel, entityType, detectorVersion }; } catch(e) {}
    }

    console.warn("⚠️ No detector found, using defaults");
    return { pageLevel, entityType, detectorVersion: 'none' };
  }

  // ============================================================
  // WAIT FOR PLD
  // ============================================================
  function waitForPageLevelDetector() {
    return new Promise((resolve) => {
      const pldVer = getPLDVersion();
      if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') { console.log(`✅ PLD ${pldVer.label} ready`); resolve(); return; }
      if (window.pageLevelDetectorv20 && typeof window.pageLevelDetectorv20.detect === 'function') { console.log("✅ PLD v20.x ready"); resolve(); return; }
      if (window.pageLevelDetectorv19 && typeof window.pageLevelDetectorv19.detect === 'function') { console.log("✅ PLD v19 ready"); resolve(); return; }
      if (window.pageLevelDetectorV18 && typeof window.pageLevelDetectorV18.detect === 'function') { console.log("✅ PLD v18 ready"); resolve(); return; }
      if (window.pageLevelDetectorV17 && typeof window.pageLevelDetectorV17.detect === 'function') { console.log("✅ PLD v17 ready"); resolve(); return; }
      if (window.pageLevelDetector && typeof window.pageLevelDetector.detect === 'function') { console.log("✅ PLD legacy ready"); resolve(); return; }

      const onReady = () => { const v = getPLDVersion(); console.log(`✅ PLD ${v.label} ready (event)`); resolve(); };
      window.addEventListener("pageLevelDetectorv22Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorv20Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorv19Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorV19Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorv18Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorReady", onReady, { once: true });

      setTimeout(() => {
        if (window.pageLevelDetectorv22 || window.pageLevelDetectorv20 || window.pageLevelDetectorv19 || window.pageLevelDetectorV18 || window.pageLevelDetector) { resolve(); }
        else {
          console.error("❌ PLD not available, using fallback");
          window.pageLevelDetector = { detect: () => 'pillar', detectEntityType: () => 'produk' };
          resolve();
        }
      }, 3000);
    });
  }

  // ============================================================
  // FIX-SYNC-v4: getRulesByEntityType
  // ============================================================
  function getRulesByEntityType(entityType, pageLevel, h1Detection, contentFocus) {
    console.log(`📌 Getting rules: entityType=${entityType}, pageLevel=${pageLevel}, contentFocus=${contentFocus || 'N/A'}`);

    var isMoneyLevel = MONEY_LEVELS.indexOf(pageLevel) !== -1;

    if (isMoneyLevel) {
      var normalizedFocus = String(contentFocus || '').toUpperCase();
      var isInformationalFocus = (normalizedFocus === 'INFORMASI');
      var hasYear = h1Detection && h1Detection.hasYear;

      if (isInformationalFocus && !hasYear) {
        console.log(`✅ [FIX-SYNC-v4] Money "${pageLevel}" + INFORMASI → EVERGREEN 3 tahun`);
        return {
          type: 'evergreen',
          validityDays: 1095,
          usePriceValidUntil: false,
          allowPriceRange: false,
          ctaIntensity: 'soft-medium',
          overridden: true,
          overrideReason: `Money level tapi konten INFORMASI`
        };
      }

      console.log(`🔒 [FIX-SYNC-v4] Money "${pageLevel}" + ${normalizedFocus} → NON-EVERGREEN`);
      if (isInformationalFocus && hasYear) {
        console.warn(`   ⚠️ contentFocus=INFORMASI, tapi ada tahun di H1 → TETAP NON-EVERGREEN`);
      }

      var validity = getValidityByContext(pageLevel, normalizedFocus);
      
      return {
        type: 'non-evergreen',
        validityDays: validity,
        usePriceValidUntil: (normalizedFocus === 'HARGA' || normalizedFocus === 'GABUNG'),
        allowPriceRange: pageLevel === 'money-master',
        ctaIntensity: pageLevel === 'money-child' ? 'very-hard' : 'hard'
      };
    }

    if (entityType === 'jasa')            return JASA_RULES[pageLevel] || DEFAULT_RULE;
    if (entityType === 'sewa')            return SEWA_RULES[pageLevel] || BASE_PAGE_LEVEL_RULES[pageLevel] || DEFAULT_RULE;
    if (entityType === 'produk' ||
        entityType === 'material')        return PRODUK_MATERIAL_RULES[pageLevel] || BASE_PAGE_LEVEL_RULES[pageLevel] || DEFAULT_RULE;
    return BASE_PAGE_LEVEL_RULES[pageLevel] || DEFAULT_RULE;
  }

  // ============================================================
  // FUNGSI UTAMA
  // ============================================================
  async function detectEvergreen({ customDateModified = null } = {}) {
    if (_AED_INITIALIZED) {
      console.log("⏭️ [AED] detectEvergreen() sudah dijalankan");
      return;
    }
    _AED_INITIALIZED = true;

    console.log("🧩 detectEvergreen() v17.4.8 — COMPLETE");
    await waitForPageLevelDetector();

    const { pageLevel, entityType, detectorVersion, confidence, strategies, strategyCount } = getPageLevelAndEntityType();
    console.log(`📌 Raw: pageLevel=${pageLevel}, entityType=${entityType}`);

    const h1Detection = detectContentTypeByH1();
    console.log(`📊 H1 Detection: info=${h1Detection.isInformational}, price=${h1Detection.isPrice}, hasYear=${h1Detection.hasYear}`);
    console.log(`   Source: ${h1Detection.source}, Reason: ${h1Detection.reason}`);

    const contentFocus = getContentFocus(h1Detection, pageLevel, entityType);
    console.log(`🎯 Content Focus Final: ${contentFocus}`);

    const rule = getRulesByEntityType(entityType, pageLevel, h1Detection, contentFocus);
    const finalType = rule.type;
    const validityDays = rule.validityDays;
    const validityMs = validityDays * 86400000;
    const usePriceValidUntil = rule.usePriceValidUntil;
    const allowPriceRange = rule.allowPriceRange;
    const ctaIntensity = rule.ctaIntensity;
    const isOverridden = rule.overridden || false;
    const overrideReason = rule.overrideReason || null;

    console.log(`📌 Final Rule: type=${finalType}, validityDays=${validityDays}`);

    console.log("🔄 MEMERIKSA AUTO-UPDATE...");
    const autoUpdated = autoUpdateDates(pageLevel, contentFocus);
    if (autoUpdated) console.log("✅ AUTO-UPDATE BERHASIL!");
    else console.log("⏭️ Tidak perlu auto-update");

    await processMetaDates(customDateModified, finalType, validityMs, usePriceValidUntil, pageLevel, entityType, ctaIntensity, allowPriceRange, detectorVersion, confidence, strategies, strategyCount, isOverridden, overrideReason, h1Detection, contentFocus, autoUpdated);

    checkAndShowInlineWarning();

    console.log(`🧩 detectEvergreen() v17.4.8 — FINISHED ✅`);
  }

  // ============================================================
  // EXPORT GLOBAL
  // ============================================================
  window.detectEvergreen = detectEvergreen;
  window.__detectEvergreenReady = true;
  window.dispatchEvent(new Event("detectEvergreenReady"));

  console.log("═══════════════════════════════════════════════════════════");
  console.log("✅ Smart Evergreen Detector v17.4.8 — READY");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🔥 FIX-MINOR-2: getPLDCtaType() — tambah entityType (3 arg)");
  console.log("🔥 FIX-MINOR-1: Komentar header v23.9.8 → v23.9.9");
  console.log("✅ PRESERVED: FIX-KRITIS ISO + DD/MM/YYYY pattern");
  console.log("✅ PRESERVED: FIX-MINOR Guard updateJsonLdFaqYears");
  console.log("📅 TIERED WARNING:");
  console.log("   • HARGA (90 hari)        → warning 14 hari");
  console.log("   • COMMERCIAL (180 hari)  → warning 21 hari");
  console.log("   • INFORMASI (365 hari)   → warning 30 hari");
  console.log("🎯 CONTENT-AWARE VALIDITY:");
  console.log("   • HARGA/GABUNG  → 90 hari");
  console.log("   • COMMERCIAL    → 180 hari");
  console.log("   • INFORMASI     → 365 hari");
  console.log("   • Variant/Sub-V → 365 hari");
  console.log("🔔 INLINE WARNING:");
  console.log("   • Letak: bawah .last-updated");
  console.log("   • Format: TEXT MERAH");
  console.log("   • data-nosnippet: tidak di-index Google");
  console.log("✅ PRESERVED: FIX-SYNC-v4, FIX-EE-2 s/d EE-6, FIX-B1 s/d B10, FIX-A1 s/d A21");
  console.log("🏢 BRAND default: " + DEFAULT_BRAND_NAME);
  console.log("═══════════════════════════════════════════════════════════");

})();
