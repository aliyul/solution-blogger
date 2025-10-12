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
// ⚡ Auto Evergreen Detector v9.5 Pro Ultimate + Author Date Logic Integrated
(function() {
  // ===== 1️⃣ Elemen & Text Detector =====
  const elContent = document.querySelector("article, main, .post-body");
  const elH1 = document.querySelector("h1");
  const h1Text = elH1 ? elH1.innerText.trim() : "";
  const textContent = (elContent ? elContent.innerText : document.body.innerText || "").toLowerCase();
  const fullText = (h1Text + " " + textContent);

  // ===== 2️⃣ Hitung indikator alami =====
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  const numberCount = (fullText.match(/\d{1,4}/g) || []).length;
  const percentCount = (fullText.match(/%|rp|\d+\s?(m|cm|kg|m2|m3|m³|ton|kubik|liter)/gi) || []).length;
  const tableCount = document.querySelectorAll("table").length;
  const listCount = document.querySelectorAll("ul,ol").length;
  const h2Els = document.querySelectorAll("h2");
  const h3Els = document.querySelectorAll("h3");

  // ===== 3️⃣ Keyword Pattern =====
  const nonEvergreen = ["harga","update","terbaru","berita","jadwal","event","promo","diskon","proyek","progres","bulan","tahun","sementara","deadline","musiman"];
  const evergreen = ["panduan","tutorial","tips","cara","definisi","pandangan","strategi","langkah","prosedur","manfaat","penjelasan","fungsi","teknik","contoh","jenis","arti","perbedaan","kegunaan"];

  const hasTimePattern = nonEvergreen.some(k => new RegExp(`\\b${k}\\b`, 'i').test(fullText));
  const evergreenIndicators = evergreen.reduce((acc, k) => acc + (new RegExp(`\\b${k}\\b`, 'i').test(fullText) ? 1 : 0), 0);

  // ===== 4️⃣ Hitung Skor Hybrid =====
  let score = 0;
  score += numberCount * 0.3;
  score += percentCount * 0.5;
  score += tableCount * 1;
  score -= (wordCount > 1000 ? 1 : 0);
  score -= (h2Els.length > 2 ? 0.5 : 0);
  score -= (listCount > 0 ? 0.5 : 0);
  score -= evergreenIndicators * 0.5;

  // ===== 5️⃣ Klasifikasi Tipe Konten =====
  let type = "SEMI-EVERGREEN";
  if ((hasTimePattern && evergreenIndicators <= 1) || score >= 3) type = "NON-EVERGREEN";
  else if (evergreenIndicators >= 2 && score <= 1) type = "EVERGREEN";

  // ===== 6️⃣ Hitung rekomendasi update =====
  const nextUpdate = new Date();
  if (type === "EVERGREEN") nextUpdate.setMonth(nextUpdate.getMonth() + 12);
  else if (type === "SEMI-EVERGREEN") nextUpdate.setMonth(nextUpdate.getMonth() + 6);
  else nextUpdate.setMonth(nextUpdate.getMonth() + 3);
  const options = { day: "numeric", month: "long", year: "numeric" };
  const nextUpdateStr = nextUpdate.toLocaleDateString("id-ID", options);

  // ===== 7️⃣ Label tipe konten =====
  if (elH1) {
    const label = document.createElement("div");
    label.innerHTML = `<b>${type}</b> — pembaruan berikutnya: <b>${nextUpdateStr}</b>`;
    label.setAttribute("data-nosnippet","true");
    label.style.fontSize = "0.9em";
    label.style.color = "#444";
    label.style.marginTop = "4px";
    elH1.insertAdjacentElement("afterend", label);
  }

  // ===== 🆕 8️⃣ Author + Tanggal Update (dari v9.2) =====
  const dateModified = new Date(document.lastModified);
  const AED_dateModifiedStr = dateModified.toLocaleDateString("id-ID", options);
  const AED_authorEl = document.querySelector(".post-author .fn");
  if (AED_authorEl) {
    if (type === "SEMI-EVERGREEN") {
      const AED_dateEl = document.createElement("span");
      AED_dateEl.textContent = ` · Diperbarui: ${AED_dateModifiedStr}`;
      AED_dateEl.style.fontSize = "0.85em";
      AED_dateEl.style.color = "#555";
      AED_dateEl.style.marginLeft = "4px";
      AED_authorEl.appendChild(AED_dateEl);
    } else if (type === "NON-EVERGREEN") {
      const AED_dateEl = document.createElement("div");
      AED_dateEl.textContent = `Diperbarui: ${AED_dateModifiedStr}`;
      AED_dateEl.style.fontSize = "0.85em";
      AED_dateEl.style.color = "#555";
      AED_dateEl.style.marginBottom = "4px";
      AED_dateEl.setAttribute("data-nosnippet","true");
      elH1.parentNode.insertBefore(AED_dateEl, elH1);
    } 
    if (type === "EVERGREEN") {
      const AED_metaBlocks = document.querySelectorAll(".post-author, .post-timestamp, .post-updated, .title-secondary");
      AED_metaBlocks.forEach(el => el.style.display = "none");
    }
  }

  // ===== 9️⃣ Deteksi URL vs H1 + rekomendasi H1 =====
  let urlRaw = window.location.pathname.split("/").filter(Boolean).pop() || "";
  urlRaw = urlRaw.replace(/^p\//, "").replace(/\.html$/i, "").replace(/\b(0?[1-9]|1[0-2]|20\d{2})\b/g, "").replace(/[-_]/g, " ").trim().toLowerCase();
  const h1Diff = urlRaw !== h1Text.toLowerCase();
  const recommendedH1 = h1Diff ? urlRaw.split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ") : h1Text;

  // ===== 🔟 Meta Description Otomatis =====
  const sentences = textContent.split(/\.|\n/).filter(Boolean);
  let metaDesc = sentences.slice(0,3).join(". ").substring(0,160).trim();
  if (metaDesc.length < 50) metaDesc = recommendedH1 + " — " + sentences.slice(0,2).join(". ").trim();

  // ===== 1️⃣1️⃣ H2/H3 SEO Silo Dinamis & Missing Section =====
  const existingH2 = [...h2Els].map(h=>h.innerText.trim().toLowerCase());
  const wordFreq = {};
  textContent.split(/\s+/).forEach(w => {
    w=w.replace(/[^a-zA-Z0-9]/g,'').trim();
    if(w.length>3) wordFreq[w] = (wordFreq[w]||0)+1;
  });
  const topWords = Object.entries(wordFreq).sort((a,b)=>b[1]-a[1]).slice(0,10).map(k=>k[0]);
  const predictedH2 = topWords.filter(k=>!existingH2.some(h=>h.includes(k.toLowerCase())));
  const predictedH3 = predictedH2.map(k=>"Sub-topik: "+k);

  // ===== 1️⃣2️⃣ Highlight angka penting =====
  const highlightMatches = (fullText.match(/\d+(\.\d+)?|\d+\s?(m|cm|kg|m2|m3|m³|ton|kubik|liter)|rp|\%/gi) || []).join(", ");

  // ===== 1️⃣3️⃣ Solusi & Rekomendasi =====
  const solution = h1Diff
    ? `⚠️ H1 berbeda dari URL (“${urlRaw}”) → Revisi H1: "${recommendedH1}".\nHighlight: ${highlightMatches}\nTambahkan H2/H3: ${predictedH2.join(", ")}`
    : `✅ H1 sesuai URL.\nHighlight: ${highlightMatches}\nTambahkan H2/H3: ${predictedH2.join(", ")}`;

  let suggestion = "";
  if (type === "EVERGREEN")
    suggestion = `Konten evergreen: pertahankan H1 (${recommendedH1}), gunakan H2/H3 relevan, fokus tips/tutorial, update tahunan.\n${solution}`;
  else if (type === "SEMI-EVERGREEN")
    suggestion = `Konten semi-evergreen: tambahkan data terbaru, pertahankan struktur & langkah-langkah, update tiap 3–6 bulan.\n${solution}`;
  else
    suggestion = `Konten non-evergreen: fokus pada update harga/data terbaru, tampilkan tanggal jelas, update 1–3 bulan.\n${solution}`;

  // ===== 1️⃣4️⃣ Dashboard Blogspot =====
  let table = document.getElementById("AEDv95_dashboardTable");
  if (!table) {
    table = document.createElement("table");
    table.id = "AEDv95_dashboardTable";
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.marginTop = "20px";
    table.innerHTML = `
      <thead>
        <tr style="background:#f0f0f0;">
          <th style="padding:4px;border:1px solid #ccc;">Halaman</th>
          <th style="padding:4px;border:1px solid #ccc;">Type</th>
          <th style="padding:4px;border:1px solid #ccc;">Score</th>
          <th style="padding:4px;border:1px solid #ccc;">Word</th>
          <th style="padding:4px;border:1px solid #ccc;">Rekom H1</th>
          <th style="padding:4px;border:1px solid #ccc;">Meta Description</th>
          <th style="padding:4px;border:1px solid #ccc;">Struktur Heading</th>
          <th style="padding:4px;border:1px solid #ccc;">Saran Konten</th>
        </tr>
      </thead><tbody></tbody>`;
    document.body.appendChild(table);
  }

  const tbody = table.querySelector("tbody");
  const pageTitle = h1Text || document.title || "Unknown Page";
  const row = document.createElement("tr");
  row.innerHTML = `
    <td style="padding:4px;border:1px solid #ccc;">${pageTitle}</td>
    <td style="padding:4px;border:1px solid #ccc;">${type}</td>
    <td style="padding:4px;border:1px solid #ccc;">${score.toFixed(1)}</td>
    <td style="padding:4px;border:1px solid #ccc;">${wordCount}</td>
    <td style="padding:4px;border:1px solid #ccc;">${recommendedH1}</td>
    <td style="padding:4px;border:1px solid #ccc;">${metaDesc}</td>
    <td style="padding:4px;border:1px solid #ccc;white-space:pre-wrap;">${predictedH2.join(", ")}</td>
    <td style="padding:4px;border:1px solid #ccc;white-space:pre-wrap;">${suggestion}</td>`;
  tbody.appendChild(row);

  // ===== 1️⃣5️⃣ Simpan ke Window =====
  Object.assign(window, {
    AEDv95_type: type,
    AEDv95_nextUpdate: nextUpdateStr,
    AEDv95_score: score.toFixed(1),
    AEDv95_wordCount: wordCount,
    AEDv95_recommendedH1: recommendedH1,
    AEDv95_metaDescription: metaDesc,
    AEDv95_predictedH2: predictedH2,
    AEDv95_suggestion: suggestion
  });

  console.log(`🧠 [EvergreenAI v9.5 Pro Ultimate+] ${type} | Score ${score.toFixed(1)} | Word ${wordCount}`);
  console.log(`💡 H1: ${recommendedH1} | Meta: ${metaDesc}`);
  console.log(`💡 H2/H3 Prediksi: ${predictedH2.join(", ")}`);
  console.log(`💡 Saran: ${suggestion}`);
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
