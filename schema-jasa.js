<!-- ⚡ AUTO SCHEMA UNIVERSAL v6.3 — NO FAQ, PURE SERVICE SCHEMA -->
<script>
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
              console.log('[Schema v6.3] Breadcrumb found in div:', div.className);
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
            console.log('[Schema v6.3] Breadcrumb found in nav');
          }
        }
      }

      console.log(`[Schema v6.3] Found ${breadcrumbLinks.length} breadcrumb links`);

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
          console.log(`[Schema v6.3] Parent found:`, {
            name: parentLink.innerText?.trim(),
            url: parentLink.href
          });
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
        console.log(`[Schema v6.3] Parent from URL fallback:`, {
          parentUrl,
          parentName
        });
        return { parentUrl, parentName };
      }

      console.log(`[Schema v6.3] Using domain as parent`);
      return {
        parentUrl: location.origin,
        parentName: 'Home'
      };
    }

    // ============================================================
    // 🔥🔥🔥 DETECT KNOWSABOUT OTOMATIS TANPA LIST 🔥🔥🔥
    // ============================================================
    function detectKnowsAbout() {
      const knowsAbout = [];
      const text = document.body.innerText.toLowerCase();
      const title = document.title.toLowerCase();
      const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
      const url = location.href.toLowerCase();
      const metaDesc = document.querySelector('meta[name="description"]')?.content?.toLowerCase() || "";
      
      const fullText = text + " " + title + " " + h1 + " " + metaDesc + " " + url;
      
      // ===== 1. DARI BREADCRUMB =====
      const breadcrumbLinks = document.querySelectorAll('.breadcrumbs a, .breadcrumb a, .nav-trail a');
      breadcrumbLinks.forEach(link => {
        const name = link.innerText?.trim();
        if (name && name.length > 2 && name.length < 50) {
          const skipLabels = ['home', 'beranda', 'blog', 'homepage'];
          if (!skipLabels.includes(name.toLowerCase())) {
            knowsAbout.push(name);
          }
        }
      });

      // ===== 2. DARI H1 / JUDUL =====
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

      // ===== 3. DARI URL =====
      const urlParts = url.split('/').filter(p => p && p.length > 2);
      urlParts.forEach(part => {
        const cleanPart = part.replace(/-/g, ' ').replace(/\.html$/, '');
        if (cleanPart.length > 3 && cleanPart.length < 40) {
          const commonUrlWords = ['p', 'search', 'label', 'feeds', 'atom', 'comment', 'widget'];
          if (!commonUrlWords.includes(cleanPart.toLowerCase())) {
            const serviceKeywords = ['jasa', 'sewa', 'borongan', 'kontraktor', 'konstruksi', 'bangunan', 
                                     'cor', 'beton', 'precast', 'aspal', 'renovasi', 'bongkar'];
            if (serviceKeywords.some(k => cleanPart.toLowerCase().includes(k))) {
              knowsAbout.push(cleanPart);
            }
          }
        }
      });

      // ===== 4. DARI META KEYWORDS =====
      const metaKeywords = document.querySelector('meta[name="keywords"]')?.content?.split(',').map(k => k.trim()) || [];
      metaKeywords.forEach(keyword => {
        if (keyword.length > 3 && keyword.length < 40) {
          knowsAbout.push(keyword);
        }
      });

      // ===== 5. DARI HEADINGS (H2, H3) =====
      const headings = document.querySelectorAll('h2, h3');
      headings.forEach(h => {
        const text = h.innerText?.trim();
        if (text && text.length > 5 && text.length < 60) {
          const serviceIndicators = ['jasa', 'layanan', 'service', 'paket', 'harga', 'biaya', 'tarif', 
                                     'promo', 'diskon', 'spesifikasi', 'ukuran', 'dimensi', 'material'];
          if (serviceIndicators.some(ind => text.toLowerCase().includes(ind))) {
            knowsAbout.push(text);
          }
        }
      });

      // ===== 6. DARI STRONG/BOLD TEXT =====
      document.querySelectorAll('strong, b').forEach(el => {
        const text = el.innerText?.trim();
        if (text && text.length > 3 && text.length < 40) {
          const servicePatterns = /(jasa|layanan|service|harga|biaya|paket|promo|diskon|spesifikasi|ukuran|dimensi|material|beton|cor|precast|konstruksi|bangunan|renovasi|bongkar|pembangunan|gedung|rumah|jalan|jembatan)/i;
          if (servicePatterns.test(text)) {
            knowsAbout.push(text);
          }
        }
      });

      // ===== 7. DARI LIST ITEMS =====
      document.querySelectorAll('li').forEach(el => {
        const text = el.innerText?.trim();
        if (text && text.length > 5 && text.length < 50) {
          const servicePatterns = /(jasa|layanan|service|paket|harga|biaya|tarif|promo|spesifikasi|ukuran|dimensi|material|beton|cor|precast)/i;
          if (servicePatterns.test(text)) {
            knowsAbout.push(text);
          }
        }
      });

      // ===== 8. DARI TABLE CELLS =====
      document.querySelectorAll('td, th').forEach(el => {
        const text = el.innerText?.trim();
        if (text && text.length > 3 && text.length < 40) {
          const servicePatterns = /(jasa|layanan|service|harga|biaya|paket|spesifikasi|ukuran|dimensi|material)/i;
          if (servicePatterns.test(text)) {
            knowsAbout.push(text);
          }
        }
      });

      // ===== 9. DARI PARAGRAPH PERTAMA =====
      const firstP = document.querySelector('p');
      if (firstP) {
        const text = firstP.innerText?.trim();
        if (text && text.length > 10) {
          const sentences = text.split(/[.!?]/);
          for (let sentence of sentences) {
            if (sentence.length > 10 && sentence.length < 100) {
              const servicePatterns = /(jasa|layanan|service|menyediakan|melayani|menawarkan|spesialis|profesional|kontraktor|konstruksi|bangunan|pembangunan|renovasi|beton|cor|precast|aspal|sewa|borongan)/i;
              if (servicePatterns.test(sentence)) {
                knowsAbout.push(sentence.trim());
                break;
              }
            }
          }
        }
      }

      // ===== 10. DARI TAG SERVICE =====
      document.querySelectorAll('[itemtype*="Service"], [typeof*="Service"]').forEach(el => {
        const text = el.innerText?.trim();
        if (text && text.length > 5 && text.length < 100) {
          knowsAbout.push(text.substring(0, 80));
        }
      });

      // ===== FILTER & DEDUPLIKASI =====
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
        if (!seen.has(key) && !seen.has(clean.toLowerCase().split(' ').slice(0, 3).join(' '))) {
          seen.add(key);
          uniqueKnowsAbout.push(clean);
        }
      }

      const result = uniqueKnowsAbout.slice(0, 10);
      
      console.log(`[Schema v6.3] Detected knowsAbout (${result.length}):`, result);
      
      if (result.length === 0) {
        const defaultServices = [];
        
        if (/(cor|beton|readymix|concrete|mix)/i.test(fullText)) {
          defaultServices.push('Jasa Beton Cor');
        }
        if (/(precast|panel|pagar|booth|gorong|gorong-gorong|parit)/i.test(fullText)) {
          defaultServices.push('Beton Precast');
        }
        if (/(aspal|hotmix|jalan|perbaikan jalan|pengaspalan)/i.test(fullText)) {
          defaultServices.push('Jasa Aspal');
        }
        if (/(sewa|rental|alat berat|excavator|buldozer|dumptruck|vibro|roll)/i.test(fullText)) {
          defaultServices.push('Sewa Alat Berat');
        }
        if (/(renovasi|bangun|pembangunan|rumah|gedung|ruko|rukan|kantor|gudang)/i.test(fullText)) {
          defaultServices.push('Jasa Renovasi');
        }
        if (/(bongkar|pembongkaran|hancur|runtuh|bangunan lama)/i.test(fullText)) {
          defaultServices.push('Jasa Bongkar Bangunan');
        }
        
        if (defaultServices.length > 0) {
          console.log('[Schema v6.3] Using contextual defaults:', defaultServices);
          return defaultServices;
        }
        
        console.log('[Schema v6.3] Using generic defaults');
        return ['Jasa Konstruksi', 'Beton Precast'];
      }
      
      return result;
    }

    // ============================================================
    // 🔥🔥🔥 AMBIL PAGE LEVEL DARI PLD ATAU BODY 🔥🔥🔥
    // ============================================================
    function getPageLevel() {
      if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
        try {
          const pageLevel = window.pageLevelDetectorv22.detect();
          console.log(`[Schema v6.3] Page Level dari PLD v22.x: ${pageLevel}`);
          return pageLevel;
        } catch(e) { console.warn(`PLD v22.x error: ${e.message}`); }
      }

      if (window.pageLevelDetectorv20 && typeof window.pageLevelDetectorv20.detect === 'function') {
        try {
          const pageLevel = window.pageLevelDetectorv20.detect();
          console.log(`[Schema v6.3] Page Level dari PLD v20.x: ${pageLevel}`);
          return pageLevel;
        } catch(e) { console.warn(`PLD v20.x error: ${e.message}`); }
      }

      if (window.pageLevelDetectorv19 && typeof window.pageLevelDetectorv19.detect === 'function') {
        try {
          const pageLevel = window.pageLevelDetectorv19.detect();
          console.log(`[Schema v6.3] Page Level dari PLD v19.0: ${pageLevel}`);
          return pageLevel;
        } catch(e) { console.warn(`PLD v19.0 error: ${e.message}`); }
      }

      if (window.pageLevelDetectorV18 && typeof window.pageLevelDetectorV18.detect === 'function') {
        try {
          const pageLevel = window.pageLevelDetectorV18.detect();
          console.log(`[Schema v6.3] Page Level dari PLD v18.7: ${pageLevel}`);
          return pageLevel;
        } catch(e) { console.warn(`PLD v18.7 error: ${e.message}`); }
      }

      if (window.pageLevelDetectorV17 && typeof window.pageLevelDetectorV17.detect === 'function') {
        try {
          const pageLevel = window.pageLevelDetectorV17.detect();
          console.log(`[Schema v6.3] Page Level dari PLD v17.0: ${pageLevel}`);
          return pageLevel;
        } catch(e) { console.warn(`PLD v17.0 error: ${e.message}`); }
      }

      if (window.pageLevelDetector && typeof window.pageLevelDetector.detect === 'function') {
        try {
          const pageLevel = window.pageLevelDetector.detect();
          console.log(`[Schema v6.3] Page Level dari PLD legacy: ${pageLevel}`);
          return pageLevel;
        } catch(e) { console.warn(`PLD legacy error: ${e.message}`); }
      }

      const bodyPageLevel = document.body.getAttribute('data-page-level') || 
                            document.body.getAttribute('data-schema-page-level');
      if (bodyPageLevel) {
        console.log(`[Schema v6.3] Page Level dari body attribute: ${bodyPageLevel}`);
        return bodyPageLevel;
      }

      const pageInfo = document.body.getAttribute('data-page-info');
      if (pageInfo) {
        try {
          const data = JSON.parse(pageInfo);
          if (data.pageLevel) {
            console.log(`[Schema v6.3] Page Level dari data-page-info: ${data.pageLevel}`);
            return data.pageLevel;
          }
        } catch(e) {}
      }

      console.warn("[Schema v6.3] PLD tidak tersedia, menggunakan fallback detection");
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
          const subVariantPatterns = ["detail", "lengkap", "spesifikasi teknis", "ukuran detail"];
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
      if (/\b(daftar|jenis|kategori)\b/i.test(h1 + title)) return "sub-pillar-tipe-2";
      if (/\b(perbandingan|vs|versus)\b/i.test(h1 + title)) return "sub-pillar-tipe-1";

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
          console.log("[Schema v6.3] PLD ready (event)");
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
            console.log("[Schema v6.3] PLD ready (timeout)");
            resolve(true);
          } else {
            console.warn("[Schema v6.3] PLD timeout, using fallback");
            resolve(false);
          }
        }, 5000);
      });
    }

    // ============================================================
    // CEK APAKAH SKIP PRODUCT
    // ============================================================
    function shouldSkipProductSchema(pageLevel) {
      if (pageLevel === 'variant' || pageLevel === 'sub-variant') return false;
      if (['money-master', 'money-page', 'money-child'].includes(pageLevel)) return false;

      const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
      const title = document.title.toLowerCase();

      const edukasiPatterns = ["panduan", "cara memilih", "tips memilih", "langkah memilih", "pengertian", "definisi", "apa itu"];
      for (let pattern of edukasiPatterns) {
        if (h1.includes(pattern) || title.includes(pattern)) {
          console.log(`[Schema v6.3] Skip Product: halaman edukasi murni (pattern: "${pattern}")`);
          return true;
        }
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
    // MAIN FUNCTION
    // ============================================================
    async function initSchema() {
      if (schemaInjected) return;
      schemaInjected = true;
      console.log("[Schema v6.3 🚀] Universal schema dijalankan (NO FAQ)");

      await waitForPLD();

      const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
      const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
      const baseUrl = ogUrl || canonical || location.href;
      const cleanUrl = baseUrl.replace(/[?&]m=1/, "");

      const h1Text = document.querySelector("h1")?.innerText?.trim() || document.title;
      const title = h1Text.replace(/\s{2,}/g, " ").trim().substring(0, 120);

      const pageLevel = getPageLevel();
      console.log(`[Schema v6.3] Page Level: ${pageLevel}`);

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
      let parentUrls = [];
      const parentData = getParentFromBreadcrumb(cleanUrl);
      if (parentData && parentData.parentUrl) {
        parentUrls = [{ 
          "@type": "WebPage", 
          "@id": parentData.parentUrl, 
          name: parentData.parentName || "Parent Page" 
        }];
        console.log(`[Schema v6.3] Parent from breadcrumb: ${parentData.parentName} (${parentData.parentUrl})`);
      }

      if (parentUrls.length === 0) {
        parentUrls = [{ "@type": "WebPage", "@id": location.origin, name: "Home" }];
        console.log(`[Schema v6.3] Using domain as parent: ${location.origin}`);
      }

      // ===== AREA SERVED =====
      const defaultAreaServed = [
        "DKI Jakarta", "Kabupaten Bogor", "Kota Bogor", "Kota Depok",
        "Kabupaten Tangerang", "Kota Tangerang", "Kota Tangerang Selatan",
        "Kabupaten Bekasi", "Kota Bekasi", "Kabupaten Karawang"
      ].map(a => ({ "@type": "Place", name: a }));

      // ===== 🔥🔥🔥 DETECT KNOWSABOUT OTOMATIS 🔥🔥🔥 =====
      const knowsAbout = detectKnowsAbout();

      // ===== DETEKSI HARGA =====
      const seenItems = new Set();
      const tableOffers = [];

      function addOffer(name, price, desc = "") {
        if (!price || price <= 0) return;
        const idKey = `${name}|${price}`;
        if (seenItems.has(idKey)) return;
        seenItems.add(idKey);

        let validUntil = window.AEDMetaDates?.nextUpdate || 
          new Date(Date.now() + 180*24*60*60*1000).toISOString().split("T")[0];

        tableOffers.push({
          "@type": "Offer",
          name: name.substring(0, 100),
          url: cleanUrl,
          priceCurrency: "IDR",
          price: price,
          itemCondition: "https://schema.org/NewCondition",
          availability: "https://schema.org/InStock",
          priceValidUntil: validUntil,
          seller: { "@id": PAGE.business.url + "#localbusiness" },
          description: desc || undefined
        });
      }

      const skipProduct = shouldSkipProductSchema(pageLevel);
      const isMoneyPage = ['money-master', 'money-page', 'money-child'].includes(pageLevel);

      if (!skipProduct && isMoneyPage) {
        document.querySelectorAll("table tr, li, p").forEach((el) => {
          const m = el.innerText.match(/Rp\s*([\d.,]+)/);
          if (m) {
            const price = parseInt(m[1].replace(/[^\d]/g, ""));
            if (price > 10000 && price < 1000000000) {
              const name = el.innerText.split("Rp")[0].trim() || PAGE.title;
              addOffer(name, price);
            }
          }
        });
      }

      // ===== INTERNAL LINKS =====
      function generateInternalLinks() {
        const containers = ["article", "main", ".post-body"].map(s => document.querySelector(s)).filter(Boolean);
        const links = containers.flatMap(c => Array.from(c.querySelectorAll("a")))
          .map(a => a.href)
          .filter(h => h && h.includes(location.hostname) && !h.includes("#") && !h.match(/(\/search|\/feed|\/label)/i));
        const unique = [...new Set(links)];
        return unique.slice(0, 40).map((u, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: u,
          name: decodeURIComponent(u.split("/").pop().replace(".html", "").replace(/-/g, " "))
        }));
      }
      const internalLinks = generateInternalLinks();

      // ===== BUILD GRAPH (TANPA FAQ) =====
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

      // ===== ❌ FAQ DIHAPUS =====
      // graph.push(generateFAQ(cleanUrl, PAGE.title)); // ❌ DIHAPUS

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
        console.log(`[Schema v6.3] Product schema generated for ${pageLevel}`);
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

      // ===== RELATED LINKS =====
      if (internalLinks.length) {
        graph.push({
          "@type": "ItemList",
          "@id": cleanUrl + "#related-links",
          name: "Halaman Terkait",
          itemListOrder: "Ascending",
          numberOfItems: internalLinks.length,
          itemListElement: internalLinks
        });
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
        `[Schema v6.3 ✅] Injected | Page: ${pageLevel} | Offers: ${tableOffers.length} | ` +
        `Product: ${isProductPage ? '✅' : '❌'} | Service: ${!isVariantPage ? '✅' : '❌'} | ` +
        `KnowsAbout: ${knowsAbout.length} | FAQ: ❌`
      );
    }

    // ============================================================
    // 🔥🔥🔥 START — AUTO DETECT POST-BODY
    // ============================================================
    function ensurePostBody() {
      if (document.querySelector(".post-body") || document.querySelector("main")) {
        return true;
      }

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
          console.log("[Schema v6.3] ✅ post-body class added to:", el.tagName, el.className);
          return true;
        }
      }

      const allDivs = document.querySelectorAll("div");
      for (let div of allDivs) {
        if (div.innerText.length > 500 && div.children.length > 2 && !div.classList.contains("post-body")) {
          div.classList.add("post-body");
          console.log("[Schema v6.3] ✅ post-body class added to div (auto-detected)");
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
        const h1Exists = !!document.querySelector("h1");
        const bodyExists = !!document.querySelector(".post-body") || !!document.querySelector("main");
        
        if (h1Exists && bodyExists) {
          await initSchema();
          obs.disconnect();
        } else if (h1Exists && !bodyExists) {
          ensurePostBody();
          if (document.querySelector(".post-body") || document.querySelector("main")) {
            await initSchema();
            obs.disconnect();
          }
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
      
      setTimeout(async () => {
        if (!schemaInjected) {
          console.log("[Schema v6.3] ⏰ Timeout: forcing init...");
          ensurePostBody();
          if (!document.querySelector("main") && !document.querySelector(".post-body")) {
            const main = document.createElement("main");
            main.className = "post-body";
            document.body.insertBefore(main, document.body.firstChild);
            console.log("[Schema v6.3] ✅ main.post-body created fallback");
          }
          await initSchema();
        }
      }, 4000);
    }
  }, 700);
});
</script>
