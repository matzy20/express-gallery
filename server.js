var db = require('./models');
var express = require('express');
var app = express();
var path = require('path');
app.set('view engine', 'jade');

//be sure to npm install body-parser
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:false}));

// app.set('views', path.resolve(_dirname, 'views'));

// app.get('/', function(req, reqs){
//   //get data from database
//   res.render('index', data);
// });

app.get('/', function (req, res){
  //db.Gallery needs to match model gallery 'string' which is capitalized
  /*thought this would return more than one galleries? Yep, needed to code in seeder*/
  db.Gallery.findAll({}).then(function(galleries){
    res.json(galleries);
  });
});

app.get('/galleries/:id', function (req, res){
  //find is for one gallery vs all
  db.Gallery.find({
    where: {
      /*three different query parameters (req objects on express) = params query and body, chose params because it's as a URL
      id is a property on a parameter*/
      id: req.params.id
    }
  })
  .then(function(galleries){
    res.json(galleries);
  });
});

/*1. post is end point for new;
  2. which will be displayed in views/jade vs postman
*/


//sync to database
app.listen(3000, function() {
  db.sequelize
    .sync()
    .then(function() {
    });
});
