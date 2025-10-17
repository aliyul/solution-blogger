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
(function AutoEvergreenDashboard(window, document){
  'use strict';

  const CONFIG = {
    storageKey: 'AutoEvergreenHashV7_7',
    labelAttr: 'data-aed-label',
    dateSpanClass: 'aed-date-span',
    checkLength: 4000,
    locale: 'id-ID',
    nonEvergreenKeywords: [
      'promo','diskon','event','penawaran','perdana','periode','terbaru','update','spesial','promo akhir tahun','penawaran terbatas',
      '2020','2021','2022','2023','2024','2025','2026'
    ],
    semiKeywords: [
      'harga','lokasi','layanan','pengiriman','wilayah','area','order','pesan','update harga','harga terbaru','pesan sekarang','wilayah pengiriman','biaya','tarif','estimasi','ongkir'
    ],
    evergreenKeywords: [
      'panduan','tutorial','cara','manfaat','pengertian','definisi','apa itu','tips','trik','panduan lengkap','langkah-langkah'
    ],
    contentSelectors: ['article','main','.post-body','.entry-content','#content'],
    h1Selectors: ['h1','.entry-title'],
    authorSelector: '.post-author .fn, .author vcard, .byline',
    intervals: { EVERGREEN:12, SEMI_EVERGREEN:6, NON_EVERGREEN:3 },
    updateJsonLd:true
  };

  function qsMany(selectors){ for(const s of selectors){ const el=document.querySelector(s); if(el) return el;} return null;}
  function sampleTextFrom(el){ if(!el) return ''; return (el.innerText||el.textContent||'').slice(0, CONFIG.checkLength).toLowerCase();}
  function normalizeUrlToken(path){ if(!path) return ''; return path.split('/').filter(Boolean).pop()?.replace(/^p\//,'').replace(/\.html$/i,'').replace(/\b(0?[1-9]|1[0-2]|20\d{2})\b/g,'').replace(/[-_]/g,' ').trim().toLowerCase()||'';}
  function containsAny(source, arr){ if(!source||!arr||!arr.length) return false; return arr.some(k=>source.indexOf(k)!==-1);}
  function findYearInText(s){ if(!s) return null; const m=s.match(/\b(20\d{2})\b/); return m?m[1]:null;}
  function makeHash(str){ try{ return btoa(unescape(encodeURIComponent(str)));}catch(e){let h=0;for(let i=0;i<str.length;i++) h=(h<<5)-h+str.charCodeAt(i)|0; return String(h);}}
  function formatDate(d){ if(!d) return null; const opt={day:'numeric',month:'long',year:'numeric'}; return d.toLocaleDateString(CONFIG.locale,opt);}
  function addMonths(date, months){ const d=new Date(date.valueOf()); d.setMonth(d.getMonth()+months); return d;}

  try{
    const elContent = qsMany(CONFIG.contentSelectors)||document.body;
    const elH1 = qsMany(CONFIG.h1Selectors)||document.querySelector('h1');
    const h1TextRaw = elH1?elH1.innerText.trim():'(no h1)';
    const h1Text = h1TextRaw.toLowerCase();
    const textContent = sampleTextFrom(elContent);
    const urlRaw = normalizeUrlToken(window.location.pathname);

    const oldHash = localStorage.getItem(CONFIG.storageKey);
    const currentHash = makeHash(h1Text+'\n'+textContent+'\n'+urlRaw);

    // ===== DETEKSI TIPE =====
    let type = 'SEMI-EVERGREEN';
    if(containsAny(h1Text+' '+textContent, CONFIG.nonEvergreenKeywords) || findYearInText(h1Text+' '+textContent)) type='NON-EVERGREEN';
    if(type!=='NON-EVERGREEN' && containsAny(h1Text+' '+textContent+' '+urlRaw, CONFIG.semiKeywords)) type='SEMI-EVERGREEN';
    if(type==='SEMI-EVERGREEN' && containsAny(h1Text+' '+textContent, CONFIG.evergreenKeywords) && !containsAny(h1Text+' '+textContent, CONFIG.semiKeywords)) type='EVERGREEN';
    if(!containsAny(h1Text+' '+textContent, CONFIG.semiKeywords.concat(CONFIG.nonEvergreenKeywords, CONFIG.evergreenKeywords))){
      if(containsAny(urlRaw, CONFIG.nonEvergreenKeywords)) type='NON-EVERGREEN';
      else if(containsAny(urlRaw, CONFIG.evergreenKeywords)) type='EVERGREEN';
      else if(containsAny(urlRaw, CONFIG.semiKeywords)) type='SEMI-EVERGREEN';
    }

    // ===== NEXT UPDATE & DATE MODIFIED =====
    const nextUpdate=new Date();
    let dateModified=null;
    const intervalMonths=CONFIG.intervals[type==='EVERGREEN'?'EVERGREEN':(type==='SEMI-EVERGREEN'?'SEMI_EVERGREEN':'NON_EVERGREEN')];
    if(!oldHash || oldHash!==currentHash){ nextUpdate.setMonth(nextUpdate.getMonth()+intervalMonths); dateModified=new Date(); try{ localStorage.setItem(CONFIG.storageKey,currentHash);}catch(e){}}
    else{ const prevDateIso=localStorage.getItem(CONFIG.storageKey+'_date'); if(prevDateIso){const prev=new Date(prevDateIso); nextUpdate.setMonth(prev.getMonth()+intervalMonths);} else nextUpdate.setMonth(nextUpdate.getMonth()+intervalMonths);}
    if(dateModified){ try{ localStorage.setItem(CONFIG.storageKey+'_date',dateModified.toISOString()); }catch(e){} }
    const nextUpdateStr=formatDate(nextUpdate);
    const dateModifiedStr=dateModified?formatDate(dateModified):null;

    // ===== LABEL H1 =====
    if(elH1){ try{ const existingLabel=elH1.parentNode.querySelector('['+CONFIG.labelAttr+']'); if(existingLabel) existingLabel.remove(); const label=document.createElement('div'); label.setAttribute(CONFIG.labelAttr,'true'); label.setAttribute('data-nosnippet','true'); label.style.fontSize='0.9em'; label.style.color='#444'; label.style.marginTop='6px'; label.style.marginBottom='10px'; label.innerHTML=`<b>${type}</b> — pembaruan berikutnya: <b>${nextUpdateStr}</b>`; elH1.insertAdjacentElement("afterend",label);}catch(e){console.warn('AED v7.7 Dashboard: gagal sisip label',e);}}

    // ===== AUTHOR DATE =====
    const authorEl=document.querySelector(CONFIG.authorSelector);
    if(authorEl && dateModifiedStr){ try{ const oldDateSpan=authorEl.querySelector('.'+CONFIG.dateSpanClass); if(oldDateSpan) oldDateSpan.remove(); const dateEl=document.createElement('span'); dateEl.className=CONFIG.dateSpanClass; dateEl.textContent=` · Diperbarui: ${dateModifiedStr}`; dateEl.style.fontSize='0.85em'; dateEl.style.color='#555'; dateEl.style.marginLeft='6px'; dateEl.setAttribute('data-nosnippet','true'); authorEl.appendChild(dateEl);}catch(e){console.warn('AED v7.7 Dashboard: gagal append date',e);} }

    // ===== REKOMENDASI H1 =====
    const urlKeywords=urlRaw.split(" ").filter(Boolean);
    const h1Lower=h1Text.toLowerCase();
    const allKeywordsPresent=urlKeywords.every(k=>h1Lower.includes(k));
    const recommendedH1=!allKeywordsPresent?urlKeywords.map(w=>w[0].toUpperCase()+w.slice(1)).join(" "):h1Text;

    // ===== STRUKTUR ULTRA =====
    const ultraStructure = {
      EVERGREEN:["Pendahuluan","Manfaat & Kegunaan","Langkah / Tutorial Lengkap","Contoh & Studi Kasus","FAQ"],
      SEMI:["Ringkasan & Tren","Langkah / Cara","Perbandingan / Analisis","Saran Praktis"],
      NON:["Harga & Promo Terkini","Ketersediaan & Wilayah","Periode & Update","Kontak & Cara Order"]
    }[type.split("-")[0]];

    // ===== DASHBOARD =====
    const dash=document.createElement("div");
    dash.style.maxWidth="1200px"; dash.style.margin="30px auto"; dash.style.padding="15px"; dash.style.background="#f0f8ff"; dash.style.borderTop="3px solid #0078ff"; dash.style.fontFamily="Arial,sans-serif"; dash.setAttribute('data-nosnippet','true');
    const h3=document.createElement("h3"); h3.innerText="📊 AED Dashboard — Ringkasan Halaman"; dash.appendChild(h3);

    const btnContainer=document.createElement("div"); btnContainer.style.textAlign="center"; btnContainer.style.marginBottom="10px";
    const createBtn=(text,bg)=>{ const b=document.createElement("button"); b.textContent=text; b.style.background=bg; b.style.color="#000"; b.style.padding="6px 12px"; b.style.margin="3px"; b.style.borderRadius="4px"; b.style.cursor="pointer"; b.style.border="none"; b.style.fontSize="0.9em"; b.setAttribute("data-nosnippet","true"); return b;};
    const btnKoreksi=createBtn("⚙️ Koreksi & Preview","#ffeedd");
    const btnShowTable=createBtn("📊 Tampilkan Data Table","#d1e7dd");
    const btnReport=createBtn("📥 Download Laporan","#f3f3f3");
    btnContainer.append(btnKoreksi,btnShowTable,btnReport); dash.appendChild(btnContainer);

    const tableWrap=document.createElement("div"); tableWrap.style.overflowX="auto"; tableWrap.style.display="none"; tableWrap.innerHTML=`
      <table style="width:100%;border-collapse:collapse;min-width:800px;font-size:0.9em;">
        <thead style="position:sticky;top:0;background:#dff0ff;z-index:2;">
          <tr><th>Halaman</th><th>Tipe</th><th>H1</th><th>Rekom H1</th><th>Next Update</th></tr>
        </thead>
        <tbody>
          <tr><td>${document.title}</td><td>${type}</td><td>${h1Text}</td><td>${recommendedH1}</td><td>${nextUpdateStr}</td></tr>
        </tbody>
      </table>`;
    dash.appendChild(tableWrap);
    document.body.appendChild(dash);

    // ===== INTERAKSI TOMBOL =====
    btnShowTable.onclick=()=>{ tableWrap.style.display=tableWrap.style.display==="none"?"block":"none";};
    btnKoreksi.onclick=()=>{ alert(`🔍 Koreksi & Preview\n\nRekomendasi H1:\n${recommendedH1}\n\nStruktur ideal (${type}):\n${ultraStructure.join(" → ")}\n\nNext Update: ${nextUpdateStr}`); };
    btnReport.onclick=()=>{ const report=`AED REPORT — ${document.title}\nTipe Konten: ${type}\nH1 Saat Ini: ${h1Text}\nRekomendasi H1: ${recommendedH1}\n${dateModifiedStr?`Tanggal Diperbarui: ${dateModifiedStr}`:""}\nNext Update: ${nextUpdateStr}\n\nStruktur Ideal:\n${ultraStructure.join("\n")}\n\nURL: ${location.href}`.trim(); const blob=new Blob([report],{type:'text/plain'}); const link=document.createElement('a'); link.href=URL.createObjectURL(blob); link.download=`AED_Report_${document.title.replace(/\s+/g,"_")}.txt`; link.click();};

    // ===== RESPONSIVE =====
    const style=document.createElement("style");
    style.innerHTML=`@media(max-width:768px){table th,table td{padding:4px;font-size:0.8em;}table{min-width:600px;}}thead th{position:sticky;top:0;background:#dff0ff;}table th,td{border:1px solid #ccc;padding:6px;text-align:left;}`;
    document.head.appendChild(style);

    // ===== JSON-LD UPDATE =====
    if(CONFIG.updateJsonLd){ 
      try{
        const ldEls=Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
        ldEls.forEach(el=>{
          try{
            const raw=el.innerText.trim(); if(!raw) return;
            const data=JSON.parse(raw); const nodes=Array.isArray(data)?data:[data]; let mutated=false;
            nodes.forEach(node=>{
              if(node['@type'] && (node['@type'].toLowerCase().includes('product')||node['@type'].toLowerCase().includes('offer')||node['@type'].toLowerCase().includes('service'))){
                if(dateModified) node.dateModified=new Date().toISOString();
                if(type==='SEMI-EVERGREEN' && node.offers && node.offers.price) node.offers.priceValidUntil=addMonths(new Date(),CONFIG.intervals['SEMI_EVERGREEN']).toISOString();
                mutated=true;
              }
            });
            el.innerText=Array.isArray(data)?JSON.stringify(nodes,null,2):JSON.stringify(nodes,null,2);
          }catch(e){console.warn('AED JSON-LD gagal update',e);}
        });
      }catch(e){console.warn('AED JSON-LD Error',e);}
    }

    console.log("✅ AED v7.7 + Dashboard aktif, SEO-safe, responsive.");
  }catch(e){ console.error("❌ AED Error:",e);}
})(window, document);

/**
 * 🌿 Hybrid Evergreen Detector v7.1
 * ✅ Smart Section Update + Auto dateModified + Responsive Dashboard
 * Beton Jaya Readymix ©2025
 */

/* ===== 🧩 Hybrid Evergreen Detector + Smart Selective DateModified v7.6 ===== */
(function runEvergreenDetector() {
  console.log("🔍 Running Smart Selective Evergreen Detector v7.6...");

  // === Inject responsive CSS ===
  const style = document.createElement("style");
  style.textContent = `
  [data-nosnippet]{overflow-x:auto;-webkit-overflow-scrolling:touch;}
  [data-nosnippet] table{width:100%;border-collapse:collapse;min-width:700px;}
  [data-nosnippet] th,[data-nosnippet] td{border:1px solid #ddd;padding:8px;text-align:left;vertical-align:top;}
  [data-nosnippet] thead{position:sticky;top:0;background:#f9fcff;z-index:5;}
  [data-nosnippet] tr:nth-child(even){background:#fafafa;}
  @media(max-width:768px){
    [data-nosnippet] table{min-width:600px;}
    [data-nosnippet] td{font-size:13px;word-break:break-word;}
    [data-nosnippet] button{width:100%;margin-top:10px;}
  }`;
  document.head.appendChild(style);

  // === Util ===
  const cleanText = (s) => (s ? s.replace(/\s+/g, " ").trim() : "");
  const hashString = (s) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return h;
  };
  const convertToWIB = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return new Date(d.getTime() + 7 * 60 * 60 * 1000).toISOString().split("T")[0];
  };

  // === Ambil konten utama ===
  const contentRoot =
    document.querySelector("article") ||
    document.querySelector(".post-body") ||
    document.querySelector("main") ||
    document.body;

  // === Hash Global ===
  const contentText = cleanText(contentRoot.innerText);
  const globalHash = hashString(contentText);
  const oldGlobalHash = localStorage.getItem("globalHash_" + location.pathname);
  localStorage.setItem("globalHash_" + location.pathname, globalHash);

  // === Meta datePublished & dateModified ===
  let datePublished =
    convertToWIB(document.querySelector("meta[itemprop='datePublished']")?.content) ||
    "";
  let dateModified =
    convertToWIB(document.querySelector("meta[itemprop='dateModified']")?.content) ||
    datePublished;

  // === Ambil section berdasarkan H2/H3 ===
  const sections = [];
  const headings = contentRoot.querySelectorAll("h2, h3");
  let current = null;
  headings.forEach((h) => {
    if (h.tagName === "H2") {
      if (current) sections.push(current);
      current = { title: cleanText(h.innerText), content: "" };
    } else if (h.tagName === "H3" && current) {
      current.content += "\n" + cleanText(h.innerText);
    }
    let next = h.nextElementSibling;
    while (next && !/^H[23]$/i.test(next.tagName)) {
      if (next.innerText) current.content += "\n" + cleanText(next.innerText);
      next = next.nextElementSibling;
    }
  });
  if (current) sections.push(current);

  // === Deteksi tipe konten ===
  const detectType = (t) => {
    const l = t.toLowerCase();
    if (/(harga|update|promo|diskon|biaya|bulan ini|tahun)/.test(l)) return "NON-EVERGREEN";
    if (/(proyek|spesifikasi|fitur|jenis|perbandingan|keunggulan)/.test(l))
      return "SEMI-EVERGREEN";
    return "EVERGREEN";
  };

  // === Analisis perubahan per-section ===
  let importantChanged = false;
  const results = [];
  sections.forEach((sec, i) => {
    const type = detectType(sec.title + " " + sec.content);
    const hash = hashString(sec.title + sec.content);
    const key = `sec_hash_${i}_${location.pathname}`;
    const old = localStorage.getItem(key);
    const changed = old && old !== String(hash);
    localStorage.setItem(key, hash);

    if (changed && (type === "SEMI-EVERGREEN" || type === "NON-EVERGREEN")) {
      importantChanged = true;
    }

    const months = type === "EVERGREEN" ? 12 : type === "SEMI-EVERGREEN" ? 6 : 3;
    const nextUpdate = new Date();
    nextUpdate.setMonth(nextUpdate.getMonth() + months);

    const txt = sec.content.toLowerCase();
    const advice = [];
    if (/harga|biaya|tarif/.test(txt)) advice.push("Perbarui harga secara berkala.");
    if (/spesifikasi|fitur|ukuran/.test(txt)) advice.push("Tambahkan update spesifikasi terbaru.");
    if (/manfaat|fungsi/.test(txt)) advice.push("Sertakan contoh nyata penerapan.");
    if (txt.length < 400) advice.push("Perluas isi agar lebih komprehensif.");
    if (!/faq|pertanyaan/.test(txt) && i === sections.length - 1)
      advice.push("Tambahkan FAQ di bagian akhir.");

    results.push({
      section: sec.title || "(Tanpa Judul)",
      type,
      changed,
      nextUpdate: nextUpdate.toLocaleDateString(),
      advice: advice.join(" ") || "Stabil, cukup review ringan.",
    });
  });

  // === Selective dateModified Update ===
  if (oldGlobalHash && oldGlobalHash !== String(globalHash) && importantChanged) {
    dateModified = convertToWIB(new Date().toISOString());
    console.log("⚡ Update signifikan pada section penting → update dateModified:", dateModified);

    // Update schema & meta
    document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
      try {
        const d = JSON.parse(s.textContent);
        if (d.dateModified) {
          d.dateModified = dateModified;
          s.textContent = JSON.stringify(d, null, 2);
        }
      } catch {}
    });
    const meta = document.querySelector('meta[itemprop="dateModified"]');
    if (meta) meta.setAttribute("content", dateModified);
  } else {
    console.log("ℹ Tidak ada perubahan penting → dateModified tidak diperbarui.");
  }

  // === Render dashboard visual ===
  const wrap = document.createElement("div");
  wrap.setAttribute("data-nosnippet", "true");
  wrap.style = "margin-top:20px;padding:10px;border:1px solid #ccc;border-radius:8px;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,0.1);";

  const table = document.createElement("table");
  table.innerHTML = `
  <thead><tr><th>Section</th><th>Tipe</th><th>Perubahan</th><th>Next Update</th><th>Saran</th></tr></thead>
  <tbody>
    ${results
      .map(
        (r) => `
    <tr style="background:${
      r.type === "EVERGREEN"
        ? "#e8fce8"
        : r.type === "SEMI-EVERGREEN"
        ? "#fff5e0"
        : "#ffeaea"
    };">
      <td>${r.section}</td>
      <td><b>${r.type}</b></td>
      <td>${r.changed ? "✅ Berubah" : "– Stabil"}</td>
      <td>${r.nextUpdate}</td>
      <td>${r.advice}</td>
    </tr>`
      )
      .join("")}
  </tbody>`;
  wrap.appendChild(table);

  const info = document.createElement("div");
  info.style.marginTop = "8px";
  info.style.fontSize = "13px";
  info.textContent = `📅 Published: ${datePublished || "-"} | Last Modified: ${dateModified}`;
  wrap.appendChild(info);

  const btn = document.createElement("button");
  btn.textContent = "🔄 Deteksi Ulang";
  Object.assign(btn.style, {
    marginTop: "10px",
    padding: "8px 14px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  });
  btn.onclick = () => {
    wrap.remove();
    runEvergreenDetector();
  };
  wrap.appendChild(btn);

  (document.querySelector("#aed-dashboard") ||
    document.querySelector("main") ||
    document.body).appendChild(wrap);

  console.log("✅ v7.6 selesai – Selective dateModified aktif & visual indikator ditampilkan.");
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
