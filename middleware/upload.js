
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
const productUpload = multer({ 
    storage: storage('products') 
}).fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'additional_image_1', maxCount: 1 },
    { name: 'additional_image_2', maxCount: 1 },
]);

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


