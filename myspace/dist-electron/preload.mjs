// electron/preload.ts
import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electronAPI", {
  getFiles: (path) => ipcRenderer.invoke("get-files", path),
  openFolderDialog: () => ipcRenderer.invoke("open-folder-dialog"),
  onFolderSelected: (callback) => ipcRenderer.on("folder-selected", (_event, path) => callback(path)),
  deleteFile: (path) => ipcRenderer.invoke("delete-file", path),
  renameFile: (oldPath, newName) => ipcRenderer.invoke("rename-file", oldPath, newName)
});
