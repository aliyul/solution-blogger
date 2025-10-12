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
// ⚡ Auto Evergreen Detector v9.3 Plus Complete
(function() {
  // ===== 1️⃣ Elemen & Text Detector =====
  const AEDv93_contentEl = document.querySelector("article, main, .post-body");
  const AEDv93_h1El = document.querySelector("h1");
  const AEDv93_h1Text = AEDv93_h1El ? AEDv93_h1El.innerText : "";
  const AEDv93_contentText = (AEDv93_contentEl ? AEDv93_contentEl.innerText : document.body.innerText || "").toLowerCase();
  const AEDv93_textDetector = (AEDv93_h1Text + " " + AEDv93_contentText);

  // ===== 2️⃣ Hitung indikator alami =====
  const AEDv93_wordCount = AEDv93_textDetector.split(/\s+/).filter(Boolean).length;
  const AEDv93_numberCount = (AEDv93_textDetector.match(/\d{1,4}/g) || []).length;
  const AEDv93_percentCount = (AEDv93_textDetector.match(/%|rp|\d+\s?(m|cm|kg|m2|m3|ton|kubik|liter)/g) || []).length;
  const AEDv93_tableCount = document.querySelectorAll("table").length;
  const AEDv93_listCount = document.querySelectorAll("ul,ol").length;
  const AEDv93_h2Count = document.querySelectorAll("h2").length;

  // ===== 3️⃣ Keyword Pattern =====
  const AEDv93_nonEvergreenKeywords = ["harga","update","terbaru","berita","jadwal","event","promo","diskon","proyek","progres","bulan","tahun","sementara","deadline","musiman"];
  const AEDv93_evergreenKeywords = ["panduan","tutorial","tips","cara","definisi","pandangan","strategi","langkah","prosedur","manfaat","penjelasan","fungsi","teknik","contoh","jenis","panduan lengkap","arti","perbedaan","kegunaan"];

  const AEDv93_hasTimePattern = AEDv93_nonEvergreenKeywords.some(k => new RegExp(`\\b${k}\\b`, 'i').test(AEDv93_textDetector));
  const AEDv93_evergreenIndicators = AEDv93_evergreenKeywords.reduce((acc, k) => acc + (new RegExp(`\\b${k}\\b`, 'i').test(AEDv93_textDetector) ? 1 : 0), 0);

  // ===== 4️⃣ Hitung Skor Hybrid =====
  let AEDv93_score = 0;
  AEDv93_score += AEDv93_numberCount * 0.3;
  AEDv93_score += AEDv93_percentCount * 0.5;
  AEDv93_score += AEDv93_tableCount * 1;
  AEDv93_score -= (AEDv93_wordCount > 1000 ? 1 : 0);
  AEDv93_score -= (AEDv93_h2Count > 2 ? 0.5 : 0);
  AEDv93_score -= (AEDv93_listCount > 0 ? 0.5 : 0);
  AEDv93_score -= AEDv93_evergreenIndicators * 0.5;

  // ===== 5️⃣ Klasifikasi Tipe Konten =====
  let AEDv93_typeKonten = "SEMI-EVERGREEN";
  if ((AEDv93_hasTimePattern && AEDv93_evergreenIndicators <= 1) || AEDv93_score >= 3) {
    AEDv93_typeKonten = "NON-EVERGREEN";
  } else if (AEDv93_evergreenIndicators >= 2 && AEDv93_score <= 1) {
    AEDv93_typeKonten = "EVERGREEN";
  }

  // ===== 6️⃣ Hitung rekomendasi update =====
  const AEDv93_nextUpdate = new Date();
  if (AEDv93_typeKonten === "EVERGREEN") AEDv93_nextUpdate.setMonth(AEDv93_nextUpdate.getMonth() + 12);
  else if (AEDv93_typeKonten === "SEMI-EVERGREEN") AEDv93_nextUpdate.setMonth(AEDv93_nextUpdate.getMonth() + 6);
  else AEDv93_nextUpdate.setMonth(AEDv93_nextUpdate.getMonth() + 3);

  const AEDv93_options = { day: "numeric", month: "long", year: "numeric" };
  const AEDv93_nextUpdateStr = AEDv93_nextUpdate.toLocaleDateString("id-ID", AEDv93_options);
  const AEDv93_dateModifiedStr = new Date(dateModified).toLocaleDateString("id-ID", AEDv93_options);

  // ===== 7️⃣ Label tipe konten di halaman =====
  if (AEDv93_h1El) {
    const AEDv93_label = document.createElement("div");
    AEDv93_label.innerHTML = `<b>${AEDv93_typeKonten}</b> — pembaruan berikutnya: <b>${AEDv93_nextUpdateStr}</b>`;
    AEDv93_label.setAttribute("data-nosnippet","true");
    AEDv93_label.style.fontSize = "0.9em";
    AEDv93_label.style.color = "#444";
    AEDv93_label.style.marginTop = "4px";
    AEDv93_label.style.marginBottom = "10px";

    if (AEDv93_typeKonten === "NON-EVERGREEN") {
      AEDv93_h1El.parentNode.insertBefore(AEDv93_label, AEDv93_h1El);
    } else {
      AEDv93_h1El.insertAdjacentElement("afterend", AEDv93_label);
    }
  }

  // ===== 8️⃣ Author + Tanggal Update =====
  const AEDv93_authorEl = document.querySelector(".post-author .fn");
  if (AEDv93_authorEl) {
    if (AEDv93_typeKonten === "SEMI-EVERGREEN") {
      const AEDv93_dateEl = document.createElement("span");
      AEDv93_dateEl.textContent = ` · Diperbarui: ${AEDv93_dateModifiedStr}`;
      AEDv93_dateEl.style.fontSize = "0.85em";
      AEDv93_dateEl.style.color = "#555";
      AEDv93_dateEl.style.marginLeft = "4px";
      AEDv93_authorEl.appendChild(AEDv93_dateEl);
    } else if (AEDv93_typeKonten === "NON-EVERGREEN") {
      const AEDv93_dateEl = document.createElement("div");
      AEDv93_dateEl.textContent = `Diperbarui: ${AEDv93_dateModifiedStr}`;
      AEDv93_dateEl.style.fontSize = "0.85em";
      AEDv93_dateEl.style.color = "#555";
      AEDv93_dateEl.style.marginBottom = "4px";
      AEDv93_dateEl.setAttribute("data-nosnippet","true");
      AEDv93_h1El.parentNode.insertBefore(AEDv93_dateEl, AEDv93_h1El);
    } 
    if (AEDv93_typeKonten === "EVERGREEN") {
      const AEDv93_metaBlocks = document.querySelectorAll(".post-author, .post-timestamp, .post-updated, .title-secondary");
      AEDv93_metaBlocks.forEach(el => el.style.display = "none");
    }
  }

  // ===== 9️⃣ Dashboard Blogspot =====
  let AEDv93_dashboardTable = document.getElementById("AEDv93_dashboardTable");
  if (!AEDv93_dashboardTable) {
    AEDv93_dashboardTable = document.createElement("table");
    AEDv93_dashboardTable.id = "AEDv93_dashboardTable";
    AEDv93_dashboardTable.style.width = "100%";
    AEDv93_dashboardTable.style.borderCollapse = "collapse";
    AEDv93_dashboardTable.style.marginTop = "20px";
    AEDv93_dashboardTable.innerHTML = `
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
    const AEDv93_tbody = document.createElement("tbody");
    AEDv93_dashboardTable.appendChild(AEDv93_tbody);
    document.body.appendChild(AEDv93_dashboardTable);
  }

  let AEDv93_tbody = AEDv93_dashboardTable.querySelector("tbody");
  if (!AEDv93_tbody) {
    AEDv93_tbody = document.createElement("tbody");
    AEDv93_dashboardTable.appendChild(AEDv93_tbody);
  }

  // ===== 10️⃣ Ambil tanggal publish & modified =====
  const AEDv93_datePublishedEl = document.querySelector("meta[itemprop='datePublished']");
  const AEDv93_datePublishedValue = AEDv93_datePublishedEl ? new Date(AEDv93_datePublishedEl.content) : new Date();
  const AEDv93_datePublishedStr = AEDv93_datePublishedValue.toLocaleDateString("id-ID", AEDv93_options);
  const AEDv93_dateModifiedValue = new Date(dateModified);
  const AEDv93_dateModifiedStrtbody = AEDv93_dateModifiedValue.toLocaleDateString("id-ID", AEDv93_options);

  // ===== 11️⃣ Deteksi URL vs H1 =====
  const AEDv93_urlName = window.location.pathname.split("/").filter(Boolean).pop() || "";
  const AEDv93_urlWords = AEDv93_urlName.replace(/[-_]/g," ").toLowerCase();
  const AEDv93_H1vsURLdiff = AEDv93_urlWords !== AEDv93_h1Text.toLowerCase();

  // ===== 12️⃣ Highlight kata/angka penting =====
  const AEDv93_highlightMatches = (AEDv93_textDetector.match(/\d+(\.\d+)?|\d+\s?(m|cm|kg|m2|m3|ton|kubik|liter)|rp|\%/gi) || []).join(", ");

  // ===== 13️⃣ Saran Konten Otomatis =====
  let AEDv93_suggestion = "";
  if (AEDv93_typeKonten === "EVERGREEN") {
    AEDv93_suggestion = `Konten evergreen: pertahankan H1 (${AEDv93_h1Text}), gunakan subjudul H2 relevan, fokus tips/tutorial, update minimal tahunan. Highlight penting: ${AEDv93_highlightMatches}`;
    if(AEDv93_H1vsURLdiff) AEDv93_suggestion += ` | Catatan: H1 berbeda dari URL (${AEDv93_urlName})`;
  } else if (AEDv93_typeKonten === "SEMI-EVERGREEN") {
    AEDv93_suggestion = `Konten semi-evergreen: perkuat H1 (${AEDv93_h1Text}), tambahkan data/angka terbaru, pertahankan list & langkah-langkah, update tiap 3-6 bulan. Highlight penting: ${AEDv93_highlightMatches}`;
    if(AEDv93_H1vsURLdiff) AEDv93_suggestion += ` | Catatan: H1 berbeda dari URL (${AEDv93_urlName})`;
  } else {
    AEDv93_suggestion = `Konten non-evergreen: fokus update rutin, angka/harga terbaru, tampilkan tanggal jelas, review konten tiap 1-3 bulan. Highlight penting: ${AEDv93_highlightMatches}`;
    if(AEDv93_H1vsURLdiff) AEDv93_suggestion += ` | Catatan: H1 berbeda dari URL (${AEDv93_urlName})`;
  }

  // ===== 14️⃣ Tambahkan row ke dashboard =====
  const AEDv93_pageTitle = AEDv93_h1Text || document.title || "Unknown Page";
  const AEDv93_row = document.createElement("tr");
  AEDv93_row.innerHTML = `
    <td style="padding:4px;border:1px solid #ccc;">${AEDv93_pageTitle}</td>
    <td style="padding:4px;border:1px solid #ccc;">${AEDv93_typeKonten}</td>
    <td style="padding:4px;border:1px solid #ccc;">${AEDv93_score.toFixed(1)}</td>
    <td style="padding:4px;border:1px solid #ccc;">${AEDv93_wordCount}</td>
    <td style="padding:4px;border:1px solid #ccc;">${AEDv93_datePublishedStr}</td>
    <td style="padding:4px;border:1px solid #ccc;">${AEDv93_dateModifiedStrtbody}</td>
    <td style="padding:4px;border:1px solid #ccc;">${AEDv93_suggestion}</td>
  `;
  AEDv93_tbody.appendChild(AEDv93_row);

  // ===== 15️⃣ Simpan ke Window untuk Schema / Automation =====
  window.AEDv93_typeKonten = AEDv93_typeKonten;
  window.AEDv93_nextUpdateStr = AEDv93_nextUpdateStr;
  window.AEDv93_dateModifiedStr = AEDv93_dateModifiedStrtbody;
  window.AEDv93_evergreenScore = AEDv93_score.toFixed(1);
  window.AEDv93_wordCount = AEDv93_wordCount;
  window.AEDv93_contentSuggestion = AEDv93_suggestion;
  window.AEDv93_H1vsURLdiff = AEDv93_H1vsURLdiff;

  console.log(`🧠 [EvergreenAI v9.3 Plus Complete] ${AEDv93_typeKonten} | Score: ${AEDv93_score.toFixed(1)} | Word: ${AEDv93_wordCount}`);
  console.log(`📅 Next Update: ${AEDv93_nextUpdateStr} | Last Modified: ${AEDv93_dateModifiedStrtbody}`);
  console.log(`💡 Saran Konten: ${AEDv93_suggestion}`);
  if(AEDv93_H1vsURLdiff) console.log(`⚠️ H1 berbeda dari URL (${AEDv93_urlName})`);
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
