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


// ===================================================
// ⚡ AUTO SEO BUILDER ULTRA KOMPETITIF v6.0 (FINAL+)
// ===================================================
  console.log("🚀 Auto SEO Builder Ultra Kompetitif v6.0 aktif");

  // ==============================
  // 1️⃣ DETEKSI TIPE KONTEN
  // ==============================
  const h1El = document.querySelector("h1");
  const h1Text = h1El ? h1El.innerText.trim() : "";
  let typeKonten = "EVERGREEN";

  if (/harga|promo|diskon|terbaru|biaya|tarif|update/i.test(h1Text)) typeKonten = "NON-EVERGREEN";
  else if (/panduan|cara|langkah|tips|tutorial/i.test(h1Text)) typeKonten = "SEMI-EVERGREEN";

  // ==============================
  // 2️⃣ BENTUK STRUKTUR ULTRA KOMPETITIF OTOMATIS
  // ==============================
  function autoBuildStructure(h1Text) {
    const base = h1Text.toLowerCase();

    if (base.includes("harga")) {
      return [
        { h2: "Harga Terbaru", h3: ["Daftar Harga", "Kisaran Wilayah", "Mutu & Volume"] },
        { h2: "Faktor yang Mempengaruhi Harga", h3: ["Mutu Beton", "Jarak Pengiriman", "Kuantitas"] },
        { h2: "Cara Pemesanan", h3: ["Kontak WhatsApp", "Proses Order", "Metode Pembayaran"] },
        { h2: "FAQ", h3: ["Apakah harga termasuk PPN?", "Berapa minimal order?"] }
      ];
    }
    if (base.includes("panduan") || base.includes("cara") || base.includes("tutorial")) {
      return [
        { h2: "Pendahuluan", h3: ["Tujuan Panduan", "Siapa yang Membutuhkan"] },
        { h2: "Langkah-langkah Utama", h3: ["Persiapan", "Langkah 1", "Langkah 2"] },
        { h2: "Tips & Kesalahan Umum", h3: ["Hal yang Harus Dihindari", "Saran Teknis"] },
        { h2: "FAQ", h3: ["Pertanyaan Umum"] }
      ];
    }
    if (base.includes("manfaat") || base.includes("fungsi")) {
      return [
        { h2: "Fungsi Utama", h3: ["Kelebihan Teknis", "Kelebihan Ekonomis"] },
        { h2: "Manfaat Penggunaan", h3: ["Dalam Proyek Konstruksi", "Dalam Infrastruktur"] },
        { h2: "FAQ", h3: ["Kapan sebaiknya digunakan?"] }
      ];
    }
    return [
      { h2: "Pendahuluan", h3: ["Latar Belakang", "Tujuan"] },
      { h2: "Pembahasan Utama", h3: ["Subtopik 1", "Subtopik 2"] },
      { h2: "Kesimpulan", h3: ["Rangkuman", "Saran"] },
      { h2: "FAQ", h3: ["Pertanyaan Umum"] }
    ];
  }

  const strukturSEO = autoBuildStructure(h1Text);
  console.log("📑 Struktur SEO:", strukturSEO);

  // ==============================
  // 3️⃣ SEMBUNYIKAN / TAMPILKAN META SESUAI TIPE
  // ==============================
  const metaBlocks = document.querySelectorAll(".post-author, .post-timestamp, .post-updated");
  const authorEl = document.querySelector(".post-author");
  const updatedEl = document.querySelector(".post-updated");

  if (typeKonten === "EVERGREEN") {
    metaBlocks.forEach(el => el.style.display = "none");
  } else if (typeKonten === "SEMI-EVERGREEN") {
    if (authorEl && updatedEl) {
      authorEl.style.display = "inline";
      updatedEl.style.display = "inline";
      updatedEl.style.marginLeft = "8px";
      updatedEl.textContent = `· Diperbarui: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`;
    }
  } else if (typeKonten === "NON-EVERGREEN") {
    if (h1El) {
      const dateDiv = document.createElement("div");
      dateDiv.textContent = `🕒 Diperbarui: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`;
      dateDiv.style.fontSize = "0.85em";
      dateDiv.style.color = "#666";
      dateDiv.style.marginBottom = "4px";
      h1El.parentNode.insertBefore(dateDiv, h1El);
    }
  }

  // ==============================
  // 4️⃣ REKOMENDASI JADWAL UPDATE
  // ==============================
  const dateModifiedEl = document.querySelector('meta[itemprop="dateModified"], time[itemprop="dateModified"]');
  const dateModified = dateModifiedEl ? dateModifiedEl.getAttribute("content") || new Date() : new Date();
  let nextUpdateDate = new Date(dateModified);
  if (typeKonten === "EVERGREEN") nextUpdateDate.setMonth(nextUpdateDate.getMonth() + 12);
  else if (typeKonten === "SEMI-EVERGREEN") nextUpdateDate.setMonth(nextUpdateDate.getMonth() + 6);
  else nextUpdateDate.setMonth(nextUpdateDate.getMonth() + 3);

  const nextUpdateStr = nextUpdateDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const typeEl = document.createElement("div");
  typeEl.innerHTML = `<b>${typeKonten}</b> — pembaruan berikutnya paling lambat: <b>${nextUpdateStr}</b>`;
  typeEl.setAttribute("data-nosnippet", "true");
  typeEl.style = "font-size:0.85em;color:#555;margin-top:4px;margin-bottom:8px;";
  if (h1El) h1El.parentNode.insertBefore(typeEl, h1El.nextSibling);

  window.typeKonten = typeKonten;
  window.nextUpdateStr = nextUpdateStr;

  // ==============================
  // 5️⃣ DASHBOARD SEO ASSISTANT
  // ==============================
  const dashboard = document.createElement("div");
  dashboard.id = "seoAssistant";
  dashboard.setAttribute("data-nosnippet", "true");
  dashboard.style.cssText = `
    border-top: 2px solid #ddd;
    padding: 15px;
    margin-top: 40px;
    font-family: system-ui;
    background: #fafafa;
    font-size: 14px;
  `;
  dashboard.innerHTML = `
    <h3>🧠 SEO Assistant (v6.0)</h3>
    <p><b>Status:</b> ${typeKonten}</p>
    <p><b>Update Berikutnya:</b> ${nextUpdateStr}</p>
    <button id="btnPreview" style="padding:6px 10px;margin-right:6px;">🔍 Preview</button>
    <button id="btnCopy" style="padding:6px 10px;margin-right:6px;" disabled>📋 Copy</button>
    <button id="btnExport" style="padding:6px 10px;" disabled>💾 Export</button>
    <div id="previewArea" style="display:none;margin-top:10px;border:1px solid #ccc;padding:10px;background:white;"></div>
  `;

  const footer = document.querySelector("footer");
  if (footer && footer.parentNode) footer.parentNode.insertBefore(dashboard, footer.nextSibling);
  else document.body.appendChild(dashboard);

  // ==============================
  // 6️⃣ FITUR: PREVIEW + COPY + EXPORT
  // ==============================
  const previewBtn = document.getElementById("btnPreview");
  const copyBtn = document.getElementById("btnCopy");
  const exportBtn = document.getElementById("btnExport");
  const previewArea = document.getElementById("previewArea");

  previewBtn.addEventListener("click", () => {
    const struktur = autoBuildStructure(h1Text);
    let html = `<article><h1>${h1Text}</h1>`;
    struktur.forEach(s => {
      html += `<h2>${s.h2}</h2>`;
      s.h3.forEach(sub => html += `<h3>${sub}</h3>`);
    });
    html += `</article>`;
    previewArea.innerHTML = html;
    previewArea.style.display = "block";
    copyBtn.disabled = false;
    exportBtn.disabled = false;
  });

  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(previewArea.innerHTML)
      .then(() => alert("✅ Struktur berhasil disalin ke clipboard!"))
      .catch(err => alert("❌ Gagal menyalin: " + err));
  });

  exportBtn.addEventListener("click", () => {
    const blob = new Blob([previewArea.innerHTML], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = h1Text.replace(/\s+/g, "-").toLowerCase() + "-seo.html";
    link.click();
  });
  
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
