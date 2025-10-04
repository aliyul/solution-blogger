//UPDATE 14
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
      // 1️⃣ Cek meta parent-url
      const metaParent = document.querySelector('meta[name="parent-url"]')?.content?.trim();
      if (metaParent) return metaParent;
      
        // 2️⃣ Cek breadcrumbs
        const breadcrumbLinks = Array.from(document.querySelectorAll('nav.breadcrumbs a'))
                                     .map(a => a.href)
                                     .filter(href => href !== location.href);
        if (breadcrumbLinks.length) return breadcrumbLinks[breadcrumbLinks.length - 1];
      
        // 3️⃣ Fallback ke origin
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
      product: (() => {
        // ===== DETEKSI PRODUK & HARGA DARI HEADING =====
        const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));
        let hasProduct = false;
        let price = null;

        headings.forEach(h => {
          if (/harga/i.test(h.innerText)) {
            let nextEl = h.nextElementSibling;
            while(nextEl){
              const text = nextEl.innerText.replace(/\s+/g,'').trim();
              const detected = text.match(/\d+/);
              if(detected){
                price = parseInt(detected[0],10);
                hasProduct = true;
                break;
              }
              nextEl = nextEl.nextElementSibling;
            }
          }
        });

        if(hasProduct && price){
          return { hasProduct:true, lowPrice:price, highPrice:price, offerCount:1 };
        }
        return { hasProduct:false };
      })(),
      internalLinks: Array.from(document.querySelectorAll('article a, main a, .post-body a'))
        .filter(a => a.href && a.href.includes(location.hostname) && a.href !== location.href)
        .map(a => ({ url: a.href, name: a.innerText.trim() }))
    };

    console.log("[Schema Service] Deteksi produk:", PAGE.product);

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

    // ===== GENERATE JSON-LD =====
    function generateSchema(page){
      const graph = [];

      // WebPage
      graph.push({
        "@type":"WebPage",
        "@id":page.url+"#webpage",
        url: page.url,
        name: page.title,
        description: page.description,
        ...(page.parentUrl && { isPartOf:{ "@id": page.parentUrl } }),
        mainEntity: { "@id": page.url+"#service" },
        publisher: { "@id": page.business.url+"#localbusiness" },
        ...(page.internalLinks.length && { hasPart:{ "@id":page.url+"#daftar-internal-link" } })
      });

      // LocalBusiness
      graph.push({
        "@type":["LocalBusiness","GeneralContractor"],
        "@id":page.business.url+"#localbusiness",
        name: page.business.name,
        url: page.business.url,
        telephone: page.business.phone,
        openingHours: "Mo-Sa 08:00-17:00",
        description: page.business.description,
        address: {
          "@type":"PostalAddress",
          addressLocality: page.business.city,
          addressRegion: page.business.region,
          addressCountry: "ID"
        },
        sameAs: page.business.social,
        brand: { "@type":"Brand", name: page.business.name }
      });

      // Service
      const serviceObj = {
        "@type":"Service",
        "@id": page.url+"#service",
        name: page.service.name,
        description: page.service.description,
        serviceType: page.service.types,
        areaServed: (page.service.areaServed||[]).map(a=>({ "@type":"Place", name:a })),
        provider:{ "@id": page.business.url+"#localbusiness" },
        mainEntityOfPage:{ "@id": page.url+"#webpage" }
      };

      if(page.product.hasProduct){
        const nextYear = new Date(); nextYear.setFullYear(nextYear.getFullYear()+1);
        serviceObj.offers={
          "@type":"AggregateOffer",
          priceCurrency:"IDR",
          lowPrice:page.product.lowPrice,
          highPrice:page.product.highPrice,
          offerCount:page.product.offerCount,
          availability:"https://schema.org/InStock",
          priceValidUntil:nextYear.toISOString().split('T')[0],
          url:page.url
        };
      }

      graph.push(serviceObj);

      // ItemList
      if(page.internalLinks.length){
        graph.push({
          "@type":"ItemList",
          "@id": page.url+"#daftar-internal-link",
          name:"Daftar Halaman Terkait",
          itemListOrder:"http://schema.org/ItemListOrderAscending",
          numberOfItems: page.internalLinks.length,
          itemListElement: page.internalLinks.map((link,i)=>({
            "@type":"ListItem",
            position: i+1,
            url: link.url,
            name: link.name
          }))
        });
      }

      return {"@context":"https://schema.org","@graph":graph};
    }

    // ===== INJEKSI KE <script id="auto-schema-service"> =====
    let schemaScript = document.querySelector('#auto-schema-service');
    if(!schemaScript){
      schemaScript = document.createElement("script");
      schemaScript.id = "auto-schema-service";
      schemaScript.type = "application/ld+json";
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(generateSchema(PAGE), null, 2);
    console.log("[Schema Service] JSON-LD berhasil di-inject.");
  }, 500);
});
