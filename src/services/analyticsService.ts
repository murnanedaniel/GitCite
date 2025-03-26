// Placeholder for Google Analytics measurement ID
// Replace with your actual GA measurement ID when available
const GA_MEASUREMENT_ID = 'G-T6RGHJZ92L'; 

// Event types for tracking
export enum EventType {
  SEARCH = 'search',
  GENERATE_CITATION = 'generate_citation',
  COPY_CITATION = 'copy_citation',
  ERROR = 'error'
}

// Initialize Google Analytics
export const initializeAnalytics = () => {
  // Check if GA script is already loaded
  if (document.getElementById('ga-script')) return;

  // Load Google Analytics script
  const script = document.createElement('script');
  script.id = 'ga-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);

  // Add to window
  window.gtag = gtag;
};

// Track page view
export const trackPageView = (title?: string, path?: string) => {
  if (!window.gtag) return;
  
  window.gtag('event', 'page_view', {
    page_title: title || document.title,
    page_location: path || window.location.href,
    page_path: path || window.location.pathname
  });
};

// Track event
export const trackEvent = (
  eventType: EventType, 
  eventData?: Record<string, any>
) => {
  if (!window.gtag) return;
  
  window.gtag('event', eventType, eventData);
};

// Track citation generation
export const trackCitationGeneration = (repoUrl: string, successful: boolean) => {
  trackEvent(EventType.GENERATE_CITATION, {
    repo_url: repoUrl,
    successful
  });
};

// Track citation copy
export const trackCitationCopy = (repoName: string) => {
  trackEvent(EventType.COPY_CITATION, {
    repo_name: repoName
  });
};

// Track search
export const trackSearch = (query: string) => {
  trackEvent(EventType.SEARCH, {
    search_term: query
  });
};

// Track error
export const trackError = (errorMessage: string, source: string) => {
  trackEvent(EventType.ERROR, {
    error_message: errorMessage,
    source
  });
};

// Add custom typings for window
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
} 