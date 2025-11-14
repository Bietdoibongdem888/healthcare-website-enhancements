const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class SupportSession extends Model {
    static associate(models) {
      SupportSession.belongsTo(models.Patient, {
        as: 'patient',
        foreignKey: 'patient_id',
      });

      SupportSession.hasMany(models.SupportMessage, {
        as: 'messages',
        foreignKey: 'session_id',
      });
    }
  }

  SupportSession.init(
    {
      session_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      channel: {
        type: DataTypes.ENUM('hotline', 'ai'),
        allowNull: false,
        defaultValue: 'ai',
      },
      patient_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      contact_name: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      contact_email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      contact_phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('open', 'closed'),
        allowNull: false,
        defaultValue: 'open',
      },
      last_topic: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'SupportSession',
      tableName: 'support_session',
      underscored: true,
    }
  );

  return SupportSession;
};
