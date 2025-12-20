const electron = require('electron');
const { app, BrowserWindow, ipcMain, dialog, protocol, Menu, shell, net } = electron;
import path from 'path';
import fs from 'fs';
import chokidar from 'chokidar';
import AdmZip from 'adm-zip'; // Import adm-zip

// Handle creating/removing shortcuts on Windows when installing/uninstalling.

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}


protocol.registerSchemesAsPrivileged([
  { scheme: 'media', privileges: { secure: true, supportFetchAPI: true, bypassCSP: true, stream: true, corsEnabled: true } }
]);

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#111827', // dark gray-900 to prevent white flash
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Temporarily disable webSecurity to rule out any other blocking issues
    },
  });

  // Load the index.html of the app.
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
  // Register 'media' protocol to serve local files
  protocol.handle('media', async (request) => {
    try {
      // 1. Parse the URL
      // request.url is like "media://C%3A%5Cpath%5Cto%5Cfile.png" or "media:///C:/path/to/file.png"
      let filePath = request.url.slice('media://'.length);

      // If it starts with a slash (media:///...), remove it to get to the drive letter/root
      // But careful: media://C:... -> C:...
      // media:///C:... -> /C:... -> C:... on Windows?

      // Let's decode first.
      const decodedUrl = decodeURIComponent(filePath);

      // Normalize path:
      // If it starts with '/', remove it IF it precedes a drive letter (Windows).
      // On Windows, /C:/Users... should become C:/Users...
      // On Mac/Linux, /Users... stays /Users...

      let p = decodedUrl;
      if (process.platform === 'win32') {
        if (p.startsWith('/') || p.startsWith('\\')) {
          p = p.slice(1);
        }
      }

      // Resolve absolute path
      const absolutePath = path.resolve(p);
      console.log('Media Protocol Request:', expandedUrl = request.url, ' -> ', absolutePath);

      // 2. MIME Type Detection
      const ext = path.extname(absolutePath).toLowerCase();
      let mimeType = 'application/octet-stream';
      const mimeMap: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.ogg': 'video/ogg',
        '.mov': 'video/quicktime',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav'
      };
      if (mimeMap[ext]) mimeType = mimeMap[ext];

      // 3. Create Stream
      // fs.createReadStream returns a node Readable stream.
      // We assume Electron's `Response` can handle a Buffer or similar, but for streaming video,
      // we ideally want a Web ReadableStream.
      // However, Electron's `net.fetch` return type (Response) expects a body that can be a Blob, BufferSource, FormData, URLSearchParams, or ReadableStream.
      // Node's Readable is NOT a Web ReadableStream. 
      // We must convert it or read the file.
      // For large videos, reading fully into memory is bad.

      // Attempt to use `Readable.toWeb` (Node 16+)
      const { Readable } = await import('stream');
      const nodeStream = fs.createReadStream(absolutePath);

      // Handle file open errors
      // nodeStream.on('error', (err) => { console.error('Stream error:', err); });

      // Convert to Web Stream
      // @ts-ignore: Readable.toWeb is available in newer Node types but might be missing in older definitions
      const webStream = Readable.toWeb(nodeStream);

      return new Response(webStream as any, {
        headers: {
          'Content-Type': mimeType,
          'Access-Control-Allow-Origin': '*'
        }
      });

    } catch (e: any) {
      console.error('Media protocol error:', e);
      return new Response('Error loading media', { status: 500 });
    }
  });

  createWindow();

  const isMac = process.platform === 'darwin';

  const template: any[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Folder',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow!, {
              properties: ['openDirectory'],
            });
            if (!result.canceled && result.filePaths.length > 0) {
              mainWindow?.webContents.send('folder-selected', result.filePaths[0]);
            }
          },
        },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://electronjs.org');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // IPC Handlers
  ipcMain.handle('get-files', async (event: Electron.IpcMainInvokeEvent, dirPath: string) => {
    // console.log('IPC: get-files recursive called for path:', dirPath);
    try {
      async function getEntriesRecursively(currentPath: string): Promise<any[]> {
        const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });
        const result = [];

        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name);
          if (entry.isDirectory()) {
            if (entry.name.startsWith('.')) continue; // Skip hidden folders like .ag_covers
            result.push({
              name: entry.name,
              isDirectory: true,
              path: fullPath
            });
            // Recurse
            const subEntries = await getEntriesRecursively(fullPath);
            result.push(...subEntries);
          } else {
            result.push({
              name: entry.name,
              isDirectory: false,
              path: fullPath
            });
          }
        }
        return result;
      }

      const mappedFiles = await getEntriesRecursively(dirPath);

      // Sort: Directories first, then files. Alphabetical.
      // Actually, simple alphabetical is usually best for a flat list, but maybe folders first?
      // User view is "Flat", so sorting by name regardless of type might be confusing if they see Folder A, File B, Folder C.
      // But standard windows explorer is Folders first.
      mappedFiles.sort((a, b) => {
        // return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        // Just simple sort for now to match file system order roughly
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      });

      console.log(`Found ${mappedFiles.length} recursive entries`);
      return mappedFiles;
    } catch (error: any) {
      console.error('Error reading directory:', error);
      throw error;
    }
  });

  ipcMain.handle('open-folder-dialog', async () => {
    console.log('IPC: open-folder-dialog called');
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openDirectory'],
    });
    console.log('Dialog result:', result);
    if (result.canceled) {
      return null;
    }
    return result.filePaths[0];
  });

  ipcMain.handle('delete-file', async (event: Electron.IpcMainInvokeEvent, filePath: string) => {
    console.log('IPC: delete-file called for:', filePath);
    try {
      await fs.promises.unlink(filePath);
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting file:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('rename-file', async (event: Electron.IpcMainInvokeEvent, oldPath: string, newName: string) => {
    console.log('IPC: rename-file called:', oldPath, '->', newName);
    try {
      const dir = path.dirname(oldPath);
      const newPath = path.join(dir, newName);

      // Check if target exists
      try {
        await fs.promises.access(newPath);
        return { success: false, error: 'Target file already exists. Use Batch Rename for swapping names.' };
      } catch (e) {
        // Target doesn't exist, proceed
      }

      await fs.promises.rename(oldPath, newPath);
      return { success: true, newPath };
    } catch (error: any) {
      console.error('Error renaming file:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('batch-rename-files', async (event: Electron.IpcMainInvokeEvent, rootPath: string, operations: { oldPath: string, newName: string }[]) => {
    console.log(`IPC: batch-rename-files called with ${operations.length} operations in ${rootPath}`);
    const tempDir = path.join(rootPath, '.ag_temp_batch');
    const results: { success: boolean; error?: string } = { success: true };

    try {
      // 1. Create Temp Directory
      if (!fs.existsSync(tempDir)) {
        await fs.promises.mkdir(tempDir);
      }

      // 2. Phase 1: Evacuate to Temp
      // We map original paths to their temp paths
      const tempMap: { [key: string]: string } = {};

      for (const op of operations) {
        const fileName = path.basename(op.oldPath);
        const tempPath = path.join(tempDir, fileName);
        try {
          await fs.promises.rename(op.oldPath, tempPath);
          tempMap[op.oldPath] = tempPath;
        } catch (e: any) {
          console.error(`Failed to move ${fileName} to temp:`, e);
          // If we fail to move a file to temp, we should probably abort? 
          // Or skip? Aborting is safer but requires rollback.
          // Let's mark as error and STOP.
          throw new Error(`Failed to verify/move file ${fileName} to temp: ${e.message}`);
        }
      }

      // 3. Phase 2: Restore with New Name
      for (const op of operations) {
        const tempPath = tempMap[op.oldPath];
        if (!tempPath) continue; // Should have failed above if missing

        const finalPath = path.join(rootPath, op.newName);
        try {
          await fs.promises.rename(tempPath, finalPath);
        } catch (e: any) {
          console.error(`Failed to move ${path.basename(tempPath)} to ${op.newName}:`, e);
          // Critical failure: File is stuck in temp.
          // We return logic error.
          throw new Error(`Failed to restore ${op.newName}: ${e.message}`);
        }
      }

      // 4. Cleanup
      await fs.promises.rmdir(tempDir);
      return { success: true };

    } catch (error: any) {
      console.error('Batch rename failed:', error);
      // Attempt generic cleanup if dir exists and is empty, but leave files if stuck for safety
      try {
        if (fs.existsSync(tempDir) && (await fs.promises.readdir(tempDir)).length === 0) {
          await fs.promises.rmdir(tempDir);
        }
      } catch (cleanupErr) { console.error('Cleanup error:', cleanupErr); }

      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('open-zip', async (event: Electron.IpcMainInvokeEvent, zipPath: string) => {
    console.log('IPC: open-zip called for:', zipPath);
    try {
      const zip = new AdmZip(zipPath);
      const zipEntries = zip.getEntries();

      // Create a temp directory for this ZIP
      // Use a hash or just basename + timestamp to avoid collisions
      const zipName = path.basename(zipPath);
      const tempDirName = `.ag_zip_${zipName}_${Date.now()}`;
      const tempDirPath = path.join(path.dirname(zipPath), tempDirName);

      if (!fs.existsSync(tempDirPath)) {
        fs.mkdirSync(tempDirPath, { recursive: true });
      }

      // Extract Async or Sync? adm-zip is sync unless using async methods which are callback based.
      // Sync is easier for now, but might freeze UI for large zips.
      // Let's use extractAllTo.

      console.log(`Extracting ${zipEntries.length} entries to ${tempDirPath}`);
      zip.extractAllTo(tempDirPath, true);

      // Scan the temp dir for files
      async function getFilesRecursively(currentPath: string): Promise<any[]> {
        const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });
        const result = [];
        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name);
          if (entry.isDirectory()) {
            result.push(...await getFilesRecursively(fullPath));
          } else {
            // Filter for media types? Or let frontend do it?
            // Let's return all, frontend filters.
            result.push({
              name: entry.name,
              isDirectory: false,
              path: fullPath
            });
          }
        }
        return result;
      }

      const files = await getFilesRecursively(tempDirPath);
      // Sort by name (natural sort)
      files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

      return {
        success: true,
        tempPath: tempDirPath,
        files: files,
        pageCount: files.length // Total files (approx page count)
      };

    } catch (error: any) {
      console.error('Failed to open ZIP:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-zip-cover', async (event: Electron.IpcMainInvokeEvent, zipPath: string) => {
    // Return first image as cover
    try {
      const zipName = path.basename(zipPath);
      const coverCacheDir = path.join(path.dirname(zipPath), '.ag_covers');

      // Ensure cache dir exists
      if (!fs.existsSync(coverCacheDir)) {
        // Hide it if possible? Windows: standard mkdir doesn't hide.
        fs.mkdirSync(coverCacheDir, { recursive: true });
      }

      // We use a simplified cache key: zipName + size? Or just zipName.
      // Collision risk if multiple zips have same name in (conceptually) same folder context?
      // But zipPath implies they are in same folder.
      // Let's use zipName as folder for cover, or prefix.

      // Optimization: Check if cover already exists
      // We'll search for any file starting with `cover_${zipName}`?
      // Or just map it.

      const zip = new AdmZip(zipPath);
      const entries = zip.getEntries();

      // Find first image
      const imageEntry = entries.find(e => /\.(jpg|jpeg|png|webp|gif)$/i.test(e.entryName) && !e.isDirectory && !e.entryName.startsWith('__MACOSX'));

      if (!imageEntry) return null; // No image found

      // Sanitize entry name for filesystem
      const safeEntryName = imageEntry.entryName.replace(/[\/\\]/g, '_');
      const coverPath = path.join(coverCacheDir, `${zipName}_${safeEntryName}`);

      if (fs.existsSync(coverPath)) {
        return coverPath;
      }

      // Extract
      // adm-zip extractEntryTo(entry, targetPath, maintainEntryPath, overwrite)
      // We want flat extract.

      zip.extractEntryTo(imageEntry, coverCacheDir, false, true);

      // adm-zip extracts with original name. We need to rename it to our cache key?
      // Or just trust the extracted name.
      // Issue: if entry is "subfolder/image.jpg", extractEntryTo with maintainEntryPath=false puts "image.jpg" in coverCacheDir.
      // If multiple zips have "001.jpg", they collide.

      // Better: Extract to buffer, write to specific unique path.
      const buffer = zip.readFile(imageEntry);
      if (buffer) {
        await fs.promises.writeFile(coverPath, buffer);
        return coverPath;
      }

      return null;

    } catch (e) {
      console.error('Failed to get zip cover:', zipPath, e);
      return null;
    }
  });

});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
