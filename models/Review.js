module.exports = (sequelize, DataTypes) => {
    const Review = sequelize.define('Review', {
        review_description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5,
            },
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    });

    Review.associate = (models) => {
        // เชื่อมกับ Product
        Review.belongsTo(models.Product, {
            foreignKey: 'product_id',
            onDelete: 'CASCADE',
        });

        // เชื่อมกับ User (เพิ่มเข้ามา)
        Review.belongsTo(models.User, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE',
        });
    };

    return Review;
};
