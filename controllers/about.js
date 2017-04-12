module.exports = {

	getAbout: function(req, res, next) {

		res.render('about', {
			user: req.user
		});
	}
};