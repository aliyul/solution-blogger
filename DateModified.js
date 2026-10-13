/* ============================================================
 🔥 Hybrid Date Modified v10.2 — PURE CONSUMER
    ✅ FIX-SYNC-v3: HAPUS semua duplikasi logika dari AED & PLD
    ✅ Hybrid = KONSUMEN SAJA — baca AEDMetaDates, tulis meta tag
    ✅ Tugas unik Hybrid:
       1. Hash offset per URL (anti duplicate date)
       2. Write meta tag dateModified
       3. Skip homepage & static pages

    ❌ DIHAPUS dari v10.1:
       - EVERGREEN_LEVELS + MONEY_LEVELS konstanta (duplikat AED)
       - detectContentFocus() (duplikat PLD)
       - getCustomDateByPageLevel() (duplikat AED)
       - getCategoryLabel() (duplikat AED)
       - hasPriceTable() cek sendiri (duplikat AED)
       - Cek tahun H1 sendiri (duplikat AED)
       - Putuskan EE/NE sendiri (duplikat AED)

    ✅ PRESERVED dari v10.1:
       - Skip homepage & static pages
       - Guard _HYBRID_INITIALIZED
       - Timeout PLD/AED/Breadcrumb
       - Skip updateMetaDateModified kalau tanggal sama

    ✅ COMPATIBLE dengan:
       - PLD v23.9.8-LITE-PERF-CONTENT-FIX
       - AED v17.4.1-LITE
       - Breadcrumb v12.3.5-LITE

    📌 File length: ~230 baris (dari ~750 baris di v10.1)
============================================================ */

(function () {
  "use strict";

  // ═══ Guard global — cegah double init ═══
  if (window.__hybridDateModifiedVersion === "10.2") {
    console.log("[HybridDateModified v10.2] ⏭️ Sudah dijalankan — skip");
    return;
  }
  window.__hybridDateModifiedVersion = "10.2";

  // ═══════════════════════════════════════════════════════════
  // SKIP HALAMAN STATIS — EARLY (sebelum DOMContentLoaded)
  // ═══════════════════════════════════════════════════════════
  (function checkSkipEarly() {
    const CURRENT_DOMAIN = window.location.hostname;
    if (CURRENT_DOMAIN !== 'www.betonjayareadymix.com' && !CURRENT_DOMAIN.includes('localhost')) {
      window.__HYBRID_SKIP_REASON = 'domain-not-targeted';
      return;
    }

    const currentPath = window.location.pathname;
    const STATIC_PAGES = [
      '/p/hubungi-kami.html',
      '/p/portofolio.html',
      '/p/disclaimer.html',
      '/p/privacy-policy.html',
      '/p/terms-of-service.html',
      '/p/useful-links.html',
      '/p/about.html',
      '/p/sitemap.html'
    ];

    const isHomepage = currentPath === '/' || currentPath === '/index.html' || currentPath === '';
    if (isHomepage) {
      window.__HYBRID_SKIP_REASON = 'homepage';
      return;
    }

    const isStaticPage = STATIC_PAGES.some(page => currentPath.includes(page));
    if (isStaticPage) {
      window.__HYBRID_SKIP_REASON = 'static-page';
      return;
    }

    window.__HYBRID_SKIP_REASON = null;
  })();

  // ═══════════════════════════════════════════════════════════
  // TUNGGU DOM READY
  // ═══════════════════════════════════════════════════════════
  if (window.__HYBRID_SKIP_REASON) {
    console.log(`⏸️ [HybridDateModified v10.2] Skip (${window.__HYBRID_SKIP_REASON})`);
  } else if (document.readyState === "loading") {
    console.log("[HybridDateModified v10.2] ⏳ Menunggu DOMContentLoaded...");
    document.addEventListener("DOMContentLoaded", function () {
      console.log("[HybridDateModified v10.2] ✅ DOM siap, menjalankan...");
      runHybridDateModified();
    }, { once: true });
  } else {
    console.log("[HybridDateModified v10.2] ✅ DOM sudah siap, menjalankan...");
    runHybridDateModified();
  }

  // ═══════════════════════════════════════════════════════════
  // FUNGSI UTAMA
  // ═══════════════════════════════════════════════════════════
  async function runHybridDateModified() {
    try {
      // Guard double init
      if (window.__HYBRID_RUNNING) {
        console.log("[HybridDateModified v10.2] ⏭️ Sudah running — skip");
        return;
      }
      window.__HYBRID_RUNNING = true;

      const CURRENT_DOMAIN = window.location.hostname;
      if (CURRENT_DOMAIN !== 'www.betonjayareadymix.com' && !CURRENT_DOMAIN.includes('localhost')) {
        console.log(`⏸️ Domain ${CURRENT_DOMAIN} not targeted.`);
        return;
      }

      const currentPath = window.location.pathname;

      // ═══ SKIP LOGIC — HALAMAN STATIS & HOMEPAGE ═══
      const STATIC_PAGES = [
        '/p/hubungi-kami.html',
        '/p/portofolio.html',
        '/p/disclaimer.html',
        '/p/privacy-policy.html',
        '/p/terms-of-service.html',
        '/p/useful-links.html',
        '/p/about.html',
        '/p/sitemap.html'
      ];

      const isHomepage = currentPath === '/' || currentPath === '/index.html' || currentPath === '';
      const isStaticPage = STATIC_PAGES.some(page => currentPath.includes(page));

      const hasMainContent = document.querySelector('.post-body.entry-content, .post-body, article, main, section');
      const hasH1 = document.querySelector('h1');
      const contentLength = document.body.innerText?.trim()?.length || 0;
      const isContentPage = hasMainContent && hasH1 && contentLength > 500;

      if (isHomepage) {
        console.log(`⏸️ HOMEPAGE terdeteksi (${currentPath}), skip.`);
        return;
      }
      if (isStaticPage) {
        console.log(`⏸️ HALAMAN STATIS terdeteksi (${currentPath}), skip.`);
        return;
      }
      if (!isContentPage) {
        console.log(`⏸️ HALAMAN TANPA KONTEN UTAMA (${currentPath}), skip.`);
        return;
      }

      console.log(`✅ Halaman ${currentPath} LAYAK diproses.`);

      // ═══════════════════════════════════════════════════════
      // MATIKAN SCRIPT VERSI LAMA
      // ═══════════════════════════════════════════════════════
      if (window.runHybridDateModified && window.runHybridDateModified !== runHybridDateModified) {
        window.runHybridDateModified = null;
      }
      if (window.HybridDateModified) {
        window.HybridDateModified = null;
      }
      if (window.__hybridDateModifiedReady && window.__hybridDateModifiedVersion !== "10.2") {
        window.__hybridDateModifiedReady = false;
      }
      const oldScripts = document.querySelectorAll('script[src*="HybridDateModified"], script[src*="hybrid-date"], script[src*="date-modified"]');
      oldScripts.forEach(script => { try { script.remove(); } catch (e) {} });

      window.__hybridDateModifiedActive = 'v10.2';
      window.__hybridDateModifiedReady = true;
      window.runHybridDateModified = runHybridDateModified;

      // ═══════════════════════════════════════════════════════
      // WAIT FOR BREADCRUMB (2s timeout)
      // ═══════════════════════════════════════════════════════
      console.log("🍞 Menunggu breadcrumb terbentuk...");
      const breadcrumbReady = await waitForBreadcrumb(2000);
      if (breadcrumbReady) console.log(`✅ Breadcrumb siap`);
      else console.log(`⏰ Breadcrumb timeout, lanjutkan`);

      // ═══════════════════════════════════════════════════════
      // LOAD SCRIPTS (PLD & AED sudah di HTML)
      // ═══════════════════════════════════════════════════════
      await loadAllScripts();

      // ═══════════════════════════════════════════════════════
      // PANGGIL AED — AED yang putuskan EVERGREEN/NON-EVERGREEN
      // ═══════════════════════════════════════════════════════
      if (typeof window.detectEvergreen !== 'function') {
        console.warn("⚠️ AED tidak tersedia — skip");
        return;
      }

      console.log("🚀 Memanggil AED...");
      await window.detectEvergreen();
      console.log("✅ AED executed");

      if (!window.AEDMetaDates || !window.AEDMetaDates.dateModified) {
        console.warn("[HybridDateModified v10.2] AEDMetaDates tidak ada, skip.");
        return;
      }

      // ═══════════════════════════════════════════════════════
      // 🔥 FIX-SYNC-v3: BACA SEMUA DATA DARI AED + PLD
      // Hybrid TIDAK putuskan apa-apa — hanya baca & pakai
      // ═══════════════════════════════════════════════════════
      const dateModified = window.AEDMetaDates.dateModified;
      const aedType = window.AEDMetaDates.type;
      const detectedPageLevel = window.AEDMetaDates.pageLevel;
      const contentFocus = String(window.AEDMetaDates.contentFocus || '').toUpperCase();
      const categoryFromAED = window.AEDMetaDates.pldKategori || 'UNKNOWN';

      console.log(`📊 Data dari AED:`);
      console.log(`   - type: ${aedType}`);
      console.log(`   - pageLevel: ${detectedPageLevel}`);
      console.log(`   - contentFocus: ${contentFocus}`);
      console.log(`   - category: ${categoryFromAED}`);
      console.log(`   - dateModified (dari AED): ${dateModified}`);

      // ═══════════════════════════════════════════════════════
      // 🔥 FIX-SYNC-v3: HASH SOURCE — berdasarkan aedType
      // Konsisten dengan AED: evergreen / non-evergreen
      // ═══════════════════════════════════════════════════════
      const uniquePageIdentifier = window.location.pathname;
      let hashSource = uniquePageIdentifier;

      if (aedType === 'evergreen') {
        hashSource = 'evergreen-' + detectedPageLevel + '-' + hashSource;
      } else if (aedType === 'non-evergreen') {
        hashSource = 'non-evergreen-' + detectedPageLevel + '-' + hashSource;
      } else if (detectedPageLevel === 'home') {
        hashSource = 'home-evergreen-' + hashSource;
      }

      const hash = stableHash(hashSource);
      const offsetSeconds = hash % 86400;
      const finalDate = new Date(new Date(dateModified).getTime() + offsetSeconds * 1000);
      const isoDate = toISOWithTimezoneLocal(finalDate);

      // ═══ TULIS META TAG ═══
      updateMetaDateModified(isoDate);

      // ═══ ENRICH AEDMetaDates dengan info dari Hybrid ═══
      window.AEDMetaDates = {
        ...window.AEDMetaDates,
        dateModified: isoDate,
        hashOffset: offsetSeconds,
        hybridVersion: '10.2',
        originalDateModified: dateModified,
        breadcrumbReady: breadcrumbReady,
        mode: (aedType === 'evergreen') ? 'MANUAL' : 'AUTO'
      };

      // ═══════════════════════════════════════════════════════
      // LOG FINAL
      // ═══════════════════════════════════════════════════════
      console.log(`✅ [HybridDateModified v10.2] ${uniquePageIdentifier}`);
      console.log(`   → Final Date Modified: ${isoDate}`);
      console.log(`   → Offset: ${offsetSeconds} detik (${Math.floor(offsetSeconds / 3600)} jam ${Math.floor((offsetSeconds % 3600) / 60)} menit)`);
      console.log(`   → Mode: ${window.AEDMetaDates.mode}`);
      console.log(`   → Category (dari AED): ${categoryFromAED}`);
      console.log(`   → Type (dari AED): ${aedType}`);
      console.log(`   → Content Focus (dari AED): ${contentFocus}`);
      console.log(`   → Breadcrumb Ready: ${breadcrumbReady ? '✅' : '⏰'}`);
      console.log(`📋 Hybrid Date Modified v10.2 applied successfully ✅`);

    } catch (err) {
      console.error("[HybridDateModified v10.2] Fatal error:", err);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // HELPER: WAIT FOR BREADCRUMB
  // ═══════════════════════════════════════════════════════════
  function waitForBreadcrumb(timeout) {
    timeout = timeout || 2000;
    return new Promise((resolve) => {
      const startTime = Date.now();

      function checkBreadcrumb() {
        const breadcrumbSelectors = [
          '.breadcrumbs', '.breadcrumb', '.nav-trail', '.breadcrumb-item',
          '.crumbs', '.breadcrumb-link', '[aria-label="breadcrumb"]',
          '.post-breadcrumb', '.breadcrumb-nav', '.nav-breadcrumb'
        ];

        for (const selector of breadcrumbSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            const links = element.querySelectorAll('a');
            if (links.length > 0) {
              console.log(`🍞 Breadcrumb ditemukan (${selector}) — ${links.length} link`);
              resolve(true);
              return;
            }
            if (element.innerText.trim().length > 0) {
              console.log(`🍞 Breadcrumb ditemukan (${selector}) — ada teks`);
              resolve(true);
              return;
            }
          }
        }

        if (Date.now() - startTime > timeout) {
          console.log(`⏰ Breadcrumb timeout (${timeout}ms), lanjutkan`);
          resolve(false);
          return;
        }

        setTimeout(checkBreadcrumb, 100);
      }

      checkBreadcrumb();
    });
  }

  // ═══════════════════════════════════════════════════════════
  // HELPER: LOAD SCRIPTS (PLD & AED sudah di HTML)
  // ═══════════════════════════════════════════════════════════
  async function loadAllScripts() {
    console.log("⏳ Cek PLD & AED...");

    if (typeof window.pageLevelDetectorv22 === "undefined" &&
        typeof window.pageLevelDetectorv20 === "undefined" &&
        typeof window.pageLevelDetectorv19 === "undefined" &&
        typeof window.pageLevelDetectorV18 === "undefined" &&
        typeof window.pageLevelDetectorV17 === "undefined" &&
        typeof window.pageLevelDetector === "undefined") {
      console.log("⏳ Menunggu PLD dari HTML...");
      await waitForPageLevelDetector();
      const ver = window.pageLevelDetectorv22?.version || "unknown";
      console.log(`✅ PLD v${ver} READY`);
    } else {
      const ver = window.pageLevelDetectorv22?.version || "unknown";
      console.log(`✅ PLD v${ver} sudah ada`);
    }

    if (typeof window.detectEvergreen !== "function") {
      console.log("⏳ Menunggu AED dari HTML...");
      await waitForDetectEvergreen();
      console.log("✅ AED READY");
    } else {
      console.log("✅ AED sudah ada");
    }
  }

  // ═══════════════════════════════════════════════════════════
  // HELPER: WAIT FOR PLD
  // ═══════════════════════════════════════════════════════════
  function waitForPageLevelDetector() {
    return new Promise((resolve) => {
      if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
        resolve(true);
        return;
      }
      if (window.pageLevelDetectorv20 && typeof window.pageLevelDetectorv20.detect === 'function') { resolve(true); return; }
      if (window.pageLevelDetectorv19 && typeof window.pageLevelDetectorv19.detect === 'function') { resolve(true); return; }
      if (window.pageLevelDetectorV18 && typeof window.pageLevelDetectorV18.detect === 'function') { resolve(true); return; }
      if (window.pageLevelDetectorV17 && typeof window.pageLevelDetectorV17.detect === 'function') { resolve(true); return; }
      if (window.pageLevelDetector && typeof window.pageLevelDetector.detect === 'function') { resolve(true); return; }

      const onReady = () => { console.log("✅ PLD ready (event)"); resolve(true); };
      window.addEventListener("pageLevelDetectorv22Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorv20Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorv19Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorV19Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorv18Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorReady", onReady, { once: true });

      setTimeout(() => {
        if (window.pageLevelDetectorv22 || window.pageLevelDetectorv20 ||
            window.pageLevelDetectorv19 || window.pageLevelDetectorV18 ||
            window.pageLevelDetector) {
          console.log("✅ PLD ready (timeout fallback 3s)");
          resolve(true);
        } else {
          console.warn("⚠️ PLD tidak terdeteksi");
          resolve(false);
        }
      }, 3000);
    });
  }

  // ═══════════════════════════════════════════════════════════
  // HELPER: WAIT FOR AED
  // ═══════════════════════════════════════════════════════════
  function waitForDetectEvergreen() {
    return new Promise((resolve) => {
      if (window.__detectEvergreenReady && typeof window.detectEvergreen === "function") {
        console.log("✅ AED already ready");
        resolve(true);
        return;
      }

      const onReady = () => { console.log("✅ AED ready (event)"); resolve(true); };
      window.addEventListener("detectEvergreenReady", onReady, { once: true });

      setTimeout(() => {
        window.removeEventListener("detectEvergreenReady", onReady);
        if (typeof window.detectEvergreen === "function") {
          console.log("✅ AED ready (timeout fallback 3s)");
          resolve(true);
        } else {
          console.warn("⚠️ AED tidak terdeteksi");
          resolve(false);
        }
      }, 3000);
    });
  }

  // ═══════════════════════════════════════════════════════════
  // HELPER: TO ISO WITH TIMEZONE
  // ═══════════════════════════════════════════════════════════
  function toISOWithTimezoneLocal(date, offset) {
    offset = offset || "+07:00";
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

  // ═══════════════════════════════════════════════════════════
  // HELPER: STABLE HASH
  // ═══════════════════════════════════════════════════════════
  function stableHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  // ═══════════════════════════════════════════════════════════
  // HELPER: UPDATE META DATE MODIFIED (skip kalau sama)
  // ═══════════════════════════════════════════════════════════
  function updateMetaDateModified(isoDate) {
    const selectors = [
      ['meta[itemprop="dateModified"]', 'itemprop', 'dateModified'],
      ['meta[name="dateModified"]', 'name', 'dateModified'],
      ['meta[property="article:modified_time"]', 'property', 'article:modified_time']
    ];

    selectors.forEach(([selector, attr, val]) => {
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, val);
        document.head.appendChild(meta);
      }
      const currentContent = meta.getAttribute("content");
      if (currentContent === isoDate) {
        console.log(`⏭️ Meta ${val} sudah up-to-date — skip`);
        return;
      }
      meta.setAttribute("content", isoDate);
    });
  }

})();
