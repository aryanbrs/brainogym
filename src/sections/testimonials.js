import { testimonials } from "../data/site.js";
import { scannerResultImages } from "../data/assets.js";

export function renderTestimonials() {
  const cards = testimonials
    .map((item, i) => {
      const avatar = scannerResultImages[i] || scannerResultImages[0];
      return `
        <article class="testimonial-card">
          <img src="${avatar}" alt="Student achievement snapshot" loading="lazy" decoding="async" />
          <p class="quote">"${item.quote}"</p>
          <p class="author">${item.author}</p>
        </article>
      `;
    })
    .join("");

  return `
    <section class="section testimonials">
      <div class="container">
        <div class="section-heading">
          <p class="kicker">Parent Feedback</p>
          <h2>Families See Confidence and Performance Gains</h2>
        </div>
        <div class="testimonials-grid">${cards}</div>
      </div>
    </section>
  `;
}
