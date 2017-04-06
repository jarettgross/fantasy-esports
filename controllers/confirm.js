const Contest = require('../models/Contest');
const User    = require('../models/User');

module.exports = {

	getInfo: function(req, res, next) {

		User.findById(req.params.id, function(err, users){
			if(users !== null) {
				res.render('draft',{
					userInfo: JSON.stringify(users)
				});
			} else{
				res.redirect('/404');
			}
		});
	}
};