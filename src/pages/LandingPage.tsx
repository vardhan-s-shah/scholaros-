import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../store/auth-store';
import { 
  ArrowRight, 
  TrendingUp, 
  Sparkles, 
  Compass, 
  Layers, 
  Lock, 
  Zap 
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 80 } }
  };

  const features = [
    {
      icon: <TrendingUp className="h-6 w-6 text-indigo-500" />,
      title: "Predictive Analytics",
      description: "Enter your target GPA or marks and see what scores you need in upcoming assessments to achieve your academic goals."
    },
    {
      icon: <Layers className="h-6 w-6 text-emerald-500" />,
      title: "Semester Journeys",
      description: "Visualize credit loads, track course syllabi progression, and get automatic warnings when course loads exceed benchmarks."
    },
    {
      icon: <Compass className="h-6 w-6 text-violet-500" />,
      title: "Smart Study Planning",
      description: "Generates custom timetables based on high-weightage topics and class schedules to maximize study efficiency."
    }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-32 flex flex-col items-center text-center px-6">
        
        {/* Glow Effects */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-40 left-1/3 w-[300px] h-[300px] rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-[100px] pointer-events-none -z-10" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl space-y-6"
        >
          {/* Badge */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs px-3.5 py-1.5 rounded-full font-semibold uppercase tracking-wider"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Now in Private Beta for Universities</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]"
          >
            Your Academic Success, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-500 dark:from-indigo-400 dark:via-purple-400 dark:to-emerald-400 bg-clip-text text-transparent">
              Decoded with Data
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            variants={itemVariants}
            className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            ScholarOS integrates your class timetables, marks, and course syllabus to build a personalized performance dashboard. Achieve your target GPA with smart academic analytics.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link to={isAuthenticated ? "/dashboard" : "/register"}>
              <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />} className="w-full sm:w-auto px-8">
                {isAuthenticated ? "Go to Dashboard" : "Get Started (Free)"}
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
                Explore Features
              </Button>
            </a>
          </motion.div>
        </motion.div>

        {/* Hero Interactive App Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', duration: 1 }}
          className="mt-16 w-full max-w-5xl px-4"
        >
          <div className="relative rounded-2xl border border-border/80 bg-card shadow-2xl p-2.5 overflow-hidden group">
            {/* Ambient border glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="rounded-xl border border-border bg-zinc-950 text-zinc-100 p-6 text-left space-y-6">
              {/* Header inside mockup */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  <span className="text-xs text-zinc-500 font-mono pl-4">scholaros-student-dashboard</span>
                </div>
                <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1">
                  <Lock className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="text-[10px] text-zinc-400 font-medium">Secured Endpoint</span>
                </div>
              </div>

              {/* Grid content inside mockup */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900/60 border border-zinc-900 p-4 rounded-xl space-y-2">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Target GPA</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold">3.85</span>
                    <span className="text-xs text-emerald-400 font-semibold">+4.2% from midsem</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                  </div>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-900 p-4 rounded-xl space-y-2">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Credits Completed</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold">78</span>
                    <span className="text-xs text-zinc-400">/ 120 total</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full w-[65%] bg-indigo-500 rounded-full" />
                  </div>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-900 p-4 rounded-xl space-y-2">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Upcoming Tasks</span>
                  <div className="flex items-center justify-between text-sm">
                    <span>CS 301 - Lab report</span>
                    <span className="text-amber-400 text-xs font-semibold">Today 5 PM</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>EE 204 - Quiz prep</span>
                    <span className="text-zinc-500 text-xs">Tomorrow</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-indigo-400" />
                  <div>
                    <p className="text-xs font-semibold">Next recommendation</p>
                    <p className="text-xs text-zinc-400">Score 82+ in EE 204 midsem to stay above 3.8 GPA threshold.</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs border-zinc-800 hover:bg-zinc-900 hover:text-white text-zinc-300">
                  Analyze
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-card/40 border-t border-border/60 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for Modern Students</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Say goodbye to scattered Excel sheets and manual GPA calculations. ScholarOS unites your academic data in one secure workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                className="p-6 bg-card border border-border rounded-2xl flex flex-col justify-between space-y-4 hover:shadow-lg hover:border-primary/10 transition-all duration-300"
              >
                <div className="p-3 bg-muted rounded-xl w-fit">
                  {feature.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 relative text-center px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/3 blur-[100px] pointer-events-none -z-10" />
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight">Ready to master your semesters?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
            Create your account today using your institutional email and gain access to predictive metrics.
          </p>
          <div className="pt-2">
            <Link to={isAuthenticated ? "/dashboard" : "/register"}>
              <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                {isAuthenticated ? "Enter Dashboard" : "Sign Up with College Email"}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
