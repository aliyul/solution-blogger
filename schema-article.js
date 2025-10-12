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
<!-- ⚡ Auto Evergreen Detector v9.5 Pro Ultimate — SEO Advanced Analyzer & Dynamic Silo -->
(function(){
  // ===== 1️⃣ Ambil Elemen & Text =====
  const contentEl = document.querySelector("article, main, .post-body") || document.body;
  const h1El = document.querySelector("h1");
  const h1Text = (h1El?.innerText || "").trim();
  const contentText = (contentEl.innerText || "").toLowerCase();
  const fullText = (h1Text + " " + contentText);

  // ===== 2️⃣ Analisis dasar =====
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  const numberCount = (fullText.match(/\d{1,4}/g) || []).length;
  const percentCount = (fullText.match(/%|rp|\d+(\.\d+)?\s?(m|cm|kg|m2|m3|m³|ton|kubik|liter)/gi) || []).length;
  const tableCount = document.querySelectorAll("table").length;
  const listCount  = document.querySelectorAll("ul,ol").length;
  const h2Els = document.querySelectorAll("h2");
  const h3Els = document.querySelectorAll("h3");

  // ===== 3️⃣ Pola Kata Kunci =====
  const nonEvergreenKeywords = ["harga","update","terbaru","berita","jadwal","event","promo","diskon","proyek","progres","bulan","tahun","sementara","deadline","musiman"];
  const evergreenKeywords = ["panduan","tutorial","tips","cara","definisi","pandangan","strategi","langkah","prosedur","manfaat","penjelasan","fungsi","teknik","contoh","jenis","arti","perbedaan","kegunaan","panduan lengkap"];

  const hasTimePattern = nonEvergreenKeywords.some(k => new RegExp(`\\b${k}\\b`,'i').test(fullText));
  const evergreenIndicators = evergreenKeywords.reduce((a,k)=>a+(new RegExp(`\\b${k}\\b`,'i').test(fullText)?1:0),0);

  // ===== 4️⃣ Skor Hybrid =====
  let score = numberCount*0.35 + percentCount*0.55 + tableCount*1.2;
  if(wordCount>1000) score -= 1;
  if(h2Els.length>2) score -= 0.5;
  if(listCount>0) score -= 0.5;
  score -= evergreenIndicators*0.55;

  // ===== 5️⃣ Klasifikasi =====
  let typeKonten = "SEMI-EVERGREEN";
  if((hasTimePattern && evergreenIndicators<=1) || score>=3) typeKonten="NON-EVERGREEN";
  else if(evergreenIndicators>=2 && score<=1) typeKonten="EVERGREEN";

  // ===== 6️⃣ Rencana Update =====
  const now = new Date();
  const nextUpdate = new Date(now);
  if(typeKonten==="EVERGREEN") nextUpdate.setMonth(now.getMonth()+12);
  else if(typeKonten==="SEMI-EVERGREEN") nextUpdate.setMonth(now.getMonth()+6);
  else nextUpdate.setMonth(now.getMonth()+3);

  const fmt = {day:"numeric",month:"long",year:"numeric"};
  const nextUpdateStr = nextUpdate.toLocaleDateString("id-ID",fmt);
  const dateModifiedMeta = document.querySelector("meta[itemprop='dateModified']")?.content;
  const dateModifiedStr = new Date(dateModifiedMeta || now).toLocaleDateString("id-ID",fmt);
  const datePublishedMeta = document.querySelector("meta[itemprop='datePublished']")?.content;
  const datePublishedStr = new Date(datePublishedMeta || now).toLocaleDateString("id-ID",fmt);
  const authorName = document.querySelector(".post-author .fn")?.innerText || "Admin";

  // ===== 7️⃣ Label Info di bawah H1 =====
  if(h1El && !document.getElementById("AEDv95U_label")){
    const info = document.createElement("div");
    info.id = "AEDv95U_label";
    info.innerHTML = `🧠 <b>${typeKonten}</b> • Diperbarui: <b>${dateModifiedStr}</b> • Oleh: ${authorName} • Next: ${nextUpdateStr}`;
    info.style.cssText = "font-size:.85em;color:#555;margin-top:4px;margin-bottom:10px";
    h1El.insertAdjacentElement("afterend",info);
  }

  // ===== 8️⃣ URL vs H1 =====
  let urlName = window.location.pathname.split("/").filter(Boolean).pop() || "";
  urlName = urlName.replace(/^p\//,"").replace(/\.html$/i,"").replace(/\b(0?[1-9]|1[0-2]|20\d{2})\b/g,"").replace(/[-_]/g," ").trim().toLowerCase();
  const H1vsURLdiff = urlName !== h1Text.toLowerCase();
  const recommendedH1 = H1vsURLdiff ? urlName.split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" ") : h1Text;

  // ===== 9️⃣ Meta Description =====
  const sentences = contentText.split(/\.|\n/).filter(Boolean);
  let metaDesc = sentences.slice(0,3).join(". ").substring(0,160).trim();
  if(metaDesc.length<50) metaDesc = recommendedH1+" — "+sentences.slice(0,2).join(". ").trim();

  // ===== 🔟 Deteksi Struktur H2/H3 =====
  const existingH2 = [...h2Els].map(h=>h.innerText.trim());
  const existingH3 = [...h3Els].map(h=>h.innerText.trim());
  const wordFreq = {};
  contentText.split(/\s+/).forEach(w=>{
    w=w.replace(/[^a-zA-Z0-9]/g,"").trim();
    if(w.length>3) wordFreq[w]=(wordFreq[w]||0)+1;
  });
  const topKeywords = Object.entries(wordFreq).sort((a,b)=>b[1]-a[1]).slice(0,15).map(k=>k[0]);
  const predictedH2 = topKeywords.filter(k=>!existingH2.join(" ").toLowerCase().includes(k));
  const predictedH3 = predictedH2.map(k=>"Sub-topik "+k);
  const highlightH2H3 = predictedH2.join(", ") + (predictedH3.length ? " | "+predictedH3.join(" | ") : "");

  // ===== 1️⃣1️⃣ Highlight angka penting =====
  const highlightMatches = (fullText.match(/\d+(\.\d+)?|\d+\s?(m|cm|kg|m2|m3|m³|ton|kubik|liter)|rp|\%/gi) || []).join(", ");

  // ===== 1️⃣2️⃣ Solusi Lengkap =====
  const solution = H1vsURLdiff
    ? `⚠️ H1 ≠ URL (“${urlName}”) → revisi ke: “${recommendedH1}”.\nHighlight: ${highlightMatches}\nTambah H2/H3: ${highlightH2H3}\nUpdate data & angka tiap 3–12 bulan.`
    : `✅ H1 sudah sesuai.\nHighlight: ${highlightMatches}\nPerkuat H2/H3: ${highlightH2H3}\nUpdate data & angka sesuai jadwal.`;

  // ===== 1️⃣3️⃣ Saran berdasarkan tipe =====
  const suggestion =
    typeKonten==="EVERGREEN" ? `Pertahankan panduan ${recommendedH1}, fokus tips & tutorial, update tahunan.\n${solution}` :
    typeKonten==="SEMI-EVERGREEN" ? `Tambah data & angka terbaru, jaga list/langkah, update 3–6 bulan.\n${solution}` :
    `Perbarui harga/data secara rutin & tampilkan tanggal jelas (1–3 bulan).\n${solution}`;

  // ===== 1️⃣4️⃣ Dashboard =====
  let table = document.getElementById("AEDv95U_dashboard");
  if(!table){
    table = document.createElement("table");
    table.id="AEDv95U_dashboard";
    table.style.cssText="width:100%;border-collapse:collapse;margin-top:25px;font-size:.9em";
    table.innerHTML=`<thead><tr style="background:#f7f7f7">
      <th>Halaman</th><th>Tipe</th><th>Score</th><th>Word</th>
      <th>Publish</th><th>Update</th><th>Rekom H1</th>
      <th>Meta Description</th><th>Struktur SEO</th><th>Saran</th><th>Solusi</th>
    </tr></thead><tbody></tbody>`;
    document.body.appendChild(table);
  }
  const tr=document.createElement("tr");
  tr.innerHTML=`<td>${h1Text||document.title}</td>
  <td>${typeKonten}</td>
  <td>${score.toFixed(1)}</td>
  <td>${wordCount}</td>
  <td>${datePublishedStr}</td>
  <td>${dateModifiedStr}</td>
  <td>${recommendedH1}</td>
  <td>${metaDesc}</td>
  <td style="white-space:pre-wrap">${highlightH2H3}</td>
  <td style="white-space:pre-wrap">${suggestion}</td>
  <td style="white-space:pre-wrap">${solution}</td>`;
  table.querySelector("tbody").appendChild(tr);

  // ===== 1️⃣5️⃣ Simpan Global =====
  Object.assign(window,{
    AEDv95U_type:typeKonten,
    AEDv95U_score:score,
    AEDv95U_wordCount:wordCount,
    AEDv95U_recommendedH1:recommendedH1,
    AEDv95U_metaDesc:metaDesc,
    AEDv95U_H2H3:highlightH2H3,
    AEDv95U_solution:solution
  });

  console.log(`✅ [Evergreen v9.5 Pro Ultimate] ${typeKonten} | Score ${score.toFixed(1)} | Next: ${nextUpdateStr}`);
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
