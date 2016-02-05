var db = require('./models');
var express = require('express');
var app = express();
var path = require('path');
var morgan = require('morgan');
var methodOverride = require('method-override');
var passport = require('passport');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var config = require('./config');

//be sure to npm install body-parser
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());
app.use(session(config.session));

//morgan takes in a string and use dev settings
app.use(morgan('dev'));
app.use(methodOverride('_method'));
app.use(passport.initialize());
app.use(passport.session());

//need to reference to config.json vs hardcoding properties on user
// var user = config.CREDENTIALS;
//we removed credentials though on config, which is why commented out var user
passport.use(new LocalStrategy(
  function (username, password, done){
    //links to models database and matches to username/pword passed in
    //now can only login using users defined in User database
    db.User.find({
      where:{
        username: username,
        password: password
      }
    }).then(function(user){
    if(!user){
      return done(null, false);
    }
    return done(null, user);
  });
}));

function authenticate (username, password){
  var USERNAME = user.username;
  var PASSWORD = user.password;

  if(username === USERNAME && password === PASSWORD){
    return true;
  } else {
    return false;
  }
}

function isAuthenticated (req, res, next){
  if(!req.isAuthenticated()){
    return res.redirect('/login');
  }
  return next();
}
//adds a hash, serializes (see resources)
passport.serializeUser(function (user, done){
  console.log(user);
  done(null, user);
});

//turns the serialize back into objects
passport.deserializeUser(function (user, done){
  return done(null, user);
});

// app.set('views', path.resolve(_dirname, 'views'));
app.set('views', 'views');
app.set('view engine', 'jade');

//returning all galleries in gallery
app.get('/', function (req, res){
  //db.Gallery needs to match model gallery 'string' which is capitalized
  /*thought this would return more than one galleries? Yep, needed to code in seeder*/
  return db.Gallery.findAll({}).then(function(galleries){
    //to replace res.json (used for the seeders) with res.render when creating forms
    // res.json(galleries);
    // console.log(galleries);
    /*and since finding ALL, gallery (the model; singular), will be plural
    (returning an array of object galleries)
    */
    res.render('index-gallery', {
      /*need to reference since pulling existing info/galleries in
      vs gallery/new where info is entered*/
      'galleries': galleries
    });
  });
});
//needs to be before the gallery/:id due to order
//creates a new gallery
//isAuthenticated making sure new gallery is a valid user
app.get('/gallery/new',
  isAuthenticated,
  function (req, res){
    console.log('inside new');
    res.render('new-gallery', {});
  });

//adding login form
app.get('/login', function (req, res){
 res.render('login');
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
  //find one gallery, so singular
  }).then(function(gallery){
    //to replace res.json (used for seeders/fakers) with res.render when creating forms
    // res.json(gallery);
    res.render('gallery', {
      'author': gallery.author,
      'id': gallery.id,
      'link': gallery.link,
      'description': gallery.description
    });
  });
});
//edits gallery, submit brings you to new page with updates
app.get('/gallery/:id/edit',
  isAuthenticated,
  function (req, res){
  db.Gallery.find({
    where: {
      id: req.params.id
    }
  }).then(function(gallery){
    //rendering jade file
    res.render('edit', {
      'id': gallery.id,
      'author': gallery.author,
      'link': gallery.link,
      'description': gallery.description
    });
  });
});

app.get('/gallery/:id/delete', function (req, res){
  db.Gallery.find({
    where: {
      id: req.params.id
    }
  }).then(function(gallery){
    res.render('edit',{
      //need to include id in render since interpolating it
      'id': gallery.id,
      'author': gallery.author,
      'link': gallery.link,
      'description': gallery.description
    });
  });
});

// what is this doing? brings you to a form to create a new gallery
app.get('/views', function (req, res){
  //get data from database
  //rendering jade file
  res.render('new-gallery', function (err, html){
    // console.log('wassup');
     if(err){
      res.status = 404;
      return res.send('Error Error');
     }
     res.send(html);
  });
});

app.get('/logout', function (req, res){
  req.logout();
  res.redirect('/');
});

//posts new gallery to
app.post('/gallery', function (req, res){
  db.Gallery.create({
    author: req.body.author,
    id: req.body.id,
    link: req.body.link,
    description: req.body.description
  }).then(function(gallery){
    //rendering jade file
    res.render('gallery', {
      'author': gallery.author,
      'id': gallery.id,
      'link': gallery.link,
      'description': gallery.description
    });
  });
});

//posts for successful logins
//localStrategy called here
app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);

//post users
// app.post('/user', function (req, res){
//   db.User.create({
//     username: '',
//     password: ''
//   }).then(function(user){
//       res.json(user);
//     });
// });
//just need id, no need edit to match what's in browser
app.put('/gallery/:id', function (req, res){
  console.log('not working?');
  //update takes in two parameters searching by id
  //so included a where, similar to a find
  db.Gallery.update({
    author: req.body.author,
    id: req.body.author,
    link: req.body.link,
    description: req.body.description
  }, {
    where: {
      id: req.params.id
    }
  }).then(function(gallery){
    //not render, bc that will prompt a 'get' to be override into a 'put'
    //look at network tab to see what type of requests being sent
    //need a redirect
    res.redirect('/gallery/' + req.params.id);
  });
});
//destroy takes in one parameter
/*don't use TRUNCATE, removes everything
had to re-run seeders, and change loop from < 55 to > 55
since truncate removed everything*/
app.delete('/gallery/:id', function (req, res){
  console.log(req.params);
  db.Gallery.destroy({
    where: {
      id: req.params.id
    }
  }).then(function(gallery){
    res.redirect('/');
  });
});

/*1. post is end point for new;
  2. which will be displayed in views/jade vs postman
  3. a form can only do one type of request
  4. make sure server has methodOverride and that form has query parameter for override
  5. add another get request for /gallery/:id/edit gets posted with edit-gallery.jade?
  6. using gulpfile.js to use sass/css; gulp and nodemon running same time; task compile-sass;
*/


//sync to database
db.sequelize
  .sync()
  .then(function() {
    app.listen(3000, function() {
    });
  });
