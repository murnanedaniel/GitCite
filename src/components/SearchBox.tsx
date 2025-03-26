import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { suggestRepositories } from '../services/repoService';

const SearchContainer = styled.div`
  width: 100%;
  max-width: 700px;
  position: relative;
`;

const InputWrapper = styled.div`
  display: flex;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: rgba(0, 0, 0, 0.04) 0px 3px 5px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  transition: all 0.2s ease;
  
  &:focus-within {
    box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 25px -5px;
    border-color: rgba(0, 0, 0, 0.15);
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 20px 24px;
  font-size: 18px;
  border: none;
  outline: none;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  color: #333;
  
  &::placeholder {
    color: #aaa;
  }
`;

const SearchButton = styled.button`
  background: #0066ff;
  color: white;
  padding: 0 32px;
  border: none;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #0052cc;
  }
  
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const SuggestionsList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin: 8px 0 0;
  padding: 8px 0;
  border-radius: 12px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 25px -5px;
  background: white;
  list-style: none;
  z-index: 10;
  max-height: 240px;
  overflow-y: auto;
  border: 1px solid rgba(0, 0, 0, 0.08);
`;

const SuggestionItem = styled.li`
  padding: 12px 24px;
  cursor: pointer;
  font-size: 16px;
  
  &:hover {
    background: #f5f7fa;
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
            placeholder="Enter GitHub or GitLab repository URL"
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