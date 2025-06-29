  // Ganti dengan URL WhatsApp tujuan
  var redirectURL = "https://wa.me/6281299842508";

  // Fungsi untuk melakukan redirect
  function redirectWA() {
    window.location.href = redirectURL;
  }

  // Menjalankan fungsi redirect saat halaman dimuat
  window.onload = redirectWA;
