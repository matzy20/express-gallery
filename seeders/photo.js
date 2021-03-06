'use strict';
var faker = require('faker');

module.exports = {
  up: function (queryInterface, Sequelize) {
    var photos = [];
    //for loop needs to happen before return
    //i needs to be < 55, if > 55 never reaches and loop ends
    //sequelize throwing error since didn't like passing through empty array
    for (var i = 0; i < 55; i ++){
      //made photo into an object to be pushed into array
      var photo = {
        author: faker.name.firstName(),
        link: faker.image.imageUrl(),
        description: faker.lorem.sentence(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      photos.push(photo);
    }
    //returns a code that allows bulkInsert and query to run, passing through array
    //'Galleries' needs to match name in database
    return queryInterface.bulkInsert('Galleries', photos, {});
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Galleries', null, {});
  }
};
