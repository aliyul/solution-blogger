document.addEventListener("DOMContentLoaded", function() {
  console.log("Universal Auto-schema & Content Detection running 🚀");

  // ================== Utils ==================
  function cleanText(str){
    if(!str) return "";
    return str.replace(/\s+/g," ").trim();
  }

  function escapeJSON(str){
    if(!str) return "";
    return str.replace(/\\/g,'\\\\').replace(/"/g,'\\"')
              .replace(/\n/g,' ').replace(/\r/g,' ')
              .replace(/</g,'\\u003c').replace(/>/g,'\\u003e').trim();
  }

  function convertToWIB(isoDate){
    if(!isoDate) return new Date().toISOString().replace("Z","+07:00");
    const d = new Date(isoDate);
    const wib = new Date(d.getTime() + 7*60*60*1000);
    return wib.toISOString().replace("Z","+07:00");
  }

  function hashString(str){
    let hash = 0;
    for (let i=0; i<str.length; i++){
      hash = (hash<<5)-hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

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

  // ================== Ambil konten utama ==================
  const contentEl = document.querySelector(".post-body.entry-content") || 
                    document.querySelector("[id^='post-body-']") || 
                    document.querySelector(".post-body");
  const contentText = contentEl ? contentEl.innerText : "";

  // ================== HASH DETECTION ==================
  const currentHash = hashString(contentText);
  const oldHash = localStorage.getItem("articleHash");
  let datePublished = convertToWIB(document.querySelector("meta[itemprop='datePublished']")?.content);
  let dateModified = datePublished;

  if(oldHash && oldHash == currentHash){
    dateModified = convertToWIB(document.querySelector("meta[itemprop='dateModified']")?.content || datePublished);
    console.log("Konten tidak berubah → dateModified tetap");
  } else {
    dateModified = convertToWIB(new Date().toISOString());
    localStorage.setItem("articleHash", currentHash);
    console.log("Konten berubah → dateModified diupdate ke sekarang");
  }

  // ================== DETEKSI TYPE KONTEN ==================
  const nonEvergreenKeywords = ["harga","update","terbaru","berita","jadwal","event","promo","diskon","proyek","progres"];
  const evergreenKeywords = ["panduan","tutorial","tips","cara","definisi","pandangan","strategi","langkah","prosedur","panduan lengkap"];

  let typeKonten = "evergreen";
  let score = 0;
  const contentLower = contentText.toLowerCase();

  nonEvergreenKeywords.forEach(kw => { if(contentLower.includes(kw)) score += 2; });
  evergreenKeywords.forEach(kw => { if(contentLower.includes(kw)) score -= 1; });

  const numberCount = (contentText.match(/\d{1,4}/g) || []).length;
  score += numberCount * 0.5;

  const headers = contentEl ? Array.from(contentEl.querySelectorAll("h2,h3")).map(h => cleanText(h.textContent)).filter(Boolean) : [];
  const wordCount = getArticleWordCount(contentEl);
  if(wordCount > 500) score -= 1;
  if(headers.length >= 2) score -= 1;

  typeKonten = score >= 2 ? "NON-EVERGREEN" : "EVERGREEN";

  // ================== SEMBUNYIKAN AUTHOR & TANGGAL JIKA EVERGREEN ==================
  if (typeKonten === "EVERGREEN") {
    console.log("Konten evergreen → sembunyikan author & tanggal");
    const metaBlocks = document.querySelectorAll(
      ".title-secondary, .post-author, .post-timestamp, .post-updated"
    );
    metaBlocks.forEach(el => {
      el.style.display = "none";
    });
  }

  // ================== REKOMENDASI TANGGAL UPDATE ==================
  let nextUpdateDate = new Date(dateModified);
  if(typeKonten === "evergreen"){
    nextUpdateDate.setMonth(nextUpdateDate.getMonth() + 12);
  } else {
    nextUpdateDate.setMonth(nextUpdateDate.getMonth() + 3);
  }
  const options = { day: "numeric", month: "long", year: "numeric" };
  const nextUpdateStr = nextUpdateDate.toLocaleDateString("id-ID", options);

  // ================== UPDATE LAST UPDATED TEXT ==================
  const lastUpdatedEl = document.getElementById("lastUpdatedText");
  if(lastUpdatedEl){
    const dateObj = new Date(dateModified);
    lastUpdatedEl.textContent = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString("id-ID", options) : "-";
  }

  // ================== TAMBAHKAN TYPE KONTEN ==================
  let typeEl = document.createElement("div");
  typeEl.innerHTML = `<b>${typeKonten}</b>, UPDATE KONTEN paling lambat: <b>${nextUpdateStr}</b>`;
  typeEl.setAttribute("data-nosnippet","true");
  typeEl.style.fontSize = "0.85em";
  typeEl.style.color = "#555";
  typeEl.style.marginTop = "4px";
  typeEl.style.marginBottom = "8px";

  const postUpdatedEl = document.querySelector(".post-updated");
  if(postUpdatedEl){
    postUpdatedEl.parentNode.insertBefore(typeEl, postUpdatedEl.nextSibling);
  } else {
    const h1El = document.querySelector("h1");
    if(h1El && h1El.parentNode){
      h1El.parentNode.insertBefore(typeEl, h1El.nextSibling);
    }
  }

  // ================== SCHEMA GENERATOR ==================
  console.log("Auto-schema ARTICLE SCHEMA JS running");

  const stopwords = ["dan","di","ke","dari","yang","untuk","pada","dengan","ini","itu","adalah","juga","atau","sebagai","dalam","oleh","karena","akan","sampai","tidak","dapat","lebih","kami","mereka","anda"];

  const content = document.querySelector(".post-body.entry-content") || document.querySelector("[id^='post-body-']") || document.querySelector(".post-body");
  const h1 = document.querySelector("h1")?.textContent.trim() || "";
  const headers2 = content ? Array.from(content.querySelectorAll("h2,h3")).map(h => cleanText(h.textContent)).filter(Boolean) : [];
  const paragraphs = content ? Array.from(content.querySelectorAll("p")).map(p => cleanText(p.textContent)) : [];
  const allText = headers2.concat(paragraphs).join(" ");

  let words = allText.replace(/[^a-zA-Z0-9 ]/g,"").toLowerCase().split(/\s+/).filter(w => w.length > 3 && !stopwords.includes(w));
  let freq = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  const topWords = Object.keys(freq).sort((a,b) => freq[b]-freq[a]).slice(0,10);

  let keywordsArr = [];
  if(h1) keywordsArr.push(h1);
  if(headers2.length) keywordsArr.push(...headers2.slice(0,2));
  if(topWords.length) keywordsArr.push(...topWords.slice(0,2));
  const keywordsStr = Array.from(new Set(keywordsArr)).slice(0,5).join(", ");
  const articleSectionStr = headers2.length ? headers2.join(", ") : "Artikel";

  const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim();
  const canonicalLink = document.querySelector('link[rel="canonical"]')?.href?.trim();
  const baseUrl = ogUrl || canonicalLink || location.href;
  const url = baseUrl.replace(/[?&]m=1/, "");
  const title = document.title;
  const descMeta = document.querySelector("meta[name='description']")?.content || "";
  const firstImg = document.querySelector(".post-body img")?.src || "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png";

  // ===== POST =====
  const schemaPost = document.getElementById("auto-schema");
  if(schemaPost){
    const postSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "isAccessibleForFree": true,
      "mainEntityOfPage": { "@type": "WebPage", "@id": url+"#webpage" },
      "headline": escapeJSON(title),
      "description": escapeJSON(descMeta),
      "image": [firstImg],
      "author": { "@type": "Organization", "name": "Beton Jaya Readymix" },
      "publisher": { "@type": "Organization", "name": "Beton Jaya Readymix", "logo": { "@type": "ImageObject", "url": firstImg } },
      "datePublished": datePublished,
      "dateModified": dateModified,
      "articleSection": articleSectionStr,
      "keywords": keywordsStr,
      "wordCount": getArticleWordCount(content),
      "articleBody": cleanText(content ? content.textContent : ""),
      "inLanguage": "id-ID"
    };
    schemaPost.textContent = JSON.stringify(postSchema, null, 2);
  }

  // ===== STATIC PAGE =====
  const schemaStatic = document.getElementById("auto-schema-static-page");
  if(schemaStatic){
    const staticSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "isAccessibleForFree": true,
      "mainEntityOfPage": { "@type": "WebPage", "@id": url+"#webpage" },
      "headline": escapeJSON(title),
      "description": escapeJSON(descMeta),
      "image": [firstImg],
      "author": { "@type": "Organization", "name": "Beton Jaya Readymix" },
      "publisher": { "@type": "Organization", "name": "Beton Jaya Readymix", "logo": { "@type": "ImageObject", "url": firstImg } },
      "datePublished": datePublished,
      "dateModified": dateModified,
      "articleSection": articleSectionStr,
      "keywords": keywordsStr,
      "wordCount": getArticleWordCount(content),
      "articleBody": cleanText(content ? content.textContent : ""),
      "inLanguage": "id-ID"
    };
    schemaStatic.textContent = JSON.stringify(staticSchema, null, 2);
  }

  // ===== WEBPAGE =====
  const schemaWeb = document.getElementById("auto-schema-webpage");
  if (schemaWeb) {
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
          "url": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png"
        }
      },
      "inLanguage": "id-ID"
    };
    schemaWeb.textContent = JSON.stringify(webPageSchema, null, 2);
  }
});
