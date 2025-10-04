//UPDATE 2
document.addEventListener("DOMContentLoaded", function() {

  // ====== KONFIGURASI HALAMAN ======
  const PAGE = {
    url: location.href,
    title: document.querySelector('h1')?.textContent?.trim() || document.title.trim(),
    description: document.querySelector('meta[name="description"]')?.content?.trim() || 'Layanan profesional dalam bidang konstruksi.',
    service: {
      name: document.querySelector('h1')?.textContent?.trim() || 'Jasa Konstruksi Profesional',
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
      "DKI Jakarta","Kabupaten Bekasi","Kota Bekasi",
      "Kabupaten Bogor","Kota Bogor","Kabupaten Tangerang",
      "Kota Tangerang","Tangerang Selatan","Kota Depok",
      "Kabupaten Karawang","Kabupaten Serang","Kota Serang","Kota Cilegon"
    ];
    const url = PAGE.url.toLowerCase();
    const match = defaultAreas.find(area =>
      url.includes(area.toLowerCase().replace(/\s+/g, '-')) ||
      url.includes(area.toLowerCase().replace(/\s+/g, ''))
    );
    PAGE.service.areaServed = match ? [match] : defaultAreas;
  })();

  // ===== DETEKSI SERVICE TYPE =====
  (function extractServiceTypes() {
    const h1Text = PAGE.service.name.toLowerCase();
    const typesSet = new Set();
    const elements = Array.from(document.querySelectorAll('h2,h3,li,a,p'));

    // pola kata kerja umum untuk layanan
    const serviceKeywords = ["renovasi","perbaikan","pemasangan","pengaspalan","peningkatan","perkuatan","pelapisan","pembuatan","perawatan"];

    elements.forEach(el => {
      let text = el.innerText.trim();
      if(!text) return;

      // normalisasi
      text = text.replace(/\s+/g,' ').replace(/\u00a0/g,' ').trim();

      // skip kalimat panjang >15 kata (biasanya narasi)
      if(text.split(/\s+/).length > 15) return;

      const lowerText = text.toLowerCase();

      // ambil hanya kalimat yang mengandung kata kerja layanan & ada konteks H1
      const hasKeyword = serviceKeywords.some(kw => lowerText.includes(kw));
      const hasH1Context = h1Text.split(/\s+/).some(k => k.length>3 && lowerText.includes(k));

      if(hasKeyword && hasH1Context){
        typesSet.add(text);
      }
    });

    PAGE.service.types = Array.from(typesSet);
  })();

  // ===== GENERATE JSON-LD =====
  function generateSchema(page){
    const graph = [];

    graph.push({
      "@type": "WebPage",
      "@id": page.url+"#webpage",
      url: page.url,
      name: page.title,
      description: page.description,
      mainEntity: {"@id": page.url+"#service"},
      publisher: {"@id": page.business.url+"#localbusiness"}
    });

    graph.push({
      "@type":["LocalBusiness","GeneralContractor"],
      "@id": page.business.url+"#localbusiness",
      name: page.business.name,
      url: page.business.url,
      telephone: page.business.telephone,
      openingHours: page.business.openingHours,
      description: page.business.description,
      address: page.business.address,
      sameAs: page.business.sameAs,
      brand: { "@type":"Brand", name: page.business.name }
    });

    graph.push({
      "@type":"Service",
      "@id": page.url+"#service",
      name: page.service.name,
      description: page.description,
      serviceType: page.service.types,
      areaServed: (page.service.areaServed || []).map(a=>({"@type":"Place","name":a})),
      provider: {"@id": page.business.url+"#localbusiness"},
      mainEntityOfPage: {"@id": page.url+"#webpage"}
    });

    return {"@context":"https://schema.org","@graph":graph};
  }

  const targetScript = document.getElementById('auto-schema-service');
  if(targetScript){
    targetScript.textContent = JSON.stringify(generateSchema(PAGE),null,2);
    console.log("🚀 Schema JSON-LD serviceType sudah dirender di #auto-schema-service");
  }else{
    console.warn("⚠️ Script tag dengan id 'auto-schema-service' tidak ditemukan di halaman.");
  }

});
