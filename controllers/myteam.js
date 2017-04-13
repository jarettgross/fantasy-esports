const Contest = require('../models/Contest');
const User    = require('../models/User');
const async   = require('async');

module.exports = {
	postSubmitTeam: function(req, res, next) {
		var contests = req.user.contests;
		for (var i = 0; i < contests; i++) {
			if (contests[i].id === req.body.contestID) {
				if (contests[i].team.length === 5) {
					contests[i].entered = true;
					req.user.save();
					return res.send({
						success: true
					});
				} else {
					return res.send({
						success: false
					});
				}
			}
		}
	},

	getTeam: function(req, res, next) {
		if (req.user) {
			var contests = req.user.contests;
			async.waterfall([
				function(callback) {
					//Get all contests that user is currently in (entered or not)
					async.map(contests, function(contest, done) {
						Contest.findById(contest.id, function(err, contestInfo) {
							if (contestInfo !== null) {
								var today = new Date();
								var startDate = new Date(contestInfo.startDate);
								var endDate = new Date(contestInfo.endDate);

								if (startDate < today && today < endDate) {
									//Ongoing contest
									if (contest.entered) {
										return done(null, {
											firstContest:  req.query.contestID,
											contestName:   contestInfo.name,
											contestID:     contest.id,
											contestStatus: 'ongoing',
											teamIDs:       contest.team
										});
									} else {
										return done(null);
									}
								} else if (startDate > today) {
									//Contest not started
									return done(null, {
										firstContest:  req.query.contestID,
										contestName:   contestInfo.name,
										contestID:     contest.id,
										contestStatus: 'upcoming',
										teamIDs:       contest.team
									});
								} else if (endDate < today) {
									//Contest finished
									if (contest.entered) {
										return done(null, {
											firstContest:  req.query.contestID,
											contestName:   contestInfo.name,
											contestID:     contest.id,
											contestStatus: 'finished',
											teamIDs:       contest.team
										});
									} else {
										return done(null);
									}
								} else {
									return done(null);
								}
							} else {
								return done(null);
							}
						});
					}, function(err, contestsInfo) {
						callback(null, contestsInfo);
					});
				}

			], function (err, contestsInfo) {
				res.render('myteam', {
					contestsInfo: JSON.stringify(contestsInfo)
				});
			});
		} else {
			res.redirect('/');
		}
	}
};