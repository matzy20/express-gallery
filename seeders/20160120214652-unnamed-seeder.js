'use strict';
var faker = require('faker');

module.exports = {
  up: function (queryInterface, Sequelize) {
      //this needs to match name in database
      return queryInterface.bulkInsert('Galleries', [
        {
          author: faker.name.firstName(),
          link: faker.image.imageUrl(),
          description: faker.lorem.sentence(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ], {});

  },

  down: function (queryInterface, Sequelize) {

      return queryInterface.bulkDelete('Galleries', null, {});
  }
};
