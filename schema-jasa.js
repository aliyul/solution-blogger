//UPDATE 8
document.addEventListener("DOMContentLoaded", function() {

  // ====== KONFIGURASI HALAMAN ======
  const PAGE = {
    url: location.href,
    title: document.querySelector('h1')?.textContent?.trim() || document.title.trim(),
    service: {
      name: document.querySelector('h1')?.textContent?.trim() || 'Jasa Konstruksi Profesional',
      types: []
    }
  };

  // ====== EKSTRAKSI SERVICE TYPE BERSIH ======
  (function extractServiceTypes() {
    const h1Text = PAGE.service.name.toLowerCase();

    // Ambil semua elemen konten artikel utama
    const contentEls = document.querySelectorAll('article p, article li, main p, main li, .post-body p, .post-body li');

    const typesSet = new Set();

    contentEls.forEach(el => {
      let text = el.innerText.trim();
      if (!text) return;

      // Hanya ambil baris pendek dan relevan: < 120 karakter dan mengandung kata kunci topik
      if (text.length <= 120 && h1Text.split(' ').some(w => text.toLowerCase().includes(w))) {
        // Hapus karakter ekstra & whitespace ganda
        text = text.replace(/\s+/g, ' ').replace(/[:;,.]$/,'').trim();
        // Tambahkan ke set
        typesSet.add(text);
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
