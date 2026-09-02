/**
 * ⚡ AutoSchema Hybrid v4.69 — DETEKSI FOKUS KONTEN + ATURAN TAHUN DINAMIS
 * 
 * UPDATE v4.69:
 * - FIX: Error matchAll (tambahkan flag 'g' pada semua pattern)
 * - FIX: Fallback match untuk browser yang tidak support matchAll
 * - FIX: MONEY_PAGE INFORMASI/EDUKASI → TANPA tahun di H1
 * - FIX: MONEY_PAGE HARGA → TETAP pakai tahun di H1
 * - FIX: VARIANT dan SUB-VARIANT WAJIB GAMBAR (tanpa syarat wordCount)
 * - FIX: MONEY_MASTER, MONEY_PAGE, MONEY_CHILD WAJIB GAMBAR (tanpa syarat)
 * - ADD: Auto Generate Gambar dari Canvas (dengan teks nama halaman + tahun)
 * - ADD: Auto Update H1 (tahun diupdate jika kurang dari tahun sekarang)
 * - ADD: Deteksi Kebutuhan Tahun per Level (Money level = pakai tahun)
 * - ADD: Warna Unik per Level (background berbeda untuk setiap level)
 * 
 * @version 4.69
 * @date 2026-09-02
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
    const icons = { INFO: "📘", WARN: "⚠️", ERROR: "❌", SUCCESS: "✅", SKIP: "⏭️", PRODUCT: "🏗️", IMAGE: "📸", YEAR: "📅", FOCUS: "🎯" };
    const prefix = icons[type] || "📘";
    console.log(`${prefix} [AutoSchema v4.69] ${msg}`);
  }

  // ============================================================
  // 🔥🔥🔥 DETEKSI FOKUS KONTEN (INFORMASI vs HARGA) 🔥🔥🔥
  // ============================================================
  function detectContentFocus() {
    const h1 = document.querySelector('h1')?.innerText?.toLowerCase() || '';
    const title = document.title?.toLowerCase() || '';
    const content = document.querySelector('.post-body.entry-content, .post-body, article, main, section')?.innerText?.toLowerCase() || '';
    const url = location.href.toLowerCase();
    const combined = h1 + ' ' + title + ' ' + content + ' ' + url;

    log(`🎯 Detecting content focus...`, "FOCUS");

    // ===== KATA KUNCI INFORMASI/EDUKASI =====
    const eduKeywords = [
      'panduan', 'spesifikasi', 'keunggulan', 'ukuran', 'dimensi', 'cara memilih',
      'tips', 'informasi', 'pengertian', 'definisi', 'jenis', 'macam', 'tipe',
      'perbedaan', 'kelebihan', 'kekurangan', 'material', 'bahan', 'standar',
      'mutu', 'k225', 'k250', 'k300', 'komposisi', 'struktur', 'aplikasi',
      'penggunaan', 'manfaat', 'keuntungan', 'solusi', 'rekomendasi'
    ];

    // ===== KATA KUNCI HARGA =====
    const priceKeywords = [
      'harga', 'biaya', 'estimasi', 'tarif', 'mulai dari', 'per meter',
      'per lembar', 'per kubik', 'per unit', 'promo', 'diskon', 'penawaran',
      'daftar harga', 'tabel harga', 'rincian biaya', 'simulasi biaya',
      'total biaya', 'anggaran', 'budget', 'cost'
    ];

    // ===== CEK DI URL =====
    const urlHasHarga = url.includes('harga') || url.includes('biaya') || url.includes('tarif');
    const urlHasEdu = url.includes('spesifikasi') || url.includes('panduan') || url.includes('jenis');

    // ===== CEK DI H1 =====
    const h1HasPrice = priceKeywords.some(k => h1.includes(k));
    const h1HasEdu = eduKeywords.some(k => h1.includes(k));

    // ===== CEK DI KONTEN =====
    let eduScore = 0;
    let priceScore = 0;

    for (const kw of eduKeywords) {
      if (combined.includes(kw)) eduScore++;
    }
    for (const kw of priceKeywords) {
      if (combined.includes(kw)) priceScore++;
    }

    // ===== CEK KEBERADAAN TABEL HARGA =====
    const hasPriceTable = document.querySelector('table')?.innerText?.toLowerCase()?.includes('harga') || false;
    if (hasPriceTable) priceScore += 3;

    // ===== CEK KEBERADAAN CTA HARGA =====
    const hasPriceCTA = document.querySelector('.cta-box, .cta-button, .btn-wa, [href*="wa.me"]')?.innerText?.toLowerCase()?.includes('harga') || false;
    if (hasPriceCTA) priceScore += 2;

    // ===== LOGIKA FINAL =====
    log(`📊 Edu Score: ${eduScore}, Price Score: ${priceScore}`, "FOCUS");

    if (priceScore > eduScore * 1.5) {
      log(`🎯 Fokus: HARGA (price: ${priceScore}, edu: ${eduScore})`, "FOCUS");
      return 'harga';
    }

    if (eduScore > priceScore * 1.5) {
      log(`🎯 Fokus: INFORMASI/EDUKASI (edu: ${eduScore}, price: ${priceScore})`, "FOCUS");
      return 'informasi';
    }

    if (eduScore < 2 && priceScore < 2) {
      if (urlHasHarga || h1HasPrice) {
        log(`🎯 Fokus: HARGA (from H1/URL)`, "FOCUS");
        return 'harga';
      }
      if (urlHasEdu || h1HasEdu) {
        log(`🎯 Fokus: INFORMASI/EDUKASI (from H1/URL)`, "FOCUS");
        return 'informasi';
      }
    }

    if (eduScore >= priceScore) {
      log(`🎯 Fokus: INFORMASI/EDUKASI (default)`, "FOCUS");
      return 'informasi';
    }

    log(`🎯 Fokus: HARGA (default)`, "FOCUS");
    return 'harga';
  }

  // ============================================================
  // 🔥🔥🔥 FUNGSI PENDUKUNG 🔥🔥🔥
  // ============================================================

  function getColorConfig(level) {
    const colors = {
      'pillar': { bg: '#0a2a44', text: '#ffffff', accent: '#25d366' },
      'sub-pillar-tipe-2': { bg: '#1a237e', text: '#ffffff', accent: '#25d366' },
      'sub-pillar-tipe-1': { bg: '#004d40', text: '#ffffff', accent: '#25d366' },
      'money-master': { bg: '#0a2a44', text: '#ffffff', accent: '#ffd700' },
      'money-page': { bg: '#1a5a8c', text: '#ffffff', accent: '#ffd700' },
      'money-child': { bg: '#bf360c', text: '#ffffff', accent: '#ffd700' },
      'variant': { bg: '#4a148c', text: '#ffffff', accent: '#25d366' },
      'sub-variant': { bg: '#4e342e', text: '#ffffff', accent: '#25d366' }
    };
    return colors[level] || colors['pillar'];
  }

  function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
  }

  // ============================================================
  // 🔥🔥🔥 ATURAN TAHUN (DENGAN DETEKSI FOKUS KONTEN) 🔥🔥🔥
  // ============================================================
  function needYear(level) {
    const moneyLevels = ['money-master', 'money-page', 'money-child'];
    
    if (!moneyLevels.includes(level)) {
      log(`⏭️ Level ${level} → TIDAK butuh tahun`, "YEAR");
      return false;
    }

    if (level === 'money-page') {
      const focus = detectContentFocus();
      if (focus === 'informasi') {
        log(`⏭️ MONEY_PAGE INFORMASI/EDUKASI → SKIP tahun`, "YEAR");
        return false;
      }
      log(`✅ MONEY_PAGE HARGA → WAJIB tahun`, "YEAR");
      return true;
    }

    log(`✅ ${level} → WAJIB tahun`, "YEAR");
    return true;
  }

  function getCurrentYear() {
    return new Date().getFullYear();
  }

  function extractYear(text) {
    const match = text.match(/\b(20[2-9][0-9])\b/);
    return match ? parseInt(match[1]) : null;
  }

  // ============================================================
  // 🔥🔥🔥 AMBIL NAMA DARI URL BERSIH 🔥🔥🔥
  // ============================================================
  function getCleanPageName(level) {
    let cleanName = '';
    
    let path = window.location.pathname;
    path = path.replace(/^\/p\//, '');
    path = path.replace(/\/\d{4}\/\d{2}\//g, '/');
    path = path.replace(/\.html$/, '');
    
    let segments = path.split('/').filter(s => s.length > 0);
    let lastSegment = segments.length > 0 ? segments[segments.length - 1] : '';
    
    cleanName = lastSegment.replace(/[-_]+/g, ' ');
    cleanName = cleanName.replace(/\b\w/g, function(l) { return l.toUpperCase(); });
    cleanName = cleanName.replace(/\s\d+$/, '');
    
    if (level === 'pillar' || level === 'sub-pillar-tipe-1' || level === 'sub-pillar-tipe-2') {
      cleanName = cleanName.replace(/^(Harga|Jasa|Biaya|Tarif)\s*/i, '').trim();
    }
    
    if (cleanName.length < 3) {
      let h1Text = document.querySelector('h1')?.innerText?.trim();
      if (h1Text && h1Text.length > 3) {
        cleanName = h1Text
          .replace(/\b(20[2-9][0-9])\b/g, '')
          .replace(/\s*[–—\-|]\s*/g, ' ')
          .replace(/^(Harga|Jasa|Biaya|Tarif|Estimasi)\s*/i, '')
          .trim();
      }
    }
    
    if (cleanName.length < 3) {
      let title = document.title
        .replace(/\b(20[2-9][0-9])\b/g, '')
        .replace(/\s*[–—\-|]\s*/g, ' ')
        .trim();
      if (title.length > 3) cleanName = title;
    }
    
    if (cleanName.length < 3) cleanName = 'Halaman Utama';
    if (cleanName.length > 55) cleanName = cleanName.substring(0, 52) + '...';
    
    log(`📝 Clean page name from URL: "${cleanName}"`, "IMAGE");
    return cleanName;
  }

  // ============================================================
  // 🔥🔥🔥 GENERATE GAMBAR DARI CANVAS 🔥🔥🔥
  // ============================================================

  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
      if (r > w/2) r = w/2;
      if (r > h/2) r = h/2;
      this.moveTo(x + r, y);
      this.lineTo(x + w - r, y);
      this.quadraticCurveTo(x + w, y, x + w, y + r);
      this.lineTo(x + w, y + h - r);
      this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      this.lineTo(x + r, y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - r);
      this.lineTo(x, y + r);
      this.quadraticCurveTo(x, y, x + r, y);
      return this;
    };
  }

  function createImageWithText(pageName, level, year) {
    const colors = getColorConfig(level);
    const needYearFlag = needYear(level);
    const displayYear = needYearFlag ? ' ' + year : '';
    const fullText = pageName + displayYear;

    const width = 820;
    const height = 360;
    const padding = 40;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, colors.bg);
    gradient.addColorStop(0.5, colors.bg);
    gradient.addColorStop(1, lightenColor(colors.bg, 25));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 3;
    const bPad = 15;
    ctx.strokeRect(bPad, bPad, width - (bPad * 2), height - (bPad * 2));

    // TULISAN ATAS
    const logoText = '🏗️ Beton Jaya Readymix';
    ctx.font = 'bold 18px Arial, sans-serif';
    const logoMetrics = ctx.measureText(logoText);
    const logoWidth = logoMetrics.width + 40;
    const logoHeight = 36;
    const logoX = (width - logoWidth) / 2;
    const logoY = padding - 10;

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.roundRect(logoX, logoY, logoWidth, logoHeight, 18);
    ctx.fill();

    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(logoText, width / 2, padding + 8);

    // GARIS PEMISAH
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding, 72);
    ctx.lineTo(width - padding, 72);
    ctx.stroke();

    // TEKS UTAMA
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let fontSize = 42;
    const textLength = fullText.length;
    if (textLength > 30) fontSize = 36;
    if (textLength > 40) fontSize = 32;
    if (textLength > 50) fontSize = 28;
    if (textLength > 60) fontSize = 24;

    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;

    const maxCharsPerLine = 24;
    const words = fullText.split(' ');
    let lines = [];
    let currentLine = '';

    for (let word of words) {
      if (currentLine.length + word.length + 1 <= maxCharsPerLine) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);

    if (lines.length > 3) {
      const combined = fullText;
      lines = [];
      let idx = 0;
      while (idx < combined.length) {
        let end = Math.min(idx + maxCharsPerLine, combined.length);
        let lastSpace = combined.lastIndexOf(' ', end);
        if (lastSpace > idx && end < combined.length) end = lastSpace;
        lines.push(combined.substring(idx, end).trim());
        idx = end + 1;
        if (lines.length >= 3) {
          if (idx < combined.length) {
            lines[2] = lines[2] + '...';
          }
          break;
        }
      }
    }

    const centerY = height / 2 + 8;

    if (lines.length === 1) {
      ctx.font = `bold ${fontSize + 8}px Arial, sans-serif`;
      ctx.fillStyle = colors.text;
      ctx.fillText(lines[0], width / 2, centerY);
    } else if (lines.length === 2) {
      const lineHeight = fontSize + 14;
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.fillStyle = colors.text;
      ctx.fillText(lines[0], width / 2, centerY - (lineHeight / 2));
      ctx.fillText(lines[1], width / 2, centerY + (lineHeight / 2));
    } else {
      const lineHeight = fontSize + 12;
      const startY = centerY - ((lines.length - 1) * lineHeight / 2);
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.fillStyle = colors.text;
      lines.forEach((line, i) => {
        ctx.fillText(line, width / 2, startY + (i * lineHeight));
      });
    }

    // TULISAN BAWAH
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const watermarkText = '© Beton Jaya Readymix';
    ctx.font = '13px Arial, sans-serif';
    const wmMetrics = ctx.measureText(watermarkText);
    const wmWidth = wmMetrics.width + 30;
    const wmHeight = 28;
    const wmX = (width - wmWidth) / 2;
    const wmY = height - padding + 2;

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.roundRect(wmX, wmY, wmWidth, wmHeight, 14);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '13px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(watermarkText, width / 2, height - padding + 16);

    return canvas.toDataURL('image/png');
  }

  // ============================================================
  // 🔥🔥🔥 STYLE RESPONSIF UNTUK FIGURE 🔥🔥🔥
  // ============================================================
  function applyResponsiveStyles(figure, img) {
    figure.style.padding = '1em 0px';
    figure.style.margin = '20px 0';
    figure.style.textAlign = 'center';
    figure.style.background = '#f8fafc';
    figure.style.borderRadius = '12px';
    figure.style.width = '100%';
    figure.style.maxWidth = '100%';
    figure.style.display = 'block';
    figure.style.overflow = 'hidden';

    img.style.width = '100%';
    img.style.maxWidth = '820px';
    img.style.height = 'auto';
    img.style.aspectRatio = '820/360';
    img.style.objectFit = 'contain';
    img.style.borderRadius = '8px';
    img.style.display = 'block';
    img.style.margin = '0 auto';
    img.style.padding = '0 10px';
    img.style.boxSizing = 'border-box';

    const styleId = 'responsive-image-style-v469';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @media (max-width: 820px) {
          figure[data-auto-figure="true"] img {
            max-width: 100% !important;
            height: auto !important;
            aspect-ratio: auto !important;
          }
          figure[data-auto-figure="true"] {
            padding: 0.5em 0px !important;
            margin: 10px 0 !important;
          }
        }
        @media (max-width: 480px) {
          figure[data-auto-figure="true"] figcaption {
            font-size: 12px !important;
            padding: 0 10px !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
    figure.setAttribute('data-auto-figure', 'true');
  }

  // ============================================================
  // 🔥🔥🔥 CEK GAMBAR & PERBAIKI — TETAP FIGURE 🔥🔥🔥
  // ============================================================
  function fixImagesToFormat1() {
    log('Checking images in content...', "IMAGE");
    
    const pageLevel = getPageLevelFromPLD();
    const currentYear = getCurrentYear();
    const needYearFlag = needYear(pageLevel);
    const pageName = getCleanPageName(pageLevel);
    const displayName = needYearFlag ? pageName + ' ' + currentYear : pageName;

    function getImageInsertionPoint() {
      let article = document.querySelector('article');
      if (!article) {
        const candidates = ['.post-body', 'main', '.content', '.entry-content', '.post-content', '.article-content', '.blog-post'];
        for (let selector of candidates) {
          const el = document.querySelector(selector);
          if (el) { article = el; break; }
        }
      }
      if (!article) {
        const h1 = document.querySelector('h1');
        if (h1) article = h1.closest('section, div, main');
      }
      if (!article) article = document.body;

      const badge = article.querySelector('.update-badge, .update-badge-class, [class*="update-badge"]');
      if (badge && badge.parentElement === article) {
        return { container: article, referenceNode: badge, position: 'after' };
      }

      const firstChild = article.firstElementChild;
      if (firstChild && firstChild.tagName === 'H1') {
        return { container: article, referenceNode: firstChild, position: 'after' };
      }

      return { container: article, referenceNode: null, position: 'first' };
    }

    let targetImage = null;
    let targetFigure = null;

    const h1Element = document.querySelector('h1');
    if (h1Element) {
      const article = h1Element.closest('article, .post-body, main, section, div');
      if (article) {
        const siblings = article.children;
        let foundH1 = false;
        for (let i = 0; i < siblings.length; i++) {
          if (siblings[i] === h1Element) { foundH1 = true; continue; }
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

    const autoImageDataUrl = createImageWithText(pageName, pageLevel, currentYear);
    const captionText = '📊 ' + displayName;

    if (targetImage) {
      log('Image found in content, fixing for SEO...', "IMAGE");

      const img = targetImage;
      const figure = targetFigure || img.closest('figure');

      const currentSrc = img.src || '';
      if (currentSrc.includes('No_Image') || currentSrc.includes('placeholder') || !currentSrc) {
        img.src = autoImageDataUrl;
        log('Image src replaced with auto-generated', "IMAGE");
      } else {
        log('Existing image preserved, only updating attributes', "IMAGE");
      }

      img.alt = displayName;
      img.title = displayName;
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
      img.setAttribute('data-auto-generated', 'true');
      img.setAttribute('data-page-level', pageLevel);
      img.setAttribute('data-year', currentYear);

      if (figure && figure.tagName === 'FIGURE') {
        applyResponsiveStyles(figure, img);

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
          figcaption.textContent = captionText;
          figcaption.style.color = '#555';
          figcaption.style.fontSize = '14px';
          figcaption.style.marginTop = '10px';
          figcaption.style.padding = '0 20px';
          figcaption.style.textAlign = 'center';
        }
      } else {
        log('Wrapping image with FIGURE...', "IMAGE");
        const newFigure = document.createElement('figure');
        const parent = img.parentElement;
        parent.insertBefore(newFigure, img);
        newFigure.appendChild(img);

        const figcaption = document.createElement('figcaption');
        figcaption.style.color = '#555';
        figcaption.style.fontSize = '14px';
        figcaption.style.marginTop = '10px';
        figcaption.style.padding = '0 20px';
        figcaption.style.textAlign = 'center';
        figcaption.textContent = captionText;
        newFigure.appendChild(figcaption);
        applyResponsiveStyles(newFigure, img);
      }

      log('✅ Image fixed with SEO FIGURE', "SUCCESS");
      return figure;
    }

    log('No image found, creating new responsive FIGURE...', "IMAGE");

    const insertPoint = getImageInsertionPoint();
    const figure = document.createElement('figure');
    const img = document.createElement('img');

    img.src = autoImageDataUrl;
    img.alt = displayName;
    img.title = displayName;
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
    img.setAttribute('data-auto-generated', 'true');
    img.setAttribute('data-page-level', pageLevel);
    img.setAttribute('data-year', currentYear);

    const figcaption = document.createElement('figcaption');
    figcaption.style.color = '#555';
    figcaption.style.fontSize = '14px';
    figcaption.style.marginTop = '10px';
    figcaption.style.padding = '0 20px';
    figcaption.style.textAlign = 'center';
    figcaption.textContent = captionText;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    applyResponsiveStyles(figure, img);

    if (insertPoint.referenceNode && insertPoint.position === 'after') {
      insertPoint.container.insertBefore(figure, insertPoint.referenceNode.nextSibling);
    } else {
      insertPoint.container.insertBefore(figure, insertPoint.container.firstChild);
    }

    log('✅ New responsive FIGURE created', "SUCCESS");
    return figure;
  }

  // ============================================================
  // 🔥🔥🔥 AUTO UPDATE TAHUN 🔥🔥🔥
  // ============================================================

  function updateH1Year(pageLevel) {
    if (!needYear(pageLevel)) {
      log(`⏭️ Level ini TIDAK butuh tahun di H1 (${pageLevel})`, "YEAR");
      return false;
    }

    const currentYear = getCurrentYear();
    const h1 = document.querySelector('h1');
    if (!h1) {
      log(`⚠️ Tidak ada H1 ditemukan`, "WARN");
      return false;
    }

    const originalText = h1.innerText;
    const detectedYear = extractYear(originalText);

    if (!detectedYear) {
      const newText = originalText + ' ' + currentYear;
      h1.innerText = newText;
      log(`✅ H1: Tahun ditambahkan → "${newText}"`, "YEAR");
      return true;
    }

    if (detectedYear < currentYear) {
      const newText = originalText.replace(/\b(20[2-9][0-9])\b/, currentYear);
      h1.innerText = newText;
      log(`✅ H1: Tahun diupdate ${detectedYear} → ${currentYear}`, "YEAR");
      return true;
    }

    log(`✅ H1: Tahun sudah sesuai (${detectedYear})`, "YEAR");
    return true;
  }

  // ============================================================
  // 🔥🔥🔥 DETEKSI HALAMAN LAYAK GAMBAR 🔥🔥🔥
  // ============================================================
  function isImageEligible(pageLevel) {
    log(`Checking image eligibility for page level: ${pageLevel}`, "IMAGE");

    const mandatoryImageLevels = [
      'money-master', 
      'money-page', 
      'money-child',
      'variant',
      'sub-variant'
    ];
    
    if (mandatoryImageLevels.includes(pageLevel)) {
      log(`✅ WAJIB GAMBAR (level: ${pageLevel}) — TANPA SYARAT`, "SUCCESS");
      return true;
    }

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
          log(`✅ Pillar dengan produk/jasa tetap layak gambar`, "SUCCESS");
          return true;
        }
      }
      
      log(`⏭️ Skip gambar: Pillar tanpa produk/jasa`, "SKIP");
      return false;
    }

    if (pageLevel === 'sub-pillar-tipe-1' || pageLevel === 'sub-pillar-tipe-2') {
      const content = document.querySelector(".post-body.entry-content, .post-body, article, main")?.innerText || "";
      const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
      
      if (wordCount < CONFIG.SKIP_WORD_COUNT) {
        log(`⏭️ Skip gambar: Sub-Pillar konten terlalu pendek (${wordCount} kata)`, "SKIP");
        return false;
      }
      
      log(`✅ LAYAK GAMBAR (level: ${pageLevel})`, "SUCCESS");
      return true;
    }

    const content = document.querySelector(".post-body.entry-content, .post-body, article, main")?.innerText || "";
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    
    if (wordCount < CONFIG.SKIP_WORD_COUNT) {
      log(`⏭️ Skip gambar: Konten terlalu pendek (${wordCount} kata < ${CONFIG.SKIP_WORD_COUNT})`, "SKIP");
      return false;
    }

    const hasImage = document.querySelector('img:not([src*="logo"]):not([src*="icon"]):not([src*="avatar"])');
    if (hasImage) {
      log(`✅ Halaman sudah memiliki gambar, tetap layak`, "SUCCESS");
      return true;
    }

    log(`⏭️ Skip gambar: Halaman tidak masuk kriteria layak`, "SKIP");
    return false;
  }

  // ============================================================
  // 🔥🔥🔥 AMBIL PAGE LEVEL DARI PLD 🔥🔥🔥
  // ============================================================
  function getPageLevelFromPLD() {
    if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
      try { return window.pageLevelDetectorv22.detect(); } catch(e) {}
    }
    if (window.pageLevelDetectorv20 && typeof window.pageLevelDetectorv20.detect === 'function') {
      try { return window.pageLevelDetectorv20.detect(); } catch(e) {}
    }
    if (window.pageLevelDetectorv19 && typeof window.pageLevelDetectorv19.detect === 'function') {
      try { return window.pageLevelDetectorv19.detect(); } catch(e) {}
    }
    if (window.pageLevelDetectorV18 && typeof window.pageLevelDetectorV18.detect === 'function') {
      try { return window.pageLevelDetectorV18.detect(); } catch(e) {}
    }
    if (window.pageLevelDetectorV17 && typeof window.pageLevelDetectorV17.detect === 'function') {
      try { return window.pageLevelDetectorV17.detect(); } catch(e) {}
    }
    if (window.pageLevelDetector && typeof window.pageLevelDetector.detect === 'function') {
      try { return window.pageLevelDetector.detect(); } catch(e) {}
    }
    
    const bodyPageLevel = document.body.getAttribute('data-page-level') || 
                          document.body.getAttribute('data-schema-page-level');
    if (bodyPageLevel) return bodyPageLevel;
    
    return detectPageLevelFallback();
  }

  function detectPageLevelFallback() {
    const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
    const title = document.title.toLowerCase();
    const url = location.href.toLowerCase();
    
    const variantPatterns = ["spesifikasi", "ukuran", "dimensi", "varian", "polosan", "motif", "custom", "tinggi", "rendah", "metode", "teknik"];
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

  function waitForPLD() {
    return new Promise((resolve) => {
      if (window.pageLevelDetectorv22 || window.pageLevelDetectorv20 || 
          window.pageLevelDetectorv19 || window.pageLevelDetectorV18 || 
          window.pageLevelDetectorV17 || window.pageLevelDetector) {
        resolve(true);
        return;
      }
      
      const onReady = () => resolve(true);
      window.addEventListener("pageLevelDetectorv22Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorv20Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorv19Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorReady", onReady, { once: true });
      
      setTimeout(() => {
        if (window.pageLevelDetectorv22 || window.pageLevelDetectorv20 || 
            window.pageLevelDetectorv19 || window.pageLevelDetectorV18 || 
            window.pageLevelDetectorV17 || window.pageLevelDetector) {
          resolve(true);
        } else {
          resolve(false);
        }
      }, CONFIG.PLD_TIMEOUT);
    });
  }

  // ============================================================
  // 🔥🔥🔥 FUNGSI LAINNYA (PRODUCT SCHEMA) 🔥🔥🔥
  // ============================================================
  function shouldSkipProductSchema(pageLevel) {
    const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
    const title = document.title.toLowerCase();
    const url = location.href.toLowerCase();
    const combined = h1 + " " + title + " " + url;
    
    const isProduct = /(beton|readymix|precast|paving|panel|box|u-ditch|kanstin|gorong|material|bahan|besi|baja|pipa|atap|genteng|keramik|marmer|granit|kayu|pintu|jendela|kusen|pagar\s*panel|paving\s*block|box\s*culvert|u\s*ditch|gorong\s*gorong)/i.test(combined);
    if (isProduct) return false;
    if (pageLevel === 'variant' || pageLevel === 'sub-variant') return false;
    
    if (['money-master', 'money-page', 'money-child'].includes(pageLevel)) {
      const isProductMoney = /(beton|readymix|precast|paving|panel|box|u-ditch|kanstin|gorong|material|bahan|besi|baja|pipa|atap|genteng|keramik|marmer|granit|kayu|pintu|jendela|kusen|pagar\s*panel|paving\s*block|box\s*culvert|u\s*ditch|gorong\s*gorong)/i.test(combined);
      if (isProductMoney) return false;
      return false;
    }
    
    const pillarPatterns = ["panduan lengkap", "pengertian", "definisi", "apa itu", "overview", "komprehensif", "cara memilih", "tips memilih", "langkah memilih", "kriteria memilih"];
    for (let pattern of pillarPatterns) {
      if (h1.includes(pattern) || title.includes(pattern) || url.includes(pattern)) return true;
    }
    
    return false;
  }

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
      "besi beton": "Besi Beton",
      "baja ringan": "Baja Ringan"
    };
    
    let productName = urlMapping[pathKey.toLowerCase()];
    if (!productName && pathKey && pathKey.length > 0 && pathKey.length < 80) {
      productName = pathKey.replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return productName || "Produk Konstruksi";
  }

  function detectProductCategory(pageLevel) {
    const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
    const title = document.title.toLowerCase();
    const url = location.href.toLowerCase();
    const combined = h1 + " " + title + " " + url;
    
    if (/(beton|readymix|ready mix|cor|concrete)/i.test(combined)) return "ConcreteProduct";
    if (/(paving|block|conblock|grassblock|paving\s*block)/i.test(combined)) return "PavingProduct";
    if (/(pagar|panel|booth|gorong|box|culvert|u-ditch|kanstin|kansteen|gorong\s*gorong)/i.test(combined)) return "PrecastProduct";
    if (/(besi|baja|pipa|atap|genteng|baja\s*ringan|besi\s*beton)/i.test(combined)) return "SteelProduct";
    if (/(keramik|marmer|granit|kayu|pintu|jendela|kusen)/i.test(combined)) return "BuildingMaterial";
    if (pageLevel === 'variant' || pageLevel === 'sub-variant') return "VariantProduct";
    return "BuildingMaterial";
  }

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

  const seenItems = new Set();
  const offers = [];

  function addOffer(name, price) {
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
            if (productCell.toLowerCase().includes('produk') || productCell.toLowerCase().includes('jenis') || priceCell.toLowerCase().includes('harga')) continue;
            const price = extractPrice(priceCell);
            if (price && productCell && productCell.length > 0 && productCell.length < 150) {
              const isEstimasi = productCell.toLowerCase().includes('estimasi') || priceCell.toLowerCase().includes('estimasi');
              if (!isEstimasi) { addOffer(productCell, price); found = true; }
            }
          }
        }
      }
      if (found) break;
    }
    return found;
  }

  // ============================================================
  // 🔥🔥🔥 PARSE VARIAN OFFERS (DIPERBAIKI v4.69) 🔥🔥🔥
  // ============================================================
  function parseVariantOffers() {
    const content = document.querySelector(".post-body.entry-content, .post-body, article, main");
    if (!content) return false;
    const text = content.innerText;
    
    // ✅ SEMUA PATTERN PAKAI FLAG 'g' (GLOBAL)
    // ✅ TAMBAHKAN TRY-CATCH UNTUK FALLBACK
    const variantPatterns = [
      /(tinggi|ukuran|dimensi)\s*([\d.]+)\s*(meter|m|cm)\s*(?:Rp\s*([\d.,]+))/gi,
      /(panel|pagar)\s*(polosan|motif|custom)\s*(?:Rp\s*([\d.,]+))/gi,
      /(tipe|varian)\s*([a-zA-Z0-9\s]+?)\s*(?:Rp\s*([\d.,]+))/gi,
      /(harga|biaya)\s*([a-zA-Z0-9\s]+?)\s*(?:Rp\s*([\d.,]+))/gi,
      /Rp\s*([\d.,]+)\s*(?:per\s*(meter|lembar|buah|unit))/gi
    ];
    
    let found = false;
    for (const pattern of variantPatterns) {
      try {
        // matchAll() membutuhkan regex dengan flag 'g'
        const matches = text.matchAll(pattern);
        for (const match of matches) {
          const name = match[0].split("Rp")[0]?.trim() || match[0].substring(0, 50);
          const price = extractPrice(match[0]);
          if (price && price > CONFIG.MIN_PRICE && price < CONFIG.MAX_PRICE) {
            addOffer(name, price);
            found = true;
          }
        }
      } catch(e) {
        // Fallback: jika matchAll gagal, gunakan match biasa
        log(`Fallback match untuk pattern`, "WARN");
        const matches = text.match(pattern);
        if (matches) {
          for (const match of matches) {
            const name = match.split("Rp")[0]?.trim() || match.substring(0, 50);
            const price = extractPrice(match);
            if (price && price > CONFIG.MIN_PRICE && price < CONFIG.MAX_PRICE) {
              addOffer(name, price);
              found = true;
            }
          }
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
        if (productText.length > 0 && productText.length < 150) tempOffers.push({ name: productText, price: price });
      }
    }
    const seen = new Set();
    for (const offer of tempOffers) {
      const key = offer.name + "|" + offer.price;
      if (!seen.has(key) && offers.length < 5) { seen.add(key); addOffer(offer.name, offer.price); }
    }
  }

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
      if (links.length > 0) { breadcrumbLinks = Array.from(links); break; }
    }

    if (breadcrumbLinks.length === 0) {
      const nav = document.querySelector('nav');
      if (nav) {
        const links = nav.querySelectorAll('a');
        if (links.length > 1) breadcrumbLinks = Array.from(links);
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
        return { parentUrl: parentLink.href, parentName: parentLink.innerText?.trim() || 'Parent Page' };
      }
    }

    return { parentUrl: location.origin, parentName: 'Home' };
  }

  // ============================================================
  // 🚀 MAIN FUNCTION
  // ============================================================
  async function init() {
    log("═══════════════════════════════════════════════════", "INFO");
    log("AutoSchema Hybrid v4.69 — DETEKSI FOKUS KONTEN", "INFO");
    log("═══════════════════════════════════════════════════", "INFO");
    
    await waitForPLD();
    
    const pageLevel = getPageLevelFromPLD();
    log(`Page Level: ${pageLevel}`, "SUCCESS");

    // STEP 1: AUTO UPDATE TAHUN DI KONTEN (H1)
    log("📅 UPDATE TAHUN DI KONTEN:", "YEAR");
    updateH1Year(pageLevel);

    // STEP 2: CEK GAMBAR & FIX GAMBAR (TETAP FIGURE)
    let imageUrl = LOGO_IMAGE;
    const isEligible = isImageEligible(pageLevel);
    
    if (isEligible) {
      log(`✅ Halaman LAYAK mendapat gambar, memproses...`, "IMAGE");
      try {
        const fixedFigure = fixImagesToFormat1();
        if (fixedFigure) {
          const img = fixedFigure.querySelector('img');
          if (img) imageUrl = img.src || LOGO_IMAGE;
        }
      } catch(e) {
        log(`Error processing images: ${e.message}`, "ERROR");
        imageUrl = LOGO_IMAGE;
      }
    } else {
      log(`⏭️ Halaman TIDAK LAYAK mendapat gambar`, "SKIP");
      const existingImage = document.querySelector('img:not([src*="logo"]):not([src*="icon"]):not([src*="avatar"])');
      if (existingImage) {
        imageUrl = existingImage.src || LOGO_IMAGE;
      }
    }

    // STEP 3: PRODUCT SCHEMA
    if (shouldSkipProductSchema(pageLevel)) {
      log("Product schema SKIPPED untuk halaman ini", "SKIP");
      return;
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
      const hasVariantOffers = parseVariantOffers();
      if (!hasVariantOffers || offers.length === 0) parseListOffers();
    }
    
    if (offers.length === 0) {
      log("Tidak ada harga ditemukan", "WARN");
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
      if (variantSpec) product.variant = variantSpec;
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
    }
    
    existingScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": graph
    }, null, 2);
    
    // EXECUTION SUMMARY
    const focus = pageLevel === 'money-page' ? detectContentFocus() : 'N/A';
    
    log("═══════════════════════════════════════════════════", "INFO");
    log("EXECUTION SUMMARY:", "INFO");
    log(`  Page Level      : ${pageLevel}`, "SUCCESS");
    log(`  Content Focus   : ${focus}`, "FOCUS");
    log(`  Product Name    : ${productName}`, "SUCCESS");
    log(`  Offers Count    : ${offers.length}`, "SUCCESS");
    log(`  Image Eligible  : ${isEligible ? '✅' : '❌'}`, "IMAGE");
    log(`  Image Source    : ${isEligible ? '✅ (Canvas + FIGURE)' : '⚠️ (skip)'}`, "IMAGE");
    log(`  Auto Year H1    : ${needYear(pageLevel) ? '✅' : '❌'}`, "YEAR");
    log(`  Text from URL   : ✅`, "IMAGE");
    log(`  Figure Structure: ✅ TETAP DIJAGA`, "IMAGE");
    log(`  Responsive      : ✅`, "IMAGE");
    log(`  VARIANT WAJIB   : ✅ (tanpa syarat wordCount)`, "SUCCESS");
    log(`  SUB-VARIANT WAJIB: ✅ (tanpa syarat wordCount)`, "SUCCESS");
    log(`  MONEY_PAGE INFO : ✅ TANPA tahun (otomatis)`, "FOCUS");
    log(`  MONEY_PAGE HARGA: ✅ PAKAI tahun (otomatis)`, "FOCUS");
    log("═══════════════════════════════════════════════════", "INFO");
    log("AutoSchema Hybrid v4.69 SELESAI", "SUCCESS");
  }
  
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(init, CONFIG.DELAY_MS);
    });
  } else {
    setTimeout(init, CONFIG.DELAY_MS);
  }
  
})();
