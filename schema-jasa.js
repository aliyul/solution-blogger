document.addEventListener("DOMContentLoaded", function() {
  setTimeout(() => {
    console.log("[Schema Service] Script dijalankan ✅");

    // ========== DETEKSI URL BERSIH ==========
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonicalLink = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const baseUrl = ogUrl || canonicalLink || location.href;
    const cleanUrl = baseUrl.replace(/[?&]m=1/, "");

    // ========== KONFIGURASI HALAMAN ==========
    const PAGE = {
      url: cleanUrl,
      title: document.querySelector('h1')?.textContent?.trim() || document.title.trim(),
      description: (() => {
        const meta = document.querySelector('meta[name="description"]')?.content?.trim();
        if (meta && meta.length > 30) return meta;
        const p = document.querySelector('article p, main p, .post-body p');
        if (p && p.innerText.trim().length > 40) return p.innerText.trim().substring(0, 300);
        const alt = Array.from(document.querySelectorAll('p, li'))
          .map(el => el.innerText.trim()).filter(Boolean).join(' ');
        return alt.substring(0, 300);
      })(),
      parentUrl: (() => {
        const metaParent = document.querySelector('meta[name="parent-url"]')?.content?.trim();
        if (metaParent) return metaParent;
        if (ogUrl && ogUrl !== cleanUrl) return ogUrl.replace(/[?&]m=1/, "");
        const breadcrumbLinks = Array.from(document.querySelectorAll('nav.breadcrumbs a'))
          .map(a => a.href.replace(/[?&]m=1/, ""))
          .filter(href => href !== cleanUrl);
        if (breadcrumbLinks.length) return breadcrumbLinks[breadcrumbLinks.length - 1];
        return location.origin;
      })(),
      service: {
        name: document.querySelector('h1')?.textContent?.trim() || 'Jasa Profesional',
        description: document.querySelector('meta[name="description"]')?.content 
          || document.querySelector('p')?.innerText?.trim() 
          || 'Layanan profesional dalam bidang konstruksi dan beton.',
        types: [],
        areaServed: []
      },
      business: {
        name: "Beton Jaya Readymix",
        url: "https://www.betonjayareadymix.com",
        telephone: "+6283839000968",
        openingHours: "Mo-Sa 08:00-17:00",
        description: "Beton Jaya Readymix adalah penyedia solusi konstruksi terlengkap di Indonesia, menawarkan layanan beton cor ready mix, precast, serta jasa konstruksi profesional.",
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

    // ========== DETEKSI AREA SERVED ==========
    (function detectArea() {
      const areas = [
        "DKI Jakarta","Kabupaten Bekasi","Kota Bekasi","Kabupaten Bogor","Kota Bogor",
        "Kabupaten Tangerang","Kota Tangerang","Tangerang Selatan","Kota Depok",
        "Kabupaten Karawang","Kabupaten Serang","Kota Serang","Kota Cilegon"
      ];
      const url = PAGE.url.toLowerCase();
      const match = areas.find(area =>
        url.includes(area.toLowerCase().replace(/\s+/g, '-')) ||
        url.includes(area.toLowerCase().replace(/\s+/g, ''))
      );
      PAGE.service.areaServed = match ? [match] : areas;
    })();

    // ========== DETEKSI SERVICE TYPE ==========
    (function detectServiceTypes() {
      const els = document.querySelectorAll('article p, li, main p, .post-body p');
      const types = new Set();
      els.forEach(el => {
        const txt = el.innerText.trim();
        if (txt.length > 120) return;
        const m = txt.match(/^(Renovasi|Perbaikan|Pemasangan|Epoxy|Peremajaan|Instalasi|Perkuatan)\s+[A-Z][a-zA-Z\s]+/);
        if (m) types.add(m[0]);
      });
      PAGE.service.types = Array.from(types);
    })();

    // ========== DETEKSI PRODUK & HARGA (heading khusus harga) ==========
    function detectProductPackage() {
      const headings = [...document.querySelectorAll('h2,h3,h4')];
      const offers = [];
      const prices = [];

      headings.forEach(h => {
        const title = h.textContent.trim().toLowerCase();
        if (!title.includes("harga")) return; // hanya heading yang bahas harga

        let content = "";
        let next = h.nextElementSibling;
        while (next && !["H2","H3","H4"].includes(next.tagName)) {
          content += " " + next.innerText;
          next = next.nextElementSibling;
        }

        // Range harga: "Rp 450.000 – Rp 650.000"
        const rangeRegex = /Rp\s*([\d.,]+)\s*[-–]\s*Rp\s*([\d.,]+)/g;
        let match;
        while ((match = rangeRegex.exec(content)) !== null) {
          const low = parseInt(match[1].replace(/[.\s]/g, ''), 10);
          const high = parseInt(match[2].replace(/[.\s]/g, ''), 10);
          if (!isNaN(low) && !isNaN(high)) {
            prices.push(low, high);
            offers.push({
              "@type": "Offer",
              priceCurrency: "IDR",
              price: low,
              availability: "https://schema.org/InStock",
              priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear()+1)).toISOString().split("T")[0],
              url: cleanUrl
            },{
              "@type": "Offer",
              priceCurrency: "IDR",
              price: high,
              availability: "https://schema.org/InStock",
              priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear()+1)).toISOString().split("T")[0],
              url: cleanUrl
            });
          }
        }

        // Harga tunggal: "Rp 550.000"
        const singleMatches = content.match(/Rp\s*[\d.,]+/g);
        if (singleMatches) {
          singleMatches.forEach(p => {
            if (/-|–/.test(p)) return; // skip range
            const num = parseInt(p.replace(/[Rp\s.]/g, '').replace(/,/g, ''), 10);
            if (!isNaN(num)) {
              prices.push(num);
              offers.push({
                "@type": "Offer",
                priceCurrency: "IDR",
                price: num,
                availability: "https://schema.org/InStock",
                priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear()+1)).toISOString().split("T")[0],
                url: cleanUrl
              });
            }
          });
        }
      });

      if (prices.length) {
        prices.sort((a,b)=>a-b);
        return {
          hasProduct: true,
          lowPrice: prices[0],
          highPrice: prices[prices.length - 1],
          offerCount: offers.length,
          offers
        };
      }
      return { hasProduct: false };
    }

    const productData = detectProductPackage();

    // ========== GENERATE SCHEMA ==========
    function generateSchema(page, product) {
      const graph = [];

      graph.push({
        "@type": "WebPage",
        "@id": page.url + "#webpage",
        url: page.url,
        name: page.title,
        description: page.description,
        ...(page.parentUrl && { isPartOf: { "@id": page.parentUrl } }),
        mainEntity: { "@id": page.url + "#service" },
        publisher: { "@id": page.business.url + "#localbusiness" }
      });

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
        brand: { "@type": "Brand", name: page.business.name }
      });

      const serviceObj = {
        "@type": "Service",
        "@id": page.url + "#service",
        name: page.service.name,
        description: page.service.description,
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
          priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear()+1)).toISOString().split("T")[0],
          url: page.url
        };

        graph.push({
          "@type": "Product",
          "@id": page.url + "#product",
          name: "Harga " + page.service.name,
          description: page.service.description,
          category: "Jasa Konstruksi",
          brand: { "@type": "Brand", name: page.business.name },
          aggregateOffer: serviceObj.offers,
          offers: product.offers
        });
      }

      graph.push(serviceObj);
      return { "@context": "https://schema.org", "@graph": graph };
    }

    // ========== INJEKSI JSON-LD ==========
    let schemaScript = document.querySelector('#auto-schema-service');
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
