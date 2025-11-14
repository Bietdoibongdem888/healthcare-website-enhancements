const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Availability extends Model {
    static associate(models) {
      Availability.belongsTo(models.Doctor, {
        as: 'doctor',
        foreignKey: 'doctor_id',
      });

      Availability.hasMany(models.Appointment, {
        as: 'appointments',
        foreignKey: 'availability_id',
      });
    }
  }

  Availability.init(
    {
      availability_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'doctor',
          key: 'doctor_id',
        },
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      max_patients: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      booked_patients: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM('available', 'blocked'),
        allowNull: false,
        defaultValue: 'available',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Availability',
      tableName: 'doctor_availability',
      underscored: true,
    }
  );

  return Availability;
};
