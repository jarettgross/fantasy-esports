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
const indexController = require('./controllers/index');

//Passport configuration
const passportConfig = require('./config/passport');

//Connect to MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);

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

/***********
**APP ROUTES
************/
//Index
app.get('/', indexController.index);

//Signup, login
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.getLogout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);

//Anything else (404)
app.get('*', notFoundController.notFound);

/***********
**END app routes
************/

//Create the server
http.createServer(app).listen(app.get('port'), function() {
	console.log('App listening on port %d', app.get('port'));
});

module.exports = app;