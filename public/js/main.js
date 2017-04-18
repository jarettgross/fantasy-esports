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

		//Create Draft button
		$('#contest-wrapper').append($('<div/>').addClass('draft-button-wrapper'));
		$('#contest-wrapper').find('.draft-button-wrapper').last().append($('<a/>').attr('href', '/draft/' + contestInfo._id).text('DRAFT').addClass('draft-button'));
		
		var isNulls = true;
		for (var i = 0; i < contestUsers.length; i++) {
			if (contestUsers[i] !== null) {
				isNulls = true;
				break;
			}
		}

		if (contestUsers.length === 0 || isNulls) {
			$('#contest-wrapper').append($('<div/>').addClass('nothing-here').text('There is no one signed up for this contest!'));
		} else {
			$('#contest-wrapper').append($('<div/>').addClass('scoreboard'));

			$('#contest-wrapper').find('div.scoreboard').last().append($('<div/>').addClass('user-listing').addClass('user-listing-header'));
			$('#contest-wrapper').find('div.scoreboard div.user-listing').last().append($('<div/>').text('Name').addClass('contest-player-name-header'));
			$('#contest-wrapper').find('div.scoreboard div.user-listing').last().append($('<div/>').text('Score').addClass('contest-score-header'));
			
			//Sort the users by points
			contestUsers.sort(function(a,b) {
				if (a.points < b.points) {
	                return -1;
	            }
				if (a.points > b.points) {
	                return 1;
	            }
				return 0;
			});

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
	}

	//=================
	// DRAFT PAGE
	//=================

	if ($('.section-wrapper').attr('id') === 'draft-wrapper') {
		$('#my-team-button').click(function() {
			$.post('/draft/' + contestInfo._id, 
				'isMyTeam=' + true + '&contestID=' + contestInfo._id,
				function(data) {
					if (data.success) {
						window.location = data.redirect;
					} else {
						//Error
					}
				});
		});

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
				$('#draft-wrapper').find('.player-add-remove-wrapper').last().append($('<div/>').text('ADD').attr('id', 'playerChoose' + playerID).addClass('player-add'));
			
				(function(playerID) {
					$('#playerChoose' + playerID).click(function() {
						$.post('/draft/' + contestInfo._id,
							'isMyTeam=' + false + '&playerID=' + playerID + '&contestID=' + contestInfo._id,
							function(data) {
								if (data.success) {
									$addRemoveButton = $('#playerChoose' + playerID);
									if ($addRemoveButton.html() === 'ADD') {
										$addRemoveButton.html('REMOVE');
										$addRemoveButton.addClass('player-remove');
									} else {
										$addRemoveButton.html('ADD');
										$addRemoveButton.removeClass('player-remove');
									}
								} else {
									console.log('ERROR');
								}
							});
					});
				})(playerID);
			}
		}});
	}

	//=================
	// MY TEAM PAGE
	//=================

	if ($('.section-wrapper').attr('id') === 'my-team-wrapper') {
		var setDefault = false;
		var setFirst = false;
		for (var i = 0; i < contestsInfo.length; i++) {
			if (contestsInfo[i] !== null) {
			    var option = document.createElement('option');
			    option.value = contestsInfo[i].id;
			    option.text = contestsInfo[i].name.replace(/&amp;/g, "&");
			    $('#select-contest').append(option);

			    //Initial selected option is link we came from
			    if (initialContest === undefined && !setDefault) {
			    	$('#select-contest').val(contestsInfo[i].id);
			    	setMyTeamButtons(contestsInfo[i]);
			    	setMyTeamPlayers(contestsInfo[i]);
					setDefault = true;
			    } else if (contestsInfo[i].id === initialContest) {
			    	$('#select-contest').val(contestsInfo[i].id);
			    	setMyTeamButtons(contestsInfo[i]);
			    	setMyTeamPlayers(contestsInfo[i]);
			    	setDefault = true;
			    } else if (!setDefault && !setFirst) {
			    	$('#select-contest').val(contestsInfo[i].id);
			    	setMyTeamButtons(contestsInfo[i]);
			    	setMyTeamPlayers(contestsInfo[i]);
			    	setFirst = true;
			    }
			}
		}

		//Display different team when contest dropdown selection changes
		$('#select-contest').change(function() {
			for (var i = 0; i < contestsInfo.length; i++) {
				if (contestsInfo[i] !== null) {
					if (contestsInfo[i].id === $('#select-contest').val()) {
						setMyTeamButtons(contestsInfo[i]);

						//Empty team list and repopulate with team members for selected contest
						setMyTeamPlayers(contestsInfo[i]);
					}
				}
			}
		});

		//Send contest id for team being entered
		$('#enter-team-button').click(function() {
			$.post(
				'/myteam',
				'contestID=' + $('#select-contest').val(),
				function(data) {
					if (data.success) {
						$('#submit-message').removeClass('hide');
					} else {
						$('#error-message').removeClass('hide');
					}
				});
		});
	}
	
	//================
	// SCORE PAGE
	//================

	if ($('.section-wrapper').attr('id') === 'score-wrapper') {

		//var playerScores = contestInfo.players;
		console.log(userInfo);
		console.log(contestInfo);

		var allPlayers = [];
		$.ajax({ url: "../js/lib/AllStats.csv", success: function(csv) {
			allPlayers = processData(csv);
			var playersInfo = contestInfo.players;

			//Get player data for each player that is in the contest
			var players = [];
			var scores = [];

			for (var i = 0; i < allPlayers.length; i++) {
				for (var j = 0; j < playersInfo.length; j++) {
					var playerID = parseInt(allPlayers[i][1].split(':')[1]);
					if (playerID === playersInfo[j].id) {
						players.push(allPlayers[i]);
						scores.push(playersInfo[j].points);
					}
				}
			}

			console.log(players);
			console.log(scores);
			//List all usernames corresponding to the user ids that are in the contest entries
			$('#score-wrapper').append($('<div/>').addClass('score-listing'));
			$('#score-wrapper').find('div.score-listing').last().append($('<div/>').addClass('score-listing-header'));
			$('#score-wrapper').find('div.score-listing-header').last().append($('<div/>').text("Name").addClass('player-name-header'));
			$('#score-wrapper').find('div.score-listing-header').last().append($('<div/>').text("Score").addClass('player-score-header'));
			
			for (var i = 0; i < players.length; i++) {
				var name = players[i][0].split(":")[1];
				$('#score-wrapper').find('div.score-listing').last().append($('<div/>').addClass('score-player-listing'));
				$('#score-wrapper').find('div.score-player-listing').last().append($('<div/>').text(name).addClass('contest-player-name'));
				$('#score-wrapper').find('div.score-player-listing').last().append($('<div/>').text(scores[i]).addClass('contest-player-score'));
			}
		}});
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

//If anyone else wants to continue with my work on projecting a score for the players, feel free to go ahead. I didn't think I could figure out 
//	a good way to project scores given that with our current information it's very difficult to tell how many rounds a particular player will play
//	in a tournament, which is the biggest factor in how many points they will get.
function projectScore(kills, headshots, deaths, roundsPlayed, assists) {
    var kTotal = parseInt(kills);
	var headshotsFloat = parseFloat(headshots.substring(0, headshots.length-1))/100;
	var h = Math.round(headshotsFloat * kTotal);
	var k = kTotal - h;
	
	var d = parseInt(deaths);
	var rp = parseInt(roundsPlayed);
	var a = parseInt(assists);
	
	var kWeight = 12.0;
	var hWeight = 18.0;
	var dWeight = -3.0;
	var rpWeight = 1.0;
	var aWeight = 1.5;
	
	var finalWeight = 1;
	
	
	var weightsSum = k * kWeight + h * hWeight + d * dWeight + a * aWeight;
	var projectedScore = Math.round(10*weightsSum/(rp*rpWeight)*finalWeight);
	projectedScore = projectedScore/10;
	
	//console.log(projectedScore);
	return projectedScore;
}

function setMyTeamButtons(info) {
	if (info.status === 'upcoming') {
		$('#view-scoreboard-button').addClass('hide');
		$('#enter-team-button').removeClass('hide');
		$('#continue-drafting-button').attr('href', '/draft/' + info.id);
	} else if (info.status === 'ongoing' || info.status === 'finished') {
		$('#enter-team-button').addClass('hide');
		$('#view-scoreboard-button').removeClass('hide');
		$('#view-scoreboard-button').attr('href', '/contest/' + info.id);
	}
}

function setMyTeamPlayers(info, isHeader) {
	if (info.teamIDs.length === 0) {
		$('#my-team-no-team-msg').removeClass('hide');
		$('#enter-team-button').addClass('hide');
		$('#continue-drafting-button').css('margin', 'auto');
		$('#my-team-list').addClass('hide');
	} else {
		$('#my-team-list').empty();
		$('#my-team-list').append($('<div/>').addClass('player-listing').addClass('player-listing-header'));
		$('#my-team-list').find('div.player-listing').last().append($('<div/>').text("Name").addClass('player-name'));
		$('#my-team-list').find('div.player-listing').last().append($('<div/>').text("Kills").addClass('player-kills'));
		$('#my-team-list').find('div.player-listing').last().append($('<div/>').text("Headshot %").addClass('player-headshots'));
		$('#my-team-list').find('div.player-listing').last().append($('<div/>').text("Deaths").addClass('player-deaths'));
		$('#my-team-list').find('div.player-listing').last().append($('<div/>').text("# Rounds").addClass('player-roundsP'));
		$('#my-team-list').find('div.player-listing').last().append($('<div/>').text("Assists").addClass('player-assists'));
		$('#my-team-list').find('div.player-listing').last().append($('<div/>').text("Team Name").addClass('player-team'));

		var teamPlayers = info.teamIDs;
		var allPlayers = [];
		$.ajax({ url: '../js/lib/AllStats.csv', success: function(csv) {
			allPlayers = processData(csv);

			var players = [];
			for (var i = 0; i < allPlayers.length; i++) {
				for (var j = 0; j < teamPlayers.length; j++) {
					var playerID = parseInt(allPlayers[i][1].split(':')[1]);
					if (playerID === teamPlayers[j]) {
						//Found player in csv file
						if (j === teamPlayers.length - 1) {
							$('#my-team-list').append($('<div/>').addClass('player-listing').addClass('player-listing-footer'));
						} else {
							$('#my-team-list').append($('<div/>').addClass('player-listing'));
						}

						var names = allPlayers[i][0].split(":")[1];
						$('#my-team-list').find('div.player-listing').last().append($('<div/>').text(names).addClass('player-name'));

						var kills = allPlayers[i][2].split(":")[1];
						$('#my-team-list').find('div.player-listing').last().append($('<div/>').text(kills).addClass('player-kills'));

						var headshots = allPlayers[i][3].split(":")[1];
						$('#my-team-list').find('div.player-listing').last().append($('<div/>').text(headshots).addClass('player-headshots'));

						var deaths = allPlayers[i][4].split(":")[1];
						$('#my-team-list').find('div.player-listing').last().append($('<div/>').text(deaths).addClass('player-deaths'));

						var roundsPlayed = allPlayers[i][5].split(":")[1];
						$('#my-team-list').find('div.player-listing').last().append($('<div/>').text(roundsPlayed).addClass('player-roundsP'));

						var assists = allPlayers[i][6].split(":")[1];
						$('#my-team-list').find('div.player-listing').last().append($('<div/>').text(assists).addClass('player-assists'));

						var team = allPlayers[i][10].split(":")[1];
						$('#my-team-list').find('div.player-listing').last().append($('<div/>').text(team).addClass('player-team'));
						
						var projectedScore = projectScore(kills, headshots, deaths, roundsPlayed, assists);
					}
				}
			}
		}});
	}
}