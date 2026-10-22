/* ============================================================
 🧠 Smart Evergreen Detector v17.8.1 — FULL SUITE (ZERO FEATURE LOSS)
============================================================
 ✅ 100% PRESERVED: Semua fitur v17.6.2 (Tombol, Enter 3x, Tabel Section)
 ✅ 100% PRESERVED: Semua fitur v17.8.0 (Patch Generator, Copy-Paste Box)
============================================================ */

(function () {
  if (window.detectEvergreen && window.__AED_VERSION === "17.8.1") return;

  var _AED_INITIALIZED = false;
  var _AED_PLD_CACHE = {};

  window.__AED_VERSION = "17.8.1";

  var DEFAULT_BRAND_NAME = "Beton Jaya Readymix";

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

  // HELPERS
  function getValidityByContext(pl, cf) { var f = String(cf || '').toUpperCase(); if (MONEY_LEVELS.indexOf(pl) !== -1) { if (f === 'HARGA' || f === 'GABUNG' || f === 'COMMERCIAL') return 180; if (f === 'INFORMASI') return 365; return 180; } var r = BASE_PAGE_LEVEL_RULES[pl]; return r ? r.validityDays : 180; }
  function getWarningDays(vd) { if (!WARNING_CONFIG.USE_TIERED) return WARNING_CONFIG.SHOW_DAYS_BEFORE; var r = WARNING_CONFIG.TIERED_RULES || []; for (var i = 0; i < r.length; i++) if (vd <= r[i].maxValidity) return r[i].showDays; return WARNING_CONFIG.SHOW_DAYS_BEFORE; }
  function toISOWithTimezoneLocal(date, offset) { offset = offset || "+07:00"; if (!date) return null; const d = new Date(date); if (isNaN(d.getTime())) return null; const pad = (n) => (n < 10 ? '0' : '') + n; return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${offset}`; }
  function formatTanggalIndo(dateStr) { if (!dateStr) return ''; var b = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']; var d = new Date(dateStr); if (isNaN(d.getTime())) return ''; return d.getDate() + ' ' + b[d.getMonth()] + ' ' + d.getFullYear(); }

  // WARNING BANNER
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

  // AUTHOR BYLINE
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

  // HTML ENTITIES + FAQ
  function decodeHtmlEntities(str) { if (typeof str !== 'string' || str.indexOf('&') === -1) return str; var t = document.createElement('textarea'); t.innerHTML = str; return t.value; }
  function deepDecodeHtmlEntities(o) { if (typeof o === 'string') return decodeHtmlEntities(o); if (Array.isArray(o)) { for (var i = 0; i < o.length; i++) o[i] = deepDecodeHtmlEntities(o[i]); return o; } if (o && typeof o === 'object') { for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) o[k] = deepDecodeHtmlEntities(o[k]); return o; } return o; }
  function hasHtmlEntities(o) { var f = []; function s(n) { if (typeof n === 'string') { var m = n.match(/&#\d+;|&[a-zA-Z]+;/g); if (m) f = f.concat(m); } else if (Array.isArray(n)) n.forEach(s); else if (n && typeof n === 'object') for (var k in n) if (Object.prototype.hasOwnProperty.call(n, k)) s(n[k]); } s(o); return f; }
  function detectIllegalFaqProps() {
    var hi = false; document.querySelectorAll('script[type="application/ld+json"]').forEach(function(scr) {
      var raw = scr.textContent; if (!raw || (raw.indexOf('"FAQPage"') === -1 && raw.indexOf('"QAPage"') === -1)) return;
      var j; try { j = JSON.parse(raw); } catch(e) { return; }
      var ns = Array.isArray(j) ? j : (j['@graph'] && Array.isArray(j['@graph']) ? j['@graph'] : [j]);
      ns.forEach(function(n) { if (!n || typeof n !== 'object') return; if ((n['@type'] || '').toString().indexOf('FAQPage') !== -1) { if (n.datePublished !== undefined || n.dateModified !== undefined) hi = true; } if (Array.isArray(n.mainEntity)) n.mainEntity.forEach(function(q) { if (q.author !== undefined || q.datePublished !== undefined || q.dateModified !== undefined || q.upvoteCount !== undefined) hi = true; if (q.acceptedAnswer) { var a = q.acceptedAnswer; if (a.author !== undefined || a.datePublished !== undefined || a.dateModified !== undefined || a.upvoteCount !== undefined) hi = true; } }); if (hasHtmlEntities(n).length > 0) hi = true; });
    });
    return hi;
  }
  function normalizeBrandCase(s) { if (!s || typeof s !== 'string') return s; var t = s.trim(); if (t.length < 3 || t !== t.toUpperCase() || /[\d]/.test(t)) return s; var w = t.split(/\s+/); var a = ['PT','CV','UD','TBK','LTD','INC','LLC','CORP','GMBH','NASA','BMW','IBM','AMD','HP','LG','3M','KFC','BBC','SNI','ASTM','JIS','DIN','ISO','PUPR','K3','SMK3','MEP','AC','WC','TV','IT','HR','GA','QC','QA']; if (w.every(function(x) { return a.indexOf(x) !== -1; })) return s; return w.map(function(x) { return a.indexOf(x) !== -1 ? x : x.charAt(0).toUpperCase() + x.slice(1).toLowerCase(); }).join(' '); }
  function resolveBrandName() {
    if (window.AEDMetaDates && window.AEDMetaDates.brandName) return window.AEDMetaDates.brandName;
    var m = document.querySelector('meta[name="brand"]'); if (m && m.getAttribute('content')) return m.getAttribute('content').trim();
    var o = document.querySelector('meta[property="og:site_name"]'); if (o && o.getAttribute('content')) return o.getAttribute('content').trim();
    var s = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < s.length; i++) { try { var j = JSON.parse(s[i].textContent || '{}'); var ns = Array.isArray(j) ? j : (j['@graph'] && Array.isArray(j['@graph']) ? j['@graph'] : [j]); for (var k = 0; k < ns.length; k++) { if (ns[k] && ns[k].publisher && ns[k].publisher.name) return ns[k].publisher.name; if (ns[k] && ns[k]['@type'] === 'Organization' && ns[k].name) return ns[k].name; } } catch(e) {} }
    return DEFAULT_BRAND_NAME;
  }
  function cleanupFaqSchema(bn) {
    var c = 0, inj = 0, norm = 0, dec = 0;
    document.querySelectorAll('script[type="application/ld+json"]').forEach(function(scr) {
      var raw = scr.textContent; if (!raw || (raw.indexOf('"FAQPage"') === -1 && raw.indexOf('"QAPage"') === -1)) return;
      var j; try { j = JSON.parse(raw); } catch(e) { return; }
      var ns = Array.isArray(j) ? j : (j['@graph'] && Array.isArray(j['@graph']) ? j['@graph'] : [j]); var ch = false;
      ns.forEach(function(n) {
        if (!n || typeof n !== 'object') return;
        if ((n['@type'] || '').toString().indexOf('FAQPage') !== -1) { if (n.datePublished !== undefined) { delete n.datePublished; ch = true; c++; } if (n.dateModified !== undefined) { delete n.dateModified; ch = true; c++; } if (!n.author && bn) { n.author = { "@type": "Organization", "name": bn }; ch = true; inj++; } else if (n.author && n.author.name) { var nn = normalizeBrandCase(n.author.name); if (nn !== n.author.name) { n.author.name = nn; ch = true; norm++; } } }
        if (Array.isArray(n.mainEntity)) n.mainEntity.forEach(function(q) { if (q.author !== undefined) { delete q.author; ch = true; c++; } if (q.datePublished !== undefined) { delete q.datePublished; ch = true; c++; } if (q.dateModified !== undefined) { delete q.dateModified; ch = true; c++; } if (q.upvoteCount !== undefined) { delete q.upvoteCount; ch = true; c++; } if (q.acceptedAnswer) { var a = q.acceptedAnswer; if (a.author !== undefined) { delete a.author; ch = true; c++; } if (a.datePublished !== undefined) { delete a.datePublished; ch = true; c++; } if (a.dateModified !== undefined) { delete a.dateModified; ch = true; c++; } if (a.upvoteCount !== undefined) { delete a.upvoteCount; ch = true; c++; } } });
      });
      var b = hasHtmlEntities(j); j = deepDecodeHtmlEntities(j); var a = hasHtmlEntities(j); var d = b.length - a.length; if (d > 0) { dec += d; c += d; ch = true; }
      if (ch) scr.textContent = JSON.stringify(j, null, 2);
    });
    return { cleaned: c, injected: inj, normalized: norm, entitiesDecoded: dec };
  }

  // PLD & DATE UTILS
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
  function updateJsonLdDates(dm, pv) { var u = 0; document.querySelectorAll('script[type="application/ld+json"]').forEach(function(s) { var raw = s.textContent; if (!raw || (raw.indexOf('"date') === -1 && raw.indexOf('priceValidUntil') === -1)) return; var j; try { j = JSON.parse(raw); } catch(e) { return; } var ns = Array.isArray(j) ? j : (j['@graph'] && Array.isArray(j['@graph']) ? j['@graph'] : [j]); var ch = false; ns.forEach(function(n) { if (!n || typeof n !== 'object') return; var ts = (n['@type'] || '').toString(); if (ts.indexOf('FAQPage') !== -1 || ts.indexOf('Question') !== -1 || ts.indexOf('Answer') !== -1 || ts.indexOf('QAPage') !== -1) return; if (n.dateModified !== undefined && n.dateModified !== dm) { n.dateModified = dm; ch = true; } if (n.offers) { var os = Array.isArray(n.offers) ? n.offers : [n.offers]; os.forEach(function(o) { if (o && o.priceValidUntil !== undefined) { o.priceValidUntil = pv; ch = true; } }); } }); if (ch) { s.textContent = JSON.stringify(j, null, 2); u++; } }); return { updated: u }; }
  function isHistoricalContext(ft, pos, len) { var bef = ft.substring(Math.max(0, pos - 80), pos).toLowerCase(); var aft = ft.substring(pos + len, Math.min(ft.length, pos + len + 80)).toLowerCase(); var hw = ['lalu','yang lalu','sebelumnya','silam','dahulu','lampau','terdahulu','saat itu','ketika itu','waktu itu','dulu','masa lalu','tahun lalu','bulan lalu','yang telah lewat','sejak','sepanjang','periode','era','zaman']; var fw = ['mendatang','yang akan datang','akan datang','yang akan','masa depan','berikutnya','nanti','tahun depan','bulan depan','di masa depan','proyeksi','prediksi','target','rencana']; for (var i = 0; i < hw.length; i++) if (aft.indexOf(hw[i]) !== -1) return { skip: true }; for (var j = 0; j < fw.length; j++) if (aft.indexOf(fw[j]) !== -1) return { skip: true }; var shb = ['tahun lalu','sebelumnya','silam','dahulu','masa lalu','saat itu','ketika itu','waktu itu','yang lalu','sejak','periode','era','zaman','sepanjang','sejarah','awal mula','berdiri sejak','didirikan','pertama kali','mulai dari']; for (var k = 0; k < shb.length; k++) if (bef.indexOf(shb[k]) !== -1) return { skip: true }; return { skip: false }; }
  function replaceYearWithContext(text, oy, ny) { if (!text) return text; var pr = []; text = text.replace(/\b(SNI|ISO|UU|PP|Permen|Kepmen|ASTM|JIS|EN|DIN|IEC|BS|GB)\s*[\d.:\-\/]+\b/gi, function(m) { pr.push(m); return '\x00P' + (pr.length - 1) + '\x00'; }); var oym = {}; oy.forEach(function(y) { oym[y] = true; }); var mr = []; text = text.replace(/\b(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+(\d{4})\b/gi, function(m) { mr.push(m); return '\x00M' + (mr.length - 1) + '\x00'; }); var rr = []; text = text.replace(/\b(\d{4})\s*(?:\-|–|—|s\/d|sd|sampai|hingga|to)\s*(\d{4})\b/gi, function(m) { rr.push(m); return '\x00R' + (rr.length - 1) + '\x00'; }); text = text.replace(/\b(\d{4})\b/g, function(m, ys, off, ft) { var y = parseInt(ys, 10); if (!oym[y]) return m; if (isHistoricalContext(ft, off, 4).skip) return m; return String(ny); }); text = text.replace(/\x00R(\d+)\x00/g, function(m, i) { return rr[parseInt(i, 10)]; }); text = text.replace(/\x00M(\d+)\x00/g, function(m, i) { return mr[parseInt(i, 10)]; }); text = text.replace(/\x00P(\d+)\x00/g, function(m, i) { return pr[parseInt(i, 10)]; }); return text; }
  function updateJsonLdFaqYears(ny) { var u = 0, rc = 0; var cy = new Date().getFullYear(); var oy = []; for (var y = Math.max(cy - 3, 2024); y < cy; y++) oy.push(y); if (oy.length === 0) return { updated: 0, replaced: 0 }; var re = new RegExp('\\b(?:' + oy.join('|') + ')\\b'); document.querySelectorAll('script[type="application/ld+json"]').forEach(function(s) { var raw = s.textContent; if (!raw || (raw.indexOf('"FAQPage"') === -1 && raw.indexOf('"QAPage"') === -1) || !re.test(raw)) return; var j; try { j = JSON.parse(raw); } catch(e) { return; } var ns = Array.isArray(j) ? j : (j['@graph'] && Array.isArray(j['@graph']) ? j['@graph'] : [j]); var ch = false; ns.forEach(function(n) { if (!n || typeof n !== 'object' || !Array.isArray(n.mainEntity)) return; n.mainEntity.forEach(function(q) { if (typeof q.name === 'string') { var nn = replaceYearWithContext(q.name, oy, ny); if (nn !== q.name) { q.name = nn; ch = true; rc++; } } if (q.acceptedAnswer && typeof q.acceptedAnswer.text === 'string') { var nt = replaceYearWithContext(q.acceptedAnswer.text, oy, ny); if (nt !== q.acceptedAnswer.text) { q.acceptedAnswer.text = nt; ch = true; rc++; } } }); }); if (ch) { s.textContent = JSON.stringify(j, null, 2); u++; } }); return { updated: u, replaced: rc }; }
  function updateContentByLevelAndFocus(pl, cf, now) { var mn = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']; var ny = now.getFullYear(); var ndt = mn[now.getMonth()] + ' ' + ny; var im = MONEY_LEVELS.includes(pl); var ie = EVERGREEN_LEVELS.includes(pl); var nf = String(cf || '').toUpperCase(); var um = 'year-only'; if (ie) um = 'year-only'; else if (im) um = (nf === 'INFORMASI') ? 'year-only' : 'month-year'; var bit = document.body.innerText || ''; var ay = bit.match(/\b(19|20)\d{2}\b/g) || []; var hoy = false; for (var yi = 0; yi < ay.length; yi++) { var yn = parseInt(ay[yi], 10); if (yn > 2025 && yn < ny) { hoy = true; break; } } if (!hoy) return { updated: false, skipped: true }; var sels = ['.update-badge','[class*="update-badge"]','.last-updated','.updated-date','.date-modified','.post-date','.article-date','.publish-date','.post-meta','.entry-meta','.article-meta','.breadcrumb + p','.toc + p','h1 + p']; var cu = false; var es = new Set(); sels.forEach(function(s) { try { document.querySelectorAll(s).forEach(function(e) { es.add(e); }); } catch(e) {} }); queryByKeyword(document.body, ['diperbarui','update','terakhir','last updated','updated','perbarui'], true).forEach(function(e) { es.add(e); }); Array.from(es).slice(0, 50).forEach(function(el) { if (!el || el.tagName === 'H1') return; var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false); var tns = []; var n; while (n = w.nextNode()) tns.push(n); tns.forEach(function(tn) { var ot = tn.textContent || ''; if (!ot.match(/\b(19|20)\d{2}\b/)) return; var nt = ot; if (um === 'month-year') nt = nt.replace(/(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+(\d{4})/gi, function(m, mo, yr) { var y = parseInt(yr); return (y > 2025 && y < ny) ? ndt : m; }); else nt = nt.replace(/\b(19|20)\d{2}\b/g, function(m) { var y = parseInt(m); return (y > 2025 && y < ny) ? String(ny) : m; }); if (nt !== ot) { tn.textContent = nt; cu = true; } }); }); return { updated: cu, mode: um }; }
  function updateH1WithRules(pl, now) { var im = MONEY_LEVELS.includes(pl); var ie = EVERGREEN_LEVELS.includes(pl); if (!im && !ie) return { updated: false }; var h = document.querySelector('h1'); if (!h) return { updated: false }; var ny = now.getFullYear(); var ht = h.innerText; var ym = ht.match(/\b(19|20)\d{2}\b/); var dy = ym ? parseInt(ym[0]) : null; if (!dy || dy <= 2025 || dy >= ny) return { updated: false }; var nh = ht.replace(/\b(19|20)\d{2}\b/, ny); if (nh !== ht) { h.innerText = nh; return { updated: true, from: dy, to: ny }; } return { updated: false }; }
  function detectContentChangeSinceLastVisit() { var c = document.querySelector('.post-body.entry-content, .post-body, article, main'); if (!c) return { changed: false, reason: 'no-container' }; var t = (c.innerText || '').replace(/\s+/g, ' ').trim(); if (t.length < 100) return { changed: false, reason: 'too-short' }; var h = 0; for (var i = 0; i < t.length; i++) { h = ((h << 5) - h) + t.charCodeAt(i); h = h | 0; } var ch = String(Math.abs(h)); var sk = 'aed-content-hash-' + location.pathname; var sh = null; try { sh = localStorage.getItem(sk); } catch(e) {} var changed = false; if (sh && sh !== ch) { changed = true; } try { localStorage.setItem(sk, ch); } catch(e) {} return { changed: changed, reason: changed ? 'content-changed' : 'same', hash: ch }; }
  function autoUpdateDates(pl, cf, opts) { opts = opts || {}; var mm = document.querySelector('meta[itemprop="dateModified"]'); var mn = document.querySelector('meta[name="nextUpdate"]'); var mp = document.querySelector('meta[itemprop="datePublished"]'); var cn = mn ? mn.getAttribute('content') : null; if (!cn) return false; var now = new Date(); if (!opts.forceBump && now < new Date(cn)) return false; var f = String(cf || '').toUpperCase(); if ((f === 'HARGA' || f === 'GABUNG') && !opts.forceBump) { document.body.setAttribute('data-aed-needs-review', 'true'); document.body.setAttribute('data-aed-review-reason', 'harga-manual-verify-required'); return false; } var vd = getValidityByContext(pl, cf); var nms = toISOWithTimezoneLocal(now); var nns = toISOWithTimezoneLocal(new Date(now.getTime() + vd * 86400000)); if (mm) mm.setAttribute('content', nms); else { mm = document.createElement("meta"); mm.setAttribute("itemprop","dateModified"); mm.setAttribute("content",nms); document.head.appendChild(mm); } if (mn) mn.setAttribute('content', nns); else { mn = document.createElement("meta"); mn.setAttribute("name","nextUpdate"); mn.setAttribute("content",nns); document.head.appendChild(mn); } if (!mp) { mp = document.createElement("meta"); mp.setAttribute("itemprop","datePublished"); mp.setAttribute("content",nms); document.head.appendChild(mp); } if (!hasLastUpdatedAnchor()) { document.body.classList.add('auto-updated'); return true; } updateJsonLdDates(nms, nns); updateContentByLevelAndFocus(pl, cf, now); updateH1WithRules(pl, now); cleanupFaqSchema(resolveBrandName()); updateJsonLdFaqYears(now.getFullYear()); document.body.classList.add('auto-updated'); return true; }
  async function processMetaDates(cdm, ft, vm, upvu, pl, et, ci, apr, dv, conf, strat, sc, io, oreason, hd, cf, au) { var mp = document.querySelector('meta[itemprop="datePublished"]'); var mm = document.querySelector('meta[itemprop="dateModified"]'); var mn = document.querySelector('meta[name="nextUpdate"]'); var isFirst = !(mm && mm.getAttribute('content')); var hasCd = cdm !== null && cdm !== undefined; var hasIf = detectIllegalFaqProps(); var nowISO = new Date().toISOString(); var dp = toISOWithTimezoneLocal(mp ? mp.content : null) || toISOWithTimezoneLocal(nowISO); var dm = toISOWithTimezoneLocal(cdm) || toISOWithTimezoneLocal(mm ? mm.content : null) || dp; if (new Date(dm) < new Date(dp)) dm = dp; if (!mp) { mp = document.createElement("meta"); mp.setAttribute("itemprop","datePublished"); document.head.appendChild(mp); } mp.setAttribute("content", dp); if (!mm) { mm = document.createElement("meta"); mm.setAttribute("itemprop","dateModified"); document.head.appendChild(mm); } mm.setAttribute("content", dm); var f = String(cf || '').toUpperCase(); var ipm = (f === 'HARGA' || f === 'GABUNG'); var nl = new Date(); var nnu = new Date(dm).getTime() + vm; var ipe = ipm && (nnu < nl.getTime()); var nu, pvu; if (ipe) { nu = toISOWithTimezoneLocal(new Date(nnu)); pvu = toISOWithTimezoneLocal(new Date(nl.getTime() + vm)); document.body.setAttribute('data-aed-needs-review', 'true'); document.body.setAttribute('data-aed-review-reason', 'harga-manual-verify-required'); } else { nu = toISOWithTimezoneLocal(new Date(nnu)); pvu = nu; if (document.body.hasAttribute('data-aed-needs-review')) { document.body.removeAttribute('data-aed-needs-review'); document.body.removeAttribute('data-aed-review-reason'); } } if (!mn) { mn = document.createElement("meta"); mn.setAttribute("name","nextUpdate"); document.head.appendChild(mn); } mn.setAttribute("content", nu); var sr = au === true || isFirst || hasCd || hasIf || ipe; if (sr) { updateJsonLdDates(dm, pvu); cleanupFaqSchema(resolveBrandName()); updateJsonLdFaqYears(new Date().getFullYear()); } if (upvu && hd && hd.isPrice) { document.querySelectorAll('[itemtype="http://schema.org/Offer"]').forEach(function(el) { el.setAttribute("priceValidUntil", pvu); }); } else { document.querySelectorAll('[itemtype="http://schema.org/Offer"]').forEach(function(el) { el.removeAttribute("priceValidUntil"); }); } document.body.classList.add('page-level-' + pl); document.body.classList.add('entity-type-' + et); document.body.classList.add('content-type-' + ft); document.body.classList.add('cta-intensity-' + ci); if (apr) document.body.classList.add('allow-price-range'); if (io) document.body.classList.add('overridden-evergreen'); var kat = getKategori(pl, cf, ft); window.AEDMetaDates = { type: ft, entityType: et, pageLevel: pl, datePublished: dp, dateModified: dm, nextUpdate: nu, priceValidUntil: pvu, validityDays: vm / 86400000, usePriceValidUntil: upvu, ctaIntensity: ci, allowPriceRange: apr, detectorVersion: dv || 'v17.8.1', detectionConfidence: conf || null, isOverridden: io || false, overrideReason: oreason || null, h1Detection: hd || null, contentFocus: cf || null, pldKategori: kat, pldH1Pattern: getPLDH1Pattern(kat), pldSchemaType: getPLDSchemaType(pl, et, cf), pldCtaType: getPLDCtaType(pl, cf, et), brandName: resolveBrandName(), needsManualVerify: ipe, lastAutoUpdate: null, updateCount: 0 }; window.EvergreenDetectorResults = window.AEDMetaDates; }
  function getPageLevelAndEntityType() { var pl = 'pillar', et = 'produk', dv = 'unknown', conf = null, strat = null, sc = null; var bl = document.body.getAttribute('data-page-level'); var be = document.body.getAttribute('data-entity-type'); if (bl && be) return { pageLevel: bl, entityType: be, detectorVersion: getPLDVersion().label, confidence: conf, strategies: strat, strategyCount: sc }; if (window.pageLevelDetectorv22) { try { if (typeof window.pageLevelDetectorv22.detectFromDOM === 'function') { var dr = window.pageLevelDetectorv22.detectFromDOM(); if (dr) pl = dr; } if ((!pl || pl === 'pillar') && typeof window.pageLevelDetectorv22.detect === 'function') { var ur = window.pageLevelDetectorv22.detect(); if (ur) pl = ur; } if (typeof window.pageLevelDetectorv22.detectEntityType === 'function') et = window.pageLevelDetectorv22.detectEntityType(); return { pageLevel: pl, entityType: et, detectorVersion: getPLDVersion().label, confidence: conf, strategies: strat, strategyCount: sc }; } catch(e) {} } return { pageLevel: pl, entityType: et, detectorVersion: 'none' }; }
  function waitForPageLevelDetector() { return new Promise(function(resolve) { if (document.body && document.body.getAttribute('data-page-level')) { resolve(); return; } if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') { resolve(); return; } var onR = function() { resolve(); }; window.addEventListener("pageLevelDetectorv22Ready", onR, { once: true }); setTimeout(function() { if (!window.pageLevelDetector && !document.body.getAttribute('data-page-level')) { window.pageLevelDetector = { detect: function() { return 'pillar'; }, detectEntityType: function() { return 'produk'; } }; } resolve(); }, 3000); }); }
  function getRulesByEntityType(et, pl, hd, cf) { var im = MONEY_LEVELS.indexOf(pl) !== -1; if (im) { var nf = String(cf || '').toUpperCase(); if (nf === 'INFORMASI' && !(hd && hd.hasYear)) return { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft-medium', overridden: true, overrideReason: 'Money level + INFORMASI' }; var v = getValidityByContext(pl, nf); return { type: 'non-evergreen', validityDays: v, usePriceValidUntil: (nf === 'HARGA' || nf === 'GABUNG'), allowPriceRange: pl === 'money-master', ctaIntensity: pl === 'money-child' ? 'very-hard' : 'hard' }; } if (et === 'jasa') return JASA_RULES[pl] || DEFAULT_RULE; if (et === 'sewa') return SEWA_RULES[pl] || BASE_PAGE_LEVEL_RULES[pl] || DEFAULT_RULE; if (et === 'produk' || et === 'material') return PRODUK_MATERIAL_RULES[pl] || BASE_PAGE_LEVEL_RULES[pl] || DEFAULT_RULE; return BASE_PAGE_LEVEL_RULES[pl] || DEFAULT_RULE; }

  // ============================================================
  // 🆕 ANALYZE PAGE CONTENT & PATCH GENERATOR (GABUNGAN)
  // ============================================================
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
    
    // 🆕 PERBAIKAN: Mencari paragraf pertama yang benar-benar berisi teks (min. 30 karakter), mengabaikan caption/gambar
    var pElements = document.querySelectorAll('.post-body.entry-content p, .post-body p, article p');
    var firstPText = '';
    for (var j = 0; j < pElements.length; j++) {
      var txt = (pElements[j].innerText || '').trim();
      if (txt.length > 30 && !pElements[j].closest('.faq-item')) {
        firstPText = txt;
        break;
      }
    }
    var hasFirstP = firstPText !== '';

    return { 
      h1Text: h1Text, h1Year: h1Year, h1YearOutdated: h1YearOutdated, 
      currentYear: currentYear, uniqueYears: uniqueYears, outdatedYears: outdatedYears, 
      hasFaq: hasFaq, faqCount: faqCount, hasPrice: hasPrice, priceCount: priceCount, priceSnippet: priceSnippet, dateSnippet: dateSnippet,
      hasWA: hasWA, hasTable: hasTable, tableCount: tableCount, 
      wordCount: wordCount, h2Count: h2Count, h3Count: h3Count,
      hasFirstP: hasFirstP, firstPText: firstPText 
    };
  }
 
  function generatePageGuide(pageLevel, contentFocus, finalType, validityDays, daysUntilReview) {
    var a = analyzePageContent();
    var currentMonthYear = (new Date().toLocaleString('id-ID', { month: 'long' })) + ' ' + a.currentYear;
    var isMoney = pageLevel.indexOf('money') === 0 || pageLevel === 'variant' || pageLevel === 'sub-variant';
    var isEvergreen = EVERGREEN_LEVELS.indexOf(pageLevel) !== -1;
    
    var guide = { 
      meta: { pageLevel: pageLevel, contentFocus: contentFocus, finalType: finalType, validityDays: validityDays, daysUntilReview: daysUntilReview, status: daysUntilReview > 21 ? 'FRESH' : (daysUntilReview > 0 ? 'WARNING' : 'EXPIRED') }, 
      issues: [], priorityActions: [], sectionGuide: [], minimalChanges: [], checklist: [],
      patchParagraph: '', patchFaq: ''
    };

    // ============================================================
    // 🆕 FINAL LOGIC: CONTEXT EXTRACTION (FULL PARAGRAPH)
    // ============================================================
    var draftText = "";
    var pickRandom = function(arr) { return Math.floor(Math.random() * arr.length); };
    var freshSignal = "";

    if (a.hasFirstP) {
      // ✅ JIKA PARAGRAF ASLI DITEMUKAN: Ambil SELURUH teks, bukan cuma 120 karakter
      var fullContext = a.firstPText.trim();
      
      // Bersihkan tahun-tahun lama di dalam teks asli agar tidak bentrok
      fullContext = fullContext.replace(/\b(2020|2021|2022|2023|2024|2025)\b/g, '');

      // Tentukan kalimat tambahan (Freshness Signal)
      if (isMoney) {
        freshSignal = ` Seluruh data dan penawaran terkait hal tersebut telah kami tinjau ulang dan perbarui pada ${currentMonthYear} untuk memastikan akurasi harga dan ketersediaan stok.`;
      } else {
        freshSignal = ` Pembahasan lengkap mengenai topik ini telah kami perbarui pada ${currentMonthYear} agar sesuai dengan standar teknis dan regulasi terkini.`;
      }
      
      // Gabungkan Paragraf Utuh + Kalimat Tambahan
      draftText = `"${fullContext}${freshSignal}"`;

    } else {
      // ❌ JIKA TIDAK ADA PARAGRAF (Hanya Gambar/Tabel)
      var cleanH1 = a.h1Text.replace(/\b(19|20)\d{2}\b/g, '').replace(/harga|terbaru|termurah|terbaik|update|revisi|jasa|di|untuk|profesional|melayani|ready|mix/gi, '').replace(/\s+/g, ' ').trim();
      if (cleanH1.length < 5) cleanH1 = "Produk & Layanan Konstruksi";
      var locationMatch = window.location.href.match(/(bogor|jakarta|depok|tangerang|bekasi|bandung|surabaya|semarang|karawang|serang|cilegon)/i);
      var detectedLocation = locationMatch ? locationMatch[1].charAt(0).toUpperCase() + locationMatch[1].slice(1) : 'Jabodetabek';

      if (isMoney) {
        freshSignal = ` Kami memastikan ketersediaan stok dan kualitas material tetap prima untuk mendukung kelancaran proyek Anda.`;
        draftText = pickRandom([
          `Informasi terbaru mengenai ${cleanH1} di area ${detectedLocation} telah kami perbarui pada ${currentMonthYear}.${freshSignal}`,
          `Memasuki ${currentMonthYear}, kami telah merangkum pembaruan data dan penawaran ${cleanH1} untuk wilayah ${detectedLocation}.${freshSignal}`
        ]);
      } else {
        freshSignal = ` Artikel ini mengulas standar teknis terbaru, metode pelaksanaan, serta tips efisiensi biaya.`;
        draftText = pickRandom([
          `Panduan komprehensif mengenai ${cleanH1} telah kami perbarui untuk tahun ${a.currentYear}.${freshSignal}`,
          `Artikel edukasi terkait ${cleanH1} ini telah ditinjau kembali pada ${currentMonthYear} agar tetap relevan.${freshSignal}`
        ]);
      }
    }

    // 4. Cek apakah harus REVISI atau TAMBAH
    if (a.hasFirstP) {
      guide.patchParagraph = `[⚠️ REVISI PARAGRAF PEMBUKA]\n` +
      `Teks lama saat ini: "${a.firstPText}"\n\n` +
      `GANTI DENGAN DRAF BARU INI (Anti-Duplikat):\n` +
      `${draftText}\n\n` +
      `💡 *Catatan Admin:*\n` +
      `- Sistem mengambil SELURUH teks paragraf pertama Anda secara utuh.\n` +
      `- Kalimat baru yang ditambahkan di bagian akhir adalah: "${freshSignal}"\n` +
      `- Silakan copy SELURUH teks di atas, lalu timpa (replace) paragraf pertama di Blogger.`;
    } else {
      guide.patchParagraph = `[➕ TAMBAH PARAGRAF PEMBUKA BARU]\n` +
      `(Tidak ditemukan paragraf teks pembuka. Kemungkinan artikel langsung diawali gambar/tabel).\n\n` +
      `TAMBAHKAN PARAGRAF INI:\n` +
      `"${draftText}"\n\n` +
      `💡 *Catatan Admin:* Copy teks di atas, lalu paste di Blogger TEPAT DI BAWAH GAMBAR PERTAMA (atau tepat di bawah H1 jika tidak ada gambar).`;
    }

    // 5. Generate FAQ Template
    guide.patchFaq = `[Template FAQ Baru - WAJIB UNIK]\n` +
    `<div class="faq-item">\n` +
    `  <button class="faq-question">T: [Tulis pertanyaan spesifik untuk halaman ini]?</button>\n` +
    `  <div class="faq-answer"><p>J: [Tulis jawaban yang belum ada di halaman lain]</p></div>\n` +
    `</div>\n\n` +
    `⚠️ PERINGATAN DUPLIKASI:\n` +
    `JANGAN meng-copy FAQ ini ke halaman lain. Google membenci duplikasi. Buat pertanyaan yang HANYA relevan dengan halaman "${a.h1Text}".`;

    // ============================================================
    // TABEL PATCH & ISSUES
    // ============================================================
    guide.patches = [
      { section: 'H1 (Judul)', detected: a.h1YearOutdated ? 'Tahun ' + a.h1Year + ' (Usang)' : 'Tahun ' + a.currentYear, action: a.h1YearOutdated ? 'Update tahun' : 'Cek relevansi', patch: a.h1YearOutdated ? 'Ubah <span class="aed-patch-old">' + a.h1Year + '</span> menjadi <span class="aed-patch-new">' + a.currentYear + '</span>' : '<span style="color:#16a34a">✅ Tidak perlu diubah</span>' },
      { section: 'Harga', detected: a.hasPrice ? 'Terdeteksi ' + a.priceCount + ' harga (cth: ' + a.priceSnippet + ')' : 'Tidak ada harga', action: a.hasPrice ? 'Verifikasi fakta' : 'Tambahkan harga', patch: a.hasPrice ? 'Pastikan <span class="aed-patch-old">' + a.priceSnippet + '</span> masih sama dengan supplier. Jika berubah: Ubah ke <span class="aed-patch-new">Rp [Harga Baru]</span>' : 'Tambahkan teks harga (Misal: <span class="aed-patch-new">Rp 850.000 / m³</span>)' },
      { section: 'Teks Bulan/Tahun', detected: a.dateSnippet !== 'Tidak terdeteksi' ? '"' + a.dateSnippet + '"' : 'Tidak terdeteksi', action: 'Update bulan/tahun', patch: a.dateSnippet !== 'Tidak terdeteksi' ? 'Ubah <span class="aed-patch-old">' + a.dateSnippet + '</span> menjadi <span class="aed-patch-new">' + currentMonthYear + '</span>' : 'Tambah kalimat: <span class="aed-patch-new">Berlaku per ' + currentMonthYear + '</span>' },
      { section: 'FAQ', detected: a.faqCount + ' item terdeteksi', action: a.faqCount < 3 ? 'Tambah FAQ' : 'Cek relevansi', patch: a.faqCount < 3 ? 'Lihat Template FAQ di bawah' : 'Tambahkan 1 pertanyaan terbaru dari CS bulan ini di urutan paling bawah.' }
    ];

    if (a.h1YearOutdated) guide.issues.push({ level: 'critical', text: 'Tahun di H1 (' + a.h1Year + ') usang. Current: ' + a.currentYear + '.' });
    if (a.outdatedYears.length > 0) guide.issues.push({ level: 'warning', text: 'Tahun usang di konten: ' + a.outdatedYears.join(', ') });
    if ((contentFocus === 'HARGA' || contentFocus === 'GABUNG') && !a.hasPrice) guide.issues.push({ level: 'critical', text: 'Tidak ada harga (Rp...) padahal content focus = HARGA.' });
    if (!a.hasWA && pageLevel.indexOf('money') === 0) guide.issues.push({ level: 'warning', text: 'Nomor WA/telepon tidak terdeteksi.' });
    if (a.faqCount < 3) guide.issues.push({ level: 'warning', text: 'FAQ terdeteksi hanya ' + a.faqCount + ' (ideal ≥ 3).' });
    if (!a.hasTable && pageLevel.indexOf('money') === 0) guide.issues.push({ level: 'warning', text: 'Tidak ada tabel — idealnya ada tabel harga/spesifikasi.' });
    if (a.wordCount < 500) guide.issues.push({ level: 'warning', text: 'Konten tipis: ' + a.wordCount + ' kata (ideal ≥ 500).' });
    if (daysUntilReview < 0) guide.issues.push({ level: 'critical', text: '🚨 EXPIRED ' + Math.abs(daysUntilReview) + ' hari. Action required.' });

    if (pageLevel === 'pillar' || pageLevel === 'sub-pillar-tipe-1' || pageLevel === 'sub-pillar-tipe-2') {
      guide.priorityActions = ['✅ Verify topik masih relevan dengan trend ' + a.currentYear + '.', '✅ Cek standar/regulasi (SNI, PUPR) masih update.', '💡 Tambah 1 FAQ dari pertanyaan pembaca terbaru.', '💡 Update contoh kasus dengan data ' + a.currentYear + '.'];
    } else if (isMoney) {
      var levelLabel = { 'money-master': 'Range harga per mutu + wilayah', 'money-page': 'Harga fixed 1 produk', 'money-child': 'Harga fixed + wilayah (PALING KRITIS)', 'variant': 'Spesifikasi + harga varian', 'sub-variant': 'Spesifikasi + harga sub-varian' };
      guide.priorityActions = ['🚨 Verify harga dengan supplier real-time.', '🚨 Cek stok/varian masih tersedia.', '🚨 Cek nomor WA/telepon masih aktif.', '✅ Cek syarat order (min order, ongkir, PPN) masih sama.', '📌 Level: ' + (levelLabel[pageLevel] || pageLevel)];
    } else { guide.priorityActions = ['✅ Verify panduan masih akurat.', '💡 Tambah 1 FAQ baru.']; }

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
      guide.minimalChanges = ['1. Update "Berlaku per [bulan] ' + a.currentYear + '" di paragraf pembuka.', '2. Tambah 1 FAQ dari pertanyaan CS bulan ini.', '3. Update tanggal "Terakhir diperbarui: [bulan] ' + a.currentYear + '" di body (kalau ada).', '4. Tambah 1 testimoni pelanggan terbaru (nama + wilayah + proyek).', '5. Reorder FAQ: taruh yang paling sering ditanya di atas.'];
    } else if (pageLevel === 'pillar' || pageLevel.indexOf('sub-pillar') === 0) {
      guide.minimalChanges = ['1. Tambah 1 FAQ baru (paling ringan & aman).', '2. Update statistik/contoh kasus dengan data ' + a.currentYear + '.', '3. Update screenshot/gambar ke versi terbaru.', '4. Cek internal link — tambah 1 link ke halaman baru.'];
    } else { guide.minimalChanges = ['1. Tambah 1 FAQ baru.', '2. Update contoh/kasus dengan data ' + a.currentYear + '.']; }

    guide.checklist = ['□ Buka halaman di browser — verify tampilan normal', '□ Cek harga dengan supplier (WA/telp) — sama atau berubah?', '□ Cek nomor WA/telepon masih aktif', '□ Cek stok/varian masih tersedia', '□ Cek wilayah layanan masih sama', '□ Cek syarat order (min order, ongkir, PPN)', '□ Buka Blogger editor — edit minimal 1 elemen', '□ Save & Publish', '□ Reload halaman → banner hilang ✅'];
    return guide;
  }
 
  function showGuideModal(guide) {
    var existing = document.getElementById('aed-guide-modal'); if (existing) existing.remove();
    var statusClass = guide.meta.status === 'FRESH' ? 'status-fresh' : (guide.meta.status === 'WARNING' ? 'status-warning' : 'status-expired');
    var issuesHtml = guide.issues.length > 0 ? guide.issues.map(function(i) { return '<div class="aed-guide-issue-' + i.level + '">' + i.text + '</div>'; }).join('') : '<p style="color:#16a34a;font-weight:600;">✅ Tidak ada issue signifikan terdeteksi. Halaman dalam kondisi baik.</p>';
    var priorityHtml = '<ul class="aed-guide-list">' + guide.priorityActions.map(function(p) { return '<li>' + p + '</li>'; }).join('') + '</ul>';
    
    // 1. PATCH TABLE
    var patchHtml = '<table class="aed-guide-section-table"><thead><tr><th>Bagian</th><th>Terdeteksi</th><th>Action</th><th>Saran Revisi (Patch)</th></tr></thead><tbody>' + 
      guide.patches.map(function(p) { 
        return '<tr><td><strong>' + p.section + '</strong></td><td style="font-size:0.8rem">' + p.detected + '</td><td style="font-size:0.8rem">' + p.action + '</td><td><div class="aed-patch-box">' + p.patch + '</div></td></tr>'; 
      }).join('') + '</tbody></table>';

    // 2. SECTION TABLE (DARI V17.6.2)
    var sectionTableHtml = '<table class="aed-guide-section-table"><thead><tr><th>Section</th><th>Action</th></tr></thead><tbody>' +
      guide.sectionGuide.map(function(s) { return '<tr><td><strong>' + s.section + '</strong></td><td>' + s.action + '</td></tr>'; }).join('') +
      '</tbody></table>';

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
          '<div class="aed-guide-section"><h3>✍️ Draf Paragraf Pembuka (Siap Copy-Paste)</h3><textarea class="aed-copy-box" readonly>' + guide.patchParagraph + '</textarea></div>' +
          '<div class="aed-guide-section"><h3>❓ Template FAQ Baru</h3><textarea class="aed-copy-box" style="border-left-color: #f59e0b;" readonly>' + guide.patchFaq + '</textarea></div>' +
          '<div class="aed-guide-section"><h3>📋 Panduan per Section</h3>' + sectionTableHtml + '</div>' +
          '<div class="aed-guide-section"><h3>🎯 Priority Actions</h3>' + priorityHtml + '</div>' +
          '<div class="aed-guide-section"><h3>💡 Minimal Changes (kalau fakta masih sama)</h3>' + minimalHtml + '</div>' +
          '<div class="aed-guide-section"><h3>✅ Checklist Eksekusi</h3>' + checklistHtml + '</div>' +
          '<div class="aed-guide-section">' +
            '<h3>🚨 Emergency Option (Tombol Darurat)</h3>' +
            '<div class="aed-guide-issue-critical" style="font-size:0.85rem; margin-bottom:12px;">' +
              '<strong>Fungsi:</strong> Menyembunyikan banner dan mereset tanggal <code>dateModified</code> & <code>nextUpdate</code> secara instan agar halaman terlihat "Fresh" di layar Anda.<br><br>' +
              '<strong>⚠️ PERINGATAN KERAS:</strong><br>' +
              '1. <strong>Tidak Persist:</strong> Hanya berubah di browser Anda saat ini. Jika di-refresh (F5), tanggal akan kembali seperti semula.<br>' +
              '2. <strong>Googlebot Tidak Melihat:</strong> Google tetap melihat tanggal lama, sehingga ini <strong>TIDAK</strong> menyelesaikan masalah SEO.<br>' +
              '3. <strong>Risiko Date Manipulation:</strong> Jika sering dipakai tanpa edit konten asli, berisiko penalti SEO.<br><br>' +
              '<strong>Kapan Dipakai?</strong> HANYA untuk keadaan darurat (misal: presentasi ke klien mendadak, tapi Anda tidak bisa login ke Blogger).<br><br>' +
               '<strong>Cara Pakai:</strong><br>' +
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

    modal.querySelectorAll('[data-aed-close]').forEach(function(el) {
      el.addEventListener('click', closeGuideModal);
    });

    // 🆕 v17.8.2: Fitur Copy Command
    var copyBtn = document.getElementById('aed-copy-cmd-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function() {
        var input = document.getElementById('aed-emergency-cmd');
        input.select();
        input.setSelectionRange(0, 99999);
        try {
          document.execCommand('copy');
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(input.value);
          }
          var btn = this;
          var originalText = btn.innerHTML;
          btn.innerHTML = '✅ Copied!';
          btn.style.background = '#16a34a'; // Warna hijau sukses
          setTimeout(function() {
            btn.innerHTML = originalText;
            btn.style.background = '#3b82f6'; // Kembali ke biru
          }, 2000);
        } catch (err) {
          console.error('Failed to copy', err);
        }
      });
    }

    if (!window._aedGuideEscHandler) { window._aedGuideEscHandler = function(e) { if (e.key === 'Escape') closeGuideModal(); }; document.addEventListener('keydown', window._aedGuideEscHandler); }
  }

  function closeGuideModal() { var m = document.getElementById('aed-guide-modal'); if (m) m.remove(); document.body.style.overflow = ''; if (window._aedGuideEscHandler) { document.removeEventListener('keydown', window._aedGuideEscHandler); window._aedGuideEscHandler = null; } }
  var _guideClickCount = 0; var _guideClickTimer = null;
  function handleGuideButtonClick() { _guideClickCount++; var hint = document.getElementById('aed-guide-hint'); if (_guideClickTimer) clearTimeout(_guideClickTimer); if (_guideClickCount === 1) { if (hint) hint.textContent = GUIDE_CONFIG.BUTTON_HINT_1; _guideClickTimer = setTimeout(function() { _guideClickCount = 0; if (hint) hint.textContent = ''; }, GUIDE_CONFIG.CLICK_RESET_MS); } else if (_guideClickCount === 2) { if (hint) hint.textContent = GUIDE_CONFIG.BUTTON_HINT_2; _guideClickTimer = setTimeout(function() { _guideClickCount = 0; if (hint) hint.textContent = ''; }, GUIDE_CONFIG.CLICK_RESET_MS); } else if (_guideClickCount >= GUIDE_CONFIG.CLICKS_TO_OPEN) { _guideClickCount = 0; if (hint) hint.textContent = ''; openGuideFromCurrentPage(); } }
  function openGuideFromCurrentPage() { var pl = document.body.getAttribute('data-page-level') || 'pillar'; var cf = document.body.getAttribute('data-content-focus') || 'INFORMASI'; var ft = (document.body.getAttribute('data-content-type') || (EVERGREEN_LEVELS.indexOf(pl) !== -1 ? 'evergreen' : 'non-evergreen')); var vd = getValidityByContext(pl, cf); var mn = document.querySelector('meta[name="nextUpdate"]'); var dur = mn ? Math.ceil((new Date(mn.content) - new Date()) / 86400000) : 0; showGuideModal(generatePageGuide(pl, cf, ft, vd, dur)); }
  function injectGuideButton() { if (!GUIDE_CONFIG.ENABLED) return; if (GUIDE_CONFIG.ADMIN_ONLY && !isAdmin()) return; if (document.getElementById('aed-guide-btn')) return; var h1 = document.querySelector('h1'); if (!h1) return; var wrap = document.createElement('div'); wrap.id = 'aed-guide-btn-wrap'; wrap.setAttribute('data-nosnippet', ''); var btn = document.createElement('button'); btn.id = 'aed-guide-btn'; btn.type = 'button'; btn.setAttribute('data-nosnippet', ''); btn.setAttribute('aria-label', 'Buka panduan update halaman'); btn.textContent = GUIDE_CONFIG.BUTTON_TEXT; btn.addEventListener('click', handleGuideButtonClick); var hint = document.createElement('span'); hint.id = 'aed-guide-hint'; hint.setAttribute('data-nosnippet', ''); wrap.appendChild(btn); wrap.appendChild(hint); h1.parentNode.insertBefore(wrap, h1.nextSibling); }

  function initAdminKeyboardShortcut() { var count = 0; var timer = null; document.addEventListener('keydown', function(e) { if (!document.hasFocus()) return; var activeEl = document.activeElement; if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) return; if (e.key === 'Enter') { count++; if (timer) clearTimeout(timer); showToast('Tekan ENTER ' + (3 - count) + 'x lagi untuk Admin Mode...'); if (count >= 3) { count = 0; localStorage.setItem('aed-is-admin', 'true'); showToast('✅ Admin Mode Aktif! Reloading...'); setTimeout(function() { location.reload(); }, 1000); } else { timer = setTimeout(function() { count = 0; hideToast(); }, 3000); } } }); }
  function showToast(msg) { var t = document.getElementById('aed-admin-toast'); if (!t) { t = document.createElement('div'); t.id = 'aed-admin-toast'; t.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#1e293b; color:#fff; padding:10px 20px; border-radius:8px; font-family:sans-serif; font-size:14px; z-index:999999; transition:opacity 0.3s; box-shadow:0 4px 12px rgba(0,0,0,0.15); pointer-events:none;'; document.body.appendChild(t); } t.textContent = msg; t.style.opacity = '1'; }
  function hideToast() { var t = document.getElementById('aed-admin-toast'); if (t) t.style.opacity = '0'; }

  async function detectEvergreen(opts) { opts = opts || {}; var cdm = opts.customDateModified || null; var fb = opts.forceBump === true; if (_AED_INITIALIZED) return; _AED_INITIALIZED = true; injectWarningStyles(); await waitForPageLevelDetector(); var r = getPageLevelAndEntityType(); var hd = detectContentTypeByH1(); var cf = getContentFocus(hd, r.pageLevel, r.entityType); var rule = getRulesByEntityType(r.entityType, r.pageLevel, hd, cf); var ft = rule.type; var vd = rule.validityDays; var vm = vd * 86400000; var cc = detectContentChangeSinceLastVisit(); var au = false; if (fb) au = autoUpdateDates(r.pageLevel, cf, { forceBump: true }); else if (cc.changed) au = autoUpdateDates(r.pageLevel, cf, { forceBump: true }); else au = autoUpdateDates(r.pageLevel, cf); await processMetaDates(cdm, ft, vm, rule.usePriceValidUntil, r.pageLevel, r.entityType, rule.ctaIntensity, rule.allowPriceRange, r.detectorVersion, null, null, null, rule.overridden || false, rule.overrideReason || null, hd, cf, au); checkAndShowInlineWarning(r.pageLevel, cf); injectAuthorByline(); injectGuideButton(); window.dispatchEvent(new Event("detectEvergreenReady")); }

  window.aedEmergencyVerify = function(customDate, opts) { opts = opts || {}; if (!opts.confirm) return null; customDate = customDate || toISOWithTimezoneLocal(new Date()); var pl = document.body.getAttribute('data-page-level') || 'money-page'; var cf = document.body.getAttribute('data-content-focus') || 'HARGA'; var vd = getValidityByContext(pl, cf); var mm = document.querySelector('meta[itemprop="dateModified"]'); if (!mm) { mm = document.createElement('meta'); mm.setAttribute('itemprop', 'dateModified'); document.head.appendChild(mm); } mm.setAttribute('content', customDate); var nu = toISOWithTimezoneLocal(new Date(new Date(customDate).getTime() + vd * 86400000)); var mn = document.querySelector('meta[name="nextUpdate"]'); if (!mn) { mn = document.createElement('meta'); mn.setAttribute('name', 'nextUpdate'); document.head.appendChild(mn); } mn.setAttribute('content', nu); updateJsonLdDates(customDate, nu); document.querySelectorAll('[itemtype="http://schema.org/Offer"]').forEach(function(el) { el.setAttribute('priceValidUntil', nu); }); document.body.removeAttribute('data-aed-needs-review'); document.body.removeAttribute('data-aed-review-reason'); document.body.removeAttribute('data-aed-warning-severity'); document.body.removeAttribute('data-aed-warning-days'); document.body.removeAttribute('data-aed-warning-stuck'); document.body.removeAttribute('data-aed-warning-stuck-days'); var b = document.getElementById('aed-update-warning'); if (b) b.remove(); if (window.AEDMetaDates) { window.AEDMetaDates.dateModified = customDate; window.AEDMetaDates.nextUpdate = nu; window.AEDMetaDates.priceValidUntil = nu; window.AEDMetaDates.needsManualVerify = false; window.AEDMetaDates.lastEmergencyVerify = customDate; window.AEDMetaDates.updateCount = (window.AEDMetaDates.updateCount || 0) + 1; } try { var ad = { date: customDate, nextUpdate: nu, validityDays: vd, pageLevel: pl, contentFocus: cf, verifiedAt: new Date().toISOString(), method: 'emergency' }; localStorage.setItem('aed-emergency-verified-' + location.pathname, JSON.stringify(ad)); localStorage.setItem('aed-verified-' + location.pathname, JSON.stringify(ad)); } catch(e) {} try { window.dispatchEvent(new CustomEvent('aedVerified', { detail: { dateModified: customDate, nextUpdate: nu, validityDays: vd, pageLevel: pl, contentFocus: cf, method: 'emergency' } })); } catch(e) {} return { dateModified: customDate, nextUpdate: nu, validityDays: vd, pageLevel: pl, contentFocus: cf }; };
  window.aedVerifyNow = function(customDate) { return window.aedEmergencyVerify(customDate, { confirm: true }); };
  window.aedShowEditGuide = function() { var pl = document.body.getAttribute('data-page-level') || 'pillar'; var cf = document.body.getAttribute('data-content-focus') || 'INFORMASI'; var ft = (EVERGREEN_LEVELS.indexOf(pl) !== -1) ? 'evergreen' : 'non-evergreen'; var vd = getValidityByContext(pl, cf); var mn = document.querySelector('meta[name="nextUpdate"]'); var dur = mn ? Math.ceil((new Date(mn.content) - new Date()) / 86400000) : 0; var g = generatePageGuide(pl, cf, ft, vd, dur); console.log('📖 PAGE GUIDE:', g.meta); if (g.issues.length > 0) console.log('Issues:', g.issues); console.log('Priority:', g.priorityActions); console.log('Minimal Changes:', g.minimalChanges); };
  window.aedCheckStatus = function() { if (!window.AEDMetaDates) return null; var mm = document.querySelector('meta[itemprop="dateModified"]'); var mn = document.querySelector('meta[name="nextUpdate"]'); var mp = document.querySelector('meta[itemprop="datePublished"]'); var ad = null; try { var rn = localStorage.getItem('aed-emergency-verified-' + location.pathname); if (rn) ad = JSON.parse(rn); else { var rl = localStorage.getItem('aed-verified-' + location.pathname); if (rl) { ad = JSON.parse(rl); ad._source = 'legacy-key'; } } } catch (e) {} var dur = mn ? Math.ceil((new Date(mn.content) - new Date()) / 86400000) : null; var s = { datePublished: mp ? mp.content : null, dateModified: mm ? mm.content : null, nextUpdate: mn ? mn.content : null, daysUntilReview: dur, needsManualVerify: document.body.getAttribute('data-aed-needs-review') === 'true', warningSeverity: document.body.getAttribute('data-aed-warning-severity'), lastEmergencyVerify: ad, aedData: window.AEDMetaDates }; console.table(s); return s; };

  window.detectEvergreen = detectEvergreen; window.__detectEvergreenReady = true; initAdminKeyboardShortcut();
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", function () { setTimeout(function () { detectEvergreen(); }, 100); }, { once: true }); } else { setTimeout(function () { detectEvergreen(); }, 100); }
})();
