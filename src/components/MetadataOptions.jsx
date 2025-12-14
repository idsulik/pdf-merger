import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function MetadataOptions({
    isOpen,
    setIsOpen,
    metadata,
    setMetadata,
    blankPageOption,
    setBlankPageOption,
    specificBlankPages,
    setSpecificBlankPages,
    addPageNumbers,
    setAddPageNumbers,
    pageNumberPosition,
    setPageNumberPosition,
    pageNumberFormat,
    setPageNumberFormat,
    outputFilename,
    setOutputFilename
}) {
    return (
        <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.02)'
                }}
            >
                <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-primary)' }}>Metadata & Options</h3>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>

            {isOpen && (
                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Title"
                            value={metadata.title}
                            onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                            className="glass-input"
                            style={{
                                background: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid var(--card-border)',
                                padding: '0.7rem',
                                borderRadius: '6px',
                                color: 'var(--text-primary)',
                                fontSize: '0.9rem'
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Author"
                            value={metadata.author}
                            onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                            className="glass-input"
                            style={{
                                background: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid var(--card-border)',
                                padding: '0.7rem',
                                borderRadius: '6px',
                                color: 'var(--text-primary)',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>

                    <input
                        type="text"
                        placeholder="Subject"
                        value={metadata.subject}
                        onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
                        className="glass-input"
                        style={{
                            background: 'rgba(0, 0, 0, 0.2)',
                            border: '1px solid var(--card-border)',
                            padding: '0.7rem',
                            borderRadius: '6px',
                            color: 'var(--text-primary)',
                            fontSize: '0.9rem'
                        }}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Insert Blank Pages</label>
                        <select
                            value={blankPageOption}
                            onChange={(e) => setBlankPageOption(e.target.value)}
                            className="glass-input"
                            style={{
                                background: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid var(--card-border)',
                                padding: '0.7rem',
                                borderRadius: '6px',
                                color: 'var(--text-primary)',
                                fontSize: '0.9rem'
                            }}
                        >
                            <option value="none">None</option>
                            <option value="always">After every file</option>
                            <option value="odd">If file has odd page count</option>
                            <option value="specific">Specific page numbers</option>
                        </select>

                        {blankPageOption === 'specific' && (
                            <input
                                type="text"
                                placeholder="e.g. 1, 3-5 (pages to insert blank AFTER)"
                                value={specificBlankPages}
                                onChange={(e) => setSpecificBlankPages(e.target.value)}
                                className="glass-input"
                                style={{
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    border: '1px solid var(--card-border)',
                                    padding: '0.7rem',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9rem',
                                    marginTop: '0.5rem'
                                }}
                            />
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="pageNumbers"
                                checked={addPageNumbers}
                                onChange={(e) => setAddPageNumbers(e.target.checked)}
                                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)' }}
                            />
                            <label htmlFor="pageNumbers" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer' }}>Add page numbers</label>
                        </div>

                        {addPageNumbers && (
                            <div style={{ marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                                    <select
                                        value={pageNumberPosition}
                                        onChange={(e) => setPageNumberPosition(e.target.value)}
                                        className="glass-input"
                                        style={{
                                            background: 'rgba(0, 0, 0, 0.2)',
                                            border: '1px solid var(--card-border)',
                                            padding: '0.5rem',
                                            borderRadius: '6px',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        <option value="left">Left</option>
                                        <option value="center">Center</option>
                                        <option value="right">Right</option>
                                    </select>

                                    <input
                                        type="text"
                                        value={pageNumberFormat}
                                        onChange={(e) => setPageNumberFormat(e.target.value)}
                                        className="glass-input"
                                        placeholder="Page {n} of {total}"
                                        style={{
                                            background: 'rgba(0, 0, 0, 0.2)',
                                            border: '1px solid var(--card-border)',
                                            padding: '0.5rem',
                                            borderRadius: '6px',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                                    Use <code>{'{n}'}</code> for current page and <code>{'{total}'}</code> for total pages.
                                </p>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid var(--card-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Filename:</span>
                        <input
                            type="text"
                            value={outputFilename}
                            onChange={(e) => setOutputFilename(e.target.value)}
                            placeholder="merged"
                            className="glass-input"
                            style={{
                                background: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid var(--card-border)',
                                padding: '0.5rem',
                                borderRadius: '6px',
                                color: 'var(--text-primary)',
                                flex: 1,
                                fontSize: '1rem'
                            }}
                        />
                        <span style={{ color: 'var(--text-secondary)' }}>.pdf</span>
                    </div>
                </div>
            )}
        </div>
    );
}
