/* ============================================================
🧠 Page Level Detector v23.9.10 — SEO DIMENSION
============================================================
BASE: v23.9.7-LITE-PERF-B2N
PATCH: SEO DIMENSION (Compound-aware + Location-parallel)
       + ENTITY-AWARE SCHEMA TYPE (v23.9.9)
       + FIX-TERTIARY (Patch silent v23.9.10, versi TIDAK diubah)

🩹 FIX-TERTIARY (PATCH DIAM — VERSI TETAP 23.9.10):
   ✅ detectSchemaType() sekarang return `tertiary` field
   ✅ GABUNG → tertiary = 'Article' (Service & Product money)
   ✅ setSchemaAttributes() set `data-schema-type-tertiary`
   ✅ Konsumen (Article v8.7) bisa detect GABUNG secara eksplisit
   ✅ Backward compatible — konsumen lama tidak terpengaruh
   ✅ Version tidak diubah agar tidak memicu reload cache

🎯 ALASAN PATCH DIAM:
   - PLD v23.9.10 tidak beri sinyal "butuh Article" untuk GABUNG
   - Article v8.6g jadi tidak bisa generate Article di MP GABUNG
   - Schema stack jadi 2 (Service/Product + FAQPage) — padahal Prompt B
     Section 39 wajibkan 3 (Product + Article + FAQPage)
   - Fix minimal, backward compatible, tanpa breaking change

🔥 PRINSIP:
   ✅ JASA  : Broad-to-narrow (verb = base, target = spec)
   ✅ PRODUK: Frasa utuh (noun-based) + Compound-aware
   ✅ MATERIAL: Frasa utuh (noun-based) + Compound-aware
   ✅ DESAIN: Frasa utuh (khusus) + Compound-aware
   ✅ SEWA  : PATCH SEWA v3
   
🎯 PERUBAHAN v23.9.8:
   ✅ COMPOUND_LIBRARY: 1 konsep = 1 layer
   ✅ countSemanticUnits(): bukan word count
   ✅ Location override: MC selalu, bukan sub-variant
   ✅ PRODUK/MATERIAL/DESAIN: compound-aware
   ✅ EXPECTED_CHILD_MAP: variant boleh child MC
   ✅ Validator update: tidak warning variant+MC

🎯 PERUBAHAN v23.9.9 (ENTITY-AWARE):
   ✅ detectSchemaType() — entityType DIPAKAI (sebelumnya bug: di-ignore)
   ✅ JASA/SEWA → primary Service (semua level)
   ✅ DESAIN → primary Service + secondary CreativeWork
   ✅ PRODUK/MATERIAL pillar → primary Article (katalog/daftar)
   ✅ PRODUK/MATERIAL money HARGA → primary Product + secondary Service
   ✅ PRODUK/MATERIAL variant → primary Product + secondary TechArticle
   ✅ ARTIKEL → primary Article (semua level)
   ✅ setSchemaAttributes() — set data-schema-type-note
   ✅ detectCtaType() — entity-aware (Service→Konsultasi, Product→Pesan)
   ✅ SEO 2026 compliant: schema match entity + content, bukan level saja

🎯 GARANSI:
   ✅ Konsisten 100% semua entity
   ✅ SEO 2026-compliant (pillar-cluster + dimension)
   ✅ Scalable & maintainable
============================================================ */
(function () {
  "use strict";

  if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.version === "23.9.10-seo-dimension") {
    console.warn("⚠️ [PLD v23.9.10-SEO-DIMENSION] Already loaded!");
    return;
  }

  var _CORE_INITIALIZED = false;
  var _SCHEMA_ATTRS_SET = false;
  var _PLD_LEVEL_CACHE = {};
  var _PLD_LEVEL_CACHE_KEYS = [];
  var _PLD_LEVEL_CACHE_MAX = 500;

  var _PLD_SUBCAT_CACHE = {};
  var _PLD_SUBCAT_CACHE_KEYS = [];
  var _PLD_SUBCAT_CACHE_MAX = 200;

  function _cacheLevelSet(key, value) {
    if (_PLD_LEVEL_CACHE[key] === undefined) {
      _PLD_LEVEL_CACHE_KEYS.push(key);
      if (_PLD_LEVEL_CACHE_KEYS.length > _PLD_LEVEL_CACHE_MAX) {
        delete _PLD_LEVEL_CACHE[_PLD_LEVEL_CACHE_KEYS.shift()];
      }
    }
    _PLD_LEVEL_CACHE[key] = value;
  }

  function _cacheSubCatSet(key, value) {
    if (_PLD_SUBCAT_CACHE[key] === undefined) {
      _PLD_SUBCAT_CACHE_KEYS.push(key);
      if (_PLD_SUBCAT_CACHE_KEYS.length > _PLD_SUBCAT_CACHE_MAX) {
        delete _PLD_SUBCAT_CACHE[_PLD_SUBCAT_CACHE_KEYS.shift()];
      }
    }
    _PLD_SUBCAT_CACHE[key] = value;
  }

  function _clearLevelCache() {
    _PLD_LEVEL_CACHE = {};
    _PLD_LEVEL_CACHE_KEYS = [];
    log('🧹 Level cache cleared', 'PERF');
  }

  function _clearSubCatCache() {
    _PLD_SUBCAT_CACHE = {};
    _PLD_SUBCAT_CACHE_KEYS = [];
    log('🧹 SubCat cache cleared', 'PERF');
  }

  var CONFIG = {
    DEBUG: false,
    LOW_END_MEMORY_THRESHOLD: 2,
    LOW_END_CORES_THRESHOLD: 2,
    HEAVY_WARNING_IDLE_TIMEOUT: 3000
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
   console.log((icons[type] || "📘") + " [PLD v23.9.10-SEO-DIMENSION] " + message);  }

  log('📦 PLD v23.9.10-SEO-DIMENSION — Compound-Aware + Location-Parallel + Entity-Aware', 'EXTERNAL');
  // ═══════════════════════════════════════════════════════════
  // KONSTANTA
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

  // ═══════════════════════════════════════════════════════════
  // 🔥 PATCH 12a: EXPECTED_CHILD_MAP (SEO DIMENSION)
  // 
  // PERUBAHAN:
  // - VARIANT sekarang bisa punya child MC (lokasi paralel)
  // - Karena location override, VAR + lokasi → MC, bukan SV
  // ═══════════════════════════════════════════════════════════
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
    // 🔥 PATCH-VALIDATOR-v2: VARIANT bisa punya MC (lokasi paralel)
    "variant":           { expected: "sub-variant",       num: 8,
                           alternates: ["money-child"] },
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
    jasa: ["jasa","kontraktor","tukang","borongan","renovasi","bangun","perbaikan","perawatan","instalasi","pemasangan","pembongkaran","pembersihan","coring","cutting","grouting","sandblasting","pengeboran","pemancangan","pengecoran","pengelasan","pondasi","bored pile","bor pile","strauss","pancang","waterproofing","epoxy","coating","poles","service","servis","layanan","relief","profil beton","interior","eksterior","konsultan","pembuatan","pasang","finishing","uji tanah","perkuatan tanah","pembatas pengaman","buang puing","saluran drainase","jalan perkerasan","pematangan lahan","lapangan olahraga"],
    desain: ["desain","interior","eksterior","arsitektur","konsep","rencana","gambar kerja","denah","render","visualisasi","3d design","shop drawing"],
    sewa: ["sewa","rental","rent"],
    material: ["material","bahan","semen","mortar","pasir","batu","besi","baja","kayu","beton","keramik","granit","marmer","gypsum","plafon","paving","bata","batako","hebel","genteng","asbes","atap","baja ringan","galvalum","readymix","ready mix","pipa","cat","kabel","paku","baut","kaca","aluminium","tembaga","kuningan","perunggu","titanium","bambu","rotan","spandek","alderon","bekisting","bondex","waterproofing","perancah","grc","hpl","acp","vinyl","wpc","upvc"],
    produk: ["produk","jual","beli","supplier","distributor","toko","pintu","jendela","pagar","kanopi","railing","gerbang","wastafel","closet","kitchen set","wardrobe","precast","pracetak"],
    artikel: ["artikel","blog","tips","panduan","cara","tutorial","review","ulasan","berita","informasi","update"]
  };

  var ENTITY_PRIORITY = ["jasa", "sewa", "desain", "produk", "material", "artikel"];

  var JASA_WORDS = ['jasa','kontraktor','tukang','borongan','renovasi','pasang','bangun','perbaikan','instalasi','proyek','cor','gali','urug','angkut','service','servis','desain','interior','eksterior','arsitektur','coring','cutting','drilling','pengeboran','pemancangan','pemasangan','bongkar','potong','las','sambung','grinding','welding','bending','forming','pondasi','tiang','pancang','bore','pile','strauss','konstruksi','bangunan','rumah','gedung','ruko','gudang','pabrik','jalan','jembatan','infrastruktur','relief','profil','konsultan','finishing','uji','perkuatan','pembatas','pengaman','puing','drainase','perkerasan'];

  var COMMON_JASA_WORDS = ['tukang','kontraktor','mandor','vendor','supplier','layanan','penyedia','pengrajin','spesialis','biro','firma','perusahaan','penjual jasa','pasang','pemasangan','bangun','renovasi','perbaikan','instalasi','service','servis','konstruksi','pembangunan','cor','gali','urug','angkut','pemotongan','penggalian','pengurugan','pengangkutan','pengeboran','pengelasan','pengecoran','pengecatan','pengukuran','pemasangan','pembongkaran','pembuatan','pengupasan','pemadatan','pengerukan','pemancangan','pengeringan','pembersihan','perataan','pembentukan','persiapan','pemindahan','pengangkatan','pengolahan','pengerjaan','penyelesaian','pemeliharaan','memotong','menggali','mengurug','mengangkat','mengebor','mengelas','mengecor','mengecat','mengukur','memasang','membongkar','membuat','mengupas','memadatkan','mengeruk','memancang'];

  var SEWA_WORDS = ['sewa','rental','rent','alat','mesin','heavy equipment','excavator','bulldozer','crane','backhoe','dozer','vibro','roller','compactor','diesel','hydraulic','mini','besar','kecil','sedang','medium','extra','scaffolding','steger','tenda','terpal','portacamp','toilet portable','tower lamp'];

  var MATERIAL_WORDS = ['material','bahan','semen','mortar','pasir','batu','batu split','kerikil','besi','baja','kayu','beton','keramik','granit','marmer','gypsum','plafon','paving','bata','batako','hebel','genteng','asbes','atap','baja ringan','galvalum','readymix','ready mix','paku','baut','mur','sekrup','kawat','wiremesh','cat','vernis','politur','plamir','lem','pipa','kabel','fitting','kran','kaca','aluminium','tembaga','kuningan','perunggu','titanium','bambu','rotan','spandek','alderon','bekisting','bondex','waterproofing','perancah','grc','hpl','acp','vinyl','wpc','upvc'];

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

  // ═══════════════════════════════════════════════════════════
  // 🔥 ENTITY_BASE_NAMES — REVISI BROAD-TO-NARROW
  // ═══════════════════════════════════════════════════════════
    var ENTITY_BASE_NAMES = {
    produk: [
      // === Base konsep ===
      "pintu","jendela","kusen","pagar","kanopi","wallpaper","kitchen set","wardrobe","sofa","meja","kursi","lemari","nakas","tempat tidur","bed frame","gazebo","kolam","taman","lampu","cctv","saklar listrik","stop kontak","panel listrik","railing","tangga","gerbang","wastafel","closet","tandon air","tangki air","water heater","gorden","blind","kasa nyamuk","tralis","rak dinding","rak tv","rak buku","gantungan baju","kunci pintu","handle pintu","engsel pintu","gagang pintu",
      // === Material-spec populer (konsep entitas) ===
      "pintu besi","pintu kayu","pintu aluminium","pintu kaca",
      "jendela aluminium","jendela kayu","jendela kaca","jendela upvc","jendela pvc","jendela besi",
      // === Tipe mekanik nama produk ===
      "pintu rolling door","pintu folding gate","pintu harmonika","pintu kupu-kupu","pintu revolving",
      "jendela casement","jendela swing","jendela sliding","jendela awning","jendela jungkit","jendela sorong","jendela nako","jendela bouven","jendela roster",
      // === Kanopi material ===
      "kanopi baja ringan","kanopi alderon","kanopi spandek","kanopi solarflat","kanopi kaca","kanopi polycarbonate","kanopi besi","kanopi galvanis","kanopi hollow","kanopi membrane",
      // === Pagar material ===
            "pagar panel","pagar beton","pagar brc","pagar besi","pagar kayu","pagar aluminium","pagar stainless","pagar hollow","pagar tembok","pagar besi tempa","pagar besi hollow","pagar besi ulir","pagar wpc","pagar pvc","pagar grc","pagar kawat","pagar harmonika","pagar elektrik",
      // === Railing ===
      "railing tangga","railing balkon","railing besi","railing stainless","railing aluminium","railing kaca","railing hollow","railing besi tempa",
      // === Tangga ===
      "tangga besi","tangga kayu","tangga beton","tangga aluminium","tangga putar","tangga monyet",
      // === Kitchen & wardrobe ===
      "walk in closet","lemari pakaian","lemari baju",
      // === Kolam ===
      "kolam renang","kolam ikan","kolam beton","kolam fiber",
      // === Taman ===
      "taman kering","taman vertikal","taman tropis","taman jepang","taman bali",
      // === Precast ===
      "precast","pracetak","precast beton","pracetak beton","beton precast","beton pracetak","precast concrete","precast panel",
      "precast pile","pracetak pile","precast slab","pracetak slab",
      "precast kanstin","pracetak kanstin","precast paving","pracetak paving",
      "precast u ditch","pracetak u ditch","precast box culvert","pracetak box culvert",
      "precast half slab","pracetak half slab","precast kolom","pracetak kolom",
      "precast balok","pracetak balok","precast tiang","pracetak tiang",
      // === U ditch, box culvert, dll ===
      "u ditch","u ditch cover","tutup u ditch","box culvert","buis beton","gorong gorong","sumuran","sumur resapan","kanstin beton","kanstin","curb stone","grass block",
      // === Paving ===
      "paving block","paving block beton","paving block hexagonal","paving block persegi","paving block warna",
      // === Rooster ===
      "rooster beton","roster beton","roster beton minimalis",
      // === Tiang pancang ===
      "spun pile","mini pile","micropile","sheet pile","tiang pancang","half slab","sloof beton","kolom praktis",
      // === Wallpaper ===
      "wallpaper dinding","wallpaper motif","wallpaper vinyl","wallpaper 3d",
      // === Wall panel ===
      "wall panel","wallpanel","wall moulding","wall-moulding","wainscoting"
    ],

    material: [
      // === Base konsep ===
      "semen","pasir","batu","besi","baja","kayu","beton","pipa","kabel","fitting","kaca","valve","kran","cat","vernis","politur","plamir","lem","waterproofing","keramik","granit","marmer","gypsum","bata","batako","hebel","genteng","asbes","galvalum","aluminium","kerikil","paku","baut","sekrup","mur","kawat","wiremesh","tembaga","kuningan","perunggu","titanium","bambu","rotan","spandek","alderon","ready mix","readymix","atap","plafon","paving",
      // === Besi (konsep & standar) ===
      "besi beton","besi hollow","besi kanal","besi unp","besi cnp","besi wf","besi hbeam","besi iwf","besi ulir","besi polos","besi cor","besi tempa","besi putih","besi galvanis","besi tuang","besi baja","besi stainless","besi tembaga","besi kuningan","besi as","besi plat","besi strip","besi siku","besi nako","besi begel","besi ring","besi spiral","besi wiremesh",
      // === Baja profil standar ===
      "baja ringan","baja konvensional","baja wf","baja hbeam","baja iwf","baja gunung garuda","baja krakatau","baja import","baja lokal","baja hitam","baja putih","baja galvanis","baja stainless","baja tulangan","baja profil","baja plat","baja strip","baja siku","baja canal","baja unp","baja cnp","baja hollow","baja pipe","baja sch","baja seamless","baja welded",
      // === Baja ringan komponen ===
      "baja ringan gording","baja ringan reng","baja ringan usuk","baja ringan kaso",
      // === Batu jenis ===
      "batu split","batu kali","batu belah","batu gunung","batu alam","batu apung","batu andesit","batu candi","batu palimanan","batu paras","batu koral","batu kerikil","batu pecah","batu screening","batu sikat","batu templek","batu bronjong","batu bata",
      // === Pasir jenis ===
      "pasir beton","pasir pasang","pasir urug","pasir halus","pasir kasar","pasir putih","pasir hitam","pasir ayak","pasir silika","pasir sungai","pasir gunung",
      // === Kayu jenis ===
      "kayu jati","kayu meranti","kayu mahoni","kayu sengon","kayu pinus","kayu randu","kayu kamper","kayu kruing","kayu merbau","kayu sonokeling","kayu trembesi","kayu glugu","kayu bengkirai","kayu ulin","kayu lapis","kayu balok","kayu papan","kayu reng","kayu usuk","kayu kaso","kayu albasia","kayu balsa","kayu damar","kayu keras","kayu lunak","kayu olahan","kayu solid","kayu jati belanda",
      // === Plywood family (base baru) ===
      "plywood","multiplek","blockboard","mdf","hdf","particle board",
      // === Bata jenis ===
      "bata ringan","bata merah","bata putih","bata tempel","bata ekspos","bata hebel","bata interlock","bata beton","bata jumbo","bata standar","bata press","bata oven","hebel aac","hebel putih","hebel grade a","hebel grade b","hebel interlock","hebel jumbo",
      // === Semen jenis ===
      "semen portland","semen putih","semen abu","semen warna","semen instan","semen mortar","semen grouting","semen api","semen cepat","semen tahan api","semen portland pozzolan","semen portland composite","semen tiga roda","semen gresik","semen holcim","semen scg","semen padang","semen merah putih","semen cibinong","semen baturaja","semen bosowa","semen tonasa",
      // === Mortar ===
      "mortar","mortar struktural","mortar instan","mortar utama","mortar grouting","mortar non shrink","mortar fiber","mortar fiber reinforced","mortar thin bed","mortar thick bed","mortar refraktori","mortar tahan api","mortar tahan asam",
      // === Cat ===
      "cat tembok","cat kayu","cat besi","cat dinding","cat epoxy","cat anti bocor","cat anti jamur","cat anti karat","cat waterproof","cat polyurethane",
      // === Pipa ===
      "pipa pvc","pipa galvanis","pipa besi","pipa tembaga","pipa hdpe","pipa pp-r","pipa ppr","pipa conduit","pipa beton","pipa paralon","pipa pralon","pipa sch 40","pipa sch 80","pipa seamless",
      // === Kabel ===
      "kabel listrik","kabel tanah","kabel udara","kabel fiber","kabel coaxial","kabel data","kabel nyy","kabel nym","kabel nya","kabel nyaf",
      // === Keramik ===
      "keramik lantai","keramik dinding","keramik kamar mandi","keramik dapur","keramik teras","keramik motif","keramik polos","keramik granit","keramik porselen","keramik mosaic","keramik mozaik",
      // === Granit/marmer ===
      "granit tile","marmer travertine",
      // === Genteng ===
      "genteng",
      // === Atap ===
      "atap spandek","atap metal","atap genteng",
      // === Gypsum ===
      "gypsum board","gypsum jayaboard","gypsum knauf",
      // === Plafon ===
      "plafon gypsum","plafon pvc","plafon grc",
      // === Aluminium ===
      "aluminium foil","aluminium composite","aluminium acp",
      // === Kaca ===
      "kaca tempered","kaca film","kaca patri","kaca laminated",
      // === Beton ===
      "beton ready mix","beton cor","beton instan",
      // === Wiremesh ===
      "wiremesh",
      // === Paku/sekrup/baut/kawat ===
      "paku","sekrup","baut","kawat","kawat bronjong","kawat harmonika","kawat duri",
      // === Lem ===
      "lem","lem epoxy","lem silikon","lem sealant",
      // === Waterproofing ===
      "waterproofing membran","waterproofing coating",
      // === Bekisting ===
      "bekisting","kayu bekisting","papan bekisting",
      // === Lain ===
      "perancah","scaffolding pipe","main frame","cross brace",
      "bondex","besi tulangan","tulangan beton",
      "baja tulangan ulir","baja tulangan polos",
      "besi kanal c","besi kanal u",
      "besi plat strip","besi plat hitam","besi plat putih",
      "besi siku lubang","besi siku polos",
      "besi tulangan ulir","besi tulangan polos",
      "perekat beton","perekat keramik"
    ],

    jasa: [
      // === VERB UTAMA (MM) ===
      "pengeboran","bor","pengecoran","cor","pemasangan","pasang",
      "pembongkaran","bongkar","penggalian","gali","pengurugan","urug",
      "pengecatan","cat","pengelasan","las","welding",
      "drilling","boring","coring","cutting","pemotongan","potong",
      "renovasi","perbaikan","perawatan","instalasi","service","servis",
      "pembangunan","bangun","borongan","pembuatan",
      "grinding","poles","coating","epoxy","waterproofing","sandblasting",
      "pemadatan","pengangkutan","pembersihan","pematangan",
      "pemancangan","pancang","grouting","finishing",
      // === Tukang-based ===
      "tukang sumur bor","tukang bor sumur",
      // === FRASA TEKNIK UTUH ===
      "bore pile","bor pile","bored pile","boring pile",
      "mini pile","spun pile","micropile","sheet pile",
      "strauss pile","tiang pancang",
      "bor strauss","bor pancang",
      "jet grouting","stabilisasi tanah","soil improvement",
      "uji tanah","soil test","sondir test","sondir","cross hole","bore pile test",
      "cut and fill","pembersihan lahan","land clearing",
      "lapangan olahraga","struktur khusus","struktur konstruksi",
      "pembatas pengaman","saluran drainase","jalan perkerasan",
      "pematangan lahan","pekerjaan galian tanah","konstruksi",
      // === NOUN-BASED ===
      "pondasi","perkuatan tanah",
       "cakar ayam", // <--- TAMBAHKAN BARIS INI
      // === KONSULTAN ===
      "konsultan","konsultan konstruksi","konsultan bangunan",
      "konsultan struktur","konsultan sipil","konsultan arsitektur",
      "konsultan mep","konsultan pengawas","konsultan proyek",
      // === KATEGORI ===
      "interior","eksterior","alat konstruksi"
    ],

    sewa: [
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
      "bekisting","screed","mesin screed","trowel","mesin trowel",
      "stamper","mesin stamper",
      "alat bor","mesin bor",
      "alat ringan","alat pendukung","alat survey","alat cleaning",
      "akses keamanan","pencahayaan proyek","pencahayaan utilitas",
      "panel listrik","box panel listrik","panel distribusi",
      "kabel listrik proyek","trafo proyek","stabilizer proyek",
      "inverter proyek","ups proyek","mcb box","kwh meter",
      "kabel power proyek","kabel extension proyek",
      "stop kontak proyek","saklar proyek","fitting lampu proyek",
      "tangki air","selang proyek","selang air","pipa proyek",
      "mesin polisher","polisher","concrete cutter","mesin concrete cutter",
      "mesin molen","mesin compressor","cutting beton","mesin cutting beton",
      "mesin rumput","mesin potong rumput",
      "pompa dewatering","pompa lumpur","pompa sludge",
      "tangga proyek","tangga aluminium proyek","tangga lipat proyek",
      "barrier proyek","traffic barrier","road barrier",
      "pagar proyek","pagar sementara","pagar pengaman proyek",
      "gerbang proyek","gerbang sementara",
      "pos keamanan","pos jaga","pos security","pos keamanan proyek",
      "tandon air","bak air","bak air proyek","tangki air proyek",
      "safety barrier","mobile scaffold","scaffold mobile",
      "traffic cone","traffic light","rambu proyek","rambu keselamatan",
      "jaring pengaman","safety net","jaring proyek",
      "selang pompa","selang lumpur","selang industrial","selang industri",
      "selang hisap","selang buang","selang suction","selang discharge",
      "selang hydraulic","selang hidrolik","selang air proyek",
      "waterpass","waterpass otomatis","waterpass digital",
      "theodolite","teodolit","theodolite digital",
      "total station","total station digital",
      "laser level","laser distance","laser meter",
      "auto level","automatic level",
      "gps survey","gps geodetik","gnss",
      "kompas survey","meteran laser","meteran digital",
      "lampu proyek","lampu tembak","lampu sorot proyek",
      "lampu halogen","lampu led proyek","lampu kerja",
      "pompa sedot lumpur","pompa isap lumpur","pompa hisap lumpur",
      "beko","bego","beko excavator","bego excavator",
      "trencher","trencher machine","mesin trencher",
      "wales stom",
      "self loader","self loading","self loading truck","self loader truck",
      "concrete paver","concrete paver machine","mesin concrete paver",
      "pile driver","piledriver","pile driving","mesin pile driver",
      "diesel hammer","drop hammer","hydraulic hammer","vibro hammer",
      "hidrolik hammer","hammer pile","pile hammer",
      "alat pancang","mesin pancang","alat pemancang","mesin pemancang",
      "alat pancang hidrolik","alat pancang diesel","alat pancang drop",
      "alat pancang hspd","alat pancang diesel hammer","alat pancang drop hammer",
      "alat pancang mini","alat pancang besar","alat pancang mini pile",
      "alat pancang sheet pile","alat pancang spun pile",
      "mini excavator","mini crane","mini loader","mini dump truck",
      "skid steer","skid loader","bobcat","backhoe mini",
      "road roller","tire roller","baby vibrator","plate compactor",
      "rammer","jumping jack","pneumatic breaker","electric breaker",
      "core drill","diamond drill","wall saw","wire saw",
      "bar cutter","bar bender","mesin tekuk besi","mesin potong besi",
      "truck mixer","mixer truck","transit mixer",
      "trailer","lowbed","low bed","flatbed","flat bed",
      "backhoe loader","vibro roller","baby roller","compactor",
      "tronton","fuso","engkel","pickup",
      "reach truck","hand pallet",
      "molen cor","pompa concrete",
      "vibrator listrik","vibrator diesel",
      "breaker","demolition hammer",
      "stone crusher","crusher",
      "air compressor",
      "lampu tower",
      "pompa air banjir","pompa banjir air","pompa air untuk banjir"
    ],

    desain: [
      "desain interior","desain eksterior","desain rumah",
      "desain arsitektur","desain 3d","desain 2d","desain denah",
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
      "desain gedung",
      "desain taman",
      "desain ruang",
      "desain kamar",
      "desain kolam",
      "desain teras","desain balkon","desain carport",
      "desain fasad","desain kolam renang",
      "desain gazebo","desain walk in closet","desain kamar anak",
      "desain pabrik",
      "desain animasi","desain walkthrough","desain virtual tour",
      "desain vr","desain ar","desain render",
      "render 3d","render interior","render eksterior",
      "visualisasi 3d","visualisasi interior",
      "gambar arsitektur","gambar kerja","gambar teknik",
      "gambar denah","gambar tampak","gambar potongan",
      "gambar detail","gambar struktur","gambar mep",
      "shop drawing","as built drawing",
      "desain pondasi","desain sloof","desain kolom",
      "desain balok","desain plat","desain tangga",
      "perhitungan struktur","analisa struktur",
      "desain mep","desain mekanikal","desain elektrikal",
      "desain plumbing","desain listrik","desain air",
      "desain tata udara","desain ac","desain ventilasi",
      "desain pemadam kebakaran","desain fire fighting",
      "desain pagar",
      "desain lemari","desain meja","desain kursi",
      "desain backdrop tv","desain plafon","desain lantai",
      "desain wallpaper","desain lampu","desain furniture"
    ]
  };

  // ═══════════════════════════════════════════════════════════════════
  // 🆕 PATCH 1: COMPOUND_NOUNS_CONSTRUCTION — Phase 1 (konstruksi & pondasi)
  // FIX: "cakar ayam", "tiang pancang" dll adalah 1 konsep, bukan 2 modifier
  // SCOPE: dipakai oleh normalizeCompoundTerms() untuk entity "jasa" saja
  // ═══════════════════════════════════════════════════════════════════
  var COMPOUND_NOUNS_CONSTRUCTION = [
    // ─── Pondasi ───
    "cakar ayam", "pondasi cakar ayam",
    "tiang pancang", "pondasi tiang pancang",
    "pondasi tapak", "pondasi telapak",
    "pondasi sumuran", "sumuran",
    "pondasi strauss", "strauss pile",
    "pondasi bore pile", "bore pile", "bored pile",
    "pondasi setempat", "pondasi langsung",
    "pondasi dalam", "pondasi dangkal",
    "pondasi menerus", "pondasi rakit",
    "pondasi sarang laba-laba",
    "pondasi batu kali", "pondasi batu belah",
    "pondasi mini pile", "mini pile",
    "pondasi tiang bor", "tiang bor",

    // ─── Bor & drilling ───
    "bor sumur", "sumur bor", "bor air", "bor tanah",
    "bor horizontal", "horizontal drilling",
    "bor vertikal", "vertical drilling",
    "bor rotary", "rotary drilling",
    "bor hidrolik", "hidrolik drilling",
    "bor manual", "manual drilling",
    "bor auger", "auger drilling",
    "bor kering", "dry drilling",
    "bor basah", "wet drilling",

    // ─── Pekerjaan tanah ───
    "cut and fill", "cut fill", "galian dan timbunan",
    "pemadatan tanah", "soil compaction",
    "pembersihan lahan", "land clearing",
    "leveling tanah", "land leveling",
    "uji kepadatan tanah", "soil density test",
    "uji sondir", "sondir test",
    "uji spt", "standard penetration test",

    // ─── Material konstruksi ───
    "besi beton", "besi tulangan", "besi ulir", "besi polos",
    "besi hollow", "besi wiremesh",
    "baja ringan", "baja struktural",
    "beton readymix", "beton precast",
    "beton cor", "beton k-300", "beton k-250", "beton k-225",
    "bata ringan", "bata merah", "batako",
    "kayu jati", "kayu pinus", "kayu keras",
    "pipa pvc", "pipa hdpe", "pipa galvanis",

    // ─── Struktur & bangunan ───
    "bangunan rumah", "rumah tinggal",
    "gedung bertingkat", "gedung tinggi",
    "rumah susun", "rumah toko", "ruko", "rukan",
    "rumah kos", "rumah kontrakan",

    // ─── MEP & utilitas ───
    "instalasi pipa", "instalasi kabel", "instalasi listrik",
    "instalasi plumbing", "instalasi hvac",
    "jalur kabel", "jalur pipa",
    "saluran air", "saluran drainase",
    "sistem plumbing", "sistem hvac",

    // ─── Jalan & aspal ───
    "jalan aspal", "jalan beton", "jalan hotmix",
    "jalan tol", "jalan nasional", "jalan provinsi",
    "jalan perumahan", "jalan lingkungan",
    "aspal hotmix", "aspal cold mix",

    // ─── Coring & special ───
    "coring beton", "coring dinding", "coring lantai",
    "coring aspal", "coring manual", "coring hidrolik",
    "waterproofing beton", "injeksi beton",
    "grouting semen", "grouting epoxy"
  ];

  // ═══════════════════════════════════════════════════════════════════
  // 🆕 PATCH 1: Helper — merge compound nouns dari token array
  // (dipakai eksplisit kalau butuh dari luar normalizeCompoundTerms)
  // ═══════════════════════════════════════════════════════════════════
  function mergeCompoundNouns(tokens, compoundList) {
    if (!tokens || !Array.isArray(tokens)) return tokens || [];
    if (!compoundList || !Array.isArray(compoundList)) return tokens;

    var result = [];
    var i = 0;

    while (i < tokens.length) {
      var merged = false;

      for (var len = Math.min(3, tokens.length - i); len >= 2; len--) {
        var phrase = tokens.slice(i, i + len).join(" ").toLowerCase();

        if (compoundList.indexOf(phrase) !== -1) {
          result.push(phrase);
          i += len;
          merged = true;
          break;
        }
      }

      if (!merged) {
        result.push(tokens[i]);
        i++;
      }
    }

    return result;
  }

  // Sort base names DESC by word count
  (function() {
    for (var ent in ENTITY_BASE_NAMES) {
      if (!ENTITY_BASE_NAMES.hasOwnProperty(ent)) continue;
      ENTITY_BASE_NAMES[ent].sort(function(a, b) {
        return b.split(' ').length - a.split(' ').length;
      });
    }
  })();

  // ═══════════════════════════════════════════════════════════
  // 🔥 PATCH-COMPOUND-v1: COMPOUND TERM LIBRARY (EXPANDED)
  // 
  // PRINSIP: 1 KONSEP = 1 LAYER (bukan 1 kata = 1 layer)
  // Contoh: "air tanah" = 1 konsep (groundwater), bukan 2
  // ═══════════════════════════════════════════════════════════
    var COMPOUND_LIBRARY = {
    jasa: [
      // Base compounds
      "bore pile", "bored pile", "bor pile", "boring pile",
      "sumur bor", "bor sumur", "air tanah",
      "jet pump", "jet grouting", "soil test", "sondir test",
      "cut and fill", "land clearing",
      "mini pile", "spun pile", "micropile", "sheet pile",
      "tiang pancang", "strauss pile", "pancang bor",
      // Metode
      "rotary bor", "hidrolik bor", "casing bor", "slurry bor",
      "bor manual", "bor mesin", "bor hidrolik",
      // Objek
      "dak beton", "plat beton", "kolom beton", "sloof beton",
      "tiang bor", "pondasi bor", "pondasi dangkal", "pondasi dalam",
      // Skala
      "rumah tinggal", "skala kecil", "skala besar", "skala menengah",
      "proyek besar", "proyek kecil", "lahan sempit",
      // Multi-word umum
      "sumur dalam", "sumur dangkal", "sumur resapan",
      "air bersih", "air kotor", "air limbah",
      "besi beton", "baja ringan", "baja berat",
      "k3 konstruksi", "uji tanah",
      "air permukaan", "air bawah tanah", "air sumur",
      "sumur gali", "sumur pantek", "sumur bor dalam",
      "sumur bor dangkal",
      "pondasi tiang", "pondasi telapak", "pondasi strauss",
      "tiang bor mini", "bor pile mini",
      "baja tulangan", "besi tulangan",
      "kolom praktis", "ring balk",
      "cor dak beton", "cor lantai beton", "cor jalan beton",
      // 🔥 TAMBAHKAN 2 BARIS INI:
      "ac",
      "rangka atap",
      // (opsional, jika ada)
      "beton bertulang",
       "beton per lubang",
       "per lubang"      // safety net
    ],

    produk: [
      // Konsep material
      "pintu aluminium", "pintu kayu", "pintu besi", "pintu kaca",
      "jendela kaca", "jendela aluminium", "jendela kayu",
      "kitchen set", "wardrobe custom", "walk in closet",
      "pagar panel", "pagar beton", "pagar brc", "pagar besi",
      "kanopi baja", "kanopi alderon", "kanopi spandek",
      "railing tangga", "railing balkon",
      "wall panel", "wall moulding",
      "u ditch", "box culvert", "grass block",
      "paving block", "rooster beton", "half slab",
      "tangga putar", "tangga monyet",
      // Komponen pagar
            // 🔥 FIX: pagar panel beton bukan base, biar jadi MP
      //"pagar panel beton", "pagar brc galvanis",
      // Precast
      "precast beton", "beton precast",
      "tiang pancang beton", "mini pile beton",
      "sloof beton", "kolom praktis"
    ],

    material: [
      // Konsep
      "besi beton", "besi hollow", "besi kanal", "besi unp",
      "besi wf", "besi hbeam", "besi iwf", "besi siku",
      "baja ringan", "baja berat", "baja tulangan",
      "batu kali", "batu split", "batu belah", "batu alam",
      "batu apung", "batu andesit", "batu candi", "batu koral",
      "kayu jati", "kayu meranti", "kayu mahoni", "kayu sengon",
      "kayu pinus", "kayu kamper", "kayu kruing", "kayu merbau",
      "semen portland", "semen putih", "semen instan", "semen mortar",
      "pasir beton", "pasir pasang", "pasir urug", "pasir halus",
      "pasir kasar", "pasir putih", "pasir silika",
      "keramik lantai", "keramik dinding", "keramik kamar",
      "granit tile",
      "cat tembok", "cat kayu", "cat besi", "cat dinding",
      "pipa pvc", "pipa galvanis", "pipa besi", "pipa tembaga",
      "pipa hdpe", "pipa pp-r", "pipa conduit",
      "kabel listrik", "kabel tanah", "kabel udara",
      "atap spandek", "atap metal", "atap genteng", "atap beton",
      "plafon gypsum", "plafon pvc", "plafon grc",
      "gypsum board", "gypsum jayaboard",
      // Tambahan
            // 🔥 FIX-TIPE-NUM: "tipe 1" sebagai 1 konsep
      "tipe 1", "tipe 2", "tipe 3", "tipe 4", "tipe 5",
      "type 1", "type 2", "type 3", "type 4", "type 5",
      "semen portland pozzolan", "semen portland composite",
      "semen tiga roda", "semen gresik", "semen holcim",
      "marmer travertine",
      "cat anti bocor", "cat anti jamur", "cat anti karat",
      "pipa sch 40", "pipa sch 80", "pipa seamless",
      "kabel nyy", "kabel nym", "kabel nyaf",
      "plafon kalsiboard", "plafon shunda",
      "gypsum knauf"
    ],

    sewa: [
           "alat berat", "heavy equipment",
      // 🔥 FIX-KVA: kapasitas genset = 1 konsep
      "100 kva", "50 kva", "20 kva", "10 kva", "100 kva silent",
      "concrete pump", "tower crane", "mobile crane", "crawler crane",
      "dump truck", "motor grader", "wheel loader",
      "asphalt finisher", "asphalt paver", "tandem roller",
      "batching plant", "jack hammer",
      "baby roller", "vibro roller", "plate compactor",
      "skid steer", "skid loader",
      "alat bor tanah", "alat bor beton", "alat bor sumur",
      "mesin bor beton", "bor beton",
      "panel listrik", "panel distribusi",
      "lampu sorot proyek", "lampu tower",
      "pompa air", "pompa beton", "pompa lumpur",
      "gps survey", "total station"
    ],

    desain: [
      "desain interior", "desain eksterior", "desain rumah",
      "desain arsitektur", "desain 3d", "desain 2d",
      "desain kantor", "desain toko", "desain cafe",
      "desain gedung",
      "interior minimalis", "interior modern", "interior klasik",
      "konsep modern", "konsep minimalis", "open space",
      "ruang tamu", "ruang keluarga", "ruang makan", "ruang kerja",
      "kamar mandi", "kamar tidur", "kamar anak",
      "render 3d", "visualisasi 3d",
      "shop drawing", "as built drawing",
      "gambar kerja", "gambar teknik",
      "desain struktur", "desain mep"
    ]
  };
   
  // ═══════════════════════════════════════════════════════════
  // 🔥 BLOCK KONSTANTA (WAJIB ADA — jangan dihapus)
  // ═══════════════════════════════════════════════════════════

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

  var APPLICATION_TARGETS_FULL = ["dinding","tembok","lantai","plafon","atap","partisi","kolom","balok","plat","slab","pelat","pondasi","tiang","tangga","railing","kusen","pagar","pintu","jendela","kanopi","awning","fasad","facade","teras","balkon","halaman","carport","garasi","kamar mandi","kamar tidur","ruang tamu","ruang keluarga","ruang makan","ruang kerja","dapur","toilet","wc","kantor","toko","gudang","pabrik","sekolah","rumah","gedung","ruko","villa","apartemen","cafe","restoran","hotel","kios","rukan","jalan","trotoar","saluran","drainase","taman","kolam","sawah","lahan","tambang","proyek","site","area kerja","basement","custom","modern","minimalis","klasik","sumur","dak","sloof"];

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

  var SPEC_PHRASE_WORDS = ["berdasarkan","berdasar","faktor penentu","faktor yang mempengaruhi","faktor utama","penyebab","sebab","dampak","pengaruh","efek","per kedalaman","per ukuran","per tipe","per jenis","langkah-langkah","langkah demi langkah","tahapan lengkap","tahap demi tahap","panduan lengkap","tutorial lengkap","analisis lengkap","review lengkap","perbandingan lengkap","perbedaan lengkap","jenis-jenis lengkap","macam-macam lengkap","spesifikasi","mutu","metode","cara kerja","panduan","fungsi","ukuran"];

  var SPEC_PHRASE_INFORMATIONAL = [
    "faktor penentu","faktor yang mempengaruhi","faktor utama",
    "penyebab","sebab","dampak","pengaruh","efek",
    "panduan lengkap","panduan","tips","trik","cara memilih",
    "cara pasang","cara membuat","cara menghitung","cara merawat",
    "cara menggunakan",
    "spesifikasi","detail spesifikasi","spek lengkap",
    "perbandingan","perbedaan","kelebihan","kekurangan","review","ulasan",
    "pengertian","definisi","penjelasan","manfaat","fungsi","tujuan",
    "komponen","elemen","standar","mutu",
    "pemula","untuk pemula","tutorial","langkah-langkah","langkah demi langkah",
    "berdasarkan","berdasar"
  ];

  var MARKETING_TERMS = ["premium","ekonomis","terbaik","terlaris","murah","berkualitas","unggul","terkenal","favorit","recommended","terpercaya","profesional"];

  var MATERIAL_TYPE_WORDS = ["beton","portland","opc","ppc","pcc","semen putih","semen abu","semen warna","type 1","type 2","type 3","type 4","type 5","tipe 1","tipe 2","tipe 3","tipe 4","tipe 5","wiry","bjku","bjtd","bjp","bjts","plywood","multiplek","blockboard","mdf","hdf","particle board","solid wood","jati","meranti","mahoni","sengon","pinus","randu","sungkai","bangkirai","ulin","kamper","kruing","keruing","merbau","sonokeling","trembesi","glugu","bambu","andesit","kali","apung","split","koral","candi","palimanan","paras","breksi","granit","marmer","batu alam","batu belah","batu gunung","batu karang","silika","zeolit","cor","homogeneous","homogen","roman","platinum","mulia","essence","granito","granit tile","keramik lantai","keramik dinding","marmer italy","marmer lokal","marmer import","granit hitam","granit putih","granit coklat","granit import","granit lokal","dulux","jotun","nippon","mowilex","avian","decolith","propan","falcon","vinilex","dulux catylac","cat tembok","cat kayu","cat besi","cat dinding","pasir beton","pasir pasang","pasir urug","pasir halus","pasir kasar","pasir putih","pasir hitam","pasir ayak","pasir silika","pasir bangka","pasir lumajang","h-beam","hbeam","wf","hollow","kanal","siku","unesp","unp","cnp","inp","besi hollow","besi kanal","eterna","supreme","kabelindo","tranka","rucika","wavin","vinilon","pralon","maspion","tembaga","aluminium","kuningan","perunggu","titanium","besi cor","aluminium foil","bangka","lumajang","tulungagung","pangkep","muntilan","borneo","kalimantan","jepara","kudus","cilacap","tiga roda","3 roda","tiga-roda","3-roda","gresik","semen gresik","semen-gresik","holcim","semen holcim","semen-holcim","scg","semen scg","semen-scg","padang","semen padang","semen-padang","merah putih","semen merah putih","cibinong","semen cibinong","baturaja","semen baturaja","bosowa","semen bosowa","tonasa","semen tonasa","master","besi master","intan","besi intan","handuk","besi handuk","krakatau steel","krakatau-steel","ks","gunung garuda","gunung-garuda","hanil","jeka","danagri","magic","aquaproof","no drop","no-drop","nodrop","aqua proof","icera","ardena","milano","asia tile","asia-tile","indograha","kian","eleganza","elegan",
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
    "baja ringan c75","baja ringan c100","baja ringan c125",
    "baja ringan gording","baja ringan reng","baja ringan usuk","baja ringan kaso",
    "baja ringan galvanis","baja ringan zincalume",
    "baja ringan struktur","baja ringan non struktural",
    "baja ringan struktur bangunan","baja ringan struktur rangka",
    "baja profil wf","baja profil hbeam","baja profil iwf","baja profil unp","baja profil cnp",
    "baja tulangan ulir","baja tulangan polos",
    "besi beton ulir sirip","besi beton ulir","besi beton polos","besi beton sni",
    "besi hollow galvanis","besi hollow hitam","besi hollow kotak","besi hollow bulat",
    "besi kanal c","besi kanal u",
    "besi plat strip","besi plat hitam","besi plat putih",
    "besi siku lubang","besi siku polos",
    "besi ulir sirip","besi tulangan ulir","besi tulangan polos",
    "besi wiremesh m6","besi wiremesh m8","besi wiremesh m10","besi wiremesh m12",
    "kayu jati solid","kayu jati belanda",
    "kayu meranti merah","kayu meranti putih",
    "kayu mahoni solid","kayu sengon solid","kayu pinus solid",
    "kayu kamper solid","kayu kruing solid",
    "batu kali bulat","batu kali belah","batu gunung belah",
    "batu alam andesit","batu alam palimanan","batu alam paras",
    "batu alam templek","batu alam sikat",
    "pasir putih bangka",
    "semen portland pozzolan","semen portland composite",
    "semen portland putih","semen portland abu",
    "semen portland tipe 1","semen portland tipe 2","semen portland tipe 3","semen portland tipe 4","semen portland tipe 5",
    "semen gresik portland","semen holcim portland","semen tiga roda portland",
    "cat tembok weathershield","cat besi anti karat","cat lantai epoxy",
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

  var PROMO_MODIFIER_WORDS = ['murah','hemat','terjangkau','promo','diskon','obral','sale','termurah','termahal','bersaing','kompetitif','dibawah pasaran','diatas pasaran','pasaran','ekonomis','profesional'];

  var PRICE_WORDS = PRICE_HEAD_WORDS;

  var NOISE_WORDS_UNIVERSAL = ['borongan','sistem borongan','borongan penuh','borongan sebagian','paket borongan','sistem paket','sistem paket borongan','all in','all-in','all in one','cash','kredit','cicilan','tunai','transfer','dp','lunas','termin','kontan','installment','debit','cod','cash on delivery','paylater','pay later','bayar di tempat','bayar di awal','bayar di akhir','pembayaran','preorder','pre-order','indent','po','bangunan','konstruksi','proyek'];

  var NOISE_WORDS_JASA = ['meteran','sistem meteran','sistem harian','sistem mingguan','sistem bulanan','sistem tahunan','per proyek','per paket','per pekerjaan','short term','long term','per area','per zona','per ruangan','per lantai','per hari kerja','per jam kerja','per shift','per tongkang','per rit','per ritase','rangka'];

  var ACTION_VERBS = ["pemotongan","pemotong","memotong","potong","potongan","penggalian","penggali","menggali","gali","galian","pengurugan","pengurug","mengurug","urug","urugan","pengangkutan","pengangkut","mengangkut","angkut","angkutan","pengeboran","pengebor","mengebor","bor","boran","pengelasan","pengelas","mengelas","las","lasan","pengecoran","pengecor","mengecor","cor","coran","pengecatan","pengecat","mengecat","cat","catan","pengukuran","pengukur","mengukur","ukur","ukuran","pemasangan","pemasang","memasang","pasang","pasangan","pembongkaran","pembongkar","membongkar","bongkar","bongkaran","pembuatan","pembuat","membuat","buat","buatan","pengupasan","pengupas","mengupas","upas","upasan","pemadatan","pemadat","memadatkan","padat","padatan","pengerukan","pengeruk","mengeruk","keruk","kerukan","pemancangan","pemancang","memancang","pancang","pancangan","pembersihan","pembersih","membersihkan","bersih","bersihan","perataan","perata","meratakan","rata","rataan","pembentukan","pembentuk","membentuk","bentuk","bentukan","persiapan","persiap","mempersiapkan","siap","siapan","stabilisasi","stabilis","menstabilkan","stabil","cut","fill","grading","elevasi","pemetaan","tebang","menebang","penebangan","pindah","pemindahan","timbun","penimbunan","renovasi","merenovasi","perbaikan","memperbaiki","instalasi","menginstal","install","service","servis","menyervis","penggantian","mengganti","ganti","pemeliharaan","memelihara","rawat","perawatan","pengadaan","menyediakan","relief","profil","finishing","cutting","bongkar","buang","uji","perkuatan","pematangan"];

  // ═══ END BLOCK KONSTANTA ═══
  // ═══ END STAGE 1/6 — LANJUT STAGE 2/6 ═══

   // ═══════════════════════════════════════════════════════════
  // PATCH M1+M2: REGEX CACHE + MASTER REGEX
  // ═══════════════════════════════════════════════════════════
  var _REGEX_CACHE = Object.create(null);
  var _REGEX_CACHE_SIZE = 0;
  var _REGEX_CACHE_MAX = 2000;

  function _escapeRegex(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // ═══════════════════════════════════════════════════════════
  // 🔥 PATCH-COMPOUND-v1: NORMALIZE COMPOUND TERMS
  // 
  // FUNGSI: Ganti compound term dengan 1 token placeholder
  // 
  // CONTOH:
  //   Input : "jasa bor air tanah jakarta"
  //   Output: "jasa bor ct_5 jakarta"
  //   (dengan "air tanah" diganti 1 token "ct_5")
  // 
  // TUJUAN: Agar countSemanticUnits() hitung 1 KONSEP,
  //         bukan 1 KATA.
  // ═══════════════════════════════════════════════════════════
    function normalizeCompoundTerms(text, entityType) {
    // Guard: input kosong
    if (!text) return text;

    // Lowercase untuk konsistensi
    var normalized = text.toLowerCase();

    // Ambil compound library untuk entity ini
    var compounds = (COMPOUND_LIBRARY[entityType] || []).slice();

    // 🆕 PATCH 1b: ikutkan COMPOUND_NOUNS_CONSTRUCTION untuk entity jasa
    // SCOPE: JASA saja — entity lain tidak berubah behavior-nya
    if (entityType === "jasa" &&
        typeof COMPOUND_NOUNS_CONSTRUCTION !== "undefined" &&
        Array.isArray(COMPOUND_NOUNS_CONSTRUCTION)) {
      compounds = compounds.concat(COMPOUND_NOUNS_CONSTRUCTION);
    }

    if (compounds.length === 0) return normalized;
    
    // Sort by word count DESC (panjang dulu, agar "bore pile manual"
    // di-replace sebelum "bore pile")
    var sortedCompounds = compounds.slice().sort(function(a, b) {
      return b.split(' ').length - a.split(' ').length;
    });
    
    // Loop setiap compound dan replace dengan token unik
    for (var i = 0; i < sortedCompounds.length; i++) {
      var compound = sortedCompounds[i];
      var pattern = rx(compound, 'g');
      
      if (pattern.test(normalized)) {
        pattern.lastIndex = 0;
        // Ganti dengan placeholder 1 token
        // ct_ = compound term (agar tidak ketabrak regex lain)
        normalized = normalized.replace(pattern, 'ct_' + i);
      }
    }
    
    return normalized;
  }

  // ═══════════════════════════════════════════════════════════
  // 🔥 PATCH-COMPOUND-v1: COUNT SEMANTIC UNITS
  // 
  // FUNGSI: Hitung semantic unit (setelah normalize compound)
  // BUKAN word count biasa
  // 
  // CONTOH:
  //   Input : "jasa bor air tanah"
  //   Output: 2 (bukan 4)
  // 
  // LOGIKA:
  //   1. Normalize compound → "jasa bor ct_5"
  //   2. Filter kata > 2 karakter
  //   3. Count = 3 (jasa, bor, ct_5)
  // ═══════════════════════════════════════════════════════════
  function countSemanticUnits(text, entityType) {
    if (!text) return 0;
    var normalized = normalizeCompoundTerms(text, entityType);
    var units = normalized.split(/\s+/).filter(function(w) {
      return w.length > 2;
    });
    return units.length;
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
  // PATCH M3: MEMOIZE
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

  var _memoCountModifierLayers = null;
  var _memoCheckHasSpecification = null;
  var _memoGetCoreWords = null;
  var _memoGetFactors = null;
  var _memoCalculateComplexityScore = null;
  var _memoCheckFisikRole = null;
  var _memoHasJasaMaterialCtx = null;
  var _memoCheckPureTechnicalSpec = null;
  var _memoIsSubVariant = null;
  var _memoHasTechnicalSpec = null;
  var _memoDetectVariantByPattern = null;

  // ═══════════════════════════════════════════════════════════
  // PATCH M4: IDLE SCHEDULER + DEVICE DETECTION
  // ═══════════════════════════════════════════════════════════
  var _DEVICE = (function() {
    var nav = (typeof navigator !== 'undefined') ? navigator : {};
    var mem = nav.deviceMemory || 4;
    var cores = nav.hardwareConcurrency || 4;
    var saveData = nav.connection && nav.connection.saveData;
    var isMobile = /Mobi|Android|iPhone|iPad/i.test(nav.userAgent || '');
    var lowEnd = mem <= CONFIG.LOW_END_MEMORY_THRESHOLD
              || cores <= CONFIG.LOW_END_CORES_THRESHOLD
              || saveData === true;
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
    return runWhenIdle(fn, timeout || CONFIG.HEAVY_WARNING_IDLE_TIMEOUT);
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

  // ═══ END STAGE 2/6 — LANJUT STAGE 3/6 ═══

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

        var rows = table.querySelectorAll('tr');
        if (rows.length < 2) continue;

        var priceHeaderCount = 0;

        var headers = table.querySelectorAll('th');
        for (var j = 0; j < headers.length; j++) {
          var headerText = (headers[j].innerText || headers[j].textContent || '').toLowerCase();
          if (/harga|biaya|tarif|price|cost|rate/i.test(headerText)) priceHeaderCount++;
        }

        if (priceHeaderCount === 0 && rows.length > 0) {
          var firstRowText = (rows[0].innerText || rows[0].textContent || '').toLowerCase();
          if (/harga|biaya|tarif|price|cost|rate/i.test(firstRowText)) priceHeaderCount++;
        }

        if (priceHeaderCount === 0) {
          var tableText = (table.innerText || table.textContent || '').toLowerCase();
          if (/harga|biaya|tarif/i.test(tableText) && /[\d.,]{4,}/.test(tableText)) {
            priceHeaderCount++;
          }
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
        log('🎭 OBJECT role: "' + m[0] + '"', 'OBJECT');
        return "object";
      }
    }
    if (_MASTER.actionFisik) {
      var mf = _MASTER.actionFisik.exec(lower);
      if (mf) {
        log('🎭 OBJECT role: "' + mf[0] + '"', 'FISIKCTX');
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
          _cacheSubCatSet(cacheKey, cat);
          return cat;
        }
      }
    }

    log('📂 SUBCAT: default', 'SUBCAT');
    _cacheSubCatSet(cacheKey, "default");
    return "default";
  }

  // ═══════════════════════════════════════════════════════════
  // FUNGSI SPESIFIKASI
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

    if (entityType === "produk") {
      if (_matchList(ENTITY_SPECIFIC.produk.mutu)) return true;
      if (_matchList(SHARED_MODIFIERS.finishing)) return true;
      if (/\d+\s*(m|mm|cm|meter|kg|ton|inch|inci|ft|feet)/gi.test(lower)) return true;
      if (/\d+\s*[x×]\s*\d+\s*(cm|m|meter|mm)/gi.test(lower)) return true;
      if (_matchList(SHARED_MODIFIERS.warna)) return true;
      if (_matchList(SHARED_MODIFIERS.gaya)) return true;
      if (_matchList(CROSS_ENTITY_SPECS.produk.sharedMaterialFinishing)) return true;
      if (_matchList(SHARED_MODIFIERS.material)) return true;

      var textNoBaseB = lower;
      var baseListB = ENTITY_BASE_NAMES.produk || [];
      for (var biB = 0; biB < baseListB.length; biB++) {
        textNoBaseB = textNoBaseB.replace(rx(baseListB[biB], 'g'), ' ');
      }
      _buildMasterRegexes();
      if (_MASTER.appTargets && _MASTER.appTargets.test(textNoBaseB)) return true;
      if (/\d+\s*[x×]\s*\d+(?:\s*[x×]\s*\d+)?/i.test(lower)) return true;
    }

    if (entityType === "material") {
      if (_matchList(MATERIAL_SPECS.grade)) return true;
      if (_matchList(SHARED_MODIFIERS.finishing)) return true;
      if (/\d+\s*(mm|cm|m|meter|kg|ton|m3|liter)/gi.test(lower)) return true;
      if (_matchList(MATERIAL_SPECS.berat)) return true;
      if (_matchList(ENTITY_SPECIFIC.material.tipe_extended)) return true;
      if (_matchList(CROSS_ENTITY_SPECS.material.extendedTypes)) return true;
      if (/\d+\s*[x×]\s*\d+(?:\s*[x×]\s*\d+)?/i.test(lower)) return true;
    }

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

      if (/\balat\s+pancang\s+(hidrolik|diesel|drop|hspd|mini|besar)\b/i.test(lower)) return true;

      var _isHammerDriverBase = /\b(pile\s+driver|diesel\s+hammer|drop\s+hammer|hydraulic\s+hammer|vibro\s+hammer)\b/i.test(lower);
      if (_isHammerDriverBase) {
        var _hasOtherSpec = /\d+\s*(m|mm|cm|meter|kg|ton|inch|inci|ft|feet|ton|m3|kva|psi|hp)\b/i.test(lower)
          || /\d+\s*[x×]\s*\d+/i.test(lower);
        if (!_hasOtherSpec) return false;
      }
    }

    if (entityType === "jasa") {
      var subCat = detectJasaSubCategory(text, "jasa");
      var domainConstraints = DOMAIN_CONSTRAINTS[subCat] || DOMAIN_CONSTRAINTS["default"];
      var forbiddenCats = domainConstraints.forbidden_categories || [];

      if (_matchList(ENTITY_SPECIFIC.jasa.metode)) return true;
      if (_matchList(ENTITY_SPECIFIC.jasa.skala)) return true;

      if (forbiddenCats.indexOf("finishing") === -1) {
        if (_matchList(SHARED_MODIFIERS.finishing)) return true;
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
        if (_MASTER.action && _MASTER.action.test(lower)) return true;
      }
    }

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
          if (rx(bn1_212).test(bn2_212)) {
            if (rx(bn2_212).test(textNoBase)) {
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

      if (APPLICATION_TARGETS_FULL.indexOf(bn212) !== -1) {
        var _bnCount212 = 0;
        for (var _bnc = 0; _bnc < sortedBaseList212.length; _bnc++) {
          var _otherBn = sortedBaseList212[_bnc];
          if (_otherBn === bn212) continue;
          if (APPLICATION_TARGETS_FULL.indexOf(_otherBn) !== -1) continue;
          if (bn212.indexOf(_otherBn) !== -1) continue;
          if (rx(_otherBn).test(lower)) _bnCount212++;
        }
        if (_bnCount212 >= 1) continue;
        textNoBase = textNoBase.replace(rx(bn212, 'g'), ' ');
        continue;
      }
      textNoBase = textNoBase.replace(rx(bn212, 'g'), ' ');
    }

    _buildMasterRegexes();
    if (_MASTER.appTargets && _MASTER.appTargets.test(textNoBase)) return true;

    if (/\d+\s*(kg|ton|m|cm|mm|m3|liter|kva|psi|hp|inch|k)\b/i.test(lower)) return true;
    if (/\d+\s*[x×]\s*\d+(?:\s*[x×]\s*\d+)?/i.test(lower)) return true;
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
        return false;
      }
      if (compatibleEntities.indexOf(entityType) !== -1) return true;
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

  function countModifierLayers(text, entityType) {
    if (!text) return 0;
    _buildMasterRegexes();

    var working = text.toLowerCase();

    var entityOnly = ENTITY_ONLY_WORDS[entityType] || [];
    for (var e = 0; e < entityOnly.length; e++) {
      working = working.replace(rx(entityOnly[e], 'g'), ' ');
    }

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
          if (rx(bn1).test(bn2)) {
            if (rx(bn2).test(working)) {
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

      if (APPLICATION_TARGETS_FULL.indexOf(bn) !== -1) {
        var _bnCountB = 0;
        for (var _bncb = 0; _bncb < sortedBaseNames.length; _bncb++) {
          var _otherB = sortedBaseNames[_bncb];
          if (_otherB === bn) continue;
          if (APPLICATION_TARGETS_FULL.indexOf(_otherB) !== -1) continue;
          if (bn.indexOf(_otherB) !== -1) continue;
          if (rx(_otherB).test(working)) _bnCountB++;
        }
        if (_bnCountB >= 1) continue;
        working = working.replace(rx(bn, 'g'), ' ');
        continue;
      }
      working = working.replace(rx(bn, 'g'), ' ');
    }

    if (_MASTER.noiseUniv) {
      _MASTER.noiseUniv.lastIndex = 0;
      if (_MASTER.noiseUniv.test(working)) {
        _MASTER.noiseUniv.lastIndex = 0;
        working = working.replace(_MASTER.noiseUniv, ' ');
      }
    }
    if (entityType === "jasa" && _MASTER.noiseJasa) {
      _MASTER.noiseJasa.lastIndex = 0;
      if (_MASTER.noiseJasa.test(working)) {
        _MASTER.noiseJasa.lastIndex = 0;
        working = working.replace(_MASTER.noiseJasa, ' ');
      }
    }

    if (entityType === "sewa") {
      var _sewaBaseEarly = ENTITY_BASE_NAMES.sewa || [];
      var _sewaSortedEarly = _sewaBaseEarly.slice().sort(function(a, b) {
        return b.split(' ').length - a.split(' ').length;
      });
      for (var _sbe = 0; _sbe < _sewaSortedEarly.length; _sbe++) {
        var _bnSbe = _sewaSortedEarly[_sbe];
        if (rx(_bnSbe).test(working)) {
          working = working.replace(rx(_bnSbe, 'g'), ' ');
        }
      }
      working = working.replace(/\s+/g, ' ').trim();
    }

    var UNIVERSAL_PREFIX_9 = ["jasa","layanan","tukang","kontraktor","toko","supplier","distributor","jual","beli","rental","sewa","service","servis"];
    for (var up9 = 0; up9 < UNIVERSAL_PREFIX_9.length; up9++) {
      working = working.replace(rx(UNIVERSAL_PREFIX_9[up9], 'g'), ' ');
    }

    working = working.replace(/\s+/g, ' ').trim();
    if (!working) return 0;

    var count = 0;
    var seenWords = {};

    var dimUnitEarly = working.match(/\d+\s*(?:x|×)\s*\d+\s*(?:cm|m|mm|meter|inch|inci)\b/gi) || [];
    if (dimUnitEarly.length > 0) {
      count += dimUnitEarly.length;
      for (var k = 0; k < dimUnitEarly.length; k++) working = working.replace(dimUnitEarly[k], ' ');
    }
    var dimMultiEarly = working.match(/\d+\s*(?:x|×)\s*\d+/gi) || [];
    if (dimMultiEarly.length > 0) {
      count += dimMultiEarly.length;
      for (var k2 = 0; k2 < dimMultiEarly.length; k2++) working = working.replace(dimMultiEarly[k2], ' ');
    }
    var dimSimpleEarly = working.match(/\d+\s*(?:cm|mm|m|meter|kg|ton|inch|inci|kva|psi|hp|ft|feet)\b/gi) || [];
    if (dimSimpleEarly.length > 0) {
      count += dimSimpleEarly.length;
      for (var k3 = 0; k3 < dimSimpleEarly.length; k3++) working = working.replace(dimSimpleEarly[k3], ' ');
    }
    working = working.replace(/\s+/g, ' ').trim();
    if (!working) return count;

    for (var ph = 0; ph < PRICE_HEAD_WORDS.length; ph++) {
      working = working.replace(rx(PRICE_HEAD_WORDS[ph], 'g'), ' ');
    }

    if (entityType !== "sewa") {
      if (_MASTER.satuanPer) {
        _MASTER.satuanPer.lastIndex = 0;
        working = working.replace(_MASTER.satuanPer, ' ');
      }
      if (_MASTER.satuanUnits) {
        _MASTER.satuanUnits.lastIndex = 0;
        working = working.replace(_MASTER.satuanUnits, ' ');
      }
    }

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

    var categories = getCategoryDefs(entityType);
    var subCat = detectJasaSubCategory(text, entityType);
    var domainConstraints = DOMAIN_CONSTRAINTS[subCat] || DOMAIN_CONSTRAINTS["default"];
    var forbiddenCats = domainConstraints.forbidden_categories || [];
    var forbiddenSet = {};
    for (var fc = 0; fc < forbiddenCats.length; fc++) forbiddenSet[forbiddenCats[fc]] = true;

    for (var cat in categories) {
      if (!categories.hasOwnProperty(cat)) continue;
      if (forbiddenSet[cat]) continue;
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

    var stopwords = ["dan","atau","serta","yang","dari","ke","di","untuk","dengan","ini","itu","akan","pada","oleh","per"];
    for (var s = 0; s < stopwords.length; s++) {
      cleaned = cleaned.replace(rx(stopwords[s], 'g'), ' ');
    }

    if (entityType === "desain") {
      var ROOM_CTX = ["rumah","kantor","toko","hotel","restoran","cafe","villa","apartemen","ruko","kios","gudang","klinik","sekolah","mall","spa","salon","bar","lounge","butik","showroom","minimarket","dapur","kamar mandi","kamar tidur","ruang tamu","ruang keluarga","ruang makan","ruang kerja","teras","balkon","toilet","wc"];
      for (var rc = 0; rc < ROOM_CTX.length; rc++) {
        cleaned = cleaned.replace(rx(ROOM_CTX[rc], 'g'), ' ');
      }
    }
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    if (cleaned) {
      var unknownWords = cleaned.split(/\s+/).filter(function(w) { return w.length > 3; });
      if (unknownWords.length > 0) {
        count += unknownWords.length;
      }
    }

    return count;
  }

  function flagAmbiguous(text, entityType, level, layers) {
    if (!CONFIG.DEBUG) return;
    var residues = _memoCountModifierLayers
      ? _memoCountModifierLayers(text, entityType)
      : countModifierLayers(text, entityType);
    if (residues > 0 && layers === 0) {
      log('⚠️ FIX 199: AMBIGUOUS — text="' + text + '"', 'WARN');
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

  function detectPageLevelForPrompt(text, entityType) {
    if (!text) return "money-page";
    var _resolvedEntity = entityType || detectEntityTypeFromText(text);
    var cacheKey = text + "|" + (_resolvedEntity || "null");
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
            _cacheLevelSet(cacheKey, "pillar");
            return "pillar";
          }
        }
      }
    }
    var level = detectMoneyLevelInternal(text, _resolvedEntity);
    if (!level) { level = "money-page"; }
    _cacheLevelSet(cacheKey, level);
    return level;
  }

  function detectEntityTypeFromText(text) {
    if (!text) return null;
    var lower = text.toLowerCase();

    if (/\bjasa\s+(desain|interior|arsitektur|eksterior)\b/i.test(lower)) return "desain";

if (/^(cara|panduan|tips|tutorial|langkah|apa itu|pengertian|definisi|perbedaan|perbandingan|review)/i.test(lower.trim())) {
  // Jangan langsung return artikel jika ada keyword entity yang kuat
  if (!/\b(jasa|sewa|desain|produk|material)\b/i.test(lower)) {
    return "artikel";
  }
}

    if (/\b(sewa|rental)\b/i.test(lower)) {
      var _hasJasaExplicit = /\b(jasa|layanan|kontraktor|tukang|borongan)\b/i.test(lower);
      var _hasDesainExplicit = /\b(desain|arsitektur|render|gambar kerja|shop drawing|visualisasi)\b/i.test(lower);
      if (!_hasJasaExplicit && !_hasDesainExplicit) return "sewa";
    }

    for (var i = 0; i < ENTITY_PRIORITY.length; i++) {
      var entity = ENTITY_PRIORITY[i];
      var triggers = ENTITY_TRIGGERS[entity] || [];
      for (var j = 0; j < triggers.length; j++) {
        if (rx(triggers[j]).test(lower)) return entity;
      }
    }

    if (lower.indexOf("jasa") !== -1 || lower.indexOf("kontraktor") !== -1 || lower.indexOf("tukang") !== -1) return "jasa";
    if (lower.indexOf("sewa") !== -1 || lower.indexOf("rental") !== -1) return "sewa";
    if (lower.indexOf("desain") !== -1 || lower.indexOf("interior") !== -1) return "desain";
    if (lower.indexOf("material") !== -1 || lower.indexOf("bahan") !== -1) return "material";
    if (lower.indexOf("produk") !== -1 || lower.indexOf("jual") !== -1) return "produk";

    for (var m = 0; m < MATERIAL_WORDS.length; m++) {
      if (rx(MATERIAL_WORDS[m]).test(lower)) return "material";
    }

    var hasSewaWord = false;
    var matchedSewaWord = null;
    for (var s = 0; s < SEWA_WORDS.length; s++) {
      if (rx(SEWA_WORDS[s]).test(lower)) {
        hasSewaWord = true;
        matchedSewaWord = SEWA_WORDS[s];
        break;
      }
    }

    if (hasSewaWord) {
      var hasProdukContext = /\b(harga|jual|beli|supplier|distributor|toko|shop|dijual|dibeli|unit|stok|stock|baru|bekas|second|import|ekspor|kredit|cicilan)\b/i.test(lower);
      var hasSewaContext = /\b(sewa|rental|rent|harian|mingguan|bulanan|tahunan|per hari|per jam|per minggu|per bulan|operator|self drive|lepas kunci|include operator|tanpa operator)\b/i.test(lower);
      var hasJasaContext = /\b(jasa|layanan|service|servis)\b/i.test(lower);

      if (hasJasaContext) return "jasa";
      if (hasProdukContext && !hasSewaContext) return "produk";
      if (hasSewaContext) return "sewa";
      return "sewa";
    }

    for (var p = 0; p < PRODUK_WORDS.length; p++) {
      if (rx(PRODUK_WORDS[p]).test(lower)) return "produk";
    }

    for (var d = 0; d < DESAIN_WORDS.length; d++) {
      if (rx(DESAIN_WORDS[d]).test(lower)) return "desain";
    }

    var hasJasaVerbSignal = /\b(jasa|pasang|borongan|tukang|bongkar|gali|urug|cor|bor|coring|renovasi|perbaikan|instalasi|service|servis|bangun|las|grouting|cutting|drilling|sandblasting|pancang|pemancangan|pengecoran|pengeboran)\b/i.test(lower);
    var hasProdukTxSignal = /\b(harga|jual|beli|supplier|distributor|ready|stok|stock|unit|batang|lembar|keping)\b/i.test(lower);

    if (hasJasaVerbSignal && !hasProdukTxSignal) {
      var jasaNamesRL = ENTITY_BASE_NAMES.jasa || [];
      for (var jnRL = 0; jnRL < jasaNamesRL.length; jnRL++) {
        if (lower.indexOf(jasaNamesRL[jnRL]) !== -1) return "jasa";
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
        if (nameRL.length > bestMatchRL.length) isBetterRL = true;
        else if (nameRL.length === bestMatchRL.length && epRL < bestMatchRL.priority) isBetterRL = true;
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

      if (entitiesForBaseName.length >= 2) {
        var hasProdukCtx = /\b(harga|jual|beli|supplier|distributor|ready|stok|stock|unit|batang|lembar|keping|ukuran|dimensi|spesifikasi|mutu|k\d+|fc|sni|grade|ton|kg|m3|per kubik|per batang|per lembar)\b/i.test(lower);
        var hasJasaCtx = /\b(jasa|pasang|borongan|tukang|pemancangan|pengeboran|pancang|bor|pile|bongkar|gali|urug|cor|las|bending|cutting|coring|grouting|renovasi|perbaikan|instalasi|service|servis|bangun|pembuatan|pemasangan|pengerjaan|proyek)\b/i.test(lower);
        var hasSewaCtx = /\b(sewa|rental|rent|harian|mingguan|bulanan|tahunan|operator|self drive|lepas kunci)\b/i.test(lower);
        var hasDesainCtx = /\b(desain|gambar|render|visualisasi|3d|2d|animasi|walkthrough|konsep|layout)\b/i.test(lower);

        if (hasDesainCtx && entitiesForBaseName.indexOf('desain') !== -1 && !hasJasaCtx && !hasProdukCtx) return "desain";
        if (hasSewaCtx && entitiesForBaseName.indexOf('sewa') !== -1 && !hasProdukCtx) return "sewa";
        if (hasJasaCtx && hasProdukCtx) return "jasa";
        if (hasJasaCtx && entitiesForBaseName.indexOf('jasa') !== -1) return "jasa";
        if (hasProdukCtx && entitiesForBaseName.indexOf('produk') !== -1) return "produk";

        var priorityOrder = ["jasa","sewa","desain","produk","material","artikel"];
        for (var po = 0; po < priorityOrder.length; po++) {
          if (entitiesForBaseName.indexOf(priorityOrder[po]) !== -1) return priorityOrder[po];
        }
      }
      return bestMatchRL.entity;
    }
    return null;
  }

  function detectEntityType(userEntityType) {
    if (userEntityType && VALID_ENTITY_TYPES.indexOf(userEntityType) !== -1) return userEntityType;
    var slugText = getPageText();
    if (!slugText || slugText.length < 3 || /^(blog|post|artikel|produk|layanan|service|item|page|p|home|index|\d+)(\s+\d+)?\s*$/i.test(slugText.trim())) {
      var h1Text = getH1Text();
      if (h1Text && h1Text.length > 3) return detectEntityTypeFromText(h1Text);
    }
    return detectEntityTypeFromText(slugText);
  }

     // 🔥 FIX-SUBPILLAR-STRICT: keyword hanya match kalau di posisi PERTAMA
  // Mencegah false positive pada "semen portland tipe 1", "jasa cor tipe a", dsb
  function detectSubPillarStrict(text) {
    if (!text) return null;
    var lower = text.toLowerCase().trim();
    if (!lower) return null;

    var words = lower.split(/\s+/).filter(Boolean);
    if (words.length === 0) return null;

    // 1) Keyword sub-pillar di posisi PERTAMA saja
    var firstWord = words[0];
    for (var i = 0; i < SUB_PILLAR_2_KEYWORDS.length; i++) {
      if (SUB_PILLAR_2_KEYWORDS[i] === firstWord) {
        return "sub-pillar-tipe-2";
      }
    }

    // 2) Pola "X vs Y" / "X versus Y"
    if (/\b(vs|versus)\b/i.test(lower)) {
      var parts = lower.split(/\b(?:vs|versus)\b/);
      if (parts.length >= 2) {
        var leftWords = parts[0].trim().split(/\s+/).filter(Boolean);
        var rightWords = parts[1].trim().split(/\s+/).filter(Boolean);
        if (leftWords.length >= 1 && rightWords.length >= 1) {
          return "sub-pillar-tipe-1";
        }
      }
    }

    // 3) Sub-pillar-1 STRONG (spesifik, jarang false positive)
    for (var j = 0; j < SUB_PILLAR_1_STRONG.length; j++) {
      if (rx(SUB_PILLAR_1_STRONG[j]).test(lower)) return "sub-pillar-tipe-1";
    }

    return null;
  }

  function detectSubPillar(text) {
    var lower = text.toLowerCase();
    for (var i = 0; i < SUB_PILLAR_2_KEYWORDS.length; i++) {
      if (rx(SUB_PILLAR_2_KEYWORDS[i]).test(lower)) return "sub-pillar-tipe-2";
    }
    for (var i = 0; i < SUB_PILLAR_1_STRONG.length; i++) {
      if (rx(SUB_PILLAR_1_STRONG[i]).test(lower)) return "sub-pillar-tipe-1";
    }
    for (var i = 0; i < SUB_PILLAR_1_WEAK.length; i++) {
      var weakWord = SUB_PILLAR_1_WEAK[i];
      if (lower.indexOf(weakWord) !== -1) {
        var parts = lower.split(new RegExp("\\b" + weakWord + "\\b"));
        if (parts.length >= 2) {
          var left = parts[0].trim();
          var right = parts[1].trim();
          if (left.split(/\s+/).length >= 2 && right.split(/\s+/).length >= 2) {
            return "sub-pillar-tipe-1";
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
          if (isEntityMatch) return true;
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
    if (entityType === "sewa") fisikRegex = /\d+\s*(m|mm|cm|meter|ton|m3)\b/gi;
    else fisikRegex = /\d+\s*(m|mm|cm|meter|kg|ton|inch|inci)\b/gi;
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
            if (rx(bn1e).test(bn2e)) {
              if (rx(bn2e).test(coreText)) {
                _baseNamesToSkipEarly[bn1e] = true;
                break;
              }
            }
          }
        }
      }
      for (var i = 0; i < sortedBaseNamesEarly.length; i++) {
        var bn = sortedBaseNamesEarly[i];
        if (_baseNamesToSkipEarly[bn]) continue;
        var bnWords = bn.split(' ');
        var lastWord = bnWords[bnWords.length - 1];
        if (bnWords.length >= 2 && APPLICATION_TARGETS.indexOf(lastWord) !== -1) {
          var baseWithoutTarget = bnWords.slice(0, -1).join(' ');
          if (baseNamesSet[baseWithoutTarget]) continue;
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

    var coreWords = coreText.split(/\s+/).filter(function(w) { return w.length > 2; });
    var uniqueWords = [];
    var seen = {};
    for (var i = 0; i < coreWords.length; i++) {
      var w = coreWords[i];
      if (!seen[w]) { seen[w] = true; uniqueWords.push(w); }
    }

    if (uniqueWords.length === 0 && checkHasBaseService(text)) {
      var fallbackBaseNames = ENTITY_BASE_NAMES[entityType] || [];
      var fallbackSorted = fallbackBaseNames.slice().sort(function(a, b) {
        return b.split(' ').length - a.split(' ').length;
      });
      for (var fb = 0; fb < fallbackSorted.length; fb++) {
        var fbName = fallbackSorted[fb];
        if (rx(fbName).test(text)) {
          var fbWords = fbName.split(' ');
          var fbLast = fbWords[fbWords.length - 1];
          if (fbLast.length > 2) uniqueWords.push(fbLast);
          break;
        }
      }
    }

    return uniqueWords;
  }

  function detectVariantByPattern(text, entityType) {
    if (!text) return { isVariant: false, score: 0, reasons: [] };
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
        if (actualLayers >= 3) return { isVariant: true, score: 10, reasons: reasons, level: "sub-variant" };
        if (actualLayers === 2) return { isVariant: true, score: 8, reasons: reasons, level: "variant" };
        if (actualLayers === 1) return { isVariant: true, score: 6, reasons: reasons, level: "money-page" };
        return { isVariant: false, score: 3, reasons: reasons };
      }
    }
    return { isVariant: false, score: 0, reasons: reasons };
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
      if (result.level) return result.level;
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
      fisikRole: _memoCheckFisikRole ? _memoCheckFisikRole(text) : checkFisikRole(text),
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

  // ═══ END STAGE 3/6 — LANJUT STAGE 4/6 ═══

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
        warnings.push({ type: "SEO_MISALIGNMENT_ATAU", severity: "warning", message: "URL mengandung 'atau'...", suggestion: "Ganti ke 'dan' atau expand jadi 'A vs B'." });
      }
    }
    if (hasDan && level !== "money-page") {
      warnings.push({ type: "SEO_MISALIGNMENT_DAN", severity: "warning", message: "URL mengandung 'dan'/'serta'...", suggestion: "Pecah jadi 2 halaman." });
    }
    return warnings;
  }

  function detectSameLevelContentWarning(slug, entityType) {
    var warnings = [];
    if (!slug) return warnings;
    var lower = slug.toLowerCase();
    var TRIGGER_CATEGORIES = [
      { type: "PROMO_WORD", words: ["murah","hemat","terjangkau","bersaing","kompetitif","ekonomis"], icon: "💰" },
      { type: "SCALE_WORD", words: ["kecil","besar","sedang","mini","jumbo","heavy","medium"], icon: "📏" },
      { type: "PROMO_STRONG", words: ["promo","diskon","obral","flash sale","cuci gudang"], icon: "🔥" },
      { type: "LOCATION_VARIANT", words: ["jakarta","bandung","surabaya","jogja","semarang"], icon: "📍" }
    ];
    for (var catIdx = 0; catIdx < TRIGGER_CATEGORIES.length; catIdx++) {
      var cat = TRIGGER_CATEGORIES[catIdx];
      for (var wIdx = 0; wIdx < cat.words.length; wIdx++) {
        var word = cat.words[wIdx];
        if (!rxRaw("\\b" + _escapeRegex(word) + "\\b", "i").test(lower)) continue;
        var baseSlug = lower.replace(rxRaw("\\b" + _escapeRegex(word) + "\\b", "gi"), "").replace(/\s+/g, " ").trim();
        if (!baseSlug) continue;
        warnings.push({
          type: "SAME_LEVEL_CONTENT_REVIEW", severity: "info",
          category: cat.type, icon: cat.icon, triggerWord: word,
          currentSlug: lower, baseSlug: baseSlug,
          message: "URL ini punya level SAMA dengan '" + baseSlug + "'."
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
      warnings.push({ type: "SEO_HIERARCHY_MISMATCH", severity: "warning", parentSlug: parentSlug, parentLevel: parentLevel, currentLevel: currentLevel, expectedLevel: expectedLevel, message: "URL '" + slug + "' terdeteksi '" + currentLevel + "'..." });
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
      results.push({ position: i, slug: segSlug, level: segLevel, levelNum: segLevelNum, isCurrent: (i === words.length) });
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
      warnings.push({ type: "SEO_HIERARCHY_MISMATCH", severity: "warning", parentSlug: parent.slug, parentLevel: parent.level, currentSlug: current.slug, currentLevel: current.level, expectedLevel: expectedLevel, message: "URL '" + current.slug + "' = '" + current.level + "'..." });
    }
    return warnings;
  }

  // ═══════════════════════════════════════════════════════════
  // 🔥 PATCH 12b: validateParentDrivenHierarchy() — SEO DIMENSION
  // 
  // PERUBAHAN:
  // - Tidak warning kalau VARIANT + location → MC
  // - MC selalu valid kalau ada location
  // ═══════════════════════════════════════════════════════════
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
    
    // 🔥 PATCH-VALIDATOR-v2: MC selalu valid kalau ada location
    if (currentLevel === "money-child") {
      var currentIsLocation = isLocation(slug);
      if (currentIsLocation) return warnings;  // ← Skip warning, MC = valid
      if (parentLevel === "money-page" || parentLevel === "money-master") return warnings;
    }
    
    // 🔥 PATCH-VALIDATOR-v2: Variant + location = MC = valid
    if (currentLevel === "money-child" && parentLevel === "variant") {
      return warnings;  // ← Valid, karena location override
    }
    
    if (currentLevel === "variant" && parentLevel === "money-child") {
      warnings.push({ type: "SEO_HIERARCHY_MISMATCH", severity: "warning", parentSlug: parentSlug, parentLevel: parentLevel, currentLevel: currentLevel, expectedLevel: "money-page", message: "URL '" + slug + "' = Variant, tapi parent '" + parentSlug + "' = MC." });
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
      warnings.push({ type: "SEO_PARENT_DRIVEN_MISMATCH", severity: "warning", parentSlug: parentSlug, parentLevel: parentLevel, currentLevel: currentLevel, expectedLevel: rule.expected, alternates: rule.alternates || (rule.alternate ? [rule.alternate] : []), message: "URL '" + slug + "' = '" + currentLevel + "'. Parent '" + parentSlug + "' (" + parentLevel + "), expected: " + expectedList.join(" atau ") + "." });
    }
    return warnings;
  }

  // ═══════════════════════════════════════════════════════════
  // 🔥 detectMoneyLevelInternal() — SEO DIMENSION v23.9.8
  // 
  // TERMASUK:
  //   - FIX-HARGA-FOLLOW
  //   - PATCH 4: Blok JASA (compound-aware)
  //   - PATCH 6: Blok SEWA (compound-aware)
  //   - PATCH 9: Blok PRODUK (BARU — compound-aware)
  //   - PATCH 10: Blok MATERIAL (BARU — compound-aware)
  //   - PATCH 11: Blok DESAIN (BARU — compound-aware)
  //   - PATCH 5: Location Override (MC selalu)
  //   - General Logic
  // ═══════════════════════════════════════════════════════════
    function detectMoneyLevelInternal(text, entityType, _skipHargaFollow) {
    var lowerText = text.toLowerCase();

   // 🔥 FIX-SUBPILLAR-STRICT: pakai versi ketat (keyword harus di awal)
    var _earlySubPillar = detectSubPillarStrict(text);
    if (_earlySubPillar) return _earlySubPillar;

    // ═══ FIX-HARGA-FOLLOW ═══
    // ═══ FIX-HARGA-FOLLOW ═══
    if (!_skipHargaFollow) {
      var _hasHargaWord = false;
      for (var _phv = 0; _phv < PRICE_HEAD_WORDS.length; _phv++) {
        if (rx(PRICE_HEAD_WORDS[_phv]).test(lowerText)) {
          _hasHargaWord = true;
          break;
        }
      }
      if (_hasHargaWord) {
        var _textNoHarga = lowerText;
        for (var _phr = 0; _phr < PRICE_HEAD_WORDS.length; _phr++) {
          _textNoHarga = _textNoHarga.replace(rx(PRICE_HEAD_WORDS[_phr], 'g'), ' ');
        }
        _textNoHarga = _textNoHarga.replace(/\s+/g, ' ').trim();
        if (_textNoHarga && _textNoHarga !== lowerText) {
          var _levelNoHarga = detectMoneyLevelInternal(_textNoHarga, entityType, true);
          if (_levelNoHarga) return _levelNoHarga;
        }
      }
    }

    // ═══════════════════════════════════════════════════════════
    // 🔥 PATCH 4: FIX JASA BLOCK (Compound-aware)
    // ═══════════════════════════════════════════════════════════
    if (entityType === "jasa") {
      var _baseListMin = ENTITY_BASE_NAMES.jasa || [];
      var _sortedBaseMin = _baseListMin.slice().sort(function(a, b) {
        return b.split(' ').length - a.split(' ').length;
      });
      var _matchedBaseMin = [];
      for (var _bmi = 0; _bmi < _sortedBaseMin.length; _bmi++) {
        var _bnMin = _sortedBaseMin[_bmi];
        if (!rx(_bnMin).test(lowerText)) continue;
        var _isSubMin = false;
        for (var _mbi2 = 0; _mbi2 < _matchedBaseMin.length; _mbi2++) {
          if (_matchedBaseMin[_mbi2].indexOf(_bnMin) !== -1) {
            _isSubMin = true;
            break;
          }
        }
        if (_isSubMin) continue;
        _matchedBaseMin.push(_bnMin);
      }

      if (_matchedBaseMin.length === 1) {
        var _matchedBase1 = _matchedBaseMin[0];
        var _isAppTargetBase = APPLICATION_TARGETS_FULL.indexOf(_matchedBase1) !== -1;

        var _tempMin = lowerText;
        var _entityOnlyMin = ENTITY_ONLY_WORDS.jasa || [];
        for (var _eoi = 0; _eoi < _entityOnlyMin.length; _eoi++) {
          _tempMin = _tempMin.replace(rx(_entityOnlyMin[_eoi], 'g'), ' ');
        }

        _tempMin = _tempMin.replace(rx(_matchedBase1, 'g'), ' ');
        _tempMin = normalizeCompoundTerms(_tempMin, "jasa");

        _tempMin = _tempMin.replace(/\b(murah|hemat|terjangkau|promo|diskon|obral|termurah|termahal|profesional|bersaing|kompetitif|ekonomis)\b/gi, ' ');
        _tempMin = _tempMin.replace(/\b(borongan|sistem borongan|paket borongan|all in|all-in|proyek|per proyek)\b/gi, ' ');
        _tempMin = _tempMin.replace(/\b(ukuran|spesifikasi|mutu|metode|cara kerja|panduan|fungsi|dimensi|tipe|jenis|varian|model|standar|kapasitas|faktor penentu|faktor utama|penyebab|dampak|pengaruh|efek)\b/gi, ' ');
        
        _tempMin = _tempMin.replace(/\s+/g, ' ').trim();

        var _perUnitPattern = /\bper\s+(?:meter|m|cm|mm|km|inch|inchi|ft|feet|kg|ton|gram|ons|liter|ml|galon|m3|m2|kubik|cc|batang|lembar|keping|papan|roll|titik|unit|buah|set|paket|hari|jam|minggu|bulan|tahun|shift|rit|ritase|tonase|trip|truk|pickup|colt|orang|kali|boks|dus|karung|sak|lot|batch|container|kontainer)\b/gi;
        var _perUnitMatches = _tempMin.match(_perUnitPattern) || [];
        var _perUnitCount = _perUnitMatches.length;
        for (var _pui = 0; _pui < _perUnitMatches.length; _pui++) {
          _tempMin = _tempMin.replace(_perUnitMatches[_pui], ' ');
        }
        _tempMin = _tempMin.replace(/\s+/g, ' ').trim();

        var _sisaMin = _tempMin.split(/\s+/).filter(function(w) { return w.length > 2; });
        var _hasLocMin = isLocation(text);
        var _specCountMin = _sisaMin.length + _perUnitCount;
             
        if (_specCountMin === 0) {
          if (_hasLocMin) {
            // fall through
          } else {
            return "money-master";
          }
        } else if (!_hasLocMin) {
          var _levelMin = decideLevelByLayers(_specCountMin);
          if (_levelMin === "variant" && isSubVariant(text, "jasa")) {
            return "sub-variant";
          }
          return _levelMin;
        }
      }

      if (_matchedBaseMin.length >= 2) {
        var _matchedFiltered = _matchedBaseMin.filter(function(b) {
          if (b === "borongan") return false;
          if (/^borongan\b/i.test(b)) return false;
          return true;
        });

        if (_matchedFiltered.length >= 2) {
          var _hasLocMin2 = isLocation(text);
          var _hasPriceMin2 = checkHasPrice(text);
          var _hasDimMin2 = /\d+\s*(m|mm|cm|meter|kg|ton|inch|inci|ft|feet)/gi.test(lowerText)
            || /\d+\s*[x×]\s*\d+/i.test(lowerText);

          if (!_hasLocMin2 && !_hasPriceMin2 && !_hasDimMin2) {
            return "money-page";
          }
        }
      }
    }

    // ═══════════════════════════════════════════════════════════
    // 🔥 PATCH 6: FIX SEWA BLOCK (Compound-aware)
    // ═══════════════════════════════════════════════════════════
    if (entityType === "sewa") {
      var _baseListSw = ENTITY_BASE_NAMES.sewa || [];
      var _sortedBaseSw = _baseListSw.slice().sort(function(a, b) {
        return b.split(' ').length - a.split(' ').length;
      });
      var _matchedBaseSw = [];
      for (var _bsi = 0; _bsi < _sortedBaseSw.length; _bsi++) {
        var _bnSw = _sortedBaseSw[_bsi];
        if (!rx(_bnSw).test(lowerText)) continue;
        var _isSubSw = false;
        for (var _mbi = 0; _mbi < _matchedBaseSw.length; _mbi++) {
          if (_matchedBaseSw[_mbi].indexOf(_bnSw) !== -1) {
            _isSubSw = true;
            break;
          }
        }
        if (_isSubSw) continue;
        _matchedBaseSw.push(_bnSw);
      }

      if (/\bper\s+(?:meter|m|cm|mm|kg|ton|jam|hari|minggu|bulan|tahun|unit|shift|rit|trip)\b/i.test(lowerText)) {
        return "money-page";
      }

      if (_matchedBaseSw.length === 1) {
        var _tempSw = lowerText;
        var _entityOnlySw = ENTITY_ONLY_WORDS.sewa || [];
        for (var _eos = 0; _eos < _entityOnlySw.length; _eos++) {
          _tempSw = _tempSw.replace(rx(_entityOnlySw[_eos], 'g'), ' ');
        }
        _tempSw = _tempSw.replace(rx(_matchedBaseSw[0], 'g'), ' ');
        _tempSw = normalizeCompoundTerms(_tempSw, "sewa");

        var _durasiNoise = [
          "harian","mingguan","bulanan","tahunan",
          "per jam","per hari","per minggu","per bulan",
          "short term","long term",
          "proyek","project","site","area kerja",
          "industri","komersial","rumahan",
          "residential","commercial","industrial",
          "kecil","sedang","besar","menengah","skala",
          "murah","hemat","terjangkau","promo","diskon","obral",
          "termurah","termahal","bersaing","kompetitif","ekonomis",
          "diesel","bensin","solar","listrik","hidrolik","hydraulic",
          "tambang","pertambangan","basement","banjir","irigasi",
          "kapasitas","pengukuran","mesin",
          "cor","jalan","kolom","balok","plat","lantai","per"
        ];
        for (var _dn = 0; _dn < _durasiNoise.length; _dn++) {
          _tempSw = _tempSw.replace(rx(_durasiNoise[_dn], 'g'), ' ');
        }

        _tempSw = _tempSw.replace(/\s+/g, ' ').trim();
        var _sisaSw = _tempSw.split(/\s+/).filter(function(w) { return w.length > 2; });

        var _specCountSw = 0;
        for (var _ssi = 0; _ssi < _sisaSw.length; _ssi++) {
          if (isSpecModifierForEntity(_sisaSw[_ssi], "sewa")) _specCountSw++;
        }

        if (_sisaSw.length === 0) return "money-master";

        var _sisaIsLocation = false;
        for (var _sli = 0; _sli < _sisaSw.length; _sli++) {
          if (TIER_1_LOCATION.indexOf(_sisaSw[_sli]) !== -1) { _sisaIsLocation = true; break; }
          if (/\b(jakarta|bogor|depok|tangerang|bekasi|bandung|semarang|surabaya|jogja|yogyakarta|malang|medan|palembang|makassar|denpasar|bali)\b/i.test(_sisaSw[_sli])) { _sisaIsLocation = true; break; }
        }

         if (_sisaIsLocation) {
          // fall through
        } else if (_specCountSw === 1 && _sisaSw.length === 1) {
          // 🔥 FIX-SEWA-LAYER: base + 1 spec = money-page
          return "money-page";
        } else if (_specCountSw >= 2 || _sisaSw.length >= 2) {
          // 🔥 FIX-SEWA-LAYER: base + 2 spec = variant
          if (isSubVariant(text, "sewa")) return "sub-variant";
          return "variant";
        } else {
          return "money-page";
        }
      }

      if (_matchedBaseSw.length >= 2) {
        var _isNested = false;
        for (var _ni = 0; _ni < _matchedBaseSw.length; _ni++) {
          for (var _nj = 0; _nj < _matchedBaseSw.length; _nj++) {
            if (_ni === _nj) continue;
            if (_matchedBaseSw[_nj].indexOf(_matchedBaseSw[_ni]) !== -1) { _isNested = true; break; }
          }
          if (_isNested) break;
        }
        var _temp2Sw = lowerText;
        for (var _eos2 = 0; _eos2 < (ENTITY_ONLY_WORDS.sewa || []).length; _eos2++) {
          _temp2Sw = _temp2Sw.replace(rx(ENTITY_ONLY_WORDS.sewa[_eos2], 'g'), ' ');
        }
        _temp2Sw = _temp2Sw.replace(/\b(murah|hemat|terjangkau|promo|diskon|obral|termurah|termahal)\b/gi, ' ');
        _temp2Sw = _temp2Sw.replace(/\s+/g, ' ').trim();

        var _hasLoc2Sw = isLocation(text);
        if (_hasLoc2Sw) {
          // fall through
        } else if (_temp2Sw && _matchedBaseSw.length >= 2 && !_isNested) {
          return "money-page";
        }
      }
    }

    // ═══════════════════════════════════════════════════════════
    // 🔥 PATCH 9: FIX PRODUK BLOCK (Compound-aware) — BARU
    // ═══════════════════════════════════════════════════════════
    if (entityType === "produk") {
      var _baseListPr = ENTITY_BASE_NAMES.produk || [];
      var _sortedBasePr = _baseListPr.slice().sort(function(a, b) {
        return b.split(' ').length - a.split(' ').length;
      });
      var _matchedBasePr = [];
      for (var _bpi = 0; _bpi < _sortedBasePr.length; _bpi++) {
        var _bnPr = _sortedBasePr[_bpi];
        if (!rx(_bnPr).test(lowerText)) continue;
        var _isSubPr = false;
        for (var _mbiPr = 0; _mbiPr < _matchedBasePr.length; _mbiPr++) {
          if (_matchedBasePr[_mbiPr].indexOf(_bnPr) !== -1) {
            _isSubPr = true;
            break;
          }
        }
        if (_isSubPr) continue;
        _matchedBasePr.push(_bnPr);
      }

      if (_matchedBasePr.length === 1) {
        var _matchedBasePr1 = _matchedBasePr[0];

        var _tempPr = lowerText;
        var _entityOnlyPr = ENTITY_ONLY_WORDS.produk || [];
        for (var _eopi = 0; _eopi < _entityOnlyPr.length; _eopi++) {
          _tempPr = _tempPr.replace(rx(_entityOnlyPr[_eopi], 'g'), ' ');
        }

        _tempPr = _tempPr.replace(rx(_matchedBasePr1, 'g'), ' ');
        _tempPr = normalizeCompoundTerms(_tempPr, "produk");

        _tempPr = _tempPr.replace(/\b(murah|hemat|terjangkau|promo|diskon|obral|termurah|termahal|premium|ekonomis|profesional)\b/gi, ' ');
        _tempPr = _tempPr.replace(/\b(ready stock|siap kirim|stok tersedia|fast respon)\b/gi, ' ');
        _tempPr = _tempPr.replace(/\b(ukuran|spesifikasi|mutu|dimensi|tipe|jenis|varian|model|standar|kapasitas|kualitas|harga|biaya)\b/gi, ' ');
        
        _tempPr = _tempPr.replace(/\s+/g, ' ').trim();

        var _perUnitPr = /\bper\s+(?:meter|m|cm|mm|inch|inchi|ft|kg|ton|liter|m3|m2|batang|lembar|keping|roll|titik|unit|buah|set|paket|pcs|piece|boks|dus|lot)\b/gi;
        var _perUnitPrM = _tempPr.match(_perUnitPr) || [];
        var _perUnitPrC = _perUnitPrM.length;
        for (var _pupi = 0; _pupi < _perUnitPrM.length; _pupi++) {
          _tempPr = _tempPr.replace(_perUnitPrM[_pupi], ' ');
        }
        _tempPr = _tempPr.replace(/\s+/g, ' ').trim();

        var _sisaPr = _tempPr.split(/\s+/).filter(function(w) { return w.length > 2; });
        var _hasLocPr = isLocation(text);
        var _specCountPr = _sisaPr.length + _perUnitPrC;

        if (_specCountPr === 0) {
          if (_hasLocPr) {
            // fall through
          } else {
            return "money-master";
          }
        } else if (!_hasLocPr) {
          var _levelPr = decideLevelByLayers(_specCountPr);
          if (_levelPr === "variant" && isSubVariant(text, "produk")) {
            return "sub-variant";
          }
          return _levelPr;
        }
      }

      if (_matchedBasePr.length >= 2) {
        var _isNestedPr = false;
        for (var _npi = 0; _npi < _matchedBasePr.length; _npi++) {
          for (var _npj = 0; _npj < _matchedBasePr.length; _npj++) {
            if (_npi === _npj) continue;
            if (_matchedBasePr[_npj].indexOf(_matchedBasePr[_npi]) !== -1) { _isNestedPr = true; break; }
          }
          if (_isNestedPr) break;
        }
        
        if (!_isNestedPr) {
          var _hasLocPr2 = isLocation(text);
          var _hasPricePr2 = checkHasPrice(text);
          var _hasDimPr2 = /\d+\s*(m|mm|cm|meter|kg|ton|inch|inci|ft)/gi.test(lowerText)
            || /\d+\s*[x×]\s*\d+/i.test(lowerText);

          if (!_hasLocPr2 && !_hasPricePr2 && !_hasDimPr2) {
            return "money-page";
          }
        }
      }
    }

    // ═══════════════════════════════════════════════════════════
    // 🔥 PATCH 10: FIX MATERIAL BLOCK (Compound-aware) — BARU
    // ═══════════════════════════════════════════════════════════
    if (entityType === "material") {
      var _baseListMt = ENTITY_BASE_NAMES.material || [];
      var _sortedBaseMt = _baseListMt.slice().sort(function(a, b) {
        return b.split(' ').length - a.split(' ').length;
      });
      var _matchedBaseMt = [];
      for (var _bmiMt = 0; _bmiMt < _sortedBaseMt.length; _bmiMt++) {
        var _bnMt = _sortedBaseMt[_bmiMt];
        if (!rx(_bnMt).test(lowerText)) continue;
        var _isSubMt = false;
        for (var _mbiMt = 0; _mbiMt < _matchedBaseMt.length; _mbiMt++) {
          if (_matchedBaseMt[_mbiMt].indexOf(_bnMt) !== -1) {
            _isSubMt = true;
            break;
          }
        }
        if (_isSubMt) continue;
        _matchedBaseMt.push(_bnMt);
      }

      if (_matchedBaseMt.length === 1) {
        var _matchedBaseMt1 = _matchedBaseMt[0];

        var _tempMt = lowerText;
        var _entityOnlyMt = ENTITY_ONLY_WORDS.material || [];
        for (var _eomt = 0; _eomt < _entityOnlyMt.length; _eomt++) {
          _tempMt = _tempMt.replace(rx(_entityOnlyMt[_eomt], 'g'), ' ');
        }

        _tempMt = _tempMt.replace(rx(_matchedBaseMt1, 'g'), ' ');
        _tempMt = normalizeCompoundTerms(_tempMt, "material");

        _tempMt = _tempMt.replace(/\b(murah|hemat|terjangkau|promo|diskon|obral|termurah|termahal|premium|ekonomis|bersaing|kompetitif)\b/gi, ' ');
        _tempMt = _tempMt.replace(/\b(ukuran|spesifikasi|mutu|dimensi|tipe|jenis|varian|model|standar|kualitas|harga|biaya|grade|kelas)\b/gi, ' ');
        
        _tempMt = _tempMt.replace(/\s+/g, ' ').trim();

        var _perUnitMt = /\bper\s+(?:meter|m|cm|mm|kg|ton|liter|m3|m2|batang|lembar|keping|roll|sak|karung|kubik|zak)\b/gi;
        var _perUnitMtM = _tempMt.match(_perUnitMt) || [];
        var _perUnitMtC = _perUnitMtM.length;
        for (var _pumt = 0; _pumt < _perUnitMtM.length; _pumt++) {
          _tempMt = _tempMt.replace(_perUnitMtM[_pumt], ' ');
        }
        _tempMt = _tempMt.replace(/\s+/g, ' ').trim();

        var _sisaMt = _tempMt.split(/\s+/).filter(function(w) { return w.length > 2; });
        var _hasLocMt = isLocation(text);
        var _specCountMt = _sisaMt.length + _perUnitMtC;

        if (_specCountMt === 0) {
          if (_hasLocMt) {
            // fall through
          } else {
            return "money-master";
          }
        } else if (!_hasLocMt) {
          var _levelMt = decideLevelByLayers(_specCountMt);
          if (_levelMt === "variant" && isSubVariant(text, "material")) {
            return "sub-variant";
          }
          return _levelMt;
        }
      }

      if (_matchedBaseMt.length >= 2) {
        var _isNestedMt = false;
        for (var _nmi = 0; _nmi < _matchedBaseMt.length; _nmi++) {
          for (var _nmj = 0; _nmj < _matchedBaseMt.length; _nmj++) {
            if (_nmi === _nmj) continue;
            if (_matchedBaseMt[_nmj].indexOf(_matchedBaseMt[_nmi]) !== -1) { _isNestedMt = true; break; }
          }
          if (_isNestedMt) break;
        }
        
        if (!_isNestedMt) {
          var _hasLocMt2 = isLocation(text);
          var _hasPriceMt2 = checkHasPrice(text);
          var _hasDimMt2 = /\d+\s*(m|mm|cm|kg|ton|inch|inci)/gi.test(lowerText)
            || /\d+\s*[x×]\s*\d+/i.test(lowerText);

          if (!_hasLocMt2 && !_hasPriceMt2 && !_hasDimMt2) {
            return "money-page";
          }
        }
      }
    }

    // ═══════════════════════════════════════════════════════════
    // 🔥 PATCH 11: FIX DESAIN BLOCK (Compound-aware) — BARU
    // ═══════════════════════════════════════════════════════════
    if (entityType === "desain") {
      var _baseListDs = ENTITY_BASE_NAMES.desain || [];
      var _sortedBaseDs = _baseListDs.slice().sort(function(a, b) {
        return b.split(' ').length - a.split(' ').length;
      });
      var _matchedBaseDs = [];
      for (var _bdiDs = 0; _bdiDs < _sortedBaseDs.length; _bdiDs++) {
        var _bnDs = _sortedBaseDs[_bdiDs];
        if (!rx(_bnDs).test(lowerText)) continue;
        var _isSubDs = false;
        for (var _mbiDs = 0; _mbiDs < _matchedBaseDs.length; _mbiDs++) {
          if (_matchedBaseDs[_mbiDs].indexOf(_bnDs) !== -1) {
            _isSubDs = true;
            break;
          }
        }
        if (_isSubDs) continue;
        _matchedBaseDs.push(_bnDs);
      }

      if (_matchedBaseDs.length === 1) {
        var _matchedBaseDs1 = _matchedBaseDs[0];

                var _tempDs = lowerText;
        // 🔥 FIX-DESAIN-STRIP: strip base DULU, baru entity-only
        _tempDs = _tempDs.replace(rx(_matchedBaseDs1, 'g'), ' ');
        var _entityOnlyDs = ENTITY_ONLY_WORDS.desain || [];
        for (var _eods = 0; _eods < _entityOnlyDs.length; _eods++) {
          _tempDs = _tempDs.replace(rx(_entityOnlyDs[_eods], 'g'), ' ');
        }
        _tempDs = normalizeCompoundTerms(_tempDs, "desain");

        _tempDs = _tempDs.replace(/\b(murah|hemat|terjangkau|promo|diskon|obral|termurah|termahal|premium|mewah|eksklusif|luxury|high end)\b/gi, ' ');
        _tempDs = _tempDs.replace(/\b(ukuran|spesifikasi|tipe|jenis|varian|model|standar|kualitas|harga|biaya|konsep|gaya|desain)\b/gi, ' ');
        
        _tempDs = _tempDs.replace(/\s+/g, ' ').trim();

        var _sisaDs = _tempDs.split(/\s+/).filter(function(w) { return w.length > 2; });
        var _hasLocDs = isLocation(text);

        var _ROOM_CTX_DS = ["rumah","kantor","toko","hotel","restoran","cafe","villa","apartemen",
                            "ruko","kios","gudang","klinik","sekolah","mall","spa","salon",
                            "bar","lounge","butik","showroom","minimarket"];
        var _roomCountDs = 0;
        for (var _rci = 0; _rci < _sisaDs.length; _rci++) {
          if (_ROOM_CTX_DS.indexOf(_sisaDs[_rci]) !== -1) _roomCountDs++;
        }

        var _specCountDs = _sisaDs.length;

        if (_specCountDs === 0) {
          if (_hasLocDs) {
            // fall through
          } else {
            return "money-master";
          }
        } else if (!_hasLocDs) {
          var _levelDs = decideLevelByLayers(_specCountDs);
          if (_levelDs === "variant" && isSubVariant(text, "desain")) {
            return "sub-variant";
          }
          return _levelDs;
        }
      }

      if (_matchedBaseDs.length >= 2) {
        var _isNestedDs = false;
        for (var _ndi = 0; _ndi < _matchedBaseDs.length; _ndi++) {
          for (var _ndj = 0; _ndj < _matchedBaseDs.length; _ndj++) {
            if (_ndi === _ndj) continue;
            if (_matchedBaseDs[_ndj].indexOf(_matchedBaseDs[_ndi]) !== -1) { _isNestedDs = true; break; }
          }
          if (_isNestedDs) break;
        }
        
        if (!_isNestedDs) {
          var _hasLocDs2 = isLocation(text);
          var _hasPriceDs2 = checkHasPrice(text);

          if (!_hasLocDs2 && !_hasPriceDs2) {
            return "money-page";
          }
        }
      }
    }

    // ═══ GENERAL LOGIC ═══
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
    // (sub-pillar sudah dicek di atas — FIX-SUBPILLAR-STRICT)
    // Fallback: kalau lewat general logic, cek strict lagi
    var subPillar = detectSubPillarStrict(text);
    if (subPillar) return subPillar;

    // ═══════════════════════════════════════════════════════════
    // 🔥 PATCH 5: LOCATION OVERRIDE
    // Lokasi SELALU jadi MC, apapun parent-nya
    // ═══════════════════════════════════════════════════════════
    if (hasLocationWord) {
      var _hasAnyBaseName = false;
      if (!hasBaseService && entityType && ENTITY_BASE_NAMES[entityType]) {
        var _baseListMC = ENTITY_BASE_NAMES[entityType];
        for (var _bmc = 0; _bmc < _baseListMC.length; _bmc++) {
          if (rx(_baseListMC[_bmc]).test(lowerText)) { _hasAnyBaseName = true; break; }
        }
      }
      
      if (hasBaseService || _hasAnyBaseName) {
        // 🔥 PATCH-LOCATION-v2: Lokasi SELALU MC
        return "money-child";
      }
    }

    // ═══ GENERAL LOGIC LANJUTAN ═══
    if (hasSpecPhrase && !hasLocationWord && !hasCommercialWord) return "money-page";

    if (hasPerUnit && !hasPriceWord && !hasCommercialWord && !hasLocationWord && !hasSpecPhrase) return "money-page";

    if (hasCompound && !hasLocationWord && !hasCommercialWord) return "money-page";

    if (complexityScore >= 3 && !hasLocationWord && !hasCommercialWord && !hasPriceWord) return "money-page";

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
              if (text.indexOf(baseName186) !== -1) { isMaterialInBase = true; break; }
            }
          }
          if (isMaterialInBase) break;
        }
        if (!isMaterialInBase) jasaMaterialCtx186 = true;
      }
    }

    var hasStrongPromo211 = false;
    if (_MASTER.highVolume && _MASTER.highVolume.test(lowerText)) hasStrongPromo211 = true;

    var skipP7Atau = false;
    if (/\batau\b/i.test(lowerText)) {
      var partsAtau = lowerText.split(/\batau\b/);
      var leftAtau = (partsAtau[0] || "").trim().split(/\s+/).filter(Boolean);
      var rightAtau = (partsAtau[1] || "").trim().split(/\s+/).filter(Boolean);
      if (leftAtau.length <= 1 || rightAtau.length <= 1) skipP7Atau = true;
    }

    var earlyLayers = 0;
    if (!hasPriceWord && !hasCommercialWord && !hasLocationWord && !hasStrongPromo211 && !skipP7Atau) {
      earlyLayers = _memoCountModifierLayers
        ? _memoCountModifierLayers(text, entityType)
        : countModifierLayers(text, entityType);
    }

    if (entityType !== "artikel"
        && (hasSpecWord || jasaMaterialCtx186 || earlyLayers > 0)
        && !hasPriceWord && !hasCommercialWord && !hasLocationWord
        && !hasStrongPromo211 && !skipP7Atau) {
      var layers186 = earlyLayers;
      if (layers186 === 0 && jasaMaterialCtx186) layers186 = 1;
      if (layers186 > 0) return decideLevelByLayers(layers186);
    }

    if (hasCommercialWord && hasSpecWord && !hasLocationWord) {
      var layersP8 = _memoCountModifierLayers
        ? _memoCountModifierLayers(text, entityType)
        : countModifierLayers(text, entityType);
      if (layersP8 >= 1) return decideLevelByLayers(layersP8);
      return "money-page";
    }

    if (hasPriceWord && entityType === "desain" && !hasLocationWord && !hasCommercialWord && !hasSpecWord) {
      _buildMasterRegexes();
      if (_MASTER.appTargets) {
        for (var mwt8 = 0; mwt8 < APPLICATION_TARGETS_FULL.length; mwt8++) {
          var mwt8w = APPLICATION_TARGETS_FULL[mwt8];
          if (mwt8w.indexOf(' ') !== -1 && rx(mwt8w).test(lowerText)) return "money-page";
        }
      }
    }

    if (hasPriceWord && hasBaseService && !hasSpecWord && !hasCommercialWord && !hasLocationWord) {
      var preCore = _memoGetCoreWords
        ? _memoGetCoreWords(text, entityType)
        : getCoreWords(text, entityType);

      if (preCore.length === 0) return "money-master";

      if (preCore.length === 1) {
        var coreWord = preCore[0];
        var isPartOfBaseName = false;
        var checkBaseList = ENTITY_BASE_NAMES[entityType] || [];
        for (var cb = 0; cb < checkBaseList.length; cb++) {
          var cbName = checkBaseList[cb];
          if (rx(cbName).test(text)) {
            if (cbName.indexOf(coreWord) !== -1) { isPartOfBaseName = true; break; }
          }
        }

        if (isPartOfBaseName && hasPriceWord) {
          var _bnCountP = 0;
          var _baseListP = ENTITY_BASE_NAMES[entityType] || [];
          for (var _bpi = 0; _bpi < _baseListP.length; _bpi++) {
            if (rx(_baseListP[_bpi]).test(lowerText)) _bnCountP++;
          }
          if (_bnCountP >= 2) return "money-page";
          return "money-master";
        }

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

        if (isSpecModifierForEntity(coreWord, entityType)) return "money-page";

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
            if (isMatInBase204) return "money-master";
            return "money-page";
          }
        }
        return "money-master";
      }
      return "money-page";
    }

    if (hasPriceWord && hasSpecWord && !hasLocationWord && !hasCommercialWord) {
      var layersP9 = _memoCountModifierLayers
        ? _memoCountModifierLayers(text, entityType)
        : countModifierLayers(text, entityType);
      if (layersP9 >= 1) return decideLevelByLayers(layersP9);

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
            if (!isRoomCtx9) return "money-page";
          }
        }
      }

      var isPureTechForPrice = _memoCheckPureTechnicalSpec
        ? _memoCheckPureTechnicalSpec(text, entityType)
        : checkPureTechnicalSpec(text, entityType);
      if (isPureTechForPrice) return "money-page";
      return "money-master";
    }

    if (hasPriceWord && hasPerUnit && !hasLocationWord && !hasCommercialWord && !hasSpecWord) return "money-page";
    if (hasPriceWord && hasPerUnit && hasSpecWord && !hasLocationWord && !hasCommercialWord) return "money-page";

    if (hasCommercialWord && !hasLocationWord) {
      if (hasPriceWord && !hasSpecWord) return "money-master";
      return "money-page";
    }

    var hasHighVolume = false;
    if (_MASTER.highVolume && _MASTER.highVolume.test(lowerText)) hasHighVolume = true;

    if (hasHighVolume && !hasLocationWord) {
      var layers215 = _memoCountModifierLayers
        ? _memoCountModifierLayers(text, entityType)
        : countModifierLayers(text, entityType);
      if (layers215 > 0) return decideLevelByLayers(layers215);
      var hasNoun215 = /\b(jasa|layanan|produk|material|pondasi|tiang|pancang|pagar|panel|beton|baja|besi|kayu|batu|keramik|granit|marmer|plafon|gypsum|kanopi|paving|readymix|cor|sewa|rental|alat|mesin|bangunan|konstruksi)\b/i.test(lowerText);
      if (hasNoun215 || hasSpecWord) return "money-page";
    }

    var hasDanConj = /\b(dan|serta)\b/i.test(lowerText);
    var isDanBaseNamePart = /\bcut and fill\b/i.test(lowerText);
    if (hasDanConj && !isDanBaseNamePart && !hasLocationWord && !hasCommercialWord && !hasPriceWord) {
      var coreForDan = _memoGetCoreWords
        ? _memoGetCoreWords(text, entityType)
        : getCoreWords(text, entityType);
      if (coreForDan.length >= 2) return "money-page";
    }

    var coreWords = _memoGetCoreWords
      ? _memoGetCoreWords(text, entityType)
      : getCoreWords(text, entityType);

    if (entityType === "artikel") {
      if (!hasPriceWord && !hasCommercialWord && !hasCompound && complexityScore < 3) return "money-master";
    }

    var residualLayers = _memoCountModifierLayers
      ? _memoCountModifierLayers(text, entityType)
      : countModifierLayers(text, entityType);

    if (coreWords.length === 0 && residualLayers === 0
        && !hasPriceWord && !hasCommercialWord && !hasLocationWord && !hasCompound) {
      return "money-master";
    }

    if (coreWords.length <= 2) {
      if (entityType === "jasa" && coreWords.length === 1 && complexityScore <= 2
          && !hasPriceWord && !hasCommercialWord && !hasCompound) {
        if (APPLICATION_TARGETS.indexOf(coreWords[0]) !== -1) return "money-page";
        if (isSpecModifierForEntity(coreWords[0], "jasa")) return "money-page";
        return "money-master";
      }
      if (residualLayers > 0 && !hasLocationWord && !hasCommercialWord) return decideLevelByLayers(residualLayers);
      if (complexityScore >= 2 && !hasPriceWord && !hasCommercialWord) return "money-page";
      return "money-master";
    } else {
      if (residualLayers > 0) return decideLevelByLayers(residualLayers);
      return "money-page";
    }
  }

  // ═══ END STAGE 4/6 — LANJUT STAGE 5/6 ═══

  // ═══════════════════════════════════════════════════════════
  // DETECT PAGE LEVEL (main)
  // ═══════════════════════════════════════════════════════════

  function detectPageLevel(userOptions) {
    if (isHomePage()) return "home";
    var text = getPageText();
    var entityType = detectEntityType(userOptions && userOptions.userEntityType);
    if (detectPillar(text, entityType)) return "pillar";
    var level = detectMoneyLevelInternal(text, entityType);
    if (!level) level = "money-page";
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
    var urlIsGeneric = /^(blog|post|artikel|produk|layanan|service|item|page|p|home|index|\d+)(\s+\d+)?\s*$/i.test(urlText.trim());
    var text;
    if (urlIsGeneric || !urlText || urlText.length < 3) {
      var h1Text = getH1Text();
      if (h1Text && h1Text.length > 3) text = h1Text;
      else text = urlText;
    } else {
      text = urlText;
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

  function detectForPromptFull(input, entityType, domain) {
    if (!input) {
      return { pageLevel: 'unknown', isValid: false, error: 'Input kosong', upward: [], breadcrumbs: [], seoWarnings: [], _heavyWarningsPending: false };
    }
    var slug = extractSlugFromInput(input);
    if (!slug) {
      return { pageLevel: 'unknown', isValid: false, error: 'Slug kosong', upward: [], breadcrumbs: [], seoWarnings: [], _heavyWarningsPending: false };
    }
    var entity = entityType || detectEntityTypeFromText(slug);
    var level = detectPageLevelForPrompt(slug, entity);
    var factors = getFactors(slug, entity);
    var upwardData = detectUpwardFromSlug(slug, domain);
    var parents = detectParentLevelFromSlug(slug, entity, domain);

    var lightWarnings = _computeLightWarnings(slug, level, entity);

    var _result = {
      pageLevel: level, entityType: entity, factors: factors, text: slug,
      levelNum: TYPE_LEVEL_MAP[level] || -1,
      isValid: VALID_LEVELS.indexOf(level) !== -1,
      upward: upwardData.upward, breadcrumbs: upwardData.breadcrumbs, parents: parents,
      seoWarnings: lightWarnings.slice(),
      _heavyWarningsPending: false,
      _lightWarningCount: lightWarnings.length,
      _heavyWarningCount: 0
    };

    if (_DEVICE.lowEnd) {
      _result._heavyWarningsPending = true;
      runWhenIdle(function() {
        var heavy = _computeHeavyWarnings(slug, entity);
        for (var i = 0; i < heavy.length; i++) _result.seoWarnings.push(heavy[i]);
        _result._heavyWarningCount = heavy.length;
        _result._heavyWarningsPending = false;
      }, CONFIG.HEAVY_WARNING_IDLE_TIMEOUT);
    } else {
      var heavy = _computeHeavyWarnings(slug, entity);
      for (var i = 0; i < heavy.length; i++) _result.seoWarnings.push(heavy[i]);
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
      pageLevel: level, entityType: entity, factors: factors, text: slug,
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
        for (var i = 0; i < heavy.length; i++) _result.seoWarnings.push(heavy[i]);
        _result._heavyWarningCount = heavy.length;
        _result._heavyWarningsPending = false;
      }, CONFIG.HEAVY_WARNING_IDLE_TIMEOUT);
    } else {
      var heavy = _computeHeavyWarnings(slug, entity);
      for (var i = 0; i < heavy.length; i++) _result.seoWarnings.push(heavy[i]);
      _result._heavyWarningCount = heavy.length;
    }
    return _result;
  }

  function detectForPromptSync(input, entityType) { return detectForPrompt(input, entityType); }
  function detectForPromptWithUpward(input, entityType, domain) { return detectForPromptFull(input, entityType, domain); }
  function detectBreadcrumbsFromSlug(slug, domain) { return detectUpwardFromSlug(slug, domain).breadcrumbs; }
  function detectParentFromSlug(slug, domain) { return detectUpwardFromSlug(slug, domain).upward; }

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
      // 🔥 FIX-CONTENT-FOCUS-v2: H1 diawali kata harga → langsung HARGA
      var h1Lower = (h1Raw || '').toLowerCase().trim();
      if (/^(harga|biaya|tarif|estimasi|ongkos|budget)\b/i.test(h1Lower)) {
        log('💵 H1 diawali harga → HARGA (override GABUNG)', 'HARGA');
        return 'HARGA';
      }

      // 🔥 FIX-GABUNG-v1: cek GABUNG dulu (info + harga/commercial)
      var _hasInfoSignal = hasInfoSpecPhrase;
      var _hasPriceSignal = hasPriceTableInDOM || hasPriceInText || hasYearInH1 || hasYearInUrl;
      var _hasCommSignal = hasCommercial;
      
      // GABUNG = info + (harga ATAU commercial)
      if (_hasInfoSignal && (_hasPriceSignal || _hasCommSignal)) {
        return 'GABUNG';
      }
      // Info only
      if (_hasInfoSignal && !_hasPriceSignal && !_hasCommSignal) {
        return 'INFORMASI';
      }
      // Harga (tabel atau text)
      if (_hasPriceSignal) {
        return 'HARGA';
      }
      // Commercial only
      if (_hasCommSignal) {
        return 'COMMERCIAL';
      }
      // Default
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
    return document.body.getAttribute('data-entity-sub-type') || null;
  }

   /* ═══════════════════════════════════════════════════════════
     🔥 detectSchemaType() — REVISI v23.9.10 (SEO 2026 ENTITY-AWARE)
     
     PERUBAHAN dari v23.9.9:
     🩹 FIX-PLD-SCHEMA-1: JASA/SEWA money → secondary 'Product' → 'FAQPage'
        - Sebelumnya: 'Product' misleading → Universal bikin Product PrecastProduct (SALAH)
        - Sekarang: 'FAQPage' akurat → jasa money biasanya punya seksi FAQ
     
     🩹 FIX-PLD-SCHEMA-2: PRODUK/MATERIAL money commercial → secondary 'Service' → 'FAQPage'
        - Sebelumnya: 'Service' tidak dikonsumsi Product v5.7d → dead hint
        - Sekarang: 'FAQPage' konsisten + bisa di-consume di masa depan
     
     🩹 FIX-PLD-SCHEMA-3: FALLBACK money commercial → secondary 'Service' → 'FAQPage'
        - Defensive consistency — sinkron dengan fix 1 & 2
     
     ✅ TIDAK BERUBAH dari v23.9.9:
     - entityType SEKARANG DIPAKAI (sebelumnya di-ignore = bug)
     - JASA/SEWA → Service sebagai primary
     - PRODUK/MATERIAL → Product sebagai primary
     - DESAIN → Service + CreativeWork
     - ARTIKEL → Article
     - contentFocus memengaruhi note (with-offers, with-areaServed)
     - Secondary schema tetap relevan (FAQPage / TechArticle / CreativeWork)
     
     PRINSIP SEO 2026:
     - Schema harus match ENTITY + CONTENT, bukan hanya LEVEL
     - Service = halaman yang menawarkan jasa
     - Product = halaman yang menawarkan barang/material
     - Article = halaman informasional
     - FAQPage / TechArticle / CreativeWork = pelengkap (secondary)
     ═══════════════════════════════════════════════════════════ */
    function detectSchemaType(level, entityType, contentFocus) {
    // 🩹 FIX-TERTIARY (v23.9.10 patch — versi tidak diubah):
    //    Tambah `tertiary` field untuk GABUNG
    var primary   = 'WebPage';
    var secondary = '';
    var tertiary  = '';   // 🩹 FIX-TERTIARY: NEW
    var note      = '';

    // ─── Klasifikasi level ───
    var isEvergreen  = ['pillar', 'sub-pillar-tipe-1', 'sub-pillar-tipe-2'].indexOf(level) !== -1;
    var isMoneyLevel = ['money-master', 'money-page', 'money-child'].indexOf(level) !== -1;
    var isVariant    = ['variant', 'sub-variant'].indexOf(level) !== -1;

    // ─── Klasifikasi content focus ───
    var isCommercial = (contentFocus === 'HARGA' ||
                        contentFocus === 'COMMERCIAL' ||
                        contentFocus === 'GABUNG');
    var isInfoOnly   = (contentFocus === 'INFORMASI');
    // 🩹 FIX-TERTIARY: flag eksplisit GABUNG
    var isGabungFocus = (contentFocus === 'GABUNG');

    // ─── Klasifikasi entity ───
    var isServiceEntity  = (entityType === 'jasa' || entityType === 'sewa');
    var isProductEntity  = (entityType === 'produk' || entityType === 'material');
    var isDesignEntity   = (entityType === 'desain');
    var isArticleEntity  = (entityType === 'artikel');

    // ═══════════════════════════════════════════════════════════
// 1) JASA / SEWA → Service untuk money/variant, ARTICLE untuk pillar
// 🩹 FIX-EVERGREEN-ARTICLE: pillar/sub-pillar = halaman informasional
//    → primary harus Article, bukan Service
// ═══════════════════════════════════════════════════════════
if (isServiceEntity) {
       if (isEvergreen) {
           primary   = 'Article';           // ← dari 'Service'
           secondary = 'FAQPage';
           note      = 'evergreen-article'; // ← dari 'evergreen-service'
       } else if (isVariant) {
        primary   = 'Service';
        secondary = 'TechArticle';
        if (isCommercial) {
          note = 'with-offers';
        } else {
          note = 'without-offers';
        }
      } else if (isMoneyLevel) {
        primary   = 'Service';
        secondary = 'FAQPage';
        // 🩹 FIX-TERTIARY: GABUNG → tambah Article sebagai tertiary
        if (isGabungFocus) {
          tertiary = 'Article';
        }
        if (level === 'money-child') {
          note = 'with-areaServed';
        }
        if (isCommercial) {
          note = note ? (note + ',with-offers') : 'with-offers';
        }
      } else {
        primary   = 'Service';
        secondary = 'FAQPage';
      }
    }

 else if (isDesignEntity) {
     if (isEvergreen) {
           primary   = 'Article';           // ← dari 'Service'
           secondary = 'FAQPage';
           note      = 'evergreen-article'; // ← dari 'design-service'
      } else if (isVariant) {
        primary   = 'Service';
        secondary = 'CreativeWork';
        note      = 'design-portfolio';
      } else if (isMoneyLevel) {
        primary   = 'Service';
        secondary = 'CreativeWork';
        // 🩹 FIX-TERTIARY: GABUNG → tambah Article sebagai tertiary
        if (isGabungFocus) {
          tertiary = 'Article';
        }
        if (level === 'money-child') {
          note = 'with-areaServed';
        }
        if (isCommercial) {
          note = note ? (note + ',with-offers') : 'with-offers';
        }
      } else {
        primary   = 'Service';
        secondary = 'FAQPage';
      }
    }

    // ═══════════════════════════════════════════════════════════
    // 3) PRODUK / MATERIAL → Product sebagai primary
    // ═══════════════════════════════════════════════════════════
    else if (isProductEntity) {
      if (isEvergreen) {
        primary   = 'Article';
        secondary = 'FAQPage';
        note      = 'product-pillar';
      } else if (isVariant) {
        primary   = 'Product';
        secondary = 'TechArticle';
        note      = 'without-offers';
      } else if (isMoneyLevel) {
        if (isCommercial) {
          primary   = 'Product';
          secondary = 'FAQPage';
          // 🩹 FIX-TERTIARY: GABUNG → tambah Article sebagai tertiary
          if (isGabungFocus) {
            tertiary = 'Article';
          }
          if (level === 'money-child') {
            note = 'with-areaServed';
          }
          note = note ? (note + ',with-offers') : 'with-offers';
        } else if (isInfoOnly) {
          primary   = 'Article';
          secondary = 'FAQPage';
        } else {
          primary   = 'Product';
          secondary = 'FAQPage';
        }
      } else {
        primary   = 'Product';
        secondary = 'FAQPage';
      }
    }

    // ═══════════════════════════════════════════════════════════
    // 4) ARTIKEL → Article sebagai primary
    // ═══════════════════════════════════════════════════════════
    else if (isArticleEntity) {
      primary   = 'Article';
      secondary = 'FAQPage';
      note      = 'informational';
    }

    // ═══════════════════════════════════════════════════════════
    // 5) FALLBACK — entity tidak dikenal
    // ═══════════════════════════════════════════════════════════
    else {
      if (isEvergreen) {
        primary   = 'Article';
        secondary = 'FAQPage';
      } else if (isVariant) {
        primary   = 'Product';
        secondary = 'TechArticle';
        note      = 'without-offers';
      } else if (isMoneyLevel) {
        if (isCommercial) {
          primary   = 'Product';
          secondary = 'FAQPage';
          // 🩹 FIX-TERTIARY: GABUNG → tambah Article sebagai tertiary
          if (isGabungFocus) {
            tertiary = 'Article';
          }
        } else {
          primary   = 'Article';
          secondary = 'FAQPage';
        }
      } else {
        primary   = 'WebPage';
      }
    }

    // ─── Log (kalau DEBUG aktif) ───
    // 🩹 FIX-TERTIARY: tampilkan tertiary di log
    if (CONFIG.DEBUG) {
      log('🔗 detectSchemaType: level=' + level +
          ', entity=' + entityType +
          ', focus=' + contentFocus +
          ' → primary=' + primary +
          ', secondary=' + secondary +
          (tertiary ? ', tertiary=' + tertiary : '') +
          (note ? ', note=' + note : ''), 'SCHEMA');
    }

    // 🩹 FIX-TERTIARY: return tertiary juga
    return { primary: primary, secondary: secondary, tertiary: tertiary, note: note };
  }
       
  /* ═══════════════════════════════════════════════════════════
     🔥 detectCtaType() — REVISI v23.9.9 (ENTITY-AWARE)
     
     PERUBAHAN dari v23.9.8:
     ✅ entityType ditambahkan sebagai parameter ke-3
     ✅ JASA/SEWA/DESAIN → CTA "Konsultasi" (bukan "Pesan")
     ✅ PRODUK/MATERIAL   → CTA "Pesan" (beli barang)
     ✅ ARTIKEL/lain      → CTA "Baca" (soft)
     ✅ Type (hard/medium/soft) tetap sesuai content focus
     
     OUTPUT:
     - type : 'hard' | 'medium' | 'soft'
     - text : teks tombol CTA
     
     DIPAKAI UNTUK:
     - data-cta-type  → styling tombol (CSS)
     - data-cta-text  → label tombol (UI)
     ═══════════════════════════════════════════════════════════ */
  function detectCtaType(level, contentFocus, entityType) {
    var isMoneyLevel = ['money-master', 'money-page', 'money-child'].indexOf(level) !== -1;
    var isService    = (entityType === 'jasa' || entityType === 'sewa' || entityType === 'desain');
    var isProduct    = (entityType === 'produk' || entityType === 'material');
    var isCommercial = (contentFocus === 'HARGA' ||
                        contentFocus === 'COMMERCIAL' ||
                        contentFocus === 'GABUNG');

    // ─── SERVICE (jasa / sewa / desain) ───
    if (isService) {
      if (isCommercial) return { type: 'hard',   text: 'Konsultasi Gratis' };
      if (isMoneyLevel) return { type: 'medium', text: 'Hubungi Kami' };
      return                   { type: 'medium', text: 'Konsultasi Sekarang' };
    }

    // ─── PRODUCT (produk / material) ───
    if (isProduct) {
      if (isCommercial) return { type: 'hard',   text: 'Pesan Sekarang' };
      if (isMoneyLevel) return { type: 'medium', text: 'Tanya Harga' };
      return                   { type: 'soft',   text: 'Lihat Detail' };
    }

    // ─── ARTIKEL / LAIN ───
    if (isMoneyLevel) return { type: 'medium', text: 'Baca Selengkapnya' };
    return                   { type: 'soft',   text: 'Baca Selengkapnya' };
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
    if (_SCHEMA_ATTRS_SET) return;
    _SCHEMA_ATTRS_SET = true;
    try {
      // ─── Level ───
      document.body.setAttribute("data-page-level", level);
      document.body.setAttribute("data-page-level-num", String(TYPE_LEVEL_MAP[level] || '0'));

      // ─── Entity Type ───
      var entityType = detectEntityType();
      if (!entityType) {
        var h1Text = getH1Text();
        entityType = detectEntityTypeFromText(h1Text);
      }
      document.body.setAttribute("data-entity-type", entityType || '');

      // ─── Jasa Sub-Category ───
      if (entityType === "jasa") {
        var subCat = detectJasaSubCategory(getPageText() + " " + getH1Text(), "jasa");
        document.body.setAttribute("data-jasa-sub-category", subCat || 'default');
      }

      // ─── Content Focus ───
      var contentFocus = detectContentFocus(level, entityType);
      document.body.setAttribute("data-content-focus", contentFocus);

      // ─── Kategori & H1 Pattern ───
      var kategori = detectKategori(contentFocus);
      document.body.setAttribute("data-kategori", kategori);
      document.body.setAttribute("data-h1-pattern", detectH1Pattern(kategori));

      // ─── Entity Sub-Type ───
      var entitySubType = detectEntitySubType(level, entityType);
      document.body.setAttribute("data-entity-sub-type", entitySubType || '');

      // ═══════════════════════════════════════════════════════
      // 🔥 SCHEMA TYPE — entity-aware + content-aware (SEO 2026)
      // ═══════════════════════════════════════════════════════
      var schemaType = detectSchemaType(level, entityType, contentFocus);
      document.body.setAttribute("data-schema-type-primary",   schemaType.primary   || '');
      document.body.setAttribute("data-schema-type-secondary", schemaType.secondary || '');

      // 🩹 FIX-TERTIARY (v23.9.10 patch): set tertiary — dipakai Article v8.7
      //    untuk detect GABUNG secara eksplisit (tertiary='Article')
      document.body.setAttribute("data-schema-type-tertiary",  schemaType.tertiary  || '');

      // 🔥 FIX-WAJIB: set note — dipakai Auto Schema untuk
      //    keputusan offers / areaServed / without-offers
      document.body.setAttribute("data-schema-type-note", schemaType.note || '');
      // ═══════════════════════════════════════════════════════
      // 🔥 CTA TYPE — entity-aware
      // ═══════════════════════════════════════════════════════
      var ctaType = detectCtaType(level, contentFocus, entityType);
      document.body.setAttribute("data-cta-type", ctaType.type);
      document.body.setAttribute("data-cta-text", ctaType.text);

      // ─── Product Category & Material ───
      var productCategory = detectProductCategoryFromPLD(entityType, entitySubType);
      if (productCategory) document.body.setAttribute("data-product-category", productCategory);

      var productMaterial = detectProductMaterialFromPLD(entityType, entitySubType);
      if (productMaterial) document.body.setAttribute("data-product-material", productMaterial);

    } catch (e) {}
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

  function waitForBreadcrumbs(callback) {
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') {
      var bcFallback = findBreadcrumbs();
      if (bcFallback) { callback(null, bcFallback); return; }
      callback(new Error('MutationObserver not available'), null);
      return;
    }
    var found = findBreadcrumbs();
    if (found) { callback(null, found); return; }

    var done = false;
    var observer = null;
    var timeoutId = null;

    function _finish(err, bc) {
      if (done) return;
      done = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (observer) { try { observer.disconnect(); } catch (e) {} }
      callback(err, bc);
    }

    timeoutId = setTimeout(function() { _finish(new Error('Breadcrumbs timeout'), null); }, 5000);

    try {
      observer = new MutationObserver(function() {
        if (done) return;
        var bc = findBreadcrumbs();
        if (bc) _finish(null, bc);
      });
      observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
    } catch (e) {
      var startTime = Date.now();
      var _poll = function() {
        if (done) return;
        var bc = findBreadcrumbs();
        if (bc) { _finish(null, bc); return; }
        if (Date.now() - startTime >= 5000) { _finish(new Error('Breadcrumbs timeout'), null); return; }
        setTimeout(_poll, 200);
      };
      setTimeout(_poll, 0);
    }
  }

  // ═══ END STAGE 5/6 — LANJUT STAGE 6/6 ═══

  // ═══════════════════════════════════════════════════════════
  // initializeCore()
  // ═══════════════════════════════════════════════════════════
  function initializeCore() {
    if (_CORE_INITIALIZED) return;
    if (window.pageLevelDetectorv22 && window.pageLevelDetectorv22.version === "23.9.10-seo-dimension") {
      _CORE_INITIALIZED = true;
      return;
    }
    _CORE_INITIALIZED = true;

    try {
      _buildMasterRegexes();
      console.log('⚡ [PLD-SEO-DIMENSION] Master regexes pre-built, cache size: ' + _REGEX_CACHE_SIZE);
    } catch (e) {
      console.error('❌ [PLD-SEO-DIMENSION] Gagal build master regexes: ' + e.message);
    }

    try {
      _memoCountModifierLayers = memoize(countModifierLayers, 300);
      _memoCheckHasSpecification = memoize(checkHasSpecification, 300);
      _memoCalculateComplexityScore = memoize(calculateComplexityScore, 200);
      _memoCheckFisikRole = memoize1(checkFisikRole, 200);
      _memoHasJasaMaterialCtx = memoize1(hasJasaMaterialCtx, 100);
      _memoCheckPureTechnicalSpec = memoize(checkPureTechnicalSpec, 200);
      _memoIsSubVariant = memoize(isSubVariant, 100);
      _memoHasTechnicalSpec = memoize1(hasTechnicalSpec, 200);
      _memoGetCoreWords = memoizeArray(getCoreWords, 200);
      _memoGetFactors = memoizeObject(getFactors, 200);
      _memoDetectVariantByPattern = memoize(detectVariantByPattern, 200);
      console.log('⚡ [PLD-SEO-DIMENSION] Memoize wrappers ACTIVE — 11 fungsi');
    } catch (e) {
      console.error('❌ [PLD-SEO-DIMENSION] Gagal aktifkan memoize: ' + e.message);
    }

    window.pageLevelDetectorv22 = {
      version: "23.9.10-seo-dimension",
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
        } catch (e) {}

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

      // ─── PERF HELPERS ───
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

      // ─── 🔥 PATCH-COMPOUND-v1: COMPOUND HELPERS ───
      COMPOUND_LIBRARY: COMPOUND_LIBRARY,
      normalizeCompoundTerms: normalizeCompoundTerms,
      countSemanticUnits: countSemanticUnits,

      // ─── CACHE HELPERS ───
      _clearLevelCache: _clearLevelCache,
      _clearSubCatCache: _clearSubCatCache,
      _getLevelCacheSize: function() { return _PLD_LEVEL_CACHE_KEYS.length; },
      _getSubCatCacheSize: function() { return _PLD_SUBCAT_CACHE_KEYS.length; },

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

    // Set body attributes SINKRON sebelum dispatch
    try {
      var _initialLevel = detectPageLevel();
      setSchemaAttributes(_initialLevel);
      console.log('⚡ [PLD-SEO-DIMENSION] Body attributes di-set SEBELUM dispatch: ' + _initialLevel);
    } catch (e) {
      console.error('❌ [PLD-SEO-DIMENSION] Gagal set body attributes: ' + e.message);
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
    console.log("✅ Page Level Detector v23.9.10 — SEO DIMENSION");
    console.log("🩹 FIX-TERTIARY: tertiary schema support (silent patch)");
    console.log("   → GABUNG: tertiary='Article' (Service & Product)");
    console.log("   → data-schema-type-tertiary attribute");
    console.log("   → Konsumen Article v8.7 detect GABUNG eksplisit");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🎯 PRINSIP:");
    console.log("   ✅ JASA     : Broad-to-narrow (verb = base, target = spec)");
    console.log("   ✅ PRODUK   : Frasa utuh (noun-based) + Compound-aware");
    console.log("   ✅ MATERIAL : Frasa utuh (noun-based) + Compound-aware");
    console.log("   ✅ DESAIN   : Frasa utuh (khusus) + Compound-aware");
    console.log("   ✅ SEWA     : PATCH SEWA v3");
    console.log("🎯 PERUBAHAN v23.9.9:");
    console.log("   ✅ COMPOUND_LIBRARY: 1 konsep = 1 layer");
    console.log("   ✅ countSemanticUnits(): bukan word count");
    console.log("   ✅ Location override: MC selalu, bukan sub-variant");
    console.log("   ✅ PRODUK/MATERIAL/DESAIN: compound-aware");
    console.log("   ✅ EXPECTED_CHILD_MAP: variant boleh child MC");
    console.log("   ✅ Validator update: tidak warning variant+MC");
    console.log("═══════════════════════════════════════════════════════════");

    // 🔥 REGRESSION TEST v9.3 — SEO DIMENSION
    try {
       var _testCases = [
        // ═══ JASA ═══
        ["jasa bor",                        "money-master",      "jasa"],
        ["jasa cor",                        "money-master",      "jasa"],
        ["jasa pasang",                     "money-master",      "jasa"],
        ["jasa pancang",                    "money-master",      "jasa"],
        ["jasa bor sumur",                  "money-page",        "jasa"],
        ["jasa bor air tanah",              "money-page",        "jasa"],
        ["jasa bor pile",                   "money-master",      "jasa"],
        ["jasa cor dak",                    "money-page",        "jasa"],
        ["jasa pasang keramik",             "money-page",        "jasa"],
        ["jasa bor sumur dalam",            "money-page",        "jasa"],
        ["jasa bor sumur artesis",          "variant",           "jasa"],
        ["jasa bor sumur dalam 30 meter",   "sub-variant",       "jasa"],        
        ["jasa bor jakarta",                "money-child",       "jasa"],
        ["jasa bor air tanah jakarta",      "money-child",       "jasa"],
        ["jasa bor air tanah surabaya",     "money-child",       "jasa"],
        ["jasa bor air tanah bogor",        "money-child",       "jasa"],
        ["jasa bor tanah jakarta",          "money-child",       "jasa"],
        ["jasa bore pile jakarta",          "money-child",       "jasa"],
        ["jasa cor dak jakarta",            "money-child",       "jasa"],
        ["harga bore pile",                 "money-master",      "jasa"],
        ["jasa bore pile murah",            "money-master",      "jasa"],
        ["tukang sumur bor",                "money-master",      "jasa"],
        ["tukang bor sumur jakarta",        "money-child",       "jasa"],

        // ═══ SEWA (SEO-IDEAL) ═══
        ["sewa excavator",                  "money-master",      "sewa"],
        ["sewa excavator jakarta",          "money-child",       "sewa"],
        ["sewa excavator per hari",         "money-page",        "sewa"],
        ["sewa excavator mini",             "money-page",        "sewa"],
        ["sewa alat berat",                 "money-master",      "sewa"],
        ["sewa alat berat jakarta",         "money-child",       "sewa"],
        ["sewa concrete pump",              "money-master",      "sewa"],
        ["sewa tower crane",                "money-master",      "sewa"],
        ["sewa mobile crane",               "money-master",      "sewa"],
        ["sewa dump truck jakarta",         "money-child",       "sewa"],
        ["sewa genset 100 kva",             "money-page",        "sewa"],
        ["sewa panel listrik",              "money-master",      "sewa"],

        // ═══ PRODUK (SEO-IDEAL) ═══
        ["pintu aluminium",                 "money-master",      "produk"],
        ["pintu aluminium jakarta",         "money-child",       "produk"],
        ["pintu aluminium 80x200",          "money-page",        "produk"],
        ["kitchen set",                     "money-master",      "produk"],
        ["kitchen set minimalis",           "money-page",        "produk"],
        ["kitchen set jakarta",             "money-child",       "produk"],
        ["pagar panel",                     "money-master",      "produk"],
        ["pagar panel beton",               "money-page",        "produk"],
        ["pagar panel beton jakarta",       "money-child",       "produk"],
        ["u ditch",                         "money-master",      "produk"],
        ["u ditch 30x30",                   "money-page",        "produk"],
        ["wall panel",                      "money-master",      "produk"],
        ["kanopi",                          "money-master",      "produk"],
        ["kanopi minimalis",                "money-page",        "produk"],
        ["pagar",                           "money-master",      "produk"],
        ["pagar minimalis",                 "money-page",        "produk"],

        // ═══ MATERIAL (SEO-IDEAL) ═══
        ["besi beton",                      "money-master",      "material"],
        ["besi beton ulir",                 "money-page",        "material"],
        ["besi beton ulir sni",             "variant",           "material"],
        ["besi beton ulir sni 13mm",        "sub-variant",       "material"],
        ["kayu jati",                       "money-master",      "material"],
        ["kayu jati solid",                 "money-page",        "material"],
        ["kayu jati belanda",               "money-master",      "material"],
        ["batu kali",                       "money-master",      "material"],
        ["batu kali belah",                 "money-page",        "material"],
        ["semen portland",                  "money-master",      "material"],
        ["semen portland tipe 1",           "money-page",        "material"],
        ["pasir beton",                     "money-master",      "material"],
        ["pasir beton halus",               "money-page",        "material"],
        ["besi hollow",                     "money-master",      "material"],
        ["besi hollow galvanis",            "money-page",        "material"],
        ["baja ringan",                     "money-master",      "material"],
        ["baja ringan c75",                 "money-page",        "material"],
        ["marmer travertine",               "money-master",      "material"],
        ["keramik lantai",                  "money-master",      "material"],
        ["keramik 60x60",                   "money-page",        "material"],
        ["genteng",                         "money-master",      "material"],
        ["genteng metal",                   "money-page",        "material"],
        ["cat tembok",                      "money-master",      "material"],
        ["cat dulux",                       "money-page",        "material"],

        // ═══ DESAIN (SEO-IDEAL) ═══
        ["desain interior",                 "money-master",      "desain"],
        ["desain interior minimalis",       "money-page",        "desain"],
        ["desain interior kantor",          "money-page",        "desain"],
        ["desain rumah",                    "money-master",      "desain"],
        ["desain rumah minimalis",          "money-page",        "desain"],
        ["desain rumah minimalis 2 lantai", "variant",           "desain"],
        ["desain 3d",                       "money-master",      "desain"],
        ["desain 3d rumah",                 "money-page",        "desain"],
        ["desain interior cafe jakarta",    "money-child",       "desain"],
        ["desain taman",                    "money-master",      "desain"],
        ["desain taman minimalis",          "money-page",        "desain"],
        ["desain gedung",                   "money-master",      "desain"],
        ["desain gedung kantor",            "money-page",        "desain"],

        // ═══ ARTIKEL ═══
        ["cara pasang keramik",             "money-master",      "artikel"],
        ["tips memilih baja ringan",        "money-master",      "artikel"],

        // ═══ SUB-PILLAR ═══
        ["daftar jenis pagar",              "sub-pillar-tipe-2", null],
        ["pagar vs kanopi",                 "sub-pillar-tipe-1", null]
      ];
       
      var _fails = 0;
      var _failsList = [];
      for (var _ti = 0; _ti < _testCases.length; _ti++) {
        var _got = detectPageLevelForPrompt(_testCases[_ti][0], _testCases[_ti][2]);
        if (_got !== _testCases[_ti][1]) {
          console.error("❌ REGRESSION FAIL:", _testCases[_ti][0],
                        "expected", _testCases[_ti][1], "got", _got,
                        "(entity=" + _testCases[_ti][2] + ")");
          _fails++;
          _failsList.push(_testCases[_ti][0]);
        }
      }
      if (_fails === 0) {
        console.log("🎉 REGRESSION: ALL " + _testCases.length + " PASS ✅");
      } else {
        console.warn("⚠️ REGRESSION: " + _fails + " FAIL dari " + _testCases.length);
        console.warn("⚠️ Fails: " + _failsList.join(", "));
      }
    } catch (e) {
      console.error("Regression test error:", e.message);
    }

    // Auto-update attributes
    try {
      window.pageLevelDetectorv22.updateAttributes({ waitForBreadcrumb: false })
        .then(function(result) {
          if (CONFIG.DEBUG) console.log("✅ Auto-update: " + result.pageLevel);
        })
        .catch(function(err) { if (CONFIG.DEBUG) console.error("Auto-update error: " + err); });
    } catch (e) {}
  }

  // ═══════════════════════════════════════════════════════════
  // FIX-RACE: waitForDOM()
  // ═══════════════════════════════════════════════════════════
  var _DOM_READY_CALLED = false;

  function waitForDOM(callback) {
    if (_DOM_READY_CALLED) return;
    if (typeof document === 'undefined') {
      _DOM_READY_CALLED = true;
      callback();
      return;
    }
    var rs = document.readyState;
    if (rs === 'complete' || rs === 'interactive') {
      _DOM_READY_CALLED = true;
      callback();
      return;
    }
    var _called = false;
    function _once() {
      if (_called) return;
      _called = true;
      _DOM_READY_CALLED = true;
      callback();
    }
    document.addEventListener('DOMContentLoaded', _once);
    var _fallbackCount = 0;
    var _fallbackTimer = setInterval(function() {
      _fallbackCount++;
      var rs2 = document.readyState;
      if (rs2 === 'complete' || rs2 === 'interactive') {
        clearInterval(_fallbackTimer);
        _once();
      }
      if (_fallbackCount >= 60) {
        clearInterval(_fallbackTimer);
        _once();
      }
    }, 100);
  }

  function _safeInitializeCore() {
    if (_CORE_INITIALIZED) return;
    if (window.pageLevelDetectorv22) return;
    try {
      initializeCore();
    } catch (e) {
      console.error('❌ [PLD-SEO-DIMENSION] initializeCore error: ' + e.message);
      try {
        if (document.body) {
          document.body.setAttribute("data-page-level", "money-page");
          document.body.setAttribute("data-page-level-num", "5");
        }
      } catch (e2) {}
    }
  }

  waitForDOM(function() { _safeInitializeCore(); });

  if (typeof document !== 'undefined') {
    var _rs = document.readyState;
    if (_rs === 'complete' || _rs === 'interactive') {
      setTimeout(function() { _safeInitializeCore(); }, 0);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // GLOBAL HELPERS
  // ═══════════════════════════════════════════════════════════
  if (typeof window !== "undefined") {
    window.PLD_VERSION = "23.9.10-seo-dimension";
    window.getPLDInfo = function() {
      if (!window.pageLevelDetectorv22) {
        console.error("❌ PLD belum ready.");
        return null;
      }
      return {
        version: window.pageLevelDetectorv22.version,
        mode: "SEO-DIMENSION",
        pageLevel: window.pageLevelDetectorv22.detect(),
        entityType: window.pageLevelDetectorv22.detectEntityType(),
        perf: window.pageLevelDetectorv22._getPerfStats(),
        memo: window.pageLevelDetectorv22._getMemoStats(),
        cache: {
          level: window.pageLevelDetectorv22._getLevelCacheSize(),
          subCat: window.pageLevelDetectorv22._getSubCatCacheSize()
        }
      };
    };
  }

})();


 
