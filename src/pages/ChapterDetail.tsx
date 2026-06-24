import { useParams, useNavigate } from 'react-router-dom';
import { mockChapters, mockFlashcards } from '../data/mockData';
import { ArrowLeft, BookOpen, Brain, Check, RefreshCw, X, Award, Zap, Loader2, FileText, Download } from 'lucide-react';
import { useMemo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { audio } from '../lib/audio';

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
};

function SmartQuiz({ chapterTitle }: { chapterTitle: string }) {
  const [weakAreas, setWeakAreas] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizData, setQuizData] = useState<QuizQuestion[] | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuiz = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const resp = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chapterTitle,
          weakAreas
        })
      });
      if (!resp.ok) {
        throw new Error("Failed to generate quiz. Is the GEMINI_API_KEY set?");
      }
      const data = await resp.json();
      setQuizData(data);
      setCurrentQIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setScore(0);
      setIsFinished(false);
      setWeakAreas('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate quiz.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (quizData && index === quizData[currentQIndex].correctAnswerIndex) {
      setScore(s => s + 1);
      audio.playSuccess();
    } else {
      audio.playError();
    }
  };

  const nextQuestion = () => {
    if (quizData && currentQIndex < quizData.length - 1) {
      audio.playPop();
      setCurrentQIndex(currentQIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished && quizData) {
    return (
      <div className="card-duo bg-primary/5 border-primary/20 p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4">
          <Zap className="w-8 h-8" />
        </div>
        <h3 className="font-heading font-black text-2xl text-foreground mb-2">Quiz Complete!</h3>
        <p className="text-foreground/70 mb-6 font-bold text-lg">You scored {score} out of {quizData.length}</p>
        <button onClick={() => setQuizData(null)} className="btn-primary px-6">
          Generate New Quiz
        </button>
      </div>
    );
  }

  if (quizData && quizData.length > 0) {
    const q = quizData[currentQIndex];
    return (
      <div className="card-duo border-border p-6 flex flex-col gap-6">
        <div className="flex justify-between items-center tracking-widest text-[10px] font-bold uppercase text-foreground/50">
          <span>Question {currentQIndex + 1} of {quizData.length}</span>
          <span>Score: {score}</span>
        </div>
        
        <h3 className="text-xl font-heading font-bold text-foreground">{q.question}</h3>
        
        <div className="flex flex-col gap-3">
          {q.options.map((opt, i) => {
            let btnClass = "card-duo p-4 text-left font-medium transition-colors border-2 hover:bg-card-foreground/5";
            if (isAnswered) {
              if (i === q.correctAnswerIndex) {
                btnClass = "card-duo p-4 text-left font-bold transition-colors border-2 bg-emerald-500/20 border-emerald-500/50 text-emerald-700 dark:text-emerald-400";
              } else if (i === selectedOption) {
                btnClass = "card-duo p-4 text-left font-bold transition-colors border-2 bg-red-500/20 border-red-500/50 text-red-700 dark:text-red-400";
              } else {
                btnClass = "card-duo p-4 text-left font-medium transition-colors border-2 opacity-50";
              }
            } else if (i === selectedOption) {
              btnClass = "card-duo p-4 text-left font-bold transition-colors border-2 bg-primary/20 border-primary/50 text-primary";
            }
            return (
              <button key={i} onClick={() => handleSelectOption(i)} disabled={isAnswered} className={btnClass}>
                {opt}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 rounded-xl bg-card border-l-4 border-l-primary">
            <p className="font-bold text-sm text-foreground mb-1 uppercase tracking-wider">Explanation</p>
            <p className="text-sm text-foreground/80">{q.explanation}</p>
          </motion.div>
        )}

        {isAnswered && (
          <div className="flex justify-end mt-4">
            <button onClick={nextQuestion} className="btn-primary px-8">
              {currentQIndex === quizData.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card-duo border-primary/20 p-6 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
          <Zap className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-bold text-lg text-foreground">AI Smart Quiz</h3>
          <p className="text-sm text-foreground/70 mb-4 tracking-wide font-medium">Generate a custom 3-question quiz powered by Gemini.</p>
          <input
            type="text"
            placeholder="E.g., Formula application, definition, etc."
            value={weakAreas}
            onChange={(e) => setWeakAreas(e.target.value)}
            disabled={isGenerating}
            className="w-full bg-card border-2 border-border rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-primary text-sm mb-4"
          />
          {error && <p className="text-xs text-red-500 font-bold mb-4">{error}</p>}
          <button 
            onClick={generateQuiz} 
            disabled={isGenerating || !weakAreas.trim()}
            className="btn-primary w-full md:w-auto px-6 py-3 flex items-center justify-center gap-2"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            {isGenerating ? 'Generating...' : 'Generate Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SpacedFlashcards({ chapterId, chapterTitle }: { chapterId: string, chapterTitle: string }) {
  const { user, updateUser } = useStore();
  
  const today = new Date().toISOString().split('T')[0];
  let practicedToday = user?.flashcardsPracticedToday || 0;
  if (user?.lastFlashcardDate !== today) {
    practicedToday = 0;
  }
  const MAX_PER_DAY = 20;

  const [queue, setQueue] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  // Daily reset timer calculation
  useEffect(() => {
    if (practicedToday >= MAX_PER_DAY) {
      const interval = setInterval(() => {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const diff = Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
        const h = String(Math.floor(diff / 3600)).padStart(2, '0');
        const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
        const s = String(diff % 60).padStart(2, '0');
        setTimeLeft(`${h}:${m}:${s}`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [practicedToday, MAX_PER_DAY]);

  const generateNewCards = async () => {
    if (practicedToday >= MAX_PER_DAY) return;
    setIsGenerating(true);
    try {
      const count = Math.min(5, MAX_PER_DAY - practicedToday);
      const res = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterTitle, count })
      });
      if (!res.ok) throw new Error("Failed to generate flashcards");
      const data = await res.json();
      setQueue(data);
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsFinished(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRating = (rating: 'hard' | 'good' | 'easy') => {
    const currentCard = queue[currentIndex];
    
    audio.playPop();

    const newCount = practicedToday + 1;
    updateUser({
      flashcardsPracticedToday: newCount,
      lastFlashcardDate: today
    });

    setIsFlipped(false);
    
    setTimeout(() => {
      if (newCount >= MAX_PER_DAY) {
        setIsFinished(true);
        return;
      }
      
      if (rating === 'hard') {
        setQueue(prev => [...prev, currentCard]);
      }
      
      if (currentIndex < queue.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 150);
  };

  if (practicedToday >= MAX_PER_DAY && queue.length === 0) {
    return (
      <div className="card-duo bg-card border-border p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
          <Brain className="w-8 h-8" />
        </div>
        <h3 className="font-heading font-black text-xl text-foreground mb-2">Daily Limit Reached</h3>
        <p className="text-foreground/70 mb-4 font-medium text-sm">You've practiced 20 flashcards today. Spaced repetition works best when paced. Come back tomorrow!</p>
        <div className="bg-primary/5 text-primary border border-primary/20 px-6 py-3 rounded-full font-mono font-bold text-xl tracking-wider">
          {timeLeft || "Loading..."}
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="card-duo bg-card border-border p-8 text-center flex flex-col items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <h3 className="font-bold text-foreground mb-1">Generating Custom Flashcards...</h3>
        <p className="text-sm text-foreground/60">Using AI to create unique practice cards for {chapterTitle}</p>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="card-duo bg-card border-border p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
          <Brain className="w-8 h-8" />
        </div>
        <h3 className="font-heading font-black text-xl text-foreground mb-2">Ready to Practice?</h3>
        <p className="text-foreground/70 mb-6 font-medium text-sm">Practiced today: {practicedToday} / {MAX_PER_DAY}</p>
        <button onClick={generateNewCards} className="btn-primary gap-2 px-8">
          <Zap className="w-5 h-5" /> Generate {Math.min(5, MAX_PER_DAY - practicedToday)} New Cards
        </button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="card-duo bg-primary/5 border-primary/20 p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8" />
        </div>
        <h3 className="font-heading font-black text-2xl text-foreground mb-2">Batch Complete!</h3>
        <p className="text-foreground/70 mb-6 font-medium">You've reviewed these flashcards.</p>
        {practicedToday < MAX_PER_DAY ? (
           <button onClick={() => { setQueue([]); generateNewCards(); }} className="btn-primary gap-2 px-6">
             <Zap className="w-5 h-5" /> Generate Next Batch
           </button>
        ) : (
           <div className="mt-2 text-center text-sm font-bold border border-primary/20 text-primary bg-primary/5 rounded-xl px-4 py-3">
             <span className="block mb-2 text-foreground/70 font-medium">Daily limit reached. Great work! Resets in:</span>
             <span className="font-mono text-lg">{timeLeft || "Calculating..."}</span>
           </div>
        )}
      </div>
    );
  }

  const card = queue[currentIndex];
  
  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-4 px-2 tracking-widest text-[10px] font-bold uppercase text-foreground/50">
        <span>Card {currentIndex + 1} of {queue.length}</span>
        <span>Daily Limit: {practicedToday}/{MAX_PER_DAY}</span>
      </div>

      <div className="w-full aspect-[4/3] max-w-sm mb-6 cursor-pointer group" style={{ perspective: 1000 }} onClick={() => setIsFlipped(!isFlipped)}>
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
          className="w-full h-full relative"
        >
          {/* Front */}
          <div 
            style={{ backfaceVisibility: "hidden" }}
            className="absolute inset-0 bg-card border border-border shadow-md rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors"
          >
            <span className="absolute top-4 left-4 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">Front</span>
            <h3 className="text-xl md:text-2xl font-bold font-heading text-foreground">{card?.front}</h3>
            <p className="absolute bottom-4 text-xs text-foreground/40 font-bold uppercase tracking-widest">Tap to flip</p>
          </div>

          {/* Back */}
          <div 
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            className="absolute inset-0 bg-primary/5 border border-primary/20 shadow-md rounded-2xl p-6 flex flex-col items-center justify-center text-center overflow-auto"
          >
            <span className="absolute top-4 left-4 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">Back</span>
            <p className="text-lg md:text-xl font-medium text-foreground">{card?.back}</p>
          </div>
        </motion.div>
      </div>

      <div className={cn("flex items-center gap-3 w-full max-w-sm transition-opacity duration-300", isFlipped ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
        <button onClick={(e) => { e.stopPropagation(); handleRating('hard'); }} className="flex-1 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold flex flex-col items-center gap-1 active:scale-95 transition-all">
          <X className="w-5 h-5" />
          <span className="text-[10px] uppercase tracking-widest">Hard</span>
        </button>
        <button onClick={(e) => { e.stopPropagation(); handleRating('good'); }} className="flex-1 py-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl font-bold flex flex-col items-center gap-1 active:scale-95 transition-all">
          <RefreshCw className="w-5 h-5" />
          <span className="text-[10px] uppercase tracking-widest">Good</span>
        </button>
        <button onClick={(e) => { e.stopPropagation(); handleRating('easy'); }} className="flex-1 py-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl font-bold flex flex-col items-center gap-1 active:scale-95 transition-all">
          <Check className="w-5 h-5" />
          <span className="text-[10px] uppercase tracking-widest">Easy</span>
        </button>
      </div>
    </div>
  );
}

function PersonalNotes({ chapterId, chapterTitle }: { chapterId: string, chapterTitle: string }) {
  const [notes, setNotes] = useState(() => {
    return localStorage.getItem(`notes-${chapterId}`) || '';
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(`notes-${chapterId}`, notes);
      setIsSaved(true);
      const hideTimeout = setTimeout(() => setIsSaved(false), 2000);
      return () => clearTimeout(hideTimeout);
    }, 500);
    return () => clearTimeout(timeout);
  }, [notes, chapterId]);

  const handleDownload = () => {
    const backupData = {
      chapter: chapterTitle,
      chapterId: chapterId,
      date: new Date().toISOString(),
      notes: notes
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Notes_${chapterTitle.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card-duo border-border flex flex-col gap-4">
      <div className="flex justify-between items-center p-6 pb-2">
        <h2 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" /> Personal Notes
        </h2>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {isSaved && (
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs font-bold text-primary mr-2"
              >
                Saved.
              </motion.span>
            )}
          </AnimatePresence>
          {notes.trim().length > 0 && (
            <button onClick={handleDownload} className="text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-widest flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-md hover:bg-primary/20 transition-colors">
              <Download className="w-4 h-4" /> Backup JSON
            </button>
          )}
        </div>
      </div>
      <div className="px-6 pb-6">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Type your custom notes here... They will auto-save to this device."
          className="w-full min-h-[150px] bg-background border-2 border-border/50 rounded-xl p-4 text-sm font-medium focus:outline-none focus:border-primary/50 resize-y text-foreground"
        />
      </div>
    </div>
  );
}

export default function ChapterDetail() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const summaryRef = useRef<HTMLDivElement>(null);
  
  const { user, updateUser } = useStore();
  const [isCompleted, setIsCompleted] = useState(false);

  const chapter = useMemo(() => mockChapters.find(c => c.id === chapterId), [chapterId]);

  if (!chapter) {
    return <div className="p-6">Chapter not found.</div>;
  }

  const scrollToSummary = () => {
    summaryRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMarkComplete = () => {
    if (isCompleted) return;
    setIsCompleted(true);
    
    // Check if user already has the Chapter Completed badge
    let newBadges = user?.badges ? [...user.badges] : [];
    if (!newBadges.find(b => b.id === `chap-${chapterId}`)) {
      newBadges.push({
        id: `chap-${chapterId}`,
        title: 'Scholar',
        description: `Completed ${chapter.title}`,
        icon: 'Trophy',
        dateEarned: new Date().toISOString().split('T')[0]
      });
      
      updateUser({ badges: newBadges });
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification("Achievement Unlocked! 🏆", { body: `You earned a badge for completing ${chapter.title}!` });
      }
    }
  };

  return (
    <div className="flex flex-col max-w-4xl mx-auto min-h-screen bg-background relative pb-24 md:pb-6">
      <header className="sticky top-0 bg-background/90 backdrop-blur-md z-50 p-4 border-b-2 border-border flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2.5 -ml-2.5 rounded-2xl hover:bg-card active:scale-95 transition-all text-foreground/70 hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
        </button>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 inline-block px-2 py-0.5 rounded-md border border-primary/20 w-fit">Chapter {chapter.orderIndex}</span>
          <h1 className="text-lg font-heading font-bold truncate tracking-tight">{chapter.title}</h1>
        </div>
      </header>

      <div className="p-6 md:p-8 space-y-8">
        {/* Notes Content */}
        <div className="prose prose-sm md:prose-base dark:prose-invert prose-headings:font-heading prose-headings:font-bold prose-a:text-primary prose-p:leading-relaxed max-w-none text-foreground/90 font-medium" dangerouslySetInnerHTML={{ __html: chapter.notesContent }} />

        {/* Summary Content */}
        <div ref={summaryRef} className="card-duo mt-12 bg-primary/10 border-primary/20 p-6 md:p-8 border-b-primary/30">
          <h2 className="text-xl font-heading font-bold text-primary mb-4 flex items-center gap-2 uppercase tracking-wide">
            <BookOpen className="w-6 h-6 stroke-[2.5]" /> Quick Summary
          </h2>
          <p className="font-bold leading-relaxed text-foreground/80">{chapter.summaryContent}</p>
        </div>

        {/* Personal Notes */}
        <div className="pt-8 mb-8 border-t-2 border-border">
          <PersonalNotes chapterId={chapter.id} chapterTitle={chapter.title} />
        </div>

        {/* Flashcards */}
        <div className="pt-8 mb-8">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-6 flex items-center gap-2">
            <Brain className="w-7 h-7 text-primary" /> Practice Flashcards
          </h2>
          <SpacedFlashcards chapterId={chapter.id} chapterTitle={chapter.title} />
        </div>

        {/* Smart Quiz */}
        <div className="pt-8 mb-8 border-t-2 border-border">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-6 flex items-center gap-2">
            <Zap className="w-7 h-7 text-primary" /> Smart Quiz
          </h2>
          <SmartQuiz chapterTitle={chapter.title} />
        </div>

        {/* Completion Action */}
        <div className="pt-8 border-t-2 border-border flex flex-col items-center justify-center">
          <button 
            onClick={handleMarkComplete}
            disabled={isCompleted}
            className={cn(
              "btn-primary h-14 px-8 w-full md:w-auto flex items-center justify-center gap-3 transition-all",
              isCompleted ? "bg-emerald-500 border-emerald-600 text-white cursor-default hover:bg-emerald-500 hover:border-emerald-600 hover:translate-y-0 active:translate-y-0 shadow-emerald-500/20" : ""
            )}
          >
            {isCompleted ? (
              <>
                <Check className="w-6 h-6 stroke-[3]" />
                <span>Chapter Completed</span>
              </>
            ) : (
              <>
                <Award className="w-6 h-6" />
                <span>Mark as Complete</span>
              </>
            )}
          </button>
          {!isCompleted && (
            <p className="text-xs font-bold text-foreground/50 mt-4 uppercase tracking-wider">
              Earn a badge for completing this chapter
            </p>
          )}
        </div>
      </div>

      {/* Floating Action for Mobile to jump to summary */}
      <button 
        onClick={scrollToSummary}
        className="fixed md:hidden bottom-20 right-4 btn-primary p-4 rounded-full shadow-lg z-20 w-14 h-14"
      >
        <BookOpen className="w-6 h-6" />
      </button>
    </div>
  );
}
