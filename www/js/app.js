angular.module('mustard', ['ngRoute', 'mustard.services', 'mustard.game'])
    .config(function ($routeProvider) {
        $routeProvider
        .when('/mission', {
            controller: 'GameCtrl',
            templateUrl: 'js/game/mission.tpl.html'
        })
        .when('/training', {
            controller: 'GameCtrl',
            templateUrl: 'js/game/training.tpl.html'
        })
        .otherwise({redirectTo: '/'});
    });
