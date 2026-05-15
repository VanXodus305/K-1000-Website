"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link"; 
import { usePathname } from "next/navigation";
import { MapPin, Phone, Mail, ChevronRight } from "lucide-react";
import { FaLinkedinIn, FaWhatsapp, FaInstagram } from "react-icons/fa6";
import styles from "./Footer.module.scss";

const conthrax = "font-['Conthrax',_sans-serif]";

const Footer = () => {
  const pathname = usePathname();

  const quickLinks = [
    { title: "Home", path: "/home" },
    { title: "About Program", path: "/about" },
    { title: "Benefits", path: "/benefits" },
    { title: "Branches", path: "/branches" },
    { title: "Apply Now", path: "/apply" },
    { title: "Contact", path: "/contact" },
  ];

  const researchAreas = [
    { title: "Engineering & Technology", href: "/departments#DEPT-ENG-01" },
    { title: "Sciences & Applied Sciences", href: "/departments#DEPT-SCI-02" },
    { title: "Management & Social Sciences", href: "/departments#DEPT-MGMT-03" },
    { title: "Medical & Health Sciences", href: "/departments#DEPT-MED-04" },
    { title: "Law & Public Policy", href: "/departments#DEPT-LAW-05" },
    { title: "Sports & Tourism", href: "/departments#DEPT-SPR-06" },
  ];

  return (
    <footer className={`${styles.footer} bg-[#010103] border-t border-cyan-500/30 relative z-[100] py-8 md:py-12`}>
      {/* Top Border Glow Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-400/40 shadow-[0_0_10px_#00f7ff]" />
      
      <div className={`${styles.container} max-w-7xl mx-auto px-6`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Logo and Description */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col"
          >
            <div className="flex gap-4 mb-6 items-center relative">
              <div className="absolute -left-2 w-24 h-24 bg-cyan-500/5 blur-[30px] rounded-full" />
              
              <img
                src="https://cdn.prod.website-files.com/663d1907e337de23e83c30b2/67a07ffa91f78ddf2b941175_KIIT-logo-HD.png"
                alt="KIIT Logo"
                className="h-[45px] object-contain brightness-110 relative z-10"
              />
              <img
                src="/k1000-small.png"
                alt="K-1000 Logo"
                className="h-[45px] object-contain brightness-125 drop-shadow-[0_0_8px_rgba(0,247,255,0.5)] animate-pulse relative z-10"
              />
            </div>
            <p className="text-white/70 text-[13px] leading-relaxed max-w-[280px] font-normal">
              K-1000 is KIIT&apos;s premier <span className="text-cyan-400 font-bold">R&D initiative</span>, empowering 1000
              exceptional students through innovative research.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className={`${conthrax} text-white text-[11px] tracking-[0.25em] uppercase mb-6 font-black`}>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.path}
                    className={`flex items-center gap-2 text-[16px] transition-all hover:text-cyan-400 group ${
                      pathname === link.path ? "text-cyan-400" : "text-white/50"
                    } font-medium tracking-wide`}
                  >
                    <ChevronRight size={14} className={`${pathname === link.path ? 'text-cyan-400' : 'text-cyan-400/30'} group-hover:translate-x-1 transition-transform`} />
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Departments */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className={`${conthrax} text-white text-[11px] tracking-[0.25em] uppercase mb-6 font-black`}>
              Departments
            </h3>
            <ul className="space-y-3">
              {researchAreas.map((area, index) => (
                <li key={index}>
                  <Link 
                    href={area.href}
                    className="flex items-center gap-2 text-white/50 text-[16px] hover:text-cyan-400 group transition-all font-medium tracking-wide"
                  >
                    <ChevronRight size={14} className="text-cyan-400/30 group-hover:translate-x-1 transition-transform" />
                    {area.title}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className={`${conthrax} text-white text-[11px] tracking-[0.25em] uppercase mb-6 font-black`}>
              Connect
            </h3>
            <div className="flex gap-5 items-center justify-start mb-6">
              <a href="https://www.linkedin.com/company/k1000-kiit" target="_blank" className="hover:scale-110 transition-transform group">
                <FaLinkedinIn className="text-white/40 text-xl group-hover:text-cyan-400 transition-all" />
              </a>
              <a href="https://www.instagram.com/k1000_kiit" target="_blank" className="hover:scale-110 transition-transform group">
                <FaInstagram className="text-white/40 text-xl group-hover:text-cyan-400 transition-all" />
              </a>
              <a href="https://chat.whatsapp.com/CAM4B9Qf0mN6i4CvJaVKi3" target="_blank" className="hover:scale-110 transition-transform group">
                <FaWhatsapp className="text-white/40 text-xl group-hover:text-cyan-400 transition-all" />
              </a>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-3 items-start text-white text-[16px] font-medium">
                <MapPin className="text-cyan-400 shrink-0" size={16} />
                <span className="leading-tight">KIIT University, Bhubaneswar,<br/><span className="text-white/30 text-[10px] uppercase tracking-wider">Odisha 751024</span></span>
              </div>
              <div className="flex gap-3 items-start text-white text-[16px] font-medium">
                <Phone className="text-cyan-400 shrink-0" size={16} />
                <span className="tracking-wide">Dr. Ajit Kumar Pasayat<br/><span className="text-cyan-400 text-[11px]">+91 7008588187</span></span>
              </div>
              <div className="flex gap-3 items-start text-white text-[16px] font-medium">
                <Mail className="text-cyan-400 shrink-0" size={16} />
                <span className="underline underline-offset-4 decoration-cyan-400/30 hover:text-cyan-400 transition-colors">k.1000@kiit.ac.in</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section - Centered on Mobile */}
        <div className="mt-12 pt-6 pb-2 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-medium text-center md:text-left">
            © {new Date().getFullYear()} KIIT University.
          </p>
          <div className={`${conthrax} text-[7px] text-cyan-500/60 tracking-[0.8em] font-black uppercase text-center md:text-right w-full md:w-auto`}>
            Train . Transform . Transcend
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;