import React from 'react';
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
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { FileItem } from './FileItem';

export function SortableList({ files, setFiles, onDelete, onUpdateRange, onUpdateScale, onUpdateRotation, onDuplicate, onPreview }) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setFiles((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={files}
                strategy={verticalListSortingStrategy}
            >
                <div className="file-list">
                    {files.map((fileObj) => (
                        <FileItem
                            key={fileObj.id}
                            id={fileObj.id}
                            file={fileObj.file}
                            pageRange={fileObj.pageRange}
                            pageCount={fileObj.pageCount}
                            scale={fileObj.scale}
                            rotation={fileObj.rotation}
                            onUpdateRange={onUpdateRange}
                            onUpdateScale={onUpdateScale}
                            onUpdateRotation={onUpdateRotation}
                            onDuplicate={onDuplicate}
                            onDelete={onDelete}
                            onPreview={(page) => onPreview(fileObj.file, page)}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
