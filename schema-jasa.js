//UPDATE 9
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

  // ====== EKSTRAKSI SERVICE TYPE BERSIH ======
  (function extractServiceTypes() {
    const h1Text = PAGE.service.name.toLowerCase();
    const keywords = h1Text.split(/\s+/);

    // Ambil semua elemen konten utama
    const contentEls = document.querySelectorAll('article p, article li, main p, main li, .post-body p, .post-body li');

    const typesSet = new Set();

    contentEls.forEach(el => {
      let text = el.innerText.trim();
      if (!text) return;

      // Hanya ambil frasa pendek (<100 karakter)
      if (text.length > 100) return;

      // Hanya ambil jika ada kata kunci H1 (implisit)
      const matchesH1 = keywords.some(k => k && text.toLowerCase().includes(k));
      if (!matchesH1) return;

      // Filter kata-kata promosi atau deskripsi panjang
      if (/^(kami|pengalaman|harga|tenaga|teknologi|estimasi|durasi|garansi)/i.test(text)) return;

      // Hapus karakter akhir seperti :, ;, ., , dan whitespace ganda
      text = text.replace(/\s+/g, ' ').replace(/[:;,.]$/,'').trim();

      typesSet.add(text);
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
