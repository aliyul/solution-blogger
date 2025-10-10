//* ⚡ AUTO SCHEMA UNIVERSAL v4.54 — Hybrid Service + Product | Beton Jaya Readymix */
document.addEventListener("DOMContentLoaded", async function () {
  setTimeout(async () => {
    let schemaInjected = false;

    async function initSchema() {
      if (schemaInjected) return;
      schemaInjected = true;
      console.log("[Schema Service v4.54 🚀] Auto generator dijalankan (Service + Product + Offers)");

      // === 1️⃣ INFO HALAMAN ===
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
          document.querySelector("article img, main img, .post-body img")?.getAttribute("src") ||
          "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png",
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
            "https://www.instagram.com/betonjayareadymix",
          ],
        },
      };
      
      // === 2️⃣ URL PARENT ===
      const parentMeta = document.querySelector('meta[name="parent-url"]')?.content?.trim();
      const parentUrl = parentMeta || (() => {
        const breadcrumbs = Array.from(document.querySelectorAll(".breadcrumbs a"))
          .map(a => a.href)
          .filter(href => href && href !== location.href);
        return breadcrumbs.length ? breadcrumbs.pop() : location.origin;
      })();
      const cleanParentUrl = parentUrl ? parentUrl.replace(/[?&]m=1/, "") : null;

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

    // === 🧠 4B️⃣ DETEKSI AREA SERVED OTOMATIS (SMART VER) ===
      async function detectAreaServed() {
        const h1 = titleRaw.toLowerCase();
      
        // 1️⃣ Deteksi langsung kota/kab dari daftar utama
        for (const [kota, prov] of Object.entries(areaProv)) {
          const nameLow = kota.toLowerCase().replace("kabupaten ", "").replace("kota ", "");
          if (h1.includes(nameLow)) {
            return [{ "@type": "Place", name: kota, addressRegion: prov }];
          }
        }
      
        // 2️⃣ Deteksi kecamatan otomatis pakai pola umum
        const match = h1.match(/\b([a-z]{3,15})\b/i);
        if (match) {
          const kecamatanGuess = match[1];
          try {
            // Gunakan API geonames bawaan browser via fetch ke Wikipedia (tanpa API key)
            const response = await fetch(`https://id.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(kecamatanGuess)}&limit=1`);
            const data = await response.json();
            if (data?.pages?.[0]?.description?.toLowerCase().includes("kecamatan")) {
              const desc = data.pages[0].description;
              // Ekstrak kota/provinsi dari deskripsi Wikipedia
              const parts = desc.split(",").map(p => p.trim());
              const kec = parts[0] || kecamatanGuess;
              const city = parts[1] || "Wilayah Sekitarnya";
              const prov = parts[2] || "Jawa Barat";
              return [
                { "@type": "Place", name: "Kecamatan " + kec },
                { "@type": "Place", name: city, addressRegion: prov }
              ];
            }
          } catch (e) {
            console.warn("⚠️ Area auto detection fallback", e);
          }
        }
      
        // 3️⃣ Default jika tidak ditemukan
        return defaultAreaServed;
      }
      
      const serviceAreaServed = detectAreaServed();

      function detectKnowsAbout() {
        let raw =
          document.querySelector("h1")?.textContent?.trim() ||
          document.title.trim() ||
          location.pathname.split("/").pop().replace(/[-_]/g, " ");
        const text = raw.toLowerCase();
        const topics = new Set();
        const keywordMap = {
          "Beton cor / Ready mix": ["beton cor", "ready mix", "readymix", "minimix", "mix"],
          "Precast": ["precast", "u ditch", "box culvert", "buis", "panel", "kanstin", "saluran", "culvert"],
          "Sewa alat berat": ["sewa", "rental", "alat berat", "excavator", "bulldozer", "crane", "roller", "vibro", "tandem"],
          "Jasa konstruksi": ["jasa", "kontraktor", "konstruksi", "pembangunan", "renovasi", "perbaikan", "proyek"],
          "Merek beton": ["jayamix", "adhimix", "scg", "pionir", "tiga roda", "holcim", "dynamix"]
        };
        for (const [label, keywords] of Object.entries(keywordMap)) {
          for (const word of keywords) {
            if (text.includes(word)) {
              label.split("/").forEach(l => topics.add(l.trim()));
              break;
            }
          }
        }
        if (topics.size === 0 && raw) {
          const cleaned = raw.replace(/\d+/g, "")
            .replace(/\b(harga|jual|sewa|jasa|murah|terdekat|beton|precast)\b/gi, "")
            .trim();
          const words = cleaned.split(/\s+/).slice(0, 3);
          const titleCase = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
          if (titleCase.length) topics.add(titleCase.join(" "));
        }
        return Array.from(topics);
      }

      function detectServiceType() {
        const h1 = document.querySelector("h1")?.textContent?.trim() || "";
        const p1 = document.querySelector("main p, article p")?.textContent?.trim() || "";
        const text = (h1 + " " + p1).toLowerCase();
        let clean = text
          .replace(/\b(harga|murah|terdekat|terpercaya|berkualitas|profesional|resmi|202\d|terbaru|update)\b/gi, "")
          .replace(/[^\w\s]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        const words = clean.split(" ");
        let corePhrase = words.slice(0, 5).join(" ").trim();
        const stopwords = ["dan", "atau", "dengan", "untuk", "serta", "yang"];
        corePhrase = corePhrase
          .split(" ")
          .filter(w => !stopwords.includes(w))
          .slice(0, 4)
          .join(" ");
        function toTitleCase(str) {
          return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1));
        }
        let serviceType = toTitleCase(corePhrase);
        const match = p1.match(/(jasa|sewa|jual|beli|pengiriman|pembuatan|pemasangan)\s+[a-z\s]{3,30}/i);
        if (match && match[0].length > 10) {
          serviceType = toTitleCase(match[0].trim());
        }
        if (!serviceType || serviceType.split(" ").length < 2) {
          serviceType = toTitleCase(h1.split(" ").slice(0, 3).join(" "));
        }
        return serviceType.trim();
      }

      let serviceTypes = detectServiceType();
      console.log("🔎 Service Type Terdeteksi:", serviceTypes);

      function getProductNameFromUrl() {
        let path = location.pathname.replace(/^\/|\/$/g, "").split("/").pop();
        path = path.replace(".html","").replace(/-/g," ");
        return decodeURIComponent(path).replace(/\b\w/g, l => l.toUpperCase());
      }
      const productName = getProductNameFromUrl();

      const productKeywords = {
        BuildingMaterial: ["beton","ready mix","precast","besi","pipa","semen","buis","gorong gorong","panel"],
        ConstructionEquipment: ["excavator","bulldozer","crane","vibro roller","tandem roller","wales","grader","dump truck"]
      };
      function detectProductCategory(name) {
        name = name.toLowerCase();
        for(const [category, keywords] of Object.entries(productKeywords)){
          if(keywords.some(k => name.includes(k))) return category;
        }
        return "Other";
      }
      function detectProductSameAs(category) {
        switch(category){
          case "BuildingMaterial": return "https://id.wikipedia.org/wiki/Material_konstruksi";
          case "ConstructionEquipment": return "https://id.wikipedia.org/wiki/Alat_berat";
          default: return "https://id.wikipedia.org/wiki/Konstruksi";
        }
      }
      const productCategory = detectProductCategory(productName);
      const productSameAs = detectProductSameAs(productCategory);

      function detectEvergreen(title, content) {
        const timeKeywords = ["harga","promo","update","tarif","2025","2026","diskon"];
        const evergreenKeywords = ["panduan","cara","tips","definisi","jenis","manfaat","tutorial","strategi"];
        const text = (title + " " + content).toLowerCase();
        if(content.split(/\s+/).length < 300) return false;
        if(timeKeywords.some(k => text.includes(k))) return false;
        let evergreenCount = evergreenKeywords.reduce((acc,k) => acc + (text.includes(k)?1:0), 0);
        if(evergreenCount >= 2) return true;
        if(document.querySelectorAll("table").length > 0) return false;
        return evergreenCount >= 1;
      }
      const isEvergreen = detectEvergreen(PAGE.title, document.body.innerText);

      const now = new Date();
      const priceValidUntil = new Date(now);
      if(isEvergreen){
        priceValidUntil.setFullYear(now.getFullYear() + 1);
      } else {
        priceValidUntil.setMonth(now.getMonth() + 3);
      }
      const autoPriceValidUntil = priceValidUntil.toISOString().split("T")[0];

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
            name: finalName,
            url: cleanUrl,
            priceCurrency:"IDR",
            price: price.toString(),
            itemCondition:"https://schema.org/NewCondition",
            availability:"https://schema.org/InStock",
            priceValidUntil: autoPriceValidUntil,
            seller:{ "@id": PAGE.business.url + "#localbusiness" },
            description: desc || undefined
          });
        }
      }

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

      const isProductPage = tableOffers.length > 0;

      const anchors = [...document.querySelectorAll("article a, main a, .post-body a")]
        .filter(a => a.href && a.href.includes(location.hostname) && !a.href.includes("#"))
        .map(a => ({ url: a.href.split("#")[0].replace(/[?&]m=1/, ""), name: a.innerText.trim() || a.href }));
      const uniqueLinks = Array.from(new Map(anchors.map(a => [a.url, a.name])).entries())
        .map(([url, name], i) => ({ "@type": "ListItem", position: i + 1, url, name }));

      const graph = [];

      const localBiz = {
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
        areaServed : defaultAreaServed,
        "knowsAbout": detectKnowsAbout(),
        ...(isProductPage && { hasOfferCatalog: { "@id": cleanUrl + "#product" } })
      };
      graph.push(localBiz);

      let parentWebPageNode = null;
      if (cleanParentUrl && cleanParentUrl !== location.origin) {
        const parentId = cleanParentUrl + "#webpage";
        parentWebPageNode = {
          "@type": "WebPage",
          "@id": parentId,
          url: cleanParentUrl,
          name: undefined 
        };
        if (parentId !== cleanUrl + "#webpage") graph.push(parentWebPageNode);
      }

      const webpage = {
        "@type": "WebPage",
        "@id": cleanUrl + "#webpage",
        url: cleanUrl,
        name: PAGE.title,
        description: PAGE.description,
        image: PAGE.image,
        mainEntity: { "@id": cleanUrl + "#service" },
        publisher: { "@id": PAGE.business.url + "#localbusiness" },
        ...(uniqueLinks.length && { hasPart: { "@id": cleanUrl + "#daftar-internal-link" } }),
        ...(cleanParentUrl && cleanParentUrl !== cleanUrl ? { isPartOf: { "@id": (cleanParentUrl + "#webpage") } } : {})
      };
      graph.push(webpage);

      const service = {
        "@type": "Service",
        "@id": cleanUrl + "#service",
        name: PAGE.title,
        description: PAGE.description,
        image: PAGE.image,
        serviceType: serviceTypes,
        areaServed: serviceAreaServed, // ✅ Tambahan di sini
        provider: { "@id": PAGE.business.url + "#localbusiness" },
        brand: { "@type":"Brand", name: PAGE.business.name },
        mainEntityOfPage: { "@id": cleanUrl + "#webpage" },
        ...(isProductPage && {
          offers: {
            "@type":"AggregateOffer",
            lowPrice: Math.min(...tableOffers.map(o=>parseInt(o.price))),
            highPrice: Math.max(...tableOffers.map(o=>parseInt(o.price))),
            offerCount: tableOffers.length,
            priceCurrency:"IDR",
            offers: tableOffers.map(o => ({...o, url: cleanUrl}))
          }
        })
      };
      graph.push(service);

      if(isProductPage){
        graph.push({
          "@type":"Product",
          "@id": cleanUrl + "#product",
          "mainEntityOfPage": { "@type": "WebPage", "@id": cleanUrl + "#webpage" },
          "name": productName,
          "image": [PAGE.image],
          "description": PAGE.description,
          "brand": { "@type":"Brand", "name": PAGE.business.name },
          "category": productCategory,
          "sameAs": productSameAs,
          "offers": tableOffers.map(o => ({
            "@type": "Offer",
            "name": o.name,
            "url": cleanUrl,
            "priceCurrency": o.priceCurrency,
            "price": o.price,
            "itemCondition": o.itemCondition,
            "availability": o.availability,
            "priceValidUntil": o.priceValidUntil,
            "seller": o.seller,
            "description": o.description || undefined
          }))
        });
      }

      if(uniqueLinks.length){
        graph.push({
          "@type": "ItemList",
          "@id": cleanUrl + "#daftar-internal-link",
          name: "Daftar Halaman Terkait",
          itemListOrder: "http://schema.org/ItemListOrderAscending",
          numberOfItems: uniqueLinks.length,
          itemListElement: uniqueLinks,
        });
      }

      const schema = { "@context": "https://schema.org", "@graph": graph };
      let el = document.querySelector("#auto-schema-service");
      if(!el){
        el = document.createElement("script");
        el.id = "auto-schema-service";
        el.type = "application/ld+json";
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(schema, null, 2);

      console.log(`[Schema v4.54 ✅] Injected | Type: Service${isProductPage ? "+Product" : ""} | Items: ${tableOffers.length} | Area: ${areaServed.length} | ServiceType: ${serviceTypes} | Evergreen: ${isEvergreen} | Parent: ${cleanParentUrl ? cleanParentUrl : "none"}`);
    }

    if(document.querySelector("h1") && document.querySelector(".post-body")){
      await initSchema();
    } else {
      const observer = new MutationObserver(async () => {
        if(document.querySelector("h1") && document.querySelector(".post-body")){
          await initSchema();
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

  }, 600);
});
