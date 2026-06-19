import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Settings as SettingsIcon, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { mockFlashcards, mockTrivia } from '../data/mockData';

export default function Home() {
  const user = useStore(state => state.user);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 p-4 pt-6 max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10 py-2 -mx-4 px-4">
        <h1 className="text-xl font-heading font-bold">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-card hover:bg-card-foreground/5 flex items-center justify-center transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-card"></span>
          </button>
          <button onClick={() => navigate('/settings')} className="w-10 h-10 rounded-full bg-card hover:bg-card-foreground/5 flex items-center justify-center transition-colors">
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      <AdBanner />
      <DailyStreak streakCount={user?.streakCount || 0} />
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
    <div className="relative w-full h-40 md:h-48 rounded-2xl overflow-hidden shadow-sm">
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

function DailyStreak({ streakCount }: { streakCount: number }) {
  const isComplete = true; // mock for today
  const message = streakCount >= 7 ? "You're on fire! Don't break the chain." : streakCount > 0 ? "Keep it going!" : "Start your streak today!";

  return (
    <div className="bg-card p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-border cursor-pointer active:scale-[0.98] transition-transform">
      <h3 className="font-heading font-bold text-xl mb-1 flex items-center gap-2">
        <span>🔥</span> {streakCount}-Day Streak!
      </h3>
      <p className="text-sm font-medium text-foreground/70 mb-4">{message}</p>
      <div className="flex justify-between items-center px-1">
        {[...Array(7)].map((_, i) => (
          <div key={i} className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
            i < Math.min(streakCount, 7) || (i===0 && isComplete) ? "bg-primary text-white" : "border-2 border-border text-foreground/40"
          )}>
            {["M", "T", "W", "T", "F", "S", "S"][i]}
          </div>
        ))}
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

  return (
    <div className="bg-card rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-border p-5 relative perspective-1000">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-1 rounded-md">{card.subject}</span>
        <button onClick={handleNext} className="text-sm font-semibold text-primary hover:underline">Next Card</button>
      </div>

      <div 
        className="relative w-full h-32 cursor-pointer preserve-3d transition-transform duration-500"
        style={{ transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="absolute inset-0 backface-hidden flex items-center justify-center p-4 bg-background border border-border rounded-xl shadow-sm">
          <p className="text-lg font-medium text-center">{card.front}</p>
        </div>
        <div className="absolute inset-0 backface-hidden flex items-center justify-center p-4 bg-primary/5 border border-primary/20 rounded-xl shadow-sm [transform:rotateX(180deg)]">
          <p className="text-base font-medium text-center">{card.back}</p>
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
    <div className="bg-card p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-border">
      <h3 className="font-heading font-bold text-lg mb-3 flex items-center gap-2">
        <span>🧠</span> Daily Trivia
      </h3>
      <p className="font-medium mb-4">{mockTrivia.questionText}</p>
      <div className="space-y-2">
        {mockTrivia.options.map((opt, idx) => {
          let btnClass = "border-border bg-background hover:border-primary/50 text-foreground";
          if (selectedOpt !== null) {
            if (idx === mockTrivia.correctIndex) {
              btnClass = "border-primary bg-primary/10 text-primary";
            } else if (idx === selectedOpt) {
              btnClass = "border-error bg-error/10 text-error";
            } else {
              btnClass = "border-border bg-background opacity-50";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={cn("w-full text-left p-3 rounded-xl border-2 font-medium transition-all duration-200", btnClass)}
              disabled={selectedOpt !== null}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {selectedOpt !== null && (
        <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="mt-4 p-3 bg-background rounded-lg border border-border text-sm font-medium">
          <span className="font-bold">{selectedOpt === mockTrivia.correctIndex ? 'Correct!' : 'Incorrect.'}</span> {mockTrivia.explanation}
        </motion.div>
      )}
    </div>
  );
}

function ChessShortcut() {
  return (
    <div className="bg-[#1F2F36] rounded-2xl overflow-hidden shadow-lg border border-[#2A3F48] text-white">
      <div className="p-5 pb-0 flex items-start justify-between">
        <div>
          <h3 className="font-heading font-bold text-xl flex items-center gap-2">
            <span>♞</span> Chess Corner
          </h3>
          <p className="text-white/70 text-sm mt-1 font-medium">Sharpen your mind between study sessions.</p>
        </div>
      </div>
      
      <div className="p-5 flex gap-3">
        <Link to="/chess?mode=bot" className="flex-1 bg-white hover:bg-gray-100 text-[#1F2F36] py-3 rounded-xl font-bold text-center transition-transform active:scale-95">
          Play vs Bot
        </Link>
        <Link to="/chess?mode=local" className="flex-1 bg-[#2A3F48] hover:bg-[#324b55] py-3 rounded-xl font-bold text-center transition-transform active:scale-95">
          1v1 Local
        </Link>
      </div>
    </div>
  );
}
