//For now, put all JavaScript in here

//=======================================
// CLEARLY LABEL JAVASCRIPT PER PUG FILE
//=======================================

document.addEventListener('DOMContentLoaded', function() {

	//=================
	// INDEX
	//=================

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

	$('#logout').click(function(event) {
		event.preventDefault();
		$.get('/logout',
			'',
			function(data) {
				if (data.success) {
					window.location = data.redirect;
				} else {
					//Error
				}
			});
	});

	//=================
	// TEAM SELECT
	//=================

	//Code here

	//=================
	// TOURNAMENT VIEW
	//=================

	//Code here
});

//==================
// HELPER FUNCTIONS
//==================
