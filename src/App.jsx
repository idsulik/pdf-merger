import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { DropZone } from './components/DropZone';
import { SortableList } from './components/SortableList';
import { Files, Download } from 'lucide-react';

function App() {
  const [files, setFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);

  const handleFilesAdded = async (newFiles) => {
    const fileObjs = [];

    for (const f of newFiles) {
      let pageCount = 0;
      if (f.type === 'application/pdf') {
        try {
          const arrayBuffer = await f.arrayBuffer();
          const pdf = await PDFDocument.load(arrayBuffer);
          pageCount = pdf.getPageCount();
        } catch (e) {
          console.error("Failed to load PDF for counting pages", e);
        }
      } else if (f.type.startsWith('image/')) {
        pageCount = 1;
      }

      fileObjs.push({
        id: crypto.randomUUID(),
        file: f,
        pageRange: '',
        pageCount: pageCount,
        scale: 1
      });
    }

    setFiles(prev => [...prev, ...fileObjs]);
  };

  const handleUpdateRange = (id, range) => {
    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, pageRange: range } : f
    ));
  };

  const handleUpdateScale = (id, scale) => {
    setFiles(prev => prev.map(f => {
      if (f.id !== id) return f;
      // limit to 3 decimal places to avoid long repeating decimals if any calculation occurs
      // but allow empty string (user clearing input)
      return { ...f, scale: scale === '' ? '' : scale };
    }));
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

        // Check if it's an image or PDF based on file type
        const isImage = fileObj.file.type.startsWith('image/');

        if (isImage) {
          let image;
          // Embed properly based on type
          if (fileObj.file.type === 'image/jpeg' || fileObj.file.type === 'image/jpg') {
            image = await mergedPdf.embedJpg(arrayBuffer);
          } else if (fileObj.file.type === 'image/png') {
            image = await mergedPdf.embedPng(arrayBuffer);
          }

          if (image) {
            // handle case where scale might be empty string -> default to 1
            const scaleVal = (fileObj.scale === '' || fileObj.scale === undefined || fileObj.scale === null) ? 1 : parseFloat(fileObj.scale);
            const scale = isNaN(scaleVal) ? 1 : scaleVal;

            const { width, height } = image.scale(scale);
            const page = mergedPdf.addPage([width, height]);
            page.drawImage(image, {
              x: 0,
              y: 0,
              width,
              height,
            });
          }
        } else {
          // Assume PDF
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
              onUpdateScale={handleUpdateScale}
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
