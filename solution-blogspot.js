//show-menu-responsive.js
$(function() {
  var menuVisible = false;
  $('#menuBtn').click(function() {
    if($(window).width() < 800){
      if (menuVisible) {
        $('#menu').css({'display':'none'});
        menuVisible = false;
        return;
      }
      $('#menu').css({'display':'block'});
      menuVisible = true;
    }
  });
  $('#menu').click(function() {
    if($(window).width() < 800){
      $(this).css({'display':'none'});
      menuVisible = false;
    }
  });

  $(window).resize(function(){
    if ( $(window).width() > 800) {
      $('#menu').css({'display':'block'});
    }
  });

});


// schema.js
document.addEventListener("DOMContentLoaded", function() {
  const stopwords = [
    'dan','di','ke','dari','yang','untuk','pada','dengan','ini','itu','adalah',
    'juga','atau','sebagai','dalam','oleh','karena','akan','sampai','tidak',
    'dapat','lebih','kami','mereka','anda'
  ];

  const postContent = document.querySelector('.post-body.entry-content');
  const isPost = !!postContent;

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

  if(!postContent && !isWebPage) return;

  // Judul (fallback ke document.title)
  const headline = document.querySelector('h1.post-title')?.textContent?.trim() || document.title || 'Beton Jaya Readymix';

  // Deskripsi (fallback ke paragraph pertama, atau meta description)
  const description = postContent?.querySelector('p')?.textContent?.trim()
                      || document.querySelector('meta[name="description"]')?.content?.trim()
                      || 'Informasi beton cor, ready mix, dan alat berat dari Beton Jaya Readymix.';

  // Gambar utama (fallback default logo)
  const image = postContent?.querySelector('img')?.src
                || document.querySelector('meta[property="og:image"]')?.content
                || 'https://www.betonjayareadymix.com/logo.png';

  // Tanggal publish/modif (ambil abbr jika ada)
  const datePublished = document.querySelector('abbr.published')?.getAttribute('title') || '';
  const dateModified = document.querySelector('abbr.updated')?.getAttribute('title') || datePublished;

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
      "logo": { "@type": "ImageObject", "url": "https://www.betonjayareadymix.com/logo.png" }
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
      "logo": { "@type": "ImageObject", "url": "https://www.betonjayareadymix.com/logo.png" }
    },
    "datePublished": datePublished,
    "dateModified": dateModified,
    "articleSection": articleSection,
    "keywords": keywords,
    "wordCount": wordCount,
    "articleBody": articleBody,
    "inLanguage": "id-ID"
  };

  // Inject schema ke body
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema, null, 2);
  document.body.appendChild(script);
});
