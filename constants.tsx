import React from 'react';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudFog, 
  CloudDrizzle, 
  CloudRain, 
  Snowflake, 
  CloudLightning,
  Moon,
  CloudMoon
} from 'lucide-react';

export const WMO_CODES: Record<number, { label: string; icon: (isDay: boolean) => React.ReactNode }> = {
  0: { 
    label: 'Clear sky', 
    icon: (isDay) => isDay ? <Sun className="w-full h-full text-yellow-400" /> : <Moon className="w-full h-full text-slate-300" /> 
  },
  1: { 
    label: 'Mainly clear', 
    icon: (isDay) => isDay ? <Sun className="w-full h-full text-yellow-300" /> : <Moon className="w-full h-full text-slate-300" />
  },
  2: { 
    label: 'Partly cloudy', 
    icon: (isDay) => isDay ? <CloudSun className="w-full h-full text-orange-300" /> : <CloudMoon className="w-full h-full text-slate-400" />
  },
  3: { 
    label: 'Overcast', 
    icon: () => <Cloud className="w-full h-full text-gray-400" /> 
  },
  45: { label: 'Fog', icon: () => <CloudFog className="w-full h-full text-slate-400" /> },
  48: { label: 'Depositing rime fog', icon: () => <CloudFog className="w-full h-full text-slate-400" /> },
  51: { label: 'Light drizzle', icon: () => <CloudDrizzle className="w-full h-full text-blue-300" /> },
  53: { label: 'Moderate drizzle', icon: () => <CloudDrizzle className="w-full h-full text-blue-400" /> },
  55: { label: 'Dense drizzle', icon: () => <CloudDrizzle className="w-full h-full text-blue-500" /> },
  61: { label: 'Slight rain', icon: () => <CloudRain className="w-full h-full text-blue-400" /> },
  63: { label: 'Moderate rain', icon: () => <CloudRain className="w-full h-full text-blue-500" /> },
  65: { label: 'Heavy rain', icon: () => <CloudRain className="w-full h-full text-blue-600" /> },
  71: { label: 'Slight snow', icon: () => <Snowflake className="w-full h-full text-cyan-200" /> },
  73: { label: 'Moderate snow', icon: () => <Snowflake className="w-full h-full text-cyan-300" /> },
  75: { label: 'Heavy snow', icon: () => <Snowflake className="w-full h-full text-cyan-400" /> },
  95: { label: 'Thunderstorm', icon: () => <CloudLightning className="w-full h-full text-purple-400" /> },
  96: { label: 'Thunderstorm with hail', icon: () => <CloudLightning className="w-full h-full text-purple-500" /> },
  99: { label: 'Heavy thunderstorm', icon: () => <CloudLightning className="w-full h-full text-purple-600" /> },
};

export const DEFAULT_LOCATION = {
  name: "New Delhi",
  latitude: 28.6139,
  longitude: 77.2090,
  country: "India"
};