export interface IElectronAPI {
    getFiles: (path: string) => Promise<Array<{ name: string; isDirectory: boolean; path: string }>>;
    openFolderDialog: () => Promise<string | null>;
    onFolderSelected: (callback: (path: string) => void) => void;
    deleteFile: (path: string) => Promise<{ success: boolean; error?: string }>;
    renameFile: (oldPath: string, newName: string) => Promise<{ success: boolean; newPath?: string; error?: string }>;
    batchRenameFiles: (rootPath: string, operations: { oldPath: string, newName: string }[]) => Promise<{ success: boolean; error?: string }>;
    openZip: (path: string) => Promise<{ success: boolean; tempPath?: string; files?: any[]; pageCount?: number; error?: string }>;
    getZipCover: (path: string) => Promise<string | null>;
}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}
