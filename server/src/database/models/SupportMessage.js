const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class SupportMessage extends Model {
    static associate(models) {
      SupportMessage.belongsTo(models.SupportSession, {
        as: 'session',
        foreignKey: 'session_id',
      });

      SupportMessage.belongsTo(models.Patient, {
        as: 'patient',
        foreignKey: 'patient_id',
      });
    }
  }

  SupportMessage.init(
    {
      message_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      session_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      author: {
        type: DataTypes.ENUM('patient', 'agent', 'assistant'),
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      patient_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'SupportMessage',
      tableName: 'support_message',
      underscored: true,
    }
  );

  return SupportMessage;
};
