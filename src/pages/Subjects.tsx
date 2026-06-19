import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { mockSubjects } from '../data/mockData';
import { Grade } from '../types';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';

export default function Subjects() {
  const { selectedGrade, setSelectedGrade, user } = useStore();
  const navigate = useNavigate();
  // Safe fallback if selectedGrade is not set
  const currentGrade = selectedGrade || 11;

  const subjects = useMemo(() => {
    return mockSubjects.filter(s => 
      s.grade === currentGrade && 
      (!s.stream || s.stream === user?.stream)
    );
  }, [currentGrade, user?.stream]);

  return (
    <div className="flex flex-col gap-6 p-4 pt-6 max-w-4xl mx-auto min-h-[calc(100vh-4rem)]">
      <div className="flex bg-background rounded-2xl p-1 gap-2 shadow-sm border-2 border-border mb-4">
        {[11, 12].map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGrade(g as Grade)}
            className={cn(
              "flex-1 py-3 font-bold rounded-xl transition-all border-2 border-b-4",
              currentGrade === g ? "bg-primary border-primary border-b-primary-dark text-white active:border-b-0 active:translate-y-[4px]" : "bg-card border-border text-foreground/60 active:border-b-0 active:translate-y-[4px] hover:bg-card-foreground/5 text-lg"
            )}
          >
            Grade {g}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {subjects.map(subject => {
          const Icon = (Icons as any)[subject.icon] || Icons.Book;
          return (
            <button
              key={subject.id}
              onClick={() => navigate(`/subjects/${subject.id}`)}
              className="card-duo p-5 flex flex-col items-center text-center gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center border-2 border-primary/20">
                <Icon className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg leading-tight text-foreground">{subject.name}</h3>
                <p className="text-sm text-foreground/60 font-bold uppercase tracking-wide mt-1">{subject.chapterCount} Chapters</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  );
}
