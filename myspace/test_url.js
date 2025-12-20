
const url = require('url');

function test(inputUrl) {
    console.log(`Testing URL: ${inputUrl}`);
    let filePath = inputUrl.slice('media://'.length);
    if (filePath.startsWith('/')) {
        filePath = filePath.slice(1);
    }
    const decodedPath = decodeURIComponent(filePath);
    console.log(`Decoded Path: ${decodedPath}`);

    try {
        const fileUrl = url.pathToFileURL(decodedPath).href;
        console.log(`File URL: ${fileUrl}`);
    } catch (e) {
        console.error(`Error converting to File URL: ${e.message}`);
    }
    console.log('---');
}

// Case 1: Current Frontend Logic (Host?)
const p1 = 'C:\\Users\\Test\\Image.png';
const enc1 = encodeURIComponent(p1); // C%3A%5CUsers%5CTest%5CImage.png
test(`media://${enc1}`);

// Case 2: Lowercase Host (Browser behavior?)
test(`media://${enc1.toLowerCase()}`);

// Case 3: Proposed Fix (Path)
test(`media:///${enc1}`);

