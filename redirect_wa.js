 document.addEventListener("DOMContentLoaded", function () {
    // Peta link WA asal → tujuan
    const redirectMap = {
      "https://wa.me/6283839000968": "https://wa.me/6281299842508"
      //"https://wa.me/6283839001968": "https://wa.me/6281234560002",
     // "https://wa.me/6283839002968": "https://wa.me/6281234560003"
    };

    // Ambil semua link <a>
    const allLinks = document.querySelectorAll("a[href^='https://wa.me/']");

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
