// const multer = require('multer');

// // ตั้งค่า storage สำหรับ multer
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './uploads'); // กำหนดโฟลเดอร์ปลายทางที่ไฟล์จะถูกบันทึก
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, uniqueSuffix + file.originalname); // ตั้งชื่อไฟล์ให้ไม่ซ้ำกัน
//     }
// });

// // สร้าง instance ของ multer โดยใช้ storage ที่กำหนดไว้
// const upload = multer({ storage: storage });

// // ส่งออก upload.fields() สำหรับหลายฟิลด์
// module.exports.upload = upload.fields([
//     { name: 'coverImage', maxCount: 1 },       // ฟิลด์ coverImage จำกัด 1 ไฟล์
//     { name: 'additionalImage', maxCount: 1 }   // ฟิลด์ additionalImage จำกัด 1 ไฟล์
// ]);

// multerMiddleware.js
const multer = require('multer');
const path = require('path');

// ฟังก์ชัน storage ที่รองรับการเก็บไฟล์ในโฟลเดอร์แยกตามประเภท
const storage = (folderName) => multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `./uploads/${folderName}`); // กำหนดโฟลเดอร์ที่จะแยกตามประเภทไฟล์
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // ตั้งชื่อไฟล์ให้ไม่ซ้ำกัน
    }
});

// Middleware สำหรับการอัปโหลดไฟล์ของ Product
const productUpload = multer({ storage: storage('products') });

// Middleware สำหรับการอัปโหลดไฟล์ของ User
const userUpload = multer({ storage: storage('users') });

// Middleware สำหรับการอัปโหลดไฟล์ของ Articles (บทความ)
const uploadArticles = multer({
    storage: storage('articles')
}).fields([
    { name: 'coverImage', maxCount: 1 },       // ฟิลด์ coverImage จำกัด 1 ไฟล์
    { name: 'contentImage', maxCount: 1 }   // ฟิลด์ contentImage จำกัด 1 ไฟล์
]);

// ส่งออก middleware
module.exports = { productUpload, userUpload, uploadArticles };

// const multer = require('multer');
// const path = require('path');

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, './uploads/articles');
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + path.extname(file.originalname);
//         cb(null, uniqueSuffix);
//     },
// });

// const uploadArticles = multer({ storage }).fields([
//     { name: 'coverImage', maxCount: 1 },
//     { name: 'contentImage', maxCount: 1 },
// ]);

// module.exports = { uploadArticles };

