const originalPaths = module.paths;
module.paths = module.paths.filter(p => !p.includes('node_modules'));
console.log('Modified paths length:', module.paths.length);

let electron;
try {
    electron = require('electron');
} catch (e) {
    console.log('Require failed:', e.message);
}
module.paths = originalPaths;

console.log('Electron type:', typeof electron);
console.log('Electron value:', electron);
console.log('Versions:', process.versions);
console.log('ELECTRON_RUN_AS_NODE:', process.env.ELECTRON_RUN_AS_NODE);

if (typeof electron === 'string' || !electron) {
    console.log('FAIL: Electron is not the API object.');
} else {
    console.log('SUCCESS: Electron is an object.');
}
