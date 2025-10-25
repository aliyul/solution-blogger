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

 /* function hashString(str){
    let hash = 0;
    for (let i=0; i<str.length; i++){
      hash = (hash<<5)-hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }*/
  const hashString = s => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return (h >>> 0).toString(36);
};


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

  // ---------- Meta ----------
  let metaDateModified = document.querySelector('meta[itemprop="dateModified"]');
  let metaDatePublished = document.querySelector('meta[itemprop="datePublished"]');
  let metaNextUpdate = document.querySelector('meta[name="nextUpdate"]');
  const metaNextUpdate1 =  document.querySelector('meta[name="nextUpdate1"]');

  let dateModified = metaDateModified?.getAttribute("content");
  const datePublished = metaDatePublished?.getAttribute("content") || nowLocalISO;

  // ---------- Cek Override nextUpdate1 ----------
  if (metaNextUpdate1 && metaNextUpdate1.getAttribute("content")) {
    const nextUpdate1Val = metaNextUpdate1.getAttribute("content");
    if (metaNextUpdate) metaNextUpdate.setAttribute("content", nextUpdate1Val);
    else {
      metaNextUpdate = document.createElement("meta");
      metaNextUpdate.setAttribute("itemprop", "nextUpdate");
      metaNextUpdate.setAttribute("content", nextUpdate1Val);
      document.head.appendChild(metaNextUpdate);
    }
    console.log("✅ [AED] nextUpdate diambil dari nextUpdate1:", nextUpdate1Val);
  }

  // ---------- Sinkron mundur jika nextUpdate1 tidak ada ----------
// ---------- Sinkron mundur jika nextUpdate1 tidak ada ----------
/*
if (!metaNextUpdate1) {
  try {
    let nextVal = metaNextUpdate?.getAttribute("content");

    // 🔁 Fallback sinkron ringan: coba ulang beberapa kali (tanpa await)
    if (!nextVal) {
      console.warn("⏳ [AED] nextUpdate kosong, menunggu meta muncul...");
      setTimeout(() => {
        const retryVal = document.querySelector('meta[itemprop="nextUpdate"]')?.getAttribute("content");
        if (retryVal) {
          console.log("✅ [AED] nextUpdate ditemukan setelah retry:", retryVal);
          sinkronMundur(retryVal);
        } else {
          console.warn("⚠️ [AED] nextUpdate tetap kosong setelah retry.");
        }
      }, 400);
      return; // keluar sementara agar tidak lanjut sinkron
    }

    // langsung sinkron jika sudah ada
    sinkronMundur(nextVal);

    function sinkronMundur(nextVal) {
      const nextUpdateDate = new Date(nextVal);
      if (isNaN(nextUpdateDate.getTime())) {
        console.warn("⚠️ [AED] Nilai nextUpdate tidak valid:", nextVal);
        return;
      }

      const computedDateModified = new Date(nextUpdateDate.getTime() - validityDays * 86400000);
      const computedISO = computedDateModified.toISOString();
      const currentISO = metaDateModified?.getAttribute("content");

      if (currentISO !== computedISO) {
        if (!metaDateModified) {
          metaDateModified = document.createElement("meta");
          metaDateModified.setAttribute("itemprop", "dateModified");
          document.head.appendChild(metaDateModified);
        }
        metaDateModified.setAttribute("content", computedISO);
        dateModified = computedISO;
        console.log("🕒 [AED] dateModified disesuaikan mundur berdasarkan nextUpdate:", computedISO);
      } else {
        console.log("✅ [AED] dateModified sudah sinkron (mundur).");
      }
    }
  } catch (e) {
    console.error("❌ [AED] Gagal sinkron mundur dateModified:", e);
  }
}
*/

  // ---------- Buat nextUpdate jika kosong ----------
  let nextUpdate = metaNextUpdate?.getAttribute("content")
    ? new Date(metaNextUpdate.getAttribute("content"))
    : (dateModified
        ? new Date(new Date(dateModified).getTime() + validityDays * 86400000)
        : null);

  if (!metaNextUpdate && !dateModified) {
    dateModified = nowLocalISO;
    nextUpdate = new Date(now.getTime() + validityDays * 86400000);
    console.log("🆕 [AED] Membuat meta dateModified & nextUpdate baru:", dateModified);
  }

  const timeAllowed = nextUpdate ? now >= nextUpdate : false;
  const keyHash = "aed_hash_" + location.pathname;
  const prevHash = localStorage.getItem(keyHash);
  const currentHash = hashString((h1 + sections.map(s => s.content).join(" ")).slice(0, 30000));
  const contentChanged = prevHash && prevHash !== currentHash;

  // ---------- 🔁 Sinkronisasi dateModified dengan nextUpdate ----------
  try {
    if (metaNextUpdate && metaDateModified) {
      const nextUpdateValue = metaNextUpdate.getAttribute("content");
      if (nextUpdateValue) {
        const nextUpdateDate = new Date(nextUpdateValue);
        const expectedDateModified = new Date(nextUpdateDate.getTime() - validityDays * 86400000);
        const expectedISO = expectedDateModified.toISOString().split("T")[0];
        const currentISO = (dateModified || "").split("T")[0];

        if (currentISO !== expectedISO) {
          metaDateModified.setAttribute("content", expectedDateModified.toISOString());
          dateModified = expectedDateModified.toISOString(); // ✅ update global
          console.log("🕒 [AED] Meta dateModified disesuaikan:", expectedISO);
        } else {
          console.log("✅ [AED] dateModified sudah sinkron:", expectedISO);
        }
      }
    }
  } catch (err) {
    console.error("❌ [AED] Sinkronisasi gagal:", err);
  }

  // ---------- Update jika konten berubah ----------
  if (timeAllowed && contentChanged) {
    console.log("🔁 [AED] Konten berubah, update meta.");
    localStorage.setItem(keyHash, currentHash);
    dateModified = nowLocalISO;
    nextUpdate = new Date(now.getTime() + validityDays * 86400000);
    if (metaDateModified) metaDateModified.setAttribute("content", dateModified);
    if (metaNextUpdate) metaNextUpdate.setAttribute("content", nextUpdate.toISOString());
  }

  // ---------- Pastikan meta benar di DOM ----------
  if (metaDateModified) {
    dateModified = metaDateModified.getAttribute("content");
  }

  // ---------- JSON-LD Sync ----------
  if (nextUpdate) {
    const until = nextUpdate.toISOString().split("T")[0];
    try {
      const visited = new WeakSet();
      document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
        const text = script.textContent.trim();
        if (!text) return;
        const parsed = JSON.parse(text);
        const apply = obj => {
          if (!obj || typeof obj !== "object" || visited.has(obj)) return;
          visited.add(obj);
          if (["Product","Service","Article","BlogPosting"].includes(obj["@type"])) {
            obj.dateModified = dateModified;
            obj.datePublished = datePublished;
            if (obj.offers) {
              if (Array.isArray(obj.offers)) obj.offers.forEach(o => o.priceValidUntil = until);
              else obj.offers.priceValidUntil = until;
            }
          }
          for (const k in obj) apply(obj[k]);
        };
        Array.isArray(parsed) ? parsed.forEach(apply) : apply(parsed);
        script.textContent = JSON.stringify(parsed, null, 2);
      });
      console.log("✅ JSON-LD Sync — priceValidUntil:", until);
    } catch (e) { console.error("❌ JSON-LD Sync Error:", e); }
  }

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

// ================== DETEKSI TYPE KONTEN ==================
/* ===== Auto Evergreen Detector v7.7 + Dashboard Interaktif ===== */
(function AutoEvergreenV832UltraKMPTTF(window, document) {
  'use strict';

  // ===================== 🧩 Ambil Variabel Global =====================
  function convertToWIB(isoDate) {
    const date = new Date(isoDate);
    date.setHours(date.getHours() + 7);
    return date.toISOString().split("T")[0];
  }

  const { datePublished, dateModified, priceValidUntil } = window.AEDMetaDates || {
    datePublished: convertToWIB(new Date().toISOString()),
    dateModified: convertToWIB(new Date().toISOString()),
    priceValidUntil: convertToWIB(new Date(Date.now() + 1000 * 60 * 60 * 24 * 180)) // default 6 bulan
  };

  // ===================== CONFIG =====================
  const CONFIG = {
    storageKey: 'AutoEvergreenHashV8_3_2_UltraKMPTTF',
    labelAttr: 'data-aed-label',
    dateSpanClass: 'aed-date-span',
    checkLength: 5000,
    locale: 'id-ID',
    contentSelectors: ['main','article','.post-body','.entry-content','#content'],
    h1Selectors: ['h1','.entry-title'],
    authorSelector: '.post-author .fn, .author vcard, .byline',
    intervals: { EVERGREEN: 12, SEMI_EVERGREEN: 6, NON_EVERGREEN: 3 }
  };

  // ===================== HELPER =====================
  const qsMany = (sel)=>{for(const s of sel){const e=document.querySelector(s);if(e)return e;}return null;};
  const sampleTextFrom = e => e?(e.innerText||e.textContent||'').slice(0,CONFIG.checkLength).toLowerCase():'';
  const normalizeUrlToken = p => p ? p.split('/').filter(Boolean).pop()?.replace(/^p\//,'').replace(/\.html$/i,'')
    .replace(/\b(0?[1-9]|1[0-2]|20\d{2})\b/g,'').replace(/[-_]/g,' ').trim().toLowerCase()||'' : '';
  const makeHash = s => {try{return btoa(unescape(encodeURIComponent(s)));}catch{let h=0;for(let i=0;i<s.length;i++)h=(h<<5)-h+s.charCodeAt(i)|0;return String(h);}};
  const unique = a => Array.from(new Set(a));
  const tokenize = s => s?.toLowerCase().replace(/[^\p{L}\p{N}\s\-]/gu,' ').replace(/\s+/g,' ').trim().split(' ').filter(Boolean)||[];

  // === Skor H1 ===
  const computeH1UrlScore=(h1,url)=>{
    const u=unique(tokenize(url)),h=unique(tokenize(h1));
    if(!u.length)return 100;
    const m=u.filter(t=>h.includes(t)),ratio=m.length/u.length;
    const bonus=h1.toLowerCase().startsWith(u[0]||'')?0.15:0;
    return Math.round(Math.min(1,ratio+bonus)*100);
  };

  // ===================== DETECTOR =====================
  function detectEvergreen(title, text, url) {
    // ===================== 🧩 UTILITIES =====================
    const cleanText = str =>
      (str || "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();

    const t = cleanText(title + " " + text);
    const tokens = tokenize(t);
    const urlTokens = tokenize(url.split("/").pop()?.replace(/\.html$/i, "") || "");

    // ===================== ⚖️ SCORING =====================
    let score = 0;

    // 1️⃣ Relevansi URL ↔ Konten
    const matchCount = urlTokens.filter(ut => tokens.includes(ut)).length;
    score += Math.min(matchCount, 3);

    // 2️⃣ Panjang & Struktur
    if (t.length > 1500) score += 2;
    const paraCount = (text.match(/\n/g) || []).length;
    if (paraCount > 8) score += 1;
    if (paraCount < 3) score -= 1;

    // 3️⃣ Struktur SEO positif
    if (document.querySelectorAll("h2, h3").length >= 3) score += 1;
    if (document.querySelectorAll("table").length > 0) score -= 1;

    // 4️⃣ Pola Evergreen / Edukatif
    const evergreenWords = [
      "panduan","tutorial","tips","cara","fungsi","jenis","pengertian",
      "struktur","standar","material","spesifikasi","teknik","manfaat",
      "perbedaan","arti"
    ];
    if (evergreenWords.some(k => t.includes(k))) score += 3;

    // 5️⃣ Pola Semi-Evergreen
    const semiWords = ["harga","sewa","rental","kontraktor","jasa","produk","layanan","biaya","estimasi"];
    const hasSemiKeyword = semiWords.some(k => t.includes(k));
    if (hasSemiKeyword) score += 1;

    // 6️⃣ Pola Negatif (time-sensitive)
    const temporal = ["update","terbaru","hari ini","minggu ini","bulan ini","promo","diskon","stok","sementara","proyek berjalan","deadline"];
    if (temporal.some(k => t.includes(k))) score -= 2;

    // 7️⃣ Pola Berita/Event
    const news = ["berita","laporan","event","konferensi","seminar","pengumuman"];
    if (news.some(k => t.includes(k))) score -= 3;

    // 8️⃣ Logika URL
    const isPage = url.includes("/p/");
    if (isPage) score += 2;
    if (/\/\d{4}\/\d{2}\//.test(url)) score -= 2;

    // ===================== 🧠 STATUS =====================
    let status = "SEMI_EVERGREEN";
    if (score >= 6) status = "EVERGREEN";
    else if (score <= 1) status = "NON_EVERGREEN";

    // Override ke SEMI_EVERGREEN jika mengandung keyword jasa/produk
    if (status === "EVERGREEN" && hasSemiKeyword) status = "SEMI_EVERGREEN";

    console.log(`🧩 Evergreen Detection:\n- Status: ${status}\n- Score: ${score}`);
    return { status, score };
  }

  // ===================== CORE =====================
  try {
    console.log("🚀 Running AED v8.3.2R Ultra KMPTTF...");

    const elC = qsMany(CONFIG.contentSelectors) || document.body;
    const elH1 = qsMany(CONFIG.h1Selectors) || document.querySelector("h1");
    const h1R = elH1 ? elH1.innerText.trim() : "(no h1)";
    const txt = sampleTextFrom(elC);
    const urlRaw = normalizeUrlToken(window.location.pathname);

    const result = detectEvergreen(h1R, txt, urlRaw);
    const type = result.status;
    const aiScore = result.score;

    const metaPub = document.querySelector('meta[itemprop="datePublished"]');
    const metaMod = document.querySelector('meta[itemprop="dateModified"]');
    const datePublished = metaPub ? metaPub.getAttribute("content") : "(not set)";
    const dateModified = metaMod ? metaMod.getAttribute("content") : "(not set)";

    console.log("[AED] Type:", type, "Score:", aiScore);
    console.log("📅 datePublished:", datePublished, "dateModified:", dateModified);

     // ===================== DASHBOARD HANYA UNTUK ADMIN =====================
    const isAdminDebug = window.location.search.includes("debug");
    if (!isAdminDebug) {
      console.log("🛡️ AED Dashboard disembunyikan (mode publik). Tambahkan '?debug' untuk admin view.");
      return; // keluar agar dashboard tidak dirender
    }
    // ===================== DASHBOARD =====================
    const dash = document.createElement("div");
    dash.id = "AEDDashboard";
    dash.setAttribute("data-nosnippet", "true");
    dash.style.cssText = `
      max-width:1200px;margin:30px auto;padding:15px;
      background:#f0f8ff;border-top:3px solid #0078ff;
      font-family:Arial,sans-serif;border-radius:10px;
    `;

    const h3 = document.createElement("h3");
    h3.textContent = "📊 AED Ultra KMPTTF Dashboard — Ringkasan Halaman";
    dash.appendChild(h3);

    const btns = document.createElement("div");
    btns.style.textAlign = "center";
    btns.style.marginBottom = "10px";

    const mkBtn = (t, bg) => {
      const b = document.createElement("button");
      b.textContent = t;
      b.style.cssText = `background:${bg};padding:6px 12px;margin:3px;border:none;border-radius:4px;cursor:pointer;`;
      return b;
    };

    const show = mkBtn("📊 Lihat Tabel", "#d1e7dd"),
          rep = mkBtn("📥 Unduh Laporan", "#f3f3f3");
    btns.append(show, rep);
    dash.appendChild(btns);

    const tbl = document.createElement("div");
    tbl.style.overflowX = "auto";
    tbl.style.display = "none";
    tbl.innerHTML = `
      <table style="width:100%;border-collapse:collapse;min-width:1000px;font-size:.9em;">
        <thead>
          <tr><th>Halaman</th><th>Status</th><th>Tanggal Diperbarui</th><th>H1</th><th>Skor</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>${document.title}</td>
            <td>${type}</td>
            <td>${dateModified}</td>
            <td>${h1R}</td>
            <td>${aiScore}/100</td>
          </tr>
        </tbody>
      </table>
    `;
    dash.appendChild(tbl);

    const mainArea = document.querySelector("main") || document.body;
    mainArea.appendChild(dash);

    show.onclick = () => {
      tbl.style.display = tbl.style.display === "none" ? "block" : "none";
    };
    rep.onclick = () => {
      const txtRpt = `AED Ultra KMPTTF REPORT
Halaman: ${document.title}
Status: ${type}
Tanggal Update: ${dateModified}
Skor: ${aiScore}
URL: ${location.href}`;
      const blob = new Blob([txtRpt], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "AED_Report_" + document.title.replace(/\s+/g, "_") + ".txt";
      a.click();
    };

    const st = document.createElement("style");
    st.textContent = `
      @media(max-width:768px){
        table th,td{padding:4px;font-size:.8em;}
        table{min-width:700px;}
      }
      table th,td{border:1px solid #ccc;padding:6px;text-align:left;}
      thead{background:#dff0ff;position:sticky;top:0;}
    `;
    document.head.appendChild(st);

    console.log("✅ AED v8.3.2R Ultra KMPTTF aktif — dashboard responsif stabil.");
  } catch (e) {
    console.error("❌ AED v8.3.2R Error:", e);
  }

})(window, document);


// =================== DASHBOARD FUNCTION ===================
function showEvergreenDashboard() {
  const renderDashboard = data => {
    if (!data || !Array.isArray(data.sections)) {
      console.warn("⚠️ EvergreenDetectorResults tidak valid atau belum siap.");
      return;
    }

    // 🧹 Pastikan nilai skor aman dari undefined
    data.sections = data.sections.map(s => ({
      section: s.section || "(tanpa judul)",
      sEver: typeof s.sEver === "number" ? s.sEver : 0,
      sSemi: typeof s.sSemi === "number" ? s.sSemi : 0,
      sNon: typeof s.sNon === "number" ? s.sNon : 0,
      sectionType: s.sectionType || "unknown",
      validityDays: s.validityDays || 0,
      sectionAdvice: s.sectionAdvice || "-"
    }));
 // ===================== DASHBOARD HANYA UNTUK ADMIN =====================
    const isAdminDebug = window.location.search.includes("debug");
    if (!isAdminDebug) {
      console.log("🛡️ AED Dashboard disembunyikan (mode publik). Tambahkan '?debug' untuk admin view.");
      return; // keluar agar dashboard tidak dirender
    }
    const wrap = document.createElement("div");
    wrap.id = "EvergreenDashboard";
    wrap.setAttribute("data-nosnippet", "true");
    wrap.style.cssText = `
      max-width:1200px;
      margin:20px auto;
      padding:10px;
      background:#f8fbff;
      border-top:4px solid #0066cc;
      border-radius:12px;
      box-shadow:0 2px 8px rgba(0,0,0,.1);
      font-family:system-ui;
      overflow-x:auto;
    `;

    wrap.innerHTML = `
      <h2 style="text-align:center;margin-bottom:10px;">🧩 Evergreen Content Report</h2>
      <p style="text-align:center;margin-bottom:15px;color:#444;">
        <b>Status Global:</b> ${data.resultType?.toUpperCase() || "UNKNOWN"} |
        <b>Review:</b> ${data.validityDays || "?"} hari |
        <b>Terakhir Ubah:</b> ${data.dateModified || "-"}
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead style="position:sticky;top:0;background:#eaf3ff;z-index:1;">
          <tr>
            <th>Bagian</th><th>Ever</th><th>Semi</th><th>Non</th>
            <th>Status</th><th>Review (hari)</th><th>Saran</th>
          </tr>
        </thead>
        <tbody>
          ${data.sections.map(s => `
            <tr>
              <td>${s.section}</td>
              <td>${s.sEver.toFixed(1)}</td>
              <td>${s.sSemi.toFixed(1)}</td>
              <td>${s.sNon.toFixed(1)}</td>
              <td style="font-weight:bold;color:${
                s.sectionType === "evergreen" ? "#007700" :
                s.sectionType === "semi-evergreen" ? "#cc8800" :
                s.sectionType === "non-evergreen" ? "#cc0000" : "#444"
              }">${s.sectionType.toUpperCase()}</td>
              <td>${s.validityDays}</td>
              <td>${s.sectionAdvice}</td>
            </tr>`).join("")}
        </tbody>
      </table>
      <p style="text-align:center;margin-top:12px;">${data.advice || ""}</p>
    `;

    // Tempatkan dashboard di bawah #AEDDashboard jika ada
    const anchor = document.querySelector("#AEDDashboard");
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(wrap, anchor.nextSibling);
    else document.body.appendChild(wrap);
  };

  const waitForResults = () => {
    if (window.EvergreenDetectorResults) {
      renderDashboard(window.EvergreenDetectorResults);
    } else {
      setTimeout(waitForResults, 500);
    }
  };

  waitForResults();
}

// 🔍 Jalankan otomatis
showEvergreenDashboard();
  
  
function updateArticleDates() {
  // 🧹 --- Hapus elemen label & tanggal lama ---
  document.getElementById("evergreen-label")?.remove();
  document.querySelectorAll(".aed-date-span, .aed-non-evergreen-date").forEach(el => el.remove());

  // 🧩 --- Ambil data meta langsung dari DOM ---
  const metaDateModified = document.querySelector('meta[itemprop="dateModified"]');
  const metaNextUpdate = document.querySelector('meta[name="nextUpdate"]');
  const metaType = document.querySelector('meta[itemprop="evergreenType"]'); // optional

  if (!metaDateModified || !metaNextUpdate) {
    console.warn("⚠️ Meta dateModified atau nextUpdate tidak ditemukan");
    return;
  }

  let dateModifiedStr = metaDateModified.getAttribute("content");
  let nextUpdateStr = metaNextUpdate.getAttribute("content");
  let type = metaType ? metaType.getAttribute("content") : "semi-evergreen";

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

/*
if (window.AEDMetaDates) {
  const { type, datePublished, dateModified, nextUpdate } = window.AEDMetaDates;
  updateArticleDates(type, datePublished, dateModified, nextUpdate);
}
*/

  // === Update JSON-LD Article Schema ===
/*  const schemaEl = document.getElementById('auto-schema');
  if (schemaEl) {
    try {
      const schemaObj = JSON.parse(schemaEl.textContent);
      schemaObj.datePublished = datePublished;
      schemaObj.dateModified = dateModified;
      schemaEl.textContent = JSON.stringify(schemaObj, null, 2);
      console.log('✅ Schema Article diperbarui:', { datePublished, dateModified });
    } catch (err) {
      console.warn('⚠️ Gagal update schema:', err);
    }
  }*/

  // ================== Ambil konten utama ==================
/* const contentEl = document.querySelector(".post-body.entry-content") || 
                    document.querySelector("[id^='post-body-']") || 
                    document.querySelector(".post-body");
  const contentText = contentEl ? contentEl.innerText : "";
  */

 // ================== HASH DETECTION ==================
/*
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
  const { datePublished, dateModified } = window.AEDMetaDates || {
    datePublished: new Date().toISOString().split("T")[0],
    dateModified: new Date().toISOString().split("T")[0]
  };

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
    const { datePublished, dateModified } = window.AEDMetaDates || {
    datePublished: new Date().toISOString().split("T")[0],
    dateModified: new Date().toISOString().split("T")[0]
  };
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
