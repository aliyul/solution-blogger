// main.js (gabungan show-menu-responsive.js + schema.js dengan debug)

$(function() {
  console.log("Show menu script: ready");

  // --- Menu responsive ---
  var menuVisible = false;
  $('#menuBtn').click(function() {
    console.log("Menu button clicked");
    if($(window).width() < 800){
      if (menuVisible) {
        $('#menu').css({'display':'none'});
        menuVisible = false;
        console.log("Menu hidden");
        return;
      }
      $('#menu').css({'display':'block'});
      menuVisible = true;
      console.log("Menu shown");
    }
  });

  $('#menu').click(function() {
    if($(window).width() < 800){
      $(this).css({'display':'none'});
      menuVisible = false;
      console.log("Menu hidden by click");
    }
  });

  $(window).resize(function(){
    if ( $(window).width() > 800) {
      $('#menu').css({'display':'block'});
      console.log("Window resized > 800px, menu forced visible");
    }
  });
});

//Ubah format DateModified dari UTC ke WIB
/*ga perlu karrna udah di buat format code nya di js Schema Article
document.addEventListener("DOMContentLoaded", function() {
  // Ambil meta dateModified (Blogspot default UTC)
  var metaModified = document.querySelector('meta[itemprop="dateModified"]');
  if (metaModified) {
    // Parsing UTC dari Blogspot
    var utcDate = new Date(metaModified.getAttribute("content"));

    // Konversi ke WIB (+7 jam)
    var wibDate = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);

    // Format ISO 8601 dengan offset +07:00
    var pad = n => String(n).padStart(2, "0");
    var isoString =
      wibDate.getFullYear() + "-" +
      pad(wibDate.getMonth() + 1) + "-" +
      pad(wibDate.getDate()) + "T" +
      pad(wibDate.getHours()) + ":" +
      pad(wibDate.getMinutes()) + ":" +
      pad(wibDate.getSeconds()) + "+07:00";

    // Update attribute content
    metaModified.setAttribute("content", isoString);

    // Opsional: tampilkan di console untuk cek
    console.log("dateModified WIB:", isoString);
  }
});
*/
// --- Schema Article & WebPage ---
document.addEventListener("DOMContentLoaded", function() {
  console.log("Auto-schema JS running");

  const stopwords = ["dan","di","ke","dari","yang","untuk","pada","dengan","ini","itu","adalah","juga","atau","sebagai","dalam","oleh","karena","akan","sampai","tidak","dapat","lebih","kami","mereka","anda"];

  // Escape JSON aman
  function escapeJSON(str){
    if(!str) return "";
    return str
      .replace(/\\/g,'\\\\')
      .replace(/"/g,'\\"')
      .replace(/\n/g,' ')
      .replace(/\r/g,' ')
      .replace(/</g,'\\u003c')
      .replace(/>/g,'\\u003e')
      .trim();
  }

  // Bersihkan plain text
  function cleanText(str){
    if(!str) return "";
    return str.replace(/\s+/g," ").trim();
  }

  // Hitung kata sebenarnya
  function getArticleWordCount(content){
    if(!content) return 0;
    const clone = content.cloneNode(true);
    clone.querySelectorAll("script,style,noscript,iframe").forEach(el => el.remove());
    clone.querySelectorAll("[hidden],[aria-hidden='true']").forEach(el => el.remove());
    clone.querySelectorAll("*").forEach(el => {
      const style = window.getComputedStyle(el);
      if(style && style.display === "none"){ el.remove(); }
    });
    const text = clone.innerText || "";
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  // Konversi UTC ke WIB +07:00
  function convertToWIB(isoDate){
    if(!isoDate) return new Date().toISOString().replace("Z","+07:00");
    const d = new Date(isoDate);
    const wib = new Date(d.getTime() + 7*60*60*1000);
    return wib.toISOString().replace("Z","+07:00");
  }

  // ================== Ambil konten ==================
  const content = document.querySelector(".post-body.entry-content") || document.querySelector("[id^='post-body-']") || document.querySelector(".post-body");
  const h1 = document.querySelector("h1")?.textContent.trim() || "";
  const headers = content ? Array.from(content.querySelectorAll("h2,h3")).map(h => cleanText(h.textContent)).filter(Boolean) : [];
  const paragraphs = content ? Array.from(content.querySelectorAll("p")).map(p => cleanText(p.textContent)) : [];
  const allText = headers.concat(paragraphs).join(" ");

  // Hitung kata penting
  let words = allText.replace(/[^a-zA-Z0-9 ]/g,"").toLowerCase().split(/\s+/).filter(w => w.length > 3 && !stopwords.includes(w));
  let freq = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  const topWords = Object.keys(freq).sort((a,b) => freq[b]-freq[a]).slice(0,10);

  // 🔑 AUTO keywords → H1 + 2 subheading utama + 2 topword
  let keywordsArr = [];
  if(h1) keywordsArr.push(h1);
  if(headers.length) keywordsArr.push(...headers.slice(0,2));
  if(topWords.length) keywordsArr.push(...topWords.slice(0,2));
  const keywordsStr = Array.from(new Set(keywordsArr)).slice(0,5).join(", "); // tanpa fallback
  const articleSectionStr = headers.length ? headers.join(", ") : "Artikel";

  // ====================== POST ======================
  const schemaPost = document.getElementById("auto-schema");
  if(schemaPost){
    const url = window.location.href;
    const title = document.title;
    const descMeta = document.querySelector("meta[name='description']")?.content || "";
    const firstImg = document.querySelector(".post-body img")?.src || "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";
    const datePublished = convertToWIB(document.querySelector("meta[itemprop='datePublished']")?.content);
    const dateModified = convertToWIB(document.querySelector("meta[itemprop='dateModified']")?.content || datePublished);

    const postSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "isAccessibleForFree": true,
      "mainEntityOfPage": { "@type": "WebPage", "@id": url+"#webpage" },
      "headline": escapeJSON(title),
      "description": escapeJSON(descMeta),
      "image": [firstImg],
      "author": { "@type": "Organization", "name": "Beton Jaya Readymix" },
      "publisher": { "@type": "Organization", "name": "Beton Jaya Readymix",
        "logo": { "@type": "ImageObject", "url": firstImg }
      },
      "datePublished": datePublished,
      "dateModified": dateModified,
      "articleSection": articleSectionStr,
      "keywords": keywordsStr,
      "wordCount": getArticleWordCount(content),
      "articleBody": cleanText(content ? content.textContent : ""),
      "inLanguage": "id-ID"
    };

    schemaPost.textContent = JSON.stringify(postSchema, null, 2);
    console.log("Post schema filled");
  }

  // ==================== STATIC PAGE ==================
  const schemaStatic = document.getElementById("auto-schema-static-page");
  if(schemaStatic){
    const url = window.location.href;
    const title = document.title;
    const descMeta = document.querySelector("meta[name='description']")?.content || "";
    const firstImg = document.querySelector(".post-body img")?.src || "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";
    const datePublished = convertToWIB(document.querySelector("meta[itemprop='datePublished']")?.content);
    const dateModified = convertToWIB(document.querySelector("meta[itemprop='dateModified']")?.content || datePublished);

    const staticSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "isAccessibleForFree": true,
      "mainEntityOfPage": { "@type": "WebPage", "@id": url+"#webpage" },
      "headline": escapeJSON(title),
      "description": escapeJSON(descMeta),
      "image": [firstImg],
      "author": { "@type": "Organization", "name": "Beton Jaya Readymix" },
      "publisher": { "@type": "Organization", "name": "Beton Jaya Readymix",
        "logo": { "@type": "ImageObject", "url": firstImg }
      },
      "datePublished": datePublished,
      "dateModified": dateModified,
      "articleSection": articleSectionStr,
      "keywords": keywordsStr,
      "wordCount": getArticleWordCount(content),
      "articleBody": cleanText(content ? content.textContent : ""),
      "inLanguage": "id-ID"
    };

    schemaStatic.textContent = JSON.stringify(staticSchema, null, 2);
    console.log("Static page schema filled");
  }

});

document.addEventListener("DOMContentLoaded", function () {
  
  console.log("Auto-schema WebPage JS running");

  const schemaWeb = document.getElementById("auto-schema-webpage");
  if (schemaWeb) {
    const url = window.location.href;
    const title = document.title;
    const descMeta =
      document.querySelector("meta[name='description']")?.content || "";

    const webPageSchema = {
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
          "url":
            "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png"
        }
      },
      "inLanguage": "id-ID"
    };

    schemaWeb.textContent = JSON.stringify(webPageSchema, null, 2);
    console.log("WebPage schema filled");
  }
});

//Deteksi tanggal Update buat ditamplkan di post
document.addEventListener("DOMContentLoaded", function() {
  var el = document.getElementById("lastUpdatedText");
  if (!el) return; // berhenti kalau elemen tidak ada

  var isoDate = null;

  // --- Cek semua schema JSON-LD ---
  var schemas = document.querySelectorAll('script[type="application/ld+json"]');
  schemas.forEach(s => {
    try {
      var data = JSON.parse(s.textContent);
      if (Array.isArray(data["@graph"])) {
        var article = data["@graph"].find(item => item["@type"] === "Article");
        if (article && !isoDate) {
          isoDate = article.dateModified || article.datePublished || null;
        }
      } else if (data["@type"] === "Article" && !isoDate) {
        isoDate = data.dateModified || data.datePublished || null;
      }
    } catch (e) {
      console.warn("Gagal parse schema JSON-LD:", e);
    }
  });

  // --- Kalau schema kosong, fallback ke <time> ---
  if (!isoDate && el.closest("time")) {
    isoDate = el.closest("time").getAttribute("datetime");
  }

  // --- Format ke Indonesia ---
  if (isoDate) {
    var dateObj = new Date(isoDate);
    if (!isNaN(dateObj.getTime())) {
      var options = { day: "numeric", month: "long", year: "numeric" };
      el.textContent = dateObj.toLocaleDateString("id-ID", options);
    } else {
      el.textContent = "-";
    }
  } else {
    el.textContent = "-";
  }
});
