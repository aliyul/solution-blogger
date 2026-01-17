// === Global date variable ===
let datePublished = '';
let dateModified = '';

/* ============================================================
 🧠 Smart Evergreen Detector v8.6.2 Hybrid Modular
 Fitur:
 - Analisis konten, harga, produk, dan stabilitas
 - Tidak menimpa dateModified/datePublished asli
 - Auto nextUpdate & PriceValidUntil
 - Dashboard responsif modular (terpisah)
============================================================ */
/* ===========================================================
   🧩 Auto Evergreen Detector v8.6.5F — Stable Final
   Fix: duplicate definitions removed, stable execution
   =========================================================== */
function detectEvergreen() {
  // ======================================================
  // 🔒 HARD PAGE GUARD v2 — NON-EVERGREEN ONLY (CONSTANT TYPE)
  // ======================================================

  console.log("🧩 Running detectEvergreen() v8.6.9 Stable — HARD NON-EVERGREEN MODE");
  window.detectEvergreenReady = false;

  const now = new Date();

  /* ---------- Helpers ---------- */
  const clean = s => (s ? s.replace(/\s+/g, " ").trim() : "");

  const hashString = s => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return (h >>> 0).toString(36);
  };

  const formatLocalISO = date => {
    const tzOffset = -date.getTimezoneOffset();
    const diff = tzOffset >= 0 ? "+" : "-";
    const pad = n => String(Math.floor(Math.abs(n))).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${diff}${pad(tzOffset/60)}:${pad(tzOffset%60)}`;
  };

  /* ---------- Grab content ---------- */
  const h1 = clean(document.querySelector("h1")?.innerText || "").toLowerCase();

  const contentEl =
    document.querySelector(".post-body.entry-content") ||
    document.querySelector("[id^='post-body-']") ||
    document.body;

  const contentText = clean(contentEl.innerText || "").toLowerCase();

  /* ---------- Section Extraction (DIBIARKAN UTUH) ---------- */
  const sections = [];
  sections.push({
    title: h1 || "artikel",
    content: contentText
  });

  // ======================================================
  // 🔒 HARD LOCK TYPE (TANPA SCORING)
  // ======================================================
  const finalType = "non-evergreen";   // ⛔ DIKUNCI
  const validityDays = 180;            // ⛔ KONSTAN

  console.warn("🚨 HARD NON-EVERGREEN MODE AKTIF — TANPA KLASIFIKASI");

  // ======================================================
  // META & DATE LOGIC (TIDAK DIUBAH)
  // ======================================================
  function normalizeToMidnightUTC(date) {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString();
  }

  let metaDateModified = document.querySelector('meta[itemprop="dateModified"]');
  let metaDatePublished = document.querySelector('meta[itemprop="datePublished"]');
  let metaNextUpdates = Array.from(document.querySelectorAll('meta[name="nextUpdate"]'));
  const metaNextUpdate1 = document.querySelector('meta[name="nextUpdate1"]');

  const nowUTC = normalizeToMidnightUTC(now);
  const validityMs = validityDays * 86400000;

  const datePublished =
    metaDatePublished?.getAttribute("content") || nowUTC;

  let nextUpdate1Val =
    metaNextUpdate1?.getAttribute("content") || nowUTC;

  nextUpdate1Val = normalizeToMidnightUTC(nextUpdate1Val);

  let nextUpdateDate = new Date(nextUpdate1Val);

  while (new Date(nowUTC) >= nextUpdateDate) {
    nextUpdateDate = new Date(nextUpdateDate.getTime() + validityMs);
  }

  const nextUpdate = normalizeToMidnightUTC(nextUpdateDate);

  /* ---------- dateModified ---------- */
  const expectedDateModified = normalizeToMidnightUTC(
    new Date(new Date(nextUpdate).getTime() - validityMs)
  );

  if (!metaDateModified) {
    metaDateModified = document.createElement("meta");
    metaDateModified.setAttribute("itemprop", "dateModified");
    document.head.appendChild(metaDateModified);
  }
  metaDateModified.setAttribute("content", expectedDateModified);

  // ======================================================
  // MAINTENANCE LOOP (TIDAK DIUBAH)
  // ======================================================
  (function () {
    console.log("🔄 [AED Maintenance] Running...");
    if (finalType === "evergreen") return;

    const metaNextAll = document.querySelectorAll('meta[name="nextUpdate"]');
    if (!metaNextAll.length) return;

    const metaNext = metaNextAll[metaNextAll.length - 1];
    const stored = metaNext.getAttribute("content");
    if (!stored) return;

    const today = new Date();
    const nextDate = new Date(stored);

    if (today >= nextDate) {
      const nextCycle = new Date(nextDate);
      nextCycle.setDate(nextCycle.getDate() + validityDays);
      metaNext.setAttribute(
        "content",
        normalizeToMidnightUTC(nextCycle)
      );
    }
  })();

  // ======================================================
  // SIMPAN HASIL (KOMPATIBEL SCRIPT LAMA)
  // ======================================================
  delete window.EvergreenDetectorResults;
  delete window.AEDMetaDates;

  window.EvergreenDetectorResults = {
    resultType: finalType,
    validityDays,
    dateModified: expectedDateModified,
    datePublished,
    nextUpdate,
    sections
  };

  window.AEDMetaDates = {
    type: finalType,
    dateModified: expectedDateModified,
    datePublished,
    nextUpdate
  };

  window.detectEvergreenReady = true;

  console.log("✅ HARD NON-EVERGREEN RESULT:");
  console.log(window.AEDMetaDates);
}

function updateArticleDates() {
  // 🧹 --- Hapus elemen label & tanggal lama ---
  document.getElementById("evergreen-label")?.remove();
  document.querySelectorAll(".aed-date-span, .aed-non-evergreen-date").forEach(el => el.remove());

  // 🧩 --- Ambil data meta langsung dari DOM ---
 const metaDatePublished = document.querySelector('meta[itemprop="datePublished"]');
 const metaDateModified = document.querySelector('meta[itemprop="dateModified"]');
  const metaNextUpdate = document.querySelector('meta[name="nextUpdate"]');
  const metaType = document.querySelector('meta[itemprop="evergreenType"]'); // optional

  if (!metaDateModified || !metaNextUpdate) {
    console.warn("⚠️ Meta dateModified atau nextUpdate tidak ditemukan");
    return;
  }
 
  let datePublishedStr = metaDatePublished.getAttribute("content");
  let dateModifiedStr = metaDateModified.getAttribute("content");
  let nextUpdateStr = metaNextUpdate.getAttribute("content");
  let type = metaType ? metaType.getAttribute("content") : "semi-evergreen";

  
  // 💡 Jika window.AEDMetaDates sudah ada, prioritaskan nilai terbarunya
  if (window.AEDMetaDates) {
    const d = window.AEDMetaDates;
    if (d.datePublished) datePublishedStr = d.datePublished;
    if (d.dateModified) dateModifiedStr = d.dateModified;
    if (d.nextUpdate) nextUpdateStr = d.nextUpdate;
    if (d.type) type = d.type;
  }

  // 🔄 Simpan ulang ke global
  window.AEDMetaDates = { datePublished: datePublishedStr, dateModified: dateModifiedStr, nextUpdate: nextUpdateStr, type };

  console.log("🧩 updateArticleDates() loaded:", window.AEDMetaDates);

  // === Format tanggal ===
  function formatTanggalNormal(dateString) {
    try {
      const date = new Date(dateString);
      const options = { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Jakarta" };
      return date.toLocaleDateString("id-ID", options);
    } catch (e) {
      return dateString;
    }
  }

  const nextUpdateHuman = formatTanggalNormal(nextUpdateStr);
  const dateModifiedHuman = formatTanggalNormal(dateModifiedStr);

  // === Cari elemen H1 ===
  const elH1 = document.querySelector("h1, .post-title, .page-title");
  if (!elH1) return console.warn("⚠️ Tidak menemukan H1");

  // === Label status ===
  const lb = document.createElement("div");
  lb.id = "evergreen-label";
  lb.style.cssText = "font-size:.9em;margin-bottom:8px;color:#333;";
  lb.setAttribute("data-nosnippet", "true");

  if (type === "evergreen") {
    lb.innerHTML = `<b>EVERGREEN</b> — pembaruan berikutnya: <b>${nextUpdateHuman}</b>`;
    document.body.setAttribute("data-force", "evergreen");
  } else if (type === "semi-evergreen") {
    lb.innerHTML = `<b>SEMI-EVERGREEN</b> — disarankan update: <b>${nextUpdateHuman}</b>`;
    document.body.setAttribute("data-force", "semi-evergreen");
  } else {
    lb.innerHTML = `<b>NON-EVERGREEN</b> — disarankan update: <b>${nextUpdateHuman}</b>`;
    document.body.setAttribute("data-force", "non-evergreen");
  }

  elH1.insertAdjacentElement("afterend", lb);

  // === Tampilkan tanggal di bawah author ===
  const authorEl = document.querySelector(".post-author .fn");
  if (authorEl && type !== "evergreen") {
    const dateEl = document.createElement("span");
    dateEl.className = "aed-date-span";
    dateEl.textContent = ` · Diperbarui: ${dateModifiedHuman}`;
    dateEl.style.fontSize = "0.85em";
    dateEl.style.color = "#555";
    authorEl.appendChild(dateEl);
  }

  window.detectEvergreenReady = true;
  console.log("✅ [AED] updateArticleDates() selesai dijalankan");
}
// === Evergreen Meta Guard: /p/ = EVERGREEN PAGE ===
(function () {
  const isPage = location.pathname.includes("/p/");

  // 1. Jika halaman /p/ → inject meta evergreen
  if (isPage) {
    let meta = document.querySelector('meta[name="evergreen"]');

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "evergreen");
      meta.setAttribute("content", "true");
      document.head.appendChild(meta);
      console.log("🌿 [AED] Meta evergreen ditambahkan untuk halaman /p/");
    } else {
      console.log("🌿 [AED] Meta evergreen sudah ada (page /p/)");
    }

    // Tandai status global
    window.__CONTENT_STATUS__ = "evergreen-page";
    return;
  }

  // 2. Selain /p/ → NON-EVERGREEN
  window.__CONTENT_STATUS__ = "non-evergreen";
  console.log("⚠️ [AED] NON-/p/ terdeteksi — status NON-EVERGREEN");

  if (typeof detectEvergreen === "function") {
    detectEvergreen();
  }

  if (typeof updateArticleDates === "function") {
    updateArticleDates();
  }
})();


