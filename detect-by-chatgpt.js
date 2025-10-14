// ===================================================
// ⚡ AUTO SEO BUILDER ULTRA KOMPETITIF v6.0
// 🚀 Smart Semantic Content Detector + GPT Integration
// ===================================================

const PROXY_URL = "https://script.google.com/home :
https://script.google.com/macros/s/AKfycby9sDB5a6IkYAGZCJ3fwW6bijS-8LlyR8lk3e_vJStvmvPekSpFcZ3T3rgnPje8yGMqTA/exec";

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 SEO Builder v6.0 aktif dengan Smart GPT Detector");

  const h1El = document.querySelector("h1");
  const h1Text = h1El ? h1El.innerText.trim() : "Konten tanpa H1";

  // Buat dashboard SEO Assistant
  const dashboard = document.createElement("div");
  dashboard.id = "seoAssistant";
  dashboard.style.cssText = `
    border-top: 2px solid #ccc; padding: 15px; margin-top: 40px;
    font-family: system-ui; font-size: 14px; background: #fafafa;
  `;
  dashboard.innerHTML = `
    <h3>🧠 Smart SEO Assistant v6.0</h3>
    <p><b>Analisis otomatis dengan GPT untuk:</b> "${h1Text}"</p>
    <button id="btnAnalyze" style="padding:6px 12px;margin-right:8px;">🔍 Analisis Sekarang</button>
    <button id="btnCopy" style="padding:6px 12px;margin-right:8px;">📋 Copy</button>
    <button id="btnExport" style="padding:6px 12px;">💾 Export HTML</button>
    <div id="seoOutput" style="margin-top:10px;color:#222;"></div>
  `;
  document.body.appendChild(dashboard);

  // Pindahkan ke bawah footer
  const footer = document.querySelector("footer");
  if (footer && footer.parentNode) footer.parentNode.insertBefore(dashboard, footer.nextSibling);

  // ====== Tombol Analisis ======
  document.getElementById("btnAnalyze").addEventListener("click", async () => {
    document.getElementById("seoOutput").innerHTML = "⏳ Menganalisis struktur SEO...";

    const prompt = `
Analisis konten dengan judul H1: "${h1Text}".
1. Tentukan apakah konten ini bersifat: EVERGREEN, SEMI-EVERGREEN, atau NON-EVERGREEN.
2. Berikan alasan singkat (maks 2 kalimat).
3. Buat struktur heading SEO ultra-kompetitif (H2 & H3 lengkap) untuk topik tersebut.
4. Tulis hasil dalam format HTML dengan heading & bullet.
    `;

    try {
      const res = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      const result = data.reply || "⚠️ Tidak ada hasil dari GPT.";

      document.getElementById("seoOutput").innerHTML = `
        <div id="previewArea" style="border:1px solid #ddd;padding:10px;background:#fff;">
          ${result}
        </div>
        <p style="margin-top:10px;font-size:12px;color:#666;">
          💡 Saran SEO otomatis berdasarkan analisis semantik GPT.
        </p>
      `;
    } catch (err) {
      document.getElementById("seoOutput").innerHTML = "❌ Gagal memuat analisis: " + err.message;
    }
  });

  // ====== Tombol Copy ======
  document.getElementById("btnCopy").addEventListener("click", () => {
    const content = document.getElementById("seoOutput").innerText;
    navigator.clipboard.writeText(content)
      .then(() => alert("✅ Hasil SEO berhasil disalin ke clipboard!"))
      .catch(() => alert("⚠️ Gagal menyalin ke clipboard."));
  });

  // ====== Tombol Export ======
  document.getElementById("btnExport").addEventListener("click", () => {
    const content = document.getElementById("seoOutput").innerHTML;
    const blob = new Blob([content], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `SEO-Analysis-${h1Text.replace(/\s+/g, "-")}.html`;
    link.click();
  });
});
