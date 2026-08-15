/**
 * ⚡ AutoSchema Hybrid v4.59 — FOKUS PRODUK & MATERIAL
 * 
 * UPDATE v4.59:
 * - FIX: Deteksi "Jual" tetap generate Product schema
 * - FIX: Kategori produk lebih spesifik (ConcreteProduct, PavingProduct, dll)
 * - FIX: Deteksi produk dari URL mapping diperluas
 * - FIX: Hanya generate Product, bukan Service
 * 
 * @version 4.59
 * @date 2026-08-15
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
    SKIP_WORD_COUNT: 800,
    PARENT_MAPPING_URL: 'https://raw.githack.com/aliyul/solution-blogger/main/parent-mapping.js',
    PLD_TIMEOUT: 5000
  };

  function log(msg, type = "INFO") {
    if (!CONFIG.DEBUG && type === "INFO") return;
    const icons = { INFO: "📘", WARN: "⚠️", ERROR: "❌", SUCCESS: "✅", SKIP: "⏭️", PRODUCT: "🏗️" };
    const prefix = icons[type] || "📘";
    console.log(`${prefix} [AutoSchema v4.59] ${msg}`);
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
        resolve();
      };
      document.head.appendChild(s);
    });
  }

  // ===================== PARENT MAPPING =====================
  let parentMappingGlobal = null;

  async function loadParentMapping() {
    try {
      await loadExternalJS(CONFIG.PARENT_MAPPING_URL);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (typeof getParentForMoneyPage === 'function') {
        parentMappingGlobal = getParentForMoneyPage;
        log("Parent mapping loaded from getParentForMoneyPage()", "SUCCESS");
        return true;
      } else if (window.PARENT_MAPPING) {
        parentMappingGlobal = (url) => window.PARENT_MAPPING[url] || null;
        log("Parent mapping loaded from window.PARENT_MAPPING", "SUCCESS");
        return true;
      }
      return false;
    } catch (error) {
      log(`Error loading parent mapping: ${error.message}`, "ERROR");
      return false;
    }
  }

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
      return null;
    }
  }

  // ============================================================
  // 🔥🔥🔥 AMBIL PAGE LEVEL DARI PLD 🔥🔥🔥
  // ============================================================
  
  function getPageLevelFromPLD() {
    // ✅ PRIORITAS 1: PLD v22.x
    if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
      try {
        const pageLevel = window.pageLevelDetectorv22.detect();
        log(`Page Level dari PLD v22.x: ${pageLevel}`, "SUCCESS");
        return pageLevel;
      } catch(e) {
        log(`Error calling PLD v22.x: ${e.message}`, "ERROR");
      }
    }
    
    // ✅ PRIORITAS 2: PLD v20.x
    if (window.pageLevelDetectorv20 && typeof window.pageLevelDetectorv20.detect === 'function') {
      try {
        const pageLevel = window.pageLevelDetectorv20.detect();
        log(`Page Level dari PLD v20.x: ${pageLevel}`, "SUCCESS");
        return pageLevel;
      } catch(e) {
        log(`Error calling PLD v20.x: ${e.message}`, "ERROR");
      }
    }
    
    // ✅ PRIORITAS 3: PLD v19.0
    if (window.pageLevelDetectorv19 && typeof window.pageLevelDetectorv19.detect === 'function') {
      try {
        const pageLevel = window.pageLevelDetectorv19.detect();
        log(`Page Level dari PLD v19.0: ${pageLevel}`, "SUCCESS");
        return pageLevel;
      } catch(e) {
        log(`Error calling PLD v19.0: ${e.message}`, "ERROR");
      }
    }
    
    // ✅ PRIORITAS 4: PLD v18
    if (window.pageLevelDetectorV18 && typeof window.pageLevelDetectorV18.detect === 'function') {
      try {
        const pageLevel = window.pageLevelDetectorV18.detect();
        log(`Page Level dari PLD v18.7: ${pageLevel}`, "SUCCESS");
        return pageLevel;
      } catch(e) {
        log(`Error calling PLD v18.7: ${e.message}`, "ERROR");
      }
    }
    
    // ✅ PRIORITAS 5: PLD v17
    if (window.pageLevelDetectorV17 && typeof window.pageLevelDetectorV17.detect === 'function') {
      try {
        const pageLevel = window.pageLevelDetectorV17.detect();
        log(`Page Level dari PLD v17.0: ${pageLevel}`, "SUCCESS");
        return pageLevel;
      } catch(e) {
        log(`Error calling PLD v17.0: ${e.message}`, "ERROR");
      }
    }
    
    // ✅ PRIORITAS 6: PLD legacy
    if (window.pageLevelDetector && typeof window.pageLevelDetector.detect === 'function') {
      try {
        const pageLevel = window.pageLevelDetector.detect();
        log(`Page Level dari PLD legacy: ${pageLevel}`, "SUCCESS");
        return pageLevel;
      } catch(e) {
        log(`Error calling PLD legacy: ${e.message}`, "ERROR");
      }
    }
    
    // ✅ CEK DARI BODY ATTRIBUTE
    const bodyPageLevel = document.body.getAttribute('data-page-level') || 
                          document.body.getAttribute('data-schema-page-level');
    if (bodyPageLevel) {
      log(`Page Level dari body attribute: ${bodyPageLevel}`, "SUCCESS");
      return bodyPageLevel;
    }
    
    // ❌ FALLBACK: detect sendiri
    log("PLD tidak tersedia, menggunakan fallback detection", "WARN");
    return detectPageLevelFallback();
  }

  // ============================================================
  // FALLBACK DETECTION (jika PLD tidak tersedia)
  // ============================================================
  function detectPageLevelFallback() {
    const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
    const title = document.title.toLowerCase();
    const url = location.href.toLowerCase();
    
    // VARIANT
    const variantPatterns = ["spesifikasi", "ukuran", "dimensi", "varian", "polosan", "motif", "custom", "tinggi", "rendah"];
    for (let pattern of variantPatterns) {
      if (h1.includes(pattern) || title.includes(pattern) || url.includes(pattern)) {
        const subVariantPatterns = ["detail", "lengkap", "spesifikasi teknis"];
        for (let sub of subVariantPatterns) {
          if (h1.includes(sub) || title.includes(sub)) return "sub-variant";
        }
        return "variant";
      }
    }
    
    // MONEY CHILD (lokasi)
    const locations = ["jakarta", "bekasi", "bogor", "depok", "tangerang", "karawang", "surabaya", "bandung", "cirebon", "ciamis"];
    for (let loc of locations) {
      if (h1.includes(loc) || title.includes(loc) || url.includes(loc)) return "money-child";
    }
    
    // MONEY PAGE (harga)
    if (/\b(harga|biaya|tarif)\b/i.test(h1 + title)) return "money-page";
    
    // MONEY MASTER
    if (/\b(jasa|sewa|borongan)\b/i.test(h1 + title) && !/\b(panduan|tips|cara)\b/i.test(h1 + title)) return "money-master";
    
    return "pillar";
  }

  // ============================================================
  // MENUNGGU PLD READY
  // ============================================================
  function waitForPLD() {
    return new Promise((resolve) => {
      if (window.pageLevelDetectorv22 || window.pageLevelDetectorv20 || 
          window.pageLevelDetectorv19 || window.pageLevelDetectorV18 || 
          window.pageLevelDetectorV17 || window.pageLevelDetector) {
        resolve(true);
        return;
      }
      
      const onReady = () => {
        log("PLD ready (event)", "SUCCESS");
        resolve(true);
      };
      
      window.addEventListener("pageLevelDetectorv22Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorv20Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorv19Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorReady", onReady, { once: true });
      
      setTimeout(() => {
        if (window.pageLevelDetectorv22 || window.pageLevelDetectorv20 || 
            window.pageLevelDetectorv19 || window.pageLevelDetectorV18 || 
            window.pageLevelDetectorV17 || window.pageLevelDetector) {
          log("PLD ready (timeout)", "SUCCESS");
          resolve(true);
        } else {
          log("PLD timeout, using fallback", "WARN");
          resolve(false);
        }
      }, CONFIG.PLD_TIMEOUT);
    });
  }

  // ============================================================
  // CEK APAKAH SKIP PRODUCT (FOKUS PRODUK/MATERIAL)
  // ============================================================
  function shouldSkipProductSchema(pageLevel) {
    const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
    const title = document.title.toLowerCase();
    const url = location.href.toLowerCase();
    const combined = h1 + " " + title + " " + url;
    
    // ===== ✅ PRODUK/MATERIAL TIDAK PERNAH DI-SKIP =====
    // Deteksi produk/material
    const isProduct = /(beton|readymix|precast|paving|panel|box|u-ditch|kanstin|gorong|material|bahan|besi|baja|pipa|atap|genteng|keramik|marmer|granit|kayu|pintu|jendela|kusen|pagar\s*panel|paving\s*block|box\s*culvert|u\s*ditch|gorong\s*gorong)/i.test(combined);
    
    if (isProduct) {
      log(`🏗️ Product/Material detected → GENERATE Product schema`, "PRODUCT");
      return false;
    }
    
    // ===== VARIANT TIDAK PERNAH DI-SKIP =====
    if (pageLevel === 'variant' || pageLevel === 'sub-variant') {
      log(`Variant page detected → GENERATE Product schema`, "SUCCESS");
      return false;
    }
    
    // ===== MONEY PAGES TIDAK PERNAH DI-SKIP =====
    if (['money-master', 'money-page', 'money-child'].includes(pageLevel)) {
      // Cek apakah ini produk atau jasa
      const isProductMoney = /(beton|readymix|precast|paving|panel|box|u-ditch|kanstin|gorong|material|bahan|besi|baja|pipa|atap|genteng|keramik|marmer|granit|kayu|pintu|jendela|kusen|pagar\s*panel|paving\s*block|box\s*culvert|u\s*ditch|gorong\s*gorong)/i.test(combined);
      if (isProductMoney) {
        log(`🏗️ Product Money page → GENERATE Product schema`, "PRODUCT");
        return false;
      }
      
      // Jika money page tapi bukan produk (jasa), tetap generate
      log(`Money page detected → GENERATE Product schema`, "SUCCESS");
      return false;
    }
    
    // ===== HANYA SKIP UNTUK PILLAR MURNI =====
    const pillarPatterns = [
      "panduan lengkap", "pengertian", "definisi", "apa itu",
      "overview", "komprehensif", "cara memilih", "tips memilih",
      "langkah memilih", "kriteria memilih"
    ];
    
    for (let pattern of pillarPatterns) {
      if (h1.includes(pattern) || title.includes(pattern) || url.includes(pattern)) {
        const hasPriceElement = document.querySelector('table td:contains("Rp"), .price, .harga');
        if (!hasPriceElement) {
          log(`Skip: Halaman edukasi murni (pattern: "${pattern}")`, "SKIP");
          return true;
        }
      }
    }
    
    // ===== CEK PANJANG KONTEN =====
    const content = document.querySelector(".post-body.entry-content, .post-body, article, main");
    if (content) {
      const wordCount = (content.innerText || "").split(/\s+/).filter(Boolean).length;
      if (wordCount > CONFIG.SKIP_WORD_COUNT) {
        const hasPriceTable = document.querySelector('table td:contains("Rp"), table td:contains("harga")');
        if (!hasPriceTable) {
          log(`Skip: Konten panjang (${wordCount} kata) tanpa tabel harga`, "SKIP");
          return true;
        }
      }
    }
    
    // ===== CEK KEBERADAAN HARGA =====
    const hasPriceElement = document.querySelector('table td:contains("Rp"), .price, .harga');
    if (!hasPriceElement) {
      log(`Skip: Tidak ditemukan elemen harga`, "SKIP");
      return true;
    }
    
    log("🏗️ Halaman LAYAK untuk Product schema", "PRODUCT");
    return false;
  }

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================
  function sanitizeText(text) {
    if (!text) return "";
    return text.replace(/[\t\n\r]+/g, ' ').replace(/\s{2,}/g, ' ').trim().substring(0, 100);
  }

  function extractPrice(text) {
    if (!text) return null;
    const match = text.match(/Rp\s*([\d.,]+)/);
    if (!match) return null;
    const price = parseInt(match[1].replace(/[^\d]/g, ''));
    if (isNaN(price)) return null;
    return price;
  }

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

  // ============================================================
  // DETECT PARENT URLS
  // ============================================================
  function detectParentUrls(currentUrl) {
    const parentFromMapping = getParentFromMapping(currentUrl);
    if (parentFromMapping) {
      log(`Parent detected from mapping: ${parentFromMapping["@id"]}`, "SUCCESS");
      return [parentFromMapping];
    }
    
    const breadcrumbSelectors = [
      ".breadcrumbs a", ".breadcrumb a", ".nav-trail a",
      ".breadcrumb-nav a", ".site-breadcrumb a",
      "[class*='breadcrumb'] a", "[class*='breadcrumbs'] a"
    ];
    
    let lastBreadcrumbUrl = null;
    for (const selector of breadcrumbSelectors) {
      const links = document.querySelectorAll(selector);
      if (links.length > 0) {
        const lastLink = links[links.length - 1];
        if (lastLink.href && lastLink.href !== currentUrl && lastLink.href !== location.href) {
          lastBreadcrumbUrl = lastLink.href;
          break;
        }
      }
    }
    
    if (!lastBreadcrumbUrl) {
      const metaParent = document.querySelector('meta[name="parent-url"]')?.content;
      if (metaParent) lastBreadcrumbUrl = metaParent;
    }
    
    if (!lastBreadcrumbUrl) lastBreadcrumbUrl = location.origin;
    
    return [{ "@type": "WebPage", "@id": lastBreadcrumbUrl }];
  }

  // ============================================================
  // DETECT PRODUCT NAME (FIXED v4.59)
  // ============================================================
  function detectProductName(pageLevel) {
    const h1 = document.querySelector("h1")?.innerText?.trim();
    if (h1 && h1.length < 120) return h1;
    
    const pathKey = location.pathname.split("/").pop().replace(".html", "").replace(/-/g, " ");
    
    const urlMapping = {
      // Beton Precast
      "pagar panel beton polosan": "Pagar Panel Beton Polosan",
      "pagar panel beton motif": "Pagar Panel Beton Motif",
      "pagar panel beton custom": "Pagar Panel Beton Custom",
      "pagar panel beton tinggi": "Pagar Panel Beton Tinggi",
      "pagar panel beton rendah": "Pagar Panel Beton Rendah",
      "pagar panel beton": "Pagar Panel Beton",
      
      // Produk Precast
      "u ditch": "U-Ditch",
      "box culvert": "Box Culvert",
      "gorong-gorong": "Gorong-Gorong",
      "kanstin beton": "Kanstin Beton",
      "kansteen beton": "Kanstin Beton",
      
      // Paving
      "paving block": "Paving Block",
      "conblock": "Conblock",
      "grassblock": "Grassblock",
      
      // Beton Readymix
      "beton readymix": "Beton Readymix",
      "readymix": "Beton Readymix",
      "beton cor": "Beton Cor",
      "beton ready mix": "Beton Ready Mix",
      
      // Material
      "besi beton": "Besi Beton",
      "baja ringan": "Baja Ringan",
      "pipa paralon": "Pipa Paralon",
      "atap genteng": "Atap Genteng"
    };
    
    let productName = urlMapping[pathKey.toLowerCase()];
    if (!productName && pathKey && pathKey.length > 0 && pathKey.length < 80) {
      productName = pathKey.replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return productName || "Produk Konstruksi";
  }

  // ============================================================
  // DETECT PRODUCT CATEGORY (FIXED v4.59)
  // ============================================================
  function detectProductCategory(pageLevel) {
    const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
    const title = document.title.toLowerCase();
    const url = location.href.toLowerCase();
    const combined = h1 + " " + title + " " + url;
    
    // ✅ DETEKSI KATEGORI PRODUK
    if (/(beton|readymix|ready mix|cor|concrete)/i.test(combined)) {
      return "ConcreteProduct";
    }
    if (/(paving|block|conblock|grassblock|paving\s*block)/i.test(combined)) {
      return "PavingProduct";
    }
    if (/(pagar|panel|booth|gorong|box|culvert|u-ditch|kanstin|kansteen|gorong\s*gorong)/i.test(combined)) {
      return "PrecastProduct";
    }
    if (/(besi|baja|pipa|atap|genteng|baja\s*ringan|besi\s*beton)/i.test(combined)) {
      return "SteelProduct";
    }
    if (/(keramik|marmer|granit|kayu|pintu|jendela|kusen)/i.test(combined)) {
      return "BuildingMaterial";
    }
    
    if (pageLevel === 'variant' || pageLevel === 'sub-variant') {
      return "VariantProduct";
    }
    
    return "BuildingMaterial";
  }

  // ============================================================
  // EXTRACT VARIANT SPEC
  // ============================================================
  function extractVariantSpec() {
    const content = document.querySelector(".post-body.entry-content, .post-body, article, main");
    if (!content) return null;
    
    const text = content.innerText;
    const spec = {};
    
    const sizeMatch = text.match(/(\d{1,3}\s*x\s*\d{1,3})\s*(cm|meter|m)/i);
    if (sizeMatch) spec.size = sizeMatch[1] + " " + sizeMatch[2];
    
    const heightMatch = text.match(/tinggi\s*([\d.]+)\s*(meter|m|cm)/i);
    if (heightMatch) spec.height = heightMatch[1] + " " + heightMatch[2];
    
    const thickMatch = text.match(/tebal\s*([\d.]+)\s*(cm|mm)/i);
    if (thickMatch) spec.thickness = thickMatch[1] + " " + thickMatch[2];
    
    if (Object.keys(spec).length === 0) return null;
    return { "@type": "ProductVariant", ...spec };
  }

  // ============================================================
  // OFFER PARSING
  // ============================================================
  const seenItems = new Set();
  const offers = [];

  function addOffer(name, price, desc = "") {
    if (!price || price <= 0) return;
    if (price < CONFIG.MIN_PRICE || price > CONFIG.MAX_PRICE) return;
    if (offers.length >= CONFIG.MAX_OFFERS) return;
    
    let cleanName = sanitizeText(name);
    if (!cleanName || cleanName.length < 3) return;
    
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

  function parseVariantOffers() {
    const content = document.querySelector(".post-body.entry-content, .post-body, article, main");
    if (!content) return false;
    
    const text = content.innerText;
    const variantPatterns = [
      /(tinggi|ukuran|dimensi)\s*([\d.]+)\s*(meter|m|cm)\s*(?:Rp\s*([\d.,]+))/i,
      /(panel|pagar)\s*(polosan|motif|custom)\s*(?:Rp\s*([\d.,]+))/i,
      /(tipe|varian)\s*([a-zA-Z0-9\s]+?)\s*(?:Rp\s*([\d.,]+))/i
    ];
    
    let found = false;
    for (const pattern of variantPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const name = match[0].split("Rp")[0]?.trim() || match[0].substring(0, 50);
        const price = extractPrice(match[0]);
        if (price && price > CONFIG.MIN_PRICE && price < CONFIG.MAX_PRICE) {
          addOffer(name, price, "Variant");
          found = true;
        }
      }
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

  // ============================================================
  // MAIN FUNCTION
  // ============================================================
  async function init() {
    log("═══════════════════════════════════════════════════", "INFO");
    log("AutoSchema Hybrid v4.59 — FOKUS PRODUK & MATERIAL", "INFO");
    log("═══════════════════════════════════════════════════", "INFO");
    
    // ===== LOAD PARENT MAPPING =====
    await loadParentMapping();
    
    // ===== TUNGGU PLD READY =====
    await waitForPLD();
    
    // ===== AMBIL PAGE LEVEL DARI PLD =====
    const pageLevel = getPageLevelFromPLD();
    log(`Page Level dari PLD: ${pageLevel}`, "SUCCESS");
    
    // ===== CEK SKIP =====
    if (shouldSkipProductSchema(pageLevel)) {
      log("Product schema SKIPPED untuk halaman ini", "SKIP");
      return;
    }
    
    // ===== EKSTRAKSI DATA DASAR =====
    const currentUrl = location.href.replace(/[?&]m=1/, "");
    const fallbackImage = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";
    
    const productName = detectProductName(pageLevel);
    const desc = document.querySelector('meta[name="description"]')?.content?.trim() || 
                 document.querySelector("article p, main p, section p")?.innerText?.trim()?.substring(0, 300) ||
                 `Produk ${productName} berkualitas dari Beton Jaya Readymix`;
    
    const contentImage = document.querySelector("article img, main img, .post-body img, .product-image img")?.src || fallbackImage;
    const parentUrls = detectParentUrls(currentUrl);
    const areaServed = getAreaServed();
    const productCategory = detectProductCategory(pageLevel);
    
    // ===== PARSE OFFERS =====
    log("Parsing offers...", "INFO");
    let hasTableOffers = parseTableOffers();
    
    if (!hasTableOffers || offers.length === 0) {
      log("Tidak ada offers dari tabel, mencoba varian...", "WARN");
      const hasVariantOffers = parseVariantOffers();
      if (!hasVariantOffers || offers.length === 0) {
        parseListOffers();
      }
    }
    
    // ===== FALLBACK =====
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
    
    // ===== BUILD PRODUCT =====
    const business = {
      "@type": "LocalBusiness",
      "@id": "https://www.betonjayareadymix.com/#localbusiness",
      name: "Beton Jaya Readymix",
      url: "https://www.betonjayareadymix.com",
      logo: fallbackImage
    };
    
    const product = {
      "@type": "Product",
      "@id": currentUrl + "#product",
      name: productName,
      image: [contentImage],
      description: desc,
      brand: { "@type": "Brand", name: "Beton Jaya Readymix" },
      category: productCategory,
      offers: offers,
      areaServed: areaServed,
      isPartOf: parentUrls
    };
    
    // ===== TAMBAHKAN PROPERTI UNTUK VARIANT =====
    if (pageLevel === 'variant' || pageLevel === 'sub-variant') {
      product.productType = pageLevel === 'variant' ? "Variant" : "Sub-Variant";
      product.material = "Beton Precast";
      product.manufacturer = { "@type": "Organization", name: "Beton Jaya Readymix" };
      
      const variantSpec = extractVariantSpec();
      if (variantSpec) {
        product.variant = variantSpec;
      }
    }
    
    // ===== BUILD GRAPH =====
    const webpage = {
      "@type": "WebPage",
      "@id": currentUrl + "#webpage",
      url: currentUrl,
      name: productName,
      description: desc,
      mainEntity: { "@id": product["@id"] },
      isPartOf: parentUrls
    };
    
    const graph = [webpage, business, product];
    
    // ===== INJECT SCHEMA =====
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
    log(`🏗️  Fokus: PRODUK & MATERIAL`, "PRODUCT");
    log(`  Page Level (dari PLD): ${pageLevel}`, "SUCCESS");
    log(`  Product Name   : ${productName}`, "SUCCESS");
    log(`  Product Category: ${productCategory}`, "SUCCESS");
    log(`  Offers Count   : ${offers.length}`, "SUCCESS");
    log(`  Valid Prices   : ${offers.filter(o => o.price > 0).length}`, "SUCCESS");
    log(`  Is Variant     : ${(pageLevel === 'variant' || pageLevel === 'sub-variant') ? '✅' : '❌'}`, "INFO");
    if (parentUrls.length > 0 && parentUrls[0]["@id"]) {
      log(`  Parent URL     : ${parentUrls[0]["@id"]}`, "INFO");
    }
    log("═══════════════════════════════════════════════════", "INFO");
    log("AutoSchema Hybrid v4.59 SELESAI", "SUCCESS");
  }
  
  // ============================================================
  // START
  // ============================================================
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(init, CONFIG.DELAY_MS);
    });
  } else {
    setTimeout(init, CONFIG.DELAY_MS);
  }
  
})();
