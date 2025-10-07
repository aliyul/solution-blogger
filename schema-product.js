// ⚡ AUTO SCHEMA UNIVERSAL v4.23 — DETEKSI KECAMATAN + DESA KELURAHAN + WIKIPEDIA + CACHE
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(async () => {
    console.log("[AutoSchema v4.23] 🚀 Mulai deteksi otomatis...");

    // === IDENTIFIKASI URL & METADATA DASAR ===
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const url = (ogUrl || canonical || location.href).replace(/[?&]m=1/, "");
    const title = document.querySelector("h1")?.innerText?.trim() || document.title.trim();
    const metaDesc = document.querySelector('meta[name="description"]')?.content?.trim();
    const desc = metaDesc && metaDesc.length > 50 ? metaDesc : 
      Array.from(document.querySelectorAll("p")).map(p => p.innerText.trim()).join(" ").substring(0, 300);

    let image = document.querySelector('meta[property="og:image"]')?.content ||
      document.querySelector("article img, main img, .post-body img, img")?.src;
    if (!image || image.startsWith("data:")) {
      image = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";
    }

    // === DATA DEFAULT AREA SERVED ===
    const defaultAreaServed = [
      {"@type":"Place","name":"Kabupaten Serang"},
      {"@type":"Place","name":"Kota Serang"},
      {"@type":"Place","name":"Kota Cilegon"},
      {"@type":"Place","name":"Kabupaten Bogor"},
      {"@type":"Place","name":"Kota Bogor"},
      {"@type":"Place","name":"Kota Depok"},
      {"@type":"Place","name":"Kabupaten Tangerang"},
      {"@type":"Place","name":"Kota Tangerang"},
      {"@type":"Place","name":"Kota Tangerang Selatan"},
      {"@type":"Place","name":"Kabupaten Karawang"},
      {"@type":"Place","name":"DKI Jakarta"}
    ];

    // === DATA KECAMATAN DEFAULT UNTUK DETEKSI CEPAT ===
    const areaJSON = {
      "Kabupaten Bogor": ["Cibinong","Cileungsi","Gunung Putri","Jonggol","Dramaga","Ciampea","Leuwiliang","Caringin","Cisarua","Megamendung","Sukaraja","Babakan Madang","Parung","Kemang","Tajurhalang","Ciomas","Rumpin","Cigudeg","Tenjo","Pamijahan"],
      "Kota Bogor": ["Bogor Utara","Bogor Selatan","Bogor Timur","Bogor Tengah","Bogor Barat","Tanah Sareal"],
      "Kota Depok": ["Beji","Cimanggis","Cilodong","Sukmajaya","Pancoran Mas","Cipayung","Sawangan","Tapos","Cinere","Limo"],
      "Kabupaten Karawang": ["Telukjambe Timur","Telukjambe Barat","Karawang Barat","Karawang Timur","Cikampek","Rengasdengklok","Tirtajaya","Pakisjaya","Klari","Cilamaya Wetan","Cilamaya Kulon","Batujaya","Jayakerta","Kutawaluya","Tempuran"],
      "Kabupaten Tangerang": ["Tigaraksa","Cikupa","Balaraja","Curug","Cisauk","Panongan","Sukamulya","Legok","Pasar Kemis","Pagedangan","Pakuhaji","Kosambi"],
      "Kota Tangerang": ["Ciledug","Karang Tengah","Pinang","Cipondoh","Karawaci","Neglasari","Periuk","Cibodas","Benda"],
      "Kota Tangerang Selatan": ["Serpong","Serpong Utara","Pamulang","Ciputat","Ciputat Timur","Pondok Aren","Setu"],
      "Kabupaten Serang": ["Kragilan","Cikande","Ciruas","Kibin","Pamarayan","Tirtayasa","Pontang","Tunjung Teja","Lebakwangi","Jawilan","Petir","Kopo","Anyar","Cinangka","Padarincang","Baros"],
      "Kota Serang": ["Serang","Kasemen","Walantaka","Curug","Cipocok Jaya","Taktakan"],
      "Kota Cilegon": ["Ciwandan","Citangkil","Grogol","Pulomerak","Purwakarta","Cibeber","Cilegon","Jombang"],
      "DKI Jakarta": ["Jakarta Selatan","Jakarta Timur","Jakarta Barat","Jakarta Utara","Jakarta Pusat","Kepulauan Seribu"]
    };

    const getWikipediaUrl = name => "https://id.wikipedia.org/wiki/" + name.replace(/\s+/g, "_");

    // === FETCH DESA / KELURAHAN DARI WIKIPEDIA ===
    async function fetchDesaFromWikipedia(kecamatan){
      const cacheKey = "wiki_" + kecamatan.replace(/\s+/g,"_");
      const cached = sessionStorage.getItem(cacheKey);
      if(cached) return JSON.parse(cached);
      const wikiUrl = "https://id.wikipedia.org/w/api.php?action=parse&page=Kecamatan_" + encodeURIComponent(kecamatan) + "&format=json&origin=*";
      try {
        const res = await fetch(wikiUrl);
        const data = await res.json();
        const html = data.parse?.text["*"];
        const list = [];
        if(html){
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = html;
          tempDiv.querySelectorAll("table.wikitable tbody tr").forEach(row=>{
            const tds = row.querySelectorAll("td");
            if(tds.length>0){
              const name = tds[0].innerText.trim();
              if(name) list.push({ "@type":"Place","name":name,"sameAs":getWikipediaUrl(name) });
            }
          });
        }
        if(list.length===0) list.push({ "@type":"Place","name":kecamatan,"sameAs":getWikipediaUrl(kecamatan) });
        sessionStorage.setItem(cacheKey, JSON.stringify(list));
        return list;
      } catch(e){
        console.warn("Wikipedia fetch gagal:", e);
        return [{ "@type":"Place","name":kecamatan,"sameAs":getWikipediaUrl(kecamatan) }];
      }
    }

    // === DETEKSI AREA SERVED ===
    async function detectAreaServed(url){
      const lowerUrl = url.toLowerCase();
      const results = [];
      for(const kab in areaJSON){
        for(const kec of areaJSON[kab]){
          const slug = kec.toLowerCase().replace(/\s+/g,"-");
          if(lowerUrl.includes(slug)){
            const desaList = await fetchDesaFromWikipedia(kec);
            results.push(...desaList);
          }
        }
      }
      if(results.length) return results;
      for(const kab in areaJSON){
        const slug = kab.toLowerCase().replace(/\s+/g,"-");
        if(lowerUrl.includes(slug)){
          return areaJSON[kab].map(kec=>({ "@type":"Place","name":kec,"sameAs":getWikipediaUrl(kec) }));
        }
      }
      return defaultAreaServed;
    }

    const areaServed = await detectAreaServed(url);

    // === DETEKSI PRODUK / LAYANAN ===
    const textAll = document.body.innerText.toLowerCase();
    let category = "Jasa & Material Konstruksi";
    const isProduct = /readymix|beton|precast|baja|besi|acp|pipa|cat|keramik|bata|genteng|pasir|split|conblock|paving|hebel|box culvert|u ditch|buis beton/i.test(textAll);
    const isService = /sewa|rental|kontraktor|borongan|renovasi|pembangunan|angkut|cut fill|pengaspalan|pancang|pengiriman/i.test(textAll);
    if(isProduct && isService) category = "Produk & Layanan Konstruksi";
    else if(isProduct) category = "Produk Material & Konstruksi";
    else if(isService) category = "Layanan Jasa Konstruksi & Alat Berat";

    let brandName = "Beton Jaya Readymix";
    const brandMatch = textAll.match(/jayamix|adhimix|holcim|scg|pionir|dynamix|tiga roda|solusi bangun/i);
    if(brandMatch) brandName = brandMatch[0].replace(/\b\w/g,l=>l.toUpperCase());

    // === OBJEK SCHEMA ===
    const business = {
      "@type":["LocalBusiness","GeneralContractor"],
      "@id":"https://www.betonjayareadymix.com/#localbusiness",
      name:"Beton Jaya Readymix",
      url:"https://www.betonjayareadymix.com",
      telephone:"+6283839000968",
      address:{"@type":"PostalAddress","addressLocality":"Bogor","addressRegion":"Jawa Barat","addressCountry":"ID"},
      description:"Beton Jaya Readymix menyediakan ready mix, beton precast, dan layanan alat berat di seluruh wilayah Jawa Barat, Banten, dan DKI Jakarta.",
      areaServed,
      sameAs:["https://www.facebook.com/betonjayareadymix","https://www.instagram.com/betonjayareadymix"],
      logo:image
    };

    const entityType = isProduct && !isService ? "Product" : isService && !isProduct ? "Service" : "Product";
    const mainEntity = {
      "@type": entityType,
      "@id": url + "#" + entityType.toLowerCase(),
      name: title,
      description: desc,
      image,
      category,
      brand: { "@type": "Brand", "name": brandName },
      areaServed,
      provider: { "@id": business["@id"] }
    };

    const schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": url + "#webpage",
          url,
          name: title,
          description: desc,
          image,
          mainEntity: { "@id": mainEntity["@id"] },
          publisher: { "@id": business["@id"] }
        },
        business,
        mainEntity
      ]
    };

    document.querySelector("#auto-schema-product").textContent = JSON.stringify(schemaData,null,2);
    console.log("[AutoSchema v4.23] ✅ JSON-LD sukses dipasang. Area terdeteksi:", areaServed.length, "lokasi.");
  }, 600);
});
