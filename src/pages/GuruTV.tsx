import { useState, useMemo } from 'react';
import { mockVideos, mockSubjects } from '../data/mockData';
import { PlayCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

export default function GuruTV() {
  const [activeSubject, setActiveSubject] = useState<string>('All');
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  
  const { user } = useStore();

  const filteredVideos = useMemo(() => {
    return mockVideos.filter(v => activeSubject === 'All' || v.subjectId === activeSubject);
  }, [activeSubject]);

  // Derive subjects to show in filter based on grade and stream
  const subjectsToFilter = useMemo(() => {
    return mockSubjects.filter(s => 
      s.grade === (user?.grade || 11) && 
      (!s.stream || s.stream === user?.stream)
    );
  }, [user]);

  if (activeVideo) {
    const video = mockVideos.find(v => v.id === activeVideo);
    return (
      <div className="flex flex-col min-h-screen bg-black">
        <div className="w-full aspect-video sticky top-0 z-20 bg-black">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${video?.youtubeId}?autoplay=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <div className="p-4 text-white">
          <h1 className="text-xl font-heading font-bold mb-2">{video?.title}</h1>
          <p className="text-sm text-gray-400 mb-4">{video?.channelName} • {video?.duration}</p>
          <p className="text-sm text-gray-200">{video?.description}</p>
        </div>
        
        <div className="p-4 mt-4 border-t border-gray-800">
          <h3 className="font-heading font-bold text-white mb-4">More Videos</h3>
          <div className="flex flex-col gap-4 pb-20">
            {filteredVideos.filter(v => v.id !== activeVideo).map(v => (
              <button key={v.id} onClick={() => setActiveVideo(v.id)} className="flex gap-3 text-left active:scale-95 transition-transform">
                <div className="w-32 aspect-video bg-gray-800 rounded-lg overflow-hidden shrink-0">
                  <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white line-clamp-2">{v.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">{v.channelName}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Back Button Overlay */}
        <button 
          onClick={() => setActiveVideo(null)} 
          className="fixed top-4 left-4 z-50 bg-black/50 backdrop-blur text-white px-4 py-2 rounded-full font-bold text-sm border border-white/20 active:scale-95"
        >
          Close Video
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-4xl mx-auto min-h-screen">
      <header className="sticky top-0 bg-background/90 backdrop-blur-md z-10 pt-4 pb-2 -mx-4 px-4">
        <h1 className="text-2xl font-heading font-bold mb-4">Guru TV</h1>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => setActiveSubject('All')}
            className={cn(
              "whitespace-nowrap px-4 py-1.5 rounded-full font-bold text-sm transition-colors border",
              activeSubject === 'All' ? "bg-primary text-white border-primary" : "bg-card border-border text-foreground/70"
            )}
          >
            All Subjects
          </button>
          {subjectsToFilter.map(sub => (
            <button
              key={sub.id}
              onClick={() => setActiveSubject(sub.id)}
              className={cn(
                "whitespace-nowrap px-4 py-1.5 rounded-full font-bold text-sm transition-colors border",
                activeSubject === sub.id ? "bg-primary text-white border-primary" : "bg-card border-border text-foreground/70"
              )}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-col p-4 gap-6">
        {filteredVideos.map(video => (
          <div key={video.id} onClick={() => setActiveVideo(video.id)} className="cursor-pointer group">
            <div className="relative w-full aspect-video bg-card rounded-2xl overflow-hidden mb-3 border border-border shadow-sm group-active:scale-[0.98] transition-transform">
              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayCircle className="w-16 h-16 text-white" />
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                {video.duration}
              </div>
            </div>
            <div className="flex px-1">
              <div className="flex-1">
                <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">{video.title}</h3>
                <p className="text-xs text-foreground/60 font-medium">{video.channelName} • {mockSubjects.find(s=>s.id===video.subjectId)?.name}</p>
              </div>
            </div>
          </div>
        ))}
        {filteredVideos.length === 0 && (
          <div className="text-center py-20 text-foreground/50 font-medium">No videos found for this subject.</div>
        )}
      </div>
    </div>
  );
}
