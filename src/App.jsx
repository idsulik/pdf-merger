import React, { useState } from 'react';
import { PDFDocument, degrees, StandardFonts, rgb } from 'pdf-lib';
import { DropZone } from './components/DropZone';
import { SortableList } from './components/SortableList';
import { Files, Download, Github } from 'lucide-react';
import { MetadataOptions } from './components/MetadataOptions';

function App() {
  const [files, setFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [outputFilename, setOutputFilename] = useState('merged');
  const [metadata, setMetadata] = useState({ title: '', author: '', subject: '' });
  const [addPageNumbers, setAddPageNumbers] = useState(false);
  const [pageNumberPosition, setPageNumberPosition] = useState('center'); // 'left', 'center', 'right'
  const [pageNumberFormat, setPageNumberFormat] = useState('Page {n} of {total}');
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const [blankPageOption, setBlankPageOption] = useState('none'); // 'none', 'always', 'odd', 'specific'
  const [specificBlankPages, setSpecificBlankPages] = useState('');

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
        scale: 1,
        rotation: 0 // 0, 90, 180, 270
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

  const handleUpdateRotation = (id) => {
    setFiles(prev => prev.map(f => {
      if (f.id !== id) return f;
      const nextRotation = (f.rotation + 90) % 360;
      return { ...f, rotation: nextRotation };
    }));
  };

  const handleDuplicate = (id) => {
    const fileToDuplicate = files.find(f => f.id === id);
    if (!fileToDuplicate) return;

    const newFile = {
      ...fileToDuplicate,
      id: crypto.randomUUID(),
      // We keep the same file reference, pageRange, etc.
    };

    setFiles(prev => {
      const index = prev.findIndex(f => f.id === id);
      const newFiles = [...prev];
      newFiles.splice(index + 1, 0, newFile);
      return newFiles;
    });
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
            if (fileObj.rotation) {
              page.setRotation(degrees(fileObj.rotation));
            }
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
          copiedPages.forEach((page) => {
            if (fileObj.rotation) {
              page.setRotation(degrees((page.getRotation().angle + fileObj.rotation) % 360));
            }
            mergedPdf.addPage(page)
          });

          if (blankPageOption === 'always') {
            mergedPdf.addPage();
          } else if (blankPageOption === 'odd' && copiedPages.length % 2 !== 0) {
            mergedPdf.addPage();
          }
        }
      }

      // Handle specific blank pages (global sequence)
      // This is a bit tricky because we've already built the PDF.
      // But we can check if we want to support "insert blank page AT page X".
      // However, simplicity might suggest we do this logic *during* addition if possible, 
      // but since we blindly add pages above, let's post-process?
      // Actually, post-processing insert is easier.
      if (blankPageOption === 'specific' && specificBlankPages.trim() !== '') {
        // Create a new document to copy pages into, inserting blanks where needed
        // Or just insert pages into the current doc? pdf-lib supports insertPage.
        const parts = specificBlankPages.split(',').map(p => p.trim());
        const pagesToInsertAfter = [];

        const totalPagesNow = mergedPdf.getPageCount();

        // We need to parse ranges like 1, 3-5
        for (const part of parts) {
          if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n));
            if (!isNaN(start) && !isNaN(end)) {
              for (let i = start; i <= end; i++) pagesToInsertAfter.push(i);
            }
          } else {
            const p = parseInt(part);
            if (!isNaN(p)) pagesToInsertAfter.push(p);
          }
        }

        // Sort descending to not mess up indices when inserting?
        // .insertPage(index) inserts *at* that index.
        // If user says "insert blank page at page 2", it implies the blank becomes page 2.
        // If user says "1", does it mean after page 1 or replace page 1? Usually "Insert after".
        // Let's assume user wants to insert A BLANK PAGE which will appear AS Page X?
        // Or "After page X"? 
        // Most mergers logic: "Insert blank page after page X". 
        // But the requirement says "Insert blank pages... specify comma separated pages". 
        // Let's assume "After page X". 

        // Let's do a different approach:
        // If we insert at index k, the existing page at k moves to k+1.
        // To make it robust, let's just use insertPage.

        // Let's uniquify and sort descending
        const uniquePages = [...new Set(pagesToInsertAfter)].sort((a, b) => b - a);

        for (const pNum of uniquePages) {
          // pNum is 1-based. If pNum is 1, we want to insert AFTER page 1.
          // So at index 1 (since index 0 is page 1).
          // If pNum is 0, insert at start? Let's assume 1-based page numbers.
          const insertIndex = pNum;
          if (insertIndex >= 0 && insertIndex <= totalPagesNow) {
            mergedPdf.insertPage(insertIndex);
          }
        }
      }

      // Set Metadata
      if (metadata.title) mergedPdf.setTitle(metadata.title);
      if (metadata.author) mergedPdf.setAuthor(metadata.author);
      if (metadata.subject) mergedPdf.setSubject(metadata.subject);

      // Add Page Numbers
      if (addPageNumbers) {
        const font = await mergedPdf.embedFont(StandardFonts.Helvetica);
        const pages = mergedPdf.getPages();
        const totalPages = pages.length;

        pages.forEach((page, idx) => {
          const { width } = page.getSize();

          let text = pageNumberFormat
            .replace('{n}', (idx + 1).toString())
            .replace('{total}', totalPages.toString());

          const textSize = 10;
          const textWidth = font.widthOfTextAtSize(text, textSize);

          let x = 0;
          const margin = 20;

          if (pageNumberPosition === 'left') {
            x = margin;
          } else if (pageNumberPosition === 'right') {
            x = width - margin - textWidth;
          } else {
            // center
            x = width / 2 - textWidth / 2;
          }

          page.drawText(text, {
            x,
            y: 20,
            size: textSize,
            font,
            color: rgb(0, 0, 0),
          });
        });
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${outputFilename || 'merged'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('Failed to merge files. Please ensure all files are valid PDFs or Images.');
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
        <p className="subtitle">Merge multiple files (PDFs or Images) into one PDF. Fast, secure, and client-side.</p>
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
              onUpdateRotation={handleUpdateRotation}
              onDuplicate={handleDuplicate}
            />

            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%', maxWidth: '600px', margin: '2rem auto' }}>

              <MetadataOptions
                isOpen={isMetadataOpen}
                setIsOpen={setIsMetadataOpen}
                metadata={metadata}
                setMetadata={setMetadata}
                blankPageOption={blankPageOption}
                setBlankPageOption={setBlankPageOption}
                specificBlankPages={specificBlankPages}
                setSpecificBlankPages={setSpecificBlankPages}
                addPageNumbers={addPageNumbers}
                setAddPageNumbers={setAddPageNumbers}
                pageNumberPosition={pageNumberPosition}
                setPageNumberPosition={setPageNumberPosition}
                pageNumberFormat={pageNumberFormat}
                setPageNumberFormat={setPageNumberFormat}
                outputFilename={outputFilename}
                setOutputFilename={setOutputFilename}
              />

              <button
                className="btn"
                onClick={handleMerge}
                disabled={isMerging}
                style={{ fontSize: '1.2rem', padding: '1rem 2rem', width: '100%' }}
              >
                {isMerging ? (
                  'Merging...'
                ) : (
                  <>
                    <Download size={24} />
                    Merge Files
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </main>

      <footer style={{ marginTop: '4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        <p>No files are uploaded to any server. Everything happens in your browser.</p>
        <a
          href="https://github.com/idsulik/pdf-merger"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '1rem',
            color: 'inherit',
            textDecoration: 'none',
            opacity: 0.8,
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = 1}
          onMouseOut={(e) => e.currentTarget.style.opacity = 0.8}
        >
          <Github size={16} />
          <span>View on GitHub</span>
        </a>
      </footer>
    </div>
  );
}

export default App;
