'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		//$urlRouterProvider.otherwise('/');
		//$urlRouterProvider.when()

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
				controller: 'HomeController',
            templateUrl: 'modules/core/views/home.html'
			//templateUrl: 'modules/users/views/authentication/signin.html'
		});
	}
]);