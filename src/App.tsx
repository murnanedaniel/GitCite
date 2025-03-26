import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SearchBox from './components/SearchBox';
import CitationResult from './components/CitationResult';
import { fetchRepositoryData, generateCitation } from './services/repoService';
import { Citation } from './types';
import { 
  initializeAnalytics, 
  trackPageView, 
  trackCitationGeneration, 
  trackError 
} from './services/analyticsService';

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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
`;

const IconLink = styled.a`
  color: #666;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #0066ff;
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [citation, setCitation] = useState<Citation | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize analytics when the app loads
  useEffect(() => {
    // Initialize Google Analytics
    initializeAnalytics();
    
    // Track initial page view
    trackPageView();
  }, []);
  
  const handleSearch = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setCitation(null);
    
    try {
      const repoData = await fetchRepositoryData(url);
      const newCitation = generateCitation(repoData);
      setCitation(newCitation);
      
      // Track successful citation generation
      trackCitationGeneration(url, true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      
      // Track error
      trackError(errorMessage, 'fetch_repository');
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
        <div>&copy; {2025} Daniel Murnane</div>
        <FooterLinks>
          <IconLink 
            href="https://danielmurnane.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            title="Daniel Murnane's Website"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </IconLink>
          <IconLink 
            href="https://github.com/murnanedaniel/GitCite" 
            target="_blank" 
            rel="noopener noreferrer" 
            title="GitCite GitHub Repository"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
          </IconLink>
        </FooterLinks>
      </Footer>
    </AppContainer>
  );
};

export default App;
