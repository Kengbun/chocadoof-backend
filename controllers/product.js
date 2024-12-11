const db = require("../models");

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

// สร้างสินค้าใหม่
const createProduct = async (req, res) => {
    try {
        const { product_name, short_description, detailed_description, category, main_image, additional_image_1, additional_image_2 } = req.body;
        const newProduct = await db.Product.create({
            product_name,
            short_description,
            detailed_description,
            category,
            main_image,
            additional_image_1,
            additional_image_2,
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
        const { product_name, short_description, detailed_description, category, main_image, additional_image_1, additional_image_2 } = req.body;  // รับค่าจาก req.body

        // ค้นหาสินค้าในฐานข้อมูล
        const product = await db.Product.findByPk(id);

        if (!product) {
            return res.status(404).send({ message: "Product not found" });
        }

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

        const product = await db.Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

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
