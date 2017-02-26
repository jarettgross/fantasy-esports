const Contest = require('../models/Contest');
const User    = require('../models/User');

module.exports = {

	getInfo: function(req, res, next) {

		Contest.findById(req.params.id, function(err, contest) {
			if (contest !== null) {
				//Contest was found in database
				//Do stuff here
				res.render('contest', {
					//send variables to front-end
				});
			} else {
				res.redirect('/404');
			}
		});
	}
};