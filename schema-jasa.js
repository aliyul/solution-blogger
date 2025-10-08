//* ⚡ AUTO SCHEMA UNIVERSAL v4.45 — Hybrid-Stable Edition | Beton Jaya Readymix */
(function () {
  let schemaInjected = false

  async function initSchema() {
    if (schemaInjected) return
    schemaInjected = true
    console.log("[Schema Service v4.45 🚀] Auto generator dijalankan (tabel+link+nama offers)")

    // === 1️⃣ INFO DASAR HALAMAN ===
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content?.trim()
    const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim()
    const baseUrl = ogUrl || canonical || location.href
    const cleanUrl = baseUrl.replace(/[?&]m=1/, "")

    const PAGE = {
      url: cleanUrl,
      title: document.querySelector("h1")?.textContent?.trim() || document.title.trim(),
      description:
        document.querySelector('meta[name="description"]')?.content?.trim() ||
        document.querySelector("article p, main p, .post-body p")?.innerText?.substring(0, 200) ||
        document.title,
      image:
        document.querySelector('meta[property="og:image"]')?.content ||
        document.querySelector("article img, main img, .post-body img")?.getAttribute("src") ||
        "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png",
      business: {
        name: "Beton Jaya Readymix",
        url: "https://www.betonjayareadymix.com",
        telephone: "+6283839000968",
        openingHours: "Mo-Sa 08:00-17:00",
        description: "Beton Jaya Readymix melayani jasa konstruksi, beton cor, precast, dan sewa alat berat di seluruh Indonesia.",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Bogor",
          addressRegion: "Jawa Barat",
          addressCountry: "ID",
        },
        sameAs: [
          "https://www.facebook.com/betonjayareadymix",
          "https://www.instagram.com/betonjayareadymix",
        ],
      },
    }

    // === 2️⃣ AREA DEFAULT ===
    const areaJSON = {
      "Kabupaten Bogor": "Jawa Barat",
      "Kota Bogor": "Jawa Barat",
      "Kota Depok": "Jawa Barat",
      "Kabupaten Bekasi": "Jawa Barat",
      "Kota Bekasi": "Jawa Barat",
      "Kabupaten Karawang": "Jawa Barat",
      "Kabupaten Serang": "Banten",
      "Kota Serang": "Banten",
      "Kota Cilegon": "Banten",
      "Kabupaten Tangerang": "Banten",
      "Kota Tangerang": "Banten",
      "Kota Tangerang Selatan": "Banten",
      "DKI Jakarta": "DKI Jakarta",
    }
    const defaultAreaServed = Object.keys(areaJSON).map(k => ({ "@type": "Place", name: k }))

    async function fetchAreaFromWikipedia(areaName, type) {
      try {
        const page = type === "kelurahan"
          ? `Daftar_kelurahan_dan_desa_di_${areaName.replace(/\s+/g, "_")}`
          : `Daftar_kecamatan_di_${areaName.replace(/\s+/g, "_")}`
        const url = `https://id.wikipedia.org/w/api.php?action=parse&page=${page}&prop=text&format=json&origin=*`
        const res = await fetch(url)
        const data = await res.json()
        if (data?.parse?.text) {
          const temp = document.createElement("div")
          temp.innerHTML = data.parse.text["*"]
          const items = Array.from(temp.querySelectorAll("li, td"))
            .map(el => el.textContent.trim())
            .filter(t => /^[A-Z]/.test(t) && !t.includes("Daftar"))
            .slice(0, 100)
          return items.map(n => ({ "@type": "Place", name: `${type === "kelurahan" ? "Kelurahan" : "Kecamatan"} ${n}` }))
        }
      } catch (e) { console.warn("⚠️ Wikipedia fetch error:", e) }
      return null
    }

    async function getCachedAreaList(cacheKey, areaName, type) {
      try {
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          const parsed = JSON.parse(cached)
          if (parsed.expire > Date.now()) return parsed.data
          else localStorage.removeItem(cacheKey)
        }
        const data = await fetchAreaFromWikipedia(areaName, type)
        if (data?.length) {
          localStorage.setItem(cacheKey, JSON.stringify({ expire: Date.now() + 2592000000, data }))
          return data
        }
      } catch (e) { console.warn("❌ Cache error:", e) }
      return null
    }

    async function detectArea(url, title = "") {
      const text = (url + " " + title).toLowerCase()
      for (const area in areaJSON) {
        const slug = area.toLowerCase().replace(/\s+/g, "-")
        if (text.includes(slug) || text.includes(area.toLowerCase().replace(/\s+/g, ""))) {
          return (await getCachedAreaList(`wiki_kecamatan_${area.replace(/\s+/g, "_")}`, area, "kecamatan")) || defaultAreaServed
        }
      }
      return defaultAreaServed
    }
    const areaServed = await detectArea(PAGE.url, PAGE.title)

    // === 3️⃣ DETEKSI SERVICE / PRODUK ===
    const detectServiceType = () => {
      const base = PAGE.title.toLowerCase()
      const types = ["sewa excavator", "sewa alat berat", "jasa pancang", "jasa borongan", "jasa renovasi", "jasa puing", "rental alat berat", "beton cor", "ready mix"]
      return types.filter(t => base.includes(t)).length ? types.filter(t => base.includes(t)) : ["Jasa Konstruksi"]
    }
    const serviceTypes = detectServiceType()

    // === 4️⃣ DETEKSI HARGA + NAMA PRODUK ===
    function parseValidTableOffers() {
      const offers = []
      document.querySelectorAll("table tr").forEach(r => {
        const cells = r.querySelectorAll("td, th")
        if (cells.length >= 2) {
          const name = cells[0].innerText.trim()
          const priceMatch = r.innerText.match(/Rp\s*([\d.,]+)/)
          if (priceMatch) {
            const price = parseInt(priceMatch[1].replace(/[.\s,]/g, ""), 10)
            if (price >= 10000 && price <= 500000000) offers.push({ name, price })
          }
        }
      })
      return offers
    }

    function parseListOffers() {
      const offers = []
      document.querySelectorAll("li").forEach(li => {
        const txt = li.innerText.trim()
        const priceMatch = txt.match(/(.+?)\s*[-:–]\s*Rp\s*([\d.,]+)/)
        if (priceMatch && priceMatch[1] && priceMatch[2]) {
          const name = priceMatch[1].trim()
          const price = parseInt(priceMatch[2].replace(/[.\s,]/g, ""), 10)
          if (price >= 10000 && price <= 500000000) offers.push({ name, price })
        }
      })
      return offers
    }

    const combinedOffers = [...parseValidTableOffers(), ...parseListOffers()]
    const allPrices = combinedOffers.map(o => o.price)

    const priceData = allPrices.length ? {
      lowPrice: Math.min(...allPrices),
      highPrice: Math.max(...allPrices),
      offerCount: allPrices.length,
      priceCurrency: "IDR",
      priceValidUntil: new Date(Date.now() + 7776000000).toISOString().split("T")[0],
      offers: combinedOffers.slice(0, 20).map(o => ({
        "@type": "Offer",
        name: o.name,
        price: o.price,
        priceCurrency: "IDR",
        availability: "https://schema.org/InStock",
      })),
    } : null

    const productSignal = /(jual|harga|produk|penjualan|katalog|daftar harga|price list|tabel harga|ready mix|precast|pipa|panel|buis)/i
    const isProductPage = productSignal.test((PAGE.title + " " + PAGE.description + " " + document.body.innerText).toLowerCase()) || combinedOffers.length > 0

    // === 5️⃣ INTERNAL LINKS ===
    const anchors = [...document.querySelectorAll("article a, main a, .post-body a")]
      .filter(a => a.href && a.href.includes(location.hostname) && !a.href.includes("#"))
      .map(a => ({ url: a.href.split("#")[0], name: a.innerText.trim() || a.href }))
    const uniqueLinks = Array.from(new Map(anchors.map(a => [a.url, a.name])).entries())
      .map(([url, name], i) => ({ "@type": "ListItem", position: i + 1, url, name }))

    // === 6️⃣ BUILD GRAPH ===
    const graph = []

    const localBiz = {
      "@type": ["LocalBusiness", "GeneralContractor"],
      "@id": PAGE.business.url + "#localbusiness",
      name: PAGE.business.name,
      url: PAGE.business.url,
      telephone: PAGE.business.telephone,
      description: PAGE.business.description,
      address: PAGE.business.address,
      openingHours: PAGE.business.openingHours,
      logo: PAGE.image,
      sameAs: PAGE.business.sameAs,
      areaServed,
      knowsAbout: ["Beton cor", "Ready mix", "Precast", "Sewa alat berat", "Jasa konstruksi"],
    }
    if (isProductPage) localBiz.hasOfferCatalog = { "@id": PAGE.url + "#product" }
    graph.push(localBiz)

    const webpage = {
      "@type": "WebPage",
      "@id": PAGE.url + "#webpage",
      url: PAGE.url,
      name: PAGE.title,
      description: PAGE.description,
      image: PAGE.image,
      mainEntity: { "@id": PAGE.url + "#service" },
      publisher: { "@id": PAGE.business.url + "#localbusiness" },
      ...(uniqueLinks.length && { hasPart: { "@id": PAGE.url + "#daftar-internal-link" } }),
    }
    graph.push(webpage)

    const service = {
      "@type": "Service",
      "@id": PAGE.url + "#service",
      name: PAGE.title,
      description: PAGE.description,
      image: PAGE.image,
      serviceType: serviceTypes,
      areaServed,
      provider: { "@id": PAGE.business.url + "#localbusiness" },
      brand: { "@type": "Brand", name: PAGE.business.name },
      mainEntityOfPage: { "@id": PAGE.url + "#webpage" },
      ...(priceData && { offers: { "@type": "AggregateOffer", ...priceData, url: PAGE.url } }),
    }
    graph.push(service)

    if (isProductPage) {
      graph.push({
        "@type": "Product",
        "@id": PAGE.url + "#product",
        name: PAGE.title,
        description: PAGE.description,
        image: PAGE.image,
        brand: { "@type": "Brand", name: PAGE.business.name },
        mainEntityOfPage: { "@id": PAGE.url + "#webpage" },
        ...(priceData && { offers: { "@type": "AggregateOffer", ...priceData, url: PAGE.url } }),
        areaServed,
        provider: { "@id": PAGE.business.url + "#localbusiness" },
      })
    }

    if (uniqueLinks.length) {
      graph.push({
        "@type": "ItemList",
        "@id": PAGE.url + "#daftar-internal-link",
        name: "Daftar Halaman Terkait",
        itemListOrder: "http://schema.org/ItemListOrderAscending",
        numberOfItems: uniqueLinks.length,
        itemListElement: uniqueLinks,
      })
    }

    // === 7️⃣ OUTPUT ===
    const schema = { "@context": "https://schema.org", "@graph": graph }
    let el = document.querySelector("#auto-schema-service")
    if (!el) {
      el = document.createElement("script")
      el.id = "auto-schema-service"
      el.type = "application/ld+json"
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(schema, null, 2)

    console.log(`[Schema v4.45 ✅] Injected | Type: ${isProductPage ? "Service+Product" : "Service"} | Harga: ${priceData ? "Ya" : "Tidak"} | Area: ${areaServed.length}`)
  }

  // === 8️⃣ READY + OBSERVER + FALLBACK ===
  document.addEventListener("DOMContentLoaded", () => {
    const tryRun = () => {
      if (document.querySelector("h1") && document.querySelector(".post-body")) {
        initSchema()
        return true
      }
      return false
    }

    // 🕐 Fallback 1: langsung coba setelah 600ms
    setTimeout(tryRun, 600)

    // 🧩 Fallback 2: observer untuk halaman yang muncul belakangan
    const observer = new MutationObserver(() => {
      if (tryRun()) observer.disconnect()
    })
    observer.observe(document.body, { childList: true, subtree: true })
  })
})()
