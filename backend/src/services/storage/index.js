const GoogleDriveStorage = require('./GoogleDriveStorage');

// To swap storage: replace this with new S3Storage() or new GCSStorage()
// The interface (upload, getUrl, delete) stays the same.
const storage = new GoogleDriveStorage();

module.exports = storage;
