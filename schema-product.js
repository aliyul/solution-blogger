// ⚡ AutoSchema Hybrid v4.54 — Product + Offers + isPartOf + Auto AreaServed | Beton Jaya Readymix
document.addEventListener("DOMContentLoaded", async function () {
  setTimeout(async () => {
    console.log("[AutoSchema Hybrid v4.54 🚀] Start detection");

    const fallbackImage = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";

    // === 1️⃣ META DASAR ===
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const cleanUrl = (ogUrl || canonical || location.href).replace(/[?&]m=1/, "");
    const titleRaw = document.querySelector("h1")?.innerText?.trim() || document.title.trim();
    const title = titleRaw.replace(/\s{2,}/g," ").trim().substring(0,120);
    const metaDesc = document.querySelector('meta[name="description"]')?.content?.trim();
    const desc = metaDesc || Array.from(document.querySelectorAll("p"))
      .map(p => p.innerText.trim()).join(" ").substring(0, 300);

    // === 2️⃣ SMART MULTI isPartOf ===
    function detectParentUrls() {
      const urls = new Set();
      document.querySelectorAll(".breadcrumbs a").forEach(a => {
        if (a.href && a.href !== location.href) urls.add(a.href);
      });
      const metaParent = document.querySelector('meta[name="parent-url"]')?.content;
      if (metaParent) urls.add(metaParent);
      if (urls.size === 0) urls.add(location.origin);
      return Array.from(urls).map(u => ({ "@type":"WebPage", "@id": u }));
    }
    const parentUrls = detectParentUrls();

    // === 3️⃣ IMAGE ===
    let contentImage = document.querySelector("article img, main img, .post-body img")?.src || fallbackImage;

    // === 4️⃣ AREA SERVED ===
    const areaProv = {
      "Kabupaten Bogor":"Jawa Barat","Kota Bogor":"Jawa Barat","Kota Depok":"Jawa Barat",
      "Kabupaten Bekasi":"Jawa Barat","Kota Bekasi":"Jawa Barat","Kabupaten Karawang":"Jawa Barat",
      "DKI Jakarta":"DKI Jakarta"
    };
    const defaultAreaServed = Object.keys(areaProv).map(a => ({ "@type":"Place", name:a }));
    const productAreaServed = defaultAreaServed;

    // === 5️⃣ BRAND ===
    const brandName = "Beton Jaya Readymix";

    // === 6️⃣ PRODUCT NAME ===
    const productName = decodeURIComponent(
      location.pathname.split("/").pop().replace(".html","").replace(/-/g," ")
    ).replace(/\b\w/g, l => l.toUpperCase());

    // === 7️⃣ KATEGORI ===
    let productCategory = "BuildingMaterial";
    let wikipediaLink = "https://id.wikipedia.org/wiki/Beton";

    // ======================================================
    // === 📅 VALID UNTIL (FIX UTAMA — WAJIB DI SINI)
    // ======================================================
    const fallbackValidUntil = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString().split("T")[0];

    const validUntil =
      window.AEDMetaDates?.nextUpdate || fallbackValidUntil;

    // === 🧩 OFFER PARSER ===
    const seenItems = new Set();
    const tableOffers = [];

    function addOffer(name, price, desc = "") {
      const numericPrice = Number(price);
      if (isNaN(numericPrice)) return;

      const finalName = productName + (name ? " " + name : "");
      const key = finalName + "|" + numericPrice;
      if (seenItems.has(key)) return;
      seenItems.add(key);

      tableOffers.push({
        "@type":"Offer",
        name: finalName,
        url: cleanUrl,
        priceCurrency:"IDR",
        price: numericPrice,
        priceValidUntil: validUntil,
        availability:"https://schema.org/InStock",
        itemCondition:"https://schema.org/NewCondition",
        seller:{ "@id":"https://www.betonjayareadymix.com/#localbusiness" },
        description: desc || undefined
      });
    }

    // === 🧩 DETEKSI HARGA ===
    document.querySelectorAll("table tr, li, p").forEach(el => {
      const m = el.innerText.match(/Rp\s*([\d.,]+)/);
      if (m) {
        const price = parseInt(m[1].replace(/[^\d]/g,""));
        if (price) addOffer(el.innerText.replace(m[0], "").trim(), price);
      }
    });

    // === FALLBACK OFFER ===
    if (!tableOffers.length) {
      tableOffers.push({
        "@type":"Offer",
        name: productName + " (Estimasi Harga)",
        url: cleanUrl,
        priceCurrency:"IDR",
        price: 0,
        priceValidUntil: validUntil,
        availability:"https://schema.org/PreOrder",
        itemCondition:"https://schema.org/NewCondition",
        seller:{ "@id":"https://www.betonjayareadymix.com/#localbusiness" },
        description:"Hubungi Beton Jaya Readymix untuk harga terbaru."
      });
    }

    // === BUSINESS ===
    const business = {
      "@type":"LocalBusiness",
      "@id":"https://www.betonjayareadymix.com/#localbusiness",
      name:"Beton Jaya Readymix",
      url:"https://www.betonjayareadymix.com",
      logo: fallbackImage
    };

    // === PRODUCT ===
    const product = {
      "@type":"Product",
      "@id": cleanUrl + "#product",
      name: productName,
      image:[contentImage],
      description: desc,
      brand:{ "@type":"Brand", name:brandName },
      category: productCategory,
      sameAs: wikipediaLink,
      offers: tableOffers,
      areaServed: productAreaServed,
      isPartOf: parentUrls
    };

    // === WEBPAGE ===
    const webpage = {
      "@type":"WebPage",
      "@id": cleanUrl+"#webpage",
      url: cleanUrl,
      name: title,
      mainEntity:{ "@id": product["@id"] },
      isPartOf: parentUrls
    };

      // === 15️⃣ BUILD GRAPH + OUTPUT JSON-LD ===
      const graph = [webpage, business, mainEntity];
      
      let scriptEl = document.querySelector("#auto-schema-product");
      if (!scriptEl) {
        scriptEl = document.createElement("script");
        scriptEl.type = "application/ld+json";
        scriptEl.id = "auto-schema-product";
        document.head.appendChild(scriptEl);
      }
      
      scriptEl.textContent = JSON.stringify(
        {
          "@context": "https://schema.org",
          "@graph": graph
        },
        null,
        2
      );
      
      console.log(
        `[AutoSchema v4.53+ ✅] Product: ${productName} | Offers: ${tableOffers.length}`
      );

  }, 500);
});
