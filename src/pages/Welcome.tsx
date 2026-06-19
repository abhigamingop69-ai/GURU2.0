import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { motion } from 'motion/react';

export default function Welcome() {
  const navigate = useNavigate();
  const user = useStore(state => state.user);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div 
      className="fixed inset-0 bg-primary z-50 flex items-center justify-center p-6 cursor-pointer"
      onClick={() => navigate('/', { replace: true })}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-white">
          Welcome, {user?.name || 'Student'}!
        </h1>
        <p className="text-xl text-white/90 font-medium font-sans">
          Let's crush your exams.
        </p>
      </motion.div>
    </div>
  );
}
