var db = require('./models');
var express = require('express');
var app = express();
var path = require('path');

//be sure to npm install body-parser
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:false}));
// app.set('view engine', 'jade');

// app.set('views', path.resolve(_dirname, 'views'));

// app.get('/', function(req, reqs){
//   //get data from database
//   res.render('index', data);
// });

app.get('/galleries', function (req, res){
  //needs to match model gallery 'string' which is capitalized
  db.Gallery.findAll({}).then(function(galleries){
    res.json(galleries);
  });
});

app.get('/galleries/:id', function (req, res){
  //find is for one gallery vs all
  db.Gallery.find({
    where: {
      id: 2
    }
  })
  .then(function(galleries){
    res.json(galleries);
  });
});



//sync to database
app.listen(3000, function() {
  db.sequelize
    .sync()
    .then(function() {
    });
});
