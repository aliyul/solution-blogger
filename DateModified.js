/* ============================================================
 🔥 Hybrid Date Modified v9.6.1 — TANPA WAIT BREADCRUMB
    ✅ UNTUK betonjayareadymix.com
    ✅ FIX v9.6.1: HAPUS waitForBreadcrumb()
    ✅ FIX v9.6: HAPUS SEMUA VERSI LAMA SEBELUM EKSEKUSI
    ✅ FIX v9.6: WAIT DOMContentLoaded sebelum eksekusi
    ✅ SINKRON dengan Smart Evergreen Detector v15.2
    ✅ SINKRON dengan V37 FULL SITE AUTO ARCHITECTURE
    ✅ PATOKAN UTAMA: H1 (Informasi → Evergreen, Harga → Non-Evergreen)
    ✅ DETEKSI TAHUN di H1 → WAJIB NON-EVERGREEN
    ✅ DETEKSI Rp di H1 → HARGA
    ✅ DETEKSI TABEL HARGA → HARGA (prioritas tinggi)
    ✅ FULL COMPATIBLE: Page Level Detector v22.x, v20.x, v19.x, v18, v17
============================================================ */

(function() {
  "use strict";

  // ============================================================
  // 🔥🔥🔥 STEP 0: CLEANER — HAPUS SEMUA VERSI LAMA 🔥🔥🔥
  // ============================================================

  (function hybridCleaner() {
    console.log("🧹 [HybridDateModified v9.6.1] CLEANER: Menghapus semua versi lama...");

    // ============================================================
    // 1. HAPUS FUNGSI DARI WINDOW
    // ============================================================
    const functionsToKill = [
      'runHybridDateModified',
      'HybridDateModified',
      '__hybridDateModifiedReady',
      '__hybridDateModifiedActive',
      '_hybridDateModifiedInit',
      '__hybridDateModified',
      'hybridDateModified',
      '__dateModifiedReady',
      'dateModifiedScript'
    ];

    functionsToKill.forEach(key => {
      if (window[key] !== undefined) {
        console.log(`🛑 [CLEANER] Menghapus window.${key}`);
        try {
          window[key] = null;
          delete window[key];
        } catch(e) {}
      }
    });

    // ============================================================
    // 2. HAPUS SCRIPT ELEMENT DARI DOM
    // ============================================================
    const scriptSelectors = [
      'script[src*="HybridDateModified"]',
      'script[src*="hybrid-date"]',
      'script[src*="date-modified"]',
      'script[id*="hybrid-date"]',
      'script[id*="date-modified"]',
      'script[class*="hybrid-date"]',
      'script[src*="SmartEvergreenDetector"]'
    ];

    scriptSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        console.log(`🛑 [CLEANER] Menghapus script: ${el.src || 'inline'}`);
        el.remove();
      });
    });

    // ============================================================
    // 3. HAPUS INLINE SCRIPT YANG MENGANDUNG VERSI LAMA
    // ============================================================
    document.querySelectorAll('script').forEach(script => {
      const content = script.textContent || '';
      const isOldVersion = 
        content.includes('Hybrid Date Modified v9.') ||
        content.includes('runHybridDateModified') ||
        content.includes('__hybridDateModifiedReady') ||
        (content.includes('processMetaDates') && content.includes('hybrid'));

      if (isOldVersion && !content.includes('v9.6.1')) {
        console.log('🛑 [CLEANER] Menghapus inline script versi lama');
        script.remove();
      }
    });

    // ============================================================
    // 4. HAPUS EVENT LISTENER LAMA
    // ============================================================
    const events = ['DOMContentLoaded', 'load', 'pageshow', 'pageLevelDetectorReady', 'detectEvergreenReady'];
    events.forEach(event => {
      try {
        document.removeEventListener(event, window._hybridInit);
        window.removeEventListener(event, window._hybridInit);
      } catch(e) {}
    });

    // ============================================================
    // 5. BLOKIR LOAD EXTERNAL JS LAMA
    // ============================================================
    const originalLoadExternal = window.loadExternalJS;
    if (originalLoadExternal) {
      window.loadExternalJS = function(src) {
        if (src && (
          src.includes('HybridDateModified') ||
          src.includes('hybrid-date') ||
          src.includes('date-modified')
        )) {
          console.log(`🚫 [CLEANER] Blocked loading old script: ${src}`);
          return Promise.resolve();
        }
        return originalLoadExternal.apply(this, arguments);
      };
    }

    // ============================================================
    // 6. CEK DAN HAPUS TIMEOUT/INTERVAL LAMA
    // ============================================================
    try {
      const highestId = setTimeout(() => {}, 0);
      for (let i = 0; i < highestId; i++) {
        clearTimeout(i);
        clearInterval(i);
      }
      console.log(`🛑 [CLEANER] Cleared ${highestId} timeouts/intervals`);
    } catch(e) {
      console.warn('⚠️ [CLEANER] Could not clear all timeouts');
    }

    // ============================================================
    // 7. TANDAI BAHWA CLEANER SUDAH BERJALAN
    // ============================================================
    window.__hybridCleanerExecuted = true;
    console.log("✅ [CLEANER] Semua versi lama telah dihapus.");
    console.log("🚀 [CLEANER] Siap menjalankan Hybrid Date Modified v9.6.1...");
  })();

  // ============================================================
  // 🔥🔥🔥 TUNGGU DOM READY SEBELUM EKSEKUSI 🔥🔥🔥
  // ============================================================
  
  if (document.readyState === "loading") {
    console.log("[HybridDateModified v9.6.1] ⏳ Menunggu DOMContentLoaded...");
    document.addEventListener("DOMContentLoaded", function() {
      console.log("[HybridDateModified v9.6.1] ✅ DOM siap, menjalankan script...");
      setTimeout(runHybridDateModified, 300);
    });
  } else {
    console.log("[HybridDateModified v9.6.1] ✅ DOM sudah siap, menjalankan script...");
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
        console.log(`⏸️ [HybridDateModified v9.6.1] HOMEPAGE terdeteksi (${currentPath}), skip script.`);
        console.log(`   📌 Homepage tidak memerlukan dateModified untuk SEO.`);
        return;
      }
      
      if (isStaticPage) {
        console.log(`⏸️ [HybridDateModified v9.6.1] HALAMAN STATIS terdeteksi (${currentPath}), skip script.`);
        console.log(`   📌 Halaman statis tidak memerlukan dateModified dinamis.`);
        return;
      }
      
      if (!isContentPage) {
        console.log(`⏸️ [HybridDateModified v9.6.1] HALAMAN TANPA KONTEN UTAMA (${currentPath}), skip script.`);
        console.log(`   📌 Halaman tanpa konten utama tidak memerlukan dateModified.`);
        return;
      }
      
      console.log(`✅ [HybridDateModified v9.6.1] Halaman ${currentPath} LAYAK diproses.`);

      // ============================================================
      // 🔥🔥🔥 TANDAI SCRIPT INI SEBAGAI YANG AKTIF 🔥🔥🔥
      // ============================================================
      
      console.log("🛑 [HybridDateModified v9.6.1] Mencari dan mematikan script date modified versi lama...");
      
      // TANDAI VERSI INI SEBAGAI AKTIF
      window.__hybridDateModifiedActive = 'v9.6.1';
      window.__hybridDateModifiedReady = true;
      window.runHybridDateModified = runHybridDateModified;
      
      console.log("✅ [HybridDateModified v9.6.1] Script versi ini aktif.");
      console.log("🚀 [HybridDateModified v9.6.1] Memulai eksekusi...");

      // ============================================================
      // 📌 KONSTANTA PAGE LEVELS (V37 — REVISI v9.6.1)
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
          // Cegah load versi lama
          if (src && src.includes('HybridDateModified')) {
            console.warn(`🚫 [v9.6.1] Blocked loading old HybridDateModified: ${src}`);
            resolve();
            return;
          }
          
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
      // 📌 TUNGGU PAGE LEVEL DETECTOR READY
      // ============================================================
      function waitForPageLevelDetector() {
        return new Promise((resolve) => {
          if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22Ready) {
            console.log("✅ Page Level Detector v22.x already ready");
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
          
          const onReadyV22 = () => { console.log("✅ PLD v22.x ready (event)"); resolve(true); };
          const onReadyV20 = () => { console.log("✅ PLD v20.x ready (event)"); resolve(true); };
          const onReadyV19 = () => { console.log("✅ PLD v19 ready (event)"); resolve(true); };
          const onReadyV18 = () => { console.log("✅ PLD v18 ready (event fallback)"); resolve(true); };
          const onReadyLegacy = () => { console.log("✅ PLD legacy ready (event fallback)"); resolve(true); };
          
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
          console.log("⏳ Loading Page Level Detector v22.x...");
          await loadExternalJS(PAGE_LEVEL_DETECTOR_URL);
          await waitForPageLevelDetector();
          console.log("✅ Page Level Detector v22.x READY");
        }
        
        if (typeof window.detectEvergreen !== "function") {
          console.log("⏳ Loading Smart Evergreen Detector...");
          await loadExternalJS(EVERGREEN_DETECTOR_URL);
          await waitForDetectEvergreen();
          console.log("✅ Smart Evergreen Detector READY");
        }
      }

      // ============================================================
      // 📌 DETEKSI FOKUS KONTEN — V9.6.1
      // ============================================================
      function detectContentFocus() {
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
          return { focus: 'harga', reason: 'H1 mengandung tahun', priority: 1 };
        }

        const hasRpInH1 = /Rp\s*[\d.,]+/.test(h1Text);
        if (hasRpInH1) {
          console.log(`💰 H1 mengandung Rp → FOKUS: HARGA`);
          return { focus: 'harga', reason: 'H1 mengandung Rp', priority: 1 };
        }

        const hasHargaInH1 = /harga|biaya|tarif|estimasi/.test(h1Text);
        if (hasHargaInH1) {
          console.log(`💰 H1 mengandung kata harga → FOKUS: HARGA`);
          return { focus: 'harga', reason: 'H1 mengandung kata harga', priority: 1 };
        }

        const informatifKeywords = ['panduan', 'spesifikasi', 'keunggulan', 'cara memilih', 'tips', 'perbedaan', 'jenis', 'apa itu'];
        const hasInformatifInH1 = informatifKeywords.some(k => h1Text.includes(k));
        if (hasInformatifInH1) {
          console.log(`📚 H1 mengandung kata informatif → FOKUS: INFORMASI`);
          return { focus: 'informasi', reason: 'H1 mengandung kata informatif', priority: 1 };
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
          return { focus: 'harga', reason: 'Ada tabel harga (tanpa tabel spesifikasi)', priority: 2 };
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
          return { focus: 'harga', reason: `Price Score (${priceScore}) > Edu Score (${eduScore})`, priority: 3 };
        }

        if (eduScore > priceScore * 1.3) {
          console.log(`🎯 Fokus: INFORMASI (edu score lebih tinggi)`);
          return { focus: 'informasi', reason: `Edu Score (${eduScore}) > Price Score (${priceScore})`, priority: 3 };
        }

        console.log(`🎯 Fokus: INFORMASI (default)`);
        return { focus: 'informasi', reason: 'Default (tidak terdeteksi harga)', priority: 4 };
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
      // 📌 FUNGSI MENENTUKAN CUSTOM DATE (V9.6.1)
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
            console.log(`📌 [${pageLevel}] MONEY_PAGE INFORMASI → EVERGREEN (TANPA update berkala) — V37`);
            return "2026-01-01T00:00:00+07:00";
          } else {
            console.log(`📌 [${pageLevel}] MONEY_PAGE HARGA → NON-EVERGREEN (WAJIB update berkala) — V37`);
            return null;
          }
        }
        
        if (pageLevel === 'money-master') {
          if (contentFocus === 'informasi') {
            console.log(`📌 [${pageLevel}] MONEY_MASTER INFORMASI → EVERGREEN (TANPA update berkala) — V37`);
            return "2026-01-01T00:00:00+07:00";
          } else {
            console.log(`📌 [${pageLevel}] MONEY_MASTER HARGA → NON-EVERGREEN (WAJIB update berkala) — V37`);
            return null;
          }
        }
        
        if (pageLevel === 'money-child') {
          if (contentFocus === 'informasi') {
            console.log(`📌 [${pageLevel}] MONEY_CHILD INFORMASI → EVERGREEN (TANPA update berkala) — V37`);
            return "2026-01-01T00:00:00+07:00";
          } else {
            console.log(`📌 [${pageLevel}] MONEY_CHILD HARGA → NON-EVERGREEN (WAJIB update berkala) — V37`);
            return null;
          }
        }
        
        console.log(`📌 [${pageLevel}] UNKNOWN → AUTO update (fallback)`);
        return null;
      }

      // ============================================================
      // 📌 FUNGSI GET CATEGORY LABEL (V9.6.1)
      // ============================================================
      function getCategoryLabel(pageLevel, contentFocus) {
        if (pageLevel === 'home') return 'HOMEPAGE (EVERGREEN — V37)';
        if (EVERGREEN_LEVELS.includes(pageLevel)) return 'EVERGREEN (V37)';
        if (FLEXIBLE_LEVELS.includes(pageLevel)) return 'FLEXIBLE';
        
        if (pageLevel === 'money-page') {
          if (contentFocus === 'informasi') {
            return 'MONEY_PAGE_INFORMASI (EVERGREEN — V37)';
          }
          return 'MONEY_PAGE_HARGA (NON-EVERGREEN — V37)';
        }
        
        if (pageLevel === 'money-master') {
          if (contentFocus === 'informasi') {
            return 'MONEY_MASTER_INFORMASI (EVERGREEN — V37)';
          }
          return 'MONEY_MASTER_HARGA (NON-EVERGREEN — V37)';
        }
        
        if (pageLevel === 'money-child') {
          if (contentFocus === 'informasi') {
            return 'MONEY_CHILD_INFORMASI (EVERGREEN — V37)';
          }
          return 'MONEY_CHILD_HARGA (NON-EVERGREEN — V37)';
        }
        
        return 'UNKNOWN';
      }

      // ============================================================
      // 📌 GET PAGE LEVEL FROM DETECTOR
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
            detectorVersion = 'v22.x';
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
      
      console.log("🔥 Hybrid Date Modified v9.6.1 - Starting...");
      console.log("📋 V37 COMPLIANT: SP1 → EVERGREEN, MP Informasi → EVERGREEN");
      console.log("📋 FIX v9.2: MM Informasi → EVERGREEN, MM Harga → NON-EVERGREEN");
      console.log("📋 FIX v9.2: MC Informasi → EVERGREEN, MC Harga → NON-EVERGREEN");
      console.log("📋 FIX v9.3: SKIP LOGIC untuk halaman statis & homepage");
      console.log("📋 FIX v9.4: Hapus getEventListeners (fix error)");
      console.log("📋 FIX v9.5: DOMContentLoaded waiter sebelum eksekusi");
      console.log("📋 FIX v9.6.1: HAPUS waitForBreadcrumb()");
      console.log("📋 FIX v9.6: CLEANER — Hapus semua versi lama sebelum eksekusi");
      console.log("📋 ATURAN V9.6.1: PATOKAN H1 (Informasi → Evergreen, Harga → Non-Evergreen)");
      
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
      
      console.log(`   - Content Focus: ${contentFocus} (${focusReason}, priority: ${focusPriority})`);
      
      let customDate = getCustomDateByPageLevel(finalPageLevel, entityType, contentFocus);
      let manualMode = customDate !== null;
      let categoryLabel = getCategoryLabel(finalPageLevel, contentFocus);
      
      console.log(`📋 PAGE CLASSIFICATION (V37):`);
      console.log(`   - Page Level: ${finalPageLevel}`);
      console.log(`   - Entity Type: ${entityType}`);
      console.log(`   - Category: ${categoryLabel}`);
      console.log(`   - Detector: ${detectorVersion}`);
      if (confidence) console.log(`   - Confidence: ${confidence}%`);
      if (contentFocus) console.log(`   - Content Focus: ${contentFocus} (${focusReason})`);
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

      window.AEDMetaDates = {
        ...window.AEDMetaDates,
        dateModified: isoDate,
        hashOffset: offsetSeconds,
        detectorVersion: detectorVersion,
        category: categoryLabel,
        contentFocus: contentFocus,
        focusReason: focusReason,
        focusPriority: focusPriority,
        mode: manualMode ? 'MANUAL' : 'AUTO',
        originalDateModified: dateModified,
        hybridVersion: '9.6.1',
        detectionConfidence: confidence,
        detectionStrategies: strategies,
        detectionStrategyCount: strategyCount,
        cleanerExecuted: true,
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
          skipStaticPages: true,
          waitBreadcrumbRemoved: true
        }
      };

      console.log(`✅ [HybridDateModified v9.6.1] ${uniquePageIdentifier}`);
      console.log(`   → Final Date Modified: ${isoDate}`);
      console.log(`   → Offset: ${offsetSeconds} detik (${Math.floor(offsetSeconds / 3600)} jam ${Math.floor((offsetSeconds % 3600) / 60)} menit)`);
      console.log(`   → Mode: ${manualMode ? 'MANUAL' : 'AUTO'}`);
      console.log(`   → Category: ${categoryLabel}`);
      console.log(`   → Content Focus: ${contentFocus} (${focusReason})`);
      if (confidence) console.log(`   → Detection Confidence: ${confidence}%`);
      console.log(`   → Cleaner Executed: ✅`);
      console.log(`   → Wait Breadcrumb: ❌ DIHAPUS`);
      console.log(`📋 Hybrid Date Modified v9.6.1 applied successfully ✅ (V37 COMPLIANT)`);

    } catch (err) {
      console.error("[HybridDateModified] Fatal error:", err);
    }
  }

})();
