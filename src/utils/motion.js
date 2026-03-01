function animateCount(el) {
  if (el.dataset.counted === "true") return;
  const target = parseInt(el.dataset.target || "0", 10);
  if (!target) return;
  const suffix = el.dataset.suffix || "";
  const duration = 1400;
  const start = performance.now();

  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const value = Math.round(target * eased).toLocaleString("en-IN");
    el.textContent = `${value}${suffix}`;
    if (p < 1) requestAnimationFrame(tick);
  };

  el.dataset.counted = "true";
  requestAnimationFrame(tick);
}

export function initLivelyMotion() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const counterEls = document.querySelectorAll(".metric-value[data-target]");

  if (reduced) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in-view"));
    counterEls.forEach((el) => {
      const target = parseInt(el.dataset.target || "0", 10);
      el.textContent = `${target.toLocaleString("en-IN")}${el.dataset.suffix || ""}`;
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        if (entry.target.classList.contains("metric-value")) {
          animateCount(entry.target);
        }
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -5% 0px" }
  );

  const applyRevealAnimations = () => {
    const targets = document.querySelectorAll(
      ".section-heading, .hero-content .kicker, .hero-content h1, .hero-sub, .hero-actions, .hero-trust, .metric-card, .metric-value, .program-card, .founder-grid img, .founder-grid div, .why-list li, .testimonial-card, .proof-card, .video-card, .media-card, .faq-item, .cta-band-grid > *"
    );

    targets.forEach((el, idx) => {
      if (!el.classList.contains("reveal")) {
        el.classList.add("reveal");
        el.style.setProperty("--reveal-delay", `${(idx % 8) * 50}ms`);
      }
      if (!el.classList.contains("in-view")) {
        observer.observe(el);
      }
    });
  };

  window.applyRevealAnimations = applyRevealAnimations;
  applyRevealAnimations();
}
