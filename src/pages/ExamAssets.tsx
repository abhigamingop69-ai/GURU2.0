import { useState, useMemo } from 'react';
import { mockExamQuestions, mockSubjects } from '../data/mockData';
import { useStore } from '../store/useStore';
import { Grade } from '../types';
import { ChevronDown, Search, Bookmark } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function ExamAssets() {
  const { user } = useStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<Grade>(user?.grade || 11);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedExamType, setSelectedExamType] = useState<string>('All');
  
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const subjectsToFilter = useMemo(() => {
    return mockSubjects.filter(s => 
      s.grade === selectedGrade && 
      (!s.stream || s.stream === user?.stream)
    );
  }, [selectedGrade, user?.stream]);

  const filteredQuestions = useMemo(() => {
    return mockExamQuestions.filter(q => {
      if (q.grade !== selectedGrade) return false;
      if (selectedSubject !== 'All' && q.subjectId !== selectedSubject) return false;
      if (selectedExamType !== 'All' && q.examType !== selectedExamType) return false;
      if (searchQuery && !q.questionText.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // Additional filter to ensuring the question's subject matches user's stream implicitly
      const subject = mockSubjects.find(s => s.id === q.subjectId);
      if (subject && subject.stream && subject.stream !== user?.stream) return false;

      return true;
    });
  }, [selectedGrade, selectedSubject, selectedExamType, searchQuery, user?.stream]);

  return (
    <div className="flex flex-col max-w-4xl mx-auto min-h-screen">
      <header className="sticky top-0 bg-background/90 backdrop-blur-md z-50 pt-4 pb-4 -mx-4 px-4 border-b border-border space-y-4">
        <h1 className="text-2xl font-heading font-bold">Exam Assets</h1>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 bg-card border border-border rounded-xl pl-10 pr-4 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {/* Grade Toggle */}
          <div className="flex bg-card rounded-lg border border-border p-1 shrink-0">
            {[11, 12].map(g => (
              <button
                key={g}
                onClick={() => { setSelectedGrade(g as Grade); setSelectedSubject('All'); }}
                className={cn(
                  "px-3 py-1 text-sm font-bold rounded-md transition-colors",
                  selectedGrade === g ? "bg-primary text-white" : "text-foreground/60"
                )}
              >
                Gr {g}
              </button>
            ))}
          </div>

          {/* Subject Dropdown */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-1 text-sm font-bold focus:outline-none focus:border-primary shrink-0"
          >
            <option value="All">All Subjects</option>
            {subjectsToFilter.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          {/* Exam Type Dropdown */}
          <select
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-1 text-sm font-bold focus:outline-none focus:border-primary shrink-0"
          >
            <option value="All">All Types</option>
            {['Terminal Exam', 'Final Exam', 'Pre-board', 'Model Questions'].map(t => (
               <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="flex flex-col p-4 gap-4 pb-24">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-20 text-foreground/50 font-medium tracking-tight">No questions found matching your criteria.</div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isExpanded = expandedId === q.id;
            return (
              <div key={q.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="w-full flex items-start text-left p-4 gap-3 hover:bg-card-foreground/5 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded uppercase">Q{idx + 1}</span>
                       <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase hidden sm:inline-block">{mockSubjects.find(s=>s.id===q.subjectId)?.name}</span>
                       <span className="text-[10px] font-bold text-foreground/50 uppercase ml-auto">{q.marks} Marks</span>
                    </div>
                    <h3 className="font-medium text-base leading-snug pr-4">{q.questionText}</h3>
                  </div>
                  <div className="pt-6 shrink-0 flex flex-col items-center gap-4">
                    <Bookmark className="w-5 h-5 text-foreground/30 hover:text-primary transition-colors" />
                    <ChevronDown className={cn("w-5 h-5 text-foreground/50 transition-transform duration-300", isExpanded && "rotate-180")} />
                  </div>
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border bg-background/50 overflow-hidden"
                    >
                      <div className="p-4 pt-4">
                        <div className="text-xs font-bold text-primary uppercase mb-2">Model Answer & Marking Scheme</div>
                        <p className="text-sm leading-relaxed text-foreground/90">{q.markingScheme}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
}
