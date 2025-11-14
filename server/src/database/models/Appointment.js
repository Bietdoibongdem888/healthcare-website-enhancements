const { DataTypes, Model } = require('sequelize');

const APPOINTMENT_STATUS = ['pending', 'confirmed', 'completed', 'cancelled'];

module.exports = (sequelize) => {
  class Appointment extends Model {
    static associate(models) {
      Appointment.belongsTo(models.Patient, {
        as: 'patient',
        foreignKey: 'patient_id',
      });

      Appointment.belongsTo(models.Doctor, {
        as: 'doctor',
        foreignKey: 'doctor_id',
      });

      Appointment.belongsTo(models.Availability, {
        as: 'availability',
        foreignKey: 'availability_id',
      });
    }
  }

  Appointment.init(
    {
      appointment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      availability_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(...APPOINTMENT_STATUS),
        allowNull: false,
        defaultValue: 'pending',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Appointment',
      tableName: 'appointment',
      underscored: true,
    }
  );

  Appointment.STATUS = APPOINTMENT_STATUS;

  return Appointment;
};
