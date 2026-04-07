/**
 * AUTO-SCHEMA ARTICLE GENERATOR v2.0
 * Dengan Validasi Kelayakan + Kondisi STOP jika tidak layak
 * 
 * Fitur:
 * - Deteksi kelayakan halaman untuk schema Article
 * - STOP jika halaman komersial (produk, harga, jasa)
 * - Generate schema hanya untuk halaman edukasi murni
 * - Auto update datePublished & dateModified dari AED
 */

(function() {
  "use strict";

  // ===================== UTILS =====================
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

  function getArticleWordCount(content) {
    if (!content) return 0;
    const clone = content.cloneNode(true);
    clone.querySelectorAll("script, style, noscript, iframe, svg, [data-nosnippet]").forEach(el => el.remove());
    clone.querySelectorAll("*").forEach(el => {
      const style = window.getComputedStyle(el);
      if (style && style.display === "none") el.remove();
    });
    const text = clone.innerText || "";
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  // ===================== WAIT FOR AED META DATES =====================
  function waitForAEDMetaDates(callback, maxWait = 5000, interval = 100) {
    let elapsed = 0;
    const checkInterval = setInterval(() => {
      if (window.AEDMetaDates) {
        clearInterval(checkInterval);
        callback(window.AEDMetaDates);
      } else if (elapsed >= maxWait) {
        clearInterval(checkInterval);
        console.warn("⚠️ waitForAEDMetaDates: Timeout, menggunakan fallback date");
        callback({
          datePublished: new Date().toISOString().replace("Z", "+07:00"),
          dateModified: new Date().toISOString().replace("Z", "+07:00"),
          type: "SEMI_EVERGREEN"
        });
      }
      elapsed += interval;
    }, interval);
  }

  // ===================== VALIDASI KELAYAKAN ARTICLE =====================
  /**
   * Mengecek apakah halaman LAYAK menggunakan schema Article
   * @returns {boolean} true jika layak, false jika tidak
   */
  function isEligibleForArticleSchema() {
    console.log("🔍 [Validator] Memeriksa kelayakan halaman untuk schema Article...");

    // 1. Cek dari AED Meta Dates (hasil deteksi Evergreen)
    const aedMeta = window.AEDMetaDates;
    if (aedMeta && aedMeta.type) {
      const validTypesForArticle = ["EVERGREEN", "SEMI_EVERGREEN"];
      if (!validTypesForArticle.includes(aedMeta.type)) {
        console.log(`❌ [Validator] Halaman TIDAK layak Article (AED type: ${aedMeta.type})`);
        console.log(`   → Halaman ini terdeteksi sebagai ${aedMeta.type} (non-edukasi)`);
        return false;
      }
      console.log(`✅ [Validator] AED type: ${aedMeta.type} (memenuhi syarat)`);
    }

    // 2. Cek dari EvergreenDetectorResults
    const aedResult = window.EvergreenDetectorResults;
    if (aedResult && aedResult.resultType) {
      const validResults = ["EVERGREEN", "SEMI_EVERGREEN"];
      if (!validResults.includes(aedResult.resultType)) {
        console.log(`❌ [Validator] Halaman TIDAK layak Article (resultType: ${aedResult.resultType})`);
        return false;
      }
    }

    // 3. Cek keberadaan konten utama
    const content = document.querySelector(".post-body.entry-content") ||
                    document.querySelector("[id^='post-body-']") ||
                    document.querySelector(".post-body") ||
                    document.querySelector("article") ||
                    document.querySelector("main");

    if (!content) {
      console.log(`❌ [Validator] Halaman TIDAK layak Article (tidak ditemukan konten utama)`);
      return false;
    }

    // 4. Cek panjang konten (minimal 300 kata untuk artikel)
    const wordCount = getArticleWordCount(content);
    if (wordCount < 300) {
      console.log(`❌ [Validator] Halaman TIDAK layak Article (wordCount: ${wordCount} < 300 kata)`);
      return false;
    }
    console.log(`✅ [Validator] Panjang konten: ${wordCount} kata (memenuhi syarat minimal 300)`);

    // 5. Cek pola komersial (produk, harga, jasa, sewa)
    const bodyText = (document.body.innerText || "").toLowerCase();
    
    // Keyword komersial yang menandakan halaman bukan artikel murni
    const commercialKeywords = [
      "harga rp", "beli sekarang", "pesan sekarang", "whatsapp", "call us", 
      "diskon", "promo terbatas", "gratis ongkir", "cashback", "order sekarang",
      "beli produk", "keranjang", "checkout", "metode pembayaran", "cicilan",
      "sewa alat", "rental", "jasa pasang", "kontraktor", "free survey"
    ];
    
    let commercialCount = 0;
    const foundKeywords = [];
    commercialKeywords.forEach(kw => {
      if (bodyText.includes(kw)) {
        commercialCount++;
        foundKeywords.push(kw);
      }
    });

    if (commercialCount >= 2) {
      console.log(`❌ [Validator] Halaman TIDAK layak Article (mengandung ${commercialCount} keyword komersial)`);
      console.log(`   → Keyword ditemukan: ${foundKeywords.slice(0, 3).join(", ")}...`);
      console.log(`   → Gunakan schema WebPage, Product, atau Service untuk halaman ini.`);
      return false;
    }

    // 6. Cek elemen produk/harga di halaman
    const hasProductGrid = document.querySelector('.product-grid, .product-card, [class*="product-grid"], [class*="product-card"]');
    const hasPriceTable = document.querySelector('table td:contains("Rp"), table td:contains("harga")');
    
    if (hasProductGrid || hasPriceTable) {
      console.log(`❌ [Validator] Halaman TIDAK layak Article (mengandung elemen produk atau tabel harga)`);
      return false;
    }

    // 7. Cek apakah halaman didominasi gambar produk (e-commerce style)
    const productImages = document.querySelectorAll('[class*="product"] img, [class*="produk"] img, .gallery img');
    if (productImages.length > 5 && wordCount < 800) {
      console.log(`❌ [Validator] Halaman TIDAK layak Article (${productImages.length} gambar produk, konten terlalu pendek)`);
      return false;
    }

    // 8. Cek struktur heading (artikel biasanya punya H2 yang bermakna)
    const h2Count = document.querySelectorAll("h2, h3").length;
    if (h2Count < 2) {
      console.log(`⚠️ [Validator] Halaman memiliki struktur heading minimal (${h2Count} heading) — masih bisa lanjut`);
    }

    console.log("✅ [Validator] Halaman LAYAK menggunakan schema Article");
    return true;
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
                     "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";

    // Konten
    const content = document.querySelector(".post-body.entry-content") ||
                    document.querySelector("[id^='post-body-']") ||
                    document.querySelector(".post-body") ||
                    document.querySelector("article") ||
                    document.querySelector("main");

    // Headers & Keywords
    const headers2 = content ? Array.from(content.querySelectorAll("h2, h3")).map(h => cleanText(h.textContent)).filter(Boolean) : [];
    const paragraphs = content ? Array.from(content.querySelectorAll("p")).map(p => cleanText(p.textContent)) : [];
    const allText = headers2.concat(paragraphs).join(" ");

    // Stopwords
    const stopwords = ["dan", "di", "ke", "dari", "yang", "untuk", "pada", "dengan", "ini", "itu", "adalah", "juga", "atau", "sebagai", "dalam", "oleh", "karena", "akan", "sampai", "tidak", "dapat", "lebih", "kami", "mereka", "anda"];

    let words = allText.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase().split(/\s+/).filter(w => w.length > 3 && !stopwords.includes(w));
    let freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    const topWords = Object.keys(freq).sort((a, b) => freq[b] - freq[a]).slice(0, 10);

    let keywordsArr = [];
    if (title) keywordsArr.push(title);
    if (headers2.length) keywordsArr.push(...headers2.slice(0, 2));
    if (topWords.length) keywordsArr.push(...topWords.slice(0, 2));
    const keywordsStr = [...new Set(keywordsArr)].slice(0, 5).join(", ");
    const articleSectionStr = headers2.length ? headers2.slice(0, 8).join(", ") : "Artikel";

    return {
      url,
      title,
      descMeta,
      firstImg,
      content,
      keywordsStr,
      articleSectionStr
    };
  }

  // ===================== GENERATE SCHEMA =====================
  function generateArticleSchema(data, dates) {
    const { url, title, descMeta, firstImg, content, keywordsStr, articleSectionStr } = data;
    const { datePublished, dateModified } = dates;

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
        "name": "Beton Jaya Readymix"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Beton Jaya Readymix",
        "logo": {
          "@type": "ImageObject",
          "url": firstImg
        }
      },
      "datePublished": datePublished,
      "dateModified": dateModified,
      "articleSection": articleSectionStr,
      "keywords": keywordsStr,
      "wordCount": getArticleWordCount(content),
      "articleBody": cleanText(content ? content.textContent : ""),
      "inLanguage": "id-ID"
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
        "name": "Beton Jaya Readymix",
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
    console.log("🚀 [Auto-Schema] Script dimulai...");

    // Ekstrak data halaman
    const pageData = extractPageData();
    
    // Cek KELAYAKAN untuk schema Article
    const eligible = isEligibleForArticleSchema();

    // ===== SCHEMA POST (ARTICLE) =====
    const schemaPost = document.getElementById("auto-schema");
    if (schemaPost) {
      if (!eligible) {
        console.log("🛑 [Auto-Schema] STOP: Halaman tidak layak untuk schema Article.");
        console.log("   → Menghapus element #auto-schema");
        schemaPost.remove();
      } else {
        console.log("✅ [Auto-Schema] Halaman LAYAK, generating Article Schema...");
        waitForAEDMetaDates((dates) => {
          const articleSchema = generateArticleSchema(pageData, dates);
          schemaPost.textContent = JSON.stringify(articleSchema, null, 2);
          console.log("✅ [Auto-Schema] Article Schema berhasil dibuat");
        });
      }
    }

    // ===== SCHEMA STATIC PAGE (ARTICLE) =====
    const schemaStatic = document.getElementById("auto-schema-static-page");
    if (schemaStatic) {
      if (!eligible) {
        console.log("🛑 [Auto-Schema] STOP: Halaman tidak layak untuk schema Static Article.");
        console.log("   → Menghapus element #auto-schema-static-page");
        schemaStatic.remove();
      } else {
        console.log("✅ [Auto-Schema] Halaman LAYAK, generating Static Article Schema...");
        waitForAEDMetaDates((dates) => {
          const staticSchema = generateArticleSchema(pageData, dates);
          schemaStatic.textContent = JSON.stringify(staticSchema, null, 2);
          console.log("✅ [Auto-Schema] Static Article Schema berhasil dibuat");
        });
      }
    }

    // ===== SCHEMA WEBPAGE (ALWAYS GENERATE, FALLBACK) =====
    const schemaWeb = document.getElementById("auto-schema-webpage");
    if (schemaWeb) {
      console.log("✅ [Auto-Schema] Generating WebPage Schema (fallback)...");
      const webPageSchema = generateWebPageSchema(pageData);
      schemaWeb.textContent = JSON.stringify(webPageSchema, null, 2);
      console.log("✅ [Auto-Schema] WebPage Schema berhasil dibuat");
    }

    console.log("🏁 [Auto-Schema] Script selesai dijalankan");
  }

  // Jalankan setelah DOM siap
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
