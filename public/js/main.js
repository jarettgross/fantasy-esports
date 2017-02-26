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

	//Code here

});

//==================
// HELPER FUNCTIONS
//==================
