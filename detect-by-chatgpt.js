(async function AED_v63_Client(){
  const API_URL = "https://script.google.com/macros/s/AKfycby9sDB5a6IkYAGZCJ3fwW6bijS-8LlyR8lk3e_vJStvmvPekSpFcZ3T3rgnPje8yGMqTA/exec"; // ganti dengan URL Web App Apps Script
  function el(tag, props={}, children=[]) {
    const e = document.createElement(tag);
    for (const k in props) {
      if (k==="style") Object.assign(e.style, props[k]);
      else if (k.startsWith("data-")) e.setAttribute(k, props[k]);
      else e[k]=props[k];
    }
    (Array.isArray(children)?children:[children]).forEach(c=>{
      if(!c) return;
      if(typeof c==="string") e.insertAdjacentHTML("beforeend",c);
      else e.appendChild(c);
    });
    return e;
  }
  function escapeHtml(s){ if(!s) return ""; return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }

  const elContent = document.querySelector("article, main, .post-body") || document.body;
  const elH1 = document.querySelector("h1");
  const h1Text = elH1 ? elH1.innerText.trim() : "";
  const snippet = (elContent ? elContent.innerText.trim().slice(0,1600) : "").trim();
  const pageUrl = location.href;

  const footer = document.querySelector("footer");
  const dash = el("div",{id:"aed_v63_dash","data-nosnippet":"true", style:{
    borderTop:"2px solid #ddd", padding:"14px", marginTop:"24px", background:"#fff", fontFamily:"system-ui", fontSize:"14px", color:"#222", zIndex:99999
  }});
  dash.innerHTML = `<h3>🧠 Auto SEO Builder Ultra Kompetitif v6.3</h3>`;
  const infoRow = el("div", {}, [`H1: <b>${escapeHtml(h1Text||"(no H1)")}</b> — URL: <small>${escapeHtml(pageUrl)}</small>`]);
  dash.appendChild(infoRow);

  // Controls
  const btnRow = el("div",{style:{marginTop:"8px"}});
  const btnDetect = el("button",{style:{padding:"8px 12px", marginRight:"8px", background:"#ffeedd", cursor:"pointer"}}, "Deteksi & Koreksi SEO");
  const btnPreview = el("button",{style:{padding:"8px 12px", marginRight:"8px", cursor:"pointer"}}, "Preview Struktur SEO");
  const btnCopy = el("button",{style:{padding:"8px 12px", marginRight:"8px", display:"none", cursor:"pointer"}}, "Copy HTML");
  const btnExport = el("button",{style:{padding:"8px 12px", marginRight:"8px", display:"none", cursor:"pointer"}}, "Export HTML");
  const minWordsInput = el("input",{type:"number", value:600, style:{width:"70px",marginRight:"8px"}});
  btnRow.appendChild(minWordsInput);
  btnRow.appendChild(btnPreview);
  btnRow.appendChild(btnDetect);
  btnRow.appendChild(btnCopy);
  btnRow.appendChild(btnExport);
  dash.appendChild(btnRow);

  const resultDiv = el("div",{id:"aedResult", style:{marginTop:"12px"}}, "");
  dash.appendChild(resultDiv);

  if(footer && footer.parentNode) footer.parentNode.insertBefore(dash,footer.nextSibling);
  else document.body.appendChild(dash);

  let lastResponse=null;

  // Preview local structure
  btnPreview.addEventListener("click",()=>{
    const structure=localPreviewStructure(h1Text,pageUrl);
    let html="<b>Preview Struktur (lokal):</b><ul>";
    structure.forEach(s=>{ html+=`<li><b>${escapeHtml(s.h2)}</b><ul>`; (s.h3||[]).forEach(h3=>html+=`<li>${escapeHtml(h3)}</li>`); html+="</ul></li>"; });
    html+="</ul>";
    resultDiv.innerHTML=html;
  });

  // DETEKSI & KOREKSI
  btnDetect.addEventListener("click",async()=>{
    resultDiv.innerHTML=`<em>Running semantic detection & corrections…</em>`;
    try{
      const resp = await fetch(API_URL,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({h1:h1Text,snippet,pageUrl,minWords:minWordsInput.value})
      });
      const j = await resp.json();
      if(!j.ok) throw new Error(j.error||"No result");
      lastResponse=j.result;

      // SEO Score visual (0-100) based on content length + internal links + structure completeness
      let score=0;
      if(lastResponse.fullHtml) score+=Math.min(40,(lastResponse.fullHtml.split(/\s+/).length/minWordsInput.value*40));
      if(lastResponse.structure) score+=Math.min(40,(lastResponse.structure.length*10));
      if(lastResponse.internalLinks) score+=Math.min(20,(lastResponse.internalLinks.length*2));
      score=Math.min(100,Math.round(score));

      resultDiv.innerHTML=`<b>Detected Type:</b> ${escapeHtml(lastResponse.type)} — SEO Score: ${score}/100<br>
      <b>Recommended H1:</b> ${escapeHtml(lastResponse.recommendedH1)}<br>
      <b>Meta:</b> ${escapeHtml(lastResponse.metaDescription)}<br>
      <b>Internal Links:</b> ${lastResponse.internalLinks?lastResponse.internalLinks.length:0}<br>
      <b>Suggestion:</b> ${escapeHtml(lastResponse.suggestion||"")}`;

      // show fullHtml preview
      const preArea=el("textarea",{id:"aed_full_html",style:{width:"100%",height:"300px",marginTop:"8px"}},lastResponse.fullHtml||"");
      resultDiv.appendChild(preArea);
      btnCopy.style.display="inline-block"; btnExport.style.display="inline-block";
    }catch(err){
      resultDiv.innerHTML=`<span style="color:red">Error: ${escapeHtml(err.message)}</span>`;
    }
  });

  // Copy
  btnCopy.addEventListener("click", async()=>{
    const ta=document.getElementById("aed_full_html");
    try{ await navigator.clipboard.writeText(ta.value); alert("✅ HTML copied"); }
    catch(e){ alert("❌ Failed: "+e.message); }
  });

  // Export
  btnExport.addEventListener("click",()=>{
    const ta=document.getElementById("aed_full_html");
    const blob=new Blob([ta.value],{type:"text/html"});
    const url=URL.createObjectURL(blob);
    const a=el("a",{href:url,download:"aed_page.html"}); document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  function localPreviewStructure(h1,url){
    const text=(h1||url||"").toLowerCase();
    const out=[];
    if(text.includes("harga")||text.includes("price")){ out.push({h2:"Harga Terbaru",h3:["Daftar Harga","Syarat & Ketentuan"]}); out.push({h2:"Cara Order",h3:["Proses Pemesanan","Kontak"]}); return out;}
    if(text.includes("panduan")||text.includes("tutorial")){ out.push({h2:"Pendahuluan",h3:["Tujuan","Langkah"]}); return out;}
    out.push({h2:"Pendahuluan",h3:["Latar Belakang"]}); out.push({h2:"Pembahasan",h3:["Subtopik 1","Subtopik 2"]});
    return out;
  }

})();
