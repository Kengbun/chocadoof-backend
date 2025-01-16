

module.exports = (sequelize, DataTypes) => {

    const User = sequelize.define('User', {
        
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull:false
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: 'user',
        },
        profile_picture: {
            type: DataTypes.STRING, 
            allowNull: true,
        },
        is_verified: {  
            type: DataTypes.BOOLEAN,
            defaultValue: false, 
        }
    });

    User.associate = models => {
        User.hasMany(models.Article, { foreignKey: "user_id" });
        User.hasMany(models.Product, { foreignKey: "user_id" });
    };

   


    return User;
};



