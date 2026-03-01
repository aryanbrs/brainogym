import { navItems } from "../data/site.js";

export function renderHeader({ active = "home", ctaHref = "/contact.html", ctaLabel = "Book Free Demo" } = {}) {
  const links = navItems
    .map(
      (item) =>
        `<a href="${item.href}" class="nav-link ${item.key === active ? "is-active" : ""}">${item.label}</a>`
    )
    .join("");

  return `
    <header class="site-header">
      <div class="container header-wrap">
        <a href="#" class="brand">
          <img src="/logos/brainogym-logo-primary.png" alt="BrainoGym logo" width="140" height="56" />
          <span class="brand-text">
            <strong>BrainoGym</strong>
            <em>Educare</em>
          </span>
        </a>
        <button
          class="menu-toggle"
          data-menu-toggle
          aria-expanded="false"
          aria-controls="primary-nav"
          aria-label="Toggle menu"
        >
          <span></span><span></span><span></span>
        </button>
        <nav class="main-nav" data-main-nav id="primary-nav" aria-label="Primary">
          ${links}
          <a href="${ctaHref}" class="btn btn-solid btn-nav">${ctaLabel}</a>
        </nav>
      </div>
    </header>
  `;
}
