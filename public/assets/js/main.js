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

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const formatDate = (value) => {
    if (!value) return 'Unscheduled';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const resolveImageUrl = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('/')) return url;
    return `/${url.replace(/^\/+/, '')}`;
  };

  const postDetailsCache = new Map();

  const openBlogModal = (post) => {
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

    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      bootstrap.Modal.getOrCreateInstance(modalRoot).show();
    }
  };

  const openBlogModalBySlug = async (summary) => {
    openBlogModal({
      title: summary.title,
      author: summary.author,
      readingMinutes: summary.readingMinutes,
      publishedAt: summary.publishedAt,
      content: 'Loading article...',
      previewImageUrl: summary.previewImageUrl
    });

    if (!summary.slug) {
      openBlogModal({ ...summary, content: 'Unable to load full article.' });
      return;
    }

    if (postDetailsCache.has(summary.slug)) {
      const cached = postDetailsCache.get(summary.slug);
      openBlogModal({
        ...summary,
        content: cached.content || 'No content available.',
        previewImageUrl: resolveImageUrl(cached.preview_image_url || summary.previewImageUrl)
      });
      return;
    }

    try {
      const response = await fetch(`/api/blog/posts/${encodeURIComponent(summary.slug)}`, { method: 'GET' });
      if (!response.ok) throw new Error(`Blog detail API returned ${response.status}`);
      const payload = await response.json();
      const post = payload?.post;
      postDetailsCache.set(summary.slug, post || {});

      openBlogModal({
        ...summary,
        content: post?.content || 'No content available.',
        previewImageUrl: resolveImageUrl(post?.preview_image_url || summary.previewImageUrl)
      });
    } catch (error) {
      openBlogModal({ ...summary, content: 'Unable to load full article right now.' });
    }
  };

  const renderEmbeddedBlog = (posts, limit) => {
    const target = document.getElementById('embedded-blog-list');
    if (!target) return;

    const resolvedLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : undefined;
    const visiblePosts = resolvedLimit ? posts.slice(0, resolvedLimit) : posts;

    if (!visiblePosts.length) {
      target.innerHTML = `
        <div class="col-12">
          <div class="glass-card p-4 text-center">
            <h4 class="blog-card-title">No published insights yet</h4>
            <p class="blog-card-snippet mb-0">New thought leadership articles will appear here once published.</p>
          </div>
        </div>
      `;
      return;
    }

    target.innerHTML = visiblePosts.map((post) => `
      <div class="col-xl-4 col-lg-6 col-md-6 d-flex">
        <article class="blog-card blog-card-clickable w-100">
          ${post.preview_image_url ? `<img src="${escapeHtml(resolveImageUrl(post.preview_image_url))}" alt="${escapeHtml(post.title)}" class="blog-card-image" loading="lazy" />` : ''}
          <h4 class="blog-card-title">${escapeHtml(post.title)}</h4>
          <p class="blog-card-snippet">${escapeHtml(post.excerpt)}</p>
          <p class="blog-card-meta"><strong>By:</strong> ${escapeHtml(post.author)}</p>
          <p class="blog-card-meta"><strong>Read:</strong> ${escapeHtml(post.reading_minutes)} min | <strong>Published:</strong> ${formatDate(post.published_at)}</p>
          <button
            type="button"
            class="btn btn-primary btn-sm js-read-blog"
            data-slug="${escapeHtml(post.slug || '')}"
            data-title="${escapeHtml(post.title)}"
            data-author="${escapeHtml(post.author)}"
            data-reading-minutes="${escapeHtml(post.reading_minutes)}"
            data-published-at="${escapeHtml(post.published_at)}"
            data-preview-image-url="${escapeHtml(resolveImageUrl(post.preview_image_url || ''))}"
          >Read full article</button>
        </article>
      </div>
    `).join('');

    target.querySelectorAll('.js-read-blog').forEach((button) => {
      button.addEventListener('click', async () => {
        await openBlogModalBySlug({
          slug: button.getAttribute('data-slug') || '',
          title: button.getAttribute('data-title') || '',
          author: button.getAttribute('data-author') || '',
          readingMinutes: button.getAttribute('data-reading-minutes') || '',
          publishedAt: button.getAttribute('data-published-at') || '',
          previewImageUrl: button.getAttribute('data-preview-image-url') || ''
        });
      });
    });
  };

  const initEmbeddedBlog = async () => {
    const target = document.getElementById('embedded-blog-list');
    if (!target) return;

    const configuredLimit = Number.parseInt(target.getAttribute('data-limit') || '', 10);
    const limit = Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : undefined;

    try {
      const response = await fetch('/api/blog/posts', { method: 'GET' });
      if (!response.ok) throw new Error(`Blog API returned ${response.status}`);
      const payload = await response.json();
      renderEmbeddedBlog(Array.isArray(payload?.posts) ? payload.posts : [], limit);
    } catch (error) {
      target.innerHTML = `
        <div class="col-12">
          <div class="glass-card p-4 text-center">
            <h4 class="blog-card-title">Insights unavailable</h4>
            <p class="blog-card-snippet mb-0">We could not load published posts right now.</p>
          </div>
        </div>
      `;
    }
  };

  const initHiddenAdminEntry = () => {
    const adminKeyword = 'bread';
    let typedBuffer = '';

    window.addEventListener('keydown', (event) => {
      const isTrigger = event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'b';
      if (isTrigger) {
        window.location.href = '/blog';
        return;
      }

      if (event.ctrlKey || event.altKey || event.metaKey) return;
      if (event.key.length !== 1) return;

      typedBuffer = (typedBuffer + event.key.toLowerCase()).slice(-adminKeyword.length);
      if (typedBuffer === adminKeyword) {
        typedBuffer = '';
        window.location.href = '/blog';
      }
    });
  };

  window.addEventListener('DOMContentLoaded', () => {
    initVantaParticles();
    initGlassInteractions();
    initVendors();
    initEmbeddedBlog();
    initHiddenAdminEntry();

    const preloader = document.querySelector('#preloader');
    if (preloader) {
      setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.remove(), 500);
      }, 1000);
    }
  });

})();