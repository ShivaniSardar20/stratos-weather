import { GeoLocation, WeatherData } from '../types';

const GEO_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

export const searchLocation = async (query: string): Promise<GeoLocation[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    const response = await fetch(`${GEO_API_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
    const data = await response.json();
    
    if (!data.results) return [];
    
    return data.results.map((item: any) => ({
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      country: item.country,
      admin1: item.admin1
    }));
  } catch (error) {
    console.error("Error searching location:", error);
    return [];
  }
};

export const getWeatherData = async (lat: number, lon: number, locationName: string): Promise<WeatherData> => {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,is_day',
    hourly: 'temperature_2m,precipitation_probability,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset',
    timezone: 'auto',
    forecast_days: '10'
  });

  const response = await fetch(`${WEATHER_API_URL}?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  const data = await response.json();

  return {
    location: {
      name: locationName,
      latitude: lat,
      longitude: lon,
    },
    current: {
      temperature: data.current.temperature_2m,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      weatherCode: data.current.weather_code,
      isDay: data.current.is_day,
      time: data.current.time,
      humidity: data.current.relative_humidity_2m
    },
    hourly: data.hourly,
    daily: data.daily
  };
};