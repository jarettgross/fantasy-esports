const Contest = require('../models/Contest');
const User    = require('../models/User');

module.exports = {
	postPlayerDraft: function(req, res, next) {
		if (req.body.isMyTeam !== 'false') {
			var contestID = encodeURIComponent(req.body.contestID);
			res.send({
				success: true,
				redirect: '/myteam?contestID=' + contestID
			});
		} else {
			for (var i = 0; i < req.user.contests.length; i++) {
				//Find contest in user data
				if (req.user.contests[i].id == req.body.contestID) {
					var contest = req.user.contests[i];
					var isPlayerOnTeam = -1;
					for (var j = 0; j < contest.team.length; j++) {
						if (contest.team[j] == req.body.playerID) {
							isPlayerOnTeam = j;
							break;
						}
					}

					if (isPlayerOnTeam !== -1) {
						contest.team.splice(j, 1);
					} else {
						contest.team.push(req.body.playerID);
					}
					req.user.contests[i] = contest;
					req.user.save();

					break;
				}
			}
			res.send({
				success: true
			});
		}
	},

	getInfo: function(req, res, next) {
		if (req.user) {
			Contest.findById(req.params.id, function(err, contest) {
				if (contest !== null) {
					//Search for contest
					for (var i = 0; i < req.user.contests.length; i++) {
						if (req.user.contests[i].id === contest._id) {
							//Send user's contest info and regular contest info to draft page
							return res.render('draft', {
								userInfo:    JSON.stringify(req.user.contests[i]),
								contestInfo: JSON.stringify(contest)
							});
						}
					}
					
					//Add contest to user if not found
					req.user.contests.push({
						id: contest._id
					});
					req.user.save();

					return res.render('draft', {
						userInfo:    JSON.stringify(req.user.contests[req.user.contests.length - 1]),
						contestInfo: JSON.stringify(contest)
					});
				} else {
					res.redirect('/404');
				}
			});
		} else {
			res.redirect('/');
		}
	}
};