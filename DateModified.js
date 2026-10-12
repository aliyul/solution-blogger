/* ============================================================
 🔥 Hybrid Date Modified v10.0 — SINKRON AED v17.4.0
    ✅ FIX-SYNC-1: EVERGREEN_LEVELS & MONEY_LEVELS sinkron AED
    ✅ FIX-SYNC-2: getCustomDateByPageLevel() — money ke bawah = AUTO
    ✅ FIX-SYNC-3: getCategoryLabel() — money ke bawah = NON-EVERGREEN
    ✅ FIX-SYNC-4: Hash source konsisten dengan kategori baru
    ✅ FIX-SYNC-5: detectContentFocus() — PLD-first, no guessing
    ✅ FIX-SYNC-6: v37Rules — hapus "informasi evergreen" untuk money

    ✅ PRESERVED dari v9.9:
    ✅ Skip homepage & static pages (early + late)
    ✅ Guard _HYBRID_INITIALIZED
    ✅ Timeout PLD/AED/Breadcrumb 3s/3s/2s
    ✅ Skip updateMetaDateModified kalau tanggal sama
    ✅ Kompatibel PLD v23.9.7-LITE

    ✅ COMPATIBLE dengan:
    ✅ PLD v23.9.7-LITE-PERF-B2N
    ✅ AED v17.4.0-LITE
============================================================ */

(function () {
  "use strict";

  // ═══ Guard global — cegah double init ═══
  if (window.__hybridDateModifiedVersion === "10.0") {
    console.log("[HybridDateModified v10.0] ⏭️ Sudah dijalankan — skip");
    return;
  }
  window.__hybridDateModifiedVersion = "10.0";

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
    console.log(`⏸️ [HybridDateModified v10.0] Skip (${window.__HYBRID_SKIP_REASON})`);
  } else if (document.readyState === "loading") {
    console.log("[HybridDateModified v10.0] ⏳ Menunggu DOMContentLoaded...");
    document.addEventListener("DOMContentLoaded", function () {
      console.log("[HybridDateModified v10.0] ✅ DOM siap, menjalankan...");
      runHybridDateModified();
    }, { once: true });
  } else {
    console.log("[HybridDateModified v10.0] ✅ DOM sudah siap, menjalankan...");
    runHybridDateModified();
  }

  // ═══════════════════════════════════════════════════════════
  // FUNGSI UTAMA
  // ═══════════════════════════════════════════════════════════
  async function runHybridDateModified() {
    try {
      // Guard double init
      if (window.__HYBRID_RUNNING) {
        console.log("[HybridDateModified v10.0] ⏭️ Sudah running — skip");
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
      // WAIT FOR BREADCRUMB (2s timeout)
      // ═══════════════════════════════════════════════════════
      console.log("🍞 Menunggu breadcrumb terbentuk...");
      const breadcrumbReady = await waitForBreadcrumb(2000);
      if (breadcrumbReady) {
        console.log(`✅ Breadcrumb siap`);
      } else {
        console.log(`⏰ Breadcrumb timeout, lanjutkan tanpa breadcrumb`);
      }

      // ═══════════════════════════════════════════════════════
      // MATIKAN SCRIPT VERSI LAMA
      // ═══════════════════════════════════════════════════════
      console.log("🛑 Mencari dan mematikan script date modified versi lama...");

      if (window.runHybridDateModified && window.runHybridDateModified !== runHybridDateModified) {
        window.runHybridDateModified = null;
      }

      if (window.HybridDateModified) {
        window.HybridDateModified = null;
      }

      if (window.__hybridDateModifiedReady && window.__hybridDateModifiedVersion !== "10.0") {
        window.__hybridDateModifiedReady = false;
      }

      const oldScripts = document.querySelectorAll('script[src*="HybridDateModified"], script[src*="hybrid-date"], script[src*="date-modified"]');
      oldScripts.forEach(script => {
        try { script.remove(); } catch (e) {}
      });

      window.__hybridDateModifiedActive = 'v10.0';
      window.__hybridDateModifiedReady = true;
      window.runHybridDateModified = runHybridDateModified;

      console.log("✅ Script versi lama telah dimatikan.");
      console.log("🚀 Memulai eksekusi...");

      // ═══════════════════════════════════════════════════════
      // 🔥 FIX-SYNC-1: KONSTANTA SINKRON DENGAN AED v17.4.0
      // ═══════════════════════════════════════════════════════
      const EVERGREEN_LEVELS = [
        'pillar',
        'sub-pillar-tipe-2',
        'sub-pillar-tipe-1'
      ];

      const FLEXIBLE_LEVELS = []; // deprecated — tidak dipakai lagi

      // 🔥 FIX-SYNC-1: money ke bawah = SEMUA level komersial
      const MONEY_LEVELS = [
        'money-master',
        'money-page',
        'money-child',
        'variant',
        'sub-variant'
      ];

      // ═══════════════════════════════════════════════════════
      // WAIT FOR PLD (timeout 3s)
      // ═══════════════════════════════════════════════════════
      function waitForPageLevelDetector() {
        return new Promise((resolve) => {
          function checkPLDVersion() {
            if (!window.pageLevelDetectorv22) return null;
            var v = window.pageLevelDetectorv22.version || "unknown";
            if (v.indexOf("23.9.7") === 0) return "v23.9.7-lite";
            if (v.indexOf("23.") === 0) return "v23.0.0";
            if (v.indexOf("22.") === 0) return "v22.x";
            return "v" + v;
          }

          if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22Ready) {
            console.log(`✅ PLD ${checkPLDVersion()} already ready (instan)`);
            resolve(true); return;
          }
          if (window.pageLevelDetectorv20 && window.pageLevelDetectorv20Ready) { console.log("✅ PLD v20.x ready"); resolve(true); return; }
          if (window.pageLevelDetectorv19 && window.pageLevelDetectorv19Ready) { console.log("✅ PLD v19 ready"); resolve(true); return; }
          if (window.pageLevelDetectorV18 && window.pageLevelDetectorv18Ready) { console.log("✅ PLD v18 ready"); resolve(true); return; }
          if (window.pageLevelDetectorV17 && window.pageLevelDetectorv17Ready) { console.log("✅ PLD v17 ready"); resolve(true); return; }
          if (window.pageLevelDetector && window.__pageLevelDetectorReady) { console.log("✅ PLD legacy ready"); resolve(true); return; }

          const onReadyV22 = () => { console.log(`✅ PLD ${checkPLDVersion()} ready (event)`); resolve(true); };
          const onReady = () => { console.log("✅ PLD ready (event)"); resolve(true); };

          window.addEventListener("pageLevelDetectorv22Ready", onReadyV22, { once: true });
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
              console.warn("⚠️ PLD tidak terdeteksi — pakai fallback");
              resolve(false);
            }
          }, 3000);
        });
      }

      // ═══════════════════════════════════════════════════════
      // WAIT FOR AED (timeout 3s)
      // ═══════════════════════════════════════════════════════
      function waitForDetectEvergreen() {
        return new Promise((resolve) => {
          if (window.__detectEvergreenReady && typeof window.detectEvergreen === "function") {
            console.log("✅ AED already ready (instan)");
            resolve(true); return;
          }

          const onReady = () => { console.log("✅ AED ready (event)"); resolve(true); };
          window.addEventListener("detectEvergreenReady", onReady, { once: true });

          setTimeout(() => {
            window.removeEventListener("detectEvergreenReady", onReady);
            if (typeof window.detectEvergreen === "function") {
              console.log("✅ AED ready (timeout fallback 3s)");
              resolve(true);
            } else {
              console.warn("⚠️ AED tidak terdeteksi — pakai fallback");
              resolve(false);
            }
          }, 3000);
        });
      }

      // ═══════════════════════════════════════════════════════
      // WAIT FOR BREADCRUMB (default 2s)
      // ═══════════════════════════════════════════════════════
      function waitForBreadcrumb(timeout = 2000) {
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
                  resolve(true); return;
                }
                if (element.innerText.trim().length > 0) {
                  console.log(`🍞 Breadcrumb ditemukan (${selector}) — ada teks`);
                  resolve(true); return;
                }
              }
            }

            if (Date.now() - startTime > timeout) {
              console.log(`⏰ Breadcrumb timeout (${timeout}ms), lanjutkan`);
              resolve(false); return;
            }

            setTimeout(checkBreadcrumb, 100);
          }

          checkBreadcrumb();
        });
      }

      // ═══════════════════════════════════════════════════════
      // LOAD SCRIPTS (PLD & AED sudah di HTML)
      // ═══════════════════════════════════════════════════════
      async function loadAllScripts() {
        console.log("⏳ Cek PLD & AED (sudah di HTML)...");

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
          console.log(`✅ PLD v${ver} sudah ada di halaman`);
        }

        if (typeof window.detectEvergreen !== "function") {
          console.log("⏳ Menunggu AED dari HTML...");
          await waitForDetectEvergreen();
          console.log("✅ AED READY");
        } else {
          console.log("✅ AED sudah ada di halaman");
        }
      }

      // ═══════════════════════════════════════════════════════
      // 🔥 FIX-SYNC-5: DETEKSI FOKUS KONTEN — PLD-ONLY
      // ═══════════════════════════════════════════════════════
      function detectContentFocus() {
        // Prioritas 1: PLD detectContentFocus()
        if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detectContentFocus === "function") {
          try {
            const pldLevel = window.pageLevelDetectorv22.detect();
            const pldEntity = window.pageLevelDetectorv22.detectEntityType();
            const pldFocus = window.pageLevelDetectorv22.detectContentFocus(pldLevel, pldEntity);
            if (pldFocus) {
              const focus = String(pldFocus).toLowerCase();
              console.log(`🎯 [PLD] Content Focus: ${focus}`);
              return {
                focus: focus,
                reason: 'PLD v23.9.7-LITE detectContentFocus()',
                priority: 0,
                source: 'PLD'
              };
            }
          } catch (e) {
            console.warn("⚠️ PLD detectContentFocus() error: " + e.message);
          }
        }

        // Prioritas 2: body[data-content-focus]
        const bodyFocus = document.body.getAttribute('data-content-focus');
        if (bodyFocus) {
          const focus = String(bodyFocus).toLowerCase();
          console.log(`🎯 body[data-content-focus]: ${focus}`);
          return {
            focus: focus,
            reason: 'body attribute',
            priority: 0,
            source: 'PLD-attr'
          };
        }

        // Prioritas 3: V379A
        if (window.V379A && window.V379A.focusKonten) {
          const focus = String(window.V379A.focusKonten).toLowerCase();
          console.log(`🎯 V379A.focusKonten: ${focus}`);
          return {
            focus: focus,
            reason: 'V379A',
            priority: 0,
            source: 'v379a'
          };
        }

        // ❌ FIX-SYNC-5: JANGAN tebak dari keyword H1
        console.warn('⚠️ [FIX-SYNC-5] PLD tidak tersedia — safe default INFORMASI (no guessing)');
        return {
          focus: 'informasi',
          reason: 'safe default (no PLD)',
          priority: 99,
          source: 'safe-default'
        };
      }

      // ═══════════════════════════════════════════════════════
      // TO ISO WITH TIMEZONE
      // ═══════════════════════════════════════════════════════
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

      // ═══════════════════════════════════════════════════════
      // STABLE HASH
      // ═══════════════════════════════════════════════════════
      function stableHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = (hash << 5) - hash + str.charCodeAt(i);
          hash |= 0;
        }
        return Math.abs(hash);
      }

      // ═══════════════════════════════════════════════════════
      // UPDATE META DATE MODIFIED (skip kalau sama)
      // ═══════════════════════════════════════════════════════
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

      // ═══════════════════════════════════════════════════════
      // 🔥 FIX-SYNC-2: CUSTOM DATE — money ke bawah = AUTO
      // ═══════════════════════════════════════════════════════
      function getCustomDateByPageLevel(pageLevel, entityType, contentFocus) {
        // Level EVERGREEN → tanggal tetap
        if (EVERGREEN_LEVELS.includes(pageLevel)) {
          console.log(`📌 [${pageLevel}] EVERGREEN → TANPA update berkala (V37)`);
          return "2026-01-01T00:00:00+07:00";
        }

        // 🔥 FIX-SYNC-2: SEMUA money ke bawah = AUTO (dynamic update)
        // Level menentukan, BUKAN contentFocus
        if (MONEY_LEVELS.includes(pageLevel)) {
          console.log(`📌 [${pageLevel}] MONEY ke bawah → AUTO update (non-evergreen)`);
          if (contentFocus === 'informasi') {
            console.log(`   ℹ️ contentFocus=informasi, tapi level "${pageLevel}" commercial → TETAP AUTO`);
          }
          return null; // null = AUTO mode
        }

        console.log(`📌 [${pageLevel}] UNKNOWN → AUTO (fallback)`);
        return null;
      }

      // ═══════════════════════════════════════════════════════
      // 🔥 FIX-SYNC-3: CATEGORY LABEL — money ke bawah = NON-EVERGREEN
      // ═══════════════════════════════════════════════════════
      function getCategoryLabel(pageLevel, contentFocus) {
        if (pageLevel === 'home') return 'HOMEPAGE';

        if (EVERGREEN_LEVELS.includes(pageLevel)) {
          return `EVERGREEN — ${pageLevel}`;
        }

        // 🔥 FIX-SYNC-3: money ke bawah = NON-EVERGREEN, apapun contentFocus-nya
        if (MONEY_LEVELS.includes(pageLevel)) {
          var focusUpper = (contentFocus || 'informasi').toUpperCase();
          return `NON-EVERGREEN — ${pageLevel} / ${focusUpper}`;
        }

        return `UNKNOWN — ${pageLevel}`;
      }

      // ═══════════════════════════════════════════════════════
      // GET PAGE LEVEL FROM DETECTOR
      // ═══════════════════════════════════════════════════════
      async function getPageLevelFromDetector() {
        let pageLevel = 'pillar';
        let entityType = 'produk';
        let detectorVersion = 'unknown';
        let confidence = null;
        let strategies = null;
        let strategyCount = null;

        if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
          try {
            // 🔥 FIX-SYNC: prefer detectFromDOM (dapat H1 fallback)
            if (typeof window.pageLevelDetectorv22.detectFromDOM === 'function') {
              var domLevel = window.pageLevelDetectorv22.detectFromDOM();
              if (domLevel) {
                pageLevel = domLevel;
                console.log(`📌 [FIX-SYNC] detectFromDOM → ${pageLevel}`);
              }
            }

            // Fallback ke detect() kalau detectFromDOM kosong
            if ((!pageLevel || pageLevel === 'pillar') && typeof window.pageLevelDetectorv22.detect === 'function') {
              var urlLevel = window.pageLevelDetectorv22.detect();
              if (urlLevel) {
                pageLevel = urlLevel;
                console.log(`📌 detect() → ${pageLevel}`);
              }
            }

            entityType = window.pageLevelDetectorv22.detectEntityType();

            const ver = window.pageLevelDetectorv22.version || "unknown";
            detectorVersion = (ver.indexOf("23.9.7") === 0) ? "v23.9.7-lite" :
                              (ver.indexOf("23.") === 0) ? "v23.0.0" :
                              (ver.indexOf("22.") === 0) ? "v22.x" : "v" + ver;

            if (typeof window.pageLevelDetectorv22.getConfidenceScore === 'function') {
              const confidenceScore = window.pageLevelDetectorv22.getConfidenceScore();
              confidence = confidenceScore.confidence;
              strategies = confidenceScore.strategies;
              strategyCount = confidenceScore.strategyCount;
            }
            console.log(`📌 [${detectorVersion}] Detected: ${pageLevel}, Entity: ${entityType}`);
            if (confidence) {
              console.log(`   🎯 Confidence: ${confidence}% (${strategyCount} strategies)`);
            }
          } catch (e) { console.warn(`⚠️ Error:`, e); }
        } else if (window.pageLevelDetectorv20 && typeof window.pageLevelDetectorv20.detect === 'function') {
          try {
            pageLevel = window.pageLevelDetectorv20.detect();
            entityType = window.pageLevelDetectorv20.detectEntityType();
            detectorVersion = 'v20.x';
            console.log(`📌 [${detectorVersion}] Detected: ${pageLevel}, Entity: ${entityType}`);
          } catch (e) { console.warn(`⚠️ Error:`, e); }
        } else if (window.pageLevelDetector && typeof window.pageLevelDetector.detect === 'function') {
          try {
            pageLevel = window.pageLevelDetector.detect();
            entityType = window.pageLevelDetector.detectEntityType();
            detectorVersion = 'legacy';
            console.log(`📌 [${detectorVersion}] Detected: ${pageLevel}, Entity: ${entityType}`);
          } catch (e) { console.warn(`⚠️ Error:`, e); }
        } else {
          console.warn("⚠️ PageLevelDetector not ready, using defaults");
        }

        return { pageLevel, entityType, detectorVersion, confidence, strategies, strategyCount };
      }

      // ═══════════════════════════════════════════════════════
      // EKSEKUSI UTAMA
      // ═══════════════════════════════════════════════════════
      console.log("🔥 Hybrid Date Modified v10.0 - Starting...");
      console.log("📋 FIX-SYNC-1: Konstanta sinkron AED v17.4.0");
      console.log("📋 FIX-SYNC-2: Money ke bawah = AUTO unconditional");
      console.log("📋 FIX-SYNC-3: Label money = NON-EVERGREEN");
      console.log("📋 FIX-SYNC-4: Hash source konsisten");
      console.log("📋 FIX-SYNC-5: detectContentFocus PLD-first");
      console.log("📋 FIX-SYNC-6: v37Rules bersih");

      await loadAllScripts();

      const { pageLevel, entityType, detectorVersion, confidence, strategies, strategyCount } = await getPageLevelFromDetector();

      const ALL_KNOWN_LEVELS = [...EVERGREEN_LEVELS, ...MONEY_LEVELS, 'home'];
      let finalPageLevel = pageLevel;
      if (!ALL_KNOWN_LEVELS.includes(finalPageLevel)) {
        console.warn(`⚠️ Unknown page level: ${finalPageLevel}, defaulting to pillar`);
        finalPageLevel = 'pillar';
      }

      const contentResult = detectContentFocus();
      const contentFocus = contentResult.focus;
      const focusReason = contentResult.reason;
      const focusPriority = contentResult.priority;
      const focusSource = contentResult.source || 'internal';

      console.log(`   - Content Focus: ${contentFocus} (${focusReason}, priority: ${focusPriority}, source: ${focusSource})`);

      let customDate = getCustomDateByPageLevel(finalPageLevel, entityType, contentFocus);
      let manualMode = customDate !== null;
      let categoryLabel = getCategoryLabel(finalPageLevel, contentFocus);

      console.log(`📋 PAGE CLASSIFICATION (V37-v10):`);
      console.log(`   - Page Level: ${finalPageLevel}`);
      console.log(`   - Entity Type: ${entityType}`);
      console.log(`   - Category: ${categoryLabel}`);
      console.log(`   - Detector: ${detectorVersion}`);
      if (confidence) console.log(`   - Confidence: ${confidence}%`);
      if (contentFocus) console.log(`   - Content Focus: ${contentFocus} (${focusReason}) [${focusSource}]`);
      console.log(`   - Mode: ${manualMode ? 'MANUAL (custom date)' : 'AUTO (dynamic)'}`);

      // ═══ PANGGIL AED ═══
      if (window.detectEvergreen) {
        if (manualMode && customDate) {
          await window.detectEvergreen({ customDateModified: customDate });
          console.log(`✅ MANUAL mode executed with custom date: ${customDate}`);
        } else {
          await window.detectEvergreen();
          console.log(`✅ AUTO mode executed`);
        }
      } else {
        console.warn("⚠️ detectEvergreen function not available");
      }

      if (!window.AEDMetaDates || !window.AEDMetaDates.dateModified) {
        console.warn("[HybridDateModified v10.0] AEDMetaDates tidak ditemukan, skip update.");
        return;
      }

      const { dateModified, nextUpdate, type: aedType, entityType: detectedEntityType, pageLevel: detectedPageLevel } = window.AEDMetaDates;

      console.log(`📊 Page Info (V37-v10):`);
      console.log(`   - type: ${aedType}`);
      console.log(`   - entityType: ${detectedEntityType}`);
      console.log(`   - pageLevel: ${detectedPageLevel}`);
      console.log(`   - dateModified: ${dateModified}`);
      console.log(`   - nextUpdate: ${nextUpdate}`);

      // ═══════════════════════════════════════════════════════
      // 🔥 FIX-SYNC-4: HASH SOURCE — konsisten dengan kategori baru
      // ═══════════════════════════════════════════════════════
      const uniquePageIdentifier = window.location.pathname;
      let hashSource = uniquePageIdentifier;

      var _isNonEvergreenFocus = (contentFocus === 'harga' ||
                                   contentFocus === 'gabung' ||
                                   contentFocus === 'commercial');

      if (EVERGREEN_LEVELS.includes(detectedPageLevel)) {
        hashSource = 'evergreen-' + detectedPageLevel + '-' + hashSource;
      } else if (MONEY_LEVELS.includes(detectedPageLevel)) {
        // 🔥 FIX-SYNC-4: SEMUA money level = non-evergreen hash
        // Tidak ada lagi "money-page-informasi-evergreen"
        hashSource = 'non-evergreen-' + detectedPageLevel + '-' + hashSource;
      } else if (detectedPageLevel === 'home') {
        hashSource = 'home-evergreen-' + hashSource;
      }

      const hash = stableHash(hashSource);
      const offsetSeconds = hash % 86400;
      const finalDate = new Date(new Date(dateModified).getTime() + offsetSeconds * 1000);
      const isoDate = toISOWithTimezoneLocal(finalDate);

      updateMetaDateModified(isoDate);

      // PLD helpers (untuk info tambahan)
      let pldKategori = null;
      let pldH1Pattern = null;
      let pldSchemaType = null;
      let pldCtaType = null;

      try {
        if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detectKategori === "function") {
          pldKategori = window.pageLevelDetectorv22.detectKategori(contentFocus.toUpperCase());
        }
        if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detectH1Pattern === "function" && pldKategori) {
          pldH1Pattern = window.pageLevelDetectorv22.detectH1Pattern(pldKategori);
        }
        if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detectSchemaType === "function") {
          pldSchemaType = window.pageLevelDetectorv22.detectSchemaType(
            finalPageLevel, entityType, contentFocus.toUpperCase()
          );
        }
        if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detectCtaType === "function") {
          pldCtaType = window.pageLevelDetectorv22.detectCtaType(
            finalPageLevel, contentFocus.toUpperCase()
          );
        }
      } catch (e) {
        console.warn("⚠️ PLD v23 PHASE 4.6 functions error: " + e.message);
      }

      // ═══════════════════════════════════════════════════════
      // 🔥 FIX-SYNC-6: v37Rules — level-based, bukan contentFocus-based
      // ═══════════════════════════════════════════════════════
      window.AEDMetaDates = {
        ...window.AEDMetaDates,
        dateModified: isoDate,
        hashOffset: offsetSeconds,
        detectorVersion: detectorVersion,
        category: categoryLabel,
        contentFocus: contentFocus,
        focusReason: focusReason,
        focusPriority: focusPriority,
        focusSource: focusSource,
        mode: manualMode ? 'MANUAL' : 'AUTO',
        originalDateModified: dateModified,
        hybridVersion: '10.0',

        detectionConfidence: confidence,
        detectionStrategies: strategies,
        detectionStrategyCount: strategyCount,
        breadcrumbReady: breadcrumbReady,

        pldKategori: pldKategori,
        pldH1Pattern: pldH1Pattern,
        pldSchemaType: pldSchemaType,
        pldCtaType: pldCtaType,

        v37Rules: {
          // Level-based (BUKAN contentFocus-based)
          isEvergreenLevel: EVERGREEN_LEVELS.includes(detectedPageLevel),
          isMoneyLevel: MONEY_LEVELS.includes(detectedPageLevel),

          // Aggregated — level menentukan
          nonEvergreen: MONEY_LEVELS.includes(detectedPageLevel),
          evergreen: EVERGREEN_LEVELS.includes(detectedPageLevel),

          // Context
          currentContentFocus: contentFocus,
          currentPageLevel: detectedPageLevel,

          // Config
          flexibleRemoved: true,
          skipHomepage: true,
          skipStaticPages: true,
          contentFocusDoesNotOverrideLevel: true // 🆕 flag eksplisit
        }
      };

      console.log(`✅ [HybridDateModified v10.0] ${uniquePageIdentifier}`);
      console.log(`   → Final Date Modified: ${isoDate}`);
      console.log(`   → Offset: ${offsetSeconds} detik (${Math.floor(offsetSeconds / 3600)} jam ${Math.floor((offsetSeconds % 3600) / 60)} menit)`);
      console.log(`   → Mode: ${manualMode ? 'MANUAL' : 'AUTO'}`);
      console.log(`   → Category: ${categoryLabel}`);
      console.log(`   → Content Focus: ${contentFocus} (${focusReason}) [${focusSource}]`);
      if (confidence) console.log(`   → Detection Confidence: ${confidence}%`);
      console.log(`   → Breadcrumb Ready: ${breadcrumbReady ? '✅' : '⏰'}`);
      if (pldKategori) console.log(`   → PLD Kategori: ${pldKategori}`);
      if (pldH1Pattern) console.log(`   → PLD H1 Pattern: ${pldH1Pattern}`);
      if (pldSchemaType) console.log(`   → PLD Schema: ${pldSchemaType.primary} + ${pldSchemaType.secondary}`);
      if (pldCtaType) console.log(`   → PLD CTA: ${pldCtaType.type} → ${pldCtaType.text}`);
      console.log(`📋 Hybrid Date Modified v10.0 applied successfully ✅`);

    } catch (err) {
      console.error("[HybridDateModified v10.0] Fatal error:", err);
    }
  }

})();
