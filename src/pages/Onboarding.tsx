import { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { BookOpen, Tv, Settings, Target, Zap } from 'lucide-react';

const slides = [
  { title: "Welcome to Guruba", desc: "Nepal's Educational Hub for Grade 11 & 12", icon: Zap, color: "text-yellow-500" },
  { title: "Notes & Summaries", desc: "Structured study materials for every chapter.", icon: BookOpen, color: "text-blue-500" },
  { title: "Guru TV", desc: "Learn by watching curated educational videos.", icon: Tv, color: "text-red-500" },
  { title: "Exam Assets", desc: "Be exam-ready with model questions & answers.", icon: Target, color: "text-purple-500" },
  { title: "Let's get started", desc: "Join thousands of students on their journey.", icon: Settings, color: "text-green-500" },
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-between p-6 overflow-hidden">
      <div className="w-full flex justify-end">
        {currentSlide < slides.length - 1 && (
          <button onClick={handleSkip} className="font-semibold text-foreground/60 hover:text-foreground">
            Skip
          </button>
        )}
      </div>

      <div className="flex-1 w-full max-w-sm flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center space-y-6"
          >
            <div className="w-48 h-48 rounded-full bg-card shadow-lg flex items-center justify-center mb-4">
               {currentSlide === 0 ? (
                 <img src="https://i.ibb.co/VYyZWwpp/Untitled-project-Photoroom.png" alt="Guruba Logo" className="w-[11rem] h-[11rem] object-contain" />
               ) : (
                 <SlideIcon className={cn("w-24 h-24", slides[currentSlide].color)} />
               )}
            </div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              {slides[currentSlide].title}
            </h1>
            <p className="text-lg text-foreground/80 font-sans">
              {slides[currentSlide].desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-8 pb-8">
        <div className="flex justify-center gap-2">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-colors duration-300",
                idx === currentSlide ? "bg-primary" : "bg-primary/20"
              )}
            />
          ))}
        </div>
        
        <button
          onClick={handleNext}
          className="w-full h-14 btn-primary text-lg"
        >
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
        </button>
      </div>
    </div>
  );
}
