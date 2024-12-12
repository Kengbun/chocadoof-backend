const db = require("../models");
const fs = require('fs').promises;

// ดึงบทความทั้งหมดจากฐานข้อมูล
const listArticle = async (req, res) => {
    try {
        const articles = await db.Article.findAll();
        res.status(200).json(articles);
    } catch (err) {
        console.log(err);
        res.status(404).send({ message: "Article not found." });
    }
};

const readArticle = async (req, res) => {
    try {
        const { id } = req.params;  // ดึง ID จาก URL params
        const article = await db.Article.findByPk(id);  // ใช้ findByPk เพื่อค้นหาบทความจาก ID

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        res.status(200).json(article);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Server Error" });
    }
};

const createArticle = async (req, res) => {
    try {
        // console.log(req.fields)
        // ตรวจสอบว่าไฟล์ถูกอัพโหลดมาหรือไม่
        const { title, category, content } = req.body;
        const coverImage = req.files['coverImage'] ? req.files['coverImage'][0] : null;
        const additionalImage = req.files['additionalImage'] ? req.files['additionalImage'][0] : null;

        // สร้าง URL สำหรับไฟล์ที่อัพโหลด
        const coverImageUrl = coverImage ? process.env.HOST + "/uploads/" + coverImage.filename : null;
        const additionalImageUrl = additionalImage ? process.env.HOST + "/uploads/" + additionalImage.filename : null;


        console.log(req.body)
        console.log(coverImage)
        console.log(additionalImage)
        
        // console.log(data)
        
        const newArticle = await db.Article.create({
            title,
            category,
            coverImage: coverImageUrl, // ใช้ URL ของไฟล์
            contentImage: additionalImageUrl, // ใช้ URL ของไฟล์เพิ่มเติม
            content,
        });
        // res.send("kk");
        res.status(201).send(newArticle);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Server Error" });
    }
};

const updateArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, content } = req.body;

        // รับไฟล์จาก form-data
        const coverImage = req.file ? req.file.filename : null;
        const additionalImage = req.files?.additionalImage ? req.files.additionalImage[0].filename : null;

        // ค้นหาบทความในฐานข้อมูล
        const article = await db.Article.findByPk(id);
        if (!article) {
            return res.status(404).send({ message: "Article not found" });
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

        if (additionalImage && oldContentImage && oldContentImage !== additionalImage) {
            await removeFileIfExist(oldContentImage); // ลบ contentImage เก่า
        }

        // อัปเดตบทความ
        await article.update({
            title,
            category,
            content,
            coverImage: coverImage ? `/uploads/${coverImage}` : article.coverImage,
            contentImage: additionalImage ? `/uploads/${additionalImage}` : article.contentImage
        });

        res.status(200).send({ message: "Article updated successfully" });
    } catch (err) {
        console.error("Error updating article:", err);
        res.status(500).send({ message: "Server error" });
    }
};

const deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;  // ดึง ID จาก URL params

        // ค้นหาบทความจากฐานข้อมูล
        const article = await db.Article.findByPk(id);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        // แยกชื่อไฟล์ออกจาก URL ถ้ามี
        const coverImage = article.coverImage ? article.coverImage.split('/').pop() : null;
        const contentImage = article.contentImage ? article.contentImage.split('/').pop() : null;

        // ตรวจสอบและลบไฟล์ coverImage ถ้ามี
        if (coverImage) {
            const coverImagePath = "./uploads/" + coverImage;  // ใช้แค่ชื่อไฟล์จากฐานข้อมูล
            await fs.unlink(coverImagePath);  // ลบไฟล์
            console.log("Cover image removed successfully");
        }

        // ตรวจสอบและลบไฟล์ contentImage ถ้ามี
        if (contentImage) {
            const contentImagePath = "./uploads/" + contentImage;  // ใช้แค่ชื่อไฟล์จากฐานข้อมูล
            await fs.unlink(contentImagePath);  // ลบไฟล์
            console.log("Content image removed successfully");
        }

        // ลบบทความจากฐานข้อมูล
        await article.destroy();
        res.status(200).json({ message: "Article deleted successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Server Error" });
    }
};

module.exports = {
    readArticle,
    listArticle,
    createArticle,
    updateArticle,
    deleteArticle
};
