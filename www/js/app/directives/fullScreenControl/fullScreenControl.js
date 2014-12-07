/**
 * @module subtrack90.game.fullScreenControl
 */

angular.module('subtrack90.app.fullScreenControl', ['subtrack90.app.fullScreen'])

/**
 * Full screen control directive
 */

.directive('fullScreenControl', function (IS_MOBILE, IS_CORDOVA, fullScreen) {

    return {
        restrict: 'A',
        replace: true,
        templateUrl: 'js/app/directives/fullScreenControl/fullScreenControl.tpl.html',

        scope: {
            compact: '='
        },

        link: function (scope) {
            scope.hasShown = !IS_MOBILE && !IS_CORDOVA;

            scope.toggleFullScreenMode = function () {
                fullScreen.toggle();
            };
        }
    };
});
