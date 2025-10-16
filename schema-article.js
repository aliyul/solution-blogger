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
/* ga perlu lagi karna udah di seting ke perubahan yg penting saja
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
*/
// ================== DETEKSI TYPE KONTEN ==================
(function () {
  try {
    console.log("🚀 AED Final Interaktif v7.0 — Stable SEO Safe");

    // ===== 1️⃣ Elemen & Text Detector =====
    const elContent = document.querySelector("article, main, .post-body");
    const elH1 = document.querySelector("h1");
    const h1Text = elH1?.innerText || "(no H1)";
    const textContent = (elContent?.innerText || "").slice(0, 4000).toLowerCase();

    // ===== 2️⃣ Hash / Cache =====
    const oldHash = localStorage.getItem("AutoEvergreenHash");
    const currentHash = btoa(unescape(encodeURIComponent(h1Text + textContent)));

    // ===== 3️⃣ Detect Type =====
    const urlRaw = window.location.pathname
      .split("/")
      .filter(Boolean)
      .pop()
      ?.replace(/^p\//, "")
      .replace(/\.html$/i, "")
      .replace(/\b(0?[1-9]|1[0-2]|20\d{2})\b/g, "")
      .replace(/[-_]/g, " ")
      .trim()
      .toLowerCase() || "";

    const evergreenKeywords = ["panduan", "tutorial", "cara", "manfaat"];
    const nonEvergreenKeywords = ["harga", "update"];

    let type;
    if (nonEvergreenKeywords.some((k) => urlRaw.includes(k))) type = "NON-EVERGREEN";
    else if (evergreenKeywords.some((k) => urlRaw.includes(k))) type = "EVERGREEN";
    else if (evergreenKeywords.some((k) => textContent.includes(k))) type = "EVERGREEN";
    else type = "SEMI-EVERGREEN";

    // ===== 4️⃣ Smart nextUpdate =====
    const nextUpdate = new Date();
    let dateModified = null;
    if (!oldHash || oldHash !== currentHash) {
      if (type === "EVERGREEN") nextUpdate.setMonth(nextUpdate.getMonth() + 12);
      else if (type === "SEMI-EVERGREEN") nextUpdate.setMonth(nextUpdate.getMonth() + 6);
      else nextUpdate.setMonth(nextUpdate.getMonth() + 3);
      dateModified = new Date(); // hanya update jika hash berubah signifikan
    } else {
      console.log("♻️ Tidak ada perubahan signifikan — dateModified tidak diperbarui.");
    }

    const opt = { day: "numeric", month: "long", year: "numeric" };
    const nextUpdateStr = nextUpdate.toLocaleDateString("id-ID", opt);
    const dateModifiedStr = dateModified ? dateModified.toLocaleDateString("id-ID", opt) : null;

    // ===== 5️⃣ Label Info (non-snippet) =====
    if (elH1) {
      const existingLabel = elH1.parentNode.querySelector("[data-aed-label]");
      if (existingLabel) existingLabel.remove();
      const label = document.createElement("div");
      label.setAttribute("data-aed-label", "true");
      label.setAttribute("data-nosnippet", "true");
      label.style.fontSize = "0.9em";
      label.style.color = "#444";
      label.style.marginTop = "4px";
      label.innerHTML = `<b>${type}</b> — pembaruan berikutnya: <b>${nextUpdateStr}</b>`;
      elH1.insertAdjacentElement("afterend", label);
    }

    // ===== 6️⃣ Author & Date Modified =====
    const authorEl = document.querySelector(".post-author .fn");
    if (authorEl && dateModifiedStr) {
      const oldDateSpan = authorEl.querySelector(".aed-date-span");
      if (oldDateSpan) oldDateSpan.remove();

      const dateEl = document.createElement("span");
      dateEl.className = "aed-date-span";
      dateEl.textContent = ` · Diperbarui: ${dateModifiedStr}`;
      dateEl.style.fontSize = "0.85em";
      dateEl.style.color = "#555";
      dateEl.style.marginLeft = "4px";
      authorEl.appendChild(dateEl);
    }

    // ===== 7️⃣ Rekomendasi H1 =====
    const urlKeywords = urlRaw.split(" ").filter(Boolean);
    const h1Lower = h1Text.toLowerCase();
    const allKeywordsPresent = urlKeywords.every((k) => h1Lower.includes(k));
    const h1Diff = !allKeywordsPresent;

    const recommendedH1 = h1Diff
      ? urlKeywords.map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")
      : h1Text;

    // ===== 8️⃣ Struktur Ultra =====
    const ultraStructure = {
      EVERGREEN: ["Pendahuluan", "Manfaat & Kegunaan", "Langkah / Tutorial Lengkap", "Contoh & Studi Kasus", "FAQ"],
      SEMI: ["Ringkasan & Tren", "Langkah / Cara", "Perbandingan / Analisis", "Saran Praktis"],
      NON: ["Harga & Promo Terkini", "Ketersediaan & Wilayah", "Periode & Update", "Kontak & Cara Order"],
    }[type.split("-")[0]];

    // ===== 9️⃣ Dashboard =====
    const dash = document.createElement("div");
    dash.style.maxWidth = "1200px";
    dash.style.margin = "30px auto";
    dash.style.padding = "15px";
    dash.style.background = "#f0f8ff";
    dash.style.borderTop = "3px solid #0078ff";
    dash.style.fontFamily = "Arial, sans-serif";
    dash.setAttribute("data-nosnippet", "true");

    const h3 = document.createElement("h3");
    h3.innerText = "📊 AED Dashboard — Ringkasan Halaman";
    dash.appendChild(h3);

    const btnContainer = document.createElement("div");
    btnContainer.style.textAlign = "center";
    btnContainer.style.marginBottom = "10px";

    const createBtn = (text, bg) => {
      const b = document.createElement("button");
      b.textContent = text;
      b.style.background = bg;
      b.style.color = "#000";
      b.style.padding = "6px 12px";
      b.style.margin = "3px";
      b.style.borderRadius = "4px";
      b.style.cursor = "pointer";
      b.style.border = "none";
      b.style.fontSize = "0.9em";
      b.setAttribute("data-nosnippet", "true");
      return b;
    };

    const btnKoreksi = createBtn("⚙️ Koreksi & Preview", "#ffeedd");
    const btnShowTable = createBtn("📊 Tampilkan Data Table", "#d1e7dd");
    const btnReport = createBtn("📥 Download Laporan", "#f3f3f3");
    btnContainer.append(btnKoreksi, btnShowTable, btnReport);
    dash.appendChild(btnContainer);

    // ===== Table (responsive) =====
    const tableWrap = document.createElement("div");
    tableWrap.style.overflowX = "auto";
    tableWrap.style.display = "none";
    tableWrap.innerHTML = `
      <table style="width:100%;border-collapse:collapse;min-width:800px;font-size:0.9em;">
        <thead style="position:sticky;top:0;background:#dff0ff;z-index:2;">
          <tr>
            <th>Halaman</th><th>Tipe</th><th>H1</th><th>Rekom H1</th><th>Next Update</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${document.title}</td>
            <td>${type}</td>
            <td>${h1Text}</td>
            <td>${recommendedH1}</td>
            <td>${nextUpdateStr}</td>
          </tr>
        </tbody>
      </table>`;
    dash.appendChild(tableWrap);
    document.body.appendChild(dash);

    // ===== Interaksi Tombol =====
    btnShowTable.onclick = () => {
      tableWrap.style.display = tableWrap.style.display === "none" ? "block" : "none";
    };

    btnKoreksi.onclick = () => {
      alert(
        `🔍 Koreksi & Preview\n\nRekomendasi H1:\n${recommendedH1}\n\nStruktur ideal (${type}):\n${ultraStructure.join(
          " → "
        )}\n\nNext Update: ${nextUpdateStr}`
      );
    };

    btnReport.onclick = () => {
      const report = `
AED REPORT — ${document.title}

Tipe Konten: ${type}
H1 Saat Ini: ${h1Text}
Rekomendasi H1: ${recommendedH1}
${dateModifiedStr ? `Tanggal Diperbarui: ${dateModifiedStr}` : ""}
Next Update: ${nextUpdateStr}

Struktur Ideal:
${ultraStructure.join("\n")}

URL: ${location.href}
      `.trim();
      const blob = new Blob([report], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `AED_Report_${document.title.replace(/\s+/g, "_")}.txt`;
      link.click();
    };

    // ===== Responsive tweak =====
    const style = document.createElement("style");
    style.innerHTML = `
      @media(max-width:768px){
        table th,table td{padding:4px;font-size:0.8em;}
        table{min-width:600px;}
      }
      thead th{position:sticky;top:0;background:#dff0ff;}
      table th,td{border:1px solid #ccc;padding:6px;text-align:left;}
    `;
    document.head.appendChild(style);

    // ===== Save hash =====
    localStorage.setItem("AutoEvergreenHash", currentHash);
    console.log("✅ AED v7.0 — Final Stable, SEO-safe, responsive dashboard aktif.");
  } catch (e) {
    console.error("❌ AED Error:", e);
  }
})();

/**
 * 🌿 Hybrid Evergreen Detector v7.1
 * ✅ Smart Section Update + Auto dateModified + Responsive Dashboard
 * Beton Jaya Readymix ©2025
 */
/* ===== 🧩 Hybrid Evergreen Detector + Smart DateModified Updater v7.4 (Responsive Fix) ===== */
(function runEvergreenDetector() {
  console.log("🔍 Hybrid Evergreen Detector running with smart dateModified...");

  // ===== Inject responsive CSS langsung (agar selalu aktif) =====
  const style = document.createElement("style");
  style.textContent = `
  [data-nosnippet] {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  [data-nosnippet] table {
    width: 100%;
    border-collapse: collapse;
    min-width: 700px;
  }
  [data-nosnippet] th, [data-nosnippet] td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
    vertical-align: top;
  }
  [data-nosnippet] thead {
    position: sticky;
    top: 0;
    background: #f9fcff;
    z-index: 5;
  }
  [data-nosnippet] tr:nth-child(even) {
    background: #fafafa;
  }
  @media (max-width: 768px) {
    [data-nosnippet] table { min-width: 600px; }
    [data-nosnippet] td { font-size: 13px; word-break: break-word; }
    [data-nosnippet] button { width: 100%; margin-top: 10px; }
  }
  `;
  document.head.appendChild(style);

  // ===== Util: bersihkan teks =====
  function cleanText(str) {
    if (!str) return "";
    return str.replace(/\s+/g, " ").trim();
  }

  // ===== Ambil seluruh section berdasarkan H2/H3 =====
  const allSections = [];
  const contentRoot =
    document.querySelector("article") ||
    document.querySelector(".post-body") ||
    document.querySelector("main") ||
    document.body;

  const headings = contentRoot.querySelectorAll("h2, h3");
  let currentSection = null;

  headings.forEach((h) => {
    if (h.tagName === "H2") {
      if (currentSection) allSections.push(currentSection);
      currentSection = { title: cleanText(h.innerText), content: "" };
    } else if (h.tagName === "H3" && currentSection) {
      currentSection.content += "\n" + cleanText(h.innerText);
    }

    // Ambil isi paragraf di bawah heading
    let next = h.nextElementSibling;
    while (next && !/^H[23]$/i.test(next.tagName)) {
      if (next.innerText) currentSection.content += "\n" + cleanText(next.innerText);
      next = next.nextElementSibling;
    }
  });
  if (currentSection) allSections.push(currentSection);

  // ===== Deteksi tipe konten =====
  function detectType(text) {
    const lower = text.toLowerCase();
    if (/(harga|update|promo|diskon|biaya|daftar terbaru|bulan ini|tahun)/.test(lower))
      return "NON-EVERGREEN";
    if (/(proyek|spesifikasi|fitur|jenis|perbandingan|keunggulan)/.test(lower))
      return "SEMI-EVERGREEN";
    return "EVERGREEN";
  }

  // ===== Hash util =====
  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  // ===== Deteksi perubahan per section =====
  const sectionResults = [];
  let importantChangeDetected = false;

  allSections.forEach((sec, i) => {
    const type = detectType(sec.title + " " + sec.content);
    const hash = hashString(sec.title + sec.content);
    const key = "sec_hash_" + i + "_" + location.pathname;
    const prevHash = localStorage.getItem(key);
    const changed = prevHash && prevHash !== String(hash);
    localStorage.setItem(key, hash);

    if (changed && (type === "NON-EVERGREEN" || type === "SEMI-EVERGREEN")) {
      importantChangeDetected = true;
    }

    let updateMonths =
      type === "EVERGREEN" ? 12 : type === "SEMI-EVERGREEN" ? 6 : 3;
    const nextUpdateDate = new Date();
    nextUpdateDate.setMonth(nextUpdateDate.getMonth() + updateMonths);

    let advice = [];
    const txt = sec.content.toLowerCase();
    if (/harga|biaya|tarif/.test(txt)) advice.push("Perbarui data harga agar tetap akurat.");
    if (/spesifikasi|fitur|ukuran/.test(txt))
      advice.push("Tambahkan tabel spesifikasi terbaru atau bandingkan produk.");
    if (/manfaat|fungsi/.test(txt)) advice.push("Tambahkan contoh penerapan nyata atau visual.");
    if (txt.length < 400) advice.push("Perluas isi agar lebih komprehensif.");
    if (!/faq|pertanyaan|tanya/.test(txt) && i === allSections.length - 1)
      advice.push("Tambahkan FAQ di akhir artikel.");

    sectionResults.push({
      section: sec.title || "(Tanpa Judul)",
      type,
      changed,
      nextUpdate: nextUpdateDate.toLocaleDateString(),
      advice: advice.length ? advice.join(" ") : "Konten stabil, tidak perlu pembaruan besar.",
    });
  });

  // ===== Smart Global dateModified update =====
  if (importantChangeDetected) {
    const today = new Date().toISOString().split("T")[0];
    console.log(`🕓 Penting! Update terdeteksi → Set dateModified: ${today}`);

    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach((script) => {
      try {
        const data = JSON.parse(script.textContent);
        if (data && data.dateModified) {
          data.dateModified = today;
          script.textContent = JSON.stringify(data, null, 2);
          console.log("✅ Schema dateModified diperbarui.");
        }
      } catch (e) {}
    });

    let meta = document.querySelector('meta[itemprop="dateModified"]');
    if (meta) {
      meta.setAttribute("content", today);
      console.log("✅ Meta dateModified diperbarui.");
    }

    localStorage.setItem("lastGlobalModified_" + location.pathname, today);
  }

  // ===== Tampilkan hasil ke tabel =====
  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-nosnippet", "true");
  Object.assign(wrapper.style, {
    overflowX: "auto",
    marginTop: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    background: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    padding: "10px",
    fontFamily: "system-ui, sans-serif",
    fontSize: "0.9em",
    maxWidth: "100%",
  });

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.style.minWidth = "900px";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Section</th>
        <th>Tipe</th>
        <th>Perubahan</th>
        <th>Next Update</th>
        <th>Saran</th>
      </tr>
    </thead>
    <tbody>
      ${sectionResults
        .map(
          (s) => `
        <tr>
          <td>${s.section}</td>
          <td style="font-weight:600;color:${
            s.type === "EVERGREEN"
              ? "green"
              : s.type === "SEMI-EVERGREEN"
              ? "orange"
              : "red"
          };">${s.type}</td>
          <td>${s.changed ? "✅ Berubah" : "– Stabil"}</td>
          <td>${s.nextUpdate}</td>
          <td>${s.advice}</td>
        </tr>`
        )
        .join("")}
    </tbody>
  `;
  wrapper.appendChild(table);

  const rerunBtn = document.createElement("button");
  rerunBtn.textContent = "🔄 Deteksi Ulang Sekarang";
  Object.assign(rerunBtn.style, {
    marginTop: "15px",
    padding: "10px 18px",
    background: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  });
  rerunBtn.addEventListener("click", () => {
    console.log("🔁 Deteksi ulang dijalankan manual...");
    wrapper.remove();
    runEvergreenDetector();
  });
  wrapper.appendChild(rerunBtn);

  const info = document.createElement("div");
  info.style.marginTop = "8px";
  info.style.fontSize = "13px";
  info.style.color = importantChangeDetected ? "green" : "gray";
  info.textContent = importantChangeDetected
    ? "✔ Konten penting telah diperbarui (dateModified sinkron)"
    : "ℹ Tidak ada perubahan signifikan pada konten utama.";
  wrapper.appendChild(info);

  const target =
    document.querySelector("#aed-dashboard") ||
    document.querySelector("main") ||
    document.body;
  target.appendChild(wrapper);

  console.log("✅ Hybrid Evergreen Detector selesai & dateModified sinkron otomatis bila perlu.");
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
