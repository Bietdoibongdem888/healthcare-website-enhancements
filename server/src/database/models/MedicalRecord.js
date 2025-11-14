const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class MedicalRecord extends Model {
    static associate(models) {
      MedicalRecord.belongsTo(models.Patient, {
        as: 'patient',
        foreignKey: 'patient_id',
      });
      MedicalRecord.belongsTo(models.Doctor, {
        as: 'doctor',
        foreignKey: 'doctor_id',
      });
    }
  }

  MedicalRecord.init(
    {
      record_id: {
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
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'MedicalRecord',
      tableName: 'medical_record',
      underscored: true,
    }
  );

  return MedicalRecord;
};
