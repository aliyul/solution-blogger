//UPDATE 10
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

  // ====== EKSTRAKSI SERVICE TYPE INTI ======
  (function extractServiceTypes() {
    const h1Text = PAGE.service.name.toLowerCase();
    const contentEls = document.querySelectorAll('article p, article li, main p, main li, .post-body p, .post-body li');

    const typesSet = new Set();

    contentEls.forEach(el => {
      let text = el.innerText.trim();
      if (!text) return;

      // Pecah kalimat menjadi frasa pendek berdasar koma, "dan", "/" atau "-".
      const fragments = text.split(/,| dan |\/| - /i).map(f => f.trim());

      fragments.forEach(frag => {
        if (!frag) return;

        const fragLower = frag.toLowerCase();

        // Hanya ambil frasa yang mengandung kata kunci H1/topik
        if (h1Text.split(' ').some(w => fragLower.includes(w)) && frag.length <= 100) {
          typesSet.add(frag.replace(/\s+/g, ' ').replace(/[:;,.]$/,'').trim());
        }
      });
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
    console.log("🚀 Schema JSON-LD serviceType sudah dirender bersih di #auto-schema-service");
  } else {
    console.warn("⚠️ Script tag dengan id 'auto-schema-service' tidak ditemukan.");
  }

});
