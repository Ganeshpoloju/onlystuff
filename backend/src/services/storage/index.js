const LocalStorage = require('./LocalStorage');
// const GoogleDriveStorage = require('./GoogleDriveStorage');
// const S3Storage = require('./S3Storage');
// const GCSStorage = require('./GCSStorage');

// Active storage: LocalStorage for prototype
// Swap to S3/GCS by changing this one line — interface is identical
const storage = new LocalStorage();

module.exports = storage;
