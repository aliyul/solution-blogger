//UPDATE 11
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

  // ====== EKSTRAKSI SERVICE TYPE DARI H1 + H2/H3 ======
  (function extractServiceTypes() {
    const h1Text = PAGE.service.name.toLowerCase();
    const typesSet = new Set();

    // Ambil semua H2/H3 sebagai sub-jasa
    const headingEls = document.querySelectorAll('article h2, article h3, main h2, main h3, .post-body h2, .post-body h3');
    headingEls.forEach(el => {
      const text = el.innerText.trim();
      if (text && h1Text.split(' ').some(w => text.toLowerCase().includes(w))) {
        typesSet.add(text.replace(/\s+/g, ' ').replace(/[:;,.]$/,'').trim());
      }
    });

    // Ambil juga paragraf/li pendek yang mengandung kata kunci H1
    const contentEls = document.querySelectorAll('article p, article li, main p, main li, .post-body p, .post-body li');
    contentEls.forEach(el => {
      let text = el.innerText.trim();
      if (!text) return;

      // Pecah menjadi frasa berdasarkan koma, "dan", "/", atau "-"
      const fragments = text.split(/,| dan |\/| - /i).map(f => f.trim());
      fragments.forEach(frag => {
        if (!frag) return;
        const fragLower = frag.toLowerCase();

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
    console.log("🚀 Schema JSON-LD serviceType bersih + sub-jasa sudah dirender di #auto-schema-service");
  } else {
    console.warn("⚠️ Script tag dengan id 'auto-schema-service' tidak ditemukan.");
  }

});
