const faqItems = [
  {
    q: "Which age groups can join Brainogym programs?",
    a: "Programs are offered in age-appropriate batches so children learn at the right level and pace.",
  },
  {
    q: "Do you provide a free trial or demo session?",
    a: "Yes, parents can book a free demo class before enrollment.",
  },
  {
    q: "How soon can parents expect visible progress?",
    a: "Most parents notice stronger focus, speed, and confidence in the initial weeks with regular practice.",
  },
];

export function renderFaq() {
  const items = faqItems
    .map(
      (item) => `
        <details class="faq-item">
          <summary>${item.q}</summary>
          <p>${item.a}</p>
        </details>
      `
    )
    .join("");

  return `
    <section class="section faq">
      <div class="container">
        <div class="section-heading">
          <p class="kicker">Common Questions</p>
          <h2>Everything Parents Ask Before Enrollment</h2>
        </div>
        <div class="faq-list">${items}</div>
      </div>
    </section>
  `;
}
