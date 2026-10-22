/* ============================================================
 🧠 Smart Evergreen Detector v17.6.2 — SUPER SET + GUIDE BUTTON
============================================================
 ✅ 100% PRESERVED: Semua logika, edge-case, dan kompatibilitas v17.5.9a
 ✅ NEW: Tombol 📖 Panduan di bawah H1 (no-snippet)
 ✅ NEW: Klik 3x tombol → Buka Modal Guide
 ✅ NEW: Tekan ENTER 3x → Aktifkan Admin Mode (Auto Reload)
 ✅ NEW: Auto-Analysis konten (H1, Harga, FAQ, WA, Tabel)
============================================================ */

(function () {
  if (window.detectEvergreen && window.__AED_VERSION === "17.6.2") return;

  var _AED_INITIALIZED = false;
  var _AED_PLD_CACHE = {};

  window.__AED_VERSION = "17.6.2";

  var DEFAULT_BRAND_NAME = "Beton Jaya Readymix";

  // ============================================================
  // 🆕 GUIDE CONFIG
  // ============================================================
  const GUIDE_CONFIG = {
    ENABLED: true,
    ADMIN_ONLY: true,              // Set false jika ingin semua user melihat tombol
    CLICKS_TO_OPEN: 3,
    CLICK_RESET_MS: 3000,
    BUTTON_TEXT: '📖 Panduan Halaman',
    BUTTON_HINT_1: '🖱️ Klik 2x lagi...',
    BUTTON_HINT_2: '🖱️ Klik 1x lagi...',
    MODAL_TITLE: '📖 Panduan Update Halaman'
  };

  // ============================================================
  // AUTHOR BYLINE CONFIG
  // ============================================================
  const AUTHOR_BYLINE_CONFIG = {
    ENABLED: true,
    NAME: 'Beton Jaya Readymix',
    URL: '/p/about.html',
    ALWAYS_REPLACE: false,
    SHOW_AVATAR: true,
    AVATAR_INITIAL: 'B',
    BROKEN_PATTERNS: [
      /^by\s*$/i, /^oleh\s*$/i, /^by\s+admin\s*$/i, /^oleh\s+admin\s*$/i,
      /^by\s+unknown\s*$/i, /^by\s*[|]\s*$/i
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
  // WARNING CONFIG
  // ============================================================
  const WARNING_CONFIG = {
    ENABLED: true,
    SHOW_AFTER_EXPIRED: true,
    USE_TIERED: true,
    TIERED_RULES: [
      { maxValidity: 180, showDays: 21, label: '≤180 hari → warning 21 hari' },
      { maxValidity: 999, showDays: 30, label: '≤365 hari → warning 30 hari' }
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
        editBtn:    'Edit →',
        needsVerify: '🔍 Perlu verifikasi harga',
        editHint:    '💡 Cara verify: Edit di Blogger → ubah minimal 1 kata/kalimat/FAQ → Save & Publish → banner hilang otomatis'
      },
      en: {
        expired:    'ℹ️ Periodic review needed — this page passed its review schedule',
        critical:   'ℹ️ Periodic review: this page is due for review today',
        warning:    'ℹ️ Periodic review: page will be reviewed in {days} days',
        stale:      '⚠️ Content needs immediate review',
        miniBadge:  '📅 Last updated: {date}',
        editBtn:    'Edit →',
        needsVerify: '🔍 Needs price verification',
        editHint:    '💡 How to verify: Edit in Blogger → change at least 1 word/sentence/FAQ → Save & Publish → banner auto-hides'
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
      expired: { display: 'block', color: '#c2410c', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '8px', marginBottom: '12px', padding: '8px 12px', background: '#fff7ed', borderLeft: '4px solid #f97316', borderRadius: '4px', position: 'relative' },
      critical: { display: 'block', color: '#c2410c', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '8px', marginBottom: '12px', padding: '8px 12px', background: '#fff7ed', borderLeft: '4px solid #f97316', borderRadius: '4px', position: 'relative' },
      warning: { display: 'block', color: '#b45309', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '8px', marginBottom: '12px', padding: '8px 12px', background: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: '4px', position: 'relative' }
    }
  };

  // ============================================================
  // BASE RULES
  // ============================================================
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
  // CSS INJECTION (v17.5.9a base + v17.6.2 new guide styles)
  // ============================================================
  function injectWarningStyles() {
    if (document.getElementById('aed-warning-styles')) return;
    var style = document.createElement('style');
    style.id = 'aed-warning-styles';
    style.textContent = `
      @media (max-width: 640px) {
        #aed-update-warning { font-size: 0.82rem !important; padding: 6px 10px !important; margin-top: 6px !important; margin-bottom: 8px !important; }
        #aed-update-warning .aed-warning-full { display: none !important; }
        #aed-update-warning .aed-warning-compact { display: inline !important; }
        #aed-update-warning .aed-edit-link { font-size: 0.78rem !important; padding: 3px 8px !important; }
        #aed-update-warning .aed-mini-badge { font-size: 0.72rem !important; }
        #aed-update-warning .aed-edit-hint { font-size: 0.75rem !important; padding: 4px 8px !important; }
      }
      @media (min-width: 641px) { #aed-update-warning .aed-warning-compact { display: none !important; } }
      @media (prefers-color-scheme: dark) {
        #aed-update-warning[data-severity="warning"] { background: #1c1917 !important; color: #fbbf24 !important; border-left-color: #f59e0b !important; }
        #aed-update-warning[data-severity="expired"], #aed-update-warning[data-severity="critical"] { background: #1c1917 !important; color: #fb923c !important; border-left-color: #f97316 !important; }
        #aed-update-warning .aed-edit-link { background: #292524 !important; color: #fbbf24 !important; border-color: #f59e0b !important; }
        #aed-update-warning .aed-mini-badge { color: #9ca3af !important; border-top-color: rgba(255,255,255,0.1) !important; }
        #aed-update-warning .aed-edit-hint { background: #292524 !important; color: #fbbf24 !important; border-color: #f59e0b !important; }
      }
      #aed-update-warning[data-priority="critical"] { font-weight: 800 !important; border-left-width: 6px !important; }
      #aed-update-warning[data-priority="high"] { font-weight: 700 !important; border-left-width: 5px !important; }
      #aed-update-warning .aed-edit-link { display: inline-block; margin-left: 10px; padding: 4px 10px; background: #fff; color: #c2410c; border: 1px solid #f97316; border-radius: 4px; text-decoration: none; font-size: 0.8rem; font-weight: 600; transition: all 0.15s; }
      #aed-update-warning .aed-edit-link:hover { background: #f97316; color: #fff; }
      #aed-update-warning .aed-mini-badge { display: block; font-weight: normal; font-size: 0.78rem; opacity: 0.85; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(0, 0, 0, 0.08); letter-spacing: 0.01em; }
      #aed-update-warning .aed-edit-hint { display: block; margin-top: 8px; padding: 6px 10px; background: #fef3c7; border: 1px solid #fbbf24; border-radius: 4px; color: #78350f !important; font-size: 0.82rem; font-weight: 500; line-height: 1.4; text-align: left; }
      .aed-verify-badge { display: none !important; }

      /* 🆕 v17.6.2: GUIDE BUTTON */
      #aed-guide-btn-wrap { display: block; margin: 12px 0 16px 0; }
      #aed-guide-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: #eff6ff; color: #1e40af !important; border: 1px solid #93c5fd; border-radius: 6px; font-size: 0.82rem; font-weight: 600; cursor: pointer; font-family: system-ui, -apple-system, sans-serif; transition: all 0.15s; user-select: none; }
      #aed-guide-btn:hover { background: #dbeafe; border-color: #3b82f6; }
      #aed-guide-btn:active { transform: scale(0.98); }
      #aed-guide-hint { display: inline-block; margin-left: 10px; color: #16a34a; font-size: 0.78rem; font-weight: 600; vertical-align: middle; }
      @media (prefers-color-scheme: dark) {
        #aed-guide-btn { background: #1e3a8a !important; color: #93c5fd !important; border-color: #1e40af !important; }
        #aed-guide-btn:hover { background: #1e40af !important; }
        #aed-guide-hint { color: #4ade80 !important; }
      }

      /* 🆕 v17.6.2: GUIDE MODAL */
      #aed-guide-modal { position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 20px; }
      .aed-guide-backdrop { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px); }
      .aed-guide-content { position: relative; background: #fff; border-radius: 12px; max-width: 800px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); font-family: system-ui, -apple-system, sans-serif; }
      .aed-guide-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; border-bottom: 2px solid #e5e7eb; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px 12px 0 0; }
      .aed-guide-header h2 { margin: 0; color: #1e40af; font-size: 1.15rem; }
      .aed-guide-close { background: #ef4444; color: #fff; border: none; border-radius: 6px; width: 32px; height: 32px; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
      .aed-guide-close:hover { background: #dc2626; transform: rotate(90deg); }
      .aed-guide-body { padding: 20px 24px; overflow-y: auto; flex: 1; color: #374151; font-size: 0.9rem; line-height: 1.6; }
      .aed-guide-section { margin-bottom: 24px; }
      .aed-guide-section h3 { margin: 0 0 10px 0; padding-bottom: 6px; color: #1f2937; font-size: 1rem; border-bottom: 2px solid #e5e7eb; }
      .aed-guide-meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 16px; }
      .aed-guide-meta-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 12px; }
      .aed-guide-meta-label { color: #6b7280; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
      .aed-guide-meta-value { color: #111827; font-weight: 700; font-size: 0.9rem; margin-top: 2px; }
      .aed-guide-meta-value.status-fresh { color: #16a34a; }
      .aed-guide-meta-value.status-warning { color: #f59e0b; }
      .aed-guide-meta-value.status-expired { color: #dc2626; }
      .aed-guide-list { margin: 0; padding-left: 20px; }
      .aed-guide-list li { margin-bottom: 6px; }
      .aed-guide-issue-critical { background: #fef2f2; border-left: 4px solid #dc2626; padding: 10px 14px; border-radius: 4px; margin-bottom: 8px; color: #991b1b; }
      .aed-guide-issue-warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 10px 14px; border-radius: 4px; margin-bottom: 8px; color: #78350f; }
      .aed-guide-section-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
      .aed-guide-section-table th, .aed-guide-section-table td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
      .aed-guide-section-table th { background: #f3f4f6; font-weight: 700; color: #374151; }
      .aed-guide-section-table tr:nth-child(even) { background: #f9fafb; }
      .aed-guide-footer { padding: 14px 24px; border-top: 1px solid #e5e7eb; background: #f9fafb; border-radius: 0 0 12px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: #6b7280; }
      .aed-guide-footer-btn { padding: 8px 16px; background: #6b7280; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem; }
      .aed-guide-footer-btn:hover { background: #4b5563; }
      @media (prefers-color-scheme: dark) {
        .aed-guide-content { background: #1f2937; color: #e5e7eb; }
        .aed-guide-header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); }
        .aed-guide-header h2 { color: #93c5fd; }
        .aed-guide-body { color: #d1d5db; }
        .aed-guide-section h3 { color: #f3f4f6; border-bottom-color: #374151; }
        .aed-guide-meta-item { background: #111827; border-color: #374151; }
        .aed-guide-meta-label { color: #9ca3af; }
        .aed-guide-meta-value { color: #f3f4f6; }
        .aed-guide-section-table th { background: #111827; color: #e5e7eb; }
        .aed-guide-section-table td { border-color: #374151; }
        .aed-guide-section-table tr:nth-child(even) { background: #111827; }
        .aed-guide-issue-critical { background: #450a0a; color: #fca5a5; }
        .aed-guide-issue-warning { background: #451a03; color: #fcd34d; }
        .aed-guide-footer { background: #111827; border-top-color: #374151; }
      }
      @media (max-width: 640px) {
        .aed-guide-content { max-height: 95vh; border-radius: 8px; }
        .aed-guide-header { padding: 14px 16px; }
        .aed-guide-header h2 { font-size: 1rem; }
        .aed-guide-body { padding: 16px; font-size: 0.85rem; }
        .aed-guide-section-table { font-size: 0.78rem; }
        .aed-guide-section-table th, .aed-guide-section-table td { padding: 6px 8px; }
      }

      .aed-author-byline { display: inline-flex !important; align-items: center !important; gap: 8px; font-size: 0.9rem; color: #4b5563; margin: 8px 0 !important; font-family: system-ui, -apple-system, sans-serif; line-height: 1.4; white-space: nowrap; flex-wrap: wrap; }
      .aed-author-byline .aed-author-avatar { display: inline-block !important; width: 22px; height: 22px; border-radius: 50%; background: #ea580c; color: #fff; font-size: 0.72rem; font-weight: 700; text-align: center; line-height: 22px; flex-shrink: 0; margin-right: 6px !important; vertical-align: middle; }
      .aed-author-byline .aed-author-label { color: #6b7280; font-weight: 400; margin-right: 6px !important; vertical-align: middle; }
      .aed-author-byline a.aed-author-name { color: #ea580c; text-decoration: none; font-weight: 600; }
      .aed-author-byline a.aed-author-name:hover { text-decoration: underline; }
      [data-aed-author-enhanced="true"] { display: inline-block; }
      [data-aed-hidden="true"], [data-aed-hidden="partial"], [data-aed-hidden="full"] { display: none !important; }
      @media (prefers-color-scheme: dark) { .aed-author-byline { color: #9ca3af; } .aed-author-byline .aed-author-label { color: #6b7280; } .aed-author-byline a.aed-author-name { color: #fb923c; } }
      @media (max-width: 640px) { .aed-author-byline { font-size: 0.82rem; gap: 6px; } .aed-author-byline .aed-author-avatar { width: 18px; height: 18px; line-height: 18px; font-size: 0.65rem; margin-right: 4px !important; } .aed-author-byline .aed-author-label { margin-right: 4px !important; } }
    `;
    document.head.appendChild(style);
    console.log('✅ [AED] Styles injected (v17.6.2)');
  }

  // ============================================================
  // VALIDITY
  // ============================================================
  function getValidityByContext(pageLevel, contentFocus) {
    var focus = String(contentFocus || '').toUpperCase();
    var isMoney = MONEY_LEVELS.indexOf(pageLevel) !== -1;
    if (isMoney) {
      if (focus === 'HARGA' || focus === 'GABUNG') return 180;
      if (focus === 'COMMERCIAL') return 180;
      if (focus === 'INFORMASI') return 365;
      if (pageLevel === 'variant' || pageLevel === 'sub-variant') return 180;
      return 180;
    }
    var rule = BASE_PAGE_LEVEL_RULES[pageLevel];
    return rule ? rule.validityDays : 180;
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
    const pad = (n) => (n < 10 ? '0' : '') + n;
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${offset}`;
  }

  function formatTanggalIndo(dateStr) {
    if (!dateStr) return '';
    var bulan = ['Januari','Februari','Maret','April','Mei','Juni',
                 'Juli','Agustus','September','Oktober','November','Desember'];
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.getDate() + ' ' + bulan[d.getMonth()] + ' ' + d.getFullYear();
  }

  // ============================================================
  // INLINE WARNING
  // ============================================================
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

    let severity = null, messageKey = null, messageReplace = null;

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
      pageLevel, contentFocus, severity, priority, daysDiff, validityDays,
      threshold: warningThreshold,
      stuck: (severity === 'expired' && Math.abs(daysDiff) > WARNING_CONFIG.STUCK_THRESHOLD_DAYS),
      timestamp: new Date().toISOString()
    };
    console.log('📊 [AED Analytics]', JSON.stringify(analyticsSummary));

    if (severity === 'expired' && Math.abs(daysDiff) > WARNING_CONFIG.STUCK_THRESHOLD_DAYS) {
      console.warn('🚨 [AED WARNING STUCK]', Math.abs(daysDiff), 'hari');
      document.body.setAttribute('data-aed-warning-stuck', 'true');
      document.body.setAttribute('data-aed-warning-stuck-days', String(Math.abs(daysDiff)));
    }

    document.body.setAttribute('data-aed-warning-severity', severity);
    document.body.setAttribute('data-aed-warning-days', String(daysDiff));
    document.body.setAttribute('data-aed-warning-priority', priority);

    var message = getMessage(messageKey, messageReplace);
    console.log('ℹ️ [AED Warning]', message, '| priority:', priority);

    createWarningElement(message, severity, priority, daysDiff, modifiedStr, pageLevel, contentFocus);
  }

  function createWarningElement(message, severity, priority, daysDiff, modifiedStr, pageLevel, contentFocus) {
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

    if (isAdmin()) {
      var editHint = document.createElement('span');
      editHint.className = 'aed-edit-hint';
      editHint.setAttribute('data-nosnippet', '');
      editHint.textContent = getMessage('editHint');
      warning.appendChild(editHint);
    }

    if (WARNING_CONFIG.MINI_BADGE_ENABLED && modifiedStr && modifiedStr !== 'unknown') {
      var modText = formatTanggalIndo(modifiedStr);
      if (modText) {
        var miniBadge = document.createElement('span');
        miniBadge.className = 'aed-mini-badge';
        miniBadge.setAttribute('data-nosnippet', '');
        miniBadge.setAttribute('data-source', 'dateModified');
        miniBadge.textContent = getMessage('miniBadge', { date: modText });
        warning.appendChild(miniBadge);
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
    console.log('✅ [AED Warning] Ditambahkan — severity:', severity, '| priority:', priority);
  }

  // ============================================================
  // AUTHOR BYLINE (Preserved 100% dari v17.5.9a)
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

  function hideExistingBylineNearH1() {
    var h1 = document.querySelector('h1');
    if (!h1) return 0;
    var h1Rect = h1.getBoundingClientRect();
    var hidden = 0;

    var CONTAINER_SELECTORS = [
      '.title-secondary', '.post-header-line-1', '.post-header',
      '.post-meta', '.entry-meta', '.post-info', '.byline', 'address'
    ];

    for (var i = 0; i < CONTAINER_SELECTORS.length; i++) {
      var containers = document.querySelectorAll(CONTAINER_SELECTORS[i]);
      for (var j = 0; j < containers.length; j++) {
        var parent = containers[j];
        if (isInsideExclude(parent)) continue;
        if (parent.getAttribute('data-aed-hidden')) continue;
        if (parent.querySelector('.aed-author-byline')) continue;

        var rect = parent.getBoundingClientRect();
        if (rect.top < h1Rect.top - 50) continue;
        if (rect.top > h1Rect.bottom + 400) continue;

        var hasAuthorEl = parent.querySelector('.post-author, .vcard, [itemprop="author"], .g-profile');
        var hasByText = /\b(by|oleh)\b/i.test(parent.innerText || '');
        if (!hasAuthorEl && !hasByText) continue;

        var hasTimestamp = parent.querySelector('.post-timestamp, [itemprop="datePublished"], time, .timestamp-link');
        var hasComments = parent.querySelector('.post-comment-link, .comment-link');
        var hasLabels = parent.querySelector('.post-labels, .entry-labels');

        if (!hasTimestamp && !hasComments && !hasLabels) {
          parent.style.display = 'none';
          parent.setAttribute('data-aed-hidden', 'full');
          hidden++;
          break;
        }

        parent.querySelectorAll('.post-author, .vcard, [itemprop="author"]').forEach(function(el) {
          if (el.querySelector && el.querySelector('.aed-author-byline')) return;
          el.style.display = 'none';
          el.setAttribute('data-aed-hidden', 'true');
        });

        parent.querySelectorAll('.fa-user, i.fa-user, span[class*="fa-user"], .fa-user-o, .fa-user-circle')
          .forEach(function(ic) {
            if (ic.querySelector && ic.querySelector('.aed-author-byline')) return;
            ic.style.display = 'none';
            ic.setAttribute('data-aed-hidden', 'true');
          });

        var walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT, null, false);
        var textNodes = [];
        var n;
        while (n = walker.nextNode()) textNodes.push(n);
        textNodes.forEach(function(tnode) {
          var parentEl = tnode.parentElement;
          if (parentEl && parentEl.querySelector && parentEl.querySelector('.aed-author-byline')) return;
          if (/^\s*(by|oleh)[\s:.\-]*$/i.test(tnode.textContent)) {
            tnode.textContent = '';
          }
        });

        parent.querySelectorAll('span, em, i, b, small').forEach(function(el) {
          if (el.getAttribute('data-aed-hidden') === 'true') return;
          if (el.querySelector && el.querySelector('.aed-author-byline')) return;
          var ownText = '';
          for (var c = 0; c < el.childNodes.length; c++) {
            if (el.childNodes[c].nodeType === 3) ownText += el.childNodes[c].textContent;
          }
          ownText = normalizeBylineText(ownText);
          if (/^(by|oleh)[:.\s\-|]*$/i.test(ownText)) {
            el.style.display = 'none';
            el.setAttribute('data-aed-hidden', 'true');
          }
        });

        parent.setAttribute('data-aed-hidden', 'partial');
        hidden++;
        break;
      }
      if (hidden > 0) break;
    }

    return hidden;
  }

  function injectAuthorByline() {
    if (!AUTHOR_BYLINE_CONFIG.ENABLED) return;

    var isPost = /\/\d{4}\/\d{2}\//.test(window.location.pathname);
    var mode = isPost ? 'POST' : 'PAGE';

    if (document.querySelector('.aed-author-byline')) return;

    var bylineEl = findExistingByline();

    if (bylineEl) {
      var currentText = normalizeBylineText(bylineEl.innerText);
      var broken = isBrokenByline(currentText);

      if (!broken && !AUTHOR_BYLINE_CONFIG.ALWAYS_REPLACE) {
        console.log('✅ [AED Author] Byline sudah bagus:', JSON.stringify(currentText));
        return;
      }

      var newByline = buildAuthorByline();
      bylineEl.innerHTML = '';
      bylineEl.appendChild(newByline);
      bylineEl.setAttribute('data-aed-author-enhanced', 'true');
      console.log('✅ [AED Author] Enhanced byline di ' + mode);
      return;
    }

    hideExistingBylineNearH1();

    var h1 = document.querySelector('h1');
    if (h1) {
      var newByline2 = buildAuthorByline();
      h1.parentNode.insertBefore(newByline2, h1.nextSibling);
      console.log('✅ [AED Author] Byline di-inject setelah H1 (' + mode + ')');
    }
  }

  // ============================================================
  // HTML ENTITIES + FAQ SCHEMA
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
  // H1 DETECTION
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
      const text = (el.innerText || '').toLowerCase();
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

  function updateJsonLdDates(dateModified, priceValidUntilOrNextUpdate) {
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
            if (offer && offer.priceValidUntil !== undefined) {
              offer.priceValidUntil = priceValidUntilOrNextUpdate; changed = true;
            }
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

  // ============================================================
  // CONTENT HASH DETECTION
  // ============================================================
  function detectContentChangeSinceLastVisit() {
    var container = document.querySelector('.post-body.entry-content, .post-body, article, main');
    if (!container) return { changed: false, reason: 'no-container' };

    var text = (container.innerText || '').replace(/\s+/g, ' ').trim();
    if (text.length < 100) return { changed: false, reason: 'too-short' };

    var hash = 0;
    for (var i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash = hash | 0;
    }
    var currentHash = String(Math.abs(hash));

    var storageKey = 'aed-content-hash-' + location.pathname;
    var storedHash = null;
    try { storedHash = localStorage.getItem(storageKey); } catch (e) {}

    var changed = false;
    if (storedHash && storedHash !== currentHash) {
      changed = true;
      console.log('🔍 [AED] 📝 KONTEN BERUBAH — hash:', storedHash, '→', currentHash);
    } else if (!storedHash) {
      console.log('🆕 [AED] First visit — hash disimpan:', currentHash);
    }

    try { localStorage.setItem(storageKey, currentHash); } catch (e) {}
    return { changed: changed, reason: changed ? 'content-changed' : 'same', hash: currentHash };
  }

  // ============================================================
  // AUTO UPDATE DATES
  // ============================================================
  function autoUpdateDates(pageLevel, contentFocus, options) {
    options = options || {};
    let metaModified = document.querySelector('meta[itemprop="dateModified"]');
    let metaNext = document.querySelector('meta[name="nextUpdate"]');
    let metaPublished = document.querySelector('meta[itemprop="datePublished"]');
    let currentNext = metaNext ? metaNext.getAttribute('content') : null;
    if (!currentNext) return false;

    const now = new Date();
    const nextDate = new Date(currentNext);
    if (!options.forceBump && now < nextDate) return false;

    const focus = String(contentFocus || '').toUpperCase();
    if ((focus === 'HARGA' || focus === 'GABUNG') && !options.forceBump) {
      console.warn('⏸️ [AED] HARGA expired — auto-update SKIP (butuh verify manual via edit konten)');
      document.body.setAttribute('data-aed-needs-review', 'true');
      document.body.setAttribute('data-aed-review-reason', 'harga-manual-verify-required');
      return false;
    }

    if (options.forceBump) {
      console.log('🔧 [AED] forceBump=true — bypass expiry & guard (content changed)');
    }

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

  // ============================================================
  // PROCESS META DATES
  // ============================================================
  async function processMetaDates(customDateModified, finalType, validityMs, usePriceValidUntil, pageLevel, entityType, ctaIntensity, allowPriceRange, detectorVersion, confidence, strategies, strategyCount, isOverridden, overrideReason, h1Detection, contentFocus, autoUpdated) {
    let metaPublished = document.querySelector('meta[itemprop="datePublished"]');
    let metaModified = document.querySelector('meta[itemprop="dateModified"]');
    let metaNext = document.querySelector('meta[name="nextUpdate"]');

    const isFirstInit = !(metaModified && metaModified.getAttribute('content'));
    const hasCustomDate = customDateModified !== null && customDateModified !== undefined;
    const hasIllegalFaqProps = detectIllegalFaqProps();

    const nowISO = new Date().toISOString();
    let datePublished = toISOWithTimezoneLocal(metaPublished ? metaPublished.content : null) || toISOWithTimezoneLocal(nowISO);
    let dateModified = toISOWithTimezoneLocal(customDateModified) || toISOWithTimezoneLocal(metaModified ? metaModified.content : null) || datePublished;
    if (new Date(dateModified) < new Date(datePublished)) dateModified = datePublished;

    if (!metaPublished) { metaPublished = document.createElement("meta"); metaPublished.setAttribute("itemprop", "datePublished"); document.head.appendChild(metaPublished); }
    metaPublished.setAttribute("content", datePublished);
    if (!metaModified) { metaModified = document.createElement("meta"); metaModified.setAttribute("itemprop", "dateModified"); document.head.appendChild(metaModified); }
    metaModified.setAttribute("content", dateModified);

    const focus = String(contentFocus || '').toUpperCase();
    const isPriceManual = (focus === 'HARGA' || focus === 'GABUNG');
    const nowLocal = new Date();
    const naturalNextUpdateMs = new Date(dateModified).getTime() + validityMs;
    const isPriceExpired = isPriceManual && (naturalNextUpdateMs < nowLocal.getTime());

    let nextUpdate, priceValidUntil;
    if (isPriceExpired) {
      nextUpdate = toISOWithTimezoneLocal(new Date(naturalNextUpdateMs));
      priceValidUntil = toISOWithTimezoneLocal(new Date(nowLocal.getTime() + validityMs));
      console.warn('⏸️ [AED] HARGA expired — nextUpdate tetap, priceValidUntil extend:', priceValidUntil);
      console.warn('💡 [AED] SOLUSI: Edit halaman di Blogger + ubah minimal 1 kata/kalimat/FAQ → Save & Publish');
      document.body.setAttribute('data-aed-needs-review', 'true');
      document.body.setAttribute('data-aed-review-reason', 'harga-manual-verify-required');
    } else {
      nextUpdate = toISOWithTimezoneLocal(new Date(naturalNextUpdateMs));
      priceValidUntil = nextUpdate;
      if (document.body.hasAttribute('data-aed-needs-review')) {
        document.body.removeAttribute('data-aed-needs-review');
        document.body.removeAttribute('data-aed-review-reason');
        console.log('✅ [AED] HARGA verified — needs-review flag cleared');
      }
    }

    if (!metaNext) { metaNext = document.createElement("meta"); metaNext.setAttribute("name", "nextUpdate"); document.head.appendChild(metaNext); }
    metaNext.setAttribute("content", nextUpdate);

    const shouldRefresh = autoUpdated === true || isFirstInit || hasCustomDate || hasIllegalFaqProps || isPriceExpired;

    if (shouldRefresh) {
      updateJsonLdDates(dateModified, priceValidUntil);
      cleanupFaqSchema(resolveBrandName());
      updateJsonLdFaqYears(new Date().getFullYear());
    }

    if (usePriceValidUntil && h1Detection && h1Detection.isPrice) {
      document.querySelectorAll('[itemtype="http://schema.org/Offer"]').forEach(el => el.setAttribute("priceValidUntil", priceValidUntil));
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
      datePublished, dateModified, nextUpdate, priceValidUntil,
      validityDays: validityMs / 86400000,
      usePriceValidUntil, ctaIntensity, allowPriceRange,
      detectorVersion: detectorVersion || 'v17.6.2',
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
      needsManualVerify: isPriceExpired,
      lastAutoUpdate: null,
      updateCount: 0
    };
    window.EvergreenDetectorResults = window.AEDMetaDates;

    console.log(`✅ ${finalType.toUpperCase()} ACTIVE | level=${pageLevel} | entity=${entityType} | focus=${contentFocus} | needsVerify=${isPriceExpired}`);
  }

  function getPageLevelAndEntityType() {
    let pageLevel = 'pillar', entityType = 'produk', detectorVersion = 'unknown';
    let confidence = null, strategies = null, strategyCount = null;

    const bodyLevel = document.body.getAttribute('data-page-level');
    const bodyEntity = document.body.getAttribute('data-entity-type');
    if (bodyLevel && bodyEntity) {
      const pldVer = getPLDVersion();
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

  function logFinalAnalytics(pageLevel, entityType, contentFocus, finalType, validityDays, autoUpdated, contentCheck) {
    var summary = {
      url: window.location.pathname,
      pageLevel, entityType, contentFocus, finalType, validityDays,
      autoUpdated: autoUpdated === true,
      contentChanged: contentCheck ? contentCheck.changed : false,
      contentChangeReason: contentCheck ? contentCheck.reason : null,
      needsManualVerify: (document.body.getAttribute('data-aed-needs-review') === 'true'),
      priority: getPriority(pageLevel, contentFocus),
      locale: detectLocale(),
      isAdmin: isAdmin(),
      timestamp: new Date().toISOString(),
      aedVersion: '17.6.2'
    };
    console.log('📊 [AED Final Analytics]', JSON.stringify(summary));
  }

  // ============================================================
  // 🆕 v17.6.2: ANALYZE PAGE CONTENT
  // ============================================================
  function analyzePageContent() {
    var container = document.querySelector('.post-body.entry-content, .post-body, article, main') || document.body;
    var text = container.innerText || '';
    var h1 = document.querySelector('h1');
    var h1Text = h1 ? (h1.innerText || '').trim() : '';
    var h1YearMatch = h1Text.match(/\b(19|20)\d{2}\b/);
    var h1Year = h1YearMatch ? parseInt(h1YearMatch[0], 10) : null;
    var currentYear = new Date().getFullYear();
    var h1YearOutdated = h1Year && h1Year < currentYear;

    var allYears = text.match(/\b(19|20)\d{2}\b/g) || [];
    var uniqueYears = Array.from(new Set(allYears.map(Number)));
    var outdatedYears = uniqueYears.filter(function(y) { return y >= 2020 && y < currentYear; });

    var hasFaq = false;
    var faqSelectors = ['[itemtype*="FAQ"]', '[itemprop="mainEntity"]', '.faq', '[class*="faq"]', '[id*="faq"]'];
    for (var i = 0; i < faqSelectors.length; i++) {
      try { if (document.querySelector(faqSelectors[i])) { hasFaq = true; break; } } catch (e) {}
    }
    var faqCount = 0;
    var faqQRegex = /\b(?:T\s*[:.]|\bQ\s*:)/g;
    var faqMatches = text.match(faqQRegex) || [];
    faqCount = faqMatches.length;
    if (faqCount === 0 && hasFaq) {
      var qmarks = text.match(/\?/g) || [];
      faqCount = Math.min(qmarks.length, 20);
    }

    var priceMatches = text.match(/Rp\s*[\d.,]+/gi) || [];
    var hasPrice = priceMatches.length > 0;
    var priceCount = priceMatches.length;

    var hasWA = false;
    try {
      if (document.querySelector('a[href*="wa.me"], a[href*="whatsapp"], a[href*="wa.link"]')) hasWA = true;
    } catch (e) {}
    if (!hasWA && /628\d{8,}|62\s*8\d{2}[\s-]?\d{4}/.test(text)) hasWA = true;

    var tableCount = 0;
    try { tableCount = document.querySelectorAll('.post-body table, article table').length; } catch (e) {}
    var hasTable = tableCount > 0;

    var wordCount = text.trim().split(/\s+/).length;
    var h2Count = 0, h3Count = 0;
    try {
      h2Count = document.querySelectorAll('.post-body h2, article h2').length;
      h3Count = document.querySelectorAll('.post-body h3, article h3').length;
    } catch (e) {}

    return {
      h1Text: h1Text, h1Year: h1Year, h1YearOutdated: h1YearOutdated,
      currentYear: currentYear, uniqueYears: uniqueYears, outdatedYears: outdatedYears,
      hasFaq: hasFaq, faqCount: faqCount, hasPrice: hasPrice, priceCount: priceCount,
      hasWA: hasWA, hasTable: hasTable, tableCount: tableCount,
      wordCount: wordCount, h2Count: h2Count, h3Count: h3Count
    };
  }

  // ============================================================
  // 🆕 v17.6.2: GENERATE PAGE GUIDE
  // ============================================================
  function generatePageGuide(pageLevel, contentFocus, finalType, validityDays, daysUntilReview) {
    var a = analyzePageContent();
    var guide = {
      meta: {
        pageLevel: pageLevel, contentFocus: contentFocus, finalType: finalType,
        validityDays: validityDays, daysUntilReview: daysUntilReview,
        status: daysUntilReview > 21 ? 'FRESH' : (daysUntilReview > 0 ? 'WARNING' : 'EXPIRED')
      },
      issues: [], priorityActions: [], sectionGuide: [], minimalChanges: [], checklist: []
    };

    if (a.h1YearOutdated) guide.issues.push({ level: 'critical', text: 'Tahun di H1 (' + a.h1Year + ') usang. Current: ' + a.currentYear + '.' });
    if (a.outdatedYears.length > 0) guide.issues.push({ level: 'warning', text: 'Tahun usang di konten: ' + a.outdatedYears.join(', ') });
    if ((contentFocus === 'HARGA' || contentFocus === 'GABUNG') && !a.hasPrice) guide.issues.push({ level: 'critical', text: 'Tidak ada harga (Rp...) padahal content focus = HARGA.' });
    if (!a.hasWA && pageLevel.indexOf('money') === 0) guide.issues.push({ level: 'warning', text: 'Nomor WA/telepon tidak terdeteksi.' });
    if (a.faqCount < 3) guide.issues.push({ level: 'warning', text: 'FAQ terdeteksi hanya ' + a.faqCount + ' (ideal ≥ 3).' });
    if (!a.hasTable && pageLevel.indexOf('money') === 0) guide.issues.push({ level: 'warning', text: 'Tidak ada tabel — idealnya ada tabel harga/spesifikasi.' });
    if (a.wordCount < 500) guide.issues.push({ level: 'warning', text: 'Konten tipis: ' + a.wordCount + ' kata (ideal ≥ 500).' });
    if (daysUntilReview < 0) guide.issues.push({ level: 'critical', text: '🚨 EXPIRED ' + Math.abs(daysUntilReview) + ' hari. Action required.' });

    if (pageLevel === 'pillar' || pageLevel === 'sub-pillar-tipe-1' || pageLevel === 'sub-pillar-tipe-2') {
      guide.priorityActions = [
        '✅ Verify topik masih relevan dengan trend ' + a.currentYear + '.',
        '✅ Cek standar/regulasi (SNI, PUPR) masih update.',
        '💡 Tambah 1 FAQ dari pertanyaan pembaca terbaru.',
        '💡 Update contoh kasus dengan data ' + a.currentYear + '.'
      ];
    } else if (pageLevel.indexOf('money') === 0) {
      var levelLabel = { 'money-master': 'Range harga per mutu + wilayah', 'money-page': 'Harga fixed 1 produk', 'money-child': 'Harga fixed + wilayah (PALING KRITIS)', 'variant': 'Spesifikasi + harga varian', 'sub-variant': 'Spesifikasi + harga sub-varian' };
      guide.priorityActions = [
        '🚨 Verify harga dengan supplier real-time.',
        '🚨 Cek stok/varian masih tersedia.',
        '🚨 Cek nomor WA/telepon masih aktif.',
        '✅ Cek syarat order (min order, ongkir, PPN) masih sama.',
        '📌 Level: ' + (levelLabel[pageLevel] || pageLevel)
      ];
    } else {
      guide.priorityActions = ['✅ Verify panduan masih akurat.', '💡 Tambah 1 FAQ baru.'];
    }

    guide.sectionGuide = [
      { section: 'H1', action: a.h1YearOutdated ? '🚨 UPDATE — tahun ' + a.h1Year + ' usang' : '✅ Cek masih relevan' },
      { section: 'Intro paragraf', action: '✅ Cek akurat, tambah 1 kalimat konteks ' + a.currentYear },
      { section: 'Harga', action: a.hasPrice ? '✅ ' + a.priceCount + ' harga terdeteksi — verify real-time' : '⚠️ Tidak ada harga — tambahkan' },
      { section: 'Spesifikasi', action: '✅ Cek standar (SNI) masih berlaku' },
      { section: 'FAQ', action: a.faqCount < 3 ? '💡 Tambah (' + a.faqCount + ' → 3+)' : '✅ Cukup (' + a.faqCount + ' item)' },
      { section: 'Tabel', action: a.hasTable ? '✅ ' + a.tableCount + ' tabel terdeteksi' : '💡 Tambahkan tabel harga/spesifikasi' },
      { section: 'Kontak WA', action: a.hasWA ? '✅ WA terdeteksi' : '⚠️ Tidak ada WA — tambahkan' },
      { section: 'Schema JSON-LD', action: '✅ Auto-update via AED' },
      { section: 'Internal link', action: '✅ Cek tidak broken, tambah 1 link ke halaman baru' }
    ];

    if (contentFocus === 'HARGA' || contentFocus === 'GABUNG') {
      guide.minimalChanges = [
        '1. Update "Berlaku per [bulan] ' + a.currentYear + '" di paragraf pembuka.',
        '2. Tambah 1 FAQ dari pertanyaan CS bulan ini.',
        '3. Update tanggal "Terakhir diperbarui: [bulan] ' + a.currentYear + '" di body (kalau ada).',
        '4. Tambah 1 testimoni pelanggan terbaru (nama + wilayah + proyek).',
        '5. Reorder FAQ: taruh yang paling sering ditanya di atas.'
      ];
    } else if (pageLevel === 'pillar' || pageLevel.indexOf('sub-pillar') === 0) {
      guide.minimalChanges = [
        '1. Tambah 1 FAQ baru (paling ringan & aman).',
        '2. Update statistik/contoh kasus dengan data ' + a.currentYear + '.',
        '3. Update screenshot/gambar ke versi terbaru.',
        '4. Cek internal link — tambah 1 link ke halaman baru.'
      ];
    } else {
      guide.minimalChanges = [
        '1. Tambah 1 FAQ baru.',
        '2. Update contoh/kasus dengan data ' + a.currentYear + '.'
      ];
    }

    guide.checklist = [
      '□ Buka halaman di browser — verify tampilan normal',
      '□ Cek harga dengan supplier (WA/telp) — sama atau berubah?',
      '□ Cek nomor WA/telepon masih aktif',
      '□ Cek stok/varian masih tersedia',
      '□ Cek wilayah layanan masih sama',
      '□ Cek syarat order (min order, ongkir, PPN)',
      '□ Buka Blogger editor — edit minimal 1 elemen',
      '□ Save & Publish',
      '□ Reload halaman → banner hilang ✅'
    ];

    return guide;
  }

  // ============================================================
  // 🆕 v17.6.2: SHOW GUIDE MODAL
  // ============================================================
  function showGuideModal(guide) {
    var existing = document.getElementById('aed-guide-modal');
    if (existing) existing.remove();

    var statusClass = guide.meta.status === 'FRESH' ? 'status-fresh' : (guide.meta.status === 'WARNING' ? 'status-warning' : 'status-expired');

    var issuesHtml = guide.issues.length > 0
      ? guide.issues.map(function(i) { return '<div class="aed-guide-issue-' + i.level + '">' + i.text + '</div>'; }).join('')
      : '<p style="color:#16a34a;font-weight:600;">✅ Tidak ada issue signifikan terdeteksi. Halaman dalam kondisi baik.</p>';

    var priorityHtml = '<ul class="aed-guide-list">' + guide.priorityActions.map(function(p) { return '<li>' + p + '</li>'; }).join('') + '</ul>';

    var sectionTableHtml = '<table class="aed-guide-section-table"><thead><tr><th>Section</th><th>Action</th></tr></thead><tbody>' +
      guide.sectionGuide.map(function(s) { return '<tr><td><strong>' + s.section + '</strong></td><td>' + s.action + '</td></tr>'; }).join('') +
      '</tbody></table>';

    var minimalHtml = '<ul class="aed-guide-list">' + guide.minimalChanges.map(function(c) { return '<li>' + c + '</li>'; }).join('') + '</ul>';
    var checklistHtml = '<div style="font-family:monospace;font-size:0.85rem;line-height:1.8;">' + guide.checklist.map(function(c) { return c.replace('□', '<span style="color:#9ca3af;">□</span>'); }).join('<br>') + '</div>';

    var modal = document.createElement('div');
    modal.id = 'aed-guide-modal';
    modal.setAttribute('data-nosnippet', '');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    modal.innerHTML =
      '<div class="aed-guide-backdrop" data-aed-close="1"></div>' +
      '<div class="aed-guide-content">' +
        '<div class="aed-guide-header">' +
          '<h2>' + GUIDE_CONFIG.MODAL_TITLE + '</h2>' +
          '<button class="aed-guide-close" data-aed-close="1" aria-label="Close">✕</button>' +
        '</div>' +
        '<div class="aed-guide-body">' +
          '<div class="aed-guide-section">' +
            '<h3>📊 Summary</h3>' +
            '<div class="aed-guide-meta">' +
              '<div class="aed-guide-meta-item"><div class="aed-guide-meta-label">Page Level</div><div class="aed-guide-meta-value">' + guide.meta.pageLevel + '</div></div>' +
              '<div class="aed-guide-meta-item"><div class="aed-guide-meta-label">Content Focus</div><div class="aed-guide-meta-value">' + guide.meta.contentFocus + '</div></div>' +
              '<div class="aed-guide-meta-item"><div class="aed-guide-meta-label">Type</div><div class="aed-guide-meta-value">' + guide.meta.finalType + '</div></div>' +
              '<div class="aed-guide-meta-item"><div class="aed-guide-meta-label">Validity</div><div class="aed-guide-meta-value">' + guide.meta.validityDays + ' hari</div></div>' +
              '<div class="aed-guide-meta-item"><div class="aed-guide-meta-label">Status</div><div class="aed-guide-meta-value ' + statusClass + '">' + guide.meta.status + '</div></div>' +
              '<div class="aed-guide-meta-item"><div class="aed-guide-meta-label">Next Review</div><div class="aed-guide-meta-value">' + (guide.meta.daysUntilReview > 0 ? guide.meta.daysUntilReview + ' hari lagi' : 'Expired ' + Math.abs(guide.meta.daysUntilReview) + ' hari') + '</div></div>' +
            '</div>' +
          '</div>' +
          '<div class="aed-guide-section"><h3>🚨 Issues Terdeteksi</h3>' + issuesHtml + '</div>' +
          '<div class="aed-guide-section"><h3>🎯 Priority Actions</h3>' + priorityHtml + '</div>' +
          '<div class="aed-guide-section"><h3>📋 Panduan per Section</h3>' + sectionTableHtml + '</div>' +
          '<div class="aed-guide-section"><h3>💡 Minimal Changes (kalau fakta masih sama)</h3>' + minimalHtml + '</div>' +
          '<div class="aed-guide-section"><h3>✅ Checklist Eksekusi</h3>' + checklistHtml + '</div>' +
          '<div class="aed-guide-section">' +
            '<h3>🚨 Emergency Option</h3>' +
            '<div class="aed-guide-issue-warning">⚠️ <strong>LAST RESORT:</strong> <code>aedEmergencyVerify(null, { confirm: true })</code> — tidak persist ke server. Gunakan hanya kalau akses Blogger bermasalah.</div>' +
          '</div>' +
        '</div>' +
        '<div class="aed-guide-footer">' +
          '<span>Dibuat: ' + new Date().toLocaleString('id-ID') + '</span>' +
          '<button class="aed-guide-footer-btn" data-aed-close="1">Tutup</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    modal.querySelectorAll('[data-aed-close]').forEach(function(el) {
      el.addEventListener('click', closeGuideModal);
    });

    if (!window._aedGuideEscHandler) {
      window._aedGuideEscHandler = function(e) {
        if (e.key === 'Escape') closeGuideModal();
      };
      document.addEventListener('keydown', window._aedGuideEscHandler);
    }
    console.log('✅ [AED Guide] Modal terbuka');
  }

  function closeGuideModal() {
    var modal = document.getElementById('aed-guide-modal');
    if (modal) modal.remove();
    document.body.style.overflow = '';
    if (window._aedGuideEscHandler) {
      document.removeEventListener('keydown', window._aedGuideEscHandler);
      window._aedGuideEscHandler = null;
    }
  }

  // ============================================================
  // 🆕 v17.6.2: GUIDE BUTTON (3-click)
  // ============================================================
  var _guideClickCount = 0;
  var _guideClickTimer = null;

  function handleGuideButtonClick() {
    _guideClickCount++;
    var hint = document.getElementById('aed-guide-hint');
    if (_guideClickTimer) clearTimeout(_guideClickTimer);

    if (_guideClickCount === 1) {
      if (hint) hint.textContent = GUIDE_CONFIG.BUTTON_HINT_1;
      _guideClickTimer = setTimeout(function() { _guideClickCount = 0; if (hint) hint.textContent = ''; }, GUIDE_CONFIG.CLICK_RESET_MS);
    } else if (_guideClickCount === 2) {
      if (hint) hint.textContent = GUIDE_CONFIG.BUTTON_HINT_2;
      _guideClickTimer = setTimeout(function() { _guideClickCount = 0; if (hint) hint.textContent = ''; }, GUIDE_CONFIG.CLICK_RESET_MS);
    } else if (_guideClickCount >= GUIDE_CONFIG.CLICKS_TO_OPEN) {
      _guideClickCount = 0;
      if (hint) hint.textContent = '';
      openGuideFromCurrentPage();
    }
  }

  function openGuideFromCurrentPage() {
    var pageLevel = document.body.getAttribute('data-page-level') || 'pillar';
    var contentFocus = document.body.getAttribute('data-content-focus') || 'INFORMASI';
    var finalType = (document.body.getAttribute('data-content-type') || (EVERGREEN_LEVELS.indexOf(pageLevel) !== -1 ? 'evergreen' : 'non-evergreen'));
    var validityDays = getValidityByContext(pageLevel, contentFocus);
    var metaNext = document.querySelector('meta[name="nextUpdate"]');
    var daysUntilReview = metaNext ? Math.ceil((new Date(metaNext.content) - new Date()) / 86400000) : 0;
    var guide = generatePageGuide(pageLevel, contentFocus, finalType, validityDays, daysUntilReview);
    showGuideModal(guide);
  }

  function injectGuideButton() {
    if (!GUIDE_CONFIG.ENABLED) return;
    if (GUIDE_CONFIG.ADMIN_ONLY && !isAdmin()) return;
    if (document.getElementById('aed-guide-btn')) return;

    var h1 = document.querySelector('h1');
    if (!h1) return;

    var wrap = document.createElement('div');
    wrap.id = 'aed-guide-btn-wrap';
    wrap.setAttribute('data-nosnippet', '');

    var btn = document.createElement('button');
    btn.id = 'aed-guide-btn';
    btn.type = 'button';
    btn.setAttribute('data-nosnippet', '');
    btn.setAttribute('aria-label', 'Buka panduan update halaman');
    btn.textContent = GUIDE_CONFIG.BUTTON_TEXT;
    btn.addEventListener('click', handleGuideButtonClick);

    var hint = document.createElement('span');
    hint.id = 'aed-guide-hint';
    hint.setAttribute('data-nosnippet', '');

    wrap.appendChild(btn);
    wrap.appendChild(hint);
    h1.parentNode.insertBefore(wrap, h1.nextSibling);
    console.log('✅ [AED Guide] Button injected di bawah H1');
  }

  // ============================================================
  // 🆕 v17.6.2: ENTER KEY ADMIN TRIGGER (3x)
  // ============================================================
  function initAdminKeyboardShortcut() {
    var count = 0;
    var timer = null;

    document.addEventListener('keydown', function(e) {
      if (!document.hasFocus()) return;
      var activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) return;

      if (e.key === 'Enter') {
        count++;
        if (timer) clearTimeout(timer);
        showToast('Tekan ENTER ' + (3 - count) + 'x lagi untuk Admin Mode...');

        if (count >= 3) {
          count = 0;
          localStorage.setItem('aed-is-admin', 'true');
          showToast('✅ Admin Mode Aktif! Reloading...');
          setTimeout(function() { location.reload(); }, 1000);
        } else {
          timer = setTimeout(function() { count = 0; hideToast(); }, 3000);
        }
      }
    });
  }

  function showToast(msg) {
    var t = document.getElementById('aed-admin-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'aed-admin-toast';
      t.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#1e293b; color:#fff; padding:10px 20px; border-radius:8px; font-family:sans-serif; font-size:14px; z-index:999999; transition:opacity 0.3s; box-shadow:0 4px 12px rgba(0,0,0,0.15); pointer-events:none;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
  }

  function hideToast() {
    var t = document.getElementById('aed-admin-toast');
    if (t) t.style.opacity = '0';
  }

  // ============================================================
  // MAIN
  // ============================================================
  async function detectEvergreen(opts) {
    opts = opts || {};
    var customDateModified = opts.customDateModified || null;
    var forceBump = opts.forceBump === true;

    if (_AED_INITIALIZED) {
      console.log('⏭️ [AED] detectEvergreen sudah pernah jalan — skip');
      return;
    }
    _AED_INITIALIZED = true;

    console.log("🧩 detectEvergreen() v17.6.2 — SUPER SET + GUIDE BUTTON");

    injectWarningStyles();
    await waitForPageLevelDetector();

    const { pageLevel, entityType, detectorVersion } = getPageLevelAndEntityType();
    const h1Detection = detectContentTypeByH1();
    const contentFocus = getContentFocus(h1Detection, pageLevel, entityType);

    const rule = getRulesByEntityType(entityType, pageLevel, h1Detection, contentFocus);
    const finalType = rule.type;
    const validityDays = rule.validityDays;
    const validityMs = validityDays * 86400000;

    var contentCheck = detectContentChangeSinceLastVisit();

    var autoUpdated = false;
    if (forceBump) {
      console.log('🔧 [AED] forceBump explicit — forcing auto-update');
      autoUpdated = autoUpdateDates(pageLevel, contentFocus, { forceBump: true });
    } else if (contentCheck.changed) {
      console.log('✅ [AED] Content changed — forcing auto-update (bypass guard)');
      autoUpdated = autoUpdateDates(pageLevel, contentFocus, { forceBump: true });
    } else {
      autoUpdated = autoUpdateDates(pageLevel, contentFocus);
    }

    await processMetaDates(
      customDateModified, finalType, validityMs, rule.usePriceValidUntil,
      pageLevel, entityType, rule.ctaIntensity, rule.allowPriceRange,
      detectorVersion, null, null, null, rule.overridden || false,
      rule.overrideReason || null, h1Detection, contentFocus, autoUpdated
    );

    checkAndShowInlineWarning(pageLevel, contentFocus);
    logFinalAnalytics(pageLevel, entityType, contentFocus, finalType, validityDays, autoUpdated, contentCheck);
    injectAuthorByline();

    // 🆕 v17.6.2: Inject guide button
    injectGuideButton();

    window.dispatchEvent(new Event("detectEvergreenReady"));
    console.log(`🧩 detectEvergreen() v17.6.2 — FINISHED ✅`);
  }

  // ============================================================
  // EMERGENCY VERIFY (Preserved 100%)
  // ============================================================
  window.aedEmergencyVerify = function(customDate, opts) {
    opts = opts || {};
    if (!opts.confirm) {
      console.warn('⚠️ [AED] EMERGENCY VERIFY memerlukan konfirmasi!');
      return null;
    }
    customDate = customDate || toISOWithTimezoneLocal(new Date());
    var pageLevel = document.body.getAttribute('data-page-level') || 'money-page';
    var contentFocus = document.body.getAttribute('data-content-focus') || 'HARGA';
    var validityDays = getValidityByContext(pageLevel, contentFocus);

    var metaModified = document.querySelector('meta[itemprop="dateModified"]');
    if (!metaModified) { metaModified = document.createElement('meta'); metaModified.setAttribute('itemprop', 'dateModified'); document.head.appendChild(metaModified); }
    metaModified.setAttribute('content', customDate);

    var nextUpdate = toISOWithTimezoneLocal(new Date(new Date(customDate).getTime() + validityDays * 86400000));
    var metaNext = document.querySelector('meta[name="nextUpdate"]');
    if (!metaNext) { metaNext = document.createElement('meta'); metaNext.setAttribute('name', 'nextUpdate'); document.head.appendChild(metaNext); }
    metaNext.setAttribute('content', nextUpdate);

    updateJsonLdDates(customDate, nextUpdate);
    document.querySelectorAll('[itemtype="http://schema.org/Offer"]').forEach(function(el) { el.setAttribute('priceValidUntil', nextUpdate); });

    document.body.removeAttribute('data-aed-needs-review');
    document.body.removeAttribute('data-aed-review-reason');
    document.body.removeAttribute('data-aed-warning-severity');
    document.body.removeAttribute('data-aed-warning-days');
    document.body.removeAttribute('data-aed-warning-stuck');
    document.body.removeAttribute('data-aed-warning-stuck-days');

    var banner = document.getElementById('aed-update-warning');
    if (banner) banner.remove();

    if (window.AEDMetaDates) {
      window.AEDMetaDates.dateModified = customDate;
      window.AEDMetaDates.nextUpdate = nextUpdate;
      window.AEDMetaDates.priceValidUntil = nextUpdate;
      window.AEDMetaDates.needsManualVerify = false;
      window.AEDMetaDates.lastEmergencyVerify = customDate;
      window.AEDMetaDates.updateCount = (window.AEDMetaDates.updateCount || 0) + 1;
    }

    try {
      var auditData = { date: customDate, nextUpdate: nextUpdate, validityDays: validityDays, pageLevel: pageLevel, contentFocus: contentFocus, verifiedAt: new Date().toISOString(), method: 'emergency' };
      localStorage.setItem('aed-emergency-verified-' + location.pathname, JSON.stringify(auditData));
      localStorage.setItem('aed-verified-' + location.pathname, JSON.stringify(auditData));
    } catch (e) {}

    try {
      window.dispatchEvent(new CustomEvent('aedVerified', { detail: { dateModified: customDate, nextUpdate: nextUpdate, validityDays: validityDays, pageLevel: pageLevel, contentFocus: contentFocus, method: 'emergency' } }));
    } catch (e) {
      try { var evt = document.createEvent('Event'); evt.initEvent('aedVerified', true, true); window.dispatchEvent(evt); } catch (e2) {}
    }

    return { dateModified: customDate, nextUpdate: nextUpdate, validityDays: validityDays, pageLevel: pageLevel, contentFocus: contentFocus };
  };

  window.aedVerifyNow = function(customDate) {
    console.warn('⚠️ [AED] aedVerifyNow() sudah DIGANTI di v17.5.9');
    return window.aedEmergencyVerify(customDate, { confirm: true });
  };

  window.aedShowEditGuide = function() {
    var pl = document.body.getAttribute('data-page-level') || 'pillar';
    var cf = document.body.getAttribute('data-content-focus') || 'INFORMASI';
    var ft = (EVERGREEN_LEVELS.indexOf(pl) !== -1) ? 'evergreen' : 'non-evergreen';
    var vd = getValidityByContext(pl, cf);
    var mn = document.querySelector('meta[name="nextUpdate"]');
    var dur = mn ? Math.ceil((new Date(mn.content) - new Date()) / 86400000) : 0;
    var g = generatePageGuide(pl, cf, ft, vd, dur);
    console.log('%c📖 PAGE GUIDE — ' + pl + ' | ' + cf, 'color:#16a34a; font-size:14px; font-weight:bold');
    console.log('Status:', g.meta.status, '| Next:', g.meta.daysUntilReview, 'hari');
    if (g.issues.length > 0) g.issues.forEach(function(i) { console.log((i.level === 'critical' ? '🚨' : '⚠️') + ' ' + i.text); });
    console.log('Priority:', g.priorityActions);
    console.log('Minimal Changes:', g.minimalChanges);
  };

  window.aedCheckStatus = function() {
    if (!window.AEDMetaDates) { console.warn('⚠️ AED belum selesai init'); return null; }
    var mm = document.querySelector('meta[itemprop="dateModified"]');
    var mn = document.querySelector('meta[name="nextUpdate"]');
    var mp = document.querySelector('meta[itemprop="datePublished"]');
    var ad = null;
    try {
      var rn = localStorage.getItem('aed-emergency-verified-' + location.pathname);
      if (rn) ad = JSON.parse(rn);
      else { var rl = localStorage.getItem('aed-verified-' + location.pathname); if (rl) { ad = JSON.parse(rl); ad._source = 'legacy-key'; } }
    } catch (e) {}
    var dur = mn ? Math.ceil((new Date(mn.content) - new Date()) / 86400000) : null;
    var s = { datePublished: mp ? mp.content : null, dateModified: mm ? mm.content : null, nextUpdate: mn ? mn.content : null, daysUntilReview: dur, needsManualVerify: document.body.getAttribute('data-aed-needs-review') === 'true', warningSeverity: document.body.getAttribute('data-aed-warning-severity'), lastEmergencyVerify: ad, aedData: window.AEDMetaDates };
    console.table(s);
    return s;
  };

  window.detectEvergreen = detectEvergreen;
  window.__detectEvergreenReady = true;

  // Inisialisasi pendeteksi tombol ENTER 3x
  initAdminKeyboardShortcut();

  console.log("═══════════════════════════════════════════════════════════");
  console.log("✅ Smart Evergreen Detector v17.6.2 — SUPER SET + GUIDE BUTTON");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🎯 WORKFLOW UTAMA: Edit konten → Save → Auto-detect");
  console.log("🚨 EMERGENCY ONLY: aedEmergencyVerify(null, { confirm: true })");
  console.log("📖 PANDUAN: aedShowEditGuide()");
  console.log("📊 DEBUG: aedCheckStatus()");
  console.log("✨ NEW: Tombol 📖 Panduan & ENTER 3x (tanpa hapus fitur lama)");
  console.log("═══════════════════════════════════════════════════════════");

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(function () { detectEvergreen(); }, 100);
    }, { once: true });
  } else {
    setTimeout(function () { detectEvergreen(); }, 100);
  }

})();
