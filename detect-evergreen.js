//let datePublished = '';
//let dateModified = '';

/* ============================================================
 🧠 Smart Evergreen Detector v10 — Flexible Evergreen Mode
============================================================ */
function detectEvergreen({customDateModified = null} = {}) {
  console.log("🧩 Running detectEvergreen() v10 — FLEXIBLE EVERGREEN MODE");

  const clean = s => (s ? s.replace(/\s+/g, " ").trim() : "");

  function normalizeToMidnightUTC(date) {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString();
  }

  /* ---------- Grab content ---------- */
  const h1 = clean(document.querySelector("h1")?.innerText || "").toLowerCase();
  const contentEl =
    document.querySelector(".post-body.entry-content") ||
    document.querySelector("[id^='post-body-']") ||
    document.body;
  const contentText = clean(contentEl.innerText || "").toLowerCase();

  const sections = [{
    title: h1 || "artikel",
    content: contentText
  }];

  // ======================================================
  // HARD EVERGREEN SETTINGS
  // ======================================================
  const finalType = "evergreen";
  const validityDays = 365 * 50; // 10 tahun
  const validityMs = validityDays * 86400000;

  const now = new Date();
  const nowUTC = normalizeToMidnightUTC(now);

  // ======================================================
  // META INIT
  // ======================================================
  let metaDatePublished = document.querySelector('meta[itemprop="datePublished"]');
  let metaDateModified = document.querySelector('meta[itemprop="dateModified"]');

  // Pastikan datePublished ada
  datePublished = metaDatePublished?.getAttribute("content") || nowUTC;
  if (!metaDatePublished) {
    metaDatePublished = document.createElement("meta");
    metaDatePublished.setAttribute("itemprop", "datePublished");
    metaDatePublished.setAttribute("content", datePublished);
    document.head.appendChild(metaDatePublished);
  }

  // ======================================================
  // SET dateModified (custom atau sama dengan datePublished)
  // ======================================================
  if (!metaDateModified) {
    metaDateModified = document.createElement("meta");
    metaDateModified.setAttribute("itemprop", "dateModified");
    document.head.appendChild(metaDateModified);
  }

  dateModified = customDateModified ? normalizeToMidnightUTC(customDateModified) : datePublished;
  metaDateModified.setAttribute("content", dateModified);

  // ======================================================
  // SET nextUpdate untuk evergreen
  // ======================================================
  let nextUpdate = normalizeToMidnightUTC(new Date(new Date(dateModified).getTime() + validityMs));
  let metaNextUpdate = document.createElement("meta");
  metaNextUpdate.setAttribute("name", "nextUpdate");
  metaNextUpdate.setAttribute("content", nextUpdate);
  document.head.appendChild(metaNextUpdate);

  // ======================================================
  // SAVE results globally
  // ======================================================
  window.EvergreenDetectorResults = {
    resultType: finalType,
    validityDays,
    dateModified,
    datePublished,
    nextUpdate,
    sections
  };

  window.AEDMetaDates = {
    dateModified,
    datePublished,
    nextUpdate,
    type: finalType
  };

  console.log("✅ [AED] Evergreen mode aktif:");
  console.log(window.AEDMetaDates);

  // ======================================================
  // Schema priceValidUntil untuk evergreen
  // ======================================================
  let priceElements = document.querySelectorAll('[itemtype="http://schema.org/Offer"]');
  priceElements.forEach(el => {
    el.setAttribute("priceValidUntil", nextUpdate);
    console.log("💰 priceValidUntil di-set ke:", nextUpdate);
  });
}

// Evergreen standar, dateModified = datePublished
detectEvergreen();
