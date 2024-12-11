const express = require("express");
const router = express.Router();

const productcontrollers = require("../controllers/product");

router.get("/", productcontrollers.listProduct);

router.get("/:id", productcontrollers.readProduct);

router.post("/", productcontrollers.createProduct);

router.put("/:id", productcontrollers.updateProduct);

router.delete("/:id", productcontrollers.deleteProduct);

module.exports = router; 