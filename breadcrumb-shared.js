
/**
 * ============================================================
 * generateBreadcrumbShared v12.3.3 — SHARED FUNCTION
 * Digunakan oleh banyak file JS external per topik
 * 
 * CARA PAKAI:
 * 1. Load file ini PERTAMA (sebelum file per topik)
 * 2. Di file per topik, panggil:
 *    window.generateBreadcrumbShared(...)
 * 
 * v12.3.3 CHANGELOG:
 * - TAMBAH: Set flag data-breadcrumb-ready untuk schema-article.js
 * - TAMBAH: Set flag data-breadcrumb-parent
 * - TAMBAH: Set flag data-breadcrumb-parent-url
 * - TAMBAH: Dispatch event "breadcrumbGenerated" untuk schema-article.js
 * - PERTAHANKAN: Semua kode valid dari v12.3.2
 * ============================================================
 */

(function() {
    "use strict";
    
    /**
     * ============================================================
     * FUNCTION UTAMA
     * ============================================================
     */
    function generateBreadcrumbShared(
        mappingObj,
        currentUrl,
        breadcrumbItems = [],
        entityType = 'PRODUK_KONSTRUKSI'
    ) {
        // ============================================================
        // 1. GLOBAL CONFIG
        // ============================================================

        const CONFIG = {
            DOMAIN: 'https://www.betonjayareadymix.com',
            DEBUG: true,
            CURRENT_YEAR: new Date().getFullYear()
        };

        // ============================================================
        // 2. LOGGER
        // ============================================================

        function log(message, type = 'INFO') {
            if (!CONFIG.DEBUG && type === 'INFO') return;
            const icons = { 
                INFO: '📘', 
                SUCCESS: '✅', 
                WARN: '⚠️', 
                ERROR: '❌', 
                DEBUG: '🔍', 
                VARIANT: '🔬', 
                PARENT: '👪', 
                URL: '🔗',
                SCORE: '🎯',
                CLEAN: '🧹',
                SKIP: '⏭️',
                PLD: '🔄',
                HIERARCHY: '🏛️',
                COMMERCIAL: '🛒',
                PARENT_FIX: '🔧',
                FLAG: '🚩',
                EVENT: '📡'
            };
            console.log(`${icons[type] || '📘'} [Breadcrumb v12.3.3] ${message}`);
        }

        // ============================================================
        // 3. ENTITY NORMALIZATION
        // ============================================================

        const ENTITY_TYPE_MAP = {
            'JASA': 'JASA_KONSTRUKSI',
            'JASA_KONSTRUKSI': 'JASA_KONSTRUKSI',
            'JASA_DESAIN': 'JASA_DESAIN',
            'JASA_INTERIOR': 'JASA_KONSTRUKSI',
            'JASA_DESAIN_INTERIOR': 'JASA_DESAIN',
            'SEWA': 'SEWA_ALAT_KONSTRUKSI',
            'RENTAL': 'SEWA_ALAT_KONSTRUKSI',
            'SEWA_ALAT': 'SEWA_ALAT_KONSTRUKSI',
            'RENTAL_ALAT': 'SEWA_ALAT_KONSTRUKSI',
            'SEWA_RENTAL': 'SEWA_ALAT_KONSTRUKSI',
            'SEWA_ALAT_KONSTRUKSI': 'SEWA_ALAT_KONSTRUKSI',
            'PRODUK': 'PRODUK_KONSTRUKSI',
            'PRODUK_KONSTRUKSI': 'PRODUK_KONSTRUKSI',
            'PRODUK_INTERIOR': 'PRODUK_INTERIOR',
            'MATERIAL': 'MATERIAL_KONSTRUKSI',
            'MATERIAL_KONSTRUKSI': 'MATERIAL_KONSTRUKSI',
            'ARTIKEL': 'ARTIKEL'
        };

        entityType = ENTITY_TYPE_MAP[entityType] || entityType;

        // ============================================================
        // 4. VALID ENTITY TYPES
        // ============================================================

        const VALID_ENTITY_TYPES = [
            'JASA_KONSTRUKSI',
            'JASA_DESAIN',
            'SEWA_ALAT_KONSTRUKSI',
            'PRODUK_KONSTRUKSI',
            'PRODUK_INTERIOR',
            'MATERIAL_KONSTRUKSI',
            'ARTIKEL'
        ];

        // ============================================================
        // 5. VALID LEVELS
        // ============================================================

        const VALID_LEVELS = [
            'home', 'pillar', 'sub-pillar-tipe-2', 'sub-pillar-tipe-1',
            'money-master', 'money-page', 'money-child', 'variant', 'sub-variant'
        ];

        // ============================================================
        // 6. HIERARCHY ORDER (WAJIB - TIDAK BOLEH DIUBAH)
        // ============================================================

        const HIERARCHY_ORDER = [
            'home',
            'pillar',
            'sub-pillar-tipe-2',
            'sub-pillar-tipe-1',
            'money-master',
            'money-page',
            'money-child',
            'variant',
            'sub-variant'
        ];

        const TYPE_LEVEL_MAP = {
            'home': 0,
            'pillar': 1,
            'sub-pillar-tipe-2': 2,
            'sub-pillar-tipe-1': 3,
            'money-master': 4,
            'money-page': 5,
            'money-child': 6,
            'variant': 7,
            'sub-variant': 8
        };

        // ============================================================
        // 7. ENTITY PILLAR NAMES (HANYA INI YANG BISA JADI PILLAR)
        // ============================================================

        const ENTITY_PILLAR_NAMES = {
            'JASA_KONSTRUKSI': ['jasa konstruksi'],
            'JASA_DESAIN': ['jasa desain interior'],
            'SEWA_ALAT_KONSTRUKSI': ['sewa alat konstruksi', 'rental alat konstruksi'],
            'PRODUK_KONSTRUKSI': ['produk konstruksi'],
            'PRODUK_INTERIOR': ['produk interior', 'interior produk'],
            'MATERIAL_KONSTRUKSI': ['material konstruksi', 'bahan konstruksi'],
            'ARTIKEL': ['artikel konstruksi', 'blog konstruksi', 'tips konstruksi']
        };

        // ============================================================
        // 8. PLD ENTITY MAP
        // ============================================================

        const PLD_ENTITY_MAP = {
            'produk': 'PRODUK_KONSTRUKSI',
            'material': 'MATERIAL_KONSTRUKSI',
            'jasa': 'JASA_KONSTRUKSI',
            'desain': 'JASA_DESAIN',
            'sewa': 'SEWA_ALAT_KONSTRUKSI',
            'artikel': 'ARTIKEL'
        };

        // ============================================================
        // 9. GET PAGE LEVEL FROM PLD
        // ============================================================

        function getPageLevelFromPLD() {
            const pldVersions = [
                'pageLevelDetectorv22',
                'pageLevelDetectorv20', 
                'pageLevelDetectorv19',
                'pageLevelDetectorV18',
                'pageLevelDetectorV17',
                'pageLevelDetector'
            ];
            
            for (const pldName of pldVersions) {
                if (window[pldName] && typeof window[pldName].detect === 'function') {
                    try {
                        const level = window[pldName].detect();
                        if (level && VALID_LEVELS.includes(level)) {
                            log(`PLD ${pldName}: "${level}" (${TYPE_LEVEL_MAP[level]})`, 'PLD');
                            return level;
                        }
                    } catch(e) {
                        log(`Error calling ${pldName}: ${e.message}`, 'WARN');
                    }
                }
            }
            
            const bodyLevel = document.body.getAttribute('data-page-level') || 
                              document.body.getAttribute('data-schema-page-level');
            if (bodyLevel && VALID_LEVELS.includes(bodyLevel)) {
                log(`PLD from body: "${bodyLevel}" (${TYPE_LEVEL_MAP[bodyLevel]})`, 'PLD');
                return bodyLevel;
            }
            
            log('PLD not available, using fallback', 'WARN');
            return null;
        }

        function getEntityTypeFromPLD() {
            const pldVersions = [
                'pageLevelDetectorv22',
                'pageLevelDetectorv20', 
                'pageLevelDetectorv19',
                'pageLevelDetectorV18',
                'pageLevelDetectorV17',
                'pageLevelDetector'
            ];
            
            for (const pldName of pldVersions) {
                if (window[pldName] && typeof window[pldName].detectEntityType === 'function') {
                    try {
                        const entity = window[pldName].detectEntityType();
                        if (entity && PLD_ENTITY_MAP[entity]) {
                            log(`PLD Entity: ${entity} → ${PLD_ENTITY_MAP[entity]}`, 'PLD');
                            return PLD_ENTITY_MAP[entity];
                        }
                    } catch(e) {
                        log(`Error getting entity from ${pldName}: ${e.message}`, 'WARN');
                    }
                }
            }
            
            const bodyEntity = document.body.getAttribute('data-entity-type');
            if (bodyEntity && PLD_ENTITY_MAP[bodyEntity]) {
                log(`Entity from body: ${bodyEntity} → ${PLD_ENTITY_MAP[bodyEntity]}`, 'PLD');
                return PLD_ENTITY_MAP[bodyEntity];
            }
            
            return null;
        }

        // ============================================================
        // 10. HELPERS
        // ============================================================

        function isJasaEntity() { return entityType === 'JASA_KONSTRUKSI'; }
        function isDesainEntity() { return entityType === 'JASA_DESAIN'; }
        function isSewaEntity() { return entityType === 'SEWA_ALAT_KONSTRUKSI'; }
        function isProdukEntity() { return entityType === 'PRODUK_KONSTRUKSI'; }
        function isMaterialEntity() { return entityType === 'MATERIAL_KONSTRUKSI'; }
        function isInteriorEntity() { return entityType === 'PRODUK_INTERIOR'; }

        // ============================================================
        // 11. CLEAN TEXT
        // ============================================================

        function cleanText(text) {
            if (!text) return '';
            return text.replace(/\s+/g, ' ').trim();
        }

        // ============================================================
        // 12. CLEAN PAGE NAME FROM URL
        // ============================================================

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
            
            if (!last && parts.length > 0) {
                last = parts.pop() || '';
            }
            
            last = last.replace(/-/g, ' ');
            last = last.replace(/[^a-z0-9\s]/gi, '');
            
            if (last.length < 3 && parts.length > 0) {
                const lastTwo = parts.slice(-2).join(' ');
                if (lastTwo.length > last.length) {
                    last = lastTwo;
                }
            }
            
            const cleanResult = cleanText(last.toLowerCase());
            log(`Cleaned URL: "${url}" → "${cleanResult}"`, 'URL');
            
            return cleanResult;
        }

        // ============================================================
        // 13. SLUGIFY
        // ============================================================

        function slugify(text) {
            return cleanText(text)
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/--+/g, '-');
        }

        // ============================================================
        // 14. KEYWORDS & FILTERS (SINKRON DENGAN PLD v22.25)
        // ============================================================

        const COMMERCIAL_WORDS = ['jual', 'beli', 'sewa', 'rental', 'order', 'pesan', 'pemesanan'];

        const STOPWORDS = new Set([
            'dan', 'atau', 'serta', 'yang', 'dari', 'ke', 'di', 'untuk', 
            'dengan', 'ini', 'itu', 'akan', 'telah', 'sudah', 'masih',
            'pada', 'oleh', 'karena', 'sehingga', 'setelah', 'sebelum',
            'plus', 'minus', 'tanpa', 'sampai', 'hingga', 'sambil'
        ]);

        const LOCATION_WORDS = new Set([
            'jakarta', 'jakarta pusat', 'jakarta barat', 'jakarta selatan', 'jakarta timur', 'jakarta utara',
            'bogor', 'kota bogor', 'kabupaten bogor',
            'depok', 'kota depok',
            'tangerang', 'kota tangerang', 'kota tangerang selatan', 'kabupaten tangerang',
            'bekasi', 'kota bekasi', 'kabupaten bekasi',
            'bandung', 'kota bandung', 'kabupaten bandung',
            'karawang', 'kabupaten karawang',
            'purwakarta', 'kabupaten purwakarta',
            'cikarang', 'cikarang barat', 'cikarang pusat', 'cikarang selatan', 'cikarang timur', 'cikarang utara',
            'subang', 'kabupaten subang',
            'cirebon', 'kota cirebon', 'kabupaten cirebon',
            'semarang', 'kota semarang', 'kabupaten semarang',
            'solo', 'surakarta', 'kota surakarta',
            'pekalongan', 'tegal', 'magelang', 'sukoharjo', 'boyolali', 'klaten',
            'jogja', 'yogyakarta', 'kota yogyakarta', 'kabupaten sleman', 'bantul', 'gunungkidul', 'kulon progo',
            'surabaya', 'kota surabaya',
            'malang', 'kota malang', 'kabupaten malang',
            'kediri', 'kota kediri', 'kabupaten kediri',
            'gresik', 'sidoarjo', 'mojokerto', 'pasuruan', 'probolinggo', 'jember', 'banyuwangi', 'madiun',
            'medan', 'kota medan',
            'palembang', 'pekanbaru', 'padang', 'lampung', 'bandar lampung', 'batam', 'tanjungpinang',
            'aceh', 'banda aceh', 'jambi', 'bengkulu', 'pangkal pinang',
            'pontianak', 'balikpapan', 'samarinda', 'banjarmasin', 'palangkaraya',
            'makassar', 'kota makassar',
            'manado', 'palu', 'kendari', 'gorontalo',
            'bali', 'kabupaten badung', 'kota denpasar', 'denpasar', 'gianyar', 'tabanan', 'bangli', 'karangasem', 'klungkung', 'buleleng', 'jembrana',
            'mataram', 'kupang',
            'terdekat'
        ]);

        const SP1_KEYWORDS = [
            'vs', 'versus', 'perbandingan', 'lebih baik', 'kelebihan', 'kekurangan'
        ];

        const SP2_KEYWORDS = [
            'jenis', 'kategori', 'daftar', 'macam', 'tipe'
        ];

        const VARIANT_KEYWORDS_PRODUK = [
            'spesifikasi', 'spec', 'detail spesifikasi',
            'mutu', 'kualitas', 'quality',
            'ukuran', 'dimensi',
            'grade', 'type', 'tipe', 'model',
            'standar', 'merk', 'brand', 'seri'
        ];

        const VARIANT_KEYWORDS_JASA = [
            'standar pelayanan', 'sop', 'metode kerja',
            'prosedur', 'tahapan', 'cara kerja',
            'durasi', 'waktu pengerjaan', 'garansi',
            'standar pengerjaan'
        ];

        const VARIANT_KEYWORDS_SEWA = [
            'spesifikasi alat', 'kapasitas alat',
            'spek alat', 'detail alat', 'spesifikasi'
        ];

        const TECHNICAL_SPECS = ['k225', 'k250', 'k300', 'k350', 'k400', 'k500', 'k600', 'fc', 'm6', 'm8', 'm10', 'm12', 'm16', 'm20', 'b0', 'b1', 'b2', 'b3', 'sni'];
        
        const SPECIFIC_MODIFIERS = [
            'k225', 'k250', 'k300', 'm6', 'm8', 'm10',
            'diesel', 'hidrolik', 'mini pile', 'sheet pile', 'drop hammer',
            'breaker', 'long arm', 'vibrator', 'per jam', 'per hari',
            'per meter', 'per m2', 'terdekat', 'murah', 'kapasitas besar'
        ];

        // ============================================================
        // 15. JASA CLEAN FUNCTION
        // ============================================================

        const JASA_ULTRA_COMMON_WORDS = new Set([
            'jasa', 'kontraktor', 'tukang', 'borongan', 'renovasi',
            'pasang', 'bangun', 'perbaikan', 'instalasi', 'proyek',
            'cor', 'gali', 'urug', 'angkut', 'service', 'servis',
            'desain'
        ]);

        const MATERIAL_SPEC_WORDS = new Set([
            'baja ringan', 'baja', 'ringan', 'beton', 'readymix', 
            'kanstin', 'pembatas', 'pengaman', 'struktur', 'dinding',
            'pondasi', 'atap', 'genteng', 'keramik', 'marmer', 'granit',
            'plafon', 'gypsum', 'partisi', 'dak', 'cor', 'pile', 'sheet',
            'tiang', 'balok', 'kolom', 'sloof', 'ring', 'balk', 'kuda-kuda',
            'drainase', 'irigasi', 'box culvert', 'u ditch', 'paving',
            'konstruksi', 'rangka', 'material', 'upah', 'tenaga'
        ]);

        const MODIFIER_WORDS = new Set([
            'murah', 'profesional', 'berkualitas', 'terbaik', 'spesialis',
            'ahli', 'berpengalaman', 'resmi', 'terpercaya', 'ekonomis',
            'cepat', 'tepat', 'garansi', 'kualitas', 'harga', 'biaya',
            'tarif', 'ongkos', 'estimasi', 'perhitungan', 'analisa',
            'modern', 'minimalis', 'mewah', 'klasik', 'tradisional',
            'kontemporer', 'sederhana', 'elegan', 'premium', 'luxury'
        ]);

        function cleanJasaText(text) {
            if (!text) return '';
            
            let cleaned = text.toLowerCase();
            
            for (const kw of JASA_ULTRA_COMMON_WORDS) {
                cleaned = cleaned.replace(new RegExp(`\\b${kw}\\b`, 'g'), ' ');
            }
            
            for (const sw of STOPWORDS) {
                cleaned = cleaned.replace(new RegExp(`\\b${sw}\\b`, 'g'), ' ');
            }
            
            cleaned = cleaned.replace(/\s+/g, ' ').trim();
            
            log(`Clean JASA: "${text}" → "${cleaned}"`, 'CLEAN');
            
            return cleaned;
        }

        function countCoreWords(text) {
            if (!text) return 0;
            const words = text.toLowerCase().split(/\s+/).filter(w => w.length >= 2);
            return words.length;
        }

        function hasModifier(text) {
            if (!text) return false;
            const lower = text.toLowerCase();
            for (const mod of MODIFIER_WORDS) {
                if (lower.includes(mod)) return true;
            }
            return false;
        }

        function isSpecificJasa(text) {
            if (!text) return false;
            const lower = text.toLowerCase();
            if (/\d/.test(lower)) return true;
            if (/(k225|k250|k300|k350|k400|k500|k600|m6|m8|m10|m12|sn|sni)/i.test(lower)) return true;
            const specWords = ['spesifikasi', 'mutu', 'dimensi', 'ukuran', 'standar', 'grade', 'tipe', 'type'];
            for (const sw of specWords) {
                if (lower.includes(sw)) return true;
            }
            return false;
        }

        function hasMaterialSpec(text) {
            if (!text) return false;
            const lower = text.toLowerCase();
            for (const kw of MATERIAL_SPEC_WORDS) {
                if (lower.includes(kw)) return true;
            }
            return false;
        }

        // ============================================================
        // 16. DETEKSI JASA LEVEL OTOMATIS
        // ============================================================

        function detectJasaLevelAuto(pageName) {
            const lowerName = pageName.toLowerCase();
            
            const cleaned = cleanJasaText(lowerName);
            
            const remainingWords = cleaned.split(/\s+/).filter(w => w.length >= 2);
            const wordCount = remainingWords.length;
            
            const hasNumber = /\d/.test(cleaned);
            const hasLocation = isLocation(cleaned);
            const hasModifierWord = hasModifier(cleaned);
            const hasMaterialSpecWord = hasMaterialSpec(cleaned);
            
            log(`Auto detect JASA: "${pageName}" → remaining: "${cleaned}", words: ${wordCount}`, 'DEBUG');
            
            if (wordCount <= 1 && !hasNumber && !hasLocation && !hasModifierWord && !hasMaterialSpecWord) {
                log(`MM detected (auto): "${pageName}" → remaining words: ${wordCount}`, 'SUCCESS');
                return 'money-master';
            }
            
            log(`MP detected (auto): "${pageName}" → remaining words: ${wordCount}`, 'INFO');
            return 'money-page';
        }

        // ============================================================
        // 17. VARIANT DETECTION PER ENTITY (SINKRON DENGAN PLD v22.25)
        // ============================================================
        
        function isVariantPage(pageName, currentEntityType) {
            const lowerName = pageName.toLowerCase();
            
            for (const spec of TECHNICAL_SPECS) {
                if (lowerName.includes(spec)) {
                    return false;
                }
            }
            
            const PRICE_WORDS = ['harga', 'biaya', 'tarif', 'ongkos'];
            if (PRICE_WORDS.some(w => lowerName.includes(w))) {
                return false;
            }
            
            if (isLocation(lowerName)) {
                return false;
            }
            
            if (currentEntityType === 'PRODUK_KONSTRUKSI' || currentEntityType === 'MATERIAL_KONSTRUKSI') {
                for (const kw of VARIANT_KEYWORDS_PRODUK) {
                    if (lowerName.includes(kw)) {
                        log(`Variant detected (PRODUK/MATERIAL): "${pageName}" contains "${kw}"`, 'VARIANT');
                        return true;
                    }
                }
            }
            
            if (currentEntityType === 'JASA_KONSTRUKSI' || currentEntityType === 'JASA_DESAIN') {
                for (const kw of VARIANT_KEYWORDS_JASA) {
                    if (lowerName.includes(kw)) {
                        log(`Variant detected (JASA/DESAIN): "${pageName}" contains "${kw}"`, 'VARIANT');
                        return true;
                    }
                }
                return false;
            }
            
            if (currentEntityType === 'SEWA_ALAT_KONSTRUKSI') {
                for (const kw of VARIANT_KEYWORDS_SEWA) {
                    if (lowerName.includes(kw)) {
                        log(`Variant detected (SEWA): "${pageName}" contains "${kw}"`, 'VARIANT');
                        return true;
                    }
                }
                if (lowerName.includes('spesifikasi') && (lowerName.includes('alat') || lowerName.includes('excavator') || lowerName.includes('dump') || lowerName.includes('alat berat'))) {
                    log(`Variant detected (SEWA): "${pageName}" contains spesifikasi + alat`, 'VARIANT');
                    return true;
                }
                return false;
            }
            
            return false;
        }

        // ============================================================
        // 18. LOCATION DETECTION (SINKRON DENGAN PLD v22.25)
        // ============================================================

        function isLocation(text) {
            if (!text) return false;
            const lower = text.toLowerCase();
            for (const city of LOCATION_WORDS) {
                if (new RegExp(`\\b${city.replace(/\s+/g, '\\s+')}\\b`, 'i').test(lower)) {
                    return true;
                }
            }
            return false;
        }

        // ============================================================
        // 19. SPECIFIC PRODUCT
        // ============================================================

        function isSpecificProduct(text) {
            if (!text) return false;
            const lower = text.toLowerCase();
            for (const mod of SPECIFIC_MODIFIERS) {
                if (lower.includes(mod)) return true;
            }
            return /\d/.test(lower);
        }

        // ============================================================
        // 20. SUB VARIANT
        // ============================================================

        function isSubVariant(text) {
            if (!text) return false;
            let score = 0;
            const lower = text.toLowerCase();
            if ((lower.match(/\d+\s*(m|mm|cm|meter|kg|ton|inch|inci)/gi) || []).length >= 1) score += 2;
            if ((lower.match(/\d+x\d+/gi) || []).length >= 1) score += 2;
            if ((lower.match(/\d+(?:\.\d+)?\s*(?:cm|mm|m|meter)\s*(?:x|×)\s*\d+(?:\.\d+)?\s*(?:cm|mm|m|meter)/gi) || []).length >= 1) score += 3;
            const uniqueNumbers = (text.match(/\d+/g) || []).filter((v, i, a) => a.indexOf(v) === i);
            if (uniqueNumbers.length >= 2) score += 1;
            if (/\bukuran\s+\d+/.test(lower)) score += 2;
            if (/\bdimensi\s+\d+/.test(lower)) score += 2;
            if (/\b(tebal|panjang|lebar|tinggi|dalam|diameter)\s+\d+/.test(lower)) score += 2;
            return score >= 2;
        }

        // ============================================================
        // 21. ENTITY PILLAR EXACT MATCH
        // ============================================================

        function isEntityPillarExactMatch(pageName) {
            const cleanName = cleanText(pageName.toLowerCase());
            const valid = ENTITY_PILLAR_NAMES[entityType] || [];
            return valid.includes(cleanName);
        }

        // ============================================================
        // 22. JASA KEYWORDS
        // ============================================================

        const JASA_KEYWORDS_PATTERN = 
            /\b(jasa|kontraktor|tukang|borongan|renovasi|pasang|bangun|perbaikan|instalasi|proyek|cor|gali|urug|angkut|desain|interior|eksterior|arsitektur|gedung|rumah|ruko|kantor|apartemen)\b/i;

        // ============================================================
        // 23. PAGE TYPE DETECTION (FIX v12.2 - SINKRON DENGAN PLD)
        // ============================================================

        function detectPageTypeFallback(pageName, isHome = false) {
            const lowerName = cleanText(pageName.toLowerCase());

            if (isHome || lowerName === 'home' || lowerName === 'beranda') return 'home';
            
            if (isEntityPillarExactMatch(lowerName)) {
                log(`PILLAR detected (exact match): "${pageName}"`, 'HIERARCHY');
                return 'pillar';
            }
            
            for (const [entity, names] of Object.entries(ENTITY_PILLAR_NAMES)) {
                if (names.some(name => lowerName === name)) {
                    log(`PILLAR detected (other entity): "${pageName}" → ${entity}`, 'HIERARCHY');
                    return 'pillar';
                }
            }
            
            if (isSubVariant(lowerName)) {
                log(`SUB-VARIANT detected: "${pageName}"`, 'HIERARCHY');
                return 'sub-variant';
            }

            if (isVariantPage(lowerName, entityType)) {
                log(`VARIANT detected: "${pageName}"`, 'HIERARCHY');
                return 'variant';
            }

            for (const kw of SP1_KEYWORDS) {
                if (lowerName.includes(kw)) {
                    log(`SUB-PILLAR-1 detected: "${pageName}"`, 'HIERARCHY');
                    return 'sub-pillar-tipe-1';
                }
            }
            
            for (const kw of SP2_KEYWORDS) {
                if (lowerName.includes(kw)) {
                    log(`SUB-PILLAR-2 detected: "${pageName}"`, 'HIERARCHY');
                    return 'sub-pillar-tipe-2';
                }
            }

            if (isLocation(lowerName)) {
                log(`MONEY-CHILD detected (location): "${pageName}"`, 'HIERARCHY');
                return 'money-child';
            }

            const HAS_PRICE_WORD = /\b(harga|biaya|tarif)\b/i.test(lowerName);
            if (HAS_PRICE_WORD) {
                const cleaned = lowerName.replace(/\b(harga|biaya|tarif)\b/gi, '').trim();
                const words = cleaned.split(/\s+/).filter(Boolean);
                const specific = isSpecificProduct(cleaned);
                if (words.length <= 2 && !specific && !isLocation(cleaned)) {
                    log(`MONEY-MASTER detected (price + short): "${pageName}"`, 'HIERARCHY');
                    return 'money-master';
                }
                log(`MONEY-PAGE detected (price): "${pageName}"`, 'HIERARCHY');
                return 'money-page';
            }

            const HAS_JASA_WORD = JASA_KEYWORDS_PATTERN.test(lowerName);
            if ((isJasaEntity() || isDesainEntity()) && HAS_JASA_WORD) {
                const result = detectJasaLevelAuto(lowerName);
                log(`JASA auto detect: "${pageName}" → ${result}`, 'HIERARCHY');
                return result;
            }

            if (isSewaEntity()) {
                const HAS_SEWA_WORD = /\b(sewa|rental)\b/i.test(lowerName);
                if (HAS_SEWA_WORD) {
                    const cleaned = lowerName.replace(/\b(sewa|rental)\b/gi, '').trim();
                    const words = cleaned.split(/\s+/).filter(Boolean);
                    const specific = isSpecificProduct(cleaned);
                    if (words.length <= 2 && !specific && !isLocation(cleaned)) {
                        log(`MONEY-MASTER detected (sewa + short): "${pageName}"`, 'HIERARCHY');
                        return 'money-master';
                    }
                    log(`MONEY-PAGE detected (sewa): "${pageName}"`, 'HIERARCHY');
                    return 'money-page';
                }
            }

            if (isProdukEntity() || isMaterialEntity()) {
                let words = lowerName.split(/\s+/).filter(w => w.length > 2);
                
                words = words.filter(w => !STOPWORDS.has(w));
                
                const hasLocation = words.some(w => isLocation(w));
                if (hasLocation) {
                    log(`MONEY-CHILD detected (location in product): "${pageName}"`, 'HIERARCHY');
                    return 'money-child';
                }
                words = words.filter(w => !isLocation(w));
                
                const hasCommercialIntent = COMMERCIAL_WORDS.some(w => lowerName.startsWith(w));
                
                if (hasCommercialIntent) {
                    let coreText = lowerName;
                    for (const cw of COMMERCIAL_WORDS) {
                        coreText = coreText.replace(new RegExp(`^${cw}\\s+`), '');
                    }
                    const coreWords = coreText.split(/\s+/).filter(w => w.length > 2);
                    const filteredCore = coreWords.filter(w => 
                        !STOPWORDS.has(w) && !isLocation(w)
                    );
                    
                    log(`COMMERCIAL INTENT: "${pageName}" → core: "${filteredCore.join(' ')}" (${filteredCore.length} words)`, 'COMMERCIAL');
                    
                    if (filteredCore.length <= 2 && !isSpecificProduct(coreText)) {
                        log(`MONEY-MASTER detected (commercial override): "${pageName}"`, 'HIERARCHY');
                        return 'money-master';
                    }
                }
                
                const wordCount = words.length;
                const specific = /\d/.test(lowerName) || isSpecificProduct(lowerName);
                
                log(`PRODUCT DETECTION: "${pageName}" → ${wordCount} words, specific: ${specific}`, 'DEBUG');
                
                if (wordCount <= 2 && !specific) {
                    log(`MONEY-MASTER detected (produk): "${pageName}"`, 'HIERARCHY');
                    return 'money-master';
                }
                
                log(`MONEY-PAGE detected (produk): "${pageName}"`, 'HIERARCHY');
                return 'money-page';
            }

            log(`DEFAULT MONEY-MASTER: "${pageName}"`, 'HIERARCHY');
            return 'money-master';
        }

        // ============================================================
        // 24. AUTO DETECT PARENT - AMBIL POSISI TERAKHIR
        // ============================================================

        function findNearestParentFromItems(items, currentPageName) {
            if (!items || items.length === 0) return null;

            const currentLower = currentPageName.toLowerCase();

            const reversedItems = [...items].reverse();
            
            for (const item of reversedItems) {
                const itemName = item.name?.toLowerCase() || '';
                if (itemName !== currentLower) {
                    log(`✅ PARENT TERDEKAT: "${item.name}" (level ${item.level || 'unknown'}) - diambil dari posisi terakhir`, 'PARENT_FIX');
                    return item;
                }
            }

            const entityPillarNames = ENTITY_PILLAR_NAMES[entityType] || [];
            if (entityPillarNames.length > 0) {
                const pillarName = entityPillarNames[0];
                const pillarItem = items.find(item => 
                    item.name?.toLowerCase() === pillarName
                );
                if (pillarItem) {
                    log(`⚠️ FALLBACK: Entity pillar "${pillarName}" sebagai parent`, 'WARN');
                    return pillarItem;
                }
            }

            log('⚠️ No parent found', 'WARN');
            return null;
        }

        // ============================================================
        // 25. INJECT CURRENT PAGE & PARENT
        // ============================================================

        function injectCurrentPageAndParent(breadcrumbItems, currentPageName, currentFullUrl) {
            let items = [...breadcrumbItems];
            const currentLower = currentPageName.toLowerCase();

            const hasCurrent = items.some(item => 
                item.name?.toLowerCase() === currentLower
            );

            if (!hasCurrent) {
                items.push({
                    name: currentPageName,
                    url: currentFullUrl
                });
            }

            const detectedParent = findNearestParentFromItems(items, currentPageName);

            if (detectedParent) {
                const hasParent = items.some(item => 
                    item.name?.toLowerCase() === detectedParent.name?.toLowerCase()
                );

                if (!hasParent) {
                    log(`✅ AUTO-INJECTED PARENT: "${detectedParent.name}" → "${currentPageName}"`, 'SUCCESS');
                    const currentIndex = items.findIndex(item => 
                        item.name?.toLowerCase() === currentLower
                    );
                    if (currentIndex > -1) {
                        items.splice(currentIndex, 0, detectedParent);
                    } else {
                        items.push(detectedParent);
                    }
                } else {
                    log(`Parent already exists: "${detectedParent.name}"`, 'INFO');
                }
            } else {
                const entityPillarNames = ENTITY_PILLAR_NAMES[entityType] || [];
                if (entityPillarNames.length > 0) {
                    const pillarName = entityPillarNames[0];
                    const pillarExists = items.some(item => 
                        item.name?.toLowerCase() === pillarName
                    );
                    if (!pillarExists) {
                        items.unshift({
                            name: pillarName,
                            url: `${CONFIG.DOMAIN}/p/${slugify(pillarName)}.html`
                        });
                        log(`✅ INJECTED ENTITY PILLAR: "${pillarName}"`, 'SUCCESS');
                    }
                }
            }

            return items;
        }

        // ============================================================
        // 26. FORCE PARENT INJECTION
        // ============================================================

        function forceInjectDirectParent(lineageLevels, allLevels, currentPageTitle, entityType, breadcrumbItems) {
            const currentLower = currentPageTitle.toLowerCase();
            let modifiedLineage = [...lineageLevels];
            const words = currentLower.split(/\s+/);

            const autoParent = findNearestParentFromItems(breadcrumbItems, currentPageTitle);
            if (autoParent && !modifiedLineage.some(l => l.name?.toLowerCase() === autoParent.name?.toLowerCase())) {
                const parentFromAll = allLevels.find(item => 
                    item.name?.toLowerCase() === autoParent.name?.toLowerCase()
                );
                if (parentFromAll) {
                    log(`✅ AUTO PARENT FROM ITEMS: "${parentFromAll.name}" (level ${parentFromAll.level})`, 'SUCCESS');
                    modifiedLineage.push(parentFromAll);
                } else {
                    const newParent = {
                        name: autoParent.name,
                        url: autoParent.url || `${CONFIG.DOMAIN}/p/${slugify(autoParent.name)}.html`,
                        type: detectPageTypeFallback(autoParent.name),
                        level: TYPE_LEVEL_MAP[detectPageTypeFallback(autoParent.name)] || 99,
                        position: modifiedLineage.length + 1
                    };
                    log(`✅ AUTO PARENT (new): "${newParent.name}" (level ${newParent.level})`, 'SUCCESS');
                    modifiedLineage.push(newParent);
                }
            }

            if (modifiedLineage.length === lineageLevels.length && words.length >= 2) {
                for (let i = words.length - 1; i >= 1; i--) {
                    const potentialParent = words.slice(0, i).join(' ');
                    const parentItem = allLevels.find(item => 
                        item.name?.toLowerCase() === potentialParent
                    );
                    if (parentItem && !modifiedLineage.some(l => l.name?.toLowerCase() === parentItem.name?.toLowerCase())) {
                        log(`✅ PATTERN PARENT: "${parentItem.name}" (level ${parentItem.level})`, 'SUCCESS');
                        modifiedLineage.push(parentItem);
                        break;
                    }
                }
            }

            if (modifiedLineage.length === lineageLevels.length) {
                const semanticKeywords = {
                    'pagar': ['pagar', 'pagar panel', 'pagar beton', 'panel beton'],
                    'pondasi': ['pondasi', 'tiang', 'pile', 'bored pile', 'strauss pile'],
                    'cor': ['cor', 'readymix', 'ready mix', 'beton cor'],
                    'bangunan': ['bangunan', 'gedung', 'rumah', 'ruko', 'kantor'],
                    'interior': ['interior', 'dalam', 'ruangan', 'finishing'],
                    'eksterior': ['eksterior', 'luar', 'fasad', 'taman']
                };
                
                for (const [parentKeyword, childKeywords] of Object.entries(semanticKeywords)) {
                    const isChildMatch = childKeywords.some(kw => currentLower.includes(kw));
                    if (isChildMatch) {
                        const parentItem = allLevels.find(item => 
                            item.name?.toLowerCase().includes(parentKeyword)
                        );
                        if (parentItem && !modifiedLineage.some(l => l.name?.toLowerCase() === parentItem.name?.toLowerCase())) {
                            log(`✅ SEMANTIC PARENT: "${parentItem.name}" (level ${parentItem.level})`, 'SUCCESS');
                            modifiedLineage.push(parentItem);
                            break;
                        }
                    }
                }
            }

            if (modifiedLineage.length === 0 || modifiedLineage.every(l => l.name?.toLowerCase() === currentLower)) {
                const entityPillarNames = ENTITY_PILLAR_NAMES[entityType] || [];
                if (entityPillarNames.length > 0) {
                    const pillarName = entityPillarNames[0];
                    const pillarItem = allLevels.find(item => 
                        item.name?.toLowerCase() === pillarName
                    );
                    if (pillarItem && !modifiedLineage.some(l => l.name?.toLowerCase() === pillarName)) {
                        log(`✅ ENTITY PILLAR (fallback): "${pillarName}" (level ${pillarItem.level})`, 'WARN');
                        modifiedLineage.push(pillarItem);
                    }
                }
            }
            
            return modifiedLineage;
        }

        // ============================================================
        // 27. HIERARCHY VALIDATOR
        // ============================================================
        
        function validateAndFixHierarchy(lineage) {
            if (lineage.length <= 1) return lineage;
            
            const fixed = [];
            const sorted = [...lineage].sort((a, b) => {
                const levelA = a.level || TYPE_LEVEL_MAP[detectPageTypeFallback(a.name)] || 99;
                const levelB = b.level || TYPE_LEVEL_MAP[detectPageTypeFallback(b.name)] || 99;
                return levelA - levelB;
            });
            
            const uniqueNames = new Set();
            for (const item of sorted) {
                const key = item.name?.toLowerCase() || '';
                if (!uniqueNames.has(key)) {
                    uniqueNames.add(key);
                    if (!item.level) {
                        item.level = TYPE_LEVEL_MAP[detectPageTypeFallback(item.name)] || 99;
                    }
                    fixed.push(item);
                }
            }
            
            for (let i = 1; i < fixed.length; i++) {
                const prevLevel = fixed[i-1].level || TYPE_LEVEL_MAP[detectPageTypeFallback(fixed[i-1].name)] || 99;
                const currLevel = fixed[i].level || TYPE_LEVEL_MAP[detectPageTypeFallback(fixed[i].name)] || 99;
                
                if (currLevel - prevLevel > 2) {
                    log(`⚠️ Hierarchy gap detected: ${fixed[i-1].name}(${prevLevel}) → ${fixed[i].name}(${currLevel}) - KEEPING`, 'WARN');
                }
            }
            
            return fixed;
        }

        // ============================================================
        // 28. SIMILARITY CALCULATION
        // ============================================================

        function calculateSimilarity(text1, text2) {
            const words1 = text1.toLowerCase().split(/\s+/);
            const words2 = text2.toLowerCase().split(/\s+/);
            
            if (words1.length === 0 || words2.length === 0) return 0;
            
            const commonWords = words1.filter(w => words2.includes(w));
            const union = new Set([...words1, ...words2]);
            const similarity = commonWords.length / union.size;
            
            return similarity;
        }

        // ============================================================
        // 29. GET CURRENT PAGE INFO
        // ============================================================

        const currentFullUrl = currentUrl.startsWith('http')
            ? currentUrl
            : CONFIG.DOMAIN + currentUrl;

        let currentPageTitle = getCleanPageNameFromUrl(currentFullUrl);

        if (!currentPageTitle) {
            currentPageTitle = 'Halaman';
        }

        // ============================================================
        // 30. GET PAGE LEVEL & ENTITY FROM PLD
        // ============================================================

        const pldLevel = getPageLevelFromPLD();
        const pldEntity = getEntityTypeFromPLD();
        
        let finalPageLevel = pldLevel;
        let finalEntityType = entityType;
        
        if (pldEntity && VALID_ENTITY_TYPES.includes(pldEntity)) {
            finalEntityType = pldEntity;
            log(`Entity from PLD: ${pldEntity} (override from ${entityType})`, 'PLD');
        }
        
        entityType = finalEntityType;
        
        const isPLDSynced = !!pldLevel;
        const syncStatusText = isPLDSynced ? '✅ SINKRON' : '❌ FALLBACK';
        log(`PLD Sync Status: ${syncStatusText}`, 'PLD');
        if (pldLevel) {
            log(`PLD Level: "${pldLevel}" (${TYPE_LEVEL_MAP[pldLevel]})`, 'PLD');
        }

        // ============================================================
        // 31. INJECT CURRENT PAGE & AUTO PARENT
        // ============================================================

        const enhancedBreadcrumbItems = injectCurrentPageAndParent(
            breadcrumbItems,
            currentPageTitle,
            currentFullUrl
        );

        // ============================================================
        // 32. BUILD ALL LEVELS
        // ============================================================

        const allLevels = [];

        for (let i = 0; i < enhancedBreadcrumbItems.length; i++) {
            const item = enhancedBreadcrumbItems[i];
            let name, url;

            if (typeof item === 'object') {
                name = item.name;
                url = item.url || null;
            } else {
                name = item;
                url = null;
            }

            const type = detectPageTypeFallback(name);
            allLevels.push({
                name,
                url,
                type,
                level: TYPE_LEVEL_MAP[type] || 99,
                position: i + 1
            });
        }

        // ============================================================
        // 33. URL FALLBACK
        // ============================================================

        for (const level of allLevels) {
            if (!level.url) {
                let foundUrl = null;
                if (mappingObj) {
                    for (const [url, title] of Object.entries(mappingObj)) {
                        if (title === level.name) {
                            foundUrl = url.startsWith('http') ? url : CONFIG.DOMAIN + url;
                            break;
                        }
                    }
                }
                if (!foundUrl) {
                    foundUrl = `${CONFIG.DOMAIN}/p/${slugify(level.name)}.html`;
                }
                level.url = foundUrl;
            } else if (!level.url.startsWith('http')) {
                level.url = CONFIG.DOMAIN + level.url;
            }
        }

        // ============================================================
        // 34. CURRENT PAGE TYPE
        // ============================================================

        const currentPageType = pldLevel || detectPageTypeFallback(currentPageTitle);
        log(`Current page: "${currentPageTitle}" → type: ${currentPageType} (level ${TYPE_LEVEL_MAP[currentPageType]})`, 'INFO');

        // ============================================================
        // 35. SELECT BREADCRUMB LEVELS
        // ============================================================

        const selectedLevels = [];

        selectedLevels.push({
            name: 'Beranda',
            url: CONFIG.DOMAIN,
            type: 'home',
            level: 0,
            position: 1
        });

        const uniqueByUrl = new Map();
        for (const item of allLevels) {
            const key = item.url || item.name;
            if (!uniqueByUrl.has(key)) {
                uniqueByUrl.set(key, item);
            }
        }
        const uniqueItems = Array.from(uniqueByUrl.values());

        log('=== ALL LEVELS DEBUG ===', 'DEBUG');
        for (const level of allLevels) {
            log(`  ${level.name} → type: ${level.type}, level: ${level.level}`, 'DEBUG');
        }

        log('Unique items (' + uniqueItems.length + '): ' + uniqueItems.map(i => i.name + '(' + i.level + ')').join(' → '), 'INFO');

        // ============================================================
        // 36. FIND NEAREST PARENTS - AMBIL POSISI TERAKHIR
        // ============================================================

        function findNearestParentsByHierarchy() {
            const lineage = [];
            const currentPageTitleLower = currentPageTitle.toLowerCase();
            
            const candidates = uniqueItems.filter(item => 
                item.name.toLowerCase() !== currentPageTitleLower
            );
            
            if (candidates.length === 0) {
                log('⚠️ No candidates found', 'WARN');
                return lineage;
            }
            
            const sortedCandidates = [...candidates].sort((a, b) => {
                const posA = a.position || 0;
                const posB = b.position || 0;
                return posB - posA;
            });
            
            log(`📋 Candidates (sorted by position descending): ` + sortedCandidates.map(i => i.position + ':' + i.name).join(' → '), 'DEBUG');
            
            const highestPosition = sortedCandidates.length > 0 ? sortedCandidates[0].position : -1;
            const topCandidates = sortedCandidates.filter(item => item.position === highestPosition);
            
            log(`🎯 Top candidates (position ${highestPosition}): ` + topCandidates.map(i => i.name).join(', '), 'SUCCESS');
            
            for (const item of topCandidates) {
                const exists = lineage.some(l => l.name === item.name);
                if (!exists) {
                    lineage.push(item);
                    log(`🎯 Selected parent: "${item.name}" (position ${item.position}, level ${item.level})`, 'SUCCESS');
                }
            }
            
            if (lineage.length === 0 && sortedCandidates.length > 0) {
                const best = sortedCandidates[0];
                lineage.push(best);
                log(`⚠️ FALLBACK: Using "${best.name}" as nearest parent`, 'WARN');
            }
            
            log('Lineage (prioritized): ' + lineage.map(i => i.position + ':' + i.name).join(' → '), 'SUCCESS');
            
            return lineage;
        }

        let lineageLevels = findNearestParentsByHierarchy();

        log('Initial lineage (' + lineageLevels.length + '): ' + lineageLevels.map(i => i.name + '(' + i.type + ')').join(' → '), 'INFO');

        lineageLevels = forceInjectDirectParent(
            lineageLevels, 
            uniqueItems,
            currentPageTitle, 
            entityType,
            enhancedBreadcrumbItems
        );

        log('After force injection (' + lineageLevels.length + '): ' + lineageLevels.map(i => i.name + '(' + i.type + ')').join(' → '), 'INFO');

        const cleanLineage = [];
        const usedLineage = new Set();

        for (const item of lineageLevels) {
            const key = item.name.toLowerCase();
            if (usedLineage.has(key)) continue;
            usedLineage.add(key);
            cleanLineage.push(item);
        }

        const validatedLineage = validateAndFixHierarchy(cleanLineage);

        validatedLineage.sort((a, b) => {
            const idxA = HIERARCHY_ORDER.indexOf(a.type);
            const idxB = HIERARCHY_ORDER.indexOf(b.type);
            if (idxA !== idxB) return idxA - idxB;
            return a.position - b.position;
        });

        // ========================================================
        // 37. AMBIL SEMUA PARENT DENGAN POSISI TERTINGGI
        // ========================================================
        
        let finalParents = [];

        const parentOnly = validatedLineage.filter(item => 
            item.name.toLowerCase() !== currentPageTitle.toLowerCase()
        );

        log(`Parent candidates (${parentOnly.length}): ` + parentOnly.map(i => i.name + '(' + i.level + ')').join(', '), 'DEBUG');

        if (parentOnly.length > 0) {
            const highestPosition = Math.max(...parentOnly.map(i => i.position || 0));
            finalParents = parentOnly.filter(item => item.position === highestPosition);
            finalParents.sort((a, b) => a.position - b.position);
            
            log(`✅ PARENT FOUND: ${finalParents.length} parent(s) at position ${highestPosition}: ` + finalParents.map(i => i.name).join(', '), 'SUCCESS');
        } else {
            log('⚠️ No parent found (only current page)', 'WARN');
        }

        if (finalParents.length === 0) {
            const entityPillarNames = ENTITY_PILLAR_NAMES[entityType] || [];
            if (entityPillarNames.length > 0) {
                const pillarName = entityPillarNames[0];
                const pillarItem = uniqueItems.find(item => 
                    item.name.toLowerCase() === pillarName
                );
                if (pillarItem) {
                    finalParents.push(pillarItem);
                    log(`✅ ENTITY PILLAR as parent: "${pillarName}"`, 'SUCCESS');
                }
            }
        }

        for (const item of finalParents) {
            const exists = selectedLevels.some(l => l.name.toLowerCase() === item.name.toLowerCase());
            if (!exists) {
                selectedLevels.push(item);
                log(`👪 Adding parent: "${item.name}" (level ${item.level}, position ${item.position})`, 'PARENT');
            }
        }

        const hasCurrentAlready = selectedLevels.some(item =>
            item.name.toLowerCase() === currentPageTitle.toLowerCase()
        );

        if (!hasCurrentAlready) {
            selectedLevels.push({
                name: currentPageTitle,
                url: currentFullUrl,
                type: currentPageType,
                level: pldLevel ? TYPE_LEVEL_MAP[pldLevel] : (TYPE_LEVEL_MAP[currentPageType] || 99),
                isCurrent: true,
                pldLevel: pldLevel
            });
        }

        // ============================================================
        // 38. FINAL UNIQUE LEVELS
        // ============================================================

        const uniqueLevels = [];
        const usedNames = new Set();

        for (const item of selectedLevels) {
            const key = item.name.toLowerCase();
            if (usedNames.has(key)) continue;
            usedNames.add(key);
            uniqueLevels.push(item);
        }

        uniqueLevels.forEach((item, index) => {
            item.position = index + 1;
        });

        log('Final breadcrumb (' + uniqueLevels.length + ' levels): ' + uniqueLevels.map(i => i.name + '(' + i.level + ')').join(' › '), 'SUCCESS');

        // ============================================================
        // 39. GENERATE HTML
        // ============================================================

        let breadcrumbHtml = `<div class="breadcrumbs" itemscope itemtype="https://schema.org/BreadcrumbList">\n`;

        for (let i = 0; i < uniqueLevels.length; i++) {
            const item = uniqueLevels[i];
            const isLast = i === uniqueLevels.length - 1;

            if (!isLast) {
                breadcrumbHtml +=
                    `<span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
<a href="${item.url}" itemprop="item" title="${item.name}">
<span itemprop="name">${item.name}</span>
</a>
<meta itemprop="position" content="${item.position}" />
</span>
<span class="separator"> › </span>\n`;
            } else {
                breadcrumbHtml +=
                    `<span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
<span itemprop="name">${item.name}</span>
<meta itemprop="position" content="${item.position}" />
</span>\n`;
            }
        }

        breadcrumbHtml += `</div>\n`;

        // ============================================================
        // 40. JSON LD
        // ============================================================

        const jsonLd = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": uniqueLevels.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": item.name,
                "item": item.url
            }))
        };

        // ============================================================
        // 41. REMOVE OLD
        // ============================================================

        document.querySelectorAll('.breadcrumbs, .breadcrumb-nav, [aria-label="Breadcrumb"]')
            .forEach(el => el.remove());
        document.querySelectorAll('script[data-breadcrumb="true"]')
            .forEach(el => el.remove());

        // ============================================================
        // 42. TARGET ELEMENT
        // ============================================================

        const targetElement = document.querySelector('main, article, .content, #main-content, .post-content');

        if (targetElement) {
            targetElement.insertAdjacentHTML('afterbegin', breadcrumbHtml);
        } else {
            document.body.insertAdjacentHTML('afterbegin', breadcrumbHtml);
        }

        // ============================================================
        // 43. INJECT JSON LD
        // ============================================================

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-breadcrumb', 'true');
        script.textContent = JSON.stringify(jsonLd, null, 2);
        document.head.appendChild(script);

        // ============================================================
        // 44. SET FLAG + DISPATCH EVENT (v12.3.3)
        // ============================================================

        const nearestParent = finalParents.length > 0 ? finalParents[finalParents.length - 1] : null;

        document.body.setAttribute('data-breadcrumb-ready', 'true');
        document.body.setAttribute('data-breadcrumb-parent', nearestParent?.name || '');
        document.body.setAttribute('data-breadcrumb-parent-url', nearestParent?.url || '');

        log(`🚩 FLAG SET: data-breadcrumb-ready="true"`, 'FLAG');
        log(`   📍 parent="${nearestParent?.name || '(none)'}"`, 'FLAG');
        log(`   📍 parent-url="${nearestParent?.url || '(none)'}"`, 'FLAG');

        window.dispatchEvent(new CustomEvent('breadcrumbGenerated', {
            detail: {
                parentName: nearestParent?.name || null,
                parentUrl: nearestParent?.url || null,
                selectedLevels: uniqueLevels,
                currentPageType: currentPageType,
                entityType: entityType,
                version: '12.3.3'
            }
        }));

        log(`📡 EVENT DISPATCHED: "breadcrumbGenerated"`, 'EVENT');
        log(`   👪 parentName="${nearestParent?.name || '(none)'}"`, 'EVENT');

        // ============================================================
        // 45. LOG SUMMARY
        // ============================================================

        const syncStatus = isPLDSynced ? '✅ SINKRON' : '❌ FALLBACK';
        const commercialDetected = COMMERCIAL_WORDS.some(w => currentPageTitle.startsWith(w));

        console.log('📊 BREADCRUMB GENERATION SUMMARY (v12.3.3):');
        console.log(`   Page: "${currentPageTitle}"`);
        console.log(`   URL: "${currentFullUrl}"`);
        console.log(`   Type: ${currentPageType} (level ${TYPE_LEVEL_MAP[currentPageType]})`);
        console.log(`   Entity: ${entityType}`);
        console.log(`   🔄 PLD Sync: ${syncStatus}`);
        if (pldLevel) {
            console.log(`   📌 PLD Level: ${pldLevel} (${TYPE_LEVEL_MAP[pldLevel]})`);
        }
        if (currentPageType === 'variant') {
            console.log(`   🔬 Variant detected for entity: ${entityType}`);
        }
        if (currentPageType === 'money-child') {
            console.log(`   📍 Money Child with location detected`);
        }
        if (commercialDetected) {
            console.log(`   🛒 Commercial Intent detected`);
        }
        console.log(`   🔧 FIX v12.3.2: Parent WAJIB ambil posisi terakhir`);
        console.log(`   🚩 FIX v12.3.3: Flag + Event untuk schema-article.js`);
        console.log(`   👪 Parents found: ${finalParents.length} parents`);
        console.log(`   📊 Total breadcrumb levels: ${uniqueLevels.length}`);
        console.log(`   🏛️ Hierarchy: ${uniqueLevels.map(i => i.type).join(' → ')}`);

        // ============================================================
        // 46. RETURN
        // ============================================================

        return {
            html: breadcrumbHtml,
            jsonLd,
            selectedLevels: uniqueLevels,
            currentPageType,
            entityType,
            version: '12.3.3',
            parentCount: finalParents.length,
            parents: finalParents,
            isVariant: currentPageType === 'variant',
            isMoneyChild: currentPageType === 'money-child',
            pldSync: isPLDSynced,
            pldLevel: pldLevel,
            pldEntity: pldEntity,
            hierarchy: uniqueLevels.map(i => i.type),
            commercialIntent: commercialDetected,
            parentNoSkip: true,
            parentByPosition: true,
            flagSet: true,
            eventDispatched: true,
            nearestParent: nearestParent
        };
    }
    
    // ============================================================
    // ✅ EXPOSE KE WINDOW — BIAR BISA DIPAKAI FILE LAIN
    // ============================================================
    window.generateBreadcrumbShared = generateBreadcrumbShared;
    
    console.log('✅ [Breadcrumb Shared v12.3.3] Function siap dipakai oleh file JS external lain');
    
})();
