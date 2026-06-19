import { useParams, useNavigate } from 'react-router-dom';
import { mockChapters } from '../data/mockData';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useMemo, useRef } from 'react';

export default function ChapterDetail() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const summaryRef = useRef<HTMLDivElement>(null);

  const chapter = useMemo(() => mockChapters.find(c => c.id === chapterId), [chapterId]);

  if (!chapter) {
    return <div className="p-6">Chapter not found.</div>;
  }

  const scrollToSummary = () => {
    summaryRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col max-w-4xl mx-auto min-h-screen bg-background relative pb-24 md:pb-6">
      <header className="sticky top-0 bg-background/90 backdrop-blur-md z-10 p-4 border-b-2 border-border flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-2xl hover:bg-card active:scale-95 transition-all text-foreground/70 hover:text-foreground">
          <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
        </button>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 inline-block px-2 py-0.5 rounded-md border border-primary/20 w-fit">Chapter {chapter.orderIndex}</span>
          <h1 className="text-lg font-heading font-bold truncate tracking-tight">{chapter.title}</h1>
        </div>
      </header>

      <div className="p-6 md:p-8 space-y-8">
        {/* Notes Content */}
        <div className="prose prose-sm md:prose-base dark:prose-invert prose-headings:font-heading prose-headings:font-bold prose-a:text-primary prose-p:leading-relaxed max-w-none text-foreground/90 font-medium" dangerouslySetInnerHTML={{ __html: chapter.notesContent }} />

        {/* Summary Content */}
        <div ref={summaryRef} className="card-duo mt-12 bg-primary/10 border-primary/20 p-6 md:p-8 border-b-primary/30">
          <h2 className="text-xl font-heading font-bold text-primary mb-4 flex items-center gap-2 uppercase tracking-wide">
            <BookOpen className="w-6 h-6 stroke-[2.5]" /> Quick Summary
          </h2>
          <p className="font-bold leading-relaxed text-foreground/80">{chapter.summaryContent}</p>
        </div>
      </div>

      {/* Floating Action for Mobile to jump to summary */}
      <button 
        onClick={scrollToSummary}
        className="fixed md:hidden bottom-20 right-4 btn-primary p-4 rounded-full shadow-lg z-20 w-14 h-14"
      >
        <BookOpen className="w-6 h-6" />
      </button>
    </div>
  );
}
