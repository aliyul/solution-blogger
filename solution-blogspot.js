// main.js (gabungan show-menu-responsive.js + schema.js dengan debug)

$(function() {
  console.log("Show menu script: ready");

  // --- Menu responsive ---
  var menuVisible = false;
  $('#menuBtn').click(function() {
    console.log("Menu button clicked");
    if($(window).width() < 800){
      if (menuVisible) {
        $('#menu').css({'display':'none'});
        menuVisible = false;
        console.log("Menu hidden");
        return;
      }
      $('#menu').css({'display':'block'});
      menuVisible = true;
      console.log("Menu shown");
    }
  });

  $('#menu').click(function() {
    if($(window).width() < 800){
      $(this).css({'display':'none'});
      menuVisible = false;
      console.log("Menu hidden by click");
    }
  });

  $(window).resize(function(){
    if ( $(window).width() > 800) {
      $('#menu').css({'display':'block'});
      console.log("Window resized > 800px, menu forced visible");
    }
  });
});

// --- Schema Article & WebPage ---
document.addEventListener("DOMContentLoaded", function() {
  console.log("Schema script: DOMContentLoaded");

  const stopwords = [
    'dan','di','ke','dari','yang','untuk','pada','dengan','ini','itu','adalah',
    'juga','atau','sebagai','dalam','oleh','karena','akan','sampai','tidak',
    'dapat','lebih','kami','mereka','anda'
  ];

  const postContent = document.querySelector('.post-body.entry-content');
  const isPost = !!postContent;
  console.log("isPost:", isPost, "postContent:", postContent);

  // Halaman pengecualian WebPage
  const webPageExclusions = [
    '/p/hubungi-kami.html',
    '/p/portofolio.html',
    '/p/disclaimer.html',
    '/p/privacy-policy.html',
    '/p/terms-of-service.html',
    '/p/useful-links.html',
    '/p/about.html',
    '/p/sitemap.html'
  ];

  const currentPath = window.location.pathname;
  const isWebPage = !isPost && webPageExclusions.includes(currentPath);
  console.log("currentPath:", currentPath, "isWebPage:", isWebPage);

  if(!postContent && !isWebPage) {
    console.log("Tidak ada post atau WebPage yang cocok, keluar script");
    return;
  }

  // Judul
  const headline = document.querySelector('h1.post-title')?.textContent?.trim() || document.title || 'Beton Jaya Readymix';
  console.log("headline:", headline);

  // Deskripsi
  const description = postContent?.querySelector('p')?.textContent?.trim()
                      || document.querySelector('meta[name="description"]')?.content?.trim()
                      || 'Informasi beton cor, ready mix, dan alat berat dari Beton Jaya Readymix.';
  console.log("description:", description);

  // Gambar
  const image = postContent?.querySelector('img')?.src
                || document.querySelector('meta[property="og:image"]')?.content
                || 'https://www.betonjayareadymix.com/logo.png';
  console.log("image:", image);

  // Tanggal publish/modif
  const datePublished = document.querySelector('abbr.published')?.getAttribute('title') || '';
  const dateModified = document.querySelector('abbr.updated')?.getAttribute('title') || datePublished;
  console.log("datePublished:", datePublished, "dateModified:", dateModified);

  // Section & keywords
  const articleSection = postContent
    ? Array.from(postContent.querySelectorAll('h2,h3')).map(h => h.textContent.trim()).join(', ')
    : 'Artikel';
  const textContent = postContent?.textContent?.trim() || '';
  const words = textContent.replace(/[^a-zA-Z0-9 ]/g,'').toLowerCase()
                .split(/\s+/).filter(w => w.length > 3 && !stopwords.includes(w));
  const keywords = Array.from(new Set(words)).slice(0,50).join(', ');
  const wordCount = textContent ? textContent.split(/\s+/).length : 0;
  const articleBody = textContent || description;

  console.log("articleSection:", articleSection);
  console.log("keywords:", keywords);
  console.log("wordCount:", wordCount);

  // Schema JSON-LD
  const schema = isWebPage ? {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": headline,
    "url": window.location.href,
    "description": description,
    "publisher": {
      "@type": "Organization",
      "name": "Beton Jaya Readymix",
      "logo": { "@type": "ImageObject", "url": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png" }
    },
    "inLanguage": "id-ID"
  } : {
    "@context": "https://schema.org",
    "@type": "Article",
    "isAccessibleForFree": true,
    "mainEntityOfPage": { "@type": "WebPage", "@id": window.location.href },
    "headline": headline,
    "description": description,
    "image": [image],
    "author": { "@type": "Organization", "name": "Beton Jaya Readymix" },
    "publisher": {
      "@type": "Organization",
      "name": "Beton Jaya Readymix",
      "logo": { "@type": "ImageObject", "url": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png" }
    },
    "datePublished": datePublished,
    "dateModified": dateModified,
    "articleSection": articleSection,
    "keywords": keywords,
    "wordCount": wordCount,
    "articleBody": articleBody,
    "inLanguage": "id-ID"
  };

  console.log("Final schema object:", schema);

  // Inject schema ke body
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema, null, 2);
  document.body.appendChild(script);
  console.log("Schema injected into body");
});
