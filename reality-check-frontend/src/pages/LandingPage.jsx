import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, Upload, Zap, Users, Eye, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

import heroImage1 from '../assets/Include_image.jpg';
import heroImage2 from '../assets/include_2.jpg';

export default function LandingPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [currentImage, setCurrentImage] = useState(0);

  const images = [heroImage1, heroImage2];

  // Auto image carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleLogin = (role) => {
    let email = '';
    if (role === 'admin') email = 'admin@realitycheck.ai';
    else if (role === 'expert') email = 'expert@realitycheck.ai';
    else email = 'user@realitycheck.ai';

    login(email, '', role);
    
    if (role === 'admin') navigate('/admin-dashboard');
    else if (role === 'expert') navigate('/expert-dashboard');
    else navigate('/user-dashboard');
  };

  const timelineSteps = [
    { icon: Upload, title: "Upload", desc: "Submit Image or Video" },
    { icon: Eye, title: "Preprocess", desc: "Frame Extraction & Normalization" },
    { icon: Zap, title: "AI Analysis", desc: "Multi-Model Deepfake Detection" },
    { icon: Users, title: "Model Comparison", desc: "Cross-Validation of Results" },
    { icon: CheckCircle, title: "Authenticity Score", desc: "Confidence Metrics Generated" },
    { icon: Shield, title: "Expert Verdict", desc: "Human Expert Final Decision" },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-9 h-9 text-cyan-400" />
            <h1 className="text-4xl font-bold tracking-tighter">
              REALITY<span className="text-cyan-400">CHECK</span>
            </h1>
          </div>
          <button
            onClick={() => navigate('/methodology')}
            className="text-sm hover:text-cyan-400 transition-colors"
          >
            Methodology
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-24 min-h-screen grid md:grid-cols-2 gap-8 items-center px-8 max-w-7xl mx-auto">
        {/* Left Content */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass border border-cyan-400/30"
          >
        
            <span className="text-sm tracking-widest font-mono text-cyan-400">AI + HUMAN VERIFICATION</span>
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-tight">
            Reality Check
          </h1>
 <br>
 </br>
          <p className="text-2xl text-slate-300 max-w-lg">
            In a World of Synthetic Media, <span className="text-cyan-400">Trust Needs Verification</span>
          </p>

          <p className="text-lg text-slate-400 max-w-md">
            Reality Check uses advanced AI detection models to analyze manipulated images and videos while providing transparent and interpretable results.
          </p>

          {/* Role Selection */}
          <div className="pt-6">
            <p className="text-slate-400 mb-4 text-sm tracking-widest">I NEED TO LOGIN AS</p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => handleRoleLogin('user')} className="futuristic-btn">USER</button>
              <button onClick={() => handleRoleLogin('expert')} className="futuristic-btn">EXPERT</button>
              <button onClick={() => handleRoleLogin('admin')} className="futuristic-btn">ADMIN</button>
            </div>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="mt-8 px-10 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl text-xl font-semibold flex items-center gap-3 hover:scale-105 transition-all"
          >
            Enter Platform <ArrowRight />
          </button>
        </div>

        {/* Right Side - Dynamic Image */}
        <div className="relative h-[600px] rounded-3xl overflow-hidden border border-cyan-500/20 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImage}
              src={images[currentImage]}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 w-full h-full object-cover"
              alt="Deepfake Detection"
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          
          <motion.div
            animate={{ y: ["0%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          />
        </div>
      </section>

      {/* TIMELINE - HOW IT WORKS */}
      <section className="py-24 bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-5xl font-bold text-center mb-16 tracking-tight">
            How Reality Check Works
          </h2>

          <div className="relative">
            {/* Horizontal Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-cyan-500/30" />

            <div className="flex items-center justify-between relative">
              {timelineSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center text-center group relative z-10"
                >
                  <div className="w-20 h-20 glass rounded-2xl flex items-center justify-center mb-6 border border-cyan-400/30 group-hover:border-cyan-400 group-hover:scale-110 transition-all duration-300">
                    <step.icon className="w-10 h-10 text-cyan-400" />
                  </div>

                  <div className="text-cyan-400 font-mono text-sm mb-2 tracking-widest">
                    STEP {String(index + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 group-hover:text-cyan-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 max-w-[160px]">{step.desc}</p>

                  {/* Connecting Arrow (except last) */}
                  {index !== timelineSteps.length - 1 && (
                    <ArrowRight className="absolute -right-6 top-10 text-cyan-400/50 text-3xl hidden md:block" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Demo Upload Button */}
          <div className="text-center mt-20">
            <button
              onClick={() => navigate('/user-dashboard')}
              className="inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl text-xl font-semibold hover:brightness-110 transition-all"
            >
              <Upload className="w-7 h-7" />
              TRY UPLOAD IMAGE / VIDEO
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <p className="text-slate-400 text-lg mb-4">
            Created by <span className="text-cyan-400">Noshin Syara</span>, <span className="text-cyan-400">Tasnia Rahman Maha</span> and <span className="text-cyan-400">Maliha Mehnaj</span>
          </p>
          <p className="text-sm text-slate-500">
            © 2026 Reality Check • Ethical AI Verification Platform • Innovation World Cup 2026
          </p>
        </div>
      </footer>
    </div>
  );
}