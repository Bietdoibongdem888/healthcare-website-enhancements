module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('staff', {
      staff_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      first_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('admin', 'doctor', 'patient'),
        allowNull: false,
        defaultValue: 'patient',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'patient',
          key: 'patient_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      doctor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'doctor',
          key: 'doctor_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('staff');
  },
};
