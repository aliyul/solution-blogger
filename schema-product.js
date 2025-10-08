document.addEventListener("DOMContentLoaded", async function () {
  setTimeout(async () => {
    console.log("[AutoSchema Product v4.34] 🚀 Start full detection");

    // === 1️⃣ META DASAR HALAMAN ===
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const cleanUrl = (ogUrl || canonical || location.href).replace(/[?&]m=1/, "");
    const title = document.querySelector("h1")?.innerText?.trim() || document.title.trim();
    const metaDesc = document.querySelector('meta[name="description"]')?.content?.trim();
    const desc = metaDesc || Array.from(document.querySelectorAll("p")).map(p => p.innerText.trim()).join(" ").substring(0, 300);
    const image = document.querySelector('meta[property="og:image"]')?.content ||
      document.querySelector("article img, main img, .post-body img, img")?.src ||
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";

    // === 2️⃣ AREA DASAR ===
    const areaProv = {
      "Kabupaten Bogor": "Jawa Barat", "Kota Bogor": "Jawa Barat", "Kota Depok": "Jawa Barat",
      "Kabupaten Bekasi": "Jawa Barat", "Kota Bekasi": "Jawa Barat", "Kabupaten Karawang": "Jawa Barat",
      "Kabupaten Serang": "Banten", "Kota Serang": "Banten", "Kota Cilegon": "Banten",
      "Kabupaten Tangerang": "Banten", "Kota Tangerang": "Banten", "Kota Tangerang Selatan": "Banten",
      "DKI Jakarta": "DKI Jakarta"
    };
    const defaultAreaServed = Object.keys(areaProv).map(a => ({ "@type": "Place", "name": a }));

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
        localStorage.setItem(cacheKey, JSON.stringify({ expire: Date.now() + 1000 * 60 * 60 * 24 * 30, items }));
      }
      return items;
    }

    async function fetchFromWikipedia(areaName, type) {
      const formatted = areaName.replace(/\s+/g, "_");
      const pages = [
        type === "kecamatan" ? `Daftar_kecamatan_di_${formatted}` : `Daftar_kelurahan_dan_desa_di_kecamatan_${formatted}`,
        type === "kecamatan" ? `Daftar_kecamatan_dan_kelurahan_di_${formatted}` : `Daftar_desa_dan_kelurahan_di_kecamatan_${formatted}`
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
              .map(el => el.textContent.trim())
              .filter(t => /^[A-Z]/.test(t))
              .slice(0, 150);
            if (items.length > 3) return items.map(n => ({ "@type": "Place", "name": n }));
          }
        } catch (e) { console.warn("❌ Wikipedia fetch error for", areaName, e); }
      }
      return null;
    }

    // === 4️⃣ DETEKSI AREA DARI URL ===
    async function detectArea(url, title) {
      const combined = (url + " " + title).toLowerCase();
      for (const area of Object.keys(areaProv)) {
        const slug = area.toLowerCase().replace(/\s+/g, "-");
        if (combined.includes(slug) || combined.includes(area.toLowerCase().replace(/\s+/g, ""))) {
          const list = await getCachedWiki(area, "kecamatan");
          if (list?.length) return list.map(a => ({ "@type": "Place", "name": a.name }));
          return [{ "@type": "Place", "name": area }];
        }
      }
      const match = combined.match(/kecamatan-?([a-z\s-]+)-(bogor|bekasi|depok|tangerang|karawang|serang|jakarta)/);
      if (match) {
        const kec = match[1].trim().replace(/-/g, " ");
        const list = await getCachedWiki(kec, "kelurahan");
        if (list?.length) return list.map(a => ({ "@type": "Place", "name": "Kelurahan " + a.name }));
        return [{ "@type": "Place", "name": "Kecamatan " + kec }];
      }
      return defaultAreaServed;
    }

    const areaServed = await detectArea(cleanUrl, title);

    // === 5️⃣ DETEKSI PRODUK & HARGA DARI HEADING ===
    const productList = [];
    const headings = Array.from(document.querySelectorAll("h2, h3, h4")).filter(h => /harga|produk|ready mix|beton|buis|culvert|u ditch|panel/i.test(h.innerText));
    headings.forEach(h => {
      const name = h.innerText.trim();
      const nextText = h.nextElementSibling?.innerText || "";
      const priceMatch = (name + " " + nextText).match(/(\d[\d.,]+)\s?(?:rb|ribu|jt|juta|IDR|Rp)/i);
      let price = null;
      if (priceMatch) {
        const numeric = priceMatch[1].replace(/[^\d]/g, "");
        price = parseInt(numeric);
      }
      productList.push({
        "@type": "Product",
        name,
        description: nextText.substring(0, 150),
        areaServed,
        ...(price ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "IDR",
            price: price,
            availability: "https://schema.org/InStock",
            url: cleanUrl
          }
        } : {})
      });
    });

    // === 6️⃣ BRAND DETECTION ===
    const text = document.body.innerText.toLowerCase();
    let brandName = "Beton Jaya Readymix";
    const brandMatch = text.match(/jayamix|adhimix|holcim|scg|pionir|dynamix|tiga roda|solusi bangun/i);
    if (brandMatch) brandName = brandMatch[0].replace(/\b\w/g, l => l.toUpperCase());

    // === 7️⃣ LOCAL BUSINESS ===
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
        addressCountry: "ID"
      },
      areaServed,
      logo: image,
      description: "Penyedia beton ready mix, precast, dan jasa konstruksi di wilayah Jabodetabek dan sekitarnya.",
      sameAs: [
        "https://www.facebook.com/betonjayareadymix",
        "https://www.instagram.com/betonjayareadymix"
      ]
    };

    // === 8️⃣ GRAPH SETUP ===
    const graph = [
      {
        "@type": "WebPage",
        "@id": cleanUrl + "#webpage",
        url: cleanUrl,
        name: title,
        description: desc,
        mainEntity: productList.length ? productList.map((p, i) => ({ "@id": cleanUrl + "#product-" + (i + 1) })) : undefined,
        publisher: { "@id": business["@id"] }
      },
      business,
      ...productList.map((p, i) => ({ ...p, "@id": cleanUrl + "#product-" + (i + 1), brand: { "@type": "Brand", name: brandName } }))
    ];

    // === 9️⃣ OUTPUT JSON-LD ===
    const schemaData = { "@context": "https://schema.org", "@graph": graph };
    const el = document.querySelector("#auto-schema-product") || document.body.appendChild(Object.assign(document.createElement("script"), { id: "auto-schema-product", type: "application/ld+json" }));
    el.textContent = JSON.stringify(schemaData, null, 2);

    console.log(`[AutoSchema Product v4.34] ✅ Injected schema | Produk: ${productList.length} | Area: ${areaServed.length}`);
  }, 500);
});
