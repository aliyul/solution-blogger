document.addEventListener("DOMContentLoaded", async function () {
  setTimeout(async () => {
    console.log("[Schema Service v4.22] 🚀 Auto generator dijalankan");

    // ===== 1️⃣ URL & META =====
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const baseUrl = ogUrl || canonical || location.href;
    const cleanUrl = baseUrl.replace(/[?&]m=1/, "");

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
        description:
          "Beton Jaya Readymix melayani jasa konstruksi, pengecoran beton, precast, dan sewa alat berat di seluruh Indonesia.",
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

    // ===== 2️⃣ DATA AREA DEFAULT (Kabupaten/Kota) =====
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

    function wikiUrl(name) {
      return "https://id.wikipedia.org/wiki/" + name.replace(/\s+/g, "_");
    }

    // ===== 3️⃣ DETEKSI AREA BERDASARKAN URL & FETCH WIKIPEDIA =====
    async function detectArea(url) {
      const found = [];
      const lowerUrl = url.toLowerCase();

      for (const area in areaJSON) {
        if (lowerUrl.includes(area.toLowerCase().replace(/\s+/g, "-"))) {
          found.push({
            "@type": "Place",
            "name": area,
            "sameAs": wikiUrl(area)
          });
          found.push({
            "@type": "Place",
            "name": areaJSON[area],
            "sameAs": wikiUrl(areaJSON[area])
          });
        }
      }

      // Jika belum ditemukan, coba deteksi via Wikipedia
      if (found.length === 0) {
        const kecamatan = lowerUrl.match(/([a-z-]+)(?=-|$)/)?.[1];
        if (kecamatan) {
          try {
            const res = await fetch(`https://id.wikipedia.org/api/rest_v1/page/summary/${kecamatan}`);
            if (res.ok) {
              const data = await res.json();
              found.push({
                "@type": "Place",
                name: kecamatan.replace(/-/g, " "),
                sameAs: data.content_urls.desktop.page
              });
            }
          } catch (e) {
            console.warn("[Wikipedia Fallback] Gagal fetch:", kecamatan);
          }
        }
      }

      // fallback terakhir
      if (found.length === 0)
        found.push({
          "@type": "Place",
          name: "Indonesia",
          sameAs: "https://id.wikipedia.org/wiki/Indonesia"
        });

      // hapus duplikat
      const unique = [];
      const names = new Set();
      found.forEach(a => {
        if (!names.has(a.name)) {
          unique.push(a);
          names.add(a.name);
        }
      });
      return unique;
    }

    const areaServed = await detectArea(PAGE.url);

    // ===== 4️⃣ DETEKSI SERVICE TYPE =====
    const shortTexts = Array.from(document.querySelectorAll("p, li"))
      .map(p => p.innerText.trim())
      .filter(t => t.length < 100 && /^[A-Z]/.test(t));
    const serviceTypes = [...new Set(shortTexts.slice(0, 5))];

    // ===== 5️⃣ DETEKSI HARGA =====
    function detectPrices() {
      const text = document.body.innerText;
      const priceRegex = /Rp\s*([\d.,]+)(?:\s*[-–]\s*Rp\s*([\d.,]+))?/g;
      const prices = [];
      let match;
      while ((match = priceRegex.exec(text)) !== null) {
        const low = parseInt(match[1].replace(/[.\s]/g, ""), 10);
        const high = match[2] ? parseInt(match[2].replace(/[.\s]/g, ""), 10) : low;
        if (!isNaN(low)) prices.push({ low, high });
      }
      if (!prices.length) return null;
      const all = prices.flatMap(p => [p.low, p.high]);
      return {
        lowPrice: Math.min(...all),
        highPrice: Math.max(...all),
        offerCount: prices.length
      };
    }
    const priceData = detectPrices();

    // ===== 6️⃣ ITEM LIST (Layanan/Produk Terkait) =====
    const itemListUrls = [...new Set(
      Array.from(document.querySelectorAll("a[href*='/p/'], a[href*='/20']"))
        .map(a => a.href.replace(/[?&]m=1/, ""))
        .filter(h => h.includes(location.origin) && !h.includes("#") && h !== PAGE.url)
    )].slice(0, 15);

    function detectItemType(u) {
      const productWords = ["produk", "beton", "precast", "baja", "buis", "ready-mix"];
      return productWords.some(w => u.includes(w)) ? "Product" : "Service";
    }

    const itemListElements = await Promise.all(
      itemListUrls.map(async (u, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": detectItemType(u),
          name: u.split("/").pop().replace(/[-_]/g, " ").replace(".html", ""),
          url: u,
          provider: { "@id": PAGE.business.url + "#localbusiness" },
          areaServed: await detectArea(u)
        }
      }))
    );

    // ===== 7️⃣ BANGUN GRAPH JSON-LD =====
    const graph = [];

    // Bisnis
    graph.push({
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
    });

    // Halaman
    graph.push({
      "@type": "WebPage",
      "@id": PAGE.url + "#webpage",
      url: PAGE.url,
      name: PAGE.title,
      description: PAGE.description,
      image: PAGE.image,
      mainEntity: { "@id": PAGE.url + "#service" },
      publisher: { "@id": PAGE.business.url + "#localbusiness" }
    });

    // Service
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
        priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          .toISOString()
          .split("T")[0],
        url: PAGE.url
      };
    }
    graph.push(serviceObj);

    // Item List
    if (itemListElements.length > 1) {
      graph.push({
        "@type": "ItemList",
        name: "Daftar Layanan & Produk Terkait " + PAGE.business.name,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        numberOfItems: itemListElements.length,
        itemListElement: itemListElements
      });
    }

    // ===== 8️⃣ INJEKSI JSON-LD KE HTML =====
    const schema = { "@context": "https://schema.org", "@graph": graph };
    document.querySelector("#auto-schema-service").textContent = JSON.stringify(schema, null, 2);

    console.log(`[Schema Service v4.22] ✅ Injected: ${itemListElements.length} item list, ${areaServed.length} area`);
  }, 500);
});
