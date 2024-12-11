const db = require("../models");

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
        const { title, category, coverImage, contentImage, content } = req.body;
        const newArticle = await db.Article.create({
            title,
            category,
            coverImage:"https://picsum.photos/200/300",
            contentImage: "https://picsum.photos/200",
            content,
        });
        res.status(201).send(newArticle);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Server Error" });
    }
};

const updateArticle = async (req, res) => {
    try {
        const { id } = req.params;  // รับค่า ID จาก URL
        const { title, category, coverImage, contentImage, content } = req.body;  // รับค่าจาก req.body

        // ค้นหาบทความจากฐานข้อมูล
        const article = await db.Article.findByPk(id);

        if (!article) {
            return res.status(404).send({ message: "Article not found" });
        }

        // อัพเดตบทความ
        await article.update({
            title,
            category,
            coverImage,
            contentImage,
            content
        });
        res.status(200).send({ message: "Updating is successful" });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Server Error" });
    }
};

const deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;  // ดึง ID จาก URL params

        const article = await db.Article.findByPk(id);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
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
