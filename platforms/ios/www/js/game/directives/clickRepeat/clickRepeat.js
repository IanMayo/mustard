/**
 * @module subtrack90.game.clickRepeat
 */

angular.module('subtrack90.game.clickRepeat', [])

.constant('clickConfig', {
    defaultDelay: 300,
    speedUpFactor: 1.03,
    minDelay: 150
})

/**
 * Click & Repeat directive
 *
 * @example <... click-repeat="handler()" [delay="1000" speedup="1.5"] >
 */
.directive('clickRepeat', ['$timeout', 'clickConfig', 'IS_MOBILE', function ($timeout, clickConfig, IS_MOBILE) {

    return {
        restrict: 'A',

        scope: {
            clickRepeat: '&',
            delay: '=',
            speedup: '='
        },

        link: function (scope, element) {

            /**
             * Action timer promise
             *
             * @type {promise}
             */
            var timer;

            /**
             * Default delay
             *
             * @type {Number} in ms
             */
            var defaultDelay = scope.delay || clickConfig.defaultDelay;

            /**
             * Acceleration rate
             *
             * @type {Number}
             */
            var speedup = scope.speedup || clickConfig.speedUpFactor;

            /**
             * Delay which is used in action timer
             *
             * @type {Number} in ms
             */
            var delay = defaultDelay;

            /**
             * Recursive action repeater
             */
            var repeat = function () {
                scope.clickRepeat();
                timer = $timeout(repeat, delay);

                // don't let the click-repeat get "crazy fast",
                // restrict it to 200ms
                if(delay > clickConfig.minDelay)
                {
                    delay /= speedup;
                }
            };

            /**
             * Reset action repeater and delay value of action timer
             */
            var cancelRepeating = function () {
                delay = defaultDelay;
                $timeout.cancel(timer);
            };

            element.bind(IS_MOBILE ? 'touchstart' : 'mousedown', repeat);
            element.bind(IS_MOBILE ? 'touchend touchleave touchcancel' : 'mouseup mouseleave', cancelRepeating);
        }
    };
}]);
