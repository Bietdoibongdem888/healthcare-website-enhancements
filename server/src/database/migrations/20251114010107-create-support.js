module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('support_session', {
      session_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      channel: {
        type: Sequelize.ENUM('hotline', 'ai'),
        allowNull: false,
        defaultValue: 'ai',
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
      contact_name: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      contact_email: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      contact_phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('open', 'closed'),
        allowNull: false,
        defaultValue: 'open',
      },
      last_topic: {
        type: Sequelize.STRING(255),
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

    await queryInterface.createTable('support_message', {
      message_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      session_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'support_session',
          key: 'session_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      author: {
        type: Sequelize.ENUM('patient', 'agent', 'assistant'),
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
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

    await queryInterface.addIndex('support_session', ['channel'], { name: 'idx_support_channel' });
    await queryInterface.addIndex('support_session', ['patient_id'], { name: 'idx_support_patient' });
    await queryInterface.addIndex('support_message', ['session_id'], { name: 'idx_support_message_session' });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('support_message', 'idx_support_message_session');
    await queryInterface.removeIndex('support_session', 'idx_support_patient');
    await queryInterface.removeIndex('support_session', 'idx_support_channel');
    await queryInterface.dropTable('support_message');
    await queryInterface.dropTable('support_session');
  },
};
