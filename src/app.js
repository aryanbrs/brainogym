import { renderHeader } from "./components/header.js";
import { renderHero } from "./sections/hero.js";
import { renderMetrics } from "./sections/metrics.js";
import { renderPrograms } from "./sections/programs.js";
import { renderFounder } from "./sections/founder.js";
import { renderProof } from "./sections/proof.js";
import { renderWhy } from "./sections/why.js";
import { renderTestimonials } from "./sections/testimonials.js";
import { initHeroRotator } from "./sections/hero.js";
import { initMediaShowcase, renderMediaShowcase } from "./sections/media-showcase.js";
import { renderFaq } from "./sections/faq.js";
import { renderCtaBand } from "./components/cta-band.js";
import { renderFooter } from "./components/footer.js";
import { injectStructuredData } from "./seo/schema.js";
import { initNavigation } from "./components/navigation.js";
import { initLivelyMotion } from "./utils/motion.js";

export function renderApp() {
  const app = document.getElementById("app");
  app.innerHTML = `
    ${renderHeader({ active: "home", ctaHref: "#contact", ctaLabel: "Book Free Demo" })}
    <main id="main-content" tabindex="-1">
      ${renderHero()}
      ${renderMetrics()}
      ${renderPrograms()}
      ${renderFounder()}
      ${renderWhy()}
      ${renderTestimonials()}
      ${renderProof()}
      ${renderMediaShowcase()}
      ${renderFaq()}
      ${renderCtaBand()}
    </main>
    ${renderFooter()}
  `;

  initNavigation();
  initHeroRotator();
  initMediaShowcase();
  injectStructuredData();
  initLivelyMotion();
}
