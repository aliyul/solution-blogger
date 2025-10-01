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

// --- Schema Article & WebPage ---
document.addEventListener("DOMContentLoaded", function() {
  console.log("Auto-schema JS running");

  const stopwords = ["dan","di","ke","dari","yang","untuk","pada","dengan","ini","itu","adalah","juga","atau","sebagai","dalam","oleh","karena","akan","sampai","tidak","dapat","lebih","kami","mereka","anda"];

  // Fungsi escape JSON
  function escapeJSON(str){
    if(!str) return "";
    return str.replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\n/g,' ').replace(/\r/g,' ');
  }

  // Ambil konten post / page
  const content = document.querySelector(".post-body.entry-content") || document.querySelector("[id^='post-body-']");
  if(!content){
    console.log("No content found, exiting");
    return;
  }

  // Ambil H1, H2, H3
  const h1 = document.querySelector("h1")?.textContent.trim() || "";
  const headers = Array.from(content.querySelectorAll("h2,h3"))
    .map(h => h.textContent.trim())
    .filter(Boolean);

  // Ambil semua paragraf
  const paragraphs = Array.from(content.querySelectorAll("p")).map(p => p.textContent);
  const allText = headers.concat(paragraphs).join(" ");

  // Buat daftar kata → filter stopwords
  let words = allText.replace(/[^a-zA-Z0-9 ]/g,"")
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.includes(w));

  // Hitung frekuensi kata
  let freq = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);

  // Ambil 15 kata paling sering muncul
  const topWords = Object.keys(freq)
    .sort((a,b) => freq[b]-freq[a])
    .slice(0,15);

  // Gabungkan jadi keywords
  const keywordsArr = [h1, ...headers, ...topWords];
  const keywordsStr = Array.from(new Set(keywordsArr)).join(", ");
  const articleSectionStr = headers.join(", ");

  // ====================== POST ======================
  const schemaPost = document.getElementById("auto-schema");
  if(schemaPost){
    const url = window.location.href;
    const title = document.title;
    const descMeta = document.querySelector("meta[name='description']")?.content || "";
    const firstImg = document.querySelector(".post-body img")?.src || "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";
    const datePublished = document.querySelector("meta[itemprop='datePublished']")?.content || new Date().toISOString();
    const dateModified = document.querySelector("meta[itemprop='dateModified']")?.content || datePublished;

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
        "logo": { "@type": "ImageObject", "url": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png" }
      },
      "datePublished": datePublished,
      "dateModified": dateModified,
      "articleSection": articleSectionStr || "Artikel",
      "keywords": keywordsStr,
      "wordCount": paragraphs.join(" ").split(/\s+/).length,
      "articleBody": escapeJSON(content.textContent),
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
    const datePublished = new Date().toISOString();
    const dateModified = datePublished;

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
        "logo": { "@type": "ImageObject", "url": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png" }
      },
      "datePublished": datePublished,
      "dateModified": dateModified,
      "articleSection": articleSectionStr || "Artikel",
      "keywords": keywordsStr,
      "wordCount": paragraphs.join(" ").split(/\s+/).length,
      "articleBody": escapeJSON(content.textContent),
      "inLanguage": "id-ID"
    };

    schemaStatic.textContent = JSON.stringify(staticSchema, null, 2);
    console.log("Static page schema filled");
  }
});

document.addEventListener("DOMContentLoaded", function() {
  console.log("Auto-schema WebPage JS running");

  const schemaWeb = document.getElementById("auto-schema-webpage");
  if(schemaWeb){
    const url = window.location.href;
    const title = document.title;
    const descMeta = document.querySelector("meta[name='description']")?.content || "";

    const webPageSchema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": title,
      "url": url,
      "description": descMeta,
      "publisher": { 
        "@type": "Organization", 
        "name": "Beton Jaya Readymix",
        "logo": { "@type": "ImageObject", "url": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png" }
      },
      "inLanguage": "id-ID"
    };

    schemaWeb.textContent = JSON.stringify(webPageSchema, null, 2);
    console.log("WebPage schema filled");
  }
});
