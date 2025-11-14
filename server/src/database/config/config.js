require('dotenv').config();

const base = {
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3307),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'healthcare_db',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  timezone: process.env.DB_TIMEZONE || '+00:00',
  define: {
    underscored: true,
    timestamps: true,
  },
  dialectOptions: {
    dateStrings: true,
    typeCast(field, next) {
      if (field.type === 'DATETIME' || field.type === 'TIMESTAMP') {
        return field.string();
      }
      return next();
    },
  },
};

module.exports = {
  development: { ...base },
  test: {
    ...base,
    database: process.env.DB_NAME_TEST || `${base.database}_test`,
    logging: false,
  },
  production: {
    ...base,
    logging: process.env.DB_LOGGING === 'true',
  },
};
