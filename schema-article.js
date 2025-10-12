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
// ⚡ Auto Evergreen Detector v9.2 — Full Hybrid + Dashboard + Smart Suggestions
(function() {
  // ===== 1️⃣ Elemen & Text Detector =====
  const AED_contentEl = document.querySelector("article, main, .post-body");
  const AED_h1El = document.querySelector("h1");
  const AED_h1Text = AED_h1El ? AED_h1El.innerText : "";
  const AED_contentText = (AED_contentEl ? AED_contentEl.innerText : document.body.innerText || "").toLowerCase();
  const AED_textDetector = (AED_h1Text + " " + AED_contentText);

  // ===== 2️⃣ Hitung indikator alami =====
  const AED_wordCount = AED_textDetector.split(/\s+/).filter(Boolean).length;
  const AED_numberCount = (AED_textDetector.match(/\d{1,4}/g) || []).length;
  const AED_percentCount = (AED_textDetector.match(/%|rp|\d+\s?(m|cm|kg|m2|m3|ton|kubik|liter)/g) || []).length;
  const AED_tableCount = document.querySelectorAll("table").length;
  const AED_listCount = document.querySelectorAll("ul,ol").length;
  const AED_h2Count = document.querySelectorAll("h2").length;

  // ===== 3️⃣ Keyword Pattern =====
  const AED_nonEvergreenKeywords = [
    "harga","update","terbaru","berita","jadwal","event","promo","diskon",
    "proyek","progres","bulan","tahun","sementara","deadline","musiman"
  ];
  const AED_evergreenKeywords = [
    "panduan","tutorial","tips","cara","definisi","pandangan","strategi",
    "langkah","prosedur","manfaat","penjelasan","fungsi","teknik","contoh",
    "jenis","panduan lengkap","arti","perbedaan","kegunaan"
  ];

  const AED_hasTimePattern = AED_nonEvergreenKeywords.some(k => new RegExp(`\\b${k}\\b`, 'i').test(AED_textDetector));
  const AED_evergreenIndicators = AED_evergreenKeywords.reduce((acc, k) => acc + (new RegExp(`\\b${k}\\b`, 'i').test(AED_textDetector) ? 1 : 0), 0);

  // ===== 4️⃣ Hitung Skor Hybrid =====
  let AED_score = 0;
  AED_score += AED_numberCount * 0.3;
  AED_score += AED_percentCount * 0.5;
  AED_score += AED_tableCount * 1;
  AED_score -= (AED_wordCount > 1000 ? 1 : 0);
  AED_score -= (AED_h2Count > 2 ? 0.5 : 0);
  AED_score -= (AED_listCount > 0 ? 0.5 : 0);
  AED_score -= AED_evergreenIndicators * 0.5;

  // ===== 5️⃣ Klasifikasi Tipe Konten =====
  let AED_typeKonten = "SEMI-EVERGREEN";
  if ((AED_hasTimePattern && AED_evergreenIndicators <= 1) || AED_score >= 3) {
    AED_typeKonten = "NON-EVERGREEN";
  } else if (AED_evergreenIndicators >= 2 && AED_score <= 1) {
    AED_typeKonten = "EVERGREEN";
  }

  // ===== 6️⃣ Hitung rekomendasi update =====
  const AED_nextUpdate = new Date();
  if (AED_typeKonten === "EVERGREEN") AED_nextUpdate.setMonth(AED_nextUpdate.getMonth() + 12);
  else if (AED_typeKonten === "SEMI-EVERGREEN") AED_nextUpdate.setMonth(AED_nextUpdate.getMonth() + 6);
  else AED_nextUpdate.setMonth(AED_nextUpdate.getMonth() + 3);

  const AED_options = { day: "numeric", month: "long", year: "numeric" };
  const AED_nextUpdateStr = AED_nextUpdate.toLocaleDateString("id-ID", AED_options);
  const AED_dateModifiedStr = new Date(dateModified).toLocaleDateString("id-ID", AED_options);

  // ===== 7️⃣ Label tipe konten di halaman =====
  if (AED_h1El) {
    const AED_label = document.createElement("div");
    AED_label.innerHTML = `<b>${AED_typeKonten}</b> — pembaruan berikutnya: <b>${AED_nextUpdateStr}</b>`;
    AED_label.setAttribute("data-nosnippet","true");
    AED_label.style.fontSize = "0.9em";
    AED_label.style.color = "#444";
    AED_label.style.marginTop = "4px";
    AED_label.style.marginBottom = "10px";

    if (AED_typeKonten === "NON-EVERGREEN") {
      AED_h1El.parentNode.insertBefore(AED_label, AED_h1El);
    } else {
      AED_h1El.insertAdjacentElement("afterend", AED_label);
    }
  }

  // ===== 8️⃣ Author + Tanggal Update =====
  const AED_authorEl = document.querySelector(".post-author .fn");
  if (AED_authorEl) {
    if (AED_typeKonten === "SEMI-EVERGREEN") {
      const AED_dateEl = document.createElement("span");
      AED_dateEl.textContent = ` · Diperbarui: ${AED_dateModifiedStr}`;
      AED_dateEl.style.fontSize = "0.85em";
      AED_dateEl.style.color = "#555";
      AED_dateEl.style.marginLeft = "4px";
      AED_authorEl.appendChild(AED_dateEl);
    } else if (AED_typeKonten === "NON-EVERGREEN") {
      const AED_dateEl = document.createElement("div");
      AED_dateEl.textContent = `Diperbarui: ${AED_dateModifiedStr}`;
      AED_dateEl.style.fontSize = "0.85em";
      AED_dateEl.style.color = "#555";
      AED_dateEl.style.marginBottom = "4px";
      AED_dateEl.setAttribute("data-nosnippet","true");
      AED_h1El.parentNode.insertBefore(AED_dateEl, AED_h1El);
    } 
    if (AED_typeKonten === "EVERGREEN") {
      const AED_metaBlocks = document.querySelectorAll(".post-author, .post-timestamp, .post-updated, .title-secondary");
      AED_metaBlocks.forEach(el => el.style.display = "none");
    }
  }

  // ===== 9️⃣ Dashboard Blogspot =====
  let AED_dashboardTable = document.getElementById("AED_dashboardTable");
  if (!AED_dashboardTable) {
    AED_dashboardTable = document.createElement("table");
    AED_dashboardTable.id = "AED_dashboardTable";
    AED_dashboardTable.style.width = "100%";
    AED_dashboardTable.style.borderCollapse = "collapse";
    AED_dashboardTable.style.marginTop = "20px";
    AED_dashboardTable.innerHTML = `
      <thead>
        <tr style="background:#f0f0f0;">
          <th style="padding:4px;border:1px solid #ccc;">Halaman</th>
          <th style="padding:4px;border:1px solid #ccc;">Type</th>
          <th style="padding:4px;border:1px solid #ccc;">Score</th>
          <th style="padding:4px;border:1px solid #ccc;">Word</th>
          <th style="padding:4px;border:1px solid #ccc;">Tanggal Publish</th>
          <th style="padding:4px;border:1px solid #ccc;">Tanggal Update</th>
          <th style="padding:4px;border:1px solid #ccc;">Saran Konten</th>
        </tr>
      </thead>
    `;
    const AED_tbody = document.createElement("tbody");
    AED_dashboardTable.appendChild(AED_tbody);
    document.body.appendChild(AED_dashboardTable);
  }

  let AED_tbody = AED_dashboardTable.querySelector("tbody");
  if (!AED_tbody) {
    AED_tbody = document.createElement("tbody");
    AED_dashboardTable.appendChild(AED_tbody);
  }

  // ===== 10️⃣ Ambil tanggal publish & modified =====
  const AED_datePublishedEl = document.querySelector("meta[itemprop='datePublished']");
  const AED_datePublishedValue = AED_datePublishedEl ? new Date(AED_datePublishedEl.content) : new Date();
  const AED_datePublishedStr = AED_datePublishedValue.toLocaleDateString("id-ID", AED_options);
  const AED_dateModifiedValue = new Date(dateModified);
  const AED_dateModifiedStrtbody = AED_dateModifiedValue.toLocaleDateString("id-ID", AED_options);

  // ===== 11️⃣ Saran Konten Otomatis =====
  let AED_suggestion = "";
  if (AED_typeKonten === "EVERGREEN") {
    AED_suggestion = `Konten evergreen: pertahankan H1 (${AED_h1Text}), gunakan subjudul H2 relevan, fokus tips/tutorial, update minimal tahunan.`;
  } else if (AED_typeKonten === "SEMI-EVERGREEN") {
    AED_suggestion = `Konten semi-evergreen: perkuat H1 (${AED_h1Text}), tambahkan data/angka terbaru, pertahankan list & langkah-langkah, update tiap 3-6 bulan.`;
  } else {
    AED_suggestion = `Konten non-evergreen: fokus update rutin, angka/harga terbaru, tampilkan tanggal jelas, review konten tiap 1-3 bulan.`;
  }

  // ===== 12️⃣ Tambahkan row ke dashboard =====
  const AED_pageTitle = AED_h1Text || document.title || "Unknown Page";
  const AED_row = document.createElement("tr");
  AED_row.innerHTML = `
    <td style="padding:4px;border:1px solid #ccc;">${AED_pageTitle}</td>
    <td style="padding:4px;border:1px solid #ccc;">${AED_typeKonten}</td>
    <td style="padding:4px;border:1px solid #ccc;">${AED_score.toFixed(1)}</td>
    <td style="padding:4px;border:1px solid #ccc;">${AED_wordCount}</td>
    <td style="padding:4px;border:1px solid #ccc;">${AED_datePublishedStr}</td>
    <td style="padding:4px;border:1px solid #ccc;">${AED_dateModifiedStrtbody}</td>
    <td style="padding:4px;border:1px solid #ccc;">${AED_suggestion}</td>
  `;
  AED_tbody.appendChild(AED_row);

  // ===== 13️⃣ Simpan ke Window untuk Schema / Automation =====
  window.AED_typeKonten = AED_typeKonten;
  window.AED_nextUpdateStr = AED_nextUpdateStr;
  window.AED_dateModifiedStr = AED_dateModifiedStrtbody;
  window.AED_evergreenScore = AED_score.toFixed(1);
  window.AED_wordCount = AED_wordCount;
  window.AED_contentSuggestion = AED_suggestion;

  console.log(`🧠 [EvergreenAI v9.2 Insight] ${AED_typeKonten} | Score: ${AED_score.toFixed(1)} | Word: ${AED_wordCount}`);
  console.log(`📅 Next Update: ${AED_nextUpdateStr} | Last Modified: ${AED_dateModifiedStrtbody}`);
  console.log(`💡 Saran Konten: ${AED_suggestion}`);
})();
  
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
