

  // ═══════════════════════════════════════════════════════════
  // LEVEL MAPS
  // ═══════════════════════════════════════════════════════════
  var VALID_LEVELS = [
    "home", "pillar", "sub-pillar-tipe-2", "sub-pillar-tipe-1",
    "money-master", "money-page", "money-child", "variant", "sub-variant"
  ];

  var TYPE_LEVEL_MAP = {
    home: 0, pillar: 1, "sub-pillar-tipe-2": 2, "sub-pillar-tipe-1": 3,
    "money-master": 4, "money-page": 5, "money-child": 6,
    variant: 7, "sub-variant": 8
  };

  var LEVEL_HIERARCHY_MAP = {
    "pillar": 1, "sub-pillar-tipe-2": 2, "sub-pillar-tipe-1": 3,
    "money-master": 4, "money-page": 5, "money-child": 6,
    "variant": 7, "sub-variant": 8
  };

  var LEVEL_INVERSE_MAP = {
    1: "pillar", 2: "sub-pillar-tipe-2", 3: "sub-pillar-tipe-1",
    4: "money-master", 5: "money-page", 6: "money-child",
    7: "variant", 8: "sub-variant"
  };

  var EXPECTED_CHILD_MAP = {
    "pillar":            { expected: "sub-pillar-tipe-2", num: 2,
                           alternates: ["sub-pillar-tipe-1", "money-master"] },
    "sub-pillar-tipe-2": { expected: null,                num: 2, isLeaf: true },
    "sub-pillar-tipe-1": { expected: null,                num: 3, isLeaf: true },
    "money-master":      { expected: "money-page",        num: 5,
                           alternates: ["money-child"] },
    "money-page":        { expected: "money-child",       num: 6,
                           alternates: ["variant"] },
    "money-child":       { expected: null,                num: 6, isLeaf: true },
    "variant":           { expected: "sub-variant",       num: 8 },
    "sub-variant":       { expected: null,                num: 9, isLeaf: true }
  };
  var VALID_ENTITY_TYPES = ["produk", "material", "jasa", "desain", "sewa", "artikel"];

  var ENTITY_PILLAR_NAMES = {
    jasa: ["jasa konstruksi"],
    produk: ["produk konstruksi"],
    material: ["material konstruksi"],
    desain: ["jasa desain"],
    "produk interior": ["produk interior"],
    sewa: ["sewa alat konstruksi"],
    artikel: ["artikel konstruksi"]
  };

  var ENTITY_TRIGGERS = {
    jasa: [
      "jasa", "kontraktor", "tukang", "borongan",
      "renovasi", "bangun", "perbaikan", "perawatan",
      "instalasi", "pemasangan", "pembongkaran", "pembersihan",
      "coring", "cutting", "grouting", "sandblasting",
      "pengeboran", "pemancangan", "pengecoran", "pengelasan",
      "pondasi", "bored pile", "bor pile", "strauss", "pancang",
      "waterproofing", "epoxy", "coating", "poles",
      "service", "servis", "layanan",
      "relief", "profil beton", "interior", "eksterior",
      "konsultan", "pembuatan", "pasang", "finishing",
      "uji tanah", "perkuatan tanah", "pembatas pengaman",
      "buang puing", "saluran drainase", "jalan perkerasan",
      "pematangan lahan", "lapangan olahraga"
    ],
    desain: [
      "desain", "interior", "eksterior", "arsitektur",
      "konsep", "rencana", "gambar kerja", "denah",
      "render", "visualisasi", "3d design", "shop drawing"
    ],
    sewa: ["sewa", "rental", "rent"],
    material: [
      "material", "bahan", "semen", "pasir", "besi", "baja", "kayu",
      "keramik", "granit", "marmer", "bata", "batako", "hebel",
      "genteng", "pipa", "cat", "kabel", "paku", "baut",
      "kaca", "aluminium", "tembaga"
    ],
    produk: [
      "produk", "jual", "beli", "supplier", "distributor", "toko",
      "pintu", "jendela", "pagar", "kanopi", "railing", "gerbang",
      "wastafel", "closet", "kitchen set", "wardrobe"
    ],
    artikel: [
      "artikel", "blog", "tips", "panduan", "cara", "tutorial",
      "review", "ulasan", "berita", "informasi", "update"
    ]
  };

  var ENTITY_PRIORITY = ["jasa", "sewa", "desain", "produk", "material", "artikel"];

  var JASA_WORDS = [
    'jasa','kontraktor','tukang','borongan','renovasi','pasang','bangun','perbaikan','instalasi','proyek',
    'cor','gali','urug','angkut','service','servis','desain','interior','eksterior','arsitektur',
    'coring','cutting','drilling','pengeboran','pemancangan','pemasangan','bongkar','potong','las','sambung',
    'grinding','welding','bending','forming','pondasi','tiang','pancang','bore','pile','strauss',
    'konstruksi','bangunan','rumah','gedung','ruko','gudang','pabrik','jalan','jembatan','infrastruktur',
    'relief','profil','konsultan','finishing','uji','perkuatan','pembatas','pengaman','puing','drainase','perkerasan'
  ];

  var COMMON_JASA_WORDS = [
    'tukang','kontraktor','mandor','vendor','supplier','layanan','penyedia','pengrajin','spesialis',
    'biro','firma','perusahaan','penjual jasa','pasang','pemasangan','bangun','renovasi','perbaikan',
    'instalasi','service','servis','konstruksi','pembangunan','cor','gali','urug','angkut',
    'pemotongan','penggalian','pengurugan','pengangkutan','pengeboran','pengelasan','pengecoran','pengecatan',
    'pengukuran','pemasangan','pembongkaran','pembuatan','pengupasan','pemadatan','pengerukan','pemancangan',
    'pengeringan','pembersihan','perataan','pembentukan','persiapan','pemindahan','pengangkatan','pengolahan',
    'pengerjaan','penyelesaian','pemeliharaan','memotong','menggali','mengurug','mengangkat','mengebor',
    'mengelas','mengecor','mengecat','mengukur','memasang','membongkar','membuat','mengupas','memadatkan',
    'mengeruk','memancang'
  ];

  var SEWA_WORDS = [
    'sewa','rental','rent','alat','mesin','heavy equipment','excavator','bulldozer','crane','backhoe',
    'dozer','vibro','roller','compactor','diesel','hydraulic','mini','besar','kecil','sedang','medium','extra',
    'scaffolding','steger','tenda','terpal',
    'portacamp','toilet portable','tower lamp'
  ];

  var MATERIAL_WORDS = [
    'material','bahan','semen','pasir','batu split','kerikil','besi','baja','kayu','keramik','granit',
    'marmer','gypsum','plafon','paving','bata','batako','hebel','genteng','asbes','atap','baja ringan',
    'galvalum','precast','pracetak','readymix','ready mix',
    'paku','baut','mur','sekrup','kawat','wiremesh',
    'cat','vernis','politur','plamir','lem',
    'pipa','kabel','fitting','kran',
    'kaca','aluminium','tembaga'
  ];

  var PRODUK_WORDS = [
    'produk','jual','beli','supplier','distributor','toko','shop',
    'pagar panel','panel beton','pagar beton','pagar panel beton',
    'kanopi','paving block','u ditch','box culvert','bata ringan',
    'atap baja ringan','besi beton',
    'pintu','jendela','kusen','pagar','railing','gerbang',
    'wastafel','closet','kitchen set','wardrobe','lemari'
  ];

  var DESAIN_WORDS = [
    'desain','interior','eksterior','arsitektur','layout','denah','gambar','konsep','rencana','modern',
    'minimalis','klasik','tradisional','kontemporer','elegan','luxury','industrial','scandinavian','jepang',
    'rustic','vintage',
    'render','visualisasi','3d','shop drawing','tata ruang'
  ];

  var ENTITY_ONLY_WORDS = {
    jasa: ["jasa", "layanan", "service", "servis"],
    sewa: ["sewa", "rental"],
    produk: ["produk", "barang", "item"],
    material: ["material", "bahan"],
    desain: ["desain", "interior", "eksterior"],
    artikel: ["artikel", "blog", "post", "berita"]
  };

   var ENTITY_BASE_NAMES = {

    produk: [
      "pintu", "jendela", "kusen", "pagar", "kanopi",
      "plafon",
      "wallpaper", "atap", "paving",
      "kitchen set", "wardrobe", "sofa", "meja", "kursi",
      "lemari", "nakas", "tempat tidur", "bed frame",
      "gazebo", "kolam", "taman",
      "lampu", "cctv", "saklar listrik", "stop kontak", "panel listrik",
      "railing", "tangga", "gerbang", "wastafel", "closet",
      "tandon air", "tangki air", "water heater",
      "gorden", "blind", "kasa nyamuk", "tralis",
      "rak dinding", "rak tv", "rak buku", "gantungan baju",
      "pagar panel", "pagar beton", "pagar brc",
      "u ditch", "u ditch cover", "tutup u ditch",
      "box culvert", "buis beton",
      "gorong gorong",
      "sumuran", "sumur resapan",
      "kanstin beton", "kanstin", "curb stone",
      "grass block", "paving block",
      "rooster beton", "roster beton",
      "spun pile", "mini pile", "micropile", "sheet pile",
      "tiang pancang", "half slab", "sloof beton", "kolom praktis",
      "kolam renang", "taman kering", "taman vertikal",
      "walk in closet"
    ],

    material: [
      "semen", "pasir", "batu", "besi", "baja", "kayu",
      "beton", "pipa", "kabel", "fitting",
      "kaca",
      "valve", "kran", "cat", "vernis", "politur", "plamir", "lem",
      "waterproofing",
      "keramik", "granit", "marmer", "gypsum",
      "bata", "batako", "hebel", "genteng", "asbes",
      "galvalum", "precast", "pracetak", "aluminium",
      "kerikil",
      "ready mix", "readymix",
      "baja ringan", "besi beton", "bata ringan",
      "batu split", "batu kali", "batu belah",
      "paku", "baut", "sekrup", "mur", "kawat",
      "wiremesh", "besi wiremesh",
      "kabel twisted", "kabel nyy", "kabel nym"
    ],

    jasa: [
      "pengeboran",
      "bore pile", "bor pile", "bored pile", "boring pile",
      "mini pile", "spun pile", "micropile",
      "bor strauss", "bor pancang", "strauss pile",
      "tiang pancang", "pancang",
      "turap", "sheet pile",
      "jet grouting", "stabilisasi tanah", "soil improvement",
      "sumur bor", "bor sumur",
      "cor", "cor dak", "cor lantai", "cor jalan", "cor kolom",
      "cor sloof", "cor balok", "cor plat", "cor pondasi",
      "cor tiang", "cor dinding", "cor pagar",
      "pasang dinding", "pasang keramik", "pasang granit", "pasang marmer",
      "pasang parket", "pasang vinyl", "pasang ubin",
      "pasang wallpaper", "pasang wpc", "pasang grc", "pasang hpl",
      "pasang partisi", "pasang pagar", "pasang kanopi", "pasang awning",
      "pasang railing", "pasang tangga", "pasang gerbang",
      "pasang baja ringan", "pasang rangka atap", "pasang atap",
      "pasang genteng", "pasang plafon", "pasang gypsum",
      "pasang pintu", "pasang jendela", "pasang kusen", "pasang kaca",
      "pasang shower box",
      "pasang instalasi listrik", "pasang instalasi air",
      "pasang instalasi gas", "pasang instalasi ac",
      "pasang pipa", "pasang kabel listrik", "pasang panel listrik",
      "pasang ac", "pasang cctv", "pasang alarm",
      "bongkar dinding", "bongkar lantai", "bongkar plat",
      "bongkar gedung", "bongkar rumah", "bongkar ruko",
      "bongkar gudang", "bongkar atap",
      "bongkar keramik", "bongkar granit", "bongkar marmer",
      "bongkar plafon", "bongkar kusen", "bongkar pintu", "bongkar jendela",
      "bongkar pagar", "bongkar partisi",
      "gali tanah", "gali pondasi", "gali basement", "gali saluran",
      "penggalian tanah", "penggalian pondasi",
      "urug tanah", "urug lahan", "urug pondasi", "urug jalan",
      "pengurugan tanah", "pengurugan lahan",
      "angkut tanah", "angkut puing", "angkut material",
      "pemadatan tanah", "pemadatan lahan",
      "pengerukan sungai", "pengerukan kolam", "pengerukan saluran",
      "pemotongan bukit", "cut and fill",
      "renovasi rumah", "renovasi gedung", "renovasi kantor",
      "renovasi toko", "renovasi ruko", "renovasi gudang",
      "renovasi pabrik", "renovasi apartemen",
      "renovasi dapur", "renovasi kamar mandi", "renovasi kamar tidur",
      "renovasi ruang tamu", "renovasi teras", "renovasi balkon",
      "renovasi atap", "renovasi lantai", "renovasi dinding",
      "renovasi plafon", "renovasi pagar", "renovasi taman",
      "cat dinding", "cat tembok", "cat plafon", "cat kayu",
      "cat besi", "cat pagar",
      "pengecatan dinding", "pengecatan tembok",
      "waterproofing",
      "poles marmer", "poles granit", "poles keramik", "poles lantai",
      "grinding", "grinding beton", "grinding lantai",
      "epoxy lantai", "coating", "coating lantai", "coating beton",
      "instalasi listrik", "instalasi air", "instalasi plumbing",
      "instalasi ac", "instalasi cctv", "instalasi alarm",
      "service ac", "service pompa air", "service genset", "service lift",
      "perbaikan atap", "perbaikan dinding", "perbaikan lantai",
      "perbaikan plafon", "perbaikan pondasi", "perbaikan struktur",
      "perbaikan pipa", "perbaikan saluran air",
      "perawatan gedung", "perawatan kolam",
      "coring", "cutting", "bor", "drilling", "boring", "grouting",
      "las", "welding", "sandblasting",
      "las besi", "las pagar", "las kanopi", "las rangka baja", "las tiang",
      "welding besi", "welding konstruksi",
      "sandblasting besi", "sandblasting beton", "sandblasting dinding",
      "bangun rumah", "bangun gedung", "bangun ruko", "bangun gudang",
      "bangun kantor", "bangun pabrik", "bangun sekolah",
      "borongan rumah", "borongan gedung", "borongan interior",
      "pembersihan lahan", "land clearing",
      "pengaspalan", "aspal jalan",
      "pemasangan wifi", "instalasi internet", "instalasi antena",
      "pemasangan parabola",
      "pembuatan kanopi", "pembuatan pagar", "pembuatan railing",
      "relief", "relief beton",
      "profil beton",
      "interior", "eksterior",
      "konsultan", "konsultan konstruksi",
      "pembuatan", "pasang",
      "alat konstruksi",
      "konstruksi bangunan", "konstruksi struktur",
      "struktur khusus", "struktur konstruksi",
      "lapangan olahraga",
      "pondasi",
      "saluran drainase",
      "jalan perkerasan",
      "pematangan lahan",
      "pekerjaan galian tanah",
      "uji tanah", "soil test",
      "cutting beton",
      "bongkar bangunan",
      "buang puing",
      "perkuatan tanah",
      "pembatas pengaman",
      "finishing",
      "perbaikan bangunan",
      "perbaikan infrastruktur"
    ],

    sewa: [
      "alat berat", "heavy equipment",
      "excavator", "bulldozer", "backhoe", "dozer", "vibro",
      "crane", "truck crane", "mobile crane", "crawler crane", "tower crane",
      "dump truck", "motor grader", "wheel loader",
      "asphalt finisher", "asphalt paver", "tandem roller",
      "pneumatic tire roller", "cold milling", "batching plant",
      "concrete pump", "pompa beton", "pompa air",
      "jack hammer", "forklift", "genset",
      "boom lift", "skylift", "scissor lift", "man lift",
      "articulated boom lift", "telescopic boom lift",
      "concrete mixer", "molen beton", "vibrator beton",
      "chain block", "hoist crane", "overhead crane", "gantry crane",
      "winch", "cable puller",
      "vibratory plate", "stamper kodok", "tamper", "wacker plate",
      "vibro plate", "soil compactor",
      "trowel beton", "power trowel", "mesin plester", "mesin acian",
      "mesin cat", "spray gun", "airless sprayer",
      "mesin potong", "chainsaw", "gergaji mesin",
      "pompa celup", "pompa submersible", "pompa sentrifugal",
      "pompa transfer", "kompresor angin", "compressor",
      "scaffolding", "steger", "tenda", "terpal",
      "toilet portable", "portacamp",
      "tower lamp", "lampu sorot"
    ],

    desain: [
      "desain interior", "desain eksterior", "desain rumah",
      "desain arsitektur", "desain 3d", "desain denah", "desain layout",
      "desain bangunan", "desain struktur",
      "desain kantor", "desain toko", "desain ruko", "desain villa",
      "desain apartemen", "desain showroom",
      "desain kos", "desain guest house", "desain pujasera",
      "desain warung", "desain bengkel", "desain gudang",
      "desain foodcourt", "desain kedai",
      "desain kafe", "desain cafe", "desain restoran", "desain hotel",
      "desain bar", "desain lounge", "desain spa", "desain salon",
      "desain minimarket", "desain butik",
      "desain sekolah", "desain klinik",
      "desain dapur", "desain kamar mandi", "desain kamar tidur",
      "desain ruang tamu", "desain ruang keluarga", "desain ruang makan",
      "desain ruang kerja", "desain teras", "desain balkon",
      "desain carport", "desain fasad",
      "desain taman", "desain kolam renang", "desain gazebo",
      "desain walk in closet", "desain kamar anak",
      "gambar arsitektur", "gambar kerja", "gambar teknik"
    ]
  };

  // Sort base names DESC by word count (longest first)
  (function() {
    for (var ent in ENTITY_BASE_NAMES) {
      if (!ENTITY_BASE_NAMES.hasOwnProperty(ent)) continue;
      ENTITY_BASE_NAMES[ent].sort(function(a, b) {
        return b.split(' ').length - a.split(' ').length;
      });
    }
  })();

  var JASA_SUB_CATEGORIES = {
    struktural: [
      "bore pile", "bor pile", "bored pile", "boring pile",
      "mini pile", "spun pile", "micropile",
      "bor strauss", "bor pancang", "strauss pile",
      "tiang pancang", "pancang",
      "turap", "sheet pile",
      "jet grouting", "stabilisasi tanah", "soil improvement",
      "sumur bor", "bor sumur",
      "pondasi", "perkuatan tanah",
      "cor", "cor dak", "cor lantai", "cor jalan", "cor kolom",
      "cor sloof", "cor balok", "cor plat", "cor pondasi",
      "cor tiang", "cor dinding", "cor pagar",
      "pengeboran", "drilling", "boring","coring", "cutting", "cutting beton",
      "uji tanah", "soil test",
      "gali tanah", "gali pondasi", "gali basement", "gali saluran",
      "penggalian tanah", "penggalian pondasi",
      "urug tanah", "urug lahan", "urug pondasi", "urug jalan",
      "pengurugan tanah", "pengurugan lahan",
      "pemadatan tanah", "pemadatan lahan",
      "pemotongan bukit", "cut and fill"
    ],

    finishing: [
      "relief", "relief beton",
      "profil beton",
      "finishing",
      "cat dinding", "cat tembok", "cat plafon", "cat kayu",
      "cat besi", "cat pagar",
      "pengecatan dinding", "pengecatan tembok",
      "waterproofing",
      "poles marmer", "poles granit", "poles keramik", "poles lantai",
      "grinding", "grinding beton", "grinding lantai",
      "epoxy lantai", "coating", "coating lantai", "coating beton",
      "sandblasting besi", "sandblasting beton", "sandblasting dinding"
    ],

    konstruksi: [
      "konstruksi bangunan", "konstruksi struktur",
      "struktur khusus", "struktur konstruksi",
      "lapangan olahraga",
      "bangun rumah", "bangun gedung", "bangun ruko", "bangun gudang",
      "bangun kantor", "bangun pabrik", "bangun sekolah",
      "borongan rumah", "borongan gedung", "borongan interior",
      "pembuatan kanopi", "pembuatan pagar", "pembuatan railing"
    ],

    infrastruktur: [
      "saluran drainase",
      "jalan perkerasan",
      "pengaspalan", "aspal jalan",
      "pengerukan sungai", "pengerukan kolam", "pengerukan saluran"
    ],

    pematangan: [
      "pematangan lahan",
      "pekerjaan galian tanah",
      "pembersihan lahan", "land clearing",
      "angkut tanah", "angkut puing", "angkut material"
    ],

    bongkar_buang: [
      "bongkar dinding", "bongkar lantai", "bongkar plat",
      "bongkar gedung", "bongkar rumah", "bongkar ruko",
      "bongkar gudang", "bongkar atap",
      "bongkar keramik", "bongkar granit", "bongkar marmer",
      "bongkar plafon", "bongkar kusen", "bongkar pintu", "bongkar jendela",
      "bongkar pagar", "bongkar partisi",
      "bongkar bangunan",
      "buang puing"
    ],

    perbaikan: [
      "renovasi rumah", "renovasi gedung", "renovasi kantor",
      "renovasi toko", "renovasi ruko", "renovasi gudang",
      "renovasi pabrik", "renovasi apartemen",
      "renovasi dapur", "renovasi kamar mandi", "renovasi kamar tidur",
      "renovasi ruang tamu", "renovasi teras", "renovasi balkon",
      "renovasi atap", "renovasi lantai", "renovasi dinding",
      "renovasi plafon", "renovasi pagar", "renovasi taman",
      "perbaikan atap", "perbaikan dinding", "perbaikan lantai",
      "perbaikan plafon", "perbaikan pondasi", "perbaikan struktur",
      "perbaikan pipa", "perbaikan saluran air",
      "perbaikan bangunan",
      "perbaikan infrastruktur",
      "perawatan gedung", "perawatan kolam"
    ],

    instalasi: [
      "instalasi listrik", "instalasi air", "instalasi plumbing",
      "instalasi ac", "instalasi cctv", "instalasi alarm",
      "pasang instalasi listrik", "pasang instalasi air",
      "pasang instalasi gas", "pasang instalasi ac",
      "pasang pipa", "pasang kabel listrik", "pasang panel listrik",
      "pasang ac", "pasang cctv", "pasang alarm",
      "service ac", "service pompa air", "service genset", "service lift",
      "pemasangan wifi", "instalasi internet", "instalasi antena",
      "pemasangan parabola"
    ],

    konsultasi: [
      "konsultan", "konsultan konstruksi"
    ],

    pembuatan_pasang: [
      "pembuatan", "pasang",
      "pasang dinding", "pasang keramik", "pasang granit", "pasang marmer",
      "pasang parket", "pasang vinyl", "pasang ubin",
      "pasang wallpaper", "pasang wpc", "pasang grc", "pasang hpl",
      "pasang partisi", "pasang pagar", "pasang kanopi", "pasang awning",
      "pasang railing", "pasang tangga", "pasang gerbang",
      "pasang baja ringan", "pasang rangka atap", "pasang atap",
      "pasang genteng", "pasang plafon", "pasang gypsum",
      "pasang pintu", "pasang jendela", "pasang kusen", "pasang kaca",
      "pasang shower box"
    ],

    pengaman: [
      "pembatas pengaman"
    ],

    alat_konstruksi: [
      "alat konstruksi"
    ],

    interior_eksterior: [
      "interior", "eksterior"
    ],

    las_welding: [
      "las", "welding", "sandblasting",
      "las besi", "las pagar", "las kanopi", "las rangka baja", "las tiang",
      "welding besi", "welding konstruksi"
    ]
  };

  var DOMAIN_CONSTRAINTS = {
    struktural: {
      allowed_categories: ["metode", "skala", "tipe_aspal", "material", "dimensi", "kedalaman", "target", "price", "per_unit", "global_numeric", "tipe", "merek", "kondisi", "durasi", "kapasitas"],
      forbidden_categories: ["finishing", "warna", "gaya", "furniture", "subjektif", "konsep", "warna_extended", "gaya_extended"]
    },
    finishing: {
      allowed_categories: ["metode", "skala", "finishing", "warna", "material", "target", "price", "per_unit", "global_numeric"],
      forbidden_categories: ["dimensi", "kedalaman", "gaya", "furniture", "konsep", "warna_extended", "gaya_extended"]
    },
    konstruksi: {
      allowed_categories: ["metode", "skala", "material", "target", "price", "per_unit", "global_numeric"],
      forbidden_categories: ["finishing", "warna", "gaya", "furniture", "subjektif", "konsep", "warna_extended", "gaya_extended"]
    },
    infrastruktur: {
      allowed_categories: ["metode", "skala", "material", "target", "price", "per_unit", "global_numeric", "tipe_aspal"],
      forbidden_categories: ["finishing", "warna", "gaya", "furniture", "subjektif", "konsep", "warna_extended", "gaya_extended"]
    },
    pematangan: {
      allowed_categories: ["metode", "skala", "target", "price", "per_unit", "global_numeric"],
      forbidden_categories: ["finishing", "warna", "gaya", "furniture", "subjektif", "konsep", "dimensi", "kedalaman"]
    },
    bongkar_buang: {
      allowed_categories: ["metode", "skala", "target", "price", "per_unit", "global_numeric"],
      forbidden_categories: ["finishing", "warna", "gaya", "furniture", "subjektif", "konsep", "dimensi", "kedalaman"]
    },
    perbaikan: {
      allowed_categories: ["metode", "skala", "material", "finishing", "gaya", "target", "price", "per_unit", "global_numeric"],
      forbidden_categories: ["dimensi", "kedalaman", "furniture", "konsep", "warna_extended", "gaya_extended"]
    },
    instalasi: {
      allowed_categories: ["metode", "skala", "merek", "kapasitas", "kondisi", "target", "price", "per_unit", "global_numeric"],
      forbidden_categories: ["finishing", "warna", "gaya", "furniture", "konsep", "dimensi", "kedalaman", "warna_extended", "gaya_extended"]
    },
    konsultasi: {
      allowed_categories: ["skala", "target", "price", "per_unit", "global_numeric"],
      forbidden_categories: ["finishing", "warna", "gaya", "furniture", "konsep", "dimensi", "kedalaman", "metode", "material"]
    },
    pembuatan_pasang: {
      allowed_categories: ["metode", "skala", "material", "finishing", "gaya", "dimensi", "target", "price", "per_unit", "global_numeric", "warna"],
      forbidden_categories: ["kedalaman", "furniture", "konsep", "warna_extended", "gaya_extended"]
    },
    pengaman: {
      allowed_categories: ["material", "dimensi", "target", "price", "per_unit", "global_numeric", "metode"],
      forbidden_categories: ["finishing", "warna", "gaya", "furniture", "konsep", "kedalaman", "warna_extended", "gaya_extended"]
    },
    alat_konstruksi: {
      allowed_categories: ["merek", "kapasitas", "kondisi", "durasi", "tipe", "target", "price", "per_unit", "global_numeric"],
      forbidden_categories: ["finishing", "warna", "gaya", "furniture", "konsep", "dimensi", "kedalaman", "warna_extended", "gaya_extended"]
    },
    interior_eksterior: {
      allowed_categories: ["gaya", "warna", "material", "finishing", "konsep", "furniture", "subjektif", "target", "price", "per_unit", "global_numeric", "warna_extended", "gaya_extended"],
      forbidden_categories: ["dimensi", "kedalaman", "metode"]
    },
    las_welding: {
      allowed_categories: ["metode", "material", "dimensi", "target", "price", "per_unit", "global_numeric"],
      forbidden_categories: ["finishing", "warna", "gaya", "furniture", "konsep", "kedalaman", "warna_extended", "gaya_extended"]
    },
    default: {
      allowed_categories: ["metode", "skala", "material", "finishing", "warna", "gaya", "dimensi", "target", "price", "per_unit", "global_numeric", "tipe", "merek", "kondisi", "durasi", "kapasitas"],
      forbidden_categories: []
    }
  };

  var MODIFIER_COMPATIBILITY = {
    // Finishing modifiers
    "polos": ["produk", "material", "desain", "jasa_finishing", "jasa_pembuatan_pasang"],
    "motif": ["produk", "material", "desain", "jasa_finishing"],
    "bermotif": ["produk", "material", "desain"],
    "bercorak": ["produk", "material", "desain"],
    "tekstur": ["produk", "material", "desain", "jasa_finishing"],
    "serat": ["produk", "material", "desain"],
    "halus": ["produk", "material", "desain", "jasa_finishing"],
    "kasar": ["produk", "material", "desain"],
    "matte": ["produk", "material", "desain"],
    "glossy": ["produk", "material", "desain"],
    "doff": ["produk", "material", "desain"],
    "gloss": ["produk", "material", "desain"],
    "satin": ["produk", "material", "desain"],
    "anyaman": ["produk", "material", "desain"],
    "natural": ["produk", "material", "desain"],
    "ekspos": ["produk", "material", "desain", "jasa_finishing"],
    "custom": ["produk", "material", "desain", "jasa_pembuatan_pasang"],
    "polosan": ["produk", "material", "desain"],
    "cat": ["produk", "material", "desain", "jasa_finishing"],
    "coating": ["produk", "material", "desain", "jasa_finishing"],
    "lapisan": ["produk", "material", "desain"],
    "vernis": ["produk", "material", "desain", "jasa_finishing"],

    // Warna modifiers
    "putih": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "hitam": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "abu-abu": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "merah": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "biru": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "kuning": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "hijau": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "coklat": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "netral": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "krem": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "maroon": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "navy": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "forest": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "gold": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "silver": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "bronze": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "copper": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "rose gold": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "teal": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "turquoise": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "lavender": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "magenta": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "coral": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "salmon": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "peach": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "mint": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "warm": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "cool": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "pastel": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "dark": ["produk", "material", "desain", "jasa_interior_eksterior"],
    "light": ["produk", "material", "desain", "jasa_interior_eksterior"],

    // Gaya modifiers
    "minimalis": ["produk", "desain", "jasa_interior_eksterior", "jasa_perbaikan", "jasa_pembuatan_pasang"],
    "modern": ["produk", "desain", "jasa_interior_eksterior", "jasa_perbaikan", "jasa_pembuatan_pasang"],
    "klasik": ["produk", "desain", "jasa_interior_eksterior"],
    "skandinavia": ["produk", "desain", "jasa_interior_eksterior"],
    "japandi": ["produk", "desain", "jasa_interior_eksterior"],
    "industrial": ["produk", "desain", "jasa_interior_eksterior"],
    "kontemporer": ["produk", "desain", "jasa_interior_eksterior"],
    "tradisional": ["produk", "desain", "jasa_interior_eksterior"],
    "rustic": ["produk", "desain", "jasa_interior_eksterior"],
    "bohemian": ["produk", "desain", "jasa_interior_eksterior"],

    // Dimensi
    "dimensi": ["material", "produk", "jasa_struktural", "jasa_pengaman", "jasa_las_welding"],
    "ukuran": ["material", "produk", "jasa_struktural", "jasa_pengaman"],
    "tebal": ["material", "produk"],
    "panjang": ["material", "produk", "jasa_struktural"],
    "lebar": ["material", "produk"],
    "tinggi": ["material", "produk"],
    "diameter": ["material", "produk", "jasa_struktural"],
    "kedalaman": ["jasa_struktural"],
    "radius": ["material", "produk"],

    // Metode
    "manual": ["jasa_struktural", "jasa_instalasi", "jasa_las_welding", "jasa_pembuatan_pasang", "jasa_finishing"],
    "hidrolik": ["jasa_struktural", "jasa_alat_konstruksi"],
    "auger": ["jasa_struktural"],
    "rotary": ["jasa_struktural"],
    "percussive": ["jasa_struktural"],
    "dry": ["jasa_struktural", "jasa_finishing"],
    "wet": ["jasa_struktural", "jasa_finishing"],
    "basah": ["jasa_finishing"],
    "kering": ["jasa_finishing"],
    "mesin": ["jasa_struktural", "jasa_instalasi", "jasa_las_welding"],

    // Material
    "beton": ["produk", "material", "jasa_struktural", "jasa_konstruksi", "jasa_perbaikan"],
    "besi": ["produk", "material", "jasa_las_welding", "jasa_struktural", "jasa_pembuatan_pasang"],
    "kayu": ["produk", "material", "desain", "jasa_pembuatan_pasang"],
    "aluminium": ["produk", "material", "jasa_instalasi", "jasa_pembuatan_pasang"],
    "kaca": ["produk", "material", "jasa_instalasi", "jasa_pembuatan_pasang"],
    "stainless": ["produk", "material", "jasa_pembuatan_pasang"],
    "baja": ["produk", "material", "jasa_struktural", "jasa_las_welding"],
    "pvc": ["produk", "material", "jasa_instalasi"],
    "wpc": ["produk", "material", "jasa_pembuatan_pasang"],
    "grc": ["produk", "material", "jasa_pembuatan_pasang", "jasa_finishing"],
    "hpl": ["produk", "material", "jasa_pembuatan_pasang"],
    "acp": ["produk", "material", "jasa_pembuatan_pasang"],
    "vinyl": ["produk", "material", "jasa_pembuatan_pasang"],
    "upvc": ["produk", "material", "jasa_instalasi"],
    "tembaga": ["produk", "material", "jasa_instalasi"],
    "kuningan": ["produk", "material"],
    "perunggu": ["produk", "material"],
    "titanium": ["produk", "material"],
    "bambu": ["produk", "material", "desain"],
    "rotan": ["produk", "material", "desain"]
  };

  var GLOBAL_NUMERIC_KEYWORDS = [
    "grade a","grade b","grade c","sni","standar",
    "kualitas 1","kualitas 2","kualitas 3","kelas 1","kelas 2","kelas 3"
  ];

  var SHARED_MODIFIERS = {
    material: [
      "beton","besi","kayu","aluminium","kaca","stainless",
      "baja","pvc","wpc","grc","hpl","acp","vinyl","upvc",
      "tembaga","kuningan","perunggu","titanium","bambu","rotan"
    ],
    finishing: [
      "polos","motif","bermotif","bercorak","tekstur","serat",
      "halus","kasar","matte","glossy","doff","gloss","satin",
      "anyaman","natural","ekspos","custom","polosan",
      "cat","coating","lapisan","vernis"
    ],
    warna: [
      "putih","hitam","abu-abu","merah","biru","kuning","hijau","coklat",
      "netral","krem","maroon","navy","forest","gold","silver","bronze",
      "copper","rose gold","teal","turquoise","lavender","magenta",
      "coral","salmon","peach","mint","warm","cool","pastel","dark","light"
    ],
    gaya: [
      "minimalis","modern","klasik","skandinavia","japandi","industrial",
      "kontemporer","tradisional","rustic","bohemian"
    ]
  };

  var ENTITY_SPECIFIC = {
    jasa: {
      metode: [
        "manual","hidrolik","auger","rotary","percussive",
        "dry","wet","basah","kering","mesin","dalam","dangkal",
        "artesis","jet pump"
      ],
      skala: [
        "rumahan","komersial","industri","residential","commercial",
        "industrial","kecil","sedang","besar","menengah",
        "proyek",
        "perumahan",
        "perkantoran",
        "pabrik",
        "sekolah"
      ],
      tipe_aspal: ["hotmix","coldmix","aspal cair","aspal buton"]
    },
    produk: {
      mutu: ["k225","k250","k300","k350","k400","k500","fc"],
      tipe: [
        "geser","lipat","swing","sliding","casement","rolling door",
        "folding gate","harmonika","ayun","kupu-kupu","revolving",
        "otomatis","manual",
        "knockdown","prefab","precast"
      ]
    },
    material: {
      grade_material: [
        "portland","opc","ppc","pcc","type 1","type 2","type 3",
        "type 4","type 5","tipe 1","tipe 2","tipe 3","tipe 4","tipe 5"
      ],
      tipe_extended: [
        "wiry","bjku","bjtd","bjp","bjts",
        "plywood","multiplek","blockboard","mdf","hdf","particle board","solid wood",
        "jati","meranti","mahoni","sengon","pinus","randu",
        "sungkai","bangkirai","ulin","kamper","kruing","keruing",
        "merbau","sonokeling","trembesi","glugu",
        "andesit","kali","apung","split","koral","candi",
        "palimanan","paras","breksi",
        "batu alam","batu belah","batu gunung","batu karang",
        "silika","zeolit","cor",
        "homogeneous","homogen","roman","platinum","mulia","essence",
        "granito","granit tile","keramik lantai","keramik dinding",
        "marmer italy","marmer lokal","marmer import",
        "granit hitam","granit putih","granit coklat",
        "granit import","granit lokal",
        "dulux","jotun","nippon","mowilex","avian","decolith",
        "propan","falcon","vinilex",
        "pasir beton","pasir pasang","pasir urug","pasir halus",
        "pasir kasar","pasir putih","pasir hitam","pasir ayak",
        "pasir silika","pasir bangka","pasir lumajang",
        "h-beam","hbeam","wf","hollow","kanal","siku",
        "unesp","unp","cnp","inp","besi hollow","besi kanal",
        "eterna","supreme","kabelindo","tranka",
        "rucika","wavin","vinilon","pralon","maspion",
        "besi cor","aluminium foil",
        "bangka","lumajang","tulungagung","pangkep","muntilan",
        "borneo","kalimantan","jepara","kudus","cilacap",
        "tiga roda","3 roda",
        "gresik","semen gresik","semen-gresik",
        "holcim","semen holcim","semen-holcim",
        "scg","semen scg","semen-scg",
        "padang","semen padang","semen-padang",
        "merah putih","semen merah putih",
        "cibinong","semen cibinong",
        "baturaja","semen baturaja",
        "bosowa","semen bosowa",
        "tonasa","semen tonasa",
        "master","besi master",
        "intan","besi intan",
        "handuk","besi handuk",
        "krakatau steel","krakatau-steel","ks",
        "gunung garuda","gunung-garuda",
        "hanil","jeka",
        "danagri","magic","aquaproof","no drop","no-drop",
        "nodrop","aqua proof",
        "icera","ardena","milano","asia tile","asia-tile",
        "indograha","kian","eleganza","elegan",
        "paving","paving block","grass block",
        "atap","atap spandek","atap metal","atap genteng",
        "plafon","plafon gypsum","plafon pvc","plafon grc",
        "shunda","kalsiboard","gyproc","jayaboard"
      ]
    },
    sewa: {
      merek: [
        "pc75","pc200","pc300","pc350","pc400","komatsu","hitachi",
        "caterpillar","cat","volvo","hyundai","doosan","kobelco",
        "sumitomo","case","jcb","liebherr","kubota","yanmar",
        "perkins","cummin"
      ],
      kondisi: [
        "baru","bekas","servis","recondition","rebuilt","ready",
        "siap pakai","prima","baik","layak","standar",
        "listrik","diesel","bensin","solar","hydraulic"
      ],
      durasi: [
        "harian","mingguan","bulanan","tahunan","per jam",
        "per hari","per minggu","per bulan","short term","long term"
      ],
      tipe: [
        "mini","besar","kecil","sedang","medium","heavy","standar",
        "extra","ekstra","jumbo","compact","full size","large",
        "operator","tanpa operator","self drive","lepas kunci","include operator"
      ],
      kapasitas: [
        "ton","m3","kg","liter","galon","hp","ps","kva","psi","rpm","kw",
        "inch","inchi"
      ],
      tools_extended: [
        "motor grader","wheel loader","tower crane","asphalt finisher",
        "asphalt paver","tandem roller","pneumatic tire roller",
        "cold milling","batching plant","concrete pump",
        "genset","pompa air","pompa-beton","compressor","jack hammer"
      ]
    },
    desain: {
      tipe: [
        "2d","3d","animasi","walkthrough","virtual tour","vr","ar","render"
      ],
      gaya_extended: [
        "art deco","mid century","victorian","gothic","renaissance",
        "baroque","rococo","neoklasik","art nouveau","bauhaus",
        "postmodern","dekonstruksi","high tech","eklektik","transisi",
        "tropis","mediterania","kolonial","peranakan","balinese","javanese",
        "japandi","coastal","new york","hampton","farmhouse",
        "shabby chic","parisian","moroccan","brutalist","cottage core",
        "grand millennial","tropical modern","contemporary","industrial chic",
        "minimalism","classic","modern classic","streamline",
        "boho chic","mid-century","memphis","cyberpunk","steampunk",
        "neofuturism","biophilic","wabi sabi","zen","feng shui",
        "bali modern","java etnik","minimalis tropis","kolonial modern",
        "industrial rustic","scandinavian japandi","modern klasik",
        "minimalis skandinavia","japandi minimalis",
        "classic modern","modern farmhouse","boho industrial",
        "javanese modern","balinese contemporary","traditional modern",
        "ethnic modern","modern etnik","tribal modern"
      ],
      warna_extended: [
        "earth tone","sage green","sage","dusty pink","dusty",
        "terracotta","navy blue","mustard","olive","mauve",
        "charcoal","cream","ivory","beige","taupe","greige"
      ],
      konsep: [
        "open space","split level","loft","studio","apartment",
        "villa","tiny house","smart home","eco home","sustainable",
        "green building","biophilic","zen","feng shui","vastu","wabi sabi"
      ],
      material: [
        "kayu","besi","kaca","marmer","granit","keramik",
        "plafon","gypsum","pvc","acp","vinyl","wpc","grc","hpl",
        "bambu","rotan","anyaman","kain","kulit","karpet",
        "parket","ubin","batu alam","batu bata","beton ekspos"
      ],
      furniture: [
        "minimalis","skandinavia","jepang","klasik","modern","retro",
        "vintage","industrial","rustic","bohemian","mid century",
        "art deco","contemporary"
      ],
      subjektif: ["mewah","eksklusif","premium","luxury","high end","artistik","estetik"]
    }
  };

  function uniqArray(arr) {
    var seen = {};
    return arr.filter(function(w) {
      if (seen[w]) return false;
      seen[w] = true;
      return true;
    });
  }

var PURE_JASA_TECHNIQUES = [];

  var PURE_METHODS = [
    "manual", "hidrolik", "auger", "rotary", "percussive",
    "dry", "wet", "basah", "kering",
    "mesin", "dalam", "dangkal", "artesis", "jet pump",
    "borongan", "perumahan", "proyek"
  ];

  var PURE_SCALES = ["rumahan", "komersial", "industri", "residential", "commercial", "industrial", "kecil", "sedang", "besar", "menengah"];

  var PURE_FINISHING = ["polos", "motif", "bermotif", "bercorak", "tekstur", "serat", "halus", "kasar", "matte", "glossy", "doff", "gloss", "satin", "anyaman", "natural", "ekspos", "custom", "polosan", "cat", "coating", "lapisan", "vernis"];

  var APPLICATION_TARGETS = [
    "dinding", "tembok", "lantai", "plafon", "atap",
    "partisi", "kolom", "balok", "plat", "slab", "pelat",
    "pondasi", "tiang", "tangga", "railing", "kusen",
    "pagar", "pintu", "jendela", "rolling door", "kanopi",
    "awning", "fasad", "facade",
    "teras", "balkon", "halaman", "carport", "garasi",
    "kamar mandi", "kamar tidur", "ruang tamu", "ruang keluarga",
    "ruang makan", "ruang kerja", "dapur", "toilet", "wc",
    "kantor", "toko", "gudang", "pabrik", "sekolah",
    "rumah", "gedung", "ruko", "villa", "apartemen",
    "cafe", "restoran", "hotel", "kios", "rukan",
    "jalan", "trotoar", "saluran", "drainase",
    "taman", "kolam", "sawah", "lahan"
  ];

  var APPLICATION_TARGETS_FULL = [
    "dinding","tembok","lantai","plafon","atap","partisi",
    "kolom","balok","plat","slab","pelat","pondasi","tiang",
    "tangga","railing","kusen","pagar","pintu","jendela",
    "kanopi","awning","fasad","facade",
    "teras","balkon","halaman","carport","garasi","kamar mandi",
    "kamar tidur","ruang tamu","ruang keluarga","ruang makan",
    "ruang kerja","dapur","toilet","wc",
    "kantor","toko","gudang","pabrik","sekolah","rumah","gedung",
    "ruko","villa","apartemen","cafe","restoran","hotel",
    "kios","rukan",
    "jalan","trotoar","saluran","drainase","taman","kolam",
    "sawah","lahan",
    "tambang","proyek","site","area kerja","basement",
    "custom","modern","minimalis","klasik"
  ];

  function isApplicationTarget(word) {
    if (!word) return false;
    var w = word.toLowerCase().trim();
    return APPLICATION_TARGETS.indexOf(w) !== -1 ||
           APPLICATION_TARGETS_FULL.indexOf(w) !== -1;
  }

  var SATUAN_UNITS = [
    "meter", "m", "cm", "mm", "km", "mtr", "mtrs", "inchi", "inch", "ft", "feet",
    "kg", "ton", "gram", "ons", "kuintal", "lbs", "pound",
    "liter", "ml", "galon", "m3", "cc", "dm3",
    "m2", "hektar", "ha", "are",
    "detik", "menit", "jam", "hari", "minggu", "bulan", "tahun",
    "harian", "mingguan", "bulanan", "tahunan",
    "unit", "buah", "lembar", "batang", "keping", "papan",
    "roll", "set", "paket", "titik", "boks", "dus", "karung",
    "sak", "kodi", "lusin", "gross",
    "ampere", "watt", "volt", "kva", "kw", "hp", "ps", "rpm", "psi", "bar", "pascal",
    "orang", "kali",
    "kubik", "pk", "truk", "colt", "pickup", "angkutan",
    "rim", "lot", "batch", "container", "kontainer"
  ];

  // ═══ FIX-P6: Precompile regex untuk SATUAN_UNITS ═══
  var _SATUAN_UNITS_REGEX = new RegExp("\\b(" + SATUAN_UNITS.join("|") + ")\\b", 'g');
  var _SATUAN_UNITS_PER_REGEX = new RegExp("\\bper\\s+(" + SATUAN_UNITS.join("|") + ")\\b", 'g');

  var QUESTION_WORDS = [
    "berapa", "apa itu", "apa yang", "apa beda", "apa perbedaan",
    "apa fungsi", "apa manfaat", "bagaimana", "gimana cara",
    "bagaimana cara", "mengapa", "kenapa", "kapan", "dimana",
    "di mana", "siapa", "yang mana", "apakah", "adakah"
  ];

  var COMMERCIAL_INVESTIGATION_WORDS = [
    "review", "ulasan", "testimoni", "pengalaman", "rating", "penilaian",
    "rekomendasi", "saran", "anjuran", "suggest", "terbaik", "terburuk",
    "terpopuler", "terfavorit", "top", "pilihan", "alternatif",
    "vs", "versus", "perbandingan", "bandingkan",
    "kelebihan", "kekurangan", "plus minus", "pro kontra", "untung rugi"
  ];

  var FREE_INFO_WORDS = ["panduan gratis", "ebook gratis", "template gratis", "download gratis", "pdf gratis"];
  var FREE_COMM_WORDS = ["konsultasi gratis", "survey gratis", "sample gratis", "demo gratis", "trial gratis", "estimasi gratis", "penawaran gratis"];
  var AUTHORITY_WORDS = ["resmi", "authorized", "official", "distributor resmi", "dealer resmi", "agen resmi", "mitra resmi", "sertifikat resmi"];
  var READY_STOCK_WORDS = ["ready stock", "ready stok", "siap pakai", "siap kirim", "stok tersedia", "fast respon", "same day", "instan", "ready"];

  var SPEC_PHRASE_WORDS = [
    "berdasarkan", "berdasar",
    "faktor penentu", "faktor yang mempengaruhi", "faktor utama",
    "penyebab", "sebab", "dampak", "pengaruh", "efek",
    "per kedalaman", "per ukuran", "per tipe", "per jenis",
    "langkah-langkah", "langkah demi langkah",
    "tahapan lengkap", "tahap demi tahap",
    "panduan lengkap", "tutorial lengkap",
    "analisis lengkap", "review lengkap",
    "perbandingan lengkap", "perbedaan lengkap",
    "jenis-jenis lengkap", "macam-macam lengkap",
    "spesifikasi", "mutu", "metode", "cara kerja", "panduan", "fungsi"
  ];

  var SPEC_PHRASE_INFORMATIONAL = [
    "berdasarkan", "berdasar",
    "faktor penentu", "faktor yang mempengaruhi", "faktor utama",
    "penyebab", "sebab", "dampak", "pengaruh", "efek"
  ];

  var MARKETING_TERMS = [
    "premium", "ekonomis", "terbaik", "terlaris",
    "murah", "berkualitas", "unggul", "terkenal",
    "favorit", "recommended", "terpercaya"
  ];

  var MATERIAL_TYPE_WORDS = [
    "portland", "opc", "ppc", "pcc",
    "semen putih", "semen abu", "semen warna",
    "type 1", "type 2", "type 3", "type 4", "type 5",
    "tipe 1", "tipe 2", "tipe 3", "tipe 4", "tipe 5",
    "wiry", "bjku", "bjtd", "bjp", "bjts",
    "plywood", "multiplek", "blockboard", "mdf", "hdf", "particle board", "solid wood",
    "jati", "meranti", "mahoni", "sengon", "pinus", "randu",
    "sungkai", "bangkirai", "ulin", "kamper", "kruing", "keruing",
    "merbau", "sonokeling", "trembesi", "glugu", "bambu",
    "andesit", "kali", "apung", "split", "koral", "candi",
    "palimanan", "paras", "breksi", "granit", "marmer",
    "batu alam", "batu belah", "batu gunung", "batu karang",
    "silika", "zeolit", "cor",
    "homogeneous", "homogen", "roman", "platinum", "mulia", "essence",
    "granito", "granit tile", "keramik lantai", "keramik dinding",
    "marmer italy", "marmer lokal", "marmer import",
    "granit hitam", "granit putih", "granit coklat",
    "granit import", "granit lokal",
    "dulux", "jotun", "nippon", "mowilex", "avian", "decolith",
    "propan", "falcon", "vinilex", "dulux catylac",
    "cat tembok", "cat kayu", "cat besi", "cat dinding",
    "pasir beton", "pasir pasang", "pasir urug", "pasir halus",
    "pasir kasar", "pasir putih", "pasir hitam", "pasir ayak",
    "pasir silika", "pasir bangka", "pasir lumajang",
    "h-beam", "hbeam", "wf", "hollow", "kanal", "siku",
    "unesp", "unp", "cnp", "inp", "besi hollow", "besi kanal",
    "eterna", "supreme", "kabelindo", "tranka",
    "rucika", "wavin", "vinilon", "pralon", "maspion",
    "tembaga", "aluminium", "kuningan", "perunggu", "titanium",
    "besi cor", "aluminium foil",
    "bangka", "lumajang", "tulungagung", "pangkep", "muntilan",
    "borneo", "kalimantan", "jepara", "kudus", "cilacap",
    "tiga roda", "3 roda", "tiga-roda", "3-roda",
    "gresik", "semen gresik", "semen-gresik",
    "holcim", "semen holcim", "semen-holcim",
    "scg", "semen scg", "semen-scg",
    "padang", "semen padang", "semen-padang",
    "merah putih", "semen merah putih",
    "cibinong", "semen cibinong",
    "baturaja", "semen baturaja",
    "bosowa", "semen bosowa",
    "tonasa", "semen tonasa",
    "master", "besi master",
    "intan", "besi intan",
    "handuk", "besi handuk",
    "krakatau steel", "krakatau-steel", "ks",
    "gunung garuda", "gunung-garuda",
    "hanil", "jeka",
    "danagri", "magic", "aquaproof", "no drop", "no-drop",
    "nodrop", "aqua proof",
    "icera", "ardena", "milano", "asia tile", "asia-tile",
    "indograha", "kian", "eleganza", "elegan"
  ];

  var OBJECT_WORDS = [
    "tanah", "lahan", "badan", "permukaan", "dasar", "area",
    "bidang", "tapak", "kavling", "petak",
    "drainase", "geotekstil", "pondasi", "saluran", "gorong",
    "aspal", "pipa", "kabel", "tiang", "dinding", "gorong-gorong",
    "jembatan", "tanggul", "embung", "waduk", "bendungan",
    "beton", "cor", "besi", "baja", "kayu", "batu", "bata",
    "keramik", "granit", "marmer", "paving", "genteng",
    "rumah", "gedung", "ruko", "gudang", "pabrik",
    "jalan", "trotoar", "selokan",
    "bukit", "gunung", "sungai", "rawa", "gambut",
    "lereng", "tebing", "jurang", "lembah",
    "pile", "pancang", "strauss", "bore",
    "kolom", "balok", "plat", "slab", "pelat",
    "lantai", "plafon", "atap", "kusen",
    "septic", "septic tank", "resapan", "sumur",
    "tangga",
    "kamar", "kamar mandi", "kamar tidur",
    "dapur", "toilet", "wc",
    "ruang", "ruang tamu", "ruang makan", "ruang keluarga", "ruang kerja", "ruang tidur",
    "teras", "balkon", "fasad", "halaman", "carport", "garasi",
    "taman", "halaman depan", "halaman belakang",
    "kantor", "toko", "cafe", "restoran", "hotel",
    "apartemen", "showroom", "klinik", "mall", "sekolah",
    "rukan", "kios", "warung", "pujasera",
    "wallpaper", "parket", "laminasi", "vinyl",
    "wpc", "hpl", "grc", "acp",
    "pagar", "pintu", "jendela", "railing", "rolling door",
    "shower box", "tralis", "jeruji", "kanopi", "awning",
    "spandek", "alderon", "genteng metal",
    "wall", "wallpanel", "wall-panel", "moulding", "wall-moulding",
    "cornice", "plinth", "skirting", "wainscoting", "backdrop",
    "feature-wall", "feature wall", "ceiling", "drop-ceiling",
    "partisi", "sekat", "cladding", "facade", "facade-panel",
    "panel-dinding", "dinding-panel",
    "ac", "air conditioner", "cctv", "listrik", "instalasi listrik",
    "air", "pipa air", "plumbing", "gas", "panel-listrik",
    "travo", "trafo", "internet", "jaringan", "alarm",
    "kamera", "sensor", "detector", "detektor",
    "antena", "parabola", "wifi", "router", "cctv-kamera",
    "signage", "logo", "spanduk", "banner", "billboard",
    "neonbox", "neon box", "letter timbul", "huruf timbul",
    "papan nama", "plang", "reklame", "papan reklame",
    "kaca tempered", "kaca-polos", "kaca-bermotif", "kaca-buram",
    "kaca-es", "kaca-panasap", "aluminium-composite",
    "aluminium foil", "kaca-film", "kaca-jendela"
  ];

  var BASE_ENTITY_OBJECTS = [
    "beton", "batu", "kayu", "besi", "baja",
    "rumah", "gedung", "jalan",
    "keramik", "granit", "marmer", "vinyl", "wallpaper",
    "parket", "laminasi", "wpc", "hpl", "grc", "acp",
    "bata", "paving", "genteng", "kaca"
  ];

  var GENERIC_OBJECTS = [
    "tanah", "lahan", "bukit", "gunung", "sungai", "rawa",
    "gambut", "lereng", "tebing", "jurang", "lembah"
  ];

  var BASE_ENTITY_OBJECTS_SET = {};
  (function() {
    for (var i = 0; i < BASE_ENTITY_OBJECTS.length; i++) {
      BASE_ENTITY_OBJECTS_SET[BASE_ENTITY_OBJECTS[i]] = true;
    }
  })();

  var GENERIC_OBJECTS_SET = {};
  (function() {
    for (var i = 0; i < GENERIC_OBJECTS.length; i++) {
      GENERIC_OBJECTS_SET[GENERIC_OBJECTS[i]] = true;
    }
  })();

  var MATERIAL_SERVICE_NAMES = [
    "semen", "pasir", "batu split", "kerikil", "besi", "baja", "kayu",
    "keramik", "granit", "marmer", "gypsum", "plafon", "paving",
    "bata", "batako", "hebel", "genteng", "asbes", "atap",
    "baja ringan", "galvalum", "precast", "pracetak", "readymix",
    "beton", "cor", "kaca", "aluminium", "pipa"
  ];

  var CROSS_ENTITY_SPECS = {
    jasa: {
      sharedFinishing: PURE_FINISHING,
      sharedGaya: ["minimalis", "modern", "klasik", "custom", "elegan", "mewah", "eksklusif", "premium"],
      foreignTechniques: [
        "waterproofing", "grouting", "shotcrete", "guniting", "dewatering",
        "scaffolding", "bekisting", "formwork", "curing",
        "boring", "welding", "coating", "plating", "anodizing",
        "polishing", "sandblasting", "painting", "lining",
        "topping off", "lean concrete", "soil test",
        "sondir test", "cross hole", "bore pile test",
        "building maintenance", "home renovation", "waterproofing solution"
      ]
    },
    produk: {
      sharedMaterialFinishing: ["galvanis", "zincalume", "coating", "berlapis", "cat"],
      sharedMaterialDimensi: ["tebal", "panjang", "lebar", "diameter"]
    },
    material: {
      extendedTypes: [
        "silika", "zeolit", "cor", "tembaga", "aluminium", "foil",
        "kuningan", "perunggu", "titanium", "grafit", "karbon"
      ]
    },
    sewa: {
      extendedUnits: ["hp", "ps", "kva", "psi", "rpm", "inch", "inchi", "kw"],
      extendedTools: [
        "motor grader", "wheel loader", "tower crane", "asphalt finisher",
        "asphalt paver", "tandem roller", "pneumatic tire roller",
        "cold milling", "batching plant", "concrete pump",
        "genset", "pompa air", "pompa-beton", "compressor", "jack hammer"
      ]
    },
    desain: {
      extendedColors: [
        "earth tone", "sage green", "sage", "dusty pink", "dusty",
        "terracotta", "navy blue", "mustard", "olive", "mauve",
        "charcoal", "cream", "ivory", "beige", "taupe", "greige"
      ],
      extendedGaya: [
        "bali modern", "java etnik", "minimalis tropis", "kolonial modern",
        "industrial rustic", "scandinavian japandi", "modern klasik",
        "minimalis skandinavia", "japandi minimalis",
        "classic modern", "modern farmhouse", "boho industrial",
        "javanese modern", "balinese contemporary", "traditional modern",
        "ethnic modern", "modern etnik", "tribal modern"
      ],
      subjektif: ["mewah", "eksklusif", "premium", "luxury", "high end", "artistik", "estetik"]
    }
  };

  var PRODUK_SPECS = {
    mutu: ["k225", "k250", "k300", "k350", "k400", "k500", "fc", "sni", "standar", "premium", "ekonomis"],
    finishing: ["polos", "motif", "bermotif", "bercorak", "tekstur", "serat", "halus", "kasar", "matte", "glossy", "doff", "gloss", "satin", "anyaman", "natural", "ekspos", "custom", "polosan", "cat", "coating", "lapisan", "vernis", "anti gores", "anti air", "anti jamur", "ulir"],
    dimensi: ["ukuran", "dimensi", "spesifikasi", "tipe", "model", "varian", "seri", "tinggi", "rendah", "panjang", "pendek", "lebar", "sempit", "tebal", "tipis", "dalam", "dangkal", "diameter", "radius", "besar", "kecil", "sedang", "mini", "jumbo"],
    warna: ["putih", "hitam", "abu-abu", "merah", "biru", "kuning", "hijau", "coklat", "netral", "warm", "cool", "pastel", "dark", "light", "krem", "maroon", "navy", "forest", "gold", "silver", "bronze", "copper", "rose gold", "teal", "turquoise", "lavender", "magenta", "coral", "salmon", "peach", "mint"],
    gaya: ["minimalis", "modern", "klasik", "skandinavia", "japandi", "industrial",
         "kontemporer", "tradisional", "rustic", "bohemian"]
  };

  var PURE_PRODUK_SPECS = PRODUK_SPECS.mutu
  .concat(PRODUK_SPECS.warna)
  .concat(PRODUK_SPECS.finishing)
  .concat(PRODUK_SPECS.gaya);

  var MATERIAL_SPECS = {
    grade: ["grade a", "grade b", "grade c", "sni", "standar", "kualitas 1", "kualitas 2", "kualitas 3", "kelas 1", "kelas 2", "kelas 3"],
    finishing: ["ulir", "polos", "galvanis", "berlapis", "cat", "coating", "anyaman", "anti karat", "anti korosi", "anti air", "diamon", "rough", "smooth", "textured", "zincalume"],
    dimensi: ["tebal", "panjang", "lebar", "diameter", "radius", "ukuran", "dimensi", "ketebalan", "kedalaman", "tinggi"],
    berat: ["kg", "ton", "m3", "liter", "gram", "ons"],
    tipe: MATERIAL_TYPE_WORDS
  };

  var PURE_MATERIAL_SPECS = MATERIAL_SPECS.grade
    .concat(MATERIAL_SPECS.finishing)
    .concat(MATERIAL_SPECS.tipe);

  var SEWA_SPECS = {
    tipe: ["mini", "besar", "kecil", "sedang", "medium", "heavy", "standar", "extra", "ekstra", "jumbo", "compact", "full size", "large"],
    merek: ["pc75", "pc200", "pc300", "pc350", "pc400", "komatsu", "hitachi", "caterpillar", "cat", "volvo", "hyundai", "doosan", "kobelco", "sumitomo", "case", "jcb", "liebherr", "kubota", "yanmar", "perkins", "cummin"],
    kapasitas: ["ton", "m3", "kg", "liter", "galon", "hp", "ps", "kva", "psi", "rpm", "kw", "inch", "inchi"],
    kondisi: ["baru", "bekas", "servis", "recondition", "rebuilt", "ready", "siap pakai", "prima", "baik", "layak", "standar",
              "listrik", "diesel", "bensin", "solar", "hydraulic", "manual"],
    durasi: ["harian", "mingguan", "bulanan", "tahunan", "per jam", "per hari", "per minggu", "per bulan", "short term", "long term"]
  };

  var PURE_SEWA_SPECS = SEWA_SPECS.merek
    .concat(SEWA_SPECS.tipe)
    .concat(SEWA_SPECS.kondisi)
    .concat(SEWA_SPECS.durasi)
    .concat(SEWA_SPECS.kapasitas)
    .concat(CROSS_ENTITY_SPECS.sewa.extendedTools)
    .concat(CROSS_ENTITY_SPECS.sewa.extendedUnits);

  var JASA_SPECS = {
    metode: ["manual", "hidrolik", "auger", "rotary", "percussive", "dry", "wet", "basah", "kering"],
    skala: ["rumahan", "komersial", "industri", "residential", "commercial", "industrial", "kecil", "sedang", "besar", "menengah"],
    finishing: ["polos", "motif", "bermotif", "bercorak", "tekstur", "serat", "halus", "kasar", "matte", "glossy", "doff", "gloss", "satin", "anyaman", "natural", "ekspos", "custom", "polosan", "cat", "coating", "lapisan", "vernis"],
    kedalaman: ["m", "meter", "cm", "centimeter", "feet", "ft"],
    foreign: CROSS_ENTITY_SPECS.jasa.foreignTechniques
  };

  var DESAIN_SPECS = {
    gaya: [
      "modern", "minimalis", "klasik", "tradisional", "kontemporer", "elegan", "luxury", "industrial", "scandinavian", "jepang", "rustic", "vintage", "bohemian", "art deco", "mid century", "victorian", "gothic", "renaissance", "baroque", "rococo", "neoklasik", "art nouveau", "bauhaus", "postmodern", "dekonstruksi", "high tech", "eklektik", "transisi", "tropis", "mediterania", "kolonial", "peranakan", "balinese", "javanese",
      "japandi", "coastal", "new york", "hampton", "farmhouse",
      "shabby chic", "parisian", "moroccan", "brutalist", "cottage core",
      "grand millennial", "tropical modern", "contemporary", "industrial chic",
      "minimalism", "classic", "modern classic", "streamline",
      "boho chic", "mid-century", "memphis", "cyberpunk", "steampunk",
      "neofuturism", "biophilic", "wabi sabi", "zen", "feng shui"
    ].concat(CROSS_ENTITY_SPECS.desain.extendedGaya),
    warna: [
      "putih", "hitam", "abu-abu", "merah", "biru", "kuning", "hijau", "coklat", "netral", "warm", "cool", "pastel", "dark", "light", "krem", "maroon", "navy", "forest", "gold", "silver", "bronze", "copper", "rose gold", "teal", "turquoise", "lavender", "magenta", "coral", "salmon", "peach", "mint"
    ].concat(CROSS_ENTITY_SPECS.desain.extendedColors),
    material: ["kayu", "besi", "kaca", "marmer", "granit", "keramik", "plafon", "gypsum", "pvc", "acp", "vinyl", "wpc", "grc", "hpl", "bambu", "rotan", "anyaman", "kain", "kulit", "karpet", "parket", "ubin", "batu alam", "batu bata", "beton ekspos"],
    konsep: ["open space", "split level", "loft", "studio", "apartment", "villa", "tiny house", "smart home", "eco home", "sustainable", "green building", "biophilic", "zen", "feng shui", "vastu", "wabi sabi"],
    furniture: ["minimalis", "skandinavia", "jepang", "klasik", "modern", "retro", "vintage", "industrial", "rustic", "bohemian", "mid century", "art deco", "contemporary"],
    subjektif: CROSS_ENTITY_SPECS.desain.subjektif
  };

  var PURE_DESAIN_SPECS = DESAIN_SPECS.gaya
    .concat(DESAIN_SPECS.warna)
    .concat(DESAIN_SPECS.material)
    .concat(DESAIN_SPECS.konsep)
    .concat(DESAIN_SPECS.furniture)
    .concat(DESAIN_SPECS.subjektif);

  var SUB_PILLAR_2_KEYWORDS = ['daftar', 'jenis', 'macam', 'kategori', 'tipe', 'list', 'katalog', 'variasi', 'model', 'gaya', 'varian'];
  var SUB_PILLAR_1_KEYWORDS = ['perbandingan', 'vs', 'versus', 'kelebihan', 'kekurangan', 'perbedaan', 'lebih baik', 'unggul', 'mana yang', 'antara', 'atau'];
  var SUB_PILLAR_1_STRONG = ['perbandingan', 'vs', 'versus', 'kelebihan', 'kekurangan', 'perbedaan', 'lebih baik', 'unggul', 'mana yang'];
  var SUB_PILLAR_1_WEAK = ['antara', 'atau'];

  var HIGH_VOLUME_WORDS = ["promo", "diskon", "obral", "cuci gudang", "flash sale",
                           "termurah", "termahal"];

  var INTENT_TRIGGERS = {
    transactional: ["beli", "order", "pesan", "booking", "sewa sekarang", "harga", "biaya", "tarif", "estimasi", "promo", "diskon", "bayar", "cicilan", "kredit", "dapatkan", "pesan sekarang", "resmi", "authorized", "ready stock", "siap pakai", "cara order", "cara pesan", "cara beli"],
    informational: ["cara", "tutorial", "panduan", "tips", "langkah", "bagaimana", "apa itu", "pengertian", "definisi", "contoh", "jenis", "perbedaan", "kelebihan", "kekurangan", "manfaat", "fungsi", "berapa", "apa yang", "mengapa", "kenapa", "kapan", "dimana", "siapa", "yang mana", "apakah", "update terbaru", "informasi terbaru", "kabar terbaru"],
    commercial: ["review", "testimoni", "rekomendasi", "terbaik", "paling", "vs", "versus", "perbandingan", "alternatif", "pilihan", "populer", "favorit", "unggulan", "ulasan", "pengalaman", "rating", "penilaian", "terburuk", "terpopuler", "terfavorit"],
    navigational: ["login", "daftar", "kontak", "tentang", "hubungi", "alamat", "lokasi", "maps", "direksi"]
  };

  var SEMANTIC_CLUSTERS = {
    "konstruksi": ["bangunan", "proyek", "infrastruktur", "pembangunan", "developer", "kontraktor"],
    "desain": ["interior", "arsitektur", "estetika", "fungsional", "layout", "denah"],
    "material": ["semen", "besi", "baja", "kayu", "keramik", "granit", "marmer", "hebel"],
    "jasa": ["kontraktor", "tukang", "borongan", "renovasi", "instalasi", "service"],
    "sewa": ["rental", "excavator", "bulldozer", "crane", "alat berat", "diesel"],
    "produk": ["precast", "readymix", "pracetak", "siap pakai", "custom"]
  };

  var COMMERCIAL_WORDS = [
    'jual', 'beli', 'order', 'pesan', 'booking',
    'supplier', 'distributor', 'toko', 'shop',
    'dapatkan', 'pesan sekarang', 'order sekarang',
    'beli sekarang', 'checkout',
    'cara order', 'cara pesan', 'cara beli', 'cara booking',
    'resmi', 'authorized', 'official', 'distributor resmi', 'dealer resmi',
    'agen resmi', 'mitra resmi', 'sertifikat resmi',
    'ready stock', 'ready stok', 'siap pakai', 'siap kirim',
    'stok tersedia', 'fast respon', 'same day', 'instan'
  ];

  var INFORMATIONAL_WORDS = [
    'butuh', 'cari', 'mau', 'ingin',
    'panduan', 'cara', 'tips', 'tutorial',
    'pengertian', 'definisi', 'penjelasan',
    'kenapa', 'mengapa', 'bagaimana',
    'berapa', 'apa itu', 'apa yang', 'kapan', 'dimana', 'siapa',
    'yang mana', 'apakah', 'adakah', 'apa beda', 'apa perbedaan',
    'update terbaru', 'informasi terbaru', 'kabar terbaru', 'update'
  ];

  var TIER_1_LOCATION = [
    "jakarta", "jakarta pusat", "jakarta barat", "jakarta selatan", "jakarta timur", "jakarta utara",
    "bogor", "depok", "tangerang", "bekasi", "bandung", "karawang", "purwakarta", "cikarang",
    "subang", "cirebon", "semarang", "solo", "surakarta", "pekalongan", "tegal", "magelang",
    "sukoharjo", "boyolali", "klaten", "jogja", "yogyakarta", "surabaya", "malang", "kediri",
    "gresik", "sidoarjo", "mojokerto", "pasuruan", "probolinggo", "jember", "banyuwangi", "madiun",
    "medan", "palembang", "pekanbaru", "padang", "lampung", "batam", "aceh", "jambi", "bengkulu",
    "pontianak", "balikpapan", "samarinda", "banjarmasin", "makassar", "manado", "palu", "kendari",
    "bali", "denpasar", "gianyar", "tabanan", "bangli", "karangasem", "klungkung", "buleleng",
    "mataram", "kupang"
  ];

  var FISIK_WORDS = [
    "pantai", "taman", "sungai", "gunung", "jalan", "pasar",
    "sekolah", "masjid", "gereja", "mall", "terminal", "stasiun",
    "bandara", "pelabuhan", "sawah", "hutan", "danau", "lembah",
    "bukit", "kali", "dermaga", "lapangan", "kantor", "pabrik",
    "gudang", "warung", "restoran", "cafe", "hotel", "villa",
    "klinik", "puskesmas", "apotek", "bank", "atm", "pos"
  ];

  var LOCATION_WORDS = TIER_1_LOCATION;

  var PRICE_HEAD_WORDS = [
    'harga', 'biaya', 'tarif', 'estimasi', 'ongkos', 'budget',
    'fee', 'rate', 'price', 'cost', 'pricelist', 'price-list'
  ];

  var PROMO_MODIFIER_WORDS = [
    'murah', 'hemat', 'terjangkau', 'promo', 'diskon', 'obral',
    'sale', 'termurah', 'termahal', 'bersaing', 'kompetitif',
    'dibawah pasaran', 'diatas pasaran', 'pasaran', 'ekonomis'
  ];

  var PRICE_WORDS = PRICE_HEAD_WORDS;

  var NOISE_WORDS_UNIVERSAL = [
    'borongan',
    'sistem borongan',
    'borongan penuh', 'borongan sebagian',
    'paket borongan', 'sistem paket', 'sistem paket borongan',
    'all in', 'all-in', 'all in one',
    'cash', 'kredit', 'cicilan', 'tunai', 'transfer',
    'dp', 'lunas', 'termin', 'kontan',
    'installment', 'debit', 'cod', 'cash on delivery',
    'paylater', 'pay later',
    'bayar di tempat', 'bayar di awal', 'bayar di akhir',
    'pembayaran',
    'ready', 'preorder', 'pre-order', 'indent', 'po'
  ];

  var NOISE_WORDS_JASA = [
    'meteran', 'sistem meteran',
    'sistem harian', 'sistem mingguan', 'sistem bulanan', 'sistem tahunan',
    'per proyek', 'per paket', 'per pekerjaan',
    'short term', 'long term',
    'per area', 'per zona', 'per ruangan', 'per lantai',
    'per hari kerja', 'per jam kerja', 'per shift',
    'per tongkang',
    'per rit', 'per ritase'
  ];

  // ═══ FIX-P6: Precompile regex noise words ═══
  var _NOISE_UNIV_REGEX = new RegExp("\\b(" + NOISE_WORDS_UNIVERSAL.map(function(w){
    return w.replace(/\s+/g, '\\s+');
  }).join("|") + ")\\b", 'g');

  var _NOISE_JASA_REGEX = new RegExp("\\b(" + NOISE_WORDS_JASA.map(function(w){
    return w.replace(/\s+/g, '\\s+');
  }).join("|") + ")\\b", 'g');

  var ACTION_VERBS = [
    "pemotongan", "pemotong", "memotong", "potong", "potongan",
    "penggalian", "penggali", "menggali", "gali", "galian",
    "pengurugan", "pengurug", "mengurug", "urug", "urugan",
    "pengangkutan", "pengangkut", "mengangkut", "angkut", "angkutan",
    "pengeboran", "pengebor", "mengebor", "bor", "boran",
    "pengelasan", "pengelas", "mengelas", "las", "lasan",
    "pengecoran", "pengecor", "mengecor", "cor", "coran",
    "pengecatan", "pengecat", "mengecat", "cat", "catan",
    "pengukuran", "pengukur", "mengukur", "ukur", "ukuran",
    "pemasangan", "pemasang", "memasang", "pasang", "pasangan",
    "pembongkaran", "pembongkar", "membongkar", "bongkar", "bongkaran",
    "pembuatan", "pembuat", "membuat", "buat", "buatan",
    "pengupasan", "pengupas", "mengupas", "upas", "upasan",
    "pemadatan", "pemadat", "memadatkan", "padat", "padatan",
    "pengerukan", "pengeruk", "mengeruk", "keruk", "kerukan",
    "pemancangan", "pemancang", "memancang", "pancang", "pancangan",
    "pembersihan", "pembersih", "membersihkan", "bersih", "bersihan",
    "perataan", "perata", "meratakan", "rata", "rataan",
    "pembentukan", "pembentuk", "membentuk", "bentuk", "bentukan",
    "persiapan", "persiap", "mempersiapkan", "siap", "siapan",
    "stabilisasi", "stabilis", "menstabilkan", "stabil",
    "cut", "fill", "grading", "elevasi", "pemetaan",
    "tebang", "menebang", "penebangan",
    "pindah", "pemindahan", "timbun", "penimbunan",
    "renovasi", "merenovasi",
    "perbaikan", "memperbaiki",
    "instalasi", "menginstal", "install",
    "service", "servis", "menyervis",
    "penggantian", "mengganti", "ganti",
    "pemeliharaan", "memelihara", "rawat", "perawatan",
    "pengadaan", "menyediakan",
    "relief", "profil", "finishing", "cutting", "bongkar", "buang",
    "uji", "perkuatan", "pematangan"
  ];

  var SYNTAX_CONJUNCTIONS = ["dan", "serta", "juga", "dengan", "tanpa"];
  var SYNTAX_PREPOSITIONS = ["di", "ke", "dari", "untuk", "pada", "dalam", "atas", "bawah"];

  function checkHasSpecification(text, entityType) {
    if (!text) return false;
    var lower = text.toLowerCase();
    var entityOnly = ENTITY_ONLY_WORDS[entityType] || [];

    if (checkHasPerUnit(text)) { log('🔬 SPEC: per unit', 'VARIANT'); return true; }

    if (entityType === "produk") {
      var mutuList = ENTITY_SPECIFIC.produk.mutu || [];
      for (var i = 0; i < mutuList.length; i++) {
        if (new RegExp("\\b" + mutuList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return mutuList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var finishingList = SHARED_MODIFIERS.finishing || [];
      for (var i = 0; i < finishingList.length; i++) {
        if (new RegExp("\\b" + finishingList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return finishingList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      if (/\d+\s*(m|mm|cm|meter|kg|ton|inch|inci|ft|feet)/gi.test(lower)) return true;
      if (/\d+\s*[x×]\s*\d+\s*(cm|m|meter|mm)/gi.test(lower)) return true;
      var warnaList = SHARED_MODIFIERS.warna || [];
      for (var i = 0; i < warnaList.length; i++) {
        if (new RegExp("\\b" + warnaList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return warnaList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var gayaList = SHARED_MODIFIERS.gaya || [];
      for (var i = 0; i < gayaList.length; i++) {
        if (new RegExp("\\b" + gayaList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return gayaList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var sharedMatFin = CROSS_ENTITY_SPECS.produk.sharedMaterialFinishing || [];
      for (var i = 0; i < sharedMatFin.length; i++) {
        if (new RegExp("\\b" + sharedMatFin[i] + "\\b", "i").test(lower)) {
          log('🎯 CROSS-SPEC: produk + ' + sharedMatFin[i], 'CROSSSPEC');
          return true;
        }
      }

      var materialModifiers = SHARED_MODIFIERS.material || [];
      for (var i = 0; i < materialModifiers.length; i++) {
        if (new RegExp("\\b" + materialModifiers[i] + "\\b", "i").test(lower)) {
          log('🔥 FIX v15: produk + material=' + materialModifiers[i], 'CROSSSPEC');
          return true;
        }
      }

      var textNoBaseB = lower;
      var baseListB = ENTITY_BASE_NAMES.produk || [];
      for (var biB = 0; biB < baseListB.length; biB++) {
        textNoBaseB = textNoBaseB.replace(
          new RegExp("\\b" + baseListB[biB].replace(/\s+/g, '\\s+') + "\\b", 'g'),
          ' '
        );
      }
      for (var atB = 0; atB < APPLICATION_TARGETS_FULL.length; atB++) {
        if (new RegExp("\\b" + APPLICATION_TARGETS_FULL[atB] + "\\b", "i").test(textNoBaseB)) {
          log('🔥 FIX v15: produk + target=' + APPLICATION_TARGETS_FULL[atB], 'CROSSSPEC');
          return true;
        }
      }

      if (/\d+\s*[x×]\s*\d+(?:\s*[x×]\s*\d+)?/i.test(lower)) {
        log('🔬 PRODUK dimension multi-layer', 'VARIANT');
        return true;
      }
    }

    if (entityType === "material") {
      var gradeList = MATERIAL_SPECS.grade || [];
      for (var i = 0; i < gradeList.length; i++) {
        if (new RegExp("\\b" + gradeList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return gradeList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var finishingList = SHARED_MODIFIERS.finishing || [];
      for (var i = 0; i < finishingList.length; i++) {
        if (new RegExp("\\b" + finishingList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return finishingList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      if (/\d+\s*(mm|cm|m|meter|kg|ton|m3|liter)/gi.test(lower)) return true;
      var beratList = MATERIAL_SPECS.berat || [];
      for (var i = 0; i < beratList.length; i++) {
        if (new RegExp("\\b" + beratList[i] + "\\b", "i").test(lower)) return true;
      }
      var tipeList = ENTITY_SPECIFIC.material.tipe_extended || [];
      for (var i = 0; i < tipeList.length; i++) {
        if (new RegExp("\\b" + tipeList[i].replace(/\s+/g, '\\s+') + "\\b", "i").test(lower)) {
          log('🧱 MATERIAL tipe: ' + tipeList[i], 'MATTYPE');
          return true;
        }
      }
      var extTypes = CROSS_ENTITY_SPECS.material.extendedTypes || [];
      for (var i = 0; i < extTypes.length; i++) {
        if (new RegExp("\\b" + extTypes[i] + "\\b", "i").test(lower)) {
          return true;
        }
      }
      if (/\d+\s*[x×]\s*\d+(?:\s*[x×]\s*\d+)?/i.test(lower)) {
        return true;
      }
    }

    if (entityType === "sewa") {
      var merekList = ENTITY_SPECIFIC.sewa.merek || [];
      for (var i = 0; i < merekList.length; i++) {
        if (new RegExp("\\b" + merekList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return merekList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var tipeList = ENTITY_SPECIFIC.sewa.tipe || [];
      for (var i = 0; i < tipeList.length; i++) {
        if (new RegExp("\\b" + tipeList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return tipeList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      if (/\d+\s*(ton|m3|kg|liter)/gi.test(lower)) return true;
      var kondisiList = ENTITY_SPECIFIC.sewa.kondisi || [];
      for (var i = 0; i < kondisiList.length; i++) {
        if (new RegExp("\\b" + kondisiList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return kondisiList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var durasiList = ENTITY_SPECIFIC.sewa.durasi || [];
      for (var i = 0; i < durasiList.length; i++) {
        if (new RegExp("\\b" + durasiList[i] + "\\b", "i").test(lower)) return true;
      }
      var extUnits = CROSS_ENTITY_SPECS.sewa.extendedUnits || [];
      for (var i = 0; i < extUnits.length; i++) {
        if (new RegExp("\\d+\\s*" + extUnits[i] + "\\b", "i").test(lower)) return true;
      }
      var extTools = CROSS_ENTITY_SPECS.sewa.extendedTools || [];
      for (var i = 0; i < extTools.length; i++) {
        if (new RegExp("\\b" + extTools[i].replace(/\s+/g, '\\s+') + "\\b", "i").test(lower)) return true;
      }
      var kapasitasList = SEWA_SPECS.kapasitas || [];
      for (var i = 0; i < kapasitasList.length; i++) {
        if (new RegExp("\\d+\\s*" + kapasitasList[i] + "\\b", "i").test(lower)) return true;
      }
    }

    if (entityType === "jasa") {
      var subCat = detectJasaSubCategory(text, "jasa");
      var domainConstraints = DOMAIN_CONSTRAINTS[subCat] || DOMAIN_CONSTRAINTS["default"];
      var forbiddenCats = domainConstraints.forbidden_categories || [];

      var metodeList = ENTITY_SPECIFIC.jasa.metode || [];
      for (var i = 0; i < metodeList.length; i++) {
        if (new RegExp("\\b" + metodeList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return metodeList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }

      var skalaList = ENTITY_SPECIFIC.jasa.skala || [];
      for (var i = 0; i < skalaList.length; i++) {
        if (new RegExp("\\b" + skalaList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return skalaList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }

      if (forbiddenCats.indexOf("finishing") === -1) {
        var finishingList = SHARED_MODIFIERS.finishing || [];
        for (var i = 0; i < finishingList.length; i++) {
          if (new RegExp("\\b" + finishingList[i] + "\\b", "i").test(lower)) {
            var isEntityOnly = entityOnly.some(function(w) { return finishingList[i] === w; });
            if (!isEntityOnly) return true;
          }
        }
      } else {
        log('🚫 FIX v16-E: SKIP finishing untuk subCat=' + subCat, 'DOMAIN');
      }

      if (/\d+\s*(m|meter|cm|centimeter|feet|ft)/gi.test(lower)) {
        var hasEntityWord = JASA_WORDS.some(function(w) { return lower.indexOf(w) !== -1; });
        if (hasEntityWord) return true;
      }

      var foreignList = CROSS_ENTITY_SPECS.jasa.foreignTechniques || [];
      for (var i = 0; i < foreignList.length; i++) {
        if (new RegExp("\\b" + foreignList[i].replace(/\s+/g, '\\s+') + "\\b", "i").test(lower)) return true;
      }

      if (forbiddenCats.indexOf("gaya") === -1) {
        var sharedGaya = CROSS_ENTITY_SPECS.jasa.sharedGaya || [];
        for (var i = 0; i < sharedGaya.length; i++) {
          if (new RegExp("\\b" + sharedGaya[i] + "\\b", "i").test(lower)) return true;
        }
      }

      var tipeAspal = ENTITY_SPECIFIC.jasa.tipe_aspal || [];
      for (var i = 0; i < tipeAspal.length; i++) {
        if (new RegExp("\\b" + tipeAspal[i] + "\\b", "i").test(lower)) return true;
      }

      if (/\d+\s*[x×]\s*\d+(?:\s*[x×]\s*\d+)?/i.test(lower)) {
        var hasJasaAction180 = ACTION_VERBS.some(function(w) {
          return lower.indexOf(w) !== -1;
        });
        if (hasJasaAction180) {
          log('🔬 FIX 180: JASA dimensi multi-layer tanpa unit', 'VARIANT');
          return true;
        }
      }
    }

    if (entityType === "desain") {
      var gayaList = ENTITY_SPECIFIC.desain.gaya_extended || [];
      for (var i = 0; i < gayaList.length; i++) {
        if (new RegExp("\\b" + gayaList[i].replace(/\s+/g, '\\s+') + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return gayaList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var sharedGayaD = SHARED_MODIFIERS.gaya || [];
      for (var i = 0; i < sharedGayaD.length; i++) {
        if (new RegExp("\\b" + sharedGayaD[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return sharedGayaD[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var warnaList = ENTITY_SPECIFIC.desain.warna_extended || [];
      for (var i = 0; i < warnaList.length; i++) {
        if (new RegExp("\\b" + warnaList[i].replace(/\s+/g, '\\s+') + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return warnaList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var sharedWarnaD = SHARED_MODIFIERS.warna || [];
      for (var i = 0; i < sharedWarnaD.length; i++) {
        if (new RegExp("\\b" + sharedWarnaD[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return sharedWarnaD[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var konsepList = ENTITY_SPECIFIC.desain.konsep || [];
      for (var i = 0; i < konsepList.length; i++) {
        if (new RegExp("\\b" + konsepList[i].replace(/\s+/g, '\\s+') + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return konsepList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var materialList = ENTITY_SPECIFIC.desain.material || [];
      for (var i = 0; i < materialList.length; i++) {
        if (new RegExp("\\b" + materialList[i].replace(/\s+/g, '\\s+') + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return materialList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var furnitureList = ENTITY_SPECIFIC.desain.furniture || [];
      for (var i = 0; i < furnitureList.length; i++) {
        if (new RegExp("\\b" + furnitureList[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return furnitureList[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
      var subjektifList = ENTITY_SPECIFIC.desain.subjektif || [];
      for (var i = 0; i < subjektifList.length; i++) {
        if (new RegExp("\\b" + subjektifList[i] + "\\b", "i").test(lower)) return true;
      }

      var tipeListDesain = ENTITY_SPECIFIC.desain.tipe || [];
      for (var i = 0; i < tipeListDesain.length; i++) {
        if (new RegExp("\\b" + tipeListDesain[i] + "\\b", "i").test(lower)) {
          var isEntityOnly = entityOnly.some(function(w) { return tipeListDesain[i] === w; });
          if (!isEntityOnly) return true;
        }
      }
    }

    var textNoBase = lower;
    var baseList212 = ENTITY_BASE_NAMES[entityType] || [];
    for (var bi212 = 0; bi212 < baseList212.length; bi212++) {
      textNoBase = textNoBase.replace(
        new RegExp("\\b" + baseList212[bi212].replace(/\s+/g, '\\s+') + "\\b", 'g'),
        ' '
      );
    }
    for (var at212 = 0; at212 < APPLICATION_TARGETS_FULL.length; at212++) {
      if (new RegExp("\\b" + APPLICATION_TARGETS_FULL[at212] + "\\b", "i").test(textNoBase)) {
        log('🎯 FIX 212: application target = spec: ' + APPLICATION_TARGETS_FULL[at212], 'CROSSSPEC');
        return true;
      }
    }

    if (/\d+\s*(kg|ton|m|cm|mm|m3|liter|kva|psi|hp|inch|k)\b/i.test(lower)) {
      log('🔬 FIX v15-E: universal unit detected', 'VARIANT');
      return true;
    }
    if (/\d+\s*[x×]\s*\d+(?:\s*[x×]\s*\d+)?/i.test(lower)) {
      log('🔬 FIX v15-E: universal dimension detected', 'VARIANT');
      return true;
    }

    return false;
  }

  function detectEntityTypeFromText(text) {
    if (!text) return null;
    var lower = text.toLowerCase();

    if (/\bjasa\s+(desain|interior|arsitektur|eksterior)\b/i.test(lower)) {
      log('🎯 FIX 134: "jasa desain" → entity=desain', 'DETECT');
      return "desain";
    }

    if (/^(cara|panduan|tips|tutorial|langkah|apa itu|pengertian|definisi|perbedaan|perbandingan|review)/i.test(lower.trim())) {
      log('🎯 FIX 132: Artikel priority (how-to prefix)', 'DETECT');
      return "artikel";
    }

    for (var i = 0; i < ENTITY_PRIORITY.length; i++) {
      var entity = ENTITY_PRIORITY[i];
      var triggers = ENTITY_TRIGGERS[entity] || [];
      for (var j = 0; j < triggers.length; j++) {
        if (lower.indexOf(triggers[j]) !== -1) return entity;
      }
    }

    if (lower.indexOf("jasa") !== -1 || lower.indexOf("kontraktor") !== -1 || lower.indexOf("tukang") !== -1) return "jasa";
    if (lower.indexOf("sewa") !== -1 || lower.indexOf("rental") !== -1) return "sewa";
    if (lower.indexOf("desain") !== -1 || lower.indexOf("interior") !== -1) return "desain";
    if (lower.indexOf("material") !== -1 || lower.indexOf("bahan") !== -1) return "material";
    if (lower.indexOf("produk") !== -1 || lower.indexOf("jual") !== -1) return "produk";

    for (var m = 0; m < MATERIAL_WORDS.length; m++) {
      if (new RegExp("\\b" + MATERIAL_WORDS[m] + "\\b", "i").test(lower)) {
        log('🎯 FIX 202: entity=material via word: ' + MATERIAL_WORDS[m], 'DETECT');
        return "material";
      }
    }
    for (var s = 0; s < SEWA_WORDS.length; s++) {
      if (new RegExp("\\b" + SEWA_WORDS[s] + "\\b", "i").test(lower)) {
        log('🎯 FIX 202: entity=sewa via word: ' + SEWA_WORDS[s], 'DETECT');
        return "sewa";
      }
    }
    for (var p = 0; p < PRODUK_WORDS.length; p++) {
      if (new RegExp("\\b" + PRODUK_WORDS[p] + "\\b", "i").test(lower)) {
        log('🎯 FIX 202: entity=produk via word: ' + PRODUK_WORDS[p], 'DETECT');
        return "produk";
      }
    }
    for (var d = 0; d < DESAIN_WORDS.length; d++) {
      if (new RegExp("\\b" + DESAIN_WORDS[d] + "\\b", "i").test(lower)) {
        log('🎯 FIX 202: entity=desain via word: ' + DESAIN_WORDS[d], 'DETECT');
        return "desain";
      }
    }

    var hasJasaVerbSignal = /\b(jasa|pasang|borongan|tukang|bongkar|gali|urug|cor|bor|coring|renovasi|perbaikan|instalasi|service|servis|bangun|las|grouting|cutting|drilling|sandblasting|pancang|pemancangan|pengecoran|pengeboran)\b/i.test(lower);
    var hasProdukTxSignal = /\b(harga|jual|beli|supplier|distributor|ready|stok|stock|unit|batang|lembar|keping)\b/i.test(lower);

    if (hasJasaVerbSignal && !hasProdukTxSignal) {
      var jasaNamesRL = ENTITY_BASE_NAMES.jasa || [];
      for (var jnRL = 0; jnRL < jasaNamesRL.length; jnRL++) {
        if (lower.indexOf(jasaNamesRL[jnRL]) !== -1) {
          log('🎯 FIX SEO v6: priority resolver → jasa (verb signal via "' +
              jasaNamesRL[jnRL] + '")', 'DETECT');
          return "jasa";
        }
      }
    }

    var bestMatchRL = { entity: null, length: 0, name: null, priority: 99 };
    for (var epRL = 0; epRL < ENTITY_PRIORITY.length; epRL++) {
      var entRL = ENTITY_PRIORITY[epRL];
      if (!ENTITY_BASE_NAMES[entRL]) continue;
      var namesRL = ENTITY_BASE_NAMES[entRL];
      for (var nRL = 0; nRL < namesRL.length; nRL++) {
        var nameRL = namesRL[nRL];
        if (lower.indexOf(nameRL) === -1) continue;
        var isBetterRL = false;
        if (nameRL.length > bestMatchRL.length) {
          isBetterRL = true;
        } else if (nameRL.length === bestMatchRL.length && epRL < bestMatchRL.priority) {
          isBetterRL = true;
        }
        if (isBetterRL) {
          bestMatchRL = {
            entity: entRL,
            length: nameRL.length,
            name: nameRL,
            priority: epRL
          };
        }
      }
    }

    if (bestMatchRL.entity) {
      var matchName = bestMatchRL.name;

      var entitiesForBaseName = [];
      for (var entScan in ENTITY_BASE_NAMES) {
        if (!ENTITY_BASE_NAMES.hasOwnProperty(entScan)) continue;
        var baseListScan = ENTITY_BASE_NAMES[entScan];
        for (var bsScan = 0; bsScan < baseListScan.length; bsScan++) {
          if (baseListScan[bsScan] === matchName) {
            entitiesForBaseName.push(entScan);
            break;
          }
        }
      }

      log('🔀 FIX #4: base "' + matchName + '" ditemukan di entity: [' +
          entitiesForBaseName.join(', ') + ']', 'CROSS');

      if (entitiesForBaseName.length >= 2) {
        var hasProdukCtx = /\b(harga|jual|beli|supplier|distributor|ready|stok|stock|unit|batang|lembar|keping|ukuran|dimensi|spesifikasi|mutu|k\d+|fc|sni|grade|ton|kg|m3|per kubik|per batang|per lembar)\b/i.test(lower);
        var hasJasaCtx = /\b(jasa|pasang|borongan|tukang|pemancangan|pengeboran|pancang|bor|pile|bongkar|gali|urug|cor|las|bending|cutting|coring|grouting|renovasi|perbaikan|instalasi|service|servis|bangun|pembuatan|pemasangan|pengerjaan|proyek)\b/i.test(lower);
        var hasSewaCtx = /\b(sewa|rental|rent|harian|mingguan|bulanan|tahunan|operator|self drive|lepas kunci)\b/i.test(lower);
        var hasDesainCtx = /\b(desain|gambar|render|visualisasi|3d|2d|animasi|walkthrough|konsep|layout)\b/i.test(lower);

        log('🔀 FIX #4: ctx → produk=' + hasProdukCtx +
            ' jasa=' + hasJasaCtx + ' sewa=' + hasSewaCtx +
            ' desain=' + hasDesainCtx, 'CROSS');

        if (hasDesainCtx && entitiesForBaseName.indexOf('desain') !== -1 && !hasJasaCtx && !hasProdukCtx) {
          log('🎯 FIX #4: ambiguous "' + matchName + '" → desain (context)', 'DETECT');
          return "desain";
        }
        if (hasSewaCtx && entitiesForBaseName.indexOf('sewa') !== -1 && !hasProdukCtx) {
          log('🎯 FIX #4: ambiguous "' + matchName + '" → sewa (context)', 'DETECT');
          return "sewa";
        }
        if (hasJasaCtx && hasProdukCtx) {
          log('🎯 FIX #4: ambiguous "' + matchName + '" → jasa (jasa+produk ctx, jasa menang)', 'DETECT');
          return "jasa";
        }
        if (hasJasaCtx && entitiesForBaseName.indexOf('jasa') !== -1) {
          log('🎯 FIX #4: ambiguous "' + matchName + '" → jasa (verb ctx)', 'DETECT');
          return "jasa";
        }
        if (hasProdukCtx && entitiesForBaseName.indexOf('produk') !== -1) {
          log('🎯 FIX #4: ambiguous "' + matchName + '" → produk (tx ctx)', 'DETECT');
          return "produk";
        }

        var priorityOrder = ["jasa", "sewa", "desain", "produk", "material", "artikel"];
        for (var po = 0; po < priorityOrder.length; po++) {
          if (entitiesForBaseName.indexOf(priorityOrder[po]) !== -1) {
            log('🎯 FIX #4: ambiguous "' + matchName + '" → ' + priorityOrder[po] +
                ' (fallback priority)', 'DETECT');
            return priorityOrder[po];
          }
        }
      }

      log('🎯 FIX SEO v6: longest match → ' + bestMatchRL.entity +
          ' (via "' + bestMatchRL.name + '", ' + bestMatchRL.length + ' char)',
          'DETECT');
      return bestMatchRL.entity;
    }

    return null;
  }

  function detectEntityType(userEntityType) {
    if (userEntityType && VALID_ENTITY_TYPES.indexOf(userEntityType) !== -1) return userEntityType;
    return detectEntityTypeFromText(getPageText() + " " + getH1Text());
  }

  function detectSubPillar(text) {
    var lower = text.toLowerCase();

    for (var i = 0; i < SUB_PILLAR_2_KEYWORDS.length; i++) {
      if (lower.indexOf(SUB_PILLAR_2_KEYWORDS[i]) !== -1) return "sub-pillar-tipe-2";
    }

    for (var i = 0; i < SUB_PILLAR_1_STRONG.length; i++) {
      if (lower.indexOf(SUB_PILLAR_1_STRONG[i]) !== -1) return "sub-pillar-tipe-1";
    }

    for (var i = 0; i < SUB_PILLAR_1_WEAK.length; i++) {
      var weakWord = SUB_PILLAR_1_WEAK[i];
      if (lower.indexOf(weakWord) !== -1) {
        var parts = lower.split(new RegExp("\\b" + weakWord + "\\b"));
        if (parts.length >= 2) {
          var left = parts[0].trim();
          var right = parts[1].trim();
          if (left.split(/\s+/).length >= 2 && right.split(/\s+/).length >= 2) {
            log('📋 FIX 147: SP1 weak context OK: "' + weakWord + '"', 'SPECPHRASE');
            return "sub-pillar-tipe-1";
          } else {
            log('📋 FIX 147: SP1 weak context DITOLAK (sisi < 2 kata)', 'SPECPHRASE');
          }
        }
      }
    }

    return null;
  }

  function detectPillar(text, entityType) {
    var cleanLower = text.toLowerCase().trim();
    for (var entity in ENTITY_PILLAR_NAMES) {
      if (!ENTITY_PILLAR_NAMES.hasOwnProperty(entity)) continue;
      var patterns = ENTITY_PILLAR_NAMES[entity];
      for (var i = 0; i < patterns.length; i++) {
        if (cleanLower === patterns[i]) {
          var isEntityMatch = entity === entityType || (entity === "produk interior" && entityType === "produk");
          if (isEntityMatch) { log('🏛️ PILLAR', 'PILLAR'); return true; }
        }
      }
    }
    return false;
  }

  function hasTechnicalSpec(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    var TECHNICAL_SPECS = ["k225", "k250", "k300", "k350", "k400", "k500", "fc", "m6", "m8", "m10", "m12", "m16", "m20", "b0", "b1", "b2", "b3", "sni"];
    for (var i = 0; i < TECHNICAL_SPECS.length; i++) {
      if (new RegExp("\\b" + TECHNICAL_SPECS[i] + "\\b", "i").test(lower)) return true;
    }
    return false;
  }

  function isSubVariant(text, entityType) {
    if (!text) return false;
    var score = 0;
    var lower = text.toLowerCase();

    var fisikRegex;
    if (entityType === "sewa") {
      fisikRegex = /\d+\s*(m|mm|cm|meter|ton|m3)\b/gi;
    } else {
      fisikRegex = /\d+\s*(m|mm|cm|meter|kg|ton|inch|inci)\b/gi;
    }
    if ((lower.match(fisikRegex) || []).length >= 1) score += 2;

    if ((lower.match(/\d+(?:\.\d+)?\s*(?:cm|mm|m|meter)\s*(?:x|×)\s*\d+(?:\.\d+)?\s*(?:cm|mm|m|meter)/gi) || []).length >= 1) score += 3;
    if (/\d+\s*[x×]\s*\d+\s*[x×]\s*\d+/gi.test(lower)) score += 3;

    var uniqueNumbers = (text.match(/\d+/g) || []).filter(function(v, i, a) { return a.indexOf(v) === i; });
    if (uniqueNumbers.length >= 2) score += 1;
    if (/\bukuran\s+\d+/.test(lower)) score += 2;
    if (/\bdimensi\s+\d+/.test(lower)) score += 2;
    if (/\b(tebal|panjang|lebar|tinggi|dalam|diameter)\s+\d+/.test(lower)) score += 2;
    return score >= 2;
  }

  function getCoreWords(text, entityType) {
    if (!text) return [];
    var coreText = text.toLowerCase();
    coreText = normalizeVerbVariations(coreText);

    var moneyWords = ['harga', 'biaya', 'tarif', 'estimasi', 'ongkos',
                      'bersaing', 'kompetitif', 'pasaran', 'murah', 'hemat', 'terjangkau'];
    for (var i = 0; i < moneyWords.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + moneyWords[i] + "\\b", 'g'), '');
    }

    // FIX-P6: pakai precompiled regex untuk noise words
    _NOISE_UNIV_REGEX.lastIndex = 0;
    coreText = coreText.replace(_NOISE_UNIV_REGEX, ' ');

    if (entityType === "jasa") {
      _NOISE_JASA_REGEX.lastIndex = 0;
      coreText = coreText.replace(_NOISE_JASA_REGEX, ' ');
    }

    var entityOnlyWords = ENTITY_ONLY_WORDS[entityType] || [];
    for (var i = 0; i < entityOnlyWords.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + entityOnlyWords[i] + "\\b", 'g'), ' ');
    }

    var hasConjunction = /\b(atau|dan|serta)\b/i.test(coreText);
    if (entityType && ENTITY_BASE_NAMES[entityType] && !hasConjunction) {
      var baseNamesEarly = ENTITY_BASE_NAMES[entityType] || [];
      var baseNamesSet = {};
      for (var k = 0; k < baseNamesEarly.length; k++) {
        baseNamesSet[baseNamesEarly[k]] = true;
      }
      for (var i = 0; i < baseNamesEarly.length; i++) {
        var bn = baseNamesEarly[i];
        var bnWords = bn.split(' ');
        var lastWord = bnWords[bnWords.length - 1];
        if (bnWords.length >= 2 && APPLICATION_TARGETS.indexOf(lastWord) !== -1) {
          var baseWithoutTarget = bnWords.slice(0, -1).join(' ');
          if (baseNamesSet[baseWithoutTarget]) {
            log('🔥 FIX 170: SKIP "' + bn + '" (sub-base "' + baseWithoutTarget + '" covers it)', 'CORE');
            continue;
          }
        }
        coreText = coreText.replace(new RegExp("\\b" + bn.replace(/\s+/g, '\\s+') + "\\b", 'g'), ' ');
      }
    }

    if (entityType === "jasa") {
      for (var i = 0; i < COMMON_JASA_WORDS.length; i++) {
        coreText = coreText.replace(new RegExp("\\b" + COMMON_JASA_WORDS[i] + "\\b", 'g'), ' ');
      }
    }
    var stopwords = ["dan", "atau", "serta", "yang", "dari", "ke", "di", "untuk", "dengan", "ini", "itu", "akan", "telah", "sudah", "masih", "pada", "oleh", "karena", "sehingga", "setelah", "sebelum"];
    for (var i = 0; i < stopwords.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + stopwords[i] + "\\b", 'g'), ' ');
    }
    for (var i = 0; i < TIER_1_LOCATION.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + TIER_1_LOCATION[i] + "\\b", 'g'), ' ');
    }
    var subPillarWords = ['daftar', 'jenis', 'macam', 'kategori', 'tipe', 'list', 'katalog', 'rekomendasi', 'pilihan', 'variasi', 'model', 'gaya', 'varian', 'perbandingan', 'vs', 'versus', 'kelebihan', 'kekurangan', 'perbedaan', 'lebih baik', 'unggul', 'terbaik'];
    for (var i = 0; i < subPillarWords.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + subPillarWords[i] + "\\b", 'g'), ' ');
    }
    for (var i = 0; i < INFORMATIONAL_WORDS.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + INFORMATIONAL_WORDS[i] + "\\b", 'g'), ' ');
    }
    for (var i = 0; i < COMMERCIAL_WORDS.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + COMMERCIAL_WORDS[i] + "\\b", 'g'), ' ');
    }
    for (var i = 0; i < QUESTION_WORDS.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + QUESTION_WORDS[i] + "\\b", 'g'), ' ');
    }
    for (var i = 0; i < COMMERCIAL_INVESTIGATION_WORDS.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + COMMERCIAL_INVESTIGATION_WORDS[i] + "\\b", 'g'), ' ');
    }
    for (var i = 0; i < SPEC_PHRASE_WORDS.length; i++) {
      coreText = coreText.replace(new RegExp("\\b" + SPEC_PHRASE_WORDS[i].replace(/\s+/g, '\\s+') + "\\b", 'g'), ' ');
    }

    var fisikRole = checkFisikRole(coreText);
    if (fisikRole !== "object") {
      for (var i = 0; i < FISIK_WORDS.length; i++) {
        coreText = coreText.replace(new RegExp("\\b" + FISIK_WORDS[i] + "\\b", 'g'), ' ');
      }
    }
    coreText = coreText.replace(/\b(dekat|sekitar|berdekatan|terdekat|near|around|disekitar|didekat)\b/g, ' ');
    // FIX-P6: pakai precompiled regex
    _SATUAN_UNITS_PER_REGEX.lastIndex = 0;
    coreText = coreText.replace(_SATUAN_UNITS_PER_REGEX, ' ');
    var coreWords = coreText.split(/\s+/).filter(function(w) { return w.length > 2; });
    var uniqueWords = [];
    var seen = {};
    for (var i = 0; i < coreWords.length; i++) {
      var w = coreWords[i];
      if (!seen[w]) { seen[w] = true; uniqueWords.push(w); }
    }
    return uniqueWords;
  }

  function detectVariantByPattern(text, entityType) {
    if (!text) return { isVariant: false, score: 0, reasons: [] };
    var score = 0;
    var reasons = [];
    var specResult = checkHasSpecification(text, entityType);
    if (specResult) {
      var isPureTech = checkPureTechnicalSpec(text, entityType);
      if (isPureTech) {
        var actualLayers = countModifierLayers(text, entityType);
        log('🔥 FIX #2: pureTech=true, actualLayers=' + actualLayers, 'VARIANT');

        if (actualLayers >= 3) {
          reasons.push("Pure tech spec + 3+ layers");
          return { isVariant: true, score: 10, reasons: reasons, level: "sub-variant" };
        }
        if (actualLayers === 2) {
          reasons.push("Pure tech spec + 2 layers");
          return { isVariant: true, score: 8, reasons: reasons, level: "variant" };
        }
        if (actualLayers === 1) {
          reasons.push("Pure tech spec + 1 layer");
          return { isVariant: true, score: 6, reasons: reasons, level: "money-page" };
        }
        reasons.push("Pure tech spec tapi 0 layer");
        return { isVariant: false, score: 3, reasons: reasons };
      }
    }
    return { isVariant: score >= 3, score: score, reasons: reasons };
  }

  function detectVariantLevel(text, entityType) {
    if (isSubVariant(text, entityType)) return "sub-variant";
    if (hasTechnicalSpec(text)) return "variant";
    var result = detectVariantByPattern(text, entityType);
    if (result.isVariant) {
      if (result.level) {
        log('🔥 FIX #1c: detectVariantLevel → ' + result.level + ' (dari result.level)', 'VARIANT');
        return result.level;
      }
      return "variant";
    }
    return null;
  }

  function getFactors(text, entityType) {
    return {
      hasLocation: isLocation(text),
      hasSpec: checkHasSpecification(text, entityType),
      hasPrice: checkHasPrice(text),
      hasCommercial: checkHasCommercial(text, entityType),
      hasSpecPhrase: checkHasSpecPhrase(text),
      hasInfoSpecPhrase: checkHasInformationalSpecPhrase(text),
      hasPerUnit: checkHasPerUnit(text),
      fisikRole: checkFisikRole(text),
      hasCompoundAction: checkCompoundAction(text),
      complexityScore: calculateComplexityScore(text, entityType),
      hasBaseService: checkHasBaseService(text)
    };
  }

  function getSEOContext(text, entityType) {
    if (!text) {
      return {
        hasQuestion: false, hasCommercialInvestigation: false,
        hasPerUnit: false, hasAuthority: false, hasReadyStock: false,
        hasSpecPhrase: false, hasCompoundAction: false,
        fisikRole: "none", complexityScore: 0,
        freeContext: { isInfo: false, isComm: false },
        intent: 'informational',
        intentDetail: { dominant: 'informational', confidence: 'low' }
      };
    }
    var hasQuestion = checkHasQuestionWord(text);
    var hasCommInvest = checkHasCommercialInvestigation(text);
    var hasPerUnit = checkHasPerUnit(text);
    var hasAuthority = checkHasAuthority(text);
    var hasReadyStock = checkHasReadyStock(text);
    var hasSpecPhrase = checkHasSpecPhrase(text);
    var hasCompound = checkCompoundAction(text);
    var fisikRole = checkFisikRole(text);
    var complexityScore = calculateComplexityScore(text, entityType);
    var freeContext = checkFreeContext(text);
    var intent = 'informational';
    var intentDetail = detectIntent(text);
    if (intentDetail.dominant === 'transactional') intent = 'transactional';
    else if (intentDetail.dominant === 'commercial' || hasCommInvest) intent = 'commercial-investigation';
    else if (hasQuestion && !hasReadyStock && !hasAuthority) intent = 'informational';
    else if (intentDetail.dominant === 'informational') intent = 'informational';
    return {
      hasQuestion: hasQuestion, hasCommercialInvestigation: hasCommInvest,
      hasPerUnit: hasPerUnit, hasAuthority: hasAuthority, hasReadyStock: hasReadyStock,
      hasSpecPhrase: hasSpecPhrase, hasCompoundAction: hasCompound,
      fisikRole: fisikRole, complexityScore: complexityScore,
      freeContext: freeContext, intent: intent, intentDetail: intentDetail
    };
  }

  function detectPageLevel(userOptions) {
    if (isHomePage()) return "home";
    var text = getPageText();
    var entityType = detectEntityType(userOptions && userOptions.userEntityType);
    log('📝 TEXT: "' + text + '"', "INFO");
    log('🏷️ ENTITY: ' + (entityType || '(null)'), "INFO");
    if (detectPillar(text, entityType)) { log('🏛️ PILLAR', "SUCCESS"); return "pillar"; }
    var level = detectMoneyLevelInternal(text, entityType);
    if (!level) { log('⚠️ Level null', 'WARN'); level = "money-page"; }
    log('🎯 FINAL: ' + level, 'SUCCESS');
    return level;
  }

  function extractSlugFromInput(input) {
    if (!input) return "";
    var slug = "";
    try {
      var url = new URL(input);
      var pathname = url.pathname.replace(/\.html$/, "").replace(/\.htm$/, "").replace(/\/$/, "");
      var segments = pathname.split("/").filter(Boolean);
      slug = segments[segments.length - 1] || "";
    } catch (e) { slug = input; }
    slug = slug.replace(/^\d{4}-\d{2}-/, "").replace(/^\d{4}-/, "").replace(/^\d{2}-/, "").replace(/^\d{4}/, "").replace(/^\d+-/, "").replace(/^\d+/, "");
    slug = slug.replace(/-/g, " ");
    return cleanText(slug);
  }

  function detectPageLevelFromDOM(entityType) {
    if (typeof window === 'undefined' || !window.location) return null;
    if (isHomePage()) return "home";
    var urlText = getPageText();
    var h1Text = getH1Text();
    var urlIsGeneric = /^(blog|post|artikel|produk|layanan|service|item|page|p|home|index|\d+)(\s+\d+)?\s*$/i.test(urlText.trim());
    var text;
    if (urlIsGeneric && h1Text && h1Text.length > 3) text = h1Text;
    else if (!urlText || urlText.length < 3) text = h1Text;
    else if (h1Text && h1Text.length > 3) text = urlText + " " + h1Text;
    else text = urlText;
    var entity = entityType || detectEntityType();
    if (detectPillar(text, entity)) return "pillar";
    var level = detectMoneyLevelInternal(text, entity);
    if (!level) level = "money-page";
    return level;
  }

  function validateForPrompt(input, entityType, options) {
    options = options || {};
    var strictMode = options.strict !== false;
    var inputSlug = extractSlugFromInput(input);
    if (!inputSlug) return { status: "DITOLAK", error: "Input tidak valid", valid: false };
    var inputEntity = entityType || detectEntityTypeFromText(inputSlug);
    var inputLevel = detectPageLevelForPrompt(inputSlug, inputEntity);
    var inputFactors = getFactors(inputSlug, inputEntity);
    var browserLevel = null, browserEntity = null, browserFactors = null, browserAvailable = false;
    try {
      if (typeof window !== 'undefined' && window.location) {
        browserLevel = detectPageLevelFromDOM(inputEntity);
        browserEntity = detectEntityType();
        if (browserLevel !== null && browserLevel !== undefined) {
          browserFactors = getFactors(getPageText(), browserEntity);
          browserAvailable = true;
        }
      }
    } catch (e) {}
    var crossValidation = {
      pageLevel: {
        input: inputLevel, browser: browserLevel,
        status: (browserAvailable && inputLevel === browserLevel) ? "SAMA" : (!browserAvailable ? "BROWSER_UNAVAILABLE" : "BERBEDA")
      }
    };
    var finalStatus = "LOLOS";
    var errors = [], warnings = [];
    var finalLevel = inputLevel;
    var finalEntity = inputEntity;
    if (crossValidation.pageLevel.status === "BERBEDA") {
      if (strictMode) { finalStatus = "PERBAIKI"; errors.push("Level beda"); }
      else warnings.push("Level beda");
      finalLevel = browserLevel;
    }
    return {
      phase: 4, status: finalStatus, valid: finalStatus === "LOLOS",
      error: errors.length > 0 ? errors.join("; ") : null, warnings: warnings,
      pld: { input: { pageLevel: inputLevel, entityType: inputEntity, factors: inputFactors, text: inputSlug } },
      crossValidation: crossValidation,
      final: {
        pageLevel: finalLevel, entityType: finalEntity,
        levelNum: TYPE_LEVEL_MAP[finalLevel] || -1,
        source: crossValidation.pageLevel.status === "SAMA" ? "INPUT_AND_BROWSER" : "INPUT_ONLY"
      }
    };
  }

  function detectUpwardFromSlug(slug, domain) {
    if (!slug) return { upward: [], breadcrumbs: [] };
    var words = slug.split(" ");
    var upward = [], breadcrumbs = [];
    var currentSlug = slug.replace(/ /g, "-");
    var baseDomain = domain || "https://" + (typeof window !== 'undefined' ? window.location.hostname : "");
    if (baseDomain.endsWith("/")) baseDomain = baseDomain.slice(0, -1);
    if (words.length >= 2) {
      var p1Words = words.slice(0, -1);
      var p1Label = p1Words.join(" ");
      var p1Slug = p1Words.join("-");
      breadcrumbs.push({ position: 1, label: p1Label, slug: p1Slug, url: baseDomain + "/" + p1Slug + ".html", isParent: true });
      upward.push({ position: 1, label: p1Label, slug: p1Slug, url: baseDomain + "/" + p1Slug + ".html", isParent: true });
    }
    if (words.length >= 3) {
      var p2Words = words.slice(0, -2);
      var p2Label = p2Words.join(" ");
      var p2Slug = p2Words.join("-");
      breadcrumbs.push({ position: 2, label: p2Label, slug: p2Slug, url: baseDomain + "/" + p2Slug + ".html", isParent: true });
      upward.push({ position: 2, label: p2Label, slug: p2Slug, url: baseDomain + "/" + p2Slug + ".html", isParent: true });
    }
    breadcrumbs.push({ position: breadcrumbs.length + 1, label: slug, slug: currentSlug, url: baseDomain + "/" + currentSlug + ".html", isCurrent: true });
    return { upward: upward, breadcrumbs: breadcrumbs };
  }

  function detectParentLevelFromSlug(slug, entityType, domain) {
    if (!slug) return [];
    var words = slug.split(" ");
    var parents = [];
    var entity = entityType || detectEntityTypeFromText(slug);
    var baseDomain = domain || "https://" + (typeof window !== 'undefined' ? window.location.hostname : "");
    if (baseDomain.endsWith("/")) baseDomain = baseDomain.slice(0, -1);
    if (words.length >= 2) {
      var p1Words = words.slice(0, -1);
      var p1Label = p1Words.join(" ");
      var p1Slug = p1Words.join("-");
      parents.push({ position: 1, label: p1Label, slug: p1Slug, url: baseDomain + "/" + p1Slug + ".html", level: detectPageLevelForPrompt(p1Label, entity) });
    }
    if (words.length >= 3) {
      var p2Words = words.slice(0, -2);
      var p2Label = p2Words.join(" ");
      var p2Slug = p2Words.join("-");
      parents.push({ position: 2, label: p2Label, slug: p2Slug, url: baseDomain + "/" + p2Slug + ".html", level: detectPageLevelForPrompt(p2Label, entity) });
    }
    return parents;
  }

  function detectForPromptFull(input, entityType, domain) {
    if (!input) return { pageLevel: 'unknown', isValid: false, error: 'Input kosong', upward: [], breadcrumbs: [] };
    var slug = extractSlugFromInput(input);
    if (!slug) return { pageLevel: 'unknown', isValid: false, error: 'Slug kosong', upward: [], breadcrumbs: [] };
    var entity = entityType || detectEntityTypeFromText(slug);
    var level = detectPageLevelForPrompt(slug, entity);
    var factors = getFactors(slug, entity);
    var upwardData = detectUpwardFromSlug(slug, domain);
    var seoWarnings = detectConjunctionWarning(slug, level);
    var hierarchyWarnings = detectHierarchyWarning(slug, entity);
    var breadcrumbWarnings = validateBreadcrumbHierarchy(slug, entity);
    var parentDrivenWarnings = validateParentDrivenHierarchy(slug, entity);
    var sameLevelWarnings = detectSameLevelContentWarning(slug, entity);
    var allWarnings = seoWarnings.concat(hierarchyWarnings)
                                .concat(breadcrumbWarnings)
                                .concat(parentDrivenWarnings)
                                .concat(sameLevelWarnings);
    return {
      pageLevel: level, entityType: entity, factors: factors, text: slug,
      levelNum: TYPE_LEVEL_MAP[level] || -1,
      isValid: VALID_LEVELS.indexOf(level) !== -1,
      upward: upwardData.upward, breadcrumbs: upwardData.breadcrumbs,
      parents: detectParentLevelFromSlug(slug, entity, domain),
      seoWarnings: allWarnings
    };
  }

  function detectForPrompt(input, entityType) {
    if (!input) return { pageLevel: 'unknown', isValid: false, error: 'Input kosong' };
    var slug = extractSlugFromInput(input);
    if (!slug) return { pageLevel: 'unknown', isValid: false, error: 'Slug kosong' };
    var entity = entityType || detectEntityTypeFromText(slug);
    var level = detectPageLevelForPrompt(slug, entity);
    var factors = getFactors(slug, entity);
    var seoContext = getSEOContext(slug, entity);
    var seoWarnings = detectConjunctionWarning(slug, level);
    var hierarchyWarnings = detectHierarchyWarning(slug, entity);
    var breadcrumbWarnings = validateBreadcrumbHierarchy(slug, entity);
    var parentDrivenWarnings = validateParentDrivenHierarchy(slug, entity);
    var sameLevelWarnings = detectSameLevelContentWarning(slug, entity);
    var allWarnings = seoWarnings.concat(hierarchyWarnings)
                                .concat(breadcrumbWarnings)
                                .concat(parentDrivenWarnings)
                                .concat(sameLevelWarnings);
    return {
      pageLevel: level, entityType: entity, factors: factors, text: slug,
      levelNum: TYPE_LEVEL_MAP[level] || -1,
      isValid: VALID_LEVELS.indexOf(level) !== -1,
      seoContext: seoContext,
      seoWarnings: allWarnings
    };
  }

  function detectForPromptSync(input, entityType) {
    return detectForPrompt(input, entityType);
  }

  function detectForPromptWithUpward(input, entityType, domain) { return detectForPromptFull(input, entityType, domain); }
  function detectBreadcrumbsFromSlug(slug, domain) { return detectUpwardFromSlug(slug, domain).breadcrumbs; }
  function detectParentFromSlug(slug, domain) { return detectUpwardFromSlug(slug, domain).upward; }

  function detectPageLevelWithAI(text, entityType) {
    var pldLevel = detectPageLevelForPrompt(text, entityType);
    var confidence = calculatePLDConfidence(text, entityType, pldLevel);

    if (confidence >= CONFIG.AI_CONFIDENCE_THRESHOLD || !CONFIG.AI_ENABLED) {
      return Promise.resolve({
        pageLevel: pldLevel,
        source: "PLD_RULE",
        confidence: confidence,
        reason: "Rule-based"
      });
    }

    return callAIProxy(text, entityType).then(function(aiResult) {
      if (aiResult && aiResult.pageLevel) {
        return {
          pageLevel: aiResult.pageLevel,
          source: aiResult.source || "AI_PROXY",
          confidence: aiResult.confidence || 85,
          reason: aiResult.reason || "AI classification",
          pldFallback: pldLevel,
          pldConfidence: confidence
        };
      }
      return {
        pageLevel: pldLevel,
        source: "PLD_RULE",
        confidence: confidence,
        reason: "Rule-based (AI unavailable)"
      };
    });
  }

  function detectForPromptWithAI(input, entityType) {
    var pldResult = detectForPrompt(input, entityType);
    return detectPageLevelWithAI(pldResult.text, entityType).then(function(aiResult) {
      if (aiResult.source !== "PLD_RULE") {
        pldResult.pageLevel = aiResult.pageLevel;
        pldResult.aiEnhanced = true;
        pldResult.aiSource = aiResult.source;
        pldResult.aiConfidence = aiResult.confidence;
        pldResult.aiReason = aiResult.reason;
        pldResult.pldFallback = aiResult.pldFallback;
      } else {
        pldResult.aiEnhanced = false;
        pldResult.aiConfidence = aiResult.confidence;
      }
      return pldResult;
    });
  }

  function detectIntent(text) {
    if (!text) return { dominant: "informational", scores: {}, confidence: "low" };
    var lower = text.toLowerCase();
    var scores = { transactional: 0, informational: 0, commercial: 0, "commercial-investigation": 0, navigational: 0 };
    for (var intent in INTENT_TRIGGERS) {
      if (!INTENT_TRIGGERS.hasOwnProperty(intent)) continue;
      var triggers = INTENT_TRIGGERS[intent];
      for (var i = 0; i < triggers.length; i++) {
        if (lower.indexOf(triggers[i]) !== -1) scores[intent] += 1;
      }
    }
    var ciWords = COMMERCIAL_INVESTIGATION_WORDS;
    for (var i = 0; i < ciWords.length; i++) {
      if (lower.indexOf(ciWords[i]) !== -1) scores["commercial-investigation"] += 1;
    }
    var maxScore = 0, dominantIntent = "informational";
    for (var intent in scores) {
      if (!scores.hasOwnProperty(intent)) continue;
      if (scores[intent] > maxScore) { maxScore = scores[intent]; dominantIntent = intent; }
    }
    var confidence = "low";
    if (maxScore >= 3) confidence = "high";
    else if (maxScore >= 2) confidence = "medium";
    return { dominant: dominantIntent, scores: scores, confidence: confidence, maxScore: maxScore };
  }

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX-P1: AUDIT FUNCTIONS — hanya jalan kalau ?debug=1
  // ═══════════════════════════════════════════════════════════
  // PENTING:
  //   - auditBaseNames() = 489 base × countModifierLayers() = ~15 detik di HP
  //   - auditModifierTiers() = O(n²) cross-tier check = ~3-5 detik di HP
  //   - Total bisa ~20 detik HANG di HP mid-range
  //   - Solusi: jangan panggil otomatis, hanya manual via ?debug=1
  // ═══════════════════════════════════════════════════════════

  function auditBaseNames() {
    var bad = [];
    var totalBase = 0;
    Object.keys(ENTITY_BASE_NAMES).forEach(function(ent) {
      ENTITY_BASE_NAMES[ent].forEach(function(bn) {
        totalBase++;
        var layers = countModifierLayers(bn, ent);
        if (layers > 0) {
          bad.push({ ent: ent, base: bn, layers: layers });
        }
      });
    });
    if (bad.length === 0) {
      console.log('✅ FIX v16-G AUDIT PASS: Semua ' + totalBase + ' base name = 0 layer');
    } else {
      console.warn('⚠️ FIX v16-G AUDIT: ' + bad.length + ' / ' + totalBase + ' base name masih punya layer:');
      bad.forEach(function(b) {
        console.warn('  • [' + b.ent + '] "' + b.base + '" → ' + b.layers + ' layer');
      });
    }
    return { total: totalBase, bad: bad.length, details: bad };
  }

  function auditModifierTiers() {
    var report = {
      tier1_count: GLOBAL_NUMERIC_KEYWORDS.length,
      tier2_count: 0,
      tier3_count: 0,
      duplicates_tier2: [],
      duplicates_tier3: [],
      cross_tier_overlap: []
    };

    for (var cat in SHARED_MODIFIERS) {
      if (!SHARED_MODIFIERS.hasOwnProperty(cat)) continue;
      var words = SHARED_MODIFIERS[cat];
      report.tier2_count += words.length;
      var seen = {};
      for (var i = 0; i < words.length; i++) {
        if (seen[words[i]]) {
          report.duplicates_tier2.push({ cat: cat, word: words[i] });
        }
        seen[words[i]] = true;
      }
    }

    for (var ent in ENTITY_SPECIFIC) {
      if (!ENTITY_SPECIFIC.hasOwnProperty(ent)) continue;
      var spec = ENTITY_SPECIFIC[ent];
      for (var key in spec) {
        if (!spec.hasOwnProperty(key)) continue;
        var arr = spec[key];
        report.tier3_count += arr.length;
        var seenT3 = {};
        for (var j = 0; j < arr.length; j++) {
          if (seenT3[arr[j]]) {
            report.duplicates_tier3.push({ entity: ent, cat: key, word: arr[j] });
          }
          seenT3[arr[j]] = true;
        }
      }
    }

    var tier2All = [];
    for (var c in SHARED_MODIFIERS) {
      if (!SHARED_MODIFIERS.hasOwnProperty(c)) continue;
      tier2All = tier2All.concat(SHARED_MODIFIERS[c]);
    }

    // Precompute Set untuk O(1) lookup — hemat ~50.000 comparisons
    var tier2Set = {};
    for (var t2i = 0; t2i < tier2All.length; t2i++) {
      tier2Set[tier2All[t2i]] = true;
    }

    for (var e in ENTITY_SPECIFIC) {
      if (!ENTITY_SPECIFIC.hasOwnProperty(e)) continue;
      var sp = ENTITY_SPECIFIC[e];
      for (var k in sp) {
        if (!sp.hasOwnProperty(k)) continue;
        for (var m = 0; m < sp[k].length; m++) {
          if (tier2Set[sp[k][m]]) {
            report.cross_tier_overlap.push(e + "." + k + ": " + sp[k][m]);
          }
        }
      }
    }

    console.log("═══════════════════════════════════════════════════════════");
    console.log("📊 FIX v16 AUDIT — MODIFIER TIERS + DOMAIN CONSTRAINTS");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("Tier 1 (GLOBAL): " + report.tier1_count);
    console.log("Tier 2 (SHARED): " + report.tier2_count);
    console.log("Tier 3 (SPECIFIC): " + report.tier3_count);
    console.log("Sub-Kategori JASA: " + Object.keys(JASA_SUB_CATEGORIES).length);
    console.log("Domain Constraints: " + Object.keys(DOMAIN_CONSTRAINTS).length);
    console.log("Compatibility Matrix: " + Object.keys(MODIFIER_COMPATIBILITY).length);
    console.log("──────────────────────────────────────────────────────────");
    if (report.duplicates_tier2.length === 0 && report.duplicates_tier3.length === 0) {
      console.log("✅ Tidak ada duplikat dalam tier");
    } else {
      console.warn("⚠️ Duplikat Tier 2: " + report.duplicates_tier2.length);
      console.warn("⚠️ Duplikat Tier 3: " + report.duplicates_tier3.length);
    }
    if (report.cross_tier_overlap.length > 0) {
      console.warn("⚠️ Cross-tier overlap: " + report.cross_tier_overlap.length);
      console.warn("   " + report.cross_tier_overlap.slice(0, 10).join(", "));
    } else {
      console.log("✅ Tidak ada cross-tier overlap");
    }
    console.log("═══════════════════════════════════════════════════════════");
    return report;
  }

  log('🚀 Starting PLD v23.9.7...', 'INFO');

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX-P2: Guard untuk cegah double init
  // ═══════════════════════════════════════════════════════════
  // SEBELUMNYA:
  //   waitForDOM(function() { initializeCore(); });
  //   if (document.readyState === 'complete') {
  //     if (!window.pageLevelDetectorv22) initializeCore();  // ⚠️ BISA 2x!
  //   }
  //
  // SEKARANG: _safeInitializeCore() dengan guard internal
  // ═══════════════════════════════════════════════════════════
  function _safeInitializeCore() {
    if (_CORE_INITIALIZED) return;
    if (window.pageLevelDetectorv22) return;
    initializeCore();
  }

  waitForDOM(function() { _safeInitializeCore(); });
  if (typeof document !== 'undefined' && document.readyState === 'complete') {
    _safeInitializeCore();
  }

  // ═══════════════════════════════════════════════════════════
  // GLOBAL HELPERS
  // ═══════════════════════════════════════════════════════════
  if (typeof window !== "undefined") {
    window.runPLDTestSuite = function() {
      if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.runTestSuite) {
        return window.pageLevelDetectorv22.runTestSuite();
      }
      console.error("❌ PLD belum ready.");
      return null;
    };
    window.auditPLDBase = function() {
      if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.auditBaseNames) {
        return window.pageLevelDetectorv22.auditBaseNames();
      }
      console.error("❌ PLD belum ready.");
      return null;
    };
    window.auditPLDTiers = function() {
      if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.auditModifierTiers) {
        return window.pageLevelDetectorv22.auditModifierTiers();
      }
      console.error("❌ PLD belum ready.");
      return null;
    };
  }

})();  // 🔥 CLOSING IIFE UTAMA


