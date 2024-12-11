const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;  // เปลี่ยนให้ตรงกับ secret ของคุณ

// ฟังก์ชัน middleware สำหรับตรวจสอบ JWT ก่อนเข้าถึง API
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];  // รับ token จาก header Authorization

    if (!token) {
        return res.status(401).json({ message: 'ไม่พบ token หรือ token หมดอายุ' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
        }

        req.user = user;  // นำข้อมูลผู้ใช้ที่ถูก decode มาเก็บใน req.user
        next();
    });
};

module.exports = { authenticateToken };
