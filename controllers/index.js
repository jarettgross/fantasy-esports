module.exports = {
	index: function(req, res, next) {
		res.render('index', { 
			//pass variables to front-end here
		});
	}
};