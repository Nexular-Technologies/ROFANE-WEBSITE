/**
 * Rofane Consulting - Core Interactions 2026
 * Handles: Three.js Particles, GSAP Motion, and Vendor Init
 */

(function() {
  "use strict";

  /**
   * 1. Three.js Particle Wave Animation
   * Updates: Increased particle size and opacity for "Pop" on black.
   */
  const initVantaParticles = () => {
    const container = document.getElementById('vanta-canvas');
    if (!container || typeof THREE === 'undefined') return;

    const SEPARATION = 45, AMOUNTX = 100, AMOUNTY = 40;
    let camera, scene, renderer, particles, count = 0;

    function init() {
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
      camera.position.set(0, 450, 1100); 
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
      
      // ENHANCEMENT: Increased size from 3 to 4 and opacity from 0.4 to 0.7
      const material = new THREE.PointsMaterial({ 
        color: 0x00d2ff, 
        size: 4, 
        transparent: true, 
        opacity: 0.7,
        blending: THREE.AdditiveBlending // Makes overlapping particles glow brighter
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);

      window.addEventListener('resize', onWindowResize);
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
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
          positions[i + 1] = (Math.sin((ix + count) * 0.3) * 55) + (Math.sin((iy + count) * 0.5) * 55);
          i += 3;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      count += 0.03; 
    }

    init();
    animate();
  };

  /**
   * 2. Glass Card 3D Tilt & Dark Refraction
   * Updates: Switched white flash to an Electric Blue glow.
   */
  const initGlassInteractions = () => {
    document.querySelectorAll('.glass-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        
        // ENHANCEMENT: Radial gradient now uses Cyan/Blue instead of White
        card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 210, 255, 0.25) 0%, rgba(0, 0, 0, 0.5) 80%)`;
        card.style.borderColor = `rgba(0, 210, 255, 0.4)`; // Border "lights up" on hover
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        card.style.background = `rgba(0, 0, 0, 0.5)`; // Resets to dark glass
        card.style.borderColor = `rgba(255, 255, 255, 0.12)`; // Resets border
      });
    });
  };

  /**
   * 3. Vendor Initialization (AOS & GLightbox)
   */
  const initVendors = () => {
    if (typeof AOS !== 'undefined') {
      AOS.init({ duration: 1000, easing: 'ease-in-out', once: true });
    }
    if (typeof GLightbox !== 'undefined') {
      const glightbox = GLightbox({ selector: '.glightbox' });
    }
  };

  window.addEventListener('DOMContentLoaded', () => {
    initVantaParticles();
    initGlassInteractions();
    initVendors();

    const preloader = document.querySelector('#preloader');
    if (preloader) {
      setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.remove(), 500);
      }, 1000);
    }
  });

})();