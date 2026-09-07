/**
 * replace_wa.js - Mengganti nomor WA lama ke baru di seluruh DOM
 * 
 * Fitur:
 * - Mengganti semua link WA lama dengan nomor baru saat DOM siap
 * - Mendukung link dinamis yang muncul setelah DOM load (menggunakan MutationObserver)
 * - Console.log untuk debugging
 * - Pencocokan fleksibel dengan includes()
 */

document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ replace_wa.js berjalan!");

    // ============================================
    // 1. PETA PENGGANTIAN (LAMA → BARU)
    // ============================================
    const replaceMap = {
        // Ganti dari nomor lama ke nomor baru
        "6283839000968": "6281293108428",
        "wa.link/mz5dsa": "wa.me/6281293108428"
        // Tambahkan lainnya di sini
        // "6283839002968": "6281234560003"
    };

    // ============================================
    // 2. FUNGSI UTAMA UNTUK MENGGANTI LINK
    // ============================================
    function replaceWaLinks() {
        // Cari semua link WA
        const allLinks = document.querySelectorAll("a[href*='wa.me/'], a[href*='wa.link/']");
        console.log("🔗 Total link WA ditemukan:", allLinks.length);
        
        let replacedCount = 0;
        let skippedCount = 0;

        allLinks.forEach(function(link, index) {
            const originalHref = link.getAttribute("href");
            let newHref = originalHref;
            let isReplaced = false;

            // Coba cocokkan dengan pola penggantian
            for (const [oldPattern, newPattern] of Object.entries(replaceMap)) {
                if (originalHref.includes(oldPattern)) {
                    // Ganti pola lama dengan pola baru di dalam URL
                    newHref = originalHref.replace(oldPattern, newPattern);
                    isReplaced = true;
                    console.log(`  🔄 Link #${index + 1}: "${originalHref}" → "${newHref}"`);
                    break;
                }
            }

            // Jika ditemukan penggantian, update href
            if (isReplaced && newHref !== originalHref) {
                link.setAttribute("href", newHref);
                replacedCount++;
            } else {
                skippedCount++;
            }
        });

        console.log(`✅ Selesai: ${replacedCount} link diganti, ${skippedCount} link tidak berubah.`);
        return { replaced: replacedCount, skipped: skippedCount };
    }

    // ============================================
    // 3. EKSEKUSI PENGGANTIAN SAAT DOM SIAP
    // ============================================
    const result = replaceWaLinks();

    // ============================================
    // 4. INFORMASI STATUS DI CONSOLE
    // ============================================
    console.log("📋 Daftar penggantian nomor yang aktif:");
    for (const [lama, baru] of Object.entries(replaceMap)) {
        console.log(`   ${lama} → ${baru}`);
    }
    console.log("✅ replace_wa.js siap digunakan!");

    // ============================================
    // 5. MUTATION OBSERVER (UNTUK LINK DINAMIS)
    // ============================================
    // Observer untuk menangani link yang ditambahkan setelah DOM load
    const observer = new MutationObserver(function(mutations) {
        let hasNewLinks = false;
        
        mutations.forEach(function(mutation) {
            // Cek apakah ada node baru yang ditambahkan
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    // Jika node adalah elemen, cek apakah mengandung link WA
                    if (node.nodeType === 1) {
                        const links = node.querySelectorAll ? 
                            node.querySelectorAll("a[href*='wa.me/'], a[href*='wa.link/']") : [];
                        if (links.length > 0) {
                            hasNewLinks = true;
                        }
                        // Cek juga jika node itu sendiri adalah link WA
                        if (node.tagName === 'A' && 
                            (node.href?.includes('wa.me/') || node.href?.includes('wa.link/'))) {
                            hasNewLinks = true;
                        }
                    }
                });
            }
        });

        if (hasNewLinks) {
            console.log("🔍 Link WA baru terdeteksi, melakukan penggantian...");
            replaceWaLinks();
        }
    });

    // Mulai mengamati perubahan DOM
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // ============================================
    // 6. FUNGSI MANUAL (untuk dipanggil dari console)
    // ============================================
    window.replaceWaLinks = replaceWaLinks;
    console.log("💡 Ketik 'replaceWaLinks()' di console untuk menjalankan ulang penggantian.");
});

// ============================================
// 7. EKSEKUSI LANGSUNG (jika script di-load setelah DOM)
// ============================================
// Jika script di-load setelah DOM siap, jalankan langsung
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log("⚠️ DOM sudah siap, menjalankan penggantian langsung...");
    // Fungsi akan dijalankan setelah event listener terdaftar
    // Ini hanya fallback
}
