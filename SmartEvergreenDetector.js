/* ============================================================
 🧠 Smart Evergreen Detector v17.5.5 — BYLINE FIX
============================================================
 🔥🔥🔥 v17.5.5 CHANGELOG 🔥🔥🔥
 ✅ FIX-DOUBLE-BYLINE: Hilangkan duplikasi byline
    - Detect byline Blogger "By" standalone → HIDE container
    - Expand SELECTORS (address, .post-header, [rel=author])
    - Expand EXCLUDE_SELECTORS (#comments, .post-footer, dll)
    - Step 3: Selector detect → Hide broken → Inject AED
    - Efek: Cuma 1 byline (AED punya) di halaman

 ✅ PRESERVED dari v17.5.4:
 ✅ FIX-AUTHOR-BYLINE: Enhance byline kosong di Post + Page
 ✅ PRESERVED dari v17.5.3:
 ✅ FIX-MINI-BADGE: Mini badge tanggal di warning
 ✅ PRESERVED dari v17.5.2:
 ✅ FIX-UX-1 s/d UX-7
 ✅ PRESERVED dari v17.5.1:
 ✅ FIX-WARN-TEXT, FIX-WARN-COLOR, FIX-WARN-GUARD
 ✅ PRESERVED dari v17.5.0:
 ✅ FIX-PLD-SYNC, FIX-AUTORUN, FIX-EVENT
 ✅ PRESERVED dari v17.4.x: FIX-MINOR, FIX-KRITIS, FIX-EE, FIX-B, FIX-A

 📌 BRAND DEFAULT: "Beton Jaya Readymix"
 📌 BIO URL: "/p/about.html"
 📌 KOMPATIBEL: PLD v23.9.9
============================================================ */

(function () {
  if (window.detectEvergreen && window.__AED_VERSION === "17.5.5") return;

  var _AED_INITIALIZED = false;
  var _AED_PLD_CACHE = {};

  window.__AED_VERSION = "17.5.5";

  var DEFAULT_BRAND_NAME = "Beton Jaya Readymix";

  // ============================================================
  // 🔥 FIX-AUTHOR-BYLINE v17.5.5
  // ============================================================
  const AUTHOR_BYLINE_CONFIG = {
    ENABLED: true,
    NAME: 'Beton Jaya Readymix',
    URL: '/p/about.html',
    ALWAYS_REPLACE: false,
    SHOW_AVATAR: true,
    AVATAR_INITIAL: 'B',
    BROKEN_PATTERNS: [
      /^by\s*$/i,
      /^oleh\s*$/i,
      /^by\s+admin\s*$/i,
      /^oleh\s+admin\s*$/i,
      /^by\s+unknown\s*$/i,
      /^by\s*[|]\s*$/i
    ],
    SELECTORS: [
      '.post-author', '.byline', '.post-byline', '.author-byline',
      '.post-header-line-1', '.post-meta', '.entry-meta',
      '.post-info', '.postinfo', '.post-header', '.post-timestamp',
      '.post-footer-line-1', 'address', '[class*="author"]', '[class*="byline"]',
      '[itemprop="author"]', '[rel="author"]'
    ],
    EXCLUDE_SELECTORS: [
      'footer', 'script', '.no-author', '.comment-author', '.comment-meta',
      '#comments', '.comments', '.post-footer', '.blog-pager'
    ]
  };

  // ============================================================
  // 🔔 INLINE WARNING CONFIG
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
    STUCK_THRESHOLD_DAYS: 30,
    MINI_BADGE_ENABLED: true,

    LOCALE: 'id',
    MESSAGES: {
      id: {
        expired:    'ℹ️ Review berkala diperlukan — halaman ini melewati jadwal review',
        critical:   'ℹ️ Review berkala: jadwal review halaman ini adalah hari ini',
        warning:    'ℹ️ Review berkala: halaman akan di-review dalam {days} hari',
        stale:      '⚠️ Konten perlu segera di-review',
        miniBadge:  '📅 Terakhir diperbarui: {date}',
        editBtn:    'Edit →'
      },
      en: {
        expired:    'ℹ️ Periodic review needed — this page passed its review schedule',
        critical:   'ℹ️ Periodic review: this page is due for review today',
        warning:    'ℹ️ Periodic review: page will be reviewed in {days} days',
        stale:      '⚠️ Content needs immediate review',
        miniBadge:  '📅 Last updated: {date}',
        editBtn:    'Edit →'
      }
    },

    PRIORITY_MAP: {
      'money-child|HARGA':    'critical',
      'money-child|GABUNG':   'critical',
      'money-page|HARGA':     'high',
      'money-page|GABUNG':    'high',
      'money-master|HARGA':   'medium',
      'money-master|GABUNG':  'medium',
      'variant|HARGA':        'medium',
      'sub-variant|HARGA':    'medium'
    },

    STYLE: {
      expired: {
        display: 'block', color: '#c2410c', fontWeight: 'bold',
        fontSize: '0.9rem', marginTop: '8px', marginBottom: '12px',
        padding: '8px 12px', background: '#fff7ed',
        borderLeft: '4px solid #f97316', borderRadius: '4px',
        position: 'relative'
      },
      critical: {
        display: 'block', color: '#c2410c', fontWeight: 'bold',
        fontSize: '0.9rem', marginTop: '8px', marginBottom: '12px',
        padding: '8px 12px', background: '#fff7ed',
        borderLeft: '4px solid #f97316', borderRadius: '4px',
        position: 'relative'
      },
      warning: {
        display: 'block', color: '#b45309', fontWeight: 'bold',
        fontSize: '0.9rem', marginTop: '8px', marginBottom: '12px',
        padding: '8px 12px', background: '#fffbeb',
        borderLeft: '4px solid #f59e0b', borderRadius: '4px',
        position: 'relative'
      }
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
  const EVERGREEN_LEVELS = ['sub-pillar-tipe-1', 'sub-pillar-tipe-2', 'pillar'];

  // ============================================================
  // HELPERS
  // ============================================================
  function getPriority(pageLevel, contentFocus) {
    var key = pageLevel + '|' + String(contentFocus || '').toUpperCase();
    return WARNING_CONFIG.PRIORITY_MAP[key] || 'low';
  }

  function detectLocale() {
    try {
      var htmlLang = document.documentElement.getAttribute('lang') || '';
      if (htmlLang.toLowerCase().indexOf('en') === 0) return 'en';
      var bodyLang = document.body.getAttribute('lang') || '';
      if (bodyLang.toLowerCase().indexOf('en') === 0) return 'en';
    } catch (e) {}
    return WARNING_CONFIG.LOCALE || 'id';
  }

  function getMessage(key, replacements) {
    var locale = detectLocale();
    var msgs = WARNING_CONFIG.MESSAGES[locale] || WARNING_CONFIG.MESSAGES.id;
    var msg = msgs[key] || WARNING_CONFIG.MESSAGES.id[key] || '';
    if (replacements) {
      for (var k in replacements) {
        if (replacements.hasOwnProperty(k)) {
          msg = msg.replace('{' + k + '}', String(replacements[k]));
        }
      }
    }
    return msg;
  }

  function isAdmin() {
    try {
      if (document.body.getAttribute('data-is-admin') === 'true') return true;
      if (localStorage.getItem('aed-is-admin') === 'true') return true;
      if (document.cookie.indexOf('aed_admin=1') !== -1) return true;
    } catch (e) {}
    return false;
  }

  function buildEditLink() {
    var currentUrl = window.location.href.split('?')[0];
    return '/admin/edit?url=' + encodeURIComponent(currentUrl);
  }

  // ============================================================
  // INJECT CSS
  // ============================================================
  function injectWarningStyles() {
    if (document.getElementById('aed-warning-styles')) return;
    var style = document.createElement('style');
    style.id = 'aed-warning-styles';
    style.textContent = `
      /* 🔥 FIX-UX-2: MOBILE-FIRST */
      @media (max-width: 640px) {
        #aed-update-warning {
          font-size: 0.82rem !important;
          padding: 6px 10px !important;
          margin-top: 6px !important;
          margin-bottom: 8px !important;
        }
        #aed-update-warning .aed-warning-full { display: none !important; }
        #aed-update-warning .aed-warning-compact { display: inline !important; }
        #aed-update-warning .aed-edit-link {
          font-size: 0.78rem !important;
          padding: 3px 8px !important;
        }
        #aed-update-warning .aed-mini-badge {
          font-size: 0.72rem !important;
        }
      }
      @media (min-width: 641px) {
        #aed-update-warning .aed-warning-compact { display: none !important; }
      }

      /* 🔥 FIX-UX-4: DARK MODE */
      @media (prefers-color-scheme: dark) {
        #aed-update-warning[data-severity="warning"] {
          background: #1c1917 !important;
          color: #fbbf24 !important;
          border-left-color: #f59e0b !important;
        }
        #aed-update-warning[data-severity="expired"],
        #aed-update-warning[data-severity="critical"] {
          background: #1c1917 !important;
          color: #fb923c !important;
          border-left-color: #f97316 !important;
        }
        #aed-update-warning .aed-edit-link {
          background: #292524 !important;
          color: #fbbf24 !important;
          border-color: #f59e0b !important;
        }
        #aed-update-warning .aed-mini-badge {
          color: #9ca3af !important;
          border-top-color: rgba(255,255,255,0.1) !important;
        }
      }

      /* 🔥 FIX-UX-1: PRIORITY STYLING */
      #aed-update-warning[data-priority="critical"] {
        font-weight: 800 !important;
        border-left-width: 6px !important;
      }
      #aed-update-warning[data-priority="high"] {
        font-weight: 700 !important;
        border-left-width: 5px !important;
      }

      /* 🔥 FIX-UX-7: EDIT LINK */
      #aed-update-warning .aed-edit-link {
        display: inline-block;
        margin-left: 10px;
        padding: 4px 10px;
        background: #fff;
        color: #c2410c;
        border: 1px solid #f97316;
        border-radius: 4px;
        text-decoration: none;
        font-size: 0.8rem;
        font-weight: 600;
        transition: all 0.15s;
      }
      #aed-update-warning .aed-edit-link:hover {
        background: #f97316;
        color: #fff;
      }

      /* 🔥 FIX-MINI-BADGE v17.5.3: MINI BADGE */
      #aed-update-warning .aed-mini-badge {
        display: block;
        font-weight: normal;
        font-size: 0.78rem;
        opacity: 0.85;
        margin-top: 6px;
        padding-top: 6px;
        border-top: 1px solid rgba(0, 0, 0, 0.08);
        letter-spacing: 0.01em;
      }

      /* 🔥 FIX-AUTHOR-BYLINE v17.5.5 */
      .aed-author-byline {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.9rem;
        color: #4b5563;
        margin: 8px 0;
        font-family: system-ui, -apple-system, sans-serif;
        line-height: 1.4;
      }
      .aed-author-byline .aed-author-avatar {
        display: inline-block;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: #ea580c;
        color: #fff;
        font-size: 0.72rem;
        font-weight: 700;
        text-align: center;
        line-height: 22px;
        flex-shrink: 0;
      }
      .aed-author-byline .aed-author-label {
        color: #6b7280;
        font-weight: 400;
      }
      .aed-author-byline a.aed-author-name {
        color: #ea580c;
        text-decoration: none;
        font-weight: 600;
      }
      .aed-author-byline a.aed-author-name:hover {
        text-decoration: underline;
      }
      [data-aed-author-enhanced="true"] {
        display: inline-block;
      }
      [data-aed-hidden="true"] {
        display: none !important;
      }
      @media (prefers-color-scheme: dark) {
        .aed-author-byline { color: #9ca3af; }
        .aed-author-byline .aed-author-label { color: #6b7280; }
        .aed-author-byline a.aed-author-name { color: #fb923c; }
      }
      @media (max-width: 640px) {
        .aed-author-byline { font-size: 0.82rem; }
        .aed-author-byline .aed-author-avatar { width: 18px; height: 18px; line-height: 18px; font-size: 0.65rem; }
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================================
  // CONTENT-AWARE VALIDITY
  // ============================================================
  function getValidityByContext(pageLevel, contentFocus) {
    var focus = String(contentFocus || '').toUpperCase();
    var isMoney = MONEY_LEVELS.indexOf(pageLevel) !== -1;
    if (isMoney) {
      if (focus === 'HARGA' || focus === 'GABUNG') return 90;
      if (focus === 'COMMERCIAL') return 180;
      if (focus === 'INFORMASI') return 365;
      if (pageLevel === 'variant' || pageLevel === 'sub-variant') return 365;
      return 365;
    }
    var rule = BASE_PAGE_LEVEL_RULES[pageLevel];
    return rule ? rule.validityDays : 365;
  }

  function getWarningDays(validityDays) {
    if (!WARNING_CONFIG.USE_TIERED) return WARNING_CONFIG.SHOW_DAYS_BEFORE;
    var rules = WARNING_CONFIG.TIERED_RULES || [];
    for (var i = 0; i < rules.length; i++) {
      if (validityDays <= rules[i].maxValidity) return rules[i].showDays;
    }
    return WARNING_CONFIG.SHOW_DAYS_BEFORE;
  }

  function toISOWithTimezoneLocal(date, offset) {
    offset = offset || "+07:00";
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const pad = (n) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${offset}`;
  }

  // ============================================================
  // INLINE WARNING
  // ============================================================
  function formatTanggalIndo(dateStr) {
    if (!dateStr) return '';
    var bulan = ['Januari','Februari','Maret','April','Mei','Juni',
                 'Juli','Agustus','September','Oktober','November','Desember'];
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.getDate() + ' ' + bulan[d.getMonth()] + ' ' + d.getFullYear();
  }

  function checkAndShowInlineWarning(pageLevel, contentFocus) {
    if (!WARNING_CONFIG.ENABLED) return;
    pageLevel = pageLevel || document.body.getAttribute('data-page-level') || '';
    contentFocus = contentFocus || document.body.getAttribute('data-content-focus') || '';

    const metaNext = document.querySelector('meta[name="nextUpdate"]');
    const metaModified = document.querySelector('meta[itemprop="dateModified"]');

    if (!metaNext || !metaNext.getAttribute('content')) return;

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
    let messageKey = null;
    let messageReplace = null;

    if (daysDiff < 0) {
      if (!WARNING_CONFIG.SHOW_AFTER_EXPIRED) return;
      severity = 'expired';
      messageKey = (Math.abs(daysDiff) > WARNING_CONFIG.STUCK_THRESHOLD_DAYS) ? 'stale' : 'expired';
    } else if (daysDiff === 0) {
      severity = 'critical';
      messageKey = 'critical';
    } else if (daysDiff <= warningThreshold) {
      severity = 'warning';
      messageKey = 'warning';
      messageReplace = { days: daysDiff };
    } else {
      console.log(`✅ [AED Warning] Halaman fresh — ${daysDiff} hari lagi`);
      return;
    }

    var priority = getPriority(pageLevel, contentFocus);

    var analyticsSummary = {
      url: window.location.pathname,
      pageLevel: pageLevel,
      contentFocus: contentFocus,
      severity: severity,
      priority: priority,
      daysDiff: daysDiff,
      validityDays: validityDays,
      threshold: warningThreshold,
      stuck: (severity === 'expired' && Math.abs(daysDiff) > WARNING_CONFIG.STUCK_THRESHOLD_DAYS),
      timestamp: new Date().toISOString()
    };
    console.log('📊 [AED Analytics]', JSON.stringify(analyticsSummary));

    if (severity === 'expired' && Math.abs(daysDiff) > WARNING_CONFIG.STUCK_THRESHOLD_DAYS) {
      console.warn('🚨 [AED WARNING STUCK]', Math.abs(daysDiff), 'hari — AED auto-update mungkin tidak berjalan');
      document.body.setAttribute('data-aed-warning-stuck', 'true');
      document.body.setAttribute('data-aed-warning-stuck-days', String(Math.abs(daysDiff)));
    }

    document.body.setAttribute('data-aed-warning-severity', severity);
    document.body.setAttribute('data-aed-warning-days', String(daysDiff));
    document.body.setAttribute('data-aed-warning-priority', priority);

    var message = getMessage(messageKey, messageReplace);
    console.log('ℹ️ [AED Warning]', message, '| priority:', priority);

    createWarningElement(message, severity, priority, daysDiff, modifiedStr);
  }

  function createWarningElement(message, severity, priority, daysDiff, modifiedStr) {
    if (document.getElementById('aed-update-warning')) return;

    injectWarningStyles();

    var warning = document.createElement('div');
    warning.id = 'aed-update-warning';
    warning.setAttribute('data-nosnippet', '');
    warning.setAttribute('data-severity', severity);
    warning.setAttribute('data-priority', priority || 'low');
    warning.setAttribute('role', 'alert');
    warning.setAttribute('aria-live', 'polite');
    warning.setAttribute('aria-atomic', 'true');
    warning.setAttribute('aria-label', 'Status review halaman: ' + message);

    var compactMsg = '';
    if (severity === 'expired' || severity === 'critical') {
      compactMsg = 'ℹ️ ' + (detectLocale() === 'en' ? 'Review due' : 'Review berkala');
    } else if (severity === 'warning') {
      compactMsg = 'ℹ️ ' + (detectLocale() === 'en' ? 'Review in ' + daysDiff + 'd' : 'Review ' + daysDiff + ' hari');
    }

    var mainMsg = document.createElement('span');
    mainMsg.className = 'aed-warning-full';
    mainMsg.textContent = message;
    warning.appendChild(mainMsg);

    var compactSpan = document.createElement('span');
    compactSpan.className = 'aed-warning-compact';
    compactSpan.textContent = compactMsg;
    warning.appendChild(compactSpan);

    if (WARNING_CONFIG.MINI_BADGE_ENABLED && modifiedStr && modifiedStr !== 'unknown') {
      var modText = formatTanggalIndo(modifiedStr);
      if (modText) {
        var miniBadge = document.createElement('span');
        miniBadge.className = 'aed-mini-badge';
        miniBadge.setAttribute('data-nosnippet', '');
        miniBadge.setAttribute('data-source', 'dateModified');
        miniBadge.textContent = getMessage('miniBadge', { date: modText });
        warning.appendChild(miniBadge);
        console.log('📅 [AED Mini Badge] Terakhir diperbarui:', modText);
      }
    }

    if (isAdmin()) {
      var editLink = document.createElement('a');
      editLink.href = buildEditLink();
      editLink.className = 'aed-edit-link';
      editLink.textContent = getMessage('editBtn');
      editLink.setAttribute('rel', 'nofollow');
      editLink.setAttribute('target', '_blank');
      editLink.setAttribute('aria-label', 'Edit halaman ini');
      warning.appendChild(editLink);
    }

    var style = WARNING_CONFIG.STYLE[severity] || WARNING_CONFIG.STYLE.warning;
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
    } else {
      var h1 = document.querySelector('h1');
      if (h1) {
        h1.parentNode.insertBefore(warning, h1.nextSibling);
      } else {
        document.body.insertBefore(warning, document.body.firstChild);
      }
    }
    console.log('✅ [AED Warning] Ditambahkan — severity:', severity, '| priority:', priority, '| mini-badge:', WARNING_CONFIG.MINI_BADGE_ENABLED ? '✅' : '❌');
  }

  // ============================================================
  // 🔥 FIX-AUTHOR-BYLINE v17.5.5
  // ============================================================
  function normalizeBylineText(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function isBrokenByline(text) {
    var cleaned = normalizeBylineText(text).toLowerCase();
    if (!cleaned) return true;
    if (cleaned.length <= 5 && /^(by|oleh|\s|[-–—|])+$/i.test(cleaned)) return true;
    for (var i = 0; i < AUTHOR_BYLINE_CONFIG.BROKEN_PATTERNS.length; i++) {
      if (AUTHOR_BYLINE_CONFIG.BROKEN_PATTERNS[i].test(cleaned)) return true;
    }
    return false;
  }

  function isInsideExclude(el) {
    for (var i = 0; i < AUTHOR_BYLINE_CONFIG.EXCLUDE_SELECTORS.length; i++) {
      try {
        if (el.closest(AUTHOR_BYLINE_CONFIG.EXCLUDE_SELECTORS[i])) return true;
      } catch (e) {}
    }
    return false;
  }

  function buildAuthorByline() {
    var wrapper = document.createElement('div');
    wrapper.className = 'aed-author-byline';
    wrapper.setAttribute('data-nosnippet', '');
    wrapper.setAttribute('itemprop', 'author');
    wrapper.setAttribute('itemscope', '');
    wrapper.setAttribute('itemtype', 'https://schema.org/Organization');

    if (AUTHOR_BYLINE_CONFIG.SHOW_AVATAR) {
      var avatar = document.createElement('span');
      avatar.className = 'aed-author-avatar';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = AUTHOR_BYLINE_CONFIG.AVATAR_INITIAL;
      wrapper.appendChild(avatar);
    }

    var label = document.createElement('span');
    label.className = 'aed-author-label';
    label.textContent = 'By:';
    wrapper.appendChild(label);

    var link = document.createElement('a');
    link.className = 'aed-author-name';
    link.href = AUTHOR_BYLINE_CONFIG.URL;
    link.textContent = AUTHOR_BYLINE_CONFIG.NAME;
    link.setAttribute('itemprop', 'name');
    link.setAttribute('rel', 'author');
    wrapper.appendChild(link);

    return wrapper;
  }

  function findExistingByline() {
    for (var i = 0; i < AUTHOR_BYLINE_CONFIG.SELECTORS.length; i++) {
      try {
        var candidates = document.querySelectorAll(AUTHOR_BYLINE_CONFIG.SELECTORS[i]);
        for (var j = 0; j < candidates.length; j++) {
          var el = candidates[j];
          if (isInsideExclude(el)) continue;
          if (el.querySelector('.aed-author-byline')) continue;
          var txt = normalizeBylineText(el.innerText);
          if (txt.length > 200) continue;
          return el;
        }
      } catch (e) {}
    }
    return null;
  }

  // ============================================================
  // 🔥 FIX-v17.5.5: HIDE existing broken byline (Blogger default)
  // ============================================================
  function hideExistingBylineNearH1() {
    var h1 = document.querySelector('h1');
    if (!h1) return 0;
    var h1Rect = h1.getBoundingClientRect();
    var hidden = 0;

    var allEls = document.querySelectorAll('span, div, p, em, i, b, small, address, a');
    for (var i = 0; i < allEls.length; i++) {
      var el = allEls[i];
      if (isInsideExclude(el)) continue;
      if (el.querySelector('.aed-author-byline')) continue;
      if (el.getAttribute('data-aed-hidden') === 'true') continue;
      if (el === document.body || el === document.documentElement) continue;

      // Ambil text node langsung (bukan children)
      var ownText = '';
      for (var j = 0; j < el.childNodes.length; j++) {
        var n = el.childNodes[j];
        if (n.nodeType === 3) ownText += n.textContent;
      }
      ownText = normalizeBylineText(ownText);

      // Cocokkan "By" / "By:" / "Oleh" standalone
      if (!/^(by|oleh)[:.\s\-|]*$/i.test(ownText)) continue;

      // Cek posisi dekat H1 (dalam 350px ke bawah)
      var elRect = el.getBoundingClientRect();
      if (elRect.top < h1Rect.top - 50) continue;
      if (elRect.top > h1Rect.bottom + 350) continue;
      if (elRect.width === 0 && elRect.height === 0) continue;

      // Cari container yang tepat (parent dengan text total < 200 char)
      var container = el;
      var containerTxt = '';
      for (var d = 0; d < 4; d++) {
        if (!container.parentElement) break;
        var p = container.parentElement;
        if (p === document.body || p === document.documentElement) break;
        var pTxt = normalizeBylineText(p.innerText);
        if (pTxt.length <= 200) {
          container = p;
          containerTxt = pTxt;
        } else {
          break;
        }
      }

      if (!containerTxt) containerTxt = normalizeBylineText(container.innerText);

      container.style.display = 'none';
      container.setAttribute('data-aed-hidden', 'true');
      console.log('🗑️ [AED Author] Hidden existing byline: ' + JSON.stringify(containerTxt.substring(0, 60)));
      hidden++;
      break;
    }

    return hidden;
  }

  // ============================================================
  // 🔥 FIX-v17.5.5: injectAuthorByline dengan 3-step logic
  // ============================================================
  function injectAuthorByline() {
    if (!AUTHOR_BYLINE_CONFIG.ENABLED) return;

    var isPost = /\/\d{4}\/\d{2}\//.test(window.location.pathname);
    var mode = isPost ? 'POST' : 'PAGE';

    if (document.querySelector('.aed-author-byline')) {
      console.log('⏭️ [AED Author] Byline AED sudah ada — skip');
      return;
    }

    // STEP 1: Coba selector-based detection
    var bylineEl = findExistingByline();

    if (bylineEl) {
      var currentText = normalizeBylineText(bylineEl.innerText);
      var broken = isBrokenByline(currentText);

      if (!broken && !AUTHOR_BYLINE_CONFIG.ALWAYS_REPLACE) {
        console.log('✅ [AED Author] Byline sudah bagus — JANGAN sentuh:', JSON.stringify(currentText));
        return;
      }

      if (broken) {
        console.log('⚠️ [AED Author] Byline kosong/rusak (selector): ' + JSON.stringify(currentText) + ' → enhance');
      } else {
        console.log('🔄 [AED Author] ALWAYS_REPLACE aktif → replace');
      }

      var newByline = buildAuthorByline();
      bylineEl.innerHTML = '';
      bylineEl.appendChild(newByline);
      bylineEl.setAttribute('data-aed-author-enhanced', 'true');
      console.log('✅ [AED Author] Enhanced byline di ' + mode);
      return;
    }

    // STEP 2: Hide existing broken byline near H1
    var hiddenCount = hideExistingBylineNearH1();
    if (hiddenCount > 0) {
      console.log('✅ [AED Author] Cleaned ' + hiddenCount + ' existing broken byline');
    }

    // STEP 3: Inject AED byline setelah H1
    console.log('ℹ️ [AED Author] Inject byline baru setelah H1');
    var h1 = document.querySelector('h1');
    if (h1) {
      var newByline2 = buildAuthorByline();
      h1.parentNode.insertBefore(newByline2, h1.nextSibling);
      console.log('✅ [AED Author] Byline di-inject setelah H1 (' + mode + ')');
    } else {
      console.warn('⚠️ [AED Author] Tidak ada H1 — skip');
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
    return textarea.value;
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
  // FIX-B9 + B10
  // ============================================================
  function detectIllegalFaqProps() {
    var hasIllegal = false;
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');

    scripts.forEach(function (script) {
      var raw = script.textContent;
      if (!raw) return;
      if (raw.indexOf('"FAQPage"') === -1 && raw.indexOf('"QAPage"') === -1) return;
      var json;
      try { json = JSON.parse(raw); } catch (e) { return; }
      var nodes = Array.isArray(json) ? json : (json['@graph'] && Array.isArray(json['@graph']) ? json['@graph'] : [json]);

      nodes.forEach(function (node) {
        if (!node || typeof node !== 'object') return;
        var typeStr = (node['@type'] || '').toString();
        var isFaqPage = (typeStr.indexOf('FAQPage') !== -1);
        var isQaPage = (typeStr.indexOf('QAPage') !== -1);
        if (!isFaqPage && !isQaPage) return;

        if (isFaqPage) {
          if (node.datePublished !== undefined) hasIllegal = true;
          if (node.dateModified !== undefined) hasIllegal = true;
        }
        if (Array.isArray(node.mainEntity)) {
          node.mainEntity.forEach(function (q) {
            if (!q || typeof q !== 'object') return;
            if (q.author !== undefined || q.datePublished !== undefined || q.dateModified !== undefined || q.upvoteCount !== undefined) hasIllegal = true;
            if (q.acceptedAnswer && typeof q.acceptedAnswer === 'object') {
              var a = q.acceptedAnswer;
              if (a.author !== undefined || a.datePublished !== undefined || a.dateModified !== undefined || a.upvoteCount !== undefined) hasIllegal = true;
            }
          });
        }
        var entitiesFound = hasHtmlEntities(node);
        if (entitiesFound.length > 0) hasIllegal = true;
      });
    });
    return hasIllegal;
  }

  // ============================================================
  // FIX-B8 + B2: Brand
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
    return words.map(function (w) {
      if (validAcronyms.indexOf(w) !== -1) return w;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    }).join(' ');
  }

  function resolveBrandName() {
    if (window.AEDMetaDates && window.AEDMetaDates.brandName) return window.AEDMetaDates.brandName;
    var metaBrand = document.querySelector('meta[name="brand"]');
    if (metaBrand && metaBrand.getAttribute('content')) return metaBrand.getAttribute('content').trim();
    var ogSite = document.querySelector('meta[property="og:site_name"]');
    if (ogSite && ogSite.getAttribute('content')) return ogSite.getAttribute('content').trim();
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
      if (last && last.length < 60) return last;
    }
    return DEFAULT_BRAND_NAME;
  }

  // ============================================================
  // FIX-B1 + B8 + B10: Cleanup FAQ
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
      var nodes = Array.isArray(json) ? json : (json['@graph'] && Array.isArray(json['@graph']) ? json['@graph'] : [json]);
      var changed = false;

      nodes.forEach(function (node) {
        if (!node || typeof node !== 'object') return;
        var typeStr = (node['@type'] || '').toString();
        var isFaqPage = (typeStr.indexOf('FAQPage') !== -1);
        var isQaPage = (typeStr.indexOf('QAPage') !== -1);
        if (!isFaqPage && !isQaPage) return;

        if (isFaqPage) {
          if (node.datePublished !== undefined) { delete node.datePublished; changed = true; cleaned++; }
          if (node.dateModified !== undefined) { delete node.dateModified; changed = true; cleaned++; }
          if (node.author === undefined || node.author === null) {
            if (brandName) { node.author = { "@type": "Organization", "name": brandName }; changed = true; injected++; }
          } else if (node.author.name) {
            var normalizedName = normalizeBrandCase(node.author.name);
            if (normalizedName !== node.author.name) { node.author.name = normalizedName; changed = true; normalized++; }
          }
        }
        if (Array.isArray(node.mainEntity)) {
          node.mainEntity.forEach(function (q) {
            if (!q || typeof q !== 'object') return;
            if (q.author !== undefined) { delete q.author; changed = true; cleaned++; }
            if (q.datePublished !== undefined) { delete q.datePublished; changed = true; cleaned++; }
            if (q.dateModified !== undefined) { delete q.dateModified; changed = true; cleaned++; }
            if (q.upvoteCount !== undefined) { delete q.upvoteCount; changed = true; cleaned++; }
            if (q.acceptedAnswer && typeof q.acceptedAnswer === 'object') {
              var a = q.acceptedAnswer;
              if (a.author !== undefined) { delete a.author; changed = true; cleaned++; }
              if (a.datePublished !== undefined) { delete a.datePublished; changed = true; cleaned++; }
              if (a.dateModified !== undefined) { delete a.dateModified; changed = true; cleaned++; }
              if (a.upvoteCount !== undefined) { delete a.upvoteCount; changed = true; cleaned++; }
            }
          });
        }
      });

      var entitiesBefore = hasHtmlEntities(json);
      json = deepDecodeHtmlEntities(json);
      var entitiesAfter = hasHtmlEntities(json);
      var decodedCount = entitiesBefore.length - entitiesAfter.length;
      if (decodedCount > 0) { entitiesDecoded += decodedCount; cleaned += decodedCount; changed = true; }
      if (changed) script.textContent = JSON.stringify(json, null, 2);
    });

    console.log('✅ [FAQ Cleanup]', cleaned, 'cleaned,', injected, 'inject,', normalized, 'normalize,', entitiesDecoded, 'decode');
    return { cleaned: cleaned, injected: injected, normalized: normalized, entitiesDecoded: entitiesDecoded };
  }

  // ============================================================
  // PLD HELPERS
  // ============================================================
  function getPLDVersion() {
    if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.version) {
      var v = window.pageLevelDetectorv22.version;
      if (v.indexOf("23.9.9") === 0) return { version: v, family: "v23-lite", label: "v23.9.9-lite" };
      if (v.indexOf("23.9.8") === 0) return { version: v, family: "v23-lite", label: "v23.9.8-lite" };
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

  function _cachePLD(key, fn) {
    if (_AED_PLD_CACHE[key] !== undefined) return _AED_PLD_CACHE[key];
    var result = fn();
    _AED_PLD_CACHE[key] = result;
    return result;
  }

  function getPLDContentFocus(pageLevel, entityType) {
    if (!window.pageLevelDetectorv22 || typeof window.pageLevelDetectorv22.detectContentFocus !== "function") return null;
    return _cachePLD("contentfocus|" + pageLevel + "|" + entityType, function () {
      try { return window.pageLevelDetectorv22.detectContentFocus(pageLevel, entityType); } catch (e) { return null; }
    });
  }
  function getPLDKategori(contentFocus) {
    if (!window.pageLevelDetectorv22 || typeof window.pageLevelDetectorv22.detectKategori !== "function") return null;
    return _cachePLD("kategori|" + (contentFocus || "INFORMASI"), function () {
      try { return window.pageLevelDetectorv22.detectKategori((contentFocus || "INFORMASI").toUpperCase()); } catch (e) { return null; }
    });
  }
  function getPLDH1Pattern(kategori) {
    if (!window.pageLevelDetectorv22 || !kategori || typeof window.pageLevelDetectorv22.detectH1Pattern !== "function") return null;
    return _cachePLD("h1pattern|" + kategori, function () {
      try { return window.pageLevelDetectorv22.detectH1Pattern(kategori); } catch (e) { return null; }
    });
  }
  function getPLDSchemaType(pageLevel, entityType, contentFocus) {
    if (!window.pageLevelDetectorv22 || typeof window.pageLevelDetectorv22.detectSchemaType !== "function") return null;
    return _cachePLD("schema|" + pageLevel + "|" + entityType + "|" + (contentFocus || "INFORMASI"), function () {
      try { return window.pageLevelDetectorv22.detectSchemaType(pageLevel, entityType, (contentFocus || "INFORMASI").toUpperCase()); } catch (e) { return null; }
    });
  }
  function getPLDCtaType(pageLevel, contentFocus, entityType) {
    if (!window.pageLevelDetectorv22 || typeof window.pageLevelDetectorv22.detectCtaType !== "function") return null;
    return _cachePLD("cta|" + pageLevel + "|" + (contentFocus || "INFORMASI") + "|" + (entityType || "none"), function () {
      try {
        return window.pageLevelDetectorv22.detectCtaType(pageLevel, (contentFocus || "INFORMASI").toUpperCase(), entityType || null);
      } catch (e) { return null; }
    });
  }

  function getKategori(pageLevel, contentFocus, finalType) {
    if (finalType) return (finalType === 'evergreen') ? 'EVERGREEN' : 'NON-EVERGREEN';
    var normalizedFocus = String(contentFocus || '').toUpperCase();
    if (EVERGREEN_LEVELS.indexOf(pageLevel) !== -1) return 'EVERGREEN';
    if (MONEY_LEVELS.indexOf(pageLevel) !== -1) {
      if (normalizedFocus === 'INFORMASI') return 'EVERGREEN';
      return 'NON-EVERGREEN';
    }
    var pldKategori = getPLDKategori(contentFocus);
    if (pldKategori) return pldKategori;
    return 'EVERGREEN';
  }

  // ============================================================
  // FIX-EE-4
  // ============================================================
  function detectContentTypeByH1() {
    const h1 = document.querySelector('h1');
    const h1Raw = h1 ? (h1.innerText || h1.textContent || '') : '';
    const h1Text = h1Raw.toLowerCase();
    const hasYear = /\b(19|20)\d{2}\b/.test(h1Text);
    if (!h1) return { isInformational: true, isPrice: false, hasYear: false, h1Text: '', source: 'safe-default' };

    const pldVersion = getPLDVersion();
    if (pldVersion.family === "v23-lite" || pldVersion.family === "v23" || pldVersion.family === "v22") {
      try {
        const pldLevel = window.pageLevelDetectorv22.detect();
        const pldEntity = window.pageLevelDetectorv22.detectEntityType();
        const pldFocus = getPLDContentFocus(pldLevel, pldEntity);
        if (pldFocus) {
          const normalized = String(pldFocus).toUpperCase();
          return {
            isInformational: (normalized === 'INFORMASI'),
            isPrice: ['HARGA', 'COMMERCIAL', 'GABUNG'].includes(normalized),
            hasYear: hasYear, h1Text: h1Text, source: 'pld-only'
          };
        }
      } catch (e) {}
    }
    const bodyFocus = document.body.getAttribute('data-content-focus');
    if (bodyFocus) {
      const normalized = bodyFocus.toUpperCase();
      return {
        isInformational: (normalized === 'INFORMASI'),
        isPrice: ['HARGA', 'COMMERCIAL', 'GABUNG'].includes(normalized),
        hasYear: hasYear, h1Text: h1Text, source: 'body-attr'
      };
    }
    return { isInformational: true, isPrice: false, hasYear: hasYear, h1Text: h1Text, source: 'safe-default' };
  }

  function getContentFocus(h1Detection, pageLevel, entityType) {
    if (pageLevel && entityType) {
      const pldFocus = getPLDContentFocus(pageLevel, entityType);
      if (pldFocus) return String(pldFocus).toUpperCase();
    }
    const bodyFocus = document.body.getAttribute('data-content-focus');
    if (bodyFocus) return bodyFocus.toUpperCase();
    if (h1Detection) {
      if (h1Detection.isInformational) return 'INFORMASI';
      if (h1Detection.isPrice) return 'HARGA';
    }
    return 'INFORMASI';
  }

  function queryByKeyword(container, keywords, requireYear) {
    if (requireYear === undefined) requireYear = true;
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

  function hasLastUpdatedAnchor() {
    var selectors = ['.update-badge', '[class*="update-badge"]', '.last-updated', '.updated-date', '.date-modified', '.post-date', '.article-date', '.publish-date', '.post-meta', '.entry-meta', '.article-meta', '.breadcrumb + p', '.toc + p', 'h1 + p', '[class*="last-updated"]'];
    for (var i = 0; i < selectors.length; i++) {
      try {
        var els = document.querySelectorAll(selectors[i]);
        if (els && els.length > 0) return true;
      } catch (e) {}
    }
    var keywordEls = queryByKeyword(document.body, ['diperbarui', 'update', 'terakhir', 'last updated', 'updated', 'perbarui'], true);
    return keywordEls && keywordEls.length > 0;
  }

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
        if (node.dateModified !== undefined && node.dateModified !== dateModified) { node.dateModified = dateModified; changed = true; }
        if (node.offers) {
          var offers = Array.isArray(node.offers) ? node.offers : [node.offers];
          offers.forEach(function (offer) {
            if (offer && offer.priceValidUntil !== undefined) { offer.priceValidUntil = nextUpdate; changed = true; }
          });
        }
      });
      if (changed) { script.textContent = JSON.stringify(json, null, 2); updated++; }
    });
    return { updated: updated };
  }

  function isHistoricalContext(fullText, yearPos, yearLength) {
    var before = fullText.substring(Math.max(0, yearPos - 80), yearPos).toLowerCase();
    var after = fullText.substring(yearPos + yearLength, Math.min(fullText.length, yearPos + yearLength + 80)).toLowerCase();
    var historicalWords = ['lalu','yang lalu','sebelumnya','silam','dahulu','lampau','terdahulu','saat itu','ketika itu','waktu itu','dulu','masa lalu','tahun lalu','bulan lalu','yang telah lewat','sejak','sepanjang','periode','era','zaman'];
    var futureWords = ['mendatang','yang akan datang','akan datang','yang akan','masa depan','berikutnya','nanti','tahun depan','bulan depan','di masa depan','proyeksi','prediksi','target','rencana'];
    for (var i = 0; i < historicalWords.length; i++) if (after.indexOf(historicalWords[i]) !== -1) return { skip: true };
    for (var j = 0; j < futureWords.length; j++) if (after.indexOf(futureWords[j]) !== -1) return { skip: true };
    var strongHistoricalBefore = ['tahun lalu','sebelumnya','silam','dahulu','masa lalu','saat itu','ketika itu','waktu itu','yang lalu','sejak','periode','era','zaman','sepanjang','sejarah','awal mula','berdiri sejak','didirikan','pertama kali','mulai dari'];
    for (var k = 0; k < strongHistoricalBefore.length; k++) if (before.indexOf(strongHistoricalBefore[k]) !== -1) return { skip: true };
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

  function updateJsonLdFaqYears(newYear) {
    var updated = 0, replacedCount = 0;
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    var currentYear = new Date().getFullYear();
    var oldYears = [];
    for (var y = Math.max(currentYear - 3, 2024); y < currentYear; y++) oldYears.push(y);
    if (oldYears.length === 0) return { updated: 0, replaced: 0 };

    var oldYearRegex = new RegExp('\\b(?:' + oldYears.join('|') + ')\\b');
    scripts.forEach(function (script) {
      var raw = script.textContent;
      if (!raw) return;
      if (raw.indexOf('"FAQPage"') === -1 && raw.indexOf('"QAPage"') === -1) return;
      if (!oldYearRegex.test(raw)) return;
      var json;
      try { json = JSON.parse(raw); } catch (e) { return; }
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
    return { updated: updated, replaced: replacedCount };
  }

  function updateContentByLevelAndFocus(pageLevel, contentFocus, now) {
    const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const newMonth = monthNames[now.getMonth()];
    const newYear = now.getFullYear();
    const newDateText = `${newMonth} ${newYear}`;

    const isMoneyLevel = MONEY_LEVELS.includes(pageLevel);
    const isEvergreenLevel = EVERGREEN_LEVELS.includes(pageLevel);
    const normalizedFocus = String(contentFocus || '').toUpperCase();

    let updateMode = 'year-only';
    if (isEvergreenLevel) updateMode = 'year-only';
    else if (isMoneyLevel) {
      if (normalizedFocus === 'INFORMASI') updateMode = 'year-only';
      else updateMode = 'month-year';
    }

    var bodyInnerText = document.body.innerText || '';
    var allYearsInBody = bodyInnerText.match(/\b(19|20)\d{2}\b/g) || [];
    var hasOldYear = false;
    for (var yi = 0; yi < allYearsInBody.length; yi++) {
      var yNum = parseInt(allYearsInBody[yi], 10);
      if (yNum > 2025 && yNum < newYear) { hasOldYear = true; break; }
    }
    if (!hasOldYear) return { updated: false, skipped: true };

    const selectors = ['.update-badge', '[class*="update-badge"]', '.last-updated', '.updated-date', '.date-modified', '.post-date', '.article-date', '.publish-date', '.post-meta', '.entry-meta', '.article-meta', '.breadcrumb + p', '.toc + p', 'h1 + p'];
    let contentUpdated = false;
    const elementsSet = new Set();
    selectors.forEach(sel => { try { document.querySelectorAll(sel).forEach(el => elementsSet.add(el)); } catch(e) {} });
    queryByKeyword(document.body, ['diperbarui', 'update', 'terakhir', 'last updated', 'updated', 'perbarui'], true).forEach(el => elementsSet.add(el));

    let elements = Array.from(elementsSet).slice(0, 50);
    for (const el of elements) {
      if (!el || el.tagName === 'H1') continue;
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
              const y = parseInt(year); if (y > 2025 && y < newYear) return newDateText; return match;
            })
            .replace(/(\d{2})\/(\d{2})\/(\d{4})/g, (match, d, m, y) => {
              const yearNum = parseInt(y); if (yearNum > 2025 && yearNum < newYear) { const monthName = monthNames[parseInt(m) - 1] || m; return `${parseInt(d)} ${monthName} ${newYear}`; } return match;
            });
        } else {
          newTextNode = newTextNode.replace(/\b(19|20)\d{2}\b/g, (match) => {
            const y = parseInt(match); if (y > 2025 && y < newYear) return String(newYear); return match;
          });
        }
        if (newTextNode !== oldText) { textNode.textContent = newTextNode; contentUpdated = true; }
      }
    }
    return { updated: contentUpdated, mode: updateMode };
  }

  function updateH1WithRules(pageLevel, now) {
    const isMoneyLevel = MONEY_LEVELS.includes(pageLevel);
    const isEvergreenLevel = EVERGREEN_LEVELS.includes(pageLevel);
    if (!isMoneyLevel && !isEvergreenLevel) return { updated: false };
    const h1 = document.querySelector('h1');
    if (!h1) return { updated: false };
    const newYear = now.getFullYear();
    const h1Text = h1.innerText;
    const yearMatch = h1Text.match(/\b(19|20)\d{2}\b/);
    const detectedYear = yearMatch ? parseInt(yearMatch[0]) : null;
    if (!detectedYear) return { updated: false };
    if (detectedYear <= 2025) return { updated: false };
    if (detectedYear >= newYear) return { updated: false };
    const newH1 = h1Text.replace(/\b(19|20)\d{2}\b/, newYear);
    if (newH1 !== h1Text) { h1.innerText = newH1; return { updated: true, from: detectedYear, to: newYear }; }
    return { updated: false };
  }

  function autoUpdateDates(pageLevel, contentFocus) {
    let metaModified = document.querySelector('meta[itemprop="dateModified"]');
    let metaNext = document.querySelector('meta[name="nextUpdate"]');
    let metaPublished = document.querySelector('meta[itemprop="datePublished"]');
    let currentNext = metaNext ? metaNext.getAttribute('content') : null;
    if (!currentNext) return false;

    const now = new Date();
    const nextDate = new Date(currentNext);
    if (now < nextDate) return false;

    let validityDays = getValidityByContext(pageLevel, contentFocus);
    const newModifiedStr = toISOWithTimezoneLocal(now);
    const newNextStr = toISOWithTimezoneLocal(new Date(now.getTime() + (validityDays * 86400000)));

    if (metaModified) metaModified.setAttribute('content', newModifiedStr);
    else { metaModified = document.createElement("meta"); metaModified.setAttribute("itemprop", "dateModified"); metaModified.setAttribute("content", newModifiedStr); document.head.appendChild(metaModified); }
    if (metaNext) metaNext.setAttribute('content', newNextStr);
    else { metaNext = document.createElement("meta"); metaNext.setAttribute("name", "nextUpdate"); metaNext.setAttribute("content", newNextStr); document.head.appendChild(metaNext); }
    if (!metaPublished) { metaPublished = document.createElement("meta"); metaPublished.setAttribute("itemprop", "datePublished"); metaPublished.setAttribute("content", newModifiedStr); document.head.appendChild(metaPublished); }

    if (!hasLastUpdatedAnchor()) {
      document.body.classList.add('auto-updated');
      return true;
    }

    updateJsonLdDates(newModifiedStr, newNextStr);
    updateContentByLevelAndFocus(pageLevel, contentFocus, now);
    updateH1WithRules(pageLevel, now);
    cleanupFaqSchema(resolveBrandName());
    updateJsonLdFaqYears(now.getFullYear());
    document.body.classList.add('auto-updated');
    return true;
  }

  async function processMetaDates(customDateModified, finalType, validityMs, usePriceValidUntil, pageLevel, entityType, ctaIntensity, allowPriceRange, detectorVersion, confidence, strategies, strategyCount, isOverridden, overrideReason, h1Detection, contentFocus, autoUpdated) {
    let metaPublished = document.querySelector('meta[itemprop="datePublished"]');
    let metaModified = document.querySelector('meta[itemprop="dateModified"]');
    let metaNext = document.querySelector('meta[name="nextUpdate"]');

    const isFirstInit = !(metaModified && metaModified.getAttribute('content'));
    const hasCustomDate = customDateModified !== null && customDateModified !== undefined;
    const hasIllegalFaqProps = detectIllegalFaqProps();
    const shouldRefresh = autoUpdated === true || isFirstInit || hasCustomDate || hasIllegalFaqProps;

    const nowISO = new Date().toISOString();
    let datePublished = toISOWithTimezoneLocal(metaPublished?.content) || toISOWithTimezoneLocal(nowISO);
    let dateModified = toISOWithTimezoneLocal(customDateModified) || toISOWithTimezoneLocal(metaModified?.content) || datePublished;
    if (new Date(dateModified) < new Date(datePublished)) dateModified = datePublished;

    if (!metaPublished) { metaPublished = document.createElement("meta"); metaPublished.setAttribute("itemprop", "datePublished"); document.head.appendChild(metaPublished); }
    metaPublished.setAttribute("content", datePublished);
    if (!metaModified) { metaModified = document.createElement("meta"); metaModified.setAttribute("itemprop", "dateModified"); document.head.appendChild(metaModified); }
    metaModified.setAttribute("content", dateModified);

    let nextUpdate = toISOWithTimezoneLocal(new Date(new Date(dateModified).getTime() + validityMs));
    if (!metaNext) { metaNext = document.createElement("meta"); metaNext.setAttribute("name", "nextUpdate"); document.head.appendChild(metaNext); }
    metaNext.setAttribute("content", nextUpdate);

    if (shouldRefresh) {
      updateJsonLdDates(dateModified, nextUpdate);
      cleanupFaqSchema(resolveBrandName());
      updateJsonLdFaqYears(new Date().getFullYear());
    }

    if (usePriceValidUntil && h1Detection && h1Detection.isPrice) {
      document.querySelectorAll('[itemtype="http://schema.org/Offer"]').forEach(el => el.setAttribute("priceValidUntil", nextUpdate));
    } else {
      document.querySelectorAll('[itemtype="http://schema.org/Offer"]').forEach(el => el.removeAttribute("priceValidUntil"));
    }

    document.body.classList.add(`page-level-${pageLevel}`);
    document.body.classList.add(`entity-type-${entityType}`);
    document.body.classList.add(`content-type-${finalType}`);
    document.body.classList.add(`cta-intensity-${ctaIntensity}`);
    if (allowPriceRange) document.body.classList.add(`allow-price-range`);
    if (isOverridden) document.body.classList.add('overridden-evergreen');

    const kategori = getKategori(pageLevel, contentFocus, finalType);

    window.AEDMetaDates = {
      type: finalType, entityType, pageLevel,
      datePublished, dateModified, nextUpdate,
      validityDays: validityMs / 86400000,
      usePriceValidUntil, ctaIntensity, allowPriceRange,
      detectorVersion: detectorVersion || 'v17.5.5',
      detectionConfidence: confidence || null,
      isOverridden: isOverridden || false,
      overrideReason: overrideReason || null,
      h1Detection: h1Detection || null,
      contentFocus: contentFocus || null,
      pldKategori: kategori,
      pldH1Pattern: getPLDH1Pattern(kategori),
      pldSchemaType: getPLDSchemaType(pageLevel, entityType, contentFocus),
      pldCtaType: getPLDCtaType(pageLevel, contentFocus, entityType),
      brandName: resolveBrandName(),
      lastAutoUpdate: null,
      updateCount: 0
    };
    window.EvergreenDetectorResults = window.AEDMetaDates;

    console.log(`✅ ${finalType.toUpperCase()} ACTIVE | level=${pageLevel} | entity=${entityType} | focus=${contentFocus}`);
  }

  function getPageLevelAndEntityType() {
    let pageLevel = 'pillar', entityType = 'produk', detectorVersion = 'unknown';
    let confidence = null, strategies = null, strategyCount = null;

    const bodyLevel = document.body.getAttribute('data-page-level');
    const bodyEntity = document.body.getAttribute('data-entity-type');
    if (bodyLevel && bodyEntity) {
      const pldVer = getPLDVersion();
      console.log(`📌 [FIX-PLD-SYNC] body attribute → ${bodyLevel} | ${bodyEntity}`);
      return { pageLevel: bodyLevel, entityType: bodyEntity, detectorVersion: pldVer.label, confidence, strategies, strategyCount };
    }

    if (window.pageLevelDetectorv22) {
      try {
        if (typeof window.pageLevelDetectorv22.detectFromDOM === 'function') {
          var domResult = window.pageLevelDetectorv22.detectFromDOM();
          if (domResult) pageLevel = domResult;
        }
        if ((!pageLevel || pageLevel === 'pillar') && typeof window.pageLevelDetectorv22.detect === 'function') {
          var urlResult = window.pageLevelDetectorv22.detect();
          if (urlResult) pageLevel = urlResult;
        }
        if (typeof window.pageLevelDetectorv22.detectEntityType === 'function') {
          entityType = window.pageLevelDetectorv22.detectEntityType();
        }
        const pldVer = getPLDVersion();
        detectorVersion = pldVer.label;
        return { pageLevel, entityType, detectorVersion, confidence, strategies, strategyCount };
      } catch (e) {}
    }

    if (window.pageLevelDetectorv20) {
      try { return { pageLevel: window.pageLevelDetectorv20.detect(), entityType: window.pageLevelDetectorv20.detectEntityType(), detectorVersion: 'v20.x' }; } catch(e) {}
    }
    if (window.pageLevelDetectorv19) {
      try { return { pageLevel: window.pageLevelDetectorv19.detect(), entityType: window.pageLevelDetectorv19.detectEntityType(), detectorVersion: 'v19' }; } catch(e) {}
    }
    if (window.pageLevelDetector) {
      try { return { pageLevel: window.pageLevelDetector.detect(), entityType: window.pageLevelDetector.detectEntityType(), detectorVersion: 'legacy' }; } catch(e) {}
    }
    return { pageLevel, entityType, detectorVersion: 'none' };
  }

  function waitForPageLevelDetector() {
    return new Promise((resolve) => {
      if (document.body && document.body.getAttribute('data-page-level')) { resolve(); return; }
      if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') { resolve(); return; }
      if (window.pageLevelDetectorv20 || window.pageLevelDetectorv19 || window.pageLevelDetectorV18 || window.pageLevelDetectorV17 || window.pageLevelDetector) { resolve(); return; }

      const onReady = () => resolve();
      window.addEventListener("pageLevelDetectorv22Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorv20Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorReady", onReady, { once: true });

      setTimeout(() => {
        if (!window.pageLevelDetector && !document.body.getAttribute('data-page-level')) {
          window.pageLevelDetector = { detect: () => 'pillar', detectEntityType: () => 'produk' };
        }
        resolve();
      }, 3000);
    });
  }

  function getRulesByEntityType(entityType, pageLevel, h1Detection, contentFocus) {
    var isMoneyLevel = MONEY_LEVELS.indexOf(pageLevel) !== -1;
    if (isMoneyLevel) {
      var normalizedFocus = String(contentFocus || '').toUpperCase();
      var isInformationalFocus = (normalizedFocus === 'INFORMASI');
      var hasYear = h1Detection && h1Detection.hasYear;
      if (isInformationalFocus && !hasYear) {
        return { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft-medium', overridden: true, overrideReason: 'Money level + INFORMASI' };
      }
      var validity = getValidityByContext(pageLevel, normalizedFocus);
      return {
        type: 'non-evergreen', validityDays: validity,
        usePriceValidUntil: (normalizedFocus === 'HARGA' || normalizedFocus === 'GABUNG'),
        allowPriceRange: pageLevel === 'money-master',
        ctaIntensity: pageLevel === 'money-child' ? 'very-hard' : 'hard'
      };
    }
    if (entityType === 'jasa') return JASA_RULES[pageLevel] || DEFAULT_RULE;
    if (entityType === 'sewa') return SEWA_RULES[pageLevel] || BASE_PAGE_LEVEL_RULES[pageLevel] || DEFAULT_RULE;
    if (entityType === 'produk' || entityType === 'material') return PRODUK_MATERIAL_RULES[pageLevel] || BASE_PAGE_LEVEL_RULES[pageLevel] || DEFAULT_RULE;
    return BASE_PAGE_LEVEL_RULES[pageLevel] || DEFAULT_RULE;
  }

  function logFinalAnalytics(pageLevel, entityType, contentFocus, finalType, validityDays, autoUpdated) {
    var summary = {
      url: window.location.pathname,
      pageLevel: pageLevel,
      entityType: entityType,
      contentFocus: contentFocus,
      finalType: finalType,
      validityDays: validityDays,
      autoUpdated: autoUpdated === true,
      priority: getPriority(pageLevel, contentFocus),
      locale: detectLocale(),
      isAdmin: isAdmin(),
      miniBadgeEnabled: WARNING_CONFIG.MINI_BADGE_ENABLED,
      authorBylineEnabled: AUTHOR_BYLINE_CONFIG.ENABLED,
      timestamp: new Date().toISOString(),
      aedVersion: '17.5.5'
    };
    console.log('📊 [AED Final Analytics]', JSON.stringify(summary));
  }

  // ============================================================
  // FUNGSI UTAMA
  // ============================================================
  async function detectEvergreen(opts) {
    opts = opts || {};
    var customDateModified = opts.customDateModified || null;

    if (_AED_INITIALIZED) return;
    _AED_INITIALIZED = true;

    console.log("🧩 detectEvergreen() v17.5.5 — Byline Fix");
    await waitForPageLevelDetector();

    const { pageLevel, entityType, detectorVersion } = getPageLevelAndEntityType();
    const h1Detection = detectContentTypeByH1();
    const contentFocus = getContentFocus(h1Detection, pageLevel, entityType);

    const rule = getRulesByEntityType(entityType, pageLevel, h1Detection, contentFocus);
    const finalType = rule.type;
    const validityDays = rule.validityDays;
    const validityMs = validityDays * 86400000;

    const autoUpdated = autoUpdateDates(pageLevel, contentFocus);

    await processMetaDates(customDateModified, finalType, validityMs, rule.usePriceValidUntil, pageLevel, entityType, rule.ctaIntensity, rule.allowPriceRange, detectorVersion, null, null, null, rule.overridden || false, rule.overrideReason || null, h1Detection, contentFocus, autoUpdated);

    checkAndShowInlineWarning(pageLevel, contentFocus);
    logFinalAnalytics(pageLevel, entityType, contentFocus, finalType, validityDays, autoUpdated);

    // 🔥 FIX-AUTHOR-BYLINE v17.5.5
    injectAuthorByline();

    window.dispatchEvent(new Event("detectEvergreenReady"));
    console.log(`🧩 detectEvergreen() v17.5.5 — FINISHED ✅`);
  }

  window.detectEvergreen = detectEvergreen;
  window.__detectEvergreenReady = true;

  console.log("═══════════════════════════════════════════════════════════");
  console.log("✅ Smart Evergreen Detector v17.5.5 — BYLINE FIX");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🔥 FIX-DOUBLE-BYLINE: Hide byline Blogger lama + inject AED");
  console.log("🔥 FIX-AUTHOR-BYLINE: Enhance byline kosong di Post + Page");
  console.log("🔥 FIX-MINI-BADGE: Mini badge tanggal terintegrasi warning");
  console.log("🔥 FIX-UX-1 s/d UX-7: Priority, Mobile, Analytics, Dark, A11y, i18n, Deep Link");
  console.log("✅ PRESERVED: SEMUA fitur v17.5.4 + v17.5.3 + v17.5.2 + v17.5.1 + v17.5.0 + v17.4.x");
  console.log("📌 Author URL: " + AUTHOR_BYLINE_CONFIG.URL);
  console.log("📌 Author Name: " + AUTHOR_BYLINE_CONFIG.NAME);
  console.log("═══════════════════════════════════════════════════════════");

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(function () { detectEvergreen(); }, 100);
    }, { once: true });
  } else {
    setTimeout(function () { detectEvergreen(); }, 100);
  }

})();
