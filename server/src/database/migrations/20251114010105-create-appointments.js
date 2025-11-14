module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('appointment', {
      appointment_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'patient',
          key: 'patient_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
      availability_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'doctor_availability',
          key: 'availability_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
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

    await queryInterface.addIndex('appointment', ['doctor_id', 'start_time', 'end_time'], {
      name: 'idx_appointment_doctor_time',
    });
    await queryInterface.addIndex('appointment', ['patient_id'], {
      name: 'idx_appointment_patient',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('appointment', 'idx_appointment_patient');
    await queryInterface.removeIndex('appointment', 'idx_appointment_doctor_time');
    await queryInterface.dropTable('appointment');
  },
};
