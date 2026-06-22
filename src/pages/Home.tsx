import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Settings as SettingsIcon, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { mockFlashcards, mockTriviaList } from '../data/mockData';
import { User } from '../types';

export default function Home() {
  const user = useStore(state => state.user);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 p-4 pt-6 max-w-2xl mx-auto">
      <StudentBanner user={user} />
      <FlashcardWidget />
      <TriviaWidget />
      <ChessShortcut />
    </div>
  );
}

// Subcomponents

function StudentBanner({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const updateUser = useStore(state => state.updateUser);
  const todayDate = new Date().toISOString().split('T')[0];
  
  const isComplete = user?.lastActiveDate === todayDate;
  const streakCount = user?.streakCount || 0;
  const message = streakCount >= 7 ? "You're on fire! Don't break the chain." : streakCount > 0 ? "Keep it going!" : "Start your streak today!";

  const handleCheckIn = () => {
    if (isComplete) return;
    
    // Check if it was true yesterday, if so increment, otherwise start at 1
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split('T')[0];
    
    let newStreak = streakCount;
    if (user?.lastActiveDate === yesterdayDate) {
      newStreak++;
    } else {
      newStreak = 1;
    }

    let newBadges = user?.badges ? [...user.badges] : [];
    if (newStreak >= 7 && !newBadges.find((b: { id: string }) => b.id === '7-day')) {
      newBadges.push({
        id: '7-day',
        title: '7-Day Streak',
        description: 'Studied for 7 consecutive days',
        icon: 'Flame',
        dateEarned: todayDate
      });
      // Trigger a small native notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification("Achievement Unlocked! 🏆", { body: "You earned the 7-Day Streak badge!" });
      }
    }

    updateUser({
      streakCount: newStreak,
      lastActiveDate: todayDate,
      badges: newBadges
    });
  };

  // Generate last 7 days including today
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
      date: d.toISOString().split('T')[0]
    };
  });

  return (
    <div className="card-duo overflow-hidden relative">
      <div className="p-5 relative z-10 flex flex-col gap-4">
        {/* Header Section Inside Banner */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex gap-4 items-center">
             <div className="w-14 h-14 shrink-0 p-1 flex justify-center items-center">
               <img src="https://i.ibb.co/VYyZWwpp/Untitled-project-Photoroom.png" alt="Guruba Logo" className="w-full h-full object-contain" />
             </div>
             <div>
               <h1 className="text-xl font-heading font-bold text-foreground leading-tight">
                 Good morning, {user?.name?.split(' ')[0] || "Student"} 👋
               </h1>
               <p className="text-sm font-bold text-foreground/70 mt-0.5">Let's learn something new!</p>
             </div>
          </div>
          <button onClick={() => navigate('/settings')} className="w-10 h-10 shrink-0 rounded-full bg-background hover:bg-foreground/5 flex items-center justify-center transition-colors shadow-sm border-2 border-border mt-2">
            <SettingsIcon className="w-5 h-5 text-foreground/70" />
          </button>
        </div>

        <div className="h-px w-full bg-border/50 my-1" />

        {/* Check-In/Streak Section */}
        <motion.div 
          whileHover={!isComplete ? { scale: 1.02 } : { scale: 1 }}
          whileTap={!isComplete ? { scale: 0.98 } : { scale: 1 }}
          onClick={handleCheckIn}
          className={cn("p-4 rounded-3xl relative overflow-hidden transition-all", !isComplete ? "cursor-pointer bg-orange-500/10 ring-2 ring-orange-500/50" : "bg-background border-2 border-border/50")}
        >
          {!isComplete && (
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent pointer-events-none" />
          )}
          <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
            <div>
              <h3 className="font-heading font-bold text-xl mb-1 flex items-center gap-2 text-orange-500">
                <span className={cn("transition-transform duration-300", !isComplete ? "animate-pulse" : "scale-110")}>🔥</span> 
                {streakCount}-Day Streak!
              </h3>
              <p className="text-sm font-bold text-foreground/70">
                {!isComplete ? "Tap to check in for today!" : message}
              </p>
            </div>
            {!isComplete && (
              <div className="bg-orange-500 text-white text-xs font-bold px-3 py-2 sm:py-1 rounded-full animate-bounce shadow-md self-start sm:self-auto text-center w-auto shrink-0">
                Check In
              </div>
            )}
          </div>
          <div className="flex justify-between items-center px-1 relative z-10">
            {days.map((day, i) => {
              const isToday = day.date === todayDate;
              const isPastActive = isToday ? isComplete : i >= 7 - (isComplete ? streakCount : streakCount + 1);

              return (
                <div key={day.date} className="flex flex-col items-center gap-1">
                  <div className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 border-2",
                    isPastActive 
                      ? "bg-orange-500 border-orange-600 text-white shadow-lg shadow-orange-500/20 scale-110" 
                      : isToday ? "border-orange-500 border-dashed text-orange-500 bg-orange-500/10" : "border-border text-foreground/40 bg-card"
                  )}>
                    {day.label}
                  </div>
                  <span className={cn("text-[10px] font-bold", isToday ? "text-orange-500" : "text-foreground/40")}>
                    {isToday ? "Today" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FlashcardWidget() {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const card = mockFlashcards[index];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => {
      setIndex(prev => (prev + 1) % mockFlashcards.length);
    }, 150);
  };

  if (!card) {
    return (
      <div className="card-duo p-5 text-center text-foreground/50 font-bold uppercase tracking-wide">
        No flashcards available
      </div>
    );
  }

  return (
    <div className="card-duo p-5 relative perspective-1000">
      <div className="flex justify-between items-start gap-2 mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-1 rounded-lg inline-block break-words">{card.subject}</span>
        <button onClick={handleNext} className="text-sm font-bold text-primary active:scale-95 transition-transform uppercase tracking-wide shrink-0 whitespace-nowrap">Next Card</button>
      </div>

      <div 
        className="relative w-full h-32 cursor-pointer preserve-3d transition-transform duration-500"
        style={{ transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="absolute inset-0 backface-hidden flex items-center justify-center p-4 bg-background border-2 border-b-[6px] border-border rounded-2xl">
          <p className="text-lg font-bold text-center text-foreground uppercase tracking-wide">{card.front}</p>
        </div>
        <div className="absolute inset-0 backface-hidden flex items-center justify-center p-4 bg-primary/10 border-2 border-b-[6px] border-primary/30 rounded-2xl [transform:rotateX(180deg)]">
          <p className="text-base font-bold text-center text-primary uppercase tracking-wide">{card.back}</p>
        </div>
      </div>
    </div>
  );
}

function TriviaWidget() {
  const [triviaState, setTriviaState] = useState<{
    date: string;
    questionIndices: number[];
    currentIndex: number;
    answers: Record<number, number>;
  } | null>(null);

  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diff = tomorrow.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    const today = new Date().toLocaleDateString();
    const stored = localStorage.getItem('dailyTrivia');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.date === today) {
          setTriviaState(parsed);
          return;
        }
      } catch (e) {}
    }
    
    // Generate new 10 questions
    const indices = Array.from({length: mockTriviaList.length}, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const selectedIndices = indices.slice(0, 10);
    
    const newState = {
      date: today,
      questionIndices: selectedIndices,
      currentIndex: 0,
      answers: {}
    };
    setTriviaState(newState);
    localStorage.setItem('dailyTrivia', JSON.stringify(newState));
  }, []);

  const handleSelect = (idx: number) => {
    if (!triviaState) return;
    const currentQIndex = triviaState.questionIndices[triviaState.currentIndex];
    if (triviaState.answers[currentQIndex] !== undefined) return;
    
    const newState = {
      ...triviaState,
      answers: {
        ...triviaState.answers,
        [currentQIndex]: idx
      }
    };
    setTriviaState(newState);
    localStorage.setItem('dailyTrivia', JSON.stringify(newState));
  };

  const handleNext = () => {
    if (!triviaState) return;
    const nextIndex = triviaState.currentIndex + 1;
    const newState = {
      ...triviaState,
      currentIndex: nextIndex
    };
    setTriviaState(newState);
    localStorage.setItem('dailyTrivia', JSON.stringify(newState));

    if (nextIndex >= 10) {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#3b82f6', '#ec4899', '#eab308']
        });
      });
    }
  };

  if (!triviaState) return null;

  if (triviaState.currentIndex >= 10) {
    const score = Object.entries(triviaState.answers).filter(([qIdx, ans]) => mockTriviaList[parseInt(qIdx)].correctIndex === ans).length;
    return (
      <div className="card-duo p-8 text-center flex flex-col items-center">
        <h3 className="font-heading font-bold text-2xl mb-2 flex items-center gap-2 text-purple-500">
          <span>🎉</span> Trivia Complete!
        </h3>
        <p className="font-bold text-foreground/80 mb-6">You scored {score} out of 10.</p>
        <div className="bg-primary/10 p-4 rounded-xl border-2 border-primary/20">
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Next Trivia In</p>
          <p className="text-xl font-heading font-bold">{timeLeft}</p>
        </div>
      </div>
    );
  }

  const currentQIndex = triviaState.questionIndices[triviaState.currentIndex];
  // Guard in case we somehow get undefined question
  const question = mockTriviaList[currentQIndex];
  if (!question) {
    return (
      <div className="card-duo p-5 text-center text-foreground/50 font-bold uppercase tracking-wide">
        No trivia available
      </div>
    );
  }
  const selectedOpt = triviaState.answers[currentQIndex];

  return (
    <div className="card-duo p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="font-heading font-bold text-xl flex items-center gap-2 text-purple-500 leading-tight">
          <span className="shrink-0">🧠</span> Daily Trivia
        </h3>
        <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shrink-0">
          {triviaState.currentIndex + 1} / 10
        </span>
      </div>
      <p className="font-bold mb-4 text-foreground/80">{question.questionText}</p>
      <div className="space-y-3">
        {question.options.map((opt, idx) => {
          let btnClass = "border-border border-b-4 bg-background hover:bg-card-foreground/5 text-foreground";
          if (selectedOpt !== undefined) {
            if (idx === question.correctIndex) {
              btnClass = "border-primary border-b-primary-dark bg-primary/10 text-primary";
            } else if (idx === selectedOpt) {
              btnClass = "border-error border-b-error bg-error/10 text-error";
            } else {
              btnClass = "border-border border-b-2 bg-background opacity-50";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={cn("w-full text-left p-3 rounded-2xl border-2 font-bold transition-all duration-200 active:border-b-2 active:translate-y-[2px]", btnClass)}
              disabled={selectedOpt !== undefined}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {selectedOpt !== undefined && (
        <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="mt-4 p-4 bg-primary/10 rounded-2xl border-2 border-primary/20 flex flex-col gap-3">
          <div>
            <span className="font-bold text-primary block text-lg mb-1">{selectedOpt === question.correctIndex ? 'Correct!' : 'Incorrect.'}</span> 
            <span className="text-foreground/80 font-medium text-sm">{question.explanation}</span>
          </div>
          <button 
            onClick={handleNext}
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl border-b-4 border-primary-dark active:border-b-0 active:translate-y-1 transition-all"
          >
            {triviaState.currentIndex === 9 ? 'Finish' : 'Next Question'}
          </button>
        </motion.div>
      )}
    </div>
  );
}

function ChessShortcut() {
  return (
    <div className="bg-[#1F2F36] rounded-3xl overflow-hidden shadow-sm border-2 border-b-[6px] border-[#2A3F48] text-white">
      <div className="p-5 pb-0 flex flex-col items-center text-center">
        <h3 className="font-heading font-bold text-2xl flex items-center gap-2 mb-2">
          <span className="text-3xl">♞</span> Chess Corner
        </h3>
        <p className="text-white/70 text-sm font-bold">Sharpen your mind between study sessions.</p>
      </div>
      
      <div className="p-5 flex flex-col sm:flex-row gap-3">
        <Link to="/chess?mode=bot" className="flex-1 bg-white hover:bg-gray-100 text-[#1F2F36] py-3 rounded-2xl font-bold text-center border-b-4 border-gray-300 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-wide">
          Play Bot
        </Link>
        <Link to="/chess?mode=local" className="flex-1 bg-[#2A3F48] hover:bg-[#324b55] py-3 rounded-2xl font-bold text-center border-b-4 border-[#1F2F36] active:border-b-0 active:translate-y-1 transition-all uppercase tracking-wide">
          1v1 Local
        </Link>
      </div>
    </div>
  );
}
