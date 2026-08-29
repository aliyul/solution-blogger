/**
 * redirect_wa.js - Revisi dengan Event Delegation & Debugging
 * 
 * Fitur:
 * - Event delegation untuk menangani link dinamis
 * - Console.log untuk debugging
 * - Pencocokan fleksibel dengan includes()
 * - Fallback jika redirect gagal
 */

document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ redirect_wa.js berjalan!");

    // ============================================
    // 1. PETA REDIRECT (ASAL → TUJUAN)
    // ============================================
    const redirectMap = {
        // Redirect dari nomor asal ke nomor baru
        "https://wa.me/6283839000968": "https://wa.me/6281293108428",
        "https://wa.link/mz5dsa": "https://wa.me/6281293108428"
        // Tambahkan lainnya di sini
        // "https://wa.me/6283839002968": "https://wa.me/6281234560003"
    };

    // ============================================
    // 2. CEK LINK WA YANG SUDAH ADA DI DOM
    // ============================================
    function countWaLinks() {
        const allLinks = document.querySelectorAll("a[href*='wa.me/'], a[href*='wa.link/']");
        console.log("🔗 Total link WA di DOM:", allLinks.length);
        allLinks.forEach(function(link, index) {
            console.log(`  ${index + 1}. ${link.getAttribute("href")}`);
        });
        return allLinks.length;
    }

    // Jalankan pengecekan awal
    countWaLinks();

    // ============================================
    // 3. EVENT DELEGATION (MENERIMA LINK DINAMIS)
    // ============================================
    document.addEventListener("click", function (e) {
        // Cari elemen <a> terdekat dari target klik
        const link = e.target.closest("a[href*='wa.me/'], a[href*='wa.link/']");
        
        if (link) {
            const originalHref = link.getAttribute("href");
            console.log("🔄 Link WA diklik:", originalHref);

            // Cari di redirectMap (cocokkan secara eksak atau sebagian)
            let newHref = null;

            // Opsi A: Cocokkan eksak
            if (redirectMap[originalHref]) {
                newHref = redirectMap[originalHref];
            } 
            // Opsi B: Cocokkan sebagian (jika ada parameter tambahan)
            else {
                for (const [key, value] of Object.entries(redirectMap)) {
                    if (originalHref.includes(key) || key.includes(originalHref)) {
                        newHref = value;
                        console.log("✅ Redirect cocok (partial match):", key, "→", value);
                        break;
                    }
                }
            }

            // Jika ditemukan redirect, lakukan
            if (newHref) {
                e.preventDefault(); // Cegah link asli
                console.log("🚀 Redirect ke:", newHref);
                window.open(newHref, "_blank");
            } else {
                // Tidak ada redirect, biarkan link asli terbuka
                console.log("ℹ️ Tidak ada redirect untuk link ini, lanjutkan normal.");
                // Tidak perlu e.preventDefault() agar link asli tetap berfungsi
            }
        }
    });

    // ============================================
    // 4. INFORMASI STATUS DI CONSOLE
    // ============================================
    console.log("📋 Daftar redirect yang aktif:");
    for (const [asal, tujuan] of Object.entries(redirectMap)) {
        console.log(`   ${asal} → ${tujuan}`);
    }
    console.log("✅ redirect_wa.js siap digunakan!");

    // ============================================
    // 5. FUNGSI MANUAL (jika ingin dipanggil dari console)
    // ============================================
    window.reloadRedirectMap = function() {
        console.log("🔄 Reload redirect map...");
        countWaLinks();
        console.log("✅ Selesai reload.");
    };

    console.log("💡 Ketik 'reloadRedirectMap()' di console untuk cek ulang link WA.");
});

// ============================================
// 6. ALTERNATIF: Jika link dibuat setelah DOMContentLoaded
// ============================================
// Jika link WhatsApp dibuat oleh script lain setelah halaman load,
// gunakan MutationObserver untuk mendeteksi perubahan DOM
// (Tidak wajib, tapi bisa ditambahkan jika diperlukan)

/*
const observer = new MutationObserver(function() {
    console.log("🔍 DOM berubah, cek ulang link WA...");
    // Tidak perlu melakukan apa-apa karena event delegation sudah menangani
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
*/
