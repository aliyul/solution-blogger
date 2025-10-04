document.addEventListener("DOMContentLoaded", function() {

  // ====== KONFIGURASI HALAMAN ======
  const PAGE = {
    url: location.href,
    title: document.querySelector('h1')?.textContent?.trim() || document.title.trim(),
    description: (() => {
      const meta = document.querySelector('meta[name="description"]')?.content?.trim();
      if (meta && meta.length > 30) return meta;
      const p = document.querySelector('article p, main p, .post-body p');
      if (p && p.innerText.trim().length > 40) return p.innerText.trim().substring(0, 300);
      return Array.from(document.querySelectorAll('p, li'))
                  .map(el => el.innerText.trim()).filter(Boolean).join(' ').substring(0, 300);
    })(),
    service: {
      name: document.querySelector('h1')?.textContent?.trim() || 'Jasa Konstruksi Profesional',
      description: document.querySelector('meta[name="description"]')?.content 
                    || document.querySelector('p')?.innerText?.trim() 
                    || 'Layanan profesional dalam bidang konstruksi dan beton.',
      types: [],
      areaServed: []
    },
    business: {
      "name": "Beton Jaya Readymix",
      "url": "https://www.betonjayareadymix.com",
      "telephone": "+6283839000968",
      "openingHours": "Mo-Sa 08:00-17:00",
      "description": "Beton Jaya Readymix adalah penyedia solusi konstruksi terlengkap di Indonesia, menawarkan layanan beton cor ready mix, precast, serta jasa konstruksi profesional untuk berbagai proyek infrastruktur, gedung, hingga renovasi rumah tinggal.",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Bogor",
        "addressRegion": "Jawa Barat",
        "addressCountry": "ID"
      },
      "sameAs": [
        "https://www.facebook.com/betonjayareadymix",
        "https://www.instagram.com/betonjayareadymix"
      ]
    }
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

  // ===== EXTRACT SERVICE TYPE =====
  (function extractServiceTypes() {
    const types = [];

    document.querySelectorAll('h2, h3').forEach(header => {
      const text = header.innerText.trim();
      if (/Layanan|Jenis Renovasi/i.test(text)) {
        // Ambil list berikutnya (ul/ol)
        let sibling = header.nextElementSibling;
        while(sibling && sibling.tagName !== 'UL' && sibling.tagName !== 'OL') {
          sibling = sibling.nextElementSibling;
        }
        if(sibling && (sibling.tagName === 'UL' || sibling.tagName === 'OL')) {
          sibling.querySelectorAll('li').forEach(li => {
            let liText = li.innerText.trim();
            if(liText.includes(':')) liText = liText.split(':')[0].trim();
            types.push(liText);
          });
        }
      }
    });

    PAGE.service.types = types.length ? types : [PAGE.service.name];
  })();

  // ===== GENERATE JSON-LD =====
  function generateSchema(page) {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": page.url + "#webpage",
          url: page.url,
          name: page.title,
          description: page.description,
          mainEntity: { "@id": page.url + "#service" },
          publisher: { "@id": page.business.url + "#localbusiness" }
        },
        {
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
        },
        {
          "@type": "Service",
          "@id": page.url + "#service",
          name: page.service.name,
          description: page.service.description,
          serviceType: page.service.types.map(t => t),
          areaServed: (page.service.areaServed || []).map(a => ({ "@type": "Place", name: a })),
          provider: { "@id": page.business.url + "#localbusiness" },
          mainEntityOfPage: { "@id": page.url + "#webpage" }
        }
      ]
    };
  }

  const script = document.getElementById('auto-schema-service');
  if(script){
    script.textContent = JSON.stringify(generateSchema(PAGE), null, 2);
    console.log("🚀 Schema JSON-LD untuk ServiceType sudah dibuat.");
  } else {
    console.warn("⚠️ Script tag #auto-schema-service tidak ditemukan.");
  }

});
