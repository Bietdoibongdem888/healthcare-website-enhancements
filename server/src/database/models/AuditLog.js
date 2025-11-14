const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class AuditLog extends Model {}

  AuditLog.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      action: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      meta: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'AuditLog',
      tableName: 'audit_log',
      underscored: true,
    }
  );

  return AuditLog;
};
