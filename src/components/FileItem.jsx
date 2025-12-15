import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ZoomIn, Trash2, GripVertical, Split, RotateCw, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { PageGrid } from './PageGrid';

export function FileItem({ id, file, pageRange, pageCount, scale, rotation, onUpdateRange, onUpdateScale, onUpdateRotation, onDuplicate, onDelete, onPreview }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        flexDirection: 'column', // Stack children vertically
        alignItems: 'stretch',   // Full width
        height: 'auto',          // Allow height to grow
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const isImage = file.type.startsWith('image/');
    const hasMultiplePages = !isImage && pageCount > 1;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="file-item glass-panel"
        >
            <div className="file-header" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <div {...attributes} {...listeners} className="drag-handle">
                    <GripVertical size={20} />
                </div>
                <div className="file-info">
                    <button
                        className="btn-icon"
                        onClick={() => onPreview()}
                        title="Preview file content"
                        style={{ padding: '0.25rem', marginRight: '0.5rem' }}
                    >
                        <ZoomIn size={24} className="highlight" />
                    </button>
                    <div>
                        <div className="file-name" title={file.name}>{file.name}</div>
                        <div className="file-meta" style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <div className="file-size">{formatSize(file.size)}</div>
                            {!isImage && <div className="file-pages">{pageCount ? `${pageCount} page${pageCount > 1 ? 's' : ''}` : 'Loading...'}</div>}
                            {!!rotation && <div className="file-rotation" style={{ color: 'var(--accent-primary)' }}>{rotation}°</div>}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                    <button
                        className="btn-icon"
                        onClick={() => onUpdateRotation(id)}
                        title="Rotate 90° clockwise"
                    >
                        <RotateCw size={18} />
                    </button>

                    <button
                        className="btn-icon"
                        onClick={() => onDuplicate(id)}
                        title="Duplicate file"
                    >
                        <Copy size={18} />
                    </button>

                    {isImage ? (
                        <div className="scale-input" style={{ marginRight: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }} title="Scale the image in the final PDF">Scale:</span>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                title="Set image scale factor. 1 = Original Size, 0.5 = 50%, 2 = 200%."
                                value={scale === undefined || scale === null ? 1 : scale}
                                onChange={(e) => onUpdateScale(id, e.target.value)}
                                className="glass-input"
                                onPointerDown={(e) => e.stopPropagation()}
                                style={{
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    border: '1px solid var(--card-border)',
                                    padding: '0.5rem',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary)',
                                    width: '80px',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>
                    ) : (
                        <div className="page-range-input" style={{ marginRight: hasMultiplePages ? '0.5rem' : '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Split size={16} className="text-secondary" title="Select pages to include" />
                            <input
                                type="text"
                                value={pageRange || ''}
                                onChange={(e) => onUpdateRange(id, e.target.value)}
                                placeholder="All pages (e.g. 1-5, 8)"
                                title="Specify page ranges (e.g. '1-5, 8'). Leave blank for all pages."
                                className="glass-input"
                                onPointerDown={(e) => e.stopPropagation()}
                                style={{
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    border: '1px solid var(--card-border)',
                                    padding: '0.5rem',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary)',
                                    width: '140px',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>
                    )}

                    {hasMultiplePages && (
                        <button
                            className="btn-icon"
                            onClick={() => setIsExpanded(!isExpanded)}
                            title={isExpanded ? "Collapse page view" : "Expand to view and manage pages"}
                            style={{ marginRight: '0.5rem' }}
                        >
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    )}

                    <button
                        className="btn-icon"
                        onClick={() => onDelete(id)}
                        aria-label="Delete file"
                    >
                        <Trash2 size={20} className="danger" style={{ color: 'var(--danger-color)' }} />
                    </button>
                </div>
            </div>

            {isExpanded && !isImage && (
                <div className="file-expanded-content" style={{ width: '100%' }}>
                    <PageGrid
                        pageCount={pageCount}
                        pageRange={pageRange}
                        onUpdateRange={(newRange) => onUpdateRange(id, newRange)}
                        onPreview={onPreview}
                    />
                </div>
            )}
        </div>
    );
}
