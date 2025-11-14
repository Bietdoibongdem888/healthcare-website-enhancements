const { Sequelize } = require('sequelize');
const config = require('config');

const dbConfig = config.has('database') ? config.get('database') : {};

const sequelize = new Sequelize(
  process.env.DB_NAME || dbConfig.name || 'healthcare_db',
  process.env.DB_USER || dbConfig.user || 'root',
  process.env.DB_PASSWORD || dbConfig.password || '123456',
  {
    host: process.env.DB_HOST || dbConfig.host || 'localhost',
    port: Number(process.env.DB_PORT || dbConfig.port || 3307),
    dialect: dbConfig.dialect || 'mysql',
    logging:
      typeof dbConfig.logging !== 'undefined'
        ? dbConfig.logging
        : process.env.DB_LOGGING === 'true'
        ? console.log
        : false,
    timezone: dbConfig.timezone || process.env.DB_TIMEZONE || '+00:00',
    define: {
      underscored: true,
      timestamps: true,
    },
  }
);

const modelDefiners = [
  require('./models/Department'),
  require('./models/Doctor'),
  require('./models/Patient'),
  require('./models/Availability'),
  require('./models/Appointment'),
  require('./models/Staff'),
  require('./models/SupportSession'),
  require('./models/SupportMessage'),
  require('./models/MedicalRecord'),
  require('./models/AuditLog'),
];

const models = modelDefiners.reduce((acc, defineModel) => {
  const model = defineModel(sequelize);
  acc[model.name] = model;
  return acc;
}, {});

Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  Sequelize,
  ...models,
};
