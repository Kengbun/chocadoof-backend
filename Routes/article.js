const express = require("express");
const router = express.Router();

const articlecontrollers = require("../controllers/article");

router.get("/", articlecontrollers.listArticle);

router.get("/:id", articlecontrollers.readArticle);

router.post("/", articlecontrollers.createArticle);

router.put("/:id", articlecontrollers.updateArticle);

router.delete("/:id", articlecontrollers.deleteArticle);

module.exports = router; 