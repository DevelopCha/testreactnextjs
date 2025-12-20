import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar'; // Ensure imports are correct if needed, but MediaViewer is standalone usually.
// Actually MediaViewer is imported by App.tsx.

interface FileItem {
    name: string;
    isDirectory: boolean;
    path: string;
}

interface MediaViewerProps {
    file: FileItem;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({ file, onClose, onNext, onPrev }) => {
    // Determine file type
    const isVideo = /\.(mp4|webm|ogg|mov|mkv)$/i.test(file.name);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') onNext();
            if (e.key === 'ArrowLeft') onPrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, onNext, onPrev]);

    // Handle mouse navigation
    const handleMouseUp = (e: React.MouseEvent) => {
        // 0 = Left Button, 2 = Right Button
        // We use MouseUp to avoid conflict with drag/select if any, but Click is usually better for "Tap".
        // "Left click next".
        // However, if we click CONTROLS on video, we don't want to skip.
        // e.target check might be needed.

        // Simplistic approach: specific zones or just check button.
        // User asked "Left click = next page".

        // Prevent navigation if clicking on a button (like Close)
        if ((e.target as HTMLElement).closest('button')) return;
        if ((e.target as HTMLElement).tagName === 'VIDEO') return; // Let video handle its own clicks (pause/play)

        if (e.button === 0) {
            onNext();
        } else if (e.button === 2) {
            onPrev();
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent default context menu
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/95 flex flex-col text-white"
            onMouseUp={handleMouseUp}
            onContextMenu={handleContextMenu}
        >
            <div className="absolute top-4 right-4 z-50 flex gap-2">
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="bg-gray-800/50 hover:bg-gray-700 text-white rounded-full p-2 transition-colors"
                >
                    ✕
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
                {/* Transparent Click Areas for Mouse Users providing cues? No, user wants simple click anywhere. */}

                {isVideo ? (
                    <div className="relative max-w-full max-h-full aspect-video">
                        <video
                            src={`media:///${encodeURIComponent(file.path)}`}
                            controls
                            autoPlay
                            className="max-w-full max-h-full object-contain"
                        // Video consumes clicks for play/pause usually.
                        // If user wants "Left Click Next" even on video, they lose Play/Pause.
                        // "Manga mode" implies images mostly.
                        // We left the video tag excluded in handleMouseUp above.
                        />
                    </div>
                ) : (
                    <img
                        src={`media:///${encodeURIComponent(file.path)}`}
                        alt={file.name}
                        className="max-w-full max-h-full object-contain select-none"
                        draggable={false}
                    />
                )}
            </div>

            <div className="p-4 bg-gray-900/80 backdrop-blur text-center relative z-20 pointer-events-none">
                <div className="text-lg font-medium truncate">{file.name}</div>
                <div className="text-xs text-gray-500">Left Click: Next • Right Click: Prev</div>
            </div>
        </div>
    );
};
