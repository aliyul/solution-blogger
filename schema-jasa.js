//UPDATE 7
document.addEventListener("DOMContentLoaded", function() {

  // ======= KONFIGURASI HALAMAN =======
  const PAGE = {
    url: location.href,
    title: document.querySelector('h1')?.textContent?.trim() || document.title.trim(),
    description: (() => {
      const meta = document.querySelector('meta[name="description"]')?.content?.trim();
      if (meta && meta.length > 30) return meta;
      const p = document.querySelector('article p, main p, .post-body p');
      return p ? p.innerText.trim().substring(0, 300) : '';
    })(),
    parentUrl: (() => {
      const canonical = document.querySelector('link[rel="canonical"]')?.href;
      return (canonical && canonical !== location.href) ? canonical : location.origin;
    })(),
    service: {
      name: document.querySelector('h1')?.textContent?.trim() || 'Jasa Konstruksi Profesional',
      description: document.querySelector('meta[name="description"]')?.content 
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

  // ===== EXTRACT SERVICE TYPE BERDASARKAN KONTEN =====
  (function extractServiceTypes() {
    const h1Text = PAGE.service.name.toLowerCase();
    const typesSet = new Set();

    // Ambil semua elemen teks utama
    const elements = Array.from(document.querySelectorAll('h2, h3, li, p, span, strong'));
    elements.forEach(el => {
      let text = el.innerText.trim();
      if (!text) return;

      // Ubah menjadi lowercase untuk pengecekan konteks
      const lower = text.toLowerCase();

      // Hanya ambil jika relevan dengan topik H1
      if (h1Text.includes('renovasi stadion')) {
        // filter kata kunci layanan spesifik untuk stadion
        if (/tribun|lapangan|kamar ganti|pagar|atap|kanopi|lintasan atletik|track area|pencahayaan|struktur beton|baja|fasilitas penonton|joint sealant|epoxy|waterproofing/i.test(lower)) {
          typesSet.add(text);
        }
      }

      // Bisa ditambahkan else-if untuk topik H1 lain jika perlu
    });

    // Hapus duplikat dan urutkan
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
    console.log("🚀 Schema JSON-LD serviceType sudah diperbarui dan terfilter dengan ketat");
  } else {
    console.warn("⚠️ Script tag dengan id 'auto-schema-service' tidak ditemukan di halaman.");
  }

});
