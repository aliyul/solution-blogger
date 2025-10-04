//UPDATE 12
document.addEventListener("DOMContentLoaded", function() {

  // ====== KONFIGURASI HALAMAN ======
  const PAGE = {
    url: location.href,
    title: document.querySelector('h1')?.textContent?.trim() || document.title.trim(),
    service: {
      name: document.querySelector('h1')?.textContent?.trim() || 'Jasa Profesional',
      types: []
    }
  };

  // ====== EKSTRAKSI SERVICE TYPE OTOMATIS ======
  (function extractServiceTypes() {
    const h1Text = PAGE.service.name.toLowerCase();

    // Ambil semua elemen konten artikel utama
    const contentEls = document.querySelectorAll('article p, article li, main p, main li, .post-body p, .post-body li');

    const typesSet = new Set();

    contentEls.forEach(el => {
      let text = el.innerText.trim();
      if (!text) return;

      // Filter: pendek < 120 karakter & mengandung kata kerja layanan (misal Renovasi, Perbaikan, Pemasangan, Epoxy, dll)
      if (text.length <= 120) {
        // Gunakan regex sederhana untuk deteksi pola layanan: KataKerja + Objek
        // Contoh: "Renovasi Tribun Penonton", "Perbaikan Atap Stadion"
        const servicePattern = /^(Renovasi|Perbaikan|Pemasangan|Epoxy|Peremajaan|Instalasi|Perkuatan)\s+[A-Z][a-zA-Z0-9\s]+/;
        const match = text.match(servicePattern);
        if (match) {
          typesSet.add(match[0].replace(/\s+/g,' ').trim());
        }
      }
    });

    PAGE.service.types = Array.from(typesSet);
  })();

  // ====== GENERATE JSON-LD ======
  function generateSchema(page) {
    const graph = [];

    graph.push({
      "@type": "Service",
      "@id": page.url + "#service",
      name: page.service.name,
      serviceType: page.service.types,
      provider: {
        "@type": "LocalBusiness",
        name: "Beton Jaya Readymix",
        url: "https://www.betonjayareadymix.com"
      },
      mainEntityOfPage: { "@id": page.url + "#webpage" }
    });

    return { "@context": "https://schema.org", "@graph": graph };
  }

  // Render JSON-LD ke <script id="auto-schema-service">
  const targetScript = document.getElementById('auto-schema-service');
  if(targetScript){
    targetScript.textContent = JSON.stringify(generateSchema(PAGE), null, 2);
    console.log("🚀 Schema JSON-LD serviceType bersih sudah dirender di #auto-schema-service");
  } else {
    console.warn("⚠️ Script tag dengan id 'auto-schema-service' tidak ditemukan di halaman.");
  }

});
