// The Last
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(() => {
    console.log("[Schema Service] Script dijalankan.");

    // ====== DETEKSI URL BERSIH ======
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonicalLink = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const baseUrl = ogUrl || canonicalLink || location.href;
    const cleanUrl = baseUrl.replace(/[?&]m=1/, "");

    // ====== KONFIGURASI HALAMAN ======
    const PAGE = {
      url: cleanUrl,
      title: document.querySelector('h1')?.textContent?.trim() || document.title.trim(),
      description: (() => {
        const meta = document.querySelector('meta[name="description"]')?.content?.trim();
        if (meta && meta.length > 30) return meta;
        const p = document.querySelector('article p, main p, .post-body p');
        if (p && p.innerText.trim().length > 40) return p.innerText.trim().substring(0, 300);
        const altText = Array.from(document.querySelectorAll('p, li'))
          .map(el => el.innerText.trim()).filter(Boolean).join(' ');
        return altText.substring(0, 300);
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
        description: "Beton Jaya Readymix adalah penyedia solusi konstruksi terlengkap di Indonesia, menawarkan layanan beton cor ready mix, precast, serta jasa konstruksi profesional untuk berbagai proyek infrastruktur, gedung, hingga renovasi rumah tinggal.",
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
      },
      internalLinks: Array.from(document.querySelectorAll('article a, main a, .post-body a'))
        .filter(a => a.href && a.href.includes(location.hostname) && a.href !== cleanUrl)
        .map(a => ({ url: a.href.replace(/[?&]m=1/, ""), name: a.innerText.trim() }))
    };

    // ====== DETEKSI AREA ======
    (function detectAreaServed() {
      const defaultAreas = [
        "DKI Jakarta","Kabupaten Bekasi","Kota Bekasi","Kabupaten Bogor","Kota Bogor",
        "Kabupaten Tangerang","Kota Tangerang","Tangerang Selatan","Kota Depok",
        "Kabupaten Karawang","Kabupaten Serang","Kota Serang","Kota Cilegon"
      ];
      const url = PAGE.url.toLowerCase();
      const match = defaultAreas.find(area =>
        url.includes(area.toLowerCase().replace(/\s+/g, '-')) ||
        url.includes(area.toLowerCase().replace(/\s+/g, ''))
      );
      PAGE.service.areaServed = match ? [match] : defaultAreas;
    })();

    // ====== EKSTRAKTI SERVICE TYPE ======
    (function extractServiceTypes() {
      const contentEls = document.querySelectorAll('article p, li, main p, main li, .post-body p, .post-body li');
      const typesSet = new Set();
      contentEls.forEach(el => {
        const text = el.innerText.trim();
        if (!text || text.length > 120) return;
        const match = text.match(/^(Renovasi|Perbaikan|Pemasangan|Epoxy|Peremajaan|Instalasi|Perkuatan)\s+[A-Z][a-zA-Z0-9\s]+/);
        if (match) typesSet.add(match[0].replace(/\s+/g, ' ').trim());
      });
      PAGE.service.types = Array.from(typesSet);
    })();

    // ====== DETEKSI PRODUK & HARGA (dari heading harga) ======
    function detectProductPackage() {
      const headings = [...document.querySelectorAll('h2,h3,h4')];
      const offers = [];
      const rangeSet = new Set();
      const singleSet = new Set();

      headings.forEach(h => {
        const title = h.textContent.trim().toLowerCase();
        if (!title.includes("harga")) return;

        let sectionContent = "";
        let next = h.nextElementSibling;
        while (next && !['H2','H3','H4'].includes(next.tagName)) {
          if (/harga\s+dapat\s+berubah/i.test(next.innerText)) break;
          sectionContent += " " + next.innerText;
          next = next.nextElementSibling;
        }

        const rangeRegex = /Rp\s*([\d.,]+)\s*[-–]\s*Rp\s*([\d.,]+)/g;
        let match;
        while ((match = rangeRegex.exec(sectionContent)) !== null) {
          const low = parseInt(match[1].replace(/[.\s]/g, ''), 10);
          const high = parseInt(match[2].replace(/[.\s]/g, ''), 10);
          if (!isNaN(low) && !isNaN(high)) {
            rangeSet.add(`${low}-${high}`);
            offers.push({
              "@type": "Offer",
              priceCurrency: "IDR",
              price: `${low}`,
              priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear()+1)).toISOString().split('T')[0],
              availability: "https://schema.org/InStock",
              url: cleanUrl
            });
            offers.push({
              "@type": "Offer",
              priceCurrency: "IDR",
              price: `${high}`,
              priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear()+1)).toISOString().split('T')[0],
              availability: "https://schema.org/InStock",
              url: cleanUrl
            });
          }
        }

        const singleMatches = sectionContent.match(/Rp\s*[\d.,]+/g);
        if (singleMatches) {
          singleMatches.forEach(p => {
            if (/-|–/.test(p)) return;
            const cleaned = p.replace(/[Rp\s.]/g, '').replace(/,/g, '');
            const num = parseInt(cleaned, 10);
            if (!isNaN(num)) {
              singleSet.add(num);
              offers.push({
                "@type": "Offer",
                priceCurrency: "IDR",
                price: `${num}`,
                priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear()+1)).toISOString().split('T')[0],
                availability: "https://schema.org/InStock",
                url: cleanUrl
              });
            }
          });
        }
      });

      const allPrices = [];
      rangeSet.forEach(r => { const [l,h]=r.split('-').map(Number); allPrices.push(l,h); });
      singleSet.forEach(n => allPrices.push(n));

      if (allPrices.length > 0) {
        const prices = allPrices.sort((a,b)=>a-b);
        return {
          hasProduct: true,
          lowPrice: prices[0],
          highPrice: prices[prices.length-1],
          offerCount: offers.length,
          offers
        };
      }
      return { hasProduct: false };
    }

    const productData = detectProductPackage();

    // ====== GENERATE SCHEMA ======
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
          priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear()+1)).toISOString().split('T')[0],
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

    // ====== INJEKSI JSON-LD ======
    let schemaScript = document.querySelector('#auto-schema-service');
    if (!schemaScript) {
      schemaScript = document.createElement("script");
      schemaScript.id = "auto-schema-service";
      schemaScript.type = "application/ld+json";
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(generateSchema(PAGE, productData), null, 2);
    console.log("[Schema Service] JSON-LD berhasil diinject ✅");
  }, 500);
});
