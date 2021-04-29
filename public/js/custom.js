!(function($) {
    "use strict";
  
    // Stick the header at top on scroll
    $("#header").sticky({
      topSpacing: 0,
      zIndex: '50'
    });
  
    // Back to top button
    $(window).scroll(function() {
      if ($(this).scrollTop() > 100) {
        $('#header').addClass('dark-navbar');
        $('.back-to-top').fadeIn('slow');
      } else {
        $('#header').removeClass('dark-navbar');
        $('.back-to-top').fadeOut('slow');
      }
    });
  
    $('.back-to-top').click(function() {
      $('html, body').animate({
        scrollTop: 0
      }, 1500, 'easeInOutExpo');
      return false;
    });
  
    // Porfolio isotope and filter
    $(window).on('load', function() {
      var portfolioIsotope = $('.portfolio-container').isotope({
        itemSelector: '.portfolio-item',
        layoutMode: 'fitRows'
      });
  
      $('#portfolio-filters li').on('click', function() {
        $("#portfolio-filters li").removeClass('filter-active');
        $(this).addClass('filter-active');
  
        portfolioIsotope.isotope({
          filter: $(this).data('filter')
        });
        aos_init();
      });
  
      // Initiate venobox (lightbox feature used in portofilo)
      $(document).ready(function() {
        $('.venobox').venobox({
          framewidth : '800px',                           
          frameheight: '650px',                                                
          numeratio  : true,      
        });
      });
    });
  
    // Portfolio details carousel
    $(".portfolio-details-carousel").owlCarousel({
      autoplay: true,
      dots: true,
      loop: true,
      items: 1
    });
  
    // Init AOS
    function aos_init() {
      AOS.init({
        duration: 1000,
        easing: "ease-in-out",
        mirror: false
      });
    }
    $(window).on('load', function() {
      aos_init();
    });
  
  })(jQuery);