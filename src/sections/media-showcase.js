import {
  annualChampionshipImages,
  classActivityImages,
  promoVideos,
  scanner25Images,
  scannerResultImages,
} from "../data/assets.js";

const categories = [
  { key: "scanner25", label: "SCANNER'25", assets: scanner25Images },
  { key: "achievements", label: "Achievements", assets: scannerResultImages },
  { key: "championship", label: "Championship 2024", assets: annualChampionshipImages },
  { key: "class", label: "Class Activities", assets: classActivityImages },
];

function getCategory(key) {
  return categories.find((item) => item.key === key) || categories[0];
}

function createGalleryCards(items) {
  return items
    .map(
      (img, idx) => `
      <figure class="media-card">
        <img src="${img}" alt="BrainoGym gallery image ${idx + 1}" loading="lazy" decoding="async" />
      </figure>
    `
    )
    .join("");
}

export function renderMediaShowcase() {
  const videoCards = promoVideos
    .map(
      (video, idx) => `
      <article class="video-card">
        <video controls preload="none" playsinline poster="${scanner25Images[idx + 3] || scanner25Images[0]}">
          <source src="${video}" type="video/mp4" />
        </video>
      </article>
    `
    )
    .join("");

  const buttons = categories
    .map(
      (item, index) => `
      <button
        class="media-tab ${index === 0 ? "is-active" : ""}"
        data-media-tab="${item.key}"
        aria-pressed="${index === 0 ? "true" : "false"}"
        type="button"
      >
        ${item.label} (${item.assets.length})
      </button>
    `
    )
    .join("");

  return `
    <section class="section media-showcase">
      <div class="container">
        <div class="section-heading">
          <p class="kicker">Visual Proof</p>
          <h2>Events, Classes, Achievements, and Learning in Action</h2>
        </div>
        <div class="videos-grid">${videoCards}</div>
        <div class="media-tab-row">${buttons}</div>
        <div class="media-grid" data-media-grid>
          ${createGalleryCards(categories[0].assets.slice(0, 18))}
        </div>
        <div class="media-actions">
          <button class="btn btn-outline" type="button" data-media-toggle data-expanded="false">Show More</button>
          <a href="gallery.html" class="btn btn-solid">Open Full Gallery</a>
        </div>
      </div>
    </section>
  `;
}

export function initMediaShowcase() {
  const grid = document.querySelector("[data-media-grid]");
  const tabs = Array.from(document.querySelectorAll("[data-media-tab]"));
  const toggle = document.querySelector("[data-media-toggle]");
  if (!grid || tabs.length === 0 || !toggle) return;

  let activeKey = categories[0].key;
  let expanded = false;

  const paint = () => {
    const active = getCategory(activeKey);
    const assets = expanded ? active.assets : active.assets.slice(0, 18);
    grid.innerHTML = createGalleryCards(assets);
    toggle.textContent = expanded ? "Show Less" : "Show More";
    toggle.setAttribute("data-expanded", String(expanded));
    if (typeof window.applyRevealAnimations === "function") {
      window.applyRevealAnimations();
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeKey = tab.getAttribute("data-media-tab");
      expanded = false;
      tabs.forEach((btn) => {
        btn.classList.remove("is-active");
        btn.setAttribute("aria-pressed", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-pressed", "true");
      paint();
    });
  });

  toggle.addEventListener("click", () => {
    expanded = !expanded;
    paint();
  });

  paint();
}
