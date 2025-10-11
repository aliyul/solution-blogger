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
// ⚡ Auto Evergreen Detector v8.5 — Enterprise Full Automation + Blogspot Dashboard
 // ===== 1️⃣ Deteksi Konten =====
  const contentEl = document.querySelector("article, main, .post-body");
  const h1Text = document.querySelector("h1")?.innerText || "";
  const contentText = (contentEl ? contentEl.innerText : document.body.innerText || "").toLowerCase().slice(0, 5000);
  const text = (h1Text + " " + contentText).toLowerCase();

  // 🔍 Hitung indikator alami
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const numberCount = (text.match(/\d{1,4}/g) || []).length;
  const percentCount = (text.match(/%|rp|\d+\s?(m|cm|kg|m2|m3|ton|kubik|liter)/g) || []).length;
  const tableCount = document.querySelectorAll("table").length;
  const listCount = document.querySelectorAll("ul,ol").length;
  const h2Count = document.querySelectorAll("h2").length;

  // 🔢 Penilaian otomatis (Hybrid Logic)
  let score = 0;
  score += numberCount * 0.3;      // banyak angka → time-sensitive
  score += percentCount * 0.5;     // harga/data → time-sensitive
  score += tableCount * 1;         // tabel = data dinamis
  score -= (wordCount > 1000 ? 1 : 0); // panjang = lebih evergreen
  score -= (h2Count > 2 ? 0.5 : 0);    // banyak subjudul → panduan
  score -= (listCount > 0 ? 0.5 : 0);  // ada list → panduan

  // 🧭 Klasifikasi otomatis
  let typeKonten = "SEMI-EVERGREEN";
  if (score >= 3) typeKonten = "NON-EVERGREEN";
  else if (score <= 1) typeKonten = "EVERGREEN";

  // 📅 Hitung rekomendasi update
  const nextUpdate = new Date();
  if (typeKonten === "EVERGREEN") nextUpdate.setMonth(nextUpdate.getMonth() + 12);
  else if (typeKonten === "SEMI-EVERGREEN") nextUpdate.setMonth(nextUpdate.getMonth() + 6);
  else nextUpdate.setMonth(nextUpdate.getMonth() + 3);

  const nextUpdateStr = nextUpdate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  // ===== 2️⃣ Tampilkan label tipe konten di halaman =====
  const h1 = document.querySelector("h1");
  if (h1) {
    const label = document.createElement("div");
    label.innerHTML = `<b>${typeKonten}</b> — pembaruan berikutnya: <b>${nextUpdateStr}</b>`;
    label.style.fontSize = "0.9em";
    label.style.color = "#444";
    label.style.marginTop = "4px";
    label.style.marginBottom = "10px";
    h1.insertAdjacentElement("afterend", label);
  }

  // ===== 3️⃣ Siapkan Dashboard Blogspot =====
  let dashboardTable = document.getElementById("dashboardTable");
  if (!dashboardTable) {
    dashboardTable = document.createElement("table");
    dashboardTable.id = "dashboardTable";
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
          <th style="padding:4px;border:1px solid #ccc;">Next Update</th>
        </tr>
      </thead>
    `;
    const tbody = document.createElement("tbody");
    dashboardTable.appendChild(tbody);
    document.body.appendChild(dashboardTable);
  }
  // Pastikan tbody ada
  let tbody = dashboardTable.querySelector("tbody");
  if (!tbody) {
    tbody = document.createElement("tbody");
    dashboardTable.appendChild(tbody);
  }

  // ===== 4️⃣ Tambahkan row baru ke dashboard =====
  const pageTitle = h1Text || document.title || "Unknown Page";
  const row = document.createElement("tr");
  row.innerHTML = `
    <td style="padding:4px;border:1px solid #ccc;">${pageTitle}</td>
    <td style="padding:4px;border:1px solid #ccc;">${typeKonten}</td>
    <td style="padding:4px;border:1px solid #ccc;">${score.toFixed(1)}</td>
    <td style="padding:4px;border:1px solid #ccc;">${wordCount}</td>
    <td style="padding:4px;border:1px solid #ccc;">${nextUpdateStr}</td>
  `;
  tbody.appendChild(row);

  // ===== 5️⃣ Simpan ke Window untuk Schema / Automation =====
  window.typeKonten = typeKonten;
  window.nextUpdateStr = nextUpdateStr;
  window.evergreenScore = score.toFixed(1);
  window.wordCount = wordCount;

  console.log(`🧠 [EvergreenAI v8.5 Enterprise] ${typeKonten} | Score: ${score.toFixed(1)} | Word: ${wordCount}`);
  console.log(`📅 Next Update: ${nextUpdateStr}`);

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
