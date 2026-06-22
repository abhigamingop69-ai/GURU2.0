import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Settings as SettingsIcon, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { mockFlashcards, mockTrivia } from '../data/mockData';
import { User } from '../types';

export default function Home() {
  const user = useStore(state => state.user);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 p-4 pt-6 max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-50 py-3 -mx-4 px-4 border-b border-white/5 md:border-transparent gap-4">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center mb-1">
            <img src="https://i.ibb.co/VYyZWwpp/Untitled-project-Photoroom.png" alt="Guruba Logo" className="h-16 object-contain md:hidden shrink-0" />
          </div>
          <h1 className="text-xl font-heading font-bold leading-tight truncate">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => navigate('/settings')} className="w-10 h-10 rounded-full bg-card hover:bg-card-foreground/5 flex items-center justify-center transition-colors">
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      <AdBanner />
      <DailyStreak user={user} />
      <FlashcardWidget />
      <TriviaWidget />
      <ChessShortcut />
    </div>
  );
}

// Subcomponents

function AdBanner() {
  const banners = [
    { title: "Master Accounts This Week", bg: "bg-blue-500" },
    { title: "New Model Questions Added", bg: "bg-purple-500" }
  ];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="relative w-full h-40 md:h-48 rounded-3xl overflow-hidden shadow-sm border-b-[6px] border-black/10">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className={cn("absolute inset-0 flex items-center p-6 text-white", banners[current].bg)}
        >
          <h2 className="text-2xl font-bold font-heading max-w-[70%]">{banners[current].title}</h2>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
        {banners.map((_, idx) => (
          <div key={idx} className={cn("w-2 h-2 rounded-full transition-colors", idx === current ? "bg-white" : "bg-white/50")} />
        ))}
      </div>
    </div>
  );
}

function DailyStreak({ user }: { user: User | null }) {
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
    <motion.div 
      whileHover={!isComplete ? { scale: 1.02 } : { scale: 1 }}
      whileTap={!isComplete ? { scale: 0.98 } : { scale: 1 }}
      onClick={handleCheckIn}
      className={cn("card-duo p-5 relative overflow-hidden", !isComplete ? "cursor-pointer ring-2 ring-orange-500/50" : "")}
    >
      {!isComplete && (
        <div className="absolute inset-0 bg-orange-500/5 hover:bg-orange-500/10 transition-colors" />
      )}
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <h3 className="font-heading font-bold text-xl mb-1 flex items-center gap-2 text-orange-500">
            <span className={cn("transition-transform duration-300", !isComplete ? "animate-pulse" : "scale-110")}>🔥</span> 
            {streakCount}-Day Streak!
          </h3>
          <p className="text-sm font-bold text-foreground/70 mb-4">
            {!isComplete ? "Tap to check in for today!" : message}
          </p>
        </div>
        {!isComplete && (
          <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce">
            Check In
          </div>
        )}
      </div>

      <div className="flex justify-between items-center px-1 relative z-10 mt-2">
        {days.map((day, i) => {
          const isToday = day.date === todayDate;
          // A somewhat simplified check: if it's today, depend on isComplete
          // Ideally we'd store a history array, but for simple visualization let's just assume previous days correspond to the active streak
          const isPastActive = isToday ? isComplete : i >= 7 - (isComplete ? streakCount : streakCount + 1);

          return (
            <div key={day.date} className="flex flex-col items-center gap-1">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 border-2",
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

  return (
    <div className="card-duo p-5 relative perspective-1000">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-1 rounded-lg">{card.subject}</span>
        <button onClick={handleNext} className="text-sm font-bold text-primary active:scale-95 transition-transform uppercase tracking-wide">Next Card</button>
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
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  
  const handleSelect = (idx: number) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);
  };

  return (
    <div className="card-duo p-5">
      <h3 className="font-heading font-bold text-xl mb-3 flex items-center gap-2 text-purple-500">
        <span>🧠</span> Daily Trivia
      </h3>
      <p className="font-bold mb-4 text-foreground/80">{mockTrivia.questionText}</p>
      <div className="space-y-3">
        {mockTrivia.options.map((opt, idx) => {
          let btnClass = "border-border border-b-4 bg-background hover:bg-card-foreground/5 text-foreground";
          if (selectedOpt !== null) {
            if (idx === mockTrivia.correctIndex) {
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
              disabled={selectedOpt !== null}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {selectedOpt !== null && (
        <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="mt-4 p-4 bg-primary/10 rounded-2xl border-2 border-primary/20 text-sm font-medium">
          <span className="font-bold text-primary block text-lg mb-1">{selectedOpt === mockTrivia.correctIndex ? 'Correct!' : 'Incorrect.'}</span> 
          <span className="text-foreground/80 font-bold">{mockTrivia.explanation}</span>
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
      
      <div className="p-5 flex gap-3">
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
