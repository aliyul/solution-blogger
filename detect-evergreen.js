/* ============================================================
 🧠 Smart Evergreen Detector v10 — SAFE FLEX MODE
============================================================ */
(function () {

  function detectEvergreen({ customDateModified = null } = {}) {
    console.log("🧩 detectEvergreen() v10 — SAFE MODE");

    const clean = s => (s ? s.replace(/\s+/g, " ").trim() : "");

    function normalizeToMidnightUTC(date) {
      if (!date) return null;
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;
      d.setUTCHours(0, 0, 0, 0);
      return d.toISOString();
    }

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

    /* ---------- EVERGREEN SETTING ---------- */
    const finalType = "evergreen";
    const validityDays = 365 * 50;
    const validityMs = validityDays * 86400000;

    const nowUTC = normalizeToMidnightUTC(new Date());

    /* ---------- META ---------- */
    let metaPublished = document.querySelector('meta[itemprop="datePublished"]');
    let metaModified  = document.querySelector('meta[itemprop="dateModified"]');

    const datePublished =
      metaPublished?.content || nowUTC;

    if (!metaPublished) {
      metaPublished = document.createElement("meta");
      metaPublished.setAttribute("itemprop", "datePublished");
      metaPublished.setAttribute("content", datePublished);
      document.head.appendChild(metaPublished);
    }

    const dateModified =
      normalizeToMidnightUTC(customDateModified) || datePublished;

    if (!metaModified) {
      metaModified = document.createElement("meta");
      metaModified.setAttribute("itemprop", "dateModified");
      document.head.appendChild(metaModified);
    }
    metaModified.setAttribute("content", dateModified);

    const nextUpdate =
      normalizeToMidnightUTC(new Date(new Date(dateModified).getTime() + validityMs));

    const metaNext = document.createElement("meta");
    metaNext.setAttribute("name", "nextUpdate");
    metaNext.setAttribute("content", nextUpdate);
    document.head.appendChild(metaNext);

    /* ---------- GLOBAL SAVE ---------- */
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

  // expose function ONLY
  window.detectEvergreen = detectEvergreen;

})();
