import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { day: 'Mon', minutes: 45, score: 85 },
  { day: 'Tue', minutes: 60, score: 90 },
  { day: 'Wed', minutes: 30, score: 80 },
  { day: 'Thu', minutes: 90, score: 95 },
  { day: 'Fri', minutes: 50, score: 88 },
  { day: 'Sat', minutes: 120, score: 98 },
  { day: 'Sun', minutes: 40, score: 85 },
];

export function ActivityChart() {
  return (
    <div className="card p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex flex-col">
        <h2 className="font-heading font-bold text-xl flex items-center gap-2">
          <span>📈</span> Weekly Activity
        </h2>
        <p className="text-sm font-medium text-foreground/70">
          Learning time and mastery score
        </p>
      </div>

      <div className="h-64 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-foreground/70" />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-foreground/70" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                borderColor: 'hsl(var(--border))',
                borderRadius: '12px',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
              }} 
            />
            <Area
              type="monotone"
              dataKey="minutes"
              name="Study Time (min)"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorMinutes)"
            />
            <Area
              type="monotone"
              dataKey="score"
              name="Mastery Score"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorScore)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
