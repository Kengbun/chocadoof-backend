const db = require("../models");
const fs = require('fs');
const path = require('path');

// ดึงสินค้าทั้งหมดจากฐานข้อมูล
const listProduct = async (req, res) => {
    try {
        // res.send({massage : "list"})
        const products = await db.Product.findAll();
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
        const { id } = req.params;  // รับค่า ID จาก URL params
        const { product_name, short_description, detailed_description, category } = req.body;  // รับค่าจาก req.body

        
        const main = req.files['main_image'] ? req.files['main_image'][0].filename : null;
        const image_1 = req.files['additional_image_1'] ? req.files['additional_image_1'][0].filename : null;
        const image_2 = req.files['additional_image_2'] ? req.files['additional_image_2'][0].filename : null;
        
        console.log(main);

        // ค้นหาสินค้าในฐานข้อมูล
        const product = await db.Product.findByPk(id);
        
        // ฟังก์ชันเพื่อดึงชื่อไฟล์จาก URL
        const extractFileName = (url) => {
            return url ? url.split('/').pop() : null;
        };

        if (!product) {
            return res.status(404).send({ message: "Product not found" });
        }

        // ลบไฟล์เก่าถ้ามี
        if (req.files?.main_image) {
            await removeFileIfExist(extractFileName(main_image));
        }

        if (req.files?.additional_image_1) {
            await removeFileIfExist(additional_image_1);
        }

        if (req.files?.additional_image_2) {
            await removeFileIfExist(product.additional_image_2);
        }


        // อัพเดต URL สำหรับไฟล์
        const main_image = req.files?.main_image
            ? process.env.HOST + "/uploads/products/"+ main
            : product.main_image;
            
            const additional_image_1 = req.files?.additional_image_1
                ? process.env.HOST + "/uploads/products/"+image_1
                : product.additional_image_1;
        console.log(additional_image_1);

        const additional_image_2 = req.files?.additional_image_2
            ? process.env.HOST + "/uploads/products/"+ image_2
            :  product.additional_image_2;

        // อัพเดตข้อมูลสินค้า
        await product.update({
            product_name,
            short_description,
            detailed_description,
            category,
            main_image,
            additional_image_1,
            additional_image_2,
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

        // ฟังก์ชันเพื่อดึงชื่อไฟล์จาก URL
        const extractFileName = (url) => {
            return url ? url.split('/').pop() : null;
        };

    
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
    deleteProduct
};
