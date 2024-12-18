const express = require("express");
const router = express.Router();

const articlecontrollers = require("../controllers/article");

//Mid
const { uploadArticles } = require("../middleware/upload");
const { authenticateToken } = require("../middleware/auth");




router.get("/", articlecontrollers.listArticle);

router.get("/:id", articlecontrollers.readArticle);

router.post("/", authenticateToken, uploadArticles, articlecontrollers.createArticle);

router.put("/:id", uploadArticles, articlecontrollers.updateArticle);

router.delete("/:id", articlecontrollers.deleteArticle);

module.exports = router; 