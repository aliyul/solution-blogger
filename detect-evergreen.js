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
// 🔒 HARD PAGE GUARD — NON-/p/ = NON-EVERGREEN (ABSOLUTE)
// ======================================================
if (!location.pathname.includes("/p/")) {
  console.log("🚫 [AED HARD GUARD] NON-/p/ terdeteksi → paksa NON-EVERGREEN");

  window.__CONTENT_STATUS__ = "non-evergreen";

  // Simpan hasil FINAL tanpa analisis konten
  window.EvergreenDetectorResults = {
    resultType: "non-evergreen",
    validityDays: 180,
    dateModified: null,
    datePublished: null,
    nextUpdate: null,
    sections: []
  };

  window.AEDMetaDates = {
    type: "non-evergreen",
    dateModified: null,
    datePublished: null,
    nextUpdate: null
  };

  // ⛔ STOP TOTAL — jangan lanjut ke scoring, pattern, atau guard evergreen
  return;
}
  // jika lanjut ke scoring, pattern, atau guard evergreen, tapi saya ga mau 
 //karna khawatir salah dan bikin sulit update nya karna ga serragam status eveergreen nya
  console.log("🧩 Running detectEvergreen() v8.6.9 Stable — Hybrid Logic + Meta Sync + Blogspot Safe...");
  window.detectEvergreenReady = false;
  const now = new Date();
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
    const hours = pad(tzOffset / 60);
    const minutes = pad(tzOffset % 60);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${diff}${hours}:${minutes}`;
  };
  const nowLocalISO = formatLocalISO(now);

  // ---------- Grab content ----------
  const h1El = document.querySelector("h1");
  const h1 = clean(h1El?.innerText || "").toLowerCase();
  const contentEl =
    document.querySelector(".post-body.entry-content") ||
    document.querySelector("[id^='post-body-']") ||
    document.querySelector("article") ||
    document.querySelector("main") ||
    document.body;
  const cleanText = el => clean(el?.innerText || "");
  const contentTextRaw = cleanText(contentEl);
  const contentText = (h1 + " " + contentTextRaw).toLowerCase();

  // ---------- Patterns ----------
  const evergreenPattern = /\b(panduan|tutorial|tips|cara|definisi|jenis|fungsi|spesifikasi|apa itu|perbedaan|metode|manfaat|keunggulan)\b/;
  const semiEvergreenPattern = /\b(harga|sewa|rental|kontraktor|jasa|biaya|tarif|borongan)\b/;
  const nonEvergreenPattern = /\b(update|terbaru|berita|promo|jadwal|event|bulan\s?\d{4}|tahun\s?\d{4}|sementara|musiman|stok|laporan|penawaran|info pasar)\b/;
  const priceTokenPattern = /\b(harga|rp|per\s?(m3|m2|unit|kubik|meter)|biaya|tarif)\b/i;

  // ---------- Section Extraction ----------
  const sections = [];
  const headings = Array.from(contentEl.querySelectorAll("h2,h3"));
  if (headings.length === 0) {
    sections.push({ title: h1 || "artikel", content: contentTextRaw });
  } else {
    for (const head of headings) {
      const title = cleanText(head);
      let cur = head.nextElementSibling, body = "";
      while (cur && !(cur.matches && cur.matches("h2,h3"))) {
        if (cur.innerText && !cur.matches("script,style,nav,footer,header,aside,form,iframe,[role='banner'],[role='complementary']")) 
          body += "\n" + cleanText(cur);
        cur = cur.nextElementSibling;
      }
      if (title && body.trim().length > 30) sections.push({ title, content: body });
    }
  }

  // ---------- Section Scoring ----------
 /*
  let totalScores = { evergreen: 0, semi: 0, non: 0 };
  sections.forEach(sec => {
    const t = sec.title.toLowerCase(), b = sec.content.toLowerCase();
    let sEver = 0, sSemi = 0, sNon = 0;
    if (evergreenPattern.test(t)) sEver += 2;
    if (semiEvergreenPattern.test(t)) sSemi += 2;
    if (nonEvergreenPattern.test(t)) sNon += 1.5;
    sEver += (b.match(evergreenPattern) || []).length * 0.8;
    sSemi += (b.match(semiEvergreenPattern) || []).length * 0.9;
    sNon += (b.match(nonEvergreenPattern) || []).length * 1.0;
    if (priceTokenPattern.test(t + " " + b)) sSemi += 1.5;
    totalScores.evergreen += sEver;
    totalScores.semi += sSemi;
    totalScores.non += sNon;
  });

  const hasTimePattern = /\b(20\d{2}|bulan|minggu|hari\s?ini|promo|update)\b/.test(contentText);
  let finalType =
    totalScores.non > totalScores.semi && totalScores.non > totalScores.evergreen ? "non-evergreen" :
    totalScores.evergreen > totalScores.semi + 2 && !hasTimePattern ? "evergreen" :
    "semi-evergreen";
  if (/\bharga|sewa|rental|kontraktor|jasa|biaya|tarif|borongan\b/i.test(h1 + contentText) && finalType === "non-evergreen") 
    finalType = "semi-evergreen";

  const validityDays = { "evergreen": 0, "semi-evergreen":  365, "non-evergreen": 180 }[finalType];
 */
// ---------- Section Scoring (Revised) ----------
// ---------- Section Scoring (Neutral & Evidence-based) ----------
// ---------- Evidence-based Scoring ----------
// ======================================================
// SEO-CORRECT CONTENT FRESHNESS CLASSIFIER (FINAL)
// ======================================================
// ======================================================
// SEO-CORRECT CONTENT FRESHNESS CLASSIFIER (FINAL REVISION)
// ======================================================

// ---------- Evidence-based Scoring ----------
// ======================================================
// SEO-CORRECT CONTENT FRESHNESS CLASSIFIER (FINAL — FIXED)
// ======================================================

// ---------- Evidence-based Scoring ----------
let scores = {
  evergreen: { score: 0, evidence: 0 },
  semi: { score: 0, evidence: 0 },
  non: { score: 0, evidence: 0 }
};

sections.forEach(sec => {
  const t = sec.title.toLowerCase();
  const b = sec.content.toLowerCase();

  // ---------- TITLE (High-confidence signals) ----------

  // Evergreen title signals (definition, guide, function)
  if (evergreenPattern.test(t)) {
    scores.evergreen.score += 3;
    scores.evergreen.evidence++;
  }

  // Semi-evergreen title signals (harga, spesifikasi, ukuran)
  if (semiEvergreenPattern.test(t)) {
    scores.semi.score += 3;
    scores.semi.evidence++;
  }

  // Non-evergreen ONLY if explicit time-bound
  // (year, promo, periode terbatas)
  if (nonEvergreenPattern.test(t)) {
    scores.non.score += 3;
    scores.non.evidence++;
  }

  // ---------- BODY (Medium-confidence, capped) ----------

  const everHits = (b.match(evergreenPattern) || []).length;
  const semiHits = (b.match(semiEvergreenPattern) || []).length;
  const nonHits  = (b.match(nonEvergreenPattern) || []).length;

  if (everHits) {
    scores.evergreen.score += Math.min(everHits, 3) * 0.5;
    scores.evergreen.evidence += Math.min(everHits, 2);
  }

  if (semiHits) {
    scores.semi.score += Math.min(semiHits, 3) * 0.7;
    scores.semi.evidence += Math.min(semiHits, 2);
  }

  // Non-evergreen body VERY limited
  if (nonHits) {
    scores.non.score += Math.min(nonHits, 2) * 0.8;
    scores.non.evidence += Math.min(nonHits, 1);
  }
});

// ======================================================
// TIME SIGNALS (SEO-CORRECT)
// ======================================================

// HARD TIME = TRUE non-evergreen anchors
const hardTimePattern =
  /\b(20\d{2}|promo|diskon|periode\s?terbatas)\b/i;

// SOFT TIME = editorial freshness ONLY
// (never makes content non-evergreen)
const softTimePattern =
  /\b(update|terbaru|tahun\s?ini|saat\s?ini)\b/i;

const hasHardTime = hardTimePattern.test(contentText);
const hasSoftTime = softTimePattern.test(contentText);

// ======================================================
// COMMERCIAL SIGNAL (SEO-SAFE)
// ======================================================

// Commercial intent is NORMAL for evergreen
const hasCommercial = priceTokenPattern.test(h1 + " " + contentText);

// Commercial strengthens SEMI only (never hurts evergreen)
if (hasCommercial) {
  scores.semi.score += 2;
  scores.semi.evidence++;
}

// HARD TIME strengthens NON (required anchor)
if (hasHardTime) {
  scores.non.score += 2;
  scores.non.evidence += 2;
}

// ======================================================
// NORMALIZATION
// ======================================================

function confidence(s) {
  return Math.min(1, s.score / 8);
}

const conf = {
  evergreen: confidence(scores.evergreen),
  semi: confidence(scores.semi),
  non: confidence(scores.non)
};

// ======================================================
// DECISION LOGIC (SEO-NATURAL, EVERGREEN PRIORITY)
// ======================================================

let finalType = "unknown";

const MIN_EVIDENCE = 2;
const MIN_CONFIDENCE = 0.5;

// 1️⃣ HARD RULE: non-evergreen only if hard time exists
if (hasHardTime && conf.non >= MIN_CONFIDENCE) {
  finalType = "non-evergreen";
}
else {
  // 2️⃣ EVERGREEN PRIORITY RULE
  // Evergreen wins if:
  // - confidence decent
  // - evidence enough
  // - not clearly beaten by semi
  if (
    conf.evergreen >= 0.5 &&
    scores.evergreen.evidence >= MIN_EVIDENCE &&
    conf.evergreen >= conf.semi - 0.1
  ) {
    finalType = "evergreen";
  }
  // 3️⃣ Semi-evergreen fallback
  else if (
    conf.semi >= MIN_CONFIDENCE &&
    scores.semi.evidence >= MIN_EVIDENCE
  ) {
    finalType = "semi-evergreen";
  }
}

// ======================================================
// VALIDITY DAYS (SEO MAINTENANCE)
// ======================================================

const validityDays = {
  "evergreen": 0,            // no expiration
  "semi-evergreen": 365,     // annual review
  "non-evergreen": 180,       // short-lived
  "unknown": null
}[finalType];

// ======================================================
// OPTIONAL DEBUG (RECOMMENDED)
// ======================================================
/*
console.table({
  scores,
  confidence: conf,
  hasHardTime,
  hasSoftTime,
  hasCommercial,
  finalType,
  validityDays
});
*/


console.table({
  scores,
  confidence: conf,
  hasHardTime,
  hasSoftTime,
  hasCommercial,
  finalType,
  validityDays
});

// ======================================================
// 🔒 EVERGREEN HARD GUARD v10 (NO STRUCTURE CHANGE)
// ======================================================
if (finalType === "evergreen") {
  console.log("🌿 [AED v10] Evergreen detected — lock all date updates.");

  // ❌ Hapus SEMUA nextUpdate (evergreen tidak boleh punya ini)
  document.querySelectorAll('meta[name="nextUpdate"]').forEach(m => m.remove());

  // Ambil dateModified asli jika ada (JANGAN ubah)
  const metaDM = document.querySelector('meta[itemprop="dateModified"]');
  dateModified = metaDM ? normalizeToMidnightUTC(metaDM.getAttribute("content")) : null;

  const metaDP = document.querySelector('meta[itemprop="datePublished"]');
  datePublished = metaDP ? metaDP.getAttribute("content") : null;

  // Simpan hasil & STOP total eksekusi tanggal
  window.EvergreenDetectorResults = {
    resultType: "evergreen",
    validityDays: 0,
    dateModified,
    datePublished,
    nextUpdate: null,
    sections
  };

  window.AEDMetaDates = {
    type: "evergreen",
    dateModified,
    datePublished,
    nextUpdate: null
  };

  console.log("✅ [AED v10] Evergreen locked. No freshness manipulation.");
  return; // ⛔ STOP DI SINI
}


function normalizeToMidnightUTC(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

// ---------- Meta ----------
let metaDateModified = document.querySelector('meta[itemprop="dateModified"]');
let metaDatePublished = document.querySelector('meta[itemprop="datePublished"]');
let metaNextUpdates = Array.from(document.querySelectorAll('meta[name="nextUpdate"]'));
const metaNextUpdate1 = document.querySelector('meta[name="nextUpdate1"]');

//const now = new Date();
const nowUTC = normalizeToMidnightUTC(now);
const validityMs = validityDays * 86400000;

let dateModified = normalizeToMidnightUTC(metaDateModified?.getAttribute("content"));
const datePublished = metaDatePublished?.getAttribute("content") || nowUTC;

// Ambil nilai awal dari nextUpdate1 (harus selalu ada sebagai baseline)
let nextUpdate1Val = metaNextUpdate1 ? normalizeToMidnightUTC(metaNextUpdate1.getAttribute("content")) : null;
let nextUpdate;

nextUpdate = nextUpdate1Val;

console.log("🆕 [AED] Meta nextUpdate:", nextUpdate);

// Pastikan metaNextUpdate1 ada
if (!metaNextUpdate1 || !nextUpdate1Val) {
  console.warn("⚠️ [AED] Meta nextUpdate1 tidak ditemukan atau tidak valid!");
  return;
}

// Cek meta nextUpdate terakhir yang sudah ada
let lastMeta = metaNextUpdates.length ? metaNextUpdates[metaNextUpdates.length - 1] : null;
let lastUpdateVal = lastMeta ? normalizeToMidnightUTC(lastMeta.getAttribute("content")) : null;

// Jika belum ada meta nextUpdate sama sekali, buat pertama dari nextUpdate1
if (!lastMeta) {
  const meta = document.createElement("meta");
  meta.setAttribute("name", "nextUpdate");
  meta.setAttribute("content", nextUpdate1Val);
  document.head.appendChild(meta);
  metaNextUpdates.push(meta);
  lastMeta = meta;
  lastUpdateVal = nextUpdate1Val;
  console.log("🆕 [AED] Meta nextUpdate pertama dibuat dari nextUpdate1:", nextUpdate1Val);
}

let nextUpdateDate = new Date(lastUpdateVal);
nextUpdate = nextUpdateDate;


// Jika sekarang belum sampai ke nextUpdate1
if (new Date(nowUTC) < new Date(nextUpdate1Val)) {
  console.log("⏳ [AED] Belum mencapai nextUpdate1, gunakan:", nextUpdate1Val);
  nextUpdate = nextUpdate1Val;
} else {
  // Sudah sampai atau lewat nextUpdate1 — buat siklus baru
  console.log("🔄 [AED] Sudah mencapai/lewati nextUpdate1, mulai loop perpanjangan...");

  // Loop sampai nextUpdate baru benar-benar di masa depan
  while (validityMs > 0 && new Date(nowUTC) >= nextUpdateDate) {
    const next = new Date(nextUpdateDate.getTime() + validityMs);
    const iso = normalizeToMidnightUTC(next.toISOString());

    const newMeta = document.createElement("meta");
    newMeta.setAttribute("name", "nextUpdate");
    newMeta.setAttribute("content", iso);
    document.head.appendChild(newMeta);

    metaNextUpdates.push(newMeta);
    nextUpdateDate = next;

    console.log("➕ [AED] Meta nextUpdate baru ditambahkan:", iso);
  }
 // Ambil nextUpdate terakhir (paling baru)
const finalNextUpdate = normalizeToMidnightUTC(nextUpdateDate.toISOString());
nextUpdate = finalNextUpdate;
}


console.log("✅ [AED] Final nextUpdate aktif:", nextUpdate);

// ---------- Sinkronisasi dateModified ----------
try {
  if (validityMs > 0 && nextUpdate) {
  const expectedDateModified = new Date(new Date(nextUpdate).getTime() - validityMs);
  const expectedISO = normalizeToMidnightUTC(expectedDateModified.toISOString());

  if (dateModified !== expectedISO) {
    dateModified = expectedISO;
    if (!metaDateModified) {
      metaDateModified = document.createElement("meta");
      metaDateModified.setAttribute("itemprop", "dateModified");
      document.head.appendChild(metaDateModified);
    }
    metaDateModified.setAttribute("content", expectedISO);
    dateModified = expectedISO;
    console.log("🕒 [AED Sync] dateModified disinkronkan:", expectedISO);
  } else {
    console.log("✅ [AED Sync] dateModified sudah sinkron:", expectedISO);
  }
}
} catch (err) {
  console.error("❌ [AED Sync] Sinkronisasi gagal:", err);
}

(function() {
  console.log("🔄 [AED Maintenance v9.5] Running maintenance cycle check...");
  if (finalType === "evergreen") {
  console.log("🌿 [AED v10] Skip maintenance — evergreen content.");
  return;
}

  //const validityDaysFinal = typeof validityDays !== "undefined" ? validityDays : 180; // fallback 180 hari
 function getValidityDays(contentType) {
  switch (contentType) {
    case "evergreen":
      return 0;
    case "semi-evergreen":
      return 365;
    case "non-evergreen":
      return 180;
    default:
      return 0;
  }
}

const validityDaysFinal =
  typeof validityDays !== "undefined"
    ? validityDays
    : getValidityDays(contentType);

  const metaNextAll = document.querySelectorAll('meta[name="nextUpdate"]');

  if (!metaNextAll.length) {
    console.warn("⏳ Tidak ada meta[name='nextUpdate'], abaikan loop.");
    return;
  }

  // 🔍 Ambil meta terakhir (yang paling baru)
  const metaNext = metaNextAll[metaNextAll.length - 1];
  const storedNextUpdateStr = metaNext.getAttribute("content");
  if (!storedNextUpdateStr) {
    console.warn("❌ nextUpdate kosong, tidak bisa looping.");
    return;
  }

  const today = new Date();
  const nextUpdateDate = new Date(storedNextUpdateStr);
  const diffDays = Math.floor((today - nextUpdateDate) / (1000 * 60 * 60 * 24));

  // === Jika sudah waktunya update ===
  if (today >= nextUpdateDate) {
    console.warn(`⚠️ Konten melewati jadwal update! (${diffDays} hari lewat)`);

    // 🟡 Peringatan visual ringan
    const warnBox = document.createElement("div");
    warnBox.setAttribute("data-nosnippet", "true");
    warnBox.setAttribute("aria-hidden", "true");
    warnBox.style = `
      position:fixed;bottom:15px;right:15px;z-index:999999;
      background:#fff3cd;color:#856404;border:1px solid #ffeeba;
      padding:10px 16px;border-radius:12px;font-family:sans-serif;
      box-shadow:0 2px 8px rgba(0,0,0,0.2);
      pointer-events:none;user-select:none;
    `;
    warnBox.innerHTML = `
      ⚠️ <b>Waktu Update Telah Tiba!</b><br>
      Segera lakukan pembaruan konten agar tetap relevan.<br>
      <small>Next Update Lama: ${nextUpdateDate.toISOString().split("T")[0]}</small>
    `;
    document.body.appendChild(warnBox);

    // 🗓️ Hitung next update berikutnya
    const nextNextUpdate = new Date(nextUpdateDate);
    nextNextUpdate.setDate(nextNextUpdate.getDate() + validityDaysFinal);

    // 🔁 Update meta terakhir
    metaNext.setAttribute("content", nextNextUpdate.toISOString().split("T")[0]);
    console.log(`[SchemaMaintenance] Siklus baru dibuat → ${nextNextUpdate.toISOString().split("T")[0]}`);

    // 🚨 Flag global
    window.AEDMaintenance = {
      triggered: true,
      lastUpdate: nextUpdateDate.toISOString().split("T")[0],
      nextCycle: nextNextUpdate.toISOString().split("T")[0],
      daysCycle: validityDaysFinal
    };
  } else {
    const remaining = Math.ceil((nextUpdateDate - today) / (1000 * 60 * 60 * 24));
    console.log(`✅ Konten masih valid (${remaining} hari tersisa hingga next update).`);
  }

  // =========================================================
  // === Update internal timestamp hanya jika konten berubah ===
  // =========================================================
  if (typeof timeAllowed !== "undefined" && typeof contentChanged !== "undefined") {
    if (timeAllowed && contentChanged) {
      console.log("🔁 [AED] Konten berubah, update internal timestamp.");

      // Simpan hash baru
      if (typeof keyHash !== "undefined" && typeof currentHash !== "undefined") {
        localStorage.setItem(keyHash, currentHash);
      }

      // Jadikan nextUpdate lama sebagai dateModified baru
      dateModified = normalizeToMidnightUTC(new Date(storedNextUpdateStr));

      // Hitung next update berikutnya dari nextUpdate lama
      nextUpdate = normalizeToMidnightUTC(
        new Date(new Date(storedNextUpdateStr).getTime() + validityDaysFinal * 86400000)
      );

      // 🧩 Tambahkan schema maintenance ringan
      const schemaData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "isMaintained": true,
        "maintenanceSchedule": {
          "@type": "Schedule",
          "repeatFrequency": `P${validityDaysFinal}D`,
          "scheduledTime": nextUpdate.toISOString().split("T")[0]
        },
        "dateModified": dateModified.toISOString().split("T")[0]
      };

      const oldSchema = document.querySelector('script[data-schema="evergreen-maintenance"]');
      if (oldSchema) oldSchema.remove();

      const schemaEl = document.createElement("script");
      schemaEl.type = "application/ld+json";
      schemaEl.dataset.schema = "evergreen-maintenance";
      schemaEl.textContent = JSON.stringify(schemaData, null, 2);
      document.head.appendChild(schemaEl);

      console.log(`🗓️ [AED] Konten diperbarui.
      dateModified: ${dateModified.toISOString().split("T")[0]}
      nextUpdate: ${nextUpdate.toISOString().split("T")[0]}
      `);
    }
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


