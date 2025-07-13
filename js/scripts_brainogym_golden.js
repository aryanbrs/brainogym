// scripts_brainogym_golden.js
document.addEventListener("DOMContentLoaded", function () {
  // --- Page Load Transition ---
  document.body.classList.remove("loading");
  document.body.classList.add("loaded");

  // --- Sticky Header ---
  const header = document.getElementById("main-header");
  const heroSection = document.getElementById("hero"); // To get initial offset correctly
  let headerHeight = header.offsetHeight;

  function handleScroll() {
    if (window.scrollY > headerHeight / 2) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  window.addEventListener("scroll", handleScroll);
  handleScroll(); // Initial check

  // --- Mobile Menu Toggle ---
  const menuToggle = document.getElementById("menu-toggle");
  const mainNav = document.getElementById("main-nav");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", function () {
      const isExpanded =
        menuToggle.getAttribute("aria-expanded") === "true" || false;
      mainNav.classList.toggle("active");
      menuToggle.classList.toggle("active");
      menuToggle.setAttribute("aria-expanded", !isExpanded);
      document.body.style.overflow = mainNav.classList.contains("active")
        ? "hidden"
        : "";
    });
  }

  // --- Hero Slideshow Logic ---
  const slideshowImages = [
    "BO0A2898.JPG",
    "BO0A2899.JPG",
    "BO0A2900.JPG",
    "BO0A2901.JPG",
    "BO0A2902.JPG",
    "BO0A2903.JPG",
    "BO0A2904.JPG",
    "BO0A3085.JPG",
    "BO0A3086.JPG",
    "BO0A3087.JPG",
    "BO0A3088.JPG",
    "BO0A3089.JPG",
    "BO0A3090.JPG",
    "BO0A3091.JPG",
    "BO0A3092.JPG",
    "BO0A3093.JPG",
    "BO0A3094.JPG",
    "BO0A3095.JPG",
    "BO0A3096.JPG",
    "BO0A3097.JPG",
    "BO0A3098.JPG",
    "BO0A3099.JPG",
    "BO0A3100.JPG",
    "BO0A3101.JPG",
    "BO0A3102.JPG",
    "BO0A3103.JPG",
    "BO0A3104.JPG",
  ];
  const slideshowContainer = document.querySelector(".slideshow-container");
  let currentSlideIndex = 0;

  function populateSlideshow() {
    if (!slideshowContainer) return;
    slideshowImages.forEach((imgFile, index) => {
      const slideDiv = document.createElement("div");
      slideDiv.className = "slide";
      // Using background image for better control with object-cover equivalent
      slideDiv.style.backgroundImage = `url(images/${imgFile})`;
      if (index === 0) slideDiv.classList.add("active");
      slideshowContainer.appendChild(slideDiv);
    });
  }

  populateSlideshow();
  const slides = slideshowContainer
    ? Array.from(slideshowContainer.children)
    : [];

  function showNextSlide() {
    if (slides.length < 2) return;
    slides[currentSlideIndex].classList.remove("active");
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    slides[currentSlideIndex].classList.add("active");
  }

  if (slides.length > 0) {
    setInterval(showNextSlide, 4500); // Slightly longer interval
  }

  // --- Key Stats Counter ---
  function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      obj.innerHTML = Math.floor(progress * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        obj.innerHTML = end; // Ensure it ends on the exact number
      }
    };
    window.requestAnimationFrame(step);
  }

  const statObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const statNumberEl = entry.target.querySelector(".stat-number");
          if (statNumberEl && !statNumberEl.dataset.animated) {
            const countTo = parseInt(statNumberEl.getAttribute("data-count"));
            animateValue(statNumberEl, 0, countTo, 2000);
            statNumberEl.dataset.animated = "true"; // Mark as animated
          }
          // observer.unobserve(entry.target); // Optional: unobserve after animating once
        }
      });
    },
    { threshold: 0.5 }
  ); // Trigger when 50% visible

  document.querySelectorAll(".stat-item").forEach((statItem) => {
    statObserver.observe(statItem);
  });

  // --- Scroll Animations ---
  const animatedElements = document.querySelectorAll("[data-animation]");
  const animationObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay) || 0;
          setTimeout(() => {
            entry.target.classList.add("is-visible");
          }, delay);
          observer.unobserve(entry.target); // Animate only once
        }
      });
    },
    { threshold: 0.1 }
  ); // Trigger when 10% of the element is visible

  animatedElements.forEach((el) => {
    animationObserver.observe(el);
  });

  // --- Set Current Year in Footer ---
  const yearSpan = document.getElementById("current-year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Active Nav Link based on current page (simple version)
  const currentPath = window.location.pathname.split("/").pop();
  const navLinks = document.querySelectorAll("#main-nav-links li a");
  navLinks.forEach((link) => {
    link.classList.remove("active-nav"); // Remove from all first
    if (
      link.getAttribute("href") === currentPath ||
      (currentPath === "" && link.getAttribute("href") === "index.html")
    ) {
      link.classList.add("active-nav");
    }
  });
});
