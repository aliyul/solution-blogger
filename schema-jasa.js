/* ⚡ AUTO SCHEMA UNIVERSAL v7.15 — AUTO GAMBAR + AUTO UPDATE TAHUN */
// ============================================================
// 🔥🔥🔥 BLOKIR SEMUA EXTERNAL REQUEST 🔥🔥🔥
// ============================================================
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  if (typeof url === 'string' && (url.includes('raw.githack.com') || url.includes('github.com') || url.includes('gist.github.com'))) {
    console.warn('[Schema v7.15] 🚫 Blocked external fetch (CORB prevention):', url);
    return Promise.reject(new Error('Blocked by CORB prevention'));
  }
  return originalFetch.apply(this, args);
};

const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  if (typeof url === 'string' && (url.includes('raw.githack.com') || url.includes('github.com') || url.includes('gist.github.com'))) {
    console.warn('[Schema v7.15] 🚫 Blocked external XHR (CORB prevention):', url);
    throw new Error('Blocked by CORB prevention');
  }
  return originalXHROpen.call(this, method, url, ...rest);
};

// ============================================================
// 🔥🔥🔥 KONFIGURASI GAMBAR 🔥🔥🔥
// ============================================================
const IMAGE_CONFIG = {
  FALLBACK_IMAGE: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiWWAP6ezcmzgbGtHmmJqBjYkbsdQBrwCeC9pl9ocjL-VSQYftirdvXAF1T-eg_QMSqu1WiFidDc9fnChi0yaOqi0Dd6EVMy4ZX3P7vccY4XJMu-7k2TGVd5TS1wIG5jgIm_6beYVb2zuNQGS7eBuODJqd20c4ckvd0-HaEqGf4W-B_750I91wi9IhqqnI/s320/No_Image_Available.jpg",
  LOGO_IMAGE: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png"
};

// ============================================================
// 🔥🔥🔥 AUTO GENERATE GAMBAR DENGAN TEKS (CANVAS) 🔥🔥🔥
// ============================================================
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

    // Background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, colors.bg);
    gradient.addColorStop(0.5, colors.bg);
    gradient.addColorStop(1, lightenColor(colors.bg, 25));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 3;
    const bPad = 15;
    ctx.strokeRect(bPad, bPad, width - (bPad * 2), height - (bPad * 2));

    // Logo
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('🏗️ Beton Jaya Readymix', width / 2, padding - 2);

    // Garis pemisah
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, 68);
    ctx.lineTo(width - padding, 68);
    ctx.stroke();

    // Teks utama
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let fontSize = 42;
    const textLength = fullText.length;
    if (textLength > 30) fontSize = 36;
    if (textLength > 40) fontSize = 32;
    if (textLength > 50) fontSize = 28;
    if (textLength > 60) fontSize = 24;

    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;

    // Wrap teks
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

    const centerY = height / 2 + 5;

    if (lines.length === 1) {
        ctx.font = `bold ${fontSize + 6}px Arial, sans-serif`;
        ctx.fillStyle = colors.text;
        ctx.fillText(lines[0], width / 2, centerY);
    } else if (lines.length === 2) {
        const lineHeight = fontSize + 12;
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.fillStyle = colors.text;
        ctx.fillText(lines[0], width / 2, centerY - (lineHeight / 2));
        ctx.fillText(lines[1], width / 2, centerY + (lineHeight / 2));
    } else {
        const lineHeight = fontSize + 10;
        const startY = centerY - ((lines.length - 1) * lineHeight / 2);
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.fillStyle = colors.text;
        lines.forEach((line, i) => {
            ctx.fillText(line, width / 2, startY + (i * lineHeight));
        });
    }

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Watermark
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('© Beton Jaya Readymix', width / 2, height - padding + 5);

    return canvas.toDataURL('image/png');
}

// ============================================================
// 🔥🔥🔥 FUNGSI PENDUKUNG GAMBAR 🔥🔥🔥
// ============================================================
function getColorConfig(level) {
    const colors = {
        'PILLAR': { bg: '#0a2a44', text: '#ffffff', accent: '#25d366' },
        'SP2': { bg: '#1a237e', text: '#ffffff', accent: '#25d366' },
        'SP1': { bg: '#004d40', text: '#ffffff', accent: '#25d366' },
        'MONEY_MASTER': { bg: '#0a2a44', text: '#ffffff', accent: '#ffd700' },
        'MONEY_PAGE_JASA': { bg: '#1a5a8c', text: '#ffffff', accent: '#ffd700' },
        'MONEY_PAGE_HARGA': { bg: '#1b5e20', text: '#ffffff', accent: '#ffd700' },
        'MONEY_CHILD': { bg: '#bf360c', text: '#ffffff', accent: '#ffd700' },
        'VARIANT': { bg: '#4a148c', text: '#ffffff', accent: '#25d366' },
        'SUB_VARIANT': { bg: '#4e342e', text: '#ffffff', accent: '#25d366' }
    };
    return colors[level] || colors['PILLAR'];
}

function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

function needYear(level) {
    const moneyLevels = ['MONEY_MASTER', 'MONEY_PAGE_JASA', 'MONEY_PAGE_HARGA', 'MONEY_CHILD'];
    return moneyLevels.includes(level);
}

function getCurrentYear() {
    return new Date().getFullYear();
}

function extractYear(text) {
    const match = text.match(/\b(20[2-9][0-9])\b/);
    return match ? parseInt(match[1]) : null;
}

function getPageNameForImage(level) {
    let title = document.querySelector('h1')?.innerText || document.title || window.location.pathname;
    title = title.replace(/\b(20[2-9][0-9])\b/g, '').trim();
    title = title.split(/\s*[–—\-|]\s*/)[0].trim();
    if (level === 'PILLAR' || level === 'SP1' || level === 'SP2') {
        title = title.replace(/^(Harga|Jasa)\s*/i, '').trim();
    }
    if (title.length > 55) title = title.substring(0, 52) + '...';
    return title || 'Halaman Utama';
}

// ============================================================
// 🔥🔥🔥 AUTO FIX GAMBAR (FORMAT 1) — REVISI: DI DALAM ARTICLE 🔥🔥🔥
// ============================================================
function fixImagesToFormat1() {
  console.log('[Schema v7.15 📸] Checking images...');

  const h1Element = document.querySelector('h1');
  const h1Text = h1Element ? h1Element.textContent.trim() : document.title;
  const pageLevel = getPageLevel();
  const currentYear = getCurrentYear();
  const needYearFlag = needYear(pageLevel);
  const pageName = getPageNameForImage(pageLevel);
  const displayName = needYearFlag ? pageName + ' ' + currentYear : pageName;

  // ===== CARI TEMPAT TARUH GAMBAR =====
  function getImageInsertionPoint() {
    let article = document.querySelector('article');
    if (!article) {
      const candidates = ['.post-body', 'main', '.content', '.entry-content', '.post-content', '.article-content', '.blog-post'];
      for (let selector of candidates) {
        const el = document.querySelector(selector);
        if (el) { article = el; break; }
      }
    }
    if (!article && h1Element) {
      article = h1Element.closest('section, div, main');
    }
    if (!article) {
      article = document.body;
    }

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

  // ===== CARI GAMBAR YANG SUDAH ADA =====
  let targetImage = null;
  let targetFigure = null;

  if (h1Element) {
    const article = h1Element.closest('article, .post-body, main, section, div');
    if (article) {
      const siblings = article.children;
      let foundH1 = false;
      for (let i = 0; i < siblings.length; i++) {
        if (siblings[i] === h1Element) { foundH1 = true; continue; }
        if (foundH1) {
          const img = siblings[i].querySelector('img');
          if (img) { targetImage = img; targetFigure = siblings[i].tagName === 'FIGURE' ? siblings[i] : siblings[i].closest('figure'); break; }
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
      if (img) { targetImage = img; targetFigure = img.closest('figure'); break; }
    }
  }

  // ===== GENERATE GAMBAR OTOMATIS =====
  const autoImageDataUrl = createImageWithText(pageName, pageLevel, currentYear);
  const captionText = '📊 ' + displayName;

  // ===== JIKA TIDAK ADA GAMBAR, TAMBAHKAN FALLBACK =====
  if (!targetImage) {
    console.log('[Schema v7.15 📸] No image found, inserting auto-generated image...');
    
    const insertPoint = getImageInsertionPoint();
    const figure = document.createElement('figure');
    figure.style.padding = '1em 0px';
    figure.style.margin = '20px 0';
    figure.style.textAlign = 'center';
    figure.style.background = '#f8fafc';
    figure.style.borderRadius = '12px';

    const img = document.createElement('img');
    img.src = autoImageDataUrl;
    img.alt = displayName;
    img.title = displayName;
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
    img.style.maxWidth = '800px';
    img.style.borderRadius = '8px';
    img.style.display = 'block';
    img.style.margin = '0 auto';
    img.style.height = 'auto';
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

    if (insertPoint.referenceNode && insertPoint.position === 'after') {
      insertPoint.container.insertBefore(figure, insertPoint.referenceNode.nextSibling);
    } else {
      insertPoint.container.insertBefore(figure, insertPoint.container.firstChild);
    }

    console.log('[Schema v7.15 📸] ✅ Auto-generated image inserted inside article');
    return;
  }

  // ===== PERBAIKI GAMBAR YANG ADA =====
  console.log('[Schema v7.15 📸] Fixing existing image with auto-generated...');

  const img = targetImage;
  let figure = img.closest('figure');

  // Ganti src dengan gambar auto-generated
  img.src = autoImageDataUrl;
  img.alt = displayName;
  img.title = displayName;
  if (!img.hasAttribute('loading') || img.getAttribute('loading') !== 'lazy') {
    img.setAttribute('loading', 'lazy');
  }
  if (!img.hasAttribute('decoding') || img.getAttribute('decoding') !== 'async') {
    img.setAttribute('decoding', 'async');
  }
  img.style.maxWidth = '800px';
  img.style.borderRadius = '8px';
  img.style.display = 'block';
  img.style.margin = '0 auto';
  img.style.height = 'auto';
  img.setAttribute('data-auto-generated', 'true');
  img.setAttribute('data-page-level', pageLevel);
  img.setAttribute('data-year', currentYear);

  if (figure && figure.tagName === 'FIGURE') {
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
      figcaption.textContent = captionText;
      figcaption.style.color = '#555';
      figcaption.style.fontSize = '14px';
      figcaption.style.marginTop = '10px';
      figcaption.style.padding = '0 20px';
      figcaption.style.textAlign = 'center';
    }
  } else {
    const newFigure = document.createElement('figure');
    newFigure.style.padding = '1em 0px';
    newFigure.style.margin = '20px 0';
    newFigure.style.textAlign = 'center';
    newFigure.style.background = '#f8fafc';
    newFigure.style.borderRadius = '12px';
    
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
  }

  console.log('[Schema v7.15 📸] ✅ Image replaced with auto-generated image');
}

// ============================================================
// 🔥🔥🔥 AUTO UPDATE TAHUN DI KONTEN (H1) 🔥🔥🔥
// ============================================================
function updateH1Year() {
    const level = getPageLevel();
    if (!needYear(level)) {
        console.log('[Schema v7.15] ⏭️ Level ini TIDAK butuh tahun di H1');
        return false;
    }

    const currentYear = getCurrentYear();
    const h1 = document.querySelector('h1');
    if (!h1) {
        console.log('[Schema v7.15] ⚠️ Tidak ada H1 ditemukan');
        return false;
    }

    const originalText = h1.innerText;
    const detectedYear = extractYear(originalText);

    if (!detectedYear) {
        const newText = originalText + ' ' + currentYear;
        h1.innerText = newText;
        console.log('[Schema v7.15] ✅ H1: Tahun ditambahkan → "' + newText + '"');
        return true;
    }

    if (detectedYear < currentYear) {
        const newText = originalText.replace(/\b(20[2-9][0-9])\b/, currentYear);
        h1.innerText = newText;
        console.log('[Schema v7.15] ✅ H1: Tahun diupdate ' + detectedYear + ' → ' + currentYear);
        return true;
    }

    console.log('[Schema v7.15] ✅ H1: Tahun sudah sesuai (' + detectedYear + ')');
    return true;
}

// ============================================================
// 🔥🔥🔥 AUTO UPDATE TAHUN DI GAMBAR 🔥🔥🔥
// ============================================================
function updateImageYear() {
    const level = getPageLevel();
    if (!needYear(level)) {
        console.log('[Schema v7.15] ⏭️ Level ini TIDAK butuh tahun di gambar');
        return false;
    }

    const currentYear = getCurrentYear();
    const images = document.querySelectorAll('img[data-auto-generated="true"]');
    let updatedCount = 0;

    images.forEach(function(img) {
        const alt = img.getAttribute('alt') || '';
        const title = img.getAttribute('title') || '';
        const detectedYear = extractYear(alt) || extractYear(title);

        if (!detectedYear) {
            const newAlt = alt + ' ' + currentYear;
            const newTitle = title + ' ' + currentYear;
            img.setAttribute('alt', newAlt);
            img.setAttribute('title', newTitle);
            console.log('[Schema v7.15] ✅ Gambar: Tahun ditambahkan → "' + newAlt + '"');
            updatedCount++;
            return;
        }

        if (detectedYear < currentYear) {
            const newAlt = alt.replace(/\b(20[2-9][0-9])\b/, currentYear);
            const newTitle = title.replace(/\b(20[2-9][0-9])\b/, currentYear);
            img.setAttribute('alt', newAlt);
            img.setAttribute('title', newTitle);
            console.log('[Schema v7.15] ✅ Gambar: Tahun diupdate ' + detectedYear + ' → ' + currentYear);
            updatedCount++;
        }
    });

    if (updatedCount === 0) {
        console.log('[Schema v7.15] ✅ Gambar: Tidak ada yang perlu diupdate');
    }
    return updatedCount > 0;
}

// ============================================================
// 🔥🔥🔥 AUTO UPDATE GAMBAR (RE-GENERATE) 🔥🔥🔥
// ============================================================
function regenerateImageWithNewYear() {
    const level = getPageLevel();
    if (!needYear(level)) {
        console.log('[Schema v7.15] ⏭️ Level ini TIDAK butuh re-generate gambar');
        return false;
    }

    const currentYear = getCurrentYear();
    const pageName = getPageNameForImage(level);
    const images = document.querySelectorAll('img[data-auto-generated="true"]');
    let regenCount = 0;

    images.forEach(function(img) {
        const alt = img.getAttribute('alt') || '';
        const detectedYear = extractYear(alt);

        if (!detectedYear || detectedYear < currentYear) {
            const newImageData = createImageWithText(pageName, level, currentYear);
            img.setAttribute('src', newImageData);
            img.setAttribute('alt', pageName + ' ' + currentYear);
            img.setAttribute('title', pageName + ' ' + currentYear);
            img.setAttribute('data-year', currentYear);
            
            // Update figcaption jika ada
            const figure = img.closest('figure');
            if (figure) {
                const figcaption = figure.querySelector('figcaption');
                if (figcaption) {
                    figcaption.textContent = '📊 ' + pageName + ' ' + currentYear;
                }
            }
            
            console.log('[Schema v7.15] ✅ Gambar: Re-generate dengan tahun ' + currentYear);
            regenCount++;
        }
    });

    if (regenCount === 0) {
        console.log('[Schema v7.15] ✅ Gambar: Tidak ada yang perlu di-regen');
    }
    return regenCount > 0;
}

// ============================================================
// 🔥🔥🔥 PAGE LEVEL DETECTOR (SEDERHANA) 🔥🔥🔥
// ============================================================
function getPageLevel() {
    const url = window.location.pathname;
    const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
    const title = document.title.toLowerCase();

    const variantPatterns = ["spesifikasi", "ukuran", "dimensi", "varian", "polosan", "motif", "custom"];
    for (let pattern of variantPatterns) {
        if (h1.includes(pattern) || title.includes(pattern) || url.includes(pattern)) {
            return "VARIANT";
        }
    }

    const locations = ["jakarta", "bekasi", "bogor", "depok", "tangerang", "karawang", "surabaya", "bandung"];
    for (let loc of locations) {
        if (h1.includes(loc) || title.includes(loc) || url.includes(loc)) return "MONEY_CHILD";
    }

    if (/\b(harga|biaya|tarif)\b/i.test(h1 + title)) return "MONEY_PAGE_HARGA";
    if (/\b(jasa|sewa|borongan)\b/i.test(h1 + title) && !/\b(panduan|tips|cara)\b/i.test(h1 + title)) return "MONEY_MASTER";
    if (/\b(daftar|jenis|kategori)\b/i.test(h1 + title)) return "SP2";
    if (/\b(perbandingan|vs|versus)\b/i.test(h1 + title)) return "SP1";

    return "PILLAR";
}

// ============================================================
// 🔥🔥🔥 DETEKSI HALAMAN LAYAK GAMBAR 🔥🔥🔥
// ============================================================
function isImageEligible(pageLevel) {
    console.log('[Schema v7.15 📸] Checking image eligibility for page level:', pageLevel);

    if (pageLevel === 'PILLAR') {
        const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
        const title = document.title.toLowerCase();
        const combined = h1 + " " + title;
        
        const pillarEdukasi = ["panduan", "tips", "cara", "apa itu", "pengertian", "definisi", "overview", "komprehensif", "langkah", "tutorial", "pedoman", "petunjuk", "kenali", "mengenal", "memahami", "belajar"];
        for (let keyword of pillarEdukasi) {
            if (combined.includes(keyword)) {
                console.log(`[Schema v7.15] ⏭️ Skip gambar: Pillar edukasi murni (keyword: "${keyword}")`);
                return false;
            }
        }
        return true;
    }

    if (pageLevel === 'SP1' || pageLevel === 'SP2' || pageLevel === 'VARIANT' || pageLevel === 'SUB_VARIANT') {
        console.log(`[Schema v7.15] ✅ Halaman LAYAK mendapat gambar (level: ${pageLevel})`);
        return true;
    }

    const content = document.querySelector(".post-body, article, main")?.innerText || "";
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 300) {
        console.log(`[Schema v7.15] ⏭️ Skip gambar: Konten terlalu pendek (${wordCount} kata < 300)`);
        return false;
    }

    const moneyLevels = ['MONEY_MASTER', 'MONEY_PAGE_JASA', 'MONEY_PAGE_HARGA', 'MONEY_CHILD'];
    if (moneyLevels.includes(pageLevel)) {
        console.log(`[Schema v7.15] ✅ Halaman LAYAK mendapat gambar (level: ${pageLevel})`);
        return true;
    }

    const hasImage = document.querySelector('img:not([src*="logo"]):not([src*="icon"]):not([src*="avatar"])');
    if (hasImage) {
        console.log(`[Schema v7.15] ✅ Halaman sudah memiliki gambar, tetap layak`);
        return true;
    }

    console.log(`[Schema v7.15] ⏭️ Skip gambar: Halaman tidak masuk kriteria layak`);
    return false;
}

// ============================================================
// 🔥🔥🔥 FUNGSI LAINNYA (DARI SCHEMA ORIGINAL) 🔥🔥🔥
// ============================================================
function hasPriceOnPage() {
    const text = document.body.innerText;
    const pricePatterns = [
        /Rp\s*[\d.,]+/, /Rp[\d.,]+/, /harga\s*Rp/i, /biaya\s*Rp/i,
        /mulai\s*Rp/i, /Rp\s*[\d.,]+\s*-\s*Rp\s*[\d.,]+/
    ];
    return pricePatterns.some(pattern => pattern.test(text));
}

function getParentFromBreadcrumb(currentUrl) {
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

function detectKnowsAbout() {
    const knowsAbout = [];
    const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
    const title = document.title.toLowerCase();
    const url = location.href.toLowerCase();
    const fullText = document.body.innerText.toLowerCase() + " " + h1 + " " + title + " " + url;

    document.querySelectorAll('.breadcrumbs a, .breadcrumb a, .nav-trail a').forEach(link => {
        const name = link.innerText?.trim();
        if (name && name.length > 2 && name.length < 50) {
            const skipLabels = ['home', 'beranda', 'blog', 'homepage'];
            if (!skipLabels.includes(name.toLowerCase())) knowsAbout.push(name);
        }
    });

    const result = [...new Set(knowsAbout)].slice(0, 10);
    if (result.length === 0) return ['Jasa Konstruksi', 'Beton Precast'];
    return result;
}

function extractServiceType(title) {
    let serviceType = title
        .replace(/^(harga|biaya|tarif|estimasi)\s*/i, '')
        .replace(/\s*2026|\s*2025|\s*2024/g, '')
        .replace(/\s*terbaru|\s*update|\s*terkini/g, '')
        .replace(/[-,|:].*$/, '')
        .trim();
    if (serviceType.length > 50) serviceType = serviceType.substring(0, 50);
    if (/spesifikasi|ukuran|dimensi|mutu|grade|tipe|model|varian/i.test(title)) {
        if (!/^spesifikasi/i.test(serviceType) && !/^varian/i.test(serviceType) && !/^ukuran/i.test(serviceType)) {
            serviceType = 'Spesifikasi ' + serviceType;
        }
    }
    if (!/^(jasa|layanan|service|sewa|borongan|spesifikasi|varian|ukuran|mutu|rental)/i.test(serviceType)) {
        serviceType = 'Jasa ' + serviceType;
    }
    return serviceType;
}

function isServicePage(pageLevel) {
    const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
    const title = document.title.toLowerCase();
    const url = location.href.toLowerCase();
    const combined = h1 + " " + title + " " + url;

    const isProductPage = /(jual|beli|order|pesan|pemesanan|pembelian|produk|material|bahan|spesifikasi|ukuran|dimensi|mutu|grade|tipe|model|varian|polosan|motif|custom)\s+(beton|readymix|precast|paving|panel|box|u-ditch|kansteen|gorong|material|bahan|besi|baja|pipa|atap|genteng|keramik|marmer|granit|kayu|pintu|jendela|kusen|paving\s*block|pagar\s*panel|box\s*culvert|u\s*ditch|kanstin|gorong\s*gorong)/i.test(h1 + title);
    if (isProductPage) return false;

    const urlJasaPatterns = [/\/jasa-/i, /\/jasa\//i, /\/p\/jasa-/i, /\/layanan-/i, /\/service-/i, /\/borongan-/i, /\/kontraktor-/i, /\/sewa-/i, /\/rental-/i, /\/p\/sewa-/i];
    for (let pattern of urlJasaPatterns) {
        if (pattern.test(url)) {
            const isProductUrl = /\/p\/(beton|readymix|precast|paving|panel|box|u-ditch|kansteen|gorong|material|jual|beli|order|pesan|produk|bahan|spesifikasi|ukuran|dimensi|mutu|grade|tipe|model|varian|polosan|motif|custom)/i.test(url);
            if (!isProductUrl) return true;
        }
    }

    const strongServiceKeywords = ['jasa', 'layanan', 'service', 'borongan', 'kontraktor', 'tukang', 'renovasi', 'bongkar', 'pemasangan', 'instalasi', 'pengerjaan', 'perbaikan', 'pembangunan', 'proyek', 'bore pile', 'pondasi', 'tiang pancang', 'sumur bor', 'coring', 'pasang', 'bangun', 'perawatan', 'sewa', 'rental', 'sewa alat', 'rental alat'];
    for (let keyword of strongServiceKeywords) {
        if (combined.includes(keyword)) {
            const productExceptions = /(beton|readymix|precast|paving|panel|box culvert|u-ditch|kansteen|gorong|material|besi|baja)\s+(harga|biaya|spesifikasi|ukuran)/i.test(combined);
            if (!productExceptions) return true;
        }
    }

    return false;
}

function extractOffersFromTable() {
    const offers = [];
    const seenItems = new Set();
    const tables = document.querySelectorAll('table');

    tables.forEach(table => {
        const rows = table.querySelectorAll('tr');
        rows.forEach((row) => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                let name = '';
                let price = null;
                cells.forEach(cell => {
                    const text = cell.innerText.trim();
                    const priceMatch = text.match(/Rp\s*([\d.,]+)/);
                    if (priceMatch) {
                        const priceValue = parseInt(priceMatch[1].replace(/[^\d]/g, ''));
                        if (priceValue > 10000 && priceValue < 1000000000) price = priceValue;
                    }
                    if (!priceMatch && text.length > 2 && text.length < 100) {
                        const priceLabels = ['harga', 'biaya', 'tarif', 'price', 'cost', 'rp', 'rp.'];
                        if (!priceLabels.some(label => text.toLowerCase().includes(label))) {
                            if (!name || text.length > name.length) name = text;
                        }
                    }
                });
                if (!name && cells.length > 0) {
                    const firstCell = cells[0].innerText.trim();
                    if (firstCell.length > 2 && firstCell.length < 100) {
                        const priceLabels = ['harga', 'biaya', 'tarif', 'price', 'cost', 'rp', 'rp.'];
                        if (!priceLabels.some(label => firstCell.toLowerCase().includes(label))) {
                            name = firstCell;
                        }
                    }
                }
                if (name) {
                    name = name.replace(/^(harga|biaya|tarif|paket|jasa|layanan)\s*/i, '').replace(/\s{2,}/g, ' ').trim();
                }
                if (name && price && name.length > 2 && name.length < 80) {
                    const idKey = `${name}|${price}`;
                    if (!seenItems.has(idKey)) {
                        seenItems.add(idKey);
                        offers.push({ name: name, price: price, description: name });
                    }
                }
            }
        });
    });

    if (offers.length === 0) {
        document.querySelectorAll('li, p').forEach(el => {
            const text = el.innerText.trim();
            const priceMatch = text.match(/Rp\s*([\d.,]+)/);
            if (priceMatch) {
                const price = parseInt(priceMatch[1].replace(/[^\d]/g, ''));
                if (price > 10000 && price < 1000000000) {
                    let name = text.split('Rp')[0].trim();
                    name = name.replace(/^(harga|biaya|tarif|paket|jasa|layanan)\s*/i, '').replace(/\s{2,}/g, ' ').trim();
                    if (name && name.length > 2 && name.length < 80) {
                        const idKey = `${name}|${price}`;
                        if (!seenItems.has(idKey)) {
                            seenItems.add(idKey);
                            offers.push({ name: name, price: price, description: name });
                        }
                    }
                }
            }
        });
    }

    return offers;
}

function generateInternalLinks() {
    const containers = ["article", "main", ".post-body"].map(sel => document.querySelector(sel)).filter(Boolean);
    const links = containers.flatMap(c => Array.from(c.querySelectorAll("a")))
        .map(a => a.href)
        .filter(href => href && href.includes(location.hostname) && !href.includes("#") && !href.match(/(\/search|\/feed|\/label)/i));
    const unique = [...new Set(links)].slice(0, 40);
    return unique.map((u, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: u,
        name: decodeURIComponent(u.split("/").pop().replace(".html", "").replace(/-/g, " "))
    }));
}

// ============================================================
// 🚀 MAIN FUNCTION
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(async () => {
        let schemaInjected = false;

        // ============================================================
        // 🔥🔥🔥 STEP 1: AUTO UPDATE TAHUN DI KONTEN 🔥🔥🔥
        // ============================================================
        updateH1Year();

        // ============================================================
        // 🔥🔥🔥 STEP 2: AUTO GENERATE / UPDATE GAMBAR 🔥🔥🔥
        // ============================================================
        const pageLevel = getPageLevel();
        const isEligible = isImageEligible(pageLevel);

        if (isEligible) {
            console.log(`[Schema v7.15] ✅ Halaman LAYAK mendapat gambar, memproses...`);
            try {
                // Fix gambar dengan auto-generated image
                fixImagesToFormat1();
                // Update tahun di gambar (alt/title)
                updateImageYear();
                // Re-generate gambar jika tahun kurang
                regenerateImageWithNewYear();
            } catch(e) {
                console.warn('[Schema v7.15 📸] Error processing images:', e);
            }
        } else {
            console.log(`[Schema v7.15] ⏭️ Halaman TIDAK LAYAK mendapat gambar, skip`);
        }

        // ============================================================
        // 🔥🔥🔥 STEP 3: INJECT SCHEMA 🔥🔥🔥
        // ============================================================
        const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
        const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
        const baseUrl = ogUrl || canonical || location.href;
        const cleanUrl = baseUrl.replace(/[?&]m=1/, "");

        const h1Text = document.querySelector("h1")?.innerText?.trim() || document.title;
        const title = h1Text.replace(/\s{2,}/g, " ").trim().substring(0, 120);

        const LOGO_IMAGE = IMAGE_CONFIG.LOGO_IMAGE;
        const FALLBACK_IMAGE = IMAGE_CONFIG.FALLBACK_IMAGE;

        // Cari gambar yang sudah di-generate
        const existingImage = document.querySelector('img[data-auto-generated="true"]');
        const pageImage = existingImage ? existingImage.src : 
                          document.querySelector('meta[property="og:image"]')?.content || 
                          document.querySelector("article img, main img, .post-body img")?.getAttribute("src") ||
                          (isEligible ? FALLBACK_IMAGE : LOGO_IMAGE);

        const PAGE = {
            url: cleanUrl,
            title,
            description: document.querySelector('meta[name="description"]')?.content?.trim() ||
                document.querySelector("article p, main p, .post-body p")?.innerText?.substring(0, 200) || title,
            image: pageImage,
            business: {
                name: "Beton Jaya Readymix",
                url: "https://www.betonjayareadymix.com",
                telephone: "+6283839000968",
                openingHours: "Mo-Sa 08:00-17:00",
                description: "Beton Jaya Readymix melayani jasa konstruksi, beton cor, precast, dan sewa alat berat di seluruh Indonesia.",
                address: { "@type": "PostalAddress", addressLocality: "Bogor", addressRegion: "Jawa Barat", addressCountry: "ID" },
                sameAs: ["https://www.facebook.com/betonjayareadymix", "https://www.instagram.com/betonjayareadymix"],
                logo: LOGO_IMAGE
            }
        };

        const parentData = getParentFromBreadcrumb(cleanUrl);
        const parentUrls = [{ "@type": "WebPage", "@id": parentData.parentUrl, name: parentData.parentName || "Parent Page" }];

        const areaProv = {
            "DKI Jakarta": "DKI Jakarta",
            "Kabupaten Bogor": "Jawa Barat",
            "Kota Bogor": "Jawa Barat",
            "Kota Depok": "Jawa Barat",
            "Kabupaten Tangerang": "Banten",
            "Kota Tangerang": "Banten",
            "Kota Tangerang Selatan": "Banten",
            "Kabupaten Bekasi": "Jawa Barat",
            "Kota Bekasi": "Jawa Barat",
            "Kabupaten Karawang": "Jawa Barat"
        };
        const defaultAreaServed = Object.keys(areaProv).map(a => ({ "@type": "Place", name: a }));

        const knowsAbout = detectKnowsAbout();
        const tableOffers = [];
        const isMoneyPage = ['MONEY_MASTER', 'MONEY_PAGE_JASA', 'MONEY_PAGE_HARGA', 'MONEY_CHILD'].includes(pageLevel);

        if (isMoneyPage) {
            const extractedOffers = extractOffersFromTable();
            extractedOffers.forEach(offer => {
                tableOffers.push({ name: offer.name, price: offer.price, description: offer.description || offer.name });
            });
        }

        const hasPrice = hasPriceOnPage() || tableOffers.length > 0;

        const graph = [
            {
                "@type": ["LocalBusiness", "GeneralContractor"],
                "@id": PAGE.business.url + "#localbusiness",
                name: PAGE.business.name,
                url: PAGE.business.url,
                telephone: PAGE.business.telephone,
                description: PAGE.business.description,
                address: PAGE.business.address,
                openingHours: PAGE.business.openingHours,
                logo: LOGO_IMAGE,
                sameAs: PAGE.business.sameAs,
                areaServed: defaultAreaServed,
                knowsAbout: knowsAbout
            },
            {
                "@type": "WebPage",
                "@id": cleanUrl + "#webpage",
                url: cleanUrl,
                name: PAGE.title,
                description: PAGE.description,
                image: PAGE.image,
                isPartOf: parentUrls,
                publisher: { "@id": PAGE.business.url + "#localbusiness" },
                dateModified: new Date().toISOString(),
                inLanguage: "id"
            }
        ];

        const isService = isServicePage(pageLevel);

        // ============================================================
        // 🔥🔥🔥 SERVICE SCHEMA 🔥🔥🔥
        // ============================================================
        if (isService) {
            const serviceType = extractServiceType(PAGE.title);
            const serviceNode = {
                "@type": "Service",
                "@id": cleanUrl + "#service",
                name: PAGE.title,
                description: PAGE.description,
                image: PAGE.image,
                serviceType: serviceType,
                areaServed: defaultAreaServed,
                provider: { "@id": PAGE.business.url + "#localbusiness" },
                brand: { "@type": "Brand", name: PAGE.business.name },
                mainEntityOfPage: { "@id": cleanUrl + "#webpage" }
            };

            if (tableOffers.length > 0) {
                const lowPrice = Math.min(...tableOffers.map(o => o.price));
                const highPrice = Math.max(...tableOffers.map(o => o.price));
                serviceNode.offers = {
                    "@type": "AggregateOffer",
                    lowPrice: lowPrice,
                    highPrice: highPrice,
                    offerCount: tableOffers.length,
                    priceCurrency: "IDR"
                };
            }
            graph.push(serviceNode);
            console.log(`[Schema v7.15] ✅ Service schema (jasa/layanan/sewa/rental)`);

            // Product schema hanya jika ada harga
            if (hasPrice && tableOffers.length > 0) {
                const lowPrice = Math.min(...tableOffers.map(o => o.price));
                const highPrice = Math.max(...tableOffers.map(o => o.price));

                const productNode = {
                    "@type": "Product",
                    "@id": cleanUrl + "#product",
                    name: PAGE.title,
                    description: PAGE.description,
                    image: [PAGE.image],
                    brand: { "@type": "Brand", name: PAGE.business.name },
                    category: "ConstructionService",
                    offers: {
                        "@type": "AggregateOffer",
                        lowPrice: lowPrice,
                        highPrice: highPrice,
                        offerCount: tableOffers.length,
                        priceCurrency: "IDR",
                        offers: tableOffers.map(offer => ({
                            "@type": "Offer",
                            "name": offer.name,
                            "url": cleanUrl,
                            "priceCurrency": "IDR",
                            "price": offer.price,
                            "itemCondition": "https://schema.org/NewCondition",
                            "availability": "https://schema.org/InStock",
                            "priceValidUntil": new Date(Date.now() + 180*24*60*60*1000).toISOString().split("T")[0],
                            "seller": { "@id": PAGE.business.url + "#localbusiness" },
                            "description": offer.description || offer.name
                        }))
                    }
                };
                graph.push(productNode);
                console.log(`[Schema v7.15] ✅ Product schema (${tableOffers.length} offers)`);
            } else {
                console.log(`[Schema v7.15] ⏭️ Skip Product schema (tidak ada harga/offers)`);
            }
        } else {
            console.log(`[Schema v7.15] ⏭️ Skip Service schema (bukan jasa)`);
        }

        // ============================================================
        // 🔥🔥🔥 INTERNAL LINKS 🔥🔥🔥
        // ============================================================
        const internalLinks = generateInternalLinks();
        if (internalLinks.length > 0) {
            graph.push({
                "@type": "ItemList",
                "@id": cleanUrl + "#related-links",
                name: "Halaman Terkait",
                itemListOrder: "Ascending",
                numberOfItems: internalLinks.length,
                itemListElement: internalLinks
            });
            console.log(`[Schema v7.15] ✅ ${internalLinks.length} internal links added`);
        }

        // ============================================================
        // 🔥🔥🔥 INJECT SCHEMA 🔥🔥🔥
        // ============================================================
        const schema = { "@context": "https://schema.org", "@graph": graph };

        let el = document.querySelector("#auto-schema-service");
        if (!el) {
            el = document.createElement("script");
            el.id = "auto-schema-service";
            el.type = "application/ld+json";
            document.head.appendChild(el);
        }
        el.textContent = JSON.stringify(schema, null, 2);

        console.log(`[Schema v7.15 ✅] Injected | Page: ${pageLevel} | Offers: ${tableOffers.length} | ` +
            `Service: ${isService ? '✅' : '❌'} | Product: ${(isService && hasPrice && tableOffers.length > 0) ? '✅' : '❌'} | ` +
            `Internal Links: ${internalLinks.length} | KnowsAbout: ${knowsAbout.length} | ` +
            `Image Eligible: ${isEligible ? '✅' : '❌'} | Auto Image: ✅ | Auto Year: ✅ | CORB: ✅ ZERO`
        );

    }, 700);
});
