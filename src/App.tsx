import React, { useState } from 'react';
import styled from 'styled-components';
import SearchBox from './components/SearchBox';
import CitationResult from './components/CitationResult';
import { fetchRepositoryData, generateCitation } from './services/repoService';
import { Citation } from './types';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #ffffff;
  padding: 3rem 1rem;
`;

const Header = styled.header`
  margin-bottom: 4rem;
  text-align: center;
`;

const Logo = styled.h1`
  font-size: 3.5rem;
  color: #111;
  margin-bottom: 0.5rem;
  font-weight: 800;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.05em;
  
  span {
    color: #0066ff;
  }
`;

const Tagline = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0;
  font-weight: 400;
`;

const ErrorMessage = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background: #ffebee;
  color: #c62828;
  border-radius: 12px;
  max-width: 700px;
  text-align: center;
`;

const Footer = styled.footer`
  margin-top: auto;
  padding: 2rem 0;
  text-align: center;
  color: #888;
  font-size: 0.85rem;
`;

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [citation, setCitation] = useState<Citation | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleSearch = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setCitation(null);
    
    try {
      const repoData = await fetchRepositoryData(url);
      const newCitation = generateCitation(repoData);
      setCitation(newCitation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AppContainer>
      <Header>
        <Logo>
          Git<span>Cite</span>
        </Logo>
        <Tagline>Generate BibTeX citations for GitHub and GitLab repositories</Tagline>
      </Header>
      
      <SearchBox onSearch={handleSearch} isLoading={isLoading} />
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {citation && <CitationResult citation={citation} />}
      
      <Footer>
        &copy; {2025} Daniel Murnane
      </Footer>
    </AppContainer>
  );
};

export default App;
