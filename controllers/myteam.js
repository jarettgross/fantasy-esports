const Contest = require('../models/Contest');
const User    = require('../models/User');
const async   = require('async');

module.exports = {
	postSubmitTeam: function(req, res, next) {
		var contests = req.user.contests;
		for (var i = 0; i < contests.length; i++) {
			if (contests[i].id === req.body.contestID) {
				if (contests[i].team.length === 5) {
					contests[i].entered = true;
					req.user.save();

					Contest.findById(contests[i].id, function(err, contestInfo) {
						if (contestInfo !== null) {
							contestInfo.entries.user_ids.push(req.user._id);
							contestInfo.save();
						}
					});
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
									return done(null, {
										name:    contestInfo.name,
										id:      contest.id,
										status: 'ongoing',
										teamIDs: contest.team,
										entered: contest.entered
									});
								} else if (startDate > today) {
									//Contest not started
									return done(null, {
										name:    contestInfo.name,
										id:      contest.id,
										status:  'upcoming',
										teamIDs: contest.team,
										entered: contest.entered
									});
								} else if (endDate < today) {
									//Contest finished
									if (contest.entered) {
										return done(null, {
											name:    contestInfo.name,
											id:      contest.id,
											status:  'finished',
											teamIDs: contest.team,
											entered: contest.entered
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
				if (req.query.contestID === undefined) {
					var initialContest = undefined;
				} else {
					initialContest = req.query.contestID;
				}

				res.render('myteam', {
					contestsInfo: JSON.stringify(contestsInfo),
					initialContest: initialContest
				});
			});
		} else {
			res.redirect('/');
		}
	}
};