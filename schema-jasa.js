/* ⚡ AUTO SCHEMA UNIVERSAL v4.55+dual-parent-autoItemList — Hybrid Service + Product | Beton Jaya Readymix */
document.addEventListener("DOMContentLoaded", async function () {
  setTimeout(async () => {
    let schemaInjected = false;

    async function initSchema() {
      if (schemaInjected) return;
      schemaInjected = true;
      console.log("[Schema v4.55 🚀] Auto generator dijalankan (Service + Product + Offers + Multi Parent + ItemList)");

      // === 1️⃣ INFO HALAMAN ===
      const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
      const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
      const baseUrl = ogUrl || canonical || location.href;
      const cleanUrl = baseUrl.replace(/[?&]m=1/, "");
      const titleRaw = document.querySelector("h1")?.innerText?.trim() || document.title.trim();
      const title = titleRaw.replace(/\s{2,}/g," ").trim().substring(0,120);

      const PAGE = {
        url: cleanUrl,
        title: titleRaw,
        description: document.querySelector('meta[name="description"]')?.content?.trim() || document.querySelector("article p, main p, .post-body p")?.innerText?.substring(0, 200) || document.title,
        image: document.querySelector('meta[property="og:image"]')?.content || document.querySelector("article img, main img, .post-body img")?.getAttribute("src") || "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png",
        business: {
          name: "Beton Jaya Readymix",
          url: "https://www.betonjayareadymix.com",
          telephone: "+6283839000968",
          openingHours: "Mo-Sa 08:00-17:00",
          description: "Beton Jaya Readymix melayani jasa konstruksi, beton cor, precast, dan sewa alat berat di seluruh Indonesia.",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Bogor",
            addressRegion: "Jawa Barat",
            addressCountry: "ID",
          },
          sameAs: [
            "https://www.facebook.com/betonjayareadymix",
            "https://www.instagram.com/betonjayareadymix"
          ]
        }
      };

      // === 2️⃣ SMART MULTI isPartOf DETECTION ===
      function detectParentUrls() {
        const urls = new Set();
        // 🧩 Breadcrumb
        const breadcrumbLinks = Array.from(document.querySelectorAll(".breadcrumbs a"))
          .map(a => a.href)
          .filter(href => href && href !== location.href);
        breadcrumbLinks.forEach(url => urls.add(url));

        // 🧩 Meta parent-url
        const metaParent = document.querySelector('meta[name="parent-url"]')?.content?.trim();
        if (metaParent) urls.add(metaParent);

        // 🧩 Fallback ke domain utama
        if (urls.size === 0) urls.add(location.origin);

        return Array.from(urls).map(u => ({ "@type": "WebPage", "@id": u }));
      }
      const parentUrls = detectParentUrls();
      const cleanParentUrls = parentUrls.map(u=>u["@id"]); // ✅ koreksi deklarasi

      // === 3️⃣ AREA SERVED DETECTION ===
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

      // === 🧠 4B️⃣ DETEKSI AREA SERVED OTOMATIS ===
      async function detectAreaServed() {
        const h1 = PAGE.title.toLowerCase();
        for (const [kota, prov] of Object.entries(areaProv)) {
          const nameLow = kota.toLowerCase().replace("kabupaten ", "").replace("kota ", "");
          if (h1.includes(nameLow)) return [{ "@type": "Place", name: kota, addressRegion: prov }];
        }

        const match = h1.match(/\b([a-z]{3,15})\b/i);
        if(match){
          const kecamatanGuess = match[1];
          try {
            const response = await fetch(`https://id.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(kecamatanGuess)}&limit=1`);
            const data = await response.json();
            if(data?.pages?.[0]?.description?.toLowerCase().includes("kecamatan")){
              const desc = data.pages[0].description;
              const parts = desc.split(",").map(p=>p.trim());
              const kec = parts[0] || kecamatanGuess;
              const city = parts[1] || "Wilayah Sekitarnya";
              const prov = parts[2] || "Jawa Barat";
              return [ { "@type": "Place", name: "Kecamatan "+kec }, { "@type": "Place", name: city, addressRegion: prov } ];
            }
          } catch(e){ console.warn("⚠️ Area auto detection fallback", e); }
        }
        return defaultAreaServed;
      }
      const serviceAreaServed = await detectAreaServed();

      // === 4️⃣ AUTO KNOWS ABOUT ===
      function detectKnowsAbout() {
        const h1 = document.querySelector("h1")?.innerText || "";
        const content = Array.from(document.querySelectorAll("article p, main p, .post-body p"))
          .map(p => p.innerText).join(" ");
        const text = (h1 + " " + content).toLowerCase();
        const stopwords = new Set(["dan","di","yang","untuk","dengan","pada","adalah","atau","ini","juga","oleh","dari","sebagai","dalam","saja","tetapi","agar"]);
        const words = text.match(/\b[a-z]{3,}\b/g) || [];
        const filtered = words.filter(w=>!stopwords.has(w));
        const freq = {};
        filtered.forEach(w=>{ freq[w]=(freq[w]||0)+1; });
        const topWords = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,5).map(e=>e[0]);
        return topWords.map(w=>w.charAt(0).toUpperCase()+w.slice(1));
      }

      // === 5️⃣ SERVICE TYPE DETECTION ===
      function detectServiceType(){
        const h1 = document.querySelector("h1")?.innerText||"";
        const p1 = document.querySelector("main p, article p")?.innerText||"";
        let text = (h1+" "+p1).toLowerCase();
        text = text.replace(/\b(harga|murah|terdekat|terpercaya|berkualitas|profesional|resmi|202\d|terbaru|update)\b/gi,"").replace(/[^\w\s]/g," ");
        const words = text.split(/\s+/).filter(w=>!["dan","atau","dengan","untuk","serta","yang"].includes(w));
        return words.slice(0,4).map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(" ");
      }
      const serviceTypes = detectServiceType();

      // === 6️⃣ PRODUCT NAME & CATEGORY ===
      function getProductNameFromUrl(){
        let path = location.pathname.replace(/^\/|\/$/g,"").split("/").pop();
        path = path.replace(".html","").replace(/-/g," ");
        return decodeURIComponent(path).replace(/\b\w/g,l=>l.toUpperCase());
      }
      const productName = getProductNameFromUrl();
      const productKeywords = {
        BuildingMaterial:["beton","ready mix","precast","besi","pipa","semen","buis","gorong gorong","panel"],
        ConstructionEquipment:["excavator","bulldozer","crane","vibro roller","tandem roller","wales","grader","dump truck"]
      };
      const productCategory = Object.entries(productKeywords).find(([k,v])=>v.some(w=>productName.toLowerCase().includes(w)))?.[0] || "Other";
      const productSameAs = productCategory==="BuildingMaterial"?"https://id.wikipedia.org/wiki/Material_konstruksi":productCategory==="ConstructionEquipment"?"https://id.wikipedia.org/wiki/Alat_berat":"https://id.wikipedia.org/wiki/Konstruksi";

      // === 8️⃣ DETEKSI EVERGREEN ===
    /*  function detectEvergreenAI(){
        const h1 = document.querySelector("h1")?.innerText||"";
        const content = Array.from(document.querySelectorAll("article p, main p, .post-body p")).map(p=>p.innerText).join(" ");
        const text = (h1+" "+content).toLowerCase();
        const hasTimePattern = /\b(20\d{2}|update|harga|tarif|promo|diskon|deadline|agenda|sementara)\b/.test(text);
        const sentenceIndicators = (text.match(/\b(cara|tips|panduan|tutorial|langkah|contoh|teknik|definisi|jenis|manfaat|strategi|panduan lengkap)\b/g)||[]).length;
        const paragraphScore = content.split("\n\n").filter(p=>p.trim().length>50).length;
        const evergreenScore = sentenceIndicators + paragraphScore;
        if(hasTimePattern) return false;
        if(evergreenScore>3) return true;
        return !document.querySelector("table");
      }
      const isEvergreen = detectEvergreenAI();
      console.log("[Evergreen AI ✅]", isEvergreen);
  */
      // === 9️⃣ priceValidUntil ===
      /*const now = new Date();
      const priceValidUntil = new Date(now);
      if(isEvergreen) priceValidUntil.setFullYear(now.getFullYear()+1);
      else priceValidUntil.setMonth(now.getMonth()+3);
      const autoPriceValidUntil = priceValidUntil.toISOString().split("T")[0];
      */
      
      // === 7️⃣ PRICE DETECTION & OFFERS ===
      // ======================================================
    // 🧩 Smart Offer Builder + Auto Sync with Evergreen Detector
    // ======================================================
    const seenItems = new Set();
    const tableOffers = [];
    
    function addOffer(name, key, price, desc = "") {
      let finalName = productName;
      if (name && name.toLowerCase() !== productName.toLowerCase()) finalName += " " + name;
    
      const k = finalName + "|" + key + "|" + price;
      if (seenItems.has(k)) return;
      seenItems.add(k);
    
      // === 🕒 Ambil tanggal validUntil dari AEDMetaDates jika ada ===
      //let validUntil = autoPriceValidUntil; // default fallback
      try {
        if (window.AEDMetaDates?.nextUpdate) {
          validUntil = new Date(window.AEDMetaDates.nextUpdate).toISOString().split("T")[0];
        } else if (window.AEDMetaDates?.dateModified) {
          const dt = new Date(window.AEDMetaDates.dateModified);
          dt.setDate(dt.getDate() + 90); // default 3 bulan
          validUntil = dt.toISOString().split("T")[0];
        }
      } catch (err) {
        console.warn("[Offer Builder] Gagal baca AEDMetaDates:", err);
      }
    
      // === 💰 Push ke Offer Table ===
      tableOffers.push({
        "@type": "Offer",
        name: finalName,
        url: cleanUrl,
        priceCurrency: "IDR",
        price: price.toString(),
        itemCondition: "https://schema.org/NewCondition",
        availability: "https://schema.org/InStock",
        priceValidUntil: validUntil,
        seller: { "@id": PAGE.business.url + "#localbusiness" },
        description: desc || undefined
      });
    }

      Array.from(document.querySelectorAll("table")).forEach(table=>{
        Array.from(table.querySelectorAll("tr")).forEach(row=>{
          const cells = Array.from(row.querySelectorAll("td,th")).slice(0,6);
          if(cells.length>=2){
            let col1 = cells[0].innerText.trim();
            let key = cells.slice(1).map(c=>c.innerText.trim()).join(" ");
            let price = null;
            for(let c of cells){ const m=c.innerText.match(/Rp\s*([\d.,]+)/); if(m){price=parseInt(m[1].replace(/[.\s,]/g,""));break;} }
            if(price) addOffer(col1,key,price,cells[1]?.innerText.trim()||"");
          }
        });
      });

      document.body.innerText.split("\n").forEach(line=>{
        const m=line.match(/Rp\s*([\d.,]{4,})/);
        if(m){
          const price=parseInt(m[1].replace(/[.\s,]/g,""));
          if(price>=10000 && price<=500000000){
            const words=line.split(/\s+/);
            const idx=words.findIndex(w=>w.includes(m[1].replace(/[.,]/g,"")));
            let name=words.slice(Math.max(0,idx-3),idx).join(" ").trim();
            if(!name || name.toLowerCase()===productName.toLowerCase()) name="";
            addOffer(name,"",price);
          }
        }
      });
      const isProductPage = tableOffers.length>0;


   // === 11️⃣ INTERNAL LINK (Auto-Clean + Relevance + Unique + Max 50 + Name Cleaned v5) ===
    function generateCleanInternalLinksV5() {
      const h1 = (document.querySelector("h1")?.innerText || "")
        .toLowerCase()
        .replace(/\d{4}|\b(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\b/gi, "");
    
      // Daftar URL yang dikecualikan
      const blacklist = [
        "https://www.betonjayareadymix.com/p/hubungi-kami.html",
        "https://www.betonjayareadymix.com/p/portofolio.html",
        "https://www.betonjayareadymix.com/p/disclaimer.html",
        "https://www.betonjayareadymix.com/p/privacy-policy.html",
        "https://www.betonjayareadymix.com/p/terms-of-service.html",
        "https://www.betonjayareadymix.com/p/useful-links.html",
        "https://www.betonjayareadymix.com/p/about.html",
        "https://www.betonjayareadymix.com/p/sitemap.html"
      ];
    
      // Ambil semua link <a> di dalam artikel saja
      const articleContent = document.querySelector("article") || document.querySelector("main") || document.body;
      const rawLinks = Array.from(articleContent.querySelectorAll("a"))
        .map(a => a.href)
        .filter(href =>
          href &&
          href.includes(location.hostname) &&
          !href.includes("#") &&
          href !== location.href &&
          !href.match(/(\/search|\/feed|\/label)/i) &&
          !blacklist.includes(href)
        )
        .map(url => url.split("?")[0].replace(/\/$/,""));
    
      const uniqueUrls = [...new Set(rawLinks)];
    
      const relevancyScores = uniqueUrls.map(url => {
        // slug untuk relevansi, tetap hitung semua kata
        let slugText = url
          .replace(location.origin, "")
          .replace(".html", "")
          .replace(/^\/+|\/+$/g, "")
          .replace(/-/g, " ")
          .replace(/\b\d{1,2}\b/g, "")
          .replace(/\d{4}/g, "")
          .replace(/\b(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\b/gi,"")
          .replace(/\s+/g," ")
          .trim()
          .toLowerCase();
    
        let score = 0;
        h1.split(" ").forEach(word => { if(word && slugText.includes(word)) score++; });
    
        return { url, score, slugText };
      });
    
      relevancyScores.sort((a, b) => b.score - a.score);
    
      const topLinks = relevancyScores.slice(0, 50);
    
      return topLinks.map((item, i) => {
        // nameClean diambil dari URL, hapus '/p/' jika ada
        let nameClean = item.url.replace(location.origin,"").replace(/^\/p\//,"").replace(".html","").replace(/-/g," ").replace(/\s+/g," ").trim();
        if(nameClean) nameClean = nameClean.charAt(0).toUpperCase() + nameClean.slice(1);
        return { "@type": "ListItem", position: i+1, url: item.url, name: nameClean || `Tautan ${i+1}` };
      });
    }
    
    const internalLinks = generateCleanInternalLinksV5();
    console.log("[InternalLinks v5 ✅]", internalLinks);


      // === 9️⃣ GRAPH ===
      const graph=[];
      const localBiz={
        "@type":["LocalBusiness","GeneralContractor"],
        "@id": PAGE.business.url+"#localbusiness",
        name: PAGE.business.name,
        url: PAGE.business.url,
        telephone: PAGE.business.telephone,
        description: PAGE.business.description,
        address: PAGE.business.address,
        openingHours: PAGE.business.openingHours,
        logo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png",
        sameAs: PAGE.business.sameAs,
        areaServed: defaultAreaServed,
        knowsAbout: detectKnowsAbout(),
        ...(isProductPage && { hasOfferCatalog:{ "@id": cleanUrl+"#product" } })
      };
      graph.push(localBiz);
      cleanParentUrls.forEach(url=>{
        if(url && url!==cleanUrl) graph.push({ "@type":"WebPage","@id":url+"#webpage","url":url });
      });
      graph.push({
        "@type":"WebPage",
        "@id": cleanUrl+"#webpage",
        url: cleanUrl,
        name: PAGE.title,
        description: PAGE.description,
        image: PAGE.image,
        mainEntity: { "@id": cleanUrl+"#service" },
        publisher: { "@id": PAGE.business.url+"#localbusiness" },
        ...(internalLinks.length && { hasPart:{ "@id": cleanUrl+"#internal-links" } }),
        ...(cleanParentUrls.length && { isPartOf: cleanParentUrls.map(u=>({ "@id": u+"#webpage" })) })
      });
      const serviceNode={
        "@type":"Service",
        "@id": cleanUrl+"#service",
        name: PAGE.title,
        description: PAGE.description,
        image: PAGE.image,
        serviceType: serviceTypes,
        areaServed: serviceAreaServed,
        provider:{ "@id": PAGE.business.url+"#localbusiness" },
        brand:{ "@type":"Brand", name: PAGE.business.name },
        mainEntityOfPage:{ "@id": cleanUrl+"#webpage" },
        ...(isProductPage && {
          offers:{
            "@type":"AggregateOffer",
            lowPrice:Math.min(...tableOffers.map(o=>parseInt(o.price))),
            highPrice:Math.max(...tableOffers.map(o=>parseInt(o.price))),
            offerCount:tableOffers.length,
            priceCurrency:"IDR",
            offers:tableOffers.map(o=>({...o,url:cleanUrl}))
          }
        })
      };
      graph.push(serviceNode);

      if(isProductPage){
        graph.push({
          "@type":"Product",
          "@id": cleanUrl+"#product",
          mainEntityOfPage:{ "@type":"WebPage","@id": cleanUrl+"#webpage" },
          name: productName,
          image:[PAGE.image],
          description: PAGE.description,
          brand:{ "@type":"Brand","name": PAGE.business.name },
          category: productCategory,
          sameAs: productSameAs,
          offers: tableOffers.map(o=>({...o,url:cleanUrl}))
        });
      }

      if(internalLinks.length){
        graph.push({
          "@type":"ItemList",
          "@id": cleanUrl+"#internal-links",
          name: "Daftar Halaman Terkait",
          itemListOrder:"http://schema.org/ItemListOrderAscending",
          numberOfItems: internalLinks.length,
          itemListElement: internalLinks
        });
      }

      const schema={
        "@context":"https://schema.org",
        "@graph":graph
      };

      let el=document.querySelector("#auto-schema-service");
      if(!el){
        el=document.createElement("script");
        el.id="auto-schema-service";
        el.type="application/ld+json";
        document.head.appendChild(el);
      }
      el.textContent=JSON.stringify(schema,null,2);

      console.log(`[Schema v4.55 ✅] Injected | Parents: ${cleanParentUrls.length} | Items: ${tableOffers.length} | InternalLinks: ${internalLinks.length} | ServiceType: ${serviceTypes}`);
    }

    if(document.querySelector("h1") && document.querySelector(".post-body")){
      await initSchema();
    } else {
      const obs=new MutationObserver(async ()=>{
        if(document.querySelector("h1") && document.querySelector(".post-body")){
          await initSchema();
          obs.disconnect();
        }
      });
      obs.observe(document.body,{childList:true,subtree:true});
    }

  },600);
});
