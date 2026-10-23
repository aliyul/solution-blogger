/* ============================================================
 🔥 Hybrid Date Modified v10.3a-fix8-SAFE — NO-OP STUB
    🩹 SAFE-MODE: Complete replacement with no-op stub
============================================================
 🎯 TUJUAN: Maintain backward compatibility dengan consumer script
    (Article v8.6f / Universal v7.36h) TANPA mutasi apapun.
    
 ❌ TIDAK ADA:
    - Hash offset backdate
    - Meta dateModified overwrite
    - JSON-LD dateModified sync
    - dateModifiedFinal mutation (identity only)
    
 ✅ ADA:
    - window.__HYBRID_DATE_FINAL_READY = true (signal)
    - Event 'hybridDateFinalReady' dispatch (backward compat)
    - window.AEDMetaDates.dateModifiedFinal = dateModified (identity)
    - Debug log untuk konfirmasi no-op
    
 📌 PRINSIP: Blogger raw HTML = SOURCE OF TRUTH.
 📌 RESULT: Meta dateModified = Blogger raw. JSON-LD = Blogger raw. Zero mutation.
============================================================ */

(function () {
  "use strict";

  // ═══ Guard global — cegah double init ═══
  if (window.__hybridDateModifiedVersion === "10.3a-safe") {
    console.log("[HybridDateModified SAFE] ⏭️ Sudah dijalankan — skip");
    return;
  }
  window.__hybridDateModifiedVersion = "10.3a-safe";
  window.__hybridDateModifiedBuild = "10.3a-fix8-safe";

  // ═══════════════════════════════════════════════════════════
  // SKIP HALAMAN STATIS — EARLY
  // ═══════════════════════════════════════════════════════════
  (function checkSkipEarly() {
    const CURRENT_DOMAIN = window.location.hostname;
    if (CURRENT_DOMAIN !== 'www.betonjayareadymix.com' && !CURRENT_DOMAIN.includes('localhost')) {
      window.__HYBRID_SKIP_REASON = 'domain-not-targeted';
      return;
    }
    const currentPath = window.location.pathname;
    const STATIC_PAGES = ['/p/hubungi-kami.html', '/p/portofolio.html', '/p/disclaimer.html', '/p/privacy-policy.html', '/p/terms-of-service.html', '/p/useful-links.html', '/p/about.html', '/p/sitemap.html'];
    const isHomepage = currentPath === '/' || currentPath === '/index.html' || currentPath === '';
    if (isHomepage) { window.__HYBRID_SKIP_REASON = 'homepage'; return; }
    const isStaticPage = STATIC_PAGES.some(page => currentPath.includes(page));
    if (isStaticPage) { window.__HYBRID_SKIP_REASON = 'static-page'; return; }
    window.__HYBRID_SKIP_REASON = null;
  })();

  if (window.__HYBRID_SKIP_REASON) {
    console.log(`⏸️ [HybridDateModified SAFE] Skip (${window.__HYBRID_SKIP_REASON})`);
    return;
  }

  // ═══════════════════════════════════════════════════════════
  // WAIT FOR AED — then dispatch identity event
  // ═══════════════════════════════════════════════════════════
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runSafeStub, { once: true });
  } else {
    runSafeStub();
  }

  function runSafeStub() {
    if (window.__HYBRID_RUNNING) return;
    window.__HYBRID_RUNNING = true;

    const currentPath = window.location.pathname;
    const hasMainContent = document.querySelector('.post-body.entry-content, .post-body, article, main, section');
    const hasH1 = document.querySelector('h1');
    const contentLength = (document.body.innerText || '').trim().length;
    const isContentPage = hasMainContent && hasH1 && contentLength > 500;

    if (!isContentPage) {
      console.log(`⏸️ [HybridDateModified SAFE] Skip — not content page (${currentPath})`);
      return;
    }

    waitForAEDMetaDates(3500).then(function(ready) {
      if (!ready) {
        console.log('[HybridDateModified SAFE] AEDMetaDates not ready — skip');
        return;
      }

      const dateModified = window.AEDMetaDates.dateModified;

      // 🩹 SAFE-MODE: dateModifiedFinal = dateModified (IDENTITY, no offset)
      if (!window.AEDMetaDates || typeof window.AEDMetaDates !== 'object') {
        window.AEDMetaDates = {};
      }
      window.AEDMetaDates.dateModifiedFinal = dateModified;  // Identity
      window.AEDMetaDates.hashOffset = 0;                   // No offset
      window.AEDMetaDates.originalHashOffset = 0;
      window.AEDMetaDates.hybridVersion = '10.3a-safe';
      window.AEDMetaDates.hybridBuild = '10.3a-fix8-safe';
      window.AEDMetaDates.hybridMode = 'NOOP';
      window.AEDMetaDates.originalDateModified = dateModified;
      window.AEDMetaDates.mode = (window.AEDMetaDates.type === 'evergreen') ? 'MANUAL' : 'AUTO';

      window.__HYBRID_DATE_FINAL_READY = true;

      try {
        window.dispatchEvent(new CustomEvent('hybridDateFinalReady', {
          detail: {
            dateModifiedFinal: dateModified,   // Identity
            hashOffset: 0,
            safeMode: true,
            note: 'Identity — no offset, no mutation'
          }
        }));
      } catch (e) {
        try {
          var evt = document.createEvent('Event');
          evt.initEvent('hybridDateFinalReady', true, true);
          window.dispatchEvent(evt);
        } catch (e2) {}
      }

      console.log('═══════════════════════════════════════════════════════════');
      console.log('🩹 Hybrid Date Modified v10.3a-fix8-SAFE — NO-OP STUB');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`✅ Page: ${currentPath}`);
      console.log(`✅ dateModified (Blogger raw): ${dateModified}`);
      console.log(`✅ dateModifiedFinal (identity): ${dateModified}`);
      console.log(`✅ hashOffset: 0 (no backdate)`);
      console.log(`✅ Meta tags: UNTOUCHED`);
      console.log(`✅ JSON-LD: UNTOUCHED`);
      console.log(`✅ Consumer contract: 'hybridDateFinalReady' event dispatched`);
      console.log('📌 Blogger raw HTML = SOURCE OF TRUTH');
      console.log('📌 Googlebot sees ORIGINAL dateModified. Zero mutation.');
      console.log('═══════════════════════════════════════════════════════════');
    });
  }

  function waitForAEDMetaDates(timeout) {
    timeout = timeout || 3500;
    return new Promise((resolve) => {
      if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
        console.log("✅ [Hybrid SAFE] AEDMetaDates already ready (instant)");
        resolve(true);
        return;
      }
      let resolved = false;
      const finish = (ok) => { if (resolved) return; resolved = true; resolve(ok); };
      const onReady = () => { console.log("✅ [Hybrid SAFE] AED ready (event)"); finish(true); };
      window.addEventListener("detectEvergreenReady", onReady, { once: true });
      const startTime = Date.now();
      const pollInterval = setInterval(() => {
        if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
          clearInterval(pollInterval);
          window.removeEventListener("detectEvergreenReady", onReady);
          console.log("✅ [Hybrid SAFE] AEDMetaDates ready (polling)");
          finish(true);
          return;
        }
        if (Date.now() - startTime > timeout) {
          clearInterval(pollInterval);
          window.removeEventListener("detectEvergreenReady", onReady);
          console.warn(`⏰ [Hybrid SAFE] AEDMetaDates timeout (${timeout}ms)`);
          finish(false);
        }
      }, 100);
    });
  }
})();
