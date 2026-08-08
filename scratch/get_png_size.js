import fs from 'fs';

try {
  const buf = fs.readFileSync('c:\\Users\\RAGHAV\\Downloads\\Screenshot 2026-08-08 224141.png');
  // PNG dimensions are stored at offset 16 (width) and 20 (height) as 4-byte big-endian integers
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  console.log('PNG Dimensions:', { width, height });
} catch (e) {
  console.error('Error:', e.message);
}
