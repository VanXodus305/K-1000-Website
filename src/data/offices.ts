export const offices = [
  {
    key: "osg",
    short: "OSG",
    title: "Office of Strategy & Growth",
    yearOfFormation: 2026,
    overview:
      "We translate K-1000's vision into coordinated, measurable action.",
    description:
      "Office of Strategy and Growth is the driving force that transforms K-1000's vision into measurable results. As the core unit overseeing key organizational functions, we manage operations, coordinate major projects, and ensure consistent excellence across all initiatives. Acting as the central link between teams, we translate strategic goals into actionable outcomes.",
    focusAreas: [
      "Strategic Planning & Execution",
      "Cross-unit Operations",
      "Programme Coordination",
      "Growth Systems & Review",
    ],
    outcomes: [
      "Clear organizational priorities",
      "Stronger coordination across units",
      "Consistent execution standards",
      "Measurable long-term growth",
    ],
    baseColor: "#0e7490",
    accentColor: "#67e8f9",
    tag: "Strategic Operations & Planning",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1600",
  },
  {
    key: "oti",
    short: "OTI",
    title: "Office of Technology & Innovation",
    yearOfFormation: 2026,
    overview:
      "We build and maintain the technical systems that support K-1000's programmes and ideas.",
    description:
      "The Office of Technology and Innovation is the hub for technical finance and development, the pivotal point where funding and technology intersect. OTI makes strategic use of funds for both central and collaborative projects to achieve maximum technical effect. We offer practical exposure during all stages of projects, from development through debugging and system upgrades.",
    focusAreas: [
      "Digital Product Development",
      "Technical Infrastructure",
      "Debugging & System Maintenance",
      "Technology Resource Planning",
    ],
    outcomes: [
      "Reliable digital infrastructure",
      "Deployable technical solutions",
      "Improved development workflows",
      "Practical engineering exposure",
    ],
    baseColor: "#1d4ed8",
    accentColor: "#93c5fd",
    tag: "Technical Finance & Development",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600",
  },
  {
    key: "ocd",
    short: "OCD",
    title: "Office of Creativity & Design",
    yearOfFormation: 2026,
    overview:
      "We give K-1000 a clear, consistent, and memorable visual language.",
    description:
      "Office of Creativity and Design is the creative architect of the K-1000 brand. OCD is the central visual unit, responsible for managing all aesthetic standards, visual identity, and design activities across every digital and physical platform. Our mission is to ensure K-1000's message is not just seen, but felt.",
    focusAreas: [
      "Visual Identity Systems",
      "Campaign & Event Design",
      "Digital and Print Assets",
      "Creative Direction",
    ],
    outcomes: [
      "Consistent brand expression",
      "Stronger visual communication",
      "Reusable design systems",
      "Higher-quality campaign material",
    ],
    baseColor: "#a21caf",
    accentColor: "#f0abfc",
    tag: "Visual Identity & Brand Design",
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1600",
  },
  {
    key: "opcr",
    short: "OPCR",
    title: "Office of Public & Corporate Relations",
    yearOfFormation: 2026,
    overview:
      "We build the external relationships that extend K-1000's reach and opportunities.",
    description:
      "OPCR is the organization's primary external interface, responsible for securing high-value sponsorships and strategically enriching the K-1000 alumni network. The team acts as the architects of K-1000's external reputation and financial support system.",
    focusAreas: [
      "Corporate Partnerships",
      "Sponsorship Development",
      "Public Relations",
      "Alumni & Industry Outreach",
    ],
    outcomes: [
      "Stronger industry relationships",
      "Sustainable event support",
      "Expanded alumni engagement",
      "Professional external representation",
    ],
    baseColor: "#b45309",
    accentColor: "#fcd34d",
    tag: "Sponsorships & External Relations",
    image:
      "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=1600",
  },
  {
    key: "oca",
    short: "OCA",
    title: "Office of Campus Ambassadors",
    yearOfFormation: 2026,
    overview:
      "We connect K-1000 with students across campus through direct representation and outreach.",
    description:
      "Campus Ambassadors are the frontline evangelists for K-1000, responsible for generating enthusiasm and organizational awareness in schools across the entire region. This role provides essential training in high-impact communication and grassroots relationship management.",
    focusAreas: [
      "Campus Outreach",
      "Student Representation",
      "Community Activation",
      "Programme Awareness",
    ],
    outcomes: [
      "Wider campus visibility",
      "Stronger student participation",
      "Active ambassador networks",
      "Improved peer communication",
    ],
    baseColor: "#047857",
    accentColor: "#6ee7b7",
    tag: "Outreach & Grassroots Engagement",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1600",
  },
  {
    key: "occ",
    short: "OCC",
    title: "Office of Content & Communications",
    yearOfFormation: 2026,
    overview:
      "We document K-1000's work and communicate it with clarity, accuracy, and purpose.",
    description:
      "The Office of Content & Communications is the central communication and documentation hub of K-1000. It is responsible for maintaining the voice, tone, and consistency of all official communications. The office manages documentation, MoUs, event agendas, result reports, social media content, and formal correspondence, while ensuring that all communication aligns with K-1000's objectives and standards.",
    focusAreas: [
      "Editorial Planning",
      "Official Documentation",
      "Social Media Content",
      "Internal & External Communication",
    ],
    outcomes: [
      "Consistent organizational voice",
      "Clear official documentation",
      "Stronger programme storytelling",
      "Timely communication across channels",
    ],
    baseColor: "#155e75",
    accentColor: "#67e8f9",
    tag: "Documentation & Internal Comms",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1600",
  },
];

export type K1000Office = (typeof offices)[number];
