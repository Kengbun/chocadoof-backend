const express = require("express");
const router = express.Router();

const productcontrollers = require("../controllers/product");
const { authenticateToken, authorizeRole } = require("../middleware/auth");
const { productUpload } = require("../middleware/upload");



router.get("/lists", productcontrollers.listAllProduct);

router.get("/Details/:id", productcontrollers.productDetails);

router.get("/", authenticateToken, productcontrollers.listProduct);

router.get("/:id", authenticateToken, productcontrollers.readProduct);

router.post("/", authenticateToken,authorizeRole(["admin"]), productUpload, productcontrollers.createProduct);

router.put("/:id", authenticateToken, authorizeRole(["admin"]), productUpload, productcontrollers.updateProduct);

router.delete("/:id", authenticateToken, authorizeRole(["admin"]), productcontrollers.deleteProduct);

module.exports = router; 