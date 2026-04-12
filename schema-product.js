/**
 * ⚡ AutoSchema Hybrid v4.56b — Product + Offers + isPartOf + Auto AreaServed
 * 
 * UPDATE v4.56b:
 * - Menambahkan parent mapping dari file eksternal (parent-mapping.js)
 * - Menggunakan getParentFromMapping() untuk isPartOf yang akurat
 * - Fallback ke breadcrumb (hanya ambil link TERAKHIR, bukan semua)
 * - Fungsi detectParentUrls() lama di-comment (masih disimpan)
 * 
 * UPDATE v4.55b:
 * - Menambahkan pengecualian untuk halaman edukasi/bridge (PILLAR, SUB-PILLAR Tipe 1 & 2)
 * - Tidak akan membuat Product schema di halaman yang sudah dapat Article/HowTo dari Schema V4.0
 * - Menambahkan deteksi URL pattern dan panjang konten
 * 
 * FITUR UTAMA:
 * - Deteksi otomatis tabel harga produk
 * - Generate Product + Offer schema
 * - Auto AreaServed (Jabodetabek + Karawang)
 * - Smart parent detection dari file mapping eksternal
 * 
 * @version 4.56b
 * @date 2025-01-15
 * @evergreen YES
 */

(function() {
  "use strict";

  // ===================== KONFIGURASI =====================
  const CONFIG = {
    DEBUG: true,
    DELAY_MS: 500,
    MAX_OFFERS: 8,
    MIN_PRICE: 10000,
    MAX_PRICE: 100000000,
    SKIP_WORD_COUNT: 800,  // Skip jika konten > 800 kata (artikel panjang)
    PARENT_MAPPING_URL: 'https://raw.githack.com/aliyul/solution-blogger/main/parent-mapping.js'
  };

  function log(msg, type = "INFO") {
    if (!CONFIG.DEBUG && type === "INFO") return;
    const icons = { INFO: "📘", WARN: "⚠️", ERROR: "❌", SUCCESS: "✅", SKIP: "⏭️" };
    const prefix = icons[type] || "📘";
    console.log(`${prefix} [AutoSchema v4.56b] ${msg}`);
  }

  // ===================== LOAD EXTERNAL JS =====================
  function loadExternalJS(src) {
    return new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const s = document.createElement("script");
      s.src = src;
      s.defer = true;
      s.onload = resolve;
      s.onerror = () => {
        log(`Gagal load: ${src}`, "WARN");
        resolve(); // ❗ jangan reject, biarkan proses tetap jalan
      };
      document.head.appendChild(s);
    });
  }

  // ===================== LOAD PARENT MAPPING =====================
  let parentMappingGlobal = null;

  async function loadParentMapping() {
    try {
      await loadExternalJS(CONFIG.PARENT_MAPPING_URL);
      
      // Tunggu sebentar agar variabel global tersedia
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Cek variabel global yang tersedia
      if (typeof getParentForMoneyPage === 'function') {
        parentMappingGlobal = getParentForMoneyPage;
        log("Parent mapping loaded from getParentForMoneyPage()", "SUCCESS");
        return true;
      } else if (window.PARENT_MAPPING) {
        parentMappingGlobal = (url) => window.PARENT_MAPPING[url] || null;
        log("Parent mapping loaded from window.PARENT_MAPPING", "SUCCESS");
        return true;
      } else {
        log("Parent mapping tidak ditemukan di global scope", "WARN");
        return false;
      }
    } catch (error) {
      log(`Error loading parent mapping: ${error.message}`, "ERROR");
      return false;
    }
  }

  // ===================== GET PARENT URL FROM MAPPING =====================
  function getParentFromMapping(currentUrl) {
    if (!parentMappingGlobal) return null;
    
    try {
      const parent = parentMappingGlobal(currentUrl);
      if (parent && parent.parentUrl) {
        return {
          "@type": "WebPage",
          "@id": parent.parentUrl,
          name: parent.parentName || "Parent Page"
        };
      }
      return null;
    } catch (error) {
      log(`Error getting parent from mapping: ${error.message}`, "WARN");
      return null;
    }
  }

  // ===================== DETECT PARENT URLS (VERSI LAMA - DI-COMMENT) =====================
  /*
  function detectParentUrls(currentUrl) {
    const urls = new Set();
    
    const breadcrumbSelectors = [
      ".breadcrumbs a",
      ".breadcrumb a",
      ".nav-trail a",
      ".breadcrumb-nav a",
      ".site-breadcrumb a",
      "[class*='breadcrumb'] a",
      "[class*='breadcrumbs'] a"
    ];
    
    breadcrumbSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(a => {
        if (a.href && a.href !== currentUrl && a.href !== location.href) {
          urls.add(a.href);
        }
      });
    });
    
    const metaParent = document.querySelector('meta[name="parent-url"]')?.content;
    if (metaParent) urls.add(metaParent);
    
    if (urls.size === 0) urls.add(location.origin);
    
    return Array.from(urls).map(u => ({ "@type": "WebPage", "@id": u }));
  }
  */

  // ===================== DETECT PARENT URLS (VERSI BARU DENGAN FALLBACK) =====================
  function detectParentUrls(currentUrl) {
    // PRIORITAS 1: Gunakan parent mapping dari file eksternal
    const parentFromMapping = getParentFromMapping(currentUrl);
    if (parentFromMapping) {
      log(`Parent detected from mapping: ${parentFromMapping["@id"]}`, "SUCCESS");
      return [parentFromMapping];
    }
    
    // PRIORITAS 2: Fallback ke breadcrumb (jika mapping tidak ditemukan)
    log("Parent mapping not found, falling back to breadcrumb detection", "WARN");
    
    // ✅ PERBAIKAN: Ambil hanya link TERAKHIR dari breadcrumb
    let lastBreadcrumbUrl = null;
    
    const breadcrumbSelectors = [
      ".breadcrumbs a",
      ".breadcrumb a",
      ".nav-trail a",
      ".breadcrumb-nav a",
      ".site-breadcrumb a",
      "[class*='breadcrumb'] a",
      "[class*='breadcrumbs'] a"
    ];
    
    for (const selector of breadcrumbSelectors) {
      const links = document.querySelectorAll(selector);
      if (links.length > 0) {
        // Ambil link terakhir (paling dekat dengan halaman saat ini)
        const lastLink = links[links.length - 1];
        if (lastLink.href && lastLink.href !== currentUrl && lastLink.href !== location.href) {
          lastBreadcrumbUrl = lastLink.href;
          break;
        }
      }
    }
    
    // Cek meta tag parent-url sebagai alternatif
    if (!lastBreadcrumbUrl) {
      const metaParent = document.querySelector('meta[name="parent-url"]')?.content;
      if (metaParent) lastBreadcrumbUrl = metaParent;
    }
    
    // Fallback ke home jika tidak ada
    if (!lastBreadcrumbUrl) {
      lastBreadcrumbUrl = location.origin;
    }
    
    log(`Fallback: using parent URL: ${lastBreadcrumbUrl}`, "INFO");
    return [{ "@type": "WebPage", "@id": lastBreadcrumbUrl }];
  }

  // ===================== CEK APAKAH SKIP PRODUCT SCHEMA =====================
  function shouldSkipProductSchema() {
    const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
    const title = document.title.toLowerCase();
    const url = location.href.toLowerCase();
    
    log("Memeriksa kelayakan halaman untuk Product schema...", "INFO");
    
    // 1. Halaman edukasi (PILLAR)
    const pillarPatterns = [
      "panduan lengkap", "pengertian", "definisi", "apa itu",
      "overview", "komprehensif", "ultimate guide", "complete guide"
    ];
    
    for (let pattern of pillarPatterns) {
      if (h1.includes(pattern) || title.includes(pattern)) {
        log(`Skip: Halaman PILLAR (pattern: "${pattern}")`, "SKIP");
        return true;
      }
    }
    
    // 2. Halaman Bridge (SUB-PILLAR Tipe 1)
    const bridgePatterns = [
      "cara memilih", "panduan memilih", "tips memilih", 
      "langkah memilih", "kriteria memilih", "how to choose",
      "guide to choose", "memilih yang tepat"
    ];
    
    for (let pattern of bridgePatterns) {
      if (h1.includes(pattern) || title.includes(pattern)) {
        log(`Skip: Halaman BRIDGE PAGE (pattern: "${pattern}")`, "SKIP");
        return true;
      }
    }
    
    // 3. Halaman SUB-PILLAR Tipe 2 (edukasi teknis)
    const subPillarPatterns = [
      "jenis", "spesifikasi", "keunggulan", "fungsi",
      "tipe", "varian", "karakteristik", "perbandingan",
      "detail teknis", "standar mutu"
    ];
    
    for (let pattern of subPillarPatterns) {
      if (h1.includes(pattern) || title.includes(pattern)) {
        // Cek apakah ada tabel harga (jika ada, mungkin tetap perlu Product)
        const hasPriceTable = document.querySelector('table td:contains("Rp"), table td:contains("harga")');
        if (!hasPriceTable) {
          log(`Skip: Halaman SUB-PILLAR Tipe 2 tanpa tabel harga (pattern: "${pattern}")`, "SKIP");
          return true;
        } else {
          log(`Halaman SUB-PILLAR Tipe 2 DENGAN tabel harga → tetap proses Product`, "INFO");
          return false;
        }
      }
    }
    
    // 4. Cek URL pattern
    const urlSkipPatterns = [
      "cara-memilih", "panduan-memilih", "tips-memilih",
      "langkah-memilih", "pengertian", "definisi"
    ];
    
    for (let pattern of urlSkipPatterns) {
      if (url.includes(pattern)) {
        log(`Skip: URL mengandung "${pattern}"`, "SKIP");
        return true;
      }
    }
    
    // 5. Cek panjang konten (artikel panjang biasanya bukan produk murni)
    const content = document.querySelector(".post-body.entry-content") ||
                    document.querySelector("[id^='post-body-']") ||
                    document.querySelector(".post-body") ||
                    document.querySelector("article") ||
                    document.querySelector("main");
                    
    if (content) {
      const wordCount = (content.innerText || "").split(/\s+/).filter(Boolean).length;
      if (wordCount > CONFIG.SKIP_WORD_COUNT) {
        log(`Skip: Halaman dengan konten panjang (${wordCount} kata > ${CONFIG.SKIP_WORD_COUNT})`, "SKIP");
        return true;
      }
      log(`Panjang konten: ${wordCount} kata (lolos)`, "INFO");
    }
    
    // 6. Cek keberadaan tabel harga (indikator halaman produk)
    const hasPriceElement = document.querySelector('table td:contains("Rp"), .price, .harga, [class*="price"], [class*="harga"]');
    if (!hasPriceElement) {
      log(`Skip: Tidak ditemukan elemen harga di halaman`, "SKIP");
      return true;
    }
    
    log("Halaman LAYAK untuk Product schema", "SUCCESS");
    return false;
  }

  // ===================== UTILITY FUNCTIONS =====================
  function sanitizeText(text) {
    if (!text) return "";
    return text.replace(/[\t\n\r]+/g, ' ')
               .replace(/\s{2,}/g, ' ')
               .trim()
               .substring(0, 100);
  }

  function extractPrice(text) {
    if (!text) return null;
    const match = text.match(/Rp\s*([\d.,]+)/);
    if (!match) return null;
    const price = parseInt(match[1].replace(/[^\d]/g, ''));
    if (isNaN(price)) return null;
    return price;
  }

  // ===================== AREA SERVED =====================
  function getAreaServed() {
    const areaProv = {
        "DKI Jakarta": "DKI Jakarta",
        "Kabupaten Bogor": "Jawa Barat",
        "Kota Bogor": "Jawa Barat",
        "Kota Depok": "Jawa Barat",
        "Kabupaten Tangerang": "Banten",
        "Kota Tangerang": "Banten",
        "Kota Tangerang Selatan": "Banten",
        "Kota Serang": "Banten",
        "Kabupaten Bekasi": "Jawa Barat",
        "Kota Bekasi": "Jawa Barat",
        "Kabupaten Karawang": "Jawa Barat"
    };
    return Object.keys(areaProv).map(a => ({ "@type": "Place", name: a }));
  }

  // ===================== DETECT PRODUCT NAME =====================
  function detectProductName() {
    // Dari H1
    const h1 = document.querySelector("h1")?.innerText?.trim();
    if (h1 && h1.length < 100) return h1;
    
    // Dari URL
    const pathKey = location.pathname.split("/").pop().replace(".html", "").replace(/-/g, " ");
    
    const urlMapping = {
      // ==================== PRODUK PEMBATAS ====================
      "produk pembatas": "Produk Pembatas",
      "kanstin beton": "Kanstin Beton",
      "kanstin jalan": "Kanstin Jalan",
      "kanstin trotoar": "Kanstin Trotoar",
      "kanstin taman": "Kanstin Taman",
      "pagar beton": "Pagar Beton",
      "pagar panel beton": "Pagar Panel Beton",
      "pagar brc": "Pagar BRC",
      "pagar besi": "Pagar Besi",
      "pagar grc": "Pagar GRC",
      "pagar batu alam": "Pagar Batu Alam",
      "pagar rumah": "Pagar Rumah",
      
      // ==================== PRODUK SALURAN DRAINASE ====================
      "produk saluran drainase": "Produk Drainase",
      "u ditch": "U-Ditch",
      "u ditch beton": "U-Ditch Beton",
      "box culvert": "Box Culvert",
      "buis beton": "Buis Beton",
      "gorong gorong": "Gorong-Gorong",
      "pipa beton": "Pipa Beton",
      
      // ==================== PRODUK JALAN & LANTAI ====================
      "produk jalan lantai": "Produk Jalan & Lantai",
      "paving block": "Paving Block",
      "grass block": "Grass Block",
      "slab beton": "Slab Beton",
      "tactile paving": "Tactile Paving",
      
      // ==================== PRODUK PONDASI STRUKTUR ====================
      "produk pondasi struktur": "Produk Pondasi",
      "tiang pancang": "Tiang Pancang",
      "spun pile": "Spun Pile",
      "bore pile": "Bore Pile",
      "mini pile": "Mini Pile",
      "strauss pile": "Strauss Pile",
      "cakar ayam": "Cakar Ayam",
      
      // ==================== PRODUK DINDING MODULAR ====================
      "produk dinding bangunan modular": "Dinding Modular",
      "panel beton precast": "Panel Beton Precast",
      "beton ringan precast": "Beton Ringan Precast",
      "sandwich panel": "Sandwich Panel",
      "roster beton": "Roster Beton",
      
      // ==================== PRODUK JEMBATAN & FLYOVER ====================
      "produk jembatan flyover": "Produk Jembatan & Flyover",
      
      // ==================== PRODUK PELABUHAN & PESISIR ====================
      "produk pelabuhan pesisir": "Produk Pelabuhan & Pesisir",
      "sheet pile": "Sheet Pile",
      "ponton": "Ponton",
      
      // ==================== PRODUK UMUM ====================
      "produk konstruksi": "Produk Konstruksi",
      "beton precast": "Beton Precast",
      "produk alat konstruksi": "Alat Konstruksi"
    };
    
    let productName = urlMapping[pathKey.toLowerCase()];
    if (!productName && pathKey && pathKey.length > 0 && pathKey.length < 80) {
      productName = pathKey.replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return productName || "Produk Konstruksi";
  }

  // ===================== OFFER PARSING =====================
  const seenItems = new Set();
  const offers = [];

  function addOffer(name, price, desc = "") {
    // Validasi harga
    if (!price || price <= 0) return;
    if (price < CONFIG.MIN_PRICE) return;
    if (price > CONFIG.MAX_PRICE) return;
    if (offers.length >= CONFIG.MAX_OFFERS) return;
    
    let cleanName = sanitizeText(name);
    if (!cleanName || cleanName.length < 3) return;
    
    // Skip kata-kata yang mencurigakan
    const skipKeywords = ["estimasi", "per meter", "hubungi", "call", "whatsapp", "konsultasi", "mulai dari"];
    if (skipKeywords.some(kw => cleanName.toLowerCase().includes(kw))) return;
    
    const key = cleanName + "|" + price;
    if (seenItems.has(key)) return;
    seenItems.add(key);
    
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    
    offers.push({
      "@type": "Offer",
      name: cleanName,
      url: location.href,
      priceCurrency: "IDR",
      price: price,
      priceValidUntil: validUntil,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": "https://www.betonjayareadymix.com/#localbusiness" }
    });
    
    log(`Offer added: ${cleanName} = Rp ${price.toLocaleString()}`, "SUCCESS");
  }

  function parseTableOffers() {
    const tableSelectors = ['section table', '.product-table', '.price-table', '.harga-table', 'table'];
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
            
            // Skip header row
            if (productCell.toLowerCase().includes('produk') || 
                productCell.toLowerCase().includes('jenis') ||
                priceCell.toLowerCase().includes('harga')) {
              continue;
            }
            
            const price = extractPrice(priceCell);
            if (price && productCell && productCell.length > 0 && productCell.length < 150) {
              const isEstimasi = productCell.toLowerCase().includes('estimasi') || 
                                 priceCell.toLowerCase().includes('estimasi');
              if (!isEstimasi) {
                addOffer(productCell, price);
                found = true;
              }
            }
          }
        }
      }
      if (found) break;
    }
    return found;
  }

  function parseListOffers() {
    const elements = document.querySelectorAll("li, p, .price-item, .product-item");
    const tempOffers = [];
    
    for (const el of elements) {
      const text = el.innerText;
      const price = extractPrice(text);
      if (price && price > CONFIG.MIN_PRICE && price < CONFIG.MAX_PRICE) {
        let productText = text.replace(/Rp\s*[\d.,]+/g, '').trim();
        if (productText.length > 0 && productText.length < 150) {
          tempOffers.push({ name: productText, price: price });
        }
      }
    }
    
    const seen = new Set();
    for (const offer of tempOffers) {
      const key = offer.name + "|" + offer.price;
      if (!seen.has(key) && offers.length < 5) {
        seen.add(key);
        addOffer(offer.name, offer.price);
      }
    }
  }

  // ===================== MAIN FUNCTION =====================
  async function init() {
    log("═══════════════════════════════════════════════════", "INFO");
    log("AutoSchema Hybrid v4.56b DIMULAI", "INFO");
    log("═══════════════════════════════════════════════════", "INFO");
    
    // ===== LOAD PARENT MAPPING DARI FILE EKSTERNAL =====
    await loadParentMapping();
    
    // CEK APAKAH HARUS SKIP
    if (shouldSkipProductSchema()) {
      log("Product schema SKIPPED untuk halaman ini", "SKIP");
      log("(Halaman ini akan menggunakan Article/HowTo dari Schema V4.0)", "INFO");
      return;
    }
    
    // ===== EKSTRAKSI DATA DASAR =====
    const currentUrl = location.href.replace(/[?&]m=1/, "");
    const fallbackImage = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";
    
    // Title & Description
    const productName = detectProductName();
    const desc = document.querySelector('meta[name="description"]')?.content?.trim() || 
                 document.querySelector("article p, main p, section p")?.innerText?.trim()?.substring(0, 300) ||
                 `Produk ${productName} berkualitas dari Beton Jaya Readymix`;
    
    // Image
    const contentImage = document.querySelector("article img, main img, .post-body img, .product-image img")?.src || fallbackImage;
    
    // Parent URLs (menggunakan fungsi baru dengan fallback)
    const parentUrls = detectParentUrls(currentUrl);
    
    // Area Served
    const areaServed = getAreaServed();
    
    // Brand
    const brandName = "Beton Jaya Readymix";
    
    // Category & Wikipedia
    let productCategory = "BuildingMaterial";
    let wikipediaLink = "https://id.wikipedia.org/wiki/Beton";
    
    // ===== PARSE OFFERS =====
    log("Parsing offers dari tabel...", "INFO");
    const hasTableOffers = parseTableOffers();
    
    if (!hasTableOffers || offers.length === 0) {
      log("Tidak ada offers dari tabel, menggunakan fallback...", "WARN");
      parseListOffers();
    }
    
    // ===== FALLBACK TERAKHIR =====
    if (offers.length === 0) {
      log("Menggunakan final fallback offer", "WARN");
      const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      offers.push({
        "@type": "Offer",
        name: productName + " (Hubungi Kami)",
        url: currentUrl,
        priceCurrency: "IDR",
        price: 0,
        priceValidUntil: validUntil,
        availability: "https://schema.org/PreOrder",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@id": "https://www.betonjayareadymix.com/#localbusiness" },
        description: "Hubungi Beton Jaya Readymix untuk informasi harga terbaru."
      });
    }
    
    // ===== BUSINESS ENTITY =====
    const business = {
      "@type": "LocalBusiness",
      "@id": "https://www.betonjayareadymix.com/#localbusiness",
      name: "Beton Jaya Readymix",
      url: "https://www.betonjayareadymix.com",
      logo: fallbackImage
    };
    
    // ===== PRODUCT ENTITY =====
    const product = {
      "@type": "Product",
      "@id": currentUrl + "#product",
      name: productName,
      image: [contentImage],
      description: desc,
      brand: { "@type": "Brand", name: brandName },
      category: productCategory,
      sameAs: wikipediaLink,
      offers: offers,
      areaServed: areaServed,
      isPartOf: parentUrls
    };
    
    // ===== WEBPAGE ENTITY =====
    const webpage = {
      "@type": "WebPage",
      "@id": currentUrl + "#webpage",
      url: currentUrl,
      name: productName,
      description: desc,
      mainEntity: { "@id": product["@id"] },
      isPartOf: parentUrls
    };
    
    // ===== BUILD GRAPH =====
    const graph = [webpage, business, product];
    
    // ===== UPDATE ATAU BUAT SCHEMA =====
    let existingScript = document.querySelector("#auto-schema-product");
    
    if (!existingScript) {
      existingScript = document.createElement("script");
      existingScript.type = "application/ld+json";
      existingScript.id = "auto-schema-product";
      document.head.appendChild(existingScript);
      log("Element #auto-schema-product dibuat baru", "SUCCESS");
    }
    
    existingScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": graph
    }, null, 2);
    
    // ===== SUMMARY =====
    log("═══════════════════════════════════════════════════", "INFO");
    log("EXECUTION SUMMARY:", "INFO");
    log(`  Product Name   : ${productName}`, "SUCCESS");
    log(`  Offers Count   : ${offers.length}`, "SUCCESS");
    log(`  Valid Prices   : ${offers.filter(o => o.price > 0).length}`, "SUCCESS");
    log(`  Area Served    : ${areaServed.length} wilayah`, "INFO");
    log(`  Parent Pages   : ${parentUrls.length}`, "INFO");
    if (parentUrls.length > 0 && parentUrls[0]["@id"]) {
      log(`  Parent URL     : ${parentUrls[0]["@id"]}`, "INFO");
    }
    log("═══════════════════════════════════════════════════", "INFO");
    log("AutoSchema Hybrid v4.56b SELESAI", "SUCCESS");
    
    if (offers.length === 1 && offers[0].price === 0) {
      log("⚠️ Menggunakan fallback offer (tidak ada harga valid terdeteksi)", "WARN");
    }
  }
  
  // Jalankan setelah DOM siap dengan delay
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(init, CONFIG.DELAY_MS);
    });
  } else {
    setTimeout(init, CONFIG.DELAY_MS);
  }
  
})();
