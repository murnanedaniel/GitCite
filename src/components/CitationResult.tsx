import React, { useState } from 'react';
import styled from 'styled-components';
import copy from 'clipboard-copy';
import { Citation } from '../types';

const ResultContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin-top: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ResultHeader = styled.div`
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
`;

const Title = styled.h3`
  margin: 0;
  color: #333;
  font-weight: 500;
`;

const SubTitle = styled.div`
  margin-top: 4px;
  font-size: 14px;
  color: #666;
`;

const CodeBlock = styled.div`
  position: relative;
  padding: 20px;
  background: #f6f8fa;
  border-radius: 4px;
  margin: 20px;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #24292e;
`;

const CopyButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #f1f3f4;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #e8eaed;
  }
`;

const CopyMessage = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #4caf50;
  color: white;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
`;

interface CitationResultProps {
  citation: Citation;
}

const CitationResult: React.FC<CitationResultProps> = ({ citation }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    copy(citation.bibtexString);
    setCopied(true);
    
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