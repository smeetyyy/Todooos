const multer = require('multer');

const allowedExtensions = ['.jpeg', 'jpg', '.png', 'bmp', 'psd', '.dng', 'raw', 'tiff', '.gif']

module.exports = multer({
    limits: {
        fileSize: 5000000
    },
    fileFilter(req, file, cb) {
        const found = allowedExtensions.filter((item) => {
            return file.originalname.endsWith(item);
        });

        if (found.length <= 0) {
            return cb(new Error('The file type is not supported.'));
        }

        cb(undefined, true);
    }
});