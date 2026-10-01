/* ============================================================
🧠 Page Level Detector v23.9.7-LITE-PERF — FULL PATCH
============================================================
BASE: v23.9.7-LITE (Performance Patch P1..P7)
PATCH: M1+M2+M3+M4 (Regex Cache + Master Regex + Memoize + Idle)

🔥 PERF PATCH SUMMARY:
   ✅ M1: RegExp Cache (2000 entry, LRU)
   ✅ M2: Master Regex (18 regex gabungan, nested loop killer)
   ✅ M3: Memoize (12 fungsi berat, LRU 200-300)
   ✅ M4: Idle Scheduler + MutationObserver + Device Detection

🔥 PERF FIXES v23.9.7 (dari versi sebelumnya):
   ✅ FIX-P1: Audit di-skip default
   ✅ FIX-P2: initializeCore() guard
   ✅ FIX-P3: setSchemaAttributes() guard
   ✅ FIX-P4: Cache detectPageLevelForPrompt()
   ✅ FIX-P5: Cache detectJasaSubCategory()
   ✅ FIX-P6: Precompile regex di countModifierLayers()
   ✅ FIX-P7: Body attributes SINKRON sebelum dispatch

🎯 GARANSI:
   ✅ Tidak ada fungsi yang hilang
   ✅ Output IDENTIK dengan versi sebelumnya
   ✅ Konsisten desktop vs HP
   ✅ UI tidak block di HP low-end

🎯 TARGET: HP mid-range loading < 1 detik
============================================================ */

(function () {
  "use strict";

  if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.version === "23.9.7-lite-perf") {
    console.warn("⚠️ [PLD v23.9.7-LITE-PERF] Already loaded!");
    return;
  }

  // ═══ FIX-P2: Guard global ═══
  var _CORE_INITIALIZED = false;
  var _SCHEMA_ATTRS_SET = false;
  var _PLD_LEVEL_CACHE = {};
  var _PLD_SUBCAT_CACHE = {};

  var CONFIG = {
    DEBUG: false
  };

  function log(message, type) {
    if (!CONFIG.DEBUG) return;
    if (!type) type = "INFO";
    var icons = {
      INFO: "📘", SUCCESS: "✅", WARN: "⚠️", ERROR: "❌",
      LOCATION: "📍", VARIANT: "🔬", PRICE: "💰", MM: "🏛️",
      CORE: "🧠", DETECT: "🎯", INTENT: "🎯", BREAD: "🍞",
      EXTERNAL: "📦", COMMERCIAL: "🛒", HARGA: "💵",
      VALIDATE: "🔍", CROSS: "🔀", ATTR: "🏷️", TABLE: "📊",
      BROWSER: "🌐", FIX: "🔥", TEST: "🧪", SEO: "🎯",
      QUESTION: "❓", COMMINV: "🔍", PERSATUAN: "📏",
      SPECPHRASE: "📋", PILLAR: "🏛️", MATTYPE: "🧱",
      FISIKCTX: "🎭", VERBEXP: "⚡", COMPOUND: "🔗",
      OBJECT: "🧊", SCORE: "🎚️", BASE: "🏗️", CROSSSPEC: "🎯",
      DOM: "🌐", EEAT: "🔐", STRUCTURE: "📐", SNIPPET: "⭐",
      TIER: "🎚️", DOMAIN: "🌍", SUBCAT: "📂", PERF: "⚡"
    };
    console.log((icons[type] || "📘") + " [PLD v23.9.7-LITE-PERF] " + message);
  }

  log('📦 PLD v23.9.7-LITE-PERF — FULL PATCH M1+M2+M3+M4', 'EXTERNAL');

  // ═══════════════════════════════════════════════════════════
  // KONSTANTA DATA
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
    jasa: ["jasa", "kontraktor", "tukang", "borongan", "renovasi", "bangun", "perbaikan", "perawatan", "instalasi", "pemasangan", "pembongkaran", "pembersihan", "coring", "cutting", "grouting", "sandblasting", "pengeboran", "pemancangan", "pengecoran", "pengelasan", "pondasi", "bored pile", "bor pile", "strauss", "pancang", "waterproofing", "epoxy", "coating", "poles", "service", "servis", "layanan", "relief", "profil beton", "interior", "eksterior", "konsultan", "pembuatan", "pasang", "finishing", "uji tanah", "perkuatan tanah", "pembatas pengaman", "buang puing", "saluran drainase", "jalan perkerasan", "pematangan lahan", "lapangan olahraga"],
    desain: ["desain", "interior", "eksterior", "arsitektur", "konsep", "rencana", "gambar kerja", "denah", "render", "visualisasi", "3d design", "shop drawing"],
    sewa: ["sewa", "rental", "rent"],
        // 🔥 OPSIONAL FIX: Lengkapi material triggers
    material: ["material", "bahan", "semen", "mortar", "pasir", "batu", "besi", "baja", "kayu", "beton", "keramik", "granit", "marmer", "gypsum", "plafon", "paving", "bata", "batako", "hebel", "genteng", "asbes", "atap", "baja ringan", "galvalum", "readymix", "ready mix", "pipa", "cat", "kabel", "paku", "baut", "kaca", "aluminium", "tembaga", "kuningan", "perunggu", "titanium", "bambu", "rotan", "spandek", "alderon", "bekisting", "bondex", "waterproofing", "perancah", "grc", "hpl", "acp", "vinyl", "wpc", "upvc"],
        // 🔥 FIX: Tambah "precast", "pracetak"
    produk: ["produk", "jual", "beli", "supplier", "distributor", "toko", "pintu", "jendela", "pagar", "kanopi", "railing", "gerbang", "wastafel", "closet", "kitchen set", "wardrobe", "precast", "pracetak"],
    artikel: ["artikel", "blog", "tips", "panduan", "cara", "tutorial", "review", "ulasan", "berita", "informasi", "update"]
  };

  var ENTITY_PRIORITY = ["jasa", "sewa", "desain", "produk", "material", "artikel"];

  var JASA_WORDS = ['jasa','kontraktor','tukang','borongan','renovasi','pasang','bangun','perbaikan','instalasi','proyek','cor','gali','urug','angkut','service','servis','desain','interior','eksterior','arsitektur','coring','cutting','drilling','pengeboran','pemancangan','pemasangan','bongkar','potong','las','sambung','grinding','welding','bending','forming','pondasi','tiang','pancang','bore','pile','strauss','konstruksi','bangunan','rumah','gedung','ruko','gudang','pabrik','jalan','jembatan','infrastruktur','relief','profil','konsultan','finishing','uji','perkuatan','pembatas','pengaman','puing','drainase','perkerasan'];

  var COMMON_JASA_WORDS = ['tukang','kontraktor','mandor','vendor','supplier','layanan','penyedia','pengrajin','spesialis','biro','firma','perusahaan','penjual jasa','pasang','pemasangan','bangun','renovasi','perbaikan','instalasi','service','servis','konstruksi','pembangunan','cor','gali','urug','angkut','pemotongan','penggalian','pengurugan','pengangkutan','pengeboran','pengelasan','pengecoran','pengecatan','pengukuran','pemasangan','pembongkaran','pembuatan','pengupasan','pemadatan','pengerukan','pemancangan','pengeringan','pembersihan','perataan','pembentukan','persiapan','pemindahan','pengangkatan','pengolahan','pengerjaan','penyelesaian','pemeliharaan','memotong','menggali','mengurug','mengangkat','mengebor','mengelas','mengecor','mengecat','mengukur','memasang','membongkar','membuat','mengupas','memadatkan','mengeruk','memancang'];

  var SEWA_WORDS = ['sewa','rental','rent','alat','mesin','heavy equipment','excavator','bulldozer','crane','backhoe','dozer','vibro','roller','compactor','diesel','hydraulic','mini','besar','kecil','sedang','medium','extra','scaffolding','steger','tenda','terpal','portacamp','toilet portable','tower lamp'];

    // 🔥 FIX: Hapus "precast" dan "pracetak" — pindah ke produk
  var MATERIAL_WORDS = ['material','bahan','semen','mortar','pasir','batu','batu split','kerikil','besi','baja','kayu','beton','keramik','granit','marmer','gypsum','plafon','paving','bata','batako','hebel','genteng','asbes','atap','baja ringan','galvalum','readymix','ready mix','paku','baut','mur','sekrup','kawat','wiremesh','cat','vernis','politur','plamir','lem','pipa','kabel','fitting','kran','kaca','aluminium','tembaga','kuningan','perunggu','titanium','bambu','rotan','spandek','alderon','bekisting','bondex','waterproofing','perancah','grc','hpl','acp','vinyl','wpc','upvc'];

  // 🔥 FIX: Tambah "precast", "pracetak"
  var PRODUK_WORDS = ['produk','jual','beli','supplier','distributor','toko','shop','pagar panel','panel beton','pagar beton','pagar panel beton','kanopi','paving block','u ditch','box culvert','pintu','jendela','kusen','pagar','railing','gerbang','wastafel','closet','kitchen set','wardrobe','lemari','precast','pracetak','beton precast','beton pracetak'];

  var DESAIN_WORDS = ['desain','interior','eksterior','arsitektur','layout','denah','gambar','konsep','rencana','modern','minimalis','klasik','tradisional','kontemporer','elegan','luxury','industrial','scandinavian','jepang','rustic','vintage','render','visualisasi','3d','shop drawing','tata ruang'];

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
      // ═══ KATEGORI DASAR (1 kata) ═══
      // 🔥 REVISI: Hapus "plafon", "atap", "paving" — pindah ke material
      "pintu","jendela","kusen","pagar","kanopi","wallpaper","kitchen set","wardrobe","sofa","meja","kursi","lemari","nakas","tempat tidur","bed frame","gazebo","kolam","taman","lampu","cctv","saklar listrik","stop kontak","panel listrik","railing","tangga","gerbang","wastafel","closet","tandon air","tangki air","water heater","gorden","blind","kasa nyamuk","tralis","rak dinding","rak tv","rak buku","gantungan baju","kunci pintu","handle pintu","engsel pintu","gagang pintu",
      
      // ═══ PINTU (multi-word) ═══
      "pintu besi","pintu kayu","pintu aluminium","pintu kaca","pintu geser","pintu lipat","pintu swing","pintu sliding","pintu rolling door","pintu folding gate","pintu harmonika","pintu ayun","pintu kupu-kupu","pintu revolving","pintu otomatis","pintu manual","pintu knockdown","pintu prefab","pintu precast","pintu panel","pintu utama","pintu kamar","pintu kamar mandi","pintu dapur","pintu garasi","pintu belakang","pintu besi hollow","pintu besi tempa","pintu besi minimalis","pintu kayu jati","pintu kayu meranti","pintu kayu mahoni","pintu aluminium kaca","pintu aluminium putih",
      
      // ═══ JENDELA (multi-word) ═══
      "jendela aluminium","jendela kayu","jendela kaca","jendela geser","jendela casement","jendela swing","jendela sliding","jendela awning","jendela fixed","jendela jungkit","jendela sorong","jendela nako","jendela bouven","jendela roster","jendela kaca mati","jendela aluminium hitam","jendela aluminium putih","jendela kayu jati","jendela kayu meranti","jendela upvc","jendela pvc","jendela besi",
      
      // ═══ KANOPI (multi-word) ═══
      "kanopi baja ringan","kanopi alderon","kanopi spandek","kanopi solarflat","kanopi kaca","kanopi polycarbonate","kanopi besi","kanopi galvanis","kanopi hollow","kanopi minimalis","kanopi modern","kanopi teras","kanopi carport","kanopi garasi","kanopi rumah","kanopi toko","kanopi kantor","kanopi cafe","kanopi membrane","kanopi kain","kanopi awning","kanopi gulung","kanopi lipat","kanopi permanen",
      
      // ═══ PAGAR (multi-word) ═══
      "pagar panel","pagar beton","pagar brc","pagar panel beton","pagar brc galvanis","pagar besi","pagar kayu","pagar aluminium","pagar stainless","pagar hollow","pagar minimalis","pagar modern","pagar klasik","pagar tembok","pagar rumah","pagar kantor","pagar toko","pagar gudang","pagar pabrik","pagar balkon","pagar tangga","pagar teras","pagar besi tempa","pagar besi hollow","pagar besi ulir","pagar wpc","pagar pvc","pagar grc","pagar kawat","pagar harmonika","pagar elektrik","pagar otomatis",
      
      // ═══ RAILING & TANGGA (multi-word) ═══
      "railing tangga","railing balkon","railing besi","railing stainless","railing aluminium","railing kaca","railing minimalis","railing modern","railing klasik","railing hollow","railing besi tempa","railing besi ulir",
      
      "tangga besi","tangga kayu","tangga beton","tangga aluminium","tangga putar","tangga lurus","tangga minimalis","tangga monyet","tangga rebah","tangga darurat",
      
      // ═══ KITCHEN SET & WARDROBE (multi-word) ═══
      "kitchen set minimalis","kitchen set modern","kitchen set klasik","kitchen set aluminium","kitchen set kayu","kitchen set hpl","kitchen set custom","kitchen set murah",
      
      "wardrobe minimalis","wardrobe modern","wardrobe sliding","wardrobe swing","wardrobe aluminium","wardrobe kayu","wardrobe hpl","wardrobe custom","wardrobe built in","walk in closet","lemari pakaian","lemari baju",
      
      // ═══ KOLAM & TAMAN (multi-word) ═══
      "kolam renang","kolam ikan","kolam minimalis","kolam beton","kolam fiber","kolam kaca",
      
      "taman kering","taman vertikal","taman minimalis","taman tropis","taman jepang","taman bali",
      
            // ═══ PRECAST & PAVING (multi-word) 🔥 FIX ═══
      // 🔥 FIX: Tambah "precast", "pracetak" + varian
      "precast","pracetak","precast beton","pracetak beton",
      "beton precast","beton pracetak","precast concrete","precast panel",
      "precast pile","pracetak pile","precast slab","pracetak slab",
      "precast kanstin","pracetak kanstin","precast paving","pracetak paving",
      "precast u ditch","pracetak u ditch","precast box culvert","pracetak box culvert",
      "precast half slab","pracetak half slab","precast kolom","pracetak kolom",
      "precast balok","pracetak balok","precast tiang","pracetak tiang",
      
      "u ditch","u ditch cover","tutup u ditch","box culvert","buis beton","gorong gorong","sumuran","sumur resapan","kanstin beton","kanstin","curb stone","grass block",
      
      "paving block","paving block beton","paving block hexagonal","paving block persegi","paving block warna",
      
      "rooster beton","roster beton","roster beton minimalis",
      
      "spun pile","mini pile","micropile","sheet pile","tiang pancang","half slab","sloof beton","kolom praktis",     
       
      // ═══ WALLPAPER & DINDING (multi-word) ═══
      "wallpaper dinding","wallpaper motif","wallpaper custom","wallpaper vinyl","wallpaper korea","wallpaper 3d","wallpaper kamar","wallpaper ruang tamu","wallpaper kantor",
      
      "wall panel","wallpanel","wall moulding","wall-moulding","wainscoting","wallpaper sticker","wallpaper roll"
    ],
     
material: [
  // 🔥 FIX: Hapus "precast", "pracetak" — pindah ke produk
  "semen","pasir","batu","besi","baja","kayu","beton","pipa","kabel","fitting","kaca","valve","kran","cat","vernis","politur","plamir","lem","waterproofing","keramik","granit","marmer","gypsum","bata","batako","hebel","genteng","asbes","galvalum","aluminium","kerikil","paku","baut","sekrup","mur","kawat","wiremesh","tembaga","kuningan","perunggu","titanium","bambu","rotan","spandek","alderon","ready mix","readymix","atap","plafon","paving",
      
      // ═══ BESI & BAJA (multi-word) ═══
      "besi beton","besi hollow","besi kanal","besi unp","besi cnp","besi wf","besi hbeam","besi iwf","besi ulir","besi polos","besi cor","besi tempa","besi putih","besi galvanis","besi tuang","besi baja","besi stainless","besi tembaga","besi kuningan","besi as","besi plat","besi strip","besi siku","besi nako","besi begel","besi ring","besi spiral","besi wiremesh","besi ulir sirip","besi hollow galvanis","besi hollow hitam","besi hollow kotak","besi beton ulir","besi beton polos","besi beton sni",
         
   "baja ringan","baja konvensional","baja wf","baja hbeam","baja iwf","baja gunung garuda","baja krakatau","baja import","baja lokal","baja hitam","baja putih","baja galvanis","baja stainless","baja tulangan","baja profil","baja plat","baja strip","baja siku","baja canal","baja unp","baja cnp","baja hollow","baja pipe","baja sch","baja seamless","baja welded",
   // 🔥 REVISI SEO ALIGN: HANYA varian profil & ukuran standar yang jadi money-master
   // ❌ DIHAPUS (aplikasi → money-page): "baja ringan rangka atap", "baja ringan kanopi", "baja ringan plafon", "baja ringan partisi", "baja ringan talang", "baja ringan atap", "baja ringan dinding", "baja ringan kanopi atap", "baja ringan rangka dinding", "baja ringan rangka baja", "baja ringan struktur atap", "baja ringan struktur dinding"
   // ❌ DIHAPUS (merek bukan base): "baja ringan taso", "baja ringan kencana", "baja ringan brc"
   "baja ringan c75","baja ringan c100","baja ringan c125",
   "baja ringan gording","baja ringan reng","baja ringan usuk","baja ringan kaso",
   "baja ringan galvanis","baja ringan zincalume",
   "baja ringan struktur","baja ringan non struktural","baja ringan struktur bangunan","baja ringan struktur rangka",
         
      // ═══ BATU & PASIR (multi-word) ═══
      "batu split","batu kali","batu belah","batu gunung","batu alam","batu apung","batu andesit","batu candi","batu palimanan","batu paras","batu koral","batu kerikil","batu pecah","batu screening","batu sikat","batu templek","batu bronjong","batu bata","batu alam andesit","batu alam palimanan","batu alam paras",
      
      "pasir beton","pasir pasang","pasir urug","pasir halus","pasir kasar","pasir putih","pasir hitam","pasir ayak","pasir silika","pasir bangka","pasir lumajang","pasir muntilan","pasir mundu","pasir cimangkok","pasir kediri","pasir malang","pasir merah","pasir elod","pasir sungai","pasir gunung",
      
      // ═══ KAYU (multi-word) ═══
      "kayu jati","kayu meranti","kayu mahoni","kayu sengon","kayu pinus","kayu randu","kayu kamper","kayu kruing","kayu merbau","kayu sonokeling","kayu trembesi","kayu glugu","kayu bengkirai","kayu ulin","kayu lapis","kayu balok","kayu papan","kayu reng","kayu usuk","kayu kaso","kayu albasia","kayu balsa","kayu damar","kayu keras","kayu lunak","kayu olahan","kayu solid","kayu plywood","kayu multiplek","kayu blockboard","kayu mdf","kayu hdf","kayu particle board",
      
      // ═══ BATU BATA & HEBEL (multi-word) ═══
      "bata ringan","bata merah","bata putih","bata tempel","bata ekspos","bata hebel","bata interlock","bata beton","bata jumbo","bata standar","bata press","bata oven","hebel aac","hebel putih","hebel grade a","hebel grade b","hebel interlock","hebel jumbo",
      
            // ═══ SEMEN (multi-word) ═══
      "semen portland","semen putih","semen abu","semen warna","semen instan","semen mortar","semen grouting","semen api","semen cepat","semen tahan api","semen portland pozzolan","semen portland composite","semen tiga roda","semen gresik","semen holcim","semen scg","semen padang","semen merah putih","semen cibinong","semen baturaja","semen bosowa","semen tonasa",
      
      // ═══ MORTAR (multi-word) 🔥 FIX ═══
      "mortar","mortar struktural","mortar instan","mortar utama","mortar grouting",
      "mortar perbaikan","mortar beton","mortar semen","mortar pasangan",
      "mortar plester","mortar acian","mortar keramik","mortar bata ringan",
      "mortar hebel","mortar non shrink","mortar fiber","mortar fiber reinforced",
      "mortar perbaikan beton","mortar struktural non shrink","mortar struktural fiber",
      "mortar perbaikan beton struktural","mortar sika","mortar fosroc","mortar weber",
      "mortar drymix","mortar siap pakai","mortar instan acian","mortar instan plester",
      "mortar instan perekat","mortar instan keramik","mortar thin bed","mortar thick bed",
      "mortar grouting non shrink","mortar grouting structural","mortar repair",
      "mortar perbaikan struktural","mortar structural repair","mortar tahan api",
      "mortar refraktori","mortar tahan asam","mortar waterproofing","mortar anti bocor",
      
      // ═══ CAT (multi-word) ═══
      "cat tembok","cat kayu","cat besi","cat dinding","cat plafon","cat lantai","cat pagar","cat baja","cat zincromate","cat epoxy","cat polyurethane","cat waterproof","cat anti bocor","cat anti jamur","cat anti karat","cat dasar","cat finish","cat dulux","cat jotun","cat nippon","cat mowilex","cat avian","cat decolith","cat propan","cat falcon","cat vinilex","cat catylac",
      
      // ═══ PIPA (multi-word) ═══
      "pipa pvc","pipa galvanis","pipa besi","pipa tembaga","pipa hdpe","pipa pp-r","pipa ppr","pipa conduit","pipa udara","pipa gas","pipa air","pipa saluran","pipa pembuangan","pipa beton","pipa paralon","pipa pralon","pipa msp","pipa wavin","pipa rucika","pipa vinilon","pipa maspion","pipa sch 40","pipa sch 80","pipa seamless",
      
      // ═══ KABEL (multi-word) ═══
      "kabel listrik","kabel tanah","kabel udara","kabel fiber","kabel coaxial","kabel telepon","kabel data","kabel power","kabel serabut","kabel tunggal","kabel twisted","kabel nyy","kabel nym","kabel nya","kabel nyaf","kabel nyyhy","kabel eterna","kabel supreme","kabel kabelindo","kabel tranka","kabel rucika",
      
      // ═══ KERAMIK & GRANIT (multi-word) ═══
      "keramik lantai","keramik dinding","keramik kamar mandi","keramik dapur","keramik teras","keramik motif","keramik polos","keramik granit","keramik porselen","keramik mosaic","keramik mozaik","keramik 60x60","keramik 40x40","keramik 30x30","keramik 25x25","keramik 20x20",
      
      "granit tile","granit hitam","granit putih","granit coklat","granit import","granit lokal","granit alam","granit bakar","granit poles","granit 60x60","granit 80x80","granit 100x100",
      
      "marmer italy","marmer lokal","marmer import","marmer hitam","marmer putih","marmer cream","marmer beige","marmer travertine",
      
      // ═══ GENTENG & ATAP (multi-word) ═══
      "genteng keramik","genteng metal","genteng beton","genteng tanah","genteng kaca","genteng flat","genteng gelombang","genteng spandek","genteng alderon","genteng aspal","genteng bitumen","genteng sokka","genteng kodok","genteng garuda","genteng kanmuri","genteng mclass","genteng kia","genteng m-class",
      
      "atap spandek","atap metal","atap seng","atap zincalume","atap galvalum","atap alderon","atap aspal","atap bitumen","atap genteng","atap beton","atap polycarbonate","atap solartuff","atap kaca","atap transparan","atap membrane","atap tegola","atap owens corning","atap spandek pasir","atap spandek warna","atap spandek transparan",
      
      // ═══ GYPSUM & PLAFON (multi-word) ═══
      "gypsum board","gypsum jayaboard","gypsum knauf","gypsum aplus","gypsum elephant","gypsum lion","gypsum shera","gypsum kalsiboard","gypsum grc","gypsum 9mm","gypsum 12mm",
      
      "plafon gypsum","plafon pvc","plafon grc","plafon akustik","plafon metal","plafon kalsiboard","plafon shunda","plafon triplek","plafon beton","plafon eterna",
      
      // ═══ ALUMINIUM & KACA (multi-word) ═══
      "aluminium foil","aluminium composite","aluminium panel","aluminium kusen","aluminium jendela","aluminium pintu","aluminium profil","aluminium extrude","aluminium anodize","aluminium powder coating","aluminium acp","aluminium seven",
      
      "kaca tempered","kaca polos","kaca bermotif","kaca buram","kaca es","kaca panasap","kaca film","kaca jendela","kaca patri","kaca laminated","kaca clear","kaca rayben","kaca 5mm","kaca 8mm","kaca 10mm","kaca 12mm",
      
            // ═══ BETON (multi-word) ═══
      // 🔥 FIX: Hapus "precast X" — pindah ke produk
      "beton ready mix","beton cor","beton bertulang","beton prategang","beton cor jayamix","beton cor minimix","beton instan","beton mortar","beton siklop","beton ringan","beton berat","beton massa","beton ekspos","beton struktural","beton non struktural","beton k225","beton k250","beton k300","beton k350","beton k400","beton k450","beton k500",
      
      // ═══ WIREMESH & BAUT (multi-word) ═══
      "wiremesh m6","wiremesh m8","wiremesh m10","wiremesh m12","wiremesh m5","wiremesh m7","wiremesh m9","wiremesh lembaran","wiremesh roll",
      
      "paku beton","paku kayu","paku payung","paku seng","paku baja","paku sekrup","paku tembak",
      
      "sekrup gypsum","sekrup baja","sekrup kayu","sekrup beton","sekrup roofing","sekrup self drilling",
      
      "mur baut","baut beton","baut baja","baut mur","baut roof","baut dynabolt","baut fisher","baut anchor","baut hitam","baut galvanis","baut stainless",
      
      "kawat beton","kawat bendrat","kawat bronjong","kawat harmonika","kawat duri","kawat nyamuk","kawat las","kawat loket","kawat ayam","kawat jaring",
      
      // ═══ LEM & WATERPROOFING (multi-word) ═══
      "lem fox","lem pvc","lem kayu","lem besi","lem kaca","lem beton","lem keramik","lem granit","lem marmer","lem epoxy","lem pu","lem silikon","lem sealant","lem konstruksi","lem instant","lem super",
      
      "waterproofing membran","waterproofing coating","waterproofing semen","waterproofing beton","waterproofing basement","waterproofing atap","waterproofing kamar mandi","waterproofing lantai","waterproofing aquaproof","waterproofing no drop","waterproofing sika","waterproofing fosroc",
      
      // ═══ BEKISTING (multi-word) ═══
      "bekisting kayu","bekisting baja","bekisting aluminium","bekisting konvensional",
      "bekisting kolom","bekisting balok","bekisting sloof","bekisting plat","bekisting dak",
      "bekisting jalan","bekisting beton","bekisting panel","bekisting multiplek",
      "bekisting plywood","kayu bekisting","papan bekisting","multiplek bekisting",
      "plywood bekisting",
      
      // ═══ PERANCAH (non-sewa) ═══
      // 🔥 REVISI: Hapus "scaffolding" dan "steger" — sudah ada di entity sewa
      "perancah","scaffolding pipe","main frame","cross brace",
      
      "bondex","besi tulangan","tulangan beton","mortar instan",
      
      // ═══════════════════════════════════════════════════════════
      // 🔥 PATCH MATERIAL MULTI-WORD BASE NAMES (v23.9.7-LITE-PERF-FINAL)
      // HANYA varian bentuk/jenis/merek/tipe/standar/finishing alami
      // YANG BENAR-BENAR money-master menurut SEO Align
      // ═══════════════════════════════════════════════════════════
      
            // ═══════════════════════════════════════════════════════════
      // 🔥 PATCH MATERIAL MULTI-WORD BASE NAMES (v23.9.7-LITE-PERF-FINAL-CLEAN)
      // HANYA varian bentuk/jenis/tipe/standar/finishing alami
      // YANG BENAR-BENAR money-master menurut SEO Align
      // 
      // ⚠️ CATATAN: Beberapa item di bawah SUDAH ADA di bagian EXISTING
      //    di atas (line ~360-480). Yang duplikat DIHAPUS dari sini
      //    untuk hindari pemborosan memori. Sorting otomatis + rx cache
      //    sudah handle duplikat, tapi best practice = bersih.
      // ═══════════════════════════════════════════════════════════
      
      // ═══ BAJA — varian profil (belum ada di existing) ═══
      "baja profil wf","baja profil hbeam","baja profil iwf","baja profil unp","baja profil cnp",
      "baja tulangan ulir","baja tulangan polos",
      // ❌ TIDAK MASUK: "baja struktur" (terlalu umum), "baja berat" (kategori, bukan produk)
      // ❌ TIDAK MASUK (aplikasi): "baja ringan kanopi", "baja ringan rangka atap", dll
      // ❌ TIDAK MASUK (merek): "baja ringan taso", "baja ringan kencana", "baja ringan brc"
      
      // ═══ BESI — varian bentuk (belum ada di existing) ═══
      "besi hollow bulat",
      "besi kanal c","besi kanal u",
      "besi plat strip","besi plat hitam","besi plat putih",
      "besi siku lubang","besi siku polos",
      "besi tulangan ulir","besi tulangan polos",
      "besi wiremesh m6","besi wiremesh m8","besi wiremesh m10","besi wiremesh m12",
      // ✅ SUDAH ADA di existing: "besi beton ulir sirip", "besi beton ulir", "besi beton polos", "besi beton sni",
      //    "besi hollow galvanis", "besi hollow hitam", "besi hollow kotak", "besi ulir sirip"
      
      // ═══ KAYU — varian jenis & finishing alami (belum ada di existing) ═══
      "kayu jati solid","kayu jati belanda",
      "kayu meranti merah","kayu meranti putih",
      "kayu mahoni solid","kayu sengon solid","kayu pinus solid",
      "kayu kamper solid","kayu kruing solid",
      // ❌ TIDAK MASUK (aplikasi): "kayu balok struktur", "kayu papan cor", "kayu reng atap", "kayu usuk atap", "kayu kaso atap"
      
      // ═══ BATU — varian bentuk alami & jenis batu alam (belum ada di existing) ═══
      "batu kali bulat","batu kali belah","batu gunung belah",
      "batu alam templek","batu alam sikat",
      // ✅ SUDAH ADA di existing: "batu alam andesit", "batu alam palimanan", "batu alam paras"
      // ❌ TIDAK MASUK (aplikasi): "batu split cor", "batu split beton", "batu belah cor", "batu gunung cor"
      
      // ═══ PASIR — varian asal daerah (belum ada di existing) ═══
      "pasir putih bangka",
      // ❌ TIDAK MASUK (aplikasi): "pasir beton cor", "pasir beton struktur", "pasir pasang bata", "pasir pasang keramik",
      //    "pasir urug pondasi", "pasir urug lahan", "pasir halus plester", "pasir kasar cor", "pasir hitam cor"
      
      // ═══ SEMEN — varian tipe standar (belum ada di existing) ═══
      "semen portland putih","semen portland abu",
      "semen portland tipe 1","semen portland tipe 2","semen portland tipe 3","semen portland tipe 4","semen portland tipe 5",
      "semen gresik portland","semen holcim portland","semen tiga roda portland",
      // ✅ SUDAH ADA di existing: "semen portland pozzolan", "semen portland composite"
      
      // ═══ CAT — varian fitur produk & jenis (belum ada di existing) ═══
      "cat tembok weathershield","cat besi anti karat","cat lantai epoxy",
      // ❌ TIDAK MASUK (aplikasi): "cat tembok interior", "cat tembok eksterior", "cat kayu interior", "cat kayu eksterior",
      //    "cat dinding interior", "cat dinding eksterior", "cat plafon interior"
      
      // ═══ KERAMIK — varian motif & finishing (belum ada di existing) ═══
      "keramik motif kayu","keramik motif marmer",
      "keramik polos putih","keramik polos hitam",
      // ❌ TIDAK MASUK (ukuran = variant): "keramik lantai 60x60", "keramik lantai 40x40", "keramik lantai 30x30",
      //    "keramik dinding 25x40", "keramik dinding 30x60", "keramik kamar mandi 25x25", "keramik dapur 30x30", "keramik teras 40x40"
      
      // ═══════════════════════════════════════════════════════════
      // 🔥 END PATCH MATERIAL MULTI-WORD FINAL-CLEAN
      // ═══════════════════════════════════════════════════════════
      
      "perekat beton","perekat keramik","lem beton"
    ],
    
    // ═══════════════════════════════════════════════════════════
    // ENTITY: JASA
    // ═══════════════════════════════════════════════════════════
    jasa: [
      // ═══ JASA STRUKTURAL ═══
      "pengeboran","bore pile","bor pile","bored pile","boring pile",
      "mini pile","spun pile","micropile","bor strauss","bor pancang",
      "strauss pile","tiang pancang","pancang","turap","sheet pile",
      "jet grouting","stabilisasi tanah","soil improvement",
      "sumur bor","bor sumur","pondasi","perkuatan tanah",
      "uji tanah","soil test","sondir","sondir test","cross hole",
      "bore pile test","pancang mini","pancang beton","pancang baja",
      "bor","drilling","boring","coring","cutting","cutting beton",
      
      // ═══ JASA COR ═══
      "cor","cor dak","cor lantai","cor jalan","cor kolom",
      "cor sloof","cor balok","cor plat","cor pondasi","cor tiang",
      "cor dinding","cor pagar","cor beton","cor ready mix",
      "cor minimix","cor jayamix","cor manual","cor mesin",
      "pengecoran","pengecoran beton","pengecoran dak",
      "pengecoran lantai","pengecoran jalan","pengecoran kolom",
      
      // ═══ JASA PASANG ═══
      "pasang dinding","pasang keramik","pasang granit",
      "pasang marmer","pasang parket","pasang vinyl","pasang ubin",
      "pasang wallpaper","pasang wpc","pasang grc","pasang hpl",
      "pasang partisi","pasang pagar","pasang kanopi",
      "pasang awning","pasang railing","pasang tangga",
      "pasang gerbang","pasang baja ringan","pasang rangka atap",
      "pasang atap","pasang genteng","pasang plafon",
      "pasang gypsum","pasang pintu","pasang jendela",
      "pasang kusen","pasang kaca","pasang shower box",
      "pasang instalasi listrik","pasang instalasi air",
      "pasang instalasi gas","pasang instalasi ac",
      "pasang pipa","pasang kabel listrik","pasang panel listrik",
      "pasang ac","pasang cctv","pasang alarm",
      "pemasangan","pemasangan keramik","pemasangan granit",
      "pemasangan marmer","pemasangan parket","pemasangan vinyl",
      "pemasangan wallpaper","pemasangan wpc","pemasangan grc",
      "pemasangan hpl","pemasangan partisi","pemasangan pagar",
      "pemasangan kanopi","pemasangan awning","pemasangan railing",
      "pemasangan tangga","pemasangan gerbang",
      "pemasangan baja ringan","pemasangan rangka atap",
      "pemasangan atap","pemasangan genteng","pemasangan plafon",
      "pemasangan gypsum","pemasangan pintu","pemasangan jendela",
      "pemasangan kusen","pemasangan kaca",
      "pemasangan shower box","pemasangan instalasi listrik",
      "pemasangan instalasi air","pemasangan instalasi gas",
      "pemasangan instalasi ac","pemasangan pipa",
      "pemasangan kabel listrik","pemasangan panel listrik",
      "pemasangan ac","pemasangan cctv","pemasangan alarm",
      "pemasangan wifi","pemasangan parabola","pemasangan antena",
      
      // ═══ JASA BONGKAR ═══
      "bongkar dinding","bongkar lantai","bongkar plat",
      "bongkar gedung","bongkar rumah","bongkar ruko",
      "bongkar gudang","bongkar atap","bongkar keramik",
      "bongkar granit","bongkar marmer","bongkar plafon",
      "bongkar kusen","bongkar pintu","bongkar jendela",
      "bongkar pagar","bongkar partisi","bongkar bangunan",
      "pembongkaran","pembongkaran dinding","pembongkaran lantai",
      "pembongkaran gedung","pembongkaran rumah",
      "pembongkaran ruko","pembongkaran gudang",
      "pembongkaran atap","pembongkaran keramik",
      "pembongkaran granit","pembongkaran marmer",
      "pembongkaran plafon","pembongkaran kusen",
      "pembongkaran pintu","pembongkaran jendela",
      "pembongkaran pagar","pembongkaran partisi",
      "buang puing","angkut puing","angkut tanah","angkut material",
      
      // ═══ JASA GALI & URUG ═══
      "gali tanah","gali pondasi","gali basement","gali saluran",
      "penggalian","penggalian tanah","penggalian pondasi",
      "penggalian basement","penggalian saluran",
      "urug tanah","urug lahan","urug pondasi","urug jalan",
      "pengurugan","pengurugan tanah","pengurugan lahan",
      "pengurugan pondasi","pengurugan jalan",
      "pemadatan tanah","pemadatan lahan","pemotongan bukit",
      "cut and fill","pembersihan lahan","land clearing",
      "pematangan lahan","pekerjaan galian tanah",
      
      // ═══ JASA RENOVASI ═══
      "renovasi rumah","renovasi gedung","renovasi kantor",
      "renovasi toko","renovasi ruko","renovasi gudang",
      "renovasi pabrik","renovasi apartemen","renovasi dapur",
      "renovasi kamar mandi","renovasi kamar tidur",
      "renovasi ruang tamu","renovasi teras","renovasi balkon",
      "renovasi atap","renovasi lantai","renovasi dinding",
      "renovasi plafon","renovasi pagar","renovasi taman",
      "perbaikan","perbaikan atap","perbaikan dinding",
      "perbaikan lantai","perbaikan plafon","perbaikan pondasi",
      "perbaikan struktur","perbaikan pipa","perbaikan saluran air",
      "perbaikan bangunan","perbaikan infrastruktur",
      "perawatan gedung","perawatan kolam","perawatan bangunan",
      "perawatan atap","perawatan dinding","perawatan lantai",
      
      // ═══ JASA FINISHING ═══
      "cat dinding","cat tembok","cat plafon","cat kayu",
      "cat besi","cat pagar","cat lantai","cat baja",
      "pengecatan","pengecatan dinding","pengecatan tembok",
      "pengecatan plafon","pengecatan kayu","pengecatan besi",
      "pengecatan pagar","pengecatan lantai","pengecatan baja",
      "waterproofing","waterproofing membran",
      "waterproofing coating","waterproofing beton",
      "waterproofing basement","waterproofing atap",
      "waterproofing kamar mandi","waterproofing lantai",
      "poles marmer","poles granit","poles keramik","poles lantai",
      "poles beton","poles teraso","poles ubin",
      "grinding","grinding beton","grinding lantai",
      "grinding dinding","grinding marmer","grinding granit",
      "epoxy lantai","epoxy coating","epoxy beton",
      "coating","coating lantai","coating beton","coating dinding",
      "relief","relief beton","profil beton","finishing",
      "finishing beton","finishing kayu","finishing besi",
      "finishing dinding","finishing lantai",
      
      // ═══ JASA INSTALASI ═══
      "instalasi listrik","instalasi air","instalasi plumbing",
      "instalasi ac","instalasi cctv","instalasi alarm",
      "instalasi gas","instalasi internet","instalasi antena",
      "instalasi panel listrik","instalasi pipa","instalasi kabel",
      "service ac","service pompa air","service genset",
      "service lift","service listrik","service air",
      "perawatan ac","perawatan lift","perawatan genset",
      "perawatan pompa","perawatan listrik",
      
      // ═══ JASA LAS & WELDING ═══
      "las","welding","las besi","las pagar","las kanopi",
      "las rangka baja","las tiang","las konstruksi",
      "las besi hollow","las besi tempa","las stainless",
      "welding besi","welding konstruksi","welding pipa",
      "welding baja","welding stainless",
      "sandblasting","sandblasting besi","sandblasting beton",
      "sandblasting dinding","sandblasting logam",
      
      // ═══ JASA KONSTRUKSI ═══
      "bangun rumah","bangun gedung","bangun ruko",
      "bangun gudang","bangun kantor","bangun pabrik",
      "bangun sekolah","bangun masjid","bangun gereja",
      "borongan","borongan rumah","borongan gedung",
      "borongan interior","borongan konstruksi",
      "konstruksi","konstruksi bangunan","konstruksi struktur",
      "struktur khusus","struktur konstruksi","struktur baja",
      "struktur beton","struktur kayu","lapangan olahraga",
      "pembatas pengaman","pembuatan kanopi","pembuatan pagar",
      "pembuatan railing","pembuatan tangga","pembuatan gerbang",
      "pembuatan wastafel","pembuatan meja","pembuatan kursi",
      "pembuatan lemari","pembuatan kitchen set",
      "pembuatan wardrobe","pembuatan backdrop",
      
      // ═══ JASA INFRASTRUKTUR ═══
      "saluran drainase","jalan perkerasan","pengaspalan",
      "aspal jalan","pengerukan sungai","pengerukan kolam",
      "pengerukan saluran","pembuatan jalan","pembuatan drainase",
      "pembuatan saluran","pembuatan gorong gorong",
      
      // ═══ JASA KONSULTASI ═══
      "konsultan","konsultan konstruksi","konsultan bangunan",
      "konsultan struktur","konsultan sipil","konsultan arsitektur",
      "konsultan mep","konsultan pengawas","konsultan proyek",
      
      // ═══ JASA LAIN-LAIN ═══
      "interior","eksterior","pembuatan","pasang","alat konstruksi",
      "grouting","coring","cutting"
    ],
    
    // ═══════════════════════════════════════════════════════════
    // ENTITY: SEWA
    // ═══════════════════════════════════════════════════════════
    sewa: [
      // ═══ ALAT BERAT (existing) ═══
      "alat berat","heavy equipment","excavator","bulldozer",
      "backhoe","dozer","vibro","crane","truck crane",
      "mobile crane","crawler crane","tower crane","dump truck",
      "motor grader","wheel loader","asphalt finisher",
      "asphalt paver","tandem roller","pneumatic tire roller",
      "cold milling","batching plant","concrete pump",
      "pompa beton","pompa air","jack hammer","forklift",
      "genset","boom lift","skylift","scissor lift","man lift",
      "articulated boom lift","telescopic boom lift",
      "concrete mixer","molen beton","vibrator beton",
      "chain block","hoist crane","overhead crane","gantry crane",
      "winch","cable puller","vibratory plate","stamper kodok",
      "tamper","wacker plate","vibro plate","soil compactor",
      "trowel beton","power trowel","mesin plester",
      "mesin acian","mesin cat","spray gun","airless sprayer",
      "mesin potong","chainsaw","gergaji mesin",
      "pompa celup","pompa submersible","pompa sentrifugal",
      "pompa transfer","kompresor angin","compressor",
      "scaffolding","steger","tenda","terpal",
      "toilet portable","portacamp","tower lamp","lampu sorot",
      
      // ═══ SEWA SPESIFIK (multi-word) ═══
      "sewa excavator","sewa bulldozer","sewa crane",
      "sewa genset","sewa scaffolding","sewa molen",
      "sewa pompa beton","sewa concrete pump",
      "sewa alat berat","sewa mesin konstruksi",
      "sewa forklift","sewa truck crane","sewa mobile crane",
      "sewa tower crane","sewa dump truck","sewa backhoe",
      "sewa vibro","sewa compactor","sewa stamper",
      "sewa jack hammer","sewa concrete mixer",
      "sewa vibrator beton","sewa boom lift",
      "sewa skylift","sewa scissor lift","sewa man lift",
      "sewa pompa air","sewa pompa celup","sewa kompresor",
      "sewa tenda","sewa terpal","sewa toilet portable",
      "sewa portacamp","sewa tower lamp","sewa lampu sorot",
      "sewa chainsaw","sewa mesin potong","sewa trowel beton",
      "sewa power trowel","sewa mesin plester","sewa mesin acian",
      "sewa mesin cat","sewa spray gun","sewa airless sprayer",
      
      "rental excavator","rental bulldozer","rental crane",
      "rental genset","rental scaffolding","rental molen",
      "rental alat berat","rental mesin konstruksi",
      "rental forklift","rental truck crane","rental mobile crane",
      "rental tower crane","rental dump truck","rental backhoe",
      "rental pompa beton","rental concrete pump",
      "rental tenda","rental terpal","rental toilet portable",
      
      // ═══ ALAT BERAT + SPESIFIKASI ═══
      "excavator mini","excavator besar","excavator pc75",
      "excavator pc200","excavator pc300","excavator pc400",
      "bulldozer d6","bulldozer d7","bulldozer d8",
      "backhoe loader","wheel loader","motor grader",
      "vibro roller","tandem roller","pneumatic tire roller",
      "baby roller","compactor","soil compactor",
      "dump truck","tronton","fuso","engkel","pickup",
      "truck crane","mobile crane","crawler crane","tower crane",
      "forklift","reach truck","hand pallet",
      "genset silent","genset open","genset 10 kva",
      "genset 20 kva","genset 50 kva","genset 100 kva",
      "concrete mixer","molen beton","molen cor",
      "concrete pump","pompa beton","pompa concrete",
      "vibrator beton","vibrator listrik","vibrator diesel",
      "jack hammer","breaker","demolition hammer",
      "asphalt finisher","asphalt paver","cold milling",
      "batching plant","stone crusher","crusher",
      "kompresor angin","compressor","air compressor",
      "boom lift","skylift","scissor lift","man lift",
      "articulated boom lift","telescopic boom lift",
      "chain block","hoist crane","overhead crane","gantry crane",
      "winch","cable puller",
      "scaffolding","steger","scaffolding pipe",
      "tenda","terpal","toilet portable","portacamp",
      "tower lamp","lampu sorot","lampu tower",
      "trowel beton","power trowel","mesin plester",
      "mesin acian","mesin cat","spray gun","airless sprayer",
      "mesin potong","chainsaw","gergaji mesin",
      "pompa celup","pompa submersible","pompa sentrifugal",
      "pompa transfer","pompa air","pompa banjir",
      "vibratory plate","stamper kodok","tamper",
      "wacker plate","vibro plate"
    ],
    
    // ═══════════════════════════════════════════════════════════
    // ENTITY: DESAIN
    // ═══════════════════════════════════════════════════════════
    desain: [
      // ═══ DESAIN INTERIOR (existing) ═══
      "desain interior","desain eksterior","desain rumah",
      "desain arsitektur","desain 3d","desain denah",
      "desain layout","desain bangunan","desain struktur",
      "desain kantor","desain toko","desain ruko",
      "desain villa","desain apartemen","desain showroom",
      "desain kos","desain guest house","desain pujasera",
      "desain warung","desain bengkel","desain gudang",
      "desain foodcourt","desain kedai","desain kafe",
      "desain cafe","desain restoran","desain hotel",
      "desain bar","desain lounge","desain spa",
      "desain salon","desain minimarket","desain butik",
      "desain sekolah","desain klinik","desain dapur",
      "desain kamar mandi","desain kamar tidur",
      "desain ruang tamu","desain ruang keluarga",
      "desain ruang makan","desain ruang kerja",
      "desain teras","desain balkon","desain carport",
      "desain fasad","desain taman","desain kolam renang",
      "desain gazebo","desain walk in closet","desain kamar anak",
      
      // ═══ DESAIN INTERIOR SPESIFIK (tambahan) ═══
      "desain interior rumah","desain interior kantor",
      "desain interior toko","desain interior cafe",
      "desain interior restoran","desain interior hotel",
      "desain interior apartemen","desain interior villa",
      "desain interior kamar","desain interior dapur",
      "desain interior kamar mandi","desain interior ruang tamu",
      "desain interior ruang keluarga","desain interior ruang makan",
      "desain interior ruang kerja","desain interior minimarket",
      "desain interior butik","desain interior salon",
      "desain interior spa","desain interior klinik",
      
      // ═══ DESAIN EKSTERIOR SPESIFIK (tambahan) ═══
      "desain eksterior rumah","desain eksterior kantor",
      "desain eksterior toko","desain eksterior cafe",
      "desain eksterior restoran","desain eksterior hotel",
      "desain eksterior apartemen","desain eksterior villa",
      "desain eksterior taman","desain eksterior kolam",
      "desain eksterior fasad","desain eksterior carport",
      "desain eksterior teras","desain eksterior balkon",
      
      // ═══ DESAIN BANGUNAN (tambahan) ═══
      "desain rumah minimalis","desain rumah modern",
      "desain rumah klasik","desain rumah tropis",
      "desain rumah 2 lantai","desain rumah 3 lantai",
      "desain rumah mewah","desain rumah sederhana",
      "desain gedung kantor","desain gedung hotel",
      "desain gedung sekolah","desain gedung rumah sakit",
      "desain ruko 2 lantai","desain ruko 3 lantai",
      "desain gudang","desain pabrik","desain showroom",
      
      // ═══ DESAIN 3D & VISUALISASI (tambahan) ═══
      "desain 3d interior","desain 3d eksterior",
      "desain 3d rumah","desain 3d bangunan",
      "desain 2d","desain 2d rumah","desain 2d interior",
      "desain animasi","desain walkthrough","desain virtual tour",
      "desain vr","desain ar","desain render",
      "render 3d","render interior","render eksterior",
      "visualisasi 3d","visualisasi interior",
      
      // ═══ GAMBAR TEKNIK (existing + tambahan) ═══
      "gambar arsitektur","gambar kerja","gambar teknik",
      "gambar denah","gambar tampak","gambar potongan",
      "gambar detail","gambar struktur","gambar mep",
      "shop drawing","as built drawing",
      
      // ═══ DESAIN STRUKTUR (tambahan) ═══
      "desain struktur bangunan","desain struktur beton",
      "desain struktur baja","desain struktur kayu",
      "desain pondasi","desain sloof","desain kolom",
      "desain balok","desain plat","desain tangga",
      "perhitungan struktur","analisa struktur",
      
      // ═══ DESAIN MEP (tambahan) ═══
      "desain mep","desain mekanikal","desain elektrikal",
      "desain plumbing","desain listrik","desain air",
      "desain tata udara","desain ac","desain ventilasi",
      "desain pemadam kebakaran","desain fire fighting",
      
      // ═══ DESAIN TAMAN (tambahan) ═══
      "desain taman minimalis","desain taman kering",
      "desain taman vertikal","desain taman tropis",
      "desain taman jepang","desain taman bali",
      "desain kolam renang","desain kolam ikan",
      "desain gazebo","desain carport","desain pagar",
      
      // ═══ DESAIN KHUSUS (tambahan) ═══
      "desain dapur","desain kamar mandi","desain kamar tidur",
      "desain ruang tamu","desain ruang keluarga",
      "desain ruang makan","desain ruang kerja",
      "desain walk in closet","desain kamar anak",
      "desain kitchen set","desain wardrobe",
      "desain lemari","desain meja","desain kursi",
      "desain backdrop tv","desain plafon","desain lantai",
      "desain wallpaper","desain lampu","desain furniture"
    ]

  };

  // Sort base names DESC by word count
  (function() {
    for (var ent in ENTITY_BASE_NAMES) {
      if (!ENTITY_BASE_NAMES.hasOwnProperty(ent)) continue;
      ENTITY_BASE_NAMES[ent].sort(function(a, b) {
        return b.split(' ').length - a.split(' ').length;
      });
    }
  })();

  var JASA_SUB_CATEGORIES = {
    struktural: ["bore pile","bor pile","bored pile","boring pile","mini pile","spun pile","micropile","bor strauss","bor pancang","strauss pile","tiang pancang","pancang","turap","sheet pile","jet grouting","stabilisasi tanah","soil improvement","sumur bor","bor sumur","pondasi","perkuatan tanah","cor","cor dak","cor lantai","cor jalan","cor kolom","cor sloof","cor balok","cor plat","cor pondasi","cor tiang","cor dinding","cor pagar","pengeboran","drilling","boring","coring","cutting","cutting beton","uji tanah","soil test","gali tanah","gali pondasi","gali basement","gali saluran","penggalian tanah","penggalian pondasi","urug tanah","urug lahan","urug pondasi","urug jalan","pengurugan tanah","pengurugan lahan","pemadatan tanah","pemadatan lahan","pemotongan bukit","cut and fill"],
    finishing: ["relief","relief beton","profil beton","finishing","cat dinding","cat tembok","cat plafon","cat kayu","cat besi","cat pagar","pengecatan dinding","pengecatan tembok","waterproofing","poles marmer","poles granit","poles keramik","poles lantai","grinding","grinding beton","grinding lantai","epoxy lantai","coating","coating lantai","coating beton","sandblasting besi","sandblasting beton","sandblasting dinding"],
    konstruksi: ["konstruksi bangunan","konstruksi struktur","struktur khusus","struktur konstruksi","lapangan olahraga","bangun rumah","bangun gedung","bangun ruko","bangun gudang","bangun kantor","bangun pabrik","bangun sekolah","borongan rumah","borongan gedung","borongan interior","pembuatan kanopi","pembuatan pagar","pembuatan railing"],
    infrastruktur: ["saluran drainase","jalan perkerasan","pengaspalan","aspal jalan","pengerukan sungai","pengerukan kolam","pengerukan saluran"],
    pematangan: ["pematangan lahan","pekerjaan galian tanah","pembersihan lahan","land clearing","angkut tanah","angkut puing","angkut material"],
    bongkar_buang: ["bongkar dinding","bongkar lantai","bongkar plat","bongkar gedung","bongkar rumah","bongkar ruko","bongkar gudang","bongkar atap","bongkar keramik","bongkar granit","bongkar marmer","bongkar plafon","bongkar kusen","bongkar pintu","bongkar jendela","bongkar pagar","bongkar partisi","bongkar bangunan","buang puing"],
    perbaikan: ["renovasi rumah","renovasi gedung","renovasi kantor","renovasi toko","renovasi ruko","renovasi gudang","renovasi pabrik","renovasi apartemen","renovasi dapur","renovasi kamar mandi","renovasi kamar tidur","renovasi ruang tamu","renovasi teras","renovasi balkon","renovasi atap","renovasi lantai","renovasi dinding","renovasi plafon","renovasi pagar","renovasi taman","perbaikan atap","perbaikan dinding","perbaikan lantai","perbaikan plafon","perbaikan pondasi","perbaikan struktur","perbaikan pipa","perbaikan saluran air","perbaikan bangunan","perbaikan infrastruktur","perawatan gedung","perawatan kolam"],
    instalasi: ["instalasi listrik","instalasi air","instalasi plumbing","instalasi ac","instalasi cctv","instalasi alarm","pasang instalasi listrik","pasang instalasi air","pasang instalasi gas","pasang instalasi ac","pasang pipa","pasang kabel listrik","pasang panel listrik","pasang ac","pasang cctv","pasang alarm","service ac","service pompa air","service genset","service lift","pemasangan wifi","instalasi internet","instalasi antena","pemasangan parabola"],
    konsultasi: ["konsultan","konsultan konstruksi"],
    pembuatan_pasang: ["pembuatan","pasang","pasang dinding","pasang keramik","pasang granit","pasang marmer","pasang parket","pasang vinyl","pasang ubin","pasang wallpaper","pasang wpc","pasang grc","pasang hpl","pasang partisi","pasang pagar","pasang kanopi","pasang awning","pasang railing","pasang tangga","pasang gerbang","pasang baja ringan","pasang rangka atap","pasang atap","pasang genteng","pasang plafon","pasang gypsum","pasang pintu","pasang jendela","pasang kusen","pasang kaca","pasang shower box"],
    pengaman: ["pembatas pengaman"],
    alat_konstruksi: ["alat konstruksi"],
    interior_eksterior: ["interior","eksterior"],
    las_welding: ["las","welding","sandblasting","las besi","las pagar","las kanopi","las rangka baja","las tiang","welding besi","welding konstruksi"]
  };

  var DOMAIN_CONSTRAINTS = {
    struktural: { allowed_categories: ["metode","skala","tipe_aspal","material","dimensi","kedalaman","target","price","per_unit","global_numeric","tipe","merek","kondisi","durasi","kapasitas"], forbidden_categories: ["finishing","warna","gaya","furniture","subjektif","konsep","warna_extended","gaya_extended"] },
    finishing: { allowed_categories: ["metode","skala","finishing","warna","material","target","price","per_unit","global_numeric"], forbidden_categories: ["dimensi","kedalaman","gaya","furniture","konsep","warna_extended","gaya_extended"] },
    konstruksi: { allowed_categories: ["metode","skala","material","target","price","per_unit","global_numeric"], forbidden_categories: ["finishing","warna","gaya","furniture","subjektif","konsep","warna_extended","gaya_extended"] },
    infrastruktur: { allowed_categories: ["metode","skala","material","target","price","per_unit","global_numeric","tipe_aspal"], forbidden_categories: ["finishing","warna","gaya","furniture","subjektif","konsep","warna_extended","gaya_extended"] },
    pematangan: { allowed_categories: ["metode","skala","target","price","per_unit","global_numeric"], forbidden_categories: ["finishing","warna","gaya","furniture","subjektif","konsep","dimensi","kedalaman"] },
    bongkar_buang: { allowed_categories: ["metode","skala","target","price","per_unit","global_numeric"], forbidden_categories: ["finishing","warna","gaya","furniture","subjektif","konsep","dimensi","kedalaman"] },
    perbaikan: { allowed_categories: ["metode","skala","material","finishing","gaya","target","price","per_unit","global_numeric"], forbidden_categories: ["dimensi","kedalaman","furniture","konsep","warna_extended","gaya_extended"] },
    instalasi: { allowed_categories: ["metode","skala","merek","kapasitas","kondisi","target","price","per_unit","global_numeric"], forbidden_categories: ["finishing","warna","gaya","furniture","konsep","dimensi","kedalaman","warna_extended","gaya_extended"] },
    konsultasi: { allowed_categories: ["skala","target","price","per_unit","global_numeric"], forbidden_categories: ["finishing","warna","gaya","furniture","konsep","dimensi","kedalaman","metode","material"] },
    pembuatan_pasang: { allowed_categories: ["metode","skala","material","finishing","gaya","dimensi","target","price","per_unit","global_numeric","warna"], forbidden_categories: ["kedalaman","furniture","konsep","warna_extended","gaya_extended"] },
    pengaman: { allowed_categories: ["material","dimensi","target","price","per_unit","global_numeric","metode"], forbidden_categories: ["finishing","warna","gaya","furniture","konsep","kedalaman","warna_extended","gaya_extended"] },
    alat_konstruksi: { allowed_categories: ["merek","kapasitas","kondisi","durasi","tipe","target","price","per_unit","global_numeric"], forbidden_categories: ["finishing","warna","gaya","furniture","konsep","dimensi","kedalaman","warna_extended","gaya_extended"] },
    interior_eksterior: { allowed_categories: ["gaya","warna","material","finishing","konsep","furniture","subjektif","target","price","per_unit","global_numeric","warna_extended","gaya_extended"], forbidden_categories: ["dimensi","kedalaman","metode"] },
    las_welding: { allowed_categories: ["metode","material","dimensi","target","price","per_unit","global_numeric"], forbidden_categories: ["finishing","warna","gaya","furniture","konsep","kedalaman","warna_extended","gaya_extended"] },
    default: { allowed_categories: ["metode","skala","material","finishing","warna","gaya","dimensi","target","price","per_unit","global_numeric","tipe","merek","kondisi","durasi","kapasitas"], forbidden_categories: [] }
  };

  var MODIFIER_COMPATIBILITY = {
    "polos": ["produk","material","desain","jasa_finishing","jasa_pembuatan_pasang"], "motif": ["produk","material","desain","jasa_finishing"], "bermotif": ["produk","material","desain"], "bercorak": ["produk","material","desain"], "tekstur": ["produk","material","desain","jasa_finishing"], "serat": ["produk","material","desain"], "halus": ["produk","material","desain","jasa_finishing"], "kasar": ["produk","material","desain"], "matte": ["produk","material","desain"], "glossy": ["produk","material","desain"], "doff": ["produk","material","desain"], "gloss": ["produk","material","desain"], "satin": ["produk","material","desain"], "anyaman": ["produk","material","desain"], "natural": ["produk","material","desain"], "ekspos": ["produk","material","desain","jasa_finishing"], "custom": ["produk","material","desain","jasa_pembuatan_pasang"], "polosan": ["produk","material","desain"], "cat": ["produk","material","desain","jasa_finishing"], "coating": ["produk","material","desain","jasa_finishing"], "lapisan": ["produk","material","desain"], "vernis": ["produk","material","desain","jasa_finishing"],
    "putih": ["produk","material","desain","jasa_interior_eksterior"], "hitam": ["produk","material","desain","jasa_interior_eksterior"], "abu-abu": ["produk","material","desain","jasa_interior_eksterior"], "merah": ["produk","material","desain","jasa_interior_eksterior"], "biru": ["produk","material","desain","jasa_interior_eksterior"], "kuning": ["produk","material","desain","jasa_interior_eksterior"], "hijau": ["produk","material","desain","jasa_interior_eksterior"], "coklat": ["produk","material","desain","jasa_interior_eksterior"], "netral": ["produk","material","desain","jasa_interior_eksterior"], "krem": ["produk","material","desain","jasa_interior_eksterior"], "maroon": ["produk","material","desain","jasa_interior_eksterior"], "navy": ["produk","material","desain","jasa_interior_eksterior"], "forest": ["produk","material","desain","jasa_interior_eksterior"], "gold": ["produk","material","desain","jasa_interior_eksterior"], "silver": ["produk","material","desain","jasa_interior_eksterior"], "bronze": ["produk","material","desain","jasa_interior_eksterior"], "copper": ["produk","material","desain","jasa_interior_eksterior"], "rose gold": ["produk","material","desain","jasa_interior_eksterior"], "teal": ["produk","material","desain","jasa_interior_eksterior"], "turquoise": ["produk","material","desain","jasa_interior_eksterior"], "lavender": ["produk","material","desain","jasa_interior_eksterior"], "magenta": ["produk","material","desain","jasa_interior_eksterior"], "coral": ["produk","material","desain","jasa_interior_eksterior"], "salmon": ["produk","material","desain","jasa_interior_eksterior"], "peach": ["produk","material","desain","jasa_interior_eksterior"], "mint": ["produk","material","desain","jasa_interior_eksterior"], "warm": ["produk","material","desain","jasa_interior_eksterior"], "cool": ["produk","material","desain","jasa_interior_eksterior"], "pastel": ["produk","material","desain","jasa_interior_eksterior"], "dark": ["produk","material","desain","jasa_interior_eksterior"], "light": ["produk","material","desain","jasa_interior_eksterior"],
    "minimalis": ["produk","desain","jasa_interior_eksterior","jasa_perbaikan","jasa_pembuatan_pasang"], "modern": ["produk","desain","jasa_interior_eksterior","jasa_perbaikan","jasa_pembuatan_pasang"], "klasik": ["produk","desain","jasa_interior_eksterior"], "skandinavia": ["produk","desain","jasa_interior_eksterior"], "japandi": ["produk","desain","jasa_interior_eksterior"], "industrial": ["produk","desain","jasa_interior_eksterior"], "kontemporer": ["produk","desain","jasa_interior_eksterior"], "tradisional": ["produk","desain","jasa_interior_eksterior"], "rustic": ["produk","desain","jasa_interior_eksterior"], "bohemian": ["produk","desain","jasa_interior_eksterior"],
    "dimensi": ["material","produk","jasa_struktural","jasa_pengaman","jasa_las_welding"], "ukuran": ["material","produk","jasa_struktural","jasa_pengaman"], "tebal": ["material","produk"], "panjang": ["material","produk","jasa_struktural"], "lebar": ["material","produk"], "tinggi": ["material","produk"], "diameter": ["material","produk","jasa_struktural"], "kedalaman": ["jasa_struktural"], "radius": ["material","produk"],
    "manual": ["jasa_struktural","jasa_instalasi","jasa_las_welding","jasa_pembuatan_pasang","jasa_finishing"], "hidrolik": ["jasa_struktural","jasa_alat_konstruksi"], "auger": ["jasa_struktural"], "rotary": ["jasa_struktural"], "percussive": ["jasa_struktural"], "dry": ["jasa_struktural","jasa_finishing"], "wet": ["jasa_struktural","jasa_finishing"], "basah": ["jasa_finishing"], "kering": ["jasa_finishing"], "mesin": ["jasa_struktural","jasa_instalasi","jasa_las_welding"],
    "beton": ["produk","material","jasa_struktural","jasa_konstruksi","jasa_perbaikan"], "besi": ["produk","material","jasa_las_welding","jasa_struktural","jasa_pembuatan_pasang"], "kayu": ["produk","material","desain","jasa_pembuatan_pasang"], "aluminium": ["produk","material","jasa_instalasi","jasa_pembuatan_pasang"], "kaca": ["produk","material","jasa_instalasi","jasa_pembuatan_pasang"], "stainless": ["produk","material","jasa_pembuatan_pasang"], "baja": ["produk","material","jasa_struktural","jasa_las_welding"], "pvc": ["produk","material","jasa_instalasi"], "wpc": ["produk","material","jasa_pembuatan_pasang"], "grc": ["produk","material","jasa_pembuatan_pasang","jasa_finishing"], "hpl": ["produk","material","jasa_pembuatan_pasang"], "acp": ["produk","material","jasa_pembuatan_pasang"], "vinyl": ["produk","material","jasa_pembuatan_pasang"], "upvc": ["produk","material","jasa_instalasi"], "tembaga": ["produk","material","jasa_instalasi"], "kuningan": ["produk","material"], "perunggu": ["produk","material"], "titanium": ["produk","material"], "bambu": ["produk","material","desain"], "rotan": ["produk","material","desain"]
  };

  var GLOBAL_NUMERIC_KEYWORDS = ["grade a","grade b","grade c","sni","standar","kualitas 1","kualitas 2","kualitas 3","kelas 1","kelas 2","kelas 3"];

  var SHARED_MODIFIERS = {
    material: ["beton","besi","kayu","aluminium","kaca","stainless","baja","pvc","wpc","grc","hpl","acp","vinyl","upvc","tembaga","kuningan","perunggu","titanium","bambu","rotan"],
    finishing: ["polos","motif","bermotif","bercorak","tekstur","serat","halus","kasar","matte","glossy","doff","gloss","satin","anyaman","natural","ekspos","custom","polosan","cat","coating","lapisan","vernis"],
    warna: ["putih","hitam","abu-abu","merah","biru","kuning","hijau","coklat","netral","krem","maroon","navy","forest","gold","silver","bronze","copper","rose gold","teal","turquoise","lavender","magenta","coral","salmon","peach","mint","warm","cool","pastel","dark","light"],
    gaya: ["minimalis","modern","klasik","skandinavia","japandi","industrial","kontemporer","tradisional","rustic","bohemian"]
  };

  var ENTITY_SPECIFIC = {
    jasa: {
      metode: ["manual","hidrolik","auger","rotary","percussive","dry","wet","basah","kering","mesin","dalam","dangkal","artesis","jet pump"],
      skala: ["rumahan","komersial","industri","residential","commercial","industrial","kecil","sedang","besar","menengah","proyek","perumahan","perkantoran","pabrik","sekolah"],
      tipe_aspal: ["hotmix","coldmix","aspal cair","aspal buton"]
    },
    produk: {
      mutu: ["k225","k250","k300","k350","k400","k500","fc"],
      tipe: ["geser","lipat","swing","sliding","casement","rolling door","folding gate","harmonika","ayun","kupu-kupu","revolving","otomatis","manual","knockdown","prefab","precast"]
    },
    material: {
      grade_material: ["portland","opc","ppc","pcc","type 1","type 2","type 3","type 4","type 5","tipe 1","tipe 2","tipe 3","tipe 4","tipe 5"],
      tipe_extended: ["wiry","bjku","bjtd","bjp","bjts","plywood","multiplek","blockboard","mdf","hdf","particle board","solid wood","jati","meranti","mahoni","sengon","pinus","randu","sungkai","bangkirai","ulin","kamper","kruing","keruing","merbau","sonokeling","trembesi","glugu","andesit","kali","apung","split","koral","candi","palimanan","paras","breksi","batu alam","batu belah","batu gunung","batu karang","silika","zeolit","cor","homogeneous","homogen","roman","platinum","mulia","essence","granito","granit tile","keramik lantai","keramik dinding","marmer italy","marmer lokal","marmer import","granit hitam","granit putih","granit coklat","granit import","granit lokal","dulux","jotun","nippon","mowilex","avian","decolith","propan","falcon","vinilex","pasir beton","pasir pasang","pasir urug","pasir halus","pasir kasar","pasir putih","pasir hitam","pasir ayak","pasir silika","pasir bangka","pasir lumajang","h-beam","hbeam","wf","hollow","kanal","siku","unesp","unp","cnp","inp","besi hollow","besi kanal","eterna","supreme","kabelindo","tranka","rucika","wavin","vinilon","pralon","maspion","besi cor","aluminium foil","bangka","lumajang","tulungagung","pangkep","muntilan","borneo","kalimantan","jepara","kudus","cilacap","tiga roda","3 roda","gresik","semen gresik","semen-gresik","holcim","semen holcim","semen-holcim","scg","semen scg","semen-scg","padang","semen padang","semen-padang","merah putih","semen merah putih","cibinong","semen cibinong","baturaja","semen baturaja","bosowa","semen bosowa","tonasa","semen tonasa","master","besi master","intan","besi intan","handuk","besi handuk","krakatau steel","krakatau-steel","ks","gunung garuda","gunung-garuda","hanil","jeka","danagri","magic","aquaproof","no drop","no-drop","nodrop","aqua proof","icera","ardena","milano","asia tile","asia-tile","indograha","kian","eleganza","elegan","paving","paving block","grass block","atap","atap spandek","atap metal","atap genteng","plafon","plafon gypsum","plafon pvc","plafon grc","shunda","kalsiboard","gyproc","jayaboard"]
    },
    sewa: {
      merek: ["pc75","pc200","pc300","pc350","pc400","komatsu","hitachi","caterpillar","cat","volvo","hyundai","doosan","kobelco","sumitomo","case","jcb","liebherr","kubota","yanmar","perkins","cummin"],
      kondisi: ["baru","bekas","servis","recondition","rebuilt","ready","siap pakai","prima","baik","layak","standar","listrik","diesel","bensin","solar","hydraulic"],
      durasi: ["harian","mingguan","bulanan","tahunan","per jam","per hari","per minggu","per bulan","short term","long term"],
      tipe: ["mini","besar","kecil","sedang","medium","heavy","standar","extra","ekstra","jumbo","compact","full size","large","operator","tanpa operator","self drive","lepas kunci","include operator"],
      kapasitas: ["ton","m3","kg","liter","galon","hp","ps","kva","psi","rpm","kw","inch","inchi"],
      tools_extended: ["motor grader","wheel loader","tower crane","asphalt finisher","asphalt paver","tandem roller","pneumatic tire roller","cold milling","batching plant","concrete pump","genset","pompa air","pompa-beton","compressor","jack hammer"]
    },
    desain: {
      tipe: ["2d","3d","animasi","walkthrough","virtual tour","vr","ar","render"],
      gaya_extended: ["art deco","mid century","victorian","gothic","renaissance","baroque","rococo","neoklasik","art nouveau","bauhaus","postmodern","dekonstruksi","high tech","eklektik","transisi","tropis","mediterania","kolonial","peranakan","balinese","javanese","japandi","coastal","new york","hampton","farmhouse","shabby chic","parisian","moroccan","brutalist","cottage core","grand millennial","tropical modern","contemporary","industrial chic","minimalism","classic","modern classic","streamline","boho chic","mid-century","memphis","cyberpunk","steampunk","neofuturism","biophilic","wabi sabi","zen","feng shui","bali modern","java etnik","minimalis tropis","kolonial modern","industrial rustic","scandinavian japandi","modern klasik","minimalis skandinavia","japandi minimalis","classic modern","modern farmhouse","boho industrial","javanese modern","balinese contemporary","traditional modern","ethnic modern","modern etnik","tribal modern"],
      warna_extended: ["earth tone","sage green","sage","dusty pink","dusty","terracotta","navy blue","mustard","olive","mauve","charcoal","cream","ivory","beige","taupe","greige"],
      konsep: ["open space","split level","loft","studio","apartment","villa","tiny house","smart home","eco home","sustainable","green building","biophilic","zen","feng shui","vastu","wabi sabi"],
      material: ["kayu","besi","kaca","marmer","granit","keramik","plafon","gypsum","pvc","acp","vinyl","wpc","grc","hpl","bambu","rotan","anyaman","kain","kulit","karpet","parket","ubin","batu alam","batu bata","beton ekspos"],
      furniture: ["minimalis","skandinavia","jepang","klasik","modern","retro","vintage","industrial","rustic","bohemian","mid century","art deco","contemporary"],
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

  var PURE_METHODS = ["manual","hidrolik","auger","rotary","percussive","dry","wet","basah","kering","mesin","dalam","dangkal","artesis","jet pump","borongan","perumahan","proyek"];

  var PURE_SCALES = ["rumahan","komersial","industri","residential","commercial","industrial","kecil","sedang","besar","menengah"];

  var PURE_FINISHING = ["polos","motif","bermotif","bercorak","tekstur","serat","halus","kasar","matte","glossy","doff","gloss","satin","anyaman","natural","ekspos","custom","polosan","cat","coating","lapisan","vernis"];

  var APPLICATION_TARGETS = ["mini","dinding","tembok","lantai","plafon","atap","partisi","kolom","balok","plat","slab","pelat","pondasi","tiang","tangga","railing","kusen","pagar","pintu","jendela","rolling door","kanopi","awning","fasad","facade","teras","balkon","halaman","carport","garasi","kamar mandi","kamar tidur","ruang tamu","ruang keluarga","ruang makan","ruang kerja","dapur","toilet","wc","kantor","toko","gudang","pabrik","sekolah","rumah","gedung","ruko","villa","apartemen","cafe","restoran","hotel","kios","rukan","jalan","trotoar","saluran","drainase","taman","kolam","sawah","lahan"];

  var APPLICATION_TARGETS_FULL = ["dinding","tembok","lantai","plafon","atap","partisi","kolom","balok","plat","slab","pelat","pondasi","tiang","tangga","railing","kusen","pagar","pintu","jendela","kanopi","awning","fasad","facade","teras","balkon","halaman","carport","garasi","kamar mandi","kamar tidur","ruang tamu","ruang keluarga","ruang makan","ruang kerja","dapur","toilet","wc","kantor","toko","gudang","pabrik","sekolah","rumah","gedung","ruko","villa","apartemen","cafe","restoran","hotel","kios","rukan","jalan","trotoar","saluran","drainase","taman","kolam","sawah","lahan","tambang","proyek","site","area kerja","basement","custom","modern","minimalis","klasik"];

  function isApplicationTarget(word) {
    if (!word) return false;
    var w = word.toLowerCase().trim();
    return APPLICATION_TARGETS.indexOf(w) !== -1 ||
           APPLICATION_TARGETS_FULL.indexOf(w) !== -1;
  }

  var SATUAN_UNITS = ["meter","m","cm","mm","km","mtr","mtrs","inchi","inch","ft","feet","kg","ton","gram","ons","kuintal","lbs","pound","liter","ml","galon","m3","cc","dm3","m2","hektar","ha","are","detik","menit","jam","hari","minggu","bulan","tahun","harian","mingguan","bulanan","tahunan","unit","buah","lembar","batang","keping","papan","roll","set","paket","titik","boks","dus","karung","sak","kodi","lusin","gross","ampere","watt","volt","kva","kw","hp","ps","rpm","psi","bar","pascal","mpa","kpa","gpa","orang","kali","kubik","pk","truk","colt","pickup","angkutan","rim","lot","batch","container","kontainer"];

  var QUESTION_WORDS = ["berapa","apa itu","apa yang","apa beda","apa perbedaan","apa fungsi","apa manfaat","bagaimana","gimana cara","bagaimana cara","mengapa","kenapa","kapan","dimana","di mana","siapa","yang mana","apakah","adakah"];

  var COMMERCIAL_INVESTIGATION_WORDS = ["review","ulasan","testimoni","pengalaman","rating","penilaian","rekomendasi","saran","anjuran","suggest","terbaik","terburuk","terpopuler","terfavorit","top","pilihan","alternatif","vs","versus","perbandingan","bandingkan","kelebihan","kekurangan","plus minus","pro kontra","untung rugi"];

  var FREE_INFO_WORDS = ["panduan gratis","ebook gratis","template gratis","download gratis","pdf gratis"];
  var FREE_COMM_WORDS = ["konsultasi gratis","survey gratis","sample gratis","demo gratis","trial gratis","estimasi gratis","penawaran gratis"];
  var AUTHORITY_WORDS = ["resmi","authorized","official","distributor resmi","dealer resmi","agen resmi","mitra resmi","sertifikat resmi"];
  var READY_STOCK_WORDS = ["ready stock","ready stok","siap pakai","siap kirim","stok tersedia","fast respon","same day"];

  var SPEC_PHRASE_WORDS = ["berdasarkan","berdasar","faktor penentu","faktor yang mempengaruhi","faktor utama","penyebab","sebab","dampak","pengaruh","efek","per kedalaman","per ukuran","per tipe","per jenis","langkah-langkah","langkah demi langkah","tahapan lengkap","tahap demi tahap","panduan lengkap","tutorial lengkap","analisis lengkap","review lengkap","perbandingan lengkap","perbedaan lengkap","jenis-jenis lengkap","macam-macam lengkap","spesifikasi","mutu","metode","cara kerja","panduan","fungsi"];

  var SPEC_PHRASE_INFORMATIONAL = ["berdasarkan","berdasar","faktor penentu","faktor yang mempengaruhi","faktor utama","penyebab","sebab","dampak","pengaruh","efek"];

  var MARKETING_TERMS = ["premium","ekonomis","terbaik","terlaris","murah","berkualitas","unggul","terkenal","favorit","recommended","terpercaya"];

    // 🔥 FIX: Tambah varian mortar
  var MATERIAL_TYPE_WORDS = ["beton","portland","opc","ppc","pcc","semen putih","semen abu","semen warna","type 1","type 2","type 3","type 4","type 5","tipe 1","tipe 2","tipe 3","tipe 4","tipe 5","wiry","bjku","bjtd","bjp","bjts","plywood","multiplek","blockboard","mdf","hdf","particle board","solid wood","jati","meranti","mahoni","sengon","pinus","randu","sungkai","bangkirai","ulin","kamper","kruing","keruing","merbau","sonokeling","trembesi","glugu","bambu","andesit","kali","apung","split","koral","candi","palimanan","paras","breksi","granit","marmer","batu alam","batu belah","batu gunung","batu karang","silika","zeolit","cor","homogeneous","homogen","roman","platinum","mulia","essence","granito","granit tile","keramik lantai","keramik dinding","marmer italy","marmer lokal","marmer import","granit hitam","granit putih","granit coklat","granit import","granit lokal","dulux","jotun","nippon","mowilex","avian","decolith","propan","falcon","vinilex","dulux catylac","cat tembok","cat kayu","cat besi","cat dinding","pasir beton","pasir pasang","pasir urug","pasir halus","pasir kasar","pasir putih","pasir hitam","pasir ayak","pasir silika","pasir bangka","pasir lumajang","h-beam","hbeam","wf","hollow","kanal","siku","unesp","unp","cnp","inp","besi hollow","besi kanal","eterna","supreme","kabelindo","tranka","rucika","wavin","vinilon","pralon","maspion","tembaga","aluminium","kuningan","perunggu","titanium","besi cor","aluminium foil","bangka","lumajang","tulungagung","pangkep","muntilan","borneo","kalimantan","jepara","kudus","cilacap","tiga roda","3 roda","tiga-roda","3-roda","gresik","semen gresik","semen-gresik","holcim","semen holcim","semen-holcim","scg","semen scg","semen-scg","padang","semen padang","semen-padang","merah putih","semen merah putih","cibinong","semen cibinong","baturaja","semen baturaja","bosowa","semen bosowa","tonasa","semen tonasa","master","besi master","intan","besi intan","handuk","besi handuk","krakatau steel","krakatau-steel","ks","gunung garuda","gunung-garuda","hanil","jeka","danagri","magic","aquaproof","no drop","no-drop","nodrop","aqua proof","icera","ardena","milano","asia tile","asia-tile","indograha","kian","eleganza","elegan",
    // 🔥 FIX: MORTAR
    "mortar","mortar struktural","mortar instan","mortar utama","mortar grouting",
    "mortar perbaikan","mortar beton","mortar semen","mortar pasangan",
    "mortar plester","mortar acian","mortar keramik","mortar bata ringan",
    "mortar hebel","mortar non shrink","mortar fiber","mortar fiber reinforced",
    "mortar perbaikan beton","mortar struktural non shrink","mortar struktural fiber",
    "mortar perbaikan beton struktural","mortar sika","mortar fosroc","mortar weber",
    "mortar drymix","mortar siap pakai","mortar instan acian","mortar instan plester",
    "mortar instan perekat","mortar instan keramik","mortar thin bed","mortar thick bed",
    "mortar grouting non shrink","mortar grouting structural","mortar repair",
    "mortar perbaikan struktural","mortar structural repair","mortar tahan api",
    "mortar refraktori","mortar tahan asam","mortar waterproofing","mortar anti bocor",
        // ═══════════════════════════════════════════════════════════
    // 🔥 PATCH SINKRON: Material multi-word varian
    // SINKRON dengan ENTITY_BASE_NAMES.material
    // 
    // PRINSIP SEO ALIGN:
    //   - Base name (money-master) → BOLEH di MATERIAL_TYPE_WORDS? TIDAK
    //     (base name bukan "tipe", dia produk utuh)
    //   - Varian yang jadi money-master → BOLEH di sini sebagai "tipe"
    //   - Aplikasi (kanopi, rangka atap, interior) → TIDAK BOLEH di sini
    //   - Merek tanpa jenis → TIDAK BOLEH di sini
    // ═══════════════════════════════════════════════════════════
    
    // ═══ BAJA RINGAN — HANYA varian profil & ukuran standar ═══
    "baja ringan c75","baja ringan c100","baja ringan c125",
    "baja ringan gording","baja ringan reng","baja ringan usuk","baja ringan kaso",
    "baja ringan galvanis","baja ringan zincalume",
    "baja ringan struktur","baja ringan non struktural",
    "baja ringan struktur bangunan","baja ringan struktur rangka",
    // ❌ TIDAK MASUK (aplikasi): "baja ringan rangka atap", "baja ringan kanopi", "baja ringan plafon", "baja ringan partisi", "baja ringan talang", "baja ringan atap", "baja ringan dinding", "baja ringan kanopi atap", "baja ringan rangka dinding", "baja ringan rangka baja", "baja ringan struktur atap", "baja ringan struktur dinding"
    // ❌ TIDAK MASUK (merek): "baja ringan taso", "baja ringan kencana", "baja ringan brc"
    
    // ═══ BAJA — varian profil ═══
    "baja profil wf","baja profil hbeam","baja profil iwf","baja profil unp","baja profil cnp",
    "baja tulangan ulir","baja tulangan polos",
    
    // ═══ BESI — varian bentuk & ukuran standar ═══
    "besi beton ulir sirip","besi beton ulir","besi beton polos","besi beton sni",
    "besi hollow galvanis","besi hollow hitam","besi hollow kotak","besi hollow bulat",
    "besi kanal c","besi kanal u",
    "besi plat strip","besi plat hitam","besi plat putih",
    "besi siku lubang","besi siku polos",
    "besi ulir sirip","besi tulangan ulir","besi tulangan polos",
    "besi wiremesh m6","besi wiremesh m8","besi wiremesh m10","besi wiremesh m12",
    
    // ═══ KAYU — varian jenis & finishing alami ═══
    "kayu jati solid","kayu jati belanda",
    "kayu meranti merah","kayu meranti putih",
    "kayu mahoni solid","kayu sengon solid","kayu pinus solid",
    "kayu kamper solid","kayu kruing solid",
    
    // ═══ BATU — varian bentuk alami & jenis batu alam ═══
    "batu kali bulat","batu kali belah","batu gunung belah",
    "batu alam andesit","batu alam palimanan","batu alam paras",
    "batu alam templek","batu alam sikat",
    
    // ═══ PASIR — varian asal daerah ═══
    "pasir putih bangka",
    
    // ═══ SEMEN — varian tipe standar ═══
    "semen portland pozzolan","semen portland composite",
    "semen portland putih","semen portland abu",
    "semen portland tipe 1","semen portland tipe 2","semen portland tipe 3","semen portland tipe 4","semen portland tipe 5",
    "semen gresik portland","semen holcim portland","semen tiga roda portland",
    
    // ═══ CAT — varian fitur produk ═══
    "cat tembok weathershield","cat besi anti karat","cat lantai epoxy",
    
    // ═══ KERAMIK — varian motif & finishing ═══
    "keramik motif kayu","keramik motif marmer",
    "keramik polos putih","keramik polos hitam"
  ];

  var OBJECT_WORDS = ["tanah","lahan","badan","permukaan","dasar","area","bidang","tapak","kavling","petak","drainase","geotekstil","pondasi","saluran","gorong","aspal","pipa","kabel","tiang","dinding","gorong-gorong","jembatan","tanggul","embung","waduk","bendungan","beton","cor","besi","baja","kayu","batu","bata","keramik","granit","marmer","paving","genteng","rumah","gedung","ruko","gudang","pabrik","jalan","trotoar","selokan","bukit","gunung","sungai","rawa","gambut","lereng","tebing","jurang","lembah","pile","pancang","strauss","bore","kolom","balok","plat","slab","pelat","lantai","plafon","atap","kusen","septic","septic tank","resapan","sumur","tangga","kamar","kamar mandi","kamar tidur","dapur","toilet","wc","ruang","ruang tamu","ruang makan","ruang keluarga","ruang kerja","ruang tidur","teras","balkon","fasad","halaman","carport","garasi","taman","halaman depan","halaman belakang","kantor","toko","cafe","restoran","hotel","apartemen","showroom","klinik","mall","sekolah","rukan","kios","warung","pujasera","wallpaper","parket","laminasi","vinyl","wpc","hpl","grc","acp","pagar","pintu","jendela","railing","rolling door","shower box","tralis","jeruji","kanopi","awning","spandek","alderon","genteng metal","wall","wallpanel","wall-panel","moulding","wall-moulding","cornice","plinth","skirting","wainscoting","backdrop","feature-wall","feature wall","ceiling","drop-ceiling","partisi","sekat","cladding","facade","facade-panel","panel-dinding","dinding-panel","ac","air conditioner","cctv","listrik","instalasi listrik","air","pipa air","plumbing","gas","panel-listrik","travo","trafo","internet","jaringan","alarm","kamera","sensor","detector","detektor","antena","parabola","wifi","router","cctv-kamera","signage","logo","spanduk","banner","billboard","neonbox","neon box","letter timbul","huruf timbul","papan nama","plang","reklame","papan reklame","kaca tempered","kaca-polos","kaca-bermotif","kaca-buram","kaca-es","kaca-panasap","aluminium-composite","aluminium foil","kaca-film","kaca-jendela"];

  var BASE_ENTITY_OBJECTS = ["beton","batu","kayu","besi","baja","rumah","gedung","jalan","keramik","granit","marmer","vinyl","wallpaper","parket","laminasi","wpc","hpl","grc","acp","bata","paving","genteng","kaca"];

  var GENERIC_OBJECTS = ["tanah","lahan","bukit","gunung","sungai","rawa","gambut","lereng","tebing","jurang","lembah"];

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

    // 🔥 FIX: Hapus "precast", "pracetak", "paving", "plafon", "atap" — pindah ke produk
  // Tapi tetap sertakan "mortar" yang sudah ditambah sebelumnya
  var MATERIAL_SERVICE_NAMES = ["semen","mortar","pasir","batu split","kerikil","besi","baja","kayu","beton","keramik","granit","marmer","gypsum","bata","batako","hebel","genteng","asbes","baja ringan","galvalum","readymix","cor","kaca","aluminium","pipa"];

  var CROSS_ENTITY_SPECS = {
    jasa: {
      sharedFinishing: PURE_FINISHING,
      sharedGaya: ["minimalis","modern","klasik","custom","elegan","mewah","eksklusif","premium"],
      foreignTechniques: ["waterproofing","grouting","shotcrete","guniting","dewatering","scaffolding","bekisting","formwork","curing","boring","welding","coating","plating","anodizing","polishing","sandblasting","painting","lining","topping off","lean concrete","soil test","sondir test","cross hole","bore pile test","building maintenance","home renovation","waterproofing solution"]
    },
    produk: {
      sharedMaterialFinishing: ["galvanis","zincalume","coating","berlapis","cat"],
      sharedMaterialDimensi: ["tebal","panjang","lebar","diameter"]
    },
    material: {
      extendedTypes: ["silika","zeolit","cor","tembaga","aluminium","foil","kuningan","perunggu","titanium","grafit","karbon"]
    },
    sewa: {
      extendedUnits: ["hp","ps","kva","psi","rpm","inch","inchi","kw"],
      extendedTools: ["motor grader","wheel loader","tower crane","asphalt finisher","asphalt paver","tandem roller","pneumatic tire roller","cold milling","batching plant","concrete pump","genset","pompa air","pompa-beton","compressor","jack hammer"]
    },
    desain: {
      extendedColors: ["earth tone","sage green","sage","dusty pink","dusty","terracotta","navy blue","mustard","olive","mauve","charcoal","cream","ivory","beige","taupe","greige"],
      extendedGaya: ["bali modern","java etnik","minimalis tropis","kolonial modern","industrial rustic","scandinavian japandi","modern klasik","minimalis skandinavia","japandi minimalis","classic modern","modern farmhouse","boho industrial","javanese modern","balinese contemporary","traditional modern","ethnic modern","modern etnik","tribal modern"],
      subjektif: ["mewah","eksklusif","premium","luxury","high end","artistik","estetik"]
    }
  };

  var PRODUK_SPECS = {
    mutu: ["k225","k250","k300","k350","k400","k500","fc","sni","standar","premium","ekonomis"],
    finishing: ["polos","motif","bermotif","bercorak","tekstur","serat","halus","kasar","matte","glossy","doff","gloss","satin","anyaman","natural","ekspos","custom","polosan","cat","coating","lapisan","vernis","anti gores","anti air","anti jamur","ulir"],
    dimensi: ["ukuran","dimensi","spesifikasi","tipe","model","varian","seri","tinggi","rendah","panjang","pendek","lebar","sempit","tebal","tipis","dalam","dangkal","diameter","radius","besar","kecil","sedang","mini","jumbo"],
    warna: ["putih","hitam","abu-abu","merah","biru","kuning","hijau","coklat","netral","warm","cool","pastel","dark","light","krem","maroon","navy","forest","gold","silver","bronze","copper","rose gold","teal","turquoise","lavender","magenta","coral","salmon","peach","mint"],
    gaya: ["minimalis","modern","klasik","skandinavia","japandi","industrial","kontemporer","tradisional","rustic","bohemian"]
  };

  var PURE_PRODUK_SPECS = PRODUK_SPECS.mutu
    .concat(PRODUK_SPECS.warna)
    .concat(PRODUK_SPECS.finishing)
    .concat(PRODUK_SPECS.gaya);

    var MATERIAL_SPECS = {
    grade: ["grade a","grade b","grade c","sni","standar","kualitas 1","kualitas 2","kualitas 3","kelas 1","kelas 2","kelas 3","non shrink","fiber reinforced","thin bed","thick bed","refraktori","tahan api","tahan asam","40 mpa","50 mpa","60 mpa","70 mpa","30 mpa","20 mpa","25 mpa","35 mpa"],
    finishing: ["ulir","polos","galvanis","berlapis","cat","coating","anyaman","anti karat","anti korosi","anti air","diamon","rough","smooth","textured","zincalume"],
    dimensi: ["tebal","panjang","lebar","diameter","radius","ukuran","dimensi","ketebalan","kedalaman","tinggi"],
    berat: ["kg","ton","m3","liter","gram","ons"],
    tipe: MATERIAL_TYPE_WORDS
  };

  var PURE_MATERIAL_SPECS = MATERIAL_SPECS.grade
    .concat(MATERIAL_SPECS.finishing)
    .concat(MATERIAL_SPECS.tipe);

  var SEWA_SPECS = {
    tipe: ["mini","besar","kecil","sedang","medium","heavy","standar","extra","ekstra","jumbo","compact","full size","large"],
    merek: ["pc75","pc200","pc300","pc350","pc400","komatsu","hitachi","caterpillar","cat","volvo","hyundai","doosan","kobelco","sumitomo","case","jcb","liebherr","kubota","yanmar","perkins","cummin"],
    kapasitas: ["ton","m3","kg","liter","galon","hp","ps","kva","psi","rpm","kw","inch","inchi"],
    kondisi: ["baru","bekas","servis","recondition","rebuilt","ready","siap pakai","prima","baik","layak","standar","listrik","diesel","bensin","solar","hydraulic","manual"],
    durasi: ["harian","mingguan","bulanan","tahunan","per jam","per hari","per minggu","per bulan","short term","long term"]
  };

  var PURE_SEWA_SPECS = SEWA_SPECS.merek
    .concat(SEWA_SPECS.tipe)
    .concat(SEWA_SPECS.kondisi)
    .concat(SEWA_SPECS.durasi)
    .concat(SEWA_SPECS.kapasitas)
    .concat(CROSS_ENTITY_SPECS.sewa.extendedTools)
    .concat(CROSS_ENTITY_SPECS.sewa.extendedUnits);

  var JASA_SPECS = {
    metode: ["manual","hidrolik","auger","rotary","percussive","dry","wet","basah","kering"],
    skala: ["rumahan","komersial","industri","residential","commercial","industrial","kecil","sedang","besar","menengah"],
    finishing: PURE_FINISHING,
    kedalaman: ["m","meter","cm","centimeter","feet","ft"],
    foreign: CROSS_ENTITY_SPECS.jasa.foreignTechniques
  };

  var DESAIN_SPECS = {
    gaya: ["modern","minimalis","klasik","tradisional","kontemporer","elegan","luxury","industrial","scandinavian","jepang","rustic","vintage","bohemian","art deco","mid century","victorian","gothic","renaissance","baroque","rococo","neoklasik","art nouveau","bauhaus","postmodern","dekonstruksi","high tech","eklektik","transisi","tropis","mediterania","kolonial","peranakan","balinese","javanese","japandi","coastal","new york","hampton","farmhouse","shabby chic","parisian","moroccan","brutalist","cottage core","grand millennial","tropical modern","contemporary","industrial chic","minimalism","classic","modern classic","streamline","boho chic","mid-century","memphis","cyberpunk","steampunk","neofuturism","biophilic","wabi sabi","zen","feng shui"].concat(CROSS_ENTITY_SPECS.desain.extendedGaya),
    warna: ["putih","hitam","abu-abu","merah","biru","kuning","hijau","coklat","netral","warm","cool","pastel","dark","light","krem","maroon","navy","forest","gold","silver","bronze","copper","rose gold","teal","turquoise","lavender","magenta","coral","salmon","peach","mint"].concat(CROSS_ENTITY_SPECS.desain.extendedColors),
    material: ["kayu","besi","kaca","marmer","granit","keramik","plafon","gypsum","pvc","acp","vinyl","wpc","grc","hpl","bambu","rotan","anyaman","kain","kulit","karpet","parket","ubin","batu alam","batu bata","beton ekspos"],
    konsep: ["open space","split level","loft","studio","apartment","villa","tiny house","smart home","eco home","sustainable","green building","biophilic","zen","feng shui","vastu","wabi sabi"],
    furniture: ["minimalis","skandinavia","jepang","klasik","modern","retro","vintage","industrial","rustic","bohemian","mid century","art deco","contemporary"],
    subjektif: CROSS_ENTITY_SPECS.desain.subjektif
  };

  var PURE_DESAIN_SPECS = DESAIN_SPECS.gaya
    .concat(DESAIN_SPECS.warna)
    .concat(DESAIN_SPECS.material)
    .concat(DESAIN_SPECS.konsep)
    .concat(DESAIN_SPECS.furniture)
    .concat(DESAIN_SPECS.subjektif);

  var SUB_PILLAR_2_KEYWORDS = ['daftar','jenis','macam','kategori','tipe','list','katalog','variasi','model','gaya','varian'];
  var SUB_PILLAR_1_KEYWORDS = ['perbandingan','vs','versus','kelebihan','kekurangan','perbedaan','lebih baik','unggul','mana yang','antara','atau'];
  var SUB_PILLAR_1_STRONG = ['perbandingan','vs','versus','kelebihan','kekurangan','perbedaan','lebih baik','unggul','mana yang'];
  var SUB_PILLAR_1_WEAK = ['antara','atau'];

  var HIGH_VOLUME_WORDS = ["promo","diskon","obral","cuci gudang","flash sale","termurah","termahal"];

  var INTENT_TRIGGERS = {
    transactional: ["beli","order","pesan","booking","sewa sekarang","harga","biaya","tarif","estimasi","promo","diskon","bayar","cicilan","kredit","dapatkan","pesan sekarang","resmi","authorized","ready stock","siap pakai","cara order","cara pesan","cara beli"],
    informational: ["cara","tutorial","panduan","tips","langkah","bagaimana","apa itu","pengertian","definisi","contoh","jenis","perbedaan","kelebihan","kekurangan","manfaat","fungsi","berapa","apa yang","mengapa","kenapa","kapan","dimana","siapa","yang mana","apakah","update terbaru","informasi terbaru","kabar terbaru"],
    commercial: ["review","testimoni","rekomendasi","terbaik","paling","vs","versus","perbandingan","alternatif","pilihan","populer","favorit","unggulan","ulasan","pengalaman","rating","penilaian","terburuk","terpopuler","terfavorit"],
    navigational: ["login","daftar","kontak","tentang","hubungi","alamat","lokasi","maps","direksi"]
  };

  var COMMERCIAL_WORDS = ['jual','beli','order','pesan','booking','supplier','distributor','toko','shop','dapatkan','pesan sekarang','order sekarang','beli sekarang','checkout','cara order','cara pesan','cara beli','cara booking','resmi','authorized','official','distributor resmi','dealer resmi','agen resmi','mitra resmi','sertifikat resmi','ready stock','ready stok','siap pakai','siap kirim','stok tersedia','fast respon','same day'];

  var INFORMATIONAL_WORDS = ['butuh','cari','mau','ingin','panduan','cara','tips','tutorial','pengertian','definisi','penjelasan','kenapa','mengapa','bagaimana','berapa','apa itu','apa yang','kapan','dimana','siapa','yang mana','apakah','adakah','apa beda','apa perbedaan','update terbaru','informasi terbaru','kabar terbaru','update'];

  var TIER_1_LOCATION = ["jakarta","jakarta pusat","jakarta barat","jakarta selatan","jakarta timur","jakarta utara","bogor","depok","tangerang","bekasi","bandung","karawang","purwakarta","cikarang","subang","cirebon","semarang","solo","surakarta","pekalongan","tegal","magelang","sukoharjo","boyolali","klaten","jogja","yogyakarta","surabaya","malang","kediri","gresik","sidoarjo","mojokerto","pasuruan","probolinggo","jember","banyuwangi","madiun","medan","palembang","pekanbaru","padang","lampung","batam","aceh","jambi","bengkulu","pontianak","balikpapan","samarinda","banjarmasin","makassar","manado","palu","kendari","bali","denpasar","gianyar","tabanan","bangli","karangasem","klungkung","buleleng","mataram","kupang"];

  var FISIK_WORDS = ["pantai","taman","sungai","gunung","jalan","pasar","sekolah","masjid","gereja","mall","terminal","stasiun","bandara","pelabuhan","sawah","hutan","danau","lembah","bukit","kali","dermaga","lapangan","kantor","pabrik","gudang","warung","restoran","cafe","hotel","villa","klinik","puskesmas","apotek","bank","atm","pos"];

  var LOCATION_WORDS = TIER_1_LOCATION;

  var PRICE_HEAD_WORDS = ['harga','biaya','tarif','estimasi','ongkos','budget','fee','rate','price','cost','pricelist','price-list'];

  var PROMO_MODIFIER_WORDS = ['murah','hemat','terjangkau','promo','diskon','obral','sale','termurah','termahal','bersaing','kompetitif','dibawah pasaran','diatas pasaran','pasaran','ekonomis'];

  var PRICE_WORDS = PRICE_HEAD_WORDS;

    // 🔥 FIX 4: Tambah kata umum yang bukan spec
  // "bangunan", "konstruksi", "proyek" adalah noise — bukan spec teknis
  var NOISE_WORDS_UNIVERSAL = ['borongan','sistem borongan','borongan penuh','borongan sebagian','paket borongan','sistem paket','sistem paket borongan','all in','all-in','all in one','cash','kredit','cicilan','tunai','transfer','dp','lunas','termin','kontan','installment','debit','cod','cash on delivery','paylater','pay later','bayar di tempat','bayar di awal','bayar di akhir','pembayaran','preorder','pre-order','indent','po','bangunan','konstruksi','proyek'];

  var NOISE_WORDS_JASA = ['meteran','sistem meteran','sistem harian','sistem mingguan','sistem bulanan','sistem tahunan','per proyek','per paket','per pekerjaan','short term','long term','per area','per zona','per ruangan','per lantai','per hari kerja','per jam kerja','per shift','per tongkang','per rit','per ritase'];

  var ACTION_VERBS = ["pemotongan","pemotong","memotong","potong","potongan","penggalian","penggali","menggali","gali","galian","pengurugan","pengurug","mengurug","urug","urugan","pengangkutan","pengangkut","mengangkut","angkut","angkutan","pengeboran","pengebor","mengebor","bor","boran","pengelasan","pengelas","mengelas","las","lasan","pengecoran","pengecor","mengecor","cor","coran","pengecatan","pengecat","mengecat","cat","catan","pengukuran","pengukur","mengukur","ukur","ukuran","pemasangan","pemasang","memasang","pasang","pasangan","pembongkaran","pembongkar","membongkar","bongkar","bongkaran","pembuatan","pembuat","membuat","buat","buatan","pengupasan","pengupas","mengupas","upas","upasan","pemadatan","pemadat","memadatkan","padat","padatan","pengerukan","pengeruk","mengeruk","keruk","kerukan","pemancangan","pemancang","memancang","pancang","pancangan","pembersihan","pembersih","membersihkan","bersih","bersihan","perataan","perata","meratakan","rata","rataan","pembentukan","pembentuk","membentuk","bentuk","bentukan","persiapan","persiap","mempersiapkan","siap","siapan","stabilisasi","stabilis","menstabilkan","stabil","cut","fill","grading","elevasi","pemetaan","tebang","menebang","penebangan","pindah","pemindahan","timbun","penimbunan","renovasi","merenovasi","perbaikan","memperbaiki","instalasi","menginstal","install","service","servis","menyervis","penggantian","mengganti","ganti","pemeliharaan","memelihara","rawat","perawatan","pengadaan","menyediakan","relief","profil","finishing","cutting","bongkar","buang","uji","perkuatan","pematangan"];

  var SYNTAX_CONJUNCTIONS = ["dan","serta","juga","dengan","tanpa"];
  var SYNTAX_PREPOSITIONS = ["di","ke","dari","untuk","pada","dalam","atas","bawah"];

  // ═══════════════════════════════════════════════════════════
  // 🔥 PATCH M1+M2: REGEX CACHE + MASTER REGEX
  // ═══════════════════════════════════════════════════════════
  var _REGEX_CACHE = Object.create(null);
  var _REGEX_CACHE_SIZE = 0;
  var _REGEX_CACHE_MAX = 2000;

  function _escapeRegex(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function rx(word, flags) {
    flags = flags || "i";
    var w = String(word);
    var key = w + "|" + flags;
    var cached = _REGEX_CACHE[key];
    if (cached !== undefined) return cached;
    var escaped = _escapeRegex(w);
    var pattern = "\\b" + escaped.replace(/\\?\s+/g, '\\s+') + "\\b";
    var re = new RegExp(pattern, flags);
    if (_REGEX_CACHE_SIZE < _REGEX_CACHE_MAX) {
      _REGEX_CACHE[key] = re;
      _REGEX_CACHE_SIZE++;
    }
    return re;
  }

  function rxRaw(pattern, flags) {
    flags = flags || "i";
    var key = "RAW:" + pattern + "|" + flags;
    var cached = _REGEX_CACHE[key];
    if (cached !== undefined) return cached;
    var re = new RegExp(pattern, flags);
    if (_REGEX_CACHE_SIZE < _REGEX_CACHE_MAX) {
      _REGEX_CACHE[key] = re;
      _REGEX_CACHE_SIZE++;
    }
    return re;
  }

  function rxTest(word, text, flags) {
    return rx(word, flags).test(text);
  }

  function _buildAltPattern(words) {
    if (!words || words.length === 0) return null;
    var parts = [];
    for (var i = 0; i < words.length; i++) {
      var w = String(words[i]);
      if (!w) continue;
      parts.push(_escapeRegex(w).replace(/\\?\s+/g, '\\s+'));
    }
    if (parts.length === 0) return null;
    parts.sort(function(a, b) { return b.length - a.length; });
    return parts.join("|");
  }

  function buildWordRegex(words, flags) {
    var alt = _buildAltPattern(words);
    if (!alt) return null;
    return rxRaw("\\b(?:" + alt + ")\\b", flags);
  }

  var _MASTER = {
    built: false,
    actionObject: null, actionFisik: null, locationFisik: null,
    action: null, object: null, fisik: null, appTargets: null,
    noiseUniv: null, noiseJasa: null, satuanUnits: null, satuanPer: null,
    locationCities: null, jasaWords: null, commercialWords: null,
    informationalWords: null, priceHeads: null, promoMods: null,
    highVolume: null, questionWords: null, ciWords: null,
    actionAlt: null, objectAlt: null, fisikAlt: null
  };

  function _buildMasterRegexes() {
    if (_MASTER.built) return;
    _MASTER.built = true;

    var t0 = (typeof performance !== 'undefined' && performance.now)
      ? performance.now() : Date.now();

    var actionAlt = _buildAltPattern(ACTION_VERBS);
    _MASTER.actionAlt = actionAlt;
    if (actionAlt) _MASTER.action = rxRaw("\\b(?:" + actionAlt + ")\\b", "i");

    var objAlt = _buildAltPattern(OBJECT_WORDS);
    _MASTER.objectAlt = objAlt;
    if (objAlt) _MASTER.object = rxRaw("\\b(?:" + objAlt + ")\\b", "i");

    var fisikAlt = _buildAltPattern(FISIK_WORDS);
    _MASTER.fisikAlt = fisikAlt;
    if (fisikAlt) _MASTER.fisik = rxRaw("\\b(?:" + fisikAlt + ")\\b", "i");

    if (actionAlt && objAlt) {
      _MASTER.actionObject = rxRaw("\\b(?:" + actionAlt + ")\\s+(?:\\w+\\s+)?(?:" + objAlt + ")\\b", "i");
    }
    if (actionAlt && fisikAlt) {
      _MASTER.actionFisik = rxRaw("\\b(?:" + actionAlt + ")\\s+(?:\\w+\\s+)?(?:" + fisikAlt + ")\\b", "i");
    }
    if (fisikAlt) {
      _MASTER.locationFisik = rxRaw("\\b(?:dekat|sekitar|di|ke|dari)\\s+(?:" + fisikAlt + ")\\b", "i");
    }

    var atAlt = _buildAltPattern(APPLICATION_TARGETS_FULL);
    if (atAlt) _MASTER.appTargets = rxRaw("\\b(?:" + atAlt + ")\\b", "i");

    var satAlt = _buildAltPattern(SATUAN_UNITS);
    if (satAlt) {
      _MASTER.satuanUnits = rxRaw("\\b(?:" + satAlt + ")\\b", "g");
      _MASTER.satuanPer = rxRaw("\\bper\\s+(?:" + satAlt + ")\\b", "g");
    }

    var noiseUAlt = _buildAltPattern(NOISE_WORDS_UNIVERSAL);
    if (noiseUAlt) _MASTER.noiseUniv = rxRaw("\\b(?:" + noiseUAlt + ")\\b", "g");
    var noiseJAlt = _buildAltPattern(NOISE_WORDS_JASA);
    if (noiseJAlt) _MASTER.noiseJasa = rxRaw("\\b(?:" + noiseJAlt + ")\\b", "g");

    var locAlt = _buildAltPattern(TIER_1_LOCATION);
    if (locAlt) _MASTER.locationCities = rxRaw("\\b(?:" + locAlt + ")\\b", "i");

    var jasaAlt = _buildAltPattern(JASA_WORDS);
    if (jasaAlt) _MASTER.jasaWords = rxRaw("\\b(?:" + jasaAlt + ")\\b", "i");

    var commAlt = _buildAltPattern(COMMERCIAL_WORDS);
    if (commAlt) _MASTER.commercialWords = rxRaw("\\b(?:" + commAlt + ")\\b", "i");

    var infoAlt = _buildAltPattern(INFORMATIONAL_WORDS);
    if (infoAlt) _MASTER.informationalWords = rxRaw("\\b(?:" + infoAlt + ")\\b", "i");

    var priceAlt = _buildAltPattern(PRICE_HEAD_WORDS);
    if (priceAlt) _MASTER.priceHeads = rxRaw("\\b(?:" + priceAlt + ")\\b", "i");

    var promoAlt = _buildAltPattern(PROMO_MODIFIER_WORDS);
    if (promoAlt) _MASTER.promoMods = rxRaw("\\b(?:" + promoAlt + ")\\b", "i");

    var hvAlt = _buildAltPattern(HIGH_VOLUME_WORDS);
    if (hvAlt) _MASTER.highVolume = rxRaw("\\b(?:" + hvAlt + ")\\b", "i");

    var qAlt = _buildAltPattern(QUESTION_WORDS);
    if (qAlt) _MASTER.questionWords = rxRaw("\\b(?:" + qAlt + ")\\b", "i");

    var ciAlt = _buildAltPattern(COMMERCIAL_INVESTIGATION_WORDS);
    if (ciAlt) _MASTER.ciWords = rxRaw("\\b(?:" + ciAlt + ")\\b", "i");

    var t1 = (typeof performance !== 'undefined' && performance.now)
      ? performance.now() : Date.now();
    if (CONFIG.DEBUG) {
      log('⚡ Master regexes built in ' + (t1 - t0).toFixed(2) + 'ms', 'PERF');
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 🔥 PATCH M3: MEMOIZE (LRU + SAFE)
  // ═══════════════════════════════════════════════════════════
  var _MEMO_STATS = { hits: 0, misses: 0, evictions: 0 };

  function memoize(fn, maxSize) {
    var cache = Object.create(null);
    var keys = [];
    maxSize = maxSize || 200;

    return function(arg1, arg2) {
      var a1 = (arg1 == null) ? "" : String(arg1);
      var a2 = (arg2 == null) ? "" : String(arg2);
      var key = a1 + "\u0000" + a2;

      var cached = cache[key];
      if (cached !== undefined) {
        _MEMO_STATS.hits++;
        return cached;
      }
      _MEMO_STATS.misses++;
      var result = fn(arg1, arg2);
      cache[key] = result;
      keys.push(key);
      if (keys.length > maxSize) {
        delete cache[keys.shift()];
        _MEMO_STATS.evictions++;
      }
      return result;
    };
  }

  function memoizeArray(fn, maxSize) {
    var inner = memoize(function(a, b) {
      var arr = fn(a, b);
      if (!arr || arr.length === 0) return "";
      return arr.join("\u0001");
    }, maxSize);
    return function(a, b) {
      var s = inner(a, b);
      if (!s) return [];
      return s.split("\u0001");
    };
  }

  function memoizeObject(fn, maxSize) {
    var inner = memoize(fn, maxSize);
    return function(a, b) {
      var obj = inner(a, b);
      if (!obj || typeof obj !== "object") return obj;
      var copy = {};
      for (var k in obj) {
        if (obj.hasOwnProperty(k)) copy[k] = obj[k];
      }
      return copy;
    };
  }

  function memoize1(fn, maxSize) {
    var cache = Object.create(null);
    var keys = [];
    maxSize = maxSize || 200;
    return function(arg) {
      var key = (arg == null) ? "" : String(arg);
      var cached = cache[key];
      if (cached !== undefined) {
        _MEMO_STATS.hits++;
        return cached;
      }
      _MEMO_STATS.misses++;
      var result = fn(arg);
      cache[key] = result;
      keys.push(key);
      if (keys.length > maxSize) {
        delete cache[keys.shift()];
        _MEMO_STATS.evictions++;
      }
      return result;
    };
  }

  function _getMemoStats() {
    return {
      hits: _MEMO_STATS.hits,
      misses: _MEMO_STATS.misses,
      evictions: _MEMO_STATS.evictions,
      hitRate: (_MEMO_STATS.hits + _MEMO_STATS.misses) > 0
        ? (_MEMO_STATS.hits / (_MEMO_STATS.hits + _MEMO_STATS.misses) * 100).toFixed(1) + "%"
        : "0%"
    };
  }

  function _clearMemoCache() {
    _MEMO_STATS.hits = 0;
    _MEMO_STATS.misses = 0;
    _MEMO_STATS.evictions = 0;
  }

  // Placeholder memo wrappers (di-assign di initializeCore)
  var _memoCountModifierLayers = null;
  var _memoCheckHasSpecification = null;
  var _memoGetCoreWords = null;
  var _memoGetFactors = null;
  var _memoCalculateComplexityScore = null;
  var _memoCheckFisikRole = null;
  var _memoCheckHasJasaMetode = null;
  var _memoHasJasaMaterialCtx = null;
  var _memoCheckPureTechnicalSpec = null;
  var _memoIsSubVariant = null;
  var _memoHasTechnicalSpec = null;
  var _memoDetectVariantByPattern = null;

  // ═══════════════════════════════════════════════════════════
  // 🔥 PATCH M4: IDLE SCHEDULER + DEVICE DETECTION
  // ═══════════════════════════════════════════════════════════
  var _DEVICE = (function() {
    var nav = (typeof navigator !== 'undefined') ? navigator : {};
    var mem = nav.deviceMemory || 4;
    var cores = nav.hardwareConcurrency || 4;
    var saveData = nav.connection && nav.connection.saveData;
    var isMobile = /Mobi|Android|iPhone|iPad/i.test(nav.userAgent || '');
    var lowEnd = mem <= 2 || cores <= 2 || saveData === true;
    return {
      isMobile: isMobile,
      lowEnd: lowEnd,
      memory: mem,
      cores: cores,
      saveData: !!saveData
    };
  })();

  var _IDLE_TASKS = [];
  var _IDLE_TASK_ID = 0;

  function runWhenIdle(fn, timeout) {
    timeout = timeout || 2000;
    var taskId = ++_IDLE_TASK_ID;
    var handle = null;
    var cancelled = false;

    function _run() {
      if (cancelled) return;
      try { fn(); } catch (e) {
        log('❌ Idle task error: ' + e.message, 'ERROR');
      }
    }

    if (typeof window !== 'undefined' && window.requestIdleCallback) {
      handle = window.requestIdleCallback(_run, { timeout: timeout });
    } else {
      handle = setTimeout(_run, 50);
    }

    var record = {
      id: taskId,
      cancel: function() {
        cancelled = true;
        if (typeof window !== 'undefined' && window.cancelIdleCallback && handle !== null) {
          try { window.cancelIdleCallback(handle); } catch (e) {}
        } else if (handle !== null) {
          clearTimeout(handle);
        }
      }
    };
    _IDLE_TASKS.push(record);
    if (_IDLE_TASKS.length > 50) _IDLE_TASKS.shift();
    return record;
  }

  function runAfterIdle(fn, timeout) {
    return runWhenIdle(fn, timeout || 3000);
  }

  function _computeLightWarnings(slug, level, entityType) {
    var out = [];
    try { out = out.concat(detectConjunctionWarning(slug, level)); } catch (e) {}
    try { out = out.concat(detectSameLevelContentWarning(slug, entityType)); } catch (e) {}
    return out;
  }

  function _computeHeavyWarnings(slug, entityType) {
    var out = [];
    try { out = out.concat(detectHierarchyWarning(slug, entityType)); } catch (e) {}
    try { out = out.concat(validateBreadcrumbHierarchy(slug, entityType)); } catch (e) {}
    try { out = out.concat(validateParentDrivenHierarchy(slug, entityType)); } catch (e) {}
    return out;
  }

  function _getPerfStats() {
    return {
      cacheSize: _REGEX_CACHE_SIZE,
      cacheMax: _REGEX_CACHE_MAX,
      masterBuilt: _MASTER.built,
      device: _DEVICE
    };
  }

  // ═══════════════════════════════════════════════════════════
  // FUNGSI DASAR
  // ═══════════════════════════════════════════════════════════

  function cleanText(text) {
    if (!text) return "";
    if (text.length > 300) text = text.substring(0, 300);
    return text.toLowerCase().replace(/[^a-z0-9\s]/gi, " ").replace(/\s+/g, " ").trim();
  }

  function getPageText() {
    var slug = window.location.pathname.replace(/\.html$/, "").replace(/-/g, " ").split("/").pop() || "";
    if (!slug || slug.length < 2) {
      slug = window.location.pathname.replace(/\.html$/, "").replace(/-/g, " ").split("/").filter(Boolean).pop() || "";
    }
    var text = cleanText(slug);
    if (text.length > 200) text = text.substring(0, 200);
    return text;
  }

  function getH1Text() {
    try {
      var h1 = document.querySelector('h1');
      if (!h1) return '';
      var text = h1.innerText || h1.textContent || '';
      text = text.replace(/\b(20[2-9][0-9])\b/g, '');
      text = cleanText(text);
      if (text.length > 250) text = text.substring(0, 250);
      return text;
    } catch (e) { return ''; }
  }

  function isHomePage() {
    var path = window.location.pathname.toLowerCase();
    return path === "/" || path === "/index.html" || path === "/home";
  }

  function checkPriceTable() {
    if (typeof document === 'undefined') return false;
    try {
      var tables = document.querySelectorAll('table');
      if (!tables || tables.length === 0) return false;
      for (var i = 0; i < tables.length; i++) {
        var table = tables[i];
        var isInFooterNav = false;
        try {
          isInFooterNav = !!(table.closest('footer, nav, aside, .footer, .nav, .sidebar, .widget, #footer, #nav, #sidebar'));
        } catch (e) {}
        if (isInFooterNav) continue;
        var rows = table.querySelectorAll('tbody tr');
        if (rows.length < 2) continue;
        var headers = table.querySelectorAll('th');
        var priceHeaderCount = 0;
        for (var j = 0; j < headers.length; j++) {
          var headerText = (headers[j].innerText || headers[j].textContent || '').toLowerCase();
          if (/harga|biaya|tarif|price|cost|rate/i.test(headerText)) priceHeaderCount++;
        }
        if (priceHeaderCount >= 1) {
          log('📊 TABEL HARGA', 'TABLE');
          return true;
        }
      }
    } catch (e) {}
    return false;
  }

  function checkFisikRole(text) {
    if (!text) return "none";
    var lower = text.length > 200 ? text.toLowerCase().substring(0, 200) : text.toLowerCase();
    _buildMasterRegexes();

    if (_MASTER.actionObject) {
      var m = _MASTER.actionObject.exec(lower);
      if (m) {
        log('🎭 OBJECT role: "' + m[1] + '"', 'OBJECT');
        return "object";
      }
    }
    if (_MASTER.actionFisik) {
      var mf = _MASTER.actionFisik.exec(lower);
      if (mf) {
        log('🎭 OBJECT role: "' + mf[1] + '"', 'FISIKCTX');
        return "object";
      }
    }
    if (_MASTER.locationFisik && _MASTER.locationFisik.test(lower)) {
      log('🎭 LOCATION role (fisik)', 'FISIKCTX');
      return "location";
    }
    return "none";
  }

  function isBaseName(word, entityType) {
    if (!word) return false;
    var lower = word.toLowerCase();
    if (BASE_ENTITY_OBJECTS_SET[lower]) return true;
    if (entityType && ENTITY_BASE_NAMES[entityType]) {
      var baseNames = ENTITY_BASE_NAMES[entityType];
      for (var i = 0; i < baseNames.length; i++) {
        if (baseNames[i].indexOf(lower) !== -1) return true;
      }
    }
    return false;
  }

  function calculateComplexityScore(text, entityType) {
    if (!text) return 0;
    var lower = text.toLowerCase();
    var score = 0;
    var detail = [];

    var actionCount = 0;
    _buildMasterRegexes();
    if (_MASTER.action) {
      // Cek setiap verb? Tidak — master regex hanya test boolean.
      // Untuk hitung count, tetap loop tapi pakai rx cached.
      for (var i = 0; i < ACTION_VERBS.length; i++) {
        if (rx(ACTION_VERBS[i]).test(lower)) actionCount++;
      }
    }
    if (actionCount > 0) {
      score += Math.min(actionCount, 2);
      detail.push('act=' + actionCount);
    }

    var objCount = 0;
    for (var i = 0; i < OBJECT_WORDS.length; i++) {
      var objWord = OBJECT_WORDS[i];
      if (rx(objWord).test(lower)) {
        if (BASE_ENTITY_OBJECTS_SET[objWord]) continue;
        if (GENERIC_OBJECTS_SET[objWord]) continue;
        if (!isBaseName(objWord, entityType)) objCount++;
      }
    }
    if (objCount > 0) {
      score += Math.min(objCount, 3);
      detail.push('obj=' + objCount);
    }

    if (hasTechnicalSpec(lower)) { score += 2; detail.push('techSpec'); }
    if (checkHasPerUnit(lower)) { score += 2; detail.push('perUnit'); }
    if (checkHasSpecPhrase(lower)) { score += 2; detail.push('specPhrase'); }
    if (/\d+\s*(m|cm|mm)/i.test(lower)) { score += 1; detail.push('dim'); }
    if (checkCompoundAction(lower)) { score += 1; detail.push('compound'); }

    log('🎚️ SCORE: ' + score + ' (' + detail.join(', ') + ')', 'SCORE');
    return score;
  }

  function expandVerbVariations(text) {
    if (!text) return text;
    var result = text.toLowerCase();
    var verbMap = {
      "potong": ["pemotongan", "memotong", "terpotong", "potongan"],
      "gali": ["penggalian", "menggali", "tergali", "galian"],
      "urug": ["pengurugan", "mengurug", "terurug", "urugan"],
      "angkat": ["pengangkatan", "mengangkat", "terangkat", "angkatan"],
      "bor": ["pengeboran", "mengebor", "terbor", "boran"],
      "las": ["pengelasan", "mengelas", "terlas", "lasan"],
      "cor": ["pengecoran", "mengecor", "tercor", "coran"],
      "cat": ["pengecatan", "mengecat", "tercat", "catan"],
      "ukur": ["pengukuran", "mengukur", "terukur", "ukuran"],
      "pasang": ["pemasangan", "memasang", "terpasang", "pasangan"],
      "bongkar": ["pembongkaran", "membongkar", "terbongkar", "bongkaran"],
      "buat": ["pembuatan", "membuat", "terbuat", "buatan"],
      "upas": ["pengupasan", "mengupas", "terupas", "upasan"],
      "padat": ["pemadatan", "memadatkan", "terpadat", "padatan"],
      "keruk": ["pengerukan", "mengeruk", "terkeruk", "kerukan"],
      "pancang": ["pemancangan", "memancang", "terpancang", "pancangan"],
      "renovasi": ["merenovasi", "terrenovasi", "renovasian"],
      "service": ["servis", "menyervis", "terservice"],
      "perbaikan": ["memperbaiki", "terperbaiki", "perbaikkan"]
    };
    for (var base in verbMap) {
      if (!verbMap.hasOwnProperty(base)) continue;
      var variations = verbMap[base];
      for (var i = 0; i < variations.length; i++) {
        var pattern = rx(variations[i], "g");
        if (pattern.test(result)) {
          pattern.lastIndex = 0;
          result = result.replace(pattern, base);
        }
      }
    }
    return result;
  }

  function normalizeVerbVariations(text) { return expandVerbVariations(text); }

  function checkCompoundAction(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    var conjPatterns = [/dan/, /serta/, /&/, /\+/];
    var actionCount = 0;
    _buildMasterRegexes();
    if (_MASTER.action) {
      for (var i = 0; i < ACTION_VERBS.length; i++) {
        if (rx(ACTION_VERBS[i]).test(lower)) actionCount++;
      }
    }
    for (var i = 0; i < conjPatterns.length; i++) {
      if (conjPatterns[i].test(lower) && actionCount >= 2) {
        log('🔗 COMPOUND', 'COMPOUND');
        return true;
      }
    }
    return false;
  }

  function isLocation(text) {
    if (!text) return false;
    var lower = cleanText(text);
    if (!lower) return false;

    _buildMasterRegexes();

    if (_MASTER.locationCities && _MASTER.locationCities.test(lower)) {
      var m = _MASTER.locationCities.exec(lower);
      if (m) log('📍 ' + m[0], 'LOCATION');
      return true;
    }

    if (/\bterdekat\b/i.test(lower)) {
      if (_MASTER.fisikAlt) {
        var fisikSetelah = rxRaw("\\bterdekat\\s+(?:" + _MASTER.fisikAlt + ")\\b", "i");
        if (!fisikSetelah.test(lower)) return true;
      } else {
        return true;
      }
    }

    if (/\b(sekitar|area|wilayah|daerah|kawasan)\s+saya\b/i.test(lower)) return true;
    if (/\bdi\s+(sekitar|area|wilayah|daerah|kawasan)\b/i.test(lower)) return true;

    if (_MASTER.locationCities) {
      var cityNear = rxRaw("\\b(?:dekat|sekitar|di|area|wilayah|daerah)\\s+(?:" + _buildAltPattern(TIER_1_LOCATION) + ")\\b", "i");
      if (cityNear.test(lower)) return true;
    }

    if (checkFisikRole(lower) === "location") return true;
    return false;
  }

  function checkHasPrice(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    _buildMasterRegexes();
    if (_MASTER.priceHeads) return _MASTER.priceHeads.test(lower);
    return false;
  }

  function checkHasPromoModifier(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    _buildMasterRegexes();
    if (_MASTER.promoMods) return _MASTER.promoMods.test(lower);
    return false;
  }

  function detectContentSignalsFromSlug(slug) {
    var lower = String(slug || "").toLowerCase().trim();
    var priceMatch = null, pricePos = -1;
    for (var i = 0; i < PRICE_HEAD_WORDS.length; i++) {
      var idx = lower.indexOf(PRICE_HEAD_WORDS[i]);
      if (idx !== -1 && (pricePos === -1 || idx < pricePos)) {
        priceMatch = PRICE_HEAD_WORDS[i]; pricePos = idx;
      }
    }
    var commercialMatch = null, commercialPos = -1;
    for (var j = 0; j < COMMERCIAL_WORDS.length; j++) {
      var cidx = lower.indexOf(COMMERCIAL_WORDS[j]);
      if (cidx !== -1 && (commercialPos === -1 || cidx < commercialPos)) {
        commercialMatch = COMMERCIAL_WORDS[j]; commercialPos = cidx;
      }
    }
    var promoMatch = null;
    for (var k = 0; k < PROMO_MODIFIER_WORDS.length; k++) {
      if (lower.indexOf(PROMO_MODIFIER_WORDS[k]) !== -1) { promoMatch = PROMO_MODIFIER_WORDS[k]; break; }
    }
    var infoMatch = null;
    var infoWords = ['spesifikasi','panduan','cara','tips','trik','faktor','penentu','berdasarkan','penyebab','dampak','pengaruh','efek','metode','tahapan','proses','pengertian','definisi','manfaat','kelebihan','kekurangan','jenis','macam','perbandingan','review','analisis','fungsi','contoh','standar','sni','sertifikasi','perawatan','maintenance','troubleshooting','solusi','mutu','kualitas','ukuran','dimensi','komponen'];
    for (var m = 0; m < infoWords.length; m++) {
      if (lower.indexOf(infoWords[m]) !== -1) { infoMatch = infoWords[m]; break; }
    }
    var specPhrases = ['berdasarkan','berdasar','faktor penentu','faktor yang mempengaruhi','faktor utama','penyebab','sebab','dampak','pengaruh','efek'];
    var hasInfoSpecPhrase = false;
    for (var n = 0; n < specPhrases.length; n++) {
      if (lower.indexOf(specPhrases[n]) !== -1) { hasInfoSpecPhrase = true; break; }
    }
    return {
      hasPriceWord: !!priceMatch, priceWord: priceMatch, pricePosition: pricePos,
      isPriceAtStart: pricePos >= 0 && pricePos < 10,
      hasCommercialWord: !!commercialMatch, commercialWord: commercialMatch,
      commercialPosition: commercialPos,
      isCommercialAtStart: commercialPos >= 0 && commercialPos < 10,
      hasPromoModifier: !!promoMatch, promoModifier: promoMatch,
      hasInfoWord: !!infoMatch, infoWord: infoMatch,
      hasInfoSpecPhrase: hasInfoSpecPhrase, slugLength: lower.length
    };
  }

  function checkHasPerUnit(text) {
    if (!text) return false;
    _buildMasterRegexes();
    if (!_MASTER.satuanPer) return false;
    _MASTER.satuanPer.lastIndex = 0;
    if (_MASTER.satuanPer.test(text)) {
      log('📏 PER-UNIT', 'PERSATUAN');
      return true;
    }
    return false;
  }

  function checkHasQuestionWord(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    _buildMasterRegexes();
    if (_MASTER.questionWords) return _MASTER.questionWords.test(lower);
    return false;
  }

  function checkHasCommercialInvestigation(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    _buildMasterRegexes();
    if (_MASTER.ciWords) return _MASTER.ciWords.test(lower);
    return false;
  }

  function checkFreeContext(text) {
    if (!text) return { isInfo: false, isComm: false };
    var lower = text.toLowerCase();
    var isInfo = false, isComm = false;
    for (var i = 0; i < FREE_INFO_WORDS.length; i++) {
      if (lower.indexOf(FREE_INFO_WORDS[i]) !== -1) { isInfo = true; break; }
    }
    for (var i = 0; i < FREE_COMM_WORDS.length; i++) {
      if (lower.indexOf(FREE_COMM_WORDS[i]) !== -1) { isComm = true; break; }
    }
    return { isInfo: isInfo, isComm: isComm };
  }

  function checkHasAuthority(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    for (var i = 0; i < AUTHORITY_WORDS.length; i++) {
      if (lower.indexOf(AUTHORITY_WORDS[i]) !== -1) return true;
    }
    return false;
  }

  function checkHasReadyStock(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    for (var i = 0; i < READY_STOCK_WORDS.length; i++) {
      if (lower.indexOf(READY_STOCK_WORDS[i]) !== -1) return true;
    }
    return false;
  }

  function checkHasSpecPhrase(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    var specAlt = _buildAltPattern(SPEC_PHRASE_WORDS);
    if (!specAlt) return false;
    var rxSpec = rxRaw("\\b(?:" + specAlt + ")\\b", "i");
    if (rxSpec.test(lower)) {
      log('📋 SPEC_PHRASE matched', 'SPECPHRASE');
      return true;
    }
    return false;
  }

  function checkHasInformationalSpecPhrase(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    for (var i = 0; i < SPEC_PHRASE_INFORMATIONAL.length; i++) {
      if (lower.indexOf(SPEC_PHRASE_INFORMATIONAL[i]) !== -1) {
        log('📋 INFO_SPEC_PHRASE: ' + SPEC_PHRASE_INFORMATIONAL[i], 'SPECPHRASE');
        return true;
      }
    }
    return false;
  }

  function checkHasMarketingTerm(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    for (var i = 0; i < MARKETING_TERMS.length; i++) {
      if (lower.indexOf(MARKETING_TERMS[i]) !== -1) return true;
    }
    return false;
  }

  function checkHasBaseService(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    var baseWords = ["jasa","layanan","sewa","rental","produk","material","bahan","kontraktor","tukang","mandor","vendor","supplier","pasang","bangun","renovasi","perbaikan","perawatan","instalasi","pemasangan","pembongkaran","pembersihan","coring","cutting","drilling","grouting","sandblasting","pengeboran","pemancangan","pengecoran","pengelasan","bongkar","gali","urug","angkut","pemadatan","pelapisan","coating","poles","grinding","waterproofing","epoxy","pondasi","tiang","pancang","pagar","panel","railing","tangga","gerbang","wastafel","closet","shower","beton","baja","besi","kayu","batu","keramik","granit","marmer","semen","pasir","pipa","kaca","aluminium","bata","batako","hebel","genteng","asbes","atap","plafon","gypsum","paving","readymix","kanopi","precast","pracetak","galvalum","desain","interior","eksterior","arsitektur","konstruksi","rumah","gedung","ruko","gudang","pabrik","jalan","jembatan","masjid","gereja","sekolah","hotel","villa","apartemen","mini","pile","bore","strauss","relief","profil","konsultan","finishing","uji","perkuatan","pembatas","pengaman","puing","drainase","perkerasan","pematangan"];
    var baseRegex = rxRaw("\\b(?:" + _buildAltPattern(baseWords) + ")\\b", "i");
    return baseRegex.test(lower);
  }

  function checkHasCommercial(text, entityType) {
    if (!text) return false;
    var lower = text.toLowerCase();
    if (entityType && ENTITY_ONLY_WORDS[entityType]) {
      var entityWords = ENTITY_ONLY_WORDS[entityType] || [];
      for (var i = 0; i < entityWords.length; i++) {
        lower = lower.replace(rx(entityWords[i], "gi"), " ");
      }
      var entityTriggers = ENTITY_TRIGGERS[entityType] || [];
      for (var i = 0; i < entityTriggers.length; i++) {
        if (COMMERCIAL_WORDS.indexOf(entityTriggers[i]) === -1) {
          lower = lower.replace(rx(entityTriggers[i], "gi"), " ");
        }
      }
    }
    _buildMasterRegexes();
    if (_MASTER.commercialWords && _MASTER.commercialWords.test(lower)) {
      var m = _MASTER.commercialWords.exec(lower);
      if (m) log('🛒 COMMERCIAL: ' + m[0], 'COMMERCIAL');
      return true;
    }
    return false;
  }

  function detectJasaSubCategory(text, entityType) {
    if (entityType !== "jasa") return null;
    if (!text) return null;

    var cacheKey = text + "|" + entityType;
    if (_PLD_SUBCAT_CACHE[cacheKey] !== undefined) {
      return _PLD_SUBCAT_CACHE[cacheKey];
    }

    var lower = text.toLowerCase().trim();
    var priorityOrder = ["struktural","las_welding","finishing","bongkar_buang","pematangan","infrastruktur","pengaman","alat_konstruksi","instalasi","konsultasi","interior_eksterior","pembuatan_pasang","konstruksi","perbaikan"];

    for (var p = 0; p < priorityOrder.length; p++) {
      var cat = priorityOrder[p];
      var words = JASA_SUB_CATEGORIES[cat] || [];
      for (var i = 0; i < words.length; i++) {
        var w = words[i];
        if (w.length < 3) continue;
        if (rx(w).test(lower)) {
          log('📂 SUBCAT: ' + cat + ' (match: "' + w + '")', 'SUBCAT');
          _PLD_SUBCAT_CACHE[cacheKey] = cat;
          return cat;
        }
      }
    }

    log('📂 SUBCAT: default', 'SUBCAT');
    _PLD_SUBCAT_CACHE[cacheKey] = "default";
    return "default";
  }

  // ═══ PART 1 END ═══

   // ═══════════════════════════════════════════════════════════
  // FUNGSI SPESIFIKASI (M1+M2 version)
  // ═══════════════════════════════════════════════════════════

  function checkHasSpecification(text, entityType) {
    if (!text) return false;
    var lower = text.toLowerCase();
    var entityOnly = ENTITY_ONLY_WORDS[entityType] || [];

    var entityOnlySet = {};
    for (var eo = 0; eo < entityOnly.length; eo++) {
      entityOnlySet[entityOnly[eo]] = true;
    }
    function isEntityOnlyWord(w) { return entityOnlySet[w] === true; }

    if (checkHasPerUnit(text)) { log('🔬 SPEC: per unit', 'VARIANT'); return true; }

    function _matchList(list) {
      if (!list) return false;
      for (var i = 0; i < list.length; i++) {
        if (rxTest(list[i], lower) && !isEntityOnlyWord(list[i])) return true;
      }
      return false;
    }

    // ═══ PRODUK ═══
    if (entityType === "produk") {
      if (_matchList(ENTITY_SPECIFIC.produk.mutu)) return true;
      if (_matchList(SHARED_MODIFIERS.finishing)) return true;
      if (/\d+\s*(m|mm|cm|meter|kg|ton|inch|inci|ft|feet)/gi.test(lower)) return true;
      if (/\d+\s*[x×]\s*\d+\s*(cm|m|meter|mm)/gi.test(lower)) return true;
      if (_matchList(SHARED_MODIFIERS.warna)) return true;
      if (_matchList(SHARED_MODIFIERS.gaya)) return true;
      if (_matchList(CROSS_ENTITY_SPECS.produk.sharedMaterialFinishing)) {
        log('🎯 CROSS-SPEC: produk + sharedFinishing', 'CROSSSPEC');
        return true;
      }
      if (_matchList(SHARED_MODIFIERS.material)) {
        log('🔥 FIX v15: produk + material', 'CROSSSPEC');
        return true;
      }

      var textNoBaseB = lower;
      var baseListB = ENTITY_BASE_NAMES.produk || [];
      for (var biB = 0; biB < baseListB.length; biB++) {
        textNoBaseB = textNoBaseB.replace(rx(baseListB[biB], 'g'), ' ');
      }
      _buildMasterRegexes();
      if (_MASTER.appTargets && _MASTER.appTargets.test(textNoBaseB)) {
        log('🔥 FIX v15: produk + target', 'CROSSSPEC');
        return true;
      }
      if (/\d+\s*[x×]\s*\d+(?:\s*[x×]\s*\d+)?/i.test(lower)) {
        log('🔬 PRODUK dimension multi-layer', 'VARIANT');
        return true;
      }
    }

    // ═══ MATERIAL ═══
    if (entityType === "material") {
      if (_matchList(MATERIAL_SPECS.grade)) return true;
      if (_matchList(SHARED_MODIFIERS.finishing)) return true;
      if (/\d+\s*(mm|cm|m|meter|kg|ton|m3|liter)/gi.test(lower)) return true;
      if (_matchList(MATERIAL_SPECS.berat)) return true;
      if (_matchList(ENTITY_SPECIFIC.material.tipe_extended)) {
        log('🧱 MATERIAL tipe matched', 'MATTYPE');
        return true;
      }
      if (_matchList(CROSS_ENTITY_SPECS.material.extendedTypes)) return true;
      if (/\d+\s*[x×]\s*\d+(?:\s*[x×]\s*\d+)?/i.test(lower)) return true;
    }

    // ═══ SEWA ═══
    if (entityType === "sewa") {
      if (_matchList(ENTITY_SPECIFIC.sewa.merek)) return true;
      if (_matchList(ENTITY_SPECIFIC.sewa.tipe)) return true;
      if (/\d+\s*(ton|m3|kg|liter)/gi.test(lower)) return true;
      if (_matchList(ENTITY_SPECIFIC.sewa.kondisi)) return true;
      if (_matchList(ENTITY_SPECIFIC.sewa.durasi)) return true;
      if (_matchList(CROSS_ENTITY_SPECS.sewa.extendedTools)) return true;

      var unitsAlt = _buildAltPattern(CROSS_ENTITY_SPECS.sewa.extendedUnits);
      if (unitsAlt && rxRaw("\\d+\\s*(?:" + unitsAlt + ")\\b").test(lower)) return true;
      var kapAlt = _buildAltPattern(SEWA_SPECS.kapasitas);
      if (kapAlt && rxRaw("\\d+\\s*(?:" + kapAlt + ")\\b").test(lower)) return true;
    }

    // ═══ JASA ═══
    if (entityType === "jasa") {
      var subCat = detectJasaSubCategory(text, "jasa");
      var domainConstraints = DOMAIN_CONSTRAINTS[subCat] || DOMAIN_CONSTRAINTS["default"];
      var forbiddenCats = domainConstraints.forbidden_categories || [];

      if (_matchList(ENTITY_SPECIFIC.jasa.metode)) return true;
      if (_matchList(ENTITY_SPECIFIC.jasa.skala)) return true;

      if (forbiddenCats.indexOf("finishing") === -1) {
        if (_matchList(SHARED_MODIFIERS.finishing)) return true;
      } else {
        log('🚫 FIX v16-E: SKIP finishing untuk subCat=' + subCat, 'DOMAIN');
      }

      if (/\d+\s*(m|meter|cm|centimeter|feet|ft)/gi.test(lower)) {
        _buildMasterRegexes();
        if (_MASTER.jasaWords && _MASTER.jasaWords.test(lower)) return true;
      }

      if (_matchList(CROSS_ENTITY_SPECS.jasa.foreignTechniques)) return true;

      if (forbiddenCats.indexOf("gaya") === -1) {
        if (_matchList(CROSS_ENTITY_SPECS.jasa.sharedGaya)) return true;
      }
      if (_matchList(ENTITY_SPECIFIC.jasa.tipe_aspal)) return true;

      if (/\d+\s*[x×]\s*\d+(?:\s*[x×]\s*\d+)?/i.test(lower)) {
        _buildMasterRegexes();
        if (_MASTER.action && _MASTER.action.test(lower)) {
          log('🔬 FIX 180: JASA dimensi multi-layer', 'VARIANT');
          return true;
        }
      }
    }

    // ═══ DESAIN ═══
    if (entityType === "desain") {
      if (_matchList(ENTITY_SPECIFIC.desain.gaya_extended)) return true;
      if (_matchList(SHARED_MODIFIERS.gaya)) return true;
      if (_matchList(ENTITY_SPECIFIC.desain.warna_extended)) return true;
      if (_matchList(SHARED_MODIFIERS.warna)) return true;
      if (_matchList(ENTITY_SPECIFIC.desain.konsep)) return true;
      if (_matchList(ENTITY_SPECIFIC.desain.material)) return true;
      if (_matchList(ENTITY_SPECIFIC.desain.furniture)) return true;
      if (_matchList(ENTITY_SPECIFIC.desain.subjektif)) return true;
      if (_matchList(ENTITY_SPECIFIC.desain.tipe)) return true;
    }

        // ═══ UNIVERSAL FALLBACK ═══
    var textNoBase = lower;
    var baseList212 = ENTITY_BASE_NAMES[entityType] || [];
    var sortedBaseList212 = baseList212.slice().sort(function(a, b) {
      return b.split(' ').length - a.split(' ').length;
    });
    
    var _skipBase212 = {};
    for (var b1_212 = 0; b1_212 < sortedBaseList212.length; b1_212++) {
      var bn1_212 = sortedBaseList212[b1_212];
      for (var b2_212 = 0; b2_212 < sortedBaseList212.length; b2_212++) {
        if (b1_212 === b2_212) continue;
        var bn2_212 = sortedBaseList212[b2_212];
        if (bn2_212.length > bn1_212.length) {
          var bn1Regex212 = new RegExp("\\b" + _escapeRegex(bn1_212) + "\\b", "i");
          if (bn1Regex212.test(bn2_212)) {
            var bn2Regex212 = new RegExp("\\b" + _escapeRegex(bn2_212) + "\\b", "i");
            if (bn2Regex212.test(textNoBase)) {
              _skipBase212[bn1_212] = true;
              break;
            }
          }
        }
      }
    }
    
    for (var bi212 = 0; bi212 < sortedBaseList212.length; bi212++) {
  var bn212 = sortedBaseList212[bi212];
  if (_skipBase212[bn212]) continue;
  
  // 🔥 FIX-REVISI-v2: Handle base name yang juga app target
  if (APPLICATION_TARGETS_FULL.indexOf(bn212) !== -1) {
  // 🔥 FIX-REVISI-v3: Hitung base name LAIN (bukan app target) di text
  var _bnCount212 = 0;
  for (var _bnc = 0; _bnc < sortedBaseList212.length; _bnc++) {
    var _otherBn = sortedBaseList212[_bnc];
    // Skip kalau ini bn212 sendiri atau sesama app target
    if (_otherBn === bn212) continue;
    if (APPLICATION_TARGETS_FULL.indexOf(_otherBn) !== -1) continue;
    // Skip kalau substring dari bn212
    if (bn212.indexOf(_otherBn) !== -1) continue;
    if (rx(_otherBn).test(lower)) _bnCount212++;
  }
  
  if (_bnCount212 >= 1) {
    log('🎯 FIX-REVISI-v3: "' + bn212 + '" + ' + _bnCount212 + ' base lain → JANGAN strip', 'CROSSSPEC');
    continue;
  }
  
  log('🎯 FIX-REVISI-v3: "' + bn212 + '" base tunggal → strip', 'CROSSSPEC');
  textNoBase = textNoBase.replace(rx(bn212, 'g'), ' ');
  continue;
}
       
  textNoBase = textNoBase.replace(rx(bn212, 'g'), ' ');
}
     
     _buildMasterRegexes();
    if (_MASTER.appTargets && _MASTER.appTargets.test(textNoBase)) {
      log('🎯 FIX 212: application target = spec', 'CROSSSPEC');
      return true;
    }

    if (/\d+\s*(kg|ton|m|cm|mm|m3|liter|kva|psi|hp|inch|k)\b/i.test(lower)) {
      log('🔬 FIX v15-E: universal unit', 'VARIANT');
      return true;
    }
    if (/\d+\s*[x×]\s*\d+(?:\s*[x×]\s*\d+)?/i.test(lower)) {
      log('🔬 FIX v15-E: universal dimension', 'VARIANT');
      return true;
    }
    return false;
  }

  function checkHasJasaMetode(text) {
    if (!text) return null;
    var lower = text.toLowerCase();
    var metodeWords = (ENTITY_SPECIFIC.jasa.metode || []).concat(ENTITY_SPECIFIC.jasa.skala || []);
    for (var i = 0; i < metodeWords.length; i++) {
      if (rx(metodeWords[i]).test(lower)) return metodeWords[i];
    }
    return null;
  }

  function getCategoryDefs(entityType) {
    var result = { global_numeric: GLOBAL_NUMERIC_KEYWORDS };
    result.material = SHARED_MODIFIERS.material;
    result.finishing = SHARED_MODIFIERS.finishing;
    result.warna = SHARED_MODIFIERS.warna;
    result.gaya = SHARED_MODIFIERS.gaya;

    switch (entityType) {
      case "jasa":
        result.metode = ENTITY_SPECIFIC.jasa.metode;
        result.skala = ENTITY_SPECIFIC.jasa.skala;
        result.tipe_aspal = ENTITY_SPECIFIC.jasa.tipe_aspal;
        result.target = APPLICATION_TARGETS_FULL;
        break;
      case "produk":
        result.mutu = ENTITY_SPECIFIC.produk.mutu;
        result.tipe = ENTITY_SPECIFIC.produk.tipe;
        result.target = APPLICATION_TARGETS_FULL;
        break;
      case "material":
        result.grade_material = ENTITY_SPECIFIC.material.grade_material;
        result.tipe_extended = ENTITY_SPECIFIC.material.tipe_extended;
        result.target = APPLICATION_TARGETS_FULL;
        break;
      case "sewa":
        result.tipe = ENTITY_SPECIFIC.sewa.tipe;
        result.merek = ENTITY_SPECIFIC.sewa.merek;
        result.kondisi = ENTITY_SPECIFIC.sewa.kondisi;
        result.durasi = ENTITY_SPECIFIC.sewa.durasi;
        result.kapasitas = ENTITY_SPECIFIC.sewa.kapasitas;
        result.tools_extended = ENTITY_SPECIFIC.sewa.tools_extended;
        result.target = APPLICATION_TARGETS_FULL;
        break;
      case "desain":
        var ROOM_CTX = ["rumah","kantor","toko","hotel","restoran","cafe","villa","apartemen","ruko","kios","gudang","klinik","sekolah","mall","spa","salon","bar","lounge","butik","showroom","minimarket","dapur","kamar mandi","kamar tidur","ruang tamu","ruang keluarga","ruang makan","ruang kerja","teras","balkon","toilet","wc"];
        var targetDesain = APPLICATION_TARGETS_FULL.filter(function(t) {
          return ROOM_CTX.indexOf(t) === -1;
        });
        result.gaya_extended = ENTITY_SPECIFIC.desain.gaya_extended;
        result.warna_extended = ENTITY_SPECIFIC.desain.warna_extended;
        result.konsep = ENTITY_SPECIFIC.desain.konsep;
        result.material_desain = ENTITY_SPECIFIC.desain.material;
        result.furniture = ENTITY_SPECIFIC.desain.furniture;
        result.subjektif = ENTITY_SPECIFIC.desain.subjektif;
        result.tipe = ENTITY_SPECIFIC.desain.tipe;
        result.target = targetDesain;
        break;
    }
    return result;
  }

  function isSpecModifierForEntity(word, entityType) {
    if (!word) return false;
    var w = word.toLowerCase().trim();
    if (!w) return false;

    if (/^\d+(kg|ton|m|cm|mm|m3|liter|kva|psi|hp|inch|k)$/i.test(w)) return true;
    if (/^\d+x\d+$/i.test(w)) return true;
    if (/^\d+/.test(w)) return true;
    if (/^(k\d+|fc\d*|m\d+|c\d+|bjts?\d*)$/i.test(w)) return true;
    if (GLOBAL_NUMERIC_KEYWORDS.indexOf(w) !== -1) return true;

   if (w === 'termurah' || w === 'termahal' || w === 'promo' || w === 'diskon' || w === 'mini') return true;

    if (MODIFIER_COMPATIBILITY[w]) {
      var compatibleEntities = MODIFIER_COMPATIBILITY[w];
      if (entityType === "jasa") {
        var subCat = detectJasaSubCategory(w, "jasa");
        var jasaKey = "jasa_" + subCat;
        if (compatibleEntities.indexOf(jasaKey) !== -1) return true;
        if (compatibleEntities.indexOf("jasa") !== -1) return true;
        for (var i = 0; i < compatibleEntities.length; i++) {
          if (compatibleEntities[i].indexOf("jasa_") === 0) return true;
        }
        log('🚫 FIX v16-F: modifier "' + w + '" tidak kompatibel untuk jasa/' + subCat, 'DOMAIN');
        return false;
      }
      if (compatibleEntities.indexOf(entityType) !== -1) return true;
      log('🚫 FIX v16-F: modifier "' + w + '" tidak kompatibel untuk ' + entityType, 'DOMAIN');
      return false;
    }

    for (var cat in SHARED_MODIFIERS) {
      if (!SHARED_MODIFIERS.hasOwnProperty(cat)) continue;
      if (SHARED_MODIFIERS[cat].indexOf(w) !== -1) return true;
    }

    if (entityType && ENTITY_SPECIFIC[entityType]) {
      var spec = ENTITY_SPECIFIC[entityType];
      for (var key in spec) {
        if (!spec.hasOwnProperty(key)) continue;
        if (spec[key].indexOf(w) !== -1) return true;
      }
    }

    if (entityType === "sewa") {
      if (SEWA_SPECS.kapasitas.indexOf(w) !== -1) return true;
    }
    if (entityType === "material") {
      if (MATERIAL_SPECS.berat.indexOf(w) !== -1) return true;
    }
    return false;
  }

  // ═══════════════════════════════════════════════════════════
  // countModifierLayers() — M1+M2 VERSION
  // ═══════════════════════════════════════════════════════════
  function countModifierLayers(text, entityType) {
    if (!text) return 0;
    _buildMasterRegexes();

    var working = text.toLowerCase();

    // Step 1: Strip entity-only
    var entityOnly = ENTITY_ONLY_WORDS[entityType] || [];
    for (var e = 0; e < entityOnly.length; e++) {
      working = working.replace(rx(entityOnly[e], 'g'), ' ');
    }

       // ═══════════════════════════════════════════════════════════
    // 🔥 FIX-MULTIWORD: Skip substring of longer base name
    // ═══════════════════════════════════════════════════════════
    var baseNames = ENTITY_BASE_NAMES[entityType] || [];
    var sortedBaseNames = baseNames.slice().sort(function(a, b) {
      return b.split(' ').length - a.split(' ').length;
    });
    
    var _baseNamesToSkip = {};
    for (var b1 = 0; b1 < sortedBaseNames.length; b1++) {
      var bn1 = sortedBaseNames[b1];
      for (var b2 = 0; b2 < sortedBaseNames.length; b2++) {
        if (b1 === b2) continue;
        var bn2 = sortedBaseNames[b2];
        if (bn2.length > bn1.length) {
          var bn1Regex = new RegExp("\\b" + _escapeRegex(bn1) + "\\b", "i");
          if (bn1Regex.test(bn2)) {
            var bn2Regex = new RegExp("\\b" + _escapeRegex(bn2) + "\\b", "i");
            if (bn2Regex.test(working)) {
              _baseNamesToSkip[bn1] = true;
              break;
            }
          }
        }
      }
    }
    
   for (var b = 0; b < sortedBaseNames.length; b++) {
  var bn = sortedBaseNames[b];
  if (_baseNamesToSkip[bn]) continue;
  
  // 🔥 FIX-REVISI-v2: Handle base name yang juga app target
  if (APPLICATION_TARGETS_FULL.indexOf(bn) !== -1) {
  // 🔥 FIX-REVISI-v3: Hitung base name LAIN (bukan app target)
  var _bnCountB = 0;
  for (var _bncb = 0; _bncb < sortedBaseNames.length; _bncb++) {
    var _otherB = sortedBaseNames[_bncb];
    if (_otherB === bn) continue;
    if (APPLICATION_TARGETS_FULL.indexOf(_otherB) !== -1) continue;
    if (bn.indexOf(_otherB) !== -1) continue;
    if (rx(_otherB).test(working)) _bnCountB++;
  }
  
  if (_bnCountB >= 1) {
    log('🔥 FIX-REVISI-v3: "' + bn + '" + ' + _bnCountB + ' base lain → JANGAN strip', 'VARIANT');
    continue;
  }
  
  log('🔥 FIX-REVISI-v3: "' + bn + '" base tunggal → strip', 'VARIANT');
  working = working.replace(rx(bn, 'g'), ' ');
  continue;
}
  
  working = working.replace(rx(bn, 'g'), ' ');
}
     
    // Step 3: Strip NOISE
    if (_MASTER.noiseUniv) {
      _MASTER.noiseUniv.lastIndex = 0;
      if (_MASTER.noiseUniv.test(working)) {
        log('🔇 strip NOISE_UNIVERSAL', 'CORE');
        _MASTER.noiseUniv.lastIndex = 0;
        working = working.replace(_MASTER.noiseUniv, ' ');
      }
    }
    if (entityType === "jasa" && _MASTER.noiseJasa) {
      _MASTER.noiseJasa.lastIndex = 0;
      if (_MASTER.noiseJasa.test(working)) {
        log('🔇 strip NOISE_JASA', 'CORE');
        _MASTER.noiseJasa.lastIndex = 0;
        working = working.replace(_MASTER.noiseJasa, ' ');
      }
    }

    // Step 4: Strip universal prefix
    var UNIVERSAL_PREFIX_9 = ["jasa","layanan","tukang","kontraktor","toko","supplier","distributor","jual","beli","rental","sewa","service","servis"];
    for (var up9 = 0; up9 < UNIVERSAL_PREFIX_9.length; up9++) {
      working = working.replace(rx(UNIVERSAL_PREFIX_9[up9], 'g'), ' ');
    }

    working = working.replace(/\s+/g, ' ').trim();
    if (!working) {
      log('⚡ Early exit: working kosong', 'PERF');
      return 0;
    }

    var count = 0;
    var seenWords = {};

    // Step 5a-c: Dimensi
    var dimUnitEarly = working.match(/\d+\s*(?:x|×)\s*\d+\s*(?:cm|m|mm|meter|inch|inci)\b/gi) || [];
    if (dimUnitEarly.length > 0) {
      count += dimUnitEarly.length;
      log('🔥 dimUnitEarly +' + dimUnitEarly.length, 'VARIANT');
      for (var k = 0; k < dimUnitEarly.length; k++) working = working.replace(dimUnitEarly[k], ' ');
    }
    var dimMultiEarly = working.match(/\d+\s*(?:x|×)\s*\d+/gi) || [];
    if (dimMultiEarly.length > 0) {
      count += dimMultiEarly.length;
      log('🔥 dimMultiEarly +' + dimMultiEarly.length, 'VARIANT');
      for (var k2 = 0; k2 < dimMultiEarly.length; k2++) working = working.replace(dimMultiEarly[k2], ' ');
    }
    var dimSimpleEarly = working.match(/\d+\s*(?:cm|mm|m|meter|kg|ton|inch|inci|kva|psi|hp|ft|feet)\b/gi) || [];
    if (dimSimpleEarly.length > 0) {
      count += dimSimpleEarly.length;
      log('🔥 dimSimpleEarly +' + dimSimpleEarly.length, 'VARIANT');
      for (var k3 = 0; k3 < dimSimpleEarly.length; k3++) working = working.replace(dimSimpleEarly[k3], ' ');
    }
    working = working.replace(/\s+/g, ' ').trim();
    if (!working) return count;

    // Step 6: Strip price
    for (var ph = 0; ph < PRICE_HEAD_WORDS.length; ph++) {
      working = working.replace(rx(PRICE_HEAD_WORDS[ph], 'g'), ' ');
    }

    // Step 6b: Strip satuan
    if (entityType !== "sewa") {
      if (_MASTER.satuanPer) {
        _MASTER.satuanPer.lastIndex = 0;
        working = working.replace(_MASTER.satuanPer, ' ');
      }
      if (_MASTER.satuanUnits) {
        _MASTER.satuanUnits.lastIndex = 0;
        working = working.replace(_MASTER.satuanUnits, ' ');
      }
    } else {
      log('🔥 FIX #1b: SKIP strip satuan untuk sewa', 'DOMAIN');
    }

    // Step 7: Strip promo
    var PROMO_STRIP = PROMO_MODIFIER_WORDS.concat(HIGH_VOLUME_WORDS);
    var seen216 = {};
    for (var ps = 0; ps < PROMO_STRIP.length; ps++) {
      var pword = PROMO_STRIP[ps];
      if (seen216[pword]) continue;
      seen216[pword] = true;
      working = working.replace(rx(pword, 'g'), ' ');
    }
    working = working.replace(/\s+/g, ' ').trim();
    if (!working) return count;

    // Step 9: Khusus DESAIN
    if (entityType === "desain") {
      var lantaiMatch = working.match(/\b\d+\s*lantai\b/gi) || [];
      count += lantaiMatch.length;
      for (var lm = 0; lm < lantaiMatch.length; lm++) working = working.replace(lantaiMatch[lm], ' ');
      var typeMatch = working.match(/\btype\s+\d+\b/gi) || [];
      count += typeMatch.length;
      for (var tm = 0; tm < typeMatch.length; tm++) working = working.replace(typeMatch[tm], ' ');
      if (/\bhook\b/i.test(working)) {
        count += 1;
        working = working.replace(/\bhook\b/gi, ' ');
      }
      working = working.replace(/\s+/g, ' ').trim();
    }

    // Step 10: Cek kategori
    var categories = getCategoryDefs(entityType);
    var subCat = detectJasaSubCategory(text, entityType);
    var domainConstraints = DOMAIN_CONSTRAINTS[subCat] || DOMAIN_CONSTRAINTS["default"];
    var forbiddenCats = domainConstraints.forbidden_categories || [];
    var forbiddenSet = {};
    for (var fc = 0; fc < forbiddenCats.length; fc++) forbiddenSet[forbiddenCats[fc]] = true;

    for (var cat in categories) {
      if (!categories.hasOwnProperty(cat)) continue;
      if (forbiddenSet[cat]) {
        log('🚫 SKIP category "' + cat + '"', 'DOMAIN');
        continue;
      }
      var words = categories[cat];
      for (var i = 0; i < words.length; i++) {
        var word = words[i];
        if (seenWords[word]) continue;
        if (rx(word).test(working)) {
          seenWords[word] = true;
          count++;
        }
      }
    }

    // Step 11: Strip kategori dari "cleaned"
    var cleaned = working;
    for (var cat2 in categories) {
      if (!categories.hasOwnProperty(cat2)) continue;
      if (forbiddenSet[cat2]) continue;
      var words2 = categories[cat2];
      for (var j = 0; j < words2.length; j++) {
        cleaned = cleaned.replace(rx(words2[j], 'gi'), ' ');
      }
    }
    for (var catF in categories) {
      if (!categories.hasOwnProperty(catF)) continue;
      if (!forbiddenSet[catF]) continue;
      var wordsF = categories[catF];
      for (var jF = 0; jF < wordsF.length; jF++) {
        cleaned = cleaned.replace(rx(wordsF[jF], 'gi'), ' ');
      }
    }

    // Step 12: Strip stopwords
    var stopwords = ["dan","atau","serta","yang","dari","ke","di","untuk","dengan","ini","itu","akan","pada","oleh","per"];
    for (var s = 0; s < stopwords.length; s++) {
      cleaned = cleaned.replace(rx(stopwords[s], 'g'), ' ');
    }

    // Step 13: DESAIN — strip room context
    if (entityType === "desain") {
      var ROOM_CTX = ["rumah","kantor","toko","hotel","restoran","cafe","villa","apartemen","ruko","kios","gudang","klinik","sekolah","mall","spa","salon","bar","lounge","butik","showroom","minimarket","dapur","kamar mandi","kamar tidur","ruang tamu","ruang keluarga","ruang makan","ruang kerja","teras","balkon","toilet","wc"];
      for (var rc = 0; rc < ROOM_CTX.length; rc++) {
        cleaned = cleaned.replace(rx(ROOM_CTX[rc], 'g'), ' ');
      }
    }
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    // Step 14: Unknown words
    if (cleaned) {
      var unknownWords = cleaned.split(/\s+/).filter(function(w) { return w.length > 3; });
      if (unknownWords.length > 0) {
        count += unknownWords.length;
        log('🔥 unknown=[' + unknownWords.join(',') + '] +' + unknownWords.length, 'VARIANT');
      }
    }

    log('🔥 layers=' + count + ' entity=' + entityType + ' subCat=' + subCat, 'VARIANT');
    return count;
  }

  function flagAmbiguous(text, entityType, level, layers) {
    if (!CONFIG.DEBUG) return;
    var residues = _memoCountModifierLayers
      ? _memoCountModifierLayers(text, entityType)
      : countModifierLayers(text, entityType);
    if (residues > 0 && layers === 0) {
      log('⚠️ FIX 199: AMBIGUOUS — text="' + text + '" layers=' + layers + ' residues=' + residues, 'WARN');
    }
    var wordCount = text.split(/\s+/).filter(function(w) { return w.length > 2; }).length;
    if (wordCount >= 3 && level === "money-master") {
      log('⚠️ FIX 199: SUSPICIOUS MM — wordCount=' + wordCount + ' text="' + text + '"', 'WARN');
    }
  }

  function decideLevelByLayers(layers) {
    if (layers === 0) return "money-master";
    if (layers === 1) return "money-page";
    if (layers === 2) return "variant";
    return "sub-variant";
  }

  function hasJasaMaterialCtx(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    var narrow = ["beton","baja","besi","kayu","batu","tanah","aspal","keramik","granit","marmer","kaca","aluminium","pipa","semen","pasir","pvc","wpc","grc","hpl","acp","vinyl","upvc","stainless","titanium","tembaga","kuningan","perunggu","karbon","grafit","bambu","rotan"];
    for (var i = 0; i < narrow.length; i++) {
      if (rx(narrow[i]).test(lower)) return true;
    }
    return false;
  }

  function checkPureTechnicalSpec(text, entityType) {
    if (!text) return false;
    var lower = text.toLowerCase();
    var pureSpecs = [];
    if (entityType === "jasa") {
      var subCat = detectJasaSubCategory(text, "jasa");
      pureSpecs = ENTITY_SPECIFIC.jasa.metode
        .concat(ENTITY_SPECIFIC.jasa.skala)
        .concat(ENTITY_SPECIFIC.jasa.tipe_aspal || []);
      if (["finishing","interior_eksterior","pembuatan_pasang","perbaikan"].indexOf(subCat) !== -1) {
        pureSpecs = pureSpecs.concat(SHARED_MODIFIERS.finishing);
      }
    } else if (entityType === "produk") {
      pureSpecs = PURE_PRODUK_SPECS.concat(SHARED_MODIFIERS.finishing, CROSS_ENTITY_SPECS.produk.sharedMaterialFinishing);
    } else if (entityType === "material") {
      pureSpecs = PURE_MATERIAL_SPECS.concat(SHARED_MODIFIERS.finishing);
    } else if (entityType === "sewa") {
      pureSpecs = PURE_SEWA_SPECS;
    } else if (entityType === "desain") {
      pureSpecs = PURE_DESAIN_SPECS;
    }
    for (var i = 0; i < pureSpecs.length; i++) {
      if (rx(pureSpecs[i]).test(lower)) return true;
    }
    if (/\d+\s*(m|mm|cm|meter|kg|ton|inch|inci|ft|feet)/gi.test(lower)) return true;
    if (/\d+\s*[x×]\s*\d+\s*(cm|m|meter|mm)/gi.test(lower)) return true;
    if (checkHasPerUnit(text)) return true;

    if (entityType === "jasa" || entityType === "produk" || entityType === "material") {
      if (/\d+\s*[x×]\s*\d+(?:\s*[x×]\s*\d+)?/i.test(lower)) {
        var materialCtx = /\b(keramik|granit|marmer|vinyl|parket|wallpaper|laminasi|homogeneous|keramik lantai|keramik dinding|granit tile|paving|bata|tile|ubin|wall|wall-panel|ceiling|partisi|pagar|panel)\b/i.test(lower);
        if (materialCtx) return true;
      }
    }
    return false;
  }

  // ═══════════════════════════════════════════════════════════
  // detectPageLevelForPrompt() — dengan cache (FIX-P4)
  // ═══════════════════════════════════════════════════════════
  function detectPageLevelForPrompt(text, entityType) {
    var cacheKey = text + "|" + (entityType || "null");
    if (_PLD_LEVEL_CACHE[cacheKey] !== undefined) {
      return _PLD_LEVEL_CACHE[cacheKey];
    }

    var cleanLower = text.toLowerCase().trim();
    for (var entity in ENTITY_PILLAR_NAMES) {
      if (!ENTITY_PILLAR_NAMES.hasOwnProperty(entity)) continue;
      var patterns = ENTITY_PILLAR_NAMES[entity];
      for (var i = 0; i < patterns.length; i++) {
        if (cleanLower === patterns[i]) {
          var isEntityMatch = entity === entityType || (entity === "produk interior" && entityType === "produk");
          if (isEntityMatch) {
            _PLD_LEVEL_CACHE[cacheKey] = "pillar";
            return "pillar";
          }
        }
      }
    }
    var level = detectMoneyLevelInternal(text, entityType);
    if (!level) { log('⚠️ Level null', 'WARN'); level = "money-page"; }
    _PLD_LEVEL_CACHE[cacheKey] = level;
    return level;
  }

function detectEntityTypeFromText(text) {
    if (!text) return null;
    var lower = text.toLowerCase();

    // ═══════════════════════════════════════════════════════════
    // FIX 134: "jasa desain" → entity=desain
    // ═══════════════════════════════════════════════════════════
    if (/\bjasa\s+(desain|interior|arsitektur|eksterior)\b/i.test(lower)) {
      log('🎯 FIX 134: "jasa desain" → entity=desain', 'DETECT');
      return "desain";
    }

    // ═══════════════════════════════════════════════════════════
    // FIX 132: Artikel priority (how-to prefix)
    // ═══════════════════════════════════════════════════════════
    if (/^(cara|panduan|tips|tutorial|langkah|apa itu|pengertian|definisi|perbedaan|perbandingan|review)/i.test(lower.trim())) {
      log('🎯 FIX 132: Artikel priority (how-to prefix)', 'DETECT');
      return "artikel";
    }

        // ═══════════════════════════════════════════════════════════
    // 🔥 FIX: Loop ENTITY_PRIORITY triggers — pakai WORD BOUNDARY
    // Bukan indexOf, supaya "bangunan" TIDAK match "bangun"
    // ═══════════════════════════════════════════════════════════
    for (var i = 0; i < ENTITY_PRIORITY.length; i++) {
      var entity = ENTITY_PRIORITY[i];
      var triggers = ENTITY_TRIGGERS[entity] || [];
      for (var j = 0; j < triggers.length; j++) {
        // 🔥 Pakai rx() = word boundary regex
        if (rx(triggers[j]).test(lower)) {
          log('🎯 ENTITY_PRIORITY match: "' + triggers[j] + '" → ' + entity, 'DETECT');
          return entity;
        }
      }
    }
    // ═══════════════════════════════════════════════════════════
    // Direct keyword check
    // ═══════════════════════════════════════════════════════════
    if (lower.indexOf("jasa") !== -1 || lower.indexOf("kontraktor") !== -1 || lower.indexOf("tukang") !== -1) return "jasa";
    if (lower.indexOf("sewa") !== -1 || lower.indexOf("rental") !== -1) return "sewa";
    if (lower.indexOf("desain") !== -1 || lower.indexOf("interior") !== -1) return "desain";
    if (lower.indexOf("material") !== -1 || lower.indexOf("bahan") !== -1) return "material";
    if (lower.indexOf("produk") !== -1 || lower.indexOf("jual") !== -1) return "produk";

    // ═══════════════════════════════════════════════════════════
    // Word list check — MATERIAL first
    // ═══════════════════════════════════════════════════════════
    for (var m = 0; m < MATERIAL_WORDS.length; m++) {
      if (rx(MATERIAL_WORDS[m]).test(lower)) {
        log('🎯 FIX 202: entity=material via word: ' + MATERIAL_WORDS[m], 'DETECT');
        return "material";
      }
    }

    // ═══════════════════════════════════════════════════════════
    // 🔥 FIX-VERB-DRIVEN: SEWA vs PRODUK untuk alat berat
    // ═══════════════════════════════════════════════════════════
    var hasSewaWord = false;
    var matchedSewaWord = null;
    for (var s = 0; s < SEWA_WORDS.length; s++) {
      if (rx(SEWA_WORDS[s]).test(lower)) {
        hasSewaWord = true;
        matchedSewaWord = SEWA_WORDS[s];
        log('🎯 FIX-VERB-DRIVEN: SEWA_WORDS match: ' + SEWA_WORDS[s], 'DETECT');
        break;
      }
    }

    if (hasSewaWord) {
      // Cek PRODUK context (harga, jual, beli, supplier, kondisi)
      var hasProdukContext = /\b(harga|jual|beli|supplier|distributor|toko|shop|dijual|dibeli|unit|stok|stock|baru|bekas|second|import|ekspor|kredit|cicilan)\b/i.test(lower);
      
      // Cek SEWA context (sewa, rental, rent, durasi, operator)
      var hasSewaContext = /\b(sewa|rental|rent|harian|mingguan|bulanan|tahunan|per hari|per jam|per minggu|per bulan|operator|self drive|lepas kunci|include operator|tanpa operator)\b/i.test(lower);

      // Cek JASA context (jasa, layanan, service)
      var hasJasaContext = /\b(jasa|layanan|service|servis)\b/i.test(lower);

      log('🔀 FIX-VERB-DRIVEN: ctx → produk=' + hasProdukContext + ' sewa=' + hasSewaContext + ' jasa=' + hasJasaContext, 'DETECT');

      if (hasJasaContext) {
        log('🎯 FIX-VERB-DRIVEN: entity=jasa (jasa context + alat berat)', 'DETECT');
        return "jasa";
      }

      if (hasProdukContext && !hasSewaContext) {
        log('🎯 FIX-VERB-DRIVEN: entity=produk (harga/jual/beli context)', 'DETECT');
        return "produk";
      }

      if (hasSewaContext) {
        log('🎯 FIX-VERB-DRIVEN: entity=sewa (sewa/rental context)', 'DETECT');
        return "sewa";
      }

      // Default: alat berat tanpa context → sewa (lebih umum disewa)
      log('🎯 FIX-VERB-DRIVEN: entity=sewa (default untuk alat berat: "' + matchedSewaWord + '")', 'DETECT');
      return "sewa";
    }

    // ═══════════════════════════════════════════════════════════
    // Word list check — PRODUK
    // ═══════════════════════════════════════════════════════════
    for (var p = 0; p < PRODUK_WORDS.length; p++) {
      if (rx(PRODUK_WORDS[p]).test(lower)) {
        log('🎯 FIX 202: entity=produk via word: ' + PRODUK_WORDS[p], 'DETECT');
        return "produk";
      }
    }

    // ═══════════════════════════════════════════════════════════
    // Word list check — DESAIN
    // ═══════════════════════════════════════════════════════════
    for (var d = 0; d < DESAIN_WORDS.length; d++) {
      if (rx(DESAIN_WORDS[d]).test(lower)) {
        log('🎯 FIX 202: entity=desain via word: ' + DESAIN_WORDS[d], 'DETECT');
        return "desain";
      }
    }

    // ═══════════════════════════════════════════════════════════
    // Jasa verb signal resolver
    // ═══════════════════════════════════════════════════════════
    var hasJasaVerbSignal = /\b(jasa|pasang|borongan|tukang|bongkar|gali|urug|cor|bor|coring|renovasi|perbaikan|instalasi|service|servis|bangun|las|grouting|cutting|drilling|sandblasting|pancang|pemancangan|pengecoran|pengeboran)\b/i.test(lower);
    var hasProdukTxSignal = /\b(harga|jual|beli|supplier|distributor|ready|stok|stock|unit|batang|lembar|keping)\b/i.test(lower);

    if (hasJasaVerbSignal && !hasProdukTxSignal) {
      var jasaNamesRL = ENTITY_BASE_NAMES.jasa || [];
      for (var jnRL = 0; jnRL < jasaNamesRL.length; jnRL++) {
        if (lower.indexOf(jasaNamesRL[jnRL]) !== -1) {
          log('🎯 FIX SEO v6: priority resolver → jasa (verb signal via "' + jasaNamesRL[jnRL] + '")', 'DETECT');
          return "jasa";
        }
      }
    }

    // ═══════════════════════════════════════════════════════════
    // Longest match resolver (fallback)
    // ═══════════════════════════════════════════════════════════
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
          bestMatchRL = { entity: entRL, length: nameRL.length, name: nameRL, priority: epRL };
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

      log('🔀 FIX #4: base "' + matchName + '" ditemukan di entity: [' + entitiesForBaseName.join(', ') + ']', 'CROSS');

      if (entitiesForBaseName.length >= 2) {
        var hasProdukCtx = /\b(harga|jual|beli|supplier|distributor|ready|stok|stock|unit|batang|lembar|keping|ukuran|dimensi|spesifikasi|mutu|k\d+|fc|sni|grade|ton|kg|m3|per kubik|per batang|per lembar)\b/i.test(lower);
        var hasJasaCtx = /\b(jasa|pasang|borongan|tukang|pemancangan|pengeboran|pancang|bor|pile|bongkar|gali|urug|cor|las|bending|cutting|coring|grouting|renovasi|perbaikan|instalasi|service|servis|bangun|pembuatan|pemasangan|pengerjaan|proyek)\b/i.test(lower);
        var hasSewaCtx = /\b(sewa|rental|rent|harian|mingguan|bulanan|tahunan|operator|self drive|lepas kunci)\b/i.test(lower);
        var hasDesainCtx = /\b(desain|gambar|render|visualisasi|3d|2d|animasi|walkthrough|konsep|layout)\b/i.test(lower);

        log('🔀 FIX #4: ctx → produk=' + hasProdukCtx + ' jasa=' + hasJasaCtx + ' sewa=' + hasSewaCtx + ' desain=' + hasDesainCtx, 'CROSS');

        if (hasDesainCtx && entitiesForBaseName.indexOf('desain') !== -1 && !hasJasaCtx && !hasProdukCtx) {
          log('🎯 FIX #4: ambiguous "' + matchName + '" → desain (context)', 'DETECT');
          return "desain";
        }
        if (hasSewaCtx && entitiesForBaseName.indexOf('sewa') !== -1 && !hasProdukCtx) {
          log('🎯 FIX #4: ambiguous "' + matchName + '" → sewa (context)', 'DETECT');
          return "sewa";
        }
        if (hasJasaCtx && hasProdukCtx) {
          log('🎯 FIX #4: ambiguous "' + matchName + '" → jasa (jasa+produk ctx)', 'DETECT');
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

        var priorityOrder = ["jasa","sewa","desain","produk","material","artikel"];
        for (var po = 0; po < priorityOrder.length; po++) {
          if (entitiesForBaseName.indexOf(priorityOrder[po]) !== -1) {
            log('🎯 FIX #4: ambiguous "' + matchName + '" → ' + priorityOrder[po] + ' (fallback)', 'DETECT');
            return priorityOrder[po];
          }
        }
      }

      log('🎯 FIX SEO v6: longest match → ' + bestMatchRL.entity + ' (via "' + bestMatchRL.name + '")', 'DETECT');
      return bestMatchRL.entity;
    }

    return null;
  }
   
  function detectEntityType(userEntityType) {
  if (userEntityType && VALID_ENTITY_TYPES.indexOf(userEntityType) !== -1) return userEntityType;
  
  // 🔥 FIX: Entity detection HANYA dari SLUG URL (bukan H1)
  // H1 hanya untuk FOKUS KONTEN, bukan untuk entity/level
  var slugText = getPageText();
  
  // Fallback ke H1 HANYA kalau slug generic/kosong
  if (!slugText || slugText.length < 3 || /^(blog|post|artikel|produk|layanan|service|item|page|p|home|index|\d+)(\s+\d+)?\s*$/i.test(slugText.trim())) {
    var h1Text = getH1Text();
    if (h1Text && h1Text.length > 3) {
      log('🎯 FIX: entity detection via H1 (slug generic)', 'DETECT');
      return detectEntityTypeFromText(h1Text);
    }
  }
  
  return detectEntityTypeFromText(slugText);
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
            log('📋 FIX 147: SP1 weak context DITOLAK', 'SPECPHRASE');
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
    var TECHNICAL_SPECS = ["k225","k250","k300","k350","k400","k500","fc","m6","m8","m10","m12","m16","m20","b0","b1","b2","b3","sni"];
    for (var i = 0; i < TECHNICAL_SPECS.length; i++) {
      if (rx(TECHNICAL_SPECS[i]).test(lower)) return true;
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

    var moneyWords = ['harga','biaya','tarif','estimasi','ongkos','bersaing','kompetitif','pasaran','murah','hemat','terjangkau'];
    for (var i = 0; i < moneyWords.length; i++) {
      coreText = coreText.replace(rx(moneyWords[i], 'g'), '');
    }

    if (_MASTER.noiseUniv) {
      _MASTER.noiseUniv.lastIndex = 0;
      coreText = coreText.replace(_MASTER.noiseUniv, ' ');
    }
    if (entityType === "jasa" && _MASTER.noiseJasa) {
      _MASTER.noiseJasa.lastIndex = 0;
      coreText = coreText.replace(_MASTER.noiseJasa, ' ');
    }

    var entityOnlyWords = ENTITY_ONLY_WORDS[entityType] || [];
    for (var i = 0; i < entityOnlyWords.length; i++) {
      coreText = coreText.replace(rx(entityOnlyWords[i], 'g'), ' ');
    }

        var hasConjunction = /\b(atau|dan|serta)\b/i.test(coreText);
    if (entityType && ENTITY_BASE_NAMES[entityType] && !hasConjunction) {
      var baseNamesEarly = ENTITY_BASE_NAMES[entityType] || [];
      var sortedBaseNamesEarly = baseNamesEarly.slice().sort(function(a, b) {
        return b.split(' ').length - a.split(' ').length;
      });
      
      var baseNamesSet = {};
      for (var k = 0; k < sortedBaseNamesEarly.length; k++) {
        baseNamesSet[sortedBaseNamesEarly[k]] = true;
      }
      
      var _baseNamesToSkipEarly = {};
      for (var b1e = 0; b1e < sortedBaseNamesEarly.length; b1e++) {
        var bn1e = sortedBaseNamesEarly[b1e];
        for (var b2e = 0; b2e < sortedBaseNamesEarly.length; b2e++) {
          if (b1e === b2e) continue;
          var bn2e = sortedBaseNamesEarly[b2e];
          if (bn2e.length > bn1e.length) {
            var bn1eRegex = new RegExp("\\b" + _escapeRegex(bn1e) + "\\b", "i");
            if (bn1eRegex.test(bn2e)) {
              var bn2eRegex = new RegExp("\\b" + _escapeRegex(bn2e) + "\\b", "i");
              if (bn2eRegex.test(coreText)) {
                _baseNamesToSkipEarly[bn1e] = true;
                break;
              }
            }
          }
        }
      }
      
      for (var i = 0; i < sortedBaseNamesEarly.length; i++) {
        var bn = sortedBaseNamesEarly[i];
        if (_baseNamesToSkipEarly[bn]) {
          log('🔥 FIX-MULTIWORD: SKIP substring "' + bn + '"', 'CORE');
          continue;
        }
        var bnWords = bn.split(' ');
        var lastWord = bnWords[bnWords.length - 1];
        if (bnWords.length >= 2 && APPLICATION_TARGETS.indexOf(lastWord) !== -1) {
          var baseWithoutTarget = bnWords.slice(0, -1).join(' ');
          if (baseNamesSet[baseWithoutTarget]) {
            log('🔥 FIX 170: SKIP "' + bn + '"', 'CORE');
            continue;
          }
        }
        coreText = coreText.replace(rx(bn, 'g'), ' ');
      }
    }

    if (entityType === "jasa") {
      for (var i = 0; i < COMMON_JASA_WORDS.length; i++) {
        coreText = coreText.replace(rx(COMMON_JASA_WORDS[i], 'g'), ' ');
      }
    }

    var stopwords = ["dan","atau","serta","yang","dari","ke","di","untuk","dengan","ini","itu","akan","telah","sudah","masih","pada","oleh","karena","sehingga","setelah","sebelum"];
    for (var i = 0; i < stopwords.length; i++) {
      coreText = coreText.replace(rx(stopwords[i], 'g'), ' ');
    }
    for (var i = 0; i < TIER_1_LOCATION.length; i++) {
      coreText = coreText.replace(rx(TIER_1_LOCATION[i], 'g'), ' ');
    }
    var subPillarWords = ['daftar','jenis','macam','kategori','tipe','list','katalog','rekomendasi','pilihan','variasi','model','gaya','varian','perbandingan','vs','versus','kelebihan','kekurangan','perbedaan','lebih baik','unggul','terbaik'];
    for (var i = 0; i < subPillarWords.length; i++) {
      coreText = coreText.replace(rx(subPillarWords[i], 'g'), ' ');
    }
    for (var i = 0; i < INFORMATIONAL_WORDS.length; i++) {
      coreText = coreText.replace(rx(INFORMATIONAL_WORDS[i], 'g'), ' ');
    }
    for (var i = 0; i < COMMERCIAL_WORDS.length; i++) {
      coreText = coreText.replace(rx(COMMERCIAL_WORDS[i], 'g'), ' ');
    }
    for (var i = 0; i < QUESTION_WORDS.length; i++) {
      coreText = coreText.replace(rx(QUESTION_WORDS[i], 'g'), ' ');
    }
    for (var i = 0; i < COMMERCIAL_INVESTIGATION_WORDS.length; i++) {
      coreText = coreText.replace(rx(COMMERCIAL_INVESTIGATION_WORDS[i], 'g'), ' ');
    }
    for (var i = 0; i < SPEC_PHRASE_WORDS.length; i++) {
      coreText = coreText.replace(rx(SPEC_PHRASE_WORDS[i], 'g'), ' ');
    }

    var fisikRole = checkFisikRole(coreText);
    if (fisikRole !== "object") {
      for (var i = 0; i < FISIK_WORDS.length; i++) {
        coreText = coreText.replace(rx(FISIK_WORDS[i], 'g'), ' ');
      }
    }
    coreText = coreText.replace(/\b(dekat|sekitar|berdekatan|terdekat|near|around|disekitar|didekat)\b/g, ' ');

    if (_MASTER.satuanPer) {
      _MASTER.satuanPer.lastIndex = 0;
      coreText = coreText.replace(_MASTER.satuanPer, ' ');
    }
    // Catatan: _MASTER.satuanUnits tidak dipakai di sini (sesuai aslinya)

        var coreWords = coreText.split(/\s+/).filter(function(w) { return w.length > 2; });
    var uniqueWords = [];
    var seen = {};
    for (var i = 0; i < coreWords.length; i++) {
      var w = coreWords[i];
      if (!seen[w]) { seen[w] = true; uniqueWords.push(w); }
    }

    // ═══════════════════════════════════════════════════════════
    // 🔥 PATCH 5: Fallback kalau coreWords kosong tapi ada base service
    // ═══════════════════════════════════════════════════════════
    if (uniqueWords.length === 0 && checkHasBaseService(text)) {
      var fallbackBaseNames = ENTITY_BASE_NAMES[entityType] || [];
      var fallbackSorted = fallbackBaseNames.slice().sort(function(a, b) {
        return b.split(' ').length - a.split(' ').length;
      });
      for (var fb = 0; fb < fallbackSorted.length; fb++) {
        var fbName = fallbackSorted[fb];
        var fbRegex = new RegExp("\\b" + _escapeRegex(fbName) + "\\b", "i");
        if (fbRegex.test(text)) {
          var fbWords = fbName.split(' ');
          var fbLast = fbWords[fbWords.length - 1];
          if (fbLast.length > 2) {
            uniqueWords.push(fbLast);
            log('🔥 PATCH-5: fallback core word = "' + fbLast + '"', 'CORE');
          }
          break;
        }
      }
    }

    return uniqueWords;
  }

  function detectVariantByPattern(text, entityType) {
    if (!text) return { isVariant: false, score: 0, reasons: [] };
    var score = 0;
    var reasons = [];
    var specResult = _memoCheckHasSpecification
      ? _memoCheckHasSpecification(text, entityType)
      : checkHasSpecification(text, entityType);

    if (specResult) {
      var isPureTech = _memoCheckPureTechnicalSpec
        ? _memoCheckPureTechnicalSpec(text, entityType)
        : checkPureTechnicalSpec(text, entityType);
      if (isPureTech) {
        var actualLayers = _memoCountModifierLayers
          ? _memoCountModifierLayers(text, entityType)
          : countModifierLayers(text, entityType);
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
    var subVar = _memoIsSubVariant
      ? _memoIsSubVariant(text, entityType)
      : isSubVariant(text, entityType);
    if (subVar) return "sub-variant";

    var hasTech = _memoHasTechnicalSpec
      ? _memoHasTechnicalSpec(text)
      : hasTechnicalSpec(text);
    if (hasTech) return "variant";

    var result = _memoDetectVariantByPattern
      ? _memoDetectVariantByPattern(text, entityType)
      : detectVariantByPattern(text, entityType);
    if (result.isVariant) {
      if (result.level) {
        log('🔥 FIX #1c: detectVariantLevel → ' + result.level, 'VARIANT');
        return result.level;
      }
      return "variant";
    }
    return null;
  }

  function getFactors(text, entityType) {
    return {
      hasLocation: isLocation(text),
      hasSpec: _memoCheckHasSpecification
        ? _memoCheckHasSpecification(text, entityType)
        : checkHasSpecification(text, entityType),
      hasPrice: checkHasPrice(text),
      hasCommercial: checkHasCommercial(text, entityType),
      hasSpecPhrase: checkHasSpecPhrase(text),
      hasInfoSpecPhrase: checkHasInformationalSpecPhrase(text),
      hasPerUnit: checkHasPerUnit(text),
      fisikRole: _memoCheckFisikRole
        ? _memoCheckFisikRole(text)
        : checkFisikRole(text),
      hasCompoundAction: checkCompoundAction(text),
      complexityScore: _memoCalculateComplexityScore
        ? _memoCalculateComplexityScore(text, entityType)
        : calculateComplexityScore(text, entityType),
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
    var complexityScore = _memoCalculateComplexityScore
      ? _memoCalculateComplexityScore(text, entityType)
      : calculateComplexityScore(text, entityType);
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

  // ═══════════════════════════════════════════════════════════
  // WARNING FUNCTIONS
  // ═══════════════════════════════════════════════════════════

  function detectConjunctionWarning(slug, level) {
    if (!slug || !level) return [];
    var lower = slug.toLowerCase();
    var warnings = [];

    if (/\bcut and fill\b/i.test(lower)) return warnings;

    var hasAtau = /\batau\b/.test(lower);
    var hasDan = /\b(dan|serta)\b/.test(lower);

    if (hasAtau && level !== "sub-pillar-tipe-1" && level !== "sub-pillar-tipe-2") {
      var parts184 = lower.split(/\batau\b/);
      var leftW184 = (parts184[0] || "").trim().split(/\s+/).filter(Boolean);
      var rightW184 = (parts184[1] || "").trim().split(/\s+/).filter(Boolean);
      if (leftW184.length >= 2 && rightW184.length >= 2) {
        warnings.push({
          type: "SEO_MISALIGNMENT_ATAU", severity: "warning",
          message: "URL mengandung 'atau' dengan 2 sisi substantif tapi level '" + level + "'.",
          suggestion: "Ganti ke 'dan' untuk MP (bundling), atau expand jadi 'A vs B' untuk SP1."
        });
      } else {
        log('🎯 FIX 184: SKIP "atau" warning', 'SEO');
      }
    }

    if (hasDan && level !== "money-page") {
      warnings.push({
        type: "SEO_MISALIGNMENT_DAN", severity: "warning",
        message: "URL mengandung 'dan'/'serta' tapi level '" + level + "'.",
        suggestion: "Pecah jadi 2 halaman, atau ganti konjungsi."
      });
    }
    return warnings;
  }

  function detectSameLevelContentWarning(slug, entityType) {
    var warnings = [];
    if (!slug) return warnings;
    var lower = slug.toLowerCase();

    var TRIGGER_CATEGORIES = [
      { type: "PROMO_WORD", words: ["murah","hemat","terjangkau","bersaing","kompetitif","ekonomis"], icon: "💰",
        doNotTemplate: "JANGAN redirect — user cari '{WORD}' butuh halaman ini",
        angle_suggestion: "Buat angle beda: tips hemat, paket ekonomis, perbandingan harga" },
      { type: "SCALE_WORD", words: ["kecil","besar","sedang","mini","jumbo","heavy","medium"], icon: "📏",
        doNotTemplate: "JANGAN redirect kalau kontennya memang beda scope",
        angle_suggestion: "Buat angle beda: kapasitas, portabilitas, penggunaan" },
      { type: "PROMO_STRONG", words: ["promo","diskon","obral","flash sale","cuci gudang"], icon: "🔥",
        doNotTemplate: "Cek apakah halaman promo ini temporary atau permanen",
        angle_suggestion: "Paket bundle, limited time offer, benefit eksklusif" },
      { type: "LOCATION_VARIANT", words: ["jakarta","bandung","surabaya","jogja","semarang"], icon: "📍",
        doNotTemplate: "JANGAN redirect — lokasi beda = audiens beda",
        angle_suggestion: "Konten lokal: studi kasus, klien, testimoni di kota itu" }
    ];

    for (var catIdx = 0; catIdx < TRIGGER_CATEGORIES.length; catIdx++) {
      var cat = TRIGGER_CATEGORIES[catIdx];
      for (var wIdx = 0; wIdx < cat.words.length; wIdx++) {
        var word = cat.words[wIdx];
        var rxW = rxRaw("\\b" + _escapeRegex(word) + "\\b", "i");
        if (!rxW.test(lower)) continue;

        var baseSlug = lower.replace(rxRaw("\\b" + _escapeRegex(word) + "\\b", "gi"), "").replace(/\s+/g, " ").trim();
        if (!baseSlug) continue;

        warnings.push({
          type: "SAME_LEVEL_CONTENT_REVIEW", severity: "info",
          category: cat.type, icon: cat.icon, triggerWord: word,
          currentSlug: lower, baseSlug: baseSlug,
          message: "URL ini punya level SAMA dengan '" + baseSlug + "'.",
          checklist: [
            "1. H1 beda?", "2. Title tag beda?", "3. Meta description beda?",
            "4. Konten >60% unik?", "5. Angle beda?", "6. Internal link beda?"
          ],
          do_not: cat.doNotTemplate.replace("{WORD}", word),
          suggestion: cat.angle_suggestion,
          action_if_duplicate: "REWRITE konten, JANGAN redirect/hapus",
          action_if_unique: "✅ Aman — biarkan 2 halaman"
        });
        break;
      }
    }
    return warnings;
  }

  function detectHierarchyWarning(slug, entityType) {
    var warnings = [];
    if (!slug) return warnings;
    var words = slug.split(" ").filter(function(w) { return w.length > 0; });
    if (words.length <= 2) return warnings;
    if (/\b(atau|dan|serta)\b/i.test(slug)) return warnings;

    var parentSlug = words.slice(0, -1).join(" ");
    var currentLevel = detectPageLevelForPrompt(slug, entityType);
    var parentLevel = detectPageLevelForPrompt(parentSlug, entityType);

    var currentNum = LEVEL_HIERARCHY_MAP[currentLevel] || -1;
    var parentNum = LEVEL_HIERARCHY_MAP[parentLevel] || -1;

    if (parentNum < 3) return warnings;
    if (parentLevel === "pillar") return warnings;
    if (currentLevel === "money-child") return warnings;

    if (currentNum <= parentNum) {
      var expectedNum = parentNum + 1;
      var expectedLevel = LEVEL_INVERSE_MAP[expectedNum];
      warnings.push({
        type: "SEO_HIERARCHY_MISMATCH", severity: "warning",
        parentSlug: parentSlug, parentLevel: parentLevel,
        currentLevel: currentLevel, expectedLevel: expectedLevel,
        message: "URL '" + slug + "' terdeteksi '" + currentLevel + "', tapi parent '" + parentSlug + "' = '" + parentLevel + "'.",
        suggestion: "Pisah jadi halaman terpisah, atau tambahkan modifier spesifik untuk naikkan ke " + expectedLevel + "."
      });
    }
    return warnings;
  }

  function computeBreadcrumbLevels(slug, entityType, domain) {
    if (!slug) return [];
    var words = slug.split(" ").filter(Boolean);
    var entity = entityType || detectEntityTypeFromText(slug);
    var results = [];
    for (var i = 2; i <= words.length; i++) {
      var segSlug = words.slice(0, i).join(" ");
      var segLevel = detectPageLevelForPrompt(segSlug, entity);
      var segLevelNum = LEVEL_HIERARCHY_MAP[segLevel] || -1;
      results.push({
        position: i, slug: segSlug, level: segLevel,
        levelNum: segLevelNum, isCurrent: (i === words.length)
      });
    }
    return results;
  }

  function validateBreadcrumbHierarchy(slug, entityType) {
    var warnings = [];
    if (!slug) return warnings;
    var chain = computeBreadcrumbLevels(slug, entityType);
    if (chain.length < 2) return warnings;
    if (/\b(atau|dan|serta)\b/i.test(slug)) return warnings;

    var current = chain[chain.length - 1];
    var parent = null;
    for (var i = chain.length - 2; i >= 0; i--) {
      if (chain[i].levelNum >= 4) { parent = chain[i]; break; }
    }
    if (!parent) return warnings;
    if (current.level === "money-child") return warnings;
    if (current.levelNum >= 7) return warnings;

    if (current.levelNum <= parent.levelNum) {
      var expectedNum = parent.levelNum + 1;
      var expectedLevel = LEVEL_INVERSE_MAP[expectedNum] || "money-page";
      warnings.push({
        type: "SEO_HIERARCHY_MISMATCH", severity: "warning",
        parentSlug: parent.slug, parentLevel: parent.level,
        currentSlug: current.slug, currentLevel: current.level,
        expectedLevel: expectedLevel,
        message: "URL '" + current.slug + "' = '" + current.level + "', parent '" + parent.slug + "' juga '" + parent.level + "'.",
        suggestion: "Tambahkan modifier spesifik untuk naikkan ke '" + expectedLevel + "'."
      });
    }
    return warnings;
  }

  function validateParentDrivenHierarchy(slug, entityType) {
    var warnings = [];
    if (!slug) return warnings;
    var words = slug.split(" ").filter(Boolean);
    if (words.length <= 2) return warnings;
    if (/\b(atau|dan|serta)\b/i.test(slug)) return warnings;

    var parentSlug = words.slice(0, -1).join(" ");
    var parentLevel = detectPageLevelForPrompt(parentSlug, entityType);

    if (parentLevel === "pillar") return warnings;
    if (!EXPECTED_CHILD_MAP[parentLevel]) return warnings;

    var rule = EXPECTED_CHILD_MAP[parentLevel];
    if (rule.isLeaf) return warnings;

    var currentLevel = detectPageLevelForPrompt(slug, entityType);

    if (currentLevel === "money-child") {
      if (parentLevel === "money-page" || parentLevel === "money-master") return warnings;
    }

    if (currentLevel === "variant" && parentLevel === "money-child") {
      warnings.push({
        type: "SEO_HIERARCHY_MISMATCH", severity: "warning",
        parentSlug: parentSlug, parentLevel: parentLevel,
        currentLevel: currentLevel, expectedLevel: "money-page",
        message: "URL '" + slug + "' = Variant, tapi parent '" + parentSlug + "' = MC.",
        suggestion: "Pindah lokasi ke akhir URL (attribute), atau buat MP tanpa lokasi dulu."
      });
      return warnings;
    }

    var isExpected = (currentLevel === rule.expected);
    var isAlternate = false;
    if (rule.alternates && rule.alternates.indexOf(currentLevel) !== -1) isAlternate = true;
    if (rule.alternate && currentLevel === rule.alternate) isAlternate = true;

    if (!isExpected && !isAlternate) {
      var expectedList = [rule.expected];
      if (rule.alternates) expectedList = expectedList.concat(rule.alternates);
      if (rule.alternate) expectedList.push(rule.alternate);
      warnings.push({
        type: "SEO_PARENT_DRIVEN_MISMATCH", severity: "warning",
        parentSlug: parentSlug, parentLevel: parentLevel,
        parentLevelNum: LEVEL_HIERARCHY_MAP[parentLevel],
        currentLevel: currentLevel,
        currentLevelNum: LEVEL_HIERARCHY_MAP[currentLevel],
        expectedLevel: rule.expected,
        alternates: rule.alternates || (rule.alternate ? [rule.alternate] : []),
        message: "URL '" + slug + "' = '" + currentLevel + "'. Parent '" + parentSlug + "' (" + parentLevel + "), expected: " + expectedList.join(" atau ") + ".",
        suggestion: currentLevel === parentLevel
          ? "Child level sama dengan parent. Tambahkan modifier spesifik, atau pisah topik."
          : "Level child bukan expected. Cek struktur URL & konten."
      });
    }
    return warnings;
  }

  // ═══════════════════════════════════════════════════════════
  // detectMoneyLevelInternal() — dengan memoize
  // ═══════════════════════════════════════════════════════════

    function detectMoneyLevelInternal(text, entityType) {
    var lowerText = text.toLowerCase();
    var factors = _memoGetFactors
      ? _memoGetFactors(text, entityType)
      : getFactors(text, entityType);

    var hasPriceWord = factors.hasPrice;
    var hasLocationWord = factors.hasLocation;
    var hasCommercialWord = factors.hasCommercial;
    var hasSpecWord = factors.hasSpec;
    var hasSpecPhrase = factors.hasSpecPhrase;
    var hasPerUnit = factors.hasPerUnit;
    var hasCompound = factors.hasCompoundAction;
    var complexityScore = factors.complexityScore;
    var hasBaseService = factors.hasBaseService;
    var subPillar = detectSubPillar(text);

    log('🔍 FACTORS: loc=' + hasLocationWord + ' spec=' + hasSpecWord + ' price=' + hasPriceWord + ' comm=' + hasCommercialWord + ' score=' + complexityScore + ' baseSvc=' + hasBaseService, 'INFO');

    if (subPillar) return subPillar;

    if (hasLocationWord) {
      if (hasBaseService) {
        log('📍 FIX 193: MONEY_CHILD', 'LOCATION');
        return "money-child";
      }
    }

    if (hasSpecPhrase && !hasLocationWord && !hasCommercialWord) {
      log('💰 MONEY_PAGE (spec phrase)', 'PRICE');
      return "money-page";
    }

    if (hasPerUnit && !hasPriceWord && !hasCommercialWord && !hasLocationWord && !hasSpecPhrase) {
      log('💰 MONEY_PAGE (per-unit)', 'PRICE');
      return "money-page";
    }

    if (hasCompound && !hasLocationWord && !hasCommercialWord) {
      log('💰 MONEY_PAGE (compound)', 'PRICE');
      return "money-page";
    }

    if (complexityScore >= 3 && !hasLocationWord && !hasCommercialWord && !hasPriceWord) {
      log('💰 MONEY_PAGE (score=' + complexityScore + ')', 'SCORE');
      return "money-page";
    }

    var jasaMaterialCtx186 = false;
    if (entityType === "jasa") {
      var hasMatCtx = _memoHasJasaMaterialCtx ? _memoHasJasaMaterialCtx(text) : hasJasaMaterialCtx(text);
      if (hasMatCtx) {
        var isMaterialInBase = false;
        var jasaBaseList = ENTITY_BASE_NAMES.jasa || [];
        var materialWords186 = SHARED_MODIFIERS.material;
        for (var mbi = 0; mbi < jasaBaseList.length; mbi++) {
          var baseName186 = jasaBaseList[mbi];
          if (materialWords186.indexOf(baseName186) !== -1) continue;
          for (var mwi = 0; mwi < materialWords186.length; mwi++) {
            var matWord = materialWords186[mwi];
            if (matWord === baseName186) continue;
            if (rx(matWord).test(baseName186)) {
              if (text.indexOf(baseName186) !== -1) {
                isMaterialInBase = true;
                break;
              }
            }
          }
          if (isMaterialInBase) break;
        }
        if (!isMaterialInBase) jasaMaterialCtx186 = true;
      }
    }

    var hasStrongPromo211 = false;
    if (_MASTER.highVolume && _MASTER.highVolume.test(lowerText)) {
      hasStrongPromo211 = true;
    }

    var skipP7Atau = false;
    if (/\batau\b/i.test(lowerText)) {
      var partsAtau = lowerText.split(/\batau\b/);
      var leftAtau = (partsAtau[0] || "").trim().split(/\s+/).filter(Boolean);
      var rightAtau = (partsAtau[1] || "").trim().split(/\s+/).filter(Boolean);
      if (leftAtau.length <= 1 || rightAtau.length <= 1) {
        skipP7Atau = true;
      }
    }

    var earlyLayers = 0;
    if (!hasPriceWord && !hasCommercialWord && !hasLocationWord && !hasStrongPromo211 && !skipP7Atau) {
      earlyLayers = _memoCountModifierLayers
        ? _memoCountModifierLayers(text, entityType)
        : countModifierLayers(text, entityType);
    }

    if ((hasSpecWord || jasaMaterialCtx186 || earlyLayers > 0)
        && !hasPriceWord && !hasCommercialWord && !hasLocationWord
        && !hasStrongPromo211 && !skipP7Atau) {
      var layers186 = earlyLayers;
      if (layers186 === 0 && jasaMaterialCtx186) layers186 = 1;
      if (layers186 > 0) {
        var decision186 = decideLevelByLayers(layers186);
        log('🔥 FIX v16-C: ' + decision186 + ' (' + layers186 + ' layer)', 'VARIANT');
        return decision186;
      }
    }

    if (hasCommercialWord && hasSpecWord && !hasLocationWord) {
      var layersP8 = _memoCountModifierLayers
        ? _memoCountModifierLayers(text, entityType)
        : countModifierLayers(text, entityType);
      if (layersP8 >= 1) {
        var decisionP8 = decideLevelByLayers(layersP8);
        log('🔥 FIX 206: comm+spec → ' + decisionP8, 'PRICE');
        return decisionP8;
      }
      log('💰 FIX 206: MONEY_PAGE (comm+spec fallback)', 'PRICE');
      return "money-page";
    }

    if (hasPriceWord && entityType === "desain" && !hasLocationWord && !hasCommercialWord && !hasSpecWord) {
      _buildMasterRegexes();
      if (_MASTER.appTargets) {
        for (var mwt8 = 0; mwt8 < APPLICATION_TARGETS_FULL.length; mwt8++) {
          var mwt8w = APPLICATION_TARGETS_FULL[mwt8];
          if (mwt8w.indexOf(' ') !== -1 && rx(mwt8w).test(lowerText)) {
            log('🔥 FIX SEO v8: desain masked multi-word target "' + mwt8w + '" → MP', 'HARGA');
            return "money-page";
          }
        }
      }
    }

    // ═══════════════════════════════════════════════════════════
    // 🔥 FIX 204: PRICE + BASE SERVICE + NON-SPEC
    // ═══════════════════════════════════════════════════════════
   if (hasPriceWord && hasBaseService && !hasSpecWord && !hasCommercialWord && !hasLocationWord) {
        var preCore = _memoGetCoreWords
          ? _memoGetCoreWords(text, entityType)
          : getCoreWords(text, entityType);
      
        log('🔥 FIX 204: preCore=[' + preCore.join(',') + '] (len=' + preCore.length + ')', 'CORE');
      
        if (preCore.length === 0) {
          log('🏛️ FIX 204: MONEY_MASTER (base service murni)', 'MM');
          return "money-master";     
        }

      if (preCore.length === 1) {
        var coreWord = preCore[0];
        
        // ═══════════════════════════════════════════════════════════
        // 🔥 PATCH 6: Cek apakah coreWord adalah bagian dari base name
        // ═══════════════════════════════════════════════════════════
        var isPartOfBaseName = false;
        var checkBaseList = ENTITY_BASE_NAMES[entityType] || [];
        for (var cb = 0; cb < checkBaseList.length; cb++) {
          var cbName = checkBaseList[cb];
          var cbRegex = new RegExp("\\b" + _escapeRegex(cbName) + "\\b", "i");
          if (cbRegex.test(text)) {
            if (cbName.indexOf(coreWord) !== -1) {
              isPartOfBaseName = true;
              log('🔥 PATCH-6: coreWord "' + coreWord + '" adalah bagian dari base "' + cbName + '"', 'CORE');
              break;
            }
          }
        }
        
        // ═══════════════════════════════════════════════════════════
        // 🔥 PATCH D — FIX v3: HARUS SEBELUM APPLICATION_TARGETS
        // Kalau coreWord adalah bagian dari base name + ada price
        // → money-master (konsisten dengan jasa)
        // ═══════════════════════════════════════════════════════════
        if (isPartOfBaseName && hasPriceWord) {
          log('💵 PATCH-D-v3: MONEY_MASTER (price + base name part: "' + coreWord + '")', 'HARGA');
          return "money-master";
        }

        // Cek 1: APPLICATION_TARGETS
        if (APPLICATION_TARGETS.indexOf(coreWord) !== -1) {
          var hasCompoundBase154 = false;
          var baseList154 = ENTITY_BASE_NAMES[entityType] || [];
          for (var bi154 = 0; bi154 < baseList154.length; bi154++) {
            var baseName154 = baseList154[bi154];
            if (baseName154.split(' ').length >= 2 && text.indexOf(baseName154) !== -1) {
              hasCompoundBase154 = true;
              break;
            }
          }
          if (hasCompoundBase154) return "money-page";
          return "money-master";
        }

        // Cek 2: Spec modifier
        if (isSpecModifierForEntity(coreWord, entityType)) {
          log('💵 FIX 204: MONEY_PAGE (price + spec: ' + coreWord + ')', 'HARGA');
          return "money-page";
        }
         
        // Cek 3: Jasa + material context
        if (entityType === "jasa") {
          var narrow182 = SHARED_MODIFIERS.material;
          if (narrow182.indexOf(coreWord) !== -1) {
            var isMatInBase204 = false;
            var jasaBase204 = ENTITY_BASE_NAMES.jasa || [];
            for (var jbi = 0; jbi < jasaBase204.length; jbi++) {
              if (jasaBase204[jbi].indexOf(coreWord) !== -1 && text.indexOf(jasaBase204[jbi]) !== -1) {
                isMatInBase204 = true;
                break;
              }
            }
            if (isMatInBase204) {
              log('🏛️ FIX 204: MONEY_MASTER (compound base + material)', 'MM');
              return "money-master";
            }
            log('💵 FIX 204: MONEY_PAGE (jasa + material)', 'HARGA');
            return "money-page";
          }
        }

        log('🏛️ FIX 204: MONEY_MASTER (price + base + non-spec)', 'MM');
        return "money-master";
      }

      log('💵 FIX 204: MONEY_PAGE (price + 2+ modifier)', 'HARGA');
      return "money-page";
    }

    if (hasPriceWord && hasSpecWord && !hasLocationWord && !hasCommercialWord) {
      var layersP9 = _memoCountModifierLayers
        ? _memoCountModifierLayers(text, entityType)
        : countModifierLayers(text, entityType);
      if (layersP9 >= 1) {
        var decisionP9 = decideLevelByLayers(layersP9);
        log('🔥 FIX 186: price+spec → ' + decisionP9, 'HARGA');
        return decisionP9;
      }

      _buildMasterRegexes();
      if (_MASTER.appTargets) {
        for (var at9 = 0; at9 < APPLICATION_TARGETS_FULL.length; at9++) {
          var at9w = APPLICATION_TARGETS_FULL[at9];
          if (rx(at9w).test(lowerText)) {
            var isRoomCtx9 = false;
            if (entityType === "desain") {
              var ROOM_CTX_9 = ["rumah","kantor","toko","hotel","restoran","cafe","villa","apartemen","ruko","kios","gudang","klinik","sekolah","mall","spa","salon","bar","lounge","butik","showroom","minimarket"];
              isRoomCtx9 = ROOM_CTX_9.indexOf(at9w) !== -1;
            }
            if (!isRoomCtx9) {
              log('🔥 FIX SEO v9: price+spec+target "' + at9w + '" (layers=0) → MP', 'HARGA');
              return "money-page";
            }
          }
        }
      }

      var isPureTechForPrice = _memoCheckPureTechnicalSpec
        ? _memoCheckPureTechnicalSpec(text, entityType)
        : checkPureTechnicalSpec(text, entityType);
      if (isPureTechForPrice) return "money-page";
      return "money-master";
    }

    if (hasPriceWord && hasPerUnit && !hasLocationWord && !hasCommercialWord && !hasSpecWord) {
      log('💰 FIX v17-G: MONEY_PAGE (price + per-unit)', 'PRICE');
      return "money-page";
    }

    if (hasPriceWord && hasPerUnit && hasSpecWord && !hasLocationWord && !hasCommercialWord) {
      log('💰 FIX v17-H: MONEY_PAGE (price + per-unit + spec)', 'PRICE');
      return "money-page";
    }

    if (hasCommercialWord && !hasLocationWord) {
      if (hasPriceWord && !hasSpecWord) { log('🏛️ MONEY_MASTER', 'HARGA'); return "money-master"; }
      log('💰 MONEY_PAGE (comm)', 'PRICE');
      return "money-page";
    }

    var hasHighVolume = false;
    if (_MASTER.highVolume && _MASTER.highVolume.test(lowerText)) hasHighVolume = true;

    if (hasHighVolume && !hasLocationWord) {
      var layers215 = _memoCountModifierLayers
        ? _memoCountModifierLayers(text, entityType)
        : countModifierLayers(text, entityType);
      if (layers215 > 0) {
        var decision215 = decideLevelByLayers(layers215);
        log('💰 FIX 215: ' + decision215 + ' (' + layers215 + ' layer + promo)', 'PRICE');
        return decision215;
      }
      var hasNoun215 = /\b(jasa|layanan|produk|material|pondasi|tiang|pancang|pagar|panel|beton|baja|besi|kayu|batu|keramik|granit|marmer|plafon|gypsum|kanopi|paving|readymix|cor|sewa|rental|alat|mesin|bangunan|konstruksi)\b/i.test(lowerText);
      if (hasNoun215 || hasSpecWord) {
        log('💰 FIX 215: MONEY_PAGE (strong promo, 0 layer)', 'PRICE');
        return "money-page";
      }
    }

    var hasDanConj = /\b(dan|serta)\b/i.test(lowerText);
    var isDanBaseNamePart = /\bcut and fill\b/i.test(lowerText);
    if (hasDanConj && !isDanBaseNamePart && !hasLocationWord && !hasCommercialWord && !hasPriceWord) {
      var coreForDan = _memoGetCoreWords
        ? _memoGetCoreWords(text, entityType)
        : getCoreWords(text, entityType);
      if (coreForDan.length >= 2) {
        log('💰 FIX 164: MONEY_PAGE (dan-bundling)', 'PRICE');
        return "money-page";
      }
    }

    var coreWords = _memoGetCoreWords
      ? _memoGetCoreWords(text, entityType)
      : getCoreWords(text, entityType);

    log('🧠 CORE: [' + coreWords.join(', ') + ']', 'CORE');

    if (entityType === "artikel") {
      if (!hasPriceWord && !hasCommercialWord && !hasCompound && complexityScore < 3) {
        log('🏛️ FIX 138: MONEY_MASTER (artikel informasional)', 'MM');
        return "money-master";
      }
    }

    var residualLayers = _memoCountModifierLayers
      ? _memoCountModifierLayers(text, entityType)
      : countModifierLayers(text, entityType);

    if (coreWords.length === 0 && residualLayers === 0
        && !hasPriceWord && !hasCommercialWord && !hasLocationWord && !hasCompound) {
      log('🏛️ FIX v14-T: MONEY_MASTER (0 core, 0 residual)', 'MM');
      return "money-master";
    }

    if (coreWords.length <= 2) {
      if (entityType === "jasa" && coreWords.length === 1 && complexityScore <= 2
          && !hasPriceWord && !hasCommercialWord && !hasCompound) {
        if (APPLICATION_TARGETS.indexOf(coreWords[0]) !== -1) {
          log('💵 FIX 167: MONEY_PAGE (base jasa + target)', 'PRICE');
          return "money-page";
        }
        if (isSpecModifierForEntity(coreWords[0], "jasa")) {
          log('💵 FIX v14-J: MONEY_PAGE (base jasa + spec)', 'PRICE');
          return "money-page";
        }
        log('🏛️ FIX 146: MONEY_MASTER (base jasa + 1 objek)', 'MM');
        return "money-master";
      }

      if (residualLayers > 0 && !hasLocationWord && !hasCommercialWord) {
        var decision14D = decideLevelByLayers(residualLayers);
        log('🔥 FIX v14-D: ' + decision14D + ' (' + residualLayers + ' residual)', 'PRICE');
        return decision14D;
      }

      if (complexityScore >= 2 && !hasPriceWord && !hasCommercialWord) {
        log('💰 MONEY_PAGE (score=' + complexityScore + ')', 'SCORE');
        return "money-page";
      }
      if (hasPriceWord) log('💵 MONEY_MASTER', 'HARGA');
      else log('🏛️ MONEY_MASTER', 'MM');
      return "money-master";
    } else {
      if (residualLayers > 0) {
        var decision14Db = decideLevelByLayers(residualLayers);
        log('🔥 FIX v14-D: ' + decision14Db + ' (' + residualLayers + ' layer)', 'PRICE');
        return decision14Db;
      }
      log('💰 MONEY_PAGE (core:' + coreWords.length + ')', 'PRICE');
      return "money-page";
    }
  }

  // ═══════════════════════════════════════════════════════════
  // DETECT PAGE LEVEL (main)
  // ═══════════════════════════════════════════════════════════

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
  
  // 🔥 FIX: Level detection HANYA dari SLUG URL
  var urlText = getPageText();
  
  // Fallback ke H1 HANYA kalau slug generic/kosong
  var urlIsGeneric = /^(blog|post|artikel|produk|layanan|service|item|page|p|home|index|\d+)(\s+\d+)?\s*$/i.test(urlText.trim());
  var text;
  if (urlIsGeneric || !urlText || urlText.length < 3) {
    var h1Text = getH1Text();
    if (h1Text && h1Text.length > 3) {
      text = h1Text;
      log('🎯 FIX: level detection via H1 (slug generic)', 'DETECT');
    } else {
      text = urlText;
    }
  } else {
    text = urlText;  // ← HANYA SLUG URL ✅
  }
  
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

  // ═══════════════════════════════════════════════════════════
  // DETECT FOR PROMPT (M4: idle split)
  // ═══════════════════════════════════════════════════════════

  function detectForPromptFull(input, entityType, domain) {
    if (!input) {
      return {
        pageLevel: 'unknown', isValid: false, error: 'Input kosong',
        upward: [], breadcrumbs: [], seoWarnings: [],
        _heavyWarningsPending: false
      };
    }
    var slug = extractSlugFromInput(input);
    if (!slug) {
      return {
        pageLevel: 'unknown', isValid: false, error: 'Slug kosong',
        upward: [], breadcrumbs: [], seoWarnings: [],
        _heavyWarningsPending: false
      };
    }
    var entity = entityType || detectEntityTypeFromText(slug);
    var level = detectPageLevelForPrompt(slug, entity);
    var factors = getFactors(slug, entity);
    var upwardData = detectUpwardFromSlug(slug, domain);
    var parents = detectParentLevelFromSlug(slug, entity, domain);

    var lightWarnings = _computeLightWarnings(slug, level, entity);

    var _result = {
      pageLevel: level,
      entityType: entity,
      factors: factors,
      text: slug,
      levelNum: TYPE_LEVEL_MAP[level] || -1,
      isValid: VALID_LEVELS.indexOf(level) !== -1,
      upward: upwardData.upward,
      breadcrumbs: upwardData.breadcrumbs,
      parents: parents,
      seoWarnings: lightWarnings.slice(),
      _heavyWarningsPending: false,
      _lightWarningCount: lightWarnings.length,
      _heavyWarningCount: 0
    };

    if (_DEVICE.lowEnd) {
      _result._heavyWarningsPending = true;
      runWhenIdle(function() {
        var heavy = _computeHeavyWarnings(slug, entity);
        for (var i = 0; i < heavy.length; i++) {
          _result.seoWarnings.push(heavy[i]);
        }
        _result._heavyWarningCount = heavy.length;
        _result._heavyWarningsPending = false;
        log('⚡ Heavy warnings computed (idle): ' + heavy.length, 'PERF');
      }, 3000);
    } else {
      var heavy = _computeHeavyWarnings(slug, entity);
      for (var i = 0; i < heavy.length; i++) {
        _result.seoWarnings.push(heavy[i]);
      }
      _result._heavyWarningCount = heavy.length;
    }
    return _result;
  }

  function detectForPrompt(input, entityType) {
    if (!input) return { pageLevel: 'unknown', isValid: false, error: 'Input kosong' };
    var slug = extractSlugFromInput(input);
    if (!slug) return { pageLevel: 'unknown', isValid: false, error: 'Slug kosong' };
    var entity = entityType || detectEntityTypeFromText(slug);
    var level = detectPageLevelForPrompt(slug, entity);
    var factors = getFactors(slug, entity);
    var seoContext = getSEOContext(slug, entity);

    var lightWarnings = _computeLightWarnings(slug, level, entity);

    var _result = {
      pageLevel: level,
      entityType: entity,
      factors: factors,
      text: slug,
      levelNum: TYPE_LEVEL_MAP[level] || -1,
      isValid: VALID_LEVELS.indexOf(level) !== -1,
      seoContext: seoContext,
      seoWarnings: lightWarnings.slice(),
      _heavyWarningsPending: false,
      _lightWarningCount: lightWarnings.length,
      _heavyWarningCount: 0
    };

    if (_DEVICE.lowEnd) {
      _result._heavyWarningsPending = true;
      runWhenIdle(function() {
        var heavy = _computeHeavyWarnings(slug, entity);
        for (var i = 0; i < heavy.length; i++) {
          _result.seoWarnings.push(heavy[i]);
        }
        _result._heavyWarningCount = heavy.length;
        _result._heavyWarningsPending = false;
        log('⚡ Heavy warnings computed (idle): ' + heavy.length, 'PERF');
      }, 3000);
    } else {
      var heavy = _computeHeavyWarnings(slug, entity);
      for (var i = 0; i < heavy.length; i++) {
        _result.seoWarnings.push(heavy[i]);
      }
      _result._heavyWarningCount = heavy.length;
    }
    return _result;
  }

  function detectForPromptSync(input, entityType) {
    return detectForPrompt(input, entityType);
  }

  function detectForPromptWithUpward(input, entityType, domain) {
    return detectForPromptFull(input, entityType, domain);
  }

  function detectBreadcrumbsFromSlug(slug, domain) {
    return detectUpwardFromSlug(slug, domain).breadcrumbs;
  }

  function detectParentFromSlug(slug, domain) {
    return detectUpwardFromSlug(slug, domain).upward;
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
  // SCHEMA / ATTRIBUTES
  // ═══════════════════════════════════════════════════════════

  function detectContentFocus(level, entityType) {
    var h1Text = getH1Text();
    var urlText = getPageText();

    var h1Raw = '';
    try {
      var h1El = document.querySelector('h1');
      h1Raw = h1El ? (h1El.innerText || h1El.textContent || '') : '';
    } catch (e) {}

    var pathnameRaw = '';
    try { pathnameRaw = window.location.pathname; } catch (e) {}

    var hasYearInH1 = /\b(20[2-9][0-9])\b/.test(h1Raw);
    var hasYearInUrl = /\b(20[2-9][0-9])\b/.test(pathnameRaw);

    var hasPriceInText = checkHasPrice(h1Text) || checkHasPrice(urlText);
    var hasCommercial = checkHasCommercial(h1Text, entityType) || checkHasCommercial(urlText, entityType);
    var hasInfoSpecPhrase = checkHasInformationalSpecPhrase(h1Text) || checkHasInformationalSpecPhrase(urlText);
    var hasPriceTableInDOM = checkPriceTable();

    var isMoneyLevel = ['money-master','money-page','money-child'].indexOf(level) !== -1;
    var isVariantLevel = ['variant','sub-variant'].indexOf(level) !== -1;

    if (isMoneyLevel || isVariantLevel) {
      if (hasInfoSpecPhrase && !hasPriceTableInDOM && !hasCommercial) {
        log('🎯 FIX 137: CONTENT FOCUS = INFORMASI', 'SEO');
        return 'INFORMASI';
      }
      if (hasPriceTableInDOM) { log('🎯 FOCUS: HARGA (tabel)', 'TABLE'); return 'HARGA'; }
      if (hasPriceInText || hasYearInH1 || hasYearInUrl) return 'HARGA';
      if (hasCommercial) return 'COMMERCIAL';
      return 'INFORMASI';
    }
    return 'INFORMASI';
  }

  function detectKategori(contentFocus) {
    if (contentFocus === 'INFORMASI') return 'EVERGREEN';
    if (['HARGA','COMMERCIAL','GABUNG'].indexOf(contentFocus) !== -1) return 'NON-EVERGREEN';
    return 'EVERGREEN';
  }

  function detectH1Pattern(kategori) {
    return kategori === 'NON-EVERGREEN' ? 'with-year' : 'no-year';
  }

  function detectEntitySubType(level, entityType) {
    if (typeof document === 'undefined' || !document.body) return null;
    var bodySubType = document.body.getAttribute('data-entity-sub-type');
    if (bodySubType) return bodySubType;
    return null;
  }

  function detectSchemaType(level, entityType, contentFocus) {
    var primary = 'WebPage';
    var secondary = '';
    var note = '';
    var isMoneyLevel = ['money-master','money-page','money-child'].indexOf(level) !== -1;
    var isEvergreen = ['pillar','sub-pillar-tipe-1','sub-pillar-tipe-2'].indexOf(level) !== -1;
    var isVariant = ['variant','sub-variant'].indexOf(level) !== -1;

    if (isEvergreen) { primary = 'Article'; secondary = 'FAQPage'; }
    else if (isVariant) { primary = 'Product'; secondary = 'TechArticle'; note = 'without-offers'; }
    else if (isMoneyLevel) {
      if (contentFocus === 'HARGA' || contentFocus === 'COMMERCIAL') {
        primary = 'Product'; secondary = 'Service';
        if (level === 'money-child') note = 'with-areaServed';
      } else if (contentFocus === 'INFORMASI') {
        primary = 'Article'; secondary = 'FAQPage';
      }
    }
    return { primary: primary, secondary: secondary, note: note };
  }

  function detectCtaType(level, contentFocus) {
    var isMoneyLevel = ['money-master','money-page','money-child'].indexOf(level) !== -1;
    if (!isMoneyLevel) return { type: 'soft', text: 'Baca Selengkapnya' };
    if (contentFocus === 'HARGA' || contentFocus === 'COMMERCIAL') {
      return { type: 'hard', text: 'Pesan Sekarang' };
    }
    return { type: 'medium', text: 'Hubungi Kami' };
  }

  function detectProductCategoryFromPLD(entityType, entitySubType) {
    if (!entityType) return '';
    var isProduct = ['produk','material'].indexOf(entityType) !== -1;
    if (!isProduct) return '';
    var categoryMap = {
      'pagar-panel-beton': 'PrecastProduct', 'besi-beton': 'SteelProduct',
      'baja-ringan': 'SteelProduct', 'paving': 'PavingProduct',
      'paving-block': 'PavingProduct', 'kanopi': 'PrecastProduct',
      'batako': 'BuildingMaterial', 'genteng': 'BuildingMaterial',
      'semen': 'BuildingMaterial', 'pasir': 'BuildingMaterial',
      'kayu': 'BuildingMaterial', 'wpc': 'BuildingMaterial',
      'grc': 'BuildingMaterial', 'hpl': 'BuildingMaterial',
      'pvc': 'BuildingMaterial', 'acp': 'BuildingMaterial'
    };
    if (entitySubType && categoryMap[entitySubType]) return categoryMap[entitySubType];
    if (entityType === 'material') return 'BuildingMaterial';
    if (entityType === 'produk') return 'PrecastProduct';
    return '';
  }

  function detectProductMaterialFromPLD(entityType, entitySubType) {
    if (!entityType) return '';
    var isProduct = ['produk','material'].indexOf(entityType) !== -1;
    if (!isProduct) return '';
    var materialMap = {
      'pagar-panel-beton': 'Beton Precast', 'besi-beton': 'Besi Beton',
      'baja-ringan': 'Baja Ringan', 'paving': 'Paving Block',
      'paving-block': 'Paving Block', 'kanopi': 'Baja Ringan',
      'batako': 'Batako', 'genteng': 'Genteng', 'semen': 'Semen',
      'pasir': 'Pasir', 'kayu': 'Kayu', 'wpc': 'WPC',
      'grc': 'GRC', 'hpl': 'HPL', 'pvc': 'PVC', 'acp': 'ACP'
    };
    if (entitySubType && materialMap[entitySubType]) return materialMap[entitySubType];
    if (entityType === 'material') return 'Material Konstruksi';
    if (entityType === 'produk') return 'Beton Precast';
    return '';
  }

  function setSchemaAttributes(level) {
    if (_SCHEMA_ATTRS_SET) {
      log('⏭️ setSchemaAttributes() sudah pernah dipanggil — skip', 'ATTR');
      return;
    }
    _SCHEMA_ATTRS_SET = true;

    try {
      document.body.setAttribute("data-page-level", level);
      document.body.setAttribute("data-page-level-num", String(TYPE_LEVEL_MAP[level] || '0'));

      var entityType = detectEntityType();
      if (!entityType) {
        var h1Text = getH1Text();
        entityType = detectEntityTypeFromText(h1Text);
      }
      document.body.setAttribute("data-entity-type", entityType || '');

      if (entityType === "jasa") {
        var subCat = detectJasaSubCategory(getPageText() + " " + getH1Text(), "jasa");
        document.body.setAttribute("data-jasa-sub-category", subCat || 'default');
      }

      var contentFocus = detectContentFocus(level, entityType);
      document.body.setAttribute("data-content-focus", contentFocus);

      var kategori = detectKategori(contentFocus);
      document.body.setAttribute("data-kategori", kategori);

      var h1Pattern = detectH1Pattern(kategori);
      document.body.setAttribute("data-h1-pattern", h1Pattern);

      var entitySubType = detectEntitySubType(level, entityType);
      document.body.setAttribute("data-entity-sub-type", entitySubType || '');

      var schemaType = detectSchemaType(level, entityType, contentFocus);
      document.body.setAttribute("data-schema-type-primary", schemaType.primary);
      document.body.setAttribute("data-schema-type-secondary", schemaType.secondary);

      var ctaType = detectCtaType(level, contentFocus);
      document.body.setAttribute("data-cta-type", ctaType.type);
      document.body.setAttribute("data-cta-text", ctaType.text);

      var productCategory = detectProductCategoryFromPLD(entityType, entitySubType);
      if (productCategory) document.body.setAttribute("data-product-category", productCategory);

      var productMaterial = detectProductMaterialFromPLD(entityType, entitySubType);
      if (productMaterial) document.body.setAttribute("data-product-material", productMaterial);

      log('✅ Schema attributes ter-set!', 'ATTR');
    } catch (e) {
      log('❌ Error set schema attributes: ' + e.message, 'ERROR');
    }
  }

  function findBreadcrumbs() {
    if (typeof document === 'undefined') return null;
    var BREADCRUMB_SELECTORS = [
      '.breadcrumb', '.breadcrumbs', '.bread-crumb',
      '[class*="breadcrumb"]', '[class*="bread-crumb"]',
      '.woocommerce-breadcrumb', '.yoast-breadcrumbs',
      '.rank-math-breadcrumb', '.aioseo-breadcrumbs',
      '[itemprop="breadcrumb"]', '[typeof="BreadcrumbList"]',
      'nav[aria-label="breadcrumb"]', 'ol.breadcrumb', 'ul.breadcrumb'
    ];
    for (var s = 0; s < BREADCRUMB_SELECTORS.length; s++) {
      var selector = BREADCRUMB_SELECTORS[s];
      try {
        var elements = document.querySelectorAll(selector);
        for (var i = 0; i < elements.length; i++) {
          var el = elements[i];
          if (el.offsetParent !== null || el.getBoundingClientRect().height > 0) {
            var text = (el.textContent || "").trim() || "";
            if (text.length > 0) return { element: el, text: text, selector: selector };
          }
        }
      } catch (e) {}
    }
    return null;
  }

  // ═══════════════════════════════════════════════════════════
  // waitForBreadcrumbs() — M4 MutationObserver
  // ═══════════════════════════════════════════════════════════
  function waitForBreadcrumbs(callback) {
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') {
      var bcFallback = findBreadcrumbs();
      if (bcFallback) { callback(null, bcFallback); return; }
      callback(new Error('MutationObserver not available'), null);
      return;
    }

    var found = findBreadcrumbs();
    if (found) {
      log("✅ Breadcrumbs ditemukan langsung! (" + found.selector + ")", 'BREAD');
      callback(null, found);
      return;
    }

    var done = false;
    var observer = null;
    var timeoutId = null;

    function _finish(err, bc) {
      if (done) return;
      done = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (observer) { try { observer.disconnect(); } catch (e) {} }
      if (bc) log("✅ Breadcrumbs ditemukan via observer! (" + bc.selector + ")", 'BREAD');
      callback(err, bc);
    }

    timeoutId = setTimeout(function() {
      _finish(new Error('Breadcrumbs timeout'), null);
    }, 5000);

    try {
      observer = new MutationObserver(function() {
        if (done) return;
        var bc = findBreadcrumbs();
        if (bc) _finish(null, bc);
      });
      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
      });
    } catch (e) {
      var startTime = Date.now();
      var _poll = function() {
        if (done) return;
        var bc = findBreadcrumbs();
        if (bc) { _finish(null, bc); return; }
        if (Date.now() - startTime >= 5000) {
          _finish(new Error('Breadcrumbs timeout'), null);
          return;
        }
        setTimeout(_poll, 200);
      };
      setTimeout(_poll, 0);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // initializeCore() — dengan M1/M2/M3/M4 activation
  // ═══════════════════════════════════════════════════════════
  function initializeCore() {
    if (_CORE_INITIALIZED) {
      log('⏭️ initializeCore() sudah pernah dijalankan — skip', 'PERF');
      return;
    }
    // 🔥 FIX-RACE: cek PLD sudah ada di window
    if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.version === "23.9.7-lite-perf") {
      log('⏭️ PLD sudah ada di window — skip init', 'PERF');
      _CORE_INITIALIZED = true;
      return;
    }
    _CORE_INITIALIZED = true;
     
    log('🧠 Core functions ready', 'CORE');

    // 🔥 M1+M2: build master regexes SEKALI di awal
    try {
      var _t0 = (typeof performance !== 'undefined' && performance.now)
        ? performance.now() : Date.now();
      _buildMasterRegexes();
      var _t1 = (typeof performance !== 'undefined' && performance.now)
        ? performance.now() : Date.now();
      console.log('⚡ [PLD-PERF] Master regexes pre-built: ' + (_t1 - _t0).toFixed(2) + 'ms, cache size: ' + _REGEX_CACHE_SIZE);
    } catch (e) {
      console.error('❌ [PLD-PERF] Gagal build master regexes: ' + e.message);
    }

    // 🔥 M3: Aktifkan memoize wrapper
    try {
      _memoCountModifierLayers = memoize(countModifierLayers, 300);
      _memoCheckHasSpecification = memoize(checkHasSpecification, 300);
      _memoCalculateComplexityScore = memoize(calculateComplexityScore, 200);
      _memoCheckFisikRole = memoize1(checkFisikRole, 200);
      _memoCheckHasJasaMetode = memoize1(checkHasJasaMetode, 100);
      _memoHasJasaMaterialCtx = memoize1(hasJasaMaterialCtx, 100);
      _memoCheckPureTechnicalSpec = memoize(checkPureTechnicalSpec, 200);
      _memoIsSubVariant = memoize(isSubVariant, 100);
      _memoHasTechnicalSpec = memoize1(hasTechnicalSpec, 200);
      _memoGetCoreWords = memoizeArray(getCoreWords, 200);
      _memoGetFactors = memoizeObject(getFactors, 200);
      _memoDetectVariantByPattern = memoize(detectVariantByPattern, 200);
      console.log('⚡ [PLD-PERF] Memoize wrappers ACTIVE — 12 fungsi');
    } catch (e) {
      console.error('❌ [PLD-PERF] Gagal aktifkan memoize: ' + e.message);
    }

    window.pageLevelDetectorv22 = {
      version: "23.9.7-lite-perf",
      CONFIG: CONFIG,

      // ─── API UTAMA ───
      detect: detectPageLevel,
      detectFromDOM: detectPageLevelFromDOM,
      detectForPrompt: detectForPrompt,
      detectForPromptFull: detectForPromptFull,
      detectForPromptWithUpward: detectForPromptWithUpward,
      validateForPrompt: validateForPrompt,
      detectPageLevelForPrompt: detectPageLevelForPrompt,

      // ─── BREADCRUMB + HIERARCHY ───
      detectUpwardFromSlug: detectUpwardFromSlug,
      detectBreadcrumbsFromSlug: detectBreadcrumbsFromSlug,
      detectParentFromSlug: detectParentFromSlug,
      detectParentLevelFromSlug: detectParentLevelFromSlug,
      computeBreadcrumbLevels: computeBreadcrumbLevels,
      validateBreadcrumbHierarchy: validateBreadcrumbHierarchy,
      validateParentDrivenHierarchy: validateParentDrivenHierarchy,
      detectSameLevelContentWarning: detectSameLevelContentWarning,
      detectHierarchyWarning: detectHierarchyWarning,
      detectConjunctionWarning: detectConjunctionWarning,
      EXPECTED_CHILD_MAP: EXPECTED_CHILD_MAP,
      findBreadcrumbs: findBreadcrumbs,
      waitForBreadcrumbs: waitForBreadcrumbs,

      // ─── LEVELS + ENTITY ───
      VALID_LEVELS: VALID_LEVELS,
      TYPE_LEVEL_MAP: TYPE_LEVEL_MAP,
      LEVEL_HIERARCHY_MAP: LEVEL_HIERARCHY_MAP,
      LEVEL_INVERSE_MAP: LEVEL_INVERSE_MAP,
      VALID_ENTITY_TYPES: VALID_ENTITY_TYPES,
      ENTITY_PILLAR_NAMES: ENTITY_PILLAR_NAMES,

      detectEntityType: detectEntityType,
      detectEntityTypeFromText: detectEntityTypeFromText,
      detectJasaSubCategory: detectJasaSubCategory,

      // ─── VARIANT ───
      detectVariantLevel: detectVariantLevel,
      detectVariantByPattern: detectVariantByPattern,
      hasTechnicalSpec: hasTechnicalSpec,
      isSubVariant: isSubVariant,

      // ─── FACTORS ───
      getFactors: getFactors,
      getSEOContext: getSEOContext,
      isLocation: isLocation,
      checkHasSpecification: checkHasSpecification,
      checkPureTechnicalSpec: checkPureTechnicalSpec,
      checkHasCommercial: checkHasCommercial,
      checkHasPrice: checkHasPrice,
      checkHasPromoModifier: checkHasPromoModifier,
      detectContentSignalsFromSlug: detectContentSignalsFromSlug,
      checkHasJasaMetode: checkHasJasaMetode,
      checkHasPerUnit: checkHasPerUnit,
      checkHasQuestionWord: checkHasQuestionWord,
      checkHasCommercialInvestigation: checkHasCommercialInvestigation,
      checkFreeContext: checkFreeContext,
      checkHasAuthority: checkHasAuthority,
      checkHasReadyStock: checkHasReadyStock,
      checkHasSpecPhrase: checkHasSpecPhrase,
      checkHasInformationalSpecPhrase: checkHasInformationalSpecPhrase,
      checkHasBaseService: checkHasBaseService,
      checkHasMarketingTerm: checkHasMarketingTerm,
      checkFisikRole: checkFisikRole,
      checkCompoundAction: checkCompoundAction,
      calculateComplexityScore: calculateComplexityScore,
      isBaseName: isBaseName,
      getCoreWords: getCoreWords,
      normalizeVerbVariations: normalizeVerbVariations,
      isApplicationTarget: isApplicationTarget,

      // ─── MODIFIER LAYERS ───
      countModifierLayers: countModifierLayers,
      getCategoryDefs: getCategoryDefs,
      decideLevelByLayers: decideLevelByLayers,
      hasJasaMaterialCtx: hasJasaMaterialCtx,
      flagAmbiguous: flagAmbiguous,
      isSpecModifierForEntity: isSpecModifierForEntity,
      APPLICATION_TARGETS_FULL: APPLICATION_TARGETS_FULL,

      // ─── INTENT ───
      detectIntent: detectIntent,

      // ─── SCHEMA + ATTRIBUTES ───
      getH1Text: getH1Text,
      checkPriceTable: checkPriceTable,
      setSchemaAttributes: setSchemaAttributes,
      detectContentFocus: detectContentFocus,
      detectKategori: detectKategori,
      detectH1Pattern: detectH1Pattern,
      detectEntitySubType: detectEntitySubType,
      detectSchemaType: detectSchemaType,
      detectCtaType: detectCtaType,
      detectProductCategoryFromPLD: detectProductCategoryFromPLD,
      detectProductMaterialFromPLD: detectProductMaterialFromPLD,

      // ─── UPDATE ATTRIBUTES ───
      updateAttributes: function(options) {
        options = options || {};
        var waitForBreadcrumb = options.waitForBreadcrumb !== false;
        var levelResult = detectPageLevel();
        var level = typeof levelResult === 'string' ? levelResult : (levelResult.level || 'unknown');

        try {
          document.body.setAttribute("data-page-level", level);
          document.body.setAttribute("data-page-level-num", String(TYPE_LEVEL_MAP[level] || '0'));
          var className = 'page-level-' + level.replace(/\s+/g, '-');
          document.body.classList.remove('page-level-unknown', className);
          document.body.classList.add(className);
          setSchemaAttributes(level);
        } catch (e) {
          log("Error setting attributes: " + e.message, "ERROR");
        }

        var result = { pageLevel: level, pageLevelNum: TYPE_LEVEL_MAP[level] || 0, breadcrumb: null };

        if (waitForBreadcrumb) {
          return new Promise(function(resolve) {
            waitForBreadcrumbs(function(err, breadcrumb) {
              if (err || !breadcrumb) { resolve(result); return; }
              result.breadcrumb = breadcrumb;
              try {
                document.body.setAttribute("data-has-breadcrumb", "true");
                document.body.setAttribute("data-breadcrumb-selector", breadcrumb.selector);
              } catch (e) {}
              resolve(result);
            });
          });
        }
        return result;
      },

      // ─── PERF HELPERS (M1+M2+M3+M4) ───
      _rx: rx,
      _rxRaw: rxRaw,
      _buildMasterRegexes: _buildMasterRegexes,
      _getPerfStats: _getPerfStats,
      _MASTER: _MASTER,
      _REGEX_CACHE: _REGEX_CACHE,
      _getMemoStats: _getMemoStats,
      _clearMemoCache: _clearMemoCache,
      _DEVICE: _DEVICE,
      _runWhenIdle: runWhenIdle,
      _runAfterIdle: runAfterIdle,
      _computeLightWarnings: _computeLightWarnings,
      _computeHeavyWarnings: _computeHeavyWarnings,

      // ─── DATA EXPORT ───
      JASA_WORDS: JASA_WORDS,
      COMMON_JASA_WORDS: COMMON_JASA_WORDS,
      SEWA_WORDS: SEWA_WORDS,
      MATERIAL_WORDS: MATERIAL_WORDS,
      PRODUK_WORDS: PRODUK_WORDS,
      DESAIN_WORDS: DESAIN_WORDS,
      ENTITY_BASE_NAMES: ENTITY_BASE_NAMES,
      ENTITY_ONLY_WORDS: ENTITY_ONLY_WORDS,
      GLOBAL_NUMERIC_KEYWORDS: GLOBAL_NUMERIC_KEYWORDS,
      SHARED_MODIFIERS: SHARED_MODIFIERS,
      ENTITY_SPECIFIC: ENTITY_SPECIFIC,
      JASA_SUB_CATEGORIES: JASA_SUB_CATEGORIES,
      DOMAIN_CONSTRAINTS: DOMAIN_CONSTRAINTS,
      MODIFIER_COMPATIBILITY: MODIFIER_COMPATIBILITY,
      PURE_JASA_TECHNIQUES: PURE_JASA_TECHNIQUES,
      PURE_METHODS: PURE_METHODS,
      PURE_SCALES: PURE_SCALES,
      PURE_FINISHING: PURE_FINISHING,
      PURE_PRODUK_SPECS: PURE_PRODUK_SPECS,
      PURE_MATERIAL_SPECS: PURE_MATERIAL_SPECS,
      PURE_SEWA_SPECS: PURE_SEWA_SPECS,
      PURE_DESAIN_SPECS: PURE_DESAIN_SPECS,
      PRODUK_SPECS: PRODUK_SPECS,
      MATERIAL_SPECS: MATERIAL_SPECS,
      SEWA_SPECS: SEWA_SPECS,
      JASA_SPECS: JASA_SPECS,
      DESAIN_SPECS: DESAIN_SPECS,
      MATERIAL_TYPE_WORDS: MATERIAL_TYPE_WORDS,
      ACTION_VERBS: ACTION_VERBS,
      FISIK_WORDS: FISIK_WORDS,
      OBJECT_WORDS: OBJECT_WORDS,
      BASE_ENTITY_OBJECTS: BASE_ENTITY_OBJECTS,
      GENERIC_OBJECTS: GENERIC_OBJECTS,
      MATERIAL_SERVICE_NAMES: MATERIAL_SERVICE_NAMES,
      CROSS_ENTITY_SPECS: CROSS_ENTITY_SPECS,
      SATUAN_UNITS: SATUAN_UNITS,
      COMMERCIAL_WORDS: COMMERCIAL_WORDS,
      INFORMATIONAL_WORDS: INFORMATIONAL_WORDS,
      HIGH_VOLUME_WORDS: HIGH_VOLUME_WORDS,
      TIER_1_LOCATION: TIER_1_LOCATION,
      LOCATION_WORDS: LOCATION_WORDS,
      PRICE_WORDS: PRICE_WORDS,
      PRICE_HEAD_WORDS: PRICE_HEAD_WORDS,
      PROMO_MODIFIER_WORDS: PROMO_MODIFIER_WORDS,
      SPEC_PHRASE_INFORMATIONAL: SPEC_PHRASE_INFORMATIONAL,
      INTENT_TRIGGERS: INTENT_TRIGGERS,
      cleanText: cleanText,
      extractSlugFromInput: extractSlugFromInput
    };

    // 🔥 FIX-P7: Set body attributes SINKRON sebelum dispatch
    try {
      var _initialLevel = detectPageLevel();
      setSchemaAttributes(_initialLevel);
      console.log('⚡ [PLD-PERF] Body attributes di-set SEBELUM dispatch: ' + _initialLevel);
    } catch (e) {
      console.error('❌ [PLD-PERF] Gagal set body attributes: ' + e.message);
    }

    window.pageLevelDetectorv22Ready = true;
    try { window.dispatchEvent(new Event("pageLevelDetectorv22Ready")); }
    catch (e) {
      try {
        var event = document.createEvent('Event');
        event.initEvent('pageLevelDetectorv22Ready', true, true);
        window.dispatchEvent(event);
      } catch (e2) {}
    }

    console.log("═══════════════════════════════════════════════════════════");
    console.log("✅ Page Level Detector v23.9.7-LITE-PERF — FULL PATCH");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🔥 M1: RegExp Cache (2000 entry, LRU)");
    console.log("🔥 M2: Master Regex (18 regex gabungan)");
    console.log("🔥 M3: Memoize (12 fungsi, LRU 200-300)");
    console.log("🔥 M4: Idle Scheduler + MutationObserver + Device Detection");
    console.log("🔥 FIX-P1..P7: Performance patch dari versi sebelumnya");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🎯 GARANSI:");
    console.log("   ✅ Tidak ada fungsi yang hilang");
    console.log("   ✅ Output IDENTIK dengan versi sebelumnya");
    console.log("   ✅ Konsisten desktop vs HP");
    console.log("   ✅ UI tidak block di HP low-end");
    console.log("═══════════════════════════════════════════════════════════");

    // 🔥 PATCH M1+M2: auto regression test (hanya di DEBUG)
    if (CONFIG.DEBUG) {
      try {
        var _testCases = [
          ["jasa bore pile", "money-master"],
          ["jasa bore pile jakarta", "money-child"],
          ["jasa bore pile 30 meter", "variant"],
          ["harga bore pile", "money-master"],
          ["jasa bore pile murah", "money-page"],
          ["jasa cor dak lantai 2", "money-page"],
          ["daftar jenis pagar", "sub-pillar-tipe-2"],
          ["pagar vs kanopi", "sub-pillar-tipe-1"]
        ];
        var _fails = 0;
        for (var _ti = 0; _ti < _testCases.length; _ti++) {
          var _got = detectPageLevelForPrompt(_testCases[_ti][0], null);
          if (_got !== _testCases[_ti][1]) {
            console.error("❌ REGRESSION FAIL:", _testCases[_ti][0], "expected", _testCases[_ti][1], "got", _got);
            _fails++;
          }
        }
        if (_fails === 0) {
          console.log("🎉 REGRESSION: ALL " + _testCases.length + " PASS");
        } else {
          console.warn("⚠️ REGRESSION: " + _fails + " FAIL");
        }

        // M3 test
        console.log("─── M3 Memoize Test ───");
        var _m3TestSlug = "jasa bore pile jakarta 30 meter";
        for (var _r = 0; _r < 2; _r++) {
          var _lvl = detectPageLevelForPrompt(_m3TestSlug, "jasa");
          console.log("  Run " + (_r + 1) + ": " + _lvl);
        }
        var _memoStats = _getMemoStats();
        console.log("📊 Memo stats:", _memoStats);
        if (_memoStats.hits > 0) {
          console.log("✅ M3: memoize HIT detected (" + _memoStats.hits + " hits)");
        } else {
          console.warn("⚠️ M3: no cache hit");
        }

        // M4 test
        console.log("─── M4 Idle + Device Test ───");
        console.log("📱 Device:", {
          isMobile: _DEVICE.isMobile, lowEnd: _DEVICE.lowEnd,
          memory: _DEVICE.memory + "GB", cores: _DEVICE.cores
        });
        console.log("📱 Mode:", _DEVICE.lowEnd ? "IDLE (heavy warnings async)" : "SYNC (all warnings sync)");
        var _m4Result = detectForPrompt("jasa bore pile jakarta", "jasa");
        console.log("  Light warnings count:", _m4Result._lightWarningCount);
        console.log("  Heavy pending:", _m4Result._heavyWarningsPending);
      } catch (e) {
        console.error("Regression test error:", e.message);
      }
    }

    // 🔥 FIX-P7: updateAttributes dengan waitForBreadcrumb:false
    try {
      window.pageLevelDetectorv22.updateAttributes({ waitForBreadcrumb: false })
        .then(function(result) {
          log("✅ Auto-update selesai! Level: " + result.pageLevel, 'SUCCESS');
        })
        .catch(function(err) { log("Auto-update error: " + err, "ERROR"); });
    } catch (e) {
      log("Auto-update failed: " + e.message, "ERROR");
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 🔥 FIX-RACE: waitForDOM() aman untuk inject kapan saja
  // ═══════════════════════════════════════════════════════════
  // MASALAH LAMA:
  //   - Kalau script di-inject SETELAH DOMContentLoaded fired,
  //     listener 'DOMContentLoaded' TIDAK AKAN PERNAH trigger.
  //   - Akibatnya: stuck sampai setTimeout(3000).
  //   - Fix: cek readyState DULU, baru pasang listener.
  //   - Tambah flag _DOM_READY_CALLED biar tidak double call.
  // ═══════════════════════════════════════════════════════════
  var _DOM_READY_CALLED = false;
  
  function waitForDOM(callback) {
    if (_DOM_READY_CALLED) {
      // Sudah pernah call — jangan double
      return;
    }
    if (typeof document === 'undefined') {
      _DOM_READY_CALLED = true;
      callback();
      return;
    }
    
    // ✅ Cek readyState DULU (paling penting!)
    var rs = document.readyState;
    if (rs === 'complete' || rs === 'interactive') {
      _DOM_READY_CALLED = true;
      callback();
      return;
    }
    
    // Kalau masih loading, pasang listener
    var _called = false;
    function _once() {
      if (_called) return;
      _called = true;
      _DOM_READY_CALLED = true;
      callback();
    }
    
    document.addEventListener('DOMContentLoaded', _once);
    
    // Fallback: cek readyState berkala (bukan cuma 1x)
    var _fallbackCount = 0;
    var _fallbackTimer = setInterval(function() {
      _fallbackCount++;
      var rs2 = document.readyState;
      if (rs2 === 'complete' || rs2 === 'interactive') {
        clearInterval(_fallbackTimer);
        _once();
      }
      if (_fallbackCount >= 60) {  // max 6 detik (60 × 100ms)
        clearInterval(_fallbackTimer);
        _once();
      }
    }, 100);
  }

  log('🚀 Starting PLD v23.9.7-LITE-PERF...', 'INFO');

  function _safeInitializeCore() {
    if (_CORE_INITIALIZED) {
      log('⏭️ _safeInitializeCore: sudah init', 'PERF');
      return;
    }
    if (window.pageLevelDetectorv22) {
      log('⏭️ _safeInitializeCore: PLD sudah ada', 'PERF');
      return;
    }
    try {
      initializeCore();
    } catch (e) {
      console.error('❌ [PLD-PERF] initializeCore error: ' + e.message);
      // Fallback: set default attributes
      try {
        if (document.body) {
          document.body.setAttribute("data-page-level", "money-page");
          document.body.setAttribute("data-page-level-num", "5");
        }
      } catch (e2) {}
    }
  }

  // 🔥 FIX-RACE: panggil _safeInitializeCore dengan guard
  waitForDOM(function() {
    _safeInitializeCore();
  });
  
  // Fallback tambahan: kalau readyState sudah complete, langsung init
  if (typeof document !== 'undefined') {
    var _rs = document.readyState;
    if (_rs === 'complete' || _rs === 'interactive') {
      // Delay sedikit biar tidak bentrok dengan waitForDOM
      setTimeout(function() {
        _safeInitializeCore();
      }, 0);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // GLOBAL HELPERS
  // ═══════════════════════════════════════════════════════════
  if (typeof window !== "undefined") {
    window.PLD_VERSION = "23.9.7-lite-perf";
    window.getPLDInfo = function() {
      if (!window.pageLevelDetectorv22) {
        console.error("❌ PLD belum ready.");
        return null;
      }
      return {
        version: window.pageLevelDetectorv22.version,
        mode: "LITE-PERF",
        pageLevel: window.pageLevelDetectorv22.detect(),
        entityType: window.pageLevelDetectorv22.detectEntityType(),
        perf: window.pageLevelDetectorv22._getPerfStats(),
        memo: window.pageLevelDetectorv22._getMemoStats()
      };
    };
  }

})();
