const Contest      = require('../models/Contest');
const User         = require('../models/User');

module.exports = {

	getInfo: function(req, res, next) {

		Contest.findById(req.params.id, function(err, contest) {
			if (contest !== null) {
				//Search for contest
					for (var i = 0; i < req.user.contests.length; i++) {
						if (req.user.contests[i].id === contest._id) {
							//Send user's contest info and regular contest info to draft page
							res.render('score', {
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
	}
};