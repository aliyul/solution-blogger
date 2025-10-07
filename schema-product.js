//* ⚡ AUTO SCHEMA PRODUK v4.29 — WebPage Description Pure Local + Wikipedia Cache 30 Hari */
document.addEventListener("DOMContentLoaded", async function () {
  setTimeout(async () => {
    console.log("[AutoSchema Product v4.29] 🚀 Deteksi area otomatis + Description halaman spesifik");

    /* === 1️⃣ META DASAR === */
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const cleanUrl = (ogUrl || canonical || location.href).replace(/[?&]m=1/, "");
    const lowerUrl = cleanUrl.toLowerCase();
    const title = document.querySelector("h1")?.innerText?.trim() || document.title.trim();

    // ambil description halaman, bukan homepage
    let metaDesc = document.querySelector('meta[name="description"]')?.content?.trim() || "";
    if (/beranda|home|selamat datang/i.test(metaDesc)) metaDesc = ""; // hindari fallback homepage
    const firstParas = Array.from(document.querySelectorAll("article p, main p, .post-body p"))
      .map(p => p.innerText.trim()).filter(t => t.length > 40).join(" ").substring(0, 300);
    const desc = metaDesc || firstParas || `${title} oleh Beton Jaya Readymix melayani area sekitar Anda.`;

    // ambil image terdekat
    let image = document.querySelector('meta[property="og:image"]')?.content ||
      document.querySelector("article img, main img, .post-body img, img")?.src;
    if (!image || image.startsWith("data:")) {
      image = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";
    }

    /* === 2️⃣ DATA AREA === */
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
    const defaultAreaServed = Object.keys(areaProv).map(a => ({ "@type": "Place", "name": a }));

    /* === 3️⃣ CACHE WIKIPEDIA === */
    async function getCachedWiki(areaName, type) {
      const cacheKey = `wiki_${type}_${areaName.replace(/\s+/g, "_")}`;
      const cache = localStorage.getItem(cacheKey);
      if (cache) {
        const data = JSON.parse(cache);
        if (data.expire > Date.now()) return data.items;
        else localStorage.removeItem(cacheKey);
      }
      const items = await fetchFromWikipedia(areaName, type);
      if (items?.length) {
        localStorage.setItem(cacheKey, JSON.stringify({
          expire: Date.now() + 1000 * 60 * 60 * 24 * 30,
          items
        }));
      }
      return items;
    }

    async function fetchFromWikipedia(areaName, type) {
      try {
        const page = (type === "kecamatan"
          ? `Daftar_kecamatan_di_${areaName}`
          : `Daftar_kelurahan_dan_desa_di_kecamatan_${areaName}`).replace(/\s+/g, "_");
        const url = `https://id.wikipedia.org/w/api.php?action=parse&page=${page}&prop=text&format=json&origin=*`;
        const res = await fetch(url);
        const data = await res.json();
        if (data?.parse?.text) {
          const temp = document.createElement("div");
          temp.innerHTML = data.parse.text["*"];
          const items = Array.from(temp.querySelectorAll("li, td"))
            .map(el => el.textContent.trim())
            .filter(t => /^[A-Z]/.test(t))
            .slice(0, 120);
          return items.map(n => ({ "@type": "Place", "name": n }));
        }
      } catch (e) {
        console.warn("❌ Wikipedia fetch error:", e);
      }
      return null;
    }

    /* === 4️⃣ DETEKSI AREA === */
    async function detectArea(url, title) {
      const combined = (url + " " + title).toLowerCase();

      for (const area of Object.keys(areaProv)) {
        const slug = area.toLowerCase().replace(/\s+/g, "-");
        if (combined.includes(slug) || combined.includes(area.toLowerCase().replace(/\s+/g, ""))) {
          console.log("📍 Detected kabupaten/kota:", area);
          const list = await getCachedWiki(area, "kecamatan");
          if (list?.length) return list.map(a => ({ "@type": "Place", "name": a.name }));
          return [{ "@type": "Place", "name": area }];
        }
      }

      const match = combined.match(/(kecamatan\s+)?([a-z\s-]+)(bogor|bekasi|depok|tangerang|karawang|serang|jakarta)/);
      if (match) {
        const kec = match[2].trim().replace(/-/g, " ");
        console.log("📍 Detected kecamatan:", kec);
        const list = await getCachedWiki(kec, "kelurahan");
        if (list?.length) return list.map(a => ({ "@type": "Place", "name": "Kelurahan " + a.name }));
        return [{ "@type": "Place", "name": "Kecamatan " + kec }];
      }

      console.warn("⚠️ Area tidak terdeteksi → fallback default area utama");
      return defaultAreaServed;
    }

    const areaServed = await detectArea(cleanUrl, title);

    /* === 5️⃣ PRODUK / JASA DETECTION === */
    const text = document.body.innerText.toLowerCase();
    const isProduct = /readymix|beton|precast|buis|pipa|u ditch|box culvert|conblock|paving|panel beton/i.test(text);
    const isService = /sewa|rental|kontraktor|renovasi|borongan|angkut|cut fill|pengaspalan/i.test(text);
    const category = isProduct && !isService ? "Produk Material & Konstruksi"
      : isService && !isProduct ? "Layanan Jasa Konstruksi"
      : "Produk & Jasa Konstruksi";
    let brandName = "Beton Jaya Readymix";
    const brandMatch = text.match(/jayamix|adhimix|holcim|scg|pionir|dynamix|tiga roda|solusi bangun/i);
    if (brandMatch) brandName = brandMatch[0].replace(/\b\w/g, l => l.toUpperCase());

    /* === 6️⃣ SCHEMA === */
    const business = {
      "@type": ["LocalBusiness","GeneralContractor"],
      "@id": "https://www.betonjayareadymix.com/#localbusiness",
      "name": "Beton Jaya Readymix",
      "url": "https://www.betonjayareadymix.com",
      "telephone": "+6283839000968",
      "address": { "@type": "PostalAddress", "addressLocality": "Bogor", "addressRegion": "Jawa Barat", "addressCountry": "ID" },
      "description": "Beton Jaya Readymix menyediakan beton cor ready mix, precast, dan jasa alat berat di wilayah Jawa Barat, Banten, dan DKI Jakarta.",
      "areaServed": areaServed,
      "sameAs": [
        "https://www.instagram.com/betonjayareadymix/",
        "https://www.facebook.com/betonjayareadymix"
      ]
    };

    const mainEntity = {
      "@type": isProduct ? "Product" : "Service",
      "@id": cleanUrl + "#" + (isProduct ? "product" : "service"),
      "name": title,
      "description": desc,
      "image": image,
      "brand": { "@type": "Brand", "name": brandName },
      "areaServed": areaServed,
      "category": category,
      "offers": {
        "@type": "Offer",
        "url": cleanUrl,
        "priceCurrency": "IDR",
        "availability": "https://schema.org/InStock"
      },
      "provider": { "@id": business["@id"] }
    };

    const schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": cleanUrl + "#webpage",
          "url": cleanUrl,
          "name": title,
          "description": desc, // ✅ PURE HALAMAN, bukan homepage
          "image": image,
          "mainEntity": { "@id": mainEntity["@id"] },
          "publisher": { "@id": business["@id"] }
        },
        business,
        mainEntity
      ]
    };

    document.querySelector("#auto-schema-product").textContent = JSON.stringify(schemaData, null, 2);
    console.log(`[AutoSchema Product v4.29] ✅ Injected untuk ${areaServed.length} area`);
  }, 500);
});
