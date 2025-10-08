document.addEventListener("DOMContentLoaded", async function () {
  setTimeout(async () => {
    console.log("[AutoSchema Hybrid v4.43 🚀] Start detection (Optimized Product + Service + OfferCatalog)");

    // === 1️⃣ META DASAR ===
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const cleanUrl = (ogUrl || canonical || location.href).replace(/[?&]m=1/, "");
    const titleRaw = document.querySelector("h1")?.innerText?.trim() || document.title.trim();
    const title = titleRaw.replace(/\s{2,}/g," ").trim().substring(0,120);
    const metaDesc = document.querySelector('meta[name="description"]')?.content?.trim();
    const desc =
      metaDesc ||
      Array.from(document.querySelectorAll("p"))
        .map((p) => p.innerText.trim())
        .join(" ")
        .substring(0, 300);

    // === 2️⃣ SMART IMAGE DETECTION ===
    let image = document.querySelector('meta[property="og:image"]')?.content?.trim();
    if (!image) {
      const imgEl = document.querySelector("table img, article img, main img, .post-body img, img");
      if (imgEl && imgEl.src && !imgEl.src.includes("favicon")) image = imgEl.src;
    }
    if (!image) {
      image = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";
    }

    // === 3️⃣ AREA DASAR ===
    const areaProv = {
      "Kabupaten Bogor": "Jawa Barat", "Kota Bogor": "Jawa Barat",
      "Kota Depok": "Jawa Barat", "Kabupaten Bekasi": "Jawa Barat",
      "Kota Bekasi": "Jawa Barat", "Kabupaten Karawang": "Jawa Barat",
      "Kabupaten Serang": "Banten", "Kota Serang": "Banten",
      "Kota Cilegon": "Banten", "Kabupaten Tangerang": "Banten",
      "Kota Tangerang": "Banten", "Kota Tangerang Selatan": "Banten",
      "DKI Jakarta": "DKI Jakarta"
    };
    const defaultAreaServed = Object.keys(areaProv).map((a) => ({ "@type": "Place", name: a }));

    // === 4️⃣ & 5️⃣ WIKI CACHING & DETEKSI AREA ===
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
      const pages = [type === "kecamatan" ? `Daftar_kecamatan_di_${formatted}` : `Daftar_kelurahan_dan_desa_di_kecamatan_${formatted}`];
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
        } catch (e) { console.warn("⚠️ Wikipedia fetch error:", areaName, e); }
      }
      return null;
    }

    async function detectArea(url, title) {
      const combined = (url + " " + title).toLowerCase();
      for (const area of Object.keys(areaProv)) {
        const slug = area.toLowerCase().replace(/\s+/g, "-");
        if (combined.includes(slug) || combined.includes(area.toLowerCase().replace(/\s+/g, ""))) {
          const list = await getCachedWiki(area, "kecamatan");
          if (list?.length) return list;
          return [{ "@type": "Place", name: area }];
        }
      }
      const match = combined.match(/kecamatan-?([a-z\s-]+)-(bogor|bekasi|depok|tangerang|karawang|serang|jakarta)/);
      if (match) {
        const kec = match[1].trim().replace(/-/g, " ");
        const list = await getCachedWiki(kec, "kelurahan");
        if (list?.length) return list.map((a) => ({ "@type": "Place", name: "Kelurahan " + a.name }));
        return [{ "@type": "Place", name: "Kecamatan " + kec }];
      }
      return defaultAreaServed;
    }

    const areaServed = await detectArea(cleanUrl, title);

    // === 6️⃣ BRAND DETECTION ===
    const text = document.body.innerText.toLowerCase();
    let brandName = "Beton Jaya Readymix";
    const brandMatch = text.match(/jayamix|adhimix|holcim|scg|pionir|dynamix|tiga roda|solusi bangun/i);
    if (brandMatch) brandName = brandMatch[0].replace(/\b\w/g, (l) => l.toUpperCase());

    // === 7️⃣ PAGE TYPE ===
    const jasaKeywords = /(jasa|sewa|borongan|kontraktor|layanan|service|perbaikan|pemasangan)/i;
    const produkKeywords = /(produk|beton|readymix|precast|pipa|u[- ]?ditch|box culvert|panel)/i;
    const catalogKeywords = /(daftar harga|katalog|tabel harga|list harga|price list)/i;

    const headingsText = Array.from(document.querySelectorAll("h1, h2"))
      .map(h => h.innerText.toLowerCase())
      .join(" ");

    const hasJasa = jasaKeywords.test(text) || jasaKeywords.test(headingsText);
    const hasProduk = produkKeywords.test(text) || produkKeywords.test(headingsText);
    const hasCatalog = catalogKeywords.test(text);

    let mainType = "Product";
    if (hasJasa && hasProduk) mainType = ["Product", "Service"];
    else if (hasJasa) mainType = "Service";
    else if (hasCatalog) mainType = "OfferCatalog";

    // === 8️⃣ PARSER TABEL & TEKS REAL PRICE + UNIQUE + GROUP ===
    const seenItems = new Set();
    let tableOffers = [];

    function addOffer(name, uniqueKey, price, desc="") {
      const key = name + "|" + uniqueKey + "|" + price;
      if (!seenItems.has(key)) {
        seenItems.add(key);
        tableOffers.push({
          "@type": "Offer",
          itemOffered: { "@type": "Product", name, ...(desc ? { description: desc } : {}) },
          price,
          priceCurrency: "IDR",
          availability: "https://schema.org/InStock",
        });
      }
    }

    function getTitleFromUrl() {
      let path = location.pathname.replace(/^\/|\/$/g,"").replace(/-\d{4}$/, "").replace(/-\d{1,2}$/, "");
      path = path.split("/").pop().split("-").join(" ");
      return decodeURIComponent(path);
    }

    const allTables = Array.from(document.querySelectorAll("table"));
    allTables.forEach(table => {
      const rows = Array.from(table.querySelectorAll("tr"));
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll("td, th")).slice(0, 6);
        if (cells.length >= 2) {
          let col1 = cells[0].innerText.trim();
          const isInvalidName = !col1 || /^\d+$/.test(col1) || /^\s*[-–—]\s*$/.test(col1);
          const name = isInvalidName ? `${getTitleFromUrl()} ${col1 || ""}`.trim() : col1;
          const uniqueKey = cells.slice(1).map(c => c.innerText.trim()).join(" ");
          const desc = cells[1]?.innerText.trim() || "";

          let price = null;
          for (let i = 0; i < cells.length; i++) {
            const match = cells[i].innerText.match(/Rp\s*([\d.,]+)/);
            if (match) { price = parseInt(match[1].replace(/[.\s,]/g,""),10); break; }
          }
          if (name && price && price >= 10000 && price <= 500000000) {
            addOffer(name, uniqueKey, price, desc);
          }
        }
      });
    });

    // Parser teks untuk harga di luar tabel tetap opsional
    const bodyText = document.body.innerText.split("\n");
    bodyText.forEach(line => {
      const match = line.match(/Rp\s*([\d.,]{4,})/);
      if (match) {
        const price = parseInt(match[1].replace(/[.\s,]/g,""),10);
        if (price >= 10000 && price <= 500000000) {
          const words = line.split(/\s+/);
          const priceIndex = words.findIndex(w => w.includes(match[1].replace(/[.,]/g,"")));
          const name = words.slice(Math.max(0, priceIndex-3), priceIndex).join(" ").trim() || getTitleFromUrl();
          addOffer(name, "", price);
        }
      }
    });

    if(tableOffers.length >= 3) mainType = "OfferCatalog";

    // === 9️⃣ INTERNAL LINK (UNIQUE) ===
    const rawLinks = Array.from(document.querySelectorAll("article a, main a, .post-body a"))
      .filter(a => a.href && a.href.includes(location.hostname) && a.href !== location.href)
      .map(a => ({ url: a.href, name: a.innerText.trim() }));
    const uniqueMap = new Map();
    rawLinks.forEach(item => { if (!uniqueMap.has(item.url)) uniqueMap.set(item.url, item.name||item.url); });
    const internalLinks = Array.from(uniqueMap.entries()).map(([url, name], i) => ({
      "@type": "ListItem",
      position: i + 1,
      url,
      name
    }));

    // === 🔟 BISNIS ENTITY ===
    const business = {
      "@type": ["LocalBusiness", "GeneralContractor"],
      "@id": "https://www.betonjayareadymix.com/#localbusiness",
      name: "Beton Jaya Readymix",
      url: "https://www.betonjayareadymix.com",
      telephone: "+6283839000968",
      address: { "@type": "PostalAddress", addressLocality:"Bogor", addressRegion:"Jawa Barat", addressCountry:"ID" },
      description: "Penyedia beton ready mix, precast, dan jasa konstruksi profesional wilayah Jabodetabek dan sekitarnya.",
      areaServed,
      sameAs: ["https://www.facebook.com/betonjayareadymix","https://www.instagram.com/betonjayareadymix"],
      logo: "https://www.betonjayareadymix.com/favicon.ico"
    };

    // === 11️⃣ MAIN ENTITY ===
    const mainEntity = {
      "@type": mainType,
      "@id": cleanUrl + "#mainentity",
      name: title,
      description: desc,
      image,
      areaServed,
      provider: { "@id": business["@id"] },
      brand: { "@type": "Brand", name: brandName },
      ...(tableOffers.length ? { offers: tableOffers } : null)
    };

    // === 12️⃣ WEBPAGE OUTPUT ===
    const webpage = {
      "@type": "WebPage",
      "@id": cleanUrl + "#webpage",
      url: cleanUrl,
      name: title,
      description: desc,
      image,
      mainEntity: { "@id": mainEntity["@id"] },
      publisher: { "@id": business["@id"] },
      ...(internalLinks.length && { hasPart: { "@id": cleanUrl + "#daftar-internal-link" } })
    };

    // === 13️⃣ FINAL GRAPH ===
    const graph = [webpage, business, mainEntity];
    if(internalLinks.length) graph.push({
      "@type": "ItemList",
      "@id": cleanUrl + "#daftar-internal-link",
      name: "Daftar Halaman Terkait",
      numberOfItems: internalLinks.length,
      itemListElement: internalLinks
    });

    // === 14️⃣ OUTPUT JSON-LD ===
    const schemaData = { "@context":"https://schema.org", "@graph":graph };
    document.querySelector("#auto-schema-product").textContent = JSON.stringify(schemaData, null, 2);

    console.log(`[AutoSchema v4.43 ✅] Type: ${JSON.stringify(mainType)} | Brand: ${brandName} | Items: ${tableOffers.length} | Links: ${internalLinks.length} | Area: ${areaServed.length}`);
  }, 500);
});
