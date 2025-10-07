// ⚡ AUTO SCHEMA UNIVERSAL v4.24+ — OPTIMIZED FOR PRODUCT PAGES + AREA SERVED AUTO-DETECT HYBRID
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(async () => {
    console.log("[AutoSchema v4.24+] 🚀 Memulai deteksi otomatis Produk & Area...");

    // === META DASAR & IDENTITAS URL ===
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

    // === DEFAULT AREA SERVED ===
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

    // === AREA JSON (KABUPATEN + KECAMATAN DEFAULT)
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

    // === DETEKSI AREA SERVED (Hybrid Mode: nama1 + daerah → fallback daerah)
    async function detectAreaServed(url){
      const lowerUrl = url.toLowerCase();
      const results = [];

      // Prioritas 1: deteksi gabungan nama1 + daerah
      const possibleCombos = [];
      for (const kab in areaJSON){
        for (const kec of areaJSON[kab]){
          possibleCombos.push(`${kec} ${kab}`.toLowerCase().replace(/\s+/g,"-"));
        }
      }
      for (const combo of possibleCombos){
        if(lowerUrl.includes(combo)){
          const parts = combo.split("-");
          const kecamatan = parts.slice(0, -2).join(" ") || parts[0];
          const kabupaten = parts.slice(-2).join(" ") || "";
          results.push({ "@type":"Place", "name": kecamatan, "sameAs": getWikipediaUrl(kecamatan) });
          if(kabupaten) results.push({ "@type":"Place", "name": kabupaten, "sameAs": getWikipediaUrl(kabupaten) });
          break;
        }
      }

      // Prioritas 2: deteksi nama kecamatan saja
      if(!results.length){
        for(const kab in areaJSON){
          for(const kec of areaJSON[kab]){
            const slug = kec.toLowerCase().replace(/\s+/g,"-");
            if(lowerUrl.includes(slug)){
              results.push({ "@type":"Place", "name": kec, "sameAs": getWikipediaUrl(kec) });
              results.push({ "@type":"Place", "name": kab, "sameAs": getWikipediaUrl(kab) });
              break;
            }
          }
        }
      }

      // Prioritas 3: deteksi nama kabupaten/kota saja
      if(!results.length){
        for(const kab in areaJSON){
          const slug = kab.toLowerCase().replace(/\s+/g,"-");
          if(lowerUrl.includes(slug)){
            results.push({ "@type":"Place", "name": kab, "sameAs": getWikipediaUrl(kab) });
            areaJSON[kab].forEach(kec => {
              results.push({ "@type":"Place", "name": kec, "sameAs": getWikipediaUrl(kec) });
            });
            break;
          }
        }
      }

      return results.length ? results : defaultAreaServed;
    }

    const areaServed = await detectAreaServed(url);

    // === DETEKSI PRODUK ATAU LAYANAN ===
    const textAll = document.body.innerText.toLowerCase();
    const isProduct = /readymix|beton|precast|baja|besi|acp|pipa|cat|keramik|bata|genteng|pasir|split|conblock|paving|hebel|box culvert|u ditch|buis beton|panel beton/i.test(textAll);
    const isService = /sewa|rental|kontraktor|borongan|renovasi|pembangunan|angkut|cut fill|pengaspalan|pancang|pengiriman/i.test(textAll);

    let category = "Jasa & Material Konstruksi";
    if(isProduct && isService) category = "Produk & Layanan Konstruksi";
    else if(isProduct) category = "Produk Material & Konstruksi";
    else if(isService) category = "Layanan Jasa Konstruksi & Alat Berat";

    // === DETEKSI BRAND ===
    let brandName = "Beton Jaya Readymix";
    const brandMatch = textAll.match(/jayamix|adhimix|holcim|scg|pionir|dynamix|tiga roda|solusi bangun/i);
    if(brandMatch) brandName = brandMatch[0].replace(/\b\w/g,l=>l.toUpperCase());

    // === SCHEMA BUSINESS ===
    const business = {
      "@type":["LocalBusiness","GeneralContractor"],
      "@id":"https://www.betonjayareadymix.com/#localbusiness",
      name:"Beton Jaya Readymix",
      url:"https://www.betonjayareadymix.com",
      telephone:"+6283839000968",
      address:{"@type":"PostalAddress","addressLocality":"Bogor","addressRegion":"Jawa Barat","addressCountry":"ID"},
      description:"Beton Jaya Readymix menyediakan beton cor ready mix, beton precast, dan jasa alat berat di seluruh wilayah Jawa Barat, Banten, dan DKI Jakarta.",
      areaServed,
      sameAs:[
        "https://www.facebook.com/betonjayareadymix",
        "https://www.instagram.com/betonjayareadymix"
      ],
      logo:image
    };

    // === SCHEMA MAIN ENTITY ===
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
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "IDR",
        availability: "https://schema.org/InStock"
      },
      provider: { "@id": business["@id"] }
    };

    // === GRAPH FINAL ===
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

    document.querySelector("#auto-schema-product").textContent = JSON.stringify(schemaData, null, 2);
    console.log(`[AutoSchema v4.24+] ✅ JSON-LD sukses — ${entityType} (${areaServed.length} lokasi terdeteksi).`);
  }, 600);
});
