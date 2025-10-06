// ⚡ AUTO SCHEMA UNIVERSAL v4.3 — Optimized for Produk Pages (Brand Dinamis + ItemList Valid + Seller Linked)
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    console.log("[AutoSchema] 🚀 Deteksi otomatis dimulai...");

    // === 1️⃣ URL NORMALISASI (hapus m=1 agar canonical tetap bersih) ===
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const baseUrl = ogUrl || canonical || location.href;
    const url = baseUrl.replace(/[?&]m=1/, "");

    // === 2️⃣ URL INDUK ===
    const parentMeta = document.querySelector('meta[name="parent-url"]')?.content?.trim();
    const parentUrl = parentMeta || (() => {
      const breadcrumbLinks = Array.from(document.querySelectorAll("nav.breadcrumbs a"))
        .map(a => a.href)
        .filter(href => href !== location.href);
      return breadcrumbLinks.length ? breadcrumbLinks.pop() : location.origin;
    })();

    // === 3️⃣ TITLE & DESCRIPTION ===
    const title = document.querySelector("h1")?.innerText?.trim() || document.title.trim();
    const metaDesc = document.querySelector('meta[name="description"]')?.content?.trim();
    const desc = metaDesc && metaDesc.length > 50
      ? metaDesc
      : Array.from(document.querySelectorAll("p"))
          .map(p => p.innerText.trim())
          .filter(Boolean)
          .join(" ")
          .substring(0, 300);

    // === 4️⃣ GAMBAR UTAMA ===
    let image =
      document.querySelector('meta[property="og:image"]')?.content ||
      document.querySelector("article img, main img, .post-body img, img")?.src;
    if (!image || image.startsWith("data:")) {
      image =
        "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";
    }

    // === 5️⃣ AREA SERVED ===
    const areaList = ["Jakarta","Bekasi","Bogor","Depok","Tangerang","Karawang","Serang","Cilegon","Banten","Jawa Barat","Jabodetabek"];
    const foundArea = areaList.find(a => url.toLowerCase().includes(a.toLowerCase().replace(/\s+/g, "-")));
    const areaServed = foundArea
      ? [{ "@type": "Place", name: foundArea }]
      : areaList.map(a => ({ "@type": "Place", name: a }));

    // === 6️⃣ DETEKSI TIPE HALAMAN ===
    const textAll = document.body.innerText.toLowerCase();
    let category = "Jasa & Material Konstruksi";
    let isProductPage = false;
    let isServicePage = false;

    const productKeywords = /readymix|beton|precast|baja|besi|acp|wpc|semen|grc|gypsum|keramik|bata|genteng|pasir|split|batu|pipa|cat|plester|conblock|paving|atap|asbes|kawat|buis|box culvert|u ditch|panel|kaca|tanah|paku|lem|pagar|kanopi|aspal|material|produk|mortar|hebel|batako/i;
    const serviceKeywords = /sewa|rental|jasa|kontraktor|pengaspalan|renovasi|pemasangan|borongan|perbaikan|pembangunan|pancang|angkut|cut fill|pembongkaran|pengiriman/i;

    if (productKeywords.test(textAll)) {
      category = "Produk Material & Konstruksi";
      isProductPage = true;
    }
    if (serviceKeywords.test(textAll)) {
      category = "Layanan Jasa Konstruksi & Alat Berat";
      isServicePage = true;
    }

    // === 7️⃣ DETEKSI BRAND OTOMATIS ===
    let brandName = "Beton Jaya Readymix";
    const brandMatch = textAll.match(/jayamix|adhimix|holcim|scg|pionir|dynamix|tiga roda|solusi bangun/i);
    if (brandMatch) {
      brandName = brandMatch[0].trim().replace(/\b\w/g, l => l.toUpperCase());
    }

    // === 8️⃣ DETEKSI HARGA ===
    const priceRegex = /Rp\s*([\d.]+)(?:\s*[-–]\s*Rp\s*([\d.]+))?/gi;
    let match, pricePairs = [], allPrices = [];
    while ((match = priceRegex.exec(document.body.innerText)) !== null) {
      const low = parseInt(match[1].replace(/\./g, ""));
      const high = match[2] ? parseInt(match[2].replace(/\./g, "")) : low;
      if (!isNaN(low) && !isNaN(high)) {
        pricePairs.push({ low, high });
        allPrices.push(low, high);
      }
    }

    const offerCount = Math.min(pricePairs.length, 100);
    const lowPrice = offerCount ? Math.min(...allPrices) : undefined;
    const highPrice = offerCount ? Math.max(...allPrices) : undefined;

    const offers = pricePairs.slice(0, 100).map(p => ({
      "@type": "Offer",
      priceCurrency: "IDR",
      price: ((p.low + p.high) / 2).toFixed(0),
      availability: "https://schema.org/InStock",
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
      url,
      seller: { "@id": "https://www.betonjayareadymix.com/#localbusiness" }
    }));

    // === 9️⃣ ITEMLIST PRODUK TANPA DUPLIKAT ===
    const allLinks = Array.from(document.querySelectorAll("a[href*='betonjayareadymix.com']")).map(a => ({
      name: a.innerText.trim(),
      url: a.href.trim(),
      desc: a.title || a.innerText.trim()
    }));

    const relevantLinks = allLinks
      .filter(l => /jayamix|ready-mix|beton|precast|minimix|mutu|harga|plant|produk|material|bata|genteng|atap|besi|semen|box|u-ditch|panel|buis/i.test(l.url + " " + l.name))
      .filter((v, i, a) => a.findIndex(t => t.url === v.url) === i)
      .slice(0, 25);

    const itemListElement = relevantLinks.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: item.name || item.url.split("/").pop().replace(/[-_]/g, " "),
        url: item.url,
        description: item.desc || title,
        image,
        brand: { "@type": "Brand", name: brandName },
        seller: { "@id": "https://www.betonjayareadymix.com/#localbusiness" }
      }
    }));

    // === 🔟 DATA BISNIS ===
    const business = {
      "@type": ["LocalBusiness", "GeneralContractor"],
      "@id": "https://www.betonjayareadymix.com/#localbusiness",
      name: "Beton Jaya Readymix",
      url: "https://www.betonjayareadymix.com",
      telephone: "+6283839000968",
      openingHours: "Mo-Sa 08:00-17:00",
      description: "Beton Jaya Readymix menyediakan beton ready mix, precast, baja ringan, ACP, WPC, besi, serta layanan konstruksi & alat berat di seluruh Indonesia.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bogor",
        addressRegion: "Jawa Barat",
        addressCountry: "ID"
      },
      sameAs: [
        "https://www.facebook.com/betonjayareadymix",
        "https://www.instagram.com/betonjayareadymix"
      ],
      logo: image
    };

    // === 11️⃣ ENTITY UTAMA (PRODUCT) ===
    const mainEntity = {
      "@type": "Product",
      "@id": url + "#product",
      name: title,
      description: desc,
      image,
      category,
      brand: { "@type": "Brand", "name": brandName },
      areaServed,
      seller: { "@id": business["@id"] }
    };

    if (offerCount > 0 && lowPrice) {
      mainEntity.aggregateOffer = {
        "@type": "AggregateOffer",
        priceCurrency: "IDR",
        lowPrice,
        highPrice,
        offerCount,
        availability: "https://schema.org/InStock",
        priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
        url
      };
      mainEntity.offers = offers;
    }

    // === 12️⃣ GRAPH FINAL ===
    const graph = [
      {
        "@type": "WebPage",
        "@id": url + "#webpage",
        url,
        name: title,
        description: desc,
        image,
        mainEntity: { "@id": mainEntity["@id"] },
        isPartOf: { "@id": parentUrl },
        publisher: { "@id": business["@id"] }
      },
      business,
      mainEntity
    ];

    if (itemListElement.length > 0) {
      graph.push({
        "@type": "ItemList",
        name: "Daftar Produk & Material Terkait",
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        numberOfItems: itemListElement.length,
        itemListElement
      });
      console.log(`[AutoSchema] 🧩 ItemList aktif (${itemListElement.length} produk relevan).`);
    } else {
      console.log("[AutoSchema] ℹ️ Tidak ada URL relevan untuk ItemList.");
    }

    // === 13️⃣ OUTPUT JSON-LD ===
    const schemaData = { "@context": "https://schema.org", "@graph": graph };
    document.querySelector("#auto-schema-product").textContent = JSON.stringify(schemaData, null, 2);
    console.log(`[AutoSchema] ✅ JSON-LD sukses — Product: ${title}, Brand: ${brandName}, Offers: ${offerCount}`);
  }, 600);
});
