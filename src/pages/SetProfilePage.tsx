import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { authService } from '../services/auth-service';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { GraduationCap, BookOpen, Compass, Users, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const SetProfilePage: React.FC = () => {
  const { user, accessToken, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name || '');
  const [branch, setBranch] = useState('');
  const [division, setDivision] = useState('');
  const [group, setGroup] = useState('');
  const [batch, setBatch] = useState('2022');
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const branches = [
    { value: 'CSE', label: 'Computer Science & Engineering (CSE)' },
    { value: 'CSBS', label: 'Computer Science and Business Systems (CSBS)' },
    { value: 'IT', label: 'Information Technology (IT)' },
    { value: 'ECE', label: 'Electronics & Communication (ECE)' },
    { value: 'EE', label: 'Electrical Engineering (EE)' },
    { value: 'ME', label: 'Mechanical Engineering (ME)' },
    { value: 'CE', label: 'Civil Engineering (CE)' },
    { value: 'ChE', label: 'Chemical Engineering (ChE)' }
  ];

  const divisions = ['A', 'B', 'C', 'D', 'E'];
  const groups = ['G1', 'G2', 'G3', 'G4', 'G5'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !branch || !division || !group || !batch || !semester) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await authService.updateProfile({
        name,
        branch,
        division,
        group,
        batch,
        semester
      });
      
      // Update state in Zustand store
      if (accessToken) {
        setAuth(response.user, accessToken);
      }
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/20 via-background to-background">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="border-border/80 bg-card/65 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Top glow border */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
          
          <CardHeader className="pb-2 text-center pt-8">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 border border-indigo-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Set Up Your Profile
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto leading-relaxed">
              Welcome to ScholarOS! Please complete your academic details to unlock your dashboard and analytics.
            </p>
          </CardHeader>

          <CardContent className="px-6 pb-8 pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium animate-shake">
                  {error}
                </div>
              )}

              {/* Name Input */}
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
                required
              />

              {/* Branch Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground tracking-wide uppercase flex items-center">
                  <Compass className="h-3.5 w-3.5 mr-1 text-indigo-500" /> Branch / Department
                </label>
                <div className="relative">
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
                    required
                  >
                    <option value="" disabled>Select your branch</option>
                    {branches.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-muted-foreground" />
                </div>
              </div>

              {/* Division & Group row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground tracking-wide uppercase flex items-center">
                    <Users className="h-3.5 w-3.5 mr-1 text-indigo-500" /> Division
                  </label>
                  <div className="relative">
                    <select
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
                      required
                    >
                      <option value="" disabled>Select</option>
                      {divisions.map((d) => (
                        <option key={d} value={d}>Division {d}</option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground tracking-wide uppercase flex items-center">
                    <Users className="h-3.5 w-3.5 mr-1 text-indigo-500" /> Lab Group
                  </label>
                  <div className="relative">
                    <select
                      value={group}
                      onChange={(e) => setGroup(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
                      required
                    >
                      <option value="" disabled>Select</option>
                      {groups.map((g) => (
                        <option key={g} value={g}>Group {g}</option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* Batch & Semester row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground tracking-wide uppercase flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-indigo-500" /> Admission Year / Batch
                  </label>
                  <Input
                    label=""
                    floating={false}
                    type="number"
                    min="2010"
                    max="2030"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    placeholder="e.g. 2022"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground tracking-wide uppercase flex items-center">
                    <BookOpen className="h-3.5 w-3.5 mr-1 text-indigo-500" /> Current Semester
                  </label>
                  <div className="relative">
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
                      required
                    >
                      <option value="" disabled>Select</option>
                      {['1', '2', '3', '4', '5', '6', '7', '8'].map((sem) => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full shadow-lg shadow-indigo-500/20"
                  isLoading={loading}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Complete Onboarding
                </Button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-muted-foreground hover:text-foreground text-center py-2 transition-colors focus:outline-none"
                >
                  Sign out and exit setup
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
