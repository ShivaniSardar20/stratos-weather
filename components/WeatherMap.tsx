import React, { useEffect, useRef } from 'react';
import { map, tileLayer, marker, divIcon, Map as LeafletMap, Marker as LeafletMarker, TooltipOptions } from 'leaflet';

interface WeatherMapProps {
  lat: number;
  lon: number;
  locationName: string;
  temperature: number;
  condition: string;
}

const WeatherMap: React.FC<WeatherMapProps> = ({ lat, lon, locationName, temperature, condition }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const initialCoords = useRef({ lat, lon });

  // Tooltip configuration
  const getTooltipContent = (name: string, temp: number, cond: string) => `
    <div style="font-family: 'Inter', sans-serif; text-align: center; min-width: 120px;">
      <div style="font-weight: 600; color: #0f172a; margin-bottom: 4px; font-size: 14px;">${name}</div>
      <div style="color: #64748b; font-size: 13px; font-weight: 500;">
        <span style="color: #3b82f6; font-weight: 700;">${Math.round(temp)}°</span>
        <span style="margin: 0 4px;">•</span>
        ${cond}
      </div>
    </div>
  `;

  const tooltipOptions: TooltipOptions = {
    direction: 'top',
    offset: [0, -20],
    opacity: 1,
    className: 'custom-leaflet-tooltip' // Class for custom styling if needed
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const { lat: initLat, lon: initLon } = initialCoords.current;

    // Initialize map
    mapRef.current = map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: true
    }).setView([initLat, initLon], 12);

    // Dark theme tiles
    tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(mapRef.current);

    // Custom marker icon
    const icon = divIcon({
        className: 'custom-pin',
        html: `<div style="background-color: #3b82f6; width: 1.5rem; height: 1.5rem; border-radius: 9999px; border: 3px solid white; box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    // Create marker and bind initial tooltip
    markerRef.current = marker([initLat, initLon], { icon })
      .addTo(mapRef.current)
      .bindTooltip(
        getTooltipContent(locationName, temperature, condition),
        tooltipOptions
      );
    
    // Invalidate size on init to handle layout changes
    setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 200);

    return () => {
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
    };
  }, []);

  // Update marker position and tooltip content when props change
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
        mapRef.current.flyTo([lat, lon], 12, { duration: 2 });
        markerRef.current.setLatLng([lat, lon]);
        
        const content = getTooltipContent(locationName, temperature, condition);
        
        const tooltip = markerRef.current.getTooltip();
        if (tooltip) {
             markerRef.current.setTooltipContent(content);
        } else {
             markerRef.current.bindTooltip(content, tooltipOptions);
        }
    }
  }, [lat, lon, locationName, temperature, condition]);

  return (
    <div className="w-full h-full min-h-[20rem] bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden relative z-0 shadow-lg group">
         <div ref={mapContainerRef} className="w-full h-full z-10 relative outline-none" />
         
         <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-3xl z-20"></div>
         
         <div className="absolute bottom-4 left-4 z-20 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-lg border border-white/10 text-xs text-gray-400 pointer-events-none">
            Map data &copy; OpenStreetMap
         </div>
    </div>
  );
};

export default WeatherMap;