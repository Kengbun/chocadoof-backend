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
const { createAdminAccounts, createTenUsers, createDummyArticles, createDummyProducts } = require("./config/createAdminAccount");
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

//AI
const { spawn } = require("child_process");
app.post("/ask", (req, res) => {
    const { message } = req.body;

    // ใช้ spawn เพื่อเรียก Ollama และรับข้อมูลทีละบรรทัด
    const ollama = spawn("ollama", ["run", "deepseek-r1:1.5b"]);

    let responseText = "";

    // อ่าน stdout และเก็บค่าตอบกลับ
    ollama.stdout.on("data", (data) => {
        responseText += data.toString();
    });

    // จัดการกรณีเกิดข้อผิดพลาด
    ollama.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
    });

    // ส่งค่ากลับไปเมื่อคำสั่งทำงานเสร็จ
    ollama.on("close", (code) => {
        if (code === 0) {
            res.json({ response: responseText.trim() });
        } else {
            res.status(500).json({ error: "Ollama execution failed" });
        }
    });

    // ส่งข้อความไปยัง Ollama
    ollama.stdin.write(message + "\n");
    ollama.stdin.end();
});


app.use("/article", articleRoutes);
app.use("/products", productsRoutes);
app.use("/review", reviewRoutes);
app.use("/users", usersRoutes);









// ตั้งให้สามารถให้บริการไฟล์จากโฟลเดอร์ 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


db.sequelize.sync({ force: false }).then(() => {
    app.listen(8000, () => {
        (async () => {
            await createAdminAccounts();
            await createTenUsers();
            await createDummyArticles();
            await createDummyProducts();
        })();

        console.log("Server is running at port 8000")
            
    })
});
