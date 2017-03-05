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

			var user_ids = contestInfo.entries.user_ids;

			for(var i = 0; i<allPlayers.length; i++){
				for(var j = 0; j < user_ids.length; j++){
					if("PlayerID:1" === allPlayers[i][1]){
						players.push(allPlayers[i]);
						console.log(allPlayers[i]);
					}
				}
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

function readFile() {
	if(reader.readyState==4) {
		console.log(reader.responseText);
    }
}

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