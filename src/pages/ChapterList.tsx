import { useParams, useNavigate } from 'react-router-dom';
import { mockSubjects, mockChapters } from '../data/mockData';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';

export default function ChapterList() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const subject = useMemo(() => mockSubjects.find(s => s.id === subjectId), [subjectId]);
  const chapters = useMemo(() => mockChapters.filter(c => c.subjectId === subjectId).sort((a,b) => a.orderIndex - b.orderIndex), [subjectId]);

  if (!subject) {
    return <div className="p-6">Subject not found.</div>;
  }

  return (
    <div className="flex flex-col max-w-4xl mx-auto min-h-screen bg-background">
      <header className="sticky top-0 bg-background/90 backdrop-blur-md z-10 p-4 border-b border-border flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-card active:scale-95 transition-all">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-xl font-heading font-bold">{subject.name}</h1>
      </header>

      <div className="flex flex-col p-4 gap-3">
        {chapters.length === 0 ? (
          <p className="text-foreground/60 text-center py-10 font-medium tracking-tight">No chapters available for this subject yet.</p>
        ) : (
          chapters.map(chapter => (
            <div 
              key={chapter.id}
              onClick={() => navigate(`/subjects/${subjectId}/chapter/${chapter.id}`)}
              className="bg-card p-4 rounded-xl shadow-sm border border-border flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="flex-1 pr-4">
                <div className="text-xs font-bold text-accent uppercase tracking-wider mb-1">Chapter {chapter.orderIndex}</div>
                <h3 className="font-bold text-lg leading-tight mb-2">{chapter.title}</h3>
                
                {/* Progress bar */}
                <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${chapter.progress}%` }}></div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-foreground/40" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
