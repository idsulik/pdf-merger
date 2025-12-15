import React, { useMemo, useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, Plus, ZoomIn } from 'lucide-react';
import { parsePageRange, formatPageList } from '../utils/pdfUtils';

export function PageGrid({ pageCount, pageRange, onUpdateRange, onPreview }) {
    const [removalHistory, setRemovalHistory] = useState({});

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { opacity: 0 } // Immediate activation? Or distance?
            // Default constraint of 0 distance is fine, but we are inside a draggable item.
            // However, we are dragging elements *within* the item, which doesn't have a drag handle itself (the parent handle is separate).
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const { selectedIndices, excludedIndices } = useMemo(() => {
        const all = Array.from({ length: pageCount }, (_, i) => i);
        const selected = parsePageRange(pageRange, pageCount);
        const selectedSet = new Set(selected);
        const excluded = all.filter(i => !selectedSet.has(i));
        return { selectedIndices: selected, excludedIndices: excluded };
    }, [pageCount, pageRange]);

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = selectedIndices.findIndex(i => `page-${i}` === active.id);
            const newIndex = selectedIndices.findIndex(i => `page-${i}` === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newOrder = arrayMove(selectedIndices, oldIndex, newIndex);
                onUpdateRange(formatPageList(newOrder));
            }
        }
    };

    const handleRemove = (pageIndex) => {
        // Store the index where it was removed from
        const indexToRemove = selectedIndices.indexOf(pageIndex);
        if (indexToRemove !== -1) {
            setRemovalHistory(prev => ({ ...prev, [pageIndex]: indexToRemove }));
        }

        const newOrder = selectedIndices.filter(i => i !== pageIndex);
        onUpdateRange(formatPageList(newOrder));
    };

    const handleAdd = (pageIndex) => {
        // Try to restore to previous position
        let insertIndex = selectedIndices.length; // Default to append

        if (removalHistory.hasOwnProperty(pageIndex)) {
            insertIndex = removalHistory[pageIndex];
            // Ensure within bounds (e.g. if list shrank significantly)
            if (insertIndex > selectedIndices.length) {
                insertIndex = selectedIndices.length;
            }
        }

        const newOrder = [...selectedIndices];
        newOrder.splice(insertIndex, 0, pageIndex);

        onUpdateRange(formatPageList(newOrder));
    };

    return (
        <div className="page-grid-container" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            <div className="section-label" style={{ marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Included Pages (Drag to reorder)
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={selectedIndices.map(i => `page-${i}`)}
                    strategy={rectSortingStrategy}
                >
                    <div className="page-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {selectedIndices.map((pageIndex) => (
                            <SortablePageItem
                                key={`page-${pageIndex}`}
                                id={`page-${pageIndex}`}
                                pageNumber={pageIndex + 1}
                                onRemove={() => handleRemove(pageIndex)}
                                onPreview={() => onPreview(pageIndex + 1)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {excludedIndices.length > 0 && (
                <>
                    <div className="section-label" style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                        Excluded Pages (Click to add)
                    </div>
                    <div className="page-grid excluded" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {excludedIndices.map((pageIndex) => (
                            <div
                                key={`ex-page-${pageIndex}`}
                                className="page-item excluded"
                                onClick={() => handleAdd(pageIndex)}
                                style={{
                                    ...pageItemStyle,
                                    opacity: 0.6,
                                    cursor: 'pointer',
                                    border: '1px dashed var(--card-border)',
                                    color: 'var(--text-primary)'
                                }}
                                title="Click to add"
                            >
                                <span>{pageIndex + 1}</span>
                                <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onPreview(pageIndex + 1);
                                        }}
                                        title="Preview page"
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            padding: 0,
                                            cursor: 'pointer',
                                            color: 'var(--text-secondary)'
                                        }}
                                    >
                                        <ZoomIn size={14} />
                                    </button>
                                    <Plus size={16} style={{ color: 'var(--accent-color)' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

const pageItemStyle = {
    width: '40px',
    height: '50px',
    background: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    userSelect: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    flexDirection: 'column',
    gap: '2px'
};

export function SortablePageItem({ id, pageNumber, onRemove, onPreview }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        ...pageItemStyle,
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 999 : 'auto',
        opacity: isDragging ? 0.8 : 1,
        cursor: 'grab',
        background: 'var(--card-bg-hover)', // slightly lighter
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <span>{pageNumber}</span>
            <button
                className="remove-page-btn"
                onPointerDown={(e) => {
                    e.stopPropagation();
                    // Prevent drag start when clicking remove
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                title="Remove page"
                style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: 'var(--danger-color)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    zIndex: 2
                }}
            >
                <X size={10} />
            </button>
            <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    onPreview();
                }}
                title="Preview page"
                style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: 0,
                    opacity: 0.6
                }}
            >
                <ZoomIn size={12} />
            </button>
        </div>
    );
}
