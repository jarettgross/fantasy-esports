var async   = require('async');
var request = require('request');
var cheerio = require('cheerio');

module.exports = (callback) => {

	//Returns array of games with information (status, tournament, id)
	request('http://www.hltv.org/matches/', (err, response, body) => {
		if (err || response.statusCode !== 200) {
			callback(new Error(`Request failed: ${response.statusCode}`));
		} else {
			var $ = cheerio.load(body);
			var $matches = $('.matchListBox').toArray();

			var updated = [];

			var i;

			async.each($matches, (match, next) => {
				var game = {};

				var $b = cheerio.load(match);

				switch($b('.matchTimeCell').text()) {
					case 'Finished':
						game.status = 'finished';
						break;
					case 'LIVE':
						game.status = 'live';
						break;
		            default:
						game.status = 'upcoming';
		        }

				if (game.status !== 'upcoming') {

					//For each recently finished or live game, get id of game and the tournament of the game

					var matchURL = $b('.matchActionCell').html().match(/"(.*)"/)[1];
					var matchInfo = matchURL.substring(7);

					var team1 = $b('.matchTeam1Cell').text().trim().replace(/[#\. ,:-]+/, '-');
					var team2 = $b('.matchTeam2Cell').text().trim().replace(/[#\. ,:-]+/, '-');

					var dashCount      = 3;
					var tournamentDash = 0;
					var tournamentIdx  = 0;

					for (i = 0; i < team1.length; i++) {
						if (team1.charAt(i) === '-') {
							dashCount++;
						}
					}

					for (i = 0; i < team1.length; i++) {
						if (team2.charAt(i) === '-') {
							dashCount++;
						}
					}

					while (tournamentDash !== dashCount) {
						if (matchInfo.charAt(tournamentIdx) === '-') {
							tournamentDash++;
						}
						tournamentIdx++;
					}

					game.tournament = matchInfo.substring(tournamentIdx);
					game.id         = matchInfo.substring(0, 7);
					
					game.tournament = game.tournament.replace('-', ' ');
					
					updated.push(game);
				}

				next();

			}, (err) => {
				if (err) {
					callback(err);
				} else {
					callback(updated);
				}
			});
		}
	});
};

/* USAGE

const hltvGameInfo = require('./config/hltv-game-info');
 
hltvGameInfo(function(games) {
	if (games.length > 1) {
		//Do stuff
	}
});


Data format: Array of
{
	status,
	tournament,
	id
}

*/