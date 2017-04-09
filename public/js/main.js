//For now, put all JavaScript in here

//=======================================
// CLEARLY LABEL JAVASCRIPT PER PUG FILE
//=======================================

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

		$('#contest-wrapper').append($('<div/>').addClass('contest-details'));
		$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text("Name").addClass('contest-name'));
		$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text("Start Date").addClass('contest-startdate'));
		$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text("End Date").addClass('contest-enddate'));
		$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text("Max Salary").addClass('contest-salary'));
		$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text("Entries").addClass('contest-entries'));

		$('#contest-wrapper').append($('<div/>').addClass('contest-details'));
		$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text(contestInfo.name).addClass('contest-name'));
		$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text(contestInfo.startDate).addClass('contest-startdate'));
		$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text(contestInfo.endDate).addClass('contest-enddate'));
		$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text(contestInfo.maxSalary).addClass('contest-salary'));
		$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text(contestInfo.entries.numCurrent + '/' + contestInfo.entries.numMax).addClass('contest-entry-count'));

		//Create Draft button
		$('#contest-wrapper').append($('<a/>').attr('href', '/draft/' + contestInfo._id).addClass('contest-listing2'));
		$('#contest-wrapper').find('a.contest-listing2').last().append($('<div/>').text("Draft").addClass('draft-button'));
		
		$('#contest-wrapper').append($('<div/>').addClass('contest-results'));
		$('#contest-wrapper').find('div.contest-results').last().append($('<div/>').text("Contest Players").addClass('contest-players'));
		$('#contest-wrapper').find('div.contest-results').last().append($('<div/>').text("Score").addClass('contest-score'));
		
		//List all usernames corresponding to the user ids that are in the contest entries
		for (var i = 0; i < contestUsers.length; i++) {
			$('#contest-wrapper').append($('<div/>').addClass('contest-results'));
			$('#contest-wrapper').find('div.contest-results').last().append($('<div/>').text(contestUsers[i].username).addClass('contest-players'));
			$('#contest-wrapper').find('div.contest-results').last().append($('<div/>').text(contestUsers[i].points).addClass('contest-score'));
		}
	}

	//================
	// CONFIRM PAGE
	//================
	if($('.section-wrapper').attr('id') === 'confirm-wrapper'){

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
			console.log(playersInfo);
			
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
					$('#draft-wrapper').append($('<div/>').addClass('draft-listing'));
					$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text("Name").addClass('player-name'));
					$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text("Kills").addClass('player-kills'));
					$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text("Headshot %").addClass('player-headshots'));
					$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text("Deaths").addClass('player-deaths'));
					$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text("# Rounds Played").addClass('player-roundsP'));
					$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text("Assists").addClass('player-assists'));
					$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text("Team Name").addClass('player-team'));
				}

				//Display data in divs for each player
				$('#draft-wrapper').append($('<div/>').addClass('draft-listing'));

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

				var playerID = players[i][1].split(":")[1];
				$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text('Add').attr('id', 'playerChoose' + playerID).addClass('player-add'));
			}

			//Get all "playerChoose" buttons
			var playerAdder = document.querySelectorAll('.player-add');

			//Find which button was clicked
			for (var i = 0; i < playerAdder.length; i++) {
				var playerID = players[i][1].split(':')[1];

				//On "playerChoose" click, send post request to back-end to set player team
				$('#playerChoose' + playerID).click(function() {
					$.post('/draft/' + contestInfo._id,
						'playerID=' + playerID + '&contestID=' + contestInfo._id,
						function(data) {
							if (data.success) {
								//Success
							} else {
								//Error
							}
						});

					//Change button text depending on what it currently is
					if (this.innerHTML === 'Add') {
						this.innerHTML = 'Remove';
					} else {
						this.innerHTML = 'Add';
					}
				});
			}
		}});
	}
	
	//================
	// SCORE PAGE
	//================
	if ($('.section-wrapper').attr('id') === 'score-wrapper') {
		
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