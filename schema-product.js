/**
 * ⚡ AutoSchema Hybrid v4.63 — FOKUS PRODUK & MATERIAL + AUTO FIX GAMBAR + DETEKSI LAYAK + POSISI DI DALAM ARTICLE
 * 
 * UPDATE v4.63:
 * - FIX: Posisi gambar di dalam tag <article> paling atas
 * - FIX: Jika ada update-badge, gambar diletakkan SETELAH badge
 * - FIX: Jika tidak ada badge, gambar diletakkan SETELAH H1 atau paling atas article
 * - ADD: Fungsi getImageInsertionPoint() untuk menentukan posisi sisipan
 * - ADD: Fungsi createFigure() untuk membuat figure baru
 * - Logo dan gambar menggunakan konsep auto fix gambar
 * - Parent halaman dari breadcrumbs terdekat saja
 * 
 * @version 4.63
 * @date 2026-08-29
 */

(function() {
  "use strict";

  // ===================== KONFIGURASI =====================
  const CONFIG = {
    DEBUG: true,
    DELAY_MS: 500,
    MAX_OFFERS: 8,
    MIN_PRICE: 10000,
    MAX_PRICE: 100000000,
    SKIP_WORD_COUNT: 300,
    PLD_TIMEOUT: 5000
  };

  // ✅ FALLBACK IMAGE (logo)
  const LOGO_IMAGE = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";
  const FALLBACK_IMAGE = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiWWAP6ezcmzgbGtHmmJqBjYkbsdQBrwCeC9pl9ocjL-VSQYftirdvXAF1T-eg_QMSqu1WiFidDc9fnChi0yaOqi0Dd6EVMy4ZX3P7vccY4XJMu-7k2TGVd5TS1wIG5jgIm_6beYVb2zuNQGS7eBuODJqd20c4ckvd0-HaEqGf4W-B_750I91wi9IhqqnI/s320/No_Image_Available.jpg";

  function log(msg, type = "INFO") {
    if (!CONFIG.DEBUG && type === "INFO") return;
    const icons = { INFO: "📘", WARN: "⚠️", ERROR: "❌", SUCCESS: "✅", SKIP: "⏭️", PRODUCT: "🏗️", IMAGE: "📸" };
    const prefix = icons[type] || "📘";
    console.log(`${prefix} [AutoSchema v4.63] ${msg}`);
  }

  // ============================================================
  // 🔥🔥🔥 DETEKSI HALAMAN LAYAK GAMBAR 🔥🔥🔥
  // ============================================================
  function isImageEligible(pageLevel) {
    log(`Checking image eligibility for page level: ${pageLevel}`, "IMAGE");

    // 1. SKIP: Pillar edukasi murni (panduan, tips, cara, dll)
    if (pageLevel === 'pillar') {
      const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
      const title = document.title.toLowerCase();
      const combined = h1 + " " + title;
      
      const pillarEdukasi = [
        "panduan", "tips", "cara", "apa itu", "pengertian", "definisi",
        "overview", "komprehensif", "langkah", "tutorial", "pedoman",
        "petunjuk", "kenali", "mengenal", "memahami", "belajar"
      ];
      
      for (let keyword of pillarEdukasi) {
        if (combined.includes(keyword)) {
          log(`⏭️ Skip gambar: Pillar edukasi murni (keyword: "${keyword}")`, "SKIP");
          return false;
        }
      }
      
      const productKeywords = ["beton", "readymix", "precast", "paving", "tiang", "pancang", "pondasi", "jasa", "sewa"];
      for (let keyword of productKeywords) {
        if (combined.includes(keyword)) {
          log(`✅ Pillar dengan produk/jasa tetap layak gambar (keyword: "${keyword}")`, "SUCCESS");
          return true;
        }
      }
      
      log(`⏭️ Skip gambar: Pillar tanpa produk/jasa`, "SKIP");
      return false;
    }

    // 2. SKIP: Halaman dengan konten sangat pendek
    const content = document.querySelector(".post-body.entry-content, .post-body, article, main")?.innerText || "";
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    
    if (wordCount < CONFIG.SKIP_WORD_COUNT) {
      log(`⏭️ Skip gambar: Konten terlalu pendek (${wordCount} kata < ${CONFIG.SKIP_WORD_COUNT})`, "SKIP");
      return false;
    }
    log(`✅ Konten mencukupi (${wordCount} kata)`, "SUCCESS");

    // 3. SKIP: Halaman HARGA tanpa harga
    if (pageLevel === 'money-page' || pageLevel === 'money-child') {
      const url = location.href.toLowerCase();
      if (url.includes('harga')) {
        const hasPrice = /Rp\s*[\d.,]+/.test(document.body.innerText);
        if (!hasPrice) {
          log(`⏭️ Skip gambar: Halaman HARGA tanpa harga ditemukan`, "SKIP");
          return false;
        }
        log(`✅ Halaman HARGA dengan harga ditemukan`, "SUCCESS");
      }
    }

    // 4. LAYAK: Money pages, Variant, Sub-Variant, SP1, SP2
    const eligibleLevels = [
      'money-master', 'money-page', 'money-child', 
      'variant', 'sub-variant', 
      'sub-pillar-tipe-1', 'sub-pillar-tipe-2'
    ];
    
    if (eligibleLevels.includes(pageLevel)) {
      log(`✅ Halaman LAYAK mendapat gambar (level: ${pageLevel})`, "SUCCESS");
      return true;
    }

    // 5. LAYAK: Jika halaman sudah memiliki gambar
    const hasImage = document.querySelector('img:not([src*="logo"]):not([src*="icon"]):not([src*="avatar"])');
    if (hasImage) {
      log(`✅ Halaman sudah memiliki gambar, tetap layak`, "SUCCESS");
      return true;
    }

    log(`⏭️ Skip gambar: Halaman tidak masuk kriteria layak`, "SKIP");
    return false;
  }

  // ============================================================
  // 🔥🔥🔥 AUTO FIX GAMBAR (FORMAT 1) — REVISI: DI DALAM ARTICLE 🔥🔥🔥
  // ============================================================
  function fixImagesToFormat1() {
    log('Fixing images to Format 1 inside article...', "IMAGE");
    
    const h1Element = document.querySelector('h1');
    const h1Text = h1Element ? h1Element.textContent.trim() : document.title;

    // ===== CARI TEMPAT TARUH GAMBAR (DI DALAM ARTICLE) =====
    function getImageInsertionPoint() {
      // 1. Cari tag article
      let article = document.querySelector('article');
      
      // 2. Jika tidak ada article, cari container konten utama
      if (!article) {
        const candidates = [
          '.post-body', 'main', '.content', '.entry-content', 
          '.post-content', '.article-content', '.blog-post'
        ];
        for (let selector of candidates) {
          const el = document.querySelector(selector);
          if (el) {
            article = el;
            break;
          }
        }
      }
      
      // 3. Jika masih tidak ada, gunakan parent dari H1
      if (!article && h1Element) {
        article = h1Element.closest('section, div, main');
      }
      
      // 4. Fallback: body
      if (!article) {
        article = document.body;
      }
      
      // Cari update-badge di dalam article
      const badge = article.querySelector('.update-badge, .update-badge-class, [class*="update-badge"]');
      
      // Jika ada badge, letakkan setelah badge
      if (badge && badge.parentElement === article) {
        return {
          container: article,
          referenceNode: badge,
          position: 'after'
        };
      }
      
      // Jika tidak ada badge, cari elemen pertama di dalam article
      const firstChild = article.firstElementChild;
      
      // Jika firstChild adalah H1, letakkan setelah H1
      if (firstChild && firstChild.tagName === 'H1') {
        return {
          container: article,
          referenceNode: firstChild,
          position: 'after'
        };
      }
      
      // Jika firstChild bukan H1, letakkan di awal article
      return {
        container: article,
        referenceNode: null,
        position: 'first'
      };
    }

    // ===== CARI GAMBAR YANG SUDAH ADA =====
    let targetImage = null;
    let targetFigure = null;

    // Cari gambar pertama setelah H1 di dalam article
    if (h1Element) {
      const article = h1Element.closest('article, .post-body, main, section, div');
      if (article) {
        const siblings = article.children;
        let foundH1 = false;
        for (let i = 0; i < siblings.length; i++) {
          if (siblings[i] === h1Element) {
            foundH1 = true;
            continue;
          }
          if (foundH1) {
            const img = siblings[i].querySelector('img');
            if (img) {
              targetImage = img;
              targetFigure = siblings[i].tagName === 'FIGURE' ? siblings[i] : siblings[i].closest('figure');
              break;
            }
            if (siblings[i].tagName === 'FIGURE' && siblings[i].querySelector('img')) {
              targetImage = siblings[i].querySelector('img');
              targetFigure = siblings[i];
              break;
            }
          }
        }
      }
    }

    // Jika tidak ada gambar setelah H1, cari di konten utama
    if (!targetImage) {
      const contentAreas = document.querySelectorAll('article, section, .post-body, main, .content, .entry-content');
      for (const area of contentAreas) {
        const img = area.querySelector('img:not([src*="logo"]):not([src*="icon"]):not([src*="avatar"])');
        if (img) {
          targetImage = img;
          targetFigure = img.closest('figure');
          break;
        }
      }
    }

    // Generate alt text
    function generateAltText() {
      let alt = h1Text || document.title;
      const url = location.href.toLowerCase();
      if (!url.includes('harga') && alt.includes('Harga')) {
        alt = alt.replace('Harga', '').trim();
      }
      const year = new Date().getFullYear();
      if (!alt.includes(year.toString())) {
        alt = alt + ' ' + year;
      }
      return alt;
    }

    // Generate caption
    function generateCaption(img) {
      let caption = '';
      if (img && img.alt && img.alt.trim() !== '' && !img.alt.toLowerCase().includes('no image')) {
        caption = img.alt;
      }
      if (!caption && img && img.title && img.title.trim() !== '') {
        caption = img.title;
      }
      const existingFigcaption = img ? img.closest('figure')?.querySelector('figcaption') : null;
      if (!caption && existingFigcaption && existingFigcaption.textContent.trim() !== '') {
        caption = existingFigcaption.textContent.trim();
      }
      if (!caption) {
        caption = h1Text || document.title;
      }
      if (!caption.includes('📊') && !caption.includes('📌') && !caption.includes('📸')) {
        caption = '📊 ' + caption;
      }
      const year = new Date().getFullYear();
      if (!caption.includes(year.toString())) {
        caption = caption + ' — ' + year;
      }
      return caption;
    }

    // ===== BUAT FIGURE BARU =====
    function createFigure(imageSrc, altText, titleText, captionText) {
      const figure = document.createElement('figure');
      figure.style.padding = '1em 0px';
      figure.style.margin = '20px 0';
      figure.style.textAlign = 'center';
      figure.style.background = '#f8fafc';
      figure.style.borderRadius = '12px';

      const img = document.createElement('img');
      img.src = imageSrc;
      img.alt = altText || generateAltText();
      img.title = titleText || img.alt || generateAltText();
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
      img.setAttribute('width', '100%');
      img.setAttribute('height', 'auto');
      img.style.maxWidth = '800px';
      img.style.borderRadius = '8px';
      img.style.display = 'block';
      img.style.margin = '0 auto';
      img.style.height = 'auto';

      const figcaption = document.createElement('figcaption');
      figcaption.style.color = '#555';
      figcaption.style.fontSize = '14px';
      figcaption.style.marginTop = '10px';
      figcaption.style.padding = '0 20px';
      figcaption.style.textAlign = 'center';
      figcaption.textContent = captionText || generateCaption(null);

      figure.appendChild(img);
      figure.appendChild(figcaption);

      return figure;
    }

    // ===== DAPATKAN TEMPAT SISIPAN =====
    const insertPoint = getImageInsertionPoint();
    log(`Insertion point found`, "IMAGE");

    // ===== JIKA TIDAK ADA GAMBAR, TAMBAHKAN FALLBACK =====
    if (!targetImage) {
      log('No image found, inserting fallback...', "IMAGE");
      
      const captionText = '📊 ' + (h1Text || document.title) + ' — ' + new Date().getFullYear();
      const figure = createFigure(
        FALLBACK_IMAGE,
        generateAltText(),
        generateAltText(),
        captionText
      );

      // Sisipkan di posisi yang ditentukan
      if (insertPoint.referenceNode && insertPoint.position === 'after') {
        insertPoint.container.insertBefore(figure, insertPoint.referenceNode.nextSibling);
      } else {
        insertPoint.container.insertBefore(figure, insertPoint.container.firstChild);
      }

      log('✅ Fallback image inserted inside article', "SUCCESS");
      return figure.querySelector('img').src;
    }

    // ===== PERBAIKI GAMBAR YANG ADA =====
    log('Fixing existing image...', "IMAGE");
    const img = targetImage;
    const captionText = generateCaption(img);
    const altText = img.alt && !img.alt.toLowerCase().includes('no image') ? img.alt : generateAltText();
    const titleText = img.title || altText;

    // --- Perbaiki atribut gambar ---
    img.alt = altText;
    img.title = titleText;
    if (!img.hasAttribute('loading') || img.getAttribute('loading') !== 'lazy') {
      img.setAttribute('loading', 'lazy');
    }
    if (!img.hasAttribute('decoding') || img.getAttribute('decoding') !== 'async') {
      img.setAttribute('decoding', 'async');
    }
    if (img.getAttribute('width') && img.getAttribute('width') !== '100%' && img.getAttribute('width') !== 'auto') {
      img.setAttribute('width', '100%');
    } else if (!img.hasAttribute('width')) {
      img.setAttribute('width', '100%');
    }
    if (img.getAttribute('height') && img.getAttribute('height') !== 'auto') {
      img.setAttribute('height', 'auto');
    } else if (!img.hasAttribute('height')) {
      img.setAttribute('height', 'auto');
    }

    img.style.maxWidth = '800px';
    img.style.borderRadius = '8px';
    img.style.display = 'block';
    img.style.margin = '0 auto';
    img.style.height = 'auto';

    // --- Perbaiki atau buat figure ---
    let figure = img.closest('figure');

    if (figure && figure.tagName === 'FIGURE') {
      // Perbaiki figure yang sudah ada
      figure.style.padding = '1em 0px';
      figure.style.margin = '20px 0';
      figure.style.textAlign = 'center';
      figure.style.background = '#f8fafc';
      figure.style.borderRadius = '12px';

      if (img.parentElement !== figure) {
        figure.insertBefore(img, figure.firstChild);
      }

      let figcaption = figure.querySelector('figcaption');
      if (!figcaption) {
        figcaption = document.createElement('figcaption');
        figcaption.style.color = '#555';
        figcaption.style.fontSize = '14px';
        figcaption.style.marginTop = '10px';
        figcaption.style.padding = '0 20px';
        figcaption.style.textAlign = 'center';
        figcaption.textContent = captionText;
        figure.appendChild(figcaption);
      } else {
        if (!figcaption.textContent || figcaption.textContent.trim() === '') {
          figcaption.textContent = captionText;
        }
        figcaption.style.color = '#555';
        figcaption.style.fontSize = '14px';
        figcaption.style.marginTop = '10px';
        figcaption.style.padding = '0 20px';
        figcaption.style.textAlign = 'center';
        if (!figcaption.textContent.includes('📊') && !figcaption.textContent.includes('📌')) {
          figcaption.textContent = '📊 ' + figcaption.textContent;
        }
      }
    } else {
      // Buat figure baru
      const newFigure = createFigure(img.src, altText, titleText, captionText);
      
      // Ganti posisi gambar dengan figure baru
      const parent = img.parentElement;
      parent.insertBefore(newFigure, img);
      parent.removeChild(img);

      figure = newFigure;
    }

    img.setAttribute('data-fixed', 'true');
    log('✅ Image fixed to Format 1 inside article', "SUCCESS");
    return img.src;
  }

  // ============================================================
  // 🔥🔥🔥 PARENT DARI BREADCRUMBS TERDEKAT 🔥🔥🔥
  // ============================================================
  function getParentFromBreadcrumbs(currentUrl) {
    const breadcrumbSelectors = [
      '.breadcrumbs a', '.breadcrumb a', '.nav-trail a',
      '.breadcrumb-item a', '.crumbs a', '.breadcrumb-link',
      '[aria-label="breadcrumb"] a', '.post-breadcrumb a',
      '.breadcrumb-nav a', '.nav-breadcrumb a'
    ];

    let breadcrumbLinks = [];

    for (let selector of breadcrumbSelectors) {
      const links = document.querySelectorAll(selector);
      if (links.length > 0) {
        breadcrumbLinks = Array.from(links);
        break;
      }
    }

    if (breadcrumbLinks.length === 0) {
      const allDivs = document.querySelectorAll('div');
      for (let div of allDivs) {
        const text = div.innerText || '';
        if (text.includes('Home') || text.includes('Beranda') || 
            text.includes('›') || text.includes('»') || 
            text.includes('/')) {
          const links = div.querySelectorAll('a');
          if (links.length > 1) {
            breadcrumbLinks = Array.from(links);
            break;
          }
        }
      }
    }

    if (breadcrumbLinks.length === 0) {
      const nav = document.querySelector('nav');
      if (nav) {
        const links = nav.querySelectorAll('a');
        if (links.length > 1) {
          breadcrumbLinks = Array.from(links);
        }
      }
    }

    if (breadcrumbLinks.length > 0) {
      const validLinks = breadcrumbLinks.filter(a => {
        const href = a.href || '';
        const text = a.innerText?.trim() || '';
        if (!href || !text) return false;
        if (href === currentUrl || href.includes(currentUrl)) return false;
        if (text.toLowerCase() === 'home' || text.toLowerCase() === 'beranda') {
          if (breadcrumbLinks.length === 1) return true;
          return false;
        }
        return true;
      });

      if (validLinks.length > 0) {
        const parentLink = validLinks[validLinks.length - 1];
        const parentUrl = parentLink.href;
        const parentName = parentLink.innerText?.trim() || 'Parent Page';
        log(`Parent dari breadcrumbs: ${parentName} (${parentUrl})`, "SUCCESS");
        return {
          parentUrl: parentUrl,
          parentName: parentName
        };
      }
    }

    log('Breadcrumbs tidak ditemukan, menggunakan origin sebagai parent', "WARN");
    return {
      parentUrl: location.origin,
      parentName: 'Home'
    };
  }

  // ============================================================
  // 🔥🔥🔥 AMBIL PAGE LEVEL DARI PLD 🔥🔥🔥
  // ============================================================
  function getPageLevelFromPLD() {
    if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
      try {
        const pageLevel = window.pageLevelDetectorv22.detect();
        log(`Page Level dari PLD v22.x: ${pageLevel}`, "SUCCESS");
        return pageLevel;
      } catch(e) {
        log(`Error calling PLD v22.x: ${e.message}`, "ERROR");
      }
    }
    
    if (window.pageLevelDetectorv20 && typeof window.pageLevelDetectorv20.detect === 'function') {
      try {
        const pageLevel = window.pageLevelDetectorv20.detect();
        log(`Page Level dari PLD v20.x: ${pageLevel}`, "SUCCESS");
        return pageLevel;
      } catch(e) {
        log(`Error calling PLD v20.x: ${e.message}`, "ERROR");
      }
    }
    
    if (window.pageLevelDetectorv19 && typeof window.pageLevelDetectorv19.detect === 'function') {
      try {
        const pageLevel = window.pageLevelDetectorv19.detect();
        log(`Page Level dari PLD v19.0: ${pageLevel}`, "SUCCESS");
        return pageLevel;
      } catch(e) {
        log(`Error calling PLD v19.0: ${e.message}`, "ERROR");
      }
    }
    
    if (window.pageLevelDetectorV18 && typeof window.pageLevelDetectorV18.detect === 'function') {
      try {
        const pageLevel = window.pageLevelDetectorV18.detect();
        log(`Page Level dari PLD v18.7: ${pageLevel}`, "SUCCESS");
        return pageLevel;
      } catch(e) {
        log(`Error calling PLD v18.7: ${e.message}`, "ERROR");
      }
    }
    
    if (window.pageLevelDetectorV17 && typeof window.pageLevelDetectorV17.detect === 'function') {
      try {
        const pageLevel = window.pageLevelDetectorV17.detect();
        log(`Page Level dari PLD v17.0: ${pageLevel}`, "SUCCESS");
        return pageLevel;
      } catch(e) {
        log(`Error calling PLD v17.0: ${e.message}`, "ERROR");
      }
    }
    
    if (window.pageLevelDetector && typeof window.pageLevelDetector.detect === 'function') {
      try {
        const pageLevel = window.pageLevelDetector.detect();
        log(`Page Level dari PLD legacy: ${pageLevel}`, "SUCCESS");
        return pageLevel;
      } catch(e) {
        log(`Error calling PLD legacy: ${e.message}`, "ERROR");
      }
    }
    
    const bodyPageLevel = document.body.getAttribute('data-page-level') || 
                          document.body.getAttribute('data-schema-page-level');
    if (bodyPageLevel) {
      log(`Page Level dari body attribute: ${bodyPageLevel}`, "SUCCESS");
      return bodyPageLevel;
    }
    
    log("PLD tidak tersedia, menggunakan fallback detection", "WARN");
    return detectPageLevelFallback();
  }

  // ============================================================
  // FALLBACK DETECTION
  // ============================================================
  function detectPageLevelFallback() {
    const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
    const title = document.title.toLowerCase();
    const url = location.href.toLowerCase();
    
    const variantPatterns = ["spesifikasi", "ukuran", "dimensi", "varian", "polosan", "motif", "custom", "tinggi", "rendah"];
    for (let pattern of variantPatterns) {
      if (h1.includes(pattern) || title.includes(pattern) || url.includes(pattern)) {
        const subVariantPatterns = ["detail", "lengkap", "spesifikasi teknis"];
        for (let sub of subVariantPatterns) {
          if (h1.includes(sub) || title.includes(sub)) return "sub-variant";
        }
        return "variant";
      }
    }
    
    const locations = ["jakarta", "bekasi", "bogor", "depok", "tangerang", "karawang", "surabaya", "bandung", "cirebon", "ciamis"];
    for (let loc of locations) {
      if (h1.includes(loc) || title.includes(loc) || url.includes(loc)) return "money-child";
    }
    
    if (/\b(harga|biaya|tarif)\b/i.test(h1 + title)) return "money-page";
    if (/\b(jasa|sewa|borongan)\b/i.test(h1 + title) && !/\b(panduan|tips|cara)\b/i.test(h1 + title)) return "money-master";
    
    return "pillar";
  }

  // ============================================================
  // MENUNGGU PLD READY
  // ============================================================
  function waitForPLD() {
    return new Promise((resolve) => {
      if (window.pageLevelDetectorv22 || window.pageLevelDetectorv20 || 
          window.pageLevelDetectorv19 || window.pageLevelDetectorV18 || 
          window.pageLevelDetectorV17 || window.pageLevelDetector) {
        resolve(true);
        return;
      }
      
      const onReady = () => {
        log("PLD ready (event)", "SUCCESS");
        resolve(true);
      };
      
      window.addEventListener("pageLevelDetectorv22Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorv20Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorv19Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorReady", onReady, { once: true });
      
      setTimeout(() => {
        if (window.pageLevelDetectorv22 || window.pageLevelDetectorv20 || 
            window.pageLevelDetectorv19 || window.pageLevelDetectorV18 || 
            window.pageLevelDetectorV17 || window.pageLevelDetector) {
          log("PLD ready (timeout)", "SUCCESS");
          resolve(true);
        } else {
          log("PLD timeout, using fallback", "WARN");
          resolve(false);
        }
      }, CONFIG.PLD_TIMEOUT);
    });
  }

  // ============================================================
  // CEK APAKAH SKIP PRODUCT (FIXED v4.63)
  // ============================================================
  function shouldSkipProductSchema(pageLevel) {
    const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
    const title = document.title.toLowerCase();
    const url = location.href.toLowerCase();
    const combined = h1 + " " + title + " " + url;
    
    const isProduct = /(beton|readymix|precast|paving|panel|box|u-ditch|kanstin|gorong|material|bahan|besi|baja|pipa|atap|genteng|keramik|marmer|granit|kayu|pintu|jendela|kusen|pagar\s*panel|paving\s*block|box\s*culvert|u\s*ditch|gorong\s*gorong)/i.test(combined);
    
    if (isProduct) {
      log(`🏗️ Product/Material detected → GENERATE Product schema`, "PRODUCT");
      return false;
    }
    
    if (pageLevel === 'variant' || pageLevel === 'sub-variant') {
      log(`Variant page detected → GENERATE Product schema`, "SUCCESS");
      return false;
    }
    
    if (['money-master', 'money-page', 'money-child'].includes(pageLevel)) {
      const isProductMoney = /(beton|readymix|precast|paving|panel|box|u-ditch|kanstin|gorong|material|bahan|besi|baja|pipa|atap|genteng|keramik|marmer|granit|kayu|pintu|jendela|kusen|pagar\s*panel|paving\s*block|box\s*culvert|u\s*ditch|gorong\s*gorong)/i.test(combined);
      if (isProductMoney) {
        log(`🏗️ Product Money page → GENERATE Product schema`, "PRODUCT");
        return false;
      }
      log(`Money page detected → GENERATE Product schema`, "SUCCESS");
      return false;
    }
    
    const pillarPatterns = [
      "panduan lengkap", "pengertian", "definisi", "apa itu",
      "overview", "komprehensif", "cara memilih", "tips memilih",
      "langkah memilih", "kriteria memilih"
    ];
    
    for (let pattern of pillarPatterns) {
      if (h1.includes(pattern) || title.includes(pattern) || url.includes(pattern)) {
        log(`Skip: Halaman edukasi murni (pattern: "${pattern}")`, "SKIP");
        return true;
      }
    }
    
    log("🏗️ Halaman LAYAK untuk Product schema", "PRODUCT");
    return false;
  }

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================
  function sanitizeText(text) {
    if (!text) return "";
    return text.replace(/[\t\n\r]+/g, ' ').replace(/\s{2,}/g, ' ').trim().substring(0, 100);
  }

  function extractPrice(text) {
    if (!text) return null;
    const match = text.match(/Rp\s*([\d.,]+)/);
    if (!match) return null;
    const price = parseInt(match[1].replace(/[^\d]/g, ''));
    if (isNaN(price)) return null;
    return price;
  }

  function getAreaServed() {
    const areaProv = {
      "DKI Jakarta": "DKI Jakarta",
      "Kabupaten Bogor": "Jawa Barat",
      "Kota Bogor": "Jawa Barat",
      "Kota Depok": "Jawa Barat",
      "Kabupaten Tangerang": "Banten",
      "Kota Tangerang": "Banten",
      "Kota Tangerang Selatan": "Banten",
      "Kota Serang": "Banten",
      "Kabupaten Bekasi": "Jawa Barat",
      "Kota Bekasi": "Jawa Barat",
      "Kabupaten Karawang": "Jawa Barat"
    };
    return Object.keys(areaProv).map(a => ({ "@type": "Place", name: a }));
  }

  // ============================================================
  // DETECT PRODUCT NAME
  // ============================================================
  function detectProductName(pageLevel) {
    const h1 = document.querySelector("h1")?.innerText?.trim();
    if (h1 && h1.length < 120) return h1;
    
    const pathKey = location.pathname.split("/").pop().replace(".html", "").replace(/-/g, " ");
    
    const urlMapping = {
      "pagar panel beton polosan": "Pagar Panel Beton Polosan",
      "pagar panel beton motif": "Pagar Panel Beton Motif",
      "pagar panel beton custom": "Pagar Panel Beton Custom",
      "pagar panel beton tinggi": "Pagar Panel Beton Tinggi",
      "pagar panel beton rendah": "Pagar Panel Beton Rendah",
      "pagar panel beton": "Pagar Panel Beton",
      "u ditch": "U-Ditch",
      "box culvert": "Box Culvert",
      "gorong-gorong": "Gorong-Gorong",
      "kanstin beton": "Kanstin Beton",
      "kansteen beton": "Kanstin Beton",
      "paving block": "Paving Block",
      "conblock": "Conblock",
      "grassblock": "Grassblock",
      "beton readymix": "Beton Readymix",
      "readymix": "Beton Readymix",
      "beton cor": "Beton Cor",
      "beton ready mix": "Beton Ready Mix",
      "besi beton": "Besi Beton",
      "baja ringan": "Baja Ringan",
      "pipa paralon": "Pipa Paralon",
      "atap genteng": "Atap Genteng"
    };
    
    let productName = urlMapping[pathKey.toLowerCase()];
    if (!productName && pathKey && pathKey.length > 0 && pathKey.length < 80) {
      productName = pathKey.replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return productName || "Produk Konstruksi";
  }

  // ============================================================
  // DETECT PRODUCT CATEGORY
  // ============================================================
  function detectProductCategory(pageLevel) {
    const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
    const title = document.title.toLowerCase();
    const url = location.href.toLowerCase();
    const combined = h1 + " " + title + " " + url;
    
    if (/(beton|readymix|ready mix|cor|concrete)/i.test(combined)) {
      return "ConcreteProduct";
    }
    if (/(paving|block|conblock|grassblock|paving\s*block)/i.test(combined)) {
      return "PavingProduct";
    }
    if (/(pagar|panel|booth|gorong|box|culvert|u-ditch|kanstin|kansteen|gorong\s*gorong)/i.test(combined)) {
      return "PrecastProduct";
    }
    if (/(besi|baja|pipa|atap|genteng|baja\s*ringan|besi\s*beton)/i.test(combined)) {
      return "SteelProduct";
    }
    if (/(keramik|marmer|granit|kayu|pintu|jendela|kusen)/i.test(combined)) {
      return "BuildingMaterial";
    }
    
    if (pageLevel === 'variant' || pageLevel === 'sub-variant') {
      return "VariantProduct";
    }
    
    return "BuildingMaterial";
  }

  // ============================================================
  // EXTRACT VARIANT SPEC
  // ============================================================
  function extractVariantSpec() {
    const content = document.querySelector(".post-body.entry-content, .post-body, article, main");
    if (!content) return null;
    
    const text = content.innerText;
    const spec = {};
    
    const sizeMatch = text.match(/(\d{1,3}\s*x\s*\d{1,3})\s*(cm|meter|m)/i);
    if (sizeMatch) spec.size = sizeMatch[1] + " " + sizeMatch[2];
    
    const heightMatch = text.match(/tinggi\s*([\d.]+)\s*(meter|m|cm)/i);
    if (heightMatch) spec.height = heightMatch[1] + " " + heightMatch[2];
    
    const thickMatch = text.match(/tebal\s*([\d.]+)\s*(cm|mm)/i);
    if (thickMatch) spec.thickness = thickMatch[1] + " " + thickMatch[2];
    
    if (Object.keys(spec).length === 0) return null;
    return { "@type": "ProductVariant", ...spec };
  }

  // ============================================================
  // OFFER PARSING
  // ============================================================
  const seenItems = new Set();
  const offers = [];

  function addOffer(name, price, desc = "") {
    if (!price || price <= 0) return;
    if (price < CONFIG.MIN_PRICE || price > CONFIG.MAX_PRICE) return;
    if (offers.length >= CONFIG.MAX_OFFERS) return;
    
    let cleanName = sanitizeText(name);
    if (!cleanName || cleanName.length < 3) return;
    
    const skipKeywords = ["estimasi", "per meter", "hubungi", "call", "whatsapp", "konsultasi", "mulai dari"];
    if (skipKeywords.some(kw => cleanName.toLowerCase().includes(kw))) return;
    
    const key = cleanName + "|" + price;
    if (seenItems.has(key)) return;
    seenItems.add(key);
    
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    
    offers.push({
      "@type": "Offer",
      name: cleanName,
      url: location.href,
      priceCurrency: "IDR",
      price: price,
      priceValidUntil: validUntil,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": "https://www.betonjayareadymix.com/#localbusiness" }
    });
    
    log(`Offer added: ${cleanName} = Rp ${price.toLocaleString()}`, "SUCCESS");
  }

  function parseTableOffers() {
    const tableSelectors = ['section table', '.product-table', '.price-table', '.harga-table', 'table'];
    let found = false;
    
    for (const selector of tableSelectors) {
      const tables = document.querySelectorAll(selector);
      if (tables.length === 0) continue;
      
      for (const table of tables) {
        const rows = table.querySelectorAll('tr');
        for (const row of rows) {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 2) {
            const productCell = cells[0].innerText.trim();
            const priceCell = cells[1].innerText;
            
            if (productCell.toLowerCase().includes('produk') || 
                productCell.toLowerCase().includes('jenis') ||
                priceCell.toLowerCase().includes('harga')) {
              continue;
            }
            
            const price = extractPrice(priceCell);
            if (price && productCell && productCell.length > 0 && productCell.length < 150) {
              const isEstimasi = productCell.toLowerCase().includes('estimasi') || 
                                 priceCell.toLowerCase().includes('estimasi');
              if (!isEstimasi) {
                addOffer(productCell, price);
                found = true;
              }
            }
          }
        }
      }
      if (found) break;
    }
    return found;
  }

  function parseVariantOffers() {
    const content = document.querySelector(".post-body.entry-content, .post-body, article, main");
    if (!content) return false;
    
    const text = content.innerText;
    const variantPatterns = [
      /(tinggi|ukuran|dimensi)\s*([\d.]+)\s*(meter|m|cm)\s*(?:Rp\s*([\d.,]+))/i,
      /(panel|pagar)\s*(polosan|motif|custom)\s*(?:Rp\s*([\d.,]+))/i,
      /(tipe|varian)\s*([a-zA-Z0-9\s]+?)\s*(?:Rp\s*([\d.,]+))/i
    ];
    
    let found = false;
    for (const pattern of variantPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const name = match[0].split("Rp")[0]?.trim() || match[0].substring(0, 50);
        const price = extractPrice(match[0]);
        if (price && price > CONFIG.MIN_PRICE && price < CONFIG.MAX_PRICE) {
          addOffer(name, price, "Variant");
          found = true;
        }
      }
    }
    return found;
  }

  function parseListOffers() {
    const elements = document.querySelectorAll("li, p, .price-item, .product-item");
    const tempOffers = [];
    
    for (const el of elements) {
      const text = el.innerText;
      const price = extractPrice(text);
      if (price && price > CONFIG.MIN_PRICE && price < CONFIG.MAX_PRICE) {
        let productText = text.replace(/Rp\s*[\d.,]+/g, '').trim();
        if (productText.length > 0 && productText.length < 150) {
          tempOffers.push({ name: productText, price: price });
        }
      }
    }
    
    const seen = new Set();
    for (const offer of tempOffers) {
      const key = offer.name + "|" + offer.price;
      if (!seen.has(key) && offers.length < 5) {
        seen.add(key);
        addOffer(offer.name, offer.price);
      }
    }
  }

  // ============================================================
  // MAIN FUNCTION
  // ============================================================
  async function init() {
    log("═══════════════════════════════════════════════════", "INFO");
    log("AutoSchema Hybrid v4.63 — FOKUS PRODUK & MATERIAL + AUTO FIX GAMBAR + DETEKSI LAYAK + POSISI DI DALAM ARTICLE", "INFO");
    log("═══════════════════════════════════════════════════", "INFO");
    
    await waitForPLD();
    
    const pageLevel = getPageLevelFromPLD();
    log(`Page Level dari PLD: ${pageLevel}`, "SUCCESS");
    
    if (shouldSkipProductSchema(pageLevel)) {
      log("Product schema SKIPPED untuk halaman ini", "SKIP");
      return;
    }
    
    let imageUrl = LOGO_IMAGE;
    const isEligible = isImageEligible(pageLevel);
    
    if (isEligible) {
      log(`✅ Halaman LAYAK mendapat gambar, memproses...`, "IMAGE");
      try {
        imageUrl = fixImagesToFormat1() || LOGO_IMAGE;
      } catch(e) {
        log(`Error fixing images: ${e.message}`, "ERROR");
        imageUrl = LOGO_IMAGE;
      }
    } else {
      log(`⏭️ Halaman TIDAK LAYAK mendapat gambar, skip fix gambar`, "SKIP");
      const existingImage = document.querySelector('img:not([src*="logo"]):not([src*="icon"]):not([src*="avatar"])');
      if (existingImage) {
        imageUrl = existingImage.src || LOGO_IMAGE;
        log(`📸 Menggunakan gambar yang sudah ada di halaman`, "IMAGE");
      }
    }
    
    const currentUrl = location.href.replace(/[?&]m=1/, "");
    const parentData = getParentFromBreadcrumbs(currentUrl);
    const parentUrls = [{
      "@type": "WebPage",
      "@id": parentData.parentUrl,
      name: parentData.parentName
    }];
    
    const productName = detectProductName(pageLevel);
    const desc = document.querySelector('meta[name="description"]')?.content?.trim() || 
                 document.querySelector("article p, main p, section p")?.innerText?.trim()?.substring(0, 300) ||
                 `Produk ${productName} berkualitas dari Beton Jaya Readymix`;
    
    const areaServed = getAreaServed();
    const productCategory = detectProductCategory(pageLevel);
    
    log("Parsing offers...", "INFO");
    let hasTableOffers = parseTableOffers();
    
    if (!hasTableOffers || offers.length === 0) {
      log("Tidak ada offers dari tabel, mencoba varian...", "WARN");
      const hasVariantOffers = parseVariantOffers();
      if (!hasVariantOffers || offers.length === 0) {
        parseListOffers();
      }
    }
    
    if (offers.length === 0) {
      log("Tidak ada harga ditemukan, tetap buat Product schema tanpa offers", "WARN");
    }
    
    const business = {
      "@type": "LocalBusiness",
      "@id": "https://www.betonjayareadymix.com/#localbusiness",
      name: "Beton Jaya Readymix",
      url: "https://www.betonjayareadymix.com",
      logo: LOGO_IMAGE
    };
    
    const product = {
      "@type": "Product",
      "@id": currentUrl + "#product",
      name: productName,
      image: [imageUrl || LOGO_IMAGE],
      description: desc,
      brand: { "@type": "Brand", name: "Beton Jaya Readymix" },
      category: productCategory,
      areaServed: areaServed,
      isPartOf: parentUrls
    };
    
    if (offers.length > 0) {
      product.offers = offers;
    }
    
    if (pageLevel === 'variant' || pageLevel === 'sub-variant') {
      product.productType = pageLevel === 'variant' ? "Variant" : "Sub-Variant";
      product.material = "Beton Precast";
      product.manufacturer = { "@type": "Organization", name: "Beton Jaya Readymix" };
      
      const variantSpec = extractVariantSpec();
      if (variantSpec) {
        product.variant = variantSpec;
      }
    }
    
    const webpage = {
      "@type": "WebPage",
      "@id": currentUrl + "#webpage",
      url: currentUrl,
      name: productName,
      description: desc,
      mainEntity: { "@id": product["@id"] },
      isPartOf: parentUrls
    };
    
    const graph = [webpage, business, product];
    
    let existingScript = document.querySelector("#auto-schema-product");
    if (!existingScript) {
      existingScript = document.createElement("script");
      existingScript.type = "application/ld+json";
      existingScript.id = "auto-schema-product";
      document.head.appendChild(existingScript);
      log("Element #auto-schema-product dibuat baru", "SUCCESS");
    }
    
    existingScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": graph
    }, null, 2);
    
    log("═══════════════════════════════════════════════════", "INFO");
    log("EXECUTION SUMMARY:", "INFO");
    log(`🏗️  Fokus: PRODUK & MATERIAL`, "PRODUCT");
    log(`  Page Level (dari PLD): ${pageLevel}`, "SUCCESS");
    log(`  Product Name   : ${productName}`, "SUCCESS");
    log(`  Product Category: ${productCategory}`, "SUCCESS");
    log(`  Offers Count   : ${offers.length}`, "SUCCESS");
    log(`  Valid Prices   : ${offers.filter(o => o.price > 0).length}`, "SUCCESS");
    log(`  Is Variant     : ${(pageLevel === 'variant' || pageLevel === 'sub-variant') ? '✅' : '❌'}`, "INFO");
    log(`  Image Eligible : ${isEligible ? '✅' : '❌'}`, "IMAGE");
    log(`  Has Image      : ${imageUrl !== LOGO_IMAGE ? '✅ (custom)' : '⚠️ (fallback)'}`, "IMAGE");
    log(`  Parent URL     : ${parentData.parentUrl}`, "INFO");
    log(`  Parent Name    : ${parentData.parentName}`, "INFO");
    log("═══════════════════════════════════════════════════", "INFO");
    log("AutoSchema Hybrid v4.63 SELESAI", "SUCCESS");
  }
  
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(init, CONFIG.DELAY_MS);
    });
  } else {
    setTimeout(init, CONFIG.DELAY_MS);
  }
  
})();
