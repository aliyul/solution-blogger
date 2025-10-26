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
  if (!date) return null; // ❗ lewati jika tidak ada nilai
  const d = new Date(date);
  if (isNaN(d.getTime())) return null; // ❗ lewati jika invalid date
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

/*function normalizeDateISO(date) {
  if (!date) return null;
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d.toISOString();
}*/

  // ---------- Meta ----------
  let metaDateModified = document.querySelector('meta[itemprop="dateModified"]');
  let metaDatePublished = document.querySelector('meta[itemprop="datePublished"]');
  let metaNextUpdate = document.querySelector('meta[name="nextUpdate"]');
  const metaNextUpdate1 =  document.querySelector('meta[name="nextUpdate1"]');

  let dateModified = normalizeToMidnightUTC(metaDateModified?.getAttribute("content"));
  const datePublished = metaDatePublished?.getAttribute("content") || nowLocalISO;

  // ---------- Cek Override nextUpdate1 ----------
  if (metaNextUpdate1 && metaNextUpdate1.getAttribute("content")) {
    const nextUpdate1Val = normalizeToMidnightUTC(metaNextUpdate1.getAttribute("content"));
    if (metaNextUpdate) metaNextUpdate.setAttribute("content", nextUpdate1Val);
    else {
      metaNextUpdate = document.createElement("meta");
      metaNextUpdate.setAttribute("name", "nextUpdate");
      metaNextUpdate.setAttribute("content", nextUpdate1Val);
      document.head.appendChild(metaNextUpdate);
    }
    console.log("✅ [AED] nextUpdate diambil dari nextUpdate1:", nextUpdate1Val);
  }

// ---------- Buat atau update nextUpdate jika kosong ----------
let nextUpdateVal =normalizeToMidnightUTC(metaNextUpdate?.getAttribute("content"));
let nextUpdate;

if (nextUpdateVal) {
  // Jika sudah ada meta dan ada nilai
  nextUpdate = new Date(normalizeToMidnightUTC(nextUpdateVal));
} else {
  // Jika belum ada meta atau belum ada nilai
  if (!metaNextUpdate) {
    metaNextUpdate = document.createElement("meta");
    metaNextUpdate.setAttribute("name", "nextUpdate");
    document.head.appendChild(metaNextUpdate);
  }

  // Tentukan nilai baru
  if (dateModified) {
    nextUpdate = new Date(new Date(dateModified).getTime() + validityDays * 86400000);
  } else {
    dateModified = normalizeToMidnightUTC(nowLocalISO);
    nextUpdate =  normalizeToMidnightUTC(new Date(now.getTime() + validityDays * 86400000));
  }

  // Set nilainya ke meta
  const nextISO = normalizeToMidnightUTC(nextUpdate.toISOString());
  metaNextUpdate.setAttribute("content", nextISO);

  console.log("🆕 [AED] Meta nextUpdate baru dibuat & diisi:", nextISO);
}

  const timeAllowed = normalizeToMidnightUTC(nextUpdate) ? now >= normalizeToMidnightUTC(nextUpdate) : false;
  const keyHash = "aed_hash_" + location.pathname;
  const prevHash = localStorage.getItem(keyHash);
  const currentHash = hashString((h1 + sections.map(s => s.content).join(" ")).slice(0, 30000));
  const contentChanged = prevHash && prevHash !== currentHash;

  // ---------- 🔁 Sinkronisasi dateModified dengan nextUpdate ----------
  try {
    // === jika nextUpdate ada, hitung dateModified ===
    if (nextUpdateVal) {
      const nextUpdateDate = new Date(nextUpdateVal);
      const expectedDateModified = new Date(nextUpdateDate.getTime() - validityDays * 86400000);
      const expectedISO = normalizeToMidnightUTC(expectedDateModified.toISOString());

      const currentISO = dateModified
        ? normalizeToMidnightUTC(dateModified.split("T")[0])
        : null;

      if (currentISO !== expectedISO) {
        dateModified = expectedISO;
        console.log("🕒 [AED Sync] dateModified dihitung ulang dari nextUpdate:", expectedISO);
      } else {
        console.log("✅ [AED Sync] dateModified sudah sinkron:", expectedISO);
      }
    } else {
      console.warn("⚠️ [AED Sync] Meta nextUpdate tidak ditemukan, dateModified tidak dihitung ulang.");
    }
 } catch (err) {
    console.error("❌ [AED Sync] Sinkronisasi gagal:", err);
 }

 // ⚡ Smart Evergreen Semi-Auto Update v9.3 — SEO Safe + JSON-LD Maintained
/// ⚡ Smart Evergreen Auto-Loop v9.6 — SEO Safe + Conditional dateModified
(function() {
  const validityDaysFinal = 180; // umur konten (hari)
  const metaNext = document.querySelector('meta[name="nextUpdate"]');
  if (!metaNext) return console.warn("⏳ Tidak ada meta[name='nextUpdate'], abaikan loop.");

  const storedNextUpdateStr = metaNext.getAttribute("content");
  if (!storedNextUpdateStr) return console.warn("❌ nextUpdate kosong, tidak bisa looping.");

  const today = new Date();
  const nextUpdateDate = new Date(storedNextUpdateStr);
  const diffDays = Math.floor((today - nextUpdateDate) / (1000 * 60 * 60 * 24));

  // === Jika sudah waktunya update ===
  if (today >= nextUpdateDate) {
    console.warn(`⚠️ Konten melewati jadwal update! (${diffDays} hari lewat dari next update)`);

    // 🟡 Peringatan visual (tidak terbaca Google)
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

    // 🗓️ Hitung next update berikutnya (loop permanen)
    const nextNextUpdate = new Date(nextUpdateDate);
    nextNextUpdate.setDate(nextNextUpdate.getDate() + validityDaysFinal);

    // 🔁 Perbarui hanya meta nextUpdate
    metaNext.setAttribute("content", nextNextUpdate.toISOString().split("T")[0]);

   
  } else {
    const remaining = Math.ceil((nextUpdateDate - today) / (1000 * 60 * 60 * 24));
    console.log(`✅ Konten masih valid (${remaining} hari tersisa hingga next update).`);
  }

  // =========================================================
  // === Bagian Kondisional: Update dateModified hanya jika konten berubah ===
  // =========================================================
  if (typeof timeAllowed !== "undefined" && typeof contentChanged !== "undefined") {
    // ---------- Update jika konten berubah ----------
   if (timeAllowed && contentChanged) {
     console.log("🔁 [AED] Konten berubah, update internal timestamp.");
   
     // Simpan hash baru agar tidak terdeteksi berulang
     localStorage.setItem(keyHash, currentHash);
   
     // Jadikan nextUpdate lama sebagai dateModified baru
     const dateModified = normalizeToMidnightUTC(new Date(storedNextUpdateStr));
   
     // Hitung next update berikutnya dari nextUpdate lama (bukan dari hari ini)
     const nextUpdate = normalizeToMidnightUTC(
       new Date(new Date(storedNextUpdateStr).getTime() + validityDays * 86400000)
     );

     // 🧩 Tambahkan schema maintenance ringan
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "isMaintained": true,
      "maintenanceSchedule": {
        "@type": "Schedule",
        "repeatFrequency": `P${validityDaysFinal}D`,
        "scheduledTime": nextUpdate
      },
      "dateModified": dateModified
    };

    const oldSchema = document.querySelector('script[data-schema="evergreen-maintenance"]');
    if (oldSchema) oldSchema.remove();

    const schemaEl = document.createElement("script");
    schemaEl.type = "application/ld+json";
    schemaEl.dataset.schema = "evergreen-maintenance";
    schemaEl.textContent = JSON.stringify(schemaData, null, 2);
    document.head.appendChild(schemaEl);

    console.log(`🗓️ Next update diperpanjang → ${nextNextUpdate.toISOString().split("T")[0]} (loop aktif).`);
    
     console.log(`🗓️ [AED] Konten diperbarui.
     dateModified: ${dateModified}
     nextUpdate: ${nextUpdate.toISOString().split("T")[0]}
     `);

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
    nextUpdate: nextUpdate ? nextUpdate.toISOString().split("T")[0] : null,
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
/*  const metaDateModified = document.querySelector('meta[itemprop="dateModified"]');
  const metaNextUpdate = document.querySelector('meta[name="nextUpdate"]');
  const metaType = document.querySelector('meta[itemprop="evergreenType"]'); // optional

  if (!metaDateModified || !metaNextUpdate) {
    console.warn("⚠️ Meta dateModified atau nextUpdate tidak ditemukan");
    return;
  }

  let dateModifiedStr = metaDateModified.getAttribute("content");
  let nextUpdateStr = metaNextUpdate.getAttribute("content");
  let type = metaType ? metaType.getAttribute("content") : "semi-evergreen";
*/
  
  // 💡 Jika window.AEDMetaDates sudah ada, prioritaskan nilai terbarunya
  if (window.AEDMetaDates) {
    const d = window.AEDMetaDates;
    if (d.dateModified) dateModifiedStr = d.dateModified;
    if (d.nextUpdate) nextUpdateStr = d.nextUpdate;
    if (d.type) type = d.type;
  }

  // 🔄 Simpan ulang ke global
  window.AEDMetaDates = { dateModified: dateModifiedStr, nextUpdate: nextUpdateStr, type };

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

  console.log("✅ [AED] updateArticleDates() selesai dijalankan");
}

updateArticleDates();

