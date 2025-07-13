// brainogym-website/js/main.js

document.addEventListener("DOMContentLoaded", function () {
  // --- Mobile Menu Toggle logic has been REMOVED as per the new header design ---

  // --- Active Page Highlight in Navigation ---
  const currentLocation = window.location.href;
  // Select all anchor tags within the main navigation
  const navLinks = document.querySelectorAll("#main-nav a.nav-link");

  function setActiveLink(links) {
    links.forEach((link) => {
      let linkHref = link.href;
      let currentLoc = currentLocation;

      // Normalize URLs: remove trailing slash
      if (linkHref.endsWith("/")) linkHref = linkHref.slice(0, -1);
      if (currentLoc.endsWith("/")) currentLoc = currentLoc.slice(0, -1);

      // Normalize URLs: treat 'index.html' as the base path
      const linkPath = new URL(linkHref).pathname
        .replace(/index\.html$/, "")
        .replace(/\/$/, "");
      const currentPath = new URL(currentLoc).pathname
        .replace(/index\.html$/, "")
        .replace(/\/$/, "");

      // Clear existing active styles first
      link.classList.remove("text-orange-600", "font-bold");
      link.classList.add("text-gray-700"); // Ensure default color is re-applied

      if (linkPath === currentPath) {
        link.classList.add("text-orange-600", "font-bold");
        link.classList.remove("text-gray-700");
      }
    });
  }
  if (navLinks.length > 0) {
    setActiveLink(navLinks);
  }

  // --- Copyright Year ---
  const currentYearSpan = document.getElementById("current-year");
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // --- Key Stats Count-Up Animation ---
  const statNumbers = document.querySelectorAll(".stat-number");
  const animationDuration = 2000; // 2 seconds

  function animateValue(element, start, end, duration) {
    let startTime = null;
    // Check if the element originally has a plus sign next to it in HTML
    const hasPlusSign =
      element.nextSibling &&
      element.nextSibling.nodeType === Node.TEXT_NODE &&
      element.nextSibling.textContent.trim() === "+";

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const currentValue = Math.floor(progress * (end - start) + start);
      element.textContent = currentValue.toLocaleString();

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        element.textContent = end.toLocaleString();
        // The plus sign is expected to be in the HTML structure already, e.g., <span>1000</span>+
      }
    }
    requestAnimationFrame(animation);
  }

  const observerOptionsStats = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const statObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetCount = parseInt(el.dataset.count, 10);
        if (!el.dataset.animated) {
          animateValue(el, 0, targetCount, animationDuration);
          el.dataset.animated = true;
        }
        // observer.unobserve(el); // Optional: stop observing after animation
      }
    });
  }, observerOptionsStats);

  statNumbers.forEach((stat) => {
    statObserver.observe(stat);
  });

  // --- Scroll Animations for "Why Choose Us" and other sections ---
  const animatedElements = document.querySelectorAll(
    ".fade-in, .slide-up, .slide-in-left, .slide-in-right, #founder-image-container, .founder-story"
  );

  const scrollObserverOptions = { threshold: 0.15 };
  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        if (entry.target.matches(".reasons-list li")) {
          entry.target.classList.add("is-visible");
        }
        // observer.unobserve(entry.target); // Optional
      }
      // else { // Optional: remove class if element scrolls out of view
      //   entry.target.classList.remove('visible');
      //   if (entry.target.matches('.reasons-list li')) {
      //     entry.target.classList.remove('is-visible');
      //   }
      // }
    });
  }, scrollObserverOptions);

  animatedElements.forEach((el) => {
    scrollObserver.observe(el);
  });

  const reasonsListItems = document.querySelectorAll(
    "#why-choose-us .reasons-list li"
  );
  reasonsListItems.forEach((item) => {
    if (!Array.from(animatedElements).includes(item)) {
      scrollObserver.observe(item);
    }
  });

  // --- Smooth Scroll for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const hrefAttribute = this.getAttribute("href");
      if (hrefAttribute.length > 1) {
        // Check if it's more than just "#"
        try {
          const targetElement = document.querySelector(hrefAttribute);
          if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({
              behavior: "smooth",
            });
          }
        } catch (error) {
          // If querySelector fails (e.g. invalid selector), do nothing or log error
          console.warn(
            "Smooth scroll target not found or invalid selector:",
            hrefAttribute
          );
        }
      }
    });
  });

  // --- Header Style Change on Scroll ---
  const header = document.getElementById("main-header");
  if (header) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    });
  }
}); // End DOMContentLoaded
