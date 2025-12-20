// electron/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("electronAPI", {
  getFiles: (path) => import_electron.ipcRenderer.invoke("get-files", path),
  openFolderDialog: () => import_electron.ipcRenderer.invoke("open-folder-dialog"),
  onFolderSelected: (callback) => import_electron.ipcRenderer.on("folder-selected", (_event, path) => callback(path)),
  deleteFile: (path) => import_electron.ipcRenderer.invoke("delete-file", path),
  renameFile: (oldPath, newName) => import_electron.ipcRenderer.invoke("rename-file", oldPath, newName),
  batchRenameFiles: (rootPath, operations) => import_electron.ipcRenderer.invoke("batch-rename-files", rootPath, operations),
  openZip: (path) => import_electron.ipcRenderer.invoke("open-zip", path),
  getZipCover: (path) => import_electron.ipcRenderer.invoke("get-zip-cover", path)
});
