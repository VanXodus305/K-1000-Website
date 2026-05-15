"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Sparkles, Send, Globe, Cpu } from "lucide-react";
import SharedHeader from "../../components/ui/SharedHeader";
import Footer from "../../components/footer/Footer";
import CubeBackground from "../../components/ui/CubeBackground";

const conthrax = "font-['Conthrax',_sans-serif]";

const Contact = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-black text-white selection:bg-cyan-500/30 flex flex-col items-center overflow-x-hidden">
      <SharedHeader />
      
      {/* ─── BACKGROUND LAYERS ─── */}
      <CubeBackground disableLinesOnMobile />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,#0ea5e90a_0%,transparent_70%)] pointer-events-none z-[2]" />

      <main className="relative z-10 w-full max-w-6xl px-6 pt-40 md:pt-52 flex flex-col items-center flex-grow">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full mb-32">
          
          {/* ─── PRIMARY IDENTITY PANEL ─── */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 bg-[#050505]/80 backdrop-blur-xl border border-white/5 rounded-[40px] p-10 md:p-20 relative overflow-hidden flex flex-col justify-center shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
              <Globe size={400} className="text-cyan-400" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <Sparkles size={14} className="text-cyan-400" />
                <span className={`${conthrax} text-white/40 text-[10px] tracking-[0.4em] uppercase font-black`}>K-1000 Organisation</span>
              </div>

              <h1 className={`${conthrax} text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-8`}>
                Get in <br />
                <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(0,247,255,0.4)]">Touch</span>
              </h1>

              <p className="text-white/40 text-lg md:text-xl font-light leading-relaxed max-w-md">
                Reach out for high-fidelity research collaborations, technical inquiries, and academic excellence opportunities.
              </p>
            </div>
          </motion.div>

          {/* ─── CONTACT VECTOR PANEL ─── */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            <div className="flex-1 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[40px] p-10 relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 opacity-[0.02] pointer-events-none">
                <Cpu size={300} className="text-cyan-400" />
              </div>

              <div className="space-y-12 relative z-10 h-full flex flex-col justify-center">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-cyan-400">
                    <MapPin size={20} />
                    <span className={`${conthrax} text-[10px] tracking-widest uppercase font-black opacity-60`}>Location</span>
                  </div>
                  <p className="text-white text-xl font-light">
                    KIIT University, <br />
                    <span className="text-white/40">Bhubaneswar, India</span>
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-cyan-400">
                    <Phone size={20} />
                    <span className={`${conthrax} text-[10px] tracking-widest uppercase font-black opacity-60`}>Faculty</span>
                  </div>
                  <div>
                    <p className="text-white text-xl font-light mb-1">Dr. Ajit Kumar Pasayat</p>
                    <p className="text-cyan-400/80 font-bold tracking-tighter">+91 70085 88187</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-cyan-400">
                    <Mail size={20} />
                    <span className={`${conthrax} text-[10px] tracking-widest uppercase font-black opacity-60`}>Digital Mail</span>
                  </div>
                  <p className="text-white/60 text-base font-bold tracking-tighter hover:text-white transition-colors break-all">
                    k.1000@kiit.ac.in
                  </p>
                </div>
              </div>
            </div>

            {/* SEND CTA */}
            <motion.a
              href="mailto:k.1000@kiit.ac.in"
              whileHover={{ scale: 1.02, backgroundColor: "#06b6d4", color: "#000" }}
              whileTap={{ scale: 0.98 }}
              className={`${conthrax} bg-white text-black p-8 rounded-[30px] flex items-center justify-center gap-4 text-sm font-black uppercase tracking-widest transition-all duration-300 shadow-[0_20px_50px_-15px_rgba(255,255,255,0.1)]`}
            >
              Send Message <Send size={18} />
            </motion.a>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
