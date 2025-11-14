module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('doctor', {
      doctor_id: {
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
      specialty: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      hospital: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      district: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      rating: {
        type: Sequelize.DECIMAL(2, 1),
        allowNull: false,
        defaultValue: 5.0,
      },
      reviews: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'department',
          key: 'department_id',
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

    await queryInterface.addIndex('doctor', ['specialty'], { name: 'idx_doctor_specialty' });
    await queryInterface.addIndex('doctor', ['district'], { name: 'idx_doctor_district' });
    await queryInterface.addIndex('doctor', ['department_id'], { name: 'idx_doctor_department' });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('doctor', 'idx_doctor_department');
    await queryInterface.removeIndex('doctor', 'idx_doctor_district');
    await queryInterface.removeIndex('doctor', 'idx_doctor_specialty');
    await queryInterface.dropTable('doctor');
  },
};
