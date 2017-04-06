//https://github.com/CodyHouse/login-signup-modal

jQuery(document).ready(function($){
	var formModal = $('.cd-user-modal'),
		formLogin = formModal.find('#cd-login'),
		formSignup = formModal.find('#cd-signup'),
		formForgotPassword = formModal.find('#cd-reset-password'),
		formModalTab = $('.cd-switcher'),
		tabLogin = formModalTab.children('li').eq(0).children('a'),
		tabSignup = formModalTab.children('li').eq(1).children('a'),
		mainNav = $('.nav-bar');

	//open modal
	mainNav.on('click', function(event){
		$(event.target).is(mainNav) && mainNav.children('ul').toggleClass('is-visible');
	});

	if ($('.section-wrapper').attr('id') === 'index-wrapper') {
		var forceSignUp = $('#index-wrapper');
		forceSignUp.on('click', function(event){
			$(event.target).is(forceSignUp) && forceSignUp.children('div').toggleClass('is-visible');
		});
		forceSignUp.on('click', '#signup-focus', signup_selected);
	}

	//open sign-up form
	mainNav.on('click', '#signup', signup_selected);
	//open login-form form
	mainNav.on('click', '#signin', login_selected);

	//close modal
	formModal.on('click', function(event){
		if( $(event.target).is(formModal) || $(event.target).is('.cd-close-form') ) {
			formModal.removeClass('is-visible');
		}	
	});
	//close modal when clicking the esc keyboard button
	$(document).keyup(function(event){
    	if(event.which=='27'){
    		formModal.removeClass('is-visible');
	    }
    });

	//switch from a tab to another
	formModalTab.on('click', function(event) {
		event.preventDefault();
		( $(event.target).is( tabLogin ) ) ? login_selected() : signup_selected();
	});

	function login_selected(){
		mainNav.children('ul').removeClass('is-visible');
		formModal.addClass('is-visible');
		formLogin.addClass('is-selected');
		formSignup.removeClass('is-selected');
		formForgotPassword.removeClass('is-selected');
		tabLogin.addClass('selected');
		tabSignup.removeClass('selected');
	}

	function signup_selected(){
		mainNav.children('ul').removeClass('is-visible');
		formModal.addClass('is-visible');
		formLogin.removeClass('is-selected');
		formSignup.addClass('is-selected');
		formForgotPassword.removeClass('is-selected');
		tabLogin.removeClass('selected');
		tabSignup.addClass('selected');
	}

	//REMOVE THIS - it's just to show error messages 
	// formLogin.find('input[type="submit"]').on('click', function(event){
	// 	event.preventDefault();
	// 	formLogin.find('input[type="email"]').toggleClass('has-error').next('span').toggleClass('is-visible');
	// });
	// formSignup.find('input[type="submit"]').on('click', function(event){
	// 	event.preventDefault();
	// 	formSignup.find('input[type="email"]').toggleClass('has-error').next('span').toggleClass('is-visible');
	// });
});