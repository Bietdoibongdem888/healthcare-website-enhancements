const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Patient extends Model {
    get fullName() {
      return `${this.first_name} ${this.last_name}`.trim();
    }

    static associate(models) {
      Patient.hasMany(models.Appointment, {
        as: 'appointments',
        foreignKey: 'patient_id',
      });

      Patient.hasMany(models.SupportSession, {
        as: 'supportSessions',
        foreignKey: 'patient_id',
      });

      Patient.hasMany(models.SupportMessage, {
        as: 'supportMessages',
        foreignKey: 'patient_id',
      });
    }
  }

  Patient.init(
    {
      patient_id: {
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
      contact_no: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: { isEmail: true },
      },
      date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      medical_history: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Patient',
      tableName: 'patient',
      underscored: true,
    }
  );

  return Patient;
};
