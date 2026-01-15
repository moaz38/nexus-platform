const multer = require('multer');
const path = require('path');
const fs = require('fs'); // ✅ File System Import kiya

// 1. Folder ka Pakka Rasta (Absolute Path) banao
const uploadDir = path.join(__dirname, '../uploads');

// 2. 🔥 AUTO-FIX: Check karo folder hai ya nahi? Agar nahi hai to BANA DO.
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("✅ Uploads folder created automatically!");
}

// Storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ab hum wahi pakka rasta use karein ge
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    // Name clean karo (spaces hatao)
    const cleanName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${cleanName}`);
  }
});

// File Filter (Sirf Images)
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Images only!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit barha kar 5MB kar di
});

module.exports = upload;