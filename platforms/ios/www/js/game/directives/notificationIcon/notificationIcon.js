/**
 * @module subtrack90.game.notificationIcon
 */

angular.module('subtrack90.game.notificationIcon', [])

/**
 * Notification icon directive
 */
.directive('notificationIcon', function () {

    return {
        restrict: 'EA',
        templateUrl: 'js/game/directives/notificationIcon/notificationIcon.tpl.html',
        replace: true,

        scope: {
            active: '=',
            flashing: '='
        }
    };
});
