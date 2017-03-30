const Contest      = require('../models/Contest');
const User         = require('../models/User');
const CronJob      = require('cron').CronJob;
const hltvUpcoming = require('./hltv-upcoming-game-info');
const hltvGameInfo = require('./hltv-game-info');

/*
* Scrape HLTV for upcoming games for the next day
* Runs every day at 11:59:00 PM (EST)
*/
module.exports = {
	dailyScrape: new CronJob({
		cronTime: '00 59 23 * * *',
		onTick: function() {
			console.log('Daily CronJob running');

			hltvUpcomingGameInfo(function(games) {
				if (games.length > 1) {
					for (var i = 0; i < games.length; i++) {
						beginScoreUpdates(games[i].date, games[i].id);
					}
				}
			});
		},
		start: false,
		timeZone: 'America/New_York'
	});
};

//Runs CronJob for getting the scoreboard of a game once the game begins
function beginScoreUpdates(date, gameID) {
	var job = new CronJob(
		cronTime: date, 
		onTick: function() {
			console.log('CronJob running for game: ' + gameID + 'at date: ' + date);

			hltvGameInfo(function(games) {
				if (games.length > 1) {
					//var cleanedName = contest.name.replace(/\s+/g, '-').toLowerCase();
		    		var live = new Livescore({
		    			listid: gameID
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
			});
		},
		start: false,
		timeZone: 'America/New_York'
	});
}