angular.module('mustard', [
    'ngRoute',
    'ngTouch',
    'mustard.cordova',
    'mustard.app.login',
    'mustard.app.registration',
    'mustard.app.main',
    'mustard.app.mission',
    'mustard.app.userProfile',
    'mustard.app.options',
    'mustard.app.missionsIndex',
    'mustard.game.simulator',
    'mustard.game.review',
    'ui.bootstrap',
    'rzModule'
])

.config(function ($routeProvider) {

    $routeProvider
        .when('/login', {
            controller: 'LoginCtrl',
            templateUrl: 'js/app/controllers/login/login.tpl.html'
        })

        .when('/register', {
            controller: 'RegistrationCtrl',
            templateUrl: 'js/app/controllers/registration/registration.tpl.html'
        })

        .when('/main', {
            controller: 'MainCtrl',
            templateUrl: 'js/app/controllers/main/main.tpl.html',
            resolve: {
                levels: ['missionsIndex', function (missionsIndex) {
                    return missionsIndex.getLevels();
                }]
            }
        })

        .when('/mission/:id', {
            controller: 'MissionCtrl',
            templateUrl: 'js/app/controllers/mission/mission.tpl.html',
            resolve: {
                mission: ['$route', 'missionsIndex', function ($route, missionsIndex) {
                    return missionsIndex.getMission($route.current.params.id);
                }]
            }
        })

        .when('/profile', {
            controller: 'ProfileCtrl',
            templateUrl: 'js/app/controllers/userProfile/userProfile.tpl.html'
        })

        .when('/options', {
            controller: 'OptionsCtrl',
            templateUrl: 'js/app/controllers/options/options.tpl.html'
        })

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

        .when('/review/mission', {
            controller: 'ReviewCtrl',
            templateUrl: 'js/game/controllers/review/review.tpl.html'
        })

        .otherwise({redirectTo: '/main'});

}).run(function ($rootScope, $location, user) {

    $rootScope.$on("$locationChangeStart", function () {
        !user.isAuthorized() && !user.restoreFromLocal() && $location.path('/login');
    });
});
