/**
* Combined & Optimized JS for Quality Engineering Landing Page
* Improvements: Fixed Duplicate Declarations, Throttled Scroll, and Safe Initialization.
*/
(function() {
  "use strict";

  /**
   * 1. PRELOADER & HERO ANIMATION
   * Merged logic to prevent duplicate declarations and sync animations.
   */
  const preloader = document.querySelector('#preloader');
  const heroContent = document.querySelector('.hero-content-fade');

  if (preloader) {
    // We use 'load' to ensure the user doesn't see a flash of unstyled content
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        
        // Trigger hero text animation immediately as preloader starts to fade
        if (heroContent) {
          heroContent.classList.add('animate-in');
        }

        // Remove from DOM after transition finishes
        setTimeout(() => preloader.remove(), 500);
      }, 350); 
    });
  }

  /**
   * 2. GLOBAL SCROLL HANDLER (Performance Optimized)
   * Using requestAnimationFrame to prevent "jank" during scrolling.
   */
  const selectBody = document.querySelector('body');
  const selectHeader = document.querySelector('#header');
  const scrollTop = document.querySelector('.scroll-top');
  const navmenulinks = document.querySelectorAll('.navmenu a');

  function handleScroll() {
    const position = window.scrollY;

    // Header sticky logic
    if (selectHeader) {
      const isSticky = selectHeader.classList.contains('scroll-up-sticky') || 
                       selectHeader.classList.contains('sticky-top') || 
                       selectHeader.classList.contains('fixed-top');
      if (isSticky) {
        position > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
      }
    }

    // Scroll-to-top button visibility
    if (scrollTop) {
      position > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }

    // Navmenu Scrollspy (Active link tracking)
    navmenulinks.forEach(link => {
      if (!link.hash) return;
      const section = document.querySelector(link.hash);
      if (!section) return;
      
      const spyPos = position + 200;
      if (spyPos >= section.offsetTop && spyPos <= (section.offsetTop + section.offsetHeight)) {
        if (!link.classList.contains('active')) {
          document.querySelectorAll('.navmenu a.active').forEach(active => active.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  }

  // Throttle scroll events to 60fps using requestAnimationFrame
  window.addEventListener('scroll', () => {
    window.requestAnimationFrame(handleScroll);
  });
  window.addEventListener('load', handleScroll);

  /**
   * 3. MOBILE NAVIGATION
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');
  
  function toggleMobileNav() {
    document.body.classList.toggle('mobile-nav-active');
    if (mobileNavToggleBtn) {
      mobileNavToggleBtn.classList.toggle('bi-list');
      mobileNavToggleBtn.classList.toggle('bi-x');
    }
  }

  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', toggleMobileNav);
  }

  // Close mobile nav when clicking a link
  document.querySelectorAll('#navmenu a').forEach(navLink => {
    navLink.addEventListener('click', () => {
      if (document.body.classList.contains('mobile-nav-active')) toggleMobileNav();
    });
  });

  // Handle dropdowns in mobile view
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(dropdownToggle => {
    dropdownToggle.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      const subMenu = this.parentNode.nextElementSibling;
      if (subMenu) subMenu.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * 4. SCROLL TOP CLICK
   */
  if (scrollTop) {
    scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /**
   * 5. EXTERNAL PLUGINS INITIALIZATION
   */
  window.addEventListener('load', () => {
    
    // Particles.js (Check if library exists)
    if (document.getElementById('particles-js') && typeof particlesJS !== 'undefined') {
      particlesJS("particles-js", {
        "particles": {
          "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
          "color": { "value": ["#0099cc", "#0055ff", "#32a0df"] },
          "shape": { "type": "circle" },
          "opacity": { "value": 0.5, "random": true, "anim": { "enable": true, "speed": 1, "opacity_min": 0.1 } },
          "size": { "value": 3, "random": true },
          "line_linked": { "enable": true, "distance": 150, "color": "#fff", "opacity": 0.5, "width": 1 },
          "move": { "enable": true, "speed": 1.5, "direction": "none", "out_mode": "out" }
        },
        "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": true, "mode": "grab" } } },
        "retina_detect": true
      });
    }

    // AOS (Animations on Scroll)
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 600,
        easing: 'ease-in-out',
        once: true,
        mirror: false
      });
    }

    // GLightbox
    if (typeof GLightbox !== 'undefined') {
      GLightbox({ selector: '.glightbox' });
    }

    // PureCounter
    if (typeof PureCounter !== 'undefined') {
      new PureCounter();
    }

    // Swiper
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      const configEl = swiperElement.querySelector(".swiper-config");
      if (configEl) {
        let config = JSON.parse(configEl.innerHTML.trim());
        new Swiper(swiperElement, config);
      }
    });

    // Isotope (Portfolio/Gallery Layout)
    if (typeof Isotope !== 'undefined') {
      document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
        let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
        let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
        let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

        let initIsotope;
        // Ensure images are loaded before calculating layout
        if (typeof imagesLoaded !== 'undefined') {
          imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
            initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
              itemSelector: '.isotope-item',
              layoutMode: layout,
              filter: filter,
              sortBy: sort
            });
          });
        }

        // Filter functionality
        isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filterBtn) {
          filterBtn.addEventListener('click', function() {
            const activeFilter = isotopeItem.querySelector('.isotope-filters .filter-active');
            if (activeFilter) activeFilter.classList.remove('filter-active');
            this.classList.add('filter-active');
            if (initIsotope) {
              initIsotope.arrange({ filter: this.getAttribute('data-filter') });
            }
            if (typeof AOS !== 'undefined') AOS.refresh();
          });
        });
      });
    }

    // Hash link correction (Handles smooth scrolling if URL has #section)
    if (window.location.hash) {
      let section = document.querySelector(window.location.hash);
      if (section) {
        setTimeout(() => {
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop || 0),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

})();