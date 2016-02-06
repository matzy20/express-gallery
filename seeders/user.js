'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.bulkInsert('Users', [
      {
        username: 'admin',
        password: 'password',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'mJ',
        password: 'michaelJams',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'minion',
        password: 'dispicable',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: function (queryInterface, Sequelize) {

    return queryInterface.bulkDelete('Users', null, {});

  }
};
