const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

// ฟังก์ชันสำหรับการตรวจสอบ token
const authenticateToken = (req, res, next) => {
    const token = req.headers.authtoken?.split(' ')[1]; // ดึง token จาก header
    // console.log(token);
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Token not found' });
    }
    
    // ตรวจสอบ token 
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden: Invalid token' });
        }
        req.user = user; // เก็บข้อมูล user ที่ decoded จาก JWT
        next();
    });
};

// ฟังก์ชันสำหรับการตรวจสอบสิทธิ์ role
const authorizeRole = (roles) => {
    return (req, res, next) => {
        const { role } = req.user; // ดึง role จากข้อมูล user ที่ decoded
        if (!roles.includes(role)) {
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์เข้าถึง' });
        }
        next();
    };
};

module.exports = { authenticateToken, authorizeRole };
