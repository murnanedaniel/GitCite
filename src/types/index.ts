// Repository types
export interface RepositoryData {
  name: string;
  description: string;
  url: string;
  isGitHub: boolean;
  latestTag?: {
    name: string;
    date: string;
  };
  owner: string;
}

// Citation types
export interface Citation {
  bibtexString: string;
  key: string;
  title: string;
  author: string;
  url: string;
  year: string;
  publisher: string;
  version: string;
} 