//* ⚡ AUTO SCHEMA UNIVERSAL v4.54+dual-parent — Hybrid Service + Product | Beton Jaya Readymix */
document.addEventListener("DOMContentLoaded", async function () {
  setTimeout(async () => {
    let schemaInjected = false;

    async function initSchema() {
      if (schemaInjected) return;
      schemaInjected = true;
      console.log("[Schema Service v4.54+ 🚀] Auto generator dijalankan (Service + Product + Offers + Multi Parent)");

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

      // === 2️⃣ URL PARENT (MULTI SUPPORT + FALLBACK 2 LEVEL BREADCRUMB) ===
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
          // Ambil dua terakhir dari breadcrumb (misal: Lokasi & Depok)
          parentUrls.push(breadcrumbs[breadcrumbs.length - 2]);
          parentUrls.push(breadcrumbs[breadcrumbs.length - 1]);
        } else if (breadcrumbs.length === 1) {
          parentUrls.push(breadcrumbs.pop());
        }
      }

      const cleanParentUrls = parentUrls
        .map(u => u.replace(/[?&]m=1/, ""))
        .filter(u => u && u !== location.origin);
      const cleanParentUrl = cleanParentUrls.length ? cleanParentUrls[0] : null;

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
      const defaultAreaServed = Object.keys(areaProv).map(a => ({ "@type":"Place", name: a }));

      // === 🧠 DETEKSI AREA SERVED OTOMATIS (SMART VER) ===
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

      // === 🔎 DETEKSI KONTEN & PRODUK ===
      function detectKnowsAbout() {
        let raw = document.querySelector("h1")?.textContent?.trim() || document.title.trim() || "";
        const text = raw.toLowerCase();
        const topics = new Set();
        const keywordMap = {
          "Beton cor / Ready mix": ["beton cor", "ready mix", "readymix", "minimix", "mix"],
          "Precast": ["precast", "u ditch", "box culvert", "buis", "panel", "kanstin", "saluran", "culvert"],
          "Sewa alat berat": ["sewa", "rental", "alat berat", "excavator", "bulldozer", "crane", "roller", "vibro", "tandem"],
          "Jasa konstruksi": ["jasa", "kontraktor", "konstruksi", "pembangunan", "renovasi", "proyek"],
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
        return Array.from(topics);
      }

      function getProductNameFromUrl() {
        let path = location.pathname.replace(/^\/|\/$/g, "").split("/").pop();
        path = path.replace(".html", "").replace(/-/g, " ");
        return decodeURIComponent(path).replace(/\b\w/g, l => l.toUpperCase());
      }
      const productName = getProductNameFromUrl();

      // === 🧩 PRODUCT CATEGORY DETECTION ===
      const productKeywords = {
        BuildingMaterial: ["beton", "ready mix", "precast", "besi", "pipa", "semen", "buis", "gorong gorong", "panel"],
        ConstructionEquipment: ["excavator", "bulldozer", "crane", "vibro roller", "tandem roller", "wales", "grader", "dump truck"]
      };
      function detectProductCategory(name) {
        name = name.toLowerCase();
        for (const [category, keywords] of Object.entries(productKeywords)) {
          if (keywords.some(k => name.includes(k))) return category;
        }
        return "Other";
      }
      const productCategory = detectProductCategory(productName);

      // === 🏗️ GRAPH ===
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
        "knowsAbout": detectKnowsAbout()
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
        ...(cleanParentUrls.length ? {
          isPartOf: cleanParentUrls.map(u => ({ "@id": u + "#webpage" }))
        } : {})
      };
      graph.push(webpage);

      const service = {
        "@type": "Service",
        "@id": cleanUrl + "#service",
        name: PAGE.title,
        description: PAGE.description,
        image: PAGE.image,
        areaServed: serviceAreaServed,
        provider: { "@id": PAGE.business.url + "#localbusiness" },
        brand: { "@type": "Brand", name: PAGE.business.name },
        mainEntityOfPage: { "@id": cleanUrl + "#webpage" }
      };
      graph.push(service);

      // === 🧠 INJECT SCHEMA ===
      const schema = { "@context": "https://schema.org", "@graph": graph };
      let el = document.querySelector("#auto-schema-service");
      if(!el){
        el = document.createElement("script");
        el.id = "auto-schema-service";
        el.type = "application/ld+json";
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(schema, null, 2);

      console.log(`[Schema v4.54+ ✅] Injected | MultiParent: ${cleanParentUrls.length} | Parents: ${cleanParentUrls.join(", ")}`);
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
