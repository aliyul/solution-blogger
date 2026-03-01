/* ============================================================
 🧠 Smart Evergreen Detector v10.1 — PRO SAFE MODE
============================================================ */
(function () {

  if (window.detectEvergreen) return; // anti double load

function toISOWithTimezoneLocal(date, offset = "+07:00") {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  const pad = (n) => n.toString().padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  const ss = pad(d.getSeconds());

  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}${offset}`;
}


  function detectEvergreen({ customDateModified = null } = {}) {
    console.log("🧩 detectEvergreen() v10.1 — SAFE MODE");

    const clean = s => (s ? s.replace(/\s+/g, " ").trim() : "");

    /* ---------- CONTENT ---------- */
    const h1 = clean(document.querySelector("h1")?.innerText || "").toLowerCase();
    const contentEl =
      document.querySelector(".post-body.entry-content") ||
      document.querySelector("[id^='post-body-']") ||
      document.body;

    const sections = [{
      title: h1 || "artikel",
      content: clean(contentEl.innerText || "").toLowerCase()
    }];

    /* ---------- EVERGREEN ---------- */
    /*const finalType = "evergreen";
    const validityDays = 365 * 50;
    const validityMs = validityDays * 86400000;
    */
     const finalType = "evergreen";
     const validityDays = 365 * 3; // 3 tahun
     const validityMs = validityDays * 86400000;
    /* ---------- META ---------- */
    let metaPublished = document.querySelector('meta[itemprop="datePublished"]');
    let metaModified  = document.querySelector('meta[itemprop="dateModified"]');
    let metaNext      = document.querySelector('meta[name="nextUpdate"]');

    const nowISO = new Date().toISOString();

   // Ambil nilai awal
let datePublished =
  toISOWithTimezoneLocal(metaPublished)?.content ||toISOWithTimezoneLocal(nowISO);

let dateModified =
  toISOWithTimezoneLocal(customDateModified) ||
  metaModified?.content ||
  datePublished;

// Validasi sebagai Date object
const publishedObj = new Date(datePublished);
const modifiedObj = new Date(dateModified);

// Jika dateModified < datePublished → samakan
if (modifiedObj < publishedObj) {
  dateModified = datePublished;
}

// Buat / update meta datePublished
if (!metaPublished) {
  metaPublished = document.createElement("meta");
  metaPublished.setAttribute("itemprop", "datePublished");
  document.head.appendChild(metaPublished);
}
metaPublished.setAttribute("content", datePublished);

// Buat / update meta dateModified
if (!metaModified) {
  metaModified = document.createElement("meta");
  metaModified.setAttribute("itemprop", "dateModified");
  document.head.appendChild(metaModified);
}
metaModified.setAttribute("content", dateModified);

let nextUpdate =
      toISOWithTimezoneLocal(new Date(new Date(dateModified).getTime() + validityMs));
     nextUpdate = new Date(
      new Date(dateModified).getTime() + validityMs
    ).toISOString();

    metaNext = document.createElement("meta");
    metaNext.setAttribute("name", "nextUpdate");
    if (!metaNext) {
      metaNext = document.createElement("meta");
      metaNext.setAttribute("name", "nextUpdate");
      document.head.appendChild(metaNext);
    }
    metaNext.setAttribute("content", nextUpdate);
    document.head.appendChild(metaNext);

    /* ---------- GLOBAL ---------- */
    window.AEDMetaDates = {
      type: finalType,
      datePublished,
      dateModified,
      nextUpdate
    };

    window.EvergreenDetectorResults = {
      resultType: finalType,
      validityDays,
      sections,
      ...window.AEDMetaDates
    };

    console.log("✅ Evergreen ACTIVE:", window.AEDMetaDates);

    /* ---------- SCHEMA OFFER ---------- */
    document
      .querySelectorAll('[itemtype="http://schema.org/Offer"]')
      .forEach(el => el.setAttribute("priceValidUntil", nextUpdate));
  }

  // expose
  window.detectEvergreen = detectEvergreen;

  // ✅ READY FLAG + EVENT (ANTI MISS)
  window.__detectEvergreenReady = true;
  window.dispatchEvent(new Event("detectEvergreenReady"));

})();
