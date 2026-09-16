const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình nơi lưu và tên file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

// Chỉ cho phép upload file ảnh
function fileFilter(req, file, cb) {
  const isValidExt = /^\.(jpe?g|png|webp)$/.test(path.extname(file.originalname).toLowerCase());
  const isValidMime = /^image\/(jpeg|png|webp)$/.test(file.mimetype);

  if (isValidExt && isValidMime) {
    cb(null, true);
  } else {
    cb(Object.assign(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, webp).'), { statusCode: 400 }));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // tối đa 5MB
});

module.exports = upload;
