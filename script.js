/* =========================================================
   CARPINTERÍA ARMANDO — script.js
   JavaScript vanilla — sin dependencias externas
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Loader ---------- */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader && loader.classList.add('is-hidden'), 300);
  });

  /* ---------- Año dinámico en footer ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Navbar dinámica al hacer scroll ---------- */
  const header = document.getElementById('header');
  const onScrollHeader = () => {
    if (window.scrollY > 40) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- Menú móvil ---------- */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  const closeMobileNav = () => {
    mobileNav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('is-open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  /* ---------- Scroll suave para anclas ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  /* ---------- Scroll Reveal (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll('.reveal, .ring-divider');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- Contadores animados ---------- */
  const counters = document.querySelectorAll('.counter__number');
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const countersSection = document.getElementById('counters');
  if (countersSection) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          counters.forEach(animateCounter);
          counterObserver.disconnect();
        }
      });
    }, { threshold: 0.4 });
    counterObserver.observe(countersSection);
  }

  /* ---------- Parallax sutil en el hero ---------- */
  const heroMedia = document.querySelector('[data-parallax] img');
  if (heroMedia) {
    window.addEventListener('scroll', () => {
      const offset = window.scrollY;
      if (offset < window.innerHeight) {
        heroMedia.style.transform = `scale(1.08) translateY(${offset * 0.15}px)`;
      }
    }, { passive: true });
  }

  /* ---------- Lightbox de galería ---------- */
  const galleryItems = Array.from(document.querySelectorAll('.gallery__item'));
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  let currentIndex = 0;

  const openLightbox = (index) => {
    currentIndex = index;
    const item = galleryItems[currentIndex];
    lightboxImg.src = item.dataset.full;
    lightboxImg.alt = item.dataset.caption || '';
    lightboxCaption.textContent = item.dataset.caption || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const showRelative = (delta) => {
    currentIndex = (currentIndex + delta + galleryItems.length) % galleryItems.length;
    openLightbox(currentIndex);
  };

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => showRelative(-1));
  lightboxNext.addEventListener('click', () => showRelative(1));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showRelative(-1);
    if (e.key === 'ArrowRight') showRelative(1);
  });

  /* ---------- Slider de testimonios (automático) ---------- */
  const track = document.getElementById('testimonialTrack');
  const dotsContainer = document.getElementById('testimonialDots');
  if (track) {
    const slides = Array.from(track.children);
    let current = 0;
    let autoplayId;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Ver testimonio ${i + 1}`);
      if (i === 0) dot.classList.add('is-active');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });
    const dots = Array.from(dotsContainer.children);

    function goTo(index) {
      current = index;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach(d => d.classList.remove('is-active'));
      dots[current].classList.add('is-active');
    }

    function nextSlide() {
      goTo((current + 1) % slides.length);
    }

    function startAutoplay() {
      autoplayId = setInterval(nextSlide, 5500);
    }
    function stopAutoplay() {
      clearInterval(autoplayId);
    }

    startAutoplay();
    track.parentElement.addEventListener('mouseenter', stopAutoplay);
    track.parentElement.addEventListener('mouseleave', startAutoplay);
  }

  /* ---------- Acordeón FAQ ---------- */
  const accordionItems = document.querySelectorAll('.accordion__item');
  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion__header');
    const body = item.querySelector('.accordion__body');

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      accordionItems.forEach(other => {
        other.classList.remove('is-open');
        other.querySelector('.accordion__body').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('is-open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Formulario de contacto ---------- */
  const form = document.getElementById('contactForm');
  if (form) {
    const successMsg = document.getElementById('formSuccess');

    const validators = {
      nombre: (v) => v.trim().length >= 2 ? '' : 'Ingresa tu nombre completo.',
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Ingresa un correo válido.',
      mensaje: (v) => v.trim().length >= 10 ? '' : 'Cuéntanos un poco más sobre tu proyecto.',
    };

    const showError = (field, message) => {
      const errorEl = document.getElementById(`err-${field}`);
      if (errorEl) errorEl.textContent = message;
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      Object.keys(validators).forEach(field => {
        const input = form.elements[field];
        const message = validators[field](input.value);
        showError(field, message);
        if (message) isValid = false;
      });

      if (!isValid) return;

      // No hay backend conectado todavía: se deja preparado el flujo de envío.
      successMsg.textContent = '¡Gracias! Tu mensaje fue enviado. Te contactaremos muy pronto.';
      form.reset();
      setTimeout(() => { successMsg.textContent = ''; }, 6000);
    });
  }

});
