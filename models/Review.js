const { on } = require("nodemon");

module.exports = (sequelize, DataTypes) => {
    const Review = sequelize.define('Review', {
        
        review_description: {
            type: DataTypes.TEXT,
            allowNull: false, // ต้องมีคำอธิบายในการรีวิว
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false, // ต้องมีการให้คะแนน
            validate: {
                min: 1, // ค่าต่ำสุด 1
                max: 5, // ค่าสูงสุด 5
            },
        },
        // เพิ่มฟิลด์เชื่อมโยงกับ product หรือ user (ตัวอย่าง)
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false, // ต้องมี product_id ที่เชื่อมโยงกับสินค้านี้
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false, // ต้องมี user_id ที่เชื่อมโยงกับผู้ที่รีวิว
        }
    });
    
    Review.associate = models => {
        // ความสัมพันธ์ Many-to-One: รีวิว 1 ชิ้น เชื่อมโยงไปยังสินค้า 1 ชิ้น
        Review.belongsTo(models.Product, { 
            foreignKey: 'product_id' ,
            onDelete: 'CASCADE'
        });
    };
    // กำหนดความสัมพันธ์กับโมเดลอื่นๆ
    // ตัวอย่างเช่น การเชื่อมโยงกับ Product
    // Review.associate = (models) => {
    //     Review.belongsTo(models.Product, {
    //         foreignKey: 'product_id', // กำหนดว่า Review จะเชื่อมโยงกับ Product ผ่าน product_id
    //         onDelete: 'CASCADE', // หากมีการลบ Product, Review ที่เกี่ยวข้องก็จะถูกลบด้วย
    //     });
    //     Review.belongsTo(models.User, {
    //         foreignKey: 'user_id', // กำหนดว่า Review จะเชื่อมโยงกับ User ผ่าน user_id
    //         onDelete: 'CASCADE', // หากมีการลบ User, Review ที่เกี่ยวข้องก็จะถูกลบด้วย
    //     });
    // };

    return Review;
};
