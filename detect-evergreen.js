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

  //const now = new Date();

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

  function normalizeToMidnightUTC(date) {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString();
  }

  /* ---------- Grab content ---------- */
  const h1 = clean(document.querySelector("h1")?.innerText || "").toLowerCase();

  const contentEl =
    document.querySelector(".post-body.entry-content") ||
    document.querySelector("[id^='post-body-']") ||
    document.body;

  const contentText = clean(contentEl.innerText || "").toLowerCase();

  /* ---------- Section Extraction ---------- */
  const sections = [{
    title: h1 || "artikel",
    content: contentText
  }];

  // ======================================================
 // ======================================================
// 🔒 HARD LOCK TYPE (NO SCORING)
// ======================================================
const finalType = "non-evergreen"; // ⛔ FIXED
const validityDays = 180;          // ⛔ FIXED
const validityMs = validityDays * 86400000;

console.warn("🚨 HARD NON-EVERGREEN MODE AKTIF — TANPA KLASIFIKASI");

// ======================================================
// HELPERS
// ======================================================
function normalizeToMidnightUTC(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

const now = new Date();
const nowUTC = normalizeToMidnightUTC(now);

// ======================================================
// META INIT
// ======================================================
let metaDateModified = document.querySelector('meta[itemprop="dateModified"]');
let metaDatePublished = document.querySelector('meta[itemprop="datePublished"]');
let metaNextUpdates = Array.from(document.querySelectorAll('meta[name="nextUpdate"]'));
let metaNextUpdate1 = document.querySelector('meta[name="nextUpdate1"]');

// Pastikan metaDatePublished ada
const datePublished =
  metaDatePublished?.getAttribute("content") || nowUTC;

// ======================================================
// BASELINE nextUpdate1 (WAJIB, TAPI TIDAK MEMATIKAN SCRIPT)
// ======================================================
let nextUpdate1Val = normalizeToMidnightUTC(
  metaNextUpdate1?.getAttribute("content")
);

if (!nextUpdate1Val) {
  console.warn("⚠️ [AED] meta nextUpdate1 tidak valid → fallback ke today");
  nextUpdate1Val = nowUTC;
}

// ======================================================
// DETERMINE LAST nextUpdate
// ======================================================
let lastMeta = metaNextUpdates.length
  ? metaNextUpdates[metaNextUpdates.length - 1]
  : null;

let lastUpdateVal = normalizeToMidnightUTC(
  lastMeta?.getAttribute("content")
);

// Jika belum ada nextUpdate sama sekali → buat dari nextUpdate1
if (!lastUpdateVal) {
  const meta = document.createElement("meta");
  meta.setAttribute("name", "nextUpdate");
  meta.setAttribute("content", nextUpdate1Val);
  document.head.appendChild(meta);

  metaNextUpdates.push(meta);
  lastMeta = meta;
  lastUpdateVal = nextUpdate1Val;

  console.log("🆕 [AED] Meta nextUpdate pertama dibuat:", nextUpdate1Val);
}

// ======================================================
// LOOP PERPANJANGAN nextUpdate
// ======================================================
let nextUpdateDate = new Date(lastUpdateVal);

while (new Date(nowUTC) >= nextUpdateDate) {
  nextUpdateDate = new Date(nextUpdateDate.getTime() + validityMs);

  const iso = normalizeToMidnightUTC(nextUpdateDate);

  const meta = document.createElement("meta");
  meta.setAttribute("name", "nextUpdate");
  meta.setAttribute("content", iso);
  document.head.appendChild(meta);

  metaNextUpdates.push(meta);

  console.log("➕ [AED] nextUpdate ditambahkan:", iso);
}

let nextUpdate = normalizeToMidnightUTC(nextUpdateDate);
console.log("✅ [AED] Final nextUpdate aktif:", nextUpdate);

// ======================================================
// 🔄 SYNC dateModified ← nextUpdate
// ======================================================
try {
  if (validityMs > 0 && nextUpdate) {
    const expectedDateModified = normalizeToMidnightUTC(
      new Date(new Date(nextUpdate).getTime() - validityMs)
    );

    if (!metaDateModified) {
      metaDateModified = document.createElement("meta");
      metaDateModified.setAttribute("itemprop", "dateModified");
      document.head.appendChild(metaDateModified);
    }

    metaDateModified.setAttribute("content", expectedDateModified);
    console.log("🕒 [AED Sync] dateModified disinkronkan:", expectedDateModified);
  }
} catch (err) {
  console.error("❌ [AED Sync] Sinkronisasi gagal:", err);
}

// ======================================================
// 🔄 MAINTENANCE LOOP
// ======================================================
(function () {
  console.log("🔄 [AED Maintenance v9.6] Running...");

  if (finalType === "evergreen") return;

  const metaNextAll = document.querySelectorAll('meta[name="nextUpdate"]');
  if (!metaNextAll.length) return;

  const metaNext = metaNextAll[metaNextAll.length - 1];
  const stored = metaNext.getAttribute("content");
  if (!stored) return;

  const today = new Date();
  const nextDate = new Date(stored);

  if (today >= nextDate) {
    const diffDays = Math.floor((today - nextDate) / 86400000);
    console.warn(`⚠️ Konten melewati jadwal update (${diffDays} hari)`);

    const nextCycle = new Date(nextDate);
    nextCycle.setDate(nextCycle.getDate() + validityDays);

    const nextISO = normalizeToMidnightUTC(nextCycle);
    metaNext.setAttribute("content", nextISO);

    window.AEDMaintenance = {
      triggered: true,
      lastUpdate: stored,
      nextCycle: nextISO,
      daysCycle: validityDays
    };

    console.log("🔁 Siklus maintenance baru:", nextISO);
  }
})();


  // ---------- Pastikan meta benar di DOM ----------
  /*if (metaDateModified) {
    dateModified = normalizeToMidnightUTC(metaDateModified.getAttribute("content"));
  }*/

 
  // ---------- Reset hasil lama ----------
  delete window.EvergreenDetectorResults;
  delete window.AEDMetaDates;

  // ---------- Simpan hasil baru ----------
  window.EvergreenDetectorResults = {
    resultType: finalType,
    validityDays,
    dateModified,
    datePublished,
    nextUpdate,
    sections
  };

  window.AEDMetaDates = {
    dateModified,
    datePublished,
    nextUpdate: nextUpdate ? nextUpdate : null,
    type: finalType
  };


  console.log("✅ [AED] Hasil akhir disimpan:");
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
(function () {
  const isPage = location.pathname.includes("/p/");

  // ======================================================
  // 1. JIKA HALAMAN /p/ → LANGSUNG EVERGREEN (PAGE SERVICE)
  // ======================================================
  if (isPage) {
    window.__CONTENT_STATUS__ = "evergreen-page";
    console.log("🌿 [AED] Page /p/ terdeteksi — evergreen-page");
    return;
  }

  // ======================================================
  // 2. SELAIN /p/ → CEK META EVERGREEN
  // ======================================================
  const meta = document.querySelector('meta[name="content-freshness"]');

  // jika meta TIDAK ADA → NON-EVERGREEN
  if (!meta) {
    window.__CONTENT_STATUS__ = "non-evergreen";
    console.log("⚠️ [AED] Non-/p/ tanpa meta — NON-EVERGREEN");
    return;
  }

  // normalisasi nilai meta
  const status = meta.getAttribute("content")?.toLowerCase();

  // jika meta evergreen → lanjut evergreen
  if (status === "evergreen" || status === "evergreen-lock") {
    window.__CONTENT_STATUS__ = "evergreen";
    console.log("🌿 [AED] Non-/p/ dengan meta evergreen");
    return;
  }

  // selain itu → NON
  window.__CONTENT_STATUS__ = "non-evergreen";
  console.log(`⚠️ [AED] Non-/p/ status ${status} — NON-EVERGREEN`);

  // optional hooks
  if (typeof detectEvergreen === "function") {
    detectEvergreen();
  }

  if (typeof updateArticleDates === "function") {
    updateArticleDates();
  }
})();



