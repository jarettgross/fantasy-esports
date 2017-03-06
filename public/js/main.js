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
		console.log("hello");
		$(document).ready(function() {
			$('.contest-listing').click(function () {
				var contest_id = this.href.substr(this.href.lastIndexOf('/') + 1).trim();
				var contest_index = 0;
				console.log("Ran so far");
				for (var i = 0; i < contests.length; i++) {
					if (contests[i]._id === contest_id) {
						contest_index = i;
					}
				}
				console.log("test");
				$('#contest-wrapper').append($('<div/>').addClass('contest-details'));
				$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text("Name").addClass('contest-name'));
				$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text("Start Date").addClass('contest-startdate'));
				$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text("End Date").addClass('contest-enddate'));
				$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text("Max Salary").addClass('contest-salary'));
				$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text("Entries").addClass('contest-entries'));

				$('#contest-wrapper').append($('<div/>').addClass('contest-details'));
				$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text(contests[contest_index].name).addClass('contest-name'));
				$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text(contests[contest_index].startDate).addClass('contest-startdate'));
				$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text(contests[contest_index].endDate).addClass('contest-enddate'));
				$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text(contests[contest_index].maxSalary).addClass('contest-salary'));
				$('#contest-wrapper').find('div.contest-details').last().append($('<div/>').text(contests[contest_index].entries.numCurrent + '/' + contests[contest_index].entries.numMax).addClass('contest-entry-count'));

				$('#contest-wrapper').append($('<div/>').addClass('player-details'));
				//List all usernames corresponding to the user ids that are in the contest entries
				//for (var i = 0; i < contests[contest_index].entries.length; i++) {
				//}

				//Create Draft button
				//$('#contest-wrapper').append($('<div/>').addClass('contest-details'));
				//$('#contest-wrapper').append($('<a/>').attr('href', '/contest/' + contests[contest_index]._id + '/draft').addClass('contest-listing'));


			});
		});
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
		csv.onreadystatechange = function(){
			if (csv.status == 404) {
                console.log("ERROR");
            }
			if(csv.readyState == 4 && csv.status == 200) {
				//console.log(csv.statusText);
				//console.log(csv.responseText);
				//var allPlayers = $.csv.toObjects(csv.responseText);
				allPlayers = processData(csv.responseText);
				console.log(allPlayers);
			}
			var players = [];

			var idHolder = "PlayerID:";

			var user_ids = contestInfo.entries.user_ids;

			console.log(contestInfo);

			for(var i = 0; i<allPlayers.length; i++){
				for(var j = 0; j < user_ids.length; j++){
					if(idHolder.concat(user_ids[j]) === allPlayers[i][1]){
						players.push(allPlayers[i]);
						sessionStorage.setItem(user_ids[j], user_ids[j]);
						console.log(allPlayers[i]);
					}
				}
			}

			for (var i = 0; i < players.length; i++) {
				if(i == 0){
					$('#draft-wrapper').append($('<div/>').addClass('draft-listing'));
					$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text("Name").addClass('player-name'));
					$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text("Kills").addClass('player-kills'));
					$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text("Headshot %").addClass('player-headshots'));
					$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text("Deaths").addClass('player-deaths'));
					$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text("# Rounds Played").addClass('player-roundsP'));
					$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text("Assists").addClass('player-assists'));
					$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text("Team Name").addClass('player-team'));

				}
				console.log(players[i][0]);
				$('#draft-wrapper').append($('<div/>').addClass('draft-listing'));
				var names = players[i][0].split(":");
				$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text(names[1]).addClass('player-name'));

				var kills = players[i][2].split(":");
				$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text(kills[1]).addClass('player-kills'));

				var headshots = players[i][3].split(":");
				$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text(headshots[1]).addClass('player-headshots'));

				var deaths = players[i][4].split(":");
				$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text(deaths[1]).addClass('player-deaths'));

				var roundsP = players[i][5].split(":");
				$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text(roundsP[1]).addClass('player-roundsP'));

				var assists = players[i][6].split(":");
				$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text(assists[1]).addClass('player-assists'));

				var team = players[i][10].split(":");
				$('#draft-wrapper').find('div.draft-listing').last().append($('<div/>').text(team[1]).addClass('player-team'));

				$('#draft-wrapper').append($('<a/>').attr({'href' : '#' , 'onclick' : 'hider()'}).addClass('draft-listing'));
				$('#draft-wrapper').find('a.draft-listing').last().append($('<div/>').text('Add\n').addClass('player-add'));

				//$('#index-wrapper').find('a.contest-listing').last().append($('<div/>').text(contests[i].name).addClass('contest-name'));
				//$('#index-wrapper').append($('<a/>').attr('href', '/contest/' + contests[i]._id).addClass('contest-listing'));
				//$('#draft-wrapper').find('a.draft-listing').last().append($('<div/>').text(players[i][10]).addClass('player-team'));
			}
		};
		csv.send();
		
		

		/*reader.onload = function(event) {
			var csv = event.target.result;
		
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
		}*/
	}

});

//==================
// HELPER FUNCTIONS
//==================
function hider(){
	console.log("Works");
}

function readFile() {
	if(reader.readyState==4) {
		console.log(reader.responseText);
    }
}

//Code from: http://stackoverflow.com/questions/7431268/how-to-read-data-from-csv-file-using-javascript
function processData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    var lines = [];

    for (var i=1; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {

            var tarr = [];
            for (var j=0; j<headers.length; j++) {
                tarr.push(headers[j]+":"+data[j]);
            }
            lines.push(tarr);
        }
    }
    return lines;
     //console.log(lines);
}