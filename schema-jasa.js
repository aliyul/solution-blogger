//* ⚡ AUTO SCHEMA SERVICE v4.28+ — Auto Detect Kabupaten/Kota/Kecamatan + Wikipedia Cache 30 Hari */
document.addEventListener("DOMContentLoaded", async function () {
  setTimeout(async () => {
    console.log("[Schema Service v4.28+] 🚀 Auto generator dijalankan");

    /* 1️⃣ INFO DASAR HALAMAN */
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
        description:
          "Beton Jaya Readymix melayani jasa konstruksi, beton cor, precast, dan sewa alat berat di seluruh Indonesia.",
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

    /* 2️⃣ DATA DASAR AREA */
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
      "DKI Jakarta": "DKI Jakarta"
    };

    const defaultAreaServed = Object.keys(areaJSON).map(k => ({
      "@type": "Place",
      "name": k
    }));

    /* 3️⃣ FETCH & CACHE */
    async function getCachedAreaList(cacheKey, areaName, type) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.expire > Date.now()) {
            console.log("📦 Cache loaded:", cacheKey);
            return parsed.data;
          } else localStorage.removeItem(cacheKey);
        }
        const data = await fetchAreaFromWikipedia(areaName, type);
        if (data && data.length) {
          localStorage.setItem(cacheKey, JSON.stringify({
            expire: Date.now() + 1000 * 60 * 60 * 24 * 30,
            data
          }));
          console.log("🌐 Cached new:", cacheKey);
          return data;
        }
      } catch (e) {
        console.warn("❌ Cache error:", e);
      }
      return null;
    }

    async function fetchAreaFromWikipedia(areaName, type) {
      try {
        const page = type === "kelurahan"
          ? `Daftar_kelurahan_dan_desa_di_${areaName.replace(/\s+/g, "_")}`
          : `Daftar_kecamatan_di_${areaName.replace(/\s+/g, "_")}`;
        const url = `https://id.wikipedia.org/w/api.php?action=parse&page=${page}&prop=text&format=json&origin=*`;
        const res = await fetch(url);
        const data = await res.json();
        if (data?.parse?.text) {
          const html = data.parse.text["*"];
          const temp = document.createElement("div");
          temp.innerHTML = html;
          const items = Array.from(temp.querySelectorAll("li, td"))
            .map(el => el.textContent.trim())
            .filter(t => /^[A-Z]/.test(t) && !t.includes("Daftar"))
            .slice(0, 100);
          return items.map(n => ({
            "@type": "Place",
            "name": `${type === "kelurahan" ? "Kelurahan" : "Kecamatan"} ${n}`
          }));
        }
      } catch (e) {
        console.warn("⚠️ Wikipedia fetch error:", e);
      }
      return null;
    }

    /* 4️⃣ DETEKSI AREA */
    async function detectArea(url, title = "") {
      const text = (url + " " + title).toLowerCase();

      // 1️⃣ Deteksi Kabupaten/Kota
      for (const area in areaJSON) {
        const slug = area.toLowerCase().replace(/\s+/g, "-");
        if (text.includes(slug) || text.includes(area.toLowerCase().replace(/\s+/g, ""))) {
          console.log("📍 Terdeteksi kab/kota:", area);
          return await getCachedAreaList(`wiki_kecamatan_${area.replace(/\s+/g, "_")}`, area, "kecamatan") || defaultAreaServed;
        }
      }

      // 2️⃣ Deteksi Kecamatan (pakai cache Wikipedia)
      const allKecKeys = Object.keys(localStorage).filter(k => k.startsWith("wiki_kecamatan_"));
      for (const key of allKecKeys) {
        const list = JSON.parse(localStorage.getItem(key) || "{}").data || [];
        for (const kec of list) {
          const n = kec.name.toLowerCase().replace("kecamatan ", "").replace(/\s+/g, "");
          if (text.includes(n)) {
            const parent = key.replace("wiki_kecamatan_", "").replace(/_/g, " ");
            console.log("📍 Terdeteksi kecamatan:", n, "| parent:", parent);
            return await getCachedAreaList(`wiki_kelurahan_${n}`, n, "kelurahan") ||
              await getCachedAreaList(`wiki_kelurahan_${parent}`, parent, "kelurahan") ||
              list;
          }
        }
      }

      console.warn("[AutoSchema] Tidak ditemukan area — fallback default");
      return defaultAreaServed;
    }

    const areaServed = await detectArea(PAGE.url, PAGE.title);

    /* 5️⃣ DETEKSI SERVICE & HARGA */
    const detectServiceType = () => {
      const base = PAGE.title.toLowerCase();
      const types = ["sewa excavator", "sewa alat berat", "jasa pancang", "jasa borongan", "jasa renovasi", "jasa puing", "rental alat berat", "beton cor", "ready mix"];
      const found = types.filter(t => base.includes(t));
      return found.length ? found : ["Jasa Konstruksi"];
    };
    const detectPrices = () => {
      const text = document.body.innerText;
      const regex = /Rp\s*([\d.,]+)/g;
      const vals = [...text.matchAll(regex)].map(m => parseInt(m[1].replace(/[.\s]/g, ""), 10)).filter(Boolean);
      if (!vals.length) return null;
      return { lowPrice: Math.min(...vals), highPrice: Math.max(...vals), offerCount: vals.length };
    };

    const serviceTypes = detectServiceType();
    const priceData = detectPrices();

    /* 6️⃣ BUILD GRAPH */
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
        areaServed: areaServed,
        provider: { "@id": PAGE.business.url + "#localbusiness" },
        brand: { "@type": "Brand", "name": PAGE.business.name }
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

    /* 7️⃣ OUTPUT */
    const schema = { "@context": "https://schema.org", "@graph": graph };
    document.querySelector("#auto-schema-service").textContent = JSON.stringify(schema, null, 2);
    console.log(`[Schema Service v4.28+] ✅ Injected | ${serviceTypes.join(", ")} | Area: ${areaServed.length}`);
  }, 500);
});
