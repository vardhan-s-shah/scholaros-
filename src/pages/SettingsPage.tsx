import React, { useState } from 'react';
import { useAuthStore } from '../store/auth-store';
import { authService } from '../services/auth-service';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  User as UserIcon,
  Mail,
  Compass,
  BookOpen,
  Users,
  Calendar,
  Edit2,
  Save,
  CheckCircle,
  Shield,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BRANCH_MAP: Record<string, string> = {
  CSE: 'Computer Science & Engineering (CSE)',
  CSBS: 'Computer Science and Business Systems (CSBS)',
  IT: 'Information Technology (IT)',
  ECE: 'Electronics & Communication (ECE)',
  EE: 'Electrical Engineering (EE)',
  ME: 'Mechanical Engineering (ME)',
  CE: 'Civil Engineering (CE)',
  ChE: 'Chemical Engineering (ChE)',
};

const BRANCHES = [
  { value: 'CSE', label: 'Computer Science & Engineering (CSE)' },
  { value: 'CSBS', label: 'Computer Science and Business Systems (CSBS)' },
  { value: 'IT', label: 'Information Technology (IT)' },
  { value: 'ECE', label: 'Electronics & Communication (ECE)' },
  { value: 'EE', label: 'Electrical Engineering (EE)' },
  { value: 'ME', label: 'Mechanical Engineering (ME)' },
  { value: 'CE', label: 'Civil Engineering (CE)' },
  { value: 'ChE', label: 'Chemical Engineering (ChE)' },
];

const DIVISIONS = ['A', 'B', 'C', 'D', 'E'];
const GROUPS = ['G1', 'G2', 'G3', 'G4', 'G5'];
const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export const SettingsPage: React.FC = () => {
  const { user, accessToken, setAuth } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit states
  const [name, setName] = useState(user?.name || '');
  const [branch, setBranch] = useState(user?.branch || 'CSE');
  const [semester, setSemester] = useState(user?.semester || '1');
  const [division, setDivision] = useState(user?.division || 'A');
  const [group, setGroup] = useState(user?.group || 'G1');
  const [batch, setBatch] = useState(user?.batch || '2022');

  const openEditModal = () => {
    setName(user?.name || '');
    setBranch(user?.branch || 'CSE');
    setSemester(user?.semester || '1');
    setDivision(user?.division || 'A');
    setGroup(user?.group || 'G1');
    setBatch(user?.batch || '2022');
    setError(null);
    setSuccessMsg(null);
    setIsEditModalOpen(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !branch || !division || !group || !batch || !semester) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await authService.updateProfile({
        name,
        branch,
        division,
        group,
        batch,
        semester,
      });

      if (accessToken) {
        setAuth(response.user, accessToken);
      }

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <section className="border-b border-border pb-6">
        <h2 className="text-2xl font-black tracking-tight">Account Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal details, academic branch, cohort division, and semester configurations.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Summary Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/60 overflow-hidden relative">
            {/* Top decorative banner */}
            <div className="h-24 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
            <div className="px-6 pb-6 relative">
              {/* Profile Avatar */}
              <div className="absolute -top-12 left-6 h-20 w-20 rounded-2xl bg-indigo-600 border-4 border-card flex items-center justify-center text-white text-3xl font-black shadow-lg">
                {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-10 w-10" />}
              </div>
              <div className="pt-10 space-y-1">
                <h3 className="text-lg font-bold tracking-tight text-foreground">{user?.name}</h3>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <div className="flex items-center space-x-1.5 pt-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/15">
                    {user?.role || 'Student'}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/15 flex items-center">
                    <Shield className="h-2.5 w-2.5 mr-1" /> Verified
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: Detailed Details List */}
        <div className="lg:col-span-2">
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center space-x-2">
                <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-500">
                  <UserIcon className="h-4 w-4" />
                </div>
                <span>Academic Profile Details</span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={openEditModal}
                leftIcon={<Edit2 className="h-3.5 w-3.5" />}
              >
                Edit Profile
              </Button>
            </CardHeader>
            <CardContent className="divide-y divide-border/30 pt-1">
              {[
                { label: 'Full Name', value: user?.name, icon: <UserIcon className="h-4 w-4 text-indigo-500" /> },
                { label: 'College Email', value: user?.email, icon: <Mail className="h-4 w-4 text-indigo-500" /> },
                { label: 'Branch / Dept', value: BRANCH_MAP[user?.branch || ''] || user?.branch || '—', icon: <Compass className="h-4 w-4 text-indigo-500" /> },
                { label: 'Current Semester', value: user?.semester ? `Semester ${user.semester}` : '—', icon: <BookOpen className="h-4 w-4 text-indigo-500" /> },
                { label: 'Division & Group', value: user?.division && user?.group ? `Division ${user.division} (Group ${user.group})` : '—', icon: <Users className="h-4 w-4 text-indigo-500" /> },
                { label: 'Batch Year', value: user?.batch ? `Batch ${user.batch}` : '—', icon: <Calendar className="h-4 w-4 text-indigo-500" /> },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-4 text-sm">
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <div className="p-1.5 bg-muted rounded-lg">{item.icon}</div>
                    <span>{item.label}</span>
                  </div>
                  <span className="font-semibold text-foreground text-right">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !loading && setIsEditModalOpen(false)}
        title="Update Profile Details"
        description="Modify your academic parameters. Changes will reflect instantly on your dashboard metrics."
        footer={
          <div className="flex space-x-2 w-full">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="w-1/2"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProfile}
              className="w-1/2"
              isLoading={loading}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save Changes
            </Button>
          </div>
        }
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold"
              >
                {error}
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />

          {/* Branch Dropdown */}
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
                disabled={loading}
              >
                {BRANCHES.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-muted-foreground" />
            </div>
          </div>

          {/* Division & Group select row */}
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
                  disabled={loading}
                >
                  {DIVISIONS.map((d) => (
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
                  disabled={loading}
                >
                  {GROUPS.map((g) => (
                    <option key={g} value={g}>Group {g}</option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Batch & Semester select row */}
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
                disabled={loading}
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
                  disabled={loading}
                >
                  {SEMESTERS.map((sem) => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-muted-foreground" />
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
