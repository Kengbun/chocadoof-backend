require('dotenv').config();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, Article, Review } = require('../models');  // เชื่อมต่อกับโมเดล 
const { where } = require('sequelize');


const db = require("../models");
const fs = require('fs');
const path = require('path');
// const Review = require('../models/Review');
const { all } = require('../Routes/products');

const HOST = process.env.HOST;
const EMAIL = process.env.EMAIL;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

// console.log('EMAIL:', process.env.EMAIL); 






if (!EMAIL || !EMAIL_PASSWORD || !JWT_SECRET) {
    throw new Error("Missing environment variables: EMAIL, EMAIL_PASSWORD, or JWT_SECRET",);
}

// ตั้งค่า SMTP สำหรับการส่งอีเมล
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL,
        pass: EMAIL_PASSWORD,
    }
});

// ฟังก์ชันสำหรับการสมัครสมาชิก (Create User)
const createUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบถ้วนหรือไม่
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }

        // ตรวจสอบรูปแบบอีเมล
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'รูปแบบอีเมลไม่ถูกต้อง' });
        }

        // ตรวจสอบความยาวรหัสผ่าน
        if (password.length < 8) {
            return res.status(400).json({ message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' });
        }

        // ตรวจสอบว่ามีผู้ใช้ที่มี email นี้หรือยัง
        const existingemail = await User.findOne({ where: { email } });
        if (existingemail) {
            return res.status(400).send({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
        }

        // ตรวจสอบว่ามีผู้ใช้ name นี้หรือยัง
        const existingUser = await User.findOne({ where: { name } });
        if (existingUser) {
            return res.status(400).send({ message: 'ชื่อนี้ถูกใช้งานแล้ว' });
        }

        // เข้ารหัสรหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10);  // ใช้ salt rounds 10

        // สร้างผู้ใช้ใหม่
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'user',  // ตั้งค่า role เป็น 'user' เสมอ
            is_verified: false, // ตั้งค่า is_verified เป็น false ในตอนแรก
        });

        // ส่งอีเมลยืนยันตัวตน
        await sendVerificationEmail(newUser);

        res.status(201).json({ message: 'สมัครสมาชิกเรียบร้อยแล้ว กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตน' });
    } catch (err) {
        console.error(err);

        // ตรวจสอบชนิดของข้อผิดพลาด
        if (err.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง', errors: err.errors });
        }
        if (err.message.includes('Unable to send verification email')) {
            return res.status(500).json({ message: 'ไม่สามารถส่งอีเมลยืนยันตัวตนได้' });
        }

        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
    }
};

// ฟังก์ชันสำหรับการส่งอีเมลยืนยัน
const sendVerificationEmail = async (user) => {
    const token = jwt.sign({ user_id: user.user_id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    const verificationUrl = `${HOST}/users/verify-email/${token}`;

    // ส่งอีเมลยืนยัน
    const mailOptions = {
        from: EMAIL,
        to: user.email,
        subject: 'ยืนยันอีเมล',
        html: `<p>กรุณาคลิกที่ลิงค์ด้านล่างเพื่อยืนยันอีเมล:</p><a href="${verificationUrl}">ยืนยันอีเมล</a>`,
    };

    await transporter.sendMail(mailOptions);
};

// ฟังก์ชันสำหรับการยืนยันอีเมล
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;  // ดึง token จาก URL

        // ตรวจสอบและ decode token
        const decoded = jwt.verify(token, JWT_SECRET);

        // ค้นหาผู้ใช้จาก email ที่ได้จาก token
        const user = await User.findOne({ where: { email: decoded.email } });

        if (!user) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
        }

        // อัพเดตสถานะการยืนยันอีเมล
        user.is_verified = true;
        await user.save();
        // res.status(200).sendFile(path.join(__dirname, 'http://localhost:3000/login', 'verify-emailtest.html'));
        res.status(200).redirect('http://localhost:3000/login');
        // json({ message: 'ยืนยันอีเมลสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว' });
        // res.redirect('http://localhost:3000/login'); 
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
    }
};

// ฟังก์ชันสำหรับการเข้าสู่ระบบ (Login)
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // ค้นหาผู้ใช้จาก email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'ข้อมูลผู้ใช้ไม่ถูกต้อง' });
        }

        // ตรวจสอบสถานะการยืนยันอีเมล
        if (!user.is_verified) {
            return res.status(400).json({ message: 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ' });
        }

        // ตรวจสอบรหัสผ่าน
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'ข้อมูลผู้ใช้ไม่ถูกต้อง' });
        }

        // สร้าง JWT token
        const token = jwt.sign(
            { user_id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '10h' }
        );
        console.log(token)

        res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
    }
};
const profile = async (req, res) => {
    try {
        const user = await User.findOne({ where: { id: req.user.user_id } }); // ค้นหาผู้ใช้จาก ID ใน decoded payload

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // ส่งข้อมูลผู้ใช้ไปยัง Client พร้อมกับ role
        res.status(200).json({
            id: user.user_id,
            name: user.name,
            email: user.email,
            profile_picture: user.profile_picture,
        });
    } catch (err) {
        console.error('Error in profile function:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// ฟังก์ชันสำหรับการดึงข้อมูลผู้ใช้ทั้งหมด
const listUsers = async (req, res) => {
    // console.log(req.user+ "//////////////////////////////////////////////////");
    try {

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ในการดึงข้อมูลผู้ใช้' });
        };

        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'createdAt']
        });

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
        }

        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
    }
};

// ฟังก์ชันสำหรับการลบผู้ใช้
const deleteUser = async (req, res) => {
    try {

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ในการดึงข้อมูลผู้ใช้' });
        };

        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
        }

        await user.destroy();

        res.status(200).json({ message: 'ลบผู้ใช้สำเร็จ' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
    }
};

// ฟังก์ชั่นอัพเดตข้อมูลผู้ใช้
const updateUser = async (req, res) => {
    // ฟังก์ชันเพื่อดึงชื่อไฟล์จาก URL
    const extractFileName = (url) => {
        return url ? url.split('/').pop() : null;
    };
    try {
        const userId = req.user.user_id; // ดึง user_id จาก token
        const { name } = req.body; // ดึงค่าชื่อจาก body

        // ค้นหาผู้ใช้จากฐานข้อมูล
        const user = await db.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
        }

        // ตรวจสอบว่าไฟล์รูปโปรไฟล์ถูกอัปโหลดหรือไม่
        if (req.file) {
            const pic = extractFileName(user.profile_picture);
            // ลบรูปโปรไฟล์เก่าหากมี
            if (pic) {
                const oldPath = path.join(__dirname,'..', 'uploads/users', pic);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath); // ลบไฟล์เก่า
                }
                console.log("oldPath" + fs.existsSync(oldPath));
                console.log("oldPath" + oldPath);
            }
            // บันทึก path ของรูปโปรไฟล์ใหม่
            user.profile_picture = `${process.env.HOST}/uploads/users/${req.file.filename}`;
        }
        // อัปเดตข้อมูลในฐานข้อมูล
        await user.update({
            name,
            profile_picture: user.profile_picture,
        });
        res.status(200).json({ message: 'User updated successfully' });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
    }
};

const dashboard = async (req, res) => {
    console.log("//////////////////////////////////////");

    try {

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ในการดึงข้อมูลผู้ใช้' });
        };

        // console.log('User model:', User);
        // console.log('Review model:', Review);
        // console.log('Articles model:', Article);


        const allUsers = await User.count();
        const allReviews = await Review.count();
        const allArticles = await Article.count();

        // console.log(allUsers);
        // console.log(allReviews);
        // console.log(allArticles);
       
        
        res.status(200).json({ allUsers, allReviews, allArticles });  // ส่งข้อมูลผู้ใช้ไปยัง Client
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
    }
};




module.exports = {
    createUser,
    verifyEmail,
    loginUser,
    listUsers,
    deleteUser,
    profile,
    updateUser,
    dashboard
};
