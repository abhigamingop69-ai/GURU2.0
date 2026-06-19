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

      <div className="flex flex-col p-4 gap-4">
        {chapters.length === 0 ? (
          <p className="text-foreground/60 text-center py-10 font-bold uppercase tracking-wider">No chapters available for this subject yet.</p>
        ) : (
          chapters.map(chapter => (
            <div 
              key={chapter.id}
              onClick={() => navigate(`/subjects/${subjectId}/chapter/${chapter.id}`)}
              className="card-duo p-5 flex items-center justify-between cursor-pointer"
            >
              <div className="flex-1 pr-4">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1 bg-primary/10 inline-block px-2 py-0.5 rounded-lg border border-primary/20">Chapter {chapter.orderIndex}</div>
                <h3 className="font-bold text-xl leading-tight mb-3 text-foreground">{chapter.title}</h3>
                
                {/* Progress bar */}
                <div className="h-3 w-full bg-border rounded-full overflow-hidden border border-border">
                  <div className="h-full bg-primary rounded-full relative" style={{ width: `${chapter.progress}%` }}>
                    <div className="absolute top-0 bottom-0 right-0 w-8 bg-white/20 -skew-x-12 translate-x-4"></div>
                  </div>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-border/50 flex items-center justify-center flex-shrink-0 border-2 border-transparent">
                <ChevronRight className="w-6 h-6 text-foreground/50 stroke-[2.5]" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
