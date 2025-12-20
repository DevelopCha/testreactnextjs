// electron/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("electronAPI", {
  getFiles: (path) => import_electron.ipcRenderer.invoke("get-files", path),
  openFolderDialog: () => import_electron.ipcRenderer.invoke("open-folder-dialog"),
  onFolderSelected: (callback) => import_electron.ipcRenderer.on("folder-selected", (_event, path) => callback(path))
});
