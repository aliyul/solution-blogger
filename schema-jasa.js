//UPDATE 6
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
      const altText = Array.from(document.querySelectorAll('p, li'))
        .map(el => el.innerText.trim()).filter(Boolean).join(' ');
      return altText.substring(0, 300);
    })(),
    parentUrl: (() => {
      const canonical = document.querySelector('link[rel="canonical"]')?.href;
      if (canonical && canonical !== location.href) return canonical;
      return location.origin;
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
    },
    product: (() => {
      const el = document.querySelector('.harga, .price, .harga-produk');
      if (el) {
        const price = parseInt(el.innerText.replace(/[^\d]/g, ''), 10);
        if (!isNaN(price) && price > 0) {
          return { hasProduct: true, lowPrice: price, highPrice: price, offerCount: 1 };
        }
      }
      return { hasProduct: false };
    })(),
    internalLinks: Array.from(document.querySelectorAll('article a, main a, .post-body a'))
      .filter(a => a.href && a.href.includes(location.hostname) && a.href !== location.href)
      .map(a => ({ url: a.href, name: a.innerText.trim() }))
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

  // ===== EXTRACT SERVICE TYPE BERDASARKAN H1/TOPIK =====
  (function extractServiceTypes() {
    const h1 = document.querySelector('h1');
    if (!h1) return;

    const typesSet = new Set();

    // Ambil semua teks artikel (p, li, span) setelah H1
    const contentEls = Array.from(document.querySelectorAll('article p, article li, article span, main p, main li, main span, .post-body p, .post-body li, .post-body span'));
    contentEls.forEach(el => {
      let text = el.innerText.trim();
      if (!text) return;

      // Split paragraf panjang jadi kalimat
      const sentences = text.split(/[\.\n]/).map(s => s.trim()).filter(Boolean);
      sentences.forEach(s => {
        // Hanya ambil kalimat yang mengandung kata kunci relevan dari H1
        // Contoh kata kunci: Renovasi, Perbaikan, Pemasangan, Peremajaan, Penggantian
        if (new RegExp(h1.textContent.split(' ').slice(0,2).join('|'), 'i').test(s) || /Renovasi|Perbaikan|Pemasangan|Peremajaan|Penggantian|Inspeksi|Epoxy|Waterproofing/i.test(s)) {
          // Bersihkan kalimat dari kata2 marketing atau simbol aneh
          let clean = s.replace(/\s{2,}/g, ' ').replace(/&nbsp;|›/g, '').trim();
          if (clean.length > 5) typesSet.add(clean);
        }
      });
    });

    // Hanya ambil unique dan sorted
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
      publisher: { "@id": page.business.url + "#localbusiness" },
      ...(page.internalLinks.length && { hasPart: { "@id": page.url + "#daftar-internal-link" } })
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

    if (page.product.hasProduct) {
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      serviceObj.offers = {
        "@type": "AggregateOffer",
        priceCurrency: "IDR",
        lowPrice: page.product.lowPrice,
        highPrice: page.product.highPrice,
        offerCount: page.product.offerCount,
        availability: "https://schema.org/InStock",
        priceValidUntil: nextYear.toISOString().split('T')[0],
        url: page.url
      };
    }

    graph.push(serviceObj);

    if (page.internalLinks.length) {
      graph.push({
        "@type": "ItemList",
        "@id": page.url + "#daftar-internal-link",
        name: "Daftar Halaman Terkait",
        itemListOrder: "http://schema.org/ItemListOrderAscending",
        numberOfItems: page.internalLinks.length,
        itemListElement: page.internalLinks.map((link, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: link.url,
          name: link.name
        }))
      });
    }

    return { "@context": "https://schema.org", "@graph": graph };
  }

  const targetScript = document.getElementById('auto-schema-service');
  if(targetScript){
    targetScript.textContent = JSON.stringify(generateSchema(PAGE), null, 2);
    console.log("🚀 Schema JSON-LD sudah dirender di #auto-schema-service");
  } else {
    console.warn("⚠️ Script tag dengan id 'auto-schema-service' tidak ditemukan di halaman.");
  }

});
