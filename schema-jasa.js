/* ⚡ AUTO SCHEMA UNIVERSAL v7.20 — V37 COMPLIANT (JASA & SEWA) */
// ============================================================
// 🔥🔥🔥 BLOKIR SEMUA EXTERNAL REQUEST 🔥🔥🔥
// ============================================================
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  if (typeof url === 'string' && (url.includes('raw.githack.com') || url.includes('github.com') || url.includes('gist.github.com'))) {
    console.warn('[Schema v7.20] 🚫 Blocked external fetch (CORB prevention):', url);
    return Promise.reject(new Error('Blocked by CORB prevention'));
  }
  return originalFetch.apply(this, args);
};

const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  if (typeof url === 'string' && (url.includes('raw.githack.com') || url.includes('github.com') || url.includes('gist.github.com'))) {
    console.warn('[Schema v7.20] 🚫 Blocked external XHR (CORB prevention):', url);
    throw new Error('Blocked by CORB prevention');
  }
  return originalXHROpen.call(this, method, url, ...rest);
};

// ============================================================
// 🔥🔥🔥 KONFIGURASI 🔥🔥🔥
// ============================================================
const IMAGE_CONFIG = {
  FALLBACK_IMAGE: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiWWAP6ezcmzgbGtHmmJqBjYkbsdQBrwCeC9pl9ocjL-VSQYftirdvXAF1T-eg_QMSqu1WiFidDc9fnChi0yaOqi0Dd6EVMy4ZX3P7vccY4XJMu-7k2TGVd5TS1wIG5jgIm_6beYVb2zuNQGS7eBuODJqd20c4ckvd0-HaEqGf4W-B_750I91wi9IhqqnI/s320/No_Image_Available.jpg",
  LOGO_IMAGE: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png"
};

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

function needYear(level) {
    const moneyLevels = ['money-master', 'money-page', 'money-child'];
    return moneyLevels.includes(level);
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
    
    console.log('[Schema v7.20] 📝 Clean page name from URL:', cleanName);
    return cleanName;
}

// ============================================================
// 🔥🔥🔥 AUTO GENERATE GAMBAR DARI CANVAS 🔥🔥🔥
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

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding, 72);
    ctx.lineTo(width - padding, 72);
    ctx.stroke();

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
// 🔥🔥🔥 CEK & PERBAIKI GAMBAR 🔥🔥🔥
// ============================================================
function fixImagesToFormat1(pageLevel) {
    console.log('[Schema v7.20 📸] Checking images in content...');

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

        const styleId = 'responsive-image-style-v720';
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
        console.log('[Schema v7.20 📸] Image found in content, fixing for SEO...');

        const img = targetImage;
        const figure = targetFigure || img.closest('figure');

        const currentSrc = img.src || '';
        if (currentSrc.includes('No_Image') || currentSrc.includes('placeholder') || !currentSrc) {
            img.src = autoImageDataUrl;
        } else {
            console.log('[Schema v7.20 📸] Existing image preserved, only updating attributes');
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
            console.log('[Schema v7.20 📸] Wrapping image with FIGURE...');
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

        console.log('[Schema v7.20 📸] ✅ Image fixed with SEO FIGURE');
        return figure;
    }

    console.log('[Schema v7.20 📸] No image found, creating new responsive FIGURE...');

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

    console.log('[Schema v7.20 📸] ✅ New responsive FIGURE created');
    return figure;
}

// ============================================================
// 🔥🔥🔥 AUTO UPDATE TAHUN 🔥🔥🔥
// ============================================================
function updateH1Year(pageLevel) {
    if (!needYear(pageLevel)) {
        console.log('[Schema v7.20] ⏭️ Level ini TIDAK butuh tahun di H1');
        return false;
    }

    const currentYear = getCurrentYear();
    const h1 = document.querySelector('h1');
    if (!h1) {
        console.log('[Schema v7.20] ⚠️ Tidak ada H1 ditemukan');
        return false;
    }

    const originalText = h1.innerText;
    const detectedYear = extractYear(originalText);

    if (!detectedYear) {
        const newText = originalText + ' ' + currentYear;
        h1.innerText = newText;
        console.log('[Schema v7.20] ✅ H1: Tahun ditambahkan → "' + newText + '"');
        return true;
    }

    if (detectedYear < currentYear) {
        const newText = originalText.replace(/\b(20[2-9][0-9])\b/, currentYear);
        h1.innerText = newText;
        console.log('[Schema v7.20] ✅ H1: Tahun diupdate ' + detectedYear + ' → ' + currentYear);
        return true;
    }

    console.log('[Schema v7.20] ✅ H1: Tahun sudah sesuai (' + detectedYear + ')');
    return true;
}

function updateImageYear(pageLevel) {
    if (!needYear(pageLevel)) {
        console.log('[Schema v7.20] ⏭️ Level ini TIDAK butuh tahun di gambar');
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
            console.log('[Schema v7.20] ✅ Gambar: Tahun ditambahkan → "' + newAlt + '"');
            updatedCount++;
            return;
        }

        if (detectedYear < currentYear) {
            const newAlt = alt.replace(/\b(20[2-9][0-9])\b/, currentYear);
            const newTitle = title.replace(/\b(20[2-9][0-9])\b/, currentYear);
            img.setAttribute('alt', newAlt);
            img.setAttribute('title', newTitle);
            console.log('[Schema v7.20] ✅ Gambar: Tahun diupdate ' + detectedYear + ' → ' + currentYear);
            updatedCount++;
        }
    });

    if (updatedCount === 0) {
        console.log('[Schema v7.20] ✅ Gambar: Tidak ada yang perlu diupdate');
    }
    return updatedCount > 0;
}

function regenerateImageWithNewYear(pageLevel) {
    if (!needYear(pageLevel)) {
        console.log('[Schema v7.20] ⏭️ Level ini TIDAK butuh re-generate gambar');
        return false;
    }

    const currentYear = getCurrentYear();
    const pageName = getCleanPageName(pageLevel);
    const images = document.querySelectorAll('img[data-auto-generated="true"]');
    let regenCount = 0;

    images.forEach(function(img) {
        const alt = img.getAttribute('alt') || '';
        const detectedYear = extractYear(alt);

        if (!detectedYear || detectedYear < currentYear) {
            const newImageData = createImageWithText(pageName, pageLevel, currentYear);
            img.setAttribute('src', newImageData);
            img.setAttribute('alt', pageName + ' ' + currentYear);
            img.setAttribute('title', pageName + ' ' + currentYear);
            img.setAttribute('data-year', currentYear);

            const figure = img.closest('figure');
            if (figure) {
                const figcaption = figure.querySelector('figcaption');
                if (figcaption) {
                    figcaption.textContent = '📊 ' + pageName + ' ' + currentYear;
                }
            }

            console.log('[Schema v7.20] ✅ Gambar: Re-generate dengan tahun ' + currentYear);
            regenCount++;
        }
    });

    if (regenCount === 0) {
        console.log('[Schema v7.20] ✅ Gambar: Tidak ada yang perlu di-regen');
    }
    return regenCount > 0;
}

// ============================================================
// 🔥🔥🔥 DETEKSI ENTITY TYPE — V37 COMPLIANT 🔥🔥🔥
// ============================================================
function getEntityTypeFromPLD() {
    const pldVersions = [
        { obj: window.pageLevelDetectorv22, name: 'v22.x' },
        { obj: window.pageLevelDetectorv20, name: 'v20.x' },
        { obj: window.pageLevelDetectorv19, name: 'v19.0' },
        { obj: window.pageLevelDetectorV18, name: 'v18.7' },
        { obj: window.pageLevelDetectorV17, name: 'v17.0' },
        { obj: window.pageLevelDetector, name: 'legacy' }
    ];

    for (let pld of pldVersions) {
        if (pld.obj && typeof pld.obj.detectEntityType === 'function') {
            try {
                const entityType = pld.obj.detectEntityType();
                if (entityType) {
                    console.log(`[Schema v7.20] Entity Type dari PLD ${pld.name}: ${entityType}`);
                    return entityType;
                }
            } catch(e) {
                console.warn(`[Schema v7.20] Error calling PLD ${pld.name}:`, e.message);
            }
        }
    }

    const bodyEntity = document.body.getAttribute('data-entity-type') || document.body.getAttribute('data-schema-entity-type');
    if (bodyEntity) {
        console.log(`[Schema v7.20] Entity Type dari body attribute: ${bodyEntity}`);
        return bodyEntity;
    }

    console.log('[Schema v7.20] Entity Type tidak tersedia, menggunakan fallback detection');
    return detectEntityTypeFallback();
}

function detectEntityTypeFallback() {
    const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
    const title = document.title.toLowerCase();
    const url = location.href.toLowerCase();
    const combined = h1 + " " + title + " " + url;

    // CEK JASA
    const jasaKeywords = ['jasa', 'layanan', 'service', 'borongan', 'kontraktor', 'renovasi', 'pemasangan', 'instalasi', 'pengerjaan', 'perbaikan'];
    for (let keyword of jasaKeywords) {
        if (combined.includes(keyword)) {
            const productExceptions = /(beton|readymix|precast|paving|panel)\s+(harga|spesifikasi|ukuran)/i.test(combined);
            if (!productExceptions) return 'jasa';
        }
    }

    // CEK SEWA/RENTAL
    const sewaKeywords = ['sewa', 'rental', 'sewa alat', 'rental alat', 'excavator', 'bulldozer', 'crane'];
    for (let keyword of sewaKeywords) {
        if (combined.includes(keyword)) {
            const productExceptions = /(sewa\s+beton|sewa\s+readymix)/i.test(combined);
            if (!productExceptions) return 'sewa';
        }
    }

    // CEK MATERIAL
    const materialKeywords = ['material', 'bahan bangunan', 'bahan konstruksi', 'agregat', 'pasir', 'batu split', 'semen'];
    for (let keyword of materialKeywords) {
        if (combined.includes(keyword)) return 'material';
    }

    // DEFAULT: PRODUK
    return 'produk';
}

// ============================================================
// 🔥🔥🔥 DETEKSI FOKUS KONTEN (INFORMASI vs HARGA) 🔥🔥🔥
// ============================================================
function detectContentFocus() {
    const h1 = document.querySelector('h1');
    const h1Text = h1 ? h1.innerText.toLowerCase() : '';
    const title = document.title?.toLowerCase() || '';
    const content = document.querySelector('.post-body.entry-content, .post-body, article, main, section')?.innerText?.toLowerCase() || '';
    const url = location.href.toLowerCase();
    const combined = h1Text + ' ' + title + ' ' + content + ' ' + url;

    // PRIORITAS 1: CEK H1
    const hasYearInH1 = /\b(19|20)\d{2}\b/.test(h1Text);
    if (hasYearInH1) {
        console.log('[Schema v7.20] 📅 H1 mengandung tahun → FOKUS: HARGA');
        return 'harga';
    }

    const hasRpInH1 = /Rp\s*[\d.,]+/.test(h1Text);
    if (hasRpInH1) {
        console.log('[Schema v7.20] 💰 H1 mengandung Rp → FOKUS: HARGA');
        return 'harga';
    }

    const hasHargaInH1 = /harga|biaya|tarif|estimasi/.test(h1Text);
    if (hasHargaInH1) {
        console.log('[Schema v7.20] 💰 H1 mengandung kata harga → FOKUS: HARGA');
        return 'harga';
    }

    const informatifKeywords = ['panduan', 'spesifikasi', 'keunggulan', 'cara memilih', 'tips', 'perbedaan', 'jenis', 'apa itu'];
    const hasInformatifInH1 = informatifKeywords.some(k => h1Text.includes(k));
    if (hasInformatifInH1) {
        console.log('[Schema v7.20] 📚 H1 mengandung kata informatif → FOKUS: INFORMASI');
        return 'informasi';
    }

    // PRIORITAS 2: CEK TABEL HARGA
    const tables = document.querySelectorAll('table');
    let hasPriceTable = false;
    let hasSpecTable = false;
    
    tables.forEach(table => {
        const tableText = table.innerText.toLowerCase();
        if ((tableText.includes('harga') || tableText.includes('biaya') || tableText.includes('estimasi')) && tableText.match(/[\d.,]+/)) {
            hasPriceTable = true;
        }
        if (tableText.includes('spesifikasi') || tableText.includes('ukuran') || tableText.includes('mutu')) {
            hasSpecTable = true;
        }
    });

    if (hasPriceTable && !hasSpecTable) {
        console.log('[Schema v7.20] 📊 Ada tabel HARGA → FOKUS: HARGA');
        return 'harga';
    }

    // PRIORITAS 3: SKOR
    const eduKeywords = ['panduan', 'spesifikasi', 'keunggulan', 'ukuran', 'dimensi', 'cara memilih', 'tips', 'informasi', 'pengertian', 'definisi', 'jenis', 'macam', 'tipe', 'perbedaan', 'kelebihan', 'kekurangan', 'material', 'bahan', 'standar', 'mutu'];
    const priceKeywords = ['harga', 'biaya', 'estimasi', 'tarif', 'mulai dari', 'per meter', 'per lembar', 'per kubik', 'per unit', 'promo', 'diskon', 'penawaran', 'daftar harga', 'tabel harga', 'rincian biaya', 'simulasi biaya', 'total biaya', 'anggaran', 'budget'];

    let eduScore = 0, priceScore = 0;
    eduKeywords.forEach(k => { if (combined.includes(k)) eduScore++; });
    priceKeywords.forEach(k => { if (combined.includes(k)) priceScore++; });

    const hasPriceCTA = document.querySelector('.cta-box, .cta-button, .btn-wa, [href*="wa.me"]')?.innerText?.toLowerCase()?.includes('harga') || false;
    if (hasPriceCTA) priceScore += 2;

    console.log(`[Schema v7.20] 📊 Edu Score: ${eduScore}, Price Score: ${priceScore}`);

    if (priceScore > eduScore * 1.3) {
        console.log('[Schema v7.20] 🎯 Fokus: HARGA (price score lebih tinggi)');
        return 'harga';
    }

    if (eduScore > priceScore * 1.3) {
        console.log('[Schema v7.20] 🎯 Fokus: INFORMASI (edu score lebih tinggi)');
        return 'informasi';
    }

    console.log('[Schema v7.20] 🎯 Fokus: INFORMASI (default)');
    return 'informasi';
}

// ============================================================
// 🔥🔥🔥 IS JASA OR SEWA — V37 COMPLIANT 🔥🔥🔥
// ============================================================
function isJasaOrSewa(entityType) {
    return entityType === 'jasa' || entityType === 'sewa';
}

function isServicePage(entityType) {
    return isJasaOrSewa(entityType);
}

// ============================================================
// 🔥🔥🔥 SCHEMA FUNCTIONS 🔥🔥🔥
// ============================================================
function hasPriceOnPage() {
    const text = document.body.innerText;
    return /Rp\s*[\d.,]+/.test(text);
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

function detectKnowsAbout(entityType) {
    const knowsAbout = [];
    
    // ✅ V37: Entity Type specific knowsAbout
    if (entityType === 'jasa') {
        knowsAbout.push('Jasa Konstruksi', 'Jasa Bangunan', 'Kontraktor', 'Renovasi', 'Pemasangan', 'Perbaikan');
    } else if (entityType === 'sewa') {
        knowsAbout.push('Sewa Alat Berat', 'Rental Excavator', 'Rental Bulldozer', 'Rental Crane', 'Alat Konstruksi');
    } else if (entityType === 'material') {
        knowsAbout.push('Material Bangunan', 'Bahan Konstruksi', 'Beton Ready Mix', 'Precast', 'Agregat');
    } else {
        knowsAbout.push('Produk Konstruksi', 'Beton Precast', 'Material Bangunan');
    }

    // Tambahkan dari breadcrumb
    document.querySelectorAll('.breadcrumbs a, .breadcrumb a, .nav-trail a').forEach(link => {
        const name = link.innerText?.trim();
        if (name && name.length > 2 && name.length < 50) {
            const skipLabels = ['home', 'beranda', 'blog', 'homepage'];
            if (!skipLabels.includes(name.toLowerCase())) knowsAbout.push(name);
        }
    });

    const result = [...new Set(knowsAbout)].slice(0, 10);
    return result;
}

function extractServiceType(title, entityType) {
    let serviceType = title
        .replace(/^(harga|biaya|tarif|estimasi)\s*/i, '')
        .replace(/\s*2026|\s*2025|\s*2024/g, '')
        .replace(/\s*terbaru|\s*update|\s*terkini/g, '')
        .replace(/[-,|:].*$/, '')
        .trim();

    // ✅ V37: Entity Type specific prefix
    if (entityType === 'jasa') {
        if (!/^(jasa|layanan|service|borongan|kontraktor|renovasi|pemasangan|instalasi)/i.test(serviceType)) {
            serviceType = 'Jasa ' + serviceType;
        }
    } else if (entityType === 'sewa') {
        if (!/^(sewa|rental|sewa alat|rental alat)/i.test(serviceType)) {
            serviceType = 'Sewa ' + serviceType;
        }
    }

    if (serviceType.length > 50) serviceType = serviceType.substring(0, 50);
    return serviceType;
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
                    name = name.replace(/^(harga|biaya|tarif|paket|jasa|layanan|sewa)\s*/i, '').replace(/\s{2,}/g, ' ').trim();
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
                    name = name.replace(/^(harga|biaya|tarif|paket|jasa|layanan|sewa)\s*/i, '').replace(/\s{2,}/g, ' ').trim();
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
// 🔥🔥🔥 DETEKSI HALAMAN LAYAK GAMBAR 🔥🔥🔥
// ============================================================
function isImageEligible(pageLevel) {
    console.log('[Schema v7.20 📸] Checking image eligibility for page level:', pageLevel);

    const mandatoryImageLevels = [
        'money-master', 
        'money-page', 
        'money-child',
        'variant',
        'sub-variant'
    ];
    
    if (mandatoryImageLevels.includes(pageLevel)) {
        console.log(`[Schema v7.20] ✅ WAJIB GAMBAR (level: ${pageLevel})`);
        return true;
    }

    if (pageLevel === 'pillar') {
        const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
        const title = document.title.toLowerCase();
        const combined = h1 + " " + title;

        const pillarEdukasi = ["panduan", "tips", "cara", "apa itu", "pengertian", "definisi", "overview", "komprehensif", "langkah", "tutorial", "pedoman", "petunjuk", "kenali", "mengenal", "memahami", "belajar"];
        for (let keyword of pillarEdukasi) {
            if (combined.includes(keyword)) {
                console.log(`[Schema v7.20] ⏭️ Skip gambar: Pillar edukasi murni (keyword: "${keyword}")`);
                return false;
            }
        }
        return true;
    }

    if (pageLevel === 'sub-pillar-tipe-1' || pageLevel === 'sub-pillar-tipe-2') {
        console.log(`[Schema v7.20] ✅ LAYAK GAMBAR (level: ${pageLevel})`);
        return true;
    }

    const content = document.querySelector(".post-body, article, main")?.innerText || "";
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 300) {
        console.log(`[Schema v7.20] ⏭️ Skip gambar: Konten terlalu pendek (${wordCount} kata < 300)`);
        return false;
    }

    const hasImage = document.querySelector('img:not([src*="logo"]):not([src*="icon"]):not([src*="avatar"])');
    if (hasImage) {
        console.log(`[Schema v7.20] ✅ Halaman sudah memiliki gambar, tetap layak`);
        return true;
    }

    console.log(`[Schema v7.20] ⏭️ Skip gambar: Halaman tidak masuk kriteria layak`);
    return false;
}

// ============================================================
// 🔥🔥🔥 AMBIL PAGE LEVEL DARI PLD 🔥🔥🔥
// ============================================================
function getPageLevelFromPLD() {
    const pldVersions = [
        { obj: window.pageLevelDetectorv22, name: 'v22.x' },
        { obj: window.pageLevelDetectorv20, name: 'v20.x' },
        { obj: window.pageLevelDetectorv19, name: 'v19.0' },
        { obj: window.pageLevelDetectorV18, name: 'v18.7' },
        { obj: window.pageLevelDetectorV17, name: 'v17.0' },
        { obj: window.pageLevelDetector, name: 'legacy' }
    ];

    for (let pld of pldVersions) {
        if (pld.obj && typeof pld.obj.detect === 'function') {
            try {
                const level = pld.obj.detect();
                if (level) {
                    console.log(`[Schema v7.20] Page Level dari PLD ${pld.name}: ${level}`);
                    return level;
                }
            } catch(e) {
                console.warn(`[Schema v7.20] Error calling PLD ${pld.name}:`, e.message);
            }
        }
    }

    const bodyLevel = document.body.getAttribute('data-page-level') || document.body.getAttribute('data-schema-page-level');
    if (bodyLevel) {
        console.log(`[Schema v7.20] Page Level dari body attribute: ${bodyLevel}`);
        return bodyLevel;
    }

    console.log('[Schema v7.20] PLD tidak tersedia, menggunakan fallback detection');
    return detectPageLevelFallback();
}

function detectPageLevelFallback() {
    const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
    const title = document.title.toLowerCase();
    const url = location.href.toLowerCase();

    const variantPatterns = ["spesifikasi", "ukuran", "dimensi", "varian", "polosan", "motif", "custom", "metode", "teknik"];
    for (let pattern of variantPatterns) {
        if (h1.includes(pattern) || title.includes(pattern) || url.includes(pattern)) return "variant";
    }

    const locations = ["jakarta", "bekasi", "bogor", "depok", "tangerang", "karawang", "surabaya", "bandung"];
    for (let loc of locations) {
        if (h1.includes(loc) || title.includes(loc) || url.includes(loc)) return "money-child";
    }

    if (/\b(harga|biaya|tarif)\b/i.test(h1 + title)) return "money-page";
    if (/\b(jasa|sewa|borongan)\b/i.test(h1 + title) && !/\b(panduan|tips|cara)\b/i.test(h1 + title)) return "money-master";
    if (/\b(daftar|jenis|kategori)\b/i.test(h1 + title)) return "sub-pillar-tipe-2";
    if (/\b(perbandingan|vs|versus)\b/i.test(h1 + title)) return "sub-pillar-tipe-1";

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

        const onReady = () => { console.log('[Schema v7.20] PLD ready (event)'); resolve(true); };
        window.addEventListener("pageLevelDetectorv22Ready", onReady, { once: true });
        window.addEventListener("pageLevelDetectorv20Ready", onReady, { once: true });
        window.addEventListener("pageLevelDetectorv19Ready", onReady, { once: true });
        window.addEventListener("pageLevelDetectorReady", onReady, { once: true });

        setTimeout(() => {
            if (window.pageLevelDetectorv22 || window.pageLevelDetectorv20 || 
                window.pageLevelDetectorv19 || window.pageLevelDetectorV18 || 
                window.pageLevelDetectorV17 || window.pageLevelDetector) {
                console.log('[Schema v7.20] PLD ready (timeout)');
                resolve(true);
            } else {
                console.log('[Schema v7.20] PLD timeout, using fallback');
                resolve(false);
            }
        }, 5000);
    });
}

// ============================================================
// 🚀 MAIN FUNCTION
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(async () => {
        // ===== STEP 0: TUNGGU PLD =====
        await waitForPLD();

        // ===== STEP 1: DAPATKAN PAGE LEVEL & ENTITY TYPE =====
        const pageLevel = getPageLevelFromPLD();
        const entityType = getEntityTypeFromPLD();
        const contentFocus = detectContentFocus();
        
        console.log(`[Schema v7.20] Page Level: ${pageLevel}`);
        console.log(`[Schema v7.20] Entity Type: ${entityType}`);
        console.log(`[Schema v7.20] Content Focus: ${contentFocus}`);

        // ===== STEP 2: UPDATE TAHUN DI H1 =====
        console.log('[Schema v7.20] 📅 UPDATE TAHUN DI KONTEN:');
        updateH1Year(pageLevel);

        // ===== STEP 3: CEK & PERBAIKI GAMBAR =====
        const isEligible = isImageEligible(pageLevel);

        if (isEligible) {
            console.log(`[Schema v7.20] ✅ Halaman LAYAK mendapat gambar, memproses...`);
            try {
                fixImagesToFormat1(pageLevel);
                updateImageYear(pageLevel);
                regenerateImageWithNewYear(pageLevel);
            } catch(e) {
                console.warn('[Schema v7.20 📸] Error processing images:', e);
            }
        } else {
            console.log(`[Schema v7.20] ⏭️ Halaman TIDAK LAYAK mendapat gambar, skip`);
        }

        // ===== STEP 4: INJECT SCHEMA =====
        const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
        const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
        const baseUrl = ogUrl || canonical || location.href;
        const cleanUrl = baseUrl.replace(/[?&]m=1/, "");

        const h1Text = document.querySelector("h1")?.innerText?.trim() || document.title;
        const title = h1Text.replace(/\s{2,}/g, " ").trim().substring(0, 120);

        const LOGO_IMAGE = IMAGE_CONFIG.LOGO_IMAGE;
        const FALLBACK_IMAGE = IMAGE_CONFIG.FALLBACK_IMAGE;

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

        const knowsAbout = detectKnowsAbout(entityType);
        const tableOffers = [];
        const isMoneyPage = ['money-master', 'money-page', 'money-child'].includes(pageLevel);

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

        // ✅ V37: CEK JASA atau SEWA/RENTAL
        const isJasa = entityType === 'jasa';
        const isSewa = entityType === 'sewa';
        const isService = isJasa || isSewa;

        if (isService) {
            const serviceType = extractServiceType(PAGE.title, entityType);
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

            // ✅ V37: JASA & SEWA bisa punya offers (harga)
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
            console.log(`[Schema v7.20] ✅ Service schema (${entityType})`);

            // ✅ V37: Product schema untuk JASA & SEWA jika ada harga
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
                    category: entityType === 'jasa' ? "ConstructionService" : "RentalService",
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
                console.log(`[Schema v7.20] ✅ Product schema (${tableOffers.length} offers) — ${entityType}`);
            } else {
                console.log(`[Schema v7.20] ⏭️ Skip Product schema (tidak ada harga/offers)`);
            }
        } else {
            // ✅ V37: PRODUK atau MATERIAL
            console.log(`[Schema v7.20] ⏭️ Skip Service schema (entity: ${entityType})`);
        }

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
            console.log(`[Schema v7.20] ✅ ${internalLinks.length} internal links added`);
        }

        const schema = { "@context": "https://schema.org", "@graph": graph };

        let el = document.querySelector("#auto-schema-service");
        if (!el) {
            el = document.createElement("script");
            el.id = "auto-schema-service";
            el.type = "application/ld+json";
            document.head.appendChild(el);
        }
        el.textContent = JSON.stringify(schema, null, 2);

        console.log(`[Schema v7.20 ✅] V37 COMPLIANT | Page: ${pageLevel} | Entity: ${entityType} | Focus: ${contentFocus} | Offers: ${tableOffers.length} | ` +
            `Service: ${isService ? '✅' : '❌'} | Product: ${(isService && hasPrice && tableOffers.length > 0) ? '✅' : '❌'} | ` +
            `Internal Links: ${internalLinks.length} | KnowsAbout: ${knowsAbout.length} | Image Eligible: ${isEligible ? '✅' : '❌'}` +
            ` | CORB: ✅ ZERO | Variant/Sub-Variant: ✅ WAJIB GAMBAR`
        );

    }, 700);
});
