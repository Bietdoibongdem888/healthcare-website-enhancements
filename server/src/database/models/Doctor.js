const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Doctor extends Model {
    get fullName() {
      return `${this.first_name} ${this.last_name}`.trim();
    }

    static associate(models) {
      Doctor.belongsTo(models.Department, {
        as: 'department',
        foreignKey: 'department_id',
      });

      Doctor.hasMany(models.Appointment, {
        as: 'appointments',
        foreignKey: 'doctor_id',
      });

      Doctor.hasMany(models.Availability, {
        as: 'availabilities',
        foreignKey: 'doctor_id',
      });
    }
  }

  Doctor.init(
    {
      doctor_id: {
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
      specialty: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      hospital: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      district: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: false,
        defaultValue: 5.0,
      },
      reviews: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'department',
          key: 'department_id',
        },
      },
    },
    {
      sequelize,
      modelName: 'Doctor',
      tableName: 'doctor',
      underscored: true,
    }
  );

  return Doctor;
};
