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
(function AutoEvergreenV77Pillar(window, document) {
  'use strict';

  const CONFIG = {
    storageKey: 'AutoEvergreenHashV7_7_Pillar',
    labelAttr: 'data-aed-label',
    dateSpanClass: 'aed-date-span',
    checkLength: 4000,
    locale: 'id-ID',
    contentSelectors: ['article', 'main', '.post-body', '.entry-content', '#content'],
    h1Selectors: ['h1', '.entry-title'],
    authorSelector: '.post-author .fn, .author vcard, .byline',
    intervals: { EVERGREEN: 12, SEMI_EVERGREEN: 6, NON_EVERGREEN: 3 },
    const evergreenKeywords = [
  "panduan", "tutorial", "cara", "manfaat", "pengertian", "definisi", "apa itu",
  "tips", "trik", "panduan lengkap", "langkah-langkah", "praktik terbaik",
  "strategi", "studi kasus", "contoh", "referensi", "panduan SEO", "petunjuk",
  "instruksi", "tutorial video", "tutorial lengkap", "tips lanjutan", "cara efektif",
  "solusi", "teknik", "panduan praktis", "panduan langkah demi langkah"
];

const semiKeywords = [
  "harga", "lokasi", "layanan", "pengiriman", "wilayah", "area", "order", "pesan",
  "update harga", "harga terbaru", "pesan sekarang", "wilayah pengiriman", "biaya",
  "tarif", "estimasi", "ongkir", "jasa", "servis", "opsi pengiriman", "promo harga",
  "diskon terbatas", "info harga", "lokasi terdekat", "layanan cepat", "order online",
  "penawaran khusus", "estimasi biaya", "biaya tambahan"
];

const nonEvergreenKeywords = [
  "promo", "diskon", "event", "penawaran", "perdana", "periode", "terbaru", "update",
  "spesial", "promo akhir tahun", "penawaran terbatas", "2020", "2021", "2022", "2023",
  "2024", "2025", "2026", "2027", "2028", "hot deal", "penawaran musiman",  "flash sale",  "limited time", "waktu terbatas", 
  "akhir tahun", "penjualan khusus", "promosi musiman", "diskon besar", 
  "khusus pelanggan", "kampanye", "promo online"
];

    updateJsonLd: true
  };

  function qsMany(selectors) { for (const s of selectors) { const el = document.querySelector(s); if (el) return el; } return null; }
  function sampleTextFrom(el) { if (!el) return ''; return (el.innerText || el.textContent || '').slice(0, CONFIG.checkLength).toLowerCase(); }
  function normalizeUrlToken(path) { if (!path) return ''; return path.split('/').filter(Boolean).pop()?.replace(/^p\//,'').replace(/\.html$/i,'').replace(/\b(0?[1-9]|1[0-2]|20\d{2})\b/g,'').replace(/[-_]/g,' ').trim().toLowerCase() || ''; }
  function containsAny(source, arr) { if (!source || !arr || !arr.length) return false; return arr.some(k => source.indexOf(k) !== -1); }
  function findYearInText(s) { if (!s) return null; const m = s.match(/\b(20\d{2})\b/); return m ? m[1] : null; }
  function makeHash(str) { try { return btoa(unescape(encodeURIComponent(str))); } catch (e) { let h=0; for (let i=0;i<str.length;i++) h=(h<<5)-h+str.charCodeAt(i)|0; return String(h); } }
  function formatDate(d) { if (!d) return null; const opt={day:'numeric',month:'long',year:'numeric'}; return d.toLocaleDateString(CONFIG.locale,opt); }
  function addMonths(date, months) { const d=new Date(date.valueOf()); d.setMonth(d.getMonth()+months); return d; }

  try {
    const elContent = qsMany(CONFIG.contentSelectors) || document.body;
    const elH1 = qsMany(CONFIG.h1Selectors) || document.querySelector('h1');
    const h1TextRaw = elH1 ? elH1.innerText.trim() : '(no h1)';
    const h1Text = h1TextRaw.toLowerCase();
    const textContent = sampleTextFrom(elContent);
    const urlRaw = normalizeUrlToken(window.location.pathname);

    const isPillar = window.location.pathname.includes('/p/');
    const oldHash = localStorage.getItem(CONFIG.storageKey);
    const currentHash = makeHash(h1Text + '\n' + textContent + '\n' + urlRaw);

    // ===== Deteksi Tipe Konten =====
    let type;
    if (isPillar) type='EVERGREEN';
    else if (containsAny(h1Text + ' ' + textContent, CONFIG.nonEvergreenKeywords) || findYearInText(h1Text + ' ' + textContent)) type='NON-EVERGREEN';
    else if (containsAny(h1Text + ' ' + textContent + ' ' + urlRaw, CONFIG.semiKeywords)) type='SEMI-EVERGREEN';
    else if (containsAny(h1Text + ' ' + textContent, CONFIG.evergreenKeywords)) type='EVERGREEN';
    else type='SEMI-EVERGREEN';

    // ===== Smart nextUpdate & dateModified =====
    const nextUpdate = new Date();
    let dateModified = null;
    const intervalMonths = CONFIG.intervals[type==='EVERGREEN'?'EVERGREEN':(type==='SEMI-EVERGREEN'?'SEMI_EVERGREEN':'NON_EVERGREEN')];
    if (!oldHash || oldHash!==currentHash) {
      nextUpdate.setMonth(nextUpdate.getMonth()+intervalMonths);
      dateModified = new Date();
      try { localStorage.setItem(CONFIG.storageKey,currentHash); localStorage.setItem(CONFIG.storageKey+'_date',dateModified.toISOString()); } catch(e){}
    } else {
      const prevDateIso = localStorage.getItem(CONFIG.storageKey+'_date');
      if(prevDateIso){ const prev=new Date(prevDateIso); nextUpdate.setMonth(prev.getMonth()+intervalMonths); }
      else nextUpdate.setMonth(nextUpdate.getMonth()+intervalMonths);
    }
    const nextUpdateStr=formatDate(nextUpdate);
    const dateModifiedStr=dateModified?formatDate(dateModified):null;

    // ===== Label H1 =====
    if(elH1){ 
      const existingLabel=elH1.parentNode.querySelector('['+CONFIG.labelAttr+']'); if(existingLabel) existingLabel.remove();
      const label=document.createElement('div');
      label.setAttribute(CONFIG.labelAttr,'true'); label.setAttribute('data-nosnippet','true');
      label.style.fontSize='0.9em'; label.style.color='#444'; label.style.marginTop='6px'; label.style.marginBottom='10px';
      label.innerHTML=`<b>${type}${isPillar?' (Pillar)':''}</b> — pembaruan berikutnya: <b>${nextUpdateStr}</b>`;
      elH1.insertAdjacentElement('afterend',label);
    }

    // ===== Audit H1 untuk Pillar =====
    const urlKeywords = urlRaw.split(' ').filter(Boolean);
    const h1Lower = h1Text.toLowerCase();
    const allKeywordsPresent = urlKeywords.every((k)=>h1Lower.includes(k));
    const recommendedH1 = allKeywordsPresent ? h1Text : urlKeywords.map((w)=>w[0].toUpperCase()+w.slice(1)).join(' ');
    if(isPillar && !allKeywordsPresent){
      console.warn('⚠️ AED Pillar H1 Audit: H1 tidak sesuai keyword URL', recommendedH1);
    }

    // ===== Rekomendasi Konten Otomatis =====
    let recommendedContent = '';
    if(isPillar){
      const pEls = Array.from(elContent.querySelectorAll('p,h2,h3')).slice(0,5);
      recommendedContent = pEls.map(el=>el.innerText.trim()).filter(Boolean).join(' | ');
      if(!containsAny(recommendedContent, urlKeywords)){
        recommendedContent = urlKeywords.map(w=>w[0].toUpperCase()+w.slice(1)).join(' ') + ' – Tambahkan kata kunci utama di paragraf awal dan subjudul.';
      }
    }

    // ===== Author & dateModified =====
    const authorEl=document.querySelector(CONFIG.authorSelector);
    if(authorEl && dateModifiedStr){ 
      const oldDateSpan=authorEl.querySelector('.'+CONFIG.dateSpanClass); if(oldDateSpan) oldDateSpan.remove();
      const dateEl=document.createElement('span'); dateEl.className=CONFIG.dateSpanClass;
      dateEl.textContent=` · Diperbarui: ${dateModifiedStr}`;
      dateEl.style.fontSize='0.85em'; dateEl.style.color='#555'; dateEl.style.marginLeft='6px';
      dateEl.setAttribute('data-nosnippet','true');
      authorEl.appendChild(dateEl);
    }

    // ===== Update JSON-LD =====
    if(CONFIG.updateJsonLd){
      const ldEls=Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      ldEls.forEach(el=>{
        try{
          if(!el.innerText.trim()) return;
          const data=JSON.parse(el.innerText);
          const nodes=Array.isArray(data)?data:[data];
          let mutated=false;
          nodes.forEach(node=>{
            if(node['@type'] && ['product','offer','service'].some(t=>node['@type'].toLowerCase().includes(t))){
              if(dateModified) { node.dateModified=new Date().toISOString(); mutated=true; }
              if(node.offers && node.offers.price) { node.offers.priceValidUntil=addMonths(new Date(), intervalMonths).toISOString(); mutated=true; }
            }
          });
          if(mutated) el.innerText=JSON.stringify(Array.isArray(data)?nodes:nodes[0],null,2);
        }catch(e){ console.warn('AED JSON-LD update error',e);}
      });
    }

    // ===== Dashboard =====
  const ultraStructure = {
  EVERGREEN: [
    "Pendahuluan / Definisi", 
    "Sejarah & Latar Belakang", 
    "Manfaat & Kegunaan", 
    "Langkah / Tutorial Lengkap", 
    "Tips & Trik Praktis", 
    "Studi Kasus / Contoh Nyata", 
    "FAQ / Pertanyaan Umum", 
    "Kesalahan Umum & Cara Menghindari", 
    "Referensi / Sumber Terpercaya", 
    "Alat / Software / Resource Pendukung", 
    "Checklist / Ringkasan Langkah", 
    "Best Practices / Praktik Terbaik", 
    "Panduan Lengkap vs Ringkasan Cepat", 
    "Tips Lanjutan / Strategi Lanjut", 
    "Alternatif / Opsi Lain", 
    "Infografis / Visual Pendukung", 
    "Tips SEO / Optimasi Konten", 
    "Video / Tutorial Multimedia", 
    "Kesimpulan & Ringkasan", 
    "Call to Action / Next Steps / Ajakan Tindakan / Langkah Selanjutnya"
  ],
  SEMI: [
    "Ringkasan & Tren Terkini", 
    "Langkah / Cara", 
    "Perbandingan / Analisis", 
    "Tips Praktis / Rekomendasi", 
    "Kelebihan & Kekurangan", 
    "FAQ Spesifik Topik", 
    "Referensi / Link Terkait", 
    "Saran Lanjutan / Langkah Selanjutnya", 
    "Update Harga / Tarif / Biaya", 
    "Update Wilayah / Lokasi", 
    "Panduan Singkat vs Detail", 
    "Tips Implementasi Cepat", 
    "Studi Kasus Singkat", 
    "Checklist / Ringkasan Praktis", 
    "Visualisasi / Diagram", 
    "Alternatif Produk / Layanan", 
    "Best Practices & Strategi / Praktik Terbaik & Strategi", 
    "Peringatan / Notifikasi Pembaruan", 
    "Testimoni / Review Pengguna", 
    "Ajakan Tindakan / Kontak"
  ],
  NON: [
    "Harga & Promo Terkini", 
    "Ketersediaan & Wilayah", 
    "Periode & Update", 
    "Kontak & Cara Order", 
    "Ketentuan / Syarat & Ketentuan", 
    "Biaya / Tarif / Ongkir", 
    "Promo / Diskon Spesial", 
    "FAQ Transaksi / Order", 
    "Cara Pembayaran / Metode", 
    "Garansi / Jaminan Produk", 
    "Stok / Persediaan", 
    "Update Produk / Layanan", 
    "Link Pemesanan Cepat", 
    "Referensi / Info Tambahan", 
    "Instruksi Penggunaan / Setup", 
    "Testimoni / Review Pelanggan", 
    "Tips Pemesanan Aman", 
    "Alert / Notifikasi Update / Notifikasi Promo / Event", 
    "Visual Produk / Spanduk", 
    "Call to Action / Ajakan Tindakan / Pesan Sekarang"
  ]
}[type.split("-")[0]];

    const dash = document.createElement('div'); dash.style.maxWidth='1200px'; dash.style.margin='30px auto'; dash.style.padding='15px'; dash.style.background='#f0f8ff'; dash.style.borderTop='3px solid #0078ff'; dash.style.fontFamily='Arial, sans-serif'; dash.setAttribute('data-nosnippet','true');
    const h3=document.createElement('h3'); h3.innerText="📊 AED Dashboard — Ringkasan Halaman"; dash.appendChild(h3);

    const btnContainer=document.createElement('div'); btnContainer.style.textAlign='center'; btnContainer.style.marginBottom='10px';
    const createBtn=(text,bg)=>{ const b=document.createElement('button'); b.textContent=text; b.style.background=bg; b.style.color='#000'; b.style.padding='6px 12px'; b.style.margin='3px'; b.style.borderRadius='4px'; b.style.cursor='pointer'; b.style.border='none'; b.style.fontSize='0.9em'; b.setAttribute('data-nosnippet','true'); return b; };
    const btnKoreksi=createBtn("⚙️ Koreksi & Preview","#ffeedd"); const btnShowTable=createBtn("📊 Tampilkan Data Table","#d1e7dd"); const btnReport=createBtn("📥 Download Laporan","#f3f3f3"); btnContainer.append(btnKoreksi,btnShowTable,btnReport); dash.appendChild(btnContainer);

    const tableWrap=document.createElement('div'); tableWrap.style.overflowX='auto'; tableWrap.style.display='none';
    tableWrap.innerHTML=`<table style="width:100%;border-collapse:collapse;min-width:800px;font-size:0.9em;">
      <thead style="position:sticky;top:0;background:#dff0ff;z-index:2;"><tr><th>Halaman</th><th>Tipe</th><th>H1</th><th>Rekom H1</th><th>Rekom Konten</th><th>Next Update</th></tr></thead>
      <tbody><tr><td>${document.title}</td><td>${type}${isPillar?' (Pillar)':''}</td><td>${h1Text}</td><td>${recommendedH1}</td><td>${recommendedContent}</td><td>${nextUpdateStr}</td></tr></tbody></table>`;
    dash.appendChild(tableWrap); document.body.appendChild(dash);

    btnShowTable.onclick=()=>{tableWrap.style.display=tableWrap.style.display==='none'?'block':'none';};
    btnKoreksi.onclick=()=>{alert(`🔍 Koreksi & Preview\n\nRekomendasi H1:\n${recommendedH1}\n\nRekomendasi Konten:\n${recommendedContent}\n\nStruktur ideal (${type}):\n${ultraStructure.join(" → ")}\n\nNext Update: ${nextUpdateStr}`);};
    btnReport.onclick=()=>{ const report=`AED REPORT — ${document.title}\n\nTipe Konten: ${type}${isPillar?' (Pillar)':''}\nH1 Saat Ini: ${h1Text}\nRekomendasi H1: ${recommendedH1}\nRekomendasi Konten: ${recommendedContent}\n${dateModifiedStr?`Tanggal Diperbarui: ${dateModifiedStr}`:''}\nNext Update: ${nextUpdateStr}\n\nStruktur Ideal:\n${ultraStructure.join("\n")}\n\nURL: ${location.href}`.trim(); const blob=new Blob([report],{type:'text/plain'}); const link=document.createElement('a'); link.href=URL.createObjectURL(blob); link.download=`AED_Report_${document.title.replace(/\s+/g,"_")}.txt`; link.click(); };

    const style=document.createElement('style'); style.innerHTML=`@media(max-width:768px){table th,table td{padding:4px;font-size:0.8em;} table{min-width:600px;} } thead th{position:sticky;top:0;background:#dff0ff;} table th,td{border:1px solid #ccc;padding:6px;text-align:left;}`; document.head.appendChild(style);

    console.log("✅ AED v7.7 Pillar-Safe + H1 Audit + Rekomendasi Konten + JSON-LD Dashboard aktif.");

  }catch(e){console.error("❌ AED v7.7 Pillar-Safe + H1 Audit + Rekomendasi Konten + JSON-LD Error:",e);}
})();

/**
 * 🌿 Hybrid Evergreen Detector v7.1
 * ✅ Smart Section Update + Auto dateModified + Responsive Dashboard
 * Beton Jaya Readymix ©2025
 */

/* ===== 🧩 Hybrid Evergreen Detector + Smart Selective DateModified v7.6 ===== */
(function runEvergreenDetector() {
  console.log("🔍 Running Smart Selective Evergreen Detector v7.9 Ultimate Visual...");

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
  const oldGlobalHash = localStorage.getItem("globalHash_"+location.pathname);
  localStorage.setItem("globalHash_"+location.pathname, globalHash);

  // === Meta datePublished & dateModified ===
  let datePublished = convertToWIB(document.querySelector("meta[itemprop='datePublished']")?.content) || "";
  let dateModified = convertToWIB(document.querySelector("meta[itemprop='dateModified']")?.content) || datePublished;

  // === Ambil section H2/H3 ===
  const sections = [];
  let current=null;
  contentRoot.querySelectorAll("h2,h3").forEach(h=>{
    if(h.tagName==="H2"){ if(current) sections.push(current); current={title:cleanText(h.innerText),content:""}; }
    else if(h.tagName==="H3" && current) current.content+="\n"+cleanText(h.innerText);
    let next=h.nextElementSibling;
    while(next&&!/^H[23]$/i.test(next.tagName)){
      if(next.innerText && current) current.content+="\n"+cleanText(next.innerText);
      next=next.nextElementSibling;
    }
  });
  if(current) sections.push(current);

  // === Detect Type per-section ===
  const detectType = t => {
    if(isPillar) return "EVERGREEN";
    const l=t.toLowerCase();
    if(/(harga|update|promo|diskon|biaya|bulan ini|tahun)/.test(l)) return "NON-EVERGREEN";
    if(/(proyek|spesifikasi|fitur|jenis|perbandingan|keunggulan)/.test(l)) return "SEMI-EVERGREEN";
    return "EVERGREEN";
  };

  // === Advice Generator Cerdas ===
  function generateAdvice(txt,type,length,isLast){
    const adv=[];
    if(/harga|biaya|tarif/.test(txt)) adv.push("Perbarui harga & tarif secara berkala");
    if(/spesifikasi|fitur|ukuran/.test(txt)) adv.push("Periksa & update spesifikasi terbaru");
    if(/manfaat|fungsi|keunggulan/.test(txt)) adv.push("Tambahkan contoh nyata penerapan");
    if(/video|gambar|foto|diagram|chart/.test(txt)) adv.push("Sertakan media visual agar lebih menarik");
    if(length<400) adv.push("Perluas konten agar lebih lengkap dan komprehensif");
    if(!/faq|pertanyaan/.test(txt) && isLast) adv.push("Tambahkan FAQ atau pertanyaan umum di akhir");
    if(type==="NON-EVERGREEN") adv.push("Periksa update rutin untuk menjaga akurasi informasi");
    if(type==="SEMI-EVERGREEN") adv.push("Lakukan review berkala tiap 3-6 bulan");
    return adv.length ? adv.join(". ") + "." : "Konten stabil, review ringan cukup.";
  }

  // === Skor SEO & Readability (versi sederhana) ===
  function calculateSEOScore(txt){
  const cleanText = s => s ? s.replace(/\s+/g," ").trim().toLowerCase() : "";
  const content = cleanText(txt);

  // Ambil H1, H2, H3 sebagai keyword utama
  const h1 = cleanText(document.querySelector("h1")?.innerText || "");
  const h2h3 = Array.from(document.querySelectorAll("h2,h3")).map(h=>cleanText(h.innerText)).join(" ");

  // Ambil meta keywords jika ada
  const metaKeywords = (document.querySelector("meta[name='keywords']")?.content || "").toLowerCase();

  // Array keyword unik
  let keywords = Array.from(new Set((h1 + " " + h2h3 + " " + metaKeywords).split(/\s+/).filter(Boolean)));

  // Fallback jika tidak ada keyword
  if(keywords.length === 0) keywords = ["artikel","informasi","detail"];

  const words = content.split(/\s+/).length;

  // Hitung jumlah kemunculan keyword
  let hits = 0;
  keywords.forEach(k=>{
    const regex = new RegExp("\\b"+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+"\\b","gi");
    hits += (content.match(regex) || []).length;
  });

  const density = words ? hits / words : 0;
  const lengthBonus = Math.min(20, words/50); // max +20 pts
  const uniqueHits = Math.min(20, keywords.filter(k=>content.includes(k)).length * 2); // max +20 pts

  let score = 50 + density*30 + lengthBonus + uniqueHits;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return score;
}
  function calculateReadability(txt){
    const sentences=txt.split(/[.!?]/).filter(s=>s.trim().length>0).length||1;
    const words=txt.split(/\s+/).length;
    const avgWordsPerSentence=words/sentences;
    const score=Math.max(0,100-Math.abs(avgWordsPerSentence-15)*5);
    return Math.round(score);
  }
  function scoreColor(score){
    if(score>=80) return "score-green";
    if(score>=50) return "score-orange";
    return "score-red";
  }

  // === Analisis per-section & H1 Audit ===
  let importantChanged=false;
  const h1=cleanText(document.querySelector("h1")?.innerText||"");
  const h1KeywordMismatch=isPillar && !location.pathname.toLowerCase().includes(h1.toLowerCase().replace(/\s+/g,"-"));
  const results=[];
  sections.forEach((sec,i)=>{
    const type=detectType(sec.title+" "+sec.content);
    const hash=hashString(sec.title+" "+sec.content);
    const key=`sec_hash_${i}_${location.pathname}`;
    const old=localStorage.getItem(key);
    const changed=old && old!==String(hash);
    localStorage.setItem(key,hash);

    if(changed && (type==="SEMI-EVERGREEN" || type==="NON-EVERGREEN")) importantChanged=true;

    const months=type==="EVERGREEN"?12:type==="SEMI-EVERGREEN"?6:3;
    const nextUpdate=new Date(); nextUpdate.setMonth(nextUpdate.getMonth()+months);

    const txt=sec.content.toLowerCase();
    const advice=generateAdvice(txt,type,txt.length,i===sections.length-1);
    const seoScore=calculateSEOScore(txt);
    const readability=calculateReadability(txt);

    results.push({
      section: sec.title||"(Tanpa Judul)",
      type,
      changed,
      nextUpdate: nextUpdate.toLocaleDateString(),
      advice,
      seoScore,
      readability
    });
  });

  // === Selective dateModified & JSON-LD Update ===
  if(oldGlobalHash && oldGlobalHash!==String(globalHash) && importantChanged){
    dateModified=convertToWIB(new Date().toISOString());
    console.log("⚡ Update signifikan → dateModified:",dateModified);
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s=>{
      try{
        const d=JSON.parse(s.textContent);
        if(d.dateModified) d.dateModified=dateModified;
        if(d.offers && d.offers.priceValidUntil) d.offers.priceValidUntil=dateModified;
        s.textContent=JSON.stringify(d,null,2);
      }catch{}
    });
    const meta=document.querySelector('meta[itemprop="dateModified"]');
    if(meta) meta.setAttribute("content",dateModified);
  }

  // === Render dashboard visual ===
  const wrap=document.createElement("div");
  wrap.setAttribute("data-nosnippet","true");
  wrap.style="margin-top:20px;padding:10px;border:1px solid #ccc;border-radius:8px;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,0.1);";

  let h1AuditMsg="";
  if(h1KeywordMismatch) h1AuditMsg="⚠ H1 pillar tidak sesuai URL/keyword. Disarankan perbaiki agar cocok.";

  const table=document.createElement("table");
  table.innerHTML=`
  <thead><tr>
    <th>Section</th><th>Tipe</th><th>Perubahan</th><th>Next Update</th>
    <th>Saran</th><th>SEO Score</th><th>Readability</th>
  </tr></thead>
  <tbody>
    ${results.map(r=>`
      <tr style="background:${r.type==="EVERGREEN"?"#e8fce8":r.type==="SEMI-EVERGREEN"?"#fff5e0":"#ffeaea"}">
        <td>${r.section}</td>
        <td><b>${r.type}</b></td>
        <td>${r.changed?"✅ Berubah":"– Stabil"}</td>
        <td>${r.nextUpdate}</td>
        <td>${r.advice}</td>
        <td class="${scoreColor(r.seoScore)}">${r.seoScore}</td>
        <td class="${scoreColor(r.readability)}">${r.readability}</td>
      </tr>`).join("")}
  </tbody>`;
  wrap.appendChild(table);

  const info=document.createElement("div");
  info.style.marginTop="8px"; info.style.fontSize="13px";
  info.textContent=`📅 Published: ${datePublished || "-"} | Last Modified: ${dateModified} ${h1AuditMsg}`;
  wrap.appendChild(info);

  const btn=document.createElement("button");
  btn.textContent="🔄 Deteksi Ulang";
  Object.assign(btn.style,{marginTop:"10px",padding:"8px 14px",background:"#007bff",color:"#fff",border:"none",borderRadius:"6px",cursor:"pointer"});
  btn.onclick=()=>{wrap.remove(); runEvergreenDetector();};
  wrap.appendChild(btn);

  (document.querySelector("#aed-dashboard")||document.querySelector("main")||document.body).appendChild(wrap);

  console.log("✅ v7.9 Ultimate Visual selesai – Skor SEO & Readability dengan warna aktif.");
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
