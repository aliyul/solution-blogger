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
// === Global date variable ===
let datePublished = '';
let dateModified = '';

// === Function untuk update tanggal & schema ===
function updateArticleDates(type, pubStr, modStr, nextStr) {
  // Simpan ke variabel global agar bisa digunakan di schema
  datePublished = pubStr;
  dateModified = modStr;

  // 🧩 Tentukan isi label berdasarkan hasil deteksi
  const elH1 = document.querySelector('h1');
  if (!elH1) return;

  let lb = document.getElementById('evergreen-label');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'evergreen-label';
    lb.style.cssText = 'font-size:.9em;margin-bottom:8px;color:#333;';
  }

  let labelText = '';
  if (type === 'EVERGREEN') {
    labelText = `<b>EVERGREEN</b> — pembaruan berikutnya: <b>${nextStr}</b>`;
    document.body.setAttribute('data-force', 'evergreen');
  } else if (type === 'SEMI_EVERGREEN') {
    labelText = `<b>SEMI-EVERGREEN</b> — disarankan update: <b>${nextStr}</b>`;
    document.body.setAttribute('data-force', 'semi-evergreen');
  } else if (type === 'NON_EVERGREEN') {
    labelText = `<b>NON-EVERGREEN</b> — disarankan update: <b>${nextStr}</b>`;
    document.body.setAttribute('data-force', 'non-evergreen');
  } else {
    document.body.removeAttribute('data-force');
  }

  lb.innerHTML = labelText;
  elH1.insertAdjacentElement('afterend', lb);

  // === Author Date Display ===
  const CONFIG = {
    authorSelector: '.author-info',
    dateSpanClass: 'article-date',
  };
  const aEl = document.querySelector(CONFIG.authorSelector);

  // Hapus tanggal lama jika ada
  aEl?.querySelector('.' + CONFIG.dateSpanClass)?.remove();

  if (type === 'NON_EVERGREEN') {
    const d = document.createElement('span');
    d.className = CONFIG.dateSpanClass;
    d.textContent = 'Diperbarui: ' + modStr;
    d.style.cssText = 'display:block;font-size:.85em;color:#d9534f;margin-bottom:4px;';
    d.setAttribute('data-nosnippet', 'true');
    elH1.parentNode.insertBefore(d, elH1);
  } else if (type === 'SEMI_EVERGREEN') {
    if (aEl && modStr) {
      const d = document.createElement('span');
      d.className = CONFIG.dateSpanClass;
      d.textContent = ' · Diperbarui: ' + modStr;
      d.style.cssText = 'font-size:.85em;color:#555;margin-left:6px;';
      d.setAttribute('data-nosnippet', 'true');
      aEl.appendChild(d);
    }
  }
const { datePublished, dateModified, priceValidUntil } = window.AEDMetaDates || {
    datePublished: convertToWIB(new Date().toISOString()),
    dateModified: convertToWIB(new Date().toISOString()),
    priceValidUntil: convertToWIB(new Date(Date.now() + 1000 * 60 * 60 * 24 * 180)) // default 6 bulan
  };
updateArticleDates(type, datePublished, dateModified, nextUpdate);
  
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
  
}

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

  // ===================== DETECTOR =====================function detectEvergreen(title, text, url) {
  // ===================== 🧩 UTILITIES =====================
  const cleanText = str =>
    (str || "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

 // const tokenize = str => cleanText(str).split(" ").filter(Boolean);

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
  if (document.querySelectorAll("table").length > 0) score -= 1; // sering menandakan data harga

  // 4️⃣ Pola Evergreen / Edukatif
  const evergreenWords = [
    "panduan","tutorial","tips","cara","fungsi","jenis","pengertian",
    "struktur","standar","material","spesifikasi","teknik","manfaat",
    "perbedaan","arti"
  ];
  if (evergreenWords.some(k => t.includes(k))) score += 3;

  // 5️⃣ Pola Semi-Evergreen (harga, jasa, produk)
  const semiWords = ["harga","sewa","rental","kontraktor","jasa","produk","layanan","biaya","estimasi"];
  const hasSemiKeyword = semiWords.some(k => t.includes(k));
  if (hasSemiKeyword) score += 1; // tidak negatif, dianggap semi stabil

  // 6️⃣ Pola Negatif (time-sensitive)
  const temporal = ["update","terbaru","hari ini","minggu ini","bulan ini","promo","diskon","stok","sementara","proyek berjalan","deadline"];
  if (temporal.some(k => t.includes(k))) score -= 2;

  // 7️⃣ Pola Berita/Event
  const news = ["berita","laporan","event","konferensi","seminar","pengumuman"];
  if (news.some(k => t.includes(k))) score -= 3;

  // 8️⃣ Logika URL
  const isPage = url.includes("/p/");
  if (isPage) score += 2;
  if (/\/\d{4}\/\d{2}\//.test(url)) score -= 2; // URL bertanggal → bukan evergreen

  // ===================== 🧠 STATUS =====================
  let status = "SEMI_EVERGREEN";
  if (score >= 6) status = "EVERGREEN";
  else if (score <= 1) status = "NON_EVERGREEN";

  // 🔁 Override: jika konten ada elemen harga/jasa/produk → semi-evergreen
  if (status === "EVERGREEN" && hasSemiKeyword) {
    status = "SEMI_EVERGREEN";
  }

  // ===================== 📦 PRICE VALID UNTIL =====================
  /*
  const now = new Date();
  if (status === "EVERGREEN") now.setFullYear(now.getFullYear() + 1);
  else if (status === "SEMI_EVERGREEN") now.setMonth(now.getMonth() + 6);
  else now.setMonth(now.getMonth() + 3);
  const priceValidUntil = now.toISOString().split("T")[0];
*/
  console.log(`🧩 Evergreen Detection:
  - Status: ${status}
  - Score: ${score}`);
  //- PriceValidUntil: ${priceValidUntil}`);

 // return { status, score, priceValidUntil };
  return { status, score };
}

  // ===================== CORE =====================
  try {
    const elC = qsMany(CONFIG.contentSelectors) || document.body;
    const elH1 = qsMany(CONFIG.h1Selectors) || document.querySelector('h1');
    const h1R = elH1?elH1.innerText.trim():'(no h1)';
    const txt = sampleTextFrom(elC);
    const urlRaw = normalizeUrlToken(window.location.pathname);

    const result = detectEvergreen(h1R, txt, urlRaw);
    const type = result.status;
    const aiScore = result.score;

    console.log("[AED] Type:", type, "Score:", aiScore);
    console.log("📅 datePublished:", datePublished, "dateModified:", dateModified, "priceValidUntil:", priceValidUntil);

    // ===================== DASHBOARD =====================
    const dash = document.createElement('div');
    dash.id = 'AEDDashboard';
    dash.setAttribute('data-nosnippet','true');
    dash.style.cssText = `
      max-width:1200px;margin:30px auto;padding:15px;
      background:#f0f8ff;border-top:3px solid #0078ff;
      font-family:Arial,sans-serif;border-radius:10px;
    `;

    const h3 = document.createElement('h3');
    h3.textContent = '📊 AED Ultra KMPTTF Dashboard — Ringkasan Halaman';
    dash.appendChild(h3);

    const btns = document.createElement('div');
    btns.style.textAlign = 'center';
    btns.style.marginBottom = '10px';
    const mkBtn = (t,bg)=>{const b=document.createElement('button');b.textContent=t;b.style.cssText=`background:${bg};padding:6px 12px;margin:3px;border:none;border-radius:4px;cursor:pointer;`;return b;};
    const show=mkBtn("📊 Lihat Tabel","#d1e7dd"), rep=mkBtn("📥 Unduh Laporan","#f3f3f3");
    btns.append(show,rep);
    dash.appendChild(btns);

    const tbl = document.createElement('div');
    tbl.style.overflowX='auto';tbl.style.display='none';
    tbl.innerHTML=`<table style="width:100%;border-collapse:collapse;min-width:1000px;font-size:.9em;">
      <thead><tr><th>Halaman</th><th>Status</th><th>Tanggal Diperbarui</th><th>H1</th><th>Skor</th></tr></thead>
      <tbody><tr><td>${document.title}</td><td>${type}</td><td>${dateModified}</td><td>${h1R}</td><td>${aiScore}/100</td></tr></tbody>
    </table>`;
    dash.appendChild(tbl);

    // === Sisipkan ke bawah konten utama ===
    const mainArea = document.querySelector("#AEDDashboard") || document.querySelector("main") || document.body;
    mainArea.appendChild(dash);

    show.onclick=()=>tbl.style.display=tbl.style.display==='none'?'block':'none';
    rep.onclick=()=>{
      const txtRpt=`AED Ultra KMPTTF REPORT\nHalaman: ${document.title}\nStatus: ${type}\nTanggal Update: ${dateModified}\nSkor: ${aiScore}\nURL: ${location.href}`;
      const blob=new Blob([txtRpt],{type:'text/plain'});
      const a=document.createElement('a');
      a.href=URL.createObjectURL(blob);
      a.download='AED_Report_'+document.title.replace(/\s+/g,'_')+'.txt';
      a.click();
    };

    const st=document.createElement('style');
    st.textContent=`@media(max-width:768px){table th,td{padding:4px;font-size:.8em;}table{min-width:700px;}}table th,td{border:1px solid #ccc;padding:6px;text-align:left;}thead{background:#dff0ff;position:sticky;top:0;}`;
    document.head.appendChild(st);

    console.log("✅ AED v8.3.2R Ultra KMPTTF aktif — schema skip, dashboard sticky responsive.");
  } catch (e) {
    console.error("❌ AED v8.3.2R Error:", e);
  }
})(window, document);

/**
 * 🌿 Hybrid Evergreen Detector v7.1
 * ✅ Smart Section Update + Auto dateModified + Responsive Dashboard
 * Beton Jaya Readymix ©2025
 */

/* ===== 🧩 Hybrid Evergreen Detector + Smart Selective DateModified v7.6 ===== */
/* ============================================================
   🧩 Smart Selective Evergreen Detector v8.1 UltraKMPTTF TrueSection+SchemaSync
   Fitur:
   - Deteksi perubahan konten & saran update
   - Auto-update <meta itemprop="dateModified">
   - Auto-sync JSON-LD Article schema (datePublished/dateModified)
   - Auto-update Product schema PriceValidUntil jika konten harga berubah
   ============================================================ */
/* ============================================================
   🧩 Smart Evergreen Detector v8.3.1 — Precision Hybrid
   Fitur:
   - Global + section-based detection (H1,H2,H3,paragraphs)
   - Weighted scoring (judul, paragraf, daftar, tabel)
   - Hash-check => update <meta itemprop="dateModified"> hanya bila berubah
   - Auto-sync JSON-LD (Article/BlogPosting dateModified; Product/Service priceValidUntil)
   - priceValidUntil: evergreen=365d, semi=180d, non=90d
   - Results available on window.EvergreenDetectorResults
   ============================================================ */
/* ============================================================
   🧠 Smart Evergreen Detector v8.3.1 — Precision Hybrid
   ============================================================ */
/* ============================================================
   🧠 Smart Evergreen Detector v8.3.2 — Precision+ Per Section Analyzer
   ============================================================ */
/* ============================================================
   🧠 Smart Evergreen Detector v8.3.4R — Precision+ Parity-Stable Fix
   Fitur:
   - Analisis per section (harga, produk, konten utama)
   - Auto sync <meta itemprop="dateModified">
   - Auto update priceValidUntil sesuai status evergreen
   - Penempatan dashboard otomatis di bawah #AEDDashboard
   ============================================================ */

/* ============================================================
   🧠 Smart Evergreen Detector v8.3.4R — Precision+ Parity-Stable Fix
   Fitur:
   - Analisis per section (harga, produk, konten utama)
   - Auto sync <meta itemprop="dateModified">
   - Auto update priceValidUntil sesuai status evergreen
   - Penempatan dashboard otomatis di bawah #AEDDashboard
   ============================================================ */
function detectEvergreenFullDashboard() {
  console.log("🧠 Running Smart Evergreen Detector v8.6 Full + Dashboard Responsive...");

  // ---------- Utilities ----------
  const now = new Date();
  const nowISODate = () => now.toISOString().split("T")[0];
  const clean = s => (s ? s.replace(/\s+/g, " ").trim() : "");
  const hashString = s => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return (h >>> 0).toString(36);
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
  const contentTextRaw = clean(contentEl ? contentEl.innerText : "");
  const contentText = (h1 + " " + contentTextRaw).toLowerCase();

  // ---------- Keyword Pattern ----------
  const nonEvergreenPattern = /\b(update|terbaru|berita|promo|jadwal|event|bulan\s?\d{4}|tahun\s?\d{4}|sementara|musiman|stok|laporan|penawaran|info pasar)\b/;
  const semiEvergreenPattern = /\b(harga|sewa|rental|kontraktor|jasa|biaya|tarif|borongan)\b/;
  const evergreenPattern = /\b(panduan|tutorial|tips|cara|definisi|jenis|fungsi|spesifikasi|apa itu|perbedaan|metode|manfaat|keunggulan)\b/;
  const priceTokenPattern = /\b(harga|rp|per\s?(m3|m2|unit|kubik|meter)|biaya|tarif)\b/i;

  // ---------- Section Extraction ----------
  const sections = [];
  const headings = Array.from(contentEl.querySelectorAll("h2,h3"));
  if (headings.length === 0) sections.push({ title: h1 || "artikel", content: contentTextRaw });
  else {
    for (let i = 0; i < headings.length; i++) {
      const head = headings[i];
      const title = clean(head.innerText);
      let cur = head.nextElementSibling, body = "";
      while (cur && !(cur.matches && cur.matches("h2,h3"))) {
        if (cur.innerText) body += "\n" + clean(cur.innerText);
        cur = cur.nextElementSibling;
      }
      sections.push({ title, content: body });
    }
  }

  // ---------- Section Scoring ----------
  let totalScores = { evergreen: 0, semi: 0, non: 0 };
  const sectionDetails = sections.map(sec => {
    const t = sec.title.toLowerCase(), b = sec.content.toLowerCase();
    let sEver = 0, sSemi = 0, sNon = 0;

    if (evergreenPattern.test(t)) sEver += 2;
    if (semiEvergreenPattern.test(t)) sSemi += 2;
    if (nonEvergreenPattern.test(t)) sNon += 1.5;

    sEver += (b.match(evergreenPattern) || []).length * 0.8;
    sSemi += (b.match(semiEvergreenPattern) || []).length * 0.9;
    sNon += (b.match(nonEvergreenPattern) || []).length * 1.0;

    const hasPriceTokens = priceTokenPattern.test(t + " " + b);
    if (hasPriceTokens) sSemi += 1.5;

    totalScores.evergreen += sEver;
    totalScores.semi += sSemi;
    totalScores.non += sNon;

    let sectionType = "semi-evergreen";
    if (sNon > sSemi && sNon > sEver) sectionType = "non-evergreen";
    else if (sEver > sSemi + 2 && sEver > sNon) sectionType = "evergreen";

    const validityDays = { evergreen: 365, "semi-evergreen": 180, "non-evergreen": 90 }[sectionType];
    const sectionAdvice =
      sectionType === "evergreen" ? "Tinjau ulang tiap 9–12 bulan." :
      sectionType === "semi-evergreen" ?
        (hasPriceTokens ? "Perbarui harga setiap 3–6 bulan." : "Review tiap 4–6 bulan.") :
        "Konten cepat berubah — update tiap 1–3 bulan.";

    return { section: sec.title, sEver, sSemi, sNon, sectionType, validityDays, sectionAdvice };
  });

  // ---------- Global Classification + Parity ----------
  const hasTimePattern = /\b(20\d{2}|bulan|minggu|hari\s?ini|promo|update)\b/.test(contentText);
  let resultType = "semi-evergreen";
  if (totalScores.non > totalScores.semi && totalScores.non > totalScores.evergreen) resultType = "non-evergreen";
  else if (totalScores.evergreen > totalScores.semi + 2 && !hasTimePattern) resultType = "evergreen";

  const priceSections = sectionDetails.filter(s => /harga|produk|spesifikasi/.test(s.section.toLowerCase()));
  const parityStatus = priceSections.some(s => s.sectionType === "non-evergreen")
    ? "non-evergreen"
    : priceSections.some(s => s.sectionType === "semi-evergreen")
      ? "semi-evergreen"
      : resultType;

  const finalType = parityStatus;
  const validityDays = { evergreen: 365, "semi-evergreen": 180, "non-evergreen": 90 }[finalType];
  const type = finalType;
  window.AEDMetaDates = { Type };
     // ---------- Meta dateModified & datePublished ----------
  const metaDateModified = document.querySelector('meta[itemprop="dateModified"]');
  const metaDatePublished = document.querySelector('meta[itemprop="datePublished"]');
  const dateModified = metaDateModified?.getAttribute("content") || nowISODate();
  const datePublished = metaDatePublished?.getAttribute("content") || nowISODate();

  // ---------- Simpan global supaya bisa dipakai di fungsi lain ----------
  window.AEDMetaDates = { dateModified, datePublished };

  // ---------- Hash + Next Update ----------
  const currentHash = hashString(h1 + contentText.slice(0, 20000));
  const prevHash = localStorage.getItem("aed_hash_" + location.pathname);
  const metaNextUpdate = localStorage.getItem("aed_nextupdate_" + location.pathname);
  let nextUpdate = metaNextUpdate ? new Date(metaNextUpdate) : new Date(now.getTime() + validityDays * 86400000);
  
  // ---------- Meta nextUpdate ---------
  const nextUpdate = metaNextUpdate?.getAttribute("content") || nowISODate();
   // ---------- Simpan global supaya bisa dipakai di fungsi lain ----------
  window.AEDMetaDates = { nextUpdate };

  if (now >= nextUpdate || prevHash !== currentHash) {
    localStorage.setItem("aed_hash_" + location.pathname, currentHash);
    //nextUpdate = new Date(now.getTime() + validityDays * 86400000);    
    nextUpdate = dateModified + validityDays * 86400000);
    
    localStorage.setItem("aed_nextupdate_" + location.pathname, nextUpdate.toISOString());
    if (metaDateModified) metaDateModified.setAttribute("content", nowISODate());
    else {
      const m = document.createElement("meta");
      m.setAttribute("itemprop","dateModified");
      m.setAttribute("content", nowISODate());
      document.head.appendChild(m);
    }
  }

  // ---------- Alert seminggu ----------
  const oneWeekBefore = new Date(nextUpdate.getTime() - 7*86400000);
  if (now >= oneWeekBefore && now < nextUpdate && !document.getElementById("aed-update-alert")) {
    const alertDiv = document.createElement("div");
    alertDiv.id = "aed-update-alert";
    alertDiv.setAttribute("data-nosnippet","true");
    alertDiv.style.cssText = "background:#fff3cd;color:#856404;padding:12px;border:1px solid #ffeeba;margin:15px 0;border-radius:6px;font-size:14px;text-align:center;";
    alertDiv.textContent = "⚠️ Konten ini akan direview segera (menjelang jadwal update).";
    if (h1El && h1El.parentNode) h1El.parentNode.insertBefore(alertDiv,h1El.nextSibling);
  }

  // ---------- PriceValidUntil & JSON-LD update ----------
  const until = dateModified + validityDays*86400000).toISOString().split("T")[0];
  const jsonldScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
  jsonldScripts.forEach(script=>{
    try{
      const parsed=JSON.parse(script.textContent.trim());
      const apply=obj=>{
        if(["Product","Service","Article","BlogPosting"].includes(obj["@type"])){
          if(obj["@type"]==="Product"||obj["@type"]==="Service"){
            if(!obj.offers) obj.offers={ "@type":"Offer" };
            obj.offers.priceValidUntil=until;
          }
          obj.dateModified=dateModified;
          obj.datePublished=datePublished;
        }
        for(const k in obj) if(typeof obj[k]==="object") apply(obj[k]);
      };
      if(Array.isArray(parsed)) parsed.forEach(apply);
      else apply(parsed);
      script.textContent=JSON.stringify(parsed,null,2);
    }catch{}
  });

  // ---------- Dashboard ----------
  const advice =
    finalType==="evergreen" ? "Konten bersifat evergreen — review tiap 9–12 bulan." :
    finalType==="semi-evergreen" ? "Konten semi-evergreen — periksa 3–6 bulan sekali." :
    "Konten cepat berubah — update tiap 1–3 bulan.";

  window.EvergreenDetectorResults = { resultType: finalType, validityDays, sections: sectionDetails, advice, dateModified, datePublished };

  (function showDashboard(){
    const renderDashboard=data=>{
      const wrap=document.createElement("div");
      wrap.id="EvergreenDashboard";
      wrap.style.cssText="max-width:1200px;margin:20px auto;padding:10px;background:#f8fbff;border-top:4px solid #0066cc;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.1);font-family:system-ui;overflow-x:auto;";
      wrap.innerHTML=`
        <h2 style="text-align:center;margin-bottom:10px;">🧩 Evergreen Content Report</h2>
        <p style="text-align:center;margin-bottom:15px;color:#444;">
          <b>Status Global:</b> ${data.resultType.toUpperCase()} |
          <b>Review:</b> ${data.validityDays} hari |
          <b>Terakhir Ubah:</b> ${data.dateModified}
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead style="position:sticky;top:0;background:#eaf3ff;z-index:1;">
            <tr>
              <th style="padding:8px;border:1px solid #ccc;">Bagian</th>
              <th style="padding:8px;border:1px solid #ccc;">Ever</th>
              <th style="padding:8px;border:1px solid #ccc;">Semi</th>
              <th style="padding:8px;border:1px solid #ccc;">Non</th>
              <th style="padding:8px;border:1px solid #ccc;">Status</th>
              <th style="padding:8px;border:1px solid #ccc;">Review (hari)</th>
              <th style="padding:8px;border:1px solid #ccc;">Saran</th>
            </tr>
          </thead>
          <tbody>
            ${data.sections.map(s=>`
              <tr>
                <td style="border:1px solid #ddd;padding:6px;">${s.section}</td>
                <td style="border:1px solid #ddd;padding:6px;text-align:center;">${s.sEver.toFixed(1)}</td>
                <td style="border:1px solid #ddd;padding:6px;text-align:center;">${s.sSemi.toFixed(1)}</td>
                <td style="border:1px solid #ddd;padding:6px;text-align:center;">${s.sNon.toFixed(1)}</td>
                <td style="border:1px solid #ddd;padding:6px;text-align:center;font-weight:bold;color:${
                  s.sectionType==="evergreen"?"#007700":
                  s.sectionType==="semi-evergreen"?"#cc8800":"#cc0000"
                };">${s.sectionType.toUpperCase()}</td>
                <td style="border:1px solid #ddd;padding:6px;text-align:center;">${s.validityDays}</td>
                <td style="border:1px solid #ddd;padding:6px;">${s.sectionAdvice}</td>
              </tr>`).join("")}
          </tbody>
        </table>
        <p style="text-align:center;margin-top:12px;">${data.advice}</p>
      `;
      const anchor=document.querySelector("#AEDDashboard");
      if(anchor&&anchor.parentNode) anchor.parentNode.insertBefore(wrap,anchor.nextSibling);
      else document.body.appendChild(wrap);
    };
    const waitForResults=()=>{window.EvergreenDetectorResults?renderDashboard(window.EvergreenDetectorResults):setTimeout(waitForResults,300);};
    waitForResults();
  })();

  console.log(`✅ [AED v8.6 Full] ${finalType.toUpperCase()} | Dashboard & JSON-LD updated`);
}

detectEvergreenFullDashboard();


//panggil fungsi shw dasboarrd
//showEvergreenDashboard();
  
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
