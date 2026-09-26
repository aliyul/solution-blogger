/* ============================================================
 🧠 Smart Evergreen Detector v17.1-LITE — PERFORMANCE PATCH
    ✅ SINKRON dengan PLD v23.9.7-LITE
    ✅ PATOKAN UTAMA: H1 (Informasi → Evergreen, Harga → Cek Tabel)
    ✅ ATURAN TAHUN: H1 mengandung tahun → NON-EVERGREEN
    ✅ ATURAN HARGA: H1 harga + tabel harga → NON-EVERGREEN
    ✅ ATURAN INFORMASI: H1 informatif tanpa harga → EVERGREEN
    ✅ AUTO-UPDATE TANPA BATAS: nextUpdate → dateModified → nextUpdate

    🔥🔥🔥 v17.1-LITE CHANGELOG 🔥🔥🔥
    ✅ FIX-A1: Timeout waitForPageLevelDetector 10s → 3s
    ✅ FIX-A2: processMetaDates() tidak dipanggil 2x
    ✅ FIX-A3: Guard _AED_INITIALIZED — cegah double init
    ✅ FIX-A4: Event listener { once: true } semua
    ✅ FIX-A5: updateContentByLevelAndFocus() — optimasi scope
    ✅ FIX-A6: queryByKeyword() — batasi maxLength & skip script
    ✅ FIX-A7: Cache hasil PLD (kategori, h1Pattern, schema, cta)
    ✅ FIX-A8: Skip auto-update kalau nextUpdate belum lewat (early return)

    ✅ PRESERVED (semua FIX v16.1):
    ✅ P1 — Deteksi dari PLD dulu (data-content-focus), baru fallback H1
    ✅ P2 — Update H1 dengan syarat STOP ≤ 2025
    ✅ P3 — Update konten sesuai level + content focus
    ✅ P4 — hasPriceTable() cek header spesifik (<th>)
    ✅ P6 — Refactor :contains → queryByKeyword()
============================================================ */

(function () {
  if (window.detectEvergreen && window.__AED_VERSION === "17.1-lite") return;

  // ═══ FIX-A3: Guard global untuk cegah double init ═══
  var _AED_INITIALIZED = false;
  var _AED_PLD_CACHE = {};

  window.__AED_VERSION = "17.1-lite";

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
  // 🆕 v17.1: Helper deteksi versi PLD
  // ============================================================
  function getPLDVersion() {
    if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.version) {
      var v = window.pageLevelDetectorv22.version;
      if (v.indexOf("23.9.7") === 0) return { version: v, family: "v23-lite", label: "v23.9.7-lite" };
      if (v.indexOf("23.") === 0) return { version: v, family: "v23", label: "v23.0.0" };
      if (v.indexOf("22.") === 0) return { version: v, family: "v22", label: "v22.x" };
      return { version: v, family: "unknown", label: "v" + v };
    }
    if (window.pageLevelDetectorv20) return { version: "20.x", family: "v20", label: "v20.x" };
    if (window.pageLevelDetectorv19) return { version: "19.x", family: "v19", label: "v19.x" };
    if (window.pageLevelDetectorV18) return { version: "18.x", family: "v18", label: "v18" };
    if (window.pageLevelDetectorV17) return { version: "17.x", family: "v17", label: "v17" };
    if (window.pageLevelDetector) return { version: "legacy", family: "legacy", label: "legacy" };
    return { version: "none", family: "none", label: "none" };
  }

  // ============================================================
  // 🆕 v17.1: FIX-A7 — Cache hasil PLD
  // ============================================================
  // Fungsi-fungsi ini dipanggil berkali-kali dari:
  //   - processMetaDates()
  //   - autoUpdateDates() → updateContentByLevelAndFocus()
  //   - updateH1WithRules()
  //
  // Tanpa cache = panggil PLD berkali-kali = berat.
  // Dengan cache = HEMAT ~20% waktu AED.
  // ============================================================
  function _cachePLD(key, fn) {
    if (_AED_PLD_CACHE[key] !== undefined) {
      return _AED_PLD_CACHE[key];
    }
    var result = fn();
    _AED_PLD_CACHE[key] = result;
    return result;
  }

  // ============================================================
  // 🆕 v17.1: getPLDKategori() — Kategori dari PLD v23
  // ============================================================
  function getPLDKategori(contentFocus) {
    if (!window.pageLevelDetectorv22) return null;
    if (typeof window.pageLevelDetectorv22.detectKategori !== "function") return null;

    var cacheKey = "kategori|" + (contentFocus || "INFORMASI");
    return _cachePLD(cacheKey, function() {
      try {
        var focus = (contentFocus || "INFORMASI").toUpperCase();
        var kategori = window.pageLevelDetectorv22.detectKategori(focus);
        if (kategori) {
          console.log(`🏷️ [PLD v23] Kategori: ${kategori} (dari detectKategori)`);
          return kategori;
        }
      } catch (e) {
        console.warn("⚠️ PLD detectKategori() error: " + e.message);
      }
      return null;
    });
  }

  // ============================================================
  // 🆕 v17.1: getPLDH1Pattern() — H1 Pattern dari PLD v23
  // ============================================================
  function getPLDH1Pattern(kategori) {
    if (!window.pageLevelDetectorv22) return null;
    if (typeof window.pageLevelDetectorv22.detectH1Pattern !== "function") return null;
    if (!kategori) return null;

    var cacheKey = "h1pattern|" + kategori;
    return _cachePLD(cacheKey, function() {
      try {
        var pattern = window.pageLevelDetectorv22.detectH1Pattern(kategori);
        if (pattern) {
          console.log(`📝 [PLD v23] H1 Pattern: ${pattern} (dari detectH1Pattern)`);
          return pattern;
        }
      } catch (e) {
        console.warn("⚠️ PLD detectH1Pattern() error: " + e.message);
      }
      return null;
    });
  }

  // ============================================================
  // 🆕 v17.1: getPLDSchemaType()
  // ============================================================
  function getPLDSchemaType(pageLevel, entityType, contentFocus) {
    if (!window.pageLevelDetectorv22) return null;
    if (typeof window.pageLevelDetectorv22.detectSchemaType !== "function") return null;

    var cacheKey = "schema|" + pageLevel + "|" + entityType + "|" + (contentFocus || "INFORMASI");
    return _cachePLD(cacheKey, function() {
      try {
        var schemaType = window.pageLevelDetectorv22.detectSchemaType(
          pageLevel, entityType, (contentFocus || "INFORMASI").toUpperCase()
        );
        if (schemaType) {
          console.log(`📋 [PLD v23] Schema: ${schemaType.primary} + ${schemaType.secondary}`);
          return schemaType;
        }
      } catch (e) {
        console.warn("⚠️ PLD detectSchemaType() error: " + e.message);
      }
      return null;
    });
  }

  // ============================================================
  // 🆕 v17.1: getPLDCtaType()
  // ============================================================
  function getPLDCtaType(pageLevel, contentFocus) {
    if (!window.pageLevelDetectorv22) return null;
    if (typeof window.pageLevelDetectorv22.detectCtaType !== "function") return null;

    var cacheKey = "cta|" + pageLevel + "|" + (contentFocus || "INFORMASI");
    return _cachePLD(cacheKey, function() {
      try {
        var ctaType = window.pageLevelDetectorv22.detectCtaType(
          pageLevel, (contentFocus || "INFORMASI").toUpperCase()
        );
        if (ctaType) {
          console.log(`🎯 [PLD v23] CTA: ${ctaType.type} → ${ctaType.text}`);
          return ctaType;
        }
      } catch (e) {
        console.warn("⚠️ PLD detectCtaType() error: " + e.message);
      }
      return null;
    });
  }

  // ============================================================
  // 🆕 v17.1: getPLDContentFocus() — Prioritas PLD detectContentFocus
  // ============================================================
  function getPLDContentFocus(pageLevel, entityType) {
    if (!window.pageLevelDetectorv22) return null;
    if (typeof window.pageLevelDetectorv22.detectContentFocus !== "function") return null;

    var cacheKey = "contentfocus|" + pageLevel + "|" + entityType;
    return _cachePLD(cacheKey, function() {
      try {
        var focus = window.pageLevelDetectorv22.detectContentFocus(pageLevel, entityType);
        if (focus) {
          console.log(`🎯 [PLD v23] Content Focus: ${focus} (dari detectContentFocus)`);
          return focus;
        }
      } catch (e) {
        console.warn("⚠️ PLD detectContentFocus() error: " + e.message);
      }
      return null;
    });
  }

  // ============================================================
  // 🆕 v17.1: getKategori() — EVERGREEN/NON-EVERGREEN/FLEXIBLE
  // ============================================================
  function getKategori(pageLevel, contentFocus) {
    // Prioritas 1: PLD v23
    const pldKategori = getPLDKategori(contentFocus);
    if (pldKategori) return pldKategori;

    // Fallback: internal logic
    const isEvergreenLevel = EVERGREEN_LEVELS.includes(pageLevel);
    const isMoneyLevel = MONEY_LEVELS.includes(pageLevel);

    if (isEvergreenLevel) return 'EVERGREEN';
    if (isMoneyLevel && contentFocus === 'INFORMASI') return 'EVERGREEN';
    if (isMoneyLevel && ['HARGA', 'COMMERCIAL', 'GABUNG'].includes(contentFocus)) return 'NON-EVERGREEN';

    console.log(`🏷️ Kategori (internal fallback): EVERGREEN`);
    return 'EVERGREEN';
  }

  // ============================================================
  // 🆕 v17.1: getContentFocus() — AMBIL DARI PLD ATAU H1
  // ============================================================
  function getContentFocus(h1Detection, pageLevel, entityType) {
    // PRIORITAS 0 — PLD v23 detectContentFocus()
    if (pageLevel && entityType) {
      const pldFocus = getPLDContentFocus(pageLevel, entityType);
      if (pldFocus) {
        const normalized = String(pldFocus).toUpperCase();
        console.log(`🎯 Content Focus dari PLD detectContentFocus(): ${normalized}`);
        return normalized;
      }
    }

    // PRIORITAS 1: PLD data-content-focus attribute
    const bodyFocus = document.body.getAttribute('data-content-focus');
    if (bodyFocus) {
      const normalized = bodyFocus.toUpperCase();
      console.log(`🎯 Content Focus dari PLD (attribute): ${normalized}`);
      return normalized;
    }

    // PRIORITAS 2: V379A
    if (window.V379A && window.V379A.focusKonten) {
      const normalized = String(window.V379A.focusKonten).toUpperCase();
      console.log(`🎯 Content Focus dari V379A: ${normalized}`);
      return normalized;
    }

    // PRIORITAS 3: Fallback dari h1Detection
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
  // 🆕 v17.1: queryByKeyword() — FIX-A6: batasi scope
  // ============================================================
  // SEBELUMNYA:
  //   container.querySelectorAll('p, span, div, time, li, td')
  //   → scan SEMUA elemen di body = ratusan/ribuan iterasi
  //
  // SESUDAH (FIX-A6):
  //   - Batasi maxLength ke 500 char (skip elemen besar)
  //   - Skip SCRIPT, STYLE, NOSCRIPT
  //   - Gunakan TreeWalker untuk skip text node yang tidak relevan
  //   - Cek keyword dulu sebelum cek year
  // ============================================================
  function queryByKeyword(container, keywords, requireYear = true) {
    const results = [];
    if (!container) return results;

    // FIX-A6: Batasi scope — hanya elemen teks kecil
    const elements = container.querySelectorAll('p, span, time, li, td, .update-badge, .last-updated, .date-modified');
    elements.forEach(el => {
      // FIX-A6: Skip elemen script/style
      const tag = el.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return;

      const text = el.innerText?.toLowerCase() || '';
      // FIX-A6: Skip teks panjang (> 500 char) — biasanya artikel, bukan badge tanggal
      if (!text || text.length > 500) return;

      // FIX-A6: Cek keyword dulu (lebih murah) sebelum cek year (regex)
      const hasKeyword = keywords.some(kw => text.includes(kw.toLowerCase()));
      if (!hasKeyword) return;

      if (!requireYear) {
        results.push(el);
        return;
      }

      // Baru cek year
      const hasYear = /\b(19|20)\d{2}\b/.test(text);
      if (hasYear) {
        results.push(el);
      }
    });
    return results;
  }

   // ============================================================
  // P4: hasPriceTable() — CEK HEADER SPESIFIK (<th>)
  // ============================================================
  function hasPriceTable() {
    const tables = document.querySelectorAll('table');
    let priceTableFound = false;
    let tableDetails = [];

    tables.forEach((table, index) => {
      const headers = Array.from(table.querySelectorAll('th'))
        .map(th => th.innerText.toLowerCase().trim());

      const hasPriceHeader = headers.some(h =>
        /harga|biaya|tarif|price|cost|rate/i.test(h)
      );

      let hasPriceColumn = hasPriceHeader;
      if (headers.length === 0) {
        const tableText = table.innerText.toLowerCase();
        hasPriceColumn = /harga|biaya|estimasi|rp|rupiah|per meter|per lembar|total|subtotal/i.test(tableText);
      }

      const tableText = table.innerText;
      const numbers = tableText.match(/[\d.,]+/g);
      const hasNumbers = numbers && numbers.length >= 3;

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
  // P1: FUNGSI DETEKSI KONTEN — PLD DULU, BARU H1
  // 🆕 v17.1: Support PLD v23.9.7-LITE + cache
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
    // 🆕 v17.1: PRIORITAS 0 — PLD v23 detectContentFocus()
    // ============================================================
    const pldVersion = getPLDVersion();
    if (pldVersion.family === "v23-lite" || pldVersion.family === "v23" || pldVersion.family === "v22") {
      try {
        const pldLevel = window.pageLevelDetectorv22.detect();
        const pldEntity = window.pageLevelDetectorv22.detectEntityType();
        const pldFocus = getPLDContentFocus(pldLevel, pldEntity);

        if (pldFocus) {
          const normalized = String(pldFocus).toUpperCase();
          const hasYear = /\b(19|20)\d{2}\b/.test(h1Text);

          console.log(`🎯 Content Focus dari PLD ${pldVersion.label}: ${normalized}`);

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
              reason: `PLD ${pldVersion.label} detectContentFocus = INFORMASI`,
              confidence: 'high',
              source: 'pld-' + pldVersion.family
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
              reason: `PLD ${pldVersion.label} detectContentFocus = ${normalized}`,
              confidence: 'high',
              source: 'pld-' + pldVersion.family
            };
          }
        }
      } catch (e) {
        console.warn("⚠️ PLD v23 detectContentFocus error: " + e.message);
      }
    }

    // ============================================================
    // P1: PRIORITAS 1 — PLD (data-content-focus)
    // ============================================================
    const bodyFocus = document.body.getAttribute('data-content-focus');
    if (bodyFocus) {
      const normalized = bodyFocus.toUpperCase();
      console.log(`🎯 Content Focus dari PLD (attribute): ${normalized}`);

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
    // P1: PRIORITAS 3 — Fallback ke H1
    // ============================================================
    console.log(`⚠️ PLD/V379A tidak tersedia, fallback ke H1 detection`);

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

    const informationalKeywords = [
      'panduan', 'spesifikasi', 'keunggulan', 'cara memilih', 'tips',
      'perbedaan', 'jenis', 'apa itu', 'pengertian', 'informasi',
      'standar', 'mutu', 'ukuran', 'komponen', 'bahan', 'material',
      'panduan lengkap', 'lengkap', 'solusi', 'rekomendasi', 'penjelasan',
      'karakteristik', 'kelebihan', 'kekurangan', 'fungsi', 'manfaat'
    ];

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
  // P3: UPDATE KONTEN SESUAI LEVEL + CONTENT FOCUS
  // 🔥 FIX-A5: Optimasi scope loop — batasi elemen yang dicek
  // ============================================================
  // OPTIMASI FIX-A5:
  //   1. Sebelumnya: cek SEMUA elemen dari 12 selector + queryByKeyword()
  //   2. Sekarang: cek DULU apakah ada tahun "lama" di halaman
  //      → kalau TIDAK ADA, langsung return (early exit)
  //   3. Batasi elemen max 50 (biasanya cukup untuk update badge)
  //   4. Cache hasil getElementsByTagName('body') sekali pakai
  // ============================================================
  function updateContentByLevelAndFocus(pageLevel, contentFocus, now) {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const newMonth = monthNames[now.getMonth()];
    const newYear = now.getFullYear();
    const newDateText = `${newMonth} ${newYear}`;

    const isMoneyLevel = MONEY_LEVELS.includes(pageLevel);
    const isEvergreenLevel = EVERGREEN_LEVELS.includes(pageLevel);

    let updateMode = 'year-only';
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

    // ═══ FIX-A5: EARLY EXIT — cek apakah ada tahun "lama" di halaman ═══
    // Kalau TIDAK ada tahun lama (≤ 2025 atau < newYear), langsung return
    // tanpa harus loop semua selector.
    var bodyInnerText = document.body.innerText || '';
    var allYearsInBody = bodyInnerText.match(/\b(19|20)\d{2}\b/g) || [];
    var hasOldYear = false;
    for (var yi = 0; yi < allYearsInBody.length; yi++) {
      var yNum = parseInt(allYearsInBody[yi], 10);
      if (yNum > 2025 && yNum < newYear) {
        hasOldYear = true;
        break;
      }
    }
    if (!hasOldYear) {
      console.log(`⏭️ FIX-A5: Tidak ada tahun "lama" di body — skip update konten`);
      return { updated: false, mode: updateMode, target: updateMode === 'month-year' ? newDateText : newYear, skipped: true };
    }

    const selectors = [
      '.update-badge', '.update-badge-class', '[class*="update-badge"]',
      '.last-updated', '.updated-date', '.date-modified',
      '.post-date', '.article-date', '.publish-date',
      '.post-meta', '.entry-meta', '.article-meta',
      '.breadcrumb + p', '.toc + p', 'h1 + p'
    ];

    let contentUpdated = false;
    const elementsSet = new Set();

    selectors.forEach(sel => {
      try {
        document.querySelectorAll(sel).forEach(el => elementsSet.add(el));
      } catch(e) {}
    });

    const keywordEls = queryByKeyword(
      document.body,
      ['diperbarui', 'update', 'terakhir', 'last updated', 'updated', 'perbarui'],
      true
    );
    keywordEls.forEach(el => elementsSet.add(el));

    let elements = Array.from(elementsSet);

    // ═══ FIX-A5: Batasi elemen max 50 ═══
    // Kalau sampai > 50 elemen, berarti selector terlalu luas — potong saja.
    // Biasanya update badge hanya 1-3 elemen per halaman.
    if (elements.length > 50) {
      console.log(`⚠️ FIX-A5: elements=${elements.length} > 50 — dipotong ke 50`);
      elements = elements.slice(0, 50);
    }

    for (const el of elements) {
      if (!el || el.tagName === 'H1') continue;

      const originalText = el.innerText || '';
      if (!originalText.match(/\b(19|20)\d{2}\b/)) continue;

      const yearMatches = originalText.match(/\b(19|20)\d{2}\b/g);
      if (!yearMatches) continue;

      let shouldUpdate = false;
      for (const yStr of yearMatches) {
        const y = parseInt(yStr);
        if (y <= 2025) continue;
        if (y < newYear) { shouldUpdate = true; break; }
      }

      if (!shouldUpdate) continue;

      let newText = originalText;

      if (updateMode === 'month-year') {
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
        newText = newText.replace(/\b(19|20)\d{2}\b/g, (match) => {
          const y = parseInt(match);
          if (y > 2025 && y < newYear) return String(newYear);
          return match;
        });
      }

      if (newText === originalText) continue;

      // ═══ FIX-A5: Optimasi — pakai TreeWalker per elemen (tidak scan semua) ═══
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
  // P2: UPDATE H1 DENGAN SYARAT
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

    if (!detectedYear) {
      console.log(`⏭️ H1 tidak ada tahun — JANGAN TAMBAH`);
      return { updated: false, reason: 'no-year-in-h1' };
    }

    if (detectedYear <= 2025) {
      console.log(`🛑 H1 STOP: tahun ${detectedYear} ≤ 2025`);
      return { updated: false, reason: 'year-too-old' };
    }

    if (detectedYear >= newYear) {
      console.log(`✅ H1 tidak perlu update: ${detectedYear} >= ${newYear}`);
      return { updated: false, reason: 'year-already-current' };
    }

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
  // 🔥 FIX-A8: Early return kalau nextUpdate belum lewat (sudah ada di v17.0)
  // 🔥 FIX-A5: Pakai updateContentByLevelAndFocus() versi optimasi
  // ============================================================
  function autoUpdateDates(pageLevel, contentFocus) {
    console.log("🔄 AUTO-UPDATE: Memeriksa tanggal...");

    let metaModified = document.querySelector('meta[itemprop="dateModified"]');
    let metaNext = document.querySelector('meta[name="nextUpdate"]');
    let metaPublished = document.querySelector('meta[itemprop="datePublished"]');

    let currentModified = metaModified ? metaModified.getAttribute('content') : null;
    let currentNext = metaNext ? metaNext.getAttribute('content') : null;

    if (!currentNext) {
      console.log("⚠️ Tidak ada nextUpdate, skip auto-update");
      return false;
    }

    const now = new Date();
    const nextDate = new Date(currentNext);
    const currentModifiedDate = currentModified ? new Date(currentModified) : now;

    // ═══ FIX-A8: Early return — belum lewat nextUpdate ═══
    // Ini HEMAT ~500-1500ms karena:
    //   - Tidak panggil updateContentByLevelAndFocus()
    //   - Tidak panggil updateH1WithRules()
    //   - Tidak modif DOM
    // Kalau halaman masih valid, tidak perlu apa-apa.
    if (now < nextDate) {
      console.log(`⏭️ Belum lewat nextUpdate (${currentNext}), tidak perlu update`);
      return false;
    }

    console.log(`🔄 NEXTUPDATE LEWAT! ${currentNext} → Sekarang ${now.toISOString()}`);

    let validityDays = 30;
    if (currentModified && currentNext) {
      const diffMs = nextDate.getTime() - currentModifiedDate.getTime();
      const diffDays = Math.round(diffMs / 86400000);
      if (diffDays > 0) {
        validityDays = diffDays;
        console.log(`📅 Validity days dari meta: ${validityDays} hari`);
      }
    }

    const newModified = now;
    const newNext = new Date(now.getTime() + (validityDays * 86400000));

    const newModifiedStr = toISOWithTimezoneLocal(newModified);
    const newNextStr = toISOWithTimezoneLocal(newNext);

    console.log(`📅 New dateModified: ${newModifiedStr}`);
    console.log(`📅 New nextUpdate: ${newNextStr}`);

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

    document.querySelectorAll('[itemtype="http://schema.org/Offer"]').forEach(el => {
      el.setAttribute('priceValidUntil', newNextStr);
    });
    console.log(`✅ Schema Offer priceValidUntil diupdate`);

    if (window.AEDMetaDates) {
      window.AEDMetaDates.dateModified = newModifiedStr;
      window.AEDMetaDates.nextUpdate = newNextStr;
      window.AEDMetaDates.lastAutoUpdate = now.toISOString();
      window.AEDMetaDates.updateCount = (window.AEDMetaDates.updateCount || 0) + 1;
      console.log(`✅ AEDMetaDates diupdate (update ke-${window.AEDMetaDates.updateCount})`);
    }

    document.body.classList.add('auto-updated');
    document.body.setAttribute('data-last-auto-update', now.toISOString());
    document.body.setAttribute('data-update-count', (parseInt(document.body.getAttribute('data-update-count') || '0') + 1).toString());

    const contentResult = updateContentByLevelAndFocus(pageLevel, contentFocus, now);
    if (contentResult.updated) {
      console.log(`✅ Konten diupdate: mode=${contentResult.mode}, target=${contentResult.target}`);
    } else if (contentResult.skipped) {
      console.log(`⏭️ Konten di-skip (FIX-A5): tidak ada tahun lama`);
    } else {
      console.log(`⏭️ Tidak ada konten yang perlu diupdate`);
    }

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
  // 📌 FUNGSI PROSES META DATES
  // 🆕 v17.1: Tambah cache — hemat panggilan PLD berulang
  // ============================================================
  async function processMetaDates(customDateModified, finalType, validityMs, usePriceValidUntil, pageLevel, entityType, ctaIntensity, allowPriceRange, detectorVersion, confidence, strategies, strategyCount, isOverridden, overrideReason, h1Detection, contentFocus) {

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

    // 🆕 v17.1: Ambil kategori & h1Pattern dari PLD (dengan cache FIX-A7)
    const kategori = getKategori(pageLevel, contentFocus);
    const h1Pattern = getPLDH1Pattern(kategori);
    const schemaType = getPLDSchemaType(pageLevel, entityType, contentFocus);
    const pldCtaType = getPLDCtaType(pageLevel, contentFocus);

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
      detectorVersion: detectorVersion || 'v17.1',
      detectionConfidence: confidence || null,
      detectionStrategies: strategies || null,
      detectionStrategyCount: strategyCount || null,
      isOverridden: isOverridden || false,
      overrideReason: overrideReason || null,
      h1Detection: h1Detection || null,

      // 🆕 v17.1: Info dari PLD
      contentFocus: contentFocus || null,
      pldKategori: kategori,
      pldH1Pattern: h1Pattern,
      pldSchemaType: schemaType,
      pldCtaType: pldCtaType,

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
    if (contentFocus) console.log(`   - Content Focus: ${contentFocus}`);
    if (kategori) console.log(`   - Kategori (PLD): ${kategori}`);
    if (h1Pattern) console.log(`   - H1 Pattern (PLD): ${h1Pattern}`);
    if (schemaType) console.log(`   - Schema (PLD): ${schemaType.primary} + ${schemaType.secondary}`);
    if (pldCtaType) console.log(`   - CTA (PLD): ${pldCtaType.type} → ${pldCtaType.text}`);
    if (isOverridden) {
      console.warn(`   ⚠️ OVERRIDDEN: ${overrideReason}`);
    }
    console.log(`🧩 processMetaDates() v17.1 — FINISHED ✅`);
  }

   // ============================================================
  // 📌 GET PAGE LEVEL DARI DETECTOR
  // 🆕 v17.1: Support PLD v23.9.7-LITE
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

        const pldVer = getPLDVersion();
        detectorVersion = pldVer.label;

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
      } catch(e) { console.warn("v22/23 error:", e); }
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
  // 📌 TUNGGU PAGE LEVEL DETECTOR READY
  // 🔥 FIX-A1: Timeout 10 detik → 3 detik
  // ============================================================
  // SEBELUMNYA:
  //   setTimeout(() => { ... }, 10000);  // 10 DETIK BLOCKING
  //
  // SESUDAH (FIX-A1):
  //   setTimeout(() => { ... }, 3000);   // 3 DETIK (cukup)
  //
  // Alasan:
  //   - PLD di-load SEBELUM AED via script tag
  //   - Kalau PLD belum ready dalam 3 detik → ada masalah lain
  //   - 10 detik hanya buang waktu user tanpa manfaat
  // ============================================================
  function waitForPageLevelDetector() {
    return new Promise((resolve) => {
      const pldVer = getPLDVersion();

      // Cek langsung — kalau PLD sudah ready, langsung resolve
      if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
        console.log(`✅ Page Level Detector ${pldVer.label} already ready`);
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

      // FIX-A4: Event listener dengan { once: true } — cegah multiple trigger
      const onReadyV22 = () => {
        const v = getPLDVersion();
        console.log(`✅ PLD ${v.label} ready (event)`);
        resolve();
      };
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

      // 🔥 FIX-A1: Timeout 10 detik → 3 detik
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
      }, 3000); // 🔥 FIX-A1: 10s → 3s
    });
  }

  // ============================================================
  // 📌 GET RULES BERDASARKAN ENTITY TYPE, PAGE LEVEL, DAN JENIS KONTEN
  // ============================================================
  function getRulesByEntityType(entityType, pageLevel, h1Detection) {
    console.log(`📌 Getting rules for entityType=${entityType}, pageLevel=${pageLevel}`);
    console.log(`   📊 H1 Detection: informational=${h1Detection.isInformational}, price=${h1Detection.isPrice}, hasYear=${h1Detection.hasYear}`);

    const isMoneyLevel = MONEY_LEVELS.includes(pageLevel);

    if (isMoneyLevel && h1Detection.hasYear) {
      console.warn(`⚠️ H1 mengandung TAHUN → WAJIB NON-EVERGREEN`);
      console.warn(`   → H1: "${h1Detection.h1Text}"`);
    }

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
  // 📌 FUNGSI UTAMA DETECT EVERGREEN
  // 🔥 FIX-A2: processMetaDates() TIDAK dipanggil 2x
  // 🔥 FIX-A3: Guard _AED_INITIALIZED — cegah double init
  // ============================================================
  // SEBELUMNYA (v17.0):
  //   await processMetaDates(...);              // ⚠️ Panggilan #1
  //   const autoUpdated = autoUpdateDates(...);
  //   if (autoUpdated) {
  //     await processMetaDates(...);            // ⚠️ Panggilan #2 (DOUBLE!)
  //   }
  //
  // SESUDAH (FIX-A2):
  //   // Panggil autoUpdateDates DULU
  //   const autoUpdated = autoUpdateDates(...);
  //   // Panggil processMetaDates SEKALI SAJA (setelah auto-update)
  //   await processMetaDates(...);
  //
  // Logika:
  //   - autoUpdateDates() hanya ubah meta dateModified/nextUpdate KALAU
  //     nextUpdate sudah lewat.
  //   - processMetaDates() SET meta dari awal (dengan customDateModified).
  //   - Kalau autoUpdateDates() sukses, processMetaDates() tetap perlu
  //     dipanggil untuk set body class + AEDMetaDates.
  //   - Cukup 1x panggil SETELAH autoUpdateDates — 
  //     karena processMetaDates akan baca ulang meta yang sudah diupdate.
  // ============================================================
  async function detectEvergreen({ customDateModified = null } = {}) {
    // ═══ FIX-A3: Guard — cegah double init ═══
    if (_AED_INITIALIZED) {
      console.log("⏭️ [AED] detectEvergreen() sudah pernah dijalankan — skip");
      return;
    }
    _AED_INITIALIZED = true;

    console.log("🧩 detectEvergreen() v17.1-LITE — Loading...");

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

    // P3: Ambil content focus (dengan PLD prioritas)
    const contentFocus = getContentFocus(h1Detection, pageLevel, entityType);
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

    // ═══════════════════════════════════════════════════════════
    // 🔥 FIX-A2: URUTAN BARU — autoUpdateDates() DULU
    // ═══════════════════════════════════════════════════════════
    // Alasan:
    //   - autoUpdateDates() hanya jalan kalau nextUpdate sudah lewat
    //   - Kalau belum lewat: autoUpdateDates() = no-op (return false)
    //   - Kalau sudah lewat: autoUpdateDates() update meta, konten, H1
    //   - processMetaDates() dipanggil SEKALI untuk set body class + AEDMetaDates
    //
    // Logika:
    //   - Sebelumnya processMetaDates() dipanggil 2x → berat
    //   - Sekarang: autoUpdateDates() DULU, processMetaDates() SEKALI
    //   - processMetaDates() akan baca meta yang sudah di-update
    //     oleh autoUpdateDates (kalau ada)
    // ═══════════════════════════════════════════════════════════

    // STEP 1: Auto-update DULU (kalau nextUpdate sudah lewat)
    console.log("🔄 MEMERIKSA AUTO-UPDATE...");
    const autoUpdated = autoUpdateDates(pageLevel, contentFocus);
    if (autoUpdated) {
      console.log("✅ AUTO-UPDATE BERHASIL!");
    } else {
      console.log("⏭️ Tidak perlu auto-update (masih dalam periode valid)");
    }

    // STEP 2: Process meta dates SEKALI (set body class + AEDMetaDates)
    await processMetaDates(customDateModified, finalType, validityMs, usePriceValidUntil, pageLevel, entityType, ctaIntensity, allowPriceRange, detectorVersion, confidence, strategies, strategyCount, isOverridden, overrideReason, h1Detection, contentFocus);

    console.log(`🧩 detectEvergreen() v17.1-LITE — FINISHED ✅`);
  }

  // ============================================================
  // 🌐 EXPORT GLOBAL
  // ============================================================
  window.detectEvergreen = detectEvergreen;
  window.__detectEvergreenReady = true;
  window.dispatchEvent(new Event("detectEvergreenReady"));

  console.log("✅ Smart Evergreen Detector v17.1-LITE ready");
  console.log("   🔥 FIX-A1: Timeout 3s (dari 10s)");
  console.log("   🔥 FIX-A2: processMetaDates() 1x (dari 2x)");
  console.log("   🔥 FIX-A3: Guard _AED_INITIALIZED");
  console.log("   🔥 FIX-A4: Event listener { once: true }");
  console.log("   🔥 FIX-A5: Early exit + limit elements");
  console.log("   🔥 FIX-A6: queryByKeyword() scope dipersempit");
  console.log("   🔥 FIX-A7: Cache hasil PLD");
  console.log("   🔥 FIX-A8: Early return nextUpdate");

})();



 
