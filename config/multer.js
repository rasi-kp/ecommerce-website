const multer = require('multer');
const mimeTypes = require('mime-types');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/products-images/');
  },
  filename: function (req, file, cb) {
    const extension = mimeTypes.extension(file.mimetype);
    cb(null, file.fieldname + '-' + Date.now() + '.' + extension);
  },
});

const fileFilter = (req, file, cb) => {
  // Validate file type
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB file size limit
  },
  fileFilter: fileFilter,
});

module.exports = upload;