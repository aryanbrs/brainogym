import { renderHeader } from "../components/header.js";
import { renderFooter } from "../components/footer.js";
import { initNavigation } from "../components/navigation.js";
import {
  annualChampionshipImages,
  classActivityImages,
  promoVideos,
  scanner25Images,
  scannerResultImages,
} from "../data/assets.js";
import { programs } from "../data/site.js";

function pageHero(title, subtitle) {
  return `
    <section class="page-hero">
      <div class="container">
        <p class="kicker">BrainoGym Educare</p>
        <h1>${title}</h1>
        <p>${subtitle}</p>
      </div>
    </section>
  `;
}

function aboutPage() {
  return `
    ${pageHero(
      "More Than Just Education, It's a Movement",
      "Discover the passion, purpose, and people behind BrainoGym Educare."
    )}
    <section class="page-section">
      <div class="container split">
        <img src="/images/Kavita-Founder.png" alt="Founder of BrainoGym" loading="lazy" decoding="async" />
        <div>
          <p class="kicker">Founder Story</p>
          <h2>The Heart of BrainoGym</h2>
          <p>
            What started as a parent-led mission in 2008 grew into a trusted learning ecosystem for children across Delhi NCR.
            BrainoGym combines discipline, confidence building, and skill acceleration through structured mentoring.
          </p>
          <div class="chip-row">
            <span class="chip">18+ Years</span>
            <span class="chip">10,000+ Learners</span>
            <span class="chip">Outcome-Led Programs</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

function coursesPage() {
  const cards = programs
    .map(
      (program, idx) => `
      <article class="info-card">
        <img src="${program.image}" alt="${program.title}" loading="lazy" decoding="async" />
        <div class="copy">
          <h3>${program.title}</h3>
          <p>${program.outcome}</p>
          <a class="btn btn-outline" href="${
            ["/abacus-guru.html", "/vedic-maths-guru.html", "/robotics-for-kids.html", "/personality-development.html"][idx]
          }">View Details</a>
        </div>
      </article>
    `
    )
    .join("");

  return `
    ${pageHero("Programs for Complete Child Development", "Choose the right pathway for your child's confidence and growth.")}
    <section class="page-section">
      <div class="container card-grid">${cards}</div>
    </section>
  `;
}

function programDetailPage(key) {
  const config = {
    abacus: {
      title: "Abacus Guru",
      desc: "Mental speed, focus, and memory training with guided progression.",
      image: "/images/course-abacus.jpg",
      files: ["/downloads/Basic Level-Fresher (J).pdf", "/downloads/Basic Level-2.pdf"],
    },
    vedic: {
      title: "Vedic Maths Guru",
      desc: "Fast calculation techniques with conceptual understanding and exam confidence.",
      image: "/images/course-vedic-maths.jpg",
      files: ["/downloads/vedic-maths-level-fresher.pdf", "/downloads/vedic-maths-level-1.pdf"],
    },
    robotics: {
      title: "Robotics for Kids",
      desc: "Hands-on STEM learning focused on creativity, logic, and problem-solving.",
      image: "/images/course-robotics.jpg",
      files: ["/downloads/robotics-circuit-guide.pdf", "/downloads/robotics-coding-logic.pdf"],
    },
    personality: {
      title: "Personality Development",
      desc: "Communication, stage confidence, and leadership habit development.",
      image: "/images/course-personality.jpg",
      files: ["/downloads/personality-speaking-tips.pdf", "/downloads/personality-goal-setting.pdf"],
    },
  }[key];

  const links = config.files
    .map((file) => `<a class="btn btn-outline" href="${file}" target="_blank" rel="noopener noreferrer">Open Resource</a>`)
    .join(" ");

  return `
    ${pageHero(config.title, config.desc)}
    <section class="page-section">
      <div class="container split">
        <img src="${config.image}" alt="${config.title}" loading="lazy" decoding="async" />
        <div>
          <p class="kicker">Program Highlights</p>
          <h2>${config.title}</h2>
          <p>${config.desc}</p>
          <div class="chip-row">
            <span class="chip">Age-Appropriate Batches</span>
            <span class="chip">Mentor Guided</span>
            <span class="chip">Progress Tracking</span>
          </div>
          <div class="chip-row">${links}</div>
        </div>
      </div>
    </section>
  `;
}

function galleryPage() {
  const all = scanner25Images.slice(0, 36);
  const initial = all
    .map((img, i) => `<figure><img src="${img}" alt="Gallery image ${i + 1}" loading="lazy" decoding="async" /></figure>`)
    .join("");

  return `
    ${pageHero("Gallery", "A visual journey through classes, results, championships, and SCANNER moments.")}
    <section class="page-section">
      <div class="container">
        <div class="toolbar">
          <button class="is-active" data-gallery-tab="scanner25">SCANNER'25</button>
          <button data-gallery-tab="achievements">Achievements</button>
          <button data-gallery-tab="championship">Championship 2024</button>
          <button data-gallery-tab="class">Class Activities</button>
        </div>
        <div class="gallery-grid" data-gallery-grid>${initial}</div>
      </div>
    </section>
  `;
}

function contactPage() {
  return `
    ${pageHero("Contact BrainoGym", "Book a demo class or speak with our counselor team.")}
    <section class="page-section">
      <div class="container contact-grid">
        <div class="contact-card">
          <h3>Send an Enquiry</h3>
          <form action="https://formspree.io/f/mwpqlabq" method="POST">
            <input required name="name" placeholder="Your name" />
            <input required type="email" name="email" placeholder="Email address" />
            <input name="phone" placeholder="Phone number" />
            <select name="program">
              <option>Program of interest</option>
              <option>Abacus</option>
              <option>Vedic Maths</option>
              <option>Robotics</option>
              <option>Personality Development</option>
            </select>
            <textarea rows="4" name="message" placeholder="How can we help?"></textarea>
            <button class="btn btn-solid" type="submit">Submit Enquiry</button>
          </form>
        </div>
        <div class="contact-card">
          <h3>Reach Us</h3>
          <p>S-200, Near Mcd Community Center, Shakarpur, Delhi - 110092</p>
          <p><a href="tel:7011177279">7011177279</a></p>
          <p><a href="mailto:brainogym@gmail.com">brainogym@gmail.com</a></p>
          <div class="chip-row">
            <a class="btn btn-outline" href="https://maps.google.com/?q=Shakarpur+Delhi" target="_blank" rel="noopener noreferrer">Open Map</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

function internalContent(page) {
  switch (page) {
    case "about":
      return aboutPage();
    case "courses":
      return coursesPage();
    case "gallery":
      return galleryPage();
    case "contact":
      return contactPage();
    case "abacus":
      return programDetailPage("abacus");
    case "vedic":
      return programDetailPage("vedic");
    case "robotics":
      return programDetailPage("robotics");
    case "personality":
      return programDetailPage("personality");
    default:
      return pageHero("Page Not Found", "The requested page is not available.");
  }
}

function initGallery() {
  const grid = document.querySelector("[data-gallery-grid]");
  const tabs = Array.from(document.querySelectorAll("[data-gallery-tab]"));
  if (!grid || tabs.length === 0) return;

  const pools = {
    scanner25: scanner25Images,
    achievements: scannerResultImages,
    championship: annualChampionshipImages,
    class: classActivityImages,
  };

  const paint = (key) => {
    const images = (pools[key] || pools.scanner25).slice(0, 60);
    grid.innerHTML = images
      .map((img, i) => `<figure><img src="${img}" alt="Gallery image ${i + 1}" loading="lazy" decoding="async" /></figure>`)
      .join("");
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((btn) => btn.classList.remove("is-active"));
      tab.classList.add("is-active");
      paint(tab.getAttribute("data-gallery-tab"));
    });
  });
}

function renderPage() {
  const root = document.getElementById("app");
  const page = document.body.dataset.page || "";
  const activeMap = {
    about: "about",
    courses: "programs",
    gallery: "gallery",
    contact: "contact",
    game: "game",
    abacus: "programs",
    vedic: "programs",
    robotics: "programs",
    personality: "programs",
  };

  root.innerHTML = `
    ${renderHeader({ active: activeMap[page] || "home", ctaHref: "/contact.html", ctaLabel: "Enquire Now" })}
    <main id="main-content" tabindex="-1">
      ${internalContent(page)}
      <section class="page-section">
        <div class="container">
          <div class="videos-grid">
            ${promoVideos
              .map(
                (video, idx) => `
              <article class="video-card">
                <video controls preload="none" playsinline poster="${scanner25Images[idx + 10] || scanner25Images[0]}">
                  <source src="${video}" type="video/mp4" />
                </video>
              </article>
            `
              )
              .join("")}
          </div>
        </div>
      </section>
    </main>
    ${renderFooter()}
  `;

  initNavigation();
  initGallery();
}

renderPage();
