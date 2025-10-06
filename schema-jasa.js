//Joss
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(() => {
    console.log("[Schema Service] Script dijalankan ✅");

    // ===== DETEKSI URL BERSIH =====
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonicalLink = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const baseUrl = ogUrl || canonicalLink || location.href;
    const cleanUrl = baseUrl.replace(/[?&]m=1/, "");

    // ===== KONFIGURASI PAGE =====
    const PAGE = {
      url: cleanUrl,
      title: document.querySelector("h1")?.textContent?.trim() || document.title.trim(),
      description: (() => {
        const meta = document.querySelector('meta[name="description"]')?.content?.trim();
        if (meta && meta.length > 30) return meta;
        const p = document.querySelector("article p, main p, .post-body p");
        if (p && p.innerText.trim().length > 40) return p.innerText.trim().substring(0, 300);
        const alt = Array.from(document.querySelectorAll("p, li"))
          .map(el => el.innerText.trim())
          .filter(Boolean)
          .join(" ");
        return alt.substring(0, 300);
      })(),
      parentUrl: (() => {
        const metaParent = document.querySelector('meta[name="parent-url"]')?.content?.trim();
        if (metaParent) return metaParent;
        if (ogUrl && ogUrl !== cleanUrl) return ogUrl.replace(/[?&]m=1/, "");
        const breadcrumbLinks = Array.from(document.querySelectorAll("nav.breadcrumbs a"))
          .map(a => a.href.replace(/[?&]m=1/, ""))
          .filter(href => href !== cleanUrl);
        if (breadcrumbLinks.length) return breadcrumbLinks[breadcrumbLinks.length - 1];
        return location.origin;
      })(),
      image: (() => {
        const ogImg = document.querySelector('meta[property="og:image"]')?.content;
        const articleImg = document.querySelector("article img, main img, .post-body img")?.src;
        return (
          ogImg ||
          articleImg ||
          "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png"
        );
      })(),
      service: {
        name: document.querySelector("h1")?.textContent?.trim() || "Jasa Profesional",
        description:
          document.querySelector('meta[name="description"]')?.content ||
          document.querySelector("p")?.innerText?.trim() ||
          "Layanan profesional dalam bidang konstruksi dan beton.",
        types: [],
        areaServed: []
      },
      business: {
        name: "Beton Jaya Readymix",
        url: "https://www.betonjayareadymix.com",
        telephone: "+6283839000968",
        openingHours: "Mo-Sa 08:00-17:00",
        description:
          "Beton Jaya Readymix adalah penyedia solusi konstruksi terlengkap di Indonesia, menawarkan layanan beton cor ready mix, precast, serta jasa konstruksi profesional.",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Bogor",
          addressRegion: "Jawa Barat",
          addressCountry: "ID"
        },
        sameAs: [
          "https://www.facebook.com/betonjayareadymix",
          "https://www.instagram.com/betonjayareadymix"
        ]
      }
    };

    // ===== DETEKSI AREA SERVED =====
    (function detectArea() {
      const areas = [
        "DKI Jakarta","Kabupaten Bekasi","Kota Bekasi","Kabupaten Bogor","Kota Bogor",
        "Kabupaten Tangerang","Kota Tangerang","Tangerang Selatan","Kota Depok",
        "Kabupaten Karawang","Kabupaten Serang","Kota Serang","Kota Cilegon"
      ];
      const url = PAGE.url.toLowerCase();
      const match = areas.find(area =>
        url.includes(area.toLowerCase().replace(/\s+/g, "-")) ||
        url.includes(area.toLowerCase().replace(/\s+/g, ""))
      );
      PAGE.service.areaServed = match ? [match] : areas;
    })();

    // ===== DETEKSI SERVICE TYPES =====
    (function detectServiceTypes() {
      const els = document.querySelectorAll("article p, li, main p, .post-body p");
      const types = new Set();
      els.forEach(el => {
        const txt = el.innerText.trim();
        if (txt.length > 120) return;
        const m = txt.match(
          /^(Renovasi|Perbaikan|Pemasangan|Epoxy|Peremajaan|Instalasi|Perkuatan)\s+[A-Z][a-zA-Z\s]+/
        );
        if (m) types.add(m[0]);
      });
      PAGE.service.types = Array.from(types);
    })();

    // ===== DETEKSI PRODUK & HARGA =====
    function detectProductPackage() {
      const headings = [...document.querySelectorAll("h2,h3,h4")];
      const offers = [];
      const allPrices = new Set();
      const addedRows = new Set();

      headings.forEach(h => {
        const title = h.textContent.trim().toLowerCase();
        if (!title.includes("harga")) return;

        const section = h.parentElement;
        const contentElements = section.querySelectorAll("table, ul, ol, p");
        contentElements.forEach(el => {
          const text = el.innerText.trim();
          if (!text.match(/Rp\s*\d/)) return;

          const rangeRegex = /Rp\s*([\d.,]+)\s*[-–]\s*Rp\s*([\d.,]+)/g;
          const singleRegex = /Rp\s*([\d.,]+)/g;
          let match;

          while ((match = rangeRegex.exec(text)) !== null) {
            const low = parseInt(match[1].replace(/[.\s]/g, ""), 10);
            const high = parseInt(match[2].replace(/[.\s]/g, ""), 10);
            if (!isNaN(low) && !isNaN(high)) {
              offers.push({
                "@type": "Offer",
                priceCurrency: "IDR",
                price: ((low + high) / 2).toFixed(0),
                priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                  .toISOString()
                  .split("T")[0],
                availability: "https://schema.org/InStock",
                url: PAGE.url
              });
              allPrices.add(low);
              allPrices.add(high);
            }
          }

          while ((match = singleRegex.exec(text)) !== null) {
            const num = parseInt(match[1].replace(/[.\s]/g, ""), 10);
            if (!isNaN(num)) {
              offers.push({
                "@type": "Offer",
                priceCurrency: "IDR",
                price: num,
                availability: "https://schema.org/InStock",
                url: PAGE.url
              });
              allPrices.add(num);
            }
          }
        });
      });

      if (allPrices.size > 0) {
        const sorted = [...allPrices].sort((a, b) => a - b);
        return {
          hasProduct: true,
          lowPrice: sorted[0],
          highPrice: sorted[sorted.length - 1],
          offerCount: offers.length,
          offers
        };
      }
      return { hasProduct: false };
    }

    const productData = detectProductPackage();

    // ===== GENERATE SCHEMA =====
    function generateSchema(page, product) {
      const graph = [];

      // WebPage
      graph.push({
        "@type": "WebPage",
        "@id": page.url + "#webpage",
        url: page.url,
        name: page.title,
        description: page.description,
        image: page.image,
        ...(page.parentUrl && { isPartOf: { "@id": page.parentUrl } }),
        mainEntity: { "@id": page.url + "#service" },
        publisher: { "@id": page.business.url + "#localbusiness" }
      });

      // Business
      graph.push({
        "@type": ["LocalBusiness", "GeneralContractor"],
        "@id": page.business.url + "#localbusiness",
        name: page.business.name,
        url: page.business.url,
        telephone: page.business.telephone,
        openingHours: page.business.openingHours,
        description: page.business.description,
        address: page.business.address,
        sameAs: page.business.sameAs,
        brand: { "@type": "Brand", name: page.business.name },
        logo:
          "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png"
      });

      // Service
      const serviceObj = {
        "@type": "Service",
        "@id": page.url + "#service",
        name: page.service.name,
        description: page.service.description,
        image: page.image,
        serviceType: page.service.types,
        areaServed: page.service.areaServed.map(a => ({ "@type": "Place", name: a })),
        provider: { "@id": page.business.url + "#localbusiness" },
        mainEntityOfPage: { "@id": page.url + "#webpage" }
      };

      if (product.hasProduct) {
        serviceObj.offers = {
          "@type": "AggregateOffer",
          priceCurrency: "IDR",
          lowPrice: product.lowPrice,
          highPrice: product.highPrice,
          offerCount: product.offerCount,
          availability: "https://schema.org/InStock",
          priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            .toISOString()
            .split("T")[0],
          url: page.url
        };

        graph.push({
          "@type": "Product",
          "@id": page.url + "#product",
          name: "Harga " + page.service.name,
          description: page.service.description,
          image: page.image,
          category: "Jasa Konstruksi",
          brand: { "@type": "Brand", name: page.business.name },
          aggregateOffer: serviceObj.offers,
          offers: product.offers
        });
      }

      // ItemList (jika halaman jasa)
      graph.push({
        "@type": "ItemList",
        name: "Daftar Layanan Beton Jaya Readymix",
        itemListElement: [
          {
            "@type": "Service",
            name: page.service.name,
            url: page.url,
            description: page.service.description
          }
        ]
      });

      graph.push(serviceObj);
      return { "@context": "https://schema.org", "@graph": graph };
    }

    // ===== INJEKSI JSON-LD =====
    let schemaScript = document.querySelector("#auto-schema-service");
    if (!schemaScript) {
      schemaScript = document.createElement("script");
      schemaScript.id = "auto-schema-service";
      schemaScript.type = "application/ld+json";
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(generateSchema(PAGE, productData), null, 2);
    console.log(`[Schema Service] JSON-LD berhasil diinject (${productData.offerCount || 0} penawaran)`);

  }, 500);
});
