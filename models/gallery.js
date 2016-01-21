'use strict';
module.exports = function(sequelize, DataTypes) {
  //name is usually capitalized
  var gallery = sequelize.define('Gallery', {
    author: DataTypes.STRING,
    link: DataTypes.STRING,
    description: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return gallery;
};