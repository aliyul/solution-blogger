//* ⚡ AUTO SCHEMA PRODUK v4.27+ — Deteksi Area Otomatis + Wikipedia Cache 30 Hari */
document.addEventListener("DOMContentLoaded", async function () {
  setTimeout(async () => {
    console.log("[AutoSchema Product v4.27+] 🚀 Mulai deteksi otomatis area & produk");

    /* === 1️⃣ META DASAR === */
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const cleanUrl = (ogUrl || canonical || location.href).replace(/[?&]m=1/, "");
    const lowerUrl = cleanUrl.toLowerCase();
    const title = document.querySelector("h1")?.innerText?.trim() || document.title.trim();
    const metaDesc = document.querySelector('meta[name="description"]')?.content?.trim();
    const desc = metaDesc || Array.from(document.querySelectorAll("p"))
      .map(p => p.innerText.trim()).join(" ").substring(0, 300);

    let image = document.querySelector('meta[property="og:image"]')?.content ||
      document.querySelector("article img, main img, .post-body img, img")?.src;
    if (!image || image.startsWith("data:")) {
      image = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";
    }

    /* === 2️⃣ DATA AREA UTAMA === */
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
      "DKI Jakarta": "DKI Jakarta"
    };

    const defaultAreaServed = Object.keys(areaProv).map(a => ({"@type":"Place","name":a}));

    /* === 3️⃣ FETCH + CACHE DARI WIKIPEDIA === */
    async function getCachedAreaList(areaName) {
      const cacheKey = `wiki_kecamatan_${areaName.replace(/\s+/g, "_")}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.expire > Date.now()) {
            console.log("📦 Cache loaded:", cacheKey);
            return parsed.data;
          } else {
            localStorage.removeItem(cacheKey);
          }
        }
        const list = await fetchAreaFromWikipedia(areaName);
        if (list?.length) {
          localStorage.setItem(cacheKey, JSON.stringify({
            expire: Date.now() + 1000 * 60 * 60 * 24 * 30,
            data: list
          }));
          console.log("🌐 Wikipedia cached:", cacheKey);
          return list;
        }
      } catch (e) {
        console.warn("⚠️ Cache error:", e);
      }
      return null;
    }

    async function fetchAreaFromWikipedia(areaName) {
      try {
        const page = `Daftar_kecamatan_di_${areaName.replace(/\s+/g, "_")}`;
        const url = `https://id.wikipedia.org/w/api.php?action=parse&page=${page}&prop=text&format=json&origin=*`;
        const res = await fetch(url);
        const data = await res.json();
        if (data?.parse?.text) {
          const html = data.parse.text["*"];
          const temp = document.createElement("div");
          temp.innerHTML = html;
          const items = Array.from(temp.querySelectorAll("li, td"))
            .map(el => el.textContent.trim())
            .filter(t => /^[A-Z]/.test(t))
            .slice(0, 100);
          return items.map(n => ({"@type":"Place","name":"Kecamatan " + n}));
        }
      } catch (e) {
        console.warn("❌ Wikipedia fetch error:", e);
      }
      return null;
    }

    /* === 4️⃣ DETEKSI AREA BERDASARKAN URL === */
    async function detectArea(url, title) {
      const lower = (url + " " + title).toLowerCase();
      let detected = null;

      for (const area in areaProv) {
        const slug = area.toLowerCase().replace(/\s+/g, "-");
        if (lower.includes(slug) || lower.includes(area.toLowerCase().replace(/\s+/g, ""))) {
          detected = area;
          break;
        }
      }

      if (!detected) {
        console.warn("[AutoSchema Product] ⚠️ Tidak terdeteksi area — fallback default.");
        return defaultAreaServed;
      }

      const list = await getCachedAreaList(detected);
      return list?.length ? list : [{"@type":"Place","name":detected}];
    }

    const areaServed = await detectArea(cleanUrl, title);

    /* === 5️⃣ DETEKSI PRODUK/JASA === */
    const text = document.body.innerText.toLowerCase();
    const isProduct = /readymix|beton|precast|buis|pipa|u ditch|box culvert|conblock|paving|panel beton/i.test(text);
    const isService = /sewa|rental|kontraktor|renovasi|borongan|angkut|cut fill|pengaspalan/i.test(text);

    const category = isProduct && !isService ? "Produk Material & Konstruksi"
      : isService && !isProduct ? "Layanan Jasa Konstruksi"
      : "Produk & Jasa Konstruksi";

    let brandName = "Beton Jaya Readymix";
    const brandMatch = text.match(/jayamix|adhimix|holcim|scg|pionir|dynamix|tiga roda|solusi bangun/i);
    if (brandMatch) brandName = brandMatch[0].replace(/\b\w/g, l => l.toUpperCase());

    /* === 6️⃣ SCHEMA BUILDER === */
    const business = {
      "@type": ["LocalBusiness","GeneralContractor"],
      "@id": "https://www.betonjayareadymix.com/#localbusiness",
      name: "Beton Jaya Readymix",
      url: "https://www.betonjayareadymix.com",
      telephone: "+6283839000968",
      address: {"@type": "PostalAddress", addressLocality: "Bogor", addressRegion: "Jawa Barat", addressCountry: "ID"},
      description: "Beton Jaya Readymix menyediakan beton cor ready mix, precast, dan jasa alat berat di seluruh wilayah Jawa Barat, Banten, dan DKI Jakarta.",
      areaServed,
      sameAs: [
        "https://www.facebook.com/betonjayareadymix",
        "https://www.instagram.com/betonjayareadymix"
      ],
      logo: image
    };

    const mainEntity = {
      "@type": isProduct ? "Product" : "Service",
      "@id": cleanUrl + "#" + (isProduct ? "product" : "service"),
      name: title,
      description: desc,
      image,
      brand: {"@type":"Brand","name":brandName},
      areaServed,
      category,
      offers: {
        "@type":"Offer",
        url:cleanUrl,
        priceCurrency:"IDR",
        availability:"https://schema.org/InStock"
      },
      provider: {"@id":business["@id"]}
    };

    const schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type":"WebPage",
          "@id":cleanUrl + "#webpage",
          url:cleanUrl,
          name:title,
          description:desc,
          image,
          mainEntity:{"@id":mainEntity["@id"]},
          publisher:{"@id":business["@id"]}
        },
        business,
        mainEntity
      ]
    };

    /* === 7️⃣ OUTPUT === */
    document.querySelector("#auto-schema-product").textContent = JSON.stringify(schemaData, null, 2);
    console.log(`[AutoSchema Product v4.27+] ✅ Injected | Area: ${areaServed.length} | Tipe: ${isProduct ? "Produk" : "Jasa"}`);
  }, 500);
});
