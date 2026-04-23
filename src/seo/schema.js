import { programs } from "../data/site.js";

const faqItems = [
  {
    question: "Which age groups can join Brainogym programs?",
    answer: "Programs are offered in age-appropriate batches so children learn at the right level and pace.",
  },
  {
    question: "Do you provide a free trial or demo session?",
    answer: "Yes, parents can book a free demo class before enrollment.",
  },
  {
    question: "How soon can parents expect visible progress?",
    answer: "Most parents notice stronger focus, speed, and confidence in the initial weeks with regular practice.",
  },
];

function buildSchema() {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Brainogym Educare",
    url: "https://brainogym.com/",
    logo: "https://brainogym.com/logos/brainogym-logo-primary.png",
    image: "https://brainogym.com/images/banner/1.jpg",
    telephone: "+91-7011177279",
    email: "brainogym@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "S - 200, Near Mcd Community Center, Shakarpur",
      addressLocality: "Delhi",
      postalCode: "110092",
      addressCountry: "IN",
    },
  };

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: programs.map((program, index) => ({
      "@type": "Course",
      position: index + 1,
      name: program.title,
      description: program.outcome,
      provider: {
        "@type": "Organization",
        name: "Brainogym Educare",
        sameAs: "https://brainogym.com/",
      },
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return [orgSchema, courseSchema, faqSchema];
}

export function injectStructuredData() {
  const schemas = buildSchema();
  schemas.forEach((schema, index) => {
    const scriptId = `schema-${index + 1}`;
    if (document.getElementById(scriptId)) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = scriptId;
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
}
