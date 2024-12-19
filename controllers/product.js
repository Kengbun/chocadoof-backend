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

// สร้างสินค้าใหม่
const createProduct = async (req, res) => {
    try {
        const { product_name, short_description, detailed_description, category } = req.body;
        const main_image = req.files['main_image'] ? req.files['main_image'][0].filename : null;
        const additional_image_1 = req.files['additional_image_1'] ? req.files['additional_image_1'][0].filename : null;
        const additional_image_2 = req.files['additional_image_2'] ? req.files['additional_image_2'][0].filename : null;

        const main_image_url = main_image ? process.env.HOST + "/uploads/products/" + main_image : null;
        const additional_image_1_url = additional_image_1 ? process.env.HOST + "/uploads/products/" + additional_image_1 : null;
        const additional_image_2_url = additional_image_2 ? process.env.HOST + "/uploads/products/" + additional_image_2 : null;

        // ตรวจสอบว่าชื่อสินค้า product_name มีอยู่ในฐานข้อมูลแล้วหรือไม่
        const existingProduct = await db.Product.findOne({ where: { product_name } });
        if (existingProduct) {
            return res.status(400).json({ message: 'Product name already exists' });
        }

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
