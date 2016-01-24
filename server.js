var db = require('./models');
var express = require('express');
var app = express();
var path = require('path');
var morgan = require('morgan');
var methodOverride = require('method-override');

//be sure to npm install body-parser
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:false}));
//morgan takes in a string and use dev settings
app.use(morgan('dev'));
app.use(methodOverride('_method'));

// app.set('views', path.resolve(_dirname, 'views'));
app.set('views', 'views');
app.set('view engine', 'jade');

//
app.get('/', function (req, res){
  //db.Gallery needs to match model gallery 'string' which is capitalized
  /*thought this would return more than one galleries? Yep, needed to code in seeder*/
  db.Gallery.findAll({}).then(function(galleries){
    //to replace res.json (used for the seeders) with res.render when creating forms
    // res.json(galleries);
    // console.log(galleries);
    res.render('index-gallery', {
      'galleries': galleries
    });
  });
});
//needs to be before the gallery/:id due to order
//creates a new gallery
app.get('/gallery/new', function (req, res){
  res.render('new-gallery', {});
});

//grabs gallery via seeders via faker by /gallery/id#
app.get('/gallery/:id', function (req, res){

  //find() is for one gallery vs all
  db.Gallery.find({
    where: {
      /*three different query parameters (req objects on express) = params query and body, chose params because it's as a URL and
      id is a property on a parameter*/
      id: req.params.id
    }
  }).then(function(gallery){
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

app.get('/gallery/:id/edit', function (req, res){
  db.Gallery.find({
    where: {
      id: req.params.id
    }
  }).then(function(gallery){
    //rendering jade file
    res.render('edit-gallery', {
      'id': gallery.id,
      'author': gallery.author,
      'link': gallery.link,
      'description': gallery.description
    });
  });
});

//what is this doing? brings you to a form to create a new gallery
app.get('/views', function (req, res){
  //get data from database
  //rendering jade file
  res.render('new-gallery', function (err, html){
    console.log('wassup');
     if(err){
      res.status = 404;
      return res.send('Error Error');
     }
     res.send(html);
  });
});

//posts new gallery to
app.post('/gallery', function (req, res){
  db.Gallery.create({
    author: req.body.author,
    link: req.body.link,
    description: req.body.description
  }).then(function(gallery){
    //rendering jade file
    res.render('gallery', {
      'author': gallery.author,
      'link': gallery.link,
      'description': gallery.description
    });
  });
});
//just need id, no need edit to match what's in browser
app.put('/gallery/:id', function (req, res){
  console.log('not working?');
  //update takes in two parameters searching by id
  //so included a where, similar to a find
  db.Gallery.update({
    author: req.body.author,
    link: req.body.link,
    description: req.body.description
  }, {
    where: {
      id: req.params.id
    }
  }).then(function(gallery){
    //not render, bc that will prompt a get to be override into a put
    //look at network tab to see what type of requests being sent
    //need a redirect
    res.redirect('/gallery/' + req.params.id);
  });
});
/*1. post is end point for new;
  2. which will be displayed in views/jade vs postman
  3. a form can only do one type of request
  4. make sure server has methodOverride and that form has query parameter for override
  5. add another get request for /gallery/:id/edit gets posted with edit-gallery.jade?
  6. make it look pretty using sass/css
*/


//sync to database
app.listen(3000, function() {
  db.sequelize
    .sync()
    .then(function() {
    });
});
