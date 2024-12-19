const express = require("express");
const router = express.Router();

const productcontrollers = require("../controllers/product");
const { authenticateToken } = require("../middleware/auth");
const { productUpload } = require("../middleware/upload");



router.get("/", productcontrollers.listProduct);

router.get("/:id", productcontrollers.readProduct);

router.post("/", authenticateToken, productUpload, productcontrollers.createProduct);

router.put("/:id", productcontrollers.updateProduct);

router.delete("/:id", productcontrollers.deleteProduct);

module.exports = router; 