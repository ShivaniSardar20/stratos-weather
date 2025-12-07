import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIInsightProps {
  insight: string | null;
  loading: boolean;
}

const AIInsight: React.FC<AIInsightProps> = ({ insight, loading }) => {
  return (
    <div className="w-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-md rounded-3xl p-6 border border-indigo-500/30 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
        <Sparkles className="w-16 h-16 text-indigo-400" />
      </div>
      
      <div className="flex items-start gap-4 relative z-10">
        <div className="bg-indigo-500/20 p-3 rounded-xl shrink-0">
          <Sparkles className="w-6 h-6 text-indigo-300" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-indigo-200 font-semibold text-sm uppercase tracking-wider mb-1">Stratos Insight</h3>
          {loading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-indigo-400/20 rounded w-3/4"></div>
                <div className="h-4 bg-indigo-400/20 rounded w-1/2"></div>
              </div>
            </div>
          ) : (
            <p className="text-white leading-relaxed font-medium text-lg">
              {insight || "Analyzing atmospheric conditions..."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsight;