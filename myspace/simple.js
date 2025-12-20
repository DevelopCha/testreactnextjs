const { app, BrowserWindow } = require('electron');

app.whenReady().then(() => {
    const win = new BrowserWindow({ width: 800, height: 600 });
    win.loadURL('https://google.com');
    console.log('Window created');
    setTimeout(() => app.quit(), 3000);
});
