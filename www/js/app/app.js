angular.module('mustard', [
    'ngRoute',
    'mustard.services',
    'mustard.app.login',
    'mustard.game.simulator',
    'leaflet-directive'
])
.config(function ($routeProvider) {
    $routeProvider
    .when('/game/mission/:scenario', {
        controller: 'SimulatorCtrl',
        templateUrl: 'js/game/controllers/simulator/mission.tpl.html',
        resolve: {
            scenario: ['$http', '$q', '$route', function ($http, $q, $route) {
                var deferred = $q.defer();
                var scenario = $route.current.params.scenario + '.json';

                $http({
                    method: "GET",
                    url: 'js/game/scenarios/' + scenario
                }).success(function (response) {
                    deferred.resolve(response);
                });
                return deferred.promise;
            }]
        }
    })
    .when('/game/training', {
        controller: 'SimulatorCtrl',
        templateUrl: 'js/game/controllers/simulator/training.tpl.html',
        resolve: {
            scenario: ['$http', '$q', function ($http, $q) {
                var deferred = $q.defer();
                $http({
                    method: "GET",
                    url: "/www/js/game/scenarios/PracticeScenario.json"
                }).success(function (response) {
                    deferred.resolve(response);
                });
                return deferred.promise;
            }]
        }
    })
    .otherwise({redirectTo: '/'});
});
