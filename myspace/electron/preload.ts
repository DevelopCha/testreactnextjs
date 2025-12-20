import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    getFiles: (path: string) => ipcRenderer.invoke('get-files', path),
    openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
    onFolderSelected: (callback: (path: string) => void) => ipcRenderer.on('folder-selected', (_event, path) => callback(path)),
    deleteFile: (path: string) => ipcRenderer.invoke('delete-file', path),
    renameFile: (oldPath: string, newName: string) => ipcRenderer.invoke('rename-file', oldPath, newName),
    batchRenameFiles: (rootPath: string, operations: any[]) => ipcRenderer.invoke('batch-rename-files', rootPath, operations),
    openZip: (path: string) => ipcRenderer.invoke('open-zip', path),
    getZipCover: (path: string) => ipcRenderer.invoke('get-zip-cover', path),
});
