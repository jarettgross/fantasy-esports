const Contest = require('../models/Contest');

module.exports = {
	index: function(req, res, next) {
		Contest.find({}, '_id name startDate entries.numMax entries.numCurrent')
			.lean()
			.exec(function(err, contests) {
				if (err) return next(err);
				res.render('index', {
					contests: JSON.stringify(contests)
				});
			});
	}
};