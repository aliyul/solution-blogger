//UPDATE 1
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
      return "Layanan profesional dalam bidang konstruksi dan renovasi.";
    })(),
    service: {
      name: document.querySelector('h1')?.textContent?.trim() || 'Jasa Konstruksi Profesional',
      description: document.querySelector('meta[name="description"]')?.content 
                    || 'Layanan profesional dalam bidang konstruksi.',
      types: [],
      areaServed: []
    },
    business: {
      "name": "Beton Jaya Readymix",
      "url": "https://www.betonjayareadymix.com",
      "telephone": "+6283839000968",
      "openingHours": "Mo-Sa 08:00-17:00",
      "description": "Beton Jaya Readymix adalah penyedia solusi konstruksi terlengkap di Indonesia.",
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

  // ===== EXTRACT SERVICE TYPES (AGRESIF, TAPI TEPAT) =====
  (function extractServiceTypes() {
    const h1Text = PAGE.service.name.toLowerCase();
    const typesSet = new Set();

    // Daftar tag relevan
    const elements = Array.from(document.querySelectorAll('h2, h3, li, a, p'));

    elements.forEach(el => {
      let text = el.innerText.trim();

      if (!text) return;

      // Normalisasi spasi & hapus karakter aneh
      text = text.replace(/\s+/g, ' ').replace(/\u00a0/g, ' ').trim();

      // Filter: hanya ambil yang mengandung kata kunci dari H1
      const lowerText = text.toLowerCase();
      const h1Keywords = h1Text.split(/\s+/).filter(k => k.length > 3); // kata panjang >3 huruf
      const hasKeyword = h1Keywords.some(kw => lowerText.includes(kw));

      // Skip kalimat terlalu panjang >50 kata (biasanya narasi/promosi)
      const wordCount = text.split(/\s+/).length;

      // Skip kata-kata generik promosi
      const genericWords = ["kami", "solusi", "hubungi", "whatsapp", "FAQ", "pendaftaran", "penawaran", "layanan lengkap"];
      const isGeneric = genericWords.some(gw => lowerText.includes(gw));

      if (hasKeyword && !isGeneric && wordCount <= 50) {
        typesSet.add(text);
      }
    });

    PAGE.service.types = Array.from(typesSet);
  })();

  // ===== GENERATE JSON-LD =====
  function generateSchema(page) {
    const graph = [];

    graph.push({
      "@type": "WebPage",
      "@id": page.url + "#webpage",
      url: page.url,
      name: page.title,
      description: page.description,
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
      serviceType: page.service.types || [],
      areaServed: (page.service.areaServed || []).map(a => ({ "@type": "Place", name: a })),
      provider: { "@id": page.business.url + "#localbusiness" },
      mainEntityOfPage: { "@id": page.url + "#webpage" }
    };

    graph.push(serviceObj);

    return { "@context": "https://schema.org", "@graph": graph };
  }

  const targetScript = document.getElementById('auto-schema-service');
  if(targetScript){
    targetScript.textContent = JSON.stringify(generateSchema(PAGE), null, 2);
    console.log("🚀 Schema JSON-LD serviceType sudah di-render di #auto-schema-service");
  } else {
    console.warn("⚠️ Script tag dengan id 'auto-schema-service' tidak ditemukan di halaman.");
  }

});
