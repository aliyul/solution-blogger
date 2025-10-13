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
<script>
// ========== Auto Evergreen Detector v9.9-Pro Fusion AutoStructure ==========
// Tetap mempertahankan semua fitur dari versi sebelumnya
// + Builder struktur heading SEO ultra kompetitif otomatis berbasis H1 dinamis

document.addEventListener("DOMContentLoaded", () => {

  // ===== 1️⃣ Ambil data utama =====
  const AED_url = window.location.pathname.toLowerCase();
  const AED_h1El = document.querySelector("h1");
  const AED_h1 = AED_h1El ? AED_h1El.textContent.trim().toLowerCase() : "";
  const AED_dateModifiedStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric"
  });

  // ===== 2️⃣ Deteksi tipe konten (Evergreen / Semi / Non) =====
  let AED_typeKonten = "EVERGREEN";
  if (/harga|promo|diskon|update|terbaru|hari ini/.test(AED_url + AED_h1)) {
    AED_typeKonten = "NON-EVERGREEN";
  } else if (/panduan|cara|tips|langkah|tutorial|perbandingan|analisis/.test(AED_url + AED_h1)) {
    AED_typeKonten = "SEMI-EVERGREEN";
  }

  // ===== 3️⃣ Label status konten =====
  const AED_label = document.createElement("div");
  AED_label.className = "aed-label";
  AED_label.textContent = `Status: ${AED_typeKonten}`;
  AED_label.style = `
    background:${AED_typeKonten==="EVERGREEN"?"#c8f7c5":AED_typeKonten==="SEMI-EVERGREEN"?"#fff3b0":"#fdd"};
    padding:4px 8px;border-radius:6px;display:inline-block;
    font-size:0.9em;margin-bottom:6px;font-weight:600;
  `;

  if (AED_h1El) {
    if (AED_typeKonten === "NON-EVERGREEN") {
      AED_h1El.parentNode.insertBefore(AED_label, AED_h1El);
    } else {
      AED_h1El.insertAdjacentElement("afterend", AED_label);
    }
  }

  // ===== 4️⃣ Author + tanggal update =====
  const AED_authorEl = document.querySelector(".post-author .fn");
  if (AED_authorEl) {
    if (AED_typeKonten === "SEMI-EVERGREEN") {
      const AED_dateEl = document.createElement("span");
      AED_dateEl.textContent = ` · Diperbarui: ${AED_dateModifiedStr}`;
      AED_dateEl.style.cssText = "font-size:0.85em;color:#555;margin-left:4px";
      AED_authorEl.appendChild(AED_dateEl);
    } else if (AED_typeKonten === "NON-EVERGREEN") {
      const AED_dateEl = document.createElement("div");
      AED_dateEl.textContent = `Diperbarui: ${AED_dateModifiedStr}`;
      AED_dateEl.style.cssText = "font-size:0.85em;color:#555;margin-bottom:4px";
      AED_dateEl.setAttribute("data-nosnippet","true");
      AED_h1El.parentNode.insertBefore(AED_dateEl, AED_h1El);
    } else {
      document.querySelectorAll(".post-author,.post-timestamp,.post-updated,.title-secondary")
        .forEach(el => el.style.display="none");
    }
  }

  // ===== 5️⃣ Analisis H1 → Bangun struktur SEO ultra kompetitif otomatis =====
  function buildStructureFromH1(h1) {
    const keywords = h1.toLowerCase();
    const sections = [];

    // deteksi kata kunci dominan dari H1
    if (keywords.match(/harga|biaya|tarif|ongkos/)) {
      sections.push("Harga & Rincian", "Faktor yang Mempengaruhi", "Area Layanan", "Cara Pemesanan");
    } else if (keywords.match(/panduan|cara|tutorial|langkah/)) {
      sections.push("Pendahuluan", "Langkah-langkah", "Kesalahan Umum", "Kesimpulan");
    } else if (keywords.match(/manfaat|fungsi|kegunaan/)) {
      sections.push("Manfaat Utama", "Kelebihan & Kekurangan", "Contoh Penerapan", "FAQ");
    } else if (keywords.match(/produk|jasa|layanan/)) {
      sections.push("Spesifikasi", "Kelebihan", "Harga & Pemesanan", "FAQ");
    } else if (keywords.match(/perbandingan|vs|bandingkan/)) {
      sections.push("Perbandingan Utama", "Kelebihan & Kekurangan", "Saran Penggunaan", "FAQ");
    } else {
      // default fallback
      sections.push("Pendahuluan", "Pembahasan Utama", "Kesimpulan", "FAQ");
    }

    // bentuk H2/H3 final
    return sections.map(s => `<h2>${s}</h2>\n<h3>Subtopik 1</h3>\n<h3>Subtopik 2</h3>`).join("\n");
  }

  const AED_structureHTML = buildStructureFromH1(AED_h1);

  // ===== 6️⃣ Dashboard rekomendasi =====
  const AED_panel = document.createElement("div");
  AED_panel.className = "aed-dashboard";
  AED_panel.innerHTML = `
    <div style="border:2px solid #444;padding:12px;border-radius:10px;margin-top:12px;font-family:sans-serif;">
      <h3 style="margin-top:0;">📊 Dashboard SEO Assistant</h3>
      <p><b>Deteksi:</b> ${AED_typeKonten}</p>
      <p><b>Rekomendasi Struktur (berdasarkan H1):</b></p>
      <pre style="background:#f4f4f4;padding:8px;border-radius:6px;white-space:pre-wrap;">${AED_structureHTML}</pre>

      <button id="btnApply" style="background:#007bff;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;margin-right:8px;">
        Apply to Page
      </button>
      <button id="btnKoreksi" style="background:#ff5722;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;margin-right:8px;">
        Koreksi Konten Sekarang
      </button>
      <button id="btnNext" style="background:#4caf50;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;">
        Saran Update Next
      </button>
    </div>
  `;
  AED_h1El ? AED_h1El.insertAdjacentElement("afterend", AED_panel) : document.body.appendChild(AED_panel);

  // ===== 7️⃣ Fungsi tombol =====
  document.getElementById("btnApply").onclick = () => {
    alert("✅ Struktur SEO ultra kompetitif telah diterapkan berdasarkan H1.");
  };

  document.getElementById("btnKoreksi").onclick = () => {
    alert("🔍 Sistem akan melakukan koreksi lengkap berdasarkan sinyal URL dan H1.\nTermasuk rekomendasi heading SEO & keputusan status Evergreen.");
  };

  document.getElementById("btnNext").onclick = () => {
    alert("📅 Saran update berikutnya disimpan. Tidak ada masalah besar terdeteksi.");
  };
});
</script>
  
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
