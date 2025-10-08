document.addEventListener("DOMContentLoaded", async function () {
  setTimeout(async () => {
    console.log("[Schema Service v4.33+dual 🚀] Auto generator dijalankan (dual-purpose detection)");

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

    // === 3️⃣ FETCH & CACHE WIKIPEDIA (sama) ===
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

    // === 5️⃣ DETEKSI SERVICE TYPE ===
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
    const serviceTypes = detectServiceType();

    // === 6️⃣ DETEKSI HARGA (teks, tabel, list) — aman ===
    function findPricesInText(text) {
      const matches = [...text.matchAll(/Rp\s*([\d.,]{4,})/g)];
      return matches
        .map((m) => parseInt(m[1].replace(/[.\s,]/g, ""), 10))
        .filter((v) => Number.isFinite(v) && v >= 10000 && v <= 500000000);
    }

    // parse tables and collect offers (name + price)
    function parseTableOffers() {
      const offers = [];
      const rows = Array.from(document.querySelectorAll("table tr"));
      rows.forEach((r) => {
        const cells = r.querySelectorAll("td, th");
        if (cells.length >= 2) {
          const name = cells[0].innerText.trim();
          const priceMatch = cells[1].innerText.match(/Rp\s*([\d.,]+)/);
          if (name && priceMatch) {
            const price = parseInt(priceMatch[1].replace(/[.\s,]/g, ""), 10);
            if (Number.isFinite(price) && price >= 10000 && price <= 500000000) {
              offers.push({ name, price });
            }
          }
        }
      });
      return offers;
    }

    // parse list items with prices
    function parseListOffers() {
      const offers = [];
      const lis = Array.from(document.querySelectorAll("li"));
      lis.forEach((li) => {
        const txt = li.innerText.trim();
        const priceMatch = txt.match(/(.+?)\s*[-:–]\s*Rp\s*([\d.,]+)/) || txt.match(/Rp\s*([\d.,]+)\s*[-:–]\s*(.+)/);
        if (priceMatch) {
          if (priceMatch.length >= 3) {
            // try to detect name and price in either order
            const maybeName = priceMatch[1].trim();
            const maybePrice = priceMatch[2] ? priceMatch[2] : priceMatch[1];
            const price = parseInt(maybePrice.replace(/[.\s,]/g, ""), 10);
            const name = maybeName && !/rp\s*/i.test(maybeName) ? maybeName : (li.querySelector("strong")?.innerText || li.innerText.replace(/Rp[\s\d.,-–:]+/i,"").trim()).substring(0,100);
            if (name && Number.isFinite(price) && price >= 10000 && price <= 500000000) {
              offers.push({ name, price });
            }
          }
        } else {
          // fallback: search for price inside li and use surrounding text as name
          const priceOnly = li.innerText.match(/Rp\s*([\d.,]{4,})/);
          if (priceOnly) {
            const price = parseInt(priceOnly[1].replace(/[.\s,]/g, ""), 10);
            const name = li.innerText.replace(priceOnly[0], "").trim().substring(0,100) || "Item";
            if (Number.isFinite(price) && price >= 10000 && price <= 500000000) {
              offers.push({ name, price });
            }
          }
        }
      });
      return offers;
    }

    // aggregate prices found from different sources
    const pricesFromText = findPricesInText(document.body.innerText || "");
    const tableOffers = parseTableOffers(); // [{name, price}, ...]
    const listOffers = parseListOffers();

    // combine offer prices (unique by name+price)
    const combinedOffersMap = new Map();
    tableOffers.concat(listOffers).forEach((o) => {
      const key = (o.name || "").toLowerCase().replace(/\s+/g, " ").trim() + "::" + o.price;
      if (!combinedOffersMap.has(key)) combinedOffersMap.set(key, o);
    });
    // also include standalone prices from text (if not in offers), assign generic names
    pricesFromText.forEach((p, idx) => {
      const key = `__price_only__::${p}`;
      if (!combinedOffersMap.has(key)) combinedOffersMap.set(key, { name: `Harga ${idx+1}`, price: p });
    });
    const combinedOffers = Array.from(combinedOffersMap.values()); // array of {name, price}

    // compute priceData from combinedOffers (if any) otherwise from pricesFromText
    const allPrices = combinedOffers.length ? combinedOffers.map(o => o.price) : pricesFromText;
    const priceData = allPrices && allPrices.length ? {
      lowPrice: Math.min(...allPrices),
      highPrice: Math.max(...allPrices),
      offerCount: allPrices.length,
      priceCurrency: "IDR",
      priceValidUntil: new Date(Date.now() + 86400000 * 90).toISOString().split("T")[0],
    } : null;

    // === 7️⃣ DETEKSI PRODUK (dual-purpose) ===
    // keywords for product detection
    const productSignal = /(jual|harga|produk|penjualan|katalog|daftar harga|price list|tabel harga|jual beton|ready mix|precast|pipa|panel|buis)/i;
    const isProductPage = productSignal.test((PAGE.title + " " + PAGE.description + " " + document.body.innerText).toLowerCase()) || combinedOffers.length > 0;

    // === 8️⃣ INTERNAL LINKS (unique URLs only) ===
    const anchors = Array.from(document.querySelectorAll("article a, main a, .post-body a, a"))
      .filter(a => a.href && typeof a.href === "string" && a.href.includes(location.hostname) && a.href !== location.href && !a.href.includes("#") && (a.innerText||"").trim().length > 0)
      .map(a => ({ url: a.href.split("#")[0].trim(), name: a.innerText.trim() || a.href.split("#")[0].trim() }));

    // dedupe by normalized url (only keep first occurrence)
    const uniqueMap = new Map();
    anchors.forEach(item => {
      const url = item.url;
      if (!uniqueMap.has(url)) uniqueMap.set(url, item.name);
    });
    const internalLinks = Array.from(uniqueMap.entries()).map(([url, name], i) => ({
      "@type": "ListItem",
      position: i + 1,
      url,
      name,
    }));

    // === 9️⃣ BANGUN GRAPH: LocalBusiness & WebPage & Service (tetap) ===
    const graph = [];

    // LocalBusiness
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
      sameAs: PAGE.business.sameAs,
      areaServed,
    });

    // WebPage
    const webpageObj = {
      "@type": "WebPage",
      "@id": PAGE.url + "#webpage",
      url: PAGE.url,
      name: PAGE.title,
      description: PAGE.description,
      image: PAGE.image,
      mainEntity: { "@id": PAGE.url + "#service" },
      publisher: { "@id": PAGE.business.url + "#localbusiness" },
      ...(internalLinks.length && { hasPart: { "@id": PAGE.url + "#daftar-internal-link" } }),
    };
    graph.push(webpageObj);

    // Service (always present for service pages)
    const serviceObj = {
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
          priceCurrency: priceData.priceCurrency,
          lowPrice: priceData.lowPrice,
          highPrice: priceData.highPrice,
          offerCount: priceData.offerCount,
          availability: "https://schema.org/InStock",
          priceValidUntil: priceData.priceValidUntil,
          url: PAGE.url,
        }
      })
    };
    graph.push(serviceObj);

    // === 🔟 Jika terdeteksi Product (dual-purpose), tambahkan Product schema ***
    if (isProductPage) {
      const product = {
        "@type": "Product",
        "@id": PAGE.url + "#product",
        name: PAGE.title,
        description: PAGE.description,
        image: PAGE.image,
        brand: { "@type": "Brand", name: PAGE.business.name },
        ...(priceData && { // jika ada priceData, masukkan AggregateOffer
          offers: combinedOffers.length >= 3 ? { // jika kita punya offers detail (≥3) gunakan OfferCatalog
            "@type": "OfferCatalog",
            name: "Katalog Harga",
            itemListElement: combinedOffers.map((o, idx) => ({
              "@type": "Offer",
              itemOffered: { "@type": "Product", name: o.name || `Item ${idx+1}` },
              price: o.price,
              priceCurrency: "IDR",
              availability: "https://schema.org/InStock",
            }))
          } : {
            "@type": "AggregateOffer",
            priceCurrency: priceData.priceCurrency,
            lowPrice: priceData.lowPrice,
            highPrice: priceData.highPrice,
            offerCount: priceData.offerCount,
            availability: "https://schema.org/InStock",
            priceValidUntil: priceData.priceValidUntil,
            url: PAGE.url,
          }
        }),
        ...(areaServed && { areaServed }),
        provider: { "@id": PAGE.business.url + "#localbusiness" }
      };
      graph.push(product);
    }

    // === 11️⃣ ItemList internal links jika ada ===
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

    // === 12️⃣ OUTPUT ===
    const schema = { "@context": "https://schema.org", "@graph": graph };
    document.querySelector("#auto-schema-service").textContent = JSON.stringify(schema, null, 2);

    console.log(
      `[Schema Service v4.33+dual ✅] Injected | ServiceTypes: ${serviceTypes.join(", ")} | ProductAdded: ${isProductPage ? "Yes":"No"} | Prices: ${priceData ? "Found":"None"} | Area: ${areaServed.length} | Links: ${internalLinks.length}`
    );

  }, 500);
});
