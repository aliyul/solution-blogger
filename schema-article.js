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
// ⚡ Auto Evergreen Detector v9.8-Pro Fusion — SmartContext + Dashboard + AuthorDate + Update Tools (UPGRADED)
(function() {
  // ===== 1️⃣ Elemen & Text Detector =====
  const elContent = document.querySelector("article, main, .post-body");
  if(oldHash && oldHash == currentHash){
  else if (type === "SEMI-EVERGREEN") nextUpdate.setMonth(nextUpdate.getMonth() + 6);
  else nextUpdate.setMonth(nextUpdate.getMonth() + 3);
  const options = { day: "numeric", month: "long", year: "numeric" };
  const nextUpdateStr = nextUpdate.toLocaleDateString("id-ID", options);
  let nextUpdateStr = nextUpdate.toLocaleDateString("id-ID", options);
  let dateModifiedStr = new Date().toLocaleDateString("id-ID", options);

  // ===== 7️⃣ Label tipe konten =====
  if (elH1) {
    // remove existing label if any to avoid duplicates
    const existingLabel = elH1.parentNode.querySelector("[data-aed-label]");
    if (existingLabel) existingLabel.remove();

    const label = document.createElement("div");
    label.setAttribute("data-aed-label", "true");
    label.innerHTML = `<b>${type}</b> — pembaruan berikutnya: <b>${nextUpdateStr}</b>`;
    label.setAttribute("data-nosnippet","true");
    label.style.fontSize = "0.9em";
    label.style.color = "#444";
    label.style.marginTop = "4px";
    elH1.insertAdjacentElement("afterend", label);
    if (type === "NON-EVERGREEN") elH1.parentNode.insertBefore(label, elH1);
    else elH1.insertAdjacentElement("afterend", label);
  }

  // ===== 8️⃣ Author + Tanggal Update =====
  const authorEl = document.querySelector(".post-author .fn");
  if (authorEl) {
    // remove existing appended date to avoid duplicates
    const oldDateSpan = authorEl.querySelector(".aed-date-span");
    if (oldDateSpan) oldDateSpan.remove();
    if (type === "SEMI-EVERGREEN") {
      const dateEl = document.createElement("span");
      dateEl.className = "aed-date-span";
      dateEl.textContent = ` · Diperbarui: ${dateModifiedStr}`;
      dateEl.style.fontSize = "0.85em";
      dateEl.style.color = "#555";
      dateEl.style.marginLeft = "4px";
      authorEl.appendChild(dateEl);
    } else if (type === "NON-EVERGREEN") {
      const dateEl = document.createElement("div");
      dateEl.textContent = `Diperbarui: ${dateModifiedStr}`;
      dateEl.style.fontSize = "0.85em";
      dateEl.style.color = "#555";
      dateEl.style.marginBottom = "4px";
      dateEl.setAttribute("data-nosnippet","true");
      // insert before H1, but avoid duplicates
      const existing = document.querySelector(".aed-non-evergreen-date");
      if (!existing) {
        dateEl.className = "aed-non-evergreen-date";
        if (elH1 && elH1.parentNode) elH1.parentNode.insertBefore(dateEl, elH1);
      }
    } 
    if (type === "EVERGREEN") {
      const metaBlocks = document.querySelectorAll(".post-author, .post-timestamp, .post-updated, .title-secondary");
      metaBlocks.forEach(el => el.style.display = "none");
    }
  }

  // ===== 🧠 8️⃣ SmartContext — Analisis Nama URL & Konteks =====
  // ===== 9️⃣ Smart Context + Meta Desc =====
  let urlRaw = window.location.pathname.split("/").filter(Boolean).pop() || "";
  urlRaw = urlRaw.replace(/^p\//, "").replace(/\.html$/i, "").replace(/\b(0?[1-9]|1[0-2]|20\d{2})\b/g, "").replace(/[-_]/g, " ").trim().toLowerCase();
  const h1Diff = urlRaw !== h1Text.toLowerCase();
  const recommendedH1 = urlRaw
    ? urlRaw.split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")
    : h1Text;
  const recommendedH1 = urlRaw ? urlRaw.split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ") : h1Text;

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
  // ===== 🔟 Struktur SEO Ultra Kompetitif (template per tipe) =====
  const ultraStructure = {
    EVERGREEN: [
      { h2: "Pendahuluan", h3: ["Definisi singkat", "Siapa yang butuh ini"] },
      { h2: "Manfaat & Kegunaan", h3: ["Manfaat utama", "Kapan digunakan"] },
      { h2: "Langkah / Tutorial Lengkap", h3: ["Persiapan", "Langkah 1", "Langkah 2", "Tips"] },
      { h2: "Contoh & Studi Kasus", h3: ["Contoh 1", "Contoh 2"] },
      { h2: "FAQ", h3: ["Pertanyaan Umum 1", "Pertanyaan Umum 2"] }
    ],
    SEMI-EVERGREEN: [
      { h2: "Ringkasan & Tren", h3: ["Apa yang berubah", "Data terbaru"] },
      { h2: "Langkah / Cara", h3: ["Langkah utama", "Contoh penggunaan"] },
      { h2: "Perbandingan / Analisis", h3: ["Kelebihan", "Kekurangan"] },
      { h2: "Saran Praktis", h3: ["Tips", "Kesimpulan singkat"] }
    ],
    NON-EVERGREEN: [
      { h2: "Harga & Promo Terkini", h3: ["Daftar Harga", "Syarat & Ketentuan"] },
      { h2: "Ketersediaan & Wilayah", h3: ["Area 1", "Area 2"] },
      { h2: "Periode & Update", h3: ["Tanggal berlaku", "Catatan penting"] },
      { h2: "Kontak & Cara Order", h3: ["Kontak", "Proses pemesanan"] }
    ]
  };

  const optimizationSuggestion =
    type !== contextSignal
      ? `⚠️ Konten terdeteksi ${type}, namun URL mengarah ke ${contextSignal}. Ubah gaya atau struktur konten agar sesuai intent.`
      : `✅ Struktur konten sudah sesuai intent ${type}. Pertahankan gaya & update sesuai jadwal.`;

  const suggestion = `${optimizationSuggestion}\n${structureAdvice[type]}\nHighlight angka penting (${highlightMatches.length}): ${highlightMatches.join(", ")}`;

  // ===== 1️⃣4️⃣ Dashboard =====
  let table = document.getElementById("AEDv10_dashboardTable");
  // ===== 1️⃣1️⃣ Dashboard =====
  let table = document.getElementById("AEDv98_dashboardTable");
  if (!table) {
    table = document.createElement("table");
    table.id = "AEDv10_dashboardTable";
    table.id = "AEDv98_dashboardTable";
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.marginTop = "20px";
    table.innerHTML = `
      <thead>
        <tr style="background:#dff0ff;">
          <th>Halaman</th><th>Tipe</th><th>Score</th><th>Kata</th><th>Konteks URL</th>
          <th>Rekom H1</th><th>Meta Desc</th><th>Insight & Saran</th>
          <th style="padding:6px;border:1px solid #ccc;">Halaman</th>
          <th style="padding:6px;border:1px solid #ccc;">Tipe</th>
          <th style="padding:6px;border:1px solid #ccc;">Score</th>
          <th style="padding:6px;border:1px solid #ccc;">Kata</th>
          <th style="padding:6px;border:1px solid #ccc;">Konteks URL</th>
          <th style="padding:6px;border:1px solid #ccc;">Rekom H1</th>
          <th style="padding:6px;border:1px solid #ccc;">Meta Desc</th>
          <th style="padding:6px;border:1px solid #ccc;">Saran Struktur</th>
          <th style="padding:6px;border:1px solid #ccc;">Tindakan</th>
        </tr>
      </thead><tbody></tbody>`;
    document.body.appendChild(table);
  }

  const tbody = table.querySelector("tbody");
  const pageTitle = h1Text || document.title || "Unknown Page";
  const structureAdvice = {
    EVERGREEN: "H2: Pendahuluan, Manfaat, Langkah/Tutorial, Contoh, FAQ",
    SEMI-EVERGREEN: "H2: Ringkasan/Tren, Langkah, Perbandingan, Saran Praktis",
    NON-EVERGREEN: "H2: Harga, Wilayah, Periode, Kontak"
  };
  const suggestion = `${structureAdvice[type]} — Update berikutnya: ${nextUpdateStr}`;

  // create single row or update existing row
  let existingRow = tbody.querySelector("tr[data-aed-page='"+pageTitle+"']");
  if (existingRow) existingRow.remove();
  const row = document.createElement("tr");
  row.setAttribute("data-aed-page", pageTitle);
  row.innerHTML = `
    <td>${pageTitle}</td>
    <td>${type}</td>
    <td>${score.toFixed(1)}</td>
    <td>${wordCount}</td>
    <td>${contextSignal}</td>
    <td>${recommendedH1}</td>
    <td>${metaDesc}</td>
    <td style="white-space:pre-wrap;">${suggestion}</td>`;
    <td style="padding:6px;border:1px solid #ccc;">${pageTitle}</td>
    <td style="padding:6px;border:1px solid #ccc;">${type}</td>
    <td style="padding:6px;border:1px solid #ccc;">${score.toFixed(1)}</td>
    <td style="padding:6px;border:1px solid #ccc;">${wordCount}</td>
    <td style="padding:6px;border:1px solid #ccc;">${contextSignal}</td>
    <td style="padding:6px;border:1px solid #ccc;">${recommendedH1}</td>
    <td style="padding:6px;border:1px solid #ccc;">${metaDesc}</td>
    <td style="padding:6px;border:1px solid #ccc;white-space:pre-wrap;">${suggestion}</td>
    <td style="padding:6px;border:1px solid #ccc;text-align:center;">
      <span id="aedActions"></span>
    </td>`;
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
  // ===== 1️⃣2️⃣ Buttons logic (conditional) =====
  const actionsSpan = document.getElementById("aedActions");
  actionsSpan.innerHTML = ""; // clear

  const createBtn = (id, text, bg="#fff") => {
    const b = document.createElement("button");
    b.id = id;
    b.textContent = text;
    b.style.padding = "6px 10px";
    b.style.margin = "3px";
    b.style.cursor = "pointer";
    b.style.border = "1px solid #bbb";
    b.style.borderRadius = "4px";
    b.style.background = bg;
    return b;
  };

  // Show Koreksi only if mismatch or H1 differs or context mismatch
  const needsCorrection = (type !== contextSignal) || h1Diff;
  if (needsCorrection) {
    const btnKoreksi = createBtn("btnKoreksi", "Koreksi Konten Sekarang", "#ffeedd");
    actionsSpan.appendChild(btnKoreksi);
    btnKoreksi.addEventListener("click", openCorrectionModal);
  } else {
    const btnNext = createBtn("btnNext", "Saran Update Berikutnya", "#e8f7ff");
    actionsSpan.appendChild(btnNext);
    btnNext.addEventListener("click", showNextSuggestions);
  }

  // also add a small "Download Report" button always
  const btnReport = createBtn("btnReport", "Download Laporan", "#f3f3f3");
  actionsSpan.appendChild(btnReport);
  btnReport.addEventListener("click", () => {
    const report = buildCorrectionText(true);
    downloadFile(`${(recommendedH1||pageTitle).replace(/\s+/g,"_")}_AED_Report.txt`, report);
    alert("✅ Laporan AED diunduh.");
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
  // ===== Utility: build correction text (full suggestion file) =====
  function buildCorrectionText(asReport=false) {
    const lines = [];
    lines.push(`=== EvergreenAI v9.8-Pro Fusion ${asReport ? "REPORT" : "CORRECTION"} ===`);
    lines.push(`URL: ${location.href}`);
    lines.push(`Detected type: ${type}`);
    lines.push(`Context signal (from URL): ${contextSignal}`);
    lines.push(`Score: ${score.toFixed(1)} | Words: ${wordCount}`);
    lines.push(`H1 (current): ${h1Text}`);
    lines.push(`H1 (recommended): ${recommendedH1}`);
    lines.push("");
    lines.push("=== Meta Description Recommendation ===");
    lines.push(metaDesc);
    lines.push("");
    lines.push("=== Struktur Heading SEO Ultra Kompetitif (Rekomendasi) ===");
    const struct = ultraStructure[type] || [];
    struct.forEach(section => {
      lines.push(`- H2: ${section.h2}`);
      if (section.h3 && section.h3.length) {
        section.h3.forEach(h3 => lines.push(`    - H3: ${h3}`));
      }
    });
    lines.push("");
    lines.push("=== Saran Perubahan Konten ===");
    if (needsCorrection) {
      lines.push("- Rekomendasi mengubah H1 ke H1(recommended).");
      lines.push("- Tambahkan H2/H3 sesuai struktur di atas.");
      lines.push("- Perkuat paragraf pembuka dengan kata kunci utama dan intent (informational/transactional).");
      if (type !== contextSignal) lines.push(`- Pertimbangkan menjadikan konten ${contextSignal} style (ubah fokus ke ${contextSignal}).`);
    } else {
      lines.push("- Konten sudah sesuai. Lakukan update berkala sesuai jadwal di dashboard.");
      lines.push("- Saran update ringan: perbarui statistik/angka, periksa internal links, optimalkan meta.");
    }
    lines.push("");
    lines.push("=== Generated by EvergreenAI v9.8-Pro Fusion ===");
    return lines.join("\n");
  }

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
  // ===== download helper =====
  function downloadFile(name, content) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ===== 1️⃣3️⃣ Koreksi Modal & Apply =====
  function openCorrectionModal() {
    // modal container
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.left = "0";
    modal.style.top = "0";
    modal.style.right = "0";
    modal.style.bottom = "0";
    modal.style.background = "rgba(0,0,0,0.45)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = 99999;

    const box = document.createElement("div");
    box.style.width = "760px";
    box.style.maxHeight = "80vh";
    box.style.overflow = "auto";
    box.style.background = "#fff";
    box.style.borderRadius = "8px";
    box.style.padding = "16px";
    box.style.boxShadow = "0 8px 30px rgba(0,0,0,0.2)";

    // header
    const h = document.createElement("h3");
    h.textContent = "Koreksi Konten Otomatis — Pratinjau";
    box.appendChild(h);

    // summary
    const sum = document.createElement("div");
    sum.style.marginBottom = "10px";
    sum.innerHTML = `<b>Rekomendasi H1:</b> ${recommendedH1} <br><b>Meta:</b> ${metaDesc} <br><b>Tipe terdeteksi:</b> ${type} | <b>Context signal:</b> ${contextSignal}`;
    box.appendChild(sum);

    // structure preview
    const struct = ultraStructure[type] || [];
    const structDiv = document.createElement("div");
    structDiv.style.marginBottom = "10px";
    structDiv.innerHTML = `<b>Struktur Heading (Preview):</b>`;
    struct.forEach(s => {
      const p = document.createElement("div");
      p.style.margin = "8px 0";
      p.innerHTML = `<b>H2:</b> ${s.h2}<br><small>H3: ${s.h3 ? s.h3.join(" • ") : "-"}</small>`;
      structDiv.appendChild(p);
    });
    box.appendChild(structDiv);

    // action buttons
    const btnWrap = document.createElement("div");
    btnWrap.style.textAlign = "right";
    btnWrap.style.marginTop = "12px";

    const downloadBtn = createBtn("modalDownload", "Download Koreksi (TXT)");
    downloadBtn.style.marginRight = "8px";
    downloadBtn.addEventListener("click", () => {
      const content = buildCorrectionText(false);
      downloadFile(`${(recommendedH1||pageTitle).replace(/\s+/g,"_")}_Koreksi.txt`, content);
    });
  })();

  console.log(`🧠 [EvergreenAI v10.0] ${type} (${contextSignal}) | Score ${score.toFixed(1)} | Word ${wordCount}`);
    const applyBtn = createBtn("modalApply", "Apply Corrections to Page", "#dfffe0");
    applyBtn.title = "Akan mengganti H1 & menambahkan H2/H3 rekomendasi (tidak menghapus link internal).";

    const closeBtn = createBtn("modalClose", "Tutup", "#fff");
    closeBtn.style.marginLeft = "8px";

    btnWrap.appendChild(downloadBtn);
    btnWrap.appendChild(applyBtn);
    btnWrap.appendChild(closeBtn);
    box.appendChild(btnWrap);

    modal.appendChild(box);
    document.body.appendChild(modal);

    // handlers
    closeBtn.addEventListener("click", () => modal.remove());
    downloadBtn.addEventListener("click", () => { /* handled above */ });

    applyBtn.addEventListener("click", () => {
      try {
        applyCorrectionsToPage(struct);
        // update modified date & next update
        dateModifiedStr = new Date().toLocaleDateString("id-ID", options);
        nextUpdate.setMonth((new Date()).getMonth() + (type === "EVERGREEN" ? 12 : type === "SEMI-EVERGREEN" ? 6 : 3));
        nextUpdateStr = nextUpdate.toLocaleDateString("id-ID", options);
        // update label & author display
        const label = document.querySelector("[data-aed-label]");
        if (label) label.innerHTML = `<b>${type}</b> — pembaruan berikutnya: <b>${nextUpdateStr}</b>`;
        const appendedSpan = document.querySelector(".aed-date-span");
        if (appendedSpan) appendedSpan.textContent = ` · Diperbarui: ${dateModifiedStr}`;
        // add small success toast
        alert("✅ Koreksi diterapkan ke halaman (H1 & struktur tambahan ditambahkan). Periksa perubahan pada konten.");
      } catch (err) {
        console.error(err);
        alert("❌ Gagal menerapkan koreksi: " + err.message);
      } finally {
        modal.remove();
        // refresh dashboard row suggestion text
        const cell = tbody.querySelector("tr[data-aed-page='"+pageTitle+"'] td:nth-child(8)");
        if (cell) cell.textContent = `${structureAdvice[type]} — Update berikutnya: ${nextUpdateStr}`;
      }
    });
  }

  // ===== 1️⃣4️⃣ Apply corrections to page (safe, preserve internal links) =====
  function applyCorrectionsToPage(structureArray) {
    // 1) update H1 if different
    if (elH1 && recommendedH1 && elH1.innerText.trim() !== recommendedH1) {
      elH1.innerText = recommendedH1;
    }

    if (!elContent) {
      // if no content container found, append to body
      const container = document.createElement("div");
      container.className = "post-body";
      document.body.appendChild(container);
    }

    // 2) Add missing H2/H3 structure near end of content but keep existing HTML intact
    // We'll append a wrapper section "AED - Struktur Tambahan" with headings only where missing
    const wrapperId = "aed-structure-wrapper";
    let wrapper = document.getElementById(wrapperId);
    if (!wrapper) {
      wrapper = document.createElement("section");
      wrapper.id = wrapperId;
      wrapper.style.borderTop = "1px dashed #ccc";
      wrapper.style.marginTop = "16px";
      wrapper.style.paddingTop = "12px";
      wrapper.setAttribute("data-nosnippet","true");
      elContent.appendChild(wrapper);
    }

    structureArray.forEach(sec => {
      const h2Text = sec.h2;
      // check if existing H2 contains this heading (case-insensitive)
      const exists = [...h2Els].some(h => h.innerText.trim().toLowerCase().includes(h2Text.toLowerCase()));
      if (!exists) {
        const h2 = document.createElement("h2");
        h2.innerText = h2Text;
        wrapper.appendChild(h2);
        // add H3 placeholders
        if (sec.h3 && sec.h3.length) {
          sec.h3.forEach(textH3 => {
            const h3 = document.createElement("h3");
            h3.innerText = textH3;
            h3.style.fontWeight = "600";
            h3.style.fontSize = "0.98em";
            wrapper.appendChild(h3);
            const p = document.createElement("p");
            p.innerText = `[[Tambahkan konten untuk: ${textH3}]]`;
            p.style.color = "#444";
            p.style.fontStyle = "italic";
            wrapper.appendChild(p);
          });
        } else {
          // placeholder paragraph
          const p = document.createElement("p");
          p.innerText = `[[Tambahkan konten untuk: ${h2Text}]]`;
          p.style.color = "#444";
          p.style.fontStyle = "italic";
          wrapper.appendChild(p);
        }
      }
    });

    // 3) Preserve internal links: we didn't replace innerHTML of elContent, only appended wrapper
    // 4) Update meta description tag if present
    const metaTag = document.querySelector("meta[name='description']");
    if (metaTag) metaTag.setAttribute("content", metaDesc);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = metaDesc;
      document.head.appendChild(m);
    }

    // 5) Update modified timestamp in a meta tag (data-nosnippet)
    const modMeta = document.querySelector("meta[name='last-modified-aed']");
    const nowISO = new Date().toISOString();
    if (modMeta) modMeta.setAttribute("content", nowISO);
    else {
      const mm = document.createElement("meta");
      mm.name = "last-modified-aed";
      mm.content = nowISO;
      document.head.appendChild(mm);
    }
  }

  // ===== 1️⃣5️⃣ Next suggestion UI =====
  function showNextSuggestions() {
    const sb = document.createElement("div");
    sb.style.background = "#fff";
    sb.style.border = "1px solid #ccc";
    sb.style.padding = "12px";
    sb.style.marginTop = "10px";
    sb.style.maxWidth = "760px";
    sb.innerHTML = `<b>Saran Update Berikutnya</b>
      <ul>
        <li>Perbarui angka/statistik dalam paragraf terkait.</li>
        <li>Tambahkan 1 contoh/studi kasus jika relevan.</li>
        <li>Periksa internal link & tambahkan link ke panduan/halaman relevan.</li>
      </ul>
      <small>Rekomendasi jadwal: ${nextUpdateStr}</small>`;
    table.insertAdjacentElement("afterend", sb);
    sb.scrollIntoView({behavior:"smooth"});
  }

  // ===== 1️⃣6️⃣ Expose ke Window (untuk automation/debug) =====
  Object.assign(window, {
    AEDv98_type: type,
    AEDv98_contextSignal: contextSignal,
    AEDv98_score: score.toFixed(1),
    AEDv98_wordCount: wordCount,
    AEDv98_recommendedH1: recommendedH1,
    AEDv98_metaDescription: metaDesc,
    AEDv98_suggestion: suggestion
  });

  console.log(`🧠 [EvergreenAI v9.8-Pro Fusion] ${type} (${contextSignal}) | Score ${score.toFixed(1)} | Word ${wordCount}`);
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
