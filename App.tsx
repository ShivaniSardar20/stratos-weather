import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GeoLocation, WeatherData, LoadingState } from './types';
import { getWeatherData } from './services/weatherService';
import { getGeminiInsight } from './services/geminiService';
import { DEFAULT_LOCATION, WMO_CODES } from './constants';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import ForecastChart from './components/ForecastChart';
import AIInsight from './components/AIInsight';
import WeatherMap from './components/WeatherMap';
import { CloudRain, CalendarDays } from 'lucide-react';

const App: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [insight, setInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const fetchInsight = useCallback(async (data: WeatherData) => {
    try {
      setInsightLoading(true);
      const text = await getGeminiInsight(data);
      setInsight(text);
    } catch (err) {
      console.error("AI Error", err);
    } finally {
      setInsightLoading(false);
    }
  }, []);

  const fetchWeather = useCallback(async (lat: number, lon: number, name: string) => {
    try {
      setLoadingState(LoadingState.LOADING);
      setInsight(null); // Reset insight
      
      const data = await getWeatherData(lat, lon, name);
      setWeather(data);
      setLoadingState(LoadingState.SUCCESS);

      // Trigger AI Insight after weather loads
      fetchInsight(data);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
    }
  }, [fetchInsight]);

  const handleLocationSelect = (location: GeoLocation) => {
    fetchWeather(location.latitude, location.longitude, location.name);
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoadingState(LoadingState.LOADING);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude, "Current Location");
        },
        (error) => {
          console.error(error);
          setLoadingState(LoadingState.ERROR);
          alert("Could not retrieve location. Please check permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Determine dynamic background styles
  const theme = useMemo(() => {
    const baseTheme = {
      bg: "from-slate-900 via-[#0f172a] to-black",
      orb1: "bg-blue-600/20",
      orb2: "bg-purple-600/10",
      duration: "8s",
      opacity: "opacity-40"
    };

    if (!weather) return baseTheme;

    const code = weather.current.weatherCode;
    const isDay = !!weather.current.isDay;
    const windSpeed = weather.current.windSpeed;

    let selectedTheme = { ...baseTheme };

    // Clear Sky (0, 1)
    if (code <= 1) {
      if (isDay) {
        selectedTheme = { 
          bg: "from-sky-400 via-blue-600 to-indigo-900",
          orb1: "bg-yellow-400/30",
          orb2: "bg-orange-300/20",
          duration: "10s",
          opacity: "opacity-60"
        };
      } else {
        selectedTheme = { 
          bg: "from-slate-950 via-indigo-950 to-black",
          orb1: "bg-indigo-500/20",
          orb2: "bg-purple-900/20",
          duration: "8s",
          opacity: "opacity-40"
        };
      }
    }
    // Cloudy (2, 3)
    else if (code <= 3) {
      selectedTheme = isDay 
        ? { 
            bg: "from-slate-300 via-slate-500 to-slate-700",
            orb1: "bg-white/20",
            orb2: "bg-blue-200/10",
            duration: "15s",
            opacity: "opacity-30"
          }
        : { 
            bg: "from-slate-800 via-gray-900 to-black",
            orb1: "bg-slate-600/10",
            orb2: "bg-gray-700/10",
            duration: "12s",
            opacity: "opacity-20"
          };
    }
    // Fog (45, 48)
    else if (code <= 48) {
      selectedTheme = {
        bg: isDay ? "from-gray-300 via-slate-400 to-slate-600" : "from-gray-900 via-slate-900 to-black",
        orb1: "bg-gray-400/20",
        orb2: "bg-slate-300/10",
        duration: "20s",
        opacity: "opacity-50"
      };
    }
    // Rain / Drizzle (51-67, 80-82)
    else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
      const isHeavy = [55, 65, 67, 82].includes(code);
      selectedTheme = {
        bg: "from-blue-900 via-slate-900 to-black",
        orb1: isHeavy ? "bg-blue-600/40" : "bg-blue-500/30",
        orb2: isHeavy ? "bg-cyan-600/30" : "bg-cyan-600/20",
        duration: isHeavy ? "3s" : "5s",
        opacity: isHeavy ? "opacity-60" : "opacity-40"
      };
    }
    // Snow (71-77, 85, 86)
    else if ([71, 73, 75, 77, 85, 86].includes(code)) {
      selectedTheme = {
        bg: "from-slate-800 via-blue-950 to-slate-950",
        orb1: "bg-white/10",
        orb2: "bg-cyan-300/20",
        duration: "10s",
        opacity: "opacity-50"
      };
    }
    // Thunderstorm (95-99)
    else if (code >= 95) {
      selectedTheme = {
        bg: "from-indigo-950 via-slate-950 to-black",
        orb1: "bg-purple-600/30",
        orb2: "bg-fuchsia-600/20",
        duration: "2s",
        opacity: "opacity-70"
      };
    }

    // --- Wind Adjustment ---
    // High winds make background elements move faster and appear slightly more intense
    let durationValue = parseInt(selectedTheme.duration);

    if (windSpeed > 35) {
      // Strong winds (>35km/h): Very fast movement, bump opacity
      durationValue = Math.min(durationValue, 3);
      if (selectedTheme.opacity === "opacity-20") selectedTheme.opacity = "opacity-40";
      else if (selectedTheme.opacity === "opacity-30") selectedTheme.opacity = "opacity-50";
      else if (selectedTheme.opacity === "opacity-40") selectedTheme.opacity = "opacity-60";
    } else if (windSpeed > 20) {
      // Moderate winds (>20km/h): Faster movement
      durationValue = Math.min(durationValue, 6);
    } else if (windSpeed > 10) {
      // Breezy (>10km/h): Ensure it's not stagnant (max 10s)
      durationValue = Math.min(durationValue, 10);
    }

    return { ...selectedTheme, duration: `${durationValue}s` };
  }, [weather]);

  // Initial load
  useEffect(() => {
    fetchWeather(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude, DEFAULT_LOCATION.name);
  }, [fetchWeather]);

  return (
    <div className={`min-h-screen w-full bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${theme.bg} text-white p-4 md:p-8 overflow-x-hidden transition-all duration-1000 ease-in-out`}>
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] animate-pulse transition-all duration-1000 ${theme.orb1} ${theme.opacity}`} 
          style={{ animationDuration: theme.duration }}
        />
        <div 
          className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] animate-pulse transition-all duration-1000 ${theme.orb2} ${theme.opacity}`} 
          style={{ animationDuration: theme.duration, animationDelay: '1s' }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <CloudRain className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Stratos Weather</h1>
              <p className="text-xs text-blue-300 uppercase tracking-widest font-semibold">AI Weather Assistant</p>
            </div>
          </div>
          <SearchBar 
            onLocationSelect={handleLocationSelect} 
            onCurrentLocationRequest={handleCurrentLocation}
          />
        </header>

        {/* Main Content */}
        {loadingState === LoadingState.LOADING && !weather ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-blue-200 animate-pulse">Scanning the skies...</p>
          </div>
        ) : loadingState === LoadingState.ERROR ? (
          <div className="text-center p-12 bg-red-500/10 border border-red-500/20 rounded-3xl">
            <p className="text-red-200 text-lg">Failed to load weather data. Please try again.</p>
            <button 
              onClick={() => fetchWeather(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude, DEFAULT_LOCATION.name)}
              className="mt-4 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        ) : weather ? (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <CurrentWeather data={weather} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <div className="lg:col-span-1">
                 <ForecastChart hourly={weather.hourly} />
              </div>
              <div className="lg:col-span-1">
                 <WeatherMap 
                   lat={weather.location.latitude} 
                   lon={weather.location.longitude} 
                   locationName={weather.location.name}
                   temperature={weather.current.temperature}
                   condition={WMO_CODES[weather.current.weatherCode]?.label || 'Unknown'}
                 />
              </div>
              <div className="md:col-span-2 lg:col-span-1 flex flex-col gap-6">
                 <AIInsight insight={insight} loading={insightLoading} />
                 
                 {/* Daily Forecast - Enhanced Layout */}
                 <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex-1 flex flex-col min-h-[400px]">
                    <div className="flex items-center gap-2 mb-6">
                      <CalendarDays className="w-5 h-5 text-blue-300" />
                      <h3 className="text-lg font-semibold text-white">7-Day Forecast</h3>
                    </div>
                    
                    <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                      {weather.daily.time.slice(1, 8).map((time, i) => {
                         const idx = i + 1;
                         const date = new Date(time);
                         const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                         const shortDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                         const code = weather.daily.weather_code[idx];
                         const DailyIcon = WMO_CODES[code] ? WMO_CODES[code].icon(true) : WMO_CODES[0].icon(true);
                         
                         return (
                           <div key={time} className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                             <div className="flex flex-col min-w-[80px]">
                               <span className="text-white font-medium">{dayName}</span>
                               <span className="text-xs text-gray-400">{shortDate}</span>
                             </div>
                             
                             <div className="flex items-center gap-4">
                                <div className="w-8 h-8 flex items-center justify-center opacity-80">
                                   {DailyIcon}
                                </div>

                                <div className="flex flex-col items-end w-12">
                                  <span className="text-lg font-bold text-white">{Math.round(weather.daily.temperature_2m_max[idx])}°</span>
                                  <span className="text-xs text-gray-400">High</span>
                                </div>
                                <div className="w-px h-8 bg-white/10"></div>
                                <div className="flex flex-col items-end w-8">
                                  <span className="text-base font-medium text-gray-300">{Math.round(weather.daily.temperature_2m_min[idx])}°</span>
                                  <span className="text-xs text-gray-500">Low</span>
                                </div>
                             </div>
                           </div>
                         )
                      })}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        ) : null}
        
        <footer className="mt-16 text-center text-gray-500 text-sm pb-8">
          <p>Weather AI Assistance (2025) | Created by Human | Powered by Open-Meteo & Google Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;