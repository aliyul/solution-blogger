/* ⚡ AUTO SCHEMA UNIVERSAL v4.56 FINAL — Hybrid Service + Product + Universal Page | Beton Jaya Readymix */
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(async () => {
    let schemaInjected = false;

    async function initSchema() {
      if (schemaInjected) return;
      schemaInjected = true;
      console.log("[Schema v4.56 🚀] Universal auto generator dijalankan");

      // === 1️⃣ INFO HALAMAN DASAR ===
      const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
      const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
      const baseUrl = ogUrl || canonical || location.href;
      const cleanUrl = baseUrl.replace(/[?&]m=1/, "");
      const titleRaw = document.querySelector("h1")?.innerText?.trim() || document.title.trim();
      const title = titleRaw.replace(/\s{2,}/g, " ").trim().substring(0, 120);

      const PAGE = {
        url: cleanUrl,
        title: titleRaw,
        description:
          document.querySelector('meta[name="description"]')?.content?.trim() ||
          document.querySelector("article p, main p, .post-body p")?.innerText?.substring(0, 200) ||
          document.title,
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

      // === 2️⃣ PARENT DETECTION (Breadcrumb & Meta) ===
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
      const cleanParentUrls = parentUrls.map((u) => u["@id"]);

      // === 3️⃣ AREA SERVED ===
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

      // === 4️⃣ KNOWS ABOUT & SERVICE TYPE ===
      function detectKnowsAbout() {
        const contentText =
          (document.querySelector("article") ||
            document.querySelector(".post-body") ||
            document.body
          ).innerText.toLowerCase() || "";
        const words = contentText.match(/\b[a-z]{4,}\b/g) || [];
        const common = new Set(["untuk", "yang", "pada", "kami", "dengan", "adalah", "dalam", "dan", "dapat", "jasa", "produk"]);
        const freq = {};
        words.forEach((w) => {
          if (!common.has(w)) freq[w] = (freq[w] || 0) + 1;
        });
        return Object.entries(freq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));
      }

      function detectServiceType() {
        const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
        return h1.replace(/202\d|harga|murah|terdekat|resmi|berkualitas|profesional/gi, "").trim();
      }

      // === 5️⃣ PRODUK DETECTION (optional) ===
      const seenItems = new Set();
      const tableOffers = [];
      function addOffer(name, key, price, desc = "") {
        if (!price) return;
        const finalName = name || PAGE.title;
        const k = `${finalName}|${key}|${price}`;
        if (seenItems.has(k)) return;
        seenItems.add(k);

        let validUntil = "";
        if (window.AEDMetaDates?.nextUpdate)
          validUntil = new Date(window.AEDMetaDates.nextUpdate).toISOString().split("T")[0];
        else {
          const fallback = new Date();
          fallback.setDate(fallback.getDate() + 90);
          validUntil = fallback.toISOString().split("T")[0];
        }

        tableOffers.push({
          "@type": "Offer",
          name: finalName,
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

      // === Auto detect harga dari tabel ===
      document.querySelectorAll("table tr").forEach((row) => {
        const m = row.innerText.match(/Rp\s*([\d.,]+)/);
        if (m) {
          const name = row.querySelector("td,th")?.innerText.trim() || PAGE.title;
          const price = parseInt(m[1].replace(/[^\d]/g, ""));
          if (price > 10000 && price < 1000000000) addOffer(name, "", price);
        }
      });

      const isProductPage = tableOffers.length > 0;

      // === 6️⃣ INTERNAL LINKS ===
      function generateInternalLinks() {
        const links = Array.from(document.querySelectorAll("a"))
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

      // === 7️⃣ BUILD GRAPH ===
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
          isPartOf: cleanParentUrls.map((u) => ({ "@id": u + "#webpage" })),
          publisher: { "@id": PAGE.business.url + "#localbusiness" },
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
        serviceNode.offers = {
          "@type": "AggregateOffer",
          lowPrice: Math.min(...tableOffers.map((o) => parseInt(o.price))),
          highPrice: Math.max(...tableOffers.map((o) => parseInt(o.price))),
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
          offers: tableOffers,
        });
      }

      graph.push(serviceNode);

      if (internalLinks.length)
        graph.push({
          "@type": "ItemList",
          "@id": cleanUrl + "#internal-links",
          name: "Halaman Terkait",
          itemListElement: internalLinks,
        });

      // === 8️⃣ INJECT SCHEMA ===
      const schema = { "@context": "https://schema.org", "@graph": graph };
      let el = document.querySelector("#auto-schema-service");
      if (!el) {
        el = document.createElement("script");
        el.id = "auto-schema-service";
        el.type = "application/ld+json";
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(schema, null, 2);
      console.log(`[Schema v4.56 ✅] Injected | Offers: ${tableOffers.length} | Type: ${isProductPage ? "Product+Service" : "Service Only"}`);
    }

    // Observer jika H1 dan konten muncul belakangan (SPA/Blogger)
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
  }, 600);
});

