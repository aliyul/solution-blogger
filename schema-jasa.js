//UPDATE 18
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(() => {
    console.log("[Schema Service] Script dijalankan.");

    // ====== KONFIGURASI HALAMAN ======
    const PAGE = {
      url: location.href,
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
        if(metaParent) return metaParent;
        const breadcrumbLinks = Array.from(document.querySelectorAll('nav.breadcrumbs a'))
                                     .map(a => a.href)
                                     .filter(href => href !== location.href);
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
        .filter(a => a.href && a.href.includes(location.hostname) && a.href !== location.href)
        .map(a => ({ url: a.href, name: a.innerText.trim() }))
    };

    // ===== DETEKSI AREA SERVED =====
    (function detectAreaServed() {
      const defaultAreas = [
        "DKI Jakarta", "Kabupaten Bekasi", "Kota Bekasi", 
        "Kabupaten Bogor", "Kota Bogor", "Kabupaten Tangerang", 
        "Kota Tangerang", "Tangerang Selatan", "Kota Depok", 
        "Kabupaten Karawang", "Kabupaten Serang", "Kota Serang", "Kota Cilegon"
      ];
      const url = PAGE.url.toLowerCase();
      const match = defaultAreas.find(area =>
        url.includes(area.toLowerCase().replace(/\s+/g, '-')) ||
        url.includes(area.toLowerCase().replace(/\s+/g, ''))
      );
      PAGE.service.areaServed = match ? [match] : defaultAreas;
    })();

    // ===== EKSTRAKSI SERVICE TYPE OTOMATIS =====
    (function extractServiceTypes() {
      const contentEls = document.querySelectorAll('article p, article li, main p, main li, .post-body p, .post-body li');
      const typesSet = new Set();

      contentEls.forEach(el => {
        const text = el.innerText.trim();
        if (!text || text.length > 120) return;

        const servicePattern = /^(Renovasi|Perbaikan|Pemasangan|Epoxy|Peremajaan|Instalasi|Perkuatan)\s+[A-Z][a-zA-Z0-9\s]+/;
        const match = text.match(servicePattern);
        if (match) typesSet.add(match[0].replace(/\s+/g,' ').trim());
      });

      PAGE.service.types = Array.from(typesSet);
      console.log("[Schema Service] Detected service types:", PAGE.service.types);
    })();

    // ===== DETEKSI PRODUK & HARGA OTOMATIS (TERMULAI DARI "Rp") =====
    function detectProductPackage() {
      const contentEls = Array.from(document.querySelectorAll('p, li, td, th'));
      let lowPrice = Infinity, highPrice = 0, found = false;

      contentEls.forEach(el => {
        const text = el.innerText;
        // Cari semua angka diawali Rp
        const priceMatches = text.match(/Rp\s*[\d.,]+/g);
        if(priceMatches) {
          found = true;
          priceMatches.forEach(p => {
            const cleaned = p.replace(/[Rp\s.]/g,'').replace(/,/g,'');
            const num = parseInt(cleaned,10);
            if(!isNaN(num)) {
              if(num < lowPrice) lowPrice = num;
              if(num > highPrice) highPrice = num;
            }
          });
        }
        // Jika ada range misal "Rp 450.000 – Rp 650.000"
        const rangeMatch = text.match(/Rp\s*([\d.,]+)\s*[-–]\s*Rp\s*([\d.,]+)/);
        if(rangeMatch) {
          found = true;
          const low = parseInt(rangeMatch[1].replace(/[.\s]/g,''),10);
          const high = parseInt(rangeMatch[2].replace(/[.\s]/g,''),10);
          if(!isNaN(low) && low < lowPrice) lowPrice = low;
          if(!isNaN(high) && high > highPrice) highPrice = high;
        }
      });

      return found ? { hasProduct: true, lowPrice, highPrice, offerCount: 1 } : { hasProduct: false };
    }

    const productData = detectProductPackage();
    console.log("[Schema Service] Product detected:", productData);

    // ===== GENERATE JSON-LD =====
    function generateSchema(page, product) {
      const graph = [];

      // WebPage
      graph.push({
        "@type": "WebPage",
        "@id": page.url + "#webpage",
        url: page.url,
        name: page.title,
        description: page.description,
        ...(page.parentUrl && { isPartOf: { "@id": page.parentUrl } }),
        mainEntity: { "@id": page.url + "#service" },
        publisher: { "@id": page.business.url + "#localbusiness" },
        ...(page.internalLinks.length && { hasPart: { "@id": page.url + "#daftar-internal-link" } })
      });

      // LocalBusiness
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

      // Service
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

      // Jika ada harga → buat offers
      if(product.hasProduct) {
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        serviceObj.offers = {
          "@type": "AggregateOffer",
          priceCurrency: "IDR",
          lowPrice: product.lowPrice,
          highPrice: product.highPrice,
          offerCount: product.offerCount,
          availability: "https://schema.org/InStock",
          priceValidUntil: nextYear.toISOString().split('T')[0],
          url: page.url
        };

        // Buat Product schema otomatis
        const productSchema = {
          "@type": "Product",
          "@id": page.url + "#product",
          name: "Harga " + page.service.name,
          description: page.service.description,
          category: "Jasa Konstruksi",
          brand: { "@type": "Brand", name: page.business.name },
          offers: serviceObj.offers
        };
        graph.push(productSchema);
      }

      graph.push(serviceObj);

      // ItemList internal links
      if(page.internalLinks.length) {
        graph.push({
          "@type": "ItemList",
          "@id": page.url + "#daftar-internal-link",
          name: "Daftar Halaman Terkait",
          itemListOrder: "http://schema.org/ItemListOrderAscending",
          numberOfItems: page.internalLinks.length,
          itemListElement: page.internalLinks.map((link,i)=>({
            "@type":"ListItem",
            position: i+1,
            url: link.url,
            name: link.name
          }))
        });
      }

      return { "@context": "https://schema.org", "@graph": graph };
    }

    // ===== INJEKSI KE <script id="auto-schema-service"> =====
    let schemaScript = document.querySelector('#auto-schema-service');
    if(!schemaScript){
      schemaScript = document.createElement("script");
      schemaScript.id = "auto-schema-service";
      schemaScript.type = "application/ld+json";
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(generateSchema(PAGE, productData), null, 2);
    console.log("[Schema Service] JSON-LD berhasil di-inject");
  }, 500);
});
