/**
 * ⚡ AutoSchema Hybrid v4.55b — Product + Offers + isPartOf + Auto AreaServed
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
 * - Smart parent detection dari breadcrumbs
 * 
 * @version 4.55b
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
    SKIP_WORD_COUNT: 800  // Skip jika konten > 800 kata (artikel panjang)
  };

  function log(msg, type = "INFO") {
    if (!CONFIG.DEBUG && type === "INFO") return;
    const icons = { INFO: "📘", WARN: "⚠️", ERROR: "❌", SUCCESS: "✅", SKIP: "⏭️" };
    const prefix = icons[type] || "📘";
    console.log(`${prefix} [AutoSchema v4.55b] ${msg}`);
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

  // ===================== DETECT PARENT URLS =====================
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

  // ===================== AREA SERVED =====================
  function getAreaServed() {
    const areaProv = {
      "Kabupaten Bogor": "Jawa Barat",
      "Kota Bogor": "Jawa Barat",
      "Kota Depok": "Jawa Barat",
      "Kabupaten Bekasi": "Jawa Barat",
      "Kota Bekasi": "Jawa Barat",
      "Kabupaten Karawang": "Jawa Barat",
      "DKI Jakarta": "DKI Jakarta"
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
  "kanstin hijau": "Kanstin Hijau",
  "kanstin hitam": "Kanstin Hitam",
  "kanstin putih": "Kanstin Putih",
  "kanstin abu abu": "Kanstin Abu-Abu",
  "pagar beton": "Pagar Beton",
  "pagar panel beton": "Pagar Panel Beton",
  "pagar panel": "Pagar Panel Beton",
  "pagar brc": "Pagar BRC",
  "pagar brc galvanis": "Pagar BRC Galvanis",
  "pagar brc hitam": "Pagar BRC Hitam",
  "pagar brc hijau": "Pagar BRC Hijau",
  "pagar besi": "Pagar Besi",
  "pagar besi tempa": "Pagar Besi Tempa",
  "pagar besi hollow": "Pagar Besi Hollow",
  "pagar grc": "Pagar GRC",
  "pagar grc minimalis": "Pagar GRC Minimalis",
  "pagar batu alam": "Pagar Batu Alam",
  "pagar batu andesit": "Pagar Batu Andesit",
  "pagar batu palimanan": "Pagar Batu Palimanan",
  "pagar batu candi": "Pagar Batu Candi",
  "pagar batu paras jogja": "Pagar Batu Paras Jogja",
  "pagar rumah": "Pagar Rumah",
  "pagar rumah minimalis": "Pagar Rumah Minimalis",
  "pagar rumah mewah": "Pagar Rumah Mewah",
  "pagar rumah modern": "Pagar Rumah Modern",
  "pagar perumahan": "Pagar Perumahan",
  "barrier beton": "Barrier Beton",
  "barrier jalan": "Barrier Jalan",
  "barrier pembatas": "Barrier Pembatas",
  "barrier beton precast": "Barrier Beton Precast",
  "separator beton": "Separator Beton",
  "separator jalan": "Separator Jalan",
  "median jalan": "Median Jalan",
  "median beton": "Median Beton",
  "kereb beton": "Kereb Beton",
  "kereb jalan": "Kereb Jalan",
  "kereb trotoar": "Kereb Trotoar",

  // ==================== PRODUK SALURAN DRAINASE ====================
  "produk saluran drainase": "Produk Drainase",
  "saluran drainase": "Saluran Drainase",
  "u ditch": "U-Ditch",
  "u ditch beton": "U-Ditch Beton",
  "u ditch precast": "U-Ditch Precast",
  "u ditch 40x40": "U-Ditch 40x40",
  "u ditch 50x50": "U-Ditch 50x50",
  "u ditch 60x60": "U-Ditch 60x60",
  "u ditch 80x80": "U-Ditch 80x80",
  "u ditch 100x100": "U-Ditch 100x100",
  "box culvert": "Box Culvert",
  "box culvert beton": "Box Culvert Beton",
  "box culvert precast": "Box Culvert Precast",
  "box culvert 2x2": "Box Culvert 2x2",
  "box culvert 3x3": "Box Culvert 3x3",
  "box culvert 4x4": "Box Culvert 4x4",
  "buis beton": "Buis Beton",
  "gorong gorong": "Gorong-Gorong",
  "gorong gorong beton": "Gorong-Gorong Beton",
  "pipa beton": "Pipa Beton",
  "pipa beton precast": "Pipa Beton Precast",
  "pipa beton bertulang": "Pipa Beton Bertulang",
  "pipa beton non tulang": "Pipa Beton Non Tulang",
  "culvert": "Culvert",
  "culvert beton": "Culvert Beton",
  "saluran air beton": "Saluran Air Beton",
  "saluran air precast": "Saluran Air Precast",
  "saluran terbuka": "Saluran Terbuka",
  "saluran tertutup": "Saluran Tertutup",
  "drainase beton": "Drainase Beton",
  "drainase precast": "Drainase Precast",

  // ==================== PRODUK JALAN & LANTAI ====================
  "produk jalan lantai": "Produk Jalan & Lantai",
  "paving block": "Paving Block",
  "paving block beton": "Paving Block Beton",
  "paving block press": "Paving Block Press",
  "paving block conblock": "Conblock",
  "paving block hexagonal": "Paving Block Hexagonal",
  "paving block segi enam": "Paving Block Segi Enam",
  "paving block bata": "Paving Block Bata",
  "paving block segitiga": "Paving Block Segitiga",
  "paving block zigzag": "Paving Block Zigzag",
  "paving block grass block": "Grass Block",
  "grass block": "Grass Block",
  "grass block beton": "Grass Block Beton",
  "grass block parkir": "Grass Block Parkir",
  "grass block hijau": "Grass Block Hijau",
  "slab beton": "Slab Beton",
  "slab lantai beton": "Slab Lantai Beton",
  "slab precast": "Slab Precast",
  "slab lantai precast": "Slab Lantai Precast",
  "tactile paving": "Tactile Paving",
  "paving guiding block": "Guiding Block",
  "paving tuna netra": "Paving Tunanetra",
  "paving pemandu": "Paving Pemandu",
  "paving warning block": "Warning Block",
  "paving peringatan": "Paving Peringatan",
  "panel lantai": "Panel Lantai",
  "panel lantai precast": "Panel Lantai Precast",
  "panel lantai beton": "Panel Lantai Beton",
  "lantai panggung": "Lantai Panggung",
  "floor panel": "Floor Panel",

  // ==================== PRODUK PONDASI STRUKTUR ====================
  "produk pondasi struktur": "Produk Pondasi",
  "pondasi struktur": "Pondasi Struktur",
  "tiang pancang": "Tiang Pancang",
  "tiang pancang beton": "Tiang Pancang Beton",
  "tiang pancang precast": "Tiang Pancang Precast",
  "tiang pancang persegi": "Tiang Pancang Persegi",
  "tiang pancang kotak": "Tiang Pancang Kotak",
  "tiang pancang bulat": "Tiang Pancang Bulat",
  "tiang pancang spun pile": "Spun Pile",
  "spun pile": "Spun Pile",
  "spun pile beton": "Spun Pile Beton",
  "bore pile": "Bore Pile",
  "bore pile beton": "Bore Pile Beton",
  "mini pile": "Mini Pile",
  "mini pile beton": "Mini Pile Beton",
  "strauss pile": "Strauss Pile",
  "strauss pile beton": "Strauss Pile Beton",
  "cakar ayam": "Cakar Ayam",
  "cakar ayam beton": "Cakar Ayam Beton",
  "pondasi cakar ayam": "Pondasi Cakar Ayam",
  "pile cap": "Pile Cap",
  "pile cap beton": "Pile Cap Beton",
  "pondasi sumuran": "Pondasi Sumuran",
  "pondasi sumuran beton": "Pondasi Sumuran Beton",
  "pondasi footplat": "Pondasi Footplat",
  "pondasi tapak": "Pondasi Tapak",
  "pondasi batu kali": "Pondasi Batu Kali",
  "pondasi menerus": "Pondasi Menerus",

  // ==================== PRODUK JEMBATAN & FLYOVER ====================
  "produk jembatan flyover": "Produk Jembatan & Flyover",
  "jembatan flyover": "Jembatan & Flyover",
  "box girder": "Box Girder",
  "box girder beton": "Box Girder Beton",
  "box girder precast": "Box Girder Precast",
  "girder beton": "Girder Beton",
  "girder precast": "Girder Precast",
  "pier head": "Pier Head",
  "pier head beton": "Pier Head Beton",
  "pier head precast": "Pier Head Precast",
  "diaphragm": "Diaphragm",
  "diaphragm beton": "Diaphragm Beton",
  "diaphragm precast": "Diaphragm Precast",
  "balok beton": "Balok Beton",
  "balok precast": "Balok Precast",
  "balok girder": "Balok Girder",
  "segmen box girder": "Segmen Box Girder",
  "tiang pancang jembatan": "Tiang Pancang Jembatan",
  "abutment beton": "Abutment Beton",
  "abutment precast": "Abutment Precast",
  "oprit beton": "Oprit Beton",
  "oprit precast": "Oprit Precast",
  "railing jembatan": "Railing Jembatan",
  "railing beton": "Railing Beton",
  "railing precast": "Railing Precast",
  "expansion joint": "Expansion Joint",
  "bearing pad": "Bearing Pad",

  // ==================== PRODUK DINDING BANGUNAN MODULAR ====================
  "produk dinding bangunan modular": "Dinding Modular",
  "dinding modular": "Dinding Modular",
  "panel beton precast": "Panel Beton Precast",
  "panel dinding beton": "Panel Dinding Beton",
  "panel dinding precast": "Panel Dinding Precast",
  "panel beton ringan": "Panel Beton Ringan",
  "beton ringan precast": "Beton Ringan Precast",
  "sandwich panel": "Sandwich Panel",
  "sandwich panel beton": "Sandwich Panel Beton",
  "sandwich panel precast": "Sandwich Panel Precast",
  "roster beton": "Roster Beton",
  "roster precast": "Roster Precast",
  "roster minimalis": "Roster Minimalis",
  "roster modern": "Roster Modern",
  "dinding prefab": "Dinding Prefab",
  "dinding prefabrikasi": "Dinding Prefabrikasi",
  "dinding pracetak": "Dinding Pracetak",
  "partisi beton": "Partisi Beton",
  "partisi precast": "Partisi Precast",
  "sekat beton": "Sekat Beton",
  "sekat precast": "Sekat Precast",
  "dinding penahan tanah": "Dinding Penahan Tanah",
  "dinding penahan precast": "Dinding Penahan Precast",
  "retaining wall": "Retaining Wall",
  "retaining wall beton": "Retaining Wall Beton",
  "retaining wall precast": "Retaining Wall Precast",

  // ==================== PRODUK PELABUHAN & PESISIR ====================
  "produk pelabuhan pesisir": "Produk Pelabuhan & Pesisir",
  "pelabuhan pesisir": "Pelabuhan & Pesisir",
  "sheet pile": "Sheet Pile",
  "sheet pile beton": "Sheet Pile Beton",
  "sheet pile precast": "Sheet Pile Precast",
  "sheet pile baja": "Sheet Pile Baja",
  "sheet pile wpc": "Sheet Pile WPC",
  "ponton": "Ponton",
  "ponton beton": "Ponton Beton",
  "ponton apung": "Ponton Apung",
  "dermaga beton": "Dermaga Beton",
  "dermaga precast": "Dermaga Precast",
  "dermaga apung": "Dermaga Apung",
  "crane dermaga": "Crane Dermaga",
  "crane pelabuhan": "Crane Pelabuhan",
  "breakwater": "Breakwater",
  "breakwater beton": "Breakwater Beton",
  "breakwater precast": "Breakwater Precast",
  "tetrapod": "Tetrapod",
  "tetrapod beton": "Tetrapod Beton",
  "dolphin beton": "Dolphin Beton",
  "dolphin tambat": "Dolphin Tambat",
  "bolder beton": "Bolder Beton",
  "bolder tambat": "Bolder Tambat",
  "fender pelabuhan": "Fender Pelabuhan",
  "revetment beton": "Revetment Beton",
  "revetment precast": "Revetment Precast",
  "sea wall": "Sea Wall",
  "sea wall beton": "Sea Wall Beton",
  "sea wall precast": "Sea Wall Precast",
  "groin beton": "Groin Beton",
  "groin precast": "Groin Precast",

  // ==================== PRODUK KONSTRUKSI UMUM ====================
  "produk konstruksi": "Produk Konstruksi",
  "beton precast": "Beton Precast",
  "produk alat konstruksi": "Alat Konstruksi",
  "alat konstruksi": "Alat Konstruksi",
  "material konstruksi": "Material Konstruksi",
  "jasa konstruksi": "Jasa Konstruksi",

  // ==================== PRODUK CUSTOM ====================
  "produk custom": "Produk Custom",
  "custom precast": "Custom Precast",
  "custom beton": "Custom Beton",
  "produk khusus": "Produk Khusus",
  "beton khusus": "Beton Khusus",
  "precast khusus": "Precast Khusus"
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
    log("AutoSchema Hybrid v4.55b DIMULAI", "INFO");
    log("═══════════════════════════════════════════════════", "INFO");
    
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
    
    // Parent URLs
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
    log("═══════════════════════════════════════════════════", "INFO");
    log("AutoSchema Hybrid v4.55b SELESAI", "SUCCESS");
    
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
