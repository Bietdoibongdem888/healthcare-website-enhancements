module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('patient', {
      patient_id: {
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
      contact_no: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      medical_history: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    await queryInterface.addIndex('patient', ['email'], {
      name: 'idx_patient_email',
      unique: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('patient', 'idx_patient_email');
    await queryInterface.dropTable('patient');
  },
};
