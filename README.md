
# 🌌 K-1000 - KIIT's Elite Engineering Guild

### KIIT University's Premier Research Program Website

**Version:** `0.1.0`  
**Status:** `Development`

<img width="3024" height="1652" alt="image" src="https://github.com/user-attachments/assets/03e2fbab-7364-45ba-ae56-b674661033dd" />


## ⚡ Overview

K-1000 is KIIT University's flagship research initiative designed to nurture the next generation of researchers and innovators. This website serves as the digital interface for the program, featuring an immersive "Neural Link" design that connects students to various research domains through a tactical, holographic UI.

The platform showcases the program's structure, domains, events, leadership, and provides pathways for student applications. Built with cutting-edge web technologies, it delivers a cinematic experience that balances technical sophistication with intuitive navigation.

---

## 🛠 Tech Stack

The system leverages modern web technologies for high-performance animations, 3D visualizations, and real-time interactions.

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.3-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.182-000000?style=for-the-badge&logo=three.js&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.23-0055FF?style=for-the-badge&logo=framer&logoColor=white)

### Core Technologies

* **Framework:** Next.js 16.1.1 (App Router) with React Compiler
* **Language:** TypeScript for type-safe development
* **Styling:** Tailwind CSS v4 with custom neural-cyan theme
* **3D Graphics:** Three.js with React Three Fiber & Drei
* **Animations:** Framer Motion & GSAP for hardware-accelerated effects
* **Smooth Scrolling:** Lenis for enhanced scroll performance
* **Icons:** Lucide React & custom SVG assets
* **Fonts:** Custom Conthrax & Orbitron fonts
* **Analytics:** Vercel Analytics for usage tracking

---

## 🧬 Key Features

### Neural Boot Sequence
An immersive initialization experience with animated logo charging, status updates, and seamless transition to the main interface.

### Interactive Dashboard
- **Domain Holographic Panels:** Dynamic overlays showcasing K-1000's six research domains (Training, Research & Publications, Project Wing, Event Organization, Internship & Placement, Higher Studies)
- **Real-time Telemetry:** Simulated data streams and system diagnostics
- **3D Particle Background:** Interactive canvas-based particle system responding to mouse movement

### Comprehensive Program Information
- **Leadership Structure:** Hierarchical display of executives and directors
- **Event Gallery:** Showcase of past hackathons, workshops, and speaker series
- **Benefits & Opportunities:** Detailed program perks including research funding, patent support, and international exposure
- **Application Pathways:** Clear routes for student enrollment

### Advanced UI Components
- **Shared Header:** Adaptive navigation with glow effects
- **Glass Panels:** Translucent UI elements with backdrop blur
- **Smooth Scrolling:** Lenis-powered smooth scroll with momentum
- **Responsive Design:** Optimized for desktop and mobile experiences

---

## 📁 Project Structure

```
k1000-main/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── about/             # About page
│   │   ├── apply/             # Application page
│   │   ├── benefits/          # Benefits page
│   │   ├── branches/          # Branches page
│   │   ├── contact/           # Contact page
│   │   ├── departments/       # Departments page
│   │   ├── events/            # Events showcase
│   │   ├── hero/              # Hero section
│   │   ├── home/              # Main dashboard
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page (boot sequence)
│   ├── components/            # Reusable components
│   │   ├── boot/              # Boot sequence component
│   │   ├── footer/            # Site footer
│   │   └── ui/                # UI components (panels, header, etc.)
│   ├── data/                  # Static data files
│   │   ├── data.json          # Program information
│   │   ├── domain.ts          # Research domains
│   │   ├── event.ts           # Event data
│   │   └── leadership.ts      # Leadership structure
│   └── lib/                   # Utilities
│       ├── constants.ts       # Constants
│       ├── math.ts            # Math utilities
│       └── shaders/           # GLSL shaders
├── public/                    # Static assets
│   ├── fonts/                 # Custom fonts
│   └── hero/                  # Images
├── package.json               # Dependencies & scripts
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind configuration
└── README.md                 # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VanXodus305/K-1000-Website.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

## 🎯 Program Domains

K-1000 operates across six specialized domains:

1. **Training Program** - Foundational learning and skill development
2. **Research & Publications** - Academic research and scholarly publishing
3. **Project Wing** - Practical project execution and development
4. **Event Organization** - Event planning and community engagement
5. **Internship & Placement** - Career preparation and industry connections
6. **Higher Studies** - Postgraduate education guidance

Each domain features dedicated leadership, focus areas, and measurable outcomes.

---

## 📊 Data Structure

The application uses TypeScript interfaces for type safety:

- `Domain`: Research domain information with colors, descriptions, and outcomes
- `K1000Event`: Event data with categories, highlights, and gallery
- `Leadership`: Hierarchical leadership structure with member details

All data is stored in `/src/data/` and imported as needed.

---

## 🎨 Design Philosophy

The interface embraces a "Neural Link" aesthetic inspired by sci-fi and cyberpunk design:

- **Color Palette:** Neural cyan (#00f7ff) on black backgrounds
- **Typography:** Custom Conthrax for headings, Orbitron for technical elements
- **Animations:** Hardware-accelerated transitions with GSAP and Framer Motion
- **3D Elements:** Three.js integration for immersive experiences
- **Grid Systems:** CSS grid and radial gradients for holographic effects

---

## 🤝 Contributing

We welcome contributions to enhance the K-1000 digital experience!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary to KIIT University and K-1000 Research Program.

---

## 📞 Contact

For inquiries about K-1000 or this website:
- **Organization:** K-1000 Research Program
- **University:** KIIT University
- **Website:** [k1000.kiit.ac.in](https://k1000.kiit.ac.in)
