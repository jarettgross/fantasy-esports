document.addEventListener('DOMContentLoaded', function() {

	//=================
	// INDEX
	//=================

	if ($('.section-wrapper').attr('id') === 'index-wrapper') {

		$('#signup-form').submit(function(event) {
			event.preventDefault();
			$.post('/signup',
				$('#signup-form').serialize(),
				function(data) {
					if (data.success) {
						window.location = data.redirect;
					} else {
						//Error
					}
				});
		});

		$('#login-form').submit(function(event) {
			event.preventDefault();
			$.post('/login',
				$('#login-form').serialize(),
				function(data) {
					if (data.success) {
						window.location = data.redirect;
					} else {
						//Error
					}
				});
		});
		
		//Store all contests that haven't finished yet in an array.
		var contestArray = contests;
		
		//Sort the contests according to start date, end date, and name.
		contestArray.sort(function(a,b){
			if (a.startDate.localeCompare(b.startDate) !== 0) {
                return a.startDate.localeCompare(b.startDate);
            }
			else if (a.endDate.localeCompare(b.endDate) !== 0) {
                return a.endDate.localeCompare(b.endDate);
            }
			else {
				return a.name.localeCompare(b.name);
			}
		});
		
		//Append the sorted contests to the page
		for (var i = 0; i < contestArray.length; i++) {
			var contest = contestArray[i];
			
			if (i === contestArray.length - 1) {
				 $('#index-wrapper').append($('<div/>').addClass('contest-listing').addClass('last-listing'));
			} else {
				 $('#index-wrapper').append($('<div/>').addClass('contest-listing'));
			}

			var contestName = "";
			if (contest.name.length > 40) {
		        contestName = contest.name.substring(0, 35) + "..."
		    } else {
				contestName = contest.name;
			}

			$('#index-wrapper').find('div.contest-listing').last().append($('<div/>').text(contestName).addClass('contest-name'));
			$('#index-wrapper').find('div.contest-listing').last().append($('<div/>').text(contest.startDate).addClass('contest-date'));
			$('#index-wrapper').find('div.contest-listing').last().append($('<div/>').text(contest.entries.numCurrent + '/' + contests[i].entries.numMax).addClass('contest-entry-count'));
			$('#index-wrapper').find('div.contest-listing').last().append($('<div/>').addClass('enter-link-wrapper'));
			$('#index-wrapper').find('.enter-link-wrapper').last().append($('<a/>').attr('href', '/contest/' + contest._id).text('ENTER').addClass('enter-link'));

			if (new Date(contest.startDate) <= new Date()) {
				$('#index-wrapper').find('div.contest-listing').last().append($('<div/>').addClass('score-link-wrapper'));
                $('#index-wrapper').find('.score-link-wrapper').last().append($('<a/>').attr('href', '/score/' + contest._id).text('SCORE').addClass('score-link'));
            }
		}
	}

	//=================
	// CONTEST VIEW
	//=================

	if ($('.section-wrapper').attr('id') === 'contest-wrapper') {

		$('#contest-wrapper').append($('<div/>').text(contestInfo.name).attr('id', 'page-contest-name'));
		$('#contest-wrapper').append($('<div/>').text(contestInfo.startDate + ' to ' + contestInfo.endDate).attr('id', 'page-contest-date'));
		//$('#contest-wrapper').append($('<div/>').text(contestInfo.entries.numCurrent + '/' + contestInfo.entries.numMax).attr('id', 'page-contest-entries'));

		//Create Draft button
		$('#contest-wrapper').append($('<div/>').addClass('draft-button-wrapper'));
		$('#contest-wrapper').find('.draft-button-wrapper').last().append($('<a/>').attr('href', '/draft/' + contestInfo._id).text('DRAFT').addClass('draft-button'));
		
		$('#contest-wrapper').append($('<div/>').addClass('scoreboard'));

		$('#contest-wrapper').find('div.scoreboard').last().append($('<div/>').addClass('user-listing').addClass('user-listing-header'));
		$('#contest-wrapper').find('div.scoreboard div.user-listing').last().append($('<div/>').text('Name').addClass('contest-player-name-header'));
		$('#contest-wrapper').find('div.scoreboard div.user-listing').last().append($('<div/>').text('Score').addClass('contest-score-header'));
		
		//List all usernames corresponding to the user ids that are in the contest entries
		for (var i = 0; i < contestUsers.length; i++) {
			if (i === contestUsers.length - 1) {
				$('#contest-wrapper').find('div.scoreboard').last().append($('<div/>').addClass('user-listing').addClass('user-listing-footer'));
			} else {
				$('#contest-wrapper').find('div.scoreboard').last().append($('<div/>').addClass('user-listing'));
			}
			$('#contest-wrapper').find('div.scoreboard div.user-listing').last().append($('<div/>').text(contestUsers[i].username).addClass('contest-player-name'));
			$('#contest-wrapper').find('div.scoreboard div.user-listing').last().append($('<div/>').text(contestUsers[i].points).addClass('contest-score'));
		}
	}

	//================
	// CONFIRM PAGE
	//================

	if ($('.section-wrapper').attr('id') === 'confirm-wrapper'){

	}

	//=================
	// DRAFT PAGE
	//=================

	if ($('.section-wrapper').attr('id') === 'draft-wrapper') {
		//Relevant contestInfo should be saved in a value called contestInfo
		var allPlayers = [];
		$.ajax({ url: "../js/lib/AllStats.csv", success: function(csv) {
			allPlayers = processData(csv);
			var playersInfo = contestInfo.players;
			
			//Get player data for each player that is in the contest
			var players = [];
			for (var i = 0; i < allPlayers.length; i++) {
				for (var j = 0; j < playersInfo.length; j++) {
					var playerID = parseInt(allPlayers[i][1].split(':')[1]);
					if (playerID === playersInfo[j].id) {
						players.push(allPlayers[i]);
					}
				}
			}

			for (var i = 0; i < players.length; i++) {
				//Set headers of columns
				if (i === 0) {
					$('#draft-wrapper').append($('<div/>').addClass('draft-listing').addClass('draft-listing-header'));
					$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text("Name").addClass('player-name'));
					$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text("Kills").addClass('player-kills'));
					$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text("Headshot %").addClass('player-headshots'));
					$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text("Deaths").addClass('player-deaths'));
					$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text("# Rounds").addClass('player-roundsP'));
					$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text("Assists").addClass('player-assists'));
					$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text("Team Name").addClass('player-team'));
				}

				//Display data in divs for each player
				if (i === players.length - 1) {
					$('#draft-wrapper').append($('<div/>').addClass('draft-listing').addClass('draft-listing-footer'));
				} else {
					$('#draft-wrapper').append($('<div/>').addClass('draft-listing'));
				}

				var names = players[i][0].split(":")[1];
				$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text(names).addClass('player-name'));

				var kills = players[i][2].split(":")[1];
				$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text(kills).addClass('player-kills'));

				var headshots = players[i][3].split(":")[1];
				$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text(headshots).addClass('player-headshots'));

				var deaths = players[i][4].split(":")[1];
				$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text(deaths).addClass('player-deaths'));

				var roundsPlayed = players[i][5].split(":")[1];
				$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text(roundsPlayed).addClass('player-roundsP'));

				var assists = players[i][6].split(":")[1];
				$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text(assists).addClass('player-assists'));

				var team = players[i][10].split(":")[1];
				$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text(team).addClass('player-team'));
				
				var projectedScore = projectScore(kills, headshots, deaths, roundsPlayed, assists);

				var playerID = players[i][1].split(":")[1];
				$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').addClass('player-add-remove-wrapper'));
				$('#draft-wrapper').find('.player-add-remove-wrapper').last().append($('<div/>').text('Add').attr('id', 'playerChoose' + playerID).addClass('player-add'));
			
				(function(playerID) {
					$('#playerChoose' + playerID).click(function() {
						$.post('/draft/' + contestInfo._id,
							'playerID=' + playerID + '&contestID=' + contestInfo._id,
							function(data) {
								if (data.success) {
									console.log(playerID);
									$addRemoveButton = $('#playerChoose' + playerID);
									if ($addRemoveButton.html() === 'Add') {
										$addRemoveButton.html('Remove');
										$addRemoveButton.addClass('player-remove');
									} else {
										$addRemoveButton.html('Add');
										$addRemoveButton.removeClass('player-remove');
									}
								} else {
									console.log("ERROR");
								}
							});

						//Change button text depending on what it currently is

					});
				})(playerID);
			}
		}});
	}
	
	//================
	// SCORE PAGE
	//================

	if ($('.section-wrapper').attr('id') === 'score-wrapper') {

		var playerScores = contestInfo.players;
		console.log(userInfo);
		console.log(contestInfo);

		//List all usernames corresponding to the user ids that are in the contest entries
		$('#score-wrapper').append($('<div/>').addClass('score-listing').addClass('score-listing-header'));
		$('#score-wrapper').find('div.score-listing').last().append($('<div/>').text("Name").addClass('contest-player-name-header'));
		$('#score-wrapper').find('div.score-listing').last().append($('<div/>').text("Score").addClass('contest-score-header'));
		
		for (var i = 0; i < playerScores.length; i++) {
			$('#score-wrapper').find('div.score-listing').last().append($('<div/>').addClass('score-listing'));
			$('#score-wrapper').find('div.score-listing').last().append($('<div/>').text(playerScores[i].id).addClass('contest-player-name'));
			$('#score-wrapper').find('div.score-listing').last().append($('<div/>').text(playerScores[i].points).addClass('contest-score'));
		}
	}
});

//==================
// HELPER FUNCTIONS
//==================

//Code from: http://stackoverflow.com/questions/7431268/how-to-read-data-from-csv-file-using-javascript
function processData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    var lines = [];

    for (var i = 1; i < allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {

            var tarr = [];
            for (var j = 0; j < headers.length; j++) {
                tarr.push(headers[j]+":"+data[j]);
            }
            lines.push(tarr);
        }
    }
    return lines;
}

function projectScore(kills, headshots, deaths, roundsPlayed, assists) {
    var kTotal = parseInt(kills);
	var headshotsFloat = parseFloat(headshots.substring(0, headshots.length-1))/100;
	var h = Math.round(headshotsFloat * kTotal);
	var k = kTotal - h;
	
	var d = parseInt(deaths);
	var rp = parseInt(roundsPlayed);
	var a = parseInt(assists);
	
	var kWeight = 1.0;
	var hWeight = 1.5;
	var dWeight = -0.5;
	var rpWeight = 0.5;
	var aWeight = 0.2;
	
	var finalWeight = 60;
	
	
	var weightsSum = k * kWeight + h * hWeight + d * dWeight + a * aWeight;
	var projectedScore = Math.round(weightsSum/(rp*rpWeight)*finalWeight);
	/*if (projectedScore < 70) {
        projectedScore = 70;
    }
	else if (projectedScore > 95) {
        projectedScore = 90;
    }*/
	//console.log(projectedScore);
	return projectedScore;
}