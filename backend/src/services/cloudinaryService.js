const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryService {
  /**
   * Uploads a base64 string or file path to Cloudinary.
   * @param {string} file - Base64 string or file path.
   * @param {string} folder - Destination folder in Cloudinary.
   * @returns {Promise<string>} The secure URL of the uploaded media.
   */
  async uploadMedia(file, folder = 'smartmeal_ai') {
    try {
      const result = await cloudinary.uploader.upload(file, {
        folder: folder,
        resource_type: 'auto', // Automatically detect image, video, or raw (PDF)
      });
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload media to Cloudinary');
    }
  }
}

module.exports = new CloudinaryService();
