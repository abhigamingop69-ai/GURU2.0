import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { mockSubjects, mockChapters } from '../data/mockData';
import { Grade } from '../types';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Search } from 'lucide-react';

export default function Subjects() {
  const { user } = useStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Safe fallback if user grade is not set (should not happen if logged in)
  const currentGrade = user?.grade || 11;

  const subjects = useMemo(() => {
    return mockSubjects.filter(s => 
      s.grade === currentGrade && 
      (!s.stream || s.stream === user?.stream)
    );
  }, [currentGrade, user?.stream]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    
    const query = searchQuery.toLowerCase();
    
    const matchedSubjects = mockSubjects.filter(s => 
      s.name.toLowerCase().includes(query) && s.grade === currentGrade
    );
    
    const validSubjectIds = new Set(mockSubjects.filter(s => s.grade === currentGrade).map(s => s.id));

    const matchedChapters = mockChapters.filter(c => 
      validSubjectIds.has(c.subjectId) &&
      (c.title.toLowerCase().includes(query) || 
       c.summaryContent.toLowerCase().includes(query))
    );

    return { subjects: matchedSubjects, chapters: matchedChapters };
  }, [searchQuery, currentGrade]);

  return (
    <div className="flex flex-col gap-6 p-4 pt-6 max-w-4xl mx-auto min-h-[calc(100vh-4rem)]">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
        <input
          type="text"
          placeholder="Search subjects, chapters, or topics across all grades..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-card border-2 border-border rounded-2xl py-4 pl-12 pr-4 font-bold focus:outline-none focus:border-primary transition-colors text-foreground placeholder:text-foreground/40 shadow-sm"
        />
      </div>

      {!searchQuery.trim() ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {subjects.length > 0 ? (
              subjects.map(subject => {
                const Icon = (Icons as any)[subject.icon] || Icons.Book;
                return (
                  <button
                    key={subject.id}
                    onClick={() => navigate(`/subjects/${subject.id}`)}
                    className="card-duo p-5 flex flex-col items-center text-center gap-3"
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center border-2 border-primary/20 shrink-0">
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8 stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base sm:text-lg leading-tight text-foreground">{subject.name}</h3>
                      <p className="text-[10px] sm:text-sm text-foreground/60 font-bold uppercase tracking-wide mt-1">{subject.chapterCount} Chapters</p>
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="col-span-full py-12 text-center text-foreground/50 font-bold">
                No subjects available for this grade yet.
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-8">
          {searchResults?.subjects.length === 0 && searchResults?.chapters.length === 0 && (
            <div className="text-center py-12 text-foreground/50 font-bold">
              No results found for "{searchQuery}"
            </div>
          )}

          {searchResults && searchResults.subjects.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider pl-2">Matching Subjects</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {searchResults.subjects.map(subject => {
                  const Icon = (Icons as any)[subject.icon] || Icons.Book;
                  return (
                    <button
                      key={subject.id}
                      onClick={() => navigate(`/subjects/${subject.id}`)}
                      className="card-duo p-4 flex flex-col items-center text-center gap-2"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                        <Icon className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-md leading-tight text-foreground">{subject.name}</h3>
                        <p className="text-xs text-foreground/60 font-bold uppercase tracking-wide mt-1">Grade {subject.grade} • {subject.chapterCount} Ch.</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {searchResults && searchResults.chapters.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider pl-2">Matching Chapters</h2>
              <div className="flex flex-col gap-3">
                {searchResults.chapters.map(chapter => {
                  const subject = mockSubjects.find(s => s.id === chapter.subjectId);
                  return (
                    <button
                      key={chapter.id}
                      onClick={() => navigate(`/subjects/${chapter.subjectId}/chapter/${chapter.id}`)}
                      className="card-duo p-4 flex flex-col sm:flex-row sm:items-center justify-between text-left gap-3 w-full"
                    >
                      <div>
                        <h3 className="font-heading font-bold text-lg text-foreground bg-primary/10 inline-block px-2 py-0.5 rounded-md mb-1 text-primary">{chapter.title}</h3>
                        {subject && (
                          <div className="flex items-center gap-2 text-xs font-bold text-foreground/50 uppercase tracking-wider mt-1">
                            <span className="bg-card-foreground/5 px-2 py-1 rounded">{subject.name}</span>
                            <span>Grade {subject.grade}</span>
                          </div>
                        )}
                        <p className="text-sm text-foreground/70 mt-2 line-clamp-2">{chapter.summaryContent}</p>
                      </div>
                      <Icons.ChevronRight className="w-5 h-5 text-foreground/30 hidden sm:block stretch-0 shrink-0" />
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
