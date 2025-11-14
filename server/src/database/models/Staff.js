const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Staff extends Model {
    static associate(models) {
      Staff.belongsTo(models.Patient, {
        as: 'patient',
        foreignKey: 'patient_id',
      });
      Staff.belongsTo(models.Doctor, {
        as: 'doctorProfile',
        foreignKey: 'doctor_id',
      });
    }
  }

  Staff.init(
    {
      staff_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      first_name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('admin', 'doctor', 'patient'),
        allowNull: false,
        defaultValue: 'patient',
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      patient_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Staff',
      tableName: 'staff',
      underscored: true,
    }
  );

  return Staff;
};
