const Contest      = require('../models/Contest');
const User         = require('../models/User');
const CronJob      = require('cron').CronJob;
const hltvUpcomingGameInfo = require('./hltv-upcoming-game-info');
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
	})
};

//Runs CronJob for getting the scoreboard of a game once the game begins
function beginScoreUpdates(date, gameID) {
	var job = new CronJob({
		cronTime: date, 
		onTick: function() {
			console.log('CronJob running for game: ' + gameID + ' at date: ' + date);

			hltvGameInfo(function(games) {
				if (games.length > 1) {
					//var cleanedName = contest.name.replace(/\s+/g, '-').toLowerCase();
		    		var live = new Livescore({
		    			listid: gameID
		    		});

		    		//Read data when a "scoreboard" update is sent
		    		live.on('scoreboard', function(data) {
		    			var team1 = data.teams['1'];
		    			var team2 = data.teams['2'];

		    			//Can get (rating, kills, assists, deaths) from each player
		    			var players1 = team1.players;
		    			var players2 = team2.players;

		    			updateContestScores(contest, 'SCOREBOARD', players1, players2);
		    		});

		    		//Read data when the bomb is defused -- award points if the round is won by the defused bomb
		    		live.on('bombDefused', function(defuseData) {
		    			live.on('roundEnd', function(roundData) {
		    				if (roundData.winType === 'BOMB_DEFUSED') {
		    					var playerDefuser = [defuseData.player];
		    					updateContestScores(contest, 'BOMB_DEFUSED', playerDefuser);
		    				}
		    			});
		    		});

		    		//Read data when the bomb is planted -- award points if the round is won by the bomb
		    		live.on('bombPlanted', function(plantedData) {
		    			live.on('roundEnd', function(roundData) {
		    				if (roundData.winType === 'TARGET_BOMBED') {
		    					var playerBomber = [plantedData.player];
		    					updateContestScores(contest, 'TARGET_BOMBED', playerBomber);
		    				}
		    			});
		    		});

		    		//Read data when a player commits suicide -- subtract points from that player's score
		    		live.on('suicide', function(suicideData) {
		    			var playerSuicide = suicideData.player;
		    			updateContestScores(contest, 'SUICIDE', playerSuicide);
		    		});
				}
			});
		},
		start: false,
		timeZone: 'America/New_York'
	});
}

//Take data for each player and update each user's score who has these players
//contest  - contest being updated
//players1 - players on team1
//players2 - players on team2
function updateContestScores(contest, scoreType, players1, players2 = null) {
	var userIDs = contest.entries.user_ids;
	for (var i = 0; i < userIDs.length; i++) {
		//Find each user who entered this contest
		User.findById(userIDs[i], function(err, user) {
			//Find this contest in User database
			for (var j = 0; j < user.contests.length; j++) {
				if (user.contests[j].id === req.params.id) {
					//For each player on the user's team
					for (var k = 0; k < user.contests[j].teams.length; k++) {

						//Update player score
						for (var m = 0; m < players1.length; m++) {
							var player = players1[m];
							if (player.hltvid === user.contests[j].teams[k]) {
								//FIXME: scoring algorithm
								var playerScore = player.rating + player.kills + player.assists - player.deaths;

								if (scoreType === 'BOMB_DEFUSED') {
									playerScore += 1;
								} else if (scoreType === 'TARGET_BOMBED') {
									playerScore += 1;
								} else if (scoreType === 'SUICIDE') {
									playerScore -= 1;
								}

								//FIXME: this won't work properly since it doesn't subtract the score that this player previously had
								user.contests[j].points += playerScore;
							}
						}

						if (scoreType === 'SCOREBOARD') {
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
			}
		});
	}
}