const db = require("../models");
const fs = require('fs');
const path = require('path');



// ฟังก์ชันเพื่อลบไฟล์ถ้ามี
const removeFileIfExist = async (fileName) => {
    const filePath = path.join(__dirname, '..', 'uploads/articles', fileName); // กำหนดพาธไฟล์ที่ต้องการลบ

    try {
        if (fs.existsSync(filePath)) { // ตรวจสอบว่าไฟล์มีอยู่จริง
            fs.unlinkSync(filePath); // ลบไฟล์
            console.log(`File ${fileName} deleted successfully`);
        }
    } catch (err) {
        console.error('Error deleting file:', err);
    }
};

// ดึงบทความทั้งหมดจากฐานข้อมูล
const adminArticleList = async (req, res) => {
    try {
        const articles = await db.Article.findAll();
        res.status(200).json(articles);
    } catch (err) {
        console.error("Error fetching articles:", err);
        res.status(500).send({ message: "Error fetching articles." });
    }
}

// ดึงบทความตาม user_id
const userArticle = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const articles = await db.Article.findAll({
            where: {
                user_id: user_id
            }
        });
        res.status(200).json(articles);
        console.log(user_id);
       
    } catch (err) {
        console.error("Error fetching articles:", err);
        res.status(500).send({ message: "Error fetching articles." });
    }
};

// ดึงบทความทั้งหมดจากฐานข้อมูล
const listArticle = async (req, res) => {
    try {
        // ดึงบทความทั้งหมด
        const articles = await db.Article.findAll();

        // ดึงข้อมูลผู้ใช้ (user) ที่เกี่ยวข้อง
        const userIds = articles.map(article => article.user_id); // เก็บ user_id ทั้งหมด
        const uniqueUserIds = [...new Set(userIds)]; // กรอง user_id ที่ซ้ำออก

        const users = await db.User.findAll({
            where: { id: uniqueUserIds }, // ดึงเฉพาะ user_id ที่เกี่ยวข้อง
            attributes: ['id', 'name', 'profile_picture'] // เลือกเฉพาะข้อมูลที่ต้องการ
        });

        // รวมข้อมูล User เข้ากับ Article
        const result = articles.map(article => {
            const author = users.find(user => user.id === article.user_id);
            
            return {
                ...article.dataValues,
                author // เพิ่มข้อมูลผู้เขียน
            };
        });

        res.status(200).json(result);
    } catch (err) {
        console.error("Error fetching articles:", err);
        res.status(500).send({ message: "Error fetching articles." });
    }
};

const readArticle = async (req, res) => {
    try {
        const { id } = req.params;  // ดึง ID จาก URL params

        // ใช้ findByPk เพื่อค้นหาบทความจาก ID
        const article = await db.Article.findByPk(id);

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        // ดึงข้อมูลผู้เขียน
        const user = await db.User.findOne({
            where: { id: article.user_id },
            attributes: ['name', 'profile_picture'] // ดึงเฉพาะชื่อและรูปภาพ
        });

        // รวมข้อมูลบทความและผู้เขียน
        res.status(200).json({
            ...article.dataValues, // รวมข้อมูลบทความ
            author: user || { name: 'Unknown', profile_picture: null } // เพิ่มข้อมูลผู้เขียน
        });
    } catch (err) {
        console.error("Error fetching article:", err);
        res.status(500).send({ message: "Server Error" });
    }
};


const createArticle = async (req, res) => {
    try {
        // console.log("req.body" , req.body)
        // ตรวจสอบว่าไฟล์ถูกอัพโหลดมาหรือไม่

        // รับค่าจาก req.body
        const { title, category, content } = req.body;
        const coverImage = req.files['coverImage'] ? req.files['coverImage'][0] : null;
        const contentImage = req.files['contentImage'] ? req.files['contentImage'][0] : null;

        // สร้าง URL สำหรับไฟล์ที่อัพโหลด
        const coverImageUrl = coverImage ? process.env.HOST + "/uploads/articles/" + coverImage.filename : null;
        const contentImageUrl = contentImage ? process.env.HOST + "/uploads/articles/" + contentImage.filename : null;


        // console.log(req.body)
        // console.log(coverImage)
        // console.log(contentImage)
        // console.log(user_id)
        
        // console.log(data)
        
        const newArticle = await db.Article.create({
            title,
            category,
            coverImage: coverImageUrl, // ใช้ URL ของไฟล์
            contentImage: contentImageUrl, // ใช้ URL ของไฟล์เพิ่มเติม
            content,
            user_id: req.user.user_id, // เพิ่ม user_id จาก token
        });
        // res.send("kk");
        res.status(201).send(newArticle);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "เกิดข้อผิดพลาดที่เซิฟเวอร์" });
    }
};

const updateArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, content } = req.body;

        console.log(req.body);  // ตรวจสอบว่า body ได้ข้อมูลตามที่คาดไว้
        console.log(req.files);  // ตรวจสอบไฟล์ที่ได้รับ

        // รับไฟล์จาก form-data (ไฟล์ที่ถูกอัปโหลดในฟิลด์ coverImage และ contentImage)
        const coverImage = req.files?.coverImage ? req.files.coverImage[0].filename : null;
        const contentImage = req.files?.contentImage ? req.files.contentImage[0].filename : null;

        // ค้นหาบทความในฐานข้อมูล
        const article = await db.Article.findByPk(id);
        if (!article) {
            return res.status(404).send({ message: "ไม่พบบทความ" });
        }

        // ฟังก์ชันเพื่อดึงชื่อไฟล์จาก URL
        const extractFileName = (url) => {
            return url ? url.split('/').pop() : null;
        };

        // ลบไฟล์เก่า (ถ้ามี)
        const oldCoverImage = extractFileName(article.coverImage);
        const oldContentImage = extractFileName(article.contentImage);

        if (coverImage && oldCoverImage && oldCoverImage !== coverImage) {
            await removeFileIfExist(oldCoverImage); // ลบ coverImage เก่า
        }

        if (contentImage && oldContentImage && oldContentImage !== contentImage) {
            await removeFileIfExist(oldContentImage); // ลบ contentImage เก่า
        }

        // อัปเดตบทความ
        await article.update({
            title,
            category,
            content,
            coverImage: coverImage ? `${process.env.HOST}/uploads/articles/${coverImage}` : article.coverImage,
            contentImage: contentImage ? `${process.env.HOST}/uploads/articles/${contentImage}` : article.contentImage
        });

        res.status(200).send({ message: "อัปเดตบทความสําเร็จ" });
    } catch (err) {
        console.error("Error updating article:", err);
        res.status(500).send({ message: "เกิดข้อผิดพลาดที่เซิฟเวอร์" });
    }
};


const deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;  // ดึง ID จาก URL params

        // ค้นหาบทความจากฐานข้อมูล
        const article = await db.Article.findByPk(id);
        if (!article) {
            return res.status(404).json({ message: "ไม่พบบทความ" });
        }

        // ฟังก์ชันเพื่อดึงชื่อไฟล์จาก URL
        const extractFileName = (url) => {
            return url ? url.split('/').pop() : null;
        };

        // ดึงชื่อไฟล์จาก URL ของบทความ
        const CoverImage = extractFileName(article.coverImage);
        const ContentImage = extractFileName(article.contentImage);

        // ลบไฟล์ (ถ้ามี)
        if (CoverImage) removeFileIfExist(CoverImage);
        if (ContentImage) removeFileIfExist(ContentImage);

        // ลบบทความจากฐานข้อมูล
        await article.destroy();
        res.status(200).json({ message: "ลบบทความสําเร็จ" });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "เกิดข้อผิดพลาดที่เซิฟเวอร์" });
    }
};

module.exports = {
    readArticle,
    listArticle,
    createArticle,
    updateArticle,
    deleteArticle,
    userArticle,
    adminArticleList,
};
