/* ⚡ AUTO SCHEMA UNIVERSAL v4.55+dual-parent-autoItemList — Hybrid Service + Product | Beton Jaya Readymix */
document.addEventListener("DOMContentLoaded", async function () {
  setTimeout(async () => {
    let schemaInjected = false;

    async function initSchema() {
      if (schemaInjected) return;
      schemaInjected = true;
      console.log("[Schema v4.55+ 🚀] Auto generator dijalankan (Service + Product + Offers + Multi Parent + ItemList)");

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
            "https://www.instagram.com/betonjayareadymix"
          ]
        }
      };

      // === 2️⃣ URL PARENT (MULTI BREADCRUMB SUPPORT) ===
      const parentUrls = [];
      document.querySelectorAll('meta[name^="parent-url"]').forEach(meta => {
        const url = meta.content?.trim()?.replace(/[?&]m=1/, "");
        if (url && !parentUrls.includes(url)) parentUrls.push(url);
      });

      if (parentUrls.length === 0) {
        const breadcrumbs = Array.from(document.querySelectorAll(".breadcrumbs a"))
          .map(a => a.href)
          .filter(href => href && href !== location.href);
        if (breadcrumbs.length >= 2) {
          parentUrls.push(breadcrumbs[breadcrumbs.length - 2]);
          parentUrls.push(breadcrumbs[breadcrumbs.length - 1]);
        } else if (breadcrumbs.length === 1) {
          parentUrls.push(breadcrumbs.pop());
        }
      }
      const cleanParentUrls = parentUrls.map(u => u.replace(/[?&]m=1/, "")).filter(u => u && u !== location.origin);

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
      const defaultAreaServed = Object.keys(areaProv).map(a => ({ "@type": "Place", name: a }));

      async function detectAreaServed() {
        const h1 = PAGE.title.toLowerCase();
        for (const [kota, prov] of Object.entries(areaProv)) {
          const nameLow = kota.toLowerCase().replace("kabupaten ", "").replace("kota ", "");
          if (h1.includes(nameLow)) {
            return [{ "@type": "Place", name: kota, addressRegion: prov }];
          }
        }
        return defaultAreaServed;
      }
      const serviceAreaServed = await detectAreaServed();

      // === 4️⃣ AUTO KNOWS ABOUT ===
     function detectKnowsAbout() {
      // Ambil teks utama dari H1 + konten
      const h1 = document.querySelector("h1")?.innerText || "";
      const content = Array.from(document.querySelectorAll("article p, main p, .post-body p"))
                            .map(p => p.innerText)
                            .join(" ");
      const text = (h1 + " " + content).toLowerCase();
    
      // Bersihkan teks: hapus karakter non-alfabet & stopwords sederhana
      const stopwords = new Set([
        "dan","di","yang","untuk","dengan","pada","adalah","atau","ini","juga","oleh","dari","sebagai","dalam","saja","tetapi","agar"
      ]);
      const words = text.match(/\b[a-z]{3,}\b/g) || [];
      const filtered = words.filter(w => !stopwords.has(w));
    
      // Hitung frekuensi kata
      const freq = {};
      filtered.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    
      // Ambil kata paling sering muncul (top 5)
      const topWords = Object.entries(freq)
                             .sort((a,b) => b[1] - a[1])
                             .slice(0,5)
                             .map(e => e[0]);
    
      // Gunakan topWords untuk membuat daftar topik otomatis
      // Misal: setiap kata menjadi topik sederhana (Google bisa mengerti)
      return topWords.map(w => w.charAt(0).toUpperCase() + w.slice(1));
    }

      // === 5️⃣ AUTO ITEMLIST INTERNAL LINKS (bersih + relevan + unik) ===
     // === 11️⃣ INTERNAL LINK (Auto-Clean + Relevance + Unique + Max 50 + Name Cleaned v2) ===
      function generateCleanInternalLinksV2() {
        const h1 = (document.querySelector("h1")?.innerText || "")
          .toLowerCase()
          .replace(/\d{4}|\b(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\b/gi, ""); // buang bulan & tahun
      
        // Ambil semua link internal
        const rawLinks = Array.from(document.querySelectorAll("article a, main a, .post-body a, a"))
          .map(a => a.href)
          .filter(href =>
            href &&
            href.includes(location.hostname) &&
            !href.includes("#") &&
            href !== location.href &&
            !href.match(/(\/search|\/feed|\/label)/i)
          )
          .map(url => url.split("?")[0].replace(/\/$/, "").replace(/[?&].*$/, "")); // bersihkan ?m=1, query, slash
      
        // Unik
        const uniqueUrls = [...new Set(rawLinks)];
      
        // Hitung relevansi terhadap H1
        const relevancyScores = uniqueUrls.map(url => {
          let slugText = url.replace(location.origin, "")
            .replace(".html", "")
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
      const internalLinks = generateCleanInternalLinksV2();
      console.log("[InternalLinks v2 ✅]", internalLinks);

      // === 6️⃣ GRAPH ===
      const graph = [];

      graph.push({
        "@type": ["LocalBusiness","GeneralContractor"],
        "@id": PAGE.business.url + "#localbusiness",
        name: PAGE.business.name,
        url: PAGE.business.url,
        telephone: PAGE.business.telephone,
        description: PAGE.business.description,
        address: PAGE.business.address,
        openingHours: PAGE.business.openingHours,
        logo: PAGE.image,
        sameAs: PAGE.business.sameAs,
        areaServed: defaultAreaServed,
        knowsAbout: detectKnowsAbout()
      });

      graph.push({
        "@type": "WebPage",
        "@id": cleanUrl + "#webpage",
        url: cleanUrl,
        name: PAGE.title,
        description: PAGE.description,
        image: PAGE.image,
        mainEntity: { "@id": cleanUrl + "#service" },
        publisher: { "@id": PAGE.business.url + "#localbusiness" },
        ...(cleanParentUrls.length ? { isPartOf: cleanParentUrls.map(u => ({ "@id": u + "#webpage" })) } : {})
      });

      graph.push({
        "@type": "Service",
        "@id": cleanUrl + "#service",
        name: PAGE.title,
        description: PAGE.description,
        image: PAGE.image,
        areaServed: serviceAreaServed,
        provider: { "@id": PAGE.business.url + "#localbusiness" },
        brand: { "@type": "Brand", name: PAGE.business.name },
        mainEntityOfPage: { "@id": cleanUrl + "#webpage" }
      });

      graph.push({
        "@type": "ItemList",
        "@id": cleanUrl + "#internal-links",
        name: "Daftar Halaman Terkait",
        numberOfItems: internalLinks.length,
        itemListElement: internalLinks
      });

      // === 7️⃣ INJECT ===
      const schema = { "@context": "https://schema.org", "@graph": graph };
      let el = document.querySelector("#auto-schema-service");
      if (!el) {
        el = document.createElement("script");
        el.id = "auto-schema-service";
        el.type = "application/ld+json";
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(schema, null, 2);
      console.log(`[Schema v4.55 ✅] Injected | Parents: ${cleanParentUrls.length} | ItemList: ${internalLinks.length}`);
    }

    if (document.querySelector("h1") && document.querySelector(".post-body")) {
      await initSchema();
    } else {
      const obs = new MutationObserver(async () => {
        if (document.querySelector("h1") && document.querySelector(".post-body")) {
          await initSchema(); obs.disconnect();
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
    }
  }, 600);
});
