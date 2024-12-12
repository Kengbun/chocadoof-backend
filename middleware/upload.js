const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads') // กำหนดโฟลเดอร์ปลายทางที่ไฟล์จะถูกบันทึก
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + file.originalname); // ตั้งชื่อไฟล์ให้ไม่ซ้ำกัน
    }
});

exports.upload = multer({ storage: storage }).fields([
    { name: 'coverImage', maxCount: 1 },       // รูปภาพหน้าปก (1 ไฟล์)
    { name: 'additionalImage', maxCount: 1 }, // รูปภาพเพิ่มเติม (1 ไฟล์)
]);
