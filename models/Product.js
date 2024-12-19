module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
       
        product_name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        short_description: {
            type: DataTypes.STRING, // คำอธิบายสั้นของผลิตภัณฑ์
            allowNull: false,
        },
        detailed_description: {
            type: DataTypes.TEXT, // คำอธิบายละเอียด
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        main_image: {
            type: DataTypes.STRING, // URL หรือ path ของภาพหลัก
            allowNull: false,
        },
        additional_image_1: {
            type: DataTypes.STRING, // URL หรือ path ของภาพเสริมตัวที่ 1
            allowNull: false,
        },
        additional_image_2: {
            type: DataTypes.STRING, // URL หรือ path ของภาพเสริมตัวที่ 2
            allowNull: false,
        },
    })

    Product.associate = models => {
        Product.belongsTo(models.User, { foreignKey: "user_id" });
        Product.hasMany(models.Review, { foreignKey: 'product_id', onDelete: 'CASCADE' });
    }

    return Product
};
