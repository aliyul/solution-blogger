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
<script>
document.addEventListener("DOMContentLoaded", function() {
  console.log("Auto-schema JS running");

  const stopwords = ["dan","di","ke","dari","yang","untuk","pada","dengan","ini","itu","adalah","juga","atau","sebagai","dalam","oleh","karena","akan","sampai","tidak","dapat","lebih","kami","mereka","anda"];

  // Escape JSON
  function escapeJSON(str){
    if(!str) return "";
    return str
      .replace(/\\/g,'\\\\')
      .replace(/"/g,'\\"')
      .replace(/\n/g,' ')
      .replace(/\r/g,' ')
      .trim();
  }

  // Clean plain text
  function cleanText(str){
    if(!str) return "";
    return str.replace(/\s+/g," ").trim();
  }

  // Word count real content
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

  // ================== Ambil konten ==================
  const content = document.querySelector(".post-body.entry-content") || document.querySelector("[id^='post-body-']");
  if(!content){
    console.log("No content found, exiting");
    return;
  }

  const h1 = document.querySelector("h1")?.textContent.trim() || "";
  const headers = Array.from(content.querySelectorAll("h2,h3"))
    .map(h => cleanText(h.textContent))
    .filter(Boolean);

  const paragraphs = Array.from(content.querySelectorAll("p")).map(p => cleanText(p.textContent));
  const allText = headers.concat(paragraphs).join(" ");

  // Hitung kata penting
  let words = allText.replace(/[^a-zA-Z0-9 ]/g,"")
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.includes(w));

  let freq = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);

  const topWords = Object.keys(freq).sort((a,b) => freq[b]-freq[a]).slice(0,10);

  // 🔑 AUTO keywords → pick dari H1 + 2 subheading utama + 2 topword
  let keywordsArr = [];
  if(h1) keywordsArr.push(h1);
  if(headers.length) keywordsArr.push(...headers.slice(0,2));
  if(topWords.length) keywordsArr.push(...topWords.slice(0,2));
  const keywordsStr = Array.from(new Set(keywordsArr)).slice(0,5).join(", ");

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
        "logo": { "@type": "ImageObject", "url": firstImg }
      },
      "datePublished": datePublished,
      "dateModified": dateModified,
      "articleSection": articleSectionStr || "Artikel",
      "keywords": keywordsStr,
      "wordCount": getArticleWordCount(content),
      "articleBody": escapeJSON(cleanText(content.textContent)),
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
        "logo": { "@type": "ImageObject", "url": firstImg }
      },
      "datePublished": datePublished,
      "dateModified": dateModified,
      "articleSection": articleSectionStr || "Artikel",
      "keywords": keywordsStr,
      "wordCount": getArticleWordCount(content),
      "articleBody": escapeJSON(cleanText(content.textContent)),
      "inLanguage": "id-ID"
    };

    schemaStatic.textContent = JSON.stringify(staticSchema, null, 2);
    console.log("Static page schema filled");
  }
});
</script>
