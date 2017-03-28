var async   = require('async');
var request = require('request');
var cheerio = require('cheerio');

module.exports = (callback) => {

	//Returns array of upcoming games with information (status, tournament, id)
	request('http://www.hltv.org/matches/', (err, response, body) => {
		if (err || response.statusCode !== 200) {
			callback(new Error(`Request failed: ${response.statusCode}`));
		} else {
			var $ = cheerio.load(body);
			var $matches = $('.matchListBox').toArray();

			//Gets the list of dates from the page.
			var $dates = $('.matchListDateBox').toArray();
			var dateStrings = []
			for (var i = 0; i<$dates.length; i++) {
				dateStrings[i] = $dates[i]['children'][0]['data']
            }
			var gameInfo = [];	//Returned array.
			var dateIndex = 0;	//Counter for which dateString to associate with this match.
			var dateToIncrease = false;	//Boolean that determines whether or not we should increase the dateIndex.
			
			async.each($matches, (match, next) => {
				var game = {}
				
				/*if (null !== match.next.next) {
					//console.log(match.next.next.children.length)	//Used for testing
                }*/
				
				//This check has to occur before cheerio.load(match), as that function modifies the match variable.
				//The length = 1 edge case is to account for a random error in the code of hltv page that happens very rarely.
				if (null !== match.next.next && (match.next.next.children.length === 0 || match.next.next.children.length === 1)) {
					dateToIncrease = true;
				}
				var $b = cheerio.load(match);
				$timeCell = $b('.matchTimeCell')
				
				if ($timeCell.text() !== 'LIVE' && $timeCell.text() !== 'Finished' && $timeCell.text() !== 'Postponed') {
					var matchURL = $b('.matchActionCell').html().match(/"(.*)"/)[1];
					var matchInfo = matchURL.substring(7);
					
					game.id = matchInfo.substring(0, 7);
					game.time = $timeCell.text();
					game.date = dateStrings[dateIndex];
					
					gameInfo.push(game);
				}
				if (dateToIncrease) {
					dateIndex++;
					dateToIncrease = false;
				}
				next();

			}, (err) => {
				if (err) {
					callback(err);
				} else {
					callback(gameInfo);
				}
			});
		}
	});
};

/* USAGE

const hltvUpcomingGameInfo = require('./config/hltv-upcoming-game-info');
 
hltvUpcomingGameInfo(function(games) {
	if (games.length > 1) {
		//Do stuff
	}
});

*/