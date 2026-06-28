import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Eraser, Pen, Trash2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function Scratchpad() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(3);
  
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        
        // Save canvas content
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let tempCanvas: HTMLCanvasElement | null = null;
        
        if (ctx) {
          tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          tempCanvas.getContext('2d')?.drawImage(canvas, 0, 0);
        }

        canvas.width = width;
        canvas.height = height;

        // Restore canvas content
        if (ctx && tempCanvas) {
          ctx.drawImage(tempCanvas, 0, 0);
        } else if (ctx) {
          ctx.fillStyle = '#1e1e1e'; // Default background
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = tool === 'eraser' ? '#1e1e1e' : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 3 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'scratchpad.png';
    a.click();
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-background relative">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b-2 border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-card hover:bg-card-foreground/5 flex items-center justify-center transition-colors border-2 border-border">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-heading font-bold text-xl sm:text-2xl">Scratchpad</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={clearCanvas} className="w-10 h-10 rounded-full bg-card hover:bg-red-500/10 hover:text-red-500 flex items-center justify-center transition-colors border-2 border-border" title="Clear">
            <Trash2 className="w-5 h-5" />
          </button>
          <button onClick={downloadCanvas} className="w-10 h-10 rounded-full bg-card hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors border-2 border-border" title="Download">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col p-4 gap-4">
        {/* Toolbar */}
        <div className="card p-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2 bg-background p-1.5 rounded-full border-2 border-border">
            <button 
              onClick={() => setTool('pen')}
              className={cn("p-2 rounded-full transition-colors", tool === 'pen' ? "bg-primary text-primary-foreground" : "hover:bg-card-foreground/10")}
            >
              <Pen className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setTool('eraser')}
              className={cn("p-2 rounded-full transition-colors", tool === 'eraser' ? "bg-primary text-primary-foreground" : "hover:bg-card-foreground/10")}
            >
              <Eraser className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {['#ffffff', '#ef4444', '#3b82f6', '#10b981', '#f59e0b'].map(c => (
              <button
                key={c}
                onClick={() => { setColor(c); setTool('pen'); }}
                className={cn("w-8 h-8 rounded-full border-2 transition-transform", color === c && tool === 'pen' ? "scale-125 border-white shadow-md" : "border-transparent hover:scale-110")}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 bg-background px-4 py-2 rounded-full border-2 border-border">
            <span className="text-sm font-bold text-foreground/70">Size</span>
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={lineWidth} 
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="w-24 accent-primary"
            />
          </div>
        </div>

        {/* Canvas Area */}
        <div ref={containerRef} className="flex-1 rounded-3xl overflow-hidden border-2 border-border shadow-sm bg-[#1e1e1e] relative touch-none">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            onTouchCancel={stopDrawing}
            className="absolute top-0 left-0 w-full h-full cursor-crosshair"
          />
        </div>
      </div>
    </div>
  );
}
