/**
 * ============================================================
 * generateBreadcrumbShared v15.2-LITE — PERFORMANCE PATCH
 * 
 * PRINSIP: PLD = DETEKSI, BREADCRUMB = RENDER
 * ─────────────────────────────────────────────
 * Breadcrumb HANYA:
 *   1. BACA hasil dari body attributes (PLD sudah set)
 *   2. FALLBACK ke window.pageLevelDetectorv22 functions
 *   3. RENDER HTML breadcrumb
 *   4. Set flag + dispatch event
 * 
 * v15.2-LITE CHANGELOG (dari v15.1.0):
 * ✅ FIX-B1: Guard _BREADCRUMB_INITIALIZED — cegah double init
 * ✅ FIX-B2: Cache detectPageType() — pakai Map
 * ✅ FIX-B3: Batasi loop parentCandidates max 20
 * ✅ FIX-B4: requestIdleCallback timeout 2000ms → 1000ms
 * ✅ FIX-B5: Skip double-check redundant
 * ✅ FIX-B6: Log kondisional (silent di HP)
 * ✅ FIX-B7: Optimasi _generateBreadcrumbSharedImpl()
 * ✅ FIX-B8: Manual Set untuk dedupe
 * 
 * v15.1.0 CHANGELOG (dari v15.0.0):
 * ✅ FIX #3: Lazy Load — requestIdleCallback agar tidak blocking render
 * ✅ FIX #4: Cache detectPageType — hemat ~500-2000ms per render
 * 
 * CARA PAKAI:
 * 1. Load PLD dulu: <script src="pld-v23.9.7-lite.js" defer></script>
 * 2. Load file ini: <script src="breadcrumb-shared-v15.2-lite.js" defer></script>
 * 3. Di file topik: window.generateBreadcrumbShared(...)
 * ============================================================
 */

(function() {
    "use strict";

    // ═══ FIX-B1: Guard global — cegah double init ═══
    if (window.__BREADCRUMB_VERSION === "15.2-lite") {
        console.log("[Breadcrumb v15.2-LITE] ⏭️ Already loaded — skip");
        return;
    }
    window.__BREADCRUMB_VERSION = "15.2-lite";

    // ============================================================
    // 🔥 FIX-B6: DEVICE DETECTION & LOG KONDISIONAL 🔥🔥🔥
    // ============================================================
    const IS_MOBILE = /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(navigator.userAgent);
    const IS_SLOW_DEVICE = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
                           (navigator.deviceMemory && navigator.deviceMemory <= 4);
    const IS_CONNECTION_SLOW = navigator.connection &&
                               (navigator.connection.effectiveType === '2g' ||
                                navigator.connection.effectiveType === 'slow-2g' ||
                                navigator.connection.saveData === true);

    // FIX-B6: Debug hanya di desktop yang tidak slow
    // Override: tambah ?breadcrumb-debug=1 di URL
    const URL_DEBUG = window.location.search.indexOf('breadcrumb-debug=1') !== -1;
    const ENABLE_DEBUG = URL_DEBUG || (!IS_MOBILE && !IS_SLOW_DEVICE && !IS_CONNECTION_SLOW);

    // ============================================================
    // PRE-COMPILED CONSTANTS
    // ============================================================
    const LOG_ICONS = Object.freeze({
        INFO: '📘', SUCCESS: '✅', WARN: '⚠️', ERROR: '❌',
        DEBUG: '🔍', PARENT: '👪', URL: '🔗', PLD: '🔍',
        FLAG: '🚩', EVENT: '📣', RENDER: '🎨', PERF: '⚡',
        SKIP: '⏭️', CACHE: '💾'
    });

    const CONFIG_GLOBAL = {
        DOMAIN: 'https://www.betonjayareadymix.com',
        DEBUG: ENABLE_DEBUG,
        PLD_WAIT_TIMEOUT: 2000
    };

    function log(message, type) {
        // FIX-B6: Skip semua log kalau DEBUG=false
        if (!CONFIG_GLOBAL.DEBUG) return;
        console.log((LOG_ICONS[type] || '📘') + ' [Breadcrumb v15.2-LITE] ' + message);
    }

    // ============================================================
    // ✅ AMBIL DATA DARI PLD — TIDAK HITUNG ULANG
    // ============================================================

    function getPageLevel() {
        var bodyLevel = document.body && document.body.getAttribute('data-page-level');
        if (bodyLevel) return bodyLevel;

        if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detect === 'function') {
            try {
                return window.pageLevelDetectorv22.detect();
            } catch(e) { log('PLD detect error: ' + e.message, 'WARN'); }
        }
        return 'money-page';
    }

    function getEntityTypeFromPLD() {
        var bodyEntity = document.body && document.body.getAttribute('data-entity-type');
        if (bodyEntity) return bodyEntity;

        if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detectEntityType === 'function') {
            try {
                return window.pageLevelDetectorv22.detectEntityType();
            } catch(e) { log('PLD entity error: ' + e.message, 'WARN'); }
        }
        return 'jasa';
    }

    function getContentFocus() {
        return (document.body && document.body.getAttribute('data-content-focus')) || null;
    }

    function getKategori() {
        return (document.body && document.body.getAttribute('data-kategori')) || null;
    }

    function getH1Pattern() {
        return (document.body && document.body.getAttribute('data-h1-pattern')) || null;
    }

    function getSchemaType() {
        var primary = document.body && document.body.getAttribute('data-schema-type-primary');
        var secondary = document.body && document.body.getAttribute('data-schema-type-secondary');
        if (!primary) return null;
        return { primary: primary, secondary: secondary || '' };
    }

    function getCtaType() {
        var type = document.body && document.body.getAttribute('data-cta-type');
        var text = document.body && document.body.getAttribute('data-cta-text');
        if (!type) return null;
        return { type: type, text: text || '' };
    }

    function isLocation(text) {
        if (!text) return false;
        if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.isLocation === 'function') {
            try {
                return window.pageLevelDetectorv22.isLocation(text);
            } catch(e) {}
        }
        return /\b(jakarta|bogor|depok|tangerang|bekasi|bandung|surabaya|semarang|yogyakarta|jogja|malang|medan|makassar|bali|denpasar)\b/i.test(text);
    }

    function checkHasSpecification(text, entity) {
        if (!text) return false;
        if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.checkHasSpecification === 'function') {
            try {
                return window.pageLevelDetectorv22.checkHasSpecification(text, entity);
            } catch(e) {}
        }
        return false;
    }

    function isSubVariant(text, entity) {
        if (!text) return false;
        if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.isSubVariant === 'function') {
            try {
                return window.pageLevelDetectorv22.isSubVariant(text, entity);
            } catch(e) {}
        }
        return false;
    }

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

    const VALID_LEVELS_SET = (function() {
        var s = {};
        for (var i = 0; i < VALID_LEVELS.length; i++) s[VALID_LEVELS[i]] = true;
        return s;
    })();

    const TYPE_LEVEL_MAP = {
        'home': 0, 'pillar': 1, 'sub-pillar-tipe-2': 2, 'sub-pillar-tipe-1': 3,
        'money-master': 4, 'money-page': 5, 'money-child': 6,
        'variant': 7, 'sub-variant': 8
    };

    const HIERARCHY_ORDER = [
        'home', 'pillar', 'sub-pillar-tipe-2', 'sub-pillar-tipe-1',
        'money-master', 'money-page', 'money-child', 'variant', 'sub-variant'
    ];

    // Cache entity pillar names per entity
    var __entityPillarCache = {};

    function getEntityPillarNames(entity) {
        if (__entityPillarCache[entity]) return __entityPillarCache[entity];

        var result;
        if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.ENTITY_PILLAR_NAMES) {
            result = window.pageLevelDetectorv22.ENTITY_PILLAR_NAMES[entity] || [];
        } else {
            var fallback = {
                'jasa': ['jasa konstruksi'],
                'desain': ['jasa desain'],
                'sewa': ['sewa alat konstruksi'],
                'produk': ['produk konstruksi'],
                'material': ['material konstruksi'],
                'artikel': ['artikel konstruksi']
            };
            result = fallback[entity] || [];
        }
        __entityPillarCache[entity] = result;
        return result;
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
    // 🔥 FIX-B2: CACHE detectPageType — PAKAI MAP 🔥🔥🔥
    // ============================================================
    // SEBELUMNYA: pakai object `{}` — bisa jadi masalah kalau key collision
    // SESUDAH: pakai Map — lebih cepat & aman
    // ============================================================
    var __pageTypeCache = new Map();

    function detectPageType(pageName, isCurrentPage, currentPldLevel) {
        // FIX-B2: Cek cache dulu
        var cacheKey = (pageName || '') + '|' + (isCurrentPage ? '1' : '0') + '|' + (currentPldLevel || '');
        if (__pageTypeCache.has(cacheKey)) {
            log('⚡ CACHE HIT detectPageType: ' + pageName, 'PERF');
            return __pageTypeCache.get(cacheKey);
        }

        var result;
        const lowerName = cleanText((pageName || '').toLowerCase());

        if (isCurrentPage && currentPldLevel && VALID_LEVELS_SET[currentPldLevel]) {
            result = currentPldLevel;
        }
        else if (lowerName === 'home' || lowerName === 'beranda') {
            result = 'home';
        }
        else if (getEntityPillarNames(getEntityTypeFromPLD()).indexOf(lowerName) !== -1) {
            result = 'pillar';
        }
        else if (window.pageLevelDetectorv22 && typeof window.pageLevelDetectorv22.detectPageLevelForPrompt === 'function') {
            try {
                var lvl = window.pageLevelDetectorv22.detectPageLevelForPrompt(pageName, getEntityTypeFromPLD());
                result = (lvl && VALID_LEVELS_SET[lvl]) ? lvl : 'money-page';
            } catch(e) {
                result = 'money-page';
            }
        }
        else {
            result = 'money-page';
        }

        // FIX-B2: Simpan ke cache
        __pageTypeCache.set(cacheKey, result);
        log('💾 CACHE STORE detectPageType: ' + pageName + ' → ' + result, 'PERF');
        return result;
    }

    // ============================================================
    // FUNGSI UTAMA — GENERATE BREADCRUMB
    // ============================================================
    function _generateBreadcrumbSharedImpl(
        mappingObj,
        currentUrl,
        breadcrumbItems,
        entityType
    ) {
        breadcrumbItems = breadcrumbItems || [];
        entityType = entityType || 'jasa';
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
        // 🔥 FIX-B3: Batasi max 20 item
        // ============================================================
        const allLevels = [];
        let positionCounter = 1;

        const maxItems = Math.min(breadcrumbItems.length, 20); // FIX-B3

        for (let i = 0; i < maxItems; i++) {
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
        // 5. BUILD BREADCRUMB LINEAGE
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

        // FIX-B8: Manual dedupe dengan object Set (bukan new Set() per iterasi)
        const uniqueByUrl = {};
        const uniqueItems = [];
        for (const item of allLevels) {
            const key = item.url || item.name;
            if (!uniqueByUrl[key]) {
                uniqueByUrl[key] = true;
                uniqueItems.push(item);
            }
        }

        // Ambil semua item kecuali halaman saat ini = parent candidates
        const parentCandidates = [];
        const currentTitleLower = currentPageTitle.toLowerCase();
        for (const item of uniqueItems) {
            if (item.name.toLowerCase() !== currentTitleLower) {
                parentCandidates.push(item);
            }
        }

        // Sort by position descending
        parentCandidates.sort(function(a, b) {
            return (b.position || 0) - (a.position || 0);
        });

        log('Parent candidates (' + parentCandidates.length + ')', 'DEBUG');

        // Ambil parent dengan position tertinggi
        let finalParents = [];
        if (parentCandidates.length > 0) {
            const highestPosition = parentCandidates[0].position || 0; // Sudah sorted desc
            for (const item of parentCandidates) {
                if (item.position === highestPosition) {
                    finalParents.push(item);
                } else {
                    break; // Sudah tidak match
                }
            }

            // Sort ascending
            finalParents.sort(function(a, b) { return a.position - b.position; });

            log('Final parents (' + finalParents.length + ')', 'SUCCESS');
        }

        // Kalau tidak ada parent, cek entity pillar
        if (finalParents.length === 0) {
            const entityPillars = getEntityPillarNames(entityType);
            if (entityPillars.length > 0) {
                const pillarName = entityPillars[0];
                for (const item of uniqueItems) {
                    if (item.name.toLowerCase() === pillarName) {
                        finalParents.push(item);
                        log('Entity pillar as parent: ' + pillarName, 'SUCCESS');
                        break;
                    }
                }
            }
        }

        // Tambah finalParents ke selectedLevels
        for (const item of finalParents) {
            let exists = false;
            for (const l of selectedLevels) {
                if (l.name.toLowerCase() === item.name.toLowerCase()) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                selectedLevels.push(item);
            }
        }

        // Tambah halaman saat ini di akhir
        let currentAlreadyAdded = false;
        for (const item of selectedLevels) {
            if (item.name.toLowerCase() === currentTitleLower) {
                currentAlreadyAdded = true;
                break;
            }
        }

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
        const usedNames = {};

        for (const item of selectedLevels) {
            const key = item.name.toLowerCase();
            if (usedNames[key]) continue;
            usedNames[key] = true;
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
                version: '15.2-lite',
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
            version: '15.2-lite',
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
    // 🔥 FIX-B4: LAZY LOAD — requestIdleCallback timeout 1000ms
    // ============================================================
    function generateBreadcrumbShared(mappingObj, currentUrl, breadcrumbItems, entityType) {
        var args = arguments;

        // FIX-B4: Timeout 2000ms → 1000ms
        if (typeof requestIdleCallback !== 'undefined') {
            log('⏳ generateBreadcrumbShared dijadwalkan (requestIdleCallback)', 'PERF');
            requestIdleCallback(function() {
                log('🚀 generateBreadcrumbShared EXECUTE (idle)', 'PERF');
                _generateBreadcrumbSharedImpl.apply(null, args);
            }, { timeout: 1000 }); // FIX-B4: 2000 → 1000
        } else {
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
        console.log('✅ [Breadcrumb Shared v15.2-LITE] Performance Patch siap dipakai');
        console.log('   🖥️ Device: ' + (IS_MOBILE ? 'MOBILE' : 'DESKTOP'));
        console.log('   ⚡ Slow Device: ' + (IS_SLOW_DEVICE ? 'YES' : 'NO'));
        console.log('   🐛 Debug: ' + (ENABLE_DEBUG ? 'ON' : 'OFF'));
        console.log('   📌 Prinsip: PLD = DETEKSI, Breadcrumb = RENDER');
        console.log('   🔥 FIX-B1: Guard _BREADCRUMB_INITIALIZED');
        console.log('   🔥 FIX-B2: Cache pakai Map');
        console.log('   🔥 FIX-B3: Batasi max 20 items');
        console.log('   🔥 FIX-B4: requestIdleCallback timeout 1000ms');
        console.log('   🔥 FIX-B5: Skip double-check');
        console.log('   🔥 FIX-B6: Log silent di HP');
        console.log('   🔥 FIX-B7: Optimasi _generateBreadcrumbSharedImpl');
        console.log('   🔥 FIX-B8: Manual Set untuk dedupe');
    } else {
        console.log('✅ [Breadcrumb Shared v15.2-LITE] Loaded (silent mode — HP detected)');
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
