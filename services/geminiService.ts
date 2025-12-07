import { GoogleGenAI } from "@google/genai";
import { WeatherData } from '../types';
import { WMO_CODES } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiInsight = async (weather: WeatherData): Promise<string> => {
  const model = 'gemini-2.5-flash';

  const currentWeatherDesc = WMO_CODES[weather.current.weatherCode]?.label || 'Unknown';
  
  // Construct a concise context for the AI
  const context = `
    Location: ${weather.location.name}
    Current Temp: ${weather.current.temperature}°C
    Condition: ${currentWeatherDesc}
    Humidity: ${weather.current.humidity}%
    Wind: ${weather.current.windSpeed} km/h
    Today's High: ${weather.daily.temperature_2m_max[0]}°C
    Today's Low: ${weather.daily.temperature_2m_min[0]}°C
    Is Day: ${weather.current.isDay ? 'Yes' : 'No'}
  `;

  const prompt = `
    You are a witty, friendly, and helpful weather AI assistant. 
    Based on the following weather data, provide a short paragraph (max 2-3 sentences).
    
    Data:
    ${context}

    Include:
    1. A quick relatable comment about the weather.
    2. A practical outfit recommendation or activity suggestion.
    
    Tone: Fun but useful. No markdown formatting, just plain text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text || "I'm having trouble reading the clouds right now, but stay safe!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Gemini is currently offline. Enjoy the weather!";
  }
};