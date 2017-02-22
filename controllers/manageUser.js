const crypto   = require('crypto');
const bcrypt   = require('bcrypt-nodejs');
const passport = require('passport');
const User     = require('../models/User');
const request  = require('request');

module.exports = {

	postSignup: function(req, res, next) {
		req.assert('username', 'Username must be at least 3 characters long').len(3);
		req.assert('username', 'Invalid username').matches(/^[a-zA-Z0-9.\-_$@*!]{3,30}$/);
		req.assert('password', 'Password must be at least 6 characters long').matches(/^[\s\S]{6,60}$/);
		req.assert('email', 'Invalid email').isEmail();
		req.assert('email', 'Email must be at least 3 characters long').matches(/^[\s\S]{3,60}$/);

		req.sanitize('email').normalizeEmail({ remove_dots: false });

		const errors = req.validationErrors();

		if (errors) {
			var errorMsgs = [];
			for (var i = 0; i < errors.length; i++) {
				errorMsgs.push(errors[i].msg);
			}
			var email = '';
			if (req.body.email !== false) email = req.body.email;
			return res.send({
				success:   false,
				username:  req.body.username,
				email:     email,
				errors:    errorMsgs
			});
		}
		
		const user = new User({
			username: req.body.username,
			password: req.body.password,
			email:    req.body.email.toLowerCase()
		});

		User.findOne({ username: {$regex: new RegExp('^' + req.body.username.toLowerCase() + '$', 'i')} }, function(err, existingUser) {
			if (existingUser !== null) {
				return res.send({
					success:   false,
					username:  req.body.username,
					email:     req.body.email,
					errors:    ['Username taken']
				});
			} else {
				User.findOne({ email: req.body.email }, function(err, existingEmail) {
					if (existingEmail !== null) {
						return res.send({
							success:   false,
							username:  req.body.username,
							email:     req.body.email,
							errors:    ['Email taken']
						});
					}

					user.save(function(err) {
						if (err) {
							return res.send({
								success:   false,
								username:  req.body.username,
								email:     req.body.email,
								errors:    ['Please enter all values']
							});
						}

						req.logIn(user, function(err) {
							if (err) return (next(err));
							res.send({
								success:  true,
								redirect: '/'
							});
						});
					});
				});
			}
		});
	},

	postLogin: function(req, res, next) {
		req.assert('email', 'Email cannot be blank').notEmpty();
		req.assert('password', 'Password cannot be blank').notEmpty();
		const errors = req.validationErrors();

		if (errors) {
			req.flash('errors', errors);
			return res.send({
				success:  false,
				redirect: '/'
			});
		}

		passport.authenticate('local', function(err, user, info) {
			if (err) return next(err);
			if (!user) {
				req.flash('errors', info);
				return res.send({
					success:  false,
					redirect: '/'
				});
			}
			req.logIn(user, function(err) {
				if (err) return next(err);
				return res.send({
					success:  true,
					redirect: '/'
				});
			});
		})(req, res, next);
	},

	getLogout: function(req, res, next) {
		req.logout();
		return res.redirect('/');
	}
};