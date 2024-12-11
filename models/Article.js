

module.exports = (sequelize, DataTypes) => {
    const Article = sequelize.define("Article", {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        coverImage: {
            type: DataTypes.STRING, // เก็บ URL หรือ path ของรูปภาพ
            allowNull: true,
        },
        contentImage: {
            type: DataTypes.STRING, // เก็บ URL หรือ path ของรูปเพิ่มเติม
            allowNull: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    });

    Article.associate = models => {
        Article.belongsTo(models.User, { foreignKey: "user_id" });
    }


    return Article
};


