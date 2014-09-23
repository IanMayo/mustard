angular.module('subtrack90', [
    'ngRoute',
    'ngTouch',
    'subtrack90.cordova',
    'subtrack90.app.login',
    'subtrack90.app.registration',
    'subtrack90.app.main',
    'subtrack90.app.mission',
    'subtrack90.app.userProfile',
    'subtrack90.app.options',
    'subtrack90.app.credits',
    'subtrack90.app.debug',
    'subtrack90.app.missionsIndex',
    'subtrack90.app.splashScreen',
    'subtrack90.app.final',
    'subtrack90.game.simulator',
    'subtrack90.game.review',
    'subtrack90.game.notificationSounds',
    'ui.bootstrap',
    'rzModule'
])

/**
 * Constants
 *
 * IS_MOBILE determines if browser supports touch events also it indicates a mobile device
 * SPLASH_ON_LOGIN & SPLASH_ON_MAIN these are created for Ian's splash screen testing
 */
.constant('APP_DEBUG', true)
.constant('IS_MOBILE', Modernizr.touch)
.constant('SPLASH_ON_LOGIN', true)
.constant('SPLASH_ON_MAIN', !!window.cordova)

.config(function ($routeProvider, APP_DEBUG, IS_MOBILE, SPLASH_ON_LOGIN ,SPLASH_ON_MAIN) {

    if (APP_DEBUG) {
        $routeProvider.when('/debug', {
            controller: 'DebugCtrl',
            templateUrl: 'js/app/controllers/debug/debug.tpl.html'
        })
    }

    $routeProvider
        .when('/login', {
            controller: 'LoginCtrl',
            templateUrl: 'js/app/controllers/login/login.tpl.html',
            resolve: {
                splash: ['splashScreen', function (splashScreen) {
                    return splashScreen.resolver(SPLASH_ON_LOGIN);
                }]
            }
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
                }],
                splash: ['splashScreen', function (splashScreen) {
                    return splashScreen.resolver(SPLASH_ON_MAIN);
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

        .when('/credits', {
            controller: 'CreditsCtrl',
            templateUrl: 'js/app/controllers/credits/credits.tpl.html'
        })

        .when('/final', {
            controller: 'FinalCtrl',
            templateUrl: 'js/app/controllers/final/final.tpl.html'
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
                }],
                audioSounds: ['notificationSounds', function (notificationSounds) {
                    return notificationSounds;
                }]
            }
        })

        .when('/review/mission', {
            controller: 'ReviewCtrl',
            templateUrl: 'js/game/controllers/review/review.tpl.html'
        })

        .otherwise({redirectTo: '/main'});

}).run(function ($rootScope, $location, user) {

    $rootScope.$on("$routeChangeStart", function () {
        !user.isAuthorized() && !user.restoreFromLocal() && $location.path('/login');
    });
});
