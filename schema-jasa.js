document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    console.log("[Schema Service] Auto generator dijalankan ✅");

    // ===== 1️⃣ DETEKSI URL BERSIH TANPA ?m=1 =====
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const baseUrl = ogUrl || canonical || location.href;
    const cleanUrl = baseUrl.replace(/[?&]m=1/, "");

    // ===== 2️⃣ KONFIGURASI DASAR HALAMAN =====
    const PAGE = {
      url: cleanUrl,
      title: document.querySelector("h1")?.textContent?.trim() || document.title.trim(),
      description: (() => {
        const meta = document.querySelector('meta[name="description"]')?.content?.trim();
        if (meta && meta.length > 40) return meta;
        const p = document.querySelector("article p, main p, .post-body p");
        return p ? p.innerText.trim().substring(0, 300) : document.title;
      })(),
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
          "Beton Jaya Readymix menyediakan jasa konstruksi, beton cor, precast, dan sewa alat berat di seluruh Indonesia.",
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
      },
      service: {
        name: document.querySelector("h1")?.textContent?.trim() || "Jasa Konstruksi Profesional",
        description:
          document.querySelector('meta[name="description"]')?.content ||
          "Layanan profesional dalam bidang konstruksi dan beton.",
        areaServed: [],
        types: []
      }
    };

    // ===== 3️⃣ DETEKSI AREA LAYANAN =====
    const AREAS = [
      "DKI Jakarta","Bekasi","Depok","Bogor","Tangerang",
      "Karawang","Serang","Cilegon","Banten","Jawa Barat"
    ];
    const url = PAGE.url.toLowerCase();
    const foundArea = AREAS.find(a =>
      url.includes(a.toLowerCase().replace(/\s+/g, "-"))
    );
    PAGE.service.areaServed = foundArea ? [foundArea] : ["Indonesia"];

    // ===== 4️⃣ DETEKSI JENIS SERVICE =====
    const shortTexts = Array.from(document.querySelectorAll("p, li"))
      .map(p => p.innerText.trim())
      .filter(t => t.length < 100 && /^[A-Z]/.test(t));
    PAGE.service.types = [...new Set(shortTexts.slice(0, 5))];

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
      if (prices.length === 0) return null;
      const all = prices.flatMap(p => [p.low, p.high]);
      return {
        lowPrice: Math.min(...all),
        highPrice: Math.max(...all),
        offerCount: prices.length
      };
    }
    const priceData = detectPrices();

    // ===== 6️⃣ DETEKSI ITEMLIST (URL INTERNAL) =====
    const itemListUrls = [...new Set(
      Array.from(document.querySelectorAll("a[href*='/p/'], a[href*='/20']"))
        .map(a => a.href.replace(/[?&]m=1/, ""))
        .filter(h => h.includes(location.origin) && !h.includes("#") && h !== PAGE.url)
    )].slice(0, 15);

    // Deteksi otomatis tipe tiap URL: Product atau Service
    function detectItemType(u) {
      const productWords = ["produk","ready-mix","beton","precast","baja","acp","besi","genteng","bata","material","pipa","panel"];
      return productWords.some(w => u.includes(w)) ? "Product" : "Service";
    }

    const itemListElements = itemListUrls.map((u, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": detectItemType(u),
        name: u.split("/").pop().replace(/[-_]/g, " ").replace(".html", ""),
        url: u,
        provider: { "@id": PAGE.business.url + "#localbusiness" }
      }
    }));

    // ===== 7️⃣ GENERATE GRAPH SCHEMA =====
    const graph = [];

    // LocalBusiness
    graph.push({
      "@type": ["LocalBusiness", "GeneralContractor"],
      "@id": PAGE.business.url + "#localbusiness",
      name: PAGE.business.name,
      url: PAGE.business.url,
      description: PAGE.business.description,
      telephone: PAGE.business.telephone,
      openingHours: PAGE.business.openingHours,
      address: PAGE.business.address,
      sameAs: PAGE.business.sameAs,
      logo: PAGE.image
    });

    // WebPage
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

    // Service utama halaman
    const serviceObj = {
      "@type": "Service",
      "@id": PAGE.url + "#service",
      name: PAGE.service.name,
      description: PAGE.service.description,
      image: PAGE.image,
      serviceType: PAGE.service.types,
      areaServed: PAGE.service.areaServed.map(a => ({ "@type": "Place", name: a })),
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

    // ItemList (jika ada lebih dari 1 link relevan)
    if (itemListElements.length > 1) {
      graph.push({
        "@type": "ItemList",
        name: "Daftar Layanan & Produk Terkait " + PAGE.business.name,
        itemListElement: itemListElements
      });
    }

    // ===== 8️⃣ INJEKSI JSON-LD =====
    const schema = { "@context": "https://schema.org", "@graph": graph };
    const scriptEl = document.querySelector("#auto-schema-service");
    scriptEl.textContent = JSON.stringify(schema, null, 2);

    console.log(`[Schema Service] JSON-LD diinject (${priceData?.offerCount || 0} harga, ${itemListElements.length} item list) ✅`);
  }, 600);
});
