// require('dotenv').config();

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
// const bodyParse = require("body-parser");
const articleRoutes = require("./Routes/article");
const productsRoutes = require("./Routes/products");
const reviewRoutes = require("./Routes/review");
const usersRoutes = require("./Routes/user");
// const { readdirSync } = require("fs")
const admin = require ("./config/createAdminAccount");
const app = express();

const db = require("./models");
const path = require("path");
const { authenticateToken } = require("./middleware/auth");

app.use(morgan("dev")); //Middleware สำหรับการบันทึก (logging) 
app.use(cors());
app.use(express.json());

// ใช้ body-parser เพื่อประมวลผล JSON data และจำกัดขนาดที่ 10MB
// app.use(bodyParse.json({ limit: "10mb" }));

//auto import Routes
// readdirSync("./Routes")
//     .map((r) => app.use("/api", require("./Routes/" + r)))
// app.get('/protected', authenticateToken, (req, res) => {
//     res.status(200).json({ message: 'การเข้าถึงสำเร็จ', user: req.user });
//     // console.log(req.user)
// });
// app.post("/users/me/2", authenticateToken, (req, res) => {
//     res.status(200).json({ message: 'การเข้าถึงสำเร็จ', user: req.user });
//     console.log(req.user)
//     console.log(req)
// })

// app.use(authenticateToken)

app.use("/article", articleRoutes);
app.use("/products", productsRoutes);
app.use("/review", reviewRoutes);
app.use("/users", usersRoutes);

// ตั้งให้สามารถให้บริการไฟล์จากโฟลเดอร์ 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


db.sequelize.sync({ force: false }).then(() => {
    app.listen(8000, () => {
        console.log("Server is running at port 8000")
        admin()
        
    })
});
