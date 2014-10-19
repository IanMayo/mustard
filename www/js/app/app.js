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
    'subtrack90.app.sound',
    'subtrack90.game.simulator',
    'subtrack90.game.review',
    'ui.bootstrap',
    'rzModule',
    'cfp.hotkeys'
])

/**
 * Constants
 *
 * IS_MOBILE determines if browser supports touch events also it indicates a mobile device
 * SPLASH_ON_LOGIN & SPLASH_ON_MAIN these are created for Ian's splash screen testing
 */
.constant('APP_DEBUG', true)
.constant('IS_CORDOVA', window.cordova)
.constant('IS_MOBILE', Modernizr.touch)
.constant('SPLASH_ON_LOGIN', true)
.constant('SPLASH_ON_MAIN', !!window.cordova)

/**
 * This is the default sound map load delay, we use it to prevent unexpected bugs in $cordovaNativeAudio service
 * and with initialization of mobile Native Audio library within angularjs
 */
.constant('SOUND_MAP_LOAD_DELAY', 1000)

.config(function ($routeProvider, APP_DEBUG, IS_MOBILE, SPLASH_ON_LOGIN ,SPLASH_ON_MAIN, $provide) {

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
                }]
            }
        })

        .when('/review/mission', {
            controller: 'ReviewCtrl',
            templateUrl: 'js/game/controllers/review/review.tpl.html'
        })

        .otherwise({redirectTo: '/main'});

        $provide.decorator('popoverPopupDirective', function ($delegate) {
            // replace designed template with html unsafe content
            $delegate[0].templateUrl = "view/popover-html-unsafe.html";

            return $delegate;
        });

        if (IS_MOBILE) {
            // The block was added to solve problem with touch events in Webkit browsers under iOS.
            // Safari doesn't send mousedown, mouseup, click events if mouseover, mouseenter or mousemove change page content
            // Android browser (Android platform) doesn't have such features.
            // see figure 6-5
            // https://developer.apple.com/library/IOS/documentation/AppleApplications/Reference/SafariWebContent/HandlingEvents/HandlingEvents.html

            $provide.decorator('popoverDirective', function ($delegate) {
                var directive = $delegate[0];
                // Grab the old compile function
                var compile = directive.compile;

                // Create a new compile function
                directive.compile = function () {
                    // get old link function
                    var link = compile.apply(this, arguments);
                    return function(scope, elem, attrs) {
                        // get the old functionality
                        link.apply(this, arguments);

                        (function webkitEventFix() {
                            var bodyEl = angular.element('body');
                            var elementWasClicked = false;
                            var catchClick = function () {
                                elementWasClicked = true;
                            };

                            var fireEvent = function () {
                                if (scope.tt_isOpen && !elementWasClicked) {
                                    elem.trigger('mouseleave');
                                }
                            };

                            elem.one('click', catchClick);

                            scope.$watch('tt_isOpen', function (isOpen) {
                                if (isOpen) {
                                    // Add event listener to the body tag so that popup can be closed when event invoked
                                    bodyEl.one('touchend', fireEvent);
                                }
                            })
                        })();
                    };
                };

                return $delegate;
            });
        }

}).run(function (SOUND_MAP_LOAD_DELAY, $rootScope, $location, $timeout, user, sound) {

    // We need to make sure that the DOM is created because run function itself is called a bit earlier
    angular.element(document).ready(function () {

        // Load all sounds of the app
        $timeout(function () {
            sound.loadSoundMap([
                {id: 'torpedo', path: 'audio/TorpedoLaunch.mp3'},
                {id: 'alarm', path: 'audio/Alarm.mp3'},
                {id: 'noise', path: 'audio/DarkNoise.mp3'},
                {id: '1sec', path: 'audio/1sec.mp3'},
                {id: 'robot-blip', path: 'audio/Robot_blip-Marianne_Gagnon.mp3'},
                {id: 'sad-thrombone', path: 'audio/Sad_Trombone-Joe_Lamb.mp3'},
                {id: 'ta-da', path: 'audio/Ta_Da-SoundBible.mp3'}
            ]);
        }, SOUND_MAP_LOAD_DELAY);
    });

    $rootScope.$on("$routeChangeStart", function () {
        !user.isAuthorized() && !user.restoreFromLocal() && $location.path('/login');
    });
});
