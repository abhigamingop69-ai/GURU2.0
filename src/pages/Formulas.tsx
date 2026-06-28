import React, { useState } from 'react';
import { ArrowLeft, Search, Bookmark, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { audio } from '../lib/audio';

type FormulaCategory = 'math' | 'physics' | 'chemistry';

const FORMULAS = {
  math: [
    { title: 'Quadratic Formula', formula: 'x = (-b ± √(b² - 4ac)) / 2a', desc: 'Solves quadratic equations of the form ax² + bx + c = 0' },
    { title: 'Pythagorean Theorem', formula: 'a² + b² = c²', desc: 'Relates the sides of a right triangle' },
    { title: 'Area of a Circle', formula: 'A = πr²', desc: 'Area of a circle with radius r' },
    { title: 'Euler\'s Formula', formula: 'e^(iπ) + 1 = 0', desc: 'Relates the fundamental mathematical constants' },
    { title: 'Slope of a Line', formula: 'm = (y₂ - y₁) / (x₂ - x₁)', desc: 'Finds the slope of a line given two points' }
  ],
  physics: [
    { title: 'Newton\'s Second Law', formula: 'F = ma', desc: 'Force equals mass times acceleration' },
    { title: 'Kinetic Energy', formula: 'KE = ½mv²', desc: 'Energy of mass m in motion with velocity v' },
    { title: 'Ohm\'s Law', formula: 'V = IR', desc: 'Voltage equals current times resistance' },
    { title: 'Einstein\'s Mass-Energy', formula: 'E = mc²', desc: 'Equivalence of mass and energy' },
    { title: 'Work', formula: 'W = Fd cos(θ)', desc: 'Work done by force F over distance d' }
  ],
  chemistry: [
    { title: 'Ideal Gas Law', formula: 'PV = nRT', desc: 'Equation of state of a hypothetical ideal gas' },
    { title: 'Molarity', formula: 'M = n / V', desc: 'Moles of solute per liter of solution' },
    { title: 'pH', formula: 'pH = -log[H⁺]', desc: 'Measure of acidity or basicity' },
    { title: 'Density', formula: 'd = m / V', desc: 'Mass per unit volume' },
    { title: 'Rate Law', formula: 'Rate = k[A]^m[B]^n', desc: 'Equation linking reaction rate with concentrations' }
  ]
};

export default function Formulas() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FormulaCategory>('math');
  const [searchTerm, setSearchTerm] = useState('');

  const currentFormulas = FORMULAS[activeTab].filter(f => 
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col max-w-4xl mx-auto min-h-screen bg-background relative pb-24 md:pb-6">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b-2 border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-card hover:bg-card-foreground/5 flex items-center justify-center transition-colors border-2 border-border">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-heading font-bold text-xl sm:text-2xl">Cheat Sheet</h1>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
          <input
            type="text"
            placeholder="Search formulas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-border bg-card font-medium focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      </header>

      <div className="p-4 flex flex-col gap-6">
        
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(['math', 'physics', 'chemistry'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                audio.playPop();
              }}
              className={cn(
                "px-6 py-2.5 rounded-full font-bold capitalize transition-all border-2 whitespace-nowrap",
                activeTab === tab 
                  ? "bg-primary border-primary text-primary-foreground shadow-md" 
                  : "bg-card border-border hover:bg-card-foreground/5 text-foreground/70"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Formulas List */}
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {currentFormulas.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-12 bg-card rounded-2xl border-2 border-border border-dashed"
              >
                <p className="text-foreground/50 font-bold">No formulas found for "{searchTerm}"</p>
              </motion.div>
            ) : (
              currentFormulas.map((f, i) => (
                <motion.div
                  key={f.title}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className="card p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between group"
                >
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-lg mb-1">{f.title}</h3>
                    <p className="text-foreground/70 text-sm font-medium">{f.desc}</p>
                  </div>
                  
                  <div className="bg-primary/10 border-2 border-primary/20 rounded-xl px-6 py-4 flex items-center justify-center min-w-[200px]">
                    <span className="font-mono font-bold text-lg text-primary text-center">
                      {f.formula}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
