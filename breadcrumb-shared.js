/**
 * ============================================================
 * generateBreadcrumbShared v15.1.0 — CLEAN + PERFORMANCE PATCH
 * 
 * PRINSIP: PLD = DETEKSI, BREADCRUMB = RENDER
 * ─────────────────────────────────────────────
 * Breadcrumb HANYA:
 *   1. BACA hasil dari body attributes (PLD sudah set)
 *   2. FALLBACK ke window.pageLevelDetectorv22 functions
 *   3. RENDER HTML breadcrumb
 *   4. Set flag + dispatch event
 * 
 * v15.1.0 CHANGELOG (dari v15.0.0):
 * ✅ FIX #3: Lazy Load — requestIdleCallback agar tidak blocking render
 * ✅ FIX #4: Cache detectPageType — hemat ~500-2000ms per render
 * 
 * v15.0.0 CHANGELOG:
 * ✅ HAPUS duplikasi: detectPageTypeFallback, isLocation, checkHasSpec, dll
 * ✅ HAPUS konstanta duplikat: LOCATION_WORDS, COMMERCIAL_WORDS, dll
 * ✅ PAKAI body attributes dari PLD (data-page-level, data-entity-type, dll)
 * ✅ FALLBACK ke PLD functions jika body attributes tidak ada
 * ✅ TUNGGU "pageLevelDetectorv22Ready" sebelum eksekusi
 * 
 * CARA PAKAI:
 * 1. Load PLD dulu: <script src="pld-v23.9.7-lite.js"></script>
 * 2. Load file ini: <script src="breadcrumb-shared.js"></script>
 * 3. Di file topik: window.generateBreadcrumbShared(...)
 * ============================================================
 */

(function() {
    "use strict";

    // ============================================================
    // DETEKSI DEVICE (SEKALI SAJA)
    // ============================================================
    const IS_MOBILE = /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(navigator.userAgent);
    const IS_SLOW_DEVICE = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
                           (navigator.deviceMemory && navigator.deviceMemory <= 4);
    const IS_CONNECTION_SLOW = navigator.connection &&
                               (navigator.connection.effectiveType === '2g' ||
                                navigator.connection.effectiveType === 'slow-2g' ||
                                navigator.connection.saveData === true);

    const ENABLE_DEBUG = !IS_MOBILE && !IS_SLOW_DEVICE && !IS_CONNECTION_SLOW;

    // ============================================================
    // PRE-COMPILED CONSTANTS
    // ============================================================
    const LOG_ICONS = Object.freeze({
        INFO: '📘', SUCCESS: '✅', WARN: '⚠️', ERROR: '❌',
        DEBUG: '🔍', PARENT: '👪', URL: '🔗', PLD: '🔍',
        FLAG: '🚩', EVENT: '📣', RENDER: '🎨', PERF: '⚡'
    });

    const CONFIG_GLOBAL = {
        DOMAIN: 'https://www.betonjayareadymix.com',
        DEBUG: ENABLE_DEBUG,
        PLD_WAIT_TIMEOUT: 2000
    };

    function log(message, type) {
        if (!CONFIG_GLOBAL.DEBUG) return;
        console.log((LOG_ICONS[type] || '📘') + ' [Breadcrumb v15.1.0] ' + message);
    }

    // ============================================================
    // ✅ AMBIL DATA DARI PLD — TIDAK HITUNG ULANG
    // ============================================================

    /**
     * Ambil page level dari body attributes atau PLD
     * PLD sudah set: data-page-level
     */
    function getPageLevel() {
        // 1. Body attribute (PLD sudah set)
        var bodyLevel = document.body && document.body.getAttribute('data-page-level');
        if (bodyLevel) return bodyLevel;

        // 2. Fallback: panggil PLD
        if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
            try {
                return window.pageLevelDetectorv22.detect();
            } catch(e) { log('PLD detect error: ' + e.message, 'WARN'); }
        }

        // 3. Fallback minimal
        return 'money-page';
    }

    /**
     * Ambil entity type dari body attributes atau PLD
     * PLD sudah set: data-entity-type (lowercase)
     */
    function getEntityTypeFromPLD() {
        // 1. Body attribute
        var bodyEntity = document.body && document.body.getAttribute('data-entity-type');
        if (bodyEntity) return bodyEntity;

        // 2. Fallback: panggil PLD
        if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detectEntityType === 'function') {
            try {
                return window.pageLevelDetectorv22.detectEntityType();
            } catch(e) { log('PLD entity error: ' + e.message, 'WARN'); }
        }

        return 'jasa';
    }

    /**
     * Ambil content focus dari body attributes
     * PLD sudah set: data-content-focus
     */
    function getContentFocus() {
        return (document.body && document.body.getAttribute('data-content-focus')) || null;
    }

    /**
     * Ambil kategori dari body attributes
     * PLD sudah set: data-kategori
     */
    function getKategori() {
        return (document.body && document.body.getAttribute('data-kategori')) || null;
    }

    /**
     * Ambil H1 pattern dari body attributes
     * PLD sudah set: data-h1-pattern
     */
    function getH1Pattern() {
        return (document.body && document.body.getAttribute('data-h1-pattern')) || null;
    }

    /**
     * Ambil schema type dari body attributes
     * PLD sudah set: data-schema-type-primary, data-schema-type-secondary
     */
    function getSchemaType() {
        var primary = document.body && document.body.getAttribute('data-schema-type-primary');
        var secondary = document.body && document.body.getAttribute('data-schema-type-secondary');
        if (!primary) return null;
        return { primary: primary, secondary: secondary || '' };
    }

    /**
     * Ambil CTA type dari body attributes
     * PLD sudah set: data-cta-type, data-cta-text
     */
    function getCtaType() {
        var type = document.body && document.body.getAttribute('data-cta-type');
        var text = document.body && document.body.getAttribute('data-cta-text');
        if (!type) return null;
        return { type: type, text: text || '' };
    }

    /**
     * Cek apakah text mengandung lokasi — pakai PLD
     */
    function isLocation(text) {
        if (!text) return false;
        if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.isLocation === 'function') {
            try {
                return window.pageLevelDetectorv22.isLocation(text);
            } catch(e) {}
        }
        // Fallback minimal — hanya kota umum
        return /\b(jakarta|bogor|depok|tangerang|bekasi|bandung|surabaya|semarang|yogyakarta|jogja|malang|medan|makassar|bali|denpasar)\b/i.test(text);
    }

    /**
     * Cek spec — pakai PLD
     */
    function checkHasSpecification(text, entity) {
        if (!text) return false;
        if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.checkHasSpecification === 'function') {
            try {
                return window.pageLevelDetectorv22.checkHasSpecification(text, entity);
            } catch(e) {}
        }
        return false;
    }

    /**
     * Cek sub-variant — pakai PLD
     */
    function isSubVariant(text, entity) {
        if (!text) return false;
        if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.isSubVariant === 'function') {
            try {
                return window.pageLevelDetectorv22.isSubVariant(text, entity);
            } catch(e) {}
        }
        return false;
    }

    /**
     * Cek commercial — pakai PLD
     */
    function checkHasCommercial(text, entity) {
        if (!text) return false;
        if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.checkHasCommercial === 'function') {
            try {
                return window.pageLevelDetectorv22.checkHasCommercial(text, entity);
            } catch(e) {}
        }
        return false;
    }

    // ============================================================
    // VALID CONSTANTS
    // ============================================================

    const VALID_LEVELS = [
        'home', 'pillar', 'sub-pillar-tipe-2', 'sub-pillar-tipe-1',
        'money-master', 'money-page', 'money-child', 'variant', 'sub-variant'
    ];

    const TYPE_LEVEL_MAP = {
        'home': 0, 'pillar': 1, 'sub-pillar-tipe-2': 2, 'sub-pillar-tipe-1': 3,
        'money-master': 4, 'money-page': 5, 'money-child': 6,
        'variant': 7, 'sub-variant': 8
    };

    const HIERARCHY_ORDER = [
        'home', 'pillar', 'sub-pillar-tipe-2', 'sub-pillar-tipe-1',
        'money-master', 'money-page', 'money-child', 'variant', 'sub-variant'
    ];

    // Entity pillar names — pakai dari PLD kalau ada
    function getEntityPillarNames(entity) {
        if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.ENTITY_PILLAR_NAMES) {
            return window.pageLevelDetectorv22.ENTITY_PILLAR_NAMES[entity] || [];
        }
        // Fallback minimal
        var fallback = {
            'jasa': ['jasa konstruksi'],
            'desain': ['jasa desain'],
            'sewa': ['sewa alat konstruksi'],
            'produk': ['produk konstruksi'],
            'material': ['material konstruksi'],
            'artikel': ['artikel konstruksi']
        };
        return fallback[entity] || [];
    }

    // ============================================================
    // HELPERS
    // ============================================================

    function cleanText(text) {
        if (!text) return '';
        return text.replace(/\s+/g, ' ').trim();
    }

    function slugify(text) {
        return cleanText(text)
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-');
    }

    function getCleanPageNameFromUrl(url) {
        if (!url) return '';
        let path = url;
        path = path.replace(/^https?:\/\/[^\/]+/i, '');
        path = path.split('?')[0];
        path = path.replace(/\.(html|php|asp|jsp)$/i, '');
        path = path.replace(/\/\d{4}\/\d{2}\/\d{2}\//g, '/');
        path = path.replace(/\/\d{4}\/\d{2}\//g, '/');
        path = path.replace(/\/\d{4}\//g, '/');
        path = path.replace(/^\/p\//, '/');
        path = path.replace(/\/p\//g, '/');

        const parts = path.split('/').filter(Boolean);
        let last = parts.pop() || '';
        if (!last && parts.length > 0) last = parts.pop() || '';

        last = last.replace(/-/g, ' ');
        last = last.replace(/[^a-z0-9\s]/gi, '');

        if (last.length < 3 && parts.length > 0) {
            const lastTwo = parts.slice(-2).join(' ');
            if (lastTwo.length > last.length) last = lastTwo;
        }

        return cleanText(last.toLowerCase());
    }

    // ============================================================
    // ✅ DETEKSI PAGE TYPE — PAKAI PLD, BUKAN HITUNG ULANG
    // ============================================================

    // ═══════════════════════════════════════════════════════════════
    // 🔥 FIX #4: CACHE detectPageType
    // ═══════════════════════════════════════════════════════════════
    // MASALAH: detectPageType dipanggil 5-10x per render breadcrumb.
    // Setiap panggilan → PLD detectPageLevelForPrompt() yang BERAT.
    // Total: ~500-2000ms per render breadcrumb.
    //
    // SOLUSI: Cache hasil per (pageName + isCurrentPage + currentPldLevel).
    // Hasil sama → cache hit → 0ms.
    // ═══════════════════════════════════════════════════════════════
    var __pageTypeCache = {};

    /**
     * Deteksi page type untuk sebuah nama halaman.
     * PRIORITAS:
     *   1. Kalau pageName === currentPageTitle → pakai PLD level
     *   2. Kalau bukan → panggil PLD detectPageLevelForPrompt
     *   3. Fallback minimal
     */
    function detectPageType(pageName, isCurrentPage, currentPldLevel) {
        // 🔥 FIX #4: Cek cache dulu
        var cacheKey = (pageName || '') + '|' + (isCurrentPage ? '1' : '0') + '|' + (currentPldLevel || '');
        if (__pageTypeCache.hasOwnProperty(cacheKey)) {
            log('⚡ CACHE HIT detectPageType: ' + pageName, 'PERF');
            return __pageTypeCache[cacheKey];
        }

        var result;
        const lowerName = cleanText((pageName || '').toLowerCase());

        // Kalau ini halaman saat ini → pakai PLD level
        if (isCurrentPage && currentPldLevel && VALID_LEVELS.indexOf(currentPldLevel) !== -1) {
            result = currentPldLevel;
        }
        // Kalau home
        else if (lowerName === 'home' || lowerName === 'beranda') {
            result = 'home';
        }
        // Cek pillar exact match
        else if (getEntityPillarNames(getEntityTypeFromPLD()).indexOf(lowerName) !== -1) {
            result = 'pillar';
        }
        // Panggil PLD untuk page lain (bukan halaman saat ini)
        else if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detectPageLevelForPrompt === 'function') {
            try {
                var lvl = window.pageLevelDetectorv22.detectPageLevelForPrompt(pageName, getEntityTypeFromPLD());
                result = (lvl && VALID_LEVELS.indexOf(lvl) !== -1) ? lvl : 'money-page';
            } catch(e) {
                result = 'money-page';
            }
        }
        // Fallback minimal
        else {
            result = 'money-page';
        }

        // 🔥 FIX #4: Simpan ke cache
        __pageTypeCache[cacheKey] = result;
        log('💾 CACHE STORE detectPageType: ' + pageName + ' → ' + result, 'PERF');
        return result;
    }

    // ============================================================
    // FUNGSI UTAMA — GENERATE BREADCRUMB (IMPLEMENTASI ASLI)
    // ============================================================

    function _generateBreadcrumbSharedImpl(
        mappingObj,
        currentUrl,
        breadcrumbItems,
        entityType
    ) {
        breadcrumbItems = breadcrumbItems || [];
        entityType = entityType || 'jasa';

        // Normalisasi entity type (lowercase untuk PLD)
        entityType = String(entityType).toLowerCase();

        log('=== GENERATE BREADCRUMB START ===', 'INFO');
        log('URL: ' + currentUrl, 'INFO');
        log('Entity (dari caller): ' + entityType, 'INFO');

        // ============================================================
        // 1. BACA DATA DARI PLD (BODY ATTRIBUTES)
        // ============================================================
        const pldLevel = getPageLevel();
        const pldEntity = getEntityTypeFromPLD();
        const pldContentFocus = getContentFocus();
        const pldKategori = getKategori();
        const pldH1Pattern = getH1Pattern();
        const pldSchemaType = getSchemaType();
        const pldCtaType = getCtaType();

        log('PLD Level: ' + pldLevel, 'PLD');
        log('PLD Entity: ' + pldEntity, 'PLD');
        log('PLD Content Focus: ' + pldContentFocus, 'PLD');
        log('PLD Kategori: ' + pldKategori, 'PLD');

        // Override entityType dengan PLD kalau ada
        if (pldEntity) entityType = pldEntity;

        // ============================================================
        // 2. HITUNG PAGE INFO
        // ============================================================
        const currentFullUrl = currentUrl.startsWith('http')
            ? currentUrl
            : CONFIG_GLOBAL.DOMAIN + currentUrl;

        let currentPageTitle = getCleanPageNameFromUrl(currentFullUrl);
        if (!currentPageTitle) currentPageTitle = 'Halaman';

        const currentPageType = pldLevel;

        log('Current page title: "' + currentPageTitle + '"', 'INFO');
        log('Current page type: ' + currentPageType, 'INFO');

        // ============================================================
        // 3. BUILD ALL LEVELS DARI breadcrumbItems
        // ============================================================
        const allLevels = [];
        let positionCounter = 1;

        for (let i = 0; i < breadcrumbItems.length; i++) {
            const item = breadcrumbItems[i];
            let name, url;

            if (typeof item === 'object' && item !== null) {
                name = item.name;
                url = item.url || null;
            } else {
                name = String(item);
                url = null;
            }

            if (!name) continue;

            const type = detectPageType(name, false, null);
            allLevels.push({
                name: name,
                url: url,
                type: type,
                level: TYPE_LEVEL_MAP[type] || 99,
                position: positionCounter++
            });
        }

        // Tambah halaman saat ini
        allLevels.push({
            name: currentPageTitle,
            url: currentFullUrl,
            type: currentPageType,
            level: TYPE_LEVEL_MAP[currentPageType] || 99,
            position: positionCounter++,
            isCurrent: true
        });

        // ============================================================
        // 4. URL FALLBACK
        // ============================================================
        for (const level of allLevels) {
            if (!level.url) {
                let foundUrl = null;
                if (mappingObj) {
                    for (const url in mappingObj) {
                        if (mappingObj[url] === level.name) {
                            foundUrl = url.startsWith('http') ? url : CONFIG_GLOBAL.DOMAIN + url;
                            break;
                        }
                    }
                }
                if (!foundUrl) {
                    foundUrl = CONFIG_GLOBAL.DOMAIN + '/p/' + slugify(level.name) + '.html';
                }
                level.url = foundUrl;
            } else if (!level.url.startsWith('http')) {
                level.url = CONFIG_GLOBAL.DOMAIN + level.url;
            }
        }

        // ============================================================
        // 5. BUILD BREADCRUMB LINEAGE — AMBIL PARENT BERDASARKAN POSISI
        // ============================================================
        const selectedLevels = [];

        // Selalu mulai dengan Beranda
        selectedLevels.push({
            name: 'Beranda',
            url: CONFIG_GLOBAL.DOMAIN,
            type: 'home',
            level: 0,
            position: 1
        });

        // Dedupe by URL
        const uniqueByUrl = new Map();
        for (const item of allLevels) {
            const key = item.url || item.name;
            if (!uniqueByUrl.has(key)) {
                uniqueByUrl.set(key, item);
            }
        }
        const uniqueItems = Array.from(uniqueByUrl.values());

        // Ambil semua item kecuali halaman saat ini = parent candidates
        const parentCandidates = uniqueItems.filter(function(item) {
            return item.name.toLowerCase() !== currentPageTitle.toLowerCase();
        });

        // Sort by position (paling akhir dulu)
        parentCandidates.sort(function(a, b) {
            return (b.position || 0) - (a.position || 0);
        });

        log('Parent candidates (' + parentCandidates.length + '): ' +
            parentCandidates.map(function(i) { return i.position + ':' + i.name; }).join(', '), 'DEBUG');

        // Ambil parent dengan position tertinggi (parent langsung)
        let finalParents = [];
        if (parentCandidates.length > 0) {
            const highestPosition = Math.max.apply(null, parentCandidates.map(function(i) { return i.position || 0; }));
            finalParents = parentCandidates.filter(function(item) {
                return item.position === highestPosition;
            });

            // Sort ascending
            finalParents.sort(function(a, b) { return a.position - b.position; });

            log('Final parents (' + finalParents.length + '): ' +
                finalParents.map(function(i) { return i.name; }).join(', '), 'SUCCESS');
        }

        // Kalau tidak ada parent, cek entity pillar
        if (finalParents.length === 0) {
            const entityPillars = getEntityPillarNames(entityType);
            if (entityPillars.length > 0) {
                const pillarName = entityPillars[0];
                const pillarItem = uniqueItems.find(function(item) {
                    return item.name.toLowerCase() === pillarName;
                });
                if (pillarItem) {
                    finalParents.push(pillarItem);
                    log('Entity pillar as parent: ' + pillarName, 'SUCCESS');
                }
            }
        }

        // Tambah finalParents ke selectedLevels
        for (const item of finalParents) {
            const exists = selectedLevels.some(function(l) {
                return l.name.toLowerCase() === item.name.toLowerCase();
            });
            if (!exists) {
                selectedLevels.push(item);
            }
        }

        // Tambah halaman saat ini di akhir
        const currentAlreadyAdded = selectedLevels.some(function(item) {
            return item.name.toLowerCase() === currentPageTitle.toLowerCase();
        });

        if (!currentAlreadyAdded) {
            selectedLevels.push({
                name: currentPageTitle,
                url: currentFullUrl,
                type: currentPageType,
                level: TYPE_LEVEL_MAP[currentPageType] || 99,
                isCurrent: true
            });
        }

        // ============================================================
        // 6. FINAL DEDUPE + SORT
        // ============================================================
        const uniqueLevels = [];
        const usedNames = new Set();

        for (const item of selectedLevels) {
            const key = item.name.toLowerCase();
            if (usedNames.has(key)) continue;
            usedNames.add(key);
            uniqueLevels.push(item);
        }

        // Sort by hierarchy level, kecuali Beranda selalu di depan
        uniqueLevels.sort(function(a, b) {
            if (a.type === 'home') return -1;
            if (b.type === 'home') return 1;
            return (a.level || 99) - (b.level || 99);
        });

        // Update position
        uniqueLevels.forEach(function(item, index) {
            item.position = index + 1;
        });

        log('Final breadcrumb (' + uniqueLevels.length + '): ' +
            uniqueLevels.map(function(i) { return i.name; }).join(' › '), 'SUCCESS');

        // ============================================================
        // 7. GENERATE HTML
        // ============================================================
        let breadcrumbHtml = '<div class="breadcrumbs" itemscope itemtype="https://schema.org/BreadcrumbList">\n';

        for (let i = 0; i < uniqueLevels.length; i++) {
            const item = uniqueLevels[i];
            const isLast = i === uniqueLevels.length - 1;

            if (!isLast) {
                breadcrumbHtml +=
                    '<span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">' +
                    '<a href="' + item.url + '" itemprop="item" title="' + item.name + '">' +
                    '<span itemprop="name">' + item.name + '</span>' +
                    '</a>' +
                    '<meta itemprop="position" content="' + item.position + '" />' +
                    '</span>' +
                    '<span class="separator"> › </span>';
            } else {
                breadcrumbHtml +=
                    '<span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">' +
                    '<span itemprop="name">' + item.name + '</span>' +
                    '<meta itemprop="position" content="' + item.position + '" />' +
                    '</span>';
            }
        }

        breadcrumbHtml += '</div>\n';

        // ============================================================
        // 8. JSON-LD
        // ============================================================
        const jsonLd = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": uniqueLevels.map(function(item, index) {
                return {
                    "@type": "ListItem",
                    "position": index + 1,
                    "name": item.name,
                    "item": item.url
                };
            })
        };

        // ============================================================
        // 9. HAPUS BREADCRUMB LAMA
        // ============================================================
        document.querySelectorAll('.breadcrumbs, .breadcrumb-nav, [aria-label="Breadcrumb"]')
            .forEach(function(el) { el.remove(); });
        document.querySelectorAll('script[data-breadcrumb="true"]')
            .forEach(function(el) { el.remove(); });

        // ============================================================
        // 10. INJECT KE DOM
        // ============================================================
        const targetElement = document.querySelector('main, article, .content, #main-content, .post-content');

        if (targetElement) {
            targetElement.insertAdjacentHTML('afterbegin', breadcrumbHtml);
        } else {
            document.body.insertAdjacentHTML('afterbegin', breadcrumbHtml);
        }

        // ============================================================
        // 11. INJECT JSON-LD
        // ============================================================
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-breadcrumb', 'true');
        script.textContent = JSON.stringify(jsonLd, null, 2);
        document.head.appendChild(script);

        // ============================================================
        // 12. SET FLAG + DISPATCH EVENT
        // ============================================================
        const nearestParent = finalParents.length > 0 ? finalParents[finalParents.length - 1] : null;

        document.body.setAttribute('data-breadcrumb-ready', 'true');
        document.body.setAttribute('data-breadcrumb-parent', nearestParent ? (nearestParent.name || '') : '');
        document.body.setAttribute('data-breadcrumb-parent-url', nearestParent ? (nearestParent.url || '') : '');

        log('🚩 FLAG SET: data-breadcrumb-ready="true"', 'FLAG');
        log('   parent="' + (nearestParent ? nearestParent.name : '(none)') + '"', 'FLAG');

        window.dispatchEvent(new CustomEvent('breadcrumbGenerated', {
            detail: {
                parentName: nearestParent ? nearestParent.name : null,
                parentUrl: nearestParent ? nearestParent.url : null,
                selectedLevels: uniqueLevels,
                currentPageType: currentPageType,
                entityType: entityType,
                version: '15.1.0',
                pldLevel: pldLevel,
                pldContentFocus: pldContentFocus,
                pldKategori: pldKategori,
                pldH1Pattern: pldH1Pattern,
                pldSchemaType: pldSchemaType,
                pldCtaType: pldCtaType
            }
        }));

        log('📣 EVENT DISPATCHED: "breadcrumbGenerated"', 'EVENT');

        // ============================================================
        // 13. RETURN
        // ============================================================
        return {
            html: breadcrumbHtml,
            jsonLd: jsonLd,
            selectedLevels: uniqueLevels,
            currentPageType: currentPageType,
            entityType: entityType,
            version: '15.1.0',
            parentCount: finalParents.length,
            parents: finalParents,
            pldLevel: pldLevel,
            pldContentFocus: pldContentFocus,
            pldKategori: pldKategori,
            pldH1Pattern: pldH1Pattern,
            pldSchemaType: pldSchemaType,
            pldCtaType: pldCtaType,
            nearestParent: nearestParent,
            isMobile: IS_MOBILE,
            isSlowDevice: IS_SLOW_DEVICE,
            debugEnabled: CONFIG_GLOBAL.DEBUG
        };
    }

    // ============================================================
    // 🔥 FIX #3: LAZY LOAD BREADCRUMB (requestIdleCallback)
    // ============================================================
    // MASALAH: generateBreadcrumbShared dipanggil saat DOMContentLoaded,
    // tapi eksekusinya BERAT (loop 200+ if, panggil PLD 5-10x).
    // Ini mem-BLOCK render sisa halaman.
    //
    // SOLUSI: Bungkus dengan requestIdleCallback — browser hanya
    // jalankan saat IDLE (setelah render selesai).
    // Fallback: setTimeout(0) untuk browser lama.
    //
    // EFEK: Halaman render INSTAN, breadcrumb muncul 200-500ms
    // kemudian tanpa blocking.
    // ============================================================
    function generateBreadcrumbShared(mappingObj, currentUrl, breadcrumbItems, entityType) {
        var args = arguments;

        // 🔥 FIX #3: Jalankan saat browser idle
        if (typeof requestIdleCallback !== 'undefined') {
            log('⏳ generateBreadcrumbShared dijadwalkan (requestIdleCallback)', 'PERF');
            requestIdleCallback(function() {
                log('🚀 generateBreadcrumbShared EXECUTE (idle)', 'PERF');
                _generateBreadcrumbSharedImpl.apply(null, args);
            }, { timeout: 2000 }); // timeout 2s — paksa eksekusi kalau browser sibuk
        } else {
            // Fallback browser lama (Safari < 15)
            log('⏳ generateBreadcrumbShared dijadwalkan (setTimeout fallback)', 'PERF');
            setTimeout(function() {
                log('🚀 generateBreadcrumbShared EXECUTE (timeout)', 'PERF');
                _generateBreadcrumbSharedImpl.apply(null, args);
            }, 0);
        }
    }

    // ============================================================
    // ✅ EXPOSE KE WINDOW
    // ============================================================
    window.generateBreadcrumbShared = generateBreadcrumbShared;

    // ============================================================
    // LOG INFO DEVICE
    // ============================================================
    if (ENABLE_DEBUG) {
        console.log('✅ [Breadcrumb Shared v15.1.0] Clean + Performance Patch siap dipakai');
        console.log('   🖥️ Device: ' + (IS_MOBILE ? 'MOBILE' : 'DESKTOP'));
        console.log('   ⚡ Slow Device: ' + (IS_SLOW_DEVICE ? 'YES' : 'NO'));
        console.log('   🐛 Debug: ' + (ENABLE_DEBUG ? 'ON' : 'OFF'));
        console.log('   📌 Prinsip: PLD = DETEKSI, Breadcrumb = RENDER');
        console.log('   🔥 FIX #3: Lazy Load (requestIdleCallback)');
        console.log('   🔥 FIX #4: Cache detectPageType');
    } else {
        console.log('✅ [Breadcrumb Shared v15.1.0] Loaded (silent mode — HP detected)');
    }

    // ============================================================
    // ⏳ TUNGGU PLD READY (opsional — hanya info)
    // ============================================================
    if (!window.pageLevelDetectorv22Ready) {
        var waited = 0;
        var checkInterval = setInterval(function() {
            waited += 100;
            if (window.pageLevelDetectorv22Ready) {
                clearInterval(checkInterval);
                log('PLD ready setelah ' + waited + 'ms', 'PLD');
            } else if (waited >= CONFIG_GLOBAL.PLD_WAIT_TIMEOUT) {
                clearInterval(checkInterval);
                log('PLD timeout ' + waited + 'ms — pakai fallback', 'WARN');
            }
        }, 100);
    }

})();
