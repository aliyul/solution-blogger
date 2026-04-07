// ⚡ AutoSchema Hybrid v4.55 — Product + Offers + isPartOf + Auto AreaServed | Beton Jaya Readymix
// FIX: Offer parser prioritaskan tabel, batasi jumlah offer, sanitize text, skip harga 0/estimasi

document.addEventListener("DOMContentLoaded", async function () {
  setTimeout(async () => {
    console.log("[AutoSchema Hybrid v4.55 🚀] Start detection");

    const fallbackImage = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";

    // ======================================================
    // === 1️⃣ META DASAR ===
    // ======================================================
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const cleanUrl = (ogUrl || canonical || location.href).replace(/[?&]m=1/, "");

    const titleRaw = document.querySelector("h1")?.innerText?.trim() || document.title.trim();
    const title = titleRaw.replace(/\s{2,}/g, " ").trim().substring(0, 120);

    // Prioritaskan meta description, baru fallback ke paragraf pertama
    let desc = document.querySelector('meta[name="description"]')?.content?.trim();
    if (!desc) {
      const firstParagraph = document.querySelector("article p, main p, section p");
      desc = firstParagraph?.innerText?.trim()?.substring(0, 300) || "Produk konstruksi berkualitas dari Beton Jaya Readymix";
    }

    // ======================================================
    // === 2️⃣ SMART MULTI isPartOf (deteksi parent dari breadcrumbs) ===
    // ======================================================
    function detectParentUrls() {
      const urls = new Set();
      // Selector breadcrumbs yang umum
      const breadcrumbSelectors = [
        ".breadcrumbs a",
        ".breadcrumb a",
        ".nav-trail a",
        ".breadcrumb-nav a",
        ".site-breadcrumb a",
        "[class*='breadcrumb'] a"
      ];
      
      breadcrumbSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(a => {
          if (a.href && a.href !== location.href && a.href !== cleanUrl) {
            urls.add(a.href);
          }
        });
      });
      
      const metaParent = document.querySelector('meta[name="parent-url"]')?.content;
      if (metaParent) urls.add(metaParent);
      
      if (urls.size === 0) urls.add(location.origin);
      
      return Array.from(urls).map(u => ({ "@type": "WebPage", "@id": u }));
    }
    const parentUrls = detectParentUrls();

    // ======================================================
    // === 3️⃣ IMAGE DETECTION ===
    // ======================================================
    let contentImage = document.querySelector("article img, main img, .post-body img, .product-image img")?.src || fallbackImage;
    
    // ======================================================
    // === 4️⃣ AREA SERVED (Jabodetabek + Karawang) ===
    // ======================================================
    const areaProv = {
      "Kabupaten Bogor": "Jawa Barat",
      "Kota Bogor": "Jawa Barat",
      "Kota Depok": "Jawa Barat",
      "Kabupaten Bekasi": "Jawa Barat",
      "Kota Bekasi": "Jawa Barat",
      "Kabupaten Karawang": "Jawa Barat",
      "DKI Jakarta": "DKI Jakarta"
    };
    const defaultAreaServed = Object.keys(areaProv).map(a => ({ "@type": "Place", name: a }));
    const productAreaServed = defaultAreaServed;

    // ======================================================
    // === 5️⃣ BRAND ===
    // ======================================================
    const brandName = "Beton Jaya Readymix";

    // ======================================================
    // === 6️⃣ PRODUCT NAME (dari URL atau mapping manual) ===
    // ======================================================
    const pathKey = location.pathname.split("/").pop().replace(".html", "").replace(/-/g, " ");
    
    // Mapping manual untuk URL yang tidak standar
    const urlMapping = {
      "produk pembatas": "Produk Pembatas",
      "kanstin beton": "Kanstin Beton",
      "pagar beton": "Pagar Beton",
      "pagar panel beton": "Pagar Panel Beton",
      "pagar brc": "Pagar BRC",
      "pagar besi": "Pagar Besi",
      "pagar grc": "Pagar GRC",
      "pagar batu alam": "Pagar Batu Alam",
      "pagar rumah": "Pagar Rumah",
      "produk konstruksi": "Produk Konstruksi",
      "beton precast": "Beton Precast",
      "produk alat konstruksi": "Produk Alat Konstruksi",
      "produk saluran drainase": "Produk Saluran Drainase",
      "produk jalan lantai": "Produk Jalan Lantai",
      "produk pondasi struktur": "Produk Pondasi Struktur",
      "produk jembatan flyover": "Produk Jembatan Flyover",
      "produk dinding bangunan modular": "Produk Dinding Bangunan Modular",
      "produk pelabuhan pesisir": "Produk Pelabuhan Pesisir"
    };
    
    let productName = urlMapping[pathKey.toLowerCase()];
    if (!productName) {
      productName = pathKey.replace(/\b\w/g, l => l.toUpperCase());
    }

    // ======================================================
    // === 7️⃣ KATEGORI & WIKIPEDIA LINK ===
    // ======================================================
    let productCategory = "BuildingMaterial";
    let wikipediaLink = "https://id.wikipedia.org/wiki/Beton";

    // ======================================================
    // === 📅 VALID UNTIL (30 hari ke depan) ===
    // ======================================================
    const fallbackValidUntil = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString().split("T")[0];
    
    const validUntil = window.AEDMetaDates?.nextUpdate || fallbackValidUntil;

    // ======================================================
    // === 🧩 UTILITY: SANITIZE TEXT ===
    // ======================================================
    function sanitizeText(text) {
      if (!text) return "";
      return text.replace(/[\t\n\r]+/g, ' ')
                 .replace(/\s{2,}/g, ' ')
                 .trim()
                 .substring(0, 100);
    }

    // ======================================================
    // === 🧩 OFFER STORAGE ===
    // ======================================================
    const seenItems = new Set();
    const tableOffers = [];

    // ======================================================
    // === 🧩 ADD OFFER (dengan validasi ketat) ===
    // ======================================================
    function addOffer(name, price, desc = "") {
      const numericPrice = Number(price);
      
      // Validasi harga
      if (isNaN(numericPrice)) return;
      if (numericPrice <= 0) return; // skip harga 0 atau negatif
      if (numericPrice < 10000) return; // skip harga terlalu kecil (mungkin error parsing)
      
      // BATASI MAKSIMAL OFFER (5-8 cukup untuk rich snippet)
      if (tableOffers.length >= 8) return;
      
      // Sanitize nama produk
      let cleanName = name;
      if (name && name.length > 0 && name.length < 200) {
        cleanName = sanitizeText(name);
      } else {
        cleanName = productName;
      }
      
      // Cegah nama yang mengandung kata tidak perlu
      const skipKeywords = ["estimasi", "per meter", "hubungi", "call", "whatsapp", "konsultasi"];
      if (skipKeywords.some(kw => cleanName.toLowerCase().includes(kw))) return;
      
      const key = cleanName + "|" + numericPrice;
      if (seenItems.has(key)) return;
      seenItems.add(key);
      
      tableOffers.push({
        "@type": "Offer",
        name: cleanName,
        url: cleanUrl,
        priceCurrency: "IDR",
        price: numericPrice,
        priceValidUntil: validUntil,
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@id": "https://www.betonjayareadymix.com/#localbusiness" }
      });
      
      console.log(`[Offer added] ${cleanName}: Rp ${numericPrice.toLocaleString()}`);
    }

    // ======================================================
    // === 🧩 PARSE OFFER DARI TABEL PRODUK (PRIORITAS UTAMA) ===
    // ======================================================
    function parseTableOffers() {
      const tableSelectors = [
        'section table',
        '.product-table',
        '.price-table',
        '.harga-table',
        'table'
      ];
      
      let found = false;
      
      for (const selector of tableSelectors) {
        const tables = document.querySelectorAll(selector);
        if (tables.length === 0) continue;
        
        for (const table of tables) {
          const rows = table.querySelectorAll('tr');
          for (const row of rows) {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 2) {
              const productCell = cells[0].innerText.trim();
              const priceCell = cells[1].innerText;
              
              // Cek apakah ini baris header
              if (productCell.toLowerCase().includes('produk') || 
                  productCell.toLowerCase().includes('jenis') ||
                  priceCell.toLowerCase().includes('harga')) {
                continue;
              }
              
              const priceMatch = priceCell.match(/Rp\s*([\d.,]+)/);
              
              if (priceMatch && productCell && productCell.length > 0 && productCell.length < 150) {
                const price = parseInt(priceMatch[1].replace(/[^\d]/g, ''));
                
                // Validasi tambahan
                const isEstimasi = productCell.toLowerCase().includes('estimasi') || 
                                   priceCell.toLowerCase().includes('estimasi');
                
                if (price > 0 && !isEstimasi && price > 10000) {
                  addOffer(productCell, price);
                  found = true;
                }
              }
            }
          }
        }
        
        if (found) break; // cukup satu tabel yang berhasil
      }
      
      return found;
    }

    // ======================================================
    // === 🧩 FALLBACK: PARSE DARI LIST & PARAGRAPH ===
    // ======================================================
    function parseListOffers() {
      const elements = document.querySelectorAll("li, p, .price-item, .product-item");
      const tempOffers = [];
      
      for (const el of elements) {
        const text = el.innerText;
        const priceMatch = text.match(/Rp\s*([\d.,]+)/);
        
        if (priceMatch) {
          const price = parseInt(priceMatch[1].replace(/[^\d]/g, ''));
          if (price > 0 && price > 10000 && price < 100000000) { // range harga wajar
            let productText = text.replace(priceMatch[0], '').trim();
            // Batasi panjang nama produk
            if (productText.length > 0 && productText.length < 150) {
              tempOffers.push({ name: productText, price: price });
            }
          }
        }
      }
      
      // Ambil max 5 unique offers dari fallback
      const seen = new Set();
      for (const offer of tempOffers) {
        const key = offer.name + "|" + offer.price;
        if (!seen.has(key) && tableOffers.length < 5) {
          seen.add(key);
          addOffer(offer.name, offer.price);
        }
      }
    }

    // ======================================================
    // === 🧩 EKSEKUSI OFFER PARSING ===
    // ======================================================
    console.log("[AutoSchema v4.55] Parsing offers from tables...");
    const hasTableOffers = parseTableOffers();
    
    if (!hasTableOffers || tableOffers.length === 0) {
      console.log("[AutoSchema v4.55] No table offers found, using fallback...");
      parseListOffers();
    }
    
    // ======================================================
    // === 🧩 FALLBACK TERAKHIR (jika tetap kosong) ===
    // ======================================================
    if (tableOffers.length === 0) {
      console.log("[AutoSchema v4.55] Using final fallback offer");
      tableOffers.push({
        "@type": "Offer",
        name: productName + " (Hubungi Kami)",
        url: cleanUrl,
        priceCurrency: "IDR",
        price: 0,
        priceValidUntil: validUntil,
        availability: "https://schema.org/PreOrder",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@id": "https://www.betonjayareadymix.com/#localbusiness" },
        description: "Hubungi Beton Jaya Readymix untuk informasi harga terbaru."
      });
    }

    // ======================================================
    // === 🏢 BUSINESS ENTITY ===
    // ======================================================
    const business = {
      "@type": "LocalBusiness",
      "@id": "https://www.betonjayareadymix.com/#localbusiness",
      name: "Beton Jaya Readymix",
      url: "https://www.betonjayareadymix.com",
      logo: fallbackImage
    };

    // ======================================================
    // === 🛍️ PRODUCT ENTITY ===
    // ======================================================
    const product = {
      "@type": "Product",
      "@id": cleanUrl + "#product",
      name: productName,
      image: [contentImage],
      description: desc,
      brand: { "@type": "Brand", name: brandName },
      category: productCategory,
      sameAs: wikipediaLink,
      offers: tableOffers,
      areaServed: productAreaServed,
      isPartOf: parentUrls
    };

    // ======================================================
    // === 🌐 WEBPAGE ENTITY ===
    // ======================================================
    const webpage = {
      "@type": "WebPage",
      "@id": cleanUrl + "#webpage",
      url: cleanUrl,
      name: title,
      description: desc,
      mainEntity: { "@id": product["@id"] },
      isPartOf: parentUrls
    };

    // ======================================================
    // === 📦 BUILD GRAPH + OUTPUT JSON-LD ===
    // ======================================================
    const graph = [webpage, business, product];
    
    // Cari schema existing
    let existingScript = document.querySelector("#auto-schema-product");
    
    if (!existingScript) {
      // Buat baru jika belum ada
      existingScript = document.createElement("script");
      existingScript.type = "application/ld+json";
      existingScript.id = "auto-schema-product";
      document.head.appendChild(existingScript);
    }
    
    // Overwrite schema (AMAN & SEO FRIENDLY)
    existingScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": graph
    }, null, 2);
    
    console.log(`[AutoSchema v4.55 ✅] Product schema updated | Offers: ${tableOffers.length} | Product: ${productName}`);
    
    // Optional: Tampilkan warning jika offers masih 0
    if (tableOffers.length === 1 && tableOffers[0].price === 0) {
      console.warn("[AutoSchema v4.55 ⚠️] Using fallback offer (no valid price detected)");
    }

  }, 500); // delay 500ms untuk memastikan konten termuat
});
