
// File: parent-mapping-from-const.js

// Mapping dari MONEY PAGE (post) ke VARIANT (page)
const moneyToVariantMapping = {
  // Harga Pagar Rumah → Pagar Rumah
  "https://www.betonjayareadymix.com/2021/09/harga-pagar-rumah.html": {
    parentUrl: "https://www.betonjayareadymix.com/p/pagar-rumah.html",
    parentName: "Pagar Rumah"
  },
  
  // Harga Pagar Panel Beton → Pagar Panel Beton
  "https://www.betonjayareadymix.com/2019/04/harga-pagar-panel-beton.html": {
    parentUrl: "https://www.betonjayareadymix.com/p/pagar-panel-beton.html",
    parentName: "Pagar Panel Beton"
  },
  
  // Harga U Ditch → U Ditch
  "https://www.betonjayareadymix.com/2021/04/harga-u-ditch.html": {
    parentUrl: "https://www.betonjayareadymix.com/p/u-ditch.html",
    parentName: "U Ditch"
  },
  
  // Harga Box Culvert → Box Culvert
  "https://www.betonjayareadymix.com/2021/04/harga-box-culvert-beton-precast.html": {
    parentUrl: "https://www.betonjayareadymix.com/p/box-culvert.html",
    parentName: "Box Culvert"
  },
  
  // Harga Tiang Pancang Beton → Produk Tiang Pancang Beton
  "https://www.betonjayareadymix.com/2022/02/harga-tiang-pancang-beton.html": {
    parentUrl: "https://www.betonjayareadymix.com/p/produk-tiang-pancang-beton.html",
    parentName: "Produk Tiang Pancang Beton"
  }
};

function getParentForMoneyPage(moneyPageUrl) {
  return moneyToVariantMapping[moneyPageUrl] || null;
}
