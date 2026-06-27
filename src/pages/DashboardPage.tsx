import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { useMarksStore } from '../store/marks-store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  Calculator,
  BookOpen,
  Award,
  Sparkles,
  ArrowRight,
  PlusCircle,
  GraduationCap,
  BarChart2,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  Bell,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { updateService } from '../services/update-service';
import type { UpdateEntry } from '../services/update-service';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import type { MarkEntry } from '../types/auth.types';

// PDEU Grading: Total = EndSem/2 + MidSem + IA
// O: >80, A+: >70, A: >60, B+: >50, P: >40, F: <=40
const getPdeuTotal = (mid: number, ia: number, endSem?: number): number | null => {
  if (endSem === undefined) return null;
  return endSem / 2 + mid + ia;
};

const getGradePoints = (total: number, endSem?: number): number => {
  if (endSem !== undefined && endSem <= 35) return 0;
  if (total >= 80) return 10;  // O
  if (total >= 70) return 9;   // A+
  if (total >= 60) return 8;   // A
  if (total >= 55) return 7;   // B+
  if (total >= 50) return 6;   // B
  if (total >= 45) return 5;   // C
  if (total >= 40) return 4;   // P
  return 0;                    // F
};

const getGradeLabel = (total: number, endSem?: number): string => {
  if (endSem !== undefined && endSem <= 35) return 'F';
  if (total >= 80) return 'O';
  if (total >= 70) return 'A+';
  if (total >= 60) return 'A';
  if (total >= 55) return 'B+';
  if (total >= 50) return 'B';
  if (total >= 45) return 'C';
  if (total >= 40) return 'P';
  return 'F';
};

interface SemesterStats {
  semester: string;
  sgpa: number;
  cgpa: number;
  credits: number;
  subjects: number;
}

const computeSemesterData = (marks: MarkEntry[]): SemesterStats[] => {
  // Group marks by semester
  const semMap = new Map<string, MarkEntry[]>();
  marks.forEach((m) => {
    const list = semMap.get(m.semester) || [];
    list.push(m);
    semMap.set(m.semester, list);
  });

  // Sort semesters
  const sortedSems = Array.from(semMap.keys()).sort((a, b) => Number(a) - Number(b));

  let cumulativeCredits = 0;
  let cumulativeGradePoints = 0;
  const result: SemesterStats[] = [];

  sortedSems.forEach((sem) => {
    const semMarks = semMap.get(sem)!;
    let semCredits = 0;
    let semGradePoints = 0;
    let completedInSem = 0;

    semMarks.forEach((m) => {
      const pdeuTotal = getPdeuTotal(m.midSemMarks, m.internalMarks, m.endSemMarks);
      if (pdeuTotal !== null) {
        const gp = getGradePoints(pdeuTotal, m.endSemMarks);
        semCredits += m.credits;
        semGradePoints += gp * m.credits;
        completedInSem++;
      }
    });

    if (completedInSem > 0 && semCredits > 0) {
      const sgpa = semGradePoints / semCredits;
      cumulativeCredits += semCredits;
      cumulativeGradePoints += semGradePoints;
      const cgpa = cumulativeGradePoints / cumulativeCredits;

      result.push({
        semester: `Sem ${sem}`,
        sgpa: Math.round(sgpa * 100) / 100,
        cgpa: Math.round(cgpa * 100) / 100,
        credits: semCredits,
        subjects: completedInSem,
      });
    }
  });

  return result;
};

const computeOverallStats = (marks: MarkEntry[]) => {
  if (!marks || marks.length === 0) return null;

  let totalCredits = 0;
  let totalGradePoints = 0;
  let completedSubjects = 0;
  let pendingSubjects = 0;

  marks.forEach((m) => {
    const pdeuTotal = getPdeuTotal(m.midSemMarks, m.internalMarks, m.endSemMarks);
    if (pdeuTotal !== null) {
      const gp = getGradePoints(pdeuTotal, m.endSemMarks);
      totalCredits += m.credits;
      totalGradePoints += gp * m.credits;
      completedSubjects++;
    } else {
      pendingSubjects++;
    }
  });

  const cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits) : null;

  return {
    cgpa: cgpa !== null ? Math.round(cgpa * 100) / 100 : null,
    totalCredits,
    totalSubjects: marks.length,
    completedSubjects,
    pendingSubjects,
  };
};

// Custom Tooltip for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-sm">
        <p className="font-bold text-foreground mb-1.5">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2 text-xs">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-bold text-foreground">{entry.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Curriculum Update':
      return <BookOpen className="h-4 w-4" />;
    case 'New Feature':
      return <Sparkles className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Curriculum Update':
      return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    case 'New Feature':
      return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
    default:
      return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';
  }
};

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { marks, isLoading, fetchMarks } = useMarksStore();
  const navigate = useNavigate();
  const [updates, setUpdates] = useState<UpdateEntry[]>([]);
  const [updatesLoading, setUpdatesLoading] = useState(true);

  useEffect(() => {
    fetchMarks();
    
    const fetchUpdates = async () => {
      try {
        setUpdatesLoading(true);
        const data = await updateService.getUpdates();
        setUpdates(data);
      } catch (err) {
        console.error('Failed to fetch updates:', err);
      } finally {
        setUpdatesLoading(false);
      }
    };
    fetchUpdates();
  }, []);

  const stats = useMemo(() => computeOverallStats(marks), [marks]);
  const semData = useMemo(() => computeSemesterData(marks), [marks]);
  const hasMarks = marks.length > 0;
  const hasCompletedMarks = semData.length > 0;

  // Trend indicator
  const cgpaTrend = semData.length >= 2
    ? semData[semData.length - 1].cgpa - semData[semData.length - 2].cgpa
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* Welcome Banner */}
      <section className="bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
            </h2>
            <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {user?.branch && (
              <span className="font-medium text-foreground/80">{user.branch} • Div {user.division} • {user.group} • Batch {user.batch}</span>
            )}
            {!user?.branch && 'Your Academic Performance Dashboard.'}
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-background/60 backdrop-blur border border-border px-3.5 py-1.5 rounded-xl relative z-10">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            Session Active
          </span>
        </div>
      </section>

      {/* Important Updates Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-indigo-500 animate-bounce" style={{ animationDuration: '3s' }} />
            <h3 className="text-lg font-bold tracking-tight">Important Updates</h3>
          </div>
          {user?.role === 'admin' && (
            <Link to="/admin/updates" className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 transition-colors">
              Manage Updates <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
        
        {updatesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Card key={i} className="border-border/60 animate-pulse">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="h-8 w-8 bg-muted rounded-lg flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-muted rounded w-1/4" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : updates.length === 0 ? (
          <Card className="border-border/60 bg-card/50">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              No new updates or announcements published yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {updates.slice(0, 4).map((update) => (
              <Card key={update.id} className="border-border/60 hover:border-indigo-500/30 transition-all hover:shadow-md relative group overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  update.category === 'Curriculum Update' ? 'bg-amber-500' :
                  update.category === 'New Feature' ? 'bg-indigo-500' :
                  'bg-cyan-500'
                }`} />
                <CardContent className="p-5 pl-6 flex items-start gap-4">
                  <div className={`p-2 rounded-lg flex-shrink-0 mt-1 ${getCategoryColor(update.category)}`}>
                    {getCategoryIcon(update.category)}
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${
                        update.category === 'Curriculum Update' ? 'text-amber-500' :
                        update.category === 'New Feature' ? 'text-indigo-500' :
                        'text-cyan-500'
                      }`}>
                        {update.category}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-mono">
                        {new Date(update.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-foreground truncate">{update.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {update.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Loading State */}
      {isLoading && marks.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        </div>
      )}

      {/* ─── BASE STATE: No marks added ─── */}
      {!isLoading && !hasMarks && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Empty KPI Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Current CGPA', value: '—', icon: <Award className="h-6 w-6" />, bg: 'bg-indigo-500/10', fg: 'text-indigo-600 dark:text-indigo-400' },
              { label: 'Total Credits', value: '0', icon: <BookOpen className="h-6 w-6" />, bg: 'bg-emerald-500/10', fg: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Subjects Fed', value: '0', icon: <ClipboardList className="h-6 w-6" />, bg: 'bg-amber-500/10', fg: 'text-amber-600 dark:text-amber-400' },
              { label: 'Avg Performance', value: '—', icon: <TrendingUp className="h-6 w-6" />, bg: 'bg-violet-500/10', fg: 'text-violet-600 dark:text-violet-400' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="p-5 flex items-center space-x-4 border-border/60 opacity-60">
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.fg}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{stat.label}</p>
                    <p className="text-2xl font-bold text-muted-foreground">{stat.value}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </section>

          {/* Onboarding CTA Card */}
          <Card className="border-indigo-500/25 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-indigo-500/10 blur-[60px] pointer-events-none" />
            <CardContent className="flex flex-col md:flex-row items-center gap-8 p-8">
              <div className="p-5 bg-indigo-500/10 rounded-2xl text-indigo-500 border border-indigo-500/20 flex-shrink-0">
                <GraduationCap className="h-12 w-12" />
              </div>
              <div className="flex-1 space-y-3 text-center md:text-left">
                <h3 className="text-xl font-black tracking-tight">Your academic data is waiting!</h3>
                <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                  You haven't fed any marks yet. Start by adding your subject marks across semesters —
                  your CGPA, SGPA graph, and grade analysis will appear right here.
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                  <Button
                    onClick={() => navigate('/feed-marks')}
                    leftIcon={<PlusCircle className="h-4 w-4" />}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                    className="shadow-lg shadow-indigo-500/20"
                  >
                    Feed My Marks
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/marks-calculator')}
                    leftIcon={<Calculator className="h-4 w-4" />}
                  >
                    Marks Calculator
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: <ClipboardList className="h-5 w-5 text-indigo-500" />, title: 'Feed Marks', desc: 'Enter mid-sem, IA, and end-sem marks for each subject.', path: '/feed-marks' },
              { icon: <Calculator className="h-5 w-5 text-amber-500" />, title: 'Marks Calculator', desc: 'See what you need in end-sem to hit your target grade.', path: '/marks-calculator' },
              { icon: <BarChart2 className="h-5 w-5 text-violet-500" />, title: 'Academic Analytics', desc: 'AI-powered insights and grade predictions.', path: '#', badge: 'Coming Soon' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
                <Link to={item.path} className="block h-full">
                  <Card className={`h-full p-5 hover:shadow-md hover:border-primary/25 transition-all cursor-pointer ${item.path === '#' ? 'opacity-55 cursor-not-allowed' : ''}`}>
                    <div className="p-2.5 bg-muted rounded-lg w-fit mb-3">{item.icon}</div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm">{item.title}</h4>
                      {item.badge && <span className="text-[9px] font-bold bg-muted text-muted-foreground px-1.5 py-0.5 rounded uppercase tracking-wide">{item.badge}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── POPULATED STATE: Has marks ─── */}
      {!isLoading && hasMarks && stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Real KPI Stats Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
              <Card className="p-5 flex items-center space-x-4 border-border/60 hover:shadow-md transition-shadow">
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">CGPA</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold">{stats.cgpa?.toFixed(2) ?? '—'}</p>
                    {cgpaTrend !== 0 && (
                      <span className={`flex items-center text-xs font-semibold ${cgpaTrend > 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                        {cgpaTrend > 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                        {Math.abs(cgpaTrend).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
              <Card className="p-5 flex items-center space-x-4 border-border/60 hover:shadow-md transition-shadow">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Credits Earned</p>
                  <p className="text-2xl font-bold">{stats.totalCredits}</p>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
              <Card className="p-5 flex items-center space-x-4 border-border/60 hover:shadow-md transition-shadow">
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Subjects</p>
                  <p className="text-2xl font-bold">{stats.totalSubjects}</p>
                  <p className="text-[10px] text-muted-foreground">{stats.pendingSubjects} pending end-sem</p>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
              <Card className="p-5 flex items-center space-x-4 border-border/60 hover:shadow-md transition-shadow">
                <div className="p-3 bg-violet-500/10 rounded-xl text-violet-600 dark:text-violet-400">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Latest SGPA</p>
                  <p className="text-2xl font-bold">{semData.length > 0 ? semData[semData.length - 1].sgpa.toFixed(2) : '—'}</p>
                </div>
              </Card>
            </motion.div>
          </section>

          {/* SGPA / CGPA Graph */}
          {hasCompletedMarks && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold flex items-center space-x-2">
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-500">
                      <BarChart2 className="h-4 w-4" />
                    </div>
                    <span>SGPA & CGPA Trend</span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Performance trajectory across semesters (PDEU grading)</p>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={semData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <defs>
                          <linearGradient id="sgpaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="cgpaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis
                          dataKey="semester"
                          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, 10]}
                          ticks={[0, 2, 4, 6, 8, 10]}
                          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          verticalAlign="top"
                          align="right"
                          iconType="circle"
                          wrapperStyle={{ fontSize: '12px', paddingBottom: '8px' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="sgpa"
                          name="SGPA"
                          stroke="#818cf8"
                          strokeWidth={2.5}
                          fill="url(#sgpaGradient)"
                          dot={{ r: 5, fill: '#818cf8', stroke: '#fff', strokeWidth: 2 }}
                          activeDot={{ r: 7, fill: '#818cf8', stroke: '#fff', strokeWidth: 2 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="cgpa"
                          name="CGPA"
                          stroke="#34d399"
                          strokeWidth={2.5}
                          fill="url(#cgpaGradient)"
                          dot={{ r: 5, fill: '#34d399', stroke: '#fff', strokeWidth: 2 }}
                          activeDot={{ r: 7, fill: '#34d399', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Semester breakdown legend */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border/40">
                    {semData.map((s, i) => (
                      <div key={i} className="flex items-center space-x-2 text-xs">
                        <div className="h-2.5 w-2.5 rounded-full bg-indigo-400 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-foreground">{s.semester}</span>
                          <span className="text-muted-foreground ml-1">— SGPA {s.sgpa.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Recent Subjects List */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold tracking-tight">Recent Subjects</h3>
              <Link to="/feed-marks" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full hover:bg-indigo-500/20 transition-colors">
                Manage All →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marks.slice(0, 6).map((mark, i) => {
                const pdeuTotal = getPdeuTotal(mark.midSemMarks, mark.internalMarks, mark.endSemMarks);
                const grade = pdeuTotal !== null ? getGradeLabel(pdeuTotal) : null;
                const barWidth = pdeuTotal !== null ? `${pdeuTotal}%` : '0%';
                const barColor = pdeuTotal !== null
                  ? (pdeuTotal > 80 ? 'bg-emerald-500' : pdeuTotal > 70 ? 'bg-teal-500' : pdeuTotal > 60 ? 'bg-indigo-500' : pdeuTotal > 50 ? 'bg-blue-500' : pdeuTotal > 40 ? 'bg-amber-500' : 'bg-destructive')
                  : 'bg-muted';

                return (
                  <motion.div
                    key={mark.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{mark.subjectCode}</span>
                            <span className="text-xs text-muted-foreground">Sem {mark.semester}</span>
                          </div>
                          <p className="font-semibold text-sm mt-1">{mark.subjectName}</p>
                        </div>
                        <div className="text-right">
                          {pdeuTotal !== null ? (
                            <>
                              <p className="text-lg font-black">{pdeuTotal.toFixed(1)}<span className="text-xs text-muted-foreground font-normal">/100</span></p>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                pdeuTotal > 80 ? 'text-emerald-500 bg-emerald-500/10' :
                                pdeuTotal > 70 ? 'text-teal-500 bg-teal-500/10' :
                                pdeuTotal > 60 ? 'text-indigo-500 bg-indigo-500/10' :
                                pdeuTotal > 50 ? 'text-blue-500 bg-blue-500/10' :
                                pdeuTotal > 40 ? 'text-amber-500 bg-amber-500/10' :
                                'text-destructive bg-destructive/10'
                              }`}>{grade}</span>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Pending</span>
                          )}
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: barWidth }}
                          transition={{ duration: 0.7, delay: i * 0.05 + 0.2 }}
                          className={`h-full rounded-full ${barColor}`}
                        />
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </motion.div>
      )}
    </div>
  );
};
