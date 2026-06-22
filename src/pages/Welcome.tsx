import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();
  const user = useStore(state => state.user);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div 
      className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 cursor-pointer overflow-hidden"
      onClick={() => navigate('/', { replace: true })}
    >
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center space-y-8 flex flex-col items-center relative z-10"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative"
        >
          <div className="w-32 h-32 md:w-40 md:h-40 bg-card rounded-full shadow-2xl flex items-center justify-center border-4 border-background p-4 relative z-10">
            <img src="https://i.ibb.co/VYyZWwpp/Untitled-project-Photoroom.png" alt="Guruba Logo" className="w-full h-full object-contain" />
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] rounded-full border-2 border-dashed border-primary/30 z-0"
          />
        </motion.div>

        <div className="space-y-3">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-4xl md:text-5xl font-heading font-black text-foreground"
          >
            Welcome, <span className="text-primary">{user?.name?.split(' ')[0] || 'Student'}!</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-xl text-foreground/70 font-medium font-sans flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Let's crush your exams.
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </motion.p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-10 left-0 w-full text-center"
      >
        <span className="text-sm text-foreground/40 font-bold uppercase tracking-widest animate-pulse">
          Tap anywhere to continue
        </span>
      </motion.div>
    </div>
  );
}
