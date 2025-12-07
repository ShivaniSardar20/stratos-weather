import React from 'react';
import { Wind, Droplets, ArrowUp, ArrowDown, Sunrise, Sunset } from 'lucide-react';
import { WeatherData } from '../types';
import { WMO_CODES } from '../constants';

interface CurrentWeatherProps {
  data: WeatherData;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ data }) => {
  const { current, daily, location } = data;
  const weatherInfo = WMO_CODES[current.weatherCode];
  const Icon = weatherInfo ? weatherInfo.icon(!!current.isDay) : WMO_CODES[0].icon(true);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  return (
    <div className="w-full bg-white/5 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/10 shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
        
        {/* Main Info */}
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold text-white tracking-tight">{location.name}</h2>
          <p className="text-blue-200 text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          
          <div className="mt-6 flex flex-col items-center md:items-start">
            <h1 className="text-7xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
              {Math.round(current.temperature)}°
            </h1>
            <p className="text-xl text-blue-100 font-medium mt-2">{weatherInfo?.label}</p>
          </div>
        </div>

        {/* Visual Icon */}
        <div className="w-40 h-40 md:w-56 md:h-56 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-pulse-slow">
          {Icon}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center min-w-[100px]">
            <Wind className="w-6 h-6 text-blue-300 mb-2" />
            <span className="text-sm text-gray-400">Wind</span>
            <span className="text-lg font-semibold text-white">{current.windSpeed} <span className="text-xs font-normal">km/h</span></span>
          </div>
          
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center min-w-[100px]">
            <Droplets className="w-6 h-6 text-blue-300 mb-2" />
            <span className="text-sm text-gray-400">Humidity</span>
            <span className="text-lg font-semibold text-white">{current.humidity}<span className="text-xs font-normal">%</span></span>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center min-w-[100px]">
            <ArrowUp className="w-6 h-6 text-orange-400 mb-2" />
            <span className="text-sm text-gray-400">High</span>
            <span className="text-lg font-semibold text-white">{Math.round(daily.temperature_2m_max[0])}°</span>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center min-w-[100px]">
            <ArrowDown className="w-6 h-6 text-cyan-400 mb-2" />
            <span className="text-sm text-gray-400">Low</span>
            <span className="text-lg font-semibold text-white">{Math.round(daily.temperature_2m_min[0])}°</span>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center min-w-[100px]">
            <Sunrise className="w-6 h-6 text-yellow-300 mb-2" />
            <span className="text-sm text-gray-400">Sunrise</span>
            <span className="text-lg font-semibold text-white">{formatTime(daily.sunrise[0])}</span>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center min-w-[100px]">
            <Sunset className="w-6 h-6 text-orange-300 mb-2" />
            <span className="text-sm text-gray-400">Sunset</span>
            <span className="text-lg font-semibold text-white">{formatTime(daily.sunset[0])}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;