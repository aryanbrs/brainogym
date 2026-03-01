export function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="container footer-wrap">
        <div>
          <img
            src="/logos/brainogym-logo-primary.png"
            alt="BrainoGym logo"
            class="footer-logo"
            loading="lazy"
            decoding="async"
            width="148"
            height="60"
          />
          <p>Nurturing young minds with future-ready skills since 2008.</p>
        </div>
        <div>
          <h3>Contact</h3>
          <p>S-200, Near MCD Community Center, Shakarpur, Delhi - 110092</p>
          <p><a href="tel:7011177279">7011177279</a></p>
          <p><a href="mailto:brainogym@gmail.com">brainogym@gmail.com</a></p>
        </div>
        <div>
          <h3>Quick Links</h3>
          <p><a href="index.html">Home</a></p>
          <p><a href="about.html">About</a></p>
          <p><a href="courses.html">Programs</a></p>
          <p><a href="abacus-game.html">Abacus Game</a></p>
          <p><a href="gallery.html">Gallery</a></p>
          <p><a href="contact.html">Contact</a></p>
        </div>
      </div>
      <div class="copyright">(c) ${new Date().getFullYear()} BrainoGym Educare. All rights reserved.</div>
    </footer>
  `;
}
