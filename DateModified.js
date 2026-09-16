/* ============================================================
 🔥 Hybrid Date Modified v9.7 — UNTUK betonjayareadymix.com
    ✅ FIX v9.7: KOMPATIBEL PLD v23.0.0 (Merged Final)
    ✅ FIX v9.7: PRIORITAS PLD detectContentFocus() > internal
    ✅ FIX v9.7: Gunakan detectKategori() dari PLD untuk kategori
    ✅ FIX v9.7: Validasi versi PLD v23.0.0 (dengan fallback v22.x)
    ✅ FIX v9.6: WAIT BREADCRUMB sebelum eksekusi
    ✅ FIX v9.5: WAIT DOMContentLoaded sebelum eksekusi
    ✅ FIX v9.4: Hapus getEventListeners (tidak tersedia di script normal)
    ✅ SINKRON dengan Smart Evergreen Detector v15.2
    ✅ SINKRON dengan V37 FULL SITE AUTO ARCHITECTURE
    ✅ PATOKAN UTAMA: H1 (Informasi → Evergreen, Harga → Non-Evergreen)
    ✅ DETEKSI TAHUN di H1 → WAJIB NON-EVERGREEN
    ✅ DETEKSI Rp di H1 → HARGA
    ✅ DETEKSI TABEL HARGA → HARGA (prioritas tinggi)
    ✅ FULL COMPATIBLE: PLD v23.0.0, v22.x, v20.x, v19.x, v18, v17
    ✅ ENHANCED: Confidence score + strategies dari PLD
============================================================ */

(function() {
  "use strict";

  // ============================================================
  // 🔥🔥🔥 TUNGGU DOM READY SEBELUM EKSEKUSI 🔥🔥🔥
  // ============================================================

  if (document.readyState === "loading") {
    console.log("[HybridDateModified v9.7] ⏳ Menunggu DOMContentLoaded...");
    document.addEventListener("DOMContentLoaded", function() {
      console.log("[HybridDateModified v9.7] ✅ DOM siap, menjalankan script...");
      setTimeout(runHybridDateModified, 300);
    });
  } else {
    console.log("[HybridDateModified v9.7] ✅ DOM sudah siap, menjalankan script...");
    setTimeout(runHybridDateModified, 300);
  }

  // ============================================================
  // 🔥🔥🔥 FUNGSI UTAMA 🔥🔥🔥
  // ============================================================

  async function runHybridDateModified() {
    try {
      const CURRENT_DOMAIN = window.location.hostname;

      if (CURRENT_DOMAIN !== 'www.betonjayareadymix.com' && !CURRENT_DOMAIN.includes('localhost')) {
        console.log(`⏸️ Domain ${CURRENT_DOMAIN} not targeted. Script skipped.`);
        return;
      }

      // ============================================================
      // 🔥🔥🔥 SKIP LOGIC — HALAMAN STATIS & HOMEPAGE 🔥🔥🔥
      // ============================================================

      const currentPath = window.location.pathname;
      const currentUrl = window.location.href;

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
        console.log(`⏸️ [HybridDateModified v9.7] HOMEPAGE terdeteksi (${currentPath}), skip script.`);
        return;
      }

      if (isStaticPage) {
        console.log(`⏸️ [HybridDateModified v9.7] HALAMAN STATIS terdeteksi (${currentPath}), skip script.`);
        return;
      }

      if (!isContentPage) {
        console.log(`⏸️ [HybridDateModified v9.7] HALAMAN TANPA KONTEN UTAMA (${currentPath}), skip script.`);
        return;
      }

      console.log(`✅ [HybridDateModified v9.7] Halaman ${currentPath} LAYAK diproses.`);

      // ============================================================
      // 🔥🔥🔥 WAIT FOR BREADCRUMB 🔥🔥🔥
      // ============================================================

      console.log("🍞 [HybridDateModified v9.7] Menunggu breadcrumb terbentuk...");
      const breadcrumbReady = await waitForBreadcrumb(3000);
      if (breadcrumbReady) {
        console.log(`✅ [HybridDateModified v9.7] Breadcrumb siap`);
      } else {
        console.log(`⏰ [HybridDateModified v9.7] Breadcrumb timeout, lanjutkan tanpa breadcrumb`);
      }

      // ============================================================
      // 🔥🔥🔥 MATIKAN SCRIPT VERSI LAMA 🔥🔥🔥
      // ============================================================

      console.log("🛑 [HybridDateModified v9.7] Mencari dan mematikan script date modified versi lama...");

      if (window.runHybridDateModified) {
        console.log("🛑 Mematikan window.runHybridDateModified (v8.x/v9.x)...");
        window.runHybridDateModified = null;
      }

      if (window.HybridDateModified) {
        console.log("🛑 Mematikan window.HybridDateModified...");
        window.HybridDateModified = null;
      }

      if (window.__hybridDateModifiedReady) {
        window.__hybridDateModifiedReady = false;
      }

      const oldScripts = document.querySelectorAll('script[src*="HybridDateModified"], script[src*="hybrid-date"], script[src*="date-modified"]');
      oldScripts.forEach(script => {
        console.log(`🛑 Menghapus script lama: ${script.src || 'inline script'}`);
        script.remove();
      });

      window.__hybridDateModifiedActive = 'v9.7';
      window.__hybridDateModifiedReady = true;
      window.runHybridDateModified = runHybridDateModified;

      console.log("✅ [HybridDateModified v9.7] Script versi lama telah dimatikan.");
      console.log("🚀 [HybridDateModified v9.7] Memulai eksekusi...");

      // ============================================================
      // 📌 KONSTANTA PAGE LEVELS (V37)
      // ============================================================
      const EVERGREEN_LEVELS = [
        'home',
        'pillar',
        'sub-pillar-tipe-2',
        'sub-pillar-tipe-1',
        'variant',
        'sub-variant'
      ];

      const FLEXIBLE_LEVELS = [];
      const MONEY_LEVELS = ['money-master', 'money-child'];

      // ============================================================
      // 📌 FUNGSI LOAD EXTERNAL JS
      // ============================================================
      function loadExternalJS(src) {
        return new Promise((resolve) => {
          if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
          }
          const s = document.createElement("script");
          s.src = src;
          s.defer = true;
          s.onload = resolve;
          s.onerror = () => {
            console.warn("[HybridDateModified] Gagal load:", src);
            resolve();
          };
          document.head.appendChild(s);
        });
      }

      // ============================================================
      // 📌 TUNGGU PAGE LEVEL DETECTOR READY (v23 + backward compat)
      // ============================================================
      function waitForPageLevelDetector() {
        return new Promise((resolve) => {
          // ✅ FIX v9.7: Deteksi versi PLD
          function checkPLDVersion() {
            if (!window.pageLevelDetectorv22) return null;
            var v = window.pageLevelDetectorv22.version || "unknown";
            if (v.indexOf("23.") === 0) return "v23.0.0";
            if (v.indexOf("22.") === 0) return "v22.x";
            return "v" + v;
          }

          // Cek PLD v22/23 (nama variable sama untuk backward compat)
          if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22Ready) {
            const ver = checkPLDVersion();
            console.log(`✅ Page Level Detector ${ver} already ready`);
            resolve(true);
            return;
          }
          if (window.pageLevelDetectorv20 && window.pageLevelDetectorv20Ready) {
            console.log("✅ Page Level Detector v20.x already ready");
            resolve(true);
            return;
          }
          if (window.pageLevelDetectorv19 && window.pageLevelDetectorv19Ready) {
            console.log("✅ Page Level Detector v19 already ready");
            resolve(true);
            return;
          }
          if (window.pageLevelDetectorV18 && window.pageLevelDetectorv18Ready) {
            console.log("✅ Page Level Detector v18 already ready");
            resolve(true);
            return;
          }
          if (window.pageLevelDetectorV17 && window.pageLevelDetectorv17Ready) {
            console.log("✅ Page Level Detector v17 already ready");
            resolve(true);
            return;
          }
          if (window.pageLevelDetector && window.__pageLevelDetectorReady) {
            console.log("✅ Page Level Detector legacy already ready");
            resolve(true);
            return;
          }

          const onReadyV22 = () => {
            const ver = checkPLDVersion();
            console.log(`✅ PLD ${ver} ready (event)`);
            resolve(true);
          };
          const onReadyV20 = () => { console.log("✅ PLD v20.x ready (event)"); resolve(true); };
          const onReadyV19 = () => { console.log("✅ PLD v19 ready (event)"); resolve(true); };
          const onReadyV18 = () => { console.log("✅ PLD v18 ready (event)"); resolve(true); };
          const onReadyLegacy = () => { console.log("✅ PLD legacy ready (event)"); resolve(true); };

          window.addEventListener("pageLevelDetectorv22Ready", onReadyV22, { once: true });
          window.addEventListener("pageLevelDetectorv20Ready", onReadyV20, { once: true });
          window.addEventListener("pageLevelDetectorv19Ready", onReadyV19, { once: true });
          window.addEventListener("pageLevelDetectorV19Ready", onReadyV19, { once: true });
          window.addEventListener("pageLevelDetectorv18Ready", onReadyV18, { once: true });
          window.addEventListener("pageLevelDetectorReady", onReadyLegacy, { once: true });

          setTimeout(() => {
            if (window.pageLevelDetectorv22 || window.pageLevelDetectorv20 ||
                window.pageLevelDetectorv19 || window.pageLevelDetectorV18 ||
                window.pageLevelDetector) {
              console.log("✅ PLD ready (timeout fallback)");
              resolve(true);
            } else {
              console.warn("⚠️ PageLevelDetector timeout, using defaults");
              resolve(false);
            }
          }, 10000);
        });
      }

      // ============================================================
      // 📌 TUNGGU DETECT EVERGREEN READY
      // ============================================================
      function waitForDetectEvergreen() {
        return new Promise((resolve) => {
          if (window.__detectEvergreenReady && typeof window.detectEvergreen === "function") {
            resolve(true);
            return;
          }
          window.addEventListener("detectEvergreenReady", () => resolve(true), { once: true });
          setTimeout(() => {
            if (typeof window.detectEvergreen === "function") {
              resolve(true);
            } else {
              console.warn("⚠️ detectEvergreen timeout");
              resolve(false);
            }
          }, 5000);
        });
      }

      // ============================================================
      // 📌 WAIT FOR BREADCRUMB
      // ============================================================
      function waitForBreadcrumb(timeout = 3000) {
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
                  console.log(`🍞 [HybridDateModified v9.7] Breadcrumb ditemukan (${selector}) — ${links.length} link`);
                  resolve(true);
                  return;
                }
                if (element.innerText.trim().length > 0) {
                  console.log(`🍞 [HybridDateModified v9.7] Breadcrumb ditemukan (${selector}) — ada teks`);
                  resolve(true);
                  return;
                }
              }
            }

            if (Date.now() - startTime > timeout) {
              console.log(`⏰ [HybridDateModified v9.7] Breadcrumb timeout (${timeout}ms), lanjutkan`);
              resolve(false);
              return;
            }

            setTimeout(checkBreadcrumb, 100);
          }

          checkBreadcrumb();
        });
      }

      // ============================================================
      // 📌 LOAD ALL SCRIPTS
      // ============================================================
      async function loadAllScripts() {
        const PAGE_LEVEL_DETECTOR_URL = "https://raw.githack.com/aliyul/solution-blogger/main/PageLevelDetector.js";
        const EVERGREEN_DETECTOR_URL = "https://raw.githack.com/aliyul/solution-blogger/main/SmartEvergreenDetector.js";

        if (typeof window.pageLevelDetectorv22 === "undefined" &&
            typeof window.pageLevelDetectorv20 === "undefined" &&
            typeof window.pageLevelDetectorv19 === "undefined" &&
            typeof window.pageLevelDetectorV18 === "undefined" &&
            typeof window.pageLevelDetectorV17 === "undefined" &&
            typeof window.pageLevelDetector === "undefined") {
          console.log("⏳ Loading Page Level Detector v23.0.0...");
          await loadExternalJS(PAGE_LEVEL_DETECTOR_URL);
          await waitForPageLevelDetector();
          const ver = window.pageLevelDetectorv22?.version || "unknown";
          console.log(`✅ Page Level Detector v${ver} READY`);
        }

        if (typeof window.detectEvergreen !== "function") {
          console.log("⏳ Loading Smart Evergreen Detector...");
          await loadExternalJS(EVERGREEN_DETECTOR_URL);
          await waitForDetectEvergreen();
          console.log("✅ Smart Evergreen Detector READY");
        }
      }

      // ============================================================
      // 📌 🆕 DETEKSI FOKUS KONTEN — V9.7
      //     Prioritas: PLD detectContentFocus() > Internal
      // ============================================================
      function detectContentFocus() {
        // ✅ FIX v9.7: Coba pakai PLD detectContentFocus() dulu
        if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detectContentFocus === "function") {
          try {
            const pldLevel = window.pageLevelDetectorv22.detect();
            const pldEntity = window.pageLevelDetectorv22.detectEntityType();
            const pldFocus = window.pageLevelDetectorv22.detectContentFocus(pldLevel, pldEntity);
            if (pldFocus) {
              const focus = String(pldFocus).toLowerCase();
              console.log(`🎯 [PLD v23] Content Focus: ${focus} (dari PLD detectContentFocus)`);
              return {
                focus: focus,
                reason: 'PLD v23.0.0 detectContentFocus()',
                priority: 0,
                source: 'PLD'
              };
            }
          } catch (e) {
            console.warn("⚠️ PLD detectContentFocus() error: " + e.message + " → fallback ke internal");
          }
        }

        // === FALLBACK: Internal detection ===
        const h1 = document.querySelector('h1');
        const h1Text = h1 ? h1.innerText.toLowerCase() : '';
        const title = document.title?.toLowerCase() || '';
        const content = document.querySelector('.post-body.entry-content, .post-body, article, main, section')?.innerText?.toLowerCase() || '';
        const url = location.href.toLowerCase();
        const combined = h1Text + ' ' + title + ' ' + content + ' ' + url;

        // PRIORITAS 1: CEK H1
        const yearPattern = /\b(19|20)\d{2}\b/;
        const hasYearInH1 = yearPattern.test(h1Text);
        if (hasYearInH1) {
          console.log(`📅 H1 mengandung tahun → FOKUS: HARGA (wajib non-evergreen)`);
          return { focus: 'harga', reason: 'H1 mengandung tahun', priority: 1, source: 'internal' };
        }

        const hasRpInH1 = /Rp\s*[\d.,]+/.test(h1Text);
        if (hasRpInH1) {
          console.log(`💰 H1 mengandung Rp → FOKUS: HARGA`);
          return { focus: 'harga', reason: 'H1 mengandung Rp', priority: 1, source: 'internal' };
        }

        const hasHargaInH1 = /harga|biaya|tarif|estimasi/.test(h1Text);
        if (hasHargaInH1) {
          console.log(`💰 H1 mengandung kata harga → FOKUS: HARGA`);
          return { focus: 'harga', reason: 'H1 mengandung kata harga', priority: 1, source: 'internal' };
        }

        const informatifKeywords = ['panduan', 'spesifikasi', 'keunggulan', 'cara memilih', 'tips', 'perbedaan', 'jenis', 'apa itu'];
        const hasInformatifInH1 = informatifKeywords.some(k => h1Text.includes(k));
        if (hasInformatifInH1) {
          console.log(`📚 H1 mengandung kata informatif → FOKUS: INFORMASI`);
          return { focus: 'informasi', reason: 'H1 mengandung kata informatif', priority: 1, source: 'internal' };
        }

        // PRIORITAS 2: CEK TABEL HARGA
        const tables = document.querySelectorAll('table');
        let hasPriceTable = false;
        let hasSpecTable = false;

        tables.forEach(table => {
          const tableText = table.innerText.toLowerCase();
          if ((tableText.includes('harga') || tableText.includes('biaya') || tableText.includes('estimasi')) &&
              tableText.match(/[\d.,]+/)) {
            hasPriceTable = true;
          }
          if (tableText.includes('spesifikasi') || tableText.includes('ukuran') || tableText.includes('mutu')) {
            hasSpecTable = true;
          }
        });

        if (hasPriceTable && !hasSpecTable) {
          console.log(`📊 Ada tabel HARGA → FOKUS: HARGA`);
          return { focus: 'harga', reason: 'Ada tabel harga (tanpa tabel spesifikasi)', priority: 2, source: 'internal' };
        }

        // PRIORITAS 3: SKOR KONTEN
        const eduKeywords = [
          'panduan', 'spesifikasi', 'keunggulan', 'ukuran', 'dimensi', 'cara memilih',
          'tips', 'informasi', 'pengertian', 'definisi', 'jenis', 'macam', 'tipe',
          'perbedaan', 'kelebihan', 'kekurangan', 'material', 'bahan', 'standar',
          'mutu', 'k225', 'k250', 'k300', 'komposisi', 'struktur', 'aplikasi',
          'penggunaan', 'manfaat', 'keuntungan', 'solusi', 'rekomendasi'
        ];
        const priceKeywords = [
          'harga', 'biaya', 'estimasi', 'tarif', 'mulai dari', 'per meter',
          'per lembar', 'per kubik', 'per unit', 'promo', 'diskon', 'penawaran',
          'daftar harga', 'tabel harga', 'rincian biaya', 'simulasi biaya',
          'total biaya', 'anggaran', 'budget'
        ];

        let eduScore = 0;
        let priceScore = 0;

        eduKeywords.forEach(k => { if (combined.includes(k)) eduScore++; });
        priceKeywords.forEach(k => { if (combined.includes(k)) priceScore++; });

        const hasPriceCTA = document.querySelector('.cta-box, .cta-button, .btn-wa, [href*="wa.me"]')?.innerText?.toLowerCase()?.includes('harga') || false;
        if (hasPriceCTA) priceScore += 2;

        console.log(`📊 [Content Focus] Edu Score: ${eduScore}, Price Score: ${priceScore}`);

        if (priceScore > eduScore * 1.3) {
          console.log(`🎯 Fokus: HARGA (price score lebih tinggi)`);
          return { focus: 'harga', reason: `Price Score (${priceScore}) > Edu Score (${eduScore})`, priority: 3, source: 'internal' };
        }

        if (eduScore > priceScore * 1.3) {
          console.log(`🎯 Fokus: INFORMASI (edu score lebih tinggi)`);
          return { focus: 'informasi', reason: `Edu Score (${eduScore}) > Price Score (${priceScore})`, priority: 3, source: 'internal' };
        }

        console.log(`🎯 Fokus: INFORMASI (default)`);
        return { focus: 'informasi', reason: 'Default (tidak terdeteksi harga)', priority: 4, source: 'internal' };
      }

      // ============================================================
      // 📌 TO ISO WITH TIMEZONE LOCAL
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
      // 📌 STABLE HASH
      // ============================================================
      function stableHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = (hash << 5) - hash + str.charCodeAt(i);
          hash |= 0;
        }
        return Math.abs(hash);
      }

      // ============================================================
      // 📌 UPDATE META DATE MODIFIED
      // ============================================================
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
          meta.setAttribute("content", isoDate);
        });
      }

      // ============================================================
      // 📌 FUNGSI MENENTUKAN CUSTOM DATE
      // ============================================================
      function getCustomDateByPageLevel(pageLevel, entityType, contentFocus) {
        if (EVERGREEN_LEVELS.includes(pageLevel)) {
          if (pageLevel === 'home') {
            console.log(`📌 [${pageLevel}] HOMEPAGE → EVERGREEN (TANPA update berkala)`);
            return "2026-01-01T00:00:00+07:00";
          }
          console.log(`📌 [${pageLevel}] EVERGREEN → TANPA update berkala (V37)`);
          return "2026-01-01T00:00:00+07:00";
        }

        if (FLEXIBLE_LEVELS.includes(pageLevel)) {
          console.log(`📌 [${pageLevel}] FLEXIBLE → Update 1-2x setahun`);
          return "2026-06-01T00:00:00+07:00";
        }

        if (pageLevel === 'money-page') {
          if (contentFocus === 'informasi') {
            console.log(`📌 [${pageLevel}] MONEY_PAGE INFORMASI → EVERGREEN`);
            return "2026-01-01T00:00:00+07:00";
          } else {
            console.log(`📌 [${pageLevel}] MONEY_PAGE HARGA → NON-EVERGREEN (WAJIB update berkala)`);
            return null;
          }
        }

        if (pageLevel === 'money-master') {
          if (contentFocus === 'informasi') {
            console.log(`📌 [${pageLevel}] MONEY_MASTER INFORMASI → EVERGREEN`);
            return "2026-01-01T00:00:00+07:00";
          } else {
            console.log(`📌 [${pageLevel}] MONEY_MASTER HARGA → NON-EVERGREEN`);
            return null;
          }
        }

        if (pageLevel === 'money-child') {
          if (contentFocus === 'informasi') {
            console.log(`📌 [${pageLevel}] MONEY_CHILD INFORMASI → EVERGREEN`);
            return "2026-01-01T00:00:00+07:00";
          } else {
            console.log(`📌 [${pageLevel}] MONEY_CHILD HARGA → NON-EVERGREEN`);
            return null;
          }
        }

        console.log(`📌 [${pageLevel}] UNKNOWN → AUTO update (fallback)`);
        return null;
      }

      // ============================================================
      // 📌 FUNGSI GET CATEGORY LABEL
      // ============================================================
      function getCategoryLabel(pageLevel, contentFocus) {
        if (pageLevel === 'home') return 'HOMEPAGE (EVERGREEN — V37)';
        if (EVERGREEN_LEVELS.includes(pageLevel)) return 'EVERGREEN (V37)';
        if (FLEXIBLE_LEVELS.includes(pageLevel)) return 'FLEXIBLE';

        if (pageLevel === 'money-page') {
          if (contentFocus === 'informasi') return 'MONEY_PAGE_INFORMASI (EVERGREEN — V37)';
          return 'MONEY_PAGE_HARGA (NON-EVERGREEN — V37)';
        }

        if (pageLevel === 'money-master') {
          if (contentFocus === 'informasi') return 'MONEY_MASTER_INFORMASI (EVERGREEN — V37)';
          return 'MONEY_MASTER_HARGA (NON-EVERGREEN — V37)';
        }

        if (pageLevel === 'money-child') {
          if (contentFocus === 'informasi') return 'MONEY_CHILD_INFORMASI (EVERGREEN — V37)';
          return 'MONEY_CHILD_HARGA (NON-EVERGREEN — V37)';
        }

        return 'UNKNOWN';
      }

      // ============================================================
      // 📌 GET PAGE LEVEL FROM DETECTOR (v23 + backward compat)
      // ============================================================
      async function getPageLevelFromDetector() {
        await new Promise(resolve => setTimeout(resolve, 300));

        let pageLevel = 'pillar';
        let entityType = 'produk';
        let detectorVersion = 'unknown';
        let confidence = null;
        let strategies = null;
        let strategyCount = null;

        if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
          try {
            pageLevel = window.pageLevelDetectorv22.detect();
            entityType = window.pageLevelDetectorv22.detectEntityType();

            // ✅ FIX v9.7: Deteksi versi aktual
            const ver = window.pageLevelDetectorv22.version || "unknown";
            detectorVersion = (ver.indexOf("23.") === 0) ? "v23.0.0" :
                              (ver.indexOf("22.") === 0) ? "v22.x" : "v" + ver;

            if (typeof window.pageLevelDetectorv22.getConfidenceScore === 'function') {
              const confidenceScore = window.pageLevelDetectorv22.getConfidenceScore();
              confidence = confidenceScore.confidence;
              strategies = confidenceScore.strategies;
              strategyCount = confidenceScore.strategyCount;
            }
            console.log(`📌 [${detectorVersion}] Detected: ${pageLevel}, Entity: ${entityType}`);
            if (confidence) {
              console.log(`   🎯 Confidence: ${confidence}% (${strategyCount} strategies: ${strategies?.join(", ")})`);
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

      // ============================================================
      // 📌 EKSEKUSI UTAMA
      // ============================================================

      console.log("🔥 Hybrid Date Modified v9.7 - Starting...");
      console.log("📋 V37 COMPLIANT: SP1 → EVERGREEN, MP Informasi → EVERGREEN");
      console.log("📋 FIX v9.2: MM Informasi → EVERGREEN, MM Harga → NON-EVERGREEN");
      console.log("📋 FIX v9.2: MC Informasi → EVERGREEN, MC Harga → NON-EVERGREEN");
      console.log("📋 FIX v9.3: SKIP LOGIC untuk halaman statis & homepage");
      console.log("📋 FIX v9.4: Hapus getEventListeners (fix error)");
      console.log("📋 FIX v9.5: DOMContentLoaded waiter sebelum eksekusi");
      console.log("📋 FIX v9.6: WAIT BREADCRUMB sebelum eksekusi");
      console.log("📋 FIX v9.7: KOMPATIBEL PLD v23.0.0 (Merged Final)");

      await loadAllScripts();

      const { pageLevel, entityType, detectorVersion, confidence, strategies, strategyCount } = await getPageLevelFromDetector();

      const ALL_KNOWN_LEVELS = [...EVERGREEN_LEVELS, ...FLEXIBLE_LEVELS, 'home', 'money-page', 'money-master', 'money-child'];
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

      console.log(`📋 PAGE CLASSIFICATION (V37):`);
      console.log(`   - Page Level: ${finalPageLevel}`);
      console.log(`   - Entity Type: ${entityType}`);
      console.log(`   - Category: ${categoryLabel}`);
      console.log(`   - Detector: ${detectorVersion}`);
      if (confidence) console.log(`   - Confidence: ${confidence}%`);
      if (contentFocus) console.log(`   - Content Focus: ${contentFocus} (${focusReason}) [${focusSource}]`);
      console.log(`   - Mode: ${manualMode ? 'MANUAL (custom date)' : 'AUTO (dynamic)'}`);

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
        console.warn("[HybridDateModified] AEDMetaDates tidak ditemukan, skip update.");
        return;
      }

      const { dateModified, nextUpdate, type: aedType, entityType: detectedEntityType, pageLevel: detectedPageLevel } = window.AEDMetaDates;

      console.log(`📊 betonjayareadymix.com Page Info (V37):`);
      console.log(`   - type: ${aedType}`);
      console.log(`   - entityType: ${detectedEntityType}`);
      console.log(`   - pageLevel: ${detectedPageLevel}`);
      console.log(`   - dateModified: ${dateModified}`);
      console.log(`   - nextUpdate: ${nextUpdate}`);

      const uniquePageIdentifier = window.location.pathname;
      let hashSource = uniquePageIdentifier;

      if (EVERGREEN_LEVELS.includes(detectedPageLevel)) {
        hashSource = 'evergreen-' + hashSource;
      } else if (FLEXIBLE_LEVELS.includes(detectedPageLevel)) {
        hashSource = 'flexible-' + hashSource;
      } else if (detectedPageLevel === 'money-page' && contentFocus === 'informasi') {
        hashSource = 'money-page-informasi-evergreen-' + hashSource;
      } else if (detectedPageLevel === 'money-page' && contentFocus === 'harga') {
        hashSource = 'money-page-harga-' + hashSource;
      } else if (detectedPageLevel === 'money-master' && contentFocus === 'informasi') {
        hashSource = 'money-master-informasi-evergreen-' + hashSource;
      } else if (detectedPageLevel === 'money-master' && contentFocus === 'harga') {
        hashSource = 'money-master-harga-' + hashSource;
      } else if (detectedPageLevel === 'money-child' && contentFocus === 'informasi') {
        hashSource = 'money-child-informasi-evergreen-' + hashSource;
      } else if (detectedPageLevel === 'money-child' && contentFocus === 'harga') {
        hashSource = 'money-child-harga-' + hashSource;
      } else if (detectedPageLevel === 'home') {
        hashSource = 'home-evergreen-' + hashSource;
      }

      const hash = stableHash(hashSource);
      const offsetSeconds = hash % 86400;
      const finalDate = new Date(new Date(dateModified).getTime() + offsetSeconds * 1000);
      const isoDate = toISOWithTimezoneLocal(finalDate);

      updateMetaDateModified(isoDate);

      // ✅ FIX v9.7: Tambahan info dari PLD v23 (kategori, h1Pattern, dll)
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
        hybridVersion: '9.7',

        // ✅ Deteksi info
        detectionConfidence: confidence,
        detectionStrategies: strategies,
        detectionStrategyCount: strategyCount,
        breadcrumbReady: breadcrumbReady,

        // 🆕 PHASE 4.6 info (dari PLD v23)
        pldKategori: pldKategori,
        pldH1Pattern: pldH1Pattern,
        pldSchemaType: pldSchemaType,
        pldCtaType: pldCtaType,

        v37Rules: {
          sp1Evergreen: true,
          moneyPageInformasiEvergreen: contentFocus === 'informasi',
          moneyPageHargaNonEvergreen: contentFocus === 'harga',
          moneyMasterInformasiEvergreen: contentFocus === 'informasi',
          moneyMasterHargaNonEvergreen: contentFocus === 'harga',
          moneyChildInformasiEvergreen: contentFocus === 'informasi',
          moneyChildHargaNonEvergreen: contentFocus === 'harga',
          flexibleRemoved: true,
          skipHomepage: true,
          skipStaticPages: true
        }
      };

      console.log(`✅ [HybridDateModified v9.7] ${uniquePageIdentifier}`);
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
      console.log(`📋 Hybrid Date Modified v9.7 applied successfully ✅ (PLD v23 + V37 COMPLIANT)`);

    } catch (err) {
      console.error("[HybridDateModified] Fatal error:", err);
    }
  }

})();
