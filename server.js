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
var RedisStore = require('connect-redis')(session);

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

//connecting, but where are these new keys stored? when you login
//and where can we access them? via redis-cli 'keys *'
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());
//need session and secret b/c this creates the hash
//gets it started to later add users to
app.use(session({
  secret: config.session.secret,
  store: new RedisStore({
    host: '127.0.0.1',
    port: '6379'
  })
}));

app.use(morgan('dev'));
app.use(methodOverride('_method'));
app.use(passport.initialize());
app.use(passport.session());

//need to reference to config.json vs hardcoding properties on user
// var user = config.CREDENTIALS;
//removed credentials on config, which is why commented out var user
passport.use(new LocalStrategy(
{
  passReqToCallBack: true
},
  function (username, password, done){
    //links to models database and matches to username/pword passed in
    //logging in using users defined in User database
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

//use static files in public (e.g. css, assets)
app.use(express.static(path.resolve(__dirname, 'public')));
app.set('views', 'views');
app.set('view engine', 'jade');

//returns all galleries in gallery
//model gallery needs to be plural since findAll
app.get('/', function (req, res){
  //db.Gallery needs to match model gallery 'string' which is capitalized
  /*thought this would return more than one galleries? Yep, needed to code in seeder*/
  return db.Gallery.findAll({}).then(function(galleries){
    res.render('index-gallery', {
      //pulling existing galleries
      'galleries': galleries
    });
  });
});
//needs to be before gallery/:id due to order
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
  //find specific Gallery
  db.Gallery.find({
    where: {
      /*three different query parameters (req objects on express) = params query and body, chose params because it's as a URL and
      id is a property on a parameter*/
      id: req.params.id
    }
  //find one gallery, so singular
  }).then(function(gallery){

    // res.render vs res.json(gallery);
    res.render('gallery', {
      'author': gallery.author,
      'id': gallery.id,
      'link': gallery.link,
      'description': gallery.description
    });
  });
});
//edits gallery
//submit brings you to new page with updates
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

app.get('/logout', function (req, res){
  req.logout();
  res.redirect('/');
});

//posts new gallery
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

//just need id, no need to match url in browser
app.put('/gallery/:id', function (req, res){
  console.log('not working?');
  //update takes in two parameters searching by id
  //where is similar to a find
  db.Gallery.update({
    author: req.body.author,
    link: req.body.link,
    description: req.body.description
  }, {
    where: {
      id: req.params.id
    }
  }).then(function(gallery){
    //not render, bc that will prompt a 'get' to be override into a 'put'
    //network and headers on types of requests
    //need a redirect
    res.redirect('/gallery/' + req.params.id);
  });
});
//destroy takes in one parameter
/*don't use TRUNCATE, removes everything
had to re-run seeders, and change loop from < 55 to > 55
since truncate removed everything, then changed back see photo.js*/
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

// Catch-all "route undefinded" handler using middleware
app.use(function (req, res, next){
  //400 = client error, YOU referenced wrong page
  res.status(404);
  //uses a message vs your tmi computer info
  next();
  return res.send('Client, YOU made mistake' + err);
});

//Default catch-all middleware error handler
app.use(function (err, req, res, next){
  if(err){
    //server error
    res.status(500);
    next();
    return res.send('Something bad happened ' + err);
  }
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
