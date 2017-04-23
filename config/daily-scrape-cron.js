const Contest      = require('../models/Contest');
const User         = require('../models/User');
const CronJob      = require('cron').CronJob;
const hltvUpcomingGameInfo = require('./hltv-upcoming-game-info');
const hltvGameInfo = require('./hltv-game-info');
const Livescore = require('hltv-livescore');

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
				if (games.length >= 1) {
					for (var i = 0; i < games.length; i++) {
						beginScoreUpdates(games[i].date, 2309966);
					}
				}
			});
		},
		start: false,
		timeZone: 'Europe/Paris',
		runOnInit: true
	})
};

//Runs CronJob for getting the scoreboard of a game once the game begins
function beginScoreUpdates(date, gameID) {
	var job = new CronJob({
		cronTime: date,
		onTick: function() {
			console.log('CronJob running for game: ' + gameID + ' at date: ' + date);

			hltvGameInfo(function(games) {
				if (games.length >= 1) {
		    		var live = new Livescore({
		    			listid: gameID
		    		});
					
					//Figure out what contest this match is in. This code didn't seem to work in my test file, but it looks correct to me?
					var contest = null;
					for (var i = 0; i < games.length; i++) {
						if (games[i].id == gameID) {
							var contestName = games[i].tournament;
							Contest.findOne({ 'name' : { $regex : new RegExp('^' + contestName + '$', 'i') } }, function(err, contestInfo) {
								contest = contestInfo;

								if (contest !== null) {
									//Read data when a "scoreboard" update is sent
									live.on('scoreboard', function(data) {
										var team1 = data.teams['1'];
										var team2 = data.teams['2'];

										//Can get (rating, kills, assists, deaths) from each player
										var players1 = team1.players;
										var players2 = team2.players;
										console.log('SCOREBOARD UPDATE');
										updateContestScores(contest, 'SCOREBOARD', players1, players2);
									});

									//Read data when the bomb is defused -- award points if the round is won by the defused bomb
									live.on('bombDefused', function(defuseData) {
										live.on('roundEnd', function(roundData) {
											if (roundData.winType === 'BOMB_DEFUSED') {
												var playerDefuser = [defuseData.player];
												console.log('BOMB DEFUSED');
												updateContestScores(contest, 'BOMB_DEFUSED', playerDefuser, null);
											}
										});
									});

									//Read data when the bomb is planted -- award points if the round is won by the bomb
									live.on('bombPlanted', function(plantedData) {
										live.on('roundEnd', function(roundData) {
											if (roundData.winType === 'TARGET_BOMBED') {
												var playerBomber = [plantedData.player];
												console.log('TARGET BOMBED');
												updateContestScores(contest, 'TARGET_BOMBED', playerBomber, null);
											}
										});
									});

									//Read data when a player commits suicide -- subtract points from that player's score
									live.on('suicide', function(suicideData) {
										var playerSuicide = suicideData.player;
										console.log('SUICIDE');
										updateContestScores(contest, 'SUICIDE', playerSuicide, null);
									});
								} else {
									console.log("Contest not found for match " + gameID);
								}
							});
						}
					}
				}
			});
		},
		start: false,
		timeZone: 'Europe/Paris',
		runOnInit: true
	});
	job.start();
}

//Take data for each player and update each user's score who has these players
//contest   - contest being updated
//scoretype - "SCOREBOARD", "BOMB_DEFUSED", "TARGET_BOMBED", "SUICIDE" (determines how player points are updated)
//players1  - players on team1
//players2  - players on team2
function updateContestScores(contest, scoreType, players1, players2) {

	//Update score for each player on team 1
	for (var i = 0; i < players1.length; i++) {
		var player = players1[i];
		var playerScore = player.kills + player.assists - player.deaths;
		if (scoreType === 'BOMB_DEFUSED') {
			playerScore += 1;
		} else if (scoreType === 'TARGET_BOMBED') {
			playerScore += 1;
		} else if (scoreType === 'SUICIDE') {
			playerScore -= 1;
		}
	}

	//Update score for each player on team 2 (if provided)
	if (scoreType === 'SCOREBOARD') {
		for (var i = 0; i < players2.length; i++) {
			var player = players2[i];
			var playerScore = player.kills + player.assists - player.deaths;
		}
	}

	var userIDs = contest.entries.user_ids;
	for (var i = 0; i < userIDs.length; i++) {
		//Find each user who entered this contest
		User.findById(userIDs[i], function(err, user) {
			//Find this contest in User database
			for (var j = 0; j < user.contests.length; j++) {
				if (user.contests[j].id === contest._id) {
					//Update user score
					user.contests[j].points = 0;
					for (var k = 0; k < user.contests[j].team.length; k++) {
						var playerID = user.contests[j].team[k];
						//Grab player points in contest database
						for (var m = 0; m < contest.players.length; m++) {
							if (playerID === contest.players[m].id) {
								user.contests[j].points += contest.players[m].points;
								console.log(user.contests[j].points);
							}
						}
					}
					user.save();
				}
			}
		});
	}
}