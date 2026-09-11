/* ============================================================
 🧠 Smart Evergreen Detector v16.1 — AUTO-UPDATE BERKELANJUTAN
    ✅ SINKRON dengan V37 FULL SITE AUTO ARCHITECTURE
    ✅ PATOKAN UTAMA: H1 (Informasi → Evergreen, Harga → Cek Tabel)
    ✅ ATURAN TAHUN: H1 mengandung tahun → NON-EVERGREEN
    ✅ ATURAN HARGA: H1 harga + tabel harga → NON-EVERGREEN
    ✅ ATURAN INFORMASI: H1 informatif tanpa harga → EVERGREEN
    ✅ AUTO-UPDATE TANPA BATAS: nextUpdate → dateModified → nextUpdate
    ✅ UPDATE META, KONTEN, H1, SCHEMA OTOMATIS
    ✅ SUPPORT PLD v22.x, v20.x, v19.0, v18, v17, legacy
    ✅ FIXED: JASA rules (money-master=30, money-page=30, money-child=30)
    ✅ FIXED: PRODUK rules (variant 730 hari, sub-variant 730 hari)

    🔥🔥🔥 v16.1 CHANGELOG 🔥🔥🔥
    ✅ P1 — Deteksi dari PLD dulu (data-content-focus), baru fallback H1
    ✅ P2 — Update H1 dengan syarat STOP ≤ 2025, tidak update jika ≥ newYear
    ✅ P3 — Update konten sesuai level + content focus
           • EVERGREEN → update TAHUN saja
           • MONEY + INFORMASI → update TAHUN saja
           • MONEY + HARGA/COMMERCIAL/GABUNG → update BULAN + TAHUN
    ✅ P4 — hasPriceTable() cek header spesifik (<th>)
    ✅ P6 — Refactor :contains → queryByKeyword()
    ❌ P5 — SKIP (priceValidUntil = variable di script schema)
============================================================ */

(function () {
  if (window.detectEvergreen) return;

  // ============================================================
  // 📌 ATURAN V37 — BASE RULES
  // ============================================================
  const BASE_PAGE_LEVEL_RULES = {
    'pillar': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft' },
    'sub-pillar-tipe-2': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft-medium' },
    'sub-pillar-tipe-1': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'sub-variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'money-master': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: false, allowPriceRange: true, ctaIntensity: 'hard' },
    'money-page': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: true, allowPriceRange: false, ctaIntensity: 'hard' },
    'money-child': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: true, allowPriceRange: false, ctaIntensity: 'very-hard' }
  };

  // ============================================================
  // 📌 ATURAN V37 — PRODUK & MATERIAL
  // ============================================================
  const PRODUK_MATERIAL_RULES = {
    'pillar': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft' },
    'sub-pillar-tipe-2': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft-medium' },
    'sub-pillar-tipe-1': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'sub-variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'money-master': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: false, allowPriceRange: true, ctaIntensity: 'hard' },
    'money-page': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: true, allowPriceRange: false, ctaIntensity: 'hard' },
    'money-child': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: true, allowPriceRange: false, ctaIntensity: 'very-hard' }
  };

  // ============================================================
  // 📌 ATURAN V37 — SEWA
  // ============================================================
  const SEWA_RULES = {
    'pillar': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft' },
    'sub-pillar-tipe-2': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft-medium' },
    'sub-pillar-tipe-1': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'sub-variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'money-master': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: false, allowPriceRange: true, ctaIntensity: 'hard' },
    'money-page': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: true, allowPriceRange: false, ctaIntensity: 'hard' },
    'money-child': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: true, allowPriceRange: false, ctaIntensity: 'very-hard' }
  };

  // ============================================================
  // 📌 ATURAN V37 — JASA
  // ============================================================
  const JASA_RULES = {
    'pillar': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft' },
    'sub-pillar-tipe-2': { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft-medium' },
    'sub-pillar-tipe-1': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'sub-variant': { type: 'evergreen', validityDays: 730, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'medium' },
    'money-master': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: false, allowPriceRange: true, ctaIntensity: 'hard' },
    'money-page': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: true, allowPriceRange: false, ctaIntensity: 'hard' },
    'money-child': { type: 'non-evergreen', validityDays: 30, usePriceValidUntil: true, allowPriceRange: false, ctaIntensity: 'very-hard' }
  };

  const DEFAULT_RULE = { type: 'evergreen', validityDays: 1095, usePriceValidUntil: false, allowPriceRange: false, ctaIntensity: 'soft' };

  // ============================================================
  // 📌 KONSTANTA LEVEL
  // ============================================================
  const MONEY_LEVELS = ['money-master', 'money-page', 'money-child'];
  const EVERGREEN_LEVELS = ['pillar', 'sub-pillar-tipe-1', 'sub-pillar-tipe-2', 'variant', 'sub-variant'];

  // ============================================================
  // 📌 FUNGSI TO ISO WITH TIMEZONE LOCAL
  // ============================================================
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

  // ============================================================
  // 🆕 P6: queryByKeyword() — GANTI :contains
  // ============================================================
  function queryByKeyword(container, keywords, requireYear = true) {
    const results = [];
    const elements = container.querySelectorAll('p, span, div, time, li, td');
    elements.forEach(el => {
      const text = el.innerText?.toLowerCase() || '';
      if (!text || text.length > 500) return;
      const hasKeyword = keywords.some(kw => text.includes(kw.toLowerCase()));
      const hasYear = /\b(19|20)\d{2}\b/.test(text);
      if (hasKeyword && (!requireYear || hasYear)) {
        results.push(el);
      }
    });
    return results;
  }

  // ============================================================
  // 🆕 P3: getContentFocus() — AMBIL DARI PLD ATAU H1
  // ============================================================
  function getContentFocus(h1Detection) {
    // Prioritas 1: PLD
    const bodyFocus = document.body.getAttribute('data-content-focus');
    if (bodyFocus) {
      const normalized = bodyFocus.toUpperCase();
      console.log(`🎯 Content Focus dari PLD: ${normalized}`);
      return normalized;
    }
    
    // Prioritas 2: V379A
    if (window.V379A && window.V379A.focusKonten) {
      const normalized = String(window.V379A.focusKonten).toUpperCase();
      console.log(`🎯 Content Focus dari V379A: ${normalized}`);
      return normalized;
    }
    
    // Prioritas 3: Fallback dari h1Detection
    if (h1Detection) {
      if (h1Detection.hasYear || h1Detection.isPrice) {
        console.log(`🎯 Content Focus: HARGA (dari H1 fallback)`);
        return 'HARGA';
      }
      if (h1Detection.isInformational) {
        console.log(`🎯 Content Focus: INFORMASI (dari H1 fallback)`);
        return 'INFORMASI';
      }
    }
    
    console.log(`🎯 Content Focus: INFORMASI (default)`);
    return 'INFORMASI';
  }

  // ============================================================
  // 🆕 P3: UPDATE KONTEN SESUAI LEVEL + CONTENT FOCUS
  // ============================================================
  function updateContentByLevelAndFocus(pageLevel, contentFocus, now) {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const newMonth = monthNames[now.getMonth()];
    const newYear = now.getFullYear();
    const newDateText = `${newMonth} ${newYear}`;  // "September 2026"
    
    const isMoneyLevel = MONEY_LEVELS.includes(pageLevel);
    const isEvergreenLevel = EVERGREEN_LEVELS.includes(pageLevel);
    
    // Tentukan mode update
    let updateMode = 'year-only';  // default
    let modeReason = '';
    
    if (isEvergreenLevel) {
      updateMode = 'year-only';
      modeReason = `Evergreen level "${pageLevel}" → update tahun saja`;
    } else if (isMoneyLevel && contentFocus === 'INFORMASI') {
      updateMode = 'year-only';
      modeReason = `Money level "${pageLevel}" + INFORMASI → update tahun saja`;
    } else if (isMoneyLevel && ['HARGA', 'COMMERCIAL', 'GABUNG'].includes(contentFocus)) {
      updateMode = 'month-year';
      modeReason = `Money level "${pageLevel}" + ${contentFocus} → update bulan + tahun`;
    } else {
      updateMode = 'year-only';
      modeReason = `Default → update tahun saja`;
    }
    
    console.log(`📅 UPDATE KONTEN MODE: ${updateMode}`);
    console.log(`   📍 Alasan: ${modeReason}`);
    console.log(`   📅 Target: ${updateMode === 'month-year' ? newDateText : newYear}`);
    
    // Selector konten
    const selectors = [
      '.update-badge', '.update-badge-class', '[class*="update-badge"]',
      '.last-updated', '.updated-date', '.date-modified',
      '.post-date', '.article-date', '.publish-date',
      '.post-meta', '.entry-meta', '.article-meta',
      '.breadcrumb + p', '.toc + p', 'h1 + p'
    ];
    
    let contentUpdated = false;
    
    // Gabungkan: selector langsung + keyword-based
    const elementsSet = new Set();
    
    // Dari selector
    selectors.forEach(sel => {
      try {
        document.querySelectorAll(sel).forEach(el => elementsSet.add(el));
      } catch(e) {}
    });
    
    // Dari keyword (P6: pakai queryByKeyword)
    const keywordEls = queryByKeyword(
      document.body,
      ['diperbarui', 'update', 'terakhir', 'last updated', 'updated', 'perbarui'],
      true
    );
    keywordEls.forEach(el => elementsSet.add(el));
    
    const elements = Array.from(elementsSet);
    
    for (const el of elements) {
      if (!el || el.tagName === 'H1') continue;
      
      const originalText = el.innerText || '';
      if (!originalText.match(/\b(19|20)\d{2}\b/)) continue;
      
      // Cek apakah ada tahun yang perlu update
      const yearMatches = originalText.match(/\b(19|20)\d{2}\b/g);
      if (!yearMatches) continue;
      
      let shouldUpdate = false;
      for (const yStr of yearMatches) {
        const y = parseInt(yStr);
        if (y <= 2025) continue;   // Skip ≤ 2025
        if (y < newYear) {          // < newYear AND > 2025
          shouldUpdate = true;
          break;
        }
      }
      
      if (!shouldUpdate) continue;
      
      // Build new text
      let newText = originalText;
      
      if (updateMode === 'month-year') {
        // Ganti BULAN + TAHUN
        newText = newText
          .replace(
            /(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+(\d{4})/gi,
            (match, month, year) => {
              const y = parseInt(year);
              if (y > 2025 && y < newYear) return newDateText;
              return match;
            }
          )
          .replace(/(\d{4})-(\d{2})-(\d{2})/g, (match, y, m, d) => {
            const yearNum = parseInt(y);
            if (yearNum > 2025 && yearNum < newYear) {
              const monthName = monthNames[parseInt(m) - 1] || m;
              return `${parseInt(d)} ${monthName} ${newYear}`;
            }
            return match;
          })
          .replace(/(\d{2})\/(\d{2})\/(\d{4})/g, (match, d, m, y) => {
            const yearNum = parseInt(y);
            if (yearNum > 2025 && yearNum < newYear) {
              const monthName = monthNames[parseInt(m) - 1] || m;
              return `${parseInt(d)} ${monthName} ${newYear}`;
            }
            return match;
          });
      } else {
        // updateMode === 'year-only'
        // Ganti TAHUN saja, bulan tetap
        newText = newText.replace(/\b(19|20)\d{2}\b/g, (match) => {
          const y = parseInt(match);
          if (y > 2025 && y < newYear) return String(newYear);
          return match;
        });
      }
      
      if (newText === originalText) continue;
      
      // Update text nodes
      const textNodes = [];
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
      let node;
      while (node = walker.nextNode()) textNodes.push(node);
      
      for (const textNode of textNodes) {
        const oldText = textNode.textContent || '';
        if (!oldText.match(/\b(19|20)\d{2}\b/)) continue;
        
        let newTextNode = oldText;
        
        if (updateMode === 'month-year') {
          newTextNode = newTextNode
            .replace(
              /(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+(\d{4})/gi,
              (match, month, year) => {
                const y = parseInt(year);
                if (y > 2025 && y < newYear) return newDateText;
                return match;
              }
            )
            .replace(/(\d{4})-(\d{2})-(\d{2})/g, (match, y, m, d) => {
              const yearNum = parseInt(y);
              if (yearNum > 2025 && yearNum < newYear) {
                const monthName = monthNames[parseInt(m) - 1] || m;
                return `${parseInt(d)} ${monthName} ${newYear}`;
              }
              return match;
            })
            .replace(/(\d{2})\/(\d{2})\/(\d{4})/g, (match, d, m, y) => {
              const yearNum = parseInt(y);
              if (yearNum > 2025 && yearNum < newYear) {
                const monthName = monthNames[parseInt(m) - 1] || m;
                return `${parseInt(d)} ${monthName} ${newYear}`;
              }
              return match;
            });
        } else {
          newTextNode = newTextNode.replace(/\b(19|20)\d{2}\b/g, (match) => {
            const y = parseInt(match);
            if (y > 2025 && y < newYear) return String(newYear);
            return match;
          });
        }
        
        if (newTextNode !== oldText) {
          textNode.textContent = newTextNode;
          contentUpdated = true;
          console.log(`   ✅ Update: "${oldText.substring(0, 40)}..." → "${newTextNode.substring(0, 40)}..."`);
        }
      }
    }
    
    return { updated: contentUpdated, mode: updateMode, target: updateMode === 'month-year' ? newDateText : newYear };
  }

  // ============================================================
  // 🆕 P2: UPDATE H1 DENGAN SYARAT
  // ============================================================
  function updateH1WithRules(pageLevel, now) {
    const isMoneyLevel = MONEY_LEVELS.includes(pageLevel);
    const isEvergreenLevel = EVERGREEN_LEVELS.includes(pageLevel);
    const levelNeedsYear = isMoneyLevel || isEvergreenLevel;
    
    if (!levelNeedsYear) {
      console.log(`⏭️ Level "${pageLevel}" TIDAK butuh tahun di H1 — skip`);
      return { updated: false, reason: 'level-no-year' };
    }
    
    const h1 = document.querySelector('h1');
    if (!h1) {
      console.log(`⚠️ Tidak ada H1 ditemukan`);
      return { updated: false, reason: 'no-h1' };
    }
    
    const newYear = now.getFullYear();
    const h1Text = h1.innerText;
    const yearMatch = h1Text.match(/\b(19|20)\d{2}\b/);
    const detectedYear = yearMatch ? parseInt(yearMatch[0]) : null;
    
    // RULE 1: Tidak ada tahun → JANGAN TAMBAH
    if (!detectedYear) {
      console.log(`⏭️ H1 tidak ada tahun — JANGAN TAMBAH`);
      return { updated: false, reason: 'no-year-in-h1' };
    }
    
    // RULE 2: Tahun ≤ 2025 → STOP
    if (detectedYear <= 2025) {
      console.log(`🛑 H1 STOP: tahun ${detectedYear} ≤ 2025`);
      return { updated: false, reason: 'year-too-old' };
    }
    
    // RULE 3: Tahun ≥ newYear → tidak update
    if (detectedYear >= newYear) {
      console.log(`✅ H1 tidak perlu update: ${detectedYear} >= ${newYear}`);
      return { updated: false, reason: 'year-already-current' };
    }
    
    // RULE 4: Tahun < newYear AND > 2025 → UPDATE
    const newH1 = h1Text.replace(/\b(19|20)\d{2}\b/, newYear);
    if (newH1 !== h1Text) {
      h1.innerText = newH1;
      console.log(`✅ H1: Tahun diupdate ${detectedYear} → ${newYear}`);
      console.log(`   📝 "${h1Text}" → "${newH1}"`);
      return { updated: true, from: detectedYear, to: newYear };
    }
    
    return { updated: false, reason: 'no-change' };
  }

  // ============================================================
  // 📌 AUTO-UPDATE DATE BERKELANJUTAN
  // ============================================================
  function autoUpdateDates(pageLevel, contentFocus) {
    console.log("🔄 AUTO-UPDATE: Memeriksa tanggal...");
    
    let metaModified = document.querySelector('meta[itemprop="dateModified"]');
    let metaNext = document.querySelector('meta[name="nextUpdate"]');
    let metaPublished = document.querySelector('meta[itemprop="datePublished"]');
    
    // STEP 1: Ambil nilai saat ini
    let currentModified = metaModified ? metaModified.getAttribute('content') : null;
    let currentNext = metaNext ? metaNext.getAttribute('content') : null;
    
    if (!currentNext) {
      console.log("⚠️ Tidak ada nextUpdate, skip auto-update");
      return false;
    }
    
    const now = new Date();
    const nextDate = new Date(currentNext);
    const currentModifiedDate = currentModified ? new Date(currentModified) : now;
    
    // STEP 2: CEK APAKAH SUDAH LEWAT NEXT UPDATE
    if (now < nextDate) {
      console.log(`⏭️ Belum lewat nextUpdate (${currentNext}), tidak perlu update`);
      return false;
    }
    
    console.log(`🔄 NEXTUPDATE LEWAT! ${currentNext} → Sekarang ${now.toISOString()}`);
    
    // STEP 3: Hitung validity days
    let validityDays = 30;
    if (currentModified && currentNext) {
      const diffMs = nextDate.getTime() - currentModifiedDate.getTime();
      const diffDays = Math.round(diffMs / 86400000);
      if (diffDays > 0) {
        validityDays = diffDays;
        console.log(`📅 Validity days dari meta: ${validityDays} hari`);
      }
    }
    
    // STEP 4: Buat tanggal baru
    const newModified = now;
    const newNext = new Date(now.getTime() + (validityDays * 86400000));
    
    const newModifiedStr = toISOWithTimezoneLocal(newModified);
    const newNextStr = toISOWithTimezoneLocal(newNext);
    
    console.log(`📅 New dateModified: ${newModifiedStr}`);
    console.log(`📅 New nextUpdate: ${newNextStr}`);
    
    // STEP 5: Update meta tags
    if (metaModified) {
      metaModified.setAttribute('content', newModifiedStr);
    } else {
      metaModified = document.createElement("meta");
      metaModified.setAttribute("itemprop", "dateModified");
      metaModified.setAttribute("content", newModifiedStr);
      document.head.appendChild(metaModified);
    }
    
    if (metaNext) {
      metaNext.setAttribute('content', newNextStr);
    } else {
      metaNext = document.createElement("meta");
      metaNext.setAttribute("name", "nextUpdate");
      metaNext.setAttribute("content", newNextStr);
      document.head.appendChild(metaNext);
    }
    
    if (!metaPublished) {
      metaPublished = document.createElement("meta");
      metaPublished.setAttribute("itemprop", "datePublished");
      metaPublished.setAttribute("content", newModifiedStr);
      document.head.appendChild(metaPublished);
    }
    
    // STEP 6: Update schema Offer priceValidUntil
    document.querySelectorAll('[itemtype="http://schema.org/Offer"]').forEach(el => {
      el.setAttribute('priceValidUntil', newNextStr);
    });
    console.log(`✅ Schema Offer priceValidUntil diupdate`);
    
    // STEP 7: Update window.AEDMetaDates
    if (window.AEDMetaDates) {
      window.AEDMetaDates.dateModified = newModifiedStr;
      window.AEDMetaDates.nextUpdate = newNextStr;
      window.AEDMetaDates.lastAutoUpdate = now.toISOString();
      window.AEDMetaDates.updateCount = (window.AEDMetaDates.updateCount || 0) + 1;
      console.log(`✅ AEDMetaDates diupdate (update ke-${window.AEDMetaDates.updateCount})`);
    }
    
    // STEP 8: Update body class
    document.body.classList.add('auto-updated');
    document.body.setAttribute('data-last-auto-update', now.toISOString());
    document.body.setAttribute('data-update-count', (parseInt(document.body.getAttribute('data-update-count') || '0') + 1).toString());
    
    // ============================================================
    // 🆕 STEP 9 (P3): UPDATE KONTEN SESUAI LEVEL + CONTENT FOCUS
    // ============================================================
    const contentResult = updateContentByLevelAndFocus(pageLevel, contentFocus, now);
    if (contentResult.updated) {
      console.log(`✅ Konten diupdate: mode=${contentResult.mode}, target=${contentResult.target}`);
    } else {
      console.log(`⏭️ Tidak ada konten yang perlu diupdate`);
    }
    
    // ============================================================
    // 🆕 STEP 10 (P2): UPDATE H1 DENGAN SYARAT
    // ============================================================
    const h1Result = updateH1WithRules(pageLevel, now);
    if (h1Result.updated) {
      console.log(`✅ H1 diupdate: ${h1Result.from} → ${h1Result.to}`);
    } else {
      console.log(`⏭️ H1 tidak diupdate: ${h1Result.reason}`);
    }
    
    console.log(`✅ AUTO-UPDATE SELESAI! nextUpdate baru: ${newNextStr}`);
    console.log(`   📅 dateModified: ${newModifiedStr}`);
    console.log(`   📅 update ke-${document.body.getAttribute('data-update-count')}`);
    
    return true;
  }

  // ============================================================
  // 🆕 P1: FUNGSI DETEKSI KONTEN — PLD DULU, BARU H1
  // ============================================================
  function detectContentTypeByH1() {
    const h1 = document.querySelector('h1');
    if (!h1) {
      console.warn('⚠️ H1 tidak ditemukan, menggunakan fallback konten');
      return { 
        isInformational: false, 
        isPrice: false, 
        hasYear: false,
        h1Text: '', 
        confidence: 'low',
        reason: 'H1 tidak ditemukan',
        source: 'fallback'
      };
    }
    
    const h1Text = h1.innerText.toLowerCase();
    
    // ============================================================
    // P1: PRIORITAS 1 — PLD (data-content-focus)
    // ============================================================
    const bodyFocus = document.body.getAttribute('data-content-focus');
    if (bodyFocus) {
      const normalized = bodyFocus.toUpperCase();
      console.log(`🎯 Content Focus dari PLD: ${normalized}`);
      
      const hasYear = /\b(19|20)\d{2}\b/.test(h1Text);
      
      if (normalized === 'INFORMASI') {
        return {
          isInformational: true,
          isPrice: false,
          hasYear: hasYear,
          h1Text: h1Text,
          infoScore: 0,
          priceScore: 0,
          hasRpFormat: false,
          hasNumberWithUnit: false,
          hasPriceNumber: false,
          reason: `PLD data-content-focus = INFORMASI`,
          confidence: 'high',
          source: 'pld'
        };
      }
      if (['HARGA', 'COMMERCIAL', 'GABUNG'].includes(normalized)) {
        return {
          isInformational: false,
          isPrice: true,
          hasYear: hasYear,
          h1Text: h1Text,
          infoScore: 0,
          priceScore: 0,
          hasRpFormat: false,
          hasNumberWithUnit: false,
          hasPriceNumber: false,
          reason: `PLD data-content-focus = ${normalized}`,
          confidence: 'high',
          source: 'pld'
        };
      }
    }
    
    // ============================================================
    // P1: PRIORITAS 2 — V379A
    // ============================================================
    if (window.V379A && window.V379A.focusKonten) {
      const normalized = String(window.V379A.focusKonten).toUpperCase();
      console.log(`🎯 Content Focus dari V379A: ${normalized}`);
      
      const hasYear = /\b(19|20)\d{2}\b/.test(h1Text);
      
      if (normalized === 'INFORMASI') {
        return {
          isInformational: true,
          isPrice: false,
          hasYear: hasYear,
          h1Text: h1Text,
          reason: `V379A focusKonten = INFORMASI`,
          confidence: 'high',
          source: 'v379a'
        };
      }
      if (['HARGA', 'COMMERCIAL', 'GABUNG'].includes(normalized)) {
        return {
          isInformational: false,
          isPrice: true,
          hasYear: hasYear,
          h1Text: h1Text,
          reason: `V379A focusKonten = ${normalized}`,
          confidence: 'high',
          source: 'v379a'
        };
      }
    }
    
    // ============================================================
    // P1: PRIORITAS 3 — Fallback ke H1 (yang lama)
    // ============================================================
    console.log(`⚠️ PLD/V379A tidak tersedia, fallback ke H1 detection`);
    
    // 1. Cek tahun di H1
    const yearPattern = /\b(19|20)\d{2}\b/;
    const hasYear = yearPattern.test(h1Text);
    
    if (hasYear) {
      console.log(`📅 H1 mengandung tahun → NON-EVERGREEN (wajib)`);
      return {
        isInformational: false,
        isPrice: true,
        hasYear: true,
        h1Text: h1Text,
        infoScore: 0,
        priceScore: 0,
        hasRpFormat: false,
        hasNumberWithUnit: false,
        hasPriceNumber: false,
        reason: 'H1 mengandung tahun (wajib non-evergreen)',
        confidence: 'high',
        source: 'h1-fallback'
      };
    }
    
    // 2. Kata kunci informatif
    const informationalKeywords = [
      'panduan', 'spesifikasi', 'keunggulan', 'cara memilih', 'tips', 
      'perbedaan', 'jenis', 'apa itu', 'pengertian', 'informasi',
      'standar', 'mutu', 'ukuran', 'komponen', 'bahan', 'material',
      'panduan lengkap', 'lengkap', 'solusi', 'rekomendasi', 'penjelasan',
      'karakteristik', 'kelebihan', 'kekurangan', 'fungsi', 'manfaat'
    ];
    
    // 3. Kata kunci harga
    const priceKeywords = [
      'harga', 'biaya', 'tarif', 'estimasi', 'rp', 'rupiah',
      'per meter', 'per lembar', 'per batang', 'per kubik',
      'promo', 'diskon', 'penawaran', 'cost', 'budget',
      'uang', 'pembayaran', 'cicilan', 'kredit'
    ];
    
    let infoScore = 0;
    let priceScore = 0;
    
    informationalKeywords.forEach(keyword => {
      if (h1Text.includes(keyword)) infoScore++;
    });
    
    priceKeywords.forEach(keyword => {
      if (h1Text.includes(keyword)) priceScore++;
    });
    
    const hasRpFormat = /Rp\s*[\d.,]+/.test(h1Text);
    const hasNumberWithUnit = /[\d.,]+\s*(per|meter|lembar|batang|kubik|m2|m²|cm|mm|kg|ton)/.test(h1Text);
    const hasPriceNumber = /[\d.,]+\s*(juta|ribu|rb|jt|k|juta-an|jutaan)/.test(h1Text);
    
    let isInformational = false;
    let isPrice = false;
    let reason = '';
    
    if (infoScore >= 2 && priceScore === 0 && !hasRpFormat && !hasNumberWithUnit) {
      isInformational = true;
      reason = `H1 mengandung kata informatif tanpa harga (score: ${infoScore})`;
    }
    else if (priceScore >= 2 || hasRpFormat || hasNumberWithUnit || hasPriceNumber) {
      isPrice = true;
      reason = `H1 mengandung kata harga (score: ${priceScore})`;
    }
    else if (h1Text.includes('panduan') || h1Text.includes('spesifikasi') || h1Text.includes('keunggulan')) {
      isInformational = true;
      reason = `H1 mengandung kata 'panduan/spesifikasi/keunggulan'`;
    }
    else {
      const bodyText = document.body.innerText.toLowerCase();
      const eduKeywords = ['panduan', 'spesifikasi', 'keunggulan', 'cara memilih', 'tips', 'perbedaan', 'jenis', 'apa itu'];
      let eduScore = 0;
      eduKeywords.forEach(k => {
        if (bodyText.includes(k)) eduScore++;
      });
      if (eduScore >= 3 && !bodyText.includes('harga') && !bodyText.includes('biaya')) {
        isInformational = true;
        reason = `Fallback: konten edukatif (score: ${eduScore})`;
      } else if (bodyText.includes('harga') || bodyText.includes('biaya')) {
        isPrice = true;
        reason = 'Fallback: konten mengandung kata harga/biaya';
      } else {
        isInformational = true;
        reason = 'Fallback: default ke evergreen (tidak terdeteksi harga)';
      }
    }
    
    return {
      isInformational,
      isPrice,
      hasYear,
      h1Text: h1Text,
      infoScore,
      priceScore,
      hasRpFormat,
      hasNumberWithUnit,
      hasPriceNumber,
      reason,
      confidence: infoScore >= 2 || priceScore >= 2 || hasYear ? 'high' : 'medium',
      source: 'h1-fallback'
    };
  }

  // ============================================================
  // 🆕 P4: hasPriceTable() — CEK HEADER SPESIFIK (<th>)
  // ============================================================
  function hasPriceTable() {
    const tables = document.querySelectorAll('table');
    let priceTableFound = false;
    let tableDetails = [];
    
    tables.forEach((table, index) => {
      // P4: Cek header spesifik
      const headers = Array.from(table.querySelectorAll('th'))
        .map(th => th.innerText.toLowerCase().trim());
      
      // Cek apakah ada header "harga"/"biaya"/"tarif"/"price"/"cost"
      const hasPriceHeader = headers.some(h => 
        /harga|biaya|tarif|price|cost|rate/i.test(h)
      );
      
      // Fallback: cek text tabel jika tidak ada <th>
      let hasPriceColumn = hasPriceHeader;
      if (headers.length === 0) {
        const tableText = table.innerText.toLowerCase();
        hasPriceColumn = /harga|biaya|estimasi|rp|rupiah|per meter|per lembar|total|subtotal/i.test(tableText);
      }
      
      // Cek angka minimal 3
      const tableText = table.innerText;
      const numbers = tableText.match(/[\d.,]+/g);
      const hasNumbers = numbers && numbers.length >= 3;
      
      // Cek satuan harga
      const hasUnit = /per\s*(meter|m|lembar|lbr|batang|buah|unit|kg|ton|kubik|m³|m2|m²)/i.test(tableText);
      
      if (hasPriceColumn && hasNumbers) {
        priceTableFound = true;
        tableDetails.push({
          index: index,
          hasPriceHeader,
          hasNumbers,
          hasUnit,
          numberCount: numbers ? numbers.length : 0,
          headerPreview: headers.slice(0, 5).join(', '),
          preview: tableText.substring(0, 100)
        });
      }
    });
    
    if (priceTableFound) {
      console.log('💰 Tabel HARGA ditemukan:', tableDetails);
    } else {
      console.log('📋 Tidak ada tabel harga (hanya tabel spesifikasi/informasi)');
    }
    
    return { found: priceTableFound, details: tableDetails };
  }

  // ============================================================
  // 📌 TUNGGU PAGE LEVEL DETECTOR READY
  // ============================================================
  function waitForPageLevelDetector() {
    return new Promise((resolve) => {
      if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
        console.log("✅ Page Level Detector v22.x already ready");
        resolve();
        return;
      }
      if (window.pageLevelDetectorv20 && typeof window.pageLevelDetectorv20.detect === 'function') {
        console.log("✅ Page Level Detector v20.x already ready");
        resolve();
        return;
      }
      if (window.pageLevelDetectorv19 && typeof window.pageLevelDetectorv19.detect === 'function') {
        console.log("✅ Page Level Detector v19 already ready");
        resolve();
        return;
      }
      if (window.pageLevelDetectorV18 && typeof window.pageLevelDetectorV18.detect === 'function') {
        console.log("✅ Page Level Detector v18 already ready");
        resolve();
        return;
      }
      if (window.pageLevelDetectorV17 && typeof window.pageLevelDetectorV17.detect === 'function') {
        console.log("✅ Page Level Detector v17 already ready");
        resolve();
        return;
      }
      if (window.pageLevelDetector && typeof window.pageLevelDetector.detect === 'function') {
        console.log("✅ Page Level Detector legacy already ready");
        resolve();
        return;
      }
      
      const onReadyV22 = () => { console.log("✅ PLD v22.x ready (event)"); resolve(); };
      const onReadyV20 = () => { console.log("✅ PLD v20.x ready (event)"); resolve(); };
      const onReadyV19 = () => { console.log("✅ PLD v19 ready (event)"); resolve(); };
      const onReadyV18 = () => { console.log("✅ PLD v18 ready (event fallback)"); resolve(); };
      const onReadyLegacy = () => { console.log("✅ PLD legacy ready (event fallback)"); resolve(); };
      
      window.addEventListener("pageLevelDetectorv22Ready", onReadyV22, { once: true });
      window.addEventListener("pageLevelDetectorv20Ready", onReadyV20, { once: true });
      window.addEventListener("pageLevelDetectorv19Ready", onReadyV19, { once: true });
      window.addEventListener("pageLevelDetectorV19Ready", onReadyV19, { once: true });
      window.addEventListener("pageLevelDetectorv18Ready", onReadyV18, { once: true });
      window.addEventListener("pageLevelDetectorReady", onReadyLegacy, { once: true });
      
      setTimeout(() => {
        if (window.pageLevelDetectorv22 || window.pageLevelDetectorv20 || 
            window.pageLevelDetectorv19 || window.pageLevelDetectorV18 || 
            window.pageLevelDetector) {
          console.log("✅ PLD found on timeout fallback");
          resolve();
        } else {
          console.error("❌ Page Level Detector not available, using fallback defaults");
          window.pageLevelDetector = {
            detect: () => 'pillar',
            detectEntityType: () => 'produk'
          };
          resolve();
        }
      }, 10000);
    });
  }

  // ============================================================
  // 📌 GET PAGE LEVEL DARI DETECTOR
  // ============================================================
  function getPageLevelAndEntityType() {
    let pageLevel = 'pillar';
    let entityType = 'produk';
    let detectorVersion = 'unknown';
    let confidence = null;
    let strategies = null;
    let strategyCount = null;
    
    if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
      try {
        pageLevel = window.pageLevelDetectorv22.detect();
        entityType = window.pageLevelDetectorv22.detectEntityType();
        detectorVersion = 'v22.x';
        if (typeof window.pageLevelDetectorv22.getConfidenceScore === 'function') {
          const confidenceScore = window.pageLevelDetectorv22.getConfidenceScore();
          confidence = confidenceScore.confidence;
          strategies = confidenceScore.strategies;
          strategyCount = confidenceScore.strategyCount;
        }
        console.log(`📌 [${detectorVersion}] Detected: pageLevel=${pageLevel}, entityType=${entityType}`);
        if (confidence) {
          console.log(`   🎯 Confidence: ${confidence}% (${strategyCount} strategies: ${strategies?.join(", ")})`);
        }
        return { pageLevel, entityType, detectorVersion, confidence, strategies, strategyCount };
      } catch(e) { console.warn("v22.x error:", e); }
    }
    
    if (window.pageLevelDetectorv20 && typeof window.pageLevelDetectorv20.detect === 'function') {
      try {
        pageLevel = window.pageLevelDetectorv20.detect();
        entityType = window.pageLevelDetectorv20.detectEntityType();
        detectorVersion = 'v20.x';
        console.log(`📌 [${detectorVersion}] Detected: pageLevel=${pageLevel}, entityType=${entityType}`);
        return { pageLevel, entityType, detectorVersion };
      } catch(e) { console.warn("v20.x error:", e); }
    }
    
    if (window.pageLevelDetectorv19 && typeof window.pageLevelDetectorv19.detect === 'function') {
      try {
        pageLevel = window.pageLevelDetectorv19.detect();
        entityType = window.pageLevelDetectorv19.detectEntityType();
        detectorVersion = 'v19';
        console.log(`📌 [${detectorVersion}] Detected: pageLevel=${pageLevel}, entityType=${entityType}`);
        return { pageLevel, entityType, detectorVersion };
      } catch(e) { console.warn("v19 error:", e); }
    }
    
    if (window.pageLevelDetectorV18 && typeof window.pageLevelDetectorV18.detect === 'function') {
      try {
        pageLevel = window.pageLevelDetectorV18.detect();
        entityType = window.pageLevelDetectorV18.detectEntityType();
        detectorVersion = 'v18';
        console.log(`📌 [${detectorVersion}] Detected: pageLevel=${pageLevel}, entityType=${entityType}`);
        return { pageLevel, entityType, detectorVersion };
      } catch(e) { console.warn("v18 error:", e); }
    }
    
    if (window.pageLevelDetectorV17 && typeof window.pageLevelDetectorV17.detect === 'function') {
      try {
        pageLevel = window.pageLevelDetectorV17.detect();
        entityType = window.pageLevelDetectorV17.detectEntityType();
        detectorVersion = 'v17';
        console.log(`📌 [${detectorVersion}] Detected: pageLevel=${pageLevel}, entityType=${entityType}`);
        return { pageLevel, entityType, detectorVersion };
      } catch(e) { console.warn("v17 error:", e); }
    }
    
    if (window.pageLevelDetector && typeof window.pageLevelDetector.detect === 'function') {
      try {
        pageLevel = window.pageLevelDetector.detect();
        entityType = window.pageLevelDetector.detectEntityType();
        detectorVersion = 'legacy';
        console.log(`📌 [${detectorVersion}] Detected: pageLevel=${pageLevel}, entityType=${entityType}`);
        return { pageLevel, entityType, detectorVersion };
      } catch(e) { console.warn("legacy error:", e); }
    }
    
    console.warn("⚠️ No detector found, using defaults");
    return { pageLevel, entityType, detectorVersion: 'none' };
  }

  // ============================================================
  // 📌 GET RULES BERDASARKAN ENTITY TYPE, PAGE LEVEL, DAN JENIS KONTEN
  // ============================================================
  function getRulesByEntityType(entityType, pageLevel, h1Detection) {
    console.log(`📌 Getting rules for entityType=${entityType}, pageLevel=${pageLevel}`);
    console.log(`   📊 H1 Detection: informational=${h1Detection.isInformational}, price=${h1Detection.isPrice}, hasYear=${h1Detection.hasYear}`);
    
    const isMoneyLevel = MONEY_LEVELS.includes(pageLevel);
    
    // ATURAN 1: H1 mengandung TAHUN → WAJIB NON-EVERGREEN
    if (isMoneyLevel && h1Detection.hasYear) {
      console.warn(`⚠️ H1 mengandung TAHUN → WAJIB NON-EVERGREEN`);
      console.warn(`   → H1: "${h1Detection.h1Text}"`);
    }
    
    // ATURAN 2: H1 INFORMATIF tanpa harga → EVERGREEN
    if (isMoneyLevel && h1Detection.isInformational && !h1Detection.isPrice && !h1Detection.hasYear) {
      console.warn(`⚠️ PERINGATAN: Halaman ${pageLevel} terdeteksi Money Level tapi H1 INFORMATIF TANPA HARGA!`);
      console.warn(`   → H1: "${h1Detection.h1Text}"`);
      console.warn(`   → Alasan: ${h1Detection.reason}`);
      console.warn(`   → Override ke EVERGREEN (3 tahun)`);
      
      document.body.classList.add('warning-h1-informational');
      
      return { 
        type: 'evergreen', 
        validityDays: 1095, 
        usePriceValidUntil: false, 
        allowPriceRange: false, 
        ctaIntensity: 'soft-medium',
        overridden: true,
        overrideReason: `H1 informatif tanpa harga: "${h1Detection.h1Text}" — ${h1Detection.reason}`
      };
    }
    
    // ATURAN 3: H1 mengandung HARGA → CEK TABEL HARGA
    if (isMoneyLevel && h1Detection.isPrice) {
      const priceTableResult = hasPriceTable();
      
      if (priceTableResult.found) {
        console.log(`✅ H1 mengandung harga DAN ada tabel harga → NON-EVERGREEN`);
      } else {
        console.warn(`⚠️ H1 mengandung harga TAPI TIDAK ADA TABEL HARGA!`);
        console.warn(`   → Override ke EVERGREEN (konten informatif)`);
        
        document.body.classList.add('warning-h1-price-no-table');
        
        return { 
          type: 'evergreen', 
          validityDays: 1095, 
          usePriceValidUntil: false, 
          allowPriceRange: false, 
          ctaIntensity: 'soft-medium',
          overridden: true,
          overrideReason: `H1 mengandung harga tapi tidak ada tabel harga: "${h1Detection.h1Text}"`
        };
      }
    }
    
    // ATURAN 4: Default berdasarkan entity
    if (entityType === 'jasa') {
      const rule = JASA_RULES[pageLevel];
      if (rule) return rule;
      return DEFAULT_RULE;
    }
    
    if (entityType === 'sewa') {
      const rule = SEWA_RULES[pageLevel];
      if (rule) return rule;
      return BASE_PAGE_LEVEL_RULES[pageLevel] || DEFAULT_RULE;
    }
    
    if (entityType === 'produk') {
      const rule = PRODUK_MATERIAL_RULES[pageLevel];
      if (rule) return rule;
      return BASE_PAGE_LEVEL_RULES[pageLevel] || DEFAULT_RULE;
    }
    
    if (entityType === 'material') {
      const rule = PRODUK_MATERIAL_RULES[pageLevel];
      if (rule) return rule;
      return BASE_PAGE_LEVEL_RULES[pageLevel] || DEFAULT_RULE;
    }
    
    return BASE_PAGE_LEVEL_RULES[pageLevel] || DEFAULT_RULE;
  }

  // ============================================================
  // 📌 FUNGSI PROSES META DATES
  // ============================================================
  async function processMetaDates(customDateModified, finalType, validityMs, usePriceValidUntil, pageLevel, entityType, ctaIntensity, allowPriceRange, detectorVersion, confidence, strategies, strategyCount, isOverridden, overrideReason, h1Detection) {
    
    let metaPublished = document.querySelector('meta[itemprop="datePublished"]');
    let metaModified = document.querySelector('meta[itemprop="dateModified"]');
    let metaNext = document.querySelector('meta[name="nextUpdate"]');

    const nowISO = new Date().toISOString();

    let datePublished = toISOWithTimezoneLocal(metaPublished?.content) || toISOWithTimezoneLocal(nowISO);
    let dateModified = toISOWithTimezoneLocal(customDateModified) || toISOWithTimezoneLocal(metaModified?.content) || datePublished;

    const publishedObj = new Date(datePublished);
    const modifiedObj = new Date(dateModified);
    if (modifiedObj < publishedObj) {
      dateModified = datePublished;
    }

    if (!metaPublished) {
      metaPublished = document.createElement("meta");
      metaPublished.setAttribute("itemprop", "datePublished");
      document.head.appendChild(metaPublished);
    }
    metaPublished.setAttribute("content", datePublished);

    if (!metaModified) {
      metaModified = document.createElement("meta");
      metaModified.setAttribute("itemprop", "dateModified");
      document.head.appendChild(metaModified);
    }
    metaModified.setAttribute("content", dateModified);

    let nextUpdate = toISOWithTimezoneLocal(new Date(new Date(dateModified).getTime() + validityMs));

    if (!metaNext) {
      metaNext = document.createElement("meta");
      metaNext.setAttribute("name", "nextUpdate");
      document.head.appendChild(metaNext);
    }
    metaNext.setAttribute("content", nextUpdate);

    if (usePriceValidUntil && h1Detection && h1Detection.isPrice) {
      document.querySelectorAll('[itemtype="http://schema.org/Offer"]').forEach(el => {
        el.setAttribute("priceValidUntil", nextUpdate);
      });
      console.log(`✅ priceValidUntil added to Offers → ${nextUpdate}`);
    } else {
      document.querySelectorAll('[itemtype="http://schema.org/Offer"]').forEach(el => {
        el.removeAttribute("priceValidUntil");
      });
      console.log(`✅ priceValidUntil removed (${finalType} content - no price in H1)`);
    }
    
    document.body.classList.add(`page-level-${pageLevel}`);
    document.body.classList.add(`entity-type-${entityType}`);
    document.body.classList.add(`content-type-${finalType}`);
    document.body.classList.add(`cta-intensity-${ctaIntensity}`);
    
    if (allowPriceRange) {
      document.body.classList.add(`allow-price-range`);
    }
    
    if (h1Detection) {
      if (h1Detection.isInformational) {
        document.body.classList.add('h1-informational');
      }
      if (h1Detection.isPrice) {
        document.body.classList.add('h1-price');
      }
      if (h1Detection.hasYear) {
        document.body.classList.add('h1-has-year');
      }
    }
    
    if (isOverridden) {
      document.body.classList.add('overridden-evergreen');
    }

    let validityLabel = '';
    const validityDays = validityMs / 86400000;

    if (isOverridden) {
      validityLabel = `EVERGREEN (OVERRIDE) — ${validityDays} hari — ${entityType} / ${pageLevel}`;
    } else if (finalType === 'evergreen') {
        if (validityDays >= 1095) validityLabel = 'EVERGREEN (3 tahun) — V37';
        else if (validityDays >= 730) validityLabel = 'EVERGREEN (2 tahun) — V37';
        else if (validityDays >= 365) validityLabel = 'EVERGREEN (1 tahun) — V37';
        else validityLabel = `EVERGREEN (${validityDays} hari) — V37`;
    } else if (finalType === 'non-evergreen') {
        validityLabel = `NON-EVERGREEN (${validityDays} hari) — ${entityType}/${pageLevel}`;
    } else {
        validityLabel = `${finalType.toUpperCase()} (${validityDays} hari)`;
    }
    
    window.AEDMetaDates = {
      type: finalType,
      entityType: entityType,
      pageLevel: pageLevel,
      datePublished,
      dateModified,
      nextUpdate,
      validityDays: validityMs / 86400000,
      usePriceValidUntil,
      ctaIntensity,
      allowPriceRange,
      detectorVersion: detectorVersion || 'v16.1',
      detectionConfidence: confidence || null,
      detectionStrategies: strategies || null,
      detectionStrategyCount: strategyCount || null,
      isOverridden: isOverridden || false,
      overrideReason: overrideReason || null,
      h1Detection: h1Detection || null,
      lastAutoUpdate: null,
      updateCount: 0
    };

    window.EvergreenDetectorResults = window.AEDMetaDates;

    console.log(`✅ ${finalType.toUpperCase()} ACTIVE:`, window.AEDMetaDates);
    console.log(`📋 SEO Rules Applied (V37) for ${window.location.hostname}:`);
    console.log(`   - Page Level: ${pageLevel}`);
    console.log(`   - Entity Type: ${entityType}`);
    console.log(`   - Content Type: ${validityLabel}`);
    console.log(`   - CTA Intensity: ${ctaIntensity}`);
    console.log(`   - Next Update: ${nextUpdate}`);
    console.log(`   - H1: "${h1Detection?.h1Text || '(no h1)'}"`);
    console.log(`   - H1 Source: ${h1Detection?.source || 'N/A'}`);
    console.log(`   - H1 Reason: ${h1Detection?.reason || 'N/A'}`);
    if (isOverridden) {
      console.warn(`   ⚠️ OVERRIDDEN: ${overrideReason}`);
    }
    console.log(`🧩 processMetaDates() v16.1 — FINISHED ✅`);
  }

  // ============================================================
  // 📌 FUNGSI UTAMA DETECT EVERGREEN
  // ============================================================
  async function detectEvergreen({ customDateModified = null } = {}) {
    console.log("🧩 detectEvergreen() v16.1 — AUTO-UPDATE BERKELANJUTAN — Loading...");
    
    await waitForPageLevelDetector();
    
    const { pageLevel, entityType, detectorVersion, confidence, strategies, strategyCount } = getPageLevelAndEntityType();
    
    console.log(`📌 Raw detection: pageLevel=${pageLevel}, entityType=${entityType}, detector=${detectorVersion}`);
    if (confidence) {
      console.log(`   🎯 Detection Confidence: ${confidence}% (${strategyCount} strategies)`);
    }
    
    // P1: Deteksi konten (PLD dulu, baru H1)
    const h1Detection = detectContentTypeByH1();
    console.log(`📊 Content Detection Result: informational=${h1Detection.isInformational}, price=${h1Detection.isPrice}, hasYear=${h1Detection.hasYear}`);
    console.log(`   📝 H1: "${h1Detection.h1Text}"`);
    console.log(`   📌 Source: ${h1Detection.source || 'N/A'}`);
    console.log(`   📌 Reason: ${h1Detection.reason}`);
    
    // P3: Ambil content focus untuk update konten
    const contentFocus = getContentFocus(h1Detection);
    console.log(`🎯 Content Focus Final: ${contentFocus}`);
    
    const rule = getRulesByEntityType(entityType, pageLevel, h1Detection);
    const finalType = rule.type;
    const validityDays = rule.validityDays;
    const validityMs = validityDays * 86400000;
    const usePriceValidUntil = rule.usePriceValidUntil;
    const allowPriceRange = rule.allowPriceRange;
    const ctaIntensity = rule.ctaIntensity;
    const isOverridden = rule.overridden || false;
    const overrideReason = rule.overrideReason || null;
    
    console.log(`📌 Final Rule: pageLevel=${pageLevel}, type=${finalType}, validityDays=${validityDays}`);
    if (isOverridden) {
      console.warn(`   ⚠️ OVERRIDDEN: ${overrideReason}`);
    }
    
    // STEP 1: Proses meta dates
    await processMetaDates(customDateModified, finalType, validityMs, usePriceValidUntil, pageLevel, entityType, ctaIntensity, allowPriceRange, detectorVersion, confidence, strategies, strategyCount, isOverridden, overrideReason, h1Detection);
    
    // STEP 2: Auto-update
    console.log("🔄 MEMERIKSA AUTO-UPDATE...");
    const autoUpdated = autoUpdateDates(pageLevel, contentFocus);
    if (autoUpdated) {
      console.log("✅ AUTO-UPDATE BERHASIL!");
      // Re-process meta dates setelah update
      await processMetaDates(customDateModified, finalType, validityMs, usePriceValidUntil, pageLevel, entityType, ctaIntensity, allowPriceRange, detectorVersion, confidence, strategies, strategyCount, isOverridden, overrideReason, h1Detection);
    } else {
      console.log("⏭️ Tidak perlu auto-update (masih dalam periode valid)");
    }
    
    console.log(`🧩 detectEvergreen() v16.1 — FINISHED ✅`);
  }

  window.detectEvergreen = detectEvergreen;
  window.__detectEvergreenReady = true;
  window.dispatchEvent(new Event("detectEvergreenReady"));
  
  console.log("✅ Smart Evergreen Detector v16.1 ready (V37 rules + PLD-first detection + Level-aware content update)");
  
})();
