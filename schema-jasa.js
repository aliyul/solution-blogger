<!-- ⚡ AUTO SCHEMA UNIVERSAL v5.0 — Fixed Variant & Sub-Variant Support -->
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
          console.warn("[Schema v5.0] Gagal load parent mapping:", src);
          resolve();
        };
        document.head.appendChild(s);
      });
    }

    // ============================================================
    // DETEKSI PAGE LEVEL
    // ============================================================
    function detectPageLevel() {
      const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
      const title = document.title.toLowerCase();
      const url = location.href.toLowerCase();
      
      // 🔥 DETEKSI VARIANT (prioritas tinggi)
      const variantPatterns = [
        "spesifikasi", "ukuran", "dimensi", "varian", "polosan", 
        "motif", "custom", "tinggi", "rendah", "tipe"
      ];
      
      for (let pattern of variantPatterns) {
        if (h1.includes(pattern) || title.includes(pattern) || url.includes(pattern)) {
          const subVariantPatterns = ["detail", "lengkap", "spesifikasi teknis", "ukuran detail"];
          for (let sub of subVariantPatterns) {
            if (h1.includes(sub) || title.includes(sub)) return "sub-variant";
          }
          return "variant";
        }
      }
      
      // DETEKSI MONEY CHILD (lokasi)
      const locations = ["jakarta", "bekasi", "bogor", "depok", "tangerang", "karawang", "surabaya", "bandung", "cirebon", "ciamis"];
      for (let loc of locations) {
        if (h1.includes(loc) || title.includes(loc) || url.includes(loc)) return "money-child";
      }
      
      // DETEKSI MONEY PAGE (harga)
      if (/\b(harga|biaya|tarif)\b/i.test(h1 + title)) return "money-page";
      
      // DETEKSI MONEY MASTER
      if (/\b(jasa|sewa|borongan)\b/i.test(h1 + title) && !/\b(panduan|tips|cara)\b/i.test(h1 + title)) return "money-master";
      
      // DETEKSI SUB-PILLAR
      if (/\b(daftar|jenis|kategori)\b/i.test(h1 + title)) return "sub-pillar-tipe-2";
      if (/\b(perbandingan|vs|versus)\b/i.test(h1 + title)) return "sub-pillar-tipe-1";
      
      return "pillar";
    }

    // ============================================================
    // CEK APAKAH SKIP PRODUCT (HANYA UNTUK EDUKASI MURNI)
    // ============================================================
    function shouldSkipProductSchema(pageLevel) {
      // Variant TIDAK PERNAH skip
      if (pageLevel === 'variant' || pageLevel === 'sub-variant') return false;
      
      // Money pages TIDAK PERNAH skip
      if (['money-master', 'money-page', 'money-child'].includes(pageLevel)) return false;
      
      // Hanya Pillar & SP yang mungkin skip
      const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
      const title = document.title.toLowerCase();
      
      // Cek apakah murni edukasi
      const edukasiPatterns = [
        "panduan", "cara memilih", "tips memilih", "langkah memilih",
        "pengertian", "definisi", "apa itu"
      ];
      
      for (let pattern of edukasiPatterns) {
        if (h1.includes(pattern) || title.includes(pattern)) {
          console.log(`[Schema v5.0] Skip Product: halaman edukasi murni (pattern: "${pattern}")`);
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
      
      // Fallback FAQ
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

    async function initSchema() {
      if (schemaInjected) return;
      schemaInjected = true;
      console.log("[Schema v5.0 🚀] Universal schema dijalankan");

      // Load parent mapping
      await loadExternalJS('https://raw.githack.com/aliyul/solution-blogger/main/parent-mapping.js');
      await new Promise(resolve => setTimeout(resolve, 100));

      // ============================================================
      // 1️⃣ INFORMASI DASAR
      // ============================================================
      const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
      const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
      const baseUrl = ogUrl || canonical || location.href;
      const cleanUrl = baseUrl.replace(/[?&]m=1/, "");

      const h1Text = document.querySelector("h1")?.innerText?.trim() || document.title;
      const title = h1Text.replace(/\s{2,}/g, " ").trim().substring(0, 120);
      
      const pageLevel = detectPageLevel();
      console.log(`[Schema v5.0] Page Level terdeteksi: ${pageLevel}`);

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

      // ============================================================
      // 2️⃣ PARENT URL
      // ============================================================
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

      // ============================================================
      // 3️⃣ AREA SERVED & KNOWSABOUT
      // ============================================================
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

      // ============================================================
      // 4️⃣ DETEKSI HARGA (untuk money pages)
      // ============================================================
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
      if (!skipProduct && ['money-master', 'money-page', 'money-child'].includes(pageLevel)) {
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

      // ============================================================
      // 5️⃣ INTERNAL LINKS
      // ============================================================
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

      // ============================================================
      // 6️⃣ BUILD GRAPH JSON-LD
      // ============================================================
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

      // ============================================================
      // 7️⃣ FAQ SCHEMA (WAJIB SEMUA PAGE)
      // ============================================================
      graph.push(generateFAQ(cleanUrl, PAGE.title));

      // ============================================================
      // 8️⃣ PRODUCT SCHEMA (UNTUK VARIANT, SUB-VARIANT, & MONEY PAGES)
      // ============================================================
      const isVariantPage = (pageLevel === 'variant' || pageLevel === 'sub-variant');
      const isMoneyPage = ['money-master', 'money-page', 'money-child'].includes(pageLevel);
      const isProductPage = !skipProduct && (isVariantPage || isMoneyPage || tableOffers.length > 0);

      if (isProductPage) {
        const productNode = {
          "@type": "Product",
          "@id": cleanUrl + "#product",
          name: PAGE.title,
          description: PAGE.description,
          image: [PAGE.image],
          brand: { "@type": "Brand", name: PAGE.business.name },
          category: "ConstructionProduct"
        };
        
        // Tambahkan properti khusus untuk Variant
        if (isVariantPage) {
          productNode.productType = pageLevel === 'variant' ? "Variant" : "Sub-Variant";
          productNode.material = "Beton Precast";
          productNode.manufacturer = { "@type": "Organization", name: PAGE.business.name };
          
          // Coba ambil spesifikasi dari konten
          const specText = document.querySelector(".post-body, article, main")?.innerText || "";
          const sizes = specText.match(/\d{1,3}\s*x\s*\d{1,3}/g);
          if (sizes?.length > 0) {
            productNode.variant = { "@type": "ProductVariant", size: sizes[0] };
          }
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
        console.log(`[Schema v5.0] Product schema generated for ${pageLevel}`);
      }

      // ============================================================
      // 9️⃣ SERVICE SCHEMA (TIDAK UNTUK VARIANT)
      // ============================================================
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

      // ============================================================
      // 🔟 RELATED LINKS
      // ============================================================
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

      // ============================================================
      // 11️⃣ INJECT SCHEMA
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
        `[Schema v5.0 ✅] Injected | Page: ${pageLevel} | Offers: ${tableOffers.length} | ` +
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
