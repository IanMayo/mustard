/**
 * @module mustard.game.notificationIcon
 */

angular.module('mustard.game.notificationIcon', [])

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
