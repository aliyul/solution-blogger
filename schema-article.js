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
    (document.querySelector('main')||document.body).appendChild(dash);

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
(function runEvergreenDetector() {
  console.log("🔍 Running Smart Selective Evergreen Detector v8.1 UltraKMPTTF TrueSection+SchemaSync...");

  // === Utility ===
  const cleanText = s => s ? s.replace(/\s+/g, " ").trim() : "";
  const hashString = s => { let h=0; for(let i=0;i<s.length;i++){h=(h<<5)-h+s.charCodeAt(i);h|=0;} return h; };
  const convertToWIB = iso => iso ? new Date(new Date(iso).getTime()+7*60*60*1000).toISOString().split("T")[0] : "";

  // === Ambil konten utama ===
  const contentEl = document.querySelector(".post-body.entry-content") || 
                    document.querySelector("[id^='post-body-']") || 
                    document.querySelector(".post-body") ||
                    document.querySelector("article") ||
                    document.querySelector("main");
  const contentText = contentEl ? cleanText(contentEl.innerText) : "";

  // === Ambil meta tanggal awal ===
  let datePublished = convertToWIB(document.querySelector("meta[itemprop='datePublished']")?.content) || "";
  let dateModified  = convertToWIB(document.querySelector("meta[itemprop='dateModified']")?.content) || datePublished;

  // === Deteksi hash global ===
  const currentHash = hashString(contentText);
  const oldHash = localStorage.getItem("articleHash_"+location.pathname);

  let shouldUpdateDate = false;

  if (!oldHash) {
    localStorage.setItem("articleHash_"+location.pathname, currentHash);
    console.log("🆕 Hash pertama kali disimpan");
  } else if (oldHash !== String(currentHash)) {
    console.log("📄 Konten berubah → kandidat update dateModified");
    shouldUpdateDate = true;
    localStorage.setItem("articleHash_"+location.pathname, currentHash);
  } else {
    console.log("✅ Tidak ada perubahan konten utama → dateModified tetap");
  }

  // === Deteksi perubahan saran per-section ===
  const evergreenWords=["panduan","tutorial","cara","manfaat","pengertian","definisi","tips","langkah","strategi"];
  const semiWords=["harga","biaya","tarif","spesifikasi","fitur","keunggulan","jenis","order"];
  const nonWords=["promo","diskon","event","penawaran","stok","flash sale"];

  const sections=[];
  let current=null;
  contentEl.querySelectorAll("h2,h3").forEach(h=>{
    if(h.tagName==="H2"){ if(current) sections.push(current); current={title:cleanText(h.innerText),content:""}; }
    else if(h.tagName==="H3" && current){ current.content+="\n"+cleanText(h.innerText); }
    let next=h.nextElementSibling;
    while(next && !/^H[23]$/i.test(next.tagName)){
      if(next.innerText && current) current.content+="\n"+cleanText(next.innerText);
      next=next.nextElementSibling;
    }
  });
  if(current) sections.push(current);

  const detectType=(title,content)=>{
    const txt=(title+" "+content).toLowerCase();
    const score={evergreen:0,semi:0,non:0};
    evergreenWords.forEach(w=>{if(txt.includes(w))score.evergreen++;});
    semiWords.forEach(w=>{if(txt.includes(w))score.semi++;});
    nonWords.forEach(w=>{if(txt.includes(w))score.non++;});
    if(score.non>(score.evergreen+score.semi))return"NON-EVERGREEN";
    if(score.semi>score.evergreen)return"SEMI-EVERGREEN";
    return"EVERGREEN";
  };

  const generateAdvice=(txt,type)=>{
    const adv=[];
    if(/harga|biaya|tarif/.test(txt)) adv.push("Perbarui harga & tarif secara berkala");
    if(/spesifikasi|fitur|ukuran/.test(txt)) adv.push("Periksa spesifikasi terbaru");
    if(/manfaat|fungsi/.test(txt)) adv.push("Tambahkan contoh penerapan");
    if(type==="SEMI-EVERGREEN") adv.push("Lakukan review tiap 3-6 bulan");
    if(type==="NON-EVERGREEN") adv.push("Periksa update rutin bulanan");
    return adv.join(". ");
  };

  const results=[];
  sections.forEach(s=>{
    const type=detectType(s.title,s.content);
    const adv=generateAdvice(s.content.toLowerCase(),type);
    results.push({section:s.title,type,advice:adv});
  });

  // === Cek perubahan saran dari hasil analisis ===
  let adviceChanged=false;
  try{
    const oldAdviceHash=localStorage.getItem("adviceHash_"+location.pathname);
    const currentAdviceText=results.map(r=>r.advice).join("|");
    const currentAdviceHash=hashString(currentAdviceText);
    if(oldAdviceHash && oldAdviceHash!==String(currentAdviceHash)){
      console.log("💡 Ada saran update baru → kandidat update dateModified");
      adviceChanged=true;
    }
    localStorage.setItem("adviceHash_"+location.pathname,currentAdviceHash);
  }catch(e){console.warn("⚠ Gagal bandingkan saran:",e);}

  // === Tentukan final dateModified ===
  if(shouldUpdateDate || adviceChanged){
    const nowISO=new Date().toISOString();
    dateModified=convertToWIB(nowISO);
    console.log("🕒 dateModified diperbarui:", dateModified);

    // Update <meta itemprop="dateModified">
    let metaMod=document.querySelector("meta[itemprop='dateModified']");
    if(!metaMod){
      metaMod=document.createElement("meta");
      metaMod.setAttribute("itemprop","dateModified");
      document.head.appendChild(metaMod);
    }
    metaMod.content=nowISO;

    // === Update JSON-LD Article Schema ===
    document.querySelectorAll('script[type="application/ld+json"]').forEach(el=>{
      try{
        const data=JSON.parse(el.textContent);
        if(data["@type"]==="Article"||data["@type"]==="NewsArticle"||data["@type"]==="BlogPosting"){
          data.dateModified=nowISO;
          if(!data.datePublished) data.datePublished=datePublished?new Date(datePublished).toISOString():nowISO;
          el.textContent=JSON.stringify(data,null,2);
          console.log("📘 Schema Article diperbarui otomatis");
        }

        // === Jika schema adalah Product ===
        if(data["@type"]==="Product" && data.offers){
          const txtLower=contentText.toLowerCase();
          if(/harga|biaya|tarif/.test(txtLower)){
            // Sesuaikan masa berlaku harga berdasar tipe konten
            const typeDominant=results.some(r=>r.type==="SEMI-EVERGREEN")?"SEMI":"EVERGREEN";
            const now=new Date();
            if(typeDominant==="SEMI"){ now.setMonth(now.getMonth()+6); } 
            else { now.setFullYear(now.getFullYear()+1); }
            const untilISO=now.toISOString().split("T")[0];
            if(Array.isArray(data.offers)){
              data.offers.forEach(o=>o.priceValidUntil=untilISO);
            } else {
              data.offers.priceValidUntil=untilISO;
            }
            el.textContent=JSON.stringify(data,null,2);
            console.log("💰 Product schema PriceValidUntil diupdate:", untilISO);
          }
        }
      }catch(e){/* skip invalid JSON-LD */}
    });

  } else {
    console.log("🔁 Tidak ada perubahan signifikan → dateModified tetap:", dateModified);
  }

  console.log("✅ AED v8.1 UltraKMPTTF TrueSection+SchemaSync selesai");

   window.EvergreenResults = {
    dateModified,
    datePublished,
    results
  }; // <— disediakan agar dashboard bisa ambil datanya
})();

/* ============================================================
   📊 Evergreen Dashboard v8.1 — UI Terpisah
   ============================================================ */
(function showEvergreenDashboard() {
  console.log("📊 Menampilkan Dashboard Evergreen...");

  // Tunggu hasil core siap
  function waitForResults() {
    if (window.EvergreenResults && window.EvergreenResults.results) {
      renderDashboard(window.EvergreenResults);
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

    document.body.appendChild(dash);
    console.log("✅ Dashboard Evergreen tampil di halaman");
  }

  waitForResults();
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
