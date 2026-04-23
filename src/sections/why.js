import { differentiators } from "../data/site.js";

export function renderWhy() {
  const items = differentiators
    .map(
      (point) => `
        <li>
          <span class="why-dot"></span>
          <p>${point}</p>
        </li>
      `
    )
    .join("");

  return `
    <section class="section why">
      <div class="container">
        <div class="section-heading">
          <p class="kicker">Why Brainogym</p>
          <h2>A Professional Learning System Parents Can Trust</h2>
        </div>
        <ul class="why-list">${items}</ul>
      </div>
    </section>
  `;
}
