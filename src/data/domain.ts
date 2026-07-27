export const domains = [
  {
    key: "training",
    title: "Training Program",
    yearOfFormation: 2022,
    overview:
      "The Training Program serves as the foundational learning pillar of K-1000, designed to upskill students through a structured, peer-driven learning ecosystem.",
    description:
      "The K-1000 Training Program focuses on equipping students with both technical and professional competencies required in real-world environments. Through curated learning tracks, interactive workshops, and mentorship-driven sessions, students are introduced to core concepts in programming, system design, communication, and teamwork. The program emphasizes experiential learning, where participants actively apply concepts through guided exercises and collaborative problem-solving. Over time, students develop confidence, discipline, and adaptability essential for academic success, research, and industry readiness.",
    focusAreas: [
      "Core Programming & Technical Foundations",
      "Communication, Presentation & Soft Skills",
      "Peer-to-Peer Learning & Mentorship",
      "Hands-on Workshops & Guided Practice",
    ],
    outcomes: [
      "Strong technical and conceptual foundations",
      "Improved communication and teamwork skills",
      "Early exposure to problem-solving environments",
      "Smooth transition into advanced K-1000 units",
    ],
    baseColor: "#2a4fff",
    accentColor: "#6bbcff",
  },
  {
    key: "research",
    title: "Research & Publications",
    yearOfFormation: 2022,
    overview:
      "The Research & Publications unit nurtures a culture of inquiry, innovation, and academic excellence within K-1000.",
    description:
      "This unit supports students interested in academic research by guiding them through the complete research lifecycle, from identifying relevant problem statements to publishing their work in conferences and journals. Students receive mentorship in research methodology, literature review, experimentation, and academic writing. By collaborating with peers, seniors, and faculty mentors, participants gain exposure to scholarly practices and develop the discipline required for rigorous research.",
    focusAreas: [
      "Research Methodology & Problem Formulation",
      "Literature Review & Analysis",
      "Paper Writing & Academic Documentation",
      "Conference & Journal Submissions",
    ],
    outcomes: [
      "Published or submitted research papers",
      "Improved analytical and critical thinking",
      "Familiarity with academic research standards",
      "Preparation for higher studies and research careers",
    ],
    baseColor: "#1f7a3a",
    accentColor: "#7dffb3",
  },
  {
    key: "projects",
    title: "Project Wing",
    yearOfFormation: 2023,
    overview:
      "Project Wing is the execution-focused unit of K-1000, translating ideas into functional, real-world solutions.",
    description:
      "Project Wing enables students to work in multidisciplinary teams on practical projects addressing real-world challenges. Members collaborate across units, applying technical knowledge, design thinking, and project management principles. The unit provides mentorship, access to resources, and structured timelines to ensure meaningful outcomes. Students are encouraged to document, showcase, and iterate on their work, fostering a product-oriented mindset and long-term learning.",
    focusAreas: [
      "Real-world Problem Solving",
      "Product & Solution Development",
      "Team-based Engineering & Collaboration",
      "Project Documentation & Showcasing",
    ],
    outcomes: [
      "Portfolio-ready projects",
      "Hands-on experience with real constraints",
      "Exposure to collaborative development workflows",
      "Confidence in building and deploying solutions",
    ],
    baseColor: "#b45309",
    accentColor: "#ffd166",
  },
  {
    key: "events",
    title: "Event Management",
    yearOfFormation: 2022,
    overview:
      "The Event Management unit manages the planning, coordination, and execution of K-1000’s technical and community-driven events.",
    description:
      "This unit is responsible for conceptualizing and delivering a wide range of events, including workshops, hackathons, seminars, and speaker sessions. Members gain experience in logistics, communication, sponsorship coordination, and audience engagement. The unit plays a crucial role in building K-1000’s public presence while providing students with leadership and organizational exposure through hands-on event management.",
    focusAreas: [
      "Event Planning & Execution",
      "Logistics & Operations Management",
      "Public Relations & Outreach",
      "Industry and Speaker Engagement",
    ],
    outcomes: [
      "Successful large-scale academic and technical events",
      "Strong leadership and coordination skills",
      "Experience in managing real-world responsibilities",
      "Enhanced visibility and community engagement",
    ],
    baseColor: "#7f1d1d",
    accentColor: "#ff6b6b",
  },
  {
    key: "internship",
    title: "Academic Internship & Placement Guidance",
    yearOfFormation: 2023,
    overview:
      "The Academic Internship & Placement Guidance unit prepares students for professional careers by aligning academic learning with industry expectations.",
    description:
      "This unit focuses on career readiness through structured preparation programmes, including resume reviews, mock interviews, and skill-mapping sessions. Students receive guidance on navigating recruitment processes, understanding industry roles, and building professional profiles. By leveraging peer learning and alumni insights, the unit helps students make informed career decisions and improve their chances of securing internships and placements.",
    focusAreas: [
      "Resume & Profile Building",
      "Mock Interviews & Evaluation",
      "Industry Awareness & Role Mapping",
      "Career Guidance & Mentorship",
    ],
    outcomes: [
      "Improved internship and placement readiness",
      "Stronger professional communication",
      "Clear understanding of industry expectations",
      "Higher confidence during recruitment processes",
    ],
    baseColor: "#5b21b6",
    accentColor: "#c084fc",
  },
  {
    key: "higher",
    title: "Higher Studies",
    yearOfFormation: 2023,
    overview:
      "The Higher Studies unit supports students aspiring for postgraduate education and research opportunities in India and abroad.",
    description:
      "This unit assists students throughout the higher studies preparation journey, including exam planning, university shortlisting, and application strategies. Guidance is provided for entrance exams, Statement of Purpose writing, Letters of Recommendation, and scholarship opportunities. By offering structured timelines and mentorship, the unit helps students approach higher education decisions with clarity and confidence.",
    focusAreas: [
      "Entrance Exam Preparation & Strategy",
      "University Research & Shortlisting",
      "SOP, LOR & Application Guidance",
      "Scholarships & Funding Opportunities",
    ],
    outcomes: [
      "Admissions to reputed institutions",
      "Well-structured academic plans",
      "Stronger postgraduate applications",
      "Informed decision-making for higher education",
    ],
    baseColor: "#0f766e",
    accentColor: "#5eead4",
  },
  {
    key: "finance",
    title: "Finance & Entrepreneurship",
    yearOfFormation: 2024,
    overview:
      "The Finance and Entrepreneurship branch focuses on building a strong entrepreneurial and financial ecosystem within KIIT University.",
    description:
      "The Finance and Entrepreneurship branch focuses on building a strong entrepreneurial and financial ecosystem within KIIT University. It supports student-led ventures through mentorship, financial planning, operational support, partnerships, compliance awareness, and strategic execution. The branch aims to create financially literate leaders, scalable student startups, and sustainable long-term impact through structured growth and real-world business exposure.",
    focusAreas: [
      "Entrepreneurial Mentorship & Strategy",
      "Financial Planning & Resource Management",
      "Partnership Development & Compliance",
      "Real-world Business Exposure",
    ],
    outcomes: [
      "Scalable student-led startups",
      "Financial literacy and leadership skills",
      "Strategic partnerships and industry connections",
      "Sustainable long-term impact",
    ],
    baseColor: "#047857",
    accentColor: "#6ee7b7",
  },
];

export type K1000Domain = (typeof domains)[number];
export type K1000DomainWithApplyLink = K1000Domain & {
  applyLink?: string;
};
