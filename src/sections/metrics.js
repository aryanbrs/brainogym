import { stats } from "../data/site.js";

export function renderMetrics() {
  const cards = stats
    .map((item) => {
      const target = parseInt(item.value.replace(/[^0-9]/g, ""), 10) || 0;
      const suffix = item.value.replace(/[0-9,]/g, "");
      return `
        <article class="metric-card">
          <p class="metric-value" data-target="${target}" data-suffix="${suffix}">0${suffix}</p>
          <p class="metric-label">${item.label}</p>
        </article>
      `;
    })
    .join("");

  return `
    <section class="metrics section">
      <div class="container">
        <div class="section-heading">
          <p class="kicker">Real Learning. Real Outcomes.</p>
          <h2>Trusted by Families Across Delhi NCR</h2>
        </div>
        <div class="metrics-grid">${cards}</div>
      </div>
    </section>
  `;
}
