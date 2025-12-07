import React, { useId } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, YAxis } from 'recharts';
import { HourlyForecast } from '../types';

interface ForecastChartProps {
  hourly: HourlyForecast;
}

const ForecastChart: React.FC<ForecastChartProps> = ({ hourly }) => {
  const gradientId = useId();
  // Process data for the next 24 hours
  const currentHourIndex = new Date().getHours();
  // Ensure we don't crash if data is shorter than expected
  const maxIndex = Math.min(currentHourIndex + 24, hourly.time.length);
  
  const data = hourly.time.slice(currentHourIndex, maxIndex).map((time, i) => ({
    time: new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
    temp: Math.round(hourly.temperature_2m[currentHourIndex + i]),
    precip: hourly.precipitation_probability[currentHourIndex + i]
  }));

  return (
    <div className="w-full bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex flex-col h-full">
      <h3 className="text-lg font-semibold text-white mb-6">24-Hour Forecast</h3>
      {/* Container is flex-1 to fill remaining vertical space */}
      <div className="w-full flex-1 min-w-0 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              interval={3}
            />
            <YAxis 
               hide={true} 
               domain={['dataMin - 2', 'dataMax + 2']} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="temp" 
              stroke="#60a5fa" 
              strokeWidth={3}
              fillOpacity={1} 
              fill={`url(#${gradientId})`} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ForecastChart;