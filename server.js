//Module dependencies
const http             = require('http');
const fs               = require('fs');
const express          = require('express');
const compression      = require('compression');
const session          = require('express-session');
const bodyParser       = require('body-parser');
const pug              = require('pug');
const dotenv           = require('dotenv');
const mongoose         = require('mongoose');
const passport         = require('passport');
const expressValidator = require('express-validator');
const flash            = require('express-flash');
const morgan           = require('morgan');
const path             = require('path');
const sass             = require('node-sass-middleware');
const MongoStore       = require('connect-mongo')(session);

//Load environment variables
dotenv.load({ path: '.env.config' });

//Controllers (routes)
const indexController    = require('./controllers/index');
const userController     = require('./controllers/manageUser');
const contestController  = require('./controllers/contest');
const draftController    = require('./controllers/draft');
const notFoundController = require('./controllers/404');
const confirmController  = require('./controllers/confirm');

//Passport configuration
const passportConfig = require('./config/passport');

//Connect to MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://fantasy-esports:jajajoos@ds157479.mlab.com:57479/fantasy-esports');

mongoose.connection.on('error', () => {
	console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
	process.exit(1);
});

//Express configuration
var app = express();

app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator());
app.use(session({
	secret: process.env.SESSION_SECRET || 'kl23490vnkfF0',
	resave: true,
	saveUninitialized: true,
	store: new MongoStore({ mongooseConnection: mongoose.connection})
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req, res, next) {
	res.locals.user = req.user;
	next();
});

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

//==============
//APP ROUTES
//==============

//Index
app.get('/', indexController.index);

//Signup, login, logout
app.post('/login', userController.postLogin);
app.post('/signup', userController.postSignup);
app.get('/logout', userController.getLogout);

//View contest
app.get('/contest/:id', contestController.getInfo);

//View Player Draft
app.get('/draft/:id', draftController.getInfo);
app.get('/draft/:id', draftController.getUserInfo);

//Go to confirm Screen
app.get('/confirm/:id', confirmController.getInfo);

//Anything else (404)
app.get('*', notFoundController.notFound);

//==============
//END APP ROUTES
//==============

//Create the server
http.createServer(app).listen(app.get('port'), function() {
	console.log('App listening on port %d', app.get('port'));
});

module.exports = app;