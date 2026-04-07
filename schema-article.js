/**
 * AUTO-SCHEMA GENERATOR v4.1
 * DENGAN CLEAN ARTICLE BODY & WORDCOUNT AKURAT
 * 
 * UPDATE v4.1:
 * - articleBody hanya berisi teks bersih (tanpa CSS/HTML/JS)
 * - wordCount akurat berdasarkan teks konten, bukan kode
 * - articleSection tanpa emoji & formatting aneh
 * - keywords relevan (bukan duplikasi heading)
 * - Deteksi level halaman (PILLAR / SUB-PILLAR / BRIDGE / MONEY)
 * - PILLAR & SUB-PILLAR Tipe 2 → Article Schema
 * - BRIDGE PAGE (SUB-PILLAR Tipe 1) → HowTo Schema
 * - MONEY PAGE → WebPage Schema (Service diserahkan ke script lain)
 * 
 * @version 4.1.0
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
    MAX_ARTICLE_BODY_LENGTH: 5000, // Maksimal karakter articleBody
    SITE_NAME: "Beton Jaya Readymix",
    SITE_URL: "https://www.betonjayareadymix.com"
  };

  // Stopwords untuk filtering keyword
  const STOPWORDS = [
    "dan", "di", "ke", "dari", "yang", "untuk", "pada", "dengan", 
    "ini", "itu", "adalah", "juga", "atau", "sebagai", "dalam", 
    "oleh", "karena", "akan", "sampai", "tidak", "dapat", "lebih", 
    "kami", "mereka", "anda", "kita", "saya", "dia", "mereka", 
    "the", "and", "for", "with", "this", "that", "are", "was", "were"
  ];

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
    console.log(`${prefix} [Schema v4.1] ${msg}`);
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

  // ===================== CLEAN ARTICLE BODY (TANPA CSS/HTML) =====================
  function getCleanArticleBody(contentElement) {
    if (!contentElement) return "";
    
    log("Membersihkan articleBody...", "INFO");
    
    // Clone element agar tidak mengubah DOM asli
    const clone = contentElement.cloneNode(true);
    
    // Hapus semua element yang BUKAN konten artikel
    const elementsToRemove = [
      "script", "style", "noscript", "iframe", "svg", 
      "[data-nosnippet]", ".toc", ".daftar-isi", ".table-of-contents",
      ".related-posts", ".sidebar", ".cta-banner", ".cta-box",
      ".btn", ".button", "nav", "header", "footer",
      ".product-card", ".product-grid", ".comparison-table",
      ".form-container", ".consultation-form", ".whatsapp",
      ".breadcrumb", ".breadcrumbs", ".share-buttons",
      ".social-share", ".comments", ".comment-section",
      ".advertisement", ".ads", ".promo", ".popup"
    ];
    
    elementsToRemove.forEach(selector => {
      try {
        clone.querySelectorAll(selector).forEach(el => el.remove());
      } catch(e) { /* ignore */ }
    });
    
    // Hapus element dengan kelas komersial
    const commercialClasses = [
      ".btn-cta", ".cta-button", ".consultation", ".price", 
      ".price-list", ".harga", ".order-now", ".buy-now"
    ];
    
    commercialClasses.forEach(selector => {
      try {
        clone.querySelectorAll(selector).forEach(el => el.remove());
      } catch(e) { /* ignore */ }
    });
    
    // Ambil teks dari heading dan paragraf SAJA
    const contentElements = clone.querySelectorAll("h1, h2, h3, h4, p, li, blockquote, td, th");
    let textContent = "";
    
    contentElements.forEach(el => {
      let text = el.innerText || "";
      // Hapus emoji berlebih
      text = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim();
      // Hapus karakter khusus yang tidak perlu
      text = text.replace(/[→←↑↓↔️✓✔️✖️❌✅⭐]/g, "");
      if (text.length > 10) {
        textContent += text + " ";
      }
    });
    
    // Jika tidak ada konten dari selector di atas, ambil semua teks
    if (textContent.length < 200) {
      textContent = clone.innerText || "";
    }
    
    // Batasi panjang
    if (textContent.length > CONFIG.MAX_ARTICLE_BODY_LENGTH) {
      textContent = textContent.substring(0, CONFIG.MAX_ARTICLE_BODY_LENGTH) + "...";
    }
    
    log(`articleBody length: ${textContent.length} karakter`, "SUCCESS");
    return cleanText(textContent);
  }

  // ===================== AKURASI WORDCOUNT =====================
  function getAccurateWordCount(contentElement) {
    if (!contentElement) return 0;
    
    // Clone dan bersihkan seperti articleBody
    const clone = contentElement.cloneNode(true);
    
    const elementsToRemove = [
      "script", "style", "noscript", "iframe", "svg", 
      "[data-nosnippet]", ".toc", ".daftar-isi",
      ".related-posts", ".sidebar", ".cta-banner",
      ".btn", ".button", "nav", "header", "footer",
      ".product-card", ".product-grid", ".comparison-table"
    ];
    
    elementsToRemove.forEach(selector => {
      try {
        clone.querySelectorAll(selector).forEach(el => el.remove());
      } catch(e) { /* ignore */ }
    });
    
    // Ambil teks bersih
    const text = clone.innerText || "";
    
    // Hapus emoji dan karakter khusus
    const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
                          .replace(/[→←↑↓↔️✓✔️✖️❌✅⭐]/g, "");
    
    // Hitung kata (split by whitespace)
    const words = cleanText.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    
    log(`WordCount akurat: ${wordCount} kata`, "SUCCESS");
    return wordCount;
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
    const wordCount = content ? getAccurateWordCount(content) : 0;
    
    log(`Menganalisis halaman: H1="${h1.substring(0, 60)}..."`, "INFO");
    log(`Panjang konten: ${wordCount} kata`, "INFO");
    
    // 1. MONEY PAGE (TIDAK boleh Article) - biarkan script lain yang handle Service
    const moneyKeywords = [
      "konsultasi", "harga", "beli", "pesan", "order", 
      "quote", "penawaran", "form", "daftar harga", 
      "whatsapp", "call us", "hubungi kami", "request"
    ];
    
    for (let kw of moneyKeywords) {
      if (url.includes(kw) || h1.includes(kw) || title.includes(kw)) {
        log(`Terindikasi MONEY PAGE (keyword: "${kw}") → skip Article`, "MONEY");
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
          secondary: null, 
          eligible: false,
          message: "Halaman MONEY PAGE → skip Article (serahkan ke script lain)"
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

  // ===================== EKSTRAKSI KEYWORDS CLEAN =====================
  function getCleanKeywords(contentElement, pageLevel, title) {
    if (!contentElement) return "";
    
    const keywords = new Set();
    
    // 1. Tambahkan dari title/h1
    const h1 = document.querySelector("h1")?.innerText || "";
    const titleWords = title.toLowerCase().split(/\s+/);
    
    // Filter kata penting dari title
    titleWords.forEach(word => {
      if (word.length > 4 && !STOPWORDS.includes(word)) {
        keywords.add(word);
      }
    });
    
    // 2. Tambahkan berdasarkan level halaman
    if (pageLevel === "PILLAR") {
      keywords.add("panduan konstruksi");
      keywords.add("produk konstruksi");
      keywords.add("material bangunan");
    } else if (pageLevel === "SUB_PILLAR_TIPE_2") {
      if (title.includes("beton") || h1.includes("beton")) {
        keywords.add("beton precast");
        keywords.add("beton pracetak");
        keywords.add("produk precast");
      }
      keywords.add("konstruksi");
      keywords.add("standar SNI");
    } else if (pageLevel === "BRIDGE_PAGE") {
      keywords.add("cara memilih");
      keywords.add("tips memilih");
      keywords.add("panduan memilih");
    }
    
    // 3. Ambil 2 kata penting dari H2 pertama
    const firstH2 = contentElement.querySelector("h2")?.innerText || "";
    const h2Words = firstH2.toLowerCase().split(/\s+/).slice(0, 3);
    h2Words.forEach(word => {
      if (word.length > 4 && !STOPWORDS.includes(word)) {
        keywords.add(word);
      }
    });
    
    // Konversi ke array dan batasi
    const keywordArray = Array.from(keywords).slice(0, 8);
    const result = keywordArray.join(", ");
    
    log(`Keywords: ${result}`, "SUCCESS");
    return result;
  }

  // ===================== EKSTRAKSI ARTICLE SECTION CLEAN =====================
  function getCleanArticleSection(contentElement) {
    if (!contentElement) return "Artikel Konstruksi";
    
    // Ambil H1 sebagai section utama
    const h1 = document.querySelector("h1")?.innerText || "";
    
    // Bersihkan dari emoji
    let section = h1.replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
                    .replace(/[→←↑↓↔️✓✔️✖️❌✅⭐]/g, "")
                    .trim();
    
    // Batasi panjang
    if (section.length > 60) {
      section = section.substring(0, 60);
    }
    
    if (!section || section.length < 5) {
      section = "Panduan Konstruksi";
    }
    
    log(`Article Section: ${section}`, "SUCCESS");
    return section;
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

    return {
      url,
      title,
      descMeta,
      firstImg,
      content
    };
  }

  // ===================== GENERATE SCHEMA (CLEAN VERSION) =====================
  function generateArticleSchema(data, dates, pageLevel) {
    const { url, title, descMeta, firstImg, content } = data;
    const { datePublished, dateModified } = dates || {
      datePublished: new Date().toISOString().replace("Z", "+07:00"),
      dateModified: new Date().toISOString().replace("Z", "+07:00")
    };

    const cleanBody = getCleanArticleBody(content);
    const accurateWordCount = getAccurateWordCount(content);
    const cleanKeywords = getCleanKeywords(content, pageLevel, title);
    const cleanSection = getCleanArticleSection(content);

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
      "articleSection": cleanSection,
      "keywords": cleanKeywords,
      "wordCount": accurateWordCount,
      "articleBody": cleanBody,
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
        let stepText = cleanText(item.innerText);
        // Hapus emoji dan karakter khusus
        stepText = stepText.replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
                           .replace(/[→←↑↓↔️✓✔️✖️❌✅⭐]/g, "");
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
      "totalTime": "P2D"
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

  // ===================== MAIN EXECUTION =====================
  function init() {
    log("═══════════════════════════════════════════════════", "INFO");
    log("AUTO-SCHEMA GENERATOR v4.1 DIMULAI", "INFO");
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
          const articleSchema = generateArticleSchema(pageData, dates, pageLevel);
          articleSchemaElem.textContent = JSON.stringify(articleSchema, null, 2);
          log("✅ Article Schema berhasil dipasang (dengan clean articleBody)", "SUCCESS");
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
          const staticSchema = generateArticleSchema(pageData, dates, pageLevel);
          staticArticleElem.textContent = JSON.stringify(staticSchema, null, 2);
          log("✅ Static Article Schema berhasil dipasang (dengan clean articleBody)", "SUCCESS");
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
    }
    
    // ===== SCHEMA WEBPAGE (#auto-schema-webpage) - ALWAYS GENERATE =====
    const webElem = document.getElementById("auto-schema-webpage");
    if (webElem) {
      const webSchema = generateWebPageSchema(pageData);
      webElem.textContent = JSON.stringify(webSchema, null, 2);
      log("✅ WebPage Schema berhasil dipasang (fallback)", "SUCCESS");
    }
    
    // ===== CATATAN: auto-schema-service TIDAK disentuh (serahkan ke script lain) =====
    log("📌 auto-schema-service tidak disentuh - diserahkan ke script v4.63-Fix2", "INFO");
    
    // ===== SUMMARY =====
    log("═══════════════════════════════════════════════════", "INFO");
    log("EXECUTION SUMMARY:", "INFO");
    log(`  Page Level     : ${pageLevel}`, "INFO");
    log(`  Primary Schema : ${schemaConfig.primary}`, "SUCCESS");
    log(`  Article Used   : ${schemaConfig.primary === "Article" ? "YES" : "NO"}`, schemaConfig.primary === "Article" ? "SUCCESS" : "INFO");
    log(`  HowTo Used     : ${schemaConfig.primary === "HowTo" ? "YES" : "NO"}`, schemaConfig.primary === "HowTo" ? "SUCCESS" : "INFO");
    log(`  WebPage Used   : YES (always)`, "SUCCESS");
    log(`  Clean Body     : YES (tanpa CSS/HTML)`, "SUCCESS");
    log(`  auto-schema-service: NOT TOUCHED (delegated)`, "INFO");
    log("═══════════════════════════════════════════════════", "INFO");
    log("AUTO-SCHEMA GENERATOR v4.1 SELESAI", "SUCCESS");
  }

  // Jalankan setelah DOM siap
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
