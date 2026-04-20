/* ============================================================
 🧠 Page Level Detector v13.0 — KHUSUS UNTUK betonjayareadymix.com
    Hardcoded Pillar mapping untuk akurasi 100%
    Support: Jasa Konstruksi, Jasa Desain Interior, 
             Produk Konstruksi, Produk Interior, Material Konstruksi
============================================================ */

(function() {
  if (window.pageLevelDetector) return;
  
  // ============================================================
  // 📌 KHUSUS: PILLAR MAPPING UNTUK betonjayareadymix.com
  // ============================================================
  const CUSTOM_PILLAR_MAPPING = {
    // Domain spesifik
    'betonjayareadymix.com': {
      // Pillar utama website
      'pillar': [
        '/jasa-konstruksi/', '/jasa/konstruksi/',
        '/jasa-desain-interior/', '/jasa/desain-interior/',
        '/produk-konstruksi/', '/produk/konstruksi/',
        '/produk-interior/', '/produk/interior/',
        '/material-konstruksi/', '/material/konstruksi/'
      ],
      // Entity type mapping untuk pillar
      'entity-type': {
        '/jasa-konstruksi/': 'jasa',
        '/jasa/konstruksi/': 'jasa',
        '/jasa-desain-interior/': 'jasa',
        '/jasa/desain-interior/': 'jasa',
        '/produk-konstruksi/': 'produk',
        '/produk/konstruksi/': 'produk',
        '/produk-interior/': 'produk',
        '/produk/interior/': 'produk',
        '/material-konstruksi/': 'material',
        '/material/konstruksi/': 'material'
      }
    }
  };
  
  // ============================================================
  // 📌 POLA URL UNTUK MASING-MASING PAGE LEVEL
  // ============================================================
  const URL_PATTERNS = {
    'pillar': [
      '/panduan/', '/guide/', '/edukasi/', '/apa-itu/', '/cara-memilih/',
      '/tips-', '/tutorial/', '/belajar/', '/materi/', '/pembahasan/'
    ],
    'sub-pillar-tipe-2': [
      '/jenis/', '/macam/', '/tipe/', '/kategori/', '/varian/',
      '/daftar-', '/list-', '/koleksi/', '/jasa/', '/layanan/',
      '/alat-', '/produk-', '/item-'
    ],
    'sub-pillar-tipe-1': [
      '/perbandingan/', '/vs/', '/bandingkan/', '/mana-yang-lebih-baik/',
      '/perbedaan/', '/beda/', '/pilih-', '/rekomendasi-'
    ],
    'money-master': [
      '/harga/', '/price/', '/biaya/', '/tarif/', '/estimasi-harga/'
    ],
    'money-page': [
      '/harga-', '/beli-', '/jual-', '/pesan-', '/order-', '/produk/'
    ],
    'money-child': [
      '/di-', '/lokasi/', '/per-', '/ukuran-', '/-kota/', '/-jakarta/', '/-surabaya/'
    ],
    'variant': [
      '/spesifikasi/', '/detail-', '/ukuran-', '/tipe-', '/merk-', '/warna-'
    ],
    'sub-variant': [
      '/spesifikasi-lengkap/', '/detail-teknis/', '/ukuran-panjang/'
    ]
  };
  
  // ============================================================
  // 📌 FUNGSI CEK APAKAH URL ADALAH PILLAR (CUSTOM MAPPING)
  // ============================================================
  function isCustomPillar(url, domain) {
    const customConfig = CUSTOM_PILLAR_MAPPING[domain];
    if (!customConfig) return null;
    
    for (const pillarUrl of customConfig.pillar) {
      if (url.includes(pillarUrl)) {
        return {
          isPillar: true,
          entityType: customConfig['entity-type'][pillarUrl] || 'jasa'
        };
      }
    }
    return null;
  }
  
  // ============================================================
  // 📌 FUNGSI DETEKSI DARI URL (DENGAN CUSTOM MAPPING)
  // ============================================================
  function detectFromURL(url) {
    const domain = window.location.hostname;
    const urlLower = url.toLowerCase();
    
    // 🔥 PRIORITAS 1: Cek custom pillar mapping untuk domain ini
    const customCheck = isCustomPillar(urlLower, domain);
    if (customCheck && customCheck.isPillar) {
      console.log(`📌 Custom mapping: ${urlLower} → PILLAR (${customCheck.entityType})`);
      // Set entity type ke body attribute
      document.body.setAttribute('data-entity-type', customCheck.entityType);
      return 'pillar';
    }
    
    // PRIORITAS 2: Deteksi normal dari URL patterns
    for (const [level, patterns] of Object.entries(URL_PATTERNS)) {
      for (const pattern of patterns) {
        if (urlLower.includes(pattern)) {
          // Deteksi money-child vs money-master vs money-page
          if (level === 'money-master') {
            if (urlLower.includes('/di-') || urlLower.includes('/lokasi/') || 
                urlLower.includes('-kota') || urlLower.includes('-jakarta')) {
              return 'money-child';
            }
            return 'money-master';
          }
          if (level === 'money-page') {
            if (urlLower.includes('/di-') || urlLower.includes('/lokasi/') || 
                urlLower.includes('-kota') || urlLower.includes('-jakarta')) {
              return 'money-child';
            }
            return 'money-page';
          }
          return level;
        }
      }
    }
    return null;
  }
  
  // ============================================================
  // 📌 FUNGSI DETEKSI ENTITY TYPE (DENGAN CUSTOM MAPPING)
  // ============================================================
  function detectEntityType() {
    const domain = window.location.hostname;
    const url = window.location.pathname.toLowerCase();
    const body = (document.body?.innerText || "").slice(0, 500).toLowerCase();
    const h1 = (document.querySelector("h1")?.innerText || "").toLowerCase();
    
    // 🔥 PRIORITAS 1: Cek custom mapping untuk domain ini
    const customConfig = CUSTOM_PILLAR_MAPPING[domain];
    if (customConfig) {
      for (const [pillarUrl, entityType] of Object.entries(customConfig['entity-type'])) {
        if (url.includes(pillarUrl)) {
          console.log(`📌 Custom entity type mapping: ${url} → ${entityType}`);
          return entityType;
        }
      }
    }
    
    // PRIORITAS 2: Manual override dari attribute
    const bodyData = document.body.getAttribute('data-entity-type');
    if (bodyData && ['produk', 'jasa', 'material', 'sewa'].includes(bodyData)) return bodyData;
    
    // PRIORITAS 3: Deteksi dari URL
    if (url.includes('/jasa/') || url.includes('/layanan/')) return 'jasa';
    if (url.includes('/sewa/') || url.includes('/rental/')) return 'sewa';
    if (url.includes('/material/') || url.includes('/bahan/')) return 'material';
    if (url.includes('/produk/') || url.includes('/barang/')) return 'produk';
    
    // PRIORITAS 4: Deteksi dari H1
    if (h1.includes('jasa') || h1.includes('kontraktor') || h1.includes('layanan')) return 'jasa';
    if (h1.includes('sewa') || h1.includes('rental')) return 'sewa';
    if (h1.includes('material') || h1.includes('bahan bangunan')) return 'material';
    
    // PRIORITAS 5: Deteksi dari Body
    if (body.includes('jasa konstruksi') || body.includes('jasa pasang')) return 'jasa';
    if (body.includes('material bangunan') || body.includes('bahan material')) return 'material';
    
    return 'produk'; // default
  }
  
  // ============================================================
  // 📌 FUNGSI DETEKSI UTAMA
  // ============================================================
  function detectPageLevel() {
    console.log("🔍 Page Level Detector v13.0 — Khusus betonjayareadymix.com");
    
    // PRIORITAS 1: Manual override dari parameter
    if (window.__manualPageLevel) {
      console.log(`📌 Manual override: ${window.__manualPageLevel}`);
      return window.__manualPageLevel;
    }
    
    // PRIORITAS 2: Deteksi dari URL (dengan custom mapping)
    const urlLevel = detectFromURL(window.location.pathname);
    if (urlLevel) {
      console.log(`📌 Detected from URL: ${urlLevel}`);
      return urlLevel;
    }
    
    // PRIORITAS 3: Deteksi dari element (class, meta, attribute)
    const elementLevel = detectFromElement();
    if (elementLevel) {
      console.log(`📌 Detected from element: ${elementLevel}`);
      return elementLevel;
    }
    
    // PRIORITAS 4: Fallback dari konten
    const contentLevel = detectFromContent();
    console.log(`📌 Fallback from content: ${contentLevel}`);
    return contentLevel;
  }
  
  // ============================================================
  // 📌 FUNGSI DETEKSI DARI ELEMEN
  // ============================================================
  function detectFromElement() {
    const body = document.body;
    const dataLevel = body.getAttribute('data-page-level');
    if (dataLevel && VALID_LEVELS.includes(dataLevel)) return dataLevel;
    
    for (const className of body.classList) {
      if (VALID_LEVELS.includes(className)) return className;
    }
    
    const metaLevel = document.querySelector('meta[name="page-level"]');
    if (metaLevel && VALID_LEVELS.includes(metaLevel.getAttribute('content'))) {
      return metaLevel.getAttribute('content');
    }
    
    return null;
  }
  
  // ============================================================
  // 📌 FUNGSI FALLBACK DETEKSI DARI KONTEN
  // ============================================================
  function detectFromContent() {
    const h1 = (document.querySelector("h1")?.innerText || "").toLowerCase();
    const body = (document.body?.innerText || "").slice(0, 1500).toLowerCase();
    
    if (h1.includes('panduan') || h1.includes('cara') || h1.includes('tips')) return 'pillar';
    if (h1.includes('jenis') || h1.includes('macam')) return 'sub-pillar-tipe-2';
    if (h1.includes('vs') || h1.includes('perbandingan')) return 'sub-pillar-tipe-1';
    if (h1.includes('harga') || body.includes('estimasi harga')) return 'money-master';
    if (h1.includes('spesifikasi') || h1.includes('detail')) return 'variant';
    
    return 'pillar';
  }
  
  // ============================================================
  // 📌 VALID LEVELS
  // ============================================================
  const VALID_LEVELS = [
    'pillar', 'sub-pillar-tipe-2', 'sub-pillar-tipe-1',
    'money-master', 'money-page', 'money-child',
    'variant', 'sub-variant'
  ];
  
  // ============================================================
  // 📌 FUNGSI SET MANUAL PAGE LEVEL
  // ============================================================
  function setManualPageLevel(level) {
    if (VALID_LEVELS.includes(level)) {
      window.__manualPageLevel = level;
      console.log(`✅ Manual page level set to: ${level}`);
      document.body.setAttribute('data-page-level', level);
      return true;
    }
    console.error(`❌ Invalid page level: ${level}`);
    return false;
  }
  
  // ============================================================
  // 📌 EXPOSE FUNGSI
  // ============================================================
  window.pageLevelDetector = {
    detect: detectPageLevel,
    setManual: setManualPageLevel,
    detectEntityType: detectEntityType,
    isValid: (level) => VALID_LEVELS.includes(level),
    getCustomPillars: () => CUSTOM_PILLAR_MAPPING[window.location.hostname] || null
  };
  
  window.__pageLevelDetectorReady = true;
  window.dispatchEvent(new Event("pageLevelDetectorReady"));
  
  console.log("✅ Page Level Detector v13.0 ready for betonjayareadymix.com");
  console.log("📋 Custom Pillars:", CUSTOM_PILLAR_MAPPING[window.location.hostname]?.pillar || []);
  
})();
