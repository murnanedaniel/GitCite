# GitCite

GitCite is a modern, fast React application that generates BibTeX citations for GitHub and GitLab repositories with a single click.

## Features

- **Fast Citation Generation**: Get BibTeX citations within seconds
- **Support for GitHub and GitLab**: Works with both major Git hosting platforms
- **Auto-completion**: Suggests repositories as you type
- **Copy to Clipboard**: Easily copy generated citations with one click
- **Clean, Modern UI**: Simple and intuitive interface

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/gitcite.git
   cd gitcite
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Usage

1. Enter a GitHub or GitLab repository URL in the search box (e.g., `github.com/user/repo`)
2. Alternatively, start typing a repository name and select from the auto-suggestions
3. Click "Cite" to generate the BibTeX citation
4. Copy the generated citation with the "Copy" button

## Building for Production

To build the app for production:

```
npm run build
```

This creates a `build` folder with optimized production files.

## Technical Details

GitCite is built with:

- React 18
- TypeScript
- styled-components for styling
- axios for API requests

The app uses the GitHub and GitLab APIs to fetch repository data and generate citations in BibTeX format.

## License

GitCite is open source software licensed under the [MIT license](LICENSE).
