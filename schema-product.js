// ⚡ AutoSchema Hybrid v4.53+ — Product + Service + Offers + isPartOf | Beton Jaya Readymix
document.addEventListener("DOMContentLoaded", async function () {
  setTimeout(async () => {
    console.log("[AutoSchema Hybrid v4.53+ 🚀] Start detection (Service + Product + Offers + isPartOf)");

    const fallbackImage = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";

    // === 1️⃣ META DASAR ===
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const cleanUrl = (ogUrl || canonical || location.href).replace(/[?&]m=1/, "");
    const titleRaw = document.querySelector("h1")?.innerText?.trim() || document.title.trim();
    const title = titleRaw.replace(/\s{2,}/g," ").trim().substring(0,120);
    const metaDesc = document.querySelector('meta[name="description"]')?.content?.trim();
    const desc = metaDesc || Array.from(document.querySelectorAll("p")).map(p => p.innerText.trim()).join(" ").substring(0, 300);

    // === 2️⃣ URL PARENT ===
    const parentMeta = document.querySelector('meta[name="parent-url"]')?.content?.trim();
    const parentUrl = parentMeta || (() => {
      // ambil semua link dari breadcrumbs (pakai .breadcrumbs a, bukan nav)
      const breadcrumbs = Array.from(document.querySelectorAll(".breadcrumbs a"))
        .map(a => a.href)
        .filter(href => href && href !== location.href);
    
      // ambil link terakhir sebelum halaman aktif (biasanya level terakhir sebelum span pageName)
      return breadcrumbs.length ? breadcrumbs.pop() : location.origin;
    })();


   // === 3️⃣ IMAGE DETECTION (tanpa og:image) ===
    let contentImage = "";
    
    const imgEl = document.querySelector("article img, main img, .post-body img, table img, img");
    if (imgEl && imgEl.src && !/favicon|blank|logo/i.test(imgEl.src)) {
      contentImage = imgEl.src.trim();
    }
    
    if (!contentImage) {
      // fallbackImage wajib sudah didefinisikan sebelumnya
      contentImage = fallbackImage;
    }


    // === 4️⃣ AREA DASAR ===
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

    // === 5️⃣ BRAND DETECTION ===
    const text = document.body.innerText.toLowerCase();
    let brandName = "Beton Jaya Readymix";
    const brandMatch = text.match(/jayamix|adhimix|holcim|scg|pionir|dynamix|tiga roda|solusi bangun/i);
    if (brandMatch) brandName = brandMatch[0].replace(/\b\w/g, l => l.toUpperCase());

    // === 6️⃣ PRODUCT NAME DARI URL ===
    function getProductNameFromUrl() {
      let path = location.pathname.replace(/^\/|\/$/g,"").split("/").pop();
      path = path.replace(".html","").replace(/-/g," ");
      return decodeURIComponent(path).replace(/\b\w/g, l => l.toUpperCase());
    }
    const productName = getProductNameFromUrl();

    // === 7️⃣ DETEKSI KATEGORI PRODUK OTOMATIS ===
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

    // === 8️⃣ DETEKSI EVERGREEN ===
    function detectEvergreen(title, content) {
      const timeKeywords = ["harga","promo","update","tarif","2025","2026"];
      const evergreenKeywords = ["panduan","cara","tips","definisi","jenis","manfaat"];
      const text = (title + " " + content).toLowerCase();
      if(timeKeywords.some(k => text.includes(k))) return false;
      if(evergreenKeywords.some(k => text.includes(k))) return true;
      return !document.querySelector("table");
    }
    const isEvergreen = detectEvergreen(title, document.body.innerText);

    // === 9️⃣ priceValidUntil ===
    const now = new Date();
    const priceValidUntil = new Date(now);
    if(isEvergreen) priceValidUntil.setFullYear(now.getFullYear() + 1);
    else priceValidUntil.setMonth(now.getMonth() + 3);
    const autoPriceValidUntil = priceValidUntil.toISOString().split("T")[0];

    // === 🔟 PARSER TABLE & TEKS HARGA ===
    const seenItems = new Set();
    const tableOffers = [];
    function addOffer(name, key, price, desc="") {
      let finalName = productName;
      if(name && name.toLowerCase() !== productName.toLowerCase()) finalName += " " + name;
      const k = finalName + "|" + key + "|" + price;
      if (!seenItems.has(k)) {
        seenItems.add(k);
        tableOffers.push({
          "@type":"Offer",
          "name": finalName,
          "url": cleanUrl,
          "priceCurrency":"IDR",
          "price": price.toString(),
          "itemCondition":"https://schema.org/NewCondition",
          "availability":"https://schema.org/InStock",
          "priceValidUntil": autoPriceValidUntil,
          "seller": { "@id": "https://www.betonjayareadymix.com/#localbusiness" },
          "description": desc || undefined
        });
      }
    }

    // Parsing table
    Array.from(document.querySelectorAll("table")).forEach(table=>{
      Array.from(table.querySelectorAll("tr")).forEach(row=>{
        const cells = Array.from(row.querySelectorAll("td, th")).slice(0,6);
        if(cells.length>=2){
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

    // Parsing text
    document.body.innerText.split("\n").forEach(line=>{
      const m = line.match(/Rp\s*([\d.,]{4,})/);
      if(m){
        const price = parseInt(m[1].replace(/[.\s,]/g,""));
        if(price>=10000 && price<=500000000){
          const words = line.split(/\s+/);
          const idx = words.findIndex(w=>w.includes(m[1].replace(/[.,]/g,"")));
          let name = words.slice(Math.max(0, idx-3), idx).join(" ").trim();
          if(!name || name.toLowerCase() === productName.toLowerCase()) name="";
          addOffer(name, "", price);
        }
      }
    });

    // === 11️⃣ INTERNAL LINK ===
    const rawLinks = Array.from(document.querySelectorAll("article a, main a, .post-body a"))
      .filter(a => a.href && a.href.includes(location.hostname) && a.href !== location.href)
      .map(a => ({ url:a.href, name:a.innerText.trim() }));
    const uniqueMap = new Map();
    rawLinks.forEach(i=>{ if(!uniqueMap.has(i.url)) uniqueMap.set(i.url, i.name||i.url); });
    const internalLinks = Array.from(uniqueMap.entries()).map(([url,name],i)=>({ "@type":"ListItem", position:i+1, url, name }));

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
      "isPartOf": { "@type":"WebPage", "@id": parentUrl },
      name: productName,
      image: [ contentImage || fallbackImage ],
      description: desc,
      brand: { "@type":"Brand", name: brandName },
      category: productCategory,
      sameAs: wikipediaLink,
      provider: { "@id": business["@id"] },
      offers: tableOffers
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
      "isPartOf": { "@type": "WebPage", "@id": parentUrl },
      ...(internalLinks.length && { hasPart: { "@id": cleanUrl + "#daftar-internal-link" } })
    };

    // === 15️⃣ GRAPH BUILD ===
    const graph = [webpage, business, mainEntity];
    if(internalLinks.length) graph.push({
      "@type":"ItemList",
      "@id": cleanUrl+"#daftar-internal-link",
      name:"Daftar Halaman Terkait",
      numberOfItems: internalLinks.length,
      itemListElement: internalLinks
    });

    // === 16️⃣ OUTPUT JSON-LD ===
    let scriptEl = document.querySelector("#auto-schema-product");
    if(!scriptEl){
      scriptEl = document.createElement("script");
      scriptEl.type = "application/ld+json";
      scriptEl.id="auto-schema-product";
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify({ "@context":"https://schema.org", "@graph": graph }, null, 2);

    console.log(`[AutoSchema v4.53+ ✅] Product: ${productName} | Items: ${tableOffers.length} | Links: ${internalLinks.length} | Category: ${productCategory} | Parent: ${parentUrl}`);
  }, 500);
});
