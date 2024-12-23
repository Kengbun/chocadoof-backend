const express = require("express");
const router = express.Router();

const productcontrollers = require("../controllers/product");
const { authenticateToken } = require("../middleware/auth");
const { productUpload } = require("../middleware/upload");



router.get("/lists", authenticateToken, productcontrollers.listAllProduct);

router.get("/Details/:id", productcontrollers.productDetails);

router.get("/", authenticateToken, productcontrollers.listProduct);

router.get("/:id", authenticateToken, productcontrollers.readProduct);

router.post("/", authenticateToken, productUpload, productcontrollers.createProduct);

router.put("/:id", authenticateToken, productUpload, productcontrollers.updateProduct);

router.delete("/:id", authenticateToken, productcontrollers.deleteProduct);

module.exports = router; 