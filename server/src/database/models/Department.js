const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Department extends Model {
    static associate(models) {
      Department.hasMany(models.Doctor, {
        as: 'doctors',
        foreignKey: 'department_id',
      });
    }
  }

  Department.init(
    {
      department_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Department',
      tableName: 'department',
      underscored: true,
    }
  );

  return Department;
};
