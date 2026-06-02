/**
 * Abstract storage interface.
 * Swap implementation (Google Drive → S3 → GCS) by replacing the concrete class.
 */
class StorageService {
  async upload(buffer, path, mimeType) { throw new Error('Not implemented'); }
  async getUrl(fileId) { throw new Error('Not implemented'); }
  async delete(fileId) { throw new Error('Not implemented'); }
}

module.exports = StorageService;
