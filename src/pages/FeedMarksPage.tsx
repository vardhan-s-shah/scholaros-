import React, { useEffect, useState } from 'react';
import { useMarksStore } from '../store/marks-store';
import { Card, CardContent } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Plus, Edit2, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { csbsCurriculum } from '../data/csbs-curriculum';

// PDEU Grading: Total = EndSem/2 + MidSem + IA (out of 100)
const getPdeuGrade = (total: number, endSem?: number) => {
  if (endSem !== undefined && endSem <= 35) return { grade: 'F', color: 'text-destructive bg-destructive/10' };
  if (total >= 80) return { grade: 'O', color: 'text-emerald-500 bg-emerald-500/10' };
  if (total >= 70) return { grade: 'A+', color: 'text-teal-500 bg-teal-500/10' };
  if (total >= 60) return { grade: 'A', color: 'text-indigo-500 bg-indigo-500/10' };
  if (total >= 55) return { grade: 'B+', color: 'text-blue-500 bg-blue-500/10' };
  if (total >= 50) return { grade: 'B', color: 'text-cyan-500 bg-cyan-500/10' };
  if (total >= 45) return { grade: 'C', color: 'text-orange-500 bg-orange-500/10' };
  if (total >= 40) return { grade: 'P', color: 'text-amber-500 bg-amber-500/10' };
  return { grade: 'F', color: 'text-destructive bg-destructive/10' };
};

const getPdeuTotal = (mid: number, ia: number, endSem?: number) => {
  if (endSem === undefined) return null;
  return endSem / 2 + mid + ia;
};

export const FeedMarksPage: React.FC = () => {
  const { marks, isLoading, error, fetchMarks, addMark, updateMark, deleteMark } = useMarksStore();
  const [selectedSemester, setSelectedSemester] = useState<string>('1');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states — PDEU defaults: Mid=25, IA=25, EndSem=100
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [credits, setCredits] = useState('3');
  const [midSemMarks, setMidSemMarks] = useState('');
  const [internalMarks, setInternalMarks] = useState('');
  const [endSemMarks, setEndSemMarks] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchMarks();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setSubjectCode('');
    setSubjectName('');
    setCredits('3');
    setMidSemMarks('');
    setInternalMarks('');
    setEndSemMarks('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (mark: any) => {
    setEditingId(mark.id);
    setSubjectCode(mark.subjectCode);
    setSubjectName(mark.subjectName);
    setCredits(String(mark.credits));
    setMidSemMarks(String(mark.midSemMarks));
    setInternalMarks(String(mark.internalMarks));
    setEndSemMarks(mark.endSemMarks !== undefined ? String(mark.endSemMarks) : '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this mark entry?')) {
      try {
        await deleteMark(id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete mark.');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!subjectCode || !subjectName || !credits || midSemMarks === '' || internalMarks === '') {
      setFormError('Please fill in all required fields.');
      return;
    }

    const midScore = Number(midSemMarks);
    const midMaxScore = 25;
    const internScore = Number(internalMarks);
    const internMaxScore = 25;
    const endScore = endSemMarks !== '' ? Number(endSemMarks) : undefined;
    const endMaxScore = 100;

    if (midScore < 0 || midScore > midMaxScore) {
      setFormError(`Mid-sem marks must be between 0 and ${midMaxScore}.`);
      return;
    }
    if (internScore < 0 || internScore > internMaxScore) {
      setFormError(`IA marks must be between 0 and ${internMaxScore}.`);
      return;
    }
    if (endScore !== undefined && (endScore < 0 || endScore > endMaxScore)) {
      setFormError(`End-sem marks must be between 0 and ${endMaxScore}.`);
      return;
    }

    const payload = {
      subjectCode,
      subjectName,
      semester: selectedSemester,
      credits: Number(credits),
      midSemMarks: midScore,
      midSemMax: midMaxScore,
      internalMarks: internScore,
      internalMax: internMaxScore,
      endSemMarks: endScore,
      endSemMax: endMaxScore
    };

    try {
      if (editingId) {
        await updateMark(editingId, payload);
      } else {
        await addMark(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save mark entry.');
    }
  };

  const filteredMarks = marks.filter((m) => m.semester === selectedSemester);

  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Panel */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Feed Your Marks</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Input and manage your subject marks across semesters. <span className="font-medium text-foreground/70">PDEU Formula: Total = End-Sem/2 + Mid + IA</span>
          </p>
        </div>
        <Button
          onClick={openAddModal}
          leftIcon={<Plus className="h-4 w-4" />}
          className="shadow-lg shadow-indigo-500/15"
        >
          Add Mark Entry
        </Button>
      </section>

      {/* Semester Switcher Tabs */}
      <section className="flex flex-wrap gap-2 border-b border-border/40 pb-2">
        {semesters.map((sem) => (
          <button
            key={sem}
            onClick={() => setSelectedSemester(sem)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              selectedSemester === sem
                ? 'bg-primary text-primary-foreground shadow-sm scale-102'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            Semester {sem}
          </button>
        ))}
      </section>

      {/* Marks List */}
      <section className="space-y-4">
        {isLoading && marks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="h-8 w-8 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
            <p className="text-xs text-muted-foreground">Loading marks...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : filteredMarks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border/80 rounded-2xl bg-card/25"
          >
            <div className="p-4 bg-muted rounded-2xl mb-4 text-muted-foreground">
              <BookOpen className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold">No marks added for Semester {selectedSemester}</h4>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mt-1 mb-6">
              You haven't added any marks yet. Start feeding your mid-sem, IA, or end-sem marks.
            </p>
            <Button variant="outline" onClick={openAddModal} leftIcon={<Plus className="h-4 w-4" />}>
              Add Subject Marks
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredMarks.map((mark) => {
                const pdeuTotal = getPdeuTotal(mark.midSemMarks, mark.internalMarks, mark.endSemMarks);
                const gradeInfo = pdeuTotal !== null ? getPdeuGrade(pdeuTotal, mark.endSemMarks) : null;

                return (
                  <motion.div
                    key={mark.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="hover:shadow-md hover:border-primary/20 transition-all overflow-hidden relative group">
                      {/* Left color tag based on grade */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        gradeInfo
                          ? gradeInfo.color.split(' ')[0].replace('text-', 'bg-')
                          : 'bg-muted-foreground/30'
                      }`} />
                      
                      <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pl-7">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-semibold bg-muted px-2 py-0.5 rounded text-muted-foreground">
                              {mark.subjectCode}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              • {mark.credits} Credits
                            </span>
                          </div>
                          <h4 className="font-bold text-base tracking-tight text-foreground">{mark.subjectName}</h4>
                          
                          {/* Marks Breakdowns */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1.5">
                            <div>
                              Mid-Sem: <strong className="text-foreground">{mark.midSemMarks}</strong>/{mark.midSemMax}
                            </div>
                            <div>
                              IA: <strong className="text-foreground">{mark.internalMarks}</strong>/{mark.internalMax}
                            </div>
                            <div>
                              End-Sem: <strong className="text-foreground">{mark.endSemMarks !== undefined ? mark.endSemMarks : '—'}</strong>/{mark.endSemMax}
                            </div>
                          </div>
                        </div>

                        {/* Calculated PDEU total & grade */}
                        <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-border/40 pt-3 md:pt-0">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">PDEU Total</p>
                            <p className="text-lg font-black text-foreground">
                              {pdeuTotal !== null ? pdeuTotal.toFixed(1) : '—'}
                              <span className="text-xs text-muted-foreground font-normal"> / 100</span>
                            </p>
                            {gradeInfo && (
                              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full mt-0.5 inline-block ${gradeInfo.color}`}>
                                Grade: {gradeInfo.grade}
                              </span>
                            )}
                            {!gradeInfo && (
                              <span className="text-[11px] text-muted-foreground italic">End-sem pending</span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => openEditModal(mark)}
                              className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                              title="Edit Marks"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(mark.id)}
                              className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                              title="Delete Entry"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Add / Edit Marks Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Subject Marks' : 'Add Subject Marks'}
        description={`Semester ${selectedSemester} • PDEU Marking: Mid 25 + IA 25 + EndSem 100`}
        footer={
          <div className="flex space-x-2 w-full">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="w-1/2">
              Cancel
            </Button>
            <Button onClick={handleFormSubmit} className="w-1/2">
              {editingId ? 'Update Entry' : 'Add Entry'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
              {formError}
            </div>
          )}

          {/* Subject Selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center">
              <BookOpen className="h-3.5 w-3.5 mr-1" /> Select Subject
            </label>
            <select
              value={subjectCode && subjectName ? `${subjectCode}|${subjectName}|${credits}` : ''}
              onChange={(e) => {
                const [code, name, creds] = e.target.value.split('|');
                setSubjectCode(code || '');
                setSubjectName(name || '');
                setCredits(creds || '3');
              }}
              className="w-full h-11 px-3.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
              required
            >
              <option value="" disabled>-- Select Subject for Semester {selectedSemester} --</option>
              {(csbsCurriculum[selectedSemester] || []).map((c, i) => {
                const isFilled = filteredMarks.some((m) => m.subjectName === c.name);
                return (
                  <option key={i} value={`${c.code}|${c.name}|${c.credits}`}>
                    {isFilled ? '✅ ' : ''}{c.name} ({c.code}) - {c.credits} Credits
                  </option>
                );
              })}
            </select>
          </div>

          {/* Mid Sem entry */}
          <div className="space-y-1">
            <Input
              label="Mid-Sem Obtained (out of 25)"
              type="number"
              min="0"
              max="25"
              step="0.5"
              value={midSemMarks}
              onChange={(e) => setMidSemMarks(e.target.value)}
              placeholder="e.g. 20"
              required
            />
          </div>

          {/* IA entry */}
          <div className="space-y-1">
            <Input
              label="IA Obtained (out of 25)"
              type="number"
              min="0"
              max="25"
              step="0.5"
              value={internalMarks}
              onChange={(e) => setInternalMarks(e.target.value)}
              placeholder="e.g. 22"
              required
            />
          </div>

          {/* End Sem entry */}
          <div className="space-y-1">
            <Input
              label="End-Sem Obtained (out of 100, Optional)"
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={endSemMarks}
              onChange={(e) => setEndSemMarks(e.target.value)}
              placeholder="e.g. 85"
            />
          </div>

          {/* Live preview */}
          {midSemMarks !== '' && internalMarks !== '' && endSemMarks !== '' && (
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm">
              <p className="text-xs font-semibold text-muted-foreground mb-1">PDEU Total Preview</p>
              <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                {(Number(endSemMarks) / 2 + Number(midSemMarks) + Number(internalMarks)).toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground"> / 100</span>
                <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${getPdeuGrade(Number(endSemMarks) / 2 + Number(midSemMarks) + Number(internalMarks), endSemMarks !== '' ? Number(endSemMarks) : undefined).color}`}>
                  {getPdeuGrade(Number(endSemMarks) / 2 + Number(midSemMarks) + Number(internalMarks), endSemMarks !== '' ? Number(endSemMarks) : undefined).grade}
                </span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">EndSem/2 + Mid + IA = {Number(endSemMarks)}/2 + {Number(midSemMarks)} + {Number(internalMarks)}</p>
            </div>
          )}
        </form>
      </Modal>

    </div>
  );
};
