 document.addEventListener("DOMContentLoaded", function () {
    // Peta link WA asal → tujuan
    const redirectMap = {
     //INI REDIRECT DARU NOMOR ASAL KE YANG BARU JIKA MAU TINGGAL SETTTING AJA SESUAI NOMOR ASAL DAN BARU NYA
      "https://wa.me/6283839000968": "https://wa.me/6281293108428",
      "https://wa.link/mz5dsa": "https://wa.me/6281293108428"
     // "https://wa.me/6283839002968": "https://wa.me/6281234560003"
    };

    // Ambil semua link <a>
    //const allLinks = document.querySelectorAll("a[href^='https://wa.me/']");
    const allLinks = document.querySelectorAll("a[href*='wa.me/'], a[href*='wa.link/']");
    allLinks.forEach(function (link) {
      const originalHref = link.getAttribute("href");

      // Jika link sesuai dengan redirectMap, pasang event click
      if (redirectMap[originalHref]) {
        link.addEventListener("click", function (e) {
          e.preventDefault(); // cegah link lama terbuka
          const newHref = redirectMap[originalHref];
          window.open(newHref, "_blank");
        });
      }
    });
  });
