const { Op, fn, col } = require('sequelize');
const { Doctor } = require('../database');

async function specialties(req, res, next) {
  try {
    const rows = await Doctor.findAll({
      attributes: [[fn('DISTINCT', col('specialty')), 'specialty']],
      where: {
        specialty: {
          [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }],
        },
      },
      order: [['specialty', 'ASC']],
      raw: true,
    });
    res.json(rows.map((row) => row.specialty));
  } catch (err) {
    next(err);
  }
}

async function districts(req, res, next) {
  try {
    const rows = await Doctor.findAll({
      attributes: [[fn('DISTINCT', col('district')), 'district']],
      where: {
        district: {
          [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }],
        },
      },
      order: [['district', 'ASC']],
      raw: true,
    });
    res.json(rows.map((row) => row.district));
  } catch (err) {
    next(err);
  }
}

module.exports = { specialties, districts };
