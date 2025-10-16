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
(function() {
  try {
    // ===== 1️⃣ Elemen & Text Detector =====
    const elContent = document.querySelector("article, main, .post-body");
    const elH1 = document.querySelector("h1");
    const h1Text = elH1?.innerText || "(no H1)";
    const textContent = (elContent?.innerText || "").slice(0, 4000).toLowerCase();

    // ===== 2️⃣ Hash / Cache =====
    const oldHash = localStorage.getItem("AutoEvergreenHash");
    const currentHash = btoa(unescape(encodeURIComponent(h1Text + textContent)));

    // ===== 3️⃣ Detect Type =====
    const urlRaw = window.location.pathname.split("/").filter(Boolean).pop()
      ?.replace(/^p\//,"").replace(/\.html$/i,"")
      .replace(/\b(0?[1-9]|1[0-2]|20\d{2})\b/g,"")
      .replace(/[-_]/g," ").trim().toLowerCase() || "";

    const evergreenKeywords = ["panduan","tutorial","cara","manfaat"];
    const nonEvergreenKeywords = ["harga","update"];

    let type;
    if(nonEvergreenKeywords.some(k=>urlRaw.includes(k))) type="NON-EVERGREEN";
    else if(evergreenKeywords.some(k=>urlRaw.includes(k))) type="EVERGREEN";
    else if(evergreenKeywords.some(k=>textContent.includes(k))) type="EVERGREEN";
    else type="SEMI-EVERGREEN";

    // ===== 4️⃣ Next Update =====
    const nextUpdate = new Date();
    if(oldHash && oldHash === currentHash) {
      console.log("♻️ Konten sama, tidak perlu update nextUpdate");
    } else {
      if(type === "EVERGREEN") nextUpdate.setMonth(nextUpdate.getMonth() + 12);
      else if(type === "SEMI-EVERGREEN") nextUpdate.setMonth(nextUpdate.getMonth() + 6);
      else nextUpdate.setMonth(nextUpdate.getMonth() + 3);
    }

    const options = { day: "numeric", month: "long", year: "numeric" };
    const nextUpdateStr = nextUpdate.toLocaleDateString("id-ID", options);
    const dateModifiedStr = new Date().toLocaleDateString("id-ID", options);

    // ===== 5️⃣ Label tipe konten =====
    if(elH1) {
      const existingLabel = elH1.parentNode.querySelector("[data-aed-label]");
      if(existingLabel) existingLabel.remove();
      const label = document.createElement("div");
      label.setAttribute("data-aed-label","true");
      label.setAttribute("data-nosnippet","true");
      label.style.fontSize = "0.9em";
      label.style.color = "#444";
      label.style.marginTop = "4px";
      label.innerHTML = `<b>${type}</b> — pembaruan berikutnya: <b>${nextUpdateStr}</b>`;
      elH1.insertAdjacentElement("afterend", label);
    }

    // ===== 6️⃣ Author + tanggal =====
    const authorEl = document.querySelector(".post-author .fn");
    if(authorEl) {
      const oldDateSpan = authorEl.querySelector(".aed-date-span");
      if(oldDateSpan) oldDateSpan.remove();

      if(type === "SEMI-EVERGREEN") {
        const dateEl = document.createElement("span");
        dateEl.className = "aed-date-span";
        dateEl.textContent = ` · Diperbarui: ${dateModifiedStr}`;
        dateEl.style.fontSize = "0.85em";
        dateEl.style.color = "#555";
        dateEl.style.marginLeft = "4px";
        authorEl.appendChild(dateEl);
      } else if(type === "NON-EVERGREEN") {
        const dateEl = document.createElement("div");
        dateEl.className = "aed-non-evergreen-date";
        dateEl.textContent = `Diperbarui: ${dateModifiedStr}`;
        dateEl.style.fontSize = "0.85em";
        dateEl.style.color = "#555";
        dateEl.style.marginBottom = "4px";
        dateEl.setAttribute("data-nosnippet","true");
        if(elH1 && elH1.parentNode && !document.querySelector(".aed-non-evergreen-date"))
          elH1.parentNode.insertBefore(dateEl, elH1);
      } else if(type === "EVERGREEN") {
        const metaBlocks = document.querySelectorAll(".post-author, .post-timestamp, .post-updated, .title-secondary");
        metaBlocks.forEach(el => el.style.display = "none");
      }
    }

    // ===== 7️⃣ Recommended H1 & Meta (LOGIKA UPDATE) =====
    const urlKeywords = urlRaw.split(" ").filter(Boolean); // ambil kata kunci URL
    const h1Lower = h1Text.toLowerCase();
    const allKeywordsPresent = urlKeywords.every(k=>h1Lower.includes(k));
    const h1Diff = !allKeywordsPresent;

    const recommendedH1 = h1Diff 
      ? urlKeywords.map(w=>w[0].toUpperCase()+w.slice(1)).join(" ") 
      : h1Text;

    const sentences = textContent.split(/\.|\n/).filter(Boolean);
    let metaDesc = sentences.slice(0,3).join(". ").substring(0,160).trim();
    if(metaDesc.length < 50) metaDesc = recommendedH1 + " — " + sentences.slice(0,2).join(". ").trim();

    // ===== 8️⃣ Struktur Heading =====
    const ultraStructure = {
      "EVERGREEN": [
        {h2:"Pendahuluan", h3:["Definisi singkat","Siapa yang butuh"]},
        {h2:"Manfaat & Kegunaan", h3:["Manfaat utama","Kapan digunakan"]},
        {h2:"Langkah / Tutorial Lengkap", h3:["Persiapan","Langkah 1","Langkah 2","Tips"]},
        {h2:"Contoh & Studi Kasus", h3:["Contoh 1","Contoh 2"]},
        {h2:"FAQ", h3:["Pertanyaan Umum 1","Pertanyaan Umum 2"]}
      ],
      "SEMI-EVERGREEN": [
        {h2:"Ringkasan & Tren", h3:["Apa yang berubah","Data terbaru"]},
        {h2:"Langkah / Cara", h3:["Langkah utama","Contoh penggunaan"]},
        {h2:"Perbandingan / Analisis", h3:["Kelebihan","Kekurangan"]},
        {h2:"Saran Praktis", h3:["Tips","Kesimpulan singkat"]}
      ],
      "NON-EVERGREEN": [
        {h2:"Harga & Promo Terkini", h3:["Daftar Harga","Syarat & Ketentuan"]},
        {h2:"Ketersediaan & Wilayah", h3:["Area 1","Area 2"]},
        {h2:"Periode & Update", h3:["Tanggal berlaku","Catatan penting"]},
        {h2:"Kontak & Cara Order", h3:["Kontak","Proses pemesanan"]}
      ]
    };

    // ===== 9️⃣ Analisis SEO H1 & Struktur =====
    let h1Status, structStatus, structSuggestion="";
    if(h1Diff) {
      h1Status = `❌ H1 konten tidak sesuai SEO long-tail; sebaiknya diganti menjadi: "${recommendedH1}"`;
    } else {
      h1Status = `✅ H1 konten sudah sesuai SEO long-tail dari URL`;
    }

    const headingsInContent = Array.from(elContent?.querySelectorAll("h2,h3")||[]).map(e=>e.innerText.trim());
    const structUltra = ultraStructure[type];
    let missingHeadings = [];
    structUltra.forEach(sec=>{
      if(!headingsInContent.includes(sec.h2)) missingHeadings.push(`H2: ${sec.h2}`);
      sec.h3.forEach(h3Text=>{
        if(!headingsInContent.includes(h3Text)) missingHeadings.push(`H3: ${h3Text}`);
      });
    });
    if(missingHeadings.length===0) {
      structStatus = "✅ Struktur heading ultra kompetitif sudah sesuai di konten";
      structSuggestion = "Tambahkan internal link, meta tambahan, dan FAQ jika perlu untuk optimasi lebih lanjut";
    } else {
      structStatus = "❌ Struktur heading belum lengkap, perlu diterapkan seperti rekomendasi";
      structSuggestion = missingHeadings.join(" • ");
    }

    // ===== 10️⃣ Dashboard =====
 // ===== 10️⃣ Dashboard Mobile-Friendly & Sticky Header (update tanpa hapus tombol) =====
const btnContainer = document.createElement("div");
btnContainer.style.margin = "15px 0";
btnContainer.style.textAlign = "center";

const createBtn = (text, color = "#fff") => {
  const b = document.createElement("button");
  b.textContent = text;
  b.style.background = color;
  b.style.color = "#000";
  b.style.padding = "6px 12px";
  b.style.margin = "3px";
  b.style.borderRadius = "4px";
  b.style.cursor = "pointer";
  b.style.border = "none";
  b.style.fontSize = "0.9em";
  return b;
};

const btnKoreksi = createBtn("⚙️ Koreksi & Preview", "#ffeedd");
const btnShowTable = createBtn("📊 Tampilkan Data Table", "#d1e7dd");
const btnReport = createBtn("📥 Download Laporan", "#f3f3f3");

btnContainer.appendChild(btnKoreksi);
btnContainer.appendChild(btnShowTable);
btnContainer.appendChild(btnReport);

const dashboardWrapper = document.createElement("div");
dashboardWrapper.style.width = "100%";
dashboardWrapper.style.maxWidth = "1200px";
dashboardWrapper.style.margin = "30px auto";
dashboardWrapper.style.padding = "15px";
dashboardWrapper.style.borderTop = "3px solid #0078ff";
dashboardWrapper.style.background = "#f0f8ff";
dashboardWrapper.style.boxSizing = "border-box";
dashboardWrapper.style.fontFamily = "Arial, sans-serif";

const dashboardTitle = document.createElement("h3");
dashboardTitle.innerText = "📊 AED Dashboard — Ringkasan Halaman";
dashboardWrapper.appendChild(dashboardTitle);
dashboardWrapper.appendChild(btnContainer);

// ===== Table Wrapper (responsive + sticky header) =====
const tableWrapper = document.createElement("div");
tableWrapper.style.width = "100%";
tableWrapper.style.overflowX = "auto";  // scroll horizontal di mobile
tableWrapper.style.display = "none";    // hidden default
tableWrapper.style.marginTop = "15px";

const table = document.createElement("table");
table.style.width = "100%";
table.style.borderCollapse = "collapse";
table.style.minWidth = "800px";        // agar scroll muncul di layar kecil
table.style.fontSize = "0.9em";

// Table head sticky
table.innerHTML = `<thead style="position: sticky; top: 0; background: #dff0ff; z-index: 2;">
  <tr>
    <th style="border:1px solid #ccc;padding:6px; min-width:100px">Halaman</th>
    <th style="border:1px solid #ccc;padding:6px; min-width:80px">Tipe</th>
    <th style="border:1px solid #ccc;padding:6px; min-width:150px">H1 Konten</th>
    <th style="border:1px solid #ccc;padding:6px; min-width:150px">Rekom H1</th>
    <th style="border:1px solid #ccc;padding:6px; min-width:120px">Status H1</th>
    <th style="border:1px solid #ccc;padding:6px; min-width:120px">Struktur</th>
    <th style="border:1px solid #ccc;padding:6px; min-width:150px">Saran Tambahan</th>
    <th style="border:1px solid #ccc;padding:6px; min-width:100px">Next Update</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td style="border:1px solid #ccc;padding:6px">${document.title || h1Text}</td>
    <td style="border:1px solid #ccc;padding:6px">${type}</td>
    <td style="border:1px solid #ccc;padding:6px">${h1Text}</td>
    <td style="border:1px solid #ccc;padding:6px">${recommendedH1}</td>
    <td style="border:1px solid #ccc;padding:6px">${h1Status}</td>
    <td style="border:1px solid #ccc;padding:6px">${structStatus}</td>
    <td style="border:1px solid #ccc;padding:6px">${structSuggestion}</td>
    <td style="border:1px solid #ccc;padding:6px">${nextUpdateStr}</td>
  </tr>
</tbody>`;

tableWrapper.appendChild(table);
dashboardWrapper.appendChild(tableWrapper);
document.body.appendChild(dashboardWrapper);

// ===== Tombol tampilkan table =====
btnShowTable.onclick = () => {
  tableWrapper.style.display = tableWrapper.style.display === "none" ? "block" : "none";
};

// ===== Responsive font & padding =====
const style = document.createElement("style");
style.innerHTML = `
@media (max-width: 768px) {
  table th, table td {
    padding: 4px !important;
    font-size: 0.8em !important;
  }
}
@media (max-width: 480px) {
  table th, table td {
    min-width: 100px !important;
  }
}
`;
document.head.appendChild(style);

    // ===== 1️⃣2️⃣ Simpan hash =====
    localStorage.setItem("AutoEvergreenHash", currentHash);
    console.log("✅ AED Final Interaktif siap digunakan di bawah halaman");

  } catch(e){ console.error("❌ Error AED Final:",e); }
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
