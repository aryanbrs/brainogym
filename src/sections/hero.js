import { bannerImages } from "../data/assets.js";

export function renderHero() {
  return `
    <section class="hero">
      <div class="hero-media" data-hero-media style="background-image:url('${bannerImages[0]}');"></div>
      <div class="hero-overlay"></div>
      <div class="hero-figures" aria-hidden="true">
        <span class="hero-figure hero-figure-a"></span>
        <span class="hero-figure hero-figure-b"></span>
        <span class="hero-figure hero-figure-c"></span>
      </div>
      <div class="container hero-content">
        <p class="kicker">Since 2008 | Child Skill Development Experts</p>
        <h1>Build Faster Thinking, Stronger Confidence, and Better Academic Outcomes</h1>
        <p class="hero-sub">
          BrainoGym programs in Abacus, Vedic Maths, Robotics, and Personality Development are designed for measurable growth.
        </p>
        <div class="hero-actions">
          <a href="#contact" class="btn btn-solid">Book Free Demo Class</a>
          <a href="#programs" class="btn btn-outline light">Explore Programs</a>
        </div>
        <div class="hero-trust">
          <span>10,000+ Learners</span>
          <span>50+ School Associations</span>
          <span>Parent-Trusted Programs</span>
        </div>
      </div>
    </section>
  `;
}

export function initHeroRotator() {
  const media = document.querySelector("[data-hero-media]");
  if (!media || bannerImages.length < 2) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % bannerImages.length;
    media.style.backgroundImage = `url('${bannerImages[idx]}')`;
  }, 3800);
}
