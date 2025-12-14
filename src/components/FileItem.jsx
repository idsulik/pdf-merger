import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FileText, Trash2, GripVertical, Split, RotateCw, Copy } from 'lucide-react';

export function FileItem({ id, file, pageRange, pageCount, scale, rotation, onUpdateRange, onUpdateScale, onUpdateRotation, onDuplicate, onDelete }) {
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
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const isImage = file.type.startsWith('image/');

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="file-item glass-panel"
        >
            <div {...attributes} {...listeners} className="drag-handle">
                <GripVertical size={20} />
            </div>
            <div className="file-info">
                <FileText size={24} className="highlight" />
                <div>
                    <div className="file-name" title={file.name}>{file.name}</div>
                    <div className="file-meta" style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <div className="file-size">{formatSize(file.size)}</div>
                        {!isImage && <div className="file-pages">{pageCount ? `${pageCount} page${pageCount > 1 ? 's' : ''}` : 'Loading...'}</div>}
                        {!!rotation && <div className="file-rotation" style={{ color: 'var(--accent-primary)' }}>{rotation}°</div>}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                    <div className="page-range-input" style={{ marginRight: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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

                <button
                    className="btn-icon"
                    onClick={() => onDelete(id)}
                    aria-label="Delete file"
                >
                    <Trash2 size={20} className="danger" style={{ color: 'var(--danger-color)' }} />
                </button>
            </div>
        </div>
    );
}
