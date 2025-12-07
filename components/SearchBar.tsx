import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { searchLocation } from '../services/weatherService';
import { GeoLocation } from '../types';

interface SearchBarProps {
  onLocationSelect: (location: GeoLocation) => void;
  onCurrentLocationRequest: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onLocationSelect, onCurrentLocationRequest }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        const locations = await searchLocation(query);
        setResults(locations);
        setIsLoading(false);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (location: GeoLocation) => {
    onLocationSelect(location);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md z-50">
      <div className="relative">
        <input
          type="text"
          className="w-full pl-10 pr-12 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-lg transition-all"
          placeholder="Search city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          autoComplete="off"
        />
        <Search className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
        
        <button 
          onClick={onCurrentLocationRequest}
          className="absolute right-2 top-2 p-1.5 hover:bg-white/10 rounded-xl transition-colors text-blue-400 hover:text-blue-300"
          title="Use current location"
        >
          <MapPin className="h-5 w-5" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute w-full mt-2 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 flex justify-center text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((location, index) => (
                <li 
                  key={`${location.latitude}-${location.longitude}-${index}`}
                  onClick={() => handleSelect(location)}
                  className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors border-b border-white/5 last:border-0"
                >
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-white font-medium">{location.name}</span>
                    <span className="text-xs text-gray-400">
                      {[location.admin1, location.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                  {location.country && (
                    <img 
                      src={`https://hatscripts.github.io/circle-flags/flags/${location.country.toLowerCase().slice(0, 2) === 'uk' ? 'gb' : location.country.toLowerCase().slice(0, 2)}.svg`} 
                      alt={`${location.country} flag`}
                      className="w-4 h-4 ml-auto rounded-full opacity-70"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">No locations found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;