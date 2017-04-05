const Contest = require('../models/Contest');

module.exports = {
	index: function(req, res, next) {
		Contest.find({}, '_id name startDate endDate entries.numMax entries.numCurrent')
			.lean()
			.exec(function(err, contests) {
				if (err) return next(err);
				for (var i = 0; i < contests.length; i++) {
					var contestDate = new Date(contests[i].endDate);
					var todaysDate = new Date();
					if (contestDate < todaysDate) {
						contests.splice(i, 1);
					}
				}
				res.render('index', {
					contests: JSON.stringify(contests)
				});
			});
	}
};