(() => {
  'use strict';

  document.documentElement.classList.remove('no-js');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader = document.querySelector('.site-loader');
  const header = document.querySelector('[data-header]');
  const navToggle = document.querySelector('.nav-toggle');
  const primaryNav = document.querySelector('.primary-nav');
  const progressBar = document.querySelector('.scroll-progress span');
  const cursorGlow = document.querySelector('.cursor-glow');

  const hideLoader = () => {
    if (!loader) return;
    loader.classList.add('is-hidden');
    window.setTimeout(() => loader.remove(), 800);
  };

  if (document.readyState === 'complete') {
    window.setTimeout(hideLoader, 300);
  } else {
    window.addEventListener('load', () => window.setTimeout(hideLoader, 450), { once: true });
    window.setTimeout(hideLoader, 2600);
  }

  if (navToggle && primaryNav) {
    const closeMenu = () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open navigation');
      primaryNav.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    };

    navToggle.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      navToggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
      primaryNav.classList.toggle('is-open', !open);
      document.body.classList.toggle('menu-open', !open);
    });

    primaryNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  let lastScrollY = window.scrollY;
  let scrollTicking = false;

  const updateScrollUI = () => {
    const currentY = window.scrollY;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = scrollable > 0 ? (currentY / scrollable) * 100 : 0;

    if (progressBar) progressBar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;

    if (header) {
      header.classList.toggle('is-scrolled', currentY > 30);
      const shouldHide = currentY > lastScrollY && currentY > 320 && !document.body.classList.contains('menu-open');
      header.classList.toggle('is-hidden', shouldHide);
    }

    lastScrollY = Math.max(0, currentY);
    scrollTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(updateScrollUI);
      scrollTicking = true;
    }
  }, { passive: true });
  updateScrollUI();

  if (cursorGlow && !prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', (event) => {
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
    }, { passive: true });
  }

  const revealItems = document.querySelectorAll('.reveal-up, .reveal-scale');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const siblings = Array.from(entry.target.parentElement?.children || []);
        const index = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${Math.min(index * 65, 260)}ms`;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -55px' });

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const typingElement = document.querySelector('.typing-line[data-phrases]');
  if (typingElement && !prefersReducedMotion) {
    const phrases = typingElement.dataset.phrases.split('|').map((phrase) => phrase.trim()).filter(Boolean);
    let phraseIndex = 0;
    let characterIndex = phrases[0]?.length || 0;
    let deleting = true;

    const typeLoop = () => {
      const phrase = phrases[phraseIndex];
      if (!phrase) return;

      characterIndex += deleting ? -1 : 1;
      typingElement.textContent = phrase.slice(0, characterIndex);

      let delay = deleting ? 42 : 72;
      if (!deleting && characterIndex === phrase.length) {
        deleting = true;
        delay = 1550;
      } else if (deleting && characterIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 320;
      }
      window.setTimeout(typeLoop, delay);
    };

    window.setTimeout(typeLoop, 1700);
  }

  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    const animateCounter = (element) => {
      const target = Number(element.dataset.counter || 0);
      const duration = 1100;
      const started = performance.now();

      const frame = (now) => {
        const progress = Math.min((now - started) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = String(Math.round(target * eased)).padStart(2, '0');
        if (progress < 1) window.requestAnimationFrame(frame);
      };
      window.requestAnimationFrame(frame);
    };

    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.6 });
      counters.forEach((counter) => counterObserver.observe(counter));
    } else {
      counters.forEach((counter) => animateCounter(counter));
    }
  }

  const interactiveCards = document.querySelectorAll('[data-tilt]');
  if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    interactiveCards.forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rotateX = ((y / rect.height) - 0.5) * -7;
        const rotateY = ((x / rect.width) - 0.5) * 7;
        card.style.setProperty('--x', `${(x / rect.width) * 100}%`);
        card.style.setProperty('--y', `${(y / rect.height) * 100}%`);
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });

    document.querySelectorAll('.magnetic').forEach((element) => {
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        element.style.transform = `translate(${x * 0.12}px, ${y * 0.16}px)`;
      });
      element.addEventListener('pointerleave', () => {
        element.style.transform = '';
      });
    });
  }

  document.querySelectorAll('.venture-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--y', `${event.clientY - rect.top}px`);
    });
  });

  document.querySelectorAll('.faq-list details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      const group = detail.closest('.faq-list');
      group?.querySelectorAll('details[open]').forEach((other) => {
        if (other !== detail) other.removeAttribute('open');
      });
    });
  });

  const whatsappForm = document.querySelector('#whatsapp-form');
  if (whatsappForm) {
    whatsappForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!whatsappForm.reportValidity()) return;

      const data = new FormData(whatsappForm);
      const name = String(data.get('name') || '').trim();
      const company = String(data.get('company') || '').trim();
      const service = String(data.get('service') || '').trim();
      const message = String(data.get('message') || '').trim();

      const text = [
        'Hello Mohammad,',
        '',
        `My name is ${name}.`,
        company ? `Company: ${company}` : '',
        `Area of interest: ${service}`,
        '',
        message,
        '',
        'I submitted this enquiry through mohfatemi.com.'
      ].filter(Boolean).join('\n');

      const url = `https://wa.me/971561000991?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  // Keep official ecosystem cards usable if a remote logo host blocks hotlinking.
  document.querySelectorAll('img[data-token-logo]').forEach((image) => {
    const handleLogoError = () => {
      const secondarySource = image.dataset.secondaryFallbackSrc;
      const localFallback = image.dataset.fallbackSrc;

      if (secondarySource && image.dataset.secondaryAttempted !== 'true') {
        image.dataset.secondaryAttempted = 'true';
        image.src = secondarySource;
        return;
      }

      if (localFallback && image.dataset.localFallbackAttempted !== 'true') {
        image.dataset.localFallbackAttempted = 'true';
        image.src = localFallback;
        return;
      }

      image.parentElement?.classList.add('token-logo-load-failed');
    };

    image.addEventListener('error', handleLogoError);
    if (image.complete && image.naturalWidth === 0) handleLogoError();
  });

  const year = document.querySelector('#current-year');
  if (year) year.textContent = String(new Date().getFullYear());

  const canvas = document.querySelector('#network-canvas');
  if (canvas instanceof HTMLCanvasElement && !prefersReducedMotion) {
    const context = canvas.getContext('2d', { alpha: true });
    if (context) {
      let width = 0;
      let height = 0;
      let particles = [];
      let animationFrame = 0;
      const pointer = { x: -1000, y: -1000 };

      const resizeCanvas = () => {
        const rect = canvas.getBoundingClientRect();
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        width = Math.max(1, Math.floor(rect.width));
        height = Math.max(1, Math.floor(rect.height));
        canvas.width = Math.floor(width * ratio);
        canvas.height = Math.floor(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);

        const count = Math.min(90, Math.max(36, Math.floor((width * height) / 17000)));
        particles = Array.from({ length: count }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: Math.random() * 1.2 + 0.35
        }));
      };

      const drawNetwork = () => {
        context.clearRect(0, 0, width, height);

        particles.forEach((particle, index) => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          if (particle.x < 0 || particle.x > width) particle.vx *= -1;
          if (particle.y < 0 || particle.y > height) particle.vy *= -1;

          const dxPointer = pointer.x - particle.x;
          const dyPointer = pointer.y - particle.y;
          const pointerDistance = Math.hypot(dxPointer, dyPointer);
          if (pointerDistance < 150 && pointerDistance > 0) {
            particle.x -= dxPointer * 0.0008;
            particle.y -= dyPointer * 0.0008;
          }

          context.beginPath();
          context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
          context.fillStyle = 'rgba(214, 179, 106, 0.55)';
          context.fill();

          for (let j = index + 1; j < particles.length; j += 1) {
            const other = particles[j];
            const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
            if (distance < 118) {
              context.beginPath();
              context.moveTo(particle.x, particle.y);
              context.lineTo(other.x, other.y);
              context.strokeStyle = `rgba(201, 206, 214, ${0.13 * (1 - distance / 118)})`;
              context.lineWidth = 0.7;
              context.stroke();
            }
          }
        });

        animationFrame = window.requestAnimationFrame(drawNetwork);
      };

      canvas.addEventListener('pointermove', (event) => {
        const rect = canvas.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
      }, { passive: true });
      canvas.addEventListener('pointerleave', () => {
        pointer.x = -1000;
        pointer.y = -1000;
      });

      resizeCanvas();
      drawNetwork();
      window.addEventListener('resize', resizeCanvas, { passive: true });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          window.cancelAnimationFrame(animationFrame);
        } else {
          drawNetwork();
        }
      });
    }
  }
})();
