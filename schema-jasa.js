document.addEventListener("DOMContentLoaded", async function () {
  setTimeout(async () => {
    console.log("[Schema Service v4.26] 🚀 Auto generator dijalankan");

    // ========== 1️⃣ INFO HALAMAN ==========
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const baseUrl = ogUrl || canonical || location.href;
    const cleanUrl = baseUrl.replace(/[?&]m=1/, "");
    const lowerUrl = cleanUrl.toLowerCase();

    const PAGE = {
      url: cleanUrl,
      title: document.querySelector("h1")?.textContent?.trim() || document.title.trim(),
      description:
        document.querySelector('meta[name="description"]')?.content?.trim() ||
        document.querySelector("article p, main p, .post-body p")?.innerText?.substring(0, 300) ||
        document.title,
      image:
        document.querySelector('meta[property="og:image"]')?.content ||
        document.querySelector("article img, main img, .post-body img")?.src ||
        "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png",
      business: {
        name: "Beton Jaya Readymix",
        url: "https://www.betonjayareadymix.com",
        telephone: "+6283839000968",
        openingHours: "Mo-Sa 08:00-17:00",
        description: "Beton Jaya Readymix melayani jasa konstruksi, pengecoran beton, precast, dan sewa alat berat di seluruh Indonesia.",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Bogor",
          addressRegion: "Jawa Barat",
          addressCountry: "ID"
        },
        sameAs: [
          "https://www.facebook.com/betonjayareadymix",
          "https://www.instagram.com/betonjayareadymix"
        ]
      }
    };

    // ========== 2️⃣ AREA DEFAULT JSON ==========
    const areaJSON = {
      "Kabupaten Karawang": "Jawa Barat",
      "Kabupaten Bogor": "Jawa Barat",
      "Kabupaten Bekasi": "Jawa Barat",
      "Kota Bekasi": "Jawa Barat",
      "Kota Depok": "Jawa Barat",
      "Kota Bogor": "Jawa Barat",
      "Kabupaten Tangerang": "Banten",
      "Kota Tangerang": "Banten",
      "Kota Tangerang Selatan": "Banten",
      "Kabupaten Serang": "Banten",
      "Kota Serang": "Banten",
      "Kota Cilegon": "Banten",
      "DKI Jakarta": "DKI Jakarta"
    };

    const wikiUrl = n => "https://id.wikipedia.org/wiki/" + n.replace(/\s+/g, "_");

    // ========== 3️⃣ DETEKSI AREA ==========
    async function detectArea(url, title = "") {
      const found = [];
      const lower = (url + " " + title).toLowerCase();

      // — cari langsung di areaJSON
      for (const area in areaJSON) {
        if (lower.includes(area.toLowerCase().replace(/\s+/g, "-")) || lower.includes(area.toLowerCase())) {
          found.push({ "@type": "Place", name: area, sameAs: wikiUrl(area) });
          found.push({ "@type": "Place", name: areaJSON[area], sameAs: wikiUrl(areaJSON[area]) });
        }
      }

      // — jika tidak ketemu, cari kecamatan (via regex)
      if (found.length === 0) {
        const match = lower.match(/([a-z]+(?:-[a-z]+){0,2})(?=\.html|$)/);
        const kecamatan = match ? match[1].replace(/-/g, " ") : null;
        if (kecamatan) {
          const cacheKey = "areaCache_" + kecamatan;
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < 30 * 24 * 60 * 60 * 1000) {
              return data;
            }
          }

          try {
            const res = await fetch(`https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(kecamatan)}`);
            if (res.ok) {
              const data = await res.json();
              if (data?.title && data?.content_urls?.desktop?.page) {
                const info = [{
                  "@type": "Place",
                  name: data.title,
                  sameAs: data.content_urls.desktop.page
                }];
                localStorage.setItem(cacheKey, JSON.stringify({ data: info, timestamp: Date.now() }));
                return info;
              }
            }
          } catch (e) {
            console.warn("[Wikipedia gagal untuk]", kecamatan);
          }
        }
      }

      // fallback: Indonesia
      if (found.length === 0) {
        found.push({
          "@type": "Place",
          name: "Indonesia",
          sameAs: "https://id.wikipedia.org/wiki/Indonesia"
        });
      }

      // unik
      const unique = [];
      const names = new Set();
      for (const a of found) {
        if (!names.has(a.name)) {
          unique.push(a);
          names.add(a.name);
        }
      }
      return unique;
    }

    const areaServed = await detectArea(PAGE.url, PAGE.title);

    // ========== 4️⃣ SERVICE TYPE ==========
    const shortTexts = Array.from(document.querySelectorAll("p, li"))
      .map(p => p.innerText.trim())
      .filter(t => t.length < 100 && /^[A-Z]/.test(t));
    const serviceTypes = [...new Set(shortTexts.slice(0, 5))];

    // ========== 5️⃣ HARGA ==========
    function detectPrices() {
      const text = document.body.innerText;
      const priceRegex = /Rp\s*([\d.,]+)/g;
      const values = [];
      let m;
      while ((m = priceRegex.exec(text))) {
        const num = parseInt(m[1].replace(/[.\s]/g, ""), 10);
        if (!isNaN(num)) values.push(num);
      }
      if (!values.length) return null;
      return {
        lowPrice: Math.min(...values),
        highPrice: Math.max(...values),
        offerCount: values.length
      };
    }
    const priceData = detectPrices();

    // ========== 6️⃣ ITEM LIST ==========
    const itemListUrls = [...new Set(
      Array.from(document.querySelectorAll("a[href*='/p/'], a[href*='/20']"))
        .map(a => a.href.replace(/[?&]m=1/, ""))
        .filter(h => h.includes(location.origin) && !h.includes("#") && h !== PAGE.url)
    )].slice(0, 15);

    async function detectItemType(u) {
      const productWords = ["produk", "beton", "precast", "baja", "buis", "ready-mix"];
      return productWords.some(w => u.includes(w)) ? "Product" : "Service";
    }

    const itemListElements = await Promise.all(
      itemListUrls.map(async (u, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": await detectItemType(u),
          name: u.split("/").pop().replace(/[-_]/g, " ").replace(".html", ""),
          url: u,
          provider: { "@id": PAGE.business.url + "#localbusiness" },
          areaServed: await detectArea(u)
        }
      }))
    );

    // ========== 7️⃣ BUILD GRAPH ==========
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
        sameAs: PAGE.business.sameAs
      },
      {
        "@type": "WebPage",
        "@id": PAGE.url + "#webpage",
        url: PAGE.url,
        name: PAGE.title,
        description: PAGE.description,
        image: PAGE.image,
        mainEntity: { "@id": PAGE.url + "#service" },
        publisher: { "@id": PAGE.business.url + "#localbusiness" }
      }
    ];

    const serviceObj = {
      "@type": "Service",
      "@id": PAGE.url + "#service",
      name: PAGE.title,
      description: PAGE.description,
      image: PAGE.image,
      serviceType: serviceTypes,
      areaServed,
      provider: { "@id": PAGE.business.url + "#localbusiness" },
      brand: { "@type": "Brand", name: PAGE.business.name }
    };

    if (priceData) {
      serviceObj.offers = {
        "@type": "AggregateOffer",
        priceCurrency: "IDR",
        lowPrice: priceData.lowPrice,
        highPrice: priceData.highPrice,
        offerCount: priceData.offerCount,
        availability: "https://schema.org/InStock",
        priceValidUntil: new Date().toISOString().split("T")[0],
        url: PAGE.url
      };
    }

    graph.push(serviceObj);

    if (itemListElements.length > 1) {
      graph.push({
        "@type": "ItemList",
        name: "Daftar Layanan & Produk Terkait " + PAGE.business.name,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        numberOfItems: itemListElements.length,
        itemListElement: itemListElements
      });
    }

    // ========== 8️⃣ OUTPUT ==========
    const schema = { "@context": "https://schema.org", "@graph": graph };
    document.querySelector("#auto-schema-service").textContent = JSON.stringify(schema, null, 2);

    console.log(`[Schema Service v4.26] ✅ Injected: ${itemListElements.length} item, ${areaServed.length} area terdeteksi`);
  }, 500);
});
