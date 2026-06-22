import { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { BookOpen, Tv, Settings, Target, Zap, ArrowRight } from 'lucide-react';

const slides = [
  { title: "Welcome to Guruba", desc: "Nepal's Educational Hub for Grade 11 & 12. Get ready to excel.", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
  { title: "Notes & Summaries", desc: "Structured study materials, formulas, and chapter summaries.", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
  { title: "Guru TV", desc: "Learn by watching curated educational videos from top educators.", icon: Tv, color: "text-rose-500", bg: "bg-rose-500/10" },
  { title: "Exam Assets", desc: "Be exam-ready with model questions, past papers & solutions.", icon: Target, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { title: "Let's get started", desc: "Join thousands of students on their journey to top grades.", icon: Settings, color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const completeOnboarding = useStore(state => state.completeOnboarding);

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      completeOnboarding();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const SlideIcon = slides[currentSlide].icon;

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col p-6 overflow-y-auto overflow-x-hidden relative">
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <header className="w-full flex justify-end relative z-10">
        {currentSlide < slides.length - 1 ? (
          <button 
            onClick={handleSkip} 
            className="px-4 py-2 text-sm font-bold text-foreground/50 hover:text-foreground hover:bg-foreground/5 rounded-full transition-colors"
          >
            Skip
          </button>
        ) : (
          <div className="h-9" /> // placeholder to keep height consistent
        )}
      </header>

      <main className="flex-1 w-full max-w-md mx-auto flex flex-col justify-center relative z-10 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 40, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -40, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center text-center space-y-8"
          >
            <div className={cn("relative w-56 h-56 rounded-full flex items-center justify-center transition-colors duration-500", slides[currentSlide].bg)}>
               {currentSlide === 0 ? (
                 <motion.div 
                   initial={{ scale: 0.8 }} 
                   animate={{ scale: 1 }} 
                   transition={{ type: "spring", stiffness: 200, damping: 12 }}
                   className="w-full h-full p-6 flex flex-col items-center justify-center relative z-10"
                 >
                   <img src="https://i.ibb.co/VYyZWwpp/Untitled-project-Photoroom.png" alt="Guruba Logo" className="w-[12rem] h-[12rem] object-contain drop-shadow-2xl" />
                 </motion.div>
               ) : (
                 <motion.div
                   initial={{ scale: 0.5, rotate: -20 }}
                   animate={{ scale: 1, rotate: 0 }}
                   transition={{ type: "spring", stiffness: 200, damping: 15 }}
                 >
                   <SlideIcon className={cn("w-28 h-28 drop-shadow-lg", slides[currentSlide].color)} />
                 </motion.div>
               )}
               {/* Decorative rings */}
               <div className="absolute inset-0 rounded-full border border-current opacity-10 scale-110" />
               <div className="absolute inset-0 rounded-full border border-current opacity-5 scale-125" />
            </div>

            <div className="space-y-4 px-4 w-full">
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-heading font-black text-foreground tracking-tight"
              >
                {slides[currentSlide].title}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-xl text-foreground/70 font-sans leading-relaxed"
              >
                {slides[currentSlide].desc}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="w-full max-w-md mx-auto flex flex-col gap-8 pb-4 relative z-10 mt-auto">
        <div className="flex justify-center gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={cn(
                "h-2.5 rounded-full transition-all duration-300",
                idx === currentSlide ? "w-8 bg-primary" : "w-2.5 bg-primary/20 hover:bg-primary/40"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        
        <button
          onClick={handleNext}
          className="w-full h-14 btn-primary text-lg flex items-center justify-center gap-2 group shadow-xl shadow-primary/20"
        >
          {currentSlide === slides.length - 1 ? "Get Started" : "Continue"}
          {currentSlide < slides.length - 1 && (
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          )}
        </button>
      </footer>
    </div>
  );
}
