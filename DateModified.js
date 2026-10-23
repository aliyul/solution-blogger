/* ============================================================
 🔥 Hybrid Date Modified v10.3a-fix7-PATCH — PURE CONSUMER + AUTO-RUN SYNC
    🩹 PATCH-L  : Remove ALL optional chaining (?.) — 2 operator
    🩹 PATCH-PAD: Remove String.padStart (Chrome 57+)

    🩹 FIX-BUG-1: Clamp finalDate >= datePublished
       - Sebelum: artikel baru bisa punya dateModified < datePublished
       - Sesudah: di-clamp ke datePublished, offset di-rekalibrasi
       - Konsisten dengan schema.org spec (dateModified ≥ datePublished)

    🩹 FIX-BUG-2: Sync JSON-LD dateModified = meta tag dateModified
       - Sebelum: meta[itemprop=dateModified] = offset, JSON-LD = original
       - Sesudah: keduanya = isoDate (offset), konsisten
       - Skip FAQPage/Question/Answer/QAPage (schema beda)

    🩹 FIX-SYNC-v6 (preserved): MUTATE AEDMetaDates (JANGAN reassign)
    🩹 FIX-SYNC-v5 (preserved): dateModified TIDAK di-overwrite
    🩹 FIX-SYNC-v4 (preserved): Tunggu AED selesai (bukan call detectEvergreen)
============================================================ */

(function () {
  "use strict";

  if (window.__hybridDateModifiedVersion === "10.3a") {
    console.log("[HybridDateModified v10.3a-fix7] ⏭️ Sudah dijalankan — skip");
    return;
  }
  window.__hybridDateModifiedVersion = "10.3a";
  window.__hybridDateModifiedBuild = "10.3a-fix7";

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

  if (window.__HYBRID_SKIP_REASON) {
    console.log(`⏸️ [HybridDateModified v10.3a-fix7] Skip (${window.__HYBRID_SKIP_REASON})`);
  } else if (document.readyState === "loading") {
    console.log("[HybridDateModified v10.3a-fix7] ⏳ Menunggu DOMContentLoaded...");
    document.addEventListener("DOMContentLoaded", function () {
      console.log("[HybridDateModified v10.3a-fix7] ✅ DOM siap, menjalankan...");
      runHybridDateModified();
    }, { once: true });
  } else {
    console.log("[HybridDateModified v10.3a-fix7] ✅ DOM sudah siap, menjalankan...");
    runHybridDateModified();
  }

  // ═══════════════════════════════════════════════════════════
  // FUNGSI UTAMA
  // ═══════════════════════════════════════════════════════════
  async function runHybridDateModified() {
    try {
      if (window.__HYBRID_RUNNING) {
        console.log("[HybridDateModified v10.3a-fix7] ⏭️ Sudah running — skip");
        return;
      }
      window.__HYBRID_RUNNING = true;

      const CURRENT_DOMAIN = window.location.hostname;
      if (CURRENT_DOMAIN !== 'www.betonjayareadymix.com' && !CURRENT_DOMAIN.includes('localhost')) {
        console.log(`⏸️ Domain ${CURRENT_DOMAIN} not targeted.`);
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
      const isStaticPage = STATIC_PAGES.some(page => currentPath.includes(page));

      const hasMainContent = document.querySelector('.post-body.entry-content, .post-body, article, main, section');
      const hasH1 = document.querySelector('h1');

      const contentLength = (document.body.innerText || '').trim().length;

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
      if (window.__hybridDateModifiedReady && window.__hybridDateModifiedVersion !== "10.3a") {
        window.__hybridDateModifiedReady = false;
      }
      const oldScripts = document.querySelectorAll('script[src*="HybridDateModified"], script[src*="hybrid-date"], script[src*="date-modified"]');
      oldScripts.forEach(script => { try { script.remove(); } catch (e) {} });

      window.__hybridDateModifiedActive = 'v10.3a';
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
      // TUNGGU AED SELESAI (AED auto-run)
      // ═══════════════════════════════════════════════════════
      console.log("⏳ Menunggu AEDMetaDates terisi (AED auto-run)...");
      const aedReady = await waitForAEDMetaDates(3500);

      if (!aedReady) {
        console.warn("⚠️ [HybridDateModified v10.3a-fix7] AEDMetaDates tidak terisi setelah timeout — skip");
        return;
      }

      console.log("✅ AEDMetaDates siap — Hybrid lanjut konsumsi data");

      // ═══════════════════════════════════════════════════════
      // BACA SEMUA DATA DARI AED + PLD
      // ═══════════════════════════════════════════════════════
      const dateModified = window.AEDMetaDates.dateModified;
      const aedType = window.AEDMetaDates.type;
      const detectedPageLevel = window.AEDMetaDates.pageLevel;
      const contentFocus = String(window.AEDMetaDates.contentFocus || '').toUpperCase();
      const categoryFromAED = window.AEDMetaDates.pldKategori || 'UNKNOWN';
      const aedVersion = window.AEDMetaDates.detectorVersion || 'unknown';

      console.log(`📊 Data dari AED (${aedVersion}):`);
      console.log(`   - type: ${aedType}`);
      console.log(`   - pageLevel: ${detectedPageLevel}`);
      console.log(`   - contentFocus: ${contentFocus}`);
      console.log(`   - category: ${categoryFromAED}`);
      console.log(`   - dateModified (dari AED): ${dateModified}`);

      // ═══════════════════════════════════════════════════════
      // HASH SOURCE — berdasarkan aedType (konsisten AED)
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
      // 🩹 v10.3a-fix8: Range 3 hari (untuk ribuan halaman)
      let offsetSeconds = hash % (86400 * 3);  // 259.200 detik (0-72 jam)
      let finalDate = new Date(new Date(dateModified).getTime() - offsetSeconds * 1000);

      // ═══════════════════════════════════════════════════════
      // 🩹 FIX-BUG-1: Clamp finalDate >= datePublished
      //   Cegah dateModified < datePublished (schema.org invalid)
      // ═══════════════════════════════════════════════════════
      const datePublishedStr =
        (window.AEDMetaDates && window.AEDMetaDates.datePublished) ||
        (document.querySelector('meta[itemprop="datePublished"]') || {}).content ||
        null;
      if (datePublishedStr) {
        const dp = new Date(datePublishedStr);
        if (!isNaN(dp.getTime()) && finalDate.getTime() < dp.getTime()) {
          finalDate = dp;
          // Rekalibrasi offset efektif agar hashOffset konsisten
          offsetSeconds = Math.max(0, Math.floor(
            (new Date(dateModified).getTime() - finalDate.getTime()) / 1000
          ));
          console.log(`🩹 [HybridDateModified] FIX-BUG-1: offset di-clamp dari ${hash % (86400 * 3)}s → ${offsetSeconds}s (datePublished: ${datePublishedStr})`);
        }
      }

      const isoDate = toISOWithTimezoneLocal(finalDate);

      // ═══ TULIS META TAG ═══
      updateMetaDateModified(isoDate);

      // ═══════════════════════════════════════════════════════
      // 🩹 FIX-BUG-2: Sinkronkan JSON-LD dateModified = isoDate
      //   Sebelum: meta=offset, JSON-LD=original (inkonsisten)
      //   Sesudah: keduanya = offset (konsisten untuk Google)
      // ═══════════════════════════════════════════════════════
      const jsonLdSynced = syncJsonLdDateModified(isoDate);
      console.log(`🩹 [HybridDateModified] FIX-BUG-2: ${jsonLdSynced} script JSON-LD disinkronkan`);

      // ═══════════════════════════════════════════════════════
      // MUTATE AEDMetaDates — JANGAN REASSIGN (FIX-SYNC-v6)
      // ═══════════════════════════════════════════════════════
      if (!window.AEDMetaDates || typeof window.AEDMetaDates !== 'object') {
        window.AEDMetaDates = {};
      }

      window.AEDMetaDates.dateModifiedFinal = isoDate;
      window.AEDMetaDates.hashOffset = offsetSeconds;
      window.AEDMetaDates.hybridVersion = '10.3a-fix7';
      window.AEDMetaDates.originalDateModified = dateModified;
      window.AEDMetaDates.originalHashOffset = hash % (86400 * 3);
      window.AEDMetaDates.breadcrumbReady = breadcrumbReady;
      window.AEDMetaDates.mode = (aedType === 'evergreen') ? 'MANUAL' : 'AUTO';

      window.__HYBRID_DATE_FINAL_READY = true;
      try {
        window.dispatchEvent(new CustomEvent('hybridDateFinalReady', {
          detail: { dateModifiedFinal: isoDate, hashOffset: offsetSeconds }
        }));
      } catch (e) {
        try {
          var evt = document.createEvent('Event');
          evt.initEvent('hybridDateFinalReady', true, true);
          window.dispatchEvent(evt);
        } catch (e2) {}
      }

      // ═══════════════════════════════════════════════════════
      // LOG FINAL
      // ═══════════════════════════════════════════════════════
      console.log(`✅ [HybridDateModified v10.3a-fix7] ${uniquePageIdentifier}`);
      console.log(`   → Meta Tag dateModified: ${isoDate}`);
      console.log(`   → Schema dateModified (AED): ${dateModified}`);
      console.log(`   → dateModifiedFinal (offset): ${isoDate}`);
      console.log(`   → Offset: ${offsetSeconds} detik (${Math.floor(offsetSeconds / 3600)} jam ${Math.floor((offsetSeconds % 3600) / 60)} menit)`);
      console.log(`   → Mode: ${window.AEDMetaDates.mode}`);
      console.log(`   → Category (dari AED): ${categoryFromAED}`);
      console.log(`   → Type (dari AED): ${aedType}`);
      console.log(`   → Content Focus (dari AED): ${contentFocus}`);
      console.log(`   → Breadcrumb Ready: ${breadcrumbReady ? '✅' : '⏰'}`);
      console.log(`   → JSON-LD synced: ${jsonLdSynced} script`);
      console.log(`   → dateModifiedFinal Ready: ✅ (MUTATED in-place)`);
      console.log(`   → Consumer reference preserved: ✅ (no reassign)`);
      console.log(`📋 Hybrid Date Modified v10.3a-fix7 applied — SYNC SAFE + SCHEMA VALID ✅`);

    } catch (err) {
      console.error("[HybridDateModified v10.3a-fix7] Fatal error:", err);
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
  // HELPER: WAIT FOR AEDMetaDates
  // ═══════════════════════════════════════════════════════════
  function waitForAEDMetaDates(timeout) {
    timeout = timeout || 3500;
    return new Promise((resolve) => {
      if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
        console.log("✅ AEDMetaDates already ready (instant)");
        resolve(true);
        return;
      }

      let resolved = false;

      const finish = (ok) => {
        if (resolved) return;
        resolved = true;
        resolve(ok);
      };

      const onReady = () => {
        console.log("✅ AED ready (event detectEvergreenReady)");
        finish(true);
      };
      window.addEventListener("detectEvergreenReady", onReady, { once: true });

      const startTime = Date.now();
      const pollInterval = setInterval(() => {
        if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
          clearInterval(pollInterval);
          window.removeEventListener("detectEvergreenReady", onReady);
          console.log("✅ AEDMetaDates ready (polling)");
          finish(true);
          return;
        }
        if (Date.now() - startTime > timeout) {
          clearInterval(pollInterval);
          window.removeEventListener("detectEvergreenReady", onReady);
          console.warn(`⏰ AEDMetaDates timeout (${timeout}ms)`);
          finish(false);
        }
      }, 100);
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 🩹 FIX-BUG-2: HELPER — Sync JSON-LD dateModified
  //   - Update semua node (Article, Product, WebPage, dll.)
  //   - SKIP FAQPage / Question / Answer / QAPage (schema beda)
  //   - Idempoten: tidak tulis ulang kalau nilai sama
  // ═══════════════════════════════════════════════════════════
  function syncJsonLdDateModified(isoDate) {
    if (!isoDate) return 0;
    var updated = 0;
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      var s = scripts[i];
      var raw = s.textContent;
      if (!raw || raw.indexOf('"dateModified"') === -1) continue;
      var j;
      try { j = JSON.parse(raw); } catch (e) { continue; }
      var nodes = Array.isArray(j) ? j
                : (j['@graph'] && Array.isArray(j['@graph']) ? j['@graph'] : [j]);
      var changed = false;
      for (var k = 0; k < nodes.length; k++) {
        var n = nodes[k];
        if (!n || typeof n !== 'object') continue;
        var ts = (n['@type'] || '').toString();
        if (ts.indexOf('FAQPage') !== -1 || ts.indexOf('Question') !== -1 ||
            ts.indexOf('Answer') !== -1 || ts.indexOf('QAPage') !== -1) continue;
        if (n.dateModified !== undefined && n.dateModified !== isoDate) {
          n.dateModified = isoDate;
          changed = true;
        }
      }
      if (changed) {
        try {
          s.textContent = JSON.stringify(j, null, 2);
          updated++;
        } catch (e) {}
      }
    }
    return updated;
  }

  // ═══════════════════════════════════════════════════════════
  // HELPER: TO ISO WITH TIMEZONE
  // 🩹 PATCH-PAD: padStart → inline ternary (Chrome 49+)
  // ═══════════════════════════════════════════════════════════
  function toISOWithTimezoneLocal(date, offset) {
    offset = offset || "+07:00";
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const pad = (n) => (n < 10 ? '0' : '') + n;
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

  // ═══════════════════════════════════════════════════════════
  // CLEANUP LOG
  // ═══════════════════════════════════════════════════════════
  console.log("═══════════════════════════════════════════════════════════");
  console.log("✅ Hybrid Date Modified v10.3a-fix7-PATCH — PURE CONSUMER + MUTATE-SAFE");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🩹 FIX-BUG-1: Clamp dateModified >= datePublished (schema valid)");
  console.log("🩹 FIX-BUG-2: Sync JSON-LD dateModified = meta tag (konsisten untuk Google)");
  console.log("🩹 PATCH-L  : Remove ALL optional chaining (?.) — Chrome 49+ compatible");
  console.log("🩹 PATCH-PAD: Remove String.padStart — Chrome 49+ compatible");
  console.log("🩹 FIX-SYNC-v6: MUTATE AEDMetaDates (JANGAN reassign)");
  console.log("🩹 FIX-SYNC-v6: Consumer reference tetap valid → dateModifiedFinal terbaca");
  console.log("🔥 FIX-SYNC-v5: dateModified TIDAK di-overwrite (race fix)");
  console.log("🔥 FIX-SYNC-v4: Kompatibel PLD v23.9.9 + AED v17.9.x");
  console.log("✅ Tugas Hybrid: hash offset + write meta + JSON-LD + dateModifiedFinal (mutate)");
  console.log("⚠️  Consumer MUST read dateModifiedFinal (bukan dateModified)");
  console.log("═══════════════════════════════════════════════════════════");

})();
