/**
 * AUTO-SCHEMA GENERATOR v4.0
 * DENGAN DETEKSI LEVEL HALAMAN (PILLAR / SUB-PILLAR / BRIDGE / MONEY)
 * 
 * UPDATE v4.0:
 * - Deteksi otomatis level halaman berdasarkan struktur konten
 * - PILLAR & SUB-PILLAR Tipe 2 → Article Schema
 * - BRIDGE PAGE (SUB-PILLAR Tipe 1) → HowTo Schema
 * - MONEY PAGE → WebPage / Service Schema
 * - Tidak ada lagi false positive untuk halaman edukasi
 * 
 * @version 4.0.0
 * @date 2025-01-15
 * @evergreen YES - tidak perlu update besar dalam 3-5 tahun
 */

(function() {
  "use strict";

  // ===================== KONFIGURASI =====================
  const CONFIG = {
    DEBUG: true,                    // Set ke false untuk production
    MIN_WORD_PILLAR: 600,          // Minimal kata untuk PILLAR
    MIN_WORD_SUB_PILLAR: 300,      // Minimal kata untuk SUB-PILLAR
    AED_TIMEOUT: 5000,             // Timeout menunggu AED MetaDates
    SITE_NAME: "Beton Jaya Readymix",
    SITE_URL: "https://www.betonjayareadymix.com"
  };

  // ===================== UTILS =====================
  function log(msg, type = "INFO") {
    if (!CONFIG.DEBUG && type === "INFO") return;
    const icons = {
      INFO: "📘",
      WARN: "⚠️",
      ERROR: "❌",
      SUCCESS: "✅",
      BRIDGE: "🌉",
      PILLAR: "🏛️",
      SUB: "📚",
      MONEY: "💰"
    };
    const prefix = icons[type] || "📘";
    console.log(`${prefix} [Schema v4.0] ${msg}`);
  }

  function cleanText(str) {
    if (!str) return "";
    return str.replace(/\s+/g, " ").trim();
  }

  function escapeJSON(str) {
    if (!str) return "";
    return str.replace(/\\/g, '\\\\')
              .replace(/"/g, '\\"')
              .replace(/\n/g, ' ')
              .replace(/\r/g, ' ')
              .replace(/</g, '\\u003c')
              .replace(/>/g, '\\u003e')
              .trim();
  }

  function getWordCount(element) {
    if (!element) return 0;
    const clone = element.cloneNode(true);
    clone.querySelectorAll("script, style, noscript, iframe, svg, [data-nosnippet]").forEach(el => el.remove());
    const text = clone.innerText || "";
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  // ===================== DETEKSI LEVEL HALAMAN =====================
  function detectPageLevel() {
    const url = location.href.toLowerCase();
    const h1 = document.querySelector("h1")?.innerText?.toLowerCase() || "";
    const title = document.title.toLowerCase();
    const content = document.querySelector(".post-body.entry-content") ||
                    document.querySelector("[id^='post-body-']") ||
                    document.querySelector(".post-body") ||
                    document.querySelector("article") ||
                    document.querySelector("main");
    const wordCount = content ? getWordCount(content) : 0;
    
    log(`Menganalisis halaman: H1="${h1.substring(0, 60)}..."`, "INFO");
    log(`Panjang konten: ${wordCount} kata`, "INFO");
    
    // 1. MONEY PAGE (TIDAK boleh Article)
    const moneyKeywords = [
      "konsultasi", "harga", "beli", "pesan", "order", 
      "quote", "penawaran", "form", "daftar harga", 
      "whatsapp", "call us", "hubungi kami", "request"
    ];
    
    for (let kw of moneyKeywords) {
      if (url.includes(kw) || h1.includes(kw) || title.includes(kw)) {
        log(`Terindikasi MONEY PAGE (keyword: "${kw}")`, "MONEY");
        return "MONEY_PAGE";
      }
    }
    
    // 2. BRIDGE PAGE / SUB-PILLAR Tipe 1 (HowTo lebih cocok)
    const bridgeKeywords = [
      "cara memilih", "panduan memilih", "tips memilih", 
      "how to choose", "guide to choose", "langkah memilih",
      "kriteria memilih", "memilih yang tepat", "cara pilih"
    ];
    
    for (let kw of bridgeKeywords) {
      if (h1.includes(kw) || title.includes(kw)) {
        log(`Terindikasi BRIDGE PAGE / SUB-PILLAR Tipe 1 (keyword: "${kw}")`, "BRIDGE");
        return "BRIDGE_PAGE";
      }
    }
    
    // 3. SUB-PILLAR Tipe 2 (boleh Article)
    const subPillarKeywords = [
      "jenis", "spesifikasi", "keunggulan", "fungsi", 
      "tipe", "varian", "karakteristik", "perbandingan",
      "detail", "lengkap", "ukuran", "dimensi"
    ];
    
    for (let kw of subPillarKeywords) {
      if (h1.includes(kw) || title.includes(kw)) {
        log(`Terindikasi SUB-PILLAR Tipe 2 (keyword: "${kw}")`, "SUB");
        return "SUB_PILLAR_TIPE_2";
      }
    }
    
    // 4. PILLAR (edukasi luas)
    const pillarKeywords = [
      "panduan lengkap", "pengertian", "definisi", 
      "apa itu", "overview", "komprehensif", "lengkap",
      "semua tentang", "ultimate guide", "complete guide"
    ];
    
    for (let kw of pillarKeywords) {
      if (h1.includes(kw) || title.includes(kw)) {
        log(`Terindikasi PILLAR (keyword: "${kw}")`, "PILLAR");
        return "PILLAR";
      }
    }
    
    // 5. Fallback berdasarkan panjang konten
    if (wordCount >= CONFIG.MIN_WORD_PILLAR) {
      log(`Fallback: PILLAR (${wordCount} kata)`, "PILLAR");
      return "PILLAR";
    }
    if (wordCount >= CONFIG.MIN_WORD_SUB_PILLAR) {
      log(`Fallback: SUB-PILLAR Tipe 2 (${wordCount} kata)`, "SUB");
      return "SUB_PILLAR_TIPE_2";
    }
    
    log(`Tidak terdeteksi level spesifik, default UNKNOWN`, "WARN");
    return "UNKNOWN";
  }

  // ===================== TENTUKAN SCHEMA YANG TEPAT =====================
  function getRecommendedSchemaType(pageLevel) {
    switch(pageLevel) {
      case "PILLAR":
        return { 
          primary: "Article", 
          secondary: "WebPage", 
          eligible: true,
          message: "Halaman PILLAR → menggunakan Article Schema"
        };
      case "SUB_PILLAR_TIPE_2":
        return { 
          primary: "Article", 
          secondary: "HowTo", 
          eligible: true,
          message: "Halaman SUB-PILLAR Tipe 2 → menggunakan Article Schema"
        };
      case "BRIDGE_PAGE":
        return { 
          primary: "HowTo", 
          secondary: "WebPage", 
          eligible: false,
          message: "Halaman BRIDGE PAGE → menggunakan HowTo Schema (bukan Article)"
        };
      case "MONEY_PAGE":
        return { 
          primary: "WebPage", 
          secondary: "Service", 
          eligible: false,
          message: "Halaman MONEY PAGE → menggunakan WebPage Schema"
        };
      default:
        return { 
          primary: "WebPage", 
          secondary: null, 
          eligible: false,
          message: "Halaman UNKNOWN → menggunakan WebPage Schema (fallback)"
        };
    }
  }

  // ===================== WAIT FOR AED META DATES =====================
  function waitForAEDMetaDates(callback) {
    let elapsed = 0;
    const checkInterval = setInterval(() => {
      if (window.AEDMetaDates) {
        clearInterval(checkInterval);
        log("AEDMetaDates ditemukan", "SUCCESS");
        callback(window.AEDMetaDates);
      } else if (elapsed >= CONFIG.AED_TIMEOUT) {
        clearInterval(checkInterval);
        log("Timeout menunggu AEDMetaDates, menggunakan fallback date", "WARN");
        callback({
          datePublished: new Date().toISOString().replace("Z", "+07:00"),
          dateModified: new Date().toISOString().replace("Z", "+07:00"),
          type: "SEMI_EVERGREEN"
        });
      }
      elapsed += 100;
    }, 100);
  }

  // ===================== EKSTRAKSI DATA HALAMAN =====================
  function extractPageData() {
    // URL
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
    const canonicalLink = document.querySelector('link[rel="canonical"]')?.href?.trim();
    const baseUrl = ogUrl || canonicalLink || location.href;
    const url = baseUrl.replace(/[?&]m=1/, "");

    // Title & Description
    const title = document.title || "";
    const descMeta = document.querySelector("meta[name='description']")?.content || "";

    // Gambar pertama
    const firstImg = document.querySelector(".post-body img, article img, main img")?.src || 
                     `${CONFIG.SITE_URL}/favicon.ico`;

    // Konten
    const content = document.querySelector(".post-body.entry-content") ||
                    document.querySelector("[id^='post-body-']") ||
                    document.querySelector(".post-body") ||
                    document.querySelector("article") ||
                    document.querySelector("main");

    // Headers untuk keywords
    const headers = content ? Array.from(content.querySelectorAll("h2, h3")).map(h => cleanText(h.textContent)).filter(Boolean) : [];
    const keywordsStr = headers.slice(0, 5).join(", ");
    const articleSectionStr = headers.length ? headers.slice(0, 8).join(", ") : "Artikel";

    return {
      url,
      title,
      descMeta,
      firstImg,
      content,
      keywordsStr,
      articleSectionStr,
      wordCount: content ? getWordCount(content) : 0
    };
  }

  // ===================== GENERATE SCHEMA =====================
  function generateArticleSchema(data, dates) {
    const { url, title, descMeta, firstImg, content, keywordsStr, articleSectionStr, wordCount } = data;
    const { datePublished, dateModified } = dates || {
      datePublished: new Date().toISOString().replace("Z", "+07:00"),
      dateModified: new Date().toISOString().replace("Z", "+07:00")
    };

    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "isAccessibleForFree": true,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": url + "#webpage"
      },
      "headline": escapeJSON(title),
      "description": escapeJSON(descMeta),
      "image": [firstImg],
      "author": {
        "@type": "Organization",
        "name": CONFIG.SITE_NAME
      },
      "publisher": {
        "@type": "Organization",
        "name": CONFIG.SITE_NAME,
        "logo": {
          "@type": "ImageObject",
          "url": firstImg
        }
      },
      "datePublished": datePublished,
      "dateModified": dateModified,
      "articleSection": articleSectionStr,
      "keywords": keywordsStr,
      "wordCount": wordCount,
      "articleBody": cleanText(content ? content.textContent : ""),
      "inLanguage": "id-ID"
    };
  }

  function generateHowToSchema(data) {
    const { url, title, descMeta, content } = data;
    
    // Ekstrak langkah-langkah dari checklist atau ordered list
    const steps = [];
    
    // Cari elemen yang mirip langkah
    const stepSelectors = [
      '.checklist-item', '.step', '.howto-step', 
      'ol li', '.decision-step', '.langkah'
    ];
    
    for (let selector of stepSelectors) {
      const items = document.querySelectorAll(selector);
      items.forEach((item, index) => {
        const stepText = cleanText(item.innerText);
        if (stepText && stepText.length > 10 && stepText.length < 300 && steps.length < 8) {
          const isDuplicate = steps.some(s => s.name === stepText.substring(0, 60));
          if (!isDuplicate) {
            steps.push({
              "@type": "HowToStep",
              "name": stepText.substring(0, 60),
              "text": stepText.substring(0, 200)
            });
          }
        }
      });
      if (steps.length >= 4) break;
    }
    
    // Fallback steps jika tidak ditemukan
    if (steps.length === 0) {
      steps.push(
        { "@type": "HowToStep", "name": "Identifikasi kebutuhan proyek", "text": "Tentukan fungsi, lokasi, dan spesifikasi yang diperlukan untuk proyek Anda." },
        { "@type": "HowToStep", "name": "Buat spesifikasi minimum", "text": "Tulis parameter teknis yang wajib dipenuhi oleh produk konstruksi." },
        { "@type": "HowToStep", "name": "Verifikasi sertifikasi produk", "text": "Pastikan produk memiliki SNI atau standar internasional yang relevan." },
        { "@type": "HowToStep", "name": "Bandingkan biaya siklus hidup", "text": "Hitung total biaya jangka panjang, bukan hanya harga awal." },
        { "@type": "HowToStep", "name": "Evaluasi reputasi pemasok", "text": "Cek track record, referensi proyek, dan kunjungi pabrik jika memungkinkan." }
      );
    }
    
    return {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": escapeJSON(title),
      "description": escapeJSON(descMeta),
      "url": url,
      "step": steps,
      "totalTime": "P2D",
      "supply": steps.map((_, i) => ({ "@type": "HowToSupply", "name": `Langkah ${i+1}` }))
    };
  }

  function generateWebPageSchema(data) {
    const { url, title, descMeta, firstImg } = data;

    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": title,
      "url": url,
      "description": descMeta,
      "publisher": {
        "@type": "Organization",
        "name": CONFIG.SITE_NAME,
        "logo": {
          "@type": "ImageObject",
          "url": firstImg
        }
      },
      "inLanguage": "id-ID"
    };
  }

  function generateServiceSchema(data) {
    const { url, title, descMeta, firstImg } = data;

    return {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": title,
      "url": url,
      "description": descMeta,
      "provider": {
        "@type": "Organization",
        "name": CONFIG.SITE_NAME,
        "logo": firstImg
      },
      "serviceType": "Konsultasi Konstruksi",
      "areaServed": "Indonesia",
      "inLanguage": "id-ID"
    };
  }

  // ===================== MAIN EXECUTION =====================
  function init() {
    log("═══════════════════════════════════════════════════", "INFO");
    log("AUTO-SCHEMA GENERATOR v4.0 DIMULAI", "INFO");
    log("═══════════════════════════════════════════════════", "INFO");
    
    // Ekstrak data halaman
    const pageData = extractPageData();
    log(`URL: ${pageData.url}`, "INFO");
    log(`Title: ${pageData.title.substring(0, 80)}...`, "INFO");
    
    // Deteksi level halaman
    const pageLevel = detectPageLevel();
    const schemaConfig = getRecommendedSchemaType(pageLevel);
    
    log("───────────────────────────────────────────────────", "INFO");
    log(`HASIL DETEKSI:`, "INFO");
    log(`  Level Halaman: ${pageLevel}`, pageLevel === "PILLAR" ? "PILLAR" : (pageLevel === "BRIDGE_PAGE" ? "BRIDGE" : (pageLevel === "MONEY_PAGE" ? "MONEY" : "INFO")));
    log(`  Schema Utama: ${schemaConfig.primary}`, "SUCCESS");
    log(`  Article Eligible: ${schemaConfig.eligible ? "YA" : "TIDAK"}`, schemaConfig.eligible ? "SUCCESS" : "WARN");
    log(`  ${schemaConfig.message}`, "INFO");
    log("───────────────────────────────────────────────────", "INFO");
    
    // ===== SCHEMA ARTICLE (#auto-schema) =====
    const articleSchemaElem = document.getElementById("auto-schema");
    if (articleSchemaElem) {
      if (schemaConfig.primary === "Article") {
        waitForAEDMetaDates((dates) => {
          const articleSchema = generateArticleSchema(pageData, dates);
          articleSchemaElem.textContent = JSON.stringify(articleSchema, null, 2);
          log("✅ Article Schema berhasil dipasang", "SUCCESS");
        });
      } else {
        articleSchemaElem.remove();
        log("🗑️ Article Schema dihapus (tidak sesuai level halaman)", "WARN");
      }
    }
    
    // ===== SCHEMA STATIC ARTICLE (#auto-schema-static-page) =====
    const staticArticleElem = document.getElementById("auto-schema-static-page");
    if (staticArticleElem) {
      if (schemaConfig.primary === "Article") {
        waitForAEDMetaDates((dates) => {
          const staticSchema = generateArticleSchema(pageData, dates);
          staticArticleElem.textContent = JSON.stringify(staticSchema, null, 2);
          log("✅ Static Article Schema berhasil dipasang", "SUCCESS");
        });
      } else {
        staticArticleElem.remove();
        log("🗑️ Static Article Schema dihapus", "WARN");
      }
    }
    
    // ===== SCHEMA HOWTO (#auto-schema-howto) =====
    const howToElem = document.getElementById("auto-schema-howto");
    if (howToElem) {
      if (schemaConfig.primary === "HowTo" || schemaConfig.secondary === "HowTo") {
        const howToSchema = generateHowToSchema(pageData);
        howToElem.textContent = JSON.stringify(howToSchema, null, 2);
        log("✅ HowTo Schema berhasil dipasang", "SUCCESS");
      } else {
        howToElem.remove();
        log("🗑️ HowTo Schema dihapus (tidak diperlukan)", "INFO");
      }
    } else if (schemaConfig.primary === "HowTo") {
      log("⚠️ Element #auto-schema-howto tidak ditemukan di halaman", "WARN");
    }
    
    // ===== SCHEMA WEBPAGE (#auto-schema-webpage) - ALWAYS GENERATE =====
    const webElem = document.getElementById("auto-schema-webpage");
    if (webElem) {
      const webSchema = generateWebPageSchema(pageData);
      webElem.textContent = JSON.stringify(webSchema, null, 2);
      log("✅ WebPage Schema berhasil dipasang (fallback)", "SUCCESS");
    }
    
    // ===== SCHEMA SERVICE (#auto-schema-service) untuk MONEY PAGE =====
    const serviceElem = document.getElementById("auto-schema-service");
    if (serviceElem && pageLevel === "MONEY_PAGE") {
      const serviceSchema = generateServiceSchema(pageData);
      serviceElem.textContent = JSON.stringify(serviceSchema, null, 2);
      log("✅ Service Schema berhasil dipasang (untuk Money Page)", "SUCCESS");
    } else if (serviceElem && pageLevel !== "MONEY_PAGE") {
      serviceElem.remove();
    }
    
    // ===== SUMMARY =====
    log("═══════════════════════════════════════════════════", "INFO");
    log("EXECUTION SUMMARY:", "INFO");
    log(`  Page Level     : ${pageLevel}`, "INFO");
    log(`  Primary Schema : ${schemaConfig.primary}`, "SUCCESS");
    log(`  Article Used   : ${schemaConfig.primary === "Article" ? "YES" : "NO"}`, schemaConfig.primary === "Article" ? "SUCCESS" : "INFO");
    log(`  HowTo Used     : ${schemaConfig.primary === "HowTo" ? "YES" : "NO"}`, schemaConfig.primary === "HowTo" ? "SUCCESS" : "INFO");
    log(`  WebPage Used   : YES (always)`, "SUCCESS");
    log("═══════════════════════════════════════════════════", "INFO");
    log("AUTO-SCHEMA GENERATOR v4.0 SELESAI", "SUCCESS");
  }

  // Jalankan setelah DOM siap
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
