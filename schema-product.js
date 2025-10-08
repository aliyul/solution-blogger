document.addEventListener("DOMContentLoaded", async function () { 
  setTimeout(async () => {
    console.log("[AutoSchema Hybrid v4.45 🚀] Start detection (Product + OfferCatalog Updated)");

    // === 1️⃣ META DASAR ===
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const cleanUrl = (ogUrl || canonical || location.href).replace(/[?&]m=1/, "");
    const titleRaw = document.querySelector("h1")?.innerText?.trim() || document.title.trim();
    const title = titleRaw.replace(/\s{2,}/g," ").trim().substring(0,120);
    const metaDesc = document.querySelector('meta[name="description"]')?.content?.trim();
    const desc = metaDesc || Array.from(document.querySelectorAll("p")).map((p) => p.innerText.trim()).join(" ").substring(0, 300);

    // === 2️⃣ IMAGE DETECTION ===
    let image = document.querySelector('meta[property="og:image"]')?.content?.trim();
    if (!image) {
      const imgEl = document.querySelector("table img, article img, main img, .post-body img, img");
      if (imgEl && imgEl.src && !imgEl.src.includes("favicon")) image = imgEl.src;
    }
    if (!image) image = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";

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

    // === 4️⃣ BRAND DETECTION ===
    const text = document.body.innerText.toLowerCase();
    let brandName = "Beton Jaya Readymix";
    const brandMatch = text.match(/jayamix|adhimix|holcim|scg|pionir|dynamix|tiga roda|solusi bangun/i);
    if (brandMatch) brandName = brandMatch[0].replace(/\b\w/g, (l) => l.toUpperCase());

    // === 5️⃣ PRODUCT NAME DARI URL ===
    function getProductNameFromUrl() {
      let path = location.pathname.replace(/^\/|\/$/g,"").split("/").pop();
      path = path.replace(".html","").replace(/-/g," ");
      return decodeURIComponent(path).replace(/\b\w/g, l => l.toUpperCase());
    }
    const productName = getProductNameFromUrl();

    // === 6️⃣ PARSER TABLE & TEKS HARGA UNIQUE DENGAN PRODUCTNAME ===
    const seenItems = new Set();
    const tableOffers = [];
    function addOffer(name, key, price, desc="") {
      // selalu gabungkan productName + nama unik (kolom pertama atau teks)
      let finalName = productName;
      if(name && name.toLowerCase() !== productName.toLowerCase()) finalName += " " + name;
      const k = finalName + "|" + key + "|" + price;
      if (!seenItems.has(k)) {
        seenItems.add(k);
        tableOffers.push({
          "@type":"Offer",
          itemOffered:{ "@type":"Product", name: finalName, ...(desc ? { description: desc } : {}) },
          price,
          priceCurrency:"IDR",
          availability:"https://schema.org/InStock"
        });
      }
    }

    // === Parsing tabel ===
    Array.from(document.querySelectorAll("table")).forEach(table=>{
      Array.from(table.querySelectorAll("tr")).forEach(row=>{
        const cells = Array.from(row.querySelectorAll("td, th")).slice(0,6);
        if(cells.length >= 2){
          let col1 = cells[0].innerText.trim();
          let uniqueKey = cells.slice(1).map(c=>c.innerText.trim()).join(" ");
          let price = null;
          for(let c of cells){
            const m = c.innerText.match(/Rp\s*([\d.,]+)/);
            if(m){ price = parseInt(m[1].replace(/[.\s,]/g,"")); break; }
          }
          if(price) addOffer(col1, uniqueKey, price, cells[1]?.innerText.trim()||"");
        }
      });
    });

    // === Parsing teks di luar table ===
    document.body.innerText.split("\n").forEach(line=>{
      const m = line.match(/Rp\s*([\d.,]{4,})/);
      if(m){
        const price = parseInt(m[1].replace(/[.\s,]/g,""));
        if(price >= 10000 && price <= 500000000){
          const words = line.split(/\s+/);
          const idx = words.findIndex(w=>w.includes(m[1].replace(/[.,]/g,"")));
          let name = words.slice(Math.max(0, idx-3), idx).join(" ").trim();
          if(!name || name.toLowerCase() === productName.toLowerCase()) name = "";
          addOffer(name, "", price);
        }
      }
    });

    // === Tentukan tipe mainEntity ===
    let mainType = tableOffers.length >= 3 ? "OfferCatalog" : "Product";

    // === 7️⃣ INTERNAL LINK ===
    const rawLinks = Array.from(document.querySelectorAll("article a, main a, .post-body a"))
      .filter(a => a.href && a.href.includes(location.hostname) && a.href !== location.href)
      .map(a => ({ url:a.href, name:a.innerText.trim() }));
    const uniqueMap = new Map();
    rawLinks.forEach(i=>{ if(!uniqueMap.has(i.url)) uniqueMap.set(i.url, i.name||i.url); });
    const internalLinks = Array.from(uniqueMap.entries()).map(([url,name],i)=>({ "@type":"ListItem", position:i+1, url, name }));

    // === 8️⃣ BUSINESS ENTITY ===
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
      logo:"https://www.betonjayareadymix.com/favicon.ico"
    };

    // === 9️⃣ MAIN ENTITY PRODUCT ===
    const mainEntity = {
      "@type":mainType,
      "@id": cleanUrl+"#mainentity",
      name: productName,
      description: desc,
      image,
      brand: { "@type":"Brand", name: brandName },
      provider: { "@id": business["@id"] },
      ...(tableOffers.length ? { offers: tableOffers } : null)
    };

    // === 1️⃣0️⃣ WEBPAGE ===
    const webpage = {
      "@type":"WebPage",
      "@id": cleanUrl+"#webpage",
      url: cleanUrl,
      name: title,
      description: desc,
      image,
      mainEntity: { "@id": mainEntity["@id"] },
      publisher: { "@id": business["@id"] },
      ...(internalLinks.length && { hasPart: { "@id": cleanUrl + "#daftar-internal-link" } })
    };

    const graph = [webpage, business, mainEntity];
    if(internalLinks.length) graph.push({
      "@type":"ItemList",
      "@id": cleanUrl+"#daftar-internal-link",
      name:"Daftar Halaman Terkait",
      numberOfItems: internalLinks.length,
      itemListElement: internalLinks
    });

    // === 1️⃣1️⃣ OUTPUT JSON-LD ===
    let scriptEl = document.querySelector("#auto-schema-product");
    if(!scriptEl){
      scriptEl = document.createElement("script");
      scriptEl.type="application/ld+json";
      scriptEl.id="auto-schema-product";
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify({ "@context":"https://schema.org", "@graph": graph }, null, 2);

    console.log(`[AutoSchema v4.45 ✅] Product: ${productName} | Items: ${tableOffers.length} | Links: ${internalLinks.length}`);
  }, 500);
});
