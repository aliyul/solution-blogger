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
    intervals: { EVERGREEN: 12, SEMI_EVERGREEN: 6, NON_EVERGREEN: 3 },
    updateJsonLd: true
  };

  // ===================== Helper =====================
  const qsMany = (sel)=>{for(const s of sel){const e=document.querySelector(s);if(e)return e;}return null;};
  const sampleTextFrom = e => e?(e.innerText||e.textContent||'').slice(0,CONFIG.checkLength).toLowerCase():'';
  const normalizeUrlToken = p => p ? p.split('/').filter(Boolean).pop()?.replace(/^p\//,'').replace(/\.html$/i,'')
    .replace(/\b(0?[1-9]|1[0-2]|20\d{2})\b/g,'').replace(/[-_]/g,' ').trim().toLowerCase()||'' : '';
  const makeHash = s => {try{return btoa(unescape(encodeURIComponent(s)));}catch{let h=0;for(let i=0;i<s.length;i++)h=(h<<5)-h+s.charCodeAt(i)|0;return String(h);}};
  const formatDate = d => d ? d.toLocaleDateString(CONFIG.locale,{day:'numeric',month:'long',year:'numeric'}) : null;
  const tokenize = s => s?.toLowerCase().replace(/[^\p{L}\p{N}\s\-]/gu,' ').replace(/\s+/g,' ').trim().split(' ').filter(Boolean)||[];
  const unique = a => Array.from(new Set(a));
  const clean = str => str.replace(/\s+/g,' ').trim().toLowerCase();

 // === Skor H1 ===
    const computeH1UrlScore=(h1,url)=>{
      const u=unique(tokenize(url)),h=unique(tokenize(h1));
      if(!u.length)return 100;
      const m=u.filter(t=>h.includes(t)),ratio=m.length/u.length;
      const bonus=h1.toLowerCase().startsWith(u[0]||'')?0.15:0;
      return Math.round(Math.min(1,ratio+bonus)*100);
    };
  
 // ===================== DETECTOR TERBARU =====================
/* pakai daftar keywod */

/*
function detectEvergreen(title, text, url) {
  let score = 0;
  const t = clean(title + " " + text); // gabungkan title + konten

  // ===================== KATEGORI =====================
const categories = {
  // ===================== POSITIF =====================
  // Material dan struktur bangunan
  materialStruktur: [
    "baja","beton","semen","pasir","agregat","papan","buis","gorong-gorong",
    "panel beton","u-ditch","box culvert","saluran beton","bata","batako",
    "keramik","cat","admixture","dynamix holcim","pionir tiga roda","beton ringan",
    "beton pracetak","precast","tiang pancang","pondasi","fondasi","balok","kolom",
    "slab","lattice girder","bekisting","cetak beton","plat lantai","tiang beton",
    "genteng","atap","kayu","konstruksi baja ringan"
  ],

  // Alat berat dan alat konstruksi
  alatBerat: [
    "excavator","bulldozer","crane","vibro roller","tandem roller","dump truck",
    "concrete mixer","pump beton","loader","grader","forklift","compactor",
    "road roller","scraper","backhoe","wheel loader","crawler crane","tower crane"
  ],

  // Produk beton dan ready mix
  produk: [
    "ready mix","jayamix","minimix","beton cor","beton siap pakai","precast",
    "panel beton","admixture","dynamix holcim","pionir tiga roda","sandwich panel",
    "u-ditch","box culvert","gorong-gorong","buis beton","panel pracetak",
    "slab precast","tiang pracetak","pondasi pracetak"
  ],

  // Umum + SEO + Informasi
  umum: [
    "harga","spesifikasi","ukuran","jenis","mutu","standar","komposisi",
    "update","terbaru","info lengkap","panduan","tutorial","cara","tips",
    "lokasi","kapasitas","volume","dimensi","kualitas","standar SNI",
    "instruksi","manual","review","evaluasi","estimasi biaya","perhitungan",
    "simulasi","kontraktor","jasa konstruksi","rencana pembangunan","proyek",
    "konstruksi jalan","konstruksi gedung","pembangunan rumah","pembangunan fasilitas",
    "beton cor Jayamix","ready mix Jayamix","harga ready mix","harga beton cor"
  ]
};

// ===================== NEGATIF RINGAN =====================
// Topik yang sifatnya sementara, lokasi spesifik, stok, harga harian, call-to-action ringan
const negRingan = [
  // Waktu terbatas
  "hari ini","minggu ini","bulan ini","harga per hari","diskon harian","promo terbatas","flash sale",
  // Stok & ketersediaan
  "stok","tersedia","tersedia sekarang","cek stok","pesan sekarang","pre-order","call","hotline","whatsapp","wa",
  // Lokasi spesifik (Indonesia)
  "bogor","bekasi","depok","jakarta","bandung","tangerang","karawang","serang","cilegon","subang","purwakarta","ciamis","tasikmalaya",
  // Kata terkait penawaran
  "harga khusus","promo","penawaran terbatas","diskon kecil","voucher","kode promo"
];

// ===================== NEGATIF KUAT =====================
// Topik yang cepat basi, event, berita, pengumuman, seminar, kontes, lowongan, dll
const negKuat = [
  // Berita dan event
  "berita","news","update harian","breaking news","tren terbaru","acara","event","seminar","konferensi","pengumuman","laporan","peringatan",
  // Penawaran agresif & iklan
  "diskon besar","flash sale","promo hari ini","super sale","hot deal","giveaway","kontes","lomba","undian","lowongan kerja","karir","rekrutmen",
  // Kata waktu relatif negatif
  "kemarin","besok","bulan lalu","tahun lalu","minggu lalu","hari lalu",
  // Konten sementara
  "peringatan","peringatan penting","urgent","terbatas","expiring","limited time","deadline","hanya hari ini","last chance"
];

  // ===================== HITUNG SKOR =====================
  // Positif berdasarkan kategori
  for (const cat in categories) {
    for (const kw of categories[cat]) {
      if (t.includes(kw)) score += 2;
    }
  }

  // Negatif ringan
  for (const kw of negRingan) {
    if (t.includes(kw)) score -= 1;
  }

  // Negatif kuat
  for (const kw of negKuat) {
    if (t.includes(kw)) score -= 2;
  }

  // Tambahan logika URL
  if (url.includes("/p/")) score += 2;
  if (/\/harga-|\/produk-|\/beton-|\/sewa-|\/readymix-/.test(url)) score += 1;
  if (/\/\d{4}\/\d{2}\//.test(url)) score -= 1;

  // Struktur paragraf
  const paraCount = (text.match(/\n/g) || []).length;
  if (paraCount > 8) score += 1;
  if (paraCount < 3) score -= 1;

  // ===================== STATUS =====================
  let status = "SEMI_EVERGREEN";
  if (score >= 5) status = "EVERGREEN";
  else if (score <= 0) status = "NON_EVERGREEN";

  return status;
}
*/

//DETEKKSI TANPA DAFTARR KKEYWORD
function cleanDEG(str) {
  return (str || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function tokenizeDEG(str) {
  return cleanDEG(str).split(/[\s\-_]/).filter(Boolean);
}

function detectEvergreen(title, text, url) {
  // ===================== UTILS =====================
  const cleanText = str => (str||'').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
  const tokenizeDEG = str => cleanText(str).split(' ').filter(Boolean);
  
  const t = cleanText(title + ' ' + text);
  const contentTokens = tokenizeDEG(t);
  const urlTokens = tokenizeDEG(url.split('/').pop()?.replace(/\.html$/i,'') || '');
  
  // ===================== SCORE =====================
  let score = 0;

  // 1️⃣ Relevansi konten ↔ URL
  let matchCount = 0;
  for(const ut of urlTokens){
    if(contentTokens.includes(ut)) matchCount++;
  }
  score += Math.min(matchCount, 3); // Maks +3

  // 2️⃣ Panjang konten mendukung
  if(t.length > 1500) score += 2; // konten detail

  // 3️⃣ Struktur paragraf
  const paraCount = (text.match(/\n/g)||[]).length;
  if(paraCount > 8) score += 1;
  if(paraCount < 3) score -= 1;

  // 4️⃣ Logika URL tambahan
  if(url.includes("/p/")) score += 2; // Pilar / halaman penting
  // Cek apakah URL relevan dengan kata di H1 + konten
  if(urlTokens.some(tk => contentTokens.includes(tk))) score += 1;
  // URL bertanggal cenderung NON evergreen
  if(/\/\d{4}\/\d{2}\//.test(url)) score -= 1;

  // 5️⃣ Kata temporal / spammy di konten (negatif ringan)
  const negLight = ["hari ini","minggu ini","bulan ini","harga per hari","stok","tersedia","pesan sekarang","diskon","promo","wa","whatsapp"];
  if(negLight.some(kw => t.includes(kw))) score -= 1;

  // 6️⃣ Kata berita / cepat basi (negatif kuat)
  const negStrong = ["berita","event","pengumuman","laporan","seminar","acara","konferensi","kemarin","besok","bulan lalu"];
  if(negStrong.some(kw => t.includes(kw))) score -= 2;

  // ===================== STATUS =====================
  let status = "SEMI_EVERGREEN"; // default
  if(score >= 5) status = "EVERGREEN";
  else if(score <= 0) status = "NON_EVERGREEN";

  return status;
}

  // ===================== CORE =====================
  try{
    const elC=qsMany(CONFIG.contentSelectors)||document.body;
    const elH1=qsMany(CONFIG.h1Selectors)||document.querySelector('h1');
    const h1R=elH1?elH1.innerText.trim():'(no h1)';
    const txt=sampleTextFrom(elC);
    const urlRaw=normalizeUrlToken(window.location.pathname);
    const isPillar=window.location.pathname.includes('/p/');
    const old=localStorage.getItem(CONFIG.storageKey);
    const hash=makeHash(h1R+'\n'+txt+'\n'+urlRaw);

    // === Deteksi Evergreen ===
    let type = detectEvergreen(h1R, txt, urlRaw);
    
    // Jika URL termasuk /p/, otomatis Evergreen (pillar page)
    if (isPillar) {
      type = 'EVERGREEN';
    } else {
      // Cek kecocokan H1 dengan URL bersih
     /* const h1Clean = h1R.toLowerCase().trim();
      const urlClean = urlRaw.toLowerCase().trim();
      const urlTokens = urlClean.split(' ').filter(Boolean);
      const h1MatchesUrl = urlTokens.every(tok => h1Clean.includes(tok));
    
      if (!h1MatchesUrl && type === 'EVERGREEN') {
        // Jika H1 tidak sesuai URL, downgrade ke Semi-Evergreen
        type = 'SEMI_EVERGREEN';
      }
    
      // Jika skor deteksi ≤ 0 → Non-Evergreen
      const score = computeH1UrlScore(h1R, urlRaw); // panggil fungsi skor
      if (score <= 0) type = 'NON_EVERGREEN';
      */
    }
    console.log("[detectEvergreen AI ✅]", type);
    // === Perhitungan tanggal update ===
    const next=new Date();let mod=null;
    const m=CONFIG.intervals[type];
    if(!old||old!==hash){
      next.setMonth(next.getMonth()+m);
      mod=new Date();
      localStorage.setItem(CONFIG.storageKey,hash);
      localStorage.setItem(CONFIG.storageKey+'_date',mod.toISOString());
    }else{
      const prev=localStorage.getItem(CONFIG.storageKey+'_date');
      mod=prev?new Date(prev):new Date();
      next.setMonth(mod.getMonth()+m);
    }
    const nextStr=formatDate(next), modStr=formatDate(mod);

    // === Label H1 ===
   // ==== Label Status Evergreen ====
  if (elH1) {
    // hapus label lama
    elH1.parentNode.querySelector('[' + CONFIG.labelAttr + ']')?.remove();
  
    const lb = document.createElement('div');
    lb.setAttribute(CONFIG.labelAttr, 'true');
    lb.setAttribute('data-nosnippet', 'true');
    lb.style.cssText =
      'font-size:.95em;color:#222;margin-top:6px;margin-bottom:12px;padding:6px 12px;background:#f9f9f9;border:1px solid #ccc;border-radius:5px;';
  
    // 🧩 Tentukan isi label berdasarkan hasil deteksi
    let labelText = '';
    if (type === 'EVERGREEN') {
      labelText = `<b>EVERGREEN</b> — pembaruan berikutnya: <b>${nextStr}</b>`;
      document.body.setAttribute('data-force', 'evergreen'); // tambahkan penanda
    } else if (type === 'SEMI_EVERGREEN') {
      labelText = `<b>SEMI-EVERGREEN</b> — disarankan update: <b>${nextStr}</b>`;
      document.body.setAttribute('data-force', 'semi-evergreen'); // tambahkan penanda
    } else if (type === 'NON_EVERGREEN') {
      labelText = `<b>NON_EVERGREEN</b> — disarankan update: <b>${nextStr}</b>`;
      document.body.setAttribute('data-force', 'semi-evergreen'); // tambahkan penanda
    } else {
      document.body.removeAttribute('data-force');
    }
  
    lb.innerHTML = labelText;
    elH1.insertAdjacentElement('afterend', lb);
  }

    const score=computeH1UrlScore(h1R,urlRaw);
    const sSug=urlRaw&&!h1R.toLowerCase().includes(urlRaw.split(' ')[0])?urlRaw+' '+h1R:null;
    const sLbl=score>=90?"Sangat Baik":score>=75?"Baik":score>=50?"Cukup":"Perlu Perbaikan";
//label score di bawah h1
/*
    const sEl=document.createElement('div');
    sEl.setAttribute('data-aed-h1score','true');
    sEl.setAttribute('data-nosnippet','true');
    sEl.style.cssText='font-size:.9em;color:#0b644b;margin-top:4px;margin-bottom:10px;padding:6px 10px;background:#f0fff7;border:1px solid #cfeee0;border-radius:6px;';
    sEl.innerHTML='<b>Skor H1 ↔ URL: '+score+'/100</b> — '+sLbl+
      (sSug?'<div style="margin-top:6px;color:#444;"><b>Rekomendasi H1:</b> '+sSug+'</div>':'<div style="margin-top:6px;color:#666;">H1 sudah sesuai.</div>');
    elH1.insertAdjacentElement('afterend',sEl);
*/
    // === Author Date ===
const aEl = document.querySelector(CONFIG.authorSelector);

// Hapus tanggal lama jika ada
aEl?.querySelector('.' + CONFIG.dateSpanClass)?.remove();

if (type === 'NON_EVERGREEN') {
  // Tampilkan di atas H1
  if (elH1) {
    const d = document.createElement('span');
    d.className = CONFIG.dateSpanClass;
    d.textContent = 'Diperbarui: ' + modStr;
    d.style.cssText = 'display:block;font-size:.85em;color:#d9534f;margin-bottom:4px;';
    d.setAttribute('data-nosnippet','true');
    elH1.parentNode.insertBefore(d, elH1);
  }
} else if (type === 'SEMI_EVERGREEN') {
  // Tampilkan sejajar author
  if (aEl && modStr) {
    const d = document.createElement('span');
    d.className = CONFIG.dateSpanClass;
    d.textContent = ' · Diperbarui: ' + modStr;
    d.style.cssText = 'font-size:.85em;color:#555;margin-left:6px;';
    d.setAttribute('data-nosnippet','true');
    aEl.appendChild(d);
  }
}
// Evergreen tidak tampil tanggal


    // === Dashboard ===
    const dash = document.createElement('div');
    dash.style.cssText = 'max-width:1200px;margin:30px auto;padding:15px;background:#f0f8ff;border-top:3px solid #0078ff;font-family:Arial,sans-serif;';
    dash.setAttribute('data-nosnippet', 'true');
    dash.setAttribute('id', 'AEDDashboard'); // ✅ Tambahkan ID


    const h3=document.createElement('h3');
    h3.innerText="📊 AED Ultra KMPTTF Dashboard — Ringkasan Halaman";
    dash.appendChild(h3);

    const btns=document.createElement('div');
    btns.style.textAlign='center';
    btns.style.marginBottom='10px';

    const mkB=(t,bg)=>{
      const x=document.createElement('button');
      x.textContent=t;x.style.background=bg;x.style.padding='6px 12px';
      x.style.margin='3px';x.style.border='none';x.style.borderRadius='4px';
      x.style.cursor='pointer';x.setAttribute('data-nosnippet','true');
      return x;
    };
    const koreksi=mkB("⚙️ Koreksi & Preview","#ffeedd"),
          show=mkB("📊 Tampilkan Data Table","#d1e7dd"),
          rep=mkB("📥 Download Laporan","#f3f3f3");
    btns.append(koreksi,show,rep);
    dash.appendChild(btns);

    const tbl=document.createElement('div');
    tbl.style.overflowX='auto';tbl.style.display='none';
    tbl.innerHTML='<table style="width:100%;border-collapse:collapse;min-width:1000px;font-size:.9em;">'+
    '<thead><tr><th>Halaman</th><th>Status Evergreen</th><th>Tanggal Diperbarui</th><th>H1</th><th>Skor</th><th>Rekom H1</th><th>Next Update</th></tr></thead>'+
    '<tbody><tr><td>'+document.title+'</td><td>'+type+'</td><td>'+(modStr||'—')+'</td><td>'+h1R+'</td><td>'+score+'/100</td><td>'+(sSug||'—')+'</td><td>'+nextStr+'</td></tr></tbody></table>';
    dash.appendChild(tbl);
    //(document.querySelector('main')||document.body).appendChild(dash);
     document.body.insertAdjacentElement('beforeend', dash);

    // === Tombol interaksi ===
    show.onclick=()=>tbl.style.display=tbl.style.display==='none'?'block':'none';
    koreksi.onclick=()=>alert('🔍 Koreksi & Preview\nStatus: '+type+'\nSkor H1: '+score+'/100\nTanggal Diperbarui: '+modStr+'\nNext Update: '+nextStr);
    rep.onclick=()=>{
      const rpt='AED Ultra KMPTTF REPORT — '+document.title+
      '\nStatus: '+type+'\nTanggal Diperbarui: '+modStr+'\nH1: '+h1R+
      '\nSkor: '+score+'/100\nNext Update: '+nextStr+'\nURL: '+location.href;
      const blob=new Blob([rpt],{type:'text/plain'});
      const a=document.createElement('a');
      a.href=URL.createObjectURL(blob);
      a.download='AED_Report_'+document.title.replace(/\s+/g,'_')+'.txt';
      a.click();
    };

    // === CSS Table ===
    const st=document.createElement('style');
    st.innerHTML='@media(max-width:768px){table th,td{padding:4px;font-size:.8em;}table{min-width:700px;}}table th,td{border:1px solid #ccc;padding:6px;text-align:left;}thead{background:#dff0ff;position:sticky;top:0;}';
    document.head.appendChild(st);

   
    console.log("✅ AED v8.3.2R Ultra KMPTTF aktif — Evergreen detector, data-force sync, dashboard fix.");
  }catch(e){console.error("❌ AED v8.3.2R Error:",e);}
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
(function detectEvergreenHybrid() {
  console.log("🧠 Running Smart Evergreen Detector v8.3.1 Precision Hybrid...");

  // ---------- Utilities ----------
  const nowISODate = (d = new Date()) => d.toISOString().split("T")[0];
  const clean = s => (s ? s.replace(/\s+/g, " ").trim() : "");
  const hashString = s => {
    // simple stable hash (32-bit)
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return (h >>> 0).toString(36);
  };
  const isJSONLDScript = el => el && el.tagName === "SCRIPT" && el.type === "application/ld+json";

  // ---------- Grab main elements & text ----------
  const h1 = clean(document.querySelector("h1")?.innerText || "").toLowerCase();
  const contentEl =
    document.querySelector(".post-body.entry-content") ||
    document.querySelector("[id^='post-body-']") ||
    document.querySelector(".post-body") ||
    document.querySelector("article") ||
    document.querySelector("main") ||
    document.body;
  const contentTextRaw = clean(contentEl ? contentEl.innerText : "");
  const contentText = (h1 + " " + contentTextRaw).toLowerCase();
  const words = contentText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // ---------- Patterns ----------
  const nonEvergreenPattern = /\b(update|terbaru|berita|jadwal|event|promo|diskon|progres|proyek|bulan\s?\d{4}|tahun\s?\d{4}|sementara|musiman|stok|kontrak|laporan|penawaran|info pasar|analisis pasar|fluktuasi|forecast|revisi|minggu\s?ini|hari\s?ini|flash sale)\b/;
  const semiEvergreenPattern = /\b(harga\s?(per\s?(m3|meter|hari|jam|unit)|sewa|jual|cor|tarif)?|sewa|rental|kontraktor|jasa|pembangunan|borongan|analisa harga satuan|estimasi biaya|kalkulasi|penyewaan|layanan|tarif|biaya|harga)\b/;
  const evergreenPattern = /\b(panduan|tutorial|tips|cara|definisi|strategi|langkah|prosedur|manfaat|fungsi|jenis|contoh|teknik|pengertian|kegunaan|struktur|standar|material|spesifikasi|apa itu|arti|perbedaan|konsep|metode|keunggulan|kelebihan|kekurangan|komponen|prinsip kerja|proses)\b/;

  const priceTokenPattern = /\b(harga|rp|per\s?(m3|m²|m2|meter|m|kubik|kubikasi|kubikasi|kubikasi|kubik|ton|unit|tarif|biaya|ongkos|harga mulai)\b)/i;

  // ---------- Section-based extraction (H2/H3 + paragraph grouping) ----------
  // Build sections array with title & aggregated content
  const sections = [];
  const headingSelector = "h2,h3";
  const headings = Array.from(contentEl.querySelectorAll(headingSelector));
  if (headings.length === 0) {
    // fallback: treat whole content as single section
    sections.push({ title: h1 || "artikel", content: contentTextRaw });
  } else {
    // iterate headings and gather following siblings until next heading of same/higher level
    for (let i = 0; i < headings.length; i++) {
      const head = headings[i];
      const title = clean(head.innerText || "");
      let cur = head.nextElementSibling;
      let body = "";
      while (cur && !(cur.matches && cur.matches(headingSelector))) {
        if (cur.innerText) body += "\n" + clean(cur.innerText);
        cur = cur.nextElementSibling;
      }
      sections.push({ title, content: body || "" });
    }
  }

  // also compute counts: paragraphs, lists, tables
  const paragraphs = Array.from(contentEl.querySelectorAll("p")).map(p => clean(p.innerText || ""));
  const paragraphCount = paragraphs.filter(p => p.length > 50).length;
  const listCount = (contentEl.querySelectorAll("ol, ul") || []).length;
  const tableCount = (contentEl.querySelectorAll("table") || []).length;

  // ---------- Per-section scoring ----------
  let sectionScores = { evergreen: 0, semi: 0, non: 0 };
  const sectionDetails = sections.map(sec => {
    const title = sec.title.toLowerCase();
    const body = sec.content.toLowerCase();
    const combined = (title + " " + body).replace(/\s+/g, " ");
    let sEver = 0, sSemi = 0, sNon = 0;

    // title weighting stronger
    if (evergreenPattern.test(title)) sEver += 2;
    if (semiEvergreenPattern.test(title)) sSemi += 2;
    if (nonEvergreenPattern.test(title)) sNon += 1.5;

    // body checks (weaker)
    if (evergreenPattern.test(body)) sEver += (body.match(evergreenPattern) || []).length * 0.8;
    if (semiEvergreenPattern.test(body)) sSemi += (body.match(semiEvergreenPattern) || []).length * 0.9;
    if (nonEvergreenPattern.test(body)) sNon += (body.match(nonEvergreenPattern) || []).length * 1;

    // price-local detection for the section
    const hasPriceTokens = priceTokenPattern.test(combined);
    if (hasPriceTokens) sSemi += 1.5; // price tokens bias toward semi

    // aggregate
    sectionScores.evergreen += sEver;
    sectionScores.semi += sSemi;
    sectionScores.non += sNon;

    return {
      title: sec.title,
      hasPriceTokens,
      sEver, sSemi, sNon,
      summary: combined.slice(0, 180)
    };
  });

  // ---------- Aggregate scoring & heuristics ----------
  let evergreenScore =
    sectionScores.evergreen * 2 +
    sectionScores.semi * 1 +
    paragraphCount * 0.6 +
    listCount * 0.5 -
    tableCount * 0.8;

  if (wordCount > 800) evergreenScore += 2;
  if (wordCount > 1500) evergreenScore += 2;

  // time-sensitivity detection (global)
  const hasTimePattern = /\b(20\d{2}|harga\s?bulan|update|promo|diskon|deadline|agenda|sementara|terbaru|minggu|bulan|hari\s?ini|minggu\s?ini|q[1-4]|kuartal)\b/.test(contentText);

  // initial result decision based on section dominance
  let resultType = "semi-evergreen";
  if (sectionScores.non > sectionScores.semi && sectionScores.non > sectionScores.evergreen) {
    resultType = "non-evergreen";
  } else if (sectionScores.evergreen > sectionScores.semi + 2 && evergreenScore > 6 && !hasTimePattern) {
    resultType = "evergreen";
  } else if (sectionScores.semi >= sectionScores.evergreen) {
    resultType = "semi-evergreen";
  }

  // final corrections
  if (resultType === "semi-evergreen" && evergreenScore >= 7 && !hasTimePattern) resultType = "evergreen";
  if (resultType === "evergreen" && hasTimePattern && evergreenScore <= 3) resultType = "semi-evergreen";
  if (resultType === "semi-evergreen" && hasTimePattern && evergreenScore < 2) resultType = "non-evergreen";

  // ---------- Hash-check for content change (dateModified control) ----------
  const pageKey = "aed_hash_" + location.pathname;
  const adviceKey = "aed_advicehash_" + location.pathname;
  const currentHash = hashString(h1 + "||" + contentText.slice(0, 20000)); // limit for hashing performance
  const prevHash = localStorage.getItem(pageKey);

  let shouldUpdateDate = false;
  if (!prevHash) {
    localStorage.setItem(pageKey, currentHash);
    shouldUpdateDate = true;
    // first time we consider as updated so that dateModified exists
  } else if (prevHash !== currentHash) {
    shouldUpdateDate = true;
    localStorage.setItem(pageKey, currentHash);
  }

  // ---------- Determine price-validity days based on final result ----------
  const validityDaysByType = { "evergreen": 365, "semi-evergreen": 180, "non-evergreen": 90 };
  const validityDays = validityDaysByType[resultType] || 90;

  // ---------- Update meta[itemprop="dateModified"] if needed ----------
  const nowDate = nowISODate();
  const metaDateEl = document.querySelector('meta[itemprop="dateModified"]');
  if (shouldUpdateDate) {
    if (metaDateEl) {
      metaDateEl.setAttribute("content", new Date().toISOString());
    } else {
      // create meta tag with full ISO
      const m = document.createElement("meta");
      m.setAttribute("itemprop", "dateModified");
      m.setAttribute("content", new Date().toISOString());
      document.head.appendChild(m);
    }
  }

  // ---------- JSON-LD Sync: update Article/BlogPosting dateModified and Product/Service priceValidUntil ----------
  const jsonldScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
  jsonldScripts.forEach(script => {
    if (!script || !script.textContent) return;
    try {
      // JSON-LD could be an array or object
      const raw = script.textContent.trim();
      const parsed = JSON.parse(raw);
      const nowISOFull = new Date().toISOString();

      const applyToObject = obj => {
        if (!obj || typeof obj !== "object") return;
        const type = obj["@type"] || obj["@type"] && obj["@type"][0];
        // Normalize type to string if array
        const t = Array.isArray(obj["@type"]) ? obj["@type"][0] : obj["@type"];

        if (!t) return;

        const ttl = t.toLowerCase();
        if (ttl === "article" || ttl === "blogposting" || ttl === "newsarticle") {
          // update dateModified only when shouldUpdateDate true
          if (shouldUpdateDate) obj.dateModified = nowISOFull;
        }

        // Product or Service => update offers.priceValidUntil if price section exists
        if (ttl === "product" || ttl === "service") {
          // detect presence of price-related section globally and locally
          const hasPriceGlobal = priceTokenPattern.test(contentText);
          // additional: check if any section explicitly contains price tokens
          const hasPriceSection = sectionDetails.some(s => s.hasPriceTokens);
          if (hasPriceGlobal || hasPriceSection) {
            const days = validityDays;
            const until = new Date(Date.now() + days * 86400000).toISOString().split("T")[0];
            if (obj.offers) {
              if (Array.isArray(obj.offers)) {
                obj.offers.forEach(o => { if (o) o.priceValidUntil = until; });
              } else {
                obj.offers.priceValidUntil = until;
              }
            } else {
              // create minimal offers structure to include priceValidUntil
              obj.offers = { "@type": "Offer", priceValidUntil: until };
            }
          }
        }

        // If object contains nested graph or itemListElement etc, attempt to recurse
        for (const k in obj) {
          if (obj.hasOwnProperty(k) && typeof obj[k] === "object") {
            // avoid infinite recursion by simple depth guard not necessary here, small JSON-LD typical
            applyToObject(obj[k]);
          }
        }
      };

      if (Array.isArray(parsed)) {
        parsed.forEach(entry => applyToObject(entry));
      } else {
        applyToObject(parsed);
      }

      // write back updated jsonld
      script.textContent = JSON.stringify(parsed, null, 2);
    } catch (e) {
      // ignore invalid JSON-LD
      // console.warn("AED v8.3.1: failed to parse JSON-LD", e);
    }
  });

  // ---------- Advice generation (optional) ----------
  const generateAdviceForType = (type) => {
    const adv = [];
    if (type === "non-evergreen") adv.push("Konten bersifat time-sensitive — review & perbarui tiap 1-3 bulan.");
    if (type === "semi-evergreen") adv.push("Konten semi-evergreen — review tiap 3-6 bulan atau bila ada perubahan harga signifikan.");
    if (type === "evergreen") adv.push("Konten evergreen — review berkala 9-12 bulan.");
    if (sectionDetails.some(s => s.hasPriceTokens)) adv.push("Bagian harga terdeteksi — pastikan angka & satuan jelas (Rp, per m³, per unit).");
    return adv.join(" ");
  };
  const adviceText = generateAdviceForType(resultType);
  const adviceHash = hashString(adviceText);

  // compare stored advice hash for changes (so we can also use it as trigger)
  const prevAdviceHash = localStorage.getItem(adviceKey);
  let adviceChanged = false;
  if (!prevAdviceHash || prevAdviceHash !== adviceHash) {
    localStorage.setItem(adviceKey, adviceHash);
    adviceChanged = true;
  }

  // If advice changed but content didn't, we may still want to update dateModified (optional policy)
  if (adviceChanged && !shouldUpdateDate) {
    // treat advice change as mild update: update meta dateModified too
    if (metaDateEl) metaDateEl.setAttribute("content", new Date().toISOString());
    else {
      const m = document.createElement("meta");
      m.setAttribute("itemprop", "dateModified");
      m.setAttribute("content", new Date().toISOString());
      document.head.appendChild(m);
    }
  }

  // ---------- Final log + export ----------
  const logColor = resultType === "evergreen" ? "color:green" : resultType === "semi-evergreen" ? "color:orange" : "color:red";
  console.log(`%c[AED v8.3.1] Type: ${resultType.toUpperCase()} | Score: ${evergreenScore.toFixed(2)} | Words: ${wordCount} | PriceValidityDays: ${validityDays}`, logColor);
  console.log("Section summary:", sectionDetails.map(s => ({ title: s.title, price: s.hasPriceTokens, sEver: s.sEver, sSemi: s.sSemi, sNon: s.sNon })));
  console.log("Advice:", adviceText);

  // expose results to window for dashboard / external scripts
  window.EvergreenDetectorResults = {
    generatedAt: new Date().toISOString(),
    resultType,
    evergreenScore,
    wordCount,
    paragraphCount,
    listCount,
    tableCount,
    validityDays,
    sections: sectionDetails,
    advice: adviceText,
    contentHash: currentHash,
    adviceHash,
    updatedDateModified: shouldUpdateDate || adviceChanged ? new Date().toISOString() : null
  };

  return window.EvergreenDetectorResults;
})();
  
//panggil fungsi detect nya
detectEvergreenHybrid();
/* ============================================================
   📊 Evergreen Dashboard v8.1 — UI Terpisah
   ============================================================ */
(function showEvergreenDashboard() {
  console.log("📊 Menampilkan Dashboard Evergreen...");

  // Tunggu hasil core siap
  function waitForResults() {
    if (window.EvergreenDetectorResults && window.EvergreenDetectorResults.results) {
      renderDashboard(window.EvergreenDetectorResults);
    } else {
      setTimeout(waitForResults, 300);
    }
  }

  function renderDashboard(data) {
    const dash = document.createElement("div");
    dash.id = "EvergreenDashboard";
    dash.style.cssText = `
      max-width:1200px;margin:40px auto;padding:15px;
      background:#f8fbff;border-top:4px solid #0066cc;
      border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.1);
      font-family:system-ui;
    `;

    dash.innerHTML = `
      <h2 style="text-align:center;margin-bottom:10px;">🧩 Evergreen Content Report</h2>
      <p style="text-align:center;margin-bottom:20px;color:#444;">
        <b>Date Published:</b> ${data.datePublished || '-'} |
        <b>Last Modified:</b> ${data.dateModified || '-'}
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:15px;">
        <thead>
          <tr style="background:#eaf3ff;">
            <th style="padding:8px;border:1px solid #ccc;">Bagian</th>
            <th style="padding:8px;border:1px solid #ccc;">Tipe</th>
            <th style="padding:8px;border:1px solid #ccc;">Saran Update</th>
          </tr>
        </thead>
        <tbody>
          ${data.results.map(r=>`
            <tr>
              <td style="border:1px solid #ddd;padding:6px;"><b>${r.section}</b></td>
              <td style="border:1px solid #ddd;padding:6px;text-align:center;">${r.type}</td>
              <td style="border:1px solid #ddd;padding:6px;color:#333;">${r.advice||'-'}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
 // === Tempatkan di bawah elemen ID #AEDDashboard ===
  const footerArea = document.querySelector("#AEDDashboard");
  if (footerArea && footerArea.parentNode) {
    footerArea.parentNode.insertBefore(wrap, footerArea.nextSibling);
    console.log("✅ Dashboard Evergreen tampil di bawah #AEDDashboard");
  } else {
    document.body.appendChild(wrap);
    console.warn("⚠️ #AEDDashboard tidak ditemukan, dashboard ditempatkan di akhir body.");
  }
    
  waitForResults();
})();
//panggil fungsi shw dasboarrd
showEvergreenDashboard();
  
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
