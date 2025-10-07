document.addEventListener("DOMContentLoaded", async function () {
  setTimeout(async () => {
    console.log("[Schema Service v4.27] 🚀 Auto generator dijalankan");

    // ========== 1️⃣ INFO DASAR HALAMAN ==========
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
        document.querySelector("article p, main p, .post-body p")?.innerText?.substring(0, 200) ||
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
        description: "Beton Jaya Readymix melayani jasa konstruksi, beton cor, precast, dan sewa alat berat di seluruh Indonesia.",
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

    // ========== 2️⃣ AREA DEFAULT & WIKI URL ==========
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

    const defaultAreaServed = [
      { "@type": "Place", name: "Kabupaten Bogor", sameAs: "https://id.wikipedia.org/wiki/Kabupaten_Bogor" },
      { "@type": "Place", name: "Kota Depok", sameAs: "https://id.wikipedia.org/wiki/Kota_Depok" },
      { "@type": "Place", name: "Kabupaten Tangerang", sameAs: "https://id.wikipedia.org/wiki/Kabupaten_Tangerang" },
      { "@type": "Place", name: "Kabupaten Karawang", sameAs: "https://id.wikipedia.org/wiki/Kabupaten_Karawang" },
      { "@type": "Place", name: "Kabupaten Serang", sameAs: "https://id.wikipedia.org/wiki/Kabupaten_Serang" },
      { "@type": "Place", name: "Kota Serang", sameAs: "https://id.wikipedia.org/wiki/Kota_Serang" },
      { "@type": "Place", name: "Kota Cilegon", sameAs: "https://id.wikipedia.org/wiki/Kota_Cilegon" },
      { "@type": "Place", name: "DKI Jakarta", sameAs: "https://id.wikipedia.org/wiki/DKI_Jakarta" }
    ];

    const wikiUrl = n => "https://id.wikipedia.org/wiki/" + n.replace(/\s+/g, "_");

    // ========== 3️⃣ DETEKSI AREA SERVED ==========
    async function detectArea(url, title = "") {
      const found = [];
      const lower = (url + " " + title).toLowerCase();

      // deteksi kabupaten/kota dari areaJSON
      for (const area in areaJSON) {
        const slug = area.toLowerCase().replace(/\s+/g, "-");
        if (lower.includes(slug) || lower.includes(area.toLowerCase())) {
          found.push({ "@type": "Place", name: area, sameAs: wikiUrl(area) });
          found.push({ "@type": "Place", name: areaJSON[area], sameAs: wikiUrl(areaJSON[area]) });
        }
      }

      // fallback default jika tak ada nama daerah
      if (found.length === 0) {
        console.warn("[AutoSchema] ⚠️ Tidak ditemukan nama daerah dalam URL — gunakan defaultAreaServed");
        return defaultAreaServed;
      }

      // hapus duplikat
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

    // ========== 4️⃣ DETEKSI SERVICE TYPE ==========
    function detectServiceType() {
      const baseTitle = PAGE.title.toLowerCase();
      const words = [
        "sewa excavator", "sewa alat berat", "jasa borongan", "jasa cor beton", 
        "jasa bongkar", "jasa renovasi", "jasa pancang", "jasa kontraktor",
        "jasa puing", "jasa proyek", "rental alat berat"
      ];
      const matched = words.filter(w => baseTitle.includes(w));
      if (matched.length) return matched;
      if (baseTitle.includes("sewa")) return ["Sewa Alat Berat"];
      if (baseTitle.includes("borongan")) return ["Jasa Borongan Konstruksi"];
      if (baseTitle.includes("beton")) return ["Jasa Beton Cor"];
      return ["Jasa Konstruksi Umum"];
    }
    const serviceTypes = detectServiceType();

    // ========== 5️⃣ DETEKSI HARGA ==========
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

    // ========== 6️⃣ BUILD GRAPH ==========
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
      },
      {
        "@type": "Service",
        "@id": PAGE.url + "#service",
        name: PAGE.title,
        description: PAGE.description,
        image: PAGE.image,
        serviceType: serviceTypes,
        areaServed,
        provider: { "@id": PAGE.business.url + "#localbusiness" },
        brand: { "@type": "Brand", name: PAGE.business.name }
      }
    ];

    if (priceData) {
      graph[2].offers = {
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

    // ========== 7️⃣ OUTPUT ==========
    const schema = { "@context": "https://schema.org", "@graph": graph };
    document.querySelector("#auto-schema-service").textContent = JSON.stringify(schema, null, 2);
    console.log(`[Schema Service v4.27] ✅ Injected! serviceType: ${serviceTypes.join(", ")} | area: ${areaServed.length}`);
  }, 500);
});
