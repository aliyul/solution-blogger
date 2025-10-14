(async function ASEO_v7_ULTRA(){
  const API_ENDPOINT = "https://script.google.com/macros/s/AKfycby9sDB5a6IkYAGZCJ3fwW6bijS-8LlyR8lk3e_vJStvmvPekSpFcZ3T3rgnPje8yGMqTA/exec"; // Ganti ke URL Web App kamu
  const domain = location.hostname.replace("www.","");

  function el(tag, props={}, children=[]) {
    const e=document.createElement(tag);
    Object.entries(props).forEach(([k,v])=>{
      if(k==="style") Object.assign(e.style,v); else e[k]=v;
    });
    (Array.isArray(children)?children:[children]).forEach(c=>{
      if(typeof c==="string") e.insertAdjacentHTML("beforeend",c);
      else e.appendChild(c);
    });
    return e;
  }

  const footer=document.querySelector("footer");
  const dashboard=el("div",{id:"aseo_v7",style:{
    borderTop:"3px solid #ccc",padding:"14px",background:"#fff",
    fontFamily:"Arial, sans-serif","data-nosnippet":"true"
  }});
  dashboard.innerHTML=`<h3>🧠 Auto SEO Builder Ultra Kompetitif v7.0</h3>`;

  const h1=document.querySelector("h1")?.innerText||"(no H1)";
  const url=location.href;
  const snippet=(document.querySelector("article,.post-body,main")?.innerText||"").slice(0,4000);

  const toneSel=el("select",{id:"tone"},["informatif","profesional","persuasif","teknis"].map(v=>el("option",{value:v,innerText:v})));
  const minWordsInput=el("input",{type:"number",id:"minWords",value:700,style:{width:"80px",marginLeft:"6px"}});
  const btnDetect=el("button",{style:{padding:"8px 12px",marginRight:"6px",cursor:"pointer"}}, "Deteksi & Koreksi SEO");
  const resultDiv=el("div",{style:{marginTop:"12px"}});
  const scoreDiv=el("div",{id:"seoScore",style:{fontWeight:"bold",margin:"10px 0"}});
  const copyBtn=el("button",{style:{display:"none",padding:"8px 12px"}}, "Copy HTML");
  const exportBtn=el("button",{style:{display:"none",padding:"8px 12px"}}, "Export HTML");

  dashboard.append(el("div",{} ,[
    `Judul (H1): <b>${h1}</b><br>URL: <small>${url}</small><br>`,
    "Tone:", toneSel, " | Min Words:", minWordsInput, el("br"), el("br"),
    btnDetect, copyBtn, exportBtn, scoreDiv
  ]), resultDiv);

  (footer?footer.parentNode.insertBefore(dashboard,footer.nextSibling):document.body.appendChild(dashboard));

  function show(html){ resultDiv.innerHTML=html; }

  btnDetect.onclick=async()=>{
    show(`<em>Analisis SEO sedang berjalan...</em>`);
    scoreDiv.innerHTML = "";
    try{
      const payload={ h1, snippet, url, origin:domain, tone:toneSel.value, minWords:minWordsInput.value };
      const r=await fetch(API_ENDPOINT,{
        method:"POST",
        body:JSON.stringify(payload),
        headers:{"Content-Type":"application/json"}
      });
      const j=await r.json();
      if(!j.ok) throw new Error(j.error||"Error LLM");
      const d=j.result;

      const scoreColor = d.seoScore>=80?"#0a0":d.seoScore>=60?"#fa0":"#f00";
      scoreDiv.innerHTML = `🔍 <b>SEO Score:</b> <span style="color:${scoreColor};font-size:18px">${d.seoScore}</span> / 100`;

      show(`
        <b>Tipe Konten:</b> ${d.type}<br>
        <b>H1 Rekomendasi:</b> ${d.recommendedH1}<br>
        <b>Meta Description:</b> ${d.metaDescription}<br>
        <b>Audit Internal Links:</b><pre style="background:#f8f8f8;padding:6px;border:1px solid #ddd">${d.internalLinkAudit}</pre>
        <h4>Struktur SEO:</h4>
        ${(d.structure||[]).map(s=>`<b>${s.h2}</b><ul>${(s.h3||[]).map(h=>`<li>${h}</li>`).join("")}</ul>`).join("")}
        <hr><h4>Konten Final (HTML):</h4>
        <div style="background:#fafafa;padding:10px;border:1px solid #ccc"><pre>${escapeHtml(d.optimizedHtml||"")}</pre></div>
      `);

      copyBtn.style.display="inline-block";
      exportBtn.style.display="inline-block";

      copyBtn.onclick=()=>{navigator.clipboard.writeText(d.optimizedHtml||""); alert("✅ HTML disalin.");};
      exportBtn.onclick=()=>{
        const blob=new Blob([d.optimizedHtml||""],{type:"text/html"});
        const a=document.createElement("a");
        a.href=URL.createObjectURL(blob);
        a.download="optimized_seo.html";
        a.click();
      };
    }catch(e){show(`<span style="color:red">${e.message}</span>`);}
  };

  function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
})();
