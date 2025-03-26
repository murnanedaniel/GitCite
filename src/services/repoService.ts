import axios from 'axios';
import { RepositoryData, Citation } from '../types';

// Extract owner and repo from various URL formats
export const parseRepoUrl = (url: string): { owner: string; repo: string; isGitHub: boolean; gitlabInstance?: string } | null => {
  // GitHub patterns
  const githubPatterns = [
    /github\.com\/([^\/]+)\/([^\/]+)/,           // github.com/owner/repo
    /^([^\/]+)\/([^\/]+)$/,                      // owner/repo format
    /^(https?:\/\/)?github\.com\/([^\/]+)\/([^\/]+)/ // Full GitHub URL
  ];
  
  // GitLab patterns - now supports any GitLab instance
  const gitlabPatterns = [
    /gitlab\.com\/([^\/]+)\/([^\/]+)/,           // gitlab.com/owner/repo
    /^(https?:\/\/)?gitlab\.com\/([^\/]+)\/([^\/]+)/, // Full GitLab.com URL
    /^(https?:\/\/)?gitlab\.([^\/]+)\.([^\/]+)\/([^\/]+)\/([^\/]+)/ // Other GitLab instances like gitlab.cern.ch
  ];
  
  // Try GitHub patterns
  for (const pattern of githubPatterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        owner: match[1] || match[2],
        repo: (match[3] || match[2]).replace(/\.git$/, ''),
        isGitHub: true
      };
    }
  }
  
  // Try GitLab patterns
  for (let i = 0; i < gitlabPatterns.length; i++) {
    const pattern = gitlabPatterns[i];
    const match = url.match(pattern);
    if (match) {
      // Handle GitLab.com
      if (i < 2) {
        return {
          owner: match[2] || match[1],
          repo: (match[3] || match[2]).replace(/\.git$/, ''),
          isGitHub: false,
          gitlabInstance: 'gitlab.com'
        };
      } 
      // Handle other GitLab instances (like gitlab.cern.ch)
      else {
        const domain = `gitlab.${match[2]}.${match[3]}`;
        return {
          owner: match[4],
          repo: match[5].replace(/\.git$/, ''),
          isGitHub: false,
          gitlabInstance: domain
        };
      }
    }
  }
  
  return null;
};

// Helper function to compare version tags
const compareVersions = (a: string, b: string): number => {
  // Remove 'v' prefix if present
  const versionA = a.startsWith('v') ? a.substring(1) : a;
  const versionB = b.startsWith('v') ? b.substring(1) : b;
  
  // Split versions by separators (can handle both dots and hyphens)
  const partsA = versionA.split(/[-\.]/);
  const partsB = versionB.split(/[-\.]/);
  
  // Compare each part numerically if possible
  const maxLength = Math.max(partsA.length, partsB.length);
  
  for (let i = 0; i < maxLength; i++) {
    // Treat missing parts as 0
    const partA = i < partsA.length ? partsA[i] : "0";
    const partB = i < partsB.length ? partsB[i] : "0";
    
    // Try to parse as integers for numeric comparison
    const numA = /^\d+$/.test(partA) ? parseInt(partA, 10) : -1;
    const numB = /^\d+$/.test(partB) ? parseInt(partB, 10) : -1;
    
    // If both parts are numeric, compare as numbers
    if (numA >= 0 && numB >= 0) {
      if (numA !== numB) {
        return numB - numA; // Descending order (higher version first)
      }
    } else {
      // Compare as strings (for parts like 'alpha', 'beta', etc.)
      const strCompare = partB.localeCompare(partA); // Descending
      if (strCompare !== 0) {
        // Special handling for 'p' (patch) vs numeric
        if (partA === 'p' && /^\d+$/.test(partB)) return 1;
        if (partB === 'p' && /^\d+$/.test(partA)) return -1;
        
        return strCompare;
      }
    }
  }
  
  // If all parts are equal, longer version is usually newer
  // (e.g., 2.0.1 is newer than 2.0)
  return partsB.length - partsA.length;
};

// Fetch GitHub repository data
const fetchGitHubRepo = async (owner: string, repo: string): Promise<RepositoryData> => {
  try {
    // Fetch repo info
    const repoResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);
    
    // Fetch tags
    const tagsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/tags`);
    console.log('GitHub tags response:', tagsResponse.data);
    
    let latestTag = undefined;
    
    if (tagsResponse.data.length > 0) {
      // Sort tags by semantic version (newest first)
      const sortedTags = [...tagsResponse.data].sort((a, b) => 
        compareVersions(a.name, b.name)
      );
      
      console.log('Sorted tags (newest first):', sortedTags.map(t => t.name));
      
      const latestTagData = sortedTags[0];
      const tagName = latestTagData.name;
      
      // Get commit info to get the date
      const commitResponse = await axios.get(latestTagData.commit.url);
      const tagDate = commitResponse.data.commit.committer.date;
      console.log('GitHub tag details:', {
        tagName,
        rawDate: tagDate,
        parsedDate: new Date(tagDate).toISOString(),
        year: new Date(tagDate).getFullYear()
      });
      
      latestTag = {
        name: tagName,
        date: tagDate
      };
    } else {
      console.log('No tags found for GitHub repository');
    }
    
    return {
      name: repoResponse.data.name,
      description: repoResponse.data.description || '',
      url: repoResponse.data.html_url,
      isGitHub: true,
      latestTag,
      owner: repoResponse.data.owner.login
    };
  } catch (error) {
    console.error('Error fetching GitHub repo:', error);
    throw new Error('Failed to fetch GitHub repository information');
  }
};

// Fetch GitLab repository data
const fetchGitLabRepo = async (owner: string, repo: string, gitlabInstance: string = 'gitlab.com'): Promise<RepositoryData> => {
  try {
    console.log(`Fetching GitLab repo from instance: ${gitlabInstance}`);
    
    // Fetch repo info
    const repoResponse = await axios.get(`https://${gitlabInstance}/api/v4/projects/${encodeURIComponent(`${owner}/${repo}`)}`);
    
    // Fetch tags
    const tagsResponse = await axios.get(`https://${gitlabInstance}/api/v4/projects/${encodeURIComponent(`${owner}/${repo}`)}/repository/tags`);
    console.log('GitLab tags response:', tagsResponse.data);
    
    let latestTag = undefined;
    
    if (tagsResponse.data.length > 0) {
      // Sort tags by semantic version (newest first)
      const sortedTags = [...tagsResponse.data].sort((a, b) => 
        compareVersions(a.name, b.name)
      );
      
      console.log('Sorted tags (newest first):', sortedTags.map(t => t.name));
      
      const latestTagData = sortedTags[0];
      const tagName = latestTagData.name;
      
      // GitLab API provides commit date directly
      const tagDate = latestTagData.commit.created_at;
      console.log('GitLab tag details:', {
        tagName,
        rawDate: tagDate,
        parsedDate: new Date(tagDate).toISOString(),
        year: new Date(tagDate).getFullYear()
      });
      
      latestTag = {
        name: tagName,
        date: tagDate
      };
    } else {
      console.log('No tags found for GitLab repository');
    }
    
    return {
      name: repoResponse.data.name,
      description: repoResponse.data.description || '',
      url: repoResponse.data.web_url,
      isGitHub: false,
      latestTag,
      owner: repoResponse.data.namespace.path
    };
  } catch (error) {
    console.error('Error fetching GitLab repo:', error);
    throw new Error(`Failed to fetch GitLab repository information from ${gitlabInstance}`);
  }
};

// Main function to fetch repository data
export const fetchRepositoryData = async (url: string): Promise<RepositoryData> => {
  const parsedUrl = parseRepoUrl(url);
  
  if (!parsedUrl) {
    throw new Error('Invalid repository URL format');
  }
  
  const { owner, repo, isGitHub, gitlabInstance } = parsedUrl;
  
  if (isGitHub) {
    return fetchGitHubRepo(owner, repo);
  } else {
    return fetchGitLabRepo(owner, repo, gitlabInstance || 'gitlab.com');
  }
};

// Generate BibTeX citation from repository data
export const generateCitation = (repoData: RepositoryData): Citation => {
  const currentYear = new Date().getFullYear();
  const tagYear = repoData.latestTag?.date 
    ? new Date(repoData.latestTag.date).getFullYear() 
    : null;
  
  console.log('Citation date details:', {
    hasLatestTag: !!repoData.latestTag,
    tagDate: repoData.latestTag?.date,
    parsedTagYear: tagYear,
    currentYear,
    selectedYear: tagYear || currentYear
  });
  
  const year = tagYear?.toString() || currentYear.toString();
  
  // Format key as author + year + repo name (camelCase)
  const key = `${repoData.owner}${year}${repoData.name}`;
  const publisher = repoData.isGitHub ? 'GitHub' : 'GitLab';
  
  // Format version string
  let version = 'latest';
  if (repoData.latestTag?.name) {
    version = repoData.latestTag.name;
    
    console.log('Version formatting:', {
      original: version,
      formatted: version
    });
  }
  
  // Current date for access date
  const accessYear = new Date().getFullYear();
  
  const bibtexString = `@misc{${key},
  author = {${repoData.owner}},
  title = {{${repoData.name}}},
  howpublished = {\\url{${repoData.url}}},
  year = {${year}},
  note = {${publisher} Repository, version {${version}}, accessed ${accessYear}}
}`;

  return {
    bibtexString,
    key,
    title: repoData.name,
    author: repoData.owner,
    url: repoData.url,
    year,
    publisher,
    version
  };
};

// Suggest repositories based on partial input
export const suggestRepositories = async (partialInput: string): Promise<string[]> => {
  if (!partialInput || partialInput.length < 3) return [];
  
  try {
    const response = await axios.get(`https://api.github.com/search/repositories?q=${encodeURIComponent(partialInput)}&per_page=5`);
    
    return response.data.items.map((item: any) => `${item.owner.login}/${item.name}`);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
}; 