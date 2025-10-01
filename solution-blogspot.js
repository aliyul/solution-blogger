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
  (function(){
    console.log("Auto-schema update script running");

    const stopwords = ["dan","di","ke","dari","yang","untuk","pada","dengan","ini","itu","adalah","juga","atau","sebagai","dalam","oleh","karena","akan","sampai","tidak","dapat","lebih","kami","mereka","anda"];

    // Pilih konten (post atau static page)
    const content = document.querySelector(".post-body.entry-content") || document.querySelector("[id^='post-body-']");
    if(!content){
      console.log("No content found, exiting");
      return;
    }

    // Ambil H2/H3
    const headers = Array.from(content.querySelectorAll("h2,h3")).map(h => h.textContent.trim());
    console.log("Headers found:", headers);

    // Ambil paragraf
    const paragraphs = Array.from(content.querySelectorAll("p")).map(p => p.textContent);
    console.log("Paragraphs found:", paragraphs.length);

    // Gabungkan semua teks
    const allText = headers.concat(paragraphs).join(" ");

    // Ambil kata panjang >3 huruf, filter stopwords
    const words = allText.replace(/[^a-zA-Z0-9 ]/g,"").toLowerCase().split(/\s+/)
                  .filter(w => w.length>3 && !stopwords.includes(w));
    console.log("Filtered words:", words);

    // Unique kata
    const uniqueWords = Array.from(new Set(words));
    console.log("Unique words:", uniqueWords);

    // Escape double quotes agar aman untuk JSON
    const escapeJSON = str => str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

    const keywordsStr = escapeJSON(uniqueWords.join(", "));
    const articleSectionStr = escapeJSON(headers.join(", "));
    console.log("keywordsStr:", keywordsStr);
    console.log("articleSectionStr:", articleSectionStr);

    // Update schema Article post
    const schemaPost = document.getElementById("auto-schema");
    if(schemaPost){
      let schemaText = schemaPost.textContent;
      schemaText = schemaText.replace(/"keywords"\s*:\s*""/, `"keywords": "${keywordsStr}"`);
      schemaText = schemaText.replace(/"articleSection"\s*:\s*"Artikel"/, `"articleSection": "${articleSectionStr}"`);
      schemaPost.textContent = schemaText;
      console.log("Post schema updated safely");
    }

    // Update schema Article static page
    const schemaStatic = document.getElementById("auto-schema-static-page");
    if(schemaStatic){
      let schemaText = schemaStatic.textContent;
      schemaText = schemaText.replace(/"keywords"\s*:\s*""/, `"keywords": "${keywordsStr}"`);
      schemaText = schemaText.replace(/"articleSection"\s*:\s*"Artikel"/, `"articleSection": "${articleSectionStr}"`);
      schemaStatic.textContent = schemaText;
      console.log("Static page schema updated safely");
    }

    // Optional: fallback dateModified
    const updateDateModified = el => {
      if(!el) return;
      let schemaText = el.textContent;
      schemaText = schemaText.replace(/"dateModified"\s*:\s*""/, `"dateModified": "${new Date().toISOString()}"`);
      el.textContent = schemaText;
    };
    updateDateModified(schemaPost);
    updateDateModified(schemaStatic);

  })();
});

