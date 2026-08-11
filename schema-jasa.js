<!-- ⚡ AUTO SCHEMA UNIVERSAL v5.1 — Fixed PLD Integration -->
<script>
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(async () => {
    let schemaInjected = false;

    // ============================================================
    // FUNGSI LOAD EXTERNAL JS (PARENT MAPPING)
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
          console.warn("[Schema v5.1] Gagal load parent mapping:", src);
          resolve();
        };
        document.head.appendChild(s);
      });
    }

    // ============================================================
    // 🔥🔥🔥 AMBIL PAGE LEVEL DARI PLD 🔥🔥🔥
    // ============================================================
    function getPageLevelFromPLD() {
      // ✅ PRIORITAS 1: PLD v22.x
      if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
        try {
          const pageLevel = window.pageLevelDetectorv22.detect();
          console.log(`[Schema v5.1] Page Level dari PLD v22.x: ${pageLevel}`);
          return pageLevel;
        } catch(e) { console.warn(`PLD v22.x error: ${e.message}`); }
      }
      
      // ✅ PRIORITAS 2: PLD v20.x
      if (window.pageLevelDetectorv20 && typeof window.pageLevelDetectorv20.detect === 'function') {
        try {
          const pageLevel = window.pageLevelDetectorv20.detect();
          console.log(`[Schema v5.1] Page Level dari PLD v20.x: ${pageLevel}`);
          return pageLevel;
        } catch(e) { console.warn(`PLD v20.x error: ${e.message}`); }
      }
      
      // ✅ PRIORITAS 3: PLD v19.0
      if (window.pageLevelDetectorv19 && typeof window.pageLevelDetectorv19.detect === 'function') {
        try {
          const pageLevel = window.pageLevelDetectorv19.detect();
          console.log(`[Schema v5.1] Page Level dari PLD v19.0: ${pageLevel}`);
          return pageLevel;
        } catch(e) { console.warn(`PLD v19.0 error: ${e.message}`); }
      }
      
      // ✅ PRIORITAS 4: PLD v18
      if (window.pageLevelDetectorV18 && typeof window.pageLevelDetectorV18.detect === 'function') {
        try {
          const pageLevel = window.pageLevelDetectorV18.detect();
          console.log(`[Schema v5.1] Page Level dari PLD v18.7: ${pageLevel}`);
          return pageLevel;
        } catch(e) { console.warn(`PLD v18.7 error: ${e.message}`); }
      }
      
      // ✅ PRIORITAS 5: PLD v17
      if (window.pageLevelDetectorV17 && typeof window.pageLevelDetectorV17.detect === 'function') {
        try {
          const pageLevel = window.pageLevelDetectorV17.detect();
          console.log(`[Schema v5.1] Page Level dari PLD v17.0: ${pageLevel}`);
          return pageLevel;
        } catch(e) { console.warn(`PLD v17.0 error: ${e.message}`); }
      }
      
      // ✅ PRIORITAS 6: PLD legacy
      if (window.pageLevelDetector && typeof window.pageLevelDetector.detect === 'function') {
        try {
          const pageLevel = window.pageLevelDetector.detect();
          console.log(`[Schema v5.1] Page Level dari PLD legacy: ${pageLevel}`);
          return pageLevel;
        } catch(e) { console.warn(`PLD legacy error: ${e.message}`); }
      }
      
      // ✅ CEK DARI BODY ATTRIBUTE
      const bodyPageLevel = document.body.getAttribute('data-page-level') || 
                            document.body.getAttribute('data-schema-page-level');
      if (bodyPageLevel) {
        console.log(`[Schema v5.1] Page Level dari body attribute: ${bodyPageLevel}`);
        return bodyPageLevel;
      }
      
      // ❌ FALLBACK
      console.warn("[Schema v5.1] PLD tidak tersedia, menggunakan fallback detection");
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
          console.log("[Schema v5.1] PLD ready (event)");
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
            console.log("[Schema v5.1] PLD ready (timeout)");
            resolve(true);
          } else {
            console.warn("[Schema v5.1] PLD timeout, using fallback");
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
          console.log(`[Schema v5.1] Skip Product: halaman edukasi murni (pattern: "${pattern}")`);
          return true;
        }
      }
      return false;
    }

    // ============================================================
    // GENERATE FAQ SCHEMA
    // ============================================================
    function generateFAQ(cleanUrl, title) {
      const faqItems = [];
      
      document.querySelectorAll("details, .faq-item, .accordion-item").forEach((el, i) => {
        const question = el.querySelector("summary, .question, h3, h4")?.innerText?.trim() || 
                         el.querySelector("strong")?.innerText?.trim() || 
                         `Pertanyaan ${i + 1}`;
        const answer = el.querySelector("p, .answer, .content")?.innerText?.trim() || 
                       el.innerText.replace(question, "").trim();
        
        if (question && answer && answer.length > 10) {
          faqItems.push({
            "@type": "Question",
            "name": question,
            "acceptedAnswer": { "@type": "Answer", "text": answer }
          });
        }
      });
      
      if (faqItems.length === 0) {
        const defaultFAQs = [
          { question: `Apa itu ${title.split('-')[0].trim()}?`, 
            answer: `${title.split('-')[0].trim()} adalah layanan profesional yang kami tawarkan untuk memenuhi kebutuhan konstruksi Anda.` },
          { question: "Apakah melayani seluruh Indonesia?", 
            answer: "Ya, kami melayani proyek di seluruh Indonesia dengan tenaga profesional dan material berkualitas." },
          { question: "Bagaimana cara konsultasi?", 
            answer: "Anda dapat berkonsultasi gratis melalui WhatsApp di +6283839000968." }
        ];
        defaultFAQs.forEach(faq => {
          faqItems.push({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
          });
        });
      }
      
      return {
        "@type": "FAQPage",
        "@id": cleanUrl + "#faq",
        "mainEntity": faqItems.slice(0, 7)
      };
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
      console.log("[Schema v5.1 🚀] Universal schema dijalankan");

      // ===== WAIT PLD =====
      await waitForPLD();

      // ===== LOAD PARENT MAPPING =====
      await loadExternalJS('https://raw.githack.com/aliyul/solution-blogger/main/parent-mapping.js');
      await new Promise(resolve => setTimeout(resolve, 100));

      // ===== INFORMASI DASAR =====
      const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
      const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
      const baseUrl = ogUrl || canonical || location.href;
      const cleanUrl = baseUrl.replace(/[?&]m=1/, "");

      const h1Text = document.querySelector("h1")?.innerText?.trim() || document.title;
      const title = h1Text.replace(/\s{2,}/g, " ").trim().substring(0, 120);
      
      // 🔥🔥🔥 AMBIL PAGE LEVEL DARI PLD 🔥🔥🔥
      const pageLevel = getPageLevelFromPLD();
      console.log(`[Schema v5.1] Page Level: ${pageLevel}`);

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

      // ===== PARENT URL =====
      let parentUrls = [];
      if (typeof getParentForMoneyPage === 'function') {
        const parentData = getParentForMoneyPage(cleanUrl);
        if (parentData?.parentUrl) {
          parentUrls = [{ "@type": "WebPage", "@id": parentData.parentUrl, name: parentData.parentName || "Parent Page" }];
        }
      } else if (window.PARENT_MAPPING?.[cleanUrl]) {
        const parentData = window.PARENT_MAPPING[cleanUrl];
        parentUrls = [{ "@type": "WebPage", "@id": parentData.parentUrl, name: parentData.parentName || "Parent Page" }];
      }
      
      if (parentUrls.length === 0) {
        const breadcrumbLinks = document.querySelectorAll(".breadcrumbs a, .breadcrumb a, .nav-trail a");
        if (breadcrumbLinks.length > 0) {
          const lastLink = breadcrumbLinks[breadcrumbLinks.length - 1];
          if (lastLink.href && lastLink.href !== cleanUrl) {
            parentUrls = [{ "@type": "WebPage", "@id": lastLink.href, name: lastLink.innerText?.trim() || "Parent Page" }];
          }
        }
      }
      if (parentUrls.length === 0) {
        parentUrls = [{ "@type": "WebPage", "@id": location.origin, name: "Home" }];
      }

      // ===== AREA SERVED =====
      const defaultAreaServed = [
        "DKI Jakarta", "Kabupaten Bogor", "Kota Bogor", "Kota Depok",
        "Kabupaten Tangerang", "Kota Tangerang", "Kota Tangerang Selatan",
        "Kabupaten Bekasi", "Kota Bekasi", "Kabupaten Karawang"
      ].map(a => ({ "@type": "Place", name: a }));

      function detectKnowsAbout() {
        const text = document.body.innerText.toLowerCase();
        const list = [
          { keyword: "jasa konstruksi", output: "Jasa Konstruksi" },
          { keyword: "jasa renovasi", output: "Jasa Renovasi" },
          { keyword: "jasa bongkar", output: "Jasa Bongkar Bangunan" },
          { keyword: "jasa beton cor", output: "Jasa Beton Cor" },
          { keyword: "beton precast", output: "Beton Precast" },
          { keyword: "sewa alat berat", output: "Sewa Alat Berat" },
          { keyword: "perbaikan jalan", output: "Perbaikan Jalan" }
        ];
        const found = list.filter(item => text.includes(item.keyword));
        return found.length > 0 ? found.map(item => item.output) : ["Jasa Konstruksi", "Beton Precast"];
      }

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
          knowsAbout: detectKnowsAbout()
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

      // ===== FAQ SCHEMA =====
      graph.push(generateFAQ(cleanUrl, PAGE.title));

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
        console.log(`[Schema v5.1] Product schema generated for ${pageLevel}`);
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
        `[Schema v5.1 ✅] Injected | Page: ${pageLevel} | Offers: ${tableOffers.length} | ` +
        `Product: ${isProductPage ? '✅' : '❌'} | Service: ${!isVariantPage ? '✅' : '❌'} | FAQ: ✅`
      );
    }

    // ============================================================
    // START
    // ============================================================
    if (document.querySelector("h1") && (document.querySelector(".post-body") || document.querySelector("main"))) {
      await initSchema();
    } else {
      const obs = new MutationObserver(async () => {
        if (document.querySelector("h1") && (document.querySelector(".post-body") || document.querySelector("main"))) {
          await initSchema();
          obs.disconnect();
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
    }
  }, 700);
});
</script>
