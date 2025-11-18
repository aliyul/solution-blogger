<!-- ⚡ AUTO SCHEMA UNIVERSAL v4.63-Fix — Fully Validated for Google 2025 -->
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(async () => {
    let schemaInjected = false;

    async function initSchema() {
      if (schemaInjected) return;
      schemaInjected = true;
      console.log("[Schema v4.63-Fix 🚀] Universal schema dijalankan");

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
         2️⃣ PARENT URL
      ============================================================ */
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
      const parentUrls = detectParentUrls();

      /* ============================================================
         3️⃣ AREA SERVED DEFAULT
      ============================================================ */
      const areaProv = {
        "Kabupaten Bogor": "Jawa Barat",
        "Kota Bogor": "Jawa Barat",
        "Kota Depok": "Jawa Barat",
        "Kota Bekasi": "Jawa Barat",
        "Kabupaten Bekasi": "Jawa Barat",
        "Kota Serang": "Banten",
        "Kota Tangerang": "Banten",
        "Kota Tangerang Selatan": "Banten",
        "DKI Jakarta": "DKI Jakarta",
      };
      const defaultAreaServed = Object.keys(areaProv).map((a) => ({ "@type": "Place", name: a }));

      /* ============================================================
         4️⃣ DETEKSI KNOWSABOUT (fix)
      ============================================================ */
      function detectKnowsAbout() {
        const text = document.body.innerText.toLowerCase();
        const list = [
          "jasa konstruksi",
          "jasa renovasi",
          "jasa bongkar",
          "jasa beton cor",
          "beton precast",
          "sewa alat berat",
          "pembuatan saluran",
          "perbaikan jalan",
        ];
        const found = list.filter((k) => text.includes(k.split(" ")[0]));
        return found.length ? found.map(t => t.replace(/\b\w/g, c => c.toUpperCase())) 
                            : ["Jasa Konstruksi", "Sewa Alat Berat", "Jasa Beton Cor"];
      }

      /* ============================================================
         5️⃣ DETEKSI SERVICETYPE CLEAN
      ============================================================ */
      function detectServiceType() {
        let clean = h1Text
          .replace(/[:;,]+/g, "")          // hilangkan colon & double comma
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

      function addOffer(name, key, price, desc = "") {
        if (!price) return;
        const idKey = `${name}|${key}|${price}`;
        if (seenItems.has(idKey)) return;
        seenItems.add(idKey);

        let validUntil;
        if (window.AEDMetaDates?.nextUpdate) {
          //validUntil = new Date(window.AEDMetaDates.nextUpdate).toISOString().split("T")[0];
          validUntil = window.AEDMetaDates.nextUpdate;
           console.log("📅 validUntilMeta:", validUntil);
        } else {
          const f = new Date();
          f.setDate(f.getDate() + 180);
          validUntil = f.toISOString().split("T")[0];
          console.log("📅 validUntilNew:", validUntil);
        }

        tableOffers.push({
          "@type": "Offer",
          name,
          url: cleanUrl,
          priceCurrency: "IDR",
          price: price.toString(),
          itemCondition: "https://schema.org/NewCondition",
          availability: "https://schema.org/InStock",
          priceValidUntil: validUntil,
          seller: { "@id": PAGE.business.url + "#localbusiness" },
          description: desc || undefined,
        });
      }

      document.querySelectorAll("table tr, li, p").forEach((el) => {
        const m = el.innerText.match(/Rp\s*([\d.,]+)/);
        if (m) {
          const price = parseInt(m[1].replace(/[^\d]/g, ""));
          if (price > 10000 && price < 1000000000) {
            const name = el.innerText.split("Rp")[0].trim() || PAGE.title;
            addOffer(name, "", price);
          }
        }
      });

      const isProductPage = tableOffers.length > 0;

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
        /* === LocalBusiness === */
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

        /* === WebPage === */
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

      /* === Service Node === */
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

      /* === Jika halaman ada harga → buat Product + AggregateOffer Valid === */
      if (isProductPage) {
        const lowPrice = Math.min(...tableOffers.map((o) => parseInt(o.price)));
        const highPrice = Math.max(...tableOffers.map((o) => parseInt(o.price)));

        serviceNode.offers = {
          "@type": "AggregateOffer",
          lowPrice,
          highPrice,
          offerCount: tableOffers.length,
          priceCurrency: "IDR",
          offers: tableOffers,
        };

        /* --- FIX MAJOR ERROR: Product.offers MUST NOT USE @id --- */
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
            lowPrice,
            highPrice,
            offerCount: tableOffers.length,
            priceCurrency: "IDR",
            offers: tableOffers,
          },
        });
      }

      graph.push(serviceNode);

      /* === ItemList if exists === */
      if (internalLinks.length)
        graph.push({
          "@type": "ItemList",
          "@id": cleanUrl + "#related-links",
          name: "Halaman Terkait",
          itemListOrder: "Ascending",
          numberOfItems: internalLinks.length,
          itemListElement: internalLinks,
        });

      /* ============================================================
         9️⃣ INJECT SCHEMA
      ============================================================ */
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
        `[Schema v4.63-Fix ✅ Injected | Offers: ${tableOffers.length} | Mode: ${
          isProductPage ? "Service + Product" : "Service / Info"
        }]`
      );
    }

    /* ============================================================
       🔟 OBSERVER
    ============================================================ */
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
