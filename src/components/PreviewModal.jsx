import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export function PreviewModal({ file, page, onClose }) {
    const [objectUrl, setObjectUrl] = useState(null);

    useEffect(() => {
        if (file) {
            const url = URL.createObjectURL(file);
            // If specific page requested and it's a PDF, append fragment
            // PDF Open Parameters: #page=pagenum
            const finalUrl = (page && file.type === 'application/pdf')
                ? `${url}#page=${page}`
                : url;

            setObjectUrl(finalUrl);
            return () => URL.revokeObjectURL(url);
        }
    }, [file, page]);

    if (!file || !objectUrl) return null;

    const isImage = file.type.startsWith('image/');

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
        }} onClick={onClose}>
            <div
                className="glass-panel"
                style={{
                    width: '100%',
                    height: '100%',
                    maxWidth: '1100px',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    background: 'var(--card-bg)',
                    overflow: 'hidden',
                    borderColor: 'var(--accent-color)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--card-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.2)'
                }}>
                    <h3 style={{
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '1.1rem',
                        color: 'var(--text-primary)'
                    }}>
                        Preview: {file.name}
                    </h3>
                    <button className="btn-icon" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{
                    flex: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.4)',
                    padding: '0'
                }}>
                    {isImage ? (
                        <div style={{ width: '100%', height: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
                            <img
                                src={objectUrl}
                                alt={file.name}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                            />
                        </div>
                    ) : (
                        <iframe
                            src={objectUrl}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                background: 'white'
                            }}
                            title="Preview"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
