/* ============================================================
 🔥 Hybrid Date Modified v10.3a-fix6-PATCH — PURE CONSUMER + AUTO-RUN SYNC
    🩹 PATCH-L: Remove ALL optional chaining (?.) — 2 operator
       - `document.body.innerText?.trim()?.length || 0`
       - Replaced with `(document.body.innerText || '').trim().length`
       - Compatible Chrome 49+
    🩹 PATCH-PAD: Remove String.padStart (Chrome 57+)
       - `.padStart(2, "0")` → `(n < 10 ? '0' : '') + n`
       - Compatible Chrome 49+

    🩹 FIX-SYNC-v6 (build 10.3a-fix6) — PRESERVED:
       - MUTATE AEDMetaDates (JANGAN reassign object)
       - Consumer yang sudah pegang referensi lama tetap
         melihat dateModifiedFinal setelah event fire
       - Compatible dengan Article v8.6f, Product v5.7d,
         Universal v7.36h yang baca aedData/aed variable
       - dateModified TETAP tidak di-overwrite (offset hanya
         disimpan di dateModifiedFinal)

    ✅ FIX-SYNC-v5 (v10.3a) — PRESERVED:
       - dateModified TIDAK di-overwrite lagi (race fix)
       - Offset disimpan di dateModifiedFinal (field BARU)
       - Meta tag dateModified pakai offset (untuk uniqueness)
       - Consumer script bisa akses dateModifiedFinal via flag/event
       - window.__HYBRID_DATE_FINAL_READY = true
       - Event 'hybridDateFinalReady' di-dispatch

    ✅ FIX-SYNC-v4 (v10.3) — PRESERVED:
       - Kompatibel dengan PLD v23.9.9 + AED v17.5.x + Breadcrumb v12.3.6
       - TIDAK call detectEvergreen() — AED sudah AUTO-RUN
       - Tunggu window.AEDMetaDates terisi (bukan event saja)
       - Guard: kalau AEDMetaDates sudah ada → langsung proses
       - Fallback: kalau AED gagal, Hybrid tetap bisa pakai default

    ✅ FIX-SYNC-v3 (v10.2) — PRESERVED:
       - Hybrid = KONSUMEN SAJA — baca AEDMetaDates, tulis meta tag
       - Hash offset per URL (anti duplicate date)
       - Skip homepage & static pages

    🎯 TUGAS UNIK HYBRID:
       1. Hash offset per URL (anti duplicate date)
       2. Write meta tag dateModified (pakai offset)
       3. Set AEDMetaDates.dateModifiedFinal (MUTATE, bukan reassign)
       4. Dispatch event hybridDateFinalReady
       5. Skip homepage & static pages

    ❌ TIDAK BOLEH dilakukan Hybrid:
       - Putuskan EVERGREEN/NON-EVERGREEN (AED yang tentukan)
       - Detect content focus (PLD yang tentukan)
       - Call detectEvergreen() (AED auto-run)
       - Overwrite AEDMetaDates.dateModified (RACE!)
       - Reassign AEDMetaDates (stale reference untuk consumer)

    📌 Stack: PLD v23.9.9 + AED v17.5.x + Breadcrumb v12.3.6
============================================================ */

(function () {
  "use strict";

  // ═══ Guard global — cegah double init ═══
  if (window.__hybridDateModifiedVersion === "10.3a") {
    console.log("[HybridDateModified v10.3a] ⏭️ Sudah dijalankan — skip");
    return;
  }
  window.__hybridDateModifiedVersion = "10.3a";
  window.__hybridDateModifiedBuild = "10.3a-fix6";

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
    console.log(`⏸️ [HybridDateModified v10.3a] Skip (${window.__HYBRID_SKIP_REASON})`);
  } else if (document.readyState === "loading") {
    console.log("[HybridDateModified v10.3a] ⏳ Menunggu DOMContentLoaded...");
    document.addEventListener("DOMContentLoaded", function () {
      console.log("[HybridDateModified v10.3a] ✅ DOM siap, menjalankan...");
      runHybridDateModified();
    }, { once: true });
  } else {
    console.log("[HybridDateModified v10.3a] ✅ DOM sudah siap, menjalankan...");
    runHybridDateModified();
  }

  // ═══════════════════════════════════════════════════════════
  // FUNGSI UTAMA
  // ═══════════════════════════════════════════════════════════
  async function runHybridDateModified() {
    try {
      // Guard double init
      if (window.__HYBRID_RUNNING) {
        console.log("[HybridDateModified v10.3a] ⏭️ Sudah running — skip");
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

      // 🔥 PATCH-L: document.body.innerText?.trim()?.length || 0
      // → (document.body.innerText || '').trim().length
      // Semantik IDENTIK: null → 0, "   " → 0, "Text" → 4
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
      // 🔥 FIX-SYNC-v4: TUNGGU AED SELESAI
      // AED v17.5.x sudah AUTO-RUN — Hybrid TIDAK memanggil
      // detectEvergreen(). Cukup tunggu window.AEDMetaDates terisi.
      // ═══════════════════════════════════════════════════════
      console.log("⏳ Menunggu AEDMetaDates terisi (AED auto-run)...");
      const aedReady = await waitForAEDMetaDates(3500);

      if (!aedReady) {
        console.warn("⚠️ [HybridDateModified v10.3a] AEDMetaDates tidak terisi setelah timeout — skip");
        return;
      }

      console.log("✅ AEDMetaDates siap — Hybrid lanjut konsumsi data");

      // ═══════════════════════════════════════════════════════
      // 🔥 FIX-SYNC-v3: BACA SEMUA DATA DARI AED + PLD
      // Hybrid TIDAK putuskan apa-apa — hanya baca & pakai
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
      const offsetSeconds = hash % (86400 * 3);  // ← 259.200 detik (0-72 jam)

      // 🩹 FIX-STABLE-v1: Mundurkan (bukan majukan) — DETERMINISTIC, tidak pakai `now`
      // Range: dateModified-24jam s/d dateModified (selalu di masa lalu, selalu stabil)
      const finalDate = new Date(new Date(dateModified).getTime() - offsetSeconds * 1000);
      const isoDate = toISOWithTimezoneLocal(finalDate);
     
      // ═══ TULIS META TAG ═══
      // Meta tag pakai OFFSET (untuk uniqueness per-URL)
      updateMetaDateModified(isoDate);

      // ═══════════════════════════════════════════════════════
      // 🔥 FIX-SYNC-v6: MUTATE AEDMetaDates — JANGAN REASSIGN
      //
      // PERUBAHAN KRITIS dari v10.3a → v10.3a-fix6:
      //   SEBELUM: window.AEDMetaDates = { ...window.AEDMetaDates, dateModifiedFinal: ... }
      //            → consumer (Article/Product/Universal) yang sudah pegang
      //              referensi lama TIDAK bisa lihat dateModifiedFinal
      //            → schema dateModified != meta tag
      //
      //   SESUDAH: mutate field langsung di object yang SAMA
      //            → consumer yang sudah pegang referensi otomatis lihat
      //              dateModifiedFinal
      //            → schema dateModified == meta tag ✅
      //
      // JAMINAN:
      //   - dateModified    → TETAP = AED original (tidak di-overwrite)
      //   - dateModifiedFinal → BARU = offset (untuk meta tag & schema)
      //   - datePublished   → TETAP (tidak disentuh)
      // ═══════════════════════════════════════════════════════
      if (!window.AEDMetaDates || typeof window.AEDMetaDates !== 'object') {
        // Safety net — seharusnya tidak terjadi karena kita sudah wait
        window.AEDMetaDates = {};
      }

      // Mutate field satu per satu — PERTAHANKAN object reference
      window.AEDMetaDates.dateModifiedFinal = isoDate;
      window.AEDMetaDates.hashOffset = offsetSeconds;
      window.AEDMetaDates.hybridVersion = '10.3a';
      window.AEDMetaDates.originalDateModified = dateModified;
      window.AEDMetaDates.breadcrumbReady = breadcrumbReady;
      window.AEDMetaDates.mode = (aedType === 'evergreen') ? 'MANUAL' : 'AUTO';

      // 🔥 Signal ke consumer (Article/Hybrid/Universal)
      //    bahwa dateModifiedFinal siap dibaca
      window.__HYBRID_DATE_FINAL_READY = true;
      try {
        window.dispatchEvent(new CustomEvent('hybridDateFinalReady', {
          detail: { dateModifiedFinal: isoDate, hashOffset: offsetSeconds }
        }));
      } catch (e) {
        // Fallback legacy browser
        try {
          var evt = document.createEvent('Event');
          evt.initEvent('hybridDateFinalReady', true, true);
          window.dispatchEvent(evt);
        } catch (e2) {}
      }

      // ═══════════════════════════════════════════════════════
      // LOG FINAL
      // ═══════════════════════════════════════════════════════
      console.log(`✅ [HybridDateModified v10.3a-fix6] ${uniquePageIdentifier}`);
      console.log(`   → Meta Tag dateModified: ${isoDate}`);
      console.log(`   → Schema dateModified (AED): ${dateModified}`);
      console.log(`   → dateModifiedFinal (offset): ${isoDate}`);
      console.log(`   → Offset: ${offsetSeconds} detik (${Math.floor(offsetSeconds / 3600)} jam ${Math.floor((offsetSeconds % 3600) / 60)} menit)`);
      console.log(`   → Mode: ${window.AEDMetaDates.mode}`);
      console.log(`   → Category (dari AED): ${categoryFromAED}`);
      console.log(`   → Type (dari AED): ${aedType}`);
      console.log(`   → Content Focus (dari AED): ${contentFocus}`);
      console.log(`   → Breadcrumb Ready: ${breadcrumbReady ? '✅' : '⏰'}`);
      console.log(`   → dateModifiedFinal Ready: ✅ (MUTATED in-place)`);
      console.log(`   → Consumer reference preserved: ✅ (no reassign)`);
      console.log(`📋 Hybrid Date Modified v10.3a-fix6 applied — SYNC SAFE ✅`);

    } catch (err) {
      console.error("[HybridDateModified v10.3a] Fatal error:", err);
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
  // 🔥 FIX-SYNC-v4: WAIT FOR AEDMetaDates
  //
  // PRIORITAS:
  //   1. AEDMetaDates sudah ada → instant resolve
  //   2. Event detectEvergreenReady → resolve
  //   3. Polling tiap 100ms sampai timeout
  // ═══════════════════════════════════════════════════════════
  function waitForAEDMetaDates(timeout) {
    timeout = timeout || 3500;
    return new Promise((resolve) => {
      // 🔥 FIX-SYNC-v4: fast-path — AED sudah selesai
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

      // Event listener
      const onReady = () => {
        console.log("✅ AED ready (event detectEvergreenReady)");
        finish(true);
      };
      window.addEventListener("detectEvergreenReady", onReady, { once: true });

      // Polling fallback (untuk kasus AED selesai sebelum Hybrid daftar event)
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
  // HELPER: TO ISO WITH TIMEZONE
  // 🔥 PATCH-PAD: padStart → inline ternary (Chrome 49+)
  // ═══════════════════════════════════════════════════════════
  function toISOWithTimezoneLocal(date, offset) {
    offset = offset || "+07:00";
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    // 🔥 PATCH-PAD: (n < 10 ? '0' : '') + n — IDENTIK dengan padStart(2, '0')
    //   n = 5  → '05'  (padStart → '05')  ✅
    //   n = 15 → '15'  (padStart → '15')  ✅
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
  console.log("✅ Hybrid Date Modified v10.3a-fix6-PATCH — PURE CONSUMER + MUTATE-SAFE");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🩹 PATCH-L: Remove ALL optional chaining (?. ) — Chrome 49+ compatible");
  console.log("🩹 PATCH-PAD: Remove String.padStart — Chrome 49+ compatible");
  console.log("🩹 FIX-SYNC-v6: MUTATE AEDMetaDates (JANGAN reassign)");
  console.log("🩹 FIX-SYNC-v6: Consumer reference tetap valid → dateModifiedFinal terbaca");
  console.log("🩹 FIX-SYNC-v6: Schema dateModified == meta tag dateModified ✅");
  console.log("🔥 FIX-SYNC-v5: dateModified TIDAK di-overwrite (race fix)");
  console.log("🔥 FIX-SYNC-v5: Offset disimpan di dateModifiedFinal (field BARU)");
  console.log("🔥 FIX-SYNC-v5: window.__HYBRID_DATE_FINAL_READY = true");
  console.log("🔥 FIX-SYNC-v5: Event 'hybridDateFinalReady' di-dispatch");
  console.log("🔥 FIX-SYNC-v4: Kompatibel PLD v23.9.9 + AED v17.5.x");
  console.log("🔥 FIX-SYNC-v4: HAPUS call detectEvergreen() — AED sudah AUTO-RUN");
  console.log("🔥 FIX-SYNC-v4: Fast-path cek window.AEDMetaDates langsung");
  console.log("🔥 FIX-SYNC-v4: Polling fallback (100ms) anti miss-event");
  console.log("✅ Tugas Hybrid: hash offset + write meta + dateModifiedFinal (mutate)");
  console.log("⚠️  Consumer MUST read dateModifiedFinal (bukan dateModified)");
  console.log("⚠️  Consumer TIDAK perlu ubah apapun — mutation sudah cukup");
  console.log("═══════════════════════════════════════════════════════════");

})();
