const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 นาที
    max: 3, // จำกัด requests ต่อ IP ภายใน 1 นาที
    message: {
        status: 429,
        error: "กรุณาลองอีกครั้งในภายหลัง"
    }
});

module.exports = limiter;
