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
					    			//Take data for each player and update each user's score who has these players

					    			var userIDs = contest.entries.user_ids;
									for (var i = 0; i < userIDs.length; i++) {
										//Find each user who entered this contest
										User.findById(userIDs[i], function(err, user) {
											//Find this contest in User database
											for (var j = 0; j < user.contests.length; j++) {
												if (user.contests[j].id === req.params.id) {
													//For each player on the user's team
													for (var k = 0; k < user.contests[j].teams.length; k++) {

														//Check if the player received an updated score, and update database
														for (var m = 0; m < players1.length; m++) {
															var player = players1[m];
															if (player.hltvid === user.contests[j].teams[k]) {
																//FIXME: scoring algorithm
																user.contests[j].points = 0;
																var playerScore = player.rating + player.kills + player.assists - player.deaths;
																//FIXME: this won't work properly since it doesn't subtract the score that this player previously had
																user.contests[j].points += playerScore;
															}
														}

														for (var n = 0; n < players2.length; n++) {
															var player = players2[n];
															if (player.hltvid === user.contests[j].teams[k]) {
																//FIXME: scoring algorithm
																var playerScore = player.rating + player.kills + player.assists - player.deaths;
																//FIXME: this won't work properly since it doesn't subtract the score that this player previously had
																user.contests[j].points += playerScore;
															}
														}

													}
												}
											}
										});
									}
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