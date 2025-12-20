import React from 'react';

interface FileItem {
    name: string;
    isDirectory: boolean;
    path: string;
}

interface FileListProps {
    files: FileItem[];
    currentPath: string; // Used for "Parent" navigation if we wanted, or debug
    onNavigate: (path: string) => void;
    onFileClick: (file: FileItem) => void;

    isBatchMode: boolean;
    selectedBatchFiles: string[];
}

const ZipThumbnail: React.FC<{ file: FileItem }> = ({ file }) => {
    const [coverPath, setCoverPath] = React.useState<string | null>(null);

    React.useEffect(() => {
        let isMounted = true;

        const loadCover = async () => {
            if (!window.electronAPI) return;
            // Only fetch for zips
            const lower = file.name.toLowerCase();
            if (lower.endsWith('.zip') || lower.endsWith('.cbz')) {
                const path = await window.electronAPI.getZipCover(file.path);
                if (isMounted && path) {
                    setCoverPath(path);
                }
            }
        };

        // Use IntersectionObserver? For now just load on mount.
        loadCover();

        return () => { isMounted = false; };
    }, [file.path]);

    if (coverPath) {
        return (
            <img
                src={`media:///${encodeURIComponent(coverPath)}`}
                alt={file.name}
                className="w-full h-full object-cover"
                loading="lazy"
            />
        );
    }

    // Default ZIP Icon
    return (
        <div className="flex flex-col items-center justify-center h-full text-yellow-500">
            <span className="text-4xl">📦</span>
            <span className="text-[10px] mt-1 font-mono">ZIP</span>
        </div>
    );
};

export const FileList: React.FC<FileListProps> = ({ files, onNavigate, onFileClick, isBatchMode, selectedBatchFiles }) => {
    // Filter out dotfiles (like .ag_temp) unless inside them?
    // If we are VIEWING a zip content (which is in .ag_zip...), we want to see them.
    // But we don't want to see the .ag_zip folders themselves in the root list.
    const displayFiles = files.filter(f => !f.name.startsWith('.'));

    return (
        <div className="flex-1 overflow-y-auto p-4 bg-gray-900 scrollbar-thin scrollbar-thumb-gray-700">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {displayFiles.map((file) => {
                    const isSelected = isBatchMode && selectedBatchFiles.includes(file.path);
                    const isZip = /\.zip$|\.cbz$/i.test(file.name);

                    return (
                        <div
                            key={file.path}
                            onClick={() => {
                                if (file.isDirectory) {
                                    onNavigate(file.path);
                                } else {
                                    onFileClick(file);
                                }
                            }}
                            className={`
                group relative aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer border-2 transition-all
                ${isSelected ? 'border-green-500 ring-2 ring-green-500/50' : 'border-transparent hover:border-blue-500'}
              `}
                        >
                            {file.isDirectory ? (
                                <div className="flex flex-col items-center justify-center h-full text-blue-400">
                                    <span className="text-4xl">📁</span>
                                </div>
                            ) : (
                                isZip ? (
                                    <ZipThumbnail file={file} />
                                ) : (
                                    // Regular Media
                                    /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(file.name) ? (
                                        <img
                                            src={`media:///${encodeURIComponent(file.path)}`}
                                            alt={file.name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : /\.(mp4|webm|ogg|mov|mkv)$/i.test(file.name) ? (
                                        <div className="relative w-full h-full bg-black">
                                            <video
                                                src={`media:///${encodeURIComponent(file.path)}`}
                                                className="w-full h-full object-cover"
                                                muted
                                                loop // Optional: play on hover? or just show poster?
                                                onMouseOver={(e) => e.currentTarget.play()}
                                                onMouseOut={(e) => e.currentTarget.pause()}
                                            />
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80 pointer-events-none">
                                                <span className="text-4xl shadow-lg">▶</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                            <span className="text-4xl">📄</span>
                                            <span className="text-xs mt-2 uppercase">{file.name.split('.').pop()}</span>
                                        </div>
                                    )
                                )
                            )}

                            {/* Batch Selection Overlay */}
                            {isBatchMode && (
                                <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-green-500 border-green-500 text-white' : 'border-gray-400 bg-black/50'}`}>
                                    {isSelected && <span className="text-xs">✓</span>}
                                </div>
                            )}

                            <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform">
                                <p className="text-xs text-white truncate text-center">{file.name}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
