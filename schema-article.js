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
(function AutoEvergreenV83UltraKMPTTF(window, document) {
  'use strict';

  // ===================== CONFIG =====================
  const CONFIG = {
    storageKey: 'AutoEvergreenHashV8_3_UltraKMPTTF',
    labelAttr: 'data-aed-label',
    dateSpanClass: 'aed-date-span',
    checkLength: 5000,
    locale: 'id-ID',
    contentSelectors: ['article', 'main', '.post-body', '.entry-content', '#content'],
    h1Selectors: ['h1', '.entry-title'],
    authorSelector: '.post-author .fn, .author vcard, .byline',
    intervals: { EVERGREEN: 12, SEMI_EVERGREEN: 6, NON_EVERGREEN: 3 },
    evergreenKeywords: ["panduan","tutorial","cara","manfaat","pengertian","definisi","apa itu","tips","trik","panduan lengkap","langkah-langkah","praktik terbaik","strategi","studi kasus","contoh","referensi","panduan seo","petunjuk","instruksi","tutorial lengkap","solusi","teknik","panduan praktis"],
    semiKeywords: ["harga","lokasi","layanan","pengiriman","wilayah","order","pesan","update harga","harga terbaru","pesan sekarang","biaya","tarif","estimasi","ongkir","jasa","servis","promo harga","diskon","info harga","lokasi terdekat","layanan cepat","order online","penawaran khusus","estimasi biaya"],
    nonEvergreenKeywords: ["promo","diskon","event","penawaran","perdana","periode","terbaru","update","spesial","2020","2021","2022","2023","2024","2025","2026","2027","2028","hot deal","flash sale","limited time","akhir tahun","penjualan khusus","kampanye","promo online"],
    updateJsonLd: true
  };

  // ===================== Helper =====================
  function qsMany(sel){for(const s of sel){const e=document.querySelector(s);if(e)return e;}return null;}
  const sampleTextFrom=e=>e?(e.innerText||e.textContent||'').slice(0,CONFIG.checkLength).toLowerCase():'';
  const normalizeUrlToken=p=>p? p.split('/').filter(Boolean).pop()?.replace(/^p\//,'').replace(/\.html$/i,'').replace(/\b(0?[1-9]|1[0-2]|20\d{2})\b/g,'').replace(/[-_]/g,' ').trim().toLowerCase()||'' : '';
  const containsAny=(s,a)=>!!a?.length && a.some(k=>s.includes(k));
  const findYearInText=s=>s?.match(/\b(20\d{2})\b/)?.[1]||null;
  const makeHash=s=>{try{return btoa(unescape(encodeURIComponent(s)));}catch{let h=0;for(let i=0;i<s.length;i++)h=(h<<5)-h+s.charCodeAt(i)|0;return String(h);}};
  const formatDate=d=>d?d.toLocaleDateString(CONFIG.locale,{day:'numeric',month:'long',year:'numeric'}):null;
  const addMonths=(d,m)=>{const x=new Date(d);x.setMonth(x.getMonth()+m);return x;};
  const tokenize=s=>s?.toLowerCase().replace(/[^\p{L}\p{N}\s\-]/gu,' ').replace(/\s+/g,' ').trim().split(' ').filter(Boolean)||[];
  const unique=a=>Array.from(new Set(a));

  // ===================== H1 ↔ URL Scoring =====================
  function computeH1UrlScore(h1,url){
    const u=unique(tokenize(url)), h=unique(tokenize(h1));
    if(!u.length) return 100;
    const m=u.filter(t=>h.includes(t)), ratio=m.length/u.length;
    const bonus=h1.toLowerCase().startsWith(u[0]||'')?0.15:0;
    return Math.round(Math.min(1,ratio+bonus)*100);
  }
  function scoreToLabel(s,t){if(s>=90)return"Sangat Baik";if(s>=75)return"Baik";if(s>=50)return t==="EVERGREEN"?"Perlu Perbaikan":"Cukup";return"Perlu Perbaikan";}
  function makeH1Suggestion(h1,url){
    const u=unique(tokenize(url));if(!u.length)return null;
    const s=(u.join(' ')+' '+h1).replace(/\s+/g,' ').trim();
    return u.every(t=>h1.toLowerCase().includes(t))?null:s;
  }

  // ===================== CORE =====================
  try{
    const elC=qsMany(CONFIG.contentSelectors)||document.body;
    const elH1=qsMany(CONFIG.h1Selectors)||document.querySelector('h1');
    const h1R=elH1?elH1.innerText.trim():'(no h1)';
    const h1=h1R.toLowerCase();
    const txt=sampleTextFrom(elC);
    const urlRaw=normalizeUrlToken(window.location.pathname);
    const isPillar=window.location.pathname.includes('/p/');
    const old=localStorage.getItem(CONFIG.storageKey);
    const hash=makeHash(h1+'\n'+txt+'\n'+urlRaw);

    // ==== Tipe Konten ====
    let type;
    if(isPillar) type='EVERGREEN';
    else if(containsAny(h1+txt,CONFIG.nonEvergreenKeywords)||findYearInText(h1+txt)) type='NON_EVERGREEN';
    else if(containsAny(h1+txt+urlRaw,CONFIG.semiKeywords)) type='SEMI_EVERGREEN';
    else if(containsAny(h1+txt,CONFIG.evergreenKeywords)) type='EVERGREEN';
    else type='SEMI_EVERGREEN';

    if(type==='EVERGREEN'&&!document.body.hasAttribute('data-force')) document.body.setAttribute('data-force','evergreen');

    // ==== Tanggal ====
    const next=new Date();let mod=null;
    const m=CONFIG.intervals[type==='EVERGREEN'?'EVERGREEN':type==='SEMI_EVERGREEN'?'SEMI_EVERGREEN':'NON_EVERGREEN'];
    if(!old||old!==hash){next.setMonth(next.getMonth()+m);mod=new Date();localStorage.setItem(CONFIG.storageKey,hash);localStorage.setItem(CONFIG.storageKey+'_date',mod.toISOString());}
    else{const prev=localStorage.getItem(CONFIG.storageKey+'_date');if(prev){const d=new Date(prev);next.setMonth(d.getMonth()+m);}else next.setMonth(next.getMonth()+m);}
    const nextStr=formatDate(next), modStr=mod?formatDate(mod):null;

    // ==== Label H1 ====
    if(elH1){
      elH1.parentNode.querySelector('['+CONFIG.labelAttr+']')?.remove();
      const lb=document.createElement('div');
      lb.setAttribute(CONFIG.labelAttr,'true');
      lb.setAttribute('data-nosnippet','true');
      lb.style.cssText='font-size:.95em;color:#222;margin-top:6px;margin-bottom:12px;padding:6px 12px;background:#f9f9f9;border:1px solid #ccc;border-radius:5px;';
      lb.innerHTML='<b>'+type+(isPillar?' (Pillar)':'')+'</b> — pembaruan berikutnya: <b>'+nextStr+'</b>';
      elH1.insertAdjacentElement('afterend',lb);
    }

    // ==== H1 Score + Saran ====
    const score=computeH1UrlScore(h1R,urlRaw), sLbl=scoreToLabel(score,type), sSug=makeH1Suggestion(h1R,urlRaw);
    const oldScore=elH1.parentNode.querySelector('[data-aed-h1score]');oldScore?.remove();
    const sEl=document.createElement('div');
    sEl.setAttribute('data-aed-h1score','true');sEl.setAttribute('data-nosnippet','true');
    sEl.style.cssText='font-size:.9em;color:#0b644b;margin-top:4px;margin-bottom:10px;padding:6px 10px;background:#f0fff7;border:1px solid #cfeee0;border-radius:6px;';
    sEl.innerHTML='<b>Skor Kecocokan H1 ↔ URL: '+score+'/100</b> — '+sLbl+
      '<br><small>Rekomendasi tingkat: '+type+'</small>'+
      (sSug?'<div style="margin-top:6px;color:#444;"><b>Rekomendasi H1:</b> '+sSug+'</div>':'<div style="margin-top:6px;color:#666;">H1 sudah sesuai dengan kata kunci URL.</div>');
    elH1.insertAdjacentElement('afterend',sEl);

    // ==== Rekomendasi konten ====
    const ps=[...elC.querySelectorAll('p,h2,h3')].slice(0,5);
    const urlK=urlRaw.split(' ').filter(Boolean);
    let rec='';
    if(type==='EVERGREEN'){
      rec=ps.map(e=>e.innerText.trim()).filter(Boolean).join(' | ');
      if(!containsAny(rec,urlK)) rec=urlK.map(w=>w[0].toUpperCase()+w.slice(1)).join(' ')+' – Tambahkan kata kunci utama di paragraf awal & subjudul.';
    }else if(type==='SEMI_EVERGREEN'){
      rec=ps.map(e=>e.innerText.trim()).filter(Boolean)[0]||'';
      if(!containsAny(rec,urlK)) rec=urlK.map(w=>w[0].toUpperCase()+w.slice(1)).join(' ')+' – Highlight keyword di paragraf awal/subheading.';
    }else rec='Periksa update harga, promo, atau informasi terbaru.';

    // ==== Author Date ====
    const aEl=document.querySelector(CONFIG.authorSelector);
    if(aEl&&modStr){
      aEl.querySelector('.'+CONFIG.dateSpanClass)?.remove();
      const d=document.createElement('span');
      d.className=CONFIG.dateSpanClass;
      d.textContent=' · Diperbarui: '+modStr;
      d.style.cssText='font-size:.85em;color:#555;margin-left:6px;';
      d.setAttribute('data-nosnippet','true');
      aEl.appendChild(d);
    }

    // ==== JSON-LD Update ====
    if(CONFIG.updateJsonLd){
      [...document.querySelectorAll('script[type="application/ld+json"]')].forEach(el=>{
        try{
          if(!el.innerText.trim())return;
          const data=JSON.parse(el.innerText);
          const arr=Array.isArray(data)?data:[data];
          let change=false;
          arr.forEach(n=>{
            if(n['@type']&&['product','offer','service'].some(t=>n['@type'].toLowerCase().includes(t))){
              if(mod){n.dateModified=new Date().toISOString();change=true;}
              if(n.offers?.price){n.offers.priceValidUntil=addMonths(new Date(),m).toISOString();change=true;}
            }
          });
          if(change) el.innerText=JSON.stringify(arr.length>1?arr:arr[0],null,2);
        }catch(e){console.warn('AED JSON-LD err',e);}
      });
    }

    // ==== Dashboard ====
    const dash=document.createElement('div');
    dash.style.cssText='max-width:1200px;margin:30px auto;padding:15px;background:#f0f8ff;border-top:3px solid #0078ff;font-family:Arial,sans-serif;';
    dash.setAttribute('data-nosnippet','true');
    const h3=document.createElement('h3');h3.innerText="📊 AED Ultra KMPTTF Dashboard — Ringkasan Halaman";dash.appendChild(h3);

    const btns=document.createElement('div');btns.style.textAlign='center';btns.style.marginBottom='10px';
    const mkB=(t,bg)=>{const x=document.createElement('button');x.textContent=t;x.style.background=bg;x.style.padding='6px 12px';x.style.margin='3px';x.style.border='none';x.style.borderRadius='4px';x.style.cursor='pointer';x.setAttribute('data-nosnippet','true');return x;};
    const koreksi=mkB("⚙️ Koreksi & Preview","#ffeedd"), show=mkB("📊 Tampilkan Data Table","#d1e7dd"), rep=mkB("📥 Download Laporan","#f3f3f3");
    btns.append(koreksi,show,rep);dash.appendChild(btns);

    const tbl=document.createElement('div');tbl.style.overflowX='auto';tbl.style.display='none';
    tbl.innerHTML='<table style="width:100%;border-collapse:collapse;min-width:900px;font-size:.9em;">'+
    '<thead><tr><th>Halaman</th><th>Tipe</th><th>H1</th><th>Skor H1</th><th>Rekom H1</th><th>Rekom Konten</th><th>Next Update</th></tr></thead>'+
    '<tbody><tr><td>'+document.title+'</td><td>'+type+'</td><td>'+h1+'</td><td>'+score+'/100</td><td>'+(sSug||'—')+'</td><td>'+rec+'</td><td>'+nextStr+'</td></tr></tbody></table>';
    dash.appendChild(tbl);document.body.appendChild(dash);

    show.onclick=()=>tbl.style.display=tbl.style.display==='none'?'block':'none';
    koreksi.onclick=()=>alert('🔍 Koreksi & Preview\nSkor H1: '+score+'/100\nRekom H1: '+(sSug||'OK')+'\nRekom Konten: '+rec+'\nNext Update: '+nextStr);
    rep.onclick=()=>{const rpt='AED Ultra KMPTTF REPORT — '+document.title+'\nTipe: '+type+'\nH1: '+h1+'\nSkor: '+score+'/100\nRekom H1: '+(sSug||'-')+'\nRekom Konten: '+rec+'\nNext Update: '+nextStr+'\nURL: '+location.href;const blob=new Blob([rpt],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='AED_Report_'+document.title.replace(/\s+/g,'_')+'.txt';a.click();};

    const st=document.createElement('style');
    st.innerHTML='@media(max-width:768px){table th,td{padding:4px;font-size:.8em;}table{min-width:600px;}}table th,td{border:1px solid #ccc;padding:6px;text-align:left;}thead{background:#dff0ff;position:sticky;top:0;}';
    document.head.appendChild(st);

    console.log("✅ AED v8.3 Ultra KMPTTF aktif – Audit H1 + Dashboard SEO Lengkap");
  }catch(e){console.error("❌ AED v8.3 Error:",e);}
})(window, document);

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
