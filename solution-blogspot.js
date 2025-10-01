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
<b:if cond='data:blog.pageType == "item"'>
  <script type="application/ld+json" id="auto-schema">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "isAccessibleForFree": true,
    "mainEntityOfPage": { "@type": "WebPage", "@id": "<data:post.url/>#webpage" },
    "headline": "<data:post.title/>",
    "description": "<data:post.snippet/>",
    "image": ["<data:post.firstImageUrl data:default=\"https://blogger.googleusercontent.com/img/b/R29vZ2xl/.../s300/beton-jaya-readymix-logo.png\"/>"],
    "author": { "@type": "Organization", "name": "Beton Jaya Readymix" },
    "publisher": { "@type": "Organization", "name": "Beton Jaya Readymix",
      "logo": { "@type": "ImageObject", "url": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/.../s300/beton-jaya-readymix-logo.png" }
    },
    "datePublished": "<data:post.timestampISO8601/>",
    "dateModified": "<data:post.lastUpdatedISO8601 data:default=\"<data:post.timestampISO8601/>\"/>",
    "articleSection": "Artikel",
    "keywords": "",
    "wordCount": "<data:post.wordCount/>",
    "articleBody": "<data:post.body/>",
    "inLanguage": "id-ID"
  }
  </script>
</b:if>

<b:if cond='data:blog.pageType == "static_page"'>
  <b:if cond='data:page.url == "https://www.betonjayareadymix.com/p/hubungi-kami.html" or
               data:page.url == "https://www.betonjayareadymix.com/p/portofolio.html" or
               data:page.url == "https://www.betonjayareadymix.com/p/disclaimer.html" or
               data:page.url == "https://www.betonjayareadymix.com/p/privacy-policy.html" or
               data:page.url == "https://www.betonjayareadymix.com/p/terms-of-service.html" or
               data:page.url == "https://www.betonjayareadymix.com/p/useful-links.html" or
               data:page.url == "https://www.betonjayareadymix.com/p/about.html" or
               data:page.url == "https://www.betonjayareadymix.com/p/sitemap.html"'>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "<data:page.title/>",
      "url": "<data:page.url/>",
      "description": "<data:page.snippet/>",
      "publisher": { "@type": "Organization", "name": "Beton Jaya Readymix",
        "logo": { "@type": "ImageObject", "url": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png" }
      },
      "inLanguage": "id-ID"
    }
    </script>
  <b:else/>
    <script type="application/ld+json" id="auto-schema-static-page">
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "isAccessibleForFree": true,
        "mainEntityOfPage": { "@type": "WebPage", "@id": "<data:page.url/>#webpage" },
        "headline": "<data:page.title/>",
        "description": "<data:page.snippet/>",
        "image": ["<data:page.firstImageUrl data:default=\"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjoqm9gyMvfaLicIFnsDY4FL6_CLvPrQP8OI0dZnsH7K8qXUjQOMvQFKiz1bhZXecspCavj6IYl0JTKXVM9dP7QZbDHTWCTCozK3skRLD_IYuoapOigfOfewD7QizOodmVahkbWeNoSdGBCVFU9aFT6RmWns-oSAn64nbjOKrWe4ALkcNN9jteq5AgimyU/s300/beton-jaya-readymix-logo.png\"/>"],
        "author": { "@type": "Organization", "name": "Beton Jaya Readymix" },
        "publisher": { "@type": "Organization", "name": "Beton Jaya Readymix",
          "logo": { "@type": "ImageObject", "url": "https://www.betonjayareadymix.com/logo.png" }
        },
        "datePublished": "<data:page.timestampISO8601/>",
        "dateModified": "<data:page.lastUpdatedISO8601 data:default=\"<data:page.timestampISO8601/>\"/>",
        "articleSection": "Artikel",
        "keywords": "",
        "wordCount": "<data:page.wordCount/>",
        "articleBody": "<data:page.body/>",
        "inLanguage": "id-ID"
      }
    </script>
  </b:else>
</b:if>

});
