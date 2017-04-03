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

		for (var i = 0; i < contests.length; i++) {
			$('#index-wrapper').append($('<a/>').attr('href', '/contest/' + contests[i]._id).addClass('contest-listing'));
			$('#index-wrapper').find('a.contest-listing').last().append($('<div/>').text(contests[i].name).addClass('contest-name'));
			$('#index-wrapper').find('a.contest-listing').last().append($('<div/>').text(contests[i].startDate).addClass('contest-date'));
			$('#index-wrapper').find('a.contest-listing').last().append($('<div/>').text(contests[i].entries.numCurrent + '/' + contests[i].entries.numMax).addClass('contest-entry-count'));
		}
	}

	//=================
	// CONTEST VIEW
	//=================

	if ($('.section-wrapper').attr('id') === 'contest-wrapper') {
		//Code here
		var contest_id = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);
		console.log(contest_id);
		console.log(contests);
		console.log(contests.players.length);
		$('#contest-wrapper').append($('<div/>').addClass('contest-details'));
		$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text("Name").addClass('contest-name'));
		$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text("Start Date").addClass('contest-startdate'));
		$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text("End Date").addClass('contest-enddate'));
		$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text("Max Salary").addClass('contest-salary'));
		$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text("Entries").addClass('contest-entries'));

		$('#contest-wrapper').append($('<div/>').addClass('contest-details'));
		$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text(contests.name).addClass('contest-name'));
		$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text(contests.startDate).addClass('contest-startdate'));
		$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text(contests.endDate).addClass('contest-enddate'));
		$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text(contests.maxSalary).addClass('contest-salary'));
		$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text(contests.entries.numCurrent + '/' + contests.entries.numMax).addClass('contest-entry-count'));

		$('#contest-wrapper').append($('<div/>').addClass('contest-results'));
		$('#contest-wrapper').find('div.contest-results').last().append($('<div/>').text("Contest Players").addClass('contest-players'));
		$('#contest-wrapper').find('div.contest-results').last().append($('<div/>').text("Score").addClass('contest-score'));
		//List all usernames corresponding to the user ids that are in the contest entries
		for (var i = 0; i < contests.players.length; i++) {
			$('#contest-wrapper').append($('<div/>').addClass('contest-results'));
			$('#contest-wrapper').find('div.contest-results').last().append($('<div/>').text(contests.players[i]).addClass('contest-players'));
			$('#contest-wrapper').find('div.contest-results').last().append($('<div/>').text("points").addClass('contest-score'));
		}
		
		//Create Draft button
		$('#contest-wrapper').append($('<a/>').attr('href', '/draft/' + contests._id).addClass('contest-listing2'));
		$('#contest-wrapper').find('a.contest-listing2').last().append($('<div/>').text("Draft").addClass('draft-button'));
	}

	//================
	// CONFIRM PAGE
	//================
	if($('.section-wrapper').attr('id') === 'confirm-wrapper'){

	}

	//=================
	// TEAM SELECT
	//=================
	if ($('.section-wrapper').attr('id') === 'draft-wrapper') {
		//Relevant contestInfo should be saved in a value called contestInfo
		var csv = new XMLHttpRequest();
		csv.open('GET', "../js/lib/AllStats.csv", true);
		var allPlayers = [];
		csv.onreadystatechange = function() {
			if (csv.status === 404) {
                console.log('CSV not found');
            }

            //Grab all player data from CSV
			if (csv.readyState == 4 && csv.status == 200) {
				allPlayers = processData(csv.responseText);
			}

			var user_ids = contestInfo.players;

			//Get player data for each player that is in the contest
			var players = [];
			for (var i = 0; i < allPlayers.length; i++) {
				for (var j = 0; j < user_ids.length; j++) {
					var playerID = parseInt(allPlayers[i][1].split(':')[1]);
					if (playerID === user_ids[j]) {
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
		};
		csv.send();
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