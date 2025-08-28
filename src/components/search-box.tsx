"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBoxProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  initialQuery?: string;
}

export function SearchBox({ onSearch, onClear, initialQuery = "" }: SearchBoxProps) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=0`);
        const data = await response.json();
        
        if (data.success && data.suggestions) {
          setSuggestions(data.suggestions);
        }
      } catch (error) {
        console.error('제안 검색 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;
    
    setShowSuggestions(false);
    onSearch(finalQuery.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    onClear();
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="키워드, 기술명, 작가명으로 검색해보세요..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          className="pl-12 pr-20 py-6 text-lg rounded-full border-2 border-gray-200 bg-white focus:border-[#DAA63E] focus:outline-none transition-all"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          <Button
            onClick={() => handleSearch()}
            disabled={!query.trim() || isLoading}
            className="bg-[#DAA63E] hover:bg-[#C4953A] text-white px-6 py-2 rounded-full"
          >
            {isLoading ? '검색 중...' : '검색'}
          </Button>
        </div>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border-2 border-gray-200 z-50 max-h-64 overflow-y-auto">
          <div className="py-2">
            <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              추천 검색어
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <Search className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700">{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop to close suggestions */}
      {showSuggestions && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}