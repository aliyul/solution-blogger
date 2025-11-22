<!-- ⚡ AUTO SCHEMA UNIVERSAL v4.63-Fix2 — Fully Google Valid 2025 -->
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(async () => {
    let schemaInjected = false;

    async function initSchema() {
      if (schemaInjected) return;
      schemaInjected = true;
      console.log("[Schema v4.63-Fix2 🚀] Universal schema dijalankan");

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
         3️⃣ DETEKSI SERVICETYPE
      ============================================================ */
      function detectServiceType() {
        let clean = h1Text
          .replace(/[:;,]+/g, "")
          .replace(/\s{2,}/g, " ")
          .trim();
        return clean.charAt(0).toUpperCase() + clean.slice(1);
      }

      /* ============================================================
         4️⃣ DETEKSI HARGA — REPAIRED
      ============================================================ */
      const seenItems = new Set();
      const tableOffers = [];

      function addOffer(name, key, price, desc = "") {
        if (!price) return;
        const idKey = `${name}|${key}|${price}`;
        if (seenItems.has(idKey)) return;
        seenItems.add(idKey);

        tableOffers.push({
          "@type": "Offer",
          name,
          url: cleanUrl,
          priceCurrency: "IDR",
          price: price, /* FIX → NUMBER */
          itemCondition: "https://schema.org/NewCondition",
          availability: "https://schema.org/InStock",
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
         5️⃣ GRAPH
      ============================================================ */
      const graph = [
        {
          "@type": ["LocalBusiness", "GeneralContractor"],
          "@id": PAGE.business.url + "#localbusiness",
          name: PAGE.business.name,
          url: PAGE.business.url,
        },
        {
          "@type": "WebPage",
          "@id": cleanUrl + "#webpage",
          url: cleanUrl,
          name: PAGE.title,
          description: PAGE.description,
        },
      ];

      const serviceNode = {
        "@type": "Service",
        "@id": cleanUrl + "#service",
        name: PAGE.title,
        description: PAGE.description,
        serviceType: detectServiceType(),
        provider: { "@id": PAGE.business.url + "#localbusiness" },
        mainEntityOfPage: { "@id": cleanUrl + "#webpage" },
      };

      if (isProductPage) {
        const lowPrice = Math.min(...tableOffers.map((o) => o.price));
        const highPrice = Math.max(...tableOffers.map((o) => o.price));

        /* === SERVICE → OFFER SIMPLE === */
        serviceNode.offers = {
          "@type": "Offer",
          priceCurrency: "IDR",
          price: lowPrice,
          availability: "https://schema.org/InStock",
          seller: { "@id": PAGE.business.url + "#localbusiness" },
        };

        /* === PRODUCT → AGG OFFER FULL === */
        graph.push({
          "@type": "Product",
          "@id": cleanUrl + "#product",
          name: PAGE.title,
          description: PAGE.description,
          brand: { "@type": "Brand", name: PAGE.business.name },
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

      /* inject */
      const schema = { "@context": "https://schema.org", "@graph": graph };
      let el = document.querySelector("#auto-schema-service");
      if (!el) {
        el = document.createElement("script");
        el.id = "auto-schema-service";
        el.type = "application/ld+json";
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(schema, null, 2);
    }

    await initSchema();
  }, 700);
});
