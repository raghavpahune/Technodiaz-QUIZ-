import fs from 'fs';


function getJpegSize(filePath) {
  const buf = fs.readFileSync(filePath);
  let i = 2; // skip SOI
  while (i < buf.length) {
    if (buf[i] !== 0xFF) {
      throw new Error('Invalid JPEG marker');
    }
    const marker = buf[i + 1];
    if (marker === 0xD9 || marker === 0xDA) {
      break; // End of image or Start of scan
    }
    const size = buf.readUInt16BE(i + 2);
    if (marker === 0xC0 || marker === 0xC2) {
      const height = buf.readUInt16BE(i + 5);
      const width = buf.readUInt16BE(i + 7);
      return { width, height };
    }
    i += 2 + size;
  }
  return null;
}

try {
  const size = getJpegSize('public/badge.jpeg');
  console.log('Badge Dimensions:', size);
} catch (e) {
  console.error('Error parsing size:', e.message);
}
