import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { suggestRepositories } from '../services/repoService';

const SearchContainer = styled.div`
  width: 100%;
  max-width: 600px;
  position: relative;
`;

const InputWrapper = styled.div`
  display: flex;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 16px 20px;
  font-size: 16px;
  border: none;
  outline: none;
  font-family: 'Inter', sans-serif;
  
  &::placeholder {
    color: #aaa;
  }
`;

const SearchButton = styled.button`
  background: #4285f4;
  color: white;
  padding: 0 24px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #3367d6;
  }
  
  &:disabled {
    background: #aaa;
    cursor: not-allowed;
  }
`;

const SuggestionsList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin: 4px 0 0;
  padding: 0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: white;
  list-style: none;
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
`;

const SuggestionItem = styled.li`
  padding: 12px 16px;
  cursor: pointer;
  
  &:hover {
    background: #f1f3f4;
  }
`;

interface SearchBoxProps {
  onSearch: (url: string) => void;
  isLoading: boolean;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }
    
    if (inputValue.length >= 3) {
      suggestionTimeoutRef.current = setTimeout(async () => {
        const results = await suggestRepositories(inputValue);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    
    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, [inputValue]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue);
    }
  };
  
  const handleSelectSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };
  
  return (
    <SearchContainer ref={searchContainerRef}>
      <form onSubmit={handleSubmit}>
        <InputWrapper>
          <SearchInput
            type="text"
            placeholder="Enter GitHub or GitLab repository URL (e.g., github.com/user/repo)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          />
          <SearchButton type="submit" disabled={!inputValue.trim() || isLoading}>
            {isLoading ? 'Loading...' : 'Cite'}
          </SearchButton>
        </InputWrapper>
      </form>
      
      {showSuggestions && (
        <SuggestionsList>
          {suggestions.map((suggestion, index) => (
            <SuggestionItem
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              {suggestion}
            </SuggestionItem>
          ))}
        </SuggestionsList>
      )}
    </SearchContainer>
  );
};

export default SearchBox; 