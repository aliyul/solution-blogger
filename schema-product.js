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

      // 🧩 1️⃣ Breadcrumb detection
      const breadcrumbLinks = Array.from(document.querySelectorAll(".breadcrumbs a"))
        .map(a => a.href)
        .filter(href => href && href !== location.href);
      breadcrumbLinks.forEach(url => urls.add(url));

      // 🧩 2️⃣ Meta parent-url
      const metaParent = document.querySelector('meta[name="parent-url"]')?.content?.trim();
      if (metaParent && !urls.has(metaParent)) urls.add(metaParent);

      // 🧩 3️⃣ Fallback ke domain utama
      if (urls.size === 0) urls.add(location.origin);

      // 🧩 4️⃣ Convert ke array objek schema
      return Array.from(urls).map(u => ({ "@type": "WebPage", "@id": u }));
    }

    const parentUrls = detectParentUrls();

    // === 3️⃣ IMAGE DETECTION ===
    let contentImage = "";
    const imgEl = document.querySelector("article img, main img, .post-body img, table img, img");
    if (imgEl && imgEl.src && !/favicon|blank|logo/i.test(imgEl.src)) contentImage = imgEl.src.trim();
    if (!contentImage) contentImage = fallbackImage;

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

    // === 🧠 4B️⃣ DETEKSI AREA SERVED OTOMATIS ===
    async function detectAreaServed() {
      const h1 = titleRaw.toLowerCase();
      for (const [kota, prov] of Object.entries(areaProv)) {
        const nameLow = kota.toLowerCase().replace("kabupaten ", "").replace("kota ", "");
        if (h1.includes(nameLow)) {
          return [{ "@type": "Place", name: kota, addressRegion: prov }];
        }
      }
      const match = h1.match(/\b([a-z]{3,15})\b/i);
      if (match) {
        const kecamatanGuess = match[1];
        try {
          const response = await fetch(`https://id.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(kecamatanGuess)}&limit=1`);
          const data = await response.json();
          if (data?.pages?.[0]?.description?.toLowerCase().includes("kecamatan")) {
            const desc = data.pages[0].description;
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
      return defaultAreaServed;
    }
    
    // ✅ WAJIB gunakan await di sini
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

   // === 🧠 DETEKSI EVERGREEN AI v2 (Adaptive SEO Mode) ===
    function detectEvergreenAI() {
      const h1 = (document.querySelector("h1")?.innerText || "").toLowerCase();
      const content = Array.from(document.querySelectorAll("article p, main p, .post-body p"))
                           .map(p => p.innerText)
                           .join(" ")
                           .toLowerCase();
    
      const text = (h1 + " " + content).replace(/\s+/g, " ");
    
      // 1️⃣ Deteksi pola time-sensitive
      const hasTimePattern = /\b(20\d{2}|harga|tarif|update|promo|diskon|deadline|agenda|sementara|terbaru|bulan|minggu)\b/.test(text);
    
      // 2️⃣ Indikator evergreen
      const evergreenIndicators = (text.match(/\b(cara|tips|panduan|tutorial|langkah|contoh|teknik|definisi|jenis|manfaat|strategi|panduan lengkap)\b/g) || []).length;
    
      // 3️⃣ Skor tambahan
      const paragraphCount = content.split(/\n{2,}/).filter(p => p.trim().length > 50).length;
      const tableCount = document.querySelectorAll("table").length;
      const listCount = document.querySelectorAll("article ol, article ul").length;
      const wordCount = content.split(/\s+/).length;
    
      let evergreenScore = evergreenIndicators + paragraphCount + listCount;
      if (wordCount > 800) evergreenScore += 2;
      if (tableCount > 0) evergreenScore -= 2;
    
      // 4️⃣ Klasifikasi akhir
      let resultType = "semi-evergreen";
      if (hasTimePattern && evergreenScore <= 2) resultType = "non-evergreen";
      else if (evergreenScore >= 5 && !hasTimePattern) resultType = "evergreen";
    
      console.log(`[Evergreen AI ✅] Type: ${resultType}, Score: ${evergreenScore}, TimeSensitive: ${hasTimePattern}`);
      return resultType;
    }
    
    // Jalankan deteksi
    const evergreenType = detectEvergreenAI();
    
    // === 9️⃣ AUTO PRICE VALID UNTIL (Berdasarkan Hasil Deteksi) ===
    const now = new Date();
    const priceValidUntil = new Date(now);
    
    /*
    📘 Standar pakar SEO:
    - evergreen → relevan >12 bulan (update tahunan)
    - semi-evergreen → relevan 3–6 bulan (harga, topik tren ringan)
    - non-evergreen → relevan <3 bulan (promo, update musiman)
    */
    if (evergreenType === "evergreen") {
      priceValidUntil.setFullYear(now.getFullYear() + 1);
    } else if (evergreenType === "semi-evergreen") {
      priceValidUntil.setMonth(now.getMonth() + 6);
    } else {
      priceValidUntil.setMonth(now.getMonth() + 1);
    }
    
    const autoPriceValidUntil = priceValidUntil.toISOString().split("T")[0];
    console.log(`[Auto PriceValidUntil 📅] ${autoPriceValidUntil} (${evergreenType.toUpperCase()})`);


    // === 🔟 PARSER TABLE, TEKS, & LI HARGA v3 ===
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

// 1️⃣ Deteksi dari tabel tetap
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

// 2️⃣ Deteksi dari teks artikel (<article>)
document.querySelectorAll("article").forEach(article=>{
  article.innerText.split("\n").forEach(line=>{
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
});

// 3️⃣ Deteksi langsung dari <li>
document.querySelectorAll("li").forEach(li=>{
  const text = li.innerText;
  const m = text.match(/Rp\s*([\d.,]{4,})/);
  if(m){
    const price = parseInt(m[1].replace(/[.\s,]/g,""));
    if(price>=10000 && price<=500000000){
      let name = text.replace(m[0],"").trim(); // ambil sisa teks sebagai nama
      if(!name || name.toLowerCase() === productName.toLowerCase()) name="";
      addOffer(name, "", price);
    }
  }
});

console.log("[Parser v3] Total detected offers:", tableOffers.length);


// === 11️⃣ INTERNAL LINK (Auto-Clean + Relevance + Unique + Max 50 + Name Cleaned v3 + Blacklist) ===
    function generateCleanInternalLinksV3() {
      const h1 = (document.querySelector("h1")?.innerText || "")
        .toLowerCase()
        .replace(/\d{4}|\b(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\b/gi, ""); // buang bulan & tahun
    
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
    
      // Ambil semua link internal dari konten <article> saja
      const rawLinks = Array.from(document.querySelectorAll("article a"))
        .map(a => a.href)
        .filter(href =>
          href &&
          href.includes(location.hostname) &&
          !href.includes("#") &&
          href !== location.href &&
          !href.match(/(\/search|\/feed|\/label)/i) &&
          !blacklist.includes(href)  // ❌ cek blacklist
        )
        .map(url => url.split("?")[0].replace(/\/$/, "")); // bersihkan query & slash akhir
    
      // Unik
      const uniqueUrls = [...new Set(rawLinks)];
    
      // Hitung relevansi terhadap H1
      const relevancyScores = uniqueUrls.map(url => {
        // ambil slug tanpa /p/ di path untuk name
        let slugText = url.replace(location.origin, "")
          .replace(".html", "")
          .replace(/^\/p\//, "") // HILANGKAN /p/ jika ada
          .replace(/^\/+|\/+$/g, "")
          .replace(/-/g, " ")
          .replace(/\b\d{1,2}\b/g, "") // hapus angka 1-2 digit (bulan/hari)
          .replace(/\d{4}/g, "")        // hapus tahun 4 digit
          .replace(/\b(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\b/gi, "") // hapus nama bulan
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();
    
        let score = 0;
        h1.split(" ").forEach(word => {
          if (word && slugText.includes(word)) score++;
        });
    
        return { url, score, slugText };
      });
    
      // Urutkan berdasarkan relevansi tertinggi
      relevancyScores.sort((a, b) => b.score - a.score);
    
      // Ambil 50 link paling relevan
      const topLinks = relevancyScores.slice(0, 50);
    
      // Buat itemListElement schema
      const itemList = topLinks.map((item, i) => {
        let nameClean = item.slugText
          .replace(/\//g, " ")
          .replace(/\s+/g, " ")
          .trim();
    
        if(nameClean) nameClean = nameClean.charAt(0).toUpperCase() + nameClean.slice(1);
    
        return {
          "@type": "ListItem",
          position: i + 1,
          url: item.url,
          name: nameClean || `Tautan ${i + 1}`
        };
      });
    
      return itemList;
    }
    
    // Jalankan
    const internalLinks = generateCleanInternalLinksV3();
    console.log("[InternalLinks v3 ✅]", internalLinks);

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
      "isPartOf": parentUrls,
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

    console.log(`[AutoSchema v4.53+ ✅] Product: ${productName} | Offers: ${tableOffers.length} | Parent(s): ${parentUrls.map(p=>p["@id"]).join(", ")}`);
  }, 500);
});
