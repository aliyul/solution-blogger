/* ============================================================
 🧠 Smart Evergreen Detector v10.1 — PRO SAFE MODE
============================================================ */
(function () {

  if (window.detectEvergreen) return; // anti double load

  function toISOWithTimezone(date) {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString(); // PRESERVE time
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
    const finalType = "evergreen";
    const validityDays = 365 * 50;
    const validityMs = validityDays * 86400000;

    /* ---------- META ---------- */
    let metaPublished = document.querySelector('meta[itemprop="datePublished"]');
    let metaModified  = document.querySelector('meta[itemprop="dateModified"]');
    let metaNext      = document.querySelector('meta[name="nextUpdate"]');

    const nowISO = new Date().toISOString();

   const datePublishedRaw = metaPublished?.content || nowISO;
const dateModifiedRaw =
  toISOWithTimezone(customDateModified) || metaModified?.content || datePublishedRaw;

// Parse ke Date object untuk komparasi valid
const publishedDateObj = new Date(datePublishedRaw);
const modifiedDateObj = new Date(dateModifiedRaw);

let finalDatePublished = datePublishedRaw;
let finalDateModified = dateModifiedRaw;

// Jika dateModified lebih kecil dari datePublished
if (modifiedDateObj < publishedDateObj) {
  finalDateModified = finalDatePublished;
}

// Buat / update meta datePublished
if (!metaPublished) {
  metaPublished = document.createElement("meta");
  metaPublished.setAttribute("itemprop", "datePublished");
  document.head.appendChild(metaPublished);
}
metaPublished.setAttribute("content", finalDatePublished);

// Buat / update meta dateModified
if (!metaModified) {
  metaModified = document.createElement("meta");
  metaModified.setAttribute("itemprop", "dateModified");
  document.head.appendChild(metaModified);
}
metaModified.setAttribute("content", finalDateModified);

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
