<!-- ⚡ AUTO SCHEMA UNIVERSAL v4.72 — With External Parent Mapping + Breadcrumb Fallback — Fully Validated Google 2025 -->
<script>
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(async () => {
    let schemaInjected = false;

    // ============================================================
    // FUNGSI LOAD EXTERNAL JS (PARENT MAPPING)
    // ============================================================
    function loadExternalJS(src) {
      return new Promise((resolve) => {
        // Cek apakah sudah ter-load sebelumnya
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }

        const s = document.createElement("script");
        s.src = src;
        s.defer = true;
        s.onload = resolve;
        s.onerror = () => {
          console.warn("[Schema v4.72] Gagal load parent mapping:", src);
          resolve(); // ❗ jangan reject, biarkan proses tetap jalan
        };
        document.head.appendChild(s);
      });
    }

    // ============================================================
    // CEK APAKAH Halaman EDUKASI (SKIP PRODUCT SCHEMA)
    // ============================================================
    function shouldSkipProductSchema() {
      const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
      const title = document.title.toLowerCase();
      const url = location.href.toLowerCase();
      
      // Pola halaman edukasi (PILLAR, SUB1, panduan)
      const skipPatterns = [
        "panduan", "cara memilih", "tips memilih", "langkah memilih",
        "pengertian", "definisi", "apa itu", "perbedaan", "kelebihan",
        "kekurangan", "spesifikasi", "jenis", "tipe", "varian"
      ];
      
      for (let pattern of skipPatterns) {
        if (h1.includes(pattern) || title.includes(pattern) || url.includes(pattern)) {
          console.log(`[Schema v4.72] Skip Product schema: halaman edukasi (pattern: "${pattern}")`);
          return true;
        }
      }
      
      return false;
    }

    async function initSchema() {
      if (schemaInjected) return;
      schemaInjected = true;
      console.log("[Schema v4.72 🚀] Universal schema dijalankan");

      // ============================================================
      // LOAD PARENT MAPPING DARI EXTERNAL (GitHub)
      // ============================================================
      await loadExternalJS('https://raw.githack.com/aliyul/solution-blogger/main/parent-mapping.js');
      
      // Tunggu sebentar agar variabel global tersedia
      await new Promise(resolve => setTimeout(resolve, 100));

      /* ============================================================
         1️⃣ INFORMASI DASAR HALAMAN
      ============================================================ */
      const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
      const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
      const baseUrl = ogUrl || canonical || location.href;
      const cleanUrl = baseUrl.replace(/[?&]m=1/, "");

      const h1Text = document.querySelector("h1")?.innerText?.trim() || document.title;
      const title = h1Text.replace(/\s{2,}/g, " ").trim().substring(0, 120);

      const PAGE = {
        url: cleanUrl,
        title,
        description:
          document.querySelector('meta[name="description"]')?.content?.trim() ||
          document.querySelector("article p, main p, .post-body p")?.innerText?.substring(0, 200) ||
          title,
        image:
          document.querySelector('meta[property="og:image"]')?.content ||
          document.querySelector("article img, main img, .post-body img")?.getAttribute("src") ||
          "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png",
        business: {
          name: "Beton Jaya Readymix",
          url: "https://www.betonjayareadymix.com",
          telephone: "+6283839000968",
          openingHours: "Mo-Sa 08:00-17:00",
          description:
            "Beton Jaya Readymix melayani jasa konstruksi, beton cor, precast, dan sewa alat berat di seluruh Indonesia.",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Bogor",
            addressRegion: "Jawa Barat",
            addressCountry: "ID",
          },
          sameAs: [
            "https://www.facebook.com/betonjayareadymix",
            "https://www.instagram.com/betonjayareadymix",
          ],
        },
      };

      /* ============================================================
         2️⃣ PARENT URL — MENGGUNAKAN EXTERNAL MAPPING + BREADCRUMB FALLBACK
         ============================================================ */
      let parentUrls = [];
      let parentName = null;
      
      // 🔥 METODE 1: Ambil parent dari external mapping
      if (typeof getParentForMoneyPage === 'function') {
        const parentData = getParentForMoneyPage(cleanUrl);
        if (parentData && parentData.parentUrl) {
          parentUrls = [{ 
            "@type": "WebPage", 
            "@id": parentData.parentUrl,
            name: parentData.parentName || "Parent Page"
          }];
          parentName = parentData.parentName;
          console.log("[Schema v4.72] Parent dari external mapping:", parentData.parentUrl);
        }
      } else if (window.PARENT_MAPPING && window.PARENT_MAPPING[cleanUrl]) {
        const parentData = window.PARENT_MAPPING[cleanUrl];
        parentUrls = [{ 
          "@type": "WebPage", 
          "@id": parentData.parentUrl,
          name: parentData.parentName || "Parent Page"
        }];
        parentName = parentData.parentName;
        console.log("[Schema v4.72] Parent dari PARENT_MAPPING:", parentData.parentUrl);
      }
      
      // 🔥 METODE 2: Fallback ke breadcrumb terakhir (jika mapping tidak ditemukan)
      if (parentUrls.length === 0) {
        const breadcrumbSelectors = [
          ".breadcrumbs a",
          ".breadcrumb a",
          ".nav-trail a",
          ".breadcrumb-nav a",
          ".site-breadcrumb a",
          "[class*='breadcrumb'] a",
          "[class*='breadcrumbs'] a"
        ];
        
        let lastBreadcrumbUrl = null;
        let lastBreadcrumbText = null;
        
        for (const selector of breadcrumbSelectors) {
          const links = document.querySelectorAll(selector);
          if (links.length > 0) {
            // Ambil link terakhir (paling dekat dengan halaman saat ini)
            const lastLink = links[links.length - 1];
            if (lastLink.href && lastLink.href !== cleanUrl && lastLink.href !== location.href) {
              lastBreadcrumbUrl = lastLink.href;
              lastBreadcrumbText = lastLink.innerText?.trim();
              break;
            }
          }
        }
        
        // Cek meta tag parent-url sebagai alternatif
        if (!lastBreadcrumbUrl) {
          const metaParent = document.querySelector('meta[name="parent-url"]')?.content?.trim();
          if (metaParent) lastBreadcrumbUrl = metaParent;
        }
        
        if (lastBreadcrumbUrl) {
          parentUrls = [{ 
            "@type": "WebPage", 
            "@id": lastBreadcrumbUrl,
            name: lastBreadcrumbText || "Parent Page"
          }];
          console.log("[Schema v4.72] Fallback ke breadcrumb terakhir:", lastBreadcrumbUrl);
        }
      }
      
      // 🔥 METODE 3: Fallback terakhir ke homepage
      if (parentUrls.length === 0) {
        parentUrls = [{ 
          "@type": "WebPage", 
          "@id": location.origin,
          name: "Home"
        }];
        console.log("[Schema v4.72] Fallback ke homepage (no parent found)");
      }

      // ============================================================
      // 🔻🔻🔻 FUNGSI LAMA (DICOMMENT, SEBAGAI REFERENSI) 🔻🔻🔻
      // ============================================================
      /*
      function detectParentUrls() {
        const urls = new Set();
        document.querySelectorAll(".breadcrumbs a").forEach((a) => {
          if (a.href && a.href !== location.href) urls.add(a.href);
        });
        const metaParent = document.querySelector('meta[name="parent-url"]')?.content?.trim();
        if (metaParent) urls.add(metaParent);
        if (urls.size === 0) urls.add(location.origin);
        return Array.from(urls).map((u) => ({ "@type": "WebPage", "@id": u }));
      }
      */

      /* ============================================================
         3️⃣ AREA SERVED DEFAULT
      ============================================================ */
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
      const defaultAreaServed = Object.keys(areaProv).map((a) => ({ "@type": "Place", name: a }));

      /* ============================================================
         4️⃣ DETEKSI KNOWSABOUT
      ============================================================ */
      function detectKnowsAbout() {
        const text = document.body.innerText.toLowerCase();
        const list = [
          { keyword: "jasa konstruksi", output: "Jasa Konstruksi" },
          { keyword: "jasa renovasi", output: "Jasa Renovasi" },
          { keyword: "jasa bongkar", output: "Jasa Bongkar Bangunan" },
          { keyword: "jasa beton cor", output: "Jasa Beton Cor" },
          { keyword: "beton precast", output: "Beton Precast" },
          { keyword: "sewa alat berat", output: "Sewa Alat Berat" },
          { keyword: "pembuatan saluran", output: "Pembuatan Saluran Drainase" },
          { keyword: "perbaikan jalan", output: "Perbaikan Jalan" },
          { keyword: "jasa pondasi", output: "Jasa Pondasi" },
          { keyword: "jasa cutting beton", output: "Jasa Cutting Beton" }
        ];
        
        const found = list.filter(item => text.includes(item.keyword));
        
        if (found.length > 0) {
          return found.map(item => item.output);
        }
        
        // Default fallback yang lebih relevan
        return ["Jasa Konstruksi", "Beton Precast"];
      }

      /* ============================================================
         5️⃣ DETEKSI SERVICETYPE CLEAN
      ============================================================ */
      function detectServiceType() {
        let clean = h1Text
          .replace(/[:;,]+/g, "")
          .replace(/\b(202\d|harga|murah|terdekat|resmi|profesional|berkualitas|ahli)\b/gi, "")
          .replace(/\s{2,}/g, " ")
          .trim();
        return clean.charAt(0).toUpperCase() + clean.slice(1);
      }

      /* ============================================================
         6️⃣ DETEKSI HARGA
      ============================================================ */
      const seenItems = new Set();
      const tableOffers = [];

      function addOffer(name, price, desc = "") {
        if (!price || price <= 0) return;
        
        const idKey = `${name}|${price}`;
        if (seenItems.has(idKey)) return;
        seenItems.add(idKey);

        let validUntil;
        if (window.AEDMetaDates?.nextUpdate) {
          validUntil = window.AEDMetaDates.nextUpdate;
        } else {
          const f = new Date();
          f.setDate(f.getDate() + 180);
          validUntil = f.toISOString().split("T")[0];
        }

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
          description: desc || undefined,
        });
      }

      // Cek apakah halaman edukasi (skip Product, tetap buat Service)
      const isEdukasiPage = shouldSkipProductSchema();
      
      if (!isEdukasiPage) {
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

      const isProductPage = !isEdukasiPage && tableOffers.length > 0;

      /* ============================================================
         7️⃣ INTERNAL LINKS
      ============================================================ */
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

      /* ============================================================
         8️⃣ BANGUN GRAPH JSON-LD
      ============================================================ */
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
          knowsAbout: detectKnowsAbout(),
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
          inLanguage: "id",
        },
      ];

      const serviceNode = {
        "@type": "Service",
        "@id": cleanUrl + "#service",
        name: PAGE.title,
        description: PAGE.description,
        image: PAGE.image,
        serviceType: detectServiceType(),
        areaServed: defaultAreaServed,
        provider: { "@id": PAGE.business.url + "#localbusiness" },
        brand: { "@type": "Brand", name: PAGE.business.name },
        mainEntityOfPage: { "@id": cleanUrl + "#webpage" },
      };

      if (isProductPage) {
        const lowPrice = Math.min(...tableOffers.map((o) => o.price));
        const highPrice = Math.max(...tableOffers.map((o) => o.price));

        serviceNode.offers = {
          "@type": "AggregateOffer",
          lowPrice: lowPrice,
          highPrice: highPrice,
          offerCount: tableOffers.length,
          priceCurrency: "IDR",
          offers: tableOffers,
        };

        graph.push({
          "@type": "Product",
          "@id": cleanUrl + "#product",
          name: PAGE.title,
          description: PAGE.description,
          image: [PAGE.image],
          brand: { "@type": "Brand", name: PAGE.business.name },
          category: "ConstructionProduct",
          offers: {
            "@type": "AggregateOffer",
            lowPrice: lowPrice,
            highPrice: highPrice,
            offerCount: tableOffers.length,
            priceCurrency: "IDR",
            offers: tableOffers,
          },
        });
      }

      graph.push(serviceNode);

      if (internalLinks.length)
        graph.push({
          "@type": "ItemList",
          "@id": cleanUrl + "#related-links",
          name: "Halaman Terkait",
          itemListOrder: "Ascending",
          numberOfItems: internalLinks.length,
          itemListElement: internalLinks,
        });

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
        `[Schema v4.72 Injected | Offers: ${tableOffers.length} | Mode: ${
          isEdukasiPage ? "Edukasi (Service only)" : (isProductPage ? "Service + Product" : "Service / Info")
        } | Parent: ${parentUrls.length > 0 ? parentUrls[0]["@id"] : "none"}]`
      );
    }

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
