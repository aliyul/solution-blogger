$(function() {
  var menuVisible = false;
  $('#menuBtn').click(function() {
    if($(window).width() < 700){
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
    if($(window).width() < 700){
      $(this).css({'display':'none'});
      menuVisible = false;
    }
  });

  $(window).resize(function(){
    if ( $(window).width() > 700) {
      $('#menu').css({'display':'block'});
    }
  });

});
