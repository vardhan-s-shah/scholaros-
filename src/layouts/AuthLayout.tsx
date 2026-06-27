import React, { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { GraduationCap, ChartSpline, BookOpen, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const features = [
  {
    icon: <ChartSpline className="h-6 w-6 text-indigo-400" />,
    title: "Predictive Academic Analytics",
    description: "Forecast your grades and semester path using AI-powered insights."
  },
  {
    icon: <BookOpen className="h-6 w-6 text-emerald-400" />,
    title: "Semester Journey Tracking",
    description: "Visualize credits, track assignments, and map your academic progression."
  },
  {
    icon: <Clock className="h-6 w-6 text-amber-400" />,
    title: "Smart Timetable & Reminders",
    description: "Never miss a lecture or assignment with calendar sync and smart alerts."
  }
];

export const AuthLayout: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground transition-colors duration-300">
      
      {/* Brand & Theme Toggle Header for mobile view */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center md:hidden z-20">
        <Link to="/" className="flex items-center space-x-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-bold tracking-tight text-lg">ScholarOS</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Left Panel: Visual/Marketing - Hidden on mobile */}
      <div className="hidden md:flex md:w-[45%] lg:w-[40%] bg-zinc-950 relative overflow-hidden flex-col justify-between p-12 text-zinc-50 border-r border-zinc-900">
        {/* Ambient Glows */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-xl bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">ScholarOS</span>
              <span className="text-[10px] block text-indigo-400 font-mono tracking-widest leading-none">ACADEMIC ANALYTICS</span>
            </div>
          </Link>
        </div>

        {/* Testimonial/Feature Carousel */}
        <div className="relative z-10 my-auto py-12">
          <div className="h-[240px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
                  {features[activeFeature].icon}
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold tracking-tight leading-snug">
                    {features[activeFeature].title}
                  </h2>
                  <p className="text-zinc-400 leading-relaxed text-sm lg:text-base">
                    {features[activeFeature].description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel indicators */}
          <div className="flex space-x-2 mt-4">
            {features.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveFeature(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeFeature ? 'w-6 bg-indigo-500' : 'w-1.5 bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} ScholarOS. All rights reserved.</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Terms</a>
          </div>
        </div>
      </div>

      {/* Right Panel: Content / Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 relative pt-16 md:pt-0">
        
        {/* Floating Theme Toggle (Desktop) */}
        <div className="hidden md:block absolute top-8 right-8 z-20">
          <ThemeToggle />
        </div>

        {/* Content Box */}
        <div className="w-full max-w-[420px] py-12 flex flex-col justify-center">
          <Outlet />
        </div>
      </div>
      
    </div>
  );
};
