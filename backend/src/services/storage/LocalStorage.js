const fs = require('fs');
const path = require('path');
const StorageService = require('./StorageService');

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

class LocalStorage extends StorageService {
  constructor() {
    super();
    // Ensure base upload directory exists
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  async upload(buffer, filePath, mimeType) {
    const parts = filePath.split('/');
    const fileName = parts.pop();
    const subDir = path.join(UPLOAD_DIR, ...parts);
    if (!fs.existsSync(subDir)) fs.mkdirSync(subDir, { recursive: true });

    const dest = path.join(subDir, fileName);
    fs.writeFileSync(dest, buffer);

    // Return a URL path relative to the server
    return `/uploads/${parts.join('/')}/${fileName}`.replace(/\/+/g, '/');
  }

  async getUrl(filePath) {
    return filePath;
  }

  async delete(filePath) {
    const abs = path.join(UPLOAD_DIR, filePath.replace('/uploads/', ''));
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  }
}

module.exports = LocalStorage;
