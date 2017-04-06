const Contest      = require('../models/Contest');
const User         = require('../models/User');
const hltvGameInfo = require('../config/hltv-game-info');
const Livescore    = require('hltv-livescore');

module.exports = {

	getInfo: function(req, res, next) {

		Contest.findById(req.params.id, function(err, contest) {
			if (contest !== null) {
				res.render('contest', {
					contests: JSON.stringify(contest)
				});
			} else {
				res.redirect('/404');
			}
		});
	}
};