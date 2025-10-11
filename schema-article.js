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

// === 🧠 EVERGREEN AI v3 — Adaptive SEO Detector + Auto Price Validity ===
function detectEvergreenAI() {
  const h1 = (document.querySelector("h1")?.innerText || "").toLowerCase();
  const content = Array.from(document.querySelectorAll("article p, main p, .post-body p"))
    .map(p => p.innerText)
    .join(" ")
    .toLowerCase();
  const text = (h1 + " " + content).replace(/\s+/g, " ");

  // ===== 1️⃣ Keyword Pattern (umum + industri konstruksi)
  const nonEvergreenKeywords = [
    "harga","update","terbaru","berita","jadwal","event","promo","diskon",
    "proyek","progres","bulan","tahun","sementara","musiman","penawaran",
    "stok","kontrak","laporan","estimasi","kuota","perubahan","sementara"
  ];

  const evergreenKeywords = [
    "panduan","tutorial","tips","cara","definisi","strategi","langkah",
    "prosedur","manfaat","fungsi","jenis","contoh","teknik","pengertian",
    "kegunaan","struktur","standar","material","spesifikasi","panduan lengkap"
  ];

  const semiEvergreenKeywords = [
    "harga beton","harga ready mix","harga u ditch","harga precast",
    "sewa","rental","kontraktor","pembangunan","analisa harga satuan",
    "review","perbandingan","tren","pasar","industri konstruksi"
  ];

  // ===== 2️⃣ Deteksi Time-Sensitive
  const hasTimePattern = /\b(20\d{2}|harga|tarif|update|promo|diskon|bulan|minggu|sementara|terbaru)\b/.test(text);

  const nonEvergreenHits = nonEvergreenKeywords.filter(k => text.includes(k)).length;
  const evergreenHits = evergreenKeywords.filter(k => text.includes(k)).length;
  const semiEvergreenHits = semiEvergreenKeywords.filter(k => text.includes(k)).length;

  // ===== 3️⃣ Struktur & Panjang Konten
  const paragraphCount = content.split(/\n{2,}/).filter(p => p.trim().length > 50).length;
  const tableCount = document.querySelectorAll("table").length;
  const listCount = document.querySelectorAll("article ol, article ul").length;
  const wordCount = content.split(/\s+/).length;

  // ===== 4️⃣ Skoring
  let evergreenScore = evergreenHits * 2 + paragraphCount + listCount;
  let semiScore = semiEvergreenHits + (hasTimePattern ? 1 : 0);
  let nonScore = nonEvergreenHits * 1.5 + tableCount;

  if (wordCount > 800) evergreenScore += 2;
  if (tableCount > 0) evergreenScore -= 2;

  // ===== 5️⃣ Klasifikasi
  let resultType = "semi-evergreen";
  if (nonScore >= evergreenScore && nonScore > 3) resultType = "non-evergreen";
  else if (evergreenScore >= semiScore + 2 && !hasTimePattern) resultType = "evergreen";

  console.log(`[Evergreen AI ✅] Type: ${resultType}, EvergreenScore: ${evergreenScore}, SemiScore: ${semiScore}, NonScore: ${nonScore}`);
  return resultType;
}

// === 🔁 Jalankan Deteksi
const evergreenType = detectEvergreenAI();

// === 📆 AUTO PRICE VALID UNTIL (Berdasarkan Jenis Konten)
const now = new Date();
const priceValidUntil = new Date(now);

/*
📘 Standar pakar SEO:
- Evergreen → relevan ≥12 bulan (update tahunan)
- Semi-evergreen → relevan 6 bulan
- Non-evergreen → relevan <3 bulan (update maksimal 3 bulan)
*/
if (evergreenType === "evergreen") {
  priceValidUntil.setFullYear(now.getFullYear() + 1);
} else if (evergreenType === "semi-evergreen") {
  priceValidUntil.setMonth(now.getMonth() + 6);
} else {
  priceValidUntil.setMonth(now.getMonth() + 3); // ✅ paling ideal SEO
}

const autoPriceValidUntil = priceValidUntil.toISOString().split("T")[0];
console.log(`[Auto PriceValidUntil 📅] ${autoPriceValidUntil} (${evergreenType.toUpperCase()})`);

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
