/**
 * ⚡ AutoSchema Hybrid v4.74 — V37 COMPLIANT + WAIT AED & BREADCRUMB + PLD v22.55 + FAQ + BREADCRUMB + SERVICE SCHEMA
 * 
 * UPDATE v4.74:
 * - ADD: COMMERCIAL & GABUNG focus detection
 * - ADD: getEntityTypeFromPLD() — dari PLD v22.55
 * - ADD: getPageLevelFromPLD() — pakai detectForPrompt
 * - ADD: generateFAQSchema() — FAQ Schema
 * - ADD: generateBreadcrumbSchema() — Breadcrumb Schema
 * - ADD: generateServiceSchema() — Service Schema (Jasa/Sewa)
 * - ADD: checkEntitySpecification() — VARIANT detection per entity
 * - ADD: PRODUK_SPECS, JASA_SPECS, SEWA_SPECS, DESAIN_SPECS
 * - ADD: extractVariantSpecEnhanced() — pakai PRODUK_SPECS
 * - FIX: needYear() — handle COMMERCIAL & GABUNG
 * - FIX: getColorConfig() — handle COMMERCIAL & GABUNG
 * - FIX: isImageEligible() — handle COMMERCIAL & GABUNG
 * - FIX: detectContentFocus() — tambah COMMERCIAL & GABUNG
 * 
 * @version 4.74
 * @date 2026-09-07
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
    SKIP_WORD_COUNT: 300,
    PLD_TIMEOUT: 5000,
    AED_TIMEOUT: 10000,
    BREADCRUMB_TIMEOUT: 3000,
    MIN_YEAR_TO_UPDATE: 2026
  };

  // ✅ FALLBACK IMAGE (logo)
  const LOGO_IMAGE = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";
  const FALLBACK_IMAGE = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiWWAP6ezcmzgbGtHmmJqBjYkbsdQBrwCeC9pl9ocjL-VSQYftirdvXAF1T-eg_QMSqu1WiFidDc9fnChi0yaOqi0Dd6EVMy4ZX3P7vccY4XJMu-7k2TGVd5TS1wIG5jgIm_6beYVb2zuNQGS7eBuODJqd20c4ckvd0-HaEqGf4W-B_750I91wi9IhqqnI/s320/No_Image_Available.jpg";

  // ============================================================
  // 🔥🔥🔥 PRODUK SPECIFICATIONS (PLD v22.55 COMPLIANT) 🔥🔥🔥
  // ============================================================

  const PRODUK_SPECS = {
      mutu: ["k225", "k250", "k300", "k350", "k400", "k500", "fc", "sni"],
      finishing: ["polos", "motif", "bermotif", "bercorak", "tekstur", "serat", "halus", "kasar", "matte", "glossy", "doff", "gloss", "satin", "anyaman", "natural", "ekspos", "custom", "polosan"],
      dimensi: ["ukuran", "dimensi", "tinggi", "rendah", "panjang", "pendek", "lebar", "sempit", "tebal", "tipis", "dalam", "dangkal", "diameter", "radius"],
      material: ["beton", "baja", "besi", "kayu", "keramik", "granit", "marmer", "plafon", "gypsum", "kanopi", "paving", "readymix", "precast", "pracetak"]
  };

  const JASA_SPECS = {
      metode: ["manual", "hidrolik", "auger", "rotary", "percussive", "dry", "wet", "basah", "kering"],
      teknik: ["coring", "cutting", "drilling", "pengeboran", "pemancangan", "pemasangan", "bongkar", "potong", "las", "sambung", "grinding", "welding", "bending", "forming", "gali", "urug", "angkut", "cor", "pasang", "bangun"],
      skala: ["rumahan", "komersial", "industri", "residential", "commercial", "industrial"],
      kedalaman: ["m", "meter", "cm", "centimeter"]
  };

  const SEWA_SPECS = {
      tipe: ["mini", "besar", "kecil", "sedang", "medium", "heavy", "standar", "extra", "ekstra"],
      merek: ["pc75", "pc200", "pc300", "komatsu", "hitachi", "caterpillar", "volvo", "hyundai", "doosan", "kobelco", "sumitomo"],
      kapasitas: ["ton", "m3", "kg", "liter"],
      kondisi: ["baru", "bekas", "servis", "recondition", "rebuilt"]
  };

  const DESAIN_SPECS = {
      gaya: ["modern", "minimalis", "klasik", "tradisional", "kontemporer", "elegan", "luxury", "industrial", "scandinavian", "jepang", "rustic", "vintage", "bohemian", "art deco", "mid century"],
      warna: ["putih", "hitam", "abu-abu", "merah", "biru", "kuning", "hijau", "coklat", "netral", "warm", "cool", "pastel", "dark", "light"],
      material: ["kayu", "besi", "kaca", "marmer", "granit", "keramik", "plafon", "gypsum", "pvc", "acp", "vinyl", "wpc", "grc", "hpl"],
      fungsi: ["ruang tamu", "kamar tidur", "dapur", "kamar mandi", "ruang kerja", "ruang keluarga", "teras", "taman", "ruang makan", "ruang tv"],
      konsep: ["open space", "split level", "loft", "studio", "apartment", "villa"]
  };

  // ============================================================
  // 🔥🔥🔥 LOGGING 🔥🔥🔥
  // ============================================================

  function log(msg, type = "INFO") {
    if (!CONFIG.DEBUG && type === "INFO") return;
    const icons = { INFO: "📘", WARN: "⚠️", ERROR: "❌", SUCCESS: "✅", SKIP: "⏭️", PRODUCT: "🏗️", IMAGE: "📸", YEAR: "📅", FOCUS: "🎯", TABLE: "📊", H1: "📝", PRIORITY: "🔴", STOP: "🛑", BREADCRUMB: "🍞", AED: "⚡", COMMERCIAL: "🛒", SERVICE: "🔧", FAQ: "❓", SCHEMA: "📋" };
    const prefix = icons[type] || "📘";
    console.log(`${prefix} [AutoSchema v4.74] ${msg}`);
  }

  // ============================================================
  // 🔥🔥🔥 WAIT FUNCTIONS 🔥🔥🔥
  // ============================================================

  function waitForBreadcrumb(timeout = CONFIG.BREADCRUMB_TIMEOUT) {
    return new Promise((resolve) => {
      const startTime = Date.now();

      function checkBreadcrumb() {
        const breadcrumbSelectors = [
          '.breadcrumbs', '.breadcrumb', '.nav-trail', '.breadcrumb-item',
          '.crumbs', '.breadcrumb-link', '[aria-label="breadcrumb"]',
          '.post-breadcrumb', '.breadcrumb-nav', '.nav-breadcrumb'
        ];

        for (const selector of breadcrumbSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            const links = element.querySelectorAll('a');
            if (links.length > 0) {
              log(`🍞 Breadcrumb ditemukan (${selector}) — ${links.length} link`, "BREADCRUMB");
              resolve(true);
              return;
            }
            if (element.innerText.trim().length > 0) {
              log(`🍞 Breadcrumb ditemukan (${selector}) — ada teks`, "BREADCRUMB");
              resolve(true);
              return;
            }
          }
        }

        if (Date.now() - startTime > timeout) {
          log(`⏰ Breadcrumb timeout (${timeout}ms), lanjutkan`, "WARN");
          resolve(false);
          return;
        }

        setTimeout(checkBreadcrumb, 100);
      }

      checkBreadcrumb();
    });
  }

  function waitForAEDMetaDates(timeout = CONFIG.AED_TIMEOUT) {
    return new Promise((resolve) => {
      if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
        log(`⚡ AEDMetaDates ready: ${window.AEDMetaDates.dateModified}`, "AED");
        resolve(window.AEDMetaDates);
        return;
      }

      const onReady = () => {
        if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
          log(`⚡ AEDMetaDates ready (event): ${window.AEDMetaDates.dateModified}`, "AED");
          resolve(window.AEDMetaDates);
        } else {
          resolve(null);
        }
      };

      window.addEventListener("detectEvergreenReady", onReady, { once: true });

      const startTime = Date.now();
      const interval = setInterval(() => {
        if (window.AEDMetaDates && window.AEDMetaDates.dateModified) {
          clearInterval(interval);
          log(`⚡ AEDMetaDates ready (interval): ${window.AEDMetaDates.dateModified}`, "AED");
          resolve(window.AEDMetaDates);
          return;
        }

        if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          log(`⏰ AEDMetaDates timeout (${timeout}ms), using fallback`, "WARN");
          resolve({
            dateModified: new Date().toISOString(),
            nextUpdate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            validityDays: 30,
            usePriceValidUntil: true,
            pageLevel: 'money-page',
            entityType: 'jasa',
            type: 'non-evergreen'
          });
        }
      }, 100);
    });
  }

  function waitForPLD() {
    return new Promise((resolve) => {
      if (window.pageLevelDetectorv22 || window.pageLevelDetectorv20 || 
          window.pageLevelDetectorv19 || window.pageLevelDetectorV18 || 
          window.pageLevelDetectorV17 || window.pageLevelDetector) {
        resolve(true);
        return;
      }

      const onReady = () => resolve(true);
      window.addEventListener("pageLevelDetectorv22Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorv20Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorv19Ready", onReady, { once: true });
      window.addEventListener("pageLevelDetectorReady", onReady, { once: true });

      setTimeout(() => {
        if (window.pageLevelDetectorv22 || window.pageLevelDetectorv20 || 
            window.pageLevelDetectorv19 || window.pageLevelDetectorV18 || 
            window.pageLevelDetectorV17 || window.pageLevelDetector) {
          resolve(true);
        } else {
          resolve(false);
        }
      }, CONFIG.PLD_TIMEOUT);
    });
  }

  // ============================================================
  // 🔥🔥🔥 CHECK ENTITY SPECIFICATION (PLD v22.55 COMPLIANT) 🔥🔥🔥
  // ============================================================

  function checkEntitySpecification(text, entityType) {
      if (!text) return { isSpec: false, specType: null, specDetails: [], confidence: 0 };
      
      const lower = text.toLowerCase();
      const result = { isSpec: false, specType: null, specDetails: [], confidence: 0 };

      // PRODUK
      if (entityType === "produk") {
          for (const mutu of PRODUK_SPECS.mutu) {
              if (new RegExp("\\b" + mutu + "\\b", "i").test(lower)) {
                  result.isSpec = true;
                  result.specType = "mutu";
                  result.specDetails.push(mutu);
                  result.confidence = 5;
                  return result;
              }
          }
          for (const finishing of PRODUK_SPECS.finishing) {
              if (new RegExp("\\b" + finishing + "\\b", "i").test(lower)) {
                  result.isSpec = true;
                  result.specType = "finishing";
                  result.specDetails.push(finishing);
                  result.confidence = 4;
                  return result;
              }
          }
          if (/\d+\s*(m|mm|cm|meter|kg|ton|inch|inci|ft|feet)/gi.test(lower)) {
              result.isSpec = true;
              result.specType = "dimensi";
              result.specDetails.push("dimensi");
              result.confidence = 3;
              return result;
          }
          if (/\d+\s*[x×]\s*\d+\s*(cm|m|meter|mm)/gi.test(lower)) {
              result.isSpec = true;
              result.specType = "ukuran";
              result.specDetails.push("ukuran");
              result.confidence = 4;
              return result;
          }
      }

      // MATERIAL
      if (entityType === "material") {
          if (/\d+\s*(mm|cm|m|meter|kg|ton|m3|liter)/gi.test(lower)) {
              result.isSpec = true;
              result.specType = "dimensi";
              result.specDetails.push("dimensi");
              result.confidence = 3;
              return result;
          }
          const finishingMaterial = ["ulir", "polos", "galvanis", "berlapis", "cat", "coating", "anyaman"];
          for (const fin of finishingMaterial) {
              if (new RegExp("\\b" + fin + "\\b", "i").test(lower)) {
                  result.isSpec = true;
                  result.specType = "finishing";
                  result.specDetails.push(fin);
                  result.confidence = 4;
                  return result;
              }
          }
      }

      // JASA
      if (entityType === "jasa") {
          for (const metode of JASA_SPECS.metode) {
              if (new RegExp("\\b" + metode + "\\b", "i").test(lower)) {
                  result.isSpec = true;
                  result.specType = "metode";
                  result.specDetails.push(metode);
                  result.confidence = 5;
                  return result;
              }
          }
          for (const teknik of JASA_SPECS.teknik) {
              if (new RegExp("\\b" + teknik + "\\b", "i").test(lower)) {
                  result.isSpec = true;
                  result.specType = "teknik";
                  result.specDetails.push(teknik);
                  result.confidence = 4;
                  return result;
              }
          }
          for (const skala of JASA_SPECS.skala) {
              if (new RegExp("\\b" + skala + "\\b", "i").test(lower)) {
                  result.isSpec = true;
                  result.specType = "skala";
                  result.specDetails.push(skala);
                  result.confidence = 3;
                  return result;
              }
          }
          if (/\d+\s*(m|meter|cm)/gi.test(lower)) {
              result.isSpec = true;
              result.specType = "kedalaman";
              result.specDetails.push("kedalaman");
              result.confidence = 3;
              return result;
          }
      }

      // SEWA
      if (entityType === "sewa") {
          for (const merek of SEWA_SPECS.merek) {
              if (new RegExp("\\b" + merek + "\\b", "i").test(lower)) {
                  result.isSpec = true;
                  result.specType = "merek";
                  result.specDetails.push(merek);
                  result.confidence = 5;
                  return result;
              }
          }
          for (const tipe of SEWA_SPECS.tipe) {
              if (new RegExp("\\b" + tipe + "\\b", "i").test(lower)) {
                  result.isSpec = true;
                  result.specType = "tipe";
                  result.specDetails.push(tipe);
                  result.confidence = 4;
                  return result;
              }
          }
          if (/\d+\s*(ton|m3|kg|liter)/gi.test(lower)) {
              result.isSpec = true;
              result.specType = "kapasitas";
              result.specDetails.push("kapasitas");
              result.confidence = 3;
              return result;
          }
      }

      // DESAIN
      if (entityType === "desain") {
          for (const gaya of DESAIN_SPECS.gaya) {
              if (new RegExp("\\b" + gaya + "\\b", "i").test(lower)) {
                  result.isSpec = true;
                  result.specType = "gaya";
                  result.specDetails.push(gaya);
                  result.confidence = 5;
                  return result;
              }
          }
          for (const fungsi of DESAIN_SPECS.fungsi) {
              if (new RegExp("\\b" + fungsi + "\\b", "i").test(lower)) {
                  result.isSpec = true;
                  result.specType = "fungsi";
                  result.specDetails.push(fungsi);
                  result.confidence = 4;
                  return result;
              }
          }
          for (const konsep of DESAIN_SPECS.konsep) {
              if (new RegExp("\\b" + konsep + "\\b", "i").test(lower)) {
                  result.isSpec = true;
                  result.specType = "konsep";
                  result.specDetails.push(konsep);
                  result.confidence = 4;
                  return result;
              }
          }
      }

      return result;
  }

  // ============================================================
  // 🔥🔥🔥 GET ENTITY TYPE FROM PLD 🔥🔥🔥
  // ============================================================

  function getEntityTypeFromPLD() {
      if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detectEntityType === 'function') {
          try {
              const entityType = window.pageLevelDetectorv22.detectEntityType();
              if (entityType) {
                  log(`🏷️ Entity Type from PLD v22.55: ${entityType}`, "SUCCESS");
                  return entityType;
              }
          } catch(e) {}
      }
      
      const bodyEntity = document.body.getAttribute('data-entity-type') || document.body.getAttribute('data-schema-entity-type');
      if (bodyEntity) return bodyEntity;
      
      const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
      const title = document.title.toLowerCase();
      const url = location.href.toLowerCase();
      const combined = h1 + " " + title + " " + url;
      
      if (/(jasa|layanan|service|borongan|kontraktor|renovasi|pemasangan|instalasi|pengerjaan|perbaikan|pasang|bangun|coring|drilling|pengeboran)/i.test(combined)) return 'jasa';
      if (/(sewa|rental|sewa alat|rental alat|excavator|bulldozer|crane|alat berat|dozer|vibro|roller)/i.test(combined)) return 'sewa';
      if (/(desain|interior|eksterior|arsitektur|layout|denah|gambar|konsep|rencana|modern|minimalis|klasik|tradisional|kontemporer)/i.test(combined)) return 'desain';
      if (/(material|bahan bangunan|bahan konstruksi|agregat|pasir|batu split|semen|besi|baja|kayu|keramik|granit|marmer|gypsum|plafon|paving|bata|batako|hebel)/i.test(combined)) return 'material';
      
      return 'produk';
  }

  // ============================================================
  // 🔥🔥🔥 GET PAGE LEVEL FROM PLD 🔥🔥🔥
  // ============================================================

  function getPageLevelFromPLD() {
      // CEK PLD v22.55 detectForPrompt
      if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detectForPrompt === 'function') {
          try {
              const slug = getCleanPageName();
              const entityType = getEntityTypeFromPLD();
              const result = window.pageLevelDetectorv22.detectForPrompt(slug, entityType);
              if (result && result.isValid) {
                  log(`🔥 Page Level from PLD v22.55 detectForPrompt: ${result.pageLevel}`, "SUCCESS");
                  return result.pageLevel;
              }
          } catch(e) {
              log(`Error calling PLD v22.55 detectForPrompt: ${e.message}`, "WARN");
          }
      }

      // FALLBACK: detect() biasa
      if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
          try {
              const level = window.pageLevelDetectorv22.detect();
              if (level) {
                  log(`📌 Page Level from PLD detect(): ${level}`, "SUCCESS");
                  return level;
              }
          } catch(e) {}
      }

      const bodyLevel = document.body.getAttribute('data-page-level') || document.body.getAttribute('data-schema-page-level');
      if (bodyLevel) return bodyLevel;

      return detectPageLevelFallback();
  }

  function detectPageLevelFallback() {
      const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
      const title = document.title.toLowerCase();
      const url = location.href.toLowerCase();
      const combined = h1 + " " + title + " " + url;
      
      // CEK VARIANT dengan spesifikasi per entity
      const entityType = getEntityTypeFromPLD();
      const specResult = checkEntitySpecification(combined, entityType);
      
      if (specResult.isSpec) {
          if (/\d+\s*(m|mm|cm|meter|kg|ton|inch|inci|k|m3|liter)/gi.test(combined)) {
              log('🔬 SUB-VARIANT terdeteksi (fallback)', "SUCCESS");
              return "sub-variant";
          }
          log('🔬 VARIANT terdeteksi (fallback)', "SUCCESS");
          return "variant";
      }

      const locations = ["jakarta", "bekasi", "bogor", "depok", "tangerang", "karawang", "surabaya", "bandung", "cirebon", "ciamis"];
      for (let loc of locations) {
          if (combined.includes(loc)) {
              log('📍 MONEY_CHILD terdeteksi (fallback)', "SUCCESS");
              return "money-child";
          }
      }

      const hasPrice = /\b(harga|biaya|tarif|estimasi)\b/i.test(combined);
      if (hasPrice) {
          log('💰 MONEY_PAGE terdeteksi (fallback)', "SUCCESS");
          return "money-page";
      }

      if (/\b(jasa|sewa|borongan)\b/i.test(combined) && !/\b(panduan|tips|cara)\b/i.test(combined)) {
          log('🏛️ MONEY_MASTER terdeteksi (fallback)', "SUCCESS");
          return "money-master";
      }

      if (/\b(daftar|jenis|kategori)\b/i.test(combined)) return "sub-pillar-tipe-2";
      if (/\b(perbandingan|vs|versus)\b/i.test(combined)) return "sub-pillar-tipe-1";

      return "pillar";
  }

  // ============================================================
  // 🔥🔥🔥 DETEKSI FOKUS KONTEN (V4.74 — COMMERCIAL & GABUNG) 🔥🔥🔥
  // ============================================================

  function detectContentFocus() {
      const h1 = document.querySelector('h1')?.innerText?.toLowerCase() || '';
      const h1Text = h1;
      const title = document.title?.toLowerCase() || '';
      const content = document.querySelector('.post-body.entry-content, .post-body, article, main, section')?.innerText?.toLowerCase() || '';
      const url = location.href.toLowerCase();
      const combined = h1Text + ' ' + title + ' ' + content + ' ' + url;

      log(`🎯 Detecting content focus...`, "FOCUS");

      // 🔥 COMMERCIAL KEYWORDS
      const commercialKeywords = ['jual', 'beli', 'order', 'pesan', 'booking', 'dapatkan', 'pesan sekarang', 'order sekarang', 'beli sekarang', 'shop', 'toko', 'supplier', 'distributor'];
      const hasCommercial = commercialKeywords.some(k => combined.includes(k));

      // PRIORITAS 1: CEK H1
      const yearPattern = /\b(19|20)\d{2}\b/;
      const hasYear = yearPattern.test(h1Text);
      if (hasYear) {
          log(`🔴 PRIORITAS: H1 mengandung tahun → HARGA (non-evergreen)`, "PRIORITY");
          return 'harga';
      }

      const hasRpFormat = /Rp\s*[\d.,]+/.test(h1Text);
      if (hasRpFormat) {
          log(`🔴 PRIORITAS: H1 mengandung Rp → HARGA`, "PRIORITY");
          return 'harga';
      }

      const priceKeywordsInH1 = ['harga', 'biaya', 'tarif', 'estimasi', 'penawaran', 'promo', 'diskon'];
      const hasPriceInH1 = priceKeywordsInH1.some(k => h1Text.includes(k));
      const infoKeywordsInH1 = ['panduan', 'spesifikasi', 'keunggulan', 'cara memilih', 'tips', 'perbedaan', 'jenis', 'apa itu', 'pengertian'];
      const hasInfoInH1 = infoKeywordsInH1.some(k => h1Text.includes(k));

      // 🔥 CEK COMMERCIAL di H1
      if (hasCommercial && hasPriceInH1) {
          log(`🛒 PRIORITAS: H1 mengandung commercial + harga → COMMERCIAL`, "COMMERCIAL");
          return 'commercial';
      }

      if (hasCommercial && !hasPriceInH1 && !hasInfoInH1) {
          log(`🛒 PRIORITAS: H1 mengandung commercial → COMMERCIAL`, "COMMERCIAL");
          return 'commercial';
      }

      // 🔥 CEK GABUNG di H1
      if (hasPriceInH1 && hasCommercial && hasInfoInH1) {
          log(`📚 PRIORITAS: H1 mengandung harga + commercial + info → GABUNG`, "FOCUS");
          return 'gabung';
      }

      if (hasPriceInH1 && hasInfoInH1 && !hasCommercial) {
          log(`📚 PRIORITAS: H1 mengandung harga + info → GABUNG`, "FOCUS");
          return 'gabung';
      }

      if (hasPriceInH1) {
          log(`🔴 PRIORITAS: H1 mengandung kata harga → HARGA`, "PRIORITY");
          return 'harga';
      }

      const unitPattern = /per\s*(meter|lembar|batang|kubik|m|m2|m²|lbr|buah|unit)/;
      if (unitPattern.test(h1Text)) {
          log(`🔴 PRIORITAS: H1 mengandung satuan harga → HARGA`, "PRIORITY");
          return 'harga';
      }

      if (hasInfoInH1 && !hasPriceInH1 && !hasRpFormat && !hasYear) {
          log(`🔴 PRIORITAS: H1 mengandung kata informatif tanpa harga → INFORMASI`, "PRIORITY");
          return 'informasi';
      }

      // PRIORITAS 2: CEK TABEL HARGA
      const tables = document.querySelectorAll('table');
      let hasPriceTable = false;
      tables.forEach((table) => {
          const tableText = table.innerText.toLowerCase();
          const hasPriceColumn = /harga|biaya|estimasi|rp|rupiah|total|subtotal/i.test(tableText);
          const hasNumbers = (tableText.match(/[\d.,]+/g) || []).length >= 3;
          if (hasPriceColumn && hasNumbers) {
              hasPriceTable = true;
          }
      });
      if (hasPriceTable) {
          // CEK apakah ada commercial di tabel
          const tableText = document.querySelector('table')?.innerText?.toLowerCase() || '';
          if (commercialKeywords.some(k => tableText.includes(k))) {
              log(`🛒 Ada tabel harga + commercial → COMMERCIAL`, "COMMERCIAL");
              return 'commercial';
          }
          log(`🔴 PRIORITAS: Ada tabel harga → HARGA`, "PRIORITY");
          return 'harga';
      }

      // PRIORITAS 3: CEK KONTEN (SCORING)
      const eduKeywords = ['panduan', 'spesifikasi', 'keunggulan', 'ukuran', 'dimensi', 'cara memilih', 'tips', 'informasi', 'pengertian', 'definisi', 'jenis', 'macam', 'tipe', 'perbedaan', 'kelebihan', 'kekurangan', 'material', 'bahan', 'standar', 'mutu', 'k225', 'k250', 'k300'];
      const priceKeywords = ['harga', 'biaya', 'estimasi', 'tarif', 'mulai dari', 'per meter', 'per lembar', 'per kubik', 'per unit', 'promo', 'diskon', 'penawaran', 'daftar harga', 'tabel harga'];

      let eduScore = 0, priceScore = 0, commercialScore = 0;
      for (const kw of eduKeywords) { if (combined.includes(kw)) eduScore++; }
      for (const kw of priceKeywords) { if (combined.includes(kw)) priceScore++; }
      for (const kw of commercialKeywords) { if (combined.includes(kw)) commercialScore++; }

      const hasPriceCTA = document.querySelector('.cta-box, .cta-button, .btn-wa, [href*="wa.me"]')?.innerText?.toLowerCase()?.includes('harga') || false;
      if (hasPriceCTA) priceScore += 2;

      log(`📊 Edu: ${eduScore}, Price: ${priceScore}, Commercial: ${commercialScore}`, "FOCUS");

      // 🔥 CEK COMMERCIAL
      if (commercialScore >= 2 && priceScore >= 2) {
          log(`🛒 Commercial + Price → COMMERCIAL`, "COMMERCIAL");
          return 'commercial';
      }

      // 🔥 CEK GABUNG
      if (eduScore >= 2 && priceScore >= 2 && commercialScore >= 1) {
          log(`📚 Edu + Price + Commercial → GABUNG`, "FOCUS");
          return 'gabung';
      }

      if (eduScore >= 2 && priceScore >= 2) {
          log(`📚 Edu + Price → GABUNG`, "FOCUS");
          return 'gabung';
      }

      if (priceScore > eduScore * 1.5) {
          log(`🎯 Fokus: HARGA (price: ${priceScore}, edu: ${eduScore})`, "FOCUS");
          return 'harga';
      }

      if (eduScore > priceScore * 1.5) {
          log(`🎯 Fokus: INFORMASI (edu: ${eduScore}, price: ${priceScore})`, "FOCUS");
          return 'informasi';
      }

      if (eduScore < 2 && priceScore < 2) {
          const urlHasHarga = url.includes('harga') || url.includes('biaya') || url.includes('tarif');
          const urlHasCommercial = commercialKeywords.some(k => url.includes(k));
          if (urlHasCommercial) { log(`🛒 Fokus: COMMERCIAL (from URL)`, "COMMERCIAL"); return 'commercial'; }
          if (urlHasHarga) { log(`🎯 Fokus: HARGA (from URL)`, "FOCUS"); return 'harga'; }
      }

      log(`🎯 Fokus: INFORMASI (default)`, "FOCUS");
      return 'informasi';
  }

  // ============================================================
  // 🔥🔥🔥 FUNGSI PENDUKUNG 🔥🔥🔥
  // ============================================================

  function getColorConfig(level, focus) {
      const isMoneyLevel = ['money-master', 'money-page', 'money-child'].includes(level);
      
      const colors = {
          'pillar': { bg: '#0a2a44', text: '#ffffff', accent: '#25d366' },
          'sub-pillar-tipe-2': { bg: '#1a237e', text: '#ffffff', accent: '#25d366' },
          'sub-pillar-tipe-1': { bg: '#004d40', text: '#ffffff', accent: '#25d366' },
          'variant': { bg: '#4a148c', text: '#ffffff', accent: '#25d366' },
          'sub-variant': { bg: '#4e342e', text: '#ffffff', accent: '#25d366' }
      };

      if (isMoneyLevel) {
          if (focus === 'informasi') {
              return { bg: '#1a5a8c', text: '#ffffff', accent: '#25d366' };
          } else if (focus === 'commercial') {
              return { bg: '#8b0000', text: '#ffffff', accent: '#ffd700' };
          } else if (focus === 'gabung') {
              return { bg: '#4a148c', text: '#ffffff', accent: '#ffd700' };
          } else {
              return { bg: '#0a2a44', text: '#ffffff', accent: '#ffd700' };
          }
      }

      return colors[level] || colors['pillar'];
  }

  function lightenColor(hex, percent) {
      const num = parseInt(hex.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = Math.min(255, (num >> 16) + amt);
      const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
      const B = Math.min(255, (num & 0x0000FF) + amt);
      return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
  }

  function needYear(level) {
      const moneyLevels = ['money-master', 'money-page', 'money-child'];
      
      if (moneyLevels.includes(level)) {
          const focus = detectContentFocus();
          
          // ✅ INFORMASI → TANPA tahun
          if (focus === 'informasi') {
              log(`⏭️ ${level.toUpperCase()} INFORMASI → SKIP tahun (H1 TANPA tahun) — V37`, "YEAR");
              return false;
          }
          
          // ✅ HARGA, COMMERCIAL, GABUNG → WAJIB tahun
          if (focus === 'harga' || focus === 'commercial' || focus === 'gabung') {
              log(`✅ ${level.toUpperCase()} ${focus.toUpperCase()} → WAJIB tahun — V37`, "YEAR");
              return true;
          }
          
          // Default: HARGA → WAJIB tahun
          return true;
      }
      
      log(`⏭️ Level ${level} → TIDAK butuh tahun`, "YEAR");
      return false;
  }

  function getCurrentYear() {
      return new Date().getFullYear();
  }

  function extractYear(text) {
      const match = text.match(/\b(19|20)\d{2}\b/);
      return match ? parseInt(match[1]) : null;
  }

  function getAEDPriceValidUntil() {
      const aed = window.AEDMetaDates;
      if (aed && aed.nextUpdate) {
          return aed.nextUpdate;
      }
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  }

  // ============================================================
  // 🔥🔥🔥 UPDATE TAHUN 🔥🔥🔥
  // ============================================================

  function updateH1Year(pageLevel) {
      if (!needYear(pageLevel)) {
          log(`⏭️ Level ini TIDAK butuh tahun di H1 (${pageLevel})`, "YEAR");
          return false;
      }

      const currentYear = getCurrentYear();
      const h1 = document.querySelector('h1');
      if (!h1) {
          log(`⚠️ Tidak ada H1 ditemukan`, "WARN");
          return false;
      }

      const originalText = h1.innerText;
      const detectedYear = extractYear(originalText);

      if (detectedYear) {
          if (detectedYear < CONFIG.MIN_YEAR_TO_UPDATE) {
              log(`🛑 STOP: H1 mengandung tahun ${detectedYear} (< ${CONFIG.MIN_YEAR_TO_UPDATE})`, "STOP");
              return false;
          }
          if (detectedYear === 2025) {
              log(`🛑 STOP: H1 mengandung tahun ${detectedYear} (masih valid)`, "STOP");
              return false;
          }
          if (detectedYear > 2025) {
              const newText = originalText.replace(/\b(19|20)\d{2}\b/, currentYear);
              h1.innerText = newText;
              log(`✅ H1: Tahun diupdate ${detectedYear} → ${currentYear}`, "YEAR");
              return true;
          }
      }

      if (!detectedYear) {
          const newText = originalText + ' ' + currentYear;
          h1.innerText = newText;
          log(`✅ H1: Tahun ditambahkan → "${newText}"`, "YEAR");
          return true;
      }

      return true;
  }

  function updateContentYears() {
      const currentYear = getCurrentYear();
      let updated = 0;
      const yearPattern = /\b(202[6-9]|2030)\b/g;

      document.querySelectorAll('p, h2, h3, h4, li, td, th, figcaption, .post-body, .entry-content').forEach(el => {
          const text = el.innerText;
          if (text && yearPattern.test(text)) {
              const newText = text.replace(/\b(202[6-9]|2030)\b/g, currentYear);
              if (newText !== text) {
                  el.innerText = newText;
                  updated++;
              }
          }
      });

      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
          const content = metaDesc.getAttribute('content');
          if (content && yearPattern.test(content)) {
              const newContent = content.replace(/\b(202[6-9]|2030)\b/g, currentYear);
              if (newContent !== content) {
                  metaDesc.setAttribute('content', newContent);
                  updated++;
              }
          }
      }

      document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
          try {
              let content = script.textContent;
              if (content && yearPattern.test(content)) {
                  const newContent = content.replace(/\b(202[6-9]|2030)\b/g, currentYear);
                  if (newContent !== content) {
                      script.textContent = newContent;
                      updated++;
                  }
              }
          } catch(e) {}
      });

      return updated;
  }

  // ============================================================
  // 🔥🔥🔥 GET CLEAN PAGE NAME 🔥🔥🔥
  // ============================================================

  function getCleanPageName(level) {
      let cleanName = '';
      let path = window.location.pathname;
      path = path.replace(/^\/p\//, '');
      path = path.replace(/\/\d{4}\/\d{2}\//g, '/');
      path = path.replace(/\.html$/, '');
      let segments = path.split('/').filter(s => s.length > 0);
      let lastSegment = segments.length > 0 ? segments[segments.length - 1] : '';
      cleanName = lastSegment.replace(/[-_]+/g, ' ');
      cleanName = cleanName.replace(/\b\w/g, function(l) { return l.toUpperCase(); });
      cleanName = cleanName.replace(/\s\d+$/, '');
      if (level === 'pillar' || level === 'sub-pillar-tipe-1' || level === 'sub-pillar-tipe-2') {
          cleanName = cleanName.replace(/^(Harga|Jasa|Biaya|Tarif)\s*/i, '').trim();
      }
      if (cleanName.length < 3) {
          let h1Text = document.querySelector('h1')?.innerText?.trim();
          if (h1Text && h1Text.length > 3) {
              cleanName = h1Text
                  .replace(/\b(20[2-9][0-9])\b/g, '')
                  .replace(/\s*[–—\-|]\s*/g, ' ')
                  .replace(/^(Harga|Jasa|Biaya|Tarif|Estimasi)\s*/i, '')
                  .trim();
          }
      }
      if (cleanName.length < 3) {
          let title = document.title
              .replace(/\b(20[2-9][0-9])\b/g, '')
              .replace(/\s*[–—\-|]\s*/g, ' ')
              .trim();
          if (title.length > 3) cleanName = title;
      }
      if (cleanName.length < 3) cleanName = 'Halaman Utama';
      if (cleanName.length > 55) cleanName = cleanName.substring(0, 52) + '...';
      return cleanName;
  }

  // ============================================================
  // 🔥🔥🔥 CANVAS IMAGE GENERATOR 🔥🔥🔥
  // ============================================================

  if (!CanvasRenderingContext2D.prototype.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
          if (r > w/2) r = w/2;
          if (r > h/2) r = h/2;
          this.moveTo(x + r, y);
          this.lineTo(x + w - r, y);
          this.quadraticCurveTo(x + w, y, x + w, y + r);
          this.lineTo(x + w, y + h - r);
          this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          this.lineTo(x + r, y + h);
          this.quadraticCurveTo(x, y + h, x, y + h - r);
          this.lineTo(x, y + r);
          this.quadraticCurveTo(x, y, x + r, y);
          return this;
      };
  }

  function createImageWithText(pageName, level, year) {
      const isMoneyLevel = ['money-master', 'money-page', 'money-child'].includes(level);
      const focus = isMoneyLevel ? detectContentFocus() : null;
      const colors = getColorConfig(level, focus);
      
      const needYearFlag = needYear(level);
      const displayYear = needYearFlag ? ' ' + year : '';
      const fullText = pageName + displayYear;

      const width = 820;
      const height = 360;
      const padding = 40;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, colors.bg);
      gradient.addColorStop(0.5, colors.bg);
      gradient.addColorStop(1, lightenColor(colors.bg, 25));
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 3;
      const bPad = 15;
      ctx.strokeRect(bPad, bPad, width - (bPad * 2), height - (bPad * 2));

      const logoText = '🏗️ Beton Jaya Readymix';
      ctx.font = 'bold 18px Arial, sans-serif';
      const logoMetrics = ctx.measureText(logoText);
      const logoWidth = logoMetrics.width + 40;
      const logoHeight = 36;
      const logoX = (width - logoWidth) / 2;
      const logoY = padding - 10;

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoWidth, logoHeight, 18);
      ctx.fill();

      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(logoText, width / 2, padding + 8);

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padding, 72);
      ctx.lineTo(width - padding, 72);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let fontSize = 42;
      const textLength = fullText.length;
      if (textLength > 30) fontSize = 36;
      if (textLength > 40) fontSize = 32;
      if (textLength > 50) fontSize = 28;
      if (textLength > 60) fontSize = 24;

      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 3;

      const maxCharsPerLine = 24;
      const words = fullText.split(' ');
      let lines = [];
      let currentLine = '';

      for (let word of words) {
          if (currentLine.length + word.length + 1 <= maxCharsPerLine) {
              currentLine += (currentLine ? ' ' : '') + word;
          } else {
              if (currentLine) lines.push(currentLine);
              currentLine = word;
          }
      }
      if (currentLine) lines.push(currentLine);

      if (lines.length > 3) {
          const combined = fullText;
          lines = [];
          let idx = 0;
          while (idx < combined.length) {
              let end = Math.min(idx + maxCharsPerLine, combined.length);
              let lastSpace = combined.lastIndexOf(' ', end);
              if (lastSpace > idx && end < combined.length) end = lastSpace;
              lines.push(combined.substring(idx, end).trim());
              idx = end + 1;
              if (lines.length >= 3) {
                  if (idx < combined.length) {
                      lines[2] = lines[2] + '...';
                  }
                  break;
              }
          }
      }

      const centerY = height / 2 + 8;

      if (lines.length === 1) {
          ctx.font = `bold ${fontSize + 8}px Arial, sans-serif`;
          ctx.fillStyle = colors.text;
          ctx.fillText(lines[0], width / 2, centerY);
      } else if (lines.length === 2) {
          const lineHeight = fontSize + 14;
          ctx.font = `bold ${fontSize}px Arial, sans-serif`;
          ctx.fillStyle = colors.text;
          ctx.fillText(lines[0], width / 2, centerY - (lineHeight / 2));
          ctx.fillText(lines[1], width / 2, centerY + (lineHeight / 2));
      } else {
          const lineHeight = fontSize + 12;
          const startY = centerY - ((lines.length - 1) * lineHeight / 2);
          ctx.font = `bold ${fontSize}px Arial, sans-serif`;
          ctx.fillStyle = colors.text;
          lines.forEach((line, i) => {
              ctx.fillText(line, width / 2, startY + (i * lineHeight));
          });
      }

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      const watermarkText = '© Beton Jaya Readymix';
      ctx.font = '13px Arial, sans-serif';
      const wmMetrics = ctx.measureText(watermarkText);
      const wmWidth = wmMetrics.width + 30;
      const wmHeight = 28;
      const wmX = (width - wmWidth) / 2;
      const wmY = height - padding + 2;

      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.roundRect(wmX, wmY, wmWidth, wmHeight, 14);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '13px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(watermarkText, width / 2, height - padding + 16);

      return canvas.toDataURL('image/png');
  }

  // ============================================================
  // 🔥🔥🔥 RESPONSIVE STYLES 🔥🔥🔥
  // ============================================================

  function applyResponsiveStyles(figure, img) {
      figure.style.padding = '1em 0px';
      figure.style.margin = '20px 0';
      figure.style.textAlign = 'center';
      figure.style.background = '#f8fafc';
      figure.style.borderRadius = '12px';
      figure.style.width = '100%';
      figure.style.maxWidth = '100%';
      figure.style.display = 'block';
      figure.style.overflow = 'hidden';

      img.style.width = '100%';
      img.style.maxWidth = '820px';
      img.style.height = 'auto';
      img.style.aspectRatio = '820/360';
      img.style.objectFit = 'contain';
      img.style.borderRadius = '8px';
      img.style.display = 'block';
      img.style.margin = '0 auto';
      img.style.padding = '0 10px';
      img.style.boxSizing = 'border-box';

      const styleId = 'responsive-image-style-v474';
      if (!document.getElementById(styleId)) {
          const style = document.createElement('style');
          style.id = styleId;
          style.textContent = `
              @media (max-width: 820px) {
                  figure[data-auto-figure="true"] img {
                      max-width: 100% !important;
                      height: auto !important;
                      aspect-ratio: auto !important;
                  }
                  figure[data-auto-figure="true"] {
                      padding: 0.5em 0px !important;
                      margin: 10px 0 !important;
                  }
              }
              @media (max-width: 480px) {
                  figure[data-auto-figure="true"] figcaption {
                      font-size: 12px !important;
                      padding: 0 10px !important;
                  }
              }
          `;
          document.head.appendChild(style);
      }
      figure.setAttribute('data-auto-figure', 'true');
  }

  // ============================================================
  // 🔥🔥🔥 FIX IMAGES 🔥🔥🔥
  // ============================================================

  function fixImagesToFormat1() {
      log('Checking images in content...', "IMAGE");
      
      const pageLevel = getPageLevelFromPLD();
      const currentYear = getCurrentYear();
      const needYearFlag = needYear(pageLevel);
      const pageName = getCleanPageName(pageLevel);
      const displayName = needYearFlag ? pageName + ' ' + currentYear : pageName;

      function getImageInsertionPoint() {
          let article = document.querySelector('article');
          if (!article) {
              const candidates = ['.post-body', 'main', '.content', '.entry-content', '.post-content', '.article-content', '.blog-post'];
              for (let selector of candidates) {
                  const el = document.querySelector(selector);
                  if (el) { article = el; break; }
              }
          }
          if (!article) {
              const h1 = document.querySelector('h1');
              if (h1) article = h1.closest('section, div, main');
          }
          if (!article) article = document.body;

          const badge = article.querySelector('.update-badge, .update-badge-class, [class*="update-badge"]');
          if (badge && badge.parentElement === article) {
              return { container: article, referenceNode: badge, position: 'after' };
          }

          const firstChild = article.firstElementChild;
          if (firstChild && firstChild.tagName === 'H1') {
              return { container: article, referenceNode: firstChild, position: 'after' };
          }

          return { container: article, referenceNode: null, position: 'first' };
      }

      let targetImage = null;
      let targetFigure = null;

      const h1Element = document.querySelector('h1');
      if (h1Element) {
          const article = h1Element.closest('article, .post-body, main, section, div');
          if (article) {
              const siblings = article.children;
              let foundH1 = false;
              for (let i = 0; i < siblings.length; i++) {
                  if (siblings[i] === h1Element) { foundH1 = true; continue; }
                  if (foundH1) {
                      const img = siblings[i].querySelector('img');
                      if (img) {
                          targetImage = img;
                          targetFigure = siblings[i].tagName === 'FIGURE' ? siblings[i] : siblings[i].closest('figure');
                          break;
                      }
                      if (siblings[i].tagName === 'FIGURE' && siblings[i].querySelector('img')) {
                          targetImage = siblings[i].querySelector('img');
                          targetFigure = siblings[i];
                          break;
                      }
                  }
              }
          }
      }

      if (!targetImage) {
          const contentAreas = document.querySelectorAll('article, section, .post-body, main, .content, .entry-content');
          for (const area of contentAreas) {
              const img = area.querySelector('img:not([src*="logo"]):not([src*="icon"]):not([src*="avatar"])');
              if (img) {
                  targetImage = img;
                  targetFigure = img.closest('figure');
                  break;
              }
          }
      }

      const autoImageDataUrl = createImageWithText(pageName, pageLevel, currentYear);
      const captionText = '📊 ' + displayName;

      if (targetImage) {
          log('Image found in content, fixing for SEO...', "IMAGE");

          const img = targetImage;
          const figure = targetFigure || img.closest('figure');

          const currentSrc = img.src || '';
          if (currentSrc.includes('No_Image') || currentSrc.includes('placeholder') || !currentSrc) {
              img.src = autoImageDataUrl;
              log('Image src replaced with auto-generated', "IMAGE");
          } else {
              log('Existing image preserved, only updating attributes', "IMAGE");
          }

          img.alt = displayName;
          img.title = displayName;
          img.setAttribute('loading', 'lazy');
          img.setAttribute('decoding', 'async');
          img.setAttribute('data-auto-generated', 'true');
          img.setAttribute('data-page-level', pageLevel);
          img.setAttribute('data-year', currentYear);

          if (figure && figure.tagName === 'FIGURE') {
              applyResponsiveStyles(figure, img);

              let figcaption = figure.querySelector('figcaption');
              if (!figcaption) {
                  figcaption = document.createElement('figcaption');
                  figcaption.style.color = '#555';
                  figcaption.style.fontSize = '14px';
                  figcaption.style.marginTop = '10px';
                  figcaption.style.padding = '0 20px';
                  figcaption.style.textAlign = 'center';
                  figcaption.textContent = captionText;
                  figure.appendChild(figcaption);
              } else {
                  figcaption.textContent = captionText;
                  figcaption.style.color = '#555';
                  figcaption.style.fontSize = '14px';
                  figcaption.style.marginTop = '10px';
                  figcaption.style.padding = '0 20px';
                  figcaption.style.textAlign = 'center';
              }
          } else {
              log('Wrapping image with FIGURE...', "IMAGE");
              const newFigure = document.createElement('figure');
              const parent = img.parentElement;
              parent.insertBefore(newFigure, img);
              newFigure.appendChild(img);

              const figcaption = document.createElement('figcaption');
              figcaption.style.color = '#555';
              figcaption.style.fontSize = '14px';
              figcaption.style.marginTop = '10px';
              figcaption.style.padding = '0 20px';
              figcaption.style.textAlign = 'center';
              figcaption.textContent = captionText;
              newFigure.appendChild(figcaption);
              applyResponsiveStyles(newFigure, img);
          }

          log('✅ Image fixed with SEO FIGURE', "SUCCESS");
          return figure;
      }

      log('No image found, creating new responsive FIGURE...', "IMAGE");

      const insertPoint = getImageInsertionPoint();
      const figure = document.createElement('figure');
      const img = document.createElement('img');

      img.src = autoImageDataUrl;
      img.alt = displayName;
      img.title = displayName;
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
      img.setAttribute('data-auto-generated', 'true');
      img.setAttribute('data-page-level', pageLevel);
      img.setAttribute('data-year', currentYear);

      const figcaption = document.createElement('figcaption');
      figcaption.style.color = '#555';
      figcaption.style.fontSize = '14px';
      figcaption.style.marginTop = '10px';
      figcaption.style.padding = '0 20px';
      figcaption.style.textAlign = 'center';
      figcaption.textContent = captionText;

      figure.appendChild(img);
      figure.appendChild(figcaption);
      applyResponsiveStyles(figure, img);

      if (insertPoint.referenceNode && insertPoint.position === 'after') {
          insertPoint.container.insertBefore(figure, insertPoint.referenceNode.nextSibling);
      } else {
          insertPoint.container.insertBefore(figure, insertPoint.container.firstChild);
      }

      log('✅ New responsive FIGURE created', "SUCCESS");
      return figure;
  }

  // ============================================================
  // 🔥🔥🔥 IS IMAGE ELIGIBLE (V4.74 — COMMERCIAL & GABUNG) 🔥🔥🔥
  // ============================================================

  function isImageEligible(pageLevel) {
      log(`Checking image eligibility for page level: ${pageLevel}`, "IMAGE");

      const moneyLevels = ['money-master', 'money-page', 'money-child'];
      
      if (moneyLevels.includes(pageLevel)) {
          const focus = detectContentFocus();
          
          // ✅ INFORMASI → OPSIONAL
          if (focus === 'informasi') {
              log(`⏭️ ${pageLevel.toUpperCase()} INFORMASI → GAMBAR OPSIONAL (tidak wajib) — V37`, "SKIP");
              // Lanjutkan ke pengecekan lain
          } 
          // ✅ HARGA/COMMERCIAL/GABUNG → WAJIB
          else {
              log(`✅ ${pageLevel.toUpperCase()} ${focus.toUpperCase()} → WAJIB GAMBAR — TANPA SYARAT — V37`, "SUCCESS");
              return true;
          }
      }

      // Variant & Sub-Variant → WAJIB
      if (pageLevel === 'variant' || pageLevel === 'sub-variant') {
          log(`✅ ${pageLevel} → WAJIB GAMBAR — TANPA SYARAT`, "SUCCESS");
          return true;
      }

      // Pillar → Tergantung konten
      if (pageLevel === 'pillar') {
          const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
          const title = document.title.toLowerCase();
          const combined = h1 + " " + title;

          const pillarEdukasi = ["panduan", "tips", "cara", "apa itu", "pengertian", "definisi", "overview", "komprehensif", "langkah", "tutorial", "pedoman", "petunjuk", "kenali", "mengenal", "memahami", "belajar"];
          for (let keyword of pillarEdukasi) {
              if (combined.includes(keyword)) {
                  log(`⏭️ Skip gambar: Pillar edukasi murni (keyword: "${keyword}")`, "SKIP");
                  return false;
              }
          }
          return true;
      }

      // Sub-Pillar → Tergantung panjang konten
      if (pageLevel === 'sub-pillar-tipe-1' || pageLevel === 'sub-pillar-tipe-2') {
          const content = document.querySelector(".post-body.entry-content, .post-body, article, main")?.innerText || "";
          const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
          if (wordCount < CONFIG.SKIP_WORD_COUNT) {
              log(`⏭️ Skip gambar: Sub-Pillar konten terlalu pendek (${wordCount} kata)`, "SKIP");
              return false;
          }
          log(`✅ LAYAK GAMBAR (level: ${pageLevel})`, "SUCCESS");
          return true;
      }

      // Default: cek panjang konten
      const content = document.querySelector(".post-body.entry-content, .post-body, article, main")?.innerText || "";
      const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
      if (wordCount < CONFIG.SKIP_WORD_COUNT) {
          log(`⏭️ Skip gambar: Konten terlalu pendek (${wordCount} kata)`, "SKIP");
          return false;
      }

      log(`⏭️ Skip gambar: Halaman tidak masuk kriteria layak`, "SKIP");
      return false;
  }

  // ============================================================
  // 🔥🔥🔥 SCHEMA FUNCTIONS 🔥🔥🔥
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
          "Kabupaten Bekasi": "Jawa Barat",
          "Kota Bekasi": "Jawa Barat",
          "Kabupaten Karawang": "Jawa Barat"
      };
      return Object.keys(areaProv).map(a => ({ "@type": "Place", name: a }));
  }

  function getParentFromBreadcrumbs(currentUrl) {
      const breadcrumbSelectors = [
          '.breadcrumbs a', '.breadcrumb a', '.nav-trail a',
          '.breadcrumb-item a', '.crumbs a', '.breadcrumb-link',
          '[aria-label="breadcrumb"] a', '.post-breadcrumb a',
          '.breadcrumb-nav a', '.nav-breadcrumb a'
      ];

      let breadcrumbLinks = [];
      for (let selector of breadcrumbSelectors) {
          const links = document.querySelectorAll(selector);
          if (links.length > 0) { breadcrumbLinks = Array.from(links); break; }
      }

      if (breadcrumbLinks.length === 0) {
          const nav = document.querySelector('nav');
          if (nav) {
              const links = nav.querySelectorAll('a');
              if (links.length > 1) breadcrumbLinks = Array.from(links);
          }
      }

      if (breadcrumbLinks.length > 0) {
          const validLinks = breadcrumbLinks.filter(a => {
              const href = a.href || '';
              const text = a.innerText?.trim() || '';
              if (!href || !text) return false;
              if (href === currentUrl || href.includes(currentUrl)) return false;
              if (text.toLowerCase() === 'home' || text.toLowerCase() === 'beranda') {
                  if (breadcrumbLinks.length === 1) return true;
                  return false;
              }
              return true;
          });

          if (validLinks.length > 0) {
              const parentLink = validLinks[validLinks.length - 1];
              return { parentUrl: parentLink.href, parentName: parentLink.innerText?.trim() || 'Parent Page' };
          }
      }

      return { parentUrl: location.origin, parentName: 'Home' };
  }

  function detectProductName(pageLevel) {
      const h1 = document.querySelector("h1")?.innerText?.trim();
      if (h1 && h1.length < 120) return h1;
      
      const pathKey = location.pathname.split("/").pop().replace(".html", "").replace(/-/g, " ");
      
      const urlMapping = {
          "pagar panel beton polosan": "Pagar Panel Beton Polosan",
          "pagar panel beton motif": "Pagar Panel Beton Motif",
          "pagar panel beton custom": "Pagar Panel Beton Custom",
          "pagar panel beton": "Pagar Panel Beton",
          "u ditch": "U-Ditch",
          "box culvert": "Box Culvert",
          "kanstin beton": "Kanstin Beton",
          "paving block": "Paving Block",
          "beton readymix": "Beton Readymix",
          "besi beton": "Besi Beton",
          "baja ringan": "Baja Ringan"
      };
      
      let productName = urlMapping[pathKey.toLowerCase()];
      if (!productName && pathKey && pathKey.length > 0 && pathKey.length < 80) {
          productName = pathKey.replace(/\b\w/g, l => l.toUpperCase());
      }
      
      return productName || "Produk Konstruksi";
  }

  function detectProductCategory(pageLevel) {
      const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
      const title = document.title.toLowerCase();
      const url = location.href.toLowerCase();
      const combined = h1 + " " + title + " " + url;
      
      if (/(beton|readymix|ready mix|cor|concrete)/i.test(combined)) return "ConcreteProduct";
      if (/(paving|block|conblock|grassblock|paving\s*block)/i.test(combined)) return "PavingProduct";
      if (/(pagar|panel|booth|gorong|box|culvert|u-ditch|kanstin|kansteen)/i.test(combined)) return "PrecastProduct";
      if (/(besi|baja|pipa|atap|genteng|baja\s*ringan|besi\s*beton)/i.test(combined)) return "SteelProduct";
      if (pageLevel === 'variant' || pageLevel === 'sub-variant') return "VariantProduct";
      return "BuildingMaterial";
  }

  // ============================================================
  // 🔥🔥🔥 ENHANCED VARIANT SPEC EXTRACTION 🔥🔥🔥
  // ============================================================

  function extractVariantSpecEnhanced(text) {
      const spec = {};
      const lower = text.toLowerCase();
      
      // CEK MUTU
      for (const mutu of PRODUK_SPECS.mutu) {
          if (lower.includes(mutu)) {
              spec.mutu = mutu.toUpperCase();
          }
      }
      
      // CEK FINISHING
      for (const finishing of PRODUK_SPECS.finishing) {
          if (lower.includes(finishing)) {
              spec.finishing = finishing;
          }
      }
      
      // CEK DIMENSI
      const sizeMatch = text.match(/(\d{1,3}\s*[x×]\s*\d{1,3})\s*(cm|meter|m)/i);
      if (sizeMatch) spec.ukuran = sizeMatch[1] + " " + sizeMatch[2];
      
      const heightMatch = text.match(/tinggi\s*([\d.]+)\s*(meter|m|cm)/i);
      if (heightMatch) spec.tinggi = heightMatch[1] + " " + heightMatch[2];
      
      const thickMatch = text.match(/tebal\s*([\d.]+)\s*(cm|mm)/i);
      if (thickMatch) spec.tebal = thickMatch[1] + " " + thickMatch[2];
      
      if (Object.keys(spec).length === 0) return null;
      return spec;
  }

  // ============================================================
  // 🔥🔥🔥 GENERATE FAQ SCHEMA 🔥🔥🔥
  // ============================================================

  function generateFAQSchema(cleanUrl) {
      const faqItems = [];
      const faqElements = document.querySelectorAll('.faq-item, .faq-question, .faq-answer, [class*="faq"]');
      
      faqElements.forEach(el => {
          const question = el.querySelector('.faq-question, .question, [class*="question"]')?.innerText?.trim();
          const answer = el.querySelector('.faq-answer, .answer, [class*="answer"]')?.innerText?.trim();
          if (question && answer && question.length > 5 && answer.length > 10) {
              faqItems.push({
                  "@type": "Question",
                  "name": question,
                  "acceptedAnswer": {
                      "@type": "Answer",
                      "text": answer
                  }
              });
          }
      });

      if (faqItems.length >= 3) {
          log(`✅ FAQ Schema: ${faqItems.length} questions`, "FAQ");
          return {
              "@type": "FAQPage",
              "@id": cleanUrl + "#faq",
              "mainEntity": faqItems
          };
      }
      log(`⏭️ FAQ Schema: Hanya ${faqItems.length} pertanyaan (minimal 3)`, "SKIP");
      return null;
  }

  // ============================================================
  // 🔥🔥🔥 GENERATE BREADCRUMB SCHEMA 🔥🔥🔥
  // ============================================================

  function generateBreadcrumbSchema(cleanUrl) {
      const breadcrumbLinks = document.querySelectorAll('.breadcrumbs a, .breadcrumb a, .nav-trail a, .breadcrumb-item a, .crumbs a, [aria-label="breadcrumb"] a');
      if (breadcrumbLinks.length > 1) {
          const itemListElement = [];
          breadcrumbLinks.forEach((link) => {
              const name = link.innerText?.trim() || '';
              if (name && name.toLowerCase() !== 'home' && name.toLowerCase() !== 'beranda' && name.length > 1) {
                  itemListElement.push({
                      "@type": "ListItem",
                      "position": itemListElement.length + 1,
                      "name": name,
                      "item": link.href
                  });
              }
          });
          if (itemListElement.length > 0) {
              log(`🍞 Breadcrumb Schema: ${itemListElement.length} items`, "BREADCRUMB");
              return {
                  "@type": "BreadcrumbList",
                  "@id": cleanUrl + "#breadcrumb",
                  "itemListElement": itemListElement
              };
          }
      }
      log(`⏭️ Breadcrumb Schema: Tidak cukup link`, "SKIP");
      return null;
  }

  // ============================================================
  // 🔥🔥🔥 GENERATE SERVICE SCHEMA (JASA/SEWA) 🔥🔥🔥
  // ============================================================

  function generateServiceSchema(cleanUrl, entityType, productName, desc, areaServed, offers) {
      if (entityType !== 'jasa' && entityType !== 'sewa') {
          log(`⏭️ Service Schema: Entity ${entityType} bukan jasa/sewa`, "SKIP");
          return null;
      }
      
      const serviceNode = {
          "@type": "Service",
          "@id": cleanUrl + "#service",
          name: productName,
          description: desc,
          serviceType: entityType === 'jasa' ? 'ConstructionService' : 'RentalService',
          areaServed: areaServed,
          provider: { "@id": "https://www.betonjayareadymix.com/#localbusiness" },
          brand: { "@type": "Brand", name: "Beton Jaya Readymix" }
      };
      
      if (offers && offers.length > 0) {
          const prices = offers.map(o => o.price).filter(p => p > 0);
          if (prices.length > 0) {
              const priceValidUntil = getAEDPriceValidUntil();
              serviceNode.offers = {
                  "@type": "AggregateOffer",
                  lowPrice: Math.min(...prices),
                  highPrice: Math.max(...prices),
                  offerCount: offers.length,
                  priceCurrency: "IDR",
                  priceValidUntil: priceValidUntil
              };
          }
      }
      
      log(`✅ Service Schema (${entityType})`, "SERVICE");
      return serviceNode;
  }

  // ============================================================
  // 🔥🔥🔥 OFFER PARSING 🔥🔥🔥
  // ============================================================

  const seenItems = new Set();
  const offers = [];

  function addOffer(name, price) {
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
      
      const priceValidUntil = getAEDPriceValidUntil();
      
      offers.push({
          "@type": "Offer",
          name: cleanName,
          url: location.href,
          priceCurrency: "IDR",
          price: price,
          priceValidUntil: priceValidUntil,
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: { "@id": "https://www.betonjayareadymix.com/#localbusiness" }
      });
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
                      if (productCell.toLowerCase().includes('produk') || productCell.toLowerCase().includes('jenis') || priceCell.toLowerCase().includes('harga')) continue;
                      const price = extractPrice(priceCell);
                      if (price && productCell && productCell.length > 0 && productCell.length < 150) {
                          const isEstimasi = productCell.toLowerCase().includes('estimasi') || priceCell.toLowerCase().includes('estimasi');
                          if (!isEstimasi) { addOffer(productCell, price); found = true; }
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
              if (productText.length > 0 && productText.length < 150) tempOffers.push({ name: productText, price: price });
          }
      }
      const seen = new Set();
      for (const offer of tempOffers) {
          const key = offer.name + "|" + offer.price;
          if (!seen.has(key) && offers.length < 5) { seen.add(key); addOffer(offer.name, offer.price); }
      }
  }

  // ============================================================
  // 🔥🔥🔥 SHOULD SKIP PRODUCT SCHEMA 🔥🔥🔥
  // ============================================================

  function shouldSkipProductSchema(pageLevel) {
      const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
      const title = document.title.toLowerCase();
      const url = location.href.toLowerCase();
      const combined = h1 + " " + title + " " + url;
      
      const isProduct = /(beton|readymix|precast|paving|panel|box|u-ditch|kanstin|gorong|material|bahan|besi|baja|pipa|atap|genteng|keramik|marmer|granit|kayu|pintu|jendela|kusen|pagar\s*panel|paving\s*block|box\s*culvert|u\s*ditch)/i.test(combined);
      if (isProduct) return false;
      if (pageLevel === 'variant' || pageLevel === 'sub-variant') return false;
      
      const pillarPatterns = ["panduan lengkap", "pengertian", "definisi", "apa itu", "overview", "komprehensif", "cara memilih", "tips memilih"];
      for (let pattern of pillarPatterns) {
          if (h1.includes(pattern) || title.includes(pattern) || url.includes(pattern)) return true;
      }
      
      return false;
  }

  // ============================================================
  // 🚀 MAIN FUNCTION — V4.74 🔥🔥🔥
  // ============================================================

  async function init() {
      log("═══════════════════════════════════════════════════", "INFO");
      log("AutoSchema Hybrid v4.74 — V37 COMPLIANT + PLD v22.55", "INFO");
      log("═══════════════════════════════════════════════════", "INFO");
      
      // ============================================================
      // STEP 1: TUNGGU BREADCRUMB
      // ============================================================
      log("🍞 Menunggu breadcrumb...", "BREADCRUMB");
      const breadcrumbReady = await waitForBreadcrumb(CONFIG.BREADCRUMB_TIMEOUT);
      log(`🍞 Breadcrumb: ${breadcrumbReady ? '✅ READY' : '⏰ TIMEOUT'}`, "BREADCRUMB");
      
      // ============================================================
      // STEP 2: TUNGGU PLD
      // ============================================================
      log("⏳ Menunggu PLD...", "INFO");
      await waitForPLD();
      
      // ============================================================
      // STEP 3: TUNGGU AEDMetaDates
      // ============================================================
      log("⏳ Menunggu AEDMetaDates...", "AED");
      const aed = await waitForAEDMetaDates(CONFIG.AED_TIMEOUT);
      
      if (aed) {
          log(`✅ AED ready: ${aed.dateModified}`, "AED");
          log(`   📅 nextUpdate: ${aed.nextUpdate}`, "AED");
      } else {
          log(`⚠️ AED tidak tersedia, gunakan fallback`, "WARN");
      }
      
      // ============================================================
      // STEP 4: DAPATKAN PAGE LEVEL & ENTITY TYPE
      // ============================================================
      const pageLevel = getPageLevelFromPLD();
      const entityType = getEntityTypeFromPLD();
      const focus = ['money-master', 'money-page', 'money-child'].includes(pageLevel) ? detectContentFocus() : 'N/A';
      
      log(`📌 Page Level: ${pageLevel}`, "SUCCESS");
      log(`📌 Entity Type: ${entityType}`, "SUCCESS");
      log(`📌 Content Focus: ${focus}`, "FOCUS");

      // ============================================================
      // STEP 5: UPDATE TAHUN
      // ============================================================
      log("📅 UPDATE TAHUN DI KONTEN:", "YEAR");
      const h1Updated = updateH1Year(pageLevel);
      const contentUpdated = updateContentYears();
      
      if (!h1Updated && contentUpdated === 0) {
          log(`📅 Tidak ada perubahan tahun yang dilakukan`, "YEAR");
      }

      // ============================================================
      // STEP 6: GAMBAR
      // ============================================================
      let imageUrl = LOGO_IMAGE;
      const isEligible = isImageEligible(pageLevel);
      
      if (isEligible) {
          log(`✅ Halaman LAYAK mendapat gambar, memproses...`, "IMAGE");
          try {
              const fixedFigure = fixImagesToFormat1();
              if (fixedFigure) {
                  const img = fixedFigure.querySelector('img');
                  if (img) imageUrl = img.src || LOGO_IMAGE;
              }
          } catch(e) {
              log(`Error processing images: ${e.message}`, "ERROR");
              imageUrl = LOGO_IMAGE;
          }
      } else {
          log(`⏭️ Halaman TIDAK LAYAK mendapat gambar`, "SKIP");
          const existingImage = document.querySelector('img:not([src*="logo"]):not([src*="icon"]):not([src*="avatar"])');
          if (existingImage) {
              imageUrl = existingImage.src || LOGO_IMAGE;
          }
      }

      // ============================================================
      // STEP 7: PRODUCT SCHEMA
      // ============================================================
      if (shouldSkipProductSchema(pageLevel)) {
          log("Product schema SKIPPED untuk halaman ini", "SKIP");
          return;
      }
      
      const currentUrl = location.href.replace(/[?&]m=1/, "");
      const parentData = getParentFromBreadcrumbs(currentUrl);
      const parentUrls = [{
          "@type": "WebPage",
          "@id": parentData.parentUrl,
          name: parentData.parentName
      }];
      
      const productName = detectProductName(pageLevel);
      const desc = document.querySelector('meta[name="description"]')?.content?.trim() || 
                   document.querySelector("article p, main p, section p")?.innerText?.trim()?.substring(0, 300) ||
                   `Produk ${productName} berkualitas dari Beton Jaya Readymix`;
      
      const areaServed = getAreaServed();
      const productCategory = detectProductCategory(pageLevel);
      
      log("Parsing offers...", "INFO");
      let hasTableOffers = parseTableOffers();
      if (!hasTableOffers || offers.length === 0) {
          parseListOffers();
      }
      
      if (offers.length === 0) {
          log("Tidak ada harga ditemukan", "WARN");
      }
      
      const business = {
          "@type": "LocalBusiness",
          "@id": "https://www.betonjayareadymix.com/#localbusiness",
          name: "Beton Jaya Readymix",
          url: "https://www.betonjayareadymix.com",
          logo: LOGO_IMAGE
      };
      
      // ============================================================
      // BUILD GRAPH
      // ============================================================
      const graph = [];
      
      // 1. LocalBusiness
      graph.push(business);
      
      // 2. WebPage
      graph.push({
          "@type": "WebPage",
          "@id": currentUrl + "#webpage",
          url: currentUrl,
          name: productName,
          description: desc,
          image: imageUrl,
          isPartOf: parentUrls,
          dateModified: aed && aed.dateModified ? aed.dateModified : new Date().toISOString(),
          inLanguage: "id"
      });
      
      // 3. Product
      const product = {
          "@type": "Product",
          "@id": currentUrl + "#product",
          name: productName,
          image: [imageUrl || LOGO_IMAGE],
          description: desc,
          brand: { "@type": "Brand", name: "Beton Jaya Readymix" },
          category: productCategory,
          areaServed: areaServed,
          isPartOf: parentUrls
      };
      
      if (offers.length > 0) {
          product.offers = offers;
      }
      
      if (pageLevel === 'variant' || pageLevel === 'sub-variant') {
          product.productType = pageLevel === 'variant' ? "Variant" : "Sub-Variant";
          product.material = "Beton Precast";
          product.manufacturer = { "@type": "Organization", name: "Beton Jaya Readymix" };
          const variantSpec = extractVariantSpecEnhanced(productName + " " + desc);
          if (variantSpec) product.variant = variantSpec;
      }
      
      graph.push(product);
      
      // 4. Service Schema (Jasa/Sewa)
      const serviceSchema = generateServiceSchema(currentUrl, entityType, productName, desc, areaServed, offers);
      if (serviceSchema) {
          graph.push(serviceSchema);
      }
      
      // 5. FAQ Schema
      const faqSchema = generateFAQSchema(currentUrl);
      if (faqSchema) {
          graph.push(faqSchema);
      }
      
      // 6. Breadcrumb Schema
      const breadcrumbSchema = generateBreadcrumbSchema(currentUrl);
      if (breadcrumbSchema) {
          graph.push(breadcrumbSchema);
      }
      
      // ============================================================
      // INJECT SCHEMA
      // ============================================================
      const schema = {
          "@context": "https://schema.org",
          "@graph": graph
      };
      
      let existingScript = document.querySelector("#auto-schema-product");
      if (!existingScript) {
          existingScript = document.createElement("script");
          existingScript.type = "application/ld+json";
          existingScript.id = "auto-schema-product";
          document.head.appendChild(existingScript);
      }
      
      existingScript.textContent = JSON.stringify(schema, null, 2);
      
      // ============================================================
      // EXECUTION SUMMARY
      // ============================================================
      log("═══════════════════════════════════════════════════", "INFO");
      log("EXECUTION SUMMARY:", "INFO");
      log(`  Page Level      : ${pageLevel}`, "SUCCESS");
      log(`  Entity Type     : ${entityType}`, "SUCCESS");
      log(`  Content Focus   : ${focus}`, "FOCUS");
      log(`  Product Name    : ${productName}`, "SUCCESS");
      log(`  Offers Count    : ${offers.length}`, "SUCCESS");
      log(`  Image Eligible  : ${isEligible ? '✅' : '❌'}`, "IMAGE");
      log(`  Auto Year H1    : ${h1Updated ? '✅ UPDATE' : '⏭️ SKIP/STOP'}`, "YEAR");
      log(`  Content Year    : ${contentUpdated > 0 ? `✅ ${contentUpdated} elemen` : '⏭️ TIDAK ADA'}`, "YEAR");
      log(`  Service Schema  : ${serviceSchema ? '✅' : '❌'}`, "SERVICE");
      log(`  FAQ Schema      : ${faqSchema ? '✅' : '❌'}`, "FAQ");
      log(`  Breadcrumb Sch  : ${breadcrumbSchema ? '✅' : '❌'}`, "BREADCRUMB");
      log(`  Breadcrumb      : ${breadcrumbReady ? '✅ READY' : '⏰ TIMEOUT'}`, "BREADCRUMB");
      log(`  AED             : ${aed ? '✅ READY' : '❌ FALLBACK'}`, "AED");
      log(`  Money Level Info: ${focus === 'informasi' ? '✅ TANPA tahun (EVERGREEN)' : focus === 'commercial' ? '🛒 COMMERCIAL' : focus === 'gabung' ? '📚 GABUNG' : '✅ PAKAI tahun (NON-EVERGREEN)'}`, "FOCUS");
      log(`  V37 COMPLIANT   : ✅`, "SUCCESS");
      log(`  PLD v22.55      : ✅`, "SUCCESS");
      log("═══════════════════════════════════════════════════", "INFO");
      log("AutoSchema Hybrid v4.74 SELESAI", "SUCCESS");
  }
  
  // ============================================================
  // 🚀 START
  // ============================================================
  
  if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
          setTimeout(init, CONFIG.DELAY_MS);
      });
  } else {
      setTimeout(init, CONFIG.DELAY_MS);
  }
  
})();
