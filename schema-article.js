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
// ⚡ Auto Evergreen Detector v9.8-Pro Fusion — SmartContext + Dashboard + AuthorDate + Auto H2/H3 Builder
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
  let nextUpdateStr = nextUpdate.toLocaleDateString("id-ID", options);
  let dateModifiedStr = new Date().toLocaleDateString("id-ID", options);

  // ===== 7️⃣ Label tipe konten =====
  if (elH1) {
    const existingLabel = elH1.parentNode.querySelector("[data-aed-label]");
    if (existingLabel) existingLabel.remove();
    const label = document.createElement("div");
    label.setAttribute("data-aed-label", "true");
    label.innerHTML = `<b>${type}</b> — pembaruan berikutnya: <b>${nextUpdateStr}</b>`;
    label.setAttribute("data-nosnippet","true");
    label.style.fontSize = "0.9em";
    label.style.color = "#444";
    label.style.marginTop = "4px";
    if (type === "NON-EVERGREEN") elH1.parentNode.insertBefore(label, elH1);
    else elH1.insertAdjacentElement("afterend", label);
  }

  // ===== 8️⃣ Author + Tanggal Update =====
  const authorEl = document.querySelector(".post-author .fn");
  if (authorEl) {
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
      const existing = document.querySelector(".aed-non-evergreen-date");
      if (!existing) {
        const dateEl = document.createElement("div");
        dateEl.className = "aed-non-evergreen-date";
        dateEl.textContent = `Diperbarui: ${dateModifiedStr}`;
        dateEl.style.fontSize = "0.85em";
        dateEl.style.color = "#555";
        dateEl.style.marginBottom = "4px";
        dateEl.setAttribute("data-nosnippet","true");
        if (elH1 && elH1.parentNode) elH1.parentNode.insertBefore(dateEl, elH1);
      }
    } 
    if (type === "EVERGREEN") {
      const metaBlocks = document.querySelectorAll(".post-author, .post-timestamp, .post-updated, .title-secondary");
      metaBlocks.forEach(el => el.style.display = "none");
    }
  }

  // ===== 9️⃣ Smart Context + Meta Desc =====
  let urlRaw = window.location.pathname.split("/").filter(Boolean).pop() || "";
  urlRaw = urlRaw.replace(/^p\//, "").replace(/\.html$/i, "").replace(/\b(0?[1-9]|1[0-2]|20\d{2})\b/g, "").replace(/[-_]/g, " ").trim().toLowerCase();
  const h1Diff = urlRaw !== h1Text.toLowerCase();
  const recommendedH1 = urlRaw ? urlRaw.split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ") : h1Text;

  const sentences = textContent.split(/\.|\n/).filter(Boolean);
  let metaDesc = sentences.slice(0,3).join(". ").substring(0,160).trim();
  if (metaDesc.length < 50) metaDesc = recommendedH1 + " — " + sentences.slice(0,2).join(". ").trim();

  const contextSignal = urlRaw.includes("harga") || urlRaw.includes("update") ? "NON-EVERGREEN"
    : evergreen.some(k => urlRaw.includes(k)) ? "EVERGREEN" : "SEMI-EVERGREEN";

  // ===== 🔟 Auto H2/H3 Builder based on H1 + Context (no big hard-coded list) =====
  // Heuristics: extract keywords from H1 & URL, map to small intent set, then build H2/H3 template dynamically.
  function extractIntentFromText(text) {
    const t = (text || "").toLowerCase();
    if (!t) return "general";
    const keywordsIntent = {
      harga: ["harga","price","biaya","cost"],
      panduan: ["panduan","tutorial","cara","langkah","how to"],
      manfaat: ["manfaat","keuntungan","benefit"],
      perbandingan: ["vs","perbandingan","beda","beda dengan","compare"],
      produk: ["produk","spesifikasi","spec","fitur"],
      jasa: ["jasa","layanan","service"],
      lokasi: ["lokasi","area","wilayah","kota","daerah"],
      berita: ["berita","update","terbaru","announce"]
    };
    for (const key in keywordsIntent) {
      if (keywordsIntent[key].some(k => t.includes(k))) return key;
    }
    return "general";
  }

  function buildStructureForIntent(intent, type, h1Text) {
    // build dynamic H2/H3 suggestions derived from H1 keywords and intent
    const words = (h1Text || "").replace(/[^\w\s]/g,'').split(/\s+/).filter(Boolean);
    const mainTopic = words.slice(0,3).join(" "); // small phrase
    const structure = [];

    const addSection = (h2, h3Arr) => structure.push({ h2, h3: h3Arr || [] });

    switch(intent) {
      case "harga":
        addSection(`Harga Terbaru ${mainTopic}`, [`Daftar Harga`, `Harga per Area`, `Periode & Catatan`]);
        addSection(`${mainTopic} — Faktor Harga`, [`Mutu / Spesifikasi`, `Volume & Pengiriman`]);
        addSection("Cara Order & Kontak", ["Proses Pemesanan", "Syarat & Ketentuan"]);
        break;
      case "panduan":
        addSection(`Pendahuluan: ${mainTopic}`, ["Definisi singkat", "Target pembaca"]);
        addSection("Langkah-langkah Lengkap", ["Persiapan", "Langkah 1", "Langkah 2", "Tips praktis"]);
        addSection("Kesalahan Umum & Solusi", ["Kesalahan 1", "Solusi"]);
        addSection("FAQ", ["Pertanyaan umum"]);
        break;
      case "manfaat":
        addSection(`Manfaat ${mainTopic}`, ["Manfaat utama", "Manfaat teknis", "Manfaat ekonomis"]);
        addSection("Contoh Penerapan", ["Kasus A", "Kasus B"]);
        break;
      case "perbandingan":
        addSection(`Perbandingan ${mainTopic}`, ["Opsi A vs Opsi B", "Kapan memilih masing-masing"]);
        addSection("Kesimpulan & Rekomendasi", ["Rekomendasi singkat"]);
        break;
      case "produk":
      case "jasa":
        addSection(`Spesifikasi & Fitur ${mainTopic}`, ["Spesifikasi utama", "Kelebihan"]);
        addSection("Harga & Cara Order", ["Harga dasar", "Proses pemesanan"]);
        addSection("Area Layanan / Pengiriman", ["Area 1", "Area 2"]);
        break;
      case "lokasi":
        addSection(`Wilayah Layanan ${mainTopic}`, ["Daftar kota/kabupaten", "Estimasi biaya pengiriman"]);
        addSection("Cara Order di Area Anda", ["Kontak lokal", "Form pemesanan"]);
        break;
      case "berita":
        addSection("Ringkasan Update", ["Apa yang berubah", "Dampak utama"]);
        addSection("Detail & Sumber", ["Sumber resmi", "Timeline"]);
        break;
      default:
        // general / fallback depends on content type
        if (type === "EVERGREEN") {
          addSection(`Pendahuluan: ${mainTopic}`, ["Definisi singkat", "Siapa yang butuh"]);
          addSection("Manfaat & Kegunaan", ["Manfaat utama"]);
          addSection("Langkah / Tutorial", ["Persiapan", "Langkah-langkah"]);
          addSection("FAQ", ["Pertanyaan umum"]);
        } else if (type === "SEMI-EVERGREEN") {
          addSection("Ringkasan & Tren", ["Apa yang berubah", "Data terbaru"]);
          addSection("Langkah / Cara", ["Langkah utama"]);
          addSection("Saran Praktis", ["Tips singkat"]);
        } else {
          addSection("Harga & Update Terkini", ["Daftar harga", "Periode"]);
          addSection("Ketersediaan", ["Area & Stok"]);
        }
    }
    return structure;
  }

  // Compose structure based on H1 and URL signals
  const intentFromH1 = extractIntentFromText(h1Text || urlRaw);
  const intentFromURL = extractIntentFromText(urlRaw);
  // prefer H1 intent if present, else URL
  const chosenIntent = intentFromH1 !== "general" ? intentFromH1 : intentFromURL;
  const generatedStructure = buildStructureForIntent(chosenIntent, type, h1Text || urlRaw);

  // ===== 1️⃣1️⃣ Dashboard =====
  let table = document.getElementById("AEDv98_dashboardTable");
  if (!table) {
    table = document.createElement("table");
    table.id = "AEDv98_dashboardTable";
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.marginTop = "20px";
    table.innerHTML = `
      <thead>
        <tr style="background:#dff0ff;">
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
    EVERGREEN: "H2: Pendahuluan, Manfaat, Tutorial, Contoh, FAQ",
    SEMI-EVERGREEN: "H2: Ringkasan/Tren, Langkah, Perbandingan, Saran Praktis",
    NON-EVERGREEN: "H2: Harga, Wilayah, Periode, Kontak"
  };
  const suggestion = `${structureAdvice[type]} — Update berikutnya: ${nextUpdateStr}`;

  // update or create row
  let existingRow = tbody.querySelector("tr[data-aed-page='"+pageTitle+"']");
  if (existingRow) existingRow.remove();
  const row = document.createElement("tr");
  row.setAttribute("data-aed-page", pageTitle);
  row.innerHTML = `
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

  // ===== 1️⃣2️⃣ Buttons logic (conditional) =====
  const actionsSpan = document.getElementById("aedActions");
  actionsSpan.innerHTML = "";

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

  const btnReport = createBtn("btnReport", "Download Laporan", "#f3f3f3");
  actionsSpan.appendChild(btnReport);
  btnReport.addEventListener("click", () => {
    const report = buildCorrectionText(true);
    downloadFile(`${(recommendedH1||pageTitle).replace(/\s+/g,"_")}_AED_Report.txt`, report);
    alert("✅ Laporan AED diunduh.");
  });

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
    generatedStructure.forEach(section => {
      lines.push(`- H2: ${section.h2}`);
      (section.h3 || []).forEach(h3 => lines.push(`    - H3: ${h3}`));
    });
    lines.push("");
    lines.push("=== Saran Perubahan Konten ===");
    if (needsCorrection) {
      if (h1Diff) lines.push("- Rekomendasi mengubah H1 agar sesuai nama/topik URL.");
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

    const h = document.createElement("h3");
    h.textContent = "Koreksi Konten Otomatis — Pratinjau";
    box.appendChild(h);

    const sum = document.createElement("div");
    sum.style.marginBottom = "10px";
    sum.innerHTML = `<b>Rekomendasi H1:</b> ${recommendedH1} <br><b>Meta:</b> ${metaDesc} <br><b>Tipe terdeteksi:</b> ${type} | <b>Context signal:</b> ${contextSignal}`;
    box.appendChild(sum);

    const structDiv = document.createElement("div");
    structDiv.style.marginBottom = "10px";
    structDiv.innerHTML = `<b>Struktur Heading (Preview):</b>`;
    generatedStructure.forEach(s => {
      const p = document.createElement("div");
      p.style.margin = "8px 0";
      p.innerHTML = `<b>H2:</b> ${s.h2}<br><small>H3: ${s.h3 ? s.h3.join(" • ") : "-"}</small>`;
      structDiv.appendChild(p);
    });
    box.appendChild(structDiv);

    const btnWrap = document.createElement("div");
    btnWrap.style.textAlign = "right";
    btnWrap.style.marginTop = "12px";

    const downloadBtn = createBtn("modalDownload", "Download Koreksi (TXT)");
    downloadBtn.style.marginRight = "8px";
    downloadBtn.addEventListener("click", () => {
      const content = buildCorrectionText(false);
      downloadFile(`${(recommendedH1||pageTitle).replace(/\s+/g,"_")}_Koreksi.txt`, content);
    });

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

    closeBtn.addEventListener("click", () => modal.remove());

    applyBtn.addEventListener("click", () => {
      try {
        applyCorrectionsToPage(generatedStructure);
        // update modified date & next update
        dateModifiedStr = new Date().toLocaleDateString("id-ID", options);
        // recalc nextUpdate from now
        const now = new Date();
        if (type === "EVERGREEN") now.setMonth(now.getMonth() + 12);
        else if (type === "SEMI-EVERGREEN") now.setMonth(now.getMonth() + 6);
        else now.setMonth(now.getMonth() + 3);
        nextUpdateStr = now.toLocaleDateString("id-ID", options);
        // update label & author display
        const label = document.querySelector("[data-aed-label]");
        if (label) label.innerHTML = `<b>${type}</b> — pembaruan berikutnya: <b>${nextUpdateStr}</b>`;
        const appendedSpan = document.querySelector(".aed-date-span");
        if (appendedSpan) appendedSpan.textContent = ` · Diperbarui: ${dateModifiedStr}`;
        // update meta last-modified-aed
        const modMeta = document.querySelector("meta[name='last-modified-aed']");
        const nowISO = new Date().toISOString();
        if (modMeta) modMeta.setAttribute("content", nowISO);
        else {
          const mm = document.createElement("meta");
          mm.name = "last-modified-aed";
          mm.content = nowISO;
          mm.setAttribute("data-nosnippet","true");
          document.head.appendChild(mm);
        }
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

    // ensure content container exists
    let contentContainer = elContent;
    if (!contentContainer) {
      contentContainer = document.createElement("div");
      contentContainer.className = "post-body";
      document.body.appendChild(contentContainer);
    }

    // 2) Append wrapper with new H2/H3 where missing (preserve existing internal links & HTML)
    const wrapperId = "aed-structure-wrapper";
    let wrapper = document.getElementById(wrapperId);
    if (!wrapper) {
      wrapper = document.createElement("section");
      wrapper.id = wrapperId;
      wrapper.style.borderTop = "1px dashed #ccc";
      wrapper.style.marginTop = "16px";
      wrapper.style.paddingTop = "12px";
      wrapper.setAttribute("data-nosnippet","true");
      contentContainer.appendChild(wrapper);
    }

    structureArray.forEach(sec => {
      const h2Text = sec.h2;
      const exists = [...document.querySelectorAll("h2")].some(h => h.innerText.trim().toLowerCase().includes(h2Text.toLowerCase()));
      if (!exists) {
        const h2 = document.createElement("h2");
        h2.innerText = h2Text;
        wrapper.appendChild(h2);
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
          const p = document.createElement("p");
          p.innerText = `[[Tambahkan konten untuk: ${h2Text}]]`;
          p.style.color = "#444";
          p.style.fontStyle = "italic";
          wrapper.appendChild(p);
        }
      }
    });

    // 3) Update or add meta description tag
    const metaTag = document.querySelector("meta[name='description']");
    if (metaTag) metaTag.setAttribute("content", metaDesc);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = metaDesc;
      document.head.appendChild(m);
    }

    // 4) Update modified meta and author date handled in apply flow
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
    AEDv98_generatedStructure: generatedStructure,
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
