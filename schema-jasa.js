//UPDATE 3
document.addEventListener("DOMContentLoaded", function() {

  // ====== KONFIGURASI HALAMAN ======
  const PAGE = {
    url: location.href,
    title: document.querySelector('h1')?.textContent?.trim() || document.title.trim(),
    service: {
      name: document.querySelector('h1')?.textContent?.trim() || 'Jasa Konstruksi Profesional',
      types: [],
      areaServed: []
    },
    business: {
      name: "Beton Jaya Readymix",
      url: "https://www.betonjayareadymix.com",
      telephone: "+6283839000968",
      openingHours: "Mo-Sa 08:00-17:00",
      description: "Beton Jaya Readymix adalah penyedia solusi konstruksi terlengkap di Indonesia.",
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

  // ===== DETEKSI AREA SERVED ======
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

  // ===== EXTRACT SERVICE TYPES BERDASARKAN TOPIK H1 ======
  (function extractServiceTypes() {
    const h1Text = PAGE.service.name.toLowerCase();
    const typesSet = new Set();

    // Ambil semua elemen teks utama: h2,h3,li,p
    const contentEls = Array.from(document.querySelectorAll('h2,h3,li,p'));
    contentEls.forEach(el => {
      let text = el.innerText.trim();
      if (!text) return;

      // Abaikan navigasi, breadcrumb, CTA, FAQ, Harga, Galeri, Proyek
      if (/›|»|Konsultasi|WhatsApp|FAQ|Harga|Galeri|Proyek/i.test(text)) return;

      // Pisahkan kalimat jika ada
      const sentences = text.split(/[:.]\s/);
      sentences.forEach(s => {
        const clean = s.trim();
        if (!clean) return;

        // Hitung kata, abaikan terlalu panjang (>30) atau terlalu pendek (<2)
        const wordCount = clean.split(/\s+/).length;
        if (wordCount < 2 || wordCount > 30) return;

        // Relevansi H1: setidaknya 1 kata sama dengan H1
        const relevance = clean.toLowerCase().split(/\s+/).some(word => h1Text.includes(word));
        if (relevance) typesSet.add(clean);
      });
    });

    PAGE.service.types = Array.from(typesSet);
  })();

  // ===== GENERATE JSON-LD ======
  function generateSchema(page) {
    const graph = [];

    // WebPage
    graph.push({
      "@type": "WebPage",
      "@id": page.url + "#webpage",
      url: page.url,
      name: page.title,
      mainEntity: { "@id": page.url + "#service" },
      publisher: { "@id": page.business.url + "#localbusiness" }
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
      sameAs: page.business.sameAs
    });

    // Service
    graph.push({
      "@type": "Service",
      "@id": page.url + "#service",
      name: page.service.name,
      serviceType: page.service.types,
      areaServed: (page.service.areaServed || []).map(a => ({ "@type": "Place", name: a })),
      provider: { "@id": page.business.url + "#localbusiness" },
      mainEntityOfPage: { "@id": page.url + "#webpage" }
    });

    return { "@context": "https://schema.org", "@graph": graph };
  }

  // Render JSON-LD ke <script id="auto-schema-service">
  const targetScript = document.getElementById('auto-schema-service');
  if(targetScript){
    targetScript.textContent = JSON.stringify(generateSchema(PAGE), null, 2);
    console.log("🚀 Schema JSON-LD serviceType bersih dan akurat sudah dirender!");
  } else {
    console.warn("⚠️ Script tag dengan id 'auto-schema-service' tidak ditemukan.");
  }

});
