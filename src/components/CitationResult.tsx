import React, { useState } from 'react';
import styled from 'styled-components';
import copy from 'clipboard-copy';
import { Citation } from '../types';
import { trackCitationCopy } from '../services/analyticsService';

const ResultContainer = styled.div`
  width: 100%;
  max-width: 700px;
  margin-top: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: rgba(0, 0, 0, 0.04) 0px 3px 5px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.2s ease;
`;

const ResultHeader = styled.div`
  padding: 24px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
`;

const Title = styled.h3`
  margin: 0;
  color: #111;
  font-weight: 600;
  font-size: 20px;
`;

const SubTitle = styled.div`
  margin-top: 6px;
  font-size: 14px;
  color: #666;
`;

const CodeBlock = styled.div`
  position: relative;
  padding: 24px;
  background: #fcfcfc;
  border-radius: 8px;
  margin: 24px;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #333;
`;

const CopyButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: #f8f9fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f1f3f5;
    border-color: #d0d7de;
  }
`;

const CopyMessage = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: #0066ff;
  color: white;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
`;

interface CitationResultProps {
  citation: Citation;
}

const CitationResult: React.FC<CitationResultProps> = ({ citation }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    copy(citation.bibtexString);
    setCopied(true);
    
    // Track copy event
    trackCitationCopy(citation.title);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  return (
    <ResultContainer>
      <ResultHeader>
        <Title>{citation.title}</Title>
        <SubTitle>
          {`${citation.author} • ${citation.publisher} • ${citation.year}`}
          {citation.version !== 'latest' && ` • ${citation.version}`}
        </SubTitle>
      </ResultHeader>
      
      <CodeBlock>
        {!copied && <CopyButton onClick={handleCopy}>Copy</CopyButton>}
        {copied && <CopyMessage>Copied!</CopyMessage>}
        {citation.bibtexString}
      </CodeBlock>
    </ResultContainer>
  );
};

export default CitationResult; 