import React from 'react';

// Need to export this for App.tsx to see it? Or define shared type?
// For now, defining here.
export interface DirectoryNode {
    name: string;
    path: string;
    children: DirectoryNode[];
}

interface SidebarProps {
    onOpenFolder: () => void;
    rootNode: DirectoryNode | null;
    activeFolder: string;
    onSelectFolder: (path: string) => void;

    isBatchMode: boolean;
    onToggleBatchMode: () => void;
    onExecuteBatchRename: () => void;
    selectedCount: number;
}

const FolderTreeItem: React.FC<{
    node: DirectoryNode;
    activeFolder: string;
    onSelect: (path: string) => void;
    depth?: number;
}> = ({ node, activeFolder, onSelect, depth = 0 }) => {
    // Is selected if path matches activeFolder exactly
    const isSelected = node.path === activeFolder;

    // Auto-expand if activeFolder is a child of this node?
    // Or just default open.
    const [isExpanded, setIsExpanded] = React.useState(true);

    return (
        <div>
            <div
                className={`flex items-center py-1 px-2 cursor-pointer text-sm transition-colors rounded ${isSelected ? 'bg-blue-600 text-white font-medium' : 'text-gray-400 hover:bg-gray-800'
                    }`}
                style={{ paddingLeft: `${12 + (depth * 12)}px` }}
                onClick={() => onSelect(node.path)}
            >
                <span
                    className="mr-2 opacity-70 hover:opacity-100 p-1"
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                >
                    {node.children.length > 0 ? (isExpanded ? '📂' : '📁') : '📁'}
                </span>
                <span className="truncate">{node.name}</span>
            </div>
            {isExpanded && node.children.map(child => (
                <FolderTreeItem
                    key={child.path}
                    node={child}
                    activeFolder={activeFolder}
                    onSelect={onSelect}
                    depth={depth + 1}
                />
            ))}
        </div>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({
    onOpenFolder, rootNode, activeFolder, onSelectFolder,
    isBatchMode, onToggleBatchMode, onExecuteBatchRename, selectedCount
}) => {
    return (
        <div className="w-64 bg-gray-900 flex flex-col h-full border-r border-gray-800">
            <div className="p-4 border-b border-gray-800 bg-gray-900">
                <h1 className="text-xl font-bold mb-4 font-mono text-blue-400 tracking-tighter">AG Viewer</h1>

                <button
                    onClick={onOpenFolder}
                    disabled={isBatchMode}
                    className={`w-full text-left bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded flex items-center gap-2 mb-4 transition-colors ${isBatchMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span>📂</span> Open Folder
                </button>

                {/* Batch Tools */}
                <div className="mb-2">
                    {!isBatchMode ? (
                        <button
                            onClick={onToggleBatchMode}
                            className="w-full text-left bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 px-3 rounded text-sm transition-colors flex items-center gap-2"
                        >
                            <span>🔢</span> Sequential Rename
                        </button>
                    ) : (
                        <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
                            <div className="text-sm text-blue-300 mb-2 font-medium">Batch Mode Active</div>
                            <div className="text-xs text-gray-400 mb-3">
                                Click files in order.<br />
                                Selected: <span className="text-white font-mono">{selectedCount}</span>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <button
                                    onClick={onExecuteBatchRename}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-2 rounded font-bold transition-colors"
                                >
                                    Apply Rename
                                </button>
                                <button
                                    onClick={onToggleBatchMode}
                                    className="w-full bg-red-600/80 hover:bg-red-700 text-white text-xs py-2 rounded transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tree View */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-700">
                <div className="text-xs text-gray-500 uppercase font-semibold mb-2 px-2 mt-2">Folders</div>
                {rootNode ? (
                    <FolderTreeItem
                        node={rootNode}
                        activeFolder={activeFolder}
                        onSelect={onSelectFolder}
                    />
                ) : (
                    <div className="text-center text-gray-500 mt-10 text-xs">Open a folder to see structure</div>
                )}
            </div>

            <div className="p-2 border-t border-gray-800 text-[10px] text-gray-600 text-center">
                AG Tech v0.2.1
            </div>
        </div>
    );
};
