document.addEventListener("DOMContentLoaded", async function () {
  setTimeout(async () => {
    console.log("[AutoSchema Hybrid v4.36 🚀] Start detection (Product + Service + OfferCatalog)");

    // === 1️⃣ META DASAR ===
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const cleanUrl = (ogUrl || canonical || location.href).replace(/[?&]m=1/, "");
    const title = document.querySelector("h1")?.innerText?.trim() || document.title.trim();
    const metaDesc = document.querySelector('meta[name="description"]')?.content?.trim();
    const desc =
      metaDesc ||
      Array.from(document.querySelectorAll("p"))
        .map((p) => p.innerText.trim())
        .join(" ")
        .substring(0, 300);
    const image =
      document.querySelector('meta[property="og:image"]')?.content ||
      document.querySelector("article img, main img, .post-body img, img")?.src ||
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";

    // === 2️⃣ AREA DASAR ===
    const areaProv = {
      "Kabupaten Bogor": "Jawa Barat",
      "Kota Bogor": "Jawa Barat",
      "Kota Depok": "Jawa Barat",
      "Kabupaten Bekasi": "Jawa Barat",
      "Kota Bekasi": "Jawa Barat",
      "Kabupaten Karawang": "Jawa Barat",
      "Kabupaten Serang": "Banten",
      "Kota Serang": "Banten",
      "Kota Cilegon": "Banten",
      "Kabupaten Tangerang": "Banten",
      "Kota Tangerang": "Banten",
      "Kota Tangerang Selatan": "Banten",
      "DKI Jakarta": "DKI Jakarta",
    };
    const defaultAreaServed = Object.keys(areaProv).map((a) => ({ "@type": "Place", name: a }));

    // === 3️⃣ WIKIPEDIA CACHE ===
    async function getCachedWiki(areaName, type) {
      const cacheKey = `wiki_${type}_${areaName.replace(/\s+/g, "_").toLowerCase()}`;
      const cache = localStorage.getItem(cacheKey);
      if (cache) {
        const data = JSON.parse(cache);
        if (data.expire > Date.now()) return data.items;
        else localStorage.removeItem(cacheKey);
      }
      const items = await fetchFromWikipedia(areaName, type);
      if (items?.length) {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ expire: Date.now() + 1000 * 60 * 60 * 24 * 30, items })
        );
      }
      return items;
    }

    async function fetchFromWikipedia(areaName, type) {
      const formatted = areaName.replace(/\s+/g, "_");
      const pages = [
        type === "kecamatan"
          ? `Daftar_kecamatan_di_${formatted}`
          : `Daftar_kelurahan_dan_desa_di_kecamatan_${formatted}`,
      ];
      for (const page of pages) {
        try {
          const url = `https://id.wikipedia.org/w/api.php?action=parse&page=${page}&prop=text&format=json&origin=*`;
          const res = await fetch(url);
          const data = await res.json();
          if (data?.parse?.text) {
            const temp = document.createElement("div");
            temp.innerHTML = data.parse.text["*"];
            const items = Array.from(temp.querySelectorAll("li, td"))
              .map((el) => el.textContent.trim())
              .filter((t) => /^[A-Z]/.test(t))
              .slice(0, 150);
            if (items.length > 3) return items.map((n) => ({ "@type": "Place", name: n }));
          }
        } catch (e) {
          console.warn("⚠️ Wikipedia fetch error:", areaName, e);
        }
      }
      return null;
    }

    // === 4️⃣ DETEKSI AREA ===
    async function detectArea(url, title) {
      const combined = (url + " " + title).toLowerCase();
      for (const area of Object.keys(areaProv)) {
        const slug = area.toLowerCase().replace(/\s+/g, "-");
        if (combined.includes(slug) || combined.includes(area.toLowerCase().replace(/\s+/g, ""))) {
          const list = await getCachedWiki(area, "kecamatan");
          if (list?.length) return list.map((a) => ({ "@type": "Place", name: a.name }));
          return [{ "@type": "Place", name: area }];
        }
      }
      return defaultAreaServed;
    }

    const areaServed = await detectArea(cleanUrl, title);

    // === 5️⃣ DETEKSI BRAND & HARGA ===
    const text = document.body.innerText.toLowerCase();
    let brandName = "Beton Jaya Readymix";
    const brandMatch = text.match(/jayamix|adhimix|holcim|scg|pionir|dynamix|tiga roda|solusi bangun/i);
    if (brandMatch) brandName = brandMatch[0].replace(/\b\w/g, (l) => l.toUpperCase());

    const matches = [...document.body.innerText.matchAll(/Rp\s*([\d.,]{4,})/g)];
    const prices = matches
      .map((m) => parseInt(m[1].replace(/[.\s,]/g, ""), 10))
      .filter((v) => v >= 10000 && v <= 500000000);
    const priceData = prices.length
      ? {
          lowPrice: Math.min(...prices),
          highPrice: Math.max(...prices),
          offerCount: prices.length,
          priceCurrency: "IDR",
          priceValidUntil: new Date(Date.now() + 86400000 * 90).toISOString().split("T")[0],
        }
      : null;

    // === 6️⃣ DETEKSI PRODUK / JASA / HYBRID ===
    const jasaKeywords = /(jasa|sewa|borongan|kontraktor|layanan|service|perbaikan|pemasangan)/i;
    const produkKeywords = /(produk|beton|readymix|precast|pipa|u[- ]?ditch|box culvert|panel)/i;
    const hasJasa = jasaKeywords.test(text);
    const hasProduk = produkKeywords.test(text);

    let mainType = "Product";
    if (hasJasa && hasProduk) mainType = ["Product", "Service"];
    else if (hasJasa) mainType = "Service";

    // === 7️⃣ ENTITY BISNIS ===
    const business = {
      "@type": ["LocalBusiness", "GeneralContractor"],
      "@id": "https://www.betonjayareadymix.com/#localbusiness",
      name: "Beton Jaya Readymix",
      url: "https://www.betonjayareadymix.com",
      telephone: "+6283839000968",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bogor",
        addressRegion: "Jawa Barat",
        addressCountry: "ID",
      },
      description:
        "Penyedia beton ready mix, precast, dan jasa konstruksi di wilayah Jabodetabek dan sekitarnya.",
      areaServed,
      sameAs: [
        "https://www.facebook.com/betonjayareadymix",
        "https://www.instagram.com/betonjayareadymix",
      ],
      logo: image,
    };

    // === 8️⃣ MAIN ENTITY ===
    const mainEntity = {
      "@type": mainType,
      "@id": cleanUrl + "#mainentity",
      name: title,
      description: desc,
      image,
      areaServed,
      provider: { "@id": business["@id"] },
      brand: { "@type": "Brand", name: brandName },
      ...(priceData && {
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: priceData.priceCurrency,
          lowPrice: priceData.lowPrice,
          highPrice: priceData.highPrice,
          offerCount: priceData.offerCount,
          availability: "https://schema.org/InStock",
          priceValidUntil: priceData.priceValidUntil,
          url: cleanUrl,
        },
      }),
    };

    // === 9️⃣ OFFER CATALOG (Jika banyak variasi harga ditemukan) ===
    let offerCatalog = null;
    if (priceData && prices.length >= 3) {
      const offerItems = prices.slice(0, 10).map((p, i) => ({
        "@type": "Offer",
        name: `${title} Varian ${i + 1}`,
        price: p,
        priceCurrency: "IDR",
        availability: "https://schema.org/InStock",
        url: cleanUrl + `#varian-${i + 1}`,
      }));
      offerCatalog = {
        "@type": "OfferCatalog",
        name: `Daftar Harga ${title}`,
        url: cleanUrl + "#offercatalog",
        numberOfItems: offerItems.length,
        itemListElement: offerItems,
      };
    }

    // === 🔟 WEBPAGE & OUTPUT ===
    const webpage = {
      "@type": "WebPage",
      "@id": cleanUrl + "#webpage",
      url: cleanUrl,
      name: title,
      description: desc,
      image,
      mainEntity: { "@id": mainEntity["@id"] },
      publisher: { "@id": business["@id"] },
    };

    // === 11️⃣ OUTPUT GRAPH ===
    const graph = [webpage, business, mainEntity];
    if (offerCatalog) graph.push(offerCatalog);

    const schemaData = { "@context": "https://schema.org", "@graph": graph };
    document.querySelector("#auto-schema-product").textContent = JSON.stringify(schemaData, null, 2);

    console.log(
      `[AutoSchema v4.36 ✅] Type: ${JSON.stringify(
        mainType
      )} | Brand: ${brandName} | Harga: ${priceData ? "✅" : "❌"} | OfferCatalog: ${
        offerCatalog ? "✅" : "❌"
      } | Area: ${areaServed.length}`
    );
  }, 500);
});
