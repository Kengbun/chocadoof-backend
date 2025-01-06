const bcrypt = require('bcrypt');
const { User } = require('../models');  // อ้างอิงจากโมเดล User ของคุณ (หากใช้ Sequelize)
const jwt = require('jsonwebtoken');

// ฟังก์ชันการเพิ่มบัญชี admin ใหม่
const createAdminAccount = async () => {
    try {
        // ตรวจสอบว่ามีบัญชี admin อยู่แล้วหรือไม่
        const existingAdmin = await User.findOne({ where: { role: 'admin' } });

        if (existingAdmin) {
            console.log('บัญชี admin อยู่แล้วในระบบ');
            return;
        }

        // ข้อมูลบัญชี admin
        const name = 'Admin';
        const email = 'admin@example.com';
        const password = 'adminpassword123';  

        // เข้ารหัสรหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10);  // เข้ารหัสด้วย bcrypt

        // สร้างบัญชี admin ใหม่
        const newAdmin = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'admin',  // กำหนด role เป็น admin
            is_verified: true, // กำหนดสถานะว่าได้รับการยืนยัน
        });

        console.log('บัญชี admin ถูกสร้างเรียบร้อยแล้ว:', newAdmin);
    } catch (err) {
        console.error('เกิดข้อผิดพลาดในการสร้างบัญชี admin:', err);
    }
};

// เรียกใช้ฟังก์ชันสร้าง admin
module.exports = createAdminAccount;
