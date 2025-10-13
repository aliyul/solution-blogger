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
// ⚡ Auto Evergreen Detector v10.0 — Visual Insight + SmartContext + Dual Action Dashboard
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

  // ===== 🧠 8️⃣ SmartContext — Analisis Nama URL & Konteks =====
  let urlRaw = window.location.pathname.split("/").filter(Boolean).pop() || "";
  urlRaw = urlRaw.replace(/^p\//, "").replace(/\.html$/i, "").replace(/\b(0?[1-9]|1[0-2]|20\d{2})\b/g, "").replace(/[-_]/g, " ").trim().toLowerCase();
  const h1Diff = urlRaw !== h1Text.toLowerCase();
  const recommendedH1 = urlRaw
    ? urlRaw.split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")
    : h1Text;

  // ===== 9️⃣ Meta Description Otomatis =====
  const sentences = textContent.split(/\.|\n/).filter(Boolean);
  let metaDesc = sentences.slice(0,3).join(". ").substring(0,160).trim();
  if (metaDesc.length < 50) metaDesc = recommendedH1 + " — " + sentences.slice(0,2).join(". ").trim();

  // ===== 🔟 Smart Contextual Signal =====
  const contextSignal = urlRaw.includes("harga") || urlRaw.includes("update") ? "NON-EVERGREEN"
    : evergreen.some(k => urlRaw.includes(k)) ? "EVERGREEN" : "SEMI-EVERGREEN";

  // ===== 1️⃣1️⃣ Highlight Data =====
  const highlightMatches = (fullText.match(/\d+(\.\d+)?|\d+\s?(m|cm|kg|m2|m3|m³|ton|kubik|liter)|rp|\%/gi) || []);
  highlightMatches.forEach(m => {
    const regex = new RegExp(m, "gi");
    if (elContent) elContent.innerHTML = elContent.innerHTML.replace(regex, `<mark style="background:yellow;color:#000;">${m}</mark>`);
  });

  // ===== 1️⃣2️⃣ Visual Insight Bar =====
  const insightBar = document.createElement("div");
  insightBar.innerHTML = `
    <div style="padding:10px;margin:15px 0;border:2px solid #0078ff;border-radius:8px;background:#e7f3ff;" data-nosnippet="true">
      <b>🔍 Visual Insight AI:</b> <span style="color:#0078ff;">${type}</span> vs URL Signal <b>${contextSignal}</b><br>
      <small>Score: ${score.toFixed(1)} | Words: ${wordCount} | Update berikutnya: ${nextUpdateStr}</small>
    </div>`;
  if (elContent) elContent.insertAdjacentElement("beforebegin", insightBar);

  // ===== 1️⃣3️⃣ Struktur Heading Rekomendasi =====
  const structureAdvice = {
    EVERGREEN: "Gunakan H2 seperti 'Panduan', 'Langkah-langkah', 'Manfaat', lalu detail di H3.",
    "SEMI-EVERGREEN": "Gunakan H2 untuk 'Data', 'Analisis', atau 'Perbandingan', dan H3 untuk update ringan.",
    "NON-EVERGREEN": "Gunakan H2 seperti 'Harga', 'Wilayah', 'Periode', dan tabel dinamis dengan tanggal terbaru."
  };

  const optimizationSuggestion =
    type !== contextSignal
      ? `⚠️ Konten terdeteksi ${type}, namun URL mengarah ke ${contextSignal}. Ubah gaya atau struktur konten agar sesuai intent.`
      : `✅ Struktur konten sudah sesuai intent ${type}. Pertahankan gaya & update sesuai jadwal.`;

  const suggestion = `${optimizationSuggestion}\n${structureAdvice[type]}\nHighlight angka penting (${highlightMatches.length}): ${highlightMatches.join(", ")}`;

  // ===== 1️⃣4️⃣ Dashboard =====
  let table = document.getElementById("AEDv10_dashboardTable");
  if (!table) {
    table = document.createElement("table");
    table.id = "AEDv10_dashboardTable";
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.marginTop = "20px";
    table.innerHTML = `
      <thead>
        <tr style="background:#dff0ff;">
          <th>Halaman</th><th>Tipe</th><th>Score</th><th>Kata</th><th>Konteks URL</th>
          <th>Rekom H1</th><th>Meta Desc</th><th>Insight & Saran</th>
        </tr>
      </thead><tbody></tbody>`;
    document.body.appendChild(table);
  }

  const tbody = table.querySelector("tbody");
  const pageTitle = h1Text || document.title || "Unknown Page";
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${pageTitle}</td>
    <td>${type}</td>
    <td>${score.toFixed(1)}</td>
    <td>${wordCount}</td>
    <td>${contextSignal}</td>
    <td>${recommendedH1}</td>
    <td>${metaDesc}</td>
    <td style="white-space:pre-wrap;">${suggestion}</td>`;
  tbody.appendChild(row);

  // ===== 1️⃣5️⃣ Expose Global Var =====
  Object.assign(window, {
    AEDv10_type: type,
    AEDv10_contextSignal: contextSignal,
    AEDv10_score: score.toFixed(1),
    AEDv10_wordCount: wordCount,
    AEDv10_recommendedH1: recommendedH1,
    AEDv10_metaDescription: metaDesc,
    AEDv10_suggestion: suggestion
  });

  // ===== 1️⃣6️⃣ Tombol Aksi SEO =====
  (function(){
    const buttonContainer = document.createElement("div");
    buttonContainer.style.margin = "25px 0";
    buttonContainer.style.textAlign = "center";
    buttonContainer.setAttribute("data-nosnippet","true");

    const btnUpdateNow = document.createElement("button");
    btnUpdateNow.textContent = "⚙️ Update & Download Koreksi Sekarang";
    btnUpdateNow.style.background = "#0078ff";
    btnUpdateNow.style.color = "#fff";
    btnUpdateNow.style.padding = "10px 18px";
    btnUpdateNow.style.margin = "6px";
    btnUpdateNow.style.border = "none";
    btnUpdateNow.style.borderRadius = "6px";
    btnUpdateNow.style.cursor = "pointer";

    const btnNextAdvice = document.createElement("button");
    btnNextAdvice.textContent = "💡 Beri Saran Update Next";
    btnNextAdvice.style.background = "#00b894";
    btnNextAdvice.style.color = "#fff";
    btnNextAdvice.style.padding = "10px 18px";
    btnNextAdvice.style.margin = "6px";
    btnNextAdvice.style.border = "none";
    btnNextAdvice.style.borderRadius = "6px";
    btnNextAdvice.style.cursor = "pointer";

    buttonContainer.appendChild(btnUpdateNow);
    buttonContainer.appendChild(btnNextAdvice);
    document.body.appendChild(buttonContainer);

    // === Tombol 1: Download Koreksi ===
    btnUpdateNow.addEventListener("click", () => {
      const correctedHTML = `
        <article>
          <h1>${AEDv10_recommendedH1}</h1>
          <meta name="description" content="${AEDv10_metaDescription}">
          <p><strong>Status:</strong> ${AEDv10_type} | <strong>Score:</strong> ${AEDv10_score}</p>
          <p>${AEDv10_suggestion.replace(/\n/g,"<br>")}</p>
          <p><small>© Koreksi otomatis oleh EvergreenAI v10.0 | ${new Date().toLocaleString("id-ID")}</small></p>
        </article>
      `;
      const blob = new Blob([correctedHTML], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `koreksi-seo-${AEDv10_recommendedH1.toLowerCase().replace(/\s+/g,"-")}.html`;
      a.click();
      URL.revokeObjectURL(url);
    });

    // === Tombol 2: Tabel Saran Next Update ===
    btnNextAdvice.addEventListener("click", () => {
      const existing = document.getElementById("AEDv10_adviceTable");
      if (existing) existing.remove();

      const table2 = document.createElement("table");
      table2.id = "AEDv10_adviceTable";
      table2.style.width = "100%";
      table2.style.borderCollapse = "collapse";
      table2.style.marginTop = "20px";
      table2.innerHTML = `
        <thead><tr style="background:#f0f8ff;">
          <th>Bagian</th><th>Masalah</th><th>Saran Perbaikan</th>
        </tr></thead><tbody>
          <tr><td>H1</td><td>${h1Diff ? "Berbeda dari URL" : "Sesuai"}</td><td>${h1Diff ? `Gunakan H1: "${AEDv10_recommendedH1}"` : "Pertahankan H1 sekarang"}</td></tr>
          <tr><td>Meta Description</td><td>${AEDv10_metaDescription.length < 80 ? "Pendek" : "Baik"}</td><td>${AEDv10_metaDescription.length < 80 ? "Tambahkan CTA atau keyword lokasi" : "Sudah ideal"}</td></tr>
          <tr><td>Heading (H2/H3)</td><td>${h2Els.length < 2 ? "Kurang" : "Cukup"}</td><td>${structureAdvice[AEDv10_type]}</td></tr>
          <tr><td>Konten</td><td>${wordCount < 700 ? "Pendek" : "Cukup"}</td><td>${wordCount < 700 ? "Tambah data, studi kasus, dan referensi agar >1000 kata." : "Pertahankan."}</td></tr>
          <tr><td>Intent URL</td><td>${AEDv10_type !== AEDv10_contextSignal ? "Tidak Selaras" : "Selaras"}</td><td>${optimizationSuggestion}</td></tr>
        </tbody>`;
      document.body.appendChild(table2);
      window.scrollTo({ top: table2.offsetTop, behavior: "smooth" });
    });
  })();

  console.log(`🧠 [EvergreenAI v10.0] ${type} (${contextSignal}) | Score ${score.toFixed(1)} | Word ${wordCount}`);
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
