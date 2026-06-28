import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, ArrowLeft, Check, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { audio } from '../lib/audio';

type TimerMode = 'focus' | 'break';

export default function FocusRoom() {
  const navigate = useNavigate();
  
  // Timer State
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  
  // Sound State
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [soundType, setSoundType] = useState<'rain' | 'cafe' | 'waves'>('rain');
  
  // Tasks State
  const [tasks, setTasks] = useState<{id: string, text: string, completed: boolean}[]>([]);
  const [newTask, setNewTask] = useState('');

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      audio.playSuccess(); // play a sound when done
      if (mode === 'focus') {
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('focus');
        setTimeLeft(25 * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), text: newTask.trim(), completed: false }]);
    setNewTask('');
    audio.playPop();
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    audio.playPop();
  };

  const toggleSound = () => {
    setIsPlayingSound(!isPlayingSound);
    // In a real app we'd play/pause an actual audio element here based on soundType
  };

  return (
    <div className="flex flex-col max-w-4xl mx-auto min-h-screen bg-background relative pb-24 md:pb-6">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b-2 border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-card hover:bg-card-foreground/5 flex items-center justify-center transition-colors border-2 border-border">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-heading font-bold text-xl sm:text-2xl">Focus Room</h1>
        </div>
      </header>

      <div className="p-4 flex flex-col gap-8 flex-1">
        
        {/* Top Section: Timer & Sound */}
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          
          {/* Timer Card */}
          <div className="card flex-1 p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute top-4 left-0 w-full flex justify-center gap-2 z-10">
                <button 
                  onClick={() => switchMode('focus')}
                  className={cn("px-4 py-1.5 rounded-full text-sm font-bold transition-colors", mode === 'focus' ? "bg-orange-500 text-white" : "bg-card-foreground/10 hover:bg-card-foreground/20")}
                >
                  Focus
                </button>
                <button 
                  onClick={() => switchMode('break')}
                  className={cn("px-4 py-1.5 rounded-full text-sm font-bold transition-colors", mode === 'break' ? "bg-emerald-500 text-white" : "bg-card-foreground/10 hover:bg-card-foreground/20")}
                >
                  Break
                </button>
             </div>

             <div className="text-6xl sm:text-8xl font-mono font-bold mt-12 mb-8 tracking-tighter tabular-nums drop-shadow-sm">
                {formatTime(timeLeft)}
             </div>

             <div className="flex items-center gap-4 z-10">
                <button 
                  onClick={toggleTimer}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
                >
                  {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>
                <button 
                  onClick={resetTimer}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-card-foreground/10 flex items-center justify-center hover:bg-card-foreground/20 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
             </div>
          </div>

          {/* Ambient Sound Card */}
          <div className="card w-full md:w-72 p-6 flex flex-col gap-4">
             <h2 className="font-heading font-bold text-lg flex items-center gap-2">
               <span>Ambient Sound</span>
             </h2>
             <p className="text-sm font-medium text-foreground/70 mb-2">Background noise to help you focus.</p>
             
             <div className="grid grid-cols-1 gap-2">
               {['rain', 'cafe', 'waves'].map((sound) => (
                 <button
                   key={sound}
                   onClick={() => setSoundType(sound as any)}
                   className={cn(
                     "p-3 rounded-xl border-2 font-bold text-left capitalize transition-colors flex justify-between items-center",
                     soundType === sound ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary/50"
                   )}
                 >
                   <span>{sound}</span>
                   {soundType === sound && isPlayingSound && (
                     <motion.div
                       animate={{ scale: [1, 1.2, 1] }}
                       transition={{ repeat: Infinity, duration: 1 }}
                       className="w-2 h-2 rounded-full bg-current"
                     />
                   )}
                 </button>
               ))}
             </div>

             <button 
                onClick={toggleSound}
                className={cn("mt-auto py-3 rounded-xl font-bold border-2 transition-colors flex items-center justify-center gap-2", 
                  isPlayingSound ? "bg-red-500/10 text-red-500 border-red-500/50 hover:bg-red-500/20" : "bg-card-foreground/5 border-transparent hover:bg-card-foreground/10"
                )}
             >
                {isPlayingSound ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                {isPlayingSound ? "Stop Playing" : "Play Sound"}
             </button>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="card p-6 flex flex-col gap-4">
           <h2 className="font-heading font-bold text-lg">Focus Tasks</h2>
           <form onSubmit={addTask} className="flex gap-2">
             <input 
               type="text" 
               placeholder="What are you working on?" 
               className="flex-1 input-elegant"
               value={newTask}
               onChange={(e) => setNewTask(e.target.value)}
             />
             <button type="submit" className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity font-bold">
               <Plus className="w-6 h-6" />
             </button>
           </form>

           <div className="flex flex-col gap-2 mt-4">
             {tasks.length === 0 ? (
               <div className="text-center p-8 border-2 border-dashed border-border/50 rounded-2xl">
                 <p className="text-foreground/50 font-bold">No tasks yet. Add one above!</p>
               </div>
             ) : (
               tasks.map(task => (
                 <motion.div 
                   key={task.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className={cn("p-4 rounded-2xl border-2 transition-all flex items-center gap-4 cursor-pointer", task.completed ? "bg-card-foreground/5 border-transparent opacity-50" : "bg-background border-border hover:border-primary/50")}
                   onClick={() => toggleTask(task.id)}
                 >
                   <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors", task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-foreground/30")}>
                     {task.completed && <Check className="w-4 h-4" />}
                   </div>
                   <span className={cn("font-bold flex-1 transition-all", task.completed && "line-through")}>
                     {task.text}
                   </span>
                 </motion.div>
               ))
             )}
           </div>
        </div>

      </div>
    </div>
  );
}
