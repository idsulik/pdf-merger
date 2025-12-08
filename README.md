# Client-Side PDF Merger

A premium, secure, and client-side only PDF merger application built with React and Vite. This tool allows you to merge multiple PDF files, reorder them, and even select specific pages/ranges for each file, all without uploading your data to any server.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- **100% Client-Side**: No files are ever uploaded or processed on a server. Your data stays on your machine.
- **Drag & Drop Interface**: Easily drag and drop multiple PDF files.
- **Page Selection**: Select specific pages or ranges (e.g., "1-3, 5") to include from each file.
- **Drag to Reorder**: Sort your files in the desired order before merging.
- **Dark Mode UI**: Beautiful, premium dark mode design with glassmorphism effects.
- **Instant Merge**: Fast merging using `pdf-lib` and web assembly technologies.

## Technology Stack

- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **PDF Processing**: [pdf-lib](https://pdf-lib.js.org/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS with modern features (variables, flexbox, glassmorphism)

## Getting Started

### Prerequisites

- Node.js (v20+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pdf-merger.git
   cd pdf-merger
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Usage

1. **Upload Files**: Drag PDF files into the drop zone or click to select them.
2. **Arrange**: Drag the files to change their merge order.
3. **Select Pages**: Optionally, enter page ranges (e.g., `1, 3-5`) in the input field next to each file. Leave empty to include all pages.
4. **Merge**: Click "Merge PDF Files" to generate and download the merged document.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
