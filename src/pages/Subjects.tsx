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
      <div className="flex bg-card rounded-xl p-1 shadow-sm border border-border">
        {[11, 12].map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGrade(g as Grade)}
            className={cn(
              "flex-1 py-2 font-bold rounded-lg transition-all",
              currentGrade === g ? "bg-primary text-white shadow-sm" : "text-foreground/60 hover:text-foreground"
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
              className="bg-card p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-border flex flex-col items-center text-center gap-3 active:scale-95 transition-transform hover:-translate-y-1 hover:shadow-md"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg leading-tight">{subject.name}</h3>
                <p className="text-sm text-foreground/60 font-medium mt-1">{subject.chapterCount} Chapters</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  );
}
