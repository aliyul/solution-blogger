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
/* ga perlu lagi karna udah di seting ke perubahan yg penting saja
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
      const h1Clean = h1R.toLowerCase().trim();
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
    }

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
    const dash=document.createElement('div');
    dash.style.cssText='max-width:1200px;margin:30px auto;padding:15px;background:#f0f8ff;border-top:3px solid #0078ff;font-family:Arial,sans-serif;';
    dash.setAttribute('data-nosnippet','true');

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
(function runEvergreenDetector() {
  console.log("🔍 Running Smart Selective Evergreen Detector v8.0 UltraKMPTTF TrueSection Fix...");

  // === Inject responsive CSS ===
  const style = document.createElement("style");
  style.textContent = `
  [data-nosnippet]{overflow-x:auto;-webkit-overflow-scrolling:touch;}
  [data-nosnippet] table{width:100%;border-collapse:collapse;min-width:700px;}
  [data-nosnippet] th,[data-nosnippet] td{border:1px solid #ddd;padding:8px;text-align:left;vertical-align:top;}
  [data-nosnippet] thead{position:sticky;top:0;background:#f9fcff;z-index:5;}
  [data-nosnippet] tr:nth-child(even){background:#fafafa;}
  .score-green{background:#d4f7d4;color:#000;font-weight:bold;}
  .score-orange{background:#fff4d1;color:#000;font-weight:bold;}
  .score-red{background:#ffd6d6;color:#000;font-weight:bold;}
  @media(max-width:768px){
    [data-nosnippet] table{min-width:600px;}
    [data-nosnippet] td{font-size:13px;word-break:break-word;}
    [data-nosnippet] button{width:100%;margin-top:10px;}
  }`;
  document.head.appendChild(style);

  // === Utils ===
  const cleanText = s => s ? s.replace(/\s+/g," ").trim() : "";
  const hashString = s => { let h=0; for(let i=0;i<s.length;i++){h=(h<<5)-h+s.charCodeAt(i);h|=0;} return h; };
  const convertToWIB = iso => iso ? new Date(new Date(iso).getTime()+7*60*60*1000).toISOString().split("T")[0] : "";

  // === Deteksi halaman pillar ===
  const isPillar = document.body.dataset.pillar==="true" || /pillar|cornerstone|\/p\//.test(location.pathname.toLowerCase());

  // === Ambil konten utama ===
  const contentRoot = document.querySelector("article") || document.querySelector(".post-body") || document.querySelector("main") || document.body;

  // === Hash Global ===
  const contentText = cleanText(contentRoot.innerText);
  const globalHash = hashString(contentText);
  localStorage.setItem("globalHash_"+location.pathname, globalHash);

  // === Meta datePublished & dateModified ===
  let datePublished = convertToWIB(document.querySelector("meta[itemprop='datePublished']")?.content) || "";
  let dateModified = convertToWIB(document.querySelector("meta[itemprop='dateModified']")?.content) || datePublished;

  // === Ambil section H2/H3 ===
  const sections = [];
  let current=null;
  contentRoot.querySelectorAll("h2,h3").forEach(h=>{
    if(h.tagName==="H2"){
      if(current) sections.push(current);
      current={title:cleanText(h.innerText),content:""};
    } else if(h.tagName==="H3" && current){
      current.content+="\n"+cleanText(h.innerText);
    }
    let next=h.nextElementSibling;
    while(next && !/^H[23]$/i.test(next.tagName)){
      if(next.innerText && current) current.content+="\n"+cleanText(next.innerText);
      next=next.nextElementSibling;
    }
  });
  if(current) sections.push(current);

  // === Daftar kata acuan ===
  const evergreenWords=["panduan","tutorial","cara","manfaat","pengertian","definisi","apa itu","tips","trik","panduan lengkap","langkah-langkah","studi kasus","contoh nyata","best practice","checklist","strategi","tips lanjutan","faq","pertanyaan umum"];
  const semiWords=["harga","lokasi","layanan","pengiriman","wilayah","area","order","pesan","update harga","harga terbaru","pesan sekarang","wilayah pengiriman","biaya","tarif","estimasi","ongkir","spesifikasi","fitur","jenis","keunggulan"];
  const nonWords=["promo","diskon","event","penawaran","perdana","periode","terbaru","update","spesial","promo akhir tahun","penawaran terbatas","stok terbatas","preorder","flash sale","2020","2021","2022","2023","2024","2025","2026","2027","2028"];

  // === Deteksi tipe konten per-section (prioritas dinamis) ===
  const detectType = (title, content) => {
    if(isPillar) return "EVERGREEN";
    const txt = (title + " " + content).toLowerCase();

    const score = {evergreen:0, semi:0, non:0};
    evergreenWords.forEach(w=>{ if(txt.includes(w)) score.evergreen++; });
    semiWords.forEach(w=>{ if(txt.includes(w)) score.semi++; });
    nonWords.forEach(w=>{ if(txt.includes(w)) score.non++; });

    // 💡 Prioritas: EVERGREEN > SEMI > NON kecuali NON jauh lebih kuat
    if(score.non > (score.evergreen + score.semi + 1)) return "NON-EVERGREEN";
    if(score.evergreen >= score.semi) return "EVERGREEN";
    if(score.semi > score.evergreen) return "SEMI-EVERGREEN";
    return "EVERGREEN";
  };

  // === Generator Saran ===
  const generateAdvice=(txt,type,length,isLast)=>{
    const adv=[];
    if(/harga|biaya|tarif/.test(txt)) adv.push("Perbarui harga & tarif secara berkala");
    if(/spesifikasi|fitur|ukuran/.test(txt)) adv.push("Periksa & update spesifikasi terbaru");
    if(/manfaat|fungsi|keunggulan/.test(txt)) adv.push("Tambahkan contoh nyata penerapan");
    if(/video|gambar|foto|diagram|chart/.test(txt)) adv.push("Sertakan media visual agar lebih menarik");
    if(length<400) adv.push("Perluas konten agar lebih lengkap dan komprehensif");
    if(!/faq|pertanyaan/.test(txt)&&isLast) adv.push("Tambahkan FAQ atau pertanyaan umum di akhir");
    if(type==="NON-EVERGREEN") adv.push("Periksa update rutin untuk menjaga akurasi informasi");
    if(type==="SEMI-EVERGREEN") adv.push("Lakukan review berkala tiap 3-6 bulan");
    return adv.length?adv.join(". ") + ".":"Konten stabil, review ringan cukup.";
  };

  const calculateSEOScore = txt=>{
    const c=cleanText(txt.toLowerCase());
    const h1=cleanText(document.querySelector("h1")?.innerText||"").toLowerCase();
    const h2h3=Array.from(document.querySelectorAll("h2,h3")).map(h=>cleanText(h.innerText)).join(" ");
    const meta=(document.querySelector("meta[name='keywords']")?.content||"").toLowerCase();
    const words=c.split(/\s+/).length;
    const keys=Array.from(new Set((h1+" "+h2h3+" "+meta).split(/\s+/).filter(Boolean)));
    let hits=0; keys.forEach(k=>{const re=new RegExp("\\b"+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+"\\b","gi");hits+=(c.match(re)||[]).length;});
    const density=words?hits/words:0;
    return Math.max(0,Math.min(100,Math.round(50+density*30+Math.min(20,words/50))));
  };

  const calculateReadability = txt=>{
    const s=txt.split(/[.!?]/).filter(x=>x.trim().length>0).length||1;
    const w=txt.split(/\s+/).length;
    return Math.round(Math.max(0,100-Math.abs((w/s)-15)*5));
  };
  const scoreColor = n => n>=80?"score-green":n>=50?"score-orange":"score-red";

  // === Audit per-section ===
  const h1=cleanText(document.querySelector("h1")?.innerText||"");
  const h1Mismatch=isPillar && !location.pathname.toLowerCase().includes(h1.toLowerCase().replace(/\s+/g,"-"));
  const results=[];
  sections.forEach((sec,i)=>{
    const type=detectType(sec.title,sec.content);
    const hash=hashString(sec.title+" "+sec.content);
    const key=`sec_hash_${i}_${location.pathname}`;
    const old=localStorage.getItem(key);
    const changed=old && old!==String(hash);
    localStorage.setItem(key,hash);
    const months=type==="EVERGREEN"?12:type==="SEMI-EVERGREEN"?6:3;
    const next=new Date();next.setMonth(next.getMonth()+months);
    const txt=sec.content.toLowerCase();
    const advice=generateAdvice(txt,type,txt.length,i===sections.length-1);
    const seoScore=calculateSEOScore(txt);
    const readability=calculateReadability(txt);
    results.push({section:sec.title||"(Tanpa Judul)",type,changed,nextUpdate:next.toLocaleDateString(),advice,seoScore,readability});
  });

  // === Render Dashboard (di bawah halaman, SEO-safe)
  const wrap=document.createElement("div");
  wrap.setAttribute("data-nosnippet","true");
  wrap.style="margin-top:30px;padding:10px;border:1px solid #ccc;border-radius:8px;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,0.1);";

  const table=document.createElement("table");
  table.innerHTML=`
  <thead><tr><th>Section</th><th>Tipe</th><th>Perubahan</th><th>Next Update</th><th>Saran</th><th>SEO</th><th>Readability</th></tr></thead>
  <tbody>${results.map(r=>`
  <tr style="background:${r.type==="EVERGREEN"?"#e8fce8":r.type==="SEMI-EVERGREEN"?"#fff5e0":"#ffeaea"}">
  <td>${r.section}</td><td><b>${r.type}</b></td><td>${r.changed?"✅":"–"}</td><td>${r.nextUpdate}</td><td>${r.advice}</td>
  <td class="${scoreColor(r.seoScore)}">${r.seoScore}</td><td class="${scoreColor(r.readability)}">${r.readability}</td></tr>`).join("")}
  </tbody>`;
  wrap.appendChild(table);

  const info=document.createElement("div");
  info.style.fontSize="13px";
  info.style.marginTop="8px";
  info.textContent=`📅 Published: ${datePublished||"-"} | Last Modified: ${dateModified}${h1Mismatch?" ⚠ H1 tidak cocok URL.":""}`;
  wrap.appendChild(info);

  const btn=document.createElement("button");
  btn.textContent="🔄 Deteksi Ulang";
  Object.assign(btn.style,{marginTop:"10px",padding:"8px 14px",background:"#007bff",color:"#fff",border:"none",borderRadius:"6px",cursor:"pointer"});
  btn.onclick=()=>{wrap.remove();runEvergreenDetector();};
  wrap.appendChild(btn);

  // === Tempatkan di luar konten utama (SEO-safe)
  const footerArea=document.querySelector("footer")||document.querySelector("#footer-wrapper");
  if(footerArea&&footerArea.parentNode){footerArea.parentNode.insertBefore(wrap,footerArea);}
  else{document.body.appendChild(wrap);}

  console.log("✅ AED v8.0 UltraKMPTTF TrueSection Fix selesai");
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
