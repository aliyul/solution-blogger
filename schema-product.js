document.addEventListener("DOMContentLoaded", function () {
  setTimeout(async () => {
    console.log("[AutoSchema v4.26] 🚀 Deteksi otomatis produk + area (Hybrid Cache + Wikipedia)");

    // === META DASAR ===
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const url = (ogUrl || canonical || location.href).replace(/[?&]m=1/, "");
    const title = document.querySelector("h1")?.innerText?.trim() || document.title.trim();
    const metaDesc = document.querySelector('meta[name="description"]')?.content?.trim();
    const desc = metaDesc || Array.from(document.querySelectorAll("p"))
      .map(p => p.innerText.trim()).join(" ").substring(0, 300);

    let image = document.querySelector('meta[property="og:image"]')?.content ||
      document.querySelector("article img, main img, .post-body img, img")?.src;
    if (!image || image.startsWith("data:")) {
      image = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";
    }

    // === DATA AREA LOKAL ===
    const areaJSON = {
      "Kabupaten Karawang": ["Telukjambe Timur","Telukjambe Barat","Karawang Barat","Karawang Timur","Cikampek","Rengasdengklok","Klari"],
      "Kabupaten Bogor": ["Cibinong","Cileungsi","Gunung Putri","Dramaga","Cisarua","Babakan Madang","Parung","Ciomas"],
      "Kota Bogor": ["Bogor Utara","Bogor Selatan","Bogor Timur","Bogor Tengah","Bogor Barat","Tanah Sareal"],
      "Kota Depok": ["Beji","Cimanggis","Cilodong","Sukmajaya","Pancoran Mas","Cipayung","Sawangan","Tapos","Cinere","Limo"],
      "Kabupaten Serang": ["Kragilan","Cikande","Ciruas","Kibin","Pamarayan","Tirtayasa","Pontang","Anyar","Cinangka"],
      "Kota Serang": ["Serang","Kasemen","Walantaka","Curug","Cipocok Jaya","Taktakan"],
      "Kota Cilegon": ["Ciwandan","Citangkil","Grogol","Pulomerak","Purwakarta","Cibeber","Cilegon","Jombang"],
      "Kabupaten Tangerang": ["Tigaraksa","Cikupa","Balaraja","Curug","Cisauk","Panongan","Legok","Pasar Kemis"],
      "Kota Tangerang": ["Ciledug","Karawaci","Neglasari","Periuk","Cibodas","Benda","Cipondoh"],
      "Kota Tangerang Selatan": ["Serpong","Serpong Utara","Pamulang","Ciputat","Ciputat Timur","Pondok Aren"],
      "DKI Jakarta": ["Jakarta Selatan","Jakarta Timur","Jakarta Barat","Jakarta Utara","Jakarta Pusat","Kepulauan Seribu"]
    };

    const getWiki = name => "https://id.wikipedia.org/wiki/" + name.replace(/\s+/g, "_");

    // === DETEKSI AREA SERVED ===
    async function detectAreaServed(url) {
      const lowerUrl = url.toLowerCase();
      const cached = sessionStorage.getItem("areaCache:" + lowerUrl);
      if (cached) return JSON.parse(cached);

      let result = [];

      // Deteksi kecamatan
      for (const kab in areaJSON) {
        for (const kec of areaJSON[kab]) {
          const slug = kec.toLowerCase().replace(/\s+/g, "-");
          if (lowerUrl.includes(slug)) {
            result.push({ "@type": "Place", "name": kec, "sameAs": getWiki(kec) });
            result.push({ "@type": "Place", "name": kab, "sameAs": getWiki(kab) });
            break;
          }
        }
      }

      // Deteksi kabupaten
      if (!result.length) {
        for (const kab in areaJSON) {
          const slug = kab.toLowerCase().replace(/\s+/g, "-");
          if (lowerUrl.includes(slug)) {
            result.push({ "@type": "Place", "name": kab, "sameAs": getWiki(kab) });
            break;
          }
        }
      }

      // Coba Wikipedia jika belum ketemu
      if (!result.length) {
        const match = lowerUrl.match(/([a-z-]+)(?=\.html|$)/);
        if (match) {
          const q = match[1].replace(/-/g, " ");
          try {
            const res = await fetch(`https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`);
            if (res.ok) {
              const data = await res.json();
              if (data?.title) {
                result.push({ "@type": "Place", "name": data.title, "sameAs": data.content_urls.desktop.page });
              }
            }
          } catch (err) {
            console.warn("[Wikipedia fallback gagal]", err);
          }
        }
      }

      if (!result.length) {
        result = [{ "@type": "Place", "name": "Indonesia", "sameAs": getWiki("Indonesia") }];
      }

      sessionStorage.setItem("areaCache:" + lowerUrl, JSON.stringify(result));
      return result;
    }

    const areaServed = await detectAreaServed(url);

    // === DETEKSI PRODUK / JASA ===
    const text = document.body.innerText.toLowerCase();
    const isProduct = /readymix|beton|precast|buis|pipa|u ditch|box culvert|conblock|paving|panel beton/i.test(text);
    const isService = /sewa|rental|kontraktor|renovasi|borongan|angkut|cut fill|pengaspalan/i.test(text);

    const category = isProduct && !isService ? "Produk Material & Konstruksi" :
      isService && !isProduct ? "Layanan Jasa Konstruksi" : "Produk & Jasa Konstruksi";

    // === BRAND DETEKSI ===
    let brandName = "Beton Jaya Readymix";
    const brandMatch = text.match(/jayamix|adhimix|holcim|scg|pionir|dynamix|tiga roda|solusi bangun/i);
    if (brandMatch) brandName = brandMatch[0].replace(/\b\w/g, l => l.toUpperCase());

    // === SCHEMA ===
    const business = {
      "@type": ["LocalBusiness", "GeneralContractor"],
      "@id": "https://www.betonjayareadymix.com/#localbusiness",
      name: "Beton Jaya Readymix",
      url: "https://www.betonjayareadymix.com",
      telephone: "+6283839000968",
      address: { "@type": "PostalAddress", addressLocality: "Bogor", addressRegion: "Jawa Barat", addressCountry: "ID" },
      description: "Beton Jaya Readymix menyediakan beton cor ready mix, precast, dan jasa alat berat di seluruh wilayah Jawa Barat, Banten, dan DKI Jakarta.",
      areaServed,
      sameAs: ["https://www.facebook.com/betonjayareadymix", "https://www.instagram.com/betonjayareadymix"],
      logo: image
    };

    const mainEntity = {
      "@type": isProduct ? "Product" : "Service",
      "@id": url + "#" + (isProduct ? "product" : "service"),
      name: title,
      description: desc,
      image,
      brand: { "@type": "Brand", name: brandName },
      areaServed,
      category,
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "IDR",
        availability: "https://schema.org/InStock"
      },
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

    document.querySelector("#auto-schema-product").textContent = JSON.stringify(schemaData, null, 2);
    console.log(`[AutoSchema v4.26] ✅ Sukses — ${areaServed.length} lokasi terdeteksi (${isProduct ? "Produk" : "Jasa"}).`);
  }, 600);
});
