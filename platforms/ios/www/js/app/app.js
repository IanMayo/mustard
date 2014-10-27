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
    'subtrack90.app.soundManager',
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
 * Background sound on different pages
 */
.constant('BG_SOUND_ON_META_PAGES', true)
.constant('BG_SOUND_ON_GAME_PAGES', false)

.config(function (APP_DEBUG, IS_MOBILE, SPLASH_ON_LOGIN ,SPLASH_ON_MAIN, BG_SOUND_ON_META_PAGES, BG_SOUND_ON_GAME_PAGES,
    $routeProvider, $provide) {

    if (APP_DEBUG) {
        $routeProvider.when('/debug', {
            controller: 'DebugCtrl',
            templateUrl: 'js/app/controllers/debug/debug.tpl.html',
            resolve: {
                bgSound: ['soundManager', function (soundManager) {
                    return soundManager.resolver(BG_SOUND_ON_META_PAGES);
                }]
            }
        })
    }

    $routeProvider
        .when('/login', {
            controller: 'LoginCtrl',
            templateUrl: 'js/app/controllers/login/login.tpl.html',
            resolve: {
                splash: ['splashScreen', function (splashScreen) {
                    return splashScreen.resolver(SPLASH_ON_LOGIN);
                }],
                bgSound: ['soundManager', function (soundManager) {
                    return soundManager.resolver(BG_SOUND_ON_META_PAGES);
                }]
            }
        })

        .when('/register', {
            controller: 'RegistrationCtrl',
            templateUrl: 'js/app/controllers/registration/registration.tpl.html',
            resolve: {
                bgSound: ['soundManager', function (soundManager) {
                    return soundManager.resolver(BG_SOUND_ON_META_PAGES);
                }]
            }
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
                }],
                bgSound: ['soundManager', function (soundManager) {
                    return soundManager.resolver(BG_SOUND_ON_META_PAGES);
                }]
            }
        })

        .when('/mission/:id', {
            controller: 'MissionCtrl',
            templateUrl: 'js/app/controllers/mission/mission.tpl.html',
            resolve: {
                mission: ['$route', 'missionsIndex', function ($route, missionsIndex) {
                    return missionsIndex.getMission($route.current.params.id);
                }],
                bgSound: ['soundManager', function (soundManager) {
                    return soundManager.resolver(BG_SOUND_ON_META_PAGES);
                }]
            }
        })

        .when('/profile', {
            controller: 'ProfileCtrl',
            templateUrl: 'js/app/controllers/userProfile/userProfile.tpl.html',
            resolve: {
                bgSound: ['soundManager', function (soundManager) {
                    return soundManager.resolver(BG_SOUND_ON_META_PAGES);
                }]
            }
        })

        .when('/options', {
            controller: 'OptionsCtrl',
            templateUrl: 'js/app/controllers/options/options.tpl.html',
            resolve: {
                bgSound: ['soundManager', function (soundManager) {
                    return soundManager.resolver(BG_SOUND_ON_META_PAGES);
                }]
            }
        })

        .when('/credits', {
            controller: 'CreditsCtrl',
            templateUrl: 'js/app/controllers/credits/credits.tpl.html',
            resolve: {
                bgSound: ['soundManager', function (soundManager) {
                    return soundManager.resolver(BG_SOUND_ON_META_PAGES);
                }]
            }
        })

        .when('/final', {
            controller: 'FinalCtrl',
            templateUrl: 'js/app/controllers/final/final.tpl.html',
            resolve: {
                bgSound: ['soundManager', function (soundManager) {
                    return soundManager.resolver(BG_SOUND_ON_META_PAGES);
                }]
            }
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
                bgSound: ['soundManager', function (soundManager) {
                    return soundManager.resolver(BG_SOUND_ON_GAME_PAGES);
                }]
            }
        })

        .when('/review/mission', {
            controller: 'ReviewCtrl',
            templateUrl: 'js/game/controllers/review/review.tpl.html',
            resolve: {
                bgSound: ['soundManager', function (soundManager) {
                    return soundManager.resolver(BG_SOUND_ON_GAME_PAGES);
                }]
            }
        })

        .otherwise({redirectTo: '/main'});

        // TODO: If it's possible please move it to the separate module or something...
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

}).run(function ($rootScope, $location, user, soundManager) {

    // We need to make sure that the DOM is already created because run function is called before
    angular.element(document).ready(function () {
        soundManager.loadAppSounds();
    });

    $rootScope.$on("$routeChangeStart", function () {
        !user.isAuthorized() && !user.restoreFromLocal() && $location.path('/login');
    });
});
