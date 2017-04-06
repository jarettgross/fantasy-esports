const Contest      = require('../models/Contest');
const User         = require('../models/User');
const hltvGameInfo = require('../config/hltv-game-info');
const Livescore    = require('hltv-livescore');
const async        = require('async');

module.exports = {

	getInfo: function(req, res, next) {

		Contest.findById(req.params.id, function(err, contest) {
			if (contest !== null) {
				var contestUsersInfo = [];
				var userIDs = contest.entries.user_ids;

				async.waterfall([
					function(callback) {
						//Store (id, username, points) for each user that entered this contest
						async.map(userIDs, function(id, done) {
							User.findById(id, '_id username contests', function(err, user) {
								if (user !== null) {
									for (var j = 0; j < user.contests.length; j++) {
										if (user.contests[j].id === contest._id) {
											done(null, {
												id:       user._id,
												username: user.username,
												points:   user.contests[j].points
											});
										} else {
											done(null);
										}
									}
								}
							});
						}, function(err, contestUsersInfo) {
							callback(null, contestUsersInfo);
						});
					}

				], function (err, contestUsersInfo) {
					res.render('contest', {
						contest:      JSON.stringify(contest),
						contestUsers: JSON.stringify(contestUsersInfo)
					});
				});

			} else {
				res.redirect('/404');
			}
		});
	}
};