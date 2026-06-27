import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth-store';
import { leaderboardService } from '../services/leaderboard-service';
import type { LeaderboardEntry } from '../services/leaderboard-service';
import { Card, CardContent } from '../components/common/Card';
import { Trophy, Medal, Search, Filter, AlertCircle, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [branchFilter, setBranchFilter] = useState<string>(user?.branch || '');
  const [semesterFilter, setSemesterFilter] = useState<string>(user?.semester || '');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await leaderboardService.getLeaderboard(branchFilter, semesterFilter);
        setLeaderboard(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch leaderboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [branchFilter, semesterFilter]);

  const branches = [
    { value: '', label: 'All Branches' },
    { value: 'CSE', label: 'CSE' },
    { value: 'CSBS', label: 'CSBS' },
    { value: 'IT', label: 'IT' },
    { value: 'ECE', label: 'ECE' },
    { value: 'EE', label: 'Electrical' },
    { value: 'ME', label: 'Mechanical' },
    { value: 'CE', label: 'Civil' },
    { value: 'ChE', label: 'Chemical' }
  ];

  const semesters = [
    { value: '', label: 'All Semesters' },
    ...Array.from({ length: 8 }).map((_, i) => ({
      value: String(i + 1),
      label: `Semester ${i + 1}`,
    }))
  ];

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="h-6 w-6 text-yellow-500 fill-yellow-500/20" />;
      case 1: return <Medal className="h-6 w-6 text-slate-400 fill-slate-400/20" />;
      case 2: return <Medal className="h-6 w-6 text-amber-600 fill-amber-600/20" />;
      default: return <span className="font-bold text-muted-foreground w-6 text-center">{index + 1}</span>;
    }
  };

  const getRankBg = (index: number) => {
    switch (index) {
      case 0: return 'bg-yellow-500/10 border-yellow-500/30';
      case 1: return 'bg-slate-400/10 border-slate-400/30';
      case 2: return 'bg-amber-600/10 border-amber-600/30';
      default: return 'bg-card border-border hover:border-primary/20';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center">
            <Award className="h-8 w-8 text-indigo-500 mr-3" />
            ScholarOS Leaderboard
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            See how you rank against your peers. Rankings are determined primarily by CGPA, followed by SGPA.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative w-full md:w-48">
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full h-10 pl-3 pr-8 rounded-lg border border-input bg-background text-sm focus:outline-none focus:border-primary appearance-none transition-colors"
            >
              {branches.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
            <Filter className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          <div className="relative w-full md:w-40">
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="w-full h-10 pl-3 pr-8 rounded-lg border border-input bg-background text-sm focus:outline-none focus:border-primary appearance-none transition-colors"
            >
              {semesters.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <Filter className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Leaderboard List */}
      <div className="space-y-4 relative min-h-[400px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border/80 rounded-2xl bg-card/25">
            <Search className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
            <h4 className="text-lg font-bold">No students found</h4>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              No students match the selected branch and semester filters, or no one has fed their marks yet.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {leaderboard.map((entry, index) => {
              const isCurrentUser = user?.id === entry.id;
              
              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Card className={`relative overflow-hidden transition-all duration-300 border-2 ${getRankBg(index)} ${isCurrentUser ? '!border-indigo-500 shadow-md shadow-indigo-500/10' : ''}`}>
                    {isCurrentUser && (
                      <div className="absolute top-0 right-0 px-3 py-0.5 bg-indigo-500 text-white text-[10px] font-bold rounded-bl-lg">
                        YOU
                      </div>
                    )}
                    <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                      {/* Rank Icon */}
                      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-background/50">
                        {getRankBadge(index)}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base text-foreground truncate flex items-center gap-2">
                          {entry.name}
                        </h4>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                          {entry.branch} • Sem {entry.semester}
                        </div>
                      </div>

                      {/* Scores */}
                      <div className="flex items-center gap-4 sm:gap-8 text-right flex-shrink-0">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">SGPA</span>
                          <span className="font-mono text-sm sm:text-base font-semibold">{entry.sgpa.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-0.5">CGPA</span>
                          <span className="font-mono text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400">
                            {entry.cgpa.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
