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
// ⚡ Auto Evergreen Detector v9.4 Pro + H2/H3 Silo Lengkap — SEO Ultra Kompetitif
(function() {
  // ===== 1️⃣ Elemen & Text Detector =====
  const contentEl = document.querySelector("article, main, .post-body");
  const h1El = document.querySelector("h1");
  const h1Text = h1El ? h1El.innerText.trim() : "";
  const contentText = (contentEl ? contentEl.innerText : document.body.innerText || "").toLowerCase();
  const fullText = (h1Text + " " + contentText);

  // ===== 2️⃣ Hitung indikator alami =====
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  const numberCount = (fullText.match(/\d{1,4}/g) || []).length;
  const percentCount = (fullText.match(/%|rp|\d+(\.\d+)?\s?(m|cm|kg|m2|m3|m³|ton|kubik|liter)/gi) || []).length;
  const tableCount = document.querySelectorAll("table").length;
  const listCount = document.querySelectorAll("ul,ol").length;
  const h2Els = document.querySelectorAll("h2");
  const h3Els = document.querySelectorAll("h3");
  const h2Count = h2Els.length;
  const h3Count = h3Els.length;

  // ===== 3️⃣ Keyword Pattern =====
  const nonEvergreenKeywords = ["harga","update","terbaru","berita","jadwal","event","promo","diskon","proyek","progres","bulan","tahun","sementara","deadline","musiman"];
  const evergreenKeywords = ["panduan","tutorial","tips","cara","definisi","pandangan","strategi","langkah","prosedur","manfaat","penjelasan","fungsi","teknik","contoh","jenis","panduan lengkap","arti","perbedaan","kegunaan"];

  const hasTimePattern = nonEvergreenKeywords.some(k => new RegExp(`\\b${k}\\b`, 'i').test(fullText));
  const evergreenIndicators = evergreenKeywords.reduce((acc, k) => acc + (new RegExp(`\\b${k}\\b`, 'i').test(fullText) ? 1 : 0), 0);

  // ===== 4️⃣ Hitung Skor Hybrid =====
  let score = 0;
  score += numberCount * 0.3;
  score += percentCount * 0.5;
  score += tableCount * 1;
  score -= (wordCount > 1000 ? 1 : 0);
  score -= (h2Count > 2 ? 0.5 : 0);
  score -= (listCount > 0 ? 0.5 : 0);
  score -= evergreenIndicators * 0.5;

  // ===== 5️⃣ Klasifikasi Tipe Konten =====
  let typeKonten = "SEMI-EVERGREEN";
  if ((hasTimePattern && evergreenIndicators <= 1) || score >= 3) typeKonten = "NON-EVERGREEN";
  else if (evergreenIndicators >= 2 && score <= 1) typeKonten = "EVERGREEN";

  // ===== 6️⃣ Hitung rekomendasi update =====
  const nextUpdate = new Date();
  if (typeKonten === "EVERGREEN") nextUpdate.setMonth(nextUpdate.getMonth() + 12);
  else if (typeKonten === "SEMI-EVERGREEN") nextUpdate.setMonth(nextUpdate.getMonth() + 6);
  else nextUpdate.setMonth(nextUpdate.getMonth() + 3);
  const options = { day: "numeric", month: "long", year: "numeric" };
  const nextUpdateStr = nextUpdate.toLocaleDateString("id-ID", options);
  const dateModifiedStr = new Date(dateModified).toLocaleDateString("id-ID", options);
  const datePublishedStr = new Date(document.querySelector("meta[itemprop='datePublished']")?.content || Date.now()).toLocaleDateString("id-ID", options);

  // ===== 7️⃣ Label tipe konten di halaman =====
  if (h1El) {
    const label = document.createElement("div");
    label.innerHTML = `<b>${typeKonten}</b> — pembaruan berikutnya: <b>${nextUpdateStr}</b>`;
    label.setAttribute("data-nosnippet","true");
    label.style.fontSize = "0.9em";
    label.style.color = "#444";
    label.style.marginTop = "4px";
    label.style.marginBottom = "10px";
    h1El.insertAdjacentElement("afterend", label);
  }

  // ===== 8️⃣ Deteksi URL vs H1 + rekomendasi H1 baru =====
  let urlNameRaw = window.location.pathname.split("/").filter(Boolean).pop() || "";
  urlNameRaw = urlNameRaw.replace(/^p\//, "").replace(/\.html$/i, "")
             .replace(/\b(0?[1-9]|1[0-2]|20\d{2})\b/g, "")
             .replace(/[-_]/g, " ").trim().toLowerCase();
  const H1vsURLdiff = urlNameRaw !== h1Text.toLowerCase();
  const recommendedH1 = H1vsURLdiff ? urlNameRaw.split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ") : h1Text;

  // ===== 9️⃣ Rekomendasi Meta Description =====
  let metaDesc = "";
  const sentences = contentText.split(/\.|\n/).filter(Boolean);
  metaDesc = sentences.slice(0,3).join(". ").substring(0,160).trim();
  if(metaDesc.length < 50) metaDesc = recommendedH1 + " — " + sentences.slice(0,2).join(". ").trim();

  // ===== 🔟 Struktur H2/H3 SEO Silo Lengkap =====
  const seoSiloH2 = ["Pendahuluan", "Manfaat", "Jenis", "Langkah / Tutorial", "Contoh / Studi Kasus", "FAQ"];
  const seoSiloH3 = {
    "Pendahuluan": ["Definisi", "Sejarah / Latar Belakang"],
    "Manfaat": ["Kegunaan", "Keuntungan"],
    "Jenis": ["Tipe 1", "Tipe 2", "Tipe 3"],
    "Langkah / Tutorial": ["Persiapan", "Pelaksanaan", "Tips Tambahan"],
    "Contoh / Studi Kasus": ["Kasus 1", "Kasus 2"],
    "FAQ": ["Pertanyaan Umum 1", "Pertanyaan Umum 2"]
  };

  // Highlight H2/H3 yang kurang
  const missingH2 = seoSiloH2.filter(h2 => ![...h2Els].some(el => el.innerText.toLowerCase().includes(h2.toLowerCase())));
  const missingH3 = missingH2.map(h2 => seoSiloH3[h2] ? seoSiloH3[h2].join(", ") : "").filter(Boolean);
  const highlightH2H3 = missingH2.join(", ") + (missingH3.length ? " | H3 tambahan: " + missingH3.join(" | ") : "");

  // ===== 1️⃣1️⃣ Highlight kata/angka penting =====
  const highlightMatches = (fullText.match(/\d+(\.\d+)?|\d+\s?(m|cm|kg|m2|m3|m³|ton|kubik|liter)|rp|\%/gi) || []).join(", ");

  // ===== 1️⃣2️⃣ Prediksi Evergreen & Solusi Lengkap =====
  let solution = H1vsURLdiff
    ? `⚠️ H1 berbeda dari URL (${urlNameRaw}) → Sarankan revisi H1: "${recommendedH1}".\nHighlight penting konten: ${highlightMatches}\nH2/H3 bisa ditambah: ${highlightH2H3}\nTindakan: update angka/data, buat list/langkah-langkah jelas, review tiap 3-12 bulan sesuai status.`
    : `✅ H1 sesuai URL.\nHighlight penting konten: ${highlightMatches}\nH2/H3 bisa ditambah: ${highlightH2H3}\nTindakan: pertahankan H1, perkuat subjudul, update angka/data rutin.`;

  // ===== 1️⃣3️⃣ Saran Konten Otomatis =====
  let suggestion = "";
  if (typeKonten === "EVERGREEN") suggestion = `Konten evergreen: pertahankan H1 (${recommendedH1}), gunakan H2/H3 relevan, fokus tips/tutorial, update minimal tahunan. ${solution}`;
  else if (typeKonten === "SEMI-EVERGREEN") suggestion = `Konten semi-evergreen: perkuat H1 (${recommendedH1}), tambahkan data/angka terbaru, pertahankan list & langkah-langkah, update tiap 3-6 bulan. ${solution}`;
  else suggestion = `Konten non-evergreen: fokus update rutin, angka/harga terbaru, tampilkan tanggal jelas, review tiap 1-3 bulan. ${solution}`;

  // ===== 1️⃣4️⃣ Dashboard Blogspot =====
  let dashboardTable = document.getElementById("AEDv94_dashboardTable");
  if(!dashboardTable){
    dashboardTable = document.createElement("table");
    dashboardTable.id = "AEDv94_dashboardTable";
    dashboardTable.style.width = "100%";
    dashboardTable.style.borderCollapse = "collapse";
    dashboardTable.style.marginTop = "20px";
    dashboardTable.innerHTML = `
      <thead>
        <tr style="background:#f0f0f0;">
          <th style="padding:4px;border:1px solid #ccc;">Halaman</th>
          <th style="padding:4px;border:1px solid #ccc;">Type</th>
          <th style="padding:4px;border:1px solid #ccc;">Score</th>
          <th style="padding:4px;border:1px solid #ccc;">Word</th>
          <th style="padding:4px;border:1px solid #ccc;">Tanggal Publish</th>
          <th style="padding:4px;border:1px solid #ccc;">Tanggal Update</th>
          <th style="padding:4px;border:1px solid #ccc;">Rekom H1</th>
          <th style="padding:4px;border:1px solid #ccc;">Meta Description</th>
          <th style="padding:4px;border:1px solid #ccc;">Struktur Heading SEO</th>
          <th style="padding:4px;border:1px solid #ccc;">Saran Konten</th>
          <th style="padding:4px;border:1px solid #ccc;">Solusi Lengkap</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    document.body.appendChild(dashboardTable);
  }
  const tbody = dashboardTable.querySelector("tbody");
  const pageTitle = h1Text || document.title || "Unknown Page";
  const row = document.createElement("tr");
  row.innerHTML = `
    <td style="padding:4px;border:1px solid #ccc;">${pageTitle}</td>
    <td style="padding:4px;border:1px solid #ccc;">${typeKonten}</td>
    <td style="padding:4px;border:1px solid #ccc;">${score.toFixed(1)}</td>
    <td style="padding:4px;border:1px solid #ccc;">${wordCount}</td>
    <td style="padding:4px;border:1px solid #ccc;">${datePublishedStr}</td>
    <td style="padding:4px;border:1px solid #ccc;">${dateModifiedStr}</td>
    <td style="padding:4px;border:1px solid #ccc;">${recommendedH1}</td>
    <td style="padding:4px;border:1px solid #ccc;">${metaDesc}</td>
    <td style="padding:4px;border:1px solid #ccc;">${highlightH2H3}</td>
    <td style="padding:4px;border:1px solid #ccc;">${suggestion}</td>
    <td style="padding:4px;border:1px solid #ccc;">${solution}</td>
  `;
  tbody.appendChild(row);

  // ===== 1️⃣5️⃣ Simpan ke Window =====
  window.AEDv94_typeKonten = typeKonten;
  window.AEDv94_nextUpdateStr = nextUpdateStr;
  window.AEDv94_dateModifiedStr = dateModifiedStr;
  window.AEDv94_evergreenScore = score.toFixed(1);
  window.AEDv94_wordCount = wordCount;
  window.AEDv94_contentSuggestion = suggestion;
  window.AEDv94_H1vsURLdiff = H1vsURLdiff;
  window.AEDv94_solution = solution;
  window.AEDv94_recommendedH1 = recommendedH1;
  window.AEDv94_metaDescription = metaDesc;
  window.AEDv94_highlightH2H3 = highlightH2H3;

  console.log(`🧠 [EvergreenAI v9.4 Pro SEO Silo] ${typeKonten} | Score: ${score.toFixed(1)} | Word: ${wordCount}`);
  console.log(`📅 Next Update: ${nextUpdateStr} | Last Modified: ${dateModifiedStr}`);
  console.log(`💡 Rekom H1: ${recommendedH1}`);
  console.log(`💡 Meta Description: ${metaDesc}`);
  console.log(`💡 Struktur H2/H3: ${highlightH2H3}`);
  console.log(`💡 Saran Konten: ${suggestion}`);
  console.log(`💡 Solusi Lengkap: ${solution}`);
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
