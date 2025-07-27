	   // ✅ Tambahkan logika penyesuaian judul halaman ke elemen ID tertentu
  const title = document.title.replace(" - beton jaya readymix", "").trim();
  const targets = document.querySelectorAll(".judulHalamanOtomatis");
  targets.forEach(el => el.textContent = title);
