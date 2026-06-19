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
      <header className="sticky top-0 bg-background/90 backdrop-blur-md z-10 p-4 border-b border-border flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-card active:scale-95 transition-all">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Chapter {chapter.orderIndex}</span>
          <h1 className="text-lg font-heading font-bold truncate">{chapter.title}</h1>
        </div>
      </header>

      <div className="p-6 md:p-8 space-y-8">
        {/* Notes Content */}
        <div className="prose prose-sm md:prose-base dark:prose-invert prose-headings:font-heading prose-headings:font-bold prose-a:text-accent prose-p:leading-relaxed max-w-none" dangerouslySetInnerHTML={{ __html: chapter.notesContent }} />

        {/* Summary Content */}
        <div ref={summaryRef} className="mt-12 bg-primary/5 rounded-2xl p-6 border border-primary/20">
          <h2 className="text-xl font-heading font-bold text-primary mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Quick Summary
          </h2>
          <p className="font-medium leading-relaxed">{chapter.summaryContent}</p>
        </div>
      </div>

      {/* Floating Action for Mobile to jump to summary */}
      <button 
        onClick={scrollToSummary}
        className="fixed md:hidden bottom-20 right-4 bg-primary text-white p-4 rounded-full shadow-lg active:scale-90 transition-transform z-20"
      >
        <BookOpen className="w-6 h-6" />
      </button>
    </div>
  );
}
