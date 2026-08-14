<!-- ⚡ AUTO SCHEMA UNIVERSAL v7.1 — OFFER NAME ONLY FROM PRICE TABLE -->
<script>
// ============================================================
// 🔥🔥🔥 BLOKIR SEMUA EXTERNAL REQUEST 🔥🔥🔥
// ============================================================
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  if (typeof url === 'string' && (url.includes('raw.githack.com') || url.includes('github.com') || url.includes('gist.github.com'))) {
    console.warn('[Schema v7.1] 🚫 Blocked external fetch (CORB prevention):', url);
    return Promise.reject(new Error('Blocked by CORB prevention'));
  }
  return originalFetch.apply(this, args);
};

const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  if (typeof url === 'string' && (url.includes('raw.githack.com') || url.includes('github.com') || url.includes('gist.github.com'))) {
    console.warn('[Schema v7.1] 🚫 Blocked external XHR (CORB prevention):', url);
    throw new Error('Blocked by CORB prevention');
  }
  return originalXHROpen.call(this, method, url, ...rest);
};

// ============================================================
// 🚀 MAIN SCRIPT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(async () => {
    let schemaInjected = false;

    // ============================================================
    // 🔥🔥🔥 AMBIL PARENT URL DARI BREADCRUMB 🔥🔥🔥
    // ============================================================
    function getParentFromBreadcrumb(currentUrl) {
      const breadcrumbSelectors = [
        '.breadcrumbs a',
        '.breadcrumb a',
        '.nav-trail a',
        '.breadcrumb-item a',
        '.crumbs a',
        '.breadcrumb-link',
        '[aria-label="breadcrumb"] a',
        '.post-breadcrumb a',
        '.breadcrumb-nav a',
        '.nav-breadcrumb a'
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
      
      // Dari Breadcrumb
      document.querySelectorAll('.breadcrumbs a, .breadcrumb a, .nav-trail a').forEach(link => {
        const name = link.innerText?.trim();
        if (name && name.length > 2 && name.length < 50) {
          const skipLabels = ['home', 'beranda', 'blog', 'homepage'];
          if (!skipLabels.includes(name.toLowerCase())) {
            knowsAbout.push(name);
          }
        }
      });

      // Dari H1
      const h1Words = h1.split(/[-,|:]/).map(w => w.trim());
      h1Words.forEach(word => {
        if (word.length > 3 && word.length < 40) {
          const commonWords = ['harga', 'biaya', 'tarif', 'jasa', 'sewa', 'cara', 'tips', 'panduan', 
                               'terbaik', 'murah', 'profesional', 'berkualitas', 'terpercaya'];
          if (!commonWords.includes(word.toLowerCase())) {
            const isService = /(jasa|service|layanan|sewa|borongan|kontraktor|konstruksi|bangunan|cor|beton|precast|aspal|renovasi|bongkar|pembangunan|proyek|gedung|rumah|jalan|jembatan|tukang|mandor|arsitek|desain|interior|eksterior|cat|plafon|gypsum|baja|besi|kayu|keramik|granit|marmer|batu|bata|hebel|pasir|split|koral|semen|besi|wiremesh|besi beton|pipa|paralon|atap|genteng|baja ringan|canopy|teralis|pintu|jendela|kusen|aluminium|upvc|kaca|sanitasi|plumbing|listrik|ac|ventilasi|waterproofing|drainase|landscape|taman|kolam|paving|blok|conblock|grassblock|pagarbeton|panel|readymix|pompa|concrete|mix|molen|vibrator|scaffolding|steger|perancah|bekisting|formwork)/i;
            if (isService) {
              knowsAbout.push(word);
            }
          }
        }
      });

      // Dari Headings
      document.querySelectorAll('h2, h3').forEach(h => {
        const text = h.innerText?.trim();
        if (text && text.length > 5 && text.length < 60) {
          const serviceIndicators = ['jasa', 'layanan', 'service', 'paket', 'harga', 'biaya', 'tarif', 
                                     'promo', 'diskon', 'spesifikasi', 'ukuran', 'dimensi', 'material'];
          if (serviceIndicators.some(ind => text.toLowerCase().includes(ind))) {
            knowsAbout.push(text);
          }
        }
      });

      // Dari Strong/Bold
      document.querySelectorAll('strong, b').forEach(el => {
        const text = el.innerText?.trim();
        if (text && text.length > 3 && text.length < 40) {
          const servicePatterns = /(jasa|layanan|service|harga|biaya|paket|promo|diskon|spesifikasi|ukuran|dimensi|material|beton|cor|precast|konstruksi|bangunan|renovasi|bongkar|pembangunan|gedung|rumah|jalan|jembatan)/i;
          if (servicePatterns.test(text)) {
            knowsAbout.push(text);
          }
        }
      });

      // Filter & Deduplikasi
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
        if (defaultServices.length > 0) return defaultServices;
        return ['Jasa Konstruksi', 'Beton Precast'];
      }
      
      return result;
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
      if (pageLevel === 'variant' || pageLevel === 'sub-variant') return false;
      if (['money-master', 'money-page', 'money-child'].includes(pageLevel)) return false;

      const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
      const title = document.title.toLowerCase();

      const edukasiPatterns = ["panduan", "cara memilih", "tips memilih", "langkah memilih", "pengertian", "definisi", "apa itu"];
      for (let pattern of edukasiPatterns) {
        if (h1.includes(pattern) || title.includes(pattern)) return true;
      }
      return false;
    }

    // ============================================================
    // BUILD VARIANT PRODUCT
    // ============================================================
    function buildVariantProduct(pageLevel, cleanUrl, PAGE) {
      const productNode = {
        "@type": "Product",
        "@id": cleanUrl + "#product",
        name: PAGE.title,
        description: PAGE.description,
        image: [PAGE.image],
        brand: { "@type": "Brand", name: PAGE.business.name },
        category: "ConstructionProduct",
        productType: pageLevel === 'variant' ? "Variant" : "Sub-Variant",
        material: "Beton Precast",
        manufacturer: { "@type": "Organization", name: PAGE.business.name }
      };

      const specText = document.querySelector(".post-body, article, main")?.innerText || "";
      const variant = {};

      const sizeMatch = specText.match(/(\d{1,3}\s*x\s*\d{1,3})\s*(cm|meter|m)/i);
      if (sizeMatch) variant.size = sizeMatch[1] + " " + sizeMatch[2];

      const heightMatch = specText.match(/tinggi\s*([\d.]+)\s*(meter|m|cm)/i);
      if (heightMatch) variant.height = heightMatch[1] + " " + heightMatch[2];

      const thickMatch = specText.match(/tebal\s*([\d.]+)\s*(cm|mm)/i);
      if (thickMatch) variant.thickness = thickMatch[1] + " " + thickMatch[2];

      if (Object.keys(variant).length > 0) {
        productNode.variant = { "@type": "ProductVariant", ...variant };
      } else {
        productNode.variant = { "@type": "ProductVariant" };
      }

      return productNode;
    }

    // ============================================================
    // 🔥🔥🔥 EKSTRAK OFFER NAME HANYA DARI TABEL 🔥🔥🔥
    // ============================================================
    function extractOffersFromTable() {
      const offers = [];
      const seenItems = new Set();

      // Cari semua tabel
      const tables = document.querySelectorAll('table');
      
      tables.forEach((table, tableIndex) => {
        // Cari semua baris dalam tabel
        const rows = table.querySelectorAll('tr');
        
        rows.forEach((row, rowIndex) => {
          // Skip header row (jika mengandung kata "nama", "produk", "harga", dll)
          const rowText = row.innerText.toLowerCase();
          const headerKeywords = ['nama', 'produk', 'item', 'layanan', 'jasa', 'deskripsi', 'harga', 'biaya', 'tarif', 'paket'];
          const isHeader = headerKeywords.some(keyword => rowText.includes(keyword) && rowText.length < 50);
          
          if (isHeader && rowIndex === 0) {
            // Ini header, skip
            return;
          }

          // Cari sel dalam baris
          const cells = row.querySelectorAll('td');
          
          // Jika baris memiliki sel
          if (cells.length > 0) {
            let name = '';
            let price = null;
            let description = '';

            // Loop melalui sel untuk mencari nama dan harga
            cells.forEach((cell, cellIndex) => {
              const text = cell.innerText.trim();
              
              // Cek apakah sel ini berisi harga (Rp)
              const priceMatch = text.match(/Rp\s*([\d.,]+)/);
              if (priceMatch) {
                const priceValue = parseInt(priceMatch[1].replace(/[^\d]/g, ''));
                if (priceValue > 10000 && priceValue < 1000000000) {
                  price = priceValue;
                }
              }
              
              // Jika sel ini bukan harga, ambil sebagai nama
              if (!priceMatch && text.length > 2 && text.length < 100) {
                // Cek apakah ini label harga (skip)
                const priceLabels = ['harga', 'biaya', 'tarif', 'price', 'cost'];
                if (!priceLabels.some(label => text.toLowerCase().includes(label))) {
                  // Jika name masih kosong atau sel ini lebih panjang
                  if (!name || text.length > name.length) {
                    name = text;
                  }
                }
              }
            });

            // Jika tidak ada nama, coba ambil dari sel pertama
            if (!name && cells.length > 0) {
              const firstCell = cells[0].innerText.trim();
              if (firstCell.length > 2 && firstCell.length < 100) {
                // Cek apakah bukan header harga
                const priceLabels = ['harga', 'biaya', 'tarif', 'price', 'cost'];
                if (!priceLabels.some(label => firstCell.toLowerCase().includes(label))) {
                  name = firstCell;
                }
              }
            }

            // Jika masih tidak ada nama, coba dari sel kedua
            if (!name && cells.length > 1) {
              const secondCell = cells[1].innerText.trim();
              if (secondCell.length > 2 && secondCell.length < 100) {
                const priceLabels = ['harga', 'biaya', 'tarif', 'price', 'cost'];
                if (!priceLabels.some(label => secondCell.toLowerCase().includes(label))) {
                  name = secondCell;
                }
              }
            }

            // Clean nama
            if (name) {
              name = name
                .replace(/^(harga|biaya|tarif|paket|jasa|layanan)\s*/i, '')
                .replace(/\s{2,}/g, ' ')
                .trim();
            }

            // Jika ada nama dan harga, tambahkan ke offers
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

      // Jika tidak ada offers dari tabel, coba dari list/li
      if (offers.length === 0) {
        document.querySelectorAll('li').forEach(li => {
          const text = li.innerText.trim();
          const priceMatch = text.match(/Rp\s*([\d.,]+)/);
          if (priceMatch) {
            const price = parseInt(priceMatch[1].replace(/[^\d]/g, ''));
            if (price > 10000 && price < 1000000000) {
              let name = text.split('Rp')[0].trim();
              // Clean name
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

      // Jika masih tidak ada, coba dari paragraf
      if (offers.length === 0) {
        document.querySelectorAll('p').forEach(p => {
          const text = p.innerText.trim();
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

      console.log(`[Schema v7.1] Extracted ${offers.length} offers from table:`);
      offers.forEach(o => console.log(`  - ${o.name}: Rp${o.price.toLocaleString()}`));

      return offers;
    }

    // ============================================================
    // MAIN FUNCTION
    // ============================================================
    async function initSchema() {
      if (schemaInjected) return;
      schemaInjected = true;
      console.log("[Schema v7.1 🚀] Starting (ZERO CORB)");

      const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
      const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
      const baseUrl = ogUrl || canonical || location.href;
      const cleanUrl = baseUrl.replace(/[?&]m=1/, "");

      const h1Text = document.querySelector("h1")?.innerText?.trim() || document.title;
      const title = h1Text.replace(/\s{2,}/g, " ").trim().substring(0, 120);

      const pageLevel = getPageLevel();
      console.log(`[Schema v7.1] Page Level: ${pageLevel}`);

      const PAGE = {
        url: cleanUrl,
        title,
        description: document.querySelector('meta[name="description"]')?.content?.trim() ||
          document.querySelector("article p, main p, .post-body p")?.innerText?.substring(0, 200) || title,
        image: document.querySelector('meta[property="og:image"]')?.content ||
          document.querySelector("article img, main img, .post-body img")?.getAttribute("src") ||
          "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png",
        business: {
          name: "Beton Jaya Readymix",
          url: "https://www.betonjayareadymix.com",
          telephone: "+6283839000968",
          openingHours: "Mo-Sa 08:00-17:00",
          description: "Beton Jaya Readymix melayani jasa konstruksi, beton cor, precast, dan sewa alat berat di seluruh Indonesia.",
          address: { "@type": "PostalAddress", addressLocality: "Bogor", addressRegion: "Jawa Barat", addressCountry: "ID" },
          sameAs: ["https://www.facebook.com/betonjayareadymix", "https://www.instagram.com/betonjayareadymix"]
        }
      };

      // ===== PARENT DARI BREADCRUMB =====
      const parentData = getParentFromBreadcrumb(cleanUrl);
      const parentUrls = [{ 
        "@type": "WebPage", 
        "@id": parentData.parentUrl, 
        name: parentData.parentName || "Parent Page" 
      }];
      console.log(`[Schema v7.1] Parent: ${parentData.parentName}`);

      // ===== AREA SERVED =====
      const defaultAreaServed = [
        "DKI Jakarta", "Kabupaten Bogor", "Kota Bogor", "Kota Depok",
        "Kabupaten Tangerang", "Kota Tangerang", "Kota Tangerang Selatan",
        "Kabupaten Bekasi", "Kota Bekasi", "Kabupaten Karawang"
      ].map(a => ({ "@type": "Place", name: a }));

      const knowsAbout = detectKnowsAbout();

      // ===== 🔥🔥🔥 EKSTRAK OFFER HANYA DARI TABEL 🔥🔥🔥 =====
      const tableOffers = [];
      const skipProduct = shouldSkipProductSchema(pageLevel);
      const isMoneyPage = ['money-master', 'money-page', 'money-child'].includes(pageLevel);

      if (!skipProduct && isMoneyPage) {
        const extractedOffers = extractOffersFromTable();
        extractedOffers.forEach(offer => {
          tableOffers.push({
            "@type": "Offer",
            name: offer.name.substring(0, 100),
            url: cleanUrl,
            priceCurrency: "IDR",
            price: offer.price,
            itemCondition: "https://schema.org/NewCondition",
            availability: "https://schema.org/InStock",
            priceValidUntil: new Date(Date.now() + 180*24*60*60*1000).toISOString().split("T")[0],
            seller: { "@id": PAGE.business.url + "#localbusiness" },
            description: offer.description || offer.name
          });
        });
      }

      // ===== BUILD GRAPH =====
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
          logo: PAGE.image,
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

      // ===== PRODUCT SCHEMA =====
      const isVariantPage = (pageLevel === 'variant' || pageLevel === 'sub-variant');
      const isProductPage = !skipProduct && (isVariantPage || isMoneyPage || tableOffers.length > 0);

      if (isProductPage) {
        let productNode;
        if (isVariantPage) {
          productNode = buildVariantProduct(pageLevel, cleanUrl, PAGE);
        } else {
          productNode = {
            "@type": "Product",
            "@id": cleanUrl + "#product",
            name: PAGE.title,
            description: PAGE.description,
            image: [PAGE.image],
            brand: { "@type": "Brand", name: PAGE.business.name },
            category: "ConstructionProduct"
          };
        }

        if (tableOffers.length > 0) {
          productNode.offers = {
            "@type": "AggregateOffer",
            lowPrice: Math.min(...tableOffers.map(o => o.price)),
            highPrice: Math.max(...tableOffers.map(o => o.price)),
            offerCount: tableOffers.length,
            priceCurrency: "IDR",
            offers: tableOffers
          };
        }
        graph.push(productNode);
      }

      // ===== SERVICE SCHEMA =====
      if (!isVariantPage) {
        const serviceNode = {
          "@type": "Service",
          "@id": cleanUrl + "#service",
          name: PAGE.title,
          description: PAGE.description,
          image: PAGE.image,
          serviceType: PAGE.title.split('-')[0].trim(),
          areaServed: defaultAreaServed,
          provider: { "@id": PAGE.business.url + "#localbusiness" },
          brand: { "@type": "Brand", name: PAGE.business.name },
          mainEntityOfPage: { "@id": cleanUrl + "#webpage" }
        };

        if (tableOffers.length > 0) {
          serviceNode.offers = {
            "@type": "AggregateOffer",
            lowPrice: Math.min(...tableOffers.map(o => o.price)),
            highPrice: Math.max(...tableOffers.map(o => o.price)),
            offerCount: tableOffers.length,
            priceCurrency: "IDR",
            offers: tableOffers
          };
        }
        graph.push(serviceNode);
      }

      // ===== INJECT SCHEMA =====
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
        `[Schema v7.1 ✅] Injected | Page: ${pageLevel} | Offers: ${tableOffers.length} | ` +
        `Product: ${isProductPage ? '✅' : '❌'} | Service: ${!isVariantPage ? '✅' : '❌'} | ` +
        `KnowsAbout: ${knowsAbout.length} | CORB: ✅ ZERO`
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
</script>
