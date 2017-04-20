const Contest = require('../models/Contest');
const User    = require('../models/User');

module.exports = {
	postPlayerDraft: function(req, res, next) {
		if (req.body.isMyTeam) {
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
					if (contest.team.length == 0) {
						contest.team.push(req.body.playerID);
						req.user.contests[i] = contest;
						req.user.save();
					} else {
						var checker = 0;
						for (var j = 0; j < contest.team.length; j++) {
							//If player is on team, remove player from team, otherwise add player to team
							if (contest.team[j] == req.body.playerID) {
								contest.team.splice(j, 1);
								j--;
							} else {
								checker++;
							}

							if (checker == contest.team.length) {
								console.log(req.body.playerID);
								contest.team.push(req.body.playerID);
								req.user.contests[i] = contest;
								req.user.save();
							}
						}
					}
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
							res.render('draft', {
								userInfo:    JSON.stringify(req.user.contests[i]),
								contestInfo: JSON.stringify(contest)
							});
							return;
						}
					}
					
					//Add contest to user if not found
					req.user.contests.push({
						id: contest._id
					});
					req.user.save();
				} else {
					res.redirect('/404');
				}
			});
		} else {
			res.redirect('/');
		}
	}
};