/**
 * @module mustard.game.newMessageIndicator
 */

angular.module('mustard.game.newMessageIndicator', [])

/**
 * New message indicator directive
 * It takes the message collection and indicate if there are new messages
 */
.directive('newMessageIndicator', function () {

    return {
        restrict: 'EA',
        templateUrl: 'js/game/directives/newMessageIndicator/newMessageIndicator.tpl.html',

        scope: {
            messages: '='
        },

        link: function (scope) {

            /**
             * New message button active state
             *
             * @type {Boolean}
             */
            scope.isActive = false;

            /**
             * It watches on message collection length and activate the new message button if length is changed
             */
            scope.$watch('messages.length', function (newValue, oldValue) {
                scope.isActive = newValue > oldValue;
            });
        }
    };
});
