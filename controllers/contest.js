const Contest      = require('../models/Contest');
const User         = require('../models/User');
const hltvGameInfo = require('../config/hltv-game-info');
const Livescore    = require('hltv-livescore');

module.exports = {

	getInfo: function(req, res, next) {

		Contest.findById(req.params.id, function(err, contest) {
			if (contest !== null) {
				
				hltvGameInfo(function(games) {
					if (games.length > 1) {
						var cleanedName = contest.name.replace(/\s+/g, '-').toLowerCase();
					    for (var i = 0; i < games.length; i++) {
					    	if (games[i].tournament === cleanedName) {

					    		var live = new Livescore({
					    			listid: games[i].id
					    		});

					    		live.on('scoreboard', function(data) {
					    			var team1 = data.teams['1'];
					    			var team2 = data.teams['2'];

					    			var players1 = team1.players;
					    			var players2 = team2.players;

					    			//Can get (rating, kills, assists, deaths)
					    			//Take data for each player and update database appropriately
					    		});
					    	}
					    }
					}
				});

				res.render('contest', {
					//send variables to front-end
					contests: JSON.stringify(contest)
				});
			} else {
				res.redirect('/404');
			}
		});
	}
};