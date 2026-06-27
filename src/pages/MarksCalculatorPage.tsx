import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Calculator, Target, AlertCircle, CheckCircle2, BookOpen, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalcResult {
  targetGrade: string;
  minTotal: number;
  requiredEndSem: number;
  achievable: boolean;
  message: string;
}

// PDEU Grading: Total = EndSem/2 + MidSem + IA  (all out of 100)
// O: >=80, A+: >=70, A: >=60, B+: >=55, B: >=50, C: >=45, P: >=40
const GRADE_TABLE = [
  { grade: 'O',  threshold: 80, label: 'Outstanding (10 pt)' },
  { grade: 'A+', threshold: 70, label: 'Excellent (9 pt)' },
  { grade: 'A',  threshold: 60, label: 'Very Good (8 pt)' },
  { grade: 'B+', threshold: 55, label: 'Good (7 pt)' },
  { grade: 'B',  threshold: 50, label: 'Above Average (6 pt)' },
  { grade: 'C',  threshold: 45, label: 'Average (5 pt)' },
  { grade: 'P',  threshold: 40, label: 'Pass (4 pt)' },
];

export const MarksCalculatorPage: React.FC = () => {
  const [midSemObtained, setMidSemObtained] = useState('');
  const [midSemMax, setMidSemMax] = useState('25');
  const [iaObtained, setIaObtained] = useState('');
  const [iaMax, setIaMax] = useState('25');
  const [endSemMax, setEndSemMax] = useState('100');
  const [targetGrade, setTargetGrade] = useState('A');
  const [results, setResults] = useState<CalcResult[] | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  const handleCalculate = () => {
    setCalcError(null);
    setResults(null);

    const mid = Number(midSemObtained);
    const midM = Number(midSemMax);
    const ia = Number(iaObtained);
    const iaM = Number(iaMax);
    const endM = Number(endSemMax);

    if (midSemObtained === '' || iaObtained === '') {
      setCalcError('Please enter your mid-sem and IA obtained marks.');
      return;
    }
    if (mid < 0 || mid > midM) {
      setCalcError(`Mid-sem marks must be between 0 and ${midM}.`);
      return;
    }
    if (ia < 0 || ia > iaM) {
      setCalcError(`IA marks must be between 0 and ${iaM}.`);
      return;
    }

    // PDEU Total = EndSem/2 + Mid + IA > threshold
    // To get a target total T > threshold: EndSem/2 > threshold - scoreSoFar
    // => EndSem > (threshold - scoreSoFar) * 2
    const scoreSoFar = mid + ia;

    const allResults: CalcResult[] = GRADE_TABLE.map((g) => {
      const requiredEndSemRaw = (g.threshold - scoreSoFar) * 2;
      let requiredEndSem = 0;
      if (requiredEndSemRaw >= 0) {
        // Since we need EndSem >= requiredEndSemRaw, to hit >=80 etc.
        // the smallest endsem mark (assuming 0.5 increments) is:
        requiredEndSem = Math.ceil(requiredEndSemRaw * 2) / 2;
      }
      
      // Also require >35 in end sem to pass, effectively meaning >= 35.5
      if (requiredEndSem <= 35) {
        requiredEndSem = 35.5;
      }

      const achievable = requiredEndSem <= endM;
      const alreadySecured = scoreSoFar >= g.threshold;

      let message = '';
      if (alreadySecured && requiredEndSem <= 35.5) {
        message = `Total secured! Just score > 35 in End-Sem to pass.`;
      } else if (!achievable) {
        message = `Not achievable — needs ${requiredEndSem} in end-sem, but max is ${endM}.`;
      } else {
        message = `Score at least ${requiredEndSem} out of ${endM} in End-Sem.`;
      }

      return {
        targetGrade: g.grade,
        minTotal: g.threshold, // Store threshold as minTotal (will prefix with '>' in UI)
        requiredEndSem,
        achievable,
        message,
      };
    });

    setResults(allResults);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'O':  return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25';
      case 'A+': return 'text-teal-500 bg-teal-500/10 border-teal-500/25';
      case 'A':  return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/25';
      case 'B+': return 'text-blue-500 bg-blue-500/10 border-blue-500/25';
      case 'B':  return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/25';
      case 'C':  return 'text-orange-500 bg-orange-500/10 border-orange-500/25';
      case 'P':  return 'text-amber-500 bg-amber-500/10 border-amber-500/25';
      default:   return 'text-destructive bg-destructive/10 border-destructive/25';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* Header */}
      <section className="border-b border-border pb-6">
        <h2 className="text-2xl font-black tracking-tight">Marks Calculator</h2>
        <p className="text-sm text-muted-foreground mt-1">
          PDEU Formula: <span className="font-semibold text-foreground/80">Total = End-Sem / 2 + Mid-Sem + IA</span>. 
          Calculate the minimum end-sem marks to achieve your target grade.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Input Panel */}
        <div className="space-y-6">
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center space-x-2">
                <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-500">
                  <BookOpen className="h-4 w-4" />
                </div>
                <span>Your Current Scores</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Mid-Sem Obtained"
                  type="number"
                  min="0"
                  step="0.5"
                  value={midSemObtained}
                  onChange={(e) => setMidSemObtained(e.target.value)}
                  placeholder="out of 25"
                />
                <Input
                  label="Mid-Sem Maximum"
                  type="number"
                  min="1"
                  value={midSemMax}
                  onChange={(e) => setMidSemMax(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="IA Obtained"
                  type="number"
                  min="0"
                  step="0.5"
                  value={iaObtained}
                  onChange={(e) => setIaObtained(e.target.value)}
                  placeholder="out of 25"
                />
                <Input
                  label="IA Maximum"
                  type="number"
                  min="1"
                  value={iaMax}
                  onChange={(e) => setIaMax(e.target.value)}
                />
              </div>

              <Input
                label="End-Sem Maximum"
                type="number"
                min="1"
                value={endSemMax}
                onChange={(e) => setEndSemMax(e.target.value)}
              />

              {/* Score preview */}
              {midSemObtained !== '' && iaObtained !== '' && (
                <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm">
                  <p className="font-semibold text-xs uppercase tracking-wide mb-1">Pre End-Sem Score</p>
                  <p className="text-2xl font-black">
                    {Number(midSemObtained) + Number(iaObtained)}
                    <span className="text-base text-indigo-500/70 font-normal"> / {Number(midSemMax) + Number(iaMax)}</span>
                  </p>
                  <p className="text-xs mt-0.5 opacity-80">
                    Mid ({midSemObtained}) + IA ({iaObtained}) = {Number(midSemObtained) + Number(iaObtained)} marks banked
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Target Grade Selector */}
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center space-x-2">
                <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500">
                  <Target className="h-4 w-4" />
                </div>
                <span>Target Grade</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {GRADE_TABLE.map((g) => (
                  <button
                    key={g.grade}
                    onClick={() => setTargetGrade(g.grade)}
                    className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                      targetGrade === g.grade
                        ? `${getGradeColor(g.grade)} border-current scale-105 shadow-md`
                        : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    <div className="text-lg">{g.grade}</div>
                    <div className="text-[9px] opacity-70 font-medium">&ge;{g.threshold}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {calcError && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{calcError}</span>
            </div>
          )}

          <Button
            onClick={handleCalculate}
            className="w-full shadow-lg shadow-indigo-500/15"
            leftIcon={<Zap className="h-4 w-4" />}
          >
            Calculate Required End-Sem Marks
          </Button>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {results === null ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border/60 rounded-2xl bg-card/25 min-h-[300px]"
              >
                <div className="p-4 bg-muted rounded-2xl mb-4">
                  <Calculator className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="text-base font-bold">Results appear here</h4>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  Enter your mid-sem and IA scores, then click "Calculate" to see the required end-sem marks for every PDEU grade.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Grade Requirements</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    End-Sem Max: {endSemMax}
                  </span>
                </div>

                {results.map((result, idx) => (
                  <motion.div
                    key={result.targetGrade}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className={`border ${result.targetGrade === targetGrade ? 'border-primary/50 ring-1 ring-primary/25 shadow-md' : 'border-border/60'} overflow-hidden transition-all`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-xl border-2 flex flex-col items-center justify-center font-black ${getGradeColor(result.targetGrade)}`}>
                              <span className="text-sm leading-none">{result.targetGrade}</span>
                              <span className="text-[9px] opacity-70 font-medium">&gt;{result.minTotal}</span>
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground">{GRADE_TABLE.find(g => g.grade === result.targetGrade)?.label}</p>
                              <p className="text-sm font-semibold text-foreground mt-0.5">{result.message}</p>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            {result.achievable && result.requiredEndSem > 0 ? (
                              <div>
                                <p className="text-xs text-muted-foreground">Need in End-Sem</p>
                                <p className="text-2xl font-black text-foreground">
                                  {result.requiredEndSem}
                                  <span className="text-xs font-normal text-muted-foreground">/{endSemMax}</span>
                                </p>
                              </div>
                            ) : result.requiredEndSem <= 0 ? (
                              <div className="flex items-center space-x-1 text-emerald-500">
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="text-xs font-bold">Secured</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1 text-destructive">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-xs font-bold">Not Possible</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                <p className="text-[10px] text-muted-foreground text-center pt-2">
                  PDEU Formula: Total = End-Sem/2 + Mid-Sem + IA. Grades: O &gt;80, A+ &gt;70, A &gt;60, B+ &gt;50, P &gt;40.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
