import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders GitCite application', () => {
  render(<App />);
  const headingElement = screen.getByText((content, element) => {
    return element?.tagName.toLowerCase() === 'h1' && content.includes('Git');
  });
  expect(headingElement).toBeInTheDocument();
});

test('renders subtitle', () => {
  render(<App />);
  const subtitleElement = screen.getByText(/Generate BibTeX citations for GitHub and GitLab repositories/i);
  expect(subtitleElement).toBeInTheDocument();
});
