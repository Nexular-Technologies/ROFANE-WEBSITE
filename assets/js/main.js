/**
* Combined & Optimized JS for Rofane Consulting
* Features: Static-Angle Three.js Particle Wave (White, 8.2 size)
* Interaction: No Cursor Movement (Fixed Perspective)
*/
(function() {
  "use strict";

  /**
   * 1. PRELOADER & HERO TEXT ANIMATION
   * Triggers the entry of the Glassmorphism card.
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
   * Camera and dots are locked and do not react to cursor position.
   */
  window.addEventListener('load', () => {
    const container = document.getElementById('vanta-canvas');
    if (!container || typeof THREE === 'undefined') return;

    // Configuration
    const SEPARATION = 45, AMOUNTX = 100, AMOUNTY = 40;
    let camera, scene, renderer, particles, count = 0;

    function init() {
      // SETUP CAMERA: Fixed at a specific angle (X=0, Y=400, Z=1000)
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
      camera.position.set(0, 400, 1000); 

      scene = new THREE.Scene();

      // SETUP PARTICLES GRID
      const numParticles = AMOUNTX * AMOUNTY;
      const positions = new Float32Array(numParticles * 3);

      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2); // x
          positions[i + 1] = 0; // y
          positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2); // z
          i += 3;
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // MATERIAL: Large White Dots (8.2 size)
      const material = new THREE.PointsMaterial({
        color: 0xffffff, 
        size: 8.2, 
        transparent: true,
        opacity: 0.7
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);

      // RENDERER SETUP
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);

      // RESPONSIVE RESIZE
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
      // Ensure camera is always looking at the center of the scene
      camera.lookAt(scene.position);

      const positions = particles.geometry.attributes.position.array;
      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          // UNDULATING MOVEMENT: Fixed sine wave logic
          positions[i + 1] = (Math.sin((ix + count) * 0.3) * 50) + (Math.sin((iy + count) * 0.5) * 50);
          i += 3;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      count += 0.04; // Speed of the wave
    }

    init();
    animate();
  });

  /**
   * 3. GLOBAL TEMPLATE LOGIC
   * Initialization for Scroll handling, AOS, and GLightbox.
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
    if (typeof AOS !== 'undefined') {
      AOS.init({ duration: 600, easing: 'ease-in-out', once: true });
    }
    if (typeof GLightbox !== 'undefined') {
      GLightbox({ selector: '.glightbox' });
    }
  });

})();