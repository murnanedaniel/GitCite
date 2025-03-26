// Use the actual GA measurement ID from the 404 page
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
  try {
    // Check if GA script is already loaded
    if (document.getElementById('ga-script')) {
      console.log('Google Analytics script already loaded');
      return;
    }

    console.log('Initializing Google Analytics with ID:', GA_MEASUREMENT_ID);
    
    // Load Google Analytics script
    const script = document.createElement('script');
    script.id = 'ga-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    
    // Define gtag function as a property of window
    window.gtag = function(...args: any[]) {
      window.dataLayer.push(arguments);
      console.log('GA Event:', args);
    };
    
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: true,
      cookie_domain: 'gitcite.com',
      cookie_flags: 'SameSite=None;Secure'
    });
    
    console.log('Google Analytics initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Google Analytics:', error);
  }
};

// Track page view
export const trackPageView = (title?: string, path?: string) => {
  try {
    if (!window.gtag) {
      console.warn('Google Analytics not initialized, cannot track page view');
      return;
    }
    
    const pageData = {
      page_title: title || document.title,
      page_location: path || window.location.href,
      page_path: path || window.location.pathname
    };
    
    console.log('Tracking page view:', pageData);
    window.gtag('event', 'page_view', pageData);
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
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