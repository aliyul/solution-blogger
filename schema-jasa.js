// ⚡ AUTO SCHEMA SERVICE v4.31 FULL — Area Wikipedia + Cache + Harga Real + Product Optional + Fix ItemList Unik
document.addEventListener("DOMContentLoaded", async function () {
  setTimeout(async () => {
    console.log("[Schema Service v4.31 🚀] Auto generator dijalankan");

    // === 1️⃣ INFO DASAR HALAMAN ===
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const baseUrl = ogUrl || canonical || location.href;
    const cleanUrl = baseUrl.replace(/[?&]m=1/, "");

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

    // === 2️⃣ DATA AREA DEFAULT ===
    const areaJSON = {
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
    const defaultAreaServed = Object.keys(areaJSON).map((k) => ({ "@type": "Place", name: k }));

    // === 3️⃣ FETCH & CACHE WIKIPEDIA ===
    async function getCachedAreaList(cacheKey, areaName, type) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.expire > Date.now()) return parsed.data;
          else localStorage.removeItem(cacheKey);
        }
        const data = await fetchAreaFromWikipedia(areaName, type);
        if (data?.length) {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ expire: Date.now() + 1000 * 60 * 60 * 24 * 30, data })
          );
          return data;
        }
      } catch (e) {
        console.warn("❌ Cache error:", e);
      }
      return null;
    }

    async function fetchAreaFromWikipedia(areaName, type) {
      try {
        const page =
          type === "kelurahan"
            ? `Daftar_kelurahan_dan_desa_di_${areaName.replace(/\s+/g, "_")}`
            : `Daftar_kecamatan_di_${areaName.replace(/\s+/g, "_")}`;
        const url = `https://id.wikipedia.org/w/api.php?action=parse&page=${page}&prop=text&format=json&origin=*`;
        const res = await fetch(url);
        const data = await res.json();
        if (data?.parse?.text) {
          const temp = document.createElement("div");
          temp.innerHTML = data.parse.text["*"];
          const items = Array.from(temp.querySelectorAll("li, td"))
            .map((el) => el.textContent.trim())
            .filter((t) => /^[A-Z]/.test(t) && !t.includes("Daftar"))
            .slice(0, 100);
          return items.map((n) => ({
            "@type": "Place",
            name: `${type === "kelurahan" ? "Kelurahan" : "Kecamatan"} ${n}`,
          }));
        }
      } catch (e) {
        console.warn("⚠️ Wikipedia fetch error:", e);
      }
      return null;
    }

    // === 4️⃣ DETEKSI AREA ===
    async function detectArea(url, title = "") {
      const text = (url + " " + title).toLowerCase();
      for (const area in areaJSON) {
        const slug = area.toLowerCase().replace(/\s+/g, "-");
        if (text.includes(slug) || text.includes(area.toLowerCase().replace(/\s+/g, ""))) {
          return (
            (await getCachedAreaList(`wiki_kecamatan_${area.replace(/\s+/g, "_")}`, area, "kecamatan")) ||
            defaultAreaServed
          );
        }
      }
      return defaultAreaServed;
    }
    const areaServed = await detectArea(PAGE.url, PAGE.title);

    // === 5️⃣ DETEKSI SERVICE, HARGA, DAN LINK ===
    const detectServiceType = () => {
      const base = PAGE.title.toLowerCase();
      const types = [
        "sewa excavator",
        "sewa alat berat",
        "jasa pancang",
        "jasa borongan",
        "jasa renovasi",
        "jasa puing",
        "rental alat berat",
        "beton cor",
        "ready mix",
      ];
      return types.filter((t) => base.includes(t)).length
        ? types.filter((t) => base.includes(t))
        : ["Jasa Konstruksi"];
    };

    // 🔹 Hanya deteksi harga yang realistis
    const detectPrices = () => {
      const text = document.body.innerText;
      const regex = /Rp\s*([\d.,]+)/g;
      const vals = [...text.matchAll(regex)]
        .map((m) => parseInt(m[1].replace(/[.\s]/g, ""), 10))
        .filter((v) => v >= 1000 && v <= 500000000); // filter nominal real (Rp 1 ribu - 500 juta)
      if (vals.length < 1) return null;

      // buang nilai yang terlalu sering muncul (angka umum, bukan harga)
      const counts = {};
      vals.forEach((v) => (counts[v] = (counts[v] || 0) + 1));
      const realVals = vals.filter((v) => counts[v] < 5);

      if (!realVals.length) return null;
      return { lowPrice: Math.min(...realVals), highPrice: Math.max(...realVals), offerCount: realVals.length };
    };

    const detectInternalLinks = () => {
      const anchors = Array.from(
        document.querySelectorAll("article a, main a, .post-body a")
      ).filter(
        (a) =>
          a.href &&
          a.href.includes(location.hostname) &&
          a.href !== location.href &&
          !a.href.includes("#") &&
          a.innerText.trim().length > 3
      );
      const unique = Array.from(new Map(anchors.map((a) => [a.href, a])).values());
      return unique.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: a.href,
        name: a.innerText.trim() || a.href,
      }));
    };

    const serviceTypes = detectServiceType();
    const priceData = detectPrices();
    const internalLinks = detectInternalLinks();

    // === 5.1️⃣ PRODUK OPSIONAL ===
    const detectProduct = () => {
      const text = (PAGE.title + " " + PAGE.description).toLowerCase();
      if (text.includes("jual ") || text.includes("produk ") || text.includes("harga ")) {
        return {
          "@type": "Product",
          "@id": PAGE.url + "#product",
          name: PAGE.title,
          description: PAGE.description,
          image: PAGE.image,
          brand: { "@type": "Brand", name: PAGE.business.name },
          ...(priceData && {
            offers: {
              "@type": "AggregateOffer",
              priceCurrency: "IDR",
              lowPrice: priceData.lowPrice,
              highPrice: priceData.highPrice,
              offerCount: priceData.offerCount,
              availability: "https://schema.org/InStock",
              priceValidUntil: new Date().toISOString().split("T")[0],
              url: PAGE.url,
            },
          }),
        };
      }
      return null;
    };
    const productData = detectProduct();

    // === 6️⃣ GRAPH ===
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
        areaServed,
      },
      {
        "@type": "WebPage",
        "@id": PAGE.url + "#webpage",
        url: PAGE.url,
        name: PAGE.title,
        description: PAGE.description,
        image: PAGE.image,
        mainEntity: { "@id": PAGE.url + "#service" },
        publisher: { "@id": PAGE.business.url + "#localbusiness" },
        ...(internalLinks.length && { hasPart: { "@id": PAGE.url + "#daftar-internal-link" } }),
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
        brand: { "@type": "Brand", name: PAGE.business.name },
        ...(priceData && {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "IDR",
            lowPrice: priceData.lowPrice,
            highPrice: priceData.highPrice,
            offerCount: priceData.offerCount,
            availability: "https://schema.org/InStock",
            priceValidUntil: new Date().toISOString().split("T")[0],
            url: PAGE.url,
          },
        }),
      },
    ];

    if (productData) graph.push(productData);

    if (internalLinks.length) {
      graph.push({
        "@type": "ItemList",
        "@id": PAGE.url + "#daftar-internal-link",
        name: "Daftar Halaman Terkait",
        itemListOrder: "http://schema.org/ItemListOrderAscending",
        numberOfItems: internalLinks.length,
        itemListElement: internalLinks,
      });
    }

    // === 7️⃣ OUTPUT ===
    const schema = { "@context": "https://schema.org", "@graph": graph };
    document.querySelector("#auto-schema-service").textContent = JSON.stringify(schema, null, 2);
    console.log(
      `[Schema Service v4.31 ✅] Injected | ${serviceTypes.join(", ")} | Product: ${
        productData ? "Ya" : "Tidak"
      } | Harga: ${priceData ? "✅ Real" : "❌ None"} | Area: ${areaServed.length} | Links: ${
        internalLinks.length
      }`
    );
  }, 500);
});
