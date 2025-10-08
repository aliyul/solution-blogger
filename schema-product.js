// ⚡ AUTO SCHEMA PRODUK v4.34 — AreaServed di LocalBusiness + Product + Harga Otomatis + ItemList Internal Unik
document.addEventListener("DOMContentLoaded", async function () {
  setTimeout(async () => {
    console.log("[AutoSchema Product v4.34] 🚀 Start detection");

    // 1️⃣ Meta dasar halaman
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const cleanUrl = (ogUrl || canonical || location.href).replace(/[?&]m=1/, "");
    const title = document.querySelector("h1")?.innerText?.trim() || document.title.trim();
    const metaDesc = document.querySelector('meta[name="description"]')?.content?.trim();
    const desc = metaDesc || Array.from(document.querySelectorAll("p")).map(p => p.innerText.trim()).join(" ").substring(0, 300);
    let image = document.querySelector('meta[property="og:image"]')?.content
      || document.querySelector("article img, main img, .post-body img, img")?.src;
    if(!image || image.startsWith("data:")) {
      image = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";
    }

    // 2️⃣ Daftar area
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

    // 3️⃣ Deteksi area dari URL
    function detectArea(url) {
      const lowerUrl = url.toLowerCase();
      for (const a of Object.keys(areaProv)) {
        const slug = a.toLowerCase().replace(/\s+/g,"-");
        if(lowerUrl.includes(slug)) return [{ "@type": "Place", "name": a }];
      }
      return defaultAreaServed;
    }
    const areaServed = detectArea(cleanUrl);

    // 4️⃣ Deteksi brand
    const text = document.body.innerText.toLowerCase();
    let brandName = "Beton Jaya Readymix";
    const brandMatch = text.match(/jayamix|adhimix|holcim|scg|pionir|dynamix|tiga roda|solusi bangun/i);
    if(brandMatch) brandName = brandMatch[0].replace(/\b\w/g, l=>l.toUpperCase());

    // 5️⃣ Deteksi harga otomatis
    const priceRegex = /Rp\s*([\d.,]+)/g;
    const prices = [...document.body.innerText.matchAll(priceRegex)]
      .map(m => parseInt(m[1].replace(/[.\s]/g,""),10))
      .filter(p=>!isNaN(p));
    let lowPrice, highPrice, offerCount;
    if(prices.length) {
      lowPrice = Math.min(...prices);
      highPrice = Math.max(...prices);
      offerCount = prices.length;
    }

    const offers = prices.slice(0,100).map((p,i)=>({
      "@type":"Offer",
      priceCurrency:"IDR",
      price:p,
      availability:"https://schema.org/InStock",
      priceValidUntil:new Date(new Date().setFullYear(new Date().getFullYear()+1)).toISOString().split("T")[0],
      url: cleanUrl,
      seller: {"@id":"https://www.betonjayareadymix.com/#localbusiness"}
    }));

    // 6️⃣ Internal links
    const internalLinks = Array.from(document.querySelectorAll('article a, main a, .post-body a'))
      .filter(a=>a.href && a.href.includes(location.hostname) && a.href!==location.href)
      .map((a,i)=>({ "@type":"ListItem", position:i+1, url:a.href, name:a.innerText.trim() }));
    const uniqueLinks = internalLinks.filter((v,i,a)=>a.findIndex(t=>t.url===v.url)===i);

    // 7️⃣ Bisnis
    const business = {
      "@type":["LocalBusiness","GeneralContractor"],
      "@id":"https://www.betonjayareadymix.com/#localbusiness",
      name:"Beton Jaya Readymix",
      url:"https://www.betonjayareadymix.com",
      telephone:"+6283839000968",
      address:{"@type":"PostalAddress","addressLocality":"Bogor","addressRegion":"Jawa Barat","addressCountry":"ID"},
      description:"Penyedia beton ready mix, precast, dan jasa konstruksi di wilayah Jabodetabek dan sekitarnya.",
      areaServed,
      sameAs:["https://www.facebook.com/betonjayareadymix","https://www.instagram.com/betonjayareadymix"],
      logo:image
    };

    // 8️⃣ MainEntity Product
    const mainEntity = {
      "@type":"Product",
      "@id":cleanUrl+"#product",
      name:title,
      description:desc,
      image,
      brand:{"@type":"Brand","name":brandName},
      areaServed,
      category:"Produk Material & Konstruksi",
      provider:{"@id":business["@id"]}
    };
    if(offerCount>0){
      mainEntity.aggregateOffer = {
        "@type":"AggregateOffer",
        priceCurrency:"IDR",
        lowPrice,
        highPrice,
        offerCount,
        availability:"https://schema.org/InStock",
        priceValidUntil:new Date(new Date().setFullYear(new Date().getFullYear()+1)).toISOString().split("T")[0],
        url:cleanUrl
      };
      mainEntity.offers = offers;
    }

    // 9️⃣ WebPage
    const webpage = {
      "@type":"WebPage",
      "@id":cleanUrl+"#webpage",
      url:cleanUrl,
      name:title,
      description:desc,
      image,
      mainEntity:{"@id":mainEntity["@id"]},
      publisher:{"@id":business["@id"]},
      ...(uniqueLinks.length && { hasPart: {"@id":cleanUrl+"#daftar-internal-link"}})
    };

    // 10️⃣ Graph
    const graph = [webpage, business, mainEntity];
    if(uniqueLinks.length){
      graph.push({
        "@type":"ItemList",
        "@id":cleanUrl+"#daftar-internal-link",
        name:"Daftar Halaman Terkait",
        itemListOrder:"http://schema.org/ItemListOrderAscending",
        numberOfItems:uniqueLinks.length,
        itemListElement:uniqueLinks
      });
      console.log(`[AutoSchema v4.34] 🧩 ItemList internal aktif (${uniqueLinks.length} URL).`);
    }

    // 11️⃣ Output
    const schemaData = {"@context":"https://schema.org","@graph":graph};
    document.querySelector("#auto-schema-product").textContent = JSON.stringify(schemaData,null,2);
    console.log(`[AutoSchema v4.34] ✅ JSON-LD berhasil diinject | Area: ${areaServed.length} | Offers: ${offerCount || 0}`);
  }, 500);
});
