// ⚡ AutoSchema Hybrid v4.53+ — Product + Service + Offers + isPartOf (Smart Multi) + Auto AreaServed | Beton Jaya Readymix
document.addEventListener("DOMContentLoaded", async function () {
  setTimeout(async () => {
    console.log("[AutoSchema Hybrid v4.53+ 🚀] Start detection (Service + Product + Offers + isPartOf + Auto AreaServed)");

    const fallbackImage = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";

    // === 1️⃣ META DASAR ===
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const cleanUrl = (ogUrl || canonical || location.href).replace(/[?&]m=1/, "");
    const titleRaw = document.querySelector("h1")?.innerText?.trim() || document.title.trim();
    const title = titleRaw.replace(/\s{2,}/g," ").trim().substring(0,120);
    const metaDesc = document.querySelector('meta[name="description"]')?.content?.trim();
    const desc = metaDesc || Array.from(document.querySelectorAll("p")).map(p => p.innerText.trim()).join(" ").substring(0, 300);

    // === 2️⃣ SMART MULTI isPartOf DETECTION ===
    function detectParentUrls() {
      const urls = new Set();
      const breadcrumbLinks = Array.from(document.querySelectorAll(".breadcrumbs a"))
        .map(a => a.href)
        .filter(href => href && href !== location.href);
      breadcrumbLinks.forEach(url => urls.add(url));

      const metaParent = document.querySelector('meta[name="parent-url"]')?.content?.trim();
      if (metaParent && !urls.has(metaParent)) urls.add(metaParent);
      if (urls.size === 0) urls.add(location.origin);
      return Array.from(urls).map(u => ({ "@type": "WebPage", "@id": u }));
    }
    const parentUrls = detectParentUrls();

    // === 3️⃣ IMAGE DETECTION ===
    let contentImage = "";
    const imgEl = document.querySelector("article img, main img, .post-body img, table img, img");
    if (imgEl && imgEl.src && !/favicon|blank|logo/i.test(imgEl.src)) contentImage = imgEl.src.trim();
    if (!contentImage) contentImage = fallbackImage;

    // === 4️⃣ AREA SERVED ===
    const areaProv = {
      "Kabupaten Bogor": "Jawa Barat","Kota Bogor": "Jawa Barat",
      "Kota Depok": "Jawa Barat","Kabupaten Bekasi": "Jawa Barat",
      "Kota Bekasi": "Jawa Barat","Kabupaten Karawang": "Jawa Barat",
      "Kabupaten Serang": "Banten","Kota Serang": "Banten",
      "Kota Cilegon": "Banten","Kabupaten Tangerang": "Banten",
      "Kota Tangerang": "Banten","Kota Tangerang Selatan": "Banten",
      "DKI Jakarta": "DKI Jakarta"
    };
    const defaultAreaServed = Object.keys(areaProv).map(a => ({ "@type":"Place", name: a }));

    async function detectAreaServed() {
      const h1 = titleRaw.toLowerCase();
      for (const [kota, prov] of Object.entries(areaProv)) {
        const nameLow = kota.toLowerCase().replace("kabupaten ", "").replace("kota ", "");
        if (h1.includes(nameLow)) {
          return [{ "@type": "Place", name: kota, addressRegion: prov }];
        }
      }
      return defaultAreaServed;
    }
    const productAreaServed = await detectAreaServed();

    // === 5️⃣ BRAND DETECTION ===
    const text = document.body.innerText.toLowerCase();
    let brandName = "Beton Jaya Readymix";
    const brandMatch = text.match(/jayamix|adhimix|holcim|scg|pionir|dynamix|tiga roda|solusi bangun/i);
    if (brandMatch) brandName = brandMatch[0].replace(/\b\w/g, l => l.toUpperCase());

    // === 6️⃣ PRODUCT NAME FROM URL ===
    function getProductNameFromUrl() {
      let path = location.pathname.replace(/^\/|\/$/g,"").split("/").pop();
      path = path.replace(".html","").replace(/-/g," ");
      return decodeURIComponent(path).replace(/\b\w/g, l => l.toUpperCase());
    }
    const productName = getProductNameFromUrl();

    // === 7️⃣ DETEKSI KATEGORI PRODUK ===
    const productKeywords = {
      BuildingMaterial: ["beton","ready mix","precast","buis","gorong gorong","panel","semen","besi","pipa"],
      ConstructionEquipment: ["excavator","bulldozer","crane","vibro roller","tandem roller","wales","grader","dump truck"]
    };
    let productCategory = "Product";
    let wikipediaLink = "https://id.wikipedia.org/wiki/Produk";
    for(const [category, keywords] of Object.entries(productKeywords)){
      if(keywords.some(k => productName.toLowerCase().includes(k))){
        productCategory = category;
        wikipediaLink = category==="BuildingMaterial" ? "https://id.wikipedia.org/wiki/Beton" : "https://id.wikipedia.org/wiki/Alat_berat";
        break;
      }
    }

    // === 🧩 PARSER TABLE, TEKS, & LI HARGA ===
    const seenItems = new Set();
    const tableOffers = [];

    function addOffer(name, key, price, desc = "") {
      let finalName = productName;
      if (name && name.toLowerCase() !== productName.toLowerCase()) {
        finalName += " " + name;
      }
      const k = finalName + "|" + key + "|" + price;
      if (seenItems.has(k)) return;
      seenItems.add(k);

      let validUntil = "";
      try {
        if (window.AEDMetaDates && window.AEDMetaDates.nextUpdate) {
          validUntil = new Date(window.AEDMetaDates.nextUpdate).toISOString().split("T")[0];
        }
      } catch (err) {
        console.warn("[Offer Builder] Gagal ambil AEDMetaDates:", err);
      }

      tableOffers.push({
        "@type": "Offer",
        "name": finalName,
        "url": cleanUrl,
        "priceCurrency": "IDR",
        "price": price.toString(),
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": validUntil,
        "seller": { "@id": "https://www.betonjayareadymix.com/#localbusiness" },
        "description": desc || undefined
      });
    }

    // === 🧩 DETEKSI HARGA DARI TABEL / TEKS ===
    document.querySelectorAll("table tr").forEach(row=>{
      const cells = Array.from(row.querySelectorAll("td, th"));
      const m = row.innerText.match(/Rp\s*([\d.,]+)/);
      if(m){
        const price = parseInt(m[1].replace(/[.\s,]/g,""));
        if(price) addOffer(cells[0]?.innerText.trim()||"", "", price);
      }
    });

    document.querySelectorAll("li").forEach(li=>{
      const m = li.innerText.match(/Rp\s*([\d.,]+)/);
      if(m){
        const price = parseInt(m[1].replace(/[.\s,]/g,""));
        if(price) addOffer(li.innerText.replace(m[0], "").trim(), "", price);
      }
    });

    console.log("[Parser v3] Total detected offers:", tableOffers.length);

    // === 🩺  Fallback schema OFFER kalau tidak ada ===
    if (tableOffers.length === 0) {
      console.warn("[Fallback Offer] Tidak ada offers terdeteksi — membuat fallback schema otomatis.");
      tableOffers.push({
        "@type": "Offer",
        "name": productName + " (Estimasi Harga)",
        "url": cleanUrl,
        "priceCurrency": "IDR",
        "price": "0",
        "availability": "https://schema.org/PreOrder",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": { "@id": "https://www.betonjayareadymix.com/#localbusiness" },
        "description": "Hubungi Beton Jaya Readymix untuk informasi harga terbaru dan penawaran khusus."
      });
    }

    // === 12️⃣ BUSINESS ENTITY ===
    const business = {
      "@type":["LocalBusiness","GeneralContractor"],
      "@id":"https://www.betonjayareadymix.com/#localbusiness",
      name:"Beton Jaya Readymix",
      url:"https://www.betonjayareadymix.com",
      telephone:"+6283839000968",
      address:{ "@type":"PostalAddress", addressLocality:"Bogor", addressRegion:"Jawa Barat", addressCountry:"ID" },
      description:"Penyedia beton ready mix, precast, dan jasa konstruksi profesional wilayah Jabodetabek dan sekitarnya.",
      areaServed: defaultAreaServed,
      sameAs:["https://www.facebook.com/betonjayareadymix","https://www.instagram.com/betonjayareadymix"],
      logo: fallbackImage
    };

    // === 13️⃣ MAIN ENTITY PRODUCT ===
    const mainEntity = {
      "@type":"Product",
      "@id": cleanUrl+"#product",
      "mainEntityOfPage": { "@type":"WebPage","@id": cleanUrl+"#webpage" },
      "isPartOf": parentUrls,
      name: productName,
      image: [ contentImage || fallbackImage ],
      description: desc,
      brand: { "@type":"Brand", name: brandName },
      category: productCategory,
      sameAs: wikipediaLink,
      provider: { "@id": business["@id"] },
      offers: tableOffers,
      areaServed: productAreaServed
    };

    // === 14️⃣ WEBPAGE ===
    const webpage = {
      "@type":"WebPage",
      "@id": cleanUrl+"#webpage",
      url: cleanUrl,
      name: title,
      description: desc,
      image: [ contentImage || fallbackImage ],
      mainEntity: { "@id": mainEntity["@id"] },
      publisher: { "@id": business["@id"] },
      "isPartOf": parentUrls
    };

    // === 15️⃣ BUILD GRAPH + OUTPUT JSON-LD ===
    const graph = [webpage, business, mainEntity];
    let scriptEl = document.querySelector("#auto-schema-product");
    if(!scriptEl){
      scriptEl = document.createElement("script");
      scriptEl.type = "application/ld+json";
      scriptEl.id="auto-schema-product";
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify({ "@context":"https://schema.org", "@graph": graph }, null, 2);
    console.log(`[AutoSchema v4.53+ ✅] Product: ${productName} | Offers: ${tableOffers.length}`);
  }, 500);
});
