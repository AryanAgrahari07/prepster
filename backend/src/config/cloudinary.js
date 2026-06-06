const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a buffer or local file path to Cloudinary
 * @param {Buffer|string} file
 * @param {object} options - folder, resource_type, format, etc.
 */
const uploadToCloudinary = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'prepster',
      resource_type: options.resource_type || 'auto',
      ...options,
    };

    if (Buffer.isBuffer(file)) {
      const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
      stream.end(file);
    } else {
      cloudinary.uploader.upload(file, uploadOptions, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    }
  });
};

const deleteFromCloudinary = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary };
