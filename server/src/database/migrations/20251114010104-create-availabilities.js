module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('doctor_availability', {
      availability_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      doctor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'doctor',
          key: 'doctor_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      max_patients: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      booked_patients: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM('available', 'blocked'),
        allowNull: false,
        defaultValue: 'available',
      },
      notes: {
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

    await queryInterface.addIndex('doctor_availability', ['doctor_id', 'start_time', 'end_time'], {
      name: 'idx_availability_doctor_time',
    });
    await queryInterface.addIndex('doctor_availability', ['status'], {
      name: 'idx_availability_status',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('doctor_availability', 'idx_availability_status');
    await queryInterface.removeIndex('doctor_availability', 'idx_availability_doctor_time');
    await queryInterface.dropTable('doctor_availability');
  },
};
