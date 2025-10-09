//* ⚡ AUTO SCHEMA UNIVERSAL v4.53 — Hybrid Service + Product | Beton Jaya Readymix */
document.addEventListener("DOMContentLoaded", async function () {
  setTimeout(async () => {
    let schemaInjected = false;

    async function initSchema() {
      if (schemaInjected) return;
      schemaInjected = true;
      console.log("[Schema Service v4.53 🚀] Auto generator dijalankan (Service + Product + Offers)");

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

      // === 2️⃣ AREA DEFAULT ===
      const areaJSON = {
        "Kabupaten Bogor": "Jawa Barat", "Kota Bogor": "Jawa Barat",
        "Kota Depok": "Jawa Barat", "Kabupaten Bekasi": "Jawa Barat",
        "Kota Bekasi": "Jawa Barat", "Kabupaten Karawang": "Jawa Barat",
        "Kabupaten Serang": "Banten", "Kota Serang": "Banten",
        "Kota Cilegon": "Banten", "Kabupaten Tangerang": "Banten",
        "Kota Tangerang": "Banten", "Kota Tangerang Selatan": "Banten",
        "DKI Jakarta": "DKI Jakarta",
      };
      const defaultAreaServed = Object.keys(areaJSON).map(k => ({ "@type": "Place", name: k }));
      async function detectArea(url, title = "") { return defaultAreaServed; }
      const areaServed = await detectArea(PAGE.url, PAGE.title);

      // === 3️⃣ DETEKSI SERVICE ===
      // === 3️⃣ DETEKSI SERVICE (versi GPT enhanced) ===
      // ⚡ detectServiceType v4.7+ — Smart Cleaner + Regional Filter
      function detectServiceType() {
        // 🔹 1. Ambil sumber utama: H1 > Title > paragraf pertama > URL
        let raw =
          document.querySelector("h1")?.textContent?.trim() ||
          document.title.trim() ||
          document.querySelector("article p, main p, .post-body p")?.innerText?.substring(0, 120) ||
          location.pathname.split("/").pop().replace(/[-_]/g, " ");
      
        if (!raw) return ["Jasa Konstruksi"];
      
        // 🔹 2. Daftar kata umum & daerah untuk dibersihkan
        const stopwords = [
          "harga", "murah", "terdekat", "update", "promo", "diskon",
          "202[0-9]", "terbaru", "per hari", "per jam", "kubik",
          "m3", "standar", "minimix", "supermix", "express"
        ];
      
        const daerahKataKunci = [
          "jakarta", "bogor", "depok", "bekasi", "tangerang", "banten",
          "tangerang selatan", "karawang", "purwakarta", "subang", "cikampek",
          "bandung", "sumedang", "cimahi", "garut", "tasikmalaya", "cianjur",
          "sukabumi", "serang", "cilegon", "indonesia", "jawa barat",
          "jawa tengah", "jawa timur", "bali", "timur", "barat", "utara", "selatan"
        ];
      
        // 🔹 3. Bersihkan teks mentah dari kata umum, frasa daerah, dan karakter tidak penting
        raw = raw
          .toLowerCase()
          // hapus stopwords umum
          .replace(new RegExp(`\\b(${stopwords.join("|")})\\b`, "gi"), "")
          // hapus kombinasi daerah lengkap (kota, kabupaten, provinsi, arah mata angin)
          .replace(new RegExp(`\\b(kota|kabupaten|provinsi)?\\s*(${daerahKataKunci.join("|")})(\\s*(utara|selatan|barat|timur))?\\b`, "gi"), "")
          // bersihkan tanda baca
          .replace(/[^\w\s]/g, " ")
          // rapikan spasi
          .replace(/\s+/g, " ")
          .trim();
      
        // 🔹 4. Daftar kata jasa & pekerjaan yang umum
        const jasaKataKunci = [
          "sewa", "rental", "jasa", "layanan", "penjualan",
          "pengiriman", "pemasangan", "pembuatan", "pengecoran",
          "produksi", "pancang", "kontraktor", "renovasi", "pembersihan"
        ];
      
        const alatDanPekerjaan = [
          "excavator", "bulldozer", "crane", "vibro roller", "tandem roller",
          "wales", "bor pile", "drop hammer", "pancang", "tiang pancang",
          "beton cor", "ready mix", "precast", "buis beton", "u ditch",
          "box culvert", "panel beton", "saluran", "gorong gorong",
          "puing", "bekisting", "pondasi"
        ];
      
        let hasil = [];
      
        // 🔹 5. Deteksi kombinasi jasa + pekerjaan
        jasaKataKunci.forEach(jk => {
          alatDanPekerjaan.forEach(item => {
            if (raw.includes(jk) && raw.includes(item)) hasil.push(`${jk} ${item}`);
          });
        });
      
        // 🔹 6. Jika tidak ada kombinasi, deteksi tunggal
        if (hasil.length === 0) {
          const singleMatch = [...jasaKataKunci, ...alatDanPekerjaan].find(k => raw.includes(k));
          if (singleMatch) hasil.push(singleMatch);
        }
      
        // 🔹 7. Jika tetap kosong, fallback ke slug bersih
        if (hasil.length === 0) {
          let slug = location.pathname.split("/").pop().replace(/[-_]/g, " ").replace(".html", "");
          slug = slug.replace(new RegExp(`\\b(${daerahKataKunci.join("|")})\\b`, "gi"), "").trim();
          hasil.push(slug || "Jasa Konstruksi");
        }
      
        // 🔹 8. Format kapitalisasi tiap kata
        hasil = [...new Set(hasil)]
          .filter(h => h.length > 2)
          .map(str =>
            str
              .trim()
              .replace(/\b\w/g, l => l.toUpperCase())
              .replace(/\s+/g, " ")
          );
      
        return hasil.length ? hasil : ["Jasa Konstruksi"];
      }
      
      let serviceTypes = detectServiceType();



      // === 4️⃣ DETEKSI PRODUCT DARI URL + TABLE ===
      function getProductNameFromUrl() {
        let path = location.pathname.replace(/^\/|\/$/g, "").split("/").pop();
        path = path.replace(".html","").replace(/-/g," ");
        return decodeURIComponent(path).replace(/\b\w/g, l => l.toUpperCase());
      }
      const productName = getProductNameFromUrl();

      // === 4a️⃣ DETEKSI KATEGORI PRODUK OTOMATIS ===
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

      // === 4b️⃣ DETEKSI EVERGREEN DENGAN LSI & PANJANG KONTEN ===
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

      // === 4c️⃣ PRICE VALID UNTIL OTOMATIS ===
      const now = new Date();
      const priceValidUntil = new Date(now);
      if(isEvergreen){
        priceValidUntil.setFullYear(now.getFullYear() + 1);
      } else {
        priceValidUntil.setMonth(now.getMonth() + 3);
      }
      const autoPriceValidUntil = priceValidUntil.toISOString().split("T")[0];

      // === 4d️⃣ ADD OFFER ===
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
          if(name && !serviceTypes.includes(name)) serviceTypes.push(name);
        }
      }

      // === 4e️⃣ PARSE TABLE & BODY ===
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

      // === 5️⃣ INTERNAL LINKS ===
      const anchors = [...document.querySelectorAll("article a, main a, .post-body a")]
        .filter(a => a.href && a.href.includes(location.hostname) && !a.href.includes("#"))
        .map(a => ({ url: a.href.split("#")[0].replace(/[?&]m=1/, ""), name: a.innerText.trim() || a.href }));
      const uniqueLinks = Array.from(new Map(anchors.map(a => [a.url, a.name])).entries())
        .map(([url, name], i) => ({ "@type": "ListItem", position: i + 1, url, name }));

      // === 6️⃣ BUILD GRAPH ===
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
        areaServed,
        knowsAbout: ["Beton cor","Ready mix","Precast","Sewa alat berat","Jasa konstruksi"],
        ...(isProductPage && { hasOfferCatalog: { "@id": cleanUrl + "#product" } })
      };
      graph.push(localBiz);

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
      };
      graph.push(webpage);

      const service = {
        "@type": "Service",
        "@id": cleanUrl + "#service",
        name: PAGE.title,
        description: PAGE.description,
        image: PAGE.image,
        serviceType: serviceTypes,
        areaServed,
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

      // === 8️⃣ OUTPUT ===
      const schema = { "@context": "https://schema.org", "@graph": graph };
      let el = document.querySelector("#auto-schema-service");
      if(!el){
        el = document.createElement("script");
        el.id = "auto-schema-service";
        el.type = "application/ld+json";
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(schema, null, 2);

      console.log(`[Schema v4.53 ✅] Injected | Type: Service${isProductPage ? "+Product" : ""} | Items: ${tableOffers.length} | Area: ${areaServed.length} | ServiceType: ${serviceTypes.join(", ")} | Evergreen: ${isEvergreen}`);
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

  }, 500);
});
