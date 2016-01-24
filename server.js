var db = require('./models');
var express = require('express');
var app = express();
var path = require('path');
var methodOverride = require('method-override');

//be sure to npm install body-parser
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:false}));
app.use(methodOverride('_override'));

// app.set('views', path.resolve(_dirname, 'views'));
app.set('views', 'views');
app.set('view engine', 'jade');


app.get('/', function (req, res){
  //db.Gallery needs to match model gallery 'string' which is capitalized
  /*thought this would return more than one galleries? Yep, needed to code in seeder*/
  db.Gallery.findAll({}).then(function(galleries){
    //to replace res.json (used for the seeders) with res.render when creating forms
    // res.json(galleries);
    res.render(galleries);
  });
});
//needs to be before the gallery/:id due to order
app.get('/gallery/new', function (req, res){
  res.render('new-gallery', {});
});

app.get('/gallery/:id', function (req, res){
  var id = req.params.id;

  //find() is for one gallery vs all
  db.Gallery.find({
    where: {
      /*three different query parameters (req objects on express) = params query and body, chose params because it's as a URL and
      id is a property on a parameter*/
      id: req.params.id
    }
  })
  .then(function(gallery){
    //to replace res.json (used for seeders/fakers) with res.render when creating forms
    // res.json(gallery);
    res.render('gallery', {
      'id': gallery.id,
      'author': gallery.author,
      'link': gallery.link,
      'description': gallery.description
    });
  });
});

//what is this doing?
app.get('/views', function (req, res){
  //get data from database
  res.render('new-gallery', function (err, html){
    console.log('wassup');
     if(err){
      res.status = 404;
      return res.send('Error Error');
     }
     res.send(html);
  });
});

app.post('/gallery', function (req, res){
  db.Gallery.create({
    author: req.body.author,
    link: req.body.link,
    description: req.body.description
  }).then(function(gallery){
    res.render('gallery', {
      'author': gallery.author,
      'link': gallery.link,
      'description': gallery.description
    });
  });
});
/*1. post is end point for new;
  2. which will be displayed in views/jade vs postman
  3. for put and delete, make into one form; to include
  4. make sure server has methodOverride and that form has query parameter for override
*/


//sync to database
app.listen(3000, function() {
  db.sequelize
    .sync()
    .then(function() {
    });
});
