import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { DropZone } from './components/DropZone';
import { SortableList } from './components/SortableList';
import { Files, Download } from 'lucide-react';

function App() {
  const [files, setFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);

  const handleFilesAdded = (newFiles) => {
    const fileObjs = newFiles.map(f => ({
      id: crypto.randomUUID(),
      file: f,
      pageRange: ''
    }));
    setFiles(prev => [...prev, ...fileObjs]);
  };

  const handleUpdateRange = (id, range) => {
    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, pageRange: range } : f
    ));
  };

  const handleDelete = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleMerge = async () => {
    if (files.length === 0) return;

    try {
      setIsMerging(true);
      const mergedPdf = await PDFDocument.create();

      for (const fileObj of files) {
        const arrayBuffer = await fileObj.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pageCount = pdf.getPageCount();
        let indices = [];

        if (!fileObj.pageRange || fileObj.pageRange.trim() === '') {
          // Default: all pages
          indices = pdf.getPageIndices();
        } else {
          // Parse range
          const parts = fileObj.pageRange.split(',').map(p => p.trim());
          for (const part of parts) {
            if (part.includes('-')) {
              const [start, end] = part.split('-').map(n => parseInt(n));
              if (!isNaN(start) && !isNaN(end)) {
                // Convert 1-based to 0-based
                const s = Math.max(0, start - 1);
                const e = Math.min(pageCount - 1, end - 1);
                for (let i = s; i <= e; i++) {
                  if (!indices.includes(i)) indices.push(i);
                }
              }
            } else {
              const page = parseInt(part);
              if (!isNaN(page)) {
                // Convert 1-based to 0-based
                const p = page - 1;
                if (p >= 0 && p < pageCount && !indices.includes(p)) {
                  indices.push(p);
                }
              }
            }
          }
        }

        const copiedPages = await mergedPdf.copyPages(pdf, indices);
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('Failed to merge PDFs. Please ensure all files are valid PDFs.');
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Files size={48} className="highlight" />
          <h1 className="title">PDF Merger</h1>
        </div>
        <p className="subtitle">Merge multiple PDF files into one. Fast, secure, and client-side.</p>
      </header>

      <main>
        <DropZone onFilesAdded={handleFilesAdded} />

        {files.length > 0 && (
          <>
            <SortableList
              files={files}
              setFiles={setFiles}
              onDelete={handleDelete}
              onUpdateRange={handleUpdateRange}
            />

            <div style={{ marginTop: '2rem' }}>
              <button
                className="btn"
                onClick={handleMerge}
                disabled={isMerging}
                style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}
              >
                {isMerging ? (
                  'Merging...'
                ) : (
                  <>
                    <Download size={24} />
                    Merge PDF Files
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </main>

      <footer style={{ marginTop: '4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        <p>No files are uploaded to any server. Everything happens in your browser.</p>
      </footer>
    </div>
  );
}

export default App;
