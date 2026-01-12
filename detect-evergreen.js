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

  const validityDays = { evergreen: 365, "semi-evergreen": 180, "non-evergreen": 90 }[finalType];

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
  while (new Date(nowUTC) >= nextUpdateDate) {
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
} catch (err) {
  console.error("❌ [AED Sync] Sinkronisasi gagal:", err);
}

(function() {
  console.log("🔄 [AED Maintenance v9.5] Running maintenance cycle check...");

  //const validityDaysFinal = typeof validityDays !== "undefined" ? validityDays : 180; // fallback 180 hari
 function getValidityDays(contentType) {
  switch (contentType) {
    case "evergreen":
      return 0;
    case "semi-evergreen":
      return 365;
    case "non-evergreen":
      return 90;
    default:
      return 180;
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

detectEvergreen();

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

updateArticleDates();
