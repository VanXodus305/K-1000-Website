/**
 * K-1000 Event Registry
 * Updated with Dark Route and Kampus Konversations Ep. 2
 */

export interface K1000Event {
  id: string;
  title: string;
  date: string;
  description: string;
  category: "Hackathon" | "Symposium" | "Workshop" | "Series";
  link: string;
  status: "COMPLETED" | "ONGOING" | "UPCOMING";
  highlights: string[];
  gallery: string[]; 
}

export const EVENTS: K1000Event[] = [
  {
    id: "kampus-konversations-ep2",
    title: "Kampus Konversations Ep.2",
    date: "February 2026",
    description: "The second installment of our flagship series featured Dr. Seth M. Cohen, a Research Professional at UC San Diego. The session focused on the nuances of global research, specialized higher education in the US, and bridging the gap between Indian academia and international labs.",
    category: "Series",
    link: "https://www.linkedin.com/posts/k1000-kiit_k1000-kampuskonversations-ucsd-activity-7430008194581782528-StxS",
    status: "COMPLETED",
    highlights: [
      "Expert Insights: Featuring Dr. Seth M Cohen from UC San Diego (UCSD).",
      "Global Roadmap: Strategies for securing research positions in top-tier US universities.",
      "Interactive Lab Culture: A deep dive into the environment of international research facilities.",
      "Uplink for aspiring researchers and high-performance engineering students."
    ],
    gallery: ["/events/kkep2.jpg"]
  },
    {
    id: "dark-route-2025",
    title: "Dark Route",
    date: "January 2026", // Based on the "2 days ago" context of the recent post
    description: "A massive 15-society crossover initiative managed by K-1000. This two-day multi-campus event bridged the gap between different technical and creative domains, fostering a unique environment of healthy competition and inter-disciplinary collaboration.",
    category: "Hackathon",
    link: "https://www.instagram.com/p/DSmUPwBkXFh/",
    status: "COMPLETED",
    highlights: [
      "15-Society Collaboration: Managed logistics and execution across multiple campuses.",
      "Day 1: Campus-wide strategic treasure hunt testing critical thinking and adaptability.",
      "Day 2: Intensive Hackathon featuring 5 diverse real-world problem statements.",
      "Cross-Community Impact: Built lasting networks between 15 different student organizations."
    ],
    gallery: ["/events/darkroute.png"] 
  },
  {
    id: "sharkathon-2025",
    title: "Shark-A-Thon",
    date: "December 2025",
    description: "In collaboration with AlgoZenith, Sharkathon served as a high-stakes arena for student entrepreneurs. Participants navigated a rigorous 'Shark Tank' style environment, pitching technical innovations to seasoned industry professionals.",
    category: "Hackathon",
    link: "https://www.linkedin.com/posts/k1000-kiit_sharkathon-k1000-algozenith-activity-7403456979068968961-cszu",
    status: "COMPLETED",
    highlights: [
      "Strategic Partnership with AlgoZenith for mentorship.",
      "Live Pitching: Teams defended tech business models against industry 'Sharks'.",
      "Focused on Scalable Tech Startups and real-world solving.",
      "Direct feedback on product-market fit."
    ],
    gallery: ["/events/sharkathon.png"]
  },
  {
    id: "kampus-konversations-ep1",
    title: "Kampus Konversations Ep.1",
    date: "September 2025",
    description: "The debut of our intellectual exchange series featured Dr. Rajakumar Ananthakrishnan from IIT Kharagpur. The session provided a tactical roadmap for students navigating GATE and JAM examinations.",
    category: "Series",
    link: "https://www.linkedin.com/posts/k1000-kiit_kampuskonversations-kiit-k1000-activity-7376926539638034432-576b",
    status: "COMPLETED",
    highlights: [
      "Keynote by Prof. Rajakumar Ananthakrishnan (IIT Kharagpur).",
      "Analysis of GATE & JAM preparation strategies.",
      "Research opportunities in core engineering domains.",
      "Attended by 120+ high-potential candidates."
    ],
    gallery: ["/events/kkep1.jpg"]
  },
  {
    id: "ignithon-2025",
    title: "Ignithon",
    date: "August 2025",
    description: "K-1000's inaugural 12-hour hackathon, Ignithon, challenged participants to build functional solutions from scratch across three difficulty tiers.",
    category: "Hackathon",
    link: "https://www.linkedin.com/posts/k1000-kiit_k1000-ignithon-hackathon-activity-7364154401197838336-UPhb",
    status: "COMPLETED",
    highlights: [
      "12-Hour Sprint: Rapid prototyping from ideation to deployment.",
      "Tiered tracks for Beginner, Intermediate, and Advanced developers.",
      "Over 1000+ registration interests across the campus.",
      "Felicitation by the Vice Chancellor and Registrar of KIIT."
    ],
    gallery: ["/events/ignithon.png"]
  }
];

export default EVENTS;