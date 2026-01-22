/**
* Combined & Optimized JS for Rofane Consulting
* Features: Three.js Particle Wave, Swiper Carousels, Scroll Handling, AOS, and GLightbox
*/
(function() {
  "use strict";

  /**
   * 1. PRELOADER & HERO TEXT ANIMATION
   */
  const preloader = document.querySelector('#preloader');
  const heroContent = document.querySelector('.hero-content-fade');

  window.addEventListener('load', () => {
    if (preloader) {
      setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        
        if (heroContent) {
          heroContent.classList.add('animate-in');
        }

        setTimeout(() => preloader.remove(), 500);
      }, 350); 
    } else {
      if (heroContent) heroContent.classList.add('animate-in');
    }
  });

  /**
   * 2. THREE.JS PARTICLE WAVE (FIXED ANGLE)
   */
  window.addEventListener('load', () => {
    const container = document.getElementById('vanta-canvas');
    if (!container || typeof THREE === 'undefined') return;

    const SEPARATION = 45, AMOUNTX = 100, AMOUNTY = 40;
    let camera, scene, renderer, particles, count = 0;

    function init() {
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
      camera.position.set(0, 400, 1000); 

      scene = new THREE.Scene();

      const numParticles = AMOUNTX * AMOUNTY;
      const positions = new Float32Array(numParticles * 3);

      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2);
          positions[i + 1] = 0;
          positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);
          i += 3;
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({
        color: 0xffffff, 
        size: 8.2, 
        transparent: true,
        opacity: 0.7
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    }

    function animate() {
      requestAnimationFrame(animate);
      render();
    }

    function render() {
      camera.lookAt(scene.position);
      const positions = particles.geometry.attributes.position.array;
      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          positions[i + 1] = (Math.sin((ix + count) * 0.3) * 50) + (Math.sin((iy + count) * 0.5) * 50);
          i += 3;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      count += 0.04; 
    }

    init();
    animate();
  });

  /**
   * 3. SWIPER CAROUSEL INITIALIZATION
   * Handles both the Client logos and Testimonial sliders.
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper, .init-swiper-clients").forEach(function(swiperElement) {
      let configElement = swiperElement.querySelector(".swiper-config");
      if (configElement) {
        let config = JSON.parse(configElement.innerHTML.trim());
        new Swiper(swiperElement, config);
      }
    });
  }

  /**
   * 4. GLOBAL LOGIC & SCROLL
   */
  const selectHeader = document.querySelector('#header');
  const scrollTop = document.querySelector('.scroll-top');

  function handleScroll() {
    const position = window.scrollY;
    if (selectHeader) {
      position > 100 ? document.body.classList.add('scrolled') : document.body.classList.remove('scrolled');
    }
    if (scrollTop) {
      position > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }

  window.addEventListener('scroll', () => window.requestAnimationFrame(handleScroll));

  window.addEventListener('load', () => {
    // Init AOS
    if (typeof AOS !== 'undefined') {
      AOS.init({ duration: 600, easing: 'ease-in-out', once: true });
    }
    
    // Init GLightbox
    if (typeof GLightbox !== 'undefined') {
      GLightbox({ selector: '.glightbox' });
    }

    // Init All Swipers
    if (typeof Swiper !== 'undefined') {
      initSwiper();
    }
  });

})();