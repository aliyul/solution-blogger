// ⚡ AUTO SCHEMA UNIVERSAL v4.15 — HALAMAN PRODUK & LOKAL SEO DENGAN WIKIPEDIA HIERARKI
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    console.log("[AutoSchema v4.15] 🚀 Deteksi otomatis dimulai...");

    // === 1️⃣ URL HALAMAN ===
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const url = (ogUrl || canonical || location.href).replace(/[?&]m=1/, "");

    // === 2️⃣ URL PARENT ===
    const parentMeta = document.querySelector('meta[name="parent-url"]')?.content?.trim();
    const parentUrl = parentMeta || (() => {
      const breadcrumbs = Array.from(document.querySelectorAll("nav.breadcrumbs a"))
        .map(a => a.href)
        .filter(href => href !== location.href);
      return breadcrumbs.length ? breadcrumbs.pop() : location.origin;
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

    // === 4️⃣ GAMBAR ===
    let image = document.querySelector('meta[property="og:image"]')?.content ||
      document.querySelector("article img, main img, .post-body img, img")?.src;
    if (!image || image.startsWith("data:")) {
      image = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";
    }

    // === 5️⃣ AREA SERVED HIERARKI ===
    const areaHierarchy = {
      "Sukmajaya":"Kota Depok",
      "Tapos":"Kota Depok",
      "Cilangkap":"Kota Depok",
      "Leuwinanggung":"Kota Bogor",
      "Jatijajar":"Kota Bogor",
      "Sukamaju Baru":"Kota Bogor",
      "Kota Depok":"Jawa Barat",
      "Kota Bogor":"Jawa Barat",
      "Kota Tangerang":"Banten",
      "Kota Tangerang Selatan":"Banten",
      "Kota Bekasi":"Jawa Barat",
      "Kabupaten Bogor":"Jawa Barat",
      "Kabupaten Bekasi":"Jawa Barat",
      "Kabupaten Tangerang":"Banten",
      "Kabupaten Karawang":"Jawa Barat",
      "Kota Karawang":"Jawa Barat",
      "Kota Serang":"Banten",
      "Kabupaten Serang":"Banten",
      "Kota Cilegon":"Banten",
      "DKI Jakarta":"DKI Jakarta"
    };

    function getWikipediaUrl(name){
      return "https://id.wikipedia.org/wiki/" + name.replace(/\s+/g,"_");
    }

    function detectAreaHierarki(text){
      const matchedAreas = [];
      Object.keys(areaHierarchy).forEach(area => {
        if(text.toLowerCase().includes(area.toLowerCase().replace(/\s+/g,"-"))){
          const parent = areaHierarchy[area];
          matchedAreas.push(
            { "@type":"Place","name":area,"sameAs":getWikipediaUrl(area)},
            { "@type":"Place","name":parent,"sameAs":getWikipediaUrl(parent)}
          );
        }
      });
      // Jika tidak ada yang cocok, kembalikan seluruh area default
      if(matchedAreas.length === 0){
        return Object.keys(areaHierarchy).map(a=>({ "@type":"Place","name":a,"sameAs":getWikipediaUrl(a) }));
      }
      // hapus duplikat
      const unique = [];
      const names = new Set();
      matchedAreas.forEach(a=>{
        if(!names.has(a.name)){ unique.push(a); names.add(a.name); }
      });
      return unique;
    }

    const pageAreaServed = detectAreaHierarki(url);

    // === 6️⃣ DETEKSI HALAMAN PRODUK / LAYANAN ===
    const textAll = document.body.innerText.toLowerCase();
    let category = "Jasa & Material Konstruksi";
    let isProductPage = false;
    let isServicePage = false;
    const productKeywords = /readymix|beton|precast|baja|besi|acp|wpc|semen|grc|gypsum|keramik|bata|genteng|pasir|split|batu|pipa|cat|plester|conblock|paving|atap|asbes|kawat|buis|box culvert|u ditch|panel|kaca|tanah|paku|lem|pagar|kanopi|aspal|material|produk|mortar|hebel|batako/i;
    const serviceKeywords = /sewa|rental|jasa|kontraktor|pengaspalan|renovasi|pemasangan|borongan|perbaikan|pembangunan|pancang|angkut|cut fill|pembongkaran|pengiriman/i;
    if (productKeywords.test(textAll)) { category = "Produk Material & Konstruksi"; isProductPage = true; }
    if (serviceKeywords.test(textAll)) { category = "Layanan Jasa Konstruksi & Alat Berat"; isServicePage = true; }

    // === 7️⃣ BRAND OTOMATIS ===
    let brandName = "Beton Jaya Readymix";
    const brandMatch = textAll.match(/jayamix|adhimix|holcim|scg|pionir|dynamix|tiga roda|solusi bangun/i);
    if (brandMatch) { brandName = brandMatch[0].trim().replace(/\b\w/g, l => l.toUpperCase()); }

    // === 8️⃣ DETEKSI HARGA ===
    const priceRegex = /Rp\s*([\d.]+)(?:\s*[-–]\s*Rp\s*([\d.]+))?/gi;
    let match, pricePairs = [], allPrices = [];
    while ((match = priceRegex.exec(document.body.innerText)) !== null) {
      const low = parseInt(match[1].replace(/\./g,""));
      const high = match[2] ? parseInt(match[2].replace(/\./g,"")) : low;
      if(!isNaN(low) && !isNaN(high)){ pricePairs.push({low,high}); allPrices.push(low,high); }
    }
    const offerCount = Math.min(pricePairs.length,100);
    const lowPrice = offerCount ? Math.min(...allPrices) : undefined;
    const highPrice = offerCount ? Math.max(...allPrices) : undefined;
    const offers = pricePairs.slice(0,100).map(p => ({
      "@type":"Offer",
      priceCurrency:"IDR",
      price:((p.low+p.high)/2).toFixed(0),
      availability:"https://schema.org/InStock",
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear()+1)).toISOString().split("T")[0],
      url,
      seller: {"@id":"https://www.betonjayareadymix.com/#localbusiness"}
    }));

    // === 9️⃣ ITEMLIST INTERNAL ===
    const articleLinks = Array.from(document.querySelectorAll("article a[href*='betonjayareadymix.com']"))
      .map(a => ({ name: a.innerText.trim(), url: a.href.trim() }))
      .filter(l => l.url.startsWith("https://www.betonjayareadymix.com/") && l.url !== url && l.name.length>0);
    const uniqueLinks = articleLinks.filter((v,i,a)=>a.findIndex(t=>t.url===v.url)===i);

    function isRelevantArea(linkUrl){
      const linkAreas = detectAreaHierarki(linkUrl).map(a=>a.name.toLowerCase());
      const pageAreas = pageAreaServed.map(a=>a.name.toLowerCase());
      return linkAreas.some(a => pageAreas.includes(a));
    }

    const productItemList = [];
    const serviceItemList = [];
    uniqueLinks.forEach((item,i)=>{
      if(!isRelevantArea(item.url)) return;
      const txt = item.name.toLowerCase() + " " + item.url.toLowerCase();
      const isProd = productKeywords.test(txt);
      const isServ = serviceKeywords.test(txt);
      const listItem = {
        "@type":"ListItem",
        position: i+1,
        item: {
          "@type": isProd?"Product":(isServ?"Service":"Product"),
          name: item.name,
          url: item.url,
          provider: {"@id":"https://www.betonjayareadymix.com/#localbusiness"},
          areaServed: detectAreaHierarki(item.url),
          sameAs: ["https://www.facebook.com/betonjayareadymix","https://www.instagram.com/betonjayareadymix"]
        }
      };
      if(isProd) productItemList.push(listItem);
      if(isServ) serviceItemList.push(listItem);
    });

    // === 🔟 DATA BISNIS ===
    const business = {
      "@type":["LocalBusiness","GeneralContractor"],
      "@id":"https://www.betonjayareadymix.com/#localbusiness",
      name:"Beton Jaya Readymix",
      url:"https://www.betonjayareadymix.com",
      telephone:"+6283839000968",
      openingHours:"Mo-Sa 08:00-17:00",
      description:"Beton Jaya Readymix menyediakan beton ready mix, precast, baja ringan, ACP, WPC, besi, serta layanan konstruksi & alat berat di seluruh Indonesia.",
      address:{"@type":"PostalAddress","addressLocality":"Bogor","addressRegion":"Jawa Barat","addressCountry":"ID"},
      areaServed: pageAreaServed,
      sameAs:["https://www.facebook.com/betonjayareadymix","https://www.instagram.com/betonjayareadymix"],
      logo:image
    };

    // === 1️⃣1️⃣ ENTITY UTAMA ===
    const mainEntity = {
      "@type":(isProductPage && !isServicePage)?"Product":"Service",
      "@id": url+((isProductPage && !isServicePage)?"#product":"#service"),
      name:title,
      description:desc,
      image,
      category,
      brand:{"@type":"Brand","name":brandName},
      areaServed: pageAreaServed,
      provider:{"@id":business["@id"]}
    };
    if(offerCount>0 && lowPrice){
      mainEntity.aggregateOffer={
        "@type":"AggregateOffer",
        priceCurrency:"IDR",
        lowPrice,
        highPrice,
        offerCount,
        availability:"https://schema.org/InStock",
        priceValidUntil:new Date(new Date().setFullYear(new Date().getFullYear()+1)).toISOString().split("T")[0],
        url
      };
      mainEntity.offers = offers;
    }

    // === 1️⃣2️⃣ GRAPH FINAL ===
    const graph = [
      {
        "@type":"WebPage",
        "@id":url+"#webpage",
        url,
        name:title,
        description:desc,
        image,
        mainEntity:{"@id":mainEntity["@id"]},
        isPartOf:{"@id":parentUrl},
        publisher:{"@id":business["@id"]}
      },
      business,
      mainEntity
    ];
    if(productItemList.length>0){
      graph.push({
        "@type":"ItemList",
        name:"Daftar Produk Internal (Area Relevan)",
        itemListOrder:"https://schema.org/ItemListOrderAscending",
        numberOfItems:productItemList.length,
        itemListElement:productItemList
      });
    }
    if(serviceItemList.length>0){
      graph.push({
        "@type":"ItemList",
        name:"Daftar Layanan Internal (Area Relevan)",
        itemListOrder:"https://schema.org/ItemListOrderAscending",
        numberOfItems:serviceItemList.length,
        itemListElement:serviceItemList
      });
    }

    const schemaData={"@context":"https://schema.org","@graph":graph};
    document.querySelector("#auto-schema-product").textContent = JSON.stringify(schemaData,null,2);
    console.log(`[AutoSchema v4.15] ✅ JSON-LD sukses — ${mainEntity["@type"]}, Brand: ${brandName}, Offers: ${offerCount}`);
  },600);
});
