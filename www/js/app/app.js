angular.module('mustard', ['ngRoute', 'mustard.services', 'mustard.game.simulator'])
    .config(function ($routeProvider) {
        $routeProvider
        .when('/game/mission', {
            controller: 'SimulatorCtrl',
            templateUrl: 'js/game/controllers/simulator/mission.tpl.html'
        })
        .when('/game/training', {
            controller: 'SimulatorCtrl',
            templateUrl: 'js/game/controllers/simulator/training.tpl.html'
        })
        .otherwise({redirectTo: '/'});
    });
