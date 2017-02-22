const passport = require('passport');
const request = require('request');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/User');

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

//Sign in with local strategy
passport.use(new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password'
	},
	function(email, password, done) {
		User.findOne({ email: {$regex: new RegExp('^' + email.toLowerCase() + '$', 'i')} }, function(err, user) {
			if (!user) return done(null, false, { msg: 'Email not found.' });
			user.comparePassword(password, function(err, isMatch) {
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, { msg: 'Invalid email or password.' });
				}
			});
		});
	}
));

module.exports = {
	isAuthenticated: function(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}
		res.redirect('/');
	}
};