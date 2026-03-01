import { programs } from "../data/site.js";

export function renderPrograms() {
  const cards = programs
    .map(
      (program) => `
        <article class="program-card">
          <img src="${program.image}" alt="${program.title}" loading="lazy" decoding="async" />
          <div class="program-copy">
            <h3>${program.title}</h3>
            <p>${program.outcome}</p>
            <a href="courses.html" class="text-link">Explore Program</a>
          </div>
        </article>
      `
    )
    .join("");

  return `
    <section class="section programs" id="programs">
      <div class="container">
        <div class="section-heading">
          <p class="kicker">Complete Development Path</p>
          <h2>Programs Designed for Skills That Matter</h2>
        </div>
        <div class="programs-grid">${cards}</div>
      </div>
    </section>
  `;
}
