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
  let preloaderDismissed = false;

  function dismissPreloader() {
    if (preloaderDismissed) return;
    preloaderDismissed = true;

    if (heroContent) {
      heroContent.classList.add('animate-in');
    }

    if (!preloader) return;

    preloader.style.opacity = '0';
    preloader.style.visibility = 'hidden';
    setTimeout(() => preloader.remove(), 500);
  }

  window.addEventListener('load', () => {
    setTimeout(dismissPreloader, 350);
  });

  // Fallback for stalled external assets: never leave users blocked behind spinner.
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(dismissPreloader, 900);
  });

  setTimeout(dismissPreloader, 3500);

  /**
   * 2. THREE.JS PARTICLE WAVE (FIXED ANGLE)
   */
  window.addEventListener('load', () => {
    const container = document.getElementById('vanta-canvas');
    if (!container) return;
    if (typeof THREE === 'undefined') {
      container.classList.add('fallback-wave');
      return;
    }

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

  /**
   * 5. EMBEDDED BLOG + HIDDEN ADMIN ENTRY
   */
  let detectedBlogApiBase = window.location.protocol === 'file:'
    ? ''
    : window.location.origin;

  async function fetchPublishedPosts() {
    const candidates = [
      '/api/blog/posts',
      ...(window.location.protocol !== 'file:'
        ? [`${window.location.origin}/api/blog/posts`]
        : []),
      'http://localhost:3000/api/blog/posts',
      'http://localhost:3001/api/blog/posts'
    ];

    for (const endpoint of candidates) {
      try {
        const response = await fetch(endpoint, { method: 'GET' });
        if (!response.ok) continue;
        const data = await response.json();
        if (data && Array.isArray(data.posts)) {
          const endpointUrl = new URL(endpoint, window.location.origin);
          detectedBlogApiBase = `${endpointUrl.protocol}//${endpointUrl.host}`;
          return data.posts;
        }
      } catch (error) {
        continue;
      }
    }

    return [];
  }

  function formatDate(value) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function resolveImageUrl(url) {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('/')) {
      return `${detectedBlogApiBase}${url}`;
    }
    return `${detectedBlogApiBase}/${url.replace(/^\/+/, '')}`;
  }

  function openBlogModal(post) {
    const modalRoot = document.getElementById('blogPostModal');
    const title = document.getElementById('blogPostModalLabel');
    const meta = document.getElementById('blogPostModalMeta');
    const content = document.getElementById('blogPostModalContent');
    const image = document.getElementById('blogPostModalImage');
    if (!modalRoot || !title || !meta || !content || !image) return;

    title.textContent = post.title || 'Blog Post';
    meta.textContent = `By ${post.author || 'Unknown'} | ${post.readingMinutes || 0} min read | ${formatDate(post.publishedAt)}`;
    content.textContent = post.content || '';

    if (post.previewImageUrl) {
      image.src = post.previewImageUrl;
      image.style.display = 'block';
    } else {
      image.src = '';
      image.style.display = 'none';
    }

    if (window.bootstrap && typeof window.bootstrap.Modal === 'function') {
      const instance = window.bootstrap.Modal.getOrCreateInstance(modalRoot);
      instance.show();
    }
  }

  function renderEmbeddedBlog(posts) {
    const target = document.getElementById('embedded-blog-list');
    if (!target) return;

    if (!posts.length) {
      target.innerHTML = `
        <div class="col-12">
          <div class="service-item position-relative">
            <h4>No published insights yet</h4>
            <p>New thought leadership articles will appear here once published.</p>
          </div>
        </div>
      `;
      return;
    }

    target.innerHTML = posts.map((post) => `
      <div class="col-xl-4 col-lg-6 col-md-6 d-flex">
        <article class="service-item position-relative blog-card blog-card-clickable">
          ${post.preview_image_url ? `<img src="${escapeHtml(resolveImageUrl(post.preview_image_url))}" alt="${escapeHtml(post.title)}" class="blog-card-image" loading="lazy" />` : ''}
          <h4 class="blog-card-title">${escapeHtml(post.title)}</h4>
          <p class="blog-card-snippet">${escapeHtml(post.excerpt)}</p>
          <p class="blog-card-meta"><strong>By:</strong> ${escapeHtml(post.author)}</p>
          <p class="blog-card-meta"><strong>Read:</strong> ${escapeHtml(post.reading_minutes)} min &nbsp;|&nbsp; <strong>Published:</strong> ${formatDate(post.published_at)}</p>
          <button
            type="button"
            class="btn btn-primary btn-sm js-read-blog"
            data-title="${escapeHtml(post.title)}"
            data-author="${escapeHtml(post.author)}"
            data-reading-minutes="${escapeHtml(post.reading_minutes)}"
            data-published-at="${escapeHtml(post.published_at)}"
            data-content="${escapeHtml(post.content || '')}"
            data-preview-image-url="${escapeHtml(resolveImageUrl(post.preview_image_url || ''))}"
          >Read full article</button>
        </article>
      </div>
    `).join('');

    target.querySelectorAll('.js-read-blog').forEach((button) => {
      button.addEventListener('click', () => {
        openBlogModal({
          title: button.getAttribute('data-title') || '',
          author: button.getAttribute('data-author') || '',
          readingMinutes: button.getAttribute('data-reading-minutes') || '',
          publishedAt: button.getAttribute('data-published-at') || '',
          content: button.getAttribute('data-content') || '',
          previewImageUrl: button.getAttribute('data-preview-image-url') || ''
        });
      });
    });
  }

  window.addEventListener('load', async () => {
    const posts = await fetchPublishedPosts();
    renderEmbeddedBlog(posts);
  });

  const adminKeyword = 'bread';
  let typedBuffer = '';

  function resolveAdminUrl() {
    if (detectedBlogApiBase) {
      return `${detectedBlogApiBase}/admin/blog`;
    }

    if (window.location.protocol !== 'file:') {
      return `${window.location.origin}/admin/blog`;
    }

    return 'http://localhost:3000/admin/blog';
  }

  // Hidden admin trigger: press Ctrl + Shift + B to open admin editor.
  window.addEventListener('keydown', (event) => {
    const isTrigger = event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'b';
    if (isTrigger) {
      window.location.href = resolveAdminUrl();
      return;
    }

    if (event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.key.length !== 1) return;

    typedBuffer = (typedBuffer + event.key.toLowerCase()).slice(-adminKeyword.length);
    if (typedBuffer === adminKeyword) {
      typedBuffer = '';
      window.location.href = resolveAdminUrl();
    }
  });

})();