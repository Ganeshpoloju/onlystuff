const { google } = require('googleapis');
const { Readable } = require('stream');
const StorageService = require('./StorageService');

class GoogleDriveStorage extends StorageService {
  constructor() {
    super();
    // OAuth2 with personal account refresh token — no service account needed
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
    });
    this.drive = google.drive({ version: 'v3', auth: oauth2Client });
    this.rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  }

  async _getOrCreateFolder(name) {
    const res = await this.drive.files.list({
      q: `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${this.rootFolderId}' in parents and trashed=false`,
      fields: 'files(id)',
    });
    if (res.data.files.length > 0) return res.data.files[0].id;
    const folder = await this.drive.files.create({
      requestBody: { name, mimeType: 'application/vnd.google-apps.folder', parents: [this.rootFolderId] },
      fields: 'id',
    });
    return folder.data.id;
  }

  async upload(buffer, filePath, mimeType) {
    const parts = filePath.split('/');
    const fileName = parts.pop();
    const folderName = parts[0] || 'uploads';

    const folderId = await this._getOrCreateFolder(folderName);
    const stream = Readable.from(buffer);

    const res = await this.drive.files.create({
      requestBody: { name: fileName, parents: [folderId] },
      media: { mimeType, body: stream },
      fields: 'id',
    });

    // Make file publicly readable
    await this.drive.permissions.create({
      fileId: res.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    return `https://drive.google.com/uc?export=view&id=${res.data.id}`;
  }

  async getUrl(fileId) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  async delete(fileId) {
    await this.drive.files.delete({ fileId });
  }
}

module.exports = GoogleDriveStorage;
