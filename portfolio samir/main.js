/* ══════════════════════════════════════════════════════════════
   CODING CRABS — main.js
   GSAP + Lenis + ScrollTrigger · all animations intact
   ══════════════════════════════════════════════════════════════ */

/* ─── 1. REGISTER PLUGINS FIRST ─── */
gsap.registerPlugin(ScrollTrigger);

/* ─── 2. SMOOTH SCROLL (Lenis) ─── */
const lenis = new Lenis({
  duration:  1.4,                                    // scroll travel time (seconds)
  lerp:      0.08,                                   // linear interpolation — lower = silkier
  easing:    (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo ease-out
  smoothWheel: true,
  smoothTouch: false,                                // leave native on mobile
  wheelMultiplier: 0.9,
  touchMultiplier: 2,
  infinite:  false,
});

lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ─── 3. CUSTOM CURSOR ─── */
const cursors = document.querySelectorAll(".site-cursor");
if (cursors.length) {
  window.addEventListener("mousemove", (e) => {
    cursors.forEach((c, i) => {
      gsap.to(c, {
        x: e.clientX,
        y: e.clientY,
        duration: i === 0 ? 0.6 : 0.15,
        ease: i === 0 ? "power3.out" : "none",
        overwrite: true,
      });
    });
  });

  /* scale cursor on interactive elements */
  document.querySelectorAll("a, button, .listItem, .carousel-item, .contact-box").forEach((el) => {
    el.addEventListener("mouseenter", () =>
      gsap.to(cursors[0], { scale: 1.8, duration: 0.3 })
    );
    el.addEventListener("mouseleave", () =>
      gsap.to(cursors[0], { scale: 1, duration: 0.3 })
    );
  });
}

/* ─── 4. PRELOADER → HERO ENTRANCE TIMELINE ─── */
const tl = gsap.timeline();

tl.to(".preloader", {
    y: "-100%",
    borderRadius: "10% 10% 36% 39% / 10% 10% 55% 56%",
    duration: 1,
    ease: "power2.out",
  })
  .add(() => {
    const pl = document.querySelector(".preloader");
    if (pl) pl.style.display = "none";
  })
  .from(".navbar", { duration: 0.8, y: "-100%", ease: "power2.out" })
  .add(() => {
    /* Hero liquid SVG paths */
    const paths = document.querySelectorAll(".heroHeading svg path");
    paths.forEach((p) => (p.style.transform = "translateY(100%)"));
    gsap.to(paths, { y: 0, opacity: 1, stagger: 0.18, duration: 1, ease: "power2.out" });
  })
  .from(".hero__meta",   { y: 20, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.6")
  .from(".left svg",     { y: 30, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=.5")
  .from(".left p",       { y: 30, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=.4")
  .from(".leftBtn",      { y: 30, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=.4")
  .from(".middle",       { y: 30, opacity: 0, duration: 1,   ease: "power2.out" }, "-=.4")
  .from(".right p",      { y: 30, opacity: 0, duration: 1,   ease: "power2.out" }, "-=.4")
  .from(".right h2",     { y: 30, opacity: 0, duration: 1,   ease: "power2.out" }, "-=.4")
  .from(".marquee-strip",{ y: 20, opacity: 0, duration: 0.8, ease: "power2.out" }, "-=.6")
  .from(".stats-bar",    { y: 20, opacity: 0, duration: 0.8, ease: "power2.out" }, "-=.6");

gsap.set("#page", {
  opacity: 0.873618,
  transform: "translateY(5.05529px) scale(0.993681) translateZ(0px)",
});

/* ─── 5. PAGE2 (SERVICES) — heading reveal ─── */
const texts = document.querySelectorAll("#page2 h2 span");
texts.forEach((t) => gsap.set(t, { y: "100%", opacity: 0 }));
gsap.to(texts, {
  y: 0, opacity: 1, stagger: 0.15, duration: 1, ease: "power4.out",
  scrollTrigger: {
    trigger: "#page2", start: "top 95%",
    toggleActions: "play none none none",
  },
});

/* ─── 6. PAGE2 — pinned service cards ─── */
gsap.to(".ek", {
  scrollTrigger: { trigger: ".ek", start: "top 10%", end: "bottom -27%", scrub: true, pin: true, pinSpacing: false },
});
gsap.to(".do", {
  scrollTrigger: { trigger: ".do", start: "top 27%", end: "bottom 40%", scrub: true, pin: true, pinSpacing: false },
});
gsap.to(".tin", {
  scrollTrigger: { trigger: ".tin", start: "top 45%", end: "bottom 100%", scrub: true, pin: true, pinSpacing: false },
});

/* ─── 7. PAGE3 (WORKS) — heading reveal ─── */
const text3 = document.querySelectorAll("#page3 h2 span");
text3.forEach((t) => gsap.set(t, { y: "100%", opacity: 0 }));
gsap.to(text3, {
  y: 0, opacity: 1, stagger: 0.15, duration: 1, ease: "power4.out",
  scrollTrigger: {
    trigger: "#page3", start: "top 95%",
    toggleActions: "play none none none",
  },
});

/* ─── 8. SCROLL-REVEAL for misc elements ─── */
gsap.utils.toArray(".contact-box, .stat").forEach((el, i) => {
  gsap.from(el, {
    y: 24, opacity: 0, duration: 0.7,
    delay: i * 0.08, ease: "power2.out",
    scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
  });
});

/* ─── 9. MOBILE PROJECT SHOWCASE (snap-scroll + IntersectionObserver) ─── */
(function () {
  /* Only runs on mobile — desktop keeps the renaissance scroll untouched */
  if (window.innerWidth > 768) return;

  const section   = document.getElementById('carousel-section');
  const track     = document.getElementById('proj-track');
  const fill      = document.getElementById('proj-progress-fill');
  const curEl     = document.getElementById('proj-counter-cur');
  const dotsWrap  = document.getElementById('proj-dots');
  const slides    = document.querySelectorAll('.proj-slide');
  const dots      = document.querySelectorAll('.proj-dot');

  if (!section || !slides.length) return;

  const total = slides.length;
  let   activeIdx = 0;

  /* ── Update UI: counter + dots + progress bar ── */
  function setActive(idx) {
    if (idx === activeIdx && curEl.textContent !== '') return;
    activeIdx = idx;

    /* Counter flip animation */
    if (curEl) {
      curEl.style.transform = 'translateY(-6px)';
      curEl.style.opacity   = '0';
      setTimeout(() => {
        curEl.textContent   = String(idx + 1).padStart(2, '0');
        curEl.style.transform = '';
        curEl.style.opacity   = '1';
      }, 160);
    }

    /* Progress bar */
    if (fill) {
      fill.style.width = ((idx / (total - 1)) * 100).toFixed(1) + '%';
    }

    /* Dots */
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  /* ── IntersectionObserver — fires when each slide is ≥50% visible ── */
  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = parseInt(entry.target.dataset.idx, 10);
        setActive(idx);

        /* Lazy-load video when slide comes into view */
        const vid = entry.target.querySelector('video');
        if (vid && !vid.src && vid.dataset.src) {
          vid.src = vid.dataset.src;
          vid.play().catch(() => {});
        }
      }
    });
  }, { threshold: 0.5 });

  slides.forEach(s => slideObserver.observe(s));

  /* ── Show/hide dot nav when section is in viewport ── */
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (dotsWrap) dotsWrap.classList.toggle('visible', entry.isIntersecting);
    });
  }, { threshold: 0.05 });

  sectionObserver.observe(section);

  /* ── Dot click: scroll to that slide ── */
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      slides[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ── Init first slide ── */
  setActive(0);
})();

/* ─── 10. RENAISSANCE SECTION (CSS sticky left col + colour transitions) ─── */
/*
  The left column sticking is handled entirely by CSS `position:sticky`
  (works perfectly with Lenis because Lenis uses the native scroll container).
  The old ScrollTrigger `pin:true` fought CSS sticky and broke both — removed.
*/
(function () {
  const root = document.getElementById("renaissance-section");
  if (!root) return;

  window.addEventListener("load", () => {

    /* Refresh ScrollTrigger after all images have loaded & layout is final */
    ScrollTrigger.refresh();

    const masters = root.querySelectorAll("[data-master]");
    if (!masters.length) return;

    /* Background colour transitions when each master scrolls into view */
    const themes = [
      { bg: "var(--bg-3)",  text: "var(--text)" },
      { bg: "var(--bg)",    text: "var(--text)" },
      { bg: "#1a1510",      text: "var(--text)" },
    ];

    masters.forEach((sec, idx) => {
      if (!themes[idx]) return;
      gsap.timeline({
        scrollTrigger: {
          trigger: sec,
          start: "top 40%",
          end:   "top 40%",
          scrub: 1,
        },
      }).to(root, {
        "--r-bg":   themes[idx].bg,
        "--r-text": themes[idx].text,
      });
    });

    /* Fade-in each image as it enters the viewport */
    root.querySelectorAll(".rounded-xl").forEach((img) => {
      gsap.fromTo(img,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
          scrollTrigger: {
            trigger: img,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );
    });

  });
})();

/* ─── 11. MEDIA GRID (interactive SVG skills grid) ─── */
(function () {
  const section = document.querySelector(".media-grid-section");
  if (!section) return;

  const stage = section.querySelector(".stage");
  const grid  = section.querySelector(".grid");
  const close = section.querySelector(".close");
  let mPos = { x: 50, y: 50 };

  const myMedia = [
    "assets/Ajs.png","assets/aws.jpg","assets/css.png","assets/doc.png",
    "assets/dotnet.png","assets/ex.webp","assets/figma.png","assets/fire.png",
    "assets/flutterflow.jpeg","assets/git.png","assets/html.png","assets/jav.png",
    "assets/jenk.jpeg","assets/jir.png","assets/js.webp","assets/jub.png",
    "assets/n.png","assets/node.png","assets/npm.png","assets/php.png",
    "assets/py.png","assets/react.png","assets/sql.webp","assets/supa.webp",
    "assets/tail.png","assets/wp.png",
    "assets/Ajs.png","assets/aws.jpg","assets/css.png","assets/doc.png",
    "assets/dotnet.png","assets/ex.webp","assets/figma.png","assets/fire.png",
    "assets/flutterflow.jpeg","assets/git.png","assets/html.png","assets/jav.png",
    "assets/jenk.jpeg","assets/jir.png","assets/js.webp","assets/jub.png",
    "assets/n.png","assets/node.png","assets/npm.png","assets/php.png",
    "assets/py.png","assets/react.png","assets/sql.webp","assets/supa.webp",
    "assets/tail.png","assets/wp.png",
    "assets/Ajs.png","assets/aws.jpg","assets/css.png","assets/doc.png",
    "assets/dotnet.png","assets/ex.webp","assets/figma.png","assets/fire.png",
    "assets/flutterflow.jpeg","assets/git.png","assets/html.png","assets/jav.png",
    "assets/jenk.jpeg","assets/jir.png","assets/js.webp","assets/jub.png",
    "assets/n.png","assets/node.png","assets/npm.png","assets/php.png",
    "assets/py.png","assets/react.png","assets/sql.webp","assets/supa.webp",
    "assets/tail.png","assets/wp.png",
  ];

  initializeGrid(myMedia);

  function initializeGrid(mediaArray) {
    grid.innerHTML = "";
    let i = 0;
    for (let x = 1; x < 10; x++) {
      for (let y = 1; y < 10; y++) {
        if (i < mediaArray.length) makePt(x * 10, y * 10, mediaArray[i], i);
        i++;
      }
    }
    const pts = section.querySelectorAll(".pt");
    gsap.to(mPos, {
      duration: 1, ease: "expo.in", x: 50, y: 50,
      onUpdate: () => { pts.forEach(redraw); },
    });
  }

  function makePt(x, y, mediaSrc, index) {
    const g     = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const depth = gsap.utils.random(0.8, 1);
    grid.append(g);
    gsap.set(g, { x, y, attr: { class: "pt" }, svgOrigin: "50 50", scale: depth });

    let element;
    const isVideoFile = isVideo(mediaSrc);

    if (isVideoFile) {
      element = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
      const video = document.createElement("video");
      video.src = mediaSrc; video.muted = true; video.loop = true; video.autoplay = true;
      video.style.cssText = "width:100%;height:100%;object-fit:cover";
      element.appendChild(video);
      gsap.set(element, { attr: { class: "img", id: "img" + index, width: 14, height: 14, x: -7, y: -7 } });
    } else {
      element = document.createElementNS("http://www.w3.org/2000/svg", "image");
      gsap.set(element, { attr: { class: "img", id: "img" + index, href: mediaSrc } });
      gsap.to(element, { duration: 0.5, x: -7, y: -7, attr: { width: 14, height: 14 } });
    }

    g.appendChild(element);
    element.mediaType = isVideoFile ? "video" : "image";
    element.mediaSrc  = mediaSrc;

    element.onpointerenter = () => {
      gsap.to(section.querySelector(".tip"), { duration: 0.3, ease: "power3", scale: 1 });
      section.querySelector(".tip text").textContent =
        element.mediaType === "video" ? `Video ${index + 1}` : `Skill ${index + 1}`;
    };
    element.onpointerleave = () => {
      gsap.to(section.querySelector(".tip"), { duration: 0.3, ease: "power3.inOut", scale: 0 });
    };
    element.onpointerup = () => {
      const heroImage         = section.querySelector(".hero image");
      const heroVideo         = section.querySelector(".hero foreignObject video");
      const heroForeignObject = section.querySelector(".hero foreignObject");
      if (element.mediaType === "video") {
        gsap.timeline()
          .set(heroImage, { attr: { href: "" } }, 0)
          .set(heroForeignObject, { attr: { style: "display:block" } }, 0)
          .set(heroVideo, { attr: { src: element.mediaSrc } }, 0)
          .to(section.querySelector(".tip"), { ease: "power3.inOut", scale: 0 }, 0)
          .to(section.querySelectorAll(".img"), { opacity: 0 }, 0)
          .to(section.querySelector(".hero"), { autoAlpha: 1 }, 0.5);
      } else {
        gsap.timeline()
          .set(heroForeignObject, { attr: { style: "display:none" } }, 0)
          .set(heroImage, { attr: { width: 94, height: 94, x: 3, y: 3, href: element.mediaSrc } }, 0)
          .to(section.querySelector(".tip"), { ease: "power3.inOut", scale: 0 }, 0)
          .to(section.querySelectorAll(".img"), { opacity: 0 }, 0)
          .to(section.querySelector(".hero"), { autoAlpha: 1 }, 0.5);
      }
    };
  }

  close.onpointerup = () => {
    gsap.timeline()
      .to(section.querySelector(".hero"),                { autoAlpha: 0 }, 0)
      .set(section.querySelector(".hero image"),         { attr: { href: "" } }, 0.5)
      .set(section.querySelector(".hero foreignObject"), { attr: { style: "display:none" } }, 0.5)
      .set(section.querySelector(".hero video"),         { attr: { src: "" } }, 0.5)
      .to(section.querySelectorAll(".img"),              { opacity: 1 }, 0.5);
  };

  function redraw(t) {
    const element = t.querySelector(".img");
    const x = gsap.getProperty(t, "x");
    const y = gsap.getProperty(t, "y");
    const dist = Math.abs(x - mPos.x) + Math.abs(y - mPos.y);
    gsap.to(element, { duration: 0.7, scale: Math.max(1 - dist / 100, 0), attr: { x: x - mPos.x, y: y - mPos.y } });
  }

  window.addEventListener("pointermove", (e) => {
    const domPt = new DOMPoint(e.x, e.y);
    const svgPt = domPt.matrixTransform(stage.getScreenCTM().inverse());
    gsap.set(mPos, { x: svgPt.x, y: svgPt.y });
    gsap.to(section.querySelector(".tip"), { x: e.x, y: e.y, ease: "expo" });
    section.querySelectorAll(".pt").forEach(redraw);
  });

  function isVideo(src) { return /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(src); }

  gsap.set(section.querySelector(".tip"),   { scale: 0, transformOrigin: "0 15px", pointerEvents: "none" });
  gsap.set(section.querySelector(".tip *"), { y: -50, xPercent: -50 });
  gsap.set(section.querySelector(".close"), { x: 90, y: 5 });
  gsap.set(section.querySelector(".hero"),  { autoAlpha: 0 });
})();

/* ─── 12. CONTACT FORM — EmailJS ─── */
/*
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  SETUP STEPS (one-time, takes ~5 min):                              │
 * │                                                                     │
 * │  1. Go to https://www.emailjs.com and sign up (free)                │
 * │  2. Dashboard → Email Services → Add New Service                    │
 * │     → Choose Gmail → connect samirepili21@gmail.com                 │
 * │     → copy the Service ID, paste below as EMAILJS_SERVICE_ID        │
 * │  3. Dashboard → Email Templates → Create New Template               │
 * │     Paste this in the template body:                                 │
 * │     From:    {{from_name}} <{{from_email}}>                         │
 * │     Phone:   {{phone}}                                               │
 * │     Subject: {{subject}}                                             │
 * │     Message: {{message}}                                             │
 * │     → Save, copy the Template ID → paste as EMAILJS_TEMPLATE_ID     │
 * │  4. Dashboard → Account → Public Key                                │
 * │     → paste as EMAILJS_PUBLIC_KEY                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 */

(function () {

   /* ── PASTE YOUR THREE KEYS HERE ── */
  const EMAILJS_PUBLIC_KEY   = "p2tEDL7iIkLw5XOj1";      // e.g. "abc123XYZ"
  const EMAILJS_SERVICE_ID   = "YOUR_SERVICE_ID";      // e.g. "service_xxxxxx"
  const EMAILJS_TEMPLATE_ID  = "template_90irx6l";     // e.g. "template_xxxxxx"
  /* ────────────────────────────── */

  /* Initialise EmailJS with your public key */
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

  const form    = document.getElementById("contact-form");
  if (!form) return;

  const btn          = document.getElementById("ct-submit");
  const successEl    = document.getElementById("contact-success");
  const errorEl      = document.getElementById("contact-error");

  function setLoading(on) {
    if (!btn) return;
    btn.disabled = on;
    if (on) {
      btn.classList.add("loading");
    } else {
      btn.classList.remove("loading");
    }
  }

  function reveal(el, show) {
    if (!el) return;
    // success uses flexbox, error uses block
    const displayType = el.classList.contains("ct-success") ? "flex" : "block";
    el.style.display = show ? displayType : "none";
    if (show) gsap.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    /* Hide any previous messages */
    reveal(successEl, false);
    reveal(errorEl,   false);

    /* Collect fields — names match the template variables */
    const fields = {
      from_name:  form.querySelector("[name='name']").value.trim(),
      from_email: form.querySelector("[name='email']").value.trim(),
      phone:      form.querySelector("[name='phone']").value.trim()   || "Not provided",
      subject:    form.querySelector("[name='subject']").value.trim() || "No subject",
      message:    form.querySelector("[name='message']").value.trim(),
      to_email:   "samirepili21@gmail.com",
    };

    /* Basic client-side validation */
    if (!fields.from_name || !fields.from_email || !fields.message) {
      reveal(errorEl, true);
      if (errorEl) errorEl.textContent = "⚠ Please fill in your name, email and message.";
      return;
    }

    setLoading(true);

    emailjs
      .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, fields)
      .then(() => {
        setLoading(false);
        reveal(successEl, true);
        form.reset();
      })
      .catch((err) => {
        setLoading(false);
        reveal(errorEl, true);
        if (errorEl) errorEl.textContent = "⚠ Failed to send message. Please email samirepili21@gmail.com directly.";
        console.error("EmailJS error:", err);
      });
  });

})();

/* ─── 13. THEME TOGGLE (dark ↔ light) ─── */
(function () {
  const STORAGE_KEY = 'cc-theme';
  const root        = document.documentElement;
  const btn         = document.getElementById('theme-toggle');

  /* Read saved preference, fall back to OS preference */
  function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  /* Apply theme — light gets data-theme attr, dark removes it */
  function applyTheme(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
    /* Refresh ScrollTrigger after colour transition completes */
    if (typeof ScrollTrigger !== 'undefined') {
      setTimeout(() => ScrollTrigger.refresh(), 380);
    }
  }

  /* Toggle, persist, animate button */
  function toggleTheme() {
    const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next    = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    if (btn) {
      btn.style.transform = 'scale(0.82) rotate(-20deg)';
      setTimeout(() => { btn.style.transform = ''; }, 240);
    }
  }

  /* Initialise */
  applyTheme(getInitialTheme());
  if (btn) btn.addEventListener('click', toggleTheme);

  /* Sync when OS theme changes mid-session (only if user hasn't manually set) */
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'light' : 'dark');
    }
  });
})();


/* ─── 14. HERO 3D MODEL (model-viewer web component) ─── */
/*
 * model-viewer handles loading, rendering and animation automatically.
 * This block just wires up the gold progress bar and logs errors.
 */
(function () {
  const mv = document.getElementById('hero-model');
  if (!mv) return;

  /* Show native gold progress bar; hide spinner when model is revealed */
  mv.addEventListener('load', () => {
    const spinner = document.getElementById('model-loader');
    if (spinner) spinner.style.display = 'none';
  });

  mv.addEventListener('error', (e) => {
    console.error('model-viewer failed to load GLB:', e.detail);
  });
})();