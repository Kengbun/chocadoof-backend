const db = require("../models");
const fs = require('fs');
const path = require('path');
const { where, Op } = require("sequelize");

const productDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // ดึงข้อมูลสินค้า
        const product = await db.Product.findByPk(id);

        if (!product) {
            return res.status(404).send({ message: 'Product not found' });
        }

        // ดึงข้อมูลรีวิว
        const reviews = await db.Review.findAll({ where: { product_id: id } });

        // ดึงข้อมูลผู้ใช้
        let users = [];
        if (reviews.length > 0) {
            userIds = reviews.map(review => review.user_id);
            users = await db.User.findAll({ where: { id: {[Op.in]: userIds} }, attributes: [ 'id','name', 'profile_picture'] });
        }
        // คำนวณคะแนนเฉลี่ย
        const averageRating = reviews.length > 0
            ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
            : 0;

        // ส่งผลลัพธ์กลับ
        res.send({ product, reviews, averageRating, users });
    } catch (err) {
        console.error("Error fetching product data:", err); // ใช้ err แทน error
        res.status(500).send({ message: "Server Error" });
    }
};


// ดึงสินค้าจากฐานข้อมูลทั้งหมด
const listAllProduct = async (req, res) => {
    try {
        // ดึงข้อมูลสินค้าทั้งหมด
        const products = await db.Product.findAll();

        // ดึงข้อมูลรีวิวทั้งหมด
        const reviews = await db.Review.findAll();

        // เพิ่มคะแนนเฉลี่ยสำหรับแต่ละสินค้า
        const productsWithRating = products.map(product => {
            // ดึงรีวิวที่เกี่ยวข้องกับสินค้านั้น
            const productReviews = reviews.filter(review => review.product_id === product.id);

            // คำนวณคะแนนเฉลี่ย
            const averageRating = productReviews.length > 0
                ? (productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length).toFixed(1)
                : 0;

            // คืนค่าสินค้าพร้อมคะแนนเฉลี่ย
            return {
                ...product.dataValues, // ข้อมูลสินค้า
                averageRating // เพิ่มคะแนนเฉลี่ย
            };
        });

        res.status(200).json(productsWithRating);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).send({ message: "Error fetching products." });
    }
};

// ดึงสินค้าจากฐานข้อมูล
const listProduct = async (req, res) => {
    try {
        const userId = req.user.user_id;
        console.log(userId);
        // res.send({massage : "list"})
        const products = await db.Product.findAll({
            where: {
                user_id: userId
            }
        });
        res.status(200).json(products);
    } catch (err) {
        console.log(err);
        res.status(404).send({ message: "Products not found." });
    }
};

// ดึงสินค้าจากฐานข้อมูลตาม ID
const readProduct = async (req, res) => {
    try {
        const { id } = req.params;  // ดึง ID จาก URL params
        const product = await db.Product.findByPk(id);  // ค้นหาสินค้าตาม ID

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Server Error" });
    }
};


// ฟังก์ชันเพื่อลบไฟล์ถ้ามี
const removeFileIfExist = async (fileName) => {
    const filePath = path.join(__dirname, '..', 'uploads/products', fileName); // กำหนดพาธไฟล์ที่ต้องการลบ

    try {
        if (fs.existsSync(filePath)) { // ตรวจสอบว่าไฟล์มีอยู่จริง
            fs.unlinkSync(filePath); // ลบไฟล์
            console.log(`File ${fileName} deleted successfully`);
        }
    } catch (err) {
        console.error('Error deleting file:', err);
    }
};

// ฟังก์ชันเพื่อดึงชื่อไฟล์จาก URL
const extractFileName = (url) => {
    return url ? url.split('/').pop() : null;
};


// สร้างสินค้าใหม่
const createProduct = async (req, res) => {
    try {
        // รับค่าจาก req.body
        const { product_name, short_description, detailed_description, category } = req.body;
        const main_image = req.files['main_image'] ? req.files['main_image'][0].filename : null;
        const additional_image_1 = req.files['additional_image_1'] ? req.files['additional_image_1'][0].filename : null;
        const additional_image_2 = req.files['additional_image_2'] ? req.files['additional_image_2'][0].filename : null;

        console.log('//////////////////////////////////');
        console.log(main_image);
        console.log('//////////////////////////////////');

        //  สร้าง URL สำหรับไฟล์
        const main_image_url = main_image ? process.env.HOST + "/uploads/products/" + main_image : null;
        const additional_image_1_url = additional_image_1 ? process.env.HOST + "/uploads/products/" + additional_image_1 : null;
        const additional_image_2_url = additional_image_2 ? process.env.HOST + "/uploads/products/" + additional_image_2 : null;

        // ตรวจสอบว่าชื่อสินค้า product_name มีอยู่ในฐานข้อมูลแล้วหรือไม่
        const existingProduct = await db.Product.findOne({ where: { product_name } });
        if (existingProduct) {

            // ลบไฟล์ที่อัพโหลดถ้ามี
            if (main_image) {
                await removeFileIfExist(main_image);
            }
            if (additional_image_1) {
                await removeFileIfExist(additional_image_1);
            }
            if (additional_image_2) {
                await removeFileIfExist(additional_image_2);
            }
            return res.status(400).json({ message: 'Product name already exists' });
        }

        // สร้างสินค้าในฐานข้อมูล
        const newProduct = await db.Product.create({
            product_name,
            short_description,
            detailed_description,
            category,
            main_image: main_image_url,
            additional_image_1: additional_image_1_url,
            additional_image_2: additional_image_2_url,
            user_id: req.user.user_id
        });
        res.status(201).send(newProduct);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Server Error" });
    }
};

// อัพเดตสินค้า
const updateProduct = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { id } = req.params;  // รับค่า ID จาก URL params
        const { product_name, short_description, detailed_description, category } = req.body;  // รับค่าจาก req.body
        console.log(id)



        // console.log(main);
        // ค้นหาสินค้าในฐานข้อมูล

        const product = await db.Product.findOne({
            where: {
                id: id,
                user_id: userId
            }
        });



        if (!product) {
            return res.status(404).send({ message: "Product not found" });
        }


        const main = req.files['main_image'] ? req.files['main_image'][0].filename :
            extractFileName(product.main_image);
        const image_1 = req.files['additional_image_1'] ? req.files['additional_image_1'][0].filename : extractFileName(product.additional_image_1);
        const image_2 = req.files['additional_image_2'] ? req.files['additional_image_2'][0].filename : extractFileName(product.additional_image_2);


        console.log(main);
        console.log(image_1);
        console.log(image_2);

        // ดึงชื่อไฟล์จาก URL
        const oldMainImage = extractFileName(product.main_image);
        const oldImage1 = extractFileName(product.additional_image_1);
        const oldImage2 = extractFileName(product.additional_image_2);

        // ลบไฟล์เก่า
        if (main && oldMainImage && oldMainImage !== main) {
            await removeFileIfExist(oldMainImage); // ลบ mainImage เก่า
        }
        if (image_1 && oldImage1 && oldImage1 !== image_1) {
            await removeFileIfExist(oldImage1); // ลบ image1 เก่า
        }
        if (image_2 && oldImage2 && oldImage2 !== image_2) {
            await removeFileIfExist(oldImage2); // ลบ image2 เก่า
        }


        // อัพเดตข้อมูลสินค้า
        await product.update({
            product_name,
            short_description,
            detailed_description,
            category,
            main_image: oldMainImage ? `${process.env.HOST}/uploads/products/${main}` : product.main_image,
            additional_image_1: oldImage1 ? `${process.env.HOST}/uploads/products/${image_1}` : product.additional_image_1,
            additional_image_2: oldImage2 ? `${process.env.HOST}/uploads/products/${image_2}` : product.additional_image_2
        });
        res.status(200).send({ message: "Product updated successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Server Error" });
    }
};

// ลบสินค้า
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;  // ดึง ID จาก URL params
        console.log(id);


        // ค้นหาสินค้าในฐานข้อมูล
        const product = await db.Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // ดึงชื่อไฟล์จาก URL
        const main_image = extractFileName(product.main_image)
        const additional_image_1 = extractFileName(product.additional_image_1)
        const additional_image_2 = extractFileName(product.additional_image_2)

        // ลบไฟล์ (ถ้ามี)
        if (main_image) removeFileIfExist(main_image);
        if (additional_image_1) removeFileIfExist(additional_image_1);
        if (additional_image_2) removeFileIfExist(additional_image_2);


        // ลบสินค้าออกจากฐานข้อมูล
        await product.destroy();
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Server Error" });
    }
};

module.exports = {
    listProduct,
    readProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    listAllProduct,
    productDetails
};
