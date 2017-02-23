const Contest = require('../models/Contest');

module.exports = {
	index: function(req, res, next) {
		Contest.find({}, '_id name startDate entries.numMax entries.numCurrent')
			.lean()
			.exec(function(err, contests) {
				var jsonContests = JSON.parse(JSON.stringify(contests));

				if (err) return next(err);
				res.render('index', {
					contests: jsonContests
				});
			});
	}
};