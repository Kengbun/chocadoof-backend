const express = require("express");
const router = express.Router();

const articlecontrollers = require("../controllers/article");

//Mid
const { uploadArticles } = require("../middleware/upload");
const { authenticateToken, authorizeRole } = require("../middleware/auth");




router.get("/",  articlecontrollers.listArticle);

router.get("/user/articles/list", authenticateToken, articlecontrollers.userArticle);

router.get("/:id", articlecontrollers.readArticle);

router.post("/", authenticateToken, uploadArticles, articlecontrollers.createArticle);

router.put("/:id", uploadArticles, articlecontrollers.updateArticle);

router.delete("/:id", authenticateToken, articlecontrollers.deleteArticle);

module.exports = router; 