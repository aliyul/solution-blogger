// === Global date variable ===
let datePublished = '';
let dateModified = '';

function detectEvergreen() {
  console.log("🧩 Running detectEvergreen() v8.6.12 Stable — Semi/Non Fixed...");
  window.detectEvergreenReady = false;
  const now = new Date();
  const clean = s => (s ? s.replace(/\s+/g, " ").trim() : "");

  const formatLocalISO = date => {
    const tzOffset = -date.getTimezoneOffset();
    const diff = tzOffset >= 0 ? "+" : "-";
    const pad = n => String(Math.floor(Math.abs(n))).padStart(2, "0");
    const hours = pad(tzOffset / 60);
    const minutes = pad(tzOffset % 60);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${diff}${hours}:${minutes}`;
  };

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
    sEver += (b.match(evergreenPattern) || []).length * 0.8;

    if (semiEvergreenPattern.test(t)) sSemi += 1;
    sSemi += (b.match(semiEvergreenPattern) || []).length * 0.5;

    if (nonEvergreenPattern.test(t)) sNon += 1.5;
    sNon += (b.match(nonEvergreenPattern) || []).length * 1.0;

    if (priceTokenPattern.test(t + " " + b)) sSemi += 0.5;

    totalScores.evergreen += sEver;
    totalScores.semi += sSemi;
    totalScores.non += sNon;
  });

  // ---------- Final Type ----------
  const hasTimePattern = /\b(20\d{2}|bulan|minggu|hari\s?ini|promo|update)\b/.test(contentText);
  let finalType = "semi-evergreen";
  if (totalScores.non > totalScores.evergreen && totalScores.non > totalScores.semi) {
    finalType = "non-evergreen";
  } else if (totalScores.evergreen >= Math.max(totalScores.semi + 1, totalScores.non) && !hasTimePattern) {
    finalType = "evergreen";
  } 
  if (/\b(panduan|tutorial|tips|cara)\b/i.test(h1 + contentText)) finalType = "evergreen";

  // ---------- Validity Days & Next Update ----------
  let validityDays, nextUpdate = null;
  const normalizeToMidnightUTC = date => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    d.setUTCHours(0,0,0,0);
    return d.toISOString();
  };

  const metaNextUpdate1 = document.querySelector('meta[name="nextUpdate1"]');
  const nextUpdate1Val = metaNextUpdate1 ? normalizeToMidnightUTC(metaNextUpdate1.getAttribute("content")) : null;
  const nowUTC = normalizeToMidnightUTC(now);

  if (finalType === "evergreen") {
    validityDays = null;
    nextUpdate = null;
  } else {
    validityDays = finalType === "semi-evergreen" ? 365 : 180; // semi 12 bulan, non 6 bulan
    const validityMs = validityDays * 86400000;
    let baseDate = nextUpdate1Val ? new Date(nextUpdate1Val) : new Date(nowUTC);

    // loop sampai nextUpdate > sekarang
    while (baseDate <= nowUTC) {
      baseDate = new Date(baseDate.getTime() + validityMs);
    }
    nextUpdate = normalizeToMidnightUTC(baseDate);
  }

  // ---------- Meta ----------
  let metaDateModified = document.querySelector('meta[itemprop="dateModified"]');
  let metaDatePublished = document.querySelector('meta[itemprop="datePublished"]');
  let dateModified = normalizeToMidnightUTC(metaDateModified?.getAttribute("content"));
  const datePublishedISO = metaDatePublished?.getAttribute("content") || nowUTC;

  // ---------- Store final results ----------
  window.EvergreenDetectorResults = {
    resultType: finalType,
    validityDays,
    dateModified,
    datePublished: datePublishedISO,
    nextUpdate,
    sections
  };

  window.AEDMetaDates = {
    dateModified,
    datePublished: datePublishedISO,
    nextUpdate,
    type: finalType
  };

  console.log("✅ [AED] detectEvergreen() selesai, hasil:");
  console.log(window.AEDMetaDates);
}

function updateArticleDates() {
  document.getElementById("evergreen-label")?.remove();
  document.querySelectorAll(".aed-date-span, .aed-non-evergreen-date").forEach(el => el.remove());

  const metaType = document.querySelector('meta[itemprop="evergreenType"]');
  const type = (window.AEDMetaDates && window.AEDMetaDates.type) || (metaType?.getAttribute("content")) || "semi-evergreen";
  const nextUpdateStr = (window.AEDMetaDates && window.AEDMetaDates.nextUpdate) || null;
  const dateModifiedStr = (window.AEDMetaDates && window.AEDMetaDates.dateModified) || null;

  const formatTanggalNormal = dateString => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", { year:"numeric", month:"long", day:"numeric", timeZone:"Asia/Jakarta" });
    } catch(e) { return dateString; }
  };

  const nextUpdateHuman = (type === "evergreen" || !nextUpdateStr) ? "-" : formatTanggalNormal(nextUpdateStr);
  const dateModifiedHuman = dateModifiedStr ? formatTanggalNormal(dateModifiedStr) : "-";

  const elH1 = document.querySelector("h1, .post-title, .page-title");
  if (!elH1) return;

  const lb = document.createElement("div");
  lb.id = "evergreen-label";
  lb.style.cssText = "font-size:.9em;margin-bottom:8px;color:#333;";
  lb.setAttribute("data-nosnippet", "true");

  if (type === "evergreen") {
    lb.innerHTML = `<b>EVERGREEN</b> — pembaruan berikutnya: <b>${nextUpdateHuman}</b>`;
    document.body.setAttribute("data-force","evergreen");
  } else if (type === "semi-evergreen") {
    lb.innerHTML = `<b>SEMI-EVERGREEN</b> — disarankan update: <b>${nextUpdateHuman}</b>`;
    document.body.setAttribute("data-force","semi-evergreen");
  } else {
    lb.innerHTML = `<b>NON-EVERGREEN</b> — disarankan update: <b>${nextUpdateHuman}</b>`;
    document.body.setAttribute("data-force","non-evergreen");
  }

  elH1.insertAdjacentElement("afterend", lb);

  const authorEl = document.querySelector(".post-author .fn");
  if(authorEl && type !== "evergreen") {
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

// === Run ===
detectEvergreen();
updateArticleDates();
