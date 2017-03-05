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
	}

	//=================
	// TEAM SELECT
	//=================
	if ($('.section-wrapper').attr('id') === 'draft-wrapper') {
		//Relevant contestInfo should be saved in a value called contestInfo
		var allText = "";
		var csv = new XMLHttpRequest();	//NOTE: This doesn't work yet. Need to find a way to read in the CSV file content.
		csv.open("GET", "AllStats.csv", true);
		
		csv.onreadystatechange = function ()
		{
			if(csv.readyState === 4)
			{
				if(csv.status === 200 || csv.status == 0)
				{
					allText = csv.responseText;
				}
			}
		}
		csv.send(null);
		
		var user_ids = contestInfo.entries.user_ids;
		
		var allPlayers = $.csv.toObjects(csv);
		
		var players = [];
		
		
		for (var i = 0; i<allPlayers.length; i++) {
			for (var j = 0; j<user_ids,length; j++) {
				if (user_ids[j] === allPlayers[i]["PlayerID"]) {
                    players.push(allPlayers[i]);
					console.log(allPlayers[i]);
                }
			}
		}
		//console.log(players);
	}

});

//==================
// HELPER FUNCTIONS
//==================
