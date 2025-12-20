import React, { useEffect, useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { FileList } from './components/FileList';
import { MediaViewer } from './components/MediaViewer';

interface FileItem {
  name: string;
  isDirectory: boolean;
  path: string;
}

function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => localStorage.getItem('lastPath') || '');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize activeFolder from storage, falling back to currentPath
  const [activeFolder, setActiveFolder] = useState<string>(() => localStorage.getItem('lastActiveFolder') || '');

  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  // Batch Rename State
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedBatchFiles, setSelectedBatchFiles] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleSearch = (e: any) => setSearchQuery(e.detail);
    window.addEventListener('search-query', handleSearch);
    return () => window.removeEventListener('search-query', handleSearch);
  }, []);

  const loadFiles = async () => {
    if (!currentPath) return;
    try {
      const fileList = await window.electronAPI.getFiles(currentPath);
      setFiles(fileList);
      localStorage.setItem('lastPath', currentPath);

      // Verify activeFolder validity
      // If activeFolder is not set or not within currentPath (e.g. changed root), reset to currentPath
      // But on initial load, we want to respect the stored activeFolder if it's valid.
      // We check this in the useEffect below or here?
    } catch (error) {
      console.error('Failed to load files:', error);
      setFiles([]);
    }
  };

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onFolderSelected((path) => {
        setCurrentPath(path);
        // When explicitly selecting a new root folder, we likely want to reset view to it.
        setActiveFolder(path);
        localStorage.setItem('lastActiveFolder', path);
      });
    }
  }, []);

  useEffect(() => {
    loadFiles();

    // Sync logic:
    // If activeFolder is empty or unrelated to currentPath, reset it.
    // However, on Mount, activeFolder might represent the restored 'lastActiveFolder'.
    // We should check if 'activeFolder' is a child of 'currentPath'.
    // If we just changed currentPath (e.g. Open Folder), we probably want to reset.
    // But 'loadFiles' runs on mount too.

    // Simple heuristic: If activeFolder doesn't start with currentPath, it's invalid for this root. Reset.
    if (currentPath && (!activeFolder || !activeFolder.startsWith(currentPath))) {
      setActiveFolder(currentPath);
      localStorage.setItem('lastActiveFolder', currentPath);
    }
  }, [currentPath]); // removed activeFolder dependency to match logic

  // Transform files to tree
  const rootNode = useMemo(() => {
    if (!currentPath || files.length === 0) return null;

    // Create root
    const root: any = {
      name: currentPath.split(/[\\/]/).pop() || 'Root',
      path: currentPath,
      children: []
    };

    const nodeMap = new Map<string, any>();
    nodeMap.set(currentPath, root);

    // Get all directories
    const directories = files
      .filter(f => f.isDirectory)
      .sort((a, b) => a.path.length - b.path.length);

    // 1. Create Nodes
    directories.forEach(dir => {
      if (!dir.path.startsWith(currentPath)) return;
      const node = {
        name: dir.name,
        path: dir.path,
        children: []
      };
      nodeMap.set(dir.path, node);
    });

    // 2. Link Nodes
    directories.forEach(dir => {
      const node = nodeMap.get(dir.path);
      // Find parent: dirname(path)
      // We need robust separator handling
      const sep = window.electronAPI ? '\\' : '/'; // Heuristic, or just check both?

      let parentPath = dir.path.substring(0, dir.path.lastIndexOf('\\'));
      if (parentPath === dir.path) parentPath = dir.path.substring(0, dir.path.lastIndexOf('/'));

      // Use simplified logic: path startsWith parentPath
      // Actually, just substring to last separator is safer if consistent.

      // Check if parent is in map
      let parentNode = nodeMap.get(parentPath);

      // Fallback for root child
      if (!parentNode) {
        // Check if parentPath is essentially currentPath (ignoring trailing slash)
        if (parentPath.replace(/[\\/]$/, '') === currentPath.replace(/[\\/]$/, '')) {
          parentNode = root;
        }
      }

      if (parentNode) {
        parentNode.children.push(node);
      } else {
        // If direct child of root based on path logic
        // e.g. Root: C:\A, Dir: C:\A\B. Parent: C:\A. 
        // If Dir: C:\A\B\C. Parent: C:\A\B.
        // If map populated efficiently, should find it.

        // If not found, maybe strict separator issue. 
        // Attempt to find parent by removing last segment.
        const segments = dir.path.split(/[\\/]/);
        if (segments.length > 0) {
          segments.pop();
          const calculatedParent = segments.join('\\') || segments.join('/');
          // This join is ambiguous. 
          // Let's rely on NodeMap being correct for "exact string match".
        }

        // Force attach to root if looks like top level?
        // Only if parent path length < currentPath length? No.

        // Fallback: Add to root if no parent found, to ensure visibility
        root.children.push(node);
      }
    });

    // Deduplicate children if fallback added duplicate?
    // Map approach is usually stable.
    root.children = [...new Set(root.children)];

    return root;
  }, [files, currentPath]);

  const handleNavigate = (path: string) => {
    setActiveFolder(path);
    setSelectedFile(null);
    localStorage.setItem('lastActiveFolder', path);
  };

  const filteredFiles = useMemo(() => {
    // 1. Filter by Search
    let result = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // 2. Filter by Active Folder
    if (activeFolder) {
      // Special Case: ZIP content (Comic Mode)
      // If we are inside a temp zip folder, we want a FLAT view of all images (recursive),
      // effectively ignoring subfolders structure to read as a continuous book.
      const isZipMode = activeFolder.includes('.ag_zip_');

      if (isZipMode) {
        result = result.filter(f => !f.isDirectory);
      } else {
        result = result.filter(f => {
          // if (f.isDirectory) return false; // Hide folders from main list - ENABLED FOR NAVIGATION

          // Robust Path Normalization
          const normalize = (p: string) => p.replace(/\\/g, '/').toLowerCase().replace(/\/$/, '');

          const targetPath = normalize(activeFolder);
          const filePath = normalize(f.path);

          // Recursive Flat View: Show all files under activeFolder
          if (f.isDirectory) return false;

          // Check if file is inside targetPath (recursively)
          // We add a trailing slash to targetPath to ensure we match directory boundary
          // e.g. c:/test matches c:/test/file.txt but NOT c:/testing/file.txt
          return filePath.startsWith(targetPath + '/');
        });
      }
    }

    console.log(`Filtered files count: ${result.length}`, result);
    return result;
  }, [files, searchQuery, activeFolder]);

  // View interactions
  const handleNext = () => {
    if (!selectedFile) return;
    const currentIndex = filteredFiles.findIndex(f => f.path === selectedFile.path);
    if (currentIndex !== -1) {
      // Loop: If last, go to first
      if (currentIndex === filteredFiles.length - 1) {
        setSelectedFile(filteredFiles[0]);
      } else {
        setSelectedFile(filteredFiles[currentIndex + 1]);
      }
    }
  };

  const handlePrev = () => {
    if (!selectedFile) return;
    const currentIndex = filteredFiles.findIndex(f => f.path === selectedFile.path);
    if (currentIndex !== -1) {
      // Loop: If first, go to last
      if (currentIndex === 0) {
        setSelectedFile(filteredFiles[filteredFiles.length - 1]);
      } else {
        setSelectedFile(filteredFiles[currentIndex - 1]);
      }
    }
  };

  const handleFileClick = async (file: FileItem) => {
    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith('.zip') || lowerName.endsWith('.cbz')) {
      if (!window.electronAPI) return;

      // Show loading state? 
      // setIsProcessing(true); // Optional, might be fast enough
      try {
        const result = await window.electronAPI.openZip(file.path);
        if (result.success && result.tempPath) {
          // Navigate to the temp folder
          setCurrentPath(result.tempPath);
        } else {
          console.error('Failed to open ZIP:', result.error);
          alert(`Failed to open comic: ${result.error}`);
        }
      } catch (e) {
        console.error(e);
      }
      return;
    }

    // Default: Select for Viewer
    setSelectedFile(file);
  };

  const handleCloseViewer = (shouldRefresh = false) => {
    setSelectedFile(null);
    if (shouldRefresh) {
      loadFiles();
    }
  };

  const handleOpenFolder = async () => {
    if (!window.electronAPI) {
      alert('Error: electronAPI is not defined.');
      return;
    }
    const path = await window.electronAPI.openFolderDialog();
    if (path) setCurrentPath(path);
  };

  const handleToggleBatchMode = () => {
    setIsBatchMode(prev => !prev);
    setSelectedBatchFiles([]);
  };

  const handleBatchFileClick = (file: FileItem) => {
    // Prevent folders in batch? Or allow?
    // Since folders are hidden in FileList now, this is moot, but safe check.
    if (file.isDirectory) return;

    setSelectedBatchFiles(prev => {
      if (prev.includes(file.path)) {
        return prev.filter(p => p !== file.path);
      } else {
        return [...prev, file.path];
      }
    });
  };

  const executeBatchRename = async () => {
    // ... Copy existing batch logic verbatim ...
    if (!currentPath) return;
    if (!confirm(`Are you sure you want to rename ${files.length} files?\nThis process uses a temporary renaming strategy to ensure data safety.`)) return;

    // Ordered list logic...
    const remainingFiles = filteredFiles.filter(f => !f.isDirectory && !selectedBatchFiles.includes(f.path));
    const selectedFileObjects = selectedBatchFiles
      .map(path => files.find(f => f.path === path))
      .filter((f): f is FileItem => !!f);
    const orderedFiles = [...selectedFileObjects, ...remainingFiles];

    const operations: { oldPath: string; newName: string }[] = [];
    const rootFolderName = currentPath.split(/[\\/]/).pop() || 'Root';

    for (let i = 0; i < orderedFiles.length; i++) {
      const file = orderedFiles[i];
      if (file.isDirectory) continue;

      let relativeDir = '';
      if (file.path.startsWith(currentPath)) {
        const pathWithoutRoot = file.path.substring(currentPath.length);
        const hiddenDirPart = pathWithoutRoot.substring(0, pathWithoutRoot.lastIndexOf(window.electronAPI ? '\\' : '/'));
        relativeDir = hiddenDirPart.replace(/^[\\/]+/, '');
      }

      const parts = [rootFolderName];
      if (relativeDir) {
        parts.push(...relativeDir.split(/[\\/]/));
      }
      const prefix = parts.join('_');

      const ext = file.name.substring(file.name.lastIndexOf('.'));
      const seq = (i + 1).toString().padStart(3, '0');
      const newName = `${prefix}_${seq}${ext}`;

      if (file.name !== newName) {
        operations.push({ oldPath: file.path, newName });
      }
    }

    if (operations.length === 0) {
      alert("No files need renaming.");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await window.electronAPI.batchRenameFiles(currentPath, operations);
      if (result.success) {
        setIsBatchMode(false);
        setSelectedBatchFiles([]);
        await loadFiles();
      } else {
        alert(`Batch rename failed: ${result.error}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-900 text-white overflow-hidden relative">
      <Sidebar
        onOpenFolder={handleOpenFolder}
        activeFolder={activeFolder}
        rootNode={rootNode}
        onSelectFolder={handleNavigate}
        isBatchMode={isBatchMode}
        onToggleBatchMode={handleToggleBatchMode}
        onExecuteBatchRename={executeBatchRename}
        selectedCount={selectedBatchFiles.length}
      />

      {currentPath || files.length > 0 ? (
        <div className="flex-1 flex flex-col min-h-0 bg-gray-900">
          {/* Header / Toolbar */}
          <div className="p-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between shrink-0">
            <div className="flex items-center overflow-hidden">
              <button onClick={() => handleNavigate(currentPath.substring(0, Math.max(currentPath.lastIndexOf('\\'), currentPath.lastIndexOf('/'))))} className="mr-2 text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700" title="Go Up">
                ⬆
              </button>
              <span className="font-mono text-sm truncate text-gray-300 select-all" title={activeFolder}>
                {activeFolder.includes('.ag_zip_') ? (
                  <span className="text-yellow-400 font-bold">
                    📖 {activeFolder.split(/[\\/]/).pop()?.replace('.ag_zip_', '').replace(/_\d+$/, '') || 'Comic'}
                  </span>
                ) : (
                  activeFolder || 'Root'
                )}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 whitespace-nowrap ml-4">
              {activeFolder.includes('.ag_zip_') && (
                <span className="text-gray-300 font-medium bg-gray-700 px-2 py-1 rounded">
                  Total Pages: {filteredFiles.length}
                </span>
              )}
              <span>
                {filteredFiles.length} items
              </span>
            </div>
          </div>

          <FileList
            files={filteredFiles}
            currentPath={activeFolder} // Show active folder content
            onNavigate={handleNavigate}
            onFileClick={isBatchMode ? handleBatchFileClick : handleFileClick}
            isBatchMode={isBatchMode}
            selectedBatchFiles={selectedBatchFiles}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 text-gray-500">
          <div className="text-8xl mb-6 opacity-20">🌌</div>
          <h2 className="text-3xl font-bold mb-2 text-gray-400">Anti-Gravity Viewer</h2>
          <p className="mb-8 text-gray-500">Select a folder from the sidebar to begin.</p>
        </div>
      )}

      {selectedFile && (
        <MediaViewer
          file={selectedFile}
          onClose={handleCloseViewer}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}

      {isProcessing && (
        <div className="absolute inset-0 z-[100] bg-black bg-opacity-80 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">Renaming Files...</h2>
          <p className="text-gray-400">Please wait, this may take a moment.</p>
        </div>
      )}
    </div>
  );
}

export default App;
