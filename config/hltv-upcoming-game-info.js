var async   = require('async');
var request = require('request');
var cheerio = require('cheerio');

module.exports = (callback) => {

	//Returns array of upcoming games with information (id, date)
	//*NOTE: The times saved in the javascript date object correspond to CEST/CET (European time).*
	request('http://www.hltv.org/matches/', (err, response, body) => {
		if (err || response.statusCode !== 200) {
			callback(new Error(`Request failed: ${response.statusCode}`));
		} else {
			var $ = cheerio.load(body);
			var $matches = $('.matchListBox').toArray();

			//Gets the list of dates from the page.
			var $dates = $('.matchListDateBox').toArray();
			var twoDates = [];
			
			//We get two dates in case the page hasn't gotten rid of the finished games from the previous day yet.
			for (var i = 0; i < 2; i++) {
				var dateString = $dates[i]['children'][0]['data'];
				var dStringLength = dateString.length;
				var date = {};
				
				if (dateString.indexOf("January") !== -1) {
                    date.month = "January";
					
					date.day = parseDate(date.month, dateString);
                }
				else if (dateString.indexOf("February") !== -1) {
                    date.month = "February";
					
					date.day = parseDate(date.month, dateString);
                }
				else if (dateString.indexOf("March") !== -1) {
                    date.month = "March";
					
					date.day = parseDate(date.month, dateString);
                }
				else if (dateString.indexOf("April") !== -1) {
                    date.month = "April";
					
					date.day = parseDate(date.month, dateString);
                }
				else if (dateString.indexOf("May") !== -1) {
                    date.month = "May";
					
					date.day = parseDate(date.month, dateString);
                }
				else if (dateString.indexOf("June") !== -1) {
                    date.month = "June";
					
					date.day = parseDate(date.month, dateString);
                }
				else if (dateString.indexOf("July") !== -1) {
                    date.month = "July";
					
					date.day = parseDate(date.month, dateString);
                }
				else if (dateString.indexOf("August") !== -1) {
                    date.month = "August";
					
					date.day = parseDate(date.month, dateString);
                }
				else if (dateString.indexOf("September") !== -1) {
                    date.month = "September";
					
					date.day = parseDate(date.month, dateString);
                }
				else if (dateString.indexOf("October") !== -1) {
                    date.month = "October";
					
					date.day = parseDate(date.month, dateString);
                }
				else if (dateString.indexOf("November") !== -1) {
                    date.month = "November";
					
					date.day = parseDate(date.month, dateString);
                }
				else if (dateString.indexOf("December") !== -1) {
                    date.month = "December";
					
					date.day = parseDate(date.month, dateString);
                }
				else {
					console.log("INVALID DATE MONTH FOUND!");
				}
				date.year = dateString.substring(dStringLength - 4, dStringLength);
				twoDates.push(date);
            }

			var gameInfo = [];	//Returned array.
			var dateIndex = 0;	//Counter for which dateString to associate with this match.
			var dateToIncrease = false;	//Boolean that determines whether or not we should increase the dateIndex.
			var IsPostponed = false;
			//Simply Delete the below variable if you want to get all upcoming games, not just the ones for the upcoming day.
			var dateHasIncreased = false; //Boolean to keep track of if the date has increased once, if so, we don't add any more games to gameInfo.
			var maybeIncreaseDate = false;

			async.each($matches, (match, next) => {
				if (!dateHasIncreased) {
					var game = {};
					
					//This check has to occur before cheerio.load(match), as that function modifies the match variable.
					//The length = 1 edge case is to account for a random error in the code of hltv page that happens very rarely.
					if (null !== match.next.next && (match.next.next.children.length === 0 || match.next.next.children.length === 1)) {
						dateToIncrease = true;
					}
					var $b = cheerio.load(match);
					$timeCell = $b('.matchTimeCell');
					
					//The following two if statements are because the game preceding a finished or postponed game has the same layout
					//	as that of the last game on a day. So, we check for that and reverse the date increase on the next game
					//	which has either finished or been postponed.
					if ($timeCell.text().trim() === 'Postponed' || $timeCell.text().trim() === 'Finished') {
						dateIndex--;
						
						if (dateIndex <= -1) {
							//Ensures that dateIndex never goes below 0
							dateIndex = 0;
						}
						maybeIncreaseDate = false;
					}

					if (maybeIncreaseDate) {
						if (gameInfo.length === 0) {
							dateIndex = 1;
						}
						else {
							dateHasIncreased = true;
						}
                    }
					
					if (!dateHasIncreased && $timeCell.text().trim() !== 'LIVE' && $timeCell.text().trim() !== 'Finished' && $timeCell.text().trim() !== 'Postponed') {
						var matchURL = $b('.matchActionCell').html().match(/"(.*)"/)[1];
						var matchInfo = matchURL.substring(7);
						var matchTime = $timeCell.text();
					
						game.id = matchInfo.substring(0, 7);
						var dateInfo = twoDates[dateIndex];	//tried to reuse date = here and it was undefined.
						
						game.date = new Date(dateInfo.month + " " + dateInfo.day + ", " + dateInfo.year + " " + matchTime + ":00 GMT+02:00");
						
						gameInfo.push(game);
					} else {
						dateToIncrease = false;
					}
					
					if (dateToIncrease) {
 						maybeIncreaseDate = true;
 						dateIndex++;
 						dateToIncrease = false;
 					}
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

function parseDate(month, dateString) {
	var dayStartIndex = dateString.indexOf(month) + month.length + 1;
	var dayEndIndex = 0;
	var dStringLength = dateString.length;
					
	if (dStringLength - dayStartIndex === 9) {
		dayEndIndex = dayStartIndex + 2;
    }
	else {
		dayEndIndex = dayStartIndex + 1;
	}
	return dateString.substring(dayStartIndex, dayEndIndex);
}

/* USAGE

const hltvUpcomingGameInfo = require('./config/hltv-upcoming-game-info');
*NOTE: The times saved in the javascript date object correspond to CEST/CET (European time).*
hltvUpcomingGameInfo(function(games) {
	if (games.length > 1) {
		//Do stuff
	}
});

Each game has the following format:
{ id: '2308833',
  date: 2017-05-14T12:00:00.000Z }

*/