/* ⚡ AUTO SCHEMA UNIVERSAL v7.12 — FIX: TIDAK BUAT PRODUCT UNTUK JASA TANPA HARGA + AUTO FIX GAMBAR */
// ============================================================
// 🔥🔥🔥 BLOKIR SEMUA EXTERNAL REQUEST 🔥🔥🔥
// ============================================================
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  if (typeof url === 'string' && (url.includes('raw.githack.com') || url.includes('github.com') || url.includes('gist.github.com'))) {
    console.warn('[Schema v7.12] 🚫 Blocked external fetch (CORB prevention):', url);
    return Promise.reject(new Error('Blocked by CORB prevention'));
  }
  return originalFetch.apply(this, args);
};

const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  if (typeof url === 'string' && (url.includes('raw.githack.com') || url.includes('github.com') || url.includes('gist.github.com'))) {
    console.warn('[Schema v7.12] 🚫 Blocked external XHR (CORB prevention):', url);
    throw new Error('Blocked by CORB prevention');
  }
  return originalXHROpen.call(this, method, url, ...rest);
};

// ============================================================
// 🔥🔥🔥 AUTO FIX GAMBAR (FORMAT 1) 🔥🔥🔥
// ============================================================
const IMAGE_FIX_CONFIG = {
  FALLBACK_IMAGE: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiWWAP6ezcmzgbGtHmmJqBjYkbsdQBrwCeC9pl9ocjL-VSQYftirdvXAF1T-eg_QMSqu1WiFidDc9fnChi0yaOqi0Dd6EVMy4ZX3P7vccY4XJMu-7k2TGVd5TS1wIG5jgIm_6beYVb2zuNQGS7eBuODJqd20c4ckvd0-HaEqGf4W-B_750I91wi9IhqqnI/s320/No_Image_Available.jpg",
  LOGO_IMAGE: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png"
};

function fixImagesToFormat1() {
  console.log('[Schema v7.12 📸] Checking images...');

  // Cari H1
  const h1Element = document.querySelector('h1');
  const h1Text = h1Element ? h1Element.textContent.trim() : document.title;

  // Cari gambar pertama setelah H1
  let targetImage = null;
  let targetFigure = null;

  if (h1Element) {
    const siblings = h1Element.parentElement.children;
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

  // Jika tidak ada gambar setelah H1, cari di konten utama
  if (!targetImage) {
    const contentAreas = document.querySelectorAll('section, article, .post-body, main, .content, .entry-content');
    for (const area of contentAreas) {
      const img = area.querySelector('img:not([src*="logo"]):not([src*="icon"]):not([src*="avatar"])');
      if (img) {
        targetImage = img;
        targetFigure = img.closest('figure');
        break;
      }
    }
  }

  // Generate alt text dari H1 atau title
  function generateAltText() {
    let alt = h1Text || document.title;
    // Hapus kata "Harga" untuk halaman JASA (bukan HARGA)
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

    // 1. Dari alt text
    if (img.alt && img.alt.trim() !== '' && !img.alt.toLowerCase().includes('no image')) {
      caption = img.alt;
    }
    // 2. Dari title
    if (!caption && img.title && img.title.trim() !== '') {
      caption = img.title;
    }
    // 3. Dari figcaption yang sudah ada
    const existingFigcaption = img.closest('figure')?.querySelector('figcaption');
    if (!caption && existingFigcaption && existingFigcaption.textContent.trim() !== '') {
      caption = existingFigcaption.textContent.trim();
    }
    // 4. Dari H1
    if (!caption) {
      caption = h1Text || document.title;
    }
    // 5. Tambahkan emoji
    if (!caption.includes('📊') && !caption.includes('📌') && !caption.includes('📸')) {
      caption = '📊 ' + caption;
    }
    // 6. Tambahkan tahun
    const year = new Date().getFullYear();
    if (!caption.includes(year.toString())) {
      caption = caption + ' — ' + year;
    }
    return caption;
  }

  // Jika tidak ada gambar sama sekali, tambahkan fallback
  if (!targetImage) {
    console.log('[Schema v7.12 📸] No image found, inserting fallback...');
    const figure = document.createElement('figure');
    figure.style.padding = '1em 0px';
    figure.style.margin = '20px 0';
    figure.style.textAlign = 'center';
    figure.style.background = '#f8fafc';
    figure.style.borderRadius = '12px';

    const img = document.createElement('img');
    img.src = IMAGE_FIX_CONFIG.FALLBACK_IMAGE;
    img.alt = generateAltText();
    img.title = generateAltText();
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
    figcaption.textContent = '📊 ' + (h1Text || document.title) + ' — ' + new Date().getFullYear();

    figure.appendChild(img);
    figure.appendChild(figcaption);

    // Sisipkan setelah H1
    if (h1Element && h1Element.nextSibling) {
      h1Element.parentElement.insertBefore(figure, h1Element.nextSibling);
    } else if (document.querySelector('.post-body, main, article')) {
      const container = document.querySelector('.post-body, main, article');
      container.insertBefore(figure, container.firstChild);
    } else {
      document.body.insertBefore(figure, document.body.firstChild);
    }

    console.log('[Schema v7.12 📸] ✅ Fallback image inserted');
    return;
  }

  // ===== PERBAIKI GAMBAR YANG ADA =====
  console.log('[Schema v7.12 📸] Fixing existing image...');

  const img = targetImage;
  const captionText = generateCaption(img);

  // --- Perbaiki atribut gambar ---
  if (!img.alt || img.alt.trim() === '' || img.alt.toLowerCase().includes('no image')) {
    img.alt = generateAltText();
  }
  if (!img.title || img.title.trim() === '') {
    img.title = img.alt || generateAltText();
  }
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

  // Style gambar
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

    // Pastikan gambar di dalam figure
    if (img.parentElement !== figure) {
      figure.insertBefore(img, figure.firstChild);
    }

    // Perbaiki figcaption
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
    const parent = img.parentElement;
    const newFigure = document.createElement('figure');
    newFigure.style.padding = '1em 0px';
    newFigure.style.margin = '20px 0';
    newFigure.style.textAlign = 'center';
    newFigure.style.background = '#f8fafc';
    newFigure.style.borderRadius = '12px';

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

  img.setAttribute('data-fixed', 'true');
  console.log('[Schema v7.12 📸] ✅ Image fixed to Format 1');
}

// ============================================================
// 🚀 MAIN SCRIPT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(async () => {
    let schemaInjected = false;

    // ============================================================
    // 🔥🔥🔥 IMAGE URLS 🔥🔥🔥
    // ============================================================
    const LOGO_IMAGE = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";
    const FALLBACK_IMAGE = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiWWAP6ezcmzgbGtHmmJqBjYkbsdQBrwCeC9pl9ocjL-VSQYftirdvXAF1T-eg_QMSqu1WiFidDc9fnChi0yaOqi0Dd6EVMy4ZX3P7vccY4XJMu-7k2TGVd5TS1wIG5jgIm_6beYVb2zuNQGS7eBuODJqd20c4ckvd0-HaEqGf4W-B_750I91wi9IhqqnI/s320/No_Image_Available.jpg";

    // ============================================================
    // 🔥🔥🔥 CEK APAKAH HALAMAN MEMILIKI HARGA 🔥🔥🔥
    // ============================================================
    function hasPriceOnPage() {
      const text = document.body.innerText;
      const pricePatterns = [
        /Rp\s*[\d.,]+/,
        /Rp[\d.,]+/,
        /harga\s*Rp/i,
        /biaya\s*Rp/i,
        /mulai\s*Rp/i,
        /Rp\s*[\d.,]+\s*-\s*Rp\s*[\d.,]+/
      ];
      return pricePatterns.some(pattern => pattern.test(text));
    }

    // ============================================================
    // 🔥🔥🔥 AMBIL PARENT URL DARI BREADCRUMB 🔥🔥🔥
    // ============================================================
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
          return {
            parentUrl: parentLink.href,
            parentName: parentLink.innerText?.trim() || 'Parent Page'
          };
        }
      }

      const urlParts = currentUrl.split('/');
      if (urlParts.length > 4) {
        const parentUrl = urlParts.slice(0, -1).join('/');
        const parentName = urlParts[urlParts.length - 2]?.replace(/-/g, ' ') || 'Parent Page';
        return { parentUrl, parentName };
      }

      return {
        parentUrl: location.origin,
        parentName: 'Home'
      };
    }

    // ============================================================
    // 🔥🔥🔥 DETECT KNOWSABOUT OTOMATIS 🔥🔥🔥
    // ============================================================
    function detectKnowsAbout() {
      const knowsAbout = [];
      const text = document.body.innerText.toLowerCase();
      const title = document.title.toLowerCase();
      const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
      const url = location.href.toLowerCase();
      const metaDesc = document.querySelector('meta[name="description"]')?.content?.toLowerCase() || "";
      
      const fullText = text + " " + title + " " + h1 + " " + metaDesc + " " + url;
      
      document.querySelectorAll('.breadcrumbs a, .breadcrumb a, .nav-trail a').forEach(link => {
        const name = link.innerText?.trim();
        if (name && name.length > 2 && name.length < 50) {
          const skipLabels = ['home', 'beranda', 'blog', 'homepage'];
          if (!skipLabels.includes(name.toLowerCase())) {
            knowsAbout.push(name);
          }
        }
      });

      const h1Words = h1.split(/[-,|:]/).map(w => w.trim());
      h1Words.forEach(word => {
        if (word.length > 3 && word.length < 40) {
          const commonWords = ['harga', 'biaya', 'tarif', 'jasa', 'sewa', 'cara', 'tips', 'panduan', 
                               'terbaik', 'murah', 'profesional', 'berkualitas', 'terpercaya', 'jual', 'beli'];
          if (!commonWords.includes(word.toLowerCase())) {
            const isService = /(jasa|service|layanan|sewa|borongan|kontraktor|konstruksi|bangunan|cor|beton|precast|aspal|renovasi|bongkar|pembangunan|proyek|gedung|rumah|jalan|jembatan|tukang|mandor|arsitek|desain|interior|eksterior|cat|plafon|gypsum|baja|besi|kayu|keramik|granit|marmer|batu|bata|hebel|pasir|split|koral|semen|besi|wiremesh|besi beton|pipa|paralon|atap|genteng|baja ringan|canopy|teralis|pintu|jendela|kusen|aluminium|upvc|kaca|sanitasi|plumbing|listrik|ac|ventilasi|waterproofing|drainase|landscape|taman|kolam|paving|blok|conblock|grassblock|pagarbeton|panel|readymix|pompa|concrete|mix|molen|vibrator|scaffolding|steger|perancah|bekisting|formwork|bore|pile|pondasi|tiang|pancang|strauss|mini|pile|spun|piles|micro|piling)/i;
            if (isService) {
              knowsAbout.push(word);
            }
          }
        }
      });

      document.querySelectorAll('h2, h3').forEach(h => {
        const text = h.innerText?.trim();
        if (text && text.length > 5 && text.length < 60) {
          const serviceIndicators = ['jasa', 'layanan', 'service', 'paket', 'harga', 'biaya', 'tarif', 
                                     'promo', 'diskon', 'spesifikasi', 'ukuran', 'dimensi', 'material',
                                     'bore', 'pile', 'pondasi', 'tiang', 'pancang', 'sewa', 'rental'];
          if (serviceIndicators.some(ind => text.toLowerCase().includes(ind))) {
            knowsAbout.push(text);
          }
        }
      });

      document.querySelectorAll('strong, b').forEach(el => {
        const text = el.innerText?.trim();
        if (text && text.length > 3 && text.length < 40) {
          const servicePatterns = /(jasa|layanan|service|harga|biaya|paket|promo|diskon|spesifikasi|ukuran|dimensi|material|beton|cor|precast|konstruksi|bangunan|renovasi|bongkar|pembangunan|gedung|rumah|jalan|jembatan|bore|pile|pondasi|tiang|pancang|sewa|rental)/i;
          if (servicePatterns.test(text)) {
            knowsAbout.push(text);
          }
        }
      });

      const uniqueKnowsAbout = [];
      const seen = new Set();

      for (let item of knowsAbout) {
        let clean = item
          .replace(/^(jasa|layanan|service|paket|harga|biaya|tarif)\s*/i, '')
          .replace(/\s{2,}/g, ' ')
          .trim();
        
        if (clean.length < 3 || clean.length > 80) continue;
        
        const commonWords = ['home', 'beranda', 'blog', 'homepage', 'search', 'label', 
                             'feeds', 'atom', 'comment', 'widget', 'admin', 'login', 'register',
                             'about', 'contact', 'privacy', 'terms', 'sitemap', 'rss', 'feed'];
        if (commonWords.includes(clean.toLowerCase())) continue;
        
        if (/^[\d\W]+$/.test(clean)) continue;
        
        const key = clean.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          uniqueKnowsAbout.push(clean);
        }
      }

      const result = uniqueKnowsAbout.slice(0, 10);
      
      if (result.length === 0) {
        const defaultServices = [];
        if (/(cor|beton|readymix|concrete|mix)/i.test(fullText)) defaultServices.push('Jasa Beton Cor');
        if (/(precast|panel|pagar|booth|gorong|gorong-gorong|parit)/i.test(fullText)) defaultServices.push('Beton Precast');
        if (/(aspal|hotmix|jalan|perbaikan jalan|pengaspalan)/i.test(fullText)) defaultServices.push('Jasa Aspal');
        if (/(sewa|rental|alat berat|excavator|buldozer|dumptruck|vibro|roll)/i.test(fullText)) defaultServices.push('Sewa Alat Berat');
        if (/(renovasi|bangun|pembangunan|rumah|gedung|ruko|rukan|kantor|gudang)/i.test(fullText)) defaultServices.push('Jasa Renovasi');
        if (/(bongkar|pembongkaran|hancur|runtuh|bangunan lama)/i.test(fullText)) defaultServices.push('Jasa Bongkar Bangunan');
        if (/(bore|pile|pondasi|tiang|pancang|strauss|mini|piling)/i.test(fullText)) defaultServices.push('Jasa Bore Pile');
        if (defaultServices.length > 0) return defaultServices;
        return ['Jasa Konstruksi', 'Beton Precast'];
      }
      
      return result;
    }

    // ============================================================
    // 🔥🔥🔥 CEK APAKAH INI HALAMAN JASA / SEWA / RENTAL 🔥🔥🔥
    // ============================================================
    function isServicePage(pageLevel) {
      const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
      const title = document.title.toLowerCase();
      const url = location.href.toLowerCase();
      const metaDesc = document.querySelector('meta[name="description"]')?.content?.toLowerCase() || "";
      const text = document.body.innerText.toLowerCase().substring(0, 2000);
      
      const combined = h1 + " " + title + " " + url + " " + metaDesc + " " + text;
      
      const isProductPage = /(jual|beli|order|pesan|pemesanan|pembelian|produk|material|bahan|spesifikasi|ukuran|dimensi|mutu|grade|tipe|model|varian|polosan|motif|custom)\s+(beton|readymix|precast|paving|panel|box|u-ditch|kansteen|gorong|material|bahan|besi|baja|pipa|atap|genteng|keramik|marmer|granit|kayu|pintu|jendela|kusen|paving\s*block|pagar\s*panel|box\s*culvert|u\s*ditch|kanstin|gorong\s*gorong)/i.test(h1 + title);
      if (isProductPage) {
        console.log(`[Schema v7.12] ⏭️ Skip: Product/Material detected → NO schema`);
        return false;
      }
      
      const isJual = /(jual|beli|order|pesan|pemesanan|pembelian)\s+(beton|readymix|precast|paving|panel|material|bahan|produk|besi|baja|pipa|atap|genteng|keramik|marmer|granit|kayu|pintu|jendela|kusen)/i.test(h1 + title);
      if (isJual) {
        console.log(`[Schema v7.12] ⏭️ Skip: "Jual" detected → PRODUCT`);
        return false;
      }
      
      const urlJasaPatterns = [
        /\/jasa-/i, /\/jasa\//i, /\/p\/jasa-/i, 
        /\/layanan-/i, /\/service-/i,
        /\/borongan-/i, /\/kontraktor-/i,
        /\/sewa-/i, /\/rental-/i, /\/p\/sewa-/i
      ];
      for (let pattern of urlJasaPatterns) {
        if (pattern.test(url)) {
          const isProductUrl = /\/p\/(beton|readymix|precast|paving|panel|box|u-ditch|kansteen|gorong|material|jual|beli|order|pesan|produk|bahan|spesifikasi|ukuran|dimensi|mutu|grade|tipe|model|varian|polosan|motif|custom)/i.test(url);
          if (!isProductUrl) {
            console.log(`[Schema v7.12] ✅ isServicePage: URL pattern matched: ${pattern}`);
            return true;
          }
        }
      }
      
      const h1Title = h1 + " " + title;
      
      const strongServiceKeywords = [
        'jasa', 'layanan', 'service', 'borongan',
        'kontraktor', 'tukang', 'renovasi', 'bongkar', 'pemasangan',
        'instalasi', 'pengerjaan', 'perbaikan', 'pembangunan', 'proyek',
        'bore pile', 'pondasi', 'tiang pancang', 'sumur bor', 'coring',
        'pasang', 'bangun', 'perawatan', 'perbaikan',
        'sewa', 'rental', 'sewa alat', 'rental alat'
      ];
      
      for (let keyword of strongServiceKeywords) {
        if (h1Title.includes(keyword)) {
          const productExceptions = /(beton|readymix|precast|paving|panel|box culvert|u-ditch|kansteen|gorong|material|besi|baja)\s+(harga|biaya|spesifikasi|ukuran)/i.test(h1Title);
          if (!productExceptions) {
            console.log(`[Schema v7.12] ✅ isServicePage: Strong keyword "${keyword}" found`);
            return true;
          }
        }
      }
      
      const servicePhrases = [
        /jasa\s+(pasang|pemasangan|instalasi|bongkar|bor|sumur|cor|beton|renovasi|bangun|perbaikan|perawatan|pengerjaan|pembangunan)/i,
        /layanan\s+(pasang|pemasangan|instalasi|bongkar|bor|sumur|cor|beton|renovasi|bangun|perbaikan|perawatan|pengerjaan|pembangunan)/i,
        /service\s+(pasang|pemasangan|instalasi|bongkar|bor|sumur|cor|beton|renovasi|bangun|perbaikan|perawatan|pengerjaan|pembangunan)/i,
        /borongan\s+(bangun|renovasi|perbaikan|pembangunan|proyek|rumah|gedung|ruko|gudang)/i,
        /kontraktor\s+(bangun|renovasi|perbaikan|pembangunan|proyek|rumah|gedung|ruko|gudang)/i,
        /sewa\s+(alat|excavator|buldozer|dumptruck|crane|forklift|beton|molen|vibrator|scaffolding|steger|perancah|pompa|concrete\s*pump|truk|mobil|dump\s*truck|backhoe|loader|grader|roller|vibro|pile|hammer)/i,
        /rental\s+(alat|excavator|buldozer|dumptruck|crane|forklift|beton|molen|vibrator|scaffolding|steger|perancah|pompa|concrete\s*pump|truk|mobil|dump\s*truck|backhoe|loader|grader|roller|vibro|pile|hammer)/i,
        /sewa\s+(harian|mingguan|bulanan|tahunan)/i,
        /rental\s+(harian|mingguan|bulanan|tahunan)/i
      ];
      
      for (let pattern of servicePhrases) {
        if (pattern.test(h1Title)) {
          console.log(`[Schema v7.12] ✅ isServicePage: Service phrase matched`);
          return true;
        }
      }
      
      if (pageLevel) {
        const servicePageLevels = ['money-master', 'money-page', 'money-child', 'sub-pillar-tipe-1', 'sub-pillar-tipe-2'];
        if (servicePageLevels.includes(pageLevel)) {
          const hasServiceWord = /(jasa|layanan|service|sewa|borongan|kontraktor|tukang|renovasi|bongkar|pemasangan|instalasi|perbaikan|rental)/i.test(combined);
          if (hasServiceWord) {
            const isProduct = /(beton|readymix|precast|paving|panel|box culvert|u-ditch|kansteen|gorong|material|bahan|besi|baja)(?!\s*(pasang|pemasangan|instalasi|bongkar|bor|sumur|coring|bangun|renovasi|perbaikan|perawatan|pengerjaan|pembangunan|sewa|rental))/i.test(combined);
            if (!isProduct) {
              console.log(`[Schema v7.12] ✅ isServicePage: Page level ${pageLevel} + service word`);
              return true;
            }
          }
        }
        
        if (pageLevel === 'variant' || pageLevel === 'sub-variant') {
          const hasServiceInVariant = /(jasa|layanan|service|sewa|borongan|kontraktor|tukang|renovasi|bongkar|pemasangan|instalasi|perbaikan|rental)/i.test(h1Title);
          if (hasServiceInVariant) {
            console.log(`[Schema v7.12] ✅ isServicePage: Variant page with service keyword`);
            return true;
          }
        }
      }
      
      const contentPatterns = [
        /kami\s+melayani\s+jasa/i,
        /kami\s+menyediakan\s+layanan/i,
        /jasa\s+(profesional|berkualitas|terbaik|murah|terpercaya)/i,
        /layanan\s+(profesional|berkualitas|terbaik|murah|terpercaya)/i,
        /(harga|biaya|tarif)\s+jasa/i,
        /pengerjaan\s+oleh\s+tim\s+profesional/i,
        /tim\s+ahli\s+(bersertifikat|berpengalaman)/i,
        /(sewa|rental)\s+(alat|kendaraan|peralatan|mesin|konstruksi)/i,
        /(harga|biaya|tarif)\s+sewa/i,
        /sewa\s+(harian|mingguan|bulanan|tahunan)/i,
        /rental\s+(harian|mingguan|bulanan|tahunan)/i
      ];
      
      for (let pattern of contentPatterns) {
        if (pattern.test(combined)) {
          const isProductContent = /(beli|order|pesan|jual)\s+(beton|readymix|precast|paving|panel|material|bahan)/i.test(combined);
          if (!isProductContent) {
            console.log(`[Schema v7.12] ✅ isServicePage: Content pattern matched`);
            return true;
          }
        }
      }
      
      if ((pageLevel === 'variant' || pageLevel === 'sub-variant') && /(jasa|sewa|rental)/i.test(h1Title + url)) {
        console.log(`[Schema v7.12] ✅ isServicePage: Variant page with "jasa/sewa/rental"`);
        return true;
      }
      
      console.log(`[Schema v7.12] ⏭️ Skip: Not identified as service page`);
      return false;
    }

    // ============================================================
    // 🔥🔥🔥 EKSTRAK SERVICE TYPE DARI JUDUL 🔥🔥🔥
    // ============================================================
    function extractServiceType(title) {
      let serviceType = title
        .replace(/^(harga|biaya|tarif|estimasi)\s*/i, '')
        .replace(/\s*2026|\s*2025|\s*2024/g, '')
        .replace(/\s*terbaru|\s*update|\s*terkini/g, '')
        .replace(/[-,|:].*$/, '')
        .trim();
      
      if (serviceType.length > 50) {
        serviceType = serviceType.substring(0, 50);
      }
      
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

    // ============================================================
    // 🔥🔥🔥 SLUGIFY 🔥🔥🔥
    // ============================================================
    function slugify(text) {
      if (!text) return 'product';
      return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .substring(0, 50);
    }

    // ============================================================
    // 🔥🔥🔥 AMBIL PAGE LEVEL 🔥🔥🔥
    // ============================================================
    function getPageLevel() {
      const pldVersions = ['pageLevelDetectorv22', 'pageLevelDetectorv20', 'pageLevelDetectorv19', 
                           'pageLevelDetectorV18', 'pageLevelDetectorV17', 'pageLevelDetector'];
      for (let pld of pldVersions) {
        if (window[pld] && typeof window[pld].detect === 'function') {
          try {
            const level = window[pld].detect();
            if (level) return level;
          } catch(e) {}
        }
      }

      const bodyLevel = document.body.getAttribute('data-page-level') || 
                        document.body.getAttribute('data-schema-page-level');
      if (bodyLevel) return bodyLevel;

      const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
      const title = document.title.toLowerCase();
      const url = location.href.toLowerCase();

      const variantPatterns = ["spesifikasi", "ukuran", "dimensi", "varian", "polosan", "motif", "custom"];
      for (let pattern of variantPatterns) {
        if (h1.includes(pattern) || title.includes(pattern) || url.includes(pattern)) {
          const subVariantPatterns = ["detail", "lengkap", "spesifikasi teknis", "ukuran detail"];
          for (let sub of subVariantPatterns) {
            if (h1.includes(sub) || title.includes(sub)) return "sub-variant";
          }
          return "variant";
        }
      }

      const locations = ["jakarta", "bekasi", "bogor", "depok", "tangerang", "karawang"];
      for (let loc of locations) {
        if (h1.includes(loc) || title.includes(loc) || url.includes(loc)) return "money-child";
      }

      if (/\b(harga|biaya|tarif)\b/i.test(h1 + title)) return "money-page";
      if (/\b(jasa|sewa|borongan)\b/i.test(h1 + title) && !/\b(panduan|tips|cara)\b/i.test(h1 + title)) return "money-master";
      if (/\b(daftar|jenis|kategori)\b/i.test(h1 + title)) return "sub-pillar-tipe-2";
      if (/\b(perbandingan|vs|versus)\b/i.test(h1 + title)) return "sub-pillar-tipe-1";

      return "pillar";
    }

    // ============================================================
    // CEK SKIP PRODUCT
    // ============================================================
    function shouldSkipProductSchema(pageLevel) {
      return true;
    }

    // ============================================================
    // 🔥🔥🔥 EKSTRAK OFFER DARI TABEL 🔥🔥🔥
    // ============================================================
    function extractOffersFromTable() {
      const offers = [];
      const seenItems = new Set();

      const tables = document.querySelectorAll('table');
      
      tables.forEach((table, tableIndex) => {
        const rows = table.querySelectorAll('tr');
        
        rows.forEach((row, rowIndex) => {
          const rowText = row.innerText.toLowerCase();
          const headerKeywords = ['nama', 'produk', 'item', 'layanan', 'jasa', 'deskripsi', 'harga', 'biaya', 'tarif', 'paket', 'jenis', 'tipe'];
          const isHeader = headerKeywords.some(keyword => rowText.includes(keyword) && rowText.length < 50);
          
          if (isHeader && rowIndex === 0) {
            return;
          }

          const cells = row.querySelectorAll('td');
          
          if (cells.length > 0) {
            let name = '';
            let price = null;
            let description = '';

            cells.forEach((cell, cellIndex) => {
              const text = cell.innerText.trim();
              
              const priceMatch = text.match(/Rp\s*([\d.,]+)/);
              if (priceMatch) {
                const priceValue = parseInt(priceMatch[1].replace(/[^\d]/g, ''));
                if (priceValue > 10000 && priceValue < 1000000000) {
                  price = priceValue;
                }
              }
              
              if (!priceMatch && text.length > 2 && text.length < 100) {
                const priceLabels = ['harga', 'biaya', 'tarif', 'price', 'cost', 'rp', 'rp.'];
                if (!priceLabels.some(label => text.toLowerCase().includes(label))) {
                  if (!name || text.length > name.length) {
                    name = text;
                  }
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

            if (!name && cells.length > 1) {
              const secondCell = cells[1].innerText.trim();
              if (secondCell.length > 2 && secondCell.length < 100) {
                const priceLabels = ['harga', 'biaya', 'tarif', 'price', 'cost', 'rp', 'rp.'];
                if (!priceLabels.some(label => secondCell.toLowerCase().includes(label))) {
                  name = secondCell;
                }
              }
            }

            if (name) {
              name = name
                .replace(/^(harga|biaya|tarif|paket|jasa|layanan)\s*/i, '')
                .replace(/\s{2,}/g, ' ')
                .trim();
            }

            if (name && price && name.length > 2 && name.length < 80) {
              const idKey = `${name}|${price}`;
              if (!seenItems.has(idKey)) {
                seenItems.add(idKey);
                offers.push({
                  name: name,
                  price: price,
                  description: description || name
                });
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
              name = name
                .replace(/^(harga|biaya|tarif|paket|jasa|layanan)\s*/i, '')
                .replace(/\s{2,}/g, ' ')
                .trim();
              
              if (name && name.length > 2 && name.length < 80) {
                const idKey = `${name}|${price}`;
                if (!seenItems.has(idKey)) {
                  seenItems.add(idKey);
                  offers.push({
                    name: name,
                    price: price,
                    description: name
                  });
                }
              }
            }
          }
        });
      }

      console.log(`[Schema v7.12] Extracted ${offers.length} offers:`);
      offers.forEach(o => console.log(`  - ${o.name}: Rp${o.price.toLocaleString()}`));

      return offers;
    }

    // ============================================================
    // MAIN FUNCTION
    // ============================================================
    async function initSchema() {
      if (schemaInjected) return;
      schemaInjected = true;
      console.log("[Schema v7.12 🚀] Starting - SERVICE + PRODUCT (HANYA JIKA ADA HARGA) + AUTO FIX GAMBAR");

      // ===== AUTO FIX GAMBAR (SEBELUM SCHEMA) =====
      try {
        fixImagesToFormat1();
      } catch(e) {
        console.warn('[Schema v7.12 📸] Error fixing images:', e);
      }

      const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
      const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
      const baseUrl = ogUrl || canonical || location.href;
      const cleanUrl = baseUrl.replace(/[?&]m=1/, "");

      const h1Text = document.querySelector("h1")?.innerText?.trim() || document.title;
      const title = h1Text.replace(/\s{2,}/g, " ").trim().substring(0, 120);

      const pageLevel = getPageLevel();
      console.log(`[Schema v7.12] Page Level: ${pageLevel}`);

      const PAGE = {
        url: cleanUrl,
        title,
        description: document.querySelector('meta[name="description"]')?.content?.trim() ||
          document.querySelector("article p, main p, .post-body p")?.innerText?.substring(0, 200) || title,
        image: document.querySelector('meta[property="og:image"]')?.content ||
          document.querySelector("article img, main img, .post-body img")?.getAttribute("src") ||
          FALLBACK_IMAGE,
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
      const parentUrls = [{ 
        "@type": "WebPage", 
        "@id": parentData.parentUrl, 
        name: parentData.parentName || "Parent Page" 
      }];
      console.log(`[Schema v7.12] Parent: ${parentData.parentName}`);

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
      const isMoneyPage = ['money-master', 'money-page', 'money-child'].includes(pageLevel);

      if (isMoneyPage) {
        const extractedOffers = extractOffersFromTable();
        extractedOffers.forEach(offer => {
          tableOffers.push({
            name: offer.name,
            price: offer.price,
            description: offer.description || offer.name
          });
        });
      }

      // ✅ FIX v7.12: Cek apakah halaman memiliki harga
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
      const isVariantPage = (pageLevel === 'variant' || pageLevel === 'sub-variant');

      console.log(`[Schema v7.12] isVariantPage: ${isVariantPage}, isService: ${isService}, hasPrice: ${hasPrice}`);

      // ============================================================
      // 🔥🔥🔥 SERVICE SCHEMA (SELALU DIBUAT UNTUK JASA) 🔥🔥🔥
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
        console.log(`[Schema v7.12] ✅ Service schema (jasa/layanan/sewa/rental)`);

        // ✅ FIX v7.12: HANYA buat Product jika ada harga/offers
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
          console.log(`[Schema v7.12] ✅ Product schema (${tableOffers.length} offers) - KARENA ADA HARGA`);
        } else {
          console.log(`[Schema v7.12] ⏭️ Skip Product schema (tidak ada harga/offers) - AMAN UNTUK GSC`);
        }
      } else {
        console.log(`[Schema v7.12] ⏭️ Skip Service schema (bukan jasa)`);
      }

      // ============================================================
      // 🔥🔥🔥 INTERNAL LINKS 🔥🔥🔥
      // ============================================================
      function generateInternalLinks() {
        const containers = ["article", "main", ".post-body"]
          .map((sel) => document.querySelector(sel))
          .filter(Boolean);
        const links = containers
          .flatMap((c) => Array.from(c.querySelectorAll("a")))
          .map((a) => a.href)
          .filter(
            (href) =>
              href &&
              href.includes(location.hostname) &&
              !href.includes("#") &&
              !href.match(/(\/search|\/feed|\/label)/i)
          );
        const unique = [...new Set(links)];
        return unique.slice(0, 40).map((u, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: u,
          name: decodeURIComponent(u.split("/").pop().replace(".html", "").replace(/-/g, " ")),
        }));
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
        console.log(`[Schema v7.12] ✅ ${internalLinks.length} internal links added`);
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

      console.log(
        `[Schema v7.12 ✅] Injected | Page: ${pageLevel} | Offers: ${tableOffers.length} | ` +
        `Service: ${isService ? '✅' : '❌'} | Product: ${(isService && hasPrice && tableOffers.length > 0) ? '✅' : '❌'} | ` +
        `Internal Links: ${internalLinks.length} | KnowsAbout: ${knowsAbout.length} | CORB: ✅ ZERO | Gambar: ✅ FIXED`
      );
    }

    // ============================================================
    // START
    // ============================================================
    function ensurePostBody() {
      if (document.querySelector(".post-body") || document.querySelector("main")) return true;

      const candidates = [
        document.querySelector("article"),
        document.querySelector(".post"),
        document.querySelector(".entry-content"),
        document.querySelector('[role="main"]'),
        document.querySelector(".blog-posts"),
        document.querySelector(".hentry"),
        document.querySelector(".item-content"),
        document.querySelector("#main"),
        document.querySelector("#content")
      ];

      for (let el of candidates) {
        if (el && !el.classList.contains("post-body")) {
          el.classList.add("post-body");
          return true;
        }
      }

      const allDivs = document.querySelectorAll("div");
      for (let div of allDivs) {
        if (div.innerText.length > 500 && div.children.length > 2 && !div.classList.contains("post-body")) {
          div.classList.add("post-body");
          return true;
        }
      }

      return false;
    }

    const hasPostBody = ensurePostBody();

    if (document.querySelector("h1") && hasPostBody) {
      await initSchema();
    } else {
      const obs = new MutationObserver(async () => {
        if (document.querySelector("h1") && (document.querySelector(".post-body") || document.querySelector("main"))) {
          await initSchema();
          obs.disconnect();
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
      
      setTimeout(async () => {
        if (!schemaInjected) {
          ensurePostBody();
          await initSchema();
        }
      }, 4000);
    }
  }, 700);
});
