const Contest = require('../models/Contest');
const User    = require('../models/User');

module.exports = {
	postSubmitTeam: function(req, res, next) {

	},

	getTeam: function(req, res, next) {
		if (req.user) {
			res.render('myteam', {
				userInfo: JSON.stringify(req.user)
			});
		} else {
			res.redirect('/');
		}
	}
};