const express = require("express");
const router = express.Router();

const articlecontrollers = require("../controllers/article");

//Mid
const { upload } = require("../middleware/upload")

router.get("/", articlecontrollers.listArticle);

router.get("/:id", articlecontrollers.readArticle);

router.post("/", upload, articlecontrollers.createArticle);

router.put("/:id", upload, articlecontrollers.updateArticle);

router.delete("/:id", articlecontrollers.deleteArticle);

module.exports = router; 