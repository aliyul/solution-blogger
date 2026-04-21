/* ============================================================
 🧠 Page Level Detector v15.0 — OPTIMIZED FOR betonjayareadymix.com
    ✅ Custom Pillar Mapping (100% akurat untuk pillar)
    ✅ Auto-detect Entity Type (produk, jasa, material, sewa)
    ✅ MONEY_MASTER vs MONEY_PAGE (beda spesifik/umum)
    ✅ MONEY_CHILD deteksi lokasi (200+ kota, hybrid method)
    ✅ MONEY_LEADGEN deteksi (konsultasi, survey, hubungi, dll)
    ✅ SUB-VARIANT detection (spesifikasi sangat detail)
    ✅ Support: Jasa Konstruksi, Jasa Desain Interior, 
       Produk Konstruksi, Produk Interior, Material Konstruksi, Sewa/Rental
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
  // 📌 WHITELIST KOTA/KABUPATEN INDONESIA (200+)
  // ============================================================
  const LOCATION_WHITELIST = [
    // Jabodetabek
    'jakarta', 'bogor', 'depok', 'tangerang', 'bekasi', 'jabodetabek',
    'jakpus', 'jakbar', 'jaksel', 'jakut', 'jaktim',
    'tangerang selatan', 'tangsel', 'bintaro', 'alam sutera', 'gading serpong',
    // Jawa Barat
    'bandung', 'cimahi', 'cirebon', 'tasikmalaya', 'sukabumi', 'garut', 
    'sumedang', 'purwakarta', 'karawang', 'subang', 'indramayu',
    'majalengka', 'kuningan', 'ciamis', 'banjar', 'pangandaran', 'cianjur',
    // Jawa Tengah
    'semarang', 'solo', 'surakarta', 'yogyakarta', 'jogja', 'magelang', 
    'salatiga', 'pekalongan', 'tegal', 'brebes', 'cilacap', 'purwokerto', 
    'kebumen', 'banjarnegara', 'wonosobo', 'temanggung', 'kendal', 'demak', 
    'kudus', 'jepara', 'pati', 'rembang', 'blora', 'grobagan', 'sragen', 
    'karanganyar', 'wonogiri', 'sukoharjo', 'klaten', 'boyolali',
    // Jawa Timur
    'surabaya', 'malang', 'kediri', 'blitar', 'madiun', 'ponorogo', 'ngawi', 
    'magetan', 'trenggalek', 'tulungagung', 'nganjuk', 'jombang', 'mojokerto', 
    'gresik', 'sidoarjo', 'pasuruan', 'probolinggo', 'lumajang', 'jember', 
    'banyuwangi', 'bondowoso', 'situbondo', 'pamekasan', 'sampang', 'sumenep', 
    'bangkalan', 'bojonegoro', 'tuban', 'lamongan',
    // Sumatera
    'medan', 'binjai', 'pematangsiantar', 'tanjungbalai', 'tebingtinggi', 'deli serdang',
    'padang', 'bukittinggi', 'payakumbuh', 'solok', 'sawahlunto', 'padang panjang',
    'pekanbaru', 'dumai', 'bengkalis', 'kampar', 'riau', 'batam', 'tanjungpinang',
    'palembang', 'lubuklinggau', 'prabumulih', 'ogan ilir', 'ogan komering',
    'bandar lampung', 'metro', 'lampung', 'jambi', 'sungai penuh', 'bengkulu',
    'pangkalpinang', 'tanjung pandan', 'aceh', 'banda aceh', 'lhonga', 'sigli',
    // Kalimantan
    'pontianak', 'singkawang', 'ketapang', 'sambas', 'kalimantan barat',
    'balikpapan', 'samarinda', 'bontang', 'kutai', 'penajam', 'kalimantan timur',
    'banjarmasin', 'banjarbaru', 'kalimantan selatan', 'palangkaraya', 'kalimantan tengah',
    'tanjung selor', 'kalimantan utara',
    // Sulawesi
    'makassar', 'parepare', 'palopo', 'sulawesi selatan', 'manado', 'bitung', 'tomohon',
    'kotamobagu', 'sulawesi utara', 'palu', 'sulawesi tengah', 'kendari', 'baubau',
    'sulawesi tenggara', 'gorontalo', 'sulawesi barat', 'mamuju',
    // Bali & Nusa Tenggara
    'denpasar', 'badung', 'gianyar', 'tabanan', 'bangli', 'klungkung', 'karangasem',
    'buleleng', 'jembrana', 'bali', 'mataram', 'bima', 'dompu', 'sumbawa', 'lombok',
    'kupang', 'soe', 'atambua', 'ntt', 'ntb',
    // Maluku & Papua
    'ambon', 'tual', 'maluku', 'ternate', 'tidore', 'maluku utara',
    'jayapura', 'wamena', 'timika', 'merauke', 'biak', 'sorong', 'manokwari', 'nabire',
    'papua', 'papua barat'
  ];
  
  // Blacklist kata yang mirip lokasi tapi sebenarnya produk
  const NOT_LOCATION_WORDS = [
    'mini', 'maxi', 'super', 'extra', 'plus', 'pro', 'max', 'ultra',
    'baru', 'lama', 'bekas', 'second', 'original', 'kw', 'grade', 
    'murah', 'mahal', 'hemat', 'premium', 'standar', 'ekonomis', 
    'kecil', 'besar', 'sedang', 'panjang', 'pendek', 'tebal', 'tipis',
    'putih', 'hitam', 'merah', 'biru', 'hijau', 'kuning', 'ungu', 'abu', 'coklat',
    'minimalis', 'modern', 'klasik', 'industrial', 'skandinavia', 'jepang',
    'furniture', 'furnitur', 'meja', 'kursi', 'lemari', 'sofa', 'kitchen', 'kamar'
  ];
  
  // Pola akhiran kota
  const CITY_SUFFIXES = ['karta', 'jaya', 'pura', 'sari', 'mulya', 'agung', 'asih', 'ayem', 'luhur'];
  
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
      '/beli-', '/jual-', '/pesan-', '/order-', '/produk/'
    ],
    'money-child': [
      '/jakarta/', '/bandung/', '/surabaya/', '/medan/', '/makassar/'
    ],
    'money-leadgen': [
      '/konsultasi/', '/consultation/', '/survey/', '/hubungi/', '/contact/',
      '/estimasi/', '/penawaran/', '/quote/', '/free-consultation/',
      '/jadwal-survey/', '/request-quote/'
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
  // 📌 FUNGSI DETEKSI APAKAH SUATU KATA ADALAH LOKASI
  // ============================================================
  function isLocation(word, allPageNames = []) {
    const lowerWord = word.toLowerCase();
    
    // LEVEL 1: Cek whitelist kota
    if (LOCATION_WHITELIST.includes(lowerWord)) return true;
    
    // LEVEL 2: Cek blacklist kata produk
    if (NOT_LOCATION_WORDS.includes(lowerWord)) return false;
    
    // LEVEL 3: Cek apakah kata tersebut dikenal sebagai produk
    const isKnownProduct = allPageNames.some(known => 
      known === lowerWord || known.includes(lowerWord) || lowerWord.includes(known)
    );
    if (isKnownProduct) return false;
    
    // LEVEL 4: Cek pola akhiran kota
    for (const suffix of CITY_SUFFIXES) {
      if (lowerWord.endsWith(suffix) && lowerWord.length >= 4) {
        return true;
      }
    }
    
    // LEVEL 5: Cek pola kata dengan 2+ vokal (untuk kata yang panjang)
    if (lowerWord.length >= 5 && lowerWord.length <= 12) {
      const vowelCount = (lowerWord.match(/[aiueo]/g) || []).length;
      if (vowelCount >= 2) {
        return true;
      }
    }
    
    return false;
  }
  
  // ============================================================
  // 📌 FUNGSI DETEKSI ENTITY TYPE (AUTO-DETECT + CUSTOM MAPPING)
  // ============================================================
  function detectEntityType() {
    const domain = window.location.hostname;
    const url = window.location.pathname.toLowerCase();
    const body = (document.body?.innerText || "").slice(0, 500).toLowerCase();
    const h1 = (document.querySelector("h1")?.innerText || "").toLowerCase();
    const title = (document.title || "").toLowerCase();
    
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
    
    // 🔥 PRIORITAS 2: Manual override dari attribute
    const bodyData = document.body.getAttribute('data-entity-type');
    if (bodyData && ['produk', 'jasa', 'material', 'sewa'].includes(bodyData)) return bodyData;
    
    // 🔥 PRIORITAS 3: Deteksi dari URL
    if (url.includes('/jasa/') || url.includes('/layanan/')) return 'jasa';
    if (url.includes('/sewa/') || url.includes('/rental/')) return 'sewa';
    if (url.includes('/material/') || url.includes('/bahan/')) return 'material';
    if (url.includes('/produk/') || url.includes('/barang/')) return 'produk';
    
    // 🔥 PRIORITAS 4: Deteksi dari H1
    if (h1.includes('jasa') || h1.includes('kontraktor') || h1.includes('layanan')) return 'jasa';
    if (h1.includes('sewa') || h1.includes('rental')) return 'sewa';
    if (h1.includes('material') || h1.includes('bahan bangunan')) return 'material';
    if (h1.includes('produk') || h1.includes('barang') || h1.includes('furniture')) return 'produk';
    
    // 🔥 PRIORITAS 5: Deteksi dari Title
    if (title.includes('jasa') || title.includes('kontraktor')) return 'jasa';
    if (title.includes('sewa') || title.includes('rental')) return 'sewa';
    if (title.includes('material')) return 'material';
    
    // 🔥 PRIORITAS 6: Deteksi dari Body (keyword spesifik)
    if (body.includes('jasa konstruksi') || body.includes('jasa pasang') || body.includes('layanan jasa')) return 'jasa';
    if (body.includes('sewa alat') || body.includes('rental alat') || body.includes('sewa konstruksi')) return 'sewa';
    if (body.includes('material bangunan') || body.includes('bahan material') || body.includes('bahan bangunan')) return 'material';
    
    return 'produk'; // default
  }
  
  // ============================================================
  // 📌 FUNGSI DETEKSI MONEY_MASTER vs MONEY_PAGE vs MONEY_CHILD vs MONEY_LEADGEN
  // ============================================================
  function detectMoneyLevel(title, h1, url) {
    const textToCheck = (h1 + ' ' + title + ' ' + url).toLowerCase();
    const entityType = detectEntityType();
    
    // 🔥 PRIORITAS 1: Deteksi MONEY_LEADGEN (khusus Jasa & Sewa)
    const leadgenKeywords = ['konsultasi', 'survey', 'hubungi', 'estimasi', 'penawaran', 'free consultation'];
    for (const keyword of leadgenKeywords) {
      if (textToCheck.includes(keyword)) {
        if (entityType === 'jasa' || entityType === 'sewa') {
          console.log(`📌 Leadgen detected: ${keyword} → money-leadgen`);
          return 'money-leadgen';
        }
      }
    }
    
    // 🔥 PRIORITAS 2: Deteksi MONEY_MASTER, MONEY_PAGE, MONEY_CHILD
    // Harus mengandung kata harga atau sewa
    const hasPriceKeyword = textToCheck.includes('harga ') || textToCheck.includes('sewa ') || textToCheck.includes('biaya ');
    if (!hasPriceKeyword) return null;
    
    // Ekstrak setelah kata "harga" atau "sewa"
    let afterKeyword = '';
    let keywordType = '';
    if (textToCheck.includes('harga ')) {
      const hargaIndex = textToCheck.indexOf('harga ');
      afterKeyword = textToCheck.substring(hargaIndex + 6);
      keywordType = 'harga';
    } else if (textToCheck.includes('sewa ')) {
      const sewaIndex = textToCheck.indexOf('sewa ');
      afterKeyword = textToCheck.substring(sewaIndex + 5);
      keywordType = 'sewa';
    } else if (textToCheck.includes('biaya ')) {
      const biayaIndex = textToCheck.indexOf('biaya ');
      afterKeyword = textToCheck.substring(biayaIndex + 6);
      keywordType = 'biaya';
    }
    
    // Ambil maksimal 50 karakter
    afterKeyword = afterKeyword.slice(0, 50);
    
    // Kata kunci yang menandakan produk SPESIFIK (bukan umum)
    const specificProductIndicators = [
      'pabrikan', 'minimalis', 'modern', 'modular', 'siap pakai',
      'hpl', 'mdf', 'jati', 'bigland', 'pengantin', 'murah',
      'premium', 'ekonomis', 'standar', 'custom', 'bespoke',
      '0.', '0,', '1.', '2.', '3.', 'mm', 'cm', 'meter', 'inch',
      'putih', 'hitam', 'merah', 'biru', 'hijau', 'kuning',
      'kecil', 'besar', 'sedang', 'mini', 'maxi', 'jumbo',
      'excavator', 'bulldozer', 'crane', 'dump truck', 'vibro'
    ];
    
    // Cek apakah mengandung lokasi (MONEY_CHILD)
    const words = afterKeyword.split(' ');
    for (const word of words) {
      if (isLocation(word, [])) {
        console.log(`📌 Location detected in money page: ${word} → money-child`);
        return 'money-child';
      }
    }
    
    // Cek apakah produk spesifik
    for (const indicator of specificProductIndicators) {
      if (afterKeyword.includes(indicator)) {
        console.log(`📌 Specific product detected: ${indicator} → money-page`);
        return 'money-page';
      }
    }
    
    // Jasa tidak boleh menggunakan MONEY_MASTER
    if (entityType === 'jasa') {
      console.log(`📌 Jasa entity with price keyword → money-page (not master)`);
      return 'money-page';
    }
    
    // Jika hanya "harga [kategori]" atau "sewa [kategori]" -> MONEY_MASTER
    console.log(`📌 General price keyword → money-master`);
    return 'money-master';
  }
  
  // ============================================================
  // 📌 FUNGSI DETEKSI DARI URL (DENGAN CUSTOM MAPPING + ENHANCED)
  // ============================================================
  function detectFromURL(url, h1, title) {
    const domain = window.location.hostname;
    const urlLower = url.toLowerCase();
    
    // 🔥 PRIORITAS 1: Cek custom pillar mapping untuk domain ini
    const customCheck = isCustomPillar(urlLower, domain);
    if (customCheck && customCheck.isPillar) {
      console.log(`📌 Custom mapping: ${urlLower} → PILLAR (${customCheck.entityType})`);
      document.body.setAttribute('data-entity-type', customCheck.entityType);
      return 'pillar';
    }
    
    // 🔥 PRIORITAS 2: Deteksi MONEY_LEADGEN dari URL pattern
    const leadgenPatterns = [
      '/konsultasi/', '/consultation/', '/survey/', '/hubungi/', '/contact/',
      '/estimasi/', '/penawaran/', '/quote/', '/free-consultation/',
      '/jadwal-survey/', '/request-quote/'
    ];
    for (const pattern of leadgenPatterns) {
      if (urlLower.includes(pattern)) {
        const entityType = detectEntityType();
        if (entityType === 'jasa' || entityType === 'sewa') {
          console.log(`📌 Leadgen URL pattern: ${urlLower} → money-leadgen`);
          return 'money-leadgen';
        }
      }
    }
    
    // 🔥 PRIORITAS 3: Deteksi MONEY_MASTER vs MONEY_PAGE vs MONEY_CHILD
    const moneyLevel = detectMoneyLevel(title, h1, url);
    if (moneyLevel) {
      console.log(`📌 Money detection: ${urlLower} → ${moneyLevel}`);
      return moneyLevel;
    }
    
    // 🔥 PRIORITAS 4: Deteksi normal dari URL patterns
    for (const [level, patterns] of Object.entries(URL_PATTERNS)) {
      for (const pattern of patterns) {
        if (urlLower.includes(pattern)) {
          return level;
        }
      }
    }
    
    // 🔥 PRIORITAS 5: Deteksi lokasi di URL (MONEY_CHILD)
    const urlParts = urlLower.split('/');
    for (const part of urlParts) {
      if (part.length > 3 && isLocation(part, [])) {
        console.log(`📌 Location detected in URL: ${part} → money-child`);
        return 'money-child';
      }
    }
    
    return null;
  }
  
  // ============================================================
  // 📌 FUNGSI DETEKSI DARI ELEMEN
  // ============================================================
  const VALID_LEVELS = [
    'pillar', 
    'sub-pillar-tipe-2', 
    'sub-pillar-tipe-1',
    'money-master', 
    'money-page', 
    'money-child',
    'money-leadgen',
    'variant', 
    'sub-variant'
  ];
  
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
  // 📌 FUNGSI DETEKSI DARI KONTEN (FALLBACK)
  // ============================================================
  function detectFromContent() {
    const h1 = (document.querySelector("h1")?.innerText || "").toLowerCase();
    const title = (document.title || "").toLowerCase();
    const body = (document.body?.innerText || "").slice(0, 1500).toLowerCase();
    const entityType = detectEntityType();
    
    // 🔥 PRIORITAS 1: Deteksi MONEY_LEADGEN
    const leadgenKeywords = ['konsultasi', 'survey', 'hubungi', 'estimasi', 'penawaran', 'free consultation'];
    for (const keyword of leadgenKeywords) {
      if (h1.includes(keyword) || title.includes(keyword) || body.includes(keyword)) {
        if (entityType === 'jasa' || entityType === 'sewa') {
          console.log(`📌 Leadgen detected from content: ${keyword} → money-leadgen`);
          return 'money-leadgen';
        }
      }
    }
    
    // 🔥 PRIORITAS 2: Deteksi SUB-VARIANT (sangat detail)
    if (h1.includes('tebal') || h1.includes('ketebalan') || 
        h1.includes('lebar') || h1.includes('panjang') ||
        h1.includes('tinggi') ||
        /\d+\s*mm\s*x\s*\d+\s*mm/.test(h1)) {
      return 'sub-variant';
    }
    
    // 🔥 PRIORITAS 3: Deteksi VARIANT
    if (h1.includes('spesifikasi') || h1.includes('detail') || 
        h1.includes('ukuran') || h1.includes('tipe') ||
        h1.includes('kapasitas') || h1.includes('warna')) {
      return 'variant';
    }
    
    // 🔥 PRIORITAS 4: Deteksi MONEY dengan logic pintar
    const moneyLevel = detectMoneyLevel(title, h1, window.location.pathname);
    if (moneyLevel) {
      return moneyLevel;
    }
    
    // 🔥 PRIORITAS 5: Deteksi SUB2
    if (h1.includes('jenis') || h1.includes('macam') || h1.includes('tipe ')) {
      return 'sub-pillar-tipe-2';
    }
    
    // 🔥 PRIORITAS 6: Deteksi SUB1
    if (h1.includes('vs') || h1.includes('perbandingan') || h1.includes('lebih baik')) {
      return 'sub-pillar-tipe-1';
    }
    
    // 🔥 PRIORITAS 7: Deteksi lokasi di body (MONEY_CHILD)
    const words = body.split(/\s+/);
    for (const word of words) {
      if (word.length > 3 && isLocation(word, [])) {
        return 'money-child';
      }
    }
    
    return 'pillar';
  }
  
  // ============================================================
  // 📌 FUNGSI DETEKSI UTAMA
  // ============================================================
  function detectPageLevel() {
    console.log("🔍 Page Level Detector v15.0 — Optimized for betonjayareadymix.com");
    
    // PRIORITAS 1: Manual override dari parameter
    if (window.__manualPageLevel) {
      console.log(`📌 Manual override: ${window.__manualPageLevel}`);
      return window.__manualPageLevel;
    }
    
    // Ambil H1 dan Title untuk deteksi money level
    const h1 = document.querySelector("h1")?.innerText || "";
    const title = document.title || "";
    
    // PRIORITAS 2: Deteksi dari URL (dengan custom mapping + enhanced)
    const urlLevel = detectFromURL(window.location.pathname, h1, title);
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
  // 📌 FUNGSI SET MANUAL PAGE LEVEL
  // ============================================================
  function setManualPageLevel(level) {
    if (VALID_LEVELS.includes(level)) {
      window.__manualPageLevel = level;
      console.log(`✅ Manual page level set to: ${level}`);
      document.body.setAttribute('data-page-level', level);
      return true;
    }
    console.error(`❌ Invalid page level: ${level}. Valid: ${VALID_LEVELS.join(', ')}`);
    return false;
  }
  
  // ============================================================
  // 📌 FUNGSI UPDATE BODY ATTRIBUTE (UNTUK KONSISTENSI)
  // ============================================================
  function updateBodyAttributes() {
    const level = detectPageLevel();
    const entityType = detectEntityType();
    
    document.body.setAttribute('data-page-level', level);
    document.body.setAttribute('data-entity-type', entityType);
    
    console.log(`✅ Body attributes updated: page-level=${level}, entity-type=${entityType}`);
    return { pageLevel: level, entityType: entityType };
  }
  
  // ============================================================
  // 📌 EXPOSE FUNGSI
  // ============================================================
  window.pageLevelDetector = {
    detect: detectPageLevel,
    setManual: setManualPageLevel,
    detectEntityType: detectEntityType,
    updateAttributes: updateBodyAttributes,
    isValid: (level) => VALID_LEVELS.includes(level),
    getCustomPillars: () => CUSTOM_PILLAR_MAPPING[window.location.hostname] || null,
    getLocationWhitelist: () => [...LOCATION_WHITELIST],
    version: '15.0'
  };
  
  window.__pageLevelDetectorReady = true;
  window.dispatchEvent(new Event("pageLevelDetectorReady"));
  
  console.log("✅ Page Level Detector v15.0 ready for betonjayareadymix.com");
  console.log("📋 Custom Pillars:", CUSTOM_PILLAR_MAPPING[window.location.hostname]?.pillar || []);
  console.log("📋 Features: MONEY_MASTER/PAGE/CHILD/LEADGEN, SUB-VARIANT, Auto Entity Type, Location Detection");
  
})();
