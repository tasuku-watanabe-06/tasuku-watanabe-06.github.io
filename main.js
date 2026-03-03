/**
 * ================================================================
 * TASUKU WATANABE — PERSONAL HOMEPAGE
 * main.js — Complete Vanilla JavaScript
 * ================================================================
 */

'use strict';

// ----------------------------------------------------------------
// 1. THEME MANAGEMENT
// ----------------------------------------------------------------

const ThemeManager = (() => {
  const STORAGE_KEY = 'tw-homepage-theme';
  const DEFAULT_THEME = 'default';
  const VALID_THEMES = ['default', 'turquoise', 'premium'];

  /**
   * Apply theme to document
   * @param {string} theme - one of VALID_THEMES
   */
  function applyTheme(theme) {
    if (!VALID_THEMES.includes(theme)) theme = DEFAULT_THEME;

    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);

    // Update all theme buttons (desktop + mobile)
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });

    // Persist
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // localStorage not available in some environments
    }
  }

  /**
   * Load saved theme from localStorage
   */
  function loadSavedTheme() {
    let saved = DEFAULT_THEME;
    try {
      saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
    } catch (e) {
      // Ignore
    }
    applyTheme(saved);
  }

  /**
   * Attach click listeners to all theme buttons
   */
  function bindEvents() {
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        applyTheme(theme);
      });
    });
  }

  function init() {
    loadSavedTheme();
    bindEvents();
  }

  return { init, applyTheme };
})();


// ----------------------------------------------------------------
// 2. NAVIGATION — SCROLL FROST + MOBILE MENU
// ----------------------------------------------------------------

const NavManager = (() => {
  const header = document.getElementById('navHeader');
  const hamburger = document.getElementById('navHamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  let isScrolled = false;
  let isMobileMenuOpen = false;

  function onScroll() {
    const scrolled = window.scrollY > 30;
    if (scrolled !== isScrolled) {
      isScrolled = scrolled;
      header.classList.toggle('scrolled', isScrolled);
    }
  }

  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
    hamburger.classList.toggle('is-open', isMobileMenuOpen);
    mobileMenu.classList.toggle('is-open', isMobileMenuOpen);
    hamburger.setAttribute('aria-expanded', String(isMobileMenuOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isMobileMenuOpen));

    // Prevent body scroll when menu is open
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
  }

  function closeMobileMenu() {
    if (isMobileMenuOpen) {
      isMobileMenuOpen = false;
      hamburger.classList.remove('is-open');
      mobileMenu.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  function init() {
    if (!header || !hamburger || !mobileMenu) return;

    // Scroll listener
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Run immediately

    // Hamburger toggle
    hamburger.addEventListener('click', toggleMobileMenu);

    // Close mobile menu when a link is clicked
    mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Close mobile menu on outside click
    document.addEventListener('click', (e) => {
      if (isMobileMenuOpen && !header.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu();
      }
    });

    // Smooth scroll for internal anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const offset = 80; // nav height
          const targetY = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: targetY, behavior: 'smooth' });
          closeMobileMenu();
        }
      });
    });
  }

  return { init };
})();


// ----------------------------------------------------------------
// 3. CURSOR GLOW EFFECT
// ----------------------------------------------------------------

const CursorGlow = (() => {
  const glowEl = document.getElementById('cursorGlow');

  // Only on desktop (no touch)
  const isTouch = () => window.matchMedia('(pointer: coarse)').matches;

  let rafId = null;
  let mouseX = -1000;
  let mouseY = -1000;
  let currentX = -1000;
  let currentY = -1000;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function animate() {
    currentX = lerp(currentX, mouseX, 0.12);
    currentY = lerp(currentY, mouseY, 0.12);

    glowEl.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;

    rafId = requestAnimationFrame(animate);
  }

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  function init() {
    if (!glowEl || isTouch()) {
      if (glowEl) glowEl.style.display = 'none';
      return;
    }

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    animate();

    // Dim on mouse leave
    document.addEventListener('mouseleave', () => {
      glowEl.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      glowEl.style.opacity = '1';
    });
  }

  return { init };
})();


// ----------------------------------------------------------------
// 4. INTERSECTION OBSERVER — REVEAL ANIMATIONS
// ----------------------------------------------------------------

const RevealAnimations = (() => {
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1,
  };

  function init() {
    const revealEls = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window)) {
      // Fallback: show all
      revealEls.forEach(el => {
        el.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealEls.forEach(el => observer.observe(el));
  }

  return { init };
})();


// ----------------------------------------------------------------
// 5. COUNTER ANIMATION FOR STAT BAR
// ----------------------------------------------------------------

const CounterAnimation = (() => {
  const DURATION = 1800; // ms
  const EASING_FACTOR = 4; // Higher = slower start, faster end

  /**
   * Ease out cubic
   */
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, EASING_FACTOR);
  }

  /**
   * Animate a single counter element
   */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target) || target === 0) return;

    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased = easeOutCubic(progress);
      const current = Math.round(eased * target);

      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  function init() {
    const statSection = document.getElementById('statBar');
    const counterEls = document.querySelectorAll('.stat-value.counter');

    if (!statSection || counterEls.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      counterEls.forEach(el => {
        el.textContent = el.dataset.target;
      });
      return;
    }

    let hasAnimated = false;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          counterEls.forEach(el => animateCounter(el));
          observer.disconnect();
        }
      });
    }, { threshold: 0.5 });

    observer.observe(statSection);
  }

  return { init };
})();


// ----------------------------------------------------------------
// 6. HERO PARTICLE / ORB MOUSE PARALLAX
// ----------------------------------------------------------------

const HeroParallax = (() => {
  const orbs = document.querySelectorAll('.hero-orb');
  const isTouch = () => window.matchMedia('(pointer: coarse)').matches;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let rafId = null;
  let isActive = false;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function onMouseMove(e) {
    // Normalize to -0.5 .. +0.5 range
    targetX = (e.clientX / window.innerWidth) - 0.5;
    targetY = (e.clientY / window.innerHeight) - 0.5;
  }

  function animate() {
    currentX = lerp(currentX, targetX, 0.04);
    currentY = lerp(currentY, targetY, 0.04);

    orbs.forEach((orb, i) => {
      const depth = (i + 1) * 18; // Different parallax amounts
      const x = currentX * depth;
      const y = currentY * depth;
      orb.style.transform = `translate(${x}px, ${y}px)`;
    });

    rafId = requestAnimationFrame(animate);
  }

  function init() {
    if (orbs.length === 0 || isTouch()) return;

    const hero = document.getElementById('hero');
    if (!hero) return;

    hero.addEventListener('mousemove', onMouseMove, { passive: true });

    hero.addEventListener('mouseenter', () => {
      if (!isActive) {
        isActive = true;
        animate();
      }
    });

    hero.addEventListener('mouseleave', () => {
      // Gently reset
      targetX = 0;
      targetY = 0;
    });
  }

  return { init };
})();


// ----------------------------------------------------------------
// 7. ACTIVE NAV LINK ON SCROLL
// ----------------------------------------------------------------

const ActiveNavLink = (() => {
  const sections = ['hero', 'about', 'career', 'work', 'articles'];
  const navLinks = document.querySelectorAll('.nav-link');

  function getActiveSection() {
    const scrollY = window.scrollY + 100;

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = document.getElementById(sections[i]);
      if (section && section.offsetTop <= scrollY) {
        return sections[i];
      }
    }
    return sections[0];
  }

  function updateActiveLink() {
    const active = getActiveSection();

    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('nav-link--active', href === active);
    });
  }

  function init() {
    if (navLinks.length === 0) return;

    // Add active style via CSS attribute
    navLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        link.style.color = 'var(--color-text-primary)';
      });
      link.addEventListener('mouseleave', () => {
        link.style.color = '';
      });
    });

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();
  }

  return { init };
})();


// ----------------------------------------------------------------
// 8. CARD STAGGER ANIMATION ON ENTER
// ----------------------------------------------------------------

const CardStagger = (() => {
  function init() {
    if (!('IntersectionObserver' in window)) return;

    // Stagger bento cards
    const bentoCards = document.querySelectorAll('.bento-card');
    observeGroup(bentoCards, 100);

    // Stagger timeline items (already handled by reveal--delay-n classes)
  }

  function observeGroup(elements, staggerMs) {
    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Apply stagger based on DOM order
          const index = Array.from(elements).indexOf(entry.target);
          entry.target.style.transitionDelay = `${index * staggerMs}ms`;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  return { init };
})();


// ----------------------------------------------------------------
// 9. SMOOTH SCROLL PROGRESS INDICATOR
// ----------------------------------------------------------------

const ScrollProgress = (() => {
  function createProgressBar() {
    const bar = document.createElement('div');
    bar.id = 'scrollProgressBar';
    bar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      height: 2px;
      width: 0%;
      background: var(--gradient-accent);
      z-index: 2000;
      pointer-events: none;
      transition: width 0.1s linear;
      will-change: width;
    `;
    document.body.prepend(bar);
    return bar;
  }

  function init() {
    const bar = createProgressBar();

    window.addEventListener('scroll', () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      bar.style.width = `${Math.min(progress, 100)}%`;
    }, { passive: true });
  }

  return { init };
})();


// ----------------------------------------------------------------
// 10. HERO CARD HOVER TILT EFFECT
// ----------------------------------------------------------------

const TiltEffect = (() => {
  const isTouch = () => window.matchMedia('(pointer: coarse)').matches;

  function addTilt(el) {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  }

  function init() {
    if (isTouch()) return;

    document.querySelectorAll('.bento-card').forEach(addTilt);
    document.querySelectorAll('.timeline-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -3;
        const rotateY = ((x - centerX) / centerX) * 3;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(8px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  return { init };
})();


// ----------------------------------------------------------------
// 11. PRELOADER / ENTRANCE ANIMATION
// ----------------------------------------------------------------

const EntranceAnimation = (() => {
  function init() {
    // Fade in the page body
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    window.addEventListener('load', () => {
      requestAnimationFrame(() => {
        document.body.style.opacity = '1';

        // Animate hero content with staggered entrance
        setTimeout(() => {
          const heroEyebrow = document.querySelector('.hero-eyebrow');
          const heroHeading = document.querySelector('.hero-heading');
          const heroTagline = document.querySelector('.hero-tagline');
          const heroCta = document.querySelector('.hero-cta-group');

          [heroEyebrow, heroHeading, heroTagline, heroCta].forEach((el, i) => {
            if (!el) return;
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = `opacity 0.7s ease ${i * 0.15}s, transform 0.7s ease ${i * 0.15}s`;

            setTimeout(() => {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            }, 100 + i * 150);
          });
        }, 100);
      });
    });
  }

  return { init };
})();


// ----------------------------------------------------------------
// 12. KEYBOARD NAVIGATION ENHANCEMENTS
// ----------------------------------------------------------------

const KeyboardNav = (() => {
  function init() {
    // Tab trap for mobile menu
    const mobileMenu = document.getElementById('mobileMenu');
    const hamburger = document.getElementById('navHamburger');

    if (!mobileMenu || !hamburger) return;

    document.addEventListener('keydown', (e) => {
      if (!mobileMenu.classList.contains('is-open')) return;

      if (e.key === 'Tab') {
        const focusableEls = mobileMenu.querySelectorAll(
          'a[href], button, [tabindex="0"]'
        );
        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];

        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          hamburger.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          hamburger.focus();
        }
      }
    });
  }

  return { init };
})();


// ----------------------------------------------------------------
// 13. COPY EMAIL ON CLICK (FOOTER / CONTACT)
// ----------------------------------------------------------------

const CopyEmail = (() => {
  function init() {
    const emailLinks = document.querySelectorAll('[data-copy-email]');
    emailLinks.forEach(link => {
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = link.dataset.copyEmail;
        try {
          await navigator.clipboard.writeText(email);
          const original = link.textContent;
          link.textContent = 'Copied!';
          setTimeout(() => { link.textContent = original; }, 2000);
        } catch (err) {
          // Fallback: just navigate
          window.location.href = `mailto:${email}`;
        }
      });
    });
  }

  return { init };
})();


// ----------------------------------------------------------------
// 14. PERFORMANCE: LAZY LOAD IMAGES (FUTURE-PROOF)
// ----------------------------------------------------------------

const LazyImages = (() => {
  function init() {
    if (!('IntersectionObserver' in window)) return;

    const lazyImgs = document.querySelectorAll('img[data-src]');
    if (lazyImgs.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    lazyImgs.forEach(img => observer.observe(img));
  }

  return { init };
})();


// ----------------------------------------------------------------
// 15. BENTO CARD: MAGNETIC HOVER EFFECT
// ----------------------------------------------------------------

const MagneticEffect = (() => {
  const isTouch = () => window.matchMedia('(pointer: coarse)').matches;

  function addMagneticEffect(el) {
    const strength = 0.25;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const link = el.querySelector('.bento-link, .nav-link');
      if (link) {
        link.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      }
    });

    el.addEventListener('mouseleave', () => {
      const link = el.querySelector('.bento-link, .nav-link');
      if (link) {
        link.style.transform = '';
      }
    });
  }

  function init() {
    if (isTouch()) return;
    document.querySelectorAll('.bento-card').forEach(addMagneticEffect);
  }

  return { init };
})();


// ----------------------------------------------------------------
// 16. BENTO CARD — FULL CARD CLICKABLE
// ----------------------------------------------------------------

const BentoCardClick = (() => {
  function init() {
    document.querySelectorAll('.bento-card').forEach(card => {
      // 最初のリンクを取得（bento-link または bento-social-btn）
      const primaryLink = card.querySelector('.bento-link');
      if (!primaryLink) return;

      card.addEventListener('click', (e) => {
        // すでにリンク・ボタンをクリックしている場合はスキップ
        if (e.target.closest('a') || e.target.closest('button')) return;
        primaryLink.click();
      });
    });
  }

  return { init };
})();

// ----------------------------------------------------------------
// 17. DYNAMIC YEAR IN FOOTER
// ----------------------------------------------------------------

const DynamicYear = (() => {
  function init() {
    const footerCopy = document.querySelector('.footer-copy');
    if (!footerCopy) return;

    const currentYear = new Date().getFullYear();
    footerCopy.innerHTML = footerCopy.innerHTML.replace(/\d{4}/, currentYear);
  }

  return { init };
})();


// ----------------------------------------------------------------
// 17. HERO CARD ENTRANCE SEQUENCE
// ----------------------------------------------------------------

const HeroCardEntrance = (() => {
  function init() {
    const cards = document.querySelectorAll('.hero-card');
    if (cards.length === 0) return;

    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = `${i === 1 ? 'translate(-20px, -50%)' : 'translateY(20px)'}`;
      card.style.transition = `opacity 0.8s ease ${0.8 + i * 0.2}s, transform 0.8s ease ${0.8 + i * 0.2}s`;
    });

    window.addEventListener('load', () => {
      setTimeout(() => {
        cards.forEach((card, i) => {
          card.style.opacity = '1';
          card.style.transform = i === 1 ? 'translateY(-50%)' : 'translateY(0)';
        });
      }, 300);
    });
  }

  return { init };
})();


// ----------------------------------------------------------------
// 18. APP INITIALIZATION
// ----------------------------------------------------------------

const App = {
  init() {
    // Start entrance animation first
    EntranceAnimation.init();

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  },

  setup() {
    // Core functionality
    ThemeManager.init();
    NavManager.init();
    CursorGlow.init();
    RevealAnimations.init();
    CounterAnimation.init();
    ScrollProgress.init();
    DynamicYear.init();

    // Animations & effects
    HeroParallax.init();
    HeroCardEntrance.init();
    CardStagger.init();
    TiltEffect.init();
    MagneticEffect.init();
    BentoCardClick.init();

    // Accessibility
    ActiveNavLink.init();
    KeyboardNav.init();
    CopyEmail.init();
    LazyImages.init();

    console.log(
      '%cTasuku Watanabe — Homepage',
      'color: #4F6BFF; font-size: 14px; font-weight: bold;'
    );
    console.log(
      '%cBuilt with Vanilla JS · No frameworks needed.',
      'color: #8B9BC8; font-size: 12px;'
    );
  }
};

App.init();
